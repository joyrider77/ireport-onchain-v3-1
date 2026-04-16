// Shared helpers for Stammdaten tabs
import { useActor as _useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createActor } from "../../backend";
import type { backendInterface } from "../../backend.d";

export { useMutation, useQuery, useQueryClient };

// Cast actor through unknown to access typed backend interface
export function useActor() {
  const { actor, isFetching } = _useActor(createActor);
  const typedActor = actor ? (actor as unknown as backendInterface) : null;
  return { actor: typedActor, isFetching };
}

export function getRoleLabel(role: string): string {
  if (role === "admin") return "Administrator";
  if (role === "manager") return "Manager";
  return "Mitarbeiter";
}

export function getEmploymentTypeLabel(type: string): string {
  if (type === "fullTime") return "Vollzeit";
  if (type === "partTime") return "Teilzeit";
  if (type === "contractor") return "Freelancer";
  return type;
}

// ─── Time format helpers ──────────────────────────────────────────────────────

/** Convert minutes (number) to hh:mm string */
export function minutesToHhMm(totalMinutes: number): string {
  const h = Math.floor(Math.abs(totalMinutes) / 60);
  const m = Math.abs(totalMinutes) % 60;
  const sign = totalMinutes < 0 ? "-" : "";
  return `${sign}${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Parse hh:mm or h:mm input to minutes. Returns null on invalid input. */
export function hhmmToMinutes(input: string): number | null {
  const trimmed = input.trim();
  const match = trimmed.match(/^(\d{1,3}):([0-5]\d)$/);
  if (!match) return null;
  return Number.parseInt(match[1], 10) * 60 + Number.parseInt(match[2], 10);
}

/** Convert bigint minutes to hh:mm display string */
export function bigintToHhMm(minutes: bigint): string {
  return minutesToHhMm(Number(minutes));
}

/** Convert minutes (bigint, large range) to hhh:mm string */
export function minutesToHhhMm(totalMinutes: number): string {
  const sign = totalMinutes < 0 ? "-" : "";
  const abs = Math.abs(totalMinutes);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  // Pad to at least 3 digits for hours so 999999 displays correctly
  const hStr = h < 100 ? String(h).padStart(3, "0") : String(h);
  return `${sign}${hStr}:${String(m).padStart(2, "0")}`;
}

/** Parse hhh:mm or shorter input to minutes. Supports up to 999999:59 */
export function hhhmmToMinutes(input: string): number | null {
  const trimmed = input.trim();
  const match = trimmed.match(/^(\d{1,6}):([0-5]\d)$/);
  if (!match) return null;
  return Number.parseInt(match[1], 10) * 60 + Number.parseInt(match[2], 10);
}

/** Convert ISO date string (YYYY-MM-DD) to Unix timestamp in seconds as bigint.
 *  CRITICAL: Uses local midnight (NOT UTC T00:00:00Z) to avoid timezone shift.
 *  Switzerland is UTC+1/+2 — using UTC midnight causes a 1-2h shift that moves
 *  "2026-04-01 00:00 local" to "2026-03-31 22:00 UTC", storing the wrong day.
 */
export function dateToTimestamp(dateStr: string): bigint {
  if (!dateStr) return BigInt(0);
  // Local midnight — no trailing Z so the browser interprets as local time
  const d = new Date(`${dateStr}T00:00:00`);
  return BigInt(Math.floor(d.getTime() / 1000));
}

/** Convert Unix timestamp (seconds, bigint) to ISO date string YYYY-MM-DD.
 *  CRITICAL: Uses local time extraction (getFullYear/getMonth/getDate) NOT
 *  toISOString() which returns UTC and would shift Swiss midnight dates by 1 day.
 */
export function timestampToDate(ts: bigint): string {
  if (!ts || ts === BigInt(0)) return "";
  const d = new Date(Number(ts) * 1000);
  // Extract local year/month/day to match how the date was originally stored
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Format vacation balance duration (stored as bigint = number of days * 100 for 2 decimal places) */
export function formatVacationDays(dauer: bigint): string {
  const days = Number(dauer) / 100;
  return days % 1 === 0 ? `${days}` : days.toFixed(1);
}

/** Parse vacation days input (e.g. "20" or "10.5") to bigint (days * 100) */
export function parseVacationDays(input: string): bigint | null {
  const val = Number.parseFloat(input);
  if (!Number.isFinite(val) || val < 0) return null;
  return BigInt(Math.round(val * 100));
}
