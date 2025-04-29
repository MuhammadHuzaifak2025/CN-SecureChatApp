from django.contrib import admin
from securechatapp.models import CustomUser, ChatRoom, ChatRoomMembership, Message, EncryptionKey, TypingIndicator



admin.site.register(ChatRoom)
admin.site.register(CustomUser)
admin.site.register(ChatRoomMembership)
admin.site.register(Message)
admin.site.register(EncryptionKey)
admin.site.register(TypingIndicator)

# Register your models here.
