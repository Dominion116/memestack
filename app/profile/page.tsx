'use client';

import { useEffect, useState } from 'react';
import { Copy, Check, ExternalLink, LogOut, Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { useWallet } from '@/lib/hooks/useWallet';
import { useAppStore } from '@/store/app-store';
import { formatSTX, formatAddress, formatTimeAgo } from '@/lib/utils/format';
import { EXPLORER_URL, NETWORK } from '@/lib/stacks/constants';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Transaction {
  id: string;
  type: 'create' | 'buy' | 'claim' | 'refund' | 'finalize';
  launchId: number;
  launchName: string;
  amount?: number;
  timestamp: number;
  txHash: string;
  status: 'pending' | 'confirmed' | 'failed';
}

function ProfileContent() {
  const { address, balance, disconnect } = useWallet();
  const { pendingTxs } = useAppStore();
  const { theme, setTheme } = useTheme();
  const [copied, setCopied] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<'all' | 'create' | 'buy' | 'claim' | 'refund'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In production, fetch real transaction history from API
    // For now, use pending transactions from store
    const mockTxs: Transaction[] = pendingTxs.map((tx) => ({
      id: tx.txId,
      type: tx.type as any,
      launchId: tx.launchId || 0,
      launchName: tx.launchName || 'Unknown Launch',
      amount: 0,
      timestamp: tx.timestamp,
      txHash: tx.txId,
      status: 'pending',
    }));

    setTransactions(mockTxs);
    setLoading(false);
  }, [pendingTxs]);

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'create':
        return '🚀';
      case 'buy':
        return '💰';
      case 'claim':
        return '🎁';
      case 'refund':
        return '↩️';
      case 'finalize':
        return '✅';
      default:
        return '📝';
    }
  };

  const getTypeBadge = (type: string) => {
    const variants: Record<string, string> = {
      create: 'bg-blue-500',
      buy: 'bg-green-500',
      claim: 'bg-purple-500',
      refund: 'bg-orange-500',
      finalize: 'bg-indigo-500',
    };

    return (
      <Badge className={cn(variants[type] || 'bg-gray-500', 'text-white')}>
        {getTypeIcon(type)} {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-500">Confirmed</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const filteredTransactions = transactions.filter(
    (tx) => filter === 'all' || tx.type === filter
  );

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile & Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account and preferences
        </p>
      </div>

      {/* Wallet Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Wallet Information</CardTitle>
          <CardDescription>Your connected Stacks wallet details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Address */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Wallet Address</label>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-muted px-3 py-2 rounded-md text-sm font-mono">
                {address}
              </code>
              <Button
                variant="outline"
                size="icon"
                onClick={copyAddress}
                className="shrink-0"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="outline"
                size="icon"
                asChild
                className="shrink-0"
              >
                <a
                  href={`${EXPLORER_URL}/address/${address}?chain=${NETWORK}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>

          {/* Balance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">STX Balance</label>
              <div className="bg-muted px-4 py-3 rounded-md">
                <p className="text-2xl font-bold">{formatSTX(Number(balance))}</p>
                <p className="text-xs text-muted-foreground">STX</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Network</label>
              <div className="bg-muted px-4 py-3 rounded-md">
                <p className="text-2xl font-bold capitalize">{NETWORK}</p>
                <p className="text-xs text-muted-foreground">Stacks Network</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Disconnect Button */}
          <Button
            variant="destructive"
            onClick={disconnect}
            className="w-full"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Disconnect Wallet
          </Button>
        </CardContent>
      </Card>

      {/* Theme Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize how Memestack looks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Theme</label>
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                onClick={() => setTheme('light')}
                className="w-full"
              >
                <Sun className="mr-2 h-4 w-4" />
                Light
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                onClick={() => setTheme('dark')}
                className="w-full"
              >
                <Moon className="mr-2 h-4 w-4" />
                Dark
              </Button>
              <Button
                variant={theme === 'system' ? 'default' : 'outline'}
                onClick={() => setTheme('system')}
                className="w-full"
              >
                <Monitor className="mr-2 h-4 w-4" />
                System
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>Your recent on-chain activity</CardDescription>
            </div>
            <Select value={filter} onValueChange={(v: any) => setFilter(v)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Transactions</SelectItem>
                <SelectItem value="create">Create</SelectItem>
                <SelectItem value="buy">Buy</SelectItem>
                <SelectItem value="claim">Claim</SelectItem>
                <SelectItem value="refund">Refund</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {filter === 'all'
                  ? 'No transactions yet'
                  : `No ${filter} transactions found`}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Launch</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead className="text-right">Tx Hash</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>{getTypeBadge(tx.type)}</TableCell>
                    <TableCell>
                      <p className="font-medium">{tx.launchName}</p>
                      <p className="text-xs text-muted-foreground">
                        ID: {tx.launchId}
                      </p>
                    </TableCell>
                    <TableCell>
                      {tx.amount ? (
                        <p className="font-semibold">{formatSTX(tx.amount)} STX</p>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(tx.status)}</TableCell>
                    <TableCell>
                      <p className="text-sm">{formatTimeAgo(tx.timestamp)}</p>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                      >
                        <a
                          href={`${EXPLORER_URL}/txid/${tx.txHash}?chain=${NETWORK}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1"
                        >
                          {formatAddress(tx.txHash)}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Additional Settings (Optional) */}
      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>Additional settings coming soon</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            More customization options will be available in future updates, including:
          </p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground list-disc list-inside">
            <li>Email notifications for launch updates</li>
            <li>Browser notifications for transactions</li>
            <li>Default token amount preferences</li>
            <li>Launch creation templates</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}
