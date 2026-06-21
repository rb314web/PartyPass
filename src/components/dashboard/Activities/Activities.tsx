// components/dashboard/Activities/Activities.tsx
import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
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
  Activity as ActivityIcon,
} from 'lucide-react';
import { EventService } from '../../../services/firebase/eventService';
import { useAuth } from '../../../hooks/useAuth';
import { Activity } from '../../../types';
import { useDashboardViewMotion } from '../../../hooks/useDashboardViewMotion';
import DashboardViewSkeleton from '../DashboardViewSkeleton/DashboardViewSkeleton';
import DashboardViewBody from '../DashboardViewBody/DashboardViewBody';
import PageHeader from '../../common/PageHeader/PageHeader';
import './Activities.scss';

const ActivitiesNotificationsPanel = lazy(
  () => import('./ActivitiesNotificationsPanel')
);

type ActivityType = Activity['type'] | 'all';

const Activities: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activities, setActivities] = useState<Activity[]>([]);
  const {
    showLoader,
    showContent,
    className: viewClassName,
    startLoading,
    finishLoading,
  } = useDashboardViewMotion({
    variant: 'async',
    pageClass: 'activities',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<ActivityType>('all');
  const [showNotifications, setShowNotifications] = useState(true);

  const loadActivities = useCallback(async () => {
    if (!user?.id) return;

    try {
      startLoading();
      const data = await EventService.getRecentActivities(user.id, 50); // Load more activities
      setActivities(data);
      finishLoading();
    } catch (error) {
      console.error('Error loading activities:', error);
      setActivities([]);
      finishLoading();
    }
  }, [user?.id, startLoading, finishLoading]);

  useEffect(() => {
    loadActivities();
  }, [user, loadActivities]);

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
    const matchesSearch = activity.message
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
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
    contact_updated: 'Kontakty zaktualizowane',
  };

  return (
    <div className={viewClassName}>
      <PageHeader
        title="Aktywności"
        subtitle="Historia wszystkich aktywności w Twoich wydarzeniach"
        icon={ActivityIcon}
      />

      <DashboardViewBody
        showLoader={showLoader}
        showContent={showContent}
        loader={<DashboardViewSkeleton variant="list" />}
      >
      <div className="activities__controls">
        <div className="pp-search activities__search">
          <Search size={16} className="pp-search__icon" aria-hidden="true" />
          <input
            type="text"
            placeholder="Szukaj aktywności..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pp-input"
            aria-label="Szukaj aktywności"
          />
        </div>

        <div className="activities__filter">
          <Filter size={16} aria-hidden="true" />
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value as ActivityType)}
            className="pp-select activities__filter-select"
            aria-label="Filtruj aktywności"
          >
            {Object.entries(activityTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {showNotifications && (
        <Suspense fallback={null}>
          <ActivitiesNotificationsPanel
            onHide={() => setShowNotifications(false)}
          />
        </Suspense>
      )}

      <div className="activities__content">
        {filteredActivities.length === 0 ? (
          <div className="activities__empty">
            <div className="activities__empty-icon">
              <Calendar />
            </div>
            <h3>
              {searchQuery || filterType !== 'all'
                ? 'Brak aktywności pasujących do filtrów'
                : 'Brak aktywności'}
            </h3>
            <p>
              {searchQuery || filterType !== 'all'
                ? 'Spróbuj zmienić kryteria wyszukiwania lub filtry'
                : 'Aktywności pojawią się tutaj gdy goście będą odpowiadać na zaproszenia lub gdy utworzysz nowe wydarzenia'}
            </p>
          </div>
        ) : (
          <div className="activities__list">
            {filteredActivities.map(activity => (
              <div
                key={activity.id}
                className="activities__item"
                onClick={() => handleActivityClick(activity)}
                style={{
                  cursor:
                    activity.eventId ||
                    activity.contactId ||
                    activity.eventGuestId
                      ? 'pointer'
                      : 'default',
                }}
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
                        locale: pl,
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
      </DashboardViewBody>
    </div>
  );
};

export default Activities;
