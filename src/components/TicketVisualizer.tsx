import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy } from "lucide-react";

interface TicketBlock {
  id: string;
  count: number;
  type: "user" | "pool";
  x: number;
  y: number;
  size: number;
}

const GRID_SIZE = 64;

// Dense circular packing — fills full circle, no inner hole, tight scan
const packBlocks = (
  values: { id: string; count: number; type: "user" | "pool" }[],
  variant: "square" | "circular"
): TicketBlock[] => {
  const result: TicketBlock[] = [];
  const grid = Array(GRID_SIZE)
    .fill(0)
    .map(() => Array(GRID_SIZE).fill(false));

  const totalCount = values.reduce((sum, v) => sum + v.count, 0);
  // Circular fills ~78% of bounding square (π/4), aim for ~95% of that usable area
  const fillRatio = variant === "circular" ? 0.68 : 0.72;
  const fillTarget = GRID_SIZE * GRID_SIZE * fillRatio;
  const scaleArea = fillTarget / Math.max(1, totalCount);

  const prepped = values
    .map((v) => ({
      ...v,
      side: Math.max(1, Math.round(Math.sqrt(v.count * scaleArea))),
    }))
    .sort((a, b) => b.side - a.side);

  const center = GRID_SIZE / 2;
  const outerR = GRID_SIZE / 2 - 0.5; // tight to boundary

  const isFree = (x: number, y: number, s: number): boolean => {
    if (x + s > GRID_SIZE || y + s > GRID_SIZE || x < 0 || y < 0) return false;
    if (variant === "circular") {
      // Check 12 points: 4 corners + 4 edge midpoints + 4 inner quarter points
      const checks: [number, number][] = [
        [x, y], [x + s, y], [x, y + s], [x + s, y + s],
        [x + s * 0.5, y], [x + s * 0.5, y + s],
        [x, y + s * 0.5], [x + s, y + s * 0.5],
        [x + s * 0.25, y + s * 0.25], [x + s * 0.75, y + s * 0.25],
        [x + s * 0.25, y + s * 0.75], [x + s * 0.75, y + s * 0.75],
      ];
      for (const [cx, cy] of checks) {
        if (Math.sqrt((cx - center) ** 2 + (cy - center) ** 2) > outerR) return false;
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
    if (variant === "square") {
      // Bottom-up gravity packing
      for (let y = GRID_SIZE - item.side; y >= 0 && !found; y--) {
        const colRange = Array.from({ length: GRID_SIZE - item.side + 1 }, (_, i) => i);
        const mid = (GRID_SIZE - item.side) / 2;
        colRange.sort((a, b) => Math.abs(a - mid) - Math.abs(b - mid));
        for (const x of colRange) {
          if (isFree(x, y, item.side)) {
            occupy(x, y, item.side);
            result.push({ id: item.id, count: item.count, type: item.type, x, y, size: item.side });
            found = true;
            break;
          }
        }
      }
    } else {
      // Circular: scan top-to-bottom, left-to-right for dense packing
      outer: for (let y = 0; y <= GRID_SIZE - item.side; y++) {
        for (let x = 0; x <= GRID_SIZE - item.side; x++) {
          if (isFree(x, y, item.side)) {
            occupy(x, y, item.side);
            result.push({ id: item.id, count: item.count, type: item.type, x, y, size: item.side });
            found = true;
            break outer;
          }
        }
      }
    }
  }

  return result;
};

// Sort blocks in clockwise order from top for natural roulette spin
const sortBlocksClockwise = (blocks: TicketBlock[]): number[] => {
  const center = GRID_SIZE / 2;
  return blocks
    .map((b, idx) => ({
      idx,
      angle: Math.atan2(
        b.y + b.size / 2 - center,
        b.x + b.size / 2 - center
      ),
    }))
    .sort((a, b) => a.angle - b.angle)
    .map((x) => x.idx);
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
  maxDisplay = 500,
  variant = "square",
  isDrawing = false,
  onDrawComplete,
}) => {
  const [hoveredBlock, setHoveredBlock] = useState<string | null>(null);
  const [rouletteHighlight, setRouletteHighlight] = useState(-1);
  const [roulettePhase, setRoulettePhase] = useState<"idle" | "fast" | "done">("idle");
  const [winnerId, setWinnerId] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const blocks = useMemo(() => {
    const list: { id: string; count: number; type: "user" | "pool" }[] = [];
    if (userTickets > 0)
      list.push({ id: "user-block", count: userTickets, type: "user" });

    let poolRemaining = Math.max(0, Math.min(totalTickets, maxDisplay) - userTickets);
    let i = 0;
    while (poolRemaining > 0) {
      const size = [20, 10, 5, 2, 1].find((s) => s <= poolRemaining) ?? 1;
      list.push({ id: `pool-${i}`, count: size, type: "pool" });
      poolRemaining -= size;
      i++;
    }
    return packBlocks(list, variant);
  }, [totalTickets, userTickets, maxDisplay, variant]);

  // Clockwise order for roulette
  const rouletteOrder = useMemo(
    () => (variant === "circular" ? sortBlocksClockwise(blocks) : blocks.map((_, i) => i)),
    [blocks, variant]
  );

  // Roulette animation
  useEffect(() => {
    if (!isDrawing || blocks.length === 0) return;
    if (intervalRef.current) clearTimeout(intervalRef.current);

    const userBlock = blocks.find((b) => b.type === "user");
    const winBlock = userBlock ?? blocks[Math.floor(Math.random() * blocks.length)];
    const winnerOriginalIdx = blocks.findIndex((b) => b.id === winBlock.id);
    // Find position of winner in roulette order
    const winnerRoulettePos = rouletteOrder.indexOf(winnerOriginalIdx);

    let rouletteIdx = 0; // index into rouletteOrder
    let ticks = 0;
    const totalFastTicks = rouletteOrder.length * 4;
    let delay = 55;
    let slowing = false;

    setRoulettePhase("fast");
    setWinnerId(null);

    const tick = () => {
      rouletteIdx = (rouletteIdx + 1) % rouletteOrder.length;
      setRouletteHighlight(rouletteOrder[rouletteIdx]);
      ticks++;

      if (!slowing && ticks >= totalFastTicks) slowing = true;

      if (slowing) {
        delay = Math.min(delay * 1.2, 600);
        if (rouletteIdx === winnerRoulettePos && delay > 400) {
          setRoulettePhase("done");
          setWinnerId(winBlock.id);
          if (onDrawComplete) setTimeout(onDrawComplete, 3000);
          return;
        }
      }

      intervalRef.current = setTimeout(tick, delay);
    };

    intervalRef.current = setTimeout(tick, delay);
    return () => {
      if (intervalRef.current) clearTimeout(intervalRef.current);
    };
  }, [isDrawing, blocks, rouletteOrder]);

  const getBlockColor = useCallback(
    (block: TicketBlock, globalIdx: number): string => {
      const highlighted = isDrawing && rouletteHighlight === globalIdx;
      const winner = isDrawing && roulettePhase === "done" && block.id === winnerId;
      if (winner) return "hsl(45, 95%, 55%)";
      if (highlighted) return "hsl(142, 70%, 50%)";
      if (block.type === "user") return "hsl(142, 65%, 40%)";
      if (variant === "circular") {
        const seed = parseInt(block.id.split("-")[1] ?? "0");
        const hues = [210, 230, 250, 270, 195, 220];
        return `hsl(${hues[seed % hues.length]}, 55%, 28%)`;
      }
      const seed = parseInt(block.id.split("-")[1] ?? "0");
      return `hsl(${210 + (seed % 6) * 10}, 75%, ${12 + (seed % 4) * 5}%)`;
    },
    [isDrawing, rouletteHighlight, roulettePhase, winnerId, variant]
  );

  const userPercentage = totalTickets > 0 ? ((userTickets / totalTickets) * 100).toFixed(1) : "0";
  const poolPercentage = totalTickets > 0 ? (100 - (userTickets / totalTickets) * 100).toFixed(1) : "0";

  const visualizerContent = (
    <div className="relative w-full h-full">
      {/* Square mode: subtle grid background */}
      {variant === "square" && (
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)`,
            backgroundSize: `${100 / GRID_SIZE}% ${100 / GRID_SIZE}%`,
          }}
        />
      )}

      {/* Blocks */}
      <div className="absolute inset-0">
        <AnimatePresence>
          {blocks.map((block, idx) => {
            const highlighted = isDrawing && rouletteHighlight === idx;
            const winner = isDrawing && roulettePhase === "done" && block.id === winnerId;
            const isUser = block.type === "user";
            const hovered = !isDrawing && hoveredBlock === block.id;

            return (
              <motion.div
                key={block.id}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{
                  opacity: isDrawing ? (highlighted || winner ? 1 : 0.15) : 1,
                  scale: winner ? 1.2 : highlighted ? 1.1 : 1,
                  left: `${(block.x / GRID_SIZE) * 100}%`,
                  top: `${(block.y / GRID_SIZE) * 100}%`,
                  width: `${(block.size / GRID_SIZE) * 100}%`,
                  height: `${(block.size / GRID_SIZE) * 100}%`,
                  zIndex: winner ? 40 : highlighted ? 30 : isUser ? 15 : 10,
                }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{
                  opacity: { duration: 0.08 },
                  scale: { type: "spring", stiffness: 400, damping: 20 },
                  layout: { duration: 0.3 },
                }}
                className="absolute p-px cursor-pointer"
                onHoverStart={() => setHoveredBlock(block.id)}
                onHoverEnd={() => setHoveredBlock(null)}
              >
                <div
                  className="w-full h-full rounded-[2px] relative overflow-hidden"
                  style={{
                    backgroundColor: getBlockColor(block, idx),
                    border: winner
                      ? "1px solid rgba(234,179,8,0.9)"
                      : highlighted
                        ? "1px solid rgba(74,222,128,0.8)"
                        : isUser
                          ? "1px solid rgba(74,222,128,0.4)"
                          : "1px solid rgba(255,255,255,0.07)",
                    boxShadow: winner
                      ? "0 0 20px rgba(234,179,8,0.7), 0 0 60px rgba(234,179,8,0.3)"
                      : highlighted
                        ? "0 0 12px rgba(74,222,128,0.6)"
                        : isUser
                          ? "0 0 6px rgba(74,222,128,0.25)"
                          : "none",
                  }}
                >
                  {/* Winner pulse ring */}
                  {winner && (
                    <motion.div
                      className="absolute inset-0 rounded-[2px]"
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ repeat: Infinity, duration: 0.8 }}
                      style={{ border: "2px solid rgba(234,179,8,0.8)" }}
                    />
                  )}
                  {/* Hover tooltip */}
                  {hovered && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-50">
                      <span className="text-[8px] font-black text-white">{block.count}</span>
                      <span className={`text-[6px] font-bold uppercase ${isUser ? "text-green-400" : "text-white/50"}`}>
                        {isUser ? "Você" : "Part."}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Winner center overlay */}
      {isDrawing && roulettePhase === "done" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
        >
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 1.2 }}
            className="bg-black/70 backdrop-blur-sm rounded-full flex flex-col items-center justify-center gap-1"
            style={{ width: "38%", aspectRatio: "1" }}
          >
            <Trophy className="w-5 h-5 text-yellow-400" />
            <p className="text-[9px] font-black text-yellow-300 uppercase tracking-widest">Vencedor!</p>
          </motion.div>
        </motion.div>
      )}
    </div>
  );

  if (variant === "circular") {
    return (
      <div className="relative w-full aspect-square">
        {/* Glowing edge ring */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none z-10"
          style={{
            boxShadow: `inset 0 0 0 2px rgba(255,255,255,0.06), 0 0 40px rgba(var(--primary-rgb, 99,102,241), 0.15)`,
          }}
        />
        {/* Circle clip */}
        <div className="absolute inset-0 rounded-full overflow-hidden bg-black/60">
          {visualizerContent}
        </div>
        {/* Percentage badges stuck to bottom of circle */}
        <div
          className="absolute left-0 right-0 flex justify-center gap-2 z-20 pointer-events-none"
          style={{ bottom: "8%" }}
        >
          <div className="flex items-center gap-1 bg-black/80 backdrop-blur-sm border border-white/10 px-2 py-0.5 rounded-full">
            <div className="w-1.5 h-1.5 rounded-sm bg-green-400" />
            <span className="text-[9px] font-black text-green-300">{userPercentage}%</span>
          </div>
          <div className="flex items-center gap-1 bg-black/80 backdrop-blur-sm border border-white/10 px-2 py-0.5 rounded-full">
            <div className="w-1.5 h-1.5 rounded-sm bg-blue-400/60" />
            <span className="text-[9px] font-black text-white/50">{poolPercentage}%</span>
          </div>
        </div>
      </div>
    );
  }

  // Square variant
  return (
    <div className="bg-card/40 backdrop-blur-md rounded-3xl border border-white/10 p-6 space-y-6 shadow-2xl overflow-hidden">
      <div className="relative w-full aspect-square bg-black/80 rounded-2xl border border-white/5 overflow-hidden">
        {visualizerContent}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
          <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1 tracking-widest">Global</p>
          <p className="text-2xl font-black text-foreground">{totalTickets}</p>
        </div>
        <div className="bg-green-500/10 rounded-2xl p-4 border border-green-500/20">
          <p className="text-[10px] font-bold text-green-500 uppercase mb-1 tracking-widest">Sua Chance</p>
          <p className="text-2xl font-black text-green-400">
            {((userTickets / Math.max(1, totalTickets)) * 100).toFixed(1)}%
          </p>
        </div>
      </div>
    </div>
  );
};
