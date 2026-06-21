import React from 'react';
import { CheckCircle, XCircle, Clock, UserPlus, TrendingUp } from 'lucide-react';
import type { EventRsvpCounts } from '../../../../utils/partyInvitationUtils';

interface TimeUntilEvent {
  days: number;
  hours: number;
  minutes: number;
  isPast: boolean;
}

interface EventStatsPanelProps {
  maxGuests: number;
  stats: EventRsvpCounts;
  expectedAttendance: number;
  invitationCount: number;
  timeUntilEvent: TimeUntilEvent | null;
}

const EventStatsPanel: React.FC<EventStatsPanelProps> = ({
  maxGuests,
  stats,
  expectedAttendance,
  invitationCount,
  timeUntilEvent,
}) => {
  const { guestCount, acceptedCount, pendingCount, declinedCount } = stats;
  const respondedSeats = Math.max(0, guestCount - pendingCount);
  const responseRate =
    guestCount > 0 ? Math.round((respondedSeats / guestCount) * 100) : 0;
  const freeSpots = Math.max(0, maxGuests - guestCount);

  return (
    <div className="event-details__guests-stats">
      <h2 className="event-details__section-title">Statystyki gości</h2>

      <div className="event-details__stat-main">
        <div className="event-details__stat-main-content">
          <div className="event-details__stat-main-value">{guestCount}</div>
          <div className="event-details__stat-main-label">
            {invitationCount === 1
              ? '1 zaproszenie'
              : `${invitationCount} zaproszeń`}{' '}
            · limit {maxGuests} miejsc
          </div>
        </div>
        <div className="event-details__stat-main-progress">
          <div
            className="event-details__stat-main-progress-fill"
            style={{
              width: `${Math.min(maxGuests > 0 ? (guestCount / maxGuests) * 100 : 0, 100)}%`,
            }}
          ></div>
        </div>
      </div>

      {timeUntilEvent && (
        <div className="event-details__countdown">
          <div className="event-details__countdown-label">
            {timeUntilEvent.isPast ? 'Wydarzenie minęło' : 'Do wydarzenia pozostało'}
          </div>
          {!timeUntilEvent.isPast && (
            <div className="event-details__countdown-grid">
              <div className="event-details__countdown-item">
                <div className="event-details__countdown-value">{timeUntilEvent.days}</div>
                <div className="event-details__countdown-unit">dni</div>
              </div>
              <div className="event-details__countdown-separator">:</div>
              <div className="event-details__countdown-item">
                <div className="event-details__countdown-value">{timeUntilEvent.hours}</div>
                <div className="event-details__countdown-unit">godz</div>
              </div>
              <div className="event-details__countdown-separator">:</div>
              <div className="event-details__countdown-item">
                <div className="event-details__countdown-value">{timeUntilEvent.minutes}</div>
                <div className="event-details__countdown-unit">min</div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="event-details__stat-grid">
        <div className="event-details__stat event-details__stat--accepted">
          <div className="event-details__stat-content">
            <div className="event-details__stat-header">
              <CheckCircle size={18} className="event-details__stat-icon" />
              <div className="event-details__stat-value">{acceptedCount}</div>
            </div>
            <div className="event-details__stat-label">Potwierdzeni</div>
            {guestCount > 0 && (
              <div className="event-details__stat-percent">
                {Math.round((acceptedCount / guestCount) * 100)}%
              </div>
            )}
          </div>
        </div>
        <div className="event-details__stat event-details__stat--pending">
          <div className="event-details__stat-content">
            <div className="event-details__stat-header">
              <Clock size={18} className="event-details__stat-icon" />
              <div className="event-details__stat-value">{pendingCount}</div>
            </div>
            <div className="event-details__stat-label">Oczekujący</div>
            {guestCount > 0 && (
              <div className="event-details__stat-percent">
                {Math.round((pendingCount / guestCount) * 100)}%
              </div>
            )}
          </div>
        </div>
        <div className="event-details__stat event-details__stat--declined">
          <div className="event-details__stat-content">
            <div className="event-details__stat-header">
              <XCircle size={18} className="event-details__stat-icon" />
              <div className="event-details__stat-value">{declinedCount}</div>
            </div>
            <div className="event-details__stat-label">Odrzucili</div>
            {guestCount > 0 && (
              <div className="event-details__stat-percent">
                {Math.round((declinedCount / guestCount) * 100)}%
              </div>
            )}
          </div>
        </div>
        <div className="event-details__stat event-details__stat--available">
          <div className="event-details__stat-content">
            <div className="event-details__stat-header">
              <UserPlus size={18} className="event-details__stat-icon" />
              <div className="event-details__stat-value">{freeSpots}</div>
            </div>
            <div className="event-details__stat-label">Miejsca wolne</div>
            {maxGuests > 0 && (
              <div className="event-details__stat-percent">
                {Math.round((freeSpots / maxGuests) * 100)}%
              </div>
            )}
          </div>
        </div>
      </div>

      {guestCount > 0 && (
        <div className="event-details__attendance-stat">
          <div className="event-details__attendance-stat-header">
            <TrendingUp size={18} className="event-details__attendance-stat-icon" />
            <div className="event-details__attendance-stat-content">
              <div className="event-details__attendance-stat-label">Potencjalna frekwencja</div>
              <div className="event-details__attendance-stat-value">
                {expectedAttendance} / {maxGuests}
              </div>
            </div>
          </div>
          <div className="event-details__attendance-stat-bar">
            <div
              className="event-details__attendance-stat-fill"
              style={{
                width: `${Math.min(maxGuests > 0 ? (expectedAttendance / maxGuests) * 100 : 0, 100)}%`,
              }}
            ></div>
          </div>
        </div>
      )}

      {guestCount > 0 && (
        <div className="event-details__response-rate">
          <div className="event-details__response-rate-label">Wskaźnik odpowiedzi</div>
          <div className="event-details__response-rate-value">{responseRate}%</div>
          <div className="event-details__response-rate-bar">
            <div
              className="event-details__response-rate-fill"
              style={{ width: `${responseRate}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventStatsPanel;
