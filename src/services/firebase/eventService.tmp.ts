// services/firebase/eventService.ts
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  writeBatch,
  Timestamp,
  QueryDocumentSnapshot,
  DocumentData
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../../config/firebase';
import { FirebaseEvent, COLLECTIONS, CreateEventData as BaseCreateEventData } from '../../types/firebase';
import { Event, Activity, Guest } from '../../types';

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

export class EventService {
  // Get event by ID
  static async getEventById(eventId: string, userId?: string): Promise<Event | null> {
    try {
      const eventDoc = await getDoc(doc(db, COLLECTIONS.EVENTS, eventId));
      
      if (!eventDoc.exists()) {
        return null;
      }

      const eventData = eventDoc.data() as FirebaseEvent;
      
      // Sprawdź uprawnienia użytkownika
      if (userId && eventData.userId !== userId) {
        console.warn('Brak dostępu do wydarzenia:', eventId);
        return null;
      }

      // Pobierz gości wydarzenia
      const guestsQuery = query(
        collection(db, COLLECTIONS.GUESTS),
        where('eventId', '==', eventId),
        orderBy('createdAt', 'desc')
      );
      
      const guestsSnapshot = await getDocs(guestsQuery);
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
      throw new Error(`Błąd podczas pobierania wydarzenia: ${error.message}`);
    }
  }

  // Create new event
  static async createEvent(userId: string, eventData: CreateEventData): Promise<Event> {
    try {
      let imageUrl: string | undefined;

      // Upload image if provided
      if (eventData.image) {
        const imageRef = ref(storage, `events/${userId}/${Date.now()}_${eventData.image.name}`);
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
          reminderDays: [1, 7]
        },
        guestCount: eventData.guestCount || 0,
        acceptedCount: eventData.acceptedCount || 0,
        declinedCount: eventData.declinedCount || 0,
        pendingCount: eventData.pendingCount || 0,
        dresscode: eventData.dresscode,
        additionalInfo: eventData.additionalInfo
      };

      // Dodaj imageUrl tylko jeśli został wygenerowany
      if (imageUrl) {
        eventDoc.imageUrl = imageUrl;
      }

      const docRef = await addDoc(collection(db, COLLECTIONS.EVENTS), eventDoc);
      
      return this.convertFirebaseEventToEvent(docRef.id, { ...eventDoc, id: docRef.id });
    } catch (error: any) {
      throw new Error(`Błąd podczas tworzenia wydarzenia: ${error.message}`);
    }
  }

  // Update event
  static async updateEvent(eventId: string, updateData: UpdateEventData): Promise<Event> {
    try {
      const eventRef = doc(db, COLLECTIONS.EVENTS, eventId);
      const updateFields: Partial<FirebaseEvent> = {
        updatedAt: Timestamp.now()
      };

      if (updateData.title) updateFields.title = updateData.title;
      if (updateData.description) updateFields.description = updateData.description;
      if (updateData.date) updateFields.date = Timestamp.fromDate(updateData.date);
      if (updateData.location) updateFields.location = updateData.location;
      if (updateData.maxGuests) updateFields.maxGuests = updateData.maxGuests;
      if (updateData.category) updateFields.category = updateData.category;
      if (updateData.tags) updateFields.tags = updateData.tags;
      if (updateData.isPublic !== undefined) updateFields.isPublic = updateData.isPublic;
      if (updateData.settings) updateFields.settings = updateData.settings;
      if (updateData.status) updateFields.status = updateData.status;

      // Handle image upload
      if (updateData.image) {
        const imageRef = ref(storage, `events/${eventId}/${Date.now()}_${updateData.image.name}`);
        await uploadBytes(imageRef, updateData.image);
        const imageUrl = await getDownloadURL(imageRef);
        updateFields.imageUrl = imageUrl;
      }

      await updateDoc(eventRef, updateFields);

      // Get updated event
      const updatedDoc = await getDoc(eventRef);
      const eventData = updatedDoc.data() as FirebaseEvent;
      
      return this.convertFirebaseEventToEvent(eventId, eventData);
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
      guestsSnapshot.forEach((guestDoc) => {
        batch.delete(guestDoc.ref);
      });

      // 3. Usuń powiązane aktywności
      const activitiesQuery = query(
        collection(db, COLLECTIONS.ACTIVITIES),
        where('eventId', '==', eventId)
      );
      const activitiesSnapshot = await getDocs(activitiesQuery);
      activitiesSnapshot.forEach((activityDoc) => {
        batch.delete(activityDoc.ref);
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
          eventDate: eventData.date
        }
      });

      // 5. Usuń powiadomienia związane z wydarzeniem
      const notificationsQuery = query(
        collection(db, COLLECTIONS.NOTIFICATIONS),
        where('eventId', '==', eventId)
      );
      const notificationsSnapshot = await getDocs(notificationsQuery);
      notificationsSnapshot.forEach((notificationDoc) => {
        batch.delete(notificationDoc.ref);
      });

      // 6. Usuń samo wydarzenie
      batch.delete(doc(db, COLLECTIONS.EVENTS, eventId));

      // Wykonaj wszystkie operacje w batchu
      await batch.commit();

    } catch (error: any) {
      throw new Error(`Błąd podczas usuwania wydarzenia: ${error.message}`);
    }
  }

  // Get user events with pagination
  static async getUserEvents(
    userId: string,
    filters: EventFilters = {},
    pageSize: number = 10,
    lastDoc?: QueryDocumentSnapshot<DocumentData>
  ): Promise<{ events: Event[]; lastDoc: QueryDocumentSnapshot<DocumentData> | null; hasMore: boolean }> {
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

      querySnapshot.forEach((doc) => {
        const eventData = doc.data() as FirebaseEvent;
        events.push(this.convertFirebaseEventToEvent(doc.id, eventData));
      });

      // Apply search filter in memory if needed
      let filteredEvents = events;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredEvents = events.filter(event =>
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
        hasMore
      };
    } catch (error: any) {
      throw new Error(`Błąd podczas pobierania wydarzeń: ${error.message}`);
    }
  }

  // Get event statistics
  static async getEventStats(userId: string): Promise<EventStats> {
    try {
      const eventsQuery = query(
        collection(db, COLLECTIONS.EVENTS),
        where('userId', '==', userId)
      );
      const eventsSnapshot = await getDocs(eventsQuery);

      const events: FirebaseEvent[] = [];
      eventsSnapshot.forEach((doc) => {
        events.push({ id: doc.id, ...doc.data() } as FirebaseEvent);
      });

      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const stats: EventStats = {
        totalEvents: events.length,
        activeEvents: events.filter(e => e.status === 'active').length,
        completedEvents: events.filter(e => e.status === 'completed').length,
        draftEvents: events.filter(e => e.status === 'draft').length,
        cancelledEvents: events.filter(e => e.status === 'cancelled').length,
        totalGuests: events.reduce((acc, event) => acc + event.guestCount, 0),
        acceptedGuests: events.reduce((acc, event) => acc + event.acceptedCount, 0),
        pendingGuests: events.reduce((acc, event) => acc + event.pendingCount, 0),
        declinedGuests: events.reduce((acc, event) => acc + event.declinedCount, 0),
        responseRate: 0,
        eventsThisMonth: events.filter(event => 
          event.createdAt.toDate() >= thisMonth
        ).length,
        guestsThisMonth: events
          .filter(event => event.createdAt.toDate() >= thisMonth)
          .reduce((acc, event) => acc + event.guestCount, 0),
        upcomingEvents: events.filter(event => 
          event.status === 'active' && event.date.toDate() > now
        ).length
      };

      // Calculate response rate
      if (stats.totalGuests > 0) {
        stats.responseRate = Math.round(
          ((stats.acceptedGuests + stats.declinedGuests) / stats.totalGuests) * 100
        );
      }

      return stats;
    } catch (error: any) {
      throw new Error(`Błąd podczas pobierania statystyk: ${error.message}`);
    }
  }

  // Get recent activities
  static async getRecentActivities(userId: string, limitCount: number = 10): Promise<Activity[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.ACTIVITIES),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Activity[];
    } catch (error: any) {
      throw new Error(`Błąd podczas pobierania aktywności: ${error.message}`);
    }
  }

  // Real-time events listener
  static subscribeToUserEvents(
    userId: string,
    callback: (events: Event[]) => void,
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

    return onSnapshot(q, (querySnapshot) => {
      const events: Event[] = [];
      querySnapshot.forEach((doc) => {
        const eventData = doc.data() as FirebaseEvent;
        events.push(this.convertFirebaseEventToEvent(doc.id, eventData));
      });

      // Apply search filter and manual sorting
      let filteredEvents = events;
      
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredEvents = events.filter(event =>
          event.title.toLowerCase().includes(searchLower) ||
          event.description.toLowerCase().includes(searchLower) ||
          event.location.toLowerCase().includes(searchLower)
        );
      }
      
      // Sortujemy ręcznie po createdAt
      filteredEvents.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      callback(filteredEvents);
    });
  }

  // Convert Firebase event to app event
  private static convertFirebaseEventToEvent(id: string, firebaseEvent: FirebaseEvent): Event {
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
      guests: [] // Używamy liczników zamiast tablicy gości
    };
  }
}
