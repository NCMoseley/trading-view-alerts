import websockets
import json
import asyncio
from datetime import datetime

async def connect_coinbase_websocket():
    url = "wss://ws-feed.exchange.coinbase.com"
    
    # Subscription message for SOL-USD trades
    subscribe_message = {
        "type": "subscribe",
        "product_ids": ["SOL-USD"],
        "channels": ["matches"]  # "matches" channel for real-time trade data
    }
    
    async with websockets.connect(url) as websocket:
        print("Connected to Coinbase WebSocket")
        
        # Send subscription message
        await websocket.send(json.dumps(subscribe_message))
        
        while True:
            try:
                message = await websocket.recv()
                trade = json.loads(message)
                
                if trade['type'] == 'match':  # 'match' events are trades
                    print(f"""
                        Symbol: {trade['product_id']}
                        Price: {trade['price']}
                        Size: {trade['size']}
                        Side: {trade['side']}
                        Time: {datetime.strptime(trade['time'], '%Y-%m-%dT%H:%M:%S.%fZ').strftime('%Y-%m-%d %H:%M:%S')}
                    """)
                    
            except Exception as e:
                print(f"Error: {e}")
                break

async def main():
    while True:
        try:
            await connect_coinbase_websocket()
        except Exception as e:
            print(f"Connection lost: {e}")
            print("Reconnecting in 5 seconds...")
            await asyncio.sleep(5)

if __name__ == "__main__":
    asyncio.run(main()) 