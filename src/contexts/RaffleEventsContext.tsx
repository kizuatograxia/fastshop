import React, { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Raffle } from '@/types/raffle';

interface RaffleEventContextType {
    activeRaffles: Raffle[];
    triggeringRaffle: Raffle | null;
    clearTrigger: () => void;
}

const RaffleEventsContext = createContext<RaffleEventContextType>({
    activeRaffles: [],
    triggeringRaffle: null,
    clearTrigger: () => { },
});

export const useRaffleEvents = () => useContext(RaffleEventsContext);

export const RaffleEventsProvider = ({ children }: { children: ReactNode }) => {
    const [activeRaffles, setActiveRaffles] = useState<Raffle[]>([]);
    const [triggeringRaffle, setTriggeringRaffle] = useState<Raffle | null>(null);
    const [lastKnownStatus, setLastKnownStatus] = useState<Record<string, string>>({});

    // To track notifications to avoid spam
    const notifiedRaffles = useRef<Set<string>>(new Set());

    useEffect(() => {
        // Initial Fetch
        fetchRaffles();

        // Polling Interval
        const interval = setInterval(() => {
            fetchRaffles();
        }, 5000); // Check every 5 seconds

        return () => clearInterval(interval);
    }, []);

    const fetchRaffles = async () => {
        try {
            // Fetch all known raffles to detect changes
            const allRaffles = await api.getAdminRaffles();

            allRaffles.forEach((raffle: Raffle) => {
                const oldStatus = lastKnownStatus[raffle.id];
                const newStatus = raffle.status;

                // 1. Check for Countdown Notification
                checkCountdown(raffle);

                // 2. Check for WINNER DRAWN event
                const isRecent = new Date().getTime() - new Date(raffle.dataFim).getTime() < 3600000; // 1 hour
                const notificationKey = `winner-${raffle.id}`;

                // Get local storage history
                const seenNotifications = JSON.parse(localStorage.getItem('seen_notifications') || '[]');

                if (newStatus === 'encerrado' && raffle.winner && !seenNotifications.includes(notificationKey) && isRecent) {
                    console.log(`[RaffleEvent] Triggering WIN for ${raffle.titulo}! Winner: ${raffle.winner.name}`);
                    setTriggeringRaffle(raffle);

                    // Mark as seen immediately to avoid double trigger
                    const updatedSeen = [...seenNotifications, notificationKey];
                    localStorage.setItem('seen_notifications', JSON.stringify(updatedSeen));
                    notifiedRaffles.current.add(notificationKey);
                }

                // Update known status
                if (oldStatus !== newStatus) {
                    setLastKnownStatus(prev => ({ ...prev, [raffle.id]: newStatus }));
                }
            });

            setActiveRaffles(allRaffles.filter((r: Raffle) => r.status === 'ativo'));

        } catch (error) {
            console.error("Failed to poll events", error);
        }
    };

    const checkCountdown = (raffle: Raffle) => {
        if (raffle.status !== 'ativo' && raffle.status !== 'active') return;

        const now = new Date();
        const drawDate = new Date(raffle.dataFim);
        const diff = drawDate.getTime() - now.getTime();
        const minutesLeft = Math.ceil(diff / 60000);

        // Notify if between 0 and 10 minutes remaining, and hasn't been notified yet
        if (minutesLeft > 0 && minutesLeft <= 10) {
            if (!notifiedRaffles.current.has(raffle.id)) {
                toast("⏰ Sorteio em Breve!", {
                    description: `O sorteio "${raffle.titulo}" ocorrerá em ${minutesLeft} minutos. Fique atento!`,
                    duration: 8000,
                    action: {
                        label: "Ver",
                        onClick: () => window.location.href = `/raffle/${raffle.id}`
                    }
                });
                notifiedRaffles.current.add(raffle.id);
            }
        }
    };

    const clearTrigger = () => setTriggeringRaffle(null);

    return (
        <RaffleEventsContext.Provider value={{ activeRaffles, triggeringRaffle, clearTrigger }}>
            {children}
        </RaffleEventsContext.Provider>
    );
};