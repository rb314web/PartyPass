// services/firebase/newRSVPService.ts
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
  writeBatch,
  Timestamp
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
  InvitationDelivery
} from '../../types';
import { COLLECTIONS } from '../../types/firebase';
import { EventGuestService } from './eventGuestService';

export class NewRSVPService {
  private static readonly RSVP_TOKENS_COLLECTION = 'rsvpTokens';
  private static readonly BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:3000';

  /**
   * Generuje unikalny token RSVP dla EventGuest
   */
  static async generateRSVPToken(eventGuestId: string, eventId: string): Promise<RSVPToken> {
    try {
      const token = this.generateUniqueToken();
      const now = new Date();
      const expiresAt = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 dni

      const rsvpTokenData = {
        eventGuestId,
        eventId,
        token,
        isUsed: false,
        createdAt: Timestamp.fromDate(now),
        expiresAt: Timestamp.fromDate(expiresAt)
      };

      const docRef = await addDoc(collection(db, this.RSVP_TOKENS_COLLECTION), rsvpTokenData);

      return {
        id: docRef.id,
        eventGuestId,
        eventId,
        token,
        isUsed: false,
        createdAt: now,
        expiresAt
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
        usedAt: tokenData.usedAt?.toDate()
      };
    } catch (error: any) {
      throw new Error(`Błąd podczas pobierania tokenu RSVP: ${error.message}`);
    }
  }

  /**
   * Waliduje token RSVP
   */
  static async validateRSVPToken(token: string): Promise<{ valid: boolean; reason?: string }> {
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
      const eventGuestRef = doc(db, 'eventGuests', rsvpToken.eventGuestId);
      const eventGuestDoc = await getDoc(eventGuestRef);
      
      if (!eventGuestDoc.exists()) {
        throw new Error('Gość wydarzenia nie istnieje');
      }

      const eventGuestData = eventGuestDoc.data();

      // Pobierz dane Contact
      const contactRef = doc(db, 'contacts', eventGuestData.contactId);
      const contactDoc = await getDoc(contactRef);
      
      if (!contactDoc.exists()) {
        throw new Error('Kontakt nie istnieje');
      }

      const contactData = contactDoc.data();

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
        }
      };

      const event = {
        id: eventDoc.id,
        userId: eventData.userId,
        title: eventData.title,
        description: eventData.description,
        date: eventData.date.toDate(),
        location: eventData.location,
        maxGuests: eventData.maxGuests,
        status: eventData.status,
        createdAt: eventData.createdAt.toDate(),
        updatedAt: eventData.updatedAt?.toDate(),
        tags: eventData.tags,
        isPrivate: eventData.isPrivate,
        requireRSVP: eventData.requireRSVP,
        allowPlusOne: eventData.allowPlusOne,
        sendReminders: eventData.sendReminders,
        imageUrl: eventData.imageUrl,
        guestCount: eventData.guestCount,
        acceptedCount: eventData.acceptedCount,
        pendingCount: eventData.pendingCount,
        declinedCount: eventData.declinedCount,
        maybeCount: eventData.maybeCount,
        dresscode: eventData.dresscode,
        additionalInfo: eventData.additionalInfo
      };

      return {
        eventGuest,
        event,
        rsvpToken
      };
    } catch (error: any) {
      throw new Error(`Błąd podczas pobierania danych RSVP: ${error.message}`);
    }
  }

  /**
   * Przetwarza odpowiedź RSVP
   */
  static async processRSVPResponse(token: string, response: RSVPResponse): Promise<void> {
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
      const eventGuestRef = doc(db, 'eventGuests', rsvpToken.eventGuestId);
      const updateData: any = {
        status: response.status,
        respondedAt: Timestamp.now(),
        updatedAt: Timestamp.now()
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
          const contactRef = doc(db, 'contacts', eventGuestDoc.data().contactId);
          const contactUpdateData: any = {};
          
          if (response.dietaryRestrictions) {
            contactUpdateData.dietaryRestrictions = response.dietaryRestrictions;
          }
          if (response.notes) {
            contactUpdateData.notes = response.notes;
          }
          contactUpdateData.updatedAt = Timestamp.now();
          
          batch.update(contactRef, contactUpdateData);
        }
      }

      // Oznacz token jako użyty
      const tokenRef = doc(db, this.RSVP_TOKENS_COLLECTION, rsvpToken.id);
      batch.update(tokenRef, {
        isUsed: true,
        usedAt: Timestamp.now()
      });

      await batch.commit();

      // Aktualizuj liczniki wydarzenia
      await EventGuestService.updateEventCounts(rsvpToken.eventId, response.status, 'add');
    } catch (error: any) {
      throw new Error(`Błąd podczas przetwarzania odpowiedzi RSVP: ${error.message}`);
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
    const url = this.generateRSVPUrl(token);
    // Używamy publicznego API do generowania QR kodów
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
    return qrApiUrl;
  }

  /**
   * Tworzy zaproszenia dla wszystkich gości wydarzenia
   */
  static async generateInvitationsForEvent(eventId: string): Promise<GuestInvitation[]> {
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
          qrCode
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
  private static async getRSVPTokenForEventGuest(eventGuestId: string): Promise<RSVPToken | null> {
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
        usedAt: tokenData.usedAt?.toDate()
      };
    } catch (error) {
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
  private static async trackRSVPAnalytics(eventId: string, status: GuestStatus): Promise<void> {
    try {
      // TODO: Implementacja analytics
      console.log(`RSVP Analytics: Event ${eventId}, Status ${status}`);
    } catch (error) {
      console.warn('Nie udało się zapisać analytics RSVP:', error);
    }
  }
}
