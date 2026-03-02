import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity } from "lucide-react";

interface TicketVisualizerProps {
  totalTickets: number;
  userTickets: number;
  maxDisplay?: number;
}

interface TicketBlock {
  id: string;
  count: number;
  type: "user" | "pool";
  x: number;
  y: number;
  size: number; // side length in grid units
}

const GRID_SIZE = 40; // 40x40 grid resolution

// Gravity Bin-Packing Logic
const packWithGravity = (
  values: { id: string, count: number, type: "user" | "pool" }[]
): TicketBlock[] => {
  const result: TicketBlock[] = [];
  const grid = Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(false));

  const totalCount = values.reduce((sum, v) => sum + v.count, 0);
  // Fill about 70% of the grid to ensure we don't overflow
  const fillTarget = GRID_SIZE * GRID_SIZE * 0.7;
  const scaleArea = fillTarget / Math.max(1, totalCount);

  const prepped = values.map(v => ({
    ...v,
    side: Math.max(1, Math.round(Math.sqrt(v.count * scaleArea)))
  })).sort((a, b) => b.side - a.side);

  const isFree = (x: number, y: number, s: number) => {
    if (x + s > GRID_SIZE || y + s > GRID_SIZE) return false;
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
    // Iterate from bottom row up (Gravity)
    for (let y = GRID_SIZE - item.side; y >= 0 && !found; y--) {
      const centerStart = Math.floor((GRID_SIZE - item.side) / 2);

      for (let offset = 0; offset <= GRID_SIZE; offset++) {
        const checkX = [centerStart - offset, centerStart + offset];
        for (const x of checkX) {
          if (x >= 0 && x <= GRID_SIZE - item.side && isFree(x, y, item.side)) {
            occupy(x, y, item.side);
            result.push({
              id: item.id,
              count: item.count,
              type: item.type,
              x,
              y,
              size: item.side
            });
            found = true;
            break;
          }
        }
        if (found) break;
      }
    }
  }

  return result;
};

export const TicketVisualizer: React.FC<TicketVisualizerProps> = ({
  totalTickets,
  userTickets,
  maxDisplay = 400,
}) => {
  const [hoveredBlock, setHoveredBlock] = useState<string | null>(null);

  const blocks = useMemo(() => {
    const list: { id: string, count: number, type: "user" | "pool" }[] = [];

    if (userTickets > 0) {
      list.push({ id: "user-block", count: userTickets, type: "user" });
    }

    let poolRemaining = Math.max(0, Math.min(totalTickets, maxDisplay) - userTickets);
    let i = 0;
    while (poolRemaining > 0) {
      const possibleSizes = [50, 20, 10, 5, 2, 1].filter(s => s <= poolRemaining);
      const size = possibleSizes[0];
      list.push({ id: `pool-${i}`, count: size, type: "pool" });
      poolRemaining -= size;
      i++;
    }

    return packWithGravity(list);
  }, [totalTickets, userTickets, maxDisplay]);

  const getBlockColor = (type: "user" | "pool", id: string) => {
    if (type === "user") return "hsl(var(--primary))";
    const seed = id.split("-")[1] || "0";
    const hue = 210 + (parseInt(seed) % 6) * 10;
    const lightness = 10 + (parseInt(seed) % 4) * 6;
    return `hsl(${hue}, 80%, ${lightness}%)`;
  };

  return (
    <div className="bg-card/40 backdrop-blur-md rounded-3xl border border-white/10 p-6 space-y-6 shadow-2xl relative overflow-hidden group">
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/20 rounded-lg">
            <Activity className="w-5 h-5 text-primary animate-pulse" />
          </div>
          <div>
            <h3 className="font-black text-sm text-foreground uppercase tracking-wider">Mempool Ao Vivo</h3>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter opacity-70">Posicionamento por Gravidade</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-tighter">
          <div className="flex items-center gap-1.5 text-primary">
            <div className="w-2.5 h-2.5 rounded-sm bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
            <span>VOCÊ</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <div className="w-2.5 h-2.5 rounded-sm bg-blue-900/40 border border-white/10" />
            <span>OUTROS</span>
          </div>
        </div>
      </div>

      <div className="relative w-full bg-black/90 rounded-2xl border border-white/5 shadow-inner overflow-hidden aspect-square">
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{ backgroundImage: `linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)`, backgroundSize: `${100 / GRID_SIZE}% ${100 / GRID_SIZE}%` }} />

        <div className="absolute inset-0 p-2">
          <AnimatePresence>
            {blocks.map((block) => (
              <motion.div
                key={block.id}
                layout
                initial={{ opacity: 0, scale: 0, y: -50 }}
                animate={{
                  opacity: hoveredBlock && hoveredBlock !== block.id ? 0.3 : 1,
                  scale: 1,
                  y: 0,
                  left: `${(block.x / GRID_SIZE) * 100}%`,
                  top: `${(block.y / GRID_SIZE) * 100}%`,
                  width: `${(block.size / GRID_SIZE) * 100}%`,
                  height: `${(block.size / GRID_SIZE) * 100}%`,
                }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 180,
                  damping: 20,
                  layout: { duration: 0.4 }
                }}
                className="absolute p-[0.5px] cursor-pointer"
                onHoverStart={() => setHoveredBlock(block.id)}
                onHoverEnd={() => setHoveredBlock(null)}
              >
                <div
                  className={`w-full h-full rounded-[1px] border ${block.type === "user"
                      ? "border-primary shadow-[0_0_20px_rgba(var(--primary),0.6)] z-20"
                      : "border-white/10 hover:border-white/30 z-10"
                    } transition-all duration-300 relative overflow-hidden`}
                  style={{ backgroundColor: getBlockColor(block.type, block.id) }}
                >
                  {hoveredBlock === block.id && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/90 backdrop-blur-[1px] z-50 p-1">
                      <div className="text-[8px] font-black leading-tight text-center text-white uppercase tracking-tighter">
                        {block.count} {block.count === 1 ? "Ticket" : "Tickets"}
                        {block.type === "user" && <div className="text-primary mt-0.5">VOCÊ</div>}
                      </div>
                    </div>
                  )}
                  {block.type === "user" && <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent pointer-events-none animate-pulse" />}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_bottom,transparent_50%,rgba(255,255,255,0.02)_50%)] bg-[length:100%_4px] animate-[scan_8s_linear_infinite] opacity-40" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
          <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1 tracking-widest">Global</p>
          <p className="text-2xl font-black text-foreground">{totalTickets}</p>
        </div>
        <div className="bg-primary/10 rounded-2xl p-4 border border-primary/20">
          <p className="text-[10px] font-bold text-primary uppercase mb-1 tracking-widest">Sua Chance</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-primary">
              {((userTickets / Math.max(1, totalTickets)) * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
