import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Check, X, Star, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface Review {
    id: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    raffleName: string;
    prizeName: string;
    rating: number;
    comment: string;
    photoUrl?: string;
    createdAt: string;
    status: 'pending' | 'approved' | 'rejected';
}

interface ReviewsListProps {
    reviews: Review[];
    onApprove: (id: string) => void;
    onReject: (id: string) => void;
    onDelete: (id: string) => void;
    isLoading?: boolean;
    showActions?: boolean;
}

export const ReviewsList = ({
    reviews,
    onApprove,
    onReject,
    onDelete,
    isLoading = false,
    showActions = true
}: ReviewsListProps) => {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    if (reviews.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-48 text-center border border-dashed border-white/10 rounded-xl bg-white/5">
                <MessageSquare className="h-10 w-10 text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-md font-medium">Nenhum depoimento encontrado</h3>
                <p className="text-xs text-muted-foreground mt-1">
                    Não há depoimentos nesta categoria.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-card border border-white/10 rounded-xl overflow-hidden shadow-xl">
            <Table>
                <TableHeader className="bg-secondary/50">
                    <TableRow className="hover:bg-transparent border-white/5">
                        <TableHead>Usuário</TableHead>
                        <TableHead>Prêmio / Sorteio</TableHead>
                        <TableHead>Avaliação</TableHead>
                        <TableHead className="w-[40%]">Depoimento</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {reviews.map((review) => (
                        <TableRow key={review.id} className="border-white/5 hover:bg-white/5 transition-colors">
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9 border border-white/10">
                                        <AvatarImage src={review.userAvatar} />
                                        <AvatarFallback>{review.userName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <span className="font-medium text-sm">{review.userName}</span>
                                        <span className="text-xs text-muted-foreground">ID: {review.userId}</span>
                                    </div>
                                </div>
                            </TableCell>

                            <TableCell>
                                <div className="flex flex-col">
                                    <span className="font-medium text-sm text-primary">{review.prizeName}</span>
                                    <span className="text-xs text-muted-foreground">{review.raffleName}</span>
                                </div>
                            </TableCell>

                            <TableCell>
                                <div className="flex items-center gap-0.5">
                                    <span className="font-bold mr-1.5">{(review.rating || 0).toFixed(1)}</span>
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-3.5 h-3.5 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/30"}`}
                                        />
                                    ))}
                                </div>
                            </TableCell>

                            <TableCell>
                                <div className="space-y-2">
                                    <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3">
                                        {review.comment}
                                    </p>
                                    {review.photoUrl && (
                                        <div className="relative group w-fit">
                                            <img
                                                src={review.photoUrl}
                                                alt="Foto do ganhador"
                                                className="h-16 w-24 object-cover rounded-md border border-white/10 cursor-zoom-in hover:brightness-110 transition-all"
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 rounded-md transition-opacity pointer-events-none">
                                                <span className="text-[10px] text-white font-medium">Ver foto</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </TableCell>

                            <TableCell>
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                    {format(new Date(review.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                                </span>
                            </TableCell>

                            <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                    {showActions ? (
                                        <>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-400/10 border-red-400/20"
                                                onClick={() => onReject(review.id)}
                                                title="Rejeitar"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="h-8 w-8 p-0 bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/20"
                                                onClick={() => onApprove(review.id)}
                                                title="Aprovar"
                                            >
                                                <Check className="h-4 w-4" />
                                            </Button>
                                        </>
                                    ) : (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-8 w-8 p-0 text-red-500 hover:text-red-400 hover:bg-red-500/10 border-red-500/20"
                                            onClick={() => onDelete(review.id)}
                                            title="Deletar permanentemente"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};
