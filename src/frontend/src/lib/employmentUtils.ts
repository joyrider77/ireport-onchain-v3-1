import type { Employment } from "../backend.d";

/**
 * Converts a Unix second timestamp (bigint OR number) to a local-timezone
 * ISO date string (YYYY-MM-DD).
 *
 * CRITICAL: emp.von/emp.bis are stored as Unix SECONDS (Int) in the Motoko
 * backend via dateToTimestamp() which does: BigInt(Math.floor(d.getTime() / 1000)).
 * To convert back to milliseconds for new Date(): multiply by 1000.
 *
 * We use new Date(ms) and then extract year/month/day in LOCAL time via
 * getFullYear/getMonth/getDate — this correctly recovers the intended date
 * without UTC midnight shift issues.
 *
 * NEVER divide by 1_000_000n (nanoseconds) — the backend stores SECONDS, not nanoseconds.
 */
export function nanosToLocalIsoDate(
  ns: bigint | number | undefined | null,
): string {
  if (ns === undefined || ns === null) return "";
  // Normalize to number — backend stores Unix seconds as bigint or number
  let secNum: number;
  try {
    secNum = typeof ns === "bigint" ? Number(ns) : Math.round(Number(ns));
  } catch {
    return "";
  }
  if (secNum <= 0 || !Number.isFinite(secNum)) return "";
  // Convert Unix seconds → milliseconds
  const ms = secNum * 1000;
  if (ms <= 0 || !Number.isFinite(ms)) return "";
  const d = new Date(ms);
  const y = d.getFullYear();
  if (y < 2000 || y > 2100) return "";
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Finds the active employment for a given ISO date string (YYYY-MM-DD).
 *
 * Uses Date object comparison (not string comparison) for reliability.
 * emp.von and emp.bis are stored as Unix SECONDS (bigint) in the backend
 * via dateToTimestamp() which stores BigInt(Math.floor(d.getTime() / 1000)).
 * nanosToLocalIsoDate() correctly converts seconds → ms → local date string.
 *
 * If emp.bis is 0n, null, or undefined → open-ended employment (no upper bound).
 *
 * Among all matching employments, returns the one whose Von date is the latest
 * (most specific / most recent), which is the correct behavior when periods
 * don't overlap.
 *
 * Returns undefined (not null) to match previous signature.
 */
export function getActiveEmploymentForDate(
  employments: Employment[],
  isoDate: string,
): Employment | undefined {
  if (!employments || employments.length === 0 || !isoDate) return undefined;

  // Parse the target date as local noon — using T12:00:00 avoids any DST edge
  // cases while keeping the day unambiguous in all timezones.
  const targetDate = new Date(`${isoDate}T12:00:00`);
  if (Number.isNaN(targetDate.getTime())) return undefined;

  let bestMatch: Employment | undefined;
  let bestVonTime = Number.NEGATIVE_INFINITY;

  for (const emp of employments) {
    // Validate: must have a valid von timestamp
    if (!emp.von) continue;

    // Safely convert to bigint — guards against backend returning number
    let vonBig: bigint;
    try {
      vonBig =
        typeof emp.von === "bigint"
          ? emp.von
          : BigInt(Math.round(Number(emp.von)));
    } catch {
      continue;
    }
    if (vonBig <= 0n) continue;

    // Convert to local ISO date string
    const vonIso = nanosToLocalIsoDate(vonBig);
    if (!vonIso) continue;

    // Parse as local noon for Date comparison
    const vonDate = new Date(`${vonIso}T12:00:00`);
    if (Number.isNaN(vonDate.getTime())) continue;

    // Date must be on or after employment start
    if (targetDate < vonDate) continue;

    // Check if bis is set (non-zero, non-null bigint)
    const bisRaw = emp.bis;
    let bisIsOpen = true;

    if (bisRaw !== undefined && bisRaw !== null) {
      let bisBig: bigint;
      try {
        bisBig =
          typeof bisRaw === "bigint"
            ? bisRaw
            : BigInt(Math.round(Number(bisRaw)));
      } catch {
        // Treat invalid bis as open-ended
        bisBig = 0n;
      }
      bisIsOpen = bisBig <= 0n;

      if (!bisIsOpen) {
        const bisIso = nanosToLocalIsoDate(bisBig);
        if (!bisIso) {
          // Treat empty bisIso as open-ended
          bisIsOpen = true;
        } else {
          const bisDate = new Date(`${bisIso}T12:00:00`);
          if (Number.isNaN(bisDate.getTime())) {
            bisIsOpen = true;
          } else if (targetDate > bisDate) {
            // Date is after employment end — skip
            continue;
          }
        }
      }
    }

    // This employment covers the target date — keep the one with the latest Von
    const vonTime = vonDate.getTime();
    if (vonTime > bestVonTime) {
      bestVonTime = vonTime;
      bestMatch = emp;
    }
  }

  return bestMatch;
}

/**
 * Finds the most recent employment that started on or before the given date,
 * even if that employment has already ended. This is a fallback for when no
 * active employment is found (e.g., date is after all employments ended).
 * Useful for computing ganztaetig hours when employment lookup fails.
 */
export function getMostRecentEmploymentBefore(
  employments: Employment[],
  isoDate: string,
): Employment | undefined {
  if (!employments || employments.length === 0 || !isoDate) return undefined;

  const targetDate = new Date(`${isoDate}T12:00:00`);
  if (Number.isNaN(targetDate.getTime())) return undefined;

  let bestMatch: Employment | undefined;
  let bestVonTime = Number.NEGATIVE_INFINITY;

  for (const emp of employments) {
    if (!emp.von) continue;
    let vonBig: bigint;
    try {
      vonBig =
        typeof emp.von === "bigint"
          ? emp.von
          : BigInt(Math.round(Number(emp.von)));
    } catch {
      continue;
    }
    if (vonBig <= 0n) continue;
    const vonIso = nanosToLocalIsoDate(vonBig);
    if (!vonIso) continue;
    const vonDate = new Date(`${vonIso}T12:00:00`);
    if (Number.isNaN(vonDate.getTime())) continue;
    if (targetDate < vonDate) continue;
    const vonTime = vonDate.getTime();
    if (vonTime > bestVonTime) {
      bestVonTime = vonTime;
      bestMatch = emp;
    }
  }

  return bestMatch;
}

/**
 * Returns the Soll-minutes for a specific weekday from an employment.
 * dateStr is ISO "YYYY-MM-DD".
 * The stunden* fields are stored as minutes (bigint).
 *
 * We parse the date as noon UTC (T12:00:00Z) to safely get the UTC weekday
 * without timezone boundary issues — both local and UTC agree on the weekday
 * when the time is noon UTC.
 */
export function getEmploymentMinutesForDate(
  emp: Employment,
  dateStr: string,
): number {
  // Parse as noon UTC to get a stable weekday regardless of local timezone
  const d = new Date(`${dateStr}T12:00:00Z`);
  const dow = d.getUTCDay(); // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  // Map getDay() result to the correct stunden* field
  const map: Record<number, bigint> = {
    0: emp.stundenSo ?? 0n,
    1: emp.stundenMo ?? 0n,
    2: emp.stundenDi ?? 0n,
    3: emp.stundenMi ?? 0n,
    4: emp.stundenDo ?? 0n,
    5: emp.stundenFr ?? 0n,
    6: emp.stundenSa ?? 0n,
  };
  const val = map[dow];
  if (val === undefined) return 0;
  try {
    return Number(
      typeof val === "bigint" ? val : BigInt(Math.round(Number(val))),
    );
  } catch {
    return 0;
  }
}

/**
 * Counts vacation days to deduct from the balance for a single absence entry,
 * taking into account whether it is all-day (ganztaetig) or partial-day.
 *
 * RULES:
 * - For each calendar day in the range [dateFrom, dateTo]:
 *   - If the active employment for that day has 0 Soll-minutes → 0 days deducted
 *     (weekend or explicitly 0:00 day — even if approved by admin)
 *   - If ganztaetig=true → 1 day deducted per workday
 *   - If ganztaetig=false (partial day, single-day only):
 *       deductedDays = dauer_minutes / soll_minutes_for_that_day
 *       (e.g. 4:00h entered / 8:00h Soll = 0.5 days)
 *
 * For multi-day absences that are NOT ganztaetig, only the first day in the
 * range is treated as partial (the UI should only allow partial-day for
 * single-day entries — but this function handles multi-day gracefully by
 * applying the proportion to each workday individually).
 *
 * @param dateFrom      - ISO date string "YYYY-MM-DD" (inclusive)
 * @param dateTo        - ISO date string "YYYY-MM-DD" (inclusive)
 * @param ganztaetig    - true = all-day, false = partial hours entered
 * @param dauerMinutes  - Duration in minutes (only used when ganztaetig=false)
 * @param employments   - All employments for the employee
 * @returns Fractional number of vacation days to deduct
 */
export function countVacationDaysProportional(
  dateFrom: string,
  dateTo: string,
  ganztaetig: boolean,
  dauerMinutes: number,
  employments: Employment[],
): number {
  if (!dateFrom || !dateTo || !employments || employments.length === 0)
    return 0;

  const start = new Date(`${dateFrom}T12:00:00`);
  const end = new Date(`${dateTo}T12:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
  if (start > end) return 0;

  let count = 0;
  const cursor = new Date(start);

  while (cursor <= end) {
    const y = cursor.getFullYear();
    const m = String(cursor.getMonth() + 1).padStart(2, "0");
    const d = String(cursor.getDate()).padStart(2, "0");
    const dayIso = `${y}-${m}-${d}`;

    const emp = getActiveEmploymentForDate(employments, dayIso);
    if (emp) {
      const sollMinutes = getEmploymentMinutesForDate(emp, dayIso);
      if (sollMinutes > 0) {
        if (ganztaetig) {
          // Full workday — always counts as 1 day
          count += 1;
        } else {
          // Partial day — proportion: entered hours / soll hours for that day
          count += Math.min(dauerMinutes / sollMinutes, 1);
        }
      }
      // If sollMinutes === 0 → day has no pensum → add 0 (not deducted)
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return count;
}

/**
 * Backwards-compatible wrapper around countVacationDaysProportional for
 * all-day vacation counting (ganztaetig=true). Used by existing callers that
 * only need whole-day counting and don't have dauer/ganztaetig context.
 *
 * @deprecated Prefer countVacationDaysProportional for new code.
 */
export function countVacationDaysWithPensum(
  dateFrom: string,
  dateTo: string,
  employments: Employment[],
): number {
  return countVacationDaysProportional(dateFrom, dateTo, true, 0, employments);
}
