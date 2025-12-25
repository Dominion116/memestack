'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, TrendingUp, Wallet, Coins, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { useLaunches } from '@/lib/hooks/useLaunches';
import { useContractCall } from '@/lib/hooks/useContractCall';
import { getUserContribution, getCurrentBlockHeight } from '@/lib/stacks/contract';
import { formatSTX } from '@/lib/utils/format';
import type { Launch, LaunchContribution } from '@/lib/types';

interface UserLaunchData extends Launch {
  contribution?: LaunchContribution;
}

function DashboardContent() {
  const { address, balance } = useWallet();
  const { launches, isLoading } = useLaunches();
  const { isPending, finalizeLaunch, claimTokens, requestRefund } = useContractCall();
  
  const [userLaunches, setUserLaunches] = useState<UserLaunchData[]>([]);
  const [userInvestments, setUserInvestments] = useState<UserLaunchData[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [currentBlock, setCurrentBlock] = useState(0);

  useEffect(() => {
    if (address && launches.length > 0) {
      fetchUserData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, launches]);

  const fetchUserData = async () => {
    if (!address) return;
    
    setLoadingData(true);
    try {
      const blockHeight = await getCurrentBlockHeight();
      setCurrentBlock(blockHeight);

      // Fetch contributions for all launches
      const contributionPromises = launches.map((launch) =>
        getUserContribution(launch.id, address).then((result) => ({
          launch,
          contribution: result.success ? result.data : null,
        }))
      );

      const results = await Promise.all(contributionPromises);

      // Separate user's launches and investments
      const myLaunches = launches.filter((l) => l.creator === address);
      const myInvestments = results
        .filter((r) => r.contribution && Number(r.contribution.stxContributed) > 0)
        .map((r) => ({ ...r.launch, contribution: r.contribution! }));

      setUserLaunches(myLaunches);
      setUserInvestments(myInvestments);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  // Calculate stats
  const totalInvested = userInvestments.reduce(
    (sum, inv) => sum + Number(inv.contribution?.stxContributed || 0),
    0
  );

  const totalTokensClaimed = userInvestments.reduce(
    (sum, inv) => (inv.contribution?.hasClaimed ? sum + Number(inv.contribution.tokensAllocated) : sum),
    0
  );

  const getStatusBadge = (launch: Launch) => {
    if (launch.isFinalized) {
      return launch.isSuccessful ? (
        <Badge className="bg-green-500">Successful</Badge>
      ) : (
        <Badge variant="destructive">Failed</Badge>
      );
    }
    const blocksRemaining = currentBlock > 0 ? Math.max(0, launch.endBlock - currentBlock) : 0;
    if (blocksRemaining > 0) {
      return <Badge variant="secondary">Active</Badge>;
    }
    return <Badge variant="outline">Ended</Badge>;
  };

  const handleFinalize = async (launchId: number) => {
    await finalizeLaunch(launchId);
    fetchUserData();
  };

  const handleClaim = async (launchId: number) => {
    await claimTokens(launchId);
    fetchUserData();
  };

  const handleRefund = async (launchId: number) => {
    await requestRefund(launchId);
    fetchUserData();
  };

  return (
    <div className="container py-6 sm:py-8 space-y-6 sm:space-y-8 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage your launches and investments
          </p>
        </div>
        <Button asChild size="lg" className="w-full sm:w-auto">
          <Link href="/create">
            <Plus className="mr-2 h-4 w-4" />
            Create Launch
          </Link>
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Launches</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{userLaunches.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Created by you</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatSTX(totalInvested)} STX</div>
            <p className="text-xs text-muted-foreground">Across {userInvestments.length} launches</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tokens Claimed</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatSTX(totalTokensClaimed)}</div>
            <p className="text-xs text-muted-foreground">From successful launches</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatSTX(Number(balance))} STX</div>
            <p className="text-xs text-muted-foreground">Available balance</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="launches" className="space-y-4">
        <TabsList>
          <TabsTrigger value="launches">
            My Launches ({userLaunches.length})
          </TabsTrigger>
          <TabsTrigger value="investments">
            My Investments ({userInvestments.length})
          </TabsTrigger>
        </TabsList>

        {/* My Launches Tab */}
        <TabsContent value="launches" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>My Launches</CardTitle>
              <CardDescription>
                Token launches you have created
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingData || isLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : userLaunches.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">
                    You haven&apos;t created any launches yet
                  </p>
                  <Button asChild>
                    <Link href="/create">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Your First Launch
                    </Link>
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Token</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Raised</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userLaunches.map((launch) => {
                      const progress = Number(launch.totalRaised) / Number(launch.hardCap) * 100;
                      const canFinalize = !launch.isFinalized && currentBlock >= launch.endBlock;

                      return (
                        <TableRow key={launch.id}>
                          <TableCell>
                            <div>
                              <p className="font-semibold">{launch.tokenName}</p>
                              <p className="text-xs text-muted-foreground">${launch.tokenSymbol}</p>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(launch)}</TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-primary"
                                    style={{ width: `${Math.min(progress, 100)}%` }}
                                  />
                                </div>
                                <span className="text-xs font-medium">{progress.toFixed(0)}%</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-semibold">{formatSTX(Number(launch.totalRaised))} STX</p>
                              <p className="text-xs text-muted-foreground">
                                / {formatSTX(Number(launch.hardCap))} STX
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/launches/${launch.id}`}>
                                  View
                                </Link>
                              </Button>
                              {canFinalize && (
                                <Button
                                  size="sm"
                                  onClick={() => handleFinalize(launch.id)}
                                  disabled={isPending}
                                >
                                  {isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    'Finalize'
                                  )}
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* My Investments Tab */}
        <TabsContent value="investments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>My Investments</CardTitle>
              <CardDescription>
                Launches you have participated in
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingData || isLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : userInvestments.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">
                    You haven&apos;t invested in any launches yet
                  </p>
                  <Button asChild>
                    <Link href="/launches">
                      Browse Launches
                    </Link>
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Token</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Invested</TableHead>
                      <TableHead>Tokens</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userInvestments.map((investment) => {
                      const contribution = investment.contribution!;
                      const canClaim = investment.isFinalized && investment.isSuccessful && !contribution.hasClaimed;
                      const canRefund = investment.isFinalized && !investment.isSuccessful && !contribution.hasRefunded;

                      return (
                        <TableRow key={investment.id}>
                          <TableCell>
                            <div>
                              <p className="font-semibold">{investment.tokenName}</p>
                              <p className="text-xs text-muted-foreground">${investment.tokenSymbol}</p>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(investment)}</TableCell>
                          <TableCell>
                            <p className="font-semibold">
                              {formatSTX(Number(contribution.stxContributed))} STX
                            </p>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-semibold">
                                {formatSTX(Number(contribution.tokensAllocated))}
                              </p>
                              {contribution.hasClaimed && (
                                <Badge variant="outline" className="mt-1">
                                  <CheckCircle className="mr-1 h-3 w-3" />
                                  Claimed
                                </Badge>
                              )}
                              {contribution.hasRefunded && (
                                <Badge variant="outline" className="mt-1">
                                  <CheckCircle className="mr-1 h-3 w-3" />
                                  Refunded
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/launches/${investment.id}`}>
                                  View
                                </Link>
                              </Button>
                              {canClaim && (
                                <Button
                                  size="sm"
                                  onClick={() => handleClaim(investment.id)}
                                  disabled={isPending}
                                >
                                  {isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    'Claim'
                                  )}
                                </Button>
                              )}
                              {canRefund && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRefund(investment.id)}
                                  disabled={isPending}
                                >
                                  {isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    'Refund'
                                  )}
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/create">
              <Plus className="mr-2 h-4 w-4" />
              Create New Launch
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/launches">
              Browse Active Launches
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/profile">
              View Profile
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
