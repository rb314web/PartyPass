// components/dashboard/RecentActivity/RecentActivity.tsx
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { pl } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Calendar, UserX, UserCheck, Trash2, UserPlus, AlertCircle } from 'lucide-react';
import './RecentActivity.scss';

import { Activity as GlobalActivity } from '../../../types';

type Activity = GlobalActivity;

interface RecentActivityProps {
  activities: Activity[];
}

const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  const navigate = useNavigate();

  const handleActivityClick = (activity: Activity) => {
    if (activity.eventId) {
      navigate(`/dashboard/events/${activity.eventId}`);
    } else if (activity.contactId) {
      navigate(`/dashboard/contacts`);
    } else if (activity.eventGuestId) {
      navigate(`/dashboard/guests`);
    }
  };
  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'guest_response':
      case 'guest_accepted':
        return <UserCheck size={16} className="activity__icon--success" />;
      case 'event_created':
        return <Calendar size={16} className="activity__icon--info" />;
      case 'guest_declined':
        return <UserX size={16} className="activity__icon--error" />;
      case 'guest_maybe':
        return <AlertCircle size={16} className="activity__icon--warning" />;
      case 'event_deleted':
      case 'event_cancelled':
        return <Trash2 size={16} className="activity__icon--error" />;
      case 'contact_added':
        return <UserPlus size={16} className="activity__icon--success" />;
      case 'event_updated':
      case 'contact_updated':
        return <CheckCircle size={16} className="activity__icon--info" />;
      default:
        return <CheckCircle size={16} className="activity__icon--default" />;
    }
  };

  return (
    <div className="recent-activity">
      {activities.length === 0 ? (
        <div className="recent-activity__empty">
          <Calendar size={48} />
          <p>Brak nowych aktywności</p>
          <span className="recent-activity__empty-hint">
            Aktywności pojawią się tutaj gdy goście będą odpowiadać na zaproszenia lub gdy utworzysz nowe wydarzenia
          </span>
        </div>
      ) : (
        <div className="recent-activity__list">
          {activities.map((activity) => (
            <div 
              key={activity.id} 
              className="recent-activity__item"
              onClick={() => handleActivityClick(activity)}
              style={{ cursor: activity.eventId || activity.contactId || activity.eventGuestId ? 'pointer' : 'default' }}
            >
              <div className="recent-activity__icon">
                {getActivityIcon(activity.type)}
              </div>
              <div className="recent-activity__content">
                <p className="recent-activity__message">{activity.message}</p>
                <span className="recent-activity__time">
                  {formatDistanceToNow(activity.timestamp, { 
                    addSuffix: true, 
                    locale: pl 
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentActivity;
