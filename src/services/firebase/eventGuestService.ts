// services/firebase/eventGuestService.ts
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
  Timestamp
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { EventGuest, CreateEventGuestData, Contact, GuestStatus } from '../../types';
import { COLLECTIONS } from '../../types/firebase';

export class EventGuestService {
  /**
   * Dodaje kontakt do wydarzenia jako gościa
   */
  static async addContactToEvent(
    eventId: string, 
    contactId: string, 
    data: CreateEventGuestData
  ): Promise<EventGuest> {
    try {
      // Sprawdź czy kontakt już istnieje w wydarzeniu
      const existingQuery = query(
        collection(db, COLLECTIONS.GUESTS),
        where('eventId', '==', eventId),
        where('contactId', '==', contactId)
      );
      
      const existingSnapshot = await getDocs(existingQuery);
      if (!existingSnapshot.empty) {
        throw new Error('Ten kontakt jest już dodany do wydarzenia');
      }

      const newEventGuest: any = {
        eventId,
        contactId,
        status: 'pending' as GuestStatus,
        invitedAt: Timestamp.now(),
        plusOneType: data.plusOneType || 'none',
        eventSpecificNotes: data.eventSpecificNotes || '',
        createdAt: Timestamp.now()
      };

      // Dodaj plusOneDetails tylko jeśli zostało podane
      if (data.plusOneDetails) {
        newEventGuest.plusOneDetails = data.plusOneDetails;
      }

      const docRef = await addDoc(
        collection(db, COLLECTIONS.GUESTS), 
        newEventGuest
      );

      // Zaktualizuj liczniki wydarzenia
      await this.updateEventCounts(eventId, 'pending', 'add');

      return {
        id: docRef.id,
        ...newEventGuest,
        invitedAt: newEventGuest.invitedAt.toDate(),
        createdAt: newEventGuest.createdAt.toDate()
      };
    } catch (error: any) {
      throw new Error(`Błąd podczas dodawania kontaktu do wydarzenia: ${error.message}`);
    }
  }

  /**
   * Pobiera gości wydarzenia z danymi kontaktów
   */
  static async getEventGuests(eventId: string): Promise<(EventGuest & { contact: Contact })[]> {
    try {
      const eventGuestsQuery = query(
        collection(db, COLLECTIONS.GUESTS),
        where('eventId', '==', eventId)
      );

      const snapshot = await getDocs(eventGuestsQuery);
      const eventGuests = [];

      for (const eventGuestDoc of snapshot.docs) {
        const eventGuestData = eventGuestDoc.data();
        
        // Pobierz dane kontaktu
        const contactRef = doc(db, COLLECTIONS.CONTACTS, eventGuestData.contactId);
        const contactDoc = await getDoc(contactRef);
        
        if (contactDoc.exists()) {
          const contactData = contactDoc.data() as any;
          
          eventGuests.push({
            id: eventGuestDoc.id,
            eventId: eventGuestData.eventId,
            contactId: eventGuestData.contactId,
            status: eventGuestData.status,
            invitedAt: eventGuestData.invitedAt.toDate(),
            respondedAt: eventGuestData.respondedAt?.toDate(),
            plusOneType: eventGuestData.plusOneType || 'none',
            plusOneDetails: eventGuestData.plusOneDetails,
            rsvpToken: eventGuestData.rsvpToken,
            eventSpecificNotes: eventGuestData.eventSpecificNotes,
            createdAt: eventGuestData.createdAt.toDate(),
            updatedAt: eventGuestData.updatedAt?.toDate(),
            contact: {
              id: contactDoc.id,
              userId: contactData.userId,
              email: contactData.email,
              firstName: contactData.firstName,
              lastName: contactData.lastName,
              phone: contactData.phone,
              dietaryRestrictions: contactData.dietaryRestrictions,
              notes: contactData.notes,
              createdAt: contactData.createdAt?.toDate(),
              updatedAt: contactData.updatedAt?.toDate(),
              tags: contactData.tags
            } as Contact
          });
        }
      }

      // Sortuj lokalnie według daty dodania (najnowsze najpierw)
      eventGuests.sort((a, b) => b.invitedAt.getTime() - a.invitedAt.getTime());

      return eventGuests;
    } catch (error: any) {
      throw new Error(`Błąd podczas pobierania gości wydarzenia: ${error.message}`);
    }
  }

  /**
   * Aktualizuje status gościa
   */
  static async updateGuestStatus(
    eventId: string, 
    contactId: string, 
    newStatus: GuestStatus
  ): Promise<void> {
    try {
      const eventGuestQuery = query(
        collection(db, COLLECTIONS.GUESTS),
        where('eventId', '==', eventId),
        where('contactId', '==', contactId)
      );

      const snapshot = await getDocs(eventGuestQuery);
      
      if (snapshot.empty) {
        throw new Error('Gość nie został znaleziony');
      }

      const eventGuestDoc = snapshot.docs[0];
      const eventGuestData = eventGuestDoc.data();
      const oldStatus = eventGuestData.status;
      
      // Aktualizuj status gościa
      await updateDoc(eventGuestDoc.ref, {
        status: newStatus,
        respondedAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      
      // Zaktualizuj liczniki wydarzenia - usuń ze starego statusu
      await this.updateEventCounts(eventId, oldStatus, 'remove');
      // Dodaj do nowego statusu
      await this.updateEventCounts(eventId, newStatus, 'add');
      
    } catch (error: any) {
      throw new Error(`Błąd podczas aktualizacji statusu gościa: ${error.message}`);
    }
  }

  /**
   * Usuwa gościa z wydarzenia
   */
  static async removeContactFromEvent(eventId: string, contactId: string): Promise<void> {
    try {
      const eventGuestQuery = query(
        collection(db, COLLECTIONS.GUESTS),
        where('eventId', '==', eventId),
        where('contactId', '==', contactId)
      );

      const snapshot = await getDocs(eventGuestQuery);
      
      if (snapshot.empty) {
        throw new Error('Gość nie został znaleziony');
      }

      const eventGuestDoc = snapshot.docs[0];
      const eventGuestData = eventGuestDoc.data();
      
      // Usuń dokument
      await deleteDoc(eventGuestDoc.ref);
      
      // Zaktualizuj liczniki wydarzenia
      await this.updateEventCounts(eventId, eventGuestData.status, 'remove');
      
    } catch (error: any) {
      throw new Error(`Błąd podczas usuwania gościa z wydarzenia: ${error.message}`);
    }
  }

  /**
   * Aktualizuje liczniki gości w wydarzeniu
   */
  static async updateEventCounts(
    eventId: string, 
    status: string, 
    operation: 'add' | 'remove'
  ): Promise<void> {
    try {
      const eventRef = doc(db, COLLECTIONS.EVENTS, eventId);
      const eventDoc = await getDoc(eventRef);
      
      if (!eventDoc.exists()) {
        return;
      }

      const eventData = eventDoc.data();
      const increment = operation === 'add' ? 1 : -1;
      
      const updates: any = {
        guestCount: Math.max(0, (eventData.guestCount || 0) + increment)
      };

      // Aktualizuj liczniki statusów
      switch (status) {
        case 'accepted':
          updates.acceptedCount = Math.max(0, (eventData.acceptedCount || 0) + increment);
          break;
        case 'declined':
          updates.declinedCount = Math.max(0, (eventData.declinedCount || 0) + increment);
          break;
        case 'maybe':
          updates.maybeCount = Math.max(0, (eventData.maybeCount || 0) + increment);
          break;
        default:
          updates.pendingCount = Math.max(0, (eventData.pendingCount || 0) + increment);
      }

      await updateDoc(eventRef, updates);
    } catch (error) {
      console.warn('Nie udało się zaktualizować liczników wydarzenia:', error);
    }
  }

  /**
   * Pobiera wydarzenia, w których uczestniczy kontakt
   */
  static async getContactEvents(contactId: string): Promise<string[]> {
    try {
      const eventGuestsQuery = query(
        collection(db, COLLECTIONS.GUESTS),
        where('contactId', '==', contactId)
      );

      const snapshot = await getDocs(eventGuestsQuery);
      return snapshot.docs.map(doc => doc.data().eventId);
    } catch (error: any) {
      throw new Error(`Błąd podczas pobierania wydarzeń kontaktu: ${error.message}`);
    }
  }
}
