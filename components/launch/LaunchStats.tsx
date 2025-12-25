'use client';

import { TrendingUp, TrendingDown, Users, Clock, DollarSign, Coins } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Launch } from '@/lib/types';
import { formatSTX, formatTokenAmount } from '@/lib/utils/format';

interface LaunchStatsProps {
  launch: Launch;
  contributorsCount?: number;
}

export function LaunchStats({ launch, contributorsCount = 0 }: LaunchStatsProps) {
  const stats = [
    {
      title: 'Total Raised',
      value: `${formatSTX(Number(launch.totalRaised))} STX`,
      icon: DollarSign,
      color: 'text-green-500',
    },
    {
      title: 'Tokens Sold',
      value: formatTokenAmount(Number(launch.totalTokensSold)),
      icon: Coins,
      color: 'text-blue-500',
    },
    {
      title: 'Contributors',
      value: contributorsCount.toString(),
      icon: Users,
      color: 'text-purple-500',
    },
    {
      title: 'Price per Token',
      value: `${formatSTX(Number(launch.pricePerToken), 8)} STX`,
      icon: TrendingUp,
      color: 'text-orange-500',
    },
    {
      title: 'Min Purchase',
      value: `${formatSTX(Number(launch.minPurchase))} STX`,
      icon: TrendingDown,
      color: 'text-cyan-500',
    },
    {
      title: 'Max Purchase',
      value: `${formatSTX(Number(launch.maxPurchase))} STX`,
      icon: TrendingUp,
      color: 'text-pink-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
