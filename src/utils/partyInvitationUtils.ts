import type {
  CreateEventGuestData,
  EventGuest,
  GuestStatus,
  GuestInvitationKind,
  PartyMember,
  PartyMemberRole,
  RSVPResponse,
} from '../types';

export function createPartyMemberId(): string {
  return `m_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function memberDisplayName(member: PartyMember): string {
  return `${member.firstName} ${member.lastName}`.trim();
}

function buildSecondMemberFromDetails(
  guest: Partial<EventGuest>,
  details: NonNullable<EventGuest['plusOneDetails']>,
  id = 'companion'
): PartyMember {
  return {
    id,
    role: guest.invitationKind === 'couple' ? 'partner' : 'companion',
    firstName: details.firstName || '',
    lastName: details.lastName || '',
    dietaryRestrictions: details.dietaryRestrictions,
  };
}

export function resolvePartyMembers(guest: Partial<EventGuest>): PartyMember[] {
  const details = guest.plusOneDetails;
  const invited =
    typeof guest.invitedSeatCount === 'number' && guest.invitedSeatCount > 0
      ? guest.invitedSeatCount
      : 0;

  const primaryFromGuest: PartyMember = {
    id: guest.contactId ? `primary-${guest.contactId}` : 'primary',
    role: 'primary',
    contactId: guest.contactId,
    firstName: guest.firstName || '',
    lastName: guest.lastName || '',
    dietaryRestrictions: guest.dietaryRestrictions,
  };

  if (guest.partyMembers && guest.partyMembers.length > 0) {
    const members = guest.partyMembers.map(member => ({ ...member }));

    if (!memberDisplayName(members[0]) && memberDisplayName(primaryFromGuest)) {
      members[0] = { ...members[0], ...primaryFromGuest, id: members[0].id, role: 'primary' };
    }

    if (members.length >= 2) {
      if (!memberDisplayName(members[1]) && details && (details.firstName || details.lastName)) {
        members[1] = {
          ...members[1],
          ...buildSecondMemberFromDetails(guest, details, members[1].id),
        };
      }
      return members;
    }

    if (invited > 1 && details && (details.firstName || details.lastName)) {
      return [members[0], buildSecondMemberFromDetails(guest, details)];
    }

    return members;
  }

  if (details && (details.firstName || details.lastName)) {
    return [primaryFromGuest, buildSecondMemberFromDetails(guest, details)];
  }

  return [primaryFromGuest];
}

export function getInvitationKind(guest: Partial<EventGuest>): GuestInvitationKind {
  if (guest.invitationKind) return guest.invitationKind;
  const members = resolvePartyMembers(guest);
  if (members.length >= 2) {
    return members[1]?.role === 'partner' ? 'couple' : 'individual_with_companion';
  }
  if (guest.plusOneType === 'withDetails' || guest.plusOneType === 'withoutDetails') {
    return 'individual_with_companion';
  }
  return 'individual';
}

export function getInvitedSeatCount(guest: Partial<EventGuest>): number {
  if (typeof guest.invitedSeatCount === 'number' && guest.invitedSeatCount > 0) {
    return guest.invitedSeatCount;
  }
  const members = resolvePartyMembers(guest);
  return members.length >= 2 ? 2 : 1;
}

export function isMultiSeatInvitation(guest: Partial<EventGuest>): boolean {
  return getInvitedSeatCount(guest) > 1;
}

export function getPartyDisplayLabel(guest: Partial<EventGuest>): string {
  const members = resolvePartyMembers(guest);
  if (members.length >= 2) {
    const first = formatMemberName(members[0]);
    const second = formatMemberName(members[1]);
    if (first && second) return `${first} i ${second}`;
    return first || second || '';
  }
  return formatMemberName(members[0]) || '';
}

export function formatMemberName(member: PartyMember): string {
  return `${member.firstName} ${member.lastName}`.trim();
}

export interface InvitationCountState {
  status: GuestStatus;
  invitedSeatCount: number;
  attendingCount: number;
}

export function getAttendingCountFromGuest(guest: Partial<EventGuest>): number {
  if (typeof guest.attendingCount === 'number') {
    return guest.attendingCount;
  }
  const status = guest.status || 'pending';
  const invited = getInvitedSeatCount(guest);
  if (status === 'declined' || status === 'pending') return 0;
  if (guest.attendingMemberIds?.length) {
    return guest.attendingMemberIds.length;
  }
  if (status === 'accepted' || status === 'maybe') {
    return invited > 1 ? invited : 1;
  }
  return 0;
}

export function getStatusSeatContribution(
  state: InvitationCountState
): Record<string, number> {
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

export interface EventRsvpCounts {
  guestCount: number;
  acceptedCount: number;
  pendingCount: number;
  declinedCount: number;
  maybeCount: number;
}

export function aggregateRsvpCountsFromGuests(
  guests: Partial<EventGuest>[]
): EventRsvpCounts {
  const totals: EventRsvpCounts = {
    guestCount: 0,
    acceptedCount: 0,
    pendingCount: 0,
    declinedCount: 0,
    maybeCount: 0,
  };

  for (const guest of guests) {
    const invitedSeatCount = getInvitedSeatCount(guest);
    totals.guestCount += invitedSeatCount;

    const contrib = getStatusSeatContribution({
      status: (guest.status as GuestStatus) || 'pending',
      invitedSeatCount,
      attendingCount: getAttendingCountFromGuest(guest),
    });

    totals.acceptedCount += contrib.acceptedCount || 0;
    totals.pendingCount += contrib.pendingCount || 0;
    totals.declinedCount += contrib.declinedCount || 0;
    totals.maybeCount += contrib.maybeCount || 0;
  }

  return totals;
}

/** Oczekiwana frekwencja: osoby, które potwierdziły lub zaznaczyły „może”. */
export function getExpectedAttendanceFromGuests(
  guests: Partial<EventGuest>[]
): number {
  return guests.reduce((sum, guest) => {
    const status = guest.status || 'pending';
    if (status === 'accepted' || status === 'maybe') {
      return sum + getAttendingCountFromGuest(guest);
    }
    return sum;
  }, 0);
}

export function diffCountContributions(
  before: Record<string, number>,
  after: Record<string, number>
): Record<string, number> {
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  const delta: Record<string, number> = {};
  keys.forEach(key => {
    const diff = (after[key] || 0) - (before[key] || 0);
    if (diff !== 0) delta[key] = diff;
  });
  return delta;
}

export function buildPartyMembersForCreate(
  contact: { id: string; firstName: string; lastName: string; dietaryRestrictions?: string },
  data: CreateEventGuestData
): { invitationKind: GuestInvitationKind; partyMembers: PartyMember[]; invitedSeatCount: number } {
  const kind: GuestInvitationKind =
    data.invitationKind ||
    (data.plusOneType === 'withDetails' || data.plusOneType === 'withoutDetails'
      ? 'individual_with_companion'
      : 'individual');

  const primary: PartyMember = {
    id: createPartyMemberId(),
    role: 'primary',
    contactId: contact.id,
    firstName: contact.firstName,
    lastName: contact.lastName,
    dietaryRestrictions: contact.dietaryRestrictions,
  };

  if (kind === 'individual' || data.plusOneType === 'none') {
    return {
      invitationKind: 'individual',
      partyMembers: [primary],
      invitedSeatCount: 1,
    };
  }

  const secondRole: PartyMemberRole =
    kind === 'couple' ? 'partner' : 'companion';
  const details = data.plusOneDetails || {};

  const second: PartyMember = {
    id: createPartyMemberId(),
    role: secondRole,
    firstName: details.firstName || '',
    lastName: details.lastName || '',
    dietaryRestrictions: details.dietaryRestrictions,
  };

  return {
    invitationKind: kind === 'couple' ? 'couple' : 'individual_with_companion',
    partyMembers: [primary, second],
    invitedSeatCount: 2,
  };
}

export function resolveRsvpAttendance(
  guest: Partial<EventGuest>,
  response: RSVPResponse,
  allowPlusOne = false
): {
  attendingMemberIds: string[];
  attendingCount: number;
  memberDietaryUpdates: Record<string, string>;
  plusOneType: 'none' | 'withoutDetails' | 'withDetails';
  plusOneDetails?: PartyMember;
} {
  const members = resolvePartyMembers(guest);
  const invitedSeatCount = getInvitedSeatCount(guest);
  const memberDietaryUpdates: Record<string, string> = {};

  if (response.memberDietary) {
    Object.assign(memberDietaryUpdates, response.memberDietary);
  }

  if (response.status === 'declined') {
    return {
      attendingMemberIds: [],
      attendingCount: 0,
      memberDietaryUpdates,
      plusOneType: 'none',
    };
  }

  if (invitedSeatCount > 1) {
    let attendingMemberIds = (response.attendingMemberIds || []).filter(id =>
      members.some(m => m.id === id)
    );

    if (
      (response.status === 'accepted' || response.status === 'maybe') &&
      attendingMemberIds.length === 0
    ) {
      attendingMemberIds = members.map(m => m.id);
    }

    if (response.status === 'accepted' && attendingMemberIds.length === 0) {
      attendingMemberIds = [members[0].id];
    }

    return {
      attendingMemberIds,
      attendingCount: attendingMemberIds.length,
      memberDietaryUpdates,
      plusOneType: attendingMemberIds.length > 1 ? 'withDetails' : 'none',
      plusOneDetails:
        attendingMemberIds.length > 1
          ? members.find(m => attendingMemberIds.includes(m.id) && m.role !== 'primary')
          : undefined,
    };
  }

  // Pojedyncze zaproszenie z opcjonalnym +1 przy RSVP
  if (
    response.status === 'accepted' &&
    allowPlusOne &&
    (response.plusOne || response.plusOneType === 'withDetails' || response.plusOneType === 'withoutDetails')
  ) {
    const details = response.plusOneDetails;
    const hasDetails =
      Boolean(details?.firstName?.trim()) ||
      Boolean(details?.lastName?.trim()) ||
      Boolean(details?.dietaryRestrictions?.trim());

    return {
      attendingMemberIds: [members[0].id],
      attendingCount: 2,
      memberDietaryUpdates,
      plusOneType: hasDetails ? 'withDetails' : 'withoutDetails',
      plusOneDetails: hasDetails
        ? {
            id: 'rsvp-companion',
            role: 'companion',
            firstName: details?.firstName || '',
            lastName: details?.lastName || '',
            dietaryRestrictions: details?.dietaryRestrictions,
          }
        : undefined,
    };
  }

  const count =
    response.status === 'accepted' || response.status === 'maybe' ? 1 : 0;

  return {
    attendingMemberIds: count > 0 ? [members[0].id] : [],
    attendingCount: count,
    memberDietaryUpdates,
    plusOneType: 'none',
  };
}

export function applyMemberDietaryUpdates(
  members: PartyMember[],
  updates: Record<string, string>
): PartyMember[] {
  if (!Object.keys(updates).length) return members;
  return members.map(member => {
    const dietary = updates[member.id];
    if (!dietary?.trim()) return member;
    return { ...member, dietaryRestrictions: dietary.trim() };
  });
}

/** Ukryj legacy dokumenty towarzyszy (osobny wpis bez contactId). */
export function isLegacyCompanionDocument(
  guest: Partial<EventGuest>,
  allGuests: Partial<EventGuest>[]
): boolean {
  if (guest.contactId) return false;
  if (guest.partyMembers && guest.partyMembers.length > 0) return false;

  return allGuests.some(
    other =>
      other.id !== guest.id &&
      other.contactId &&
      other.invitedAt &&
      guest.invitedAt &&
      Math.abs(other.invitedAt.getTime() - guest.invitedAt.getTime()) < 5000
  );
}

export function formatAttendanceSummary(guest: Partial<EventGuest>): string | null {
  if (!isMultiSeatInvitation(guest)) return null;
  const invited = getInvitedSeatCount(guest);
  const attending = getAttendingCountFromGuest(guest);
  const status = guest.status || 'pending';

  if (status === 'pending') {
    return `${invited} zaproszone`;
  }
  if (status === 'declined') {
    return '0/2';
  }
  return `${attending}/${invited}`;
}

export function buildRsvpUpdatePayload(
  guestData: Partial<EventGuest>,
  response: RSVPResponse,
  allowPlusOne = false
): {
  guestUpdate: Record<string, unknown>;
  beforeState: InvitationCountState;
  afterState: InvitationCountState;
} {
  const invitedSeatCount = getInvitedSeatCount(guestData);
  const beforeState: InvitationCountState = {
    status: (guestData.status as GuestStatus) || 'pending',
    invitedSeatCount,
    attendingCount: getAttendingCountFromGuest(guestData),
  };

  const attendance = resolveRsvpAttendance(guestData, response, allowPlusOne);
  let partyMembers = applyMemberDietaryUpdates(
    resolvePartyMembers(guestData),
    attendance.memberDietaryUpdates
  );

  let nextInvitedSeatCount = invitedSeatCount;
  if (
    invitedSeatCount === 1 &&
    attendance.attendingCount === 2 &&
    attendance.plusOneDetails
  ) {
    partyMembers = [
      ...partyMembers,
      {
        id: attendance.plusOneDetails.id || createPartyMemberId(),
        role: 'companion' as const,
        firstName: attendance.plusOneDetails.firstName,
        lastName: attendance.plusOneDetails.lastName,
        dietaryRestrictions: attendance.plusOneDetails.dietaryRestrictions,
      },
    ];
    nextInvitedSeatCount = 2;
  }

  const afterState: InvitationCountState = {
    status: response.status,
    invitedSeatCount: nextInvitedSeatCount,
    attendingCount: attendance.attendingCount,
  };

  const guestUpdate: Record<string, unknown> = {
    status: response.status,
    attendingMemberIds: attendance.attendingMemberIds,
    attendingCount: attendance.attendingCount,
    partyMembers,
    plusOneType: attendance.plusOneType,
    updatedAt: new Date(),
    respondedAt: new Date(),
  };

  if (attendance.plusOneType === 'withDetails' && attendance.plusOneDetails) {
    guestUpdate.plusOneDetails = {
      firstName: attendance.plusOneDetails.firstName,
      lastName: attendance.plusOneDetails.lastName,
      dietaryRestrictions: attendance.plusOneDetails.dietaryRestrictions || '',
    };
  } else if (response.status === 'declined') {
    guestUpdate.plusOneType = 'none';
    guestUpdate.attendingMemberIds = [];
    guestUpdate.attendingCount = 0;
  }

  if (nextInvitedSeatCount > invitedSeatCount) {
    guestUpdate.invitedSeatCount = nextInvitedSeatCount;
    guestUpdate.invitationKind = 'individual_with_companion';
  }

  const dietary = (response.dietaryRestrictions || '').trim().slice(0, 2000);
  const notes = (response.notes || '').trim().slice(0, 2000);
  if (dietary) guestUpdate.dietaryRestrictions = dietary;
  if (notes) guestUpdate.eventSpecificNotes = notes;

  return { guestUpdate, beforeState, afterState };
}
