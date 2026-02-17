'use client';

import * as React from 'react';
import { ArrowUpRight, ArrowDownRight, Search, Filter, Download, X, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useEngineStore, useUIStore } from '@/store';
import { cancelOrder, cancelAllOrders } from '@/core/command';

export default function OrdersPage() {
  const engine = useEngineStore();
  const ui = useUIStore();

  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterStrategy, setFilterStrategy] = React.useState('all');
  const [filterStatus, setFilterStatus] = React.useState('all');
  const [filterType, setFilterType] = React.useState('all');
  const [cancellingOrderId, setCancellingOrderId] = React.useState<string | null>(null);

  // 获取订单列表
  const ordersList = engine.getOrdersList();

  // 筛选订单
  const filteredOrders = ordersList.filter((order) => {
    // 搜索筛选
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      if (
        !order.orderId.toLowerCase().includes(term) &&
        !order.symbol.toLowerCase().includes(term)
      ) {
        return false;
      }
    }

    // 策略筛选
    if (filterStrategy !== 'all' && order.strategy !== filterStrategy) {
      return false;
    }

    // 状态筛选
    if (filterStatus !== 'all' && order.status !== filterStatus) {
      return false;
    }

    // 类型筛选
    if (filterType !== 'all' && order.side !== filterType) {
      return false;
    }

    return true;
  });

  // 统计数据
  const stats = {
    total: ordersList.length,
    filled: ordersList.filter((o) => o.status === 'filled').length,
    pending: ordersList.filter((o) => o.status === 'pending').length,
    cancelled: ordersList.filter((o) => o.status === 'cancelled').length,
  };

  // 取消订单
  const handleCancelOrder = async (orderId: string) => {
    setCancellingOrderId(orderId);
    try {
      await cancelOrder(orderId);
      ui.addToast('Order cancelled successfully', 'success');
    } catch (error) {
      ui.addToast('Failed to cancel order', 'error');
    } finally {
      setCancellingOrderId(null);
    }
  };

  // 取消所有待处理订单
  const handleCancelAllPending = async () => {
    const pendingOrders = ordersList.filter((o) => o.status === 'pending');
    if (pendingOrders.length === 0) {
      ui.addToast('No pending orders to cancel', 'info');
      return;
    }

    if (!confirm(`Cancel ${pendingOrders.length} pending orders?`)) {
      return;
    }

    try {
      await cancelAllOrders();
      ui.addToast('All pending orders cancelled', 'success');
    } catch (error) {
      ui.addToast('Failed to cancel orders', 'error');
    }
  };

  // 格式化时间
  const formatTime = (timestamp?: string | number) => {
    if (!timestamp) return 'N/A';
    const date = new Date(typeof timestamp === 'number' ? timestamp * 1000 : timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  // 获取唯一策略列表
  const uniqueStrategies = Array.from(
    new Set(ordersList.map((o) => o.strategy).filter((s): s is string => Boolean(s)))
  );

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
            { title: 'Strategies', href: '/strategies' },
            { title: 'Orders', href: '/orders', active: true },
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
                ui.wsStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'
              }`}
            />
            <span className="text-xs text-muted-foreground">
              {ui.wsStatus === 'connected' ? 'Connected' : 'Disconnected'}
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
              <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
              <p className="text-muted-foreground">View and manage your trading orders</p>
            </div>
            <div className="flex gap-2">
              {stats.pending > 0 && (
                <Button variant="outline" onClick={handleCancelAllPending}>
                  <X className="mr-2 h-4 w-4" />
                  Cancel All Pending
                </Button>
              )}
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search by order ID or pair..."
                      className="pl-9"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="w-[180px]">
                  <Select value={filterStrategy} onValueChange={setFilterStrategy}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Strategies" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Strategies</SelectItem>
                      {uniqueStrategies.map((strategy) => (
                        <SelectItem key={strategy} value={strategy}>
                          {strategy}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-[150px]">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="filled">Filled</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-[150px]">
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="buy">Buy</SelectItem>
                      <SelectItem value="sell">Sell</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {(searchTerm ||
                  filterStrategy !== 'all' ||
                  filterStatus !== 'all' ||
                  filterType !== 'all') && (
                  <Button variant="ghost" onClick={() => {
                    setSearchTerm('');
                    setFilterStrategy('all');
                    setFilterStatus('all');
                    setFilterType('all');
                  }}>
                    Clear Filters
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Filled</CardTitle>
                <div className="h-2 w-2 rounded-full bg-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">{stats.filled}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <div className="h-2 w-2 rounded-full bg-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-500">{stats.pending}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
                <div className="h-2 w-2 rounded-full bg-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">{stats.cancelled}</div>
              </CardContent>
            </Card>
          </div>

          {/* Orders Table */}
          <Card>
            <CardHeader>
              <CardTitle>
                Order History ({filteredOrders.length} of {stats.total})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredOrders.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Search className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p>No orders found</p>
                  <p className="text-sm">Try adjusting your filters</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Pair</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Filled</TableHead>
                      <TableHead>Remaining</TableHead>
                      <TableHead>Strategy</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.orderId}>
                        <TableCell className="font-medium">{order.orderId}</TableCell>
                        <TableCell>
                          <div
                            className={`flex items-center gap-2 ${
                              order.side === 'buy' ? 'text-green-500' : 'text-red-500'
                            }`}
                          >
                            {order.side === 'buy' ? (
                              <ArrowUpRight className="h-4 w-4" />
                            ) : (
                              <ArrowDownRight className="h-4 w-4" />
                            )}
                            <span className="capitalize">{order.side}</span>
                          </div>
                        </TableCell>
                        <TableCell>{order.symbol}</TableCell>
                        <TableCell>${order.price.toFixed(2)}</TableCell>
                        <TableCell>{order.filled.toFixed(4)}</TableCell>
                        <TableCell>{order.remaining.toFixed(4)}</TableCell>
                        <TableCell>{order.strategy || '-'}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              order.status === 'filled'
                                ? 'default'
                                : order.status === 'pending'
                                ? 'secondary'
                                : 'outline'
                            }
                          >
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {formatTime(order.updateTime)}
                        </TableCell>
                        <TableCell className="text-right">
                          {order.status === 'pending' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCancelOrder(order.orderId)}
                              disabled={cancellingOrderId === order.orderId}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Pagination Info */}
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {filteredOrders.length} of {stats.total} orders
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
