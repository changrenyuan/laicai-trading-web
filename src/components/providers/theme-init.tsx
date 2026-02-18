'use client';

/**
 * 主题初始化脚本
 * 在页面渲染前从 localStorage 读取主题设置，防止主题闪烁
 * 使用内联脚本确保在 React 挂载前执行
 */

import { useEffect } from 'react';

export function ThemeScript() {
  useEffect(() => {
    const root = window.document.documentElement;

    // 从 localStorage 读取主题设置
    const theme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;

    // 系统主题检测
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

    // 确定实际使用的主题
    const resolvedTheme = theme === 'system' ? systemTheme : theme || systemTheme;

    // 应用主题
    if (resolvedTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // 监听系统主题变化
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (theme === 'system') {
        if (e.matches) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      }
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return null;
}
