'use client';

import { motion } from 'framer-motion';
import { Campaign } from '@/types';
import Link from 'next/link';

interface CampaignCardProps {
  campaign: Campaign;
}

export default function CampaignCard({ campaign }: CampaignCardProps) {
  const progress = (campaign.currentAmount / campaign.targetAmount) * 100;
  const daysLeft = Math.ceil(
    (new Date(campaign.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  const isEndingSoon = daysLeft > 0 && daysLeft <= 7;
  const isFunded = progress >= 100;

  return (
    <Link href={`/campaign/${campaign.id}`}>
      <motion.div
        whileHover={{ y: -8, scale: 1.02 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-[#435663]/30 border border-[#435663] hover:border-[#A3B087]/50 transition-all duration-300 cursor-pointer group h-full"
      >
        {/* Banner image placeholder */}
        <div className="relative h-44 bg-gradient-to-br from-[#A3B087]/30 to-[#435663]/30 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-7xl opacity-20 group-hover:scale-110 transition-transform duration-500">🎮</span>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#313647] to-transparent opacity-60" />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
            <div className="flex gap-2">
              {isEndingSoon && (
                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/50 flex items-center gap-1">
                  ⏰ Ending Soon
                </span>
              )}
              {isFunded && (
                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/50 flex items-center gap-1">
                  ✓ Funded
                </span>
              )}
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
              campaign.status === 'active' 
                ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                : campaign.status === 'funded'
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                : 'bg-[#435663]/50 text-[#FFF8D4]/60 border border-[#435663]'
            }`}>
              {campaign.status.toUpperCase()}
            </span>
          </div>

          {/* Game title overlay */}
          <div className="absolute bottom-3 left-3">
            <span className="px-3 py-1 rounded-lg text-sm font-medium bg-black/50 text-[#FFF8D4] backdrop-blur-sm">
              {campaign.gameTitle}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Developer */}
          <p className="text-[#A3B087] text-sm font-medium mb-1">{campaign.developer}</p>
          
          {/* Title */}
          <h3 className="text-[#FFF8D4] font-bold text-lg mb-2 line-clamp-1 group-hover:text-[#A3B087] transition-colors">{campaign.title}</h3>
          
          {/* Description */}
          <p className="text-[#FFF8D4]/60 text-sm mb-4 line-clamp-2">{campaign.description}</p>

          {/* Tags */}
          {campaign.tags && campaign.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {campaign.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="px-2 py-0.5 bg-[#435663] text-[#FFF8D4]/50 rounded-full text-xs">
                  #{tag}
                </span>
              ))}
              {campaign.tags.length > 3 && (
                <span className="px-2 py-0.5 text-[#FFF8D4]/40 text-xs">+{campaign.tags.length - 3}</span>
              )}
            </div>
          )}

          {/* Progress */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-[#FFF8D4] font-bold">
                {campaign.currentAmount} <span className="text-[#A3B087] font-normal">{campaign.currency}</span>
              </span>
              <span className="text-[#FFF8D4]/50">
                {progress.toFixed(0)}%
              </span>
            </div>
            <div className="h-2 bg-[#313647] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progress, 100)}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className={`h-full ${isFunded ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-[#A3B087] to-[#8a9a6f]'}`}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 bg-[#435663]/50 rounded-lg">
              <p className="text-[#FFF8D4] font-semibold text-sm">{campaign.backers.toLocaleString()}</p>
              <p className="text-[#FFF8D4]/50 text-xs">Backers</p>
            </div>
            <div className="p-2 bg-[#435663]/50 rounded-lg">
              <p className={`font-semibold text-sm ${isEndingSoon ? 'text-amber-400' : 'text-[#FFF8D4]'}`}>
                {daysLeft > 0 ? daysLeft : 0}
              </p>
              <p className="text-[#FFF8D4]/50 text-xs">Days Left</p>
            </div>
            <div className="p-2 bg-[#435663]/50 rounded-lg">
              <p className="text-[#FFF8D4] font-semibold text-sm">{campaign.assets.length}</p>
              <p className="text-[#FFF8D4]/50 text-xs">Assets</p>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
