import { useState } from 'react';
import { toast } from 'sonner';
import {
  createLaunch as contractCreateLaunch,
  buyTokens as contractBuyTokens,
  finalizeLaunch as contractFinalizeLaunch,
  claimTokens as contractClaimTokens,
  requestRefund as contractRequestRefund,
} from '@/lib/stacks/contract';
import { useAppStore } from '@/store/app-store';
import { getErrorMessage } from '@/lib/utils/errors';
import { EXPLORER_URL } from '@/lib/stacks/constants';
import type { CreateLaunchParams, BuyTokensParams } from '@/lib/types';

/**
 * Hook for contract interactions with transaction management
 */
export function useContractCall() {
  const [isPending, setIsPending] = useState(false);
  const { addPendingTx, removePendingTx } = useAppStore();

  const createLaunch = async (params: CreateLaunchParams) => {
    setIsPending(true);
    
    try {
      await contractCreateLaunch(
        params,
        (data) => {
          // Transaction submitted successfully
          const txId = data.txId;
          addPendingTx(txId);
          
          toast.success('Launch created!', {
            description: 'Your launch has been submitted to the blockchain',
            action: {
              label: 'View Transaction',
              onClick: () => window.open(`${EXPLORER_URL}/txid/${txId}?chain=testnet`, '_blank'),
            },
          });
          
          // Clean up after some time
          setTimeout(() => {
            removePendingTx(txId);
            setIsPending(false);
          }, 30000);
        },
        () => {
          // Transaction cancelled
          toast.error('Transaction cancelled');
          setIsPending(false);
        }
      );
    } catch (error) {
      toast.error('Failed to create launch', {
        description: getErrorMessage(error),
      });
      setIsPending(false);
      throw error;
    }
  };

  const buyTokens = async (params: BuyTokensParams) => {
    setIsPending(true);
    
    try {
      await contractBuyTokens(
        params,
        (data) => {
          const txId = data.txId;
          addPendingTx(txId);
          
          toast.success('Purchase successful!', {
            description: 'Your token purchase has been submitted',
            action: {
              label: 'View Transaction',
              onClick: () => window.open(`${EXPLORER_URL}/txid/${txId}?chain=testnet`, '_blank'),
            },
          });
          
          setTimeout(() => {
            removePendingTx(txId);
            setIsPending(false);
          }, 30000);
        },
        () => {
          toast.error('Transaction cancelled');
          setIsPending(false);
        }
      );
    } catch (error) {
      toast.error('Failed to buy tokens', {
        description: getErrorMessage(error),
      });
      setIsPending(false);
      throw error;
    }
  };

  const finalizeLaunch = async (launchId: number) => {
    setIsPending(true);
    
    try {
      await contractFinalizeLaunch(
        launchId,
        (data) => {
          const txId = data.txId;
          addPendingTx(txId);
          
          toast.success('Launch finalized!', {
            description: 'The launch has been finalized',
            action: {
              label: 'View Transaction',
              onClick: () => window.open(`${EXPLORER_URL}/txid/${txId}?chain=testnet`, '_blank'),
            },
          });
          
          setTimeout(() => {
            removePendingTx(txId);
            setIsPending(false);
          }, 30000);
        },
        () => {
          toast.error('Transaction cancelled');
          setIsPending(false);
        }
      );
    } catch (error) {
      toast.error('Failed to finalize launch', {
        description: getErrorMessage(error),
      });
      setIsPending(false);
      throw error;
    }
  };

  const claimTokens = async (launchId: number) => {
    setIsPending(true);
    
    try {
      await contractClaimTokens(
        launchId,
        (data) => {
          const txId = data.txId;
          addPendingTx(txId);
          
          toast.success('Tokens claimed!', {
            description: 'Your tokens have been claimed successfully',
            action: {
              label: 'View Transaction',
              onClick: () => window.open(`${EXPLORER_URL}/txid/${txId}?chain=testnet`, '_blank'),
            },
          });
          
          setTimeout(() => {
            removePendingTx(txId);
            setIsPending(false);
          }, 30000);
        },
        () => {
          toast.error('Transaction cancelled');
          setIsPending(false);
        }
      );
    } catch (error) {
      toast.error('Failed to claim tokens', {
        description: getErrorMessage(error),
      });
      setIsPending(false);
      throw error;
    }
  };

  const requestRefund = async (launchId: number) => {
    setIsPending(true);
    
    try {
      await contractRequestRefund(
        launchId,
        (data) => {
          const txId = data.txId;
          addPendingTx(txId);
          
          toast.success('Refund requested!', {
            description: 'Your refund has been processed',
            action: {
              label: 'View Transaction',
              onClick: () => window.open(`${EXPLORER_URL}/txid/${txId}?chain=testnet`, '_blank'),
            },
          });
          
          setTimeout(() => {
            removePendingTx(txId);
            setIsPending(false);
          }, 30000);
        },
        () => {
          toast.error('Transaction cancelled');
          setIsPending(false);
        }
      );
    } catch (error) {
      toast.error('Failed to request refund', {
        description: getErrorMessage(error),
      });
      setIsPending(false);
      throw error;
    }
  };

  return {
    isPending,
    createLaunch,
    buyTokens,
    finalizeLaunch,
    claimTokens,
    requestRefund,
  };
}
