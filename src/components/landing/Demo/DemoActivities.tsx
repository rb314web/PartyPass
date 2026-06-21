import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { pl } from 'date-fns/locale';
import {
  Activity as ActivityIcon,
  Calendar,
  CheckCircle,
  UserCheck,
  UserPlus,
} from 'lucide-react';
import { Activity } from '../../../types';
import PageHeader from '../../common/PageHeader/PageHeader';
import { demoActivities } from './demoDashboardData';
import '../../dashboard/Activities/Activities.scss';

const getActivityIcon = (type: Activity['type']) => {
  switch (type) {
    case 'guest_accepted':
      return <UserCheck size={20} className="activity__icon--success" />;
    case 'event_created':
      return <Calendar size={20} className="activity__icon--info" />;
    case 'contact_added':
      return <UserPlus size={20} className="activity__icon--success" />;
    default:
      return <CheckCircle size={20} className="activity__icon--default" />;
  }
};

const DemoActivities: React.FC = () => (
  <div className="activities">
    <PageHeader
      title="Aktywności"
      subtitle="Historia wszystkich aktywności w Twoich wydarzeniach"
      icon={ActivityIcon}
    />

    <div className="activities__content">
      <div className="activities__list">
        {demoActivities.map(activity => (
          <article key={activity.id} className="activities__item">
            <div className="activities__icon">{getActivityIcon(activity.type)}</div>
            <div className="activities__content-item">
              <p className="activities__message">{activity.message}</p>
              <div className="activities__meta">
                <span className="activities__time">
                  {formatDistanceToNow(activity.timestamp, {
                    addSuffix: true,
                    locale: pl,
                  })}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  </div>
);

export default DemoActivities;
