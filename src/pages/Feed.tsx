import React from "react";
import { motion } from "framer-motion";
import { 
  Trophy, 
  ShoppingCart, 
  Ticket, 
  Users, 
  TrendingUp, 
  Coins,
  Sparkles,
  Clock,
  ArrowRight
} from "lucide-react";
import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

interface ActivityEvent {
  id: string;
  type: "purchase" | "win" | "join" | "mint";
  user: string;
  userAvatar?: string;
  item: string;
  value?: number;
  timeAgo: string;
}

const stats = [
  {
    label: "Total Distribuído",
    value: "R$ 847.500",
    icon: Coins,
    change: "+12.5%",
    color: "text-primary",
  },
  {
    label: "Usuários Ativos",
    value: "2.847",
    icon: Users,
    change: "+8.3%",
    color: "text-accent",
  },
  {
    label: "Ganhadores Recentes",
    value: "156",
    icon: Trophy,
    change: "+24.1%",
    color: "text-yellow-500",
  },
  {
    label: "Sorteios Ativos",
    value: "12",
    icon: Ticket,
    change: "+3",
    color: "text-purple-400",
  },
];

const activities: ActivityEvent[] = [
  { id: "1", type: "win", user: "Maria S.", item: "iPhone 15 Pro Max", value: 8999, timeAgo: "2 min" },
  { id: "2", type: "purchase", user: "João P.", item: "NFT Gatinho Fofo #42", value: 25, timeAgo: "5 min" },
  { id: "3", type: "join", user: "Ana L.", item: "Sorteio PS5 Bundle", timeAgo: "8 min" },
  { id: "4", type: "mint", user: "Carlos R.", item: "NFT Dragão Lendário", value: 150, timeAgo: "12 min" },
  { id: "5", type: "win", user: "Fernanda M.", item: "PIX R$ 1.000", value: 1000, timeAgo: "15 min" },
  { id: "6", type: "purchase", user: "Lucas G.", item: "NFT Unicórnio Mágico #78", value: 50, timeAgo: "18 min" },
  { id: "7", type: "join", user: "Bruna C.", item: "Mega Sorteio MacBook", timeAgo: "22 min" },
  { id: "8", type: "purchase", user: "Pedro H.", item: "NFT Leão Dourado #15", value: 75, timeAgo: "25 min" },
  { id: "9", type: "win", user: "Juliana A.", item: "AirPods Pro", value: 2499, timeAgo: "30 min" },
  { id: "10", type: "mint", user: "Ricardo S.", item: "NFT Fênix Épica", value: 200, timeAgo: "35 min" },
];

const getEventIcon = (type: ActivityEvent["type"]) => {
  switch (type) {
    case "win":
      return <Trophy className="h-5 w-5 text-yellow-500" />;
    case "purchase":
      return <ShoppingCart className="h-5 w-5 text-primary" />;
    case "join":
      return <Ticket className="h-5 w-5 text-purple-400" />;
    case "mint":
      return <Sparkles className="h-5 w-5 text-accent" />;
  }
};

const getEventMessage = (event: ActivityEvent) => {
  switch (event.type) {
    case "win":
      return (
        <>
          <span className="font-semibold text-foreground">{event.user}</span>
          <span className="text-muted-foreground"> ganhou </span>
          <span className="font-semibold text-gradient">{event.item}</span>
        </>
      );
    case "purchase":
      return (
        <>
          <span className="font-semibold text-foreground">{event.user}</span>
          <span className="text-muted-foreground"> comprou </span>
          <span className="font-semibold text-primary">{event.item}</span>
        </>
      );
    case "join":
      return (
        <>
          <span className="font-semibold text-foreground">{event.user}</span>
          <span className="text-muted-foreground"> entrou no </span>
          <span className="font-semibold text-purple-400">{event.item}</span>
        </>
      );
    case "mint":
      return (
        <>
          <span className="font-semibold text-foreground">{event.user}</span>
          <span className="text-muted-foreground"> mintou </span>
          <span className="font-semibold text-accent">{event.item}</span>
        </>
      );
  }
};

const Feed: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header onMenuClick={() => {}} onWalletClick={() => {}} />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-xl">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              Feed de Atividades
            </h1>
          </div>
          <p className="text-muted-foreground">
            Acompanhe em tempo real o que está acontecendo na plataforma
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-card border-border hover:border-primary/30 transition-all duration-300 hover:shadow-glow">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 rounded-xl bg-secondary ${stat.color}`}>
                      <stat.icon className="h-5 w-5" />
                    </div>
                    <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                      {stat.change}
                    </Badge>
                  </div>
                  <p className="text-2xl md:text-3xl font-bold text-foreground mb-1">
                    {stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Activity Stream */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-card border-border overflow-hidden">
            <div className="p-4 md:p-6 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
                  <div className="absolute inset-0 w-3 h-3 bg-primary rounded-full animate-ping" />
                </div>
                <h2 className="text-xl font-bold text-foreground">Atividade ao Vivo</h2>
              </div>
              <Link to="/sorteios">
                <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                  Ver Sorteios <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="divide-y divide-border">
              {activities.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                  className="p-4 md:px-6 hover:bg-secondary/30 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    {/* Event Icon */}
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
                      {getEventIcon(event.type)}
                    </div>

                    {/* Event Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm md:text-base truncate">
                        {getEventMessage(event)}
                      </p>
                      {event.value && (
                        <p className="text-sm font-semibold text-gradient">
                          R$ {event.value.toLocaleString("pt-BR")}
                        </p>
                      )}
                    </div>

                    {/* Time */}
                    <div className="flex items-center gap-1 text-muted-foreground text-sm flex-shrink-0">
                      <Clock className="h-3 w-3" />
                      <span>{event.timeAgo}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Load More */}
            <div className="p-4 md:p-6 border-t border-border">
              <Button variant="outline" className="w-full">
                Carregar mais atividades
              </Button>
            </div>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default Feed;
