import React from 'react';
import { DemoEvent } from './demo.types';

interface DemoEventsProps {
  mockEvents: DemoEvent[];
}

const DemoEvents: React.FC<DemoEventsProps> = React.memo(({ mockEvents }) => (
  <div className="demo__events-content">
    <div className="demo__page-header">
      <h1>Wydarzenia</h1>
      <p>Zarządzaj wszystkimi swoimi wydarzeniami w jednym miejscu</p>
    </div>

    <div className="demo__events-filters">
      <div className="demo__filter-tabs">
        <button className="demo__filter-tab demo__filter-tab--active">
          Wszystkie (3)
        </button>
        <button className="demo__filter-tab">Aktywne (2)</button>
        <button className="demo__filter-tab">Zakończone (1)</button>
      </div>
    </div>

    <div className="demo__events-list">
      {mockEvents.map(event => (
        <div key={event.id} className="demo__event-row">
          <div className="demo__event-main">
            <h3>{event.title}</h3>
            <p>
              {event.date} • {event.location}
            </p>
          </div>
          <div className="demo__event-meta">
            <span className="demo__event-guests-count">
              {event.guests}/{event.maxGuests}
            </span>
            <span
              className={`demo__event-status demo__event-status--${event.status}`}
            >
              {event.status === 'active' ? 'Aktywne' : 'Zakończone'}
            </span>
          </div>
        </div>
      ))}
    </div>
  </div>
));

DemoEvents.displayName = 'DemoEvents';

export default DemoEvents;


