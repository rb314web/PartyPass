import React from 'react';
import { Clock } from 'lucide-react';
import { DemoActivity } from './demo.types';

interface DemoActivitiesProps {
  mockActivities: DemoActivity[];
}

const DemoActivities: React.FC<DemoActivitiesProps> = React.memo(({ mockActivities }) => (
  <div className="demo__activities-content">
    <div className="demo__page-header">
      <h1>Aktywności</h1>
      <p>Śledź wszystkie działania w Twoich wydarzeniach</p>
    </div>

    <div className="demo__activities-list">
      {mockActivities.map(activity => (
        <div key={activity.id} className="demo__activity-item">
          <activity.icon
            size={16}
            className={`demo__activity-icon demo__activity-icon--${activity.color}`}
          />
          <div className="demo__activity-content">
            <span className="demo__activity-message">{activity.message}</span>
            <div className="demo__activity-time">
              <Clock size={14} />
              <small>{activity.time}</small>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
));

DemoActivities.displayName = 'DemoActivities';

export default DemoActivities;

