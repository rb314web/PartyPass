// components/dashboard/DashboardHome/ActivityOverview.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Users,
  ArrowRight,
  MessageSquare,
  CalendarDays,
} from 'lucide-react';
import './ActivityOverview.scss';

interface RecentResponse {
  id: string;
  name: string;
  timestamp: string | Date;
  type: 'guest_accepted' | 'guest_declined';
}

interface NextEvent {
  id: string;
  title: string;
  date: string | Date;
  location?: string;
  guestCount: number;
}

interface ActivityOverviewProps {
  recentResponses: RecentResponse[];
  nextEvent: NextEvent | null;
  isLoadingResponses?: boolean;
  isLoadingNextEvent?: boolean;
}

const ActivityOverview: React.FC<ActivityOverviewProps> = ({
  recentResponses,
  nextEvent,
  isLoadingResponses = false,
  isLoadingNextEvent = false,
}) => {
  const navigate = useNavigate();

  const formatEventDate = (date: Date | string) => {
    const eventDate = new Date(date);
    const now = new Date();
    const diffTime = eventDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Dzisiaj';
    if (diffDays === 1) return 'Jutro';
    if (diffDays <= 7) return `Za ${diffDays} dni`;

    return eventDate.toLocaleDateString('pl-PL', {
      day: 'numeric',
      month: 'short',
      year: eventDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  const formatEventTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString('pl-PL', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatResponseTime = (timestamp: string | Date) => {
    return new Date(timestamp).toLocaleDateString('pl-PL', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="activity-overview">
      {/* Recent Responses */}
      <div className="activity-overview__section activity-overview__section--recent">
        <div className="activity-overview__header">
          <div className="activity-overview__icon-circle activity-overview__icon-circle--purple">
            <MessageSquare size={18} strokeWidth={2} />
          </div>
          <h3 className="activity-overview__title">Ostatnie akcje</h3>
        </div>

        <div className="activity-overview__content">
          {isLoadingResponses ? (
            <div className="activity-overview__loading">
              <div className="activity-overview__skeleton-item" />
              <div className="activity-overview__skeleton-item" />
              <div className="activity-overview__skeleton-item" />
            </div>
          ) : recentResponses.length > 0 ? (
            <div className="activity-overview__list">
              {recentResponses.slice(0, 3).map((response) => (
                <div key={response.id} className="activity-overview__item">
                  <div
                    className={`activity-overview__avatar ${
                      response.type === 'guest_declined'
                        ? 'activity-overview__avatar--declined'
                        : ''
                    }`}
                  >
                    {response.type === 'guest_accepted' ? (
                      <CheckCircle2 size={14} strokeWidth={2.5} />
                    ) : (
                      <XCircle size={14} strokeWidth={2.5} />
                    )}
                  </div>
                  <div className="activity-overview__info">
                    <span className="activity-overview__name">{response.name}</span>
                    <span className="activity-overview__meta">
                      {response.type === 'guest_accepted' ? 'Potwierdził' : 'Odrzucił'}
                    </span>
                  </div>
                  <span className="activity-overview__time">
                    {formatResponseTime(response.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="activity-overview__empty">
              <MessageSquare size={32} opacity={0.2} />
              <p>Brak ostatnich akcji</p>
            </div>
          )}
        </div>

        <button
          className="activity-overview__link"
          onClick={() => navigate('/dashboard/activities')}
        >
          <span>Zobacz więcej</span>
          <ArrowRight size={14} />
        </button>
      </div>


    </div>
  );
};

export default ActivityOverview;

