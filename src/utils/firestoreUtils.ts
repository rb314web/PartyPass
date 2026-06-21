import { Timestamp } from 'firebase/firestore';

function isFirestoreTimestamp(value: unknown): value is Timestamp {
  return (
    value instanceof Timestamp ||
    (typeof value === 'object' &&
      value !== null &&
      'toDate' in value &&
      typeof (value as Timestamp).toDate === 'function' &&
      'seconds' in value)
  );
}

/** Usuwa undefined z obiektu przed zapisem do Firestore. */
export function sanitizeForFirestore<T>(value: T): T {
  if (value === undefined) {
    return value;
  }
  if (value === null || typeof value !== 'object') {
    return value;
  }
  if (isFirestoreTimestamp(value)) {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map(item => sanitizeForFirestore(item)) as T;
  }

  const result: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
    if (val !== undefined) {
      result[key] = sanitizeForFirestore(val);
    }
  }
  return result as T;
}

export function sanitizePartyMembers(
  members: Array<{
    id: string;
    role: string;
    contactId?: string;
    firstName: string;
    lastName: string;
    dietaryRestrictions?: string;
  }>
) {
  return members.map(member => {
    const entry: Record<string, unknown> = {
      id: member.id,
      role: member.role,
      firstName: member.firstName || '',
      lastName: member.lastName || '',
    };
    if (member.contactId) entry.contactId = member.contactId;
    if (member.dietaryRestrictions?.trim()) {
      entry.dietaryRestrictions = member.dietaryRestrictions.trim();
    }
    return entry;
  });
}
