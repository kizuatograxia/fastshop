import React, { useState, useEffect } from "react";
import { Clock, Activity } from "lucide-react";
import { TicketVisualizer } from "./TicketVisualizer";

// Circular countdown component - LARGER and SEPARATED from the circle
export const CircularCountdown: React.FC<{
    targetDate: string,
    onExpire?: () => void,
    size?: "small" | "large"
}> = ({ targetDate, onExpire, size = "large" }) => {
    const [timeLeft, setTimeLeft] = useState({
        days: 0, hours: 0, minutes: 0, seconds: 0, progress: 0, total: 1
    });

    useEffect(() => {
        const update = () => {
            const now = Date.now();
            const end = new Date(targetDate).getTime();
            const diff = Math.max(0, end - now);

            if (diff === 0 && onExpire) {
                onExpire();
            }

            const totalDuration = 30 * 24 * 60 * 60 * 1000;
            const elapsed = totalDuration - diff;
            const progress = Math.min(Math.max(elapsed / totalDuration, 0), 1);

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeLeft({ days, hours, minutes, seconds, progress, total: diff });
        };
        update();
        const interval = setInterval(update, 1000);
        return () => clearInterval(interval);
    }, [targetDate, onExpire]);

    const isEnding = timeLeft.days === 0 && timeLeft.hours < 1;
    const isExpired = timeLeft.total === 0;
    const circumference = 2 * Math.PI * 90;
    const strokeDashoffset = circumference * (1 - timeLeft.progress);

    const containerSize = size === "large" ? "w-64 h-64" : "w-52 h-52";
    const textSize = size === "large" ? "text-6xl" : "text-5xl";
    const padding = size === "large" ? "p-8" : "p-6";

    return (
        <div className={`bg-card rounded-3xl border-2 border-border ${padding} flex flex-col items-center relative overflow-hidden shadow-xl`}>
            {isEnding && !isExpired && (
                <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-destructive/20 text-destructive px-3 py-1.5 rounded-full text-xs font-bold border border-destructive/30 z-10">
                    <Clock className="w-3 h-3" />
                    ENCERRA EM BREVE
                </div>
            )}

            <h3 className="text-lg font-bold text-foreground mb-4 uppercase tracking-wider">
                {isExpired ? "Sorteando..." : "Tempo Restante"}
            </h3>

            <div className={`relative ${containerSize} mb-4`}>
                <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
                    <circle cx="100" cy="100" r="90" fill="none" stroke="hsl(var(--border))" strokeWidth="10" />
                    <circle
                        cx="100" cy="100" r="90"
                        fill="none"
                        stroke={isExpired ? "hsl(142, 70%, 45%)" : "hsl(var(--primary))"}
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        className="transition-all duration-1000 ease-linear"
                    />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    {isExpired ? (
                        <div className="text-center">
                            <Activity className={`${size === "large" ? "w-14 h-14" : "w-12 h-12"} text-green-500 animate-spin mx-auto mb-2`} />
                            <span className="text-sm font-bold text-green-500 uppercase tracking-widest">SORTEANDO</span>
                        </div>
                    ) : timeLeft.days > 0 ? (
                        <>
                            <div className={`${textSize} font-black text-foreground tracking-tight tabular-nums`}>
                                {String(timeLeft.days).padStart(2, "0")}
                                <span className="text-muted-foreground mx-1">:</span>
                                {String(timeLeft.hours).padStart(2, "0")}
                            </div>
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Dias : Horas</span>
                        </>
                    ) : (
                        <>
                            <div className={`${textSize} font-black text-foreground tracking-tight tabular-nums`}>
                                {String(timeLeft.hours).padStart(2, "0")}
                                <span className="text-muted-foreground mx-1 animate-pulse">:</span>
                                {String(timeLeft.minutes).padStart(2, "0")}
                                <span className="text-muted-foreground mx-1 animate-pulse">:</span>
                                {String(timeLeft.seconds).padStart(2, "0")}
                            </div>
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">H : M : S</span>
                        </>
                    )}
                </div>
            </div>
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

export const MempoolLayout: React.FC<MempoolLayoutProps> = ({
    totalTickets,
    userTickets,
    targetDate,
    onExpire,
    isDrawing = false,
}) => {
    return (
        <div className="flex flex-col items-center gap-8">
            {/* CIRCLE - Ticket Visualizer */}
            <div className="w-full max-w-[440px] aspect-square">
                <TicketVisualizer
                    totalTickets={totalTickets}
                    userTickets={userTickets}
                    variant="circular"
                    isDrawing={isDrawing}
                />
            </div>

            {/* TIMER - Separated below */}
            <div className="w-full max-w-[320px]">
                <CircularCountdown targetDate={targetDate} onExpire={onExpire} size="large" />
            </div>

            {/* Legend */}
            <div className="flex items-center gap-6 text-xs font-bold uppercase tracking-widest">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-sm bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]" />
                    <span className="text-green-500">Seus tickets</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-sm bg-blue-600/60 border border-white/10" />
                    <span className="text-white/50">Outros participantes</span>
                </div>
            </div>
        </div>
    );
};

export const MempoolLayoutSideBySide: React.FC<MempoolLayoutProps> = ({
    totalTickets,
    userTickets,
    targetDate,
    onExpire,
    isDrawing = false,
}) => {
    return (
        <div className="flex flex-col lg:flex-row items-center gap-8 justify-center">
            <div className="w-full max-w-[400px] aspect-square flex-shrink-0">
                <TicketVisualizer
                    totalTickets={totalTickets}
                    userTickets={userTickets}
                    variant="circular"
                    isDrawing={isDrawing}
                />
            </div>
            <div className="flex-shrink-0">
                <CircularCountdown targetDate={targetDate} onExpire={onExpire} size="large" />
            </div>
        </div>
    );
};
