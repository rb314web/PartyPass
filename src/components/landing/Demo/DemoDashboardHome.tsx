import React, { Suspense, lazy } from 'react';
import { LayoutDashboard, MapPin } from 'lucide-react';
import PageHeader from '../../common/PageHeader/PageHeader';
import QuickActions from '../../dashboard/QuickActions/QuickActions';
import KeyMetrics from '../../dashboard/DashboardHome/KeyMetrics';
import LoadingSpinner from '../../common/LoadingSpinner/LoadingSpinner';
import {
  demoCalendarEvents,
  demoLastActivity,
  demoNextEvent,
  demoStats,
} from './demoDashboardData';
import '../../dashboard/DashboardHome/DashboardHome.scss';

const EventsMap = lazy(() => import('../../dashboard/EventsMap/EventsMap'));
const CompactCalendar = lazy(
  () => import('../../dashboard/EventsCalendar/CompactCalendar')
);
const ActivityWeather = lazy(
  () => import('../../dashboard/DashboardHome/ActivityWeather')
);

const SectionFallback = () => (
  <div className="dashboard-home__section-loading" aria-busy="true" />
);

const DemoDashboardHome: React.FC = () => (
  <div className="dashboard-home">
    <PageHeader
      title="Przegląd"
      subtitle="Twoje wydarzenia w skrócie"
      icon={LayoutDashboard}
      className="dashboard-home__header"
    />

    <QuickActions />

    <div className="dashboard-home__top-grid">
      <KeyMetrics
        totalEvents={demoStats.totalEvents}
        eventsThisMonth={demoStats.eventsThisMonth}
        totalContacts={demoStats.totalContacts}
        responseRate={demoStats.responseRate}
        activeEvents={demoStats.activeEvents}
        completedEvents={demoStats.completedEvents}
        acceptedGuests={demoStats.acceptedGuests}
        pendingGuests={demoStats.pendingGuests}
        declinedGuests={demoStats.declinedGuests}
        planType="pro"
      />
    </div>

    <div className="dashboard-home__section dashboard-home__section--calendar">
      <Suspense fallback={<SectionFallback />}>
        <CompactCalendar
          events={demoCalendarEvents}
          excludeEventId={demoNextEvent?.id}
        />
      </Suspense>
    </div>

    <Suspense fallback={<SectionFallback />}>
      <ActivityWeather
        lastActivity={demoLastActivity}
        nextEvent={demoNextEvent ?? null}
      />
    </Suspense>

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
              icon={<MapPin />}
              title="Ładowanie mapy wydarzeń..."
            />
          </div>
        }
      >
        <EventsMap events={demoCalendarEvents} />
      </Suspense>
    </div>
  </div>
);

export default DemoDashboardHome;
