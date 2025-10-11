// components/dashboard/Activities/Activities.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow, format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { 
  Calendar, 
  UserX, 
  UserCheck, 
  Trash2, 
  UserPlus, 
  AlertCircle, 
  CheckCircle,
  Filter,
  Search,
  RefreshCw
} from 'lucide-react';
import { EventService } from '../../../services/firebase/eventService';
import { useAuth } from '../../../hooks/useAuth';
import { useNotifications } from '../../../hooks/useNotifications';
import { Activity } from '../../../types';
import './Activities.scss';

type ActivityType = Activity['type'] | 'all';

const Activities: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { notifications, markAsRead, markAllAsRead } = useNotifications(20);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<ActivityType>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [showNotifications, setShowNotifications] = useState(true);

  const loadActivities = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const data = await EventService.getRecentActivities(user.id, 50); // Load more activities
      setActivities(data);
    } catch (error) {
      console.error('Error loading activities:', error);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, [user]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadActivities();
    setRefreshing(false);
  };

  const handleNotificationClick = async (notification: any) => {
    // Mark as read
    await markAsRead(notification.id);
    
    // Navigate to action URL if available
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  const handleActivityClick = (activity: Activity) => {
    if (activity.eventId) {
      navigate(`/dashboard/events/${activity.eventId}`);
    } else if (activity.contactId) {
      navigate(`/dashboard/contacts`);
    } else if (activity.eventGuestId) {
      navigate(`/dashboard/contacts`);
    }
  };

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'guest_response':
      case 'guest_accepted':
        return <UserCheck size={20} className="activity__icon--success" />;
      case 'event_created':
        return <Calendar size={20} className="activity__icon--info" />;
      case 'guest_declined':
        return <UserX size={20} className="activity__icon--error" />;
      case 'guest_maybe':
        return <AlertCircle size={20} className="activity__icon--warning" />;
      case 'event_deleted':
      case 'event_cancelled':
        return <Trash2 size={20} className="activity__icon--error" />;
      case 'contact_added':
        return <UserPlus size={20} className="activity__icon--success" />;
      case 'event_updated':
      case 'contact_updated':
        return <CheckCircle size={20} className="activity__icon--info" />;
      default:
        return <CheckCircle size={20} className="activity__icon--default" />;
    }
  };

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || activity.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const activityTypeLabels: Record<ActivityType, string> = {
    all: 'Wszystkie',
    event_created: 'Wydarzenia utworzone',
    event_updated: 'Wydarzenia zaktualizowane',
    event_deleted: 'Wydarzenia usunięte',
    event_cancelled: 'Wydarzenia anulowane',
    guest_accepted: 'Potwierdzenia',
    guest_declined: 'Odrzucenia',
    guest_maybe: 'Niezdecydowani',
    guest_response: 'Odpowiedzi gości',
    contact_added: 'Kontakty dodane',
    contact_updated: 'Kontakty zaktualizowane'
  };

  return (
    <div className="activities">
      <div className="activities__header">
        <div className="activities__title-section">
          <h1 className="activities__title">Aktywności</h1>
          <p className="activities__subtitle">
            Historia wszystkich aktywności w Twoich wydarzeniach
          </p>
        </div>
        
        <button 
          className="activities__refresh-btn"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw size={16} className={refreshing ? 'activities__refresh-icon--spinning' : ''} />
          Odśwież
        </button>
      </div>

      <div className="activities__controls">
        <div className="activities__search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Szukaj aktywności..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="activities__search-input"
          />
        </div>

        <div className="activities__filter">
          <Filter size={16} />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as ActivityType)}
            className="activities__filter-select"
          >
            {Object.entries(activityTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Notifications Section */}
      {showNotifications && notifications.length > 0 && (
        <div className="activities__notifications">
          <div className="activities__notifications-header">
            <h2>Powiadomienia</h2>
            <div className="activities__notifications-actions">
              <button 
                onClick={markAllAsRead}
                className="activities__mark-all-read"
              >
                Oznacz wszystkie jako przeczytane
              </button>
              <button 
                onClick={() => setShowNotifications(false)}
                className="activities__hide-notifications"
              >
                Ukryj
              </button>
            </div>
          </div>
          
          <div className="activities__notifications-list">
            {notifications.slice(0, 5).map((notification) => (
              <div 
                key={notification.id}
                className={`activities__notification ${!notification.read ? 'activities__notification--unread' : ''}`}
                onClick={() => handleNotificationClick(notification)}
                style={{ cursor: notification.actionUrl ? 'pointer' : 'default' }}
              >
                <div className={`activities__notification-icon activities__notification-icon--${notification.priority}`}>
                  {notification.type === 'activity' && <CheckCircle size={20} />}
                  {notification.type === 'system' && <AlertCircle size={20} />}
                  {notification.type === 'reminder' && <Calendar size={20} />}
                  {notification.type === 'warning' && <AlertCircle size={20} />}
                </div>
                <div className="activities__notification-content">
                  <div className="activities__notification-title">{notification.title}</div>
                  <div className="activities__notification-message">{notification.message}</div>
                  <div className="activities__notification-time">
                    {formatDistanceToNow(notification.timestamp, { 
                      addSuffix: true, 
                      locale: pl 
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
      )}

      <div className="activities__content">
        {loading ? (
          <div className="activities__loading">
            <div className="activities__spinner"></div>
            <p>Ładowanie aktywności...</p>
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="activities__empty">
            <Calendar size={64} />
            <h3>
              {searchQuery || filterType !== 'all' 
                ? 'Brak aktywności pasujących do filtrów'
                : 'Brak aktywności'
              }
            </h3>
            <p>
              {searchQuery || filterType !== 'all'
                ? 'Spróbuj zmienić kryteria wyszukiwania lub filtry'
                : 'Aktywności pojawią się tutaj gdy goście będą odpowiadać na zaproszenia lub gdy utworzysz nowe wydarzenia'
              }
            </p>
          </div>
        ) : (
          <div className="activities__list">
            {filteredActivities.map((activity) => (
              <div 
                key={activity.id} 
                className="activities__item"
                onClick={() => handleActivityClick(activity)}
                style={{ cursor: activity.eventId || activity.contactId || activity.eventGuestId ? 'pointer' : 'default' }}
              >
                <div className="activities__icon">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="activities__content-item">
                  <p className="activities__message">{activity.message}</p>
                  <div className="activities__meta">
                    <span className="activities__time">
                      {formatDistanceToNow(activity.timestamp, { 
                        addSuffix: true, 
                        locale: pl 
                      })}
                    </span>
                    <span className="activities__date">
                      {format(activity.timestamp, 'dd.MM.yyyy HH:mm')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Activities;
