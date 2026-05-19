import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { Layout } from "@/components/Layout";
import { TimeEntryDialog } from "@/components/TimeEntryDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuthStore";
import {
  toDateStringInTz,
  useCompanyTimezone,
} from "@/hooks/useCompanyTimezone";
import {
  countVacationDaysProportional,
  getActiveEmploymentForDate,
  getEmploymentMinutesForDate,
  getMostRecentEmploymentBefore,
  nanosToLocalIsoDate,
} from "@/lib/employmentUtils";
import {
  formatHours,
  hhmmToMinutes,
  isValidHHMM,
  minutesToHHMM,
  normalizeTimeInput,
} from "@/lib/timeFormat";
import { useActor } from "@caffeineai/core-infrastructure";
import { useNavigate } from "@tanstack/react-router";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit2,
  Pencil,
  PlusCircle,
  Timer,
  Trash2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { createActor } from "../backend";
import type {
  Absence,
  AbsenceStatus,
  AbsenceType,
  Employee,
  Employment,
  Holiday,
  Project,
  ProjectMemberAssignment,
  ServiceType,
  TimeEntry,
  UpdateAbsenceInput,
  VacationBalance,
  WorkTimeBalance,
} from "../backend.d";

// ─── Types ────────────────────────────────────────────────────────────────────

type ViewMode = "week" | "day";
type AnyActor = Record<string, (...args: unknown[]) => Promise<unknown>>;
const toAny = (a: unknown): AnyActor => a as AnyActor;

interface AbsenceFormState {
  absenceTypeId: string;
  dateFrom: string;
  dateTo: string;
  description: string;
  dauer: string;
}

interface VacationFormState {
  dateFrom: string;
  dateTo: string;
  description: string;
  ganztaetig: boolean;
  dauerInput: string;
}

// Legacy single-value form (still used internally for stdHoursForm/weekTarget)
interface StdHoursForm {
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
}

// New multi-block model
interface StandardTimeBlock {
  von: string;
  bis: string;
  projektId?: number | null;
  leistungsartId?: number | null;
}

// Legacy type — kept for fallback code path only
interface StandardWeeklyHours {
  monday: bigint;
  tuesday: bigint;
  wednesday: bigint;
  thursday: bigint;
  friday: bigint;
  saturday: bigint;
  sunday: bigint;
}
type DayKey =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";
type StandardarbeitszeitenBlocks = Record<DayKey, StandardTimeBlock[]>;

const EMPTY_STD_BLOCKS: StandardarbeitszeitenBlocks = {
  monday: [],
  tuesday: [],
  wednesday: [],
  thursday: [],
  friday: [],
  saturday: [],
  sunday: [],
};

// ─── Date Helpers ─────────────────────────────────────────────────────────────

function getWeekStartFromDateString(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  const dow = d.getUTCDay();
  const diff = dow === 0 ? -6 : 1 - dow;
  d.setUTCDate(d.getUTCDate() + diff);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

function toDateString(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatWeekLabel(weekStart: Date): string {
  const end = addDays(weekStart, 6);
  const opts: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    timeZone: "UTC",
  };
  const startStr = weekStart.toLocaleDateString("de-CH", opts);
  const endStr = end.toLocaleDateString("de-CH", { ...opts, year: "numeric" });
  return `${startStr} – ${endStr}`;
}

function formatDayLabel(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  return d.toLocaleDateString("de-CH", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  });
}

function formatDateDE(dateStr: string): string {
  if (!dateStr) return "–";
  const [y, m, d] = dateStr.split("-");
  return `${d}.${m}.${y}`;
}

function daysBetween(from: string, to: string): number {
  const d1 = new Date(from);
  const d2 = new Date(to);
  const diff = Math.ceil((d2.getTime() - d1.getTime()) / 86400000) + 1;
  return Math.max(diff, 1);
}

/** Map UTC day index (0=Sun) to weekday name for display — kept for future use */

const DAY_LABELS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const DAY_KEYS: DayKey[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];
const DAY_NAMES: Record<DayKey, string> = {
  monday: "Montag",
  tuesday: "Dienstag",
  wednesday: "Mittwoch",
  thursday: "Donnerstag",
  friday: "Freitag",
  saturday: "Samstag",
  sunday: "Sonntag",
};

/** UTC day index (0=Sun) → DayKey */
const UTC_DAY_TO_KEY: DayKey[] = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

// ─── TimeInput Sub-component ──────────────────────────────────────────────────
// Holds local state so parent re-renders (from other field changes) don't
// destroy the input mid-typing. Parent is only notified on blur.

interface TimeInputProps {
  value: string;
  placeholder?: string;
  onCommit: (normalized: string) => void;
  className?: string;
  "data-ocid"?: string;
}

function TimeInput({
  value,
  placeholder,
  onCommit,
  className,
  "data-ocid": dataOcid,
}: TimeInputProps) {
  const [local, setLocal] = useState(value);

  // Sync external value changes (e.g. when parent loads saved data) but NOT
  // while the user is typing (avoids refocusing). We only sync when the
  // incoming value is a fully-normalised hh:mm string that differs from local.
  const prevValue = useRef(value);
  if (prevValue.current !== value && isValidHHMM(value)) {
    prevValue.current = value;
    setLocal(value);
  }

  return (
    <Input
      type="text"
      placeholder={placeholder}
      value={local}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={() => {
        const normalized = normalizeTimeInput(local) || local;
        setLocal(normalized);
        onCommit(normalized);
      }}
      className={className}
      maxLength={5}
      data-ocid={dataOcid}
    />
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function EntryRow({
  entry,
  project,
  serviceType,
  onEdit,
  onDelete,
  readOnly = false,
}: {
  entry: TimeEntry;
  project?: Project;
  serviceType?: ServiceType;
  onEdit: () => void;
  onDelete: () => void;
  readOnly?: boolean;
}) {
  const isZeitBlock =
    project?.erfassungsart === "zeitBlock" && (entry.von || entry.bis);
  const timeDisplay = isZeitBlock
    ? `${entry.von ?? ""}\u2013${entry.bis ?? ""}`
    : formatHours(Number(entry.hours));
  // Approved entries cannot be edited by employees — hide the edit button
  const isApproved =
    String(
      (entry as unknown as Record<string, unknown>).status ?? "",
    ).toLowerCase() === "approved";

  return (
    <div
      className="flex items-center gap-3 py-3 px-4 rounded-lg border border-border bg-card hover:bg-accent/30 transition-colors group"
      data-ocid="time-entry-row"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-foreground truncate">
            {project?.name ?? "–"}
          </span>
          <span className="text-xs text-muted-foreground">
            {project?.code ? `[${project.code}]` : ""}
          </span>
          {entry.billable && (
            <Badge variant="secondary" className="text-xs px-1.5 py-0">
              Verrechenbar
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className="text-xs text-muted-foreground">
            {serviceType?.name ?? "–"}
          </span>
          {entry.description && (
            <>
              <span className="text-xs text-muted-foreground">·</span>
              <span className="text-xs text-muted-foreground truncate max-w-xs">
                {entry.description}
              </span>
            </>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <span className="text-sm font-semibold text-primary tabular-nums">
          {timeDisplay}
        </span>
        {isZeitBlock && (
          <span className="text-xs text-muted-foreground ml-1">
            ({formatHours(Number(entry.hours))})
          </span>
        )}
        {!readOnly && (
          <>
            {!isApproved && (
              <button
                type="button"
                onClick={onEdit}
                className="ml-2 p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors opacity-0 group-hover:opacity-100"
                aria-label="Bearbeiten"
                data-ocid="entry-edit-btn"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={onDelete}
              className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
              aria-label="Löschen"
              data-ocid="entry-delete-btn"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-3/4" />
    </div>
  );
}

function statusBadge(status: AbsenceStatus) {
  if (status === "approved")
    return (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
        Genehmigt
      </Badge>
    );
  if (status === "rejected")
    return <Badge variant="destructive">Abgelehnt</Badge>;
  return <Badge variant="secondary">Ausstehend</Badge>;
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

/** Normalises legacy feiertagsberechnungsart values to the new canonical values */
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

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ZeitenPage() {
  const navigate = useNavigate();
  const { isAuthenticated, companyId, employeeId, role } = useAuth();
  const { actor, isFetching } = useActor(createActor);
  const timezone = useCompanyTimezone();

  useEffect(() => {
    if (!isAuthenticated || !companyId) navigate({ to: "/" });
  }, [isAuthenticated, companyId, navigate]);

  const isAdminOrManager = role === "admin" || role === "manager";

  // ─── View / Navigation ─────────────────────────────────────────────────────
  const [viewMode, setViewMode] = useState<ViewMode>("week");

  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const todayStr = toDateStringInTz(new Date(), "Europe/Zurich");
    return getWeekStartFromDateString(todayStr);
  });

  const [selectedDayStr, setSelectedDayStr] = useState<string>(() =>
    toDateStringInTz(new Date(), "Europe/Zurich"),
  );

  const [selectedEmployeeFilter, setSelectedEmployeeFilter] = useState<string>(
    () => employeeId ?? "all",
  );

  // ─── Time Entry Data ───────────────────────────────────────────────────────
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [projectMembers, setProjectMembers] = useState<
    Map<string, ProjectMemberAssignment[]>
  >(new Map());
  const [isLoadingTime, setIsLoadingTime] = useState(true);

  // ─── Employment Data (for Soll-hours in ganztaetig absences) ──────────────
  const [employments, setEmployments] = useState<Employment[]>([]);

  useEffect(() => {
    if (!actor || isFetching || !employeeId) return;
    const empId =
      selectedEmployeeFilter !== "all" ? selectedEmployeeFilter : employeeId;
    toAny(actor)
      .listEmployments(BigInt(empId))
      .then((res) => {
        const r = res as { __kind__: string; ok?: Employment[] };
        if (r.__kind__ === "ok") setEmployments(r.ok ?? []);
      })
      .catch(() => setEmployments([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actor, isFetching, employeeId, selectedEmployeeFilter]);

  // ─── Holiday Data ──────────────────────────────────────────────────────────
  const [holidays, setHolidays] = useState<Holiday[]>([]);

  useEffect(() => {
    if (!actor || isFetching) return;
    toAny(actor)
      .listHolidays()
      .then((res) => setHolidays((res as Holiday[]) ?? []))
      .catch(() => setHolidays([]));
  }, [actor, isFetching]);

  // ─── Absence Data ──────────────────────────────────────────────────────────
  const [absenceTypes, setAbsenceTypes] = useState<AbsenceType[]>([]);
  const [myAbsences, setMyAbsences] = useState<Absence[]>([]);
  const [isLoadingAbsences, setIsLoadingAbsences] = useState(true);

  // ─── Standard blocks (new multi-block model) ───────────────────────────────
  const [stdBlocks, setStdBlocks] =
    useState<StandardarbeitszeitenBlocks>(EMPTY_STD_BLOCKS);
  const [stdBlockErrors, setStdBlockErrors] = useState<
    Partial<Record<DayKey, string[]>>
  >({});
  const [isSavingStd, setIsSavingStd] = useState(false);
  const [isLoadingStd, setIsLoadingStd] = useState(true);

  // Legacy stdHoursForm (used for weekTarget/balance calculation)
  const [stdHoursForm, setStdHoursForm] = useState<StdHoursForm>({
    monday: "08:00",
    tuesday: "08:00",
    wednesday: "08:00",
    thursday: "08:00",
    friday: "08:00",
    saturday: "00:00",
    sunday: "00:00",
  });

  // ─── Time Dialog ───────────────────────────────────────────────────────────
  const [timeDialogOpen, setTimeDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
  const [timeDialogDate, setTimeDialogDate] = useState<string>("");

  // ─── Std-Zeit-Erfassen Dialog ──────────────────────────────────────────────
  const [stdZeitMessage, setStdZeitMessage] = useState<string | null>(null);

  function showStdZeitMsg(msg: string) {
    setStdZeitMessage(msg);
    setTimeout(() => setStdZeitMessage(null), 5000);
  }

  // ─── Absence Dialog ────────────────────────────────────────────────────────
  const [showAbsenceDialog, setShowAbsenceDialog] = useState(false);
  const [editAbsence, setEditAbsence] = useState<Absence | null>(null);
  const [absenceForm, setAbsenceForm] = useState<AbsenceFormState>({
    absenceTypeId: "",
    dateFrom: "",
    dateTo: "",
    description: "",
    dauer: "",
  });
  const [absenceErrors, setAbsenceErrors] = useState<Record<string, string>>(
    {},
  );
  const [isSavingAbsence, setIsSavingAbsence] = useState(false);

  // ─── Vacation Dialog ───────────────────────────────────────────────────────
  const [showVacationDialog, setShowVacationDialog] = useState(false);
  const [editVacation, setEditVacation] = useState<Absence | null>(null);
  const [vacationForm, setVacationForm] = useState<VacationFormState>({
    dateFrom: "",
    dateTo: "",
    description: "",
    ganztaetig: true,
    dauerInput: "",
  });
  const [vacationErrors, setVacationErrors] = useState<Record<string, string>>(
    {},
  );
  const [isSavingVacation, setIsSavingVacation] = useState(false);

  // ─── Delete Confirmation ───────────────────────────────────────────────────
  type DeleteTarget =
    | { kind: "timeEntry"; entry: TimeEntry }
    | { kind: "absence"; id: bigint };
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ─── Load Time Data ────────────────────────────────────────────────────────
  const loadTimeData = useCallback(async () => {
    if (!actor || isFetching) return;
    setIsLoadingTime(true);
    try {
      const weekEnd = addDays(currentWeekStart, 6);

      // FIX 1: when a specific employee is selected, always pass their ID to
      // the backend so only their entries come back. Never pass an empty filter
      // when a specific employee is chosen.
      const filter: {
        dateFrom: string;
        dateTo: string;
        employeeId?: bigint;
      } = {
        dateFrom: toDateString(currentWeekStart),
        dateTo: toDateString(weekEnd),
      };
      if (selectedEmployeeFilter !== "all") {
        filter.employeeId = BigInt(selectedEmployeeFilter);
      }

      const [entriesRes, projectsRes, serviceTypesRes] = await Promise.all([
        toAny(actor).listTimeEntries(filter) as Promise<TimeEntry[]>,
        toAny(actor).listProjects() as Promise<Project[]>,
        toAny(actor).listServiceTypes() as Promise<ServiceType[]>,
      ]);

      const activeProjects = (projectsRes ?? []).filter((p) => p.active);
      setEntries(entriesRes ?? []);
      setProjects(activeProjects);
      setServiceTypes(serviceTypesRes ?? []);

      // Load project members for StdZeitErfassenDialog
      const memberMap = new Map<string, ProjectMemberAssignment[]>();
      await Promise.all(
        activeProjects.map(async (p) => {
          try {
            const res = (await toAny(actor).getProjectMembers(p.id)) as
              | { __kind__: "ok"; ok: ProjectMemberAssignment[] }
              | { __kind__: "err"; err: string };
            if (res.__kind__ === "ok") memberMap.set(String(p.id), res.ok);
          } catch {
            /* ignore */
          }
        }),
      );
      setProjectMembers(memberMap);

      if (isAdminOrManager) {
        const emps = (await toAny(actor).listEmployees()) as Employee[];
        setEmployees(emps ?? []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Fehler beim Laden der Zeiteinträge");
    } finally {
      setIsLoadingTime(false);
    }
  }, [
    actor,
    isFetching,
    currentWeekStart,
    selectedEmployeeFilter,
    isAdminOrManager,
  ]);

  const loadTimeDataRef = useRef(loadTimeData);
  loadTimeDataRef.current = loadTimeData;

  // biome-ignore lint/correctness/useExhaustiveDependencies: loadTimeDataRef.current is stable ref
  useEffect(() => {
    void loadTimeDataRef.current();
  }, [actor, isFetching, currentWeekStart, selectedEmployeeFilter]);

  // ─── Load Absence Data ─────────────────────────────────────────────────────
  const loadAbsenceData = useCallback(async () => {
    if (!actor || isFetching) return;
    setIsLoadingAbsences(true);
    try {
      // FIX 1: when a specific employee is selected, pass their ID to the
      // backend so only their absences are returned — mirrors loadTimeData().
      const absenceFilter: { employeeId?: bigint } =
        selectedEmployeeFilter !== "all"
          ? { employeeId: BigInt(selectedEmployeeFilter) }
          : {};

      const [typesRes, absencesRes] = await Promise.all([
        toAny(actor).listAbsenceTypes() as Promise<AbsenceType[]>,
        toAny(actor).listAbsences(absenceFilter) as Promise<Absence[]>,
      ]);
      setAbsenceTypes(typesRes ?? []);
      setMyAbsences(absencesRes ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingAbsences(false);
    }
  }, [actor, isFetching, selectedEmployeeFilter]);

  const loadAbsenceDataRef = useRef(loadAbsenceData);
  loadAbsenceDataRef.current = loadAbsenceData;

  // biome-ignore lint/correctness/useExhaustiveDependencies: ref pattern
  useEffect(() => {
    void loadAbsenceDataRef.current();
  }, [actor, isFetching, selectedEmployeeFilter]);

  // ─── Load Standard Blocks ─────────────────────────────────────────────────
  const loadStdBlocks = useCallback(async () => {
    if (!actor || isFetching || !employeeId) return;
    setIsLoadingStd(true);
    try {
      // Try new multi-block API first; fall back to legacy getStandardarbeitszeiten
      const a = toAny(actor);
      if (typeof a.getMyStandardarbeitszeiten === "function") {
        const res = (await a.getMyStandardarbeitszeiten()) as
          | { __kind__: "ok"; ok: StandardarbeitszeitenBlocks }
          | { __kind__: "err"; err: string };
        if (res.__kind__ === "ok") {
          setStdBlocks(res.ok ?? EMPTY_STD_BLOCKS);
        }
      } else {
        // Legacy: single hour value per day → no blocks
        const res = (await a.getStandardarbeitszeiten(BigInt(employeeId))) as
          | { __kind__: "ok"; ok: StandardWeeklyHours }
          | { __kind__: "err"; err: string };
        if (res.__kind__ === "ok") {
          const h = res.ok;
          setStdHoursForm({
            monday: minutesToHHMM(Number(h.monday)),
            tuesday: minutesToHHMM(Number(h.tuesday)),
            wednesday: minutesToHHMM(Number(h.wednesday)),
            thursday: minutesToHHMM(Number(h.thursday)),
            friday: minutesToHHMM(Number(h.friday)),
            saturday: minutesToHHMM(Number(h.saturday)),
            sunday: minutesToHHMM(Number(h.sunday)),
          });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingStd(false);
    }
  }, [actor, isFetching, employeeId]);

  const loadStdRef = useRef(loadStdBlocks);
  loadStdRef.current = loadStdBlocks;

  // biome-ignore lint/correctness/useExhaustiveDependencies: ref pattern
  useEffect(() => {
    void loadStdRef.current();
  }, [actor, isFetching, employeeId]);

  // ─── Holiday helpers ───────────────────────────────────────────────────────

  /** Returns holidays that fall on a given dateStr */
  const holidaysForDay = useCallback(
    (dateStr: string): Holiday[] => holidays.filter((h) => h.date === dateStr),
    [holidays],
  );

  /**
   * Calculate Ist-minutes for holidays on a given date, using the employee's
   * Feiertagsberechnungsart from the active employment.
   */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const holidayIstMinutesForDay = useCallback(
    (dateStr: string): number => {
      const dayHolidays = holidays.filter((h) => h.date === dateStr);
      if (dayHolidays.length === 0) return 0;
      const emp =
        getActiveEmploymentForDate(employments, dateStr) ??
        getMostRecentEmploymentBefore(employments, dateStr);
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
          // No credit at all
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
    },
    [holidays, employments],
  );

  const vacationType = useMemo(
    () =>
      absenceTypes.find(
        (t) => t.name.toLowerCase() === "ferien" && t.requiresApproval,
      ) ??
      absenceTypes.find(
        (t) => t.requiresApproval && t.name.toLowerCase().includes("feri"),
      ) ??
      absenceTypes.find((t) => t.requiresApproval),
    [absenceTypes],
  );
  const nonVacationTypes = useMemo(
    () => absenceTypes.filter((t) => t.id !== vacationType?.id && t.aktiv),
    [absenceTypes, vacationType],
  );
  const regularAbsences = useMemo(
    () =>
      myAbsences.filter(
        (a) => !vacationType || a.absenceTypeId !== vacationType.id,
      ),
    [myAbsences, vacationType],
  );
  const vacationAbsences = useMemo(
    () =>
      myAbsences.filter(
        (a) => vacationType && a.absenceTypeId === vacationType.id,
      ),
    [myAbsences, vacationType],
  );

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i)),
    [currentWeekStart],
  );

  // FIX 1: strict client-side filter as safety net — only entries for the
  // selected employee are shown. Backend also filters but this guards against
  // stale data or partial backend support.
  const entriesByDate = useMemo(() => {
    const map: Record<string, TimeEntry[]> = {};
    const filteredEntries =
      selectedEmployeeFilter !== "all"
        ? entries.filter(
            (e) => String(e.employeeId) === String(selectedEmployeeFilter),
          )
        : entries;
    for (const e of filteredEntries) {
      if (!map[e.date]) map[e.date] = [];
      map[e.date].push(e);
    }
    return map;
  }, [entries, selectedEmployeeFilter]);

  const absencesByDate = useMemo(() => {
    const map: Record<string, Absence[]> = {};
    const weekDateStrings = weekDays.map(toDateString);
    // FIX 1: client-side safety net — only show absences for the selected employee
    const filteredAbsences =
      selectedEmployeeFilter !== "all"
        ? myAbsences.filter(
            (a) => String(a.employeeId) === String(selectedEmployeeFilter),
          )
        : myAbsences;
    for (const a of filteredAbsences) {
      for (const dateStr of weekDateStrings) {
        if (dateStr >= a.dateFrom && dateStr <= a.dateTo) {
          if (!map[dateStr]) map[dateStr] = [];
          map[dateStr].push(a);
        }
      }
    }
    return map;
  }, [myAbsences, weekDays, selectedEmployeeFilter]);

  const totalHoursForDay = (dateStr: string): number => {
    // Base: sum actual time entries for this day
    let total = (entriesByDate[dateStr] ?? []).reduce(
      (s, e) => s + Number(e.hours),
      0,
    );
    // FIX 1: only include absences for the currently selected employee
    const scopedAbsences =
      selectedEmployeeFilter !== "all"
        ? myAbsences.filter(
            (a) => String(a.employeeId) === String(selectedEmployeeFilter),
          )
        : myAbsences;
    // Add approved vacations and compensated absences
    const aMap = new Map(absenceTypes.map((t) => [String(t.id), t]));
    for (const a of scopedAbsences) {
      if (a.status !== "approved") continue;
      // Only cover dates that include this day
      if (dateStr < a.dateFrom || dateStr > a.dateTo) continue;
      const absType = aMap.get(String(a.absenceTypeId));
      const isVacation = absType?.requiresApproval ?? false;
      const isCompensated = absType?.compensated ?? false;
      if (!isVacation && !isCompensated) continue;
      if (a.ganztaetig) {
        // Use Soll-minutes from the valid employment for this date.
        // Fall back to the most recent employment before this date if no active one found
        // (handles edge cases where employment ended before the absence date).
        const activeEmp =
          getActiveEmploymentForDate(employments, dateStr) ??
          getMostRecentEmploymentBefore(employments, dateStr);
        const sollMinutes = activeEmp
          ? getEmploymentMinutesForDate(activeEmp, dateStr)
          : 0;
        total += sollMinutes / 60;
      } else {
        // dauer is stored in minutes as bigint
        total += Number(a.dauer) / 60;
      }
    }
    // Add holiday Ist-hours
    total += holidayIstMinutesForDay(dateStr) / 60;
    return total;
  };

  const weekTotal = useMemo(() => {
    let total = weekDays.reduce(
      (s, d) =>
        s +
        (entriesByDate[toDateString(d)] ?? []).reduce(
          (acc, e) => acc + Number(e.hours),
          0,
        ),
      0,
    );
    // FIX 1: only include absences for the currently selected employee
    const scopedAbsences =
      selectedEmployeeFilter !== "all"
        ? myAbsences.filter(
            (a) => String(a.employeeId) === String(selectedEmployeeFilter),
          )
        : myAbsences;
    const aMap = new Map(absenceTypes.map((t) => [String(t.id), t]));
    for (const a of scopedAbsences) {
      if (a.status !== "approved") continue;
      const aTypeId = String(a.absenceTypeId);
      const absenceType = aMap.get(aTypeId);
      const isVacation = absenceType?.requiresApproval ?? false;
      const isCompensated = absenceType?.compensated ?? false;
      if (!isVacation && !isCompensated) continue;
      for (const day of weekDays) {
        const dateStr = toDateString(day);
        if (dateStr >= a.dateFrom && dateStr <= a.dateTo) {
          if (a.ganztaetig) {
            // Use actual employment data for ganztaetig absences
            // Fall back to most recent employment if no active one found
            const activeEmp =
              getActiveEmploymentForDate(employments, dateStr) ??
              getMostRecentEmploymentBefore(employments, dateStr);
            const dayMinutes = activeEmp
              ? getEmploymentMinutesForDate(activeEmp, dateStr)
              : 0;
            total += dayMinutes / 60;
          } else {
            total += Number(a.dauer) / 60;
          }
        }
      }
    }
    // Add holiday Ist-hours for each day of the week
    for (const day of weekDays) {
      total += holidayIstMinutesForDay(toDateString(day)) / 60;
    }
    return total;
  }, [
    weekDays,
    myAbsences,
    absenceTypes,
    entriesByDate,
    employments,
    selectedEmployeeFilter,
    holidayIstMinutesForDay,
  ]);

  const weekTarget = useMemo(() => {
    // Compute Soll-minutes from the active employment for each day of the week
    if (employments.length === 0) {
      // Fallback to stdHoursForm if no employment data
      const keys: DayKey[] = [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ];
      return (
        keys.reduce(
          (sum, key) => sum + hhmmToMinutes(stdHoursForm[key] || "00:00"),
          0,
        ) / 60
      );
    }
    let totalMinutes = 0;
    for (const day of weekDays) {
      const dateStr = toDateString(day);
      const emp = getActiveEmploymentForDate(employments, dateStr);
      if (emp) {
        totalMinutes += getEmploymentMinutesForDate(emp, dateStr);
      }
    }
    return totalMinutes / 60;
  }, [weekDays, employments, stdHoursForm]);

  // ─── Arbeitszeitsaldo ─────────────────────────────────────────────────────
  const [workTimeBalance, setWorkTimeBalance] =
    useState<WorkTimeBalance | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  const loadWorkTimeBalance = useCallback(async () => {
    if (!actor || isFetching || !employeeId) return;
    setIsLoadingBalance(true);
    try {
      let startDate: string | null = null;
      try {
        const emps = (await toAny(actor).listEmployments(
          BigInt(employeeId),
        )) as { __kind__: string; ok?: Employment[]; err?: string };
        if (emps.__kind__ === "ok" && emps.ok && emps.ok.length > 0) {
          const validEmps = emps.ok.filter((e) => {
            if (!e.von) return false;
            const secNum =
              typeof e.von === "bigint"
                ? Number(e.von)
                : Math.round(Number(e.von));
            if (secNum <= 0) return false;
            // Backend stores Unix seconds — multiply by 1000 for milliseconds
            const ms = secNum * 1000;
            const year = new Date(ms).getFullYear();
            return year >= 2000 && year <= 2100;
          });
          if (validEmps.length > 0) {
            const earliest = validEmps.reduce((min, e) =>
              e.von < min.von ? e : min,
            );
            // Use nanosToLocalIsoDate to get LOCAL date (not UTC) — avoids midnight TZ shift
            startDate = nanosToLocalIsoDate(earliest.von) || null;
          }
        }
      } catch {
        // fallback: no employment data
      }

      // End = last day of the CURRENTLY DISPLAYED week (Sunday of currentWeekStart)
      const weekEnd = toDateString(addDays(currentWeekStart, 6));

      if (!startDate) {
        setWorkTimeBalance(null);
        return;
      }

      const res = (await toAny(actor).getEmployeeWorkTimeBalance(
        BigInt(employeeId),
        startDate,
        weekEnd,
      )) as { __kind__: string; ok?: WorkTimeBalance; err?: string };
      if (res.__kind__ === "ok" && res.ok) {
        setWorkTimeBalance(res.ok);
      }
    } catch {
      // Non-fatal
    } finally {
      setIsLoadingBalance(false);
    }
  }, [actor, isFetching, employeeId, currentWeekStart]);

  const loadBalanceRef = useRef(loadWorkTimeBalance);
  loadBalanceRef.current = loadWorkTimeBalance;

  // biome-ignore lint/correctness/useExhaustiveDependencies: ref pattern
  useEffect(() => {
    void loadBalanceRef.current();
  }, [actor, isFetching, employeeId, currentWeekStart]);

  const projectMap = useMemo(
    () => new Map(projects.map((p) => [String(p.id), p])),
    [projects],
  );
  const serviceTypeMap = useMemo(
    () => new Map(serviceTypes.map((s) => [String(s.id), s])),
    [serviceTypes],
  );
  const absenceTypeMap = useMemo(
    () => new Map(absenceTypes.map((t) => [String(t.id), t])),
    [absenceTypes],
  );

  // ─── Admin read-only: viewing a different employee? ────────────────────────
  const isViewingOtherEmployee =
    isAdminOrManager &&
    selectedEmployeeFilter !== "all" &&
    selectedEmployeeFilter !== String(employeeId);

  // ─── Navigation ───────────────────────────────────────────────────────────
  const prevWeek = () => setCurrentWeekStart((d) => addDays(d, -7));
  const nextWeek = () => setCurrentWeekStart((d) => addDays(d, 7));
  const prevDay = () => {
    const [y, m, day] = selectedDayStr.split("-").map(Number);
    const d = new Date(Date.UTC(y, m - 1, day));
    d.setUTCDate(d.getUTCDate() - 1);
    setSelectedDayStr(toDateString(d));
  };
  const nextDay = () => {
    const [y, m, day] = selectedDayStr.split("-").map(Number);
    const d = new Date(Date.UTC(y, m - 1, day));
    d.setUTCDate(d.getUTCDate() + 1);
    setSelectedDayStr(toDateString(d));
  };

  // ─── Time Dialog Helpers ───────────────────────────────────────────────────

  function openNewEntry(dateStr?: string) {
    const d =
      dateStr ??
      (viewMode === "day" ? selectedDayStr : toDateString(currentWeekStart));
    setEditingEntry(null);
    setTimeDialogDate(d);
    setTimeDialogOpen(true);
  }

  function openEditEntry(entry: TimeEntry) {
    setEditingEntry(entry);
    setTimeDialogDate("");
    setTimeDialogOpen(true);
  }

  async function handleDeleteEntry(entry: TimeEntry) {
    const statusVal = String(
      (entry as unknown as Record<string, unknown>).status ?? "",
    ).toLowerCase();
    if (statusVal === "approved" && !isAdminOrManager) {
      setShowZeitenApprovedDeleteWarning(true);
      return;
    }
    setDeleteTarget({ kind: "timeEntry", entry });
  }

  async function executeDeleteEntry(entry: TimeEntry) {
    if (!actor) return;
    setIsDeleting(true);
    try {
      const res = (await toAny(actor).deleteTimeEntry(entry.id)) as {
        __kind__: string;
        err?: string;
      };
      if (res.__kind__ === "err") throw new Error(res.err);
      toast.success("Zeiteintrag gelöscht");
      void loadTimeDataRef.current();
    } catch (err) {
      toast.error(
        `Fehler: ${err instanceof Error ? err.message : "Unbekannter Fehler"}`,
      );
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  }

  // ─── Standardarbeitszeit erfassen handler ─────────────────────────────────
  async function handleStdZeitErfassen() {
    // Determine current date: day view uses selectedDayStr, week view uses today
    const targetDate = viewMode === "day" ? selectedDayStr : todayStr;
    const targetDateObj = new Date(`${targetDate}T12:00:00Z`);
    const utcDay = targetDateObj.getUTCDay();
    const dayKey = UTC_DAY_TO_KEY[utcDay];
    const blocks = stdBlocks[dayKey] ?? [];
    const weekdayName = DAY_NAMES[dayKey];

    if (blocks.length === 0) {
      showStdZeitMsg(`Keine Standardarbeitszeiten für ${weekdayName} erfasst.`);
      return;
    }

    // Check for existing entries on target date
    const existingEntries = entriesByDate[targetDate] ?? [];
    if (existingEntries.length > 0) {
      const confirmed = window.confirm(
        "Für diesen Tag sind bereits Zeiteinträge vorhanden. Trotzdem Standardarbeitszeit erfassen?",
      );
      if (!confirmed) return;
    }

    if (!actor) return;
    const a = toAny(actor);
    let created = 0;
    const skipped: string[] = [];

    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      if (!block.projektId || !block.leistungsartId) {
        skipped.push(
          `Block ${i + 1} (${block.von}–${block.bis}): Kein Projekt/Leistungsart hinterlegt`,
        );
        continue;
      }
      const vonMin = hhmmToMinutes(block.von);
      const bisMin = hhmmToMinutes(block.bis);
      if (vonMin === null || bisMin === null || bisMin <= vonMin) {
        skipped.push(`Block ${i + 1}: Ungültige Zeiten`);
        continue;
      }
      const hours = (bisMin - vonMin) / 60;
      // Determine if project uses zeitBlock mode
      const proj = projects.find(
        (p) => String(p.id) === String(block.projektId),
      );
      const isZeitBlock = proj?.erfassungsart === "zeitBlock";
      try {
        const res = (await a.createTimeEntry({
          date: targetDate,
          projectId: BigInt(block.projektId),
          serviceTypeId: BigInt(block.leistungsartId),
          hours,
          von: isZeitBlock ? block.von : "",
          bis: isZeitBlock ? block.bis : "",
          description: "",
          billable: false,
        })) as { __kind__: string; err?: string };
        if ("err" in res) throw new Error(res.err);
        created++;
      } catch (err) {
        skipped.push(
          `Block ${i + 1}: ${err instanceof Error ? err.message : "Fehler"}`,
        );
      }
    }

    if (skipped.length > 0) {
      for (const msg of skipped) toast.warning(msg);
    }
    if (created > 0) {
      toast.success(`${created} Zeiteintrag${created > 1 ? "e" : ""} erfasst`);
      void loadTimeDataRef.current();
    } else if (skipped.length > 0) {
      showStdZeitMsg(
        "Keine Einträge gespeichert. Bitte Projekt und Leistungsart in den Standardarbeitszeiten hinterlegen.",
      );
    }
  }

  // ─── Absence Helpers ───────────────────────────────────────────────────────

  function resetAbsenceForms() {
    setAbsenceForm({
      absenceTypeId: "",
      dateFrom: "",
      dateTo: "",
      description: "",
      dauer: "",
    });
    setVacationForm({
      dateFrom: "",
      dateTo: "",
      description: "",
      ganztaetig: true,
      dauerInput: "",
    });
    setAbsenceErrors({});
    setVacationErrors({});
    setEditAbsence(null);
    setEditVacation(null);
  }

  function openEditVacationDialog(absence: Absence) {
    setEditVacation(absence);
    setVacationForm({
      dateFrom: absence.dateFrom,
      dateTo: absence.dateTo,
      description: absence.description ?? "",
      ganztaetig: absence.ganztaetig,
      dauerInput: absence.ganztaetig
        ? ""
        : minutesToHHMM(Number(absence.dauer)),
    });
    setShowVacationDialog(true);
  }

  function openEditAbsenceDialog(absence: Absence) {
    setEditAbsence(absence);
    setAbsenceForm({
      absenceTypeId: String(absence.absenceTypeId),
      dateFrom: absence.dateFrom,
      dateTo: absence.dateTo,
      description: absence.description ?? "",
      dauer: "",
    });
    setShowAbsenceDialog(true);
  }

  const isSingleDayAbsence =
    absenceForm.dateFrom !== "" &&
    absenceForm.dateTo !== "" &&
    absenceForm.dateFrom === absenceForm.dateTo;

  function validateAbsenceForm(): boolean {
    const e: Record<string, string> = {};
    if (!absenceForm.absenceTypeId)
      e.absenceTypeId = "Bitte Abwesenheitsart wählen";
    if (!absenceForm.dateFrom) e.dateFrom = "Datum von ist erforderlich";
    if (!absenceForm.dateTo) e.dateTo = "Datum bis ist erforderlich";
    if (
      absenceForm.dateFrom &&
      absenceForm.dateTo &&
      absenceForm.dateTo < absenceForm.dateFrom
    )
      e.dateTo = "Datum bis muss nach Datum von liegen";
    if (isSingleDayAbsence && !isValidHHMM(absenceForm.dauer)) {
      e.dauer = "Bitte gültige Dauer eingeben (hh:mm)";
    }
    setAbsenceErrors(e);
    return Object.keys(e).length === 0;
  }

  function validateVacationForm(): boolean {
    const e: Record<string, string> = {};
    if (!vacationForm.dateFrom) e.dateFrom = "Datum von ist erforderlich";
    if (!vacationForm.dateTo) e.dateTo = "Datum bis ist erforderlich";
    if (
      vacationForm.dateFrom &&
      vacationForm.dateTo &&
      vacationForm.dateTo < vacationForm.dateFrom
    )
      e.dateTo = "Datum bis muss nach Datum von liegen";
    if (!vacationForm.ganztaetig) {
      const mins = hhmmToMinutes(vacationForm.dauerInput);
      if (mins === null || mins <= 0)
        e.dauerInput = "Bitte gültige Dauer eingeben (z.B. 04:00)";
    }
    setVacationErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submitAbsence() {
    if (!validateAbsenceForm() || !actor) return;
    setIsSavingAbsence(true);
    try {
      const typeId = absenceTypes.find(
        (t) => String(t.id) === absenceForm.absenceTypeId,
      )?.id;
      if (!typeId) throw new Error("Abwesenheitsart nicht gefunden");

      const isMultiDay = absenceForm.dateFrom !== absenceForm.dateTo;
      const dauerMinutes = isSingleDayAbsence
        ? (hhmmToMinutes(absenceForm.dauer) ?? 0)
        : 0;

      if (editAbsence) {
        const input: UpdateAbsenceInput = {
          dateFrom: absenceForm.dateFrom,
          dateTo: absenceForm.dateTo,
          ganztaetig: isMultiDay,
          dauer: BigInt(dauerMinutes),
          description: absenceForm.description || undefined,
        };
        const res = (await toAny(actor).updateAbsence(
          editAbsence.id,
          input,
        )) as { __kind__: string; err?: string };
        if (res.__kind__ === "err") throw new Error(res.err);
        toast.success("Abwesenheit aktualisiert");
      } else {
        const res = (await toAny(actor).createAbsence({
          absenceTypeId: typeId,
          dateFrom: absenceForm.dateFrom,
          dateTo: absenceForm.dateTo,
          ganztaetig: isMultiDay,
          dauer: BigInt(dauerMinutes),
          description: absenceForm.description || undefined,
        })) as { __kind__: string; err?: string };
        if (res.__kind__ === "err") throw new Error(res.err);
        toast.success("Abwesenheit erfasst");
      }
      setShowAbsenceDialog(false);
      resetAbsenceForms();
      void loadAbsenceDataRef.current();
    } catch (err) {
      toast.error(
        `Fehler: ${err instanceof Error ? err.message : "Unbekannter Fehler"}`,
      );
    } finally {
      setIsSavingAbsence(false);
    }
  }

  async function submitVacation() {
    // Guard must be set BEFORE any async work — disables the button immediately
    setIsSavingVacation(true);
    try {
      if (!validateVacationForm() || !actor) return;
      if (!vacationType) {
        toast.error("Keine Ferienabwesenheitsart konfiguriert");
        return;
      }

      // ── Feriensaldo-Prüfung ─────────────────────────────────────────────────
      // Check for new vacation entries (not edits).
      // Errors during the check block saving — no silent fallthrough.
      if (!editVacation) {
        const currentYear = new Date(
          `${vacationForm.dateFrom}T12:00:00`,
        ).getFullYear();
        const empIdForBalance = BigInt(
          selectedEmployeeFilter !== "all"
            ? selectedEmployeeFilter
            : (employeeId ?? "0"),
        );

        let checkPassed = false;
        let balanceCheckError: string | null = null;

        try {
          const [balancesRes, absencesRes, typesRes, employmentsRes] =
            await Promise.all([
              toAny(actor).listVacationBalances(empIdForBalance) as Promise<{
                __kind__: string;
                ok?: VacationBalance[];
              }>,
              toAny(actor).listAbsences({
                employeeId: empIdForBalance,
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
              toAny(actor).listEmployments(empIdForBalance) as Promise<{
                __kind__: string;
                ok?: Employment[];
              }>,
            ]);

          // Resolve fresh employments for the balance-check employee
          const freshEmployments =
            (employmentsRes as { __kind__: string; ok?: Employment[] })
              .__kind__ === "ok"
              ? ((employmentsRes as { __kind__: string; ok?: Employment[] })
                  .ok ?? [])
              : employments; // fall back to already-loaded state

          const balances =
            (balancesRes as { __kind__: string; ok?: VacationBalance[] })
              .__kind__ === "ok"
              ? ((balancesRes as { __kind__: string; ok?: VacationBalance[] })
                  .ok ?? [])
              : [];

          const vacTypeIds = new Set(
            (typesRes ?? [])
              .filter((t) => t.requiresApproval)
              .map((t) => String(t.id)),
          );

          const totalGranted = (balances as VacationBalance[])
            .filter((b) => Number(b.kalenderjahr) === currentYear)
            .reduce((sum, b) => sum + Number(b.dauer) / 100, 0);

          const usedDays = ((absencesRes as unknown[]) ?? [])
            .filter(
              (a: unknown) =>
                vacTypeIds.has(
                  String(
                    (
                      a as {
                        absenceTypeId: bigint;
                        status: string;
                        employeeId: bigint;
                      }
                    ).absenceTypeId,
                  ),
                ) &&
                // Include approved, submitted and pending — all non-rejected statuses count against balance
                ((
                  a as {
                    absenceTypeId: bigint;
                    status: string;
                    employeeId: bigint;
                  }
                ).status === "approved" ||
                  (
                    a as {
                      absenceTypeId: bigint;
                      status: string;
                      employeeId: bigint;
                    }
                  ).status === "submitted" ||
                  (
                    a as {
                      absenceTypeId: bigint;
                      status: string;
                      employeeId: bigint;
                    }
                  ).status === "pending") &&
                String(
                  (
                    a as {
                      absenceTypeId: bigint;
                      status: string;
                      employeeId: bigint;
                    }
                  ).employeeId,
                ) === String(empIdForBalance),
            )
            .reduce((sum: number, rawA) => {
              const a = rawA as {
                dateFrom: string;
                dateTo: string;
                ganztaetig: boolean;
                dauer: bigint;
              };
              const yFrom = new Date(`${a.dateFrom}T12:00:00`).getFullYear();
              const yTo = new Date(`${a.dateTo}T12:00:00`).getFullYear();
              if (yFrom !== currentYear && yTo !== currentYear) return sum;
              const effFrom =
                yFrom < currentYear ? `${currentYear}-01-01` : a.dateFrom;
              const effTo =
                yTo > currentYear ? `${currentYear}-12-31` : a.dateTo;
              // Use fresh employments for accurate day counting
              const days = countVacationDaysProportional(
                effFrom,
                effTo,
                a.ganztaetig,
                Number(a.dauer),
                freshEmployments,
              );
              // Fallback: if fresh employments unavailable, count calendar days
              return sum + (days > 0 ? days : daysBetween(effFrom, effTo));
            }, 0);

          // Calculate days requested in this vacation entry
          const dauerMinsForBalance = vacationForm.ganztaetig
            ? 0
            : (hhmmToMinutes(vacationForm.dauerInput) ?? 0);

          let requestedDays = countVacationDaysProportional(
            vacationForm.dateFrom,
            vacationForm.dateTo,
            vacationForm.ganztaetig,
            dauerMinsForBalance,
            freshEmployments,
          );
          // Fallback: no employment data → use calendar days (conservative)
          if (requestedDays === 0 && freshEmployments.length === 0) {
            requestedDays = daysBetween(
              vacationForm.dateFrom,
              vacationForm.dateTo,
            );
          }

          const availableDays = Math.max(totalGranted - usedDays, 0);

          if (requestedDays > availableDays + 0.001) {
            balanceCheckError = `Nicht genügend Feriensaldo. Verfügbar: ${availableDays.toFixed(1)} Tage, benötigt: ${requestedDays.toFixed(1)} Tage.`;
          } else {
            checkPassed = true;
          }
        } catch (err) {
          // Balance check failed due to a network/backend error — always set error, never allow silent bypass
          balanceCheckError = `Feriensaldo konnte nicht geprüft werden. Bitte versuche es erneut. (${err instanceof Error ? err.message : "Unbekannter Fehler"})`;
        }

        if (balanceCheckError) {
          toast.error(balanceCheckError);
          return;
        }
        if (!checkPassed) {
          toast.error(
            "Feriensaldo-Prüfung fehlgeschlagen. Bitte versuche es erneut.",
          );
          return;
        }
      }

      const dauerMinutes = vacationForm.ganztaetig
        ? 0
        : (hhmmToMinutes(vacationForm.dauerInput) ?? 0);

      if (editVacation) {
        const res = (await toAny(actor).updateAbsence(editVacation.id, {
          dateFrom: vacationForm.dateFrom,
          dateTo: vacationForm.dateTo,
          ganztaetig: vacationForm.ganztaetig,
          dauer: BigInt(dauerMinutes),
          description: vacationForm.description || undefined,
        })) as { __kind__: string; err?: string };
        if (res.__kind__ === "err") throw new Error(res.err);
        toast.success("Ferienantrag aktualisiert");
      } else {
        const res = (await toAny(actor).createAbsence({
          absenceTypeId: vacationType.id,
          dateFrom: vacationForm.dateFrom,
          dateTo: vacationForm.dateTo,
          ganztaetig: vacationForm.ganztaetig,
          dauer: BigInt(dauerMinutes),
          description: vacationForm.description || undefined,
        })) as { __kind__: string; err?: string };
        if (res.__kind__ === "err") throw new Error(res.err);
        toast.success("Ferienantrag eingereicht");
      }
      setShowVacationDialog(false);
      resetAbsenceForms();
      void loadAbsenceDataRef.current();
    } catch (err) {
      toast.error(
        `Fehler: ${err instanceof Error ? err.message : "Unbekannter Fehler"}`,
      );
    } finally {
      // Always reset the saving flag, regardless of success, error, or early return
      setIsSavingVacation(false);
    }
  }

  async function deleteAbsenceEntry(absence: { id: bigint; status: string }) {
    if (absence.status === "approved" && !isAdminOrManager) {
      toast.error(
        "Dieser Eintrag wurde bereits genehmigt. Bitte den Vorgesetzten bitten, die Genehmigung zuerst zurückzusetzen.",
      );
      return;
    }
    setDeleteTarget({ kind: "absence", id: absence.id });
  }

  async function executeDeleteAbsence(id: bigint) {
    if (!actor) return;
    setIsDeleting(true);
    try {
      const res = (await toAny(actor).deleteAbsence(id)) as {
        __kind__: string;
        err?: string;
      };
      if (res.__kind__ === "err") throw new Error(res.err);
      toast.success("Abwesenheit gelöscht");
      void loadAbsenceDataRef.current();
    } catch (err) {
      toast.error(
        `Fehler: ${err instanceof Error ? err.message : "Unbekannter Fehler"}`,
      );
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  }

  const canEditAbsence = (a: Absence) => {
    if (a.status === "approved" && !isAdminOrManager) return false;
    return (
      a.status === "submitted" ||
      a.status === ("pending" as AbsenceStatus) ||
      a.status === "rejected" ||
      (a.status === "approved" && isAdminOrManager)
    );
  };

  // State and handler for approved-entry delete warning dialog
  const [showZeitenApprovedDeleteWarning, setShowZeitenApprovedDeleteWarning] =
    useState(false);

  const handleDeleteAbsenceEntryClick = (a: Absence) => {
    const statusVal = String(a.status ?? "").toLowerCase();
    if (statusVal === "approved" && !isAdminOrManager) {
      setShowZeitenApprovedDeleteWarning(true);
      return;
    }
    void deleteAbsenceEntry(a);
  };

  function getTypeName(id: bigint): string {
    return absenceTypes.find((t) => t.id === id)?.name ?? String(id);
  }

  // ─── Standard Blocks Helpers ──────────────────────────────────────────────

  function addBlock(day: DayKey) {
    setStdBlocks((prev) => ({
      ...prev,
      [day]: [
        ...prev[day],
        { von: "", bis: "", projektId: null, leistungsartId: null },
      ],
    }));
  }

  function removeBlock(day: DayKey, index: number) {
    setStdBlocks((prev) => ({
      ...prev,
      [day]: prev[day].filter((_, i) => i !== index),
    }));
  }

  function updateBlock(
    day: DayKey,
    index: number,
    field: "von" | "bis" | "projektId" | "leistungsartId",
    value: string | number | null,
  ) {
    setStdBlocks((prev) => {
      const updated = prev[day].map((b, i) => {
        if (i !== index) return b;
        if (field === "projektId") {
          return {
            ...b,
            projektId: value as number | null,
            leistungsartId: null,
          };
        }
        return { ...b, [field]: value };
      });
      return { ...prev, [day]: updated };
    });
  }

  function validateStdBlocks(): boolean {
    const errors: Partial<Record<DayKey, string[]>> = {};
    const normalized = { ...stdBlocks };
    for (const day of DAY_KEYS) {
      normalized[day] = stdBlocks[day].map((b) => ({
        ...b,
        von: normalizeTimeInput(b.von) || b.von,
        bis: normalizeTimeInput(b.bis) || b.bis,
      }));
    }
    setStdBlocks(normalized);

    for (const day of DAY_KEYS) {
      const dayErrors: string[] = [];
      for (let i = 0; i < normalized[day].length; i++) {
        const block = normalized[day][i];
        if (!isValidHHMM(block.von)) {
          dayErrors.push(`Block ${i + 1}: Von ungültig (hh:mm)`);
        } else if (!isValidHHMM(block.bis)) {
          dayErrors.push(`Block ${i + 1}: Bis ungültig (hh:mm)`);
        } else if (hhmmToMinutes(block.bis) <= hhmmToMinutes(block.von)) {
          dayErrors.push(`Block ${i + 1}: Bis muss nach Von liegen`);
        }
      }
      if (dayErrors.length > 0) errors[day] = dayErrors;
    }
    setStdBlockErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function saveStdBlocks() {
    if (!validateStdBlocks() || !actor || !employeeId) return;
    setIsSavingStd(true);
    try {
      const a = toAny(actor);
      if (typeof a.setMyStandardarbeitszeiten === "function") {
        const res = (await a.setMyStandardarbeitszeiten(stdBlocks)) as {
          __kind__: string;
          err?: string;
        };
        if (res.__kind__ === "err") throw new Error(res.err);
      } else {
        // Legacy fallback: persist as minutes (no blocks)
        const hours: StandardWeeklyHours = {
          monday: BigInt(0),
          tuesday: BigInt(0),
          wednesday: BigInt(0),
          thursday: BigInt(0),
          friday: BigInt(0),
          saturday: BigInt(0),
          sunday: BigInt(0),
        };
        const res = (await a.setStandardarbeitszeiten(
          BigInt(employeeId),
          hours,
        )) as { __kind__: string; err?: string };
        if (res.__kind__ === "err") throw new Error(res.err);
      }
      toast.success("Standardarbeitszeiten gespeichert");
    } catch (err) {
      toast.error(
        `Fehler: ${err instanceof Error ? err.message : "Unbekannter Fehler"}`,
      );
    } finally {
      setIsSavingStd(false);
    }
  }

  // ─── Today's date string ───────────────────────────────────────────────────
  const todayStr = toDateStringInTz(new Date(), timezone);

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <Layout>
      <div className="p-4 md:p-6 space-y-5 max-w-6xl mx-auto">
        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              Zeiten erfassen
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Arbeitszeiten, Abwesenheiten und Ferien verwalten
            </p>
          </div>
        </div>

        {/* ── Main Tabs ── */}
        <Tabs defaultValue="zeit">
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="zeit" data-ocid="tab-zeit">
              <Clock className="w-4 h-4 mr-1.5" />
              Zeit
            </TabsTrigger>
            <TabsTrigger value="ferien" data-ocid="tab-ferien">
              <CalendarDays className="w-4 h-4 mr-1.5" />
              Ferien
            </TabsTrigger>
            <TabsTrigger value="abwesenheiten" data-ocid="tab-abwesenheiten">
              <CalendarDays className="w-4 h-4 mr-1.5" />
              Abwesenheiten
            </TabsTrigger>
            <TabsTrigger
              value="standardarbeitszeiten"
              data-ocid="tab-standardarbeitszeiten"
            >
              <Timer className="w-4 h-4 mr-1.5" />
              Standardarbeitszeiten
            </TabsTrigger>
          </TabsList>

          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* TAB: ZEIT                                                          */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          <TabsContent value="zeit" className="mt-4 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Employee filter — FIX 1: changing this reloads data with correct filter */}
                {isAdminOrManager && employees.length > 0 && (
                  <Select
                    value={selectedEmployeeFilter}
                    onValueChange={(v) => {
                      setSelectedEmployeeFilter(v);
                    }}
                  >
                    <SelectTrigger
                      className="w-48 h-9 text-sm"
                      data-ocid="employee-filter"
                    >
                      <SelectValue placeholder="Mitarbeiter wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle Mitarbeiter</SelectItem>
                      {employees.map((emp) => (
                        <SelectItem key={String(emp.id)} value={String(emp.id)}>
                          {emp.firstName} {emp.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {/* View toggle */}
                <fieldset className="flex rounded-lg border border-border overflow-hidden m-0 p-0">
                  <legend className="sr-only">Ansicht wählen</legend>
                  <button
                    type="button"
                    onClick={() => setViewMode("week")}
                    className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                      viewMode === "week"
                        ? "bg-primary text-primary-foreground"
                        : "bg-card text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                    data-ocid="view-week-btn"
                  >
                    Woche
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("day")}
                    className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                      viewMode === "day"
                        ? "bg-primary text-primary-foreground"
                        : "bg-card text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                    data-ocid="view-day-btn"
                  >
                    Tag
                  </button>
                </fieldset>
              </div>
              <div className="flex items-center gap-2">
                {/* Standardarbeitszeit erfassen button */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => void handleStdZeitErfassen()}
                  data-ocid="std-zeit-erfassen-btn"
                  title="Standardarbeitszeiten als Zeiteinträge erfassen"
                >
                  <Timer className="w-4 h-4 mr-1" />
                  Standardarbeitszeit erfassen
                </Button>
                <Button
                  size="sm"
                  onClick={() => openNewEntry()}
                  data-ocid="new-entry-btn"
                >
                  <PlusCircle className="w-4 h-4 mr-1" />
                  Neuer Eintrag
                </Button>
              </div>
            </div>

            {/* Inline message for std-zeit */}
            {stdZeitMessage && (
              <div className="rounded-lg bg-muted/60 border border-border px-4 py-2 text-sm text-muted-foreground">
                {stdZeitMessage}
              </div>
            )}

            {/* Read-only notice when viewing another employee */}
            {isViewingOtherEmployee && (
              <div className="rounded-lg bg-muted/50 border border-border px-4 py-2 text-sm text-muted-foreground flex items-center gap-2">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Nur-Lesen
                </span>
                <span>
                  Du siehst die Einträge eines anderen Mitarbeiters – Bearbeiten
                  und Löschen sind nicht möglich.
                </span>
              </div>
            )}

            {/* ── Week View ── */}
            {viewMode === "week" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-card border border-border rounded-xl px-4 py-2.5">
                  <button
                    type="button"
                    onClick={prevWeek}
                    className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                    aria-label="Vorherige Woche"
                    data-ocid="prev-week-btn"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-sm font-medium text-foreground">
                    {formatWeekLabel(currentWeekStart)}
                  </span>
                  <button
                    type="button"
                    onClick={nextWeek}
                    className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                    aria-label="Nächste Woche"
                    data-ocid="next-week-btn"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                {isLoadingTime ? (
                  <LoadingSkeleton />
                ) : (
                  <>
                    <div className="grid grid-cols-7 gap-2">
                      {weekDays.map((day, i) => {
                        const dateStr = toDateString(day);
                        const dayHours = totalHoursForDay(dateStr);
                        const isToday = todayStr === dateStr;
                        const isWeekend = i >= 5;
                        // Use actual employment data for target hours
                        const activeEmpForDay = getActiveEmploymentForDate(
                          employments,
                          dateStr,
                        );
                        const targetMinutes = activeEmpForDay
                          ? getEmploymentMinutesForDate(
                              activeEmpForDay,
                              dateStr,
                            )
                          : 0;
                        const target = targetMinutes / 60;
                        const dayAbsences = absencesByDate[dateStr] ?? [];
                        const hasVacation = dayAbsences.some(
                          (a) =>
                            vacationType && a.absenceTypeId === vacationType.id,
                        );
                        const hasAbsence = dayAbsences.some(
                          (a) =>
                            !vacationType ||
                            a.absenceTypeId !== vacationType.id,
                        );

                        return (
                          <button
                            key={dateStr}
                            type="button"
                            onClick={() => openNewEntry(dateStr)}
                            data-ocid={`day-cell-${i}`}
                            className={`relative flex flex-col items-center rounded-xl border p-3 text-center transition-colors hover:border-primary/50 hover:bg-primary/5 group cursor-pointer ${
                              isToday
                                ? "border-primary bg-primary/5"
                                : isWeekend
                                  ? "border-border bg-muted/30 opacity-70"
                                  : "border-border bg-card"
                            }`}
                          >
                            <span className="text-xs font-medium text-muted-foreground">
                              {DAY_LABELS[i]}
                            </span>
                            <span
                              className={`text-base font-semibold mt-0.5 ${isToday ? "text-primary" : "text-foreground"}`}
                            >
                              {dateStr.split("-")[2]}
                            </span>
                            <div className="mt-2 w-full">
                              <span
                                className={`text-sm font-bold tabular-nums block ${
                                  dayHours >= target && target > 0
                                    ? "text-emerald-600 dark:text-emerald-400"
                                    : dayHours > 0
                                      ? "text-amber-600 dark:text-amber-400"
                                      : "text-muted-foreground"
                                }`}
                              >
                                {dayHours > 0 ? formatHours(dayHours) : "–"}
                              </span>
                              {target > 0 && (
                                <span className="text-[10px] text-muted-foreground block">
                                  Soll: {minutesToHHMM(target * 60)}
                                </span>
                              )}
                            </div>
                            {(hasVacation || hasAbsence) && (
                              <div className="flex gap-0.5 mt-1.5 justify-center">
                                {hasVacation && (
                                  <span
                                    className="w-2 h-2 rounded-full bg-teal-500 inline-block"
                                    title="Ferien"
                                  />
                                )}
                                {hasAbsence && (
                                  <span
                                    className="w-2 h-2 rounded-full bg-amber-500 inline-block"
                                    title="Abwesenheit"
                                  />
                                )}
                              </div>
                            )}
                            <PlusCircle className="absolute bottom-1.5 right-1.5 w-3 h-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        );
                      })}
                    </div>

                    {myAbsences.length > 0 && (
                      <div className="flex items-center gap-4 text-xs text-muted-foreground px-1">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-teal-500 inline-block" />
                          Ferien
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                          Abwesenheit
                        </span>
                      </div>
                    )}

                    <div
                      className={`flex items-center justify-between rounded-xl border px-5 py-3 ${
                        weekTotal >= weekTarget
                          ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/30"
                          : "border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/30"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Clock
                          className={`w-4 h-4 ${weekTotal >= weekTarget ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}
                        />
                        <span className="text-sm font-medium text-foreground">
                          Gesamt dieser Woche
                        </span>
                      </div>
                      <span
                        className={`text-sm font-bold tabular-nums ${weekTotal >= weekTarget ? "text-emerald-700 dark:text-emerald-400" : "text-amber-700 dark:text-amber-400"}`}
                      >
                        {formatHours(weekTotal)} / Soll:{" "}
                        {minutesToHHMM(weekTarget * 60)}
                      </span>
                    </div>

                    {(workTimeBalance || isLoadingBalance) && (
                      <div className="flex items-center justify-between rounded-xl border border-border bg-card px-5 py-3">
                        <div className="flex items-center gap-2">
                          {workTimeBalance &&
                          Number(workTimeBalance.saldo) >= 0 ? (
                            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                          )}
                          <span className="text-sm font-medium text-foreground">
                            Arbeitszeitsaldo
                          </span>
                          <span className="text-xs text-muted-foreground hidden sm:inline">
                            (kumuliert ab Anstellungsbeginn bis Ende Woche{" "}
                            {formatDateDE(
                              toDateString(addDays(currentWeekStart, 6)),
                            )}
                            )
                          </span>
                        </div>
                        {isLoadingBalance ? (
                          <span className="text-sm text-muted-foreground">
                            …
                          </span>
                        ) : workTimeBalance ? (
                          <span
                            className={`text-sm font-bold tabular-nums ${
                              Number(workTimeBalance.saldo) >= 0
                                ? "text-emerald-700 dark:text-emerald-400"
                                : "text-amber-700 dark:text-amber-400"
                            }`}
                          >
                            {Number(workTimeBalance.saldo) >= 0 ? "+" : "–"}
                            {minutesToHHMM(
                              Math.abs(Number(workTimeBalance.saldo)),
                            )}
                          </span>
                        ) : null}
                      </div>
                    )}

                    <div className="space-y-4">
                      {weekDays.map((day) => {
                        const dateStr = toDateString(day);
                        const dayEntries = entriesByDate[dateStr] ?? [];
                        const dayAbsences = absencesByDate[dateStr] ?? [];
                        const dayHolidays = holidaysForDay(dateStr);
                        if (
                          dayEntries.length === 0 &&
                          dayAbsences.length === 0 &&
                          dayHolidays.length === 0
                        )
                          return null;
                        return (
                          <div key={dateStr}>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                {formatDayLabel(dateStr)}
                              </span>
                              <div className="flex-1 h-px bg-border" />
                              <span className="text-xs font-semibold text-primary tabular-nums">
                                {formatHours(totalHoursForDay(dateStr))}
                              </span>
                            </div>
                            {/* Holiday rows (read-only) */}
                            {dayHolidays.length > 0 && (
                              <div className="flex flex-col gap-1 mb-2">
                                {dayHolidays.map((h) => {
                                  const hMins =
                                    holidayIstMinutesForDay(dateStr);
                                  return (
                                    <div
                                      key={String(h.id)}
                                      className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium bg-[#006066]/8 text-[#006066] border border-[#006066]/25 dark:bg-[#006066]/20 dark:text-teal-200 dark:border-[#006066]/40"
                                      data-ocid="holiday-row"
                                    >
                                      <CalendarDays className="w-3 h-3 flex-shrink-0" />
                                      <span>{h.name}</span>
                                      <span className="text-[10px] opacity-60 ml-1">
                                        {h.ganztaegig
                                          ? "ganztägig"
                                          : "halbtägig"}
                                      </span>
                                      {hMins > 0 && (
                                        <span className="ml-auto tabular-nums font-semibold">
                                          {minutesToHHMM(hMins)}
                                        </span>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                            {dayAbsences.length > 0 && (
                              <div className="flex flex-col gap-1 mb-2">
                                {dayAbsences.map((a) => {
                                  const isVac =
                                    vacationType &&
                                    a.absenceTypeId === vacationType.id;
                                  const typeName =
                                    absenceTypeMap.get(String(a.absenceTypeId))
                                      ?.name ?? "–";
                                  return (
                                    <div
                                      key={String(a.id)}
                                      className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium ${
                                        isVac
                                          ? "bg-teal-50 text-teal-800 border border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800"
                                          : "bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
                                      }`}
                                    >
                                      <CalendarDays className="w-3 h-3 flex-shrink-0" />
                                      <span>{typeName}</span>
                                      <span className="ml-auto text-xs opacity-70">
                                        {formatDateDE(a.dateFrom)} –{" "}
                                        {formatDateDE(a.dateTo)}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                            <div className="space-y-1.5">
                              {dayEntries.map((entry) => (
                                <EntryRow
                                  key={String(entry.id)}
                                  entry={entry}
                                  project={projectMap.get(
                                    String(entry.projectId),
                                  )}
                                  serviceType={serviceTypeMap.get(
                                    String(entry.serviceTypeId),
                                  )}
                                  onEdit={() => openEditEntry(entry)}
                                  onDelete={() => handleDeleteEntry(entry)}
                                  readOnly={isViewingOtherEmployee}
                                />
                              ))}
                            </div>
                          </div>
                        );
                      })}
                      {Object.keys(entriesByDate).length === 0 &&
                        myAbsences.length === 0 &&
                        !isLoadingTime && (
                          <div
                            className="flex flex-col items-center justify-center py-12 text-center"
                            data-ocid="empty-state"
                          >
                            <Clock className="w-10 h-10 text-muted-foreground/40 mb-3" />
                            <p className="text-sm font-medium text-muted-foreground">
                              Keine Zeiteinträge diese Woche
                            </p>
                            <p className="text-xs text-muted-foreground/60 mt-1">
                              Klicken Sie auf einen Tag oder auf "Neuer Eintrag"
                            </p>
                          </div>
                        )}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ── Day View ── */}
            {viewMode === "day" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-card border border-border rounded-xl px-4 py-2.5">
                  <button
                    type="button"
                    onClick={prevDay}
                    className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                    aria-label="Vorheriger Tag"
                    data-ocid="prev-day-btn"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-sm font-medium text-foreground capitalize">
                    {formatDayLabel(selectedDayStr)}
                  </span>
                  <button
                    type="button"
                    onClick={nextDay}
                    className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                    aria-label="Nächster Tag"
                    data-ocid="next-day-btn"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                {(() => {
                  const dayHours = totalHoursForDay(selectedDayStr);
                  const dayEntries = entriesByDate[selectedDayStr] ?? [];
                  const dayAbsences = absencesByDate[selectedDayStr] ?? [];
                  const dayHolidays = holidaysForDay(selectedDayStr);
                  const dayHolidayMins =
                    holidayIstMinutesForDay(selectedDayStr);
                  return (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between bg-card border border-border rounded-xl px-5 py-3">
                        <span className="text-sm text-muted-foreground">
                          Erfasste Stunden
                        </span>
                        <span
                          className={`text-sm font-bold tabular-nums ${dayHours >= 8 ? "text-emerald-600 dark:text-emerald-400" : dayHours > 0 ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"}`}
                        >
                          {formatHours(dayHours)} / 08:00
                        </span>
                      </div>

                      {/* Holiday rows (read-only) */}
                      {dayHolidays.length > 0 && (
                        <div className="flex flex-col gap-1">
                          {dayHolidays.map((h) => (
                            <div
                              key={String(h.id)}
                              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-[#006066]/8 text-[#006066] border border-[#006066]/25 dark:bg-[#006066]/20 dark:text-teal-200 dark:border-[#006066]/40"
                              data-ocid="holiday-row-day"
                            >
                              <CalendarDays className="w-4 h-4 flex-shrink-0" />
                              <span>{h.name}</span>
                              <span className="text-xs opacity-60 ml-1">
                                {h.ganztaegig ? "ganztägig" : "halbtägig"}
                              </span>
                              {dayHolidayMins > 0 && (
                                <span className="ml-auto tabular-nums font-semibold text-sm">
                                  {minutesToHHMM(dayHolidayMins)}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {dayAbsences.length > 0 && (
                        <div className="flex flex-col gap-1">
                          {dayAbsences.map((a) => {
                            const isVac =
                              vacationType &&
                              a.absenceTypeId === vacationType.id;
                            const typeName =
                              absenceTypeMap.get(String(a.absenceTypeId))
                                ?.name ?? "–";
                            return (
                              <div
                                key={String(a.id)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                                  isVac
                                    ? "bg-teal-50 text-teal-800 border border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800"
                                    : "bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
                                }`}
                              >
                                <CalendarDays className="w-4 h-4 flex-shrink-0" />
                                <span>{typeName}</span>
                                <span className="ml-auto text-xs opacity-70">
                                  {formatDateDE(a.dateFrom)} –{" "}
                                  {formatDateDE(a.dateTo)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {isLoadingTime ? (
                        <LoadingSkeleton />
                      ) : dayEntries.length === 0 ? (
                        <div
                          className="flex flex-col items-center justify-center py-12 text-center"
                          data-ocid="empty-state-day"
                        >
                          <Clock className="w-10 h-10 text-muted-foreground/40 mb-3" />
                          <p className="text-sm font-medium text-muted-foreground">
                            Keine Einträge für diesen Tag
                          </p>
                          <Button
                            size="sm"
                            variant="outline"
                            className="mt-3"
                            onClick={() => openNewEntry(selectedDayStr)}
                            data-ocid="empty-new-entry-btn"
                          >
                            <PlusCircle className="w-4 h-4 mr-1" />
                            Eintrag hinzufügen
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          {dayEntries.map((entry) => (
                            <EntryRow
                              key={String(entry.id)}
                              entry={entry}
                              project={projectMap.get(String(entry.projectId))}
                              serviceType={serviceTypeMap.get(
                                String(entry.serviceTypeId),
                              )}
                              onEdit={() => openEditEntry(entry)}
                              onDelete={() => handleDeleteEntry(entry)}
                              readOnly={isViewingOtherEmployee}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}
          </TabsContent>

          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* TAB: FERIEN                                                        */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          <TabsContent value="ferien" className="mt-4 space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Ferienanträge einreichen und Status verfolgen
              </p>
              <Button
                type="button"
                onClick={() => {
                  resetAbsenceForms();
                  setShowVacationDialog(true);
                }}
                className="gap-2"
                data-ocid="btn-ferienantrag-stellen"
              >
                <PlusCircle className="w-4 h-4" />
                Ferienantrag stellen
              </Button>
            </div>

            <Card className="shadow-card">
              <CardContent className="p-0">
                {isLoadingAbsences ? (
                  <div className="p-4 space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>
                ) : vacationAbsences.length === 0 ? (
                  <div
                    className="flex flex-col items-center justify-center py-16 gap-3 text-center"
                    data-ocid="empty-ferien"
                  >
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                      <CalendarDays className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Keine Ferienanträge
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Stellen Sie einen Antrag für Ihre Ferien.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Zeitraum</TableHead>
                          <TableHead className="text-right">Tage</TableHead>
                          <TableHead>Begründung</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Ablehnungskommentar</TableHead>
                          <TableHead className="text-right">Aktionen</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {vacationAbsences.map((a) => (
                          <TableRow
                            key={String(a.id)}
                            data-ocid={`vacation-row-${a.id}`}
                          >
                            <TableCell className="font-medium whitespace-nowrap">
                              {a.dateFrom === a.dateTo
                                ? formatDateDE(a.dateFrom)
                                : `${formatDateDE(a.dateFrom)} – ${formatDateDE(a.dateTo)}`}
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                              {daysBetween(a.dateFrom, a.dateTo)}
                            </TableCell>
                            <TableCell className="max-w-48 truncate text-muted-foreground">
                              {a.description ?? "—"}
                            </TableCell>
                            <TableCell>{statusBadge(a.status)}</TableCell>
                            <TableCell className="max-w-48 truncate text-destructive text-sm">
                              {a.rejectionComment ?? "—"}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                {canEditAbsence(a) && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => openEditVacationDialog(a)}
                                    data-ocid={`btn-edit-vacation-${a.id}`}
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </Button>
                                )}
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() =>
                                    handleDeleteAbsenceEntryClick(a)
                                  }
                                  aria-label="Antrag zurückziehen"
                                  data-ocid={`btn-delete-vacation-${a.id}`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* TAB: ABWESENHEITEN                                                 */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          <TabsContent value="abwesenheiten" className="mt-4 space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Alle eigenen Abwesenheiten (ohne Ferien)
              </p>
              <Button
                type="button"
                onClick={() => {
                  resetAbsenceForms();
                  setShowAbsenceDialog(true);
                }}
                className="gap-2"
                data-ocid="btn-neue-abwesenheit"
              >
                <PlusCircle className="w-4 h-4" />
                Neue Abwesenheit
              </Button>
            </div>

            <Card className="shadow-card">
              <CardContent className="p-0">
                {isLoadingAbsences ? (
                  <div className="p-4 space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>
                ) : regularAbsences.length === 0 ? (
                  <div
                    className="flex flex-col items-center justify-center py-16 gap-3 text-center"
                    data-ocid="empty-abwesenheiten"
                  >
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                      <CalendarDays className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Keine Abwesenheiten
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Erfassen Sie Krankheit, Unfall oder andere
                        Abwesenheiten.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Typ</TableHead>
                          <TableHead>Datum von</TableHead>
                          <TableHead>Datum bis</TableHead>
                          <TableHead>Tage</TableHead>
                          <TableHead>Beschreibung</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Aktionen</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {regularAbsences.map((a) => (
                          <TableRow
                            key={String(a.id)}
                            data-ocid={`absence-row-${a.id}`}
                          >
                            <TableCell className="font-medium">
                              {getTypeName(a.absenceTypeId)}
                            </TableCell>
                            <TableCell>{formatDateDE(a.dateFrom)}</TableCell>
                            <TableCell>{formatDateDE(a.dateTo)}</TableCell>
                            <TableCell className="text-right tabular-nums">
                              {daysBetween(a.dateFrom, a.dateTo)}
                            </TableCell>
                            <TableCell className="max-w-48 truncate text-muted-foreground">
                              {a.description ?? "—"}
                            </TableCell>
                            <TableCell>{statusBadge(a.status)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                {canEditAbsence(a) && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => openEditAbsenceDialog(a)}
                                    data-ocid={`btn-edit-absence-${a.id}`}
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </Button>
                                )}
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() =>
                                    handleDeleteAbsenceEntryClick(a)
                                  }
                                  data-ocid={`btn-delete-absence-${a.id}`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* TAB: STANDARDARBEITSZEITEN                                         */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          <TabsContent value="standardarbeitszeiten" className="mt-4 space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">
                Definiere deine Standardarbeitszeiten pro Wochentag als Vorlage.
                Diese werden für keine Berechnungen verwendet.
              </p>
            </div>

            {isLoadingStd ? (
              <LoadingSkeleton />
            ) : (
              <div className="space-y-4">
                {DAY_KEYS.map((day) => {
                  const blocks = stdBlocks[day];
                  const dayErrors = stdBlockErrors[day] ?? [];
                  return (
                    <Card key={day}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-semibold text-foreground">
                            {DAY_NAMES[day]}
                          </h3>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addBlock(day)}
                            data-ocid={`std-add-block-${day}`}
                          >
                            <PlusCircle className="w-3.5 h-3.5 mr-1" />
                            Block hinzufügen
                          </Button>
                        </div>

                        {blocks.length === 0 ? (
                          <p className="text-xs text-muted-foreground py-2">
                            Keine Zeitblöcke definiert.
                          </p>
                        ) : (
                          <div className="space-y-3">
                            {blocks.map((block, i) => {
                              // Projects assigned to current user
                              const assignedProjs = projects.filter((p) => {
                                if (!employeeId) return true;
                                const members =
                                  projectMembers.get(String(p.id)) ?? [];
                                return members.some(
                                  (m) =>
                                    String(m.employeeId) === String(employeeId),
                                );
                              });
                              // Service types for this block's project
                              const blockServiceTypes = block.projektId
                                ? (() => {
                                    const members =
                                      projectMembers.get(
                                        String(block.projektId),
                                      ) ?? [];
                                    const myAssignments = members.filter(
                                      (m) =>
                                        String(m.employeeId) ===
                                        String(employeeId),
                                    );
                                    const myStIds = new Set(
                                      myAssignments.map((m) =>
                                        String(m.serviceTypeId),
                                      ),
                                    );
                                    return serviceTypes.filter(
                                      (st) =>
                                        st.aktiv && myStIds.has(String(st.id)),
                                    );
                                  })()
                                : [];
                              return (
                                <div
                                  key={`${day}-block-${i}-${block.projektId ?? "x"}-${block.leistungsartId ?? "x"}`}
                                  className="rounded-lg border border-border bg-muted/20 p-3 space-y-2"
                                  data-ocid={`std-block-row-${day}-${i}`}
                                >
                                  {/* Projekt dropdown */}
                                  <div className="flex items-center gap-2">
                                    <Label className="text-xs text-muted-foreground w-20 shrink-0">
                                      Projekt
                                    </Label>
                                    <Select
                                      value={
                                        block.projektId != null
                                          ? String(block.projektId)
                                          : ""
                                      }
                                      onValueChange={(v) =>
                                        updateBlock(
                                          day,
                                          i,
                                          "projektId",
                                          v ? Number(v) : null,
                                        )
                                      }
                                    >
                                      <SelectTrigger
                                        className="h-8 text-sm flex-1"
                                        data-ocid={`std-block-projekt-${day}-${i}`}
                                      >
                                        <SelectValue placeholder="Projekt wählen…" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {assignedProjs.map((p) => (
                                          <SelectItem
                                            key={String(p.id)}
                                            value={String(p.id)}
                                          >
                                            [{p.code}] {p.name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  {/* Leistungsart dropdown */}
                                  <div className="flex items-center gap-2">
                                    <Label className="text-xs text-muted-foreground w-20 shrink-0">
                                      Leistungsart
                                    </Label>
                                    <Select
                                      value={
                                        block.leistungsartId != null
                                          ? String(block.leistungsartId)
                                          : ""
                                      }
                                      onValueChange={(v) =>
                                        updateBlock(
                                          day,
                                          i,
                                          "leistungsartId",
                                          v ? Number(v) : null,
                                        )
                                      }
                                      disabled={!block.projektId}
                                    >
                                      <SelectTrigger
                                        className="h-8 text-sm flex-1"
                                        data-ocid={`std-block-leistungsart-${day}-${i}`}
                                      >
                                        <SelectValue
                                          placeholder={
                                            block.projektId
                                              ? "Leistungsart wählen…"
                                              : "Erst Projekt wählen"
                                          }
                                        />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {blockServiceTypes.map((st) => (
                                          <SelectItem
                                            key={String(st.id)}
                                            value={String(st.id)}
                                          >
                                            {st.name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  {/* Von / Bis row */}
                                  <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1.5">
                                      <Label className="text-xs text-muted-foreground w-6 shrink-0">
                                        Von
                                      </Label>
                                      <TimeInput
                                        placeholder="08:00"
                                        value={block.von}
                                        onCommit={(v) =>
                                          updateBlock(day, i, "von", v)
                                        }
                                        className="h-8 text-sm w-28"
                                        data-ocid={`std-block-von-${day}-${i}`}
                                      />
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      <Label className="text-xs text-muted-foreground w-6 shrink-0">
                                        Bis
                                      </Label>
                                      <TimeInput
                                        placeholder="17:00"
                                        value={block.bis}
                                        onCommit={(v) =>
                                          updateBlock(day, i, "bis", v)
                                        }
                                        className="h-8 text-sm w-28"
                                        data-ocid={`std-block-bis-${day}-${i}`}
                                      />
                                    </div>
                                    {block.von &&
                                      block.bis &&
                                      isValidHHMM(block.von) &&
                                      isValidHHMM(block.bis) &&
                                      hhmmToMinutes(block.bis) >
                                        hhmmToMinutes(block.von) && (
                                        <span className="text-xs text-muted-foreground tabular-nums shrink-0 ml-auto">
                                          {minutesToHHMM(
                                            hhmmToMinutes(block.bis) -
                                              hhmmToMinutes(block.von),
                                          )}
                                        </span>
                                      )}
                                    <button
                                      type="button"
                                      onClick={() => removeBlock(day, i)}
                                      className="ml-auto p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
                                      aria-label={`Block ${i + 1} löschen`}
                                      data-ocid={`std-block-delete-${day}-${i}`}
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {dayErrors.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {dayErrors.map((err, i) => (
                              <p
                                key={`${day}-err-${i}-${err.slice(0, 10)}`}
                                className="text-xs text-destructive"
                              >
                                {err}
                              </p>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}

                <div className="flex justify-end pt-2">
                  <Button
                    type="button"
                    onClick={saveStdBlocks}
                    disabled={isSavingStd}
                    data-ocid="btn-save-std-blocks"
                  >
                    {isSavingStd ? "Speichern…" : "Speichern"}
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* DIALOG: ZEITEINTRAG                                                    */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <TimeEntryDialog
        open={timeDialogOpen}
        onOpenChange={(open) => {
          setTimeDialogOpen(open);
          if (!open) setEditingEntry(null);
        }}
        editEntry={editingEntry}
        initialValues={editingEntry ? undefined : { date: timeDialogDate }}
        onSaved={() => setTimeout(() => void loadTimeDataRef.current(), 100)}
        title={editingEntry ? "Zeiteintrag bearbeiten" : "Neuer Zeiteintrag"}
      />

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* DIALOG: ABWESENHEIT                                                    */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <Dialog
        open={showAbsenceDialog}
        onOpenChange={(open) => {
          if (!open) {
            setShowAbsenceDialog(false);
            resetAbsenceForms();
          }
        }}
      >
        <DialogContent className="max-w-md" data-ocid="dialog-abwesenheit">
          <DialogHeader>
            <DialogTitle>
              {editAbsence ? "Abwesenheit bearbeiten" : "Neue Abwesenheit"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {!editAbsence && (
              <div className="space-y-1.5">
                <Label htmlFor="absenceType">Abwesenheitsart *</Label>
                <Select
                  value={absenceForm.absenceTypeId}
                  onValueChange={(v) =>
                    setAbsenceForm((f) => ({ ...f, absenceTypeId: v }))
                  }
                >
                  <SelectTrigger
                    id="absenceType"
                    data-ocid="select-absence-type"
                  >
                    <SelectValue placeholder="Bitte wählen…" />
                  </SelectTrigger>
                  <SelectContent>
                    {nonVacationTypes.map((t) => (
                      <SelectItem key={String(t.id)} value={String(t.id)}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {absenceErrors.absenceTypeId && (
                  <p className="text-xs text-destructive">
                    {absenceErrors.absenceTypeId}
                  </p>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="absDateFrom">Datum von *</Label>
                <Input
                  id="absDateFrom"
                  type="date"
                  value={absenceForm.dateFrom}
                  onChange={(e) =>
                    setAbsenceForm((f) => ({ ...f, dateFrom: e.target.value }))
                  }
                  data-ocid="input-abs-date-from"
                />
                {absenceErrors.dateFrom && (
                  <p className="text-xs text-destructive">
                    {absenceErrors.dateFrom}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="absDateTo">Datum bis *</Label>
                <Input
                  id="absDateTo"
                  type="date"
                  value={absenceForm.dateTo}
                  onChange={(e) =>
                    setAbsenceForm((f) => ({ ...f, dateTo: e.target.value }))
                  }
                  data-ocid="input-abs-date-to"
                />
                {absenceErrors.dateTo && (
                  <p className="text-xs text-destructive">
                    {absenceErrors.dateTo}
                  </p>
                )}
              </div>
            </div>

            {isSingleDayAbsence && (
              <div className="space-y-1.5">
                <Label htmlFor="absDauer">
                  Dauer (hh:mm) *
                  <span className="block text-xs font-normal text-muted-foreground mt-0.5">
                    Für 1-tägige Abwesenheit manuell erfassen
                  </span>
                </Label>
                <Input
                  id="absDauer"
                  type="text"
                  placeholder="08:00"
                  value={absenceForm.dauer}
                  onChange={(e) =>
                    setAbsenceForm((f) => ({ ...f, dauer: e.target.value }))
                  }
                  onBlur={(e) => {
                    const norm = normalizeTimeInput(e.target.value);
                    setAbsenceForm((f) => ({ ...f, dauer: norm }));
                  }}
                  className={absenceErrors.dauer ? "border-destructive" : ""}
                  data-ocid="input-abs-dauer"
                />
                {absenceErrors.dauer && (
                  <p className="text-xs text-destructive">
                    {absenceErrors.dauer}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="absDescription">Beschreibung</Label>
              <Input
                id="absDescription"
                type="text"
                placeholder="Grund der Abwesenheit (optional)"
                value={absenceForm.description}
                onChange={(e) =>
                  setAbsenceForm((f) => ({
                    ...f,
                    description: e.target.value,
                  }))
                }
                data-ocid="input-abs-description"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowAbsenceDialog(false);
                resetAbsenceForms();
              }}
              disabled={isSavingAbsence}
              data-ocid="btn-cancel-absence"
            >
              Abbrechen
            </Button>
            <Button
              type="button"
              onClick={submitAbsence}
              disabled={isSavingAbsence}
              data-ocid="btn-save-absence"
            >
              {isSavingAbsence ? "Speichern…" : "Speichern"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* DIALOG: FERIEN                                                          */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <Dialog
        open={showVacationDialog}
        onOpenChange={(open) => {
          if (!open) {
            setShowVacationDialog(false);
            resetAbsenceForms();
          }
        }}
      >
        <DialogContent
          className="max-w-md max-h-[90vh] overflow-y-auto"
          data-ocid="dialog-ferien"
        >
          <DialogHeader>
            <DialogTitle>
              {editVacation ? "Ferien bearbeiten" : "Ferienantrag stellen"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="vacDateFrom">Datum von *</Label>
                <Input
                  id="vacDateFrom"
                  type="date"
                  value={vacationForm.dateFrom}
                  onChange={(e) =>
                    setVacationForm((f) => ({
                      ...f,
                      dateFrom: e.target.value,
                      dateTo:
                        f.dateTo < e.target.value ? e.target.value : f.dateTo,
                    }))
                  }
                  className={
                    vacationErrors.dateFrom ? "border-destructive" : ""
                  }
                  data-ocid="input-vac-date-from"
                />
                {vacationErrors.dateFrom && (
                  <p className="text-xs text-destructive">
                    {vacationErrors.dateFrom}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="vacDateTo">Datum bis *</Label>
                <Input
                  id="vacDateTo"
                  type="date"
                  value={vacationForm.dateTo}
                  onChange={(e) =>
                    setVacationForm((f) => ({ ...f, dateTo: e.target.value }))
                  }
                  className={vacationErrors.dateTo ? "border-destructive" : ""}
                  data-ocid="input-vac-date-to"
                />
                {vacationErrors.dateTo && (
                  <p className="text-xs text-destructive">
                    {vacationErrors.dateTo}
                  </p>
                )}
              </div>
            </div>

            {vacationForm.dateFrom &&
              vacationForm.dateTo &&
              vacationForm.dateFrom !== vacationForm.dateTo && (
                <p className="text-xs text-muted-foreground px-1 py-1 bg-muted/30 rounded-md">
                  <span className="font-medium text-foreground">
                    {daysBetween(vacationForm.dateFrom, vacationForm.dateTo)}{" "}
                    Tage
                  </span>{" "}
                  — Mehrtägige Ferien werden als Einheit gespeichert.
                </p>
              )}

            <div className="flex items-center gap-2.5">
              <Checkbox
                id="vac-ganztaetig"
                checked={vacationForm.ganztaetig}
                onCheckedChange={(v) =>
                  setVacationForm((f) => ({
                    ...f,
                    ganztaetig: v === true,
                    dauerInput: v === true ? "" : f.dauerInput,
                  }))
                }
                data-ocid="vac-ganztaetig-checkbox"
              />
              <Label
                htmlFor="vac-ganztaetig"
                className="cursor-pointer font-medium"
              >
                Ganztägig
              </Label>
            </div>
            {vacationForm.ganztaetig && (
              <p className="text-xs text-muted-foreground -mt-1 pl-7">
                Stunden werden aus der Beschäftigung je Wochentag berechnet.
              </p>
            )}

            {!vacationForm.ganztaetig && (
              <div className="space-y-1.5">
                <Label htmlFor="vacDauer">
                  Dauer (hh:mm) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="vacDauer"
                  type="text"
                  placeholder="08:00"
                  value={vacationForm.dauerInput}
                  onChange={(e) =>
                    setVacationForm((f) => ({
                      ...f,
                      dauerInput: e.target.value,
                    }))
                  }
                  onBlur={(e) => {
                    const norm = normalizeTimeInput(e.target.value);
                    setVacationForm((f) => ({ ...f, dauerInput: norm }));
                  }}
                  className={
                    vacationErrors.dauerInput ? "border-destructive" : ""
                  }
                  data-ocid="input-vac-dauer"
                />
                {vacationErrors.dauerInput && (
                  <p className="text-xs text-destructive">
                    {vacationErrors.dauerInput}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Eingabe: 8:00, 08:00 oder 0800 werden erkannt.
                </p>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="vacDescription">
                Bemerkung{" "}
                <span className="text-muted-foreground font-normal text-xs">
                  (optional)
                </span>
              </Label>
              <Input
                id="vacDescription"
                placeholder="Bemerkung…"
                value={vacationForm.description}
                onChange={(e) =>
                  setVacationForm((f) => ({
                    ...f,
                    description: e.target.value,
                  }))
                }
                data-ocid="input-vac-description"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowVacationDialog(false);
                resetAbsenceForms();
              }}
              disabled={isSavingVacation}
              data-ocid="btn-cancel-vacation"
            >
              Abbrechen
            </Button>
            <Button
              type="button"
              onClick={submitVacation}
              disabled={isSavingVacation}
              data-ocid="btn-save-vacation"
            >
              {isSavingVacation ? "Speichern…" : "Einreichen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* DELETE CONFIRMATION                                                    */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <DeleteConfirmDialog
        open={!!deleteTarget}
        onConfirm={() => {
          if (!deleteTarget) return;
          if (deleteTarget.kind === "timeEntry") {
            void executeDeleteEntry(deleteTarget.entry);
          } else {
            void executeDeleteAbsence(deleteTarget.id);
          }
        }}
        onCancel={() => setDeleteTarget(null)}
        isDeleting={isDeleting}
      />

      {/* ── Approved-entry delete warning ── */}
      {showZeitenApprovedDeleteWarning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 max-w-md mx-4 shadow-xl border border-border">
            <h3 className="text-lg font-semibold mb-3 text-foreground">
              Eintrag genehmigt
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Dieser Eintrag wurde bereits genehmigt. Bitte den Vorgesetzten
              bitten, die Genehmigung zuerst zurückzusetzen, bevor der Eintrag
              gelöscht werden kann.
            </p>
            <button
              type="button"
              onClick={() => setShowZeitenApprovedDeleteWarning(false)}
              className="px-4 py-2 bg-[#006066] text-white rounded text-sm hover:opacity-90 transition-opacity"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
}
