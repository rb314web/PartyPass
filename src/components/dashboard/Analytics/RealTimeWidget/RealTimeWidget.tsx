// components/dashboard/Analytics/RealTimeWidget/RealTimeWidget.tsx
import React, { useState, useEffect } from 'react';
import {
  Activity,
  Users,
  Eye,
  TrendingUp,
  Wifi,
  WifiOff,
  RefreshCw,
  Calendar,
} from 'lucide-react';
import {
  AnalyticsService,
  aggregateRecentMetrics,
} from '../../../../services/firebase/analyticsService';
import { useAuth } from '../../../../hooks/useAuth';
import './RealTimeWidget.scss';

interface RealTimeMetric {
  id: string;
  label: string;
  value: number;
  change: number;
  icon: React.ReactNode;
  color: string;
}

const RealTimeWidget: React.FC<{ embedded?: boolean }> = ({ embedded = false }) => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<RealTimeMetric[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const isDev = import.meta.env.DEV;

  useEffect(() => {
    if (!user?.id) return;

    let unsubscribe: (() => void) | null = null;

    try {
      setIsConnected(true);
      unsubscribe = AnalyticsService.subscribeToMetrics(user.id, rawMetrics => {
        const aggregated = aggregateRecentMetrics(rawMetrics);

        setMetrics([
          {
            id: 'page_views',
            label: 'Wyświetlenia stron',
            value: aggregated.pageViews.current,
            change: aggregated.pageViews.change,
            icon: <Eye size={20} />,
            color: 'blue',
          },
          {
            id: 'user_actions',
            label: 'Akcje użytkownika',
            value: aggregated.userActions.current,
            change: aggregated.userActions.change,
            icon: <Activity size={20} />,
            color: 'purple',
          },
          {
            id: 'events_created',
            label: 'Nowe wydarzenia',
            value: aggregated.eventsCreated.current,
            change: aggregated.eventsCreated.change,
            icon: <Calendar size={20} />,
            color: 'green',
          },
          {
            id: 'rsvp_responses',
            label: 'Odpowiedzi RSVP',
            value: aggregated.rsvpResponses.current,
            change: aggregated.rsvpResponses.change,
            icon: <Users size={20} />,
            color: 'orange',
          },
        ]);
        setLastUpdate(new Date());
      });
    } catch (error) {
      console.error('Failed to subscribe to real-time metrics:', error);
      setIsConnected(false);
    }

    return () => {
      unsubscribe?.();
    };
  }, [user?.id]);

  const formatValue = (value: number): string => value.toLocaleString('pl-PL');

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp size={14} />;
    if (change < 0)
      return <TrendingUp size={14} style={{ transform: 'rotate(180deg)' }} />;
    return null;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'success';
    if (change < 0) return 'error';
    return 'neutral';
  };

  const hasActivity = metrics.some(metric => metric.value > 0);

  return (
    <div className={`realtime-widget${embedded ? ' realtime-widget--embedded' : ''}`}>
      {!embedded && (
      <div className="realtime-widget__header">
        <h3>Metryki w czasie rzeczywistym</h3>
        <div className="realtime-widget__status">
          {isConnected ? (
            <div className="realtime-widget__status-connected">
              <Wifi size={16} />
              <span>Połączono</span>
            </div>
          ) : (
            <div className="realtime-widget__status-disconnected">
              <WifiOff size={16} />
              <span>Rozłączono</span>
            </div>
          )}
        </div>
      </div>
      )}

      {embedded && (
        <div className="realtime-widget__inline-header">
          <div className="realtime-widget__status">
            {isConnected ? (
              <div className="realtime-widget__status-connected">
                <Wifi size={14} />
                <span>Połączono</span>
              </div>
            ) : (
              <div className="realtime-widget__status-disconnected">
                <WifiOff size={14} />
                <span>Rozłączono</span>
              </div>
            )}
          </div>
          {lastUpdate && (
            <span className="realtime-widget__inline-update">
              {lastUpdate.toLocaleTimeString('pl-PL')}
            </span>
          )}
        </div>
      )}

      {lastUpdate && !embedded && (
        <div className="realtime-widget__last-update">
          <RefreshCw size={14} />
          <span>Ostatnia aktualizacja: {lastUpdate.toLocaleTimeString('pl-PL')}</span>
        </div>
      )}

      {isDev && (
        <p className="realtime-widget__dev-note">
          {embedded
            ? 'Śledzenie wyłączone lokalnie — dane po wdrożeniu.'
            : 'Śledzenie aktywności jest wyłączone lokalnie — dane pojawią się po wdrożeniu produkcyjnym.'}
        </p>
      )}

      <div className="realtime-widget__metrics">
        {metrics.map(metric => (
          <div key={metric.id} className="realtime-widget__metric">
            <div
              className={`realtime-widget__metric-icon realtime-widget__metric-icon--${metric.color}`}
            >
              {metric.icon}
            </div>
            <div className="realtime-widget__metric-content">
              <div className="realtime-widget__metric-value">
                {formatValue(metric.value)}
              </div>
              <div className="realtime-widget__metric-label">
                {metric.label}
              </div>
              {metric.change !== 0 && (
                <div
                  className={`realtime-widget__metric-change realtime-widget__metric-change--${getChangeColor(metric.change)}`}
                >
                  {getChangeIcon(metric.change)}
                  <span>vs poprzednie 24 h: {Math.abs(metric.change).toFixed(1)}%</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {!hasActivity && isConnected && !isDev && (
        <div className="realtime-widget__empty">
          <p>Brak zarejestrowanej aktywności w ostatnich 24 godzinach.</p>
        </div>
      )}

      {!isConnected && (
        <div className="realtime-widget__error">
          <p>Brak połączenia z danymi w czasie rzeczywistym</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="realtime-widget__retry"
          >
            Spróbuj ponownie
          </button>
        </div>
      )}
    </div>
  );
};

export default RealTimeWidget;
