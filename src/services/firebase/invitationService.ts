import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import EmailService from '../emailService';
import { db, getFirebaseFunctions } from '../../config/firebase';
import {
  Event,
  GuestInvitation,
  InvitationDelivery,
  InvitationKind,
  InvitationLogEntry,
  InvitationSendResult,
} from '../../types';
import { COLLECTIONS } from '../../types/firebase';

interface SendInvitationsPayload {
  eventId: string;
  invitations: Array<{
    eventGuestId: string;
    email: string;
    firstName: string;
    lastName: string;
    rsvpUrl: string;
  }>;
  kind: InvitationKind;
  subject: string;
  message?: string;
  event: {
    title: string;
    date: string;
    location: string;
    description?: string;
    dresscode?: string;
    additionalInfo?: string;
  };
}

function extractCallableError(error: unknown): string {
  if (!error || typeof error !== 'object') {
    return 'Nieznany błąd wysyłki e-mail';
  }

  const fb = error as { code?: string; message?: string };
  if (fb.message && fb.message !== 'internal') {
    return fb.message;
  }

  switch (fb.code) {
    case 'functions/not-found':
      return 'Funkcja sendInvitations nie jest wdrożona na Firebase.';
    case 'functions/unauthenticated':
      return 'Zaloguj się ponownie, aby wysłać zaproszenia.';
    case 'functions/permission-denied':
      return 'Brak uprawnień do wysyłki zaproszeń dla tego wydarzenia.';
    case 'functions/failed-precondition':
      return 'EmailJS nie jest skonfigurowany na serwerze (firebase functions:config:set emailjs.*).';
    case 'functions/unavailable':
      return 'Usługa wysyłki jest chwilowo niedostępna. Spróbuj za chwilę.';
    default:
      return fb.message || 'Nie udało się wysłać e-maili przez Cloud Function.';
  }
}

function shouldFallbackToClient(error: unknown): boolean {
  const code = (error as { code?: string })?.code;
  return (
    !code ||
    code === 'functions/not-found' ||
    code === 'functions/unavailable' ||
    code === 'functions/deadline-exceeded' ||
    code === 'functions/failed-precondition' ||
    code === 'functions/internal'
  );
}

function buildSkippedResults(
  invitations: GuestInvitation[]
): InvitationSendResult['results'] {
  return invitations
    .filter(inv => !inv.email?.trim())
    .map(inv => ({
      eventGuestId: inv.eventGuestId,
      status: 'skipped' as const,
      error: 'Brak adresu e-mail',
    }));
}

async function sendViaCloud(
  withEmail: GuestInvitation[],
  invitations: GuestInvitation[],
  event: Event,
  delivery: InvitationDelivery
): Promise<InvitationSendResult> {
  const functions = await getFirebaseFunctions();
  const callable = httpsCallable<
    SendInvitationsPayload,
    InvitationSendResult
  >(functions, 'sendInvitations');

  const result = await callable({
    eventId: event.id,
    invitations: withEmail.map(inv => ({
      eventGuestId: inv.eventGuestId,
      email: inv.email.trim(),
      firstName: inv.firstName,
      lastName: inv.lastName,
      rsvpUrl: inv.rsvpUrl,
    })),
    kind: delivery.kind ?? 'invitation',
    subject: delivery.subject ?? `Zaproszenie na ${event.title}`,
    message: delivery.message,
    event: {
      title: event.title,
      date: event.date.toISOString(),
      location: event.location,
      description: event.description,
      dresscode: event.dresscode,
      additionalInfo: event.additionalInfo,
    },
  });

  const data = result.data;
  const skippedNoEmail = invitations.length - withEmail.length;

  return {
    sent: data.sent,
    failed: data.failed,
    skipped: data.skipped + skippedNoEmail,
    results: [...data.results, ...buildSkippedResults(invitations)],
  };
}

async function sendViaClient(
  withEmail: GuestInvitation[],
  invitations: GuestInvitation[],
  event: Event,
  delivery: InvitationDelivery
): Promise<InvitationSendResult> {
  const status = EmailService.getConfigurationStatus();
  if (!status.configured) {
    throw new Error(
      `Wysyłka e-mail wymaga EmailJS w .env.local (${status.missing.join(', ')}) ` +
        'lub wdrożonej funkcji sendInvitations z konfiguracją emailjs na Firebase.'
    );
  }

  const bulk = await EmailService.sendBulkInvitationEmails(
    withEmail,
    event,
    delivery,
    1200
  );

  const skippedNoEmail = invitations.length - withEmail.length;
  const results: InvitationSendResult['results'] = invitations.map(inv => {
    if (!inv.email?.trim()) {
      return {
        eventGuestId: inv.eventGuestId,
        status: 'skipped' as const,
        error: 'Brak adresu e-mail',
      };
    }
    const errLine = bulk.errors.find(e => e.startsWith(inv.email));
    if (errLine) {
      return {
        eventGuestId: inv.eventGuestId,
        status: 'failed' as const,
        error: errLine,
      };
    }
    return { eventGuestId: inv.eventGuestId, status: 'sent' as const };
  });

  const sendResult: InvitationSendResult = {
    sent: bulk.sent,
    failed: bulk.failed,
    skipped: skippedNoEmail,
    results,
  };

  if (bulk.sent === 0) {
    throw Object.assign(
      new Error(
        bulk.errors[0] ||
          'Nie udało się wysłać żadnego e-maila. Sprawdź szablon EmailJS (pole to_email).'
      ),
      { sendResult }
    );
  }

  if (bulk.failed > 0) {
    throw Object.assign(
      new Error(
        `Wysłano ${bulk.sent} z ${withEmail.length}. ${bulk.failed} nie powiodło się.`
      ),
      { sendResult }
    );
  }

  return sendResult;
}

export class InvitationService {
  static getEmailSetupStatus() {
    return EmailService.getConfigurationStatus();
  }

  static async sendEmailInvitations(
    invitations: GuestInvitation[],
    event: Event,
    delivery: InvitationDelivery
  ): Promise<InvitationSendResult> {
    const withEmail = invitations.filter(inv => inv.email?.trim());
    const skippedNoEmail = invitations.length - withEmail.length;

    if (withEmail.length === 0) {
      return {
        sent: 0,
        failed: 0,
        skipped: skippedNoEmail,
        results: invitations.map(inv => ({
          eventGuestId: inv.eventGuestId,
          status: 'skipped' as const,
          error: 'Brak adresu e-mail',
        })),
      };
    }

    let cloudError: unknown;
    let cloudResult: InvitationSendResult | null = null;

    // Lokalny EmailJS (najszybsza ścieżka w dev / bez deployu funkcji)
    if (EmailService.isConfigured()) {
      try {
        return await sendViaClient(withEmail, invitations, event, delivery);
      } catch (clientError) {
        const partial = (clientError as { sendResult?: InvitationSendResult })
          .sendResult;
        if (partial && partial.sent > 0) {
          throw clientError;
        }
        // Klient nie zadziałał — spróbuj Cloud Function
        console.warn('EmailJS z klienta nie powiódł się, próbuję Cloud Function:', clientError);
      }
    }

    try {
      cloudResult = await sendViaCloud(withEmail, invitations, event, delivery);
      if (cloudResult.sent > 0) {
        return cloudResult;
      }
    } catch (error) {
      cloudError = error;
      if (!shouldFallbackToClient(error)) {
        throw new Error(extractCallableError(error));
      }
    }

    try {
      return await sendViaClient(withEmail, invitations, event, delivery);
    } catch (clientError) {
      const clientMessage =
        clientError instanceof Error
          ? clientError.message
          : 'Błąd wysyłki przez EmailJS';

      if (cloudResult && cloudResult.failed > 0) {
        throw Object.assign(
          new Error(
            `${extractCallableError(cloudError)} Fallback EmailJS: ${clientMessage}`
          ),
          { sendResult: cloudResult }
        );
      }

      if (cloudError) {
        throw new Error(
          `${extractCallableError(cloudError)} ${clientMessage}`
        );
      }

      throw clientError;
    }
  }

  static async getInvitationLogsForEvent(
    eventId: string,
    maxEntries = 50
  ): Promise<InvitationLogEntry[]> {
    const logsQuery = query(
      collection(db, COLLECTIONS.INVITATION_LOGS),
      where('eventId', '==', eventId),
      orderBy('sentAt', 'desc'),
      limit(maxEntries)
    );

    const snapshot = await getDocs(logsQuery);
    return snapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        eventId: data.eventId,
        userId: data.userId,
        eventGuestId: data.eventGuestId,
        guestName: data.guestName,
        recipient: data.recipient,
        channel: data.channel,
        kind: data.kind,
        status: data.status,
        errorMessage: data.errorMessage,
        sentAt: data.sentAt?.toDate?.() ?? new Date(data.sentAt),
      };
    });
  }

  static getLastSentByGuest(
    logs: InvitationLogEntry[]
  ): Map<string, Date> {
    const map = new Map<string, Date>();
    for (const log of logs) {
      if (log.status !== 'sent') continue;
      if (!map.has(log.eventGuestId)) {
        map.set(log.eventGuestId, log.sentAt);
      }
    }
    return map;
  }
}
