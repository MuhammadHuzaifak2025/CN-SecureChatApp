import json
import urllib.parse
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils import timezone
from securechatapp.models import Message, CustomUser, ChatRoomMembership
from securechatapp.serializer import MessageSerializer
from asgiref.sync import sync_to_async

class ChatConsumer(AsyncWebsocketConsumer):
    @sync_to_async
    def serialize_message(self, message):
        if not message:
            return None
        try:
            serializer = MessageSerializer(message)
            serialized_data = serializer.data
            return {
                'id': serialized_data['id'],
                'sender': serialized_data['sender']['username'],
                'content': serialized_data['content'],
                'timestamp': serialized_data['timestamp'],
                'is_read': serialized_data['is_read'],
                'is_delivered': serialized_data['is_delivered'],
                'chat_room': serialized_data['chat_room']['id'],
            }
        except Exception as e:
            print(f"Error serializing message: {e}")
            return None

    @database_sync_to_async
    def mark_message_as_delivered(self, message_id):
        if not message_id:
            return None
        try:
            message = Message.objects.get(id=message_id)
            message.is_delivered = True
            message.save(update_fields=['is_delivered'])
            print(f"Message {message_id} marked as delivered.")
            return message
        except Message.DoesNotExist:
            print(f"Message with ID {message_id} does not exist.")
        except Exception as e:
            print(f"Error marking message as delivered: {e}")
        return None
    
    @database_sync_to_async
    def mark_message_as_read(self, message_id):
        if not message_id:
            return None
        try:
            message = Message.objects.get(id=message_id)
            message.is_read = True
            message.save(update_fields=['is_read'])
            print(f"Message {message_id} marked as read.")
            return message
        except Message.DoesNotExist:
            print(f"Message with ID {message_id} does not exist.")
        except Exception as e:
            print(f"Error marking message as read: {e}")
        return None
            
    @database_sync_to_async
    def fetch_chat_history(self, room_id):
        try:
            messages = Message.objects.filter(chat_room_id=room_id).order_by('timestamp')
            message_list = [
                {
                    'id': message.id,
                    'sender': message.sender.username,
                    'content': message.content,
                    'timestamp': message.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
                    'is_read': message.is_read,
                    'is_delivered': message.is_delivered,
                    'chat_room': message.chat_room.id,
                }
                for message in messages
            ]
            return message_list  # Already in chronological order
        except Exception as e:
            print(f"Error fetching chat history: {e}")
            return []

    @database_sync_to_async
    def create_message(self, message_data):
        try:
            # Handle different types of message inputs
            if isinstance(message_data, dict):
                raw_message = message_data.get("message", "")
                message_type = message_data.get("type", "")
                # Avoid saving system messages
                if message_type in ["online-acknowledge", "offline-acknowledge", "writing-indicator"]:
                    return None
            else:
                raw_message = message_data

            # Safely decode the message
            try:
                decoded_message = urllib.parse.unquote(raw_message)
            except Exception:
                decoded_message = raw_message  # Use as-is if decoding fails
                
            print(f"Creating message: {decoded_message[:50]}...")

            new_message = Message.objects.create(
                sender=self.scope['user'],
                chat_room_id=self.room_id,
                content=decoded_message,
                timestamp=timezone.now(),
                is_read=False,
                is_delivered=False
            )
            return new_message
        except Exception as e:
            print(f"Error creating message: {e}")
            return None

    @database_sync_to_async
    def get_room_name(self, username):
        try:
            # Find the target user
            user = CustomUser.objects.get(username=username)
            
            # Get room IDs for both users
            room_ids_target = set(
                ChatRoomMembership.objects.filter(user_id=user).values_list('chat_room_id', flat=True)
            )
            room_ids_current = set(
                ChatRoomMembership.objects.filter(user_id=self.scope['user']).values_list('chat_room_id', flat=True)
            )

            # Find common room(s)
            common_rooms = room_ids_target & room_ids_current
            
            # Get the first common room
            self.room_id = next(iter(common_rooms), None)
            return str(self.room_id) if self.room_id else None

        except CustomUser.DoesNotExist:
            print(f"User with username {username} does not exist.")
            return None
        except Exception as e:
            print(f"Error getting room name: {e}")
            return None

    async def connect(self):
        # Get the username from the URL route
        chat_with = self.scope['url_route']['kwargs']['chatwithusername']
        
        # Check if user is authenticated
        if self.scope['user'].is_anonymous:
            print("Unauthenticated user attempted to connect.")
            await self.close(code=401)
            return

        # Get room name based on the users involved
        self.room_name = await self.get_room_name(chat_with)
        if not self.room_name:
            print(f"No common room found for users: {self.scope['user'].username} and {chat_with}")
            await self.close(code=400)
            return

        # Set up the room group name for channel layer
        self.room_group_name = f'chat_{self.room_name}'
        print(f"Connecting to room group: {self.room_group_name}")

        # Verify channel layer is configured
        if self.channel_layer is None:
            print("Error: channel_layer is not configured.")
            await self.close(code=500)
            return

        # Join the room group
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()
        
        # Fetch and send chat history
        chat_history = await self.fetch_chat_history(self.room_id)

        # Announce user presence
        online_message = {
            "type": "online-acknowledge",
            "message": f"User {self.scope['user'].username} has joined the chat.",
            "sender": self.scope['user'].username,
        }
        
        await self.channel_layer.group_send(self.room_group_name, {
            'type': 'online_acknowledge',
            'message': online_message["message"],
            'sender': online_message["sender"],
        })
        
        # Send chat history to the client
        await self.send(text_data=json.dumps({
            "type": "chat_history",
            "messages": chat_history,
        }))

    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name') and self.channel_layer:
            # Notify others that user has left
            offline_message = {
                "type": "offline-acknowledge",
                "message": f"User {self.scope['user'].username} has left the chat.",
                "sender": self.scope['user'].username,
            }
            
            await self.channel_layer.group_send(self.room_group_name, {
                'type': 'offline_acknowledge',
                'message': offline_message["message"],
                'sender': offline_message["sender"],
            })

            print(f"Disconnecting from room group: {self.room_group_name}")
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message_type = data.get('type', 'chat_message')
            message = data.get('message')
            message_id = data.get('message_id')
            
            if message_type == 'chat_message':
                # Regular message handling
                await self.handle_chat_message(message)
            elif message_type == 'mark_delivered':
                # Handle delivery receipt
                await self.handle_delivery_receipt(message_id)
            elif message_type == 'mark_read':
                # Handle read receipt
                await self.handle_read_receipt(message_id)
            elif message_type == 'writing_indicator':
                # Handle typing indicator
                await self.handle_writing_indicator()
            else:
                print(f"Unknown message type: {message_type}")
        except json.JSONDecodeError:
            print("Invalid JSON received")
        except Exception as e:
            print(f"Error in receive: {e}")

    async def handle_chat_message(self, message):
    # Create and save the message in DB first
        created_message = await self.create_message(message)
        serialized_message = await self.serialize_message(created_message)

        if created_message:
            # Broadcast to all users (including sender)
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': serialized_message,
                    'sender_channel_name': self.channel_name,
                    'sender_username': self.scope['user'].username,
                    'message_id': created_message.id,
                }
            )
    async def handle_delivery_receipt(self, message_id):
        # Mark message as delivered and notify the room
        message = await self.mark_message_as_delivered(message_id)
        if message:
            serialized_message = await self.serialize_message(message)
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'delivery_receipt',
                    'message_id': message_id,
                    'sender': self.scope['user'].username,
                    'serialized_message': serialized_message,
                }
            )

    async def handle_read_receipt(self, message_id):
        # Mark message as read and notify the room
        message = await self.mark_message_as_read(message_id)
        if message:
            serialized_message = await self.serialize_message(message)
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'read_receipt',
                    'message_id': message_id,
                    'sender': self.scope['user'].username,
                    'serialized_message': serialized_message,
                }
            )

    async def handle_writing_indicator(self):
        # Notify the room that user is typing
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'writing_indicator',
                'message': f"{self.scope['user'].username} is typing...",
                'sender': self.scope['user'].username,
            }
        )

        # Skip sending back to the sender
    async def chat_message(self, event):
        if self.channel_name == event.get('sender_channel_name'):
            return  # Skip for the sender

        # Mark as delivered in DB
        updated_message = await self.mark_message_as_delivered(event['message_id'])

        # Send delivery receipt back to sender's channel
        if updated_message:
            #'type': 'delivery-receipt',
            # 'message_id': event.get('message_id'),
            # 'sender': event['sender'],
            # 'serialized_message': event.get('serialized_message'),
            await self.channel_layer.send(
                event.get('sender_channel_name'),
                {
                    'type': 'delivery.receipt',
                    'message_id': event['message_id'],
                    'sender': event['sender_username'],
                    'serialized_message':event['message'],
                    'message': event['message'],
                }
            )

        # Send chat message to receiver
        await self.send(text_data=json.dumps({
            "type": "chat_message",
            "message": event["message"],
        }))
        
    async def online_acknowledge(self, event):
        await self.send(text_data=json.dumps({
            'type': 'online-acknowledge',
            'message': event['message'],
            'sender': event['sender'],
        }))

    async def offline_acknowledge(self, event):
        await self.send(text_data=json.dumps({
            'type': 'offline-acknowledge',
            'message': event['message'],
            'sender': event['sender'],
        }))

    async def writing_indicator(self, event):
        await self.send(text_data=json.dumps({
            'type': 'writing-indicator',
            'message': event['message'],
            'sender': event['sender'],
        }))

    async def read_receipt(self, event):
        await self.send(text_data=json.dumps({
            'type': 'read-receipt',
            'message_id': event.get('message_id'),
            'sender': event['sender'],
            'serialized_message': event.get('serialized_message'),
        }))

    async def delivery_receipt(self, event):
        await self.send(text_data=json.dumps({
            'type': 'delivery-receipt',
            'message_id': event.get('message_id'),
            'sender': event['sender'],
            'serialized_message': event.get('serialized_message'),
        }))