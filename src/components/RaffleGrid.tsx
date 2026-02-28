import React from "react";
import RaffleCard from "./RaffleCard";
import { Raffle } from "@/types/raffle";
import { Trophy } from "lucide-react";

interface RaffleGridProps {
    raffles: Raffle[];
}

const RaffleGrid: React.FC<RaffleGridProps> = ({ raffles }) => {
    return (
        <section id="sorteios" className="py-12">
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
            <div className="w-full">
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                    {raffles.map((raffle, index) => (
                        <RaffleCard key={raffle.id} raffle={raffle} index={index} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default RaffleGrid;
