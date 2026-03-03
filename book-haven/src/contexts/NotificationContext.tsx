import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Notification {
    id: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    addNotification: (notification: Omit<Notification, 'id' | 'isRead' | 'createdAt'>) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        // Mock initial notifications
        setNotifications([
            { id: '1', title: 'Welcome to BookVault', message: 'Thank you for joining our community of readers!', isRead: false, createdAt: new Date().toISOString() },
            { id: '2', title: 'New Release', message: 'A new bestseller has been added to the store.', isRead: false, createdAt: new Date(Date.now() - 3600000).toISOString() },
        ]);
    }, []);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const markAsRead = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    };

    const addNotification = (notif: Omit<Notification, 'id' | 'isRead' | 'createdAt'>) => {
        const newNotif: Notification = {
            ...notif,
            id: Math.random().toString(36).substr(2, 9),
            isRead: false,
            createdAt: new Date().toISOString()
        };
        setNotifications(prev => [newNotif, ...prev]);
    };

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead, addNotification }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};
