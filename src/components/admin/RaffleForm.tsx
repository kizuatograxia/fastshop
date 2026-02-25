import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RefreshCw, Plus, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Raffle } from "@/types/raffle";
import { api } from "@/lib/api";

// Define the shape of the form data
export interface CreateRaffleDTO {
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

interface RaffleFormProps {
    initialData?: Raffle | null;
    onSubmit: (data: CreateRaffleDTO) => Promise<void>;
    onCancel: () => void;
    isLoading: boolean;
}

export function RaffleForm({ initialData, onSubmit, onCancel, isLoading }: RaffleFormProps) {
    const [categories, setCategories] = useState<any[]>([]);

    useEffect(() => {
        api.getCategories()
            .then(setCategories)
            .catch(err => console.error("Failed to load categories in form:", err));
    }, []);

    const defaultFormData: CreateRaffleDTO = {
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
    };

    const [formData, setFormData] = useState<CreateRaffleDTO>(defaultFormData);

    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.titulo,
                description: initialData.descricao,
                image_url: initialData.imagem,
                ticket_price: initialData.custoNFT,
                prize_pool: initialData.premio,
                max_tickets: initialData.maxParticipantes,
                prize_value: initialData.premioValor,
                draw_date: initialData.dataFim,
                category: initialData.categoria,
                rarity: initialData.raridade
            });
        }
    }, [initialData]);

    const handleSubmit = () => {
        if (!formData.title || !formData.ticket_price || !formData.image_url) {
            toast.error("Preencha os campos obrigatórios");
            return;
        }
        onSubmit(formData);
    };

    return (
        <div className="grid lg:grid-cols-2 gap-12 items-start animate-fade-in">
            <div className="bg-card rounded-3xl p-8 border border-white/5 shadow-2xl space-y-6">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={onCancel}>
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <h2 className="text-2xl font-bold">{initialData ? 'Editar Sorteio' : 'Novo Sorteio'}</h2>
                    </div>
                    <span className="text-xs font-mono bg-primary/10 text-primary px-2 py-1 rounded">
                        {initialData ? 'EDITING' : 'DRAFT'}
                    </span>
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
                            <Label>Data e Hora do Sorteio (Seu Horário Local)</Label>
                            <div className="flex gap-2">
                                <Input
                                    type="date"
                                    value={formData.draw_date ? new Date(formData.draw_date).toLocaleDateString('en-CA') : ''} // YYYY-MM-DD
                                    onChange={(e) => {
                                        const dateStr = e.target.value;
                                        if (!dateStr) return;

                                        const current = formData.draw_date ? new Date(formData.draw_date) : new Date();
                                        const [year, month, day] = dateStr.split('-').map(Number);

                                        // Create Date object keeping the current time but changing date
                                        const newDate = new Date(current);
                                        newDate.setFullYear(year);
                                        newDate.setMonth(month - 1);
                                        newDate.setDate(day);

                                        setFormData({ ...formData, draw_date: newDate.toISOString() });
                                    }}
                                    className="bg-background/50 flex-1"
                                />
                                <Input
                                    type="time"
                                    value={formData.draw_date ? new Date(formData.draw_date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '00:00'}
                                    onChange={(e) => {
                                        const timeStr = e.target.value;
                                        if (!timeStr) return;

                                        const [hours, minutes] = timeStr.split(':').map(Number);
                                        const current = formData.draw_date ? new Date(formData.draw_date) : new Date();

                                        // Create Date object keeping the current date but changing time
                                        const newDate = new Date(current);
                                        newDate.setHours(hours);
                                        newDate.setMinutes(minutes);
                                        newDate.setSeconds(0);
                                        newDate.setMilliseconds(0);

                                        setFormData({ ...formData, draw_date: newDate.toISOString() });
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
                                {categories.filter(c => c.id !== "todos").map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.emoji} {cat.nome}</option>
                                ))}
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
                        {initialData ? <RefreshCw className="w-5 h-5 mr-2" /> : <Plus className="w-5 h-5 mr-2" />}
                        {isLoading ? "Salvando..." : (initialData ? "Atualizar Sorteio" : "Publicar Sorteio")}
                    </Button>
                </div>
            </div>

            {/* Live Preview Card */}
            <div className="hidden lg:block space-y-4">
                <p className="text-muted-foreground font-medium text-center">Preview em Tempo Real</p>
                <div className="transform scale-90 origin-top">
                    <article className="group relative bg-card rounded-2xl border border-border overflow-hidden shadow-elevated">
                        {/* Status Badge */}
                        <div className="absolute top-4 left-4 z-10">
                            <span className="bg-green-500/90 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-full">
                                🟢 Ativo
                            </span>
                        </div>

                        {/* Prize Value Badge */}
                        <div className="absolute top-4 right-4 z-10 bg-background/80 backdrop-blur-sm text-foreground px-2 py-1 rounded-lg text-xs font-bold border border-border">
                            R$ {(formData.prize_value || 0).toLocaleString("pt-BR")}
                        </div>

                        {/* Image */}
                        <div className="relative aspect-square flex items-center justify-center overflow-hidden bg-secondary/30 p-2">
                            {formData.image_url ? (
                                <img
                                    src={formData.image_url}
                                    alt="Preview"
                                    className="w-full h-full object-contain drop-shadow-md"
                                    onError={(e) => {
                                        e.currentTarget.src = "https://images.unsplash.com/photo-1635326444826-06c8f8d2e61d?w=800&q=80";
                                    }}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                    <span className="text-4xl">📷</span>
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="p-4 space-y-3">
                            <h3 className="font-bold text-lg text-foreground leading-tight">
                                {formData.title || "Título do Prêmio"}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                                {formData.description || "Descrição do prêmio aparecerá aqui..."}
                            </p>

                            {/* Progress Bar */}
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">👥 0 bilhetes vendidos</span>
                                    <span>0%</span>
                                </div>
                                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-primary to-accent rounded-full w-0" />
                                </div>
                            </div>

                            {/* NFT Cost */}
                            <div className="flex items-center justify-between py-2 px-3 bg-secondary/50 rounded-lg">
                                <span className="text-xs text-muted-foreground">Custo para participar</span>
                                <span className="font-bold text-primary">{formData.ticket_price || 0} NFT</span>
                            </div>

                            {/* Fake Buttons */}
                            <div className="flex gap-2">
                                <div className="flex-1 h-10 rounded-md border border-border flex items-center justify-center text-sm text-muted-foreground">
                                    ℹ️ Mais informações
                                </div>
                                <div className="flex-1 h-10 rounded-md bg-gradient-to-r from-primary to-accent flex items-center justify-center text-sm text-white font-medium">
                                    🎫 Participar
                                </div>
                            </div>
                        </div>
                    </article>
                </div>
            </div>
        </div>
    );
}
