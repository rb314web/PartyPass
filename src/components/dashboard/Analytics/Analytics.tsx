// components/dashboard/Analytics/Analytics.tsx
import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar,
  Download,
  Filter,
  Eye,
  Share2,
  Mail,
  Smartphone,
  Monitor,
  Square
} from 'lucide-react';
import './Analytics.scss';

interface AnalyticsData {
  totalEvents: number;
  totalGuests: number;
  averageGuestsPerEvent: number;
  rsvpRate: number;
  eventsThisMonth: number;
  eventsLastMonth: number;
  growthRate: number;
  topEventTypes: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
  monthlyStats: Array<{
    month: string;
    events: number;
    guests: number;
  }>;
  guestEngagement: {
    confirmed: number;
    pending: number;
    declined: number;
    maybe: number;
  };
  deviceUsage: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
}

const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedMetric, setSelectedMetric] = useState<'events' | 'guests' | 'engagement'>('events');

  // Mock data - w przyszłości będzie z API
  const analyticsData: AnalyticsData = {
    totalEvents: 24,
    totalGuests: 342,
    averageGuestsPerEvent: 14.25,
    rsvpRate: 78.5,
    eventsThisMonth: 8,
    eventsLastMonth: 6,
    growthRate: 33.3,
    topEventTypes: [
      { type: 'Urodziny', count: 12, percentage: 50 },
      { type: 'Spotkania firmowe', count: 6, percentage: 25 },
      { type: 'Wesele', count: 3, percentage: 12.5 },
      { type: 'Inne', count: 3, percentage: 12.5 }
    ],
    monthlyStats: [
      { month: 'Sty', events: 4, guests: 56 },
      { month: 'Lut', events: 6, guests: 78 },
      { month: 'Mar', events: 8, guests: 112 },
      { month: 'Kwi', events: 6, guests: 96 }
    ],
    guestEngagement: {
      confirmed: 268,
      pending: 45,
      declined: 18,
      maybe: 11
    },
    deviceUsage: {
      desktop: 65,
      mobile: 30,
      tablet: 5
    }
  };

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

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
    trend?: number;
    color?: string;
  }> = ({ title, value, subtitle, icon, trend, color = 'primary' }) => (
    <div className={`analytics__stat-card analytics__stat-card--${color}`}>
      <div className="analytics__stat-icon">
        {icon}
      </div>
      <div className="analytics__stat-content">
        <h3 className="analytics__stat-title">{title}</h3>
        <div className="analytics__stat-value">{value}</div>
        {subtitle && <p className="analytics__stat-subtitle">{subtitle}</p>}
        {trend !== undefined && (
          <div className={`analytics__stat-trend analytics__stat-trend--${getGrowthColor(trend)}`}>
            {getGrowthIcon(trend)}
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
    </div>
  );

  const ChartCard: React.FC<{
    title: string;
    children: React.ReactNode;
    actions?: React.ReactNode;
  }> = ({ title, children, actions }) => (
    <div className="analytics__chart-card">
      <div className="analytics__chart-header">
        <h3 className="analytics__chart-title">{title}</h3>
        {actions && <div className="analytics__chart-actions">{actions}</div>}
      </div>
      <div className="analytics__chart-content">
        {children}
      </div>
    </div>
  );

  const SimpleBarChart: React.FC<{
    data: Array<{ label: string; value: number; color?: string }>;
    height?: number;
  }> = ({ data, height = 200 }) => {
    const maxValue = Math.max(...data.map(d => d.value));
    
    return (
      <div className="analytics__bar-chart" style={{ height }}>
        {data.map((item, index) => (
          <div key={index} className="analytics__bar-item">
            <div className="analytics__bar-label">{item.label}</div>
            <div className="analytics__bar-container">
              <div 
                className="analytics__bar"
                style={{ 
                  width: `${(item.value / maxValue) * 100}%`,
                  backgroundColor: item.color || 'var(--primary-500)'
                }}
              />
            </div>
            <div className="analytics__bar-value">{item.value}</div>
          </div>
        ))}
      </div>
    );
  };

  const DonutChart: React.FC<{
    data: Array<{ label: string; value: number; color: string }>;
    size?: number;
  }> = ({ data, size = 120 }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = 0;
    
    return (
      <div className="analytics__donut-chart" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {data.map((item, index) => {
            const percentage = (item.value / total) * 100;
            const angle = (percentage / 100) * 360;
            const radius = size / 2 - 10;
            const x1 = size / 2 + radius * Math.cos((currentAngle * Math.PI) / 180);
            const y1 = size / 2 + radius * Math.sin((currentAngle * Math.PI) / 180);
            const x2 = size / 2 + radius * Math.cos(((currentAngle + angle) * Math.PI) / 180);
            const y2 = size / 2 + radius * Math.sin(((currentAngle + angle) * Math.PI) / 180);
            
            const largeArcFlag = angle > 180 ? 1 : 0;
            
            const pathData = [
              `M ${size / 2} ${size / 2}`,
              `L ${x1} ${y1}`,
              `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              'Z'
            ].join(' ');
            
            currentAngle += angle;
            
            return (
              <path
                key={index}
                d={pathData}
                fill={item.color}
                stroke="white"
                strokeWidth="2"
              />
            );
          })}
        </svg>
        <div className="analytics__donut-center">
          <div className="analytics__donut-total">{total}</div>
          <div className="analytics__donut-label">Łącznie</div>
        </div>
      </div>
    );
  };

  return (
    <div className="analytics">
      <div className="analytics__header">
        <div className="analytics__title">
          <BarChart3 size={32} />
          <div>
            <h1>Analityka</h1>
            <p>Poznaj statystyki swoich wydarzeń i gości</p>
          </div>
        </div>
        
        <div className="analytics__controls">
          <div className="analytics__time-range">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="analytics__select"
            >
              <option value="7d">Ostatnie 7 dni</option>
              <option value="30d">Ostatnie 30 dni</option>
              <option value="90d">Ostatnie 90 dni</option>
              <option value="1y">Ostatni rok</option>
            </select>
          </div>
          
          <button className="analytics__export-btn">
            <Download size={20} />
            Eksportuj
          </button>
        </div>
      </div>

      {/* Statystyki główne */}
      <div className="analytics__stats-grid">
        <StatCard
          title="Łącznie wydarzeń"
          value={analyticsData.totalEvents}
          icon={<Calendar size={24} />}
          color="primary"
        />
        <StatCard
          title="Łącznie gości"
          value={analyticsData.totalGuests}
          icon={<Users size={24} />}
          color="success"
        />
        <StatCard
          title="Średnio gości/wydarzenie"
          value={analyticsData.averageGuestsPerEvent.toFixed(1)}
          icon={<Users size={24} />}
          color="info"
        />
        <StatCard
          title="Wskaźnik RSVP"
          value={`${analyticsData.rsvpRate}%`}
          subtitle="Potwierdzone odpowiedzi"
          icon={<Eye size={24} />}
          color="warning"
        />
      </div>

      {/* Wzrost */}
      <div className="analytics__growth-card">
        <div className="analytics__growth-header">
          <h3>Wzrost w tym miesiącu</h3>
          <div className={`analytics__growth-rate analytics__growth-rate--${getGrowthColor(analyticsData.growthRate)}`}>
            {getGrowthIcon(analyticsData.growthRate)}
            <span>{analyticsData.growthRate}%</span>
          </div>
        </div>
        <div className="analytics__growth-details">
          <div className="analytics__growth-item">
            <span>Ten miesiąc:</span>
            <strong>{analyticsData.eventsThisMonth} wydarzeń</strong>
          </div>
          <div className="analytics__growth-item">
            <span>Poprzedni miesiąc:</span>
            <strong>{analyticsData.eventsLastMonth} wydarzeń</strong>
          </div>
        </div>
      </div>

      {/* Wykresy */}
      <div className="analytics__charts-grid">
        <ChartCard 
          title="Typy wydarzeń"
          actions={
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value as any)}
              className="analytics__metric-select"
            >
              <option value="events">Wydarzenia</option>
              <option value="guests">Goście</option>
              <option value="engagement">Zaangażowanie</option>
            </select>
          }
        >
          <SimpleBarChart
            data={analyticsData.topEventTypes.map(type => ({
              label: type.type,
              value: type.count,
              color: 'var(--primary-500)'
            }))}
          />
        </ChartCard>

        <ChartCard title="Status odpowiedzi gości">
          <div className="analytics__engagement-chart">
            <DonutChart
              data={[
                { label: 'Potwierdzone', value: analyticsData.guestEngagement.confirmed, color: 'var(--success-500)' },
                { label: 'Oczekujące', value: analyticsData.guestEngagement.pending, color: 'var(--warning-500)' },
                { label: 'Odrzucone', value: analyticsData.guestEngagement.declined, color: 'var(--error-500)' },
                { label: 'Może', value: analyticsData.guestEngagement.maybe, color: 'var(--info-500)' }
              ]}
            />
            <div className="analytics__engagement-legend">
              {[
                { label: 'Potwierdzone', value: analyticsData.guestEngagement.confirmed, color: 'var(--success-500)' },
                { label: 'Oczekujące', value: analyticsData.guestEngagement.pending, color: 'var(--warning-500)' },
                { label: 'Odrzucone', value: analyticsData.guestEngagement.declined, color: 'var(--error-500)' },
                { label: 'Może', value: analyticsData.guestEngagement.maybe, color: 'var(--info-500)' }
              ].map((item, index) => (
                <div key={index} className="analytics__legend-item">
                  <div 
                    className="analytics__legend-color" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="analytics__legend-label">{item.label}</span>
                  <span className="analytics__legend-value">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>

        <ChartCard title="Użycie urządzeń">
          <div className="analytics__device-chart">
            <DonutChart
              data={[
                { label: 'Desktop', value: analyticsData.deviceUsage.desktop, color: 'var(--primary-500)' },
                { label: 'Mobile', value: analyticsData.deviceUsage.mobile, color: 'var(--success-500)' },
                { label: 'Tablet', value: analyticsData.deviceUsage.tablet, color: 'var(--warning-500)' }
              ]}
            />
            <div className="analytics__device-legend">
              <div className="analytics__device-item">
                <Monitor size={16} />
                <span>Desktop: {analyticsData.deviceUsage.desktop}%</span>
              </div>
              <div className="analytics__device-item">
                <Smartphone size={16} />
                <span>Mobile: {analyticsData.deviceUsage.mobile}%</span>
              </div>
              <div className="analytics__device-item">
                <Square size={16} />
                <span>Tablet: {analyticsData.deviceUsage.tablet}%</span>
              </div>
            </div>
          </div>
        </ChartCard>

        <ChartCard title="Statystyki miesięczne">
          <SimpleBarChart
            data={analyticsData.monthlyStats.map(stat => ({
              label: stat.month,
              value: stat.events,
              color: 'var(--primary-500)'
            }))}
          />
        </ChartCard>
      </div>
    </div>
  );
};

export default Analytics;
