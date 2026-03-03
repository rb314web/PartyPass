// components/dashboard/StatsCard/StatsCardSkeleton.tsx
import React from 'react';
import './StatsCard.scss';

const StatsCardSkeleton: React.FC = () => {
  return (
    <div className="stats-card stats-card--loading">
      <div className="stats-card__header">
        <div className="stats-card__icon skeleton-box" style={{ width: '40px', height: '40px', borderRadius: '8px' }} />
        <div className="stats-card__info">
          <div className="skeleton-box" style={{ width: '120px', height: '14px', marginBottom: '8px' }} />
          <div className="skeleton-box" style={{ width: '80px', height: '24px' }} />
        </div>
      </div>
      <div className="stats-card__footer">
        <div className="skeleton-box" style={{ width: '100px', height: '12px' }} />
      </div>
    </div>
  );
};

export default StatsCardSkeleton;
