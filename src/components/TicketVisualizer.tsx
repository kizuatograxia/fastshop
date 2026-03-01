import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Grid3X3, Activity } from "lucide-react";

interface TicketVisualizerProps {
  totalTickets: number;
  userTickets: number;
  maxDisplay?: number;
}

interface TicketBlock {
  id: string;
  count: number;
  type: "user" | "pool";
}

const BASE_UNIT = 16; // Size for 1 ticket (px)
const GAP = 4;

export const TicketVisualizer: React.FC<TicketVisualizerProps> = ({
  totalTickets,
  userTickets,
  maxDisplay = 1000,
}) => {
  const [hoveredBlock, setHoveredBlock] = useState<string | null>(null);

  // Generate blocks logic
  const blocks = useMemo(() => {
    const list: TicketBlock[] = [];

    // User block (The growing one)
    if (userTickets > 0) {
      list.push({ id: "user-block", count: userTickets, type: "user" });
    }

    // Pool blocks (Grouped to avoid rendering 1000s of small divs)
    let poolRemaining = Math.min(totalTickets, maxDisplay) - userTickets;
    if (poolRemaining < 0) poolRemaining = 0;

    let i = 0;
    while (poolRemaining > 0) {
      // Chunk sizes: 1, 5, 10, 20, 50, 100
      const sizes = [1, 5, 10, 20, 50, 100].filter(s => s <= poolRemaining);
      const size = sizes.length > 0 ? sizes[Math.floor(Math.random() * sizes.length)] : poolRemaining;

      list.push({
        id: `pool-${i}`,
        count: size,
        type: "pool"
      });
      poolRemaining -= size;
      i++;
    }

    // Sort blocks by count descending for a more organized look
    return list.sort((a, b) => b.count - a.count);
  }, [totalTickets, userTickets, maxDisplay]);

  // Calculate size based on count (Area = count * BASE_UNIT^2)
  // Side = sqrt(count) * BASE_UNIT
  const getBlockSize = (count: number) => {
    const size = Math.sqrt(count) * BASE_UNIT;
    return Math.max(size, BASE_UNIT); // Minimum size of 1 unit
  };

  const getBlockColor = (type: "user" | "pool", id: string) => {
    if (type === "user") return "hsl(var(--primary))";

    // Pool colors: Varying shades of blue/purple like mempool
    const seed = id.split("-")[1] || "0";
    const hue = 220 + (parseInt(seed) % 5) * 12;
    const lightness = 25 + (parseInt(seed) % 6) * 4;
    return `hsl(${hue}, 40%, ${lightness}%)`;
  };

  return (
    <div className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border p-5 space-y-4 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary animate-pulse" />
          <span className="font-bold text-sm text-foreground uppercase tracking-wider">Mempool de Tickets</span>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-tighter">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-primary shadow-[0_0_10px_hsl(var(--primary)/0.5)]" />
            <span className="text-foreground">Seus Bilhetes ({userTickets})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-blue-900/50 border border-blue-500/30" />
            <span className="text-muted-foreground">Outros ({totalTickets - userTickets})</span>
          </div>
        </div>
      </div>

      {/* Mempool Container */}
      <div className="relative min-h-[180px] w-full p-2 bg-black/20 rounded-xl border border-white/5 overflow-hidden">
        <div className="flex flex-wrap items-end content-start gap-1">
          <AnimatePresence mode="popLayout">
            {blocks.map((block) => {
              const size = getBlockSize(block.count);
              return (
                <motion.div
                  layout
                  key={block.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: 1,
                    opacity: 1,
                    width: size,
                    height: size,
                  }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 25,
                    layout: { duration: 0.4 }
                  }}
                  className={`relative rounded-md cursor-pointer border ${block.type === "user"
                    ? "border-primary/50 z-20 shadow-[0_0_20px_rgba(var(--primary),0.3)]"
                    : "border-white/5 hover:border-white/20 z-10"
                    }`}
                  style={{
                    backgroundColor: getBlockColor(block.type, block.id),
                    opacity: hoveredBlock && hoveredBlock !== block.id ? 0.3 : 1,
                  }}
                  onHoverStart={() => setHoveredBlock(block.id)}
                  onHoverEnd={() => setHoveredBlock(null)}
                >
                  {/* Tooltip on hover */}
                  {hoveredBlock === block.id && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute -top-10 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground px-2 py-1 rounded text-[10px] font-bold whitespace-nowrap z-50 shadow-2xl border border-border pointer-events-none"
                    >
                      {block.count} {block.count === 1 ? "Bilhete" : "Bilhetes"}
                      {block.type === "user" && " (Você)"}
                    </motion.div>
                  )}

                  {/* Inner glow for user block */}
                  {block.type === "user" && (
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Background Grid Pattern */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{ backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`, backgroundSize: '16px 16px' }} />
      </div>

      <p className="text-[10px] text-muted-foreground text-center italic">
        * Cada bloco representa uma compra. O tamanho do bloco é proporcional à quantidade de tickets.
      </p>
    </div>
  );
};
