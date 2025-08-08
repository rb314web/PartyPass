// components/dashboard/RecentActivity/RecentActivity.tsx
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { pl } from 'date-fns/locale';
import { CheckCircle, Calendar, UserX, UserCheck } from 'lucide-react';
import './RecentActivity.scss';

interface Activity {
  id: string;
  type: 'guest_response' | 'event_created' | 'guest_declined' | 'guest_accepted' | 'event_updated' | 'event_deleted';
  message: string;
  timestamp: Date;
  eventId: string;
}

interface RecentActivityProps {
  activities: Activity[];
}

const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'guest_response':
      case 'guest_accepted':
        return <UserCheck size={16} className="activity__icon--success" />;
      case 'event_created':
        return <Calendar size={16} className="activity__icon--info" />;
      case 'guest_declined':
        return <UserX size={16} className="activity__icon--error" />;
      default:
        return <CheckCircle size={16} className="activity__icon--default" />;
    }
  };

  return (
    <div className="recent-activity">
      {activities.length === 0 ? (
        <div className="recent-activity__empty">
          <Calendar size={48} />
          <p>Brak ostatnich aktywności</p>
        </div>
      ) : (
        <div className="recent-activity__list">
          {activities.map((activity) => (
            <div key={activity.id} className="recent-activity__item">
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
