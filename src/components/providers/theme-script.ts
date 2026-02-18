'use client';

/**
 * 主题内联脚本
 * 在 React 挂载前立即执行，防止主题闪烁
 * 通过内联脚本在 HTML 渲染时应用主题
 */

export function getThemeScript() {
  return `
    (function() {
      const theme = localStorage.getItem('theme');
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      const resolvedTheme = theme === 'system' ? systemTheme : theme || systemTheme;
      
      if (resolvedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    })();
  `;
}
