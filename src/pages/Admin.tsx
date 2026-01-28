import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Lock, Plus, RefreshCw, LayoutDashboard, Trash2, Users, ArrowLeft, Coins, Trophy } from "lucide-react";
import RaffleCard from "@/components/RaffleCard";
import { Raffle } from "@/types/raffle";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Roulette from "@/components/Roulette";
import { Button } from "@/components/ui/button";

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

type ViewMode = 'dashboard' | 'create' | 'participants';

const Admin = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState("");

    useEffect(() => {
        console.log("Admin Dashboard v2.0 - Fix Applied");
    }, []);

    const [isLoading, setIsLoading] = useState(false);
    const [view, setView] = useState<ViewMode>('dashboard');
    const [raffles, setRaffles] = useState<Raffle[]>([]);
    const [selectedRaffle, setSelectedRaffle] = useState<Raffle | null>(null);
    const [participants, setParticipants] = useState<any[]>([]);
    const [showRoulette, setShowRoulette] = useState(false);
    const [winnerId, setWinnerId] = useState<number | null>(null);

    const handlePerformDraw = () => {
        if (!selectedRaffle) return;
        setWinnerId(null);
        setShowRoulette(true);
    };

    const confirmDraw = async () => {
        if (!selectedRaffle) return;
        try {
            const data = await api.drawRaffle(password, selectedRaffle.id);
            setWinnerId(data.winner.id);
            toast.success(`Resultado recebido! Girando...`);
        } catch (error) {
            toast.error("Erro ao realizar sorteio");
            setShowRoulette(false);
        }
    };

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

    // Login Handler
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.verifyAdmin(password);
            setIsAuthenticated(true);
            toast.success("Bem-vindo, Administrador!");
            fetchRaffles();
        } catch (error) {
            toast.error("Senha incorreta");
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch Raffles
    const fetchRaffles = async () => {
        try {
            const data = await api.getAdminRaffles();
            setRaffles(data);
        } catch (error) {
            console.error(error);
            toast.error("Erro ao carregar sorteios.");
        }
    };

    // Create or Update Raffle
    const handleSubmit = async () => {
        if (!formData.title || !formData.ticket_price || !formData.image_url) {
            toast.error("Preencha os campos obrigatórios");
            return;
        }

        setIsLoading(true);
        try {
            if (selectedRaffle) {
                // UPDATE
                await api.updateRaffle(password, selectedRaffle.id, {
                    ...formData,
                    status: selectedRaffle.status === 'ativo' ? 'active' : selectedRaffle.status
                });
                toast.success("Sorteio atualizado com sucesso!");
            } else {
                // CREATE
                await api.createRaffle(password, {
                    ...formData,
                    status: 'active'
                });
                toast.success("Sorteio criado com sucesso!");
            }

            resetForm();
            setView('dashboard');
            fetchRaffles();
        } catch (error) {
            toast.error("Erro ao salvar sorteio");
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setSelectedRaffle(null);
        setFormData({
            title: "",
            description: "",
            image_url: "",
            ticket_price: 10,
            prize_pool: "",
            max_tickets: 1000,
            prize_value: 0,
            draw_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            category: "tech",
            rarity: "comum"
        });
    };

    const handleEdit = (raffle: Raffle, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedRaffle(raffle);
        setFormData({
            title: raffle.titulo,
            description: raffle.descricao,
            image_url: raffle.imagem,
            ticket_price: raffle.custoNFT,
            prize_pool: raffle.premio,
            max_tickets: raffle.maxParticipantes,
            prize_value: raffle.premioValor,
            draw_date: raffle.dataFim,
            category: raffle.categoria,
            rarity: raffle.raridade
        });
        setView('create');
    };

    // ... (rest of code) ...

    const renderCreate = () => (
        <div className="grid lg:grid-cols-2 gap-12 items-start animate-fade-in">
            <div className="bg-card rounded-3xl p-8 border border-white/5 shadow-2xl space-y-6">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => { setView('dashboard'); resetForm(); }}>
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <h2 className="text-2xl font-bold">{selectedRaffle ? 'Editar Sorteio' : 'Novo Sorteio'}</h2>
                    </div>
                    <span className="text-xs font-mono bg-primary/10 text-primary px-2 py-1 rounded">
                        {selectedRaffle ? 'EDITING' : 'DRAFT'}
                    </span>
                </div>

                {/* ... existing form inputs ... */}

                {/* (Keeping the inputs as they are, just changing the button at the bottom) */}
                <div className="grid gap-6">
                    {/* ... inputs ... */}

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

                    <div className="space-y-3">
                        <Label>Imagem do Prêmio</Label>

                        <div className="flex gap-4 items-start">
                            <div className="flex-1 space-y-2">
                                <Input
                                    value={formData.image_url}
                                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                    placeholder="https://... ou faça upload"
                                    className="bg-background/50 font-mono text-xs"
                                />
                                <p className="text-[10px] text-muted-foreground">Cole uma URL ou envie um arquivo local.</p>
                            </div>

                            <div className="relative">
                                <input
                                    type="file"
                                    id="image-upload"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            if (file.size > 5000000) {
                                                toast.error("Imagem muito grande! Máximo 5MB.");
                                                return;
                                            }
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                                setFormData(prev => ({ ...prev, image_url: reader.result as string }));
                                                toast.success("Imagem carregada!");
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                />
                                <Button type="button" variant="outline" onClick={() => document.getElementById('image-upload')?.click()}>
                                    Upload 📸
                                </Button>
                            </div>
                        </div>
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
                            <Label>Data e Hora do Sorteio</Label>
                            <div className="flex gap-2">
                                <Input
                                    type="date"
                                    value={formData.draw_date ? formData.draw_date.split('T')[0] : ''}
                                    onChange={(e) => {
                                        const newDate = e.target.value;
                                        const currentTime = formData.draw_date ? formData.draw_date.split('T')[1]?.split('.')[0] || '00:00:00' : '00:00:00';
                                        setFormData({ ...formData, draw_date: `${newDate}T${currentTime}` });
                                    }}
                                    className="bg-background/50 flex-1"
                                />
                                <Input
                                    type="time"
                                    value={formData.draw_date ? formData.draw_date.split('T')[1]?.substring(0, 5) : '00:00'}
                                    onChange={(e) => {
                                        const newTime = e.target.value; // HH:mm
                                        const currentDate = formData.draw_date ? formData.draw_date.split('T')[0] : new Date().toISOString().split('T')[0];
                                        setFormData({ ...formData, draw_date: `${currentDate}T${newTime}:00.000Z` });
                                    }}
                                    className="bg-background/50 w-32"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Categoria</Label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full h-10 px-3 rounded-md border border-input bg-background/50 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                <option value="tech">Tech & Eletrônicos</option>
                                <option value="giftcard">Gift Cards & Vouchers</option>
                                <option value="games">Games & Consoles</option>
                                <option value="viagens">Viagens & Experiências</option>
                                <option value="outros">Outros</option>
                            </select>
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
                        onClick={handleSubmit}
                        size="lg"
                        className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 shadow-xl shadow-primary/20 h-14 text-lg font-bold"
                        disabled={isLoading}
                    >
                        {selectedRaffle ? <RefreshCw className="w-5 h-5 mr-2" /> : <Plus className="w-5 h-5 mr-2" />}
                        {isLoading ? "Salvando..." : (selectedRaffle ? "Atualizar Sorteio" : "Publicar Sorteio")}
                    </Button>
                </div>
            </div>
        </div>
    );

    // Delete Raffle
    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Tem certeza que deseja DELETAR este sorteio? Isso apagará todos os tickets vendidos.")) return;

        try {
            await api.deleteRaffle(password, id);
            toast.success("Sorteio deletado.");
            fetchRaffles();
        } catch (error) {
            toast.error("Erro ao deletar sorteio");
        }
    };

    // View Participants
    const handleViewParticipants = async (raffle: Raffle, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedRaffle(raffle);
        setIsLoading(true);
        try {
            const data = await api.getRaffleParticipants(raffle.id);
            setParticipants(data);
            setView('participants');
        } catch (error) {
            toast.error("Erro ao carregar participantes");
        } finally {
            setIsLoading(false);
        }
    };

    // --- RENDER HELPERS ---

    const renderLogin = () => (
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
                    <Button type="submit" className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all" disabled={isLoading}>
                        {isLoading ? "Verificando..." : "Entrar no Painel"}
                    </Button>
                </form>
            </div>
        </div>
    );

    const renderDashboard = () => (
        <div className="space-y-8 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Visão Geral</h2>
                    <p className="text-muted-foreground">Gerencie seus sorteios ativos e encerrados.</p>
                </div>
                <Button onClick={() => { setView('create'); resetForm(); }} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
                    <Plus className="w-5 h-5 mr-2" />
                    Criar Nova Rifa
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {raffles.map((raffle) => (
                    <div key={raffle.id} className="relative group">
                        {/* Card with Hover Actions */}
                        <div className="absolute top-4 right-4 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <Button size="icon" variant="secondary" className="bg-white/90 text-black hover:bg-white" onClick={(e) => handleEdit(raffle, e)} title="Editar Sorteio">
                                <RefreshCw className="w-4 h-4" /> {/* Using Refresh for now or switch to Pencil */}
                            </Button>
                            <Button size="icon" variant="secondary" className="bg-white/90 text-black hover:bg-white" onClick={(e) => handleViewParticipants(raffle, e)} title="Ver Participantes">
                                <Users className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="destructive" onClick={(e) => handleDelete(raffle.id, e)} title="Deletar Sorteio">
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                        <RaffleCard raffle={raffle} index={0} />
                    </div>
                ))}
            </div>
        </div>
    );

    const renderParticipants = () => {
        // Aggregate participants
        const aggregated = participants.reduce((acc: any, curr: any) => {
            if (!acc[curr.user_id]) {
                acc[curr.user_id] = {
                    ...curr,
                    ticket_count: 0
                };
            }
            acc[curr.user_id].ticket_count += 1;
            return acc;
        }, {});
        const userList = Object.values(aggregated);

        return (
            <div className="space-y-8 animate-fade-in">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => setView('dashboard')}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h2 className="text-2xl font-bold">Participantes</h2>
                        <p className="text-muted-foreground">Sorteio: {selectedRaffle?.titulo}</p>
                    </div>
                    {selectedRaffle?.status === 'ativo' && (
                        <Button
                            className="ml-auto bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold shadow-lg shadow-orange-500/20"
                            onClick={handlePerformDraw}
                        >
                            <Trophy className="w-5 h-5 mr-2" />
                            Realizar Sorteio
                        </Button>
                    )}
                </div>

                <div className="bg-card rounded-xl border border-border overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Usuário</TableHead>
                                <TableHead className="text-right">Bilhetes</TableHead>
                                <TableHead className="text-right">Valor Estimado (R$)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {userList.map((user: any) => (
                                <TableRow key={user.user_id}>
                                    <TableCell className="flex items-center gap-3">
                                        <Avatar className="w-8 h-8">
                                            <AvatarImage src={user.picture} />
                                            <AvatarFallback>{user.name?.[0] || "?"}</AvatarFallback>
                                        </Avatar>
                                        <div className="font-medium">{user.name}</div>
                                    </TableCell>
                                    <TableCell className="text-right font-bold text-lg">{user.ticket_count}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1 text-primary font-bold">
                                            R$ {(user.ticket_count * (selectedRaffle?.custoNFT || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {userList.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                        Nenhum participante ainda.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        );
    };

    if (!isAuthenticated) return renderLogin();

    return (
        <div className="min-h-screen p-6 lg:p-12 space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="space-y-1">
                    <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
                        <LayoutDashboard className="w-8 h-8 text-primary" />
                        Admin Dashboard
                    </h1>
                </div>
                <div className="flex gap-4">
                    <span className="text-sm text-muted-foreground self-center">Modo Editor</span>
                    <Button variant="outline" onClick={() => setIsAuthenticated(false)}>Sair</Button>
                </div>
            </div>

            {view === 'dashboard' && renderDashboard()}
            {view === 'create' && renderCreate()}
            {view === 'participants' && renderParticipants()}

            {showRoulette && selectedRaffle && (
                <Roulette
                    candidates={participants.reduce((acc: any[], p: any) => {
                        const existing = acc.find(c => c.id === p.user_id);
                        if (existing) {
                            existing.ticket_count++;
                        } else {
                            acc.push({
                                id: p.user_id,
                                name: p.name,
                                picture: p.picture,
                                ticket_count: 1
                            });
                        }
                        return acc;
                    }, [])}
                    winnerId={winnerId}
                    onSpinStart={confirmDraw}
                    onFinished={() => fetchRaffles()}
                    onClose={() => {
                        setShowRoulette(false);
                        setView('dashboard');
                    }}
                />
            )}
        </div>
    );
};

export default Admin;
