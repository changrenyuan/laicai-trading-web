"""
Hummingbot Trading Bot Backend API - 事件驱动版本
支持 WebSocket 实时推送和命令处理
端口：5000
"""

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
import json
import asyncio
import uvicorn
from enum import Enum

# ============================================================================
# 应用初始化
# ============================================================================

app = FastAPI(
    title="Hummingbot Trading API - Event Driven",
    description="加密货币交易机器人后端 API - 事件驱动架构",
    version="2.0.0"
)

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8000", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# WebSocket 连接管理器
# ============================================================================

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        print(f"[WS] Client connected. Total connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            print(f"[WS] Client disconnected. Total connections: {len(self.active_connections)}")

    async def send_personal_message(self, message: dict, websocket: WebSocket):
        try:
            await websocket.send_json(message)
        except Exception as e:
            print(f"[WS] Error sending message: {e}")
            self.disconnect(websocket)

    async def broadcast(self, message: dict):
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                print(f"[WS] Error broadcasting: {e}")
                disconnected.append(connection)

        # 移除断开的连接
        for connection in disconnected:
            self.disconnect(connection)

    def get_connection_count(self) -> int:
        return len(self.active_connections)

manager = ConnectionManager()

# ============================================================================
# 数据存储
# ============================================================================

class StrategyStatus(str, Enum):
    RUNNING = "running"
    STOPPED = "stopped"
    PAUSED = "paused"
    ERROR = "error"

class OrderStatus(str, Enum):
    PENDING = "pending"
    FILLED = "filled"
    CANCELLED = "cancelled"
    FAILED = "failed"

# Mock 数据存储
strategies_db: Dict[str, dict] = {
    "1": {
        "id": "1",
        "name": "PMM Strategy",
        "type": "Pure Market Making",
        "exchange": "Binance",
        "pair": "BTC/USDT",
        "status": StrategyStatus.RUNNING,
        "profit": 523.00,
        "trades": 324,
        "created": "2024-01-15"
    },
    "2": {
        "id": "2",
        "name": "Arbitrage Bot",
        "type": "Arbitrage",
        "exchange": "Binance & Coinbase",
        "pair": "ETH/BTC",
        "status": StrategyStatus.RUNNING,
        "profit": 892.00,
        "trades": 156,
        "created": "2024-01-10"
    },
    "3": {
        "id": "3",
        "name": "Market Maker SOL",
        "type": "Pure Market Making",
        "exchange": "Binance",
        "pair": "SOL/USDT",
        "status": StrategyStatus.PAUSED,
        "profit": 238.00,
        "trades": 89,
        "created": "2024-01-08"
    }
}

orders_db: Dict[str, dict] = {
    "ORD-001": {
        "orderId": "ORD-001",
        "status": OrderStatus.FILLED,
        "filled": 0.15,
        "remaining": 0.0,
        "price": 52345.0,
        "symbol": "BTC/USDT",
        "side": "buy",
        "strategy": "1",
        "createTime": "2024-01-20 14:32:15",
        "updateTime": "2024-01-20 14:32:16"
    }
}

prices_db: Dict[str, float] = {
    "BTC/USDT": 52345.0,
    "ETH/USDT": 2856.0,
    "SOL/USDT": 98.5,
    "ETH/BTC": 0.0545
}

# ============================================================================
# 命令模型
# ============================================================================

class CommandRequest(BaseModel):
    cmd: str
    id: Optional[str] = None
    symbol: Optional[str] = None
    side: Optional[str] = None
    type: Optional[str] = None
    size: Optional[float] = None
    price: Optional[float] = None
    config: Optional[Dict[str, Any]] = None
    exchange: Optional[str] = None
    api_key: Optional[str] = None
    api_secret: Optional[str] = None
    testnet: Optional[bool] = False
    order_id: Optional[str] = None

# ============================================================================
# 辅助函数
# ============================================================================

async def emit_event(event_type: str, data: dict):
    """发送事件到所有连接的 WebSocket 客户端"""
    event = {
        "type": event_type,
        **data,
        "timestamp": int(datetime.now().timestamp())
    }
    await manager.broadcast(event)
    print(f"[Event] Emitted: {event_type}")

# ============================================================================
# REST API 端点（兼容旧版本）
# ============================================================================

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "2.0.0",
        "ws_connections": manager.get_connection_count()
    }

@app.get("/")
async def root():
    return {
        "message": "Hummingbot Trading API - Event Driven",
        "version": "2.0.0",
        "docs": "/docs",
        "ws": "ws://localhost:5000/api/stream",
        "command": "http://localhost:5000/api/command",
        "health": "/api/health",
        "port": 5000
    }

# ============================================================================
# WebSocket 端点
# ============================================================================

@app.websocket("/api/stream")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket 实时推送端点"""
    await manager.connect(websocket)

    try:
        # 发送初始状态快照
        initial_snapshot = {
            "type": "snapshot",
            "strategies": list(strategies_db.values()),
            "orders": list(orders_db.values()),
            "prices": prices_db,
            "systemStatus": {
                "uptime": 86415,  # 24h 15m
                "bot_status": "running",
                "active_strategies": 2,
                "total_profit": 1653.0,
                "total_trades": 569,
                "success_rate": 94.2,
                "timestamp": int(datetime.now().timestamp())
            }
        }
        await manager.send_personal_message(initial_snapshot, websocket)

        # 启动模拟数据生成任务
        task = asyncio.create_task(simulate_market_data(websocket))

        # 保持连接
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)

            # 处理心跳
            if message.get("type") == "ping":
                await websocket.send_json({"type": "pong"})

    except WebSocketDisconnect:
        print("[WS] Client disconnected")
        manager.disconnect(websocket)
    except Exception as e:
        print(f"[WS] Error: {e}")
        manager.disconnect(websocket)
    finally:
        if 'task' in locals():
            task.cancel()

async def simulate_market_data(websocket: WebSocket):
    """模拟市场数据推送"""
    symbols = ["BTC/USDT", "ETH/USDT", "SOL/USDT"]
    sources = ["PMM Strategy", "Arbitrage Bot", "System"]

    try:
        while True:
            await asyncio.sleep(2)

            # 模拟价格更新
            for symbol in symbols:
                base_price = prices_db.get(symbol, 1000)
                new_price = base_price * (1 + (hash(datetime.now()) % 200 - 100) / 10000)
                prices_db[symbol] = new_price

                await emit_event("price", {
                    "symbol": symbol,
                    "price": new_price
                })

            # 模拟日志
            log_level = ["info", "info", "info", "warn", "error"][hash(datetime.now()) % 5]
            log_source = sources[hash(datetime.now()) % len(sources)]
            log_messages = {
                "info": ["Processing market data update", "Checking order book depth"],
                "warn": ["Inventory imbalance detected", "Price deviation above threshold"],
                "error": ["Connection timeout", "Order placement failed"]
            }

            await emit_event("log", {
                "level": log_level,
                "source": log_source,
                "msg": log_messages[log_level][hash(datetime.now()) % 2],
                "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            })

    except asyncio.CancelledError:
        print("[WS] Simulation task cancelled")

# ============================================================================
# 命令处理端点
# ============================================================================

@app.post("/api/command")
async def handle_command(command: CommandRequest):
    """统一命令处理接口"""
    print(f"[Command] Received: {command.cmd}")

    try:
        # 策略管理命令
        if command.cmd == "start_strategy":
            if command.id and command.id in strategies_db:
                strategies_db[command.id]["status"] = StrategyStatus.RUNNING
                await emit_event("strategy", strategies_db[command.id])
                return {"status": "success", "message": f"Strategy {command.id} started"}
            else:
                raise HTTPException(status_code=404, detail="Strategy not found")

        elif command.cmd == "stop_strategy":
            if command.id and command.id in strategies_db:
                strategies_db[command.id]["status"] = StrategyStatus.STOPPED
                await emit_event("strategy", strategies_db[command.id])
                return {"status": "success", "message": f"Strategy {command.id} stopped"}
            else:
                raise HTTPException(status_code=404, detail="Strategy not found")

        elif command.cmd == "pause_strategy":
            if command.id and command.id in strategies_db:
                strategies_db[command.id]["status"] = StrategyStatus.PAUSED
                await emit_event("strategy", strategies_db[command.id])
                return {"status": "success", "message": f"Strategy {command.id} paused"}
            else:
                raise HTTPException(status_code=404, detail="Strategy not found")

        # 订单管理命令
        elif command.cmd == "place_order":
            order_id = f"ORD-{datetime.now().strftime('%Y%m%d%H%M%S')}"
            new_order = {
                "orderId": order_id,
                "status": OrderStatus.PENDING,
                "filled": 0.0,
                "remaining": command.size if command.size else 1.0,
                "price": command.price if command.price else prices_db.get(command.symbol or "BTC/USDT", 50000),
                "symbol": command.symbol or "BTC/USDT",
                "side": command.side or "buy",
                "strategy": None,
                "createTime": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "updateTime": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            }
            orders_db[order_id] = new_order
            await emit_event("order_update", new_order)
            return {"status": "success", "order_id": order_id}

        elif command.cmd == "cancel_order":
            if command.order_id and command.order_id in orders_db:
                orders_db[command.order_id]["status"] = OrderStatus.CANCELLED
                await emit_event("order_update", orders_db[command.order_id])
                return {"status": "success", "message": f"Order {command.order_id} cancelled"}
            else:
                raise HTTPException(status_code=404, detail="Order not found")

        # 查询命令
        elif command.cmd == "get_system_status":
            return {
                "type": "system_status",
                "uptime": 86415,
                "bot_status": "running",
                "active_strategies": sum(1 for s in strategies_db.values() if s["status"] == StrategyStatus.RUNNING),
                "total_profit": sum(s.get("profit", 0) for s in strategies_db.values()),
                "total_trades": sum(s.get("trades", 0) for s in strategies_db.values()),
                "success_rate": 94.2,
                "timestamp": int(datetime.now().timestamp())
            }

        elif command.cmd == "get_strategies":
            return {"type": "strategies", "data": list(strategies_db.values())}

        elif command.cmd == "get_orders":
            return {"type": "orders", "data": list(orders_db.values())}

        else:
            raise HTTPException(status_code=400, detail=f"Unknown command: {command.cmd}")

    except HTTPException:
        raise
    except Exception as e:
        print(f"[Command] Error: {e}")
        raise HTTPException(status_code=500, detail=f"Command failed: {str(e)}")

# ============================================================================
# 启动服务器
# ============================================================================

if __name__ == "__main__":
    print("🚀 Starting Hummingbot Trading API (Event Driven)...")
    print("📚 API Documentation: http://localhost:5000/docs")
    print("🔌 WebSocket Endpoint: ws://localhost:5000/api/stream")
    print("📝 Command Endpoint: http://localhost:5000/api/command")
    print("🔍 Health Check: http://localhost:5000/api/health")
    print("")
    print("🔄 Event-driven architecture enabled!")
    print("📡 Real-time WebSocket streaming active!")
    print("📍 Port: 5000 (Backend)")
    print("")

    uvicorn.run(app, host="0.0.0.0", port=5000)
