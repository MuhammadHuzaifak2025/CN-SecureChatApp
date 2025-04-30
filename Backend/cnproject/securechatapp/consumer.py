import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from securechatapp.models import Message, CustomUser, ChatRoomMembership


class ChatConsumer(AsyncWebsocketConsumer):

    @database_sync_to_async
    def get_room_name(self, username):
        try:
            user = CustomUser.objects.get(username=username)
            room_ids = ChatRoomMembership.objects.filter(user_id=user).values_list('chat_room_id', flat=True)
            return str(room_ids.first()) if room_ids.exists() else None
        except CustomUser.DoesNotExist:
            return None

    async def connect(self):
        if self.scope['user'].is_anonymous:
            print("Unauthenticated user attempted to connect.")
            await self.close(code=401)
            return

        self.room_name = await self.get_room_name(self.scope['user'].username)
        if not self.room_name:
            print("No room found for user.")
            await self.close(code=400)
            return

        self.room_group_name = f'chat_{self.room_name}'
        print(f"Connecting to room group: {self.room_group_name}")

        # Ensure channel_layer is available
        if self.channel_layer is None:
            print("Error: channel_layer is not configured.")
            await self.close(code=500)
            return

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        if self.channel_layer and hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data.get('message')

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message
            }
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'message': event['message']
        }))
