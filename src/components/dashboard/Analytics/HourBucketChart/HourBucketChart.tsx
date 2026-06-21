import React, { useMemo } from 'react';
import './HourBucketChart.scss';

interface HourBucketChartProps {
  distribution: Array<{ hour: number; count: number }>;
}

const BUCKETS = [
  { key: 'morning', label: 'Rano', hint: '8–12', hours: [8, 9, 10, 11] },
  { key: 'midday', label: 'Południe', hint: '12–16', hours: [12, 13, 14, 15] },
  {
    key: 'afternoon',
    label: 'Popołudnie',
    hint: '16–20',
    hours: [16, 17, 18, 19],
  },
  { key: 'evening', label: 'Wieczór', hint: '20–24', hours: [20, 21, 22, 23] },
];

const HourBucketChart: React.FC<HourBucketChartProps> = ({ distribution }) => {
  const buckets = useMemo(() => {
    const byHour = new Map(distribution.map(item => [item.hour, item.count]));
    return BUCKETS.map(bucket => ({
      ...bucket,
      value: bucket.hours.reduce((sum, hour) => sum + (byHour.get(hour) ?? 0), 0),
    }));
  }, [distribution]);

  const max = Math.max(...buckets.map(bucket => bucket.value), 1);
  const total = buckets.reduce((sum, bucket) => sum + bucket.value, 0);
  const peakHour = distribution.reduce(
    (best, item) => (item.count > best.count ? item : best),
    { hour: 0, count: 0 }
  );

  if (total === 0) {
    return (
      <div className="hour-bucket-chart hour-bucket-chart--empty">
        <p>Brak wydarzeń w wybranym okresie</p>
      </div>
    );
  }

  return (
    <div className="hour-bucket-chart">
      <div className="hour-bucket-chart__grid">
        {buckets.map(bucket => (
          <div key={bucket.key} className="hour-bucket-chart__item">
            <div className="hour-bucket-chart__meta">
              <span className="hour-bucket-chart__label">{bucket.label}</span>
              <span className="hour-bucket-chart__hint">{bucket.hint}</span>
            </div>
            <div className="hour-bucket-chart__track">
              <div
                className="hour-bucket-chart__fill"
                style={{ width: `${(bucket.value / max) * 100}%` }}
              />
            </div>
            <strong className="hour-bucket-chart__value">{bucket.value}</strong>
          </div>
        ))}
      </div>
      {peakHour.count > 0 && (
        <p className="hour-bucket-chart__footnote">
          Najpopularniejsza godzina: <strong>{peakHour.hour}:00</strong>
        </p>
      )}
    </div>
  );
};

export default HourBucketChart;
