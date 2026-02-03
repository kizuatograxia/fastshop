import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Lock } from "lucide-react";
import { Raffle } from "@/types/raffle";
import Roulette from "@/components/Roulette";

// Components
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminStats } from "@/components/admin/AdminStats";
import { RaffleList } from "@/components/admin/RaffleList";
import { RaffleForm, CreateRaffleDTO } from "@/components/admin/RaffleForm";
import { ParticipantsTable } from "@/components/admin/ParticipantsTable";

type ViewMode = 'dashboard' | 'create' | 'participants' | 'raffles' | 'settings';

const Admin = () => {
    // --- AUTH STATE ---
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // --- DATA STATE ---
    const [view, setView] = useState<ViewMode>('dashboard');
    const [raffles, setRaffles] = useState<Raffle[]>([]);
    const [selectedRaffle, setSelectedRaffle] = useState<Raffle | null>(null);
    const [participants, setParticipants] = useState<any[]>([]);

    // --- ROULETTE STATE ---
    const [showRoulette, setShowRoulette] = useState(false);
    const [winnerId, setWinnerId] = useState<number | null>(null);

    useEffect(() => {
        console.log("Admin Dashboard v3.0 - Modular Admin");
    }, []);

    // --- HANDLERS ---

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

    const fetchRaffles = async () => {
        try {
            const data = await api.getAdminRaffles();
            setRaffles(data);
        } catch (error) {
            console.error(error);
            toast.error("Erro ao carregar sorteios.");
        }
    };

    const handleFormSubmit = async (formData: CreateRaffleDTO) => {
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

            setSelectedRaffle(null);
            setView('dashboard');
            fetchRaffles();
        } catch (error) {
            toast.error("Erro ao salvar sorteio");
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (raffle: Raffle) => {
        setSelectedRaffle(raffle);
        setView('create');
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja DELETAR este sorteio? Isso apagará todos os tickets vendidos.")) return;
        try {
            await api.deleteRaffle(password, id);
            toast.success("Sorteio deletado.");
            fetchRaffles();
        } catch (error) {
            toast.error("Erro ao deletar sorteio");
        }
    };

    const handleViewParticipants = async (raffle: Raffle) => {
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

    // --- RENDER LOGIN ---
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
                        <Button type="submit" className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all" disabled={isLoading}>
                            {isLoading ? "Verificando..." : "Entrar no Painel"}
                        </Button>
                    </form>
                </div>
            </div>
        );
    }

    // --- RENDER ADMIN LAYOUT ---
    return (
        <AdminLayout
            currentView={view}
            onViewChange={(v) => {
                if (v === 'create') setSelectedRaffle(null); // Reset selection if explicit create
                setView(v);
            }}
            onLogout={() => setIsAuthenticated(false)}
        >
            {view === 'dashboard' && (
                <div className="space-y-8">
                    <AdminStats raffles={raffles} />
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold">Sorteios Recentes</h3>
                            <Button variant="link" onClick={() => setView('raffles')}>Ver todos</Button>
                        </div>
                        <RaffleList
                            raffles={raffles.slice(0, 6)}
                            onEdit={handleEdit}
                            onViewParticipants={handleViewParticipants}
                            onDelete={handleDelete}
                        />
                    </div>
                </div>
            )}

            {view === 'raffles' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold">Gerenciar Sorteios</h2>
                        <Button onClick={() => { setSelectedRaffle(null); setView('create'); }}>Novo Sorteio</Button>
                    </div>
                    <RaffleList
                        raffles={raffles}
                        onEdit={handleEdit}
                        onViewParticipants={handleViewParticipants}
                        onDelete={handleDelete}
                    />
                </div>
            )}

            {view === 'create' && (
                <RaffleForm
                    initialData={selectedRaffle}
                    onSubmit={handleFormSubmit}
                    onCancel={() => setView('dashboard')}
                    isLoading={isLoading}
                />
            )}

            {view === 'participants' && (
                <ParticipantsTable
                    participants={participants}
                    selectedRaffle={selectedRaffle}
                    onBack={() => setView('dashboard')}
                    onDrawWinner={handlePerformDraw}
                />
            )}

            {view === 'settings' && (
                <div className="flex items-center justify-center p-12 text-muted-foreground border border-dashed border-white/10 rounded-xl">
                    <p>Configurações do sistema em breve.</p>
                </div>
            )}

            {/* ROULETTE OVERLAY */}
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
        </AdminLayout>
    );
};

export default Admin;
