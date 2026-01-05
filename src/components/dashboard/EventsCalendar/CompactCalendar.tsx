// components/dashboard/EventsCalendar/CompactCalendar.tsx
import React, { useState, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { ChevronLeft, ChevronRight, Calendar, Clock, MapPin, Users, List } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './CompactCalendar.scss';

interface Event {
  id: string;
  title: string;
  date: string | Date;
  location?: string;
  status?: string;
  guestCount?: number;
  acceptedGuests?: number;
  pendingGuests?: number;
  declinedGuests?: number;
}

interface CompactCalendarProps {
  events: Event[];
}

const CompactCalendar: React.FC<CompactCalendarProps> = ({ events }) => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Calculate calendar
  const { days, firstDayOfWeek, monthName } = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const firstDayOfWeek = firstDay.getDay();
    
    const monthName = firstDay.toLocaleDateString('pl-PL', { 
      month: 'long',
      year: 'numeric' 
    });

    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    return { days, firstDayOfWeek, monthName };
  }, [year, month]);

  // Get timeline events (next 4)
  const timelineEvents = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return events
      .filter(event => {
        const eventDate = new Date(event.date);
        const eventDateNormalized = new Date(
          eventDate.getFullYear(),
          eventDate.getMonth(),
          eventDate.getDate()
        );
        return eventDateNormalized >= today;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 4)
      .map(event => {
        const eventDate = new Date(event.date);
        const diffTime = eventDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        let timeLabel = '';
        if (diffDays === 0) timeLabel = 'Dzisiaj';
        else if (diffDays === 1) timeLabel = 'Jutro';
        else if (diffDays < 7) timeLabel = `Za ${diffDays} dni`;
        else timeLabel = eventDate.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' });

        return {
          ...event,
          timeLabel,
          diffDays
        };
      });
  }, [events]);

  const getEventsOnDay = (day: number) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getFullYear() === year &&
        eventDate.getMonth() === month &&
        eventDate.getDate() === day
      );
    });
  };

  const hasEventsOnDay = (day: number) => {
    return getEventsOnDay(day).length > 0;
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getEventCountOnDay = (day: number) => {
    return getEventsOnDay(day).length;
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === day
    );
  };

  const formatEventTime = (date: Date | string) => {
    const eventDate = new Date(date);
    return eventDate.toLocaleTimeString('pl-PL', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const formatEventDate = (date: Date | string) => {
    const eventDate = new Date(date);
    const now = new Date();
    
    // Normalize to start of day for proper comparison
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const eventDay = new Date(
      eventDate.getFullYear(),
      eventDate.getMonth(),
      eventDate.getDate()
    );
    
    const diffTime = eventDay.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Dzisiaj';
    if (diffDays === 1) return 'Jutro';
    
    return eventDate.toLocaleDateString('pl-PL', {
      day: 'numeric',
      month: 'short',
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getStatusInfo = (status?: string) => {
    switch (status) {
      case 'active':
        return { label: 'Aktywne', color: 'green' };
      case 'draft':
        return { label: 'Szkic', color: 'gray' };
      case 'cancelled':
        return { label: 'Anulowane', color: 'red' };
      default:
        return { label: 'Aktywne', color: 'green' };
    }
  };

  const goToPreviousMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const goToNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => setCurrentDate(new Date());
  
  const isCurrentMonth = useMemo(() => {
    const today = new Date();
    return today.getFullYear() === year && today.getMonth() === month;
  }, [year, month]);

  const weekDays = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd'];
  const adjustedFirstDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  return (
    <div className="compact-calendar">
      {/* Calendar Card */}
      <div className="compact-calendar__card">
        <div className="compact-calendar__header">
          <div className="compact-calendar__header-content">
            <div className="compact-calendar__icon">
              <Calendar size={18} />
            </div>
            <span className="compact-calendar__month">{monthName}</span>
          </div>
          <div className="compact-calendar__nav">
            <button onClick={goToPreviousMonth} aria-label="Poprzedni">
              <ChevronLeft size={14} />
            </button>
            {!isCurrentMonth && (
              <button 
                onClick={goToToday} 
                className="compact-calendar__today-btn"
                aria-label="Dzisiaj"
                title="Dzisiaj"
              >
                Dzisiaj
              </button>
            )}
            <button onClick={goToNextMonth} aria-label="Następny">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        <div className="compact-calendar__grid">
          {weekDays.map(day => (
            <div key={day} className="compact-calendar__weekday">{day}</div>
          ))}
          
          {Array.from({ length: adjustedFirstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="compact-calendar__day compact-calendar__day--empty" />
          ))}
          
          {days.map(day => {
            const dayEvents = getEventsOnDay(day);
            const eventCount = dayEvents.length;
            
            return (
              <div
                key={day}
                className={`compact-calendar__day ${
                  isToday(day) ? 'compact-calendar__day--today' : ''
                } ${
                  hasEventsOnDay(day) ? 'compact-calendar__day--event' : ''
                } ${eventCount > 0 ? 'compact-calendar__day--clickable' : ''}`}
                onClick={() => {
                  if (eventCount > 0 && dayEvents[0]) {
                    navigate(`/dashboard/events/${dayEvents[0].id}`);
                  }
                }}
                onMouseEnter={(e) => {
                  if (eventCount > 0) {
                    setHoveredDay(day);
                    const rect = e.currentTarget.getBoundingClientRect();
                    setTooltipPosition({
                      x: rect.left + rect.width / 2,
                      y: rect.top
                    });
                  }
                }}
                onMouseLeave={() => setHoveredDay(null)}
              >
                {day}
                {eventCount > 1 && (
                  <span className="compact-calendar__day-count">{eventCount}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Timeline Card */}
      <div className="compact-calendar__card compact-calendar__card--timeline">
        <div className="compact-calendar__header">
          <div className="compact-calendar__header-content">
            <div className="compact-calendar__icon compact-calendar__icon--purple">
              <List size={18} />
            </div>
            <span className="compact-calendar__month">Nadchodzące wydarzenia</span>
          </div>
        </div>
        <div className="compact-calendar__timeline">
          {timelineEvents.length > 0 ? (
            <>
              {timelineEvents.map((event, index) => (
                <div 
                  key={event.id} 
                  className="compact-calendar__timeline-item"
                  onClick={() => navigate(`/dashboard/events/${event.id}`)}
                >
                  <div className="compact-calendar__timeline-marker">
                    <div className={`compact-calendar__timeline-dot compact-calendar__timeline-dot--${event.status || 'active'}`}>
                      <Calendar size={12} />
                    </div>
                    {index < timelineEvents.length - 1 && (
                      <div className="compact-calendar__timeline-line" />
                    )}
                  </div>
                  <div className="compact-calendar__timeline-content">
                    <div className="compact-calendar__timeline-date">
                      {event.timeLabel}
                    </div>
                    <div className="compact-calendar__timeline-title">
                      {event.title}
                    </div>
                    <div className="compact-calendar__timeline-meta">
                      {event.location && (
                        <span>
                          <MapPin size={12} />
                          {event.location.length > 20 ? event.location.substring(0, 20) + '...' : event.location}
                        </span>
                      )}
                      {(event.guestCount || 0) > 0 && (
                        <span>
                          <Users size={12} />
                          {event.guestCount} {event.guestCount === 1 ? 'gość' : 'gości'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="compact-calendar__timeline-empty">
              <Calendar size={32} opacity={0.3} />
              <p>Brak nadchodzących wydarzeń</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Tooltip for events - rendered via portal */}
      {hoveredDay !== null && getEventsOnDay(hoveredDay).length > 0 && ReactDOM.createPortal(
        <div 
          className="compact-calendar__tooltip"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
          }}
        >
          <div className="compact-calendar__tooltip-content">
            {getEventsOnDay(hoveredDay).map((event, index) => (
              <div 
                key={event.id} 
                className="compact-calendar__tooltip-event"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/dashboard/events/${event.id}`);
                }}
              >
                <div className="compact-calendar__tooltip-title">{event.title}</div>
                <div className="compact-calendar__tooltip-details">
                  <span><Clock size={12} /> {formatEventTime(event.date)}</span>
                  {event.location && (
                    <span><MapPin size={12} /> {event.location}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default CompactCalendar;

