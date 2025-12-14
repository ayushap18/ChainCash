// Ergo blockchain type declarations
// Based on Nautilus wallet dApp connector (EIP-12)

import type { SignedTransaction } from "@fleet-sdk/common";

// Box type (UTXO)
export interface ErgoBox {
  boxId: string;
  transactionId: string;
  index: number;
  ergoTree: string;
  creationHeight: number;
  value: string;
  assets: Array<{ tokenId: string; amount: string }>;
  additionalRegisters: Partial<Record<"R4" | "R5" | "R6" | "R7" | "R8" | "R9", string>>;
  confirmed?: boolean;
}

// Unsigned transaction (EIP-12 format)
export interface EIP12UnsignedTransaction {
  inputs: Array<{
    boxId: string;
    extension: Record<string, string>;
  }>;
  dataInputs: Array<{ boxId: string }>;
  outputs: Array<{
    value: string;
    ergoTree: string;
    creationHeight: number;
    assets: Array<{ tokenId: string; amount: string }>;
    additionalRegisters: Record<string, string>;
  }>;
}

// Token balance
export interface TokenBalance {
  tokenId: string;
  balance: string;
  name?: string;
  decimals?: number;
}

// Selection target for UTXOs
export interface SelectionTarget {
  nanoErgs?: string;
  tokens?: Array<{ tokenId: string; amount?: string }>;
}

// Ergo Context API (injected after connection)
export interface ErgoAPI {
  // Get balance in nanoERG or specific token
  get_balance(tokenId?: string): Promise<string>;
  
  // Get all balances
  get_balance(tokenId: "all"): Promise<TokenBalance[]>;
  
  // Get unspent boxes (UTXOs)
  get_utxos(amount?: string, tokenId?: string): Promise<ErgoBox[] | undefined>;
  get_utxos(target?: SelectionTarget): Promise<ErgoBox[] | undefined>;
  
  // Get wallet addresses
  get_used_addresses(): Promise<string[]>;
  get_unused_addresses(): Promise<string[]>;
  get_change_address(): Promise<string>;
  
  // Get current blockchain height
  get_current_height(): Promise<number>;
  
  // Sign transaction
  sign_tx(tx: EIP12UnsignedTransaction): Promise<SignedTransaction>;
  
  // Sign specific inputs only
  sign_tx_inputs(tx: EIP12UnsignedTransaction, indexes: number[]): Promise<SignedTransaction>;
  
  // Sign arbitrary data
  sign_data(address: string, message: string): Promise<string>;
  
  // Submit signed transaction
  submit_tx(tx: SignedTransaction): Promise<string>;
}

// Nautilus Connector API
export interface NautilusConnector {
  // Request connection to wallet
  connect(options?: { createErgoObject?: boolean }): Promise<boolean>;
  
  // Disconnect from wallet
  disconnect(): Promise<boolean>;
  
  // Check if currently connected
  isConnected(): Promise<boolean>;
  
  // Check if previously authorized
  isAuthorized(): Promise<boolean>;
  
  // Get context API without global injection
  getContext(): Promise<ErgoAPI>;
}

// ErgoConnector object (injected by wallet extensions)
export interface ErgoConnector {
  nautilus: NautilusConnector;
  // Other wallets can be added here
}

// Extend Window interface
declare global {
  interface Window {
    ergo?: ErgoAPI;
    ergoConnector?: ErgoConnector;
    // Legacy API (deprecated)
    ergo_request_read_access?: () => Promise<boolean>;
    ergo_check_read_access?: () => Promise<boolean>;
  }
}

export {};
