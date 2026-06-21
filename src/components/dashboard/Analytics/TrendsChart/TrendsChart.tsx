import React, { useId, useMemo, useState } from 'react';
import './TrendsChart.scss';

export interface TrendsChartPoint {
  month: string;
  events: number;
  guests: number;
}

interface TrendsChartProps {
  data: TrendsChartPoint[];
}

const SERIES = [
  { key: 'events' as const, label: 'Wydarzenia', color: '#7b9ae8' },
  { key: 'guests' as const, label: 'Goście', color: '#6db89a' },
];

const CHART = {
  width: 320,
  height: 156,
  padLeft: 28,
  padRight: 8,
  padTop: 14,
  padBottom: 28,
};

function getYAxisMax(values: number[]): number {
  const peak = Math.max(...values, 0);
  if (peak <= 1) return 1;
  if (peak <= 4) return peak;
  return Math.ceil(peak * 1.15);
}

function buildTicks(max: number): number[] {
  if (max <= 1) return [0, 1];
  if (max <= 5) {
    return Array.from({ length: max + 1 }, (_, i) => i);
  }
  const step = max <= 10 ? 2 : Math.ceil(max / 4);
  const ticks: number[] = [0];
  for (let v = step; v < max; v += step) ticks.push(v);
  ticks.push(max);
  return ticks;
}

const TrendsChart: React.FC<TrendsChartProps> = ({ data }) => {
  const gradientId = useId().replace(/:/g, '');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const { ticks, maxY, plotWidth, plotHeight, groups } = useMemo(() => {
    const values = data.flatMap(point => [point.events, point.guests]);
    const max = getYAxisMax(values);
    const plotW = CHART.width - CHART.padLeft - CHART.padRight;
    const plotH = CHART.height - CHART.padTop - CHART.padBottom;
    const groupWidth = data.length > 0 ? plotW / data.length : plotW;
    const barWidth = Math.min(18, groupWidth * 0.22);

    const mapped = data.map((point, index) => {
      const centerX = CHART.padLeft + groupWidth * index + groupWidth / 2;
      const toY = (value: number) =>
        CHART.padTop + plotH - (value / max) * plotH;

      return {
        ...point,
        index,
        centerX,
        bars: SERIES.map((series, seriesIndex) => {
          const value = point[series.key];
          const x =
            centerX +
            (seriesIndex - (SERIES.length - 1) / 2) * (barWidth + 6);
          const y = toY(value);
          const height = CHART.padTop + plotH - y;
          return { ...series, value, x, y, width: barWidth, height };
        }),
      };
    });

    return {
      ticks: buildTicks(max),
      maxY: max,
      plotWidth: plotW,
      plotHeight: plotH,
      groups: mapped,
    };
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="trends-chart trends-chart--empty">
        <p>Brak danych do wyświetlenia</p>
      </div>
    );
  }

  const baseY = CHART.padTop + plotHeight;

  return (
    <div className="trends-chart">
      <div className="trends-chart__legend">
        {SERIES.map(series => (
          <span key={series.key} className="trends-chart__legend-item">
            <span
              className="trends-chart__legend-dot"
              style={{ backgroundColor: series.color }}
            />
            {series.label}
          </span>
        ))}
      </div>

      <div className="trends-chart__canvas">
        <svg
          viewBox={`0 0 ${CHART.width} ${CHART.height}`}
          className="trends-chart__svg"
          role="img"
          aria-label="Trendy wydarzeń i gości z ostatnich 6 miesięcy"
        >
          <defs>
            <linearGradient
              id={`trends-events-${gradientId}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor="#7b9ae8" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#7b9ae8" stopOpacity="0.55" />
            </linearGradient>
            <linearGradient
              id={`trends-guests-${gradientId}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor="#6db89a" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#6db89a" stopOpacity="0.55" />
            </linearGradient>
          </defs>

          {ticks.map(tick => {
            const y = CHART.padTop + plotHeight - (tick / maxY) * plotHeight;
            return (
              <g key={tick}>
                <line
                  x1={CHART.padLeft}
                  y1={y}
                  x2={CHART.width - CHART.padRight}
                  y2={y}
                  className="trends-chart__grid-line"
                />
                <text
                  x={CHART.padLeft - 8}
                  y={y + 4}
                  className="trends-chart__axis-label"
                  textAnchor="end"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          <line
            x1={CHART.padLeft}
            y1={baseY}
            x2={CHART.width - CHART.padRight}
            y2={baseY}
            className="trends-chart__axis-line"
          />

          {groups.map(group => (
            <g
              key={group.month}
              onMouseEnter={() => setActiveIndex(group.index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              {activeIndex === group.index && (
                <rect
                  x={group.centerX - plotWidth / data.length / 2 + 4}
                  y={CHART.padTop}
                  width={plotWidth / data.length - 8}
                  height={plotHeight}
                  className="trends-chart__hover-band"
                  rx={8}
                />
              )}

              {group.bars.map(bar => (
                <g key={bar.key}>
                  <rect
                    x={bar.x - bar.width / 2}
                    y={bar.y}
                    width={bar.width}
                    height={Math.max(bar.height, 0)}
                    rx={4}
                    fill={
                      bar.key === 'events'
                        ? `url(#trends-events-${gradientId})`
                        : `url(#trends-guests-${gradientId})`
                    }
                    className="trends-chart__bar"
                    opacity={
                      activeIndex == null || activeIndex === group.index
                        ? 1
                        : 0.45
                    }
                  />
                  {bar.value > 0 && (
                    <text
                      x={bar.x}
                      y={bar.y - 6}
                      className="trends-chart__bar-value"
                      textAnchor="middle"
                    >
                      {bar.value}
                    </text>
                  )}
                </g>
              ))}

              <text
                x={group.centerX}
                y={CHART.height - 10}
                className="trends-chart__month-label"
                textAnchor="middle"
              >
                {group.month}
              </text>
            </g>
          ))}
        </svg>

        {activeIndex != null && groups[activeIndex] && (
          <div
            className="trends-chart__tooltip"
            style={{
              left: `${(groups[activeIndex].centerX / CHART.width) * 100}%`,
            }}
          >
            <strong>{groups[activeIndex].month}</strong>
            <span>Wydarzenia: {groups[activeIndex].events}</span>
            <span>Goście: {groups[activeIndex].guests}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrendsChart;
