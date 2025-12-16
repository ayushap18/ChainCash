// ChainCash Project Types

// User & Auth
export interface User {
  id: string;
  walletAddress: string;
  username?: string;
  avatarUrl?: string;
  createdAt: string;
}

// Campaign Types
export type CampaignStatus = 'draft' | 'active' | 'funded' | 'completed' | 'failed';

export interface Campaign {
  id: string;
  title: string;
  description: string;
  developerId: string;
  developer?: any; // Changed to any to match usage in CampaignPage (string or object)
  goalAmount: string; // in NanoERG
  raisedAmount: string; // in NanoERG
  reserveRatio: number; // 0.1 to 1.0
  status: CampaignStatus;
  endDate: string;
  createdAt: string;

  // Frontend helpers (made mandatory for UI simplicity, should be populated by store/API)
  currentAmount: number;
  targetAmount: number;
  backers: number;
  assets: GameAsset[];
  milestones: Milestone[];

  imagePath?: string;
  tags?: string[];
  currentFunding?: bigint; // For blockchain compatibility

  // Extended properties used in CampaignPage
  website?: string;
  gameTitle?: string;
  currency?: string;
  launchDate?: string;
  longDescription?: string;
  updates?: CampaignUpdate[];
}

export interface CampaignUpdate {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    author: string;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  isCompleted: boolean;
  // Extended
  isReached?: boolean;
  reward?: string;
  reachedAt?: string;
}

// Asset Types
export type AssetRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';
export type AssetCategory = 'character' | 'weapon' | 'skin' | 'item' | 'vehicle' | 'consumable';

export interface GameAsset {
  id: string;
  campaignId: string;
  gameId: string;
  name: string;
  description: string;
  price: number; // Display price in ERG
  priceNano?: string; // Blockchain price
  rarity: AssetRarity;
  category: AssetCategory;
  totalSupply: number;
  soldCount: number;
  tokenId?: string;
  imageUrl?: string;
  attributes?: Record<string, string | number>;
  createdAt?: string;
  isRedeemable?: boolean;
  currency?: string;
}

// Transaction Types
export interface Transaction {
  id: string;
  txId: string;
  type: 'pledge' | 'purchase' | 'refund' | 'withdrawal';
  amount: string;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: string;
}

// Store Types
export interface WalletState {
  address: string | null;
  isConnected: boolean;
  balance: string;
}

export interface CartItem {
  asset: GameAsset;
  quantity: number;
}

export interface UserAsset {
  id: string;
  userId: string;
  assetId: string;
  asset: GameAsset;
  acquiredAt: string;
  status: 'active' | 'redeemed' | 'listed';
  txId?: string;
  transactionHash?: string; // Alias for txId or specific to asset purchase tx
  purchasePrice?: number;
  purchasedAt?: string; // Alias for acquiredAt
  isRedeemed?: boolean;
  quantity?: number;
}
