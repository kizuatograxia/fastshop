import React from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NFT } from "@/types/raffle";
import { useWallet } from "@/contexts/WalletContext";
import { toast } from "sonner";

interface NFTCardProps {
    nft: NFT;
    index: number;
}

const rarityColors = {
    comum: "from-gray-400 to-gray-500",
    raro: "from-blue-400 to-cyan-500",
    epico: "from-purple-400 to-pink-500",
    lendario: "from-yellow-400 to-orange-500",
};

const rarityLabels = {
    comum: "Comum",
    raro: "Raro",
    epico: "Épico",
    lendario: "Lendário",
};

const NFTCard: React.FC<NFTCardProps> = ({ nft, index }) => {
    const { addToCart, getNFTCount } = useWallet();
    const ownedCount = getNFTCount(nft.id);

    const handleBuy = () => {
        addToCart(nft);
        toast.success(`${nft.nome} adcionado ao carrinho!`, {
            description: "Continue comprando ou finalize seu pedido.",
            icon: "🛒",
        });
    };

    return (
        <article
            className="group relative bg-card rounded-2xl border border-border overflow-hidden transition-all duration-300 hover:shadow-elevated hover:border-primary/30 hover:-translate-y-1 animate-fade-in"
            style={{ animationDelay: `${index * 0.05}s` }}
        >
            {/* Rarity Badge */}
            <div className={`absolute top-3 left-3 z-10 flex items-center gap-1 bg-gradient-to-r ${rarityColors[nft.raridade]} text-white px-2 py-1 rounded-lg text-xs font-bold`}>
                <Sparkles className="h-3 w-3" />
                {rarityLabels[nft.raridade]}
            </div>

            {/* Owned Badge */}
            {ownedCount > 0 && (
                <div className="absolute top-3 right-3 z-10 bg-primary text-primary-foreground px-2 py-1 rounded-lg text-xs font-bold">
                    x{ownedCount}
                </div>
            )}

            {/* NFT Display */}
            <div className={`relative aspect-square overflow-hidden bg-gradient-to-br ${nft.cor} flex items-center justify-center`}>
                {nft.image ? (
                    <img
                        src={nft.image}
                        alt={nft.nome}
                        className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
                    />
                ) : (
                    <span className="text-7xl md:text-8xl transition-transform duration-500 group-hover:scale-125 drop-shadow-lg">
                        {nft.emoji}
                    </span>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
                <div>
                    <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">
                        {nft.nome}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {nft.descricao}
                    </p>
                </div>

                <div className="flex items-center justify-between">
                    <p className="text-xl font-bold text-gradient">
                        R$ {nft.preco.toFixed(2).replace(".", ",")}
                    </p>
                </div>

                <Button
                    variant="cart"
                    size="default"
                    className="w-full"
                    onClick={handleBuy}
                >
                    <Sparkles className="h-4 w-4" />
                    Comprar NFT
                </Button>
            </div>
        </article>
    );
};

export default NFTCard;
