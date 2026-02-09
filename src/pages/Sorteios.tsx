import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  Search, 
  Filter, 
  Clock, 
  Users, 
  Trophy,
  Sparkles,
  ArrowUpDown,
  Ticket
} from "lucide-react";
import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface RaffleItem {
  id: string;
  title: string;
  image: string;
  prize: string;
  prizeValue: number;
  ticketPrice: number;
  ticketsSold: number;
  maxTickets: number;
  endsIn: string;
  category: string;
  isHot?: boolean;
}

const categories = [
  { id: "all", label: "Todos", icon: Sparkles },
  { id: "tech", label: "Tech", icon: null },
  { id: "gaming", label: "Gaming", icon: null },
  { id: "lifestyle", label: "Lifestyle", icon: null },
  { id: "pix", label: "PIX", icon: null },
  { id: "rare", label: "Raros", icon: Trophy },
];

const raffles: RaffleItem[] = [
  {
    id: "1",
    title: "iPhone 15 Pro Max 256GB",
    image: "https://images.unsplash.com/photo-1696446701796-da61225697cc?w=400",
    prize: "iPhone 15 Pro Max",
    prizeValue: 8999,
    ticketPrice: 25,
    ticketsSold: 847,
    maxTickets: 1000,
    endsIn: "2h 45m",
    category: "tech",
    isHot: true,
  },
  {
    id: "2",
    title: "PlayStation 5 + 3 Jogos",
    image: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400",
    prize: "PS5 Bundle",
    prizeValue: 4500,
    ticketPrice: 15,
    ticketsSold: 623,
    maxTickets: 800,
    endsIn: "5h 12m",
    category: "gaming",
  },
  {
    id: "3",
    title: "PIX de R$ 5.000",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400",
    prize: "PIX R$ 5.000",
    prizeValue: 5000,
    ticketPrice: 10,
    ticketsSold: 1250,
    maxTickets: 2000,
    endsIn: "12h 30m",
    category: "pix",
    isHot: true,
  },
  {
    id: "4",
    title: "MacBook Air M3",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400",
    prize: "MacBook Air M3",
    prizeValue: 12999,
    ticketPrice: 50,
    ticketsSold: 234,
    maxTickets: 500,
    endsIn: "1d 8h",
    category: "tech",
  },
  {
    id: "5",
    title: "Nintendo Switch OLED",
    image: "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=400",
    prize: "Switch OLED",
    prizeValue: 2499,
    ticketPrice: 10,
    ticketsSold: 412,
    maxTickets: 600,
    endsIn: "18h 22m",
    category: "gaming",
  },
  {
    id: "6",
    title: "AirPods Pro 2",
    image: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=400",
    prize: "AirPods Pro 2",
    prizeValue: 2499,
    ticketPrice: 8,
    ticketsSold: 189,
    maxTickets: 400,
    endsIn: "3d 2h",
    category: "tech",
  },
];

const Sorteios: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortBy, setSortBy] = useState<"price" | "ending" | "popular">("ending");

  const filteredRaffles = useMemo(() => {
    let result = [...raffles];

    // Filter by search
    if (searchQuery) {
      result = result.filter(r => 
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.prize.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (activeCategory !== "all") {
      result = result.filter(r => r.category === activeCategory);
    }

    // Sort
    switch (sortBy) {
      case "price":
        result.sort((a, b) => a.ticketPrice - b.ticketPrice);
        break;
      case "popular":
        result.sort((a, b) => b.ticketsSold - a.ticketsSold);
        break;
      case "ending":
        // Already sorted by ending time in mock data
        break;
    }

    return result;
  }, [searchQuery, activeCategory, sortBy]);

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
              <Trophy className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              Sorteios
            </h1>
          </div>
          <p className="text-muted-foreground">
            Escolha seu sorteio e concorra a prêmios incríveis
          </p>
        </motion.div>

        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 space-y-4"
        >
          {/* Search Bar */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Buscar sorteios..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-card border-border h-12"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="lg" className="h-12 gap-2">
                  <ArrowUpDown className="h-4 w-4" />
                  <span className="hidden sm:inline">Ordenar</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSortBy("ending")}>
                  Terminando em breve
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("price")}>
                  Menor preço
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("popular")}>
                  Mais populares
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Category Pills */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={activeCategory === cat.id ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(cat.id)}
                className={`flex-shrink-0 gap-2 ${
                  activeCategory === cat.id 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-card border-border hover:border-primary/50"
                }`}
              >
                {cat.icon && <cat.icon className="h-4 w-4" />}
                {cat.label}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Raffles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRaffles.map((raffle, index) => (
            <motion.div
              key={raffle.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.05 }}
            >
              <Link to={`/raffle/${raffle.id}`}>
                <Card className="group bg-card border-border overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-glow hover:-translate-y-1 cursor-pointer">
                  {/* Image */}
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={raffle.image}
                      alt={raffle.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
                    
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex gap-2">
                      {raffle.isHot && (
                        <Badge className="bg-destructive text-destructive-foreground animate-pulse">
                          🔥 HOT
                        </Badge>
                      )}
                    </div>

                    {/* Time Badge */}
                    <div className="absolute top-3 right-3">
                      <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm gap-1">
                        <Clock className="h-3 w-3" />
                        {raffle.endsIn}
                      </Badge>
                    </div>

                    {/* Prize Value */}
                    <div className="absolute bottom-3 left-3">
                      <p className="text-2xl font-bold text-gradient">
                        R$ {raffle.prizeValue.toLocaleString("pt-BR")}
                      </p>
                    </div>
                  </div>

                  <CardContent className="p-4 space-y-4">
                    {/* Title */}
                    <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {raffle.title}
                    </h3>

                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progresso</span>
                        <span className="text-foreground font-medium">
                          {raffle.ticketsSold}/{raffle.maxTickets}
                        </span>
                      </div>
                      <Progress 
                        value={(raffle.ticketsSold / raffle.maxTickets) * 100} 
                        className="h-2 bg-secondary"
                      />
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span className="text-sm">{raffle.ticketsSold} participantes</span>
                      </div>
                      <Badge className="bg-primary/10 text-primary border-0">
                        <Ticket className="h-3 w-3 mr-1" />
                        R$ {raffle.ticketPrice}
                      </Badge>
                    </div>

                    {/* CTA Button */}
                    <Button className="w-full" variant="default">
                      Participar Agora
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredRaffles.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Filter className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              Nenhum sorteio encontrado
            </h3>
            <p className="text-muted-foreground mb-4">
              Tente ajustar seus filtros ou busca
            </p>
            <Button variant="outline" onClick={() => {
              setSearchQuery("");
              setActiveCategory("all");
            }}>
              Limpar filtros
            </Button>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default Sorteios;
