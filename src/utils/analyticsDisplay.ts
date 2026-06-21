const CATEGORY_LABELS: Record<string, string> = {
  other: 'Inne',
  birthday: 'Urodziny',
  wedding: 'Ślub',
  corporate: 'Firmowe',
  party: 'Impreza',
  conference: 'Konferencja',
  meeting: 'Spotkanie',
  celebration: 'Uroczystość',
};

const LOCATION_NOISE =
  /^(gmina|powiat|województwo|wojewodztwo|Polska|Poland|Polska\s*\d*)$/i;

export function formatPolishCount(
  count: number,
  forms: [string, string, string]
): string {
  const n = Math.abs(count);
  if (n === 1) return `1 ${forms[0]}`;
  const lastTwo = n % 100;
  const last = n % 10;
  if (last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14)) {
    return `${count} ${forms[1]}`;
  }
  return `${count} ${forms[2]}`;
}

export function formatDurationHours(hours: number): string {
  if (!Number.isFinite(hours) || hours <= 0) return '—';
  if (hours < 1) return `${Math.max(1, Math.round(hours * 60))} min`;
  if (hours < 48) return `${Math.round(hours)} h`;
  const days = Math.round(hours / 24);
  if (days < 14) return `${days} dni`;
  const weeks = Math.round(days / 7);
  return `~${weeks} tyg.`;
}

export function formatEventCategory(category: string): string {
  const trimmed = category.trim();
  if (!trimmed) return 'Inne';

  const mapped = CATEGORY_LABELS[trimmed.toLowerCase()];
  if (mapped) return mapped;

  if (trimmed.toLowerCase() === 'inne') return 'Inne';

  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

export function shortenLocationLabel(
  location: string,
  maxLength = 42
): { short: string; full: string } {
  const full = location.trim() || 'Brak lokalizacji';
  if (full === 'Brak lokalizacji') {
    return { short: full, full };
  }

  const parts = full
    .split(',')
    .map(part => part.trim())
    .filter(Boolean);

  const meaningful = parts.filter(
    part => !LOCATION_NOISE.test(part) && !/^\d{2}-\d{3}$/.test(part)
  );

  let short =
    meaningful.length >= 2
      ? `${meaningful[0]}, ${meaningful[1]}`
      : meaningful[0] || parts[0] || full;

  if (short.length > maxLength) {
    short = `${short.slice(0, maxLength - 1).trimEnd()}…`;
  }

  return { short, full };
}
