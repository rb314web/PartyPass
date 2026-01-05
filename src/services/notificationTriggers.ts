// services/notificationTriggers.ts
import { Event, RSVPResponse } from '../types';
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
   * TODO: Temporarily disabled - missing GuestService methods
   */
  static async onGuestResponse(
    eventId: string,
    guestId: string,
    response: RSVPResponse
  ): Promise<void> {
    console.log('🔔 RSVP notification temporarily disabled', {
      eventId,
      guestId,
      response: response.status,
    });
    // TODO: Implement when GuestService.getGuest and GuestService.getEventGuests are available
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

