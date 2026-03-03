import React, { useState, useEffect } from "react";
import { Clock, Activity } from "lucide-react";
import { TicketVisualizer } from "./TicketVisualizer";

// Compact countdown — overlaid at top of circle with semi-transparent glass
export const CircularCountdown: React.FC<{
    targetDate: string;
    onExpire?: () => void;
}> = ({ targetDate, onExpire }) => {
    const [timeLeft, setTimeLeft] = useState({
        days: 0, hours: 0, minutes: 0, seconds: 0, progress: 0, total: 1,
    });

    useEffect(() => {
        const update = () => {
            const now = Date.now();
            const end = new Date(targetDate).getTime();
            const diff = Math.max(0, end - now);
            if (diff === 0 && onExpire) onExpire();
            const totalDuration = 30 * 24 * 60 * 60 * 1000;
            const progress = Math.min(Math.max((totalDuration - diff) / totalDuration, 0), 1);
            setTimeLeft({
                days: Math.floor(diff / 86400000),
                hours: Math.floor((diff % 86400000) / 3600000),
                minutes: Math.floor((diff % 3600000) / 60000),
                seconds: Math.floor((diff % 60000) / 1000),
                progress,
                total: diff,
            });
        };
        update();
        const id = setInterval(update, 1000);
        return () => clearInterval(id);
    }, [targetDate, onExpire]);

    const isEnding = timeLeft.days === 0 && timeLeft.hours < 1;
    const isExpired = timeLeft.total === 0;
    const C = 2 * Math.PI * 38; // circumference for r=38 SVG ring
    const offset = C * (1 - timeLeft.progress);

    return (
        // Glass pill — sits at the TOP of the circle, semi-transparent
        <div
            className="flex items-center gap-3 px-4 py-2 rounded-2xl"
            style={{
                background: "rgba(0,0,0,0.55)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.1)",
            }}
        >
            {/* Mini arc ring */}
            <svg width="40" height="40" className="-rotate-90 flex-shrink-0">
                <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
                <circle
                    cx="20" cy="20" r="16"
                    fill="none"
                    stroke={isExpired ? "hsl(142,70%,45%)" : "hsl(var(--primary))"}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 16}`}
                    strokeDashoffset={`${2 * Math.PI * 16 * (1 - timeLeft.progress)}`}
                    className="transition-all duration-1000"
                />
            </svg>

            {/* Time text */}
            {isExpired ? (
                <div className="flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-green-400 animate-spin" />
                    <span className="text-xs font-black text-green-400 uppercase tracking-widest">Sorteando</span>
                </div>
            ) : timeLeft.days > 0 ? (
                <div className="flex flex-col">
                    <span className="text-lg font-black text-white tabular-nums leading-none">
                        {String(timeLeft.days).padStart(2, "0")}
                        <span className="text-white/30 mx-0.5 text-base">d</span>
                        {String(timeLeft.hours).padStart(2, "0")}
                        <span className="text-white/30 mx-0.5 text-base">h</span>
                    </span>
                    <span className="text-[9px] text-white/30 uppercase tracking-widest font-bold">Próximo sorteio</span>
                </div>
            ) : (
                <div className="flex flex-col">
                    <span className="text-lg font-black text-white tabular-nums leading-none">
                        {String(timeLeft.hours).padStart(2, "0")}
                        <span className="text-white/30 animate-pulse">:</span>
                        {String(timeLeft.minutes).padStart(2, "0")}
                        <span className="text-white/30 animate-pulse">:</span>
                        {String(timeLeft.seconds).padStart(2, "0")}
                    </span>
                    <span className="text-[9px] leading-tight font-bold uppercase tracking-widest">
                        {isEnding
                            ? <span className="text-red-400 flex items-center gap-1"><Clock className="w-2.5 h-2.5 inline" /> Em breve!</span>
                            : <span className="text-white/30">Próximo sorteio</span>
                        }
                    </span>
                </div>
            )}
        </div>
    );
};

interface MempoolLayoutProps {
    totalTickets: number;
    userTickets: number;
    targetDate: string;
    onExpire?: () => void;
    isDrawing?: boolean;
}

// Main layout: circle with timer overlaid at the top-center
export const MempoolLayout: React.FC<MempoolLayoutProps> = ({
    totalTickets,
    userTickets,
    targetDate,
    onExpire,
    isDrawing = false,
}) => {
    return (
        <div className="flex flex-col items-center gap-4">
            <div className="relative w-full max-w-[500px] aspect-square">
                {/* Mempool circle */}
                <TicketVisualizer
                    totalTickets={totalTickets}
                    userTickets={userTickets}
                    variant="circular"
                    isDrawing={isDrawing}
                />

                {/* Timer — glass pill at top of circle, above blocks */}
                {!isDrawing && (
                    <div className="absolute top-[6%] left-0 right-0 flex justify-center z-30 pointer-events-none">
                        <CircularCountdown targetDate={targetDate} onExpire={onExpire} />
                    </div>
                )}
            </div>

            {/* Legend below */}
            <div className="flex items-center gap-5 text-xs font-bold uppercase tracking-widest">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm bg-green-500 shadow-[0_0_6px_rgba(74,222,128,0.5)]" />
                    <span className="text-green-400">Seus tickets</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm bg-blue-500/50 border border-white/10" />
                    <span className="text-white/40">Outros</span>
                </div>
            </div>
        </div>
    );
};

export const MempoolLayoutSideBySide: React.FC<MempoolLayoutProps> = (props) => {
    return <MempoolLayout {...props} />;
};
