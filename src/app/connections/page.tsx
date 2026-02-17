'use client';

import * as React from 'react';
import { Plus, Edit, Trash2, CheckCircle, XCircle, Key, Link2, Activity } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const connections = [
  {
    id: 1,
    exchange: 'Binance',
    status: 'connected',
    apiKey: '••••••••••••••kL3x',
    testnet: false,
    lastSync: '2 min ago',
    strategies: 2,
  },
  {
    id: 2,
    exchange: 'Coinbase',
    status: 'connected',
    apiKey: '••••••••••••••pM7n',
    testnet: false,
    lastSync: '5 min ago',
    strategies: 1,
  },
  {
    id: 3,
    exchange: 'Kraken',
    status: 'disconnected',
    apiKey: '••••••••••••••qR9v',
    testnet: true,
    lastSync: 'N/A',
    strategies: 0,
  },
  {
    id: 4,
    exchange: 'Gate.io',
    status: 'connected',
    apiKey: '••••••••••••••sT2w',
    testnet: false,
    lastSync: '1 min ago',
    strategies: 0,
  },
];

export default function ConnectionsPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);

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
            { title: 'Orders', href: '/orders' },
            { title: 'Connections', href: '/connections', active: true },
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
                    <Select>
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
                    <Input id="api-key" type="password" placeholder="Enter API key" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="api-secret">API Secret</Label>
                    <Input id="api-secret" type="password" placeholder="Enter API secret" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="testnet" />
                    <Label htmlFor="testnet">Use Testnet</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setIsAddDialogOpen(false)}>Connect</Button>
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
                <div className="text-2xl font-bold">4</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Connected</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">3</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Disconnected</CardTitle>
                <XCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">1</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Strategies</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
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
              <div className="space-y-4">
                {connections.map((connection) => (
                  <div
                    key={connection.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-lg ${
                          connection.status === 'connected' ? 'bg-green-500/10' : 'bg-red-500/10'
                        }`}
                      >
                        {connection.status === 'connected' ? (
                          <CheckCircle className="h-6 w-6 text-green-500" />
                        ) : (
                          <XCircle className="h-6 w-6 text-red-500" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{connection.exchange}</h3>
                          {connection.testnet && (
                            <Badge variant="secondary" className="text-xs">
                              Testnet
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Key className="h-3 w-3" />
                            <span>{connection.apiKey}</span>
                          </div>
                          {connection.status === 'connected' && (
                            <span>Synced {connection.lastSync}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">{connection.strategies} Strategies</p>
                        <p
                          className={`text-sm ${
                            connection.status === 'connected' ? 'text-green-500' : 'text-red-500'
                          }`}
                        >
                          {connection.status}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
      </main>
    </div>
  );
}
