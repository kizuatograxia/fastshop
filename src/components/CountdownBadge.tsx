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
            if (date instanceof Date) return date;
            // Basic check for YYYY-MM-DD format (no time)
            if (typeof date === 'string' && date.length <= 10 && !date.includes('T') && !date.includes(':')) {
                // Return end of day in local time or specific fixed time. 
                // Appending T23:59:59 forces it to the end of that calendar day.
                return new Date(`${date}T23:59:59`);
            }
            return new Date(date);
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
