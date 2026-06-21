// components/dashboard/DashboardHome/DashboardHome.tsx
import React, { Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPin, Calendar, ArrowRight, Sparkles, Users } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { Activity as ActivityType } from '../../../types';
import './DashboardHome.scss';
import KeyMetrics from './KeyMetrics';
import DashboardAttention from './DashboardAttention';
import EventReadinessPanel from './EventReadinessPanel';
import QuickActions from '../QuickActions/QuickActions';
import LoadingSpinner from '../../common/LoadingSpinner/LoadingSpinner';
import { useDashboardViewMotion } from '../../../hooks/useDashboardViewMotion';
import { useDashboardHomeData } from '../../../hooks/useDashboardHomeData';
import { useInViewport } from '../../../hooks/useInViewport';
import DashboardViewSkeleton from '../DashboardViewSkeleton/DashboardViewSkeleton';
import DashboardViewBody from '../DashboardViewBody/DashboardViewBody';

const EventsMap = React.lazy(() => import('../EventsMap/EventsMap'));
const CompactCalendar = lazy(
  () => import('../EventsCalendar/CompactCalendar')
);
const ActivityWeather = lazy(() => import('./ActivityWeather'));

const SectionFallback = () => (
  <div className="dashboard-home__section-loading" aria-busy="true" />
);

const getDateLocale = (language: string) =>
  language.startsWith('en') ? 'en-GB' : 'pl-PL';

const DashboardHome: React.FC = () => {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const dateLocale = getDateLocale(i18n.language);

  const {
    stats,
    totalContacts,
    activities,
    calendarEvents,
    mapEvents,
    upcomingEvents,
    isInitialLoading,
  } = useDashboardHomeData(user?.id);

  const {
    showLoader,
    showContent,
    className: viewClassName,
    finishLoading,
    resetLoading,
  } = useDashboardViewMotion({
    variant: 'async',
    pageClass: 'dashboard-home',
  });

  const { ref: pulseRef, isVisible: isPulseVisible } = useInViewport({
    rootMargin: '160px',
  });
  const { ref: mapRef, isVisible: isMapVisible } = useInViewport({
    rootMargin: '200px',
  });

  React.useEffect(() => {
    if (user?.id) {
      resetLoading();
    }
  }, [user?.id, resetLoading]);

  React.useEffect(() => {
    if (!isInitialLoading) {
      finishLoading();
    }
  }, [isInitialLoading, finishLoading]);

  const nextEvent = React.useMemo(() => {
    if (!upcomingEvents.length) return null;
    return upcomingEvents[0];
  }, [upcomingEvents]);

  const weatherNextEvent = React.useMemo(() => {
    if (!nextEvent) return null;
    return {
      id: nextEvent.id,
      title: nextEvent.title,
      date: nextEvent.date,
      location: nextEvent.location,
      latitude: nextEvent.latitude,
      longitude: nextEvent.longitude,
      guestCount: nextEvent.guestCount,
    };
  }, [nextEvent]);

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

    return activities.filter((activity: ActivityType) =>
      allowedActivityTypes.includes(activity.type)
    );
  }, [activities]);

  const getGreeting = (firstName?: string) => {
    if (!firstName) return t('dashboardHome.greetingHello');
    const hour = new Date().getHours();
    const timeOfDay =
      hour < 12
        ? t('dashboardHome.greetingMorning')
        : hour < 18
          ? t('dashboardHome.greetingAfternoon')
          : t('dashboardHome.greetingEvening');
    return `${timeOfDay}, ${firstName}`;
  };

  const formatToday = () =>
    new Date().toLocaleDateString(dateLocale, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });

  const formatEventDate = (date: Date | string) =>
    new Date(date).toLocaleDateString(dateLocale, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });

  const getDaysUntil = (date: Date | string) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const target = new Date(date);
    target.setHours(0, 0, 0, 0);
    return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  const truncateText = (text: string, max = 48) =>
    text.length > max ? `${text.slice(0, max).trim()}…` : text;

  const daysUntilNext = nextEvent ? getDaysUntil(nextEvent.date) : null;

  return (
    <div className={viewClassName}>
      <DashboardViewBody
        showLoader={showLoader}
        showContent={showContent}
        loader={<DashboardViewSkeleton variant="dashboard" />}
      >
        <header className="dashboard-home__hero">
          <div className="dashboard-home__hero-main">
            <p className="dashboard-home__eyebrow">
              <Sparkles size={14} aria-hidden />
              {formatToday()}
            </p>
            <h1 className="dashboard-home__title">
              {getGreeting(user?.firstName)}
            </h1>
            <p className="dashboard-home__lede">{t('dashboardHome.lede')}</p>
            <p className="dashboard-home__actions-label">
              {t('dashboardHome.quickActionsLabel')}
            </p>
            <QuickActions />
          </div>

          {nextEvent ? (
            <Link
              to={`/dashboard/events/${nextEvent.id}`}
              className="dashboard-home__spotlight"
            >
              <span className="dashboard-home__spotlight-label">
                {t('dashboardHome.spotlightLabel')}
              </span>
              <h2 className="dashboard-home__spotlight-title">
                {nextEvent.title}
              </h2>
              <div className="dashboard-home__spotlight-meta">
                <span>
                  <Calendar size={15} aria-hidden />
                  {formatEventDate(nextEvent.date)}
                </span>
                {nextEvent.location && (
                  <span title={nextEvent.location}>
                    <MapPin size={15} aria-hidden />
                    {truncateText(nextEvent.location)}
                  </span>
                )}
                {nextEvent.guestCount > 0 && (
                  <span>
                    <Users size={15} aria-hidden />
                    {t('dashboardHome.guest', { count: nextEvent.guestCount })}
                  </span>
                )}
              </div>
              <div className="dashboard-home__spotlight-footer">
                {daysUntilNext !== null && daysUntilNext >= 0 && (
                  <span className="dashboard-home__spotlight-countdown">
                    {daysUntilNext === 0
                      ? t('dashboardHome.countdownToday')
                      : daysUntilNext === 1
                        ? t('dashboardHome.countdownTomorrow')
                        : t('dashboardHome.countdownDays', {
                            count: daysUntilNext,
                          })}
                  </span>
                )}
                <span className="dashboard-home__spotlight-cta">
                  {t('dashboardHome.spotlightOpen')}
                  <ArrowRight size={16} aria-hidden />
                </span>
              </div>
            </Link>
          ) : (
            <div className="dashboard-home__spotlight dashboard-home__spotlight--empty">
              <span className="dashboard-home__spotlight-label">
                {t('dashboardHome.spotlightEmptyTitle')}
              </span>
              <p>{t('dashboardHome.spotlightEmptyDesc')}</p>
              <Link
                to="/dashboard/events/create"
                className="dashboard-home__spotlight-cta dashboard-home__spotlight-cta--solo"
              >
                {t('dashboardHome.spotlightEmptyCta')}
                <ArrowRight size={16} aria-hidden />
              </Link>
            </div>
          )}
          {nextEvent && (
            <EventReadinessPanel
              className="dashboard-home__readiness"
              event={nextEvent}
              planType={user?.planType as 'starter' | 'pro' | 'enterprise' | undefined}
              totalEvents={stats?.totalEvents ?? 0}
            />
          )}
        </header>

        <DashboardAttention
          pendingGuests={stats?.pendingGuests ?? 0}
          nextEvent={nextEvent}
          planType={user?.planType as 'starter' | 'pro' | 'enterprise' | undefined}
          totalEvents={stats?.totalEvents ?? 0}
          totalContacts={totalContacts}
        />

        <section
          className="dashboard-home__metrics"
          aria-label={t('dashboardHome.metricsAria')}
        >
          <KeyMetrics
            totalEvents={stats?.totalEvents ?? 0}
            eventsThisMonth={stats?.eventsThisMonth ?? 0}
            responseRate={stats?.responseRate ?? 0}
            totalContacts={totalContacts}
            activeEvents={stats?.activeEvents ?? 0}
            completedEvents={stats?.completedEvents ?? 0}
            acceptedGuests={stats?.acceptedGuests ?? 0}
            pendingGuests={stats?.pendingGuests ?? 0}
            declinedGuests={stats?.declinedGuests ?? 0}
            planType={user?.planType as 'starter' | 'pro' | 'enterprise' | undefined}
          />
        </section>

        <div className="dashboard-home__bento">
          <div className="dashboard-home__bento-head">
            <h2 className="dashboard-home__section-title">
              {t('dashboardHome.calendarSection')}
            </h2>
            <p className="dashboard-home__section-desc">
              {t('dashboardHome.calendarDesc')}
            </p>
          </div>

          <section
            className="dashboard-home__bento-cell dashboard-home__bento-cell--calendar"
            aria-label={t('dashboardHome.calendarAria')}
          >
            <Suspense fallback={<SectionFallback />}>
              <CompactCalendar
                events={calendarEvents}
                excludeEventId={nextEvent?.id}
              />
            </Suspense>
          </section>

          <section
            ref={pulseRef}
            className="dashboard-home__bento-cell dashboard-home__bento-cell--pulse"
            aria-label={t('dashboardHome.pulseAria')}
          >
            {isPulseVisible ? (
              <Suspense fallback={<SectionFallback />}>
                <ActivityWeather
                  lastActivity={filteredActivities[0]}
                  nextEvent={weatherNextEvent}
                  fetchWeather={isPulseVisible}
                />
              </Suspense>
            ) : (
              <SectionFallback />
            )}
          </section>

          <section
            ref={mapRef}
            className="dashboard-home__bento-cell dashboard-home__bento-cell--map"
            aria-label={t('dashboardHome.mapAria')}
          >
            <div className="dashboard-home__map-head">
              <div className="dashboard-home__map-head-icon">
                <MapPin size={18} aria-hidden />
              </div>
              <div>
                <h2>{t('dashboardHome.mapTitle')}</h2>
                <p>
                  {mapEvents.length > 0
                    ? t('dashboardHome.mapDescWithEvents')
                    : t('dashboardHome.mapDescEmpty')}
                </p>
              </div>
            </div>
            {isMapVisible ? (
              <Suspense
                fallback={
                  <div className="dashboard-home__map-loading">
                    <LoadingSpinner
                      variant="simple"
                      icon={<MapPin />}
                      title={t('dashboardHome.mapLoading')}
                    />
                  </div>
                }
              >
                <EventsMap events={mapEvents} />
              </Suspense>
            ) : (
              <div className="dashboard-home__map-deferred" aria-hidden="true">
                <MapPin size={28} opacity={0.25} />
                <p>{t('dashboardHome.mapDeferred')}</p>
              </div>
            )}
          </section>
        </div>
      </DashboardViewBody>
    </div>
  );
};

export default DashboardHome;
