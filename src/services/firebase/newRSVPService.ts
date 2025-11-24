// services/firebase/newRSVPService.ts
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  query,
  where,
  writeBatch,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import {
  EventGuest,
  Contact,
  Event,
  GuestStatus,
  RSVPToken,
  RSVPResponse,
  GuestInvitation,
} from '../../types';
import { COLLECTIONS } from '../../types/firebase';
import { EventGuestService } from './eventGuestService';
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
      const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 dni

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

      const tokenDoc = snapshot.docs[0];
      const tokenData = tokenDoc.data();

      return {
        id: tokenDoc.id,
        eventGuestId: tokenData.eventGuestId,
        eventId: tokenData.eventId,
        token: tokenData.token,
        isUsed: tokenData.isUsed,
        createdAt: tokenData.createdAt.toDate(),
        expiresAt: tokenData.expiresAt?.toDate(),
        usedAt: tokenData.usedAt?.toDate(),
      };
    } catch (error: any) {
      throw new Error(`Błąd podczas pobierania tokenu RSVP: ${error.message}`);
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

      if (rsvpToken.isUsed) {
        return { valid: false, reason: 'Token został już użyty' };
      }

      if (rsvpToken.expiresAt && rsvpToken.expiresAt < new Date()) {
        return { valid: false, reason: 'Token wygasł' };
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
        plusOneType: eventGuestData.plusOneType || 'none',
        plusOneDetails: eventGuestData.plusOneDetails,
        rsvpToken: token,
        eventSpecificNotes: eventGuestData.eventSpecificNotes || '',
        createdAt: eventGuestData.createdAt.toDate(),
        updatedAt: eventGuestData.updatedAt?.toDate(),
        // Legacy fields for display
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
        location: eventData.location,
        maxGuests: eventData.maxGuests || 0,
        guestCount: eventData.guestCount || 0,
        acceptedCount: eventData.acceptedCount || 0,
        declinedCount: eventData.declinedCount || 0,
        pendingCount: eventData.pendingCount || 0,
        maybeCount: eventData.maybeCount || 0,
        status: eventData.status,
        dresscode: eventData.dresscode || '',
        additionalInfo: eventData.additionalInfo || '',
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
   * Przetwarza odpowiedź RSVP
   */
  static async processRSVPResponse(
    token: string,
    response: RSVPResponse
  ): Promise<void> {
    try {
      const rsvpToken = await this.getRSVPToken(token);

      if (!rsvpToken) {
        throw new Error('Token nie istnieje');
      }

      const validation = await this.validateRSVPToken(token);
      if (!validation.valid) {
        throw new Error(validation.reason || 'Token jest nieważny');
      }

      const batch = writeBatch(db);

      // Aktualizuj EventGuest
      const eventGuestRef = doc(db, COLLECTIONS.GUESTS, rsvpToken.eventGuestId);
      const updateData: any = {
        status: response.status,
        respondedAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      // Dodaj plusOneType i plusOneDetails jeśli są podane
      if (response.plusOneType) {
        updateData.plusOneType = response.plusOneType;
      }
      if (response.plusOneDetails) {
        updateData.plusOneDetails = response.plusOneDetails;
      }

      batch.update(eventGuestRef, updateData);

      // Aktualizuj Contact z dodatkowymi informacjami
      if (response.dietaryRestrictions || response.notes) {
        const eventGuestDoc = await getDoc(eventGuestRef);
        if (eventGuestDoc.exists()) {
          const eventGuestData = eventGuestDoc.data();
          if (eventGuestData.contactId) {
          const contactRef = doc(
            db,
            'contacts',
              eventGuestData.contactId
          );
          const contactUpdateData: any = {};

          if (response.dietaryRestrictions) {
            contactUpdateData.dietaryRestrictions =
              response.dietaryRestrictions;
          }
          if (response.notes) {
            contactUpdateData.notes = response.notes;
          }
          contactUpdateData.updatedAt = Timestamp.now();

          batch.update(contactRef, contactUpdateData);
          }
        }
      }

      // Oznacz token jako użyty
      const tokenRef = doc(db, this.RSVP_TOKENS_COLLECTION, rsvpToken.id);
      batch.update(tokenRef, {
        isUsed: true,
        usedAt: Timestamp.now(),
      });

      await batch.commit();

      // Aktualizuj liczniki wydarzenia
      await EventGuestService.updateEventCounts(
        rsvpToken.eventId,
        response.status,
        'add'
      );
    } catch (error: any) {
      throw new Error(
        `Błąd podczas przetwarzania odpowiedzi RSVP: ${error.message}`
      );
    }
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
      // Sprawdź czy gość już ma token RSVP
      let rsvpToken = await this.getRSVPTokenForEventGuest(eventGuestId);

      if (!rsvpToken) {
        // Generuj nowy token
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
        // Sprawdź czy gość już ma token RSVP
        let rsvpToken = await this.getRSVPTokenForEventGuest(eventGuest.id);

        if (!rsvpToken) {
          // Generuj nowy token
          rsvpToken = await this.generateRSVPToken(eventGuest.id, eventId);
        }

        const rsvpUrl = this.generateRSVPUrl(rsvpToken.token);
        const qrCode = await this.generateQRCode(rsvpToken.token);

        invitations.push({
          eventGuestId: eventGuest.id,
          contactId: eventGuest.contact.id,
          email: eventGuest.contact.email,
          firstName: eventGuest.contact.firstName,
          lastName: eventGuest.contact.lastName,
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
   * Pobiera token RSVP dla konkretnego EventGuest
   */
  private static async getRSVPTokenForEventGuest(
    eventGuestId: string
  ): Promise<RSVPToken | null> {
    try {
      const tokenQuery = query(
        collection(db, this.RSVP_TOKENS_COLLECTION),
        where('eventGuestId', '==', eventGuestId)
      );

      const snapshot = await getDocs(tokenQuery);

      if (snapshot.empty) {
        return null;
      }

      const tokenDoc = snapshot.docs[0];
      const tokenData = tokenDoc.data();

      return {
        id: tokenDoc.id,
        eventGuestId: tokenData.eventGuestId,
        eventId: tokenData.eventId,
        token: tokenData.token,
        isUsed: tokenData.isUsed,
        createdAt: tokenData.createdAt.toDate(),
        expiresAt: tokenData.expiresAt?.toDate(),
        usedAt: tokenData.usedAt?.toDate(),
      };
    } catch (error: any) {
      console.error('Błąd podczas pobierania tokenu RSVP:', error);
      return null;
    }
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
