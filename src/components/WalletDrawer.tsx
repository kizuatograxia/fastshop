import React from "react";
import { X, ShoppingCart, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/contexts/WalletContext";
import { useNavigate } from "react-router-dom";

interface WalletDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

const rarityColors: Record<string, string> = {
    comum: "from-gray-400 to-gray-500",
    raro: "from-blue-400 to-cyan-500",
    epico: "from-purple-400 to-pink-500",
    lendario: "from-yellow-400 to-orange-500",
};

const WalletDrawer: React.FC<WalletDrawerProps> = ({ isOpen, onClose }) => {
    const { ownedNFTs, getTotalNFTs, removeNFT } = useWallet();
    const totalNFTs = getTotalNFTs();
    const navigate = useNavigate();

    const handleCheckout = () => {
        onClose();
        navigate("/checkout");
    };

    return (
        <>
            {/* Overlay */}
            <div
                className={`fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                    }`}
                onClick={onClose}
            />

            {/* Drawer */}
            <aside
                className={`fixed top-0 right-0 h-full w-full max-w-md bg-card border-l border-border z-[110] transition-transform duration-300 ease-out ${isOpen ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-border">
                        <div className="flex items-center gap-3">
                            <ShoppingCart className="h-5 w-5 text-primary" />
                            <span className="font-bold text-lg text-foreground">
                                Meu Carrinho
                            </span>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            aria-label="Fechar carrinho"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Stats */}
                    <div className="p-4 bg-gradient-hero">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Total de NFTs</p>
                                <p className="text-3xl font-bold text-gradient">{totalNFTs}</p>
                            </div>
                            <div className="p-3 bg-primary/20 rounded-xl">
                                <Sparkles className="h-8 w-8 text-primary" />
                            </div>
                        </div>
                    </div>

                    {/* NFT Items */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {ownedNFTs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <ShoppingCart className="h-16 w-16 text-muted-foreground/50 mb-4" />
                                <p className="text-lg font-medium text-muted-foreground">
                                    Seu carrinho está vazio
                                </p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Adicione NFTs para participar dos sorteios
                                </p>
                            </div>
                        ) : (
                            ownedNFTs.map((nft) => (
                                <div
                                    key={nft.id}
                                    className="flex gap-4 bg-secondary/30 rounded-xl p-3 border border-border"
                                >
                                    <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${rarityColors[nft.raridade]} flex items-center justify-center flex-shrink-0`}>
                                        <span className="text-3xl">{nft.emoji}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-sm text-foreground">
                                            {nft.nome}
                                        </h4>
                                        <p className="text-xs text-muted-foreground capitalize">
                                            {nft.raridade}
                                        </p>
                                        <p className="text-primary font-bold mt-1">
                                            x{nft.quantidade}
                                        </p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-destructive hover:text-destructive self-center"
                                        onClick={() => removeNFT(nft.id, 1)}
                                        title="Remover 1 NFT"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {ownedNFTs.length > 0 && (
                        <div className="p-4 border-t border-border space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Total</span>
                                <span className="text-lg font-bold text-gradient">
                                    R$ {ownedNFTs.reduce((sum, nft) => sum + nft.preco * nft.quantidade, 0).toFixed(2)}
                                </span>
                            </div>
                            <Button
                                className="w-full"
                                size="lg"
                                onClick={handleCheckout}
                            >
                                Finalizar Compra
                            </Button>
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
};

export default WalletDrawer;
