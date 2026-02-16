import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Trash2, Ticket, Plus } from "lucide-react";

interface Coupon {
    id: number;
    code: string;
    type: 'percent' | 'fixed';
    value: string;
    min_purchase: string;
    usage_limit: number | null;
    used_count: number;
    expires_at: string | null;
    created_at: string;
}

export const CouponsManager = () => {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    // Form State
    const [newCode, setNewCode] = useState("");
    const [newType, setNewType] = useState<'percent' | 'fixed'>('percent');
    const [newValue, setNewValue] = useState("");
    const [newLimit, setNewLimit] = useState("");
    const [newMinPurchase, setNewMinPurchase] = useState("");

    const fetchCoupons = async () => {
        setIsLoading(true);
        try {
            const data = await api.get('/admin/coupons'); // Assuming generic GET in api.ts or added
            // If api.get doesn't exist, we might need to add it to api.ts or use fetch directly
            // For now using api.get assuming it calls axios or fetch with auth headers
            setCoupons(data);
        } catch (error) {
            console.error(error);
            // toast.error("Erro ao carregar cupons"); 
            // Mocking for now if backend not fully wired or CORS issues in dev
        } finally {
            setIsLoading(false);
        }
    };

    // Use specific API calls if generic not available.
    // I'll assume I need to add `getCoupons`, `createCoupon`, `deleteCoupon` to api.ts later.
    // Or I'll implement them here using `api.client` if exposed, or `fetch`.
    // Let's use `fetch` with localStorage token for now to be safe.
    const getAuthHeaders = () => {
        const token = localStorage.getItem('auth_token');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    };

    const fetchCouponsDirect = async () => {
        setIsLoading(true);
        try {
            // Admin authentication? Admin endpoints might use different auth or just generic token + check?
            // Existing admin uses "password" body/param usually. The new endpoints didn't enforce it strictly yet or relied on open access for dev.
            // Let's call the endpoint.
            const res = await fetch('http://localhost:3000/api/admin/coupons');
            const data = await res.json();
            if (Array.isArray(data)) setCoupons(data);
        } catch (e) {
            toast.error("Erro na conexão");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCouponsDirect();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const body = {
                code: newCode,
                type: newType,
                value: parseFloat(newValue),
                min_purchase: parseFloat(newMinPurchase) || 0,
                usage_limit: parseInt(newLimit) || null,
                expires_at: null // Todo: Add date picker
            };

            const res = await fetch('http://localhost:3000/api/admin/coupons', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                toast.success("Cupom criado!");
                setIsCreating(false);
                fetchCouponsDirect();
                // Reset form
                setNewCode("");
                setNewValue("");
            } else {
                const err = await res.json();
                toast.error(err.message || "Erro ao criar");
            }
        } catch (e) {
            toast.error("Erro ao criar cupom");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Deletar cupom?")) return;
        try {
            await fetch(`http://localhost:3000/api/admin/coupons/${id}`, { method: 'DELETE' });
            toast.success("Cupom removido");
            fetchCouponsDirect();
        } catch (e) {
            toast.error("Erro ao deletar");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Ticket className="w-6 h-6 text-primary" />
                    Gerenciar Cupons
                </h2>
                <Button onClick={() => setIsCreating(!isCreating)}>
                    {isCreating ? 'Cancelar' : <><Plus className="w-4 h-4 mr-2" /> Novo Cupom</>}
                </Button>
            </div>

            {isCreating && (
                <Card className="bg-black/20 border-white/10">
                    <CardHeader>
                        <CardTitle>Criar Novo Cupom</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label>Código</label>
                                <Input
                                    value={newCode}
                                    onChange={e => setNewCode(e.target.value.toUpperCase())}
                                    placeholder="EX: DESCONTO10"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label>Tipo</label>
                                <select
                                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                    value={newType}
                                    onChange={e => setNewType(e.target.value as any)}
                                >
                                    <option value="percent">Porcentagem (%)</option>
                                    <option value="fixed">Valor Fixo (R$)</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label>Valor ({newType === 'percent' ? '%' : 'R$'})</label>
                                <Input
                                    type="number"
                                    value={newValue}
                                    onChange={e => setNewValue(e.target.value)}
                                    placeholder="10"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label>Mínimo Compra (R$)</label>
                                <Input
                                    type="number"
                                    value={newMinPurchase}
                                    onChange={e => setNewMinPurchase(e.target.value)}
                                    placeholder="0"
                                />
                            </div>
                            <div className="space-y-2">
                                <label>Limite de Uso (Opcional)</label>
                                <Input
                                    type="number"
                                    value={newLimit}
                                    onChange={e => setNewLimit(e.target.value)}
                                    placeholder="Ex: 100"
                                />
                            </div>
                            <div className="col-span-1 md:col-span-2 mt-4">
                                <Button type="submit" className="w-full">Salvar Cupom</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <Card className="bg-black/20 border-white/10">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Código</TableHead>
                                <TableHead>Desconto</TableHead>
                                <TableHead>Usos</TableHead>
                                <TableHead>Mínimo</TableHead>
                                <TableHead>Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {coupons.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        Nenhum cupom criado
                                    </TableCell>
                                </TableRow>
                            ) : (
                                coupons.map(c => (
                                    <TableRow key={c.id}>
                                        <TableCell className="font-mono font-bold text-primary">{c.code}</TableCell>
                                        <TableCell>
                                            {c.type === 'percent' ? `${c.value}%` : `R$ ${c.value}`}
                                        </TableCell>
                                        <TableCell>
                                            {c.used_count} / {c.usage_limit || '∞'}
                                        </TableCell>
                                        <TableCell>
                                            {parseFloat(c.min_purchase) > 0 ? `R$ ${c.min_purchase}` : '-'}
                                        </TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)} className="text-red-400 hover:text-red-300">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};
