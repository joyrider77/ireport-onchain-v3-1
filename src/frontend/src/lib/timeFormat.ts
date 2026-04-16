/**
 * Time format utilities — always use hh:mm (e.g. 02:30, not 2.5)
 */

/**
 * Convert total minutes to hh:mm string.
 * Example: 150 → "02:30"
 */
export function minutesToHHMM(minutes: number): string {
  if (!Number.isFinite(minutes) || minutes < 0) return "00:00";
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/**
 * Parse hh:mm string to total minutes.
 * Example: "02:30" → 150
 */
export function hhmmToMinutes(hhmm: string): number {
  const match = hhmm.match(/^(\d+):(\d{2})$/);
  if (!match) return 0;
  return Number.parseInt(match[1], 10) * 60 + Number.parseInt(match[2], 10);
}

/**
 * Convert decimal hours to hh:mm string.
 * Example: 2.5 → "02:30"
 */
export function formatHours(hours: number): string {
  if (!Number.isFinite(hours) || hours < 0) return "00:00";
  const totalMinutes = Math.round(hours * 60);
  return minutesToHHMM(totalMinutes);
}

/**
 * Validate hh:mm format string.
 * Allows hours >= 0, minutes 00–59.
 */
export function isValidHHMM(value: string): boolean {
  return (
    /^\d{1,2}:\d{2}$/.test(value) &&
    Number.parseInt(value.split(":")[1], 10) < 60
  );
}

/**
 * Normalize flexible time input to hh:mm.
 * Accepts: "1300" → "13:00", "825" → "08:25", "08:25" → "08:25", "8:25" → "08:25"
 * Returns empty string for empty input.
 * Returns the original value if it cannot be parsed (to show validation error).
 */
export function normalizeTimeInput(raw: string): string {
  const s = raw.trim().replace(/\s/g, "");
  if (!s) return "";
  // Already hh:mm or hhh:mm format (allow extended hours like 120:30)
  if (/^\d{1,6}:\d{2}$/.test(s)) {
    const parts = s.split(":");
    const h = Number.parseInt(parts[0], 10);
    const m = Number.parseInt(parts[1], 10);
    if (m < 60)
      return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }
  // Numeric only: 0825 → 08:25 or 825 → 08:25
  if (/^\d{3,4}$/.test(s)) {
    const padded = s.padStart(4, "0");
    const h = Number.parseInt(padded.slice(0, 2), 10);
    const m = Number.parseInt(padded.slice(2), 10);
    if (m < 60)
      return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }
  return s;
}
