import React from "react";
import { Sparkles, Trophy, Ticket, Anchor } from "lucide-react";
import { Button } from "@/components/ui/button";

const Hero: React.FC = () => {
  return (
    <section className="relative overflow-hidden">
      {/* DKC2-inspired Caribbean gradient background */}
      <div className="absolute inset-0 bg-gradient-hero" />

      {/* Animated water shimmer overlay */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Sky glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[hsl(35,60%,50%)]/15 rounded-full blur-[100px] animate-float" />
        {/* Horizon line glow */}
        <div className="absolute top-[38%] left-0 right-0 h-[2px] bg-[hsl(35,70%,60%)]/20 blur-sm" />
        <div className="absolute top-[40%] left-1/4 w-1/2 h-[80px] bg-[hsl(35,60%,55%)]/10 rounded-full blur-[60px]" />
        {/* Water reflections */}
        <div className="absolute bottom-0 left-0 right-0 h-1/2 overflow-hidden">
          <div className="absolute inset-0 bg-[hsl(160,70%,40%)]/5 animate-float" style={{ animationDelay: "0s" }} />
          <div className="absolute -left-20 bottom-10 w-[400px] h-[100px] bg-[hsl(165,80%,45%)]/10 rounded-full blur-[80px] animate-float" style={{ animationDelay: "1.5s" }} />
          <div className="absolute -right-20 bottom-20 w-[350px] h-[80px] bg-[hsl(155,60%,50%)]/10 rounded-full blur-[60px] animate-float" style={{ animationDelay: "3s" }} />
        </div>
        {/* Subtle rope/rigging lines (decorative) */}
        <div className="absolute top-0 right-[15%] w-[1px] h-full bg-foreground/[0.03]" />
        <div className="absolute top-0 right-[18%] w-[1px] h-full bg-foreground/[0.02] rotate-[2deg]" />
        <div className="absolute top-0 left-[12%] w-[1px] h-full bg-foreground/[0.03] -rotate-[1deg]" />
      </div>

      <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-card/20 backdrop-blur-sm border border-primary/30 rounded-full px-4 py-2 mb-6 animate-fade-in">
            <Anchor className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              Sorteios com NFTs exclusivos
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight animate-fade-in text-white drop-shadow-lg" style={{ animationDelay: "0.1s" }}>
            <span>Colecione NFTs, </span>
            <br className="hidden sm:block" />
            <span className="text-gradient">Ganhe Prêmios!</span>
          </h1>

          <p className="text-lg md:text-xl text-white/70 mb-8 animate-fade-in max-w-2xl mx-auto drop-shadow" style={{ animationDelay: "0.2s" }}>
            Compre NFTs de animais fofos e emojis exclusivos para participar de sorteios incríveis.
            Quanto mais raros seus NFTs, maiores suas chances!
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <Button variant="hero" size="xl" onClick={() => document.getElementById('sorteios')?.scrollIntoView({ behavior: 'smooth' })}>
              <Ticket className="h-5 w-5" />
              Ver Sorteios
            </Button>
            <Button variant="outline" size="xl" className="border-white/20 text-white hover:bg-white/10" onClick={() => document.getElementById('nfts')?.scrollIntoView({ behavior: 'smooth' })}>
              <Trophy className="h-5 w-5" />
              Comprar NFTs
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 md:gap-8 mt-14 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            {[
              { value: "2.5K+", label: "Bilhetes Vendidos" },
              { value: "R$50K+", label: "Em Prêmios" },
              { value: "100+", label: "Ganhadores" },
            ].map((stat) => (
              <div key={stat.label} className="text-center bg-card/10 backdrop-blur-sm rounded-xl py-4 border border-white/5">
                <p className="text-2xl md:text-4xl font-black text-gradient">{stat.value}</p>
                <p className="text-xs md:text-sm text-white/50">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom wave transition */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
          <path d="M0,30 C360,60 720,0 1080,30 C1260,45 1380,40 1440,35 L1440,60 L0,60 Z" fill="hsl(var(--background))" />
        </svg>
      </div>
    </section>
  );
};

export default Hero;
