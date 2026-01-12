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
import { EventService } from './eventService';

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
  };
}

export interface AnalyticsFilter {
  startDate?: Date;
  endDate?: Date;
  eventType?: string;
  status?: string[];
  location?: string;
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
      console.log('[Analytics] Generowanie raportu dla userId:', userId);
      
      // Pobierz wydarzenia użytkownika
      const eventsStats = await EventService.getEventStats(userId);
      console.log('[Analytics] Event stats:', eventsStats);

      // Pobierz szczegółowe dane wydarzeń
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
      console.log('[Analytics] Znaleziono wydarzeń:', events.length);

      // Pobierz dane gości dla wszystkich wydarzeń użytkownika
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
      
      console.log('[Analytics] Znaleziono gości:', guests.length);

      // Oblicz metryki
      const report = await this.calculateMetrics(
        events,
        guests,
        eventsStats,
        filters
      );
      
      console.log('[Analytics] Wygenerowany raport:', report);

      return report;
    } catch (error) {
      console.error('Błąd podczas generowania raportu:', error);
      throw error;
    }
  }

  // Prywatna metoda do obliczania metryk
  private static async calculateMetrics(
    events: any[],
    guests: any[],
    eventsStats: any,
    filters: AnalyticsFilter
  ): Promise<AnalyticsReport> {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Filtruj wydarzenia według dat utworzenia (createdAt)
    let filteredEvents = events;
    if (filters.startDate || filters.endDate) {
      filteredEvents = events.filter(event => {
        const createdDate = event.createdAt?.toDate() || new Date();
        if (filters.startDate && createdDate < filters.startDate) return false;
        if (filters.endDate && createdDate > filters.endDate) return false;
        return true;
      });
    }
    
    console.log('[Analytics] Filtered events:', filteredEvents.length, 'z', events.length);
    
    // Filtruj gości aby pasowali tylko do przefiltrowanych wydarzeń
    const filteredEventIds = new Set(filteredEvents.map(e => e.id));
    const filteredGuests = guests.filter(guest => filteredEventIds.has(guest.eventId));
    
    console.log('[Analytics] Filtered guests:', filteredGuests.length, 'z', guests.length);

    // Wydarzenia w tym miesiącu
    const eventsThisMonth = events.filter(
      event => event.createdAt.toDate() >= thisMonth
    ).length;

    // Wydarzenia w poprzednim miesiącu
    const eventsLastMonth = events.filter(event => {
      const createdAt = event.createdAt.toDate();
      return createdAt >= lastMonth && createdAt < thisMonth;
    }).length;

    // Wzrost
    let growthRate = 0;
    if (eventsLastMonth > 0) {
      growthRate = ((eventsThisMonth - eventsLastMonth) / eventsLastMonth) * 100;
    } else if (eventsThisMonth > 0) {
      // Jeśli w poprzednim miesiącu było 0, a teraz jest coś, to wzrost 100%
      growthRate = 100;
    }
    // Jeśli oba są 0, growthRate pozostaje 0
    
    console.log('[Analytics] Growth calculation:', {
      eventsThisMonth,
      eventsLastMonth,
      growthRate: growthRate.toFixed(1)
    });

    // Popularne typy wydarzeń (na podstawie kategorii)
    const eventTypeCount = new Map<string, number>();
    filteredEvents.forEach(event => {
      const type = event.category || 'Inne';
      eventTypeCount.set(type, (eventTypeCount.get(type) || 0) + 1);
    });

    const popularEventTypes = Array.from(eventTypeCount.entries())
      .map(([type, count]) => ({
        type,
        count,
        percentage: (count / filteredEvents.length) * 100,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Trendy miesięczne (ostatnie 6 miesięcy)
    const monthlyTrends = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      const monthEvents = events.filter(event => {
        const eventDate = event.createdAt.toDate();
        return eventDate >= monthStart && eventDate <= monthEnd;
      });

      const monthGuests = guests.filter(guest => {
        const invitedAt = guest.invitedAt.toDate();
        return invitedAt >= monthStart && invitedAt <= monthEnd;
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
      const location = event.location;
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
      .map(([location, data]) => ({
        location,
        count: data.count,
        avgGuests: data.count > 0 ? data.totalGuests / data.count : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Rozkład godzinowy wydarzeń
    const timeDistribution = Array.from({ length: 24 }, (_, hour) => {
      const count = filteredEvents.filter(event => {
        const eventDate = event.date.toDate();
        return eventDate.getHours() === hour;
      }).length;

      return { hour, count };
    });

    // Rozkład dni tygodnia
    const weekdays = ['Nie', 'Pon', 'Wto', 'Śro', 'Czw', 'Pią', 'Sob'];
    const weekdayDistribution = weekdays.map((day, index) => {
      const count = filteredEvents.filter(event => {
        const eventDate = event.date.toDate();
        return eventDate.getDay() === index;
      }).length;

      return { day, count };
    });

    // Analiza czasu odpowiedzi
    const respondedGuests = filteredGuests.filter(
      guest => guest.status !== 'pending' && guest.respondedAt
    );

    let totalResponseTime = 0;
    let fastResponders = 0;
    let mediumResponders = 0;
    let slowResponders = 0;

    respondedGuests.forEach(guest => {
      const invitedAt = guest.invitedAt.toDate();
      const respondedAt = guest.respondedAt.toDate();
      const responseTime =
        (respondedAt.getTime() - invitedAt.getTime()) / (1000 * 60 * 60); // godziny

      totalResponseTime += responseTime;

      if (responseTime < 24) {
        fastResponders++;
      } else if (responseTime < 168) {
        // 7 dni
        mediumResponders++;
      } else {
        slowResponders++;
      }
    });

    const averageResponseTime =
      respondedGuests.length > 0
        ? totalResponseTime / respondedGuests.length
        : 0;

    // RSVP Rate
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
