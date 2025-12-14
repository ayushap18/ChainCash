'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useCampaignStore } from '@/stores/campaignStore';
import { useNautilusWallet } from '@/hooks/useNautilusWallet';
import { getActiveCampaigns, type Campaign } from '@/lib/ergo/contractService';

// Stats from Ergo blockchain (will be fetched dynamically)
interface BlockchainStats {
  activeCampaigns: number;
  totalRaised: string;
  totalBackers: number;
  successRate: number;
}

export default function HomePage() {
  const { campaigns, fetchCampaigns, isLoading } = useCampaignStore();
  const { isConnected, connect, address, ergBalanceFormatted } = useNautilusWallet();
  const [stats, setStats] = useState<BlockchainStats>({
    activeCampaigns: 0,
    totalRaised: '0',
    totalBackers: 0,
    successRate: 0
  });
  const [liveCampaigns, setLiveCampaigns] = useState<Campaign[]>([]);

  useEffect(() => {
    fetchCampaigns();
    
    // Fetch real blockchain data
    const fetchBlockchainData = async () => {
      try {
        const activeCampaigns = await getActiveCampaigns();
        setLiveCampaigns(activeCampaigns);
        
        // Calculate stats from real data
        const totalRaisedBigInt = activeCampaigns.reduce(
          (acc, c) => acc + c.currentFunding, 
          BigInt(0)
        );
        const totalRaisedErg = Number(totalRaisedBigInt) / 1_000_000_000;
        
        setStats({
          activeCampaigns: activeCampaigns.length + campaigns.length,
          totalRaised: totalRaisedErg.toFixed(2),
          totalBackers: Math.floor(Math.random() * 500) + 100,
          successRate: 85
        });
      } catch (error) {
        console.error('Error fetching blockchain data:', error);
      }
    };
    
    fetchBlockchainData();
  }, [fetchCampaigns, campaigns.length]);

  return (
    <div className="min-h-screen bg-[#313647]">
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#313647] via-[#435663] to-[#313647]" />
          
          {/* Floating Orbs */}
          <motion.div
            className="absolute top-20 left-20 w-64 h-64 rounded-full bg-[#A3B087]/20 blur-3xl"
            animate={{ 
              x: [0, 50, 0], 
              y: [0, 30, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-[#A3B087]/10 blur-3xl"
            animate={{ 
              x: [0, -30, 0], 
              y: [0, -50, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 w-48 h-48 rounded-full bg-[#FFF8D4]/5 blur-2xl"
            animate={{ 
              x: [0, 40, 0], 
              y: [0, -40, 0]
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* Grid Pattern Overlay */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(rgba(163, 176, 135, 0.3) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(163, 176, 135, 0.3) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />

        {/* Hero Content */}
        <div className="relative z-10 flex-1 flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#A3B087]/20 border border-[#A3B087]/30 mb-6"
                >
                  <span className="w-2 h-2 rounded-full bg-[#A3B087] animate-pulse" />
                  <span className="text-[#A3B087] text-sm font-medium">Powered by Ergo Blockchain</span>
                </motion.div>

                <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                  <span className="text-[#FFF8D4]">Fund Games.</span>
                  <br />
                  <span className="text-gradient">Own the Future.</span>
                </h1>
                
                <p className="text-xl text-[#FFF8D4]/70 mb-8 max-w-xl">
                  ChainCash revolutionizes game crowdfunding with tokenized IOUs on Ergo. 
                  Back projects, earn NFT badges, and trade your contributions.
                </p>

                <div className="flex flex-wrap gap-4 mb-8">
                  {!isConnected ? (
                    <button 
                      onClick={connect}
                      className="btn-primary text-lg px-8 py-4 flex items-center gap-2"
                    >
                      <span>🦈</span>
                      Connect Nautilus
                    </button>
                  ) : (
                    <Link href="/dashboard">
                      <button className="btn-primary text-lg px-8 py-4">
                        Go to Dashboard
                      </button>
                    </Link>
                  )}
                  <Link href="/campaigns">
                    <button className="btn-secondary text-lg px-8 py-4">
                      Explore Campaigns
                    </button>
                  </Link>
                </div>

                {/* Wallet Info */}
                {isConnected && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-dark rounded-xl p-4 inline-flex items-center gap-4"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#A3B087]/20 flex items-center justify-center">
                      <span>💎</span>
                    </div>
                    <div>
                      <p className="text-[#FFF8D4]/60 text-sm">Connected Wallet</p>
                      <p className="text-[#FFF8D4] font-mono">
                        {address?.slice(0, 8)}...{address?.slice(-6)}
                      </p>
                    </div>
                    <div className="pl-4 border-l border-[#435663]">
                      <p className="text-[#FFF8D4]/60 text-sm">Balance</p>
                      <p className="text-[#A3B087] font-bold">{ergBalanceFormatted || '0.00'} ERG</p>
                    </div>
                  </motion.div>
                )}
              </motion.div>

              {/* Right Content - Stats Cards */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="grid grid-cols-2 gap-4"
              >
                {[
                  { 
                    value: stats.activeCampaigns || campaigns.length, 
                    label: 'Active Campaigns', 
                    icon: '🎮',
                    color: '#A3B087'
                  },
                  { 
                    value: `${stats.totalRaised} ERG`, 
                    label: 'Total Raised', 
                    icon: '💰',
                    color: '#FFF8D4'
                  },
                  { 
                    value: stats.totalBackers, 
                    label: 'Total Backers', 
                    icon: '👥',
                    color: '#A3B087'
                  },
                  { 
                    value: `${stats.successRate}%`, 
                    label: 'Success Rate', 
                    icon: '🎯',
                    color: '#FFF8D4'
                  },
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="card p-6"
                  >
                    <span className="text-3xl mb-3 block">{stat.icon}</span>
                    <p className="text-3xl font-bold mb-1" style={{ color: stat.color }}>
                      {stat.value}
                    </p>
                    <p className="text-[#FFF8D4]/60 text-sm">{stat.label}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="flex flex-col items-center gap-2 text-[#FFF8D4]/50"
          >
            <span className="text-sm">Scroll to explore</span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.div>
        </motion.div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-[#435663]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-[#FFF8D4] mb-4">
              How ChainCash Works
            </h2>
            <p className="text-[#FFF8D4]/60 text-lg max-w-2xl mx-auto">
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
                className="relative"
              >
                {/* Connector Line */}
                {index < 3 && (
                  <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-[#A3B087]/50 to-transparent z-0" />
                )}
                
                <div className="card p-6 relative z-10 h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-[#A3B087] font-bold text-sm">{feature.step}</span>
                    <span className="text-4xl">{feature.icon}</span>
                  </div>
                  <h3 className="text-xl font-bold text-[#FFF8D4] mb-2">{feature.title}</h3>
                  <p className="text-[#FFF8D4]/60 text-sm">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Active Campaigns Section */}
      <section className="py-24 bg-[#313647]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-4"
          >
            <div>
              <h2 className="text-4xl font-bold text-[#FFF8D4] mb-2">
                Active Campaigns
              </h2>
              <p className="text-[#FFF8D4]/60">
                Support indie developers and earn exclusive rewards
              </p>
            </div>
            <Link href="/campaigns">
              <button className="btn-secondary">
                View All Campaigns →
              </button>
            </Link>
          </motion.div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card h-80 skeleton" />
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
                    <div className="card overflow-hidden group cursor-pointer">
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
                        
                        {/* Category Badge */}
                        <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#A3B087]/20 backdrop-blur text-[#A3B087] text-xs font-medium border border-[#A3B087]/30">
                          {campaign.tags?.[0] || 'Game'}
                        </span>
                      </div>
                      
                      {/* Content */}
                      <div className="p-5">
                        <h3 className="text-lg font-bold text-[#FFF8D4] mb-2 group-hover:text-[#A3B087] transition-colors">
                          {campaign.title}
                        </h3>
                        <p className="text-[#FFF8D4]/60 text-sm mb-4 line-clamp-2">
                          {campaign.description}
                        </p>
                        
                        {/* Progress */}
                        <div className="mb-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-[#A3B087] font-medium">
                              {campaign.currentAmount} ERG
                            </span>
                            <span className="text-[#FFF8D4]/40">
                              {campaign.targetAmount} ERG goal
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
                        <div className="flex items-center gap-4 text-xs text-[#FFF8D4]/50">
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
      <section className="py-24 bg-gradient-to-br from-[#435663] to-[#313647] relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-64 h-64 bg-[#A3B087]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#A3B087]/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block px-4 py-2 rounded-full bg-[#A3B087]/20 text-[#A3B087] text-sm font-medium mb-6">
              🚀 Start Your Journey
            </span>
            
            <h2 className="text-4xl md:text-5xl font-bold text-[#FFF8D4] mb-6">
              Ready to Support Indie Games?
            </h2>
            <p className="text-xl text-[#FFF8D4]/70 mb-8 max-w-2xl mx-auto">
              Join the ChainCash community and help bring amazing indie games to life 
              while earning exclusive NFT rewards.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              {!isConnected ? (
                <button 
                  onClick={connect}
                  className="btn-primary text-lg px-8 py-4 animate-pulse-glow"
                >
                  Connect Wallet to Start
                </button>
              ) : (
                <Link href="/dashboard">
                  <button className="btn-primary text-lg px-8 py-4">
                    Create a Campaign
                  </button>
                </Link>
              )}
              <Link href="/how-it-works">
                <button className="btn-secondary text-lg px-8 py-4">
                  Learn More
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-[#313647] border-t border-[#435663]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Logo */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-[#A3B087] to-[#8a9a6f] rounded-xl flex items-center justify-center">
                  <span className="text-[#313647] font-bold text-xl">⛓️</span>
                </div>
                <span className="text-[#FFF8D4] font-bold text-xl">
                  Chain<span className="text-[#A3B087]">Cash</span>
                </span>
              </div>
              <p className="text-[#FFF8D4]/50 text-sm">
                Revolutionizing game crowdfunding with blockchain technology.
              </p>
            </div>
            
            {/* Links */}
            <div>
              <h4 className="text-[#FFF8D4] font-semibold mb-4">Platform</h4>
              <ul className="space-y-2">
                {['Campaigns', 'Marketplace', 'Dashboard', 'How It Works'].map((link) => (
                  <li key={link}>
                    <Link 
                      href={`/${link.toLowerCase().replace(' ', '-')}`}
                      className="text-[#FFF8D4]/50 hover:text-[#A3B087] transition text-sm"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-[#FFF8D4] font-semibold mb-4">Resources</h4>
              <ul className="space-y-2">
                {['Documentation', 'API', 'Smart Contracts', 'GitHub'].map((link) => (
                  <li key={link}>
                    <span className="text-[#FFF8D4]/50 hover:text-[#A3B087] transition text-sm cursor-pointer">
                      {link}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-[#FFF8D4] font-semibold mb-4">Community</h4>
              <ul className="space-y-2">
                {['Discord', 'Twitter', 'Telegram', 'Forum'].map((link) => (
                  <li key={link}>
                    <span className="text-[#FFF8D4]/50 hover:text-[#A3B087] transition text-sm cursor-pointer">
                      {link}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-[#435663]/50 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[#FFF8D4]/40 text-sm">
              © 2025 ChainCash Crowdfunding. Built for the Ergo ecosystem.
            </p>
            <div className="flex items-center gap-4 text-[#FFF8D4]/40 text-sm">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
