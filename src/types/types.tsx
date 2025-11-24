// types/index.ts

// User related types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  planType: 'starter' | 'pro' | 'enterprise';
  avatar?: string;
  createdAt: Date;
}

// Guest related types
export type GuestStatus = 'pending' | 'accepted' | 'declined' | 'maybe';

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

export interface GuestFilters {
  eventId?: string;
  status?: GuestStatus;
  search?: string;
  userId?: string;
}

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

// RSVP System types
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

// Event related types
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
  guests: Guest[];
  tags?: string[];
  isPrivate?: boolean;
  requireRSVP?: boolean;
  allowPlusOne?: boolean;
  sendReminders?: boolean;
  imageUrl?: string;
  dresscode?: string;
  additionalInfo?: string;
  guestCount: number;
  acceptedCount: number;
  pendingCount: number;
  declinedCount: number;
}

// Activity/Notification types
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

// Stats types
export interface Stats {
  totalEvents: number;
  activeEvents: number;
  completedEvents: number;
  draftEvents: number;
  cancelledEvents: number;
  totalGuests: number;
  acceptedGuests: number;
  pendingGuests: number;
  declinedGuests: number;
  responseRate: number;
  eventsThisMonth: number;
  guestsThisMonth: number;
  upcomingEvents: number;
}

// Chart data types
export interface ChartDataPoint {
  month: string;
  events: number;
  guests: number;
}

export interface ResponseRateData {
  event: string;
  accepted: number;
  declined: number;
  maybe: number;
}

export interface GuestStatusDistribution {
  status: string;
  count: number;
  percentage: number;
}

export interface ChartData {
  eventsOverTime: ChartDataPoint[];
  responseRates: ResponseRateData[];
  guestStatusDistribution: GuestStatusDistribution[];
}

// Form types
export interface EventFormData {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  maxGuests: number | string;
  tags: string[];
  isPrivate: boolean;
  requireRSVP: boolean;
  allowPlusOne: boolean;
  sendReminders: boolean;
}

export interface GuestFormData {
  email: string;
  firstName: string;
  lastName: string;
  dietaryRestrictions?: string;
  notes?: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Plan types
export interface PlanFeatures {
  maxGuests: number;
  maxEvents?: number;
  customBranding?: boolean;
  advancedAnalytics?: boolean;
  prioritySupport?: boolean;
  apiAccess?: boolean;
}

export interface Plan {
  id: string;
  name: string;
  type: 'starter' | 'pro' | 'enterprise';
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: PlanFeatures;
  popular?: boolean;
}

// Filter and sorting types
export type EventStatus = Event['status'];
export type SortDirection = 'asc' | 'desc';

export interface EventFilters {
  status?: EventStatus[];
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
}

export interface GuestFilters {
  eventId?: string;
  status?: GuestStatus;
  search?: string;
  userId?: string;
}

export interface SortConfig {
  field: string;
  direction: SortDirection;
}

// Navigation types
export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon?: React.ComponentType;
  badge?: number;
  children?: NavItem[];
  exact?: boolean;
  shortcut?: string;
  color?: string;
}

export interface NavigationHistoryItem {
  path: string;
  title: string;
  timestamp: number;
}

export interface BreadcrumbItem {
  label: string;
  path: string;
  icon?: React.ReactNode;
}

// Notification types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  action: () => void;
  style?: 'primary' | 'secondary';
}

// Theme types
export type Theme = 'light' | 'dark' | 'system';

export interface ThemeConfig {
  theme: Theme;
  primaryColor: string;
  accentColor: string;
}

// Export all types as a namespace as well
export * as Types from './index';
