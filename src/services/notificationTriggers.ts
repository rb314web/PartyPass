// services/notificationTriggers.ts
import { Event, RSVPResponse } from '../types';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { EventService } from './firebase/eventService';
import UserSettingsService from './firebase/userSettingsService';
import EmailService from './emailService';

export class NotificationTriggers {
  private static async getUserData(
    userId: string
  ): Promise<{ email: string; displayName: string } | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const data = userDoc.data();
        const email = typeof data.email === 'string' ? data.email.trim() : '';
        if (!email) return null;
        const firstName = (data.firstName as string) || '';
        const lastName = (data.lastName as string) || '';
        return {
          email,
          displayName: `${firstName} ${lastName}`.trim() || 'Organizatorze',
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  }

  private static async isRsvpEmailEnabled(userId: string): Promise<boolean> {
    try {
      const settings = await UserSettingsService.getUserSettings(userId);
      if (!settings?.email?.enabled) return false;
      if (settings.email.guestResponses === false) return false;
      if (settings.email.rsvpUpdates === false) return false;
      return true;
    } catch {
      return true;
    }
  }

  private static formatPlusOne(response: RSVPResponse): string {
    if (response.status !== 'accepted' || !response.plusOne) return '';
    if (response.plusOneDetails) {
      const name = `${response.plusOneDetails.firstName || ''} ${response.plusOneDetails.lastName || ''}`.trim();
      const diet = response.plusOneDetails.dietaryRestrictions || '';
      return [name || 'Osoba towarzysząca', diet && `Dieta: ${diet}`]
        .filter(Boolean)
        .join(' · ');
    }
    return 'Osoba towarzysząca';
  }

  /**
   * Powiadomienie e-mail do organizatora po odpowiedzi RSVP (z klienta).
   * Działa bez deployu Cloud Functions — w produkcji preferuj processRSVPResponse na serwerze.
   */
  static async onGuestResponse(
    eventId: string,
    guestId: string,
    response: RSVPResponse,
    options?: {
      event?: Event;
      guestName?: string;
      guestEmail?: string;
    }
  ): Promise<void> {
    if (response.status === 'pending') return;

    try {
      const event =
        options?.event ?? (await EventService.getEventById(eventId));
      if (!event?.userId) return;

      const notify = await this.isRsvpEmailEnabled(event.userId);
      if (!notify) return;

      const organizer = await this.getUserData(event.userId);
      const organizerEmail =
        organizer?.email || event.organizerEmail?.trim() || '';
      if (!organizerEmail) return;

      const organizerName = organizer?.displayName || 'Organizatorze';

      const rsvpTemplate =
        process.env.REACT_APP_EMAILJS_RSVP_TEMPLATE_ID ||
        process.env.REACT_APP_EMAILJS_TEMPLATE_ID;
      if (!EmailService.isConfigured() || !rsvpTemplate) {
        console.warn(
          'Powiadomienie RSVP: skonfiguruj REACT_APP_EMAILJS_RSVP_TEMPLATE_ID w .env.local'
        );
        return;
      }

      const guestName = options?.guestName?.trim() || 'Gość';
      const guestEmail = options?.guestEmail?.trim() || '';

      await EmailService.sendRSVPNotification(
        organizerEmail,
        organizerName,
        {
          name: guestName,
          email: guestEmail,
          response: response.status,
          plusOne: this.formatPlusOne(response),
          dietary: response.dietaryRestrictions,
          notes: response.notes,
        },
        event,
        {
          accepted: event.acceptedCount ?? 0,
          pending: event.pendingCount ?? 0,
          declined: event.declinedCount ?? 0,
          total: event.guestCount ?? 0,
        }
      );
    } catch (error) {
      console.error('RSVP notification error:', error);
    }
  }

  static async scheduleEventReminders(event: Event): Promise<void> {
    console.log('Event reminders scheduling not yet implemented for:', event.id);
  }

  static async onEventUpdate(eventId: string, changes: string[]): Promise<void> {
    console.log('Event update notifications not yet implemented for:', eventId, changes);
  }

  static async sendTestEmail(userEmail: string, userName: string): Promise<void> {
    try {
      if (!EmailService.isConfigured()) {
        throw new Error('EmailJS nie jest skonfigurowany. Sprawdź .env.local');
      }

      const emailjs = (await import('@emailjs/browser')).default;

      const templateParams = {
        to_name: userName,
        from_name: 'System PartyPass',
        from_email: 'noreply@partypass.app',
        reply_to: userEmail,
        to_email: userEmail,
        subject: 'Test powiadomień PartyPass',
        message: `Cześć ${userName}!\n\nTo test powiadomień PartyPass.\n\nZespół PartyPass`,
      };

      await emailjs.send(
        process.env.REACT_APP_EMAILJS_SERVICE_ID || '',
        process.env.REACT_APP_EMAILJS_CONTACT_TEMPLATE_ID ||
          process.env.REACT_APP_EMAILJS_TEMPLATE_ID ||
          '',
        templateParams,
        process.env.REACT_APP_EMAILJS_PUBLIC_KEY || ''
      );
    } catch (error) {
      console.error('Error sending test email:', error);
      throw error;
    }
  }
}

export default NotificationTriggers;
