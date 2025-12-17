import { create } from 'zustand';
import { GameAsset, Campaign } from '@/types';

interface CampaignStore {
    campaigns: Campaign[];
    isLoading: boolean;
    error: string | null;
    selectedAsset: GameAsset | null;
    selectedCampaign: Campaign | null;
    fetchCampaigns: () => Promise<void>;
    selectAsset: (asset: GameAsset | null) => void;
    selectCampaign: (campaignId: string | null) => void;
}

export const useCampaignStore = create<CampaignStore>((set, get) => ({
    campaigns: [],
    isLoading: false,
    error: null,
    selectedAsset: null,
    selectedCampaign: null,

    fetchCampaigns: async () => {
        set({ isLoading: true, error: null });
        try {
            // Mock data for now
            const mockCampaigns: Campaign[] = [
                {
                    id: '1',
                    title: 'Cosmic Crusaders',
                    description: 'A space-themed RPG where you explore the universe.',
                    goalAmount: '1000000000000', // 1000 ERG
                    raisedAmount: '450000000000', // 450 ERG
                    reserveRatio: 0.8,
                    status: 'active',
                    endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
                    developerId: 'dev1',
                    developer: { id: 'dev1', walletAddress: '9...', username: 'CosmicDev', createdAt: '' }, // Matches CampaignPage usage
                    createdAt: new Date().toISOString(),
                    currentAmount: 450,
                    targetAmount: 1000,
                    imagePath: 'https://via.placeholder.com/400x300/1a1a2e/8b5cf6?text=Cosmic+Crusaders',
                    tags: ['RPG', 'Sci-Fi'],
                    backers: 120,
                    currentFunding: BigInt(450000000000),
                    assets: [
                        {
                            id: 'asset1',
                            name: 'Laser Sword',
                            description: 'A powerful weapon',
                            price: 100,
                            rarity: 'rare',
                            category: 'weapon',
                            soldCount: 10,
                            totalSupply: 100,
                            campaignId: '1',
                            gameId: 'game1'
                        }
                    ],
                    milestones: [
                        { id: 'm1', title: 'Alpha Release', description: 'First playable version', targetAmount: 200, isCompleted: true }
                    ],
                    // Additional properties used in CampaignPage
                    website: 'https://example.com',
                    gameTitle: 'Cosmic Crusaders Game',
                    currency: 'ERG',
                    launchDate: '2025-01-01',
                    updates: []
                } as any // Use any temporarily if types aren't perfectly aligned with the mock data structure I'm building on the fly, but I tried to match
            ];

            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            set({ campaigns: mockCampaigns, isLoading: false });
        } catch (error) {
            set({ error: 'Failed to fetch campaigns', isLoading: false });
        }
    },

    selectAsset: (asset) => set({ selectedAsset: asset }),

    selectCampaign: (campaignId) => {
        if (!campaignId) {
            set({ selectedCampaign: null });
            return;
        }
        const campaign = get().campaigns.find(c => c.id === campaignId);
        set({ selectedCampaign: campaign || null });
    }
}));
