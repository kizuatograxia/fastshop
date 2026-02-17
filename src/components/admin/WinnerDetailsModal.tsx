import React, { useState, useEffect, useRef } from "react";
import { User, MessageSquare, Send, X, MapPin, Phone, CreditCard } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface WinnerDetailsModalProps {
    userId: number | string;
    isOpen: boolean;
    onClose: () => void;
}

interface UserDetails {
    id: number;
    name: string;
    email: string;
    picture: string;
    cpf?: string;
    phone?: string;
    address?: string;
    city?: string;
    cep?: string;
    state?: string;
    role: string;
}

interface Message {
    id: number;
    sender_id: number;
    receiver_id: number;
    content: string;
    created_at: string;
    sender_name?: string;
}

export const WinnerDetailsModal: React.FC<WinnerDetailsModalProps> = ({ userId, isOpen, onClose }) => {
    const { user: currentUser } = useAuth();
    const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && userId) {
            fetchData();
        }
    }, [isOpen, userId]);

    // Auto-scroll to bottom of chat
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [userRes, chatRes] = await Promise.all([
                api.getAdminUserDetails(userId),
                api.getMessages(userId)
            ]);
            setUserDetails(userRes);
            setMessages(chatRes);
        } catch (error) {
            console.error(error);
            toast.error("Erro ao carregar dados do usuário");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!newMessage.trim() || !currentUser) return;

        try {
            await api.sendMessage(currentUser.id, userId, newMessage);
            setNewMessage("");
            // Refresh messages
            const chatRes = await api.getMessages(userId);
            setMessages(chatRes);
        } catch (error) {
            toast.error("Erro ao enviar mensagem");
        }
    };

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 gap-0 overflow-hidden bg-background">
                <div className="flex h-full">
                    {/* User Details Sidebar */}
                    <div className="w-1/3 border-r bg-muted/30 p-6 space-y-6 overflow-y-auto">
                        <DialogHeader className="p-0">
                            <DialogTitle>Detalhes do Ganhador</DialogTitle>
                        </DialogHeader>

                        {isLoading ? (
                            <div className="text-center py-10">Carregando...</div>
                        ) : userDetails ? (
                            <>
                                <div className="flex flex-col items-center text-center space-y-3">
                                    <Avatar className="w-24 h-24 border-4 border-primary/20">
                                        <AvatarImage src={userDetails.picture} />
                                        <AvatarFallback>{userDetails.name?.substring(0, 2)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className="text-xl font-bold">{userDetails.name}</h3>
                                        <p className="text-sm text-muted-foreground">{userDetails.email}</p>
                                    </div>
                                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium uppercase">
                                        {userDetails.role}
                                    </span>
                                </div>

                                <Separator />

                                <div className="space-y-4">
                                    <h4 className="font-semibold flex items-center gap-2">
                                        <CreditCard className="w-4 h-4" /> Dados Pessoais
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                        <div>
                                            <span className="text-muted-foreground block">CPF</span>
                                            <span className="font-medium">{userDetails.cpf || "Não informado"}</span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground block">Telefone</span>
                                            <span className="font-medium flex items-center gap-2">
                                                <Phone className="w-3 h-3" />
                                                {userDetails.phone || "Não informado"}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                <div className="space-y-4">
                                    <h4 className="font-semibold flex items-center gap-2">
                                        <MapPin className="w-4 h-4" /> Endereço
                                    </h4>
                                    <div className="space-y-2 text-sm bg-background p-3 rounded-lg border">
                                        {userDetails.address ? (
                                            <>
                                                <p>{userDetails.address}</p>
                                                <p>{userDetails.city} - {userDetails.state}</p>
                                                <p className="text-muted-foreground">{userDetails.cep}</p>
                                            </>
                                        ) : (
                                            <p className="text-muted-foreground italic">Endereço não cadastrado</p>
                                        )}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="text-red-500">Usuário não encontrado</div>
                        )}
                    </div>

                    {/* Chat Section */}
                    <div className="flex-1 flex flex-col bg-background">
                        <div className="p-4 border-b flex items-center justify-between">
                            <h3 className="font-semibold flex items-center gap-2">
                                <MessageSquare className="w-4 h-4 text-primary" />
                                Chat com {userDetails?.name?.split(' ')[0]}
                            </h3>
                            <Button variant="ghost" size="icon" onClick={onClose}>
                                <X className="w-4 h-4" />
                            </Button>
                        </div>

                        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                            <div className="space-y-4">
                                {messages.length === 0 && (
                                    <div className="text-center text-muted-foreground py-10 opacity-50">
                                        Nenhuma mensagem ainda. Inicie a conversa!
                                    </div>
                                )}
                                {messages.map((msg) => {
                                    const isMe = String(msg.sender_id) === String(currentUser?.id); // Admin is current user
                                    return (
                                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`
                                                max-w-[80%] rounded-2xl px-4 py-2 text-sm
                                                ${isMe ? 'bg-primary text-primary-foreground rounded-tr-none' : 'bg-muted rounded-tl-none'}
                                            `}>
                                                <p>{msg.content}</p>
                                                <span className="text-[10px] opacity-70 block text-right mt-1">
                                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </ScrollArea>

                        <div className="p-4 border-t bg-muted/10">
                            <form onSubmit={handleSendMessage} className="flex gap-2">
                                <Input
                                    placeholder="Digite sua mensagem..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    className="flex-1"
                                />
                                <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                                    <Send className="w-4 h-4" />
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
