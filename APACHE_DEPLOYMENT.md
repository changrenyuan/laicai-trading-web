# Apache 服务器部署指南

本文档将指导你如何使用 Apache 作为反向代理部署 Hummingbot Web UI。

## 📋 目录

1. [Apache 优势](#apache-优势)
2. [环境准备](#环境准备)
3. [安装 Apache](#安装-apache)
4. [配置模块](#配置模块)
5. [项目部署](#项目部署)
6. [Apache 配置](#apache-配置)
7. [SSL 证书](#ssl-证书)
8. [后端服务部署](#后端服务部署)
9. [常见问题](#常见问题)

---

## Apache 优势

### 为什么选择 Apache？

- ✅ **成熟稳定**：Apache 是最古老的 Web 服务器之一，极其稳定
- ✅ **丰富的模块**：拥有大量的第三方模块支持
- ✅ **灵活配置**：支持 .htaccess 文件，便于用户自定义
- ✅ **广泛兼容**：几乎所有的主机服务商都支持
- ✅ **强大的权限控制**：细粒度的访问控制
- ✅ **社区支持**：拥有庞大的用户社区和文档

### Apache vs Nginx

| 特性 | Apache | Nginx |
|------|--------|-------|
| **并发处理** | 进程/线程模型 | 事件驱动模型 |
| **内存占用** | 较高 | 较低 |
| **静态文件** | 较慢 | 较快 |
| **动态内容** | 较好 | 一般 |
| **配置复杂度** | 中等 | 简单 |
| **.htaccess** | 支持 | 不支持 |
| **模块生态** | 丰富 | 有限 |
| **适用场景** | 传统应用、动态网站 | 高并发、静态资源 |

---

## 环境准备

### 1. 系统要求

- **操作系统**: Ubuntu 22.04+ / CentOS 8+
- **Node.js**: 24+
- **内存**: 至少 2GB RAM
- **硬盘**: 至少 20GB

### 2. 登录服务器

```bash
ssh root@your-server-ip
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

## 安装 Apache

### Ubuntu/Debian

```bash
# 安装 Apache
apt install -y apache2

# 启动 Apache
systemctl start apache2
systemctl enable apache2

# 验证安装
apache2 -v
```

### CentOS/RHEL

```bash
# 安装 Apache（httpd）
yum install -y httpd

# 启动 Apache
systemctl start httpd
systemctl enable httpd

# 验证安装
httpd -v
```

### 验证 Apache 运行

```bash
# 检查状态
systemctl status apache2    # Ubuntu/Debian
# 或
systemctl status httpd       # CentOS/RHEL

# 访问服务器 IP
curl http://localhost
```

---

## 配置模块

### 必需的 Apache 模块

```bash
# Ubuntu/Debian
a2enmod rewrite
a2enmod proxy
a2enmod proxy_http
a2enmod proxy_wstunnel
a2enmod ssl
a2enmod headers
a2enmod deflate

# 重启 Apache
systemctl restart apache2
```

### CentOS/RHEL

编辑 `/etc/httpd/conf.modules.d/00-base.conf`，确保以下模块被启用：

```apache
LoadModule rewrite_module modules/mod_rewrite.so
LoadModule proxy_module modules/mod_proxy.so
LoadModule proxy_http_module modules/mod_proxy_http.so
LoadModule proxy_wstunnel_module modules/mod_proxy_wstunnel.so
LoadModule ssl_module modules/mod_ssl.so
LoadModule headers_module modules/mod_headers.so
LoadModule deflate_module modules/mod_deflate.so
```

重启 Apache：

```bash
systemctl restart httpd
```

### 模块说明

| 模块 | 用途 |
|------|------|
| `mod_rewrite` | URL 重写 |
| `mod_proxy` | 反向代理 |
| `mod_proxy_http` | HTTP 代理 |
| `mod_proxy_wstunnel` | WebSocket 代理（必需）|
| `mod_ssl` | SSL 支持 |
| `mod_headers` | 自定义 HTTP 头 |
| `mod_deflate` | 压缩支持 |

---

## 项目部署

### 1. 安装 Node.js 24

```bash
curl -fsSL https://deb.nodesource.com/setup_24.x | bash -
apt install -y nodejs

# 验证安装
node -v
```

### 2. 安装 pnpm

```bash
npm install -g pnpm
```

### 3. 安装 PM2

```bash
npm install -g pm2
```

### 4. 克隆项目

```bash
mkdir -p /opt/web
cd /opt/web
git clone https://github.com/your-username/hummingbot-web-ui.git
cd hummingbot-web-ui
```

### 5. 安装依赖

```bash
pnpm install
```

### 6. 构建项目

```bash
pnpm build
```

### 7. 配置环境变量

```bash
cat > .env.production << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://your-domain.com/api/stream
NEXT_PUBLIC_LOG_LEVEL=info
EOF
```

### 8. 启动服务

```bash
pm2 start "pnpm start" --name hummingbot-web
pm2 save
pm2 startup
```

---

## Apache 配置

### 1. 创建虚拟主机配置

**Ubuntu/Debian** - 创建文件 `/etc/apache2/sites-available/hummingbot-web-ui.conf`：

```apache
<VirtualHost *:80>
    ServerName your-domain.com
    ServerAlias www.your-domain.com

    # 日志配置
    ErrorLog ${APACHE_LOG_DIR}/hummingbot-web-ui-error.log
    CustomLog ${APACHE_LOG_DIR}/hummingbot-web-ui-access.log combined

    # 启用 WebSocket 代理
    RewriteEngine On

    # 前端静态资源代理
    ProxyPass / http://localhost:5000/
    ProxyPassReverse / http://localhost:5000/

    # WebSocket 代理（关键配置）
    # 注意：WebSocket 必须单独配置
    <Location /api/stream>
        ProxyPass ws://localhost:8000/api/stream
        ProxyPassReverse ws://localhost:8000/api/stream
    </Location>

    # 后端 API 代理
    <Location /api/>
        ProxyPass http://localhost:8000/api/
        ProxyPassReverse http://localhost:8000/api/
    </Location>

    # 启用压缩
    AddOutputFilterByType DEFLATE text/plain text/css text/xml text/javascript application/json application/javascript

    # 安全头
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-XSS-Protection "1; mode=block"
</VirtualHost>
```

**CentOS/RHEL** - 创建文件 `/etc/httpd/conf.d/hummingbot-web-ui.conf`：

```apache
<VirtualHost *:80>
    ServerName your-domain.com
    ServerAlias www.your-domain.com

    # 日志配置
    ErrorLog logs/hummingbot-web-ui-error.log
    CustomLog logs/hummingbot-web-ui-access.log combined

    # 启用 WebSocket 代理
    RewriteEngine On

    # 前端静态资源代理
    ProxyPass / http://localhost:5000/
    ProxyPassReverse / http://localhost:5000/

    # WebSocket 代理
    <Location /api/stream>
        ProxyPass ws://localhost:8000/api/stream
        ProxyPassReverse ws://localhost:8000/api/stream
    </Location>

    # 后端 API 代理
    <Location /api/>
        ProxyPass http://localhost:8000/api/
        ProxyPassReverse http://localhost:8000/api/
    </Location>

    # 启用压缩
    AddOutputFilterByType DEFLATE text/plain text/css text/xml text/javascript application/json application/javascript

    # 安全头
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-XSS-Protection "1; mode=block"
</VirtualHost>
```

### 2. 启用虚拟主机

**Ubuntu/Debian**:

```bash
# 启用站点
a2ensite hummingbot-web-ui

# 禁用默认站点（可选）
a2dissite 000-default

# 测试配置
apache2ctl configtest

# 重载 Apache
systemctl reload apache2
```

**CentOS/RHEL**:

```bash
# 测试配置
httpd -t

# 重载 Apache
systemctl reload httpd
```

### 3. 验证配置

```bash
# 测试前端
curl -I http://your-domain.com

# 测试 WebSocket（需要 wscat 工具）
npm install -g wscat
wscat -c ws://your-domain.com/api/stream
```

---

## SSL 证书

### 1. 使用 Let's Encrypt 免费证书

#### 安装 Certbot

**Ubuntu/Debian**:
```bash
apt install -y certbot python3-certbot-apache
```

**CentOS/RHEL**:
```bash
yum install -y certbot python3-certbot-apache
```

#### 获取证书并自动配置 Apache

```bash
certbot --apache -d your-domain.com -d www.your-domain.com
```

Certbot 会自动修改 Apache 配置文件，添加 SSL 配置。

#### 自动续期

```bash
# 测试续期
certbot renew --dry-run

# 添加定时任务
crontab -e

# 添加以下行
0 0 * * * certbot renew --quiet
```

### 2. 手动配置 SSL

如果你有自己的 SSL 证书，手动配置如下：

```apache
<VirtualHost *:443>
    ServerName your-domain.com
    ServerAlias www.your-domain.com

    # SSL 证书配置
    SSLEngine on
    SSLCertificateFile /path/to/your-domain.crt
    SSLCertificateKeyFile /path/to/your-domain.key
    SSLCertificateChainFile /path/to/ca-bundle.crt

    # SSL 优化
    SSLProtocol all -SSLv3 -TLSv1 -TLSv1.1
    SSLCipherSuite HIGH:!aNULL:!MD5:!3DES
    SSLHonorCipherOrder on
    SSLCompression off

    # 日志配置
    ErrorLog ${APACHE_LOG_DIR}/hummingbot-web-ui-ssl-error.log
    CustomLog ${APACHE_LOG_DIR}/hummingbot-web-ui-ssl-access.log combined

    # 代理配置（与 HTTP 配置相同）
    ProxyPass / http://localhost:5000/
    ProxyPassReverse / http://localhost:5000/

    <Location /api/stream>
        ProxyPass ws://localhost:8000/api/stream
        ProxyPassReverse ws://localhost:8000/api/stream
    </Location>

    <Location /api/>
        ProxyPass http://localhost:8000/api/
        ProxyPassReverse http://localhost:8000/api/
    </Location>

    # 安全头
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-XSS-Protection "1; mode=block"
</VirtualHost>

# HTTP 跳转到 HTTPS
<VirtualHost *:80>
    ServerName your-domain.com
    ServerAlias www.your-domain.com

    Redirect permanent / https://your-domain.com/
</VirtualHost>
```

### 3. SSL 配置说明

| 配置项 | 说明 |
|--------|------|
| `SSLEngine on` | 启用 SSL |
| `SSLCertificateFile` | SSL 证书文件 |
| `SSLCertificateKeyFile` | SSL 私钥文件 |
| `SSLCertificateChainFile` | CA 证书链文件 |
| `SSLProtocol` | 启用的 SSL/TLS 协议 |
| `SSLCipherSuite` | 加密套件配置 |
| `Strict-Transport-Security` | 强制 HTTPS |

---

## 后端服务部署

### 1. 安装 Python 环境

```bash
apt install -y python3.12 python3.12-venv python3-pip
```

### 2. 创建后端服务

```bash
mkdir -p /opt/web/hummingbot-backend
cd /opt/web/hummingbot-backend

python3.12 -m venv venv
source venv/bin/activate
```

### 3. 安装依赖

```bash
cat > requirements.txt << 'EOF'
fastapi==0.104.1
uvicorn[standard]==0.24.0
websockets==12.0
python-dotenv==1.0.0
pydantic==2.5.0
EOF

pip install -r requirements.txt
```

### 4. 创建后端代码

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
pm2 start "source venv/bin/activate && uvicorn main:app --host 0.0.0.0 --port 8000" \
  --name "hummingbot-backend" \
  --cwd /opt/web/hummingbot-backend

pm2 save
```

---

## 常见问题

### 1. Apache 无法启动

```bash
# 检查错误日志
tail -f /var/log/apache2/error.log    # Ubuntu/Debian
# 或
tail -f /var/log/httpd/error_log      # CentOS/RHEL

# 检查配置语法
apache2ctl configtest                 # Ubuntu/Debian
# 或
httpd -t                              # CentOS/RHEL

# 检查端口占用
netstat -tuln | grep 80
```

### 2. WebSocket 连接失败

**问题**: WebSocket 连接立即断开

**解决方案**:

1. 确认 `mod_proxy_wstunnel` 模块已启用：

```bash
apache2ctl -M | grep proxy_wstunnel    # Ubuntu/Debian
# 或
httpd -M | grep proxy_wstunnel        # CentOS/RHEL
```

2. 检查 Apache 配置中的 WebSocket 代理设置：

```apache
<Location /api/stream>
    ProxyPass ws://localhost:8000/api/stream
    ProxyPassReverse ws://localhost:8000/api/stream
</Location>
```

3. 检查 Apache 日志：

```bash
tail -f /var/log/apache2/error.log
```

### 3. 403 Forbidden 错误

```bash
# 检查文件权限
ls -la /opt/web/hummingbot-web-ui

# 修改权限
chown -R www-data:www-data /opt/web/hummingbot-web-ui    # Ubuntu/Debian
# 或
chown -R apache:apache /opt/web/hummingbot-web-ui        # CentOS/RHEL

chmod -R 755 /opt/web/hummingbot-web-ui
```

### 4. 502 Bad Gateway

**原因**: 后端服务未启动或端口配置错误

**解决方案**:

```bash
# 检查 PM2 服务状态
pm2 status

# 检查端口是否监听
netstat -tuln | grep 5000
netstat -tuln | grep 8000

# 重启服务
pm2 restart hummingbot-web
pm2 restart hummingbot-backend
```

### 5. SSL 证书问题

```bash
# 手动续期
certbot renew

# 强制续期
certbot renew --force-renewal

# 检查证书有效期
certbot certificates
```

### 6. 性能优化

```apache
# 启用缓存模块
LoadModule cache_module modules/mod_cache.so
LoadModule cache_disk_module modules/mod_cache_disk.so

# 配置缓存
CacheEnable disk /
CacheRoot /var/cache/apache2/mod_cache_disk
CacheDirLevels 2
CacheDirLength 1

# 启用压缩
AddOutputFilterByType DEFLATE text/plain text/css text/xml text/javascript application/json application/javascript
```

### 7. .htaccess 配置

如果需要在项目根目录使用 `.htaccess`，确保启用了 `AllowOverride`：

```apache
<Directory /opt/web/hummingbot-web-ui>
    Options Indexes FollowSymLinks
    AllowOverride All
    Require all granted
</Directory>
```

---

## Apache 常用命令

### Ubuntu/Debian

```bash
# 启动服务
systemctl start apache2

# 停止服务
systemctl stop apache2

# 重启服务
systemctl restart apache2

# 重载配置（不中断连接）
systemctl reload apache2

# 查看状态
systemctl status apache2

# 测试配置
apache2ctl configtest

# 查看模块
apache2ctl -M

# 启用模块
a2enmod <module_name>

# 禁用模块
a2dismod <module_name>

# 启用站点
a2ensite <site_name>

# 禁用站点
a2dissite <site_name>

# 查看日志
tail -f /var/log/apache2/access.log
tail -f /var/log/apache2/error.log
```

### CentOS/RHEL

```bash
# 启动服务
systemctl start httpd

# 停止服务
systemctl stop httpd

# 重启服务
systemctl restart httpd

# 重载配置
systemctl reload httpd

# 查看状态
systemctl status httpd

# 测试配置
httpd -t

# 查看模块
httpd -M

# 查看日志
tail -f /var/log/httpd/access_log
tail -f /var/log/httpd/error_log
```

---

## 监控与维护

### 1. Apache 性能监控

```bash
# 安装 Apache 性能监控工具
apt install -y apache2-utils

# 查看 Apache 状态
apache2ctl status

# 查看连接数
apache2ctl fullstatus
```

### 2. 日志轮转

```bash
# 安装 logrotate
apt install -y logrotate

# 创建日志轮转配置
cat > /etc/logrotate.d/apache2-hummingbot << 'EOF'
/var/log/apache2/hummingbot-web-ui-*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 644 www-data adm
    sharedscripts
    postrotate
        systemctl reload apache2 > /dev/null 2>&1 || true
    endscript
}
EOF
```

### 3. 安全加固

```bash
# 隐藏 Apache 版本
echo "ServerTokens Prod" >> /etc/apache2/conf-available/security.conf
echo "ServerSignature Off" >> /etc/apache2/conf-available/security.conf

# 启用配置
a2enconf security
systemctl reload apache2
```

---

## 总结

使用 Apache 部署 Hummingbot Web UI 的优势：

✅ **成熟稳定** - Apache 经过数十年的验证
✅ **灵活配置** - 支持 .htaccess 文件
✅ **丰富模块** - 大量第三方模块支持
✅ **WebSocket 支持** - 使用 mod_proxy_wstunnel
✅ **SSL 支持** - 内置 SSL 模块
✅ **广泛兼容** - 几乎所有主机支持

---

## 参考资源

- [Apache 官方文档](https://httpd.apache.org/docs/)
- [mod_proxy 文档](https://httpd.apache.org/docs/current/mod/mod_proxy.html)
- [mod_proxy_wstunnel 文档](https://httpd.apache.org/docs/current/mod/mod_proxy_wstunnel.html)
- [Apache SSL/TLS 配置](https://httpd.apache.org/docs/current/ssl/)

如有问题，请查看 Apache 日志文件或参考常见问题部分。
