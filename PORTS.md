# 端口配置说明

## 📍 当前端口配置

### 后端
- **端口**: `5000`
- **协议**: HTTP / WebSocket
- **地址**: `http://localhost:5000`
- **WebSocket**: `ws://localhost:5000/api/stream`
- **API 文档**: `http://localhost:5000/docs`

### 前端
- **端口**: `8000`
- **协议**: HTTP
- **地址**: `http://localhost:8000`

---

## 🚀 启动方式

### 方式一：一键启动（推荐）

```bash
./start-all.sh
```

这会自动启动：
- 后端服务（端口 5000）
- 前端服务（端口 8000）

### 方式二：分别启动

#### 启动后端

```bash
cd backend
python api.py
```

后端启动后，访问：http://localhost:5000/docs

#### 启动前端（新终端）

```bash
cd /workspace/projects
pnpm dev --port 8000 --host
```

前端启动后，访问：http://localhost:8000

---

## 🔧 配置文件

### 前端环境变量 (`.env.local`)

```env
# 后端 API 地址
NEXT_PUBLIC_API_URL=http://localhost:5000

# WebSocket 地址
NEXT_PUBLIC_WS_URL=ws://localhost:5000/api/stream
```

### 前端端口配置 (`.coze`)

```toml
[dev]
run = ["pnpm", "dev", "--port", "8000", "--host"]
```

### 后端端口配置 (`backend/api.py`)

```python
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)
```

---

## 🧪 测试连接

### 1. 测试后端

```bash
curl http://localhost:5000/api/health
```

预期输出：
```json
{
  "status": "healthy",
  "timestamp": "...",
  "version": "2.0.0",
  "ws_connections": 0
}
```

### 2. 测试前端

打开浏览器访问：http://localhost:8000

打开开发者工具（F12）→ Console，应该看到：
```
[WSProvider] Initializing WebSocket connection...
[WS] Client connected. Total connections: 1
```

### 3. 测试 WebSocket

打开浏览器开发者工具 → Network 标签，筛选 WS，应该看到：
```
WS stream  Status: 101 Switching Protocols
```

---

## 🔍 常见问题

### Q: 端口被占用怎么办？

**查看占用进程：**
```bash
# 查看端口 5000（后端）
lsof -i :5000

# 查看端口 8000（前端）
lsof -i :8000
```

**杀死进程：**
```bash
kill -9 <PID>
```

### Q: 前端无法连接后端？

**检查：**
1. 后端是否在运行：`curl http://localhost:5000/api/health`
2. 环境变量是否正确：`cat .env.local`
3. 检查浏览器 Console 的错误信息

### Q: 如何修改端口？

#### 修改后端端口

1. 修改 `backend/api.py`：
```python
uvicorn.run(app, host="0.0.0.0", port=新端口)
```

2. 修改 `.env.local`：
```env
NEXT_PUBLIC_API_URL=http://localhost:新端口
NEXT_PUBLIC_WS_URL=ws://localhost:新端口/api/stream
```

#### 修改前端端口

修改 `.coze`：
```toml
[dev]
run = ["pnpm", "dev", "--port", 新端口", "--host"]
```

---

## 📊 端口占用检查

```bash
# 检查所有端口占用
lsof -i -P -n | grep LISTEN

# 只检查本项目端口
lsof -i :5000 -i :8000
```

---

## 🔐 防火墙配置

如果需要在远程服务器上访问，需要开放端口：

```bash
# Ubuntu/Debian
sudo ufw allow 5000/tcp
sudo ufw allow 8000/tcp

# CentOS/RHEL
sudo firewall-cmd --permanent --add-port=5000/tcp
sudo firewall-cmd --permanent --add-port=8000/tcp
sudo firewall-cmd --reload
```

---

## 📝 生产环境建议

1. **使用 Nginx 反向代理**
2. **启用 HTTPS**
3. **配置 CORS 白名单**
4. **限制 IP 访问**
5. **使用环境变量管理密钥**

---

**端口配置完成！后端：5000，前端：8000** 🎉
