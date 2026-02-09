import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, QrCode, Copy, Check, ShoppingCart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useWallet } from "@/contexts/WalletContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

const rarityColors: Record<string, string> = {
    comum: "from-gray-400 to-gray-500",
    raro: "from-blue-400 to-cyan-500",
    epico: "from-purple-400 to-pink-500",
    lendario: "from-yellow-400 to-orange-500",
};

// Estrutura para integração com Pagar.me
interface PixPayment {
    qrCode: string;
    qrCodeBase64: string;
    copyPasteCode: string;
    expiresAt: string;
    transactionId: string;
}

const Checkout: React.FC = () => {
    const navigate = useNavigate();
    const { cartItems, getTotalNFTs, addNFT, clearCart, ownedNFTs } = useWallet();
    const { toast } = useToast();

    const [isLoading, setIsLoading] = useState(false);
    const [pixData, setPixData] = useState<PixPayment | null>(null);
    const [copied, setCopied] = useState(false);

    const totalNFTs = getTotalNFTs();
    const totalPrice = cartItems.reduce((sum, nft) => sum + nft.preco * nft.quantidade, 0);
    const totalPriceInBRL = totalPrice; // Valor já está em BRL

    const { user } = useAuth(); // We need user info for the payment

    const handlePayWithPix = async () => {
        setIsLoading(true);

        try {
            const response = await api.createPixPayment(
                Math.round(totalPriceInBRL * 100),
                cartItems.map(nft => ({
                    id: nft.id,
                    title: nft.nome,
                    quantity: nft.quantidade,
                    unit_price: Math.round(nft.preco * 100),
                    tangible: false
                })),
                {
                    name: user?.name || "Cliente Anônimo",
                    email: user?.email || "cliente@exemplo.com",
                    // Pagar.me requires more info usually (CPF, Phone), but for now we send basic or mock
                }
            );

            setPixData({
                qrCode: response.qr_code_url,
                qrCodeBase64: response.qr_code,
                copyPasteCode: response.qr_code,
                expiresAt: response.expires_at,
                transactionId: response.id,
            });

            // Start polling for status
            const interval = setInterval(async () => {
                try {
                    const statusRes = await api.checkPaymentStatus(response.id);
                    if (statusRes.status === 'paid') {
                        clearInterval(interval);
                        await confirmPurchase(); // Execute purchase logic
                    }
                } catch (e) {
                    console.error("Error checking status", e);
                }
            }, 5000);

        } catch (error) {
            console.error(error);
            toast({
                title: "Erro ao gerar PIX",
                description: "Tente novamente mais tarde.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const confirmPurchase = async () => {
        for (const item of cartItems) {
            for (let i = 0; i < item.quantidade; i++) {
                await addNFT(item);
            }
        }
        clearCart();
        toast({
            title: "Compra realizada com sucesso!",
            description: "Seus NFTs foram adicionados à sua carteira.",
        });
        navigate("/profile"); // Redirect to profile/wallet
    };

    const handleCopyPixCode = () => {
        if (pixData) {
            navigator.clipboard.writeText(pixData.copyPasteCode);
            setCopied(true);
            toast({
                title: "Código copiado!",
                description: "Cole no seu app de pagamento.",
            });
            setTimeout(() => setCopied(false), 3000);
        }
    };

    if (totalNFTs === 0) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <Card className="max-w-md w-full text-center">
                    <CardContent className="pt-6">
                        <ShoppingCart className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                        <h2 className="text-xl font-bold mb-2">Carrinho vazio</h2>
                        <p className="text-muted-foreground mb-4">
                            Adicione NFTs ao seu carrinho para continuar.
                        </p>
                        <Button onClick={() => navigate("/")}>
                            Explorar NFTs
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
                <div className="container mx-auto px-4">
                    <div className="flex items-center gap-4 h-16">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(-1)}
                            aria-label="Voltar"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <h1 className="text-xl font-bold">Checkout</h1>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 max-w-2xl">
                {!pixData ? (
                    <div className="space-y-6">
                        {/* Resumo do Pedido */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ShoppingCart className="h-5 w-5" />
                                    Resumo do Pedido
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {cartItems.map((nft) => (
                                    <div
                                        key={nft.id}
                                        className="flex gap-4 bg-secondary/30 rounded-xl p-3 border border-border"
                                    >
                                        <div className={`w-14 h-14 rounded-lg bg-gradient-to-br ${rarityColors[nft.raridade]} flex items-center justify-center flex-shrink-0`}>
                                            <span className="text-2xl">{nft.emoji}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-sm">{nft.nome}</h4>
                                            <p className="text-xs text-muted-foreground capitalize">
                                                {nft.raridade} • x{nft.quantidade}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-primary">
                                                R$ {(nft.preco * nft.quantidade).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                ))}

                                <Separator />

                                <div className="flex justify-between items-center text-lg font-bold">
                                    <span>Total</span>
                                    <span className="text-gradient">R$ {totalPriceInBRL.toFixed(2)}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Botão PIX */}
                        <Button
                            className="w-full"
                            size="lg"
                            onClick={handlePayWithPix}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Gerando PIX...
                                </>
                            ) : (
                                <>
                                    <QrCode className="mr-2 h-5 w-5" />
                                    Pagar com PIX
                                </>
                            )}
                        </Button>
                    </div>
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <QrCode className="h-5 w-5 text-primary" />
                                Pague com PIX
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* QR Code */}
                            <div className="flex justify-center">
                                <div className="p-4 bg-white rounded-xl shadow-lg">
                                    <img
                                        src={pixData.qrCode}
                                        alt="QR Code PIX"
                                        className="w-48 h-48"
                                    />
                                </div>
                            </div>

                            {/* Código Copia e Cola */}
                            <div className="space-y-2">
                                <Label>Código Copia e Cola</Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={pixData.copyPasteCode}
                                        readOnly
                                        className="font-mono text-xs"
                                    />
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={handleCopyPixCode}
                                    >
                                        {copied ? (
                                            <Check className="h-4 w-4 text-green-500" />
                                        ) : (
                                            <Copy className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
                                <p className="text-muted-foreground">
                                    <strong className="text-foreground">Valor:</strong> R$ {totalPriceInBRL.toFixed(2)}
                                </p>
                                <p className="text-muted-foreground">
                                    <strong className="text-foreground">Validade:</strong> 30 minutos
                                </p>
                                <p className="text-muted-foreground">
                                    <strong className="text-foreground">ID:</strong> {pixData.transactionId}
                                </p>
                            </div>

                            <div className="text-center text-sm text-muted-foreground">
                                <p>Aguardando confirmação do pagamento...</p>
                                <Loader2 className="h-5 w-5 animate-spin mx-auto mt-2 text-primary" />
                            </div>
                        </CardContent>
                    </Card>
                )}
            </main>
        </div>
    );
};

export default Checkout;
