/**
 * 引擎状态管理 Store
 * 存储所有交易相关的实时数据
 * 所有页面都从这里读取数据，不再保存本地状态
 */

import { create } from "zustand";
import { EngineEvent } from "@/core/events";

// ============================================================================
// 策略状态接口
// ============================================================================

interface Strategy {
  id: string;
  name: string;
  type: string;
  exchange: string;
  pair: string;
  status: "running" | "stopped" | "paused" | "error";
  profit: number;
  trades: number;
  created: string;
  error_msg?: string;
  config?: Record<string, any>;
}

// ============================================================================
// 订单状态接口
// ============================================================================

interface Order {
  orderId: string;
  status: "pending" | "filled" | "cancelled" | "failed";
  filled: number;
  remaining: number;
  price: number;
  symbol: string;
  side: "buy" | "sell";
  strategy?: string;
  timestamp?: number;
  createTime: string;
  updateTime: string;
}

// ============================================================================
// 仓位状态接口
// ============================================================================

interface Position {
  symbol: string;
  size: number;
  entry_price: number;
  current_price: number;
  pnl: number;
  pnl_percent: number;
  strategy?: string;
  exchange: string;
  timestamp?: number;
}

// ============================================================================
// 余额状态接口
// ============================================================================

interface Balance {
  asset: string;
  free: number;
  used: number;
  total: number;
  exchange: string;
  timestamp?: number;
}

// ============================================================================
// 统计数据接口
// ============================================================================

interface Stats {
  totalProfit: number;
  profitChange: number;
  totalTrades: number;
  tradesToday: number;
  successRate: number;
  successRateChange: number;
}

// ============================================================================
// 引擎状态接口
// ============================================================================

interface EngineState {
  // 引擎连接状态
  isConnected: boolean;

  // 运行时间（秒）
  uptime: number;

  // 统计数据
  stats: Stats;

  // 价格数据
  prices: Record<string, number>;

  // 策略数据
  strategies: Strategy[];

  // 订单数据
  orders: Record<string, Order>;

  // 仓位数据
  positions: Record<string, Position>;

  // 余额数据
  balances: Record<string, Balance>;

  // 交易数据
  trades: Array<{
    trade_id: string;
    order_id: string;
    symbol: string;
    price: number;
    amount: number;
    side: "buy" | "sell";
    fee: number;
    strategy?: string;
    timestamp: number;
  }>;

  // 日志数据
  logs: Array<{
    level: "info" | "warn" | "error" | "debug";
    msg: string;
    source: string;
    timestamp: string;
  }>;

  // 连接状态
  connections: Record<string, {
    exchange: string;
    status: "connected" | "disconnected" | "connecting";
    message?: string;
    timestamp?: number;
  }>;

  // 系统状态
  systemStatus: {
    uptime: number;
    bot_status: "running" | "stopped";
    active_strategies: number;
    total_profit: number;
    total_trades: number;
    success_rate: number;
    timestamp: number;
  } | null;

  // ============================================================================
  // 事件处理函数
  // ============================================================================

  /**
   * 处理来自 WebSocket 的事件
   * 这是整个前端状态更新的唯一入口
   */
  onEvent: (event: EngineEvent) => void;

  /**
   * 重置所有状态
   */
  reset: () => void;

  // ============================================================================
  // 辅助选择器
  // ============================================================================

  // 获取所有订单列表
  getOrdersList: () => Order[];

  // 获取所有仓位列表
  getPositionsList: () => Position[];

  // 获取所有余额列表
  getBalancesList: () => Balance[];

  // 获取最近的日志
  getRecentLogs: (limit?: number) => Array<{
    level: "info" | "warn" | "error" | "debug";
    msg: string;
    source: string;
    timestamp: string;
  }>;

  // 获取最近的交易
  getRecentTrades: (limit?: number) => Array<{
    trade_id: string;
    order_id: string;
    symbol: string;
    price: number;
    amount: number;
    side: "buy" | "sell";
    fee: number;
    strategy?: string;
    timestamp: number;
  }>;

  // 获取指定策略
  getStrategy: (id: string) => Strategy | undefined;

  // 获取指定订单
  getOrder: (id: string) => Order | undefined;

  // 获取指定仓位
  getPosition: (symbol: string) => Position | undefined;

  // 获取指定交易对的价格
  getPrice: (symbol: string) => number | undefined;
}

// ============================================================================
// 创建 Store
// ============================================================================

export const useEngineStore = create<EngineState>((set, get) => ({
  // ============================================================================
  // 初始状态
  // ============================================================================

  isConnected: false,
  uptime: 0,
  stats: {
    totalProfit: 0,
    profitChange: 15.3,
    totalTrades: 0,
    tradesToday: 0,
    successRate: 94.2,
    successRateChange: -0.5,
  },
  prices: {},
  strategies: [],
  orders: {},
  positions: {},
  balances: {},
  trades: [],
  logs: [],
  connections: {},
  systemStatus: null,

  // ============================================================================
  // 事件处理
  // ============================================================================

  onEvent: (event: EngineEvent) => {
    const state = get();

    switch (event.type) {
      // 引擎连接状态
      case "connected":
        set({ isConnected: true });
        break;

      case "disconnected":
        set({ isConnected: false });
        break;

      // 系统状态
      case "system_status":
        set({
          systemStatus: event,
          uptime: event.uptime,
          isConnected: event.bot_status === "running",
          stats: {
            ...state.stats,
            totalProfit: event.total_profit,
            totalTrades: event.total_trades,
            successRate: event.success_rate,
          },
        });
        break;

      // 价格更新
      case "price":
        set({
          prices: {
            ...state.prices,
            [event.symbol]: event.price,
          },
        });
        break;

      // 订单更新
      case "order_update":
        set({
          orders: {
            ...state.orders,
            [event.orderId]: {
              ...state.orders[event.orderId],
              orderId: event.orderId,
              status: event.status,
              filled: event.filled,
              remaining: event.remaining,
              price: event.price,
              symbol: event.symbol,
              side: event.side,
              strategy: event.strategy,
              timestamp: event.timestamp,
              updateTime: new Date().toISOString(),
            },
          },
        });
        break;

      // 仓位更新
      case "position":
        set({
          positions: {
            ...state.positions,
            [event.symbol]: {
              ...state.positions[event.symbol],
              symbol: event.symbol,
              size: event.size,
              entry_price: event.entry_price,
              current_price: event.current_price,
              pnl: event.pnl,
              pnl_percent: event.pnl_percent,
              strategy: event.strategy,
              exchange: event.symbol.split("/")[1] || "unknown",
              timestamp: event.timestamp,
            },
          },
        });
        break;

      // 余额更新
      case "balance":
        const balanceKey = `${event.exchange}_${event.asset}`;
        set({
          balances: {
            ...state.balances,
            [balanceKey]: event,
          },
        });
        break;

      // 策略更新
      case "strategy":
        const existingStrategies = state.strategies;
        const updatedStrategies = existingStrategies.filter(s => s.id !== event.id);
        set({
          strategies: [
            ...updatedStrategies,
            {
              id: event.id,
              name: event.name,
              type: "strategy",
              exchange: event.exchange,
              pair: event.pair,
              status: event.status,
              profit: event.profit || 0,
              trades: event.trades || 0,
              created: existingStrategies.find(s => s.id === event.id)?.created || new Date().toISOString().split("T")[0],
              error_msg: event.error_msg,
            },
          ],
        });
        break;

      // 日志
      case "log":
        set({
          logs: [...state.logs, event].slice(-500), // 保留最近 500 条日志
        });
        break;

      // 连接状态
      case "connection":
        set({
          connections: {
            ...state.connections,
            [event.exchange]: {
              exchange: event.exchange,
              status: event.status,
              message: event.message,
              timestamp: event.timestamp,
            },
          },
        });
        break;

      // 交易成交
      case "trade":
        set({
          trades: [event, ...state.trades].slice(-100), // 保留最近 100 笔交易
        });
        break;
    }
  },

  // ============================================================================
  // 重置函数
  // ============================================================================

  reset: () => {
    set({
      isConnected: false,
      uptime: 0,
      stats: {
        totalProfit: 0,
        profitChange: 15.3,
        totalTrades: 0,
        tradesToday: 0,
        successRate: 94.2,
        successRateChange: -0.5,
      },
      prices: {},
      strategies: [],
      orders: {},
      positions: {},
      balances: {},
      trades: [],
      logs: [],
      connections: {},
      systemStatus: null,
    });
  },

  // ============================================================================
  // 辅助选择器
  // ============================================================================

  getOrdersList: () => {
    return Object.values(get().orders).sort((a, b) => {
      return (b.timestamp || 0) - (a.timestamp || 0);
    });
  },

  getPositionsList: () => {
    return Object.values(get().positions);
  },

  getBalancesList: () => {
    return Object.values(get().balances);
  },

  getRecentLogs: (limit = 100) => {
    return get().logs.slice(-limit);
  },

  getRecentTrades: (limit = 20) => {
    return get().trades.slice(0, limit);
  },

  getStrategy: (id: string) => {
    return get().strategies.find(s => s.id === id);
  },

  getOrder: (id: string) => {
    return get().orders[id];
  },

  getPosition: (symbol: string) => {
    return get().positions[symbol];
  },

  getPrice: (symbol: string) => {
    return get().prices[symbol];
  },
}));
