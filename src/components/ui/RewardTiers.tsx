'use client';

import { motion } from 'framer-motion';
import { REWARD_TIERS, RewardTier, type RewardTierConfig } from '@/lib/ergo/nftRewardService';

interface RewardTiersDisplayProps {
  onSelect?: (tier: RewardTierConfig) => void;
  selectedTier?: RewardTier;
  pledgeAmount?: number;
}

export function RewardTiersDisplay({ onSelect, selectedTier, pledgeAmount }: RewardTiersDisplayProps) {
  // Determine which tier the current pledge amount qualifies for
  const qualifiedTier = pledgeAmount 
    ? [...REWARD_TIERS].reverse().find(t => pledgeAmount >= t.minPledge)?.tier 
    : undefined;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Backer Rewards</h3>
      <p className="text-gray-400 text-sm">
        Receive an exclusive NFT badge based on your pledge amount
      </p>
      
      <div className="grid gap-4 md:grid-cols-2">
        {REWARD_TIERS.map((tier, index) => {
          const isQualified = pledgeAmount ? pledgeAmount >= tier.minPledge : false;
          const isSelected = selectedTier === tier.tier;
          const isCurrentTier = qualifiedTier === tier.tier;
          
          return (
            <motion.div
              key={tier.tier}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onSelect?.(tier)}
              className={`
                relative p-4 rounded-xl border-2 cursor-pointer transition-all
                ${isCurrentTier 
                  ? 'border-purple-500 bg-purple-500/10' 
                  : isQualified 
                    ? 'border-gray-600 bg-gray-800/50 hover:border-gray-500' 
                    : 'border-gray-700 bg-gray-800/30 opacity-60'
                }
                ${isSelected ? 'ring-2 ring-purple-400' : ''}
              `}
            >
              {/* Current Tier Badge */}
              {isCurrentTier && (
                <div className="absolute -top-2 -right-2 px-2 py-1 bg-purple-500 rounded-full text-xs font-medium">
                  Your Tier
                </div>
              )}
              
              {/* Header */}
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{tier.emoji}</span>
                <div>
                  <h4 className="font-semibold" style={{ color: tier.color }}>{tier.name}</h4>
                  <p className="text-sm text-gray-400">{tier.minPledge}+ ERG</p>
                </div>
              </div>
              
              {/* Description */}
              <p className="text-sm text-gray-300 mb-3">{tier.description}</p>
              
              {/* Benefits */}
              <ul className="space-y-1">
                {tier.benefits.map((benefit, i) => (
                  <li key={i} className="text-xs text-gray-400 flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Badge Display Component
// ═══════════════════════════════════════════════════════════════════════════

interface BadgeCardProps {
  tier: RewardTier;
  campaignTitle: string;
  pledgeAmount: number;
  mintedAt?: string;
  tokenId?: string;
}

export function BadgeCard({ tier, campaignTitle, pledgeAmount, mintedAt, tokenId }: BadgeCardProps) {
  const tierConfig = REWARD_TIERS.find(t => t.tier === tier) || REWARD_TIERS[0];
  
  return (
    <motion.div
      whileHover={{ scale: 1.02, rotateY: 5 }}
      className="relative p-6 rounded-xl border-2 overflow-hidden"
      style={{ 
        borderColor: tierConfig.color,
        background: `linear-gradient(135deg, ${tierConfig.color}10, transparent)`
      }}
    >
      {/* Shine Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shine" />
      
      {/* Badge Icon */}
      <div className="flex justify-center mb-4">
        <div 
          className="w-20 h-20 rounded-full flex items-center justify-center text-5xl"
          style={{ backgroundColor: `${tierConfig.color}20` }}
        >
          {tierConfig.emoji}
        </div>
      </div>
      
      {/* Info */}
      <div className="text-center">
        <h4 className="font-bold text-lg" style={{ color: tierConfig.color }}>
          {tierConfig.name}
        </h4>
        <p className="text-gray-400 text-sm mb-2">{campaignTitle}</p>
        <p className="text-xl font-semibold">{pledgeAmount} ERG</p>
        
        {mintedAt && (
          <p className="text-xs text-gray-500 mt-2">Minted: {mintedAt}</p>
        )}
        
        {tokenId && (
          <a 
            href={`https://explorer.ergoplatform.com/en/token/${tokenId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-purple-400 hover:text-purple-300 mt-2 block"
          >
            View on Explorer →
          </a>
        )}
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Badge Collection Component
// ═══════════════════════════════════════════════════════════════════════════

interface BadgeCollectionProps {
  badges: {
    tier: RewardTier;
    campaignTitle: string;
    pledgeAmount: number;
    mintedAt?: string;
    tokenId?: string;
  }[];
}

export function BadgeCollection({ badges }: BadgeCollectionProps) {
  if (badges.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <div className="text-5xl mb-4">🎖️</div>
        <h3 className="text-lg font-medium mb-2">No Badges Yet</h3>
        <p className="text-sm">Back a campaign to earn your first badge!</p>
      </div>
    );
  }
  
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {badges.map((badge, i) => (
        <BadgeCard key={i} {...badge} />
      ))}
    </div>
  );
}

// Add shine animation to global CSS or use styled-jsx
const styles = `
  @keyframes shine {
    to {
      transform: translateX(200%);
    }
  }
  .animate-shine {
    animation: shine 3s infinite;
  }
`;
