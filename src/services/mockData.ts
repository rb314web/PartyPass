// services/mockData.ts
import { Event, Guest, Activity } from '../types';

// Mock Events Data
export const mockEvents: Event[] = [
  {
    id: '1',
    userId: '1',
    title: 'Urodziny Ani - 25 lat',
    description: 'Wielka impreza urodzinowa w ogrodzie z muzyką na żywo, grillowaniem i tortem. Przyjdź i świętuj razem z nami ten wyjątkowy dzień!',
    date: new Date('2024-08-20T19:00:00'),
    location: 'Ogród przy ul. Słonecznej 15, Warszawa',
    maxGuests: 50,
    status: 'active',
    createdAt: new Date('2024-07-15'),
    guests: [
      {
        id: '1',
        eventId: '1',
        email: 'jan.kowalski@example.com',
        firstName: 'Jan',
        lastName: 'Kowalski',
        status: 'accepted',
        invitedAt: new Date('2024-07-16'),
        respondedAt: new Date('2024-07-17')
      },
      {
        id: '2',
        eventId: '1',
        email: 'maria.nowak@example.com',
        firstName: 'Maria',
        lastName: 'Nowak',
        status: 'pending',
        invitedAt: new Date('2024-07-16')
      },
      {
        id: '3',
        eventId: '1',
        email: 'piotr.wisniewski@example.com',
        firstName: 'Piotr',
        lastName: 'Wiśniewski',
        status: 'accepted',
        invitedAt: new Date('2024-07-16'),
        respondedAt: new Date('2024-07-18')
      },
      {
        id: '4',
        eventId: '1',
        email: 'anna.kowalczyk@example.com',
        firstName: 'Anna',
        lastName: 'Kowalczyk',
        status: 'declined',
        invitedAt: new Date('2024-07-16'),
        respondedAt: new Date('2024-07-19')
      },
      {
        id: '5',
        eventId: '1',
        email: 'tomasz.lewandowski@example.com',
        firstName: 'Tomasz',
        lastName: 'Lewandowski',
        status: 'maybe',
        invitedAt: new Date('2024-07-16'),
        respondedAt: new Date('2024-07-20')
      }
    ]
  },
  {
    id: '2',
    userId: '1',
    title: 'Spotkanie zespołu IT',
    description: 'Comiesięczne spotkanie zespołu programistów z prezentacjami nowych projektów i planowaniem sprintów.',
    date: new Date('2024-08-10T14:00:00'),
    location: 'Sala konferencyjna B, piętro 3, Biurowiec Central',
    maxGuests: 15,
    status: 'completed',
    createdAt: new Date('2024-07-01'),
    guests: [
      {
        id: '6',
        eventId: '2',
        email: 'adam.kowalczyk@company.com',
        firstName: 'Adam',
        lastName: 'Kowalczyk',
        status: 'accepted',
        invitedAt: new Date('2024-07-02'),
        respondedAt: new Date('2024-07-02')
      },
      {
        id: '7',
        eventId: '2',
        email: 'beata.nowak@company.com',
        firstName: 'Beata',
        lastName: 'Nowak',
        status: 'accepted',
        invitedAt: new Date('2024-07-02'),
        respondedAt: new Date('2024-07-03')
      },
      {
        id: '8',
        eventId: '2',
        email: 'carlos.garcia@company.com',
        firstName: 'Carlos',
        lastName: 'Garcia',
        status: 'accepted',
        invitedAt: new Date('2024-07-02'),
        respondedAt: new Date('2024-07-04')
      }
    ]
  },
  {
    id: '3',
    userId: '1',
    title: 'Warsztaty fotograficzne',
    description: 'Warsztaty dla początkujących i średniozaawansowanych fotografów. Nauka kompozycji, światła i post-processingu.',
    date: new Date('2024-08-25T10:00:00'),
    location: 'Studio Foto Artystyczne, ul. Krakowska 8, Warszawa',
    maxGuests: 12,
    status: 'draft',
    createdAt: new Date('2024-08-01'),
    guests: []
  },
  {
    id: '4',
    userId: '1',
    title: 'Prezentacja produktu Q3',
    description: 'Oficjalna prezentacja nowych funkcji produktu dla klientów i partnerów biznesowych.',
    date: new Date('2024-09-15T16:00:00'),
    location: 'Hotel Marriott, Sala Konferencyjna A, Warszawa',
    maxGuests: 100,
    status: 'active',
    createdAt: new Date('2024-08-05'),
    guests: [
      {
        id: '9',
        eventId: '4',
        email: 'director@client1.com',
        firstName: 'Robert',
        lastName: 'Johnson',
        status: 'accepted',
        invitedAt: new Date('2024-08-06'),
        respondedAt: new Date('2024-08-07')
      },
      {
        id: '10',
        eventId: '4',
        email: 'manager@client2.com',
        firstName: 'Sarah',
        lastName: 'Williams',
        status: 'pending',
        invitedAt: new Date('2024-08-06')
      },
      {
        id: '11',
        eventId: '4',
        email: 'ceo@partner1.com',
        firstName: 'Michael',
        lastName: 'Brown',
        status: 'accepted',
        invitedAt: new Date('2024-08-06'),
        respondedAt: new Date('2024-08-08')
      }
    ]
  },
  {
    id: '5',
    userId: '1',
    title: 'Wieczór karaoke',
    description: 'Relaksujący wieczór ze śpiewaniem, napojami i przyjaciółmi. Każdy może zaprezentować swoje umiejętności wokalne!',
    date: new Date('2024-07-20T20:00:00'),
    location: 'Klub Karaoke "Mikrofon", ul. Nowy Świat 25, Warszawa',
    maxGuests: 25,
    status: 'cancelled',
    createdAt: new Date('2024-06-15'),
    guests: [
      {
        id: '12',
        eventId: '5',
        email: 'ewa.kowalska@example.com',
        firstName: 'Ewa',
        lastName: 'Kowalska',
        status: 'declined',
        invitedAt: new Date('2024-06-16'),
        respondedAt: new Date('2024-06-20')
      },
      {
        id: '13',
        eventId: '5',
        email: 'marcin.nowak@example.com',
        firstName: 'Marcin',
        lastName: 'Nowak',
        status: 'declined',
        invitedAt: new Date('2024-06-16'),
        respondedAt: new Date('2024-06-18')
      }
    ]
  },
  {
    id: '6',
    userId: '1',
    title: 'Szkolenie z marketingu cyfrowego',
    description: 'Intensywne szkolenie z zakresu marketingu cyfrowego, SEO, SEM i social media. Prowadzone przez ekspertów branżowych.',
    date: new Date('2024-09-05T09:00:00'),
    location: 'Centrum Szkoleniowe Digital Hub, ul. Marszałkowska 100, Warszawa',
    maxGuests: 30,
    status: 'active',
    createdAt: new Date('2024-07-20'),
    guests: [
      {
        id: '14',
        eventId: '6',
        email: 'klaudia.zielinska@example.com',
        firstName: 'Klaudia',
        lastName: 'Zielińska',
        status: 'accepted',
        invitedAt: new Date('2024-07-21'),
        respondedAt: new Date('2024-07-22')
      },
      {
        id: '15',
        eventId: '6',
        email: 'rafal.kowalski@example.com',
        firstName: 'Rafał',
        lastName: 'Kowalski',
        status: 'accepted',
        invitedAt: new Date('2024-07-21'),
        respondedAt: new Date('2024-07-23')
      },
      {
        id: '16',
        eventId: '6',
        email: 'monika.wojcik@example.com',
        firstName: 'Monika',
        lastName: 'Wójcik',
        status: 'pending',
        invitedAt: new Date('2024-07-21')
      }
    ]
  }
];

// Mock Statistics
export const mockStats = {
  totalEvents: mockEvents.length,
  activeEvents: mockEvents.filter(e => e.status === 'active').length,
  completedEvents: mockEvents.filter(e => e.status === 'completed').length,
  draftEvents: mockEvents.filter(e => e.status === 'draft').length,
  cancelledEvents: mockEvents.filter(e => e.status === 'cancelled').length,
  totalGuests: mockEvents.reduce((acc, event) => acc + event.guests.length, 0),
  acceptedGuests: mockEvents.reduce((acc, event) => 
    acc + event.guests.filter(guest => guest.status === 'accepted').length, 0
  ),
  pendingGuests: mockEvents.reduce((acc, event) => 
    acc + event.guests.filter(guest => guest.status === 'pending').length, 0
  ),
  declinedGuests: mockEvents.reduce((acc, event) => 
    acc + event.guests.filter(guest => guest.status === 'declined').length, 0
  ),
  responseRate: (() => {
    const totalInvited = mockEvents.reduce((acc, event) => acc + event.guests.length, 0);
    const totalResponded = mockEvents.reduce((acc, event) => 
      acc + event.guests.filter(guest => guest.status !== 'pending').length, 0
    );
    return totalInvited > 0 ? Math.round((totalResponded / totalInvited) * 100) : 0;
  })(),
  eventsThisMonth: mockEvents.filter(event => {
    const eventDate = new Date(event.date);
    const now = new Date();
    return eventDate.getMonth() === now.getMonth() && 
           eventDate.getFullYear() === now.getFullYear();
  }).length,
  guestsThisMonth: mockEvents
    .filter(event => {
      const eventDate = new Date(event.date);
      const now = new Date();
      return eventDate.getMonth() === now.getMonth() && 
             eventDate.getFullYear() === now.getFullYear();
    })
    .reduce((acc, event) => acc + event.guests.length, 0),
  upcomingEvents: mockEvents.filter(event => 
    event.status === 'active' && new Date(event.date) > new Date()
  ).length
};

// Mock Recent Activity
export const mockRecentActivity: Activity[] = [
  {
    id: '1',
    type: 'guest_response' as const,
    message: 'Jan Kowalski potwierdził udział w "Urodziny Ani"',
    timestamp: new Date('2024-08-05T10:30:00'),
    eventId: '1',
    guestId: '1'
  },
  {
    id: '2',
    type: 'event_created' as const,
    message: 'Utworzono nowe wydarzenie "Warsztaty fotograficzne"',
    timestamp: new Date('2024-08-01T15:45:00'),
    eventId: '3'
  },
  {
    id: '3',
    type: 'guest_declined' as const,
    message: 'Anna Kowalczyk odrzuciła zaproszenie na "Urodziny Ani"',
    timestamp: new Date('2024-07-28T09:15:00'),
    eventId: '1',
    guestId: '4'
  },
  {
    id: '4',
    type: 'event_updated' as const,
    message: 'Zaktualizowano szczegóły "Prezentacja produktu Q3"',
    timestamp: new Date('2024-07-25T14:20:00'),
    eventId: '4'
  },
  {
    id: '5',
    type: 'guest_maybe' as const,
    message: 'Tomasz Lewandowski może uczestniczyć w "Urodziny Ani"',
    timestamp: new Date('2024-07-20T16:45:00'),
    eventId: '1',
    guestId: '5'
  },
  {
    id: '6',
    type: 'event_cancelled' as const,
    message: 'Anulowano wydarzenie "Wieczór karaoke"',
    timestamp: new Date('2024-07-18T11:30:00'),
    eventId: '5'
  },
  {
    id: '7',
    type: 'guest_response' as const,
    message: 'Michael Brown potwierdził udział w "Prezentacja produktu Q3"',
    timestamp: new Date('2024-08-08T08:15:00'),
    eventId: '4',
    guestId: '11'
  }
];

// Mock Chart Data for Analytics
export const mockChartData = {
  eventsOverTime: [
    { month: 'Styczeń', events: 2, guests: 25 },
    { month: 'Luty', events: 4, guests: 45 },
    { month: 'Marzec', events: 6, guests: 78 },
    { month: 'Kwiecień', events: 3, guests: 32 },
    { month: 'Maj', events: 8, guests: 95 },
    { month: 'Czerwiec', events: 5, guests: 67 },
    { month: 'Lipiec', events: 7, guests: 89 },
    { month: 'Sierpień', events: 4, guests: 56 }
  ],
  responseRates: [
    { event: 'Urodziny Ani', accepted: 60, declined: 20, maybe: 20 },
    { event: 'Spotkanie IT', accepted: 100, declined: 0, maybe: 0 },
    { event: 'Prezentacja Q3', accepted: 67, declined: 0, maybe: 33 },
    { event: 'Szkolenie marketing', accepted: 67, declined: 0, maybe: 33 }
  ],
  guestStatusDistribution: [
    { status: 'Potwierdzeni', count: mockStats.acceptedGuests, percentage: 45 },
    { status: 'Oczekujący', count: mockStats.pendingGuests, percentage: 30 },
    { status: 'Odrzucili', count: mockStats.declinedGuests, percentage: 15 },
    { status: 'Może być', count: mockEvents.reduce((acc, event) => 
      acc + event.guests.filter(guest => guest.status === 'maybe').length, 0
    ), percentage: 10 }
  ]
};

// Helper functions
export const getEventById = (id: string): Event | undefined => {
  return mockEvents.find(event => event.id === id);
};

export const getGuestsByEventId = (eventId: string): Guest[] => {
  const event = getEventById(eventId);
  return event ? event.guests : [];
};

export const getUpcomingEvents = (limit?: number): Event[] => {
  const upcoming = mockEvents
    .filter(event => event.status === 'active' && new Date(event.date) > new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
  return limit ? upcoming.slice(0, limit) : upcoming;
};

export const getRecentEvents = (limit?: number): Event[] => {
  const recent = mockEvents
    .filter(event => event.status === 'completed')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
  return limit ? recent.slice(0, limit) : recent;
};

export const getEventsByStatus = (status: Event['status']): Event[] => {
  return mockEvents.filter(event => event.status === status);
};

export const searchEvents = (query: string): Event[] => {
  const lowercaseQuery = query.toLowerCase();
  return mockEvents.filter(event => 
    event.title.toLowerCase().includes(lowercaseQuery) ||
    event.description.toLowerCase().includes(lowercaseQuery) ||
    event.location.toLowerCase().includes(lowercaseQuery)
  );
};

// Export all mock data as default
export default {
  events: mockEvents,
  stats: mockStats,
  recentActivity: mockRecentActivity,
  chartData: mockChartData,
  helpers: {
    getEventById,
    getGuestsByEventId,
    getUpcomingEvents,
    getRecentEvents,
    getEventsByStatus,
    searchEvents
  }
};