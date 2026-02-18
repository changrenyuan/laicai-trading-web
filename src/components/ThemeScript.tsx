import Script from 'next/script';

/**
 * 主题初始化脚本
 * 在页面加载前立即执行，防止主题闪烁
 */

const THEME_SCRIPT = `
(function() {
  try {
    // 从 zustand persist 中读取主题设置
    var storage = localStorage.getItem('hummingbot-ui-storage');
    var theme = 'dark'; // 默认主题
    
    if (storage) {
      try {
        var parsed = JSON.parse(storage);
        if (parsed.state && parsed.state.theme) {
          theme = parsed.state.theme;
        }
      } catch (e) {
        console.error('Failed to parse storage:', e);
      }
    }
    
    // 立即应用主题
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
  } catch (e) {
    console.error('Theme initialization failed:', e);
  }
})();
`;

export function ThemeScript() {
  return (
    <Script
      id="theme-init"
      strategy="beforeInteractive"
      dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }}
    />
  );
}
