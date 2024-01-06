from django.urls import path
from core.ws_consumers.draw import DrawConsumer

ws_urlpatterns = [
    path("api/ws/draw/", DrawConsumer.as_asgi()),
]
