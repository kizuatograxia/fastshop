import React, { useEffect, useState, useRef, useCallback } from "react";
import { motion, useAnimation, useMotionValue } from "framer-motion";
import { triggerConfetti } from "@/lib/confetti";
import { Raffle } from "@/types/raffle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { api } from "@/lib/api";
import { Trophy, Sparkles, ChevronDown, X, Star } from "lucide-react";

interface LiveRouletteProps {
    raffle: Raffle;
    onClose: () => void;
}

interface Participant {
    user_id: string;
    name: string;
    picture?: string;
}

const SPIN_DURATION = 7;

export function LiveRoulette({ raffle, onClose }: LiveRouletteProps) {
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [status, setStatus] = useState<'ready' | 'spinning' | 'winner'>('ready');
    const [isLoading, setIsLoading] = useState(true);
    const [extendedList, setExtendedList] = useState<Participant[]>([]);
    const [containerWidth, setContainerWidth] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    // Responsive card sizing
    const CARD_WIDTH = containerWidth > 768 ? 140 : containerWidth > 480 ? 110 : 90;
    const VISIBLE_CARDS = containerWidth > 768 ? 7 : containerWidth > 480 ? 5 : 3;
    const CARD_HEIGHT = containerWidth > 768 ? 160 : containerWidth > 480 ? 130 : 110;

    const controls = useAnimation();
    const x = useMotionValue(0);
    const lastTickPosition = useRef(0);
    const audioCtxRef = useRef<AudioContext | null>(null);

    // Measure container
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const ro = new ResizeObserver((entries) => {
            setContainerWidth(entries[0].contentRect.width);
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    const getAudioContext = () => {
        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        return audioCtxRef.current;
    };

    const playTickSound = useCallback(() => {
        try {
            const audioContext = getAudioContext();
            if (audioContext.state === 'suspended') audioContext.resume();

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
        } catch (e) { }
    }, []);

    const playWinSound = useCallback(() => {
        try {
            const audioContext = getAudioContext();
            if (audioContext.state === 'suspended') audioContext.resume();
            const notes = [523.25, 659.25, 783.99, 1046.50];
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
        } catch (e) { }
    }, []);

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
                if (candidates.length < 15) {
                    const fillers: Participant[] = Array(20).fill(null).map((_, i) => ({
                        user_id: `filler-${i}`,
                        name: `Participante ${Math.floor(Math.random() * 9000) + 1000}`,
                        picture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}`
                    }));
                    candidates = [...candidates, ...fillers];
                }
                setParticipants(candidates);
                setIsLoading(false);
            } catch (error) {
                const dummyParticipants: Participant[] = Array(25).fill(null).map((_, i) => ({
                    user_id: `dummy-${i}`,
                    name: `Participante ${Math.floor(Math.random() * 9000) + 1000}`,
                    picture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`
                }));
                setParticipants(dummyParticipants);
                setIsLoading(false);
            }
        };
        load();
    }, [raffle.id]);

    // Prepare extended list
    useEffect(() => {
        if (participants.length === 0 || isLoading) return;

        const winner = raffle.winner;
        const winnerParticipant: Participant = winner ? {
            user_id: String(winner.id || winner.user_id),
            name: winner.name || 'Vencedor',
            picture: winner.picture
        } : participants[Math.floor(Math.random() * participants.length)];

        const ANIMATION_CARDS = 80;
        const repeated: Participant[] = [];
        for (let i = 0; i < ANIMATION_CARDS; i++) {
            repeated.push(participants[Math.floor(Math.random() * participants.length)]);
        }

        const winnerIndex = ANIMATION_CARDS - Math.floor(VISIBLE_CARDS / 2) - 2;
        repeated[winnerIndex] = winnerParticipant;
        setExtendedList(repeated);
    }, [participants, raffle.winner, isLoading, VISIBLE_CARDS]);

    // Tick sounds
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
    }, [status, x, CARD_WIDTH, playTickSound]);

    // Start Spin
    const startSpin = useCallback(async () => {
        if (status !== 'ready' || extendedList.length === 0 || containerWidth === 0) return;

        setStatus('spinning');
        lastTickPosition.current = 0;

        const winnerIndex = extendedList.length - Math.floor(VISIBLE_CARDS / 2) - 2;
        const viewportWidth = VISIBLE_CARDS * CARD_WIDTH;
        const centerOffset = viewportWidth / 2 - CARD_WIDTH / 2;
        const finalX = -(winnerIndex * CARD_WIDTH) + centerOffset;

        await controls.start({
            x: finalX,
            transition: {
                duration: SPIN_DURATION,
                ease: [0.15, 0.85, 0.35, 1],
            }
        });

        setStatus('winner');
        playWinSound();
        triggerConfetti();
    }, [status, extendedList, CARD_WIDTH, VISIBLE_CARDS, controls, playWinSound]);

    // Auto-start
    useEffect(() => {
        if (status === 'ready' && extendedList.length > 0 && containerWidth > 0) {
            const timer = setTimeout(startSpin, 1000);
            return () => clearTimeout(timer);
        }
    }, [status, extendedList, startSpin, CARD_WIDTH]);

    if (isLoading) return null;

    const winner = raffle.winner;

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 backdrop-blur-xl animate-fade-in overflow-hidden">
            {/* Close button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 md:top-6 md:right-6 p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-50 backdrop-blur-md"
            >
                <X className="w-5 h-5 md:w-6 md:h-6 text-white/70" />
            </button>

            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] md:w-[800px] h-[600px] md:h-[800px] bg-gradient-radial from-yellow-500/10 via-transparent to-transparent rounded-full blur-3xl" />
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-900/20 via-transparent to-transparent" />
                {/* Animated particles */}
                {status === 'spinning' && (
                    <>
                        {[...Array(6)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute w-1 h-1 bg-yellow-400 rounded-full"
                                initial={{ x: '50vw', y: '50vh', opacity: 0 }}
                                animate={{
                                    x: `${20 + Math.random() * 60}vw`,
                                    y: `${20 + Math.random() * 60}vh`,
                                    opacity: [0, 1, 0],
                                    scale: [0, 2, 0],
                                }}
                                transition={{ duration: 2, repeat: Infinity, delay: i * 0.3, ease: 'easeOut' }}
                            />
                        ))}
                    </>
                )}
            </div>

            {/* Header */}
            <div className="relative z-10 mb-6 md:mb-12 text-center space-y-2 md:space-y-3 px-4 animate-fade-in">
                <div className="flex items-center justify-center gap-2 mb-2 md:mb-4">
                    <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-yellow-500 animate-pulse" />
                    <span className="text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase text-yellow-500/80 border border-yellow-500/30 px-3 md:px-4 py-1 rounded-full bg-yellow-500/10">
                        Sorteio Ao Vivo
                    </span>
                    <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-yellow-500 animate-pulse" />
                </div>

                <h1 className="text-2xl md:text-4xl lg:text-5xl font-black text-white tracking-tight">
                    {status === 'winner' ? (
                        <motion.span
                            className="bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(251,191,36,0.5)]"
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                        >
                            🎉 TEMOS UM VENCEDOR! 🎉
                        </motion.span>
                    ) : (
                        <motion.span
                            className="text-white/90"
                            animate={{ opacity: [0.7, 1, 0.7] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        >
                            GIRANDO A ROLETA...
                        </motion.span>
                    )}
                </h1>
                <p className="text-sm md:text-lg text-white/60 truncate max-w-md mx-auto">{raffle.titulo}</p>
            </div>

            {/* Roulette Container */}
            <div ref={containerRef} className="relative w-full max-w-5xl mx-auto px-2 md:px-4">
                {/* Golden frame */}
                <div className="relative bg-gradient-to-b from-zinc-900 to-black border-2 border-yellow-600/50 rounded-xl md:rounded-2xl p-1 shadow-[0_0_60px_rgba(251,191,36,0.15)]">
                    {/* Inner frame */}
                    <div className="relative bg-black rounded-lg md:rounded-xl overflow-hidden border border-yellow-500/20">
                        {/* Edge shadows */}
                        <div className="absolute left-0 top-0 bottom-0 w-12 md:w-24 bg-gradient-to-r from-black via-black/80 to-transparent z-20 pointer-events-none" />
                        <div className="absolute right-0 top-0 bottom-0 w-12 md:w-24 bg-gradient-to-l from-black via-black/80 to-transparent z-20 pointer-events-none" />

                        {/* Center pointer - Top */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-30">
                            <div className="relative">
                                <ChevronDown className="w-8 h-8 md:w-10 md:h-10 text-yellow-500 drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]" />
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 md:w-8 h-6 md:h-8 bg-yellow-500/30 blur-xl rounded-full" />
                            </div>
                        </div>

                        {/* Center line */}
                        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[2px] md:w-[3px] bg-gradient-to-b from-yellow-500 via-yellow-400 to-yellow-500 z-20 shadow-[0_0_20px_rgba(251,191,36,0.8)]" />

                        {/* The scrolling strip */}
                        <div
                            className="relative flex items-center overflow-hidden mx-auto"
                            style={{
                                height: `${CARD_HEIGHT + 32}px`,
                                width: `${VISIBLE_CARDS * CARD_WIDTH}px`,
                            }}
                        >
                            <motion.div
                                className="flex gap-0 absolute"
                                animate={controls}
                                style={{ x }}
                            >
                                {extendedList.map((participant, index) => {
                                    const isWinnerCard = index === (extendedList.length - Math.floor(VISIBLE_CARDS / 2) - 2);
                                    const isWinnerState = status === 'winner' && isWinnerCard;

                                    return (
                                        <motion.div
                                            key={`${participant.user_id}-${index}`}
                                            className={`
                                                flex-shrink-0 flex flex-col items-center justify-center p-2 md:p-3 mx-0.5 md:mx-1
                                                rounded-lg md:rounded-xl border-2 transition-all duration-300
                                                ${isWinnerState
                                                    ? 'border-yellow-500 bg-gradient-to-b from-yellow-500/30 to-yellow-600/10 shadow-[0_0_40px_rgba(251,191,36,0.5)]'
                                                    : 'border-white/10 bg-white/5'
                                                }
                                            `}
                                            style={{ width: CARD_WIDTH - 8, height: CARD_HEIGHT }}
                                            animate={isWinnerState ? {
                                                scale: [1, 1.08, 1],
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
                                                    w-10 h-10 md:w-16 md:h-16 border-2 shadow-lg
                                                    ${isWinnerState ? 'border-yellow-500 ring-4 ring-yellow-500/30' : 'border-white/20'}
                                                `}>
                                                    <AvatarImage src={participant.picture} className="object-cover" />
                                                    <AvatarFallback className="bg-gradient-to-br from-zinc-700 to-zinc-900 text-white text-sm md:text-lg font-bold">
                                                        {participant.name?.[0]?.toUpperCase() || '?'}
                                                    </AvatarFallback>
                                                </Avatar>

                                                {isWinnerState && (
                                                    <motion.div
                                                        className="absolute -top-1.5 -right-1.5 md:-top-2 md:-right-2 bg-yellow-500 rounded-full p-1 md:p-1.5 shadow-lg"
                                                        animate={{
                                                            scale: [1, 1.2, 1],
                                                            rotate: [0, 10, -10, 0]
                                                        }}
                                                        transition={{ duration: 0.5, repeat: Infinity }}
                                                    >
                                                        <Trophy className="w-3 h-3 md:w-4 md:h-4 text-black" fill="black" />
                                                    </motion.div>
                                                )}
                                            </div>

                                            <p className={`
                                                mt-1.5 md:mt-2 text-[10px] md:text-sm font-semibold text-center truncate w-full px-1
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

            {/* Winner Details */}
            {status === 'winner' && winner && (
                <motion.div
                    className="mt-6 md:mt-12 text-center space-y-4 md:space-y-6 px-4"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.6, type: 'spring' }}
                >
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 p-4 md:p-6 bg-white/5 rounded-2xl md:rounded-3xl border border-white/10 backdrop-blur-md max-w-lg mx-auto">
                        <div className="relative">
                            <div className="absolute inset-0 bg-yellow-500/30 blur-xl rounded-full animate-pulse" />
                            <Avatar className="w-16 h-16 md:w-24 md:h-24 border-4 border-yellow-500 shadow-2xl relative">
                                <AvatarImage src={winner.picture} className="object-cover" />
                                <AvatarFallback className="bg-yellow-500 text-black text-xl md:text-3xl font-bold">
                                    {winner.name?.[0]?.toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-1.5 -right-1.5 md:-bottom-2 md:-right-2 bg-yellow-500 rounded-full p-1.5 md:p-2 shadow-lg border-2 border-black">
                                <Trophy className="w-4 h-4 md:w-6 md:h-6 text-black" fill="black" />
                            </div>
                        </div>

                        <div className="text-center sm:text-left">
                            <p className="text-xs md:text-sm text-yellow-500/80 font-medium uppercase tracking-wider mb-1">
                                Grande Vencedor
                            </p>
                            <h2 className="text-2xl md:text-4xl font-black text-white mb-1 drop-shadow-lg">{winner.name}</h2>
                            <p className="text-white/60 text-sm">Parabéns! 🎊</p>
                        </div>
                    </div>

                    <motion.button
                        onClick={onClose}
                        className="px-8 md:px-10 py-3 md:py-4 bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-bold rounded-full shadow-[0_0_30px_rgba(251,191,36,0.4)] hover:shadow-[0_0_50px_rgba(251,191,36,0.6)] transition-all text-sm md:text-base"
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
            {isLoading && (
                <div className="flex items-center justify-center mt-12">
                    <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
            )}
        </div>
    );
}
