// services/emailService.ts
import emailjs from '@emailjs/browser';
import { GuestInvitation, Event, InvitationDelivery } from '../types';

export class EmailService {
  private static readonly SERVICE_ID =
    process.env.REACT_APP_EMAILJS_SERVICE_ID || '';
  private static readonly TEMPLATE_ID =
    process.env.REACT_APP_EMAILJS_TEMPLATE_ID || '';
  private static readonly CONTACT_TEMPLATE_ID =
    process.env.REACT_APP_EMAILJS_CONTACT_TEMPLATE_ID ||
    process.env.REACT_APP_EMAILJS_TEMPLATE_ID ||
    '';
  private static readonly RSVP_NOTIFICATION_TEMPLATE_ID =
    process.env.REACT_APP_EMAILJS_RSVP_TEMPLATE_ID ||
    process.env.REACT_APP_EMAILJS_TEMPLATE_ID ||
    '';
  private static readonly REMINDER_ORGANIZER_TEMPLATE_ID =
    process.env.REACT_APP_EMAILJS_REMINDER_ORG_TEMPLATE_ID ||
    process.env.REACT_APP_EMAILJS_TEMPLATE_ID ||
    '';
  private static readonly REMINDER_GUEST_TEMPLATE_ID =
    process.env.REACT_APP_EMAILJS_REMINDER_GUEST_TEMPLATE_ID ||
    process.env.REACT_APP_EMAILJS_TEMPLATE_ID ||
    '';
  private static readonly PUBLIC_KEY =
    process.env.REACT_APP_EMAILJS_PUBLIC_KEY || '';

  /**
   * Inicjalizuje EmailJS
   */
  static init(): void {
    if (this.PUBLIC_KEY) {
      emailjs.init(this.PUBLIC_KEY);
    } else {
      console.warn(
        'EmailJS nie został skonfigurowany. Sprawdź zmienne środowiskowe.'
      );
    }
  }

  /**
   * Wysyła pojedynczy e-mail z zaproszeniem
   */
  static async sendInvitationEmail(
    invitation: GuestInvitation,
    event: Event,
    delivery: InvitationDelivery
  ): Promise<void> {
    try {
      if (!this.SERVICE_ID || !this.TEMPLATE_ID || !this.PUBLIC_KEY) {
        // Fallback do konsoli gdy EmailJS nie jest skonfigurowany
        this.logEmailToConsole(invitation, event, delivery);
        return;
      }

      const templateParams = {
        to_name: `${invitation.firstName} ${invitation.lastName}`,
        to_email: invitation.email,
        event_title: event.title,
        event_date: event.date.toLocaleDateString('pl-PL', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        event_location: event.location,
        event_description: event.description || '',
        rsvp_url: invitation.rsvpUrl,
        custom_message:
          delivery.message ||
          `Zostałeś zaproszony na wydarzenie "${event.title}".`,
        subject: delivery.subject || `Zaproszenie na ${event.title}`,
        dresscode: event.dresscode || '',
        additional_info: event.additionalInfo || '',
        organizer_name: 'Organizator', // Default organizer name
      };

      await emailjs.send(
        this.SERVICE_ID,
        this.TEMPLATE_ID,
        templateParams,
        this.PUBLIC_KEY
      );

      console.log(`✅ Email wysłany do ${invitation.email}`);
    } catch (error) {
      console.error(
        `❌ Błąd podczas wysyłania e-maila do ${invitation.email}:`,
        error
      );
      // Fallback do konsoli
      this.logEmailToConsole(invitation, event, delivery);
      throw new Error(`Nie udało się wysłać e-maila do ${invitation.email}`);
    }
  }

  /**
   * Wysyła e-maile do wielu odbiorców z opóźnieniem
   */
  static async sendBulkInvitationEmails(
    invitations: GuestInvitation[],
    event: Event,
    delivery: InvitationDelivery,
    delayMs: number = 1000
  ): Promise<{ sent: number; failed: number; errors: string[] }> {
    const results = {
      sent: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (let i = 0; i < invitations.length; i++) {
      const invitation = invitations[i];

      try {
        await this.sendInvitationEmail(invitation, event, delivery);
        results.sent++;

        // Dodaj opóźnienie między e-mailami (aby uniknąć rate limiting)
        if (i < invitations.length - 1) {
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      } catch (error) {
        results.failed++;
        results.errors.push(
          `${invitation.email}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

    return results;
  }

  /**
   * Loguje e-mail do konsoli jako fallback
   */
  private static logEmailToConsole(
    invitation: GuestInvitation,
    event: Event,
    delivery: InvitationDelivery
  ): void {
    const emailContent = this.generateEmailContent(invitation, event, delivery);

    console.log('📧 EMAIL CONTENT (Fallback - EmailJS not configured):');
    console.log('━'.repeat(50));
    console.log(`TO: ${invitation.email}`);
    console.log(
      `SUBJECT: ${delivery.subject || `Zaproszenie na ${event.title}`}`
    );
    console.log('━'.repeat(50));
    console.log(emailContent);
    console.log('━'.repeat(50));
    console.log(`RSVP URL: ${invitation.rsvpUrl}`);
    console.log('━'.repeat(50));
  }

  /**
   * Generuje treść e-maila
   */
  private static generateEmailContent(
    invitation: GuestInvitation,
    event: Event,
    delivery: InvitationDelivery
  ): string {
    return `
Cześć ${invitation.firstName}!

${delivery.message || `Zostałeś zaproszony na wydarzenie "${event.title}".`}

📅 Data: ${event.date.toLocaleDateString('pl-PL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })}
📍 Miejsce: ${event.location}
${event.description ? `📝 Opis: ${event.description}` : ''}
${event.dresscode ? `👔 Dress code: ${event.dresscode}` : ''}
${event.additionalInfo ? `ℹ️ Dodatkowe informacje: ${event.additionalInfo}` : ''}

Aby potwierdzić swoją obecność, kliknij w link poniżej:
${invitation.rsvpUrl}

${
  delivery.includeQR
    ? `
🔗 Możesz też zeskanować kod QR dołączony do tej wiadomości.
`
    : ''
}

Czekamy na Ciebie!

---
PartyPass - Zarządzanie wydarzeniami
    `.trim();
  }

  /**
   * Wysyła wiadomość z formularza kontaktowego
   * Używa EmailJS bezpośrednio z przeglądarki
   */
  static async sendContactForm(data: {
    email: string;
    name: string;
    message: string;
  }): Promise<void> {
    try {
      if (!this.SERVICE_ID || !this.CONTACT_TEMPLATE_ID || !this.PUBLIC_KEY) {
        // Fallback do konsoli gdy EmailJS nie jest skonfigurowany
        console.warn(
          'EmailJS nie jest skonfigurowany dla formularza kontaktowego. Sprawdź zmienne środowiskowe.'
        );
        this.logContactFormToConsole(data);
        return;
      }

      // Przygotuj parametry szablonu
      const templateParams = {
        to_name: 'Administrator PartyPass',
        from_name: data.name,
        from_email: data.email,
        reply_to: data.email,
        subject: 'Nowa wiadomość z formularza kontaktowego',
        message: data.message,
      };

      // Wyślij email przez EmailJS
      await emailjs.send(
        this.SERVICE_ID,
        this.CONTACT_TEMPLATE_ID,
        templateParams,
        this.PUBLIC_KEY
      );

      console.log('✅ Wiadomość kontaktowa wysłana pomyślnie');
    } catch (error: any) {
      console.error('❌ Błąd podczas wysyłania wiadomości:', error);

      // Fallback do konsoli w trybie deweloperskim
      if (process.env.NODE_ENV === 'development') {
        console.warn('Fallback: wyświetlanie wiadomości w konsoli');
      this.logContactFormToConsole(data);
      }

      // Rzucaj bardziej opisowy błąd
      const errorMessage =
        error.text ||
        error.message ||
        'Nie udało się wysłać wiadomości. Spróbuj ponownie później.';
      throw new Error(errorMessage);
    }
  }

  /**
   * Loguje wiadomość z formularza kontaktowego do konsoli (fallback)
   */
  private static logContactFormToConsole(data: {
    email: string;
    name: string;
    message: string;
  }): void {
    console.log('📧 WIADOMOŚĆ KONTAKTOWA (Fallback):');
    console.log('━'.repeat(50));
    console.log(`Od: ${data.name} <${data.email}>`);
    console.log('Temat: Nowa wiadomość z formularza kontaktowego');
    console.log('━'.repeat(50));
    console.log(data.message);
    console.log('━'.repeat(50));
  }

  /**
   * Wysyła powiadomienie o odpowiedzi RSVP do organizatora
   */
  static async sendRSVPNotification(
    organizerEmail: string,
    organizerName: string,
    guestData: {
      name: string;
      email: string;
      response: 'accepted' | 'declined' | 'maybe';
      plusOne?: string;
      dietary?: string;
      notes?: string;
    },
    event: Event,
    stats: {
      accepted: number;
      pending: number;
      declined: number;
      total: number;
    }
  ): Promise<void> {
    try {
      if (!this.SERVICE_ID || !this.RSVP_NOTIFICATION_TEMPLATE_ID || !this.PUBLIC_KEY) {
        console.warn('RSVP notification template not configured');
        this.logRSVPNotificationToConsole(organizerEmail, organizerName, guestData, event, stats);
        return;
      }

      const responseText = {
        accepted: 'potwierdził',
        declined: 'odrzucił',
        maybe: 'jest niezdecydowany na'
      }[guestData.response];

      const statusBadge = {
        accepted: '✅ Potwierdził',
        declined: '❌ Odrzucił',
        maybe: '❓ Niezdecydowany'
      }[guestData.response];

      const responseStatus = guestData.response;

      const templateParams = {
        to_email: organizerEmail,
        organizer_name: organizerName,
        guest_name: guestData.name,
        guest_email: guestData.email,
        event_title: event.title,
        event_date: new Date(event.date).toLocaleDateString('pl-PL', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        event_url: `${window.location.origin}/dashboard/events/${event.id}`,
        response_text: responseText,
        status_badge: statusBadge,
        response_status: responseStatus,
        plusOne: guestData.plusOne || '',
        dietary_restrictions: guestData.dietary || '',
        notes: guestData.notes || '',
        accepted_count: stats.accepted,
        pending_count: stats.pending,
        declined_count: stats.declined,
        total_guests: stats.total,
      };

      await emailjs.send(
        this.SERVICE_ID,
        this.RSVP_NOTIFICATION_TEMPLATE_ID,
        templateParams,
        this.PUBLIC_KEY
      );

      console.log(`✅ RSVP notification sent to ${organizerEmail}`);
    } catch (error) {
      console.error(`❌ Error sending RSVP notification to ${organizerEmail}:`, error);
      // Don't throw - notification failure shouldn't break RSVP processing
    }
  }

  /**
   * Wysyła przypomnienie o wydarzeniu
   */
  static async sendEventReminder(
    recipient: {
      email: string;
      name: string;
      isOrganizer: boolean;
    },
    event: Event,
    daysUntil: number,
    organizerStats?: {
      accepted: number;
      pending: number;
      declined: number;
      total: number;
    }
  ): Promise<void> {
    try {
      const templateId = recipient.isOrganizer
        ? this.REMINDER_ORGANIZER_TEMPLATE_ID
        : this.REMINDER_GUEST_TEMPLATE_ID;

      if (!this.SERVICE_ID || !templateId || !this.PUBLIC_KEY) {
        console.warn('Event reminder template not configured');
        return;
      }

      const timeDescription = daysUntil === 0 
        ? 'dzisiaj' 
        : daysUntil === 1 
          ? 'jutro' 
          : `za ${daysUntil} dni`;

      const templateParams: any = {
        to_email: recipient.email,
        recipient_name: recipient.name,
        event_title: event.title,
        event_date: new Date(event.date).toLocaleDateString('pl-PL', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        event_location: event.location || 'Brak lokalizacji',
        event_description: event.description || '',
        dresscode: event.dresscode || '',
        additional_info: event.additionalInfo || '',
        time_description: timeDescription,
        days_until: daysUntil,
        event_url: `${window.location.origin}/dashboard/events/${event.id}`,
      };

      // Dodaj statystyki tylko dla organizatora
      if (recipient.isOrganizer && organizerStats) {
        templateParams.accepted_count = organizerStats.accepted;
        templateParams.pending_count = organizerStats.pending;
        templateParams.declined_count = organizerStats.declined;
        templateParams.total_guests = organizerStats.total;
      }

      await emailjs.send(
        this.SERVICE_ID,
        templateId,
        templateParams,
        this.PUBLIC_KEY
      );

      console.log(`✅ Event reminder sent to ${recipient.email}`);
    } catch (error) {
      console.error(`❌ Error sending event reminder to ${recipient.email}:`, error);
    }
  }

  /**
   * Loguje powiadomienie RSVP do konsoli (fallback)
   */
  private static logRSVPNotificationToConsole(
    organizerEmail: string,
    organizerName: string,
    guestData: any,
    event: Event,
    stats: any
  ): void {
    console.log('📧 RSVP NOTIFICATION (Fallback):');
    console.log('━'.repeat(50));
    console.log(`TO: ${organizerEmail}`);
    console.log(`ORGANIZER: ${organizerName}`);
    console.log(`GUEST: ${guestData.name} (${guestData.email})`);
    console.log(`RESPONSE: ${guestData.response}`);
    console.log(`EVENT: ${event.title}`);
    console.log(`STATS: ${stats.accepted}/${stats.total} confirmed`);
    console.log('━'.repeat(50));
  }

  /**
   * Sprawdza czy EmailJS jest skonfigurowany
   */
  static isConfigured(): boolean {
    return !!(this.SERVICE_ID && this.TEMPLATE_ID && this.PUBLIC_KEY);
  }

  /**
   * Zwraca status konfiguracji
   */
  static getConfigurationStatus(): {
    configured: boolean;
    missing: string[];
    message: string;
  } {
    const missing: string[] = [];

    if (!this.SERVICE_ID) missing.push('REACT_APP_EMAILJS_SERVICE_ID');
    if (!this.TEMPLATE_ID) missing.push('REACT_APP_EMAILJS_TEMPLATE_ID');
    if (!this.PUBLIC_KEY) missing.push('REACT_APP_EMAILJS_PUBLIC_KEY');

    const configured = missing.length === 0;

    return {
      configured,
      missing,
      message: configured
        ? 'EmailJS jest poprawnie skonfigurowany'
        : `Brakuje zmiennych środowiskowych: ${missing.join(', ')}`,
    };
  }
}

export default EmailService;
