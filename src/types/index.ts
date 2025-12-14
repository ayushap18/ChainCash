// ChainCash Note Types (Tokenized Game Asset Notes - Ergo Concept)
export interface ChainCashNote {
  id: string;
  assetId: string;
  issuer: string; // Developer wallet address
  holder: string; // Current owner wallet address
  denomination: number; // Note value in the currency
  currency: 'ERG' | 'SigUSD' | 'ETH';
  collateralRatio: number; // Percentage of backing (100 = fully backed)
  maturityDate: Date; // When the game launches
  isRedeemable: boolean; // True after game launch
  isRedeemed: boolean;
  createdAt: Date;
  signature: string; // Cryptographic signature
}

// Game Asset Types
export interface GameAsset {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: 'ETH' | 'ERG' | 'SigUSD';
  category: 'character' | 'skin' | 'weapon' | 'item' | 'vehicle' | 'consumable';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';
  modelPath?: string;
  imagePath: string;
  tokenId?: string;
  isRedeemable: boolean;
  totalSupply: number;
  soldCount: number;
  createdAt: Date;
  chainCashNote?: ChainCashNote;
  reservePrice?: number; // Minimum trade price
  gameId: string;
}

// Campaign Types
export interface Campaign {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  gameTitle: string;
  developer: string;
  developerAddress: string;
  targetAmount: number;
  currentAmount: number;
  currency: 'ETH' | 'ERG' | 'SigUSD';
  startDate: Date;
  endDate: Date;
  launchDate?: Date; // When game will launch and assets become redeemable
  status: 'draft' | 'active' | 'funded' | 'completed' | 'cancelled';
  assets: GameAsset[];
  backers: number;
  imagePath: string;
  bannerPath?: string;
  videoUrl?: string;
  website?: string;
  twitter?: string;
  discord?: string;
  milestones?: CampaignMilestone[];
  updates?: CampaignUpdate[];
  tags: string[];
}

export interface CampaignMilestone {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  isReached: boolean;
  reachedAt?: Date;
  reward?: string;
}

export interface CampaignUpdate {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  author: string;
}

// User/Wallet Types
export interface UserAsset {
  asset: GameAsset;
  quantity: number;
  purchasedAt: Date;
  transactionHash: string;
  isRedeemed: boolean;
}

export interface User {
  address: string;
  ensName?: string;
  ownedAssets: UserAsset[];
  totalSpent: number;
  campaignsBacked: string[];
}

// Transaction Types
export interface Transaction {
  id: string;
  type: 'purchase' | 'trade' | 'redeem';
  assetId: string;
  from: string;
  to: string;
  amount: number;
  currency: 'ETH' | 'ERG';
  timestamp: Date;
  hash: string;
  status: 'pending' | 'confirmed' | 'failed';
}

// Cart Types
export interface CartItem {
  asset: GameAsset;
  quantity: number;
}

// 3D Scene Types
export interface SceneAsset {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  asset: GameAsset;
  isHovered: boolean;
  isSelected: boolean;
}

// Animation States
export type AnimationState = 
  | 'idle'
  | 'hover'
  | 'selected'
  | 'purchasing'
  | 'purchased'
  | 'trading'
  | 'revealing';
