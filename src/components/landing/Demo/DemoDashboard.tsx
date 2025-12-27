import React from 'react';
import {
  Calendar,
  Users,
  CheckCircle,
  Mail,
  Clock,
} from 'lucide-react';

interface DemoDashboardProps {
  mockStats: Array<{
    title: string;
    value: string | number;
    change: string;
    trend: 'up' | 'down';
    icon: React.ComponentType<any>;
    color: 'blue' | 'green' | 'purple' | 'orange';
  }>;
  mockEvents: Array<{
    id: string;
    title: string;
    date: string;
    location: string;
    guests: number;
    maxGuests: number;
    status: 'active' | 'completed';
  }>;
}

const DemoDashboard: React.FC<DemoDashboardProps> = ({ mockStats, mockEvents }) => (
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
        <div className="demo__activity-item">
          <CheckCircle
            size={16}
            className="demo__activity-icon demo__activity-icon--success"
          />
          <span>
            Anna Kowalska potwierdziła uczestnictwo w "Urodziny Marii"
          </span>
          <small>2 godziny temu</small>
        </div>
        <div className="demo__activity-item">
          <Mail
            size={16}
            className="demo__activity-icon demo__activity-icon--blue"
          />
          <span>Wysłano 15 zaproszeń na "Spotkanie rodzinne"</span>
          <small>1 dzień temu</small>
        </div>
        <div className="demo__activity-item">
          <Calendar
            size={16}
            className="demo__activity-icon demo__activity-icon--purple"
          />
          <span>Utworzono nowe wydarzenie "Spotkanie rodzinne"</span>
          <small>3 dni temu</small>
        </div>
      </div>
    </div>
  </div>
);

export default DemoDashboard;


