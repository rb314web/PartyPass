import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import pl from './locales/pl.json';
import en from './locales/en.json';

export const SUPPORTED_LANGUAGES = ['pl', 'en'] as const;
export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];
export const LANGUAGE_STORAGE_KEY = 'partypass-language';
export const DEFAULT_LANGUAGE: AppLanguage = 'pl';

export const normalizeLanguage = (value?: string | null): AppLanguage => {
  if (!value) return DEFAULT_LANGUAGE;
  const code = value.toLowerCase().split('-')[0];
  if (code === 'en') return 'en';
  return 'pl';
};

const getInitialLanguage = (): AppLanguage => {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;

  const urlLang = new URLSearchParams(window.location.search).get('lang');
  if (urlLang) return normalizeLanguage(urlLang);

  const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (stored) return normalizeLanguage(stored);

  return normalizeLanguage(navigator.language);
};

export const changeAppLanguage = async (language: AppLanguage): Promise<void> => {
  await i18n.changeLanguage(language);
  localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  document.documentElement.lang = language;
};

void i18n.use(initReactI18next).init({
  resources: {
    pl: { translation: pl },
    en: { translation: en },
  },
  lng: getInitialLanguage(),
  fallbackLng: DEFAULT_LANGUAGE,
  compatibilityJSON: 'v4',
  interpolation: {
    escapeValue: false,
  },
});

document.documentElement.lang = i18n.language;

export default i18n;
