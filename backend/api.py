"""
Hummingbot Trading Bot Backend API
使用 FastAPI 构建 RESTful API
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import uvicorn

app = FastAPI(
    title="Hummingbot Trading API",
    description="加密货币交易机器人后端 API",
    version="1.0.0"
)

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000"],  # Next.js 开发服务器
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ========== 数据模型 ==========

class Strategy(BaseModel):
    id: int
    name: str
    type: str
    exchange: str
    pair: str
    status: str
    profit: str
    trades: int
    created: str

class Order(BaseModel):
    id: str
    type: str
    pair: str
    price: str
    amount: str
    total: str
    strategy: str
    status: str
    time: str

class Connection(BaseModel):
    id: int
    exchange: str
    status: str
    apiKey: str
    testnet: bool
    lastSync: str
    strategies: int

class LogEntry(BaseModel):
    timestamp: str
    level: str
    source: str
    message: str

# ========== Mock 数据存储 ==========

strategies_db = [
    {
        "id": 1,
        "name": "PMM Strategy",
        "type": "Pure Market Making",
        "exchange": "Binance",
        "pair": "BTC/USDT",
        "status": "running",
        "profit": "+$523.00",
        "trades": 324,
        "created": "2024-01-15"
    },
    {
        "id": 2,
        "name": "Arbitrage Bot",
        "type": "Arbitrage",
        "exchange": "Binance & Coinbase",
        "pair": "ETH/BTC",
        "status": "running",
        "profit": "+$892.00",
        "trades": 156,
        "created": "2024-01-10"
    },
    {
        "id": 3,
        "name": "Market Maker SOL",
        "type": "Pure Market Making",
        "exchange": "Binance",
        "pair": "SOL/USDT",
        "status": "paused",
        "profit": "+$238.00",
        "trades": 89,
        "created": "2024-01-08"
    },
]

orders_db = [
    {
        "id": "ORD-001",
        "type": "buy",
        "pair": "BTC/USDT",
        "price": "52,345.00",
        "amount": "0.15",
        "total": "7,851.75",
        "strategy": "PMM Strategy",
        "status": "filled",
        "time": "2024-01-20 14:32:15"
    },
    {
        "id": "ORD-002",
        "type": "sell",
        "pair": "ETH/USDT",
        "price": "2,856.00",
        "amount": "3.2",
        "total": "9,139.20",
        "strategy": "Arbitrage Bot",
        "status": "filled",
        "time": "2024-01-20 14:28:42"
    },
]

connections_db = [
    {
        "id": 1,
        "exchange": "Binance",
        "status": "connected",
        "apiKey": "••••••••••••••kL3x",
        "testnet": False,
        "lastSync": "2 min ago",
        "strategies": 2
    },
    {
        "id": 2,
        "exchange": "Coinbase",
        "status": "connected",
        "apiKey": "••••••••••••••pM7n",
        "testnet": False,
        "lastSync": "5 min ago",
        "strategies": 1
    },
]

logs_db = [
    {
        "timestamp": "2024-01-20 14:32:15",
        "level": "INFO",
        "source": "PMM Strategy",
        "message": "Placing buy order on Binance BTC/USDT at 52,345.00"
    },
    {
        "timestamp": "2024-01-20 14:32:16",
        "level": "INFO",
        "source": "PMM Strategy",
        "message": "Order ORD-001 successfully placed"
    },
]

# ========== 仪表盘 API ==========

@app.get("/api/dashboard")
async def get_dashboard():
    """获取仪表盘数据"""
    return {
        "totalProfit": 12453.00,
        "totalTrades": 1284,
        "successRate": 94.2,
        "activeStrategies": 3,
        "uptime": "24h 15m",
        "strategies": [
            {
                "name": "PMM Strategy",
                "pair": "BTC/USDT",
                "profit": "+$523.00",
                "status": "running"
            },
            {
                "name": "Arbitrage",
                "pair": "ETH/BTC",
                "profit": "+$892.00",
                "status": "running"
            },
            {
                "name": "Market Making",
                "pair": "SOL/USDT",
                "profit": "+$238.00",
                "status": "running"
            }
        ],
        "recentTrades": [
            {
                "type": "buy",
                "pair": "BTC/USDT",
                "price": "52,345.00",
                "amount": "0.15",
                "time": "2m ago"
            },
            {
                "type": "sell",
                "pair": "ETH/USDT",
                "price": "2,856.00",
                "amount": "3.2",
                "time": "5m ago"
            },
            {
                "type": "buy",
                "pair": "SOL/USDT",
                "price": "98.50",
                "amount": "50",
                "time": "8m ago"
            }
        ]
    }

# ========== 策略 API ==========

@app.get("/api/strategies", response_model=List[Strategy])
async def get_strategies():
    """获取所有策略"""
    return strategies_db

@app.get("/api/strategies/{strategy_id}", response_model=Strategy)
async def get_strategy(strategy_id: int):
    """获取指定策略"""
    strategy = next((s for s in strategies_db if s["id"] == strategy_id), None)
    if not strategy:
        raise HTTPException(status_code=404, detail="Strategy not found")
    return strategy

@app.post("/api/strategies")
async def create_strategy(strategy: dict):
    """创建新策略"""
    new_id = max(s["id"] for s in strategies_db) + 1
    new_strategy = {
        "id": new_id,
        **strategy,
        "status": "stopped",
        "profit": "+$0.00",
        "trades": 0,
        "created": datetime.now().strftime("%Y-%m-%d")
    }
    strategies_db.append(new_strategy)
    return new_strategy

@app.post("/api/strategies/{strategy_id}/start")
async def start_strategy(strategy_id: int):
    """启动策略"""
    strategy = next((s for s in strategies_db if s["id"] == strategy_id), None)
    if not strategy:
        raise HTTPException(status_code=404, detail="Strategy not found")
    strategy["status"] = "running"
    return {"status": "success", "message": "Strategy started", "strategy": strategy}

@app.post("/api/strategies/{strategy_id}/stop")
async def stop_strategy(strategy_id: int):
    """停止策略"""
    strategy = next((s for s in strategies_db if s["id"] == strategy_id), None)
    if not strategy:
        raise HTTPException(status_code=404, detail="Strategy not found")
    strategy["status"] = "stopped"
    return {"status": "success", "message": "Strategy stopped", "strategy": strategy}

@app.delete("/api/strategies/{strategy_id}")
async def delete_strategy(strategy_id: int):
    """删除策略"""
    global strategies_db
    strategies_db = [s for s in strategies_db if s["id"] != strategy_id]
    return {"status": "success", "message": "Strategy deleted"}

# ========== 订单 API ==========

@app.get("/api/orders", response_model=List[Order])
async def get_orders(
    status: Optional[str] = None,
    strategy: Optional[str] = None,
    order_type: Optional[str] = None
):
    """获取订单列表，支持筛选"""
    filtered_orders = orders_db

    if status:
        filtered_orders = [o for o in filtered_orders if o["status"] == status]
    if strategy:
        filtered_orders = [o for o in filtered_orders if o["strategy"] == strategy]
    if order_type:
        filtered_orders = [o for o in filtered_orders if o["type"] == order_type]

    return filtered_orders

@app.get("/api/orders/{order_id}", response_model=Order)
async def get_order(order_id: str):
    """获取指定订单"""
    order = next((o for o in orders_db if o["id"] == order_id), None)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

# ========== 连接 API ==========

@app.get("/api/connections", response_model=List[Connection])
async def get_connections():
    """获取所有连接"""
    return connections_db

@app.post("/api/connections")
async def create_connection(connection: dict):
    """创建新连接"""
    new_id = max(c["id"] for c in connections_db) + 1
    new_connection = {
        "id": new_id,
        **connection,
        "status": "connected",
        "lastSync": "Just now",
        "strategies": 0
    }
    connections_db.append(new_connection)
    return new_connection

@app.delete("/api/connections/{connection_id}")
async def delete_connection(connection_id: int):
    """删除连接"""
    global connections_db
    connections_db = [c for c in connections_db if c["id"] != connection_id]
    return {"status": "success", "message": "Connection deleted"}

# ========== 日志 API ==========

@app.get("/api/logs", response_model=List[LogEntry])
async def get_logs(
    level: Optional[str] = None,
    source: Optional[str] = None,
    limit: int = 100
):
    """获取日志列表，支持筛选"""
    filtered_logs = logs_db

    if level:
        filtered_logs = [l for l in filtered_logs if l["level"].lower() == level.lower()]
    if source:
        filtered_logs = [l for l in filtered_logs if l["source"] == source]

    return filtered_logs[-limit:]

@app.get("/api/health")
async def health_check():
    """健康检查"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }

# ========== 根路径 ==========

@app.get("/")
async def root():
    """API 根路径"""
    return {
        "message": "Hummingbot Trading API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/api/health"
    }

if __name__ == "__main__":
    print("🚀 Starting Hummingbot Trading API...")
    print("📚 API Documentation: http://localhost:8000/docs")
    print("🔍 API Health Check: http://localhost:8000/api/health")
    uvicorn.run(app, host="0.0.0.0", port=8000)
