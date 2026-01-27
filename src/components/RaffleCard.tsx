import React from "react";
import { Clock, Users, Ticket, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Raffle } from "@/types/raffle";
import { useWallet } from "@/contexts/WalletContext";
import { useUserRaffles } from "@/contexts/UserRafflesContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface RaffleCardProps {
    raffle: Raffle;
    index: number;
}

const RaffleCard: React.FC<RaffleCardProps> = ({ raffle, index }) => {
    const { getTotalNFTs } = useWallet();
    const { addUserRaffle, isParticipating } = useUserRaffles();
    const navigate = useNavigate();
    const totalNFTs = getTotalNFTs();
    const alreadyParticipating = isParticipating(raffle.id);

    const handleParticipate = (e: React.MouseEvent) => {
        e.stopPropagation();

        if (alreadyParticipating) {
            toast.info("Você já está participando deste sorteio!");
            return;
        }

        if (totalNFTs < raffle.custoNFT) {
            toast.error(`Você precisa de ${raffle.custoNFT} NFT(s) para participar!`, {
                description: "Compre NFTs na seção abaixo.",
            });
            return;
        }

        addUserRaffle(raffle, 1, raffle.custoNFT);
        toast.success(`Você entrou no sorteio: ${raffle.titulo}!`, {
            description: `Custo: ${raffle.custoNFT} NFT(s)`,
        });
    };

    const handleMoreInfo = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigate(`/raffle/${raffle.id}`);
    };

    const progressPercent = (raffle.participantes / raffle.maxParticipantes) * 100;

    const daysLeft = () => {
        const end = new Date(raffle.dataFim);
        const now = new Date();
        const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return diff > 0 ? diff : 0;
    };

    return (
        <article
            className="group relative bg-card rounded-2xl border border-border overflow-hidden transition-all duration-300 hover:shadow-elevated hover:border-primary/30 hover:-translate-y-1 animate-fade-in cursor-pointer"
            style={{ animationDelay: `${index * 0.1}s` }}
            onClick={() => navigate(`/raffle/${raffle.id}`)}
        >
            {/* Status Badge */}
            <div className="absolute top-4 left-4 z-10 flex items-center gap-1 bg-primary text-primary-foreground px-2 py-1 rounded-lg text-xs font-bold">
                <Clock className="h-3 w-3" />
                {daysLeft()} dias
            </div>

            {/* Prize Value Badge */}
            <div className="absolute top-4 right-4 z-10 bg-background/80 backdrop-blur-sm text-foreground px-2 py-1 rounded-lg text-xs font-bold border border-border">
                R$ {raffle.premioValor.toLocaleString("pt-BR")}
            </div>

            {/* Image Container */}
            <div className="relative aspect-square overflow-hidden bg-secondary/30">
                <img
                    src={raffle.imagem}
                    alt={raffle.titulo}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                    onError={(e) => {
                        e.currentTarget.src = "https://images.unsplash.com/photo-1635326444826-06c8f8d2e61d?w=800&q=80";
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
                <h3 className="font-bold text-lg text-foreground leading-tight group-hover:text-primary transition-colors">
                    {raffle.titulo}
                </h3>

                <p className="text-sm text-muted-foreground line-clamp-2">
                    {raffle.descricao}
                </p>

                {/* Progress Bar */}
                <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {raffle.participantes} bilhetes vendidos
                        </span>
                        <span>{Math.round(progressPercent)}%</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </div>

                {/* NFT Cost */}
                <div className="flex items-center justify-between py-2 px-3 bg-secondary/50 rounded-lg">
                    <span className="text-xs text-muted-foreground">Custo para participar</span>
                    <span className="font-bold text-primary">{raffle.custoNFT} NFT</span>
                </div>

                {/* Buttons */}
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="default"
                        className="flex-1"
                        onClick={handleMoreInfo}
                    >
                        <Info className="h-4 w-4" />
                        Mais informações
                    </Button>
                    <Button
                        variant="hero"
                        size="default"
                        className="flex-1"
                        onClick={handleParticipate}
                        disabled={alreadyParticipating}
                    >
                        <Ticket className="h-4 w-4" />
                        {alreadyParticipating ? "Participando" : "Participar"}
                    </Button>
                </div>
            </div>
        </article>
    );
};

export default RaffleCard;
