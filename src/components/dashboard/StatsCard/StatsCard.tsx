// components/dashboard/StatsCard/StatsCard.tsx
import React from 'react';
import {
  LucideProps,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import './StatsCard.scss';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change: string;
  trend: 'up' | 'down';
  icon: React.ComponentType<LucideProps>;
  color: 'blue' | 'green' | 'purple' | 'orange';
  visualData?: {
    type: 'progress' | 'bar' | 'count' | 'radial' | 'wave' | 'sparkline';
    value?: number;
    max?: number;
    total?: number;
    current?: number;
    data?: number[];
    segments?: Array<{ value: number; label: string }>;
  };
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  change,
  trend,
  icon: Icon,
  color,
  visualData,
}) => {
  const renderVisualization = () => {
    if (!visualData) return null;

    switch (visualData.type) {
      case 'progress':
        const progressValue = visualData.value ?? 0;
        return (
          <div className="stats-card__visualization">
            <div className="stats-card__progress-bar">
              <div
                className="stats-card__progress-fill"
                style={{ width: `${Math.min(progressValue, 100)}%` }}
              />
            </div>
          </div>
        );

      case 'bar':
        const barValue = visualData.value ?? 0;
        const barMax = visualData.max ?? 20;
        const barPercentage = Math.min((barValue / barMax) * 100, 100);
        return (
          <div className="stats-card__visualization stats-card__visualization--compact">
            <div className="stats-card__bar-chart">
              <div
                className="stats-card__bar-fill"
                style={{ 
                  height: `${Math.max(barPercentage, 10)}%`,
                  minHeight: '8px'
                }}
              />
            </div>
          </div>
        );

      case 'count':
        const current = visualData.current ?? 0;
        const total = visualData.total ?? 0;
        const countPercentage = total > 0 ? (current / total) * 100 : 0;
        return (
          <div className="stats-card__visualization stats-card__visualization--compact">
            <div className="stats-card__count-ring">
              <svg className="stats-card__ring-svg" viewBox="0 0 36 36">
                <circle
                  className="stats-card__ring-bg"
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                />
                <circle
                  className="stats-card__ring-progress"
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  strokeDasharray={`${countPercentage}, 100`}
                />
              </svg>
            </div>
          </div>
        );

      case 'radial':
        const radialValue = visualData.value ?? 0;
        const segments = visualData.segments ?? [];
        const totalRadial = segments.reduce((sum, s) => sum + s.value, 0) || 1;
        const circumference = 2 * Math.PI * 28; // r = 28
        return (
          <div className="stats-card__visualization stats-card__visualization--compact">
            <div className="stats-card__radial-chart">
              <svg className="stats-card__radial-svg" viewBox="0 0 64 64">
                <circle
                  className="stats-card__radial-bg"
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                />
                {segments.map((segment, idx) => {
                  const percentage = (segment.value / totalRadial);
                  const dashLength = percentage * circumference;
                  const offset = segments.slice(0, idx).reduce((sum, s) => sum + (s.value / totalRadial) * circumference, 0);
                  return (
                    <circle
                      key={idx}
                      className={`stats-card__radial-segment stats-card__radial-segment--${idx}`}
                      cx="32"
                      cy="32"
                      r="28"
                      fill="none"
                      strokeDasharray={`${dashLength} ${circumference}`}
                      strokeDashoffset={-offset}
                    />
                  );
                })}
              </svg>
            </div>
          </div>
        );

      case 'wave':
        const waveValue = visualData.value ?? 0;
        return (
          <div className="stats-card__visualization stats-card__visualization--compact">
            <div className="stats-card__wave-container">
              <svg className="stats-card__wave-svg" viewBox="0 0 120 40" preserveAspectRatio="none">
                <path
                  className="stats-card__wave-path"
                  d={`M 0,${40 - (waveValue / 100) * 40} Q 30,${40 - ((waveValue + 10) / 100) * 40} 60,${40 - (waveValue / 100) * 40} T 120,${40 - (waveValue / 100) * 40} L 120,40 L 0,40 Z`}
                  fill="currentColor"
                  opacity="0.2"
                />
                <path
                  className="stats-card__wave-path"
                  d={`M 0,${40 - (waveValue / 100) * 40} Q 30,${40 - ((waveValue + 10) / 100) * 40} 60,${40 - (waveValue / 100) * 40} T 120,${40 - (waveValue / 100) * 40}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </div>
          </div>
        );

      case 'sparkline':
        const sparklineData = visualData.data ?? [];
        const maxSparkline = Math.max(...sparklineData, 1);
        const sparklinePoints = sparklineData.map((val, idx) => {
          const x = (idx / (sparklineData.length - 1 || 1)) * 100;
          const y = 100 - (val / maxSparkline) * 100;
          return `${x},${y}`;
        }).join(' ');
        return (
          <div className="stats-card__visualization stats-card__visualization--compact">
            <div className="stats-card__sparkline">
              <svg className="stats-card__sparkline-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
                <polyline
                  className="stats-card__sparkline-line"
                  points={sparklinePoints}
                  fill="none"
                  strokeWidth="2"
                />
                <polygon
                  className="stats-card__sparkline-area"
                  points={`0,100 ${sparklinePoints} 100,100`}
                />
              </svg>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const progressValue = visualData?.type === 'progress' ? (visualData.value ?? 0) : 0;
  const statusText = trend === 'up' ? 'Wzrost' : 'Spadek';

  return (
    <div className={`stats-card stats-card--${color}`}>
      <div className="stats-card__header">
        <div className="stats-card__title-section">
          <h3 className="stats-card__title">{title}</h3>
          {subtitle && <p className="stats-card__subtitle stats-card__subtitle--compact">{subtitle}</p>}
        </div>
        <div className="stats-card__icon-wrapper">
          <div className="stats-card__icon">
            <Icon size={20} strokeWidth={2} />
          </div>
        </div>
      </div>

      <div className="stats-card__status stats-card__status--compact">
        <div className="stats-card__status-indicator">
          <div className={`stats-card__status-dot stats-card__status-dot--${trend}`} />
          <span className="stats-card__status-text">{statusText}</span>
        </div>
      </div>

      {visualData?.type === 'progress' && (
        <div className="stats-card__progress-section">
          <div className="stats-card__progress-bar">
            <div
              className="stats-card__progress-fill"
              style={{ width: `${Math.min(progressValue, 100)}%` }}
            />
          </div>
          <div className="stats-card__progress-info">
            <span className="stats-card__progress-text stats-card__progress-text--compact">{change}</span>
            <span className="stats-card__progress-percent">{progressValue}%</span>
          </div>
        </div>
      )}

      {visualData?.type !== 'progress' && (
        <div className="stats-card__content">
          <div className="stats-card__value">{value}</div>
          <div className="stats-card__change-text stats-card__change-text--compact">{change}</div>
          {renderVisualization()}
        </div>
      )}
    </div>
  );
};

export default StatsCard;
