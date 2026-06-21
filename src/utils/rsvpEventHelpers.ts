import type { EventDayWeatherOutlook } from '../services/weatherService';
import type { Event } from '../types';
import i18n from '../i18n';
import { formatAppDate } from './locale';

const polishPlural = (
  count: number,
  one: string,
  few: string,
  many: string
): string => {
  const abs = Math.abs(count);
  const mod10 = abs % 10;
  const mod100 = abs % 100;

  if (abs === 1) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
};

const DEFAULT_EVENT_DURATION_MS = 3 * 60 * 60 * 1000;

/** Termin zmiany RSVP: ustawiony przez organizatora lub godzina rozpoczęcia wydarzenia. */
export function getRsvpResponseDeadline(
  event: Pick<Event, 'rsvpDeadline' | 'date'>
): { date: Date; hasCustomDeadline: boolean } {
  if (event.rsvpDeadline) {
    return {
      date: new Date(event.rsvpDeadline),
      hasCustomDeadline: true,
    };
  }
  return {
    date: new Date(event.date),
    hasCustomDeadline: false,
  };
}

export function resolveRsvpDeadlineFromDates(
  rsvpDeadline: Date | undefined | null,
  eventDate: Date
): Date {
  if (rsvpDeadline) return new Date(rsvpDeadline);
  return new Date(eventDate);
}

export function isRsvpDeadlinePassed(deadline: Date, now = Date.now()): boolean {
  return deadline.getTime() < now;
}

export function formatRsvpDeadlineLabel(deadline: Date): string {
  const fullDate = formatAppDate(deadline, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const time = formatAppDate(deadline, {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${fullDate}, ${time}`;
}

const isLocationNoise = (part: string): boolean =>
  /^(gmina|powiat|Polska|Poland)$/i.test(part) ||
  /województwo|wojewodztwo/i.test(part) ||
  isPostalCode(part);

const isHouseNumber = (part: string): boolean => /^\d+[a-zA-Z]?$/.test(part);

const isPostalCode = (part: string): boolean => /^\d{2}-\d{3}$/.test(part);

const isDistrictNoise = (part: string): boolean =>
  /^(śródmieście|mokotów|wola|ochota|żoliborz|praga|bemowo|ursynów|wilanów|bielany|targówek)$/i.test(
    part
  ) || /^śródmieście\s/i.test(part);

/** Krótka etykieta miejsca na RSVP (pełny adres w atrybucie title). */
export const formatRsvpLocationDisplay = (
  location: string,
  options: { maxLength?: number; chip?: boolean } = {}
): { primary: string; full: string } => {
  const { maxLength = 52, chip = false } = options;
  const full = location.trim();
  if (!full) {
    return { primary: '', full: '' };
  }

  const parts = full
    .split(',')
    .map(part => part.trim())
    .filter(Boolean);

  const meaningful = parts.filter(
    part => !isLocationNoise(part) && !isDistrictNoise(part)
  );

  if (meaningful.length === 0) {
    return { primary: full, full };
  }

  const venue = meaningful[0];

  if (chip) {
    const chipMax = 28;
    const primary =
      venue.length > chipMax
        ? `${venue.slice(0, chipMax - 1).trimEnd()}…`
        : venue;
    return { primary, full };
  }

  const street = meaningful.find(
    part => part !== venue && !isHouseNumber(part) && /[A-Za-zÀ-ž]/.test(part)
  );
  const city =
    meaningful.find(
      part =>
        part !== venue &&
        part !== street &&
        !isHouseNumber(part) &&
        /^[A-ZĄĆĘŁŃÓŚŹŻ]/.test(part) &&
        part.length <= 24
    ) ?? meaningful[meaningful.length - 1];

  const segments = [venue, street, city].filter(
    (part, index, array): part is string =>
      Boolean(part) && array.indexOf(part) === index
  );

  let primary = segments.join(', ');

  if (primary.length > maxLength && venue.length > 24) {
    const shortVenue = `${venue.slice(0, 23).trimEnd()}…`;
    primary = [shortVenue, street, city]
      .filter((part, index, array): part is string =>
        Boolean(part) && array.indexOf(part) === index
      )
      .join(', ');
  }

  if (primary.length > maxLength) {
    primary = `${primary.slice(0, maxLength - 1).trimEnd()}…`;
  }

  return { primary, full };
};

export interface RsvpCalendarEvent {
  title: string;
  description?: string;
  location?: string;
  date: Date;
  endDate?: Date;
}

export const formatEventCountdown = (
  eventDate: Date,
  now: Date = new Date()
): { label: string; variant: 'upcoming' | 'live' | 'past' } => {
  const eventEnd = new Date(eventDate.getTime() + DEFAULT_EVENT_DURATION_MS);
  const diff = eventDate.getTime() - now.getTime();

  if (diff <= 0) {
    if (now.getTime() < eventEnd.getTime()) {
      return { label: i18n.t('rsvp.countdown.live'), variant: 'live' };
    }
    return { label: i18n.t('rsvp.countdown.past'), variant: 'past' };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    return {
      label: i18n.t('rsvp.countdown.inDaysHours', {
        days,
        daysUnit: i18n.t('rsvp.countdown.day', { count: days }),
        hours,
        hoursUnit: i18n.t('rsvp.countdown.hour', { count: hours }),
      }),
      variant: 'upcoming',
    };
  }

  if (hours > 0) {
    return {
      label: i18n.t('rsvp.countdown.inHoursMinutes', {
        hours,
        hoursUnit: i18n.t('rsvp.countdown.hour', { count: hours }),
        minutes,
        minutesUnit: i18n.t('rsvp.countdown.minute', { count: minutes }),
      }),
      variant: 'upcoming',
    };
  }

  return {
    label: i18n.t('rsvp.countdown.inMinutes', {
      minutes,
      minutesUnit: i18n.t('rsvp.countdown.minute', { count: minutes }),
    }),
    variant: 'upcoming',
  };
};

const toCalendarUtc = (date: Date): string =>
  date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

const escapeIcsText = (value: string): string =>
  value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');

export const getGoogleCalendarUrl = (event: RsvpCalendarEvent): string => {
  const start = event.date;
  const end = event.endDate ?? new Date(start.getTime() + DEFAULT_EVENT_DURATION_MS);
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${toCalendarUtc(start)}/${toCalendarUtc(end)}`,
  });

  if (event.description?.trim()) {
    params.set('details', event.description.trim());
  }
  if (event.location?.trim()) {
    params.set('location', event.location.trim());
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

export const buildIcsFileContent = (event: RsvpCalendarEvent): string => {
  const start = event.date;
  const end = event.endDate ?? new Date(start.getTime() + DEFAULT_EVENT_DURATION_MS);
  const uid = `${start.getTime()}-${encodeURIComponent(event.title)}@partypass.app`;
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//PartyPass//RSVP//PL',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${toCalendarUtc(new Date())}`,
    `DTSTART:${toCalendarUtc(start)}`,
    `DTEND:${toCalendarUtc(end)}`,
    `SUMMARY:${escapeIcsText(event.title)}`,
  ];

  if (event.description?.trim()) {
    lines.push(`DESCRIPTION:${escapeIcsText(event.description.trim())}`);
  }
  if (event.location?.trim()) {
    lines.push(`LOCATION:${escapeIcsText(event.location.trim())}`);
  }

  lines.push('END:VEVENT', 'END:VCALENDAR');
  return lines.join('\r\n');
};

export const downloadIcsFile = (event: RsvpCalendarEvent): void => {
  const content = buildIcsFileContent(event);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${event.title.replace(/[^\w\s-]/g, '').trim() || 'wydarzenie'}.ics`;
  link.click();
  URL.revokeObjectURL(url);
};

export const getAppleCalendarUrl = (event: RsvpCalendarEvent): string => {
  const start = event.date;
  const end = event.endDate ?? new Date(start.getTime() + DEFAULT_EVENT_DURATION_MS);
  const params = new URLSearchParams({
    title: event.title,
    st: start.toISOString(),
    et: end.toISOString(),
  });

  if (event.description?.trim()) {
    params.set('notes', event.description.trim());
  }
  if (event.location?.trim()) {
    params.set('location', event.location.trim());
  }

  return `https://calendar.apple.com/?${params.toString()}`;
};

export interface NavigationTarget {
  location: string;
  latitude?: number;
  longitude?: number;
}

export const getGoogleMapsUrl = (target: NavigationTarget): string => {
  const query =
    target.latitude != null && target.longitude != null
      ? `${target.latitude},${target.longitude}`
      : target.location;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
};

export const getAppleMapsUrl = (target: NavigationTarget): string => {
  const params = new URLSearchParams();
  if (target.latitude != null && target.longitude != null) {
    params.set('ll', `${target.latitude},${target.longitude}`);
    params.set('q', target.location);
  } else {
    params.set('q', target.location);
  }
  return `https://maps.apple.com/?${params.toString()}`;
};

export const getWazeUrl = (target: NavigationTarget): string => {
  const params = new URLSearchParams({ navigate: 'yes' });
  if (target.latitude != null && target.longitude != null) {
    params.set('ll', `${target.latitude},${target.longitude}`);
  } else {
    params.set('q', target.location);
  }
  return `https://waze.com/ul?${params.toString()}`;
};

const isRainyIcon = (icon: string): boolean =>
  icon.includes('09') || icon.includes('10') || icon.includes('11');

const isSnowyIcon = (icon: string): boolean => icon.includes('13');

const isRainyDescription = (description: string): boolean =>
  /deszcz|mżaw|burz|opad/i.test(description);

const isSnowyDescription = (description: string): boolean =>
  /śnieg|szron/i.test(description);

const isClearIcon = (icon: string): boolean => icon.includes('01');

const isCloudyIcon = (icon: string): boolean =>
  icon.includes('02') || icon.includes('03') || icon.includes('04');

const isFoggyIcon = (icon: string): boolean => icon.includes('50');

const isClearDescription = (description: string): boolean =>
  /bezchmurn|słoneczn|jasno|clear|sunny|mainly clear/i.test(description);

const isCloudyDescription = (description: string): boolean =>
  /zachmurzen|pochmurn|chmur|cloud|overcast/i.test(description);

const isFoggyDescription = (description: string): boolean =>
  /mgł|szron|fog|mist/i.test(description);

/** Wskazówki na podstawie prognozy od godziny wydarzenia do końca dnia. */
export const getWeatherPackingTips = (
  outlook: EventDayWeatherOutlook
): string[] => {
  const tips: string[] = [];
  const {
    atEventTime,
    hasRain,
    hasSnow,
    hasThunderstorm,
    hasFog,
    rainHours,
    periodHours,
    minTemp,
    maxTemp,
    maxWindSpeed,
  } = outlook;

  const rainShare = periodHours > 0 ? rainHours / periodHours : 0;
  const rainAtStart =
    isRainyIcon(atEventTime.icon) || isRainyDescription(atEventTime.description);
  const rainLater = hasRain && !rainAtStart;

  if (hasThunderstorm) {
    tips.push(i18n.t('weather.packing.thunderstorm'));
  } else if (rainShare >= 0.5 || rainHours >= 3) {
    tips.push(i18n.t('weather.packing.heavyRain'));
  } else if (hasRain) {
    tips.push(
      rainLater
        ? i18n.t('weather.packing.rainLater')
        : i18n.t('weather.packing.rainPossible')
    );
  }

  if (hasSnow) {
    tips.push(i18n.t('weather.packing.snow'));
  }

  if (hasFog) {
    tips.push(i18n.t('weather.packing.fog'));
  }

  if (minTemp <= 5) {
    tips.push(i18n.t('weather.packing.veryCold'));
  } else if (minTemp <= 12) {
    tips.push(i18n.t('weather.packing.cool'));
  } else if (maxTemp >= 28) {
    tips.push(i18n.t('weather.packing.hot'));
  }

  if (maxWindSpeed >= 30) {
    tips.push(i18n.t('weather.packing.windy'));
  }

  if (tips.length === 0) {
    const clearDay =
      !hasRain &&
      (isClearIcon(atEventTime.icon) ||
        isClearDescription(atEventTime.description));

    if (clearDay) {
      tips.push(i18n.t('weather.packing.clear'));
    } else if (
      isCloudyIcon(atEventTime.icon) ||
      isCloudyDescription(atEventTime.description)
    ) {
      tips.push(i18n.t('weather.packing.cloudy'));
    } else {
      tips.push(i18n.t('weather.packing.default'));
    }
  }

  return [...new Set(tips)].slice(0, 2);
};
