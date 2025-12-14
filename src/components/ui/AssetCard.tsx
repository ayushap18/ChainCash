'use client';

import { motion } from 'framer-motion';
import { GameAsset } from '@/types';
import Button from './Button';
import { useCartStore } from '@/stores/cartStore';

interface AssetCardProps {
  asset: GameAsset;
  onClick?: () => void;
  showBuyButton?: boolean;
}

const rarityColors: Record<string, { bg: string; border: string; text: string }> = {
  common: { bg: 'bg-[#FFF8D4]/10', border: 'border-[#FFF8D4]/30', text: 'text-[#FFF8D4]/60' },
  uncommon: { bg: 'bg-green-500/20', border: 'border-green-500', text: 'text-green-400' },
  rare: { bg: 'bg-blue-500/20', border: 'border-blue-500', text: 'text-blue-400' },
  epic: { bg: 'bg-purple-500/20', border: 'border-purple-500', text: 'text-purple-400' },
  legendary: { bg: 'bg-amber-500/20', border: 'border-amber-500', text: 'text-amber-400' },
};

const categoryIcons: Record<string, string> = {
  character: '👤',
  weapon: '⚔️',
  skin: '🎨',
  item: '💎',
  vehicle: '🚀',
};

export default function AssetCard({ asset, onClick, showBuyButton = true }: AssetCardProps) {
  const { addItem, openCart } = useCartStore();
  const rarity = rarityColors[asset.rarity];
  const soldPercentage = (asset.soldCount / asset.totalSupply) * 100;
  const isSoldOut = asset.soldCount >= asset.totalSupply;

  const handleBuy = () => {
    addItem(asset);
    openCart();
  };

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-2xl bg-[#435663]/30 border ${rarity.border}/30
        hover:border-[#A3B087]/50 transition-all duration-300 cursor-pointer
        group
      `}
    >
      {/* Glow effect */}
      <div className={`absolute inset-0 ${rarity.bg} opacity-0 group-hover:opacity-100 transition-opacity blur-xl`} />
      
      {/* Content */}
      <div className="relative p-5">
        {/* Header with category and rarity */}
        <div className="flex justify-between items-start mb-4">
          <span className="text-2xl">{categoryIcons[asset.category]}</span>
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${rarity.bg} ${rarity.text} border ${rarity.border}/50`}>
            {asset.rarity.toUpperCase()}
          </span>
        </div>

        {/* Asset image placeholder */}
        <div className={`w-full h-40 rounded-xl ${rarity.bg} mb-4 flex items-center justify-center border ${rarity.border}/20`}>
          <div className="text-6xl opacity-50">
            {categoryIcons[asset.category]}
          </div>
        </div>

        {/* Name and description */}
        <h3 className="text-[#FFF8D4] font-bold text-lg mb-1">{asset.name}</h3>
        <p className="text-[#FFF8D4]/60 text-sm mb-4 line-clamp-2">{asset.description}</p>

        {/* Supply progress */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-[#FFF8D4]/50 mb-1">
            <span>{asset.soldCount} / {asset.totalSupply} sold</span>
            <span>{soldPercentage.toFixed(0)}%</span>
          </div>
          <div className="h-2 bg-[#313647] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${soldPercentage}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className={`h-full ${isSoldOut ? 'bg-red-500' : 'bg-gradient-to-r from-[#A3B087] to-[#8a9a6f]'}`}
            />
          </div>
        </div>

        {/* Price and buy button */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[#FFF8D4]/50 text-xs">Price</span>
            <p className="text-[#FFF8D4] font-bold text-xl">
              {asset.price} <span className="text-[#A3B087] text-sm">{asset.currency}</span>
            </p>
          </div>
          
          {showBuyButton && (
            <Button
              onClick={handleBuy}
              disabled={isSoldOut}
              size="sm"
              variant={isSoldOut ? 'secondary' : 'primary'}
            >
              {isSoldOut ? 'Sold Out' : 'Buy Now'}
            </Button>
          )}
        </div>
      </div>

      {/* Sold out overlay */}
      {isSoldOut && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
          <span className="text-red-500 font-bold text-xl transform -rotate-12">SOLD OUT</span>
        </div>
      )}
    </motion.div>
  );
}
