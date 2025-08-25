// components/dashboard/Events/EventCard/EventCard.tsx
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
  CheckCircle2
} from 'lucide-react';
import { Event } from '../../../../types';
import './EventCard.scss';

interface EventCardProps {
  event: Event;
  isSelected: boolean;
  onSelect: (selected: boolean) => void;
  onAction: (eventId: string, action: 'edit' | 'duplicate' | 'delete' | 'view') => void;
  getStatusColor: (status: Event['status']) => string;
  getStatusLabel: (status: Event['status']) => string;
}

const EventCard: React.FC<EventCardProps> = ({
  event,
  isSelected,
  onSelect,
  onAction,
  getStatusColor,
  getStatusLabel
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return 'Dzisiaj';
    if (isTomorrow(date)) return 'Jutro';
    if (isPast(date)) return 'Minęło';
    
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 7) return `Za ${diffDays} dni`;
    return format(date, 'd MMMM', { locale: pl });
  };

  const getGuestStats = () => {
    const total = event.guestCount;
    const accepted = event.acceptedCount;
    const pending = event.pendingCount;
    const declined = event.declinedCount;
    
    return { total, accepted, pending, declined };
  };

  const guestStats = getGuestStats();
  const responseRate = guestStats.total > 0 ? (guestStats.accepted / guestStats.total) * 100 : 0;

  return (
    <div className={`event-card ${isSelected ? 'event-card--selected' : ''}`}>
      <div className="event-card__header">
        <label className="event-card__checkbox">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelect(e.target.checked)}
          />
          <span className="event-card__checkbox-custom"></span>
        </label>

        <div 
          className="event-card__status"
          style={{ backgroundColor: getStatusColor(event.status) }}
        >
          {getStatusLabel(event.status)}
        </div>

        <div className="event-card__menu">
          <button
            className="event-card__menu-trigger"
            onClick={() => setShowMenu(!showMenu)}
          >
            <MoreVertical size={16} />
          </button>
          
          {showMenu && (
            <div className="event-card__menu-dropdown">
              <button onClick={() => { onAction(event.id, 'view'); setShowMenu(false); }}>
                <Eye size={16} />
                Zobacz szczegóły
              </button>
              <button onClick={() => { onAction(event.id, 'edit'); setShowMenu(false); }}>
                <Edit size={16} />
                Edytuj
              </button>
              <button onClick={() => { onAction(event.id, 'duplicate'); setShowMenu(false); }}>
                <Copy size={16} />
                Duplikuj
              </button>
              <button 
                className="event-card__menu-delete"
                onClick={() => { onAction(event.id, 'delete'); setShowMenu(false); }}
              >
                <Trash2 size={16} />
                Usuń
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="event-card__content" onClick={() => onAction(event.id, 'view')}>
        <h3 className="event-card__title">{event.title}</h3>
        <p className="event-card__description">{event.description}</p>

        <div className="event-card__details">
          <div className="event-card__detail">
            <Calendar size={16} />
            <span>{getDateLabel(event.date)}</span>
          </div>
          
          <div className="event-card__detail">
            <Clock size={16} />
            <span>{format(event.date, 'HH:mm')}</span>
          </div>

          <div className="event-card__detail">
            <MapPin size={16} />
            <span>{event.location}</span>
          </div>

          <div className="event-card__detail">
            <Users size={16} />
            <span>{guestStats.accepted}/{guestStats.total} gości</span>
          </div>
        </div>

        {guestStats.total > 0 && (
          <div className="event-card__progress">
            <div className="event-card__progress-bar">
              <div 
                className="event-card__progress-fill"
                style={{ width: `${responseRate}%` }}
              />
            </div>
            <div className="event-card__progress-stats">
              <span>{Math.round(responseRate)}% potwierdzonych</span>
              {guestStats.pending > 0 && (
                <span className="event-card__pending">
                  {guestStats.pending} oczekuje
                </span>
              )}
            </div>
          </div>
        )}

        <div className="event-card__footer">
          <span className="event-card__created">
            Utworzono {format(event.createdAt, 'd MMM', { locale: pl })}
          </span>
          
          {event.status === 'active' && !isPast(event.date) && (
            <div className="event-card__countdown">
              <Clock size={12} />
              <span>{getDateLabel(event.date)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;