import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Users, Ticket, Trophy, Calendar, Target, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { raffles } from "@/data/raffles";
import { useWallet } from "@/contexts/WalletContext";
import { useUserRaffles } from "@/contexts/UserRafflesContext";
import { toast } from "sonner";

const RaffleDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { getTotalNFTs } = useWallet();
    const { addUserRaffle, isParticipating } = useUserRaffles();

    const raffle = raffles.find((r) => r.id === id);
    const totalNFTs = getTotalNFTs();
    const alreadyParticipating = raffle ? isParticipating(raffle.id) : false;

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

    const handleParticipate = () => {
        if (alreadyParticipating) {
            toast.info("Você já está participando deste sorteio!");
            return;
        }

        if (totalNFTs < raffle.custoNFT) {
            toast.error(`Você precisa de ${raffle.custoNFT} NFT(s) para participar!`, {
                description: "Compre NFTs na página inicial.",
            });
            return;
        }

        addUserRaffle(raffle, raffle.custoNFT);
        toast.success(`Você entrou no sorteio: ${raffle.titulo}!`, {
            description: `Custo: ${raffle.custoNFT} NFT(s)`,
        });
    };

    const progressPercent = (raffle.participantes / raffle.maxParticipantes) * 100;

    const daysLeft = () => {
        const end = new Date(raffle.dataFim);
        const now = new Date();
        const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return diff > 0 ? diff : 0;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        });
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
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
                    {/* Image Section */}
                    <div className="space-y-4">
                        <div className="relative aspect-square rounded-2xl overflow-hidden bg-secondary/30 border border-border">
                            <img
                                src={raffle.imagem}
                                alt={raffle.titulo}
                                className="w-full h-full object-cover"
                            />
                            {/* Status Badge */}
                            <div className="absolute top-4 left-4 flex items-center gap-1 bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-sm font-bold">
                                <Clock className="h-4 w-4" />
                                {daysLeft()} dias restantes
                            </div>
                        </div>

                        {/* Category Tag */}
                        <div className="flex items-center gap-2">
                            <span className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm font-medium">
                                {raffle.categoria}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${raffle.status === "ativo"
                                    ? "bg-green-500/20 text-green-500"
                                    : raffle.status === "encerrado"
                                        ? "bg-red-500/20 text-red-500"
                                        : "bg-yellow-500/20 text-yellow-500"
                                }`}>
                                {raffle.status === "ativo" ? "Ativo" : raffle.status === "encerrado" ? "Encerrado" : "Em breve"}
                            </span>
                        </div>
                    </div>

                    {/* Details Section */}
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                                {raffle.titulo}
                            </h1>
                            <p className="text-lg text-muted-foreground">
                                {raffle.descricao}
                            </p>
                        </div>

                        {/* Prize Info */}
                        <div className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl border border-primary/20">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-primary/20 rounded-lg">
                                    <Trophy className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Prêmio</p>
                                    <p className="text-xl font-bold text-foreground">{raffle.premio}</p>
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-primary">
                                R$ {raffle.premioValor.toLocaleString("pt-BR")}
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-card rounded-xl border border-border">
                                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                    <Users className="h-4 w-4" />
                                    <span className="text-sm">Participantes</span>
                                </div>
                                <p className="text-2xl font-bold text-foreground">
                                    {raffle.participantes} <span className="text-sm text-muted-foreground font-normal">/ {raffle.maxParticipantes}</span>
                                </p>
                            </div>

                            <div className="p-4 bg-card rounded-xl border border-border">
                                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                    <Ticket className="h-4 w-4" />
                                    <span className="text-sm">Custo</span>
                                </div>
                                <p className="text-2xl font-bold text-primary">
                                    {raffle.custoNFT} NFT
                                </p>
                            </div>

                            <div className="p-4 bg-card rounded-xl border border-border">
                                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                    <Calendar className="h-4 w-4" />
                                    <span className="text-sm">Data do Sorteio</span>
                                </div>
                                <p className="text-sm font-medium text-foreground">
                                    {formatDate(raffle.dataFim)}
                                </p>
                            </div>

                            <div className="p-4 bg-card rounded-xl border border-border">
                                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                    <Target className="h-4 w-4" />
                                    <span className="text-sm">Suas Chances</span>
                                </div>
                                <p className="text-2xl font-bold text-foreground">
                                    {alreadyParticipating
                                        ? `${((1 / (raffle.participantes + 1)) * 100).toFixed(2)}%`
                                        : "0%"
                                    }
                                </p>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Progresso do sorteio</span>
                                <span className="font-medium text-foreground">{Math.round(progressPercent)}%</span>
                            </div>
                            <div className="h-3 bg-secondary rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                        </div>

                        {/* Participate Button */}
                        <div className="space-y-3">
                            <Button
                                variant="hero"
                                size="lg"
                                className="w-full text-lg py-6"
                                onClick={handleParticipate}
                                disabled={raffle.status !== "ativo" || alreadyParticipating}
                            >
                                <Ticket className="h-5 w-5" />
                                {alreadyParticipating
                                    ? "Você já está participando"
                                    : `Participar por ${raffle.custoNFT} NFT`
                                }
                            </Button>

                            {alreadyParticipating && (
                                <p className="text-center text-sm text-green-500 font-medium">
                                    ✓ Você está participando deste sorteio
                                </p>
                            )}

                            <p className="text-center text-xs text-muted-foreground">
                                Você possui {totalNFTs} NFT(s) disponíveis
                            </p>
                        </div>

                        {/* Additional Info */}
                        <div className="p-4 bg-secondary/30 rounded-xl border border-border">
                            <div className="flex items-center gap-2 mb-3">
                                <Info className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium text-foreground">Informações importantes</span>
                            </div>
                            <ul className="text-sm text-muted-foreground space-y-2">
                                <li>• O sorteio será realizado automaticamente na data indicada</li>
                                <li>• Os NFTs utilizados serão descontados da sua carteira</li>
                                <li>• O vencedor será notificado por e-mail e na plataforma</li>
                                <li>• Quanto mais NFTs você usar, maiores suas chances</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default RaffleDetails;
