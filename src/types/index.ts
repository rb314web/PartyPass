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
  guests?: Guest[];
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  createdAt: Date;
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
  status: 'pending' | 'accepted' | 'declined' | 'maybe';
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