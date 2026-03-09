import { useState, FC, MouseEvent } from "react";
import { Clock, Users, Ticket, Info, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Raffle } from "@/types/raffle";
import { useWallet } from "@/contexts/WalletContext";
import { useUserRaffles } from "@/contexts/UserRafflesContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { CountdownBadge } from "@/components/CountdownBadge";
import { motion, Variants } from "framer-motion";

interface RaffleCardProps {
    raffle: Raffle;
    index: number;
    disableNavigation?: boolean;
}

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: {
        opacity: 1,
        y: 0,
        transition: { type: "spring", stiffness: 300, damping: 24 }
    }
};

const RaffleCard: FC<RaffleCardProps> = ({ raffle, index, disableNavigation = false }) => {
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

    const handleParticipate = (e: MouseEvent) => {
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

    const handleMoreInfo = (e: MouseEvent) => {
        e.stopPropagation();
        navigate(`/raffle/${raffle.id}`);
    };

    const progressPercent = (raffle.participantes / raffle.maxParticipantes) * 100;

    return (
        <div className="group relative flex flex-col h-full justify-start hover:z-50">
            <motion.article
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className={`relative bg-card rounded-xl border border-border/60 overflow-hidden transition-all duration-300 group-hover:shadow-glow group-hover:border-primary/50 flex flex-col h-full shrink-0 ${disableNavigation ? "" : "cursor-pointer"}`}
                onClick={handleCardClick}
            >
                {/* Subtle internal gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/40 pointer-events-none z-0" />

                {/* Prize Value Badge - Redesigned */}
                <div className="absolute top-3 right-3 z-20 bg-background/90 backdrop-blur-md text-primary border border-primary/30 px-2 py-1 rounded text-[10px] md:text-xs font-mono font-bold shadow-sm">
                    R$ {raffle.premioValor.toLocaleString("pt-BR")}
                </div>

                {/* Image Container */}
                <div className="relative w-full aspect-[4/5] md:aspect-square overflow-hidden bg-muted/20 p-0 m-0 z-10">
                    <img
                        src={raffle.imagem}
                        alt={raffle.titulo}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 filter group-hover:contrast-125 group-hover:saturate-110"
                        loading="lazy"
                        onError={(e) => {
                            e.currentTarget.src = "https://images.unsplash.com/photo-1635326444826-06c8f8d2e61d?w=800&q=80";
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent opacity-90 pointer-events-none" />

                    {/* Winner Overlay - Refined */}
                    {raffle.status === 'encerrado' && raffle.winner && (
                        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-4 z-30 transition-all">
                            <div className="relative mb-3">
                                <div className="absolute -inset-2 bg-primary/20 rounded-full blur-md animate-pulse"></div>
                                <img
                                    src={raffle.winner.picture}
                                    alt={raffle.winner.name}
                                    className="relative w-16 h-16 rounded-full border border-primary/50 object-cover"
                                />
                                <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground p-1 rounded border border-background">
                                    <Users className="w-3 h-3" />
                                </div>
                            </div>
                            <p className="text-primary font-mono text-[10px] uppercase tracking-widest mb-1">Status: Concluído</p>
                            <p className="text-foreground font-bold text-sm truncate w-full max-w-[150px]">{raffle.winner.name}</p>
                        </div>
                    )}
                </div>

                {/* Content Section */}
                <div className="relative p-4 md:p-5 flex flex-col flex-grow z-20">
                    <div className="flex items-center justify-between mb-3 text-[10px] font-mono uppercase tracking-wider">
                        <span className="text-primary/80 truncate pr-2 border-l-2 border-primary pl-2 bg-primary/5">
                            {raffle.categoria}
                        </span>

                        {!alreadyParticipating && (
                            <div className="flex items-center gap-1.5 text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded border border-border/50">
                                <Ticket className="w-3 h-3 text-primary/70" />
                                <span>{raffle.custoNFT} <span className="hidden sm:inline">req</span></span>
                            </div>
                        )}
                        {alreadyParticipating && (
                            <div className="flex items-center gap-1 text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20 font-bold">
                                <Shield className="w-3 h-3" />
                                <span>Ativo</span>
                            </div>
                        )}
                    </div>

                    <h3 className="font-extrabold text-foreground text-sm md:text-base leading-tight mb-4 line-clamp-2 min-h-[2.5rem] tracking-tight group-hover:text-primary transition-colors">
                        {raffle.titulo}
                    </h3>

                    <div className="mt-auto pt-2 border-t border-border/30">
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Preenchido</span>
                            <span className="text-xs font-mono font-bold text-foreground">
                                {progressPercent.toFixed(1)}%
                            </span>
                        </div>

                        <div className="w-full h-1 bg-secondary rounded-none overflow-hidden relative">
                            {alreadyParticipating && (
                                <div className="absolute inset-0 bg-primary/10 w-full z-0 pointer-events-none" />
                            )}
                            <div
                                className="h-full bg-primary relative overflow-hidden transition-all duration-1000 ease-out"
                                style={{ width: `${Math.max(progressPercent, 2)}%` }}
                            >
                                <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-r from-transparent to-white/30" />
                            </div>
                        </div>

                        <div className="flex justify-between items-center text-[10px] mt-2 text-muted-foreground font-mono">
                            <span>{raffle.participantes} aloc</span>
                            <span>{raffle.maxParticipantes} total</span>
                        </div>
                    </div>

                    {raffle.status !== 'encerrado' && (
                        <div className={`mt-4 overflow-hidden transition-all duration-300 md:max-h-20 md:opacity-100 ${isExpandedOnMobile ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}`}>
                            {alreadyParticipating ? (
                                <Button
                                    variant="outline"
                                    className="w-full text-xs font-mono tracking-wider h-10 border-primary/30 text-primary hover:bg-primary/10 hover:text-primary rounded"
                                    onClick={handleMoreInfo}
                                >
                                    Ver Alocação
                                </Button>
                            ) : (
                                <Button
                                    className="w-full text-xs font-bold tracking-wider h-10 bg-foreground text-background hover:bg-primary hover:text-primary-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shadow-sm rounded uppercase"
                                    disabled={totalNFTs < raffle.custoNFT}
                                    onClick={(e) => { e.stopPropagation(); handleParticipate(e); }}
                                >
                                    {totalNFTs < raffle.custoNFT ? 'NFTs Insuficientes' : 'Mintar Alocação'}
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </motion.article>

            {/* Mobile Expand Indicator */}
            {raffle.status !== 'encerrado' && (
                <div
                    className="md:hidden absolute -bottom-3 left-1/2 -translate-x-1/2 z-20 w-8 h-8 rounded-full bg-background border border-border/50 text-muted-foreground flex items-center justify-center shadow-sm cursor-pointer"
                    onClick={(e) => { e.stopPropagation(); setIsExpandedOnMobile(!isExpandedOnMobile); }}
                >
                    <svg
                        width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"
                        className={`transition-transform duration-300 ${isExpandedOnMobile ? 'rotate-180' : ''}`}
                    >
                        <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
            )}
        </div>
    );
};

export default RaffleCard;
