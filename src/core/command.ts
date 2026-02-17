/**
 * 命令发送模块
 * 统一管理所有后端命令的发送
 */

import { engineWS } from "./ws";

// ============================================================================
// 策略管理命令
// ============================================================================

/**
 * 启动策略
 * @param strategyId 策略 ID
 */
export const startStrategy = async (strategyId: string) => {
  return engineWS.send({
    cmd: "start_strategy",
    id: strategyId,
  });
};

/**
 * 停止策略
 * @param strategyId 策略 ID
 */
export const stopStrategy = async (strategyId: string) => {
  return engineWS.send({
    cmd: "stop_strategy",
    id: strategyId,
  });
};

/**
 * 暂停策略
 * @param strategyId 策略 ID
 */
export const pauseStrategy = async (strategyId: string) => {
  return engineWS.send({
    cmd: "pause_strategy",
    id: strategyId,
  });
};

/**
 * 恢复策略
 * @param strategyId 策略 ID
 */
export const resumeStrategy = async (strategyId: string) => {
  return engineWS.send({
    cmd: "resume_strategy",
    id: strategyId,
  });
};

/**
 * 删除策略
 * @param strategyId 策略 ID
 */
export const deleteStrategy = async (strategyId: string) => {
  return engineWS.send({
    cmd: "delete_strategy",
    id: strategyId,
  });
};

// ============================================================================
// 订单管理命令
// ============================================================================

/**
 * 下市价单
 * @param symbol 交易对
 * @param side 买卖方向
 * @param size 数量
 */
export const placeMarketOrder = async (
  symbol: string,
  side: "buy" | "sell",
  size: number
) => {
  return engineWS.send({
    cmd: "place_order",
    symbol,
    side,
    type: "market",
    size,
  });
};

/**
 * 下限价单
 * @param symbol 交易对
 * @param side 买卖方向
 * @param price 价格
 * @param size 数量
 */
export const placeLimitOrder = async (
  symbol: string,
  side: "buy" | "sell",
  price: number,
  size: number
) => {
  return engineWS.send({
    cmd: "place_order",
    symbol,
    side,
    type: "limit",
    price,
    size,
  });
};

/**
 * 取消订单
 * @param orderId 订单 ID
 */
export const cancelOrder = async (orderId: string) => {
  return engineWS.send({
    cmd: "cancel_order",
    order_id: orderId,
  });
};

/**
 * 取消所有订单
 * @param symbol 交易对（可选，不传则取消所有）
 */
export const cancelAllOrders = async (symbol?: string) => {
  return engineWS.send({
    cmd: "cancel_all_orders",
    ...(symbol && { symbol }),
  });
};

// ============================================================================
// 连接管理命令
// ============================================================================

/**
 * 创建交易所连接
 * @param exchange 交易所名称
 * @param apiKey API 密钥
 * @param apiSecret API 密钥
 * @param testnet 是否使用测试网
 */
export const createConnection = async (
  exchange: string,
  apiKey: string,
  apiSecret: string,
  testnet: boolean = false
) => {
  return engineWS.send({
    cmd: "create_connection",
    exchange,
    api_key: apiKey,
    api_secret: apiSecret,
    testnet,
  });
};

/**
 * 删除交易所连接
 * @param connectionId 连接 ID
 */
export const deleteConnection = async (connectionId: string) => {
  return engineWS.send({
    cmd: "delete_connection",
    id: connectionId,
  });
};

/**
 * 测试交易所连接
 * @param connectionId 连接 ID
 */
export const testConnection = async (connectionId: string) => {
  return engineWS.send({
    cmd: "test_connection",
    id: connectionId,
  });
};

// ============================================================================
// 策略配置命令
// ============================================================================

/**
 * 创建策略
 * @param strategyConfig 策略配置
 */
export const createStrategy = async (strategyConfig: {
  name: string;
  type: string;
  exchange: string;
  pair: string;
  [key: string]: any;
}) => {
  return engineWS.send({
    cmd: "create_strategy",
    ...strategyConfig,
  });
};

/**
 * 更新策略配置
 * @param strategyId 策略 ID
 * @param config 配置对象
 */
export const updateStrategyConfig = async (
  strategyId: string,
  config: Record<string, any>
) => {
  return engineWS.send({
    cmd: "update_strategy_config",
    id: strategyId,
    config,
  });
};

// ============================================================================
// 系统命令
// ============================================================================

/**
 * 启动/停止引擎
 * @param action "start" | "stop"
 */
export const sendCommand = async (action: "start" | "stop") => {
  return engineWS.send({
    cmd: action === "start" ? "start_engine" : "stop_engine",
  });
};

/**
 * 获取系统状态
 */
export const getSystemStatus = async () => {
  return engineWS.send({
    cmd: "get_system_status",
  });
};

/**
 * 获取所有策略列表
 */
export const getStrategies = async () => {
  return engineWS.send({
    cmd: "get_strategies",
  });
};

/**
 * 获取所有订单列表
 */
export const getOrders = async (filters?: {
  symbol?: string;
  status?: string;
  strategy?: string;
}) => {
  return engineWS.send({
    cmd: "get_orders",
    ...filters,
  });
};

/**
 * 获取仓位列表
 */
export const getPositions = async () => {
  return engineWS.send({
    cmd: "get_positions",
  });
};

/**
 * 获取余额列表
 */
export const getBalances = async () => {
  return engineWS.send({
    cmd: "get_balances",
  });
};

// ============================================================================
// 导出所有命令
// ============================================================================

export const commands = {
  // 策略管理
  startStrategy,
  stopStrategy,
  pauseStrategy,
  resumeStrategy,
  deleteStrategy,

  // 订单管理
  placeMarketOrder,
  placeLimitOrder,
  cancelOrder,
  cancelAllOrders,

  // 连接管理
  createConnection,
  deleteConnection,
  testConnection,

  // 策略配置
  createStrategy,
  updateStrategyConfig,

  // 系统命令
  getSystemStatus,
  getStrategies,
  getOrders,
  getPositions,
  getBalances,
};
