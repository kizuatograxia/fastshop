import { useState } from "react";
import { Raffle } from "@/types/raffle";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Users, Trophy, Target, Calendar, DollarSign, Pen, MessageSquare } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { CountdownBadge } from "@/components/CountdownBadge";
import { WinnerDetailsModal } from "@/components/admin/WinnerDetailsModal";

interface AdminRaffleDetailsProps {
    raffle: Raffle;
    onBack: () => void;
    onEdit: (raffle: Raffle) => void;
    onViewParticipants: () => void;
    onDraw: () => void;
}

export function AdminRaffleDetails({ raffle, onBack, onEdit, onViewParticipants, onDraw }: AdminRaffleDetailsProps) {
    const [showWinnerModal, setShowWinnerModal] = useState(false);
    const [trackingCode, setTrackingCode] = useState(raffle.trackingCode || "");
    const [carrier, setCarrier] = useState(raffle.carrier || "");
    const [shippingStatus, setShippingStatus] = useState(raffle.shippingStatus || "preparing");
    const [isSavingTracking, setIsSavingTracking] = useState(false);

    const targetRevenue = (raffle.premioValor || 5000) * 1.5;
    const currentRevenue = (raffle.participantes * (raffle.custoNFT || 0));
    const revenueProgress = Math.min((currentRevenue / targetRevenue) * 100, 100);

    return (
        <div className="space-y-8 animate-fade-in fade-in-section">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={onBack}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <h2 className="text-2xl font-bold">Detalhes do Sorteio</h2>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => onEdit(raffle)}>
                        <Pen className="w-4 h-4 mr-2" />
                        Editar
                    </Button>
                    <Button onClick={onViewParticipants}>
                        <Users className="w-4 h-4 mr-2" />
                        Ver Participantes
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Image & Main Info - Left Col */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="relative aspect-video rounded-2xl overflow-hidden bg-secondary/30 border border-white/5 shadow-2xl">
                        <img
                            src={raffle.imagem}
                            alt={raffle.titulo}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute top-4 left-4 flex gap-2">
                            <span className="px-3 py-1 bg-black/60 backdrop-blur text-white rounded-lg text-sm font-bold border border-white/10 flex items-center gap-2">
                                <CountdownBadge targetDate={raffle.dataFim} />
                            </span>
                            <span className={`px-3 py-1 rounded-lg text-sm font-bold backdrop-blur border border-white/10 ${raffle.status === "ativo" ? "bg-green-500/80 text-white" : "bg-red-500/80 text-white"}`}>
                                {raffle.status === 'ativo' ? 'ATIVO' : 'ENCERRADO'}
                            </span>
                        </div>
                    </div>

                    <div>
                        <h1 className="text-3xl font-bold mb-2">{raffle.titulo}</h1>
                        <p className="text-muted-foreground text-lg leading-relaxed whitespace-pre-wrap">{raffle.descricao}</p>

                        {/* Action Button for Draw */}
                        {raffle.status === 'ativo' && (
                            <div className="mt-6">
                                <Button
                                    size="lg"
                                    className="w-full md:w-auto bg-gradient-to-r from-primary to-accent hover:opacity-90 text-black font-bold shadow-[0_0_20px_rgba(var(--primary),0.4)] animate-pulse"
                                    onClick={onDraw}
                                >
                                    <Trophy className="w-5 h-5 mr-2" />
                                    Realizar Sorteio Agora
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Winner Section */}
                    {raffle.status === 'encerrado' && raffle.winner && (
                        <>
                            <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/50 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 justify-between">
                                <div className="flex items-center gap-6">
                                    <div className="relative">
                                        <img
                                            src={raffle.winner.picture}
                                            alt={raffle.winner.name}
                                            className="w-20 h-20 rounded-full border-2 border-white object-cover shadow-xl"
                                        />
                                        <div className="absolute -bottom-2 -right-2 bg-yellow-500 text-black p-1.5 rounded-full shadow-lg border border-white">
                                            <Trophy className="w-4 h-4" fill="black" />
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-yellow-500 font-bold uppercase tracking-wider text-xs mb-1">Grande Vencedor</p>
                                        <h2 className="text-2xl font-bold text-white mb-1">{raffle.winner.name}</h2>
                                        <p className="text-sm text-yellow-500/80">ID: {raffle.winner.id}</p>
                                    </div>
                                </div>

                                <Button
                                    className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold shadow-lg shadow-yellow-500/20"
                                    onClick={() => setShowWinnerModal(true)}
                                >
                                    <MessageSquare className="w-4 h-4 mr-2" />
                                    Ver Detalhes & Chat
                                </Button>

                                {/* Modal */}
                                {raffle.winner.id && (
                                    <WinnerDetailsModal
                                        userId={raffle.winner.id}
                                        isOpen={showWinnerModal}
                                        onClose={() => setShowWinnerModal(false)}
                                    />
                                )}
                            </div>

                            {/* Winner Address */}
                            <div className="mt-6 bg-card border border-white/5 rounded-xl p-4">
                                <h4 className="font-bold text-muted-foreground mb-2 text-sm uppercase tracking-wider">Endereço de Entrega</h4>
                                {raffle.winner.address ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="font-semibold text-foreground">{raffle.winner.address}, {raffle.winner.number || 'S/N'}</p>
                                            <p className="text-muted-foreground">{raffle.winner.city}/{raffle.winner.state}</p>
                                            <p className="text-muted-foreground mt-1">CEP: <span className="text-foreground font-mono">{raffle.winner.cep}</span></p>
                                        </div>
                                        <div className="text-right md:text-left">
                                            <p className="text-muted-foreground">Email: <span className="text-foreground select-all">{raffle.winner.email}</span></p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-yellow-500 bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/20">
                                        <Clock className="w-4 h-4" />
                                        <span>Endereço não cadastrado pelo ganhador.</span>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* Tracking Section */}
                    {raffle.status === 'encerrado' && raffle.winner && (
                        <div className="bg-card border border-white/5 rounded-2xl p-6 shadow-xl">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <span className="text-xl">🚚</span>
                                Rastreamento do Prêmio
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Código de Rastreio</label>
                                    <input
                                        type="text"
                                        value={trackingCode}
                                        onChange={(e) => setTrackingCode(e.target.value)}
                                        className="w-full bg-background border border-white/10 rounded-md p-2 text-sm text-foreground"
                                        placeholder="Ex: BR123456789PT"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Transportadora</label>
                                    <input
                                        type="text"
                                        value={carrier}
                                        onChange={(e) => setCarrier(e.target.value)}
                                        className="w-full bg-background border border-white/10 rounded-md p-2 text-sm text-foreground"
                                        placeholder="Ex: Correios, Jadlog"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Status da Entrega</label>
                                    <select
                                        value={shippingStatus}
                                        onChange={(e) => setShippingStatus(e.target.value)}
                                        className="w-full bg-background border border-white/10 rounded-md p-2 text-sm text-foreground"
                                    >
                                        <option value="preparing">📦 Preparando</option>
                                        <option value="shipped">🚚 Enviado</option>
                                        <option value="in_transit">✈️ Em Trânsito</option>
                                        <option value="delivered">✅ Entregue</option>
                                    </select>
                                </div>
                            </div>
                            <div className="mt-4 flex justify-end">
                                <Button
                                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                                    onClick={async () => {
                                        setIsSavingTracking(true);
                                        try {
                                            const { api } = await import("@/lib/api");
                                            const { toast } = await import("sonner");
                                            await api.updateTracking(raffle.id, { trackingCode, carrier, status: shippingStatus });
                                            toast.success("Rastreio atualizado com sucesso!");
                                        } catch (error) {
                                            console.error(error);
                                            const { toast } = await import("sonner");
                                            toast.error("Erro ao atualizar rastreio");
                                        } finally {
                                            setIsSavingTracking(false);
                                        }
                                    }}
                                    disabled={isSavingTracking}
                                >
                                    {isSavingTracking ? "Salvando..." : "Salvar Rastreio"}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar Stats - Right Col */}
                <div className="space-y-6">
                    <div className="bg-card rounded-2xl border border-white/5 p-6 space-y-6 shadow-xl">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-primary" />
                            Dados do Prêmio
                        </h3>

                        <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-background/50 border border-white/5">
                                <p className="text-sm text-muted-foreground mb-1">Nome do Prêmio</p>
                                <p className="font-bold">{raffle.premio}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-background/50 border border-white/5">
                                <p className="text-sm text-muted-foreground mb-1">Valor Estimado</p>
                                <p className="font-bold text-lg text-primary">R$ {raffle.premioValor?.toLocaleString('pt-BR')}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-card rounded-2xl border border-white/5 p-6 space-y-6 shadow-xl">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <Target className="w-5 h-5 text-primary" />
                            Performance Vendas
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-muted-foreground">Progresso</span>
                                    <span className="font-bold">{revenueProgress.toFixed(1)}%</span>
                                </div>
                                <Progress value={revenueProgress} className="h-2" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 rounded-xl bg-background/50 border border-white/5 text-center">
                                    <Users className="w-4 h-4 mx-auto mb-2 text-muted-foreground" />
                                    <p className="text-2xl font-bold">{raffle.participantes}</p>
                                    <p className="text-xs text-muted-foreground">Bilhetes</p>
                                </div>
                                <div className="p-3 rounded-xl bg-background/50 border border-white/5 text-center">
                                    <DollarSign className="w-4 h-4 mx-auto mb-2 text-muted-foreground" />
                                    <p className="text-2xl font-bold">R$ {currentRevenue.toLocaleString('pt-BR')}</p>
                                    <p className="text-xs text-muted-foreground">Receita</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-muted-foreground pt-4 border-t border-white/5">
                                <Calendar className="w-4 h-4" />
                                <span>Sorteio: {new Date(raffle.dataFim).toLocaleDateString('pt-BR')}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div >
        </div >
    );
}

