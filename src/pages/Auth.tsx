import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Sparkles, ArrowLeft, Wallet, Loader2, ChevronRight, LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { thirdwebClient } from "@/lib/thirdweb";
import { ConnectEmbed } from "thirdweb/react";
import { GoogleLogin } from "@react-oauth/google";

interface AuthProps {
    defaultTab?: "login" | "register";
}

// ─── Input component helper (extracted from Register.tsx) ───────────
const Field: React.FC<{
    icon: React.ReactNode; label: string; id: string; placeholder: string;
    value: string; onChange: (v: string) => void; type?: string; rightIcon?: React.ReactNode;
    autoComplete?: string;
}> = ({ icon, label, id, placeholder, value, onChange, type = "text", rightIcon, autoComplete }) => (
    <div className="space-y-1.5">
        <Label htmlFor={id} className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">{label}</Label>
        <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</span>
            <input
                id={id} type={type} placeholder={placeholder} value={value}
                onChange={e => onChange(e.target.value)}
                autoComplete={autoComplete}
                className="w-full h-12 pl-11 pr-4 rounded-xl border border-input bg-background/50 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm font-medium"
            />
            {rightIcon && <span className="absolute right-3 top-1/2 -translate-y-1/2">{rightIcon}</span>}
        </div>
    </div>
);

const Auth: React.FC<AuthProps> = ({ defaultTab = "login" }) => {
    const [isLogin, setIsLogin] = useState(defaultTab === "login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showWalletConnect, setShowWalletConnect] = useState(false);

    const { login, register, googleLogin, isAuthenticated, isLoading } = useAuth();
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

    const handleGoogleSuccess = async (credentialResponse: any) => {
        try {
            const result = await googleLogin(credentialResponse.credential!);
            if (result.success) {
                navigate("/");
            }
        } catch (error) {
            console.error("AuthPage: Login error", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateEmail(email)) {
            toast.error("Email inválido", { description: "Por favor, insira um email válido." });
            return;
        }

        if (password.length < 6) {
            toast.error("Senha muito curta", { description: "A senha deve ter pelo menos 6 caracteres." });
            return;
        }

        if (!isLogin && password !== confirmPassword) {
            toast.error("Senhas não coincidem", { description: "Por favor, verifique as senhas digitadas." });
            return;
        }

        setIsSubmitting(true);

        try {
            const result = isLogin
                ? await login(email, password)
                : await register(email, password);

            if (result.success) {
                if (!isLogin) {
                    setShowWalletConnect(true);
                }
            } else {
                if (!result.error) toast.error("Ocorreu um erro", { description: "Tente novamente." });
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
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 font-sans">
                <div className="bg-gradient-hero absolute inset-0 opacity-20 pointer-events-none" />

                <div className="w-full max-w-md relative z-10">
                    <div className="text-center mb-8 space-y-2">
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <Sparkles className="h-8 w-8 text-primary animate-pulse" />
                        </div>
                        <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
                            Conecte sua Carteira Digital
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Para armazenar seus NFTs, conecte ou crie uma carteira digital
                        </p>
                    </div>

                    <div className="bg-card/50 backdrop-blur-sm rounded-2xl shadow-lg border border-border p-6 sm:p-8">
                        <div className="flex items-center gap-3 mb-6 p-4 bg-primary/10 rounded-xl border border-primary/20">
                            <Wallet className="h-5 w-5 text-primary" />
                            <p className="text-sm text-primary font-medium">
                                Uma carteira será criada automaticamente para você
                            </p>
                        </div>

                        <ConnectEmbed
                            client={thirdwebClient}
                            modalSize="compact"
                            theme="dark"
                            style={{ width: "100%", borderRadius: "12px", overflow: "hidden" }}
                        />

                        <button
                            onClick={() => navigate("/")}
                            className="w-full mt-6 text-sm text-muted-foreground hover:text-foreground font-medium py-2 transition-colors border-b border-transparent hover:border-foreground/20"
                        >
                            Pular por enquanto
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col font-sans">
            <div className="bg-gradient-hero absolute inset-0 opacity-20 pointer-events-none" />

            {/* Back Button */}
            <div className="relative z-10 p-6">
                <button
                    onClick={() => navigate("/")}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium bg-card/50 px-4 py-2 rounded-full border border-border hover:bg-accent/10"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Voltar
                </button>
            </div>

            <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 -mt-16">
                <div className="w-full max-w-md">
                    {/* Header */}
                    <div className="text-center mb-8 space-y-2">
                        <h1 className="text-3xl font-black text-foreground tracking-tight">Mission Gear Hub</h1>
                        <p className="text-muted-foreground text-sm font-medium">
                            {isLogin
                                ? "Bem-vindo de volta! Entre na sua conta"
                                : "Crie sua conta e ganhe uma carteira digital"}
                        </p>
                    </div>

                    {/* Card */}
                    <div className="bg-card/50 backdrop-blur-sm rounded-2xl shadow-lg border border-border p-6 sm:p-8">
                        {/* Tabs */}
                        <div className="flex gap-2 mb-8 p-1 bg-background/50 rounded-xl border border-input">
                            <button
                                onClick={() => setIsLogin(true)}
                                className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${isLogin
                                    ? "bg-primary text-primary-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground hover:bg-accent/10"
                                    }`}
                            >
                                <LogIn className="w-4 h-4" /> Entrar
                            </button>
                            <button
                                onClick={() => setIsLogin(false)}
                                className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${!isLogin
                                    ? "bg-primary text-primary-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground hover:bg-accent/10"
                                    }`}
                            >
                                <UserPlus className="w-4 h-4" /> Cadastrar
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Field
                                icon={<Mail className="w-4 h-4" />}
                                label="Email"
                                id="email"
                                placeholder="seu@email.com"
                                value={email}
                                onChange={setEmail}
                                type="email"
                                autoComplete="username"
                            />

                            <Field
                                icon={<Lock className="w-4 h-4" />}
                                label="Senha"
                                id="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={setPassword}
                                type={showPassword ? "text" : "password"}
                                autoComplete={isLogin ? "current-password" : "new-password"}
                                rightIcon={
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-muted-foreground hover:text-foreground transition-colors">
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                }
                            />

                            {!isLogin && (
                                <Field
                                    icon={<Lock className="w-4 h-4" />}
                                    label="Confirmar Senha"
                                    id="confirmPassword"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={setConfirmPassword}
                                    type={showPassword ? "text" : "password"}
                                />
                            )}

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full h-13 rounded-xl bg-primary text-primary-foreground font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-[0.98] transition-all shadow-glow disabled:opacity-50 py-3.5"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Aguarde...
                                        </>
                                    ) : isLogin ? (
                                        <>ENTRAR AGORA <ChevronRight className="w-4 h-4" /></>
                                    ) : (
                                        <>CRIAR CONTA GRÁTIS <Sparkles className="w-4 h-4" /></>
                                    )}
                                </button>
                            </div>
                        </form>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-border" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-card px-3 text-muted-foreground font-semibold">Ou continue com</span>
                            </div>
                        </div>

                        <div className="flex justify-center">
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={() => toast.error("Erro Google")}
                                width={340}
                                theme="filled_black"
                                shape="pill"
                            />
                        </div>

                        {!isLogin && (
                            <div className="mt-6 p-4 bg-primary/5 rounded-xl border border-primary/20">
                                <div className="flex items-start gap-3">
                                    <Wallet className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        <span className="font-semibold text-primary">Bônus:</span> Ao criar sua conta, você receberá uma carteira digital segura para armazenar seus NFTs automaticamente.
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
