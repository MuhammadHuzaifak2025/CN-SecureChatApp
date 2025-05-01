from rest_framework import serializers
from securechatapp.models import CustomUser, ChatRoomMembership, ChatRoom, Message, TypingIndicator, EncryptionKey
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate



class CustomUserSerializer(serializers.ModelSerializer):

    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'fullname', 'is_online', 'last_seen', 'password']
        extra_kwargs = {
            'password': {'write_only': True},
            'is_online': {'read_only': True},
            'last_seen': {'read_only': True}
        }

    def create(self, validated_data):
        
        password = validated_data.get('password', None)
        if password is None:
            raise serializers.ValidationError({'password': 'Password is required.'})
        
     
        validated_data.pop('password')

    
        user = CustomUser.objects.create_user(**validated_data)

        user.set_password(password)
        user.save()

        return user
class ChatRoomMembershipSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatRoomMembership
        fields = ['user', 'chat_room', 'joined_at']
        read_only_fields = ['joined_at', 'chat_room']
    

class ChatRoomSerializer(serializers.ModelSerializer):
    members = serializers.SerializerMethodField()
    members_input = serializers.ListField(write_only=True, required=False)

    class Meta:
        model = ChatRoom
        fields = ['id', 'name', 'is_group', 'created_at', 'members', 'members_input']
        read_only_fields = ['created_at']
        extra_kwargs = {
            'is_group': {'required': True},
            'members_input': {'required': True},
        }

    def get_members(self, obj):
        return obj.memberships.values_list('user__username', flat=True)

    def create(self, validated_data):
        members_data = validated_data.pop('members_input', [])
        is_group = validated_data.get('is_group', False)
        name = validated_data.get('name')
        print("Members data:", members_data)

        if is_group:
            if not name:
                raise serializers.ValidationError("Group chat must have a name.")
            if len(members_data) < 3:
                raise serializers.ValidationError("Group chat must have at least 3 members (including yourself).")

        chat_room = ChatRoom.objects.create(**validated_data)
        
        if not name:
            print("Members data:", members_data)
            if len(members_data) < 2:
                raise serializers.ValidationError("At least two members required to auto-generate chat room name.")
            user1 = CustomUser.objects.get(id=members_data[0]['user'])
            user2 = CustomUser.objects.get(id=members_data[1]['user'])
            chat_room.name = f"{user1.username}-{user2.username}"
            chat_room.save()




        return chat_room

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
    
class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'email'

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        user = authenticate(request=self.context.get('request'), email=email, password=password)

        if not user:
            raise serializers.ValidationError("Invalid email or password.")

        refresh = self.get_token(user)

        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }

