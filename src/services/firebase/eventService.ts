// services/firebase/eventService.ts
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  writeBatch,
  Timestamp,
  QueryDocumentSnapshot,
  DocumentData,
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { db, storage, auth } from '../../config/firebase';
import {
  FirebaseEvent,
  COLLECTIONS,
  CreateEventData as BaseCreateEventData,
} from '../../types/firebase';
import { Event, Activity, Guest } from '../../types';
import { AnalyticsService } from './analyticsService';
import { notificationService } from '../notificationService';
import SearchService from '../searchService';

export interface CreateEventData extends BaseCreateEventData {
  category?: string;
  tags?: string[];
  isPublic?: boolean;
  settings?: {
    allowGuestInvites: boolean;
    requireApproval: boolean;
    sendReminders: boolean;
    reminderDays: number[];
  };
  image?: File;
}

export interface UpdateEventData extends Partial<CreateEventData> {
  status?: 'draft' | 'active' | 'completed' | 'cancelled';
  dresscode?: string;
  additionalInfo?: string;
}

export interface EventFilters {
  status?: 'draft' | 'active' | 'completed' | 'cancelled';
  category?: string;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
}

export interface EventStats {
  totalEvents: number;
  activeEvents: number;
  completedEvents: number;
  draftEvents: number;
  cancelledEvents: number;
  totalGuests: number;
  acceptedGuests: number;
  pendingGuests: number;
  declinedGuests: number;
  responseRate: number;
  eventsThisMonth: number;
  guestsThisMonth: number;
  upcomingEvents: number;
}

export interface EventChartData {
  month: string;
  events: number;
  guests: number;
  date: Date;
}

export class EventService {
  // Get event by ID
  static async getEventById(
    eventId: string,
    userId?: string
  ): Promise<Event | null> {
    try {
      console.log(
        'Próba pobrania wydarzenia:',
        eventId,
        'dla użytkownika:',
        userId
      );
      console.log('Firebase Auth currentUser:', auth.currentUser?.uid);
      const eventDoc = await getDoc(doc(db, COLLECTIONS.EVENTS, eventId));

      if (!eventDoc.exists()) {
        console.log('Wydarzenie nie istnieje:', eventId);
        return null;
      }

      const eventData = eventDoc.data() as FirebaseEvent;
      console.log('Dane wydarzenia:', {
        eventId,
        userId: eventData.userId,
        requestUserId: userId,
      });

      // Sprawdź uprawnienia użytkownika
      if (userId && eventData.userId !== userId) {
        console.warn(
          'Brak dostępu do wydarzenia:',
          eventId,
          'właściciel:',
          eventData.userId,
          'żądający:',
          userId
        );
        return null;
      }

      // Pobierz gości wydarzenia
      console.log('Pobieranie gości dla wydarzenia:', eventId);
      const guestsQuery = query(
        collection(db, COLLECTIONS.GUESTS),
        where('eventId', '==', eventId)
        // Tymczasowo usunięte orderBy ze względu na potencjalne problemy z indeksem
        // orderBy('createdAt', 'desc')
      );

      console.log('Wykonywanie zapytania o gości...');
      const guestsSnapshot = await getDocs(guestsQuery);
      console.log('Otrzymano gości:', guestsSnapshot.docs.length);
      const guests = guestsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        invitedAt: doc.data().invitedAt?.toDate(),
        respondedAt: doc.data().respondedAt?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Guest[];

      // Konwertuj wydarzenie i dodaj gości
      const event = this.convertFirebaseEventToEvent(eventId, eventData);
      event.guests = guests;

      return event;
    } catch (error: any) {
      console.error('Pełny błąd Firebase:', error);
      console.error('Auth state:', auth.currentUser);
      throw new Error(`Błąd podczas pobierania wydarzenia: ${error.message}`);
    }
  }

  // Create new event
  static async createEvent(
    userId: string,
    eventData: CreateEventData
  ): Promise<Event> {
    try {
      let imageUrl: string | undefined;

      // Upload image if provided
      if (eventData.image) {
        const imageRef = ref(
          storage,
          `events/${userId}/${Date.now()}_${eventData.image.name}`
        );
        await uploadBytes(imageRef, eventData.image);
        imageUrl = await getDownloadURL(imageRef);
      }

      // Create event document
      const eventDoc: Omit<FirebaseEvent, 'id'> = {
        userId,
        title: eventData.title,
        description: eventData.description,
        date: Timestamp.fromDate(eventData.date),
        location: eventData.location,
        maxGuests: eventData.maxGuests,
        status: 'draft',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        category: eventData.category || 'other',
        tags: eventData.tags || [],
        isPublic: eventData.isPublic ?? false,
        settings: eventData.settings || {
          allowGuestInvites: false,
          requireApproval: false,
          sendReminders: true,
          reminderDays: [1, 7],
        },
        guestCount: eventData.guestCount || 0,
        acceptedCount: eventData.acceptedCount || 0,
        declinedCount: eventData.declinedCount || 0,
        pendingCount: eventData.pendingCount || 0,
        maybeCount: 0,
        dresscode: eventData.dresscode,
        additionalInfo: eventData.additionalInfo,
      };

      // Dodaj imageUrl tylko jeśli został wygenerowany
      if (imageUrl) {
        eventDoc.imageUrl = imageUrl;
      }
      const docRef = await addDoc(collection(db, COLLECTIONS.EVENTS), eventDoc);

      // Track analytics for event creation
      try {
        await AnalyticsService.trackMetric(
          userId,
          'event_created',
          1,
          {
            eventType: eventData.category || 'other',
            maxGuests: eventData.maxGuests,
            hasImage: !!imageUrl,
            location: eventData.location,
            isPublic: eventData.isPublic ?? false,
          },
          docRef.id
        );
      } catch (analyticsError) {
        console.warn(
          'Failed to track event creation analytics:',
          analyticsError
        );
      }

      // Create activity for event creation
      try {
        await EventService.createActivityWithNotification(
          {
            type: 'event_created',
            message: `Utworzono wydarzenie "${eventData.title}"`,
            eventId: docRef.id,
          },
          userId
        );
      } catch (activityError) {
        console.warn(
          'Failed to create activity for event creation:',
          activityError
        );
      }

      const newEvent = this.convertFirebaseEventToEvent(docRef.id, {
        ...eventDoc,
        id: docRef.id,
      });

      // Clear search cache after creating event
      SearchService.clearCache();

      return newEvent;
    } catch (error: any) {
      throw new Error(`Błąd podczas tworzenia wydarzenia: ${error.message}`);
    }
  }

  // Update event
  static async updateEvent(
    eventId: string,
    updateData: UpdateEventData
  ): Promise<Event> {
    try {
      const eventRef = doc(db, COLLECTIONS.EVENTS, eventId);
      const updateFields: Partial<FirebaseEvent> = {
        updatedAt: Timestamp.now(),
      };
      if (updateData.title) updateFields.title = updateData.title;
      if (updateData.description)
        updateFields.description = updateData.description;
      if (updateData.date)
        updateFields.date = Timestamp.fromDate(updateData.date);
      if (updateData.location) updateFields.location = updateData.location;
      if (updateData.maxGuests) updateFields.maxGuests = updateData.maxGuests;
      if (updateData.category) updateFields.category = updateData.category;
      if (updateData.tags) updateFields.tags = updateData.tags;
      if (updateData.isPublic !== undefined)
        updateFields.isPublic = updateData.isPublic;
      if (updateData.settings) updateFields.settings = updateData.settings;
      if (updateData.status) updateFields.status = updateData.status;
      if (updateData.dresscode !== undefined)
        updateFields.dresscode = updateData.dresscode;
      if (updateData.additionalInfo !== undefined)
        updateFields.additionalInfo = updateData.additionalInfo;

      // Handle image upload
      if (updateData.image) {
        const imageRef = ref(
          storage,
          `events/${eventId}/${Date.now()}_${updateData.image.name}`
        );
        await uploadBytes(imageRef, updateData.image);
        const imageUrl = await getDownloadURL(imageRef);
        updateFields.imageUrl = imageUrl;
      }
      await updateDoc(eventRef, updateFields);

      // Track analytics for event update
      try {
        await AnalyticsService.trackMetric(
          updateFields.userId || '',
          'event_updated',
          1,
          {
            fieldsUpdated: Object.keys(updateData).filter(
              key => key !== 'image'
            ),
            hasNewImage: !!updateData.image,
            statusChanged: !!updateData.status,
          },
          eventId
        );
      } catch (analyticsError) {
        console.warn('Failed to track event update analytics:', analyticsError);
      }

      // Create activity for event update
      try {
        const eventDoc = await getDoc(eventRef);
        const eventData = eventDoc.data() as FirebaseEvent;

        await EventService.createActivityWithNotification(
          {
            type: 'event_updated',
            message: `Zaktualizowano wydarzenie "${eventData.title}"`,
            eventId: eventId,
          },
          eventData.userId
        );
      } catch (activityError) {
        console.warn(
          'Failed to create activity for event update:',
          activityError
        );
      }

      // Get updated event
      const updatedDoc = await getDoc(eventRef);
      const eventData = updatedDoc.data() as FirebaseEvent;

      const updatedEvent = this.convertFirebaseEventToEvent(eventId, eventData);

      // Clear search cache after updating event
      SearchService.clearCache();

      return updatedEvent;
    } catch (error: any) {
      throw new Error(`Błąd podczas aktualizacji wydarzenia: ${error.message}`);
    }
  }

  // Delete event
  static async deleteEvent(eventId: string): Promise<void> {
    try {
      // Pobierz dane wydarzenia przed usunięciem
      const eventDoc = await getDoc(doc(db, COLLECTIONS.EVENTS, eventId));
      if (!eventDoc.exists()) {
        throw new Error('Wydarzenie nie istnieje');
      }

      const eventData = eventDoc.data() as FirebaseEvent;
      const batch = writeBatch(db);

      // 1. Usuń obrazy z Firebase Storage
      if (eventData.imageUrl) {
        try {
          const imageRef = ref(storage, eventData.imageUrl);
          await deleteObject(imageRef);
        } catch (error) {
          console.warn('Błąd podczas usuwania obrazu:', error);
          // Kontynuuj usuwanie nawet jeśli obraz nie może zostać usunięty
        }
      }

      // 2. Usuń gości
      const guestsQuery = query(
        collection(db, COLLECTIONS.GUESTS),
        where('eventId', '==', eventId)
      );
      const guestsSnapshot = await getDocs(guestsQuery);
      guestsSnapshot.forEach(guestDoc => {
        batch.delete(guestDoc.ref);
      });

      // 3. Usuń powiązane aktywności
      const activitiesQuery = query(
        collection(db, COLLECTIONS.ACTIVITIES),
        where('eventId', '==', eventId)
      );
      const activitiesSnapshot = await getDocs(activitiesQuery);
      activitiesSnapshot.forEach(activityDoc => {
        const activityData = activityDoc.data();

        // Usuń tylko aktywności, których właścicielem jest aktualny użytkownik
        if (activityData?.userId === eventData.userId) {
          batch.delete(activityDoc.ref);
        }
      });

      // 4. Dodaj nową aktywność o usunięciu wydarzenia
      const activityRef = doc(collection(db, COLLECTIONS.ACTIVITIES));
      batch.set(activityRef, {
        type: 'event_deleted',
        userId: eventData.userId,
        eventId,
        message: `Wydarzenie "${eventData.title}" zostało usunięte`,
        timestamp: Timestamp.now(),
        metadata: {
          eventTitle: eventData.title,
          guestCount: eventData.guestCount,
          eventDate: eventData.date,
        },
      });

      // 5. Usuń powiadomienia związane z wydarzeniem
      const notificationsQuery = query(
        collection(db, COLLECTIONS.NOTIFICATIONS),
        where('eventId', '==', eventId)
      );
      const notificationsSnapshot = await getDocs(notificationsQuery);
      notificationsSnapshot.forEach(notificationDoc => {
        const notificationData = notificationDoc.data();

        // Firestore rules pozwalają usuwać tylko powiadomienia należące do aktualnego użytkownika
        if (notificationData?.userId === eventData.userId) {
          batch.delete(notificationDoc.ref);
        }
      });

      // 6. Usuń samo wydarzenie
      batch.delete(doc(db, COLLECTIONS.EVENTS, eventId)); // Wykonaj wszystkie operacje w batchu
      await batch.commit();

      // Track analytics for event deletion
      try {
        await AnalyticsService.trackMetric(
          eventData.userId,
          'event_deleted',
          1,
          {
            eventType: eventData.category || 'other',
            hadGuests: eventData.guestCount > 0,
            guestCount: eventData.guestCount,
            eventStatus: eventData.status,
          },
          eventId
        );
      } catch (analyticsError) {
        console.warn(
          'Failed to track event deletion analytics:',
          analyticsError
        );
      }

      // Create notification for event deletion
      try {
        await notificationService.createSystemNotification(
          eventData.userId,
          'Wydarzenie usunięte',
          `Wydarzenie "${eventData.title}" zostało pomyślnie usunięte`,
          'medium'
        );
      } catch (notificationError) {
        console.warn(
          'Failed to create deletion notification:',
          notificationError
        );
      }

      // Clear search cache after deleting event
      SearchService.clearCache();
    } catch (error: any) {
      throw new Error(`Błąd podczas usuwania wydarzenia: ${error.message}`);
    }
  }

  // Duplicate event
  static async duplicateEvent(
    eventId: string,
    userId: string,
    duplicateData: {
      title: string;
      date: Date;
      includeGuests: boolean;
      guestAction: 'copy' | 'invite' | 'none';
    }
  ): Promise<Event> {
    try {
      // Get original event
      const originalEvent = await this.getEventById(eventId, userId);
      if (!originalEvent) {
        throw new Error('Oryginalne wydarzenie nie zostało znalezione');
      }

      // Create duplicate event data
      const duplicateEventData: Omit<FirebaseEvent, 'id'> = {
        userId,
        title: duplicateData.title,
        description: originalEvent.description,
        date: Timestamp.fromDate(duplicateData.date),
        location: originalEvent.location,
        maxGuests: originalEvent.maxGuests,
        status: 'draft',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        category: 'other',
        tags: [],
        isPublic: false,
        settings: {
          allowGuestInvites: false,
          requireApproval: false,
          sendReminders: true,
          reminderDays: [1, 7],
        },
        guestCount: 0,
        acceptedCount: 0,
        declinedCount: 0,
        pendingCount: 0,
        maybeCount: 0,
        dresscode: originalEvent.dresscode || '',
        additionalInfo: originalEvent.additionalInfo || '',
      };

      // Create the duplicate event
      const docRef = await addDoc(
        collection(db, COLLECTIONS.EVENTS),
        duplicateEventData
      );
      const newEventId = docRef.id;

      // Handle guests if requested
      if (
        duplicateData.includeGuests &&
        originalEvent.guests &&
        originalEvent.guests.length > 0
      ) {
        const batch = writeBatch(db);
        let guestCount = 0;

        for (const originalGuest of originalEvent.guests) {
          const guestData = {
            userId,
            eventId: newEventId,
            email: originalGuest.email,
            firstName: originalGuest.firstName,
            lastName: originalGuest.lastName,
            status:
              duplicateData.guestAction === 'invite' ? 'pending' : 'pending',
            invitedAt: Timestamp.now(),
            createdAt: Timestamp.now(),
            phone: originalGuest.phone || '',
            dietaryRestrictions: originalGuest.dietaryRestrictions || '',
            plusOne: originalGuest.plusOne || false,
            notes: originalGuest.notes || '',
            eventName: duplicateData.title,
            eventDate: Timestamp.fromDate(duplicateData.date),
            rsvpToken: Math.random().toString(36).substring(2, 15),
          };

          const guestRef = doc(collection(db, COLLECTIONS.GUESTS));
          batch.set(guestRef, guestData);
          guestCount++;
        }

        // Update event with guest count
        batch.update(docRef, {
          guestCount,
          pendingCount: guestCount,
        });

        await batch.commit();

        // Create activity for duplication
        await addDoc(collection(db, COLLECTIONS.ACTIVITIES), {
          type: 'event_duplicated',
          userId,
          eventId: newEventId,
          message: `Wydarzenie "${duplicateData.title}" zostało zduplikowane z "${originalEvent.title}"`,
          timestamp: Timestamp.now(),
          metadata: {
            originalEventId: eventId,
            originalEventTitle: originalEvent.title,
            newEventTitle: duplicateData.title,
            guestsCopied: guestCount,
            guestAction: duplicateData.guestAction,
          },
        });
      }

      // Get the created event
      const createdEvent = await this.getEventById(newEventId, userId);
      if (!createdEvent) {
        throw new Error('Nie udało się pobrać zduplikowanego wydarzenia');
      }

      return createdEvent;
    } catch (error: any) {
      throw new Error(`Błąd podczas duplikowania wydarzenia: ${error.message}`);
    }
  }

  // Get user events with pagination
  static async getUserEvents(
    userId: string,
    filters: EventFilters = {},
    pageSize: number = 10,
    lastDoc?: QueryDocumentSnapshot<DocumentData>
  ): Promise<{
    events: Event[];
    lastDoc: QueryDocumentSnapshot<DocumentData> | null;
    hasMore: boolean;
  }> {
    try {
      let q = query(
        collection(db, COLLECTIONS.EVENTS),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(pageSize)
      );

      // Apply filters
      if (filters.status) {
        q = query(q, where('status', '==', filters.status));
      }

      if (filters.category) {
        q = query(q, where('category', '==', filters.category));
      }

      if (filters.dateFrom) {
        q = query(q, where('date', '>=', Timestamp.fromDate(filters.dateFrom)));
      }

      if (filters.dateTo) {
        q = query(q, where('date', '<=', Timestamp.fromDate(filters.dateTo)));
      }

      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const querySnapshot = await getDocs(q);
      const events: Event[] = [];

      querySnapshot.forEach(doc => {
        const eventData = doc.data() as FirebaseEvent;
        events.push(this.convertFirebaseEventToEvent(doc.id, eventData));
      });

      // Apply search filter in memory if needed
      let filteredEvents = events;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredEvents = events.filter(
          event =>
            event.title.toLowerCase().includes(searchLower) ||
            event.description.toLowerCase().includes(searchLower) ||
            event.location.toLowerCase().includes(searchLower)
        );
      }

      const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
      const hasMore = querySnapshot.docs.length === pageSize;

      return {
        events: filteredEvents,
        lastDoc: lastVisible || null,
        hasMore,
      };
    } catch (error: any) {
      throw new Error(`Błąd podczas pobierania wydarzeń: ${error.message}`);
    }
  }   // Get event statistics
  static async getEventStats(userId: string): Promise<EventStats> {
    const start = Date.now();
    try {


      const eventsQuery = query(
        collection(db, COLLECTIONS.EVENTS),
        where('userId', '==', userId)
      );
      const eventsSnapshot = await getDocs(eventsQuery);




      // Jeśli brak wydarzeń w bazie, zwróć przykładowe dane do testowania
      if (eventsSnapshot.size === 0) {
        console.log(
          'getEventStats: Brak wydarzeń w bazie, zwracam przykładowe dane'
        );
        const mockStats: EventStats = {
          totalEvents: 5,
          activeEvents: 2,
          completedEvents: 2,
          draftEvents: 1,
          cancelledEvents: 0,
          totalGuests: 47,
          acceptedGuests: 35,
          pendingGuests: 8,
          declinedGuests: 4,
          responseRate: 83, // (35 + 4) / 47 * 100
          eventsThisMonth: 3,
          guestsThisMonth: 28,
          upcomingEvents: 2,
        };
        console.log(
          'getEventStats: Zwracam przykładowe statystyki:',
          mockStats
        );
        return mockStats;
      }

      const events: FirebaseEvent[] = [];
      eventsSnapshot.forEach(doc => {
        const eventData = { id: doc.id, ...doc.data() } as FirebaseEvent;
        events.push(eventData);
      });

      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const stats: EventStats = {
        totalEvents: events.length,
        activeEvents: events.filter(e => e.status === 'active').length,
        completedEvents: events.filter(e => e.status === 'completed').length,
        draftEvents: events.filter(e => e.status === 'draft').length,
        cancelledEvents: events.filter(e => e.status === 'cancelled').length,
        totalGuests: events.reduce(
          (acc, event) => acc + (event.guestCount || 0),
          0
        ),
        acceptedGuests: events.reduce(
          (acc, event) => acc + (event.acceptedCount || 0),
          0
        ),
        pendingGuests: events.reduce(
          (acc, event) => acc + (event.pendingCount || 0),
          0
        ),
        declinedGuests: events.reduce(
          (acc, event) => acc + (event.declinedCount || 0),
          0
        ),
        responseRate: 0,
        eventsThisMonth: events.filter(
          event => event.createdAt && event.createdAt.toDate() >= thisMonth
        ).length,
        guestsThisMonth: events
          .filter(
            event => event.createdAt && event.createdAt.toDate() >= thisMonth
          )
          .reduce((acc, event) => acc + (event.guestCount || 0), 0),
        upcomingEvents: events.filter(
          event =>
            event.status === 'active' && event.date && event.date.toDate() > now
        ).length,
      };


      // Calculate response rate
      if (stats.totalGuests > 0) {
        stats.responseRate = Math.round(
          ((stats.acceptedGuests + stats.declinedGuests) / stats.totalGuests) *
            100
        );
      }

      return stats;
    } catch (error: any) {
      console.error('getEventStats: Błąd podczas pobierania statystyk:', error);

      // W przypadku błędu, zwróć przykładowe dane
      const fallbackStats: EventStats = {
        totalEvents: 3,
        activeEvents: 1,
        completedEvents: 1,
        draftEvents: 1,
        cancelledEvents: 0,
        totalGuests: 25,
        acceptedGuests: 18,
        pendingGuests: 5,
        declinedGuests: 2,
        responseRate: 80,
        eventsThisMonth: 2,
        guestsThisMonth: 15,
        upcomingEvents: 1,
      };

      return fallbackStats;
    }
  }

  // Get chart data for last 6 months
  static async getEventChartData(userId: string): Promise<EventChartData[]> {
    const start = Date.now();
    try {

      const now = new Date();
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(now.getMonth() - 5); // Get last 6 months including current
      sixMonthsAgo.setDate(1); // Start from first day of the month
      sixMonthsAgo.setHours(0, 0, 0, 0);

      console.log('Chart data query range:', sixMonthsAgo, 'to', now);
      console.log('Querying for userId:', userId);

      // First try to get all user events, then filter by date
      const eventsQuery = query(
        collection(db, COLLECTIONS.EVENTS),
        where('userId', '==', userId)
      );

      const eventsSnapshot = await getDocs(eventsQuery);

      console.log('Found events:', eventsSnapshot.size);

      // Initialize chart data for last 6 months
      const chartData: EventChartData[] = [];
      for (let i = 0; i < 6; i++) {
        const date = new Date();
        date.setMonth(now.getMonth() - (5 - i));
        date.setDate(1);
        date.setHours(0, 0, 0, 0);

        chartData.push({
          month: date.toLocaleDateString('pl-PL', { month: 'short' }),
          events: 0,
          guests: 0,
          date: new Date(date),
        });
      }

      // Process events and aggregate by month
      eventsSnapshot.forEach(doc => {
        const event = doc.data() as FirebaseEvent;
        const eventDate = event.createdAt.toDate();

        // Skip events outside of our 6 month range
        if (eventDate < sixMonthsAgo) {
          console.log('Skipping event outside range:', event.title, eventDate);
          return;
        }

        const eventMonth = new Date(
          eventDate.getFullYear(),
          eventDate.getMonth(),
          1
        );

        console.log(
          'Processing event:',
          event.title,
          'created at:',
          eventDate,
          'guests:',
          event.guestCount
        );

        // Find matching month in chart data
        const chartEntry = chartData.find(
          entry => entry.date.getTime() === eventMonth.getTime()
        );

        if (chartEntry) {
          chartEntry.events += 1;
          chartEntry.guests += event.guestCount || 0;
          console.log(
            'Added to month:',
            chartEntry.month,
            'total events:',
            chartEntry.events,
            'total guests:',
            chartEntry.guests
          );
        } else {
          console.log('No matching month found for:', eventMonth);
        }
      });

      console.log('Final chart data:', chartData);
      return chartData;
    } catch (error) {
      console.error('Error getting chart data:', error);

      // Return mock data on error
      const now = new Date();
      const mockData: EventChartData[] = [];

      for (let i = 0; i < 6; i++) {
        const date = new Date();
        date.setMonth(now.getMonth() - (5 - i));
        date.setDate(1);

        mockData.push({
          month: date.toLocaleDateString('pl-PL', { month: 'short' }),
          events: Math.floor(Math.random() * 8) + 1,
          guests: Math.floor(Math.random() * 50) + 10,
          date: new Date(date),
        });
      }

      return mockData;
    }
  }

  // Get recent activities
  static async getRecentActivities(
    userId: string,
    limitCount: number = 10
  ): Promise<Activity[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.ACTIVITIES),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      const activities = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date(),
      })) as Activity[];

      return activities;
    } catch (error: any) {
      console.error('Error fetching activities:', error);
      return []; // Return empty array on error
    }
  }

  // Real-time events listener
  static subscribeToUserEvents(
    userId: string,
    callback: (
      events: Event[],
      changeType?: 'added' | 'modified' | 'removed',
      changedEventId?: string
    ) => void,
    filters: EventFilters = {}
  ): () => void {
    // Tymczasowo używamy tylko where, bez orderBy, dopóki indeks się nie zbuduje
    let q = query(
      collection(db, COLLECTIONS.EVENTS),
      where('userId', '==', userId)
    );

    // Apply filters
    if (filters.status) {
      q = query(q, where('status', '==', filters.status));
    }

    let previousEvents: Event[] = [];

    return onSnapshot(
      q,
      querySnapshot => {
        const events: Event[] = [];
        let changeType: 'added' | 'modified' | 'removed' | undefined;
        let changedEventId: string | undefined;

        // Process document changes for real-time detection
        querySnapshot.docChanges().forEach(change => {
          if (
            change.type === 'added' &&
            !previousEvents.find(e => e.id === change.doc.id)
          ) {
            changeType = 'added';
            changedEventId = change.doc.id;
          } else if (change.type === 'modified') {
            changeType = 'modified';
            changedEventId = change.doc.id;
          } else if (change.type === 'removed') {
            changeType = 'removed';
            changedEventId = change.doc.id;
          }
        });

        // Convert all events
        querySnapshot.forEach(doc => {
          const eventData = doc.data() as FirebaseEvent;
          events.push(this.convertFirebaseEventToEvent(doc.id, eventData));
        });

        // Apply search filter and manual sorting
        let filteredEvents = events;

        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          filteredEvents = events.filter(
            event =>
              event.title.toLowerCase().includes(searchLower) ||
              event.description.toLowerCase().includes(searchLower) ||
              event.location.toLowerCase().includes(searchLower)
          );
        }

        // Sortujemy ręcznie po createdAt
        filteredEvents.sort(
          (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
        );

        // Update previous events for next comparison
        previousEvents = [...filteredEvents];

        callback(filteredEvents, changeType, changedEventId);
      },
      error => {
        console.error('Error in events subscription:', error);
        // Fallback: call with empty array to indicate error
        callback([], 'removed', undefined);
      }
    );
  }
  // Convert Firebase event to app event
  private static convertFirebaseEventToEvent(
    id: string,
    firebaseEvent: FirebaseEvent
  ): Event {
    return {
      id,
      userId: firebaseEvent.userId,
      title: firebaseEvent.title,
      description: firebaseEvent.description,
      date: firebaseEvent.date.toDate(),
      location: firebaseEvent.location,
      maxGuests: firebaseEvent.maxGuests,
      status: firebaseEvent.status,
      createdAt: firebaseEvent.createdAt.toDate(),
      guestCount: firebaseEvent.guestCount,
      acceptedCount: firebaseEvent.acceptedCount,
      pendingCount: firebaseEvent.pendingCount,
      declinedCount: firebaseEvent.declinedCount,
      maybeCount: firebaseEvent.maybeCount || 0,
      dresscode: firebaseEvent.dresscode,
      additionalInfo: firebaseEvent.additionalInfo,
      guests: [], // Używamy liczników zamiast tablicy gości
    };
  }

  // Helper function to create activity with notification
  static async createActivityWithNotification(
    activityData: {
      type: Activity['type'];
      message: string;
      eventId?: string;
      contactId?: string;
      eventGuestId?: string;
    },
    userId: string
  ): Promise<void> {
    try {
      // Create activity
      const activityRef = await addDoc(collection(db, COLLECTIONS.ACTIVITIES), {
        ...activityData,
        timestamp: Timestamp.now(),
        userId: userId,
      });

      // Create notification from activity
      const activity: Activity = {
        id: activityRef.id,
        ...activityData,
        timestamp: new Date(),
      };

      await notificationService.createFromActivity(activity, userId);
    } catch (error) {
      console.error('Error creating activity with notification:', error);
      // Don't throw - this is a non-critical operation
    }
  }

  // Monitor Firebase connection status
  static subscribeToConnectionStatus(
    callback: (connected: boolean) => void
  ): () => void {
    // Simple connection monitoring using online/offline events
    const handleOnline = () => callback(true);
    const handleOffline = () => callback(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial state
    callback(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }

  // Batch operations for better performance
  static async batchUpdateEvents(
    updates: { eventId: string; data: Partial<UpdateEventData> }[]
  ): Promise<void> {
    const batch = writeBatch(db);

    updates.forEach(({ eventId, data }) => {
      const eventRef = doc(db, COLLECTIONS.EVENTS, eventId);
      batch.update(eventRef, {
        ...data,
        updatedAt: Timestamp.now(),
      });
    });

    await batch.commit();
  }
}
