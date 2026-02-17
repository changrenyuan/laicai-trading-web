# Hummingbot Trading Web UI

一个现代化的加密货币交易机器人管理界面，复刻 Hummingbot 的 Web UI 功能。

![Hummingbot Web UI](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104-green?style=for-the-badge&logo=fastapi)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=for-the-badge&logo=typescript)

## ✨ 功能特性

- 📊 **仪表盘** - 实时监控交易表现、策略状态和收益统计
- 📈 **策略管理** - 创建、编辑、启动、停止交易策略
- 📋 **订单记录** - 查看完整交易历史，支持筛选和导出
- 🔗 **连接配置** - 管理多个交易所的 API 连接
- 📝 **日志查看** - 实时查看机器人运行日志
- 🎨 **现代化 UI** - 基于 shadcn/ui 的精美界面设计
- 🌓 **主题支持** - 支持亮色和暗色主题

## 🏗️ 技术栈

### 前端
- **框架**: Next.js 16 (App Router)
- **语言**: TypeScript 5.9
- **UI 组件**: shadcn/ui (Radix UI)
- **样式**: Tailwind CSS 4
- **图标**: Lucide React

### 后端
- **框架**: FastAPI 0.104
- **语言**: Python 3.8+
- **文档**: Swagger UI / ReDoc
- **CORS**: 支持跨域请求

## 📦 安装与运行

### 前置要求

- Node.js 24+
- Python 3.8+
- pnpm 包管理器

### 快速启动

#### 方式一：使用启动脚本（推荐）

```bash
# 给脚本添加执行权限（如果还没有）
chmod +x start-all.sh

# 启动前端和后端
./start-all.sh
```

#### 方式二：分别启动

**启动后端（Python FastAPI）:**

```bash
cd backend

# 创建虚拟环境（首次运行）
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt

# 启动服务
python api.py
# 或
uvicorn api:app --host 0.0.0.0 --port 8000 --reload
```

后端将在 `http://localhost:8000` 启动

**启动前端（Next.js）:**

```bash
# 回到项目根目录
cd ..

# 安装依赖（首次运行）
pnpm install

# 启动开发服务器
coze dev
# 或
pnpm dev
```

前端将在 `http://localhost:5000` 启动

### 访问应用

- **前端界面**: http://localhost:5000
- **API 文档**: http://localhost:8000/docs
- **健康检查**: http://localhost:8000/api/health

## 📂 项目结构

```
hummingbot-trading-web/
├── backend/                 # Python 后端
│   ├── api.py              # FastAPI 主应用
│   ├── requirements.txt    # Python 依赖
│   └── README.md          # 后端文档
├── src/                    # Next.js 源码
│   ├── app/               # App Router 页面
│   │   ├── page.tsx       # 仪表盘
│   │   ├── strategies/    # 策略管理
│   │   ├── orders/        # 订单记录
│   │   ├── connections/   # 连接配置
│   │   └── logs/          # 日志查看
│   ├── components/        # React 组件
│   │   └── ui/           # shadcn/ui 组件
│   └── lib/              # 工具函数
├── public/               # 静态资源
├── .coze                 # Coze CLI 配置
├── package.json          # 前端依赖
├── start-all.sh          # 一键启动脚本
├── DEPLOYMENT.md         # 部署指南
└── README.md            # 项目说明（本文件）

## 🔧 配置

### 环境变量

创建 `.env.local` 文件：

```env
# Python 后端 API 地址
PYTHON_API_URL=http://localhost:8000
```

### 修改端口

**修改后端端口 (backend/api.py):**

```python
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)  # 修改此处
```

**修改前端端口 (.coze):**

```toml
[dev]
run = ["pnpm", "dev", "--port", "5000"]  # 修改此处
```

## 🚀 部署

### 前端部署

```bash
# 构建生产版本
pnpm build

# 启动生产服务器
pnpm start
```

### 后端部署

```bash
# 使用 Gunicorn + Uvicorn（生产环境）
pip install gunicorn
gunicorn api:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

详细部署指南请查看 [DEPLOYMENT.md](DEPLOYMENT.md)

## 📚 文档

- [部署指南](DEPLOYMENT.md) - 详细的部署和对接说明
- [后端文档](backend/README.md) - Python API 文档
- [API 文档](http://localhost:8000/docs) - Swagger UI（启动后访问）

## 🔌 后端 API 规范

本项目采用**事件驱动架构**，通过 WebSocket 实时推送数据，所有前端页面通过 WebSocket 接收更新，不使用轮询。

### WebSocket 端点

**连接地址**：
```
ws://localhost:8000/api/stream
```

**连接方式**（前端代码示例）：
```typescript
const ws = new WebSocket('ws://localhost:8000/api/stream');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // 处理接收的事件
};
```

### WebSocket 事件类型

后端需要支持以下事件类型的实时推送：

#### 1. 引擎连接状态

**已连接事件**：
```json
{
  "type": "connected",
  "timestamp": 1739800800
}
```

**断开连接事件**：
```json
{
  "type": "disconnected",
  "reason": "Connection lost",
  "timestamp": 1739800800
}
```

#### 2. 系统状态

```json
{
  "type": "system_status",
  "uptime": 86400,
  "bot_status": "running",
  "active_strategies": 3,
  "total_profit": 12453.00,
  "total_trades": 1284,
  "success_rate": 94.2,
  "timestamp": 1739800800
}
```

#### 3. 价格更新

```json
{
  "type": "price",
  "symbol": "BTC/USDT",
  "price": 52345.00,
  "timestamp": 1739800800
}
```

#### 4. 订单更新

```json
{
  "type": "order_update",
  "orderId": "ORD-001",
  "status": "filled",
  "filled": 0.15,
  "remaining": 0.0,
  "price": 52345.00,
  "symbol": "BTC/USDT",
  "side": "buy",
  "strategy": "PMM Strategy",
  "timestamp": 1739800800
}
```

#### 5. 仓位更新

```json
{
  "type": "position",
  "symbol": "BTC/USDT",
  "size": 0.15,
  "entry_price": 52000.00,
  "current_price": 52345.00,
  "pnl": 51.75,
  "pnl_percent": 0.66,
  "strategy": "PMM Strategy",
  "timestamp": 1739800800
}
```

#### 6. 余额更新

```json
{
  "type": "balance",
  "asset": "USDT",
  "free": 10000.00,
  "used": 2345.00,
  "total": 12345.00,
  "exchange": "binance",
  "timestamp": 1739800800
}
```

#### 7. 策略状态更新

```json
{
  "type": "strategy",
  "id": "str-001",
  "name": "PMM Strategy",
  "status": "running",
  "exchange": "binance",
  "pair": "BTC/USDT",
  "profit": 523.00,
  "trades": 324,
  "error_msg": null,
  "timestamp": 1739800800
}
```

#### 8. 日志事件

```json
{
  "type": "log",
  "level": "info",
  "msg": "Order filled: BUY 0.15 BTC @ $52,345.00",
  "source": "PMM Strategy",
  "timestamp": "2024-02-17T13:46:40.000Z"
}
```

#### 9. 连接状态更新

```json
{
  "type": "connection",
  "exchange": "binance",
  "status": "connected",
  "message": "Connected successfully",
  "timestamp": 1739800800
}
```

#### 10. 交易成交事件

```json
{
  "type": "trade",
  "trade_id": "TRD-001",
  "order_id": "ORD-001",
  "symbol": "BTC/USDT",
  "price": 52345.00,
  "amount": 0.15,
  "side": "buy",
  "fee": 7.85,
  "strategy": "PMM Strategy",
  "timestamp": 1739800800
}
```

### WebSocket 命令接口

前端通过 WebSocket 发送命令，后端处理命令后通过 WebSocket 返回响应。

**命令格式**：
```json
{
  "cmd": "command_name",
  "param1": "value1",
  "param2": "value2"
}
```

#### 策略管理命令

**启动策略**：
```json
{
  "cmd": "start_strategy",
  "id": "str-001"
}
```

**停止策略**：
```json
{
  "cmd": "stop_strategy",
  "id": "str-001"
}
```

**暂停策略**：
```json
{
  "cmd": "pause_strategy",
  "id": "str-001"
}
```

**恢复策略**：
```json
{
  "cmd": "resume_strategy",
  "id": "str-001"
}
```

**删除策略**：
```json
{
  "cmd": "delete_strategy",
  "id": "str-001"
}
```

**创建策略**：
```json
{
  "cmd": "create_strategy",
  "name": "My Strategy",
  "type": "pmm",
  "exchange": "binance",
  "pair": "BTC/USDT"
}
```

**获取策略列表**：
```json
{
  "cmd": "get_strategies"
}
```

#### 订单管理命令

**下市价单**：
```json
{
  "cmd": "place_order",
  "symbol": "BTC/USDT",
  "side": "buy",
  "type": "market",
  "size": 0.15
}
```

**下限价单**：
```json
{
  "cmd": "place_order",
  "symbol": "BTC/USDT",
  "side": "buy",
  "type": "limit",
  "price": 52000.00,
  "size": 0.15
}
```

**取消订单**：
```json
{
  "cmd": "cancel_order",
  "order_id": "ORD-001"
}
```

**取消所有订单**：
```json
{
  "cmd": "cancel_all_orders"
}
```

或指定交易对：
```json
{
  "cmd": "cancel_all_orders",
  "symbol": "BTC/USDT"
}
```

**获取订单列表**：
```json
{
  "cmd": "get_orders"
}
```

支持筛选：
```json
{
  "cmd": "get_orders",
  "symbol": "BTC/USDT",
  "status": "filled",
  "strategy": "str-001"
}
```

#### 连接管理命令

**创建连接**：
```json
{
  "cmd": "create_connection",
  "exchange": "binance",
  "api_key": "your_api_key",
  "api_secret": "your_api_secret",
  "testnet": false
}
```

**删除连接**：
```json
{
  "cmd": "delete_connection",
  "id": "conn-001"
}
```

**测试连接**：
```json
{
  "cmd": "test_connection",
  "id": "conn-001"
}
```

#### 系统命令

**启动引擎**：
```json
{
  "cmd": "start_engine"
}
```

**停止引擎**：
```json
{
  "cmd": "stop_engine"
}
```

**获取系统状态**：
```json
{
  "cmd": "get_system_status"
}
```

**获取仓位列表**：
```json
{
  "cmd": "get_positions"
}
```

**获取余额列表**：
```json
{
  "cmd": "get_balances"
}
```

### HTTP API 端点（可选）

如果需要补充 HTTP REST API（除了 WebSocket 外），建议实现：

```
GET  /api/health          - 健康检查
GET  /api/dashboard       - 仪表盘数据
GET  /api/strategies      - 获取策略列表
GET  /api/orders          - 获取订单列表
GET  /api/connections     - 获取连接列表
GET  /api/logs            - 获取日志列表
```

### 数据流架构

```
┌─────────────────┐
│   Frontend UI   │
└────────┬────────┘
         │ WebSocket
         ↓
┌─────────────────┐
│   WebSocket     │ ← 实时推送事件
│   Endpoint      │ ← 接收命令
│  /api/stream    │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  Hummingbot     │
│  Trading Engine │
└─────────────────┘
```

### 实现建议

后端 FastAPI 实现 WebSocket 端点的示例代码：

```python
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from typing import Dict
import json

app = FastAPI()

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            await connection.send_json(message)

manager = ConnectionManager()

@app.websocket("/api/stream")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # 接收前端命令
            data = await websocket.receive_text()
            command = json.loads(data)

            # 处理命令
            response = await handle_command(command)

            # 返回响应
            await websocket.send_json(response)

    except WebSocketDisconnect:
        manager.disconnect(websocket)

async def handle_command(command: dict) -> dict:
    cmd = command.get("cmd")
    
    if cmd == "start_strategy":
        # 启动策略逻辑
        return {"status": "success", "message": "Strategy started"}
    
    elif cmd == "get_strategies":
        # 返回策略列表
        strategies = get_strategies_from_engine()
        return {"status": "success", "data": strategies}
    
    # ... 其他命令处理
    
    return {"status": "error", "message": "Unknown command"}

# 推送事件到所有连接的客户端
async def push_event(event_type: str, data: dict):
    await manager.broadcast({"type": event_type, **data})
```

### 测试工具

可以使用 wscat 测试 WebSocket 连接：

```bash
# 安装 wscat
npm install -g wscat

# 连接 WebSocket
wscat -c ws://localhost:8000/api/stream

# 发送命令
> {"cmd": "get_system_status"}

# 接收响应
< {"type": "system_status", "uptime": 86400, "bot_status": "running", ...}
```

## 🔐 安全建议

1. **不要在前端存储敏感信息**（API 密钥等）
2. **使用 HTTPS**（生产环境必须）
3. **实现认证授权**（JWT、OAuth 等）
4. **配置 CORS 白名单**
5. **添加速率限制**

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🙏 致谢

- [Hummingbot](https://www.hummingbot.org/) - 灵感来源
- [Next.js](https://nextjs.org/) - React 框架
- [FastAPI](https://fastapi.tiangolo.com/) - Python 框架
- [shadcn/ui](https://ui.shadcn.com/) - UI 组件库

## 📮 联系方式

- GitHub: [changrenyuan/laicai-trading-web](https://github.com/changrenyuan/laicai-trading-web)

---

⭐ 如果这个项目对你有帮助，请给个 Star！
