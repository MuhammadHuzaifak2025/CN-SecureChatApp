import os

from channels.routing import ProtocolTypeRouter
from django.core.asgi import get_asgi_application
from channels.routing import URLRouter, ProtocolTypeRouter
from channels.auth import AuthMiddlewareStack
from channels.security.websocket import AllowedHostsOriginValidator
from cnproject.middleware import JWTAuthMiddleware


os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mysite.settings')
# Initialize Django ASGI application early to ensure the AppRegistry
# is populated before importing code that may import ORM models.
django_asgi_app = get_asgi_application()
from django.urls import path
# from .consumers import *
from securechatapp.consumer import * 
# from securechatapp import routing
websocket_urlpatterns = [
    path('chat', ChatConsumer.as_asgi()),
    # path('ws/notification/', NotificationConsumer.as_asgi()),
    # path('ws/typing/', TypingConsumer.as_asgi()),
    # path('ws/online-status/', OnlineStatusConsumer.as_asgi()),
]

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": (
        JWTAuthMiddleware(
            URLRouter(
                websocket_urlpatterns
            )
        )
    ),
})