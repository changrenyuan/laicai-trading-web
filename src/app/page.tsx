'use client';

import * as React from 'react';
import { Activity, ArrowUpRight, ArrowDownRight, DollarSign, TrendingUp, Clock, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function DashboardPage() {
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
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <span className="text-xs text-muted-foreground">Bot Running</span>
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
                <div className="h-2 w-2 rounded-full bg-green-500" />
                Connected
              </Badge>
              <Button variant="outline" size="sm">
                <Clock className="mr-2 h-4 w-4" />
                Uptime: 24h 15m
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
                <div className="text-2xl font-bold">$12,453.00</div>
                <p className="flex items-center text-xs text-muted-foreground">
                  <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />
                  <span className="text-green-500">+15.3%</span>
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
                <div className="text-2xl font-bold">1,284</div>
                <p className="flex items-center text-xs text-muted-foreground">
                  <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />
                  <span className="text-green-500">+124</span>
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
                <div className="text-2xl font-bold">94.2%</div>
                <p className="flex items-center text-xs text-muted-foreground">
                  <ArrowDownRight className="mr-1 h-3 w-3 text-red-500" />
                  <span className="text-red-500">-0.5%</span>
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
                <div className="text-2xl font-bold">3</div>
                <p className="flex items-center text-xs text-muted-foreground">
                  <span className="text-green-500">All running</span>
                  <span className="ml-1">smoothly</span>
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
                  {[
                    { name: 'PMM Strategy', pair: 'BTC/USDT', profit: '+$523.00', status: 'running' },
                    { name: 'Arbitrage', pair: 'ETH/BTC', profit: '+$892.00', status: 'running' },
                    { name: 'Market Making', pair: 'SOL/USDT', profit: '+$238.00', status: 'running' },
                  ].map((strategy, idx) => (
                    <div key={idx} className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{strategy.name}</p>
                          <Badge variant="outline" className="text-xs">
                            {strategy.pair}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{strategy.status}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-500">{strategy.profit}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Trades</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { type: 'buy', pair: 'BTC/USDT', price: '52,345.00', amount: '0.15', time: '2m ago' },
                    { type: 'sell', pair: 'ETH/USDT', price: '2,856.00', amount: '3.2', time: '5m ago' },
                    { type: 'buy', pair: 'SOL/USDT', price: '98.50', amount: '50', time: '8m ago' },
                    { type: 'sell', pair: 'BTC/USDT', price: '52,400.00', amount: '0.2', time: '12m ago' },
                  ].map((trade, idx) => (
                    <div key={idx} className="flex items-center justify-between rounded-lg border p-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full ${
                            trade.type === 'buy' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
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
                          <p className="text-sm text-muted-foreground">{trade.time}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${trade.price}</p>
                        <p className="text-sm text-muted-foreground">{trade.amount} {trade.pair.split('/')[0]}</p>
                      </div>
                    </div>
                  ))}
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
