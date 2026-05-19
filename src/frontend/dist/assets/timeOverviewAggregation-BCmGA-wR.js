import { g as getActiveEmploymentForDate, a as getEmploymentMinutesForDate } from "./employmentUtils-C-5ZbofZ.js";
function getISOWeekNumber(date) {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 864e5 + 1) / 7);
}
function getISOWeekYear(date) {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  return d.getUTCFullYear();
}
function getWeekLabel(isoWeek, year) {
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
  "Dezember"
];
function getMonthLabel(month, year) {
  return `${GERMAN_MONTHS[month - 1] ?? ""} ${year}`;
}
function formatPeriodLabel(periodType, date) {
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
function toIso(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function normaliseFeiertag(v) {
  if (v === "keineGutschrift" || v === "wochentag_sollzeit" || v === "durchschnittssoll")
    return v;
  if (v === "exakt" || v === "entschaedigt") return "keineGutschrift";
  if (v === "exaktWochentag") return "wochentag_sollzeit";
  if (v === "prozentual") return "durchschnittssoll";
  return "keineGutschrift";
}
function getWeekdaySollMinsFromEmp(emp, dateStr) {
  const d = /* @__PURE__ */ new Date(`${dateStr}T12:00:00Z`);
  const dow = d.getUTCDay();
  const vals = {
    0: emp.stundenSo,
    1: emp.stundenMo,
    2: emp.stundenDi,
    3: emp.stundenMi,
    4: emp.stundenDo,
    5: emp.stundenFr,
    6: emp.stundenSa
  };
  return Number(vals[dow] ?? 0);
}
function addDays(iso, n) {
  const d = /* @__PURE__ */ new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + n);
  return toIso(d);
}
function datesInRange(from, to) {
  const dates = [];
  let cur = from;
  while (cur <= to) {
    dates.push(cur);
    cur = addDays(cur, 1);
  }
  return dates;
}
function sumTimeEntryHoursForDay(entries, isoDate) {
  return entries.filter((e) => e.date === isoDate).reduce((s, e) => s + (typeof e.hours === "number" ? e.hours : 0), 0);
}
function getHolidayForDay(holidays, isoDate) {
  return holidays.find((h) => h.date === isoDate);
}
function calcSollzeitForDateRange(employments, dateFrom, dateTo, _holidays) {
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
function isNotRejected(absence) {
  const s = String(absence.status);
  return s !== "rejected";
}
function isVacationType(absence, absenceTypes) {
  const t = absenceTypes.find(
    (x) => String(x.id) === String(absence.absenceTypeId)
  );
  return (t == null ? void 0 : t.name) === "Ferien";
}
function getAbsenceHoursForDay(absences, absenceTypes, isoDate, employments) {
  let ferien = 0;
  let abwesenheit = 0;
  const dayAbsences = absences.filter(
    (a) => isNotRejected(a) && a.dateFrom <= isoDate && a.dateTo >= isoDate
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
        (at) => String(at.id) === String(a.absenceTypeId)
      );
      if (absTypeForHours && absTypeForHours.compensated === false) continue;
      ferien += hours;
    } else {
      const absTypeForAbs = absenceTypes.find(
        (at) => String(at.id) === String(a.absenceTypeId)
      );
      if (absTypeForAbs && absTypeForAbs.compensated === false) continue;
      if (String(a.status) === "approved") {
        abwesenheit += hours;
      }
    }
  }
  return { ferien, abwesenheit };
}
function getFeiertag(holidays, isoDate, employments) {
  const h = getHolidayForDay(holidays, isoDate);
  if (!h) return 0;
  const emp = getActiveEmploymentForDate(employments, isoDate);
  if (!emp) return 0;
  const berechnungsart = normaliseFeiertag(
    String(emp.feiertagsberechnungsart ?? "keineGutschrift")
  );
  const factor = h.ganztaegig ? 1 : 0.5;
  if (berechnungsart === "keineGutschrift") {
    return 0;
  }
  if (berechnungsart === "wochentag_sollzeit") {
    const weekdaySoll2 = getWeekdaySollMinsFromEmp(emp, isoDate);
    return Math.round(weekdaySoll2 * factor) / 60;
  }
  if (berechnungsart === "durchschnittssoll") {
    const dayVals = [
      Number(emp.stundenMo ?? 0),
      Number(emp.stundenDi ?? 0),
      Number(emp.stundenMi ?? 0),
      Number(emp.stundenDo ?? 0),
      Number(emp.stundenFr ?? 0),
      Number(emp.stundenSa ?? 0),
      Number(emp.stundenSo ?? 0)
    ];
    const workDays = dayVals.filter((v) => v > 0).length;
    const weekTotal = dayVals.reduce((a, b) => a + b, 0);
    const avgDailyMins = workDays > 0 ? weekTotal / workDays : 0;
    return Math.round(avgDailyMins * factor) / 60;
  }
  const weekdaySoll = getWeekdaySollMinsFromEmp(emp, isoDate);
  return Math.round(weekdaySoll * factor) / 60;
}
function aggregateForYear(timeEntries, absences, absenceTypes, holidays, employments, year) {
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
        employments
      );
      istFerien += ferien;
      istAbwesenheit += abwesenheit;
      istFeiertag += getFeiertag(holidays, iso, employments);
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
      sollzeit
    };
  });
}
function aggregateForMonth(timeEntries, absences, absenceTypes, holidays, employments, year, month) {
  const firstDay = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const lastDayIso = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  const dates = datesInRange(firstDay, lastDayIso);
  const weeks = /* @__PURE__ */ new Map();
  for (const iso of dates) {
    const d = /* @__PURE__ */ new Date(`${iso}T12:00:00`);
    const kw = getISOWeekNumber(d);
    const kwYear = getISOWeekYear(d);
    const key = `${kwYear}-${kw}`;
    if (!weeks.has(key)) weeks.set(key, { kw, kwYear, dates: [] });
    weeks.get(key).dates.push(iso);
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
        employments
      );
      istFerien += ferien;
      istAbwesenheit += abwesenheit;
      istFeiertag += getFeiertag(holidays, iso, employments);
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
      sollzeit
    };
  });
}
function aggregateForWeek(timeEntries, absences, absenceTypes, holidays, employments, year, isoWeek) {
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const jan4Dow = jan4.getUTCDay() || 7;
  const monday = new Date(
    jan4.getTime() - (jan4Dow - 1) * 864e5 + (isoWeek - 1) * 7 * 864e5
  );
  const GERMAN_DAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday.getTime() + i * 864e5);
    const iso = toIso(
      new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
    );
    const label = `${GERMAN_DAYS[i]} ${String(d.getUTCDate()).padStart(2, "0")}.${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    const istArbeitszeit = sumTimeEntryHoursForDay(timeEntries, iso);
    const { ferien, abwesenheit } = getAbsenceHoursForDay(
      absences,
      absenceTypes,
      iso,
      employments
    );
    const istFeiertag = getFeiertag(holidays, iso, employments);
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
      sollzeit
    };
  });
}
function aggregateForDay(timeEntries, absences, absenceTypes, holidays, employments, isoDate, projectNames, serviceTypeNames) {
  const result = [];
  const holiday = getHolidayForDay(holidays, isoDate);
  if (holiday) {
    const dauer = getFeiertag(holidays, isoDate, employments);
    if (dauer > 0) {
      result.push({
        category: "feiertag",
        label: holiday.name,
        dauer
      });
    }
  }
  for (const e of timeEntries.filter((t) => t.date === isoDate)) {
    const projektName = projectNames == null ? void 0 : projectNames.get(String(e.projectId));
    const leistungsartName = serviceTypeNames == null ? void 0 : serviceTypeNames.get(String(e.serviceTypeId));
    result.push({
      category: "arbeitszeit",
      label: e.description || projektName || "Arbeitszeit",
      von: e.von,
      bis: e.bis,
      dauer: typeof e.hours === "number" ? e.hours : 0,
      description: e.description,
      projekt: projektName,
      leistungsart: leistungsartName
    });
  }
  for (const a of absences.filter(
    (ab) => isNotRejected(ab) && ab.dateFrom <= isoDate && ab.dateTo >= isoDate
  )) {
    const emp = getActiveEmploymentForDate(employments, isoDate);
    const sollMin = emp ? getEmploymentMinutesForDate(emp, isoDate) : 0;
    const dauer = a.ganztaetig && sollMin > 0 ? sollMin / 60 : Number(a.dauer) / 60;
    const absType = absenceTypes.find(
      (x) => String(x.id) === String(a.absenceTypeId)
    );
    const isVacation = (absType == null ? void 0 : absType.name) === "Ferien";
    if (!isVacation && String(a.status) !== "approved") continue;
    result.push({
      category: isVacation ? "ferien" : "abwesenheit",
      label: (absType == null ? void 0 : absType.name) ?? (isVacation ? "Ferien" : "Abwesenheit"),
      dauer,
      description: a.description,
      status: String(a.status)
    });
  }
  return result;
}
export {
  aggregateForWeek as a,
  aggregateForMonth as b,
  aggregateForYear as c,
  aggregateForDay as d,
  calcSollzeitForDateRange as e,
  formatPeriodLabel as f,
  getISOWeekNumber as g,
  getISOWeekYear as h
};
