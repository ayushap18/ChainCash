'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useCampaignStore } from '@/stores/campaignStore';
import { useNautilusWallet } from '@/hooks/useNautilusWallet';
import { getActiveCampaigns, type ContractCampaign } from '@/lib/ergo/contractService';
import Scene3D from '@/components/3d/Scene3D';
import MarketplaceScene from '@/components/3d/MarketplaceScene';
import { GameAsset } from '@/types';

// Stats from Ergo blockchain (will be fetched dynamically)
interface BlockchainStats {
  activeCampaigns: number;
  totalRaised: string;
  totalBackers: number;
  successRate: number;
}

// Mock assets for the 3D hero scene
const HERO_ASSETS: GameAsset[] = [
  {
    id: 'hero-1',
    name: 'Cyber Blade',
    description: 'Legendary plasma sword',
    price: 15,
    rarity: 'legendary',
    category: 'weapon',
    soldCount: 5,
    totalSupply: 10,
    campaignId: '1',
    gameId: 'game1'
  },
  {
    id: 'hero-2',
    name: 'Void Walker',
    description: 'Stealth suit for space exploration',
    price: 25,
    rarity: 'epic',
    category: 'skin',
    soldCount: 12,
    totalSupply: 50,
    campaignId: '1',
    gameId: 'game1'
  },
  {
    id: 'hero-3',
    name: 'Nebula Core',
    description: 'Rare energy source',
    price: 5,
    rarity: 'rare',
    category: 'item',
    soldCount: 88,
    totalSupply: 100,
    campaignId: '1',
    gameId: 'game1'
  },
  {
    id: 'hero-4',
    name: 'Star Fighter',
    description: 'Fast interceptor ship',
    price: 100,
    rarity: 'mythic' as any, // Cast to any as mythic wasn't in my simple types, or I should update types
    category: 'vehicle',
    soldCount: 2,
    totalSupply: 5,
    campaignId: '1',
    gameId: 'game1'
  }
];

export default function HomePage() {
  const { campaigns, fetchCampaigns, isLoading } = useCampaignStore();
  const { isConnected, connect, address, ergBalanceFormatted } = useNautilusWallet();
  const [stats, setStats] = useState<BlockchainStats>({
    activeCampaigns: 0,
    totalRaised: '0',
    totalBackers: 0,
    successRate: 0
  });
  const [liveCampaigns, setLiveCampaigns] = useState<ContractCampaign[]>([]);

  useEffect(() => {
    fetchCampaigns();
    
    // Fetch real blockchain data with error handling
    const fetchBlockchainData = async () => {
      try {
        // Wrap in try-catch to prevent app crash if API is down
        let activeCampaigns: ContractCampaign[] = [];
        try {
            activeCampaigns = await getActiveCampaigns();
        } catch (e) {
            console.warn("Failed to fetch active campaigns from blockchain, using mocks if available", e);
        }

        setLiveCampaigns(activeCampaigns);
        
        // Calculate stats from real data (or default to 0)
        const totalRaisedBigInt = activeCampaigns.reduce(
          (acc, c) => acc + c.currentFunding, 
          BigInt(0)
        );
        const totalRaisedErg = Number(totalRaisedBigInt) / 1_000_000_000;
        
        setStats({
          activeCampaigns: activeCampaigns.length + campaigns.length,
          totalRaised: totalRaisedErg.toFixed(2),
          totalBackers: Math.floor(Math.random() * 500) + 100, // Mock for now
          successRate: 85
        });
      } catch (error) {
        console.error('Error in blockchain data flow:', error);
      }
    };
    
    fetchBlockchainData();
  }, [fetchCampaigns, campaigns.length]);

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      {/* Hero Section with 3D Scene */}
      <section className="relative h-screen flex flex-col overflow-hidden">
        {/* 3D Background */}
        <div className="absolute inset-0 z-0">
          <Scene3D cameraPosition={[0, 3, 10]} environmentPreset="city">
            <MarketplaceScene assets={HERO_ASSETS} currentAmount={65} targetAmount={100} />
          </Scene3D>
        </div>

        {/* Overlay Gradient for readability */}
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-[#0f172a] via-[#0f172a]/80 to-transparent pointer-events-none" />

        {/* Hero Content */}
        <div className="relative z-10 flex-1 flex items-center pointer-events-none">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="pointer-events-auto"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/20 border border-violet-500/30 mb-6 backdrop-blur-sm"
                >
                  <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                  <span className="text-violet-300 text-sm font-medium">Powered by Ergo Blockchain</span>
                </motion.div>

                <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                  <span className="text-white">Fund Games.</span>
                  <br />
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-fuchsia-400">
                    Own the Future.
                  </span>
                </h1>
                
                <p className="text-xl text-gray-300 mb-8 max-w-xl">
                  ChainCash revolutionizes game crowdfunding with tokenized IOUs.
                  Back projects, earn NFT badges, and trade your contributions on the marketplace.
                </p>

                <div className="flex flex-wrap gap-4 mb-8">
                  {!isConnected ? (
                    <button 
                      onClick={connect}
                      className="bg-violet-600 hover:bg-violet-700 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-lg shadow-violet-500/20 flex items-center gap-2"
                    >
                      <span>🦈</span>
                      Connect Nautilus
                    </button>
                  ) : (
                    <Link href="/dashboard">
                      <button className="bg-violet-600 hover:bg-violet-700 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-lg shadow-violet-500/20">
                        Go to Dashboard
                      </button>
                    </Link>
                  )}
                  <Link href="/campaigns">
                    <button className="bg-gray-800 hover:bg-gray-700 text-white font-semibold py-4 px-8 rounded-xl border border-gray-700 transition-all backdrop-blur-sm">
                      Explore Campaigns
                    </button>
                  </Link>
                </div>

                {/* Wallet Info */}
                {isConnected && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-900/80 backdrop-blur border border-gray-800 rounded-xl p-4 inline-flex items-center gap-4"
                  >
                    <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center">
                      <span>💎</span>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Connected Wallet</p>
                      <p className="text-white font-mono">
                        {address?.slice(0, 8)}...{address?.slice(-6)}
                      </p>
                    </div>
                    <div className="pl-4 border-l border-gray-700">
                      <p className="text-gray-400 text-sm">Balance</p>
                      <p className="text-violet-400 font-bold">{ergBalanceFormatted || '0.00'} ERG</p>
                    </div>
                  </motion.div>
                )}
              </motion.div>

              {/* Right Side - Interactable Area Hint */}
              <div className="hidden lg:flex justify-end pointer-events-none">
                 <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="bg-black/40 backdrop-blur px-4 py-2 rounded-lg text-sm text-gray-400 border border-white/10"
                 >
                    Try dragging to rotate the view ↻
                 </motion.div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="flex flex-col items-center gap-2 text-gray-400"
          >
            <span className="text-sm">Scroll to explore</span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.div>
        </motion.div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              How ChainCash Works
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              A revolutionary approach to game crowdfunding using Ergo blockchain
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                icon: '🔗',
                title: 'Connect Wallet',
                description: 'Link your Nautilus wallet to access the Ergo blockchain securely.',
              },
              {
                step: '02',
                icon: '🎮',
                title: 'Browse Campaigns',
                description: 'Explore indie game projects seeking funding with unique rewards.',
              },
              {
                step: '03',
                icon: '💎',
                title: 'Back & Earn NFTs',
                description: 'Pledge ERG to campaigns and receive NFT badges as proof of support.',
              },
              {
                step: '04',
                icon: '🎁',
                title: 'Redeem Rewards',
                description: 'Use your tokens for in-game items when the game launches.',
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative group"
              >
                {/* Connector Line */}
                {index < 3 && (
                  <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-violet-500/50 to-transparent z-0" />
                )}
                
                <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 relative z-10 h-full hover:border-violet-500/50 transition-colors duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-violet-400 font-bold text-sm bg-violet-400/10 px-2 py-1 rounded">{feature.step}</span>
                    <span className="text-4xl">{feature.icon}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-violet-300 transition-colors">{feature.title}</h3>
                  <p className="text-gray-400 text-sm">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Active Campaigns Section */}
      <section className="py-24 bg-[#0f172a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-4"
          >
            <div>
              <h2 className="text-4xl font-bold text-white mb-2">
                Active Campaigns
              </h2>
              <p className="text-gray-400">
                Support indie developers and earn exclusive rewards
              </p>
            </div>
            <Link href="/campaigns">
              <button className="text-violet-400 hover:text-violet-300 font-medium flex items-center gap-2">
                View All Campaigns <span aria-hidden="true">→</span>
              </button>
            </Link>
          </motion.div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-80 bg-gray-800 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.slice(0, 6).map((campaign, index) => (
                <motion.div
                  key={campaign.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link href={`/campaign/${campaign.id}`}>
                    <div className="bg-gray-800 rounded-2xl overflow-hidden group cursor-pointer border border-gray-700 hover:border-violet-500/50 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-500/10">
                      {/* Image */}
                      <div className="h-48 bg-gray-700 relative overflow-hidden">
                        {campaign.imagePath ? (
                          <img 
                            src={campaign.imagePath} 
                            alt={campaign.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-6xl bg-gradient-to-br from-gray-700 to-gray-600">
                            🎮
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-60" />
                        
                        {/* Category Badge */}
                        <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/40 backdrop-blur text-white text-xs font-medium border border-white/10">
                          {campaign.tags?.[0] || 'Game'}
                        </span>
                      </div>
                      
                      {/* Content */}
                      <div className="p-5">
                        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-violet-400 transition-colors">
                          {campaign.title}
                        </h3>
                        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                          {campaign.description}
                        </p>
                        
                        {/* Progress */}
                        <div className="mb-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-violet-400 font-medium">
                              {campaign.currentAmount} ERG
                            </span>
                            <span className="text-gray-500">
                              {campaign.targetAmount} ERG goal
                            </span>
                          </div>
                          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              whileInView={{ width: `${Math.min((campaign.currentAmount / campaign.targetAmount) * 100, 100)}%` }}
                              viewport={{ once: true }}
                              transition={{ duration: 1, delay: 0.2 }}
                              className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full"
                            />
                          </div>
                        </div>
                        
                        {/* Stats */}
                        <div className="flex items-center gap-4 text-xs text-gray-500">
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
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-violet-900/20"></div>
         {/* Background Elements */}
         <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block px-4 py-2 rounded-full bg-violet-500/10 text-violet-400 text-sm font-medium mb-6 border border-violet-500/20">
              🚀 Start Your Journey
            </span>
            
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Support Indie Games?
            </h2>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Join ChainCash and help bring amazing indie games to life 
              while earning exclusive NFT rewards.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              {!isConnected ? (
                <button 
                  onClick={connect}
                  className="bg-white text-gray-900 hover:bg-gray-100 font-bold py-4 px-8 rounded-xl transition-all shadow-lg flex items-center gap-2"
                >
                  Connect Wallet to Start
                </button>
              ) : (
                <Link href="/dashboard">
                  <button className="bg-white text-gray-900 hover:bg-gray-100 font-bold py-4 px-8 rounded-xl transition-all shadow-lg">
                    Create a Campaign
                  </button>
                </Link>
              )}
              <Link href="/how-it-works">
                <button className="bg-transparent hover:bg-white/5 text-white font-semibold py-4 px-8 rounded-xl border border-white/20 transition-all">
                  Learn More
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-black border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {/* Logo */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">⛓️</span>
                </div>
                <span className="text-white font-bold text-xl">
                  Chain<span className="text-violet-400">Cash</span>
                </span>
              </div>
              <p className="text-gray-500 text-sm">
                Revolutionizing game crowdfunding with blockchain technology.
              </p>
            </div>
            
            {/* Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">Platform</h4>
              <ul className="space-y-2">
                {['Campaigns', 'Marketplace', 'Dashboard', 'How It Works'].map((link) => (
                  <li key={link}>
                    <Link 
                      href={`/${link.toLowerCase().replace(' ', '-')}`}
                      className="text-gray-500 hover:text-violet-400 transition text-sm"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <ul className="space-y-2">
                {['Documentation', 'API', 'Smart Contracts', 'GitHub'].map((link) => (
                  <li key={link}>
                    <span className="text-gray-500 hover:text-violet-400 transition text-sm cursor-pointer">
                      {link}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-600 text-sm">
              © 2025 ChainCash Crowdfunding. Built for the Ergo ecosystem.
            </p>
            <div className="flex items-center gap-4 text-gray-600 text-sm">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
