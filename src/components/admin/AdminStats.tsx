import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ticket, DollarSign, Users, Trophy } from "lucide-react";
import { Raffle } from "@/types/raffle";

interface AdminStatsProps {
    raffles: Raffle[];
}

export function AdminStats({ raffles }: AdminStatsProps) {
    const activeRaffles = raffles.filter(r => r.status === 'ativo' || r.status === 'active').length;
    const totalRaffles = raffles.length;
    // Assuming we don't have total tickets sold globally yet, we can't switch it easily without backend, 
    // but clearly we can show total active raffles.

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Sorteios Ativos</CardTitle>
                    <Ticket className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{activeRaffles}</div>
                    <p className="text-xs text-muted-foreground">
                        {totalRaffles} total lifetime
                    </p>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Receita Estimada</CardTitle>
                    <DollarSign className="h-4 w-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">R$ --</div>
                    <p className="text-xs text-muted-foreground">
                        +20.1% em relação ao último mês
                    </p>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Participantes</CardTitle>
                    <Users className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">--</div>
                    <p className="text-xs text-muted-foreground">
                        Usuários únicos
                    </p>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Prêmios Entregues</CardTitle>
                    <Trophy className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalRaffles - activeRaffles}</div>
                    <p className="text-xs text-muted-foreground">
                        Sorteios finalizados
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
