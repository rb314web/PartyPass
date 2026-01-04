import React from 'react';
import {
  Calendar,
  Users,
  Mail,
  Clock,
} from 'lucide-react';
import { DemoStat, DemoEvent, DemoActivity } from './demo.types';

interface DemoDashboardProps {
  mockStats: DemoStat[];
  mockEvents: DemoEvent[];
  mockActivities: DemoActivity[];
}

const DemoDashboard: React.FC<DemoDashboardProps> = React.memo(({ mockStats, mockEvents, mockActivities }) => (
  <div className="demo__dashboard-content">
    <div className="demo__welcome">
      <h1>Witaj w PartyPass, Anna! 👋</h1>
      <p>Oto przegląd Twoich wydarzeń i aktywności</p>
    </div>

    <div className="demo__stats-grid">
      {mockStats.map((stat, index) => (
        <div
          key={index}
          className={`demo__stat-card demo__stat-card--${stat.color}`}
        >
          <div className="demo__stat-header">
            <stat.icon size={24} className="demo__stat-icon" />
            <span className="demo__stat-title">{stat.title}</span>
          </div>
          <div className="demo__stat-value">{stat.value}</div>
          <div className="demo__stat-change">{stat.change}</div>
        </div>
      ))}
    </div>

    <div className="demo__section">
      <h2>Nadchodzące wydarzenia</h2>
      <div className="demo__events-grid">
        {mockEvents
          .filter(event => event.status === 'active')
          .map(event => (
            <div key={event.id} className="demo__event-card">
              <div className="demo__event-header">
                <h3>{event.title}</h3>
                <span
                  className={`demo__event-status demo__event-status--${event.status}`}
                >
                  Aktywne
                </span>
              </div>
              <div className="demo__event-details">
                <div className="demo__event-date">
                  <Clock size={16} />
                  {event.date}
                </div>
                <div className="demo__event-location">
                  📍 {event.location}
                </div>
                <div className="demo__event-guests">
                  <Users size={16} />
                  {event.guests}/{event.maxGuests} gości
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>

    <div className="demo__section">
      <h2>Ostatnia aktywność</h2>
      <div className="demo__activity-list">
        {mockActivities.slice(0, 3).map((activity) => (
          <div key={activity.id} className="demo__activity-item">
            <activity.icon
              size={16}
              className={`demo__activity-icon demo__activity-icon--${activity.color}`}
            />
            <span>{activity.message}</span>
            <small>{activity.time}</small>
          </div>
        ))}
      </div>
    </div>
  </div>
));

DemoDashboard.displayName = 'DemoDashboard';

export default DemoDashboard;


