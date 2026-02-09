import { useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Sparkles, MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WinnerCard } from "@/components/winners/WinnerCard";
import { SubmitTestimonialModal } from "@/components/winners/SubmitTestimonialModal";
import { mockWinners } from "@/data/winnersData";

const WinnersFeed = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          {/* Decorative Badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-6"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              Histórias Reais de Ganhadores
            </span>
          </motion.div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Mural dos Ganhadores
            </span>
          </h1>

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
        </motion.section>

        {/* Stats Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
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
              animate={{ opacity: 1, scale: 1 }}
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
        </motion.section>

        {/* Winners Grid */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Trophy className="w-6 h-6 text-primary" />
              Depoimentos Recentes
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockWinners.map((winner, index) => (
              <WinnerCard key={winner.id} winner={winner} index={index} />
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center mt-16 py-12 border-t border-border/30"
        >
          <h3 className="text-2xl font-bold text-foreground mb-4">
            Você também pode ser o próximo! 🎉
          </h3>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Participe dos nossos sorteios e venha contar sua história de
            sucesso aqui no mural.
          </p>
          <Button
            variant="outline"
            size="lg"
            onClick={() => (window.location.href = "/")}
            className="gap-2"
          >
            <Sparkles className="w-5 h-5" />
            Ver Sorteios Ativos
          </Button>
        </motion.section>
      </main>

      {/* Submit Modal */}
      <SubmitTestimonialModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </div>
  );
};

export default WinnersFeed;
