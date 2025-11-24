// services/emailService.ts
import emailjs from '@emailjs/browser';
import { GuestInvitation, Event, InvitationDelivery } from '../types';

export class EmailService {
  private static readonly SERVICE_ID =
    process.env.REACT_APP_EMAILJS_SERVICE_ID || '';
  private static readonly TEMPLATE_ID =
    process.env.REACT_APP_EMAILJS_TEMPLATE_ID || '';
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
   */
  static async sendContactForm(data: {
    email: string;
    name: string;
    message: string;
  }): Promise<void> {
    try {
      if (!this.SERVICE_ID || !this.TEMPLATE_ID || !this.PUBLIC_KEY) {
        console.warn(
          'EmailJS nie został skonfigurowany. Wiadomość zostanie wyświetlona w konsoli.'
        );
        this.logContactFormToConsole(data);
        return;
      }

      const templateParams = {
        to_name: 'Administrator PartyPass',
        to_email: process.env.REACT_APP_ADMIN_EMAIL || 'kontakt@partypass.pl',
        from_name: data.name,
        reply_to: data.email,
        subject: 'Nowa wiadomość z formularza kontaktowego',
        message: data.message,
      };

      await emailjs.send(
        this.SERVICE_ID,
        this.TEMPLATE_ID, // Używamy głównego template ID
        templateParams,
        this.PUBLIC_KEY
      );

      console.log('✅ Wiadomość kontaktowa wysłana pomyślnie');
    } catch (error) {
      console.error('❌ Błąd podczas wysyłania wiadomości:', error);
      this.logContactFormToConsole(data);
      throw new Error('Nie udało się wysłać wiadomości');
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
