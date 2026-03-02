import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity } from "lucide-react";

interface TicketVisualizerProps {
  totalTickets: number;
  userTickets: number;
  maxDisplay?: number;
  variant?: "square" | "circular";
}

interface TicketBlock {
  id: string;
  count: number;
  type: "user" | "pool";
  x: number;
  y: number;
  size: number; // side length in grid units
}

const GRID_SIZE = 60; // Higher resolution for smooth circular boundary

const packBlocks = (
  values: { id: string, count: number, type: "user" | "pool" }[],
  variant: "square" | "circular"
): TicketBlock[] => {
  const result: TicketBlock[] = [];
  const grid = Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(false));

  const totalCount = values.reduce((sum, v) => sum + v.count, 0);
  const fillTarget = GRID_SIZE * GRID_SIZE * (variant === "circular" ? 0.3 : 0.7);
  const scaleArea = fillTarget / Math.max(1, totalCount);

  const prepped = values.map(v => ({
    ...v,
    side: Math.max(1, Math.round(Math.sqrt(v.count * scaleArea)))
  })).sort((a, b) => b.side - a.side);

  const isFree = (x: number, y: number, s: number) => {
    if (x + s > GRID_SIZE || y + s > GRID_SIZE) return false;

    if (variant === "circular") {
      const center = GRID_SIZE / 2;
      const outerR = GRID_SIZE / 2 - 2;
      const innerR = GRID_SIZE / 4; // Clear center for timer

      const corners = [[x, y], [x + s, y], [x, y + s], [x + s, y + s]];
      for (const [cx, cy] of corners) {
        const dist = Math.sqrt(Math.pow(cx - center, 2) + Math.pow(cy - center, 2));
        if (dist > outerR || dist < innerR) return false;
      }
    }

    for (let r = y; r < y + s; r++) {
      for (let c = x; c < x + s; c++) {
        if (grid[r][c]) return false;
      }
    }
    return true;
  };

  const occupy = (x: number, y: number, s: number) => {
    for (let r = y; r < y + s; r++) {
      for (let c = x; c < x + s; c++) {
        grid[r][c] = true;
      }
    }
  };

  for (const item of prepped) {
    let found = false;

    // For circular, iterate in a random-ish order to avoid bottom-heavy bias
    const rows = Array.from({ length: GRID_SIZE - item.side + 1 }, (_, i) => i);
    if (variant === "circular") rows.sort(() => Math.random() - 0.5);

    for (const y of variant === "square" ? rows.reverse() : rows) {
      const cols = Array.from({ length: GRID_SIZE - item.side + 1 }, (_, i) => i);
      // For square, prioritize center
      if (variant === "square") {
        const center = (GRID_SIZE - item.side) / 2;
        cols.sort((a, b) => Math.abs(a - center) - Math.abs(b - center));
      } else {
        cols.sort(() => Math.random() - 0.5);
      }

      for (const x of cols) {
        if (isFree(x, y, item.side)) {
          occupy(x, y, item.side);
          result.push({ id: item.id, count: item.count, type: item.type, x, y, size: item.side });
          found = true;
          break;
        }
      }
      if (found) break;
    }
  }

  return result;
};

export const TicketVisualizer: React.FC<TicketVisualizerProps> = ({
  totalTickets,
  userTickets,
  maxDisplay = 400,
  variant = "square"
}) => {
  const [hoveredBlock, setHoveredBlock] = useState<string | null>(null);

  const blocks = useMemo(() => {
    const list: { id: string, count: number, type: "user" | "pool" }[] = [];
    if (userTickets > 0) list.push({ id: "user-block", count: userTickets, type: "user" });

    let poolRemaining = Math.max(0, Math.min(totalTickets, maxDisplay) - userTickets);
    let i = 0;
    while (poolRemaining > 0) {
      const possibleSizes = [20, 10, 5, 2, 1].filter(s => s <= poolRemaining);
      const size = possibleSizes[0];
      list.push({ id: `pool-${i}`, count: size, type: "pool" });
      poolRemaining -= size;
      i++;
    }

    return packBlocks(list, variant);
  }, [totalTickets, userTickets, maxDisplay, variant]);

  const getBlockColor = (type: "user" | "pool", id: string) => {
    if (type === "user") return "hsl(var(--primary))";
    const seed = id.split("-")[1] || "0";
    if (variant === "circular") {
      const hues = [200, 240, 280, 45]; // Blue, Purple, Magenta, Gold
      return `hsl(${hues[parseInt(seed) % 4]}, 60%, 40%)`;
    }
    const hue = 210 + (parseInt(seed) % 6) * 10;
    const lightness = 10 + (parseInt(seed) % 4) * 6;
    return `hsl(${hue}, 80%, ${lightness}%)`;
  };

  const visualizerContent = (
    <div className={`relative w-full aspect-square ${variant === "square" ? "bg-black/90 rounded-2xl border border-white/5" : ""}`}>
      {variant === "square" && (
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{ backgroundImage: `linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)`, backgroundSize: `${100 / GRID_SIZE}% ${100 / GRID_SIZE}%` }} />
      )}

      <div className="absolute inset-0 p-2">
        <AnimatePresence>
          {blocks.map((block) => (
            <motion.div
              key={block.id}
              layout
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: hoveredBlock && hoveredBlock !== block.id ? 0.3 : 1,
                scale: 1,
                left: `${(block.x / GRID_SIZE) * 100}%`,
                top: `${(block.y / GRID_SIZE) * 100}%`,
                width: `${(block.size / GRID_SIZE) * 100}%`,
                height: `${(block.size / GRID_SIZE) * 100}%`,
              }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="absolute p-[0.5px] cursor-pointer"
              onHoverStart={() => setHoveredBlock(block.id)}
              onHoverEnd={() => setHoveredBlock(null)}
            >
              <div
                className={`w-full h-full rounded-[1px] border ${block.type === "user"
                    ? "border-primary shadow-[0_0_15px_rgba(var(--primary),0.6)] z-20"
                    : "border-white/10 z-10"
                  } transition-all duration-300 relative overflow-hidden`}
                style={{ backgroundColor: getBlockColor(block.type, block.id) }}
              >
                {hoveredBlock === block.id && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-50 p-1">
                    <span className="text-[7px] font-black text-white">{block.count}</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      {variant === "square" && <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_bottom,transparent_50%,rgba(255,255,255,0.02)_50%)] bg-[length:100%_4px] animate-[scan_8s_linear_infinite] opacity-40" />}
    </div>
  );

  if (variant === "circular") return visualizerContent;

  return (
    <div className="bg-card/40 backdrop-blur-md rounded-3xl border border-white/10 p-6 space-y-6 shadow-2xl relative overflow-hidden">
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/20 rounded-lg">
            <Activity className="w-5 h-5 text-primary animate-pulse" />
          </div>
          <div>
            <h3 className="font-black text-sm text-foreground uppercase tracking-wider">Mempool ao Vivo</h3>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter opacity-70">Tickets Proporcionais</p>
          </div>
        </div>
      </div>

      {visualizerContent}

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
          <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1 tracking-widest">Global</p>
          <p className="text-2xl font-black text-foreground">{totalTickets}</p>
        </div>
        <div className="bg-primary/10 rounded-2xl p-4 border border-primary/20">
          <p className="text-[10px] font-bold text-primary uppercase mb-1 tracking-widest">Sua Chance</p>
          <p className="text-2xl font-black text-primary">{((userTickets / Math.max(1, totalTickets)) * 100).toFixed(1)}%</p>
        </div>
      </div>
    </div>
  );
};
