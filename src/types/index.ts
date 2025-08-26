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
  guests: Guest[];
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
  dresscode?: string;
  additionalInfo?: string;
}

export interface Guest {
  id: string;
  userId: string;
  eventId: string;
  email: string;
  firstName: string;
  lastName: string;
  status: GuestStatus;
  invitedAt: Date;
  respondedAt?: Date;
  createdAt: Date;
  updatedAt?: Date;
  phone?: string;
  dietaryRestrictions?: string;
  plusOne?: boolean;
  notes?: string;
  eventName: string;
  eventDate: Date;
  rsvpToken?: string;
}

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
    | 'event_cancelled';
  message: string;
  timestamp: Date;
  eventId: string;
  guestId?: string;
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

export interface CreateGuestData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dietaryRestrictions?: string;
  notes?: string;
  plusOne?: boolean;
}

export interface UpdateGuestData extends Partial<CreateGuestData> {
  status?: GuestStatus;
}

export interface RSVPToken {
  id: string;
  guestId: string;
  eventId: string;
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
  plusOneDetails?: {
    firstName?: string;
    lastName?: string;
    dietaryRestrictions?: string;
  };
}

export interface GuestInvitation {
  guestId: string;
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