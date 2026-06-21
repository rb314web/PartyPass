import { Timestamp } from 'firebase/firestore';
import { parseFirestoreDate, isRSVPTokenActive } from './rsvpTokenUtils';

describe('parseFirestoreDate', () => {
  it('returns undefined for null/undefined', () => {
    expect(parseFirestoreDate(null)).toBeUndefined();
    expect(parseFirestoreDate(undefined)).toBeUndefined();
  });

  it('returns the same Date for a valid Date', () => {
    const d = new Date('2026-01-01T12:00:00.000Z');
    expect(parseFirestoreDate(d)).toBe(d);
  });

  it('returns undefined for an invalid Date', () => {
    expect(parseFirestoreDate(new Date('not-a-date'))).toBeUndefined();
  });

  it('converts a Firestore Timestamp to a Date', () => {
    const d = new Date('2026-06-05T08:30:00.000Z');
    const ts = Timestamp.fromDate(d);
    expect(parseFirestoreDate(ts)?.getTime()).toBe(d.getTime());
  });

  it('converts a Timestamp-like object exposing toDate()', () => {
    const d = new Date('2026-06-05T08:30:00.000Z');
    const tsLike = { toDate: () => d };
    expect(parseFirestoreDate(tsLike)?.getTime()).toBe(d.getTime());
  });

  it('treats large numbers as milliseconds', () => {
    const ms = 1_700_000_000_000;
    expect(parseFirestoreDate(ms)?.getTime()).toBe(ms);
  });

  it('treats small numbers as unix seconds', () => {
    const seconds = 1_700_000_000;
    expect(parseFirestoreDate(seconds)?.getTime()).toBe(seconds * 1000);
  });

  it('returns undefined for unsupported types', () => {
    expect(parseFirestoreDate('2026-01-01')).toBeUndefined();
    expect(parseFirestoreDate(true)).toBeUndefined();
    expect(parseFirestoreDate({})).toBeUndefined();
  });
});

describe('isRSVPTokenActive', () => {
  it('stays active for an already-used token before the deadline (reusable)', () => {
    expect(
      isRSVPTokenActive({
        expiresAt: new Date(Date.now() + 60_000),
      })
    ).toBe(true);
  });

  it('is inactive when the deadline has passed', () => {
    expect(
      isRSVPTokenActive({
        expiresAt: new Date(Date.now() - 60_000),
      })
    ).toBe(false);
  });

  it('is active before the deadline', () => {
    expect(
      isRSVPTokenActive({
        expiresAt: new Date(Date.now() + 60_000),
      })
    ).toBe(true);
  });

  it('is active when there is no deadline', () => {
    expect(
      isRSVPTokenActive({
        expiresAt: undefined as unknown as Date,
      })
    ).toBe(true);
  });
});
