import React, { useState } from "react";
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
    const [isExpandedOnMobile, setIsExpandedOnMobile] = useState(false);

    const handleCardClick = () => {
        if (disableNavigation) return;

        if (window.innerWidth < 768) {
            setIsExpandedOnMobile(!isExpandedOnMobile);
        } else {
            navigate(`/raffle/${raffle.id}`);
        }
    };

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
        <div className="flex flex-col h-full md:h-auto">
            <article
                className={`group relative bg-card rounded-2xl border border-border overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-primary/30 animate-fade-in flex flex-col h-full md:h-auto ${disableNavigation ? "" : "cursor-pointer"}`}
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={handleCardClick}
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
                <div className="relative w-full aspect-[4/5] md:aspect-auto overflow-hidden bg-background p-3 md:p-4">
                    <img
                        src={raffle.imagem}
                        alt={raffle.titulo}
                        className="w-full h-full md:h-auto object-cover rounded-xl transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                        onError={(e) => {
                            e.currentTarget.src = "https://images.unsplash.com/photo-1635326444826-06c8f8d2e61d?w=800&q=80";
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

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

                {/* Content Preview (Always visible) */}
                <div className="p-3 md:p-4 flex-1 flex flex-col justify-end">
                    <h3 className="font-bold text-sm md:text-lg text-foreground leading-tight group-hover:text-primary transition-colors line-clamp-2 md:mb-2">
                        {raffle.titulo}
                    </h3>

                    <p className="hidden md:block text-[11px] md:text-sm text-muted-foreground line-clamp-2 mb-4 flex-1 md:flex-initial">
                        {raffle.descricao}
                    </p>

                    <div className="hidden md:block space-y-3 mt-auto">
                        {/* Progress Bar (Desktop) */}
                        <div className="space-y-1">
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <Ticket className="h-3 w-3" />
                                    <span>{raffle.participantes} cotas vendidas</span>
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

                        {/* NFT Cost (Desktop) */}
                        <div className="flex items-center justify-between py-2 px-3 bg-secondary/50 rounded-lg">
                            <span className="text-xs text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis mr-2">
                                Custo para participar
                            </span>
                            <span className="font-bold text-sm text-primary whitespace-nowrap">{raffle.custoNFT} NFT</span>
                        </div>

                        {/* Buttons (Desktop) - Hidden until hover */}
                        {!disableNavigation && (
                            <div className="flex gap-2 transition-all duration-300 ease-out md:opacity-0 md:translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 relative z-20">
                                <Button
                                    variant="secondary"
                                    className="flex-1 h-10 text-sm px-2 bg-secondary/80 hover:bg-secondary border border-border/50 transition-all font-medium"
                                    onClick={handleMoreInfo}
                                >
                                    <Info className="h-4 w-4 mr-1.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                                    <span className="text-muted-foreground group-hover:text-foreground transition-colors">Detalhes</span>
                                </Button>
                                <Button
                                    variant="hero"
                                    className="flex-1 h-10 text-sm px-2"
                                    onClick={handleParticipate}
                                    disabled={alreadyParticipating}
                                    title={alreadyParticipating ? "Participando" : "Participar"}
                                >
                                    <Ticket className="h-4 w-4 mr-2" />
                                    <span>
                                        {alreadyParticipating ? "Participando" : "Participar"}
                                    </span>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </article>

            {/* Expanded Content (Mobile Only) - Renders outside the card body */}
            <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isExpandedOnMobile ? 'max-h-[500px] opacity-100 mt-2' : 'max-h-0 opacity-0 m-0'}`}>
                <div className="space-y-3 px-1">
                    {/* Progress Bar */}
                    <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <Ticket className="h-3 w-3" />
                                <span>{raffle.participantes}</span>
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

                    {/* Buttons */}
                    {!disableNavigation && (
                        <div className="flex gap-1.5 transition-all duration-300 ease-out opacity-100 translate-y-0 relative z-20">
                            <Button
                                variant="secondary"
                                className="flex-1 h-8 text-[10px] px-1 bg-secondary/80 hover:bg-secondary border border-border/50 transition-all font-medium"
                                onClick={(e) => { e.stopPropagation(); handleMoreInfo(e); }}
                            >
                                <Info className="h-3 w-3 mr-1 text-muted-foreground transition-colors" />
                                <span className="text-muted-foreground transition-colors">Detalhes</span>
                            </Button>
                            <Button
                                variant="hero"
                                className="w-10 h-8 p-0 shrink-0 flex items-center justify-center rounded-lg"
                                onClick={(e) => { e.stopPropagation(); handleParticipate(e); }}
                                disabled={alreadyParticipating}
                                title={alreadyParticipating ? "Participando" : "Participar"}
                            >
                                <Ticket className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RaffleCard;
