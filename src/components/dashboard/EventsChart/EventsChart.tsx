// components/dashboard/EventsChart/EventsChart.tsx
import React from 'react';
import './EventsChart.scss';

const EventsChart: React.FC = () => {
  // Mock data dla wykresu
  const chartData = [
    { month: 'Lut', events: 4, guests: 45 },
    { month: 'Mar', events: 6, guests: 78 },
    { month: 'Kwi', events: 3, guests: 32 },
    { month: 'Maj', events: 8, guests: 95 },
    { month: 'Cze', events: 5, guests: 67 },
    { month: 'Lip', events: 7, guests: 89 }
  ];

  const maxEvents = Math.max(...chartData.map(d => d.events));
  const maxGuests = Math.max(...chartData.map(d => d.guests));

  return (
    <div className="events-chart">
      <div className="events-chart__legend">
        <div className="events-chart__legend-item">
          <div className="events-chart__legend-color events-chart__legend-color--events"></div>
          <span>Wydarzenia</span>
        </div>
        <div className="events-chart__legend-item">
          <div className="events-chart__legend-color events-chart__legend-color--guests"></div>
          <span>Goście</span>
        </div>
      </div>
      
      <div className="events-chart__container">
        <div className="events-chart__y-axis">
          <span>100</span>
          <span>75</span>
          <span>50</span>
          <span>25</span>
          <span>0</span>
        </div>
        
        <div className="events-chart__chart">
          {chartData.map((data, index) => (
            <div key={data.month} className="events-chart__bar-group">
              <div className="events-chart__bars">
                <div 
                  className="events-chart__bar events-chart__bar--events"
                  style={{ height: `${(data.events / maxEvents) * 100}%` }}
                  title={`${data.events} wydarzeń`}
                />
                <div 
                  className="events-chart__bar events-chart__bar--guests"
                  style={{ height: `${(data.guests / maxGuests) * 100}%` }}
                  title={`${data.guests} gości`}
                />
              </div>
              <span className="events-chart__month">{data.month}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EventsChart;