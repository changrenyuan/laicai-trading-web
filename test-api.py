#!/usr/bin/env python3
"""
测试后端 API 端点
"""

import requests
import json
from typing import Dict, Any

BASE_URL = "http://localhost:8000"

def print_section(title: str):
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}")

def test_endpoint(endpoint: str, method: str = "GET", data: Dict[str, Any] = None):
    url = f"{BASE_URL}{endpoint}"
    print(f"\n{method} {url}")
    try:
        if method == "GET":
            response = requests.get(url)
        elif method == "POST":
            response = requests.post(url, json=data)
        elif method == "DELETE":
            response = requests.delete(url)
        else:
            print(f"❌ 不支持的 HTTP 方法: {method}")
            return

        print(f"状态码: {response.status_code}")
        if response.status_code == 200:
            print(f"响应: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
            return response.json()
        else:
            print(f"❌ 错误: {response.text}")
            return None
    except requests.exceptions.ConnectionError:
        print("❌ 连接失败：请确保后端服务已启动 (python api.py)")
        return None
    except Exception as e:
        print(f"❌ 错误: {str(e)}")
        return None

def main():
    print_section("Hummingbot Trading API 测试")

    # 测试健康检查
    print_section("1. 健康检查")
    test_endpoint("/api/health")

    # 测试仪表盘
    print_section("2. 仪表盘数据")
    test_endpoint("/api/dashboard")

    # 测试策略
    print_section("3. 策略列表")
    strategies = test_endpoint("/api/strategies")
    if strategies and len(strategies) > 0:
        strategy_id = strategies[0]["id"]
        print(f"\n测试策略 ID: {strategy_id}")
        test_endpoint(f"/api/strategies/{strategy_id}")

    # 测试创建策略
    print_section("4. 创建新策略")
    new_strategy = test_endpoint("/api/strategies", "POST", {
        "name": "Test Strategy",
        "type": "Pure Market Making",
        "exchange": "Binance",
        "pair": "ETH/USDT"
    })

    if new_strategy and "id" in new_strategy:
        test_endpoint(f"/api/strategies/{new_strategy['id']}/start", "POST")
        test_endpoint(f"/api/strategies/{new_strategy['id']}/stop", "POST")

    # 测试订单
    print_section("5. 订单列表")
    test_endpoint("/api/orders")

    # 测试连接
    print_section("6. 连接列表")
    test_endpoint("/api/connections")

    # 测试日志
    print_section("7. 日志列表")
    test_endpoint("/api/logs")

    print_section("测试完成")
    print("\n📚 API 文档: http://localhost:8000/docs")
    print("🌐 Swagger UI: http://localhost:8000/docs")

if __name__ == "__main__":
    main()
