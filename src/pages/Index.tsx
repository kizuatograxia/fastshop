import React, { useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Hero from "@/components/Hero";
import CategoryNav from "@/components/CategoryNav";
import RaffleGrid from "@/components/RaffleGrid";
import NFTGrid from "@/components/NFTGrid";
import HowItWorks from "@/components/HowItWorks";
import WalletDrawer from "@/components/WalletDrawer";
import { raffles, nfts } from "@/data/raffles";

const Index: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("todos");

  const filteredRaffles =
    activeCategory === "todos"
      ? raffles
      : raffles.filter((r) => r.categoria === activeCategory);

  return (
    <div className="min-h-screen bg-background">
      <Header
        onMenuClick={() => setSidebarOpen(true)}
        onWalletClick={() => setWalletOpen(true)}
      />

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      <WalletDrawer isOpen={walletOpen} onClose={() => setWalletOpen(false)} />

      <CategoryNav
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      <main>
        <Hero />
        <RaffleGrid raffles={filteredRaffles} />
        <NFTGrid nfts={nfts} />
        <HowItWorks />
      </main>

      <footer className="border-t border-border py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-2xl">🎰</span>
            <p className="text-gradient font-bold text-xl">LuckyNFT</p>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 LuckyNFT. Colecione, participe e ganhe!
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
