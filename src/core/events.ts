/**
 * 事件驱动架构 - 统一事件类型定义
 * 所有页面只能接收这里定义的数据格式
 */

// ============================================================================
// 价格事件
// ============================================================================

export interface PriceEvent {
  type: "price";
  symbol: string;      // 交易对，如 "BTC/USDT"
  price: number;       // 当前价格
  timestamp?: number;  // 可选时间戳
}

// ============================================================================
// 订单事件
// ============================================================================

export interface OrderUpdateEvent {
  type: "order_update";
  orderId: string;          // 订单 ID
  status: "pending" | "filled" | "cancelled" | "failed";
  filled: number;           // 已成交数量
  remaining: number;        // 剩余数量
  price: number;            // 订单价格
  symbol: string;           // 交易对
  side: "buy" | "sell";     // 买卖方向
  strategy?: string;        // 所属策略
  timestamp?: number;
}

// ============================================================================
// 仓位事件
// ============================================================================

export interface PositionEvent {
  type: "position";
  symbol: string;       // 交易对
  size: number;         // 仓位大小（正数为多头，负数为空头）
  entry_price: number;  // 开仓均价
  current_price: number;// 当前价格
  pnl: number;          // 未实现盈亏
  pnl_percent: number;  // 盈亏百分比
  strategy?: string;    // 所属策略
  timestamp?: number;
}

// ============================================================================
// 余额事件
// ============================================================================

export interface BalanceEvent {
  type: "balance";
  asset: string;        // 资产，如 "USDT", "BTC"
  free: number;         // 可用余额
  used: number;         // 冻结余额
  total: number;        // 总余额
  exchange: string;     // 交易所
  timestamp?: number;
}

// ============================================================================
// 策略事件
// ============================================================================

export interface StrategyEvent {
  type: "strategy";
  id: string;                       // 策略 ID
  name: string;                     // 策略名称
  status: "running" | "stopped" | "paused" | "error";
  exchange: string;                 // 交易所
  pair: string;                     // 交易对
  profit?: number;                  // 累计收益
  trades?: number;                  // 交易次数
  error_msg?: string;               // 错误信息（如果有）
  timestamp?: number;
}

// ============================================================================
// 日志事件
// ============================================================================

export interface LogEvent {
  type: "log";
  level: "info" | "warn" | "error" | "debug";
  msg: string;                      // 日志消息
  source: string;                   // 来源（策略名称或系统）
  timestamp: string;                // 时间戳字符串
}

// ============================================================================
// 连接状态事件
// ============================================================================

export interface ConnectionEvent {
  type: "connection";
  exchange: string;                 // 交易所名称
  status: "connected" | "disconnected" | "connecting";
  message?: string;                 // 状态消息
  timestamp?: number;
}

// ============================================================================
// 系统状态事件
// ============================================================================

export interface SystemStatusEvent {
  type: "system_status";
  uptime: number;                   // 运行时长（秒）
  bot_status: "running" | "stopped";
  active_strategies: number;        // 活跃策略数
  total_profit: number;             // 总收益
  total_trades: number;             // 总交易次数
  success_rate: number;             // 成功率
  timestamp: number;
}

// ============================================================================
// 订单成交事件
// ============================================================================

export interface TradeEvent {
  type: "trade";
  trade_id: string;                 // 成交 ID
  order_id: string;                 // 订单 ID
  symbol: string;                   // 交易对
  price: number;                    // 成交价格
  amount: number;                   // 成交数量
  side: "buy" | "sell";             // 买卖方向
  fee: number;                      // 手续费
  strategy?: string;                // 所属策略
  timestamp: number;
}

// ============================================================================
// 联合类型
// ============================================================================

export type EngineEvent =
  | PriceEvent
  | OrderUpdateEvent
  | PositionEvent
  | BalanceEvent
  | StrategyEvent
  | LogEvent
  | ConnectionEvent
  | SystemStatusEvent
  | TradeEvent;

// ============================================================================
// 事件判断辅助函数
// ============================================================================

export function isPriceEvent(event: EngineEvent): event is PriceEvent {
  return event.type === "price";
}

export function isOrderUpdateEvent(event: EngineEvent): event is OrderUpdateEvent {
  return event.type === "order_update";
}

export function isPositionEvent(event: EngineEvent): event is PositionEvent {
  return event.type === "position";
}

export function isBalanceEvent(event: EngineEvent): event is BalanceEvent {
  return event.type === "balance";
}

export function isStrategyEvent(event: EngineEvent): event is StrategyEvent {
  return event.type === "strategy";
}

export function isLogEvent(event: EngineEvent): event is LogEvent {
  return event.type === "log";
}

export function isConnectionEvent(event: EngineEvent): event is ConnectionEvent {
  return event.type === "connection";
}

export function isSystemStatusEvent(event: EngineEvent): event is SystemStatusEvent {
  return event.type === "system_status";
}

export function isTradeEvent(event: EngineEvent): event is TradeEvent {
  return event.type === "trade";
}
