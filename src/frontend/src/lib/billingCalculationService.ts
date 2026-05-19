// ────────────────────────────────────────────────────────────────
// billingCalculationService.ts
// Pure functions for annual license billing calculations.
// No UI imports. All functions are side-effect-free.
// ────────────────────────────────────────────────────────────────

import type { Employee } from "../backend.d";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MonthResult {
  month: Date; // first day of month
  activeDays: number;
  isLicenseMonth: boolean;
}

export interface EmployeeBillingResult {
  employee: Employee;
  monthResults: MonthResult[];
  licenseMonths: number;
}

export interface BillingCalculationResult {
  employeeResults: EmployeeBillingResult[];
  months: Date[];
  totalPerMonth: number[]; // count of license-relevant employees per month
  totalLicenses: number; // sum of all licenseMonths
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Convert ICP nanosecond bigint timestamp to a JS Date */
function icpNsToDate(ns: bigint): Date {
  return new Date(Number(ns / 1_000_000n));
}

/** Returns the first day (00:00:00) of the given month */
function monthStart(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}

/** Returns the last moment of the given month */
function monthEnd(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}

/** Inclusive number of days between two dates (truncated to day precision) */
function daysBetweenInclusive(from: Date, to: Date): number {
  const msPerDay = 86_400_000;
  // Strip time component
  const a = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const b = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.max(0, Math.round((b.getTime() - a.getTime()) / msPerDay) + 1);
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns an array of Date objects (first day of each month) covering the
 * range [fromDate, toDate] inclusive.
 */
export function getMonthsInRange(fromDate: Date, toDate: Date): Date[] {
  const months: Date[] = [];
  const cursor = monthStart(fromDate);
  const end = monthStart(toDate);
  while (cursor <= end) {
    months.push(new Date(cursor));
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return months;
}

/**
 * Returns a short German month label, e.g. "Jun. 25" or "Jan. 26".
 */
export function formatMonthLabel(date: Date): string {
  const MONTHS_SHORT = [
    "Jan.",
    "Feb.",
    "Mär.",
    "Apr.",
    "Mai.",
    "Jun.",
    "Jul.",
    "Aug.",
    "Sep.",
    "Okt.",
    "Nov.",
    "Dez.",
  ];
  const twoDigitYear = String(date.getFullYear()).slice(-2);
  return `${MONTHS_SHORT[date.getMonth()]} ${twoDigitYear}`;
}

/**
 * Computes the number of days within `month` that the employee was active,
 * intersected with [periodStart, periodEnd].
 *
 * activatedAt / deactivatedAt are optional bigint nanoseconds (ICP).
 * If deactivatedAt is absent, the employee is still active.
 */
export function calculateActiveDaysInMonth(
  employee: Employee,
  month: Date,
  periodStart: Date,
  periodEnd: Date,
): number {
  const mStart = monthStart(month);
  const mEnd = monthEnd(month);

  // Effective activation date
  const activatedAt = employee.activatedAt
    ? icpNsToDate(employee.activatedAt)
    : new Date(0); // epoch fallback — treat as always active from start

  // Effective deactivation date (open-ended if not set)
  const deactivatedAt = employee.deactivatedAt
    ? icpNsToDate(employee.deactivatedAt)
    : new Date(8_640_000_000_000_000); // far future

  // Intersect all three intervals:
  //   [periodStart, periodEnd]  ∩  [activatedAt, deactivatedAt]  ∩  [mStart, mEnd]
  const windowStart = new Date(
    Math.max(mStart.getTime(), periodStart.getTime(), activatedAt.getTime()),
  );
  const windowEnd = new Date(
    Math.min(mEnd.getTime(), periodEnd.getTime(), deactivatedAt.getTime()),
  );

  if (windowEnd < windowStart) return 0;

  return daysBetweenInclusive(windowStart, windowEnd);
}

/**
 * Returns true if activeDays > kulanzDays (strictly greater).
 */
export function isLicenseMonth(
  activeDays: number,
  kulanzDays: number,
): boolean {
  return activeDays > kulanzDays;
}

/**
 * Counts the number of months where the employee has activeDays > kulanzDays.
 */
export function calculateLicenseMonths(
  employee: Employee,
  months: Date[],
  kulanzDays: number,
  periodStart: Date,
  periodEnd: Date,
): number {
  return months.reduce((count, month) => {
    const days = calculateActiveDaysInMonth(
      employee,
      month,
      periodStart,
      periodEnd,
    );
    return count + (isLicenseMonth(days, kulanzDays) ? 1 : 0);
  }, 0);
}

/**
 * Runs the full billing calculation for a list of employees over a date range.
 * Filters out employees with zero activity across the entire period.
 */
export function calculateBilling(
  employees: Employee[],
  periodStart: Date,
  periodEnd: Date,
  kulanzDays: number,
): BillingCalculationResult {
  const months = getMonthsInRange(periodStart, periodEnd);

  const employeeResults: EmployeeBillingResult[] = employees
    .map((employee) => {
      const monthResults: MonthResult[] = months.map((month) => {
        const activeDays = calculateActiveDaysInMonth(
          employee,
          month,
          periodStart,
          periodEnd,
        );
        return {
          month,
          activeDays,
          isLicenseMonth: isLicenseMonth(activeDays, kulanzDays),
        };
      });
      const licenseMonths = monthResults.filter((r) => r.isLicenseMonth).length;
      return { employee, monthResults, licenseMonths };
    })
    .filter((r) => r.monthResults.some((m) => m.activeDays > 0));

  // Total license-relevant employees per month column
  const totalPerMonth = months.map(
    (_, i) =>
      employeeResults.filter((r) => r.monthResults[i]?.isLicenseMonth).length,
  );

  const totalLicenses = employeeResults.reduce(
    (s, r) => s + r.licenseMonths,
    0,
  );

  return { employeeResults, months, totalPerMonth, totalLicenses };
}

// Dummy export to suppress unused import warnings in edge cases
export type { Employee };
