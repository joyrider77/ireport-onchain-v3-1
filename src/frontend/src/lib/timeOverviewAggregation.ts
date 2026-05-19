/**
 * AggregationHelper for TimeOverviewDashboard
 * Aggregates time entries, absences, holidays into PeriodData[] per period type.
 * All hours as Float (decimal).
 */

import type {
  Absence,
  AbsenceType,
  Employment,
  Holiday,
  TimeEntry,
} from "../backend.d";
import {
  getActiveEmploymentForDate,
  getEmploymentMinutesForDate,
} from "./employmentUtils";

// ─── Types ────────────────────────────────────────────────────────────────────

export type PeriodType = "day" | "week" | "month" | "year";

export interface PeriodData {
  label: string;
  dateFrom: string;
  dateTo: string;
  istArbeitszeit: number; // hours
  istFerien: number; // hours
  istAbwesenheit: number; // hours
  istFeiertag: number; // hours
  sollzeit: number; // hours
}

export interface DayDetailEntry {
  category: "arbeitszeit" | "ferien" | "abwesenheit" | "feiertag";
  label: string;
  von?: string; // hh:mm
  bis?: string; // hh:mm
  dauer: number; // hours
  description?: string;
  status?: string;
  projekt?: string;
  leistungsart?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getISOWeekNumber(date: Date): number {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  // Set to nearest Thursday: current date + 4 - current day number, make Sunday's day number 7
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export function getISOWeekYear(date: Date): number {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  return d.getUTCFullYear();
}

export function getWeekLabel(isoWeek: number, year: number): string {
  return `KW ${isoWeek} (${year})`;
}

const GERMAN_MONTHS = [
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember",
];

export function getMonthLabel(month: number, year: number): string {
  // month is 1-indexed
  return `${GERMAN_MONTHS[month - 1] ?? ""} ${year}`;
}

export function formatPeriodLabel(periodType: PeriodType, date: Date): string {
  switch (periodType) {
    case "day": {
      const d = String(date.getDate()).padStart(2, "0");
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const y = date.getFullYear();
      return `${d}.${m}.${y}`;
    }
    case "week": {
      const week = getISOWeekNumber(date);
      const year = getISOWeekYear(date);
      return getWeekLabel(week, year);
    }
    case "month":
      return getMonthLabel(date.getMonth() + 1, date.getFullYear());
    case "year":
      return String(date.getFullYear());
    default:
      return "";
  }
}

/** Build ISO date string YYYY-MM-DD from Date object (local time) */
function toIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// ─── Feiertagsberechnungsart helpers (mirror of MonatsrapportView) ──────────

/** Normalise legacy/variant values to the three canonical strings */
function normaliseFeiertag(v: string): string {
  if (
    v === "keineGutschrift" ||
    v === "wochentag_sollzeit" ||
    v === "durchschnittssoll"
  )
    return v;
  if (v === "exakt" || v === "entschaedigt") return "keineGutschrift";
  if (v === "exaktWochentag") return "wochentag_sollzeit";
  if (v === "prozentual") return "durchschnittssoll";
  return "keineGutschrift";
}

/** Returns the employment's Soll-minutes for the weekday of the given dateStr */
function getWeekdaySollMinsFromEmp(emp: Employment, dateStr: string): number {
  const d = new Date(`${dateStr}T12:00:00Z`);
  const dow = d.getUTCDay(); // 0=Sun
  const vals: Record<number, bigint> = {
    0: emp.stundenSo,
    1: emp.stundenMo,
    2: emp.stundenDi,
    3: emp.stundenMi,
    4: emp.stundenDo,
    5: emp.stundenFr,
    6: emp.stundenSa,
  };
  return Number(vals[dow] ?? 0);
}

/** Advance date by n days */
function addDays(iso: string, n: number): string {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + n);
  return toIso(d);
}

/** Get all ISO dates in a range (inclusive) */
function datesInRange(from: string, to: string): string[] {
  const dates: string[] = [];
  let cur = from;
  while (cur <= to) {
    dates.push(cur);
    cur = addDays(cur, 1);
  }
  return dates;
}

/** Sum time entry hours for a specific day */
function sumTimeEntryHoursForDay(
  entries: TimeEntry[],
  isoDate: string,
): number {
  return entries
    .filter((e) => e.date === isoDate)
    .reduce((s, e) => s + (typeof e.hours === "number" ? e.hours : 0), 0);
}

/** Get holiday for a day (if any) */
function getHolidayForDay(
  holidays: Holiday[],
  isoDate: string,
): Holiday | undefined {
  return holidays.find((h) => h.date === isoDate);
}

/**
 * Calculate Sollzeit in hours for a given date range (inclusive).
 * Sums employment minutes per day and converts to hours.
 *
 * IMPORTANT: Holidays are NOT excluded from Sollzeit — they count as both
 * Sollzeit AND Ist-Stunden, exactly like the Monatsrapport logic.
 * The full work obligation (Soll) remains even on public holidays.
 */
export function calcSollzeitForDateRange(
  employments: Employment[],
  dateFrom: string,
  dateTo: string,
  _holidays?: Holiday[], // accepted but ignored — holidays do NOT reduce Sollzeit
): number {
  if (!dateFrom || !dateTo || employments.length === 0) return 0;
  const dates = datesInRange(dateFrom, dateTo);
  let totalMinutes = 0;
  for (const iso of dates) {
    const emp = getActiveEmploymentForDate(employments, iso);
    if (emp) {
      totalMinutes += getEmploymentMinutesForDate(emp, iso);
    }
  }
  return totalMinutes / 60;
}

/** Check if an absence entry should be included (not rejected) */
function isNotRejected(absence: Absence): boolean {
  const s = String(absence.status);
  return s !== "rejected";
}

/** Check if an absence is a vacation type based on absenceTypes list */
function isVacationType(
  absence: Absence,
  absenceTypes: AbsenceType[],
): boolean {
  const t = absenceTypes.find(
    (x) => String(x.id) === String(absence.absenceTypeId),
  );
  return t?.name === "Ferien";
}

/**
 * Compute absence hours for a day.
 * Ferien = absences where absenceType.requiresApproval=true, status != rejected
 * Abwesenheit = other absences where status = approved
 */
function getAbsenceHoursForDay(
  absences: Absence[],
  absenceTypes: AbsenceType[],
  isoDate: string,
  employments: Employment[],
): { ferien: number; abwesenheit: number } {
  let ferien = 0;
  let abwesenheit = 0;
  const dayAbsences = absences.filter(
    (a) => isNotRejected(a) && a.dateFrom <= isoDate && a.dateTo >= isoDate,
  );
  for (const a of dayAbsences) {
    const emp = getActiveEmploymentForDate(employments, isoDate);
    const sollMin = emp ? getEmploymentMinutesForDate(emp, isoDate) : 0;
    let hours = 0;
    if (a.ganztaetig && sollMin > 0) {
      hours = sollMin / 60;
    } else {
      hours = Number(a.dauer) / 60;
    }
    if (isVacationType(a, absenceTypes)) {
      const absTypeForHours = absenceTypes.find(
        (at) => String(at.id) === String(a.absenceTypeId),
      );
      if (absTypeForHours && absTypeForHours.compensated === false) continue;
      ferien += hours;
    } else {
      // Only count other absences when approved AND compensated
      const absTypeForAbs = absenceTypes.find(
        (at) => String(at.id) === String(a.absenceTypeId),
      );
      if (absTypeForAbs && absTypeForAbs.compensated === false) continue;
      if (String(a.status) === "approved") {
        abwesenheit += hours;
      }
    }
  }
  return { ferien, abwesenheit };
}

/** Compute feiertag Ist-hours for a day, respecting the configured Feiertagsberechnungsart */
function getFeiertag(
  holidays: Holiday[],
  isoDate: string,
  employments: Employment[],
): number {
  const h = getHolidayForDay(holidays, isoDate);
  if (!h) return 0;
  const emp = getActiveEmploymentForDate(employments, isoDate);
  if (!emp) return 0;

  const berechnungsart = normaliseFeiertag(
    String(emp.feiertagsberechnungsart ?? "keineGutschrift"),
  );
  const factor = h.ganztaegig ? 1 : 0.5;

  if (berechnungsart === "keineGutschrift") {
    return 0;
  }

  if (berechnungsart === "wochentag_sollzeit") {
    const weekdaySoll = getWeekdaySollMinsFromEmp(emp, isoDate);
    return Math.round(weekdaySoll * factor) / 60;
  }

  if (berechnungsart === "durchschnittssoll") {
    const dayVals = [
      Number(emp.stundenMo ?? 0),
      Number(emp.stundenDi ?? 0),
      Number(emp.stundenMi ?? 0),
      Number(emp.stundenDo ?? 0),
      Number(emp.stundenFr ?? 0),
      Number(emp.stundenSa ?? 0),
      Number(emp.stundenSo ?? 0),
    ];
    const workDays = dayVals.filter((v) => v > 0).length;
    const weekTotal = dayVals.reduce((a, b) => a + b, 0);
    const avgDailyMins = workDays > 0 ? weekTotal / workDays : 0;
    return Math.round(avgDailyMins * factor) / 60;
  }

  // fallback: wochentag_sollzeit
  const weekdaySoll = getWeekdaySollMinsFromEmp(emp, isoDate);
  return Math.round(weekdaySoll * factor) / 60;
}

// ─── Aggregation by period ────────────────────────────────────────────────────

/**
 * Aggregate for a year: returns 12 PeriodData items (one per month).
 */
export function aggregateForYear(
  timeEntries: TimeEntry[],
  absences: Absence[],
  absenceTypes: AbsenceType[],
  holidays: Holiday[],
  employments: Employment[],
  year: number,
): PeriodData[] {
  return Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const dateFrom = `${year}-${String(month).padStart(2, "0")}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const dateTo = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
    const dates = datesInRange(dateFrom, dateTo);

    let istArbeitszeit = 0;
    let istFerien = 0;
    let istAbwesenheit = 0;
    let istFeiertag = 0;
    let sollzeit = 0;

    for (const iso of dates) {
      istArbeitszeit += sumTimeEntryHoursForDay(timeEntries, iso);
      const { ferien, abwesenheit } = getAbsenceHoursForDay(
        absences,
        absenceTypes,
        iso,
        employments,
      );
      istFerien += ferien;
      istAbwesenheit += abwesenheit;
      istFeiertag += getFeiertag(holidays, iso, employments);
      // Holidays are NOT subtracted from Sollzeit: the full obligation remains.
      // They are only added to Ist-Stunden (istFeiertag), same as Monatsrapport.
      const emp = getActiveEmploymentForDate(employments, iso);
      if (emp) sollzeit += getEmploymentMinutesForDate(emp, iso) / 60;
    }

    return {
      label: GERMAN_MONTHS[i] ?? "",
      dateFrom,
      dateTo,
      istArbeitszeit,
      istFerien,
      istAbwesenheit,
      istFeiertag,
      sollzeit,
    };
  });
}

/**
 * Aggregate for a month: returns PeriodData per calendar week.
 */
export function aggregateForMonth(
  timeEntries: TimeEntry[],
  absences: Absence[],
  absenceTypes: AbsenceType[],
  holidays: Holiday[],
  employments: Employment[],
  year: number,
  month: number,
): PeriodData[] {
  const firstDay = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const lastDayIso = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  const dates = datesInRange(firstDay, lastDayIso);

  const weeks = new Map<
    string,
    { kw: number; kwYear: number; dates: string[] }
  >();
  for (const iso of dates) {
    const d = new Date(`${iso}T12:00:00`);
    const kw = getISOWeekNumber(d);
    const kwYear = getISOWeekYear(d);
    const key = `${kwYear}-${kw}`;
    if (!weeks.has(key)) weeks.set(key, { kw, kwYear, dates: [] });
    weeks.get(key)!.dates.push(iso);
  }

  return Array.from(weeks.values()).map(({ kw, kwYear, dates: wDates }) => {
    let istArbeitszeit = 0;
    let istFerien = 0;
    let istAbwesenheit = 0;
    let istFeiertag = 0;
    let sollzeit = 0;

    for (const iso of wDates) {
      istArbeitszeit += sumTimeEntryHoursForDay(timeEntries, iso);
      const { ferien, abwesenheit } = getAbsenceHoursForDay(
        absences,
        absenceTypes,
        iso,
        employments,
      );
      istFerien += ferien;
      istAbwesenheit += abwesenheit;
      istFeiertag += getFeiertag(holidays, iso, employments);
      // Holidays do NOT reduce Sollzeit — the full obligation remains (Monatsrapport logic).
      const emp = getActiveEmploymentForDate(employments, iso);
      if (emp) sollzeit += getEmploymentMinutesForDate(emp, iso) / 60;
    }

    return {
      label: getWeekLabel(kw, kwYear),
      dateFrom: wDates[0] ?? "",
      dateTo: wDates[wDates.length - 1] ?? "",
      istArbeitszeit,
      istFerien,
      istAbwesenheit,
      istFeiertag,
      sollzeit,
    };
  });
}

/**
 * Aggregate for a week: returns 7 PeriodData items (Mon–Sun).
 */
export function aggregateForWeek(
  timeEntries: TimeEntry[],
  absences: Absence[],
  absenceTypes: AbsenceType[],
  holidays: Holiday[],
  employments: Employment[],
  year: number,
  isoWeek: number,
): PeriodData[] {
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const jan4Dow = jan4.getUTCDay() || 7;
  const monday = new Date(
    jan4.getTime() - (jan4Dow - 1) * 86400000 + (isoWeek - 1) * 7 * 86400000,
  );

  const GERMAN_DAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday.getTime() + i * 86400000);
    const iso = toIso(
      new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
    );
    const label = `${GERMAN_DAYS[i]} ${String(d.getUTCDate()).padStart(2, "0")}.${String(d.getUTCMonth() + 1).padStart(2, "0")}`;

    const istArbeitszeit = sumTimeEntryHoursForDay(timeEntries, iso);
    const { ferien, abwesenheit } = getAbsenceHoursForDay(
      absences,
      absenceTypes,
      iso,
      employments,
    );
    const istFeiertag = getFeiertag(holidays, iso, employments);
    // Holidays do NOT reduce Sollzeit — the full obligation remains (Monatsrapport logic).
    const emp = getActiveEmploymentForDate(employments, iso);
    const sollzeit = emp ? getEmploymentMinutesForDate(emp, iso) / 60 : 0;

    return {
      label,
      dateFrom: iso,
      dateTo: iso,
      istArbeitszeit,
      istFerien: ferien,
      istAbwesenheit: abwesenheit,
      istFeiertag,
      sollzeit,
    };
  });
}

/**
 * Aggregate for a day: returns DayDetailEntry[]
 */
export function aggregateForDay(
  timeEntries: TimeEntry[],
  absences: Absence[],
  absenceTypes: AbsenceType[],
  holidays: Holiday[],
  employments: Employment[],
  isoDate: string,
  projectNames?: Map<string, string>,
  serviceTypeNames?: Map<string, string>,
): DayDetailEntry[] {
  const result: DayDetailEntry[] = [];

  // Holiday — use same Feiertagsberechnungsart logic as getFeiertag()
  const holiday = getHolidayForDay(holidays, isoDate);
  if (holiday) {
    const dauer = getFeiertag(holidays, isoDate, employments);
    if (dauer > 0) {
      result.push({
        category: "feiertag",
        label: holiday.name,
        dauer,
      });
    }
  }

  // Time entries
  for (const e of timeEntries.filter((t) => t.date === isoDate)) {
    const projektName = projectNames?.get(String(e.projectId));
    const leistungsartName = serviceTypeNames?.get(String(e.serviceTypeId));
    result.push({
      category: "arbeitszeit",
      label: e.description || projektName || "Arbeitszeit",
      von: e.von,
      bis: e.bis,
      dauer: typeof e.hours === "number" ? e.hours : 0,
      description: e.description,
      projekt: projektName,
      leistungsart: leistungsartName,
    });
  }

  // Absences — ferien vs. abwesenheit based on absenceType
  for (const a of absences.filter(
    (ab) => isNotRejected(ab) && ab.dateFrom <= isoDate && ab.dateTo >= isoDate,
  )) {
    const emp = getActiveEmploymentForDate(employments, isoDate);
    const sollMin = emp ? getEmploymentMinutesForDate(emp, isoDate) : 0;
    const dauer =
      a.ganztaetig && sollMin > 0 ? sollMin / 60 : Number(a.dauer) / 60;
    const absType = absenceTypes.find(
      (x) => String(x.id) === String(a.absenceTypeId),
    );
    const isVacation = absType?.name === "Ferien";
    // For non-vacation absences, only show if approved
    if (!isVacation && String(a.status) !== "approved") continue;
    result.push({
      category: isVacation ? "ferien" : "abwesenheit",
      label: absType?.name ?? (isVacation ? "Ferien" : "Abwesenheit"),
      dauer,
      description: a.description,
      status: String(a.status),
    });
  }

  return result;
}
