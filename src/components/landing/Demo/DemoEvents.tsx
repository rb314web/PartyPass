import React, { useMemo } from 'react';
import { Calendar, Plus } from 'lucide-react';
import { Event } from '../../../types';
import PageHeader from '../../common/PageHeader/PageHeader';
import EventCard from '../../dashboard/Events/EventCard/EventCard';
import { demoCalendarEvents } from './demoDashboardData';
import '../../dashboard/Events/Events.scss';

const getStatusColor = (status: Event['status']): string => {
  switch (status) {
    case 'active':
      return 'var(--color-success)';
    case 'completed':
      return 'var(--color-primary)';
    case 'cancelled':
      return 'var(--color-error)';
    default:
      return 'var(--text-tertiary)';
  }
};

const getStatusLabel = (status: Event['status']): string => {
  switch (status) {
    case 'active':
      return 'Aktywne';
    case 'completed':
      return 'Zakończone';
    case 'cancelled':
      return 'Anulowane';
    default:
      return status;
  }
};

const DemoEvents: React.FC = () => {
  const { activeCount, completedCount } = useMemo(() => {
    const active = demoCalendarEvents.filter(e => e.status === 'active').length;
    const completed = demoCalendarEvents.filter(
      e => e.status === 'completed'
    ).length;

    return {
      activeCount: active,
      completedCount: completed,
    };
  }, []);

  const totalEvents = demoCalendarEvents.length;

  return (
    <div className="events">
      <PageHeader
        title="Wydarzenia"
        subtitle={
          <>
            Zarządzaj swoimi wydarzeniami i śledź postępy
            <span className="events__count">
              {' '}
              • {totalEvents} wydarzenia
            </span>
          </>
        }
        icon={Calendar}
        actions={
          <button
            type="button"
            className="events__action-btn events__action-btn--primary"
            disabled
          >
            <Plus size={18} aria-hidden="true" />
            <span>Nowe wydarzenie</span>
          </button>
        }
      />

      <section className="events__summary" aria-label="Podsumowanie wydarzeń">
        <div className="events__summary-item">
          <div className="events__summary-label">
            <span
              className="events__summary-dot events__summary-dot--active"
              aria-hidden="true"
            />
            <span>Aktywne</span>
          </div>
          <span className="events__summary-value">{activeCount}</span>
        </div>

        <div className="events__summary-item">
          <div className="events__summary-label">
            <span
              className="events__summary-dot events__summary-dot--completed"
              aria-hidden="true"
            />
            <span>Zakończone</span>
          </div>
          <span className="events__summary-value">{completedCount}</span>
        </div>
      </section>

      <div className="events__grid">
        {demoCalendarEvents.map(event => (
          <EventCard
            key={event.id}
            event={event}
            onAction={() => undefined}
            getStatusColor={getStatusColor}
            getStatusLabel={getStatusLabel}
          />
        ))}
      </div>
    </div>
  );
};

export default DemoEvents;
