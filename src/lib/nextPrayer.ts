export type PrayerKey = "fajr" | "dhuhr" | "asr" | "maghrib" | "isha";

export type Timings = Record<PrayerKey, string>;

export const PRAYER_ORDER: PrayerKey[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

const DAY_MS = 24 * 60 * 60 * 1000;

/** Parses "HH:mm" (Aladhan may append " (EET)") into a Date on the same day as `base`. */
export function timeOnDay(time: string, base: Date): Date {
  const match = /^(\d{1,2}):(\d{2})/.exec(time.trim());
  if (!match) throw new Error(`Invalid prayer time: "${time}"`);
  const d = new Date(base);
  d.setHours(Number(match[1]), Number(match[2]), 0, 0);
  return d;
}

/**
 * Returns the index (into PRAYER_ORDER) of the next prayer and the milliseconds left until it.
 * After Isha the next prayer is Fajr of the following day; today's Fajr time is used as an
 * approximation (it usually differs from tomorrow's by about a minute).
 */
export function getNextPrayer(timings: Timings, now: Date): { index: number; remainingMs: number } {
  for (let i = 0; i < PRAYER_ORDER.length; i++) {
    const at = timeOnDay(timings[PRAYER_ORDER[i]], now);
    if (at.getTime() > now.getTime()) {
      return { index: i, remainingMs: at.getTime() - now.getTime() };
    }
  }
  const fajrTomorrow = timeOnDay(timings.fajr, now).getTime() + DAY_MS;
  return { index: 0, remainingMs: fajrTomorrow - now.getTime() };
}

/** Formats milliseconds as HH:MM:SS. */
export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}
