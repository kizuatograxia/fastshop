import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MapPin } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface WinnerAddressDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function WinnerAddressDialog({ isOpen, onOpenChange, onSuccess }: WinnerAddressDialogProps) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        cep: user?.cep || "",
        address: user?.address || "",
        number: "", // Number is often separate but user object might store it in address or separate. For now simple.
        city: user?.city || "",
        state: user?.state || ""
    });

    const handleSave = async () => {
        if (!formData.cep || !formData.address || !formData.city || !formData.state) {
            toast({ title: "Preencha todos os campos", variant: "destructive" });
            return;
        }

        setLoading(true);
        try {
            await api.updateProfile(user!.id, {
                cep: formData.cep,
                address: `${formData.address}${formData.number ? `, ${formData.number}` : ''}`, // Combine for now if backend expects single string or keep separate if backend updated
                city: formData.city,
                state: formData.state
            });
            toast({ title: "Endereço salvo com sucesso!" });
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            toast({ title: "Erro ao salvar endereço", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Endereço de Entrega</DialogTitle>
                    <DialogDescription>
                        Informe onde devemos entregar seu prêmio.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label>CEP</Label>
                        <Input
                            value={formData.cep}
                            onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                            placeholder="00000-000"
                            maxLength={9}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Cidade</Label>
                            <Input
                                value={formData.city}
                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                placeholder="Cidade"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Estado</Label>
                            <Input
                                value={formData.state}
                                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                placeholder="UF"
                                maxLength={2}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Endereço</Label>
                        <Input
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            placeholder="Rua, Bairro"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Número / Complemento</Label>
                        <Input
                            value={formData.number}
                            onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                            placeholder="123, Apto 45"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSave} disabled={loading}>
                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <MapPin className="w-4 h-4 mr-2" />}
                        Salvar Endereço
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
