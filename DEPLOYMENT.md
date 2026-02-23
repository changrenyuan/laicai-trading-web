# 阿里云服务器部署指南

本文档将指导你如何将 Hummingbot Web UI 部署到阿里云服务器。

## 📋 目录

1. [服务器准备](#服务器准备)
2. [环境安装](#环境安装)
3. [项目部署](#项目部署)
4. [反向代理配置](#反向代理配置)
5. [进程管理](#进程管理)
6. [域名配置](#域名配置)
7. [SSL 证书](#ssl-证书)
8. [后端服务部署](#后端服务部署)
9. [常见问题](#常见问题)

---

## 服务器准备

### 1. 购买阿里云服务器

推荐配置：
- **CPU**: 2核
- **内存**: 4GB
- **硬盘**: 40GB SSD
- **操作系统**: Ubuntu 22.04 LTS 或 CentOS 8+

### 2. 登录服务器

```bash
# 使用 SSH 登录
ssh root@your-server-ip

# 或使用密钥登录
ssh -i /path/to/key.pem root@your-server-ip
```

### 3. 更新系统

**Ubuntu/Debian**:
```bash
apt update && apt upgrade -y
```

**CentOS/RHEL**:
```bash
yum update -y
```

---

## 环境安装

### 1. 安装 Node.js 24

```bash
# 安装 Node.js 24
curl -fsSL https://deb.nodesource.com/setup_24.x | bash -
apt install -y nodejs

# 验证安装
node -v
npm -v
```

### 2. 安装 pnpm

```bash
# 使用 npm 安装 pnpm
npm install -g pnpm

# 验证安装
pnpm -v
```

### 3. 安装 Nginx

```bash
# Ubuntu/Debian
apt install -y nginx

# CentOS/RHEL
yum install -y nginx

# 启动 Nginx
systemctl start nginx
systemctl enable nginx

# 验证 Nginx
nginx -v
```

### 4. 安装 PM2（进程管理器）

```bash
npm install -g pm2

# 验证安装
pm2 -v
```

### 5. 安装 Git

```bash
# Ubuntu/Debian
apt install -y git

# CentOS/RHEL
yum install -y git

# 验证安装
git --version
```

---

## 项目部署

### 1. 克隆项目

```bash
# 创建项目目录
mkdir -p /opt/web
cd /opt/web

# 克隆项目（将你的项目上传到 Git 仓库）
git clone https://github.com/your-username/hummingbot-web-ui.git

# 进入项目目录
cd hummingbot-web-ui
```

### 2. 安装依赖

```bash
# 安装项目依赖
pnpm install
```

### 3. 构建项目

```bash
# 构建生产版本
pnpm build
```

### 4. 配置环境变量

```bash
# 创建环境变量文件
cat > .env.production << 'EOF'
# 后端 API 地址
NEXT_PUBLIC_API_URL=http://localhost:8000

# WebSocket 地址
NEXT_PUBLIC_WS_URL=ws://your-domain.com/api/stream

# 日志级别
NEXT_PUBLIC_LOG_LEVEL=info
EOF
```

### 5. 启动服务

```bash
# 使用 PM2 启动服务
pm2 start "pnpm start" --name "hummingbot-web"

# 查看服务状态
pm2 status

# 查看日志
pm2 logs hummingbot-web

# 设置开机自启
pm2 startup
pm2 save
```

---

## 反向代理配置

### 1. 配置 Nginx

创建 Nginx 配置文件：

```bash
cat > /etc/nginx/sites-available/hummingbot-web-ui << 'EOF'
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # 前端静态资源
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket 代理
    location /api/stream {
        proxy_pass http://localhost:8000/api/stream;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
    }

    # 后端 API 代理
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
EOF
```

### 2. 启用配置

```bash
# 创建软链接
ln -s /etc/nginx/sites-available/hummingbot-web-ui /etc/nginx/sites-enabled/

# 测试配置
nginx -t

# 重载 Nginx
nginx -s reload
```

---

## 进程管理

### PM2 常用命令

```bash
# 启动服务
pm2 start "pnpm start" --name "hummingbot-web"

# 停止服务
pm2 stop hummingbot-web

# 重启服务
pm2 restart hummingbot-web

# 删除服务
pm2 delete hummingbot-web

# 查看日志
pm2 logs hummingbot-web

# 实时监控
pm2 monit

# 查看详细信息
pm2 show hummingbot-web

# 设置开机自启
pm2 startup
pm2 save
```

### PM2 配置文件

创建 `ecosystem.config.js`：

```javascript
module.exports = {
  apps: [
    {
      name: 'hummingbot-web',
      script: 'pnpm',
      args: 'start',
      cwd: '/opt/web/hummingbot-web-ui',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      error_file: '/var/log/pm2/hummingbot-web-error.log',
      out_file: '/var/log/pm2/hummingbot-web-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ]
};
```

使用配置文件启动：

```bash
pm2 start ecosystem.config.js
```

---

## 域名配置

### 1. 购买域名

在阿里云或其他域名注册商购买域名。

### 2. 配置 DNS 解析

在阿里云控制台添加 DNS 记录：

```
类型: A
主机记录: @
记录值: 你的服务器 IP 地址
TTL: 600
```

添加 www 子域名：

```
类型: CNAME
主机记录: www
记录值: @
TTL: 600
```

### 3. 验证 DNS 解析

```bash
# 等待 DNS 生效（通常需要 10-30 分钟）
ping your-domain.com
```

---

## SSL 证书

### 1. 使用 Let's Encrypt 免费证书

#### 安装 Certbot

```bash
# Ubuntu/Debian
apt install -y certbot python3-certbot-nginx

# CentOS/RHEL
yum install -y certbot python3-certbot-nginx
```

#### 获取证书

```bash
# 自动配置 Nginx
certbot --nginx -d your-domain.com -d www.your-domain.com

# 按照提示输入邮箱并同意条款
```

#### 自动续期

```bash
# 添加自动续期任务
crontab -e

# 添加以下行
0 0 * * * certbot renew --quiet
```

### 2. 手动配置 SSL（如果有证书文件）

修改 Nginx 配置：

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL 证书配置
    ssl_certificate /path/to/fullchain.pem;
    ssl_certificate_key /path/to/privkey.pem;

    # SSL 优化配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # 其他配置保持不变...
}

# HTTP 跳转到 HTTPS
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

---

## 后端服务部署

### 1. 安装 Python 环境

```bash
# 安装 Python 3.12
apt install -y python3.12 python3.12-venv python3-pip

# 验证安装
python3.12 --version
```

### 2. 创建虚拟环境

```bash
# 创建后端目录
mkdir -p /opt/web/hummingbot-backend
cd /opt/web/hummingbot-backend

# 创建虚拟环境
python3.12 -m venv venv

# 激活虚拟环境
source venv/bin/activate
```

### 3. 安装依赖

```bash
# 创建 requirements.txt
cat > requirements.txt << 'EOF'
fastapi==0.104.1
uvicorn[standard]==0.24.0
websockets==12.0
python-dotenv==1.0.0
pydantic==2.5.0
pydantic-settings==2.1.0
EOF

# 安装依赖
pip install -r requirements.txt
```

### 4. 创建后端服务

创建 `main.py`：

```python
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from typing import List
import json
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Hummingbot Backend API")

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"Client connected. Total: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
        logger.info(f"Client disconnected. Total: {len(self.active_connections)}")

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.error(f"Error sending message: {e}")

manager = ConnectionManager()

@app.websocket("/api/stream")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # 接收前端命令
            data = await websocket.receive_text()
            command = json.loads(data)
            logger.info(f"Received command: {command}")

            # 处理命令并返回响应
            response = await handle_command(command)
            await websocket.send_json(response)

    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(websocket)

async def handle_command(command: dict) -> dict:
    cmd = command.get("cmd")

    if cmd == "start":
        return {"type": "system_status", "status": "success", "message": "Strategy started"}
    elif cmd == "stop":
        return {"type": "system_status", "status": "success", "message": "Strategy stopped"}
    elif cmd == "get_system_status":
        return {
            "type": "system_status",
            "uptime": 86400,
            "bot_status": "running",
            "active_strategies": 2,
            "total_profit": 1234.56,
            "total_trades": 42,
            "success_rate": 95.0
        }
    else:
        return {"type": "error", "message": f"Unknown command: {cmd}"}

@app.get("/")
async def root():
    return {"message": "Hummingbot Backend API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
```

### 5. 使用 PM2 启动后端

```bash
# 启动后端服务
pm2 start "source venv/bin/activate && uvicorn main:app --host 0.0.0.0 --port 8000" \
  --name "hummingbot-backend" \
  --cwd /opt/web/hummingbot-backend

# 查看状态
pm2 status

# 保存配置
pm2 save
```

---

## 常见问题

### 1. 端口被占用

```bash
# 查看端口占用
netstat -tuln | grep 5000
netstat -tuln | grep 8000

# 或使用 ss 命令
ss -tuln | grep 5000
ss -tuln | grep 8000

# 杀死进程
kill -9 <PID>
```

### 2. Nginx 403 错误

```bash
# 检查 Nginx 用户
ps -ef | grep nginx

# 修改目录权限
chown -R www-data:www-data /opt/web/hummingbot-web-ui
chmod -R 755 /opt/web/hummingbot-web-ui
```

### 3. WebSocket 连接失败

检查 Nginx 配置中的 WebSocket 代理设置：

```nginx
location /api/stream {
    proxy_pass http://localhost:8000/api/stream;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    # ... 其他配置
}
```

### 4. PM2 服务无法启动

```bash
# 查看详细错误
pm2 logs hummingbot-web --err

# 检查环境变量
pm2 env hummingbot-web

# 删除并重新启动
pm2 delete hummingbot-web
pm2 start ecosystem.config.js
```

### 5. SSL 证书过期

```bash
# 手动续期
certbot renew

# 测试续期
certbot renew --dry-run
```

### 6. 内存不足

```bash
# 检查内存使用
free -h

# 增加 Swap
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile

# 永久启用 Swap
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

---

## 安全加固

### 1. 配置防火墙

```bash
# 安装 UFW
apt install -y ufw

# 允许 SSH
ufw allow 22/tcp

# 允许 HTTP 和 HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# 启用防火墙
ufw enable

# 查看状态
ufw status
```

### 2. 禁用 root 登录

```bash
# 编辑 SSH 配置
vi /etc/ssh/sshd_config

# 修改以下配置
PermitRootLogin no
PasswordAuthentication no

# 重启 SSH 服务
systemctl restart sshd
```

### 3. 配置 Fail2Ban

```bash
# 安装 Fail2Ban
apt install -y fail2ban

# 启动服务
systemctl start fail2ban
systemctl enable fail2ban
```

---

## 监控与日志

### 1. 查看 PM2 日志

```bash
# 查看实时日志
pm2 logs

# 查看指定应用日志
pm2 logs hummingbot-web

# 查看错误日志
pm2 logs hummingbot-web --err
```

### 2. 查看 Nginx 日志

```bash
# 访问日志
tail -f /var/log/nginx/access.log

# 错误日志
tail -f /var/log/nginx/error.log
```

### 3. 系统监控

```bash
# 安装 htop
apt install -y htop

# 查看系统资源
htop

# 查看磁盘使用
df -h

# 查看内存使用
free -h
```

---

## 更新部署

### 1. 更新代码

```bash
cd /opt/web/hummingbot-web-ui

# 拉取最新代码
git pull origin main

# 安装新依赖
pnpm install

# 重新构建
pnpm build

# 重启服务
pm2 restart hummingbot-web
```

### 2. 回滚版本

```bash
# 查看历史版本
git log --oneline

# 回滚到指定版本
git checkout <commit-hash>

# 重新构建和部署
pnpm install
pnpm build
pm2 restart hummingbot-web
```

---

## 备份策略

### 1. 数据库备份

```bash
# 创建备份脚本
cat > /opt/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/backup"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# 备份配置文件
tar -czf $BACKUP_DIR/config_$DATE.tar.gz /opt/web/hummingbot-web-ui/.env

# 删除 7 天前的备份
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
EOF

# 添加执行权限
chmod +x /opt/backup.sh

# 添加到 crontab（每天凌晨 2 点执行）
crontab -e
# 添加：0 2 * * * /opt/backup.sh
```

---

## 成本估算

### 阿里云 ECS 服务器

| 配置 | 价格（月费） |
|------|------------|
| 2核4GB | ¥100-150 |
| 2核8GB | ¥200-250 |
| 4核8GB | ¥300-400 |

### 域名费用

- `.com`: ¥50-100/年
- `.cn`: ¥30-50/年
- `.net`: ¥50-80/年

### 总成本

**最低配置**：¥150-200/月（服务器 + 域名）

---

## 总结

完成以上步骤后，你的 Hummingbot Web UI 将成功部署到阿里云服务器，具备以下特性：

✅ 使用 PM2 管理进程，自动重启
✅ 使用 Nginx 反向代理，支持 WebSocket
✅ 配置 SSL 证书，启用 HTTPS
✅ 开机自启，持久化运行
✅ 完整的日志和监控
✅ 安全加固配置

如有问题，请查看日志文件或参考常见问题部分。
