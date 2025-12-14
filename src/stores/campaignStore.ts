import { create } from 'zustand';
import { Campaign, GameAsset } from '@/types';

// Mock game assets with ChainCash note concept
const neonHorizonsAssets: GameAsset[] = [
  {
    id: 'nh-1',
    name: 'Cyber Warrior',
    description: 'A legendary cyber-enhanced warrior character with unique abilities. Unlock exclusive combat skills and a custom backstory when the game launches.',
    price: 0.05,
    currency: 'ETH',
    category: 'character',
    rarity: 'legendary',
    imagePath: '/assets/cyber-warrior.png',
    isRedeemable: false,
    totalSupply: 100,
    soldCount: 45,
    createdAt: new Date('2025-01-01'),
    gameId: '1',
  },
  {
    id: 'nh-2',
    name: 'Neon Katana',
    description: 'A glowing neon katana that cuts through the digital realm. Deals bonus damage against robotic enemies.',
    price: 0.02,
    currency: 'ETH',
    category: 'weapon',
    rarity: 'epic',
    imagePath: '/assets/neon-katana.png',
    isRedeemable: false,
    totalSupply: 500,
    soldCount: 234,
    createdAt: new Date('2025-01-05'),
    gameId: '1',
  },
  {
    id: 'nh-3',
    name: 'Holo Armor',
    description: 'Holographic armor skin that adapts to your environment. Provides stealth bonuses in dark areas.',
    price: 0.03,
    currency: 'ETH',
    category: 'skin',
    rarity: 'rare',
    imagePath: '/assets/holo-armor.png',
    isRedeemable: false,
    totalSupply: 250,
    soldCount: 89,
    createdAt: new Date('2025-01-10'),
    gameId: '1',
  },
  {
    id: 'nh-4',
    name: 'Quantum Blade',
    description: 'A blade that exists in multiple dimensions simultaneously. Ignores enemy shields and barriers.',
    price: 0.08,
    currency: 'ETH',
    category: 'weapon',
    rarity: 'legendary',
    imagePath: '/assets/quantum-blade.png',
    isRedeemable: false,
    totalSupply: 50,
    soldCount: 12,
    createdAt: new Date('2025-01-15'),
    gameId: '1',
  },
  {
    id: 'nh-5',
    name: 'Speed Bike X1',
    description: 'A futuristic hover bike for rapid traversal. Comes with custom paint job and boost upgrades.',
    price: 0.04,
    currency: 'ETH',
    category: 'vehicle',
    rarity: 'epic',
    imagePath: '/assets/speed-bike.png',
    isRedeemable: false,
    totalSupply: 200,
    soldCount: 156,
    createdAt: new Date('2025-01-20'),
    gameId: '1',
  },
  {
    id: 'nh-6',
    name: 'Neural Interface',
    description: 'An uncommon neural interface that enhances hacking abilities and grants access to hidden areas.',
    price: 0.015,
    currency: 'ETH',
    category: 'item',
    rarity: 'uncommon',
    imagePath: '/assets/neural-interface.png',
    isRedeemable: false,
    totalSupply: 1000,
    soldCount: 678,
    createdAt: new Date('2025-01-25'),
    gameId: '1',
  },
  {
    id: 'nh-7',
    name: 'Phoenix Protocol',
    description: 'A mythic revival item that grants a second chance in permadeath mode. Extremely rare and highly coveted.',
    price: 0.15,
    currency: 'ETH',
    category: 'consumable',
    rarity: 'mythic',
    imagePath: '/assets/phoenix-protocol.png',
    isRedeemable: false,
    totalSupply: 25,
    soldCount: 8,
    createdAt: new Date('2025-02-01'),
    gameId: '1',
  },
  {
    id: 'nh-8',
    name: 'Shadow Cloak',
    description: 'A common stealth accessory that reduces enemy detection range. Perfect for stealth builds.',
    price: 0.008,
    currency: 'ETH',
    category: 'item',
    rarity: 'common',
    imagePath: '/assets/shadow-cloak.png',
    isRedeemable: false,
    totalSupply: 2000,
    soldCount: 1456,
    createdAt: new Date('2025-02-05'),
    gameId: '1',
  },
];

const starRaidersAssets: GameAsset[] = [
  {
    id: 'sr-1',
    name: 'Vanguard Cruiser',
    description: 'A powerful capital ship capable of commanding entire fleets. Includes exclusive bridge customization.',
    price: 0.1,
    currency: 'ETH',
    category: 'vehicle',
    rarity: 'legendary',
    imagePath: '/assets/vanguard-cruiser.png',
    isRedeemable: false,
    totalSupply: 50,
    soldCount: 23,
    createdAt: new Date('2025-02-01'),
    gameId: '2',
  },
  {
    id: 'sr-2',
    name: 'Admiral Chen',
    description: 'A legendary crew commander with unique tactical abilities. Unlocks special fleet formations.',
    price: 0.06,
    currency: 'ETH',
    category: 'character',
    rarity: 'legendary',
    imagePath: '/assets/admiral-chen.png',
    isRedeemable: false,
    totalSupply: 75,
    soldCount: 34,
    createdAt: new Date('2025-02-10'),
    gameId: '2',
  },
  {
    id: 'sr-3',
    name: 'Plasma Turret Array',
    description: 'An epic weapon system that can be installed on any ship. Deals massive area damage.',
    price: 0.035,
    currency: 'ETH',
    category: 'weapon',
    rarity: 'epic',
    imagePath: '/assets/plasma-turret.png',
    isRedeemable: false,
    totalSupply: 300,
    soldCount: 189,
    createdAt: new Date('2025-02-15'),
    gameId: '2',
  },
  {
    id: 'sr-4',
    name: 'Nebula Camo',
    description: 'A rare ship skin that blends with space backgrounds. Reduces targeting lock time of enemies.',
    price: 0.025,
    currency: 'ETH',
    category: 'skin',
    rarity: 'rare',
    imagePath: '/assets/nebula-camo.png',
    isRedeemable: false,
    totalSupply: 400,
    soldCount: 256,
    createdAt: new Date('2025-02-20'),
    gameId: '2',
  },
];

const pixelQuestAssets: GameAsset[] = [
  {
    id: 'pq-1',
    name: 'Hero of Light',
    description: 'The legendary hero destined to save the pixel realm. Comes with exclusive starting quest line.',
    price: 0.045,
    currency: 'ETH',
    category: 'character',
    rarity: 'legendary',
    imagePath: '/assets/hero-light.png',
    isRedeemable: false,
    totalSupply: 100,
    soldCount: 67,
    createdAt: new Date('2025-03-01'),
    gameId: '3',
  },
  {
    id: 'pq-2',
    name: 'Dragon Mount',
    description: 'A majestic dragon that serves as your loyal mount. Fly across the realm in style!',
    price: 0.07,
    currency: 'ETH',
    category: 'vehicle',
    rarity: 'epic',
    imagePath: '/assets/dragon-mount.png',
    isRedeemable: false,
    totalSupply: 150,
    soldCount: 98,
    createdAt: new Date('2025-03-05'),
    gameId: '3',
  },
  {
    id: 'pq-3',
    name: 'Excalibur',
    description: 'The legendary sword of kings. Deals bonus damage and grants leadership bonuses.',
    price: 0.055,
    currency: 'ETH',
    category: 'weapon',
    rarity: 'mythic',
    imagePath: '/assets/excalibur.png',
    isRedeemable: false,
    totalSupply: 30,
    soldCount: 12,
    createdAt: new Date('2025-03-10'),
    gameId: '3',
  },
];

const mockCampaigns: Campaign[] = [
  {
    id: '1',
    title: 'Neon Horizons - Genesis Collection',
    description: 'Be among the first to own exclusive in-game assets for Neon Horizons, an upcoming cyberpunk action RPG.',
    longDescription: `Neon Horizons is a revolutionary cyberpunk action RPG set in the year 2087. The world has been transformed by advanced technology, mega-corporations control everything, and you're a rebel fighting for freedom.

This Genesis Collection represents the first wave of ChainCash tokenized notes for the game. Each note you purchase represents a guaranteed claim on an in-game asset that you can redeem when the game launches. These notes can be freely traded with other players.

**Why ChainCash?**
- 🔒 Your investment is secured by blockchain technology
- 💱 Trade your notes on secondary markets before launch
- 🎁 Exclusive bonuses for early supporters
- 🚀 Priority access to beta testing`,
    gameTitle: 'Neon Horizons',
    developer: 'CyberForge Studios',
    developerAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f8',
    targetAmount: 50,
    currentAmount: 32.5,
    currency: 'ETH',
    startDate: new Date('2025-01-01'),
    endDate: new Date('2025-06-01'),
    launchDate: new Date('2025-12-01'),
    status: 'active',
    assets: neonHorizonsAssets,
    backers: 1247,
    imagePath: '/campaigns/neon-horizons.png',
    bannerPath: '/campaigns/neon-horizons-banner.png',
    videoUrl: 'https://youtube.com/watch?v=example',
    website: 'https://neonhorizons.game',
    twitter: '@NeonHorizons',
    discord: 'discord.gg/neonhorizons',
    tags: ['cyberpunk', 'rpg', 'action', 'sci-fi'],
    milestones: [
      { id: 'm1', title: 'Alpha Access', description: 'All backers get alpha access', targetAmount: 20, isReached: true, reachedAt: new Date('2025-02-15') },
      { id: 'm2', title: 'Bonus Character', description: 'Unlock bonus character for all backers', targetAmount: 35, isReached: false },
      { id: 'm3', title: 'Soundtrack', description: 'Digital soundtrack for all backers', targetAmount: 45, isReached: false },
    ],
  },
  {
    id: '2',
    title: 'Star Raiders - Fleet Commander Pack',
    description: 'Command your own fleet in Star Raiders! This crowdfunding campaign offers exclusive spaceships, crew members, and base skins.',
    longDescription: `Star Raiders brings epic space combat to the blockchain era. Build your fleet, recruit legendary commanders, and conquer the galaxy.

This Fleet Commander Pack gives you everything you need to start your journey as a space admiral. All assets are backed by ChainCash notes, ensuring your investment is protected.`,
    gameTitle: 'Star Raiders',
    developer: 'Galactic Games',
    developerAddress: '0x8ba1f109551bD432803012645Hac136Dc',
    targetAmount: 30,
    currentAmount: 18.7,
    currency: 'ETH',
    startDate: new Date('2025-02-01'),
    endDate: new Date('2025-07-01'),
    launchDate: new Date('2026-03-01'),
    status: 'active',
    assets: starRaidersAssets,
    backers: 892,
    imagePath: '/campaigns/star-raiders.png',
    bannerPath: '/campaigns/star-raiders-banner.png',
    website: 'https://star-raiders.io',
    twitter: '@StarRaidersGame',
    discord: 'discord.gg/starraiders',
    tags: ['space', 'strategy', 'fleet', 'multiplayer'],
    milestones: [
      { id: 'm1', title: 'Demo Release', description: 'Playable demo for backers', targetAmount: 15, isReached: true, reachedAt: new Date('2025-03-01') },
      { id: 'm2', title: 'PvP Mode', description: 'Unlock PvP multiplayer mode', targetAmount: 25, isReached: false },
    ],
  },
  {
    id: '3',
    title: 'Pixel Quest - Founder\'s Edition',
    description: 'A nostalgic pixel art adventure RPG with modern gameplay. Support the developers and claim exclusive founder rewards!',
    longDescription: `Pixel Quest combines the charm of classic 16-bit RPGs with modern game design. Explore vast dungeons, collect legendary items, and save the realm!

As a founder, you'll receive exclusive items, early access, and your name in the game credits.`,
    gameTitle: 'Pixel Quest',
    developer: 'Retro Forge',
    developerAddress: '0x3C44CdDdB6a900fa2b585dd299e03d12FA429',
    targetAmount: 25,
    currentAmount: 21.3,
    currency: 'ETH',
    startDate: new Date('2025-03-01'),
    endDate: new Date('2025-08-01'),
    launchDate: new Date('2025-10-15'),
    status: 'active',
    assets: pixelQuestAssets,
    backers: 1567,
    imagePath: '/campaigns/pixel-quest.png',
    bannerPath: '/campaigns/pixel-quest-banner.png',
    website: 'https://pixelquest.game',
    twitter: '@PixelQuestRPG',
    tags: ['pixel-art', 'rpg', 'retro', 'adventure'],
    milestones: [
      { id: 'm1', title: 'Beta Access', description: 'All founders get beta access', targetAmount: 15, isReached: true },
      { id: 'm2', title: 'Bonus Dungeon', description: 'Exclusive founder dungeon', targetAmount: 20, isReached: true },
      { id: 'm3', title: 'Voice Acting', description: 'Full voice acting unlocked', targetAmount: 25, isReached: false },
    ],
  },
];

interface CampaignState {
  campaigns: Campaign[];
  selectedCampaign: Campaign | null;
  selectedAsset: GameAsset | null;
  isLoading: boolean;
  error: string | null;
  filters: {
    status: string;
    currency: string;
    sortBy: string;
  };
  
  // Actions
  fetchCampaigns: () => Promise<void>;
  selectCampaign: (campaignId: string) => void;
  selectAsset: (asset: GameAsset | null) => void;
  clearSelection: () => void;
  setFilters: (filters: Partial<CampaignState['filters']>) => void;
  getAllAssets: () => GameAsset[];
  getAssetById: (assetId: string) => GameAsset | undefined;
}

export const useCampaignStore = create<CampaignState>((set, get) => ({
  campaigns: [],
  selectedCampaign: null,
  selectedAsset: null,
  isLoading: false,
  error: null,
  filters: {
    status: 'all',
    currency: 'all',
    sortBy: 'popular',
  },

  fetchCampaigns: async () => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 300));
      set({ campaigns: mockCampaigns, isLoading: false });
    } catch {
      set({ error: 'Failed to fetch campaigns', isLoading: false });
    }
  },

  selectCampaign: (campaignId: string) => {
    const campaign = get().campaigns.find((c) => c.id === campaignId);
    set({ selectedCampaign: campaign || null, selectedAsset: null });
  },

  selectAsset: (asset: GameAsset | null) => {
    set({ selectedAsset: asset });
  },

  clearSelection: () => {
    set({ selectedCampaign: null, selectedAsset: null });
  },

  setFilters: (filters) => {
    set({ filters: { ...get().filters, ...filters } });
  },

  getAllAssets: () => {
    return get().campaigns.flatMap(c => c.assets);
  },

  getAssetById: (assetId: string) => {
    const allAssets = get().getAllAssets();
    return allAssets.find(a => a.id === assetId);
  },
}));
