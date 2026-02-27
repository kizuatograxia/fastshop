import React, { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Users, Ticket, Trophy, Calendar, Target, Info, CheckCircle2, Minus, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { raffles } from "@/data/raffles";
import { useWallet } from "@/contexts/WalletContext";
import { useUserRaffles } from "@/contexts/UserRafflesContext";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { OwnedNFT } from "@/types/raffle";
import { Progress } from "@/components/ui/progress";
import { CountdownBadge } from "@/components/CountdownBadge";

const rarityColors: Record<string, string> = {
    comum: "from-gray-400 to-gray-500",
    raro: "from-blue-400 to-cyan-500",
    epico: "from-purple-400 to-pink-500",
    lendario: "from-yellow-400 to-orange-500",
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
    const [activeImage, setActiveImage] = useState<string>("");

    useEffect(() => {
        if (id) {
            api.getRaffle(id)
                .then(data => {
                    // Map backend data to frontend model
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
                        image_urls: data.image_urls || [],
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

    const targetRevenue = (raffle.premioValor || 5000) * 1.5;
    const currentRevenue = (raffle.participantes * ticketPrice);
    const revenueProgress = Math.min((currentRevenue / targetRevenue) * 100, 100);

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

            setRaffle((prev: any) => ({
                ...prev,
                participantes: prev.participantes + ticketsToReceive
            }));

            // NFTs are now removed by the backend transaction
            // We should refresh the wallet to reflect this change
            await refreshWallet();
            setSelectedNFTs({});

            try {
                const data = await api.getRaffle(raffle.id);
                if (data && data.tickets_sold) {
                    setRaffle((prev: any) => ({
                        ...prev,
                        participantes: parseInt(data.tickets_sold) || 0
                    }));
                }
            } catch (error) {
                console.error("Failed to refresh raffle stats", error);
            }

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
            <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
                <div className="container mx-auto px-4 py-4">
                    <Button
                        variant="ghost"
                        onClick={() => navigate("/")}
                        className="gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Voltar
                    </Button>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* LEFT COLUMN: Raffle Info */}
                    <div className="space-y-6">

                        {/* WINNER CARD */}
                        {raffle.status === 'encerrado' && raffle.winner && (
                            <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/50 rounded-2xl p-6 flex items-center gap-6 animate-fade-in shadow-[0_0_30px_rgba(234,179,8,0.2)]">
                                <div className="relative">
                                    <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur opacity-75 animate-pulse"></div>
                                    <img
                                        src={raffle.winner.picture}
                                        alt={raffle.winner.name}
                                        className="relative w-20 h-20 rounded-full border-2 border-white object-cover shadow-xl"
                                    />
                                    <div className="absolute -bottom-2 -right-2 bg-yellow-500 text-black p-1.5 rounded-full shadow-lg border border-white">
                                        <Trophy className="w-4 h-4" fill="black" />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-yellow-500 font-bold uppercase tracking-wider text-xs mb-1">Grande Vencedor</p>
                                    <h2 className="text-2xl font-bold text-white mb-1">{raffle.winner.name}</h2>
                                    <p className="text-sm text-yellow-500/80">Parabéns! Você ganhou este prêmio.</p>
                                </div>
                            </div>
                        )}

                        {/* Image Gallery */}
                        <div className="space-y-4">
                            <div className="relative aspect-video rounded-2xl overflow-hidden bg-secondary/30 border border-border group">
                                <img
                                    src={activeImage || raffle.imagem}
                                    alt={raffle.titulo}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    onError={(e) => {
                                        e.currentTarget.src = "https://images.unsplash.com/photo-1635326444826-06c8f8d2e61d?w=800&q=80";
                                    }}
                                />
                                <div className="absolute top-4 left-4">
                                    <CountdownBadge targetDate={raffle.dataFim} className="text-sm px-3 py-1.5" />
                                </div>
                            </div>

                            {/* Thumbnails row if multiple images exist */}
                            {raffle.image_urls && raffle.image_urls.length > 1 && (
                                <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                                    {raffle.image_urls.map((url: string, idx: number) => (
                                        <button
                                            key={idx}
                                            onClick={() => setActiveImage(url)}
                                            className={`relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${activeImage === url
                                                    ? 'border-primary ring-2 ring-primary/50 scale-105 shadow-lg shadow-primary/20'
                                                    : 'border-transparent opacity-60 hover:opacity-100 hover:scale-105'
                                                }`}
                                        >
                                            <img
                                                src={url}
                                                alt={`Thumbnail ${idx}`}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.currentTarget.src = "https://images.unsplash.com/photo-1635326444826-06c8f8d2e61d?w=800&q=80";
                                                }}
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}

                            <div className="flex flex-wrap items-center gap-2">
                                <span className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm font-medium">
                                    {raffle.categoria}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${raffle.status === "ativo" ? "bg-green-500/20 text-green-500" :
                                    raffle.status === "encerrado" ? "bg-red-500/20 text-red-500" : "bg-yellow-500/20 text-yellow-500"
                                    }`}>
                                    {raffle.status === "ativo" ? "Ativo" : raffle.status === "encerrado" ? "Encerrado" : "Em breve"}
                                </span>
                            </div>
                        </div>

                        {/* Title & Desc */}
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                                {raffle.titulo}
                            </h1>
                            <p className="text-lg text-muted-foreground whitespace-pre-wrap">
                                {raffle.descricao}
                            </p>
                        </div>

                        {/* Prize Card */}
                        <div className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl border border-primary/20 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Trophy className="h-32 w-32" />
                            </div>
                            <div className="relative z-10">
                                <p className="text-sm font-medium text-primary mb-1">Grande Prêmio</p>
                                <h2 className="text-2xl font-bold text-foreground mb-2">{raffle.premio}</h2>
                                <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                                    R$ {raffle.premioValor.toLocaleString("pt-BR")}
                                </p>
                            </div>
                        </div>

                        {/* Raffle Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Row 1: Progress (Full Width) */}
                            <div className="col-span-1 md:col-span-2 p-4 bg-card rounded-xl border border-border space-y-3">
                                <div className="flex justify-between items-center text-sm font-medium">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Target className="h-4 w-4" />
                                        <span>Progresso</span>
                                    </div>
                                    <span className="text-primary">{revenueProgress.toFixed(1)}%</span>
                                </div>
                                <Progress value={revenueProgress} className="h-3" />
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <Users className="w-3 h-3" />
                                        {raffle.participantes} bilhetes (R$ {currentRevenue.toLocaleString()})
                                    </span>
                                    <span>Meta: R$ {targetRevenue.toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Row 2: Timer (Half) - Replaces Tickets Sold */}
                            <div className="p-4 bg-card rounded-xl border border-border">
                                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                    <Clock className="h-4 w-4" />
                                    <span className="text-sm">Encerra em</span>
                                </div>
                                <div className="text-2xl font-bold text-foreground">
                                    <CountdownBadge
                                        targetDate={raffle.dataFim}
                                        className="text-xl bg-transparent text-foreground p-0 font-bold"
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {new Date(raffle.dataFim).toLocaleDateString('pt-BR')}
                                </p>
                            </div>

                            {/* Row 2: Chance (Half) */}
                            <div className="p-4 bg-card rounded-xl border border-border">
                                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                    <Target className="h-4 w-4" />
                                    <span className="text-sm">Sua Chance</span>
                                </div>
                                <p className="text-2xl font-bold text-primary">
                                    {currentChance.toFixed(4)}%
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Contribuição: R$ {userCurrentValue.toFixed(2)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <Ticket className="h-5 w-5 text-primary" />
                                Escolha seus Ingressos (NFTs)
                            </h3>

                            <p className="text-sm text-muted-foreground mb-6">
                                Selecione quais NFTs deseja usar para entrar no sorteio. Quanto maior o valor dos NFTs, maior sua chance de ganhar!
                            </p>

                            {/* NFT List */}
                            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {availableNFTs.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground bg-secondary/30 rounded-xl border border-dashed border-border">
                                        <p>Você não possui NFTs disponíveis.</p>
                                        <Button variant="link" onClick={() => navigate("/")}>
                                            Comprar NFTs
                                        </Button>
                                    </div>
                                ) : (
                                    availableNFTs.map(nft => {
                                        const isSelected = (selectedNFTs[nft.id] || 0) > 0;
                                        const qtySelected = selectedNFTs[nft.id] || 0;

                                        return (
                                            <div
                                                key={nft.id}
                                                className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 ${isSelected
                                                    ? "bg-primary/10 border-primary shadow-[0_0_0_1px_rgba(var(--primary),1)]"
                                                    : "bg-background border-border hover:border-primary/50"
                                                    }`}
                                                onClick={() => toggleSelection(nft.id, nft.quantidade)}
                                            >
                                                {/* Checkbox-ish indicator */}
                                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${isSelected ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground"
                                                    }`}>
                                                    {isSelected && <CheckCircle2 className="h-3.5 w-3.5" />}
                                                </div>

                                                {/* Avatar */}
                                                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${rarityColors[nft.raridade]} flex items-center justify-center text-2xl shadow-sm`}>
                                                    {nft.emoji}
                                                </div>

                                                {/* Info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start">
                                                        <h4 className="font-bold text-sm truncate">{nft.nome}</h4>
                                                        <span className="text-sm font-bold text-primary">R$ {nft.preco.toFixed(2)}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center mt-1">
                                                        <span className="text-xs text-muted-foreground capitalize">{nft.raridade}</span>
                                                        <span className="text-xs text-muted-foreground">Disp: {nft.quantidade}</span>
                                                    </div>
                                                </div>

                                                {/* Quantity Controls (Only show if selected) */}
                                                {isSelected && (
                                                    <div className="flex items-center gap-2 bg-background rounded-lg border border-border p-1 shadow-sm" onClick={e => e.stopPropagation()}>
                                                        <button
                                                            className="p-1 hover:bg-secondary rounded-md transition-colors disabled:opacity-50"
                                                            onClick={() => handleQuantityChange(nft.id, -1, nft.quantidade)}
                                                            disabled={qtySelected <= 0}
                                                        >
                                                            <Minus className="h-3 w-3" />
                                                        </button>
                                                        <span className="text-xs font-bold w-4 text-center">{qtySelected}</span>
                                                        <button
                                                            className="p-1 hover:bg-secondary rounded-md transition-colors disabled:opacity-50"
                                                            onClick={() => handleQuantityChange(nft.id, 1, nft.quantidade)}
                                                            disabled={qtySelected >= nft.quantidade}
                                                        >
                                                            <Plus className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* Summary Sticky Footer (Mobile) or Panel (Desktop) */}
                        <div className="bg-card rounded-2xl border border-border p-6 shadow-lg space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">NFTs Selecionados</span>
                                    <span className="font-bold">{selectedCount}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Valor Total Contribuição</span>
                                    <span className="font-bold text-primary">R$ {selectedValue.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm border-t border-dashed pt-2">
                                    <span className="text-muted-foreground">Bilhetes a Receber</span>
                                    <span className="font-bold text-green-500">{ticketsToReceive}</span>
                                </div>
                                <div className="h-px bg-border my-2" />
                                <div className="flex justify-between items-center">
                                    <span className="font-bold">Nova Chance Estimada</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-muted-foreground text-sm line-through decoration-red-500">
                                            {currentChance.toFixed(2)}%
                                        </span>
                                        <ArrowLeft className="h-4 w-4 rotate-180 text-muted-foreground" />
                                        <span className="text-xl font-bold text-green-500">
                                            {potentialChance.toFixed(2)}%
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <Button
                                variant="hero"
                                size="lg"
                                className="w-full text-lg py-6 shadow-xl shadow-primary/20"
                                onClick={handleParticipate}
                                disabled={selectedCount === 0 || raffle.status !== "ativo" || isProcessing}
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                        Processando...
                                    </>
                                ) : (
                                    <>
                                        <Ticket className="h-5 w-5 mr-2" />
                                        Confirmar Entrada (R$ {selectedValue.toFixed(2)})
                                    </>
                                )}
                            </Button>

                            <p className="text-xs text-center text-muted-foreground">
                                Ao confirmar, os NFTs selecionados serão convertidos em bilhetes proporcionalmente ao seu valor.
                                (1 Bilhete = R$ {ticketPrice})
                            </p>
                        </div>
                    </div>


                </div>
            </main>
        </div>
    );
};

export default RaffleDetails;
