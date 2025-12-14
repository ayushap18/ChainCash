# ChainCash Crowdfunding Platform 🎮💎

A revolutionary 3D/gamified crowdfunding platform for indie games, built with Next.js, React Three Fiber, and Web3 integration. Based on the Ergo ecosystem's **ChainCash concept** for tokenized game asset crowdfunding.

![ChainCash Banner](https://via.placeholder.com/1200x400/1a1a2e/8b5cf6?text=ChainCash+Crowdfunding)

## 🌟 What is ChainCash?

ChainCash revolutionizes game crowdfunding by **tokenizing pre-launch game assets**. Instead of traditional donations, backers purchase **ChainCash Notes** - blockchain-secured tokens representing ownership of future in-game items.

### Key Benefits:
- **🔄 Tradeable Assets** - Trade your notes on secondary markets before game launch
- **🔒 Blockchain Security** - All transactions verified and permanent
- **💎 True Ownership** - You own your assets, not just a promise
- **🛡️ Developer Accountability** - Milestone-based fund release

## 🎯 Features

### For Backers
- **3D Asset Marketplace** - Browse game assets in an immersive Three.js scene
- **Interactive 3D Cards** - Floating, animated asset cards with rarity effects
- **Campaign Progress Meters** - Visual 3D progress indicators for funding goals
- **Wallet Integration** - Connect via MetaMask
- **Shopping Cart** - Add assets and checkout with crypto
- **Asset Portfolio** - Track owned assets, redeem when games launch

### For Developers
- **Campaign Management** - Create and manage crowdfunding campaigns
- **Milestone System** - Define funding milestones with rewards
- **Asset Management** - Create and price tokenized game assets
- **Backer Analytics** - Track campaign performance

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router) |
| **3D Graphics** | [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) + [@react-three/drei](https://github.com/pmndrs/drei) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) |
| **State Management** | [Zustand](https://zustand-demo.pmnd.rs/) |
| **Web3** | Direct Ethereum Provider (MetaMask) |
| **Language** | TypeScript |

## 📁 Project Structure

```
src/
├── app/                        # Next.js App Router pages
│   ├── page.tsx               # Home page with 3D hero
│   ├── campaigns/             # Campaign listing with filters
│   ├── campaign/[id]/         # Individual campaign detail
│   ├── marketplace/           # Asset marketplace with 3D view
│   ├── my-assets/             # User's owned assets portfolio
│   └── how-it-works/          # ChainCash explainer
├── components/
│   ├── 3d/                    # Three.js/R3F components
│   │   ├── Scene3D.tsx        # Main 3D canvas wrapper
│   │   ├── AssetCard3D.tsx    # 3D floating asset cards
│   │   ├── ProgressMeter.tsx  # 3D funding progress cylinder
│   │   ├── RevealAnimation.tsx# Asset reveal particle effects
│   │   └── MarketplaceScene.tsx# Full marketplace 3D scene
│   ├── ui/                    # UI components
│   │   ├── Button.tsx         # Reusable button component
│   │   ├── AssetCard.tsx      # 2D asset card with purchase
│   │   ├── CampaignCard.tsx   # Campaign preview card
│   │   ├── Cart.tsx           # Slide-out shopping cart
│   │   └── Header.tsx         # Navigation header
│   └── wallet/                # Web3 components
│       ├── ConnectWallet.tsx  # Wallet connection UI
│       └── Web3Provider.tsx   # Provider wrapper
├── stores/                    # Zustand state stores
│   ├── campaignStore.ts       # Campaigns & assets state
│   ├── cartStore.ts           # Shopping cart state
│   └── walletStore.ts         # Wallet connection state
├── lib/                       # Utilities
│   └── wagmi.ts              # Web3 configuration
└── types/                     # TypeScript types
    └── index.ts               # ChainCash types
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- A Web3 wallet (MetaMask recommended)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd crowdfunding
```

2. **Install dependencies**
```bash
npm install
```

3. **Start the development server**
```bash
npm run dev
```

4. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

## 📱 Pages Overview

### Home (`/`)
- Hero section with 3D marketplace scene
- Featured campaigns
- How ChainCash works preview
- Platform statistics

### Campaigns (`/campaigns`)
- Browse all active crowdfunding campaigns
- Filter by status (Active, Ending Soon, Funded)
- Sort by popularity, newest, funding progress
- Search campaigns by name, developer, or tags

### Campaign Detail (`/campaign/[id]`)
- Full 3D scene with campaign assets
- Campaign progress and milestones
- Available assets grid
- Developer info and social links
- About, Updates, and Milestones tabs

### Marketplace (`/marketplace`)
- All assets from all campaigns
- Toggle between Grid and 3D view
- Filter by category and rarity
- Sort by price, rarity, popularity
- Price range slider
- Search functionality

### My Assets (`/my-assets`)
- Portfolio of owned ChainCash notes
- Asset statistics and total value
- Filter by All, Redeemable, Redeemed
- Transaction history
- Redeem, sell, or transfer assets

### How It Works (`/how-it-works`)
- Step-by-step ChainCash explanation
- Feature comparison vs traditional crowdfunding
- FAQ section
- Call-to-action to explore campaigns

## 🎨 Asset Types

| Category | Icon | Description |
|----------|------|-------------|
| Character | 👤 | Playable characters |
| Weapon | ⚔️ | In-game weapons |
| Skin | 🎨 | Visual customizations |
| Item | 💎 | Equipment and items |
| Vehicle | 🚀 | Mounts and vehicles |
| Consumable | 🧪 | Single-use items |

## 💎 Rarity Tiers

| Rarity | Color | Drop Rate |
|--------|-------|-----------|
| Common | Gray | High |
| Uncommon | Green | Medium-High |
| Rare | Blue | Medium |
| Epic | Purple | Low |
| Legendary | Amber | Very Low |
| Mythic | Red | Extremely Rare |

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file:

```env
# Optional: WalletConnect Project ID
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```

### Customization

- **Colors**: Edit `tailwind.config.ts` for theme colors
- **3D Settings**: Modify `Scene3D.tsx` for lighting/environment
- **Mock Data**: Update `campaignStore.ts` for demo content

## 📜 ChainCash Note System

ChainCash Notes are tokenized IOUs representing:

```typescript
interface ChainCashNote {
  id: string;
  assetId: string;           // Linked game asset
  issuer: string;            // Developer wallet
  holder: string;            // Current owner
  denomination: number;      // Note value
  currency: 'ERG' | 'SigUSD' | 'ETH';
  collateralRatio: number;   // Backing percentage
  maturityDate: Date;        // Game launch date
  isRedeemable: boolean;     // After launch
  isRedeemed: boolean;
}
```

## 🛣️ Roadmap

- [x] Core platform with 3D marketplace
- [x] Wallet integration (MetaMask)
- [x] Campaign and asset management
- [x] Shopping cart and checkout flow
- [x] User asset portfolio
- [ ] Ergo blockchain integration
- [ ] Smart contract deployment
- [ ] Secondary marketplace trading
- [ ] Campaign creation wizard
- [ ] Mobile responsive 3D

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by [Ergo ChainCash](https://github.com/kushti/chaincash)
- 3D components powered by [React Three Fiber](https://github.com/pmndrs/react-three-fiber)
- UI inspired by modern Web3 platforms

---

**Built with 💜 for the indie game community**
