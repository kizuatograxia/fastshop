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
            const data = await api.getCoupons();
            setCoupons(data);
        } catch (error) {
            console.error(error);
            toast.error("Erro ao carregar cupons. Verifique se o servidor está rodando.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCoupons();
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
                expires_at: null
            };

            await api.createCoupon(body);
            toast.success("Cupom criado!");
            setIsCreating(false);
            fetchCoupons();
            // Reset form
            setNewCode("");
            setNewValue("");
        } catch (e: any) {
            toast.error(e.message || "Erro ao criar cupom");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Deletar cupom?")) return;
        try {
            await api.deleteCoupon(id);
            toast.success("Cupom removido");
            fetchCoupons();
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
