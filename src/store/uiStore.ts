/**
 * UI 状态管理 Store
 * 存储页面 UI 相关的状态（不包含交易数据）
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

// ============================================================================
// UI 状态接口
// ============================================================================

interface UIState {
  // 侧边栏
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;

  // 当前路由
  currentPath: string;
  setCurrentPath: (path: string) => void;

  // WebSocket 连接状态
  wsConnected: boolean;
  wsConnecting: boolean;
  setWsConnected: (connected: boolean) => void;
  setWsConnecting: (connecting: boolean) => void;

  // 主题
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
  toggleTheme: () => void;

  // Toast 通知
  toasts: Array<{
    id: string;
    message: string;
    type: "success" | "error" | "info" | "warning";
    timestamp: number;
  }>;
  addToast: (message: string, type?: "success" | "error" | "info" | "warning") => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;

  // 加载状态
  loading: boolean;
  setLoading: (loading: boolean) => void;

  // 对话框
  dialogs: Record<string, boolean>;
  openDialog: (dialogKey: string) => void;
  closeDialog: (dialogKey: string) => void;
  toggleDialog: (dialogKey: string) => void;

  // 筛选器状态
  filters: {
    orders?: {
      status?: string;
      strategy?: string;
      symbol?: string;
    };
    logs?: {
      level?: string;
      source?: string;
    };
  };
  setFilters: (category: string, filters: any) => void;
  clearFilters: (category: string) => void;

  // 表格视图设置
  tableSettings: Record<string, {
    pageSize: number;
    currentPage: number;
    sortColumn?: string;
    sortOrder?: "asc" | "desc";
  }>;
  updateTableSetting: (tableKey: string, settings: any) => void;

  // 面板布局（用于可拖拽的面板）
  panelLayout: {
    dashboard?: {
      showStats: boolean;
      showChart: boolean;
      showPositions: boolean;
    };
  };
  updatePanelLayout: (panel: string, settings: any) => void;
}

// ============================================================================
// 创建 Store
// ============================================================================

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      // ============================================================================
      // 初始状态
      // ============================================================================

      sidebarCollapsed: false,
      currentPath: "/",
      wsConnected: false,
      wsConnecting: false,
      theme: "dark",
      toasts: [],
      loading: false,
      dialogs: {},
      filters: {},
      tableSettings: {
        orders: {
          pageSize: 20,
          currentPage: 1,
        },
        logs: {
          pageSize: 50,
          currentPage: 1,
        },
      },
      panelLayout: {
        dashboard: {
          showStats: true,
          showChart: true,
          showPositions: true,
        },
      },

      // ============================================================================
      // 侧边栏
      // ============================================================================

      toggleSidebar: () => {
        set({ sidebarCollapsed: !get().sidebarCollapsed });
      },

      // ============================================================================
      // 路由
      // ============================================================================

      setCurrentPath: (path: string) => {
        set({ currentPath: path });
      },

      // ============================================================================
      // WebSocket 连接状态
      // ============================================================================

      setWsConnected: (connected: boolean) => {
        set({ wsConnected: connected });
      },

      setWsConnecting: (connecting: boolean) => {
        set({ wsConnecting: connecting });
      },

      // ============================================================================
      // 主题
      // ============================================================================

      setTheme: (theme: "light" | "dark") => {
        set({ theme });
        // 应用主题到 HTML 元素
        if (typeof document !== "undefined") {
          document.documentElement.classList.toggle("dark", theme === "dark");
        }
      },

      toggleTheme: () => {
        const newTheme = get().theme === "light" ? "dark" : "light";
        get().setTheme(newTheme);
      },

      // ============================================================================
      // Toast 通知
      // ============================================================================

      addToast: (message: string, type: "success" | "error" | "info" | "warning" = "info") => {
        const id = Date.now().toString();
        set({
          toasts: [
            ...get().toasts,
            { id, message, type, timestamp: Date.now() },
          ],
        });

        // 3 秒后自动移除
        setTimeout(() => {
          get().removeToast(id);
        }, 3000);
      },

      removeToast: (id: string) => {
        set({
          toasts: get().toasts.filter((t) => t.id !== id),
        });
      },

      clearToasts: () => {
        set({ toasts: [] });
      },

      // ============================================================================
      // 加载状态
      // ============================================================================

      setLoading: (loading: boolean) => {
        set({ loading });
      },

      // ============================================================================
      // 对话框
      // ============================================================================

      openDialog: (dialogKey: string) => {
        set({
          dialogs: {
            ...get().dialogs,
            [dialogKey]: true,
          },
        });
      },

      closeDialog: (dialogKey: string) => {
        set({
          dialogs: {
            ...get().dialogs,
            [dialogKey]: false,
          },
        });
      },

      toggleDialog: (dialogKey: string) => {
        set({
          dialogs: {
            ...get().dialogs,
            [dialogKey]: !get().dialogs[dialogKey],
          },
        });
      },

      // ============================================================================
      // 筛选器
      // ============================================================================

      setFilters: (category: string, filters: any) => {
        set({
          filters: {
            ...get().filters,
            [category]: filters,
          },
        });
      },

      clearFilters: (category: string) => {
        set({
          filters: {
            ...get().filters,
            [category]: {},
          },
        });
      },

      // ============================================================================
      // 表格视图设置
      // ============================================================================

      updateTableSetting: (tableKey: string, settings: any) => {
        set({
          tableSettings: {
            ...get().tableSettings,
            [tableKey]: {
              ...get().tableSettings[tableKey],
              ...settings,
            },
          },
        });
      },

      // ============================================================================
      // 面板布局
      // ============================================================================

      updatePanelLayout: (panel: string, settings: any) => {
        set({
          panelLayout: {
            ...get().panelLayout,
            [panel]: settings,
          },
        });
      },
    }),
    {
      name: "hummingbot-ui-storage",
      // 只持久化部分状态
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme,
        tableSettings: state.tableSettings,
        panelLayout: state.panelLayout,
      }),
    }
  )
);

// ============================================================================
// 选择器辅助函数
// ============================================================================

export const selectIsDialogOpen = (dialogKey: string) => (state: UIState) =>
  !!state.dialogs[dialogKey];

export const selectTableSettings = (tableKey: string) => (state: UIState) =>
  state.tableSettings[tableKey] || { pageSize: 20, currentPage: 1 };

export const selectFilters = (category: string) => (state: UIState) =>
  state.filters[category] || {};
