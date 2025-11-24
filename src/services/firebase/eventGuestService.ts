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
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import {
  EventGuest,
  CreateEventGuestData,
  Contact,
  GuestStatus,
} from '../../types';
import { COLLECTIONS } from '../../types/firebase';

export class EventGuestService {
  /**
   * Dodaje kontakt do wydarzenia jako gościa
   * Jeśli gość idzie z osobą towarzyszącą lub żoną/mężem, tworzy dwa wpisy EventGuest
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

      const batch = writeBatch(db);
      const now = Timestamp.now();

      // Główny gość (kontakt)
      const mainGuestRef = doc(collection(db, COLLECTIONS.GUESTS));
      const mainGuest: any = {
        eventId,
        contactId,
        status: 'pending' as GuestStatus,
        invitedAt: now,
        plusOneType: 'none', // Główny gość nie ma plusOne
        eventSpecificNotes: data.eventSpecificNotes || '',
        createdAt: now,
      };
      batch.set(mainGuestRef, mainGuest);

      let guestCount = 1; // Licznik gości (zaczynamy od 1 - główny gość)

      // Jeśli gość idzie z osobą towarzyszącą lub żoną/mężem, utwórz drugi wpis
      if (
        data.plusOneType === 'withDetails' &&
        data.plusOneDetails &&
        (data.plusOneDetails.firstName || data.plusOneDetails.lastName)
      ) {
        const companionGuestRef = doc(collection(db, COLLECTIONS.GUESTS));
        const companionGuest: any = {
          eventId,
          // Brak contactId - to gość bez kontaktu
          status: 'pending' as GuestStatus,
          invitedAt: now,
          plusOneType: 'none',
          eventSpecificNotes: data.eventSpecificNotes || '',
          createdAt: now,
          // Użyj legacy fields do przechowania danych osoby towarzyszącej
          firstName: data.plusOneDetails.firstName || '',
          lastName: data.plusOneDetails.lastName || '',
          email: '', // Osoba towarzysząca może nie mieć emaila
          phone: '',
          dietaryRestrictions: data.plusOneDetails.dietaryRestrictions || '',
        };
        batch.set(companionGuestRef, companionGuest);
        guestCount = 2; // Dwa goście
      }

      await batch.commit();

      // Zaktualizuj liczniki wydarzenia (dodaj wszystkich gości)
      for (let i = 0; i < guestCount; i++) {
        await this.updateEventCounts(eventId, 'pending', 'add');
      }

      return {
        id: mainGuestRef.id,
        ...mainGuest,
        invitedAt: mainGuest.invitedAt.toDate(),
        createdAt: mainGuest.createdAt.toDate(),
      };
    } catch (error: any) {
      throw new Error(
        `Błąd podczas dodawania kontaktu do wydarzenia: ${error.message}`
      );
    }
  }

  /**
   * Pobiera gości wydarzenia z danymi kontaktów
   */
  static async getEventGuests(
    eventId: string
  ): Promise<(EventGuest & { contact: Contact })[]> {
    try {
      const eventGuestsQuery = query(
        collection(db, COLLECTIONS.GUESTS),
        where('eventId', '==', eventId)
      );

      const snapshot = await getDocs(eventGuestsQuery);
      const eventGuests = [];

      for (const eventGuestDoc of snapshot.docs) {
        const eventGuestData = eventGuestDoc.data();

        // Jeśli gość ma contactId, pobierz dane kontaktu
        if (eventGuestData.contactId) {
          const contactRef = doc(
            db,
            COLLECTIONS.CONTACTS,
            eventGuestData.contactId
          );
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
              // Add required legacy fields from contact data
              firstName: contactData.firstName,
              lastName: contactData.lastName,
              email: contactData.email,
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
                tags: contactData.tags,
              } as Contact,
            });
          }
        } else {
          // Gość bez contactId (osoba towarzysząca) - użyj legacy fields
          eventGuests.push({
            id: eventGuestDoc.id,
            eventId: eventGuestData.eventId,
            contactId: undefined,
            status: eventGuestData.status,
            invitedAt: eventGuestData.invitedAt.toDate(),
            respondedAt: eventGuestData.respondedAt?.toDate(),
            plusOneType: eventGuestData.plusOneType || 'none',
            plusOneDetails: eventGuestData.plusOneDetails,
            rsvpToken: eventGuestData.rsvpToken,
            eventSpecificNotes: eventGuestData.eventSpecificNotes,
            createdAt: eventGuestData.createdAt.toDate(),
            updatedAt: eventGuestData.updatedAt?.toDate(),
            // Legacy fields zawierają dane osoby towarzyszącej
            firstName: eventGuestData.firstName || '',
            lastName: eventGuestData.lastName || '',
            email: eventGuestData.email || '',
            phone: eventGuestData.phone,
            dietaryRestrictions: eventGuestData.dietaryRestrictions,
            notes: eventGuestData.notes,
            // Utwórz "sztuczny" contact z legacy fields
            contact: {
              id: `guest-${eventGuestDoc.id}`, // Sztuczne ID
              userId: '', // Brak userId dla gości bez kontaktu
              email: eventGuestData.email || '',
              firstName: eventGuestData.firstName || '',
              lastName: eventGuestData.lastName || '',
              phone: eventGuestData.phone,
              dietaryRestrictions: eventGuestData.dietaryRestrictions,
              notes: eventGuestData.notes,
              createdAt: eventGuestData.createdAt?.toDate() || new Date(),
              updatedAt: eventGuestData.updatedAt?.toDate(),
              tags: [],
            } as Contact,
          });
        }
      }

      // Sortuj lokalnie według daty dodania (najnowsze najpierw)
      eventGuests.sort((a, b) => b.invitedAt.getTime() - a.invitedAt.getTime());

      return eventGuests;
    } catch (error: any) {
      throw new Error(
        `Błąd podczas pobierania gości wydarzenia: ${error.message}`
      );
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
        updatedAt: Timestamp.now(),
      });

      // Zaktualizuj liczniki wydarzenia - usuń ze starego statusu
      await this.updateEventCounts(eventId, oldStatus, 'remove');
      // Dodaj do nowego statusu
      await this.updateEventCounts(eventId, newStatus, 'add');
    } catch (error: any) {
      throw new Error(
        `Błąd podczas aktualizacji statusu gościa: ${error.message}`
      );
    }
  }

  /**
   * Usuwa gościa z wydarzenia
   */
  static async removeContactFromEvent(
    eventId: string,
    contactId: string
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

      // Usuń dokument
      await deleteDoc(eventGuestDoc.ref);

      // Zaktualizuj liczniki wydarzenia
      await this.updateEventCounts(eventId, eventGuestData.status, 'remove');
    } catch (error: any) {
      throw new Error(
        `Błąd podczas usuwania gościa z wydarzenia: ${error.message}`
      );
    }
  }

  /**
   * Aktualizuje informacje o osobie towarzyszącej dla gościa
   */
  static async updateGuestPlusOne(
    eventId: string,
    contactId: string,
    plusOneType: 'none' | 'withDetails',
    plusOneDetails?: { firstName?: string; lastName?: string; dietaryRestrictions?: string }
  ): Promise<void> {
    try {
      const batch = writeBatch(db);

      // Znajdź głównego gościa
      const mainGuestQuery = query(
        collection(db, COLLECTIONS.GUESTS),
        where('eventId', '==', eventId),
        where('contactId', '==', contactId)
      );

      const mainGuestSnapshot = await getDocs(mainGuestQuery);
      if (mainGuestSnapshot.empty) {
        throw new Error('Gość nie został znaleziony');
      }

      const mainGuestDoc = mainGuestSnapshot.docs[0];
      const mainGuestData = mainGuestDoc.data();

      // Znajdź istniejącą osobę towarzyszącą (gość bez contactId dodany w podobnym czasie)
      const allGuestsQuery = query(
        collection(db, COLLECTIONS.GUESTS),
        where('eventId', '==', eventId)
      );
      const allGuestsSnapshot = await getDocs(allGuestsQuery);
      
      // Znajdź osobę towarzyszącą (bez contactId, dodaną w podobnym czasie)
      const companionGuest = allGuestsSnapshot.docs.find(doc => {
        const data = doc.data();
        return !data.contactId && 
               data.invitedAt && 
               Math.abs(data.invitedAt.toMillis() - mainGuestData.invitedAt.toMillis()) < 5000; // 5 sekund różnicy
      });

      if (plusOneType === 'none') {
        // Usuń osobę towarzyszącą jeśli istnieje
        if (companionGuest) {
          const companionData = companionGuest.data();
          batch.delete(companionGuest.ref);
          // Aktualizuj liczniki przed commit
          const companionStatus = companionData.status || 'pending';
          // Użyj updateEventCounts po commit
          await batch.commit();
          await this.updateEventCounts(eventId, companionStatus, 'remove');
          return; // Zakończ funkcję po usunięciu
        }
      } else if (plusOneType === 'withDetails') {
        // Pozwól na utworzenie osoby towarzyszącej nawet bez imienia i nazwiska
        if (companionGuest) {
          // Aktualizuj istniejącą osobę towarzyszącą
          batch.update(companionGuest.ref, {
            firstName: plusOneDetails?.firstName || '',
            lastName: plusOneDetails?.lastName || '',
            dietaryRestrictions: plusOneDetails?.dietaryRestrictions || '',
            updatedAt: Timestamp.now(),
          });
        } else {
          // Utwórz nową osobę towarzyszącą (nawet jeśli brak imienia/nazwiska)
          const companionGuestRef = doc(collection(db, COLLECTIONS.GUESTS));
          const companionGuest: any = {
            eventId,
            status: 'pending' as GuestStatus,
            invitedAt: mainGuestData.invitedAt || Timestamp.now(),
            plusOneType: 'none',
            eventSpecificNotes: mainGuestData.eventSpecificNotes || '',
            createdAt: Timestamp.now(),
            firstName: plusOneDetails?.firstName || '',
            lastName: plusOneDetails?.lastName || '',
            email: '',
            phone: '',
            dietaryRestrictions: plusOneDetails?.dietaryRestrictions || '',
          };
          batch.set(companionGuestRef, companionGuest);
          // Aktualizuj liczniki po commit
          await batch.commit();
          await this.updateEventCounts(eventId, 'pending', 'add');
          return; // Zakończ funkcję po dodaniu
        }
      }

      await batch.commit();
    } catch (error: any) {
      throw new Error(
        `Błąd podczas aktualizacji informacji o osobie towarzyszącej: ${error.message}`
      );
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
        guestCount: Math.max(0, (eventData.guestCount || 0) + increment),
      };

      // Aktualizuj liczniki statusów
      switch (status) {
        case 'accepted':
          updates.acceptedCount = Math.max(
            0,
            (eventData.acceptedCount || 0) + increment
          );
          break;
        case 'declined':
          updates.declinedCount = Math.max(
            0,
            (eventData.declinedCount || 0) + increment
          );
          break;
        case 'maybe':
          updates.maybeCount = Math.max(
            0,
            (eventData.maybeCount || 0) + increment
          );
          break;
        default:
          updates.pendingCount = Math.max(
            0,
            (eventData.pendingCount || 0) + increment
          );
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
      throw new Error(
        `Błąd podczas pobierania wydarzeń kontaktu: ${error.message}`
      );
    }
  }
}
