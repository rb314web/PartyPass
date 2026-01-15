// components/dashboard/UpcomingEvents/UpcomingEvents.tsx
import React from 'react';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Event } from '../../../types';
import LoadingSpinner from '../../common/LoadingSpinner/LoadingSpinner';
import './UpcomingEvents.scss';

interface UpcomingEventsProps {
  events: Event[];
  isLoading?: boolean;
}

const UpcomingEvents: React.FC<UpcomingEventsProps> = ({ events, isLoading = false }) => {
  const navigate = useNavigate();

  const handleCreateEvent = () => {
    navigate('/dashboard/events/create');
  };

  const handleEventClick = (eventId: string) => {
    navigate(`/dashboard/events/${eventId}`);
  };

  const getResponseStats = (event: Event) => {
    const total = event.guestCount;
    const accepted = event.acceptedCount;
    const pending = event.pendingCount;

    return { total, accepted, pending };
  };

  const getDaysUntil = (date: Date) => {
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Dzisiaj';
    if (diffDays === 1) return 'Jutro';
    if (diffDays < 7) return `Za ${diffDays} dni`;
    return format(date, 'dd MMMM', { locale: pl });
  };

  if (isLoading) {
    return (
      <div className="upcoming-events upcoming-events--loading">
        <LoadingSpinner 
          variant="full"
          icon={Calendar}
          title="Ładowanie nadchodzących wydarzeń..."
        />
      </div>
    );
  }

  return (
    <div className="upcoming-events">
      {events.length === 0 ? (
        <div className="upcoming-events__empty">
          <Calendar size={48} />
          <p>Brak nadchodzących wydarzeń</p>
          <button
            className="upcoming-events__create-btn"
            onClick={handleCreateEvent}
          >
            Stwórz pierwsze wydarzenie
          </button>
        </div>
      ) : (
        <div className="upcoming-events__list">
          {events.map(event => {
            const stats = getResponseStats(event);
            return (
              <div
                key={event.id}
                className="upcoming-events__card"
                onClick={() => handleEventClick(event.id)}
              >
                <div className="upcoming-events__header">
                  <h3 className="upcoming-events__title">{event.title}</h3>
                  <span className="upcoming-events__date-badge">
                    {getDaysUntil(event.date)}
                  </span>
                </div>

                <div className="upcoming-events__details">
                  <div className="upcoming-events__detail">
                    <Clock size={16} />
                    <span>{format(event.date, 'HH:mm, dd.MM.yyyy')}</span>
                  </div>
                  <div className="upcoming-events__detail">
                    <MapPin size={16} />
                    <span>{event.location}</span>
                  </div>
                  <div className="upcoming-events__detail">
                    <Users size={16} />
                    <span>
                      {stats.accepted}/{stats.total} potwierdzeń
                    </span>
                  </div>
                </div>

                {stats.total > 0 && (
                  <div className="upcoming-events__progress">
                    <div className="upcoming-events__progress-bar">
                      <div
                        className="upcoming-events__progress-fill"
                        style={{
                          width: `${(stats.accepted / stats.total) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="upcoming-events__progress-text">
                      {Math.round((stats.accepted / stats.total) * 100)}%
                      potwierdzeń
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UpcomingEvents;
