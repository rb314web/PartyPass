import React from 'react';
import './WeekdayHeatmap.scss';

interface WeekdayHeatmapProps {
  data: Array<{ day: string; count: number }>;
}

const WeekdayHeatmap: React.FC<WeekdayHeatmapProps> = ({ data }) => {
  const max = Math.max(...data.map(item => item.count), 1);
  const total = data.reduce((sum, item) => sum + item.count, 0);

  if (total === 0) {
    return (
      <div className="weekday-heatmap weekday-heatmap--empty">
        <p>Brak wydarzeń w wybranym okresie</p>
      </div>
    );
  }

  return (
    <div className="weekday-heatmap">
      {data.map(item => {
        const intensity = item.count / max;
        return (
          <div key={item.day} className="weekday-heatmap__cell">
            <div className="weekday-heatmap__bar-wrap">
              <div
                className="weekday-heatmap__bar"
                style={{ height: `${Math.max(intensity * 100, item.count > 0 ? 18 : 0)}%` }}
              />
            </div>
            <span className="weekday-heatmap__label">{item.day}</span>
            <span className="weekday-heatmap__value">{item.count}</span>
          </div>
        );
      })}
    </div>
  );
};

export default WeekdayHeatmap;
