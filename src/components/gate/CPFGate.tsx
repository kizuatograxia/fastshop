import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { ShieldCheck, Calendar, Lock } from "lucide-react";
import { formatCPF, formatBirthDate, isValidCPF, isOver18 } from "@/lib/validators";
import { api } from "@/lib/api";

const gateSchema = z.object({
    cpf: z.string().min(14, "CPF incompleto").refine(isValidCPF, "CPF inválido. Verifique os números."),
    birthDate: z.string().min(10, "Data incompleta").refine(val => {
        const parts = val.split('/');
        if (parts.length !== 3) return false;
        const day = parseInt(parts[0]);
        const month = parseInt(parts[1]);
        const year = parseInt(parts[2]);
        // Basic sanity check for date
        if (day > 31 || month > 12) return false;
        return true;
    }, "Data inválida").refine(isOver18, "Acesso restrito a maiores de 18 anos."),
});

type GateValues = z.infer<typeof gateSchema>;

export const CPFGate = ({ children }: { children: React.ReactNode }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<GateValues>({
        resolver: zodResolver(gateSchema),
        defaultValues: {
            cpf: "",
            birthDate: "",
        },
    });

    useEffect(() => {
        // Check session storage for existing verification
        const isVerified = sessionStorage.getItem("gate_verified");
        if (!isVerified) {
            setIsOpen(true);
        }
    }, []);

    const onSubmit = async (data: GateValues) => {
        setIsLoading(true);
        try {
            await api.verifyGate(data.cpf, data.birthDate);
            sessionStorage.setItem("gate_verified", "true");
            toast.success("Identidade verificada com sucesso!");
            setIsOpen(false);
        } catch (error) {
            toast.error("Erro ao verificar dados. Tente novamente.");
        } finally {
            setIsLoading(false);
        }
    };

    // Prevent closing by clicking outside or escape
    const handleOpenChange = (open: boolean) => {
        if (!open && !sessionStorage.getItem("gate_verified")) {
            return; // Force stay open if not verified
        }
        setIsOpen(open);
    };

    // If verified (or initial render before effect), render children but keep dialog logic ready
    // Actually, we render children always, but the Dialog covers them if isOpen is true.
    // However, for better security/UX, we might want to hide children content if not verified?
    // Let's rely on the Dialog being modal and blocking interaction. 
    // BUT to prevent "flashing" trusted content, we can return null for children if not verified?
    // A strict gate usually hides content.
    const isVerified = typeof window !== 'undefined' && sessionStorage.getItem("gate_verified");

    if (!isVerified && !isOpen) {
        // Initial state before effect runs: return null or loading to avoid content flash
        // But since we set isOpen in useEffect, there might be a split second.
        // Let's just manage isOpen.
    }

    return (
        <>
            <Dialog open={isOpen} onOpenChange={handleOpenChange}>
                <DialogContent className="sm:max-w-md [&>button]:hidden bg-card/95 backdrop-blur-xl border-primary/20" onInteractOutside={e => e.preventDefault()} onEscapeKeyDown={e => e.preventDefault()}>
                    <DialogHeader className="space-y-4 flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-2 animate-pulse">
                            <ShieldCheck className="w-8 h-8 text-primary" />
                        </div>
                        <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                            Verificação de Identidade
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground max-w-xs mx-auto">
                            Para garantir a segurança da plataforma e cumprir a legislação, precisamos confirmar que você é maior de 18 anos.
                        </DialogDescription>
                    </DialogHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 py-4">
                            <FormField
                                control={form.control}
                                name="cpf"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs uppercase font-bold text-muted-foreground tracking-wider">Seu CPF</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="000.000.000-00"
                                                className="bg-secondary/50 border-input text-lg tracking-wide font-mono text-center"
                                                {...field}
                                                onChange={(e) => field.onChange(formatCPF(e.target.value))}
                                                maxLength={14}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="birthDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs uppercase font-bold text-muted-foreground tracking-wider">Data de Nascimento</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                                <Input
                                                    placeholder="DD/MM/AAAA"
                                                    className="pl-10 bg-secondary/50 border-input text-lg font-mono"
                                                    {...field}
                                                    onChange={(e) => field.onChange(formatBirthDate(e.target.value))}
                                                    maxLength={10}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="bg-primary/5 p-3 rounded-lg border border-primary/10 flex gap-3 text-xs text-muted-foreground">
                                <Lock className="w-4 h-4 flex-shrink-0 text-primary" />
                                <p>
                                    Seus dados são criptografados e utilizados apenas para validação de identidade, conforme a <span className="text-primary font-medium hover:underline cursor-pointer">LGPD</span>.
                                </p>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-12 text-md font-bold shadow-glow"
                                disabled={isLoading}
                            >
                                {isLoading ? "Verificando..." : "CONFIRMAR E ACESSAR"}
                            </Button>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Only render children if verified? Or render them blurred? 
                For security, rendering them but blocked by modal is okay for frontend-only gate.
                A "real" gate would block data fetching. 
            */}
            <div className={isOpen ? "blur-sm pointer-events-none select-none h-screen overflow-hidden" : ""}>
                {children}
            </div>
        </>
    );
};
