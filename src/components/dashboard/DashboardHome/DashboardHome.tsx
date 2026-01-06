// components/dashboard/DashboardHome/DashboardHome.tsx
import React, { Suspense } from 'react';
import {
  EventService,
  EventStats,
} from '../../../services/firebase/eventService';
import { useAuth } from '../../../hooks/useAuth';
import { Activity as ActivityType, Event } from '../../../types';
import './DashboardHome.scss';
import KeyMetrics from './KeyMetrics';
import KeyMetricsSkeleton from './KeyMetricsSkeleton';
import ActivityWeather from './ActivityWeather';
import ActivityWeatherSkeleton from './ActivityWeatherSkeleton';
import QuickActions from '../QuickActions/QuickActions';
import QuickActionsSkeleton from '../QuickActions/QuickActionsSkeleton';
import CompactCalendar from '../EventsCalendar/CompactCalendar';
import CalendarSkeleton from './CalendarSkeleton';
import MapSkeleton from './MapSkeleton';

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

  // Fetch activities and events
  React.useEffect(() => {
    if (user?.id) {
      // Fetch recent activities
      setIsLoadingActivities(true);
      EventService.getRecentActivities(user.id, 10)
        .then(setActivities)
        .catch((error) => {
          console.error('Error fetching activities:', error);
          setActivities([]);
        })
        .finally(() => setIsLoadingActivities(false));

      // Fetch all events
      setIsLoadingEvents(true);
      EventService.getUserEvents(user.id)
        .then((result) => {
          if (result.events) {
            const now = new Date();

            // All events with location for map
            const all = result.events.filter(
              (event) => event.location && event.location.trim()
            );
            setAllEvents(all);

            // Only upcoming events
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

  return (
    <div className="dashboard-home">
      {/* Header */}
      <div className="dashboard-home__header">
        <h1>Przegląd</h1>
        <p>Twoje wydarzenia w skrócie</p>
      </div>

      {/* Quick Actions */}
      {isLoadingStats ? (
        <div className="fade-out"><QuickActionsSkeleton /></div>
      ) : (
        <div className="fade-in"><QuickActions /></div>
      )}

      {/* Top Grid: Key Metrics */}
      <div className="dashboard-home__top-grid">
        {/* Key Metrics */}
        {isLoadingStats ? (
          <div className="fade-out"><KeyMetricsSkeleton /></div>
        ) : (
          <div className="fade-in">
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
        )}
      </div>

      {/* Calendar Section */}
      <div className="dashboard-home__section dashboard-home__section--calendar">
        {isLoadingEvents ? (
          <div className="fade-out"><CalendarSkeleton /></div>
        ) : (
          <div className="fade-in"><CompactCalendar events={allEvents} /></div>
        )}
      </div>

      {/* Activity & Weather */}
      {isLoadingActivities || isLoadingEvents ? (
        <div className="fade-out"><ActivityWeatherSkeleton /></div>
      ) : (
        <div className="fade-in">
          <ActivityWeather
            lastActivity={filteredActivities[0]}
            nextEvent={nextEvent}
          />
        </div>
      )}

      {/* Map Section */}
      <div className="dashboard-home__section dashboard-home__section--map">
        <div className="dashboard-home__section-header">
          <h2>Mapa wydarzeń</h2>
        </div>
        <Suspense fallback={<MapSkeleton />}>
          <EventsMap events={allEvents} />
        </Suspense>
      </div>
    </div>
  );
};

export default DashboardHome;
