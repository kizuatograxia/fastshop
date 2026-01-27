import React from "react";
import { Sparkles, Trophy, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";

const Hero: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-hero">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      {/* Floating Emojis */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <span className="absolute top-32 right-[15%] text-3xl animate-float opacity-40" style={{ animationDelay: "0.5s" }}>🦊</span>
        <span className="absolute bottom-20 left-[20%] text-3xl animate-float opacity-30" style={{ animationDelay: "1s" }}>⭐</span>
        <span className="absolute bottom-32 right-[25%] text-4xl animate-float opacity-40" style={{ animationDelay: "1.5s" }}>🐱</span>
      </div>

      <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-2 mb-6 animate-fade-in">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              Sorteios com NFTs exclusivos
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <span className="text-foreground">Colecione NFTs, </span>
            <br className="hidden sm:block" />
            <span className="text-gradient">Ganhe Prêmios!</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-8 animate-fade-in max-w-2xl mx-auto" style={{ animationDelay: "0.2s" }}>
            Compre NFTs de animais fofos e emojis exclusivos para participar de sorteios incríveis.
            Quanto mais raros seus NFTs, maiores suas chances!
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <Button variant="hero" size="xl">
              <Ticket className="h-5 w-5" />
              Ver Sorteios
            </Button>
            <Button variant="outline" size="xl">
              <Trophy className="h-5 w-5" />
              Comprar NFTs
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 md:gap-8 mt-12 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <div className="text-center">
              <p className="text-2xl md:text-4xl font-black text-gradient">2.5K+</p>
              <p className="text-xs md:text-sm text-muted-foreground">Bilhetes Vendidos</p>
            </div>
            <div className="text-center">
              <p className="text-2xl md:text-4xl font-black text-gradient">R$50K+</p>
              <p className="text-xs md:text-sm text-muted-foreground">Em Prêmios</p>
            </div>
            <div className="text-center">
              <p className="text-2xl md:text-4xl font-black text-gradient">100+</p>
              <p className="text-xs md:text-sm text-muted-foreground">Ganhadores</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
