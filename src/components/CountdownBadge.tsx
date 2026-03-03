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
            if (date instanceof Date) {
                return new Date(date);
            }

            const dateStr = date.trim();

            // Date-only string (YYYY-MM-DD): default to end of day in LOCAL time
            if (dateStr.length <= 10 && !dateStr.includes('T') && !dateStr.includes(':')) {
                return new Date(`${dateStr}T23:59:59`);
            }

            // Full ISO datetime string: ensure it's treated as UTC.
            // If the string has no timezone indicator (no 'Z' and no '+'/'-' offset),
            // append 'Z' to prevent browsers from interpreting it as local time.
            // This fixes a 3-hour offset bug in UTC-3 (Brazil) timezones.
            if (dateStr.includes('T') && !dateStr.endsWith('Z') && !/[+-]\d{2}:\d{2}$/.test(dateStr)) {
                return new Date(dateStr + 'Z');
            }

            return new Date(dateStr);
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
