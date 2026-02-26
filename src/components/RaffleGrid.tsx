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
                {/* Mobile: 2 Columns */}
                <div className="grid grid-cols-2 gap-3 sm:hidden">
                    {raffles.map((raffle, index) => (
                        <RaffleCard key={raffle.id} raffle={raffle} index={index} />
                    ))}
                </div>

                {/* Tablet: 2 Columns */}
                <div className="hidden sm:flex lg:hidden gap-6">
                    <div className="flex flex-col gap-6 w-1/2">
                        {raffles.filter((_, i) => i % 2 === 0).map((raffle, index) => (
                            <RaffleCard key={raffle.id} raffle={raffle} index={index * 2} />
                        ))}
                    </div>
                    <div className="flex flex-col gap-6 w-1/2">
                        {raffles.filter((_, i) => i % 2 === 1).map((raffle, index) => (
                            <RaffleCard key={raffle.id} raffle={raffle} index={index * 2 + 1} />
                        ))}
                    </div>
                </div>

                {/* Desktop: 3 Columns */}
                <div className="hidden lg:flex gap-6">
                    <div className="flex flex-col gap-6 w-1/3">
                        {raffles.filter((_, i) => i % 3 === 0).map((raffle, index) => (
                            <RaffleCard key={raffle.id} raffle={raffle} index={index * 3} />
                        ))}
                    </div>
                    <div className="flex flex-col gap-6 w-1/3">
                        {raffles.filter((_, i) => i % 3 === 1).map((raffle, index) => (
                            <RaffleCard key={raffle.id} raffle={raffle} index={index * 3 + 1} />
                        ))}
                    </div>
                    <div className="flex flex-col gap-6 w-1/3">
                        {raffles.filter((_, i) => i % 3 === 2).map((raffle, index) => (
                            <RaffleCard key={raffle.id} raffle={raffle} index={index * 3 + 2} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default RaffleGrid;
