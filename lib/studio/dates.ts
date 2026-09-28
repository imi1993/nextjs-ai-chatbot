import { SLOT_DAYS, SLOT_HOUR, SLOT_MINUTE } from './brand';

export const TIME_ZONE = 'Europe/Paris';

function parts(date: Date) {
  const p = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const get = (t: string) => Number(p.find((x) => x.type === t)?.value);
  return {
    year: get('year'),
    month: get('month'),
    day: get('day'),
    hour: get('hour'),
    minute: get('minute'),
  };
}

/** The instant at which Paris wall-clock time reads y-m-d h:min. */
export function parisTime(y: number, m: number, d: number, h = 0, min = 0) {
  const guess = new Date(Date.UTC(y, m - 1, d, h, min));
  const seen = parts(guess);
  const drift =
    Date.UTC(seen.year, seen.month - 1, seen.day, seen.hour, seen.minute) -
    guess.getTime();
  return new Date(guess.getTime() - drift);
}

/** "2026-10-05" for the Paris calendar day of an instant. */
export function dayKey(date: Date) {
  const { year, month, day } = parts(date);
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function monthBounds(year: number, month: number) {
  return {
    from: parisTime(year, month, 1),
    to:
      month === 12 ? parisTime(year + 1, 1, 1) : parisTime(year, month + 1, 1),
  };
}

/** First Monday, Tuesday or Thursday 8:30 slot after `after` not in `taken`. */
export function nextFreeSlot(after: Date, taken: Array<Date>) {
  const takenDays = new Set(taken.map(dayKey));
  const start = parts(after);
  for (let i = 0; i < 120; i++) {
    const noon = new Date(
      Date.UTC(start.year, start.month - 1, start.day + i, 12),
    );
    const slot = parisTime(
      noon.getUTCFullYear(),
      noon.getUTCMonth() + 1,
      noon.getUTCDate(),
      SLOT_HOUR,
      SLOT_MINUTE,
    );
    if (slot <= after) continue;
    if (!SLOT_DAYS.includes(noon.getUTCDay())) continue;
    if (takenDays.has(dayKey(slot))) continue;
    return slot;
  }
  return null;
}

export function formatSlot(date: Date) {
  return new Intl.DateTimeFormat('fr-FR', {
    timeZone: TIME_ZONE,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}
