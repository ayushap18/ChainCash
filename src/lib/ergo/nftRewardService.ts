/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ChainCash Crowdfunding - NFT Reward Service
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Mint NFT badges for campaign backers as proof of contribution.
 * Supports tiered rewards based on pledge amount.
 */

import { 
  TransactionBuilder, 
  OutputBuilder, 
  SAFE_MIN_BOX_VALUE,
  NANOERG_PER_ERG,
  getWalletUtxos,
  getChangeAddress,
  getBlockHeight,
  executeWithNautilus
} from './transactionService';

// ═══════════════════════════════════════════════════════════════════════════
// Reward Tiers
// ═══════════════════════════════════════════════════════════════════════════

export enum RewardTier {
  BRONZE = 'bronze',    // 1-9 ERG
  SILVER = 'silver',    // 10-49 ERG
  GOLD = 'gold',        // 50-99 ERG
  DIAMOND = 'diamond'   // 100+ ERG
}

export interface RewardTierConfig {
  tier: RewardTier;
  minPledge: number;
  name: string;
  description: string;
  emoji: string;
  color: string;
  benefits: string[];
}

export const REWARD_TIERS: RewardTierConfig[] = [
  {
    tier: RewardTier.BRONZE,
    minPledge: 1,
    name: 'Bronze Backer',
    description: 'Early supporter of the project',
    emoji: '🥉',
    color: '#CD7F32',
    benefits: ['Name in credits', 'Digital wallpaper']
  },
  {
    tier: RewardTier.SILVER,
    minPledge: 10,
    name: 'Silver Patron',
    description: 'Dedicated supporter with exclusive access',
    emoji: '🥈',
    color: '#C0C0C0',
    benefits: ['All Bronze benefits', 'Beta access', 'Exclusive supporter role']
  },
  {
    tier: RewardTier.GOLD,
    minPledge: 50,
    name: 'Gold Champion',
    description: 'Major contributor with premium rewards',
    emoji: '🥇',
    color: '#FFD700',
    benefits: ['All Silver benefits', 'In-game item', 'Behind-the-scenes content']
  },
  {
    tier: RewardTier.DIAMOND,
    minPledge: 100,
    name: 'Diamond Legend',
    description: 'Legendary supporter with maximum perks',
    emoji: '💎',
    color: '#B9F2FF',
    benefits: ['All Gold benefits', 'NPC named after you', 'Video call with devs', 'Physical merch']
  }
];

// ═══════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════

export interface BackerBadgeParams {
  campaignId: string;
  campaignTitle: string;
  backerAddress: string;
  pledgeAmountErg: number;
}

export interface BackerBadge {
  tokenId: string;
  tier: RewardTier;
  campaignId: string;
  campaignTitle: string;
  pledgeAmount: number;
  mintedAt: number;
  txId: string;
}

export interface BadgeMetadata {
  name: string;
  description: string;
  image: string;
  attributes: {
    trait_type: string;
    value: string | number;
  }[];
}

// ═══════════════════════════════════════════════════════════════════════════
// Helper Functions
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Determine reward tier based on pledge amount
 */
export function getRewardTier(pledgeAmountErg: number): RewardTierConfig {
  // Sort tiers by minPledge descending to find highest applicable tier
  const sortedTiers = [...REWARD_TIERS].sort((a, b) => b.minPledge - a.minPledge);
  
  for (const tier of sortedTiers) {
    if (pledgeAmountErg >= tier.minPledge) {
      return tier;
    }
  }
  
  // Default to bronze if somehow no tier matches
  return REWARD_TIERS[0];
}

/**
 * Generate badge metadata for NFT
 */
export function generateBadgeMetadata(
  campaignTitle: string,
  tier: RewardTierConfig,
  pledgeAmountErg: number,
  backerAddress: string
): BadgeMetadata {
  return {
    name: `${campaignTitle} - ${tier.name}`,
    description: `${tier.description}. Pledged ${pledgeAmountErg} ERG to support ${campaignTitle}.`,
    image: generateBadgeImageUrl(tier),
    attributes: [
      { trait_type: 'Campaign', value: campaignTitle },
      { trait_type: 'Tier', value: tier.name },
      { trait_type: 'Pledge Amount', value: pledgeAmountErg },
      { trait_type: 'Backer', value: shortenAddress(backerAddress) },
      { trait_type: 'Minted', value: new Date().toISOString().split('T')[0] }
    ]
  };
}

/**
 * Generate badge image URL (placeholder - use IPFS in production)
 */
function generateBadgeImageUrl(tier: RewardTierConfig): string {
  // In production, generate actual images and upload to IPFS
  return `https://api.dicebear.com/7.x/shapes/svg?seed=${tier.tier}&backgroundColor=${tier.color.replace('#', '')}`;
}

/**
 * Shorten address for display
 */
function shortenAddress(address: string): string {
  return `${address.slice(0, 8)}...${address.slice(-6)}`;
}

// ═══════════════════════════════════════════════════════════════════════════
// NFT Minting
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Mint a backer badge NFT
 */
export async function mintBackerBadge(params: BackerBadgeParams): Promise<BackerBadge> {
  const utxos = await getWalletUtxos();
  const changeAddress = await getChangeAddress();
  const currentHeight = await getBlockHeight();
  
  if (!utxos.length) throw new Error('No UTXOs available');
  
  // Determine tier based on pledge amount
  const tier = getRewardTier(params.pledgeAmountErg);
  
  // Generate metadata
  const metadata = generateBadgeMetadata(
    params.campaignTitle,
    tier,
    params.pledgeAmountErg,
    params.backerAddress
  );
  
  // Create unique token name
  const tokenName = `${params.campaignTitle.substring(0, 20)}-${tier.tier.toUpperCase()}-BADGE`;
  const tokenDescription = metadata.description;
  
  // Create NFT output (amount = 1 for NFT)
  const nftOutput = new OutputBuilder(SAFE_MIN_BOX_VALUE, params.backerAddress, currentHeight)
    .mintToken({
      amount: BigInt(1),
      name: tokenName,
      decimals: 0,
      description: tokenDescription
    })
    .setAdditionalRegisters({
      R4: Buffer.from(params.campaignId).toString('hex'),           // Campaign ID
      R5: tier.tier,                                                  // Tier
      R6: params.pledgeAmountErg.toString(),                         // Pledge Amount
      R7: currentHeight.toString(),                                   // Mint Height
      R8: Buffer.from(JSON.stringify(metadata)).toString('hex')      // Full Metadata
    });
  
  const tx = new TransactionBuilder(currentHeight)
    .from(utxos)
    .to(nftOutput)
    .sendChangeTo(changeAddress)
    .payMinFee()
    .build();
  
  const txId = await executeWithNautilus(tx);
  
  // Return badge info
  return {
    tokenId: utxos[0].boxId, // First input becomes token ID
    tier: tier.tier,
    campaignId: params.campaignId,
    campaignTitle: params.campaignTitle,
    pledgeAmount: params.pledgeAmountErg,
    mintedAt: currentHeight,
    txId
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// Badge Verification
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Verify if an address holds a badge for a campaign
 */
export async function verifyBadgeOwnership(
  address: string,
  campaignId: string
): Promise<{ hasBadge: boolean; tier?: RewardTier; badge?: BackerBadge }> {
  try {
    // Fetch all tokens owned by address
    const response = await fetch(
      `https://api.ergoplatform.com/api/v1/addresses/${address}/balance/confirmed`
    );
    
    if (!response.ok) {
      return { hasBadge: false };
    }
    
    const balance = await response.json();
    
    // Check each token for campaign badge
    for (const token of balance.tokens || []) {
      // Check if token name contains badge pattern
      if (token.name?.includes('-BADGE')) {
        // Fetch token details to check campaign ID
        const tokenResponse = await fetch(
          `https://api.ergoplatform.com/api/v1/boxes/${token.tokenId}`
        );
        
        if (tokenResponse.ok) {
          const box = await tokenResponse.json();
          const boxCampaignId = box.additionalRegisters?.R4;
          
          if (boxCampaignId === Buffer.from(campaignId).toString('hex')) {
            return {
              hasBadge: true,
              tier: box.additionalRegisters?.R5 as RewardTier,
              badge: {
                tokenId: token.tokenId,
                tier: box.additionalRegisters?.R5 as RewardTier,
                campaignId,
                campaignTitle: token.name.split('-')[0],
                pledgeAmount: parseInt(box.additionalRegisters?.R6 || '0'),
                mintedAt: parseInt(box.additionalRegisters?.R7 || '0'),
                txId: box.transactionId
              }
            };
          }
        }
      }
    }
    
    return { hasBadge: false };
  } catch (error) {
    console.error('Error verifying badge ownership:', error);
    return { hasBadge: false };
  }
}

/**
 * Get all badges owned by an address
 */
export async function getOwnedBadges(address: string): Promise<BackerBadge[]> {
  try {
    const response = await fetch(
      `https://api.ergoplatform.com/api/v1/addresses/${address}/balance/confirmed`
    );
    
    if (!response.ok) return [];
    
    const balance = await response.json();
    const badges: BackerBadge[] = [];
    
    for (const token of balance.tokens || []) {
      if (token.name?.includes('-BADGE')) {
        // This is a backer badge
        badges.push({
          tokenId: token.tokenId,
          tier: extractTierFromName(token.name),
          campaignId: '', // Would need to fetch from box
          campaignTitle: token.name.split('-')[0],
          pledgeAmount: 0, // Would need to fetch from box
          mintedAt: 0,
          txId: ''
        });
      }
    }
    
    return badges;
  } catch (error) {
    console.error('Error fetching badges:', error);
    return [];
  }
}

/**
 * Extract tier from token name
 */
function extractTierFromName(name: string): RewardTier {
  const upperName = name.toUpperCase();
  if (upperName.includes('DIAMOND')) return RewardTier.DIAMOND;
  if (upperName.includes('GOLD')) return RewardTier.GOLD;
  if (upperName.includes('SILVER')) return RewardTier.SILVER;
  return RewardTier.BRONZE;
}
