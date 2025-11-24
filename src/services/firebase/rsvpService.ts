// services/firebase/rsvpService.ts
import {
  collection,
  doc,
  addDoc,
  getDocs,
  getDoc,
  query,
  where,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode';
import { db } from '../../config/firebase';
import { COLLECTIONS } from '../../types/firebase';
import EmailService from '../emailService';
import {
  RSVPToken,
  RSVPResponse,
  GuestInvitation,
  InvitationDelivery,
  Guest,
  Event,
  GuestStatus,
} from '../../types';

export class RSVPService {
  private static readonly COLLECTION_NAME = 'rsvpTokens';
  private static readonly BASE_URL =
    process.env.REACT_APP_BASE_URL || 'http://localhost:3000';

  /**
   * Generuje unikalny token RSVP dla gościa
   */
  static async generateRSVPToken(
    guestId: string,
    eventId: string
  ): Promise<RSVPToken> {
    try {
      const token = uuidv4();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // Token ważny przez 30 dni

      const rsvpTokenData: Omit<RSVPToken, 'id'> = {
        eventGuestId: guestId, // Use eventGuestId for new field
        guestId, // Keep for backward compatibility
        eventId,
        token,
        isUsed: false,
        createdAt: new Date(),
        expiresAt,
      };
      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), {
        ...rsvpTokenData,
        createdAt: Timestamp.fromDate(rsvpTokenData.createdAt),
        expiresAt: rsvpTokenData.expiresAt
          ? Timestamp.fromDate(rsvpTokenData.expiresAt)
          : null,
      });

      return {
        id: docRef.id,
        ...rsvpTokenData,
      };
    } catch (error) {
      console.error('Błąd podczas generowania tokenu RSVP:', error);
      throw new Error('Nie udało się wygenerować tokenu RSVP');
    }
  }

  /**
   * Pobiera token RSVP po tokenie
   */
  static async getRSVPToken(token: string): Promise<RSVPToken | null> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('token', '==', token)
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      const data = doc.data();

      return {
        id: doc.id,
        eventGuestId: data.eventGuestId || data.guestId, // Use new field or fallback to legacy
        guestId: data.guestId, // Keep legacy field
        eventId: data.eventId,
        token: data.token,
        isUsed: data.isUsed,
        createdAt: data.createdAt.toDate(),
        expiresAt: data.expiresAt?.toDate(),
        usedAt: data.usedAt?.toDate(),
      };
    } catch (error) {
      console.error('Błąd podczas pobierania tokenu RSVP:', error);
      throw new Error('Nie udało się pobrać tokenu RSVP');
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
      console.error('Błąd podczas walidacji tokenu:', error);
      return { valid: false, reason: 'Błąd serwera' };
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

      // Aktualizuj gościa
      const guestId = rsvpToken.guestId || rsvpToken.eventGuestId;
      if (!guestId) {
        throw new Error('Brak ID gościa w tokenie RSVP');
      }
      const guestRef = doc(db, 'guests', guestId);
      batch.update(guestRef, {
        status: response.status,
        dietaryRestrictions: response.dietaryRestrictions || '',
        notes: response.notes || '',
        plusOne: response.plusOne || false,
        respondedAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date()),
      });

      // Oznacz token jako użyty
      const tokenRef = doc(db, this.COLLECTION_NAME, rsvpToken.id);
      batch.update(tokenRef, {
        isUsed: true,
        usedAt: Timestamp.fromDate(new Date()),
      });

      // Jeśli gość chce +1, dodaj dodatkową osobę
      if (response.plusOne && response.plusOneDetails) {
        const plusOneData = {
          userId: '', // Pusty dla gości bez konta
          eventId: rsvpToken.eventId,
          firstName: response.plusOneDetails.firstName || 'Plus One',
          lastName: response.plusOneDetails.lastName || '',
          email: '', // Pusty dla plus one
          status: 'accepted' as GuestStatus,
          dietaryRestrictions:
            response.plusOneDetails.dietaryRestrictions || '',
          notes: `Plus One dla gościa ${rsvpToken.guestId}`,
          plusOne: false,
          invitedAt: Timestamp.fromDate(new Date()),
          createdAt: Timestamp.fromDate(new Date()),
          eventName: '',
          eventDate: Timestamp.fromDate(new Date()),
        };

        const plusOneRef = doc(collection(db, 'guests'));
        batch.set(plusOneRef, plusOneData);
      }

      await batch.commit();

      // Get guest and event data for activity
      try {
        const guestDoc = await getDoc(doc(db, 'guests', guestId));
        const eventDoc = await getDoc(doc(db, 'events', rsvpToken.eventId));

        if (guestDoc.exists() && eventDoc.exists()) {
          const guestData = guestDoc.data();
          const eventData = eventDoc.data();

          let activityType: string;
          let message: string;

          switch (response.status) {
            case 'accepted':
              activityType = 'guest_accepted';
              message = `${guestData.firstName || 'Gość'} ${guestData.lastName || ''} potwierdził udział w wydarzeniu "${eventData.title}"`;
              break;
            case 'declined':
              activityType = 'guest_declined';
              message = `${guestData.firstName || 'Gość'} ${guestData.lastName || ''} odrzucił zaproszenie na wydarzenie "${eventData.title}"`;
              break;
            case 'maybe':
              activityType = 'guest_maybe';
              message = `${guestData.firstName || 'Gość'} ${guestData.lastName || ''} jest niezdecydowany na wydarzenie "${eventData.title}"`;
              break;
            default:
              activityType = 'guest_response';
              message = `${guestData.firstName || 'Gość'} ${guestData.lastName || ''} odpowiedział na zaproszenie na wydarzenie "${eventData.title}"`;
          }

          await addDoc(collection(db, COLLECTIONS.ACTIVITIES), {
            type: activityType,
            message: message,
            timestamp: Timestamp.now(),
            eventId: rsvpToken.eventId,
            eventGuestId: guestId,
            userId: eventData.userId,
          });
        }
      } catch (activityError) {
        console.warn(
          'Failed to create activity for RSVP response:',
          activityError
        );
      }

      // Śledź analytykę
      await this.trackRSVPAnalytics(rsvpToken.eventId, response.status);
    } catch (error) {
      console.error('Błąd podczas przetwarzania odpowiedzi RSVP:', error);
      throw error;
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
      const qrCode = await QRCode.toDataURL(url, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
      return qrCode;
    } catch (error) {
      console.error('Błąd podczas generowania kodu QR:', error);
      throw new Error('Nie udało się wygenerować kodu QR');
    }
  }

  /**
   * Tworzy zaproszenia dla wszystkich gości wydarzenia
   */
  static async generateInvitationsForEvent(
    eventId: string
  ): Promise<GuestInvitation[]> {
    try {
      // Pobierz wszystkich gości wydarzenia
      const guestsQuery = query(
        collection(db, 'guests'),
        where('eventId', '==', eventId)
      );

      const guestsSnapshot = await getDocs(guestsQuery);
      const invitations: GuestInvitation[] = [];

      for (const guestDoc of guestsSnapshot.docs) {
        const guestData = guestDoc.data();

        // Sprawdź czy gość już ma token
        let rsvpToken = await this.getRSVPTokenForGuest(guestDoc.id);

        if (!rsvpToken) {
          // Generuj nowy token
          rsvpToken = await this.generateRSVPToken(guestDoc.id, eventId);
        }

        const rsvpUrl = this.generateRSVPUrl(rsvpToken.token);
        const qrCode = await this.generateQRCode(rsvpToken.token);

        invitations.push({
          eventGuestId: guestDoc.id,
          contactId: guestData.contactId || guestDoc.id, // Use contactId if available, fallback to guestId
          guestId: guestDoc.id, // Legacy field
          email: guestData.email,
          firstName: guestData.firstName,
          lastName: guestData.lastName,
          rsvpToken: rsvpToken.token,
          rsvpUrl,
          qrCode,
        });
      }

      return invitations;
    } catch (error) {
      console.error('Błąd podczas generowania zaproszeń:', error);
      throw new Error('Nie udało się wygenerować zaproszeń');
    }
  }

  /**
   * Pobiera token RSVP dla konkretnego gościa
   */
  private static async getRSVPTokenForGuest(
    guestId: string
  ): Promise<RSVPToken | null> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('guestId', '==', guestId),
        where('isUsed', '==', false)
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      const data = doc.data();

      return {
        id: doc.id,
        eventGuestId: data.eventGuestId || data.guestId, // Use new field or fallback to legacy
        guestId: data.guestId, // Keep legacy field
        eventId: data.eventId,
        token: data.token,
        isUsed: data.isUsed,
        createdAt: data.createdAt.toDate(),
        expiresAt: data.expiresAt?.toDate(),
        usedAt: data.usedAt?.toDate(),
      };
    } catch (error) {
      console.error('Błąd podczas pobierania tokenu gościa:', error);
      return null;
    }
  }
  /**
   * Wysyła zaproszenia e-mailem
   */
  static async sendEmailInvitations(
    invitations: GuestInvitation[],
    event: Event,
    delivery: InvitationDelivery
  ): Promise<void> {
    try {
      console.log('Wysyłanie zaproszeń e-mailem:', {
        invitations: invitations.length,
        event: event.title,
        delivery,
        emailConfigured: EmailService.isConfigured(),
      });

      // Sprawdź konfigurację EmailJS
      const emailStatus = EmailService.getConfigurationStatus();
      if (!emailStatus.configured) {
        console.warn('EmailJS nie jest skonfigurowany:', emailStatus.message);
        console.log('Logowanie zaproszeń do konsoli...');
      }

      // Wyślij e-maile z opóźnieniem
      const results = await EmailService.sendBulkInvitationEmails(
        invitations,
        event,
        delivery,
        1500 // 1.5 sekundy opóźnienia między e-mailami
      );

      if (results.failed > 0) {
        console.warn(
          `Wysłano ${results.sent}/${invitations.length} e-maili. Błędy:`,
          results.errors
        );
        throw new Error(`Nie udało się wysłać ${results.failed} e-maili`);
      }

      console.log(`✅ Pomyślnie wysłano ${results.sent} zaproszeń e-mailem`);
    } catch (error) {
      console.error('Błąd podczas wysyłania e-maili:', error);
      throw new Error('Nie udało się wysłać zaproszeń e-mailem');
    }
  }

  /**
   * Generuje treść e-maila z zaproszeniem
   */
  private static generateEmailBody(
    invitation: GuestInvitation,
    event: Event,
    delivery: InvitationDelivery
  ): string {
    return `
Cześć ${invitation.firstName}!

${delivery.message || `Zostałeś zaproszony na wydarzenie "${event.title}".`}

📅 Data: ${event.date.toLocaleDateString('pl-PL')}
📍 Miejsce: ${event.location}
📝 Opis: ${event.description}

Aby potwierdzić swoją obecność, kliknij w link poniżej:
${invitation.rsvpUrl}

${
  delivery.includeQR
    ? `
Możesz też zeskanować kod QR:
[Kod QR zostanie załączony]
`
    : ''
}

Czekamy na Ciebie!

---
PartyPass - Zarządzanie wydarzeniami
    `.trim();
  }

  /**
   * Generuje wiadomość SMS
   */
  static generateSMSMessage(invitation: GuestInvitation, event: Event): string {
    return `Cześć ${invitation.firstName}! Zapraszamy na "${event.title}" ${event.date.toLocaleDateString('pl-PL')}. Potwierdź obecność: ${invitation.rsvpUrl}`;
  } /**
   * Śledzi analytics dla RSVP
   */
  private static async trackRSVPAnalytics(
    eventId: string,
    status: GuestStatus
  ): Promise<void> {
    try {
      // Integracja z AnalyticsService
      const { AnalyticsService } = await import('./analyticsService');

      // Pobierz userId z gościa lub wydarzenia
      const eventDoc = await import('firebase/firestore').then(fb =>
        fb.getDoc(fb.doc(db, 'events', eventId))
      );
      if (eventDoc.exists()) {
        const eventData = eventDoc.data();
        await AnalyticsService.trackMetric(
          eventData.userId,
          'guest_responded',
          1,
          {
            status,
            method: 'rsvp_link',
            timestamp: new Date(),
          },
          eventId
        );
      }
    } catch (error) {
      console.error('Błąd podczas śledzenia analityki RSVP:', error);
    }
  }

  /**
   * Pobiera dane gościa i wydarzenia na podstawie tokenu
   */
  static async getRSVPData(token: string): Promise<{
    guest: Guest;
    event: Event;
    rsvpToken: RSVPToken;
  } | null> {
    try {
      const rsvpToken = await this.getRSVPToken(token);

      if (!rsvpToken) {
        return null;
      }

      // Pobierz dane gościa
      const guestId = rsvpToken.guestId || rsvpToken.eventGuestId;
      if (!guestId) {
        throw new Error('Brak ID gościa w tokenie RSVP');
      }

      const guestDoc = await getDoc(doc(db, 'guests', guestId));
      if (!guestDoc.exists()) {
        throw new Error('Gość nie istnieje');
      }

      // Pobierz dane wydarzenia
      const eventDoc = await getDoc(doc(db, 'events', rsvpToken.eventId));
      if (!eventDoc.exists()) {
        throw new Error('Wydarzenie nie istnieje');
      }

      const guestData = guestDoc.data();
      const eventData = eventDoc.data();

      return {
        guest: {
          id: guestDoc.id,
          ...guestData,
          invitedAt: guestData.invitedAt?.toDate() || new Date(),
          respondedAt: guestData.respondedAt?.toDate(),
          createdAt: guestData.createdAt?.toDate() || new Date(),
          updatedAt: guestData.updatedAt?.toDate(),
          // eventDate nie istnieje w nowej strukturze - używamy daty z wydarzenia
          eventDate: eventData.date?.toDate() || new Date(),
        } as Guest,
        event: {
          id: eventDoc.id,
          ...eventData,
          date: eventData.date?.toDate() || new Date(),
          createdAt: eventData.createdAt?.toDate() || new Date(),
          updatedAt: eventData.updatedAt?.toDate(),
        } as Event,
        rsvpToken,
      };
    } catch (error) {
      console.error('Błąd podczas pobierania danych RSVP:', error);
      throw error;
    }
  }
}

export default RSVPService;
