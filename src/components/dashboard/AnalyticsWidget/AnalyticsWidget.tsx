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
  Target
} from 'lucide-react';
import { AnalyticsService, AnalyticsReport } from '../../../services/firebase/analyticsService';
import { useAuth } from '../../../hooks/useAuth';
import './AnalyticsWidget.scss';

const AnalyticsWidget: React.FC = () => {
  const { user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsReport | null>(null);
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
          endDate
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
    if (rate < 0) return <TrendingUp size={16} style={{ transform: 'rotate(180deg)' }} />;
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
          <h3>Analityka - Ostatnie 30 dni</h3>
        </div>
        <Link to="/dashboard/analytics" className="analytics-widget__link">
          <ArrowRight size={16} />
        </Link>
      </div>

      <div className="analytics-widget__content">
        {/* Quick Stats */}
        <div className="analytics-widget__stats">
          <div className="analytics-widget__stat">
            <div className="analytics-widget__stat-icon analytics-widget__stat-icon--events">
              <Calendar size={16} />
            </div>
            <div className="analytics-widget__stat-content">
              <span className="analytics-widget__stat-value">{analyticsData.totalEvents}</span>
              <span className="analytics-widget__stat-label">Wydarzenia</span>
            </div>
          </div>

          <div className="analytics-widget__stat">
            <div className="analytics-widget__stat-icon analytics-widget__stat-icon--guests">
              <Users size={16} />
            </div>
            <div className="analytics-widget__stat-content">
              <span className="analytics-widget__stat-value">{analyticsData.totalGuests}</span>
              <span className="analytics-widget__stat-label">Goście</span>
            </div>
          </div>

          <div className="analytics-widget__stat">
            <div className="analytics-widget__stat-icon analytics-widget__stat-icon--rsvp">
              <Eye size={16} />
            </div>
            <div className="analytics-widget__stat-content">
              <span className="analytics-widget__stat-value">{analyticsData.rsvpRate}%</span>
              <span className="analytics-widget__stat-label">RSVP</span>
            </div>
          </div>
        </div>

        {/* Growth Indicator */}
        <div className="analytics-widget__growth">
          <div className="analytics-widget__growth-label">Wzrost w tym miesiącu</div>
          <div className={`analytics-widget__growth-value analytics-widget__growth-value--${getGrowthColor(analyticsData.growthRate)}`}>
            {getGrowthIcon(analyticsData.growthRate)}
            <span>{Math.abs(analyticsData.growthRate)}%</span>
          </div>
        </div>

        {/* Top Event Types */}
        {analyticsData.popularEventTypes.length > 0 && (
          <div className="analytics-widget__chart">
            <h4>Popularne typy wydarzeń</h4>
            <div className="analytics-widget__chart-bars">
              {analyticsData.popularEventTypes.slice(0, 3).map((type, index) => (
                <div key={index} className="analytics-widget__chart-bar">
                  <div className="analytics-widget__chart-bar-label">{type.type}</div>
                  <div className="analytics-widget__chart-bar-container">
                    <div 
                      className="analytics-widget__chart-bar-fill"
                      style={{ 
                        width: `${type.percentage}%`,
                        backgroundColor: `hsl(${220 + index * 30}, 70%, 50%)`
                      }}
                    />
                  </div>
                  <div className="analytics-widget__chart-bar-value">{type.count}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Guest Engagement */}
        <div className="analytics-widget__engagement">
          <h4>Status odpowiedzi gości</h4>
          <div className="analytics-widget__engagement-stats">
            <div className="analytics-widget__engagement-stat">
              <div className="analytics-widget__engagement-dot analytics-widget__engagement-dot--confirmed" />
              <span>Potwierdzone: {analyticsData.guestEngagement.confirmed}</span>
            </div>
            <div className="analytics-widget__engagement-stat">
              <div className="analytics-widget__engagement-dot analytics-widget__engagement-dot--pending" />
              <span>Oczekujące: {analyticsData.guestEngagement.pending}</span>
            </div>
            <div className="analytics-widget__engagement-stat">
              <div className="analytics-widget__engagement-dot analytics-widget__engagement-dot--declined" />
              <span>Odrzucone: {analyticsData.guestEngagement.declined}</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="analytics-widget__action">
          <Link to="/dashboard/analytics" className="analytics-widget__view-all">
            <Activity size={16} />
            Zobacz pełną analitykę
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsWidget;
