import React, { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Trophy } from "lucide-react";

interface TicketBlock {
  id: string;
  count: number;
  type: "user" | "pool";
  x: number;
  y: number;
  size: number;
}

const GRID_SIZE = 60;

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
      const innerR = GRID_SIZE / 4;
      const corners = [[x, y], [x + s, y], [x, y + s], [x + s, y + s]];
      for (const [cx, cy] of corners) {
        const dist = Math.sqrt(Math.pow(cx - center, 2) + Math.pow(cy - center, 2));
        if (dist > outerR || dist < innerR) return false;
      }
    }
    for (let r = y; r < y + s; r++)
      for (let c = x; c < x + s; c++)
        if (grid[r][c]) return false;
    return true;
  };

  const occupy = (x: number, y: number, s: number) => {
    for (let r = y; r < y + s; r++)
      for (let c = x; c < x + s; c++)
        grid[r][c] = true;
  };

  for (const item of prepped) {
    let found = false;
    const rows = Array.from({ length: GRID_SIZE - item.side + 1 }, (_, i) => i);
    if (variant === "circular") rows.sort(() => Math.random() - 0.5);

    for (const y of variant === "square" ? rows.reverse() : rows) {
      const cols = Array.from({ length: GRID_SIZE - item.side + 1 }, (_, i) => i);
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

interface TicketVisualizerProps {
  totalTickets: number;
  userTickets: number;
  maxDisplay?: number;
  variant?: "square" | "circular";
  isDrawing?: boolean;
  onDrawComplete?: () => void;
}

export const TicketVisualizer: React.FC<TicketVisualizerProps> = ({
  totalTickets,
  userTickets,
  maxDisplay = 400,
  variant = "square",
  isDrawing = false,
  onDrawComplete,
}) => {
  const [hoveredBlock, setHoveredBlock] = useState<string | null>(null);
  const [rouletteHighlight, setRouletteHighlight] = useState(-1);
  const [roulettePhase, setRoulettePhase] = useState<"fast" | "slow" | "done">("fast");
  const [winnerId, setWinnerId] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // Roulette animation
  useEffect(() => {
    if (!isDrawing || blocks.length === 0) return;

    const userBlock = blocks.find(b => b.type === "user");
    const winBlock = userBlock ?? blocks[Math.floor(Math.random() * blocks.length)];
    const winnerPos = blocks.findIndex(b => b.id === winBlock.id);

    let idx = 0;
    let rounds = 0;
    const totalFastRounds = blocks.length * 4;
    let currentDelay = 60;
    let slowing = false;

    const tick = () => {
      idx = (idx + 1) % blocks.length;
      setRouletteHighlight(idx);
      rounds++;

      if (!slowing && rounds >= totalFastRounds) slowing = true;

      if (slowing) {
        currentDelay = Math.min(currentDelay * 1.18, 700);
        if (idx === winnerPos && currentDelay > 450) {
          setRoulettePhase("done");
          setWinnerId(winBlock.id);
          if (onDrawComplete) setTimeout(onDrawComplete, 2500);
          return;
        }
      }

      intervalRef.current = setTimeout(tick, currentDelay);
    };

    setRoulettePhase("fast");
    setWinnerId(null);
    intervalRef.current = setTimeout(tick, currentDelay);
    return () => { if (intervalRef.current) clearTimeout(intervalRef.current); };
  }, [isDrawing, blocks]);

  const getBlockColor = (block: TicketBlock, idx: number) => {
    const isHighlighted = isDrawing && rouletteHighlight === idx;
    const isWinner = isDrawing && roulettePhase === "done" && block.id === winnerId;

    if (isWinner) return "hsl(45, 95%, 55%)";
    if (isHighlighted) return "hsl(142, 70%, 45%)";
    if (block.type === "user") return "hsl(142, 70%, 45%)"; // GREEN for user
    if (variant === "circular") {
      const hues = [200, 240, 280, 45];
      return `hsl(${hues[parseInt(block.id.split("-")[1] || "0") % 4]}, 60%, 30%)`;
    }
    const seed = block.id.split("-")[1] || "0";
    const hue = 210 + (parseInt(seed) % 6) * 10;
    return `hsl(${hue}, 80%, ${10 + (parseInt(seed) % 4) * 6}%)`;
  };

  const isWinnerBlock = (block: TicketBlock) => isDrawing && roulettePhase === "done" && block.id === winnerId;
  const isHighlightedBlock = (_block: TicketBlock, idx: number) => isDrawing && rouletteHighlight === idx;

  const userPercentage = totalTickets > 0 ? ((userTickets / totalTickets) * 100).toFixed(1) : "0";
  const poolPercentage = totalTickets > 0 ? (100 - (userTickets / totalTickets) * 100).toFixed(1) : "0";

  const visualizerContent = (
    <div className={`relative w-full aspect-square ${variant === "square" ? "bg-black/90 rounded-2xl border border-white/5" : ""}`}>
      {variant === "square" && (
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{ backgroundImage: `linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)`, backgroundSize: `${100 / GRID_SIZE}% ${100 / GRID_SIZE}%` }} />
      )}

      <div className="absolute inset-0 p-2">
        <AnimatePresence>
          {blocks.map((block, idx) => {
            const highlighted = isHighlightedBlock(block, idx);
            const winner = isWinnerBlock(block);
            const isHovered = hoveredBlock === block.id;
            const isUserBlock = block.type === "user";

            return (
              <motion.div
                key={block.id}
                layout
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: isDrawing
                    ? (highlighted || winner ? 1 : 0.2)
                    : (hoveredBlock && hoveredBlock !== block.id ? 0.3 : 1),
                  scale: winner ? 1.15 : highlighted ? 1.08 : isHovered && isUserBlock ? 1.05 : 1,
                  left: `${(block.x / GRID_SIZE) * 100}%`,
                  top: `${(block.y / GRID_SIZE) * 100}%`,
                  width: `${(block.size / GRID_SIZE) * 100}%`,
                  height: `${(block.size / GRID_SIZE) * 100}%`,
                  zIndex: winner ? 30 : highlighted ? 20 : isUserBlock ? 15 : 10,
                }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="absolute p-[0.5px] cursor-pointer"
                onHoverStart={() => !isDrawing && setHoveredBlock(block.id)}
                onHoverEnd={() => setHoveredBlock(null)}
              >
                <div
                  className={`w-full h-full rounded-[1px] border transition-all duration-100 relative overflow-hidden ${winner
                      ? "border-yellow-400 shadow-[0_0_30px_rgba(234,179,8,0.8)]"
                      : highlighted
                        ? "border-green-400 shadow-[0_0_20px_rgba(34,197,94,0.8)]"
                        : isUserBlock
                          ? "border-green-500/60 shadow-[0_0_10px_rgba(34,197,94,0.4)]"
                          : "border-white/10"
                    }`}
                  style={{ backgroundColor: getBlockColor(block, idx) }}
                >
                  {!isDrawing && isHovered && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-50 p-1">
                      <span className="text-[8px] font-black text-white tabular-nums">{block.count} tickets</span>
                      <span className={`text-[6px] font-bold uppercase ${isUserBlock ? "text-green-400" : "text-white/50"}`}>
                        {isUserBlock ? "Você" : "Participante"}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Winner overlay */}
      {isDrawing && roulettePhase === "done" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none"
        >
          <div className="bg-black/80 backdrop-blur-sm rounded-full p-6 text-center flex flex-col items-center gap-2"
            style={{ width: '45%', aspectRatio: '1' }}>
            <Trophy className="w-6 h-6 text-yellow-400" />
            <p className="text-[10px] font-black text-yellow-300 uppercase">Vencedor!</p>
          </div>
        </motion.div>
      )}

      {variant === "square" && (
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_bottom,transparent_50%,rgba(255,255,255,0.02)_50%)] bg-[length:100%_4px] animate-[scan_8s_linear_infinite] opacity-40" />
      )}
    </div>
  );

  if (variant === "circular") {
    return (
      <div className="relative w-full">
        {visualizerContent}
        {/* Floating % badges */}
        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-3 pointer-events-none">
          <div className="flex items-center gap-1.5 bg-black/70 backdrop-blur-sm px-2.5 py-1 rounded-full">
            <div className="w-2 h-2 rounded-sm bg-green-500" />
            <span className="text-[10px] font-black text-white">{userPercentage}%</span>
          </div>
          <div className="flex items-center gap-1.5 bg-black/70 backdrop-blur-sm px-2.5 py-1 rounded-full">
            <div className="w-2 h-2 rounded-sm bg-blue-600/60" />
            <span className="text-[10px] font-black text-white/60">{poolPercentage}%</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card/40 backdrop-blur-md rounded-3xl border border-white/10 p-6 space-y-6 shadow-2xl relative overflow-hidden">
      <div className="flex items-center gap-3 relative z-10">
        <div className="p-2 bg-green-500/20 rounded-lg">
          <Activity className="w-5 h-5 text-green-500 animate-pulse" />
        </div>
        <div>
          <h3 className="font-black text-sm text-foreground uppercase tracking-wider">Mempool ao Vivo</h3>
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter opacity-70">Tickets Proporcionais</p>
        </div>
      </div>
      {visualizerContent}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
          <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1 tracking-widest">Global</p>
          <p className="text-2xl font-black text-foreground">{totalTickets}</p>
        </div>
        <div className="bg-green-500/10 rounded-2xl p-4 border border-green-500/20">
          <p className="text-[10px] font-bold text-green-500 uppercase mb-1 tracking-widest">Sua Chance</p>
          <p className="text-2xl font-black text-green-500">{((userTickets / Math.max(1, totalTickets)) * 100).toFixed(1)}%</p>
        </div>
      </div>
    </div>
  );
};
