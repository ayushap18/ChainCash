'use client';

import { useEffect, use, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useCampaignStore } from '@/stores/campaignStore';
import AssetCard from '@/components/ui/AssetCard';
import Button from '@/components/ui/Button';
import Link from 'next/link';

// Dynamically import 3D components
const Scene3D = dynamic(() => import('@/components/3d/Scene3D'), { ssr: false });
const MarketplaceScene = dynamic(() => import('@/components/3d/MarketplaceScene'), { ssr: false });

interface CampaignPageProps {
  params: Promise<{ id: string }>;
}

type Tab = 'assets' | 'about' | 'milestones' | 'updates';

export default function CampaignPage({ params }: CampaignPageProps) {
  const { id } = use(params);
  const { campaigns, selectedCampaign, selectCampaign, fetchCampaigns } = useCampaignStore();
  const [activeTab, setActiveTab] = useState<Tab>('assets');
  const [show3D, setShow3D] = useState(true);

  useEffect(() => {
    if (campaigns.length === 0) {
      fetchCampaigns();
    }
  }, [campaigns.length, fetchCampaigns]);

  useEffect(() => {
    if (campaigns.length > 0 && id) {
      selectCampaign(id);
    }
  }, [campaigns, id, selectCampaign]);

  if (!selectedCampaign) {
    return (
      <div className="min-h-screen bg-[#313647] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#A3B087] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#FFF8D4]/60">Loading campaign...</p>
        </div>
      </div>
    );
  }

  const progress = (selectedCampaign.currentAmount / selectedCampaign.targetAmount) * 100;
  const daysLeft = Math.ceil(
    (new Date(selectedCampaign.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'assets', label: 'Assets', count: selectedCampaign.assets.length },
    { id: 'about', label: 'About' },
    { id: 'milestones', label: 'Milestones', count: selectedCampaign.milestones?.length || 0 },
    { id: 'updates', label: 'Updates', count: selectedCampaign.updates?.length || 0 },
  ];

  return (
    <div className="min-h-screen bg-[#313647]">
      {/* 3D Scene Header */}
      {show3D && (
        <section className="relative h-[50vh]">
          <div className="absolute inset-0">
            <Scene3D cameraPosition={[0, 3, 10]} environmentPreset="city">
              <MarketplaceScene
                assets={selectedCampaign.assets.slice(0, 6)}
                currentAmount={selectedCampaign.currentAmount}
                targetAmount={selectedCampaign.targetAmount}
              />
            </Scene3D>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#313647] via-[#313647]/50 to-transparent" />
          
          {/* Controls */}
          <div className="absolute top-8 left-8 z-20 flex gap-2">
            <Link href="/campaigns">
              <Button variant="ghost" size="sm">
                ← Back
              </Button>
            </Link>
          </div>
          <div className="absolute top-8 right-8 z-20">
            <button
              onClick={() => setShow3D(false)}
              className="px-3 py-2 bg-[#313647]/80 hover:bg-[#435663] rounded-lg text-[#FFF8D4]/60 hover:text-[#FFF8D4] text-sm transition-colors"
            >
              Hide 3D
            </button>
          </div>
        </section>
      )}

      {/* Campaign Content */}
      <section className={`relative ${show3D ? '-mt-24' : 'pt-24'} z-10 pb-24`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Campaign Header Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#435663]/30 border border-[#435663] rounded-2xl p-8 mb-8"
              >
                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-[#A3B087] font-medium">{selectedCampaign.developer}</span>
                      {selectedCampaign.website && (
                        <a href={selectedCampaign.website} target="_blank" rel="noopener noreferrer" className="text-[#FFF8D4]/40 hover:text-[#FFF8D4] transition-colors">
                          🔗
                        </a>
                      )}
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-[#FFF8D4] mb-2">
                      {selectedCampaign.title}
                    </h1>
                    <p className="text-[#FFF8D4]/60">{selectedCampaign.gameTitle}</p>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    selectedCampaign.status === 'active'
                      ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                      : selectedCampaign.status === 'funded'
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                      : 'bg-[#435663]/50 text-[#FFF8D4]/60 border border-[#435663]'
                  }`}>
                    {selectedCampaign.status.toUpperCase()}
                  </span>
                </div>

                {/* Tags */}
                {selectedCampaign.tags && selectedCampaign.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {selectedCampaign.tags.map((tag) => (
                      <span key={tag} className="px-3 py-1 bg-[#435663] text-[#FFF8D4]/60 rounded-full text-sm">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Progress */}
                <div className="mb-8">
                  <div className="flex justify-between mb-3">
                    <span className="text-3xl font-bold text-[#FFF8D4]">
                      {selectedCampaign.currentAmount} {selectedCampaign.currency}
                    </span>
                    <span className="text-[#FFF8D4]/60 text-lg">
                      of {selectedCampaign.targetAmount} {selectedCampaign.currency}
                    </span>
                  </div>
                  <div className="h-4 bg-[#435663] rounded-full overflow-hidden mb-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(progress, 100)}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-[#A3B087] to-[#8a9a6f]"
                    />
                  </div>
                  <p className="text-[#FFF8D4]/50 text-sm">
                    {progress.toFixed(1)}% funded
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-[#435663]/50 rounded-xl text-center">
                    <p className="text-2xl font-bold text-[#FFF8D4]">{selectedCampaign.backers.toLocaleString()}</p>
                    <p className="text-[#FFF8D4]/60 text-sm">Backers</p>
                  </div>
                  <div className="p-4 bg-[#435663]/50 rounded-xl text-center">
                    <p className="text-2xl font-bold text-[#FFF8D4]">{daysLeft > 0 ? daysLeft : 0}</p>
                    <p className="text-[#FFF8D4]/60 text-sm">Days Left</p>
                  </div>
                  <div className="p-4 bg-[#435663]/50 rounded-xl text-center">
                    <p className="text-2xl font-bold text-[#FFF8D4]">{selectedCampaign.assets.length}</p>
                    <p className="text-[#FFF8D4]/60 text-sm">Assets</p>
                  </div>
                  <div className="p-4 bg-[#435663]/50 rounded-xl text-center">
                    <p className="text-2xl font-bold text-[#FFF8D4]">
                      {selectedCampaign.launchDate ? new Date(selectedCampaign.launchDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'TBA'}
                    </p>
                    <p className="text-[#FFF8D4]/60 text-sm">Est. Launch</p>
                  </div>
                </div>
              </motion.div>

              {/* Tabs */}
              <div className="flex flex-wrap gap-2 mb-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                      activeTab === tab.id
                        ? 'bg-[#A3B087] text-[#313647]'
                        : 'bg-[#435663] text-[#FFF8D4]/60 hover:text-[#FFF8D4] hover:bg-[#435663]/80'
                    }`}
                  >
                    {tab.label}
                    {tab.count !== undefined && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        activeTab === tab.id ? 'bg-[#8a9a6f]' : 'bg-[#313647]'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <AnimatePresence mode="wait">
                {activeTab === 'assets' && (
                  <motion.div
                    key="assets"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="grid sm:grid-cols-2 gap-6"
                  >
                    {selectedCampaign.assets.map((asset, index) => (
                      <motion.div
                        key={asset.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 * index }}
                      >
                        <AssetCard asset={asset} />
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                {activeTab === 'about' && (
                  <motion.div
                    key="about"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-[#435663]/30 border border-[#435663] rounded-2xl p-8"
                  >
                    <h2 className="text-2xl font-bold text-[#FFF8D4] mb-6">About This Campaign</h2>
                    <div className="prose prose-invert max-w-none">
                      <p className="text-[#FFF8D4]/80 text-lg mb-6">{selectedCampaign.description}</p>
                      {selectedCampaign.longDescription && (
                        <div className="text-[#FFF8D4]/60 whitespace-pre-line">
                          {selectedCampaign.longDescription}
                        </div>
                      )}
                    </div>

                    {/* Social Links */}
                    {(selectedCampaign.twitter || selectedCampaign.discord || selectedCampaign.website) && (
                      <div className="mt-8 pt-8 border-t border-[#435663]">
                        <h3 className="text-lg font-semibold text-[#FFF8D4] mb-4">Connect</h3>
                        <div className="flex flex-wrap gap-3">
                          {selectedCampaign.website && (
                            <a href={selectedCampaign.website} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-[#435663] hover:bg-[#435663]/80 rounded-lg text-[#FFF8D4]/80 transition-colors flex items-center gap-2">
                              🌐 Website
                            </a>
                          )}
                          {selectedCampaign.twitter && (
                            <a href={`https://twitter.com/${selectedCampaign.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-[#435663] hover:bg-[#435663]/80 rounded-lg text-[#FFF8D4]/80 transition-colors flex items-center gap-2">
                              🐦 Twitter
                            </a>
                          )}
                          {selectedCampaign.discord && (
                            <a href={`https://${selectedCampaign.discord}`} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-[#435663] hover:bg-[#435663]/80 rounded-lg text-[#FFF8D4]/80 transition-colors flex items-center gap-2">
                              💬 Discord
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'milestones' && (
                  <motion.div
                    key="milestones"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    {selectedCampaign.milestones && selectedCampaign.milestones.length > 0 ? (
                      selectedCampaign.milestones.map((milestone, index) => (
                        <div
                          key={milestone.id}
                          className={`p-6 rounded-2xl border ${
                            milestone.isReached
                              ? 'bg-green-500/10 border-green-500/50'
                              : selectedCampaign.currentAmount >= milestone.targetAmount
                              ? 'bg-amber-500/10 border-amber-500/50'
                              : 'bg-[#435663]/30 border-[#435663]'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                                milestone.isReached
                                  ? 'bg-green-500 text-white'
                                  : 'bg-[#435663] text-[#FFF8D4]/60'
                              }`}>
                                {milestone.isReached ? '✓' : index + 1}
                              </div>
                              <div>
                                <h3 className="text-lg font-bold text-[#FFF8D4]">{milestone.title}</h3>
                                <p className="text-[#FFF8D4]/60 mt-1">{milestone.description}</p>
                                {milestone.reward && (
                                  <p className="text-[#A3B087] text-sm mt-2">🎁 {milestone.reward}</p>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-[#FFF8D4]">{milestone.targetAmount} {selectedCampaign.currency}</p>
                              {milestone.isReached && milestone.reachedAt && (
                                <p className="text-green-400 text-sm mt-1">
                                  Reached {new Date(milestone.reachedAt).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 bg-[#435663]/30 border border-[#435663] rounded-2xl">
                        <span className="text-4xl mb-4 block">📋</span>
                        <p className="text-[#FFF8D4]/60">No milestones set for this campaign</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'updates' && (
                  <motion.div
                    key="updates"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    {selectedCampaign.updates && selectedCampaign.updates.length > 0 ? (
                      selectedCampaign.updates.map((update) => (
                        <div key={update.id} className="p-6 bg-[#435663]/30 border border-[#435663] rounded-2xl">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-[#FFF8D4]">{update.title}</h3>
                            <span className="text-[#FFF8D4]/50 text-sm">{new Date(update.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-[#FFF8D4]/60">{update.content}</p>
                          <p className="text-[#A3B087] text-sm mt-4">— {update.author}</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 bg-[#435663]/30 border border-[#435663] rounded-2xl">
                        <span className="text-4xl mb-4 block">📰</span>
                        <p className="text-[#FFF8D4]/60">No updates yet. Check back soon!</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="sticky top-24 space-y-6"
              >
                {/* Quick Actions */}
                <div className="bg-[#435663]/30 border border-[#435663] rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-[#FFF8D4] mb-4">Support This Campaign</h3>
                  <p className="text-[#FFF8D4]/60 text-sm mb-6">
                    Purchase ChainCash notes to support {selectedCampaign.developer} and claim exclusive in-game assets.
                  </p>
                  
                  <div className="space-y-3">
                    <Link href="#" onClick={() => setActiveTab('assets')}>
                      <Button className="w-full" size="lg">
                        🎮 Browse Assets
                      </Button>
                    </Link>
                    <Button variant="outline" className="w-full">
                      📤 Share Campaign
                    </Button>
                  </div>
                </div>

                {/* Developer Info */}
                <div className="bg-[#435663]/30 border border-[#435663] rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-[#FFF8D4] mb-4">Developer</h3>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#A3B087] to-[#8a9a6f] rounded-full flex items-center justify-center text-[#313647] font-bold text-lg">
                      {selectedCampaign.developer.charAt(0)}
                    </div>
                    <div>
                      <p className="text-[#FFF8D4] font-medium">{selectedCampaign.developer}</p>
                      <p className="text-[#FFF8D4]/50 text-sm">Game Developer</p>
                    </div>
                  </div>
                  <p className="text-[#FFF8D4]/60 text-sm">
                    Creating {selectedCampaign.gameTitle} — an exciting new indie game coming soon.
                  </p>
                </div>

                {/* ChainCash Info */}
                <div className="bg-gradient-to-br from-[#A3B087]/20 to-[#435663]/30 border border-[#A3B087]/30 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-[#FFF8D4] mb-3">💎 ChainCash Protected</h3>
                  <p className="text-[#FFF8D4]/80 text-sm mb-4">
                    All assets from this campaign are backed by ChainCash notes. Your purchase is secured on the blockchain.
                  </p>
                  <Link href="/how-it-works">
                    <span className="text-[#A3B087] hover:text-[#8a9a6f] text-sm font-medium cursor-pointer">
                      Learn more →
                    </span>
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
