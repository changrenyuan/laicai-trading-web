# 🚀 快速开始指南

## 一、推送到 GitHub

### 方式 1: HTTPS（推荐新手）

```bash
cd /workspace/projects

# 查看当前状态
git status

# 添加所有更改
git add .

# 提交更改
git commit -m "feat: 复刻 Hummingbot Web UI，实现完整的交易机器人管理界面"

# 添加远程仓库（如果还没有）
git remote add origin https://github.com/changrenyuan/laicai-trading-web.git

# 推送到 GitHub
git push -u origin main
```

**执行 `git push` 时会提示输入：**
- **Username**: 你的 GitHub 用户名（例如：changrenyuan）
- **Password**: 你的 GitHub Personal Access Token（不是密码！）

### 如何获取 Personal Access Token:

1. 访问 https://github.com/settings/tokens
2. 点击 "Generate new token" → "Generate new token (classic)"
3. 勾选 `repo` 权限
4. 生成并复制 token

### 方式 2: SSH（推荐有经验的开发者）

```bash
# 生成 SSH key（如果还没有）
ssh-keygen -t ed25519 -C "your_email@example.com"

# 添加 SSH key 到 GitHub
cat ~/.ssh/id_ed25519.pub
# 复制输出内容到 GitHub Settings → SSH and GPG keys

# 测试 SSH 连接
ssh -T git@github.com

# 修改远程仓库为 SSH
git remote set-url origin git@github.com:changrenyuan/laicai-trading-web.git

# 推送
git push -u origin main
```

---

## 二、如何运行项目

### 快速启动（一键启动前后端）

```bash
cd /workspace/projects

# 运行启动脚本
./start-all.sh
```

脚本会自动：
- ✅ 启动 Python 后端 (端口 8000)
- ✅ 启动 Next.js 前端 (端口 5000)
- ✅ 创建日志目录
- ✅ 保存进程 PID

**停止服务：**
- 按 `Ctrl+C` 或
- `kill $(cat logs/backend.pid) $(cat logs/frontend.pid)`

---

### 分步启动

#### 1. 启动后端

```bash
cd /workspace/projects/backend

# 方式一：使用虚拟环境（推荐）
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python api.py

# 方式二：直接运行（不推荐生产环境）
pip install -r requirements.txt
python api.py

# 方式三：使用 uvicorn（支持热重载）
uvicorn api:app --host 0.0.0.0 --port 8000 --reload
```

后端启动成功后会显示：
```
🚀 Starting Hummingbot Trading API...
📚 API Documentation: http://localhost:8000/docs
🔍 API Health Check: http://localhost:8000/api/health
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

#### 2. 启动前端（新终端）

```bash
cd /workspace/projects

# 安装依赖（首次）
pnpm install

# 启动开发服务器
coze dev

# 或
pnpm dev
```

前端启动成功后，访问 http://localhost:5000

---

### 测试后端 API

```bash
cd /workspace/projects

# 运行测试脚本
python3 test-api.py
```

---

## 三、后端 Python 如何对接前端

### 架构说明

```
浏览器 (http://localhost:5000)
    ↓
Next.js 前端
    ↓
API 调用 → Python 后端 (http://localhost:8000)
    ↓
FastAPI 处理 → 数据库/交易所 API
```

### 对接步骤

#### 步骤 1: 配置环境变量

在项目根目录创建 `.env.local` 文件：

```env
PYTHON_API_URL=http://localhost:8000
```

#### 步骤 2: 创建 API 客户端

创建文件 `src/lib/api-client.ts`：

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}

// 仪表盘 API
export const dashboardAPI = {
  getData: () => fetchAPI('/api/dashboard'),
};

// 策略 API
export const strategiesAPI = {
  getAll: () => fetchAPI('/api/strategies'),
  getById: (id: number) => fetchAPI(`/api/strategies/${id}`),
  create: (data: any) => fetchAPI('/api/strategies', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  start: (id: number) => fetchAPI(`/api/strategies/${id}/start`, {
    method: 'POST',
  }),
  stop: (id: number) => fetchAPI(`/api/strategies/${id}/stop`, {
    method: 'POST',
  }),
};

// 订单 API
export const ordersAPI = {
  getAll: (params?: any) => {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return fetchAPI(`/api/orders${query}`);
  },
};

// 连接 API
export const connectionsAPI = {
  getAll: () => fetchAPI('/api/connections'),
  create: (data: any) => fetchAPI('/api/connections', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

// 日志 API
export const logsAPI = {
  getAll: (params?: any) => {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return fetchAPI(`/api/logs${query}`);
  },
};
```

#### 步骤 3: 修改页面组件

示例：修改仪表盘页面

```typescript
// src/app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboardAPI, strategiesAPI } from '@/lib/api-client';

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await dashboardAPI.getData();
      setDashboardData(data);
      setError(null);
    } catch (err) {
      setError('加载仪表盘数据失败');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8">加载中...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500">{error}</div>;
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card">
        {/* ... */}
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-background p-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>

        {/* 使用真实数据 */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${dashboardData?.totalProfit || 0}
              </div>
            </CardContent>
          </Card>
          {/* ... */}
        </div>
      </main>
    </div>
  );
}
```

#### 步骤 4: 创建自定义 Hooks

```typescript
// src/hooks/use-dashboard.ts
import { useState, useEffect } from 'react';
import { dashboardAPI } from '@/lib/api-client';

export function useDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    dashboardAPI.getData()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}

// src/hooks/use-strategies.ts
import { useState, useEffect } from 'react';
import { strategiesAPI } from '@/lib/api-client';

export function useStrategies() {
  const [strategies, setStrategies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadStrategies = async () => {
    try {
      const data = await strategiesAPI.getAll();
      setStrategies(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStrategies();
  }, []);

  const createStrategy = async (strategyData: any) => {
    await strategiesAPI.create(strategyData);
    loadStrategies(); // 刷新列表
  };

  const startStrategy = async (id: number) => {
    await strategiesAPI.start(id);
    loadStrategies();
  };

  const stopStrategy = async (id: number) => {
    await strategiesAPI.stop(id);
    loadStrategies();
  };

  return { strategies, loading, createStrategy, startStrategy, stopStrategy };
}
```

### 测试对接

1. 确保后端运行在 `http://localhost:8000`
2. 确保前端运行在 `http://localhost:5000`
3. 访问前端页面，检查是否正确加载后端数据
4. 打开浏览器开发者工具 → Network 标签
5. 查看是否有 API 请求发出，返回数据是否正确

---

## 四、常见问题

### 1. 前端无法连接后端

**问题**: 前端显示 "Failed to fetch"

**解决方案**:
- 确认后端已启动: `curl http://localhost:8000/api/health`
- 检查 CORS 配置: `backend/api.py` 中的 `allow_origins`
- 确认 `.env.local` 文件中的 `PYTHON_API_URL` 配置正确

### 2. 端口被占用

**问题**: `Address already in use`

**解决方案**:
```bash
# 查找占用端口的进程
lsof -i :5000  # 前端
lsof -i :8000  # 后端

# 杀死进程
kill -9 <PID>
```

### 3. Git 推送失败

**问题**: `remote: Permission denied`

**解决方案**:
- 检查是否有仓库权限
- 使用 Personal Access Token 而非密码
- 确认远程仓库 URL 正确

### 4. 依赖安装失败

**问题**: `npm install` 或 `pip install` 失败

**解决方案**:
```bash
# 清理缓存
pnpm store prune

# 重新安装
rm -rf node_modules
pnpm install

# Python
pip install --upgrade pip
pip install -r requirements.txt --force-reinstall
```

---

## 五、生产部署

### Docker 部署

创建 `Dockerfile`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# 安装 Python 依赖
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 复制后端代码
COPY backend/api.py .

EXPOSE 8000

CMD ["uvicorn", "api:app", "--host", "0.0.0.0", "--port", "8000"]
```

构建和运行：

```bash
docker build -t hummingbot-api .
docker run -p 8000:8000 hummingbot-api
```

### Vercel 部署（前端）

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel
```

---

## 📚 更多资源

- [完整部署文档](DEPLOYMENT.md)
- [后端 API 文档](backend/README.md)
- [项目 README](README.md)
- [API Swagger UI](http://localhost:8000/docs)

---

**祝你使用愉快！如有问题，请查看文档或提交 Issue。**
