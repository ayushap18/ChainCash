'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/stores/cartStore';
import { useWalletStore } from '@/stores/walletStore';
import Button from './Button';
import ConnectWallet from '../wallet/ConnectWallet';
import { UserAsset } from '@/types';

export default function Cart() {
  const { 
    items, 
    isOpen, 
    closeCart, 
    removeItem, 
    updateQuantity, 
    clearCart,
    getTotalPrice 
  } = useCartStore();
  
  const { isConnected, address, balance, addOwnedAsset } = useWalletStore();
  const total = getTotalPrice();
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  const handlePurchase = async () => {
    if (!isConnected || !address) return;
    
    setIsPurchasing(true);
    setPurchaseError(null);
    
    try {
      // Simulate blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check if user has enough balance
      if (balance < total) {
        throw new Error('Insufficient balance');
      }
      
      // Add purchased assets to owned assets
      items.forEach(item => {
        for (let i = 0; i < item.quantity; i++) {
          const userAsset: UserAsset = {
            asset: item.asset,
            quantity: 1,
            purchasedAt: new Date(),
            transactionHash: `0x${Math.random().toString(16).slice(2, 66)}`,
            isRedeemed: false,
          };
          addOwnedAsset(userAsset);
        }
      });
      
      setPurchaseSuccess(true);
      clearCart();
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setPurchaseSuccess(false);
        closeCart();
      }, 3000);
      
    } catch (error) {
      setPurchaseError(error instanceof Error ? error.message : 'Transaction failed');
    } finally {
      setIsPurchasing(false);
    }
  };

  const categoryIcons: Record<string, string> = {
    character: '👤',
    weapon: '⚔️',
    skin: '🎨',
    item: '💎',
    vehicle: '🚀',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Cart panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-[#313647] border-l border-[#435663] z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#435663]">
              <h2 className="text-xl font-bold text-[#FFF8D4]">Your Cart</h2>
              <button
                onClick={closeCart}
                className="p-2 hover:bg-[#435663] rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-[#FFF8D4]/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Success message */}
            <AnimatePresence>
              {purchaseSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="m-4 p-4 bg-green-500/20 border border-green-500/50 rounded-xl text-center"
                >
                  <span className="text-4xl mb-2 block">🎉</span>
                  <p className="text-green-400 font-semibold">Purchase Successful!</p>
                  <p className="text-green-300 text-sm mt-1">Your assets have been added to your collection.</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Cart items */}
            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 && !purchaseSuccess ? (
                <div className="text-center py-12">
                  <span className="text-6xl mb-4 block">🛒</span>
                  <p className="text-[#FFF8D4]/60">Your cart is empty</p>
                  <p className="text-[#FFF8D4]/40 text-sm mt-2">
                    Browse the marketplace to find amazing game assets!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <motion.div
                      key={item.asset.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      className="flex gap-4 p-4 bg-[#435663]/50 rounded-xl"
                    >
                      {/* Asset preview */}
                      <div className="w-20 h-20 bg-gradient-to-br from-[#A3B087]/30 to-[#435663]/30 rounded-lg flex items-center justify-center text-3xl border border-[#A3B087]/30">
                        {categoryIcons[item.asset.category]}
                      </div>

                      {/* Details */}
                      <div className="flex-1">
                        <h3 className="text-[#FFF8D4] font-semibold">{item.asset.name}</h3>
                        <p className={`text-sm capitalize ${
                          item.asset.rarity === 'legendary' ? 'text-amber-400' :
                          item.asset.rarity === 'epic' ? 'text-purple-400' :
                          item.asset.rarity === 'rare' ? 'text-blue-400' :
                          'text-[#FFF8D4]/60'
                        }`}>
                          {item.asset.rarity}
                        </p>
                        <p className="text-[#A3B087] text-sm font-medium">
                          {item.asset.price} {item.asset.currency}
                        </p>

                        {/* Quantity controls */}
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateQuantity(item.asset.id, item.quantity - 1)}
                            className="w-7 h-7 bg-[#435663] hover:bg-[#435663]/80 rounded-lg text-[#FFF8D4] transition-colors text-sm"
                            disabled={isPurchasing}
                          >
                            -
                          </button>
                          <span className="text-[#FFF8D4] w-6 text-center text-sm">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.asset.id, item.quantity + 1)}
                            className="w-7 h-7 bg-[#435663] hover:bg-[#435663]/80 rounded-lg text-[#FFF8D4] transition-colors text-sm"
                            disabled={isPurchasing}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Remove button */}
                      <button
                        onClick={() => removeItem(item.asset.id)}
                        className="p-2 hover:bg-[#435663] rounded-lg transition-colors self-start"
                        disabled={isPurchasing}
                      >
                        <svg className="w-5 h-5 text-[#FFF8D4]/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 border-t border-[#435663] space-y-4">
                {/* Error message */}
                {purchaseError && (
                  <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-center">
                    <p className="text-red-400 text-sm">{purchaseError}</p>
                  </div>
                )}
                
                {/* Total */}
                <div className="flex justify-between items-center">
                  <span className="text-[#FFF8D4]/60">Total</span>
                  <span className="text-2xl font-bold text-[#FFF8D4]">
                    {total.toFixed(4)} <span className="text-[#A3B087] text-base">ERG</span>
                  </span>
                </div>

                {/* Balance check */}
                {isConnected && balance < total && (
                  <div className="p-3 bg-amber-500/20 border border-amber-500/50 rounded-lg text-center">
                    <p className="text-amber-400 text-sm">Insufficient balance. You need {(total - balance).toFixed(4)} more ERG.</p>
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-2">
                  {isConnected ? (
                    <Button 
                      className="w-full" 
                      size="lg"
                      onClick={handlePurchase}
                      disabled={isPurchasing || balance < total}
                    >
                      {isPurchasing ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Processing...
                        </span>
                      ) : (
                        'Purchase Assets'
                      )}
                    </Button>
                  ) : (
                    <div className="text-center p-4 bg-[#A3B087]/10 border border-[#A3B087]/30 rounded-xl">
                      <p className="text-[#A3B087] text-sm mb-3">
                        Connect your wallet to complete the purchase
                      </p>
                      <ConnectWallet />
                    </div>
                  )}
                  
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={clearCart}
                    disabled={isPurchasing}
                  >
                    Clear Cart
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
