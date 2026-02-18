/**
 * Head 组件
 * 在页面头部添加必要的标签和脚本
 */

export function Head({ title = 'Hummingbot Web UI' }: { title?: string }) {
  return (
    <>
      {/* 主题初始化脚本 - 防止主题闪烁 */}
      <script dangerouslySetInnerHTML={{ __html: `
        (function() {
          try {
            const theme = localStorage.getItem('theme');
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            const resolvedTheme = theme === 'system' ? systemTheme : theme || systemTheme;
            
            if (resolvedTheme === 'dark') {
              document.documentElement.classList.add('dark');
            } else {
              document.documentElement.classList.remove('dark');
            }
          } catch (e) {
            console.error('Failed to initialize theme:', e);
          }
        })();
      `}} />

      {/* 防止主题不匹配警告 */}
      <style>{`
        /* 隐藏未初始化的 UI，防止闪烁 */
        [data-theme-loading] {
          display: none;
        }
      `}</style>
    </>
  );
}
