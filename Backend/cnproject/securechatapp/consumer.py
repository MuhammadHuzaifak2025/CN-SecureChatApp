import json
import urllib.parse
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils import timezone
from securechatapp.models import Message, CustomUser, ChatRoomMembership


class ChatConsumer(AsyncWebsocketConsumer):
    
    def marked_message_as_delivered(self, message_id):
        try:
            message = Message.objects.get(id=message_id)
            message.is_delivered = True
            message.save()
            print(f"Message {message_id} marked as delivered.")
        except Message.DoesNotExist:
            print(f"Message with ID {message_id} does not exist.")
        except Exception as e:
            print(f"Error marking message as delivered: {e}")
    
    def marked_message_as_read(self, message_id):
        try:
            message = Message.objects.get(id=message_id)
            message.is_read = True
            message.save()
            print(f"Message {message_id} marked as read.")
        except Message.DoesNotExist:
            print(f"Message with ID {message_id} does not exist.")
        except Exception as e:
            print(f"Error marking message as read: {e}")
    @database_sync_to_async
    def fetch_chat_history(self, room_id):
        try:
            messages = Message.objects.filter(chat_room_id=room_id).order_by('-timestamp')
            message_list = [
                {
                    'sender': message.sender.username,
                    'content': message.content,
                    'timestamp': message.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
                }
                for message in messages
            ]
            return message_list[::-1]  # Return in chronological order
        except Exception as e:
            print(f"Error fetching chat history: {e}")
            return []
    @database_sync_to_async
    def create_message(self, message):
        try:
            if isinstance(message, dict):
                raw_message = message.get("message", "")
                message_type = message.get("type", "")
                # Avoid saving system messages
                if message_type in ["online-acknowledge", "offline-acknowledge"]:
                    return None
            else:
                raw_message = message

            decoded_message = urllib.parse.unquote(raw_message)
            print(f"Decoded message: {decoded_message}")

            new_message = Message.objects.create(
                sender=self.scope['user'],
                chat_room_id=self.room_id,
                content=decoded_message,
                timestamp=timezone.now(),
                is_read=False,
                is_delivered=False
            )
            print(f"Message created: {new_message.content}")
            return new_message
        except Exception as e:
            print(f"Error creating message: {e}")
            return None

    @database_sync_to_async
    def get_room_name(self, username):
        try:
            print("Current user:", self.scope['user'])

            user = CustomUser.objects.get(username=username)
            print(f"User found: {user.username}")

            room_ids_target = set(
                ChatRoomMembership.objects.filter(user_id=user).values_list('chat_room_id', flat=True)
            )
            room_ids_current = set(
                ChatRoomMembership.objects.filter(user_id=self.scope['user']).values_list('chat_room_id', flat=True)
            )

            common_rooms = room_ids_target & room_ids_current
            print(f"Common room IDs: {common_rooms}")

            self.room_id = next(iter(common_rooms), None)
            return str(self.room_id) if self.room_id else None

        except CustomUser.DoesNotExist:
            print(f"User with username {username} does not exist.")
            return None

    async def connect(self):
        chat_with = self.scope['url_route']['kwargs']['chatwithusername']
        if self.scope['user'].is_anonymous:
            print("Unauthenticated user attempted to connect.")
            await self.close(code=401)
            return

        self.room_name = await self.get_room_name(chat_with)
        if not self.room_name:
            print("No room found for user.")
            await self.close(code=400)
            return

        self.room_group_name = f'chat_{self.room_name}'
        print(f"Connecting to room group: {self.room_group_name}")

        if self.channel_layer is None:
            print("Error: channel_layer is not configured.")
            await self.close(code=500)
            return

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()
        chat_history = await self.fetch_chat_history(self.room_id)


        message = {
            "type": "online-acknowledge",
            "message": f"User {self.scope['user'].username} has joined the chat.",
            "sender": self.scope['user'].username,
        }
        await self.channel_layer.group_send(self.room_group_name, {
            'type': 'online_acknowledge',
            'message': message["message"],
            'sender': message["sender"],
        })
        if message:
            response = {
                "type": "chat_history",
                "messages": chat_history,
            }
            await self.send(text_data=json.dumps(response))
    async def disconnect(self, close_code):
        if self.channel_layer and hasattr(self, 'room_group_name'):
            message = {
                "type": "offline-acknowledge",
                "message": f"User {self.scope['user'].username} has left the chat.",
                "sender": self.scope['user'].username,
            }
            await self.channel_layer.group_send(self.room_group_name, {
                'type': 'offline_acknowledge',
                'message': message["message"],
                'sender': message["sender"],
            })

            print(f"Disconnecting from room group: {self.room_group_name}")
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data.get('message')

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message,
                'sender_channel_name': self.channel_name,
            }
        )

    async def chat_message(self, event):
        if self.channel_name == event.get('sender_channel_name'):
         return  # Skip sending back to the sender
        print("Sending message to WebSocket:", event['message'])

        created_message = await self.create_message(event['message'])

        if created_message:
            response = {
                "type": "chat_message",
                "message": created_message
                
            }
        else:
            response = {
                "type": "error",
                "message": "Error creating message.",
            }

        await self.send(text_data=json.dumps(response))

    async def online_acknowledge(self, event):
        response = {
            'type': 'online-acknowledge',
            'message': event['message'],
            'sender': event['sender'],
        }
        await self.send(text_data=json.dumps(response))

    async def offline_acknowledge(self, event):
        response = {
            'type': 'offline-acknowledge',
            'message': event['message'],
            'sender': event['sender'],
        }
        await self.send(text_data=json.dumps(response))

    async def writing_indicator(self, event):
        response = {
            'type': 'writing-indicator',
            'message': event['message'],
            'sender': event['sender'],
        }
        await self.send(text_data=json.dumps(response))

    async def read_receipt(self, event):
        response = {
            'type': 'read-receipt',
            'message': event['message'],
            'sender': event['sender'],
        }
        await self.send(text_data=json.dumps(response))

    async def delivery_receipt(self, event):
        response = {
            'type': 'delivery-receipt',
            'message': event['message'],
            'sender': event['sender'],
        }
        await self.send(text_data=json.dumps(response))
