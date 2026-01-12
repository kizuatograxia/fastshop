
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { GoogleLogin } from "@react-oauth/google";
import Header from "@/components/Header";

interface AuthProps {
    defaultTab?: "login" | "register";
}

const Auth = ({ defaultTab = "login" }: AuthProps) => {
    const navigate = useNavigate();
    const { login, register, googleLogin: loginWithGoogle } = useAuth();
    const [loading, setLoading] = useState(false);

    // Login State
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");

    // Register State
    const [registerEmail, setRegisterEmail] = useState("");
    const [registerPassword, setRegisterPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(loginEmail, loginPassword);
            navigate("/");
        } catch (error: any) {
            toast.error(error.message || "Erro ao entrar");
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (registerPassword !== confirmPassword) {
            toast.error("Senhas não conferem");
            return;
        }
        setLoading(true);
        try {
            await register(registerEmail, registerPassword);
            navigate("/");
        } catch (error: any) {
            toast.error(error.message || "Erro ao registrar");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse: any) => {
        console.log("AuthPage: Google Success callback triggered", credentialResponse);
        try {
            await loginWithGoogle(credentialResponse.credential!);
            console.log("AuthPage: Login successful, navigating to home");
            navigate("/");
        } catch (error) {
            console.error("AuthPage: Login error", error);
            toast.error("Falha no login com Google");
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header onMenuClick={() => { }} onWalletClick={() => { }} />

            <div className="flex-1 flex items-center justify-center p-4">
                <Tabs defaultValue={defaultTab} className="w-full max-w-md">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="login">Entrar</TabsTrigger>
                        <TabsTrigger value="register">Cadastrar</TabsTrigger>
                    </TabsList>

                    <TabsContent value="login">
                        <Card>
                            <CardHeader>
                                <CardTitle>Entrar</CardTitle>
                                <CardDescription>Acesse sua conta para continuar</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <form onSubmit={handleLogin} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="login-email">Email</Label>
                                        <Input
                                            id="login-email"
                                            type="email"
                                            placeholder="seu@email.com"
                                            value={loginEmail}
                                            onChange={(e) => setLoginEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="login-password">Senha</Label>
                                        <Input
                                            id="login-password"
                                            type="password"
                                            value={loginPassword}
                                            onChange={(e) => setLoginPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <Button type="submit" className="w-full" disabled={loading}>
                                        {loading ? "Entrando..." : "Entrar"}
                                    </Button>
                                </form>

                                <div className="relative my-4">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t" />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-background px-2 text-muted-foreground">Ou continue com</span>
                                    </div>
                                </div>

                                <div className="flex justify-center">
                                    <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => toast.error("Erro Google")} />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="register">
                        <Card>
                            <CardHeader>
                                <CardTitle>Criar Conta</CardTitle>
                                <CardDescription>Comece sua jornada hoje</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <form onSubmit={handleRegister} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="reg-email">Email</Label>
                                        <Input
                                            id="reg-email"
                                            type="email"
                                            placeholder="seu@email.com"
                                            value={registerEmail}
                                            onChange={(e) => setRegisterEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="reg-pass">Senha</Label>
                                        <Input
                                            id="reg-pass"
                                            type="password"
                                            value={registerPassword}
                                            onChange={(e) => setRegisterPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirm-pass">Confirmar Senha</Label>
                                        <Input
                                            id="confirm-pass"
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <Button type="submit" className="w-full" disabled={loading}>
                                        {loading ? "Criando..." : "Criar Conta"}
                                    </Button>
                                </form>

                                <div className="relative my-4">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t" />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-background px-2 text-muted-foreground">Ou continue com</span>
                                    </div>
                                </div>

                                <div className="flex justify-center">
                                    <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => toast.error("Erro Google")} />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default Auth;
