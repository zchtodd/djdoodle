import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer


class DrawConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.channel_layer.group_add("draw_group", self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard("draw_group", self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)

        await self.channel_layer.group_send(
            "draw_group", {"type": "draw_message", "message": data}
        )

    async def draw_message(self, event):
        message = event["message"]
        await self.send(text_data=json.dumps(message))
