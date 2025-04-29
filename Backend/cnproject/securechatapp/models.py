from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager, Group, Permission
from django.db import models

class CustomUser(AbstractBaseUser, PermissionsMixin):
    id = models.AutoField(primary_key=True)
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=100, unique=True)
    fullname = models.CharField(max_length=300, unique=False, default='')
    is_online = models.BooleanField(default=False)
    last_seen = models.DateTimeField(null=True, blank=True)

    groups = models.ManyToManyField(
        Group,
        related_name='customuser_set',  
        blank=True
    )
    user_permissions = models.ManyToManyField(
        Permission,
        related_name='customuser_permissions_set',  
        blank=True
    )

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

class ChatRoom(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255, blank=True, null=True)
    is_group = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

class ChatRoomMembership(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    chat_room = models.ForeignKey(ChatRoom, related_name='memberships', on_delete=models.CASCADE)
    joined_at = models.DateTimeField(auto_now_add=True)


class Message(models.Model):
    id = models.AutoField(primary_key=True)
    sender = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    chat_room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE)
    content = models.TextField()  # Encrypted text
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    is_delivered = models.BooleanField(default=False)


class TypingIndicator(models.Model):
    id = models.AutoField(primary_key=True)
    chat_room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    is_typing = models.BooleanField(default=False)
    last_updated = models.DateTimeField(auto_now=True)


class EncryptionKey(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    public_key = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
