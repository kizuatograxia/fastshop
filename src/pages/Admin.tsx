import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Lock, Plus, RefreshCw, LayoutDashboard } from "lucide-react";
import RaffleCard from "@/components/RaffleCard";
import { Raffle } from "@/types/raffle";

// Backend expected format
interface CreateRaffleDTO {
    title: string;
    description: string;
    image_url: string;
    ticket_price: number;
    prize_pool: string;
    max_tickets: number;
    prize_value: number;
    draw_date: string;
    category: string;
    rarity: string;
}

const Admin = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Form State for new Raffle
    const [formData, setFormData] = useState<CreateRaffleDTO>({
        title: "",
        description: "",
        image_url: "",
        ticket_price: 10,
        prize_pool: "",
        max_tickets: 1000,
        prize_value: 0,
        draw_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default 1 week
        category: "tech",
        rarity: "comum"
    });

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.verifyAdmin(password);
            setIsAuthenticated(true);
            toast.success("Bem-vindo, Administrador!");
        } catch (error) {
            toast.error("Senha incorreta");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!formData.title || !formData.ticket_price || !formData.image_url) {
            toast.error("Preencha os campos obrigatórios");
            return;
        }

        setIsLoading(true);
        try {
            await api.createRaffle(password, {
                ...formData,
                status: 'active'
            });
            toast.success("Sorteio criado com sucesso!");
            // Reset form
            setFormData({
                title: "",
                description: "",
                image_url: "",
                ticket_price: 10,
                prize_pool: "",
                max_tickets: 1000,
                prize_value: 0,
                draw_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                category: "tech",
                rarity: "comum"
            });
        } catch (error) {
            toast.error("Erro ao criar sorteio");
        } finally {
            setIsLoading(false);
        }
    };

    // Mock raffle for preview
    const previewRaffle: Raffle = {
        id: 999, // Temp ID
        titulo: formData.title || "Título do Sorteio",
        descricao: formData.description || "Descrição incrível do prêmio...",
        imagem: formData.image_url || "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80",
        custoNFT: formData.ticket_price || 10,
        participantes: 0,
        maxParticipantes: formData.max_tickets || 1000,
        dataFim: formData.draw_date || new Date().toISOString(),
        status: "ativo",
        premio: formData.prize_pool || "Prêmio",
        premioValor: formData.prize_value || 0,
        categoria: (formData.category as any) || "tech",
        raridade: (formData.rarity as any) || "comum"
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background/90 to-primary/5">
                <div className="w-full max-w-md space-y-8 animate-fade-in text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4 ring-1 ring-primary/20">
                        <Lock className="w-10 h-10 text-primary" />
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight">Painel Administrativo</h1>
                        <p className="text-muted-foreground">Área restrita. Digite sua senha de acesso.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4 bg-card p-8 rounded-2xl border border-white/5 shadow-2xl backdrop-blur-xl">
                        <div className="space-y-2 text-left">
                            <Label htmlFor="password">Senha de Acesso</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-background/50 border-white/10 h-12 text-lg"
                                placeholder="••••••••"
                                autoFocus
                            />
                        </div>
                        <Button
                            type="submit"
                            className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all"
                            disabled={isLoading}
                        >
                            {isLoading ? "Verificando..." : "Entrar no Painel"}
                        </Button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6 lg:p-12 space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="space-y-1">
                    <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
                        <LayoutDashboard className="w-8 h-8 text-primary" />
                        Gerenciar Sorteios
                    </h1>
                    <p className="text-muted-foreground text-lg">Crie e gerencie os sorteios ativos da plataforma.</p>
                </div>
                <Button variant="outline" onClick={() => setIsAuthenticated(false)}>Sair</Button>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-start">

                {/* Creation Form */}
                <div className="bg-card rounded-3xl p-8 border border-white/5 shadow-2xl space-y-6">
                    <div className="flex items-center justify-between border-b border-white/5 pb-4">
                        <h2 className="text-2xl font-bold">Novo Sorteio</h2>
                        <span className="text-xs font-mono bg-primary/10 text-primary px-2 py-1 rounded">DRAFT</span>
                    </div>

                    <div className="grid gap-6">
                        <div className="space-y-2">
                            <Label>Título do Prêmio</Label>
                            <Input
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Ex: iPhone 15 Pro Max Titanium"
                                className="bg-background/50 text-lg font-medium"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Preço do Ticket (NFTs)</Label>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        value={formData.ticket_price}
                                        onChange={(e) => setFormData({ ...formData, ticket_price: Number(e.target.value) })}
                                        className="bg-background/50 pl-10"
                                    />
                                    <span className="absolute left-3 top-2.5 text-muted-foreground font-bold">💎</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Valor Estimado (R$)</Label>
                                <Input
                                    type="number"
                                    value={formData.prize_value}
                                    onChange={(e) => setFormData({ ...formData, prize_value: Number(e.target.value) })}
                                    className="bg-background/50"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>URL da Imagem</Label>
                            <Input
                                value={formData.image_url}
                                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                placeholder="https://..."
                                className="bg-background/50 font-mono text-xs"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Descrição Detalhada</Label>
                            <Textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Descreva os detalhes do prêmio..."
                                className="bg-background/50 min-h-[120px]"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Data do Sorteio</Label>
                                <Input
                                    type="date"
                                    value={formData.draw_date}
                                    onChange={(e) => setFormData({ ...formData, draw_date: e.target.value })}
                                    className="bg-background/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Max Tickets</Label>
                                <Input
                                    type="number"
                                    value={formData.max_tickets}
                                    onChange={(e) => setFormData({ ...formData, max_tickets: Number(e.target.value) })}
                                    className="bg-background/50"
                                />
                            </div>
                        </div>

                        <Button
                            onClick={handleCreate}
                            size="lg"
                            className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 shadow-xl shadow-primary/20 h-14 text-lg font-bold"
                            disabled={isLoading}
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            {isLoading ? "Criando..." : "Publicar Sorteio"}
                        </Button>
                    </div>
                </div>

                {/* Live Preview */}
                <div className="space-y-6 lg:fixed lg:right-12 lg:top-32 lg:w-[400px]">
                    <div className="flex items-center justify-between text-muted-foreground">
                        <span className="flex items-center gap-2 text-sm uppercase tracking-wider font-bold">
                            <RefreshCw className="w-4 h-4 animate-spin-slow" />
                            Live Preview
                        </span>
                        <span className="text-xs">Visualização em tempo real</span>
                    </div>

                    <div className="transform transition-all hover:scale-105 duration-500">
                        <RaffleCard raffle={previewRaffle} index={0} />
                    </div>

                    <div className="bg-secondary/30 rounded-xl p-4 text-xs text-muted-foreground space-y-2 border border-white/5">
                        <p>ℹ️ <strong>Dica:</strong> Certifique-se de usar imagens de alta qualidade (recomendo Unsplash).</p>
                        <p>ℹ️ O sorteio será publicado como <strong>ATIVO</strong> imediatamente.</p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Admin;
