from django.shortcuts import render

# Create your views here.

from django.http import JsonResponse
from rest_framework.views import APIView

from rest_framework.response import Response

from rest_framework import status

from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth import authenticate, login, logout
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password, check_password
from django.core.exceptions import ObjectDoesNotExist
from django.utils import timezone

class UserLoginView(APIView):
    permission_classes = [IsAuthenticated]

    @method_decorator(csrf_exempt)
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response({"error": "Email and password are required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
            if check_password(password, user.password):
                login(request, user)
                return Response({"message": "Login successful."}, status=status.HTTP_200_OK)
            else:
                return Response({"error": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED)
        except ObjectDoesNotExist:
            return Response({"error": "User does not exist."}, status=status.HTTP_404_NOT_FOUND)
    
    def get(self, request):
        user = request.user
        if user.is_authenticated:
            return Response({"message": "User is logged in.", "user": {"email": user.email, "username": user.username}}, status=status.HTTP_200_OK)
        else:
            return Response({"message": "User is not logged in."}, status=status.HTTP_401_UNAUTHORIZED)
        
    def delete(self, request):
        user = request.user
        if user.is_authenticated:
            logout(request)
            return Response({"message": "Logout successful."}, status=status.HTTP_200_OK)
        else:
            return Response({"error": "User is not logged in."}, status=status.HTTP_401_UNAUTHORIZED)
    
    def update(self, request):
        user = request.user
        if user.is_authenticated:
            email = request.data.get('email')
            username = request.data.get('username')
            password = request.data.get('password')

            if email:
                user.email = email
            if username:
                user.username = username
            if password:
                user.password = make_password(password)

            user.save()
            return Response({"message": "User details updated successfully."}, status=status.HTTP_200_OK)
        else:
            return Response({"error": "User is not logged in."}, status=status.HTTP_401_UNAUTHORIZED)