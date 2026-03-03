import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, ArrowRight, Wallet, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import confetti from "canvas-confetti";

const CheckoutSuccess: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Trigger a beautiful confetti explosion when the page loads
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti(Object.assign({}, defaults, {
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
                colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff']
            }));
            confetti(Object.assign({}, defaults, {
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
                colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff']
            }));
        }, 250);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background glowing effects */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] -z-10 pointer-events-none" />

            <Card className="max-w-md w-full border-border/50 bg-secondary/30 backdrop-blur-xl shadow-2xl relative z-10 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 via-primary to-blue-500" />
                <CardContent className="pt-10 pb-8 px-6 flex flex-col items-center text-center space-y-6">

                    <div className="relative">
                        <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full" />
                        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-green-400 to-green-600 p-[2px] relative z-10">
                            <div className="w-full h-full bg-background rounded-full flex items-center justify-center">
                                <CheckCircle2 className="w-10 h-10 text-green-500" />
                            </div>
                        </div>
                        <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400 animate-pulse" />
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-3xl font-extrabold tracking-tight text-gradient">Pagamento Aprovado!</h1>
                        <p className="text-muted-foreground">
                            Que incrível! Seus NFTs exclusivos já foram transferidos com sucesso para a sua carteira digital.
                        </p>
                    </div>

                    <div className="w-full bg-background/50 rounded-xl p-4 border border-white/5 flex items-center gap-4 text-left">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Wallet className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <p className="font-semibold text-sm">Pronto para visualizar?</p>
                            <p className="text-xs text-muted-foreground">Acesse seu perfil para exibir suas novas aquisições na galeria.</p>
                        </div>
                    </div>

                    <div className="pt-4 w-full flex flex-col gap-3">
                        <Button
                            className="w-full h-12 text-md font-semibold bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
                            onClick={() => navigate('/profile')}
                        >
                            Ver Meus NFTs
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                        <Button
                            variant="ghost"
                            className="w-full"
                            onClick={() => navigate('/')}
                        >
                            Voltar para o Início
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default CheckoutSuccess;
