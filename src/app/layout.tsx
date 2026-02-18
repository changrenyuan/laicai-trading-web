import type { Metadata } from 'next';
import { Inspector } from 'react-dev-inspector';
import { WSProvider } from '@/components/WSProvider';
import { ThemeScript } from '@/components/ThemeScript';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Hummingbot Web UI',
    template: '%s | Hummingbot',
  },
  description: 'Hummingbot - 开源加密货币交易机器人管理界面',
  keywords: ['Hummingbot', '加密货币交易', '量化交易', '交易机器人', '做市策略'],
  authors: [{ name: 'Hummingbot Team' }],
  generator: 'Hummingbot Web UI',
  openGraph: {
    title: 'Hummingbot Web UI - 加密货币交易机器人管理',
    description: '开源、灵活的加密货币交易机器人管理界面',
    siteName: 'Hummingbot',
    locale: 'en_US',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDev = process.env.NODE_ENV === 'development';

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className={`antialiased bg-background text-foreground`}>
        <WSProvider>
          {isDev && <Inspector />}
          {children}
        </WSProvider>
      </body>
    </html>
  );
}
