# consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async


class PriceUpdatesConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        await self.channel_layer.group_add("price_updates", self.channel_name)

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard("price_updates", self.channel_name)

    @database_sync_to_async
    def update_asset_price(self, asset_id, new_price):
        from .models import Asset
        asset = Asset.objects.get(id=asset_id)
        asset.current_price = new_price
        asset.save()
        return asset

    async def receive(self, text_data):
        print("websocket received:", text_data) #debugging
        data = json.loads(text_data)
        if data.get('type') == 'price_update' and self.scope['user'].is_data_admin:
            asset = await self.update_asset_price(data['asset_id'], data['new_price'])
            await self.channel_layer.group_send(
                "price_updates",
                {
                    "type": "price.update",
                    "asset_id": asset.id,
                    "new_price": str(asset.current_price),
                    "timestamp": str(asset.last_updated)
                }
            )
        print("Broadcasted price update for asset", asset.id)  # Debug

    async def price_update(self, event):
        await self.send(text_data=json.dumps(event))