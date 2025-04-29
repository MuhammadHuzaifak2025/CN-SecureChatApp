from django.urls import path, include
from . import views
from rest_framework.routers import DefaultRouter

# router = `DefaultRouter()

urlpatterns = [
    path('/user/login/', views.UserLoginView.as_view(), name='user-login'),
    # path('', include(router.urls)),
]