// services/firebase/eventGuestService.ts
import {
  collection,
  doc,
  documentId,
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
import {
  buildPartyMembersForCreate,
  diffCountContributions,
  getAttendingCountFromGuest,
  getInvitedSeatCount,
  getStatusSeatContribution,
  isLegacyCompanionDocument,
  aggregateRsvpCountsFromGuests,
  type EventRsvpCounts,
  type InvitationCountState,
} from '../../utils/partyInvitationUtils';
import { sanitizeForFirestore, sanitizePartyMembers } from '../../utils/firestoreUtils';

export interface EventCountOptions {
  adjustGuestCount?: boolean;
  statusSeats?: number;
  guestCountSeats?: number;
}

export class EventGuestService {
  /**
   * Dodaje kontakt do wydarzenia jako gościa (pojedynczo, para lub z towarzyszem).
   * Para/towarzysz = jedno zaproszenie, jeden dokument, 2 miejsca.
   */
  static async addContactToEvent(
    eventId: string,
    contactId: string,
    data: CreateEventGuestData,
    userId?: string
  ): Promise<EventGuest> {
    try {
      const existingQuery = query(
        collection(db, COLLECTIONS.GUESTS),
        where('eventId', '==', eventId),
        where('contactId', '==', contactId)
      );

      const existingSnapshot = await getDocs(existingQuery);
      if (!existingSnapshot.empty) {
        throw new Error('Ten kontakt jest już dodany do wydarzenia');
      }

      const contactRef = doc(db, COLLECTIONS.CONTACTS, contactId);
      const contactSnap = await getDoc(contactRef);
      if (!contactSnap.exists()) {
        throw new Error('Kontakt nie istnieje');
      }
      const contactData = contactSnap.data();

      const { invitationKind, partyMembers, invitedSeatCount } =
        buildPartyMembersForCreate(
          {
            id: contactId,
            firstName: contactData.firstName || '',
            lastName: contactData.lastName || '',
            dietaryRestrictions: contactData.dietaryRestrictions,
          },
          data
        );

      const now = Timestamp.now();
      const mainGuestRef = doc(collection(db, COLLECTIONS.GUESTS));
      const secondMember = partyMembers[1];

      const mainGuest: Record<string, unknown> = {
        eventId,
        contactId,
        ...(userId ? { userId } : {}),
        status: 'pending' as GuestStatus,
        invitedAt: now,
        invitationKind,
        invitedSeatCount,
        partyMembers: sanitizePartyMembers(partyMembers),
        attendingMemberIds: [],
        attendingCount: 0,
        plusOneType: invitedSeatCount > 1 ? 'withDetails' : 'none',
        eventSpecificNotes: data.eventSpecificNotes || '',
        createdAt: now,
      };

      if (invitedSeatCount > 1 && secondMember) {
        mainGuest.plusOneDetails = {
          firstName: secondMember.firstName || '',
          lastName: secondMember.lastName || '',
          dietaryRestrictions: secondMember.dietaryRestrictions || '',
        };
      }

      const batch = writeBatch(db);
      batch.set(mainGuestRef, sanitizeForFirestore(mainGuest));
      await batch.commit();

      await this.updateEventCounts(eventId, 'pending', 'add', {
        adjustGuestCount: true,
        statusSeats: invitedSeatCount,
        guestCountSeats: invitedSeatCount,
      });

      return {
        id: mainGuestRef.id,
        ...mainGuest,
        invitedAt: now.toDate(),
        createdAt: now.toDate(),
        firstName: contactData.firstName || '',
        lastName: contactData.lastName || '',
        email: contactData.email || '',
      } as EventGuest;
    } catch (error: any) {
      throw new Error(
        `Błąd podczas dodawania kontaktu do wydarzenia: ${error.message}`
      );
    }
  }

  private static mapGuestDocument(
    eventGuestDoc: { id: string; data: () => Record<string, unknown> },
    contactsMap: Map<string, Record<string, unknown>>
  ): (EventGuest & { contact: Contact }) | null {
    const eventGuestData = eventGuestDoc.data();
    const invitedAt = (eventGuestData.invitedAt as Timestamp).toDate();
    const baseFields = {
      id: eventGuestDoc.id,
      eventId: eventGuestData.eventId as string,
      contactId: eventGuestData.contactId as string | undefined,
      status: eventGuestData.status as GuestStatus,
      invitedAt,
      respondedAt: (eventGuestData.respondedAt as Timestamp | undefined)?.toDate(),
      invitationKind: eventGuestData.invitationKind as EventGuest['invitationKind'],
      invitedSeatCount: eventGuestData.invitedSeatCount as number | undefined,
      partyMembers: eventGuestData.partyMembers as EventGuest['partyMembers'],
      attendingMemberIds: eventGuestData.attendingMemberIds as string[] | undefined,
      attendingCount: eventGuestData.attendingCount as number | undefined,
      plusOneType: (eventGuestData.plusOneType as EventGuest['plusOneType']) || 'none',
      plusOneDetails: eventGuestData.plusOneDetails as EventGuest['plusOneDetails'],
      rsvpToken: eventGuestData.rsvpToken as string | undefined,
      eventSpecificNotes: eventGuestData.eventSpecificNotes as string | undefined,
      createdAt: (eventGuestData.createdAt as Timestamp).toDate(),
      updatedAt: (eventGuestData.updatedAt as Timestamp | undefined)?.toDate(),
    };

    if (eventGuestData.contactId) {
      const contactData = contactsMap.get(eventGuestData.contactId as string);
      if (!contactData) return null;

      return {
        ...baseFields,
        firstName: contactData.firstName as string,
        lastName: contactData.lastName as string,
        email: contactData.email as string,
        phone: contactData.phone as string | undefined,
        dietaryRestrictions: contactData.dietaryRestrictions as string | undefined,
        contact: {
          id: eventGuestData.contactId as string,
          userId: contactData.userId as string,
          email: contactData.email as string,
          firstName: contactData.firstName as string,
          lastName: contactData.lastName as string,
          phone: contactData.phone as string | undefined,
          dietaryRestrictions: contactData.dietaryRestrictions as string | undefined,
          notes: contactData.notes as string | undefined,
          createdAt: (contactData.createdAt as Timestamp | undefined)?.toDate() || new Date(),
          updatedAt: (contactData.updatedAt as Timestamp | undefined)?.toDate(),
          tags: contactData.tags as string[] | undefined,
        } as Contact,
      };
    }

    return {
      ...baseFields,
      firstName: (eventGuestData.firstName as string) || '',
      lastName: (eventGuestData.lastName as string) || '',
      email: (eventGuestData.email as string) || '',
      phone: eventGuestData.phone as string | undefined,
      dietaryRestrictions: eventGuestData.dietaryRestrictions as string | undefined,
      notes: eventGuestData.notes as string | undefined,
      contact: {
        id: `guest-${eventGuestDoc.id}`,
        userId: '',
        email: (eventGuestData.email as string) || '',
        firstName: (eventGuestData.firstName as string) || '',
        lastName: (eventGuestData.lastName as string) || '',
        phone: eventGuestData.phone as string | undefined,
        dietaryRestrictions: eventGuestData.dietaryRestrictions as string | undefined,
        notes: eventGuestData.notes as string | undefined,
        createdAt: (eventGuestData.createdAt as Timestamp | undefined)?.toDate() || new Date(),
        updatedAt: (eventGuestData.updatedAt as Timestamp | undefined)?.toDate(),
        tags: [],
      } as Contact,
    };
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

      // Pobierz wszystkie powiązane kontakty jednym zestawem zapytań
      // Firestore 'in' obsługuje max 30 wartości – dzielimy na partie po 10.
      const contactIds = Array.from(
        new Set(
          snapshot.docs
            .map(d => d.data().contactId)
            .filter((cid): cid is string => Boolean(cid))
        )
      );
      const contactsMap = new Map<string, any>();
      if (contactIds.length) {
        const batchSize = 10;
        const batches: string[][] = [];
        for (let i = 0; i < contactIds.length; i += batchSize) {
          batches.push(contactIds.slice(i, i + batchSize));
        }
        await Promise.all(
          batches.map(async batch => {
            const contactsQuery = query(
              collection(db, COLLECTIONS.CONTACTS),
              where(documentId(), 'in', batch)
            );
            const contactsSnapshot = await getDocs(contactsQuery);
            contactsSnapshot.docs.forEach(c => contactsMap.set(c.id, c.data()));
          })
        );
      }

      const rawGuests: (EventGuest & { contact: Contact })[] = [];

      for (const eventGuestDoc of snapshot.docs) {
        const mapped = this.mapGuestDocument(eventGuestDoc, contactsMap);
        if (mapped) rawGuests.push(mapped);
      }

      const eventGuests = rawGuests.filter(
        guest => !isLegacyCompanionDocument(guest, rawGuests)
      );

      eventGuests.sort((a, b) => b.invitedAt.getTime() - a.invitedAt.getTime());

      return eventGuests;
    } catch (error: any) {
      throw new Error(
        `Błąd podczas pobierania gości wydarzenia: ${error.message}`
      );
    }
  }

  /**
   * Aktualizuje status gościa (po ID dokumentu w kolekcji guests).
   * Działa dla gości z contactId i legacy (mock / bez kontaktu).
   */
  static async updateGuestStatus(
    eventId: string,
    eventGuestId: string,
    newStatus: GuestStatus
  ): Promise<void> {
    try {
      const eventGuestRef = doc(db, COLLECTIONS.GUESTS, eventGuestId);
      const eventGuestSnap = await getDoc(eventGuestRef);

      if (!eventGuestSnap.exists()) {
        throw new Error('Gość nie został znaleziony');
      }

      const eventGuestData = eventGuestSnap.data();
      if (eventGuestData.eventId !== eventId) {
        throw new Error('Gość nie należy do tego wydarzenia');
      }

      const oldStatus = (eventGuestData.status as GuestStatus) || 'pending';
      const invitedSeatCount = getInvitedSeatCount(eventGuestData as EventGuest);
      const oldAttending = getAttendingCountFromGuest(eventGuestData as EventGuest);

      let newAttending = oldAttending;
      if (newStatus === 'declined') {
        newAttending = 0;
      } else if (newStatus === 'accepted' || newStatus === 'maybe') {
        newAttending =
          oldAttending > 0 ? oldAttending : invitedSeatCount > 1 ? invitedSeatCount : 1;
      }

      await updateDoc(eventGuestRef, {
        status: newStatus,
        attendingCount: newAttending,
        respondedAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      await this.syncInvitationCounts(eventId, {
        status: oldStatus,
        invitedSeatCount,
        attendingCount: oldAttending,
      }, {
        status: newStatus,
        invitedSeatCount,
        attendingCount: newAttending,
      });
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

      await this.revertInvitationCounts(eventId, {
        status: (eventGuestData.status as GuestStatus) || 'pending',
        invitedSeatCount: getInvitedSeatCount(eventGuestData as EventGuest),
        attendingCount: getAttendingCountFromGuest(eventGuestData as EventGuest),
      });
      await this.adjustGuestCountTotal(
        eventId,
        -getInvitedSeatCount(eventGuestData as EventGuest)
      );
    } catch (error: any) {
      throw new Error(
        `Błąd podczas usuwania gościa z wydarzenia: ${error.message}`
      );
    }
  }

  /**
   * Aktualizuje skład zaproszenia (para / towarzysz) na jednym dokumencie.
   */
  static async updateGuestPlusOne(
    eventId: string,
    contactId: string,
    plusOneType: 'none' | 'withDetails',
    plusOneDetails?: {
      firstName?: string;
      lastName?: string;
      dietaryRestrictions?: string;
    },
    invitationKind: 'couple' | 'individual_with_companion' = 'individual_with_companion'
  ): Promise<void> {
    try {
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
      const mainGuestData = mainGuestDoc.data() as EventGuest;
      const contactRef = doc(db, COLLECTIONS.CONTACTS, contactId);
      const contactSnap = await getDoc(contactRef);
      const contactData = contactSnap.data() || {};

      const previousSeats = getInvitedSeatCount(mainGuestData);
      const previousState: InvitationCountState = {
        status: mainGuestData.status || 'pending',
        invitedSeatCount: previousSeats,
        attendingCount: getAttendingCountFromGuest(mainGuestData),
      };

      if (plusOneType === 'none') {
        const { partyMembers, invitedSeatCount } = buildPartyMembersForCreate(
          {
            id: contactId,
            firstName: (contactData.firstName as string) || '',
            lastName: (contactData.lastName as string) || '',
          },
          { plusOneType: 'none' }
        );

        await updateDoc(
          mainGuestDoc.ref,
          sanitizeForFirestore({
            invitationKind: 'individual',
            invitedSeatCount,
            partyMembers: sanitizePartyMembers(partyMembers),
            plusOneType: 'none',
            plusOneDetails: null,
            attendingMemberIds: mainGuestData.attendingMemberIds?.slice(0, 1) || [],
            attendingCount: Math.min(
              getAttendingCountFromGuest(mainGuestData),
              1
            ),
            updatedAt: Timestamp.now(),
          })
        );

        if (previousSeats > 1) {
          await this.syncInvitationCounts(eventId, previousState, {
            ...previousState,
            invitedSeatCount: 1,
            attendingCount: Math.min(previousState.attendingCount, 1),
          });
          await this.adjustGuestCountTotal(eventId, -1);
        }
        return;
      }

      const { partyMembers, invitedSeatCount, invitationKind: kind } =
        buildPartyMembersForCreate(
          {
            id: contactId,
            firstName: (contactData.firstName as string) || '',
            lastName: (contactData.lastName as string) || '',
          },
          {
            invitationKind,
            plusOneType: 'withDetails',
            plusOneDetails,
          }
        );

      const secondMember = partyMembers[1];
      await updateDoc(
        mainGuestDoc.ref,
        sanitizeForFirestore({
          invitationKind: kind,
          invitedSeatCount,
          partyMembers: sanitizePartyMembers(partyMembers),
          plusOneType: 'withDetails',
          plusOneDetails: secondMember
            ? {
                firstName: secondMember.firstName || '',
                lastName: secondMember.lastName || '',
                dietaryRestrictions: secondMember.dietaryRestrictions || '',
              }
            : {
                firstName: plusOneDetails?.firstName || '',
                lastName: plusOneDetails?.lastName || '',
                dietaryRestrictions: plusOneDetails?.dietaryRestrictions || '',
              },
          updatedAt: Timestamp.now(),
        })
      );

      if (previousSeats === 1 && invitedSeatCount === 2) {
        await this.syncInvitationCounts(eventId, previousState, {
          ...previousState,
          invitedSeatCount: 2,
        });
        await this.adjustGuestCountTotal(eventId, 1);
      }
    } catch (error: any) {
      throw new Error(
        `Błąd podczas aktualizacji informacji o osobie towarzyszącej: ${error.message}`
      );
    }
  }

  static async syncInvitationCounts(
    eventId: string,
    before: InvitationCountState,
    after: InvitationCountState
  ): Promise<void> {
    const delta = diffCountContributions(
      getStatusSeatContribution(before),
      getStatusSeatContribution(after)
    );
    await this.applyCountDelta(eventId, delta);
  }

  static async revertInvitationCounts(
    eventId: string,
    state: InvitationCountState
  ): Promise<void> {
    const contrib = getStatusSeatContribution(state);
    const inverted = Object.fromEntries(
      Object.entries(contrib).map(([key, value]) => [key, -value])
    );
    await this.applyCountDelta(eventId, inverted);
  }

  private static async applyCountDelta(
    eventId: string,
    delta: Record<string, number>
  ): Promise<void> {
    if (!Object.keys(delta).length) return;

    try {
      const eventRef = doc(db, COLLECTIONS.EVENTS, eventId);
      const eventDoc = await getDoc(eventRef);
      if (!eventDoc.exists()) return;

      const eventData = eventDoc.data();
      const updates: Record<string, number> = {};

      Object.entries(delta).forEach(([field, change]) => {
        updates[field] = Math.max(0, (eventData[field] || 0) + change);
      });

      await updateDoc(eventRef, updates);
    } catch (error) {
      console.warn('Nie udało się zaktualizować liczników wydarzenia:', error);
    }
  }

  private static async adjustGuestCountTotal(
    eventId: string,
    delta: number
  ): Promise<void> {
    if (!delta) return;
    try {
      const eventRef = doc(db, COLLECTIONS.EVENTS, eventId);
      const eventDoc = await getDoc(eventRef);
      if (!eventDoc.exists()) return;
      const eventData = eventDoc.data();
      await updateDoc(eventRef, {
        guestCount: Math.max(0, (eventData.guestCount || 0) + delta),
      });
    } catch (error) {
      console.warn('Nie udało się zaktualizować guestCount:', error);
    }
  }

  /**
   * Aktualizuje liczniki gości w wydarzeniu (kompatybilność wsteczna + miejsca).
   */
  static async updateEventCounts(
    eventId: string,
    status: string,
    operation: 'add' | 'remove',
    options: EventCountOptions | boolean = false
  ): Promise<void> {
    const opts: EventCountOptions =
      typeof options === 'boolean'
        ? { adjustGuestCount: options, statusSeats: 1, guestCountSeats: options ? 1 : 0 }
        : { statusSeats: 1, guestCountSeats: 0, ...options };

    const seats = opts.statusSeats ?? 1;
    const sign = operation === 'add' ? 1 : -1;

    const state: InvitationCountState = {
      status: status as GuestStatus,
      invitedSeatCount: seats,
      attendingCount:
        status === 'accepted' || status === 'maybe'
          ? seats
          : status === 'declined'
            ? 0
            : 0,
    };

    if (status === 'pending') {
      state.attendingCount = 0;
    }

    const contrib = getStatusSeatContribution(state);
    const delta = Object.fromEntries(
      Object.entries(contrib).map(([key, value]) => [key, value * sign])
    );

    await this.applyCountDelta(eventId, delta);

    if (opts.adjustGuestCount && opts.guestCountSeats) {
      await this.adjustGuestCountTotal(eventId, opts.guestCountSeats * sign);
    }
  }

  static async applyRsvpResponseToGuest(
    eventGuestId: string,
    eventId: string,
    guestData: Record<string, unknown>,
    guestUpdate: Record<string, unknown>,
    beforeState: InvitationCountState,
    afterState: InvitationCountState
  ): Promise<void> {
    const { updatedAt: _u, respondedAt: _r, ...rest } = guestUpdate;
    await updateDoc(doc(db, COLLECTIONS.GUESTS, eventGuestId), sanitizeForFirestore({
      ...rest,
      updatedAt: Timestamp.now(),
      respondedAt: Timestamp.now(),
    }));
    await this.syncInvitationCounts(eventId, beforeState, afterState);

    const beforeSeats = getInvitedSeatCount(guestData as unknown as EventGuest);
    const afterSeats =
      (guestUpdate.invitedSeatCount as number | undefined) ?? beforeSeats;
    if (afterSeats > beforeSeats) {
      await this.adjustGuestCountTotal(eventId, afterSeats - beforeSeats);
    }
  }

  /**
   * Pobiera liczbę wydarzeń dla wielu kontaktów jednocześnie (batch query)
   */
  static async getContactEventCounts(
    contactIds: string[]
  ): Promise<Map<string, number>> {
    if (!contactIds.length) return new Map();

    const eventCountMap = new Map<string, number>();

    // Firestore 'in' obsługuje max 30 wartości – dzielemy na partie po 10
    const batchSize = 10;
    const batches: string[][] = [];
    for (let i = 0; i < contactIds.length; i += batchSize) {
      batches.push(contactIds.slice(i, i + batchSize));
    }

    await Promise.all(
      batches.map(async batch => {
        const q = query(
          collection(db, COLLECTIONS.GUESTS),
          where('contactId', 'in', batch)
        );
        const snapshot = await getDocs(q);
        snapshot.docs.forEach(d => {
          const cid = d.data().contactId;
          if (cid) {
            eventCountMap.set(cid, (eventCountMap.get(cid) || 0) + 1);
          }
        });
      })
    );

    return eventCountMap;
  }

  /**
   * Liczy RSVP per wydarzenie na podstawie dokumentów gości (pomija legacy towarzyszy).
   */
  static async getRsvpCountsForEvents(
    eventIds: string[]
  ): Promise<Map<string, EventRsvpCounts>> {
    const result = new Map<string, EventRsvpCounts>();
    if (!eventIds.length) return result;

    const guestsByEvent = new Map<string, Partial<EventGuest>[]>();
    eventIds.forEach(eventId => {
      guestsByEvent.set(eventId, []);
      result.set(eventId, {
        guestCount: 0,
        acceptedCount: 0,
        pendingCount: 0,
        declinedCount: 0,
        maybeCount: 0,
      });
    });

    const batchSize = 30;
    for (let i = 0; i < eventIds.length; i += batchSize) {
      const batch = eventIds.slice(i, i + batchSize);
      const guestsQuery = query(
        collection(db, COLLECTIONS.GUESTS),
        where('eventId', 'in', batch)
      );
      const snapshot = await getDocs(guestsQuery);

      snapshot.docs.forEach(guestDoc => {
        const data = guestDoc.data();
        const eventId = data.eventId as string;
        if (!guestsByEvent.has(eventId)) return;
        guestsByEvent.get(eventId)!.push({
          id: guestDoc.id,
          ...data,
          invitedAt: (data.invitedAt as Timestamp | undefined)?.toDate(),
        } as EventGuest);
      });
    }

    guestsByEvent.forEach((rawGuests, eventId) => {
      const guests = rawGuests.filter(
        guest => !isLegacyCompanionDocument(guest, rawGuests)
      );
      result.set(eventId, aggregateRsvpCountsFromGuests(guests));
    });

    return result;
  }

  /** Zapisuje liczniki RSVP wyliczone z listy gości. */
  static async persistEventCounts(
    eventId: string,
    counts: EventRsvpCounts
  ): Promise<void> {
    await updateDoc(doc(db, COLLECTIONS.EVENTS, eventId), {
      guestCount: counts.guestCount,
      acceptedCount: counts.acceptedCount,
      pendingCount: counts.pendingCount,
      declinedCount: counts.declinedCount,
      maybeCount: counts.maybeCount,
    });
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
