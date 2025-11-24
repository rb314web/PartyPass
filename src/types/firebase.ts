// types/firebase.ts
import { Timestamp } from 'firebase/firestore';

// Firebase User type extending the base User
export interface FirebaseUser {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  planType: 'starter' | 'pro' | 'enterprise';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  avatar?: string;
  phoneNumber?: string;
  isEmailVerified: boolean;
  lastLoginAt: Timestamp;
  preferences: {
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
    theme: 'light' | 'dark' | 'auto';
    language: 'pl' | 'en';
  };
  subscription?: {
    planId: string;
    status: 'active' | 'cancelled' | 'past_due';
    currentPeriodStart: Timestamp;
    currentPeriodEnd: Timestamp;
    cancelAtPeriodEnd: boolean;
  };
}

// Firebase Event type
export interface FirebaseEvent {
  id: string;
  userId: string;
  title: string;
  description: string;
  date: Timestamp;
  location: string;
  maxGuests: number;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  imageUrl?: string;
  category: string;
  tags: string[];
  isPublic: boolean;
  settings: {
    allowGuestInvites: boolean;
    requireApproval: boolean;
    sendReminders: boolean;
    reminderDays: number[];
  };
  guestCount: number;
  acceptedCount: number;
  declinedCount: number;
  pendingCount: number;
  maybeCount: number;
  dresscode?: string;
  additionalInfo?: string;
}

export interface CreateEventData {
  title: string;
  description: string;
  date: Date;
  location: string;
  maxGuests: number;
  guestCount: number;
  acceptedCount: number;
  declinedCount: number;
  pendingCount: number;
  dresscode?: string;
  additionalInfo?: string;
  category?: string;
  tags?: string[];
  isPublic?: boolean;
  settings?: {
    allowGuestInvites: boolean;
    requireApproval: boolean;
    sendReminders: boolean;
    reminderDays: number[];
  };
  image?: File;
}

// Firebase Guest type
export interface FirebaseGuest {
  id: string;
  userId: string;
  eventId: string;
  email: string;
  firstName: string;
  lastName: string;
  status: 'pending' | 'accepted' | 'declined' | 'maybe';
  invitedAt: Timestamp;
  respondedAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  phoneNumber?: string;
  dietaryRestrictions?: string;
  plusOne?: boolean;
  plusOneDetails?: {
    firstName?: string;
    lastName?: string;
    dietaryRestrictions?: string;
  };
  notes?: string;
  rsvpToken?: string; // For secure RSVP links
}

export interface FirebaseGuestData extends Omit<FirebaseGuest, 'id'> {}

// Firebase Activity type
export interface FirebaseActivity {
  id: string;
  userId: string;
  type:
    | 'event_created'
    | 'event_updated'
    | 'event_cancelled'
    | 'guest_response'
    | 'guest_declined'
    | 'guest_maybe';
  message: string;
  timestamp: Timestamp;
  eventId?: string;
  guestId?: string;
  metadata?: Record<string, any>;
  isRead: boolean;
}

// Firebase Notification type
export interface FirebaseNotification {
  id: string;
  userId: string;
  type: 'event_reminder' | 'guest_response' | 'event_update' | 'system';
  title: string;
  message: string;
  timestamp: Timestamp;
  isRead: boolean;
  eventId?: string;
  guestId?: string;
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high';
}

// Firebase Analytics Event
export interface FirebaseAnalyticsEvent {
  eventName: string;
  parameters?: Record<string, any>;
  timestamp: Timestamp;
  userId?: string;
  sessionId: string;
}

// Firebase Error Log
export interface FirebaseErrorLog {
  id: string;
  userId?: string;
  error: string;
  stack?: string;
  timestamp: Timestamp;
  userAgent: string;
  url: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
}

// Firebase Contact type
export interface FirebaseContact {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  notes?: string;
  tags?: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isActive: boolean;
  source: 'manual' | 'import' | 'guest_conversion';
  lastContactedAt?: Timestamp;
  dietaryRestrictions?: string;
}

// Collection names
export const COLLECTIONS = {
  USERS: 'users',
  EVENTS: 'events',
  GUESTS: 'guests',
  ACTIVITIES: 'activities',
  NOTIFICATIONS: 'notifications',
  ANALYTICS: 'analytics',
  ERROR_LOGS: 'error_logs',
  SUBSCRIPTIONS: 'subscriptions',
  TEMPLATES: 'templates',
  CONTACTS: 'contacts',
} as const;

// Firestore query types
export interface FirestoreQuery {
  field: string;
  operator:
    | '=='
    | '!='
    | '<'
    | '<='
    | '>'
    | '>='
    | 'array-contains'
    | 'array-contains-any'
    | 'in'
    | 'not-in';
  value: any;
}

export interface FirestoreOrderBy {
  field: string;
  direction: 'asc' | 'desc';
}

// Batch operation types
export interface BatchOperation {
  type: 'set' | 'update' | 'delete';
  ref: string;
  data?: any;
}

// Real-time listener options
export interface ListenerOptions {
  includeMetadataChanges?: boolean;
  onNext?: (snapshot: any) => void;
  onError?: (error: Error) => void;
}
