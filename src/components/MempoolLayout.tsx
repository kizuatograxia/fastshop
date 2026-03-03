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

    return (
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
                    <Activity className="w-4 h-4 text-primary animate-spin" />
                    <span className="text-xs font-black text-primary uppercase tracking-widest">Sorteando</span>
                </div>
            ) : timeLeft.days > 0 ? (
                <div className="flex flex-col">
                    <span className="text-lg font-black text-foreground tabular-nums leading-none">
                        {String(timeLeft.days).padStart(2, "0")}
                        <span className="text-muted-foreground mx-0.5 text-base">d</span>
                        {String(timeLeft.hours).padStart(2, "0")}
                        <span className="text-muted-foreground mx-0.5 text-base">h</span>
                    </span>
                    <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">Próximo sorteio</span>
                </div>
            ) : (
                <div className="flex flex-col">
                    <span className="text-lg font-black text-foreground tabular-nums leading-none">
                        {String(timeLeft.hours).padStart(2, "0")}
                        <span className="text-muted-foreground animate-pulse">:</span>
                        {String(timeLeft.minutes).padStart(2, "0")}
                        <span className="text-muted-foreground animate-pulse">:</span>
                        {String(timeLeft.seconds).padStart(2, "0")}
                    </span>
                    <span className="text-[9px] leading-tight font-bold uppercase tracking-widest">
                        {isEnding
                            ? <span className="text-destructive flex items-center gap-1"><Clock className="w-2.5 h-2.5 inline" /> Em breve!</span>
                            : <span className="text-muted-foreground">Próximo sorteio</span>
                        }
                    </span>
                </div>
            )}
        </div>
    );
};

interface MempoolLayoutProps {
    totalSlots: number;
    soldTickets: number;
    userTickets: number;
    targetDate: string;
    onExpire?: () => void;
    isDrawing?: boolean;
    onDrawComplete?: (winnerIndex: number) => void | Promise<void>;
    winner?: { name: string; picture: string };
}

// Main layout: circle with timer overlaid at the top-center
export const MempoolLayout: React.FC<MempoolLayoutProps> = ({
    totalSlots,
    soldTickets,
    userTickets,
    targetDate,
    onExpire,
    isDrawing = false,
    onDrawComplete,
    winner,
}) => {
    return (
        <div className="flex flex-col items-center gap-4">
            <div className="relative w-full max-w-[500px] aspect-square">
                <TicketVisualizer
                    totalSlots={totalSlots}
                    soldTickets={soldTickets}
                    userTickets={userTickets}
                    variant="circular"
                    isDrawing={isDrawing}
                    onDrawComplete={onDrawComplete}
                    winner={winner}
                />

                {/* Timer — glass pill at top of circle, above blocks */}
                {!isDrawing && (
                    <div className="absolute top-[6%] left-0 right-0 flex justify-center z-30 pointer-events-none">
                        <CircularCountdown targetDate={targetDate} onExpire={onExpire} />
                    </div>
                )}
            </div>
        </div>
    );
};

export const MempoolLayoutSideBySide: React.FC<MempoolLayoutProps> = (props) => {
    return <MempoolLayout {...props} />;
};
