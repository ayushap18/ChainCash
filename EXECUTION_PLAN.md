# ChainCash Crowdfunding - Executable Implementation Plan

## 🎯 Goal
Transform the current mock frontend into a fully functional Web3 crowdfunding platform using Ergo blockchain and ChainCash tokenized IOUs.

---

## 📚 Key Resources Found

### Ergo Blockchain
- **Ergo Node Wallet API**: `/wallet/transaction/generate`, `/wallet/payment/send`, `/wallet/balances`
- **Transaction Builder**: `TransactionBuilder.buildUnsignedTx()` for creating transactions
- **Signing**: `ErgoProvingInterpreter.sign()` for transaction signing

### Nautilus Wallet (dApp Connector)
- **Connection API**: `ergoConnector.nautilus.connect()` - request wallet access
- **Context API** (after connection):
  - `ergo.get_balance(tokenId?)` - get ERG or token balance
  - `ergo.get_utxos(target?)` - get unspent boxes
  - `ergo.get_used_addresses()` - get wallet addresses
  - `ergo.get_change_address()` - get change address
  - `ergo.sign_tx(unsignedTx)` - sign transaction
  - `ergo.get_current_height()` - get blockchain height
- **Types**: `@nautilus-js/eip12-types` for TypeScript types

### Fleet SDK (Transaction Building)
- `@fleet-sdk/core` - Transaction building utilities
- `@fleet-sdk/common` - Common types and utilities
- `@fleet-sdk/serializer` - Box serialization

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (Next.js)                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ Campaigns │  │Marketplace│  │ My Assets│  │  Wallet  │    │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘    │
│       └─────────────┴─────────────┴─────────────┘           │
│                           │                                  │
│              ┌────────────┴────────────┐                    │
│              │    Ergo Service Layer   │                    │
│              │  (Fleet SDK + Nautilus) │                    │
│              └────────────┬────────────┘                    │
└───────────────────────────┼─────────────────────────────────┘
                            │
┌───────────────────────────┼─────────────────────────────────┐
│                     BACKEND (Next.js API)                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │Campaigns │  │  Assets  │  │  Orders  │  │  Users   │    │
│  │   API    │  │   API    │  │   API    │  │   API    │    │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘    │
│       └─────────────┴─────────────┴─────────────┘           │
│                           │                                  │
│              ┌────────────┴────────────┐                    │
│              │      Database Layer     │                    │
│              │   (Prisma + PostgreSQL) │                    │
│              └────────────┬────────────┘                    │
└───────────────────────────┼─────────────────────────────────┘
                            │
┌───────────────────────────┼─────────────────────────────────┐
│                   ERGO BLOCKCHAIN                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                   │
│  │ Explorer │  │   Node   │  │  Tokens  │                   │
│  │   API    │  │   API    │  │ (NFTs)   │                   │
│  └──────────┘  └──────────┘  └──────────┘                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 Phase 1: Foundation (Week 1-2)

### 1.1 Install Dependencies
```bash
# Ergo/Fleet SDK packages
npm install @fleet-sdk/core @fleet-sdk/common @fleet-sdk/serializer
npm install @nautilus-js/eip12-types

# Database
npm install prisma @prisma/client

# Authentication
npm install next-auth

# Additional utilities
npm install axios zod
```

### 1.2 Database Schema (Prisma)
```prisma
// prisma/schema.prisma

model User {
  id            String    @id @default(cuid())
  walletAddress String    @unique
  createdAt     DateTime  @default(now())
  campaigns     Campaign[]
  purchases     Purchase[]
  assets        UserAsset[]
}

model Campaign {
  id              String    @id @default(cuid())
  title           String
  description     String
  developer       User      @relation(fields: [developerId], references: [id])
  developerId     String
  goalAmount      BigInt
  raisedAmount    BigInt    @default(0)
  reserveRatio    Float     @default(0.6)
  status          CampaignStatus @default(ACTIVE)
  endDate         DateTime
  createdAt       DateTime  @default(now())
  assets          GameAsset[]
  milestones      Milestone[]
}

model GameAsset {
  id              String    @id @default(cuid())
  campaign        Campaign  @relation(fields: [campaignId], references: [id])
  campaignId      String
  name            String
  description     String
  price           BigInt
  category        AssetCategory
  rarity          AssetRarity
  totalSupply     Int
  soldCount       Int       @default(0)
  tokenId         String?   // Ergo token ID when minted
  imageUrl        String
  createdAt       DateTime  @default(now())
  purchases       Purchase[]
  userAssets      UserAsset[]
}

model Purchase {
  id              String    @id @default(cuid())
  user            User      @relation(fields: [userId], references: [id])
  userId          String
  asset           GameAsset @relation(fields: [assetId], references: [id])
  assetId         String
  txId            String    // Ergo transaction ID
  price           BigInt
  status          PurchaseStatus @default(PENDING)
  createdAt       DateTime  @default(now())
}

model UserAsset {
  id              String    @id @default(cuid())
  user            User      @relation(fields: [userId], references: [id])
  userId          String
  asset           GameAsset @relation(fields: [assetId], references: [id])
  assetId         String
  boxId           String?   // Ergo box ID containing the token
  isRedeemed      Boolean   @default(false)
  isForSale       Boolean   @default(false)
  listPrice       BigInt?
  acquiredAt      DateTime  @default(now())
}

model Milestone {
  id              String    @id @default(cuid())
  campaign        Campaign  @relation(fields: [campaignId], references: [id])
  campaignId      String
  title           String
  description     String
  targetAmount    BigInt
  isCompleted     Boolean   @default(false)
}

enum CampaignStatus {
  DRAFT
  ACTIVE
  FUNDED
  COMPLETED
  FAILED
}

enum AssetCategory {
  CHARACTER
  WEAPON
  ARMOR
  CONSUMABLE
  COSMETIC
  LAND
  MOUNT
}

enum AssetRarity {
  COMMON
  UNCOMMON
  RARE
  EPIC
  LEGENDARY
  MYTHIC
}

enum PurchaseStatus {
  PENDING
  CONFIRMED
  FAILED
}
```

### 1.3 Environment Variables
```env
# .env.local

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/chaincash"

# Ergo Network
NEXT_PUBLIC_ERGO_NETWORK="mainnet" # or "testnet"
NEXT_PUBLIC_ERGO_EXPLORER_API="https://api.ergoplatform.com/api/v1"
ERGO_NODE_API="http://localhost:9053"

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

---

## 📋 Phase 2: Ergo Integration (Week 2-3)

### 2.1 Create Ergo Service Layer

```typescript
// src/lib/ergo/client.ts

import { OutputBuilder, TransactionBuilder } from "@fleet-sdk/core";
import { type Box } from "@fleet-sdk/common";

const EXPLORER_API = process.env.NEXT_PUBLIC_ERGO_EXPLORER_API;

export class ErgoClient {
  // Get current blockchain height
  async getCurrentHeight(): Promise<number> {
    const res = await fetch(`${EXPLORER_API}/blocks?limit=1`);
    const data = await res.json();
    return data.items[0].height;
  }

  // Get boxes for an address
  async getBoxes(address: string): Promise<Box[]> {
    const res = await fetch(`${EXPLORER_API}/boxes/unspent/byAddress/${address}`);
    const data = await res.json();
    return data.items;
  }

  // Get token info
  async getToken(tokenId: string) {
    const res = await fetch(`${EXPLORER_API}/tokens/${tokenId}`);
    return res.json();
  }

  // Build purchase transaction
  async buildPurchaseTx(
    buyerAddress: string,
    sellerAddress: string,
    priceNanoErg: bigint,
    inputs: Box[],
    currentHeight: number
  ) {
    const tx = new TransactionBuilder(currentHeight)
      .from(inputs)
      .to(new OutputBuilder(priceNanoErg, sellerAddress))
      .sendChangeTo(buyerAddress)
      .payMinFee()
      .build();

    return tx.toEIP12Object();
  }
}

export const ergoClient = new ErgoClient();
```

### 2.2 Create Nautilus Wallet Hook

```typescript
// src/hooks/useNautilusWallet.ts

"use client";

import { useState, useEffect, useCallback } from "react";
import type { SignedTransaction } from "@fleet-sdk/common";

interface WalletState {
  isConnected: boolean;
  isConnecting: boolean;
  address: string | null;
  balance: string | null;
  error: string | null;
}

export function useNautilusWallet() {
  const [state, setState] = useState<WalletState>({
    isConnected: false,
    isConnecting: false,
    address: null,
    balance: null,
    error: null,
  });

  // Check if Nautilus is installed
  const isNautilusAvailable = useCallback(() => {
    return typeof window !== "undefined" && 
           window.ergoConnector?.nautilus !== undefined;
  }, []);

  // Connect to wallet
  const connect = useCallback(async () => {
    if (!isNautilusAvailable()) {
      setState(s => ({ ...s, error: "Nautilus wallet not installed" }));
      return false;
    }

    setState(s => ({ ...s, isConnecting: true, error: null }));

    try {
      const connected = await window.ergoConnector.nautilus.connect();
      
      if (connected && window.ergo) {
        const address = await window.ergo.get_change_address();
        const balance = await window.ergo.get_balance();
        
        setState({
          isConnected: true,
          isConnecting: false,
          address,
          balance,
          error: null,
        });
        return true;
      } else {
        setState(s => ({ 
          ...s, 
          isConnecting: false, 
          error: "Connection rejected" 
        }));
        return false;
      }
    } catch (err) {
      setState(s => ({ 
        ...s, 
        isConnecting: false, 
        error: err instanceof Error ? err.message : "Connection failed" 
      }));
      return false;
    }
  }, [isNautilusAvailable]);

  // Disconnect
  const disconnect = useCallback(async () => {
    if (window.ergoConnector?.nautilus) {
      await window.ergoConnector.nautilus.disconnect();
    }
    setState({
      isConnected: false,
      isConnecting: false,
      address: null,
      balance: null,
      error: null,
    });
  }, []);

  // Get UTXOs
  const getUtxos = useCallback(async (amount?: string) => {
    if (!window.ergo) throw new Error("Not connected");
    return window.ergo.get_utxos(amount);
  }, []);

  // Sign transaction
  const signTx = useCallback(async (unsignedTx: any): Promise<SignedTransaction> => {
    if (!window.ergo) throw new Error("Not connected");
    return window.ergo.sign_tx(unsignedTx);
  }, []);

  // Submit transaction
  const submitTx = useCallback(async (signedTx: SignedTransaction): Promise<string> => {
    if (!window.ergo) throw new Error("Not connected");
    return window.ergo.submit_tx(signedTx);
  }, []);

  // Get current height
  const getCurrentHeight = useCallback(async (): Promise<number> => {
    if (!window.ergo) throw new Error("Not connected");
    return window.ergo.get_current_height();
  }, []);

  // Check connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      if (isNautilusAvailable()) {
        const authorized = await window.ergoConnector.nautilus.isAuthorized();
        if (authorized) {
          await connect();
        }
      }
    };
    checkConnection();
  }, [connect, isNautilusAvailable]);

  return {
    ...state,
    isNautilusAvailable: isNautilusAvailable(),
    connect,
    disconnect,
    getUtxos,
    signTx,
    submitTx,
    getCurrentHeight,
  };
}
```

### 2.3 Type Declarations for Nautilus

```typescript
// src/types/ergo.d.ts

import type { 
  EIP12UnsignedTransaction, 
  SignedTransaction,
  Box 
} from "@fleet-sdk/common";

interface ErgoAPI {
  get_balance(tokenId?: string): Promise<string>;
  get_utxos(amount?: string, tokenId?: string): Promise<Box[] | undefined>;
  get_used_addresses(): Promise<string[]>;
  get_unused_addresses(): Promise<string[]>;
  get_change_address(): Promise<string>;
  sign_tx(tx: EIP12UnsignedTransaction): Promise<SignedTransaction>;
  sign_tx_inputs(tx: EIP12UnsignedTransaction, indexes: number[]): Promise<SignedTransaction>;
  submit_tx(tx: SignedTransaction): Promise<string>;
  get_current_height(): Promise<number>;
}

interface NautilusConnector {
  connect(options?: { createErgoObject?: boolean }): Promise<boolean>;
  disconnect(): Promise<boolean>;
  isConnected(): Promise<boolean>;
  isAuthorized(): Promise<boolean>;
  getContext(): Promise<ErgoAPI>;
}

declare global {
  interface Window {
    ergo?: ErgoAPI;
    ergoConnector?: {
      nautilus: NautilusConnector;
    };
  }
}

export {};
```

---

## 📋 Phase 3: API Routes (Week 3-4)

### 3.1 Campaign API Routes

```typescript
// src/app/api/campaigns/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createCampaignSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(5000),
  goalAmount: z.string(),
  endDate: z.string().datetime(),
  reserveRatio: z.number().min(0.1).max(1).default(0.6),
});

// GET /api/campaigns - List all campaigns
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const limit = parseInt(searchParams.get("limit") || "10");
  const offset = parseInt(searchParams.get("offset") || "0");

  const campaigns = await prisma.campaign.findMany({
    where: status ? { status: status as any } : undefined,
    include: {
      developer: { select: { walletAddress: true } },
      assets: { select: { id: true, price: true, soldCount: true } },
      _count: { select: { assets: true } },
    },
    take: limit,
    skip: offset,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(campaigns);
}

// POST /api/campaigns - Create new campaign
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = createCampaignSchema.parse(body);
    
    // TODO: Get user from session/wallet
    const walletAddress = req.headers.get("x-wallet-address");
    if (!walletAddress) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find or create user
    const user = await prisma.user.upsert({
      where: { walletAddress },
      create: { walletAddress },
      update: {},
    });

    const campaign = await prisma.campaign.create({
      data: {
        title: data.title,
        description: data.description,
        goalAmount: BigInt(data.goalAmount),
        endDate: new Date(data.endDate),
        reserveRatio: data.reserveRatio,
        developerId: user.id,
      },
    });

    return NextResponse.json(campaign, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
```

### 3.2 Purchase API Route

```typescript
// src/app/api/purchases/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ergoClient } from "@/lib/ergo/client";

// POST /api/purchases - Record a purchase
export async function POST(req: NextRequest) {
  try {
    const { assetId, txId, walletAddress } = await req.json();

    // Verify transaction on blockchain
    const tx = await ergoClient.getTransaction(txId);
    if (!tx) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 400 });
    }

    // Get asset details
    const asset = await prisma.gameAsset.findUnique({
      where: { id: assetId },
      include: { campaign: true },
    });

    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    // Find or create user
    const user = await prisma.user.upsert({
      where: { walletAddress },
      create: { walletAddress },
      update: {},
    });

    // Create purchase record
    const purchase = await prisma.purchase.create({
      data: {
        userId: user.id,
        assetId: asset.id,
        txId,
        price: asset.price,
        status: "CONFIRMED",
      },
    });

    // Create user asset
    await prisma.userAsset.create({
      data: {
        userId: user.id,
        assetId: asset.id,
      },
    });

    // Update sold count
    await prisma.gameAsset.update({
      where: { id: assetId },
      data: { soldCount: { increment: 1 } },
    });

    // Update campaign raised amount
    await prisma.campaign.update({
      where: { id: asset.campaignId },
      data: { raisedAmount: { increment: asset.price } },
    });

    return NextResponse.json(purchase, { status: 201 });
  } catch (error) {
    console.error("Purchase error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
```

---

## 📋 Phase 4: Smart Contract Integration (Week 4-5)

### 4.1 ChainCash Note Contract (ErgoScript)

```scala
// contracts/ChainCashNote.es
// This is a conceptual ErgoScript for ChainCash notes

{
  // ChainCash Note Contract
  // Represents a tokenized IOU with reserve backing
  
  val noteTokenId = SELF.tokens(0)._1
  val reserveAmount = SELF.value
  val developerPk = SELF.R4[SigmaProp].get
  val holderPk = SELF.R5[SigmaProp].get
  val campaignId = SELF.R6[Coll[Byte]].get
  val reserveRatio = SELF.R7[Long].get // in basis points (6000 = 60%)
  
  // Spending conditions:
  // 1. Developer can redeem after campaign success (holder gets game asset)
  // 2. Holder can redeem for reserve if campaign fails
  // 3. Holder can transfer to another user
  
  val isRedemption = OUTPUTS(0).R8[Coll[Byte]].isDefined
  val isTransfer = !isRedemption
  
  val validRedemption = {
    // Reserve goes back to holder
    val reserveToHolder = OUTPUTS.exists { out =>
      out.propositionBytes == holderPk.propBytes &&
      out.value >= reserveAmount
    }
    developerPk && reserveToHolder
  }
  
  val validTransfer = {
    // Token moves to new holder, reserve stays locked
    val newNote = OUTPUTS(0)
    newNote.tokens(0) == noteTokenId &&
    newNote.value >= reserveAmount &&
    newNote.R4[SigmaProp].get == developerPk &&
    // New holder set in R5
    holderPk
  }
  
  sigmaProp(
    (isRedemption && validRedemption) ||
    (isTransfer && validTransfer)
  )
}
```

### 4.2 Contract Service

```typescript
// src/lib/ergo/contracts.ts

import { OutputBuilder, TransactionBuilder, SAFE_MIN_BOX_VALUE } from "@fleet-sdk/core";
import { serializeBox } from "@fleet-sdk/serializer";
import type { Box } from "@fleet-sdk/common";

// Placeholder for compiled ErgoScript
const CHAINCASH_NOTE_TREE = "..."; // Compiled ErgoTree hex

export class ChainCashContract {
  /**
   * Create a ChainCash note for an asset purchase
   */
  async createNote(
    buyerAddress: string,
    developerAddress: string,
    assetPrice: bigint,
    reserveRatio: number,
    campaignId: string,
    inputs: Box[],
    currentHeight: number
  ) {
    const reserveAmount = (assetPrice * BigInt(Math.floor(reserveRatio * 10000))) / 10000n;
    
    const noteOutput = new OutputBuilder(reserveAmount, CHAINCASH_NOTE_TREE)
      .setAdditionalRegisters({
        R4: developerAddress, // Developer pubkey
        R5: buyerAddress,     // Holder pubkey
        R6: campaignId,       // Campaign ID
        R7: Math.floor(reserveRatio * 10000).toString(), // Reserve ratio in basis points
      });

    const tx = new TransactionBuilder(currentHeight)
      .from(inputs)
      .to(noteOutput)
      .sendChangeTo(buyerAddress)
      .payMinFee()
      .build();

    return tx.toEIP12Object();
  }

  /**
   * Redeem note for reserve (campaign failed)
   */
  async redeemForReserve(
    holderAddress: string,
    noteBox: Box,
    currentHeight: number
  ) {
    const reserveAmount = BigInt(noteBox.value);
    
    const tx = new TransactionBuilder(currentHeight)
      .from([noteBox])
      .to(new OutputBuilder(reserveAmount - SAFE_MIN_BOX_VALUE, holderAddress))
      .payMinFee()
      .build();

    return tx.toEIP12Object();
  }

  /**
   * Transfer note to new owner
   */
  async transferNote(
    currentHolder: string,
    newHolder: string,
    noteBox: Box,
    currentHeight: number
  ) {
    const newNote = new OutputBuilder(BigInt(noteBox.value), CHAINCASH_NOTE_TREE)
      .setAdditionalRegisters({
        R4: noteBox.additionalRegisters.R4, // Keep developer
        R5: newHolder, // New holder
        R6: noteBox.additionalRegisters.R6, // Keep campaign ID
        R7: noteBox.additionalRegisters.R7, // Keep reserve ratio
      });

    const tx = new TransactionBuilder(currentHeight)
      .from([noteBox])
      .to(newNote)
      .sendChangeTo(currentHolder)
      .payMinFee()
      .build();

    return tx.toEIP12Object();
  }
}

export const chainCashContract = new ChainCashContract();
```

---

## 📋 Phase 5: Frontend Integration (Week 5-6)

### 5.1 Update Wallet Store

```typescript
// src/stores/walletStore.ts - Updated for real Ergo

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WalletState {
  isConnected: boolean;
  isConnecting: boolean;
  address: string | null;
  balance: string | null;
  ergBalance: string | null;
  error: string | null;
  
  connect: () => Promise<boolean>;
  disconnect: () => Promise<void>;
  refreshBalance: () => Promise<void>;
  signAndSubmitTx: (unsignedTx: any) => Promise<string>;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      isConnected: false,
      isConnecting: false,
      address: null,
      balance: null,
      ergBalance: null,
      error: null,

      connect: async () => {
        if (typeof window === 'undefined' || !window.ergoConnector?.nautilus) {
          set({ error: 'Nautilus wallet not installed' });
          return false;
        }

        set({ isConnecting: true, error: null });

        try {
          const connected = await window.ergoConnector.nautilus.connect();
          
          if (connected && window.ergo) {
            const address = await window.ergo.get_change_address();
            const ergBalance = await window.ergo.get_balance();
            
            set({
              isConnected: true,
              isConnecting: false,
              address,
              ergBalance,
              balance: (parseInt(ergBalance) / 1e9).toFixed(4), // Convert nanoERG to ERG
              error: null,
            });
            return true;
          }
          
          set({ isConnecting: false, error: 'Connection rejected' });
          return false;
        } catch (err) {
          set({ 
            isConnecting: false, 
            error: err instanceof Error ? err.message : 'Connection failed' 
          });
          return false;
        }
      },

      disconnect: async () => {
        if (window.ergoConnector?.nautilus) {
          await window.ergoConnector.nautilus.disconnect();
        }
        set({
          isConnected: false,
          address: null,
          balance: null,
          ergBalance: null,
          error: null,
        });
      },

      refreshBalance: async () => {
        if (!window.ergo) return;
        
        try {
          const ergBalance = await window.ergo.get_balance();
          set({
            ergBalance,
            balance: (parseInt(ergBalance) / 1e9).toFixed(4),
          });
        } catch (err) {
          console.error('Failed to refresh balance:', err);
        }
      },

      signAndSubmitTx: async (unsignedTx: any) => {
        if (!window.ergo) throw new Error('Wallet not connected');
        
        const signedTx = await window.ergo.sign_tx(unsignedTx);
        const txId = await window.ergo.submit_tx(signedTx);
        
        // Refresh balance after transaction
        await get().refreshBalance();
        
        return txId;
      },
    }),
    {
      name: 'wallet-storage',
      partialize: (state) => ({ 
        // Only persist connection preference, not actual connection state
      }),
    }
  )
);
```

### 5.2 Purchase Flow Component

```typescript
// src/components/PurchaseButton.tsx

"use client";

import { useState } from "react";
import { useWalletStore } from "@/stores/walletStore";
import { useCartStore } from "@/stores/cartStore";
import { ergoClient } from "@/lib/ergo/client";
import { chainCashContract } from "@/lib/ergo/contracts";
import { Button } from "@/components/ui/Button";

interface PurchaseButtonProps {
  assetId: string;
  assetName: string;
  price: bigint;
  developerAddress: string;
  campaignId: string;
  reserveRatio: number;
}

export function PurchaseButton({
  assetId,
  assetName,
  price,
  developerAddress,
  campaignId,
  reserveRatio,
}: PurchaseButtonProps) {
  const { isConnected, address, signAndSubmitTx } = useWalletStore();
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePurchase = async () => {
    if (!isConnected || !address || !window.ergo) {
      setError("Please connect your wallet first");
      return;
    }

    setIsPurchasing(true);
    setError(null);

    try {
      // Get current blockchain height
      const currentHeight = await window.ergo.get_current_height();
      
      // Get UTXOs for the transaction
      const utxos = await window.ergo.get_utxos(price.toString());
      if (!utxos || utxos.length === 0) {
        throw new Error("Insufficient funds");
      }

      // Build ChainCash note transaction
      const unsignedTx = await chainCashContract.createNote(
        address,
        developerAddress,
        price,
        reserveRatio,
        campaignId,
        utxos,
        currentHeight
      );

      // Sign and submit
      const txId = await signAndSubmitTx(unsignedTx);

      // Record purchase in database
      await fetch("/api/purchases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-wallet-address": address,
        },
        body: JSON.stringify({
          assetId,
          txId,
          walletAddress: address,
        }),
      });

      alert(`Purchase successful! Transaction: ${txId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Purchase failed");
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <div>
      <Button
        onClick={handlePurchase}
        disabled={!isConnected || isPurchasing}
        className="w-full"
      >
        {isPurchasing ? "Processing..." : `Buy for ${Number(price) / 1e9} ERG`}
      </Button>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
}
```

---

## 📋 Phase 6: Testing & Deployment (Week 6-7)

### 6.1 Test on Ergo Testnet

```bash
# Update .env.local for testnet
NEXT_PUBLIC_ERGO_NETWORK="testnet"
NEXT_PUBLIC_ERGO_EXPLORER_API="https://api-testnet.ergoplatform.com/api/v1"
```

### 6.2 Deployment Checklist

- [ ] Set up PostgreSQL database (Supabase/Neon/Railway)
- [ ] Configure environment variables in Vercel
- [ ] Deploy smart contracts to mainnet
- [ ] Run database migrations
- [ ] Test all purchase flows
- [ ] Set up monitoring (Sentry, Analytics)

### 6.3 Commands

```bash
# Database setup
npx prisma generate
npx prisma db push

# Run development
npm run dev

# Build for production
npm run build

# Deploy
vercel --prod
```

---

## 🚀 Quick Start Commands

```bash
# 1. Install new dependencies
npm install @fleet-sdk/core @fleet-sdk/common @fleet-sdk/serializer @nautilus-js/eip12-types prisma @prisma/client zod

# 2. Initialize Prisma
npx prisma init

# 3. After adding schema, generate client
npx prisma generate

# 4. Push schema to database
npx prisma db push

# 5. Run development server
npm run dev
```

---

## 📊 Progress Tracking

| Phase | Status | Est. Time |
|-------|--------|-----------|
| Phase 1: Foundation | ⬜ Not Started | 1-2 weeks |
| Phase 2: Ergo Integration | ⬜ Not Started | 1-2 weeks |
| Phase 3: API Routes | ⬜ Not Started | 1 week |
| Phase 4: Smart Contracts | ⬜ Not Started | 1-2 weeks |
| Phase 5: Frontend Integration | ⬜ Not Started | 1 week |
| Phase 6: Testing & Deployment | ⬜ Not Started | 1 week |

**Total Estimated Time: 6-10 weeks**

---

## 🔗 Useful Links

- [Ergo Platform Docs](https://docs.ergoplatform.com/)
- [Fleet SDK Docs](https://fleet-sdk.github.io/docs/)
- [Nautilus Wallet Docs](https://docs.ergoplatform.com/eco/wallets/nautilus/)
- [Nautilus dApp Connector](https://github.com/nautls/nautilus-wallet/tree/main/docs/dapp-connector)
- [ErgoScript Tutorial](https://docs.ergoplatform.com/dev/scs/ergoscript/)
- [EIP-12 Types](https://github.com/capt-nemo429/eip12-types)
