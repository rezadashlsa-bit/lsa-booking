import { fromZonedTime, toZonedTime, formatInTimeZone } from "date-fns-tz";

// RAS/LSA operates in Jakarta. Every display and validation must target this
// explicitly — never the server's or browser's local timezone.
export const LSA_TIMEZONE = "Asia/Jakarta";

/** Combine a calendar date + local wall-clock time (both Jakarta) into a UTC Date. */
export function jakartaLocalToUtc(dateISO: string, timeHHMM: string): Date {
  return fromZonedTime(`${dateISO}T${timeHHMM}:00`, LSA_TIMEZONE);
}

/** Convert a stored UTC instant into its Jakarta wall-clock equivalent. */
export function utcToJakarta(date: Date | string): Date {
  return toZonedTime(new Date(date), LSA_TIMEZONE);
}

/** Format a stored UTC instant for display, always in Jakarta local time. */
export function formatJakarta(date: Date | string, pattern = "EEE d MMM, h:mm a"): string {
  return formatInTimeZone(new Date(date), LSA_TIMEZONE, pattern);
}

/** Format just the Jakarta-local time portion (e.g. for a slot chip). */
export function formatJakartaTime(date: Date | string): string {
  return formatInTimeZone(new Date(date), LSA_TIMEZONE, "h:mm a");
}

export function formatJakartaDateLong(date: Date | string): string {
  return formatInTimeZone(new Date(date), LSA_TIMEZONE, "EEEE, d MMMM yyyy");
}

/** Kept out of component render bodies since Date.now() is an impure call. */
export function isPast(date: Date | string): boolean {
  return new Date(date).getTime() < Date.now();
}
