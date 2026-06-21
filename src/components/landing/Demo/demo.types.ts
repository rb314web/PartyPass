import React from 'react';

export interface DemoMetricDetail {
  label: string;
  value: string;
}

export interface DemoMetric {
  label: string;
  value: string | number;
  change?: number;
  changeLabel: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: 'blue' | 'green' | 'purple';
  details: DemoMetricDetail[];
  linkLabel: string;
}

export interface DemoEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  guests: number;
  maxGuests: number;
  accepted: number;
  pending: number;
  status: 'active' | 'completed';
}

export type DemoView =
  | 'dashboard'
  | 'events'
  | 'analytics'
  | 'search'
  | 'contacts'
  | 'activities'
  | 'plan'
  | 'settings';

export interface SidebarItem {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  view: DemoView;
}

export interface DemoContact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  eventsAttended: number;
  lastEvent: string;
}

export interface DemoActivity {
  id: string;
  type: string;
  message: string;
  time: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: 'success' | 'blue' | 'purple' | 'green';
}
