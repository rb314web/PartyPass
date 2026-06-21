import { Activity, Event } from '../../../types';

const demoUserId = 'demo-user';

export const demoCalendarEvents: Event[] = [
  {
    id: 'demo-1',
    userId: demoUserId,
    title: 'Urodziny Marii',
    description: 'Wieczór urodzinowy z przyjaciółmi',
    date: new Date('2026-06-14T20:00:00'),
    location: 'ul. Nowogrodzka 12, Warszawa',
    latitude: 52.2297,
    longitude: 21.0122,
    maxGuests: 35,
    status: 'active',
    createdAt: new Date('2026-05-01'),
    guestCount: 28,
    acceptedCount: 24,
    pendingCount: 4,
    declinedCount: 0,
    maybeCount: 0,
  },
  {
    id: 'demo-2',
    userId: demoUserId,
    title: 'Meetup Product Design',
    description: 'Spotkanie społeczności produktowej',
    date: new Date('2026-06-22T18:30:00'),
    location: 'Hub Warsaw, Warszawa',
    latitude: 52.237,
    longitude: 21.0175,
    maxGuests: 60,
    status: 'active',
    createdAt: new Date('2026-05-10'),
    guestCount: 42,
    acceptedCount: 38,
    pendingCount: 4,
    declinedCount: 0,
    maybeCount: 0,
  },
  {
    id: 'demo-3',
    userId: demoUserId,
    title: 'Wesele Ani i Tomka',
    description: 'Ceremonia i przyjęcie weselne',
    date: new Date('2026-07-05T15:00:00'),
    location: 'Pałacyk w Wilanowie, Warszawa',
    latitude: 52.1657,
    longitude: 21.0873,
    maxGuests: 120,
    status: 'active',
    createdAt: new Date('2026-04-20'),
    guestCount: 86,
    acceptedCount: 52,
    pendingCount: 34,
    declinedCount: 0,
    maybeCount: 0,
  },
  {
    id: 'demo-4',
    userId: demoUserId,
    title: 'Spotkanie świąteczne',
    description: 'Integracja zespołu',
    date: new Date('2025-12-20T18:00:00'),
    location: 'Biuro PartyPass, Kraków',
    latitude: 50.0647,
    longitude: 19.945,
    maxGuests: 30,
    status: 'completed',
    createdAt: new Date('2025-11-01'),
    guestCount: 24,
    acceptedCount: 24,
    pendingCount: 0,
    declinedCount: 0,
    maybeCount: 0,
  },
];

export const demoStats = {
  totalEvents: 8,
  eventsThisMonth: 2,
  totalContacts: 142,
  responseRate: 78,
  activeEvents: 5,
  completedEvents: 3,
  acceptedGuests: 142,
  pendingGuests: 34,
  declinedGuests: 12,
};

export const demoLastActivity: Activity = {
  id: 'demo-activity-1',
  type: 'guest_accepted',
  message: 'Maria Nowak potwierdziła obecność na „Urodziny Marii”',
  timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
  eventId: 'demo-1',
};

export const demoNextEvent = demoCalendarEvents.find(
  event => event.status === 'active'
);

export const demoActivities: Activity[] = [
  demoLastActivity,
  {
    id: 'demo-activity-2',
    type: 'event_created',
    message: 'Utworzono wydarzenie „Meetup Product Design”',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    eventId: 'demo-2',
  },
  {
    id: 'demo-activity-3',
    type: 'contact_added',
    message: 'Dodano kontakt: Kasia Lewandowska',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
  {
    id: 'demo-activity-4',
    type: 'event_created',
    message: 'Utworzono wydarzenie „Wesele Ani i Tomka”',
    timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000),
    eventId: 'demo-3',
  },
];
