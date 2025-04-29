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
from securechatapp.serializer import CustomUserSerializer
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