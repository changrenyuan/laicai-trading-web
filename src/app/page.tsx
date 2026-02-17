'use client';

import * as React from 'react';
import { Activity, ArrowUpRight, ArrowDownRight, DollarSign, TrendingUp, Clock, Zap, Pause, Play } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useEngineStore, useUIStore } from '@/store';
import { sendCommand } from '@/core/command';

export default function DashboardPage() {
  const engine = useEngineStore();
  const ui = useUIStore();

  // 转换交易数据格式
  const recentTrades = engine.trades.map(trade => ({
    id: trade.trade_id,
    type: trade.side,
    pair: trade.symbol,
    price: trade.price.toFixed(2),
    amount: trade.amount.toFixed(2),
    timestamp: new Date(trade.timestamp * 1000).toISOString(),
  }));

  // 启动/停止引擎
  const toggleEngine = () => {
    if (engine.isConnected) {
      sendCommand('stop');
    } else {
      sendCommand('start');
    }
  };

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
          {[
            { title: 'Dashboard', href: '/', active: true },
            { title: 'Strategies', href: '/strategies' },
            { title: 'Orders', href: '/orders' },
            { title: 'Connections', href: '/connections' },
            { title: 'Logs', href: '/logs' },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                item.active
                  ? 'bg-secondary text-foreground'
                  : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
              }`}
            >
              {item.title}
            </a>
          ))}
        </nav>
        <div className="absolute bottom-4 left-4 right-4">
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
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-background">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground">Monitor your trading bot performance</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                <div
                  className={`h-2 w-2 rounded-full ${
                    ui.wsStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'
                  }`}
                />
                {ui.wsStatus === 'connected' ? 'Connected' : 'Disconnected'}
              </Badge>
              <Button variant="outline" size="sm" onClick={toggleEngine}>
                {engine.isConnected ? (
                  <>
                    <Pause className="mr-2 h-4 w-4" />
                    Stop
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Start
                  </>
                )}
              </Button>
              <Button variant="outline" size="sm">
                <Clock className="mr-2 h-4 w-4" />
                Uptime: {formatUptime(engine.uptime)}
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${engine.stats.totalProfit.toFixed(2)}
                </div>
                <p className="flex items-center text-xs text-muted-foreground">
                  <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />
                  <span className="text-green-500">
                    +{engine.stats.profitChange.toFixed(1)}%
                  </span>
                  <span className="ml-1">from last month</span>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{engine.stats.totalTrades}</div>
                <p className="flex items-center text-xs text-muted-foreground">
                  <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />
                  <span className="text-green-500">
                    +{engine.stats.tradesToday}
                  </span>
                  <span className="ml-1">today</span>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {engine.stats.successRate.toFixed(1)}%
                </div>
                <p className="flex items-center text-xs text-muted-foreground">
                  <ArrowDownRight className="mr-1 h-3 w-3 text-red-500" />
                  <span className="text-red-500">
                    {engine.stats.successRateChange.toFixed(1)}%
                  </span>
                  <span className="ml-1">from yesterday</span>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Strategies</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {engine.strategies.filter((s) => s.status === 'running').length}
                </div>
                <p className="flex items-center text-xs text-muted-foreground">
                  <span className="text-green-500">
                    {engine.strategies.filter((s) => s.status === 'running').length} running
                  </span>
                  <span className="ml-1">
                    {' '}
                    of {engine.strategies.length} total
                  </span>
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Strategy Performance */}
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Active Strategies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {engine.strategies.map((strategy) => (
                    <div key={strategy.id} className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{strategy.name}</p>
                          <Badge variant="outline" className="text-xs">
                            {strategy.pair}
                          </Badge>
                          <Badge
                            variant={strategy.status === 'running' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {strategy.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {strategy.status === 'running' ? 'Running smoothly' : 'Not active'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${strategy.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {strategy.profit >= 0 ? '+' : ''}${strategy.profit.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                  {engine.strategies.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No active strategies
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Trades</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTrades.slice(0, 5).map((trade) => (
                    <div key={trade.id} className="flex items-center justify-between rounded-lg border p-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full ${
                            trade.type === 'buy'
                              ? 'bg-green-500/10 text-green-500'
                              : 'bg-red-500/10 text-red-500'
                          }`}
                        >
                          {trade.type === 'buy' ? (
                            <ArrowUpRight className="h-4 w-4" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{trade.pair}</p>
                          <p className="text-sm text-muted-foreground">{formatTimeAgo(trade.timestamp)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${trade.price}</p>
                        <p className="text-sm text-muted-foreground">
                          {trade.amount} {trade.pair.split('/')[0]}
                        </p>
                      </div>
                    </div>
                  ))}
                  {recentTrades.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">No recent trades</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Chart Placeholder */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Performance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed">
                <div className="text-center">
                  <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-2 text-sm text-muted-foreground">Performance chart will be rendered here</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

// 格式化运行时间
function formatUptime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours}h ${minutes}m ${secs}s`;
}

// 格式化时间差
function formatTimeAgo(timestamp: string): string {
  const now = Date.now();
  const time = new Date(timestamp).getTime();
  const diff = Math.floor((now - time) / 1000);

  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}
