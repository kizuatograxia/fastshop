import { useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Sparkles, MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WinnerCard } from "@/components/winners/WinnerCard";
import { SubmitTestimonialModal } from "@/components/winners/SubmitTestimonialModal";
import { mockWinners } from "@/data/winnersData";

const WinnersSection = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <section id="ganhadores" className="py-16 bg-background relative overflow-hidden">
            <div className="container mx-auto px-4">
                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    {/* Decorative Badge */}
                    <motion.div
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-6"
                    >
                        <Sparkles className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium text-primary">
                            Histórias Reais de Ganhadores
                        </span>
                    </motion.div>

                    {/* Title */}
                    <h2 className="text-4xl md:text-5xl font-bold mb-4">
                        <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                            Mural dos Ganhadores
                        </span>
                    </h2>

                    {/* Subtitle */}
                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                        Confira quem já está comemorando e junte-se a eles! Veja os
                        depoimentos de quem já ganhou na MundoPix.
                    </p>

                    {/* CTA Button */}
                    <Button
                        size="lg"
                        onClick={() => setIsModalOpen(true)}
                        className="gap-2 shadow-[0_0_30px_hsl(162,95%,71%,0.3)] hover:shadow-[0_0_50px_hsl(162,95%,71%,0.4)]"
                    >
                        <MessageSquarePlus className="w-5 h-5" />
                        Enviar meu Depoimento
                    </Button>
                </motion.div>

                {/* Stats Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16"
                >
                    {[
                        { label: "Prêmios Entregues", value: "1.234+", icon: Trophy },
                        { label: "Valor Total", value: "R$ 2.5M+", icon: Sparkles },
                        { label: "Ganhadores Felizes", value: "890+", icon: Trophy },
                        { label: "Avaliação Média", value: "4.9/5", icon: Sparkles },
                    ].map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4 + index * 0.1 }}
                            className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4 text-center hover:border-primary/30 transition-colors"
                        >
                            <stat.icon className="w-6 h-6 text-primary mx-auto mb-2" />
                            <p className="text-2xl md:text-3xl font-bold text-foreground">
                                {stat.value}
                            </p>
                            <p className="text-sm text-muted-foreground">{stat.label}</p>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Winners Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mockWinners.map((winner, index) => (
                        <WinnerCard key={winner.id} winner={winner} index={index} />
                    ))}
                </div>
            </div>

            {/* Submit Modal */}
            <SubmitTestimonialModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
            />
        </section>
    );
};

export default WinnersSection;
