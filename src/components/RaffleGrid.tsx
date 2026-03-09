import { FC } from "react";
import RaffleCard from "./RaffleCard";
import { Raffle } from "@/types/raffle";
import { Trophy } from "lucide-react";
import { motion } from "framer-motion";

interface RaffleGridProps {
    raffles: Raffle[];
}

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

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
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-50px" }}
                    className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 items-stretch"
                >
                    {raffles.map((raffle, index) => (
                        <div key={raffle.id} className="w-full h-full flex flex-col">
                            <RaffleCard raffle={raffle} index={index} />
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default RaffleGrid;
