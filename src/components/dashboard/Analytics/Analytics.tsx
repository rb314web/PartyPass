// components/dashboard/Analytics/Analytics.tsx
import React, { useState, useEffect, useMemo, useCallback, Suspense, lazy } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  Calendar,
  Eye,
  AlertCircle,
  Download,
  RefreshCw,
} from 'lucide-react';
import {
  AnalyticsService,
  AnalyticsReport,
  buildAnalyticsDateRange,
} from '../../../services/firebase/analyticsService';
import { useAuth } from '../../../hooks/useAuth';
import type { AnalyticsFiltersData } from './AnalyticsFilters/AnalyticsFilters';
import { formatDurationHours, formatPolishCount } from '../../../utils/analyticsDisplay';
import ErrorBoundary from '../../common/ErrorBoundary/ErrorBoundary';
import { useDashboardViewMotion } from '../../../hooks/useDashboardViewMotion';
import DashboardViewSkeleton from '../DashboardViewSkeleton/DashboardViewSkeleton';
import DashboardViewBody from '../DashboardViewBody/DashboardViewBody';
import PageHeader from '../../common/PageHeader/PageHeader';
import EmptyState from '../../common/EmptyState/EmptyState';
import './Analytics.scss';

const TrendsChart = lazy(() => import('./TrendsChart/TrendsChart'));
const RankedBarList = lazy(() => import('./RankedBarList/RankedBarList'));
const WeekdayHeatmap = lazy(() => import('./WeekdayHeatmap/WeekdayHeatmap'));
const HourBucketChart = lazy(() => import('./HourBucketChart/HourBucketChart'));
const ResponsePaceCard = lazy(() => import('./ResponsePaceCard/ResponsePaceCard'));
const AnalyticsFilters = lazy(() => import('./AnalyticsFilters/AnalyticsFilters'));
const RealTimeWidget = lazy(() => import('./RealTimeWidget/RealTimeWidget'));

const AnalyticsChartFallback = () => (
  <div className="analytics__chart-lazy" role="status" aria-busy="true">
    Ładowanie wykresów…
  </div>
);

const DEFAULT_ADVANCED_FILTERS: AnalyticsFiltersData = {
  dateRange: { start: null, end: null },
  eventTypes: [],
  locations: [],
  guestCountRange: { min: 0, max: 1000 },
  status: [],
  searchQuery: '',
};

interface TimeRange {
  label: string;
  value: string;
  days: number;
}

const RSVP_GOAL_PERCENT = 85;

const RSVP_SEGMENT_COLORS = {
  confirmed: '#6db89a',
  pending: '#d9a066',
  declined: '#d97b7b',
  maybe: '#7b9ae8',
} as const;

const RSVP_SEGMENTS = [
  { key: 'confirmed' as const, label: 'Potwierdzone', color: RSVP_SEGMENT_COLORS.confirmed },
  { key: 'pending' as const, label: 'Oczekujące', color: RSVP_SEGMENT_COLORS.pending },
  { key: 'declined' as const, label: 'Odrzucone', color: RSVP_SEGMENT_COLORS.declined },
  { key: 'maybe' as const, label: 'Może', color: RSVP_SEGMENT_COLORS.maybe },
];

function polarToCartesian(
  cx: number,
  cy: number,
  radius: number,
  angleDeg: number
) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(angleRad),
    y: cy + radius * Math.sin(angleRad),
  };
}

function describeDonutSegment(
  cx: number,
  cy: number,
  innerRadius: number,
  outerRadius: number,
  startAngle: number,
  endAngle: number
) {
  const outerStart = polarToCartesian(cx, cy, outerRadius, startAngle);
  const outerEnd = polarToCartesian(cx, cy, outerRadius, endAngle);
  const innerStart = polarToCartesian(cx, cy, innerRadius, endAngle);
  const innerEnd = polarToCartesian(cx, cy, innerRadius, startAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerStart.x} ${innerStart.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${innerEnd.x} ${innerEnd.y}`,
    'Z',
  ].join(' ');
}

const TIME_RANGES: TimeRange[] = [
  { label: 'Ostatnie 7 dni', value: '7d', days: 7 },
  { label: 'Ostatnie 30 dni', value: '30d', days: 30 },
  { label: 'Ostatnie 90 dni', value: '90d', days: 90 },
  { label: 'Ostatni rok', value: '1y', days: 365 },
];

const Analytics: React.FC = () => {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState<string>('30d');
  const [advancedFilters, setAdvancedFilters] =
    useState<AnalyticsFiltersData>(DEFAULT_ADVANCED_FILTERS);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsReport | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const {
    isLoading: loading,
    showLoader,
    showContent,
    className: viewClassName,
    startLoading,
    finishLoading,
  } = useDashboardViewMotion({
    variant: 'async',
    pageClass: 'analytics',
  });

  const dateRange = useMemo(() => {
    const selectedRange = TIME_RANGES.find(r => r.value === timeRange);
    return buildAnalyticsDateRange(selectedRange?.days ?? 30);
  }, [timeRange]);

  const reportFilters = useMemo(() => {
    const pillRange = dateRange;
    const startDate = advancedFilters.dateRange.start
      ? (() => {
          const d = new Date(advancedFilters.dateRange.start);
          d.setHours(0, 0, 0, 0);
          return d;
        })()
      : pillRange.startDate;
    const endDate = advancedFilters.dateRange.end
      ? (() => {
          const d = new Date(advancedFilters.dateRange.end);
          d.setHours(23, 59, 59, 999);
          return d;
        })()
      : pillRange.endDate;

    return {
      startDate,
      endDate,
      eventTypes:
        advancedFilters.eventTypes.length > 0
          ? advancedFilters.eventTypes
          : undefined,
      locations:
        advancedFilters.locations.length > 0
          ? advancedFilters.locations
          : undefined,
      status:
        advancedFilters.status.length > 0 ? advancedFilters.status : undefined,
      searchQuery: debouncedSearch.trim() || undefined,
      guestCountMin:
        advancedFilters.guestCountRange.min > 0
          ? advancedFilters.guestCountRange.min
          : undefined,
      guestCountMax:
        advancedFilters.guestCountRange.max < 1000
          ? advancedFilters.guestCountRange.max
          : undefined,
    };
  }, [dateRange, advancedFilters, debouncedSearch]);

  useEffect(() => {
    const timer = window.setTimeout(
      () => setDebouncedSearch(advancedFilters.searchQuery),
      400
    );
    return () => window.clearTimeout(timer);
  }, [advancedFilters.searchQuery]);

  const activeRangeLabel =
    TIME_RANGES.find(r => r.value === timeRange)?.label ?? 'Ostatnie 30 dni';

  // Pobierz dane analityczne
  const loadAnalytics = useCallback(async () => {
    if (!user?.id) return;

    try {
      startLoading();
      setError(null);

      const report = await AnalyticsService.generateReport(user.id, reportFilters);

      setAnalyticsData(report);
      finishLoading();
    } catch (err: unknown) {
      console.error('Błąd podczas ładowania analityki:', err);
      setError('Nie udało się załadować danych analitycznych');
      finishLoading();
    }
  }, [user?.id, reportFilters, startLoading, finishLoading]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

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

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
    trend?: number;
    color?: string;
  }> = ({ title, value, subtitle, icon, trend, color = 'primary' }) => (
    <div className={`analytics__stat-card analytics__stat-card--${color}`}>
      <div className="analytics__stat-card-header">
        <div className="analytics__stat-icon">{icon}</div>
        <h3 className="analytics__stat-title">{title}</h3>
      </div>
      <div className="analytics__stat-value">{value}</div>
      {subtitle && <p className="analytics__stat-subtitle">{subtitle}</p>}
      {trend !== undefined && (
        <div
          className={`analytics__stat-trend analytics__stat-trend--${getGrowthColor(trend)}`}
        >
          {getGrowthIcon(trend)}
          <span>{Math.abs(trend)}%</span>
        </div>
      )}
    </div>
  );

  const ChartCard: React.FC<{
    title: string;
    children: React.ReactNode;
    actions?: React.ReactNode;
    className?: string;
  }> = ({ title, children, actions, className = '' }) => (
    <div className={`analytics__chart-card${className ? ` ${className}` : ''}`}>
      <div className="analytics__chart-header">
        <h3 className="analytics__chart-title">{title}</h3>
        {actions && <div className="analytics__chart-actions">{actions}</div>}
      </div>
      <div className="analytics__chart-content">{children}</div>
    </div>
  );

  const DonutChart: React.FC<{
    data: Array<{ label: string; value: number; color: string }>;
    size?: number;
  }> = ({ data, size = 168 }) => {
    const activeData = data.filter(item => item.value > 0);
    const total = data.reduce((sum, item) => sum + item.value, 0);
    const cx = size / 2;
    const cy = size / 2;
    const outerRadius = size * 0.46;
    const innerRadius = size * 0.3;
    const segmentGap = activeData.length > 1 ? 3 : 0;

    if (total === 0) {
      return (
        <div
          className="analytics__donut-chart analytics__donut-chart--empty"
          style={{ width: size, height: size }}
        >
          <div className="analytics__donut-center">
            <div className="analytics__donut-total">0</div>
            <div className="analytics__donut-label">Brak danych</div>
          </div>
        </div>
      );
    }

    let currentAngle = 0;

    return (
      <div
        className="analytics__donut-chart"
        style={{ width: size, height: size }}
        role="img"
        aria-label={`Status odpowiedzi gości, łącznie ${total}`}
      >
        <svg
          className="analytics__donut-svg"
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          aria-hidden
        >
          <circle
            className="analytics__donut-track"
            cx={cx}
            cy={cy}
            r={(innerRadius + outerRadius) / 2}
            fill="none"
            strokeWidth={outerRadius - innerRadius}
          />
          {activeData.length === 1 ? (
            <circle
              className="analytics__donut-segment"
              cx={cx}
              cy={cy}
              r={(innerRadius + outerRadius) / 2}
              fill="none"
              stroke={activeData[0].color}
              strokeWidth={outerRadius - innerRadius}
              strokeLinecap="round"
            />
          ) : (
            activeData.map((item, index) => {
              const share = item.value / total;
              const sweep = share * 360 - segmentGap;
              const startAngle = currentAngle + segmentGap / 2;
              const endAngle = startAngle + sweep;

              currentAngle += share * 360;

              return (
                <path
                  key={`${item.label}-${index}`}
                  className="analytics__donut-segment"
                  d={describeDonutSegment(
                    cx,
                    cy,
                    innerRadius,
                    outerRadius,
                    startAngle,
                    endAngle
                  )}
                  fill={item.color}
                />
              );
            })
          )}
        </svg>
        <div className="analytics__donut-center">
          <div className="analytics__donut-total">{total}</div>
          <div className="analytics__donut-label">Łącznie</div>
        </div>
      </div>
    );
  };
  const handleExport = () => {
    if (!analyticsData) return;
    const rangeLabel = TIME_RANGES.find(r => r.value === timeRange)?.label ?? 'raport';
    AnalyticsService.exportToCSV(
      analyticsData,
      `partypass-analytics-${rangeLabel.replace(/\s+/g, '-').toLowerCase()}`
    );
  };

  const eventTypeChartData = useMemo(() => {
    if (!analyticsData) return [];
    return analyticsData.popularEventTypes.map((type, index) => ({
      label: type.type,
      fullLabel: type.type,
      value: type.count,
      color: ['#7b9ae8', '#6db89a', '#d9a066', '#d97b7b', '#a78bfa'][index % 5],
    }));
  }, [analyticsData]);

  const locationChartData = useMemo(() => {
    if (!analyticsData) return [];
    return analyticsData.topLocations.slice(0, 5).map(location => ({
      label: location.location,
      fullLabel: location.locationFull,
      value: location.count,
      color: '#6db89a',
    }));
  }, [analyticsData]);

  const trendsSummary = useMemo(() => {
    if (!analyticsData?.monthlyTrends.length) return null;

    const trends = analyticsData.monthlyTrends;
    const totalEvents = trends.reduce((sum, item) => sum + item.events, 0);
    const totalGuests = trends.reduce((sum, item) => sum + item.guests, 0);
    const activeMonths = trends.filter(
      item => item.events > 0 || item.guests > 0
    ).length;
    const peakMonth = trends.reduce((best, item) =>
      item.events + item.guests > best.events + best.guests ? item : best
    );

    return {
      totalEvents,
      totalGuests,
      activeMonths,
      peakMonth,
    };
  }, [analyticsData]);

  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value);
    setAdvancedFilters(prev => ({
      ...prev,
      dateRange: { start: null, end: null },
    }));
  };

  const filterOptions = analyticsData?.filterOptions ?? {
    eventTypes: [],
    locations: [],
  };

  const hasDataInRange =
    analyticsData != null &&
    (analyticsData.totalEvents > 0 || analyticsData.totalGuests > 0);

  const engagementData = useMemo(() => {
    if (!analyticsData) return [];
    return RSVP_SEGMENTS.map(segment => ({
      label: segment.label,
      value: analyticsData.guestEngagement[segment.key],
      color: segment.color,
    }));
  }, [analyticsData]);

  const responsePaceMax = analyticsData
    ? Math.max(
        analyticsData.responseTimeAnalysis.fastResponders,
        analyticsData.responseTimeAnalysis.mediumResponders,
        analyticsData.responseTimeAnalysis.slowResponders,
        1
      )
    : 1;

  const rsvpGoalProgress = analyticsData
    ? Math.min(100, (analyticsData.rsvpRate / RSVP_GOAL_PERCENT) * 100)
    : 0;

  if (error && !loading) {
    return (
      <div className="analytics analytics--error">
        <div className="analytics__error">
          <AlertCircle size={32} />
          <h3>Błąd podczas ładowania danych</h3>
          <p>{error}</p>
          <button
            type="button"
            className="analytics__retry-btn"
            onClick={loadAnalytics}
          >
            <RefreshCw size={16} />
            Spróbuj ponownie
          </button>
        </div>
      </div>
    );
  }

  if (!loading && !analyticsData && !error) {
    return (
      <div className="analytics analytics--empty">
        <EmptyState
          icon={BarChart3}
          title="Brak danych analitycznych"
          description="Rozpocznij organizowanie wydarzeń, aby zobaczyć statystyki"
        />
      </div>
    );
  }
  return (
    <ErrorBoundary>
      <div className={viewClassName} id="analytics-dashboard">
      <PageHeader
        title="Analityka"
        subtitle={`Wydarzenia wg daty imprezy (${activeRangeLabel.toLowerCase()})`}
        icon={BarChart3}
        actions={
          <div className="analytics__header-actions">
            <div className="analytics__time-pills" role="group" aria-label="Zakres czasu">
              {TIME_RANGES.map(range => (
                <button
                  key={range.value}
                  type="button"
                  className={`analytics__time-pill${
                    timeRange === range.value ? ' analytics__time-pill--active' : ''
                  }`}
                  onClick={() => handleTimeRangeChange(range.value)}
                >
                  {range.label}
                </button>
              ))}
            </div>
            {analyticsData && (
              <button
                type="button"
                className="analytics__export-btn"
                onClick={handleExport}
              >
                <Download size={16} />
                Eksport CSV
              </button>
            )}
          </div>
        }
      />

      <Suspense fallback={<AnalyticsChartFallback />}>
        <AnalyticsFilters
          filters={advancedFilters}
          onFiltersChange={setAdvancedFilters}
          availableEventTypes={filterOptions.eventTypes}
          availableLocations={filterOptions.locations}
        />
      </Suspense>

      <DashboardViewBody
        showLoader={showLoader}
        showContent={showContent && !!analyticsData}
        loader={<DashboardViewSkeleton variant="analytics" />}
      >
      {analyticsData && (
        <>
      {!hasDataInRange && (
        <div className="analytics__range-empty">
          <BarChart3 size={28} />
          <p>
            Brak wydarzeń lub gości w wybranym zakresie czasu. Zmień filtr
            lub utwórz pierwsze wydarzenie.
          </p>
        </div>
      )}
      {/* Statystyki główne */}
      <div className="analytics__stats-grid">
        <StatCard
          title="Wydarzenia"
          value={analyticsData.totalEvents}
          subtitle="w wybranym zakresie dat"
          icon={<Calendar size={20} />}
          color="primary"
        />
        <StatCard
          title="Goście"
          value={analyticsData.totalGuests}
          icon={<Users size={20} />}
          color="success"
        />
        <StatCard
          title="Średnia na wydarzenie"
          value={analyticsData.averageGuestsPerEvent.toFixed(1)}
          icon={<Users size={20} />}
          color="info"
        />
        <StatCard
          title="Wskaźnik RSVP"
          value={`${Math.round(analyticsData.rsvpRate)}%`}
          subtitle="odpowiedzi od zaproszonych"
          icon={<Eye size={20} />}
          color="warning"
        />
      </div>

      <div className="analytics__highlight-row">
        <div className="analytics__rsvp-health-card">
          <div className="analytics__rsvp-health-header">
            <div>
              <span className="analytics__rsvp-health-eyebrow">
                Skuteczność zaproszeń
              </span>
              <h3>Jak reagują goście</h3>
            </div>
            <div
              className={`analytics__rsvp-health-badge analytics__rsvp-health-badge--${
                analyticsData.rsvpRate >= RSVP_GOAL_PERCENT
                  ? 'success'
                  : analyticsData.rsvpRate >= 50
                    ? 'warning'
                    : 'neutral'
              }`}
            >
              Cel {RSVP_GOAL_PERCENT}%
            </div>
          </div>

          <div className="analytics__rsvp-health-hero">
            <div className="analytics__rsvp-health-rate">
              <span className="analytics__rsvp-health-value">
                {Math.round(analyticsData.rsvpRate)}%
              </span>
              <span className="analytics__rsvp-health-caption">
                wskaźnik odpowiedzi
              </span>
            </div>
            <div className="analytics__rsvp-health-goal">
              <div className="analytics__rsvp-health-goal-track">
                <div
                  className="analytics__rsvp-health-goal-fill"
                  style={{ width: `${rsvpGoalProgress}%` }}
                />
                <div
                  className="analytics__rsvp-health-goal-marker"
                  style={{ left: '100%' }}
                  title={`Cel ${RSVP_GOAL_PERCENT}%`}
                />
              </div>
              <div className="analytics__rsvp-health-goal-labels">
                <span>0%</span>
                <span>{RSVP_GOAL_PERCENT}% cel</span>
              </div>
            </div>
          </div>

          <div className="analytics__rsvp-health-pace">
            <p className="analytics__rsvp-health-pace-title">Tempo odpowiedzi</p>
            {[
              {
                label: 'Szybkie',
                hint: '< 24 h',
                value: analyticsData.responseTimeAnalysis.fastResponders,
                tone: 'fast',
              },
              {
                label: 'Średnie',
                hint: '1–7 dni',
                value: analyticsData.responseTimeAnalysis.mediumResponders,
                tone: 'medium',
              },
              {
                label: 'Powolne',
                hint: '> 7 dni',
                value: analyticsData.responseTimeAnalysis.slowResponders,
                tone: 'slow',
              },
            ].map(row => (
              <div key={row.tone} className="analytics__rsvp-health-pace-row">
                <div className="analytics__rsvp-health-pace-label">
                  <span>{row.label}</span>
                  <small>{row.hint}</small>
                </div>
                <div className="analytics__rsvp-health-pace-track">
                  <div
                    className={`analytics__rsvp-health-pace-fill analytics__rsvp-health-pace-fill--${row.tone}`}
                    style={{
                      width: `${(row.value / responsePaceMax) * 100}%`,
                    }}
                  />
                </div>
                <strong>{row.value}</strong>
              </div>
            ))}
          </div>

          <p className="analytics__rsvp-health-footer">
            {analyticsData.guestEngagement.pending > 0 ? (
              <>
                <strong>{analyticsData.guestEngagement.pending}</strong>{' '}
                {analyticsData.guestEngagement.pending === 1
                  ? 'gość czeka'
                  : 'gości czeka'}{' '}
                na odpowiedź
                {analyticsData.responseTimeAnalysis.averageResponseTime > 0 && (
                  <>
                    {' '}
                    · średnio{' '}
                    <strong>
                      {formatDurationHours(
                        analyticsData.responseTimeAnalysis.averageResponseTime
                      )}
                    </strong>
                  </>
                )}
              </>
            ) : analyticsData.totalGuests > 0 ? (
              <>
                Wszyscy goście odpowiedzieli
                {analyticsData.responseTimeAnalysis.averageResponseTime > 0 && (
                  <>
                    {' '}
                    · średnio{' '}
                    <strong>
                      {formatDurationHours(
                        analyticsData.responseTimeAnalysis.averageResponseTime
                      )}
                    </strong>
                  </>
                )}
              </>
            ) : (
              'Brak gości w wybranym okresie'
            )}
          </p>
        </div>

        <ChartCard title="Status odpowiedzi gości" className="analytics__chart-card--rsvp-status">
          <div className="analytics__engagement-chart">
            <DonutChart data={engagementData} size={152} />
            <div className="analytics__engagement-legend">
              {engagementData.map((item, index) => {
                const share =
                  analyticsData.totalGuests > 0
                    ? Math.round((item.value / analyticsData.totalGuests) * 100)
                    : 0;
                return (
                  <div key={index} className="analytics__legend-item">
                    <div
                      className="analytics__legend-color"
                      style={{ backgroundColor: item.color }}
                    />
                    <div className="analytics__legend-copy">
                      <span className="analytics__legend-label">{item.label}</span>
                      <span className="analytics__legend-meta">
                        {item.value} · {share}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </ChartCard>
      </div>

      <section className="analytics__section analytics__section--trends">
        <h2 className="analytics__section-title">Trendy w czasie</h2>
        <ChartCard title="Ostatnie 6 miesięcy · wg daty imprezy">
          <div className="analytics__trends-panel">
            <div className="analytics__trends-chart">
              <Suspense fallback={<AnalyticsChartFallback />}>
                <TrendsChart data={analyticsData.monthlyTrends} />
              </Suspense>
            </div>

            {trendsSummary && (
              <div
                className="analytics__trends-summary"
                aria-label="Podsumowanie trendów"
              >
                <div className="analytics__trends-summary-grid">
                  <div className="analytics__trends-stat">
                    <strong>{trendsSummary.totalEvents}</strong>
                    <span>Wydarzenia</span>
                  </div>
                  <div className="analytics__trends-stat">
                    <strong>{trendsSummary.totalGuests}</strong>
                    <span>Goście</span>
                  </div>
                  <div className="analytics__trends-stat">
                    <strong>{trendsSummary.activeMonths}/6</strong>
                    <span>Aktywne mies.</span>
                  </div>
                </div>

                {(trendsSummary.peakMonth.events > 0 ||
                  trendsSummary.peakMonth.guests > 0) && (
                  <div className="analytics__trends-highlight">
                    <span className="analytics__trends-highlight-label">
                      Najlepszy miesiąc
                    </span>
                    <div className="analytics__trends-highlight-body">
                      <strong>{trendsSummary.peakMonth.month}</strong>
                      <p>
                        {formatPolishCount(trendsSummary.peakMonth.events, [
                          'wydarzenie',
                          'wydarzenia',
                          'wydarzeń',
                        ])}{' '}
                        ·{' '}
                        {formatPolishCount(trendsSummary.peakMonth.guests, [
                          'gość',
                          'goście',
                          'gości',
                        ])}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </ChartCard>
      </section>

      <section className="analytics__section analytics__section--distribution">
        <h2 className="analytics__section-title">Rozkład i kategorie</h2>
        <div className="analytics__charts-grid">
          <ChartCard title="Typy wydarzeń">
            <Suspense fallback={<AnalyticsChartFallback />}>
              <RankedBarList
                items={eventTypeChartData}
                emptyMessage="Brak wydarzeń w wybranym okresie"
              />
            </Suspense>
          </ChartCard>
          <ChartCard title="Najczęstsze lokalizacje">
            <Suspense fallback={<AnalyticsChartFallback />}>
              <RankedBarList
                items={locationChartData}
                emptyMessage="Brak lokalizacji w wybranym okresie"
              />
            </Suspense>
            {locationChartData.length > 0 && (
              <p className="analytics__chart-footnote">
                Najedź na nazwę, aby zobaczyć pełny adres.
              </p>
            )}
          </ChartCard>
        </div>
      </section>

      <section className="analytics__section analytics__detailed-section">
        <h2 className="analytics__section-title">Szczegółowe analizy</h2>
        <div className="analytics__detailed-grid">
          <ChartCard title="Dni tygodnia">
            <Suspense fallback={<AnalyticsChartFallback />}>
              <WeekdayHeatmap data={analyticsData.weekdayDistribution} />
            </Suspense>
          </ChartCard>
          <ChartCard title="Pory dnia">
            <Suspense fallback={<AnalyticsChartFallback />}>
              <HourBucketChart distribution={analyticsData.timeDistribution} />
            </Suspense>
          </ChartCard>
          <ChartCard title="Czas odpowiedzi gości">
            <Suspense fallback={<AnalyticsChartFallback />}>
              <ResponsePaceCard
                fast={analyticsData.responseTimeAnalysis.fastResponders}
                medium={analyticsData.responseTimeAnalysis.mediumResponders}
                slow={analyticsData.responseTimeAnalysis.slowResponders}
                averageHours={
                  analyticsData.responseTimeAnalysis.averageResponseTime
                }
                trackedResponses={
                  analyticsData.responseTimeAnalysis.trackedResponses
                }
                totalResponded={
                  analyticsData.guestEngagement.confirmed +
                  analyticsData.guestEngagement.declined +
                  analyticsData.guestEngagement.maybe
                }
              />
            </Suspense>
          </ChartCard>
        </div>
      </section>

      <section className="analytics__section analytics__section--activity">
        <ChartCard title="Aktywność (24 h)">
          <Suspense fallback={<AnalyticsChartFallback />}>
            <RealTimeWidget embedded />
          </Suspense>
        </ChartCard>
      </section>
        </>
      )}
      </DashboardViewBody>
    </div>
    </ErrorBoundary>
  );
};

export default Analytics;
