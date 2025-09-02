// components/dashboard/Analytics/RealTimeWidget/RealTimeWidget.tsx
import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Users, 
  Eye, 
  TrendingUp,
  Wifi,
  WifiOff,
  RefreshCw
} from 'lucide-react';
import { AnalyticsService } from '../../../../services/firebase/analyticsService';
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

const RealTimeWidget: React.FC = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<RealTimeMetric[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    let unsubscribe: (() => void) | null = null;

    const subscribeToMetrics = async () => {
      try {
        setIsConnected(true);
        unsubscribe = await AnalyticsService.subscribeToMetrics(
          user.id,
          (newMetrics) => {
            // Transform array to object with mock data for now
            const metricsData = {
              pageViews: 0,
              pageViewsChange: 0,
              activeUsers: 0,
              activeUsersChange: 0,
              userActions: 0,
              userActionsChange: 0,
              engagementRate: 0,
              engagementRateChange: 0
            };
            
            const realTimeMetrics: RealTimeMetric[] = [
              {
                id: 'page_views',
                label: 'Wyświetlenia',
                value: metricsData.pageViews || 0,
                change: metricsData.pageViewsChange || 0,
                icon: <Eye size={20} />,
                color: 'blue'
              },
              {
                id: 'active_users',
                label: 'Aktywni użytkownicy',
                value: metricsData.activeUsers || 0,
                change: metricsData.activeUsersChange || 0,
                icon: <Users size={20} />,
                color: 'green'
              },
              {
                id: 'user_actions',
                label: 'Akcje użytkowników',
                value: metricsData.userActions || 0,
                change: metricsData.userActionsChange || 0,
                icon: <Activity size={20} />,
                color: 'purple'
              },
              {
                id: 'engagement_rate',
                label: 'Wskaźnik zaangażowania',
                value: metricsData.engagementRate || 0,
                change: metricsData.engagementRateChange || 0,
                icon: <TrendingUp size={20} />,
                color: 'orange'
              }
            ];

            setMetrics(realTimeMetrics);
            setLastUpdate(new Date());
          }
        );
      } catch (error) {
        console.error('Failed to subscribe to real-time metrics:', error);
        setIsConnected(false);
      }
    };

    subscribeToMetrics();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user?.id]);

  const formatValue = (value: number, metricId: string): string => {
    if (metricId === 'engagement_rate') {
      return `${value.toFixed(1)}%`;
    }
    return value.toLocaleString();
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp size={14} />;
    if (change < 0) return <TrendingUp size={14} style={{ transform: 'rotate(180deg)' }} />;
    return null;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'success';
    if (change < 0) return 'error';
    return 'neutral';
  };

  return (
    <div className="realtime-widget">
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

      {lastUpdate && (
        <div className="realtime-widget__last-update">
          <RefreshCw size={14} />
          <span>Ostatnia aktualizacja: {lastUpdate.toLocaleTimeString()}</span>
        </div>
      )}

      <div className="realtime-widget__metrics">
        {metrics.map((metric) => (
          <div key={metric.id} className="realtime-widget__metric">
            <div className={`realtime-widget__metric-icon realtime-widget__metric-icon--${metric.color}`}>
              {metric.icon}
            </div>
            <div className="realtime-widget__metric-content">
              <div className="realtime-widget__metric-value">
                {formatValue(metric.value, metric.id)}
              </div>
              <div className="realtime-widget__metric-label">
                {metric.label}
              </div>
              {metric.change !== 0 && (
                <div className={`realtime-widget__metric-change realtime-widget__metric-change--${getChangeColor(metric.change)}`}>
                  {getChangeIcon(metric.change)}
                  <span>{Math.abs(metric.change).toFixed(1)}%</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {!isConnected && (
        <div className="realtime-widget__error">
          <p>Brak połączenia z danymi w czasie rzeczywistym</p>
          <button 
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
