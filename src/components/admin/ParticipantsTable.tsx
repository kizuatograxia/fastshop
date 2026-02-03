import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Trophy, ArrowLeft } from "lucide-react";
import { Raffle } from "@/types/raffle";

interface ParticipantsTableProps {
    participants: any[];
    selectedRaffle: Raffle | null;
    onBack: () => void;
    onDrawWinner: () => void;
}

export function ParticipantsTable({ participants, selectedRaffle, onBack, onDrawWinner }: ParticipantsTableProps) {
    // Aggregate participants
    const aggregated = participants.reduce((acc: any, curr: any) => {
        if (!acc[curr.user_id]) {
            acc[curr.user_id] = {
                ...curr,
                ticket_count: 0
            };
        }
        acc[curr.user_id].ticket_count += 1;
        return acc;
    }, {});
    const userList = Object.values(aggregated);

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={onBack}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h2 className="text-2xl font-bold">Participantes</h2>
                    <p className="text-muted-foreground">Sorteio: {selectedRaffle?.titulo}</p>
                </div>
                {selectedRaffle?.status === 'ativo' && (
                    <Button
                        className="ml-auto bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold shadow-lg shadow-orange-500/20"
                        onClick={onDrawWinner}
                    >
                        <Trophy className="w-5 h-5 mr-2" />
                        Realizar Sorteio
                    </Button>
                )}
            </div>

            <div className="bg-card rounded-xl border border-border overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Usuário</TableHead>
                            <TableHead className="text-right">Bilhetes</TableHead>
                            <TableHead className="text-right">Valor Estimado (R$)</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {userList.map((user: any) => (
                            <TableRow key={user.user_id}>
                                <TableCell className="flex items-center gap-3">
                                    <Avatar className="w-8 h-8">
                                        <AvatarImage src={user.picture} />
                                        <AvatarFallback>{user.name?.[0] || "?"}</AvatarFallback>
                                    </Avatar>
                                    <div className="font-medium">{user.name}</div>
                                </TableCell>
                                <TableCell className="text-right font-bold text-lg">{user.ticket_count}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-1 text-primary font-bold">
                                        R$ {(user.ticket_count * (selectedRaffle?.custoNFT || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                        {userList.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                                    Nenhum participante ainda.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
