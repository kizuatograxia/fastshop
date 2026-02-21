import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  ShoppingCart,
  TrendingUp,
  Star,
  ChevronLeft,
  ChevronRight,
  Gem,
  Zap
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWallet } from "@/contexts/WalletContext";
import { toast } from "sonner";
import { api } from "@/lib/api";

interface NFTItem {
  id: string;
  name: string;
  emoji: string;
  price: number;
  rarity: "comum" | "raro" | "epico" | "lendario";
  description: string;
  gradient: string;
  stock?: number;
}

const rarityConfig = {
  comum: {
    label: "Comum",
    color: "from-gray-400 to-gray-500",
    badge: "bg-gray-500/20 text-gray-300 border-gray-500/30",
  },
  raro: {
    label: "Raro",
    color: "from-blue-400 to-cyan-500",
    badge: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  },
  epico: {
    label: "Épico",
    color: "from-purple-400 to-pink-500",
    badge: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  },
  lendario: {
    label: "Lendário",
    color: "from-yellow-400 to-orange-500",
    badge: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  },
};


const NFTs: React.FC = () => {
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const { addToCart } = useWallet();
  const [nfts, setNfts] = useState<NFTItem[]>([]);
  const [featured, setFeatured] = useState<NFTItem[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setLoading(true);
        const catalog = await api.getNFTCatalog();
        if (catalog && catalog.length > 0) {
          // Map backend fields to frontend NFTItem if necessary (already handled by getNFTCatalog mapping in api.ts)
          const mapped = catalog.map((item: any) => ({
            id: item.id,
            name: item.nome, // mapped in api.ts
            emoji: item.emoji,
            price: item.preco, // mapped in api.ts
            rarity: item.raridade, // mapped in api.ts
            description: item.descricao, // mapped in api.ts
            gradient: item.cor // mapped in api.ts
          }));

          setNfts(mapped);
          setFeatured(mapped.slice(-3).reverse()); // Use last 3 as featured (usually more expensive)
        }
      } catch (error) {
        console.error("Failed to fetch NFT catalog", error);
        toast.error("Erro ao carregar catálogo de NFTs.");
      } finally {
        setLoading(false);
      }
    };
    fetchCatalog();
  }, []);

  const handleBuy = (nft: NFTItem) => {
    addToCart({
      id: nft.id,
      nome: nft.name,
      emoji: nft.emoji,
      preco: nft.price,
      raridade: nft.rarity,
      descricao: nft.description,
      cor: nft.gradient,
    });
    toast.success(`${nft.name} adicionado ao carrinho!`, {
      icon: nft.emoji,
    });
  };

  const nextFeatured = () => {
    setFeaturedIndex((prev) => (prev + 1) % featured.length);
  };

  const prevFeatured = () => {
    setFeaturedIndex((prev) => (prev - 1 + featured.length) % featured.length);
  };

  const currentFeatured = featured[featuredIndex];

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
              <Gem className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              Coleção NFT
            </h1>
          </div>
          <p className="text-muted-foreground">
            Adquira NFTs exclusivos e participe dos melhores sorteios
          </p>
        </motion.div>

        {/* Featured Section */}
        {featured.length > 0 && currentFeatured && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12"
          >
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold text-foreground">Em Destaque</h2>
            </div>

            <Card className={`relative overflow-hidden bg-gradient-to-br ${currentFeatured.gradient} border-primary/30`}>
              <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/50 to-transparent" />

              <CardContent className="relative p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
                {/* Navigation */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={prevFeatured}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-background/50 hover:bg-background/80"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={nextFeatured}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-background/50 hover:bg-background/80"
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>

                {/* NFT Display */}
                <motion.div
                  key={currentFeatured.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="flex-shrink-0 w-32 h-32 md:w-48 md:h-48 rounded-2xl bg-card/50 backdrop-blur-sm flex items-center justify-center shadow-glow"
                >
                  <span className="text-6xl md:text-8xl animate-float">{currentFeatured.emoji}</span>
                </motion.div>

                {/* Info */}
                <div className="flex-1 text-center md:text-left">
                  <Badge className={`${(rarityConfig[currentFeatured.rarity] || rarityConfig.comum).badge} mb-3`}>
                    <Star className="h-3 w-3 mr-1 fill-current" />
                    {(rarityConfig[currentFeatured.rarity] || rarityConfig.comum).label}
                  </Badge>
                  <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                    {currentFeatured.name}
                  </h3>
                  <p className="text-muted-foreground mb-4 max-w-md">
                    {currentFeatured.description}
                  </p>
                  <div className="flex items-center justify-center md:justify-start gap-4">
                    <p className="text-3xl font-bold text-gradient">
                      R$ {currentFeatured.price.toFixed(2).replace(".", ",")}
                    </p>
                    <Button onClick={() => handleBuy(currentFeatured)} className="gap-2">
                      <ShoppingCart className="h-4 w-4" />
                      Comprar Agora
                    </Button>
                  </div>
                </div>

                {/* Dots */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {featured.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setFeaturedIndex(idx)}
                      className={`w-2 h-2 rounded-full transition-all ${idx === featuredIndex
                        ? "bg-primary w-6"
                        : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                        }`}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {loading && (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        )}

        {/* NFT Grid */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Todos os NFTs</h2>
          </div>
          <Badge variant="outline" className="text-muted-foreground">
            {nfts.length} disponíveis
          </Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {nfts.map((nft, index) => (
            <motion.div
              key={nft.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.03 }}
            >
              <Card className="group bg-card border-border overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-glow hover:-translate-y-1">
                {/* Rarity Badge */}
                <div className="absolute top-2 left-2 z-10">
                  <Badge className={`${(rarityConfig[nft.rarity] || rarityConfig.comum).badge} text-xs`}>
                    {(rarityConfig[nft.rarity] || rarityConfig.comum).label}
                  </Badge>
                </div>

                {/* Stock Badge */}
                {nft.stock && nft.stock < 50 && (
                  <div className="absolute top-2 right-2 z-10">
                    <Badge className="bg-destructive/20 text-destructive border-destructive/30 text-xs">
                      <Zap className="h-3 w-3 mr-1" />
                      {nft.stock} left
                    </Badge>
                  </div>
                )}

                {/* NFT Display */}
                <div className={`relative aspect-square bg-gradient-to-br ${nft.gradient} flex items-center justify-center overflow-hidden`}>
                  <span className="text-5xl md:text-6xl transition-transform duration-300 group-hover:scale-125 drop-shadow-lg">
                    {nft.emoji}
                  </span>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </div>

                <CardContent className="p-3 space-y-2">
                  <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors truncate">
                    {nft.name}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {nft.description}
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <p className="font-bold text-gradient">
                      R$ {nft.price.toFixed(2).replace(".", ",")}
                    </p>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 hover:bg-primary/20"
                      onClick={() => handleBuy(nft)}
                    >
                      <ShoppingCart className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default NFTs;
