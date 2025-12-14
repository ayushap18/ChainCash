import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Transpile problematic packages
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei'],
  // Enable Turbopack with empty config
  turbopack: {},
  // Webpack configuration for Web3 packages (for fallback)
  webpack: (config) => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
};

export default nextConfig;
