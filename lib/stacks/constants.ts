import { StacksMainnet, StacksTestnet } from '@stacks/network';

// Network Configuration
export const NETWORK = process.env.NEXT_PUBLIC_NETWORK === 'mainnet' 
  ? new StacksMainnet() 
  : new StacksTestnet();

export const IS_MAINNET = process.env.NEXT_PUBLIC_NETWORK === 'mainnet';

// Contract Configuration
export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || 'ST30VGN68PSGVWGNMD0HH2WQMM5T486EK3WBNTHCY';
export const CONTRACT_NAME = process.env.NEXT_PUBLIC_CONTRACT_NAME || 'memecoin-launchpad';
export const TOKEN_FACTORY_CONTRACT = process.env.NEXT_PUBLIC_TOKEN_FACTORY_CONTRACT || 'token-factory';

// API Endpoints
export const STACKS_API_URL = process.env.NEXT_PUBLIC_STACKS_API || 'https://api.testnet.hiro.so';
export const EXPLORER_URL = process.env.NEXT_PUBLIC_EXPLORER_URL || 'https://explorer.hiro.so';

// App Configuration
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Memestack';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
export const PLATFORM_FEE_PERCENTAGE = Number(process.env.NEXT_PUBLIC_PLATFORM_FEE) || 2;

// Contract Constants
export const MICRO_STX_PER_STX = 1_000_000;
export const BLOCKS_PER_HOUR = 6; // Approximate, ~10 minutes per block
export const BLOCKS_PER_DAY = BLOCKS_PER_HOUR * 24;

// Launch Status
export enum LaunchStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  ENDED = 'ended',
  SUCCESSFUL = 'successful',
  FAILED = 'failed',
}

// Contract Error Codes
export const CONTRACT_ERRORS: Record<string, string> = {
  'u100': 'Owner only - This action requires owner privileges',
  'u101': 'Launch not found - Invalid launch ID',
  'u102': 'Already launched - Cannot modify active launch',
  'u103': 'Launch not active - Launch is not currently accepting contributions',
  'u104': 'Insufficient amount - Amount too low',
  'u105': 'Max supply reached - Hard cap exceeded',
  'u106': 'Below minimum purchase - Amount below minimum allowed',
  'u107': 'Exceeds maximum purchase - Amount exceeds maximum allowed per user',
  'u108': 'Launch ended - Launch period has concluded',
  'u109': 'Launch not ended - Launch is still active',
  'u110': 'Unauthorized - You are not authorized for this action',
  'u111': 'Soft cap not met - Launch failed to meet minimum funding goal',
  'u112': 'Already claimed - Tokens already claimed',
  'u113': 'No refund available - Refund not applicable',
  'u114': 'Calculation overflow - Amount too large',
  'u115': 'Contract paused - Contract operations are paused',
};

// Transaction Options
export const DEFAULT_POST_CONDITIONS_MODE = 0x01; // Allow
export const TX_BROADCAST_TIMEOUT = 30000; // 30 seconds

// Polling Intervals
export const LAUNCH_REFRESH_INTERVAL = 30000; // 30 seconds
export const BALANCE_REFRESH_INTERVAL = 60000; // 1 minute
export const BLOCK_HEIGHT_REFRESH_INTERVAL = 60000; // 1 minute

// Validation Limits (matching contract constraints)
export const VALIDATION = {
  TOKEN_NAME_MAX: 32,
  TOKEN_SYMBOL_MAX: 10,
  TOKEN_URI_MAX: 256,
  MIN_SOFT_CAP: 1_000_000, // 1 STX in micro-STX
  MAX_HARD_CAP: 10_000_000_000, // 10,000 STX in micro-STX
  MIN_DURATION_BLOCKS: 10,
  MIN_TOTAL_SUPPLY: 1,
};
