import React, { useState, useEffect, useRef } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, ArrowLeft, Send, Search, Trophy, User, Calendar, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";

interface AdminSupportDashboardProps {
    onClose?: () => void;
}

interface Winner {
    userId: string | number;
    userName: string;
    userAvatar?: string;
    raffleTitle: string;
    raffleDate: string;
    raffleId: string;
}

interface Message {
    id: number;
    sender_id: number;
    receiver_id: number;
    content: string;
    created_at: string;
}

interface UserDetails {
    id: number;
    name: string;
    email: string;
    role: string;
    cpf?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    createdAt: string;
    orders?: any[];
}

export const AdminSupportDashboard: React.FC<AdminSupportDashboardProps> = ({ onClose }) => {
    const [view, setView] = useState<'list' | 'chat'>('list');
    const [winners, setWinners] = useState<Winner[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUser, setSelectedUser] = useState<Winner | null>(null);
    const [userDetails, setUserDetails] = useState<UserDetails | null>(null);

    // Chat states
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const bottomRef = useRef<HTMLDivElement>(null);

    // Initial Fetch: Get Winners
    useEffect(() => {
        const fetchWinners = async () => {
            try {
                // We derive winners from the Admin Raffles list
                const raffles = await api.getAdminRaffles();
                const closedWithWinners = raffles.filter((r: any) =>
                    r.status === 'encerrado' && r.winner && r.winner.id
                );

                const mappedWinners: Winner[] = closedWithWinners.map((r: any) => ({
                    userId: r.winner.id,
                    userName: r.winner.name || "Usuário Desconhecido",
                    userAvatar: r.winner.picture,
                    raffleTitle: r.titulo,
                    raffleDate: r.dataFim,
                    raffleId: r.id
                }));

                // Remove duplicates (same user won multiple times)
                const uniqueWinners = Array.from(new Map(mappedWinners.map(w => [w.userId, w])).values());

                setWinners(uniqueWinners);
            } catch (error) {
                console.error("Failed to fetch winners", error);
                toast.error("Erro ao carregar ganhadores");
            }
        };

        fetchWinners();
    }, []);

    // Polling for chat messages when in chat view
    useEffect(() => {
        if (view === 'chat' && selectedUser) {
            const fetchMessages = async () => {
                try {
                    const msgs = await api.getMessages(selectedUser.userId);
                    setMessages(msgs);
                } catch (error) {
                    console.error("Error fetching messages", error);
                }
            };

            fetchMessages();
            const interval = setInterval(fetchMessages, 3000); // 3s polling
            return () => clearInterval(interval);
        }
    }, [view, selectedUser]);

    // Fetch Full User Details when a user is selected
    useEffect(() => {
        if (selectedUser) {
            const fetchDetails = async () => {
                try {
                    const details = await api.getAdminUserDetails(selectedUser.userId);
                    setUserDetails(details);
                } catch (error) {
                    console.error("Error fetching user details", error);
                    toast.error("Erro ao carregar detalhes do usuário");
                }
            };
            fetchDetails();
        }
    }, [selectedUser]);

    // Auto-scroll
    useEffect(() => {
        if (view === 'chat' && bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, view]);

    const handleSelectUser = (winner: Winner) => {
        setSelectedUser(winner);
        setView('chat');
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedUser) return;

        try {
            await api.sendMessage(1, selectedUser.userId, newMessage); // Assuming Admin ID is 1
            setNewMessage("");
            const msgs = await api.getMessages(selectedUser.userId);
            setMessages(msgs);
        } catch (error) {
            toast.error("Erro ao enviar mensagem");
        }
    };

    const handleBack = () => {
        setView('list');
        setSelectedUser(null);
        setUserDetails(null);
    };

    const filteredWinners = winners.filter(w =>
        w.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.raffleTitle.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // --- RENDER: LIST VIEW ---
    if (view === 'list') {
        return (
            <div className="flex flex-col h-full bg-background">
                <div className="p-4 border-b bg-card">
                    <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
                        <Trophy className="w-5 h-5 text-primary" />
                        Central do Ganhador
                    </h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar ganhador ou sorteio..."
                            className="pl-9"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <ScrollArea className="flex-1 p-4">
                    {filteredWinners.length === 0 ? (
                        <div className="text-center text-muted-foreground py-8">
                            Nenhum ganhador encontrado.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredWinners.map((winner) => (
                                <Card
                                    key={`${winner.userId}-${winner.raffleId}`}
                                    onClick={() => handleSelectUser(winner)}
                                    className="cursor-pointer hover:bg-accent/50 transition-colors border-l-4 border-l-primary"
                                >
                                    <CardContent className="p-3 flex items-center gap-3">
                                        <Avatar className="h-10 w-10 border">
                                            <AvatarImage src={winner.userAvatar} />
                                            <AvatarFallback>{winner.userName.substring(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 overflow-hidden">
                                            <h3 className="font-medium truncate">{winner.userName}</h3>
                                            <p className="text-xs text-muted-foreground truncate">
                                                Ganhou: <span className="text-primary">{winner.raffleTitle}</span>
                                            </p>
                                        </div>
                                        <Button size="icon" variant="ghost" className="h-8 w-8">
                                            <MessageSquare className="w-4 h-4 text-muted-foreground" />
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </div>
        );
    }

    // --- RENDER: CHAT & DETAILS VIEW ---
    return (
        <div className="flex flex-col h-full bg-background">
            {/* Header */}
            <div className="p-3 border-b bg-card flex items-center gap-2 shadow-sm z-10">
                <Button size="icon" variant="ghost" onClick={handleBack} className="h-8 w-8">
                    <ArrowLeft className="w-4 h-4" />
                </Button>
                {userDetails && (
                    <div className="flex items-center gap-2 flex-1">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={selectedUser?.userAvatar} />
                            <AvatarFallback>{userDetails.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h3 className="font-bold text-sm leading-none">{userDetails.name}</h3>
                            <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                <Trophy className="w-3 h-3 text-primary" />
                                {selectedUser?.raffleTitle}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Content: Split into Info (Top/Small) and Chat (Bottom/Grow) */}
            <ScrollArea className="flex-1 bg-muted/30">
                <div className="p-4 space-y-4">

                    {/* User Details Card */}
                    {userDetails && (
                        <Card className="bg-card/50 border-dashed">
                            <CardContent className="p-3 space-y-2 text-sm">
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground flex items-center gap-1">
                                            <User className="w-3 h-3" /> CPF
                                        </span>
                                        <span className="font-medium">{userDetails.cpf || 'Não informado'}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground flex items-center gap-1">
                                            <Phone className="w-3 h-3" /> Telefone
                                        </span>
                                        <span className="font-medium">{userDetails.phone || 'Não informado'}</span>
                                    </div>
                                    <div className="flex flex-col col-span-2">
                                        <span className="text-muted-foreground flex items-center gap-1">
                                            <MapPin className="w-3 h-3" /> Endereço
                                        </span>
                                        <span className="font-medium truncate">
                                            {userDetails.city ? `${userDetails.city}, ${userDetails.state}` : 'Não informado'}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Chat Area */}
                    <div className="space-y-4 pb-2">
                        {messages.length === 0 ? (
                            <div className="text-center text-muted-foreground text-xs py-8">
                                Nenhuma mensagem ainda. Inicie a conversa!
                            </div>
                        ) : (
                            messages.map((msg) => {
                                const isMe = String(msg.sender_id) === String(1); // Admin is 1
                                return (
                                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`
                                            max-w-[85%] rounded-2xl px-3 py-2 text-sm
                                            ${isMe ? 'bg-primary text-primary-foreground rounded-tr-none' : 'bg-muted text-foreground rounded-tl-none'}
                                        `}>
                                            <p>{msg.content}</p>
                                            <span className={`text-[10px] block text-right mt-1 ${isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={bottomRef} />
                    </div>

                </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-3 bg-background border-t">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Input
                        placeholder="Digite sua mensagem para o ganhador..."
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        className="flex-1"
                    />
                    <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                        <Send className="w-4 h-4" />
                    </Button>
                </form>
            </div>
        </div>
    );
};
