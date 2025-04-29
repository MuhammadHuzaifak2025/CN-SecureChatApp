from django.urls import path, include
from . import views
from rest_framework.routers import DefaultRouter
from .views import CustomTokenObtainPairView, CookieTokenRefreshView, LogoutView
# router = `DefaultRouter()

urlpatterns = [
    path('login', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('refresh', CookieTokenRefreshView.as_view(), name='token_refresh'),
    path('logout', LogoutView.as_view(), name='logout'),
]