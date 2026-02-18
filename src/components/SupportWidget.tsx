import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { MessageSquare, Shield, Send } from "lucide-react";
import { api } from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { AdminSupportDashboard } from "@/components/admin/AdminSupportDashboard";

interface Message {
    id: number;
    sender_id: number;
    receiver_id: number;
    content: string;
    created_at: string;
}

export const SupportWidget: React.FC = () => {
    const { user, isAuthenticated } = useAuth();
    const [isVisible, setIsVisible] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");

    const [hasUnread, setHasUnread] = useState(false);

    // 1. Initial Visibility Check
    useEffect(() => {
        if (!isAuthenticated || !user) {
            setIsVisible(false);
            return;
        }

        const checkVisibility = async () => {
            // Admin always sees it
            if (user.role === 'admin') {
                setIsVisible(true);
                return;
            }

            try {
                // User sees if they have messages OR won a raffle
                const [msgs, notifications] = await Promise.all([
                    api.getMessages(user.id).catch(() => []),
                    api.getNotifications(user.id).catch(() => [])
                ]);

                // Check messages
                if (msgs && msgs.length > 0) {
                    setMessages(msgs);
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
    }, [isAuthenticated, user]);

    // 2. Polling for new messages
    // 2. Polling for new messages
    useEffect(() => {
        if (!isAuthenticated || !user || user.role === 'admin') return;

        // Poll more frequently (3s) if chat is open, otherwise slower (15s) to check for notification bubble
        const intervalTime = isChatOpen ? 3000 : 5000;
        let lastMessageCount = messages.length;

        const interval = setInterval(() => {
            api.getMessages(user.id).then(msgs => {
                if (msgs.length > lastMessageCount) {
                    // New message detected!
                    const newMsg = msgs[msgs.length - 1];
                    const isAdminMsg = String(newMsg.sender_id) !== String(user.id);

                    setMessages(msgs);
                    lastMessageCount = msgs.length;

                    if (!isChatOpen && isAdminMsg) {
                        setHasUnread(true);
                        toast.info("Nova mensagem do Suporte", {
                            description: newMsg.content,
                            action: {
                                label: "Ver",
                                onClick: () => setIsChatOpen(true)
                            }
                        });
                        // Optional: Play sound here
                    }
                } else if (msgs.length !== lastMessageCount) {
                    // Just sync if deleted or something (unlikely but good practice)
                    setMessages(msgs);
                    lastMessageCount = msgs.length;
                }
            }).catch(() => { });
        }, intervalTime);

        return () => clearInterval(interval);
    }, [isAuthenticated, user, isChatOpen, messages.length]); // Depend on messages.length to reset logic if needed

    const bottomRef = useRef<HTMLDivElement>(null);

    // 3. Auto-scroll chat
    useEffect(() => {
        if (isChatOpen && bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isChatOpen]);

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!newMessage.trim() || !user) return;

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

    // Remove the early return so the component stays mounted for polling and Dialog handling
    // if (!isVisible) return null;

    // --- ADMIN VIEW: DASHBOARD ---
    if (user?.role === 'admin') {
        // Admin always visible, or we could respect isVisible if we wanted to toggle it
        return (
            <Dialog>
                <DialogTrigger asChild>
                    <Button
                        className="fixed bottom-6 left-6 z-50 rounded-full shadow-2xl h-14 px-6 bg-gradient-to-r from-red-600 to-red-900 border border-red-500/50 hover:scale-105 transition-all animate-in fade-in slide-in-from-bottom-4 duration-500"
                    >
                        <Shield className="w-5 h-5 mr-2" />
                        Admin Dashboard
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[450px] h-[600px] flex flex-col p-0 gap-0 overflow-hidden bg-background">
                    <AdminSupportDashboard />
                </DialogContent>
            </Dialog>
        );
    }

    // --- USER VIEW: SIMPLE CHAT ---
    return (
        <>
            {isVisible && (
                <Button
                    onClick={() => setIsChatOpen(true)}
                    className="fixed bottom-6 left-6 z-50 rounded-full shadow-2xl h-14 w-14 p-0 bg-primary hover:bg-primary/90 hover:scale-110 transition-all animate-bounce-subtle"
                >
                    <MessageSquare className="w-6 h-6 text-primary-foreground" />
                    {hasUnread && (
                        <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-ping" />
                    )}
                </Button>
            )}

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

                    <ScrollArea className="flex-1 p-4 bg-background/50">
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
                            <div ref={bottomRef} />
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
