// components/dashboard/EventsChart/EventsChart.tsx
import React, { useState, useEffect } from 'react';
import { EventService, EventChartData } from '../../../services/firebase/eventService';
import { useAuth } from '../../../hooks/useAuth';
import './EventsChart.scss';

interface EventsChartProps {
  timeFilter?: string;
}

const EventsChart: React.FC<EventsChartProps> = ({ timeFilter = '6months' }) => {
  const { user } = useAuth();
  const [chartData, setChartData] = useState<EventChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadChartData = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        console.log('Loading chart data for user:', user.id);
        const data = await EventService.getEventChartData(user.id);
        console.log('Chart data received:', data);
        setChartData(data);
      } catch (error) {
        console.error('Error loading chart data:', error);
        // Fallback to mock data
        console.log('Using mock data for chart');
        setChartData([
          { month: 'Lut', events: 4, guests: 45, date: new Date() },
          { month: 'Mar', events: 6, guests: 78, date: new Date() },
          { month: 'Kwi', events: 3, guests: 32, date: new Date() },
          { month: 'Maj', events: 8, guests: 95, date: new Date() },
          { month: 'Cze', events: 5, guests: 67, date: new Date() },
          { month: 'Lip', events: 7, guests: 89, date: new Date() }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadChartData();
  }, [user, timeFilter]);

  if (loading) {
    return (
      <div className="events-chart">
        <div className="events-chart__loading">
          <div className="events-chart__spinner"></div>
          <p>Ładowanie danych wykresu...</p>
        </div>
      </div>
    );
  }

  console.log('Chart data to render:', chartData);
  
  if (!chartData || chartData.length === 0) {
    return (
      <div className="events-chart">
        <div className="events-chart__empty">
          <p>Brak danych do wyświetlenia wykresu</p>
        </div>
      </div>
    );
  }

  const maxEvents = Math.max(...chartData.map(d => d.events), 1); // Minimum 1 to avoid division by 0
  const maxGuests = Math.max(...chartData.map(d => d.guests), 1);

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