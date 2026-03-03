import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy } from "lucide-react";

interface TicketBlock {
  id: string;
  type: "user" | "pool";
  x: number;
  y: number;
}

const GRID_SIZE = 60;
const CELL = 1; // each ticket = 1x1 cell

// Pack 1x1 tiles densely inside circle or square
const packTiles = (
  tiles: { id: string; type: "user" | "pool" }[],
  variant: "square" | "circular"
): TicketBlock[] => {
  const result: TicketBlock[] = [];
  const center = GRID_SIZE / 2;
  const outerR = GRID_SIZE / 2 - 0.5;

  // Pre-build list of valid cells
  const cells: [number, number][] = [];

  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      if (variant === "circular") {
        // Cell center must be inside circle
        const cx = x + 0.5;
        const cy = y + 0.5;
        if (Math.sqrt((cx - center) ** 2 + (cy - center) ** 2) <= outerR - 0.5) {
          cells.push([x, y]);
        }
      } else {
        cells.push([x, y]);
      }
    }
  }

  // Place tiles into available cells
  for (let i = 0; i < Math.min(tiles.length, cells.length); i++) {
    const [x, y] = cells[i];
    result.push({ id: tiles[i].id, type: tiles[i].type, x, y });
  }

  return result;
};

// Sort tiles in clockwise order from top for roulette
const sortTilesClockwise = (tiles: TicketBlock[]): number[] => {
  const center = GRID_SIZE / 2;
  return tiles
    .map((t, idx) => ({
      idx,
      angle: Math.atan2(t.y + 0.5 - center, t.x + 0.5 - center),
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
  maxDisplay = 300,
  variant = "square",
  isDrawing = false,
  onDrawComplete,
}) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [rouletteHighlight, setRouletteHighlight] = useState(-1);
  const [roulettePhase, setRoulettePhase] = useState<"idle" | "spinning" | "done">("idle");
  const [winnerId, setWinnerId] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Build individual tiles: 1 tile per ticket
  const tiles = useMemo(() => {
    const list: { id: string; type: "user" | "pool" }[] = [];

    const cappedUser = Math.min(userTickets, maxDisplay);
    for (let i = 0; i < cappedUser; i++) {
      list.push({ id: `user-${i}`, type: "user" });
    }

    const otherMax = maxDisplay - cappedUser;
    const otherCount = Math.min(Math.max(0, totalTickets - userTickets), otherMax);
    for (let i = 0; i < otherCount; i++) {
      list.push({ id: `pool-${i}`, type: "pool" });
    }

    return packTiles(list, variant);
  }, [totalTickets, userTickets, maxDisplay, variant]);

  // Roulette spin order (clockwise for circular, sequential for square)
  const spinOrder = useMemo(
    () => (variant === "circular" ? sortTilesClockwise(tiles) : tiles.map((_, i) => i)),
    [tiles, variant]
  );

  // Roulette animation
  useEffect(() => {
    if (!isDrawing || tiles.length === 0) return;
    if (timerRef.current) clearTimeout(timerRef.current);

    // Winner is a random user tile if available, else random pool tile
    const userTiles = tiles.filter((t) => t.type === "user");
    const winnerTile = userTiles.length > 0
      ? userTiles[Math.floor(Math.random() * userTiles.length)]
      : tiles[Math.floor(Math.random() * tiles.length)];

    const winnerGlobalIdx = tiles.findIndex((t) => t.id === winnerTile.id);
    const winnerSpinPos = spinOrder.indexOf(winnerGlobalIdx);

    let spinIdx = 0;
    let ticks = 0;
    const fastTicks = spinOrder.length * 3;
    let delay = 30;
    let slowing = false;

    setRoulettePhase("spinning");
    setWinnerId(null);
    setRouletteHighlight(-1);

    const tick = () => {
      spinIdx = (spinIdx + 1) % spinOrder.length;
      setRouletteHighlight(spinOrder[spinIdx]);
      ticks++;

      if (!slowing && ticks >= fastTicks) slowing = true;

      if (slowing) {
        delay = Math.min(delay * 1.22, 500);
        if (spinIdx === winnerSpinPos && delay > 350) {
          setRoulettePhase("done");
          setWinnerId(winnerTile.id);
          if (onDrawComplete) setTimeout(onDrawComplete, 3000);
          return;
        }
      }

      timerRef.current = setTimeout(tick, delay);
    };

    timerRef.current = setTimeout(tick, delay);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [isDrawing, tiles, spinOrder]);

  const getTileColor = useCallback(
    (tile: TicketBlock, globalIdx: number): string => {
      const highlighted = isDrawing && rouletteHighlight === globalIdx;
      const winner = isDrawing && roulettePhase === "done" && tile.id === winnerId;
      if (winner) return "hsl(45, 95%, 55%)";
      if (highlighted) return "hsl(142, 80%, 55%)";
      if (tile.type === "user") return "hsl(142, 60%, 38%)";
      // Pool tiles: slight hue variation based on index for visual richness
      const seed = parseInt(tile.id.split("-")[1] ?? "0");
      const hue = 210 + (seed % 8) * 5;
      const lightness = 18 + (seed % 4) * 4;
      return `hsl(${hue}, 55%, ${lightness}%)`;
    },
    [isDrawing, rouletteHighlight, roulettePhase, winnerId]
  );

  const userCount = tiles.filter((t) => t.type === "user").length;
  const poolCount = tiles.filter((t) => t.type === "pool").length;
  const userPct = totalTickets > 0 ? ((userTickets / totalTickets) * 100).toFixed(1) : "0";
  const poolPct = totalTickets > 0 ? (100 - (userTickets / totalTickets) * 100).toFixed(1) : "0";
  const cellPct = `${(1 / GRID_SIZE) * 100}%`;

  const grid = (
    <div className="relative w-full h-full">
      {tiles.map((tile, idx) => {
        const highlighted = isDrawing && rouletteHighlight === idx;
        const winner = isDrawing && roulettePhase === "done" && tile.id === winnerId;
        const hovered = !isDrawing && hoveredId === tile.id;
        const isUser = tile.type === "user";

        return (
          <div
            key={tile.id}
            className="absolute transition-all duration-75"
            style={{
              left: `${(tile.x / GRID_SIZE) * 100}%`,
              top: `${(tile.y / GRID_SIZE) * 100}%`,
              width: cellPct,
              height: cellPct,
              padding: "0.5px",
              zIndex: winner ? 20 : highlighted ? 15 : isUser ? 5 : 1,
            }}
            onMouseEnter={() => !isDrawing && setHoveredId(tile.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <div
              className="w-full h-full rounded-[1px]"
              style={{
                backgroundColor: getTileColor(tile, idx),
                border: winner
                  ? "1px solid rgba(234,179,8,0.9)"
                  : highlighted
                    ? "1px solid rgba(74,222,128,0.9)"
                    : isUser
                      ? "1px solid rgba(74,222,128,0.35)"
                      : "1px solid rgba(255,255,255,0.06)",
                boxShadow: winner
                  ? "0 0 8px rgba(234,179,8,0.8), 0 0 20px rgba(234,179,8,0.3)"
                  : highlighted
                    ? "0 0 6px rgba(74,222,128,0.7)"
                    : isUser
                      ? "0 0 3px rgba(74,222,128,0.2)"
                      : "none",
                opacity: isDrawing ? (highlighted || winner ? 1 : 0.12) : 1,
                transform: winner ? "scale(1.4)" : highlighted ? "scale(1.2)" : "scale(1)",
              }}
            />
          </div>
        );
      })}

      {/* Winner badge */}
      {isDrawing && roulettePhase === "done" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none"
        >
          <motion.div
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="bg-black/75 backdrop-blur-sm rounded-full flex flex-col items-center justify-center gap-1"
            style={{ width: "36%", aspectRatio: "1" }}
          >
            <Trophy className="w-5 h-5 text-yellow-400" />
            <p className="text-[8px] font-black text-yellow-300 uppercase tracking-[0.15em]">Vencedor!</p>
          </motion.div>
        </motion.div>
      )}
    </div>
  );

  if (variant === "circular") {
    return (
      <div className="relative w-full aspect-square">
        {/* Subtle glowing ring edge */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none z-10"
          style={{ boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.07), 0 0 30px rgba(99,102,241,0.12)" }}
        />
        {/* Clip to circle */}
        <div className="absolute inset-0 rounded-full overflow-hidden bg-[hsl(222,30%,6%)]">
          {grid}
        </div>
        {/* % badges at bottom */}
        <div
          className="absolute left-0 right-0 flex justify-center gap-2 z-20 pointer-events-none"
          style={{ bottom: "7%" }}
        >
          <div className="flex items-center gap-1 bg-black/85 border border-white/10 px-2 py-0.5 rounded-full">
            <div className="w-1.5 h-1.5 rounded-sm bg-green-400" />
            <span className="text-[9px] font-black text-green-300">{userCount} tickets ({userPct}%)</span>
          </div>
          {poolCount > 0 && (
            <div className="flex items-center gap-1 bg-black/85 border border-white/10 px-2 py-0.5 rounded-full">
              <div className="w-1.5 h-1.5 rounded-sm bg-blue-400/60" />
              <span className="text-[9px] font-black text-white/50">{poolCount} outros ({poolPct}%)</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Square variant
  return (
    <div className="bg-card/40 backdrop-blur-md rounded-3xl border border-white/10 p-6 space-y-6 shadow-2xl">
      <div className="relative w-full aspect-square bg-black/80 rounded-2xl border border-white/5 overflow-hidden">
        {grid}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
          <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1 tracking-widest">Total</p>
          <p className="text-2xl font-black text-foreground">{totalTickets}</p>
        </div>
        <div className="bg-green-500/10 rounded-2xl p-4 border border-green-500/20">
          <p className="text-[10px] font-bold text-green-500 uppercase mb-1 tracking-widest">Sua Chance</p>
          <p className="text-2xl font-black text-green-400">{userPct}%</p>
        </div>
      </div>
    </div>
  );
};
