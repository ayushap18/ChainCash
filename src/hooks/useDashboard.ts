/**
 * useDashboard Hook
 * 
 * Hook for managing creator dashboard state and actions
 */

import { useState, useEffect, useCallback } from 'react';
import { useNautilusWallet } from './useNautilusWallet';
import { 
  createCampaign, 
  withdrawMilestone, 
  getActiveCampaigns,
  getCampaignProgress,
  type ContractCampaign,
  type CampaignParams 
} from '@/lib/ergo/contractService';

export interface DashboardCampaign extends ContractCampaign {
  title?: string;
  description?: string;
  progress: number;
  status: 'active' | 'funded' | 'expired' | 'withdrawn';
}

export function useDashboard() {
  const { isConnected, address } = useNautilusWallet();
  const [campaigns, setCampaigns] = useState<DashboardCampaign[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's campaigns
  const fetchMyCampaigns = useCallback(async () => {
    if (!address) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const allCampaigns = await getActiveCampaigns();
      
      // Filter campaigns created by this address
      const myCampaigns = allCampaigns
        .filter(c => c.creatorPK === address)
        .map(c => ({
          ...c,
          progress: getCampaignProgress(c),
          status: getStatus(c)
        }));
      
      setCampaigns(myCampaigns);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch campaigns');
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  // Create new campaign
  const handleCreateCampaign = useCallback(async (params: Omit<CampaignParams, 'creatorAddress'>) => {
    if (!address) throw new Error('Wallet not connected');
    
    setIsLoading(true);
    setError(null);
    
    try {
      const txId = await createCampaign({
        ...params,
        creatorAddress: address
      });
      
      // Refresh campaigns after creation
      await fetchMyCampaigns();
      
      return txId;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create campaign';
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [address, fetchMyCampaigns]);

  // Withdraw milestone funds
  const handleWithdraw = useCallback(async (campaignBoxId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const txId = await withdrawMilestone({ campaignBoxId });
      
      // Refresh campaigns after withdrawal
      await fetchMyCampaigns();
      
      return txId;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to withdraw';
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchMyCampaigns]);

  // Load campaigns on mount
  useEffect(() => {
    if (isConnected && address) {
      fetchMyCampaigns();
    }
  }, [isConnected, address, fetchMyCampaigns]);

  return {
    campaigns,
    isLoading,
    error,
    isConnected,
    address,
    createCampaign: handleCreateCampaign,
    withdraw: handleWithdraw,
    refresh: fetchMyCampaigns
  };
}

// Helper to determine campaign status
function getStatus(campaign: ContractCampaign): DashboardCampaign['status'] {
  if (campaign.isExpired) {
    return campaign.isGoalReached ? 'funded' : 'expired';
  }
  if (campaign.isGoalReached) {
    return 'funded';
  }
  return 'active';
}

export default useDashboard;
