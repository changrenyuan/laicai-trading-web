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
```

## 🔌 API 端点

### 仪表盘
- `GET /api/dashboard` - 获取仪表盘数据

### 策略
- `GET /api/strategies` - 获取所有策略
- `POST /api/strategies` - 创建新策略
- `POST /api/strategies/{id}/start` - 启动策略
- `POST /api/strategies/{id}/stop` - 停止策略

### 订单
- `GET /api/orders` - 获取订单列表（支持筛选）

### 连接
- `GET /api/connections` - 获取所有连接
- `POST /api/connections` - 创建新连接

### 日志
- `GET /api/logs` - 获取日志列表（支持筛选）

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
