// components/dashboard/StatsCard/StatsCardSkeleton.tsx
import React from 'react';
import './StatsCardSkeleton.scss';

const StatsCardSkeleton: React.FC = () => {
  return (
    <div className="stats-card-skeleton">
      <div className="stats-card-skeleton__header">
        <div className="stats-card-skeleton__icon"></div>
        <div className="stats-card-skeleton__trend"></div>
      </div>
      <div className="stats-card-skeleton__content">
        <div className="stats-card-skeleton__value"></div>
        <div className="stats-card-skeleton__title"></div>
      </div>
    </div>
  );
};

export default StatsCardSkeleton;

