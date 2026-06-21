// services/firebase/newRSVPService.ts
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  Timestamp,
  type QueryDocumentSnapshot,
  type DocumentData,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { resolveRsvpDeadlineFromDates } from '../../utils/rsvpEventHelpers';
import { db, getFirebaseFunctions } from '../../config/firebase';
import {
  EventGuest,
  Contact,
  Event,
  GuestStatus,
  RSVPToken,
  RSVPResponse,
  GuestInvitation,
  InvitationDelivery,
  InvitationSendResult,
} from '../../types';
import { COLLECTIONS } from '../../types/firebase';
import { EventGuestService } from './eventGuestService';
import { InvitationService } from './invitationService';
import { isRSVPTokenActive, parseFirestoreDate } from '../../utils/rsvpTokenUtils';
import { buildRsvpUpdatePayload } from '../../utils/partyInvitationUtils';
import QRCode from 'qrcode';

export class NewRSVPService {
  private static readonly RSVP_TOKENS_COLLECTION = 'rsvpTokens';
  private static readonly BASE_URL =
    process.env.REACT_APP_BASE_URL || 'http://localhost:3000';

  /**
   * Generuje unikalny token RSVP dla EventGuest
   */
  static async generateRSVPToken(
    eventGuestId: string,
    eventId: string
  ): Promise<RSVPToken> {
    try {
      const token = this.generateUniqueToken();
      const now = new Date();

      // Termin odpowiedzi: 1) rsvpDeadline ustawiony przez organizatora,
      // 2) inaczej godzina rozpoczęcia wydarzenia. Fallback: 30 dni od teraz.
      let expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      try {
        const eventSnap = await getDoc(doc(db, COLLECTIONS.EVENTS, eventId));
        if (eventSnap.exists()) {
          const data = eventSnap.data();
          const deadline = parseFirestoreDate(data?.rsvpDeadline);
          const eventDate = parseFirestoreDate(data?.date);
          if (eventDate) {
            expiresAt = resolveRsvpDeadlineFromDates(deadline, eventDate);
          }
        }
      } catch {
        // zachowaj fallback
      }

      const rsvpTokenData = {
        eventGuestId,
        eventId,
        token,
        isUsed: false,
        createdAt: Timestamp.fromDate(now),
        expiresAt: Timestamp.fromDate(expiresAt),
      };

      const docRef = await addDoc(
        collection(db, this.RSVP_TOKENS_COLLECTION),
        rsvpTokenData
      );

      return {
        id: docRef.id,
        eventGuestId,
        eventId,
        token,
        isUsed: false,
        createdAt: now,
        expiresAt,
      };
    } catch (error: any) {
      throw new Error(`Błąd podczas generowania tokenu RSVP: ${error.message}`);
    }
  }

  /**
   * Pobiera token RSVP po tokenie
   */
  static async getRSVPToken(token: string): Promise<RSVPToken | null> {
    try {
      const tokenQuery = query(
        collection(db, this.RSVP_TOKENS_COLLECTION),
        where('token', '==', token)
      );

      const snapshot = await getDocs(tokenQuery);

      if (snapshot.empty) {
        return null;
      }

      return this.mapTokenDocument(snapshot.docs[0]);
    } catch (error: any) {
      throw new Error(`Błąd podczas pobierania tokenu RSVP: ${error.message}`);
    }
  }

  /**
   * Zwraca aktualny termin RSVP dla wydarzenia (autorytatywny, „na żywo").
   * Priorytet: rsvpDeadline ustawiony przez organizatora, inaczej godzina rozpoczęcia wydarzenia.
   * Dzięki temu zmiana terminu przez organizatora działa również dla już wygenerowanych linków.
   */
  private static async getEventDeadline(eventId: string): Promise<Date | null> {
    try {
      const snap = await getDoc(doc(db, COLLECTIONS.EVENTS, eventId));
      if (!snap.exists()) return null;
      const data = snap.data();
      const deadline = parseFirestoreDate(data?.rsvpDeadline);
      const eventDate = parseFirestoreDate(data?.date);
      if (eventDate) {
        return resolveRsvpDeadlineFromDates(deadline, eventDate);
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Waliduje token RSVP
   */
  static async validateRSVPToken(
    token: string
  ): Promise<{ valid: boolean; reason?: string }> {
    try {
      const rsvpToken = await this.getRSVPToken(token);

      if (!rsvpToken) {
        return { valid: false, reason: 'Token nie istnieje' };
      }

      // Autorytatywny termin pochodzi z wydarzenia (uwzględnia zmiany organizatora).
      // Gdy nie uda się go ustalić, opieramy się na terminie zapisanym w tokenie.
      const deadline = await this.getEventDeadline(rsvpToken.eventId);
      const deadlinePassed = deadline
        ? deadline.getTime() < Date.now()
        : !isRSVPTokenActive(rsvpToken);

      if (deadlinePassed) {
        return { valid: false, reason: 'Termin na przesłanie odpowiedzi minął' };
      }

      return { valid: true };
    } catch (error) {
      return { valid: false, reason: 'Błąd podczas walidacji tokenu' };
    }
  }

  /**
   * Pobiera dane gościa i wydarzenia na podstawie tokenu
   */
  static async getRSVPData(token: string): Promise<{
    eventGuest: EventGuest & { contact: Contact };
    event: Event;
    rsvpToken: RSVPToken;
  } | null> {
    try {
      const rsvpToken = await this.getRSVPToken(token);

      if (!rsvpToken) {
        return null;
      }

      // Pobierz dane EventGuest
      const eventGuestRef = doc(db, COLLECTIONS.GUESTS, rsvpToken.eventGuestId);
      const eventGuestDoc = await getDoc(eventGuestRef);

      if (!eventGuestDoc.exists()) {
        throw new Error('Gość wydarzenia nie istnieje');
      }

      const eventGuestData = eventGuestDoc.data();

      // Pobierz dane Contact (jeśli istnieje)
      let contactData: any = null;
      if (eventGuestData.contactId) {
      const contactRef = doc(db, 'contacts', eventGuestData.contactId);
      const contactDoc = await getDoc(contactRef);

        if (contactDoc.exists()) {
          contactData = contactDoc.data();
        }
      }

      // Jeśli brak kontaktu (osoba towarzysząca), użyj legacy fields
      const contact: Contact = contactData
        ? {
            id: contactData.id || eventGuestData.contactId,
            userId: contactData.userId,
            firstName: contactData.firstName || '',
            lastName: contactData.lastName || '',
            email: contactData.email || '',
            phone: contactData.phone || '',
            dietaryRestrictions: contactData.dietaryRestrictions || '',
            notes: contactData.notes || '',
            createdAt: contactData.createdAt?.toDate() || new Date(),
            updatedAt: contactData.updatedAt?.toDate(),
          }
        : {
            id: '',
            userId: '',
            firstName: eventGuestData.firstName || '',
            lastName: eventGuestData.lastName || '',
            email: eventGuestData.email || '',
            phone: eventGuestData.phone || '',
            dietaryRestrictions: eventGuestData.dietaryRestrictions || '',
            notes: '',
            createdAt: eventGuestData.createdAt?.toDate() || new Date(),
            updatedAt: eventGuestData.updatedAt?.toDate(),
          };

      // Pobierz dane Event
      const eventRef = doc(db, COLLECTIONS.EVENTS, rsvpToken.eventId);
      const eventDoc = await getDoc(eventRef);

      if (!eventDoc.exists()) {
        throw new Error('Wydarzenie nie istnieje');
      }

      const eventData = eventDoc.data();

      const eventGuest = {
        id: eventGuestDoc.id,
        eventId: eventGuestData.eventId,
        contactId: eventGuestData.contactId,
        status: eventGuestData.status,
        invitedAt: eventGuestData.invitedAt.toDate(),
        respondedAt: eventGuestData.respondedAt?.toDate(),
        invitationKind: eventGuestData.invitationKind,
        invitedSeatCount: eventGuestData.invitedSeatCount,
        partyMembers: eventGuestData.partyMembers,
        attendingMemberIds: eventGuestData.attendingMemberIds,
        attendingCount: eventGuestData.attendingCount,
        plusOneType: eventGuestData.plusOneType || 'none',
        plusOneDetails: eventGuestData.plusOneDetails,
        rsvpToken: token,
        eventSpecificNotes: eventGuestData.eventSpecificNotes || '',
        createdAt: eventGuestData.createdAt.toDate(),
        updatedAt: eventGuestData.updatedAt?.toDate(),
        firstName: contact.firstName,
        lastName: contact.lastName,
        email: contact.email,
        phone: contact.phone,
        dietaryRestrictions: contact.dietaryRestrictions,
        notes: contact.notes,
      };

      const event: Event = {
        id: eventDoc.id,
        userId: eventData.userId,
        title: eventData.title,
        description: eventData.description || '',
        date: eventData.date.toDate(),
        rsvpDeadline: eventData.rsvpDeadline
          ? eventData.rsvpDeadline.toDate()
          : undefined,
        location: eventData.location,
        latitude: eventData.latitude,
        longitude: eventData.longitude,
        maxGuests: eventData.maxGuests || 0,
        guestCount: eventData.guestCount || 0,
        acceptedCount: eventData.acceptedCount || 0,
        declinedCount: eventData.declinedCount || 0,
        pendingCount: eventData.pendingCount || 0,
        maybeCount: eventData.maybeCount || 0,
        status: eventData.status,
        dresscode: eventData.dresscode || '',
        additionalInfo: eventData.additionalInfo || '',
        organizerEmail: eventData.organizerEmail || '',
        organizerPhone: eventData.organizerPhone || '',
        allowPlusOne: Boolean(eventData.allowPlusOne),
        createdAt: eventData.createdAt.toDate(),
        updatedAt: eventData.updatedAt?.toDate(),
      };

      return {
        eventGuest: eventGuest as EventGuest & { contact: Contact },
        event,
        rsvpToken,
      };
    } catch (error: any) {
      throw new Error(
        `Błąd podczas pobierania danych RSVP: ${error.message}`
      );
    }
  }

  /**
   * Przetwarza odpowiedź RSVP (Cloud Function, z fallbackiem zapisu w Firestore).
   */
  static async processRSVPResponse(
    token: string,
    response: RSVPResponse
  ): Promise<void> {
    const validation = await this.validateRSVPToken(token);
    if (!validation.valid) {
      throw new Error(validation.reason || 'Token jest nieważny');
    }

    try {
      const functions = await getFirebaseFunctions();
      const callable = httpsCallable<
        { token: string; response: RSVPResponse },
        { success: boolean }
      >(functions, 'processRSVPResponse');

      await callable({ token, response });
    } catch (error: unknown) {
      if (this.shouldFallbackToLocalRsvp(error)) {
        console.warn(
          'Cloud Function processRSVPResponse niedostępna — zapis lokalny RSVP'
        );
        await this.processRSVPResponseLocally(token, response);
        return;
      }
      throw new Error(this.formatRsvpError(error));
    }
  }

  private static shouldFallbackToLocalRsvp(error: unknown): boolean {
    const code = (error as { code?: string })?.code ?? '';
    const normalized = code.replace(/^functions\//, '');
    return [
      'internal',
      'not-found',
      'unavailable',
      'deadline-exceeded',
      'unknown',
    ].includes(normalized);
  }

  private static formatRsvpError(error: unknown): string {
    const err = error as { message?: string; code?: string; details?: unknown };
    const code = err?.code?.replace(/^functions\//, '') ?? '';
    const message = (err?.message ?? '').trim();

    if (message && message !== 'internal' && !message.startsWith('FirebaseError')) {
      return message.includes('Błąd podczas przetwarzania')
        ? message
        : `Błąd podczas przetwarzania odpowiedzi RSVP: ${message}`;
    }

    const friendly: Record<string, string> = {
      'invalid-argument': 'Nieprawidłowe dane odpowiedzi RSVP',
      'not-found': 'Link RSVP jest nieprawidłowy lub wygasł',
      'failed-precondition': 'Termin na przesłanie odpowiedzi minął',
      'permission-denied': 'Brak uprawnień do zapisu odpowiedzi',
      internal:
        'Serwer RSVP jest chwilowo niedostępny. Spróbuj ponownie za chwilę.',
      unavailable: 'Serwer RSVP jest chwilowo niedostępny',
    };

    return (
      friendly[code] ||
      'Nie udało się zapisać odpowiedzi RSVP. Spróbuj ponownie.'
    );
  }

  /**
   * Zapis odpowiedzi RSVP bez Cloud Function (wymaga reguł Firestore dla gości).
   */
  private static async processRSVPResponseLocally(
    token: string,
    response: RSVPResponse
  ): Promise<void> {
    const rsvpToken = await this.getRSVPToken(token);
    if (!rsvpToken) {
      throw new Error('Token nie istnieje');
    }

    const deadline = await this.getEventDeadline(rsvpToken.eventId);
    const deadlinePassed = deadline
      ? deadline.getTime() < Date.now()
      : !isRSVPTokenActive(rsvpToken);

    if (deadlinePassed) {
      throw new Error('Termin na przesłanie odpowiedzi minął');
    }

    const eventGuestRef = doc(db, COLLECTIONS.GUESTS, rsvpToken.eventGuestId);
    const eventGuestSnap = await getDoc(eventGuestRef);

    if (!eventGuestSnap.exists()) {
      throw new Error('Gość wydarzenia nie istnieje');
    }

    const eventGuestData = eventGuestSnap.data();
    if (eventGuestData.eventId !== rsvpToken.eventId) {
      throw new Error('Token nie pasuje do gościa wydarzenia');
    }

    const eventRef = doc(db, COLLECTIONS.EVENTS, rsvpToken.eventId);
    const eventSnap = await getDoc(eventRef);
    const allowPlusOne = Boolean(eventSnap.data()?.allowPlusOne);

    const { guestUpdate, beforeState, afterState } = buildRsvpUpdatePayload(
      eventGuestData as unknown as EventGuest,
      response,
      allowPlusOne
    );

    const firestoreUpdate = {
      ...guestUpdate,
      updatedAt: Timestamp.now(),
      respondedAt: Timestamp.now(),
    };

    await EventGuestService.applyRsvpResponseToGuest(
      rsvpToken.eventGuestId,
      rsvpToken.eventId,
      eventGuestData,
      firestoreUpdate,
      beforeState,
      afterState
    );
  }

  private static resolvePlusOneType(
    response: RSVPResponse
  ): 'none' | 'withoutDetails' | 'withDetails' {
    if (response.status !== 'accepted') {
      return 'none';
    }
    if (response.plusOneType) {
      return response.plusOneType;
    }
    if (!response.plusOne) {
      return 'none';
    }
    const details = response.plusOneDetails;
    const hasDetails =
      Boolean(details?.firstName?.trim()) ||
      Boolean(details?.lastName?.trim()) ||
      Boolean(details?.dietaryRestrictions?.trim());
    return hasDetails ? 'withDetails' : 'withoutDetails';
  }

  /**
   * Generuje link RSVP
   */
  static generateRSVPUrl(token: string): string {
    return `${this.BASE_URL}/rsvp/${token}`;
  }

  /**
   * Generuje kod QR dla linku RSVP
   */
  static async generateQRCode(token: string): Promise<string> {
    try {
    const url = this.generateRSVPUrl(token);
      const qrCodeDataUrl = await QRCode.toDataURL(url, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
      return qrCodeDataUrl;
    } catch (error: any) {
      throw new Error('Nie udało się wygenerować kodu QR');
    }
  }

  /**
   * Pobiera lub generuje token RSVP dla EventGuest i zwraca link oraz QR kod
   */
  static async getRSVPLinkAndQR(
    eventGuestId: string,
    eventId: string
  ): Promise<{ rsvpUrl: string; qrCode: string; token: string }> {
    try {
      let rsvpToken = await this.getActiveRSVPTokenForEventGuest(eventGuestId);

      if (!rsvpToken) {
        rsvpToken = await this.generateRSVPToken(eventGuestId, eventId);
      }

      const rsvpUrl = this.generateRSVPUrl(rsvpToken.token);
      const qrCode = await this.generateQRCode(rsvpToken.token);

      return {
        rsvpUrl,
        qrCode,
        token: rsvpToken.token,
      };
    } catch (error: any) {
      throw new Error(
        `Błąd podczas generowania linku RSVP: ${error.message}`
      );
    }
  }

  /**
   * Tworzy zaproszenia dla wszystkich gości wydarzenia
   */
  static async generateInvitationsForEvent(
    eventId: string
  ): Promise<GuestInvitation[]> {
    try {
      // Pobierz wszystkich gości wydarzenia przez EventGuestService
      const eventGuests = await EventGuestService.getEventGuests(eventId);
      const invitations: GuestInvitation[] = [];

      for (const eventGuest of eventGuests) {
        let rsvpToken = await this.getActiveRSVPTokenForEventGuest(eventGuest.id);

        if (!rsvpToken) {
          rsvpToken = await this.generateRSVPToken(eventGuest.id, eventId);
        }

        const rsvpUrl = this.generateRSVPUrl(rsvpToken.token);
        const qrCode = await this.generateQRCode(rsvpToken.token);

        invitations.push({
          eventGuestId: eventGuest.id,
          contactId: eventGuest.contactId,
          email: eventGuest.contact?.email ?? eventGuest.email ?? '',
          phone: eventGuest.contact?.phone ?? eventGuest.phone,
          firstName: eventGuest.contact?.firstName ?? eventGuest.firstName,
          lastName: eventGuest.contact?.lastName ?? eventGuest.lastName,
          status: eventGuest.status,
          rsvpToken: rsvpToken.token,
          rsvpUrl,
          qrCode,
        });
      }

      return invitations;
    } catch (error: any) {
      throw new Error(`Błąd podczas generowania zaproszeń: ${error.message}`);
    }
  }

  /**
   * Najnowszy aktywny token RSVP dla gościa (nie wygasły, nie użyte)
   */
  private static async getActiveRSVPTokenForEventGuest(
    eventGuestId: string
  ): Promise<RSVPToken | null> {
    try {
      const byEventGuestId = query(
        collection(db, this.RSVP_TOKENS_COLLECTION),
        where('eventGuestId', '==', eventGuestId)
      );
      const byGuestId = query(
        collection(db, this.RSVP_TOKENS_COLLECTION),
        where('guestId', '==', eventGuestId)
      );

      const [eventGuestSnap, guestIdSnap] = await Promise.all([
        getDocs(byEventGuestId),
        getDocs(byGuestId),
      ]);

      const seen = new Set<string>();
      const tokens: RSVPToken[] = [];

      for (const docSnap of [...eventGuestSnap.docs, ...guestIdSnap.docs]) {
        if (seen.has(docSnap.id)) continue;
        seen.add(docSnap.id);
        tokens.push(this.mapTokenDocument(docSnap));
      }

      if (tokens.length === 0) {
        return null;
      }

      tokens.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      return tokens.find(isRSVPTokenActive) ?? null;
    } catch (error: any) {
      console.error('Błąd podczas pobierania tokenu RSVP:', error);
      return null;
    }
  }

  private static mapTokenDocument(
    tokenDoc: QueryDocumentSnapshot<DocumentData>
  ): RSVPToken {
    const tokenData = tokenDoc.data();
    return {
      id: tokenDoc.id,
      eventGuestId: tokenData.eventGuestId as string,
      guestId: tokenData.guestId as string | undefined,
      eventId: tokenData.eventId as string,
      token: tokenData.token as string,
      isUsed: Boolean(tokenData.isUsed),
      createdAt: parseFirestoreDate(tokenData.createdAt) ?? new Date(0),
      expiresAt: parseFirestoreDate(tokenData.expiresAt),
      usedAt: parseFirestoreDate(tokenData.usedAt),
    };
  }

  /**
   * Generuje unikalny token
   */
  private static generateUniqueToken(): string {
    const timestamp = Date.now().toString(36);
    const randomString = Math.random().toString(36).substring(2, 15);
    return `${timestamp}-${randomString}`;
  }

  /**
   * Wysyła zaproszenia e-mailem
   */
  static async sendEmailInvitations(
    invitations: GuestInvitation[],
    event: Event,
    delivery: InvitationDelivery
  ): Promise<InvitationSendResult> {
    return InvitationService.sendEmailInvitations(invitations, event, delivery);
  }

  /**
   * Generuje wiadomość SMS
   */
  static generateSMSMessage(invitation: GuestInvitation, event: Event): string {
    return `Cześć ${invitation.firstName}! Zapraszamy na "${event.title}" ${event.date.toLocaleDateString('pl-PL')}. Potwierdź obecność: ${invitation.rsvpUrl}`;
  }

  /**
   * Śledzi analytics dla RSVP
   */
  private static async trackRSVPAnalytics(
    eventId: string,
    status: GuestStatus
  ): Promise<void> {
    // Implementacja śledzenia analytics
  }
}
