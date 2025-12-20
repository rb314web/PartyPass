// components/dashboard/EventsCalendar/EventsCalendar.tsx
import React, { useMemo, forwardRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DateCalendar, PickersDay, PickersDayProps } from '@mui/x-date-pickers';
import Tooltip from '@mui/material/Tooltip';
import Fade from '@mui/material/Fade';
import { pl } from 'date-fns/locale';
import { format, startOfDay, format as formatDate } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Event } from '../../../types';
import './EventsCalendar.scss';

interface EventsCalendarProps {
  events: Event[];
  className?: string;
}

const DayWithEvents = forwardRef<HTMLButtonElement, PickersDayProps<Date> & {
  eventsByDate?: Record<string, Event[]>;
}>((props, ref) => {
  const { eventsByDate = {}, day, className, ...other } = props;
  const dateKey = format(startOfDay(day), 'yyyy-MM-dd');
  const dayEvents = eventsByDate[dateKey] || [];
  const hasEvents = dayEvents.length > 0;
  const dayNode = (
    <PickersDay
      {...other}
      day={day}
      ref={ref}
      className={`${className || ''} ${hasEvents ? 'events-calendar__day--has-events' : ''}`.trim()}
    />
  );

  if (!hasEvents) {
    return dayNode;
  }

  const getEventColor = (status: Event['status']) => {
    switch (status) {
      case 'active':
        return 'var(--color-success, #22c55e)';
      case 'draft':
        return 'var(--color-warning, #f59e0b)';
      case 'completed':
        return 'var(--color-primary, #6366f1)';
      case 'cancelled':
        return 'var(--color-error, #ef4444)';
      default:
        return 'var(--color-primary, #6366f1)';
    }
  };

  return (
    <Tooltip
      title={
        <div className="events-calendar__tooltip-content">
          {dayEvents.map((event) => (
            <div key={event.id} className="events-calendar__tooltip-event">
              <div
                className="events-calendar__tooltip-event-title"
                style={{ color: getEventColor(event.status) }}
              >
                {event.title}
              </div>
              <div className="events-calendar__tooltip-event-time">
                {formatDate(new Date(event.date), 'HH:mm', { locale: pl })}
              </div>
              {event.location && (
                <div className="events-calendar__tooltip-event-location">{event.location}</div>
              )}
            </div>
          ))}
        </div>
      }
      arrow
      placement="top"
      enterDelay={120}
      leaveDelay={80}
      TransitionComponent={Fade}
      TransitionProps={{ timeout: 200 }}
      slotProps={{
        popper: {
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [0, 12],
              },
            },
          ],
        },
        tooltip: {
          className: 'events-calendar__tooltip',
          disableInteractive: true,
        },
        arrow: {
          className: 'events-calendar__tooltip-arrow',
        },
      }}
    >
      {dayNode}
    </Tooltip>
  );
});

DayWithEvents.displayName = 'DayWithEvents';

const EventsCalendar: React.FC<EventsCalendarProps> = ({ events, className = '' }) => {
  const navigate = useNavigate();

  // Group events by date for tooltips
  const eventsByDate = useMemo(() => {
    const grouped: Record<string, Event[]> = {};
    events.forEach((event) => {
      const eventDate = new Date(event.date);
      const dateKey = format(startOfDay(eventDate), 'yyyy-MM-dd');
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });
    return grouped;
  }, [events]);

  const handleDateChange = (newDate: Date | null) => {
    if (newDate) {
      // Find events for this date and navigate to first one if exists
      const dateKey = format(startOfDay(newDate), 'yyyy-MM-dd');
      const dayEvents = eventsByDate[dateKey];
      if (dayEvents && dayEvents.length > 0) {
        navigate(`/dashboard/events/${dayEvents[0].id}`);
      }
    }
  };

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
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={pl}>
        <DateCalendar
          defaultValue={new Date()}
          onChange={handleDateChange}
          views={['day']}
          showDaysOutsideCurrentMonth
          fixedWeekNumber={6}
          slots={{
            day: DayWithEvents,
          }}
          slotProps={{
            day: {
              eventsByDate,
            } as any,
          }}
          className="events-calendar__mui-calendar"
          sx={{
            width: '100%',
            maxWidth: '100%',
            minWidth: 'unset',
            height: 'auto',
            minHeight: 'auto',
            '@media (max-width: 768px)': {
              width: '100% !important',
              maxWidth: '100% !important',
              minWidth: 'unset !important',
              height: 'auto !important',
              minHeight: 'auto !important',
            },
            '@media (max-width: 480px)': {
              width: '100% !important',
              maxWidth: '100% !important',
              minWidth: 'unset !important',
              height: 'auto !important',
              minHeight: 'auto !important',
            },
          }}
        />
      </LocalizationProvider>

      <div className="events-calendar__legend">
        <div className="events-calendar__legend-item">
          <div className="events-calendar__legend-dot"></div>
          <span>Wydarzenie</span>
        </div>
      </div>
    </div>
  );
};

export default EventsCalendar;
