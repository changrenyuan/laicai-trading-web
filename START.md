# 🚀 快速启动指南（更新端口）

## 📌 端口配置

- **后端**: 5000
- **前端**: 8000

---

## ⚡ 快速启动

### 一键启动（推荐）

```bash
./start-all.sh
```

### 分别启动

#### 1. 启动后端（端口 5000）

```bash
cd backend
python api.py
```

#### 2. 启动前端（端口 8000）

新开一个终端：

```bash
cd /workspace/projects
pnpm dev --port 8000 --host
```

---

## 🌐 访问地址

### 前端
```
http://localhost:8000
```

### 后端
```
API 文档: http://localhost:5000/docs
WebSocket: ws://localhost:5000/api/stream
健康检查: http://localhost:5000/api/health
```

---

## 🧪 验证

### 1. 检查后端

```bash
curl http://localhost:5000/api/health
```

应该返回：
```json
{
  "status": "healthy",
  "version": "2.0.0",
  "ws_connections": 0
}
```

### 2. 检查前端

打开浏览器访问：http://localhost:8000

打开开发者工具（F12）→ Console，应该看到：
```
[WSProvider] Initializing WebSocket connection...
[WS] Client connected. Total connections: 1
```

### 3. 测试日志页面

访问：http://localhost:8000/logs

预期效果：
- ✅ 显示"WebSocket 已连接"
- ✅ 日志每2秒自动推送
- ✅ 零轮询请求

---

## 🔧 配置文件

### 前端环境变量 (`.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_WS_URL=ws://localhost:5000/api/stream
```

### 前端端口配置 (`.coze`)

```toml
[dev]
run = ["pnpm", "dev", "--port", "8000", "--host"]
```

### 后端端口配置 (`backend/api.py`)

```python
uvicorn.run(app, host="0.0.0.0", port=5000)
```

---

## 📚 详细文档

- [端口配置说明](PORTS.md)
- [事件驱动架构](EVENT_DRIVEN_ARCHITECTURE.md)
- [部署指南](DEPLOYMENT.md)

---

**启动成功！前端：8000，后端：5000** 🎉
