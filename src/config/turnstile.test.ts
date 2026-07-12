import { describe, expect, it, afterEach } from 'vitest';
import { getTurnstileSiteKey, isTurnstileEnabled } from './turnstile';

describe('turnstile config', () => {
  const original = { ...process.env };

  afterEach(() => {
    process.env = { ...original };
  });

  it('returns undefined when site key is not configured', () => {
    delete process.env.REACT_APP_TURNSTILE_SITE_KEY;
    delete process.env.VITE_TURNSTILE_SITE_KEY;

    expect(getTurnstileSiteKey()).toBeUndefined();
    expect(isTurnstileEnabled()).toBe(false);
  });

  it('reads configured site key from env', () => {
    process.env.REACT_APP_TURNSTILE_SITE_KEY = 'test-site-key';

    expect(getTurnstileSiteKey()).toBe('test-site-key');
    expect(isTurnstileEnabled()).toBe(true);
  });
});
