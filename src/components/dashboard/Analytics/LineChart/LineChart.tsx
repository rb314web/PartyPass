// components/dashboard/Analytics/LineChart/LineChart.tsx
import React from 'react';
import './LineChart.scss';

interface LineChartProps {
  data: Array<{
    date: string;
    value: number;
    label?: string;
  }>;
  title: string;
  color?: string;
  height?: number;
}

const LineChart: React.FC<LineChartProps> = ({ 
  data, 
  title, 
  color = '#3b82f6',
  height = 200 
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="line-chart">
        <h3 className="line-chart__title">{title}</h3>
        <div className="line-chart__no-data">
          <p>No data available</p>
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;

  const getY = (value: number) => {
    return height - ((value - minValue) / range) * (height - 40);
  };

  const getX = (index: number) => {
    return (index / (data.length - 1)) * 280 + 20;
  };

  const pathData = data.map((point, index) => {
    const x = getX(index);
    const y = getY(point.value);
    return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
  }).join(' ');

  return (
    <div className="line-chart">
      <h3 className="line-chart__title">{title}</h3>
      <div className="line-chart__container">
        <svg width="320" height={height + 40} className="line-chart__svg">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
            <g key={index}>
              <line
                x1="20"
                y1={20 + ratio * (height - 40)}
                x2="300"
                y2={20 + ratio * (height - 40)}
                stroke="#e5e7eb"
                strokeWidth="1"
                strokeDasharray="2,2"
              />
              <text
                x="10"
                y={25 + ratio * (height - 40)}
                fontSize="10"
                fill="#6b7280"
                textAnchor="end"
              >
                {Math.round(maxValue - ratio * range)}
              </text>
            </g>
          ))}

          {/* Main line */}
          <path
            d={pathData}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {data.map((point, index) => (
            <g key={index}>
              <circle
                cx={getX(index)}
                cy={getY(point.value)}
                r="4"
                fill={color}
                className="line-chart__point"
              />
              <text
                x={getX(index)}
                y={height + 35}
                fontSize="10"
                fill="#6b7280"
                textAnchor="middle"
                className="line-chart__label"
              >
                {point.date}
              </text>
            </g>
          ))}

          {/* Area fill */}
          <path
            d={`${pathData} L ${getX(data.length - 1)} ${height + 20} L 20 ${height + 20} Z`}
            fill={`url(#gradient-${color.replace('#', '')})`}
            opacity="0.1"
          />

          {/* Gradient definition */}
          <defs>
            <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>

        {/* Tooltip container */}
        <div className="line-chart__tooltip" id={`tooltip-${title.replace(/\s+/g, '-')}`}>
          <div className="line-chart__tooltip-content">
            <span className="line-chart__tooltip-date"></span>
            <span className="line-chart__tooltip-value"></span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="line-chart__legend">
        <div className="line-chart__legend-item">
          <span 
            className="line-chart__legend-color" 
            style={{ backgroundColor: color }}
          ></span>
          <span className="line-chart__legend-label">{title}</span>
        </div>
      </div>
    </div>
  );
};

export default LineChart;
