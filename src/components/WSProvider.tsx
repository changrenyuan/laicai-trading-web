'use client';

/**
 * WebSocket 连接提供者组件
 * 在应用启动时自动连接 WebSocket，管理连接状态
 */

import { useEffect, useRef } from "react";
import { engineWS, WSConnectionState } from "@/core/ws";
import { useUIStore } from "@/store/uiStore";
import { useEngineStore } from "@/store/engineStore";

export function WSProvider({ children }: { children: React.ReactNode }) {
  // 使用 ref 而不是 state 来避免 React 严格模式的双重挂载问题
  const isInitializedRef = useRef(false);

  // UI 状态
  const setWsConnected = useUIStore((state) => state.setWsConnected);
  const setWsConnecting = useUIStore((state) => state.setWsConnecting);
  const addToast = useUIStore((state) => state.addToast);

  // 引擎状态
  const reset = useEngineStore((state) => state.reset);

  useEffect(() => {
    // 避免在严格模式下重复初始化
    if (isInitializedRef.current) return;

    console.log("[WSProvider] Initializing WebSocket connection...");

    // 设置连接状态监听
    const unsubscribeState = engineWS.onStateChange((state) => {
      console.log("[WSProvider] Connection state changed:", state);

      switch (state) {
        case WSConnectionState.CONNECTING:
          setWsConnecting(true);
          break;
        case WSConnectionState.CONNECTED:
          setWsConnecting(false);
          setWsConnected(true);
          addToast("已连接到交易引擎", "success");
          break;
        case WSConnectionState.RECONNECTING:
          setWsConnecting(true);
          addToast("正在重新连接...", "info");
          break;
        case WSConnectionState.ERROR:
        case WSConnectionState.DISCONNECTED:
          setWsConnecting(false);
          setWsConnected(false);
          addToast("与交易引擎断开连接", "error");
          break;
      }
    });

    // 设置错误监听
    const unsubscribeError = engineWS.onError((error) => {
      console.error("[WSProvider] WebSocket error:", error);
      addToast("WebSocket 连接错误", "error");
    });

    // 连接 WebSocket
    engineWS.connect();

    // 标记为已初始化（使用 ref 避免重复初始化）
    isInitializedRef.current = true;

    // 清理函数
    return () => {
      console.log("[WSProvider] Cleaning up WebSocket connection...");
      unsubscribeState();
      unsubscribeError();
      engineWS.disconnect();
      reset(); // 重置引擎状态
      // 注意：不要重置 isInitializedRef.current，这会导致组件卸载后重新挂载时可以重新连接
    };
  }, [setWsConnected, setWsConnecting, addToast, reset]);

  // 应用主题
  const theme = useUIStore((state) => state.theme);
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", theme === "dark");
    }
  }, [theme]);

  return <>{children}</>;
}
