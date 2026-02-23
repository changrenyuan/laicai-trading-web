#!/bin/bash

################################################################################
# Hummingbot Web UI - Apache 版本快速部署脚本
# 
# 使用方法：
#   chmod +x deploy-apache.sh
#   sudo ./deploy-apache.sh
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

    # 设置 Apache 相关变量
    if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
        APACHE_SERVICE="apache2"
        APACHE_CONF_DIR="/etc/apache2/sites-available"
        APACHE_CMD="apache2ctl"
    else
        APACHE_SERVICE="httpd"
        APACHE_CONF_DIR="/etc/httpd/conf.d"
        APACHE_CMD="httpd"
    fi

    log_info "Apache 服务: $APACHE_SERVICE"
    log_info "Apache 配置目录: $APACHE_CONF_DIR"
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
# 安装 Apache
# ============================================================================

install_apache() {
    log_info "安装 Apache..."
    
    if command -v $APACHE_CMD &> /dev/null; then
        log_info "Apache 已安装: $($APACHE_CMD -v | head -n 1)"
        return
    fi
    
    if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
        apt install -y apache2
    elif [[ "$OS" == *"CentOS"* ]]; then
        yum install -y httpd
    fi
    
    # 启动 Apache
    systemctl start $APACHE_SERVICE
    systemctl enable $APACHE_SERVICE
    
    log_success "Apache 安装完成"
}

# ============================================================================
# 配置 Apache 模块
# ============================================================================

configure_apache_modules() {
    log_info "配置 Apache 模块..."
    
    if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
        # 启用必需的模块
        a2enmod rewrite > /dev/null 2>&1 || true
        a2enmod proxy > /dev/null 2>&1 || true
        a2enmod proxy_http > /dev/null 2>&1 || true
        a2enmod proxy_wstunnel > /dev/null 2>&1 || true
        a2enmod ssl > /dev/null 2>&1 || true
        a2enmod headers > /dev/null 2>&1 || true
        a2enmod deflate > /dev/null 2>&1 || true
        
        log_success "Apache 模块配置完成"
    else
        log_warning "CentOS/RHEL 请手动配置 Apache 模块"
        log_info "参考 APACHE_DEPLOYMENT.md 文档"
    fi
}

# ============================================================================
# 安装 Node.js 24
# ============================================================================

install_nodejs() {
    log_info "安装 Node.js 24..."
    
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node -v)
        log_info "Node.js 已安装: $NODE_VERSION"
        return
    fi
    
    curl -fsSL https://deb.nodesource.com/setup_24.x | bash -
    apt install -y nodejs
    
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
    log_success "pnpm 安装完成"
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
    
    apt install -y git
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
    pnpm install
    
    log_success "依赖安装完成"
}

# ============================================================================
# 构建项目
# ============================================================================

build_project() {
    log_info "构建项目..."
    
    cd $PROJECT_DIR
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
# 配置 Apache
# ============================================================================

configure_apache() {
    log_info "配置 Apache..."
    
    cat > $APACHE_CONF_DIR/$PROJECT_NAME.conf << EOF
<VirtualHost *:80>
    ServerName $DOMAIN
    ServerAlias www.$DOMAIN

    # 日志配置
    ErrorLog \${APACHE_LOG_DIR}/$PROJECT_NAME-error.log
    CustomLog \${APACHE_LOG_DIR}/$PROJECT_NAME-access.log combined

    # 启用 WebSocket 代理
    RewriteEngine On

    # 前端静态资源代理
    ProxyPass / http://localhost:$FRONTEND_PORT/
    ProxyPassReverse / http://localhost:$FRONTEND_PORT/

    # WebSocket 代理（关键配置）
    <Location /api/stream>
        ProxyPass ws://localhost:$BACKEND_PORT/api/stream
        ProxyPassReverse ws://localhost:$BACKEND_PORT/api/stream
    </Location>

    # 后端 API 代理
    <Location /api/>
        ProxyPass http://localhost:$BACKEND_PORT/api/
        ProxyPassReverse http://localhost:$BACKEND_PORT/api/
    </Location>

    # 启用压缩
    AddOutputFilterByType DEFLATE text/plain text/css text/xml text/javascript application/json application/javascript

    # 安全头
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-XSS-Protection "1; mode=block"
</VirtualHost>
EOF
    
    if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
        # 启用站点
        a2ensite $PROJECT_NAME
        
        # 禁用默认站点
        a2dissite 000-default > /dev/null 2>&1 || true
    fi
    
    # 测试配置
    $APACHE_CMD configtest
    
    # 重载 Apache
    systemctl reload $APACHE_SERVICE
    
    log_success "Apache 配置完成"
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
        apt install -y certbot python3-certbot-apache
    fi
    
    # 获取证书
    certbot --apache -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email $ADMIN_EMAIL
    
    log_success "SSL 证书配置完成"
}

# ============================================================================
# 设置文件权限
# ============================================================================

set_permissions() {
    log_info "设置文件权限..."
    
    if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
        chown -R www-data:www-data $PROJECT_DIR
    else
        chown -R apache:apache $PROJECT_DIR
    fi
    
    chmod -R 755 $PROJECT_DIR
    
    log_success "文件权限设置完成"
}

# ============================================================================
# 显示部署信息
# ============================================================================

show_deployment_info() {
    log_info "=========================================="
    log_success "Apache 版本部署完成！"
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
    echo "  Web 服务器: Apache ($APACHE_SERVICE)"
    echo ""
    echo "常用命令:"
    echo "  查看服务状态: pm2 status"
    echo "  查看日志: pm2 logs hummingbot-web"
    echo "  重启服务: pm2 restart hummingbot-web"
    echo "  Apache 状态: systemctl status $APACHE_SERVICE"
    echo "  Apache 重启: systemctl restart $APACHE_SERVICE"
    echo "  Apache 重载: systemctl reload $APACHE_SERVICE"
    echo ""
    echo "配置文件:"
    echo "  Apache 配置: $APACHE_CONF_DIR/$PROJECT_NAME.conf"
    echo "  PM2 配置: $PROJECT_DIR/ecosystem.config.js"
    echo ""
    echo "日志文件:"
    echo "  Apache 访问日志: /var/log/$APACHE_SERVICE/access.log"
    echo "  Apache 错误日志: /var/log/$APACHE_SERVICE/error.log"
    echo "  PM2 日志: /var/log/pm2/"
    echo ""
    log_info "=========================================="
}

# ============================================================================
# 主函数
# ============================================================================

main() {
    log_info "开始部署 Hummingbot Web UI（Apache 版本）..."
    log_info "=========================================="
    
    check_root
    detect_os
    update_system
    install_apache
    configure_apache_modules
    install_git
    install_nodejs
    install_pnpm
    install_pm2
    create_project_dir
    clone_project
    install_dependencies
    build_project
    configure_env
    configure_apache
    create_pm2_config
    start_service
    configure_firewall
    set_permissions
    
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
