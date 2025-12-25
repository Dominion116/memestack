'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useContractCall } from '@/lib/hooks/useContractCall';
import { useWallet } from '@/lib/hooks/useWallet';
import { parseSTXToMicroSTX, formatSTX } from '@/lib/utils/format';
import { validatePurchaseAmount } from '@/lib/utils/validation';
import type { Launch, LaunchContribution } from '@/lib/types';

const buySchema = z.object({
  stxAmount: z.string().min(1, 'Amount is required'),
});

interface BuyTokensFormProps {
  launch: Launch;
  contribution?: LaunchContribution;
  onSuccess?: () => void;
}

export function BuyTokensForm({ launch, contribution, onSuccess }: BuyTokensFormProps) {
  const { balance } = useWallet();
  const { isPending, buyTokens } = useContractCall();
  const [estimatedTokens, setEstimatedTokens] = useState<string>('0');

  const form = useForm<z.infer<typeof buySchema>>({
    resolver: zodResolver(buySchema),
    defaultValues: {
      stxAmount: '',
    },
  });

  const stxAmount = form.watch('stxAmount');

  // Calculate estimated tokens
  const calculateTokens = (stx: string) => {
    try {
      const microStx = parseSTXToMicroSTX(stx);
      if (microStx > 0) {
        const tokens = (BigInt(microStx) * BigInt(1_000_000)) / launch.pricePerToken;
        setEstimatedTokens(formatSTX(Number(tokens)));
      } else {
        setEstimatedTokens('0');
      }
    } catch {
      setEstimatedTokens('0');
    }
  };

  // Update calculation when amount changes
  useState(() => {
    if (stxAmount) {
      calculateTokens(stxAmount);
    }
  });

  const onSubmit = async (data: z.infer<typeof buySchema>) => {
    try {
      const microStx = parseSTXToMicroSTX(data.stxAmount);
      
      // Validate amount
      const validation = validatePurchaseAmount(
        microStx,
        Number(launch.minPurchase),
        Number(launch.maxPurchase),
        contribution ? Number(contribution.stxContributed) : 0,
        Number(balance)
      );

      if (!validation.valid) {
        form.setError('stxAmount', { message: validation.error });
        return;
      }

      await buyTokens({
        launchId: launch.id,
        stxAmount: BigInt(microStx),
      });

      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error('Failed to buy tokens:', error);
    }
  };

  const currentContribution = contribution ? Number(contribution.stxContributed) : 0;
  const maxAllowed = Number(launch.maxPurchase) - currentContribution;
  const userBalance = Number(balance);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Buy Tokens</CardTitle>
        <CardDescription>
          Purchase tokens using STX during the launch period
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="stxAmount">Amount (STX)</Label>
            <Input
              id="stxAmount"
              type="number"
              step="0.000001"
              placeholder="Enter STX amount"
              {...form.register('stxAmount')}
              onChange={(e) => {
                form.register('stxAmount').onChange(e);
                calculateTokens(e.target.value);
              }}
            />
            {form.formState.errors.stxAmount && (
              <p className="text-sm text-destructive">
                {form.formState.errors.stxAmount.message}
              </p>
            )}
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Min: {formatSTX(Number(launch.minPurchase))} STX</span>
              <span>Your max: {formatSTX(maxAllowed)} STX</span>
            </div>
          </div>

          {/* Estimated Tokens */}
          <div className="p-4 bg-muted rounded-lg space-y-1">
            <p className="text-sm text-muted-foreground">You will receive</p>
            <p className="text-2xl font-bold">{estimatedTokens} {launch.tokenSymbol}</p>
          </div>

          {/* User Stats */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="space-y-1">
              <p className="text-muted-foreground">Your Balance</p>
              <p className="font-semibold">{formatSTX(userBalance)} STX</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">Your Contribution</p>
              <p className="font-semibold">{formatSTX(currentContribution)} STX</p>
            </div>
          </div>

          {/* Info Alert */}
          <Alert>
            <AlertDescription className="text-xs">
              Tokens will be available for claim after the launch ends and is finalized.
              If the soft cap is not met, you can request a full refund.
            </AlertDescription>
          </Alert>

          <Button type="submit" className="w-full" size="lg" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? 'Processing...' : 'Buy Tokens'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
