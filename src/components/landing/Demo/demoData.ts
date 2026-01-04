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
  Phone,
} from 'lucide-react';
import { DemoStat, DemoEvent, SidebarItem, DemoContact, DemoActivity } from './demo.types';

export const mockStats: DemoStat[] = [
  {
    title: 'Wydarzenia',
    value: 12,
    change: '+3 w tym miesiącu',
    trend: 'up',
    icon: Calendar,
    color: 'blue',
  },
  {
    title: 'Goście łącznie',
    value: 324,
    change: '+45 w tym miesiącu',
    trend: 'up',
    icon: Users,
    color: 'green',
  },
  {
    title: 'Potwierdzenia',
    value: '89%',
    change: '+5% vs poprzedni miesiąc',
    trend: 'up',
    icon: CheckCircle,
    color: 'purple',
  },
  {
    title: 'Wysłane zaproszenia',
    value: 1205,
    change: '+120 w tym miesiącu',
    trend: 'up',
    icon: Mail,
    color: 'orange',
  },
];

export const mockEvents: DemoEvent[] = [
  {
    id: '1',
    title: '🎂 Urodziny Marii',
    date: '15 grudnia 2024, 20:00',
    location: 'ul. Kwiatowa 15, Warszawa',
    guests: 28,
    maxGuests: 35,
    status: 'active',
  },
  {
    id: '2',
    title: '🏢 Konferencja IT 2024',
    date: '15 października 2024, 09:00',
    location: 'Centrum Konferencyjne, Kraków',
    guests: 120,
    maxGuests: 150,
    status: 'completed',
  },
  {
    id: '3',
    title: '🍽️ Spotkanie rodzinne',
    date: '20 stycznia 2025, 14:00',
    location: 'Dom babci, Zakopane',
    guests: 12,
    maxGuests: 20,
    status: 'active',
  },
];

export const sidebarItems: SidebarItem[] = [
  { icon: Home, label: 'Dashboard', view: 'dashboard' },
  { icon: Search, label: 'Wyszukaj', view: 'search' },
  { icon: Calendar, label: 'Wydarzenia', view: 'events' },
  { icon: Users, label: 'Kontakty', view: 'contacts' },
  { icon: Activity, label: 'Aktywności', view: 'activities' },
  { icon: BarChart3, label: 'Analityka', view: 'analytics' },
  { icon: Settings, label: 'Ustawienia', view: 'settings' },
];

export const mockContacts: DemoContact[] = [
  {
    id: '1',
    firstName: 'Jan',
    lastName: 'Kowalski',
    email: 'jan.kowalski@example.com',
    phone: '123-456-789',
    eventsAttended: 5,
    lastEvent: 'Urodziny Marii',
  },
  {
    id: '2',
    firstName: 'Anna',
    lastName: 'Nowak',
    email: 'anna.nowak@example.com',
    phone: '987-654-321',
    eventsAttended: 3,
    lastEvent: 'Konferencja IT 2024',
  },
  {
    id: '3',
    firstName: 'Piotr',
    lastName: 'Wiśniewski',
    email: 'piotr.wisniewski@example.com',
    phone: '555-111-222',
    eventsAttended: 1,
    lastEvent: 'Spotkanie rodzinne',
  },
];

export const mockActivities: DemoActivity[] = [
  {
    id: '1',
    type: 'confirmation',
    message: 'Anna Kowalska potwierdziła uczestnictwo w "Urodziny Marii"',
    time: '2 godziny temu',
    icon: CheckCircle,
    color: 'success',
  },
  {
    id: '2',
    type: 'invitation',
    message: 'Wysłano 15 zaproszeń na "Spotkanie rodzinne"',
    time: '1 dzień temu',
    icon: Mail,
    color: 'blue',
  },
  {
    id: '3',
    type: 'event',
    message: 'Utworzono nowe wydarzenie "Spotkanie rodzinne"',
    time: '3 dni temu',
    icon: Calendar,
    color: 'purple',
  },
  {
    id: '4',
    type: 'guest',
    message: '5 nowych gości zapisało się na "Konferencja IT 2024"',
    time: '5 dni temu',
    icon: Users,
    color: 'green',
  },
];

