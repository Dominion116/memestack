import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import type { WalletState } from '@/lib/types';
import { getAccountBalance } from '@/lib/stacks/contract';
import { IS_MAINNET, APP_NAME } from '@/lib/stacks/constants';

interface AppState extends WalletState {
  // Wallet methods
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  refreshBalance: () => Promise<void>;
  
  // UI state
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  
  // Loading states
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  
  // Transaction tracking
  pendingTxs: string[];
  addPendingTx: (txId: string) => void;
  removePendingTx: (txId: string) => void;
}

// Initialize Stacks authentication
const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Wallet state
      address: null,
      balance: BigInt(0),
      isConnected: false,
      network: IS_MAINNET ? 'mainnet' : 'testnet',
      
      // UI state
      theme: 'dark',
      isLoading: false,
      pendingTxs: [],

      // Connect wallet using Stacks Connect
      connectWallet: async () => {
        try {
          set({ isLoading: true });
          
          showConnect({
            appDetails: {
              name: APP_NAME,
              icon: '/logo.png', // Add your logo
            },
            redirectTo: '/',
            onFinish: async () => {
              if (userSession.isUserSignedIn()) {
                const userData = userSession.loadUserData();
                const address = userData.profile.stxAddress[IS_MAINNET ? 'mainnet' : 'testnet'];
                
                // Fetch balance
                const balance = await getAccountBalance(address);
                
                set({
                  address,
                  balance,
                  isConnected: true,
                  isLoading: false,
                });
              }
            },
            onCancel: () => {
              set({ isLoading: false });
            },
            userSession,
          });
        } catch (error) {
          console.error('Failed to connect wallet:', error);
          set({ isLoading: false });
        }
      },

      // Disconnect wallet
      disconnectWallet: () => {
        userSession.signUserOut();
        set({
          address: null,
          balance: BigInt(0),
          isConnected: false,
          pendingTxs: [],
        });
      },

      // Refresh wallet balance
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

      // Theme
      setTheme: (theme) => set({ theme }),

      // Loading state
      setIsLoading: (isLoading) => set({ isLoading }),

      // Transaction tracking
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
        // Don't persist sensitive wallet data
      }),
    }
  )
);

// Auto-restore wallet connection on app load
if (typeof window !== 'undefined') {
  if (userSession.isUserSignedIn()) {
    const userData = userSession.loadUserData();
    const address = userData.profile.stxAddress[IS_MAINNET ? 'mainnet' : 'testnet'];
    
    getAccountBalance(address).then((balance) => {
      useAppStore.setState({
        address,
        balance,
        isConnected: true,
      });
    });
  }
}

// Export userSession for use in components
export { userSession };
