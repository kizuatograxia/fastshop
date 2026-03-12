import { Raffle } from "@/types/raffle";
import RaffleCard from "@/components/RaffleCard";
import { Button } from "@/components/ui/button";
import { RefreshCw, Users, Trash2, Eye } from "lucide-react";

interface RaffleListProps {
    raffles: Raffle[];
    onEdit: (raffle: Raffle) => void;
    onViewDetails: (raffle: Raffle) => void;
    onViewParticipants: (raffle: Raffle) => void;
    onDelete: (id: string) => void;
}

export function RaffleList({ raffles, onEdit, onViewDetails, onViewParticipants, onDelete }: RaffleListProps) {
    if (raffles.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">Nenhum sorteio encontrado.</p>
            </div>
        );
    }

    return (
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6">
            {raffles.map((raffle, index) => (
                <div key={raffle.id} className="relative group cursor-pointer w-full inline-block break-inside-avoid mb-6" onClick={() => onViewDetails(raffle)}>
                    {/* Card with Hover Actions */}
                    <div className="absolute top-4 right-4 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Button size="icon" variant="outline" className="bg-background/80 backdrop-blur-md text-foreground border-white/10 hover:bg-primary/20 hover:text-primary hover:border-primary/50" onClick={(e) => { e.stopPropagation(); onEdit(raffle); }} title="Editar Sorteio">
                            <RefreshCw className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="outline" className="bg-background/80 backdrop-blur-md text-foreground border-white/10 hover:bg-primary/20 hover:text-primary hover:border-primary/50" onClick={(e) => { e.stopPropagation(); onViewParticipants(raffle); }} title="Ver Participantes">
                            <Users className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="destructive" className="bg-destructive/80 backdrop-blur-md shadow-[0_0_15px_rgba(255,0,0,0.3)] hover:bg-destructive" onClick={(e) => { e.stopPropagation(); onDelete(raffle.id); }} title="Deletar Sorteio">
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                    {/* View Details Overlay Hint */}
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 bg-background/40 backdrop-blur-[2px] transition-all duration-300 pointer-events-none">
                        <div className="glass-card px-5 py-2.5 rounded-full text-foreground border border-white/20 font-bold flex items-center gap-2 shadow-elevated transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                            <Eye className="w-4 h-4 text-primary" />
                            <span>Ver Detalhes</span>
                        </div>
                    </div>
                    <RaffleCard raffle={raffle} index={index} disableNavigation />
                </div>
            ))}
        </div>
    );
}
