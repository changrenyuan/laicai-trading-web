# 端口更新完成

## ✅ 已完成

### 1. 后端端口配置
- ✅ 修改为端口 **5000**
- ✅ 更新 WebSocket 地址：`ws://localhost:5000/api/stream`
- ✅ 更新 API 文档地址：`http://localhost:5000/docs`
- ✅ 更新命令接口：`http://localhost:5000/api/command`

### 2. 前端端口配置
- ✅ 修改为端口 **8000**
- ✅ 更新 `.coze` 配置文件
- ✅ 更新环境变量配置

### 3. 配置文件更新
- ✅ `.env.local` - 前端环境变量（指向后端 5000）
- ✅ `.env.example` - 环境变量示例
- ✅ `.coze` - 前端启动配置（端口 8000）
- ✅ `start-all.sh` - 一键启动脚本
- ✅ `backend/api.py` - 后端 API（端口 5000）
- ✅ `PORTS.md` - 端口配置说明文档

---

## 🚀 快速启动

### 方式一：一键启动（推荐）

```bash
./start-all.sh
```

### 方式二：分别启动

**启动后端（端口 5000）：**
```bash
cd backend
python api.py
```

**启动前端（端口 8000）：**
```bash
cd ..
pnpm dev --port 8000 --host
```

---

## 📍 访问地址

### 前端
- 🌐 **地址**: http://localhost:8000

### 后端
- 📚 **API 文档**: http://localhost:5000/docs
- 🔌 **WebSocket**: ws://localhost:5000/api/stream
- 📝 **命令接口**: http://localhost:5000/api/command
- 🔍 **健康检查**: http://localhost:5000/api/health

---

## 🧪 测试

### 1. 测试后端
```bash
curl http://localhost:5000/api/health
```

### 2. 测试前端
打开浏览器访问：http://localhost:8000

### 3. 测试 WebSocket
1. 打开浏览器开发者工具（F12）
2. 切换到 Network 标签
3. 筛选 WS
4. 确认连接成功

---

## 📊 端口分配

| 服务 | 端口 | 用途 |
|------|------|------|
| 后端 API | 5000 | FastAPI 服务、WebSocket |
| 前端 | 8000 | Next.js 开发服务器 |

---

## 🔧 环境变量

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_WS_URL=ws://localhost:5000/api/stream
```

---

**端口配置更新完成！**

- 后端：5000 ✅
- 前端：8000 ✅
