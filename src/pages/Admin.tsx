import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Lock } from "lucide-react";
import { Raffle } from "@/types/raffle";
import { LiveRoulette } from "@/components/LiveRoulette";

// Components
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminStats } from "@/components/admin/AdminStats";
import { RaffleList } from "@/components/admin/RaffleList";
import { RaffleForm, CreateRaffleDTO } from "@/components/admin/RaffleForm";
import { ParticipantsTable } from "@/components/admin/ParticipantsTable";
import { AdminRaffleDetails } from "@/components/admin/AdminRaffleDetails";
import { ReviewsList, Review } from "@/components/admin/ReviewsList";

type ViewMode = 'dashboard' | 'create' | 'participants' | 'raffles' | 'settings' | 'details' | 'reviews';

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
    const [reviews, setReviews] = useState<Review[]>([]);

    // --- ROULETTE STATE ---
    const [showRoulette, setShowRoulette] = useState(false);
    const [winnerId, setWinnerId] = useState<number | null>(null);

    useEffect(() => {
        // Auto-login if session persists
        const checkAuth = async () => {
            const storedKey = localStorage.getItem("admin_key");
            if (storedKey) {
                try {
                    await api.verifyAdmin(storedKey);
                    setPassword(storedKey);
                    setIsAuthenticated(true);
                    // Fetch data immediately if auth is valid
                    const data = await api.getAdminRaffles();
                    setRaffles(data);
                } catch (error) {
                    console.warn("Session expired or invalid credential");
                    localStorage.removeItem("admin_key");
                }
            }
        };
        checkAuth();
    }, []);

    // Update handlers to fetch reviews when view changes
    useEffect(() => {
        if (view === 'reviews') {
            fetchReviews();
        }
    }, [view]);

    // --- HANDLERS ---

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.verifyAdmin(password);
            localStorage.setItem("admin_key", password);
            setIsAuthenticated(true);
            toast.success("Bem-vindo, Administrador!");
            fetchRaffles();
        } catch (error) {
            toast.error("Senha incorreta");
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("admin_key");
        setIsAuthenticated(false);
        setPassword("");
        toast.info("Sessão encerrada");
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

    const fetchReviews = async () => {
        try {
            const data = await api.getPendingReviews(password);
            setReviews(data);
        } catch (error) {
            toast.error("Erro ao carregar depoimentos.");
        }
    };

    const handleApproveReview = async (id: string) => {
        try {
            await api.approveReview(password, id);
            toast.success("Depoimento aprovado!");
            setReviews(prev => prev.filter(r => r.id !== id));
        } catch (error) {
            toast.error("Erro ao aprovar depoimento.");
        }
    };

    const handleRejectReview = async (id: string) => {
        if (!confirm("Tem certeza que deseja rejeitar este depoimento?")) return;
        try {
            await api.rejectReview(password, id);
            toast.success("Depoimento rejeitado.");
            setReviews(prev => prev.filter(r => r.id !== id));
        } catch (error) {
            toast.error("Erro ao rejeitar depoimento.");
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

    const handleViewDetails = (raffle: Raffle) => {
        setSelectedRaffle(raffle);
        setView('details');
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

    // Triggered by button in Details or Participants
    const handlePerformDraw = async () => {
        if (!selectedRaffle) return;

        // Confirm before action
        if (!confirm("Isso irá realizar o sorteio e definir um vencedor permanentemente. Continuar?")) return;

        setIsLoading(true);
        try {
            // 1. Perform the draw on the backend first
            const data = await api.drawRaffle(localStorage.getItem("admin_key") || "", selectedRaffle.id);

            // 2. Update the raffle with the winner info locally
            const updatedRaffle = { ...selectedRaffle, winner: data.winner, status: 'encerrado' };
            setSelectedRaffle(updatedRaffle as Raffle);

            // 3. Show the new Premium Roulette with the winner already set
            setShowRoulette(true);
            toast.success("Resultado obtido! Iniciando animação...");
        } catch (error) {
            toast.error("Erro ao realizar sorteio. Tente novamente.");
            console.error(error);
        } finally {
            setIsLoading(false);
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
                if (v === 'create') setSelectedRaffle(null);
                setView(v);
            }}
            onLogout={handleLogout}
            pendingReviews={reviews.length}
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
                            onViewDetails={handleViewDetails}
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
                        onViewDetails={handleViewDetails}
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

            {view === 'details' && selectedRaffle && (
                <AdminRaffleDetails
                    raffle={selectedRaffle}
                    onBack={() => setView('raffles')}
                    onEdit={handleEdit}
                    onViewParticipants={() => handleViewParticipants(selectedRaffle)}
                    onDraw={handlePerformDraw}
                />
            )}

            {view === 'participants' && (
                <ParticipantsTable
                    participants={participants}
                    selectedRaffle={selectedRaffle}
                    onBack={() => setView(selectedRaffle ? 'details' : 'dashboard')} // Smart back navigation
                    onDrawWinner={handlePerformDraw}
                />
            )}

            {view === 'reviews' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold">Análise de Depoimentos</h2>
                        <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium">
                            {reviews.length} pendentes
                        </div>
                    </div>
                    <ReviewsList
                        reviews={reviews}
                        onApprove={handleApproveReview}
                        onReject={handleRejectReview}
                    />
                </div>
            )}

            {view === 'settings' && (
                <div className="flex items-center justify-center p-12 text-muted-foreground border border-dashed border-white/10 rounded-xl">
                    <p>Configurações do sistema em breve.</p>
                </div>
            )}

            {/* LIVE ROULETTE OVERLAY */}
            {showRoulette && selectedRaffle && (
                <LiveRoulette
                    raffle={selectedRaffle}
                    onClose={() => {
                        setShowRoulette(false);
                        fetchRaffles(); // Refresh data to show winner in list
                        setView('details');
                    }}
                />
            )}
        </AdminLayout>
    );
};

export default Admin;
