'use client';

import * as React from 'react';
import { Plus, Play, Pause, Edit, Trash2, Settings, Activity } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const strategies = [
  {
    id: 1,
    name: 'PMM Strategy',
    type: 'Pure Market Making',
    exchange: 'Binance',
    pair: 'BTC/USDT',
    status: 'running',
    profit: '+$523.00',
    trades: 324,
    created: '2024-01-15',
  },
  {
    id: 2,
    name: 'Arbitrage Bot',
    type: 'Arbitrage',
    exchange: 'Binance & Coinbase',
    pair: 'ETH/BTC',
    status: 'running',
    profit: '+$892.00',
    trades: 156,
    created: '2024-01-10',
  },
  {
    id: 3,
    name: 'Market Maker SOL',
    type: 'Pure Market Making',
    exchange: 'Binance',
    pair: 'SOL/USDT',
    status: 'paused',
    profit: '+$238.00',
    trades: 89,
    created: '2024-01-08',
  },
  {
    id: 4,
    name: 'Cross Exchange',
    type: 'Cross Exchange Market Making',
    exchange: 'Kraken & Binance',
    pair: 'XRP/USDT',
    status: 'stopped',
    profit: '-$45.00',
    trades: 23,
    created: '2024-01-05',
  },
];

export default function StrategiesPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);

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
            { title: 'Dashboard', href: '/' },
            { title: 'Strategies', href: '/strategies', active: true },
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
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-background">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Strategies</h1>
              <p className="text-muted-foreground">Manage and configure your trading strategies</p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Strategy
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Create New Strategy</DialogTitle>
                  <DialogDescription>
                    Configure a new trading strategy for your bot.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Strategy Name</Label>
                    <Input id="name" placeholder="Enter strategy name" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="type">Strategy Type</Label>
                    <Select>
                      <SelectTrigger id="type">
                        <SelectValue placeholder="Select strategy type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pmm">Pure Market Making</SelectItem>
                        <SelectItem value="arbitrage">Arbitrage</SelectItem>
                        <SelectItem value="ce_mm">Cross Exchange Market Making</SelectItem>
                        <SelectItem value="dca">DCA</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="exchange">Exchange</Label>
                    <Select>
                      <SelectTrigger id="exchange">
                        <SelectValue placeholder="Select exchange" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="binance">Binance</SelectItem>
                        <SelectItem value="coinbase">Coinbase</SelectItem>
                        <SelectItem value="kraken">Kraken</SelectItem>
                        <SelectItem value="gate">Gate.io</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="pair">Trading Pair</Label>
                    <Input id="pair" placeholder="e.g., BTC/USDT" />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setIsCreateDialogOpen(false)}>Create Strategy</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Strategies Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {strategies.map((strategy) => (
              <Card key={strategy.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {strategy.name}
                        <Badge
                          variant={
                            strategy.status === 'running'
                              ? 'default'
                              : strategy.status === 'paused'
                              ? 'secondary'
                              : 'outline'
                          }
                        >
                          {strategy.status}
                        </Badge>
                      </CardTitle>
                      <CardDescription>{strategy.type}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Exchange</span>
                      <span className="text-sm font-medium">{strategy.exchange}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Trading Pair</span>
                      <span className="text-sm font-medium">{strategy.pair}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Total Trades</span>
                      <span className="text-sm font-medium">{strategy.trades}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Profit/Loss</span>
                      <span
                        className={`text-sm font-medium ${
                          strategy.profit.startsWith('+') ? 'text-green-500' : 'text-red-500'
                        }`}
                      >
                        {strategy.profit}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Created</span>
                      <span className="text-sm font-medium">{strategy.created}</span>
                    </div>
                    <div className="flex gap-2 pt-2">
                      {strategy.status === 'running' ? (
                        <Button variant="outline" className="flex-1">
                          <Pause className="mr-2 h-4 w-4" />
                          Pause
                        </Button>
                      ) : (
                        <Button className="flex-1">
                          <Play className="mr-2 h-4 w-4" />
                          Start
                        </Button>
                      )}
                      <Button variant="outline" className="flex-1">
                        <Settings className="mr-2 h-4 w-4" />
                        Configure
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
