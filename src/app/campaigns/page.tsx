'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useCampaignStore } from '@/stores/campaignStore';
import { getActiveCampaigns, type ContractCampaign as BlockchainCampaign } from '@/lib/ergo/contractService';

type StatusFilter = 'all' | 'active' | 'funded' | 'ending-soon';
type SortBy = 'popular' | 'newest' | 'ending-soon' | 'most-funded';

export default function CampaignsPage() {
  const { campaigns, fetchCampaigns, isLoading } = useCampaignStore();
  const [blockchainCampaigns, setBlockchainCampaigns] = useState<BlockchainCampaign[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortBy, setSortBy] = useState<SortBy>('popular');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCampaigns();
    
    // Fetch real blockchain campaigns
    const fetchBlockchain = async () => {
      try {
        const bc = await getActiveCampaigns();
        setBlockchainCampaigns(bc);
      } catch (error) {
        console.error('Error fetching blockchain campaigns:', error);
      }
    };
    fetchBlockchain();
  }, [fetchCampaigns]);

  // Filter campaigns
  const filteredCampaigns = campaigns.filter((campaign) => {
    // Status filter
    if (statusFilter === 'active' && campaign.status !== 'active') return false;
    if (statusFilter === 'funded' && campaign.status !== 'funded') return false;
    if (statusFilter === 'ending-soon') {
      const daysLeft = Math.ceil((new Date(campaign.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      if (daysLeft > 7 || daysLeft < 0) return false;
    }
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const developerName = typeof campaign.developer === 'string'
        ? campaign.developer
        : campaign.developer?.username || '';

      return (
        campaign.title.toLowerCase().includes(query) ||
        (campaign.gameTitle?.toLowerCase().includes(query) ?? false) ||
        developerName.toLowerCase().includes(query) ||
        (campaign.tags?.some(tag => tag.toLowerCase().includes(query)) ?? false)
      );
    }
    
    return true;
  });

  // Sort campaigns
  const sortedCampaigns = [...filteredCampaigns].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return b.backers - a.backers;
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'ending-soon':
        return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
      case 'most-funded':
        return (b.currentAmount / b.targetAmount) - (a.currentAmount / a.targetAmount);
      default:
        return 0;
    }
  });

  const statusFilters: { id: StatusFilter; label: string; icon: string }[] = [
    { id: 'all', label: 'All Campaigns', icon: '🎯' },
    { id: 'active', label: 'Active', icon: '🔥' },
    { id: 'ending-soon', label: 'Ending Soon', icon: '⏰' },
    { id: 'funded', label: 'Fully Funded', icon: '✅' },
  ];

  const sortOptions: { id: SortBy; label: string }[] = [
    { id: 'popular', label: 'Most Popular' },
    { id: 'newest', label: 'Newest First' },
    { id: 'ending-soon', label: 'Ending Soon' },
    { id: 'most-funded', label: 'Most Funded' },
  ];

  // Stats
  const totalRaised = campaigns.reduce((sum, c) => sum + c.currentAmount, 0);
  const totalBackers = campaigns.reduce((sum, c) => sum + c.backers, 0);
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length + blockchainCampaigns.length;

  return (
    <div className="min-h-screen bg-[#313647] py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-[#FFF8D4] mb-4">
            Game <span className="text-gradient">Campaigns</span>
          </h1>
          <p className="text-[#FFF8D4]/60 text-lg max-w-2xl mx-auto">
            Discover and support indie game developers. Purchase ChainCash notes to own 
            exclusive in-game assets before launch.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-4 mb-12"
        >
          {[
            { label: 'Active Campaigns', value: activeCampaigns, icon: '🎮' },
            { label: 'Total Raised', value: `${totalRaised.toFixed(1)} ERG`, icon: '💰' },
            { label: 'Total Backers', value: totalBackers.toLocaleString(), icon: '👥' },
          ].map((stat, i) => (
            <motion.div 
              key={i} 
              className="card p-4 text-center"
              whileHover={{ scale: 1.02, y: -2 }}
            >
              <span className="text-2xl mb-2 block">{stat.icon}</span>
              <p className="text-2xl font-bold text-[#A3B087]">{stat.value}</p>
              <p className="text-[#FFF8D4]/50 text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="card p-6 mb-8"
        >
          {/* Search */}
          <div className="relative mb-6">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#FFF8D4]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search campaigns, games, developers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-[#435663] border border-[#435663] rounded-xl text-[#FFF8D4] placeholder-[#FFF8D4]/40 focus:outline-none focus:border-[#A3B087] transition-colors"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {statusFilters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setStatusFilter(filter.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                    statusFilter === filter.id
                      ? 'bg-[#A3B087] text-[#313647]'
                      : 'bg-[#435663] text-[#FFF8D4]/60 hover:text-[#FFF8D4] hover:bg-[#435663]/80'
                  }`}
                >
                  <span>{filter.icon}</span>
                  <span className="hidden sm:inline">{filter.label}</span>
                </button>
              ))}
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <span className="text-[#FFF8D4]/50 text-sm">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className="bg-[#435663] border border-[#435663] rounded-lg px-3 py-2 text-[#FFF8D4] focus:outline-none focus:border-[#A3B087]"
              >
                {sortOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Results Count */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <p className="text-[#FFF8D4]/50">
            Showing <span className="text-[#FFF8D4] font-medium">{sortedCampaigns.length}</span> campaigns
            {searchQuery && <span> matching &quot;{searchQuery}&quot;</span>}
          </p>
        </motion.div>

        {/* Campaigns Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-96 card skeleton" />
            ))}
          </div>
        ) : sortedCampaigns.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-24 card"
          >
            <span className="text-8xl mb-6 block">🔍</span>
            <h3 className="text-2xl font-bold text-[#FFF8D4] mb-2">No Campaigns Found</h3>
            <p className="text-[#FFF8D4]/60 mb-6">
              {searchQuery 
                ? `No campaigns match "${searchQuery}". Try a different search term.`
                : 'No campaigns match your current filters.'
              }
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
              }}
              className="btn-primary"
            >
              Clear Filters
            </button>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedCampaigns.map((campaign, index) => (
              <motion.div
                key={campaign.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
              >
                <Link href={`/campaign/${campaign.id}`}>
                  <div className="card overflow-hidden group cursor-pointer h-full">
                    {/* Image */}
                    <div className="h-48 bg-[#435663] relative overflow-hidden">
                      {campaign.imagePath ? (
                        <img 
                          src={campaign.imagePath} 
                          alt={campaign.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-6xl">
                          🎮
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#313647] to-transparent" />
                      
                      {/* Status Badge */}
                      <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium border ${
                        campaign.status === 'active' 
                          ? 'bg-[#A3B087]/20 text-[#A3B087] border-[#A3B087]/30'
                          : campaign.status === 'funded'
                          ? 'bg-[#FFF8D4]/20 text-[#FFF8D4] border-[#FFF8D4]/30'
                          : 'bg-[#435663]/50 text-[#FFF8D4]/60 border-[#435663]'
                      }`}>
                        {campaign.status === 'active' ? '🔥 Active' : 
                         campaign.status === 'funded' ? '✅ Funded' : 'Ended'}
                      </span>
                      
                      {/* Category Badge */}
                      <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-[#313647]/80 backdrop-blur text-[#FFF8D4]/80 text-xs font-medium">
                        {campaign.tags?.[0] || 'Game'}
                      </span>
                    </div>
                    
                    {/* Content */}
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-[#FFF8D4] mb-1 group-hover:text-[#A3B087] transition-colors">
                        {campaign.title}
                      </h3>
                      <p className="text-[#FFF8D4]/50 text-sm mb-1">
                        by {typeof campaign.developer === 'string' ? campaign.developer : campaign.developer?.username || 'Unknown'}
                      </p>
                      <p className="text-[#FFF8D4]/60 text-sm mb-4 line-clamp-2">
                        {campaign.description}
                      </p>
                      
                      {/* Progress */}
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-[#A3B087] font-medium">
                            {campaign.currentAmount} ERG
                          </span>
                          <span className="text-[#FFF8D4]/40">
                            {Math.round((campaign.currentAmount / campaign.targetAmount) * 100)}%
                          </span>
                        </div>
                        <div className="h-2 bg-[#435663] rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${Math.min((campaign.currentAmount / campaign.targetAmount) * 100, 100)}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className="h-full bg-gradient-to-r from-[#A3B087] to-[#8a9a6f] rounded-full"
                          />
                        </div>
                      </div>
                      
                      {/* Stats */}
                      <div className="flex items-center justify-between text-xs text-[#FFF8D4]/50">
                        <span className="flex items-center gap-1">
                          <span>👥</span>
                          {campaign.backers} backers
                        </span>
                        <span className="flex items-center gap-1">
                          <span>⏰</span>
                          {Math.max(0, Math.ceil((new Date(campaign.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} days left
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* Load More (placeholder) */}
        {sortedCampaigns.length > 0 && sortedCampaigns.length >= 6 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center mt-12"
          >
            <button className="btn-secondary px-8 py-3">
              Load More Campaigns
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
