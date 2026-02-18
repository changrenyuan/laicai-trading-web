'use client';

import * as React from 'react';
import { Plus, Edit, Trash2, CheckCircle, XCircle, Key, Link2, Activity, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useEngineStore, useUIStore } from '@/store';
import { createConnection, deleteConnection, testConnection } from '@/core/command';

export default function ConnectionsPage() {
  const engine = useEngineStore();
  const ui = useUIStore();
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [testnet, setTestnet] = React.useState(false);
  const [exchange, setExchange] = React.useState('');
  const [apiKey, setApiKey] = React.useState('');
  const [apiSecret, setApiSecret] = React.useState('');
  const [testingId, setTestingId] = React.useState<string | null>(null);

  // 获取连接列表
  const connectionsList = Object.values(engine.connections);

  // 统计数据
  const stats = {
    total: connectionsList.length,
    connected: connectionsList.filter((c) => c.status === 'connected').length,
    disconnected: connectionsList.filter((c) => c.status === 'disconnected').length,
    activeStrategies: Object.values(engine.strategies).filter((s) => s.status === 'running').length,
  };

  // 添加连接
  const handleAddConnection = async () => {
    if (!exchange || !apiKey || !apiSecret) {
      ui.addToast('Please fill in all fields', 'error');
      return;
    }

    try {
      await createConnection(exchange, apiKey, apiSecret, testnet);
      setIsAddDialogOpen(false);
      setExchange('');
      setApiKey('');
      setApiSecret('');
      setTestnet(false);
      ui.addToast('Connection added successfully', 'success');
    } catch (error) {
      ui.addToast('Failed to add connection', 'error');
    }
  };

  // 测试连接
  const handleTestConnection = async (connectionId: string) => {
    setTestingId(connectionId);
    try {
      await testConnection(connectionId);
      ui.addToast('Connection test successful', 'success');
    } catch (error) {
      ui.addToast('Connection test failed', 'error');
    } finally {
      setTestingId(null);
    }
  };

  // 删除连接
  const handleDeleteConnection = async (connectionId: string) => {
    if (!confirm('Are you sure you want to delete this connection?')) {
      return;
    }

    try {
      await deleteConnection(connectionId);
      ui.addToast('Connection deleted successfully', 'success');
    } catch (error) {
      ui.addToast('Failed to delete connection', 'error');
    }
  };

  // 格式化 API Key
  const maskApiKey = (key: string) => {
    if (!key || key.length <= 8) return key;
    return '••••' + key.slice(-4);
  };

  // 格式化时间
  const formatLastSync = (timestamp?: number) => {
    if (!timestamp) return 'N/A';
    const diff = Math.floor((Date.now() - timestamp * 1000) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  return (
    <SidebarLayout>
      <div className="p-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Connections</h1>
              <p className="text-muted-foreground">Manage exchange connections and API keys</p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Connection
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Add New Connection</DialogTitle>
                  <DialogDescription>
                    Connect to a new exchange to enable trading strategies.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
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
                        <SelectItem value="kucoin">KuCoin</SelectItem>
                        <SelectItem value="okx">OKX</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="api-key">API Key</Label>
                    <Input
                      id="api-key"
                      type="password"
                      placeholder="Enter API key"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="api-secret">API Secret</Label>
                    <Input
                      id="api-secret"
                      type="password"
                      placeholder="Enter API secret"
                      value={apiSecret}
                      onChange={(e) => setApiSecret(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="testnet" checked={testnet} onCheckedChange={setTestnet} />
                    <Label htmlFor="testnet">Use Testnet</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddConnection}>Connect</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Connection Status Overview */}
          <div className="grid gap-4 md:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Connections</CardTitle>
                <Link2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Connected</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">{stats.connected}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Disconnected</CardTitle>
                <XCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">{stats.disconnected}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Strategies</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeStrategies}</div>
              </CardContent>
            </Card>
          </div>

          {/* Connections List */}
          <Card>
            <CardHeader>
              <CardTitle>Exchange Connections</CardTitle>
              <CardDescription>Manage your exchange API connections</CardDescription>
            </CardHeader>
            <CardContent>
              {connectionsList.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Link2 className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p>No connections yet</p>
                  <p className="text-sm">Add a connection to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {connectionsList.map((connection) => (
                    <div
                      key={connection.exchange}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-lg ${
                            connection.status === 'connected'
                              ? 'bg-green-500/10'
                              : 'bg-red-500/10'
                          }`}
                        >
                          {connection.status === 'connected' ? (
                            <CheckCircle className="h-6 w-6 text-green-500" />
                          ) : connection.status === 'connecting' ? (
                            <RefreshCw className="h-6 w-6 text-yellow-500 animate-spin" />
                          ) : (
                            <XCircle className="h-6 w-6 text-red-500" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{connection.exchange}</h3>
                            <Badge
                              variant={connection.status === 'connected' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {connection.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            {connection.message && <span>{connection.message}</span>}
                            {connection.status === 'connected' && connection.timestamp && (
                              <span>Synced {formatLastSync(connection.timestamp)}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleTestConnection(connection.exchange)}
                            disabled={testingId === connection.exchange}
                          >
                            {testingId === connection.exchange ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <RefreshCw className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDeleteConnection(connection.exchange)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Security Tips */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Security Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Use API keys with trading permissions only, avoid withdrawal permissions</li>
                <li>• Enable IP whitelisting for your API keys when possible</li>
                <li>• Test your connections on testnet before using mainnet</li>
                <li>• Rotate your API keys regularly for enhanced security</li>
                <li>• Never share your API keys with anyone</li>
              </ul>
            </CardContent>
          </Card>
      </div>
    </SidebarLayout>
  );
}
