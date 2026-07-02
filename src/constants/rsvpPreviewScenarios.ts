import { formatAppDate, getAppLanguage } from '../utils/locale';
import { normalizeLanguage, type AppLanguage } from '../i18n';

export const RSVP_PREVIEW_SCENARIO_KEYS = ['birthday', 'meetup', 'gala'] as const;

export type RsvpPreviewScenarioKey = (typeof RSVP_PREVIEW_SCENARIO_KEYS)[number];

export const RSVP_PREVIEW_SCENARIO_DATES: Record<RsvpPreviewScenarioKey, Date> = {
  birthday: new Date(2026, 5, 14, 20, 0),
  meetup: new Date(2026, 5, 22, 18, 30),
  gala: new Date(2026, 7, 2, 15, 0),
};

export const RSVP_PREVIEW_SCENARIO_SELECTION: Record<RsvpPreviewScenarioKey, number> = {
  birthday: 0,
  meetup: 1,
  gala: 2,
};

export const RSVP_PREVIEW_SCENARIO_BACKGROUNDS: Record<RsvpPreviewScenarioKey, string> = {
  birthday: '/images/hero/birthday.jpg',
  meetup: '/images/hero/party.jpg',
  gala: '/images/hero/wedding.jpg',
};

export interface RsvpPreviewScenarioState {
  index: number;
  overlayIndex: number | null;
  isCrossfading: boolean;
}

export const getRsvpPreviewScenarioBackground = (
  scenarioKey: RsvpPreviewScenarioKey
): string => RSVP_PREVIEW_SCENARIO_BACKGROUNDS[scenarioKey];

export const getRsvpPreviewScenarioBackgroundByIndex = (index: number): string =>
  getRsvpPreviewScenarioBackground(RSVP_PREVIEW_SCENARIO_KEYS[index]);

export const formatPreviewScenarioDate = (
  date: Date,
  language: string = getAppLanguage()
): string => {
  const locale = normalizeLanguage(language) as AppLanguage;
  const day = formatAppDate(date, { day: 'numeric', month: 'long' }, locale);
  const time = formatAppDate(
    date,
    {
      hour: '2-digit',
      minute: '2-digit',
      ...(locale === 'en' ? { hour12: true } : { hour12: false }),
    },
    locale
  );

  return `${day}, ${time}`;
};
