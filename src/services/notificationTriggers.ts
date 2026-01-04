// services/notificationTriggers.ts
import { EmailService } from './emailService';
import { Event, RSVPResponse } from '../types';
import { EventService } from './firebase/eventService';
import { GuestService } from './firebase/guestService';
import { UserSettingsService } from './firebase/userSettingsService';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export class NotificationTriggers {
  /**
   * Pobiera dane użytkownika (email, displayName)
   */
  private static async getUserData(
    userId: string
  ): Promise<{ email: string; displayName: string } | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          email: data.email || '',
          displayName: data.displayName || 'Użytkownik',
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  }

  /**
   * Wyzwala powiadomienie email o odpowiedzi RSVP
   */
  static async onGuestResponse(
    eventId: string,
    guestId: string,
    response: RSVPResponse
  ): Promise<void> {
    try {
      console.log('🔔 Triggering RSVP notification...', {
        eventId,
        guestId,
        response: response.status,
      });

      // 1. Pobierz dane wydarzenia
      const event = await EventService.getEvent(eventId);
      if (!event) {
        console.warn('Event not found:', eventId);
        return;
      }

      // 2. Sprawdź preferencje organizatora
      const hasEmailEnabled = await UserSettingsService.hasEmailNotificationsEnabled(
        event.userId,
        'rsvpUpdates'
      );

      if (!hasEmailEnabled) {
        console.log('Email notifications disabled for user:', event.userId);
        return;
      }

      // 3. Pobierz dane organizatora
      const organizerData = await this.getUserData(event.userId);
      if (!organizerData || !organizerData.email) {
        console.warn('Organizer email not found');
        return;
      }

      // 4. Pobierz dane gościa
      const guest = await GuestService.getGuest(guestId);
      if (!guest) {
        console.warn('Guest not found:', guestId);
        return;
      }

      // 5. Pobierz statystyki gości dla wydarzenia
      const allGuests = await GuestService.getEventGuests(eventId);
      const stats = {
        accepted: allGuests.filter(g => g.status === 'accepted').length,
        pending: allGuests.filter(g => g.status === 'pending').length,
        declined: allGuests.filter(g => g.status === 'declined').length,
        total: allGuests.length,
      };

      // 6. Wyślij powiadomienie
      await EmailService.sendRSVPNotification(
        organizerData.email,
        organizerData.displayName,
        {
          name: `${guest.firstName} ${guest.lastName}`.trim(),
          email: guest.email || '',
          response: response.status,
          plusOne: response.plusOneDetails,
          dietary: response.dietaryRestrictions,
          notes: response.notes,
        },
        event,
        stats
      );

      console.log('✅ RSVP notification sent successfully');
    } catch (error) {
      console.error('Error in onGuestResponse trigger:', error);
      // Don't throw - notification failure shouldn't break RSVP processing
    }
  }

  /**
   * Planuje przypomnienia dla wydarzenia
   * TODO: Implementacja z Cloud Functions lub client-side scheduling
   */
  static async scheduleEventReminders(event: Event): Promise<void> {
    console.log('📅 Event reminders scheduling not yet implemented for:', event.id);
    // This would require Cloud Functions with Cloud Scheduler
    // or a client-side approach with checking on dashboard load
  }

  /**
   * Wyzwala powiadomienie o aktualizacji wydarzenia
   * TODO: Implementacja gdy będzie potrzebna
   */
  static async onEventUpdate(
    eventId: string,
    changes: string[]
  ): Promise<void> {
    console.log('📝 Event update notifications not yet implemented for:', eventId);
    // This would send emails to all confirmed guests
  }

  /**
   * Wysyła test email (dla przycisków testowych w UI)
   */
  static async sendTestEmail(userEmail: string, userName: string): Promise<void> {
    try {
      // Użyj EmailService.sendContactForm ale dostosuj do wysyłki testowej
      const { EmailService } = await import('./emailService');
      
      // Sprawdź czy EmailJS jest skonfigurowany
      if (!EmailService.isConfigured()) {
        throw new Error('EmailJS nie jest skonfigurowany. Sprawdź zmienne środowiskowe w .env.local');
      }

      // Wyślij testową wiadomość używając szablonu kontaktowego
      // Szablon kontaktowy wysyła do admina, ale dla testu zmienimy parametry
      const emailjs = (await import('@emailjs/browser')).default;
      
      const templateParams = {
        to_name: userName,
        from_name: 'System PartyPass',
        from_email: 'noreply@partypass.app',
        reply_to: userEmail,
        to_email: userEmail, // Dodane dla bezpośredniej wysyłki
        subject: '🎉 Test powiadomień PartyPass',
        message: `Cześć ${userName}!\n\nTo jest testowa wiadomość z systemu powiadomień PartyPass.\n\nJeśli widzisz tę wiadomość, oznacza to że:\n✅ Twój adres email jest poprawnie skonfigurowany\n✅ System powiadomień działa prawidłowo\n✅ Będziesz otrzymywać powiadomienia o wydarzeniach\n\nMożesz zarządzać swoimi preferencjami powiadomień w ustawieniach.\n\nPozdrawiamy,\nZespół PartyPass`,
      };

      await emailjs.send(
        process.env.REACT_APP_EMAILJS_SERVICE_ID || '',
        process.env.REACT_APP_EMAILJS_CONTACT_TEMPLATE_ID || process.env.REACT_APP_EMAILJS_TEMPLATE_ID || '',
        templateParams,
        process.env.REACT_APP_EMAILJS_PUBLIC_KEY || ''
      );

      console.log('✅ Test email sent successfully to:', userEmail);
    } catch (error) {
      console.error('❌ Error sending test email:', error);
      throw error;
    }
  }
}

export default NotificationTriggers;

