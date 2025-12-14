'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useWalletStore } from '@/stores/walletStore';

type WalletOption = 'nautilus' | 'metamask';

export default function ConnectWallet() {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasNautilus, setHasNautilus] = useState(false);
  const [hasMetaMask, setHasMetaMask] = useState(false);
  
  const { 
    isConnected, 
    isConnecting,
    address, 
    balance,
    walletType,
    connectNautilus,
    connectMetaMask,
    disconnect,
  } = useWalletStore();

  // Check available wallets on mount
  useEffect(() => {
    const checkWallets = async () => {
      // Check Nautilus
      if (typeof window !== 'undefined') {
        // Wait a bit for wallet extension to inject
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setHasNautilus(Boolean(window.ergoConnector?.nautilus));
        
        const ethereum = (window as unknown as { ethereum?: unknown }).ethereum;
        setHasMetaMask(Boolean(ethereum));
      }
    };
    
    checkWallets();
    
    // Listen for Nautilus injection
    const handleInjected = () => {
      setHasNautilus(true);
    };
    window.addEventListener('ergo-wallet:injected', handleInjected);
    return () => window.removeEventListener('ergo-wallet:injected', handleInjected);
  }, []);

  // Check for existing Nautilus connection on mount
  useEffect(() => {
    const checkExistingConnection = async () => {
      if (typeof window === 'undefined') return;
      
      try {
        if (window.ergoConnector?.nautilus) {
          const isAuthorized = await window.ergoConnector.nautilus.isAuthorized();
          if (isAuthorized) {
            await connectNautilus();
          }
        }
      } catch (err) {
        console.error('Failed to check existing connection:', err);
      }
    };
    
    checkExistingConnection();
  }, [connectNautilus]);

  const handleConnect = async (wallet: WalletOption) => {
    setError(null);
    
    try {
      let success = false;
      
      if (wallet === 'nautilus') {
        success = await connectNautilus();
      } else if (wallet === 'metamask') {
        success = await connectMetaMask();
      }
      
      if (success) {
        setIsOpen(false);
      } else {
        setError('Connection was rejected or failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
    }
  };

  const handleDisconnect = async () => {
    await disconnect();
    setIsOpen(false);
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const getWalletIcon = () => {
    if (walletType === 'nautilus') return '🚢';
    if (walletType === 'metamask') return '🦊';
    return '💳';
  };

  return (
    <div className="relative">
      {isConnected ? (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#A3B087] to-[#8a9a6f] rounded-xl text-[#313647] font-medium shadow-lg shadow-[#A3B087]/25"
        >
          <span className="text-lg">{getWalletIcon()}</span>
          <div className="flex flex-col items-start text-left">
            <span className="text-xs opacity-80">{balance.toFixed(4)} {walletType === 'nautilus' ? 'ERG' : 'ETH'}</span>
            <span className="text-sm">{formatAddress(address!)}</span>
          </div>
        </motion.button>
      ) : (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-[#A3B087] to-[#8a9a6f] rounded-xl text-[#313647] font-medium shadow-lg shadow-[#A3B087]/25 hover:shadow-[#A3B087]/40 transition-shadow"
        >
          Connect Wallet
        </motion.button>
      )}

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 z-40"
            />
            
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="absolute right-0 top-full mt-2 w-80 bg-[#313647] rounded-2xl border border-[#435663] shadow-xl z-50 overflow-hidden"
            >
              <div className="p-4 border-b border-[#435663]">
                <h3 className="text-[#FFF8D4] font-bold text-lg">
                  {isConnected ? 'Wallet Connected' : 'Connect Wallet'}
                </h3>
                <p className="text-[#FFF8D4]/60 text-sm mt-1">
                  {isConnected 
                    ? `Connected to ${walletType === 'nautilus' ? 'Nautilus' : 'MetaMask'}` 
                    : 'Choose your preferred wallet'
                  }
                </p>
              </div>

              {error && (
                <div className="px-4 py-2 bg-red-500/10 border-b border-red-500/20">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <div className="p-4 space-y-2">
                {isConnected ? (
                  <>
                    {/* Connected state */}
                    <div className="p-4 bg-[#435663]/50 rounded-xl mb-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#A3B087] to-[#8a9a6f] flex items-center justify-center text-2xl">
                          {getWalletIcon()}
                        </div>
                        <div>
                          <p className="text-[#FFF8D4] font-medium">{formatAddress(address!)}</p>
                          <p className="text-[#FFF8D4]/60 text-sm">{walletType === 'nautilus' ? 'Ergo' : 'Ethereum'}</p>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 bg-[#313647] rounded-lg">
                        <span className="text-[#FFF8D4]/60">Balance</span>
                        <span className="text-[#FFF8D4] font-bold">
                          {balance.toFixed(4)} {walletType === 'nautilus' ? 'ERG' : 'ETH'}
                        </span>
                      </div>
                    </div>
                    
                    <button
                      onClick={handleDisconnect}
                      className="w-full px-4 py-3 bg-red-500/10 text-red-400 rounded-xl font-medium hover:bg-red-500/20 transition-colors"
                    >
                      Disconnect
                    </button>
                  </>
                ) : (
                  <>
                    {/* Wallet options */}
                    <p className="text-[#FFF8D4]/40 text-xs mb-2 px-1">RECOMMENDED</p>
                    
                    {/* Nautilus (Ergo) */}
                    <button
                      onClick={() => handleConnect('nautilus')}
                      disabled={isConnecting || !hasNautilus}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                        hasNautilus 
                          ? 'bg-[#435663]/50 border-[#A3B087]/50 hover:bg-[#435663] hover:border-[#A3B087]' 
                          : 'bg-[#435663]/30 border-[#435663] opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-xl">
                        🚢
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-[#FFF8D4] font-medium">Nautilus</p>
                        <p className="text-[#FFF8D4]/60 text-sm">
                          {hasNautilus ? 'Ergo blockchain wallet' : 'Not installed'}
                        </p>
                      </div>
                      {hasNautilus && (
                        <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full">
                          Recommended
                        </span>
                      )}
                    </button>

                    <p className="text-[#FFF8D4]/40 text-xs mt-4 mb-2 px-1">OTHER WALLETS</p>
                    
                    {/* MetaMask (EVM) */}
                    <button
                      onClick={() => handleConnect('metamask')}
                      disabled={isConnecting || !hasMetaMask}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                        hasMetaMask 
                          ? 'bg-[#435663]/50 border-[#435663] hover:bg-[#435663] hover:border-[#435663]/80' 
                          : 'bg-[#435663]/30 border-[#435663] opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-xl">
                        🦊
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-[#FFF8D4] font-medium">MetaMask</p>
                        <p className="text-[#FFF8D4]/60 text-sm">
                          {hasMetaMask ? 'EVM compatible wallet' : 'Not installed'}
                        </p>
                      </div>
                    </button>
                    
                    {isConnecting && (
                      <div className="flex items-center justify-center gap-2 py-3 text-[#FFF8D4]/60">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-5 h-5 border-2 border-[#A3B087] border-t-transparent rounded-full"
                        />
                        <span>Connecting...</span>
                      </div>
                    )}

                    {!hasNautilus && (
                      <div className="mt-4 p-3 bg-[#A3B087]/10 rounded-xl border border-[#A3B087]/20">
                        <p className="text-[#A3B087] text-sm">
                          For the best experience with ChainCash, install{' '}
                          <a 
                            href="https://nautilus.io" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="underline hover:text-[#8a9a6f]"
                          >
                            Nautilus Wallet
                          </a>
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
