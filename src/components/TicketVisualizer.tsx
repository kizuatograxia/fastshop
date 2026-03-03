import React, { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Zap } from "lucide-react";

interface TicketVisualizerProps {
  /** Total slots available in the raffle (maxParticipantes) */
  totalSlots: number;
  /** How many tickets have been sold */
  soldTickets: number;
  /** How many of the sold tickets belong to the current user */
  userTickets: number;
  /** Shape variant */
  variant?: "square" | "circular";
  /** Whether draw animation is active */
  isDrawing?: boolean;
  /** Callback when draw animation completes */
  onDrawComplete?: (winnerIndex: number) => void | Promise<void>;
  /** Winner information to display at the end */
  winner?: { name: string; picture: string };
}

// Seeded PRNG for deterministic shuffle
const seededRandom = (seed: number) => {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    return s / 0x7fffffff;
  };
};

export const TicketVisualizer: React.FC<TicketVisualizerProps> = ({
  totalSlots,
  soldTickets,
  userTickets,
  variant = "square",
  isDrawing = false,
  onDrawComplete,
  winner,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number>(0);
  const [size, setSize] = useState(0);
  const [hoveredCell, setHoveredCell] = useState<number | null>(null);
  const [drawPhase, setDrawPhase] = useState<"idle" | "scanning" | "slowing" | "done">("idle");
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const [winnerIdx, setWinnerIdx] = useState(-1);
  const drawTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Progressive reveal state
  const [revealedCount, setRevealedCount] = useState(0);
  const revealCompleteRef = useRef(false);

  // Compute grid dimensions
  const capped = Math.min(totalSlots, 2500);
  const scale = totalSlots > 2500 ? totalSlots / 2500 : 1;
  const cols = Math.ceil(Math.sqrt(capped * (variant === "circular" ? 1.1 : 1)));
  const rows = Math.ceil(capped / cols);

  // Build cell data
  const cells = useMemo(() => {
    const arr: ("user" | "pool" | "empty")[] = new Array(cols * rows).fill("empty");
    const scaledSold = Math.round(soldTickets / scale);
    const scaledUser = Math.round(userTickets / scale);
    const totalCells = cols * rows;

    const sold = Math.min(scaledSold, totalCells);
    const user = Math.min(scaledUser, sold);
    const pool = sold - user;

    const ordered: ("user" | "pool")[] = [];
    for (let i = 0; i < user; i++) ordered.push("user");
    for (let i = 0; i < pool; i++) ordered.push("pool");

    const rng = seededRandom(totalSlots * 31 + userTickets * 7);
    for (let i = ordered.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [ordered[i], ordered[j]] = [ordered[j], ordered[i]];
    }

    const validIndices: number[] = [];
    const center = cols / 2;
    const centerY = rows / 2;

    for (let i = 0; i < totalCells; i++) {
      const cx = (i % cols) + 0.5;
      const cy = Math.floor(i / cols) + 0.5;
      if (variant === "circular") {
        const dx = (cx - center) / (cols / 2);
        const dy = (cy - centerY) / (rows / 2);
        if (dx * dx + dy * dy <= 1) {
          validIndices.push(i);
        }
      } else {
        validIndices.push(i);
      }
    }

    const rng2 = seededRandom(totalSlots * 17 + soldTickets);
    for (let i = validIndices.length - 1; i > 0; i--) {
      const j = Math.floor(rng2() * (i + 1));
      [validIndices[i], validIndices[j]] = [validIndices[j], validIndices[i]];
    }

    for (let i = 0; i < ordered.length && i < validIndices.length; i++) {
      arr[validIndices[i]] = ordered[i];
    }

    return arr;
  }, [totalSlots, soldTickets, userTickets, cols, rows, scale, variant]);

  // Build reveal order: spiral from center outward (like mempool.space)
  const revealOrder = useMemo(() => {
    const totalCells = cols * rows;
    const centerCol = Math.floor(cols / 2);
    const centerRow = Math.floor(rows / 2);
    const center = cols / 2;
    const centerY = rows / 2;

    // Collect valid cell indices with distance from center
    const items: { idx: number; dist: number }[] = [];
    for (let i = 0; i < totalCells; i++) {
      const c = i % cols;
      const r = Math.floor(i / cols);
      if (variant === "circular") {
        const dx = (c + 0.5 - center) / (cols / 2);
        const dy = (r + 0.5 - centerY) / (rows / 2);
        if (dx * dx + dy * dy > 1) continue;
      }
      const dx = c - centerCol;
      const dy = r - centerRow;
      items.push({ idx: i, dist: dx * dx + dy * dy });
    }

    // Sort by distance (center first) with slight randomness for organic feel
    const rng = seededRandom(totalSlots * 41);
    items.sort((a, b) => a.dist - b.dist + (rng() - 0.5) * 2);
    return items.map(x => x.idx);
  }, [cols, rows, variant, totalSlots]);

  // Progressive reveal animation
  useEffect(() => {
    if (isDrawing) {
      // Instantly reveal all when drawing
      setRevealedCount(revealOrder.length);
      revealCompleteRef.current = true;
      return;
    }

    // Reset and start reveal
    setRevealedCount(0);
    revealCompleteRef.current = false;

    const total = revealOrder.length;
    if (total === 0) return;

    // Reveal in batches for smooth animation (~1.5s total)
    const batchSize = Math.max(1, Math.ceil(total / 60)); // ~60 frames
    let current = 0;

    const frame = () => {
      current = Math.min(current + batchSize, total);
      setRevealedCount(current);
      if (current < total) {
        animFrameRef.current = requestAnimationFrame(frame);
      } else {
        revealCompleteRef.current = true;
      }
    };

    // Small delay before starting
    const timeout = setTimeout(() => {
      animFrameRef.current = requestAnimationFrame(frame);
    }, 150);

    return () => {
      clearTimeout(timeout);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [revealOrder, isDrawing]);

  // Resize observer
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0].contentRect.width;
      setSize(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Build set of currently revealed cell indices
  const revealedSet = useMemo(() => {
    const set = new Set<number>();
    for (let i = 0; i < revealedCount; i++) {
      set.add(revealOrder[i]);
    }
    return set;
  }, [revealedCount, revealOrder]);

  // Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || size === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const cellW = size / cols;
    const cellH = size / rows;
    const gap = Math.max(0.5, cellW * 0.06);
    const center = cols / 2;
    const centerY = rows / 2;

    ctx.clearRect(0, 0, size, size);

    for (let i = 0; i < cols * rows; i++) {
      // Skip cells not yet revealed
      if (!revealedSet.has(i)) continue;

      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = col * cellW + gap;
      const y = row * cellH + gap;
      const w = cellW - gap * 2;
      const h = cellH - gap * 2;

      if (w <= 0 || h <= 0) continue;

      if (variant === "circular") {
        const cx = (col + 0.5 - center) / (cols / 2);
        const cy = (row + 0.5 - centerY) / (rows / 2);
        if (cx * cx + cy * cy > 1) continue;
      }

      const type = cells[i];
      const isHighlighted = drawPhase !== "idle" && highlightIdx === i;
      const isWinner = drawPhase === "done" && winnerIdx === i;
      const isHovered = !isDrawing && hoveredCell === i;

      // Entrance scale — cells at the edge of reveal are slightly smaller
      const revealIdx = revealOrder.indexOf(i);
      const distFromEdge = revealedCount - revealIdx;
      const entranceScale = revealCompleteRef.current ? 1 : Math.min(1, distFromEdge / 8);

      let fillColor: string;
      let borderColor = "rgba(255,255,255,0.04)";
      let shadowColor = "";

      if (isWinner) {
        fillColor = "hsl(45, 95%, 55%)";
        borderColor = "rgba(234,179,8,0.9)";
        shadowColor = "rgba(234,179,8,0.6)";
      } else if (isHighlighted) {
        fillColor = "hsl(142, 80%, 55%)";
        borderColor = "rgba(74,222,128,0.9)";
        shadowColor = "rgba(74,222,128,0.5)";
      } else if (type === "user") {
        fillColor = isHovered ? "hsl(142, 65%, 48%)" : "hsl(142, 60%, 38%)";
        borderColor = "rgba(74,222,128,0.35)";
        if (isHovered) shadowColor = "rgba(74,222,128,0.3)";
      } else if (type === "pool") {
        const seed = (i * 7 + 13) % 20;
        const hue = 215 + (seed % 6) * 4;
        const light = 20 + (seed % 5) * 3;
        fillColor = `hsl(${hue}, 50%, ${light}%)`;
        borderColor = "rgba(255,255,255,0.06)";
      } else {
        fillColor = "rgba(255,255,255,0.02)";
        borderColor = "rgba(255,255,255,0.03)";
      }

      if (isDrawing && drawPhase !== "idle" && !isHighlighted && !isWinner) {
        ctx.globalAlpha = 0.15;
      } else {
        ctx.globalAlpha = entranceScale;
      }

      if (shadowColor) {
        ctx.shadowColor = shadowColor;
        ctx.shadowBlur = isWinner ? 12 : 6;
      } else {
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
      }

      // Apply entrance scale transform
      const inset = (1 - entranceScale) * w * 0.5;
      const dx = x + inset;
      const dy = y + inset;
      const dw = w * entranceScale;
      const dh = h * entranceScale;

      const r = Math.max(1, dw * 0.12);
      ctx.beginPath();
      ctx.roundRect(dx, dy, dw, dh, r);
      ctx.fillStyle = fillColor;
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = isWinner ? 1.5 : 0.5;
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
  }, [cells, size, cols, rows, variant, hoveredCell, drawPhase, highlightIdx, winnerIdx, isDrawing, revealedSet]);

  // Mouse hover tracking
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDrawing || size === 0) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const col = Math.floor((x / size) * cols);
    const row = Math.floor((y / size) * rows);
    if (col >= 0 && col < cols && row >= 0 && row < rows) {
      setHoveredCell(row * cols + col);
    }
  }, [isDrawing, size, cols, rows]);

  // Draw animation
  useEffect(() => {
    if (!isDrawing || cells.length === 0) return;

    // Find valid sold cells for scanning
    const soldIndices = cells
      .map((c, i) => ({ c, i }))
      .filter(x => x.c === "user" || x.c === "pool")
      .map(x => x.i);

    if (soldIndices.length === 0) return;

    // Pick winner (random sold ticket)
    const winIdx = soldIndices[Math.floor(Math.random() * soldIndices.length)];

    let scanIdx = 0;
    let ticks = 0;
    const totalFastTicks = soldIndices.length * 3;
    let delay = 20;
    let phase: "scanning" | "slowing" = "scanning";

    setDrawPhase("scanning");
    setWinnerIdx(-1);
    setHighlightIdx(-1);

    const tick = () => {
      scanIdx = (scanIdx + 1) % soldIndices.length;
      setHighlightIdx(soldIndices[scanIdx]);
      ticks++;

      if (phase === "scanning" && ticks >= totalFastTicks) {
        phase = "slowing";
        setDrawPhase("slowing");
      }

      if (phase === "slowing") {
        delay = Math.min(delay * 1.18, 600);
        if (soldIndices[scanIdx] === winIdx && delay > 400) {
          setDrawPhase("done");
          setWinnerIdx(winIdx);
          setHighlightIdx(winIdx);
          if (onDrawComplete) setTimeout(() => onDrawComplete(winIdx), 3000);
          return;
        }
      }

      drawTimerRef.current = setTimeout(tick, delay);
    };

    drawTimerRef.current = setTimeout(tick, delay);
    return () => {
      if (drawTimerRef.current) clearTimeout(drawTimerRef.current);
    };
  }, [isDrawing, cells]);

  // Real-time "pulse" animation on random sold cells
  const [pulsingCells, setPulsingCells] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (isDrawing) return;
    const soldIndices = cells
      .map((c, i) => ({ c, i }))
      .filter(x => x.c === "user" || x.c === "pool")
      .map(x => x.i);

    if (soldIndices.length === 0) return;

    // Periodically "pulse" a random cell to simulate activity
    const interval = setInterval(() => {
      const randomIdx = soldIndices[Math.floor(Math.random() * soldIndices.length)];
      setPulsingCells(prev => {
        const next = new Set(prev);
        next.add(randomIdx);
        return next;
      });
      // Remove after animation
      setTimeout(() => {
        setPulsingCells(prev => {
          const next = new Set(prev);
          next.delete(randomIdx);
          return next;
        });
      }, 1200);
    }, 800);

    return () => clearInterval(interval);
  }, [isDrawing, cells]);

  // Overlay pulse dots on canvas
  useEffect(() => {
    if (pulsingCells.size === 0 || isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas || size === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cellW = size / cols;
    const cellH = size / rows;
    const dpr = window.devicePixelRatio || 1;

    pulsingCells.forEach(idx => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const cx = (col + 0.5) * cellW * dpr;
      const cy = (row + 0.5) * cellH * dpr;
      const r = Math.min(cellW, cellH) * 0.6 * dpr;

      ctx.save();
      ctx.globalAlpha = 0.4;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = cells[idx] === "user" ? "hsl(142, 80%, 60%)" : "hsl(210, 70%, 50%)";
      ctx.fill();
      ctx.restore();
    });
  }, [pulsingCells, size, cols, rows, cells, isDrawing]);

  const emptySlots = Math.max(0, totalSlots - soldTickets);
  const userPct = totalSlots > 0 ? ((userTickets / totalSlots) * 100).toFixed(1) : "0";
  const soldPct = totalSlots > 0 ? ((soldTickets / totalSlots) * 100).toFixed(1) : "0";

  return (
    <div className="relative w-full" ref={containerRef}>
      <div
        className={`relative w-full aspect-square ${variant === "circular" ? "rounded-full" : "rounded-2xl"} overflow-hidden`}
        style={{
          background: "hsl(var(--background))",
          border: "1px solid rgba(255,255,255,0.06)",
          boxShadow: variant === "circular"
            ? "inset 0 0 0 2px rgba(255,255,255,0.04), 0 0 40px rgba(99,102,241,0.1)"
            : "0 0 30px rgba(0,0,0,0.3)",
        }}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-crosshair"
          style={{ imageRendering: "auto" }}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredCell(null)}
        />

        {/* Winner overlay */}
        <AnimatePresence>
          {drawPhase === "done" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none"
            >
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="bg-black/90 backdrop-blur-xl rounded-full flex flex-col items-center justify-center gap-3 border-2 border-yellow-500/60 shadow-[0_0_50px_rgba(234,179,8,0.4)] overflow-hidden"
                style={{ width: "45%", aspectRatio: "1", padding: winner ? "0" : "1.5rem" }}
              >
                {winner ? (
                  <>
                    <img src={winner.picture} alt={winner.name} className="absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-luminosity" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col items-center justify-end pb-6">
                      <Trophy className="w-8 h-8 text-yellow-400 mb-1 drop-shadow-[0_0_8px_rgba(0,0,0,0.8)]" />
                      <p className="text-[10px] font-black text-yellow-300 uppercase tracking-[0.2em] relative z-10 drop-shadow-[0_0_8px_rgba(0,0,0,0.8)] px-2 text-center line-clamp-1">{winner.name}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <Trophy className="w-10 h-10 text-yellow-400" />
                    <p className="text-[11px] font-black text-yellow-300 uppercase tracking-[0.2em]">Vencedor!</p>
                  </>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Live indicator */}
        {!isDrawing && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full border border-white/10 z-20">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[9px] font-black text-green-400 uppercase tracking-widest">Live</span>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-4 flex-wrap">
        <div className="flex items-center gap-1.5 bg-card/60 px-3 py-1.5 rounded-full border border-border">
          <div className="w-2.5 h-2.5 rounded-sm" style={{ background: "hsl(142, 60%, 38%)" }} />
          <span className="text-[10px] font-black text-primary">{userTickets} seus ({userPct}%)</span>
        </div>
        <div className="flex items-center gap-1.5 bg-card/60 px-3 py-1.5 rounded-full border border-border">
          <div className="w-2.5 h-2.5 rounded-sm" style={{ background: "hsl(215, 50%, 25%)" }} />
          <span className="text-[10px] font-black text-muted-foreground">{soldTickets - userTickets} outros ({soldPct}%)</span>
        </div>
        <div className="flex items-center gap-1.5 bg-card/60 px-3 py-1.5 rounded-full border border-border">
          <div className="w-2.5 h-2.5 rounded-sm border border-white/10" style={{ background: "rgba(255,255,255,0.02)" }} />
          <span className="text-[10px] font-black text-muted-foreground/50">{emptySlots} disponíveis</span>
        </div>
      </div>
    </div>
  );
};
