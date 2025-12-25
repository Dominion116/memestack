import { MICRO_STX_PER_STX } from '../stacks/constants';
import { formatDistanceToNow, format } from 'date-fns';

/**
 * Format micro-STX to STX with decimal places
 */
export function formatSTX(microStx: number | bigint, decimals: number = 6): string {
  const stx = Number(microStx) / MICRO_STX_PER_STX;
  return stx.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format large numbers with K, M, B suffixes
 */
export function formatCompactNumber(num: number): string {
  if (num < 1000) return num.toFixed(0);
  if (num < 1_000_000) return (num / 1000).toFixed(1) + 'K';
  if (num < 1_000_000_000) return (num / 1_000_000).toFixed(1) + 'M';
  return (num / 1_000_000_000).toFixed(1) + 'B';
}

/**
 * Format Stacks address (truncate middle)
 */
export function formatAddress(address: string, chars: number = 4): string {
  if (!address) return '';
  if (address.length <= chars * 2) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, total: number, decimals: number = 2): string {
  if (total === 0) return '0%';
  const percentage = (value / total) * 100;
  return `${percentage.toFixed(decimals)}%`;
}

/**
 * Format block number with commas
 */
export function formatBlockNumber(block: number): string {
  return block.toLocaleString('en-US');
}

/**
 * Format time ago (e.g., "2 hours ago")
 */
export function formatTimeAgo(timestamp: number): string {
  try {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  } catch {
    return 'Unknown';
  }
}

/**
 * Format time remaining from blocks
 * @param blocks - Number of blocks remaining
 * @param blocksPerMinute - Blocks per minute (default: 0.1, ~10 min/block)
 */
export function formatBlocksToTime(blocks: number, blocksPerMinute: number = 0.1): string {
  if (blocks <= 0) return 'Ended';
  
  const minutes = blocks / blocksPerMinute;
  const hours = minutes / 60;
  const days = hours / 24;

  if (days >= 1) {
    return `${Math.floor(days)}d ${Math.floor(hours % 24)}h`;
  }
  if (hours >= 1) {
    return `${Math.floor(hours)}h ${Math.floor(minutes % 60)}m`;
  }
  return `${Math.floor(minutes)}m`;
}

/**
 * Format timestamp to relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(timestamp: number): string {
  return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
}

/**
 * Format timestamp to date string
 */
export function formatDate(timestamp: number, formatStr: string = 'MMM dd, yyyy HH:mm'): string {
  return format(new Date(timestamp), formatStr);
}

/**
 * Format token amount with proper decimals
 */
export function formatTokenAmount(amount: number | bigint, decimals: number = 6): string {
  const num = Number(amount);
  if (num >= 1_000_000_000) return formatCompactNumber(num);
  
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}

/**
 * Parse STX input to micro-STX
 */
export function parseSTXToMicroSTX(stx: string | number): number {
  const num = typeof stx === 'string' ? parseFloat(stx) : stx;
  if (isNaN(num)) return 0;
  return Math.floor(num * MICRO_STX_PER_STX);
}

/**
 * Calculate token price in STX
 */
export function calculateTokenPrice(pricePerToken: number, tokensPerUnit: number = 1_000_000): string {
  const priceInSTX = (pricePerToken * tokensPerUnit) / MICRO_STX_PER_STX;
  return formatSTX(Math.floor(priceInSTX * MICRO_STX_PER_STX), 8);
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy:', error);
    return false;
  }
}
