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
    image_urls?: string[];
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
        rarity: "comum",
        image_urls: []
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
                rarity: initialData.raridade,
                image_urls: initialData.image_urls || []
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
                        <Label>Imagens do Prêmio (Galeria)</Label>
                        <div className="flex gap-4 items-start">
                            <div className="flex-1 space-y-2">
                                <Input
                                    value={formData.image_url}
                                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                    placeholder="https://... (Imagem Principal)"
                                    className="bg-background/50 font-mono text-xs"
                                />
                                <p className="text-[10px] text-muted-foreground">URL Principal ou faça Upload local abaixo. Você pode adicionar até 5 imagens.</p>
                            </div>
                            <div className="relative">
                                <input
                                    type="file"
                                    id="image-upload"
                                    className="hidden"
                                    accept="image/*"
                                    multiple
                                    onChange={(e) => {
                                        const files = Array.from(e.target.files || []);
                                        if (files.length === 0) return;

                                        let currentUrls = [...(formData.image_urls || [])];
                                        if (formData.image_url && !currentUrls.includes(formData.image_url)) {
                                            currentUrls.unshift(formData.image_url);
                                        }

                                        if (currentUrls.length + files.length > 5) {
                                            toast.error("Máximo de 5 imagens permitidas.");
                                            return;
                                        }

                                        files.forEach(file => {
                                            if (file.size > 5000000) {
                                                toast.error(`A imagem ${file.name} é muito grande! Máximo 5MB.`);
                                                return;
                                            }
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                                setFormData(prev => {
                                                    const urls = [...(prev.image_urls || [])];
                                                    const base64 = reader.result as string;
                                                    urls.push(base64);

                                                    return {
                                                        ...prev,
                                                        image_urls: urls,
                                                        // Set first as main if no main
                                                        image_url: prev.image_url || base64
                                                    };
                                                });
                                            };
                                            reader.readAsDataURL(file);
                                        });

                                        toast.success("Imagens processadas!");
                                    }}
                                />
                                <Button type="button" variant="outline" onClick={() => document.getElementById('image-upload')?.click()}>
                                    Upload 📸
                                </Button>
                            </div>
                        </div>

                        {/* Thumbnail Gallery */}
                        {(formData.image_urls && formData.image_urls.length > 0) && (
                            <div className="flex gap-2 mt-3 overflow-x-auto pb-2 custom-scrollbar">
                                {formData.image_urls.map((url, idx) => (
                                    <div key={idx} className="relative w-16 h-16 flex-shrink-0 group">
                                        <img src={url} alt={`Preview ${idx}`} className="w-full h-full object-cover rounded-md border border-border" />
                                        <button
                                            type="button"
                                            className="absolute -top-1 -right-1 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                                            onClick={() => {
                                                setFormData(prev => {
                                                    const urls = [...(prev.image_urls || [])];
                                                    urls.splice(idx, 1);

                                                    // If we deleted the main url, replace it if possible
                                                    let newMain = prev.image_url;
                                                    if (prev.image_url === url) {
                                                        newMain = urls.length > 0 ? urls[0] : "";
                                                    }

                                                    return { ...prev, image_urls: urls, image_url: newMain };
                                                });
                                            }}
                                        >
                                            ✕
                                        </button>
                                        {formData.image_url === url && (
                                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-primary text-[8px] font-bold px-1 rounded-full text-white">
                                                Capa
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
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
                    <article className="group relative flex flex-col h-full bg-card rounded-2xl border border-border overflow-hidden shadow-elevated">
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
                        <div className="relative w-full overflow-hidden">
                            {formData.image_url ? (
                                <img
                                    src={formData.image_url}
                                    alt="Preview"
                                    className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
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
                        <div className="p-4 space-y-3 flex flex-col flex-grow">
                            <h3 className="font-bold text-lg text-foreground leading-tight group-hover:text-primary transition-colors">
                                {formData.title || "Título do Prêmio"}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-2 pb-2">
                                {formData.description || "Descrição do prêmio aparecerá aqui..."}
                            </p>

                            <div className="mt-auto space-y-3">
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
                        </div>
                    </article>
                </div>
            </div>
        </div>
    );
}
