// types/index.ts
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  planType: 'starter' | 'pro' | 'enterprise';
  createdAt: Date;
  avatar?: string;
}

export interface Event {
  id: string;
  userId: string;
  title: string;
  description: string;
  date: Date;
  location: string;
  maxGuests: number;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
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

export interface EventGuest {
  id: string;
  eventId: string;
  contactId?: string; // Made optional for backward compatibility
  status: GuestStatus;
  invitedAt: Date;
  respondedAt?: Date;
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

// RSVP System types
export type GuestStatus = 'pending' | 'accepted' | 'declined' | 'maybe';

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
}

export interface GuestInvitation {
  eventGuestId: string;
  contactId: string;
  guestId?: string; // Legacy field for backward compatibility
  email: string;
  firstName: string;
  lastName: string;
  rsvpToken: string;
  rsvpUrl: string;
  qrCode?: string;
}

export interface InvitationDelivery {
  method: 'email' | 'sms' | 'print';
  recipients: string[];
  subject?: string;
  message?: string;
  includeQR?: boolean;
}
