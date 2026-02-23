# 快速部署指南

本文档提供了最简化的部署步骤，帮助你快速将 Hummingbot Web UI 部署到服务器。

## 🚀 方法一：使用自动部署脚本（推荐）

### 前置准备

1. 修改 `deploy.sh` 中的配置参数：

```bash
# 编辑部署脚本
vi deploy.sh

# 修改以下配置
DOMAIN="your-domain.com"           # 你的域名
ADMIN_EMAIL="your-email@example.com" # 你的邮箱
GIT_REPO="https://github.com/your-username/hummingbot-web-ui.git" # 你的 Git 仓库
```

2. 上传脚本到服务器：

```bash
# 本地上传脚本
scp deploy.sh root@your-server-ip:/root/

# 或使用 Git 克隆项目
git clone https://github.com/your-username/hummingbot-web-ui.git
```

### 执行部署

```bash
# 登录服务器
ssh root@your-server-ip

# 进入脚本目录
cd /root

# 添加执行权限
chmod +x deploy.sh

# 执行部署
sudo ./deploy.sh
```

### 部署完成

访问你的域名：`http://your-domain.com`

---

## 📦 方法二：手动部署

### 步骤 1：安装 Node.js 和 pnpm

```bash
# 安装 Node.js 24
curl -fsSL https://deb.nodesource.com/setup_24.x | bash -
apt install -y nodejs

# 安装 pnpm
npm install -g pnpm
```

### 步骤 2：克隆项目

```bash
# 创建项目目录
mkdir -p /opt/web
cd /opt/web

# 克隆项目
git clone https://github.com/your-username/hummingbot-web-ui.git
cd hummingbot-web-ui
```

### 步骤 3：安装依赖

```bash
pnpm install
```

### 步骤 4：构建项目

```bash
pnpm build
```

### 步骤 5：启动服务

```bash
# 使用 PM2 启动
npm install -g pm2
pm2 start "pnpm start" --name hummingbot-web

# 设置开机自启
pm2 startup
pm2 save
```

### 步骤 6：配置 Nginx

```bash
# 安装 Nginx
apt install -y nginx

# 创建配置文件
cat > /etc/nginx/sites-available/hummingbot-web-ui << 'EOF'
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }

    location /api/stream {
        proxy_pass http://localhost:8000/api/stream;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
EOF

# 启用配置
ln -s /etc/nginx/sites-available/hummingbot-web-ui /etc/nginx/sites-enabled/
nginx -t
nginx -s reload
```

### 步骤 7：配置 SSL（可选）

```bash
# 安装 Certbot
apt install -y certbot python3-certbot-nginx

# 获取证书
certbot --nginx -d your-domain.com
```

---

## 🐳 方法三：使用 Docker 部署

### 创建 Dockerfile

```dockerfile
FROM node:24-alpine AS builder

WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm

# 复制依赖文件
COPY package.json pnpm-lock.yaml ./

# 安装依赖
RUN pnpm install

# 复制源代码
COPY . .

# 构建项目
RUN pnpm build

# 生产环境
FROM node:24-alpine

WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm

# 复制依赖和构建产物
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# 暴露端口
EXPOSE 5000

# 启动服务
CMD ["pnpm", "start"]
```

### 创建 docker-compose.yml

```yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=http://localhost:8000
      - NEXT_PUBLIC_WS_URL=ws://your-domain.com/api/stream
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - web
    restart: unless-stopped
```

### 启动服务

```bash
# 构建并启动
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

---

## 📊 部署检查清单

部署完成后，请检查以下项目：

- [ ] 前端服务运行正常（端口 5000）
- [ ] Nginx 配置正确并已重载
- [ ] 域名 DNS 解析正确
- [ ] 可以通过域名访问网站
- [ ] WebSocket 连接正常
- [ ] PM2 服务已设置为开机自启
- [ ] 防火墙配置正确（开放 80、443 端口）
- [ ] SSL 证书已安装（如果使用 HTTPS）
- [ ] 日志文件正常写入
- [ ] 定期备份配置

---

## 🔧 常用命令

### 查看服务状态

```bash
# PM2 状态
pm2 status

# Nginx 状态
systemctl status nginx
```

### 查看日志

```bash
# PM2 日志
pm2 logs hummingbot-web

# Nginx 日志
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### 重启服务

```bash
# 重启 PM2 服务
pm2 restart hummingbot-web

# 重启 Nginx
nginx -s reload
# 或
systemctl restart nginx
```

### 更新代码

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

---

## 🆘 遇到问题？

### 查看详细部署文档

请参考 [DEPLOYMENT.md](./DEPLOYMENT.md) 获取完整的部署指南。

### 常见问题

1. **端口被占用**
   ```bash
   lsof -i :5000
   kill -9 <PID>
   ```

2. **权限问题**
   ```bash
   chown -R www-data:www-data /opt/web/hummingbot-web-ui
   ```

3. **Nginx 配置错误**
   ```bash
   nginx -t
   ```

4. **PM2 服务无法启动**
   ```bash
   pm2 logs hummingbot-web --err
   ```

---

## 📞 获取帮助

如有问题，请：

1. 查看日志文件
2. 检查服务状态
3. 参考 [DEPLOYMENT.md](./DEPLOYMENT.md) 常见问题部分
4. 提交 Issue 到 GitHub 仓库

---

## 📝 版本信息

- 前端框架: Next.js 16
- Node.js 版本: 24
- 部署方式: PM2 + Nginx
- 支持协议: HTTP/HTTPS, WebSocket

祝部署顺利！🎉
