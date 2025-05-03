import json
import urllib.parse
import base64
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils import timezone
from securechatapp.models import Message, CustomUser, ChatRoomMembership, EncryptionKey
from securechatapp.serializer import MessageSerializer
from asgiref.sync import sync_to_async
from Cryptodome.Cipher import PKCS1_OAEP, AES
from Cryptodome.PublicKey import RSA
from Cryptodome.Random import get_random_bytes
from Cryptodome.Util.Padding import pad, unpad
from asgiref.sync import SyncToAsync 
from asgiref.sync import sync_to_async

class EncryptionManager:
    """
    Handles encryption and decryption of messages.
    Uses RSA for key exchange and AES for message encryption.
    """
    @staticmethod
    def generate_key_pair():
        """Generate a new RSA key pair"""
        private_key = RSA.generate(2048)
        public_key = private_key.publickey()
        
        # Convert to string format
        private_key_str = private_key.export_key().decode('utf-8')
        public_key_str = public_key.export_key().decode('utf-8')
        
        return private_key_str, public_key_str

    def get_or_create_user_key(user):
        try:
            # print("User key found in database.", user)
            CustomUser.objects.get(username=user.username)
            key_obj = EncryptionKey.objects.filter(user=user).values('private_key', 'public_key').first()
            # print("ljhjadh", key_obj)
            if key_obj is None:
                raise EncryptionKey.DoesNotExist("No key found for user.")
            private_key =key_obj['private_key']
            public_key = key_obj['public_key']
        except EncryptionKey.DoesNotExist:
            private_key_str, public_key_str = EncryptionManager.generate_key_pair()
            EncryptionKey.objects.create(
                user=user,
                private_key=private_key_str,
                public_key=public_key_str
            )
            private_key = RSA.import_key(private_key_str)
            public_key = RSA.import_key(public_key_str)
        
        return private_key, public_key
    
    
    @staticmethod
    def encrypt_message(message, recipient_public_key_str):
        """
        Encrypt a message using hybrid encryption (RSA + AES)
        - Generate a random AES key
        - Encrypt the message with AES
        - Encrypt the AES key with recipient's public RSA key
        - Return both encrypted key and encrypted message
        """
        # Convert message to bytes if it's a string
        # print(f"Recipient's public key: {recipient_public_key_str}")
        if isinstance(message, str):
            message = message.encode('utf-8')
        else:
            raise ValueError("Message must be a string")
            
        # Import recipient's public key
        recipient_public_key = RSA.import_key(recipient_public_key_str)
        # Generate a random AES session key
        aes_key = get_random_bytes(16)  # 128 bits
        
        # Encrypt the message with AES
        cipher_aes = AES.new(aes_key, AES.MODE_CBC)
        padded_message = pad(message, AES.block_size)
        encrypted_message = cipher_aes.encrypt(padded_message)
        
        # Encrypt the AES key with recipient's public key
        cipher_rsa = PKCS1_OAEP.new(recipient_public_key)
        encrypted_aes_key = cipher_rsa.encrypt(aes_key)
        
        # Encode everything to base64 for safe transport
        encrypted_data = {
            'key': base64.b64encode(encrypted_aes_key).decode('utf-8'),
            'iv': base64.b64encode(cipher_aes.iv).decode('utf-8'),
            'message': base64.b64encode(encrypted_message).decode('utf-8')
        }
        data = json.dumps(encrypted_data)
        # print(data)
        return data
    
    @staticmethod
    def decrypt_message(encrypted_data_str, private_key_str):
        try:
            if isinstance(encrypted_data_str, str):
                encrypted_data = json.loads(encrypted_data_str)
            elif isinstance(encrypted_data_str, dict) and 'content' in encrypted_data_str:
                encrypted_data = json.loads(encrypted_data_str['content'])
            else:
                raise ValueError("Invalid encrypted message format")
           
            encrypted_aes_key = base64.b64decode(encrypted_data['key'])
            iv = base64.b64decode(encrypted_data['iv'])
            encrypted_message = base64.b64decode(encrypted_data['message'])
            private_key = RSA.import_key(private_key_str)
            cipher_rsa = PKCS1_OAEP.new(private_key)
            aes_key = cipher_rsa.decrypt(encrypted_aes_key)

            cipher_aes = AES.new(aes_key, AES.MODE_CBC, iv)
            padded_message = cipher_aes.decrypt(encrypted_message)
            message = unpad(padded_message, AES.block_size)

            return {"content": message.decode('utf-8')}
        except Exception as e:
            print(f"Error decrypting message: {e}")
            # return {"content": "[Decryption failed]"}


class ChatConsumer(AsyncWebsocketConsumer):
    @database_sync_to_async
    def get_private_key(self):
        """
        Get the private key from session or secure storage.
        In a real application, you would store this in a secure way.
        """
        # This is a simplified example - in production, use a secure storage method
        # such as secure browser storage or a secure session instead of this attribute
        if not hasattr(self, 'private_key'):
            # For this example, we'll generate a new key pair if it doesn't exist
            # In a real app, you would retrieve the private key from secure storage
            user = self.scope['user']

            private_key, public_key = EncryptionManager.get_or_create_user_key(user)
            
            # Save the user's public key to the database
            # EncryptionKey.objects.update_or_create(
            #     user=user,
            #     defaults={'public_key': public_key}
            # )
            
            
            self.private_key = private_key
            self.public_key = public_key
        
        return self.private_key
    @database_sync_to_async
    def get_recipient_public_key(self, username):
        try:
            if hasattr(self, 'reci_public_key'):
                return self.reci_public_key
            recipient = CustomUser.objects.filter(username=username).values('id').first()
            if recipient is None:
                return None
            key = EncryptionKey.objects.filter(user_id=recipient['id']).first()
            # print(f"Recipient's public key: {key}")
            if key:
                self.reci_public_key = key.public_key
                return self.reci_public_key
            else:
                # print(f"No encryption key found for user: {username}")
                return None
        except Exception as e:
            print(f"Could not find public key for {username}: {e}")
            return None

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
            # print(f"Message {message_id} marked as delivered.")
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
            # print(f"Message {message_id} marked as read.")
            return message
        except Message.DoesNotExist:
            print(f"Message with ID {message_id} does not exist.")
        except Exception as e:
            print(f"Error marking message as read: {e}")
        return None
            
    

    async def fetch_chat_history(self, room_id):
        current_user_id = self.scope["user"].id  # Assuming authenticated user
        print("Current user ID:", current_user_id)

        @sync_to_async
        def get_messages():
            return list(Message.objects.filter(chat_room_id=room_id).values(
                'id', 'sender', 'chat_room_id', 'content', 'timestamp',
                'is_read', 'is_delivered'
            ))
        @sync_to_async
        def private_key_recipents():
            recipents_private_key, public_key =  EncryptionManager.get_or_create_user_key( CustomUser.objects.filter(username=self.scope['url_route']['kwargs']['chatwithusername']).first())
            return recipents_private_key, public_key

        messages = await get_messages()
        private_key = await self.get_private_key()
        recipents_private_key, public_key = await private_key_recipents()

        message_list = []
        for message in messages:
            try:
                # Only decrypt if the current user is the intended recipient
                if message['sender'] != current_user_id:
                    print(message['sender'], current_user_id)
                    # message['content'] = "[Encrypted message sent by you]"
                    decrypted =  EncryptionManager.decrypt_message(message, private_key)
                    print("Decrypted message:", decrypted)
                    if isinstance(decrypted, dict) and 'content' in decrypted:
                        message['content'] = decrypted['content']
                    else:
                        message['content'] = decrypted.content
                else:
                    # Optional: skip decryption or store as-is
                    temp_message = EncryptionManager.decrypt_message(message, recipents_private_key)
                    if isinstance(temp_message, dict) and 'content' in temp_message:
                        message['content'] = temp_message['content']
                    else:
                        message['content'] = EncryptionManager.decrypt_message(message, recipents_private_key)
                message['timestamp'] = message['timestamp'].strftime("%Y-%m-%d %H:%M:%S")
                if(message['sender'] == current_user_id):
                    message['sender'] = self.scope['user'].username
                else:
                    message['sender'] = self.scope['url_route']['kwargs']['chatwithusername']
                message_list.append(message)
            except Exception as e:
                print(f"Decryption error for message {message['id']}: {e}")
                continue  # Skip this message if decryption fails

        # print(f"Private key: {private_key}")
        return message_list


    async def create_message(self, message_data):
        try:
            if isinstance(message_data, dict):
                raw_message = message_data.get("message", "")
                message_type = message_data.get("type", "")
                if message_type in ["online-acknowledge", "offline-acknowledge", "writing-indicator"]:
                    return None
            else:
                raw_message = message_data

            try:
                decoded_message = urllib.parse.unquote(raw_message)
            except Exception:
                decoded_message = raw_message

            # print(f"Creating message: {decoded_message[:50]}...")
            recipient_username = self.scope['url_route']['kwargs']['chatwithusername']
            print("recipent is", recipient_username)
            recipient_public_key = await self.get_recipient_public_key(recipient_username)

            if not recipient_public_key:
                return None
            print("encrpyting message", decoded_message)
            encrypted_message = EncryptionManager.encrypt_message(
                decoded_message, recipient_public_key
            )

            new_message = await database_sync_to_async(Message.objects.create)(
                sender=self.scope['user'],
                chat_room_id=self.room_id,
                content=encrypted_message,
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
            # print("Unauthenticated user attempted to connect.")
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
        # print(f"Connecting to room group: {self.room_group_name}")

        # Verify channel layer is configured
        if self.channel_layer is None:
            print("Error: channel_layer is not configured.")
            await self.close(code=500)
            return

        # Join the room group
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()
        await self.get_private_key()
        # Fetch and send chat history
        chat_history = await self.fetch_chat_history(self.room_id)
        

        # Announce user presence
        online_message = {
            "type": "online-acknowledge",
            "message": f"User {self.scope['user'].username} has joined the chat.",
            "sender": self.scope['user'].username,
            'sender_channel_name': self.channel_name,
        }
        
        await self.channel_layer.group_send(self.room_group_name, {
            'type': 'online_acknowledge',
            'message': online_message["message"],
            'sender': online_message["sender"],
            'sender_channel_name': online_message["sender_channel_name"],
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
            elif message_type == 'read_receipt':
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
        private_key = await self.get_private_key()
        print(self.scope['user'].username, )
        # print("Testing Code",event['message'], private_key)
        decrypted_content = EncryptionManager.decrypt_message(event['message'], private_key)
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
                    'serialized_message': decrypted_content,
                    'message': decrypted_content,
                }
            )
        # print("event", event['message'])
        # Send chat message to receiver
        message = {
            'id': event['message_id'],
            'sender': event['sender_username'],
            'content': decrypted_content['content'] if isinstance(decrypted_content, dict) and 'content' in decrypted_content else decrypted_content,
            'timestamp': event['message'].get('timestamp', timezone.now().strftime("%Y-%m-%d %H:%M:%S")),
            'is_read': event['message'].get('is_read', False),
            'is_delivered': event['message'].get('is_delivered', False),
            'chat_room': event['message'].get('chat_room', None),
        }
        await self.send(text_data=json.dumps({
            "type": "chat_message",
            "message": message,
            
        }))
        
    async def online_acknowledge(self, event):
        if self.channel_name == event.get('sender_channel_name'):
            return
        await self.send(text_data=json.dumps({
            'type': 'online-acknowledge',
            'message': event['message'],
            'sender': event['sender'],
        }))

        await self.channel_layer.send(
            event.get('sender_channel_name'),
            {
                'type': 'reply_online_acknowledge',
                'message': event['message'],
                'sender': event['sender'],
            }
        )
    async def reply_online_acknowledge(self, event):
        if self.channel_name == event.get('sender_channel_name'):
            return
        await self.send(text_data=json.dumps({
            'type': 'reply-online-acknowledge',
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