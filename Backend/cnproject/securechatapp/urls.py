from django.urls import path, include
from . import views
from rest_framework.routers import DefaultRouter
from .views import CustomTokenObtainPairView, CookieTokenRefreshView, LogoutView

# router = DefaultRouter()
# router.register(r'users', views.UserViewSet, basename='user')

urlpatterns = [
    path('login', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('refresh', CookieTokenRefreshView.as_view(), name='token_refresh'),
    path('logout', LogoutView.as_view(), name='logout'),
    path('user', views.User.as_view(), name='User'),
    path('chatroom', views.chatRoomView.as_view(), name='ChatRoom'),
    path('chat/username', views.get_username_for_chatroom, name='get_username_for_chatroom'),
]