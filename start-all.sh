#!/bin/bash

echo "🚀 启动 Hummingbot Trading Web UI"
echo "================================"

# 检查端口占用
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        echo "⚠️  端口 $1 已被占用"
        return 1
    fi
    return 0
}

# 检查并启动后端
if check_port 8000; then
    echo "📦 启动后端服务 (FastAPI)..."
    cd backend

    # 检查是否安装了依赖
    if ! command -v pip &> /dev/null; then
        echo "❌ 未找到 pip，请先安装 Python"
        exit 1
    fi

    # 安装依赖（如果需要）
    if [ ! -d "venv" ]; then
        echo "📥 创建虚拟环境并安装依赖..."
        python -m venv venv
        source venv/bin/activate
        pip install -r requirements.txt
    else
        source venv/bin/activate
    fi

    # 启动后端
    python api.py > ../logs/backend.log 2>&1 &
    BACKEND_PID=$!
    echo "✅ 后端服务已启动 (PID: $BACKEND_PID)"
    echo "📚 API 文档: http://localhost:8000/docs"
    cd ..
else
    echo "⚠️  后端服务已在运行"
fi

# 检查并启动前端
if check_port 5000; then
    echo "🎨 启动前端服务 (Next.js)..."
    # 检查是否安装了依赖
    if [ ! -d "node_modules" ]; then
        echo "📥 安装前端依赖..."
        pnpm install
    fi

    # 启动前端
    coze dev > logs/frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo "✅ 前端服务已启动 (PID: $FRONTEND_PID)"
    echo "🌐 前端地址: http://localhost:5000"
else
    echo "⚠️  前端服务已在运行"
fi

echo ""
echo "================================"
echo "🎉 服务启动完成！"
echo "================================"
echo "📱 前端界面: http://localhost:5000"
echo "📚 API 文档: http://localhost:8000/docs"
echo "🔍 健康检查: http://localhost:8000/api/health"
echo ""
echo "📝 查看日志:"
echo "  后端: tail -f logs/backend.log"
echo "  前端: tail -f logs/frontend.log"
echo ""
echo "🛑 停止服务:"
echo "  kill $BACKEND_PID  # 后端"
echo "  kill $FRONTEND_PID  # 前端"
echo "  或按 Ctrl+C 停止此脚本"
echo ""

# 保存 PID
echo $BACKEND_PID > logs/backend.pid
echo $FRONTEND_PID > logs/frontend.pid

# 等待用户中断
trap "echo ''; echo '🛑 正在停止服务...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; rm -f logs/backend.pid logs/frontend.pid; echo '✅ 服务已停止'; exit" INT TERM

while true; do
    sleep 1
done
