import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Sparkles, ArrowLeft, Wallet, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { thirdwebClient } from "@/lib/thirdweb";
import { ConnectEmbed } from "thirdweb/react";

const Auth: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showWalletConnect, setShowWalletConnect] = useState(false);

    const { login, register, isAuthenticated, isLoading } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated && !isLoading) {
            navigate("/");
        }
    }, [isAuthenticated, isLoading, navigate]);

    const validateEmail = (email: string) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateEmail(email)) {
            toast({
                title: "Email inválido",
                description: "Por favor, insira um email válido.",
                variant: "destructive",
            });
            return;
        }

        if (password.length < 6) {
            toast({
                title: "Senha muito curta",
                description: "A senha deve ter pelo menos 6 caracteres.",
                variant: "destructive",
            });
            return;
        }

        if (!isLogin && password !== confirmPassword) {
            toast({
                title: "Senhas não coincidem",
                description: "Por favor, verifique as senhas digitadas.",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const result = isLogin
                ? await login(email, password)
                : await register(email, password);

            if (result.success) {
                toast({
                    title: isLogin ? "Bem-vindo de volta!" : "Conta criada com sucesso!",
                    description: isLogin
                        ? "Login realizado com sucesso."
                        : "Agora você pode conectar sua carteira digital.",
                });

                if (!isLogin) {
                    setShowWalletConnect(true);
                }
            } else {
                toast({
                    title: "Erro",
                    description: result.error || "Ocorreu um erro. Tente novamente.",
                    variant: "destructive",
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (showWalletConnect) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <div className="bg-gradient-hero absolute inset-0 opacity-50" />

                <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-4">
                    <div className="w-full max-w-md">
                        <div className="text-center mb-8">
                            <div className="flex items-center justify-center gap-2 mb-4">
                                <span className="text-4xl">🎰</span>
                                <Sparkles className="h-6 w-6 text-primary animate-pulse" />
                            </div>
                            <h1 className="text-2xl font-bold text-foreground mb-2">
                                Conecte sua Carteira Digital
                            </h1>
                            <p className="text-muted-foreground">
                                Para armazenar seus NFTs, conecte ou crie uma carteira digital
                            </p>
                        </div>

                        <div className="bg-card border border-border rounded-xl p-6 shadow-elevated">
                            <div className="flex items-center gap-3 mb-6 p-4 bg-secondary/50 rounded-lg">
                                <Wallet className="h-5 w-5 text-primary" />
                                <p className="text-sm text-muted-foreground">
                                    Uma carteira será criada automaticamente para você
                                </p>
                            </div>

                            <ConnectEmbed
                                client={thirdwebClient}
                                modalSize="compact"
                                theme="dark"
                                style={{ width: "100%" }}
                            />

                            <Button
                                variant="ghost"
                                className="w-full mt-4"
                                onClick={() => navigate("/")}
                            >
                                Pular por enquanto
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <div className="bg-gradient-hero absolute inset-0 opacity-50" />

            <div className="relative z-10 p-4">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate("/")}
                    className="gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Voltar
                </Button>
            </div>

            <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <span className="text-4xl">🎰</span>
                            <Sparkles className="h-6 w-6 text-primary animate-pulse" />
                        </div>
                        <h1 className="text-3xl font-black text-gradient mb-2">LuckyNFT</h1>
                        <p className="text-muted-foreground">
                            {isLogin
                                ? "Bem-vindo de volta! Entre na sua conta"
                                : "Crie sua conta e ganhe uma carteira digital"}
                        </p>
                    </div>

                    <div className="bg-card border border-border rounded-xl p-6 shadow-elevated">
                        <div className="flex gap-2 mb-6">
                            <Button
                                variant={isLogin ? "default" : "ghost"}
                                className="flex-1"
                                onClick={() => setIsLogin(true)}
                            >
                                Entrar
                            </Button>
                            <Button
                                variant={!isLogin ? "default" : "ghost"}
                                className="flex-1"
                                onClick={() => setIsLogin(false)}
                            >
                                Cadastrar
                            </Button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="seu@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-10"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Senha</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-10 pr-10"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {!isLogin && (
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="confirmPassword"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="pl-10"
                                            required
                                        />
                                    </div>
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Aguarde...
                                    </>
                                ) : isLogin ? (
                                    "Entrar"
                                ) : (
                                    "Criar Conta"
                                )}
                            </Button>
                        </form>

                        {!isLogin && (
                            <div className="mt-6 p-4 bg-secondary/50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Wallet className="h-5 w-5 text-primary shrink-0" />
                                    <p className="text-sm text-muted-foreground">
                                        Ao criar sua conta, você receberá uma carteira digital para armazenar seus NFTs
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Auth;
