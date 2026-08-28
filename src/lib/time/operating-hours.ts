// Operating hours: Monday-Saturday, 06:00-20:00, Asia/Jakarta wall-clock time.
// day_of_week follows Postgres EXTRACT(DOW): 0=Sunday .. 6=Saturday.

export const OPERATING_START_MINUTES = 6 * 60; // 06:00
export const OPERATING_END_MINUTES = 20 * 60; // 20:00
export const OPERATING_DAYS = [1, 2, 3, 4, 5, 6]; // Mon-Sat

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export interface OperatingHoursCheck {
  valid: boolean;
  error?: string;
}

/**
 * Validates a recurring-template time range in Jakarta local wall-clock time.
 * dayOfWeek: 0=Sunday..6=Saturday. startTime/endTime: "HH:MM" 24h.
 */
export function validateTemplateWindow(
  dayOfWeek: number,
  startTime: string,
  endTime: string
): OperatingHoursCheck {
  if (!OPERATING_DAYS.includes(dayOfWeek)) {
    return { valid: false, error: "LSA operates Monday through Saturday only." };
  }
  const start = toMinutes(startTime);
  const end = toMinutes(endTime);
  if (end <= start) {
    return { valid: false, error: "End time must be after start time." };
  }
  if (start < OPERATING_START_MINUTES || end > OPERATING_END_MINUTES) {
    return { valid: false, error: "Sessions must fall between 6:00 AM and 8:00 PM." };
  }
  return { valid: true };
}

/** Validates a resolved instant (Jakarta wall-clock day-of-week + minutes-of-day). */
export function isWithinOperatingHours(jakartaDayOfWeek: number, minutesOfDay: number): boolean {
  return (
    OPERATING_DAYS.includes(jakartaDayOfWeek) &&
    minutesOfDay >= OPERATING_START_MINUTES &&
    minutesOfDay < OPERATING_END_MINUTES
  );
}
