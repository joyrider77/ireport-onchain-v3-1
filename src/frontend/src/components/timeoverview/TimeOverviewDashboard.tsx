import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuthStore";
import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { createActor } from "../../backend";
import type { Project, ServiceType } from "../../backend.d";
import type {
  Absence,
  AbsenceType,
  Employee,
  Employment,
  Holiday,
  TimeEntry,
} from "../../backend.d";
import {
  type PeriodType,
  aggregateForDay,
  aggregateForMonth,
  aggregateForWeek,
  aggregateForYear,
  calcSollzeitForDateRange,
  formatPeriodLabel,
  getISOWeekNumber,
  getISOWeekYear,
} from "../../lib/timeOverviewAggregation";
import { DayDetailView } from "./DayDetailView";
import { ExportMenu } from "./ExportMenu";
import { PeriodNavigator } from "./PeriodNavigator";
import { PeriodSelector } from "./PeriodSelector";
import { TimeChart } from "./TimeChart";

type AnyActor = Record<string, (...args: unknown[]) => Promise<unknown>>;
const toAny = (a: unknown): AnyActor => a as AnyActor;

// ─── Date navigation helpers ──────────────────────────────────────────────────

function toIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function navigateDate(
  current: Date,
  periodType: PeriodType,
  dir: -1 | 1,
): Date {
  const d = new Date(current);
  switch (periodType) {
    case "day":
      d.setDate(d.getDate() + dir);
      break;
    case "week":
      d.setDate(d.getDate() + dir * 7);
      break;
    case "month":
      d.setMonth(d.getMonth() + dir);
      break;
    case "year":
      d.setFullYear(d.getFullYear() + dir);
      break;
  }
  return d;
}

function getDateRange(
  periodType: PeriodType,
  date: Date,
): {
  dateFrom: string;
  dateTo: string;
  year: number;
  month: number;
  week: number;
} {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const week = getISOWeekNumber(date);
  const weekYear = getISOWeekYear(date);

  switch (periodType) {
    case "day": {
      const iso = toIso(date);
      return { dateFrom: iso, dateTo: iso, year, month, week };
    }
    case "week": {
      const jan4 = new Date(Date.UTC(weekYear, 0, 4));
      const jan4Dow = jan4.getUTCDay() || 7;
      const mondayUTC = new Date(
        jan4.getTime() - (jan4Dow - 1) * 86400000 + (week - 1) * 7 * 86400000,
      );
      const mon = new Date(
        mondayUTC.getUTCFullYear(),
        mondayUTC.getUTCMonth(),
        mondayUTC.getUTCDate(),
      );
      const sun = new Date(mon);
      sun.setDate(sun.getDate() + 6);
      return {
        dateFrom: toIso(mon),
        dateTo: toIso(sun),
        year: weekYear,
        month,
        week,
      };
    }
    case "month": {
      const lastDay = new Date(year, month, 0).getDate();
      const dateFrom = `${year}-${String(month).padStart(2, "0")}-01`;
      const dateTo = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
      return { dateFrom, dateTo, year, month, week };
    }
    case "year":
      return {
        dateFrom: `${year}-01-01`,
        dateTo: `${year}-12-31`,
        year,
        month,
        week,
      };
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  employeeId: bigint | null | undefined;
  companyId: bigint | null | undefined;
  employments: Employment[];
}

export function TimeOverviewDashboard({
  employeeId,
  companyId,
  employments,
}: Props) {
  const { actor, isFetching } = useActor(createActor);
  const { role } = useAuth();
  const isAdminOrManager = role === "admin" || role === "manager";

  const [periodType, setPeriodType] = React.useState<PeriodType>("year");
  const [currentDate, setCurrentDate] = React.useState<Date>(() => new Date());

  // ── Employee selector (admin/manager only) ───────────────────────────────────
  const [selectedEmpId, setSelectedEmpId] = React.useState<string>(() =>
    employeeId ? String(employeeId) : "",
  );

  // Keep selectedEmpId in sync when employeeId prop changes (e.g. login)
  React.useEffect(() => {
    if (employeeId && !selectedEmpId) {
      setSelectedEmpId(String(employeeId));
    }
  }, [employeeId, selectedEmpId]);

  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ["employees-for-time-overview"],
    queryFn: async () => {
      if (!actor) return [];
      return toAny(actor).listEmployees() as Promise<Employee[]>;
    },
    enabled: !!actor && !isFetching && isAdminOrManager,
    staleTime: 60_000,
  });

  // Active employee ID to show data for
  const targetEmpId: bigint | null = React.useMemo(() => {
    if (isAdminOrManager && selectedEmpId) {
      try {
        return BigInt(selectedEmpId);
      } catch {
        return null;
      }
    }
    return employeeId ?? null;
  }, [isAdminOrManager, selectedEmpId, employeeId]);

  const { dateFrom, dateTo, year, month, week } = getDateRange(
    periodType,
    currentDate,
  );

  // ── Projects & service types (for DayDetailView name resolution) ─────────────
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["projects-for-time-overview"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return (await toAny(actor).listProjects()) as Project[];
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 120_000,
  });

  const { data: serviceTypes = [] } = useQuery<ServiceType[]>({
    queryKey: ["serviceTypes-for-time-overview"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return (await toAny(actor).listServiceTypes()) as ServiceType[];
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 120_000,
  });

  // ── Absence types (needed for vacation detection) ────────────────────────────
  const { data: absenceTypes = [] } = useQuery<AbsenceType[]>({
    queryKey: ["absenceTypes-overview"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return (await toAny(actor).listAbsenceTypes()) as AbsenceType[];
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 120_000,
  });

  // ── Data fetching ────────────────────────────────────────────────────────────

  const { data: timeEntries = [], isLoading: loadingTE } = useQuery<
    TimeEntry[]
  >({
    queryKey: ["timeEntries-overview", String(targetEmpId), dateFrom, dateTo],
    queryFn: async () => {
      if (!actor || !targetEmpId) return [];
      try {
        return (await toAny(actor).listTimeEntries({
          employeeId: targetEmpId,
          dateFrom,
          dateTo,
        })) as TimeEntry[];
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching && !!targetEmpId,
    staleTime: 30_000,
  });

  const { data: absences = [], isLoading: loadingAbs } = useQuery<Absence[]>({
    queryKey: ["absences-overview", String(targetEmpId), dateFrom, dateTo],
    queryFn: async () => {
      if (!actor || !targetEmpId) return [];
      try {
        return (await toAny(actor).listAbsences({
          employeeId: targetEmpId,
          dateFrom,
          dateTo,
        })) as Absence[];
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching && !!targetEmpId,
    staleTime: 30_000,
  });

  const { data: holidays = [], isLoading: loadingHol } = useQuery<Holiday[]>({
    queryKey: ["holidays-overview", String(companyId), year],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return (await toAny(actor).listHolidays()) as Holiday[];
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 120_000,
  });

  // Fetch employments for the selected employee (may differ from the logged-in user)
  const { data: targetEmployments = [], isLoading: loadingEmpl } = useQuery<
    Employment[]
  >({
    queryKey: ["employments-for-time-overview", String(targetEmpId)],
    queryFn: async () => {
      if (!actor || !targetEmpId) return [];
      try {
        const res = await toAny(actor).listEmployments(targetEmpId);
        const r = res as { __kind__: string; ok?: Employment[] };
        return r.__kind__ === "ok" ? (r.ok ?? []) : [];
      } catch {
        return [];
      }
    },
    enabled:
      !!actor &&
      !isFetching &&
      !!targetEmpId &&
      isAdminOrManager &&
      !!selectedEmpId &&
      selectedEmpId !== String(employeeId),
    staleTime: 60_000,
  });

  // Use target employee's employments, fallback to the passed-in employments for the logged-in user
  const effectiveEmployments =
    isAdminOrManager && selectedEmpId && selectedEmpId !== String(employeeId)
      ? targetEmployments
      : employments;

  const isLoading = loadingTE || loadingAbs || loadingHol || loadingEmpl;

  // ── Aggregation ──────────────────────────────────────────────────────────────

  const periodData = React.useMemo(() => {
    switch (periodType) {
      case "year":
        return aggregateForYear(
          timeEntries,
          absences,
          absenceTypes,
          holidays,
          effectiveEmployments,
          year,
        );
      case "month":
        return aggregateForMonth(
          timeEntries,
          absences,
          absenceTypes,
          holidays,
          effectiveEmployments,
          year,
          month,
        );
      case "week":
        return aggregateForWeek(
          timeEntries,
          absences,
          absenceTypes,
          holidays,
          effectiveEmployments,
          year,
          week,
        );
      default:
        return [];
    }
  }, [
    periodType,
    timeEntries,
    absences,
    absenceTypes,
    holidays,
    effectiveEmployments,
    year,
    month,
    week,
  ]);

  const projectNamesMap = React.useMemo(() => {
    const m = new Map<string, string>();
    for (const p of projects) m.set(String(p.id), p.name);
    return m;
  }, [projects]);

  const serviceTypeNamesMap = React.useMemo(() => {
    const m = new Map<string, string>();
    for (const st of serviceTypes) m.set(String(st.id), st.name);
    return m;
  }, [serviceTypes]);

  const dayData = React.useMemo(() => {
    if (periodType !== "day") return [];
    return aggregateForDay(
      timeEntries,
      absences,
      absenceTypes,
      holidays,
      effectiveEmployments,
      dateFrom,
      projectNamesMap,
      serviceTypeNamesMap,
    );
  }, [
    periodType,
    timeEntries,
    absences,
    absenceTypes,
    holidays,
    effectiveEmployments,
    dateFrom,
    projectNamesMap,
    serviceTypeNamesMap,
  ]);

  const daySollzeit = React.useMemo(() => {
    if (periodType !== "day") return 0;
    return calcSollzeitForDateRange(effectiveEmployments, dateFrom, dateTo);
  }, [periodType, effectiveEmployments, dateFrom, dateTo]);

  // ── Navigation ───────────────────────────────────────────────────────────────

  const handlePrev = () =>
    setCurrentDate((d) => navigateDate(d, periodType, -1));
  const handleNext = () =>
    setCurrentDate((d) => navigateDate(d, periodType, 1));

  const periodLabel = formatPeriodLabel(periodType, currentDate);

  // ── Drill-down: click on a bar → navigate to sub-period ──────────────────────
  function handleBarClick(date: Date) {
    switch (periodType) {
      case "year":
        setCurrentDate(date);
        setPeriodType("month");
        break;
      case "month":
        setCurrentDate(date);
        setPeriodType("week");
        break;
      case "week":
        setCurrentDate(date);
        setPeriodType("day");
        break;
      default:
        break;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div
      className="bg-card rounded-lg shadow-sm border border-border p-5 space-y-4"
      data-ocid="time-overview-dashboard"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
          <span className="w-1 h-5 bg-primary rounded-full inline-block" />
          Zeitübersicht
        </h2>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Employee dropdown — admin/manager only */}
          {isAdminOrManager && employees.length > 0 && (
            <Select
              value={selectedEmpId}
              onValueChange={(v) => setSelectedEmpId(v)}
            >
              <SelectTrigger
                className="w-48 h-8 text-xs"
                data-ocid="time-overview-employee-select"
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
          <ExportMenu />
        </div>
      </div>

      {/* Controls row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PeriodSelector value={periodType} onChange={setPeriodType} />
        <PeriodNavigator
          label={periodLabel}
          onPrev={handlePrev}
          onNext={handleNext}
        />
      </div>

      {/* Chart / Day view */}
      <div className="relative min-h-[200px]">
        {isLoading ? (
          <div className="space-y-2" data-ocid="time-overview.loading_state">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : periodType === "day" ? (
          <DayDetailView
            dayData={dayData}
            sollzeit={daySollzeit}
            isoDate={dateFrom}
            employeeId={targetEmpId ?? undefined}
          />
        ) : (
          <TimeChart
            data={periodData}
            periodType={periodType}
            onBarClick={handleBarClick}
          />
        )}
      </div>
    </div>
  );
}
