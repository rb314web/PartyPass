// types/index.ts
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  planType: 'starter' | 'pro' | 'enterprise';
  createdAt: Date;
  avatar?: string;
  phoneNumber?: string;
  company?: string;
  website?: string;
  bio?: string;
  timezone?: string;
  language?: string;
}

export interface Event {
  id: string;
  userId: string;
  title: string;
  description: string;
  date: Date;
  /** Termin, do którego goście mogą przesyłać/zmieniać RSVP. Brak = do dnia wydarzenia. */
  rsvpDeadline?: Date;
  location: string;
  latitude?: number;
  longitude?: number;
  maxGuests: number;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt?: Date;
  tags?: string[];
  isPrivate?: boolean;
  requireRSVP?: boolean;
  allowPlusOne?: boolean;
  sendReminders?: boolean;
  imageUrl?: string;
  guestCount: number;
  acceptedCount: number;
  pendingCount: number;
  declinedCount: number;
  maybeCount: number;
  dresscode?: string;
  additionalInfo?: string;
  /** E-mail organizatora (denormalizacja do powiadomień RSVP) */
  organizerEmail?: string;
  /** Telefon organizatora (denormalizacja dla gości na RSVP) */
  organizerPhone?: string;

  // Legacy field for backward compatibility
  guests?: EventGuest[];
}

export interface Contact {
  id: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  dietaryRestrictions?: string;
  notes?: string;
  createdAt: Date;
  updatedAt?: Date;
  tags?: string[];
}

// RSVP System types
export type GuestStatus = 'pending' | 'accepted' | 'declined' | 'maybe';

export type GuestInvitationKind = 'individual' | 'couple' | 'individual_with_companion';
export type PartyMemberRole = 'primary' | 'partner' | 'companion';

export interface PartyMember {
  id: string;
  role: PartyMemberRole;
  contactId?: string;
  firstName: string;
  lastName: string;
  dietaryRestrictions?: string;
}

export interface EventGuest {
  id: string;
  eventId: string;
  contactId?: string; // Made optional for backward compatibility
  status: GuestStatus;
  invitedAt: Date;
  respondedAt?: Date;
  /** Typ zaproszenia: pojedyncze, para lub singiel z towarzyszem */
  invitationKind?: GuestInvitationKind;
  /** Ile miejsc obejmuje to zaproszenie (1 lub 2) */
  invitedSeatCount?: number;
  /** Osoby objęte zaproszeniem */
  partyMembers?: PartyMember[];
  /** ID osób potwierdzonych przy RSVP */
  attendingMemberIds?: string[];
  /** Ile osób faktycznie przychodzi (0–2) */
  attendingCount?: number;
  plusOneType?: 'none' | 'withoutDetails' | 'withDetails';
  plusOneDetails?: {
    firstName?: string;
    lastName?: string;
    dietaryRestrictions?: string;
  };
  rsvpToken?: string;
  eventSpecificNotes?: string;
  createdAt: Date;
  updatedAt?: Date;

  // Legacy fields for backward compatibility
  userId?: string;
  firstName: string; // Required for display
  lastName: string; // Required for display
  email: string; // Required for invitations
  phone?: string;
  dietaryRestrictions?: string;
  notes?: string;
  plusOne?: boolean;
  eventName?: string;
  eventDate?: Date;
}

// Extended EventGuest with Contact data for display purposes
export interface EventGuestWithContact extends EventGuest {
  contact: Contact;
  eventName: string;
  eventDate: Date;
}

// Legacy Guest alias for backward compatibility
export type Guest = EventGuest;

export interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  maxEvents: number;
  maxGuestsPerEvent: number;
  popular?: boolean;
}

export interface Activity {
  id: string;
  type:
    | 'guest_response'
    | 'event_created'
    | 'guest_declined'
    | 'event_updated'
    | 'guest_accepted'
    | 'event_deleted'
    | 'guest_maybe'
    | 'event_cancelled'
    | 'contact_added'
    | 'contact_updated';
  message: string;
  timestamp: Date;
  eventId?: string;
  contactId?: string;
  eventGuestId?: string;
}

export interface StatsCardProps {
  title: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ComponentType;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

export interface CreateContactData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dietaryRestrictions?: string;
  notes?: string;
  tags?: string[];
}

export interface UpdateContactData extends Partial<CreateContactData> {}

export interface CreateEventGuestData {
  contactId?: string; // Made optional for backward compatibility
  eventSpecificNotes?: string;
  invitationKind?: GuestInvitationKind;
  plusOneType?: 'none' | 'withoutDetails' | 'withDetails';
  plusOneDetails?: {
    firstName?: string;
    lastName?: string;
    dietaryRestrictions?: string;
  };

  // Legacy fields for backward compatibility
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dietaryRestrictions?: string;
  notes?: string;
  plusOne?: boolean;
}

export interface UpdateEventGuestData extends Partial<CreateEventGuestData> {
  status?: GuestStatus;

  // Legacy fields for backward compatibility
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dietaryRestrictions?: string;
  notes?: string;
  plusOne?: boolean;
}

// Legacy aliases for backward compatibility
export type CreateGuestData = CreateEventGuestData;
export type UpdateGuestData = UpdateEventGuestData;

export interface RSVPToken {
  id: string;
  eventGuestId: string;
  eventId: string;
  guestId?: string; // Legacy field for backward compatibility
  token: string;
  isUsed: boolean;
  createdAt: Date;
  expiresAt?: Date;
  usedAt?: Date;
}

export interface RSVPResponse {
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
  /** Przy zaproszeniu wieloosobowym — kto przychodzi */
  attendingMemberIds?: string[];
  /** Dieta per osoba (klucz = PartyMember.id) */
  memberDietary?: Record<string, string>;
}

export interface GuestInvitation {
  eventGuestId: string;
  contactId?: string;
  guestId?: string; // Legacy field for backward compatibility
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  status: GuestStatus;
  rsvpToken: string;
  rsvpUrl: string;
  qrCode?: string;
  lastInvitationSentAt?: Date;
}

export type InvitationKind = 'invitation' | 'reminder';
export type InvitationChannel = 'email' | 'sms' | 'print';

export interface InvitationDelivery {
  method: InvitationChannel;
  recipients: string[];
  subject?: string;
  message?: string;
  includeQR?: boolean;
  kind?: InvitationKind;
}

export interface InvitationSendResultItem {
  eventGuestId: string;
  status: 'sent' | 'failed' | 'skipped';
  error?: string;
}

export interface InvitationSendResult {
  sent: number;
  failed: number;
  skipped: number;
  results: InvitationSendResultItem[];
}

export interface InvitationLogEntry {
  id: string;
  eventId: string;
  userId: string;
  eventGuestId: string;
  guestName: string;
  recipient: string;
  channel: InvitationChannel;
  kind: InvitationKind;
  status: 'sent' | 'failed' | 'skipped';
  errorMessage?: string;
  sentAt: Date;
}
