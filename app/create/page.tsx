'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { ArrowLeft, ArrowRight, Loader2, CheckCircle, Info } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { useContractCall } from '@/lib/hooks/useContractCall';
import { createLaunchSchema, type CreateLaunchFormData } from '@/lib/utils/validation';
import { parseSTXToMicroSTX, formatSTX, formatBlocksToTime } from '@/lib/utils/format';
import { BLOCKS_PER_DAY, MICRO_STX_PER_STX } from '@/lib/stacks/constants';
import { cn } from '../../lib/utils';

const DURATION_PRESETS = [
  { label: '1 Day', blocks: BLOCKS_PER_DAY },
  { label: '3 Days', blocks: BLOCKS_PER_DAY * 3 },
  { label: '7 Days', blocks: BLOCKS_PER_DAY * 7 },
  { label: '14 Days', blocks: BLOCKS_PER_DAY * 14 },
];

function CreateLaunchContent() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [agreed, setAgreed] = useState(false);
  const { isPending, createLaunch } = useContractCall();

  const form = useForm<CreateLaunchFormData>({
    resolver: zodResolver(createLaunchSchema),
    defaultValues: {
      tokenName: '',
      tokenSymbol: '',
      tokenUri: '',
      totalSupply: 1000000,
      pricePerToken: 1000,
      softCap: 1000000,
      hardCap: 10000000,
      minPurchase: 1000000,
      maxPurchase: 5000000,
      durationBlocks: BLOCKS_PER_DAY * 7,
    },
    mode: 'onChange',
  });

  const watchedValues = form.watch();

  const onSubmit = async (data: CreateLaunchFormData) => {
    if (step < 3) {
      setStep(step + 1);
      return;
    }

    if (!agreed) {
      form.setError('root', { message: 'You must agree to the terms' });
      return;
    }

    try {
      await createLaunch({
        tokenName: data.tokenName,
        tokenSymbol: data.tokenSymbol,
        tokenUri: data.tokenUri || '',
        totalSupply: BigInt(data.totalSupply),
        pricePerToken: BigInt(data.pricePerToken),
        softCap: BigInt(data.softCap),
        hardCap: BigInt(data.hardCap),
        minPurchase: BigInt(data.minPurchase),
        maxPurchase: BigInt(data.maxPurchase),
        durationBlocks: data.durationBlocks,
      });

      // Redirect after successful creation
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Failed to create launch:', error);
    }
  };

  const goBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // Calculate estimated values
  const maxTokensToSell = watchedValues.hardCap > 0 && watchedValues.pricePerToken > 0
    ? Math.floor((watchedValues.hardCap * 1_000_000) / watchedValues.pricePerToken)
    : 0;

  const priceInSTX = watchedValues.pricePerToken > 0
    ? (watchedValues.pricePerToken / MICRO_STX_PER_STX).toFixed(8)
    : '0';

  const platformFee = watchedValues.hardCap > 0
    ? Math.floor(watchedValues.hardCap * 0.02)
    : 0;

  return (
    <div className="container py-8 max-w-4xl">
      <div className="mb-6 md:hidden flex justify-end">
        <WalletButton />
      </div>
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/launches">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Launches
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Create New Launch</h1>
        <p className="text-muted-foreground mt-1">
          Launch your memecoin with a fair and transparent token sale
        </p>
      </div>

      {/* Stepper */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold transition-colors',
                    step >= s
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-muted-foreground/30 text-muted-foreground'
                  )}
                >
                  {step > s ? <CheckCircle className="h-5 w-5" /> : s}
                </div>
                <span className="mt-2 text-xs font-medium">
                  {s === 1 && 'Token Info'}
                  {s === 2 && 'Parameters'}
                  {s === 3 && 'Review'}
                </span>
              </div>
              {s < 3 && (
                <div
                  className={cn(
                    'h-0.5 flex-1 transition-colors',
                    step > s ? 'bg-primary' : 'bg-muted-foreground/30'
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Step 1: Token Information */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Token Information</CardTitle>
              <CardDescription>
                Define your token&apos;s basic information and economics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="tokenName">Token Name *</Label>
                <Input
                  id="tokenName"
                  placeholder="e.g., My Awesome Token"
                  {...form.register('tokenName')}
                />
                <p className="text-xs text-muted-foreground">
                  Maximum 32 characters, ASCII only
                </p>
                {form.formState.errors.tokenName && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.tokenName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tokenSymbol">Token Symbol *</Label>
                <Input
                  id="tokenSymbol"
                  placeholder="e.g., MAT"
                  className="uppercase"
                  {...form.register('tokenSymbol', {
                    onChange: (e) => {
                      e.target.value = e.target.value.toUpperCase();
                    },
                  })}
                />
                <p className="text-xs text-muted-foreground">
                  Maximum 10 characters, uppercase letters and numbers only
                </p>
                {form.formState.errors.tokenSymbol && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.tokenSymbol.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tokenUri">Token URI (Optional)</Label>
                <Textarea
                  id="tokenUri"
                  placeholder="https://example.com/token-metadata.json"
                  {...form.register('tokenUri')}
                />
                <p className="text-xs text-muted-foreground">
                  Link to token metadata or website (max 256 characters)
                </p>
                {form.formState.errors.tokenUri && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.tokenUri.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="totalSupply">Total Supply *</Label>
                <Input
                  id="totalSupply"
                  type="number"
                  step="1"
                  {...form.register('totalSupply', { valueAsNumber: true })}
                />
                <p className="text-xs text-muted-foreground">
                  Total number of tokens to be created
                </p>
                {form.formState.errors.totalSupply && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.totalSupply.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="pricePerToken">Price per Token (micro-STX) *</Label>
                <Input
                  id="pricePerToken"
                  type="number"
                  step="1"
                  {...form.register('pricePerToken', { valueAsNumber: true })}
                />
                <p className="text-xs text-muted-foreground">
                  Price in micro-STX per 1M tokens. Current: {priceInSTX} STX per token
                </p>
                {form.formState.errors.pricePerToken && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.pricePerToken.message}
                  </p>
                )}
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Make sure your token information is correct. These values cannot be changed after launch creation.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Launch Parameters */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Launch Parameters</CardTitle>
              <CardDescription>
                Set funding goals and purchase limits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="softCap">Soft Cap (micro-STX) *</Label>
                  <Input
                    id="softCap"
                    type="number"
                    step="1000"
                    {...form.register('softCap', { valueAsNumber: true })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Minimum: {formatSTX(watchedValues.softCap)} STX
                  </p>
                  {form.formState.errors.softCap && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.softCap.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hardCap">Hard Cap (micro-STX) *</Label>
                  <Input
                    id="hardCap"
                    type="number"
                    step="1000"
                    {...form.register('hardCap', { valueAsNumber: true })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Maximum: {formatSTX(watchedValues.hardCap)} STX
                  </p>
                  {form.formState.errors.hardCap && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.hardCap.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="minPurchase">Min Purchase (micro-STX) *</Label>
                  <Input
                    id="minPurchase"
                    type="number"
                    step="1000"
                    {...form.register('minPurchase', { valueAsNumber: true })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Minimum: {formatSTX(watchedValues.minPurchase)} STX
                  </p>
                  {form.formState.errors.minPurchase && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.minPurchase.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxPurchase">Max Purchase (micro-STX) *</Label>
                  <Input
                    id="maxPurchase"
                    type="number"
                    step="1000"
                    {...form.register('maxPurchase', { valueAsNumber: true })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Maximum: {formatSTX(watchedValues.maxPurchase)} STX
                  </p>
                  {form.formState.errors.maxPurchase && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.maxPurchase.message}
                    </p>
                  )}
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <Label>Duration Presets</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {DURATION_PRESETS.map((preset) => (
                    <Button
                      key={preset.label}
                      type="button"
                      variant={
                        watchedValues.durationBlocks === preset.blocks
                          ? 'default'
                          : 'outline'
                      }
                      onClick={() => form.setValue('durationBlocks', preset.blocks)}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="durationBlocks">Custom Duration (blocks) *</Label>
                <Input
                  id="durationBlocks"
                  type="number"
                  step="1"
                  {...form.register('durationBlocks', { valueAsNumber: true })}
                />
                <p className="text-xs text-muted-foreground">
                  Approximately {formatBlocksToTime(watchedValues.durationBlocks)} (~10 min per block)
                </p>
                {form.formState.errors.durationBlocks && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.durationBlocks.message}
                  </p>
                )}
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Hard cap must be greater than soft cap. Max purchase must be less than or equal to hard cap and greater than min purchase.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Review & Launch */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Review & Launch</CardTitle>
              <CardDescription>
                Review your launch details before submitting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Token Information Summary */}
              <div>
                <h3 className="font-semibold mb-3">Token Information</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Name</p>
                    <p className="font-semibold">{watchedValues.tokenName}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Symbol</p>
                    <p className="font-semibold">${watchedValues.tokenSymbol}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Supply</p>
                    <p className="font-semibold">{watchedValues.totalSupply.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Price per Token</p>
                    <p className="font-semibold">{priceInSTX} STX</p>
                  </div>
                  {watchedValues.tokenUri && (
                    <div className="col-span-2">
                      <p className="text-muted-foreground">Token URI</p>
                      <p className="font-semibold break-all">{watchedValues.tokenUri}</p>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Launch Parameters Summary */}
              <div>
                <h3 className="font-semibold mb-3">Launch Parameters</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Soft Cap</p>
                    <p className="font-semibold">{formatSTX(watchedValues.softCap)} STX</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Hard Cap</p>
                    <p className="font-semibold">{formatSTX(watchedValues.hardCap)} STX</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Min Purchase</p>
                    <p className="font-semibold">{formatSTX(watchedValues.minPurchase)} STX</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Max Purchase</p>
                    <p className="font-semibold">{formatSTX(watchedValues.maxPurchase)} STX</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Duration</p>
                    <p className="font-semibold">
                      {watchedValues.durationBlocks} blocks (~{formatBlocksToTime(watchedValues.durationBlocks)})
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Estimated Calculations */}
              <div>
                <h3 className="font-semibold mb-3">Estimated Results</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Max Tokens to Sell</span>
                    <span className="font-semibold">{maxTokensToSell.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Platform Fee (2%)</span>
                    <span className="font-semibold">{formatSTX(platformFee)} STX</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">You Receive (if hard cap reached)</span>
                    <span className="font-semibold text-green-500">
                      {formatSTX(watchedValues.hardCap - platformFee)} STX
                    </span>
                  </div>
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  <strong>Important:</strong> Once created, launch parameters cannot be modified. The platform fee is only charged if the launch meets its soft cap.
                </AlertDescription>
              </Alert>

              {/* Terms Agreement */}
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={agreed}
                  onCheckedChange={(checked) => setAgreed(checked as boolean)}
                />
                <label
                  htmlFor="terms"
                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I agree to the terms and conditions. I understand that all information is correct and cannot be changed after launch creation.
                </label>
              </div>

              {form.formState.errors.root && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {form.formState.errors.root.message}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={goBack}
            disabled={step === 1 || isPending}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <Button type="submit" disabled={isPending || (step === 3 && !agreed)}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {step < 3 ? (
              <>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            ) : (
              'Create Launch'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function CreatePage() {
  return (
    <ProtectedRoute>
      <CreateLaunchContent />
    </ProtectedRoute>
  );
}
