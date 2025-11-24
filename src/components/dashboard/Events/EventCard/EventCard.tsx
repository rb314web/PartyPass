// components/dashboard/Events/EventCard/EventCard.tsx
import React, { useState, useEffect, useRef, memo } from 'react';
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
  AlertTriangle,
  Award,
} from 'lucide-react';
import { Event } from '../../../../types';
import './EventCard.scss';

interface EventCardProps {
  event: Event;
  onAction: (
    eventId: string,
    action: 'edit' | 'duplicate' | 'delete' | 'view'
  ) => void;
  getStatusColor: (status: Event['status']) => string;
  getStatusLabel: (status: Event['status']) => string;
}

const EventCard: React.FC<EventCardProps> = ({
  event,
  onAction,
  getStatusColor,
  getStatusLabel,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showMenu) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showMenu]);

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return 'Dzisiaj';
    if (isTomorrow(date)) return 'Jutro';
    if (isPast(date)) return 'Minęło';

    const now = new Date();
    const diffDays = Math.ceil(
      (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

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

  const getStatusTone = (status: Event['status']) => {
    switch (status) {
      case 'active':
        return 'var(--color-success-light)';
      case 'draft':
        return 'var(--color-warning-light)';
      case 'completed':
        return 'var(--color-primary-light)';
      case 'cancelled':
        return 'var(--color-error-light)';
      default:
        return 'var(--bg-tertiary)';
    }
  };

  const getStatusIcon = (status: Event['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircle2 size={14} />;
      case 'draft':
        return <Edit size={14} />;
      case 'completed':
        return <Award size={14} />;
      case 'cancelled':
        return <AlertTriangle size={14} />;
      default:
        return <Clock size={14} />;
    }
  };

  const guestStats = getGuestStats();
  const responseRate =
    guestStats.total > 0 ? (guestStats.accepted / guestStats.total) * 100 : 0;
  const statusColor = getStatusColor(event.status);
  const statusTone = getStatusTone(event.status);
  const statusIcon = getStatusIcon(event.status);
  const visibleTags = event.tags?.slice(0, 3) || [];
  const remainingTags = Math.max(
    (event.tags?.length || 0) - visibleTags.length,
    0
  );
  const dateLabel = getDateLabel(event.date);
  const formattedDate = format(event.date, 'd MMMM yyyy', { locale: pl });
  const formattedTime = format(event.date, 'HH:mm');
  const dateDay = format(event.date, 'd', { locale: pl });
  const dateMonth = format(event.date, 'LLL', { locale: pl }).toUpperCase();
  const LOCATION_MAX = 42;
  const trimmedLocation = event.location?.trim() || '';
  const locationLabel = trimmedLocation || 'Brak lokalizacji';
  const displayedLocation =
    trimmedLocation.length > LOCATION_MAX
      ? `${trimmedLocation.slice(0, LOCATION_MAX - 1)}…`
      : locationLabel;

  const handleCardActivate = () => {
    setShowMenu(false);
    onAction(event.id, 'view');
  };

  return (
    <article
      className="event-card"
      tabIndex={0}
      role="button"
      onClick={handleCardActivate}
      onKeyDown={eventKey => {
        if (eventKey.key === 'Enter' || eventKey.key === ' ') {
          eventKey.preventDefault();
          handleCardActivate();
        }
      }}
      style={
        {
          '--event-card-accent': statusColor,
          '--event-card-accent-soft': statusTone,
        } as React.CSSProperties
      }
    >
      <header className="event-card__top">
        <div className="event-card__date-badge" aria-hidden="true">
          <span className="event-card__date-day">{dateDay}</span>
          <span className="event-card__date-month">{dateMonth}</span>
        </div>

        <div className="event-card__top-content">
          <div className="event-card__top-row">
            <div
              className="event-card__status-chip"
              aria-label={`Status wydarzenia: ${getStatusLabel(event.status)}`}
            >
              <span className="event-card__status-icon">{statusIcon}</span>
              {getStatusLabel(event.status)}
            </div>
            <div className="event-card__menu">
              <button
                className="event-card__menu-trigger"
                onClick={menuClick => {
                  menuClick.stopPropagation();
                  setShowMenu(prev => !prev);
                }}
                aria-haspopup="menu"
                aria-expanded={showMenu}
                aria-label="Otwórz menu akcji"
              >
                <MoreVertical size={18} />
              </button>
              {showMenu && (
                <div
                  className="event-card__menu-dropdown"
                  role="menu"
                  ref={menuRef}
                  onClick={dropdownClick => dropdownClick.stopPropagation()}
                >
                  <button
                    onClick={btnClick => {
                      btnClick.stopPropagation();
                      onAction(event.id, 'view');
                      setShowMenu(false);
                    }}
                  >
                    <Eye size={16} />
                    Zobacz szczegóły
                  </button>
                  <button
                    onClick={btnClick => {
                      btnClick.stopPropagation();
                      onAction(event.id, 'edit');
                      setShowMenu(false);
                    }}
                  >
                    <Edit size={16} />
                    Edytuj
                  </button>
                  <button
                    onClick={btnClick => {
                      btnClick.stopPropagation();
                      onAction(event.id, 'duplicate');
                      setShowMenu(false);
                    }}
                  >
                    <Copy size={16} />
                    Duplikuj
                  </button>
                  <button
                    className="event-card__menu-delete"
                    onClick={btnClick => {
                      btnClick.stopPropagation();
                      onAction(event.id, 'delete');
                      setShowMenu(false);
                    }}
                  >
                    <Trash2 size={16} />
                    Usuń
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="event-card__top-meta">
            <span className="event-card__top-line">
              <Calendar size={14} aria-hidden="true" />
              <span>{formattedDate}</span>
            </span>
            <span className="event-card__top-line">
              <Clock size={14} aria-hidden="true" />
              <span>{formattedTime}</span>
              <span className="event-card__top-pill">{dateLabel}</span>
            </span>
            <span className="event-card__top-line">
              <MapPin size={14} aria-hidden="true" />
              <span
                className="event-card__top-text"
                title={locationLabel}
                aria-label={`Lokalizacja: ${locationLabel}`}
              >
                {displayedLocation}
              </span>
            </span>
          </div>
        </div>
      </header>

      <div className="event-card__content">
        <h3 className="event-card__title">{event.title}</h3>
        {event.description && (
          <p className="event-card__description">{event.description}</p>
        )}

        <div className="event-card__meta">
          <div className="event-card__meta-item">
            <Users size={16} aria-hidden="true" />
            <span>
              {guestStats.accepted}/{guestStats.total} potwierdzonych
            </span>
          </div>
          {guestStats.pending > 0 && (
            <div className="event-card__meta-item">
              <Clock size={16} aria-hidden="true" />
              <span className="event-card__pending-chip">
                {guestStats.pending} oczekuje
              </span>
            </div>
          )}
          {visibleTags.length > 0 && (
            <ul className="event-card__tags" aria-label="Tagi wydarzenia">
              {visibleTags.map((tag, index) => (
                <li key={`${tag}-${index}`}>{tag}</li>
              ))}
              {remainingTags > 0 && <li>+{remainingTags}</li>}
            </ul>
          )}
        </div>

        {guestStats.total > 0 && (
          <div
            className="event-card__progress"
            aria-label={`Potwierdzono ${Math.round(responseRate)}% zaproszeń`}
          >
            <div className="event-card__progress-track">
              <div
                className="event-card__progress-fill"
                style={{ width: `${responseRate}%` }}
              />
            </div>
            <div className="event-card__progress-meta">
              <span>{Math.round(responseRate)}% potwierdzonych</span>
            </div>
          </div>
        )}
      </div>

      <footer className="event-card__footer">
        <span className="event-card__created">
          Utworzono {format(event.createdAt, 'd MMM', { locale: pl })}
        </span>

        {event.status === 'active' && !isPast(event.date) && (
          <span className="event-card__countdown">
            <Clock size={12} aria-hidden="true" />
            {getDateLabel(event.date)}
          </span>
        )}
      </footer>
    </article>
  );
};

export default memo(EventCard);
