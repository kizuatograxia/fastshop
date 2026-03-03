import React, { useEffect, useState, useMemo, useRef } from "react";
import { motion, useAnimation } from "framer-motion";
import { Trophy } from "lucide-react";

interface TicketRouletteProps {
    totalTickets: number;
    userTickets: number;
    winnerIndex?: number;
    onComplete?: () => void;
}

const TICKET_SIZE = 120; // px per ticket (square)
const STRIP_LENGTH = 60; // total tickets in the strip for visual depth

export const TicketRoulette: React.FC<TicketRouletteProps> = ({
    totalTickets,
    userTickets,
    winnerIndex,
    onComplete,
}) => {
    const controls = useAnimation();
    const [phase, setPhase] = useState<"spinning" | "settling" | "done">("spinning");
    const containerRef = useRef<HTMLDivElement>(null);

    const WINNER_POSITION = Math.floor(STRIP_LENGTH * 0.65); // Winner at ~65% of strip

    // Generate the roulette strip with proportional user tickets
    const tickets = useMemo(() => {
        const userRatio = Math.max(0.05, userTickets / Math.max(1, totalTickets));
        return Array.from({ length: STRIP_LENGTH }, (_, i) => {
            const isWinner = i === WINNER_POSITION;
            const isUser = !isWinner && Math.random() < userRatio;
            const num = winnerIndex && isWinner
                ? winnerIndex
                : Math.floor(Math.random() * totalTickets) + 1;
            return { id: i, number: num, type: isWinner ? "winner" : isUser ? "user" : "pool" };
        });
    }, [totalTickets, userTickets, winnerIndex]);

    useEffect(() => {
        const animate = async () => {
            const containerWidth = containerRef.current?.offsetWidth ?? 400;
            const targetOffset = WINNER_POSITION * TICKET_SIZE - containerWidth / 2 + TICKET_SIZE / 2;

            // Phase 1: Fast spin
            await controls.start({
                x: -targetOffset + TICKET_SIZE * 8, // Overshoot past winner
                transition: {
                    duration: 5,
                    ease: [0.1, 0.0, 0.2, 1.0], // Fast then slow
                },
            });

            setPhase("settling");

            // Phase 2: Settle onto winner
            await controls.start({
                x: -targetOffset,
                transition: { duration: 1.5, ease: [0.25, 1, 0.5, 1] },
            });

            setPhase("done");
            if (onComplete) onComplete();
        };

        animate();
    }, [controls, onComplete]);

    const getTicketStyle = (type: string) => {
        if (type === "winner") return "bg-gradient-to-b from-yellow-400 to-amber-500 border-yellow-300 shadow-[0_0_40px_rgba(251,191,36,0.8)]";
        if (type === "user") return "bg-primary/20 border-primary shadow-[0_0_20px_rgba(var(--primary),0.4)]";
        return "bg-card/60 border-border/50";
    };

    return (
        <div className="w-full flex flex-col items-center gap-8">
            {/* Title */}
            <div className="text-center space-y-2">
                <motion.p
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ repeat: Infinity, duration: 1.2 }}
                    className="text-primary font-black uppercase tracking-[0.4em] text-sm"
                >
                    {phase === "done" ? "SORTEIO CONCLUÍDO" : "SORTEANDO VENCEDOR..."}
                </motion.p>
                <p className="text-[11px] text-muted-foreground">{totalTickets.toLocaleString()} tickets no sorteio</p>
            </div>

            {/* Roulette Container */}
            <div ref={containerRef} className="relative w-full overflow-hidden" style={{ height: `${TICKET_SIZE + 40}px` }}>
                {/* Edge Gradients */}
                <div className="absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-background to-transparent z-20 pointer-events-none" />
                <div className="absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-background to-transparent z-20 pointer-events-none" />

                {/* Vertical Center Markers */}
                <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center pointer-events-none" style={{ width: `${TICKET_SIZE + 8}px` }}>
                    <div className="w-full h-1 bg-primary shadow-[0_0_12px_hsl(var(--primary))]" style={{ marginTop: '16px' }} />
                    <div className="flex-1 w-full border-l-2 border-r-2 border-primary/30" />
                    <div className="w-full h-1 bg-primary shadow-[0_0_12px_hsl(var(--primary))]" style={{ marginBottom: '16px' }} />
                </div>

                {/* Animated Strip */}
                <div className="absolute top-1/2 -translate-y-1/2 left-0">
                    <motion.div
                        animate={controls}
                        className="flex gap-3 items-center"
                        style={{ paddingLeft: '50%', paddingRight: '50%' }}
                    >
                        {tickets.map((ticket) => (
                            <div
                                key={ticket.id}
                                className={`flex-shrink-0 flex flex-col items-center justify-center rounded-2xl border-2 transition-all ${getTicketStyle(ticket.type)}`}
                                style={{ width: `${TICKET_SIZE}px`, height: `${TICKET_SIZE}px` }}
                            >
                                {ticket.type === "winner" && phase === "done" ? (
                                    <Trophy className="w-8 h-8 text-yellow-900 mb-1" />
                                ) : (
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                                        {ticket.type === "user" ? "VOCÊ" : "Ticket"}
                                    </span>
                                )}
                                <span className={`text-2xl font-black tabular-nums ${ticket.type === "winner" ? "text-yellow-900" :
                                        ticket.type === "user" ? "text-primary" : "text-foreground"
                                    }`}>
                                    #{ticket.number.toString().padStart(4, "0")}
                                </span>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>

            {/* Done Banner */}
            {phase === "done" && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="w-full bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/50 rounded-2xl p-5 text-center"
                >
                    <Trophy className="w-10 h-10 text-yellow-400 mx-auto mb-2" />
                    <p className="font-black text-xl text-yellow-300 uppercase tracking-wider">Ticket #{tickets[WINNER_POSITION]?.number.toString().padStart(4, "0")} Venceu!</p>
                    <p className="text-sm text-muted-foreground mt-1">Parabéns ao ganhador.</p>
                </motion.div>
            )}
        </div>
    );
};
