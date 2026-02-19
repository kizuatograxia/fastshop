import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Gift,
  Ticket,
  Trophy,
  Sparkles,
  ChevronDown,
  ArrowRight,
  Shield,
  Zap,
  Users,
  CreditCard,
  HelpCircle,
  Rocket
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const steps = [
  {
    number: "01",
    icon: Gift,
    title: "Compre NFTs",
    description: "Adquira NFTs exclusivos de nossa coleção. Cada NFT é sua entrada para os sorteios mais incríveis!",
    color: "from-primary to-accent",
    details: ["Diversas raridades disponíveis", "Preços acessíveis", "Coleção exclusiva"],
  },
  {
    number: "02",
    icon: Ticket,
    title: "Escolha um Sorteio",
    description: "Navegue pelos sorteios ativos e escolha os prêmios que você quer concorrer. Tem pra todos os gostos!",
    color: "from-purple-500 to-pink-500",
    details: ["iPhone, PS5, PIX e muito mais", "Novos sorteios toda semana", "Escolha seus favoritos"],
  },
  {
    number: "03",
    icon: Sparkles,
    title: "Use seus NFTs",
    description: "Gaste seus NFTs para participar. Quanto mais NFTs você usar, maiores suas chances de ganhar!",
    color: "from-yellow-500 to-orange-500",
    details: ["Sistema transparente", "Múltiplas entradas", "NFTs de maior raridade = mais chances"],
  },
  {
    number: "04",
    icon: Trophy,
    title: "Ganhe Prêmios!",
    description: "Se você for sorteado, o prêmio é seu! Receba em casa ou via PIX instantâneo.",
    color: "from-emerald-500 to-teal-500",
    details: ["Entrega garantida", "PIX na hora", "Suporte 24/7"],
  },
];

const features = [
  {
    icon: Shield,
    title: "100% Seguro",
    description: "Blockchain garante transparência total em todos os sorteios.",
  },
  {
    icon: Zap,
    title: "Instantâneo",
    description: "Prêmios em PIX são creditados imediatamente após o sorteio.",
  },
  {
    icon: Users,
    title: "+10.000 Ganhadores",
    description: "Milhares de pessoas já ganharam prêmios incríveis.",
  },
  {
    icon: CreditCard,
    title: "Pagamento Fácil",
    description: "PIX, cartão de crédito e outras formas de pagamento.",
  },
];

const faqs = [
  {
    question: "Como funciona o sorteio?",
    answer: "Cada NFT que você possui dá direito a uma ou mais entradas no sorteio, dependendo da raridade. Quanto mais raro o NFT, mais entradas você ganha! O sorteio é realizado de forma transparente usando tecnologia blockchain.",
  },
  {
    question: "Como recebo meu prêmio?",
    answer: "Prêmios em dinheiro (PIX) são creditados instantaneamente após o sorteio. Produtos físicos são enviados para o endereço cadastrado em até 7 dias úteis, com rastreamento completo.",
  },
  {
    question: "Os NFTs são reembolsáveis?",
    answer: "NFTs não são reembolsáveis após a compra, pois são ativos digitais únicos. Por isso, recomendamos analisar bem antes de comprar. Você pode usá-los em quantos sorteios quiser!",
  },
  {
    question: "Quais as chances de ganhar?",
    answer: "Suas chances dependem da quantidade e raridade dos seus NFTs. NFTs Lendários dão 10x mais chances que NFTs Comuns. Quanto mais NFTs você usar em um sorteio, maiores suas chances!",
  },
  {
    question: "É legal participar?",
    answer: "Sim! O MundoPix opera de acordo com todas as regulamentações brasileiras para sorteios promocionais. Todos os participantes devem ter 18 anos ou mais.",
  },
  {
    question: "Como sei que o sorteio é justo?",
    answer: "Utilizamos tecnologia blockchain para garantir que todos os sorteios sejam 100% transparentes e auditáveis. Qualquer pessoa pode verificar os resultados on-chain.",
  },
];

const ComoFunciona: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-6">
            <HelpCircle className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Guia Completo</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
            Como o <span className="text-gradient">MundoPix</span> Funciona?
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Participar é super simples! Siga os 4 passos abaixo e comece a concorrer a prêmios incríveis.
          </p>
        </motion.div>

        {/* Steps Section */}
        <div className="relative mb-20">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-primary via-purple-500 via-yellow-500 to-emerald-500 -translate-y-1/2 opacity-20" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15 }}
                className="relative"
              >
                <Card className="relative bg-card border-border overflow-hidden hover:border-primary/30 transition-all duration-300 hover:shadow-glow group h-full">
                  {/* Gradient Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-5 group-hover:opacity-10 transition-opacity`} />

                  {/* Step Number */}
                  <div className={`absolute -top-4 -left-4 w-16 h-16 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                    <span className="text-2xl font-black text-white">{step.number}</span>
                  </div>

                  <CardContent className="relative pt-14 p-6">
                    {/* Icon */}
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${step.color} bg-opacity-10 flex items-center justify-center mb-4`}>
                      <step.icon className="h-7 w-7 text-white" />
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground mb-4 text-sm">
                      {step.description}
                    </p>

                    {/* Details */}
                    <ul className="space-y-2">
                      {step.details.map((detail, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${step.color}`} />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </CardContent>

                  {/* Arrow for desktop */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 bg-card border border-border rounded-full items-center justify-center">
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mb-20"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
            Por que escolher o <span className="text-gradient">MundoPix</span>?
          </h2>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + index * 0.1 }}
              >
                <Card className="bg-card border-border hover:border-primary/30 transition-all duration-300 h-full text-center p-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mb-20"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Perguntas Frequentes
            </h2>
            <p className="text-muted-foreground">
              Tire suas dúvidas sobre o funcionamento da plataforma
            </p>
          </div>

          <Card className="bg-card border-border max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border-border">
                  <AccordionTrigger className="px-6 text-left hover:text-primary hover:no-underline">
                    <span className="font-medium">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4 text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="text-center"
        >
          <Card className="bg-gradient-to-br from-primary/10 via-card to-accent/10 border-primary/20 p-8 md:p-12">
            <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-glow-pulse">
              <Rocket className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Pronto para começar?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              Junte-se a milhares de pessoas que já estão ganhando prêmios incríveis no MundoPix!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/nfts">
                <Button size="lg" className="gap-2 w-full sm:w-auto">
                  <Sparkles className="h-5 w-5" />
                  Comprar NFTs
                </Button>
              </Link>
              <Link to="/sorteios">
                <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto">
                  <Trophy className="h-5 w-5" />
                  Ver Sorteios
                </Button>
              </Link>
            </div>
          </Card>
        </motion.div>
      </main>

      {/* Footer spacing */}
      <div className="h-16" />
    </div>
  );
};

export default ComoFunciona;
