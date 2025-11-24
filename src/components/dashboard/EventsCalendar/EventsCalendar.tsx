// components/dashboard/EventsCalendar/EventsCalendar.tsx
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Event } from '../../../types';
import './EventsCalendar.scss';

interface EventsCalendarProps {
  events: Event[];
  className?: string;
}

const EventsCalendar: React.FC<EventsCalendarProps> = ({ events, className = '' }) => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Get first day of month and number of days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPreviousMonth = new Date(currentYear, currentMonth, 0).getDate();

  // Group events by date
  const eventsByDate = useMemo(() => {
    const grouped: Record<string, Event[]> = {};
    events.forEach(event => {
      const eventDate = new Date(event.date);
      const dateKey = `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, '0')}-${String(eventDate.getDate()).padStart(2, '0')}`;
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });
    return grouped;
  }, [events]);

  const monthNames = [
    'Styczeń',
    'Luty',
    'Marzec',
    'Kwiecień',
    'Maj',
    'Czerwiec',
    'Lipiec',
    'Sierpień',
    'Wrzesień',
    'Październik',
    'Listopad',
    'Grudzień',
  ];

  const dayNames = ['Nd', 'Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb'];

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getDateKey = (day: number, isCurrentMonth: boolean = true) => {
    const year = isCurrentMonth ? currentYear : (currentMonth === 0 ? currentYear - 1 : currentYear);
    const month = isCurrentMonth ? currentMonth + 1 : (currentMonth === 0 ? 12 : currentMonth);
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const isToday = (day: number, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return false;
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === currentMonth &&
      today.getFullYear() === currentYear
    );
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pl-PL', {
      day: 'numeric',
      month: 'short',
    });
  };

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const days: Array<{
      day: number;
      isCurrentMonth: boolean;
      dateKey: string;
      isToday: boolean;
      events: Event[];
    }> = [];

    // Previous month days
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const day = daysInPreviousMonth - i;
      const dateKey = getDateKey(day, false);
      days.push({
        day,
        isCurrentMonth: false,
        dateKey,
        isToday: false,
        events: eventsByDate[dateKey] || [],
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = getDateKey(day, true);
      days.push({
        day,
        isCurrentMonth: true,
        dateKey,
        isToday: isToday(day, true),
        events: eventsByDate[dateKey] || [],
      });
    }

    // Next month days (to fill the grid)
    const remainingDays = 42 - days.length; // 6 weeks * 7 days
    for (let day = 1; day <= remainingDays; day++) {
      const dateKey = getDateKey(day, false);
      days.push({
        day,
        isCurrentMonth: false,
        dateKey,
        isToday: false,
        events: eventsByDate[dateKey] || [],
      });
    }

    return days;
  }, [currentMonth, currentYear, firstDayOfMonth, daysInMonth, daysInPreviousMonth, eventsByDate]);

  if (events.length === 0) {
    return (
      <div className={`events-calendar ${className}`}>
        <div className="events-calendar__empty">
          <CalendarIcon size={48} />
          <p>Brak nadchodzących wydarzeń</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`events-calendar ${className}`}>
      <div className="events-calendar__header">
        <div className="events-calendar__navigation">
          <button
            className="events-calendar__nav-btn"
            onClick={goToPreviousMonth}
            aria-label="Poprzedni miesiąc"
          >
            <ChevronLeft size={20} />
          </button>
          <h2 className="events-calendar__month-year">
            {monthNames[currentMonth]} {currentYear}
          </h2>
          <button
            className="events-calendar__nav-btn"
            onClick={goToNextMonth}
            aria-label="Następny miesiąc"
          >
            <ChevronRight size={20} />
          </button>
        </div>
        <button className="events-calendar__today-btn" onClick={goToToday}>
          Dzisiaj
        </button>
      </div>

      <div className="events-calendar__weekdays">
        {dayNames.map(day => (
          <div key={day} className="events-calendar__weekday">
            {day}
          </div>
        ))}
      </div>

      <div className="events-calendar__days">
        {calendarDays.map((calendarDay, index) => (
          <div
            key={`${calendarDay.dateKey}-${index}`}
            className={`events-calendar__day ${
              !calendarDay.isCurrentMonth ? 'events-calendar__day--other-month' : ''
            } ${calendarDay.isToday ? 'events-calendar__day--today' : ''} ${
              calendarDay.events.length > 0 ? 'events-calendar__day--has-events' : ''
            }`}
          >
            <div className="events-calendar__day-number">{calendarDay.day}</div>
            {calendarDay.events.length > 0 && (
              <div className="events-calendar__day-events">
                {calendarDay.events.slice(0, 3).map(event => (
                  <div
                    key={event.id}
                    className="events-calendar__event-dot"
                    title={`${event.title} - ${formatDate(event.date)}`}
                    onClick={() => navigate(`/dashboard/events/${event.id}`)}
                  />
                ))}
                {calendarDay.events.length > 3 && (
                  <div className="events-calendar__event-more">
                    +{calendarDay.events.length - 3}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {Object.keys(eventsByDate).length > 0 && (
        <div className="events-calendar__legend">
          <div className="events-calendar__legend-item">
            <div className="events-calendar__legend-dot"></div>
            <span>Wydarzenie</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsCalendar;

