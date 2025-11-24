// services/firebase/guestService.ts
import type { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import {
  collection,
  doc as firebaseDoc,
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
  Timestamp,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Guest, CreateGuestData, UpdateGuestData } from '../../types';
import {
  FirebaseGuest,
  FirebaseEvent,
  COLLECTIONS,
} from '../../types/firebase';
import { AnalyticsService } from './analyticsService';

export interface GuestFilters {
  eventId?: string;
  status?: Guest['status'];
  search?: string;
  userId?: string;
}

const convertFirebaseGuestToGuest = (
  guestDoc: FirebaseGuest & { id: string },
  eventData?: FirebaseEvent
): Guest => {
  return {
    id: guestDoc.id,
    userId: guestDoc.userId,
    eventId: guestDoc.eventId,
    firstName: guestDoc.firstName,
    lastName: guestDoc.lastName,
    email: guestDoc.email,
    status: guestDoc.status,
    invitedAt: guestDoc.invitedAt.toDate(),
    respondedAt: guestDoc.respondedAt?.toDate(),
    createdAt: guestDoc.createdAt.toDate(),
    updatedAt: guestDoc.updatedAt?.toDate(),
    phone: guestDoc.phoneNumber,
    dietaryRestrictions: guestDoc.dietaryRestrictions,
    notes: guestDoc.notes,
    plusOne: !!guestDoc.plusOne,
    eventName: eventData?.title || '',
    eventDate: eventData?.date.toDate() || new Date(),
    rsvpToken: guestDoc.rsvpToken,
  };
};

export class GuestService {
  // Get guests for user with pagination
  static async getUserGuests(
    userId: string,
    filters: GuestFilters = {},
    pageSize: number = 10,
    lastDoc?: QueryDocumentSnapshot<DocumentData>
  ): Promise<{
    guests: Guest[];
    lastDoc: QueryDocumentSnapshot<DocumentData> | null;
    hasMore: boolean;
  }> {
    try {
      let constraints: Array<QueryConstraint> = [
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
      ];

      // Dodaj filtry tylko jeśli są zdefiniowane
      if (filters.eventId) {
        constraints.push(where('eventId', '==', filters.eventId));
      }

      if (filters.status) {
        constraints.push(where('status', '==', filters.status));
      }

      if (lastDoc) {
        constraints.push(startAfter(lastDoc));
      }

      constraints.push(limit(pageSize));

      let q = query(collection(db, COLLECTIONS.GUESTS), ...constraints);

      const querySnapshot = await getDocs(q);
      const guests: Guest[] = [];

      for (const doc of querySnapshot.docs) {
        const guestData = doc.data() as FirebaseGuest;

        // Pobierz dane wydarzenia dla każdego gościa
        const eventRef = firebaseDoc(db, COLLECTIONS.EVENTS, guestData.eventId);
        const eventDoc = await getDoc(eventRef);
        const eventData = eventDoc.data() as FirebaseEvent | undefined;

        if (eventData) {
          guests.push(
            convertFirebaseGuestToGuest({ ...guestData, id: doc.id }, eventData)
          );
        }
      }

      // Apply search filter if needed
      let filteredGuests = guests;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredGuests = guests.filter(
          guest =>
            guest.firstName.toLowerCase().includes(searchLower) ||
            guest.lastName.toLowerCase().includes(searchLower) ||
            guest.email.toLowerCase().includes(searchLower)
        );
      }

      const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
      const hasMore = querySnapshot.docs.length === pageSize;

      return {
        guests: filteredGuests,
        lastDoc: lastVisible || null,
        hasMore,
      };
    } catch (error: any) {
      throw new Error(`Błąd podczas pobierania gości: ${error.message}`);
    }
  }

  // Create guest
  static async createGuest(
    userId: string,
    eventId: string,
    guestData: CreateGuestData
  ): Promise<Guest> {
    try {
      const newGuest: Omit<FirebaseGuest, 'id'> = {
        userId,
        eventId,
        firstName: guestData.firstName || '',
        lastName: guestData.lastName || '',
        email: guestData.email || '',
        phoneNumber: guestData.phone || '',
        status: 'pending',
        invitedAt: Timestamp.now(),
        createdAt: Timestamp.now(),
        dietaryRestrictions: guestData.dietaryRestrictions || '',
        notes: guestData.notes || '',
        plusOne: guestData.plusOne || false,
      };

      const docRef = await addDoc(collection(db, COLLECTIONS.GUESTS), newGuest);
      // Generate RSVP token after creating the guest
      try {
        const { RSVPService } = await import('./rsvpService');
        const rsvpToken = await RSVPService.generateRSVPToken(
          docRef.id,
          eventId
        );

        // Update guest with the RSVP token
        await updateDoc(docRef, {
          rsvpToken: rsvpToken.token,
        });

        newGuest.rsvpToken = rsvpToken.token;
      } catch (rsvpError) {
        console.warn('Failed to generate RSVP token for guest:', rsvpError);
        // Guest is still created, just without RSVP token
        newGuest.rsvpToken = undefined;
      }

      // Track analytics for guest invitation
      try {
        await AnalyticsService.trackMetric(
          userId,
          'guest_invited',
          1,
          {
            eventId,
            guestEmail: guestData.email,
            hasPlusOne: guestData.plusOne || false,
            hasDietaryRestrictions: !!guestData.dietaryRestrictions,
            hasPhone: !!guestData.phone,
          },
          eventId,
          docRef.id
        );
      } catch (analyticsError) {
        console.warn(
          'Failed to track guest invitation analytics:',
          analyticsError
        );
      }

      // Update event guest counts
      const eventRef = firebaseDoc(db, COLLECTIONS.EVENTS, eventId);
      const eventDoc = await getDoc(eventRef);
      const eventData = eventDoc.data() as FirebaseEvent | undefined;

      if (eventData) {
        const updates = {
          guestCount: (eventData.guestCount || 0) + 1,
          pendingCount: (eventData.pendingCount || 0) + 1,
        };

        await updateDoc(eventRef, updates);
      }

      return convertFirebaseGuestToGuest(
        { ...newGuest, id: docRef.id },
        eventData
      );
    } catch (error: any) {
      throw new Error(`Błąd podczas dodawania gościa: ${error.message}`);
    }
  }

  // Update guest
  static async updateGuest(
    guestId: string,
    updateData: UpdateGuestData
  ): Promise<Guest> {
    try {
      const guestRef = firebaseDoc(db, COLLECTIONS.GUESTS, guestId);
      const guestDoc = await getDoc(guestRef);
      const oldData = guestDoc.data() as FirebaseGuest | undefined;

      if (!oldData) {
        throw new Error('Gość nie istnieje');
      }

      const updateFields: Partial<FirebaseGuest> = {
        updatedAt: Timestamp.now(),
      };

      if (updateData.firstName) updateFields.firstName = updateData.firstName;
      if (updateData.lastName) updateFields.lastName = updateData.lastName;
      if (updateData.email) updateFields.email = updateData.email;
      if (updateData.phone !== undefined)
        updateFields.phoneNumber = updateData.phone;
      if (updateData.dietaryRestrictions !== undefined)
        updateFields.dietaryRestrictions = updateData.dietaryRestrictions;
      if (updateData.notes !== undefined) updateFields.notes = updateData.notes;
      if (typeof updateData.plusOne === 'boolean')
        updateFields.plusOne = updateData.plusOne;
      if (updateData.plusOneDetails !== undefined)
        updateFields.plusOneDetails = updateData.plusOneDetails;

      // Jeśli zmienia się status, zaktualizuj liczniki wydarzenia
      if (updateData.status && updateData.status !== oldData.status) {
        const eventRef = firebaseDoc(db, COLLECTIONS.EVENTS, oldData.eventId);
        const eventDoc = await getDoc(eventRef);
        const eventData = eventDoc.data() as FirebaseEvent | undefined;

        if (eventData) {
          const updates: Partial<FirebaseEvent> = {};

          // Zmniejsz licznik starego statusu
          if (oldData.status === 'accepted') {
            updates.acceptedCount = Math.max(
              0,
              (eventData.acceptedCount || 0) - 1
            );
          } else if (oldData.status === 'declined') {
            updates.declinedCount = Math.max(
              0,
              (eventData.declinedCount || 0) - 1
            );
          } else if (oldData.status === 'pending') {
            updates.pendingCount = Math.max(
              0,
              (eventData.pendingCount || 0) - 1
            );
          }

          // Zwiększ licznik nowego statusu
          if (updateData.status === 'accepted') {
            updates.acceptedCount = (eventData.acceptedCount || 0) + 1;
          } else if (updateData.status === 'declined') {
            updates.declinedCount = (eventData.declinedCount || 0) + 1;
          } else if (updateData.status === 'pending') {
            updates.pendingCount = (eventData.pendingCount || 0) + 1;
          }

          await updateDoc(eventRef, updates);
        }
        updateFields.status = updateData.status;
        updateFields.respondedAt = Timestamp.now();

        // Track analytics for guest response
        try {
          await AnalyticsService.trackMetric(
            oldData.userId,
            'guest_responded',
            1,
            {
              eventId: oldData.eventId,
              oldStatus: oldData.status,
              newStatus: updateData.status,
              guestEmail: oldData.email,
              responseTime: Date.now() - oldData.invitedAt.toMillis(),
            },
            oldData.eventId,
            guestId
          );
        } catch (analyticsError) {
          console.warn(
            'Failed to track guest response analytics:',
            analyticsError
          );
        }
      }

      await updateDoc(guestRef, updateFields);

      // Get updated guest with event data
      const updatedDoc = await getDoc(guestRef);
      const updatedData = updatedDoc.data() as FirebaseGuest;
      const eventDoc = await getDoc(
        firebaseDoc(db, COLLECTIONS.EVENTS, oldData.eventId)
      );
      const eventData = eventDoc.data() as FirebaseEvent | undefined;

      return convertFirebaseGuestToGuest(
        { ...updatedData, id: guestId },
        eventData
      );
    } catch (error: any) {
      throw new Error(`Błąd podczas aktualizacji gościa: ${error.message}`);
    }
  }

  // Delete guest
  static async deleteGuest(guestId: string): Promise<void> {
    try {
      const guestRef = firebaseDoc(db, COLLECTIONS.GUESTS, guestId);
      const guestDoc = await getDoc(guestRef);
      const guestData = guestDoc.data() as FirebaseGuest | undefined;

      if (!guestData) {
        throw new Error('Gość nie istnieje');
      }

      // Update event counts
      const eventRef = firebaseDoc(db, COLLECTIONS.EVENTS, guestData.eventId);
      const eventDoc = await getDoc(eventRef);
      const eventData = eventDoc.data() as FirebaseEvent | undefined;

      if (eventData) {
        const updates: Partial<FirebaseEvent> = {
          guestCount: Math.max(0, (eventData.guestCount || 0) - 1),
        };

        if (guestData.status === 'accepted') {
          updates.acceptedCount = Math.max(
            0,
            (eventData.acceptedCount || 0) - 1
          );
        } else if (guestData.status === 'declined') {
          updates.declinedCount = Math.max(
            0,
            (eventData.declinedCount || 0) - 1
          );
        } else if (guestData.status === 'pending') {
          updates.pendingCount = Math.max(0, (eventData.pendingCount || 0) - 1);
        }

        await updateDoc(eventRef, updates);
      }

      await deleteDoc(guestRef);
    } catch (error: any) {
      throw new Error(`Błąd podczas usuwania gościa: ${error.message}`);
    }
  }
}
