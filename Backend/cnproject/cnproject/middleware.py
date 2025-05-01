from channels.middleware import BaseMiddleware
from urllib.parse import parse_qs
import jwt

class JWTAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        from django.contrib.auth.models import AnonymousUser  # Lazy import
        from securechatapp.models import CustomUser as User   # Lazy import
        from django.conf import settings
        # print("Hello from JWTAuthMiddleware")
        headers = dict(scope["headers"])
        auth_header = headers.get(b'authorization', None)  # fix: b'authorization'

        # print(f"Headers: {headers}")
        # print(f"Auth Header: {auth_header}")

        if auth_header:
            try:
                token = auth_header.decode().split(" ")[1]

                # JWT decode with settings.SECRET_KEY (safe & reliable)
                payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
                user_id = payload.get("user_id")

                from channels.db import database_sync_to_async

                @database_sync_to_async
                def get_user():
                    try:
                        return User.objects.get(id=user_id)
                    except:
                        return AnonymousUser()

                scope["user"] = await get_user()
                # print(f"User: {scope['user']}")
                # print("User is authenticated")
                

            except Exception as e:
                # print(f"JWT error: {e}")
                scope["user"] = AnonymousUser()
        else:
            scope["user"] = AnonymousUser()
            # print("User is anonymous")
            

        return await super().__call__(scope, receive, send)
