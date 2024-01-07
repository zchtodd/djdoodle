import json
import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer


class DrawConsumer(AsyncWebsocketConsumer):
    countdown_time = 15
    countdown_active = False

    async def start_countdown(self):
        if not DrawConsumer.countdown_active:
            DrawConsumer.countdown_active = True
            while DrawConsumer.countdown_time > 0:
                await asyncio.sleep(1)
                await self.channel_layer.group_send(
                    "draw_group",
                    {
                        "type": "countdown_message",
                        "countdown": DrawConsumer.countdown_time,
                    },
                )
                DrawConsumer.countdown_time -= 1

                if DrawConsumer.countdown_time == 0:
                    DrawConsumer.countdown_time = 15

    async def connect(self):
        await self.channel_layer.group_add("draw_group", self.channel_name)
        await self.accept()

        asyncio.create_task(self.start_countdown())

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard("draw_group", self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)

        data["countdown"] = DrawConsumer.countdown_time
        await self.channel_layer.group_send(
            "draw_group", {"type": "draw_message", "message": data}
        )

    async def draw_message(self, event):
        message = event["message"]
        await self.send(text_data=json.dumps(message))

    async def countdown_message(self, event):
        countdown = event["countdown"]
        message = {"type": "countdown", "countdown": countdown}
        await self.send(text_data=json.dumps(message))
