import React from 'react';
import { CheckCircle, XCircle, HelpCircle, Clock } from 'lucide-react';
import { Event, GuestStatus } from '../../../../types';

export const getGuestStatusLabel = (status: GuestStatus): string => {
  switch (status) {
    case 'accepted': return 'Potwierdził';
    case 'declined': return 'Odrzucił';
    case 'maybe': return 'Może';
    case 'pending': return 'Oczekuje';
    default: return 'Nieznany';
  }
};

export const getGuestStatusIcon = (status: GuestStatus): React.ReactNode => {
  switch (status) {
    case 'accepted':
      return <CheckCircle size={14} aria-hidden />;
    case 'declined':
      return <XCircle size={14} aria-hidden />;
    case 'maybe':
      return <HelpCircle size={14} aria-hidden />;
    case 'pending':
      return <Clock size={14} aria-hidden />;
    default:
      return <Clock size={14} aria-hidden />;
  }
};

export const getEventStatusColor = (status: Event['status']): string => {
  switch (status) {
    case 'active': return 'var(--success)';
    case 'completed': return 'var(--primary)';
    case 'cancelled': return 'var(--error)';
    default: return 'var(--gray-500)';
  }
};

export const getEventStatusLabel = (status: Event['status']): string => {
  switch (status) {
    case 'active': return 'Aktywne';
    case 'completed': return 'Zakończone';
    case 'cancelled': return 'Anulowane';
    default: return status;
  }
};
