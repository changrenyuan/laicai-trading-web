'use client';

import * as React from 'react';
import { Search, Filter, Download, Terminal, Pause, Play, Trash2, RefreshCw } from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

// Mock log entries
const mockLogs = [
  {
    timestamp: '2024-01-20 14:32:15',
    level: 'INFO',
    source: 'PMM Strategy',
    message: 'Placing buy order on Binance BTC/USDT at 52,345.00',
  },
  {
    timestamp: '2024-01-20 14:32:16',
    level: 'INFO',
    source: 'PMM Strategy',
    message: 'Order ORD-001 successfully placed',
  },
  {
    timestamp: '2024-01-20 14:32:18',
    level: 'SUCCESS',
    source: 'PMM Strategy',
    message: 'Order ORD-001 filled at 52,345.00',
  },
  {
    timestamp: '2024-01-20 14:32:20',
    level: 'INFO',
    source: 'Arbitrage Bot',
    message: 'Checking arbitrage opportunity for ETH/BTC',
  },
  {
    timestamp: '2024-01-20 14:32:22',
    level: 'INFO',
    source: 'Arbitrage Bot',
    message: 'Found arbitrage opportunity: spread 0.5%',
  },
  {
    timestamp: '2024-01-20 14:32:25',
    level: 'INFO',
    source: 'Arbitrage Bot',
    message: 'Placing sell order on Coinbase ETH/USDT at 2,856.00',
  },
  {
    timestamp: '2024-01-20 14:32:30',
    level: 'WARNING',
    source: 'Market Maker SOL',
    message: 'Inventory imbalance detected for SOL/USDT',
  },
  {
    timestamp: '2024-01-20 14:32:35',
    level: 'INFO',
    source: 'Market Maker SOL',
    message: 'Adjusting spread to 0.3% to rebalance',
  },
  {
    timestamp: '2024-01-20 14:32:40',
    level: 'INFO',
    source: 'Cross Exchange',
    message: 'Connecting to Kraken testnet...',
  },
  {
    timestamp: '2024-01-20 14:32:45',
    level: 'ERROR',
    source: 'Cross Exchange',
    message: 'Connection failed: Invalid API credentials',
  },
  {
    timestamp: '2024-01-20 14:33:00',
    level: 'INFO',
    source: 'PMM Strategy',
    message: 'Placing sell order on Binance BTC/USDT at 52,400.00',
  },
  {
    timestamp: '2024-01-20 14:33:02',
    level: 'SUCCESS',
    source: 'PMM Strategy',
    message: 'Order ORD-004 filled at 52,400.00',
  },
  {
    timestamp: '2024-01-20 14:33:05',
    level: 'INFO',
    source: 'Arbitrage Bot',
    message: 'Placing buy order on Binance ETH/USDT at 2,850.00',
  },
  {
    timestamp: '2024-01-20 14:33:10',
    level: 'INFO',
    source: 'System',
    message: 'Heartbeat: All systems operational',
  },
  {
    timestamp: '2024-01-20 14:33:15',
    level: 'INFO',
    source: 'Market Maker SOL',
    message: 'Cancelling stale orders older than 5 minutes',
  },
];

export default function LogsPage() {
  const [logs, setLogs] = React.useState(mockLogs);
  const [isPaused, setIsPaused] = React.useState(false);
  const [filterLevel, setFilterLevel] = React.useState('all');
  const [filterSource, setFilterSource] = React.useState('all');
  const [searchQuery, setSearchQuery] = React.useState('');

  // Simulate real-time logs
  React.useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      const newLog = {
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        level: ['INFO', 'SUCCESS', 'WARNING', 'ERROR'][Math.floor(Math.random() * 4)] as any,
        source: ['PMM Strategy', 'Arbitrage Bot', 'Market Maker SOL', 'System'][
          Math.floor(Math.random() * 4)
        ],
        message: [
          'Processing market data update',
          'Checking order book depth',
          'Evaluating trade opportunity',
          'Monitoring price movements',
          'Syncing with exchange',
        ][Math.floor(Math.random() * 5)],
      };

      setLogs((prev) => [newLog, ...prev].slice(0, 100));
    }, 3000);

    return () => clearInterval(interval);
  }, [isPaused]);

  const filteredLogs = logs.filter((log) => {
    if (filterLevel !== 'all' && log.level.toLowerCase() !== filterLevel) return false;
    if (filterSource !== 'all' && log.source !== filterSource) return false;
    if (searchQuery && !log.message.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const getLevelBadgeVariant = (level: string) => {
    switch (level) {
      case 'SUCCESS':
        return 'default';
      case 'WARNING':
        return 'secondary';
      case 'ERROR':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'SUCCESS':
        return 'text-green-500';
      case 'WARNING':
        return 'text-yellow-500';
      case 'ERROR':
        return 'text-red-500';
      default:
        return 'text-blue-500';
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r bg-card">
        <div className="flex h-16 items-center border-b px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Terminal className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold">Hummingbot</span>
          </div>
        </div>
        <nav className="space-y-1 p-4">
          {[
            { title: 'Dashboard', href: '/' },
            { title: 'Strategies', href: '/strategies' },
            { title: 'Orders', href: '/orders' },
            { title: 'Connections', href: '/connections' },
            { title: 'Logs', href: '/logs', active: true },
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
              <h1 className="text-3xl font-bold tracking-tight">System Logs</h1>
              <p className="text-muted-foreground">Monitor real-time bot activity and system events</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setLogs([])}>
                <Trash2 className="mr-2 h-4 w-4" />
                Clear
              </Button>
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
                      placeholder="Search logs..."
                      className="pl-9"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <div className="w-[180px]">
                  <Select value={filterLevel} onValueChange={setFilterLevel}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-[180px]">
                  <Select value={filterSource} onValueChange={setFilterSource}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Sources" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sources</SelectItem>
                      <SelectItem value="PMM Strategy">PMM Strategy</SelectItem>
                      <SelectItem value="Arbitrage Bot">Arbitrage Bot</SelectItem>
                      <SelectItem value="Market Maker SOL">Market Maker SOL</SelectItem>
                      <SelectItem value="Cross Exchange">Cross Exchange</SelectItem>
                      <SelectItem value="System">System</SelectItem>
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
                      Resume
                    </>
                  ) : (
                    <>
                      <Pause className="mr-2 h-4 w-4" />
                      Pause
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Logs Display */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Live Logs</CardTitle>
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${isPaused ? 'bg-yellow-500' : 'bg-green-500'}`} />
                  <span className="text-sm text-muted-foreground">
                    {isPaused ? 'Paused' : 'Live'}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] w-full rounded-md border bg-muted/50 p-4">
                <div className="space-y-2 font-mono text-sm">
                  {filteredLogs.map((log, idx) => (
                    <div
                      key={`${log.timestamp}-${idx}`}
                      className="flex gap-4 rounded-lg bg-background p-3 hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-shrink-0 text-muted-foreground w-[180px]">
                        {log.timestamp}
                      </div>
                      <div className={`flex-shrink-0 font-semibold w-[100px] ${getLevelColor(log.level)}`}>
                        {log.level}
                      </div>
                      <div className="flex-shrink-0 font-medium w-[180px] text-muted-foreground">
                        {log.source}
                      </div>
                      <div className="flex-1">{log.message}</div>
                    </div>
                  ))}
                  {filteredLogs.length === 0 && (
                    <div className="flex items-center justify-center h-32 text-muted-foreground">
                      No logs found
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Log Statistics */}
          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{logs.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Errors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">
                  {logs.filter((l) => l.level === 'ERROR').length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Warnings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-500">
                  {logs.filter((l) => l.level === 'WARNING').length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">
                  {logs.filter((l) => l.level === 'SUCCESS').length}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
