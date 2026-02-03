import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CountdownBadgeProps {
    targetDate: string | Date;
    className?: string;
}

export function CountdownBadge({ targetDate, className }: CountdownBadgeProps) {
    const [timeLeft, setTimeLeft] = useState<{ days: number, hours: number, minutes: number, seconds: number } | null>(null);

    useEffect(() => {
        const normalizeDate = (date: string | Date) => {
            let d;

            if (date instanceof Date) {
                d = new Date(date);
            } else {
                // FORCE LOCAL TIME INTERPRETATION for strings
                let dateStr = date;

                // If the string contains a 'Z' (UTC marker), remove it to treat the time as Local.
                // This fixes the issue where users enter "05:57" (Local) but the system treats it as "05:57 UTC" (02:57 Local), causing early expiry.
                if (typeof dateStr === 'string' && dateStr.endsWith('Z')) {
                    dateStr = dateStr.slice(0, -1);
                }

                // If date-only string (YYYY-MM-DD), default to End of Day
                if (dateStr.length <= 10 && !dateStr.includes('T') && !dateStr.includes(':')) {
                    return new Date(`${dateStr}T23:59:59`);
                }

                d = new Date(dateStr);
            }

            // Heuristic check for "Midnight" -> "End of Day"
            // If the time is exactly 00:00:00, default to 23:59:59
            if (d.getHours() === 0 && d.getMinutes() === 0 && d.getSeconds() === 0) {
                d.setHours(23, 59, 59, 999);
            }
            return d;
        };

        const target = normalizeDate(targetDate);

        const calculateTimeLeft = () => {
            const difference = +target - +new Date();
            if (difference > 0) {
                return {
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                };
            }
            return null; // Expired
        };

        // Initial set
        setTimeLeft(calculateTimeLeft());

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [targetDate]);

    if (!timeLeft) {
        return (
            <div className={cn("px-2 py-1 rounded-lg text-xs font-bold bg-red-500/80 text-white flex items-center gap-1", className)}>
                Finalizado
            </div>
        );
    }

    return (
        <div className={cn("flex items-center gap-1 bg-primary text-primary-foreground px-2 py-1 rounded-lg text-xs font-bold tabular-nums tracking-tight", className)}>
            <Clock className="h-3 w-3 mr-0.5" />
            <span>
                {timeLeft.days}d {String(timeLeft.hours).padStart(2, '0')}h {String(timeLeft.minutes).padStart(2, '0')}m {String(timeLeft.seconds).padStart(2, '0')}s
            </span>
        </div>
    );
}
