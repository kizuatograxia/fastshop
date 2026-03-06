import React from "react";
import { Copy, Gift, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const Hero: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-background pt-16 pb-24 md:pt-24 md:pb-32 border-b border-border">
      {/* Subtle Grid Background for a clean modern look instead of AI blobs */}
      <div
        className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.05]"
        style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '32px 32px' }}
      />

      <div className="container mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center gap-12 md:gap-8">

        {/* Left column: Typography and Call to Actions */}
        <div className="flex-1 text-left w-full max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground border border-border rounded-md px-3 py-1.5 mb-6 text-xs font-semibold uppercase tracking-wider">
            <Gift className="h-3.5 w-3.5 text-primary" />
            <span>MundoPix Sorteios</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-[1.1] tracking-tight text-foreground">
            A forma mais transparente de participar de sorteios.
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl leading-relaxed">
            Adquira NFTs exclusivos catalogados na rede, receba seus números da sorte e concorra a prêmios reais com total segurança.
          </p>

          <div className="flex flex-col sm:flex-row items-start gap-4">
            <Button
              size="xl"
              className="w-full sm:w-auto font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
              onClick={() => document.getElementById('sorteios')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Explorar prêmios
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <Button
              variant="outline"
              size="xl"
              className="w-full sm:w-auto font-semibold border-border bg-card hover:bg-muted"
              onClick={() => document.getElementById('comofunciona')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Entender as regras
            </Button>
          </div>

          <div className="mt-10 flex items-center gap-6 text-sm text-muted-foreground font-medium">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-primary/20 items-center justify-center">
                <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
              </span>
              Sorteios ao vivo toda semana
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-primary/20 items-center justify-center">
                <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
              </span>
              Ativos verificáveis
            </div>
          </div>
        </div>

        {/* Right column: Main visual representation of the concept */}
        <div className="flex-1 w-full relative perspective-1000 hidden md:block">
          <div className="relative mx-auto w-full max-w-[400px] aspect-[4/5] bg-card rounded-2xl border border-border shadow-elevated overflow-hidden group">
            {/* Mock minimal interface of a ticket/NFT */}
            <div className="h-1/2 bg-muted/30 p-6 flex flex-col justify-between border-b border-border/50">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-muted-foreground uppercase">NFT Pass</span>
                <span className="px-2 py-1 bg-background rounded text-xs font-mono font-bold text-primary">#4829</span>
              </div>
              <div>
                <div className="h-24 w-24 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 mx-auto flex items-center justify-center border border-primary/20">
                  <Copy className="h-8 w-8 text-primary/60" />
                </div>
              </div>
            </div>
            <div className="h-1/2 p-6 flex flex-col justify-between bg-card text-card-foreground">
              <div>
                <h3 className="font-bold text-xl mb-1">Passe Ouro Mensal</h3>
                <p className="text-sm text-muted-foreground">Garante 5 números na sorte principal desta sexta-feira.</p>
              </div>
              <div className="pt-4 flex justify-between items-end border-t border-border/50 mt-4">
                <div className="flex flex-col">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold">Valor</span>
                  <span className="font-black text-lg">R$ 49,90</span>
                </div>
                <Button size="sm" className="font-bold">Adquirir</Button>
              </div>
            </div>
          </div>

          {/* Decorative elements to anchor the design instead of floating blurs */}
          <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-primary/5 rounded-xl border border-primary/10 -z-10 rotate-12"></div>
          <div className="absolute -top-6 -right-6 w-32 h-32 bg-secondary rounded-full -z-10 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#374151_1px,transparent_1px)] [background-size:8px_8px]"></div>
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

