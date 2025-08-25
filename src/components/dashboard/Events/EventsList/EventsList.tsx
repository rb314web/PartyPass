// components/dashboard/Events/EventsList/EventsList.tsx
import React, { useState } from 'react';
import { format, isToday, isTomorrow, isPast } from 'date-fns';
import { pl } from 'date-fns/locale';
import {
  Calendar,
  MapPin,
  Users,
  MoreVertical,
  Edit,
  Copy,
  Trash2,
  Eye,
  Clock,
  CheckCircle2,
  AlertCircle,
  Pause
} from 'lucide-react';
import { Event } from '../../../../types';
import './EventsList.scss';

interface EventsListProps {
  events: Event[];
  selectedEvents: string[];
  onSelect: (selectedIds: string[]) => void;
  onAction: (eventId: string, action: 'edit' | 'duplicate' | 'delete' | 'view') => void;
  getStatusColor: (status: Event['status']) => string;
  getStatusLabel: (status: Event['status']) => string;
}

const EventsList: React.FC<EventsListProps> = ({
  events,
  selectedEvents,
  onSelect,
  onAction,
  getStatusColor,
  getStatusLabel
}) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return 'Dzisiaj';
    if (isTomorrow(date)) return 'Jutro';
    if (isPast(date)) return 'Minęło';
    
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 7) return `Za ${diffDays} dni`;
    return format(date, 'd MMMM yyyy', { locale: pl });
  };

  const getGuestStats = (event: Event) => {
    const total = event.guestCount;
    const accepted = event.acceptedCount;
    const pending = event.pendingCount;
    const declined = event.declinedCount;
    
    return { total, accepted, pending, declined };
  };

  const getStatusIcon = (status: Event['status']) => {
    switch (status) {
      case 'active': return <CheckCircle2 size={16} />;
      case 'draft': return <Edit size={16} />;
      case 'completed': return <CheckCircle2 size={16} />;
      case 'cancelled': return <AlertCircle size={16} />;
      default: return <Pause size={16} />;
    }
  };

  const handleSelectEvent = (eventId: string, checked: boolean) => {
    if (checked) {
      onSelect([...selectedEvents, eventId]);
    } else {
      onSelect(selectedEvents.filter(id => id !== eventId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelect(events.map(e => e.id));
    } else {
      onSelect([]);
    }
  };

  const handleMenuAction = (eventId: string, action: 'edit' | 'duplicate' | 'delete' | 'view') => {
    setActiveMenu(null);
    onAction(eventId, action);
  };

  const allSelected = events.length > 0 && selectedEvents.length === events.length;
  const someSelected = selectedEvents.length > 0 && selectedEvents.length < events.length;

  return (
    <div className="events-list">
      {/* Table Header */}
      <div className="events-list__header">
        <div className="events-list__header-cell events-list__header-cell--checkbox">
          <label className="events-list__checkbox">
            <input
              type="checkbox"
              checked={allSelected}
              ref={(input) => {
                if (input) input.indeterminate = someSelected;
              }}
              onChange={(e) => handleSelectAll(e.target.checked)}
            />
            <span className="events-list__checkbox-custom"></span>
          </label>
        </div>
        <div className="events-list__header-cell events-list__header-cell--title">
          Wydarzenie
        </div>
        <div className="events-list__header-cell events-list__header-cell--date">
          Data i czas
        </div>
        <div className="events-list__header-cell events-list__header-cell--location">
          Lokalizacja
        </div>
        <div className="events-list__header-cell events-list__header-cell--guests">
          Goście
        </div>
        <div className="events-list__header-cell events-list__header-cell--status">
          Status
        </div>
        <div className="events-list__header-cell events-list__header-cell--actions">
          Akcje
        </div>
      </div>

      {/* Table Body */}
      <div className="events-list__body">
        {events.map((event) => {
          const guestStats = getGuestStats(event);
          const responseRate = guestStats.total > 0 ? (guestStats.accepted / guestStats.total) * 100 : 0;
          const isSelected = selectedEvents.includes(event.id);

          return (
            <div
              key={event.id}
              className={`events-list__row ${isSelected ? 'events-list__row--selected' : ''}`}
              onClick={() => onAction(event.id, 'view')}
            >
              {/* Checkbox */}
              <div className="events-list__cell events-list__cell--checkbox">
                <label 
                  className="events-list__checkbox"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => handleSelectEvent(event.id, e.target.checked)}
                  />
                  <span className="events-list__checkbox-custom"></span>
                </label>
              </div>

              {/* Title & Description */}
              <div className="events-list__cell events-list__cell--title">
                <div className="events-list__event-info">
                  <h3 className="events-list__event-title">{event.title}</h3>
                  <p className="events-list__event-description">{event.description}</p>
                </div>
              </div>

              {/* Date & Time */}
              <div className="events-list__cell events-list__cell--date">
                <div className="events-list__date-info">
                  <div className="events-list__date-label">
                    {getDateLabel(event.date)}
                  </div>
                  <div className="events-list__date-time">
                    <Clock size={14} />
                    {format(event.date, 'HH:mm')}
                  </div>
                  <div className="events-list__date-full">
                    {format(event.date, 'dd.MM.yyyy', { locale: pl })}
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="events-list__cell events-list__cell--location">
                <div className="events-list__location">
                  <MapPin size={16} />
                  <span>{event.location}</span>
                </div>
              </div>

              {/* Guests */}
              <div className="events-list__cell events-list__cell--guests">
                <div className="events-list__guests">
                  <div className="events-list__guest-count">
                    <Users size={16} />
                    <span>{guestStats.accepted}/{guestStats.total}</span>
                  </div>
                  {guestStats.total > 0 && (
                    <div className="events-list__response-rate">
                      <div className="events-list__progress-mini">
                        <div 
                          className="events-list__progress-fill"
                          style={{ width: `${responseRate}%` }}
                        />
                      </div>
                      <span>{Math.round(responseRate)}%</span>
                    </div>
                  )}
                  {guestStats.pending > 0 && (
                    <div className="events-list__pending">
                      {guestStats.pending} oczekuje
                    </div>
                  )}
                </div>
              </div>

              {/* Status */}
              <div className="events-list__cell events-list__cell--status">
                <div 
                  className="events-list__status"
                  style={{ 
                    backgroundColor: getStatusColor(event.status),
                    color: 'white'
                  }}
                >
                  {getStatusIcon(event.status)}
                  <span>{getStatusLabel(event.status)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="events-list__cell events-list__cell--actions">
                <div className="events-list__actions">
                  <button
                    className="events-list__action-btn events-list__action-btn--view"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAction(event.id, 'view');
                    }}
                    title="Zobacz szczegóły"
                  >
                    <Eye size={16} />
                  </button>
                  
                  <button
                    className="events-list__action-btn events-list__action-btn--edit"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAction(event.id, 'edit');
                    }}
                    title="Edytuj"
                  >
                    <Edit size={16} />
                  </button>

                  <div className="events-list__menu">
                    <button
                      className="events-list__menu-trigger"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenu(activeMenu === event.id ? null : event.id);
                      }}
                    >
                      <MoreVertical size={16} />
                    </button>
                    
                    {activeMenu === event.id && (
                      <div className="events-list__menu-dropdown">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMenuAction(event.id, 'view');
                          }}
                        >
                          <Eye size={16} />
                          Zobacz szczegóły
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMenuAction(event.id, 'edit');
                          }}
                        >
                          <Edit size={16} />
                          Edytuj
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMenuAction(event.id, 'duplicate');
                          }}
                        >
                          <Copy size={16} />
                          Duplikuj
                        </button>
                        <button 
                          className="events-list__menu-delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMenuAction(event.id, 'delete');
                          }}
                        >
                          <Trash2 size={16} />
                          Usuń
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer with summary */}
      {events.length > 0 && (
        <div className="events-list__footer">
          <div className="events-list__summary">
            Wyświetlono {events.length} wydarzeń
            {selectedEvents.length > 0 && (
              <span> • Wybrano {selectedEvents.length}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsList;