// components/dashboard/StatsCard/StatsCard.tsx
import React from 'react';
import { LucideIcon, LucideProps, TrendingUp, TrendingDown } from 'lucide-react';
import './StatsCard.scss';

interface StatsCardProps {
  title: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down';
  icon: React.ComponentType<LucideProps>;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  trend,
  icon: Icon,
  color
}) => {
  return (
    <div className={`stats-card stats-card--${color}`}>
      <div className="stats-card__header">
        <div className="stats-card__icon">
          <Icon size={24} />
        </div>
        <div className={`stats-card__trend stats-card__trend--${trend}`}>
          {trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          <span>{change}</span>
        </div>
      </div>
      
      <div className="stats-card__content">
        <div className="stats-card__value">{value}</div>
        <div className="stats-card__title">{title}</div>
      </div>
    </div>
  );
};

export default StatsCard;
