'use client';

import * as React from 'react';
import { ArrowUpRight, ArrowDownRight, Search, Filter, Download } from 'lucide-react';
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

const orders = [
  {
    id: 'ORD-001',
    type: 'buy',
    pair: 'BTC/USDT',
    price: '52,345.00',
    amount: '0.15',
    total: '7,851.75',
    strategy: 'PMM Strategy',
    status: 'filled',
    time: '2024-01-20 14:32:15',
  },
  {
    id: 'ORD-002',
    type: 'sell',
    pair: 'ETH/USDT',
    price: '2,856.00',
    amount: '3.2',
    total: '9,139.20',
    strategy: 'Arbitrage Bot',
    status: 'filled',
    time: '2024-01-20 14:28:42',
  },
  {
    id: 'ORD-003',
    type: 'buy',
    pair: 'SOL/USDT',
    price: '98.50',
    amount: '50',
    total: '4,925.00',
    strategy: 'Market Maker SOL',
    status: 'filled',
    time: '2024-01-20 14:25:18',
  },
  {
    id: 'ORD-004',
    type: 'sell',
    pair: 'BTC/USDT',
    price: '52,400.00',
    amount: '0.2',
    total: '10,480.00',
    strategy: 'PMM Strategy',
    status: 'filled',
    time: '2024-01-20 14:20:05',
  },
  {
    id: 'ORD-005',
    type: 'buy',
    pair: 'ETH/USDT',
    price: '2,850.00',
    amount: '1.5',
    total: '4,275.00',
    strategy: 'Arbitrage Bot',
    status: 'pending',
    time: '2024-01-20 14:15:33',
  },
  {
    id: 'ORD-006',
    type: 'sell',
    pair: 'XRP/USDT',
    price: '0.52',
    amount: '1000',
    total: '520.00',
    strategy: 'Cross Exchange',
    status: 'cancelled',
    time: '2024-01-20 14:10:28',
  },
  {
    id: 'ORD-007',
    type: 'buy',
    pair: 'BTC/USDT',
    price: '52,320.00',
    amount: '0.1',
    total: '5,232.00',
    strategy: 'PMM Strategy',
    status: 'filled',
    time: '2024-01-20 14:05:12',
  },
  {
    id: 'ORD-008',
    type: 'sell',
    pair: 'SOL/USDT',
    price: '98.75',
    amount: '30',
    total: '2,962.50',
    strategy: 'Market Maker SOL',
    status: 'filled',
    time: '2024-01-20 14:00:45',
  },
];

export default function OrdersPage() {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r bg-card">
        <div className="flex h-16 items-center border-b px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <ArrowUpRight className="h-5 w-5 text-primary-foreground" />
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
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Search by order ID or pair..." className="pl-9" />
                  </div>
                </div>
                <div className="w-[180px]">
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="All Strategies" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Strategies</SelectItem>
                      <SelectItem value="pmm">PMM Strategy</SelectItem>
                      <SelectItem value="arbitrage">Arbitrage Bot</SelectItem>
                      <SelectItem value="mm_sol">Market Maker SOL</SelectItem>
                      <SelectItem value="cross">Cross Exchange</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-[150px]">
                  <Select>
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
                  <Select>
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
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  More Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Orders Table */}
          <Card>
            <CardHeader>
              <CardTitle>Order History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Pair</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Strategy</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>
                        <div
                          className={`flex items-center gap-2 ${
                            order.type === 'buy' ? 'text-green-500' : 'text-red-500'
                          }`}
                        >
                          {order.type === 'buy' ? (
                            <ArrowUpRight className="h-4 w-4" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4" />
                          )}
                          <span className="capitalize">{order.type}</span>
                        </div>
                      </TableCell>
                      <TableCell>{order.pair}</TableCell>
                      <TableCell>${order.price}</TableCell>
                      <TableCell>{order.amount}</TableCell>
                      <TableCell>${order.total}</TableCell>
                      <TableCell>{order.strategy}</TableCell>
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
                      <TableCell className="text-muted-foreground">{order.time}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Showing 1-8 of 1,284 orders</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
