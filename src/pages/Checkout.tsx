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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";

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
    const { cartItems, getTotalNFTs, addNFT, buyNFTs, clearCart, ownedNFTs } = useWallet();
    const { toast } = useToast();
    const { user, login } = useAuth(); // Need login to refresh user data if profile updates

    const [isLoading, setIsLoading] = useState(false);
    const [pixData, setPixData] = useState<PixPayment | null>(null);
    const [copied, setCopied] = useState(false);

    // Coupon State (Restored)
    const [couponCode, setCouponCode] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number; type: string } | null>(null);
    const [couponLoading, setCouponLoading] = useState(false);

    const totalNFTs = getTotalNFTs();
    const totalPrice = cartItems.reduce((sum, nft) => sum + nft.preco * nft.quantidade, 0);

    // Recalculate totals
    const itemsTotal = appliedCoupon ? Math.max(0, totalPrice - appliedCoupon.discount) : totalPrice;
    const finalPrice = itemsTotal; // No shipping cost

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        setCouponLoading(true);
        try {
            const res = await api.validateCoupon(couponCode, totalPrice);
            setAppliedCoupon({
                code: res.coupon.code,
                discount: res.discount,
                type: res.coupon.type
            });
            toast({
                title: "Cupom aplicado!",
                description: `Desconto de R$ ${res.discount.toFixed(2)}`,
            });
        } catch (error: any) {
            setAppliedCoupon(null);
            toast({
                title: "Erro no cupom",
                description: error.message || "Cupom inválido",
                variant: "destructive"
            });
        } finally {
            setCouponLoading(false);
        }
    };

    const handlePayWithPix = async () => {
        if (!user) {
            toast({ title: "Login necessário", description: "Faça login para continuar.", variant: "destructive" });
            navigate("/login");
            return;
        }

        setIsLoading(true);

        // Simulação de resposta (MOCK para Sicoob futuro)
        setTimeout(async () => {
            setPixData({
                qrCode: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=00020126580014br.gov.bcb.pix0136exemplo-pix-luckynft5204000053039865802BR5913LUCKYNFT6008SAOPAULO62070503***6304ABCD",
                qrCodeBase64: "",
                copyPasteCode: "00020126580014br.gov.bcb.pix0136exemplo-pix-luckynft5204000053039865802BR5913LUCKYNFT6008SAOPAULO62070503***6304ABCD",
                expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
                transactionId: `txn_${Date.now()}`,
            });
            setIsLoading(false);

            // Simular aprovação automática para teste
            toast({
                title: "Aguardando Pagamento",
                description: "Realize o pagamento do PIX para liberar seus NFTs.",
            });

            // Aqui poderíamos ter um botão "Simular Pagamento Confirmado" na UI para testes
        }, 1500);
    };

    // Função de teste para simular o callback de sucesso
    const simulateSuccessfulPayment = async () => {
        try {
            const itemsToBuy = cartItems.map(item => ({ id: item.id, quantity: item.quantidade }));
            // Pass couponCode if applied
            await buyNFTs(itemsToBuy, appliedCoupon?.code);

            clearCart();
            toast({
                title: "Compra realizada com sucesso!",
                description: "Seus NFTs foram adicionados à sua carteira.",
            });
            navigate("/profile");
        } catch (error) {
            toast({
                title: "Erro na compra",
                description: "Não foi possível finalizar a compra. Tente novamente.",
                variant: "destructive"
            });
        }
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

                                {/* Shipping Section Removed */}

                                <Separator />

                                {/* Coupon Input */}
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Cupom de desconto"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                        disabled={!!appliedCoupon || isLoading || !!pixData}
                                    />
                                    {appliedCoupon ? (
                                        <Button variant="destructive" onClick={() => { setAppliedCoupon(null); setCouponCode(""); }}>
                                            Remover
                                        </Button>
                                    ) : (
                                        <Button onClick={handleApplyCoupon} disabled={!couponCode || couponLoading || !!pixData}>
                                            {couponLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Aplicar"}
                                        </Button>
                                    )}
                                </div>

                                {appliedCoupon && (
                                    <div className="flex justify-between text-green-400 font-medium text-sm">
                                        <span>Desconto ({appliedCoupon.code})</span>
                                        <span>- R$ {appliedCoupon.discount.toFixed(2)}</span>
                                    </div>
                                )}

                                <Separator className="bg-white/10" />

                                <div className="space-y-1">
                                    <div className="flex justify-between text-sm text-muted-foreground">
                                        <span>Subtotal</span>
                                        <span>R$ {totalPrice.toFixed(2)}</span>
                                    </div>

                                    <div className="flex justify-between items-center text-lg font-bold pt-2">
                                        <span>Total</span>
                                        <span className={appliedCoupon ? "text-primary" : "text-gradient"}>
                                            R$ {finalPrice.toFixed(2)}
                                        </span>
                                    </div>
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

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">
                                    Copia e Cola
                                </label>
                                <div className="flex gap-2">
                                    <Input
                                        value={pixData.copyPasteCode}
                                        readOnly
                                        className="bg-secondary/50 font-mono text-xs"
                                    />
                                    <Button size="icon" variant="outline" onClick={handleCopyPixCode}>
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
                                    <strong className="text-foreground">Valor:</strong> R$ {finalPrice.toFixed(2)}
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

                            <Separator />

                            <Button
                                variant="outline"
                                className="w-full border-dashed"
                                onClick={simulateSuccessfulPayment}
                            >
                                Simular Pagamento Confirmado (Teste)
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </main>
        </div>
    );
};

export default Checkout;
