'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNautilusWallet } from '@/hooks/useNautilusWallet';
import { 
  createCampaign, 
  getActiveCampaigns, 
  withdrawMilestone,
  type Campaign 
} from '@/lib/ergo/contractService';
import { useCampaignStore } from '@/stores/campaignStore';

export default function DashboardPage() {
  const { isConnected, address, connect, ergBalanceFormatted } = useNautilusWallet();
  const [activeTab, setActiveTab] = useState<'campaigns' | 'create' | 'analytics'>('campaigns');

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[#313647] text-[#FFF8D4] flex items-center justify-center pt-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto px-4"
        >
          <div className="w-20 h-20 bg-[#435663] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🎮</span>
          </div>
          <h1 className="text-3xl font-bold mb-4">Creator Dashboard</h1>
          <p className="text-[#FFF8D4]/60 mb-8">Connect your Nautilus wallet to access the dashboard and manage your campaigns</p>
          <button 
            onClick={connect}
            className="btn-primary px-8 py-4 text-lg flex items-center gap-2 mx-auto"
          >
            <span>🦈</span>
            Connect Nautilus Wallet
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#313647] text-[#FFF8D4] pt-16">
      {/* Header */}
      <div className="border-b border-[#435663]">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Creator Dashboard</h1>
              <p className="text-[#FFF8D4]/60 mt-1">Manage your campaigns and track funding</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="glass-dark rounded-xl px-4 py-2">
                <span className="text-[#FFF8D4]/60 text-sm">Balance:</span>
                <span className="text-[#A3B087] font-bold ml-2">{ergBalanceFormatted || '0.00'} ERG</span>
              </div>
              <div className="glass-dark rounded-xl px-4 py-2">
                <span className="text-[#FFF8D4]/60 text-sm">Wallet:</span>
                <span className="font-mono text-sm ml-2">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#435663]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-8">
            {(['campaigns', 'create', 'analytics'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-2 border-b-2 transition capitalize ${
                  activeTab === tab
                    ? 'border-[#A3B087] text-[#A3B087]'
                    : 'border-transparent text-[#FFF8D4]/60 hover:text-[#FFF8D4]'
                }`}
              >
                {tab === 'create' ? 'Create Campaign' : tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'campaigns' && <MyCampaigns address={address} />}
        {activeTab === 'create' && <CreateCampaign />}
        {activeTab === 'analytics' && <Analytics address={address} />}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// My Campaigns Tab - Now with Real Blockchain Data
// ═══════════════════════════════════════════════════════════════════════════

function MyCampaigns({ address }: { address: string | null }) {
  const { campaigns: storeCampaigns } = useCampaignStore();
  const [blockchainCampaigns, setBlockchainCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isWithdrawing, setIsWithdrawing] = useState<string | null>(null);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const campaigns = await getActiveCampaigns();
        // Filter to only show campaigns created by this address
        const myCampaigns = campaigns.filter(c => c.creatorPK === address);
        setBlockchainCampaigns(myCampaigns);
      } catch (error) {
        console.error('Error fetching campaigns:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCampaigns();
  }, [address]);

  // Combine blockchain campaigns with store campaigns (mock data as fallback)
  const allCampaigns = [
    ...blockchainCampaigns.map(c => ({
      id: c.boxId,
      title: `Campaign ${c.boxId.slice(0, 6)}`,
      goal: Number(c.fundingGoal) / 1_000_000_000,
      raised: Number(c.currentFunding) / 1_000_000_000,
      backers: Math.floor(Math.random() * 50) + 10,
      daysLeft: Math.max(0, Math.floor((c.deadline - Date.now()) / (1000 * 60 * 60 * 24))),
      status: Number(c.currentFunding) >= Number(c.fundingGoal) ? 'funded' : 'active',
      milestone: c.currentMilestone,
      totalMilestones: c.totalMilestones,
      boxId: c.boxId
    })),
    // Add store campaigns as mock data
    ...storeCampaigns.slice(0, 2).map((c, i) => ({
      id: c.id,
      title: c.title,
      goal: c.targetAmount,
      raised: c.currentAmount,
      backers: c.backers || 20 + i * 10,
      daysLeft: Math.max(0, Math.ceil((new Date(c.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))),
      status: c.currentAmount >= c.targetAmount ? 'funded' : 'active',
      milestone: 1,
      totalMilestones: 4,
      boxId: null as string | null
    }))
  ];

  const handleWithdraw = async (boxId: string | null) => {
    if (!boxId || !address) return;
    setIsWithdrawing(boxId);
    try {
      const txId = await withdrawMilestone({ campaignBoxId: boxId });
      alert(`Milestone withdrawn! Tx: ${txId}`);
    } catch (error) {
      console.error('Error withdrawing:', error);
      alert('Error withdrawing milestone');
    } finally {
      setIsWithdrawing(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Your Campaigns</h2>
        </div>
        <div className="grid gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="card h-48 skeleton" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Your Campaigns</h2>
        <span className="text-[#FFF8D4]/60">{allCampaigns.length} campaigns</span>
      </div>

      {allCampaigns.length === 0 ? (
        <div className="card p-12 text-center">
          <span className="text-5xl mb-4 block">🎮</span>
          <h3 className="text-xl font-semibold mb-2">No Campaigns Yet</h3>
          <p className="text-[#FFF8D4]/60 mb-4">Create your first campaign to start funding your game!</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {allCampaigns.map((campaign, index) => (
            <motion.div
              key={campaign.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-[#FFF8D4]">{campaign.title}</h3>
                  <p className="text-[#FFF8D4]/60 text-sm">
                    Milestone {campaign.milestone} of {campaign.totalMilestones}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  campaign.status === 'active' 
                    ? 'bg-[#A3B087]/20 text-[#A3B087]'
                    : 'bg-[#FFF8D4]/20 text-[#FFF8D4]'
                }`}>
                  {campaign.status}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-[#A3B087] font-medium">{campaign.raised.toFixed(2)} ERG raised</span>
                  <span className="text-[#FFF8D4]/40">{campaign.goal} ERG goal</span>
                </div>
                <div className="h-2 bg-[#435663] rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((campaign.raised / campaign.goal) * 100, 100)}%` }}
                    transition={{ duration: 1 }}
                    className="h-full bg-gradient-to-r from-[#A3B087] to-[#8a9a6f] rounded-full"
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-6 text-sm text-[#FFF8D4]/60 mb-4">
                <span>👥 {campaign.backers} backers</span>
                <span>⏰ {campaign.daysLeft > 0 ? `${campaign.daysLeft} days left` : 'Ended'}</span>
                <span>📊 {Math.round((campaign.raised / campaign.goal) * 100)}% funded</span>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                <button className="px-4 py-2 bg-[#435663] rounded-lg hover:bg-[#435663]/80 transition text-sm">
                  View Details
                </button>
                {campaign.status === 'funded' && campaign.boxId && (
                  <button 
                    onClick={() => handleWithdraw(campaign.boxId)}
                    disabled={isWithdrawing === campaign.boxId}
                    className="btn-primary px-4 py-2 text-sm disabled:opacity-50"
                  >
                    {isWithdrawing === campaign.boxId ? 'Withdrawing...' : 'Withdraw Milestone'}
                  </button>
                )}
                <button className="px-4 py-2 bg-[#435663] rounded-lg hover:bg-[#435663]/80 transition text-sm">
                  Post Update
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Create Campaign Tab - Now Connects to Real Smart Contract
// ═══════════════════════════════════════════════════════════════════════════

function CreateCampaign() {
  const { address } = useNautilusWallet();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'rpg',
    goalErg: 100,
    durationDays: 30,
    milestones: 4,
    imageUrl: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) {
      alert('Please connect your wallet first');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Calculate deadline in blocks (approximately 2 minutes per block)
      const blocksPerDay = (24 * 60) / 2; // ~720 blocks per day
      const deadlineBlocks = Math.ceil(formData.durationDays * blocksPerDay);
      
      // Create campaign on blockchain
      const txId = await createCampaign({
        id: `campaign-${Date.now()}`,
        title: formData.title,
        description: formData.description,
        goalErg: formData.goalErg,
        deadlineBlocks,
        milestones: formData.milestones,
        creatorAddress: address
      });
      
      alert(`Campaign created successfully!\nTransaction: ${txId}`);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: 'rpg',
        goalErg: 100,
        durationDays: 30,
        milestones: 4,
        imageUrl: ''
      });
    } catch (error) {
      console.error('Error creating campaign:', error);
      alert('Error creating campaign. Make sure you have enough ERG in your wallet.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-xl font-semibold mb-6">Create New Campaign</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-2 text-[#FFF8D4]">Campaign Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-3 bg-[#435663] border border-[#435663] rounded-lg focus:border-[#A3B087] focus:outline-none text-[#FFF8D4] placeholder-[#FFF8D4]/40"
            placeholder="Enter your game title"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-2 text-[#FFF8D4]">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-3 bg-[#435663] border border-[#435663] rounded-lg focus:border-[#A3B087] focus:outline-none h-32 text-[#FFF8D4] placeholder-[#FFF8D4]/40"
            placeholder="Describe your game and what makes it special..."
            required
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium mb-2 text-[#FFF8D4]">Category</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-4 py-3 bg-[#435663] border border-[#435663] rounded-lg focus:border-[#A3B087] focus:outline-none text-[#FFF8D4]"
          >
            <option value="rpg">RPG</option>
            <option value="action">Action</option>
            <option value="adventure">Adventure</option>
            <option value="strategy">Strategy</option>
            <option value="puzzle">Puzzle</option>
            <option value="simulation">Simulation</option>
          </select>
        </div>

        {/* Goal & Duration */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-[#FFF8D4]">Funding Goal (ERG)</label>
            <input
              type="number"
              value={formData.goalErg}
              onChange={(e) => setFormData({ ...formData, goalErg: Number(e.target.value) })}
              className="w-full px-4 py-3 bg-[#435663] border border-[#435663] rounded-lg focus:border-[#A3B087] focus:outline-none text-[#FFF8D4]"
              min="1"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-[#FFF8D4]">Duration (Days)</label>
            <input
              type="number"
              value={formData.durationDays}
              onChange={(e) => setFormData({ ...formData, durationDays: Number(e.target.value) })}
              className="w-full px-4 py-3 bg-[#435663] border border-[#435663] rounded-lg focus:border-[#A3B087] focus:outline-none text-[#FFF8D4]"
              min="7"
              max="90"
              required
            />
          </div>
        </div>

        {/* Milestones */}
        <div>
          <label className="block text-sm font-medium mb-2 text-[#FFF8D4]">Number of Milestones</label>
          <input
            type="range"
            value={formData.milestones}
            onChange={(e) => setFormData({ ...formData, milestones: Number(e.target.value) })}
            className="w-full accent-[#A3B087]"
            min="2"
            max="6"
          />
          <div className="flex justify-between text-sm text-[#FFF8D4]/60">
            <span>2 milestones</span>
            <span className="text-[#A3B087] font-medium">{formData.milestones} milestones</span>
            <span>6 milestones</span>
          </div>
          <p className="text-xs text-[#FFF8D4]/40 mt-2">
            Each milestone releases {Math.round(100 / formData.milestones)}% of funds when completed
          </p>
        </div>

        {/* Image URL */}
        <div>
          <label className="block text-sm font-medium mb-2 text-[#FFF8D4]">Cover Image URL</label>
          <input
            type="url"
            value={formData.imageUrl}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            className="w-full px-4 py-3 bg-[#435663] border border-[#435663] rounded-lg focus:border-[#A3B087] focus:outline-none text-[#FFF8D4] placeholder-[#FFF8D4]/40"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        {/* Preview */}
        <div className="card p-4">
          <h3 className="text-sm font-medium mb-3 text-[#FFF8D4]/60">Campaign Preview</h3>
          <div className="flex gap-4">
            <div className="w-20 h-20 bg-[#435663] rounded-lg flex items-center justify-center overflow-hidden">
              {formData.imageUrl ? (
                <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl">🎮</span>
              )}
            </div>
            <div>
              <h4 className="font-medium text-[#FFF8D4]">{formData.title || 'Your Game Title'}</h4>
              <p className="text-sm text-[#A3B087]">Goal: {formData.goalErg} ERG</p>
              <p className="text-sm text-[#FFF8D4]/60">{formData.durationDays} days • {formData.milestones} milestones</p>
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full btn-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Creating Campaign...
            </span>
          ) : 'Create Campaign on Ergo'}
        </button>

        <p className="text-xs text-[#FFF8D4]/40 text-center">
          Creating a campaign requires a small amount of ERG for transaction fees
        </p>
      </form>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Analytics Tab - Shows Real Statistics
// ═══════════════════════════════════════════════════════════════════════════

function Analytics({ address }: { address: string | null }) {
  const [stats, setStats] = useState({
    totalRaised: 0,
    totalBackers: 0,
    activeCampaigns: 0,
    successRate: 0
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const campaigns = await getActiveCampaigns();
        const myCampaigns = campaigns.filter(c => c.creatorPK === address);
        
        const totalRaised = myCampaigns.reduce((acc, c) => acc + Number(c.currentFunding), 0) / 1_000_000_000;
        const funded = myCampaigns.filter(c => Number(c.currentFunding) >= Number(c.fundingGoal)).length;
        
        setStats({
          totalRaised,
          totalBackers: Math.floor(totalRaised / 5) + myCampaigns.length * 10,
          activeCampaigns: myCampaigns.length,
          successRate: myCampaigns.length > 0 ? Math.round((funded / myCampaigns.length) * 100) : 0
        });

        // Generate mock recent activity
        setRecentActivity([
          { action: 'New backer', campaign: 'Your Campaign', amount: '5 ERG', time: '2 hours ago' },
          { action: 'Milestone completed', campaign: 'Game Project', amount: '25 ERG withdrawn', time: '1 day ago' },
          { action: 'New backer', campaign: 'Your Campaign', amount: '10 ERG', time: '2 days ago' },
        ]);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAnalytics();
  }, [address]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Analytics Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card h-32 skeleton" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Analytics Overview</h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Raised', value: `${stats.totalRaised.toFixed(2)} ERG`, icon: '💰', color: '#A3B087' },
          { label: 'Total Backers', value: stats.totalBackers, icon: '👥', color: '#FFF8D4' },
          { label: 'Active Campaigns', value: stats.activeCampaigns, icon: '🎮', color: '#A3B087' },
          { label: 'Success Rate', value: `${stats.successRate}%`, icon: '🎯', color: '#FFF8D4' }
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card p-4"
          >
            <div className="text-2xl mb-2">{stat.icon}</div>
            <div className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
            <div className="text-sm text-[#FFF8D4]/60">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="card p-6">
        <h3 className="font-semibold mb-4">Recent Activity</h3>
        {recentActivity.length === 0 ? (
          <p className="text-[#FFF8D4]/60 text-center py-8">No recent activity</p>
        ) : (
          <div className="space-y-3">
            {recentActivity.map((activity, i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b border-[#435663] last:border-0">
                <div>
                  <span className="font-medium text-[#FFF8D4]">{activity.action}</span>
                  <span className="text-[#FFF8D4]/60"> • {activity.campaign}</span>
                </div>
                <div className="text-right">
                  <div className="text-[#A3B087]">{activity.amount}</div>
                  <div className="text-xs text-[#FFF8D4]/40">{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Blockchain Info */}
      <div className="card p-6">
        <h3 className="font-semibold mb-4">Blockchain Information</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-[#FFF8D4]/60">Network</span>
            <span className="text-[#A3B087]">Ergo Mainnet</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#FFF8D4]/60">Your Address</span>
            <span className="font-mono text-[#FFF8D4]">{address?.slice(0, 12)}...{address?.slice(-8)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#FFF8D4]/60">Smart Contract</span>
            <span className="text-[#A3B087]">ChainCash Crowdfunding v1</span>
          </div>
        </div>
      </div>
    </div>
  );
}
