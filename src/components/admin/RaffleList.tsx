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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {raffles.map((raffle, index) => (
                <div key={raffle.id} className="relative group cursor-pointer" onClick={() => onViewDetails(raffle)}>
                    {/* Card with Hover Actions */}
                    <div className="absolute top-4 right-4 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Button size="icon" variant="secondary" className="bg-white/90 text-black hover:bg-white" onClick={(e) => { e.stopPropagation(); onEdit(raffle); }} title="Editar Sorteio">
                            <RefreshCw className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="secondary" className="bg-white/90 text-black hover:bg-white" onClick={(e) => { e.stopPropagation(); onViewParticipants(raffle); }} title="Ver Participantes">
                            <Users className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="destructive" onClick={(e) => { e.stopPropagation(); onDelete(raffle.id); }} title="Deletar Sorteio">
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                    {/* View Details Overlay Hint */}
                    <div className="absolute inset-0 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                        <div className="bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full text-white font-bold flex items-center gap-2">
                            <Eye className="w-4 h-4" />
                            Ver Detalhes
                        </div>
                    </div>
                    <RaffleCard raffle={raffle} index={index} />
                </div>
            ))}
        </div>
    );
}
