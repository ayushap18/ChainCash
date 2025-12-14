// React hooks for crowdfunding operations
// Provides easy-to-use functions for pledging, purchasing, and minting

"use client";

import { useState, useCallback } from "react";
import {
  TransactionBuilder,
  OutputBuilder,
  buildPledgeTx,
  buildAssetPurchaseTx,
  buildMintTokenTx,
  buildTransferTx,
  executeWithNautilus,
  getWalletUtxos,
  getBlockHeight,
  getChangeAddress,
  ERGO_CONSTANTS,
} from "@/lib/ergo/transactionService";
import type { ErgoBox, EIP12UnsignedTransaction } from "@/types/ergo";

// Transaction result
interface TxResult {
  success: boolean;
  txId?: string;
  error?: string;
}

// Hook state
interface CrowdfundingState {
  isLoading: boolean;
  lastTxId: string | null;
  error: string | null;
}

// Pledge parameters
interface PledgeParams {
  campaignId: string;
  campaignAddress: string;
  amountErg: number;
  deadline: number; // Block height
}

// Asset purchase parameters
interface PurchaseParams {
  assetName: string;
  assetDescription: string;
  assetCategory: string;
  assetRarity: string;
  priceErg: number;
  sellerAddress: string;
}

// Mint parameters
interface MintAssetParams {
  name: string;
  description: string;
  category: string;
  rarity: string;
  amount?: number;
}

/**
 * Hook for crowdfunding operations
 */
export function useCrowdfunding() {
  const [state, setState] = useState<CrowdfundingState>({
    isLoading: false,
    lastTxId: null,
    error: null,
  });

  const setLoading = useCallback((isLoading: boolean) => {
    setState((s) => ({ ...s, isLoading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState((s) => ({ ...s, error, isLoading: false }));
  }, []);

  const setSuccess = useCallback((txId: string) => {
    setState((s) => ({ ...s, lastTxId: txId, error: null, isLoading: false }));
  }, []);

  /**
   * Pledge to a campaign
   */
  const pledge = useCallback(async (params: PledgeParams): Promise<TxResult> => {
    setLoading(true);
    
    try {
      const changeAddress = await getChangeAddress();
      const height = await getBlockHeight();
      const amountNano = BigInt(Math.floor(params.amountErg * 1e9));
      
      // Get enough UTXOs for the pledge + fee
      const requiredAmount = amountNano + ERGO_CONSTANTS.RECOMMENDED_MIN_FEE;
      const utxos = await getWalletUtxos(requiredAmount.toString());
      
      if (!utxos.length) {
        throw new Error("Insufficient funds");
      }
      
      const tx = await buildPledgeTx(
        params.campaignAddress,
        amountNano,
        changeAddress,
        params.campaignId,
        utxos,
        height,
        params.deadline
      );
      
      const txId = await executeWithNautilus(tx);
      setSuccess(txId);
      
      return { success: true, txId };
    } catch (err) {
      const error = err instanceof Error ? err.message : "Pledge failed";
      setError(error);
      return { success: false, error };
    }
  }, [setLoading, setError, setSuccess]);

  /**
   * Purchase a game asset (mints NFT to buyer)
   */
  const purchaseAsset = useCallback(async (params: PurchaseParams): Promise<TxResult> => {
    setLoading(true);
    
    try {
      const buyerAddress = await getChangeAddress();
      const height = await getBlockHeight();
      const priceNano = BigInt(Math.floor(params.priceErg * 1e9));
      
      // Need price + box value for NFT + fee
      const requiredAmount = priceNano + ERGO_CONSTANTS.SAFE_MIN_BOX_VALUE + ERGO_CONSTANTS.RECOMMENDED_MIN_FEE;
      const utxos = await getWalletUtxos(requiredAmount.toString());
      
      if (!utxos.length) {
        throw new Error("Insufficient funds");
      }
      
      const tx = await buildAssetPurchaseTx(
        params.assetName,
        params.assetDescription,
        params.assetCategory,
        params.assetRarity,
        priceNano,
        params.sellerAddress,
        buyerAddress,
        utxos,
        height
      );
      
      const txId = await executeWithNautilus(tx);
      setSuccess(txId);
      
      return { success: true, txId };
    } catch (err) {
      const error = err instanceof Error ? err.message : "Purchase failed";
      setError(error);
      return { success: false, error };
    }
  }, [setLoading, setError, setSuccess]);

  /**
   * Mint a new game asset NFT (for campaign creators)
   */
  const mintAsset = useCallback(async (params: MintAssetParams): Promise<TxResult> => {
    setLoading(true);
    
    try {
      const address = await getChangeAddress();
      const height = await getBlockHeight();
      
      const utxos = await getWalletUtxos();
      if (!utxos.length) {
        throw new Error("No UTXOs available");
      }
      
      const description = `${params.description} | Category: ${params.category} | Rarity: ${params.rarity}`;
      
      const tx = await buildMintTokenTx(
        params.name,
        description,
        0, // NFTs have 0 decimals
        BigInt(params.amount || 1),
        address,
        utxos,
        address,
        height
      );
      
      const txId = await executeWithNautilus(tx);
      setSuccess(txId);
      
      return { success: true, txId };
    } catch (err) {
      const error = err instanceof Error ? err.message : "Minting failed";
      setError(error);
      return { success: false, error };
    }
  }, [setLoading, setError, setSuccess]);

  /**
   * Transfer ERG to another address
   */
  const transferErg = useCallback(async (
    recipient: string, 
    amountErg: number
  ): Promise<TxResult> => {
    setLoading(true);
    
    try {
      const changeAddress = await getChangeAddress();
      const height = await getBlockHeight();
      const amountNano = BigInt(Math.floor(amountErg * 1e9));
      
      const requiredAmount = amountNano + ERGO_CONSTANTS.RECOMMENDED_MIN_FEE;
      const utxos = await getWalletUtxos(requiredAmount.toString());
      
      if (!utxos.length) {
        throw new Error("Insufficient funds");
      }
      
      const tx = await buildTransferTx(
        recipient,
        amountNano,
        utxos,
        changeAddress,
        height
      );
      
      const txId = await executeWithNautilus(tx);
      setSuccess(txId);
      
      return { success: true, txId };
    } catch (err) {
      const error = err instanceof Error ? err.message : "Transfer failed";
      setError(error);
      return { success: false, error };
    }
  }, [setLoading, setError, setSuccess]);

  /**
   * Build and execute a custom transaction
   */
  const executeCustomTx = useCallback(async (
    buildTx: (utxos: ErgoBox[], height: number, changeAddress: string) => EIP12UnsignedTransaction
  ): Promise<TxResult> => {
    setLoading(true);
    
    try {
      const changeAddress = await getChangeAddress();
      const height = await getBlockHeight();
      const utxos = await getWalletUtxos();
      
      if (!utxos.length) {
        throw new Error("No UTXOs available");
      }
      
      const tx = buildTx(utxos, height, changeAddress);
      const txId = await executeWithNautilus(tx);
      setSuccess(txId);
      
      return { success: true, txId };
    } catch (err) {
      const error = err instanceof Error ? err.message : "Transaction failed";
      setError(error);
      return { success: false, error };
    }
  }, [setLoading, setError, setSuccess]);

  return {
    // State
    ...state,
    
    // Actions
    pledge,
    purchaseAsset,
    mintAsset,
    transferErg,
    executeCustomTx,
    
    // Utilities
    clearError: () => setError(null),
  };
}

/**
 * Hook for transaction building without execution
 * Useful for previewing transactions before signing
 */
export function useTransactionBuilder() {
  const [unsignedTx, setUnsignedTx] = useState<EIP12UnsignedTransaction | null>(null);
  const [error, setError] = useState<string | null>(null);

  const buildTransfer = useCallback(async (
    recipient: string,
    amountErg: number
  ): Promise<EIP12UnsignedTransaction | null> => {
    try {
      const changeAddress = await getChangeAddress();
      const height = await getBlockHeight();
      const amountNano = BigInt(Math.floor(amountErg * 1e9));
      
      const requiredAmount = amountNano + ERGO_CONSTANTS.RECOMMENDED_MIN_FEE;
      const utxos = await getWalletUtxos(requiredAmount.toString());
      
      if (!utxos.length) {
        throw new Error("Insufficient funds");
      }
      
      const tx = await buildTransferTx(
        recipient,
        amountNano,
        utxos,
        changeAddress,
        height
      );
      
      setUnsignedTx(tx);
      setError(null);
      return tx;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to build transaction");
      return null;
    }
  }, []);

  const execute = useCallback(async (): Promise<string | null> => {
    if (!unsignedTx) {
      setError("No transaction to execute");
      return null;
    }
    
    try {
      const txId = await executeWithNautilus(unsignedTx);
      setUnsignedTx(null);
      return txId;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to execute transaction");
      return null;
    }
  }, [unsignedTx]);

  return {
    unsignedTx,
    error,
    buildTransfer,
    execute,
    clear: () => {
      setUnsignedTx(null);
      setError(null);
    },
  };
}

// Re-export for convenience
export { TransactionBuilder, OutputBuilder, ERGO_CONSTANTS };
