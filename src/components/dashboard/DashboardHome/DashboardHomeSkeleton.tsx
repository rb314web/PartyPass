// components/dashboard/DashboardHome/DashboardHomeSkeleton.tsx
import React from 'react';
import KeyMetricsSkeleton from './KeyMetricsSkeleton';
import QuickActionsSkeleton from '../QuickActions/QuickActionsSkeleton';
import CalendarSkeleton from './CalendarSkeleton';
import ActivityWeatherSkeleton from './ActivityWeatherSkeleton';
import MapSkeleton from './MapSkeleton';
import './DashboardHome.scss';

const DashboardHomeSkeleton: React.FC = () => {
  return (
    <div className="dashboard-home">
      {/* Header */}
      <div className="dashboard-home__header">
        <h1>Przegląd</h1>
        <p>Twoje wydarzenia w skrócie</p>
      </div>

      {/* Quick Actions Skeleton */}
      <QuickActionsSkeleton />

      {/* Key Metrics Skeleton */}
      <div className="dashboard-home__top-grid">
        <KeyMetricsSkeleton />
      </div>

      {/* Calendar Skeleton */}
      <div className="dashboard-home__section dashboard-home__section--calendar">
        <CalendarSkeleton />
      </div>

      {/* Activity & Weather Skeleton */}
      <ActivityWeatherSkeleton />

      {/* Map Skeleton */}
      <div className="dashboard-home__section dashboard-home__section--map">
        <div className="dashboard-home__section-header">
          <h2>Mapa wydarzeń</h2>
        </div>
        <MapSkeleton />
      </div>
    </div>
  );
};

export default DashboardHomeSkeleton;
