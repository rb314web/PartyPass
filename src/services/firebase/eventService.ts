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
import { FirebaseEvent, COLLECTIONS } from '../../types/firebase';
import { Event } from '../../types';

export interface CreateEventData {
  title: string;
  description: string;
  date: Date;
  location: string;
  maxGuests: number;
  category: string;
  tags: string[];
  isPublic: boolean;
  settings: {
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
        imageUrl,
        category: eventData.category,
        tags: eventData.tags,
        isPublic: eventData.isPublic,
        settings: eventData.settings,
        guestCount: 0,
        acceptedCount: 0,
        declinedCount: 0,
        pendingCount: 0
      };

      const docRef = await addDoc(collection(db, COLLECTIONS.EVENTS), eventDoc);
      
      return this.convertFirebaseEventToEvent(docRef.id, { ...eventDoc, id: docRef.id });
    } catch (error: any) {
      throw new Error(`Błąd podczas tworzenia wydarzenia: ${error.message}`);
    }
  }

  // Get event by ID
  static async getEventById(eventId: string): Promise<Event | null> {
    try {
      const eventDoc = await getDoc(doc(db, COLLECTIONS.EVENTS, eventId));
      
      if (!eventDoc.exists()) {
        return null;
      }

      const eventData = eventDoc.data() as FirebaseEvent;
      return this.convertFirebaseEventToEvent(eventId, eventData);
    } catch (error: any) {
      throw new Error(`Błąd podczas pobierania wydarzenia: ${error.message}`);
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
      const batch = writeBatch(db);

      // Delete event
      batch.delete(doc(db, COLLECTIONS.EVENTS, eventId));

      // Delete related guests
      const guestsQuery = query(
        collection(db, COLLECTIONS.GUESTS),
        where('eventId', '==', eventId)
      );
      const guestsSnapshot = await getDocs(guestsQuery);
      guestsSnapshot.forEach((guestDoc) => {
        batch.delete(guestDoc.ref);
      });

      // Delete related activities
      const activitiesQuery = query(
        collection(db, COLLECTIONS.ACTIVITIES),
        where('eventId', '==', eventId)
      );
      const activitiesSnapshot = await getDocs(activitiesQuery);
      activitiesSnapshot.forEach((activityDoc) => {
        batch.delete(activityDoc.ref);
      });

      await batch.commit();
    } catch (error: any) {
      throw new Error(`Błąd podczas usuwania wydarzenia: ${error.message}`);
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

  // Real-time events listener
  static subscribeToUserEvents(
    userId: string,
    callback: (events: Event[]) => void,
    filters: EventFilters = {}
  ): () => void {
    let q = query(
      collection(db, COLLECTIONS.EVENTS),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
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

      // Apply search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const filteredEvents = events.filter(event =>
          event.title.toLowerCase().includes(searchLower) ||
          event.description.toLowerCase().includes(searchLower) ||
          event.location.toLowerCase().includes(searchLower)
        );
        callback(filteredEvents);
      } else {
        callback(events);
      }
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
      guests: [] // Guests will be loaded separately
    };
  }
}
