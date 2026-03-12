import { FC } from "react";
import { Sparkles, ShoppingCart, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NFT } from "@/types/raffle";
import { useWallet } from "@/contexts/WalletContext";
import { toast } from "sonner";

interface NFTCardProps {
    nft: NFT;
    index: number;
}

import { rarityColors, rarityLabels } from "@/utils/rarity";

const NFTCard: FC<NFTCardProps> = ({ nft, index }) => {
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
            className="group relative rounded-2xl border border-border overflow-hidden transition-all duration-300 hover:shadow-elevated hover:border-primary/50 hover:-translate-y-1 animate-fade-in"
            style={{ animationDelay: `${index * 0.05}s` }}
        >
            {/* Full Card Background Glow based on the animal color */}
            <div className={`absolute inset-0 bg-gradient-to-br ${nft.cor} opacity-20 dark:opacity-10 group-hover:opacity-30 transition-opacity duration-300`} />
            {/* Rarity Badge */}
            <div className={`absolute top-3 left-3 z-10 flex items-center gap-1 bg-gradient-to-r ${rarityColors[nft.raridade] || rarityColors.comum} text-white px-2 py-1 rounded-lg text-xs font-bold`}>
                <Sparkles className="h-3 w-3" />
                {rarityLabels[nft.raridade] || rarityLabels.comum}
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
            <div className="p-4 space-y-3 relative z-10 bg-card border-t border-border/50">
                <div>
                    <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">
                        {nft.nome}
                    </h3>
                    {/* <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {nft.descricao}
                    </p> */}
                </div>

                <div className="flex items-center justify-between pb-1">
                    <p className="text-lg font-bold text-gradient flex items-center gap-1.5 focus">
                        <Ticket className="w-4 h-4 text-green-600 dark:text-green-500" /> {Math.floor(nft.preco)}
                    </p>
                </div>

                <Button
                    variant="cart"
                    className="w-full h-10 rounded text-xs gap-1"
                    onClick={handleBuy}
                >
                    <ShoppingCart className="h-4 w-4" />
                    Comprar NFT
                </Button>
            </div>
        </article>
    );
};

export default NFTCard;
