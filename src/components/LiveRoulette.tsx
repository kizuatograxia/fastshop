import React, { useEffect, useState, useRef } from "react";
import { triggerConfetti } from "@/lib/confetti";
import { Raffle } from "@/types/raffle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { api } from "@/lib/api";
import { Trophy, Sparkles } from "lucide-react";

interface LiveRouletteProps {
    raffle: Raffle;
    onClose: () => void;
}

export function LiveRoulette({ raffle, onClose }: LiveRouletteProps) {
    const [participants, setParticipants] = useState<any[]>([]);
    const [status, setStatus] = useState<'loading' | 'spinning' | 'winner'>('loading');
    const [displayCandidate, setDisplayCandidate] = useState<any>(null);
    const spinIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Load participants to simulate the reel
    useEffect(() => {
        const load = async () => {
            try {
                const data = await api.getRaffleParticipants(raffle.id);
                // Augment mock data if too few participants to make it look cool
                let candidates = data;
                if (candidates.length < 10) {
                    const fillers = Array(10).fill(null).map((_, i) => ({
                        user_id: `filler-${i}`,
                        name: `Participante ${Math.floor(Math.random() * 1000)}`,
                        picture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`
                    }));
                    candidates = [...candidates, ...fillers];
                }
                setParticipants(candidates);
                setStatus('spinning');
            } catch (error) {
                console.error("Error loading participants for roulette", error);
                // Fallback to simpler animation if fails
                setStatus('spinning');
            }
        };
        load();
    }, [raffle.id]);

    // Handle Spinning Logic
    useEffect(() => {
        if (status === 'spinning' && participants.length > 0) {
            // Start rapid cycling
            let speed = 50; // ms
            let counter = 0;
            const maxDuration = 6000; // 6 seconds total spin
            const startTime = Date.now();

            const spin = () => {
                const now = Date.now();
                const elapsed = now - startTime;

                // Pick random candidate to show
                const randomIdx = Math.floor(Math.random() * participants.length);
                setDisplayCandidate(participants[randomIdx]);

                // Slow down logic
                if (elapsed < maxDuration - 2000) {
                    // Fast phase
                    speed = 50;
                } else if (elapsed < maxDuration - 500) {
                    // Slowing down
                    speed += 20;
                } else if (elapsed >= maxDuration) {
                    // STOP
                    setStatus('winner');
                    return;
                }

                spinIntervalRef.current = setTimeout(spin, speed);
            };

            spin();
            return () => {
                if (spinIntervalRef.current) clearTimeout(spinIntervalRef.current);
            };
        }
    }, [status, participants]);

    // Handle Winner Reveal
    useEffect(() => {
        if (status === 'winner') {
            triggerConfetti();
            // Play sound if possible?
            // const audio = new Audio('/win.mp3'); audio.play(); 
        }
    }, [status]);

    if (status === 'loading') return null;

    const winner = raffle.winner; // The actual winner from the raffle object

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in">
            <div className="relative w-full max-w-4xl p-8 flex flex-col items-center">

                {/* Header */}
                <div className="mb-8 text-center space-y-2 animate-slide-in-top">
                    <span className="inline-block px-3 py-1 rounded-full bg-primary/20 text-primary border border-primary/50 text-xs font-mono tracking-widest uppercase mb-2">
                        Sorteio Ao Vivo
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-400 to-accent drop-shadow-[0_0_15px_rgba(var(--primary),0.5)]">
                        {status === 'winner' ? 'TEMOS UM VENCEDOR!' : 'SORTEANDO...'}
                    </h1>
                    <p className="text-xl text-white/80 font-light">{raffle.titulo}</p>
                </div>

                {/* The Reel / Winner Card */}
                <div className="relative w-full max-w-md aspect-square bg-gradient-to-b from-white/5 to-white/0 rounded-full border-[3px] border-primary/30 shadow-[0_0_50px_rgba(var(--primary),0.2)] flex items-center justify-center p-1 overflow-hidden">

                    {/* Glowing Ring */}
                    <div className={`absolute inset-0 rounded-full border-t-4 border-primary/80 animate-spin-slow ${status === 'winner' ? 'opacity-0' : 'opacity-100'}`}></div>

                    {/* Central Display */}
                    <div className="relative z-10 flex flex-col items-center justify-center text-center p-6 transition-all duration-300 transform">
                        <div className="relative mb-6">
                            {/* Avatar Ring */}
                            <div className={`absolute -inset-4 rounded-full border-2 border-dashed border-white/20 ${status === 'spinning' ? 'animate-spin' : ''}`}></div>

                            <Avatar className={`w-32 h-32 md:w-48 md:h-48 border-4 border-white shadow-2xl transition-all duration-500 ${status === 'winner' ? 'scale-110 ring-8 ring-yellow-500/50' : 'scale-100'}`}>
                                <AvatarImage src={status === 'winner' ? winner?.picture : displayCandidate?.picture} className="object-cover" />
                                <AvatarFallback className="text-4xl bg-primary text-primary-foreground font-bold">
                                    {(status === 'winner' ? winner?.name : displayCandidate?.name)?.[0]}
                                </AvatarFallback>
                            </Avatar>

                            {status === 'winner' && (
                                <div className="absolute -bottom-2 -right-2 bg-yellow-500 text-black p-3 rounded-full shadow-lg border-2 border-white animate-bounce">
                                    <Trophy className="w-8 h-8" fill="black" />
                                </div>
                            )}
                        </div>

                        <div className="space-y-1">
                            <h2 className="text-3xl md:text-4xl font-bold text-white transition-all">
                                {status === 'winner' ? winner?.name : displayCandidate?.name}
                            </h2>
                            {status === 'winner' && (
                                <p className="text-yellow-400 font-medium animate-pulse">Parabéns! Você ganhou o prêmio.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer / Close */}
                {status === 'winner' && (
                    <div className="mt-12 animate-fade-in-up delay-500">
                        <button
                            onClick={onClose}
                            className="px-8 py-3 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform shadow-xl"
                        >
                            Fechar e Ver Detalhes
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}
