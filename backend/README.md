# 后端 API 快速启动指南

## 📦 安装依赖

```bash
cd backend
pip install -r requirements.txt
```

## 🚀 启动后端服务

```bash
# 方式一：直接运行
python api.py

# 方式二：使用 uvicorn
uvicorn api:app --host 0.0.0.0 --port 8000 --reload

# 方式三：生产环境
uvicorn api:app --host 0.0.0.0 --port 8000 --workers 4
```

## 📚 API 文档

启动后，访问以下地址查看 API 文档：

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

## 🔌 API 端点

### 仪表盘
- `GET /api/dashboard` - 获取仪表盘数据

### 策略
- `GET /api/strategies` - 获取所有策略
- `GET /api/strategies/{id}` - 获取指定策略
- `POST /api/strategies` - 创建新策略
- `POST /api/strategies/{id}/start` - 启动策略
- `POST /api/strategies/{id}/stop` - 停止策略
- `DELETE /api/strategies/{id}` - 删除策略

### 订单
- `GET /api/orders` - 获取订单列表（支持筛选）
  - 查询参数: `status`, `strategy`, `order_type`
- `GET /api/orders/{id}` - 获取指定订单

### 连接
- `GET /api/connections` - 获取所有连接
- `POST /api/connections` - 创建新连接
- `DELETE /api/connections/{id}` - 删除连接

### 日志
- `GET /api/logs` - 获取日志列表（支持筛选）
  - 查询参数: `level`, `source`, `limit`

### 健康
- `GET /api/health` - 健康检查

## 🧪 测试 API

```bash
# 测试健康检查
curl http://localhost:8000/api/health

# 获取仪表盘数据
curl http://localhost:8000/api/dashboard

# 获取所有策略
curl http://localhost:8000/api/strategies

# 创建新策略
curl -X POST http://localhost:8000/api/strategies \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Strategy",
    "type": "Pure Market Making",
    "exchange": "Binance",
    "pair": "ETH/USDT"
  }'

# 启动策略
curl -X POST http://localhost:8000/api/strategies/1/start

# 获取订单（带筛选）
curl "http://localhost:8000/api/orders?status=filled&strategy=PMM Strategy"
```

## 🔗 前端对接

在前端项目中创建 `.env.local` 文件：

```env
PYTHON_API_URL=http://localhost:8000
```

然后修改前端代码，从 Python 后端获取数据。参考 `DEPLOYMENT.md` 中的详细说明。

## 📝 开发说明

### 添加新端点

```python
@app.get("/api/new-endpoint")
async def new_endpoint():
    return {"message": "Hello World"}
```

### 使用数据库

可以集成 SQLite、PostgreSQL 或其他数据库：

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "sqlite:///./hummingbot.db"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
```

### 集成 Hummingbot

可以调用 Hummingbot 的命令行接口或使用 Hummingbot 的 Python API：

```python
import subprocess

def start_strategy(strategy_id):
    result = subprocess.run(
        ["hummingbot", "start", str(strategy_id)],
        capture_output=True,
        text=True
    )
    return result.stdout
```

## 🔒 安全建议

1. 使用环境变量存储敏感信息（API 密钥等）
2. 实现认证和授权（JWT、OAuth 等）
3. 添加速率限制
4. 启用 HTTPS（生产环境）
5. 验证和清理所有输入数据

## 🚨 故障排查

### 端口被占用
```bash
# 查找占用 8000 端口的进程
lsof -i :8000

# 杀死进程
kill -9 <PID>
```

### CORS 错误
检查 `app.add_middleware` 中的 `allow_origins` 配置

### 依赖问题
```bash
pip install --upgrade pip
pip install -r requirements.txt --force-reinstall
```
