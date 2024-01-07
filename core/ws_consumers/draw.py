import json
import asyncio

from django.conf import settings
from openai import OpenAI

from channels.generic.websocket import AsyncWebsocketConsumer

client = OpenAI(api_key=settings.OPENAI_API_KEY)

system_prompt = """
There is a game in which two players both work to complete a simple drawing
according to a series of prompts that build on one another.

Each player receives a series of distinct prompts.  The prompts should be
related in that they both apply to the same drawing, but the prompts
should be designed so that they apply to different parts of the drawing.

For instance, one player might receive a series of prompts around drawing
the sky, while the other player is drawing the ground.  This is only an example.
Please generate your own theme.

Please generate two series of prompts in JSON format, one for each player.

The JSON should have a player1 key and a player2 key.  The value of each key
should be an array of strings.
"""


class DrawConsumer(AsyncWebsocketConsumer):
    countdown_time = 30
    prompts_fetched = False
    countdown_active = False

    fetch_lock = asyncio.Lock()

    connection_count = 0
    player1_prompts = []
    player2_prompts = []

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
                    DrawConsumer.countdown_time = 30

    async def fetch_prompts(self):
        async with DrawConsumer.fetch_lock:
            if not DrawConsumer.prompts_fetched:
                DrawConsumer.prompts_fetched = True

                completion = client.chat.completions.create(
                    model="gpt-4-1106-preview",
                    response_format={"type": "json_object"},
                    messages=[
                        {
                            "role": "user",
                            "content": system_prompt,
                        }
                    ],
                )

                data = json.loads(completion.choices[0].message.content)

                DrawConsumer.player1_prompts = data["player1"]
                DrawConsumer.player2_prompts = data["player2"]

    async def connect(self):
        DrawConsumer.connection_count += 1

        await self.channel_layer.group_add("draw_group", self.channel_name)
        await self.fetch_prompts()

        await self.accept()

        prompts = [DrawConsumer.player1_prompts, DrawConsumer.player2_prompts]

        await self.send(
            text_data=json.dumps(
                {
                    "type": "prompts",
                    "prompts": prompts[DrawConsumer.connection_count % 2],
                }
            )
        )

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
