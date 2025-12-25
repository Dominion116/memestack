'use client';

import Link from 'next/link';
import { Clock, TrendingUp, Users, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import type { Launch } from '@/lib/types';
import { formatSTX, formatAddress, formatPercentage, formatBlocksToTime } from '@/lib/utils/format';
import { cn } from '@/lib/utils';

interface LaunchCardProps {
  launch: Launch;
}

export function LaunchCard({ launch }: LaunchCardProps) {
  const progress = Number(launch.totalRaised) / Number(launch.hardCap) * 100;
  const softCapProgress = Number(launch.softCap) / Number(launch.hardCap) * 100;
  
  // Determine status
  const getStatus = () => {
    if (launch.isFinalized) {
      return launch.isSuccessful 
        ? { label: 'Successful', variant: 'default' as const, color: 'bg-green-500' }
        : { label: 'Failed', variant: 'destructive' as const, color: 'bg-red-500' };
    }
    // Check if active based on blocks (simplified)
    return { label: 'Active', variant: 'secondary' as const, color: 'bg-blue-500' };
  };

  const status = getStatus();
  const metSoftCap = Number(launch.totalRaised) >= Number(launch.softCap);

  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <div>
            <CardTitle className="text-xl">{launch.tokenName}</CardTitle>
            <CardDescription className="font-mono text-sm mt-1">
              ${launch.tokenSymbol}
            </CardDescription>
          </div>
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>
        <div className="flex items-center text-xs text-muted-foreground">
          <Users className="h-3 w-3 mr-1" />
          <span>by {formatAddress(launch.creator)}</span>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-semibold">{progress.toFixed(1)}%</span>
          </div>
          <div className="relative">
            <Progress value={progress} className="h-2" />
            {/* Soft cap indicator */}
            {softCapProgress > 0 && softCapProgress < 100 && (
              <div 
                className="absolute top-0 h-2 w-0.5 bg-yellow-500" 
                style={{ left: `${softCapProgress}%` }}
                title="Soft Cap"
              />
            )}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatSTX(Number(launch.totalRaised))} STX</span>
            <span>{formatSTX(Number(launch.hardCap))} STX</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs">Soft Cap</p>
            <p className={cn("font-semibold", metSoftCap && "text-green-500")}>
              {formatSTX(Number(launch.softCap))} STX
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs">Price/Token</p>
            <p className="font-semibold">
              {formatSTX(Number(launch.pricePerToken), 8)} STX
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs">Min Purchase</p>
            <p className="font-semibold">{formatSTX(Number(launch.minPurchase))} STX</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs">Max Purchase</p>
            <p className="font-semibold">{formatSTX(Number(launch.maxPurchase))} STX</p>
          </div>
        </div>

        {/* Time Remaining */}
        {!launch.isFinalized && (
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              Ends in: <span className="font-semibold text-foreground">
                {formatBlocksToTime(launch.endBlock - launch.startBlock)}
              </span>
            </span>
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/launches/${launch.id}`}>
            View Details
            <motion.div
              animate={{ x: isHovered ? 4 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ArrowRight className="ml-2 h-4 w-4" />
            </motion.div>
          </Link>
        </Button>
      </CardFooter>
    </Card>
    </motion.div>
  );
}
