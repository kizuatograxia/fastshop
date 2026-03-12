import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ticket, DollarSign, Users } from "lucide-react";
import { Raffle } from "@/types/raffle";
import { ResponsiveContainer, LineChart, Line } from "recharts";

import { useMemo } from "react";

interface AdminStatsProps {
    raffles: Raffle[];
}

export function AdminStats({ raffles }: AdminStatsProps) {
    const activeRafflesCount = raffles.filter(r => r.status === 'ativo' || r.status === 'active').length;
    const totalRaffles = raffles.length;

    const stats = useMemo(() => {
        let totalRevenue = 0;
        let totalParticipants = 0;
        
        // Ensure chronological order (oldest to newest assuming lower ID is older, or we just reverse if they came newest first)
        const sortedRaffles = [...raffles].reverse(); 

        const cumulativeRevenueData: { value: number }[] = [];
        const cumulativeUsersData: { value: number }[] = [];
        const activeRafflesData: { value: number }[] = [];

        let currentActiveAccum = 0;

        sortedRaffles.forEach(r => {
            const revenue = (r.participantes || 0) * (r.custoNFT || 0);
            totalRevenue += revenue;
            totalParticipants += (r.participantes || 0);
            
            if(r.status === 'ativo' || r.status === 'active') currentActiveAccum++;

            cumulativeRevenueData.push({ value: totalRevenue });
            cumulativeUsersData.push({ value: totalParticipants });
            activeRafflesData.push({ value: currentActiveAccum });
        });

        // If no data, provide a flat 0 line to avoid crash
        if (cumulativeRevenueData.length === 0) {
           cumulativeRevenueData.push({ value: 0 });
           cumulativeUsersData.push({ value: 0 });
           activeRafflesData.push({ value: 0 });
        }

        return {
            totalRevenue,
            totalParticipants,
            chartDataRevenue: cumulativeRevenueData,
            chartDataUsers: cumulativeUsersData,
            chartDataActive: activeRafflesData
        };
    }, [raffles]);

    return (
        <div className="grid gap-4 md:grid-cols-3 mb-8">
            <Card className="glass-card shadow-elevated border-white/5 flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-blue-400 transition-colors">Sorteios Ativos</CardTitle>
                    <div className="p-2 rounded-lg bg-blue-500/10 shadow-[0_0_10px_rgba(59,130,246,0.2)]">
                        <Ticket className="h-4 w-4 text-blue-500 drop-shadow-[0_0_5px_rgba(59,130,246,0.6)]" />
                    </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-end">
                    <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">{activeRafflesCount}</div>
                    <p className="text-xs text-muted-foreground mb-4">
                        {totalRaffles} históricos
                    </p>
                    <div className="h-12 w-full mt-auto opacity-70 group-hover:opacity-100 transition-opacity">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={stats.chartDataActive}>
                                <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={false} style={{ filter: 'drop-shadow(0 0 5px rgba(59,130,246,0.5))' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            <Card className="glass-card shadow-elevated border-white/5 flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">Receita Acumulada</CardTitle>
                    <div className="p-2 rounded-lg bg-primary/10 shadow-[0_0_10px_rgba(0,255,140,0.2)]">
                        <DollarSign className="h-4 w-4 text-primary drop-shadow-[0_0_5px_rgba(0,255,140,0.6)]" />
                    </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-end">
                    <div className="text-2xl font-bold text-gradient">R$ {stats.totalRevenue.toLocaleString('pt-BR')}</div>
                    <p className="text-xs text-muted-foreground mb-4">
                        Baseado no histórico de vendas
                    </p>
                    <div className="h-12 w-full mt-auto opacity-70 group-hover:opacity-100 transition-opacity">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={stats.chartDataRevenue}>
                                <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} style={{ filter: 'drop-shadow(0 0 5px rgba(0,255,140,0.5))' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            <Card className="glass-card shadow-elevated border-white/5 flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent"></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-orange-400 transition-colors">Tickets Emitidos</CardTitle>
                    <div className="p-2 rounded-lg bg-orange-500/10 shadow-[0_0_10px_rgba(249,115,22,0.2)]">
                        <Users className="h-4 w-4 text-orange-500 drop-shadow-[0_0_5px_rgba(249,115,22,0.6)]" />
                    </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-end">
                    <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-500">{stats.totalParticipants.toLocaleString('pt-BR')}</div>
                    <p className="text-xs text-muted-foreground mb-4">
                        Em todo o ciclo de vida
                    </p>
                    <div className="h-12 w-full mt-auto opacity-70 group-hover:opacity-100 transition-opacity">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={stats.chartDataUsers}>
                                <Line type="monotone" dataKey="value" stroke="#f97316" strokeWidth={2} dot={false} style={{ filter: 'drop-shadow(0 0 5px rgba(249,115,22,0.5))' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
