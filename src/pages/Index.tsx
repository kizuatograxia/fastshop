import React, { useState } from "react";
import Hero from "@/components/Hero";
import BannerCarousel from "@/components/BannerCarousel";
import CategoryNav from "@/components/CategoryNav";
import RaffleGrid from "@/components/RaffleGrid";
import NFTGrid from "@/components/NFTGrid";
import HowItWorks from "@/components/HowItWorks";
import { raffles as localRaffles, nfts } from "@/data/raffles";
import { api } from "@/lib/api";
import { Raffle } from "@/types/raffle";

const Index: React.FC = () => {
  // const [sidebarOpen, setSidebarOpen] = useState(false); // Unused
  // const [walletOpen, setWalletOpen] = useState(false); // Unused
  const [activeCategory, setActiveCategory] = useState("todos");
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [liveNfts, setLiveNfts] = useState<any[]>([]);

  React.useEffect(() => {
    api.getActiveRaffles()
      .then(setRaffles)
      .catch(err => {
        console.error("Failed to fetch raffles, falling back to local", err);
        setRaffles(localRaffles);
      });

    api.getNFTCatalog()
      .then(setLiveNfts)
      .catch(err => {
        console.error("Failed to fetch nfts, falling back to local", err);
        setLiveNfts(nfts);
      });
  }, []);

  const activeRaffles = raffles.filter(r => r.status === 'ativo' || r.status === 'active');
  const filteredRaffles =
    activeCategory === "todos"
      ? activeRaffles
      : activeRaffles.filter((r) => r.categoria === activeCategory);

  return (
    <div className="min-h-screen bg-background">
      {/* Layout components handled by MainLayout */}

      <div className="container mx-auto px-4 pt-6">
        <BannerCarousel />
      </div>

      <Hero />

      <CategoryNav
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      <main className="container mx-auto px-4">
        <RaffleGrid raffles={filteredRaffles} />
        <NFTGrid nfts={liveNfts} />
        <HowItWorks />
      </main>

      <footer className="border-t border-border py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <p className="text-gradient font-bold text-xl">MundoPix</p>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 MundoPix. Colecione, participe e ganhe!
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
