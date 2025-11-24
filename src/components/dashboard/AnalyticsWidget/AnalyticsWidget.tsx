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
} from '../../../services/firebase/analyticsService';
import { useAuth } from '../../../hooks/useAuth';
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
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30); // Last 30 days

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
          <div className="analytics-widget__loader">
            <div className="analytics-widget__spinner" />
          </div>
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

  return (
    <div className="analytics-widget">
      <div className="analytics-widget__header">
        <div className="analytics-widget__title">
          <BarChart3 size={20} />
          <h3>Podsumowanie miesiąca</h3>
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
                >
                  {analyticsData.growthRate > 0 ? '+' : ''}
                  {analyticsData.growthRate}%
                </span>
              </div>
            </div>
            <div className="analytics-widget__metric">
              <div className="analytics-widget__metric-header">
                <Users size={16} />
                <h5>Średnia frekwencja</h5>
              </div>
              <div className="analytics-widget__metric-value">
                <strong>
                  {Math.round(
                    analyticsData.totalGuests / analyticsData.totalEvents
                  )}{' '}
                  os.
                </strong>
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
                <strong>{analyticsData.rsvpRate}%</strong>
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
                  width: `${(analyticsData.guestEngagement.confirmed / analyticsData.totalGuests) * 100}%`,
                }}
              />
              <div
                className="analytics-widget__response-fill analytics-widget__response-fill--pending"
                style={{
                  width: `${(analyticsData.guestEngagement.pending / analyticsData.totalGuests) * 100}%`,
                }}
              />
              <div
                className="analytics-widget__response-fill analytics-widget__response-fill--declined"
                style={{
                  width: `${(analyticsData.guestEngagement.declined / analyticsData.totalGuests) * 100}%`,
                }}
              />
            </div>
            <div className="analytics-widget__response-legend">
              <div className="analytics-widget__legend-item">
                <div className="analytics-widget__legend-dot analytics-widget__legend-dot--confirmed" />
                <span>
                  {Math.round(
                    (analyticsData.guestEngagement.confirmed /
                      analyticsData.totalGuests) *
                      100
                  )}
                  % Potwierdzone
                </span>
              </div>
              <div className="analytics-widget__legend-item">
                <div className="analytics-widget__legend-dot analytics-widget__legend-dot--pending" />
                <span>
                  {Math.round(
                    (analyticsData.guestEngagement.pending /
                      analyticsData.totalGuests) *
                      100
                  )}
                  % Oczekujące
                </span>
              </div>
              <div className="analytics-widget__legend-item">
                <div className="analytics-widget__legend-dot analytics-widget__legend-dot--declined" />
                <span>
                  {Math.round(
                    (analyticsData.guestEngagement.declined /
                      analyticsData.totalGuests) *
                      100
                  )}
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
