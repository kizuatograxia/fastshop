import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Star, ShoppingCart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NFT } from "@/types/raffle";
import { useWallet } from "@/contexts/WalletContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface NFTMobilePreviewProps {
    nfts: NFT[];
}

const NFTMobilePreview: React.FC<NFTMobilePreviewProps> = ({ nfts }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const { addToCart } = useWallet();
    const navigate = useNavigate();

    if (!nfts || nfts.length === 0) return null;

    const currentNFT = nfts[currentIndex];

    const nextNFT = () => {
        setCurrentIndex((prev) => (prev + 1) % nfts.length);
    };

    const prevNFT = () => {
        setCurrentIndex((prev) => (prev - 1 + nfts.length) % nfts.length);
    };

    const handleBuy = () => {
        addToCart(currentNFT);
        toast.success(`${currentNFT.nome} adicionado ao carrinho!`, {
            description: "Continue comprando ou finalize seu pedido.",
            icon: "🛒",
        });
    };

    const rarityLabels: Record<string, string> = {
        comum: "Comum",
        raro: "Raro",
        epico: "Épico",
        lendario: "Lendário",
    };

    const rarityClasses: Record<string, string> = {
        comum: "bg-gray-500/20 text-gray-300 border-gray-500/30",
        raro: "bg-blue-500/20 text-blue-300 border-blue-500/30",
        epico: "bg-purple-500/20 text-purple-300 border-purple-500/30",
        lendario: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="relative p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 bg-card/30 rounded-3xl border border-border/50 overflow-hidden">
                {/* Navigation Buttons */}
                <button
                    onClick={prevNFT}
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 w-10 absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-background/50 hover:bg-background/80"
                >
                    <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                    onClick={nextNFT}
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 w-10 absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-background/50 hover:bg-background/80"
                >
                    <ChevronRight className="h-6 w-6" />
                </button>

                {/* NFT Image Display */}
                <div className="flex-shrink-0 w-32 h-32 md:w-48 md:h-48 rounded-2xl bg-card/50 backdrop-blur-sm flex items-center justify-center shadow-glow overflow-hidden">
                    {currentNFT.image ? (
                        <img
                            src={currentNFT.image}
                            alt={currentNFT.nome}
                            className="w-full h-full object-contain animate-float hover:scale-110 transition-transform duration-300"
                        />
                    ) : (
                        <span className="text-6xl animate-float transition-transform duration-300">{currentNFT.emoji}</span>
                    )}
                </div>

                {/* NFT Info */}
                <div className="flex-1 text-center md:text-left">
                    <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors mb-3 ${rarityClasses[currentNFT.raridade] || rarityClasses.comum}`}>
                        <Star className="h-3 w-3 mr-1 fill-current" />
                        {rarityLabels[currentNFT.raridade] || "NFT"}
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                        {currentNFT.nome} {currentNFT.preco && `(R$ ${currentNFT.preco})`}
                    </h3>
                    <p className="text-muted-foreground mb-4 max-w-md line-clamp-2">
                        {currentNFT.descricao}
                    </p>
                    <div className="flex items-center justify-center md:justify-start gap-4">
                        <p className="text-3xl font-bold text-gradient">
                            R$ {currentNFT.preco.toFixed(2).replace(".", ",")}
                        </p>
                        <Button
                            onClick={handleBuy}
                            className="bg-primary text-[#0F172A] hover:bg-primary/90 hover:shadow-[0_0_30px_hsl(162,95%,71%,0.4)] active:scale-[0.98] h-11 px-5 py-2 gap-2"
                        >
                            <ShoppingCart className="h-4 w-4" />
                            Comprar Agora
                        </Button>
                    </div>
                </div>

                {/* Pagination Dots */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {nfts.slice(0, 5).map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            className={`h-2 rounded-full transition-all ${currentIndex === idx ? "bg-primary w-6" : "bg-muted-foreground/30 w-2"}`}
                        />
                    ))}
                </div>
            </div>

            {/* Marketplace Link Button */}
            <div className="flex justify-center">
                <Button
                    variant="outline"
                    className="w-full max-w-xs group gap-2"
                    onClick={() => navigate("/nfts")}
                >
                    Ver Marketplace Completo
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
            </div>
        </div>
    );
};

export default NFTMobilePreview;
