'use client';

/**
 * 日志查看页面 - 事件驱动版本
 *
 * 不再使用轮询，所有日志通过 WebSocket 实时推送
 * 页面只负责渲染，不主动请求数据
 */

import * as React from 'react';
import { Search, Trash2, Pause, Play, RefreshCw, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { SidebarLayout } from '@/components/SidebarLayout';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useEngineStore } from '@/store/engineStore';
import { useUIStore } from '@/store/uiStore';
import { engineWS, WSConnectionState } from '@/core/ws';

export default function LogsPage() {
  // 从全局 store 获取日志数据（不再使用本地状态）
  const logs = useEngineStore((state) => state.logs);
  const wsConnected = useUIStore((state) => state.wsConnected);

  // UI 状态
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filterLevel, setFilterLevel] = React.useState('all');
  const [filterSource, setFilterSource] = React.useState('all');
  const [isPaused, setIsPaused] = React.useState(false);

  // 计算统计
  const stats = React.useMemo(() => {
    return {
      total: logs.length,
      error: logs.filter((l) => l.level === 'error').length,
      warning: logs.filter((l) => l.level === 'warn').length,
      success: logs.filter((l) => l.level === 'info' || l.level === 'debug').length,
    };
  }, [logs]);

  // 过滤日志
  const filteredLogs = React.useMemo(() => {
    return logs.filter((log) => {
      if (filterLevel !== 'all' && log.level !== filterLevel) return false;
      if (filterSource !== 'all' && log.source !== filterSource) return false;
      if (searchQuery && !log.msg.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [logs, filterLevel, filterSource, searchQuery]);

  // 获取唯一来源列表
  const uniqueSources = React.useMemo(() => {
    const sources = new Set(logs.map((l) => l.source));
    return Array.from(sources).sort();
  }, [logs]);

  // 获取日志级别颜色
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'text-red-500';
      case 'warn':
        return 'text-yellow-500';
      case 'success':
      case 'info':
        return 'text-green-500';
      case 'debug':
        return 'text-blue-500';
      default:
        return 'text-muted-foreground';
    }
  };

  // 获取日志级别 Badge 变体
  const getLevelBadgeVariant = (level: string) => {
    switch (level) {
      case 'error':
        return 'destructive';
      case 'warn':
        return 'secondary';
      case 'info':
      case 'success':
        return 'default';
      case 'debug':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <SidebarLayout>
      <div className="p-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">System Logs</h1>
              <p className="text-muted-foreground">实时监控交易系统日志（事件驱动）</p>
            </div>
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-muted-foreground">
                {wsConnected ? '已连接' : '未连接'}
              </span>
            </div>
          </div>

          {/* Connection Status Card */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <CheckCircle className={`h-8 w-8 ${wsConnected ? 'text-green-500' : 'text-red-500'}`} />
                <div>
                  <p className="font-semibold">
                    {wsConnected ? 'WebSocket 已连接' : 'WebSocket 未连接'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {wsConnected
                      ? '日志将实时推送，无需轮询'
                      : '等待连接...'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="搜索日志内容..."
                      className="pl-9"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <div className="w-[180px]">
                  <Select value={filterLevel} onValueChange={setFilterLevel}>
                    <SelectTrigger>
                      <SelectValue placeholder="所有级别" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">所有级别</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                      <SelectItem value="warn">Warning</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="debug">Debug</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-[180px]">
                  <Select value={filterSource} onValueChange={setFilterSource}>
                    <SelectTrigger>
                      <SelectValue placeholder="所有来源" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">所有来源</SelectItem>
                      {uniqueSources.map((source) => (
                        <SelectItem key={source} value={source}>
                          {source}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setIsPaused(!isPaused)}
                  className={isPaused ? 'bg-secondary' : ''}
                >
                  {isPaused ? (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      恢复
                    </>
                  ) : (
                    <>
                      <Pause className="mr-2 h-4 w-4" />
                      暂停
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={() => setIsPaused(false)}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  滚动到底部
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Logs Display */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  实时日志 ({filteredLogs.length} / {stats.total})
                </CardTitle>
                <div className="flex items-center gap-2">
                  {isPaused && (
                    <Badge variant="secondary">已暂停</Badge>
                  )}
                  {wsConnected && (
                    <Badge variant="default" className="gap-1">
                      <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                      实时推送
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] w-full rounded-md border bg-muted/50 p-4">
                {filteredLogs.length > 0 ? (
                  <div className="space-y-1 font-mono text-sm">
                    {filteredLogs.map((log, idx) => (
                      <div
                        key={`${log.timestamp}-${idx}`}
                        className="flex gap-4 rounded-lg bg-background p-2 hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex-shrink-0 text-muted-foreground w-[180px] text-xs">
                          {log.timestamp}
                        </div>
                        <div className={`flex-shrink-0 font-semibold w-[80px] text-xs uppercase ${getLevelColor(log.level)}`}>
                          {log.level}
                        </div>
                        <div className="flex-shrink-0 font-medium w-[150px] text-xs text-muted-foreground">
                          {log.source}
                        </div>
                        <div className="flex-1 text-xs">{log.msg}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-32 text-muted-foreground">
                    {wsConnected ? '暂无日志' : '等待连接...'}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Log Statistics */}
          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">总日志数</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">错误</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">{stats.error}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">警告</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-500">{stats.warning}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">信息</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">{stats.success}</div>
              </CardContent>
            </Card>
          </div>

          {/* Architecture Info */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>架构说明</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>✅ <strong>事件驱动架构：</strong>所有日志通过 WebSocket 实时推送，无需轮询</p>
                <p>✅ <strong>全局状态管理：</strong>日志存储在 Zustand Store 中，所有页面共享</p>
                <p>✅ <strong>零本地状态：</strong>页面只负责渲染，不保存任何日志数据</p>
                <p>✅ <strong>自动重连：</strong>连接断开后自动重连，状态自动恢复</p>
                <p>✅ <strong>性能优化：</strong>最多保留 500 条日志，自动清理旧日志</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarLayout>
  );
}
