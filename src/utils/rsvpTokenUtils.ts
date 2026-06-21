import { Timestamp } from 'firebase/firestore';
import type { RSVPToken } from '../types';

/** Bezpieczna konwersja pola daty z Firestore */
export function parseFirestoreDate(value: unknown): Date | undefined {
  if (value == null) return undefined;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? undefined : value;
  }
  if (value instanceof Timestamp) {
    const d = value.toDate();
    return Number.isNaN(d.getTime()) ? undefined : d;
  }
  if (typeof value === 'object' && 'toDate' in value) {
    const d = (value as Timestamp).toDate();
    return Number.isNaN(d.getTime()) ? undefined : d;
  }
  if (typeof value === 'number') {
    const d = new Date(value < 1e12 ? value * 1000 : value);
    return Number.isNaN(d.getTime()) ? undefined : d;
  }
  return undefined;
}

/**
 * Token można użyć do RSVP, dopóki nie minął jego termin (expiresAt).
 *
 * Uwaga: token jest WIELOKROTNY — gość może zmieniać odpowiedź aż do terminu,
 * dlatego `isUsed` nie unieważnia tokenu (służy tylko jako informacja).
 */
export function isRSVPTokenActive(
  token: Pick<RSVPToken, 'expiresAt'>
): boolean {
  if (token.expiresAt && token.expiresAt.getTime() < Date.now()) {
    return false;
  }
  return true;
}
