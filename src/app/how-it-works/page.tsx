'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Button from '@/components/ui/Button';

const steps = [
  {
    number: '01',
    icon: '🎮',
    title: 'Browse Game Campaigns',
    description: 'Explore upcoming indie games and their exclusive asset collections. Each campaign offers unique characters, weapons, skins, and more.',
  },
  {
    number: '02',
    icon: '💳',
    title: 'Purchase ChainCash Notes',
    description: 'Buy tokenized notes that represent your ownership of game assets. These notes are secured on the blockchain and can be traded freely.',
  },
  {
    number: '03',
    icon: '💱',
    title: 'Trade & Collect',
    description: 'Trade your notes with other collectors before the game launches. Build your collection, speculate on rare items, or flip for profit.',
  },
  {
    number: '04',
    icon: '🚀',
    title: 'Game Launches',
    description: 'When the game is released, your ChainCash notes become redeemable. The developers have received funding and delivered on their promise.',
  },
  {
    number: '05',
    icon: '🎁',
    title: 'Redeem Your Assets',
    description: 'Convert your ChainCash notes into actual in-game items. Enjoy your exclusive characters, weapons, and skins that you helped fund!',
  },
];

const features = [
  {
    icon: '🔒',
    title: 'Blockchain Security',
    description: 'All transactions are secured on the blockchain. Your ownership is verifiable and permanent.',
  },
  {
    icon: '💎',
    title: 'True Ownership',
    description: 'You truly own your assets. Trade, sell, or hold them—the choice is always yours.',
  },
  {
    icon: '🔄',
    title: 'Liquid Markets',
    description: 'Trade your notes on secondary markets anytime. No waiting for game launch to exit.',
  },
  {
    icon: '🛡️',
    title: 'Developer Accountability',
    description: 'Funds are released to developers based on milestones. Backers have protection.',
  },
  {
    icon: '🌍',
    title: 'Global Access',
    description: 'Anyone with a wallet can participate. No geographic restrictions or bank requirements.',
  },
  {
    icon: '📊',
    title: 'Transparent Funding',
    description: 'Track campaign progress in real-time. See exactly how funds are being used.',
  },
];

const faqs = [
  {
    q: 'What is a ChainCash Note?',
    a: 'A ChainCash Note is a tokenized IOU that represents your claim on a future game asset. When you purchase a note, you\'re essentially pre-ordering an in-game item with the added benefit of blockchain-verified ownership and tradability.',
  },
  {
    q: 'What happens if a game is cancelled?',
    a: 'If a campaign fails to meet its goals or a game is cancelled, note holders may be eligible for refunds from the campaign\'s reserve fund. The specific terms depend on each campaign\'s smart contract.',
  },
  {
    q: 'Can I trade my notes before the game launches?',
    a: 'Yes! ChainCash Notes can be freely traded on secondary markets. This means you can buy, sell, or trade your notes with other collectors at any time.',
  },
  {
    q: 'Which wallets are supported?',
    a: 'We currently support Nautilus Wallet for the Ergo blockchain. Connect your wallet to start exploring campaigns and purchasing assets.',
  },
  {
    q: 'What is the Ergo blockchain?',
    a: 'Ergo is an advanced, UTXO-based blockchain with powerful smart contract capabilities. ChainCash leverages Ergo\'s eUTXO model for secure, efficient crowdfunding.',
  },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-[#313647]">
      {/* Hero Section */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="inline-block px-4 py-2 bg-[#A3B087]/20 border border-[#A3B087]/50 rounded-full text-[#A3B087] text-sm font-medium mb-6">
              The Future of Game Crowdfunding
            </span>
            <h1 className="text-5xl md:text-6xl font-bold text-[#FFF8D4] mb-6">
              How <span className="bg-gradient-to-r from-[#A3B087] to-[#8a9a6f] bg-clip-text text-transparent">ChainCash</span> Works
            </h1>
            <p className="text-xl text-[#FFF8D4]/60 max-w-3xl mx-auto">
              ChainCash revolutionizes game crowdfunding by tokenizing pre-launch assets. 
              Support indie developers, own exclusive items, and trade freely—all secured by blockchain technology.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="space-y-0">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`flex flex-col md:flex-row items-center gap-8 py-12 ${
                  index !== steps.length - 1 ? 'border-b border-[#435663]' : ''
                }`}
              >
                <div className={`flex-1 ${index % 2 === 1 ? 'md:order-2' : ''}`}>
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-5xl">{step.icon}</span>
                    <span className="text-6xl font-bold text-[#435663]">{step.number}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-[#FFF8D4] mb-3">{step.title}</h3>
                  <p className="text-[#FFF8D4]/60 text-lg">{step.description}</p>
                </div>
                <div className={`flex-1 ${index % 2 === 1 ? 'md:order-1' : ''}`}>
                  <div className="w-full h-48 bg-gradient-to-br from-[#A3B087]/20 to-[#435663]/20 rounded-2xl border border-[#435663] flex items-center justify-center">
                    <span className="text-8xl opacity-30">{step.icon}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-4 bg-[#435663]/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-[#FFF8D4] mb-4">Why ChainCash?</h2>
            <p className="text-[#FFF8D4]/60 text-lg max-w-2xl mx-auto">
              Traditional crowdfunding leaves backers with nothing if a project fails. 
              ChainCash changes the game with tokenized, tradeable assets.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 bg-[#313647] border border-[#435663] rounded-2xl hover:border-[#A3B087]/50 transition-colors"
              >
                <span className="text-4xl mb-4 block">{feature.icon}</span>
                <h3 className="text-xl font-bold text-[#FFF8D4] mb-2">{feature.title}</h3>
                <p className="text-[#FFF8D4]/60">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-[#FFF8D4] mb-4">ChainCash vs Traditional Crowdfunding</h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Traditional */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-8 bg-[#435663]/30 border border-[#435663] rounded-2xl"
            >
              <h3 className="text-xl font-bold text-[#FFF8D4]/60 mb-6 flex items-center gap-2">
                <span>❌</span> Traditional Crowdfunding
              </h3>
              <ul className="space-y-4">
                {[
                  'Locked funds until project completion',
                  'No secondary market for rewards',
                  'Limited transparency on fund usage',
                  'No protection if project fails',
                  'Geographic & banking restrictions',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-[#FFF8D4]/60">
                    <span className="text-red-400 mt-1">✕</span>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* ChainCash */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-8 bg-gradient-to-br from-[#A3B087]/20 to-[#435663]/30 border border-[#A3B087]/50 rounded-2xl"
            >
              <h3 className="text-xl font-bold text-[#FFF8D4] mb-6 flex items-center gap-2">
                <span>✨</span> ChainCash
              </h3>
              <ul className="space-y-4">
                {[
                  'Trade your notes anytime on open markets',
                  'Liquid secondary market for all assets',
                  'Blockchain-verified transparent transactions',
                  'Smart contract protection & escrow',
                  'Global access with just a wallet',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-[#FFF8D4]">
                    <span className="text-[#A3B087] mt-1">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-4 bg-[#435663]/30">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-[#FFF8D4] mb-4">Frequently Asked Questions</h2>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 bg-[#313647] border border-[#435663] rounded-xl"
              >
                <h3 className="text-lg font-bold text-[#FFF8D4] mb-2">{faq.q}</h3>
                <p className="text-[#FFF8D4]/60">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-[#FFF8D4] mb-4">Ready to Get Started?</h2>
            <p className="text-xl text-[#FFF8D4]/60 mb-8">
              Join thousands of gamers and collectors supporting the future of indie games.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/campaigns">
                <Button size="lg">
                  🎮 Explore Campaigns
                </Button>
              </Link>
              <Link href="/marketplace">
                <Button variant="outline" size="lg">
                  💎 Browse Marketplace
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
