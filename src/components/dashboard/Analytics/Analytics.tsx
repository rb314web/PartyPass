// components/dashboard/Analytics/Analytics.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar,
  Download,
  Eye,
  Clock,
  Target,
  Zap,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { AnalyticsService, AnalyticsReport } from '../../../services/firebase/analyticsService';
import AnalyticsExportService from '../../../services/firebase/analyticsExportService';
import { useAuth } from '../../../hooks/useAuth';
import RealTimeWidget from './RealTimeWidget/RealTimeWidget';
import NotificationsWidget from './NotificationsWidget/NotificationsWidget';
import LineChart from './LineChart/LineChart';
import AnalyticsFilters, { AnalyticsFiltersData } from './AnalyticsFilters/AnalyticsFilters';
import './Analytics.scss';

interface TimeRange {
  label: string;
  value: string;
  days: number;
}

const TIME_RANGES: TimeRange[] = [
  { label: 'Ostatnie 7 dni', value: '7d', days: 7 },
  { label: 'Ostatnie 30 dni', value: '30d', days: 30 },
  { label: 'Ostatnie 90 dni', value: '90d', days: 90 },
  { label: 'Ostatni rok', value: '1y', days: 365 }
];

const Analytics: React.FC = () => {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState<string>('30d');
  const [selectedMetric, setSelectedMetric] = useState<'events' | 'guests' | 'engagement'>('events');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  
  // Filters state
  const [filters, setFilters] = useState<AnalyticsFiltersData>({
    dateRange: { start: null, end: null },
    eventTypes: [],
    locations: [],
    guestCountRange: { min: 0, max: 1000 },
    status: [],
    searchQuery: ''
  });

  // Oblicz daty na podstawie wybranego zakresu
  const dateRange = useMemo(() => {
    const selectedRange = TIME_RANGES.find(r => r.value === timeRange);
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (selectedRange?.days || 30));
    
    return { startDate, endDate };
  }, [timeRange]);

  // Pobierz dane analityczne
  useEffect(() => {
    if (!user?.id) return;

    const loadAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const report = await AnalyticsService.generateReport(user.id, {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        });
        
        setAnalyticsData(report);
      } catch (err: any) {
        console.error('Błąd podczas ładowania analityki:', err);
        setError('Nie udało się załadować danych analitycznych');
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [user?.id, dateRange]);  // Eksport danych
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Click outside handler for export dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.analytics__export-dropdown')) {
        setShowExportMenu(false);
      }
    };

    if (showExportMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showExportMenu]);

  const handleExport = async (type: 'csv' | 'pdf' | 'html' = 'csv') => {
    if (!analyticsData || !user?.id) return;
    
    try {
      setIsExporting(true);
      
      switch (type) {
        case 'csv':
          await AnalyticsExportService.exportToCSV(analyticsData, filters);
          break;
          
        case 'pdf':
          await AnalyticsExportService.exportToPDF('analytics-dashboard', 
            `analytics-report-${timeRange}-${new Date().toISOString().split('T')[0]}.pdf`);
          break;
          
        case 'html':
          await AnalyticsExportService.exportToHTML(analyticsData, 'analytics-dashboard');
          break;
          
        default:
          await AnalyticsExportService.exportToCSV(analyticsData, filters);
      }
      
      setShowExportMenu(false);
    } catch (err: any) {
      console.error('Błąd podczas eksportu:', err);
      alert(err.message || 'Nie udało się wyeksportować danych');
    } finally {
      setIsExporting(false);
    }
  };

  // Odświeżenie danych
  const handleRefresh = () => {
    if (user?.id) {
      const event = new CustomEvent('refreshAnalytics');
      window.dispatchEvent(event);
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
  if (loading) {
    return (
      <div className="analytics analytics--loading">
        <div className="analytics__loader">
          <RefreshCw className="analytics__spinner" size={32} />
          <p>Ładowanie analityki...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics analytics--error">
        <div className="analytics__error">
          <AlertCircle size={32} />
          <h3>Błąd podczas ładowania danych</h3>
          <p>{error}</p>
          <button 
            onClick={handleRefresh}
            className="analytics__retry-btn"
          >
            <RefreshCw size={20} />
            Spróbuj ponownie
          </button>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="analytics analytics--empty">
        <div className="analytics__empty">
          <BarChart3 size={48} />
          <h3>Brak danych analitycznych</h3>
          <p>Rozpocznij organizowanie wydarzeń, aby zobaczyć statystyki</p>
        </div>
      </div>
    );
  }
  return (
    <div className="analytics" id="analytics-dashboard">
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
              onChange={(e) => setTimeRange(e.target.value)}
              className="analytics__select"
            >
              {TIME_RANGES.map(range => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>
            <div className="analytics__export-dropdown">
            <button 
              className="analytics__export-btn"
              onClick={() => setShowExportMenu(!showExportMenu)}
              disabled={isExporting}
            >
              {isExporting ? <RefreshCw className="analytics__spinner" size={20} /> : <Download size={20} />}
              {isExporting ? 'Eksportowanie...' : 'Eksportuj'}
              <svg width="12" height="12" viewBox="0 0 12 12" className="analytics__dropdown-arrow">
                <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              </svg>
            </button>
            
            {showExportMenu && (
              <div className="analytics__export-menu">
                <button onClick={() => handleExport('csv')} className="analytics__export-option">
                  <span>📊</span>
                  <div>
                    <strong>CSV</strong>
                    <small>Dane tabelaryczne</small>
                  </div>
                </button>
                <button onClick={() => handleExport('pdf')} className="analytics__export-option">
                  <span>📄</span>
                  <div>
                    <strong>PDF</strong>
                    <small>Pełny raport</small>
                  </div>
                </button>
                <button onClick={() => handleExport('html')} className="analytics__export-option">
                  <span>🌐</span>
                  <div>
                    <strong>HTML</strong>
                    <small>Interaktywny raport</small>
                  </div>
                </button>
              </div>
            )}
          </div>

          <button 
            className="analytics__refresh-btn"
            onClick={handleRefresh}
            title="Odśwież dane"
          >
            <RefreshCw size={20} />
          </button>        </div>
      </div>

      {/* Analytics Filters */}
      <AnalyticsFilters
        filters={filters}
        onFiltersChange={setFilters}
        availableEventTypes={analyticsData.popularEventTypes.map((type: any) => type.type)}
        availableLocations={analyticsData.topLocations.map((location: any) => location.location)}
      />

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

      {/* Real-time Analytics */}
      <div className="analytics__realtime-section">
        <RealTimeWidget />
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
          title="Popularne typy wydarzeń"
          actions={
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value as 'events' | 'guests' | 'engagement')}
              className="analytics__metric-select"
            >
              <option value="events">Wydarzenia</option>
              <option value="guests">Goście</option>
              <option value="engagement">Zaangażowanie</option>
            </select>
          }
        >
          <SimpleBarChart
            data={analyticsData.popularEventTypes.map((type: any) => ({
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
        </ChartCard>        <ChartCard title="Trendy miesięczne">
          <SimpleBarChart
            data={analyticsData.monthlyTrends.map((stat: any) => ({
              label: stat.month,
              value: stat.events,
              color: 'var(--primary-500)'
            }))}
          />
        </ChartCard>

        <ChartCard title="Wzrost liczby wydarzeń w czasie">
          <LineChart
            data={analyticsData.monthlyTrends.map((stat: any, index: number) => ({
              date: stat.month,
              value: stat.events,
              label: `${stat.events} wydarzeń`
            }))}
            title="Wydarzenia"
            color="var(--primary-500)"
            height={220}
          />
        </ChartCard>

        <ChartCard title="Popularność gości w czasie">
          <LineChart
            data={analyticsData.monthlyTrends.map((stat: any, index: number) => ({
              date: stat.month,
              value: stat.guests || Math.floor(stat.events * 8.5), // Estimate guests if not available
              label: `${stat.guests || Math.floor(stat.events * 8.5)} gości`
            }))}
            title="Goście"
            color="var(--success-500)"
            height={220}
          />
        </ChartCard>

        <ChartCard title="Popularne lokalizacje">
          <SimpleBarChart
            data={analyticsData.topLocations.slice(0, 5).map((location: any) => ({
              label: location.location,
              value: location.count,
              color: 'var(--success-500)'
            }))}
          />
        </ChartCard>
      </div>      {/* Szczegółowe analizy */}
      <div className="analytics__detailed-section">
        <h2>Szczegółowe analizy</h2>
        
        <div className="analytics__detailed-grid">
          <ChartCard title="Rozkład dni tygodnia">
            <SimpleBarChart
              data={analyticsData.weekdayDistribution.map((day: any) => ({
                label: day.day,
                value: day.count,
                color: 'var(--warning-500)'
              }))}
            />
          </ChartCard>

          <ChartCard title="Rozkład godzin wydarzeń">
            <SimpleBarChart
              data={analyticsData.timeDistribution.slice(8, 24).map((hour: any) => ({
                label: `${hour.hour}:00`,
                value: hour.count,
                color: 'var(--info-500)'
              }))}
              height={150}
            />
          </ChartCard>

          <div className="analytics__response-time-card">
            <h3>Analiza czasu odpowiedzi</h3>
            <div className="analytics__response-stats">
              <div className="analytics__response-stat">
                <Zap size={20} />
                <div>
                  <span className="analytics__response-label">Szybkie odpowiedzi</span>
                  <span className="analytics__response-value">{analyticsData.responseTimeAnalysis.fastResponders}</span>
                  <span className="analytics__response-subtitle">{'< 24h'}</span>
                </div>
              </div>
              <div className="analytics__response-stat">
                <Clock size={20} />
                <div>
                  <span className="analytics__response-label">Średnie odpowiedzi</span>
                  <span className="analytics__response-value">{analyticsData.responseTimeAnalysis.mediumResponders}</span>
                  <span className="analytics__response-subtitle">24h - 7 dni</span>
                </div>
              </div>
              <div className="analytics__response-stat">
                <Target size={20} />
                <div>
                  <span className="analytics__response-label">Powolne odpowiedzi</span>
                  <span className="analytics__response-value">{analyticsData.responseTimeAnalysis.slowResponders}</span>
                  <span className="analytics__response-subtitle">{'> 7 dni'}</span>
                </div>
              </div>
            </div>
            <div className="analytics__avg-response">
              <strong>Średni czas odpowiedzi: {analyticsData.responseTimeAnalysis.averageResponseTime.toFixed(1)} godzin</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Notifications */}
      <div className="analytics__notifications-section">
        <NotificationsWidget />
      </div>
    </div>
  );
};

export default Analytics;
