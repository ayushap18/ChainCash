// Transaction service for building and executing Ergo transactions
// Based on Fleet SDK patterns: https://fleet-sdk.github.io/docs/transaction-building
// Reference: https://github.com/fleet-sdk/fleet

import type { ErgoBox, EIP12UnsignedTransaction } from "@/types/ergo";

// Constants from Ergo protocol (exported for use by other services)
export const NANOERG_PER_ERG = 1_000_000_000n;
export const RECOMMENDED_MIN_FEE = 1_100_000n; // 0.0011 ERG
export const SAFE_MIN_BOX_VALUE = 1_000_000n; // 0.001 ERG minimum per box

// Box candidate (output being created)
interface BoxCandidate {
  value: string;
  ergoTree: string;
  creationHeight: number;
  assets: Array<{ tokenId: string; amount: string }>;
  additionalRegisters: Record<string, string>;
}

// Unsigned input
interface UnsignedInput {
  boxId: string;
  extension: Record<string, string>;
}

// Token to add to output
interface TokenToAdd {
  tokenId: string;
  amount: string | bigint;
}

// Minting parameters (EIP-4)
interface MintParams {
  name: string;
  description?: string;
  decimals?: number;
  amount: string | bigint;
}

/**
 * Output Builder - constructs output boxes with fluent API
 * Based on Fleet SDK's OutputBuilder
 */
export class OutputBuilder {
  private _value: bigint;
  private _ergoTree: string;
  private _creationHeight: number;
  private _assets: Array<{ tokenId: string; amount: bigint }> = [];
  private _registers: Record<string, string> = {};
  private _minting?: MintParams;

  constructor(value: string | bigint, recipientAddress: string, creationHeight: number) {
    this._value = typeof value === "string" ? BigInt(value) : value;
    this._ergoTree = addressToErgoTree(recipientAddress);
    this._creationHeight = creationHeight;
  }

  /**
   * Add tokens to this output
   */
  addTokens(tokens: TokenToAdd | TokenToAdd[]): OutputBuilder {
    const tokensArray = Array.isArray(tokens) ? tokens : [tokens];
    
    for (const token of tokensArray) {
      const amount = typeof token.amount === "string" ? BigInt(token.amount) : token.amount;
      const existing = this._assets.find(a => a.tokenId === token.tokenId);
      
      if (existing) {
        existing.amount += amount;
      } else {
        this._assets.push({ tokenId: token.tokenId, amount });
      }
    }
    
    return this;
  }

  /**
   * Mint a new token (EIP-4)
   * Note: tokenId will be set to first input's boxId during build
   */
  mintToken(params: MintParams): OutputBuilder {
    this._minting = params;
    return this;
  }

  /**
   * Set additional registers (R4-R9)
   */
  setAdditionalRegisters(registers: Record<string, string>): OutputBuilder {
    this._registers = { ...this._registers, ...registers };
    return this;
  }

  /**
   * Set R4 register (commonly used for name)
   */
  setR4(value: string): OutputBuilder {
    this._registers.R4 = value;
    return this;
  }

  /**
   * Get the value
   */
  get value(): bigint {
    return this._value;
  }

  /**
   * Build the box candidate
   */
  build(firstInputId?: string): BoxCandidate {
    const assets = [...this._assets];
    
    // Handle minting
    if (this._minting && firstInputId) {
      const mintAmount = typeof this._minting.amount === "string" 
        ? BigInt(this._minting.amount) 
        : this._minting.amount;
      
      // Insert minted token at the beginning
      assets.unshift({
        tokenId: firstInputId,
        amount: mintAmount,
      });
      
      // Set EIP-4 registers if not already set
      if (!this._registers.R4) {
        this._registers.R4 = encodeString(this._minting.name);
      }
      if (!this._registers.R5 && this._minting.description) {
        this._registers.R5 = encodeString(this._minting.description);
      }
      if (!this._registers.R6) {
        this._registers.R6 = encodeString(String(this._minting.decimals || 0));
      }
    }

    return {
      value: this._value.toString(),
      ergoTree: this._ergoTree,
      creationHeight: this._creationHeight,
      assets: assets.map(a => ({
        tokenId: a.tokenId,
        amount: a.amount.toString(),
      })),
      additionalRegisters: this._registers,
    };
  }
}

/**
 * Transaction Builder - constructs unsigned transactions with fluent API
 * Based on Fleet SDK's TransactionBuilder
 */
export class TransactionBuilder {
  private _creationHeight: number;
  private _inputs: ErgoBox[] = [];
  private _dataInputs: ErgoBox[] = [];
  private _outputs: OutputBuilder[] = [];
  private _fee: bigint = RECOMMENDED_MIN_FEE;
  private _changeAddress?: string;

  constructor(creationHeight: number) {
    this._creationHeight = creationHeight;
  }

  /**
   * Add input boxes
   */
  from(inputs: ErgoBox | ErgoBox[]): TransactionBuilder {
    const inputsArray = Array.isArray(inputs) ? inputs : [inputs];
    this._inputs.push(...inputsArray);
    return this;
  }

  /**
   * Chainable AND operator
   */
  get and(): TransactionBuilder {
    return this;
  }

  /**
   * Add data inputs (for reading only, not spent)
   */
  withDataFrom(dataInputs: ErgoBox | ErgoBox[]): TransactionBuilder {
    const dataInputsArray = Array.isArray(dataInputs) ? dataInputs : [dataInputs];
    this._dataInputs.push(...dataInputsArray);
    return this;
  }

  /**
   * Add outputs
   */
  to(outputs: OutputBuilder | OutputBuilder[]): TransactionBuilder {
    const outputsArray = Array.isArray(outputs) ? outputs : [outputs];
    this._outputs.push(...outputsArray);
    return this;
  }

  /**
   * Set change address
   */
  sendChangeTo(address: string): TransactionBuilder {
    this._changeAddress = address;
    return this;
  }

  /**
   * Set transaction fee
   */
  payFee(amount: string | bigint): TransactionBuilder {
    this._fee = typeof amount === "string" ? BigInt(amount) : amount;
    return this;
  }

  /**
   * Set minimum recommended fee
   */
  payMinFee(): TransactionBuilder {
    this._fee = RECOMMENDED_MIN_FEE;
    return this;
  }

  /**
   * Build the unsigned transaction (EIP-12 format)
   */
  build(): EIP12UnsignedTransaction {
    if (this._inputs.length === 0) {
      throw new Error("Transaction must have at least one input");
    }

    if (this._outputs.length === 0) {
      throw new Error("Transaction must have at least one output");
    }

    const firstInputId = this._inputs[0].boxId;

    // Calculate totals
    const inputValue = this._inputs.reduce(
      (sum, box) => sum + BigInt(box.value),
      0n
    );
    
    const outputValue = this._outputs.reduce(
      (sum, output) => sum + output.value,
      0n
    );

    // Build outputs
    const outputs: BoxCandidate[] = this._outputs.map(o => o.build(firstInputId));

    // Add fee output
    outputs.push({
      value: this._fee.toString(),
      ergoTree: FEE_CONTRACT,
      creationHeight: this._creationHeight,
      assets: [],
      additionalRegisters: {},
    });

    // Calculate and add change if needed
    const totalOutput = outputValue + this._fee;
    const change = inputValue - totalOutput;

    if (change < 0n) {
      throw new Error(`Insufficient funds: need ${totalOutput} nanoERG but have ${inputValue}`);
    }

    if (change > 0n && this._changeAddress) {
      // Collect change tokens
      const inputTokens = new Map<string, bigint>();
      for (const box of this._inputs) {
        for (const asset of box.assets) {
          const current = inputTokens.get(asset.tokenId) || 0n;
          inputTokens.set(asset.tokenId, current + BigInt(asset.amount));
        }
      }

      const outputTokens = new Map<string, bigint>();
      for (const output of outputs) {
        for (const asset of output.assets) {
          const current = outputTokens.get(asset.tokenId) || 0n;
          outputTokens.set(asset.tokenId, current + BigInt(asset.amount));
        }
      }

      const changeTokens: Array<{ tokenId: string; amount: string }> = [];
      for (const [tokenId, amount] of inputTokens) {
        const spent = outputTokens.get(tokenId) || 0n;
        const remaining = amount - spent;
        if (remaining > 0n) {
          changeTokens.push({ tokenId, amount: remaining.toString() });
        }
      }

      outputs.push({
        value: change.toString(),
        ergoTree: addressToErgoTree(this._changeAddress),
        creationHeight: this._creationHeight,
        assets: changeTokens,
        additionalRegisters: {},
      });
    }

    // Build inputs
    const inputs: UnsignedInput[] = this._inputs.map(box => ({
      boxId: box.boxId,
      extension: {},
    }));

    // Build data inputs
    const dataInputs = this._dataInputs.map(box => ({
      boxId: box.boxId,
    }));

    return {
      inputs,
      dataInputs,
      outputs,
    };
  }

  /**
   * Build for EIP-12 dApp connector (includes input box data)
   */
  toEIP12Object(): EIP12UnsignedTransaction & { 
    inputs: Array<UnsignedInput & Partial<ErgoBox>> 
  } {
    const tx = this.build();
    
    // Enhance inputs with full box data for EIP-12
    const enhancedInputs = tx.inputs.map((input, index) => ({
      ...input,
      ...this._inputs[index],
    }));

    return {
      ...tx,
      inputs: enhancedInputs,
    };
  }
}

// ============================================================================
// Transaction Helpers
// ============================================================================

/**
 * Build a simple ERG transfer transaction
 */
export async function buildTransferTx(
  recipientAddress: string,
  amountNanoErg: string | bigint,
  utxos: ErgoBox[],
  changeAddress: string,
  currentHeight: number
): Promise<EIP12UnsignedTransaction> {
  const amount = typeof amountNanoErg === "string" ? BigInt(amountNanoErg) : amountNanoErg;
  
  return new TransactionBuilder(currentHeight)
    .from(utxos)
    .to(new OutputBuilder(amount, recipientAddress, currentHeight))
    .sendChangeTo(changeAddress)
    .payMinFee()
    .build();
}

/**
 * Build a token transfer transaction
 */
export async function buildTokenTransferTx(
  recipientAddress: string,
  tokenId: string,
  tokenAmount: string | bigint,
  utxos: ErgoBox[],
  changeAddress: string,
  currentHeight: number
): Promise<EIP12UnsignedTransaction> {
  const boxValue = SAFE_MIN_BOX_VALUE; // Minimum ERG for the box
  
  const output = new OutputBuilder(boxValue, recipientAddress, currentHeight)
    .addTokens({ tokenId, amount: tokenAmount });
  
  return new TransactionBuilder(currentHeight)
    .from(utxos)
    .to(output)
    .sendChangeTo(changeAddress)
    .payMinFee()
    .build();
}

/**
 * Build a token minting transaction (EIP-4)
 */
export async function buildMintTokenTx(
  name: string,
  description: string,
  decimals: number,
  amount: string | bigint,
  recipientAddress: string,
  utxos: ErgoBox[],
  changeAddress: string,
  currentHeight: number
): Promise<EIP12UnsignedTransaction> {
  const output = new OutputBuilder(SAFE_MIN_BOX_VALUE, recipientAddress, currentHeight)
    .mintToken({ name, description, decimals, amount });
  
  return new TransactionBuilder(currentHeight)
    .from(utxos)
    .to(output)
    .sendChangeTo(changeAddress)
    .payMinFee()
    .build();
}

/**
 * Build a crowdfunding pledge transaction
 * Creates a pledge box that can be refunded if campaign fails
 */
export async function buildPledgeTx(
  campaignAddress: string,
  pledgeAmountNanoErg: string | bigint,
  backerAddress: string,
  campaignId: string,
  utxos: ErgoBox[],
  currentHeight: number,
  deadline: number // Block height deadline
): Promise<EIP12UnsignedTransaction> {
  const amount = typeof pledgeAmountNanoErg === "string" 
    ? BigInt(pledgeAmountNanoErg) 
    : pledgeAmountNanoErg;
  
  // Create pledge output with campaign metadata in registers
  const output = new OutputBuilder(amount, campaignAddress, currentHeight)
    .setAdditionalRegisters({
      R4: encodeString(campaignId),           // Campaign ID
      R5: encodeString(backerAddress),        // Backer's refund address
      R6: encodeInt(deadline),                // Deadline block height
    });
  
  return new TransactionBuilder(currentHeight)
    .from(utxos)
    .to(output)
    .sendChangeTo(backerAddress)
    .payMinFee()
    .build();
}

/**
 * Build a game asset purchase transaction
 * Mints an NFT representing the game asset
 */
export async function buildAssetPurchaseTx(
  assetName: string,
  assetDescription: string,
  assetCategory: string,
  assetRarity: string,
  priceNanoErg: string | bigint,
  sellerAddress: string,
  buyerAddress: string,
  utxos: ErgoBox[],
  currentHeight: number
): Promise<EIP12UnsignedTransaction> {
  const price = typeof priceNanoErg === "string" ? BigInt(priceNanoErg) : priceNanoErg;
  
  // Payment to seller
  const paymentOutput = new OutputBuilder(price, sellerAddress, currentHeight);
  
  // Mint NFT for buyer with asset metadata
  const nftOutput = new OutputBuilder(SAFE_MIN_BOX_VALUE, buyerAddress, currentHeight)
    .mintToken({
      name: assetName,
      description: `${assetDescription} | Category: ${assetCategory} | Rarity: ${assetRarity}`,
      decimals: 0,
      amount: 1n,
    });
  
  return new TransactionBuilder(currentHeight)
    .from(utxos)
    .to([paymentOutput, nftOutput])
    .sendChangeTo(buyerAddress)
    .payMinFee()
    .build();
}

// ============================================================================
// Encoding Utilities
// ============================================================================

/**
 * Encode a string for register storage (SigmaType: Coll[Byte])
 */
function encodeString(str: string): string {
  const bytes = new TextEncoder().encode(str);
  const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");
  // Prefix: 0e = Coll[Byte], followed by VLQ length
  const lengthVLQ = encodeVLQ(bytes.length);
  return `0e${lengthVLQ}${hex}`;
}

/**
 * Encode an integer for register storage (SigmaType: Long)
 */
function encodeInt(n: number): string {
  // Prefix: 05 = Long, followed by signed VLQ
  const zigzag = n >= 0 ? n * 2 : (-n * 2) - 1;
  return `05${encodeVLQ(zigzag)}`;
}

/**
 * VLQ (Variable Length Quantity) encoding
 */
function encodeVLQ(n: number): string {
  const bytes: number[] = [];
  while (n >= 0x80) {
    bytes.push((n & 0x7f) | 0x80);
    n >>>= 7;
  }
  bytes.push(n);
  return bytes.map(b => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Convert address to ErgoTree
 * P2PK addresses start with 00 08 cd
 */
function addressToErgoTree(address: string): string {
  // For now, return a simple P2PK tree structure
  // In production, use Fleet SDK's ErgoAddress.fromBase58()
  // This is a simplified placeholder - real implementation needs proper address parsing
  
  // If already a tree (starts with expected prefix), return as-is
  if (address.startsWith("0008cd") || address.startsWith("00")) {
    return address;
  }
  
  // For demo purposes, use a placeholder tree
  // In production: import { ErgoAddress } from "@fleet-sdk/core";
  // return ErgoAddress.fromBase58(address).ergoTree;
  
  // Simple base58 check encode to hex (simplified)
  return `0008cd${base58ToHex(address.slice(1))}`;
}

/**
 * Simplified base58 to hex conversion
 */
function base58ToHex(str: string): string {
  const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  let num = 0n;
  for (const char of str) {
    num = num * 58n + BigInt(ALPHABET.indexOf(char));
  }
  return num.toString(16).padStart(66, "0");
}

// Fee contract ErgoTree (miner's fee address)
const FEE_CONTRACT = "1005040004000e36100204a00b08cd0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798ea02d192a39a8cc7a701730073011001020402d19683030193a38cc7b2a57300000193c2b2a57301007473027303830108cdeeac93b1a57304";

// ============================================================================
// Wallet Integration Helpers
// ============================================================================

/**
 * Execute a transaction through Nautilus wallet
 */
export async function executeWithNautilus<T extends EIP12UnsignedTransaction>(
  tx: T
): Promise<string> {
  if (typeof window === "undefined" || !window.ergo) {
    throw new Error("Nautilus wallet not connected");
  }

  const signedTx = await window.ergo.sign_tx(tx);
  const txId = await window.ergo.submit_tx(signedTx);
  
  return txId;
}

/**
 * Get UTXOs from connected wallet
 */
export async function getWalletUtxos(
  amount?: string,
  tokenId?: string
): Promise<ErgoBox[]> {
  if (typeof window === "undefined" || !window.ergo) {
    throw new Error("Nautilus wallet not connected");
  }

  const utxos = await window.ergo.get_utxos(amount, tokenId);
  return utxos || [];
}

/**
 * Get current blockchain height from wallet
 */
export async function getBlockHeight(): Promise<number> {
  if (typeof window === "undefined" || !window.ergo) {
    throw new Error("Nautilus wallet not connected");
  }

  return window.ergo.get_current_height();
}

/**
 * Get change address from wallet
 */
export async function getChangeAddress(): Promise<string> {
  if (typeof window === "undefined" || !window.ergo) {
    throw new Error("Nautilus wallet not connected");
  }

  return window.ergo.get_change_address();
}

// ============================================================================
// Export Constants
// ============================================================================

export const ERGO_CONSTANTS = {
  NANOERG_PER_ERG,
  RECOMMENDED_MIN_FEE,
  SAFE_MIN_BOX_VALUE,
  FEE_CONTRACT,
};
