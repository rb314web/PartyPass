import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { readEnv, requireEnv } from './env';

describe('readEnv', () => {
  const original = { ...process.env };

  afterEach(() => {
    process.env = { ...original };
  });

  it('reads REACT_APP_ prefixed variables', () => {
    process.env.REACT_APP_FIREBASE_API_KEY = 'react-key';
    expect(readEnv('FIREBASE_API_KEY')).toBe('react-key');
  });

  it('falls back to VITE_ prefixed variables', () => {
    delete process.env.REACT_APP_FIREBASE_API_KEY;
    process.env.VITE_FIREBASE_API_KEY = 'vite-key';
    expect(readEnv('FIREBASE_API_KEY')).toBe('vite-key');
  });

  it('prefers REACT_APP_ over VITE_', () => {
    process.env.REACT_APP_FIREBASE_API_KEY = 'react-key';
    process.env.VITE_FIREBASE_API_KEY = 'vite-key';
    expect(readEnv('FIREBASE_API_KEY')).toBe('react-key');
  });

  it('requireEnv throws when missing', () => {
    delete process.env.REACT_APP_MISSING_VAR;
    delete process.env.VITE_MISSING_VAR;
    expect(() => requireEnv('MISSING_VAR')).toThrow(/Missing environment variable/);
  });
});
