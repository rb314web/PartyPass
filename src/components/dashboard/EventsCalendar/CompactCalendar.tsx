// components/dashboard/EventsCalendar/CompactCalendar.tsx
import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock, MapPin, Users, CheckCircle, XCircle, HelpCircle, ArrowRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
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

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Calculate calendar
  const { days, firstDayOfWeek, monthName } = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const firstDayOfWeek = firstDay.getDay();
    
    const monthName = firstDay.toLocaleDateString('pl-PL', { 
      month: 'short',
      year: 'numeric' 
    });

    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    return { days, firstDayOfWeek, monthName };
  }, [year, month]);

  // Get upcoming events (next 3)
  const upcomingEvents = useMemo(() => {
    const now = new Date();
    // Normalize to start of day for proper date comparison
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
      .slice(0, 3);
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

  const formatEventTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString('pl-PL', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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
      {/* Left: Mini Calendar */}
      <div className="compact-calendar__mini">
        <div className="compact-calendar__header">
          <span className="compact-calendar__month">{monthName}</span>
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
            const eventTitles = dayEvents.map(e => e.title).join(', ');
            
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
                title={eventCount > 0 ? `${eventCount} ${eventCount === 1 ? 'wydarzenie' : 'wydarzeń'}: ${eventTitles}` : undefined}
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

      {/* Right: Upcoming Events */}
      <div className="compact-calendar__events">
        <div className="compact-calendar__events-header">
          <h3 className="compact-calendar__events-title">Nadchodzące wydarzenia</h3>
          <Link 
            to="/dashboard/events" 
            className="compact-calendar__see-all"
            title="Zobacz wszystkie wydarzenia"
          >
            Wszystkie
            <ArrowRight size={14} />
          </Link>
        </div>
        {upcomingEvents.length > 0 ? (
          <>
            {upcomingEvents.map(event => {
              const statusInfo = getStatusInfo(event.status);
              const totalGuests = event.guestCount ?? 0;
              const acceptedGuests = event.acceptedGuests ?? 0;
              const pendingGuests = event.pendingGuests ?? 0;
              const declinedGuests = event.declinedGuests ?? 0;

              return (
                <div
                  key={event.id}
                  className="compact-calendar__event"
                  onClick={() => navigate(`/dashboard/events/${event.id}`)}
                >
                  <div className="compact-calendar__event-header">
                    <div className="compact-calendar__event-date">
                      <Calendar size={14} />
                      <span>{formatEventDate(event.date)}</span>
                    </div>
                    <span className={`compact-calendar__status compact-calendar__status--${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </div>

                  <h4 className="compact-calendar__event-title">{event.title}</h4>

                  <div className="compact-calendar__event-details">
                    <div className="compact-calendar__event-meta">
                      <span>
                        <Clock size={12} />
                        {formatEventTime(event.date)}
                      </span>
                      {event.location && (
                        <span title={event.location}>
                          <MapPin size={12} />
                          {event.location.length > 25 
                            ? event.location.substring(0, 25) + '...' 
                            : event.location}
                        </span>
                      )}
                    </div>

                    {totalGuests > 0 && (
                      <div className="compact-calendar__guests">
                        <div className="compact-calendar__guests-total">
                          <Users size={12} />
                          <span>{totalGuests} {totalGuests === 1 ? 'gość' : 'gości'}</span>
                        </div>
                        <div className="compact-calendar__guests-breakdown">
                          {acceptedGuests > 0 && (
                            <span className="compact-calendar__guest-stat compact-calendar__guest-stat--accepted" title="Potwierdzeni">
                              <CheckCircle size={10} />
                              {acceptedGuests}
                            </span>
                          )}
                          {pendingGuests > 0 && (
                            <span className="compact-calendar__guest-stat compact-calendar__guest-stat--pending" title="Oczekujący">
                              <HelpCircle size={10} />
                              {pendingGuests}
                            </span>
                          )}
                          {declinedGuests > 0 && (
                            <span className="compact-calendar__guest-stat compact-calendar__guest-stat--declined" title="Odmówili">
                              <XCircle size={10} />
                              {declinedGuests}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </>
        ) : (
          <div className="compact-calendar__empty">
            <Calendar size={32} />
            <p>Brak nadchodzących wydarzeń</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompactCalendar;

