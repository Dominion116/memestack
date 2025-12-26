import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Client from '@walletconnect/sign-client';
import QRCodeModal from '@walletconnect/qrcode-modal';
import type { WalletState } from '@/lib/types';
import { getAccountBalance } from '@/lib/stacks/contract';
import { IS_MAINNET, APP_NAME } from '@/lib/stacks/constants';
import type { SessionTypes } from '@walletconnect/types';

// Enable BigInt JSON serialization
if (typeof BigInt !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (BigInt.prototype as any).toJSON = function () {
    return this.toString();
  };
}

// Chain IDs for Stacks
const STACKS_MAINNET_CHAIN = 'stacks:1';
const STACKS_TESTNET_CHAIN = 'stacks:2147483648';

interface AppState extends WalletState {
  // WalletConnect state
  client: Client | null;
  session: SessionTypes.Struct | null;
  
  // Wallet methods
  initializeWalletConnect: () => Promise<void>;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
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


export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Wallet state
      address: null,
      balance: BigInt(0),
      isConnected: false,
      network: IS_MAINNET ? 'mainnet' : 'testnet',
      
      // WalletConnect state
      client: null,
      session: null,
      
      // UI state
      theme: 'dark',
      isLoading: false,
      pendingTxs: [],

      // Initialize WalletConnect client
      initializeWalletConnect: async () => {
        const { client } = get();
        if (client) return; // Already initialized

        try {
          const wcClient = await Client.init({
            logger: 'error',
            relayUrl: 'wss://relay.walletconnect.com',
            projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'your-project-id',
            metadata: {
              name: APP_NAME,
              description: 'Fair launch platform for memecoins on Stacks blockchain',
              url: typeof window !== 'undefined' ? window.location.origin : 'https://memestack.io',
              icons: [typeof window !== 'undefined' ? window.location.origin + '/logo.png' : 'https://memestack.io/logo.png'],
            },
          });

          set({ client: wcClient });
        } catch (error) {
          console.error('Failed to initialize WalletConnect:', error);
        }
      },

      // Connect wallet using WalletConnect
      connectWallet: async () => {
        try {
          set({ isLoading: true });
          
          let { client } = get();
          
          // Initialize client if not already done
          if (!client) {
            await get().initializeWalletConnect();
            client = get().client;
          }

          if (!client) {
            throw new Error('Failed to initialize WalletConnect client');
          }

          const chain = IS_MAINNET ? STACKS_MAINNET_CHAIN : STACKS_TESTNET_CHAIN;

          const { uri, approval } = await client.connect({
            pairingTopic: undefined,
            optionalNamespaces: {
              stacks: {
                methods: [
                  'stacks_signMessage',
                  'stacks_stxTransfer',
                  'stacks_contractCall',
                  'stacks_contractDeploy',
                ],
                chains: [chain],
                events: [],
              },
            },
          });

          if (uri) {
            QRCodeModal.open(uri, () => {
              console.log('QR Code Modal closed');
              set({ isLoading: false });
            });
          }

          const session = await approval();
          
          // Extract address from session
          const address = session.namespaces.stacks.accounts[0].split(':')[2];
          
          // Fetch balance
          const balance = await getAccountBalance(address);
          
          set({
            session,
            address,
            balance,
            isConnected: true,
            isLoading: false,
          });

          QRCodeModal.close();
        } catch (error) {
          console.error('Failed to connect wallet:', error);
          set({ isLoading: false });
          QRCodeModal.close();
        }
      },

      // Disconnect wallet
      disconnectWallet: async () => {
        const { client, session } = get();
        
        try {
          if (client && session) {
            await client.disconnect({
              topic: session.topic,
              reason: {
                code: 6000,
                message: 'User disconnected',
              },
            });
          }
        } catch (error) {
          console.error('Error disconnecting:', error);
        }

        set({
          session: null,
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
        session: state.session, // Persist session for reconnection
        // Don't persist client or sensitive data
      }),
    }
  )
);

// Auto-restore wallet connection on app load
if (typeof window !== 'undefined') {
  const store = useAppStore.getState();
  
  // Initialize WalletConnect client
  store.initializeWalletConnect().then(() => {
    const { session, client } = useAppStore.getState();
    
    // Restore session if exists
    if (session && client) {
      const address = session.namespaces?.stacks?.accounts?.[0]?.split(':')[2];
      
      if (address) {
        getAccountBalance(address).then((balance) => {
          useAppStore.setState({
            address,
            balance,
            isConnected: true,
          });
        }).catch((error) => {
          console.error('Failed to restore wallet connection:', error);
          useAppStore.setState({
            session: null,
            address: null,
            isConnected: false,
          });
        });
      }
    }
  });
}
