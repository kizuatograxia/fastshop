import React from 'react';
import { useRaffleEvents } from '@/contexts/RaffleEventsContext';
import { LiveRoulette } from '@/components/LiveRoulette';

export function GlobalEventsListener() {
    const { triggeringRaffle, clearTrigger } = useRaffleEvents();

    if (!triggeringRaffle) return null;

    return (
        <LiveRoulette
            raffle={triggeringRaffle}
            onClose={clearTrigger}
        />
    );
}
