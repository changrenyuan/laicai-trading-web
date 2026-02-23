# Hummingbot Trading Web UI

一个现代化的加密货币交易机器人管理界面，采用**事件驱动架构**，提供实时数据推送和零轮询的用户体验。

![Hummingbot Web UI](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=for-the-badge&logo=typescript)
![WebSocket](https://img.shields.io/badge/WebSocket-Realtime-orange?style=for-the-badge)

## ✨ 功能特性

- 📊 **仪表盘** - 实时监控交易表现、策略状态和收益统计
- 📈 **策略管理** - 创建、编辑、启动、停止交易策略
- 📋 **订单记录** - 查看完整交易历史，支持筛选和取消
- 🔗 **连接配置** - 管理多个交易所的 API 连接
- 📝 **日志查看** - 实时查看机器人运行日志
- 🎨 **现代化 UI** - 基于 shadcn/ui 的精美界面设计
- 🌓 **主题支持** - 支持亮色和暗色主题
- ⚡ **事件驱动** - WebSocket 实时推送，零轮询延迟

## 🏗️ 技术栈

### 前端
- **框架**: Next.js 16 (App Router)
- **语言**: TypeScript 5.9
- **UI 组件**: shadcn/ui (Radix UI)
- **样式**: Tailwind CSS 4
- **图标**: Lucide React
- **状态管理**: Zustand
- **通信**: WebSocket (事件驱动)

### 通信协议
- **WebSocket**: 实时双向通信
- **SSE**: 服务器发送事件（可选）
- **HTTP**: REST API（补充接口）

## 📦 安装与运行

### 前置要求

- Node.js 24+
- pnpm 包管理器

### 快速启动

```bash
# 安装依赖
pnpm install

# 启动开发服务器（端口 5000）
coze dev
# 或
pnpm dev
```

访问地址：http://localhost:5000

### 端口配置

| 服务 | 端口 | 说明 |
|------|------|------|
| 前端 (Next.js) | **5000** | Web UI 访问地址 |
| 后端 API | **8000** | API 服务（需后端实现） |

## 📂 项目结构

```
hummingbot-trading-web/
├── src/                    # Next.js 源码
│   ├── app/               # App Router 页面
│   │   ├── page.tsx       # 仪表盘
│   │   ├── strategies/    # 策略管理
│   │   ├── orders/        # 订单记录
│   │   ├── connections/   # 连接配置
│   │   └── logs/          # 日志查看
│   ├── components/        # React 组件
│   │   └── ui/           # shadcn/ui 组件
│   ├── core/             # 核心功能模块
│   │   ├── events.ts     # 事件类型定义
│   │   ├── ws.ts         # WebSocket 客户端
│   │   └── command.ts    # 命令发送接口
│   ├── store/            # 状态管理
│   │   ├── engineStore.ts # 引擎状态
│   │   └── uiStore.ts    # UI 状态
│   └── lib/              # 工具函数
├── public/               # 静态资源
├── .coze                 # Coze CLI 配置
├── package.json          # 前端依赖
└── README.md            # 项目说明（本文件）
```

## 🏗️ 架构设计

### 事件驱动架构

本项目采用**事件驱动架构**，所有前端页面通过 WebSocket 接收后端实时推送的数据更新，不使用轮询机制。

```
┌─────────────────┐
│   Frontend UI   │
│  (所有页面)     │
└────────┬────────┘
         │ WebSocket
         ├───────────────────┐
         │                   │
    接收事件             发送命令
         ↓                   ↓
┌─────────────────┐   ┌─────────────────┐
│   WebSocket     │   │   WebSocket     │
│   Endpoint      │   │   Endpoint      │
│  /api/stream    │   │  /api/stream    │
└────────┬────────┘   └─────────────────┘
         │
         ↓
┌─────────────────┐
│  后端 API 服务  │
│  (需实现)       │
└─────────────────┘
```

### 数据流

1. **事件流（后端 → 前端）**：
   - 后端通过 WebSocket 推送事件
   - 前端 `WebSocket` 客户端接收
   - `engineStore.onEvent()` 更新状态
   - React 组件自动重新渲染

2. **命令流（前端 → 后端）**：
   - 用户在 UI 上操作
   - 前端通过 `command.ts` 发送命令
   - WebSocket 传输到后端
   - 后端处理并返回结果

### 核心模块

#### 1. 事件定义 (`src/core/events.ts`)
定义所有后端需要推送的事件类型：
- 引擎连接状态
- 系统状态
- 价格更新
- 订单更新
- 仓位更新
- 余额更新
- 策略状态
- 日志事件
- 连接状态
- 交易成交

#### 2. WebSocket 客户端 (`src/core/ws.ts`)
- 自动连接管理
- 自动重连机制
- 心跳保活
- 事件分发

#### 3. 命令发送 (`src/core/command.ts`)
提供类型安全的命令发送接口：
- 策略管理命令
- 订单管理命令
- 连接管理命令
- 系统命令

#### 4. 状态管理 (`src/store/`)
- `engineStore`: 交易相关数据
- `uiStore`: UI 交互状态

## 🔌 后端 API 规范

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

### WebSocket 事件类型（后端需要推送）

后端需要支持以下 10 种事件类型的实时推送：

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

### WebSocket 命令接口（后端需要处理）

前端通过 WebSocket 发送命令，后端处理后返回响应。

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

### HTTP REST API（可选补充）

如果需要补充 HTTP REST API（除了 WebSocket 外），建议实现：

```
GET  /api/health          - 健康检查
GET  /api/strategies      - 获取策略列表
GET  /api/orders          - 获取订单列表
GET  /api/connections     - 获取连接列表
GET  /api/logs            - 获取日志列表
```

### 后端实现建议

#### WebSocket 端点实现

```python
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from typing import List
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

            # 处理命令并返回响应
            response = await handle_command(command)
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

## 🔧 配置

### 环境变量

创建 `.env.local` 文件：

```env
# 后端 API 地址
NEXT_PUBLIC_API_URL=http://localhost:8000

# WebSocket 地址
NEXT_PUBLIC_WS_URL=ws://localhost:8000/api/stream

# 日志级别
NEXT_PUBLIC_LOG_LEVEL=info
```

## 🚀 构建

### 开发环境

```bash
# 启动开发服务器（支持热更新）
pnpm dev
```

### 生产环境

```bash
# 构建生产版本
pnpm build

# 启动生产服务器
pnpm start
```

## 📝 技术特性

### 事件驱动架构优势

1. **零延迟**：实时推送，无需轮询
2. **高效率**：减少网络请求，降低服务器压力
3. **一致性**：所有页面共享同一状态源
4. **可扩展**：易于添加新的事件类型
5. **类型安全**：完整的 TypeScript 类型定义

### 前端技术亮点

- **React Server Components**：提升性能
- **TypeScript 5.9**：类型安全
- **Zustand**：轻量级状态管理
- **shadcn/ui**：现代化 UI 组件
- **Tailwind CSS 4**：原子化样式
- **WebSocket**：实时双向通信

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！


---

## 🚀 部署到生产环境

### 快速部署

将项目部署到服务器：

- **[快速部署指南](./QUICK_START.md)** - 3 分钟快速部署
- **[完整部署文档](./DEPLOYMENT.md)** - 详细的阿里云部署指南
- **[自动部署脚本](./deploy.sh)** - 一键部署到服务器

### 支持的部署方式

1. **PM2 + Nginx** - 推荐方式，稳定可靠
2. **Docker** - 容器化部署，易于管理
3. **阿里云 ECS** - 完整的云端部署指南

### 快速开始

```bash
# 使用自动部署脚本
chmod +x deploy.sh
sudo ./deploy.sh
```

详细信息请参考 [QUICK_START.md](./QUICK_START.md) 和 [DEPLOYMENT.md](./DEPLOYMENT.md)。

---

## 📞 技术支持

如有问题，请：
1. 查看 [DEPLOYMENT.md](./DEPLOYMENT.md) 常见问题部分
2. 提交 Issue 到 GitHub 仓库
3. 参考项目文档

---

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！


---

## 🚀 部署到生产环境

### Nginx 部署

将项目部署到服务器：

- **[快速部署指南](./QUICK_START.md)** - 3 分钟快速部署
- **[完整部署文档](./DEPLOYMENT.md)** - 详细的 Nginx 部署指南
- **[自动部署脚本](./deploy.sh)** - 一键部署到服务器（Nginx）

### Apache 部署

如果你更喜欢使用 Apache，我们也提供了完整的 Apache 部署方案：

- **[Apache 部署指南](./APACHE_DEPLOYMENT.md)** - 详细的 Apache 部署文档
- **[Apache 自动部署脚本](./deploy-apache.sh)** - 一键部署到服务器（Apache）

### Nginx vs Apache

| 特性 | Nginx | Apache |
|------|-------|--------|
| **并发性能** | 更高 | 较低 |
| **内存占用** | 较低 | 较高 |
| **配置复杂度** | 简单 | 中等 |
| **.htaccess 支持** | ❌ | ✅ |
| **模块生态** | 有限 | 丰富 |
| **适用场景** | 高并发网站 | 传统 Web 应用 |

**推荐**：
- 如果你需要高性能和低资源占用 → 选择 **Nginx**
- 如果你需要灵活的 .htaccess 配置和丰富模块 → 选择 **Apache**

### 快速开始

#### 使用 Nginx 自动部署脚本

```bash
chmod +x deploy.sh
sudo ./deploy.sh
```

#### 使用 Apache 自动部署脚本

```bash
chmod +x deploy-apache.sh
sudo ./deploy-apache.sh
```

详细信息请参考对应的部署文档。

---

## 📞 技术支持

如有问题，请：
1. 查看 [DEPLOYMENT.md](./DEPLOYMENT.md) Nginx 部署常见问题
2. 查看 [APACHE_DEPLOYMENT.md](./APACHE_DEPLOYMENT.md) Apache 部署常见问题
3. 提交 Issue 到 GitHub 仓库
4. 参考项目文档

---

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！
