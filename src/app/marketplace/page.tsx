'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import AssetCard from '@/components/ui/AssetCard';
import Button from '@/components/ui/Button';
import { useCampaignStore } from '@/stores/campaignStore';

// Dynamically import 3D components
const Scene3D = dynamic(() => import('@/components/3d/Scene3D'), { ssr: false });
const MarketplaceScene = dynamic(() => import('@/components/3d/MarketplaceScene'), { ssr: false });

type Category = 'all' | 'character' | 'weapon' | 'skin' | 'item' | 'vehicle' | 'consumable';
type Rarity = 'all' | 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';
type SortBy = 'price-asc' | 'price-desc' | 'rarity' | 'newest' | 'popular';

export default function MarketplacePage() {
  const { campaigns, fetchCampaigns, isLoading } = useCampaignStore();
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [selectedRarity, setSelectedRarity] = useState<Rarity>('all');
  const [sortBy, setSortBy] = useState<SortBy>('popular');
  const [viewMode, setViewMode] = useState<'3d' | 'grid'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  // Get all assets from all campaigns
  const allAssets = useMemo(() => campaigns.flatMap((c) => c.assets), [campaigns]);
  
  // Filter assets
  const filteredAssets = useMemo(() => {
    return allAssets.filter((asset) => {
      const categoryMatch = selectedCategory === 'all' || asset.category === selectedCategory;
      const rarityMatch = selectedRarity === 'all' || asset.rarity === selectedRarity;
      const priceMatch = asset.price >= priceRange[0] && asset.price <= priceRange[1];
      const searchMatch = !searchQuery || 
        asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      return categoryMatch && rarityMatch && priceMatch && searchMatch;
    });
  }, [allAssets, selectedCategory, selectedRarity, priceRange, searchQuery]);

  // Sort assets
  const sortedAssets = useMemo(() => {
    const rarityOrder = { common: 1, uncommon: 2, rare: 3, epic: 4, legendary: 5, mythic: 6 };
    
    return [...filteredAssets].sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'rarity':
          return rarityOrder[b.rarity] - rarityOrder[a.rarity];
        case 'newest':
            return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        case 'popular':
          return b.soldCount - a.soldCount;
        default:
          return 0;
      }
    });
  }, [filteredAssets, sortBy]);

  const categories: { value: Category; label: string; icon: string }[] = [
    { value: 'all', label: 'All', icon: '🎯' },
    { value: 'character', label: 'Characters', icon: '👤' },
    { value: 'weapon', label: 'Weapons', icon: '⚔️' },
    { value: 'skin', label: 'Skins', icon: '🎨' },
    { value: 'item', label: 'Items', icon: '💎' },
    { value: 'vehicle', label: 'Vehicles', icon: '🚀' },
    { value: 'consumable', label: 'Consumables', icon: '🧪' },
  ];

  const rarities: { value: Rarity; label: string; color: string }[] = [
    { value: 'all', label: 'All', color: 'slate' },
    { value: 'common', label: 'Common', color: 'slate' },
    { value: 'uncommon', label: 'Uncommon', color: 'green' },
    { value: 'rare', label: 'Rare', color: 'blue' },
    { value: 'epic', label: 'Epic', color: 'purple' },
    { value: 'legendary', label: 'Legendary', color: 'amber' },
    { value: 'mythic', label: 'Mythic', color: 'red' },
  ];

  const sortOptions: { value: SortBy; label: string }[] = [
    { value: 'popular', label: 'Most Popular' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'rarity', label: 'Rarity' },
    { value: 'newest', label: 'Newest' },
  ];

  // Stats
  const totalAssets = allAssets.length;
  const floorPrice = allAssets.length > 0 ? Math.min(...allAssets.map(a => a.price)) : 0;
  const avgPrice = allAssets.length > 0 ? allAssets.reduce((sum, a) => sum + a.price, 0) / allAssets.length : 0;

  return (
    <div className="min-h-screen bg-[#313647]">
      {/* 3D Scene (when in 3D mode) */}
      <AnimatePresence>
        {viewMode === '3d' && (
          <motion.section
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: '70vh' }}
            exit={{ opacity: 0, height: 0 }}
            className="relative"
          >
            <Scene3D cameraPosition={[0, 3, 12]} environmentPreset="city">
              <MarketplaceScene assets={sortedAssets.slice(0, 8)} />
            </Scene3D>
            <div className="absolute inset-0 bg-gradient-to-t from-[#313647] via-transparent to-transparent pointer-events-none" />
          </motion.section>
        )}
      </AnimatePresence>

      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${viewMode === '3d' ? '-mt-32 relative z-10' : 'py-24'}`}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold text-[#FFF8D4] mb-2">
              Asset <span className="bg-gradient-to-r from-[#A3B087] to-[#8a9a6f] bg-clip-text text-transparent">Marketplace</span>
            </h1>
            <p className="text-[#FFF8D4]/60">
              Browse and purchase ChainCash notes for exclusive game assets
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 bg-[#435663] rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                viewMode === 'grid'
                  ? 'bg-[#A3B087] text-[#313647]'
                  : 'text-[#FFF8D4]/60 hover:text-[#FFF8D4]'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Grid
            </button>
            <button
              onClick={() => setViewMode('3d')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                viewMode === '3d'
                  ? 'bg-[#A3B087] text-[#313647]'
                  : 'text-[#FFF8D4]/60 hover:text-[#FFF8D4]'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              3D View
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-4 mb-8"
        >
          {[
            { label: 'Total Assets', value: totalAssets, icon: '🎮' },
            { label: 'Floor Price', value: `${floorPrice.toFixed(3)} ERG`, icon: '📉' },
            { label: 'Avg Price', value: `${avgPrice.toFixed(3)} ERG`, icon: '📊' },
          ].map((stat, i) => (
            <div key={i} className="bg-[#435663]/50 border border-[#435663] rounded-xl p-4 text-center">
              <span className="text-xl mb-1 block">{stat.icon}</span>
              <p className="text-xl font-bold text-[#FFF8D4]">{stat.value}</p>
              <p className="text-[#FFF8D4]/50 text-sm">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-[#435663]/30 border border-[#435663] rounded-2xl p-6 mb-8"
        >
          {/* Search */}
          <div className="relative mb-6">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#FFF8D4]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search assets by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-[#313647] border border-[#435663] rounded-xl text-[#FFF8D4] placeholder-[#FFF8D4]/40 focus:outline-none focus:border-[#A3B087] transition-colors"
            />
          </div>

          {/* Category Filter */}
          <div className="mb-6">
            <label className="text-sm text-[#FFF8D4]/60 mb-3 block">Category</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`px-3 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm ${
                    selectedCategory === cat.value
                      ? 'bg-[#A3B087] text-[#313647]'
                      : 'bg-[#435663] text-[#FFF8D4]/60 hover:text-[#FFF8D4] hover:bg-[#435663]/80'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Rarity Filter */}
          <div className="mb-6">
            <label className="text-sm text-[#FFF8D4]/60 mb-3 block">Rarity</label>
            <div className="flex flex-wrap gap-2">
              {rarities.map((rar) => {
                const colorClasses: Record<string, string> = {
                  slate: 'bg-[#435663]',
                  green: 'bg-green-600',
                  blue: 'bg-blue-600',
                  purple: 'bg-purple-600',
                  amber: 'bg-amber-600',
                  red: 'bg-red-600',
                };
                
                return (
                  <button
                    key={rar.value}
                    onClick={() => setSelectedRarity(rar.value)}
                    className={`px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                      selectedRarity === rar.value
                        ? `${colorClasses[rar.color]} text-white`
                        : 'bg-[#435663] text-[#FFF8D4]/60 hover:text-[#FFF8D4] hover:bg-[#435663]/80'
                    }`}
                  >
                    {rar.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sort & Price Range */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm text-[#FFF8D4]/60 mb-2 block">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className="w-full bg-[#313647] border border-[#435663] rounded-lg px-4 py-2.5 text-[#FFF8D4] focus:outline-none focus:border-[#A3B087]"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="text-sm text-[#FFF8D4]/60 mb-2 block">Max Price: {priceRange[1]} ERG</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([0, parseFloat(e.target.value)])}
                className="w-full h-2 bg-[#435663] rounded-lg appearance-none cursor-pointer accent-[#A3B087]"
              />
            </div>
          </div>
        </motion.div>

        {/* Results count */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-between mb-6"
        >
          <p className="text-[#FFF8D4]/60">
            Showing <span className="text-[#FFF8D4] font-semibold">{sortedAssets.length}</span> of {totalAssets} assets
            {searchQuery && <span className="text-[#A3B087]"> matching &quot;{searchQuery}&quot;</span>}
          </p>
          {(selectedCategory !== 'all' || selectedRarity !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedRarity('all');
                setSearchQuery('');
                setPriceRange([0, 1]);
              }}
              className="text-[#A3B087] hover:text-[#8a9a6f] text-sm font-medium"
            >
              Clear all filters
            </button>
          )}
        </motion.div>

        {/* Assets Grid */}
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-80 bg-[#435663] rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : sortedAssets.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-24 bg-[#435663]/30 border border-[#435663] rounded-2xl"
          >
            <span className="text-8xl mb-6 block">🔍</span>
            <h3 className="text-2xl font-bold text-[#FFF8D4] mb-2">No Assets Found</h3>
            <p className="text-[#FFF8D4]/60 mb-6">
              {searchQuery 
                ? `No assets match "${searchQuery}". Try a different search.`
                : 'Try adjusting your filters to find assets.'
              }
            </p>
            <Button onClick={() => { 
              setSelectedCategory('all'); 
              setSelectedRarity('all');
              setSearchQuery('');
              setPriceRange([0, 1]);
            }}>
              Clear Filters
            </Button>
          </motion.div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {sortedAssets.map((asset, index) => (
                <motion.div
                  key={asset.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <AssetCard asset={asset} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Load More (placeholder) */}
        {sortedAssets.length > 0 && sortedAssets.length >= 8 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center mt-12"
          >
            <button className="px-8 py-3 bg-[#435663] hover:bg-[#435663]/80 border border-[#435663] rounded-xl text-[#FFF8D4] font-medium transition-colors">
              Load More Assets
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
