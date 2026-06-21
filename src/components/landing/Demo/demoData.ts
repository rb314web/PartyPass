import {
  Calendar,
  Users,
  Mail,
  CheckCircle,
  Home,
  Search,
  Activity,
  BarChart3,
  Settings,
  Crown,
  UserPlus,
} from 'lucide-react';
import {
  DemoMetric,
  DemoEvent,
  SidebarItem,
  DemoContact,
  DemoActivity,
} from './demo.types';

export const mockUser = {
  firstName: 'Anna',
  lastName: 'Kowalska',
  email: 'demo@partypass.pl',
  planType: 'pro' as const,
};

export const mockMetrics: DemoMetric[] = [
  {
    label: 'Wydarzenia',
    value: 8,
    change: 12,
    changeLabel: 'vs poprzedni m-c',
    icon: Calendar,
    color: 'blue',
    details: [
      { label: 'Aktywne', value: '5' },
      { label: 'Zakończone', value: '3' },
    ],
    linkLabel: 'Zobacz wszystkie',
  },
  {
    label: 'Kontakty',
    value: 142,
    change: 8,
    changeLabel: 'vs poprzedni m-c',
    icon: Users,
    color: 'green',
    details: [
      { label: 'Zaproszeni na events', value: '218' },
      { label: 'Oczekujący', value: '34' },
    ],
    linkLabel: 'Zarządzaj kontaktami',
  },
  {
    label: 'Plan Pro',
    value: '28%',
    changeLabel: 'wykorzystania limitu',
    icon: Crown,
    color: 'purple',
    details: [
      { label: 'Wydarzenia', value: '8 / 50' },
      { label: 'Kontakty', value: '142 / 1000' },
    ],
    linkLabel: 'Zmień plan',
  },
];

export const mockEvents: DemoEvent[] = [
  {
    id: '1',
    title: '🎂 Urodziny Marii',
    date: '14 czerwca 2026, 20:00',
    location: 'ul. Nowogrodzka 12, Warszawa',
    guests: 28,
    maxGuests: 35,
    accepted: 24,
    pending: 4,
    status: 'active',
  },
  {
    id: '2',
    title: '🏢 Meetup Product Design',
    date: '22 czerwca 2026, 18:30',
    location: 'Hub Warsaw, Warszawa',
    guests: 42,
    maxGuests: 60,
    accepted: 38,
    pending: 4,
    status: 'active',
  },
  {
    id: '3',
    title: '💍 Wesele Ani i Tomka',
    date: '5 lipca 2026, 15:00',
    location: 'Pałacyk w Wilanowie, Warszawa',
    guests: 86,
    maxGuests: 120,
    accepted: 52,
    pending: 34,
    status: 'active',
  },
  {
    id: '4',
    title: '🎄 Spotkanie świąteczne',
    date: '20 grudnia 2025, 18:00',
    location: 'Biuro PartyPass, Kraków',
    guests: 24,
    maxGuests: 30,
    accepted: 24,
    pending: 0,
    status: 'completed',
  },
];

export const sidebarItems: SidebarItem[] = [
  { icon: Home, label: 'Dashboard', view: 'dashboard' },
  { icon: Search, label: 'Wyszukaj', view: 'search' },
  { icon: Calendar, label: 'Wydarzenia', view: 'events' },
  { icon: Users, label: 'Kontakty', view: 'contacts' },
  { icon: Activity, label: 'Aktywności', view: 'activities' },
  { icon: BarChart3, label: 'Analityka', view: 'analytics' },
  { icon: Crown, label: 'Plan', view: 'plan' },
  { icon: Settings, label: 'Ustawienia', view: 'settings' },
];

export const mockContacts: DemoContact[] = [
  {
    id: '1',
    firstName: 'Jan',
    lastName: 'Kowalski',
    email: 'jan.kowalski@example.com',
    phone: '+48 600 111 222',
    eventsAttended: 5,
    lastEvent: 'Urodziny Marii',
  },
  {
    id: '2',
    firstName: 'Maria',
    lastName: 'Nowak',
    email: 'maria.nowak@example.com',
    phone: '+48 600 333 444',
    eventsAttended: 3,
    lastEvent: 'Meetup Product Design',
  },
  {
    id: '3',
    firstName: 'Piotr',
    lastName: 'Wiśniewski',
    email: 'piotr.wisniewski@example.com',
    phone: '+48 600 555 666',
    eventsAttended: 2,
    lastEvent: 'Wesele Ani i Tomka',
  },
  {
    id: '4',
    firstName: 'Kasia',
    lastName: 'Lewandowska',
    email: 'kasia.lewandowska@example.com',
    phone: '+48 600 777 888',
    eventsAttended: 4,
    lastEvent: 'Urodziny Marii',
  },
];

export const mockActivities: DemoActivity[] = [
  {
    id: '1',
    type: 'guest_accepted',
    message: 'Maria Nowak potwierdziła obecność na „Urodziny Marii”',
    time: '2 godz. temu',
    icon: CheckCircle,
    color: 'success',
  },
  {
    id: '2',
    type: 'invitation',
    message: 'Wysłano 12 linków RSVP na „Meetup Product Design”',
    time: '5 godz. temu',
    icon: Mail,
    color: 'blue',
  },
  {
    id: '3',
    type: 'contact_added',
    message: 'Dodano kontakt: Kasia Lewandowska',
    time: 'wczoraj',
    icon: UserPlus,
    color: 'green',
  },
  {
    id: '4',
    type: 'event_created',
    message: 'Utworzono wydarzenie „Wesele Ani i Tomka”',
    time: '2 dni temu',
    icon: Calendar,
    color: 'purple',
  },
];

export const demoQuickActions = [
  { icon: Calendar, label: 'Nowe wydarzenie', primary: true },
  { icon: Users, label: 'Dodaj gości', primary: false },
  { icon: BarChart3, label: 'Analityki', primary: false },
  { icon: Settings, label: 'Ustawienia', primary: false },
];
