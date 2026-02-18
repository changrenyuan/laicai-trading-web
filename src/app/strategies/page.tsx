'use client';

import * as React from 'react';
import { Plus, Play, Pause, Edit, Trash2, Settings, Activity, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SidebarLayout } from '@/components/SidebarLayout';
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
import { useEngineStore, useUIStore } from '@/store';
import {
  startStrategy,
  stopStrategy,
  pauseStrategy,
  resumeStrategy,
  deleteStrategy,
  createStrategy,
} from '@/core/command';

export default function StrategiesPage() {
  const engine = useEngineStore();
  const ui = useUIStore();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const [operatingId, setOperatingId] = React.useState<string | null>(null);
  const [strategyName, setStrategyName] = React.useState('');
  const [strategyType, setStrategyType] = React.useState('');
  const [exchange, setExchange] = React.useState('');
  const [pair, setPair] = React.useState('');

  // 获取策略列表
  const strategiesList = engine.strategies;

  // 统计数据
  const stats = {
    total: strategiesList.length,
    running: strategiesList.filter((s) => s.status === 'running').length,
    paused: strategiesList.filter((s) => s.status === 'paused').length,
    stopped: strategiesList.filter((s) => s.status === 'stopped').length,
    totalProfit: strategiesList.reduce((sum, s) => sum + s.profit, 0),
  };

  // 创建策略
  const handleCreateStrategy = async () => {
    if (!strategyName || !strategyType || !exchange || !pair) {
      ui.addToast('Please fill in all fields', 'error');
      return;
    }

    try {
      await createStrategy({
        name: strategyName,
        type: strategyType,
        exchange,
        pair,
      });
      setIsCreateDialogOpen(false);
      setStrategyName('');
      setStrategyType('');
      setExchange('');
      setPair('');
      ui.addToast('Strategy created successfully', 'success');
    } catch (error) {
      ui.addToast('Failed to create strategy', 'error');
    }
  };

  // 启动策略
  const handleStartStrategy = async (strategyId: string) => {
    setOperatingId(strategyId);
    try {
      await startStrategy(strategyId);
      ui.addToast('Strategy started successfully', 'success');
    } catch (error) {
      ui.addToast('Failed to start strategy', 'error');
    } finally {
      setOperatingId(null);
    }
  };

  // 停止策略
  const handleStopStrategy = async (strategyId: string) => {
    if (!confirm('Are you sure you want to stop this strategy?')) {
      return;
    }

    setOperatingId(strategyId);
    try {
      await stopStrategy(strategyId);
      ui.addToast('Strategy stopped successfully', 'success');
    } catch (error) {
      ui.addToast('Failed to stop strategy', 'error');
    } finally {
      setOperatingId(null);
    }
  };

  // 暂停策略
  const handlePauseStrategy = async (strategyId: string) => {
    setOperatingId(strategyId);
    try {
      await pauseStrategy(strategyId);
      ui.addToast('Strategy paused successfully', 'success');
    } catch (error) {
      ui.addToast('Failed to pause strategy', 'error');
    } finally {
      setOperatingId(null);
    }
  };

  // 恢复策略
  const handleResumeStrategy = async (strategyId: string) => {
    setOperatingId(strategyId);
    try {
      await resumeStrategy(strategyId);
      ui.addToast('Strategy resumed successfully', 'success');
    } catch (error) {
      ui.addToast('Failed to resume strategy', 'error');
    } finally {
      setOperatingId(null);
    }
  };

  // 删除策略
  const handleDeleteStrategy = async (strategyId: string) => {
    if (!confirm('Are you sure you want to delete this strategy?')) {
      return;
    }

    setOperatingId(strategyId);
    try {
      await deleteStrategy(strategyId);
      ui.addToast('Strategy deleted successfully', 'success');
    } catch (error) {
      ui.addToast('Failed to delete strategy', 'error');
    } finally {
      setOperatingId(null);
    }
  };

  // 格式化盈亏
  const formatProfit = (profit: number) => {
    const sign = profit >= 0 ? '+' : '';
    return `${sign}$${profit.toFixed(2)}`;
  };

  return (
    <SidebarLayout>
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
                    <Input
                      id="name"
                      placeholder="Enter strategy name"
                      value={strategyName}
                      onChange={(e) => setStrategyName(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="type">Strategy Type</Label>
                    <Select value={strategyType} onValueChange={setStrategyType}>
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
                    <Select value={exchange} onValueChange={setExchange}>
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
                    <Input
                      id="pair"
                      placeholder="e.g., BTC/USDT"
                      value={pair}
                      onChange={(e) => setPair(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateStrategy}>Create Strategy</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Strategies</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Running</CardTitle>
                <div className="h-2 w-2 rounded-full bg-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">{stats.running}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Paused</CardTitle>
                <div className="h-2 w-2 rounded-full bg-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-500">{stats.paused}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
                <div
                  className={`h-2 w-2 rounded-full ${
                    stats.totalProfit >= 0 ? 'bg-green-500' : 'bg-red-500'
                  }`}
                />
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold ${
                    stats.totalProfit >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  {formatProfit(stats.totalProfit)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Strategies Grid */}
          {strategiesList.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Activity className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-lg font-medium">No strategies yet</p>
                <p className="text-sm text-muted-foreground">Create your first strategy to get started</p>
                <Button className="mt-4" onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Strategy
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {strategiesList.map((strategy) => (
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
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteStrategy(strategy.id)}
                          disabled={operatingId === strategy.id}
                        >
                          {operatingId === strategy.id ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
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
                            strategy.profit >= 0 ? 'text-green-500' : 'text-red-500'
                          }`}
                        >
                          {formatProfit(strategy.profit)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Created</span>
                        <span className="text-sm font-medium">{strategy.created}</span>
                      </div>
                      <div className="flex gap-2 pt-2">
                        {strategy.status === 'running' ? (
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => handlePauseStrategy(strategy.id)}
                            disabled={operatingId === strategy.id}
                          >
                            {operatingId === strategy.id ? (
                              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Pause className="mr-2 h-4 w-4" />
                            )}
                            Pause
                          </Button>
                        ) : strategy.status === 'paused' ? (
                          <Button
                            className="flex-1"
                            onClick={() => handleResumeStrategy(strategy.id)}
                            disabled={operatingId === strategy.id}
                          >
                            {operatingId === strategy.id ? (
                              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Play className="mr-2 h-4 w-4" />
                            )}
                            Resume
                          </Button>
                        ) : (
                          <Button
                            className="flex-1"
                            onClick={() => handleStartStrategy(strategy.id)}
                            disabled={operatingId === strategy.id}
                          >
                            {operatingId === strategy.id ? (
                              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Play className="mr-2 h-4 w-4" />
                            )}
                            Start
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleStopStrategy(strategy.id)}
                          disabled={operatingId === strategy.id || strategy.status === 'stopped'}
                        >
                          {operatingId === strategy.id ? (
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Settings className="mr-2 h-4 w-4" />
                          )}
                          Configure
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
}
