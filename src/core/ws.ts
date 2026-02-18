/**
 * WebSocket 客户端
 * 负责与后端的实时通信
 */

import { useEngineStore } from "@/store/engineStore";
import type { EngineEvent } from "./events";

// ============================================================================
// 配置
// ============================================================================

const WS_CONFIG = {
  // WebSocket 地址（通过环境变量配置）
  url: process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/api/stream",

  // 重连配置
  reconnectInterval: 2000,    // 重连间隔（毫秒）
  maxReconnectAttempts: 10,   // 最大重连次数
  heartbeatInterval: 15000,   // 心跳间隔（毫秒）- 缩短到 15 秒
  pongTimeout: 5000,          // 等待 pong 超时（毫秒）
};

// ============================================================================
// 连接状态枚举
// ============================================================================

export enum WSConnectionState {
  DISCONNECTED = "disconnected",
  CONNECTING = "connecting",
  CONNECTED = "connected",
  RECONNECTING = "reconnecting",
  ERROR = "error",
}

// ============================================================================
// WebSocket 客户端类
// ============================================================================

class EngineWS {
  private ws: WebSocket | null = null;
  private connectionState: WSConnectionState = WSConnectionState.DISCONNECTED;
  private reconnectAttempts: number = 0;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private messageQueue: string[] = []; // 消息队列（断线时缓存）
  private lastPongTime: number = 0; // 最后一次收到 pong 的时间
  private pongTimeoutTimer: NodeJS.Timeout | null = null; // pong 超时检测

  // 事件监听器
  private stateChangeListeners: Set<(state: WSConnectionState) => void> = new Set();
  private errorListeners: Set<(error: Event) => void> = new Set();

  // ============================================================================
  // 连接管理
  // ============================================================================

  /**
   * 连接到 WebSocket 服务器
   */
  connect(): void {
    if (this.connectionState === WSConnectionState.CONNECTED ||
        this.connectionState === WSConnectionState.CONNECTING) {
      console.log("[WS] Already connecting or connected");
      return;
    }

    this.setConnectionState(WSConnectionState.CONNECTING);

    try {
      this.ws = new WebSocket(WS_CONFIG.url);

      this.setupEventHandlers();
    } catch (error) {
      console.error("[WS] Connection error:", error);
      this.setConnectionState(WSConnectionState.ERROR);
      this.scheduleReconnect();
    }
  }

  /**
   * 断开连接
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.stopHeartbeat();

    if (this.pongTimeoutTimer) {
      clearTimeout(this.pongTimeoutTimer);
      this.pongTimeoutTimer = null;
    }

    this.setConnectionState(WSConnectionState.DISCONNECTED);
    this.reconnectAttempts = 0;
  }

  /**
   * 设置 WebSocket 事件处理器
   */
  private setupEventHandlers(): void {
    if (!this.ws) return;

    // 连接成功
    this.ws.onopen = () => {
      console.log("[WS] Connected to server");
      this.setConnectionState(WSConnectionState.CONNECTED);
      this.reconnectAttempts = 0;
      this.startHeartbeat();

      // 发送队列中的消息
      this.flushMessageQueue();
    };

    // 收到消息
    this.ws.onmessage = (event: MessageEvent) => {
      try {
        const data: EngineEvent = JSON.parse(event.data);
        this.handleMessage(data);
      } catch (error) {
        console.error("[WS] Failed to parse message:", error);
      }
    };

    // 连接错误
    this.ws.onerror = (error: Event) => {
      console.error("[WS] WebSocket error:", error);
      this.notifyErrorListeners(error);
    };

    // 连接关闭
    this.ws.onclose = (event: CloseEvent) => {
      console.log("[WS] Connection closed:", event.code, event.reason);

      this.stopHeartbeat();

      if (this.pongTimeoutTimer) {
        clearTimeout(this.pongTimeoutTimer);
        this.pongTimeoutTimer = null;
      }

      // 非正常关闭，尝试重连
      if (event.code !== 1000) {
        this.setConnectionState(WSConnectionState.RECONNECTING);
        this.scheduleReconnect();
      } else {
        this.setConnectionState(WSConnectionState.DISCONNECTED);
      }
    };
  }

  /**
   * 处理收到的消息
   */
  private handleMessage(event: EngineEvent): void {
    // 处理心跳响应（使用类型断言，因为 ping/pong 不属于业务事件）
    const data = event as any;

    // 处理心跳响应
    if (data.type === "pong") {
      console.log("[WS] Received pong");
      this.lastPongTime = Date.now();
      this.resetPongTimeout();
      return;
    }

    // 处理 ping 请求（可选，如果后端发送 ping）
    if (data.type === "ping") {
      console.log("[WS] Received ping, sending pong");
      this.ws?.send(JSON.stringify({ type: "pong" }));
      return;
    }

    // 传递给全局状态管理器
    try {
      useEngineStore.getState().onEvent(event);
    } catch (error) {
      console.error("[WS] Failed to handle event:", error, event);
    }
  }

  /**
   * 安排重连
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= WS_CONFIG.maxReconnectAttempts) {
      console.error("[WS] Max reconnect attempts reached");
      this.setConnectionState(WSConnectionState.ERROR);
      return;
    }

    this.reconnectAttempts++;
    const delay = WS_CONFIG.reconnectInterval * this.reconnectAttempts;

    console.log(`[WS] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${WS_CONFIG.maxReconnectAttempts})`);

    setTimeout(() => {
      this.connect();
    }, delay);
  }

  // ============================================================================
  // 状态管理
  // ============================================================================

  /**
   * 设置连接状态
   */
  private setConnectionState(state: WSConnectionState): void {
    this.connectionState = state;
    this.stateChangeListeners.forEach(listener => listener(state));
  }

  /**
   * 获取当前连接状态
   */
  getConnectionState(): WSConnectionState {
    return this.connectionState;
  }

  /**
   * 是否已连接
   */
  isConnected(): boolean {
    return this.connectionState === WSConnectionState.CONNECTED;
  }

  /**
   * 监听连接状态变化
   */
  onStateChange(listener: (state: WSConnectionState) => void): () => void {
    this.stateChangeListeners.add(listener);
    return () => this.stateChangeListeners.delete(listener);
  }

  /**
   * 监听错误事件
   */
  onError(listener: (error: Event) => void): () => void {
    this.errorListeners.add(listener);
    return () => this.errorListeners.delete(listener);
  }

  /**
   * 通知错误监听器
   */
  private notifyErrorListeners(error: Event): void {
    this.errorListeners.forEach(listener => listener(error));
  }

  // ============================================================================
  // 心跳机制
  // ============================================================================

  /**
   * 启动心跳
   */
  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.lastPongTime = Date.now();

    console.log("[WS] Starting heartbeat interval (every 15000ms)");

    this.heartbeatTimer = setInterval(() => {
      this.sendHeartbeat();
    }, WS_CONFIG.heartbeatInterval);
  }

  /**
   * 停止心跳
   */
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    this.resetPongTimeout();
  }

  /**
   * 重置 pong 超时检测
   */
  private resetPongTimeout(): void {
    if (this.pongTimeoutTimer) {
      clearTimeout(this.pongTimeoutTimer);
      this.pongTimeoutTimer = null;
    }

    // 设置新的超时检测
    this.pongTimeoutTimer = setTimeout(() => {
      const now = Date.now();
      const elapsed = now - this.lastPongTime;

      console.warn(`[WS] No pong received for ${elapsed}ms, connection may be dead`);

      // 关闭连接以触发重连
      if (this.ws) {
        this.ws.close(1000, "No pong received");
      }
    }, WS_CONFIG.pongTimeout + WS_CONFIG.heartbeatInterval);
  }

  /**
   * 发送心跳
   */
  private sendHeartbeat(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify({ type: "ping" }));
        console.log("[WS] Sent ping");
      } catch (error) {
        console.error("[WS] Failed to send ping:", error);
        // 发送失败，关闭连接
        this.ws.close(1000, "Failed to send ping");
      }
    } else {
      console.warn("[WS] Cannot send ping: WebSocket not connected");
    }
  }

  // ============================================================================
  // 消息队列
  // ============================================================================

  /**
   * 将消息加入队列
   */
  private queueMessage(message: string): void {
    this.messageQueue.push(message);
    // 限制队列大小
    if (this.messageQueue.length > 100) {
      this.messageQueue.shift();
    }
  }

  /**
   * 发送队列中的所有消息
   */
  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0 && this.ws?.readyState === WebSocket.OPEN) {
      const message = this.messageQueue.shift();
      if (message) {
        this.ws.send(message);
      }
    }
  }

  // ============================================================================
  // 命令发送（通过 WebSocket）
  // ============================================================================

  /**
   * 发送命令到后端（通过 WebSocket）
   * @param command 命令对象
   * @returns Promise 等待发送完成
   */
  async send(command: Record<string, any>): Promise<void> {
    const message = JSON.stringify(command);

    // 如果已连接，直接发送
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(message);
        console.log("[WS] Command sent via WebSocket:", command);
      } catch (error) {
        console.error("[WS] Failed to send command via WebSocket:", error);
        throw new Error("WebSocket send failed");
      }
    } else {
      // 未连接，加入队列并等待连接
      console.log("[WS] WebSocket not connected, queuing command:", command);
      this.queueMessage(message);

      // 等待连接建立（最多 5 秒）
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("WebSocket not connected, command queued"));
        }, 5000);

        const checkConnection = () => {
          if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            clearTimeout(timeout);
            resolve();
          } else {
            setTimeout(checkConnection, 100);
          }
        };

        checkConnection();
      });
    }
  }
}

// ============================================================================
// 导出单例
// ============================================================================

export const engineWS = new EngineWS();
export type { EngineWS };
