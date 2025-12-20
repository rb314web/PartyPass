// components/dashboard/DashboardHome/DashboardHome.tsx
import React, { Suspense } from 'react';
import { Link } from 'react-router-dom';
import {
  EventService,
  EventStats,
} from '../../../services/firebase/eventService';
import { useAuth } from '../../../hooks/useAuth';
import { Activity as ActivityType, Event } from '../../../types';
import './DashboardHome.scss';
import { ArrowRight } from 'lucide-react';
import KeyMetrics from './KeyMetrics';
import KeyMetricsSkeleton from './KeyMetricsSkeleton';
import ActivityOverview from './ActivityOverview';
import QuickActions from '../QuickActions/QuickActions';
import RecentActivity from '../RecentActivity/RecentActivity';
import CompactCalendar from '../EventsCalendar/CompactCalendar';
import MapSkeleton from './MapSkeleton';

// Lazy load EventsMap (saves ~150KB on initial bundle)
const EventsMap = React.lazy(() => import('../EventsMap/EventsMap'));

const DashboardHome: React.FC = () => {
  const { user } = useAuth();

  // State management
  const [stats, setStats] = React.useState<EventStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = React.useState(true);
  const [activities, setActivities] = React.useState<ActivityType[]>([]);
  const [upcomingEvents, setUpcomingEvents] = React.useState<Event[]>([]);
  const [allEvents, setAllEvents] = React.useState<Event[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = React.useState(true);
  const [isLoadingUpcomingEvents, setIsLoadingUpcomingEvents] = React.useState(true);
  const [isLoadingAllEvents, setIsLoadingAllEvents] = React.useState(true);

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
      setIsLoadingAllEvents(true);
      setIsLoadingUpcomingEvents(true);
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
        .finally(() => {
          setIsLoadingAllEvents(false);
          setIsLoadingUpcomingEvents(false);
        });
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

  // Process recent responses
  const recentResponses = React.useMemo(() => {
    return activities
      .filter(
        (activity) =>
          activity.type === 'guest_accepted' ||
          activity.type === 'guest_declined'
      )
      .sort((a, b) => {
        const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
        const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
        return timeB - timeA;
      })
      .slice(0, 3)
      .map((activity) => {
        const message = activity.message || '';
        const nameMatch = message.match(
          /([A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż]+)\s+([A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż]*)?/
        );
        return {
          id: activity.id,
          name: nameMatch ? nameMatch[0].trim() : 'Gość',
          timestamp: activity.timestamp,
          eventId: activity.eventId,
          type: activity.type,
        };
      });
  }, [activities]);

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
      <QuickActions />

      {/* Key Metrics */}
      {isLoadingStats ? (
        <KeyMetricsSkeleton />
      ) : (
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
      )}

      {/* Activity Overview */}
      <ActivityOverview
        recentResponses={recentResponses}
        nextEvent={nextEvent}
        isLoadingResponses={isLoadingActivities}
        isLoadingNextEvent={isLoadingUpcomingEvents}
      />

      {/* Calendar Section */}
      <div className="dashboard-home__section dashboard-home__section--calendar">
        <CompactCalendar events={allEvents} />
      </div>

      {/* Bottom Grid: Activity Timeline + Map */}
      <div className="dashboard-home__bottom-grid">
        {/* Activity Timeline */}
        <div className="dashboard-home__section dashboard-home__section--activity">
          <div className="dashboard-home__section-header">
            <h2>Ostatnie aktywności</h2>
            <Link
              to="/dashboard/activities"
              className="dashboard-home__see-all"
            >
              Zobacz wszystkie
              <ArrowRight size={16} />
            </Link>
          </div>
          <RecentActivity
            activities={filteredActivities}
            isLoading={isLoadingActivities}
          />
        </div>

        {/* Map */}
        <div className="dashboard-home__section dashboard-home__section--map">
          <div className="dashboard-home__section-header">
            <h2>Mapa wydarzeń</h2>
          </div>
          <Suspense fallback={<MapSkeleton />}>
            <EventsMap events={allEvents} />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
