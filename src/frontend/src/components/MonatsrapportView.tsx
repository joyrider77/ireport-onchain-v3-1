/**
 * MonatsrapportView — druckbarer Monatsbericht pro Mitarbeiter
 * Basiert auf dem PDF-Vorlageformat.
 * Drucken: window.print() mit CSS @media print.
 */
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getActiveEmploymentForDate,
  getEmploymentMinutesForDate,
  nanosToLocalIsoDate,
} from "@/lib/employmentUtils";
import { formatHours, minutesToHHMM } from "@/lib/timeFormat";
import { useActor } from "@caffeineai/core-infrastructure";
import { Printer } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { createActor } from "../backend";
import type {
  Absence,
  AbsenceType,
  Company,
  Employee,
  Employment,
  Expense,
  ExpenseType,
  Holiday,
  Project,
  ServiceType,
  TimeBalanceCorrection,
  TimeEntry,
  VacationBalance,
  WorkTimeBalance,
} from "../backend.d";
import { useAuth } from "../hooks/useAuthStore";

type AnyActor = Record<string, (...args: unknown[]) => Promise<unknown>>;
const toAny = (a: unknown): AnyActor => a as AnyActor;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtDate(iso: string): string {
  if (!iso) return "–";
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}
function fmtCHF(n: number): string {
  return n.toLocaleString("de-CH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
function pad2(n: number): string {
  return String(n).padStart(2, "0");
}
function minutesToDisplay(mins: number): string {
  const sign = mins < 0 ? "-" : "";
  const abs = Math.abs(mins);
  return `${sign}${Math.floor(abs / 60)}:${pad2(abs % 60)}`;
}
function minutesToDisplaySigned(mins: number): string {
  if (mins === 0) return "0:00";
  const prefix = mins > 0 ? "+" : "-";
  const abs = Math.abs(mins);
  return `${prefix}${Math.floor(abs / 60)}:${pad2(abs % 60)}`;
}
function hoursToMinutes(h: number): number {
  return Math.round(h * 60);
}

/** Format total hours as hhh:mm (e.g. 104:30) */
function totalHoursDisplay(mins: number): string {
  const abs = Math.abs(mins);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return `${h}:${pad2(m)}`;
}

/** Get all calendar days for a given year-month (1-based) */
function daysInMonth(year: number, month: number): string[] {
  const count = new Date(year, month, 0).getDate();
  return Array.from({ length: count }, (_, i) => {
    const d = i + 1;
    return `${year}-${pad2(month)}-${pad2(d)}`;
  });
}

/** Month names */
const MONTH_NAMES = [
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

/** Normalises legacy feiertagsberechnungsart values to canonical values */
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

// ─── Types ────────────────────────────────────────────────────────────────────

interface MonthlyData {
  employee: Employee;
  employment: Employment | null;
  timeEntries: TimeEntry[];
  approvedExpenses: Expense[];
  absences: Absence[];
  absenceTypes: AbsenceType[];
  projects: Project[];
  serviceTypes: ServiceType[];
  expenseTypes: ExpenseType[];
  vacationBalances: VacationBalance[];
  workBalance: WorkTimeBalance | null;
  company: Company | null;
  employments: Employment[];
  customers: { id: bigint; name: string }[];
  timeBalanceCorrections: TimeBalanceCorrection[];
  holidays: Holiday[];
}

// ─── Report Print Styles ──────────────────────────────────────────────────────

const PRINT_STYLES = `
@media print {
  .no-print { display: none !important; }
  /* Hide fixed/sticky elements (chat button, sidebar, header) during print */
  .fixed, [style*="position: fixed"], [style*="position:fixed"] { display: none !important; }
  nav, aside, header { display: none !important; }
  #monatsrapport-print {
    position: absolute !important;
    left: 0 !important;
    top: 0 !important;
    width: 100% !important;
    height: auto !important;
    overflow: visible !important;
    background: white !important;
    padding: 0 !important;
    margin: 0 !important;
  }
  body {
    background: white !important;
    margin: 0 !important;
    padding: 0 !important;
  }
  #monatsrapport-print table {
    page-break-inside: auto;
  }
  #monatsrapport-print tr {
    page-break-inside: avoid;
    page-break-after: auto;
  }
  #monatsrapport-print .report-section {
    page-break-inside: avoid;
  }
  img {
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }
}
@page {
  margin: 15mm;
  size: A4;
}
`;

// ─── Main Component ───────────────────────────────────────────────────────────

interface MonatsrapportViewProps {
  employees: Employee[];
  isAdminOrManager: boolean;
}

export function MonatsrapportView({
  employees,
  isAdminOrManager,
}: MonatsrapportViewProps) {
  const { employeeId } = useAuth();
  const { actor, isFetching } = useActor(createActor);

  const now = new Date();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(
    () => employeeId ?? "",
  );
  const [selectedMonth, setSelectedMonth] = useState<number>(
    now.getMonth() + 1,
  );
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<MonthlyData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Non-admin users can only see themselves
  const effectiveEmployeeId = isAdminOrManager
    ? selectedEmployeeId
    : (employeeId ?? "");

  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i);
  const months = MONTH_NAMES.map((label, i) => ({ value: i + 1, label }));

  // Dynamic document title for PDF naming (e.g. "Monatsrapport 04.2026 Max Mustermann")
  useEffect(() => {
    if (!data) return;
    const originalTitle = document.title;
    const emp = data.employee;
    const mm = String(selectedMonth).padStart(2, "0");
    document.title = `Monatsrapport ${mm}.${selectedYear} ${emp.firstName} ${emp.lastName}`;
    return () => {
      document.title = originalTitle;
    };
  }, [data, selectedMonth, selectedYear]);

  const generateReport = useCallback(async () => {
    if (!actor || isFetching || !effectiveEmployeeId) return;
    setIsLoading(true);
    setError(null);
    setData(null);

    try {
      const empId = BigInt(effectiveEmployeeId);
      const dateFrom = `${selectedYear}-${pad2(selectedMonth)}-01`;
      const lastDay = new Date(selectedYear, selectedMonth, 0).getDate();
      const dateTo = `${selectedYear}-${pad2(selectedMonth)}-${pad2(lastDay)}`;

      const a = toAny(actor);

      const [
        empRes,
        companyRes,
        timeRes,
        expenseRes,
        absenceRes,
        absTypeRes,
        projRes,
        svcRes,
        expTypeRes,
        vacRes,
        employmentsRes,
        customersRes,
        tbcRes,
        holidaysRes,
      ] = await Promise.all([
        a.getMyEmployee() as Promise<{ __kind__: string; ok?: Employee }>,
        a.getMyCompany() as Promise<{ __kind__: string; ok?: Company }>,
        a.listTimeEntries({ dateFrom, dateTo, employeeId: empId }) as Promise<
          TimeEntry[]
        >,
        a.listExpenses({ dateFrom, dateTo, employeeId: empId }) as Promise<
          Expense[]
        >,
        a.listAbsences({ dateFrom, dateTo, employeeId: empId }) as Promise<
          Absence[]
        >,
        a.listAbsenceTypes() as Promise<AbsenceType[]>,
        a.listProjects() as Promise<Project[]>,
        a.listServiceTypes() as Promise<ServiceType[]>,
        a.listExpenseTypes() as Promise<ExpenseType[]>,
        a.listVacationBalances(empId) as Promise<{
          __kind__: string;
          ok?: VacationBalance[];
        }>,
        a.listEmployments(empId) as Promise<{
          __kind__: string;
          ok?: Employment[];
        }>,
        a.listCustomers() as Promise<{ id: bigint; name: string }[]>,
        (async () => {
          try {
            const res = (await a.listTimeBalanceCorrections(empId)) as {
              __kind__: string;
              ok?: TimeBalanceCorrection[];
            };
            return res.__kind__ === "ok" ? (res.ok ?? []) : [];
          } catch {
            return [];
          }
        })(),
        (async () => {
          try {
            return (await a.listHolidays()) as Holiday[];
          } catch {
            return [] as Holiday[];
          }
        })(),
      ]);

      // Get work balance for the full month
      let workBalance: WorkTimeBalance | null = null;
      try {
        const wbRes = (await a.getEmployeeWorkTimeBalance(
          empId,
          dateFrom,
          dateTo,
        )) as {
          __kind__: string;
          ok?: WorkTimeBalance;
        };
        if (wbRes.__kind__ === "ok" && wbRes.ok) workBalance = wbRes.ok;
      } catch {
        /* non-fatal */
      }

      // Use admin-specific employee lookup if viewing another employee
      let employee: Employee | null = null;
      if (isAdminOrManager && String(empId) !== String(employeeId)) {
        const emps = (await a.listEmployees()) as Employee[];
        employee =
          emps.find((e) => String(e.id) === effectiveEmployeeId) ?? null;
      } else {
        employee = empRes.__kind__ === "ok" ? (empRes.ok ?? null) : null;
      }

      if (!employee) {
        setError("Mitarbeiter nicht gefunden");
        setIsLoading(false);
        return;
      }

      const employments =
        employmentsRes.__kind__ === "ok" ? (employmentsRes.ok ?? []) : [];
      const employment =
        getActiveEmploymentForDate(employments, dateTo) ??
        getActiveEmploymentForDate(employments, dateFrom) ??
        (employments.length > 0 ? employments[employments.length - 1] : null);

      const approvedExpenses = (expenseRes ?? []).filter(
        (e) => e.status === "approved",
      );

      setData({
        employee,
        employment,
        employments,
        timeEntries: timeRes ?? [],
        approvedExpenses,
        absences: absenceRes ?? [],
        absenceTypes: absTypeRes ?? [],
        projects: projRes ?? [],
        serviceTypes: svcRes ?? [],
        expenseTypes: expTypeRes ?? [],
        vacationBalances: vacRes.__kind__ === "ok" ? (vacRes.ok ?? []) : [],
        workBalance,
        company: companyRes.__kind__ === "ok" ? (companyRes.ok ?? null) : null,
        customers: (customersRes ?? []) as { id: bigint; name: string }[],
        timeBalanceCorrections: tbcRes,
        holidays: holidaysRes ?? [],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler");
    } finally {
      setIsLoading(false);
    }
  }, [
    actor,
    isFetching,
    effectiveEmployeeId,
    selectedYear,
    selectedMonth,
    isAdminOrManager,
    employeeId,
  ]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <style>{PRINT_STYLES}</style>

      {/* Selection form */}
      <div
        className="bg-card border border-border rounded-lg p-5 no-print"
        data-ocid="monatsrapport.form"
      >
        <h2 className="text-base font-semibold text-foreground mb-4">
          Monatsrapport generieren
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Monat */}
          <div className="space-y-1.5">
            <Label>Monat</Label>
            <Select
              value={String(selectedMonth)}
              onValueChange={(v) => setSelectedMonth(Number(v))}
            >
              <SelectTrigger data-ocid="monatsrapport.month_select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((m) => (
                  <SelectItem key={m.value} value={String(m.value)}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Jahr */}
          <div className="space-y-1.5">
            <Label>Jahr</Label>
            <Select
              value={String(selectedYear)}
              onValueChange={(v) => setSelectedYear(Number(v))}
            >
              <SelectTrigger data-ocid="monatsrapport.year_select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Mitarbeiter – nur für Admin/Manager */}
          {isAdminOrManager && (
            <div className="space-y-1.5">
              <Label>Mitarbeiter</Label>
              <Select
                value={selectedEmployeeId}
                onValueChange={setSelectedEmployeeId}
              >
                <SelectTrigger data-ocid="monatsrapport.employee_select">
                  <SelectValue placeholder="Mitarbeiter wählen…" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((e) => (
                    <SelectItem key={String(e.id)} value={String(e.id)}>
                      {e.firstName} {e.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Generate button */}
          <div className="space-y-1.5 flex flex-col justify-end">
            <Button
              type="button"
              onClick={generateReport}
              disabled={isLoading || !effectiveEmployeeId}
              data-ocid="monatsrapport.generate_button"
            >
              {isLoading ? "Wird geladen…" : "Rapport generieren"}
            </Button>
          </div>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 text-sm text-destructive">
          Fehler: {error}
        </div>
      )}

      {/* Report */}
      {data && !isLoading && (
        <div>
          {/* Print button */}
          <div className="flex justify-end mb-4 no-print">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrint}
              className="gap-2"
              data-ocid="monatsrapport.print_button"
            >
              <Printer className="w-4 h-4" />
              Drucken / Als PDF speichern
            </Button>
          </div>

          {/* Printable report */}
          <div
            id="monatsrapport-print"
            className="bg-white rounded-lg border border-border"
            style={{
              fontFamily: "system-ui, sans-serif",
              fontSize: "13px",
              color: "#1a1a1a",
            }}
          >
            <ReportContent
              data={data}
              year={selectedYear}
              month={selectedMonth}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Report Content ───────────────────────────────────────────────────────────

function ReportContent({
  data,
  year,
  month,
}: { data: MonthlyData; year: number; month: number }) {
  const {
    employee,
    employment,
    employments,
    timeEntries,
    approvedExpenses,
    absences,
    absenceTypes,
    projects,
    serviceTypes,
    expenseTypes,
    vacationBalances,
    workBalance,
    company,
    customers,
    timeBalanceCorrections,
    holidays,
  } = data;

  const monthName = MONTH_NAMES[month - 1];
  const today = new Date().toLocaleDateString("de-CH");
  const days = daysInMonth(year, month);
  const issueDate = fmtDate(new Date().toISOString().slice(0, 10));

  // Helpers
  const projById = (id: bigint) => projects.find((p) => p.id === id);
  const projName = (id: bigint) => projById(id)?.name ?? String(id);
  const projCode = (id: bigint) => projById(id)?.code ?? "";
  const projCustomerId = (id: bigint) => projById(id)?.customerId;
  const customerName = (cid: bigint | undefined) =>
    cid
      ? (customers.find((c) => String(c.id) === String(cid))?.name ??
        String(cid))
      : "–";
  const svcName = (id: bigint) =>
    serviceTypes.find((s) => s.id === id)?.name ?? String(id);
  const expTypeName = (id: bigint) =>
    expenseTypes.find((e) => e.id === id)?.name ?? String(id);
  const absTypeName = (id: bigint) =>
    absenceTypes.find((a) => a.id === id)?.name ?? String(id);

  /**
   * Calculate Ist-minutes credit for holidays on a given date,
   * based on the employee's Feiertagsberechnungsart.
   */
  function calcHolidayIstMins(dateStr: string): number {
    const dayHolidays = holidays.filter((h) => h.date === dateStr);
    if (dayHolidays.length === 0) return 0;
    const emp = getActiveEmploymentForDate(employments, dateStr);
    if (!emp) return 0;

    const berechnungsart = normaliseFeiertag(
      String(emp.feiertagsberechnungsart ?? "keineGutschrift"),
    );

    // Pre-compute weekly average for "durchschnittssoll"
    let avgDailyMins = 0;
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
      avgDailyMins = workDays > 0 ? weekTotal / workDays : 0;
    }

    let total = 0;
    for (const h of dayHolidays) {
      const factor = h.ganztaegig ? 1 : 0.5;

      if (berechnungsart === "keineGutschrift") {
        // No Ist-hours credited
        total += 0;
      } else if (berechnungsart === "wochentag_sollzeit") {
        // Credit = Soll-minutes of the specific weekday
        const weekdaySoll = getWeekdaySollMinsFromEmp(emp, dateStr);
        total += Math.round(weekdaySoll * factor);
      } else if (berechnungsart === "durchschnittssoll") {
        // Credit = average daily Soll-minutes
        total += Math.round(avgDailyMins * factor);
      }
    }
    return total;
  }

  // Employment info
  const funktion = employment?.funktion ?? "–";
  const pensum = employment ? `${employment.pensum}%` : "–";
  const vonDate = employment ? nanosToLocalIsoDate(employment.von) : null;
  const bisDate = employment?.bis ? nanosToLocalIsoDate(employment.bis) : null;
  const anstellungDatum = vonDate ? fmtDate(vonDate) : "–";
  const beschaeftigungLabel = bisDate
    ? `${anstellungDatum} – ${fmtDate(bisDate)}`
    : `ab ${anstellungDatum}`;

  // ─── 1. Leistungen grouped by Kunde/Projekt/Leistungsart ─────────────────
  type LeistungGroup = {
    kundeName: string;
    projektName: string;
    projektCode: string;
    leistungsart: string;
    stunden: number;
  };
  const leistungMap = new Map<string, LeistungGroup>();
  for (const t of timeEntries) {
    const cid = projCustomerId(t.projectId);
    const key = `${cid ?? ""}__${t.projectId}__${t.serviceTypeId}`;
    if (!leistungMap.has(key)) {
      leistungMap.set(key, {
        kundeName: customerName(cid),
        projektName: projName(t.projectId),
        projektCode: projCode(t.projectId),
        leistungsart: svcName(t.serviceTypeId),
        stunden: 0,
      });
    }
    leistungMap.get(key)!.stunden += t.hours;
  }
  const leistungGroups = Array.from(leistungMap.values());
  const totalLeistungStunden = leistungGroups.reduce(
    (s, g) => s + g.stunden,
    0,
  );

  // ─── 2. Spesen grouped by Kunde/Projekt ──────────────────────────────────
  type SpeseProjGroup = {
    label: string; // "KundeName, ProjektName"
    reimbursement: number;
  };
  const spesenProjMap = new Map<string, SpeseProjGroup>();
  for (const e of approvedExpenses) {
    // Only include expenses that have a projektId set
    if (e.projektId == null) continue;
    const key = String(e.projektId);
    if (!spesenProjMap.has(key)) {
      const proj = projects.find((p) => String(p.id) === String(e.projektId));
      const cid = proj?.customerId;
      const kName = cid
        ? (customers.find((c) => String(c.id) === String(cid))?.name ?? "–")
        : "–";
      const pName = proj?.name ?? String(e.projektId);
      spesenProjMap.set(key, {
        label: `${kName}, ${pName}`,
        reimbursement: 0,
      });
    }
    spesenProjMap.get(key)!.reimbursement += e.reimbursementCHF;
  }
  const spesenProjGroups = Array.from(spesenProjMap.values());
  const totalSpesenReimbursement = spesenProjGroups.reduce(
    (s, g) => s + g.reimbursement,
    0,
  );

  // ─── 3. Gleitzeitsaldo Monat ─────────────────────────────────────────────
  // Calculate from daily data for accuracy
  const vacationAbsenceType = absenceTypes.find(
    (t) => t.name.toLowerCase() === "ferien" && t.requiresApproval,
  );

  let monthSollMins = 0;
  let monthIstMins = 0;
  let monthAbsenzMins = 0;
  let monthFerienMins = 0;
  let monthFeiertragMins = 0;

  for (const dateStr of days) {
    const emp = getActiveEmploymentForDate(employments, dateStr);
    const sollMins = emp ? getEmploymentMinutesForDate(emp, dateStr) : 0;
    monthSollMins += sollMins;

    const dayEntries = timeEntries.filter((t) => t.date === dateStr);
    let dayIst = dayEntries.reduce((s, t) => s + hoursToMinutes(t.hours), 0);

    for (const a of absences) {
      if (dateStr < a.dateFrom || dateStr > a.dateTo) continue;
      const absType = absenceTypes.find(
        (t) => String(t.id) === String(a.absenceTypeId),
      );
      const isVacation =
        vacationAbsenceType && a.absenceTypeId === vacationAbsenceType.id;

      if (isVacation && a.status === "approved") {
        const mins = a.ganztaetig
          ? emp
            ? getEmploymentMinutesForDate(emp, dateStr)
            : 0
          : Number(a.dauer);
        dayIst += mins;
        monthFerienMins += mins;
      } else if (absType?.compensated && a.status === "approved") {
        const mins = a.ganztaetig
          ? emp
            ? getEmploymentMinutesForDate(emp, dateStr)
            : 0
          : Number(a.dauer);
        dayIst += mins;
        monthAbsenzMins += mins;
      }
    }

    // Add holiday Ist-hours
    const hMins = calcHolidayIstMins(dateStr);
    dayIst += hMins;
    monthFeiertragMins += hMins;

    monthIstMins += dayIst;
  }

  // Saldokorrektionen: sum all corrections whose wirkungsdatum falls within the selected month.
  // wirkungsdatum is stored as Unix seconds (bigint) — multiply by 1000 to get ms.
  const monthDateFrom = `${year}-${pad2(month)}-01`;
  const monthLastDay = new Date(year, month, 0).getDate();
  const monthDateTo = `${year}-${pad2(month)}-${pad2(monthLastDay)}`;

  const saldokorrekturMins = (() => {
    let total = 0;
    for (const c of timeBalanceCorrections) {
      // Convert wirkungsdatum (Unix seconds bigint) to ISO date
      const ms = Number(c.wirkungsdatum) * 1000;
      const d = new Date(ms);
      const y = d.getFullYear();
      const mo = String(d.getMonth() + 1).padStart(2, "0");
      const da = String(d.getDate()).padStart(2, "0");
      const isoDate = `${y}-${mo}-${da}`;
      if (isoDate < monthDateFrom || isoDate > monthDateTo) continue;
      // dauer is stored in minutes as bigint
      const mins = Number(c.dauer);
      if (c.typ === "gutschrift") {
        total += mins;
      } else {
        total -= mins;
      }
    }
    return total;
  })();

  // Use workBalance for soll/ist if available (more authoritative)
  // workBalance.istStunden already includes compensated absences and approved vacations.
  const displaySollMins = workBalance
    ? Math.round(Number(workBalance.sollStunden))
    : monthSollMins;
  const displayIstMins = workBalance
    ? Math.round(Number(workBalance.istStunden))
    : monthIstMins;
  // Total = Soll-Zeit - Ist-Zeit
  const displayTotalMins = displaySollMins - displayIstMins;
  const displaySaldoMins = displayIstMins - displaySollMins;

  // ─── Feriensaldo ─────────────────────────────────────────────────────────
  // Calculate used vacation days up to end of this month
  const dateFrom = `${year}-${pad2(month)}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const dateTo = `${year}-${pad2(month)}-${pad2(lastDay)}`;
  void dateFrom;
  void dateTo;

  const yearBalances = vacationBalances.filter(
    (vb) => Number(vb.kalenderjahr) === year,
  );
  // totalVacationMinutes kept for legacy — actual days computed below using /100
  const totalVacationMinutes = yearBalances.reduce(
    (s, vb) => s + Number(vb.dauer),
    0,
  );
  // Standard work day minutes from employment.
  // stundenMo/Di/etc are stored in minutes as bigint (not nanoseconds),
  // so we just convert to Number directly — no division by 1_000_000.
  const stdDayMins = (() => {
    if (!employment) return 480; // default 8h fallback
    const dayValues = [
      Number(employment.stundenMo ?? 0),
      Number(employment.stundenDi ?? 0),
      Number(employment.stundenMi ?? 0),
      Number(employment.stundenDo ?? 0),
      Number(employment.stundenFr ?? 0),
    ].filter((v) => v > 0);
    if (dayValues.length === 0) return 480;
    // Use the maximum workday minutes as the standard day reference
    return Math.max(...dayValues);
  })();

  const approvedVacations = absences.filter(
    (a) =>
      a.status === "approved" &&
      vacationAbsenceType &&
      a.absenceTypeId === vacationAbsenceType.id,
  );

  let usedVacationDays = 0;
  for (const a of approvedVacations) {
    for (const dateStr of daysInMonth(year, month)) {
      if (dateStr < a.dateFrom || dateStr > a.dateTo) continue;
      const emp = getActiveEmploymentForDate(employments, dateStr);
      const dayMins = emp ? getEmploymentMinutesForDate(emp, dateStr) : 0;
      if (dayMins <= 0) continue; // no pensum → skip
      if (a.ganztaetig) {
        usedVacationDays += 1;
      } else {
        // Proportional: entered hours / standard work day hours
        const refDayMins = stdDayMins > 0 ? stdDayMins : dayMins;
        usedVacationDays += Number(a.dauer) / refDayMins;
      }
    }
  }

  // totalVacationMinutes from vacationBalances is stored as centiduration (dauer * 100 = days * 100)
  // Actually dauer is stored as 1/100 days (i.e. 2500 = 25 days). Divide by 100 to get days.
  const totalVacationDays = (vacationBalances ?? [])
    .filter((vb) => Number(vb.kalenderjahr) === year)
    .reduce((s, vb) => s + Number(vb.dauer) / 100, 0);
  void totalVacationMinutes; // suppress unused warning
  const remainingVacationDays = totalVacationDays - usedVacationDays;

  // ─── 6. Spesen im Detail ─────────────────────────────────────────────────
  const sortedExpenses = [...approvedExpenses].sort((a, b) =>
    a.date < b.date ? -1 : a.date > b.date ? 1 : 0,
  );
  const totalDetailReimbursement = sortedExpenses.reduce(
    (s, e) => s + e.reimbursementCHF,
    0,
  );

  // ─── 8. Spesenabrechnung grouped by Spesenart ────────────────────────────
  type SpesenabrType = { name: string; total: number };
  const spesenArtMap = new Map<string, SpesenabrType>();
  for (const e of approvedExpenses) {
    const key = String(e.expenseTypeId);
    if (!spesenArtMap.has(key))
      spesenArtMap.set(key, { name: expTypeName(e.expenseTypeId), total: 0 });
    spesenArtMap.get(key)!.total += e.reimbursementCHF;
  }
  const spesenAbrGroups = Array.from(spesenArtMap.values());
  const totalSpesenAbr = spesenAbrGroups.reduce((s, g) => s + g.total, 0);

  // ─── 9. Gleitzeit pro Tag ────────────────────────────────────────────────
  type DayRow = {
    dateStr: string;
    dayLabel: string;
    soll: number;
    ist: number;
    tagesGleitzeit: number;
    isWeekend: boolean;
  };

  const dayRows: DayRow[] = days.map((dateStr) => {
    const d = new Date(`${dateStr}T12:00:00Z`);
    const isoDay = d.getUTCDay() === 0 ? 7 : d.getUTCDay();
    const dayLabel = d.toLocaleDateString("de-CH", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
      timeZone: "UTC",
    });
    const isWeekend = isoDay === 6 || isoDay === 7;

    const emp = getActiveEmploymentForDate(employments, dateStr);
    const sollMins = emp ? getEmploymentMinutesForDate(emp, dateStr) : 0;

    const dayEntries = timeEntries.filter((t) => t.date === dateStr);
    let istMins = dayEntries.reduce((s, t) => s + hoursToMinutes(t.hours), 0);

    for (const a of absences) {
      if (dateStr < a.dateFrom || dateStr > a.dateTo) continue;
      const absType = absenceTypes.find(
        (t) => String(t.id) === String(a.absenceTypeId),
      );
      const isVacation =
        vacationAbsenceType && a.absenceTypeId === vacationAbsenceType.id;
      if (!absType?.compensated && !isVacation) continue;
      if (a.status !== "approved") continue;
      if (a.ganztaetig) {
        istMins += emp ? getEmploymentMinutesForDate(emp, dateStr) : 0;
      } else {
        istMins += Number(a.dauer);
      }
    }

    // Add holiday Ist-hours based on Feiertagsberechnungsart
    istMins += calcHolidayIstMins(dateStr);

    return {
      dateStr,
      dayLabel,
      soll: sollMins,
      ist: istMins,
      tagesGleitzeit: istMins - sollMins,
      isWeekend,
    };
  });

  // ─── 10. Zeiterfassung chronological ────────────────────────────────────
  const sortedTimeEntries = [...timeEntries].sort((a, b) =>
    a.date < b.date ? -1 : a.date > b.date ? 1 : 0,
  );
  const totalZeitMins = sortedTimeEntries.reduce(
    (s, t) => s + hoursToMinutes(t.hours),
    0,
  );

  // ─── Render ────────────────────────────────────────────────────────────────

  const sectionTitle = (num: string, title: string) => (
    <div
      style={{
        backgroundColor: "#004466",
        color: "white",
        padding: "6px 12px",
        fontWeight: "bold",
        fontSize: "13px",
        marginBottom: "0",
      }}
    >
      {num}. {title}
    </div>
  );

  const tableHeaderStyle: React.CSSProperties = {
    backgroundColor: "#e8f0f7",
    borderBottom: "2px solid #004466",
    padding: "5px 8px",
    textAlign: "left",
    fontSize: "11px",
    fontWeight: "600",
    color: "#004466",
    whiteSpace: "nowrap",
  };
  const tdStyle: React.CSSProperties = {
    padding: "4px 8px",
    borderBottom: "1px solid #eee",
    fontSize: "12px",
  };
  const tdRightStyle: React.CSSProperties = {
    ...tdStyle,
    textAlign: "right",
    fontVariantNumeric: "tabular-nums",
  };
  const footerTdStyle: React.CSSProperties = {
    ...tdStyle,
    backgroundColor: "#e8f0f7",
    fontWeight: "bold",
    borderTop: "2px solid #004466",
  };
  const footerTdRightStyle: React.CSSProperties = {
    ...tdRightStyle,
    backgroundColor: "#e8f0f7",
    fontWeight: "bold",
    borderTop: "2px solid #004466",
  };

  return (
    <div style={{ padding: "24px", maxWidth: "900px", margin: "0 auto" }}>
      {/* ── Header ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "20px",
        }}
      >
        {/* Left: Logo ABOVE company name */}
        <div>
          {company?.logoUrl && company.logoUrl.length > 0 && (
            <img
              src={company.logoUrl}
              alt="Logo"
              style={{
                height: "39px",
                maxWidth: "126px",
                marginBottom: "10px",
                display: "block",
                objectFit: "contain",
                printColorAdjust: "exact",
              }}
            />
          )}
          <div
            style={{ fontWeight: "bold", fontSize: "20px", color: "#004466" }}
          >
            {company?.name ?? "Firma"}
          </div>
          {company?.address && (
            <div style={{ fontSize: "12px", color: "#666", marginTop: "2px" }}>
              {company.address}
            </div>
          )}
        </div>
        {/* Right: Rapport title */}
        <div style={{ textAlign: "right" }}>
          <div
            style={{ fontWeight: "bold", fontSize: "16px", color: "#004466" }}
          >
            Monatsrapport
          </div>
          <div style={{ fontSize: "13px", color: "#333", marginTop: "4px" }}>
            {monthName} {year}
          </div>
          <div style={{ fontSize: "11px", color: "#888", marginTop: "2px" }}>
            Ausgestellt am: {issueDate}
          </div>
        </div>
      </div>

      {/* ── Mitarbeiter Info ── */}
      <div
        style={{
          border: "1px solid #ccd9e3",
          borderRadius: "4px",
          padding: "12px 16px",
          marginBottom: "20px",
          backgroundColor: "#f8fbfd",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "8px",
          }}
        >
          <div>
            <span style={{ color: "#666", fontSize: "11px" }}>Mitarbeiter</span>
            <br />
            <strong>
              {employee.firstName} {employee.lastName}
            </strong>
          </div>
          <div>
            <span style={{ color: "#666", fontSize: "11px" }}>E-Mail</span>
            <br />
            <strong>{employee.email}</strong>
          </div>
          <div>
            <span style={{ color: "#666", fontSize: "11px" }}>Funktion</span>
            <br />
            <strong>{funktion}</strong>
          </div>
          <div>
            <span style={{ color: "#666", fontSize: "11px" }}>Pensum</span>
            <br />
            <strong>{pensum}</strong>
          </div>
          <div>
            <span style={{ color: "#666", fontSize: "11px" }}>
              Beschäftigung
            </span>
            <br />
            <strong>{beschaeftigungLabel}</strong>
          </div>
          <div>
            <span style={{ color: "#666", fontSize: "11px" }}>
              Berichtsmonat
            </span>
            <br />
            <strong>
              {monthName} {year}
            </strong>
          </div>
        </div>
      </div>

      {/* ── 1. Leistungen ── */}
      <div style={{ marginBottom: "20px" }} className="report-section">
        {sectionTitle("1", "Leistungen (Zeiterfassungen)")}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            border: "1px solid #ccd9e3",
          }}
        >
          <thead>
            <tr>
              <th style={tableHeaderStyle}>Kunde</th>
              <th style={tableHeaderStyle}>Projekt</th>
              <th style={tableHeaderStyle}>Leistungsart</th>
              <th style={{ ...tableHeaderStyle, textAlign: "right" }}>
                Stunden
              </th>
            </tr>
          </thead>
          <tbody>
            {leistungGroups.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  style={{
                    ...tdStyle,
                    color: "#888",
                    textAlign: "center",
                    padding: "12px",
                  }}
                >
                  Keine Zeiteinträge
                </td>
              </tr>
            ) : (
              leistungGroups.map((g) => (
                <tr key={`${g.kundeName}__${g.projektName}__${g.leistungsart}`}>
                  <td style={tdStyle}>{g.kundeName}</td>
                  <td style={tdStyle}>
                    {g.projektCode ? `[${g.projektCode}] ` : ""}
                    {g.projektName}
                  </td>
                  <td style={tdStyle}>{g.leistungsart}</td>
                  <td style={tdRightStyle}>{formatHours(g.stunden)}</td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} style={footerTdStyle}>
                Total
              </td>
              <td style={footerTdRightStyle}>
                {formatHours(totalLeistungStunden)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* ── 2. Spesen (gruppiert nach Kunde/Projekt) ── */}
      <div style={{ marginBottom: "20px" }} className="report-section">
        {sectionTitle("2", "Spesen")}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            border: "1px solid #ccd9e3",
          }}
        >
          <thead>
            <tr>
              <th style={tableHeaderStyle}>Kunde, Projekt</th>
              <th style={{ ...tableHeaderStyle, textAlign: "right" }}>
                Rückerstattung CHF
              </th>
            </tr>
          </thead>
          <tbody>
            {spesenProjGroups.length === 0 ? (
              <tr>
                <td
                  colSpan={2}
                  style={{
                    ...tdStyle,
                    color: "#888",
                    textAlign: "center",
                    padding: "12px",
                  }}
                >
                  Keine genehmigten Spesen
                </td>
              </tr>
            ) : (
              spesenProjGroups.map((g) => (
                <tr key={g.label}>
                  <td style={tdStyle}>{g.label}</td>
                  <td style={tdRightStyle}>
                    {g.reimbursement > 0 ? fmtCHF(g.reimbursement) : "–"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
          {spesenProjGroups.length > 0 && (
            <tfoot>
              <tr>
                <td style={footerTdStyle}>Total</td>
                <td style={footerTdRightStyle}>
                  {totalSpesenReimbursement > 0
                    ? fmtCHF(totalSpesenReimbursement)
                    : "–"}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* ── 3. Gleitzeitsaldo Monat ── */}
      <div style={{ marginBottom: "4px" }} className="report-section">
        {sectionTitle("3", "Gleitzeitsaldo Monat")}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            border: "1px solid #ccd9e3",
          }}
        >
          <thead>
            <tr>
              <th style={tableHeaderStyle}>Position</th>
              <th style={{ ...tableHeaderStyle, textAlign: "right" }}>hh:mm</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={tdStyle}>Soll-Zeit</td>
              <td style={tdRightStyle}>{minutesToDisplay(displaySollMins)}</td>
            </tr>
            <tr>
              <td style={tdStyle}>Ist-Zeit</td>
              <td style={tdRightStyle}>{minutesToDisplay(displayIstMins)}</td>
            </tr>
            <tr>
              <td
                style={{
                  ...tdStyle,
                  paddingLeft: "24px",
                  color: "#666",
                  fontSize: "11px",
                }}
              >
                davon Saldokorrektur
              </td>
              <td style={{ ...tdRightStyle, color: "#666", fontSize: "11px" }}>
                {saldokorrekturMins !== 0
                  ? minutesToDisplaySigned(saldokorrekturMins)
                  : "0:00"}
              </td>
            </tr>
            <tr>
              <td
                style={{
                  ...tdStyle,
                  paddingLeft: "24px",
                  color: "#666",
                  fontSize: "11px",
                }}
              >
                davon Abwesenheiten
              </td>
              <td style={{ ...tdRightStyle, color: "#666", fontSize: "11px" }}>
                {minutesToDisplay(monthAbsenzMins)}
              </td>
            </tr>
            <tr>
              <td
                style={{
                  ...tdStyle,
                  paddingLeft: "24px",
                  color: "#666",
                  fontSize: "11px",
                }}
              >
                davon Ferien
              </td>
              <td style={{ ...tdRightStyle, color: "#666", fontSize: "11px" }}>
                {minutesToDisplay(monthFerienMins)}
              </td>
            </tr>
            {monthFeiertragMins > 0 && (
              <tr>
                <td
                  style={{
                    ...tdStyle,
                    paddingLeft: "24px",
                    color: "#666",
                    fontSize: "11px",
                  }}
                >
                  davon Feiertage
                </td>
                <td
                  style={{ ...tdRightStyle, color: "#666", fontSize: "11px" }}
                >
                  {minutesToDisplay(monthFeiertragMins)}
                </td>
              </tr>
            )}
            <tr style={{ backgroundColor: "#e8f0f7" }}>
              <td
                style={{
                  ...tdStyle,
                  fontWeight: "bold",
                  borderTop: "2px solid #004466",
                }}
              >
                Total
              </td>
              <td
                style={{
                  ...tdRightStyle,
                  fontWeight: "bold",
                  borderTop: "2px solid #004466",
                  color:
                    displayTotalMins >= displaySollMins ? "#155724" : "#c0392b",
                }}
              >
                {minutesToDisplay(displayTotalMins)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Gleitzeitsaldo per Ende Monat */}
      <div
        style={{
          border: "1px solid #ccd9e3",
          borderTop: "none",
          padding: "8px 12px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "4px",
          backgroundColor: "#f8fbfd",
        }}
      >
        <span style={{ fontSize: "12px", fontWeight: "600", color: "#004466" }}>
          Gleitzeitsaldo per Ende {monthName} {year}
        </span>
        <span
          style={{
            fontSize: "14px",
            fontWeight: "bold",
            color: displaySaldoMins >= 0 ? "#155724" : "#c0392b",
          }}
        >
          {minutesToDisplaySigned(displaySaldoMins)}
        </span>
      </div>

      {/* Feriensaldo per Ende Monat */}
      <div
        style={{
          border: "1px solid #ccd9e3",
          borderTop: "none",
          padding: "8px 12px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          backgroundColor: "#f8fbfd",
        }}
      >
        <span style={{ fontSize: "12px", fontWeight: "600", color: "#004466" }}>
          Feriensaldo per Ende {monthName} {year}
        </span>
        <span
          style={{
            fontSize: "14px",
            fontWeight: "bold",
            color: remainingVacationDays >= 0 ? "#155724" : "#c0392b",
          }}
        >
          {remainingVacationDays.toFixed(1)} Tage
        </span>
      </div>

      {/* ── 4. Spesen im Detail ── */}
      <div style={{ marginBottom: "20px" }} className="report-section">
        {sectionTitle("4", "Spesen im Detail")}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            border: "1px solid #ccd9e3",
          }}
        >
          <thead>
            <tr>
              <th style={tableHeaderStyle}>Datum Beleg</th>
              <th style={tableHeaderStyle}>Spesenart</th>
              <th style={tableHeaderStyle}>Beschreibung</th>
              <th style={{ ...tableHeaderStyle, textAlign: "right" }}>
                Rückerstattung CHF
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedExpenses.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  style={{
                    ...tdStyle,
                    color: "#888",
                    textAlign: "center",
                    padding: "12px",
                  }}
                >
                  Keine genehmigten Spesen
                </td>
              </tr>
            ) : (
              sortedExpenses.map((e, idx) => {
                const belegNr = String(idx + 1).padStart(4, "0");
                const artName = expTypeName(e.expenseTypeId);
                return (
                  <tr key={String(e.id)}>
                    <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>
                      {fmtDate(e.date)} Nr.{belegNr}
                    </td>
                    <td style={tdStyle}>{artName}</td>
                    <td style={{ ...tdStyle, color: "#555" }}>
                      {e.description || "–"}
                    </td>
                    <td style={tdRightStyle}>
                      {e.reimbursementCHF > 0
                        ? fmtCHF(e.reimbursementCHF)
                        : "–"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          {sortedExpenses.length > 0 && (
            <tfoot>
              <tr>
                <td colSpan={3} style={footerTdStyle}>
                  Total
                </td>
                <td style={footerTdRightStyle}>
                  {totalDetailReimbursement > 0
                    ? fmtCHF(totalDetailReimbursement)
                    : "–"}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* ── 5. Spesenabrechnung (nach Spesenart) ── */}
      <div style={{ marginBottom: "20px" }} className="report-section">
        {sectionTitle("5", "Spesenabrechnung")}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            border: "1px solid #ccd9e3",
          }}
        >
          <thead>
            <tr>
              <th style={tableHeaderStyle}>Spesenart</th>
              <th style={{ ...tableHeaderStyle, textAlign: "right" }}>
                Total Rückerstattung CHF
              </th>
            </tr>
          </thead>
          <tbody>
            {spesenAbrGroups.length === 0 ? (
              <tr>
                <td
                  colSpan={2}
                  style={{
                    ...tdStyle,
                    color: "#888",
                    textAlign: "center",
                    padding: "12px",
                  }}
                >
                  Keine genehmigten Spesen
                </td>
              </tr>
            ) : (
              spesenAbrGroups.map((g) => (
                <tr key={g.name}>
                  <td style={tdStyle}>{g.name}</td>
                  <td style={tdRightStyle}>
                    {g.total > 0 ? fmtCHF(g.total) : "–"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
          {spesenAbrGroups.length > 0 && (
            <tfoot>
              <tr>
                <td style={footerTdStyle}>Total</td>
                <td style={footerTdRightStyle}>
                  {totalSpesenAbr > 0 ? fmtCHF(totalSpesenAbr) : "–"}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* ── 6. Gleitzeit pro Tag ── */}
      <div style={{ marginBottom: "20px" }} className="report-section">
        {sectionTitle("6", "Gleitzeit pro Tag")}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            border: "1px solid #ccd9e3",
          }}
        >
          <thead>
            <tr>
              <th style={tableHeaderStyle}>Tag</th>
              <th style={{ ...tableHeaderStyle, textAlign: "right" }}>Soll</th>
              <th style={{ ...tableHeaderStyle, textAlign: "right" }}>Ist</th>
              <th style={{ ...tableHeaderStyle, textAlign: "right" }}>
                Tages-Gleitzeit
              </th>
              <th style={tableHeaderStyle}>Bemerkung</th>
            </tr>
          </thead>
          <tbody>
            {dayRows.map((row) => {
              const bgColor = row.isWeekend ? "#f5f5f5" : "white";
              const textColor = row.isWeekend ? "#999" : "#1a1a1a";
              const dayAbsences = absences.filter(
                (a) =>
                  a.status === "approved" &&
                  row.dateStr >= a.dateFrom &&
                  row.dateStr <= a.dateTo,
              );
              const absenceNote = dayAbsences
                .map((a) => {
                  const name = absTypeName(a.absenceTypeId);
                  const mins = a.ganztaetig
                    ? getActiveEmploymentForDate(employments, row.dateStr)
                      ? getEmploymentMinutesForDate(
                          getActiveEmploymentForDate(employments, row.dateStr)!,
                          row.dateStr,
                        )
                      : 0
                    : Number(a.dauer);
                  return mins > 0 ? `${name} ${minutesToHHMM(mins)}` : name;
                })
                .join(", ");

              // Holiday annotations in Bemerkungen
              const dayHolidays = holidays.filter(
                (h) => h.date === row.dateStr,
              );
              const holidayNote = dayHolidays
                .map((h) => {
                  const hMins = calcHolidayIstMins(row.dateStr);
                  return hMins > 0
                    ? `${h.name} ${minutesToHHMM(hMins)}`
                    : h.name;
                })
                .join(", ");

              const allNotes = [absenceNote, holidayNote]
                .filter(Boolean)
                .join(", ");

              return (
                <tr key={row.dateStr} style={{ backgroundColor: bgColor }}>
                  <td style={{ ...tdStyle, color: textColor }}>
                    {row.dayLabel}
                  </td>
                  <td style={{ ...tdRightStyle, color: textColor }}>
                    {row.soll > 0 ? minutesToDisplay(row.soll) : "–"}
                  </td>
                  <td style={{ ...tdRightStyle, color: textColor }}>
                    {row.ist > 0
                      ? minutesToDisplay(row.ist)
                      : row.soll > 0
                        ? "00:00"
                        : "–"}
                  </td>
                  <td
                    style={{
                      ...tdRightStyle,
                      color:
                        row.tagesGleitzeit < 0
                          ? "#c0392b"
                          : row.tagesGleitzeit > 0
                            ? "#155724"
                            : textColor,
                      fontWeight: row.soll > 0 ? "600" : "normal",
                    }}
                  >
                    {row.soll > 0
                      ? row.tagesGleitzeit > 0
                        ? `+${minutesToDisplay(row.tagesGleitzeit)}`
                        : minutesToDisplay(row.tagesGleitzeit)
                      : "–"}
                  </td>
                  <td style={{ ...tdStyle, color: "#666", fontSize: "11px" }}>
                    {allNotes || ""}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── 7. Zeiterfassung ── */}
      <div style={{ marginBottom: "20px" }} className="report-section">
        {sectionTitle("7", "Zeiterfassung")}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            border: "1px solid #ccd9e3",
          }}
        >
          <thead>
            <tr>
              <th style={{ ...tableHeaderStyle, whiteSpace: "nowrap" }}>
                Datum
              </th>
              <th style={tableHeaderStyle}>Tätigkeit</th>
              <th
                style={{
                  ...tableHeaderStyle,
                  textAlign: "right",
                  whiteSpace: "nowrap",
                }}
              >
                Zeit / Dauer
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedTimeEntries.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  style={{
                    ...tdStyle,
                    color: "#888",
                    textAlign: "center",
                    padding: "12px",
                  }}
                >
                  Keine Zeiterfassungen
                </td>
              </tr>
            ) : (
              sortedTimeEntries.map((t) => {
                const proj = projById(t.projectId);
                const cid = proj?.customerId;
                const cName = customerName(cid);
                const pName = proj?.name ?? String(t.projectId);
                const sName = svcName(t.serviceTypeId);
                const desc = t.description ? ` – ${t.description}` : "";
                const taetigkeit =
                  [cName !== "–" ? cName : null, pName, sName]
                    .filter(Boolean)
                    .join(" / ") + desc;

                const isZeitBlock =
                  proj?.erfassungsart === "zeitBlock" && t.von && t.bis;
                let zeitDisplay: string;
                if (isZeitBlock) {
                  const [vonH, vonM] = (t.von as string).split(":").map(Number);
                  const [bisH, bisM] = (t.bis as string).split(":").map(Number);
                  const durationMins = bisH * 60 + bisM - (vonH * 60 + vonM);
                  zeitDisplay = `${t.von} – ${t.bis} / ${minutesToHHMM(durationMins > 0 ? durationMins : 0)}`;
                } else {
                  zeitDisplay = totalHoursDisplay(hoursToMinutes(t.hours));
                }

                return (
                  <tr key={String(t.id)}>
                    <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>
                      {fmtDate(t.date)}
                    </td>
                    <td style={{ ...tdStyle, maxWidth: "400px" }}>
                      {taetigkeit}
                    </td>
                    <td style={{ ...tdRightStyle, whiteSpace: "nowrap" }}>
                      {zeitDisplay}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={2} style={footerTdStyle}>
                Total geleistete Stunden
              </td>
              <td style={footerTdRightStyle}>
                {totalHoursDisplay(totalZeitMins)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* ── Footer ── */}
      <div
        style={{
          borderTop: "1px solid #ccd9e3",
          paddingTop: "12px",
          marginTop: "12px",
          color: "#888",
          fontSize: "11px",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span>{company?.name ?? ""} – Vertraulich</span>
        <span>Erstellt am {today}</span>
      </div>
    </div>
  );
}

// Re-export for unused var suppression
export type { MonthlyData };
