import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState({});
    const [toasts, setToasts] = useState([]);

    useEffect(() => {
        const stored = localStorage.getItem('bizuplift_notifications');
        if (stored) {
            setNotifications(JSON.parse(stored));
        } else {
            setNotifications({});
            localStorage.setItem('bizuplift_notifications', JSON.stringify({}));
        }
    }, []);

    const persist = (data) => {
        setNotifications(data);
        localStorage.setItem('bizuplift_notifications', JSON.stringify(data));
    };

    const getUserNotifications = (userId) => notifications[userId] || [];

    const getUnreadCount = (userId) => getUserNotifications(userId).filter(n => !n.read).length;

    const addNotification = useCallback((userId, notification) => {
        const userNotifs = notifications[userId] || [];
        const newNotif = { ...notification, id: `n${Date.now()}`, read: false, createdAt: new Date().toISOString() };
        persist({ ...notifications, [userId]: [newNotif, ...userNotifs] });
    }, [notifications]);

    const markRead = (userId, notifId) => {
        const updated = { ...notifications, [userId]: getUserNotifications(userId).map(n => n.id === notifId ? { ...n, read: true } : n) };
        persist(updated);
    };

    const markAllRead = (userId) => {
        const updated = { ...notifications, [userId]: getUserNotifications(userId).map(n => ({ ...n, read: true })) };
        persist(updated);
    };

    const clearAll = (userId) => {
        persist({ ...notifications, [userId]: [] });
    };

    // Toast system
    const showToast = useCallback((message, type = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
    }, []);

    const dismissToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

    return (
        <NotificationContext.Provider value={{
            notifications, toasts,
            getUserNotifications, getUnreadCount,
            addNotification, markRead, markAllRead, clearAll,
            showToast, dismissToast,
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => useContext(NotificationContext);
