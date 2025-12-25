/**
 * TypeScript interfaces for Memestack contract data structures
 */

export interface Launch {
  id: number;
  creator: string;
  tokenName: string;
  tokenSymbol: string;
  tokenUri: string;
  totalSupply: bigint;
  pricePerToken: bigint;
  softCap: bigint;
  hardCap: bigint;
  minPurchase: bigint;
  maxPurchase: bigint;
  startBlock: number;
  endBlock: number;
  durationBlocks: number;
  totalRaised: bigint;
  totalTokensSold: bigint;
  isFinalized: boolean;
  isSuccessful: boolean;
  createdAt: number;
}

export interface LaunchContribution {
  launchId: number;
  user: string;
  stxContributed: bigint;
  tokensAllocated: bigint;
  hasClaimed: boolean;
  hasRefunded: boolean;
}

export interface LaunchStats {
  id: number;
  totalRaised: bigint;
  totalTokensSold: bigint;
  totalContributors: number;
  isActive: boolean;
  progressPercentage: number;
  blocksRemaining: number;
  timeRemaining: string;
}

export interface PlatformInfo {
  name: string;
  version: string;
  description: string;
  totalLaunches: number;
  totalRaised: bigint;
}

export interface UserStats {
  totalLaunchesCreated: number;
  totalInvestments: number;
  totalStxInvested: bigint;
  totalTokensClaimed: bigint;
}

export interface Transaction {
  txId: string;
  type: 'create' | 'buy' | 'finalize' | 'claim' | 'refund';
  launchId?: number;
  amount?: bigint;
  status: 'pending' | 'success' | 'failed';
  timestamp: number;
  error?: string;
}

export interface WalletState {
  address: string | null;
  balance: bigint;
  isConnected: boolean;
  network: 'mainnet' | 'testnet';
}

// Form data types
export interface CreateLaunchParams {
  tokenName: string;
  tokenSymbol: string;
  tokenUri: string;
  totalSupply: bigint;
  pricePerToken: bigint;
  softCap: bigint;
  hardCap: bigint;
  minPurchase: bigint;
  maxPurchase: bigint;
  durationBlocks: number;
}

export interface BuyTokensParams {
  launchId: number;
  stxAmount: bigint;
}

// Filter and sort types
export type LaunchFilter = 'all' | 'active' | 'ending-soon' | 'successful' | 'failed';
export type LaunchSortBy = 'newest' | 'most-raised' | 'ending-soon' | 'progress';

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Clarity value conversion helpers
export type ClarityValue = any; // Use actual Clarity types from @stacks/transactions

export interface ParsedLaunchData {
  launch: Launch;
  stats: LaunchStats;
}
