import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Notification as NotificationType } from '@/types/notification';
import { useAuth } from '@/contexts/AuthContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface NotificationListProps {
    onUnreadCountChange?: (count: number) => void;
}

const NotificationList: React.FC<NotificationListProps> = ({ onUnreadCountChange }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<NotificationType[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Request browser permission
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    const fetchNotifications = async () => {
        if (!user) return;
        try {
            const data = await api.getNotifications(parseInt(user.id));

            // Check for new notifications to trigger system alert
            if (notifications.length > 0) {
                const newUnread = data.filter((n: NotificationType) =>
                    !n.read && !notifications.some(existing => existing.id === n.id)
                );

                if (newUnread.length > 0 && 'Notification' in window && Notification.permission === 'granted') {
                    newUnread.forEach((n: NotificationType) => {
                        new Notification(n.title, {
                            body: n.message,
                            icon: '/favicon.ico' // Assuming favicon exists
                        });
                    });
                }
            }

            setNotifications(data);
            const unread = data.filter((n: NotificationType) => !n.read).length;
            if (onUnreadCountChange) onUnreadCountChange(unread);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Poll every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [user]);

    const handleMarkAsRead = async (id: number) => {
        try {
            await api.markNotificationRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
            // Recalculate unread
            const unread = notifications.filter(n => !n.read && n.id !== id).length;
            if (onUnreadCountChange) onUnreadCountChange(unread);
        } catch (error) {
            console.error(error);
        }
    };

    if (loading && notifications.length === 0) {
        return <div className="p-4 text-center text-sm text-muted-foreground">Carregando...</div>;
    }

    if (notifications.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center">
                <Bell className="h-8 w-8 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">Nenhuma notificação</p>
            </div>
        );
    }

    return (
        <ScrollArea className="h-[300px]">
            <div className="flex flex-col gap-1 p-1">
                {notifications.map((notification) => (
                    <div
                        key={notification.id}
                        className={`p-3 rounded-lg border transition-colors ${notification.read
                            ? 'bg-background border-transparent'
                            : 'bg-secondary/30 border-secondary'
                            }`}
                    >
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                                <h4 className={`text-sm font-semibold ${!notification.read ? 'text-primary' : 'text-foreground'}`}>
                                    {notification.title}
                                </h4>
                                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                    {notification.message}
                                </p>
                                <span className="text-[10px] text-muted-foreground/60 mt-2 block">
                                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: ptBR })}
                                </span>
                            </div>
                            {!notification.read && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 shrink-0"
                                    onClick={() => handleMarkAsRead(notification.id)}
                                    title="Marcar como lida"
                                >
                                    <Check className="h-3 w-3" />
                                </Button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </ScrollArea>
    );
};

export default NotificationList;
