'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWalletStore } from '@/stores/walletStore';
import Button from '@/components/ui/Button';
import ConnectWallet from '@/components/wallet/ConnectWallet';
import Link from 'next/link';
import { UserAsset } from '@/types';

const categoryIcons: Record<string, string> = {
  character: '👤',
  weapon: '⚔️',
  skin: '🎨',
  item: '💎',
  vehicle: '🚀',
  consumable: '🧪',
};

const rarityColors: Record<string, string> = {
  common: 'text-[#FFF8D4]/50 border-[#FFF8D4]/30',
  uncommon: 'text-green-400 border-green-500',
  rare: 'text-blue-400 border-blue-500',
  epic: 'text-purple-400 border-purple-500',
  legendary: 'text-amber-400 border-amber-500',
  mythic: 'text-red-400 border-red-500',
};

type Tab = 'all' | 'redeemable' | 'redeemed' | 'for-sale';

export default function MyAssetsPage() {
  const { isConnected, address, ownedAssets, balance } = useWalletStore();
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [selectedAsset, setSelectedAsset] = useState<UserAsset | null>(null);

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: 'all', label: 'All Assets', count: ownedAssets.length },
    { id: 'redeemable', label: 'Redeemable', count: ownedAssets.filter(a => !a.isRedeemed && a.asset.isRedeemable).length },
    { id: 'redeemed', label: 'Redeemed', count: ownedAssets.filter(a => a.isRedeemed).length },
    { id: 'for-sale', label: 'For Sale', count: 0 },
  ];

  const filteredAssets = ownedAssets.filter(asset => {
    if (activeTab === 'all') return true;
    if (activeTab === 'redeemable') return !asset.isRedeemed && asset.asset.isRedeemable;
    if (activeTab === 'redeemed') return asset.isRedeemed;
    if (activeTab === 'for-sale') return false; // No listing feature yet
    return true;
  });

  const totalValue = ownedAssets.reduce((sum, a) => sum + a.asset.price * a.quantity, 0);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[#313647] flex items-center justify-center py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md px-4"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-[#A3B087]/30 to-[#435663]/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-5xl">🔐</span>
          </div>
          <h1 className="text-3xl font-bold text-[#FFF8D4] mb-4">Connect Your Wallet</h1>
          <p className="text-[#FFF8D4]/60 mb-8">
            Connect your wallet to view your owned ChainCash notes, transaction history, and redeemable game assets.
          </p>
          <div className="flex justify-center">
            <ConnectWallet />
          </div>
          
          {/* Features preview */}
          <div className="mt-12 grid grid-cols-3 gap-4 text-center">
            {[
              { icon: '🎮', label: 'View Assets' },
              { icon: '💱', label: 'Trade Notes' },
              { icon: '🎁', label: 'Redeem Items' },
            ].map((feature, i) => (
              <div key={i} className="p-4 bg-[#435663]/50 rounded-xl border border-[#435663]">
                <span className="text-2xl mb-2 block">{feature.icon}</span>
                <span className="text-[#FFF8D4]/50 text-sm">{feature.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#313647] py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-[#FFF8D4] mb-2">My Assets</h1>
          <p className="text-[#FFF8D4]/60">
            Wallet: <span className="text-[#A3B087] font-mono">{address?.slice(0, 8)}...{address?.slice(-6)}</span>
            <span className="mx-2">•</span>
            <span className="text-[#A3B087]">{balance.toFixed(4)} ERG</span>
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            { label: 'Total Assets', value: ownedAssets.length.toString(), icon: '🎮' },
            { label: 'Total Value', value: `${totalValue.toFixed(4)} ERG`, icon: '💰' },
            { label: 'Redeemable', value: ownedAssets.filter(a => !a.isRedeemed && a.asset.isRedeemable).length.toString(), icon: '🎁' },
            { label: 'Unique Games', value: new Set(ownedAssets.map(a => a.asset.gameId)).size.toString(), icon: '🕹️' },
          ].map((stat, index) => (
            <div key={index} className="bg-[#435663]/30 border border-[#435663] rounded-xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{stat.icon}</span>
                <p className="text-[#FFF8D4]/60 text-sm">{stat.label}</p>
              </div>
              <p className="text-2xl font-bold text-[#FFF8D4]">{stat.value}</p>
            </div>
          ))}
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap gap-2 mb-8"
        >
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
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                activeTab === tab.id ? 'bg-[#8a9a6f]' : 'bg-[#313647]'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </motion.div>

        {/* Assets Grid */}
        {filteredAssets.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center py-24 bg-[#435663]/30 border border-[#435663] rounded-2xl"
          >
            <span className="text-8xl mb-6 block">🎮</span>
            <h2 className="text-2xl font-bold text-[#FFF8D4] mb-4">
              {activeTab === 'all' ? 'No Assets Yet' : `No ${tabs.find(t => t.id === activeTab)?.label}`}
            </h2>
            <p className="text-[#FFF8D4]/60 mb-8 max-w-md mx-auto">
              {activeTab === 'all' 
                ? "You haven't purchased any game assets yet. Browse the marketplace to find unique items from your favorite indie games!"
                : `You don't have any assets in this category yet.`
              }
            </p>
            <Link href="/marketplace">
              <Button size="lg">
                Explore Marketplace
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {filteredAssets.map((userAsset, index) => (
                <motion.div
                  key={`${userAsset.asset.id}-${userAsset.transactionHash}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setSelectedAsset(userAsset)}
                  className={`
                    relative overflow-hidden rounded-2xl bg-[#435663]/30 border border-[#435663] cursor-pointer
                    hover:border-[#A3B087]/50 transition-all duration-300 group
                  `}
                >
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#A3B087]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="relative p-5">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-2xl">{categoryIcons[userAsset.asset.category]}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${rarityColors[userAsset.asset.rarity]} bg-[#313647] border`}>
                        {userAsset.asset.rarity.toUpperCase()}
                      </span>
                    </div>

                    {/* Asset image placeholder */}
                    <div className="w-full h-32 rounded-xl bg-gradient-to-br from-[#A3B087]/20 to-[#435663]/20 mb-4 flex items-center justify-center border border-[#435663]">
                      <span className="text-5xl opacity-60">{categoryIcons[userAsset.asset.category]}</span>
                    </div>

                    {/* Name */}
                    <h3 className="text-[#FFF8D4] font-bold text-lg mb-1">{userAsset.asset.name}</h3>
                    <p className="text-[#FFF8D4]/50 text-sm mb-3">Qty: {userAsset.quantity}</p>

                    {/* Status badges */}
                    <div className="flex gap-2">
                      {userAsset.isRedeemed ? (
                        <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400 border border-green-500/50">
                          ✓ Redeemed
                        </span>
                      ) : userAsset.asset.isRedeemable ? (
                        <span className="px-2 py-1 rounded-full text-xs bg-amber-500/20 text-amber-400 border border-amber-500/50">
                          Ready to Redeem
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs bg-[#435663]/50 text-[#FFF8D4]/60 border border-[#435663]">
                          Pending Launch
                        </span>
                      )}
                    </div>

                    {/* Value */}
                    <div className="mt-4 pt-4 border-t border-[#435663]">
                      <span className="text-[#FFF8D4]/50 text-xs">Current Value</span>
                      <p className="text-[#FFF8D4] font-bold">
                        {userAsset.asset.price} <span className="text-[#A3B087] text-sm">{userAsset.asset.currency}</span>
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Transaction History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-16"
        >
          <h2 className="text-2xl font-bold text-[#FFF8D4] mb-6">Transaction History</h2>
          <div className="bg-[#435663]/30 border border-[#435663] rounded-2xl overflow-hidden">
            {ownedAssets.length === 0 ? (
              <div className="p-8 text-center text-[#FFF8D4]/60">
                <span className="text-4xl mb-4 block">📋</span>
                <p>No transactions yet</p>
              </div>
            ) : (
              <div className="divide-y divide-[#435663]">
                {ownedAssets.slice(0, 10).map((userAsset, index) => (
                  <div key={index} className="p-4 flex items-center justify-between hover:bg-[#435663]/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <span className="text-green-400">↓</span>
                      </div>
                      <div>
                        <p className="text-[#FFF8D4] font-medium">{userAsset.asset.name}</p>
                        <p className="text-[#FFF8D4]/50 text-sm">
                          {new Date(userAsset.purchasedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[#FFF8D4] font-medium">
                        -{userAsset.asset.price} {userAsset.asset.currency}
                      </p>
                      <p className="text-[#FFF8D4]/50 text-sm font-mono">
                        {userAsset.transactionHash.slice(0, 10)}...
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Asset Detail Modal */}
        <AnimatePresence>
          {selectedAsset && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedAsset(null)}
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg bg-[#313647] border border-[#435663] rounded-2xl z-50 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${rarityColors[selectedAsset.asset.rarity]} bg-[#435663] border`}>
                        {selectedAsset.asset.rarity.toUpperCase()}
                      </span>
                    </div>
                    <button
                      onClick={() => setSelectedAsset(null)}
                      className="p-2 hover:bg-[#435663] rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5 text-[#FFF8D4]/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="w-full h-48 rounded-xl bg-gradient-to-br from-[#A3B087]/20 to-[#435663]/20 mb-6 flex items-center justify-center border border-[#435663]">
                    <span className="text-7xl">{categoryIcons[selectedAsset.asset.category]}</span>
                  </div>

                  <h2 className="text-2xl font-bold text-[#FFF8D4] mb-2">{selectedAsset.asset.name}</h2>
                  <p className="text-[#FFF8D4]/60 mb-6">{selectedAsset.asset.description}</p>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-3 bg-[#435663]/50 rounded-lg">
                      <p className="text-[#FFF8D4]/50 text-xs">Purchase Price</p>
                      <p className="text-[#FFF8D4] font-bold">{selectedAsset.asset.price} {selectedAsset.asset.currency}</p>
                    </div>
                    <div className="p-3 bg-[#435663]/50 rounded-lg">
                      <p className="text-[#FFF8D4]/50 text-xs">Quantity Owned</p>
                      <p className="text-[#FFF8D4] font-bold">{selectedAsset.quantity}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {!selectedAsset.isRedeemed && selectedAsset.asset.isRedeemable && (
                      <Button className="w-full" size="lg">
                        🎁 Redeem Asset
                      </Button>
                    )}
                    <Button variant="outline" className="w-full">
                      📤 List for Sale
                    </Button>
                    <Button variant="ghost" className="w-full">
                      🔄 Transfer
                    </Button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
