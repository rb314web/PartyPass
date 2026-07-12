import { readEnv } from './env';

export function getTurnstileSiteKey(): string | undefined {
  const key = readEnv('TURNSTILE_SITE_KEY')?.trim();
  return key || undefined;
}

export function isTurnstileEnabled(): boolean {
  return Boolean(getTurnstileSiteKey());
}
