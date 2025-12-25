import {
  fetchCallReadOnlyFunction,
  cvToJSON,
  uintCV,
  principalCV,
  stringAsciiCV,
  stringUtf8CV,
  PostConditionMode,
} from '@stacks/transactions';
import { openContractCall } from '@stacks/connect';
import {
  CONTRACT_ADDRESS,
  CONTRACT_NAME,
  NETWORK,
  STACKS_API_URL,
} from './constants';
import type {
  Launch,
  LaunchContribution,
  LaunchStats,
  CreateLaunchParams,
  BuyTokensParams,
  ApiResponse,
} from '../types';
import { logError } from '../utils/errors';

// Type for transaction finish callback data
type FinishTxData = {
  txId: string;
  txRaw: string;
};

/**
 * Read-only contract calls
 */

/**
 * Get launch data by ID
 */
export async function getLaunch(launchId: number): Promise<ApiResponse<Launch>> {
  try {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-launch',
      functionArgs: [uintCV(launchId)],
      network: NETWORK,
      senderAddress: CONTRACT_ADDRESS,
    });

    const jsonResult = cvToJSON(result);
    
    if (!jsonResult.success) {
      return { success: false, error: 'Launch not found' };
    }

    // Parse the launch data from Clarity response
    const launchData = jsonResult.value;
    
    return {
      success: true,
      data: parseLaunchData(launchData, launchId),
    };
  } catch (error) {
    logError('getLaunch', error);
    return { success: false, error: 'Failed to fetch launch data' };
  }
}

/**
 * Get user contribution for a launch
 */
export async function getUserContribution(
  launchId: number,
  userAddress: string
): Promise<ApiResponse<LaunchContribution>> {
  try {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-user-contribution',
      functionArgs: [uintCV(launchId), principalCV(userAddress)],
      network: NETWORK,
      senderAddress: CONTRACT_ADDRESS,
    });

    const jsonResult = cvToJSON(result);
    
    return {
      success: true,
      data: parseContributionData(jsonResult, launchId, userAddress),
    };
  } catch (error) {
    logError('getUserContribution', error);
    return { success: false, error: 'Failed to fetch contribution data' };
  }
}

/**
 * Get current launch ID
 */
export async function getCurrentLaunchId(): Promise<ApiResponse<number>> {
  try {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-current-launch-id',
      functionArgs: [],
      network: NETWORK,
      senderAddress: CONTRACT_ADDRESS,
    });

    const jsonResult = cvToJSON(result);
    
    return {
      success: true,
      data: jsonResult.value as number,
    };
  } catch (error) {
    logError('getCurrentLaunchId', error);
    return { success: false, error: 'Failed to fetch current launch ID' };
  }
}

/**
 * Check if launch is active
 */
export async function isLaunchActive(launchId: number): Promise<ApiResponse<boolean>> {
  try {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'is-launch-active',
      functionArgs: [uintCV(launchId)],
      network: NETWORK,
      senderAddress: CONTRACT_ADDRESS,
    });

    const jsonResult = cvToJSON(result);
    
    return {
      success: true,
      data: jsonResult.value as boolean,
    };
  } catch (error) {
    logError('isLaunchActive', error);
    return { success: false, error: 'Failed to check launch status' };
  }
}

/**
 * Calculate tokens for STX amount
 */
export async function calculateTokensForSTX(
  launchId: number,
  stxAmount: bigint
): Promise<ApiResponse<bigint>> {
  try {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'calculate-tokens-for-stx',
      functionArgs: [uintCV(launchId), uintCV(Number(stxAmount))],
      network: NETWORK,
      senderAddress: CONTRACT_ADDRESS,
    });

    const jsonResult = cvToJSON(result);
    
    return {
      success: true,
      data: BigInt(jsonResult.value),
    };
  } catch (error) {
    logError('calculateTokensForSTX', error);
    return { success: false, error: 'Failed to calculate tokens' };
  }
}

/**
 * Get launch statistics
 */
export async function getLaunchStats(launchId: number): Promise<ApiResponse<LaunchStats>> {
  try {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-launch-stats',
      functionArgs: [uintCV(launchId)],
      network: NETWORK,
      senderAddress: CONTRACT_ADDRESS,
    });

    const jsonResult = cvToJSON(result);
    
    return {
      success: true,
      data: parseStatsData(jsonResult, launchId),
    };
  } catch (error) {
    logError('getLaunchStats', error);
    return { success: false, error: 'Failed to fetch launch stats' };
  }
}

/**
 * Get platform information
 */
export async function getPlatformInfo(): Promise<ApiResponse<unknown>> {
  try {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-platform-info',
      functionArgs: [],
      network: NETWORK,
      senderAddress: CONTRACT_ADDRESS,
    });

    const jsonResult = cvToJSON(result);
    
    return {
      success: true,
      data: jsonResult.value,
    };
  } catch (error) {
    logError('getPlatformInfo', error);
    return { success: false, error: 'Failed to fetch platform info' };
  }
}

/**
 * Transaction functions (requires wallet signature)
 */

/**
 * Create a new launch
 */
export async function createLaunch(
  params: CreateLaunchParams,
  onFinish?: (data: FinishTxData) => void,
  onCancel?: () => void
): Promise<void> {
  try {
    await openContractCall({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'create-launch',
      functionArgs: [
        stringAsciiCV(params.tokenName),
        stringAsciiCV(params.tokenSymbol),
        stringUtf8CV(params.tokenUri),
        uintCV(Number(params.totalSupply)),
        uintCV(Number(params.pricePerToken)),
        uintCV(Number(params.softCap)),
        uintCV(Number(params.hardCap)),
        uintCV(Number(params.minPurchase)),
        uintCV(Number(params.maxPurchase)),
        uintCV(params.durationBlocks),
      ],
      network: NETWORK,
      postConditionMode: PostConditionMode.Allow,
      onFinish: onFinish,
      onCancel: onCancel,
    });
  } catch (error) {
    logError('createLaunch', error);
    throw error;
  }
}

/**
 * Buy tokens in a launch
 */
export async function buyTokens(
  params: BuyTokensParams,
  onFinish?: (data: FinishTxData) => void,
  onCancel?: () => void
): Promise<void> {
  try {
    await openContractCall({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'buy-tokens',
      functionArgs: [
        uintCV(params.launchId),
        uintCV(Number(params.stxAmount)),
      ],
      network: NETWORK,
      postConditionMode: PostConditionMode.Allow,
      onFinish: onFinish,
      onCancel: onCancel,
    });
  } catch (error) {
    logError('buyTokens', error);
    throw error;
  }
}

/**
 * Finalize a launch
 */
export async function finalizeLaunch(
  launchId: number,
  onFinish?: (data: FinishTxData) => void,
  onCancel?: () => void
): Promise<void> {
  try {
    await openContractCall({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'finalize-launch',
      functionArgs: [uintCV(launchId)],
      network: NETWORK,
      postConditionMode: PostConditionMode.Allow,
      onFinish: onFinish,
      onCancel: onCancel,
    });
  } catch (error) {
    logError('finalizeLaunch', error);
    throw error;
  }
}

/**
 * Claim tokens from successful launch
 */
export async function claimTokens(
  launchId: number,
  onFinish?: (data: FinishTxData) => void,
  onCancel?: () => void
): Promise<void> {
  try {
    await openContractCall({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'claim-tokens',
      functionArgs: [uintCV(launchId)],
      network: NETWORK,
      postConditionMode: PostConditionMode.Allow,
      onFinish: onFinish,
      onCancel: onCancel,
    });
  } catch (error) {
    logError('claimTokens', error);
    throw error;
  }
}

/**
 * Request refund from failed launch
 */
export async function requestRefund(
  launchId: number,
  onFinish?: (data: FinishTxData) => void,
  onCancel?: () => void
): Promise<void> {
  try {
    await openContractCall({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'request-refund',
      functionArgs: [uintCV(launchId)],
      network: NETWORK,
      postConditionMode: PostConditionMode.Allow,
      onFinish: onFinish,
      onCancel: onCancel,
    });
  } catch (error) {
    logError('requestRefund', error);
    throw error;
  }
}

/**
 * Helper functions to parse contract responses
 */

function parseLaunchData(data: Record<string, unknown>, launchId: number): Launch {
  // Type assertion for Clarity value structure
  const d = data as Record<string, { value: unknown }>;
  return {
    id: launchId,
    creator: (d.creator?.value as string) || '',
    tokenName: (d['token-name']?.value as string) || '',
    tokenSymbol: (d['token-symbol']?.value as string) || '',
    tokenUri: (d['token-uri']?.value as string) || '',
    totalSupply: BigInt((d['total-supply']?.value as number) || 0),
    pricePerToken: BigInt((d['price-per-token']?.value as number) || 0),
    softCap: BigInt((d['soft-cap']?.value as number) || 0),
    hardCap: BigInt((d['hard-cap']?.value as number) || 0),
    minPurchase: BigInt((d['min-purchase']?.value as number) || 0),
    maxPurchase: BigInt((d['max-purchase']?.value as number) || 0),
    startBlock: Number((d['start-block']?.value as number) || 0),
    endBlock: Number((d['end-block']?.value as number) || 0),
    durationBlocks: Number((d['duration-blocks']?.value as number) || 0),
    totalRaised: BigInt((d['total-raised']?.value as number) || 0),
    totalTokensSold: BigInt((d['total-tokens-sold']?.value as number) || 0),
    isFinalized: (d['is-finalized']?.value as boolean) || false,
    isSuccessful: (d['is-successful']?.value as boolean) || false,
    createdAt: Date.now(), // This should come from blockchain data
  };
}

function parseContributionData(data: Record<string, unknown>, launchId: number, userAddress: string): LaunchContribution {
  // Type assertion for Clarity value structure
  const d = data as Record<string, { value: unknown }>;
  return {
    launchId,
    user: userAddress,
    stxContributed: BigInt((d['stx-contributed']?.value as number) || 0),
    tokensAllocated: BigInt((d['tokens-allocated']?.value as number) || 0),
    hasClaimed: (d['has-claimed']?.value as boolean) || false,
    hasRefunded: (d['has-refunded']?.value as boolean) || false,
  };
}

function parseStatsData(data: Record<string, unknown>, launchId: number): LaunchStats {
  // Type assertion for Clarity value structure
  const d = data as Record<string, { value: unknown }>;
  return {
    id: launchId,
    totalRaised: BigInt((d['total-raised']?.value as number) || 0),
    totalTokensSold: BigInt((d['total-tokens-sold']?.value as number) || 0),
    totalContributors: Number((d['total-contributors']?.value as number) || 0),
    isActive: (d['is-active']?.value as boolean) || false,
    progressPercentage: Number((d['progress-percentage']?.value as number) || 0),
    blocksRemaining: Number((d['blocks-remaining']?.value as number) || 0),
    timeRemaining: '',
  };
}

/**
 * Get current block height
 */
export async function getCurrentBlockHeight(): Promise<number> {
  try {
    const response = await fetch(`${STACKS_API_URL}/v2/info`);
    const data = await response.json();
    return data.stacks_tip_height;
  } catch (error) {
    logError('getCurrentBlockHeight', error);
    return 0;
  }
}

/**
 * Get account balance
 */
export async function getAccountBalance(address: string): Promise<bigint> {
  try {
    const response = await fetch(`${STACKS_API_URL}/v2/accounts/${address}`);
    const data = await response.json();
    return BigInt(data.balance);
  } catch (error) {
    logError('getAccountBalance', error);
    return BigInt(0);
  }
}

/**
 * Get transaction status
 */
export async function getTransactionStatus(txId: string): Promise<string> {
  try {
    const response = await fetch(`${STACKS_API_URL}/extended/v1/tx/${txId}`);
    const data = await response.json();
    return data.tx_status;
  } catch (error) {
    logError('getTransactionStatus', error);
    return 'unknown';
  }
}
