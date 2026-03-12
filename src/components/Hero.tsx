import { useState, useEffect, useMemo, useRef, FC, RefObject } from "react";
import { ArrowRight, Zap, Shield, Users, Ticket, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { raffles as localRaffles } from "@/data/raffles";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import MempoolBackground from "@/components/MempoolBackground";
import { api } from "@/lib/api";
import { Raffle } from "@/types/raffle";

const DecorativeGrid = () => (
  <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05] z-[0]"
    style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '32px 32px' }}>
  </div>
);

// High-impact, minimal showcase
const LuxuryShowcase: FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [raffles, setRaffles] = useState<Raffle[]>(localRaffles);

  useEffect(() => {
    api.getActiveRaffles()
      .then(data => {
        const active = data.filter(r => r.status === 'ativo' || r.status === 'active');
        if (active.length > 0) setRaffles(active);
      })
      .catch(() => { });
  }, []);

  const featured = useMemo(() => raffles.slice(0, 4), [raffles]); // Max 4 for focus

  useEffect(() => {
    if (featured.length === 0) return;
    const timer = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % featured.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [featured.length]);

  if (featured.length === 0) return null;
  const current = featured[activeIndex];

  const progress = current.maxParticipantes > 0
    ? Math.round((current.participantes / current.maxParticipantes) * 100)
    : 0;

  return (
    <div className="relative w-full max-w-md mx-auto xl:mr-0 group">
      {/* Structural Backdrop */}
      <div className="absolute -inset-1 bg-gradient-to-br from-primary/30 to-transparent rounded-2xl blur-xl opacity-50 group-hover:opacity-100 transition duration-1000"></div>

      <div className="relative bg-card border border-border/80 rounded-2xl overflow-hidden shadow-card">
        {/* Minimalist Top Bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border/50 bg-background/50 backdrop-blur-md z-20 relative">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-[10px] font-mono tracking-[0.2em] font-semibold uppercase text-muted-foreground">Drop Ao Vivo</span>
          </div>
          <span className="text-[12px] font-mono text-foreground font-medium">#{activeIndex + 1} / {featured.length}</span>
        </div>

        {/* Hero Image Area */}
        <Link to={`/raffle/${current.id}`} className="block relative aspect-[4/5] overflow-hidden bg-background">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={current.id}
              initial={{ filter: 'grayscale(100%) blur(10px)', opacity: 0, scale: 1.05 }}
              animate={{ filter: 'grayscale(0%) blur(0px)', opacity: 1, scale: 1 }}
              exit={{ filter: 'grayscale(50%) blur(5px)', opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="w-full h-full"
            >
              <img
                src={current.imagem}
                alt={current.titulo}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-90" />
            </motion.div>
          </AnimatePresence>

          {/* Heavy Typography Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 z-10 flex flex-col justify-end">
            <AnimatePresence mode="popLayout">
              <motion.div
                key={current.id + "-content"}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-background/80 backdrop-blur-sm border border-border/50 mb-4">
                  <Ticket className="h-3 w-3 text-primary" />
                  <span className="text-[11px] font-bold text-foreground">R$ {current.custoNFT} <span className="text-muted-foreground font-normal">/ quota</span></span>
                </div>

                <h3 className="font-extrabold text-2xl md:text-3xl text-foreground leading-[1.1] tracking-tight mb-2 line-clamp-2">
                  {current.titulo}
                </h3>

                <p className="font-mono text-xl text-primary mb-6">
                  R$ {current.premioValor.toLocaleString("pt-BR")}
                </p>

                {/* Technical Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase">Alocação</span>
                    <span className="text-xs font-mono text-foreground">{progress}%</span>
                  </div>
                  <div className="h-1 bg-secondary overflow-hidden">
                    <motion.div
                      layoutId="progress"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(progress, 2)}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-primary shadow-glow relative"
                    >
                      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-r from-transparent to-white/30" />
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </Link>
      </div>
    </div>
  );
};

const Hero: FC = () => {
  const [ticketCount, setTicketCount] = useState(12847);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setTicketCount(prev => prev + Math.floor(Math.random() * 3));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-background min-h-[90vh] flex items-center border-b border-border/30 pt-24 lg:pt-0">
      {/* Background execution */}
      <MempoolBackground containerRef={sectionRef as RefObject<HTMLElement>} />
      <DecorativeGrid />

      {/* Lighting / Atmosphere */}
      <div className="absolute top-0 right-1/4 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-primary/[0.03] dark:bg-primary/[0.04] rounded-full blur-[120px] pointer-events-none z-[1] mix-blend-screen" />
      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none z-[1]" />

      <div className="container mx-auto px-4 md:px-6 relative z-10 py-16 lg:py-0">
        <div className="grid lg:grid-cols-[1.2fr_1fr] gap-12 lg:gap-8 items-center">

          {/* Left: Editorial Copy */}
          <div className="flex flex-col items-start w-full relative">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.8, ease: "easeOut" }}
              className="flex items-center gap-3 mb-8"
            >
              <div className="px-3 py-1 bg-secondary border border-border/50 text-[10px] font-mono tracking-widest uppercase text-muted-foreground inline-flex items-center">
                <Shield className="w-3 h-3 mr-2 opacity-70" />
                Auditoria Concluída
              </div>
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-6 h-6 rounded-full border-2 border-background bg-muted flex items-center justify-center overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" className="w-full h-full object-cover" />
                  </div>
                ))}
                <div className="w-6 h-6 rounded-full border-2 border-background bg-primary flex items-center justify-center text-[8px] font-bold text-primary-foreground z-10">
                  +{ticketCount.toString().substring(0, 2)}k
                </div>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight text-foreground mb-6"
            >
              Ativos digitais.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-foreground via-primary to-foreground bg-[length:200%_auto] animate-[gradient_8s_ease_infinite]">
                Retornos reais.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 1 }}
              className="text-base md:text-lg text-muted-foreground mb-10 max-w-lg leading-relaxed font-light"
            >
              Uma plataforma premium de colecionáveis digitais. Adquira NFTs verificados para acesso exclusivo a alocações de alto valor. Totalmente transparente.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
              className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-4 sm:mt-0"
            >
              <Button
                size="xl"
                className="h-14 px-8 font-bold tracking-wide rounded-none border border-primary bg-primary text-primary-foreground hover:bg-transparent hover:text-primary transition-all shadow-glow uppercase text-xs"
                onClick={() => document.getElementById('sorteios')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Acessar Alocações
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="xl"
                className="h-14 px-8 font-semibold tracking-wide rounded-none border-border/50 bg-background/50 backdrop-blur hover:bg-secondary transition-all uppercase text-xs"
                onClick={() => document.getElementById('nfts')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Ver Coleção
              </Button>
            </motion.div>

            {/* Minimalist Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 1 }}
              className="mt-16 grid grid-cols-2 md:grid-cols-3 gap-8 py-6 border-t border-border/30 w-full max-w-lg"
            >
              {[
                { label: "Volume Total", value: "R$ 2.4M+" },
                { label: "Sorteios Ativos", value: "12" },
                { label: "Taxa de Sucesso", value: "100%" },
              ].map((stat, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <span className="text-[10px] font-mono text-muted-foreground uppercase">{stat.label}</span>
                  <span className="text-xl font-bold text-foreground">{stat.value}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: Structural Showcase */}
          <div className="relative w-full h-full flex items-center justify-center lg:justify-end mt-12 lg:mt-0">
            <LuxuryShowcase />

            {/* Decorative structural elements to break the grid */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 1 }}
              className="absolute -right-8 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-2 items-center"
            >
              <div className="w-[1px] h-32 bg-border/50" />
              <div className="text-[10px] uppercase font-mono tracking-widest text-muted-foreground rotate-90 my-8">
                Deslize para descobrir
              </div>
              <div className="w-[1px] h-16 bg-gradient-to-b from-border/50 to-transparent" />
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
