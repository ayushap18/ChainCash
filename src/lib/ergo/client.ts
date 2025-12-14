// Ergo blockchain client for interacting with Explorer API and building transactions

const MAINNET_EXPLORER = "https://api.ergoplatform.com/api/v1";
const TESTNET_EXPLORER = "https://api-testnet.ergoplatform.com/api/v1";

export type NetworkType = "mainnet" | "testnet";

interface BlockInfo {
  id: string;
  height: number;
  timestamp: number;
}

interface TokenInfo {
  id: string;
  boxId: string;
  emissionAmount: number;
  name: string;
  description: string;
  type: string;
  decimals: number;
}

interface TransactionInfo {
  id: string;
  inputs: Array<{ boxId: string }>;
  outputs: Array<{ boxId: string; value: number }>;
  confirmationsCount: number;
}

interface BoxInfo {
  boxId: string;
  transactionId: string;
  value: number;
  creationHeight: number;
  ergoTree: string;
  assets: Array<{ tokenId: string; amount: number }>;
  additionalRegisters: Record<string, string>;
}

export class ErgoClient {
  private explorerUrl: string;
  private network: NetworkType;

  constructor(network: NetworkType = "mainnet") {
    this.network = network;
    this.explorerUrl = network === "mainnet" ? MAINNET_EXPLORER : TESTNET_EXPLORER;
  }

  /**
   * Get the current network
   */
  getNetwork(): NetworkType {
    return this.network;
  }

  /**
   * Get the explorer URL
   */
  getExplorerUrl(): string {
    return this.explorerUrl;
  }

  /**
   * Get current blockchain height
   */
  async getCurrentHeight(): Promise<number> {
    try {
      const response = await fetch(`${this.explorerUrl}/blocks?limit=1`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return data.items?.[0]?.height || 0;
    } catch (error) {
      console.error("Failed to get current height:", error);
      throw error;
    }
  }

  /**
   * Get block by height
   */
  async getBlockByHeight(height: number): Promise<BlockInfo | null> {
    try {
      const response = await fetch(`${this.explorerUrl}/blocks/at/${height}`);
      if (!response.ok) return null;
      const data = await response.json();
      return data[0] || null;
    } catch (error) {
      console.error("Failed to get block:", error);
      return null;
    }
  }

  /**
   * Get unspent boxes (UTXOs) for an address
   */
  async getUnspentBoxes(address: string, limit = 100, offset = 0): Promise<BoxInfo[]> {
    try {
      const response = await fetch(
        `${this.explorerUrl}/boxes/unspent/byAddress/${address}?limit=${limit}&offset=${offset}`
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error("Failed to get unspent boxes:", error);
      return [];
    }
  }

  /**
   * Get box by ID
   */
  async getBox(boxId: string): Promise<BoxInfo | null> {
    try {
      const response = await fetch(`${this.explorerUrl}/boxes/${boxId}`);
      if (!response.ok) return null;
      return response.json();
    } catch (error) {
      console.error("Failed to get box:", error);
      return null;
    }
  }

  /**
   * Get transaction by ID
   */
  async getTransaction(txId: string): Promise<TransactionInfo | null> {
    try {
      const response = await fetch(`${this.explorerUrl}/transactions/${txId}`);
      if (!response.ok) return null;
      return response.json();
    } catch (error) {
      console.error("Failed to get transaction:", error);
      return null;
    }
  }

  /**
   * Get token info
   */
  async getToken(tokenId: string): Promise<TokenInfo | null> {
    try {
      const response = await fetch(`${this.explorerUrl}/tokens/${tokenId}`);
      if (!response.ok) return null;
      return response.json();
    } catch (error) {
      console.error("Failed to get token:", error);
      return null;
    }
  }

  /**
   * Get address balance
   */
  async getAddressBalance(address: string): Promise<{ nanoErgs: number; tokens: Array<{ tokenId: string; amount: number }> }> {
    try {
      const response = await fetch(`${this.explorerUrl}/addresses/${address}/balance/total`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return {
        nanoErgs: data.nanoErgs || 0,
        tokens: data.tokens || [],
      };
    } catch (error) {
      console.error("Failed to get balance:", error);
      return { nanoErgs: 0, tokens: [] };
    }
  }

  /**
   * Get transactions for an address
   */
  async getAddressTransactions(address: string, limit = 50, offset = 0): Promise<TransactionInfo[]> {
    try {
      const response = await fetch(
        `${this.explorerUrl}/addresses/${address}/transactions?limit=${limit}&offset=${offset}`
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error("Failed to get transactions:", error);
      return [];
    }
  }

  /**
   * Submit a signed transaction to the network
   * Note: This requires access to an Ergo node, not just Explorer API
   */
  async submitTransaction(signedTxJson: string): Promise<string> {
    // For mainnet, transactions should be submitted via wallet
    // This is a placeholder for node API integration
    throw new Error("Use wallet to submit transactions");
  }

  /**
   * Validate an Ergo address
   */
  isValidAddress(address: string): boolean {
    // Basic validation - Ergo addresses start with specific prefixes
    if (this.network === "mainnet") {
      return address.startsWith("9") && address.length >= 51;
    } else {
      return address.startsWith("3") && address.length >= 51;
    }
  }

  /**
   * Format nanoERG to ERG
   */
  static nanoErgToErg(nanoErg: number | bigint | string): string {
    const value = typeof nanoErg === "string" ? BigInt(nanoErg) : BigInt(nanoErg);
    const erg = Number(value) / 1e9;
    return erg.toFixed(9).replace(/\.?0+$/, "");
  }

  /**
   * Format ERG to nanoERG
   */
  static ergToNanoErg(erg: number | string): bigint {
    const value = typeof erg === "string" ? parseFloat(erg) : erg;
    return BigInt(Math.floor(value * 1e9));
  }
}

// Default client instance (can be configured based on environment)
const network: NetworkType = (process.env.NEXT_PUBLIC_ERGO_NETWORK as NetworkType) || "mainnet";
export const ergoClient = new ErgoClient(network);

export default ergoClient;
