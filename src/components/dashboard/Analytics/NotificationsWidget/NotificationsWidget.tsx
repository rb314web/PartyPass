// components/dashboard/Analytics/NotificationsWidget/NotificationsWidget.tsx
import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, CheckCircle, X, Settings } from 'lucide-react';
import { useAuth } from '../../../../hooks/useAuth';
import './NotificationsWidget.scss';

interface AnalyticsNotification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

const NotificationsWidget: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AnalyticsNotification[]>(
    []
  );
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    // Mock notifications for demonstration
    const mockNotifications: AnalyticsNotification[] = [
      {
        id: '1',
        type: 'success',
        title: 'Świetny wzrost!',
        message:
          'Twoje wydarzenia przyciągnęły 40% więcej gości w tym miesiącu',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        isRead: false,
        actionUrl: '/dashboard/analytics',
        metadata: { growthRate: 40 },
      },
      {
        id: '2',
        type: 'warning',
        title: 'Niski wskaźnik odpowiedzi',
        message:
          'Wydarzenie "Spotkanie zespołu" ma tylko 45% potwierdzonych gości',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        isRead: false,
        actionUrl: '/dashboard/events/123',
        metadata: { eventId: '123', rsvpRate: 45 },
      },
      {
        id: '3',
        type: 'info',
        title: 'Cotygodniowy raport',
        message: 'Twój tygodniowy raport analityczny jest gotowy do pobrania',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        isRead: true,
        actionUrl: '/dashboard/analytics',
        metadata: { reportType: 'weekly' },
      },
      {
        id: '4',
        type: 'error',
        title: 'Problem z synchronizacją',
        message:
          'Wystąpił problem z synchronizacją danych. Niektóre metryki mogą być opóźnione',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
        isRead: true,
        metadata: { errorCode: 'SYNC_ERROR' },
      },
    ];

    setNotifications(mockNotifications);
  }, [user?.id]);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      )
    );
  };

  const dismissNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
  };

  const getIcon = (type: AnalyticsNotification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={16} />;
      case 'warning':
        return <AlertTriangle size={16} />;
      case 'error':
        return <AlertTriangle size={16} />;
      case 'info':
        return <Bell size={16} />;
      default:
        return <Bell size={16} />;
    }
  };

  const formatTimestamp = (timestamp: Date): string => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes} min temu`;
    } else if (hours < 24) {
      return `${hours} godz. temu`;
    } else {
      return `${days} dni temu`;
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const displayedNotifications = showAll
    ? notifications
    : notifications.slice(0, 3);

  return (
    <div className="notifications-widget">
      <div className="notifications-widget__header">
        <div className="notifications-widget__title">
          <Bell size={20} />
          <h3>Powiadomienia analityczne</h3>
          {unreadCount > 0 && (
            <span className="notifications-widget__badge">{unreadCount}</span>
          )}
        </div>
        <button
          className="notifications-widget__settings"
          title="Ustawienia powiadomień"
        >
          <Settings size={16} />
        </button>
      </div>

      <div className="notifications-widget__content">
        {displayedNotifications.length === 0 ? (
          <div className="notifications-widget__empty">
            <Bell size={32} />
            <p>Brak nowych powiadomień</p>
          </div>
        ) : (
          <div className="notifications-widget__list">
            {displayedNotifications.map(notification => (
              <div
                key={notification.id}
                className={`notifications-widget__item notifications-widget__item--${notification.type} ${
                  !notification.isRead
                    ? 'notifications-widget__item--unread'
                    : ''
                }`}
                onClick={() =>
                  !notification.isRead && markAsRead(notification.id)
                }
              >
                <div className="notifications-widget__item-icon">
                  {getIcon(notification.type)}
                </div>

                <div className="notifications-widget__item-content">
                  <div className="notifications-widget__item-header">
                    <h4 className="notifications-widget__item-title">
                      {notification.title}
                    </h4>
                    <span className="notifications-widget__item-time">
                      {formatTimestamp(notification.timestamp)}
                    </span>
                  </div>

                  <p className="notifications-widget__item-message">
                    {notification.message}
                  </p>

                  {notification.actionUrl && (
                    <a
                      href={notification.actionUrl}
                      className="notifications-widget__item-action"
                      onClick={e => e.stopPropagation()}
                    >
                      Zobacz szczegóły
                    </a>
                  )}
                </div>

                <button
                  className="notifications-widget__item-dismiss"
                  onClick={e => {
                    e.stopPropagation();
                    dismissNotification(notification.id);
                  }}
                  title="Odrzuć powiadomienie"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {notifications.length > 3 && (
          <div className="notifications-widget__footer">
            <button
              className="notifications-widget__toggle"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll
                ? 'Pokaż mniej'
                : `Pokaż wszystkie (${notifications.length})`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsWidget;
