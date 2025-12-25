import { useEffect, useState } from 'react';
import { useAppStore } from '@/store/app-store';

/**
 * Hook to ensure user is connected with wallet
 */
export function useWallet() {
  const {
    address,
    balance,
    isConnected,
    network,
    connectWallet,
    disconnectWallet,
    refreshBalance,
    isLoading,
  } = useAppStore();

  return {
    address,
    balance,
    isConnected,
    network,
    connectWallet,
    disconnectWallet,
    refreshBalance,
    isLoading,
  };
}

/**
 * Hook to require wallet connection
 */
export function useRequireWallet() {
  const { isConnected, connectWallet } = useWallet();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!isConnected) {
      // Optionally redirect or show connect modal
    }
    setIsChecking(false);
  }, [isConnected]);

  return { isConnected, isChecking, connectWallet };
}
