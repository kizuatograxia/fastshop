import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ticket, DollarSign, Users } from "lucide-react";
import { Raffle } from "@/types/raffle";
import { ResponsiveContainer, LineChart, Line } from "recharts";

interface AdminStatsProps {
    raffles: Raffle[];
}

const mockChartData = [
    { value: 10 }, { value: 15 }, { value: 12 }, { value: 20 }, { value: 25 }, { value: 22 }, { value: 30 }
];

const mockChartDataRevenue = [
    { value: 5000 }, { value: 5500 }, { value: 5200 }, { value: 6800 }, { value: 7500 }, { value: 7200 }, { value: 12450 }
];

const mockChartDataUsers = [
    { value: 200 }, { value: 250 }, { value: 300 }, { value: 450 }, { value: 400 }, { value: 600 }, { value: 842 }
];

export function AdminStats({ raffles }: AdminStatsProps) {
    const activeRaffles = raffles.filter(r => r.status === 'ativo' || r.status === 'active').length;
    const totalRaffles = raffles.length;
    // Assuming we don't have total tickets sold globally yet, we can't switch it easily without backend, 
    // but clearly we can show total active raffles.

    return (
        <div className="grid gap-4 md:grid-cols-3 mb-8">
            <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20 flex flex-col justify-between">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Sorteios Ativos</CardTitle>
                    <Ticket className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-end">
                    <div className="text-2xl font-bold">{activeRaffles}</div>
                    <p className="text-xs text-muted-foreground mb-4">
                        {totalRaffles} total lifetime
                    </p>
                    <div className="h-12 w-full mt-auto">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={mockChartData}>
                                <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20 flex flex-col justify-between">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Receita Estimada</CardTitle>
                    <DollarSign className="h-4 w-4 text-emerald-500" />
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-end">
                    <div className="text-2xl font-bold">R$ 12.450</div>
                    <p className="text-xs text-muted-foreground mb-4">
                        +20.1% em relação ao último mês
                    </p>
                    <div className="h-12 w-full mt-auto">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={mockChartDataRevenue}>
                                <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20 flex flex-col justify-between">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Participantes</CardTitle>
                    <Users className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-end">
                    <div className="text-2xl font-bold">842</div>
                    <p className="text-xs text-muted-foreground mb-4">
                        Usuários únicos nesta semana
                    </p>
                    <div className="h-12 w-full mt-auto">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={mockChartDataUsers}>
                                <Line type="monotone" dataKey="value" stroke="#f97316" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
