import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { pl } from 'date-fns/locale';
import { Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import { useNotifications } from '../../../hooks/useNotifications';

interface ActivitiesNotificationsPanelProps {
  onHide: () => void;
}

const ActivitiesNotificationsPanel: React.FC<
  ActivitiesNotificationsPanelProps
> = ({ onHide }) => {
  const navigate = useNavigate();
  const { notifications, markAsRead, markAllAsRead } = useNotifications(20);

  if (notifications.length === 0) {
    return null;
  }

  const handleNotificationClick = async (notification: {
    id: string;
    actionUrl?: string;
  }) => {
    await markAsRead(notification.id);

    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  return (
    <div className="activities__notifications">
      <div className="activities__notifications-header">
        <h2>Powiadomienia</h2>
        <div className="activities__notifications-actions">
          <button
            onClick={markAllAsRead}
            className="activities__mark-all-read"
            type="button"
          >
            Oznacz wszystkie jako przeczytane
          </button>
          <button
            onClick={onHide}
            className="activities__hide-notifications"
            type="button"
          >
            Ukryj
          </button>
        </div>
      </div>

      <div className="activities__notifications-list">
        {notifications.slice(0, 5).map(notification => (
          <div
            key={notification.id}
            className={`activities__notification ${!notification.read ? 'activities__notification--unread' : ''}`}
            onClick={() => handleNotificationClick(notification)}
            style={{
              cursor: notification.actionUrl ? 'pointer' : 'default',
            }}
          >
            <div
              className={`activities__notification-icon activities__notification-icon--${notification.priority}`}
            >
              {notification.type === 'activity' && <CheckCircle size={20} />}
              {notification.type === 'system' && <AlertCircle size={20} />}
              {notification.type === 'reminder' && <Calendar size={20} />}
              {notification.type === 'warning' && <AlertCircle size={20} />}
            </div>
            <div className="activities__notification-content">
              <div className="activities__notification-title">
                {notification.title}
              </div>
              <div className="activities__notification-message">
                {notification.message}
              </div>
              <div className="activities__notification-time">
                {formatDistanceToNow(notification.timestamp, {
                  addSuffix: true,
                  locale: pl,
                })}
              </div>
            </div>
            {!notification.read && (
              <div className="activities__notification-badge"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivitiesNotificationsPanel;
