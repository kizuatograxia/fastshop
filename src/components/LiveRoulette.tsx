import React, { useEffect, useState, useRef } from "react";
import { motion, useAnimation, useMotionValue } from "framer-motion";
import { triggerConfetti } from "@/lib/confetti";
import { Raffle } from "@/types/raffle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { api } from "@/lib/api";
import { Trophy, Sparkles, ChevronDown, X } from "lucide-react";

interface LiveRouletteProps {
    raffle: Raffle;
    onClose: () => void;
}

interface Participant {
    user_id: string;
    name: string;
    picture?: string;
}

const CARD_WIDTH = 140; // Width of each participant card
const VISIBLE_CARDS = 7; // Number of visible cards
const SPIN_DURATION = 7; // Seconds

export function LiveRoulette({ raffle, onClose }: LiveRouletteProps) {
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [status, setStatus] = useState<'loading' | 'ready' | 'spinning' | 'winner'>('loading');
    const [extendedList, setExtendedList] = useState<Participant[]>([]);

    // Framer motion controls
    const controls = useAnimation();
    const x = useMotionValue(0);
    const lastTickPosition = useRef(0);

    // Sound effects
    const playTickSound = () => {
        try {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 800 + Math.random() * 400;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.03, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.05);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.05);
        } catch (e) {
            // Audio not supported or blocked
        }
    };

    const playWinSound = () => {
        try {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6

            notes.forEach((freq, i) => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                oscillator.frequency.value = freq;
                oscillator.type = 'sine';

                const startTime = audioContext.currentTime + i * 0.15;
                gainNode.gain.setValueAtTime(0.15, startTime);
                gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);

                oscillator.start(startTime);
                oscillator.stop(startTime + 0.4);
            });
        } catch (e) {
            // Audio not supported or blocked
        }
    };

    // Load participants
    useEffect(() => {
        const load = async () => {
            try {
                const data = await api.getRaffleParticipants(raffle.id);

                let candidates: Participant[] = data.map((p: any) => ({
                    user_id: p.user_id,
                    name: p.name || `Participante ${p.user_id}`,
                    picture: p.picture
                }));

                // Add fillers if too few participants to make the tape look good
                if (candidates.length < 15) {
                    const fillers: Participant[] = Array(20).fill(null).map((_, i) => ({
                        user_id: `filler-${i}`,
                        name: `Participante ${Math.floor(Math.random() * 9000) + 1000}`,
                        picture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}`
                    }));
                    candidates = [...candidates, ...fillers];
                }

                setParticipants(candidates);
                setStatus('ready');
            } catch (error) {
                console.error("Error loading participants for roulette", error);

                // Demo fallback
                const dummyParticipants: Participant[] = Array(25).fill(null).map((_, i) => ({
                    user_id: `dummy-${i}`,
                    name: `Participante ${Math.floor(Math.random() * 9000) + 1000}`,
                    picture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`
                }));
                setParticipants(dummyParticipants);
                setStatus('ready');
            }
        };
        load();
    }, [raffle.id]);

    // Prepare the "Extended List" for the animation (Winner at fixed position)
    useEffect(() => {
        if (participants.length === 0 || status === 'loading') return;

        const winner = raffle.winner;
        const winnerParticipant: Participant = winner ? {
            user_id: String(winner.id || winner.user_id),
            name: winner.name || 'Vencedor',
            picture: winner.picture
        } : participants[Math.floor(Math.random() * participants.length)];

        // Create a long shuffled list
        // Multiply list to ensure enough scrolling length
        const shuffled = [...participants].sort(() => Math.random() - 0.5);
        const repeated: Participant[] = [];

        // Create enough cards for the animation (about 60+ cards min)
        for (let i = 0; i < 8; i++) {
            repeated.push(...shuffled.sort(() => Math.random() - 0.5));
        }

        // Place winner at a specific position near the end
        // We want the winner to land exactly under the pointer
        // Let's pick an index that ensures a long spin
        const winnerIndex = repeated.length - Math.floor(VISIBLE_CARDS / 2) - 2;
        repeated[winnerIndex] = winnerParticipant;

        setExtendedList(repeated);
    }, [participants, raffle.winner, status]);

    // Handle Ticking Sound based on motion value
    useEffect(() => {
        if (status !== 'spinning') return;

        const unsubscribe = x.on("change", (latest) => {
            const cardsPassed = Math.floor(Math.abs(latest) / CARD_WIDTH);
            if (cardsPassed !== lastTickPosition.current) {
                lastTickPosition.current = cardsPassed;
                playTickSound();
            }
        });

        return () => unsubscribe();
    }, [status, x]);

    // Start Spin
    const startSpin = async () => {
        if (status !== 'ready' || extendedList.length === 0) return;

        setStatus('spinning');
        lastTickPosition.current = 0;

        // Calculate final position
        // We need to move the strip leftwards (negative X)
        // The winner is at `winnerIndex`. 
        // We want `winnerIndex` to be at the center.
        // Center of view = (VISIBLE_CARDS * CARD_WIDTH) / 2
        // We want the winner card's center to align with Center of view.
        // Winner card position start = winnerIndex * CARD_WIDTH
        // Winner card center = winnerIndex * CARD_WIDTH + CARD_WIDTH/2

        const winnerIndex = extendedList.length - Math.floor(VISIBLE_CARDS / 2) - 2;

        // Center offset to align the winning card in the middle of the viewport
        const viewportWidth = VISIBLE_CARDS * CARD_WIDTH;
        const centerOffset = viewportWidth / 2 - CARD_WIDTH / 2;

        const finalX = -(winnerIndex * CARD_WIDTH) + centerOffset;

        await controls.start({
            x: finalX,
            transition: {
                duration: SPIN_DURATION,
                ease: [0.15, 0.85, 0.35, 1], // Custom cubic-bezier for "slot machine" feel (fast start, slow stop)
            }
        });

        // Animation Complete
        setStatus('winner');
        playWinSound();
        triggerConfetti();
    };

    // Auto-start when ready
    useEffect(() => {
        if (status === 'ready' && extendedList.length > 0) {
            // Small delay before start
            const timer = setTimeout(() => {
                startSpin();
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [status, extendedList]);

    if (status === 'loading') return null;

    const winner = raffle.winner;

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 backdrop-blur-xl animate-fade-in overflow-hidden">

            {/* Close button */}
            <button
                onClick={onClose}
                className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-50"
            >
                <X className="w-6 h-6 text-white/70" />
            </button>

            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-yellow-500/10 via-transparent to-transparent rounded-full blur-3xl" />
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-900/20 via-transparent to-transparent" />
            </div>

            {/* Header */}
            <div className="relative z-10 mb-12 text-center space-y-3 animate-fade-in">
                <div className="flex items-center justify-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" />
                    <span className="text-xs font-bold tracking-[0.3em] uppercase text-yellow-500/80 border border-yellow-500/30 px-4 py-1 rounded-full bg-yellow-500/10">
                        Sorteio Ao Vivo
                    </span>
                    <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" />
                </div>

                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                    {status === 'winner' ? (
                        <span className="bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(251,191,36,0.5)]">
                            🎉 TEMOS UM VENCEDOR! 🎉
                        </span>
                    ) : (
                        <span className="text-white/90">GIRANDO A ROLETA...</span>
                    )}
                </h1>
                <p className="text-lg text-white/60">{raffle.titulo}</p>
            </div>

            {/* Roulette Container */}
            <div className="relative w-full max-w-5xl mx-auto px-4">

                {/* Golden frame */}
                <div className="relative bg-gradient-to-b from-zinc-900 to-black border-2 border-yellow-600/50 rounded-2xl p-1 shadow-[0_0_60px_rgba(251,191,36,0.15)]">

                    {/* Inner frame with gradient border */}
                    <div className="relative bg-black rounded-xl overflow-hidden border border-yellow-500/20">

                        {/* Edge shadows overlay for 3D effect */}
                        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-black via-black/80 to-transparent z-20 pointer-events-none" />
                        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-black via-black/80 to-transparent z-20 pointer-events-none" />

                        {/* Center pointer - Top */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-30">
                            <div className="relative">
                                <ChevronDown className="w-10 h-10 text-yellow-500 drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]" />
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-8 bg-yellow-500/30 blur-xl rounded-full" />
                            </div>
                        </div>

                        {/* Center line */}
                        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[3px] bg-gradient-to-b from-yellow-500 via-yellow-400 to-yellow-500 z-20 shadow-[0_0_20px_rgba(251,191,36,0.8)]" />

                        {/* The scrolling strip */}
                        <div
                            className="relative h-48 flex items-center overflow-hidden"
                            style={{ width: `${VISIBLE_CARDS * CARD_WIDTH}px`, margin: '0 auto' }}
                        >
                            <motion.div
                                className="flex gap-0 absolute"
                                animate={controls}
                                style={{ x }}
                            >
                                {extendedList.map((participant, index) => {
                                    // Identify if this specific card clone is the one destined to win
                                    // It matches the winnerIndex
                                    const isWinnerCard = index === (extendedList.length - Math.floor(VISIBLE_CARDS / 2) - 2);

                                    // Also highlight if it IS the winner user, but visually we want the one under the pointer
                                    const isWinnerState = status === 'winner' && isWinnerCard;

                                    return (
                                        <motion.div
                                            key={`${participant.user_id}-${index}`}
                                            className={`
                                                flex-shrink-0 flex flex-col items-center justify-center p-3 mx-1
                                                rounded-xl border-2 transition-all duration-300
                                                ${isWinnerState
                                                    ? 'border-yellow-500 bg-gradient-to-b from-yellow-500/30 to-yellow-600/10 shadow-[0_0_40px_rgba(251,191,36,0.5)]'
                                                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                                                }
                                            `}
                                            style={{ width: CARD_WIDTH - 8, height: 160 }}
                                            animate={isWinnerState ? {
                                                scale: [1, 1.05, 1],
                                                boxShadow: [
                                                    '0 0 20px rgba(251,191,36,0.3)',
                                                    '0 0 60px rgba(251,191,36,0.6)',
                                                    '0 0 20px rgba(251,191,36,0.3)'
                                                ]
                                            } : {}}
                                            transition={{ duration: 1.5, repeat: isWinnerState ? Infinity : 0 }}
                                        >
                                            <div className="relative">
                                                <Avatar className={`
                                                    w-16 h-16 border-2 shadow-lg
                                                    ${isWinnerState ? 'border-yellow-500 ring-4 ring-yellow-500/30' : 'border-white/20'}
                                                `}>
                                                    <AvatarImage
                                                        src={participant.picture}
                                                        className="object-cover"
                                                    />
                                                    <AvatarFallback className="bg-gradient-to-br from-zinc-700 to-zinc-900 text-white text-lg font-bold">
                                                        {participant.name?.[0]?.toUpperCase() || '?'}
                                                    </AvatarFallback>
                                                </Avatar>

                                                {isWinnerState && (
                                                    <motion.div
                                                        className="absolute -top-2 -right-2 bg-yellow-500 rounded-full p-1.5 shadow-lg"
                                                        animate={{
                                                            scale: [1, 1.2, 1],
                                                            rotate: [0, 10, -10, 0]
                                                        }}
                                                        transition={{ duration: 0.5, repeat: Infinity }}
                                                    >
                                                        <Trophy className="w-4 h-4 text-black" fill="black" />
                                                    </motion.div>
                                                )}
                                            </div>

                                            <p className={`
                                                mt-2 text-sm font-semibold text-center truncate w-full px-1
                                                ${isWinnerState ? 'text-yellow-400' : 'text-white/80'}
                                            `}>
                                                {participant.name}
                                            </p>
                                        </motion.div>
                                    );
                                })}
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Winner Details (pops up after win) */}
            {status === 'winner' && winner && (
                <motion.div
                    className="mt-12 text-center space-y-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                >
                    <div className="flex items-center justify-center gap-6 p-6 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-md">
                        <div className="relative">
                            <div className="absolute inset-0 bg-yellow-500/30 blur-xl rounded-full animate-pulse" />
                            <Avatar className="w-24 h-24 border-4 border-yellow-500 shadow-2xl relative">
                                <AvatarImage src={winner.picture} className="object-cover" />
                                <AvatarFallback className="bg-yellow-500 text-black text-3xl font-bold">
                                    {winner.name?.[0]?.toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-2 -right-2 bg-yellow-500 rounded-full p-2 shadow-lg border-2 border-black">
                                <Trophy className="w-6 h-6 text-black" fill="black" />
                            </div>
                        </div>

                        <div className="text-left">
                            <p className="text-sm text-yellow-500/80 font-medium uppercase tracking-wider mb-1">
                                Grande Vencedor
                            </p>
                            <h2 className="text-4xl font-black text-white mb-1 drop-shadow-lg">{winner.name}</h2>
                            <p className="text-white/60">Parabéns! Você ganhou o prêmio.</p>
                        </div>
                    </div>

                    <motion.button
                        onClick={onClose}
                        className="px-10 py-4 bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-bold rounded-full shadow-[0_0_30px_rgba(251,191,36,0.4)] hover:shadow-[0_0_50px_rgba(251,191,36,0.6)] transition-all"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.5 }}
                    >
                        Fechar e Ver Detalhes
                    </motion.button>
                </motion.div>
            )}

            {/* Loading Indicator */}
            {status === 'loading' && (
                <div className="flex items-center justify-center mt-12">
                    <div className="w-12 h-12 border-4 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin" />
                </div>
            )}
        </div>
    );
}
