import React, { useState, useMemo, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Clock, Users, Ticket, Trophy, Target, Info, CheckCircle2, Minus, Plus, Loader2, Share2, ShoppingCart, Activity, Hash, ChevronRight, Eye, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/contexts/WalletContext";
import { useUserRaffles } from "@/contexts/UserRafflesContext";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { OwnedNFT, NFT } from "@/types/raffle";
import { Progress } from "@/components/ui/progress";
import { TicketVisualizer } from "@/components/TicketVisualizer";
import { CircularCountdown, MempoolLayoutSideBySide } from "@/components/MempoolLayout";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const rarityColors: Record<string, string> = {
    comum: "from-gray-400 to-gray-500",
    raro: "from-blue-400 to-cyan-500",
    epico: "from-purple-400 to-pink-500",
    lendario: "from-yellow-400 to-orange-500",
};

// Activity Feed with auto-refresh
const ActivityFeed: React.FC<{ raffleId: string; autoRefresh?: boolean }> = ({ raffleId, autoRefresh = false }) => {
    const [participants, setParticipants] = useState<any[]>([]);
    const [loadingParticipants, setLoadingParticipants] = useState(true);

    const fetchParticipants = () => {
        api.getRaffleParticipants(raffleId)
            .then((data) => {
                setParticipants(Array.isArray(data) ? data.slice(0, 15) : []);
            })
            .catch(() => setParticipants([]))
            .finally(() => setLoadingParticipants(false));
    };

    useEffect(() => {
        fetchParticipants();
        if (autoRefresh) {
            const interval = setInterval(fetchParticipants, 8000);
            return () => clearInterval(interval);
        }
    }, [raffleId, autoRefresh]);

    const formatTime = (dateStr: string) => {
        if (!dateStr) return "";
        const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
        if (diff < 1) return "agora";
        if (diff < 60) return `${diff}m`;
        if (diff < 1440) return `${Math.floor(diff / 60)}h`;
        return `${Math.floor(diff / 1440)}d`;
    };

    if (loadingParticipants) {
        return (
            <div className="p-4 space-y-2">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex gap-3 items-center animate-pulse">
                        <div className="w-2 h-2 rounded-full bg-white/10 flex-shrink-0" />
                        <div className="h-3 bg-white/10 rounded flex-1" />
                        <div className="h-3 bg-white/10 rounded w-8" />
                    </div>
                ))}
            </div>
        );
    }

    if (participants.length === 0) {
        return (
            <div className="p-6 text-center text-white/30 text-sm">
                Nenhuma atividade ainda
            </div>
        );
    }

    return (
        <div className="p-3 md:p-4 space-y-1.5 max-h-64 overflow-y-auto custom-scrollbar">
            {participants.map((p, i) => {
                const name = p.user_name || p.name || p.username || `Participante ${i + 1}`;
                const tickets = p.ticket_count || p.tickets || 1;
                const joinedAt = p.joined_at || p.created_at || p.date;
                return (
                    <motion.div
                        key={i}
                        className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                    >
                        <div className="w-2 h-2 rounded-full bg-blue-400/50 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <span className="text-xs font-bold text-white/70 truncate block">{name}</span>
                            <span className="text-[10px] text-white/30">{tickets} ticket{tickets !== 1 ? 's' : ''}</span>
                        </div>
                        {joinedAt && (
                            <span className="text-[10px] text-white/30 flex-shrink-0">{formatTime(joinedAt)}</span>
                        )}
                    </motion.div>
                );
            })}
        </div>
    );
};

const RaffleDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { ownedNFTs, removeNFT, refreshWallet } = useWallet();
    const { addUserRaffle, getUserValue, getTicketCount } = useUserRaffles();

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
                        maxParticipantes: parseInt(data.max_tickets) || parseInt(data.total_tickets) || 0,
                        categoria: data.category || "geral",
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

    const [pendingChangeDialog, setPendingChangeDialog] = useState<{
        open: boolean;
        emptySlots: number;
        selectedValue: number;
        changeValue: number;
        changeNFTs: NFT[];
    } | null>(null);

    const userCurrentValue = raffle ? getUserValue(raffle.id) : 0;
    const userTicketsFromCount = raffle ? getTicketCount(raffle.id) : 0;
    const userTicketsFromValue = raffle?.custoNFT > 0 ? Math.floor(userCurrentValue / raffle.custoNFT) : 0;
    const userTickets = Math.max(userTicketsFromCount, userTicketsFromValue);

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

    const calculateChance = (tickets: number) => {
        const total = raffle?.participantes || 0;
        if (total === 0 || tickets === 0) return 0;
        return Math.min((tickets / total) * 100, 100);
    };

    // Real-time polling
    useEffect(() => {
        if (!id || raffle?.status === 'encerrado') return;

        const poll = setInterval(async () => {
            try {
                const data = await api.getRaffle(id);
                if (data?.tickets_sold) {
                    setRaffle((prev: any) => ({
                        ...prev,
                        participantes: parseInt(data.tickets_sold) || prev.participantes,
                    }));
                }
                if (data?.status === 'encerrado' && !isDrawing) {
                    setIsLiveViewActive(true);
                    setIsDrawing(true);
                }
            } catch { /* silent */ }
        }, isLiveViewActive ? 3_000 : 5_000);

        return () => clearInterval(poll);
    }, [id, isDrawing, isLiveViewActive, raffle?.status]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <motion.div
                    className="flex flex-col items-center gap-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    <p className="text-muted-foreground text-sm font-medium animate-pulse">Carregando sorteio...</p>
                </motion.div>
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
    const ticketPrice = raffle.custoNFT;
    const ticketsToReceive = Math.floor(selectedValue / ticketPrice);

    let emptySlots = Infinity;
    if (raffle && raffle.maxParticipantes > 0) {
        emptySlots = Math.max(0, raffle.maxParticipantes - raffle.participantes);
    } else if (raffle && raffle.premioValor > 0 && ticketPrice > 0) {
        const derivedMax = Math.ceil(raffle.premioValor / ticketPrice);
        emptySlots = Math.max(0, derivedMax - raffle.participantes);
    }

    const currentChance = calculateChance(userTickets);
    const potentialChance = calculateChance(userTickets + ticketsToReceive);

    const executeParticipation = async (finalTicketsToReceive: number, finalSelectedValue: number, changeNFTsToIssue: NFT[] = []) => {
        setIsProcessing(true);
        try {
            await addUserRaffle(raffle, finalTicketsToReceive, finalSelectedValue, selectedNFTs);
            setRaffle((prev: any) => ({ ...prev, participantes: prev.participantes + finalTicketsToReceive }));

            if (changeNFTsToIssue.length > 0) {
                const userId = JSON.parse(localStorage.getItem("fastshop_user") || "{}")?.id;
                if (userId) {
                    await Promise.all(changeNFTsToIssue.map(changeNFT =>
                        api.addToWallet(Number(userId), changeNFT)
                    ));
                    toast.success("Troco de NFTs Enviado!", {
                        description: `Foram adicionados R$ ${changeNFTsToIssue.reduce((acc, nft) => acc + nft.preco, 0).toFixed(2)} em novos NFTs à sua carteira.`,
                    });
                }
            }

            await refreshWallet();
            setSelectedNFTs({});
            setPendingChangeDialog(null);
            try {
                const data = await api.getRaffle(raffle.id);
                if (data && data.tickets_sold) {
                    setRaffle((prev: any) => ({ ...prev, participantes: parseInt(data.tickets_sold) || 0 }));
                }
            } catch (error) { console.error("Failed to refresh raffle stats", error); }
            toast.success(`Você entrou no sorteio com ${finalTicketsToReceive} Bilhetes!`, {
                description: `Valor em cotas: R$ ${finalSelectedValue.toFixed(2)}`,
            });
        } catch (error) {
            console.error("Erro ao participar do sorteio", error);
            toast.error("Ocorreu um erro ao processar sua participação. Tente novamente.");
        } finally {
            setIsProcessing(false);
        }
    };

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

        if (ticketsToReceive > emptySlots) {
            if (emptySlots === 0) {
                toast.error(`Este sorteio já atingiu o limite máximo de ${raffle.maxParticipantes} bilhetes!`);
                return;
            }

            setIsProcessing(true);
            try {
                const allowedValue = emptySlots * ticketPrice;
                let changeValue = selectedValue - allowedValue;
                const catalog = await api.getNFTCatalog();
                const sortedCatalog = catalog.sort((a: any, b: any) => b.preco - a.preco);
                const changeNFTs: NFT[] = [];
                let remainingChange = changeValue;
                for (let i = 0; i < sortedCatalog.length; i++) {
                    const nft = sortedCatalog[i];
                    while (remainingChange >= nft.preco && nft.preco > 0) {
                        changeNFTs.push(nft);
                        remainingChange -= nft.preco;
                    }
                }
                if (remainingChange > 0.01) {
                    console.warn(`Could not perfectly refund. Remaining: ${remainingChange}`);
                }
                setPendingChangeDialog({
                    open: true,
                    emptySlots,
                    selectedValue,
                    changeValue: selectedValue - allowedValue - remainingChange,
                    changeNFTs,
                });
            } catch (e) {
                console.error("Erro ao calcular troco", e);
                toast.error("Erro interno ao simular troco. Tente novamente.");
            } finally {
                setIsProcessing(false);
            }
            return;
        }

        await executeParticipation(ticketsToReceive, selectedValue);
    };

    return (
        <div className="min-h-screen bg-background pb-24 lg:pb-8">
            {/* Change Confirmation Dialog */}
            <AlertDialog open={pendingChangeDialog?.open} onOpenChange={(open) => { if (!open) setPendingChangeDialog(null); }}>
                <AlertDialogContent className="bg-card border-border max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-black uppercase tracking-tighter text-foreground">
                            Limite de Cotas Alcançado
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-muted-foreground">
                            Nós usaremos R$ {(pendingChangeDialog?.emptySlots! * ticketPrice).toFixed(2)} das suas NFTs selecionadas para comprar as últimas {pendingChangeDialog?.emptySlots} cotas.
                            <br /><br />
                            Você receberá <strong>R$ {pendingChangeDialog?.changeValue.toFixed(2)}</strong> de troco nos seguintes NFTs:
                            <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                                {pendingChangeDialog?.changeNFTs.map((nft, idx) => (
                                    <div key={idx} className="flex justify-between items-center text-xs bg-secondary/20 p-2 rounded-lg">
                                        <span className="font-bold flex items-center gap-1">{nft.emoji} {nft.nome}</span>
                                        <span className="text-primary font-black">R$ {nft.preco.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-6">
                        <AlertDialogCancel className="font-bold uppercase tracking-widest text-xs h-12">
                            Mudar Seleção
                        </AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest text-xs h-12"
                            onClick={() => {
                                if (pendingChangeDialog) {
                                    executeParticipation(pendingChangeDialog.emptySlots, pendingChangeDialog.emptySlots * ticketPrice, pendingChangeDialog.changeNFTs);
                                }
                            }}
                        >
                            Confirmar Entrada
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Live View Overlay */}
            <AnimatePresence>
                {isLiveViewActive && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="fixed inset-0 z-[100] bg-[hsl(220,25%,5%)] flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <header className="flex-shrink-0 bg-black/40 backdrop-blur-md border-b border-white/10 z-10">
                            <div className="max-w-6xl mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2 md:gap-3">
                                    <motion.div
                                        className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_10px_red]"
                                        animate={{ opacity: [1, 0.3, 1] }}
                                        transition={{ duration: 1, repeat: Infinity }}
                                    />
                                    <span className="font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-xs md:text-sm text-white/90">AO VIVO</span>
                                </div>
                                <div className="text-center flex-1 min-w-0">
                                    <h2 className="font-black text-sm md:text-base leading-tight uppercase tracking-widest text-white truncate">{raffle.titulo}</h2>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => setIsLiveViewActive(false)} className="rounded-full text-white/70 hover:text-white hover:bg-white/10 flex-shrink-0">
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>
                        </header>

                        {/* Body */}
                        <main className="flex-1 overflow-y-auto custom-scrollbar">
                            <div className="max-w-6xl mx-auto px-3 md:px-4 py-4 md:py-8 space-y-6 md:space-y-8">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 items-start">
                                    {/* LEFT: Mempool */}
                                    <div>
                                        <div className="text-center mb-4 md:mb-6">
                                            <h3 className="font-black text-xl md:text-2xl text-white uppercase tracking-tighter">
                                                {isDrawing ? "Sorteio em Andamento" : "Visualização em Tempo Real"}
                                            </h3>
                                            <p className="text-white/40 text-[10px] md:text-xs mt-1 uppercase tracking-widest">
                                                {isDrawing ? "Os quadrados estão sendo sorteados..." : "Quadrados proporcionais ao número de tickets"}
                                            </p>
                                        </div>
                                        <MempoolLayoutSideBySide
                                            totalSlots={
                                                raffle.maxParticipantes > 0
                                                    ? raffle.maxParticipantes
                                                    : (raffle.premioValor > 0 && ticketPrice > 0
                                                        ? Math.ceil(raffle.premioValor / ticketPrice)
                                                        : Math.max(10, raffle.participantes * 1.5))
                                            }
                                            soldTickets={raffle.participantes}
                                            userTickets={userTickets}
                                            targetDate={raffle.dataFim}
                                            onExpire={() => setIsDrawing(true)}
                                            isDrawing={isDrawing}
                                            winner={raffle.winner}
                                            onDrawComplete={async () => {
                                                try {
                                                    const data = await api.getRaffle(raffle.id);
                                                    if (data) {
                                                        setRaffle((prev: any) => ({
                                                            ...prev, ...data,
                                                            participantes: parseInt(data.tickets_sold) || prev.participantes,
                                                            status: data.status,
                                                            winner: data.winner_name ? {
                                                                name: data.winner_name,
                                                                picture: data.winner_picture
                                                            } : data.winner,
                                                        }));
                                                    }
                                                } catch { /* silent */ }
                                                setIsDrawing(false);
                                            }}
                                        />
                                    </div>

                                    {/* RIGHT: Stats + Activity */}
                                    <div className="flex flex-col gap-4 md:gap-5">
                                        <div className="grid grid-cols-2 gap-3 md:gap-4">
                                            <motion.div
                                                className="bg-white/5 rounded-xl md:rounded-2xl p-4 md:p-5 border border-white/8 space-y-1"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.1 }}
                                            >
                                                <Ticket className="w-4 h-4 md:w-5 md:h-5 text-blue-400 mb-1 md:mb-2" />
                                                <p className="text-2xl md:text-3xl font-black text-white">{raffle.participantes}</p>
                                                <p className="text-[9px] md:text-[10px] font-bold text-white/40 uppercase tracking-widest">Cotas Vendidas</p>
                                            </motion.div>
                                            <motion.div
                                                className="bg-green-500/10 rounded-xl md:rounded-2xl p-4 md:p-5 border border-green-500/20 space-y-1"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.2 }}
                                            >
                                                <Target className="w-4 h-4 md:w-5 md:h-5 text-green-500 mb-1 md:mb-2" />
                                                <p className="text-2xl md:text-3xl font-black text-green-400">{currentChance.toFixed(1)}%</p>
                                                <p className="text-[9px] md:text-[10px] font-bold text-green-500/60 uppercase tracking-widest">Sua Chance</p>
                                            </motion.div>
                                            <motion.div
                                                className="bg-white/5 rounded-xl md:rounded-2xl p-4 md:p-5 border border-white/8 space-y-1"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.3 }}
                                            >
                                                <Ticket className="w-4 h-4 md:w-5 md:h-5 text-purple-400 mb-1 md:mb-2" />
                                                <p className="text-2xl md:text-3xl font-black text-white">{userTickets}</p>
                                                <p className="text-[9px] md:text-[10px] font-bold text-white/40 uppercase tracking-widest">Seus Tickets</p>
                                            </motion.div>
                                            <motion.div
                                                className="bg-white/5 rounded-xl md:rounded-2xl p-4 md:p-5 border border-white/8 space-y-1"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.4 }}
                                            >
                                                <Trophy className="w-4 h-4 md:w-5 md:h-5 text-yellow-400 mb-1 md:mb-2" />
                                                <p className="text-lg md:text-xl font-black text-white">R$ {raffle.premioValor.toLocaleString("pt-BR")}</p>
                                                <p className="text-[9px] md:text-[10px] font-bold text-white/40 uppercase tracking-widest">Prêmio</p>
                                            </motion.div>
                                        </div>

                                        <motion.div
                                            className="bg-white/5 rounded-xl md:rounded-2xl border border-white/8 overflow-hidden"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.5 }}
                                        >
                                            <div className="flex items-center justify-between px-4 md:px-5 py-3 md:py-4 border-b border-white/8">
                                                <div className="flex items-center gap-2">
                                                    <motion.div
                                                        className="w-2 h-2 rounded-full bg-green-400"
                                                        animate={{ opacity: [1, 0.3, 1] }}
                                                        transition={{ duration: 1.5, repeat: Infinity }}
                                                    />
                                                    <span className="font-black text-xs md:text-sm text-white uppercase tracking-widest">Atividade Recente</span>
                                                </div>
                                                <span className="text-[9px] md:text-[10px] font-bold text-white/30 uppercase tracking-widest">Tempo Real</span>
                                            </div>
                                            <ActivityFeed raffleId={raffle.id} autoRefresh={isLiveViewActive} />
                                        </motion.div>

                                        <Button
                                            variant="hero"
                                            className="h-12 md:h-14 text-sm md:text-base font-black gap-2 md:gap-3 rounded-xl md:rounded-2xl"
                                            onClick={() => {
                                                setIsLiveViewActive(false);
                                                setTimeout(() => document.getElementById("nft-selection")?.scrollIntoView({ behavior: "smooth" }), 200);
                                            }}
                                        >
                                            <ShoppingCart className="w-4 h-4 md:w-5 md:h-5" />
                                            Comprar Mais Tickets
                                        </Button>
                                    </div>
                                </div>
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

            <main className="container mx-auto px-4 py-6 md:py-8">
                {/* WINNER CARD */}
                {raffle.status === 'encerrado' && raffle.winner && (
                    <motion.div
                        className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/50 rounded-2xl p-4 md:p-6 flex flex-col md:flex-row items-center gap-4 md:gap-6 shadow-glow mb-8 md:mb-12"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                    >
                        <div className="relative">
                            <div className="absolute -inset-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur-lg opacity-50 animate-pulse"></div>
                            <img src={raffle.winner.picture} alt={raffle.winner.name} className="relative w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-white object-cover shadow-2xl" />
                            <div className="absolute -bottom-2 -right-2 bg-yellow-500 text-black p-1.5 md:p-2 rounded-full shadow-lg border-2 border-white">
                                <Trophy className="w-4 h-4 md:w-5 md:h-5" fill="black" />
                            </div>
                        </div>
                        <div className="text-center md:text-left space-y-1">
                            <p className="text-yellow-500 font-bold uppercase tracking-[0.2em] text-[10px] md:text-xs">Vencedor do Sorteio</p>
                            <h2 className="text-2xl md:text-3xl font-black text-foreground">{raffle.winner.name}</h2>
                        </div>
                    </motion.div>
                )}

                {/* Main Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10">
                    {/* Visual Area */}
                    <div className="lg:col-span-7 space-y-6 md:space-y-8">
                        {/* Prize Photo */}
                        <motion.div
                            className="bg-card rounded-2xl md:rounded-[2rem] border-2 border-border p-2 md:p-3 shadow-elegant group"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="flex gap-2 md:gap-3">
                                {raffle.image_urls && raffle.image_urls.length > 1 && (
                                    <div className="flex flex-col gap-1.5 md:gap-2 flex-shrink-0">
                                        {raffle.image_urls.map((url: string, idx: number) => (
                                            <button
                                                key={idx}
                                                onClick={() => setActiveImage(url)}
                                                className={`relative w-12 h-12 md:w-16 md:h-16 rounded-lg md:rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${activeImage === url
                                                    ? "border-primary scale-105 shadow-glow"
                                                    : "border-transparent opacity-50 hover:opacity-100 hover:border-border"
                                                    }`}
                                            >
                                                <img src={url} alt={`${raffle.titulo} ${idx + 1}`} className="w-full h-full object-cover" />
                                            </button>
                                        ))}
                                    </div>
                                )}

                                <div className="relative flex-1 overflow-hidden rounded-xl md:rounded-[1.3rem] min-h-[240px] md:min-h-[280px] max-h-[560px] flex items-center justify-center">
                                    <img
                                        src={activeImage}
                                        alt={raffle.titulo}
                                        className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                    <div className="absolute bottom-4 md:bottom-5 left-4 md:left-5 text-white translate-y-4 group-hover:translate-y-0 transition-transform pointer-events-none">
                                        <h3 className="text-lg md:text-xl font-black drop-shadow">{raffle.titulo}</h3>
                                        <p className="text-xs md:text-sm opacity-80">{raffle.premio}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Description */}
                        <motion.div
                            className="bg-card/50 rounded-2xl md:rounded-3xl p-5 md:p-8 border border-border space-y-3 md:space-y-4"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                        >
                            <div className="flex items-center gap-2">
                                <Info className="w-5 h-5 text-primary" />
                                <h3 className="text-lg md:text-xl font-black uppercase tracking-tight">Detalhes do Sorteio</h3>
                            </div>
                            <p className="text-muted-foreground leading-relaxed text-base md:text-lg italic">
                                "{raffle.descricao}"
                            </p>
                        </motion.div>
                    </div>

                    {/* Status & Participation */}
                    <div className="lg:col-span-5 space-y-5 md:space-y-8">
                        {/* Countdown */}
                        <motion.div
                            className="bg-card rounded-2xl md:rounded-3xl border border-border p-4 md:p-6 shadow-sm overflow-hidden relative"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.15 }}
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Clock className="w-10 h-10 md:w-12 md:h-12 text-primary" />
                            </div>
                            <CircularCountdown targetDate={raffle.dataFim} />
                        </motion.div>

                        {/* Live Mode Entry */}
                        <motion.div
                            className="bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl md:rounded-3xl border border-primary/30 p-5 md:p-8 flex items-center justify-between group cursor-pointer hover:shadow-glow hover:-translate-y-1 transition-all"
                            onClick={() => setIsLiveViewActive(true)}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <div className="flex items-center gap-3 md:gap-5">
                                <div className="p-3 md:p-4 bg-primary text-white rounded-xl md:rounded-2xl shadow-glow relative overflow-hidden">
                                    <Activity className="w-6 h-6 md:w-8 md:h-8 relative z-10" />
                                    <div className="absolute inset-0 bg-white/20 translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                                </div>
                                <div className="space-y-0.5 md:space-y-1">
                                    <h4 className="font-black text-lg md:text-xl leading-none">ACOMPANHAR AO VIVO</h4>
                                    <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-widest font-bold">Ver Mempool e Roleta</p>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-primary group-hover:translate-x-2 transition-transform flex-shrink-0" />
                        </motion.div>

                        {/* Prize Summary */}
                        <motion.div
                            className="bg-card rounded-2xl md:rounded-3xl border border-border p-5 md:p-8 space-y-4 md:space-y-6 shadow-sm"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.25 }}
                        >
                            <div className="space-y-1.5 md:space-y-2">
                                <span className="text-primary font-bold uppercase tracking-[0.3em] text-[10px] md:text-xs">A Grande Chance</span>
                                <h2 className="text-3xl md:text-4xl font-black text-foreground leading-tight">{raffle.premio}</h2>
                                <p className="text-xl md:text-2xl font-black text-gradient uppercase">VALOR: R$ {raffle.premioValor.toLocaleString("pt-BR")}</p>
                            </div>

                            <div className="h-px bg-border" />

                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Ticket className="w-4 h-4" />
                                        <span className="text-[10px] uppercase font-bold tracking-widest">Cotas Vendidas</span>
                                    </div>
                                    <p className="font-black text-2xl md:text-3xl text-foreground">{raffle.participantes}</p>
                                </div>
                                <div className="text-right space-y-1">
                                    <div className="flex items-center gap-2 text-muted-foreground justify-end">
                                        <Target className="w-4 h-4" />
                                        <span className="text-[10px] uppercase font-bold tracking-widest">Sua Chance</span>
                                    </div>
                                    <p className="font-black text-2xl md:text-3xl text-primary">{currentChance.toFixed(1)}%</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Participation Section */}
                <div id="nft-selection" className="mt-12 md:mt-20 space-y-6 md:space-y-10">
                    <div className="flex items-center gap-3 md:gap-4">
                        <div className="p-2.5 md:p-3 bg-primary/10 rounded-xl md:rounded-2xl border border-primary/20">
                            <Ticket className="h-6 w-6 md:h-7 md:w-7 text-primary" />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black text-foreground uppercase tracking-tighter">Escolha seus Ingressos</h2>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
                        {/* NFT Selection */}
                        <div className="lg:col-span-8 bg-card rounded-2xl md:rounded-[2rem] border border-border p-4 md:p-8 shadow-sm">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 max-h-[500px] overflow-y-auto pr-2 md:pr-4 custom-scrollbar">
                                {availableNFTs.length === 0 ? (
                                    <div className="col-span-full py-12 md:py-16 text-center text-muted-foreground border-2 border-dashed border-border rounded-2xl md:rounded-3xl bg-secondary/20">
                                        <p className="mb-4 font-bold text-base md:text-lg">Nenhum NFT disponível na carteira.</p>
                                        <Button onClick={() => navigate("/")}>Ir para a Loja</Button>
                                    </div>
                                ) : (
                                    availableNFTs.map(nft => {
                                        const qtySelected = selectedNFTs[nft.id] || 0;
                                        const isSelected = qtySelected > 0;
                                        return (
                                            <motion.div
                                                key={nft.id}
                                                className={`flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl md:rounded-2xl border-2 transition-all duration-300 cursor-pointer ${isSelected ? "border-primary bg-primary/5 ring-4 ring-primary/10" : "border-border hover:border-primary/40"}`}
                                                onClick={() => toggleSelection(nft.id, nft.quantidade)}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                <div className={`w-12 h-12 md:w-16 md:h-16 rounded-lg md:rounded-xl bg-gradient-to-br ${rarityColors[nft.raridade] || "from-gray-500 to-gray-600"} flex items-center justify-center text-2xl md:text-3xl shadow-lg relative overflow-hidden`}>
                                                    {nft.emoji}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-black text-foreground truncate uppercase text-xs md:text-sm tracking-tight">{nft.nome}</h4>
                                                    <div className="flex items-baseline gap-1.5 md:gap-2">
                                                        <span className="text-base md:text-lg font-black text-primary">R$ {nft.preco.toFixed(2)}</span>
                                                        <span className="text-[9px] md:text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Preço/Ticket</span>
                                                    </div>
                                                </div>
                                                {isSelected && (
                                                    <div className="flex items-center gap-1.5 md:gap-2 bg-background rounded-lg border border-border p-0.5 md:p-1" onClick={e => e.stopPropagation()}>
                                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleQuantityChange(nft.id, -1, nft.quantidade)} disabled={qtySelected <= 0}><Minus className="h-3 w-3" /></Button>
                                                        <span className="text-sm font-black w-4 text-center">{qtySelected}</span>
                                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleQuantityChange(nft.id, 1, nft.quantidade)} disabled={qtySelected >= nft.quantidade}><Plus className="h-3 w-3" /></Button>
                                                    </div>
                                                )}
                                            </motion.div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* Confirmation Panel */}
                        <div className="lg:col-span-4 bg-card rounded-2xl md:rounded-[2rem] border border-border p-5 md:p-8 shadow-large flex flex-col h-fit sticky top-24">
                            <h4 className="text-xl md:text-2xl font-black mb-5 md:mb-8 uppercase tracking-tighter">Resumo</h4>
                            <div className="space-y-4 md:space-y-6 flex-1">
                                <div className="flex justify-between items-center pb-3 md:pb-4 border-b border-white/10">
                                    <span className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">Bilhetes Selecionados</span>
                                    <span className="font-black text-xl md:text-2xl text-foreground">{ticketPrice > 0 ? (selectedValue / ticketPrice) : 0}</span>
                                </div>
                                <div className="flex justify-between items-center pb-3 md:pb-4 border-b border-white/10">
                                    <span className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">Total a Confirmar</span>
                                    <span className="font-black text-xl md:text-2xl text-primary">R$ {selectedValue.toFixed(2)}</span>
                                </div>
                                <div className="space-y-2 md:space-y-3 pt-3 md:pt-4">
                                    <div className="flex justify-between items-end">
                                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em]">Potencial de Ganho</span>
                                        <span className="text-2xl md:text-3xl font-black text-primary">{potentialChance.toFixed(2)}%</span>
                                    </div>
                                    <Progress value={potentialChance} className="h-3 md:h-4 rounded-full" />
                                </div>
                            </div>

                            <Button
                                className="w-full h-14 md:h-16 rounded-xl md:rounded-2xl mt-8 md:mt-12 font-black text-base md:text-lg uppercase tracking-[0.1em] shadow-glow"
                                variant="hero"
                                size="lg"
                                disabled={isProcessing || selectedCount === 0}
                                onClick={handleParticipate}
                            >
                                {isProcessing ? (
                                    <Loader2 className="w-6 h-6 md:w-7 md:h-7 animate-spin" />
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
