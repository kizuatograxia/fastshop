import React from 'react';
import { useNotifications } from '@/contexts/NotificationContext';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { CheckCheck, BellOff } from 'lucide-react';

const Notifications = () => {
    const { notifications, markAsRead, markAllAsRead } = useNotifications();

    return (
        <Layout>
            <div className="container py-12 max-w-2xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Notifications</h1>
                    {notifications.length > 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={markAllAsRead}
                        >
                            <CheckCheck className="h-4 w-4" />
                            Mark all as read
                        </Button>
                    )}
                </div>

                <div className="space-y-4">
                    {notifications.length > 0 ? (
                        notifications.map((notif) => (
                            <div
                                key={notif.id}
                                onClick={() => markAsRead(notif.id)}
                                className={`p-4 rounded-xl border transition-all cursor-pointer hover:shadow-sm ${notif.isRead
                                        ? 'bg-card border-border opacity-70'
                                        : 'bg-primary/5 border-primary/20 shadow-sm'
                                    }`}
                            >
                                <div className="flex justify-between items-start">
                                    <h3 className={`font-semibold ${notif.isRead ? 'text-foreground' : 'text-primary'}`}>
                                        {notif.title}
                                    </h3>
                                    <span className="text-xs text-muted-foreground">
                                        {new Date(notif.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">{notif.message}</p>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-20 border-2 border-dashed border-border rounded-2xl">
                            <BellOff className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground italic">No notifications yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default Notifications;
