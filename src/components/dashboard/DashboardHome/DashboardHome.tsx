// components/dashboard/DashboardHome/DashboardHome.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  TrendingUp, 
  Clock, 
  Plus,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  UserCheck
} from 'lucide-react';
import StatsCard from '../StatsCard/StatsCard';
import QuickActions from '../QuickActions/QuickActions';
import RecentActivity from '../RecentActivity/RecentActivity';
import UpcomingEvents from '../UpcomingEvents/UpcomingEvents';
import EventsChart from '../EventsChart/EventsChart';
import { EventService, EventStats } from '../../../services/firebase/eventService';
import { useAuth } from '../../../hooks/useAuth';
import { Activity } from '../../../types';
import './DashboardHome.scss';

// Local interface that matches what StatsCard component actually expects
interface StatsCardComponentProps {
  title: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down'; // StatsCard component only supports 'up' | 'down'
  icon: React.ComponentType;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

const DashboardHome: React.FC = () => {
  const { user } = useAuth();

  // Use the component's expected interface
  const [stats, setStats] = React.useState<EventStats | null>(null);

  React.useEffect(() => {
    if (user?.id) {
      EventService.getEventStats(user.id)
        .then(setStats)
        .catch(() => setStats(null));
    }
  }, [user]);

  const statsCards: StatsCardComponentProps[] = [
    {
      title: 'Wszystkie wydarzenia',
      value: stats?.totalEvents ?? 0,
      change: '+0%',
      trend: 'up',
      icon: Calendar,
      color: 'blue'
    },
    {
      title: 'Aktywne wydarzenia',
      value: stats?.activeEvents ?? 0,
      change: '+0',
      trend: 'up',
      icon: CheckCircle,
      color: 'green'
    },
    {
      title: 'Łączni goście',
      value: stats?.totalGuests ?? 0,
      change: '+0%',
      trend: 'up',
      icon: Users,
      color: 'purple'
    },
    {
      title: 'Wskaźnik odpowiedzi',
      value: `${stats?.responseRate ?? 0}%`,
      change: '+0%',
      trend: 'up',
      icon: TrendingUp,
      color: 'orange'
    }
  ];

  const [activities, setActivities] = React.useState<Activity[]>([]);
  const upcomingEvents: any[] = [];

  React.useEffect(() => {
    if (user?.id) {
      // Pobierz ostatnie aktywności
      EventService.getRecentActivities(user.id, 10)
        .then(setActivities)
        .catch(error => {
          console.error('Błąd podczas pobierania aktywności:', error);
          setActivities([]);
        });
    }
  }, [user]);

  // Filtruj aktywności według dozwolonych typów
  const allowedActivityTypes = [
    'guest_response',
    'event_created',
    'guest_declined',
    'guest_accepted',
    'event_updated',
    'event_deleted',
    'guest_maybe',
    'event_cancelled'
  ] as const;
  
  const filteredActivities = activities.filter(activity => 
    allowedActivityTypes.includes(activity.type));

  return (
    <div className="dashboard-home">
      <div className="dashboard-home__header">
        <div>
          <h1 className="dashboard-home__title">Przegląd</h1>
          <p className="dashboard-home__subtitle">
            Oto jak wyglądają Twoje wydarzenia w tym miesiącu
          </p>
        </div>
        <QuickActions />
      </div>

      {/* Stats Cards */}
      <div className="dashboard-home__stats">
        {statsCards.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-home__grid">
        {/* Events Chart */}
        <div className="dashboard-home__chart-section">
          <div className="dashboard-home__section-header">
            <h2>Wydarzenia w czasie</h2>
            <select className="dashboard-home__time-filter">
              <option>Ostatnie 6 miesięcy</option>
              <option>Ostatni rok</option>
              <option>Wszystkie</option>
            </select>
          </div>
          <EventsChart />
        </div>

        {/* Recent Activity */}
        <div className="dashboard-home__activity-section">
          <div className="dashboard-home__section-header">
            <h2>Ostatnie aktywności</h2>
            <Link to="/dashboard/activities" className="dashboard-home__see-all">
              Zobacz wszystkie
              <ArrowRight size={16} />
            </Link>
          </div>
          <RecentActivity activities={filteredActivities} />
        </div>

        {/* Upcoming Events */}
        <div className="dashboard-home__events-section">
          <div className="dashboard-home__section-header">
            <h2>Nadchodzące wydarzenia</h2>
            <Link to="/dashboard/events" className="dashboard-home__see-all">
              Zobacz wszystkie
              <ArrowRight size={16} />
            </Link>
          </div>
          <UpcomingEvents events={upcomingEvents} />
        </div>

        {/* Quick Insights */}
        <div className="dashboard-home__insights-section">
          <h2>Szybkie spostrzeżenia</h2>
          <div className="dashboard-home__insights">
            <div className="dashboard-home__insight">
              <div className="dashboard-home__insight-icon dashboard-home__insight-icon--success">
                <CheckCircle size={20} />
              </div>
              <div>
                <h3>Świetny wskaźnik odpowiedzi!</h3>
                <p>78% gości odpowiedziało na zaproszenia w tym miesiącu</p>
              </div>
            </div>
            
            <div className="dashboard-home__insight">
              <div className="dashboard-home__insight-icon dashboard-home__insight-icon--warning">
                <Clock size={20} />
              </div>
              <div>
                <h3>Pamiętaj o nadchodzących wydarzeniach</h3>
                <p>Masz 2 wydarzenia w przyszłym tygodniu</p>
              </div>
            </div>
            
            {user?.planType === 'starter' && (
              <div className="dashboard-home__insight">
                <div className="dashboard-home__insight-icon dashboard-home__insight-icon--info">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <h3>Rozważ upgrade do Pro</h3>
                  <p>Odblokuj większe wydarzenia i zaawansowane funkcje</p>
                  <Link to="/dashboard/settings" className="dashboard-home__upgrade-link">
                    Sprawdź plany
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;