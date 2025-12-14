# ChainCash Crowdfunding - Setup & Status Guide

> **Last Updated**: December 14, 2025
> **Project Status**: Frontend Complete ✅ | Blockchain Integration Ready ✅ | Backend Schema Ready ⏳

---

## 📋 Quick Start (What Works Now)

```bash
# Install Fleet SDK for Ergo blockchain
npm install @fleet-sdk/core @fleet-sdk/common

# Run the development server
cd /Users/ayush18/crowdfunding
npm run dev

# Open in browser
open http://localhost:3000
```

### ✅ Working Features (No Setup Required)

| Feature | Status | Description |
|---------|--------|-------------|
| Home Page | ✅ Working | 3D hero section, campaign showcase |
| Campaigns List | ✅ Working | Search, filter, sort campaigns |
| Campaign Detail | ✅ Working | Assets, milestones, updates tabs |
| Marketplace | ✅ Working | 3D/Grid view, filters, price slider |
| My Assets | ✅ Working | Portfolio with tabs, mock data |
| How It Works | ✅ Working | ChainCash explanation page |
| Shopping Cart | ✅ Working | Add/remove items, mock checkout |
| Mobile Menu | ✅ Working | Responsive hamburger menu |
| 3D Scenes | ✅ Working | React Three Fiber components |

### ✅ Blockchain Features (Ready with Nautilus)

| Feature | Status | File |
|---------|--------|------|
| Wallet Connection | ✅ Ready | `src/hooks/useNautilusWallet.ts` |
| Transaction Building | ✅ Ready | `src/lib/ergo/transactionService.ts` |
| ERG Transfer | ✅ Ready | `useCrowdfunding().transferErg()` |
| Token Minting | ✅ Ready | `useCrowdfunding().mintAsset()` |
| Campaign Pledges | ✅ Ready | `useCrowdfunding().pledge()` |
| Asset Purchases | ✅ Ready | `useCrowdfunding().purchaseAsset()` |
| Explorer API | ✅ Ready | `src/lib/ergo/client.ts` |

### ⏳ Features Requiring Database

| Feature | Requires | Status |
|---------|----------|--------|
| Persistent Campaigns | PostgreSQL | Schema ready |
| User Profiles | PostgreSQL | Schema ready |
| Purchase History | PostgreSQL | Schema ready |
| Marketplace Listings | PostgreSQL | Schema ready |

---

## 🔧 Full Setup Guide

### Step 1: Install Dependencies

```bash
# Core dependencies (already installed)
npm install

# Add Fleet SDK for Ergo blockchain transactions
npm install @fleet-sdk/core @fleet-sdk/common

# Add Prisma for database (optional, for persistence)
npm install prisma @prisma/client
```

**Installed packages:**
- next, react, react-dom (framework)
- @react-three/fiber, @react-three/drei, three (3D)
- framer-motion (animations)
- zustand (state management)
- @fleet-sdk/core, @fleet-sdk/common (Ergo transactions)

### Step 2: Install Nautilus Wallet (For Ergo Integration)

1. Go to [https://nautilus.io](https://nautilus.io)
2. Install browser extension (Chrome/Firefox/Brave)
3. Create or import wallet
4. Switch to **Testnet** for development

### Step 3: Database Setup (For Production Features)

Choose ONE option:

#### Option A: Supabase (Recommended - Free Tier)
```bash
# 1. Create account at https://supabase.com
# 2. Create new project
# 3. Go to Settings > Database > Connection string
# 4. Copy the connection string

# Create .env.local
echo 'DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"' > .env.local
```

#### Option B: Neon (Free Tier)
```bash
# 1. Create account at https://neon.tech
# 2. Create new project
# 3. Copy connection string

echo 'DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/neondb"' > .env.local
```

#### Option C: Local PostgreSQL
```bash
# Install PostgreSQL
brew install postgresql@15
brew services start postgresql@15

# Create database
createdb chaincash

# Set connection string
echo 'DATABASE_URL="postgresql://localhost:5432/chaincash"' > .env.local
```

### Step 4: Initialize Database

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) Open Prisma Studio to view data
npx prisma studio
```

### Step 5: Environment Variables

Create `.env.local` with:

```env
# Database (required for production features)
DATABASE_URL="your-database-url"

# Ergo Network (testnet for development)
NEXT_PUBLIC_ERGO_NETWORK="testnet"
NEXT_PUBLIC_ERGO_EXPLORER_API="https://api-testnet.ergoplatform.com/api/v1"
```

### Step 6: Run Development Server

```bash
npm run dev
```

---

## 📁 Project Structure

```
crowdfunding/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx            # Home page
│   │   ├── campaigns/          # Campaigns list
│   │   ├── campaign/[id]/      # Campaign detail
│   │   ├── marketplace/        # Asset marketplace
│   │   ├── my-assets/          # User portfolio
│   │   ├── how-it-works/       # ChainCash explanation
│   │   └── api/                # API routes
│   │       ├── campaigns/      # Campaign CRUD
│   │       ├── purchases/      # Purchase recording
│   │       └── ergo/           # Blockchain APIs
│   │
│   ├── components/
│   │   ├── 3d/                 # 3D components (Three.js)
│   │   ├── ui/                 # UI components
│   │   └── wallet/             # Wallet connection
│   │
│   ├── hooks/
│   │   ├── useNautilusWallet.ts # Nautilus wallet hook
│   │   └── useCrowdfunding.ts   # Pledge/purchase/mint hooks ⭐
│   │
│   ├── lib/
│   │   └── ergo/
│   │       ├── client.ts        # Ergo Explorer API client
│   │       └── transactionService.ts # Transaction builder ⭐
│   │
│   ├── stores/
│   │   ├── campaignStore.ts    # Campaign state (mock data)
│   │   ├── cartStore.ts        # Shopping cart
│   │   └── walletStore.ts      # Wallet state
│   │
│   └── types/
│       ├── index.ts            # App types
│       └── ergo.d.ts           # Ergo blockchain types
│
├── prisma/
│   └── schema.prisma           # Database schema
│
├── EXECUTION_PLAN.md           # Detailed implementation plan
├── SETUP.md                    # This file
└── README.md                   # Project overview
```

⭐ = New files with Fleet SDK integration

---

## 💻 Code Usage Examples

### Connect Wallet
```tsx
import { useWalletStore } from '@/stores/walletStore';

function MyComponent() {
  const { connectNautilus, isConnected, address, balance } = useWalletStore();
  
  return (
    <button onClick={connectNautilus}>
      {isConnected ? `${balance.toFixed(2)} ERG` : 'Connect'}
    </button>
  );
}
```

### Pledge to Campaign
```tsx
import { useCrowdfunding } from '@/hooks/useCrowdfunding';

function PledgeButton({ campaignId, campaignAddress }) {
  const { pledge, isLoading, error } = useCrowdfunding();
  
  const handlePledge = async () => {
    const result = await pledge({
      campaignId,
      campaignAddress,
      amountErg: 10, // 10 ERG
      deadline: 1000000, // Block height
    });
    
    if (result.success) {
      console.log('Pledge TX:', result.txId);
    }
  };
  
  return <button onClick={handlePledge} disabled={isLoading}>Pledge</button>;
}
```

### Purchase Game Asset
```tsx
import { useCrowdfunding } from '@/hooks/useCrowdfunding';

function BuyButton({ asset }) {
  const { purchaseAsset, isLoading } = useCrowdfunding();
  
  const handleBuy = async () => {
    await purchaseAsset({
      assetName: asset.name,
      assetDescription: asset.description,
      assetCategory: asset.category,
      assetRarity: asset.rarity,
      priceErg: asset.price,
      sellerAddress: asset.sellerAddress,
    });
  };
  
  return <button onClick={handleBuy}>Buy for {asset.price} ERG</button>;
}
```

### Mint NFT (Campaign Creator)
```tsx
import { useCrowdfunding } from '@/hooks/useCrowdfunding';

function MintAsset() {
  const { mintAsset, isLoading, lastTxId } = useCrowdfunding();
  
  const handleMint = async () => {
    await mintAsset({
      name: 'Legendary Sword',
      description: 'A powerful weapon',
      category: 'WEAPON',
      rarity: 'LEGENDARY',
      amount: 1,
    });
  };
  
  return (
    <>
      <button onClick={handleMint}>Mint NFT</button>
      {lastTxId && <p>Minted! TX: {lastTxId}</p>}
    </>
  );
}
```

### Build Custom Transaction
```tsx
import { TransactionBuilder, OutputBuilder } from '@/hooks/useCrowdfunding';

async function buildCustomTx(utxos, height, changeAddress) {
  return new TransactionBuilder(height)
    .from(utxos)
    .to(
      new OutputBuilder('1000000000', recipientAddress, height)
        .addTokens({ tokenId: 'abc123...', amount: '10' })
    )
    .sendChangeTo(changeAddress)
    .payMinFee()
    .build();
}
```

---

## 🧪 Testing Checklist

### Frontend Tests (No Setup Required)

- [ ] Visit http://localhost:3000 - Home page loads
- [ ] Click "Explore Campaigns" - Campaigns page works
- [ ] Click a campaign card - Detail page loads
- [ ] Toggle 3D view on marketplace - 3D scene renders
- [ ] Add item to cart - Cart drawer opens
- [ ] Open mobile menu (resize to mobile) - Menu slides in
- [ ] Visit /how-it-works - Page explains ChainCash

### Wallet Tests (Requires Nautilus on Testnet)

1. **Install Nautilus**: https://nautilus.io
2. **Switch to Testnet**: Settings → Network → Testnet
3. **Get test ERG**: https://testnet.ergoplatform.com/faucet

- [ ] Click "Connect Wallet" - Modal shows wallet options
- [ ] Click "Nautilus" - Wallet popup appears
- [ ] Approve connection - Address displayed in header
- [ ] Click wallet button - Shows balance and disconnect

### Transaction Tests (Requires Nautilus + Test ERG)

```tsx
// In browser console or component:
import { useCrowdfunding } from '@/hooks/useCrowdfunding';

// Test transfer
const { transferErg } = useCrowdfunding();
await transferErg('9f4QF8AD1nQ3nJahQVkM...', 0.1); // Send 0.1 ERG
```

### API Tests (Works without database for blockchain endpoints)

```bash
# Test blockchain info
curl http://localhost:3000/api/ergo/info

# Test address lookup (use your Nautilus address)
curl http://localhost:3000/api/ergo/address/YOUR_ADDRESS
```

---

## 🚀 Build & Deploy

### Local Build

```bash
# Production build
npm run build

# Start production server
npm start
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard:
# - DATABASE_URL
# - NEXT_PUBLIC_ERGO_NETWORK
# - NEXT_PUBLIC_ERGO_EXPLORER_API
```

---

## 🔗 Key URLs

| Resource | URL |
|----------|-----|
| Local Dev | http://localhost:3000 |
| Nautilus Wallet | https://nautilus.io |
| Ergo Testnet Explorer | https://testnet.ergoplatform.com |
| Ergo Mainnet Explorer | https://explorer.ergoplatform.com |
| Supabase | https://supabase.com |
| Prisma Docs | https://prisma.io/docs |

---

## 📊 Current Data (Mock)

The app uses mock data from `campaignStore.ts`:

**3 Campaigns:**
1. Neon Horizons (Cyberpunk RPG) - 75% funded
2. Star Raiders (Space Strategy) - 45% funded  
3. Pixel Quest (Adventure) - 30% funded

**15+ Game Assets:**
- Characters, Weapons, Armor, Companions
- Common to Legendary rarity
- Prices: 5-200 ERG

---

## ⚡ Commands Reference

```bash
# Development
npm run dev              # Start dev server (port 3000)
npm run build            # Production build
npm run start            # Start production server
npm run lint             # Run ESLint

# Database (after setup)
npx prisma generate      # Generate Prisma client
npx prisma db push       # Push schema to DB
npx prisma studio        # Open database GUI
npx prisma migrate dev   # Create migration

# Other
npm run build -- --webpack  # Build with webpack (not turbopack)
```

---

## 🐛 Troubleshooting

### "Nautilus not installed"
→ Install Nautilus extension from nautilus.io

### "Database connection failed"
→ Check DATABASE_URL in .env.local
→ Ensure PostgreSQL is running

### "Module not found" errors
→ Run `npm install`
→ Delete `.next` folder and rebuild

### 3D scene not rendering
→ Check browser supports WebGL
→ Try refreshing the page

### Build fails with TypeScript errors
→ Run `npm run build -- --webpack` (use webpack instead of turbopack)

---

## 📈 Next Steps to Full Production

1. **Install Fleet SDK** - `npm install @fleet-sdk/core @fleet-sdk/common` - 1 min
2. **Set up Nautilus testnet** - Install extension, switch to testnet - 10 min
3. **Get test ERG** - Use faucet at testnet.ergoplatform.com - 2 min
4. **Test wallet connection** - Run dev server, connect wallet - 5 min
5. **Test transactions** - Use `useCrowdfunding()` hooks - 10 min
6. **Set up database** (optional) - Supabase/Neon - 30 min
7. **Deploy to Vercel** - 10 min

---

## 🔗 Key Resources

| Resource | URL |
|----------|-----|
| **Fleet SDK Docs** | https://fleet-sdk.github.io/docs |
| **Nautilus Wallet** | https://nautilus.io |
| **Ergo Testnet Explorer** | https://testnet.ergoplatform.com |
| **Ergo Mainnet Explorer** | https://explorer.ergoplatform.com |
| **Testnet Faucet** | https://testnet.ergoplatform.com/faucet |
| **Supabase (DB)** | https://supabase.com |

---

## ⚡ Commands Reference

```bash
# Development
npm run dev              # Start dev server (port 3000)
npm run build            # Production build
npm run start            # Start production server
npm run lint             # Run ESLint

# Dependencies
npm install @fleet-sdk/core @fleet-sdk/common  # Add Ergo SDK

# Database (optional)
npm install prisma @prisma/client  # Add database
npx prisma generate                # Generate Prisma client
npx prisma db push                 # Push schema to DB
npx prisma studio                  # Open database GUI
```
