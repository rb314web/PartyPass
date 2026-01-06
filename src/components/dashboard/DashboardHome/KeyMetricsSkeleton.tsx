// components/dashboard/DashboardHome/KeyMetricsSkeleton.tsx
import React from 'react';
import './KeyMetricsSkeleton.scss';

const KeyMetricsSkeleton: React.FC = () => {
  return (
    <div className="key-metrics-skeleton">
      {[1, 2, 3].map((index) => (
        <div key={index} className="key-metrics-skeleton__card">
          <div className="key-metrics-skeleton__header">
            <div className="key-metrics-skeleton__icon" />
            <div className="key-metrics-skeleton__label" />
          </div>
          <div className="key-metrics-skeleton__value" />
          <div className="key-metrics-skeleton__divider" />
          <div className="key-metrics-skeleton__change">
            <div className="key-metrics-skeleton__change-badge" />
            <div className="key-metrics-skeleton__change-label" />
          </div>
          <div className="key-metrics-skeleton__details">
            <div className="key-metrics-skeleton__detail">
              <div className="key-metrics-skeleton__detail-indicator" />
              <div className="key-metrics-skeleton__detail-text" />
            </div>
            <div className="key-metrics-skeleton__detail">
              <div className="key-metrics-skeleton__detail-indicator" />
              <div className="key-metrics-skeleton__detail-text" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default KeyMetricsSkeleton;



















