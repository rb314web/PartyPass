import { enUS, pl } from 'date-fns/locale';
import type { Locale } from 'date-fns';
import i18n, { type AppLanguage } from '../i18n';

export const getAppLanguage = (): AppLanguage =>
  i18n.language === 'en' ? 'en' : 'pl';

export const getIntlLocale = (language = getAppLanguage()): string =>
  language === 'en' ? 'en-GB' : 'pl-PL';

export const getDateFnsLocale = (language = getAppLanguage()): Locale =>
  language === 'en' ? enUS : pl;

export const formatAppDate = (
  date: Date,
  options: Intl.DateTimeFormatOptions,
  language = getAppLanguage()
): string =>
  new Intl.DateTimeFormat(getIntlLocale(language), options).format(date);
