import React, { useState, useMemo, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Clock, Users, Ticket, Trophy, Target, Info, CheckCircle2, Minus, Plus, Loader2, Share2, ShoppingCart, Activity, Hash, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/contexts/WalletContext";
import { useUserRaffles } from "@/contexts/UserRafflesContext";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { OwnedNFT } from "@/types/raffle";
import { Progress } from "@/components/ui/progress";
import { TicketVisualizer } from "@/components/TicketVisualizer";
import { TicketRoulette } from "@/components/TicketRoulette";

// ... rarityColors ...
const rarityColors: Record<string, string> = {
    comum: "from-gray-400 to-gray-500",
    raro: "from-blue-400 to-cyan-500",
    epico: "from-purple-400 to-pink-500",
    lendario: "from-yellow-400 to-orange-500",
};

// Circular countdown component
const CircularCountdown: React.FC<{ targetDate: string, onExpire?: () => void, minimal?: boolean }> = ({ targetDate, onExpire, minimal = false }) => {
    // ...
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, progress: 0, total: 1 });

    useEffect(() => {
        const update = () => {
            const now = Date.now();
            const end = new Date(targetDate).getTime();
            const diff = Math.max(0, end - now);

            if (diff === 0 && onExpire) {
                onExpire();
            }

            // Assume raffle started 30 days before end
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

    // Shared SVG ring + time display (used in both variants)
    const ringDisplay = (
        <div className="relative w-full h-full">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="90" fill="none"
                    stroke={minimal ? "rgba(255,255,255,0.1)" : "hsl(var(--border))"}
                    strokeWidth={minimal ? 6 : 8} />
                <circle cx="100" cy="100" r="90" fill="none"
                    stroke="hsl(var(--primary))" strokeWidth={minimal ? 6 : 8}
                    strokeLinecap="round" strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-1000 ease-linear" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                {isExpired ? (
                    <div className="text-center">
                        <Activity className="w-10 h-10 text-primary animate-spin mx-auto mb-1" />
                        <span className="text-xs font-bold text-primary uppercase tracking-widest">SORTEANDO</span>
                    </div>
                ) : timeLeft.days > 0 ? (
                    <>
                        <div className={`font-black tracking-tight tabular-nums ${minimal ? "text-4xl text-white" : "text-5xl text-foreground"}`}>
                            {String(timeLeft.days).padStart(2, "0")}
                            <span className={minimal ? "text-white/40 mx-1" : "text-muted-foreground mx-1"}>:</span>
                            {String(timeLeft.hours).padStart(2, "0")}
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${minimal ? "text-white/50" : "text-muted-foreground"}`}>DIAS</span>
                    </>
                ) : (
                    <>
                        <div className={`font-black tracking-tight tabular-nums ${minimal ? "text-4xl text-white" : "text-5xl text-foreground"}`}>
                            {String(timeLeft.hours).padStart(2, "0")}
                            <span className={`mx-1 animate-pulse ${minimal ? "text-white/40" : "text-muted-foreground"}`}>:</span>
                            {String(timeLeft.minutes).padStart(2, "0")}
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${minimal ? "text-white/50" : "text-muted-foreground"}`}>
                            {timeLeft.hours > 0 ? "HORAS" : "MINUTOS"}
                        </span>
                    </>
                )}
            </div>
        </div>
    );

    // MINIMAL variant — just the ring, no card/buttons/title
    if (minimal) {
        return (
            <div className="relative w-full aspect-square flex items-center justify-center">
                {/* Subtle dark glass backing */}
                <div className="absolute inset-4 rounded-full bg-black/50 backdrop-blur-md border border-white/10" />
                <div className="relative w-full h-full">
                    {ringDisplay}
                </div>
                {isEnding && !isExpired && (
                    <div className="absolute bottom-6 flex items-center gap-1.5 bg-red-500/20 text-red-300 px-2.5 py-1 rounded-full text-[10px] font-bold border border-red-500/30">
                        <Clock className="w-2.5 h-2.5" />
                        ENCERRA EM BREVE
                    </div>
                )}
            </div>
        );
    }

    // FULL variant — card with title and buttons
    return (
        <div className="bg-card rounded-2xl border border-border p-6 flex flex-col items-center relative overflow-hidden">
            {isEnding && !isExpired && (
                <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-destructive/20 text-destructive px-2.5 py-1 rounded-full text-xs font-bold border border-destructive/30">
                    <Clock className="w-3 h-3" />
                    ENCERRA EM BREVE
                </div>
            )}

            <h3 className="text-base font-bold text-foreground mb-6">
                {isExpired ? "O Sorteio Está em Andamento!" : "O Próximo Ganhador Será Definido em..."}
            </h3>

            <div className="relative w-52 h-52 mb-4">{ringDisplay}</div>

            <div className="flex gap-3 w-full mt-2">
                <Button variant="hero" className="flex-1 h-12 text-base font-bold gap-2" disabled={isExpired} onClick={() => {
                    document.getElementById("nft-selection")?.scrollIntoView({ behavior: "smooth" });
                }}>
                    <ShoppingCart className="w-4 h-4" />
                    Comprar Tickets
                </Button>
                <Button variant="outline" size="icon" className="h-12 w-12" onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success("Link copiado!");
                }}>
                    <Share2 className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
};

// Activity Feed component
const ActivityFeed: React.FC<{ raffleId: string }> = ({ raffleId }) => {
    const mockActivity = [
        { name: "João D.", action: "+3 tickets comprados", time: "2m", isYou: false },
        { name: "Maria A.", action: "+10 tickets (Bulk)", time: "5m", isYou: false },
        { name: "Você", action: "Entrada confirmada (4 tickets)", time: "12m", isYou: true },
        { name: "Pedro S.", action: "+1 ticket comprado", time: "18m", isYou: false },
        { name: "Ana L.", action: "+5 tickets (Bulk)", time: "25m", isYou: false },
    ];

    return (
        <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
            <h3 className="font-bold text-sm text-foreground uppercase tracking-wider">
                Atividade Recente
            </h3>
            <div className="space-y-3">
                {mockActivity.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 group">
                        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${item.isYou ? "bg-primary" : "bg-muted-foreground/40"
                            }`} />
                        <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${item.isYou ? "text-primary" : "text-foreground"}`}>
                                {item.name}
                            </p>
                            <p className="text-xs text-muted-foreground">{item.action}</p>
                        </div>
                        <span className="text-xs text-muted-foreground flex-shrink-0">{item.time}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const RaffleDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { ownedNFTs, removeNFT, refreshWallet } = useWallet();
    const { addUserRaffle, getUserValue } = useUserRaffles();

    const [selectedNFTs, setSelectedNFTs] = useState<Record<string, number>>({});
    const [raffle, setRaffle] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isDrawing, setIsDrawing] = useState(false);
    const [isLiveViewActive, setIsLiveViewActive] = useState(false);
    const [activeImage, setActiveImage] = useState<string>("");

    useEffect(() => {
        if (id) {
            api.getRaffle(id)
                .then(data => {
                    const mapped = {
                        id: String(data.id),
                        titulo: data.title,
                        descricao: data.description,
                        imagem: data.image_url && !data.image_url.includes('example.com')
                            ? data.image_url
                            : "https://images.unsplash.com/photo-1635326444826-06c8f8d2e61d?w=800&q=80",
                        status: data.status === 'active' ? 'ativo' : 'encerrado',
                        premio: data.prize_pool,
                        premioValor: data.prize_value || 0,
                        dataFim: data.draw_date || "2024-12-31",
                        custoNFT: data.ticket_price,
                        participantes: parseInt(data.tickets_sold) || 0,
                        categoria: "geral",
                        raridade: "comum",
                        emoji: "🎫",
                        image_urls: data.image_urls || [data.image_url],
                        winner: data.winner_name ? {
                            name: data.winner_name,
                            picture: data.winner_picture
                        } : undefined
                    };
                    setRaffle(mapped);
                    setActiveImage(mapped.imagem);
                })
                .catch(err => {
                    console.error("Error fetching raffle", err);
                    toast.error("Erro ao carregar sorteio. Tente novamente.");
                })
                .finally(() => setLoading(false));
        }
    }, [id]);

    const userCurrentValue = raffle ? getUserValue(raffle.id) : 0;
    const availableNFTs = ownedNFTs.filter(nft => nft.quantidade > 0);

    const handleQuantityChange = (nftId: string, delta: number, max: number) => {
        setSelectedNFTs(prev => {
            const current = prev[nftId] || 0;
            const next = Math.max(0, Math.min(max, current + delta));
            const newState = { ...prev, [nftId]: next };
            if (next === 0) delete newState[nftId];
            return newState;
        });
    };

    const toggleSelection = (nftId: string, max: number) => {
        setSelectedNFTs(prev => {
            const current = prev[nftId] || 0;
            if (current > 0) {
                const newState = { ...prev };
                delete newState[nftId];
                return newState;
            } else {
                return { ...prev, [nftId]: 1 };
            }
        });
    };

    const selectionStats = useMemo(() => {
        let count = 0;
        let value = 0;
        availableNFTs.forEach(nft => {
            const qty = selectedNFTs[nft.id] || 0;
            count += qty;
            value += qty * nft.preco;
        });
        return { count, value };
    }, [availableNFTs, selectedNFTs]);

    const calculateChance = (userVal: number) => {
        const prizeValue = raffle?.premioValor || 0;
        if (prizeValue === 0) return 0;
        const chance = (userVal / prizeValue) * 75;
        return Math.min(chance, 100);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!raffle) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center space-y-4">
                    <h1 className="text-2xl font-bold text-foreground">Sorteio não encontrado</h1>
                    <Button onClick={() => navigate("/")} variant="outline">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Voltar ao início
                    </Button>
                </div>
            </div>
        );
    }

    const { count: selectedCount, value: selectedValue } = selectionStats;
    const currentChance = calculateChance(userCurrentValue);
    const potentialChance = calculateChance(userCurrentValue + selectedValue);
    const ticketPrice = raffle.custoNFT;
    const ticketsToReceive = Math.floor(selectedValue / ticketPrice);

    // User tickets calculation (for visualizer)
    const userTickets = ticketPrice > 0 ? Math.floor(userCurrentValue / ticketPrice) : 0;

    const handleParticipate = async () => {
        if (isProcessing) return;
        if (raffle.status !== 'ativo') {
            toast.error("Este sorteio já foi encerrado!");
            return;
        }
        if (selectedCount === 0) {
            toast.error("Selecione pelo menos 1 NFT para participar");
            return;
        }
        if (ticketsToReceive === 0) {
            toast.error(`O valor selecionado (R$ ${selectedValue.toFixed(2)}) é insuficiente para um bilhete (R$ ${ticketPrice})`);
            return;
        }
        setIsProcessing(true);
        try {
            await addUserRaffle(raffle, ticketsToReceive, selectedValue, selectedNFTs);
            setRaffle((prev: any) => ({ ...prev, participantes: prev.participantes + ticketsToReceive }));
            await refreshWallet();
            setSelectedNFTs({});
            try {
                const data = await api.getRaffle(raffle.id);
                if (data && data.tickets_sold) {
                    setRaffle((prev: any) => ({ ...prev, participantes: parseInt(data.tickets_sold) || 0 }));
                }
            } catch (error) { console.error("Failed to refresh raffle stats", error); }
            toast.success(`Você entrou no sorteio com ${ticketsToReceive} Bilhetes!`, {
                description: `Valor total adicionado: R$ ${selectedValue.toFixed(2)}`,
            });
        } catch (error) {
            console.error("Erro ao participar do sorteio", error);
            toast.error("Ocorreu um erro ao processar sua participação. Tente novamente.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-background pb-24 lg:pb-8">
            {/* Dedicated Live View Overlay */}
            <AnimatePresence>
                {isLiveViewActive && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="fixed inset-0 z-[100] bg-[hsl(220,25%,5%)] flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <header className="flex-shrink-0 bg-black/40 backdrop-blur-md border-b border-white/10 z-10">
                            <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_red]" />
                                    <span className="font-black uppercase tracking-[0.3em] text-sm text-white/90">AO VIVO</span>
                                </div>
                                <div className="text-center flex-1">
                                    <h2 className="font-black text-base leading-tight uppercase tracking-widest text-white truncate">{raffle.titulo}</h2>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => setIsLiveViewActive(false)} className="rounded-full text-white/70 hover:text-white hover:bg-white/10">
                                    <ArrowLeft className="h-5 w-5" />
                                </Button>
                            </div>
                        </header>

                        {/* Body */}
                        <main className="flex-1 overflow-y-auto custom-scrollbar">
                            <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
                                {isDrawing ? (
                                    /* ---- ROULETTE MODE ---- */
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="space-y-6"
                                    >
                                        <div className="text-center space-y-2">
                                            <h3 className="font-black text-3xl text-white uppercase tracking-tighter">Sorteio em Andamento</h3>
                                            <p className="text-white/40 text-sm">Aguarde o resultado...</p>
                                        </div>
                                        <div className="bg-white/5 rounded-3xl border border-white/10 p-8 backdrop-blur-sm">
                                            <TicketRoulette
                                                totalTickets={Math.max(raffle.participantes, 50)}
                                                userTickets={userTickets}
                                            />
                                        </div>
                                    </motion.div>
                                ) : (
                                    /* ---- LIVE VIEW MODE ---- */
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                                        {/* LEFT: Circular Mempool + Timer */}
                                        <div className="flex flex-col items-center gap-6">
                                            <div className="text-center">
                                                <h3 className="font-black text-2xl text-white uppercase tracking-tighter">Visualização em Tempo Real</h3>
                                                <p className="text-white/40 text-xs mt-1 uppercase tracking-widest">Tickets proporcional por participante</p>
                                            </div>
                                            <div className="relative flex items-center justify-center w-full max-w-[440px] aspect-square">
                                                {/* Glow */}
                                                <div className="absolute inset-0 bg-primary/5 blur-[80px] rounded-full pointer-events-none" />

                                                {/* Circular Mempool behind the timer */}
                                                <div className="absolute inset-0 z-0">
                                                    <TicketVisualizer
                                                        totalTickets={raffle.participantes}
                                                        userTickets={userTickets}
                                                        variant="circular"
                                                    />
                                                </div>

                                                {/* Countdown in Center */}
                                                <div className="relative z-10 w-[72%]">
                                                    <CircularCountdown
                                                        targetDate={raffle.dataFim}
                                                        onExpire={() => setIsDrawing(true)}
                                                        minimal
                                                    />
                                                </div>
                                            </div>
                                            {/* Legend */}
                                            <div className="flex items-center gap-6 text-xs font-black uppercase tracking-widest">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 rounded-sm bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.5)]" />
                                                    <span className="text-primary">Seus tickets</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 rounded-sm bg-blue-600/60 border border-white/10" />
                                                    <span className="text-white/50">Outros</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* RIGHT: Stats + Activity */}
                                        <div className="flex flex-col gap-5">
                                            {/* Stat Cards */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-white/5 rounded-2xl p-5 border border-white/8 space-y-1">
                                                    <Users className="w-5 h-5 text-blue-400 mb-2" />
                                                    <p className="text-3xl font-black text-white">{raffle.participantes}</p>
                                                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Participantes</p>
                                                </div>
                                                <div className="bg-primary/10 rounded-2xl p-5 border border-primary/20 space-y-1">
                                                    <Target className="w-5 h-5 text-primary mb-2" />
                                                    <p className="text-3xl font-black text-primary">{currentChance.toFixed(1)}%</p>
                                                    <p className="text-[10px] font-bold text-primary/50 uppercase tracking-widest">Sua Chance</p>
                                                </div>
                                                <div className="bg-white/5 rounded-2xl p-5 border border-white/8 space-y-1">
                                                    <Ticket className="w-5 h-5 text-purple-400 mb-2" />
                                                    <p className="text-3xl font-black text-white">{userTickets}</p>
                                                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Seus Tickets</p>
                                                </div>
                                                <div className="bg-white/5 rounded-2xl p-5 border border-white/8 space-y-1">
                                                    <Trophy className="w-5 h-5 text-yellow-400 mb-2" />
                                                    <p className="text-xl font-black text-white">R$ {raffle.premioValor.toLocaleString("pt-BR")}</p>
                                                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Prêmio</p>
                                                </div>
                                            </div>
                                            {/* Activity Feed */}
                                            <div className="bg-white/5 rounded-2xl border border-white/8 overflow-hidden">
                                                <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                                        <span className="font-black text-sm text-white uppercase tracking-widest">Atividade Recente</span>
                                                    </div>
                                                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Tempo Real</span>
                                                </div>
                                                <ActivityFeed raffleId={raffle.id} />
                                            </div>

                                            {/* CTA */}
                                            <Button
                                                variant="hero"
                                                className="h-14 text-base font-black gap-3 rounded-2xl"
                                                onClick={() => {
                                                    setIsLiveViewActive(false);
                                                    setTimeout(() => document.getElementById("nft-selection")?.scrollIntoView({ behavior: "smooth" }), 200);
                                                }}
                                            >
                                                <ShoppingCart className="w-5 h-5" />
                                                Comprar Mais Tickets
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </main>
                    </motion.div>
                )}
            </AnimatePresence>

            <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
                <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                            <span className="hover:text-foreground cursor-pointer" onClick={() => navigate("/sorteios")}>Sorteios</span>
                            <span>/</span>
                            <span className="text-foreground font-medium truncate max-w-[200px]">{raffle.titulo}</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                {/* WINNER CARD */}
                {raffle.status === 'encerrado' && raffle.winner && (
                    <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/50 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 animate-fade-in shadow-glow mb-12">
                        <div className="relative">
                            <div className="absolute -inset-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur-lg opacity-50 animate-pulse"></div>
                            <img src={raffle.winner.picture} alt={raffle.winner.name} className="relative w-24 h-24 rounded-full border-4 border-white object-cover shadow-2xl" />
                            <div className="absolute -bottom-2 -right-2 bg-yellow-500 text-black p-2 rounded-full shadow-lg border-2 border-white">
                                <Trophy className="w-5 h-5" fill="black" />
                            </div>
                        </div>
                        <div className="text-center md:text-left space-y-1">
                            <p className="text-yellow-500 font-bold uppercase tracking-[0.2em] text-xs">Vencedor do Sorteio</p>
                            <h2 className="text-3xl font-black text-foreground">{raffle.winner.name}</h2>
                        </div>
                    </div>
                )}

                {/* Main Restoration Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Visual Area (LEFT) */}
                    <div className="lg:col-span-7 space-y-8">
                        {/* Huge Prize Photo */}
                        <div className="bg-card rounded-[2rem] border-2 border-border p-2 overflow-hidden shadow-elegant group">
                            <div className="relative aspect-video md:aspect-auto md:h-[500px] overflow-hidden rounded-[1.5rem]">
                                <img
                                    src={activeImage}
                                    alt={raffle.titulo}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="absolute bottom-6 left-6 text-white translate-y-4 group-hover:translate-y-0 transition-transform">
                                    <h3 className="text-2xl font-black">{raffle.titulo}</h3>
                                    <p className="text-sm opacity-80">Prêmio: {raffle.premio}</p>
                                </div>
                            </div>
                        </div>

                        {/* Thumbnails Gallery */}
                        {raffle.image_urls && raffle.image_urls.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-4 px-2 custom-scrollbar">
                                {raffle.image_urls.map((url: string, idx: number) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImage(url)}
                                        className={`relative w-24 h-24 flex-shrink-0 rounded-2xl overflow-hidden border-2 transition-all ${activeImage === url ? "border-primary scale-105 shadow-glow" : "border-transparent opacity-60 hover:opacity-100"}`}
                                    >
                                        <img src={url} alt={`${raffle.titulo} ${idx + 1}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Description */}
                        <div className="bg-card/50 rounded-3xl p-8 border border-border space-y-4">
                            <div className="flex items-center gap-2">
                                <Info className="w-5 h-5 text-primary" />
                                <h3 className="text-xl font-black uppercase tracking-tight">Detalhes do Sorteio</h3>
                            </div>
                            <p className="text-muted-foreground leading-relaxed text-lg italic">
                                "{raffle.descricao}"
                            </p>
                        </div>
                    </div>

                    {/* Status & Participation (RIGHT) */}
                    <div className="lg:col-span-5 space-y-8">
                        {/* Countdown */}
                        <div className="bg-card rounded-3xl border border-border p-6 shadow-sm overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Clock className="w-12 h-12 text-primary" />
                            </div>
                            <CircularCountdown targetDate={raffle.dataFim} />
                        </div>

                        {/* Live Mode Entry */}
                        <div
                            className="bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl border border-primary/30 p-8 flex items-center justify-between group cursor-pointer hover:shadow-glow hover:-translate-y-1 transition-all"
                            onClick={() => setIsLiveViewActive(true)}
                        >
                            <div className="flex items-center gap-5">
                                <div className="p-4 bg-primary text-white rounded-2xl shadow-glow relative overflow-hidden">
                                    <Activity className="w-8 h-8 relative z-10" />
                                    <div className="absolute inset-0 bg-white/20 translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-black text-xl leading-none">ACOMPANHAR AO VIVO</h4>
                                    <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Ver Mempool e Roleta</p>
                                </div>
                            </div>
                            <ChevronRight className="w-6 h-6 text-primary group-hover:translate-x-2 transition-transform" />
                        </div>

                        {/* Prize Summary */}
                        <div className="bg-card rounded-3xl border border-border p-8 space-y-6 shadow-sm">
                            <div className="space-y-2">
                                <span className="text-primary font-bold uppercase tracking-[0.3em] text-xs">A Grande Chance</span>
                                <h2 className="text-4xl font-black text-foreground leading-tight">{raffle.premio}</h2>
                                <p className="text-2xl font-black text-gradient uppercase">VALOR: R$ {raffle.premioValor.toLocaleString("pt-BR")}</p>
                            </div>

                            <div className="h-px bg-border" />

                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Users className="w-4 h-4" />
                                        <span className="text-xs uppercase font-bold tracking-widest">Participantes</span>
                                    </div>
                                    <p className="font-black text-3xl text-foreground">{raffle.participantes}</p>
                                </div>
                                <div className="text-right space-y-1">
                                    <div className="flex items-center gap-2 text-muted-foreground justify-end">
                                        <Target className="w-4 h-4" />
                                        <span className="text-xs uppercase font-bold tracking-widest">Sua Chance</span>
                                    </div>
                                    <p className="font-black text-3xl text-primary">{currentChance.toFixed(1)}%</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Participation Section */}
                <div id="nft-selection" className="mt-20 space-y-10">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
                            <Ticket className="h-7 w-7 text-primary" />
                        </div>
                        <h2 className="text-3xl font-black text-foreground uppercase tracking-tighter">Escolha seus Ingressos</h2>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* NFT Selection List */}
                        <div className="lg:col-span-8 bg-card rounded-[2rem] border border-border p-8 shadow-sm">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
                                {availableNFTs.length === 0 ? (
                                    <div className="col-span-full py-16 text-center text-muted-foreground border-2 border-dashed border-border rounded-3xl bg-secondary/20">
                                        <p className="mb-4 font-bold text-lg">Nenhum NFT disponível na carteira.</p>
                                        <Button onClick={() => navigate("/")}>Ir para a Loja</Button>
                                    </div>
                                ) : (
                                    availableNFTs.map(nft => {
                                        const qtySelected = selectedNFTs[nft.id] || 0;
                                        const isSelected = qtySelected > 0;
                                        return (
                                            <div
                                                key={nft.id}
                                                className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${isSelected ? "border-primary bg-primary/5 ring-4 ring-primary/10" : "border-border hover:border-primary/40"}`}
                                                onClick={() => toggleSelection(nft.id, nft.quantidade)}
                                            >
                                                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${rarityColors[nft.raridade] || "from-gray-500 to-gray-600"} flex items-center justify-center text-3xl shadow-lg relative overflow-hidden group-hover:scale-110 transition-transform`}>
                                                    {nft.emoji}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-black text-foreground truncate uppercase text-sm tracking-tight">{nft.nome}</h4>
                                                    <div className="flex items-baseline gap-2">
                                                        <span className="text-lg font-black text-primary">R$ {nft.preco.toFixed(2)}</span>
                                                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Preço/Ticket</span>
                                                    </div>
                                                </div>
                                                {isSelected && (
                                                    <div className="flex items-center gap-2 bg-background rounded-lg border border-border p-1" onClick={e => e.stopPropagation()}>
                                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleQuantityChange(nft.id, -1, nft.quantidade)} disabled={qtySelected <= 0}><Minus className="h-3 w-3" /></Button>
                                                        <span className="text-sm font-black w-4 text-center">{qtySelected}</span>
                                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleQuantityChange(nft.id, 1, nft.quantidade)} disabled={qtySelected >= nft.quantidade}><Plus className="h-3 w-3" /></Button>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* Confirmation Panel */}
                        <div className="lg:col-span-4 bg-card rounded-[2rem] border border-border p-8 shadow-large flex flex-col h-fit sticky top-24">
                            <h4 className="text-2xl font-black mb-8 uppercase tracking-tighter">Resumo</h4>
                            <div className="space-y-6 flex-1">
                                <div className="flex justify-between items-center pb-4 border-b border-white/10">
                                    <span className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">Bilhetes Selecionados</span>
                                    <span className="font-black text-2xl text-foreground">{ticketPrice > 0 ? (selectedValue / ticketPrice) : 0}</span>
                                </div>
                                <div className="flex justify-between items-center pb-4 border-b border-white/10">
                                    <span className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">Total a Confirmar</span>
                                    <span className="font-black text-2xl text-primary">R$ {selectedValue.toFixed(2)}</span>
                                </div>
                                <div className="space-y-3 pt-4">
                                    <div className="flex justify-between items-end">
                                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em]">Potencial de Ganho</span>
                                        <span className="text-3xl font-black text-primary">{potentialChance.toFixed(2)}%</span>
                                    </div>
                                    <Progress value={potentialChance} className="h-4 rounded-full" />
                                </div>
                            </div>

                            <Button
                                className="w-full h-16 rounded-2xl mt-12 font-black text-lg uppercase tracking-[0.1em] shadow-glow"
                                variant="hero"
                                size="lg"
                                disabled={isProcessing || selectedCount === 0}
                                onClick={handleParticipate}
                            >
                                {isProcessing ? (
                                    <Loader2 className="w-7 h-7 animate-spin" />
                                ) : (
                                    "CONFIRMAR ENTRADA"
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default RaffleDetails;
