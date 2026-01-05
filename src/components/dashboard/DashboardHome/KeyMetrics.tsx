// components/dashboard/DashboardHome/KeyMetrics.tsx
import React from 'react';
import { Calendar, Users, Crown, ArrowUp, ArrowDown } from 'lucide-react';
import './KeyMetrics.scss';

interface MetricProps {
  value: number;
  label: string;
  change: number;
  changeLabel: string;
  icon: React.ComponentType<{ size?: number }>;
  color: 'blue' | 'green' | 'purple';
  details?: Array<{ label: string; value: number; color?: string; max?: number }>;  upgradeLink?: string;  upgradeLinkText?: string;
}

interface KeyMetricsProps {
  totalEvents: number;
  eventsChange: number;
  totalGuests: number;
  guestsChange: number;
  responseRate: number;
  responseRateChange: number;
  activeEvents: number;
  completedEvents: number;
  acceptedGuests: number;
  pendingGuests: number;
}

const KeyMetrics: React.FC<KeyMetricsProps> = ({
  totalEvents,
  eventsChange,
  totalGuests,
  guestsChange,
  responseRate,
  responseRateChange,
  activeEvents,
  completedEvents,
  acceptedGuests,
  pendingGuests,
}) => {
  const metrics: MetricProps[] = [
    {
      value: totalEvents,
      label: 'Wydarzenia',
      change: eventsChange,
      changeLabel: 'vs poprzedni m-c',
      icon: Calendar,
      color: 'blue',
      details: [
        { label: 'Aktywne', value: activeEvents, color: 'success' },
        { label: 'Zakończone', value: completedEvents, color: 'neutral' },
      ],
      upgradeLink: '/dashboard/events',
      upgradeLinkText: 'Zobacz wszystkie',
    },
    {
      value: totalGuests,
      label: 'Goście',
      change: guestsChange,
      changeLabel: 'vs poprzedni m-c',
      icon: Users,
      color: 'green',
      details: [
        { label: 'Odpowiedzieli', value: totalGuests - pendingGuests, color: 'success' },
        { label: 'Oczekujący', value: pendingGuests, color: 'warning' },
      ],
      upgradeLink: '/dashboard/guests',
      upgradeLinkText: 'Zarządzaj gośćmi',
    },
    {
      value: Math.round((totalGuests / 50) * 100),
      label: 'Plan Free',
      change: 0,
      changeLabel: 'wykorzystania limitu',
      icon: Crown,
      color: 'purple',
      details: [
        { label: 'Wydarzenia', value: totalEvents, color: 'neutral', max: 10 },
        { label: 'Goście', value: totalGuests, color: 'neutral', max: 50 },
      ],
      upgradeLink: '/dashboard/settings?tab=plan',
      upgradeLinkText: 'Zmień plan',
    },
  ];

  return (
    <div className="key-metrics">
      {metrics.map((metric, index) => (
        <MetricCard key={index} {...metric} />
      ))}
    </div>
  );
};

const MetricCard: React.FC<MetricProps> = ({
  value,
  label,
  change,
  changeLabel,
  icon: Icon,
  color,
  details,
  upgradeLink,
  upgradeLinkText,
}) => {
  const isPositive = change >= 0;

  return (
    <div className={`key-metrics__card key-metrics__card--${color}`}>
      <div className="key-metrics__header">
        <div className={`key-metrics__icon key-metrics__icon--${color}`}>
          <Icon size={24} />
        </div>
        <span className="key-metrics__label">{label}</span>
      </div>

      <div className="key-metrics__value">
        {label.includes('Plan') ? `${value}%` : value}
      </div>

      <div className="key-metrics__divider" />

      <div className="key-metrics__change">
        {change !== 0 && (
          <span
            className={`key-metrics__change-badge key-metrics__change-badge--${isPositive ? 'positive' : 'negative'}`}
          >
            {isPositive ? (
              <ArrowUp size={14} strokeWidth={2.5} />
            ) : (
              <ArrowDown size={14} strokeWidth={2.5} />
            )}
            {isPositive ? '+' : ''}
            {change}%
          </span>
        )}
        <span className="key-metrics__change-label">{changeLabel}</span>
      </div>

      {details && details.length > 0 && (
        <div className="key-metrics__details">
          {details.map((detail, idx) => (
            <div key={idx} className="key-metrics__detail">
              <span
                className={`key-metrics__detail-indicator key-metrics__detail-indicator--${detail.color}`}
              />
              <span className="key-metrics__detail-label">{detail.label}</span>
              <span className="key-metrics__detail-value">
                {detail.max ? `${detail.value} / ${detail.max}` : detail.value}
              </span>
            </div>
          ))}
        </div>
      )}

      {upgradeLink && (
        <a href={upgradeLink} className="key-metrics__upgrade-link">
          {upgradeLinkText || 'Zobacz więcej'}
        </a>
      )}
    </div>
  );
};

export default KeyMetrics;
