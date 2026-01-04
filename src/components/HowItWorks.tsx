import React from "react";
import { Gift, Ticket, Trophy, Sparkles } from "lucide-react";

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {steps.map((step, index) => (
                    <div
                        key={index}
                        className="relative bg-card rounded-2xl border border-border p-6 text-center hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 animate-fade-in"
                        style={{ animationDelay: `${index * 0.1}s` }}
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
                    </div>
                ))}
            </div>
        </section>
    );
};

export default HowItWorks;
