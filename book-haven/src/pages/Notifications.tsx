import React, { useEffect, useState } from 'react';

const Notifications = () => {
    const [notifications, setNotifications] = useState<any[]>([]);

    useEffect(() => {
        // Mock data
        setNotifications([
            { id: '1', title: 'Order Confirmed', message: 'Your order #1234 has been confirmed.', isRead: false, createdAt: new Date().toISOString() },
            { id: '2', title: 'New Arrival', message: 'Check out the new releases in Fiction.', isRead: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
        ]);
    }, []);

    return (
        <div className="container mx-auto p-8">
            <h1 className="text-3xl font-bold mb-8">Notifications</h1>

            <div className="space-y-4 max-w-2xl">
                {notifications.map((notif) => (
                    <div key={notif.id} className={`p-4 rounded-lg border ${notif.isRead ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-200'}`}>
                        <div className="flex justify-between items-start">
                            <h3 className={`font-semibold ${notif.isRead ? 'text-gray-700' : 'text-blue-800'}`}>{notif.title}</h3>
                            <span className="text-xs text-gray-500">{new Date(notif.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-gray-600 mt-1">{notif.message}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Notifications;
