import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuthStore";
import { useDashboardStats } from "@/hooks/useBackend";
import { formatDateInTz, useCompanyTimezone } from "@/hooks/useCompanyTimezone";
import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  BarChart2,
  CalendarCheck,
  Clock,
  Minus,
  Plus,
  Receipt,
  Sun,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { createActor } from "../backend";
import type {
  Employee,
  Employment,
  VacationBalance,
  WorkTimeBalance,
} from "../backend.d";
import {
  countVacationDaysProportional,
  getActiveEmploymentForDate,
  getEmploymentMinutesForDate,
  nanosToLocalIsoDate,
} from "../lib/employmentUtils";
import { minutesToHhMm } from "./stammdaten/shared";

// ─── Types ────────────────────────────────────────────────────────────────────

interface StatsShape {
  hoursThisWeek?: number;
  hoursTarget?: number;
  pendingVacationRequests?: number;
  myPendingVacationRequests?: number;
  pendingExpenses?: bigint;
  pendingVacations?: bigint;
  approvedVacationDays?: bigint;
}

type AnyActor = Record<string, (...args: unknown[]) => Promise<unknown>>;
const toAny = (a: unknown): AnyActor => a as AnyActor;

const CHART_STYLE = {
  fontSize: 12,
  fill: "oklch(0.5 0.015 220)",
};

const TOOLTIP_STYLE = {
  borderRadius: "6px",
  border: "1px solid oklch(0.92 0.02 255)",
  fontSize: 12,
  background: "oklch(1.0 0 0)",
  color: "oklch(0.25 0.02 250)",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Format ISO date "YYYY-MM-DD" → "TT.MM.JJJJ" */
function isoToDe(iso: string | null): string {
  if (!iso) return "–";
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}

/** Get Sunday (end of week) for a given date as "YYYY-MM-DD" in LOCAL time */
function endOfWeekIso(date: Date, _tz: string): string {
  // Work in local time to avoid UTC boundary shift
  const d = new Date(date);
  const dow = d.getDay(); // 0=Sun
  const daysToSunday = dow === 0 ? 0 : 7 - dow;
  d.setDate(d.getDate() + daysToSunday);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// ─── Feriensaldo Widget ───────────────────────────────────────────────────────

function FeriensaldoWidget() {
  const { employeeId, role } = useAuth();
  const { actor, isFetching } = useActor(createActor);
  const currentYear = new Date().getFullYear();
  const isAdminOrManager = role === "admin" || role === "manager";

  // Employee selector (admin/manager only) — default to own employee
  const [selectedEmpId, setSelectedEmpId] = useState<string>(() =>
    employeeId ? String(employeeId) : "",
  );

  // Employee list for the selector (admin/manager only)
  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ["employees-for-feriensaldo"],
    queryFn: async () => {
      if (!actor) return [];
      return toAny(actor).listEmployees() as Promise<Employee[]>;
    },
    enabled: !!actor && !isFetching && isAdminOrManager,
    staleTime: 60_000,
  });

  // The target employee ID to display
  const targetEmpId =
    isAdminOrManager && selectedEmpId
      ? selectedEmpId
      : employeeId
        ? String(employeeId)
        : null;

  // Fetch vacation balances (granted days per year)
  const { data: vacationBalances, isLoading: loadingBalances } = useQuery<
    VacationBalance[]
  >({
    queryKey: ["vacationBalances-dashboard", String(targetEmpId)],
    queryFn: async () => {
      if (!actor || !targetEmpId) return [];
      try {
        const res = await toAny(actor).listVacationBalances(
          BigInt(targetEmpId),
        );
        const r = res as {
          __kind__: string;
          ok?: VacationBalance[];
          err?: string;
        };
        return r.__kind__ === "ok" ? (r.ok ?? []) : [];
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching && !!targetEmpId,
    staleTime: 60_000,
  });

  // Fetch employments for the target employee (needed to check pensum per day)
  const { data: employments = [], isLoading: loadingEmployments } = useQuery<
    Employment[]
  >({
    queryKey: ["employments-feriensaldo", String(targetEmpId)],
    queryFn: async () => {
      if (!actor || !targetEmpId) return [];
      try {
        const res = await toAny(actor).listEmployments(BigInt(targetEmpId));
        const r = res as { __kind__: string; ok?: Employment[]; err?: string };
        return r.__kind__ === "ok" ? (r.ok ?? []) : [];
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching && !!targetEmpId,
    staleTime: 60_000,
  });

  // Fetch absences to compute used vacation days.
  // CRITICAL: always pass employeeId filter so we only get the target employee's
  // absences — without this filter all employees' approved vacations are summed.
  const { data: absenceData, isLoading: loadingAbsences } = useQuery<{
    absences: Array<{
      dateFrom: string;
      dateTo: string;
      status: string;
      ganztaetig: boolean;
      dauer: bigint;
      employeeId: bigint;
      absenceTypeId: bigint;
    }>;
  }>({
    queryKey: ["vacation-absences-dashboard", String(targetEmpId)],
    queryFn: async () => {
      if (!actor || !targetEmpId) return { absences: [] };
      try {
        const [absencesRes, typesRes] = await Promise.all([
          toAny(actor).listAbsences({
            status: "approved",
            employeeId: BigInt(targetEmpId),
          }) as Promise<
            Array<{
              dateFrom: string;
              dateTo: string;
              status: string;
              absenceTypeId: bigint;
              ganztaetig: boolean;
              dauer: bigint;
              employeeId: bigint;
            }>
          >,
          toAny(actor).listAbsenceTypes() as Promise<
            Array<{ id: bigint; requiresApproval: boolean }>
          >,
        ]);
        const vacTypeIds = new Set(
          (typesRes ?? [])
            .filter((t) => t.requiresApproval)
            .map((t) => String(t.id)),
        );
        // Filter: only vacation-type (requiresApproval), approved, and belonging
        // to the target employee (safety net in case backend ignores filter)
        const filtered = (absencesRes ?? []).filter(
          (a) =>
            vacTypeIds.has(String(a.absenceTypeId)) &&
            a.status === "approved" &&
            String(a.employeeId) === String(targetEmpId),
        );
        return { absences: filtered };
      } catch {
        return { absences: [] };
      }
    },
    enabled: !!actor && !isFetching && !!targetEmpId,
    staleTime: 60_000,
  });

  const isLoading = loadingBalances || loadingAbsences || loadingEmployments;

  // Sum total granted days for current year
  const totalGrantedDays = (vacationBalances ?? [])
    .filter((b) => Number(b.kalenderjahr) === currentYear)
    .reduce((sum, b) => sum + Number(b.dauer) / 100, 0);

  // Count used vacation days: only days with Pensum > 0 count against the balance.
  // Weekends and days configured as 0:00 in the active employment do NOT reduce
  // the balance even if the vacation was approved by an admin.
  // For partial-day (non-ganztägig) vacations, the deduction is proportional:
  // e.g. 4:00h entered / 8:00h Soll = 0.5 days deducted.
  const usedDays = (absenceData?.absences ?? []).reduce((sum, a) => {
    // Only count absences within the current year
    const yearFrom = new Date(`${a.dateFrom}T12:00:00`).getFullYear();
    const yearTo = new Date(`${a.dateTo}T12:00:00`).getFullYear();
    if (yearFrom !== currentYear && yearTo !== currentYear) return sum;
    // Clamp dates to the current year for cross-year absences
    const effectiveFrom =
      yearFrom < currentYear ? `${currentYear}-01-01` : a.dateFrom;
    const effectiveTo =
      yearTo > currentYear ? `${currentYear}-12-31` : a.dateTo;
    // Use proportional counting: partial-day vacations deduct fractional days
    return (
      sum +
      countVacationDaysProportional(
        effectiveFrom,
        effectiveTo,
        a.ganztaetig,
        Number(a.dauer),
        employments,
      )
    );
  }, 0);

  const usedDaysRounded = Math.round(usedDays * 10) / 10;
  const remainingDays = Math.max(totalGrantedDays - usedDays, 0);

  return (
    <Card className="shadow-card" data-ocid="feriensaldo-widget">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Sun className="w-4 h-4 text-amber-500" />
            Feriensaldo {currentYear}
          </CardTitle>
          {isAdminOrManager && employees.length > 0 && (
            <Select
              value={selectedEmpId}
              onValueChange={(v) => setSelectedEmpId(v)}
            >
              <SelectTrigger
                className="w-48 h-8 text-xs"
                data-ocid="feriensaldo-employee-select"
              >
                <SelectValue placeholder="Mitarbeiter wählen" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((emp) => (
                  <SelectItem key={String(emp.id)} value={String(emp.id)}>
                    {emp.firstName} {emp.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            <SaldoKpi
              label="Gutschriften"
              value={`${totalGrantedDays.toFixed(totalGrantedDays % 1 === 0 ? 0 : 1)} T`}
              colorClass="bg-muted/50"
              textColorClass="text-foreground"
            />
            <SaldoKpi
              label="Bezogen"
              value={`${usedDaysRounded} T`}
              colorClass="bg-amber-50 dark:bg-amber-950/30"
              textColorClass="text-amber-700 dark:text-amber-400"
            />
            <SaldoKpi
              label="Verbleibend"
              value={`${remainingDays.toFixed(remainingDays % 1 === 0 ? 0 : 1)} T`}
              colorClass="bg-emerald-50 dark:bg-emerald-950/30"
              textColorClass="text-emerald-700 dark:text-emerald-400"
            />
          </div>
        )}
        {!isLoading && totalGrantedDays === 0 && (
          <p className="text-xs text-muted-foreground mt-3 pl-1">
            Kein Ferienguthaben für {currentYear} erfasst.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Arbeitszeitsaldo Widget ──────────────────────────────────────────────────

function ArbeitszeitsaldoWidget() {
  const { employeeId, role } = useAuth();
  const { actor, isFetching } = useActor(createActor);
  const timezone = useCompanyTimezone();
  const isAdminOrManager = role === "admin" || role === "manager";
  // Default to own employee ID so the select shows the logged-in user's name without a separate "Eigener Saldo" option
  const [selectedEmpId, setSelectedEmpId] = useState<string>(() =>
    employeeId ? String(employeeId) : "",
  );

  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ["employees-for-saldo"],
    queryFn: async () => {
      if (!actor) return [];
      return toAny(actor).listEmployees() as Promise<Employee[]>;
    },
    enabled: !!actor && !isFetching && isAdminOrManager,
    staleTime: 60_000,
  });

  const targetEmpId =
    isAdminOrManager && selectedEmpId
      ? selectedEmpId
      : employeeId
        ? String(employeeId)
        : null;

  // Remove comment – selectedEmpId is now initialized to the logged-in user's ID

  // Fetch employments to determine actual start date of earliest employment
  const { data: employments = [] } = useQuery<Employment[]>({
    queryKey: ["employments-for-saldo", targetEmpId],
    queryFn: async () => {
      if (!actor || !targetEmpId) return [];
      try {
        const res = await toAny(actor).listEmployments(BigInt(targetEmpId));
        const r = res as { __kind__: string; ok?: Employment[]; err?: string };
        return r.__kind__ === "ok" ? (r.ok ?? []) : [];
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching && !!targetEmpId,
    staleTime: 60_000,
  });

  // Find earliest employment start date (von is stored as Unix SECONDS bigint)
  const employmentStartDate = (() => {
    if (employments.length === 0) return null;
    // Filter out any employments with von === 0n or pre-2000 (invalid epoch fallback)
    const validEmployments = employments.filter((emp) => {
      if (!emp.von || emp.von <= 0n) return false;
      // von is Unix SECONDS – multiply by 1000 to get ms
      const ms = Number(emp.von) * 1000;
      const year = new Date(ms).getFullYear();
      return year >= 2000 && year <= 2100;
    });
    if (validEmployments.length === 0) return null;
    const earliest = validEmployments.reduce((min, emp) =>
      emp.von < min.von ? emp : min,
    );
    // Use nanosToLocalIsoDate to get the LOCAL date (not UTC) — avoids midnight TZ shift
    const localDate = nanosToLocalIsoDate(earliest.von);
    if (!localDate) return null;
    const year = Number(localDate.slice(0, 4));
    if (year < 2000 || year > 2100) return null;
    return localDate;
  })();

  // Period end = Sunday of current week
  const periodEnd = endOfWeekIso(new Date(), timezone || "Europe/Zurich");

  const { data: balance, isLoading } = useQuery<WorkTimeBalance | null>({
    queryKey: ["workTimeBalance", targetEmpId, employmentStartDate, periodEnd],
    queryFn: async () => {
      if (!actor || !targetEmpId || !employmentStartDate) return null;
      try {
        const res = await toAny(actor).getEmployeeWorkTimeBalance(
          BigInt(targetEmpId),
          employmentStartDate,
          periodEnd,
        );
        const r = res as {
          __kind__: string;
          ok?: WorkTimeBalance;
          err?: string;
        };
        return r.__kind__ === "ok" ? (r.ok ?? null) : null;
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching && !!targetEmpId && !!employmentStartDate,
    staleTime: 30_000,
  });

  const saldo = balance ? Number(balance.saldo) : null;
  // Strict sign check: positive only if > 0 (zero is neutral, not positive)
  const saldoIsPositive = saldo !== null && saldo > 0;
  const saldoIsNegative = saldo !== null && saldo < 0;

  return (
    <Card className="shadow-card" data-ocid="arbeitszeitsaldo-widget">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-primary" />
              Arbeitszeitsaldo
            </CardTitle>
            {employmentStartDate ? (
              <p className="text-xs text-muted-foreground mt-0.5">
                Kumuliert ab{" "}
                <span className="font-medium text-foreground tabular-nums">
                  {isoToDe(employmentStartDate)}
                </span>{" "}
                bis{" "}
                <span className="font-medium text-foreground tabular-nums">
                  {isoToDe(periodEnd)}
                </span>
              </p>
            ) : (
              <p className="text-xs text-muted-foreground mt-0.5">
                Kumuliert ab Anstellungsbeginn
              </p>
            )}
          </div>
          {isAdminOrManager && employees.length > 0 && (
            <Select
              value={selectedEmpId}
              onValueChange={(v) => setSelectedEmpId(v)}
            >
              <SelectTrigger
                className="w-48 h-8 text-xs"
                data-ocid="saldo-employee-select"
              >
                <SelectValue placeholder="Mitarbeiter wählen" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((emp) => (
                  <SelectItem key={String(emp.id)} value={String(emp.id)}>
                    {emp.firstName} {emp.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        ) : employments.length === 0 || !employmentStartDate ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <SaldoKpi
              label="Soll-Stunden"
              value="0:00"
              colorClass="bg-muted/50"
              textColorClass="text-foreground"
            />
            <SaldoKpi
              label="Ist-Stunden"
              value="0:00"
              colorClass="bg-primary/5"
              textColorClass="text-primary"
            />
            <SaldoKpi
              label="Arbeitszeitsaldo"
              value="0:00"
              colorClass="bg-muted/50"
              textColorClass="text-foreground"
            />
          </div>
        ) : balance == null ? (
          <div className="flex flex-col items-center py-6 text-center">
            <Clock className="w-8 h-8 text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">
              Saldo wird berechnet…
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {/* Soll */}
            <SaldoKpi
              label="Soll-Stunden"
              value={minutesToHhMm(Number(balance.sollStunden))}
              colorClass="bg-muted/50"
              textColorClass="text-foreground"
            />
            {/* Ist */}
            <SaldoKpi
              label="Ist-Stunden"
              value={minutesToHhMm(Number(balance.istStunden))}
              colorClass="bg-primary/5"
              textColorClass="text-primary"
            />
            {/* Saldo — absolute value displayed, sign shown as icon prefix */}
            <SaldoKpi
              label="Arbeitszeitsaldo"
              value={minutesToHhMm(Math.abs(saldo ?? 0))}
              colorClass={
                saldoIsNegative
                  ? "bg-red-50 dark:bg-red-950/30"
                  : saldoIsPositive
                    ? "bg-emerald-50 dark:bg-emerald-950/30"
                    : "bg-muted/50"
              }
              textColorClass={
                saldoIsNegative
                  ? "text-red-700 dark:text-red-400"
                  : saldoIsPositive
                    ? "text-emerald-700 dark:text-emerald-400"
                    : "text-foreground"
              }
              icon={
                saldoIsNegative ? (
                  <Minus className="w-3 h-3" />
                ) : saldoIsPositive ? (
                  <Plus className="w-3 h-3" />
                ) : undefined
              }
            />
          </div>
        )}
        {balance && Number(balance.korrektionen) !== 0 && (
          <p className="text-xs text-muted-foreground mt-3 pl-1">
            Korrektionen:{" "}
            <span className="font-medium">
              {minutesToHhMm(Number(balance.korrektionen))}
            </span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function SaldoKpi({
  label,
  value,
  colorClass,
  textColorClass,
  icon,
}: {
  label: string;
  value: string;
  colorClass: string;
  textColorClass: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className={`rounded-lg p-3 ${colorClass}`}>
      <p className="text-xs text-muted-foreground font-medium mb-1">{label}</p>
      <p
        className={`text-lg font-bold font-display tabular-nums flex items-center gap-1 ${textColorClass}`}
      >
        {icon}
        {value}
      </p>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const navigate = useNavigate();
  const { isAuthenticated, companyId, employeeName, role, employeeId } =
    useAuth();
  const { data: rawStats, isLoading } = useDashboardStats();
  const timezone = useCompanyTimezone();
  const { actor, isFetching } = useActor(createActor);

  // Fetch current employee's employments to check if any exist
  const { data: myEmployments = [], isLoading: employmentsLoading } = useQuery<
    Employment[]
  >({
    queryKey: ["my-employments-dashboard", String(employeeId)],
    queryFn: async () => {
      if (!actor || !employeeId) return [];
      try {
        const res = await toAny(actor).listEmployments(BigInt(employeeId));
        const r = res as { __kind__: string; ok?: Employment[]; err?: string };
        if (r.__kind__ === "ok") {
          // von is stored as Unix SECONDS (not nanoseconds). Multiply by 1000 to get ms.
          return (r.ok ?? []).filter((e) => {
            if (!e.von) return false;
            let vonBig: bigint;
            try {
              vonBig =
                typeof e.von === "bigint"
                  ? e.von
                  : BigInt(Math.round(Number(e.von)));
            } catch {
              return false;
            }
            if (vonBig <= 0n) return false;
            const year = new Date(Number(vonBig) * 1000).getFullYear();
            return year >= 2000 && year <= 2100;
          });
        }
        return [];
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching && !!employeeId,
    staleTime: 30_000,
  });

  useEffect(() => {
    if (!isAuthenticated || !companyId) {
      navigate({ to: "/" });
    }
  }, [isAuthenticated, companyId, navigate]);

  if (!isAuthenticated || !companyId) return null;

  const stats = rawStats as StatsShape | null;
  const isAdminOrManager = role === "admin" || role === "manager";

  const hoursWeek = stats?.hoursThisWeek ?? 0;

  const todayIso = new Date().toLocaleDateString("en-CA", {
    timeZone: timezone || "Europe/Zurich",
  });

  // Use date-based employment lookup — only consider today's employment as "active"
  const todayEmployment =
    getActiveEmploymentForDate(myEmployments, todayIso) ?? null;
  const hasEmployment = todayEmployment !== null;

  // Compute the weekly Soll-minutes by iterating each day of the current Mon–Sun week.
  // This correctly handles employment changes that happen mid-week.
  const hoursTargetMinutes = (() => {
    if (myEmployments.length === 0) return 0;
    // Find Monday of the current week
    const now = new Date(`${todayIso}T12:00:00`);
    const dow = now.getDay(); // 0=Sun,1=Mon,...,6=Sat
    const daysFromMonday = dow === 0 ? 6 : dow - 1;
    let totalMinutes = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - daysFromMonday + i);
      const y = d.getFullYear();
      const mo = String(d.getMonth() + 1).padStart(2, "0");
      const da = String(d.getDate()).padStart(2, "0");
      const dayIso = `${y}-${mo}-${da}`;
      const emp = getActiveEmploymentForDate(myEmployments, dayIso);
      if (emp) {
        totalMinutes += getEmploymentMinutesForDate(emp, dayIso);
      }
    }
    return totalMinutes;
  })();

  // IST hours: backend returns float hours → convert to minutes
  const hoursWeekMinutes = Math.round(hoursWeek * 60);
  const hoursWeekFormatted = minutesToHhMm(hoursWeekMinutes);
  const hoursTargetFormatted = minutesToHhMm(hoursTargetMinutes);
  const pendingVacation = Number(stats?.pendingVacations ?? 0);
  const pendingExpenses = Number(stats?.pendingExpenses ?? 0);

  // ─── Chart data derived from backend ──────────────────────────────────────
  // Convert minutes back to float hours for recharts
  const hoursTarget = hoursTargetMinutes / 60;
  const weeklyHoursData = [
    { tag: "Diese Woche", ist: hoursWeek, soll: hoursTarget },
  ];

  const expenseSummaryData = [{ label: "Ausstehend", anzahl: pendingExpenses }];

  return (
    <Layout>
      <div className="p-6 space-y-6 max-w-screen-xl mx-auto">
        {/* ── Header ── */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              Dashboard
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Willkommen zurück,{" "}
              <span className="font-medium text-foreground">
                {employeeName ?? "Benutzer"}
              </span>
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground bg-muted/60 px-3 py-1.5 rounded-full border border-border">
            <TrendingUp className="w-3.5 h-3.5" />
            {formatDateInTz(new Date(), timezone, {
              weekday: "long",
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </div>
        </div>

        {/* ── KPI Cards ── */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          data-ocid="dashboard-kpi-row"
        >
          {isLoading ? (
            ["k1", "k2"].map((id) => (
              <Skeleton key={id} className="h-28 rounded-xl" />
            ))
          ) : (
            <>
              <KpiCard
                icon={<Clock className="w-5 h-5 text-primary" />}
                label="Stunden diese Woche"
                value={`${hoursWeekFormatted} / ${hoursTargetFormatted}`}
                sub={
                  employmentsLoading
                    ? "Beschäftigung wird geladen…"
                    : hasEmployment && hoursTarget > 0
                      ? `${Math.round((hoursWeek / (hoursTarget || 1)) * 100)} % Ziel`
                      : hoursWeek > 0
                        ? `${hoursWeekFormatted} erfasst`
                        : "Noch keine Einträge diese Woche"
                }
                colorClass="bg-primary/10"
                data-ocid="kpi-hours"
              />
              <KpiCard
                icon={<Receipt className="w-5 h-5 text-emerald-600" />}
                label="Ausstehende Spesenrückerstattungen"
                value={String(pendingExpenses)}
                sub="Zur Verarbeitung"
                colorClass="bg-emerald-500/10"
                data-ocid="kpi-expenses"
              />
            </>
          )}
        </div>

        {/* ── Arbeitszeitsaldo Widget ── */}
        <ArbeitszeitsaldoWidget />

        {/* ── Feriensaldo Widget ── */}
        <FeriensaldoWidget />

        {/* ── Charts ── */}
        <div className="grid grid-cols-1 gap-4">
          {/* Stunden Übersicht */}
          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">
                Stunden Übersicht — Aktuelle Woche
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-52" />
              ) : (
                <ResponsiveContainer width="100%" height={210}>
                  <BarChart
                    data={weeklyHoursData}
                    margin={{ top: 4, right: 8, bottom: 4, left: -20 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="oklch(0.92 0.02 255)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="tag"
                      tick={CHART_STYLE}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={CHART_STYLE}
                      axisLine={false}
                      tickLine={false}
                      domain={[
                        0,
                        Math.max(hoursTarget * 1.2, hoursWeek * 1.2, 50),
                      ]}
                      tickFormatter={(v: number) => `${v}h`}
                    />
                    <Tooltip
                      formatter={(v: number, name: string) => [
                        `${v}h`,
                        name === "ist" ? "Ist-Stunden" : "Soll-Stunden",
                      ]}
                      contentStyle={TOOLTIP_STYLE}
                    />
                    <Legend
                      formatter={(value) =>
                        value === "ist" ? "Ist-Stunden" : "Soll-Stunden"
                      }
                      wrapperStyle={{ fontSize: 12 }}
                    />
                    <Bar
                      dataKey="ist"
                      fill="oklch(0.52 0.1 196)"
                      radius={[3, 3, 0, 0]}
                      maxBarSize={80}
                    />
                    <Bar
                      dataKey="soll"
                      fill="oklch(0.65 0.12 40)"
                      radius={[3, 3, 0, 0]}
                      maxBarSize={80}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Spesen Status */}
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Spesen Status — Ausstehende Belege
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-52" />
            ) : (
              <ResponsiveContainer width="100%" height={210}>
                <BarChart
                  data={expenseSummaryData}
                  margin={{ top: 4, right: 8, bottom: 4, left: -10 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="oklch(0.92 0.02 255)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="label"
                    tick={CHART_STYLE}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={CHART_STYLE}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                    tickFormatter={(v: number) => String(v)}
                    width={40}
                  />
                  <Tooltip
                    contentStyle={TOOLTIP_STYLE}
                    formatter={(v: number) => [v, "Belege"]}
                  />
                  <Bar
                    dataKey="anzahl"
                    fill="oklch(0.52 0.1 196)"
                    radius={[3, 3, 0, 0]}
                    maxBarSize={80}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* ── Quick Actions ── */}
        <div className="bg-muted/40 border border-border rounded-xl p-5">
          <p className="text-sm font-semibold text-foreground mb-3">
            Schnellzugriff
          </p>
          <div
            className="flex flex-wrap gap-3"
            data-ocid="dashboard-quick-actions"
          >
            <Button
              type="button"
              variant="default"
              onClick={() => navigate({ to: "/zeiten" })}
              data-ocid="btn-open-time"
              className="transition-smooth"
            >
              <Clock className="w-4 h-4 mr-2" />
              Zeiterfassung öffnen
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate({ to: "/spesen" })}
              data-ocid="btn-open-expenses"
              className="transition-smooth"
            >
              <Receipt className="w-4 h-4 mr-2" />
              Spesen erfassen
            </Button>
            {isAdminOrManager && (
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate({ to: "/genehmigungen" })}
                data-ocid="btn-open-approvals"
                className="transition-smooth border-amber-300 text-amber-700 hover:bg-amber-50"
              >
                <CalendarCheck className="w-4 h-4 mr-2" />
                Genehmigungen
                {pendingVacation > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-primary-foreground text-[10px] font-bold">
                    {pendingVacation}
                  </span>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

// ─── KpiCard ──────────────────────────────────────────────────────────────────

interface KpiCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  colorClass: string;
  "data-ocid"?: string;
}

function KpiCard({
  icon,
  label,
  value,
  sub,
  colorClass,
  "data-ocid": ocid,
}: KpiCardProps) {
  return (
    <Card className="shadow-card" data-ocid={ocid}>
      <CardContent className="pt-5 pb-5 px-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide truncate">
              {label}
            </p>
            <p className="text-2xl font-display font-bold text-foreground mt-1.5 truncate">
              {value}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
          </div>
          <div className={`p-2.5 rounded-lg flex-shrink-0 ${colorClass}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
