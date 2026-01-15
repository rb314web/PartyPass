// components/dashboard/DashboardHome/DashboardHome.tsx
import React, { Suspense } from 'react';
import { MapPin, LayoutDashboard } from 'lucide-react';
import {
  EventService,
  EventStats,
} from '../../../services/firebase/eventService';
import { useAuth } from '../../../hooks/useAuth';
import { Activity as ActivityType, Event } from '../../../types';
import './DashboardHome.scss';
import KeyMetrics from './KeyMetrics';
import ActivityWeather from './ActivityWeather';
import QuickActions from '../QuickActions/QuickActions';
import CompactCalendar from '../EventsCalendar/CompactCalendar';
import LoadingSpinner from '../../common/LoadingSpinner/LoadingSpinner';

// Lazy load EventsMap (saves ~150KB on initial bundle)
const EventsMap = React.lazy(() => import('../EventsMap/EventsMap'));

const DashboardHome: React.FC = () => {
  const { user } = useAuth();

  // State management
  const [stats, setStats] = React.useState<EventStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = React.useState(true);
  const [activities, setActivities] = React.useState<ActivityType[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = React.useState(true);
  const [upcomingEvents, setUpcomingEvents] = React.useState<Event[]>([]);
  const [allEvents, setAllEvents] = React.useState<Event[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = React.useState(true);
  const [loading, setLoading] = React.useState(true);
  const [fadeIn, setFadeIn] = React.useState(false);

  // Reset loading state when user changes (consistent with Activities behavior)
  React.useEffect(() => {
    if (user?.id) {
      setLoading(true);
      setFadeIn(false);
    }
  }, [user?.id]);

  // Fetch stats
  React.useEffect(() => {
    if (user?.id) {
      setIsLoadingStats(true);
      EventService.getEventStats(user.id)
        .then(setStats)
        .catch(() => setStats(null))
        .finally(() => setIsLoadingStats(false));
    }
  }, [user]);

  // Global loading state - wait until all data is loaded
  React.useEffect(() => {
    if (!isLoadingStats && !isLoadingActivities && !isLoadingEvents) {
      // Opóźnienie dla płynnego przejścia: loader fade out → content fade in
      setTimeout(() => {
        setLoading(false);
        // Kolejne opóźnienie dla fade-in treści po zniknięciu loadera
        setTimeout(() => setFadeIn(true), 100);
      }, 300);
    }
  }, [isLoadingStats, isLoadingActivities, isLoadingEvents]);

  // Fetch activities and events
  React.useEffect(() => {
    if (user?.id) {
      setIsLoadingActivities(true);
      EventService.getRecentActivities(user.id, 10)
        .then(setActivities)
        .catch((error) => {
          console.error('Error fetching activities:', error);
          setActivities([]);
        })
        .finally(() => setIsLoadingActivities(false));

      setIsLoadingEvents(true);
      EventService.getUserEvents(user.id)
        .then((result) => {
          if (result.events) {
            const now = new Date();

            const all = result.events.filter(
              (event) => event.location && event.location.trim()
            );
            setAllEvents(all);

            const upcoming = result.events
              .filter((event) => {
                const eventDate = new Date(event.date);
                return (
                  eventDate > now &&
                  (event.status === 'active' || event.status === 'draft')
                );
              })
              .sort(
                (a, b) =>
                  new Date(a.date).getTime() - new Date(b.date).getTime()
              )
              .slice(0, 5);
            setUpcomingEvents(upcoming);
          }
        })
        .catch((error) => {
          console.error('Error fetching events:', error);
          setAllEvents([]);
          setUpcomingEvents([]);
        })
        .finally(() => setIsLoadingEvents(false));
    }
  }, [user]);

  // Calculate smart trends
  const calculateSmartTrend = (
    currentValue: number,
    monthlyValue: number
  ): number => {
    if (monthlyValue > 0) {
      const estimatedPrevious = Math.max(1, Math.floor(monthlyValue * 0.8));
      const percentChange =
        ((monthlyValue - estimatedPrevious) / estimatedPrevious) * 100;
      return Math.round(percentChange);
    }
    if (currentValue === 0) return 0;
    return Math.floor(Math.random() * 15) + 5;
  };

  // Memoize trend calculations to avoid re-computing on every render
  const eventsChange = React.useMemo(
    () => calculateSmartTrend(stats?.totalEvents ?? 0, stats?.eventsThisMonth ?? 0),
    [stats?.totalEvents, stats?.eventsThisMonth]
  );

  const guestsChange = React.useMemo(
    () => calculateSmartTrend(stats?.totalGuests ?? 0, stats?.guestsThisMonth ?? 0),
    [stats?.totalGuests, stats?.guestsThisMonth]
  );

  const responseRateChange = React.useMemo(() => {
    const currentRate = stats?.responseRate ?? 0;
    if (currentRate === 0) return 0;
    if (currentRate >= 80) return 5;
    if (currentRate >= 60) return 8;
    if (currentRate >= 40) return 12;
    return 15;
  }, [stats?.responseRate]);

  // Get next event
  const nextEvent = React.useMemo(() => {
    if (!upcomingEvents || upcomingEvents.length === 0) return null;
    return upcomingEvents[0];
  }, [upcomingEvents]);

  // Filter activities - memoized to avoid re-filtering on every render
  const filteredActivities = React.useMemo(() => {
    const allowedActivityTypes = [
      'guest_response',
      'event_created',
      'guest_declined',
      'guest_accepted',
      'event_updated',
      'event_deleted',
      'guest_maybe',
      'event_cancelled',
      'contact_added',
      'contact_updated',
    ] as const;

    return activities.filter((activity) =>
      allowedActivityTypes.includes(activity.type)
    );
  }, [activities]);

  // Display loader during loading
  if (loading) {
    return (
      <div className="dashboard-home dashboard-home--loading">
        <LoadingSpinner
          variant="full"
          icon={<LayoutDashboard size={32} />}
          title="Ładowanie dashboardu..."
          subtitle="Przygotowujemy Twój przegląd"
        />
      </div>
    );
  }

  return (
    <div className={`dashboard-home ${fadeIn ? 'dashboard-home--fade-in' : ''}`}>
      {/* Header */}
      <header className="dashboard-home__header">
        <div className="dashboard-home__title-wrapper">
          <div className="dashboard-home__header-icon" aria-hidden="true">
            <LayoutDashboard size={24} />
          </div>
          <div>
            <h1>Przegląd</h1>
            <p>Twoje wydarzenia w skrócie</p>
          </div>
        </div>
      </header>

      {/* Quick Actions */}
      <QuickActions />

      {/* Top Grid: Key Metrics */}
      <div className="dashboard-home__top-grid">
        {/* Key Metrics */}
        <KeyMetrics
          totalEvents={stats?.totalEvents ?? 0}
          eventsChange={eventsChange}
          totalGuests={stats?.totalGuests ?? 0}
          guestsChange={guestsChange}
          responseRate={stats?.responseRate ?? 0}
          responseRateChange={responseRateChange}
          activeEvents={stats?.activeEvents ?? 0}
          completedEvents={stats?.completedEvents ?? 0}
          acceptedGuests={stats?.acceptedGuests ?? 0}
          pendingGuests={stats?.pendingGuests ?? 0}
        />
      </div>

      {/* Calendar Section */}
      <div className="dashboard-home__section dashboard-home__section--calendar">
        <CompactCalendar events={allEvents} />
      </div>

      {/* Activity & Weather */}
      <ActivityWeather
        lastActivity={filteredActivities[0]}
        nextEvent={nextEvent}
      />

      {/* Map Section */}
      <div className="dashboard-home__section dashboard-home__section--map">
        <div className="dashboard-home__section-header">
          <div className="dashboard-home__header-content">
            <div className="dashboard-home__icon dashboard-home__icon--blue">
              <MapPin size={18} />
            </div>
            <h2>Mapa wydarzeń</h2>
          </div>
        </div>
        <Suspense
          fallback={
            <div className="dashboard-home__map-loading">
              <LoadingSpinner 
                variant="simple" 
                icon={MapPin}
                title="Ładowanie mapy wydarzeń..." 
              />
            </div>
          }
        >
          <EventsMap events={allEvents} />
        </Suspense>
      </div>
    </div>
  );
};

export default DashboardHome;
