'use client';

import * as React from 'react';
import { BarChart3, BookOpen, Link2, Settings, Terminal, Activity, TrendingUp } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

const navItems = [
  {
    title: 'Dashboard',
    href: '/',
    icon: Activity,
  },
  {
    title: 'Strategies',
    href: '/strategies',
    icon: TrendingUp,
  },
  {
    title: 'Orders',
    href: '/orders',
    icon: BarChart3,
  },
  {
    title: 'Connections',
    href: '/connections',
    icon: Link2,
  },
  {
    title: 'Logs',
    href: '/logs',
    icon: Terminal,
  },
  {
    title: 'Documentation',
    href: 'https://docs.hummingbot.org',
    icon: BookOpen,
    external: true,
  },
];

interface AppSidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  currentPath?: string;
}

export function AppSidebar({ className, currentPath = '/', ...props }: AppSidebarProps) {
  return (
    <div className={cn('flex flex-col h-screen border-r bg-card', className)} {...props}>
      <div className="flex h-16 items-center border-b px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Activity className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold">Hummingbot</span>
        </div>
      </div>
      <ScrollArea className="flex-1 px-3 py-2">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = !item.external && item.href === currentPath;
            return (
              <Button
                key={item.href}
                variant={isActive ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start',
                  isActive && 'bg-secondary'
                )}
                asChild={!item.external}
                onClick={item.external ? () => window.open(item.href, '_blank') : undefined}
              >
                {item.external ? (
                  <span className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    {item.title}
                  </span>
                ) : (
                  <a href={item.href} className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    {item.title}
                  </a>
                )}
              </Button>
            );
          })}
        </nav>
      </ScrollArea>
      <div className="border-t p-4">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          <span className="text-sm text-muted-foreground">Bot Running</span>
        </div>
      </div>
    </div>
  );
}
