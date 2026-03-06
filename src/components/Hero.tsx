import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { ArrowRight, Zap, Shield, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { nfts } from "@/data/raffles";
import { motion, AnimatePresence } from "framer-motion";

// Full-screen animated mempool background using Canvas
const MempoolBackground: React.FC<{ containerRef: React.RefObject<HTMLElement> }> = ({ containerRef }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const blocksRef = useRef<{ x: number; y: number; size: number; opacity: number; targetOpacity: number; hue: number }[]>([]);
  const sizeRef = useRef({ w: 0, h: 0 });

  const init = useCallback((w: number, h: number) => {
    const gap = 2;
    const cellSize = 16;
    const step = cellSize + gap;
    const cols = Math.ceil(w / step) + 1;
    const rows = Math.ceil(h / step) + 1;
    const blocks: typeof blocksRef.current = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        blocks.push({
          x: c * step,
          y: r * step,
          size: cellSize,
          opacity: 0.03 + Math.random() * 0.12,
          targetOpacity: 0.03 + Math.random() * 0.12,
          hue: 160 + Math.random() * 40,
        });
      }
    }
    blocksRef.current = blocks;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      sizeRef.current = { w: rect.width, h: rect.height };
      init(rect.width, rect.height);
    };

    resize();
    window.addEventListener("resize", resize);

    const pulse = setInterval(() => {
      const blocks = blocksRef.current;
      const count = Math.floor(blocks.length * 0.05);
      for (let i = 0; i < count; i++) {
        const idx = Math.floor(Math.random() * blocks.length);
        blocks[idx].targetOpacity = 0.15 + Math.random() * 0.4;
      }
      for (let i = 0; i < blocks.length; i++) {
        if (Math.random() > 0.85) {
          blocks[i].targetOpacity = 0.02 + Math.random() * 0.08;
        }
      }
    }, 1200);

    const draw = () => {
      const { w, h } = sizeRef.current;
      ctx.clearRect(0, 0, w, h);
      for (const b of blocksRef.current) {
        b.opacity += (b.targetOpacity - b.opacity) * 0.05;
        ctx.fillStyle = `hsla(${b.hue}, 80%, 55%, ${b.opacity})`;
        ctx.fillRect(b.x, b.y, b.size, b.size);
      }
      animRef.current = requestAnimationFrame(draw);
    };
    animRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animRef.current);
      clearInterval(pulse);
    };
  }, [init, containerRef]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
    />
  );
};

// Rotating NFT showcase
const NFTShowcase: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const featured = useMemo(() => nfts.slice(0, 6), []);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % featured.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [featured.length]);

  const current = featured[activeIndex];

  return (
    <div className="relative w-full">
      <div className="relative bg-card/80 backdrop-blur-xl border border-border/60 rounded-xl overflow-hidden shadow-lg">
        {/* Header bar */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/40 bg-muted/30">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[11px] font-mono font-bold text-muted-foreground uppercase tracking-wider">Live NFT Feed</span>
          </div>
          <span className="text-[11px] font-mono text-primary font-bold">{featured.length} ativos</span>
        </div>

        {/* NFT Visual */}
        <div className="relative aspect-square bg-gradient-to-br from-muted/20 to-transparent flex items-center justify-center overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -20 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="flex flex-col items-center gap-3"
            >
              {current.image ? (
                <img src={current.image} alt={current.nome} className="w-28 h-28 md:w-36 md:h-36 object-contain drop-shadow-lg" />
              ) : (
                <span className="text-7xl md:text-8xl drop-shadow-lg">{current.emoji}</span>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* NFT Info */}
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
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-gradient-to-r ${current.cor} text-white`}>
                  {current.raridade}
                </span>
                <span className="text-[11px] font-mono text-muted-foreground">#{current.id.split('-')[1]?.padStart(4, '0')}</span>
              </div>
              <h3 className="font-bold text-foreground text-sm mb-1 truncate">{current.nome}</h3>
              <p className="text-lg font-black text-primary">
                R$ {current.preco.toFixed(2).replace('.', ',')}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dots */}
        <div className="flex gap-1 px-4 pb-4">
          {featured.map((nft, i) => (
            <button
              key={nft.id}
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
      {/* Mempool canvas background — fills entire hero */}
      <MempoolBackground containerRef={sectionRef as React.RefObject<HTMLElement>} />

      {/* Lighter overlays so mempool blocks show through */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background/60 pointer-events-none z-[1]" />
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none z-[1]" />

      {/* Primary glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/[0.06] dark:bg-primary/[0.1] rounded-full blur-[150px] pointer-events-none z-[1]" />

      <div className="container mx-auto px-4 relative z-10 py-12 md:py-20 lg:py-24">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">

          {/* Left: Content */}
          <div className="flex-1 w-full max-w-2xl text-center lg:text-left">
            {/* Live badge */}
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

            {/* CTA buttons */}
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

            {/* Stats row */}
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

          {/* Right: Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="flex-shrink-0 w-full max-w-[340px] lg:max-w-[380px]"
          >
            <NFTShowcase />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
