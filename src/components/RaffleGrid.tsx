import React from "react";
import RaffleCard from "./RaffleCard";
import { Raffle } from "@/types/raffle";
import { Trophy } from "lucide-react";

interface RaffleGridProps {
    raffles: Raffle[];
}

const RaffleGrid: React.FC<RaffleGridProps> = ({ raffles }) => {
    return (
        <section id="sorteios" className="container mx-auto px-4 py-12">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-primary/10 rounded-lg">
                    <Trophy className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                        Sorteios Ativos
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        {raffles.length} sorteios disponíveis
                    </p>
                </div>
            </div>
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-6">
                {raffles.map((raffle, index) => (
                    <div key={raffle.id} className="w-full inline-block break-inside-avoid mb-6">
                        <RaffleCard raffle={raffle} index={index} />
                    </div>
                ))}
            </div>
        </section>
    );
};

export default RaffleGrid;
