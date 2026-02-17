# 端口更新说明

## 调整原因

根据 Vibe Coding 规范，沙箱预览服务必须运行在 **5000 端口**。之前的配置导致预览无法访问。

## 新端口配置

| 服务 | 端口 | 说明 |
|------|------|------|
| 前端 (Next.js) | **5000** | 预览服务端口，Web UI 访问地址 |
| 后端 (FastAPI) | **8000** | API 服务端口 |

## 更新文件

1. **.coze** - 开发环境配置
   - `[dev].run`: `pnpm dev --port 5000`

2. **.env.local** - 环境变量
   - `NEXT_PUBLIC_API_URL`: `http://localhost:8000`
   - `NEXT_PUBLIC_WS_URL`: `ws://localhost:8000/api/stream`

3. **start-all.sh** - 启动脚本
   - 前端端口：5000
   - 后端端口：8000

## 访问地址

- **Web UI 预览**: http://localhost:5000
- **API 文档**: http://localhost:8000/docs
- **WebSocket**: ws://localhost:8000/api/stream
- **健康检查**: http://localhost:8000/api/health

## 启动命令

```bash
# 启动前端（5000 端口）
pnpm dev --port 5000

# 启动后端（8000 端口）
cd backend && python api.py

# 或者使用启动脚本
./start-all.sh
```
