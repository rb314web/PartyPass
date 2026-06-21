import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import axios from 'axios';

const db = admin.firestore();

type InvitationKind = 'invitation' | 'reminder';

interface InvitationPayload {
  eventGuestId: string;
  email: string;
  firstName: string;
  lastName: string;
  rsvpUrl: string;
}

interface SendInvitationsRequest {
  eventId: string;
  invitations: InvitationPayload[];
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

interface SendResultItem {
  eventGuestId: string;
  status: 'sent' | 'failed' | 'skipped';
  error?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function formatEventDate(isoDate: string): string {
  try {
    return new Date(isoDate).toLocaleDateString('pl-PL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoDate;
  }
}

async function verifyEventOwnership(
  eventId: string,
  userId: string
): Promise<void> {
  const eventSnap = await db.collection('events').doc(eventId).get();
  if (!eventSnap.exists) {
    throw new functions.https.HttpsError('not-found', 'Wydarzenie nie istnieje');
  }
  if (eventSnap.data()?.userId !== userId) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Brak uprawnień do tego wydarzenia'
    );
  }
}

async function verifyGuestBelongsToEvent(
  eventGuestId: string,
  eventId: string
): Promise<boolean> {
  const guestSnap = await db.collection('guests').doc(eventGuestId).get();
  if (!guestSnap.exists) return false;
  return guestSnap.data()?.eventId === eventId;
}

async function sendInvitationEmail(
  invitation: InvitationPayload,
  event: SendInvitationsRequest['event'],
  kind: InvitationKind,
  subject: string,
  message: string | undefined,
  emailjsConfig: {
    serviceId: string;
    templateId: string;
    publicKey: string;
  }
): Promise<void> {
  const defaultMessage =
    kind === 'reminder'
      ? `Przypominamy o wydarzeniu "${event.title}". Prosimy o potwierdzenie obecności.`
      : `Zostałeś zaproszony na wydarzenie "${event.title}".`;

  const templateParams = {
    to_name: `${invitation.firstName} ${invitation.lastName}`,
    to_email: invitation.email,
    event_title: event.title,
    event_date: formatEventDate(event.date),
    event_location: event.location,
    event_description: event.description || '',
    rsvp_url: invitation.rsvpUrl,
    custom_message: message?.trim() || defaultMessage,
    subject,
    dresscode: event.dresscode || '',
    additional_info: event.additionalInfo || '',
    organizer_name: 'Organizator',
  };

  const response = await axios.post(
    'https://api.emailjs.com/api/v1.0/email/send',
    {
      service_id: emailjsConfig.serviceId,
      template_id: emailjsConfig.templateId,
      user_id: emailjsConfig.publicKey,
      template_params: templateParams,
    },
    { headers: { 'Content-Type': 'application/json' } }
  );

  if (response.status !== 200) {
    throw new Error(`EmailJS zwrócił status ${response.status}`);
  }
}

async function logInvitation(
  params: {
    eventId: string;
    userId: string;
    eventGuestId: string;
    guestName: string;
    recipient: string;
    kind: InvitationKind;
    status: 'sent' | 'failed' | 'skipped';
    errorMessage?: string;
  }
): Promise<void> {
  await db.collection('invitationLogs').add({
    eventId: params.eventId,
    userId: params.userId,
    eventGuestId: params.eventGuestId,
    guestName: params.guestName,
    recipient: params.recipient,
    channel: 'email',
    kind: params.kind,
    status: params.status,
    errorMessage: params.errorMessage ?? null,
    sentAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

async function markGuestInvited(eventGuestId: string): Promise<void> {
  await db.collection('guests').doc(eventGuestId).update({
    lastInvitationSentAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

export const sendInvitations = functions.https.onCall(
  async (data: SendInvitationsRequest, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'Wymagane zalogowanie'
      );
    }

    if (!data?.eventId || !Array.isArray(data.invitations)) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Nieprawidłowe dane zaproszeń'
      );
    }

    if (data.invitations.length === 0) {
      return { sent: 0, failed: 0, skipped: 0, results: [] };
    }

    if (data.invitations.length > 100) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Maksymalnie 100 zaproszeń na raz'
      );
    }

    const userId = context.auth.uid;
    await verifyEventOwnership(data.eventId, userId);

    const config = functions.config();
    const serviceId = config.emailjs?.service_id;
    const templateId =
      config.emailjs?.invitation_template_id || config.emailjs?.template_id;
    const publicKey = config.emailjs?.public_key;

    if (!serviceId || !templateId || !publicKey) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'EmailJS nie jest skonfigurowany na serwerze (functions:config:set emailjs.*)'
      );
    }

    const emailjsConfig = { serviceId, templateId, publicKey };
    const subject =
      data.subject?.trim() ||
      (data.kind === 'reminder'
        ? `Przypomnienie: ${data.event.title}`
        : `Zaproszenie na ${data.event.title}`);

    const results: SendResultItem[] = [];
    let sent = 0;
    let failed = 0;
    let skipped = 0;

    for (let i = 0; i < data.invitations.length; i++) {
      const invitation = data.invitations[i];
      const guestName = `${invitation.firstName} ${invitation.lastName}`.trim();

      if (!invitation.email?.trim() || !EMAIL_REGEX.test(invitation.email)) {
        skipped++;
        const error = 'Nieprawidłowy lub brakujący adres e-mail';
        results.push({
          eventGuestId: invitation.eventGuestId,
          status: 'skipped',
          error,
        });
        await logInvitation({
          eventId: data.eventId,
          userId,
          eventGuestId: invitation.eventGuestId,
          guestName,
          recipient: invitation.email || '',
          kind: data.kind ?? 'invitation',
          status: 'skipped',
          errorMessage: error,
        });
        continue;
      }

      const belongs = await verifyGuestBelongsToEvent(
        invitation.eventGuestId,
        data.eventId
      );
      if (!belongs) {
        skipped++;
        const error = 'Gość nie należy do tego wydarzenia';
        results.push({
          eventGuestId: invitation.eventGuestId,
          status: 'skipped',
          error,
        });
        await logInvitation({
          eventId: data.eventId,
          userId,
          eventGuestId: invitation.eventGuestId,
          guestName,
          recipient: invitation.email,
          kind: data.kind ?? 'invitation',
          status: 'skipped',
          errorMessage: error,
        });
        continue;
      }

      try {
        await sendInvitationEmail(
          invitation,
          data.event,
          data.kind ?? 'invitation',
          subject,
          data.message,
          emailjsConfig
        );
        await markGuestInvited(invitation.eventGuestId);
        await logInvitation({
          eventId: data.eventId,
          userId,
          eventGuestId: invitation.eventGuestId,
          guestName,
          recipient: invitation.email,
          kind: data.kind ?? 'invitation',
          status: 'sent',
        });
        sent++;
        results.push({ eventGuestId: invitation.eventGuestId, status: 'sent' });
      } catch (error: unknown) {
        failed++;
        const errorMessage =
          error instanceof Error ? error.message : 'Nieznany błąd wysyłki';
        results.push({
          eventGuestId: invitation.eventGuestId,
          status: 'failed',
          error: errorMessage,
        });
        await logInvitation({
          eventId: data.eventId,
          userId,
          eventGuestId: invitation.eventGuestId,
          guestName,
          recipient: invitation.email,
          kind: data.kind ?? 'invitation',
          status: 'failed',
          errorMessage,
        });
      }

      if (i < data.invitations.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1200));
      }
    }

    return { sent, failed, skipped, results };
  }
);
