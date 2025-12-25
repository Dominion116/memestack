'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { Launch } from '@/lib/types';
import { formatSTX, formatPercentage, formatBlocksToTime } from '@/lib/utils/format';
import { cn } from '../../lib/utils';

interface LaunchProgressProps {
  launch: Launch;
  currentBlock?: number;
}

export function LaunchProgress({ launch, currentBlock }: LaunchProgressProps) {
  const progress = Number(launch.totalRaised) / Number(launch.hardCap) * 100;
  const softCapProgress = Number(launch.softCap) / Number(launch.hardCap) * 100;
  const metSoftCap = Number(launch.totalRaised) >= Number(launch.softCap);
  const blocksRemaining = currentBlock ? Math.max(0, launch.endBlock - currentBlock) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Launch Progress</CardTitle>
        <CardDescription>
          {launch.isFinalized
            ? launch.isSuccessful
              ? 'Launch completed successfully'
              : 'Launch failed to meet soft cap'
            : 'Currently accepting contributions'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Progress Bar */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Raised</span>
            <span className="text-2xl font-bold">
              {formatSTX(Number(launch.totalRaised))} STX
            </span>
          </div>
          
          <div className="relative">
            <Progress value={progress} className="h-4" />
            {/* Soft cap marker */}
            {softCapProgress > 0 && softCapProgress < 100 && (
              <div className="absolute top-0 bottom-0 flex items-center" style={{ left: `${softCapProgress}%` }}>
                <div className="w-0.5 h-full bg-yellow-500" />
                <div className="absolute left-0 -top-6 -translate-x-1/2 text-xs font-medium text-yellow-500 whitespace-nowrap">
                  Soft Cap
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between text-sm text-muted-foreground">
            <span>0 STX</span>
            <span className="font-semibold text-foreground">{progress.toFixed(2)}%</span>
            <span>{formatSTX(Number(launch.hardCap))} STX</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Soft Cap</p>
            <p className={cn("text-lg font-bold", metSoftCap && "text-green-500")}>
              {formatSTX(Number(launch.softCap))} STX
            </p>
            {metSoftCap && (
              <p className="text-xs text-green-500">✓ Met</p>
            )}
          </div>
          
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Hard Cap</p>
            <p className="text-lg font-bold">
              {formatSTX(Number(launch.hardCap))} STX
            </p>
            <p className="text-xs text-muted-foreground">
              {formatPercentage(Number(launch.totalRaised), Number(launch.hardCap))}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Tokens Sold</p>
            <p className="text-lg font-bold">
              {formatSTX(Number(launch.totalTokensSold))}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Total Supply</p>
            <p className="text-lg font-bold">
              {formatSTX(Number(launch.totalSupply))}
            </p>
          </div>
        </div>

        {/* Time Remaining */}
        {!launch.isFinalized && currentBlock && (
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Time Remaining</p>
            <p className="text-xl font-bold">
              {blocksRemaining > 0 ? formatBlocksToTime(blocksRemaining) : 'Ended'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Block {currentBlock} / {launch.endBlock}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
