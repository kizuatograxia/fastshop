import React, { useState, useMemo, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Clock, Users, Ticket, Trophy, Target, Info, CheckCircle2, Minus, Plus, Loader2, Share2, ShoppingCart, Activity, Hash, ChevronRight } from "lucide-react";
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

// ... rarityColors ...
const rarityColors: Record<string, string> = {
    comum: "from-gray-400 to-gray-500",
    raro: "from-blue-400 to-cyan-500",
    epico: "from-purple-400 to-pink-500",
    lendario: "from-yellow-400 to-orange-500",
};



// Activity Feed — shows real participants from API
const ActivityFeed: React.FC<{ raffleId: string }> = ({ raffleId }) => {
    const [participants, setParticipants] = useState<any[]>([]);
    const [loadingParticipants, setLoadingParticipants] = useState(true);

    useEffect(() => {
        api.getRaffleParticipants(raffleId)
            .then((data) => {
                // API returns array of { user_name, ticket_count, joined_at } or similar
                setParticipants(Array.isArray(data) ? data.slice(0, 10) : []);
            })
            .catch(() => setParticipants([]))
            .finally(() => setLoadingParticipants(false));
    }, [raffleId]);

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
        <div className="p-4 space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
            {participants.map((p, i) => {
                const name = p.user_name || p.name || p.username || `Participante ${i + 1}`;
                const tickets = p.ticket_count || p.tickets || 1;
                const joinedAt = p.joined_at || p.created_at || p.date;
                return (
                    <div key={i} className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-400/50 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <span className="text-xs font-bold text-white/70 truncate block">{name}</span>
                            <span className="text-[10px] text-white/30">{tickets} ticket{tickets !== 1 ? 's' : ''}</span>
                        </div>
                        {joinedAt && (
                            <span className="text-[10px] text-white/30 flex-shrink-0">{formatTime(joinedAt)}</span>
                        )}
                    </div>
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
    // Use the higher of two independent methods to guard against either returning 0 incorrectly
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

    // Real-time refresh: poll raffle data
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
                // Detect when admin draws → force open live view and trigger roulette animation
                if (data?.status === 'encerrado' && !isDrawing) {
                    setIsLiveViewActive(true);
                    setIsDrawing(true);
                }
            } catch { /* silent */ }
        }, isLiveViewActive ? 3_000 : 5_000); // Poll fast for immediate reaction (3s in live view, 5s normal)

        return () => clearInterval(poll);
    }, [id, isDrawing, isLiveViewActive, raffle?.status]);



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
    const ticketPrice = raffle.custoNFT;
    const ticketsToReceive = Math.floor(selectedValue / ticketPrice);

    // Calculate emptySlots robustly
    let emptySlots = Infinity;
    if (raffle && raffle.maxParticipantes > 0) {
        // Strict limit set by admin
        emptySlots = Math.max(0, raffle.maxParticipantes - raffle.participantes);
    } else if (raffle && raffle.premioValor > 0 && ticketPrice > 0) {
        // Limit derived from prize goal
        const derivedMax = Math.ceil(raffle.premioValor / ticketPrice);
        emptySlots = Math.max(0, derivedMax - raffle.participantes);
    }
    // Note: if neither is set, emptySlots remains Infinity (no limit)

    const currentChance = calculateChance(userTickets);
    const potentialChance = calculateChance(userTickets + ticketsToReceive);

    const executeParticipation = async (finalTicketsToReceive: number, finalSelectedValue: number, changeNFTsToIssue: NFT[] = []) => {
        setIsProcessing(true);
        try {
            await addUserRaffle(raffle, finalTicketsToReceive, finalSelectedValue, selectedNFTs);
            setRaffle((prev: any) => ({ ...prev, participantes: prev.participantes + finalTicketsToReceive }));

            // Issue change NFTs if needed
            if (changeNFTsToIssue.length > 0) {
                // Assuming `api.addToWallet` takes (userId, nftObject)
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

            // Perform change logic
            setIsProcessing(true);
            try {
                const allowedValue = emptySlots * ticketPrice;
                let changeValue = selectedValue - allowedValue;

                // Fetch catalog to find NFTs for change
                const catalog = await api.getNFTCatalog();
                // Sort descending by price
                const sortedCatalog = catalog.sort((a: any, b: any) => b.preco - a.preco);

                const changeNFTs: NFT[] = [];
                let remainingChange = changeValue;

                // Greedy algorithm to pick NFTs for change
                for (let i = 0; i < sortedCatalog.length; i++) {
                    const nft = sortedCatalog[i];
                    while (remainingChange >= nft.preco && nft.preco > 0) {
                        changeNFTs.push(nft);
                        remainingChange -= nft.preco;
                    }
                }

                // Truncate tiny precise math errors
                if (remainingChange > 0.01) {
                    // Could not fully refund perfectly with available catalog denominations
                    // Default to returning the logic but warn or continue with what we can
                    console.warn(`Could not perfectly refund. Remaining non-refundable change: ${remainingChange}`);
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
                toast.error("Erro interno ao simular troco. Tente novamente ou feche bilhetes exatos.");
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
                                {/* ---- LIVE VIEW MODE (Roulette plays inline) ---- */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                                    {/* LEFT: MempoolLayoutSideBySide (circle + timer stacked) */}
                                    <div>
                                        <div className="text-center mb-6">
                                            <h3 className="font-black text-2xl text-white uppercase tracking-tighter">
                                                {isDrawing ? "Sorteio em Andamento" : "Visualização em Tempo Real"}
                                            </h3>
                                            <p className="text-white/40 text-xs mt-1 uppercase tracking-widest">
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
                                                // Reload raffle to get real winner from backend
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
                                                // setIsLiveViewActive(false); // Do not close live view anymore, let them see the winner!
                                            }}
                                        />
                                    </div>

                                    {/* RIGHT: Stats + Activity */}
                                    <div className="flex flex-col gap-5">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-white/5 rounded-2xl p-5 border border-white/8 space-y-1">
                                                <Ticket className="w-5 h-5 text-blue-400 mb-2" />
                                                <p className="text-3xl font-black text-white">{raffle.participantes}</p>
                                                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Cotas Vendidas</p>
                                            </div>
                                            <div className="bg-green-500/10 rounded-2xl p-5 border border-green-500/20 space-y-1">
                                                <Target className="w-5 h-5 text-green-500 mb-2" />
                                                <p className="text-3xl font-black text-green-400">{currentChance.toFixed(1)}%</p>
                                                <p className="text-[10px] font-bold text-green-500/60 uppercase tracking-widest">Sua Chance</p>
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
                        <div className="bg-card rounded-[2rem] border-2 border-border p-3 shadow-elegant group">
                            <div className="flex gap-3">
                                {/* Thumbnail column — LEFT side, only shown when multiple images */}
                                {raffle.image_urls && raffle.image_urls.length > 1 && (
                                    <div className="flex flex-col gap-2 flex-shrink-0">
                                        {raffle.image_urls.map((url: string, idx: number) => (
                                            <button
                                                key={idx}
                                                onClick={() => setActiveImage(url)}
                                                className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${activeImage === url
                                                    ? "border-primary scale-105 shadow-glow"
                                                    : "border-transparent opacity-50 hover:opacity-100 hover:border-border"
                                                    }`}
                                            >
                                                <img src={url} alt={`${raffle.titulo} ${idx + 1}`} className="w-full h-full object-cover" />
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Main image — adapts to natural aspect ratio, no cropping */}
                                <div className="relative flex-1 overflow-hidden rounded-[1.3rem] min-h-[280px] max-h-[560px] flex items-center justify-center">
                                    <img
                                        src={activeImage}
                                        alt={raffle.titulo}
                                        className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                    <div className="absolute bottom-5 left-5 text-white translate-y-4 group-hover:translate-y-0 transition-transform pointer-events-none">
                                        <h3 className="text-xl font-black drop-shadow">{raffle.titulo}</h3>
                                        <p className="text-sm opacity-80">{raffle.premio}</p>
                                    </div>
                                </div>
                            </div>
                        </div>


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
                                        <Ticket className="w-4 h-4" />
                                        <span className="text-xs uppercase font-bold tracking-widest">Cotas Vendidas</span>
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
