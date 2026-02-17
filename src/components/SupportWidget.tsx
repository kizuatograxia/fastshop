import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { MessageSquare, Shield, X, Send, Minimize2, Maximize2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface Message {
    id: number;
    sender_id: number;
    receiver_id: number;
    content: string;
    created_at: string;
}

export const SupportWidget: React.FC = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [isVisible, setIsVisible] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);
    const [hasUnread, setHasUnread] = useState(false);

    useEffect(() => {
        if (!isAuthenticated || !user) {
            setIsVisible(false);
            return;
        }

        const checkVisibility = async () => {
            // 1. Admin always sees it
            if (user.role === 'admin') {
                setIsVisible(true);
                return;
            }

            try {
                // 2. User sees if they have messages OR won a raffle
                const [msgs, notifications] = await Promise.all([
                    api.getMessages(user.id).catch(() => []),
                    api.getNotifications(user.id).catch(() => [])
                ]);

                // Check messages
                if (msgs && msgs.length > 0) {
                    setIsVisible(true);
                    setMessages(msgs);
                    // Simple unread check improvement could be done here
                }

                // Check notifications for "Ganhou" or "Won"
                const hasWon = notifications.some((n: any) =>
                    n.title.toLowerCase().includes('ganhou') ||
                    n.message.toLowerCase().includes('vencedor')
                );

                if (hasWon) {
                    setIsVisible(true);
                }

            } catch (error) {
                console.error("Error checking support widget visibility", error);
            }
        };

        checkVisibility();

        // Poll for new messages when visible or chat is open
        useEffect(() => {
            if (!isAuthenticated || !user || user.role === 'admin') return;

            // Poll more frequently (3s) if chat is open, otherwise slower (15s) to check for notification bubble
            const intervalTime = isChatOpen ? 3000 : 15000;

            const interval = setInterval(() => {
                api.getMessages(user.id).then(msgs => {
                    if (msgs.length > 0) {
                        setIsVisible(true);
                        setMessages(msgs);
                        // If chat is NOT open, we could track "unread" here by comparing length or last message ID
                        if (!isChatOpen) {
                            setHasUnread(true);
                        }
                    }
                }).catch(() => { });
            }, intervalTime);

            return () => clearInterval(interval);
        }, [isAuthenticated, user, isChatOpen]);

        // Auto-scroll chat
        useEffect(() => {
            if (isChatOpen && scrollRef.current) {
                scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            }
        }, [messages, isChatOpen]);

        const handleSendMessage = async (e?: React.FormEvent) => {
            e?.preventDefault();
            if (!newMessage.trim() || !user) return;

            // Admin ID is usually 1 or handled by backend. 
            // For now, let's assume we send TO admin (id=1 or special handler)
            // Adjust logic if Admin has specific ID. 
            // The current backend likely expects a specific receiver_id.
            // Let's assume receiver is Admin (ID 1, 2, or dynamic).
            // Since we don't have a fixed Admin ID constant, we might need to find one.
            // OR the backend handles "support" messages.
            // Workaround: Send to ID 1 (Bruno/First User) if we don't know.
            // Better: The previous chat implementation relied on `sender_id` and `receiver_id`.
            // We need a stable Admin ID. Let's try 1 for now, or fetch admin list.
            const ADMIN_ID = 1; // Defaulting to first user/admin

            try {
                await api.sendMessage(user.id, ADMIN_ID, newMessage);
                setNewMessage("");
                const msgs = await api.getMessages(user.id);
                setMessages(msgs);
            } catch (error) {
                toast.error("Erro ao enviar mensagem");
            }
        };

        if (!isVisible) return null;

        if (user?.role === 'admin') {
            return (
                <Button
                    onClick={() => navigate('/admin')}
                    className="fixed bottom-6 right-6 z-50 rounded-full shadow-2xl h-14 px-6 bg-gradient-to-r from-red-600 to-red-900 border border-red-500/50 hover:scale-105 transition-all animate-in fade-in slide-in-from-bottom-4 duration-500"
                >
                    <Shield className="w-5 h-5 mr-2" />
                    Painel Admin
                </Button>
            );
        }

        return (
            <>
                <Button
                    onClick={() => setIsChatOpen(true)}
                    className="fixed bottom-6 right-6 z-50 rounded-full shadow-2xl h-14 w-14 p-0 bg-primary hover:bg-primary/90 hover:scale-110 transition-all animate-bounce-subtle"
                >
                    <MessageSquare className="w-6 h-6 text-primary-foreground" />
                    {hasUnread && (
                        <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-ping" />
                    )}
                </Button>

                <Dialog open={isChatOpen} onOpenChange={(open) => {
                    setIsChatOpen(open);
                    if (open) setHasUnread(false);
                }}>
                    <DialogContent className="sm:max-w-[400px] h-[500px] flex flex-col p-0 gap-0 overflow-hidden">
                        <DialogHeader className="p-4 bg-primary/10 border-b">
                            <DialogTitle className="flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-primary" />
                                Suporte
                            </DialogTitle>
                            <DialogDescription className="text-xs">
                                Fale diretamente com nossa equipe.
                            </DialogDescription>
                        </DialogHeader>

                        <ScrollArea className="flex-1 p-4 bg-background/50" ref={scrollRef}>
                            <div className="space-y-4">
                                {messages.length === 0 && (
                                    <div className="text-center text-muted-foreground text-sm py-8">
                                        Inicie a conversa mandando um "Oi"!
                                    </div>
                                )}
                                {messages.map((msg) => {
                                    const isMe = String(msg.sender_id) === String(user?.id);
                                    return (
                                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`
                                            max-w-[85%] rounded-2xl px-3 py-2 text-sm
                                            ${isMe ? 'bg-primary text-primary-foreground rounded-tr-none' : 'bg-muted rounded-tl-none border'}
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

                        <div className="p-3 border-t bg-background">
                            <form onSubmit={handleSendMessage} className="flex gap-2">
                                <Input
                                    placeholder="Digite sua dúvida..."
                                    value={newMessage}
                                    onChange={e => setNewMessage(e.target.value)}
                                    className="flex-1"
                                />
                                <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                                    <Send className="w-4 h-4" />
                                </Button>
                            </form>
                        </div>
                    </DialogContent>
                </Dialog>
            </>
        );
    };
