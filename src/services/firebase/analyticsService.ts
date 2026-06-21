// services/firebase/analyticsService.ts
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { COLLECTIONS } from '../../types/firebase';
import {
  formatEventCategory,
  shortenLocationLabel,
} from '../../utils/analyticsDisplay';

function toFirestoreDate(value: unknown): Date | null {
  if (value == null) return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  if (
    typeof value === 'object' &&
    'toDate' in value &&
    typeof (value as { toDate: () => Date }).toDate === 'function'
  ) {
    const date = (value as { toDate: () => Date }).toDate();
    return Number.isNaN(date.getTime()) ? null : date;
  }
  return null;
}

export interface AnalyticsMetric {
  id: string;
  userId: string;
  metricType:
    | 'event_created'
    | 'event_updated'
    | 'event_completed'
    | 'event_deleted'
    | 'guest_invited'
    | 'guest_responded'
    | 'page_view'
    | 'user_action';
  value: number;
  metadata?: Record<string, any>;
  timestamp: Timestamp;
  eventId?: string;
  guestId?: string;
}

export interface AnalyticsReport {
  totalEvents: number;
  totalGuests: number;
  averageGuestsPerEvent: number;
  rsvpRate: number;
  eventsThisMonth: number;
  eventsLastMonth: number;
  growthRate: number;
  filterOptions?: {
    eventTypes: string[];
    locations: string[];
  };
  popularEventTypes: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    events: number;
    guests: number;
    rsvpRate: number;
  }>;
  guestEngagement: {
    confirmed: number;
    pending: number;
    declined: number;
    maybe: number;
  };
  topLocations: Array<{
    location: string;
    locationFull: string;
    count: number;
    avgGuests: number;
  }>;
  timeDistribution: Array<{
    hour: number;
    count: number;
  }>;
  weekdayDistribution: Array<{
    day: string;
    count: number;
  }>;
  responseTimeAnalysis: {
    averageResponseTime: number; // w godzinach
    fastResponders: number; // < 24h
    mediumResponders: number; // 24h - 7 dni
    slowResponders: number; // > 7 dni
    trackedResponses: number;
  };
}

export interface AnalyticsFilter {
  startDate?: Date;
  endDate?: Date;
  eventTypes?: string[];
  locations?: string[];
  status?: string[];
  searchQuery?: string;
  guestCountMin?: number;
  guestCountMax?: number;
}

/** Zakres do filtrów UI (początek/koniec dnia). */
export function buildAnalyticsDateRange(days: number): {
  startDate: Date;
  endDate: Date;
} {
  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);
  return { startDate, endDate };
}

function getEventScheduleDate(event: {
  date?: unknown;
  createdAt?: unknown;
}): Date | null {
  return toFirestoreDate(event.date) ?? toFirestoreDate(event.createdAt);
}

function normalizeEventLocation(event: { location?: unknown }): string {
  return typeof event.location === 'string' && event.location.trim()
    ? event.location.trim()
    : 'Brak lokalizacji';
}

function buildFilterOptions(events: Array<{ category?: string; location?: unknown }>) {
  const eventTypes = new Set<string>();
  const locations = new Set<string>();

  events.forEach(event => {
    eventTypes.add(formatEventCategory(event.category?.trim() || 'other'));
    locations.add(normalizeEventLocation(event));
  });

  return {
    eventTypes: Array.from(eventTypes).sort((a, b) => a.localeCompare(b, 'pl')),
    locations: Array.from(locations).sort((a, b) => a.localeCompare(b, 'pl')),
  };
}

function getGuestCountForEvent(
  event: { id: string; guestCount?: number },
  guestsByEventId: Map<string, number>
): number {
  return guestsByEventId.get(event.id) ?? event.guestCount ?? 0;
}

function applyEventFilters(
  events: Array<{
    id: string;
    title?: string;
    category?: string;
    status?: string;
    location?: unknown;
    guestCount?: number;
    date?: unknown;
    createdAt?: unknown;
  }>,
  guests: Array<{ eventId: string }>,
  filters: AnalyticsFilter
): typeof events {
  let result = events;

  if (filters.eventTypes?.length) {
    const types = new Set(filters.eventTypes);
    result = result.filter(event =>
      types.has(formatEventCategory(event.category?.trim() || 'other'))
    );
  }

  if (filters.locations?.length) {
    const locs = new Set(filters.locations);
    result = result.filter(event =>
      locs.has(normalizeEventLocation(event))
    );
  }

  if (filters.status?.length) {
    const statuses = new Set(filters.status);
    result = result.filter(
      event => event.status != null && statuses.has(event.status)
    );
  }

  if (filters.searchQuery?.trim()) {
    const q = filters.searchQuery.trim().toLowerCase();
    result = result.filter(event => {
      const title = (event.title ?? '').toLowerCase();
      const location = normalizeEventLocation(event).toLowerCase();
      return title.includes(q) || location.includes(q);
    });
  }

  if (
    filters.guestCountMin != null ||
    (filters.guestCountMax != null && filters.guestCountMax < Number.MAX_SAFE_INTEGER)
  ) {
    const guestsByEventId = new Map<string, number>();
    guests.forEach(guest => {
      guestsByEventId.set(
        guest.eventId,
        (guestsByEventId.get(guest.eventId) ?? 0) + 1
      );
    });
    const min = filters.guestCountMin ?? 0;
    const max = filters.guestCountMax ?? Number.MAX_SAFE_INTEGER;
    result = result.filter(event => {
      const count = getGuestCountForEvent(event, guestsByEventId);
      return count >= min && count <= max;
    });
  }

  return result;
}

export function aggregateRecentMetrics(
  metrics: AnalyticsMetric[],
  periodHours = 24
): {
  pageViews: { current: number; change: number };
  userActions: { current: number; change: number };
  eventsCreated: { current: number; change: number };
  rsvpResponses: { current: number; change: number };
} {
  const now = Date.now();
  const periodMs = periodHours * 60 * 60 * 1000;
  const currentStart = now - periodMs;
  const previousStart = now - 2 * periodMs;

  const sumInRange = (
    type: AnalyticsMetric['metricType'],
    start: number,
    end: number
  ) =>
    metrics
      .filter(metric => {
        const ts = metric.timestamp.toMillis();
        return metric.metricType === type && ts >= start && ts < end;
      })
      .reduce((sum, metric) => sum + (metric.value ?? 1), 0);

  const withChange = (type: AnalyticsMetric['metricType']) => {
    const current = sumInRange(type, currentStart, now);
    const previous = sumInRange(type, previousStart, currentStart);
    const change =
      previous > 0
        ? ((current - previous) / previous) * 100
        : current > 0
          ? 100
          : 0;
    return { current, change };
  };

  return {
    pageViews: withChange('page_view'),
    userActions: withChange('user_action'),
    eventsCreated: withChange('event_created'),
    rsvpResponses: withChange('guest_responded'),
  };
}

export class AnalyticsService {
  // Śledzenie metryki
  static async trackMetric(
    userId: string,
    metricType: AnalyticsMetric['metricType'],
    value: number = 1,
    metadata: Record<string, any> = {},
    eventId?: string,
    guestId?: string
  ): Promise<void> {
    // Wyłącz analityki w trybie deweloperskim
    if (process.env.NODE_ENV === 'development') {
      // Analytics disabled in development mode
      return;
    }

    try {
      const metric: Omit<AnalyticsMetric, 'id'> = {
        userId,
        metricType,
        value,
        metadata,
        timestamp: Timestamp.now(),
        ...(eventId && { eventId }),
        ...(guestId && { guestId }),
      };

      await addDoc(collection(db, COLLECTIONS.ANALYTICS), metric);
    } catch (error) {
      console.error('Błąd podczas śledzenia metryki:', error);
    }
  }

  // Wygenerowanie raportu analitycznego
  static async generateReport(
    userId: string,
    filters: AnalyticsFilter = {}
  ): Promise<AnalyticsReport> {
    try {
      const eventsQuery = query(
        collection(db, COLLECTIONS.EVENTS),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const eventsSnapshot = await getDocs(eventsQuery);
      const events = eventsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      const eventIds = events.map(e => e.id);
      let guests: any[] = [];
      
      if (eventIds.length > 0) {
        // Firestore 'in' operator ma limit 10 elementów, więc dzielimy na części
        const chunks = [];
        for (let i = 0; i < eventIds.length; i += 10) {
          chunks.push(eventIds.slice(i, i + 10));
        }
        
        for (const chunk of chunks) {
          const guestsQuery = query(
            collection(db, COLLECTIONS.GUESTS),
            where('eventId', 'in', chunk)
          );
          const guestsSnapshot = await getDocs(guestsQuery);
          guests.push(...guestsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          })));
        }
      }

      const report = await this.calculateMetrics(events, guests, filters);

      return {
        ...report,
        filterOptions: buildFilterOptions(
          events as Array<{ category?: string; location?: unknown }>
        ),
      };
    } catch (error) {
      console.error('Błąd podczas generowania raportu:', error);
      throw error;
    }
  }

  // Prywatna metoda do obliczania metryk
  private static async calculateMetrics(
    events: any[],
    guests: any[],
    filters: AnalyticsFilter
  ): Promise<AnalyticsReport> {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const rangeEnd = filters.endDate ?? now;

    // Filtruj wydarzenia wg daty imprezy (fallback: data utworzenia)
    let filteredEvents = events;
    if (filters.startDate || filters.endDate) {
      filteredEvents = events.filter(event => {
        const eventDate = getEventScheduleDate(event);
        if (!eventDate) return false;
        if (filters.startDate && eventDate < filters.startDate) return false;
        if (filters.endDate && eventDate > filters.endDate) return false;
        return true;
      });
    }

    filteredEvents = applyEventFilters(filteredEvents, guests, filters);

    const filteredEventIds = new Set(filteredEvents.map(e => e.id));
    const filteredGuests = guests.filter(guest =>
      filteredEventIds.has(guest.eventId)
    );

    // Wzrost: nowo utworzone wydarzenia (kalendarzowe m-ce, bez filtra zakresu)
    const eventsThisMonth = events.filter(event => {
      const createdAt = toFirestoreDate(event.createdAt);
      return createdAt != null && createdAt >= thisMonth;
    }).length;

    const eventsLastMonth = events.filter(event => {
      const createdAt = toFirestoreDate(event.createdAt);
      return (
        createdAt != null && createdAt >= lastMonth && createdAt < thisMonth
      );
    }).length;

    let growthRate = 0;
    if (eventsLastMonth > 0) {
      growthRate =
        ((eventsThisMonth - eventsLastMonth) / eventsLastMonth) * 100;
    } else if (eventsThisMonth > 0) {
      growthRate = 100;
    }

    // Popularne typy wydarzeń (na podstawie kategorii)
    const eventTypeCount = new Map<string, number>();
    filteredEvents.forEach(event => {
      const type = formatEventCategory(event.category?.trim() || 'other');
      eventTypeCount.set(type, (eventTypeCount.get(type) || 0) + 1);
    });

    const popularEventTypes = Array.from(eventTypeCount.entries())
      .map(([type, count]) => ({
        type,
        count,
        percentage:
          filteredEvents.length > 0 ? (count / filteredEvents.length) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const monthlyTrends = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(
        rangeEnd.getFullYear(),
        rangeEnd.getMonth() - i,
        1
      );
      const monthEnd = new Date(
        rangeEnd.getFullYear(),
        rangeEnd.getMonth() - i + 1,
        0,
        23,
        59,
        59,
        999
      );

      const monthEvents = filteredEvents.filter(event => {
        const eventDate = getEventScheduleDate(event);
        return (
          eventDate != null &&
          eventDate >= monthStart &&
          eventDate <= monthEnd
        );
      });

      const monthGuests = filteredGuests.filter(guest => {
        const parent = filteredEvents.find(e => e.id === guest.eventId);
        if (!parent) return false;
        const eventDate = getEventScheduleDate(parent);
        return (
          eventDate != null &&
          eventDate >= monthStart &&
          eventDate <= monthEnd
        );
      });

      const respondedGuests = monthGuests.filter(
        guest => guest.status !== 'pending'
      ).length;

      monthlyTrends.push({
        month: monthStart.toLocaleDateString('pl-PL', { month: 'short' }),
        events: monthEvents.length,
        guests: monthGuests.length,
        rsvpRate:
          monthGuests.length > 0
            ? (respondedGuests / monthGuests.length) * 100
            : 0,
      });
    }

    // Zaangażowanie gości
    const guestEngagement = {
      confirmed: filteredGuests.filter(g => g.status === 'accepted').length,
      pending: filteredGuests.filter(g => g.status === 'pending').length,
      declined: filteredGuests.filter(g => g.status === 'declined').length,
      maybe: filteredGuests.filter(g => g.status === 'maybe').length,
    };

    // Top lokalizacje
    const locationCount = new Map<
      string,
      { count: number; totalGuests: number }
    >();
    filteredEvents.forEach(event => {
      const location = normalizeEventLocation(event);
      const existing = locationCount.get(location) || {
        count: 0,
        totalGuests: 0,
      };
      locationCount.set(location, {
        count: existing.count + 1,
        totalGuests: existing.totalGuests + (event.guestCount || 0),
      });
    });

    const topLocations = Array.from(locationCount.entries())
      .map(([location, data]) => {
        const { short, full } = shortenLocationLabel(location);
        return {
          location: short,
          locationFull: full,
          count: data.count,
          avgGuests: data.count > 0 ? data.totalGuests / data.count : 0,
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Rozkład godzinowy wydarzeń
    const timeDistribution = Array.from({ length: 24 }, (_, hour) => {
      const count = filteredEvents.filter(event => {
        const eventDate = getEventScheduleDate(event);
        return eventDate != null && eventDate.getHours() === hour;
      }).length;

      return { hour, count };
    });

    const weekdays = ['Nie', 'Pon', 'Wto', 'Śro', 'Czw', 'Pią', 'Sob'];
    const weekdayDistribution = weekdays.map((day, index) => {
      const count = filteredEvents.filter(event => {
        const eventDate = getEventScheduleDate(event);
        return eventDate != null && eventDate.getDay() === index;
      }).length;

      return { day, count };
    });

    const respondedGuests = filteredGuests.filter(
      guest => guest.status !== 'pending'
    );

    let totalResponseTime = 0;
    let fastResponders = 0;
    let mediumResponders = 0;
    let slowResponders = 0;

    respondedGuests.forEach(guest => {
      const invitedAt =
        toFirestoreDate(guest.invitedAt) ?? toFirestoreDate(guest.createdAt);
      const respondedAt =
        toFirestoreDate(guest.respondedAt) ?? toFirestoreDate(guest.updatedAt);
      if (!invitedAt || !respondedAt) return;

      const responseTime =
        (respondedAt.getTime() - invitedAt.getTime()) / (1000 * 60 * 60);

      if (responseTime < 0 || responseTime > 24 * 180) return;

      totalResponseTime += responseTime;

      if (responseTime < 24) {
        fastResponders++;
      } else if (responseTime < 168) {
        mediumResponders++;
      } else {
        slowResponders++;
      }
    });

    const trackedResponses = fastResponders + mediumResponders + slowResponders;

    const averageResponseTime =
      trackedResponses > 0 ? totalResponseTime / trackedResponses : 0;

    const totalInvited = filteredGuests.length;
    const totalResponded = respondedGuests.length;
    const rsvpRate =
      totalInvited > 0 ? (totalResponded / totalInvited) * 100 : 0;

    return {
      totalEvents: filteredEvents.length,
      totalGuests: filteredGuests.length,
      averageGuestsPerEvent:
        filteredEvents.length > 0 ? filteredGuests.length / filteredEvents.length : 0,
      rsvpRate,
      eventsThisMonth,
      eventsLastMonth,
      growthRate,
      popularEventTypes,
      monthlyTrends,
      guestEngagement,
      topLocations,
      timeDistribution,
      weekdayDistribution,
      responseTimeAnalysis: {
        averageResponseTime,
        fastResponders,
        mediumResponders,
        slowResponders,
        trackedResponses,
      },
    };
  }

  // Eksport danych do CSV
  static exportToCSV(
    data: AnalyticsReport,
    filename: string = 'analytics-report'
  ): void {
    const csvContent = this.generateCSVContent(data);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  // Generowanie zawartości CSV
  private static generateCSVContent(data: AnalyticsReport): string {
    const lines = [
      'Raport Analityczny PartyPass',
      '',
      'Metryki główne:',
      `Łącznie wydarzeń,${data.totalEvents}`,
      `Łącznie gości,${data.totalGuests}`,
      `Średnio gości/wydarzenie,${data.averageGuestsPerEvent.toFixed(2)}`,
      `Wskaźnik RSVP,${data.rsvpRate.toFixed(1)}%`,
      `Wzrost (miesiąc do miesiąca),${data.growthRate.toFixed(1)}%`,
      '',
      'Trendy miesięczne:',
      'Miesiąc,Wydarzenia,Goście,Wskaźnik RSVP',
      ...data.monthlyTrends.map(
        trend =>
          `${trend.month},${trend.events},${trend.guests},${trend.rsvpRate.toFixed(1)}%`
      ),
      '',
      'Popularne typy wydarzeń:',
      'Typ,Liczba,Procent',
      ...data.popularEventTypes.map(
        type => `${type.type},${type.count},${type.percentage.toFixed(1)}%`
      ),
      '',
      'Top lokalizacje:',
      'Lokalizacja,Wydarzenia,Średnio gości',
      ...data.topLocations.map(
        location =>
          `${location.location},${location.count},${location.avgGuests.toFixed(1)}`
      ),
    ];

    return lines.join('\n');
  }

  // Subskrypcja na zmiany metryk w czasie rzeczywistym
  static subscribeToMetrics(
    userId: string,
    callback: (metrics: AnalyticsMetric[]) => void
  ): () => void {
    const metricsQuery = query(
      collection(db, COLLECTIONS.ANALYTICS),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );

    return onSnapshot(metricsQuery, snapshot => {
      const metrics: AnalyticsMetric[] = [];
      snapshot.forEach(doc => {
        metrics.push({ id: doc.id, ...doc.data() } as AnalyticsMetric);
      });
      callback(metrics);
    });
  }

  // Porównanie okresów
  static async compareTimeframes(
    userId: string,
    currentStart: Date,
    currentEnd: Date,
    previousStart: Date,
    previousEnd: Date
  ): Promise<{
    current: AnalyticsReport;
    previous: AnalyticsReport;
    comparison: {
      eventsChange: number;
      guestsChange: number;
      rsvpRateChange: number;
    };
  }> {
    const currentReport = await this.generateReport(userId, {
      startDate: currentStart,
      endDate: currentEnd,
    });

    const previousReport = await this.generateReport(userId, {
      startDate: previousStart,
      endDate: previousEnd,
    });

    const comparison = {
      eventsChange:
        previousReport.totalEvents > 0
          ? ((currentReport.totalEvents - previousReport.totalEvents) /
              previousReport.totalEvents) *
            100
          : 0,
      guestsChange:
        previousReport.totalGuests > 0
          ? ((currentReport.totalGuests - previousReport.totalGuests) /
              previousReport.totalGuests) *
            100
          : 0,
      rsvpRateChange: currentReport.rsvpRate - previousReport.rsvpRate,
    };

    return {
      current: currentReport,
      previous: previousReport,
      comparison,
    };
  }
}
