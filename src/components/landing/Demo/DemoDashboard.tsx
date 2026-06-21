import React from 'react';
import {
  LayoutDashboard,
  MapPin,
  Calendar,
  Users,
  CloudSun,
  ArrowUp,
} from 'lucide-react';
import { DemoMetric, DemoEvent, DemoActivity } from './demo.types';
import { demoQuickActions } from './demoData';

interface DemoDashboardProps {
  mockMetrics: DemoMetric[];
  mockEvents: DemoEvent[];
  mockActivities: DemoActivity[];
}

const DemoDashboard: React.FC<DemoDashboardProps> = React.memo(
  ({ mockMetrics, mockEvents, mockActivities }) => {
    const nextEvent = mockEvents.find(e => e.status === 'active');
    const lastActivity = mockActivities[0];

    return (
      <div className="demo__dashboard-content">
        <header className="demo__page-header demo__page-header--bar">
          <div className="demo__page-header-icon">
            <LayoutDashboard size={22} />
          </div>
          <div>
            <h1>Przegląd</h1>
            <p>Twoje wydarzenia w skrócie</p>
          </div>
        </header>

        <div className="demo__quick-actions">
          {demoQuickActions.map((action, index) => (
            <button
              key={index}
              type="button"
              className={`demo__quick-action${
                action.primary ? ' demo__quick-action--primary' : ''
              }`}
              disabled
            >
              <action.icon size={18} />
              <span>{action.label}</span>
            </button>
          ))}
        </div>

        <div className="demo__metrics">
          {mockMetrics.map((metric, index) => (
            <article
              key={index}
              className={`demo__metric demo__metric--${metric.color}`}
            >
              <div className="demo__metric-header">
                <div className={`demo__metric-icon demo__metric-icon--${metric.color}`}>
                  <metric.icon size={22} />
                </div>
                <span>{metric.label}</span>
              </div>
              <div className="demo__metric-value">{metric.value}</div>
              <div className="demo__metric-change">
                {metric.change !== undefined && (
                  <span className="demo__metric-badge">
                    <ArrowUp size={13} />
                    +{metric.change}%
                  </span>
                )}
                <span>{metric.changeLabel}</span>
              </div>
              <ul className="demo__metric-details">
                {metric.details.map(detail => (
                  <li key={detail.label}>
                    <span>{detail.label}</span>
                    <span>{detail.value}</span>
                  </li>
                ))}
              </ul>
              <span className="demo__metric-link">{metric.linkLabel}</span>
            </article>
          ))}
        </div>

        <div className="demo__calendar-strip">
          <div className="demo__calendar-strip-header">
            <Calendar size={18} />
            <h2>Kalendarz wydarzeń</h2>
          </div>
          <div className="demo__calendar-days">
            {['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd'].map(day => (
              <span key={day} className="demo__calendar-dow">
                {day}
              </span>
            ))}
            {Array.from({ length: 14 }, (_, i) => (
              <span
                key={i}
                className={`demo__calendar-day${
                  i === 5 ? ' demo__calendar-day--active' : ''
                }${i === 8 ? ' demo__calendar-day--dot' : ''}`}
              >
                {i + 10}
              </span>
            ))}
          </div>
        </div>

        <div className="demo__insights">
          <article className="demo__insight-card">
            <h3>
              <CloudSun size={18} />
              Następne wydarzenie
            </h3>
            {nextEvent ? (
              <>
                <p className="demo__insight-title">{nextEvent.title}</p>
                <p className="demo__insight-meta">
                  <Calendar size={14} />
                  {nextEvent.date}
                </p>
                <p className="demo__insight-meta">
                  <MapPin size={14} />
                  {nextEvent.location}
                </p>
                <p className="demo__insight-meta">
                  <Users size={14} />
                  {nextEvent.accepted} potwierdzonych · {nextEvent.pending} oczekujących
                </p>
                <p className="demo__insight-weather">☀️ 24°C · słonecznie w Warszawie</p>
              </>
            ) : (
              <p className="demo__insight-empty">Brak nadchodzących wydarzeń</p>
            )}
          </article>

          <article className="demo__insight-card">
            <h3>Ostatnia aktywność</h3>
            {lastActivity ? (
              <div className="demo__activity-item demo__activity-item--compact">
                <lastActivity.icon
                  size={16}
                  className={`demo__activity-icon demo__activity-icon--${lastActivity.color}`}
                />
                <div>
                  <p>{lastActivity.message}</p>
                  <small>{lastActivity.time}</small>
                </div>
              </div>
            ) : (
              <p className="demo__insight-empty">Brak ostatniej aktywności</p>
            )}
          </article>
        </div>

        <div className="demo__map-placeholder">
          <div className="demo__map-placeholder-header">
            <MapPin size={18} />
            <h2>Mapa wydarzeń</h2>
          </div>
          <div className="demo__map-placeholder-body">
            <MapPin size={32} />
            <p>Warszawa · 3 aktywne lokalizacje</p>
          </div>
        </div>
      </div>
    );
  }
);

DemoDashboard.displayName = 'DemoDashboard';

export default DemoDashboard;
