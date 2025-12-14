import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserAsset } from '@/types';
import type { TokenBalance } from '@/types/ergo';

// Wallet types
type WalletType = 'nautilus' | 'metamask' | 'none';
type NetworkType = 'mainnet' | 'testnet';

interface WalletState {
  // Connection
  isConnected: boolean;
  isConnecting: boolean;
  walletType: WalletType;
  networkType: NetworkType;
  
  // Account info
  address: string | null;
  addresses: string[];
  
  // Balances
  balance: number;           // ERG balance in ERG units
  balanceNano: string | null; // ERG balance in nanoERG
  tokens: TokenBalance[];
  
  // Assets
  ownedAssets: UserAsset[];
  
  // Error handling
  error: string | null;
}

interface WalletActions {
  // Nautilus/Ergo connection
  connectNautilus: () => Promise<boolean>;
  
  // MetaMask/EVM connection (legacy)
  connectMetaMask: () => Promise<boolean>;
  
  // Generic actions
  disconnect: () => Promise<void>;
  refreshBalance: () => Promise<void>;
  
  // State setters
  setConnected: (address: string, walletType?: WalletType) => void;
  setDisconnected: () => void;
  setBalance: (balance: number) => void;
  addOwnedAsset: (asset: UserAsset) => void;
  setConnecting: (isConnecting: boolean) => void;
  setError: (error: string | null) => void;
  
  // Transaction helpers
  signAndSubmitTx: (unsignedTx: unknown) => Promise<string>;
  getUtxos: (amount?: string) => Promise<unknown[] | undefined>;
  getCurrentHeight: () => Promise<number>;
}

type WalletStore = WalletState & WalletActions;

export const useWalletStore = create<WalletStore>()(
  persist(
    (set, get) => ({
      // Initial state
      isConnected: false,
      isConnecting: false,
      walletType: 'none',
      networkType: (process.env.NEXT_PUBLIC_ERGO_NETWORK as NetworkType) || 'mainnet',
      address: null,
      addresses: [],
      balance: 0,
      balanceNano: null,
      tokens: [],
      ownedAssets: [],
      error: null,

      // Connect to Nautilus wallet (Ergo)
      connectNautilus: async () => {
        if (typeof window === 'undefined') return false;
        
        // Check if Nautilus is available
        if (!window.ergoConnector?.nautilus) {
          set({ error: 'Nautilus wallet not installed. Please install it from nautilus.io' });
          return false;
        }

        set({ isConnecting: true, error: null });

        try {
          const connected = await window.ergoConnector.nautilus.connect();
          
          if (connected && window.ergo) {
            const address = await window.ergo.get_change_address();
            const ergBalance = await window.ergo.get_balance();
            const usedAddresses = await window.ergo.get_used_addresses();
            
            // Get all token balances
            let tokens: TokenBalance[] = [];
            try {
              const allBalances = await window.ergo.get_balance('all');
              if (Array.isArray(allBalances)) {
                tokens = allBalances;
              }
            } catch {
              // Token balance not supported
            }
            
            const balanceNum = parseInt(ergBalance) / 1e9;
            
            set({
              isConnected: true,
              isConnecting: false,
              walletType: 'nautilus',
              address,
              addresses: usedAddresses,
              balance: balanceNum,
              balanceNano: ergBalance,
              tokens,
              error: null,
            });
            
            return true;
          } else {
            set({ 
              isConnecting: false, 
              error: 'Connection rejected by user' 
            });
            return false;
          }
        } catch (err) {
          set({ 
            isConnecting: false, 
            error: err instanceof Error ? err.message : 'Connection failed' 
          });
          return false;
        }
      },

      // Connect to MetaMask (EVM - legacy support)
      connectMetaMask: async () => {
        if (typeof window === 'undefined') return false;
        
        const ethereum = (window as unknown as { ethereum?: { 
          request: (args: { method: string }) => Promise<string[]>;
          on: (event: string, callback: (accounts: string[]) => void) => void;
        } }).ethereum;
        
        if (!ethereum) {
          set({ error: 'MetaMask not installed' });
          return false;
        }

        set({ isConnecting: true, error: null });

        try {
          const accounts = await ethereum.request({ 
            method: 'eth_requestAccounts' 
          });
          
          if (accounts.length > 0) {
            set({
              isConnected: true,
              isConnecting: false,
              walletType: 'metamask',
              address: accounts[0],
              addresses: accounts,
              balance: 0, // Would need to fetch ETH balance
              error: null,
            });
            return true;
          }
          
          set({ isConnecting: false, error: 'No accounts found' });
          return false;
        } catch (err) {
          set({ 
            isConnecting: false, 
            error: err instanceof Error ? err.message : 'Connection failed' 
          });
          return false;
        }
      },

      // Disconnect from wallet
      disconnect: async () => {
        const { walletType } = get();
        
        if (walletType === 'nautilus' && window.ergoConnector?.nautilus) {
          await window.ergoConnector.nautilus.disconnect();
        }
        
        set({
          isConnected: false,
          isConnecting: false,
          walletType: 'none',
          address: null,
          addresses: [],
          balance: 0,
          balanceNano: null,
          tokens: [],
          error: null,
        });
      },

      // Refresh balance from wallet
      refreshBalance: async () => {
        const { walletType } = get();
        
        if (walletType === 'nautilus' && window.ergo) {
          try {
            const ergBalance = await window.ergo.get_balance();
            const balanceNum = parseInt(ergBalance) / 1e9;
            
            let tokens: TokenBalance[] = [];
            try {
              const allBalances = await window.ergo.get_balance('all');
              if (Array.isArray(allBalances)) {
                tokens = allBalances;
              }
            } catch {
              // Ignore
            }
            
            set({ balance: balanceNum, balanceNano: ergBalance, tokens });
          } catch (err) {
            console.error('Failed to refresh balance:', err);
          }
        }
      },

      // Sign and submit transaction (Ergo)
      signAndSubmitTx: async (unsignedTx: unknown) => {
        if (!window.ergo) throw new Error('Wallet not connected');
        
        const signedTx = await window.ergo.sign_tx(unsignedTx as Parameters<typeof window.ergo.sign_tx>[0]);
        const txId = await window.ergo.submit_tx(signedTx);
        
        // Refresh balance after transaction
        await get().refreshBalance();
        
        return txId;
      },

      // Get UTXOs for transaction building
      getUtxos: async (amount?: string) => {
        if (!window.ergo) throw new Error('Wallet not connected');
        return window.ergo.get_utxos(amount);
      },

      // Get current blockchain height
      getCurrentHeight: async () => {
        if (!window.ergo) throw new Error('Wallet not connected');
        return window.ergo.get_current_height();
      },

      // Legacy setters (for backward compatibility)
      setConnected: (address: string, walletType: WalletType = 'nautilus') => {
        set({ 
          isConnected: true, 
          address, 
          walletType,
          isConnecting: false,
          error: null 
        });
      },

      setDisconnected: () => {
        set({ 
          isConnected: false, 
          address: null,
          addresses: [],
          balance: 0,
          balanceNano: null,
          tokens: [],
          walletType: 'none',
          ownedAssets: [],
          error: null 
        });
      },

      setBalance: (balance: number) => {
        set({ balance });
      },

      addOwnedAsset: (asset: UserAsset) => {
        set({ ownedAssets: [...get().ownedAssets, asset] });
      },

      setConnecting: (isConnecting: boolean) => {
        set({ isConnecting });
      },

      setError: (error: string | null) => {
        set({ error, isConnecting: false });
      },
    }),
    {
      name: 'chaincash-wallet',
      partialize: (state) => ({
        // Only persist owned assets, not connection state
        ownedAssets: state.ownedAssets,
      }),
    }
  )
);
