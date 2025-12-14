// Nautilus wallet hook for React components
// Provides easy access to Ergo wallet functionality

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import type { ErgoBox, EIP12UnsignedTransaction, TokenBalance } from "@/types/ergo";

export interface WalletState {
  // Connection state
  isAvailable: boolean;
  isConnected: boolean;
  isConnecting: boolean;
  
  // Wallet info
  address: string | null;
  addresses: string[];
  ergBalance: string | null;
  ergBalanceFormatted: string | null;
  tokens: TokenBalance[];
  
  // Errors
  error: string | null;
}

export interface WalletActions {
  // Connection
  connect: () => Promise<boolean>;
  disconnect: () => Promise<void>;
  
  // Balance
  refreshBalance: () => Promise<void>;
  getBalance: (tokenId?: string) => Promise<string>;
  
  // UTXOs
  getUtxos: (amount?: string, tokenId?: string) => Promise<ErgoBox[] | undefined>;
  
  // Addresses
  getChangeAddress: () => Promise<string>;
  getUsedAddresses: () => Promise<string[]>;
  
  // Transactions
  signTransaction: (tx: EIP12UnsignedTransaction) => Promise<unknown>;
  submitTransaction: (signedTx: unknown) => Promise<string>;
  signAndSubmit: (tx: EIP12UnsignedTransaction) => Promise<string>;
  
  // Blockchain
  getCurrentHeight: () => Promise<number>;
}

export type UseNautilusWallet = WalletState & WalletActions;

export function useNautilusWallet(): UseNautilusWallet {
  const [state, setState] = useState<WalletState>({
    isAvailable: false,
    isConnected: false,
    isConnecting: false,
    address: null,
    addresses: [],
    ergBalance: null,
    ergBalanceFormatted: null,
    tokens: [],
    error: null,
  });

  // Check if Nautilus is available
  const checkAvailability = useCallback(() => {
    if (typeof window === "undefined") return false;
    return Boolean(window.ergoConnector?.nautilus);
  }, []);

  // Update availability on mount
  useEffect(() => {
    const isAvailable = checkAvailability();
    setState((s) => ({ ...s, isAvailable }));

    // Listen for wallet injection
    const handleInjected = () => {
      setState((s) => ({ ...s, isAvailable: true }));
    };

    window.addEventListener("ergo-wallet:injected", handleInjected);
    return () => window.removeEventListener("ergo-wallet:injected", handleInjected);
  }, [checkAvailability]);

  // Check for existing connection on mount
  useEffect(() => {
    const checkExistingConnection = async () => {
      if (!checkAvailability()) return;
      
      try {
        const isAuthorized = await window.ergoConnector!.nautilus.isAuthorized();
        if (isAuthorized) {
          // Reconnect silently
          const connected = await window.ergoConnector!.nautilus.connect();
          if (connected && window.ergo) {
            await updateWalletInfo();
          }
        }
      } catch (err) {
        console.error("Failed to check existing connection:", err);
      }
    };

    checkExistingConnection();
  }, [checkAvailability]);

  // Update wallet info after connection
  const updateWalletInfo = useCallback(async () => {
    if (!window.ergo) return;

    try {
      const [address, ergBalance, allBalances] = await Promise.all([
        window.ergo.get_change_address(),
        window.ergo.get_balance(),
        window.ergo.get_balance("all") as Promise<TokenBalance[]>,
      ]);

      const usedAddresses = await window.ergo.get_used_addresses();
      const ergBalanceNum = parseInt(ergBalance) / 1e9;

      setState((s) => ({
        ...s,
        isConnected: true,
        isConnecting: false,
        address,
        addresses: usedAddresses,
        ergBalance,
        ergBalanceFormatted: ergBalanceNum.toFixed(4),
        tokens: allBalances.filter((t) => t.tokenId !== "ERG"),
        error: null,
      }));
    } catch (err) {
      console.error("Failed to update wallet info:", err);
      setState((s) => ({
        ...s,
        error: err instanceof Error ? err.message : "Failed to get wallet info",
      }));
    }
  }, []);

  // Connect to wallet
  const connect = useCallback(async (): Promise<boolean> => {
    if (!checkAvailability()) {
      setState((s) => ({ ...s, error: "Nautilus wallet not installed" }));
      return false;
    }

    setState((s) => ({ ...s, isConnecting: true, error: null }));

    try {
      const connected = await window.ergoConnector!.nautilus.connect();

      if (connected && window.ergo) {
        await updateWalletInfo();
        return true;
      } else {
        setState((s) => ({
          ...s,
          isConnecting: false,
          error: "Connection rejected by user",
        }));
        return false;
      }
    } catch (err) {
      setState((s) => ({
        ...s,
        isConnecting: false,
        error: err instanceof Error ? err.message : "Connection failed",
      }));
      return false;
    }
  }, [checkAvailability, updateWalletInfo]);

  // Disconnect from wallet
  const disconnect = useCallback(async (): Promise<void> => {
    if (window.ergoConnector?.nautilus) {
      await window.ergoConnector.nautilus.disconnect();
    }

    setState((s) => ({
      ...s,
      isConnected: false,
      address: null,
      addresses: [],
      ergBalance: null,
      ergBalanceFormatted: null,
      tokens: [],
      error: null,
    }));
  }, []);

  // Refresh balance
  const refreshBalance = useCallback(async (): Promise<void> => {
    if (!window.ergo) return;
    await updateWalletInfo();
  }, [updateWalletInfo]);

  // Get balance
  const getBalance = useCallback(async (tokenId?: string): Promise<string> => {
    if (!window.ergo) throw new Error("Wallet not connected");
    return window.ergo.get_balance(tokenId);
  }, []);

  // Get UTXOs
  const getUtxos = useCallback(
    async (amount?: string, tokenId?: string): Promise<ErgoBox[] | undefined> => {
      if (!window.ergo) throw new Error("Wallet not connected");
      return window.ergo.get_utxos(amount, tokenId) as Promise<ErgoBox[] | undefined>;
    },
    []
  );

  // Get change address
  const getChangeAddress = useCallback(async (): Promise<string> => {
    if (!window.ergo) throw new Error("Wallet not connected");
    return window.ergo.get_change_address();
  }, []);

  // Get used addresses
  const getUsedAddresses = useCallback(async (): Promise<string[]> => {
    if (!window.ergo) throw new Error("Wallet not connected");
    return window.ergo.get_used_addresses();
  }, []);

  // Sign transaction
  const signTransaction = useCallback(
    async (tx: EIP12UnsignedTransaction): Promise<unknown> => {
      if (!window.ergo) throw new Error("Wallet not connected");
      return window.ergo.sign_tx(tx);
    },
    []
  );

  // Submit transaction
  const submitTransaction = useCallback(async (signedTx: unknown): Promise<string> => {
    if (!window.ergo) throw new Error("Wallet not connected");
    return window.ergo.submit_tx(signedTx as Parameters<typeof window.ergo.submit_tx>[0]);
  }, []);

  // Sign and submit transaction
  const signAndSubmit = useCallback(
    async (tx: EIP12UnsignedTransaction): Promise<string> => {
      const signedTx = await signTransaction(tx);
      const txId = await submitTransaction(signedTx);
      await refreshBalance();
      return txId;
    },
    [signTransaction, submitTransaction, refreshBalance]
  );

  // Get current blockchain height
  const getCurrentHeight = useCallback(async (): Promise<number> => {
    if (!window.ergo) throw new Error("Wallet not connected");
    return window.ergo.get_current_height();
  }, []);

  // Memoize the return value
  return useMemo(
    () => ({
      ...state,
      connect,
      disconnect,
      refreshBalance,
      getBalance,
      getUtxos,
      getChangeAddress,
      getUsedAddresses,
      signTransaction,
      submitTransaction,
      signAndSubmit,
      getCurrentHeight,
    }),
    [
      state,
      connect,
      disconnect,
      refreshBalance,
      getBalance,
      getUtxos,
      getChangeAddress,
      getUsedAddresses,
      signTransaction,
      submitTransaction,
      signAndSubmit,
      getCurrentHeight,
    ]
  );
}

export default useNautilusWallet;
