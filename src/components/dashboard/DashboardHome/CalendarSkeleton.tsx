// components/dashboard/DashboardHome/CalendarSkeleton.tsx
import React from 'react';
import './CalendarSkeleton.scss';

const CalendarSkeleton: React.FC = () => {
  return (
    <div className="calendar-skeleton">
      {/* Calendar Grid Card */}
      <div className="calendar-skeleton__card">
        <div className="calendar-skeleton__header">
          <div className="calendar-skeleton__header-content">
            <div className="calendar-skeleton__icon skeleton-shimmer" />
            <div className="calendar-skeleton__title skeleton-shimmer" />
          </div>
          <div className="calendar-skeleton__nav">
            <div className="calendar-skeleton__nav-btn skeleton-shimmer" />
            <div className="calendar-skeleton__nav-btn skeleton-shimmer" />
          </div>
        </div>

        <div className="calendar-skeleton__weekdays">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="calendar-skeleton__weekday skeleton-shimmer" />
          ))}
        </div>

        <div className="calendar-skeleton__grid">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="calendar-skeleton__day skeleton-shimmer" />
          ))}
        </div>
      </div>

      {/* Timeline Card */}
      <div className="calendar-skeleton__card">
        <div className="calendar-skeleton__header">
          <div className="calendar-skeleton__header-content">
            <div className="calendar-skeleton__icon skeleton-shimmer" />
            <div className="calendar-skeleton__title skeleton-shimmer" />
          </div>
        </div>

        <div className="calendar-skeleton__timeline">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="calendar-skeleton__timeline-item">
              <div className="calendar-skeleton__timeline-marker">
                <div className="calendar-skeleton__timeline-dot skeleton-shimmer" />
                {i < 3 && <div className="calendar-skeleton__timeline-line" />}
              </div>
              <div className="calendar-skeleton__timeline-content">
                <div className="calendar-skeleton__timeline-date skeleton-shimmer" />
                <div className="calendar-skeleton__timeline-title skeleton-shimmer" />
                <div className="calendar-skeleton__timeline-meta">
                  <div className="calendar-skeleton__meta-item skeleton-shimmer" />
                  <div className="calendar-skeleton__meta-item skeleton-shimmer" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalendarSkeleton;
