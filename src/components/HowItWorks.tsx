import { FC } from "react";
import { Gift, Ticket, Trophy, Sparkles } from "lucide-react";
import { motion, Variants } from "framer-motion";

const steps = [
    {
        icon: Gift,
        title: "Compre NFTs",
        description: "Adquira NFTs de animais fofos e emojis exclusivos. Cada NFT é sua entrada para os sorteios.",
        color: "bg-primary/10 text-primary",
    },
    {
        icon: Ticket,
        title: "Escolha um Sorteio",
        description: "Navegue pelos sorteios ativos e escolha os prêmios que você quer concorrer.",
        color: "bg-accent/10 text-accent",
    },
    {
        icon: Sparkles,
        title: "Use seus NFTs",
        description: "Gaste seus NFTs para participar. Quanto mais NFTs você usar, maiores suas chances!",
        color: "bg-purple-500/10 text-purple-500",
    },
    {
        icon: Trophy,
        title: "Ganhe Prêmios!",
        description: "Se você for sorteado, o prêmio é seu! Receba em casa ou via PIX.",
        color: "bg-yellow-500/10 text-yellow-500",
    },
];

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.15 }
    }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const HowItWorks: React.FC = () => {
    return (
        <section id="como-funciona" className="container mx-auto px-4 py-16">
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                    Como Funciona?
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    Participar é super simples! Siga os passos abaixo e comece a concorrer a prêmios incríveis.
                </p>
            </div>
            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-50px" }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
                {steps.map((step, index) => (
                    <motion.div
                        variants={itemVariants}
                        key={index}
                        className="relative bg-card rounded-2xl border border-border p-6 text-center shadow-sm hover:shadow-elevated transition-shadow duration-300"
                    >
                        {/* Step Number */}
                        <div className="absolute -top-3 -left-3 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm">
                            {index + 1}
                        </div>
                        {/* Icon */}
                        <div className={`w-16 h-16 ${step.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                            <step.icon className="h-8 w-8" />
                        </div>
                        {/* Content */}
                        <h3 className="font-bold text-lg text-foreground mb-2">
                            {step.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            {step.description}
                        </p>
                    </motion.div>
                ))}
            </motion.div>
        </section>
    );
};

export default HowItWorks;
