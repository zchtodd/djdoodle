"""
ASGI config for djdoodle project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/asgi/
"""

import os

from django.core.asgi import get_asgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "djdoodle.settings")

application = get_asgi_application()

from channels.routing import ProtocolTypeRouter, URLRouter
from core.ws_routing import ws_urlpatterns

application = ProtocolTypeRouter(
    {
        "http": application,
        "websocket": URLRouter(ws_urlpatterns),
    }
)
