// components/dashboard/DashboardHome/MapSkeleton.tsx
import React from 'react';
import './MapSkeleton.scss';

const MapSkeleton: React.FC = () => {
  return (
    <div className="map-skeleton">
      <div className="map-skeleton__shimmer" />
      <div className="map-skeleton__overlay">
        <div className="map-skeleton__spinner" />
        <p>Ładowanie mapy...</p>
      </div>
    </div>
  );
};

export default MapSkeleton;















