import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useWallet } from "@/contexts/WalletContext";
import { useUserRaffles } from "@/contexts/UserRafflesContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    ArrowLeft,
    User,
    Mail,
    Wallet,
    Ticket,
    Trophy,
    Calendar,
    Copy,
    Check,
    LogOut,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const rarityColors: Record<string, string> = {
    comum: "from-gray-400 to-gray-500",
    raro: "from-blue-400 to-cyan-400",
    epico: "from-purple-500 to-pink-500",
    lendario: "from-yellow-400 to-orange-500",
};

const rarityLabels: Record<string, string> = {
    comum: "Comum",
    raro: "Raro",
    epico: "Épico",
    lendario: "Lendário",
};

const Profile = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { ownedNFTs, getTotalNFTs } = useWallet();
    const { userRaffles } = useUserRaffles();
    const [copied, setCopied] = useState(false);

    const isAuthenticated = !!user;

    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/auth");
        }
    }, [isAuthenticated, navigate]);

    const handleCopyWallet = () => {
        if (user?.walletAddress) {
            navigator.clipboard.writeText(user.walletAddress);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    if (!isAuthenticated || !user) {
        return null;
    }

    const totalNFTs = getTotalNFTs();
    const totalRaffles = userRaffles.length;
    const activeRaffles = userRaffles.filter(
        (ur) => new Date(ur.raffle.dataFim) > new Date()
    ).length;

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <Button
                        variant="ghost"
                        onClick={() => navigate("/")}
                        className="gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Voltar
                    </Button>
                    <h1 className="text-xl font-bold text-gradient">Minha Conta</h1>
                    <Button variant="ghost" onClick={handleLogout} className="gap-2 text-destructive">
                        <LogOut className="h-4 w-4" />
                        Sair
                    </Button>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 space-y-8">
                {/* User Info Card */}
                <Card className="bg-card border-border overflow-hidden">
                    <div className="h-24 bg-gradient-primary opacity-20" />
                    <CardContent className="relative pt-0 pb-6 -mt-12">
                        <div className="flex flex-col md:flex-row items-start md:items-end gap-4">
                            <Avatar className="w-24 h-24 rounded-full border-4 border-background shadow-glow">
                                <AvatarImage src={user?.picture} alt={user?.name || "User"} />
                                <AvatarFallback className="text-4xl bg-gradient-primary text-primary-foreground">
                                    {user?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-2">
                                <h2 className="text-2xl font-bold text-foreground">
                                    {user.name || user.email.split("@")[0]}
                                </h2>
                                <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4" />
                                        <span className="text-sm">{user.email}</span>
                                    </div>
                                    {user.walletAddress && (
                                        <div className="flex items-center gap-2">
                                            <Wallet className="h-4 w-4" />
                                            <span className="text-sm font-mono">
                                                {user.walletAddress.slice(0, 6)}...
                                                {user.walletAddress.slice(-4)}
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={handleCopyWallet}
                                                className="h-6 w-6 p-0"
                                            >
                                                {copied ? (
                                                    <Check className="h-3 w-3 text-primary" />
                                                ) : (
                                                    <Copy className="h-3 w-3" />
                                                )}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="bg-card border-border">
                        <CardContent className="p-4 text-center">
                            <div className="text-3xl font-bold text-gradient">{totalNFTs}</div>
                            <p className="text-sm text-muted-foreground">NFTs</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-card border-border">
                        <CardContent className="p-4 text-center">
                            <div className="text-3xl font-bold text-gradient">{totalRaffles}</div>
                            <p className="text-sm text-muted-foreground">Sorteios</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-card border-border">
                        <CardContent className="p-4 text-center">
                            <div className="text-3xl font-bold text-gradient">{activeRaffles}</div>
                            <p className="text-sm text-muted-foreground">Ativos</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-card border-border">
                        <CardContent className="p-4 text-center">
                            <div className="text-3xl font-bold text-gradient">0</div>
                            <p className="text-sm text-muted-foreground">Prêmios</p>
                        </CardContent>
                    </Card>
                </div>

                {/* My Raffles Section */}
                <Card className="bg-card border-border">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Ticket className="h-5 w-5 text-primary" />
                            Meus Sorteios
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {userRaffles.length === 0 ? (
                            <div className="text-center py-8">
                                <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                <p className="text-muted-foreground">
                                    Você ainda não participa de nenhum sorteio
                                </p>
                                <Button
                                    variant="default"
                                    className="mt-4 bg-gradient-primary"
                                    onClick={() => navigate("/")}
                                >
                                    Explorar Sorteios
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {userRaffles.map((ur) => {
                                    const isActive = new Date(ur.raffle.dataFim) > new Date();
                                    return (
                                        <div
                                            key={ur.raffle.id}
                                            className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50 border border-border"
                                        >
                                            <img
                                                src={ur.raffle.imagem}
                                                alt={ur.raffle.titulo}
                                                className="w-16 h-16 rounded-lg object-cover"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-foreground truncate">
                                                    {ur.raffle.titulo}
                                                </h4>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Calendar className="h-3 w-3" />
                                                    <span>
                                                        Termina em{" "}
                                                        {format(new Date(ur.raffle.dataFim), "dd/MM/yyyy", {
                                                            locale: ptBR,
                                                        })}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right flex flex-col items-end gap-2">
                                                <div className="flex gap-2">
                                                    <Badge
                                                        variant={isActive ? "default" : "secondary"}
                                                        className={isActive ? "bg-primary text-primary-foreground" : ""}
                                                    >
                                                        {isActive ? "Ativo" : "Encerrado"}
                                                    </Badge>

                                                    {/* Winner Badge */}
                                                    {!isActive && ur.raffle.winner_id && String(ur.raffle.winner_id) === String(user.id) && (
                                                        <Badge className="bg-yellow-500 text-black border-yellow-600 animate-pulse">
                                                            🏆 Você Ganhou!
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {ur.ticketsComprados} ticket
                                                    {ur.ticketsComprados > 1 ? "s" : ""}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* My NFTs Section */}
                <Card className="bg-card border-border">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <span className="text-xl">🎨</span>
                            Meus NFTs
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {ownedNFTs.length === 0 ? (
                            <div className="text-center py-8">
                                <span className="text-5xl mb-4 block">🖼️</span>
                                <p className="text-muted-foreground">
                                    Você ainda não possui nenhum NFT
                                </p>
                                <Button
                                    variant="default"
                                    className="mt-4 bg-gradient-primary"
                                    onClick={() => navigate("/")}
                                >
                                    Comprar NFTs
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {ownedNFTs.map((nft) => (
                                    <div
                                        key={nft.id}
                                        className="relative p-4 rounded-xl bg-secondary/50 border border-border group hover:border-primary/50 transition-colors"
                                    >
                                        <div
                                            className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r ${rarityColors[nft.raridade]} text-white`}
                                        >
                                            {rarityLabels[nft.raridade]}
                                        </div>
                                        <div className="text-5xl mb-3 text-center">{nft.emoji}</div>
                                        <h4 className="font-semibold text-foreground text-center truncate">
                                            {nft.nome}
                                        </h4>
                                        <div className="flex items-center justify-center gap-1 mt-2">
                                            <Badge variant="secondary" className="text-xs">
                                                x{nft.quantidade}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Separator className="bg-border" />

                {/* Account Settings */}
                <Card className="bg-card border-border">
                    <CardHeader>
                        <CardTitle>Configurações da Conta</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border">
                            <div>
                                <p className="font-medium text-foreground">ID do Usuário</p>
                                <p className="text-sm text-muted-foreground font-mono">
                                    {user.id.slice(0, 8)}...
                                </p>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    navigator.clipboard.writeText(user.id);
                                }}
                            >
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border">
                            <div>
                                <p className="font-medium text-foreground">Membro desde</p>
                                <p className="text-sm text-muted-foreground">Janeiro 2026</p>
                            </div>
                            <Calendar className="h-5 w-5 text-muted-foreground" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Profile;
