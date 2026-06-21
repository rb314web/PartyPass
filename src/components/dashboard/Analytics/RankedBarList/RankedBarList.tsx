import React from 'react';
import './RankedBarList.scss';

export interface RankedBarItem {
  label: string;
  value: number;
  color: string;
  fullLabel?: string;
  suffix?: string;
}

interface RankedBarListProps {
  items: RankedBarItem[];
  emptyMessage?: string;
}

const RankedBarList: React.FC<RankedBarListProps> = ({
  items,
  emptyMessage = 'Brak danych do wyświetlenia',
}) => {
  if (items.length === 0) {
    return (
      <div className="ranked-bar-list ranked-bar-list--empty">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  const maxValue = Math.max(...items.map(item => item.value), 1);
  const total = items.reduce((sum, item) => sum + item.value, 0);

  return (
    <ul className="ranked-bar-list">
      {items.map((item, index) => {
        const share = total > 0 ? Math.round((item.value / total) * 100) : 0;

        return (
          <li key={`${item.label}-${index}`} className="ranked-bar-list__item">
            <div className="ranked-bar-list__meta">
              <div className="ranked-bar-list__label-wrap">
                <span className="ranked-bar-list__rank">{index + 1}</span>
                <span
                  className="ranked-bar-list__label"
                  title={item.fullLabel ?? item.label}
                >
                  {item.label}
                </span>
              </div>
              <div className="ranked-bar-list__value">
                <strong>{item.value}</strong>
                <span className="ranked-bar-list__share">
                  {item.suffix ?? `${share}%`}
                </span>
              </div>
            </div>
            <div className="ranked-bar-list__track">
              <div
                className="ranked-bar-list__fill"
                style={{
                  width: `${(item.value / maxValue) * 100}%`,
                  background: item.color,
                }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default RankedBarList;
