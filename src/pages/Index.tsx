import React, { useState, useRef } from "react";
import Hero from "@/components/Hero";
import CategoryNav from "@/components/CategoryNav";
import RaffleGrid from "@/components/RaffleGrid";
import NFTGrid from "@/components/NFTGrid";
import HowItWorks from "@/components/HowItWorks";
import MempoolBackground from "@/components/MempoolBackground";
import { raffles as localRaffles, nfts } from "@/data/raffles";
import { api } from "@/lib/api";
import { Raffle } from "@/types/raffle";

const Index: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState("todos");
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [liveNfts, setLiveNfts] = useState<any[]>([]);
  const footerRef = useRef<HTMLElement>(null);

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

      <footer ref={footerRef} className="relative overflow-hidden border-t border-border py-12 mt-12 bg-background">
        <MempoolBackground containerRef={footerRef as React.RefObject<HTMLElement>} />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-transparent to-background/50 pointer-events-none z-[1]" />
        <div className="container mx-auto px-4 text-center relative z-10">
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
