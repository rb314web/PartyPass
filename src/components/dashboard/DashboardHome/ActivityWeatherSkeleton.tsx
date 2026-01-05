// components/dashboard/DashboardHome/ActivityWeatherSkeleton.tsx
import React from 'react';
import './ActivityWeatherSkeleton.scss';

const ActivityWeatherSkeleton: React.FC = () => {
  return (
    <div className="activity-weather-skeleton">
      {/* Activity Card Skeleton */}
      <div className="activity-weather-skeleton__card">
        <div className="activity-weather-skeleton__header">
          <div className="activity-weather-skeleton__icon skeleton-shimmer" />
          <div className="activity-weather-skeleton__title skeleton-shimmer" />
        </div>
        <div className="activity-weather-skeleton__content">
          <div className="activity-weather-skeleton__message skeleton-shimmer" />
          <div className="activity-weather-skeleton__message activity-weather-skeleton__message--short skeleton-shimmer" />
          <div className="activity-weather-skeleton__time skeleton-shimmer" />
        </div>
      </div>

      {/* Weather Card Skeleton */}
      <div className="activity-weather-skeleton__card">
        <div className="activity-weather-skeleton__header">
          <div className="activity-weather-skeleton__icon skeleton-shimmer" />
          <div className="activity-weather-skeleton__title skeleton-shimmer" />
        </div>
        <div className="activity-weather-skeleton__content">
          <div className="activity-weather-skeleton__event-title skeleton-shimmer" />
          <div className="activity-weather-skeleton__event-details">
            <div className="activity-weather-skeleton__detail skeleton-shimmer" />
            <div className="activity-weather-skeleton__detail skeleton-shimmer" />
            <div className="activity-weather-skeleton__detail skeleton-shimmer" />
          </div>
          <div className="activity-weather-skeleton__weather">
            <div className="activity-weather-skeleton__weather-icon skeleton-shimmer" />
            <div className="activity-weather-skeleton__weather-info">
              <div className="activity-weather-skeleton__temp skeleton-shimmer" />
              <div className="activity-weather-skeleton__desc skeleton-shimmer" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityWeatherSkeleton;
