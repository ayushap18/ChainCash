import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Web3Provider from "@/components/wallet/Web3Provider";
import Header from "@/components/ui/Header";
import Cart from "@/components/ui/Cart";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ChainCash Crowdfunding | 3D Game Asset Marketplace",
  description: "A gamified crowdfunding platform for indie games. Purchase tokenized game assets, support developers, and own unique in-game items as NFTs.",
  keywords: ["crowdfunding", "NFT", "gaming", "blockchain", "indie games", "Web3"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-950 text-white min-h-screen`}
      >
        <Web3Provider>
          <Header />
          <Cart />
          <main className="pt-16">
            {children}
          </main>
        </Web3Provider>
      </body>
    </html>
  );
}
