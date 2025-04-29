from rest_framework import serializers
from securechatapp.models import CustomUser, ChatRoomMembership, ChatRoom, Message, TypingIndicator, EncryptionKey


import json


class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'fullname', 'is_online', 'last_seen']
        read_only_fields = ['is_online', 'last_seen']

    def create(self, validated_data):
        user = CustomUser.objects.create_user(**validated_data)
        return user

class ChatRoomMembershipSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatRoomMembership
        fields = ['user', 'chat_room', 'joined_at']
        read_only_fields = ['joined_at']
    

class ChatRoomSerializer(serializers.ModelSerializer):
    members = ChatRoomMembershipSerializer(source='memberships', many=True, read_only=True)

    class Meta:
        model = ChatRoom
        fields = ['id', 'name', 'is_group', 'created_at', 'members']
        read_only_fields = ['created_at']


class MessageSerializer(serializers.ModelSerializer):
    sender = CustomUserSerializer(read_only=True)
    chat_room = ChatRoomSerializer(read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'sender', 'chat_room', 'content', 'timestamp', 'is_read', 'is_delivered']
        read_only_fields = ['timestamp', 'is_read', 'is_delivered']


    def create(self, validated_data):
        message = Message.objects.create(**validated_data)
        return message

class TypingIndicatorSerializer(serializers.ModelSerializer):
    user = CustomUserSerializer(read_only=True)
    chat_room = ChatRoomSerializer(read_only=True)

    class Meta:
        model = TypingIndicator
        fields = ['id', 'user', 'chat_room', 'is_typing', 'last_updated']
        read_only_fields = ['last_updated']

class EncryptionKeySerializer(serializers.ModelSerializer):
    user = CustomUserSerializer(read_only=True)

    class Meta:
        model = EncryptionKey
        fields = ['id', 'user', 'public_key']
        read_only_fields = ['user']

    def create(self, validated_data):
        return EncryptionKey.objects.create(**validated_data)