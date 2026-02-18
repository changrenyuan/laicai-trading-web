'use client';

/**
 * 布局组件 - 包含侧边栏
 */

import * as React from 'react';
import { Activity } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/theme-toggle';
import { useEngineStore } from '@/store';

interface SidebarLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { title: 'Dashboard', href: '/' },
  { title: 'Strategies', href: '/strategies' },
  { title: 'Orders', href: '/orders' },
  { title: 'Connections', href: '/connections' },
  { title: 'Logs', href: '/logs' },
];

export function SidebarLayout({ children }: SidebarLayoutProps) {
  const pathname = usePathname();
  const engine = useEngineStore();

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r bg-card">
        <div className="flex h-16 items-center border-b px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Activity className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold">Hummingbot</span>
          </div>
        </div>
        <nav className="space-y-1 p-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-secondary text-foreground'
                    : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                }`}
              >
                {item.title}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-4 left-4 right-4 space-y-3">
          <div className="flex items-center gap-2 rounded-lg border bg-card p-3">
            <div
              className={`h-2 w-2 rounded-full ${
                engine.isConnected ? 'bg-green-500' : 'bg-red-500'
              }`}
            />
            <span className="text-xs text-muted-foreground">
              {engine.isConnected ? 'Bot Running' : 'Bot Stopped'}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg border bg-card px-3 py-2">
            <span className="text-xs text-muted-foreground">主题</span>
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-background">
        {children}
      </main>
    </div>
  );
}
