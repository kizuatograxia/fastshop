import React from 'react';
import { useRaffleEvents } from '@/contexts/RaffleEventsContext';
import { useUserRaffles } from '@/contexts/UserRafflesContext';
import { useAuth } from '@/contexts/AuthContext';
import { LiveRoulette } from '@/components/LiveRoulette';

export function GlobalEventsListener() {
    const { triggeringRaffle, clearTrigger } = useRaffleEvents();
    const { user } = useAuth();
    const { getUserValue } = useUserRaffles();

    if (!triggeringRaffle) return null;

    // Only show roulette animation to users who participated in this raffle
    if (!user) return null;

    const userContribution = getUserValue(triggeringRaffle.id);
    if (userContribution <= 0) {
        // User didn't participate - don't show roulette, just clear the trigger
        clearTrigger();
        return null;
    }

    return (
        <LiveRoulette
            raffle={triggeringRaffle}
            onClose={clearTrigger}
        />
    );
}
