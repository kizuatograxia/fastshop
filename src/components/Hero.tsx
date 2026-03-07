import React, { useState, useEffect, useMemo, useRef } from "react";
import { ArrowRight, Zap, Shield, Users, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { raffles as localRaffles } from "@/data/raffles";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import MempoolBackground from "@/components/MempoolBackground";
import { api } from "@/lib/api";
import { Raffle } from "@/types/raffle";

// Rotating Raffle showcase (mini vitrine)
const RaffleShowcase: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [raffles, setRaffles] = useState<Raffle[]>(localRaffles);

  useEffect(() => {
    api.getActiveRaffles()
      .then(data => {
        const active = data.filter(r => r.status === 'ativo' || r.status === 'active');
        if (active.length > 0) setRaffles(active);
      })
      .catch(() => {});
  }, []);

  const featured = useMemo(() => raffles.slice(0, 6), [raffles]);

  useEffect(() => {
    if (featured.length === 0) return;
    const timer = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % featured.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [featured.length]);

  if (featured.length === 0) return null;
  const current = featured[activeIndex];

  const progress = current.maxParticipantes > 0
    ? Math.round((current.participantes / current.maxParticipantes) * 100)
    : 0;

  return (
    <div className="relative w-full">
      <div className="relative bg-card/80 backdrop-blur-xl border border-border/60 rounded-xl overflow-hidden shadow-lg">
        {/* Header bar */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/40 bg-muted/30">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[11px] font-mono font-bold text-muted-foreground uppercase tracking-wider">Sorteios ao Vivo</span>
          </div>
          <span className="text-[11px] font-mono text-primary font-bold">{featured.length} ativos</span>
        </div>

        {/* Raffle Image */}
        <Link to={`/raffle/${current.id}`}>
          <div className="relative aspect-square bg-gradient-to-br from-muted/20 to-transparent flex items-center justify-center overflow-hidden cursor-pointer group">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -20 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full h-full flex items-center justify-center"
              >
                <img
                  src={current.imagem}
                  alt={current.titulo}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
              </motion.div>
            </AnimatePresence>

            {/* Prize value overlay */}
            <div className="absolute bottom-3 left-3 z-10">
              <p className="text-2xl font-black text-primary drop-shadow-lg">
                R$ {current.premioValor.toLocaleString("pt-BR")}
              </p>
            </div>
          </div>
        </Link>

        {/* Raffle Info */}
        <div className="p-4 border-t border-border/40">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id + "-info"}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary/20 text-primary">
                  {current.categoria}
                </span>
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Ticket className="h-3 w-3" />
                  <span>R$ {current.custoNFT}</span>
                </div>
              </div>
              <h3 className="font-bold text-foreground text-sm mb-2 truncate">{current.titulo}</h3>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>{current.participantes} cotas</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(progress, 2)}%` }}
                  />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dots */}
        <div className="flex gap-1 px-4 pb-4">
          {featured.map((r, i) => (
            <button
              key={r.id}
              onClick={() => setActiveIndex(i)}
              className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${i === activeIndex ? 'bg-primary' : 'bg-border hover:bg-muted-foreground/30'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const Hero: React.FC = () => {
  const [ticketCount, setTicketCount] = useState(12847);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setTicketCount(prev => prev + Math.floor(Math.random() * 3));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-background border-b border-border">
      <MempoolBackground containerRef={sectionRef as React.RefObject<HTMLElement>} />

      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background/60 pointer-events-none z-[1]" />
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none z-[1]" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/[0.06] dark:bg-primary/[0.1] rounded-full blur-[150px] pointer-events-none z-[1]" />

      <div className="container mx-auto px-4 relative z-10 py-12 md:py-20 lg:py-24">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">

          {/* Left: Content */}
          <div className="flex-1 w-full max-w-2xl text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 bg-card/70 backdrop-blur-md border border-border/50 rounded-full px-3 py-1.5 mb-6"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-xs font-semibold text-muted-foreground">
                <span className="text-foreground font-mono">{ticketCount.toLocaleString('pt-BR')}</span> bilhetes emitidos
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-[56px] font-black leading-[1.08] tracking-tight text-foreground mb-5"
            >
              Colecione NFTs.{" "}
              <span className="text-primary">Ganhe prêmios.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.6 }}
              className="text-base md:text-lg text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed"
            >
              Cada NFT é um bilhete verificável na blockchain. Quanto mais você coleciona, maiores suas chances em sorteios auditados e transparentes.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex flex-col sm:flex-row items-center lg:items-start gap-3 mb-10"
            >
              <Button
                size="xl"
                className="w-full sm:w-auto font-bold shadow-sm"
                onClick={() => document.getElementById('sorteios')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Explorar Sorteios
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
              <Button
                variant="outline"
                size="xl"
                className="w-full sm:w-auto font-semibold backdrop-blur-sm bg-card/50"
                onClick={() => document.getElementById('nfts')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Ver NFTs
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex items-center justify-center lg:justify-start gap-6 md:gap-8"
            >
              {[
                { icon: Shield, label: "Blockchain", value: "Verificado" },
                { icon: Users, label: "Participantes", value: "2.4k+" },
                { icon: Zap, label: "Sorteios", value: "Ao Vivo" },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-2.5">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 backdrop-blur-sm">
                    <Icon className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-foreground leading-tight">{value}</span>
                    <span className="text-[10px] text-muted-foreground leading-tight">{label}</span>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: Raffle Showcase */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="flex-shrink-0 w-full max-w-[340px] lg:max-w-[380px]"
          >
            <RaffleShowcase />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
