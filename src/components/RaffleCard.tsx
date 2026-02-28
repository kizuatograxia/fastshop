import React from "react";
import { Clock, Users, Ticket, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Raffle } from "@/types/raffle";
import { useWallet } from "@/contexts/WalletContext";
import { useUserRaffles } from "@/contexts/UserRafflesContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { CountdownBadge } from "@/components/CountdownBadge";

interface RaffleCardProps {
    raffle: Raffle;
    index: number;
    disableNavigation?: boolean;
}

const RaffleCard: React.FC<RaffleCardProps> = ({ raffle, index, disableNavigation = false }) => {
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

        addUserRaffle(raffle, 1, raffle.custoNFT, {});
        toast.success(`Você entrou no sorteio: ${raffle.titulo}!`, {
            description: `Custo: ${raffle.custoNFT} NFT(s)`,
        });
    };

    const handleMoreInfo = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigate(`/raffle/${raffle.id}`);
    };

    const progressPercent = (raffle.participantes / raffle.maxParticipantes) * 100;

    return (
        <article
            className={`group relative bg-card rounded-2xl border border-border overflow-hidden transition-all duration-300 hover:shadow-elevated hover:border-primary/30 hover:-translate-y-1 animate-fade-in flex flex-col h-full ${disableNavigation ? "" : "cursor-pointer"}`}
            style={{ animationDelay: `${index * 0.1}s` }}
            onClick={() => !disableNavigation && navigate(`/raffle/${raffle.id}`)}
        >
            {/* Status Badge */}
            <div className="absolute top-2 left-2 md:top-4 md:left-4 z-10 scale-[0.85] md:scale-100 origin-top-left">
                <CountdownBadge targetDate={raffle.dataFim} />
            </div>

            {/* Prize Value Badge */}
            <div className="absolute top-2 right-2 md:top-4 md:right-4 z-10 bg-background/80 backdrop-blur-sm text-foreground px-1.5 py-0.5 md:px-2 md:py-1 rounded-md md:rounded-lg text-[10px] md:text-xs font-bold border border-border">
                R$ {raffle.premioValor.toLocaleString("pt-BR")}
            </div>

            {/* Image Container */}
            <div className="relative w-full aspect-video overflow-hidden bg-secondary/30">
                <img
                    src={raffle.imagem}
                    alt={raffle.titulo}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => {
                        e.currentTarget.src = "https://images.unsplash.com/photo-1635326444826-06c8f8d2e61d?w=800&q=80";
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Winner Overlay */}
                {raffle.status === 'encerrado' && raffle.winner && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center text-center p-4 animate-in fade-in zoom-in duration-300">
                        <div className="relative mb-2">
                            <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur opacity-75 animate-pulse"></div>
                            <img
                                src={raffle.winner.picture}
                                alt={raffle.winner.name}
                                className="relative w-16 h-16 rounded-full border-2 border-white object-cover shadow-lg"
                            />
                            <div className="absolute -bottom-1 -right-1 bg-yellow-500 text-black p-1 rounded-full border border-white">
                                <Users className="w-3 h-3" />
                            </div>
                        </div>
                        <p className="text-yellow-400 font-bold text-xs uppercase tracking-wider mb-0.5">Vencedor</p>
                        <p className="text-white font-bold text-lg leading-tight">{raffle.winner.name}</p>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-3 md:p-4 flex-1 flex flex-col">
                <h3 className="font-bold text-sm md:text-lg text-foreground leading-tight group-hover:text-primary transition-colors line-clamp-2 mb-2">
                    {raffle.titulo}
                </h3>

                <p className="text-[11px] md:text-sm text-muted-foreground line-clamp-2 md:line-clamp-3 mb-4 flex-1">
                    {raffle.descricao}
                </p>

                <div className="space-y-3 mt-auto">
                    {/* Progress Bar */}
                    <div className="space-y-1">
                        <div className="flex justify-between text-[10px] md:text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                <span>{raffle.participantes} <span className="hidden sm:inline">bilhetes vendidos</span></span>
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
                    <div className="flex items-center justify-between py-1.5 px-2 md:py-2 md:px-3 bg-secondary/50 rounded-md md:rounded-lg">
                        <span className="text-[10px] md:text-xs text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis mr-2">
                            Custo <span className="hidden sm:inline">para participar</span>
                        </span>
                        <span className="font-bold text-[11px] md:text-sm text-primary whitespace-nowrap">{raffle.custoNFT} NFT</span>
                    </div>

                    {/* Buttons - Hidden if disabled */}
                    {!disableNavigation && (
                        <div className="flex gap-1.5 md:gap-2">
                            <Button
                                variant="outline"
                                className="flex-1 hidden sm:flex h-8 md:h-10 text-xs md:text-sm px-2"
                                onClick={handleMoreInfo}
                            >
                                <Info className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                                Mais Info
                            </Button>
                            <Button
                                variant="hero"
                                className="flex-1 h-8 md:h-10 text-xs md:text-sm px-2"
                                onClick={handleParticipate}
                                disabled={alreadyParticipating}
                            >
                                <Ticket className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                                {alreadyParticipating ? "Participando" : "Participar"}
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </article>
    );
};

export default RaffleCard;
