// hooks/useNotifications.tsx
import { useState, useEffect, useCallback } from 'react';
import { notificationService, Notification } from '../services/notificationService';
import { useAuth } from './useAuth';

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export const useNotifications = (limit = 20): UseNotificationsReturn => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // Real-time subscription to notifications
  useEffect(() => {
    if (!user?.id) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    const unsubscribe = notificationService.subscribeToNotifications(
      user.id,
      (newNotifications) => {
        setNotifications(newNotifications);
        setLoading(false);
      },
      limit
    );

    return unsubscribe;
  }, [user?.id, limit]);

  // Clean up expired notifications periodically
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      notificationService.deleteExpired();
    }, 60 * 60 * 1000); // Every hour

    return () => clearInterval(cleanupInterval);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      
      // Optimistically update local state
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      await notificationService.markAllAsRead(user.id);
      
      // Optimistically update local state
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, [user?.id]);

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      await notificationService.delete(notificationId);
      
      // Optimistically update local state
      setNotifications(prev => 
        prev.filter(n => n.id !== notificationId)
      );
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, []);

  const refresh = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const newNotifications = await notificationService.getNotifications(user.id, limit);
      setNotifications(newNotifications);
    } catch (error) {
      console.error('Error refreshing notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, limit]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh
  };
};
