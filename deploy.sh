#!/bin/bash

################################################################################
# Hummingbot Web UI - 阿里云快速部署脚本
# 
# 使用方法：
#   chmod +x deploy.sh
#   sudo ./deploy.sh
#
# 注意：请根据你的实际情况修改配置参数
################################################################################

set -e  # 遇到错误立即退出

# ============================================================================
# 配置参数（请根据实际情况修改）
# ============================================================================

# 项目配置
PROJECT_NAME="hummingbot-web-ui"
PROJECT_DIR="/opt/web/hummingbot-web-ui"
DOMAIN="your-domain.com"
ADMIN_EMAIL="your-email@example.com"

# Git 仓库配置
GIT_REPO="https://github.com/your-username/hummingbot-web-ui.git"
GIT_BRANCH="main"

# 端口配置
FRONTEND_PORT=5000
BACKEND_PORT=8000

# ============================================================================
# 颜色定义
# ============================================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================================================
# 日志函数
# ============================================================================

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# ============================================================================
# 检查是否为 root 用户
# ============================================================================

check_root() {
    if [ "$EUID" -ne 0 ]; then
        log_error "请使用 root 用户运行此脚本"
        log_info "使用命令: sudo $0"
        exit 1
    fi
}

# ============================================================================
# 检测操作系统
# ============================================================================

detect_os() {
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$NAME
        VER=$VERSION_ID
    else
        log_error "无法检测操作系统"
        exit 1
    fi

    log_info "检测到操作系统: $OS $VER"
}

# ============================================================================
# 更新系统
# ============================================================================

update_system() {
    log_info "更新系统包..."
    
    if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
        apt update && apt upgrade -y
    elif [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"Red Hat"* ]]; then
        yum update -y
    else
        log_error "不支持的操作系统: $OS"
        exit 1
    fi
    
    log_success "系统更新完成"
}

# ============================================================================
# 安装 Node.js 24
# ============================================================================

install_nodejs() {
    log_info "安装 Node.js 24..."
    
    # 检查 Node.js 是否已安装
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node -v)
        log_info "Node.js 已安装: $NODE_VERSION"
        
        # 检查版本是否为 24
        if [[ "$NODE_VERSION" != "v24"* ]]; then
            log_warning "Node.js 版本不是 v24，当前版本: $NODE_VERSION"
            log_info "建议使用 Node.js 24"
        fi
        return
    fi
    
    # 安装 Node.js 24
    curl -fsSL https://deb.nodesource.com/setup_24.x | bash -
    
    if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
        apt install -y nodejs
    elif [[ "$OS" == *"CentOS"* ]]; then
        yum install -y nodejs
    fi
    
    log_success "Node.js 安装完成: $(node -v)"
}

# ============================================================================
# 安装 pnpm
# ============================================================================

install_pnpm() {
    log_info "安装 pnpm..."
    
    if command -v pnpm &> /dev/null; then
        log_info "pnpm 已安装: $(pnpm -v)"
        return
    fi
    
    npm install -g pnpm
    log_success "pnpm 安装完成: $(pnpm -v)"
}

# ============================================================================
# 安装 Nginx
# ============================================================================

install_nginx() {
    log_info "安装 Nginx..."
    
    if command -v nginx &> /dev/null; then
        log_info "Nginx 已安装: $(nginx -v 2>&1)"
        return
    fi
    
    if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
        apt install -y nginx
    elif [[ "$OS" == *"CentOS"* ]]; then
        yum install -y nginx
    fi
    
    systemctl start nginx
    systemctl enable nginx
    
    log_success "Nginx 安装完成"
}

# ============================================================================
# 安装 PM2
# ============================================================================

install_pm2() {
    log_info "安装 PM2..."
    
    if command -v pm2 &> /dev/null; then
        log_info "PM2 已安装: $(pm2 -v)"
        return
    fi
    
    npm install -g pm2
    
    log_success "PM2 安装完成"
}

# ============================================================================
# 安装 Git
# ============================================================================

install_git() {
    log_info "安装 Git..."
    
    if command -v git &> /dev/null; then
        log_info "Git 已安装: $(git --version)"
        return
    fi
    
    if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
        apt install -y git
    elif [[ "$OS" == *"CentOS"* ]]; then
        yum install -y git
    fi
    
    log_success "Git 安装完成"
}

# ============================================================================
# 创建项目目录
# ============================================================================

create_project_dir() {
    log_info "创建项目目录: $PROJECT_DIR"
    
    mkdir -p $PROJECT_DIR
    mkdir -p /opt/web
    mkdir -p /var/log/pm2
    
    log_success "项目目录创建完成"
}

# ============================================================================
# 克隆项目
# ============================================================================

clone_project() {
    log_info "克隆项目..."
    
    if [ -d "$PROJECT_DIR" ]; then
        log_warning "项目目录已存在，跳过克隆"
        return
    fi
    
    cd /opt/web
    git clone -b $GIT_BRANCH $GIT_REPO
    
    log_success "项目克隆完成"
}

# ============================================================================
# 安装项目依赖
# ============================================================================

install_dependencies() {
    log_info "安装项目依赖..."
    
    cd $PROJECT_DIR
    
    # 安装 pnpm 依赖
    pnpm install
    
    log_success "依赖安装完成"
}

# ============================================================================
# 构建项目
# ============================================================================

build_project() {
    log_info "构建项目..."
    
    cd $PROJECT_DIR
    
    # 构建生产版本
    pnpm build
    
    log_success "项目构建完成"
}

# ============================================================================
# 配置环境变量
# ============================================================================

configure_env() {
    log_info "配置环境变量..."
    
    cd $PROJECT_DIR
    
    cat > .env.production << EOF
# 后端 API 地址
NEXT_PUBLIC_API_URL=http://localhost:$BACKEND_PORT

# WebSocket 地址
NEXT_PUBLIC_WS_URL=ws://$DOMAIN/api/stream

# 日志级别
NEXT_PUBLIC_LOG_LEVEL=info
EOF
    
    log_success "环境变量配置完成"
}

# ============================================================================
# 配置 Nginx
# ============================================================================

configure_nginx() {
    log_info "配置 Nginx..."
    
    cat > /etc/nginx/sites-available/$PROJECT_NAME << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    # 前端静态资源
    location / {
        proxy_pass http://localhost:$FRONTEND_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # WebSocket 代理
    location /api/stream {
        proxy_pass http://localhost:$BACKEND_PORT/api/stream;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 86400;
    }

    # 后端 API 代理
    location /api/ {
        proxy_pass http://localhost:$BACKEND_PORT;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
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
    
    # 创建软链接
    ln -sf /etc/nginx/sites-available/$PROJECT_NAME /etc/nginx/sites-enabled/
    
    # 测试配置
    nginx -t
    
    # 重载 Nginx
    nginx -s reload
    
    log_success "Nginx 配置完成"
}

# ============================================================================
# 创建 PM2 配置文件
# ============================================================================

create_pm2_config() {
    log_info "创建 PM2 配置文件..."
    
    cd $PROJECT_DIR
    
    cat > ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'hummingbot-web',
      script: 'pnpm',
      args: 'start',
      cwd: '$PROJECT_DIR',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: $FRONTEND_PORT
      },
      error_file: '/var/log/pm2/hummingbot-web-error.log',
      out_file: '/var/log/pm2/hummingbot-web-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ]
};
EOF
    
    log_success "PM2 配置文件创建完成"
}

# ============================================================================
# 启动服务
# ============================================================================

start_service() {
    log_info "启动服务..."
    
    cd $PROJECT_DIR
    
    # 启动服务
    pm2 start ecosystem.config.js
    
    # 查看状态
    pm2 status
    
    # 设置开机自启
    pm2 startup
    pm2 save
    
    log_success "服务启动完成"
}

# ============================================================================
# 配置防火墙
# ============================================================================

configure_firewall() {
    log_info "配置防火墙..."
    
    # 检查是否安装了 UFW
    if command -v ufw &> /dev/null; then
        # 允许 SSH
        ufw allow 22/tcp
        
        # 允许 HTTP 和 HTTPS
        ufw allow 80/tcp
        ufw allow 443/tcp
        
        # 启用防火墙
        ufw --force enable
        
        log_success "防火墙配置完成"
    else
        log_warning "UFW 未安装，跳过防火墙配置"
    fi
}

# ============================================================================
# 安装 SSL 证书
# ============================================================================

install_ssl() {
    log_info "配置 SSL 证书..."
    
    # 检查是否安装了 certbot
    if ! command -v certbot &> /dev/null; then
        log_info "安装 Certbot..."
        
        if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
            apt install -y certbot python3-certbot-nginx
        elif [[ "$OS" == *"CentOS"* ]]; then
            yum install -y certbot python3-certbot-nginx
        fi
    fi
    
    # 获取证书
    certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email $ADMIN_EMAIL
    
    log_success "SSL 证书配置完成"
}

# ============================================================================
# 显示部署信息
# ============================================================================

show_deployment_info() {
    log_info "=========================================="
    log_success "部署完成！"
    log_info "=========================================="
    echo ""
    echo "项目信息:"
    echo "  项目名称: $PROJECT_NAME"
    echo "  项目目录: $PROJECT_DIR"
    echo "  域名: http://$DOMAIN"
    echo ""
    echo "服务信息:"
    echo "  前端端口: $FRONTEND_PORT"
    echo "  后端端口: $BACKEND_PORT"
    echo ""
    echo "常用命令:"
    echo "  查看服务状态: pm2 status"
    echo "  查看日志: pm2 logs hummingbot-web"
    echo "  重启服务: pm2 restart hummingbot-web"
    echo "  停止服务: pm2 stop hummingbot-web"
    echo ""
    echo "Nginx 配置文件: /etc/nginx/sites-available/$PROJECT_NAME"
    echo "PM2 配置文件: $PROJECT_DIR/ecosystem.config.js"
    echo ""
    log_info "=========================================="
}

# ============================================================================
# 主函数
# ============================================================================

main() {
    log_info "开始部署 Hummingbot Web UI..."
    log_info "=========================================="
    
    check_root
    detect_os
    update_system
    install_git
    install_nodejs
    install_pnpm
    install_nginx
    install_pm2
    create_project_dir
    clone_project
    install_dependencies
    build_project
    configure_env
    configure_nginx
    create_pm2_config
    start_service
    configure_firewall
    
    # 询问是否安装 SSL 证书
    read -p "是否安装 SSL 证书？(y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        install_ssl
    fi
    
    show_deployment_info
}

# ============================================================================
# 执行主函数
# ============================================================================

main "$@"
