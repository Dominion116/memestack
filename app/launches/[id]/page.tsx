'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Copy, Loader2, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { LaunchProgress } from '@/components/launch/LaunchProgress';
import { BuyTokensForm } from '@/components/launch/BuyTokensForm';
import { LaunchStats } from '@/components/launch/LaunchStats';
import { useLaunch } from '@/lib/hooks/useLaunches';
import { useWallet } from '@/lib/hooks/useWallet';
import { WalletButton } from '@/components/wallet/WalletButton';
import { useContractCall } from '@/lib/hooks/useContractCall';
import { formatAddress, formatSTX, formatDate, copyToClipboard } from '@/lib/utils/format';
import { EXPLORER_URL } from '@/lib/stacks/constants';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { getUserContribution, getCurrentBlockHeight } from '@/lib/stacks/contract';
import type { LaunchContribution } from '@/lib/types';

function LaunchDetailsContent() {
  const params = useParams();
  const launchId = parseInt(params.id as string);
  const { address } = useWallet();
  const { isPending, finalizeLaunch, claimTokens, requestRefund } = useContractCall();
  
  const { launch, stats, isLoading, error, refetch } = useLaunch(launchId);
  const [contribution, setContribution] = useState<LaunchContribution | null>(null);
  const [currentBlock, setCurrentBlock] = useState<number>(0);
  const [loadingContribution, setLoadingContribution] = useState(true);

  // Fetch user contribution and current block
  useEffect(() => {
    if (address && launch) {
      fetchUserData();
    }
  }, [address, launch]);

  const fetchUserData = async () => {
    if (!address) return;
    
    setLoadingContribution(true);
    try {
      const [contributionResult, blockHeight] = await Promise.all([
        getUserContribution(launchId, address),
        getCurrentBlockHeight(),
      ]);

      if (contributionResult.success) {
        setContribution(contributionResult.data!);
      }
      setCurrentBlock(blockHeight);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    } finally {
      setLoadingContribution(false);
    }
  };

  const handleCopyAddress = async (addr: string) => {
    const success = await copyToClipboard(addr);
    if (success) {
      toast.success('Address copied to clipboard');
    }
  };

  const handleFinalize = async () => {
    await finalizeLaunch(launchId);
    refetch();
  };

  const handleClaim = async () => {
    await claimTokens(launchId);
    fetchUserData();
  };

  const handleRefund = async () => {
    await requestRefund(launchId);
    fetchUserData();
  };

  if (isLoading) {
    return (
      <div className="container py-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !launch) {
    return (
      <div className="container py-8">
        <Alert variant="destructive">
          <AlertDescription>{error || 'Launch not found'}</AlertDescription>
        </Alert>
        <Button asChild className="mt-4">
          <Link href="/launches">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Launches
          </Link>
        </Button>
      </div>
    );
  }

  const getStatusBadge = () => {
    if (launch.isFinalized) {
      return launch.isSuccessful ? (
        <Badge className="bg-green-500">
          <CheckCircle className="mr-1 h-3 w-3" />
          Successful
        </Badge>
      ) : (
        <Badge variant="destructive">
          <XCircle className="mr-1 h-3 w-3" />
          Failed
        </Badge>
      );
    }
    const blocksRemaining = currentBlock > 0 ? Math.max(0, launch.endBlock - currentBlock) : 0;
    if (blocksRemaining > 0) {
      return (
        <Badge variant="secondary">
          <Clock className="mr-1 h-3 w-3" />
          Active
        </Badge>
      );
    }
    return (
      <Badge variant="outline">
        <Clock className="mr-1 h-3 w-3" />
          Ended - Awaiting Finalization
        </Badge>
      );
  };

  const canFinalize = !launch.isFinalized && currentBlock >= launch.endBlock;
  const canClaim = launch.isFinalized && launch.isSuccessful && contribution && !contribution.hasClaimed;
  const canRefund = launch.isFinalized && !launch.isSuccessful && contribution && !contribution.hasRefunded;
  const canBuy = !launch.isFinalized && currentBlock < launch.endBlock && currentBlock >= launch.startBlock;

  return (
    <div className="container py-8 space-y-8">
      <div className="mb-6 md:hidden flex justify-end">
        <WalletButton />
      </div>
      {/* Back Button */}
      <Button variant="ghost" asChild>
        <Link href="/launches">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Launches
        </Link>
      </Button>

      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold">{launch.tokenName}</h1>
            {getStatusBadge()}
          </div>
          <p className="text-xl text-muted-foreground font-mono">${launch.tokenSymbol}</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Token Info */}
          <Card>
            <CardHeader>
              <CardTitle>Token Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Creator</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="font-mono text-sm">{formatAddress(launch.creator, 6)}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => handleCopyAddress(launch.creator)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Supply</p>
                  <p className="font-semibold mt-1">{formatSTX(Number(launch.totalSupply))}</p>
                </div>
                {launch.tokenUri && (
                  <div className="sm:col-span-2">
                    <p className="text-sm text-muted-foreground">Token URI</p>
                    <a
                      href={launch.tokenUri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline flex items-center gap-1 mt-1"
                    >
                      {launch.tokenUri}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Progress */}
          <LaunchProgress launch={launch} currentBlock={currentBlock} />

          {/* Stats */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Launch Statistics</h3>
            <LaunchStats launch={launch} contributorsCount={stats?.totalContributors} />
          </div>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Start Block</span>
                <span className="font-semibold">{launch.startBlock.toLocaleString()}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">End Block</span>
                <span className="font-semibold">{launch.endBlock.toLocaleString()}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Duration</span>
                <span className="font-semibold">{launch.durationBlocks} blocks</span>
              </div>
              {currentBlock > 0 && (
                <>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Current Block</span>
                    <span className="font-semibold">{currentBlock.toLocaleString()}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-6">
          {/* Action Card */}
          {canBuy && (
            <BuyTokensForm
              launch={launch}
              contribution={contribution || undefined}
              onSuccess={fetchUserData}
            />
          )}

          {canFinalize && (
            <Card>
              <CardHeader>
                <CardTitle>Finalize Launch</CardTitle>
                <CardDescription>
                  The launch period has ended. Finalize to distribute tokens or enable refunds.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={handleFinalize}
                  disabled={isPending}
                  className="w-full"
                  size="lg"
                >
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Finalize Launch
                </Button>
              </CardContent>
            </Card>
          )}

          {canClaim && (
            <Card>
              <CardHeader>
                <CardTitle>Claim Tokens</CardTitle>
                <CardDescription>
                  This launch was successful. Claim your allocated tokens.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Your Allocation</p>
                  <p className="text-2xl font-bold">
                    {formatSTX(Number(contribution.tokensAllocated))} {launch.tokenSymbol}
                  </p>
                </div>
                <Button
                  onClick={handleClaim}
                  disabled={isPending}
                  className="w-full"
                  size="lg"
                >
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Claim Tokens
                </Button>
              </CardContent>
            </Card>
          )}

          {canRefund && (
            <Card>
              <CardHeader>
                <CardTitle>Request Refund</CardTitle>
                <CardDescription>
                  This launch failed to meet its soft cap. Request a full refund.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Your Contribution</p>
                  <p className="text-2xl font-bold">
                    {formatSTX(Number(contribution.stxContributed))} STX
                  </p>
                </div>
                <Button
                  onClick={handleRefund}
                  disabled={isPending}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Request Refund
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Your Contribution Card */}
          {contribution && Number(contribution.stxContributed) > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Your Contribution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">STX Contributed</p>
                  <p className="text-lg font-bold">
                    {formatSTX(Number(contribution.stxContributed))} STX
                  </p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Tokens Allocated</p>
                  <p className="text-lg font-bold">
                    {formatSTX(Number(contribution.tokensAllocated))} {launch.tokenSymbol}
                  </p>
                </div>
                {contribution.hasClaimed && (
                  <>
                    <Separator />
                    <Badge className="w-full justify-center bg-green-500">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Tokens Claimed
                    </Badge>
                  </>
                )}
                {contribution.hasRefunded && (
                  <>
                    <Separator />
                    <Badge className="w-full justify-center" variant="outline">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Refund Processed
                    </Badge>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Launch Parameters */}
          <Card>
            <CardHeader>
              <CardTitle>Launch Parameters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Soft Cap</span>
                <span className="font-semibold">{formatSTX(Number(launch.softCap))} STX</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Hard Cap</span>
                <span className="font-semibold">{formatSTX(Number(launch.hardCap))} STX</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Min Purchase</span>
                <span className="font-semibold">{formatSTX(Number(launch.minPurchase))} STX</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Max Purchase</span>
                <span className="font-semibold">{formatSTX(Number(launch.maxPurchase))} STX</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Platform Fee</span>
                <span className="font-semibold">2%</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function LaunchDetailsPage() {
  return (
    <ProtectedRoute>
      <LaunchDetailsContent />
    </ProtectedRoute>
  );
}
