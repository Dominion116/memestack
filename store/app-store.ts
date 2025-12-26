import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { connect } from '@stacks/connect';
import type { WalletState } from '@/lib/types';
import { getAccountBalance } from '@/lib/stacks/contract';
// Enable BigInt JSON serialization
if (typeof BigInt !== 'undefined') {
  (BigInt.prototype as unknown as { toJSON: () => string }).toJSON = function () {
    return this.toString();
  };
}

export interface AppState extends WalletState {
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  refreshBalance: () => Promise<void>;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  pendingTxs: string[];
  addPendingTx: (txId: string) => void;
  removePendingTx: (txId: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      address: null,
      balance: BigInt(0),
      isConnected: false,
      network: 'mainnet',
      theme: 'dark',
      isLoading: false,
      pendingTxs: [],
      connectWallet: async () => {
        try {
          set({ isLoading: true });
          const network = get().network || 'mainnet';
          const response = await connect({ network });
          // response is expected to have addresses array
          let address = null;
          if (response && Array.isArray(response.addresses)) {
            // Find the first STX address
            type StxAddress = { symbol?: string; address: string };
            const stxAddr = (response.addresses as StxAddress[]).find(
              (a) => a.symbol === 'STX' || (typeof a.address === 'string' && a.address.startsWith('S'))
            );
            address = stxAddr?.address || null;
          }
          if (!address) {
            console.error('connect: Unable to extract address from response:', response);
            throw new Error('No Stacks address returned from wallet');
          }
          const balance = await getAccountBalance(address);
          set({
            address,
            balance,
            isConnected: true,
            isLoading: false,
          });
        } catch (error) {
          let errorMsg = 'Unknown error';
          if (error instanceof Error) {
            errorMsg = error.message;
            console.error('Failed to connect wallet:', error.message, error.stack, error);
          } else if (typeof error === 'string') {
            errorMsg = error;
            console.error('Failed to connect wallet:', error);
          } else if (typeof error === 'object' && error !== null) {
            errorMsg = JSON.stringify(error);
            console.error('Failed to connect wallet:', errorMsg);
          } else {
            console.error('Failed to connect wallet: Unknown error', error);
          }
          set({ isLoading: false });
        }
      },
      disconnectWallet: async () => {
        set({ address: null, balance: BigInt(0), isConnected: false });
      },
      refreshBalance: async () => {
        const { address } = get();
        if (!address) return;
        try {
          const balance = await getAccountBalance(address);
          set({ balance });
        } catch (error) {
          console.error('Failed to refresh balance:', error);
        }
      },
      setTheme: (theme) => set({ theme }),
      setIsLoading: (isLoading) => set({ isLoading }),
      addPendingTx: (txId) => {
        set((state) => ({
          pendingTxs: [...state.pendingTxs, txId],
        }));
      },
      removePendingTx: (txId) => {
        set((state) => ({
          pendingTxs: state.pendingTxs.filter((id) => id !== txId),
        }));
      },
    }),
    {
      name: 'memestack-storage',
      partialize: (state) => ({
        theme: state.theme,
      }),
    }
  )
);

// Remove all code below this line (legacy/duplicate/WalletConnect)
