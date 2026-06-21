import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { queryKeys } from '../config/queryClient';
import { EventService } from '../services/firebase/eventService';
import { ContactService } from '../services/firebase/contactService';
import { EventGuestService } from '../services/firebase/eventGuestService';
import type { Activity, Event } from '../types';

export function useDashboardHomeData(userId?: string) {
  const enabled = Boolean(userId);

  const [statsQuery, contactsQuery, activitiesQuery, eventsQuery] = useQueries({
    queries: [
      {
        queryKey: queryKeys.dashboardStats(userId ?? ''),
        queryFn: () => EventService.getEventStats(userId!),
        enabled,
      },
      {
        queryKey: queryKeys.dashboardContactCount(userId ?? ''),
        queryFn: () => ContactService.getContactCount(userId!),
        enabled,
      },
      {
        queryKey: queryKeys.dashboardActivities(userId ?? ''),
        queryFn: () => EventService.getRecentActivities(userId!, 10),
        enabled,
      },
      {
        queryKey: queryKeys.dashboardEvents(userId ?? ''),
        queryFn: async () => {
          const result = await EventService.getUserEvents(userId!);
          const events = result.events ?? [];
          if (!events.length) return events;

          const countsByEvent = await EventGuestService.getRsvpCountsForEvents(
            events.map(event => event.id)
          );

          return events.map(event => {
            const counts = countsByEvent.get(event.id);
            if (!counts) return event;
            return {
              ...event,
              guestCount: counts.guestCount,
              acceptedCount: counts.acceptedCount,
              pendingCount: counts.pendingCount,
              declinedCount: counts.declinedCount,
            };
          });
        },
        enabled,
      },
    ],
  });

  const events = eventsQuery.data ?? [];

  const { calendarEvents, mapEvents, upcomingEvents } = useMemo(() => {
    const now = new Date();

    return {
      calendarEvents: events.filter(
        (event: Event) => event.status !== 'cancelled'
      ),
      mapEvents: events.filter(
        (event: Event) => event.location && event.location.trim()
      ),
      upcomingEvents: events
        .filter((event: Event) => {
          const eventDate = new Date(event.date);
          return eventDate > now && event.status === 'active';
        })
        .sort(
          (a: Event, b: Event) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
        )
        .slice(0, 5),
    };
  }, [events]);

  const isInitialLoading =
    enabled &&
    (statsQuery.isPending ||
      contactsQuery.isPending ||
      activitiesQuery.isPending ||
      eventsQuery.isPending);

  return {
    stats: statsQuery.data ?? null,
    totalContacts: contactsQuery.data ?? 0,
    activities: (activitiesQuery.data ?? []) as Activity[],
    calendarEvents,
    mapEvents,
    upcomingEvents,
    isInitialLoading,
    isError:
      statsQuery.isError ||
      contactsQuery.isError ||
      eventsQuery.isError,
  };
}
