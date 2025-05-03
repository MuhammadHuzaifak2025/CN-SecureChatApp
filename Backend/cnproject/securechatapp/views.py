from django.contrib.auth import logout, get_user_model
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated
from securechatapp.serializer import EmailTokenObtainPairSerializer
from securechatapp.models import CustomUser, ChatRoomMembership, ChatRoom, Message, TypingIndicator, EncryptionKey
from securechatapp.serializer import CustomUserSerializer, ChatRoomMembershipSerializer, MessageSerializer, ChatRoomSerializer
from django.shortcuts import get_object_or_404
from django.db.models import Count
from rest_framework.exceptions import ValidationError

User = get_user_model()


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        data = response.data

        access_token = data.get("access")
        refresh_token = data.get("refresh")

        if access_token:
            response.set_cookie(
                key='access_token',
                value=access_token,
                httponly=True,
                secure=True,       # False in dev, True in production
                samesite='Lax',
                max_age=3600,      # 1 hour
                path='/'
            )

        if refresh_token:
            response.set_cookie(
                key='refresh_token',
                value=refresh_token,
                httponly=True,
                secure=True,
                samesite='Lax',
                max_age=7 * 24 * 3600,  # 7 days
                path='/'
            )

        # Remove tokens from body
        response.data.pop("access", None)
        response.data.pop("refresh", None)

        response.data['message'] = "Login successful"
        return response


class CookieTokenRefreshView(APIView):
    def post(self, request):
        refresh_token = request.COOKIES.get('refresh_token')
        if not refresh_token:
            return Response({'error': 'Refresh token not found in cookies.'}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            token = RefreshToken(refresh_token)
            access_token = str(token.access_token)

            response = Response({'message': 'Token refreshed'}, status=status.HTTP_200_OK)
            response.set_cookie(
                key='access_token',
                value=access_token,
                httponly=True,
                secure=True,
                samesite='Lax',
                max_age=3600,
                path='/'
            )
            return response
        except TokenError:
            return Response({'error': 'Invalid or expired refresh token'}, status=status.HTTP_401_UNAUTHORIZED)


class LogoutView(APIView):
    def post(self, request):
        logout(request)
        response = Response({'message': 'Logged out successfully.'}, status=status.HTTP_200_OK)
        response.delete_cookie('access_token')
        response.delete_cookie('refresh_token')
        return response

from Cryptodome.PublicKey import RSA

class User(APIView):
    # permission_classes = [IsAuthenticated]  

    def get(self, request):
        user = request.user
        if user.is_authenticated:
            return Response({
                'id': user.id,
                'email': user.email,
                'username': user.username,
                'fullname': user.fullname,
                'is_online': user.is_online,
                'last_seen': user.last_seen,
            })
        else:
            return Response({'error': 'User not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)
        
    def post(self, request):
        if CustomUser.objects.filter(email=request.data['email']).exists():
            return Response({'error': 'User with this email already exists'}, status=status.HTTP_400_BAD_REQUEST)
        serializer = CustomUserSerializer(data=request.data)
        
        if serializer.is_valid():
            
            user = serializer.save()
            # key = RSA.generate(2048)
            # private_key_pem = key.export_key().decode()
            # public_key_pem = key.publickey().export_key().decode()
            # EncryptionKey.objects.create(user=user, public_key=public_key_pem, private_key=private_key_pem)
            return Response({
                'id': user.id,
                'email': user.email,
                'username': user.username,
                'fullname': user.fullname,
                'is_online': user.is_online,
                'last_seen': user.last_seen,
            }, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request):
        user = request.user
        if user.is_authenticated:
            user.delete()
            return Response({'message': 'User deleted successfully'}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'User not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)
        
    def put(self, request):
        user = request.user
        if user.is_authenticated:
            serializer = CustomUserSerializer(user, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'error': 'User not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)
        
from copy import deepcopy
class chatRoomView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        try:
            user = request.user
            # chat_rooms = ChatRoom.objects.filter(memberships__user=user).order_by('-created_at')
            chat_rooms_user = ChatRoomMembership.objects.filter(user=user)
            chat_rooms_user_ids = chat_rooms_user.values_list('chat_room_id', flat=True)
            chat_rooms = ChatRoom.objects.filter(id__in=chat_rooms_user_ids).order_by('-created_at')
            for room in chat_rooms:
                room.members = room.memberships.values_list('user__username', flat=True)
            if not chat_rooms.exists():
                return Response({'message': 'No chat rooms found'}, status=status.HTTP_404_NOT_FOUND)
            serializer = ChatRoomSerializer(chat_rooms, many=True)
            
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        


    def post(self, request):
        try:
            user = request.user

            # Clone the request data to avoid modifying the original
            data = deepcopy(request.data)

            members = data.get('members', [])
            if not isinstance(members, list):
                return Response({'error': 'Members should be a list.'}, status=status.HTTP_400_BAD_REQUEST)

            # Add the current user to the members list (if not already included)
            member_ids = [member.get('user') for member in members if isinstance(member, dict)]
            if user.username not in member_ids:
                member_ids.append(user.username)

            print("Member IDs:", member_ids)

            if len(set(member_ids)) == 1:
                return Response({'error': 'You cannot create a chat room with yourself.'}, status=status.HTTP_400_BAD_REQUEST)
            if(len(set(member_ids)) > 2 and data.get('is_group') == False):
                return Response({'error': 'You cannot create a group chat room with is_group set to false.'}, status=status.HTTP_400_BAD_REQUEST)

            if(len(set(member_ids)) < 2 and data.get('is_group') == True):
                return Response({'error': 'You cannot create a group chat room with less than 2 members.'}, status=status.HTTP_400_BAD_REQUEST)
            if(data.get('is_group') == True and ChatRoom.objects.filter(name=data.get('name')).exists()):
                return Response({'error': 'Group chat with this name already exists.'}, status=status.HTTP_400_BAD_REQUEST)
            # Check if all user IDs exist
            for username in member_ids:
                if not CustomUser.objects.filter(username=username).exists():
                    return Response({'error': f'User with username {username} does not exist.'}, status=status.HTTP_400_BAD_REQUEST)

            # Check for existing chat room (non-group) with same members
            possible_rooms = ChatRoom.objects.annotate(num_members=Count('memberships')).filter(num_members=len(member_ids))
            for room in possible_rooms:
                room_member_ids = sorted(room.memberships.values_list('user_id', flat=True))
                if room_member_ids == sorted(member_ids) and data.get('is_group') == False:
                    return Response({'error': 'You already have a chat room with this user(s).'}, status=status.HTTP_400_BAD_REQUEST)

            # Prepare members list for serializer
            data['members_input'] = [{'user': uid} for uid in member_ids]
            
            serializer = ChatRoomSerializer(data=data, context={'request': request})
            if serializer.is_valid():
                chat_room = serializer.save()
                for member_data in data['members_input']:
                    ChatRoomMembership.objects.create(chat_room=chat_room, user_id=CustomUser.objects.get(username=member_data['user']).id)
                return Response(serializer.data, status=status.HTTP_201_CREATED)

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            print("Error:", e)
            if isinstance(e, ValidationError):
                return Response({'error': e.detail}, status=status.HTTP_400_BAD_REQUEST)
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ChatRoomMembershipView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        memberships = ChatRoomMembership.objects.filter(user=user)
        serializer = ChatRoomMembershipSerializer(memberships, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        user = request.user
        chat_room_id = request.data.get('chat_room_id')
        chat_room = get_object_or_404(ChatRoom, id=chat_room_id)
        membership, created = ChatRoomMembership.objects.get_or_create(user=user, chat_room=chat_room)
        if created:
            return Response({'message': 'Joined chat room successfully'}, status=status.HTTP_201_CREATED)
        return Response({'message': 'Already a member of this chat room'}, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request):
        user = request.user
        chat_room_id = request.data.get('chat_room_id')
        chat_room = get_object_or_404(ChatRoom, id=chat_room_id)
        membership = ChatRoomMembership.objects.filter(user=user, chat_room=chat_room).first()
        if membership:
            membership.delete()
            return Response({'message': 'Left chat room successfully'}, status=status.HTTP_200_OK)
        return Response({'message': 'Not a member of this chat room'}, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request):
        user = request.user
        chat_room_id = request.data.get('chat_room_id')
        chat_room = get_object_or_404(ChatRoom, id=chat_room_id)
        membership = ChatRoomMembership.objects.filter(user=user, chat_room=chat_room).first()
        if not membership:
            return Response({'message': 'Not a member of this chat room'}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = ChatRoomMembershipSerializer(membership, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class MessageView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        chat_room_id = request.query_params.get('chat_room_id')
        chat_room = get_object_or_404(ChatRoom, id=chat_room_id)
        messages = Message.objects.filter(chat_room=chat_room).order_by('-timestamp')
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        user = request.user
        chat_room_id = request.data.get('chat_room_id')
        chat_room = get_object_or_404(ChatRoom, id=chat_room_id)
        content = request.data.get('content')
        if not content:
            return Response({'message': 'Message content is required'}, status=status.HTTP_400_BAD_REQUEST)

        message = Message.objects.create(sender=user, chat_room=chat_room, content=content)
        serializer = MessageSerializer(message)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def delete(self, request):
        user = request.user
        message_id = request.data.get('message_id')
        message = Message.objects.filter(id=message_id, sender=user).first()
        if message:
            message.delete()
            return Response({'message': 'Message deleted successfully'}, status=status.HTTP_200_OK)
        return Response({'message': 'Message not found or not sent by you'}, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request):
        user = request.user
        message_id = request.data.get('message_id')
        message = Message.objects.filter(id=message_id, sender=user).first()
        if not message:
            return Response({'message': 'Message not found or not sent by you'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = MessageSerializer(message, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


from rest_framework.decorators import api_view

@api_view(['GET'])
def get_username_for_chatroom(request):
    user = request.user
    if not user.is_authenticated:
        return Response({'error': 'User not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)

    # Get chat room IDs the user is part of
    user_chatroom_ids = ChatRoomMembership.objects.filter(user=user).values_list('chat_room_id', flat=True)

    # Get all users except the current user
    all_users = CustomUser.objects.exclude(id=user.id)

    data = []
    for other_user in all_users:
        # Check if this user shares any chat room with the current user
        shared_rooms = ChatRoomMembership.objects.filter(
            user=other_user,
            chat_room_id__in=user_chatroom_ids
        ).exists()

        data.append({
            'id': other_user.id,
            'username': other_user.username,
            'is_online': other_user.is_online,
            'last_seen': other_user.last_seen,
            'already_in_chat': shared_rooms
        })

    return Response({'users': data}, status=status.HTTP_200_OK)