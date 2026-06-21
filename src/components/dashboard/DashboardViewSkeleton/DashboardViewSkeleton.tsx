import React from 'react';
import './DashboardViewSkeleton.scss';

export type DashboardViewSkeletonVariant =
  | 'dashboard'
  | 'grid'
  | 'list'
  | 'analytics';

export interface DashboardViewSkeletonProps {
  variant?: DashboardViewSkeletonVariant;
  /** Liczba kart/wierszy w siatce lub liście */
  count?: number;
}

const Box: React.FC<{ className?: string }> = ({ className = '' }) => (
  <span className={`dashboard-skeleton__box ${className}`} aria-hidden="true" />
);

const Toolbar: React.FC = () => (
  <div className="dashboard-skeleton__toolbar">
    <Box className="dashboard-skeleton__search" />
    <Box className="dashboard-skeleton__btn" />
    <Box className="dashboard-skeleton__btn" />
  </div>
);

const GridCards: React.FC<{ count: number }> = ({ count }) => (
  <div className="dashboard-skeleton__grid">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="dashboard-skeleton__card">
        <Box className="dashboard-skeleton__thumb" />
        <Box className="dashboard-skeleton__line dashboard-skeleton__line--lg" />
        <Box className="dashboard-skeleton__line dashboard-skeleton__line--md" />
        <div className="dashboard-skeleton__card-foot">
          <Box className="dashboard-skeleton__chip" />
          <Box className="dashboard-skeleton__chip" />
        </div>
      </div>
    ))}
  </div>
);

const ListRows: React.FC<{ count: number }> = ({ count }) => (
  <div className="dashboard-skeleton__list">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="dashboard-skeleton__row">
        <Box className="dashboard-skeleton__avatar" />
        <div className="dashboard-skeleton__row-lines">
          <Box className="dashboard-skeleton__line dashboard-skeleton__line--md" />
          <Box className="dashboard-skeleton__line dashboard-skeleton__line--sm" />
        </div>
        <Box className="dashboard-skeleton__row-trailing" />
      </div>
    ))}
  </div>
);

const StatCards: React.FC<{ count?: number }> = ({ count = 4 }) => (
  <div className="dashboard-skeleton__stats">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="dashboard-skeleton__stat">
        <Box className="dashboard-skeleton__stat-icon" />
        <Box className="dashboard-skeleton__line dashboard-skeleton__line--sm" />
        <Box className="dashboard-skeleton__line dashboard-skeleton__line--lg" />
      </div>
    ))}
  </div>
);

const DashboardViewSkeleton: React.FC<DashboardViewSkeletonProps> = ({
  variant = 'list',
  count,
}) => {
  return (
    <div
      className={`dashboard-skeleton dashboard-skeleton--${variant}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="dashboard-skeleton__sr">Ładowanie…</span>

      {variant === 'dashboard' && (
        <>
          <div className="dashboard-skeleton__hero">
            <Box className="dashboard-skeleton__line dashboard-skeleton__line--sm dashboard-skeleton__line--pill" />
            <Box className="dashboard-skeleton__line dashboard-skeleton__line--lg" />
            <Box className="dashboard-skeleton__line dashboard-skeleton__line--md" />
            <div className="dashboard-skeleton__hero-grid">
              <div className="dashboard-skeleton__hero-main">
                <Box className="dashboard-skeleton__line dashboard-skeleton__line--sm" />
                <div className="dashboard-skeleton__pills">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Box key={i} className="dashboard-skeleton__pill" />
                  ))}
                </div>
              </div>
              <Box className="dashboard-skeleton__block dashboard-skeleton__block--spotlight" />
            </div>
            <Box className="dashboard-skeleton__block dashboard-skeleton__block--readiness" />
          </div>
          <Box className="dashboard-skeleton__block dashboard-skeleton__block--attention" />
          <StatCards count={count ?? 3} />
          <div className="dashboard-skeleton__bento">
            <Box className="dashboard-skeleton__line dashboard-skeleton__line--md" />
            <div className="dashboard-skeleton__bento-grid">
              <Box className="dashboard-skeleton__block dashboard-skeleton__block--calendar" />
              <Box className="dashboard-skeleton__block dashboard-skeleton__block--pulse" />
              <Box className="dashboard-skeleton__block dashboard-skeleton__block--map" />
            </div>
          </div>
        </>
      )}

      {variant === 'grid' && (
        <>
          <StatCards count={4} />
          <Toolbar />
          <GridCards count={count ?? 6} />
        </>
      )}

      {variant === 'list' && (
        <>
          <Toolbar />
          <ListRows count={count ?? 6} />
        </>
      )}

      {variant === 'analytics' && (
        <>
          <StatCards count={count ?? 4} />
          <Box className="dashboard-skeleton__block dashboard-skeleton__block--tall" />
          <div className="dashboard-skeleton__row2">
            <Box className="dashboard-skeleton__block" />
            <Box className="dashboard-skeleton__block" />
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardViewSkeleton;
