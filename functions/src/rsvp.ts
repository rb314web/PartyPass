import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import {
  getAppBaseUrl,
  getEmailJsConfig,
  sendEmailJs,
} from './emailjsClient';

const db = admin.firestore();

type GuestStatus = 'pending' | 'accepted' | 'declined' | 'maybe';

interface RSVPResponsePayload {
  status: GuestStatus;
  dietaryRestrictions?: string;
  notes?: string;
  plusOne?: boolean;
  plusOneType?: 'none' | 'withoutDetails' | 'withDetails';
  plusOneDetails?: {
    firstName?: string;
    lastName?: string;
    dietaryRestrictions?: string;
  };
  attendingMemberIds?: string[];
  memberDietary?: Record<string, string>;
}

interface ProcessRSVPRequest {
  token: string;
  response: RSVPResponsePayload;
}

const VALID_STATUSES: GuestStatus[] = [
  'pending',
  'accepted',
  'declined',
  'maybe',
];

const MAX_TEXT_LENGTH = 2000;

function parseDate(value: unknown): Date | undefined {
  if (value == null) return undefined;
  if (
    typeof value === 'object' &&
    'toDate' in value &&
    typeof (value as { toDate: () => Date }).toDate === 'function'
  ) {
    return (value as admin.firestore.Timestamp).toDate();
  }
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? undefined : value;
  }
  return undefined;
}

function trimText(value: unknown, maxLen: number): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, maxLen);
}

async function getRSVPTokenByString(token: string) {
  const snap = await db
    .collection('rsvpTokens')
    .where('token', '==', token)
    .limit(1)
    .get();

  if (snap.empty) return null;

  const doc = snap.docs[0];
  const data = doc.data();
  return {
    id: doc.id,
    eventGuestId: data.eventGuestId as string,
    eventId: data.eventId as string,
    token: data.token as string,
    expiresAt: parseDate(data.expiresAt),
  };
}

async function getEventDeadline(eventId: string): Promise<Date | null> {
  const eventSnap = await db.collection('events').doc(eventId).get();
  if (!eventSnap.exists) return null;

  const data = eventSnap.data()!;
  const deadline = parseDate(data.rsvpDeadline);
  const eventDate = parseDate(data.date);
  if (!eventDate) return null;

  return deadline ?? eventDate;
}

function isDeadlinePassed(
  deadline: Date | null,
  tokenExpiresAt?: Date
): boolean {
  if (deadline) {
    return deadline.getTime() < Date.now();
  }
  if (tokenExpiresAt) {
    return tokenExpiresAt.getTime() < Date.now();
  }
  return false;
}

interface InvitationCountState {
  status: GuestStatus;
  invitedSeatCount: number;
  attendingCount: number;
}

function getInvitedSeatCountFromData(data: FirebaseFirestore.DocumentData): number {
  if (typeof data.invitedSeatCount === 'number' && data.invitedSeatCount > 0) {
    return data.invitedSeatCount;
  }
  if (Array.isArray(data.partyMembers) && data.partyMembers.length >= 2) {
    return 2;
  }
  if (data.plusOneType === 'withDetails' || data.plusOneType === 'withoutDetails') {
    return 2;
  }
  return 1;
}

function getAttendingCountFromData(data: FirebaseFirestore.DocumentData): number {
  if (typeof data.attendingCount === 'number') return data.attendingCount;
  const status = (data.status as GuestStatus) || 'pending';
  const invited = getInvitedSeatCountFromData(data);
  if (status === 'declined' || status === 'pending') return 0;
  if (Array.isArray(data.attendingMemberIds) && data.attendingMemberIds.length) {
    return data.attendingMemberIds.length;
  }
  if (status === 'accepted' || status === 'maybe') {
    return invited > 1 ? invited : 1;
  }
  return 0;
}

function getStatusSeatContribution(state: InvitationCountState): Record<string, number> {
  const { status, invitedSeatCount, attendingCount } = state;
  switch (status) {
    case 'pending':
      return { pendingCount: invitedSeatCount };
    case 'accepted':
      return {
        acceptedCount: attendingCount,
        declinedCount: Math.max(0, invitedSeatCount - attendingCount),
      };
    case 'declined':
      return { declinedCount: invitedSeatCount };
    case 'maybe':
      return {
        maybeCount: attendingCount > 0 ? attendingCount : invitedSeatCount,
      };
    default:
      return {};
  }
}

async function applyCountDelta(
  eventId: string,
  delta: Record<string, number>
): Promise<void> {
  if (!Object.keys(delta).length) return;
  const eventRef = db.collection('events').doc(eventId);
  const eventDoc = await eventRef.get();
  if (!eventDoc.exists) return;
  const eventData = eventDoc.data()!;
  const updates: Record<string, number> = {};
  Object.entries(delta).forEach(([field, change]) => {
    updates[field] = Math.max(0, (eventData[field] || 0) + change);
  });
  await eventRef.update(updates);
}

async function syncInvitationCounts(
  eventId: string,
  before: InvitationCountState,
  after: InvitationCountState
): Promise<void> {
  const beforeContrib = getStatusSeatContribution(before);
  const afterContrib = getStatusSeatContribution(after);
  const keys = new Set([...Object.keys(beforeContrib), ...Object.keys(afterContrib)]);
  const delta: Record<string, number> = {};
  keys.forEach(key => {
    const diff = (afterContrib[key] || 0) - (beforeContrib[key] || 0);
    if (diff !== 0) delta[key] = diff;
  });
  await applyCountDelta(eventId, delta);
}

async function adjustGuestCountTotal(eventId: string, delta: number): Promise<void> {
  if (!delta) return;
  const eventRef = db.collection('events').doc(eventId);
  const eventDoc = await eventRef.get();
  if (!eventDoc.exists) return;
  const eventData = eventDoc.data()!;
  await eventRef.update({
    guestCount: Math.max(0, (eventData.guestCount || 0) + delta),
  });
}

async function updateEventCounts(
  eventId: string,
  status: string,
  operation: 'add' | 'remove',
  adjustGuestCount = false,
  seats = 1
): Promise<void> {
  const sign = operation === 'add' ? 1 : -1;
  const state: InvitationCountState = {
    status: status as GuestStatus,
    invitedSeatCount: seats,
    attendingCount:
      status === 'accepted' || status === 'maybe'
        ? seats
        : 0,
  };
  const contrib = getStatusSeatContribution(state);
  const delta = Object.fromEntries(
    Object.entries(contrib).map(([key, value]) => [key, value * sign])
  );
  await applyCountDelta(eventId, delta);
  if (adjustGuestCount) {
    await adjustGuestCountTotal(eventId, seats * sign);
  }
}

const STATUS_LABELS: Record<GuestStatus, string> = {
  pending: 'Oczekuje',
  accepted: 'Potwierdził obecność',
  declined: 'Odmówił',
  maybe: 'Odpowiedział „Może”',
};

function formatPlDate(value: unknown): string {
  const date = parseDate(value);
  if (!date) return '';
  return date.toLocaleDateString('pl-PL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

async function getOrganizerEmail(userId: string): Promise<{
  email: string;
  name: string;
} | null> {
  const userSnap = await db.collection('users').doc(userId).get();
  if (!userSnap.exists) return null;

  const data = userSnap.data()!;
  const email = typeof data.email === 'string' ? data.email.trim() : '';
  if (!email) return null;

  const firstName = (data.firstName as string) || '';
  const lastName = (data.lastName as string) || '';
  const name = `${firstName} ${lastName}`.trim() || 'Organizatorze';

  return { email, name };
}

async function shouldNotifyOrganizerByEmail(userId: string): Promise<boolean> {
  const settingsSnap = await db.collection('userSettings').doc(userId).get();
  if (!settingsSnap.exists) return true;

  const notifications = settingsSnap.data()?.notifications as
    | {
        email?: {
          enabled?: boolean;
          rsvpUpdates?: boolean;
          guestResponses?: boolean;
        };
      }
    | undefined;

  const email = notifications?.email;
  if (!email || email.enabled === false) return false;

  if (email.guestResponses === false && email.rsvpUpdates === false) {
    return false;
  }

  return true;
}

async function resolveGuestIdentity(
  eventGuestData: admin.firestore.DocumentData
): Promise<{ name: string; email: string }> {
  if (eventGuestData.contactId) {
    const contactSnap = await db
      .collection('contacts')
      .doc(eventGuestData.contactId as string)
      .get();
    if (contactSnap.exists) {
      const c = contactSnap.data()!;
      return {
        name: `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'Gość',
        email: (c.email as string) || '',
      };
    }
  }

  return {
    name:
      `${eventGuestData.firstName || ''} ${eventGuestData.lastName || ''}`.trim() ||
      'Gość',
    email: (eventGuestData.email as string) || '',
  };
}

function formatPlusOne(
  plusOneType?: string,
  plusOneDetails?: {
    firstName?: string;
    lastName?: string;
    dietaryRestrictions?: string;
  }
): string {
  if (!plusOneType || plusOneType === 'none') return '';
  if (plusOneType === 'withoutDetails') return 'Osoba towarzysząca (bez danych)';
  if (plusOneDetails) {
    const name =
      `${plusOneDetails.firstName || ''} ${plusOneDetails.lastName || ''}`.trim();
    const diet = plusOneDetails.dietaryRestrictions || '';
    return [name || 'Osoba towarzysząca', diet && `Dieta: ${diet}`]
      .filter(Boolean)
      .join(' · ');
  }
  return 'Osoba towarzysząca';
}

async function notifyOrganizerOfRsvp(params: {
  eventId: string;
  eventGuestId: string;
  organizerUserId: string;
  eventData: admin.firestore.DocumentData;
  guest: { name: string; email: string };
  response: RSVPResponsePayload;
  previousStatus: GuestStatus;
}): Promise<void> {
  if (params.response.status === 'pending') return;

  const notify = await shouldNotifyOrganizerByEmail(params.organizerUserId);
  if (!notify) return;

  const organizer = await getOrganizerEmail(params.organizerUserId);
  if (!organizer) {
    console.warn('Brak e-maila organizatora — pomijam powiadomienie RSVP');
    return;
  }

  const emailjs = getEmailJsConfig('rsvp_notification_template_id');
  if (!emailjs) {
    console.warn(
      'EmailJS nie skonfigurowany — powiadomienie RSVP nie zostało wysłane'
    );
    return;
  }

  const eventTitle = (params.eventData.title as string) || 'Wydarzenie';
  const status = params.response.status;
  const statusBadge =
    status === 'accepted'
      ? '✅ Potwierdził'
      : status === 'declined'
        ? '❌ Odmówił'
        : '❓ Może';

  const responseText =
    status === 'accepted'
      ? 'potwierdził obecność na'
      : status === 'declined'
        ? 'odmówił udziału w'
        : 'oznaczył „Może” dla';

  const eventUrl = `${getAppBaseUrl()}/dashboard/events/${params.eventId}`;

  await sendEmailJs(emailjs, {
    to_email: organizer.email,
    to_name: organizer.name,
    organizer_name: organizer.name,
    subject: `RSVP: ${params.guest.name} — ${STATUS_LABELS[status]}`,
    guest_name: params.guest.name,
    guest_email: params.guest.email,
    event_title: eventTitle,
    event_date: formatPlDate(params.eventData.date),
    event_url: eventUrl,
    response_text: responseText,
    status_badge: statusBadge,
    response_status: status,
    previous_status: params.previousStatus,
    plusOne: formatPlusOne(
      params.response.plusOneType,
      params.response.plusOneDetails
    ),
    dietary_restrictions: params.response.dietaryRestrictions || '',
    notes: params.response.notes || '',
    accepted_count: Number(params.eventData.acceptedCount) || 0,
    pending_count: Number(params.eventData.pendingCount) || 0,
    declined_count: Number(params.eventData.declinedCount) || 0,
    total_guests: Number(params.eventData.guestCount) || 0,
    message: `${params.guest.name} ${responseText} „${eventTitle}”.`,
  });

  const activityType =
    status === 'accepted'
      ? 'guest_accepted'
      : status === 'declined'
        ? 'guest_declined'
        : 'guest_maybe';

  await db.collection('activities').add({
    userId: params.organizerUserId,
    type: activityType,
    message: `${params.guest.name}: ${STATUS_LABELS[status]}`,
    eventId: params.eventId,
    eventGuestId: params.eventGuestId,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  });
}

/**
 * Przetwarza odpowiedź RSVP po stronie serwera (Admin SDK).
 * Jedyny dozwolony publiczny zapis RSVP — klient nie może już bezpośrednio
 * aktualizować guests/contacts bez ważnego tokenu.
 */
export const processRSVPResponse = functions.https.onCall(
  async (data: ProcessRSVPRequest) => {
    try {
      return await handleProcessRSVPResponse(data);
    } catch (error) {
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      console.error('processRSVPResponse — nieobsłużony błąd:', error);
      throw new functions.https.HttpsError(
        'internal',
        'Nie udało się zapisać odpowiedzi RSVP'
      );
    }
  }
);

async function handleProcessRSVPResponse(
  data: ProcessRSVPRequest
): Promise<{ success: boolean }> {
    const token = typeof data?.token === 'string' ? data.token.trim() : '';
    const response = data?.response;

    if (!token) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Brak tokenu RSVP'
      );
    }

    if (!response || !VALID_STATUSES.includes(response.status)) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Nieprawidłowy status odpowiedzi'
      );
    }

    const rsvpToken = await getRSVPTokenByString(token);
    if (!rsvpToken) {
      throw new functions.https.HttpsError(
        'not-found',
        'Token nie istnieje'
      );
    }

    const deadline = await getEventDeadline(rsvpToken.eventId);
    if (isDeadlinePassed(deadline, rsvpToken.expiresAt)) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Termin na przesłanie odpowiedzi minął'
      );
    }

    const eventGuestRef = db.collection('guests').doc(rsvpToken.eventGuestId);
    const eventGuestSnap = await eventGuestRef.get();

    if (!eventGuestSnap.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'Gość wydarzenia nie istnieje'
      );
    }

    const eventGuestData = eventGuestSnap.data()!;
    if (eventGuestData.eventId !== rsvpToken.eventId) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Token nie pasuje do gościa wydarzenia'
      );
    }

    const previousStatus =
      (eventGuestData.status as GuestStatus | undefined) || 'pending';
    const invitedSeatCount = getInvitedSeatCountFromData(eventGuestData);
    const beforeState: InvitationCountState = {
      status: previousStatus,
      invitedSeatCount,
      attendingCount: getAttendingCountFromData(eventGuestData),
    };

    const now = admin.firestore.FieldValue.serverTimestamp();

    let attendingMemberIds: string[] = [];
    let attendingCount = 0;

    if (response.status === 'accepted' || response.status === 'maybe') {
      if (
        Array.isArray(response.attendingMemberIds) &&
        response.attendingMemberIds.length &&
        invitedSeatCount > 1
      ) {
        attendingMemberIds = response.attendingMemberIds;
        attendingCount = attendingMemberIds.length;
      } else if (response.status === 'accepted' && response.plusOne) {
        attendingCount = 2;
      } else {
        attendingCount = invitedSeatCount > 1 ? invitedSeatCount : 1;
      }
    }

    const guestUpdate: admin.firestore.UpdateData<admin.firestore.DocumentData> = {
      status: response.status,
      respondedAt: now,
      updatedAt: now,
      attendingMemberIds,
      attendingCount,
    };

    if (response.plusOneType) {
      guestUpdate.plusOneType = response.plusOneType;
    }
    if (response.plusOneDetails) {
      guestUpdate.plusOneDetails = {
        firstName: trimText(response.plusOneDetails.firstName, 100) || '',
        lastName: trimText(response.plusOneDetails.lastName, 100) || '',
        dietaryRestrictions:
          trimText(response.plusOneDetails.dietaryRestrictions, 500) || '',
      };
    }

    if (Array.isArray(eventGuestData.partyMembers) && response.memberDietary) {
      guestUpdate.partyMembers = (eventGuestData.partyMembers as Array<Record<string, unknown>>).map(
        member => {
          const id = member.id as string;
          const dietary = response.memberDietary?.[id];
          if (!dietary?.trim()) return member;
          return { ...member, dietaryRestrictions: dietary.trim().slice(0, 500) };
        }
      );
    }

    const afterState: InvitationCountState = {
      status: response.status,
      invitedSeatCount:
        attendingCount === 2 && invitedSeatCount === 1 ? 2 : invitedSeatCount,
      attendingCount,
    };

    const batch = db.batch();
    batch.update(eventGuestRef, guestUpdate);

    const dietaryRestrictions = trimText(
      response.dietaryRestrictions,
      MAX_TEXT_LENGTH
    );
    const notes = trimText(response.notes, MAX_TEXT_LENGTH);

    if ((dietaryRestrictions || notes) && eventGuestData.contactId) {
      const contactRef = db
        .collection('contacts')
        .doc(eventGuestData.contactId as string);
      const contactSnap = await contactRef.get();
      if (contactSnap.exists) {
        const contactUpdate: admin.firestore.UpdateData<admin.firestore.DocumentData> = {
          updatedAt: now,
        };
        if (dietaryRestrictions) {
          contactUpdate.dietaryRestrictions = dietaryRestrictions;
        }
        if (notes) {
          contactUpdate.notes = notes;
        }
        batch.update(contactRef, contactUpdate);
      }
    }

    await batch.commit();

    await syncInvitationCounts(rsvpToken.eventId, beforeState, afterState);

    if (afterState.invitedSeatCount > invitedSeatCount) {
      await adjustGuestCountTotal(
        rsvpToken.eventId,
        afterState.invitedSeatCount - invitedSeatCount
      );
    }

    const eventSnap = await db.collection('events').doc(rsvpToken.eventId).get();
    const eventData = eventSnap.exists ? eventSnap.data()! : null;

    if (eventData?.userId) {
      const guest = await resolveGuestIdentity(eventGuestData);
      try {
        const refreshedEvent = await db
          .collection('events')
          .doc(rsvpToken.eventId)
          .get();
        await notifyOrganizerOfRsvp({
          eventId: rsvpToken.eventId,
          eventGuestId: rsvpToken.eventGuestId,
          organizerUserId: eventData.userId as string,
          eventData: refreshedEvent.data() || eventData,
          guest,
          response,
          previousStatus,
        });
      } catch (notifyError) {
        console.error('Nie udało się wysłać powiadomienia RSVP:', notifyError);
      }
    }

    return { success: true };
}
