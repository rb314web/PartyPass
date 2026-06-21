// components/dashboard/AnalyticsWidget/AnalyticsWidget.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  TrendingUp,
  Users,
  Calendar,
  ArrowRight,
  Eye,
  Activity,
} from 'lucide-react';
import {
  AnalyticsService,
  AnalyticsReport,
  buildAnalyticsDateRange,
} from '../../../services/firebase/analyticsService';
import { useAuth } from '../../../hooks/useAuth';
import LoadingSpinner from '../../common/LoadingSpinner/LoadingSpinner';
import './AnalyticsWidget.scss';

const AnalyticsWidget: React.FC = () => {
  const { user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsReport | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const loadAnalytics = async () => {
      try {
        setLoading(true);
        const { startDate, endDate } = buildAnalyticsDateRange(30);

        const report = await AnalyticsService.generateReport(user.id, {
          startDate,
          endDate,
        });

        setAnalyticsData(report);
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [user?.id]);

  const getGrowthColor = (rate: number) => {
    if (rate > 0) return 'success';
    if (rate < 0) return 'error';
    return 'neutral';
  };

  const getGrowthIcon = (rate: number) => {
    if (rate > 0) return <TrendingUp size={16} />;
    if (rate < 0)
      return <TrendingUp size={16} style={{ transform: 'rotate(180deg)' }} />;
    return null;
  };

  if (loading) {
    return (
      <div className="analytics-widget">
        <div className="analytics-widget__header">
          <h3>Analityka</h3>
          <LoadingSpinner variant="simple" />
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="analytics-widget">
        <div className="analytics-widget__header">
          <h3>Analityka</h3>
          <Link to="/dashboard/analytics" className="analytics-widget__link">
            <ArrowRight size={16} />
          </Link>
        </div>
        <div className="analytics-widget__empty">
          <p>Brak danych analitycznych</p>
        </div>
      </div>
    );
  }

  const guestDenominator = analyticsData.totalGuests || 1;
  const avgGuestsPerEvent =
    analyticsData.totalEvents > 0
      ? Math.round(analyticsData.totalGuests / analyticsData.totalEvents)
      : 0;

  return (
    <div className="analytics-widget">
      <div className="analytics-widget__header">
        <div className="analytics-widget__title">
          <BarChart3 size={20} />
          <h3>Podsumowanie (30 dni)</h3>
        </div>
        <Link to="/dashboard/analytics" className="analytics-widget__link">
          <ArrowRight size={16} />
        </Link>
      </div>

      <div className="analytics-widget__content">
        {/* Key Metrics */}
        <div className="analytics-widget__metrics">
          <div className="analytics-widget__metric-group">
            <div className="analytics-widget__metric">
              <div className="analytics-widget__metric-header">
                <Calendar size={16} />
                <h5>Wydarzenia</h5>
              </div>
              <div className="analytics-widget__metric-value">
                <strong>{analyticsData.totalEvents}</strong>
                {getGrowthIcon(analyticsData.growthRate)}
                <span
                  className={`analytics-widget__trend analytics-widget__trend--${getGrowthColor(analyticsData.growthRate)}`}
                  title="Wzrost nowo utworzonych wydarzeń m/m"
                >
                  {analyticsData.growthRate > 0 ? '+' : ''}
                  {Math.round(analyticsData.growthRate)}% m/m
                </span>
              </div>
            </div>
            <div className="analytics-widget__metric">
              <div className="analytics-widget__metric-header">
                <Users size={16} />
                <h5>Średnia frekwencja</h5>
              </div>
              <div className="analytics-widget__metric-value">
                <strong>{avgGuestsPerEvent} os.</strong>
                <span className="analytics-widget__metric-label">
                  na wydarzenie
                </span>
              </div>
            </div>
          </div>

          <div className="analytics-widget__metric-group">
            <div className="analytics-widget__metric">
              <div className="analytics-widget__metric-header">
                <Eye size={16} />
                <h5>Wskaźnik odpowiedzi</h5>
              </div>
              <div className="analytics-widget__metric-value">
                <strong>{Math.round(analyticsData.rsvpRate)}%</strong>
                <span
                  className={`analytics-widget__trend analytics-widget__trend--success`}
                >
                  cel: 85%
                </span>
              </div>
            </div>
            <div className="analytics-widget__metric">
              <div className="analytics-widget__metric-header">
                <Activity size={16} />
                <h5>Aktywność</h5>
              </div>
              <div className="analytics-widget__metric-value">
                <strong>
                  {analyticsData.guestEngagement.confirmed +
                    analyticsData.guestEngagement.pending}
                </strong>
                <span className="analytics-widget__metric-label">
                  interakcji
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Response Status */}
        <div className="analytics-widget__response-status">
          <h4>Status zaproszeń</h4>
          <div className="analytics-widget__response-bars">
            <div className="analytics-widget__response-bar">
              <div
                className="analytics-widget__response-fill analytics-widget__response-fill--confirmed"
                style={{
                  width: `${(analyticsData.guestEngagement.confirmed / guestDenominator) * 100}%`,
                }}
              />
              <div
                className="analytics-widget__response-fill analytics-widget__response-fill--pending"
                style={{
                  width: `${(analyticsData.guestEngagement.pending / guestDenominator) * 100}%`,
                }}
              />
              <div
                className="analytics-widget__response-fill analytics-widget__response-fill--declined"
                style={{
                  width: `${(analyticsData.guestEngagement.declined / guestDenominator) * 100}%`,
                }}
              />
            </div>
            <div className="analytics-widget__response-legend">
              <div className="analytics-widget__legend-item">
                <div className="analytics-widget__legend-dot analytics-widget__legend-dot--confirmed" />
                <span>
                  {analyticsData.totalGuests > 0
                    ? Math.round(
                        (analyticsData.guestEngagement.confirmed /
                          analyticsData.totalGuests) *
                          100
                      )
                    : 0}
                  % Potwierdzone
                </span>
              </div>
              <div className="analytics-widget__legend-item">
                <div className="analytics-widget__legend-dot analytics-widget__legend-dot--pending" />
                <span>
                  {analyticsData.totalGuests > 0
                    ? Math.round(
                        (analyticsData.guestEngagement.pending /
                          analyticsData.totalGuests) *
                          100
                      )
                    : 0}
                  % Oczekujące
                </span>
              </div>
              <div className="analytics-widget__legend-item">
                <div className="analytics-widget__legend-dot analytics-widget__legend-dot--declined" />
                <span>
                  {analyticsData.totalGuests > 0
                    ? Math.round(
                        (analyticsData.guestEngagement.declined /
                          analyticsData.totalGuests) *
                          100
                      )
                    : 0}
                  % Odrzucone
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="analytics-widget__action">
          <Link
            to="/dashboard/analytics"
            className="analytics-widget__view-all"
          >
            <BarChart3 size={16} />
            Zobacz szczegółowe statystyki
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsWidget;
