# 🔌 PartyPass API Documentation

Ta dokumentacja opisuje wewnętrzne API PartyPass oraz dostępne hooki i serwisy dla deweloperów.

## 📋 Spis Treści
- [Architektura API](#architektura-api)
- [Authentication](#authentication)
- [Hooks](#hooks)
- [Services](#services)
- [Types](#types)
- [Error Handling](#error-handling)

## 🏗️ Architektura API

PartyPass używa hybrydowej architektury z Firebase jako backend i React hooks jako interfejs API.

```
Frontend (React) ←→ Hooks ←→ Services ←→ Firebase
                                      ↕
                                 Local Storage
```

### Kluczowe Zasady
- **Immutability** - wszystkie dane są niemutowalne
- **Reactive** - automatyczne aktualizacje UI przy zmianach danych
- **Offline-first** - podstawowa funkcjonalność bez internetu
- **Type-safe** - pełne typowanie TypeScript

## 🔐 Authentication

### useAuth Hook
Główny hook do zarządzania autentyfikacją użytkowników.

```typescript
import { useAuth } from '../hooks/useAuth';

function MyComponent() {
  const { user, login, logout, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {user ? (
        <div>
          <p>Welcome, {user.email}!</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <button onClick={() => login('email', 'password')}>
          Login
        </button>
      )}
    </div>
  );
}
```

**API:**
```typescript
interface UseAuthReturn {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}
```

### User Object
```typescript
interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  emailVerified: boolean;
  createdAt: Date;
  lastLoginAt: Date;
  plan: 'free' | 'premium' | 'enterprise';
  planExpiresAt?: Date;
}
```

## 🎣 Hooks

### useTheme
Zarządzanie motywem aplikacji (jasny/ciemny).

```typescript
import { useTheme } from '../hooks/useTheme';

function ThemeToggle() {
  const { isDark, toggleTheme, setTheme } = useTheme();

  return (
    <button onClick={toggleTheme}>
      {isDark ? '☀️' : '🌙'}
    </button>
  );
}
```

**API:**
```typescript
interface UseThemeReturn {
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
}
```

### useDashboardEvents
Pobieranie i zarządzanie wydarzeniami użytkownika.

```typescript
import { useDashboardEvents } from '../hooks/useDashboardEvents';

function EventsList() {
  const { events, loading, error, createEvent, updateEvent, deleteEvent } = useDashboardEvents();

  if (loading) return <div>Loading events...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {events.map(event => (
        <div key={event.id}>
          <h3>{event.title}</h3>
          <button onClick={() => deleteEvent(event.id)}>
            Delete
          </button>
        </div>
      ))}
      <button onClick={() => createEvent({ title: 'New Event', date: new Date() })}>
        Create Event
      </button>
    </div>
  );
}
```

**API:**
```typescript
interface UseDashboardEventsReturn {
  events: Event[];
  loading: boolean;
  error: string | null;
  createEvent: (eventData: Partial<Event>) => Promise<Event>;
  updateEvent: (eventId: string, updates: Partial<Event>) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
  refresh: () => Promise<void>;
}
```

### useDashboardStats
Statystyki dashboard użytkownika.

```typescript
import { useDashboardStats } from '../hooks/useDashboardStats';

function DashboardStats() {
  const { stats, loading, error } = useDashboardStats();

  if (loading) return <div>Loading stats...</div>;

  return (
    <div>
      <div>Total Events: {stats.totalEvents}</div>
      <div>Total Guests: {stats.totalGuests}</div>
      <div>Response Rate: {stats.responseRate}%</div>
    </div>
  );
}
```

**API:**
```typescript
interface DashboardStats {
  totalEvents: number;
  activeEvents: number;
  totalGuests: number;
  responseRate: number;
  eventsThisMonth: number;
  guestsThisMonth: number;
}

interface UseDashboardStatsReturn {
  stats: DashboardStats;
  loading: boolean;
  error: string | null;
}
```

### useErrorHandler
Centralne zarządzanie błędami.

```typescript
import { useErrorHandler } from '../hooks/useErrorHandler';

function DataFetcher() {
  const { handleError, clearError } = useErrorHandler();

  const fetchData = async () => {
    try {
      const data = await apiCall();
      // process data
    } catch (error) {
      handleError(error, 'Failed to fetch data');
    }
  };

  return <button onClick={fetchData}>Fetch Data</button>;
}
```

**API:**
```typescript
interface UseErrorHandlerReturn {
  handleError: (error: unknown, message?: string) => void;
  clearError: () => void;
  error: Error | null;
}
```

## 🔧 Services

### Firebase Services

#### Auth Service
```typescript
import { authService } from '../services/firebase/authService';

// Login
const user = await authService.login('email@example.com', 'password');

// Register
const user = await authService.register('email@example.com', 'password', 'John Doe');

// Logout
await authService.logout();

// Reset password
await authService.resetPassword('email@example.com');
```

#### Event Service
```typescript
import { eventService } from '../services/firebase/eventService';

// Create event
const event = await eventService.createEvent(userId, {
  title: 'Birthday Party',
  date: new Date(),
  location: 'Home'
});

// Get event with guests
const eventData = await eventService.getEvent(eventId, userId);

// Update event
await eventService.updateEvent(eventId, { title: 'Updated Title' });

// Delete event
await eventService.deleteEvent(eventId);

// Get user stats
const stats = await eventService.getEventStats(userId);
```

#### Guest Service
```typescript
import { guestService } from '../services/firebase/guestService';

// Add guest to event
await guestService.addGuestToEvent(eventId, {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com'
});

// Update guest response
await guestService.updateGuestResponse(eventId, guestId, 'accepted');

// Get event guests
const guests = await guestService.getEventGuests(eventId);
```

#### Contact Service
```typescript
import { contactService } from '../services/firebase/contactService';

// Search contacts
const contacts = await contactService.searchContacts(userId, 'john');

// Create contact
const contact = await contactService.createContact(userId, {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  phone: '+48 123 456 789'
});

// Update contact
await contactService.updateContact(contactId, { phone: '+48 987 654 321' });

// Delete contact
await contactService.deleteContact(contactId);
```

### Email Service
```typescript
import { emailService } from '../services/emailService';

// Send invitation
await emailService.sendInvitation({
  email: 'guest@example.com',
  rsvpUrl: 'https://partypass.app/rsvp/abc123',
  event: eventData,
  invitation: invitationData
});

// Send contact message
await emailService.sendContactMessage({
  name: 'John Doe',
  email: 'john@example.com',
  message: 'Hello, I need help!'
});
```

## 📝 Types

### Core Types

#### Event
```typescript
interface Event {
  id: string;
  userId: string;
  title: string;
  description?: string;
  date: Date;
  endDate?: Date;
  location?: string;
  maxGuests?: number;
  guestCount: number;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  settings: EventSettings;
  createdAt: Date;
  updatedAt: Date;
}

interface EventSettings {
  allowPlusOne: boolean;
  requireRSVP: boolean;
  sendReminders: boolean;
  publicEvent: boolean;
  customMessage?: string;
}
```

#### Guest
```typescript
interface Guest {
  id: string;
  eventId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  status: 'pending' | 'accepted' | 'declined' | 'maybe';
  plusOne?: PlusOne;
  invitedAt: Date;
  respondedAt?: Date;
  notes?: string;
}

interface PlusOne {
  firstName: string;
  lastName: string;
  dietaryRestrictions?: string;
}
```

#### Contact
```typescript
interface Contact {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  lastName: string;
  email: string;
  phone?: string;
  notes?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Firebase Types
```typescript
// Firebase document with ID
interface FirebaseDoc {
  id: string;
}

// Firebase timestamp
interface FirebaseTimestamp {
  seconds: number;
  nanoseconds: number;
}

// Query constraints
interface QueryOptions {
  limit?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  startAfter?: any;
}
```

## 🚨 Error Handling

### Error Types
```typescript
// Authentication errors
class AuthError extends Error {
  code: 'INVALID_CREDENTIALS' | 'USER_NOT_FOUND' | 'EMAIL_ALREADY_EXISTS';
}

// Validation errors
class ValidationError extends Error {
  field: string;
  value: any;
}

// Network errors
class NetworkError extends Error {
  statusCode: number;
  retryable: boolean;
}
```

### Error Handling Pattern
```typescript
import { useErrorHandler } from '../hooks/useErrorHandler';

function MyComponent() {
  const { handleError } = useErrorHandler();

  const performAction = async () => {
    try {
      await riskyOperation();
    } catch (error) {
      if (error instanceof AuthError) {
        handleError(error, 'Authentication failed');
      } else if (error instanceof ValidationError) {
        handleError(error, `Invalid ${error.field}`);
      } else {
        handleError(error, 'An unexpected error occurred');
      }
    }
  };

  return <button onClick={performAction}>Do Something</button>;
}
```

### Global Error Boundary
```typescript
import { ErrorBoundary } from '../components/common/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <MyApp />
    </ErrorBoundary>
  );
}
```

## 🔍 Debugging

### Console Logging
W trybie development dostępne są szczegółowe logi:
```bash
# Enable verbose logging
localStorage.setItem('partypass_debug', 'true');
```

### Firebase Debug
```typescript
// Enable Firebase debug logging
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

// Connect to emulators
connectAuthEmulator(getAuth(), "http://localhost:9099");
connectFirestoreEmulator(getFirestore(), 'localhost', 8080);
```

### Performance Monitoring
```typescript
import { usePageAnalytics } from '../hooks/usePageAnalytics';

function MyComponent() {
  usePageAnalytics('My Page');

  // Component will be tracked for performance metrics
  return <div>My content</div>;
}
```

## 📊 Analytics & Monitoring

### Page Analytics
```typescript
import { usePageAnalytics } from '../hooks/usePageAnalytics';

function Dashboard() {
  usePageAnalytics('Dashboard');

  return <div>Dashboard content</div>;
}
```

### Action Analytics
```typescript
import { useActionAnalytics } from '../hooks/useActionAnalytics';

function EventCard({ event }) {
  const trackAction = useActionAnalytics();

  const handleEdit = () => {
    trackAction('event_edit', { eventId: event.id });
    // Edit logic
  };

  return (
    <div>
      <h3>{event.title}</h3>
      <button onClick={handleEdit}>Edit</button>
    </div>
  );
}
```

### Core Web Vitals
Automatycznie śledzone metryki wydajności:
- **CLS (Cumulative Layout Shift)**
- **FID (First Input Delay)**
- **FCP (First Contentful Paint)**
- **LCP (Largest Contentful Paint)**
- **TTFB (Time to First Byte)**

---

Ta dokumentacja jest aktualizowana wraz z rozwojem aplikacji. Jeśli masz pytania lub potrzebujesz pomocy, skontaktuj się z zespołem deweloperskim.
