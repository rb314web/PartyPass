import React from 'react';

export interface DemoStat {
  title: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down';
  icon: React.ComponentType<any>;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

export interface DemoEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  guests: number;
  maxGuests: number;
  status: 'active' | 'completed';
}

export type DemoView = 'dashboard' | 'events' | 'analytics' | 'search' | 'contacts' | 'activities' | 'settings';

export interface SidebarItem {
  icon: React.ComponentType<any>;
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
  type: 'confirmation' | 'invitation' | 'event' | 'guest';
  message: string;
  time: string;
  icon: React.ComponentType<any>;
  color: 'success' | 'blue' | 'purple' | 'green';
}

