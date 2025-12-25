import { z } from 'zod';
import { VALIDATION, MICRO_STX_PER_STX } from '../stacks/constants';

/**
 * Validation schema for creating a launch
 */
export const createLaunchSchema = z.object({
  // Step 1: Token Information
  tokenName: z
    .string()
    .min(1, 'Token name is required')
    .max(VALIDATION.TOKEN_NAME_MAX, `Token name must be ${VALIDATION.TOKEN_NAME_MAX} characters or less`)
    .regex(/^[\x20-\x7E]*$/, 'Token name must contain only ASCII characters'),
  
  tokenSymbol: z
    .string()
    .min(1, 'Token symbol is required')
    .max(VALIDATION.TOKEN_SYMBOL_MAX, `Token symbol must be ${VALIDATION.TOKEN_SYMBOL_MAX} characters or less`)
    .regex(/^[A-Z0-9]*$/, 'Token symbol must be uppercase letters and numbers only'),
  
  tokenUri: z
    .string()
    .max(VALIDATION.TOKEN_URI_MAX, `Token URI must be ${VALIDATION.TOKEN_URI_MAX} characters or less`)
    .optional()
    .or(z.literal('')),
  
  totalSupply: z
    .number()
    .min(VALIDATION.MIN_TOTAL_SUPPLY, 'Total supply must be at least 1')
    .int('Total supply must be a whole number'),
  
  pricePerToken: z
    .number()
    .min(1, 'Price per token must be greater than 0')
    .int('Price per token must be a whole number'),
  
  // Step 2: Launch Parameters
  softCap: z
    .number()
    .min(VALIDATION.MIN_SOFT_CAP, `Soft cap must be at least ${VALIDATION.MIN_SOFT_CAP / MICRO_STX_PER_STX} STX`),
  
  hardCap: z
    .number()
    .max(VALIDATION.MAX_HARD_CAP, `Hard cap must be at most ${VALIDATION.MAX_HARD_CAP / MICRO_STX_PER_STX} STX`),
  
  minPurchase: z
    .number()
    .min(VALIDATION.MIN_SOFT_CAP, `Minimum purchase must be at least ${VALIDATION.MIN_SOFT_CAP / MICRO_STX_PER_STX} STX`),
  
  maxPurchase: z
    .number()
    .min(1, 'Maximum purchase must be greater than 0'),
  
  durationBlocks: z
    .number()
    .min(VALIDATION.MIN_DURATION_BLOCKS, `Duration must be at least ${VALIDATION.MIN_DURATION_BLOCKS} blocks`)
    .int('Duration must be a whole number'),
}).refine((data) => data.hardCap > data.softCap, {
  message: 'Hard cap must be greater than soft cap',
  path: ['hardCap'],
}).refine((data) => data.maxPurchase <= data.hardCap, {
  message: 'Maximum purchase cannot exceed hard cap',
  path: ['maxPurchase'],
}).refine((data) => data.maxPurchase > data.minPurchase, {
  message: 'Maximum purchase must be greater than minimum purchase',
  path: ['maxPurchase'],
});

export type CreateLaunchFormData = z.infer<typeof createLaunchSchema>;

/**
 * Validation schema for buying tokens
 */
export const buyTokensSchema = z.object({
  stxAmount: z
    .number()
    .min(1, 'Amount must be greater than 0')
    .int('Amount must be a whole number'),
});

export type BuyTokensFormData = z.infer<typeof buyTokensSchema>;

/**
 * Validate STX amount against min/max purchase limits
 */
export function validatePurchaseAmount(
  amount: number,
  minPurchase: number,
  maxPurchase: number,
  currentContribution: number = 0,
  userBalance: number = 0
): { valid: boolean; error?: string } {
  if (amount < minPurchase) {
    return {
      valid: false,
      error: `Amount must be at least ${minPurchase / MICRO_STX_PER_STX} STX`,
    };
  }

  const totalContribution = currentContribution + amount;
  if (totalContribution > maxPurchase) {
    const remaining = maxPurchase - currentContribution;
    return {
      valid: false,
      error: `Amount exceeds maximum purchase limit. You can contribute ${remaining / MICRO_STX_PER_STX} STX more`,
    };
  }

  if (amount > userBalance) {
    return {
      valid: false,
      error: 'Insufficient STX balance',
    };
  }

  return { valid: true };
}

/**
 * Validate if launch can be finalized
 */
export function canFinalizeLaunch(
  currentBlock: number,
  endBlock: number,
  isFinalized: boolean
): { canFinalize: boolean; reason?: string } {
  if (isFinalized) {
    return { canFinalize: false, reason: 'Launch already finalized' };
  }

  if (currentBlock < endBlock) {
    return { canFinalize: false, reason: 'Launch has not ended yet' };
  }

  return { canFinalize: true };
}

/**
 * Validate ASCII string
 */
export function isValidAscii(str: string): boolean {
  return /^[\x20-\x7E]*$/.test(str);
}

/**
 * Validate token symbol (uppercase alphanumeric)
 */
export function isValidTokenSymbol(symbol: string): boolean {
  return /^[A-Z0-9]*$/.test(symbol);
}
