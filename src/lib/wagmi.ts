import { http, createConfig } from 'wagmi';
import { mainnet, sepolia, polygon, arbitrum } from 'wagmi/chains';

export const config = createConfig({
  chains: [mainnet, sepolia, polygon, arbitrum],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [polygon.id]: http(),
    [arbitrum.id]: http(),
  },
});

declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}
