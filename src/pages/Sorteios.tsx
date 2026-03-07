import React, { useState, useMemo, useEffect } from "react";
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

import { api } from "@/lib/api";
import { Raffle } from "@/types/raffle";
import { toast } from "sonner";

import RaffleCard from "@/components/RaffleCard";

const RaffleCardWrapper = ({ raffle, index }: { raffle: Raffle; index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 + index * 0.05 }}
      className="w-full h-full flex flex-col"
    >
      <RaffleCard raffle={raffle} index={index} />
    </motion.div>
  );
};

const Sorteios: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("todos");
  const [sortBy, setSortBy] = useState<"price" | "ending" | "popular">("ending");
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [rafflesData, categoriesData] = await Promise.all([
          api.getActiveRaffles(),
          api.getCategories()
        ]);
        setRaffles(rafflesData);
        setCategories(categoriesData);
      } catch (error) {
        console.error("Failed to load data:", error);
        toast.error("Erro ao carregar dados. Tente novamente.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredRaffles = useMemo(() => {
    let result = raffles.filter(r => r.status === 'ativo');

    // Filter by search
    if (searchQuery) {
      result = result.filter(r =>
        r.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.premio.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (activeCategory !== "todos") {
      result = result.filter(r => r.categoria === activeCategory);
    }

    // Sort
    switch (sortBy) {
      case "price":
        result.sort((a, b) => a.custoNFT - b.custoNFT);
        break;
      case "popular":
        result.sort((a, b) => (b.participantes || 0) - (a.participantes || 0));
        break;
      case "ending":
        // Assuming dataFim is a string date; standard comparison
        result.sort((a, b) => new Date(a.dataFim).getTime() - new Date(b.dataFim).getTime());
        break;
    }

    return result;
  }, [searchQuery, activeCategory, sortBy, raffles]);

  // Helper to calculate ends in (simplified)
  // Defensive UTC handling: if no timezone indicator, treat as UTC
  const getTimeRemaining = (endDate: string) => {
    let dateStr = endDate.trim();
    if (dateStr.includes('T') && !dateStr.endsWith('Z') && !/[+-]\d{2}:\d{2}$/.test(dateStr)) {
      dateStr = dateStr + 'Z';
    }
    const diff = new Date(dateStr).getTime() - new Date().getTime();
    if (diff <= 0) return "Encerrado";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h ${Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))}m`;
  };

  return (
    <div className="min-h-screen bg-background">

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
                className={`flex-shrink-0 gap-2 ${activeCategory === cat.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border-border hover:border-primary/50"
                  }`}
              >
                <span>{cat.emoji}</span>
                {cat.nome}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Raffles Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="w-full">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 items-stretch">
              {filteredRaffles.map((raffle, index) => (
                <div key={raffle.id} className="w-full h-full">
                  <RaffleCardWrapper raffle={raffle} index={index} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredRaffles.length === 0 && (
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
              setActiveCategory("todos");
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
