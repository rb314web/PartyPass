import React from 'react';
import { Zap, Clock, Target } from 'lucide-react';
import { formatDurationHours } from '../../../../utils/analyticsDisplay';
import './ResponsePaceCard.scss';

interface ResponsePaceCardProps {
  fast: number;
  medium: number;
  slow: number;
  averageHours: number;
  trackedResponses: number;
  totalResponded: number;
}

const SEGMENTS = [
  { key: 'fast' as const, label: 'Szybkie', hint: '< 24 h', icon: Zap, color: '#6db89a' },
  { key: 'medium' as const, label: 'Średnie', hint: '1–7 dni', icon: Clock, color: '#d9a066' },
  { key: 'slow' as const, label: 'Powolne', hint: '> 7 dni', icon: Target, color: '#94a3b8' },
];

const ResponsePaceCard: React.FC<ResponsePaceCardProps> = ({
  fast,
  medium,
  slow,
  averageHours,
  trackedResponses,
  totalResponded,
}) => {
  const total = fast + medium + slow;
  const untracked = Math.max(totalResponded - trackedResponses, 0);

  return (
    <div className="response-pace-card">
      {total > 0 ? (
        <>
          <div
            className="response-pace-card__stack"
            role="img"
            aria-label="Rozkład tempa odpowiedzi gości"
          >
            {SEGMENTS.map(segment => {
              const value =
                segment.key === 'fast'
                  ? fast
                  : segment.key === 'medium'
                    ? medium
                    : slow;
              if (value === 0) return null;
              return (
                <div
                  key={segment.key}
                  className="response-pace-card__stack-segment"
                  style={{
                    flexGrow: value,
                    backgroundColor: segment.color,
                  }}
                  title={`${segment.label}: ${value}`}
                />
              );
            })}
          </div>

          <div className="response-pace-card__segments">
            {SEGMENTS.map(segment => {
              const Icon = segment.icon;
              const value =
                segment.key === 'fast'
                  ? fast
                  : segment.key === 'medium'
                    ? medium
                    : slow;
              const share = total > 0 ? Math.round((value / total) * 100) : 0;

              return (
                <div key={segment.key} className="response-pace-card__segment">
                  <div
                    className="response-pace-card__segment-icon"
                    style={{ color: segment.color }}
                  >
                    <Icon size={18} />
                  </div>
                  <div className="response-pace-card__segment-body">
                    <span className="response-pace-card__segment-label">
                      {segment.label}
                    </span>
                    <span className="response-pace-card__segment-hint">
                      {segment.hint}
                    </span>
                  </div>
                  <div className="response-pace-card__segment-value">
                    <strong>{value}</strong>
                    <span>{share}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="response-pace-card__empty">
          <p>Brak danych o czasie odpowiedzi w tym okresie.</p>
        </div>
      )}

      <div className="response-pace-card__footer">
        <span>
          Średni czas:{' '}
          <strong>{formatDurationHours(averageHours)}</strong>
        </span>
        {untracked > 0 && (
          <span className="response-pace-card__footer-note">
            {untracked} bez pełnego znacznika czasu
          </span>
        )}
      </div>
    </div>
  );
};

export default ResponsePaceCard;
