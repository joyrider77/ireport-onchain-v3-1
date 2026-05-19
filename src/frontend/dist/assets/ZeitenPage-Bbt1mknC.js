import { a as useNavigate, r as reactExports, j as jsxRuntimeExports, S as Skeleton } from "./index-Blf-A8DR.js";
import { D as DeleteConfirmDialog } from "./DeleteConfirmDialog-DQaUOhhj.js";
import { u as useCompanyTimezone, t as toDateStringInTz, m as minutesToHHMM, l as hhmmToMinutes, L as Layout, p as Timer, S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem, f as formatHours, o as isValidHHMM, T as TimeEntryDialog, D as Dialog, g as DialogContent, h as DialogHeader, i as DialogTitle, n as normalizeTimeInput, k as DialogFooter, j as Checkbox } from "./Layout-ClH0znk9.js";
import { B as Badge } from "./badge-BrNtKZcv.js";
import { B as Button } from "./button-DCGMFvti.js";
import { C as Card, a as CardContent } from "./card-CHW-R_CT.js";
import { u as ue, L as Label, I as Input } from "./index-CVvtv_EE.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-Dp2E-W7o.js";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-BPjAd3S7.js";
import { b as useAuth, u as useActor, c as createActor } from "./useAuthStore-Cbv7GIMf.js";
import { g as getActiveEmploymentForDate, b as getMostRecentEmploymentBefore, a as getEmploymentMinutesForDate, n as nanosToLocalIsoDate, c as countVacationDaysProportional } from "./employmentUtils-C-5ZbofZ.js";
import { k as Clock, j as ChevronLeft, h as ChevronRight } from "./users-DUrIKgtR.js";
import { C as CalendarDays } from "./calendar-days-Gl2wnOv2.js";
import { C as CirclePlus } from "./circle-plus-DQ2YRhOv.js";
import { T as TrendingUp } from "./trending-up-B4SWSNqc.js";
import { T as TrendingDown } from "./trending-down-DRgzK28H.js";
import { P as Pencil } from "./pencil-CCCnid6t.js";
import { T as Trash2 } from "./trash-2-XtlFfpOd.js";
import { c as createLucideIcon } from "./createLucideIcon-BzNCDVU7.js";
import "./index-Dv8dTxpA.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  [
    "path",
    {
      d: "M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",
      key: "1a8usu"
    }
  ]
];
const Pen = createLucideIcon("pen", __iconNode);
const toAny = (a) => a;
const EMPTY_STD_BLOCKS = {
  monday: [],
  tuesday: [],
  wednesday: [],
  thursday: [],
  friday: [],
  saturday: [],
  sunday: []
};
function getWeekStartFromDateString(dateStr) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  const dow = d.getUTCDay();
  const diff = dow === 0 ? -6 : 1 - dow;
  d.setUTCDate(d.getUTCDate() + diff);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}
function addDays(date, days) {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}
function toDateString(date) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function formatWeekLabel(weekStart) {
  const end = addDays(weekStart, 6);
  const opts = {
    day: "2-digit",
    month: "2-digit",
    timeZone: "UTC"
  };
  const startStr = weekStart.toLocaleDateString("de-CH", opts);
  const endStr = end.toLocaleDateString("de-CH", { ...opts, year: "numeric" });
  return `${startStr} – ${endStr}`;
}
function formatDayLabel(dateStr) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  return d.toLocaleDateString("de-CH", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC"
  });
}
function formatDateDE(dateStr) {
  if (!dateStr) return "–";
  const [y, m, d] = dateStr.split("-");
  return `${d}.${m}.${y}`;
}
function daysBetween(from, to) {
  const d1 = new Date(from);
  const d2 = new Date(to);
  const diff = Math.ceil((d2.getTime() - d1.getTime()) / 864e5) + 1;
  return Math.max(diff, 1);
}
const DAY_LABELS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const DAY_KEYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday"
];
const DAY_NAMES = {
  monday: "Montag",
  tuesday: "Dienstag",
  wednesday: "Mittwoch",
  thursday: "Donnerstag",
  friday: "Freitag",
  saturday: "Samstag",
  sunday: "Sonntag"
};
const UTC_DAY_TO_KEY = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday"
];
function TimeInput({
  value,
  placeholder,
  onCommit,
  className,
  "data-ocid": dataOcid
}) {
  const [local, setLocal] = reactExports.useState(value);
  const prevValue = reactExports.useRef(value);
  if (prevValue.current !== value && isValidHHMM(value)) {
    prevValue.current = value;
    setLocal(value);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Input,
    {
      type: "text",
      placeholder,
      value: local,
      onChange: (e) => setLocal(e.target.value),
      onBlur: () => {
        const normalized = normalizeTimeInput(local) || local;
        setLocal(normalized);
        onCommit(normalized);
      },
      className,
      maxLength: 5,
      "data-ocid": dataOcid
    }
  );
}
function EntryRow({
  entry,
  project,
  serviceType,
  onEdit,
  onDelete,
  readOnly = false
}) {
  const isZeitBlock = (project == null ? void 0 : project.erfassungsart) === "zeitBlock" && (entry.von || entry.bis);
  const timeDisplay = isZeitBlock ? `${entry.von ?? ""}–${entry.bis ?? ""}` : formatHours(Number(entry.hours));
  const isApproved = String(
    entry.status ?? ""
  ).toLowerCase() === "approved";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "flex items-center gap-3 py-3 px-4 rounded-lg border border-border bg-card hover:bg-accent/30 transition-colors group",
      "data-ocid": "time-entry-row",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-foreground truncate", children: (project == null ? void 0 : project.name) ?? "–" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: (project == null ? void 0 : project.code) ? `[${project.code}]` : "" }),
            entry.billable && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "text-xs px-1.5 py-0", children: "Verrechenbar" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mt-0.5 flex-wrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: (serviceType == null ? void 0 : serviceType.name) ?? "–" }),
            entry.description && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "·" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground truncate max-w-xs", children: entry.description })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold text-primary tabular-nums", children: timeDisplay }),
          isZeitBlock && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground ml-1", children: [
            "(",
            formatHours(Number(entry.hours)),
            ")"
          ] }),
          !readOnly && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            !isApproved && /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: onEdit,
                className: "ml-2 p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors opacity-0 group-hover:opacity-100",
                "aria-label": "Bearbeiten",
                "data-ocid": "entry-edit-btn",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pen, { className: "w-3.5 h-3.5" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: onDelete,
                className: "p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100",
                "aria-label": "Löschen",
                "data-ocid": "entry-delete-btn",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" })
              }
            )
          ] })
        ] })
      ]
    }
  );
}
function LoadingSkeleton() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-10 w-full" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-10 w-full" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-10 w-3/4" })
  ] });
}
function statusBadge(status) {
  if (status === "approved")
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-green-100 text-green-800 hover:bg-green-100", children: "Genehmigt" });
  if (status === "rejected")
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "destructive", children: "Abgelehnt" });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: "Ausstehend" });
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
function normaliseFeiertag(v) {
  if (v === "keineGutschrift" || v === "wochentag_sollzeit" || v === "durchschnittssoll")
    return v;
  if (v === "exakt" || v === "entschaedigt") return "keineGutschrift";
  if (v === "exaktWochentag") return "wochentag_sollzeit";
  if (v === "prozentual") return "durchschnittssoll";
  return "keineGutschrift";
}
function ZeitenPage() {
  const navigate = useNavigate();
  const { isAuthenticated, companyId, employeeId, role } = useAuth();
  const { actor, isFetching } = useActor(createActor);
  const timezone = useCompanyTimezone();
  reactExports.useEffect(() => {
    if (!isAuthenticated || !companyId) navigate({ to: "/" });
  }, [isAuthenticated, companyId, navigate]);
  const isAdminOrManager = role === "admin" || role === "manager";
  const [viewMode, setViewMode] = reactExports.useState("week");
  const [currentWeekStart, setCurrentWeekStart] = reactExports.useState(() => {
    const todayStr2 = toDateStringInTz(/* @__PURE__ */ new Date(), "Europe/Zurich");
    return getWeekStartFromDateString(todayStr2);
  });
  const [selectedDayStr, setSelectedDayStr] = reactExports.useState(
    () => toDateStringInTz(/* @__PURE__ */ new Date(), "Europe/Zurich")
  );
  const [selectedEmployeeFilter, setSelectedEmployeeFilter] = reactExports.useState(
    () => employeeId ?? "all"
  );
  const [entries, setEntries] = reactExports.useState([]);
  const [projects, setProjects] = reactExports.useState([]);
  const [serviceTypes, setServiceTypes] = reactExports.useState([]);
  const [employees, setEmployees] = reactExports.useState([]);
  const [projectMembers, setProjectMembers] = reactExports.useState(/* @__PURE__ */ new Map());
  const [isLoadingTime, setIsLoadingTime] = reactExports.useState(true);
  const [employments, setEmployments] = reactExports.useState([]);
  reactExports.useEffect(() => {
    if (!actor || isFetching || !employeeId) return;
    const empId = selectedEmployeeFilter !== "all" ? selectedEmployeeFilter : employeeId;
    toAny(actor).listEmployments(BigInt(empId)).then((res) => {
      const r = res;
      if (r.__kind__ === "ok") setEmployments(r.ok ?? []);
    }).catch(() => setEmployments([]));
  }, [actor, isFetching, employeeId, selectedEmployeeFilter]);
  const [holidays, setHolidays] = reactExports.useState([]);
  reactExports.useEffect(() => {
    if (!actor || isFetching) return;
    toAny(actor).listHolidays().then((res) => setHolidays(res ?? [])).catch(() => setHolidays([]));
  }, [actor, isFetching]);
  const [absenceTypes, setAbsenceTypes] = reactExports.useState([]);
  const [myAbsences, setMyAbsences] = reactExports.useState([]);
  const [isLoadingAbsences, setIsLoadingAbsences] = reactExports.useState(true);
  const [stdBlocks, setStdBlocks] = reactExports.useState(EMPTY_STD_BLOCKS);
  const [stdBlockErrors, setStdBlockErrors] = reactExports.useState({});
  const [isSavingStd, setIsSavingStd] = reactExports.useState(false);
  const [isLoadingStd, setIsLoadingStd] = reactExports.useState(true);
  const [stdHoursForm, setStdHoursForm] = reactExports.useState({
    monday: "08:00",
    tuesday: "08:00",
    wednesday: "08:00",
    thursday: "08:00",
    friday: "08:00",
    saturday: "00:00",
    sunday: "00:00"
  });
  const [timeDialogOpen, setTimeDialogOpen] = reactExports.useState(false);
  const [editingEntry, setEditingEntry] = reactExports.useState(null);
  const [timeDialogDate, setTimeDialogDate] = reactExports.useState("");
  const [stdZeitMessage, setStdZeitMessage] = reactExports.useState(null);
  function showStdZeitMsg(msg) {
    setStdZeitMessage(msg);
    setTimeout(() => setStdZeitMessage(null), 5e3);
  }
  const [showAbsenceDialog, setShowAbsenceDialog] = reactExports.useState(false);
  const [editAbsence, setEditAbsence] = reactExports.useState(null);
  const [absenceForm, setAbsenceForm] = reactExports.useState({
    absenceTypeId: "",
    dateFrom: "",
    dateTo: "",
    description: "",
    dauer: ""
  });
  const [absenceErrors, setAbsenceErrors] = reactExports.useState(
    {}
  );
  const [isSavingAbsence, setIsSavingAbsence] = reactExports.useState(false);
  const [showVacationDialog, setShowVacationDialog] = reactExports.useState(false);
  const [editVacation, setEditVacation] = reactExports.useState(null);
  const [vacationForm, setVacationForm] = reactExports.useState({
    dateFrom: "",
    dateTo: "",
    description: "",
    ganztaetig: true,
    dauerInput: ""
  });
  const [vacationErrors, setVacationErrors] = reactExports.useState(
    {}
  );
  const [isSavingVacation, setIsSavingVacation] = reactExports.useState(false);
  const [deleteTarget, setDeleteTarget] = reactExports.useState(null);
  const [isDeleting, setIsDeleting] = reactExports.useState(false);
  const loadTimeData = reactExports.useCallback(async () => {
    if (!actor || isFetching) return;
    setIsLoadingTime(true);
    try {
      const weekEnd = addDays(currentWeekStart, 6);
      const filter = {
        dateFrom: toDateString(currentWeekStart),
        dateTo: toDateString(weekEnd)
      };
      if (selectedEmployeeFilter !== "all") {
        filter.employeeId = BigInt(selectedEmployeeFilter);
      }
      const [entriesRes, projectsRes, serviceTypesRes] = await Promise.all([
        toAny(actor).listTimeEntries(filter),
        toAny(actor).listProjects(),
        toAny(actor).listServiceTypes()
      ]);
      const activeProjects = (projectsRes ?? []).filter((p) => p.active);
      setEntries(entriesRes ?? []);
      setProjects(activeProjects);
      setServiceTypes(serviceTypesRes ?? []);
      const memberMap = /* @__PURE__ */ new Map();
      await Promise.all(
        activeProjects.map(async (p) => {
          try {
            const res = await toAny(actor).getProjectMembers(p.id);
            if (res.__kind__ === "ok") memberMap.set(String(p.id), res.ok);
          } catch {
          }
        })
      );
      setProjectMembers(memberMap);
      if (isAdminOrManager) {
        const emps = await toAny(actor).listEmployees();
        setEmployees(emps ?? []);
      }
    } catch (err) {
      console.error(err);
      ue.error("Fehler beim Laden der Zeiteinträge");
    } finally {
      setIsLoadingTime(false);
    }
  }, [
    actor,
    isFetching,
    currentWeekStart,
    selectedEmployeeFilter,
    isAdminOrManager
  ]);
  const loadTimeDataRef = reactExports.useRef(loadTimeData);
  loadTimeDataRef.current = loadTimeData;
  reactExports.useEffect(() => {
    void loadTimeDataRef.current();
  }, [actor, isFetching, currentWeekStart, selectedEmployeeFilter]);
  const loadAbsenceData = reactExports.useCallback(async () => {
    if (!actor || isFetching) return;
    setIsLoadingAbsences(true);
    try {
      const absenceFilter = selectedEmployeeFilter !== "all" ? { employeeId: BigInt(selectedEmployeeFilter) } : {};
      const [typesRes, absencesRes] = await Promise.all([
        toAny(actor).listAbsenceTypes(),
        toAny(actor).listAbsences(absenceFilter)
      ]);
      setAbsenceTypes(typesRes ?? []);
      setMyAbsences(absencesRes ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingAbsences(false);
    }
  }, [actor, isFetching, selectedEmployeeFilter]);
  const loadAbsenceDataRef = reactExports.useRef(loadAbsenceData);
  loadAbsenceDataRef.current = loadAbsenceData;
  reactExports.useEffect(() => {
    void loadAbsenceDataRef.current();
  }, [actor, isFetching, selectedEmployeeFilter]);
  const loadStdBlocks = reactExports.useCallback(async () => {
    if (!actor || isFetching || !employeeId) return;
    setIsLoadingStd(true);
    try {
      const a = toAny(actor);
      if (typeof a.getMyStandardarbeitszeiten === "function") {
        const res = await a.getMyStandardarbeitszeiten();
        if (res.__kind__ === "ok") {
          setStdBlocks(res.ok ?? EMPTY_STD_BLOCKS);
        }
      } else {
        const res = await a.getStandardarbeitszeiten(BigInt(employeeId));
        if (res.__kind__ === "ok") {
          const h = res.ok;
          setStdHoursForm({
            monday: minutesToHHMM(Number(h.monday)),
            tuesday: minutesToHHMM(Number(h.tuesday)),
            wednesday: minutesToHHMM(Number(h.wednesday)),
            thursday: minutesToHHMM(Number(h.thursday)),
            friday: minutesToHHMM(Number(h.friday)),
            saturday: minutesToHHMM(Number(h.saturday)),
            sunday: minutesToHHMM(Number(h.sunday))
          });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingStd(false);
    }
  }, [actor, isFetching, employeeId]);
  const loadStdRef = reactExports.useRef(loadStdBlocks);
  loadStdRef.current = loadStdBlocks;
  reactExports.useEffect(() => {
    void loadStdRef.current();
  }, [actor, isFetching, employeeId]);
  const holidaysForDay = reactExports.useCallback(
    (dateStr) => holidays.filter((h) => h.date === dateStr),
    [holidays]
  );
  const holidayIstMinutesForDay = reactExports.useCallback(
    (dateStr) => {
      const dayHolidays = holidays.filter((h) => h.date === dateStr);
      if (dayHolidays.length === 0) return 0;
      const emp = getActiveEmploymentForDate(employments, dateStr) ?? getMostRecentEmploymentBefore(employments, dateStr);
      if (!emp) return 0;
      const berechnungsart = normaliseFeiertag(
        String(emp.feiertagsberechnungsart ?? "keineGutschrift")
      );
      let avgDailyMins = 0;
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
        const weekTotal2 = dayVals.reduce((a, b) => a + b, 0);
        avgDailyMins = workDays > 0 ? weekTotal2 / workDays : 0;
      }
      let total = 0;
      for (const h of dayHolidays) {
        const factor = h.ganztaegig ? 1 : 0.5;
        if (berechnungsart === "keineGutschrift") {
          total += 0;
        } else if (berechnungsart === "wochentag_sollzeit") {
          const weekdaySoll = getWeekdaySollMinsFromEmp(emp, dateStr);
          total += Math.round(weekdaySoll * factor);
        } else if (berechnungsart === "durchschnittssoll") {
          total += Math.round(avgDailyMins * factor);
        }
      }
      return total;
    },
    [holidays, employments]
  );
  const vacationType = reactExports.useMemo(
    () => absenceTypes.find(
      (t) => t.name.toLowerCase() === "ferien" && t.requiresApproval
    ) ?? absenceTypes.find(
      (t) => t.requiresApproval && t.name.toLowerCase().includes("feri")
    ) ?? absenceTypes.find((t) => t.requiresApproval),
    [absenceTypes]
  );
  const nonVacationTypes = reactExports.useMemo(
    () => absenceTypes.filter((t) => t.id !== (vacationType == null ? void 0 : vacationType.id) && t.aktiv),
    [absenceTypes, vacationType]
  );
  const regularAbsences = reactExports.useMemo(
    () => myAbsences.filter(
      (a) => !vacationType || a.absenceTypeId !== vacationType.id
    ),
    [myAbsences, vacationType]
  );
  const vacationAbsences = reactExports.useMemo(
    () => myAbsences.filter(
      (a) => vacationType && a.absenceTypeId === vacationType.id
    ),
    [myAbsences, vacationType]
  );
  const weekDays = reactExports.useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i)),
    [currentWeekStart]
  );
  const entriesByDate = reactExports.useMemo(() => {
    const map = {};
    const filteredEntries = selectedEmployeeFilter !== "all" ? entries.filter(
      (e) => String(e.employeeId) === String(selectedEmployeeFilter)
    ) : entries;
    for (const e of filteredEntries) {
      if (!map[e.date]) map[e.date] = [];
      map[e.date].push(e);
    }
    return map;
  }, [entries, selectedEmployeeFilter]);
  const absencesByDate = reactExports.useMemo(() => {
    const map = {};
    const weekDateStrings = weekDays.map(toDateString);
    const filteredAbsences = selectedEmployeeFilter !== "all" ? myAbsences.filter(
      (a) => String(a.employeeId) === String(selectedEmployeeFilter)
    ) : myAbsences;
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
  const totalHoursForDay = (dateStr) => {
    let total = (entriesByDate[dateStr] ?? []).reduce(
      (s, e) => s + Number(e.hours),
      0
    );
    const scopedAbsences = selectedEmployeeFilter !== "all" ? myAbsences.filter(
      (a) => String(a.employeeId) === String(selectedEmployeeFilter)
    ) : myAbsences;
    const aMap = new Map(absenceTypes.map((t) => [String(t.id), t]));
    for (const a of scopedAbsences) {
      if (a.status !== "approved") continue;
      if (dateStr < a.dateFrom || dateStr > a.dateTo) continue;
      const absType = aMap.get(String(a.absenceTypeId));
      const isVacation = (absType == null ? void 0 : absType.requiresApproval) ?? false;
      const isCompensated = (absType == null ? void 0 : absType.compensated) ?? false;
      if (!isVacation && !isCompensated) continue;
      if (a.ganztaetig) {
        const activeEmp = getActiveEmploymentForDate(employments, dateStr) ?? getMostRecentEmploymentBefore(employments, dateStr);
        const sollMinutes = activeEmp ? getEmploymentMinutesForDate(activeEmp, dateStr) : 0;
        total += sollMinutes / 60;
      } else {
        total += Number(a.dauer) / 60;
      }
    }
    total += holidayIstMinutesForDay(dateStr) / 60;
    return total;
  };
  const weekTotal = reactExports.useMemo(() => {
    let total = weekDays.reduce(
      (s, d) => s + (entriesByDate[toDateString(d)] ?? []).reduce(
        (acc, e) => acc + Number(e.hours),
        0
      ),
      0
    );
    const scopedAbsences = selectedEmployeeFilter !== "all" ? myAbsences.filter(
      (a) => String(a.employeeId) === String(selectedEmployeeFilter)
    ) : myAbsences;
    const aMap = new Map(absenceTypes.map((t) => [String(t.id), t]));
    for (const a of scopedAbsences) {
      if (a.status !== "approved") continue;
      const aTypeId = String(a.absenceTypeId);
      const absenceType = aMap.get(aTypeId);
      const isVacation = (absenceType == null ? void 0 : absenceType.requiresApproval) ?? false;
      const isCompensated = (absenceType == null ? void 0 : absenceType.compensated) ?? false;
      if (!isVacation && !isCompensated) continue;
      for (const day of weekDays) {
        const dateStr = toDateString(day);
        if (dateStr >= a.dateFrom && dateStr <= a.dateTo) {
          if (a.ganztaetig) {
            const activeEmp = getActiveEmploymentForDate(employments, dateStr) ?? getMostRecentEmploymentBefore(employments, dateStr);
            const dayMinutes = activeEmp ? getEmploymentMinutesForDate(activeEmp, dateStr) : 0;
            total += dayMinutes / 60;
          } else {
            total += Number(a.dauer) / 60;
          }
        }
      }
    }
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
    holidayIstMinutesForDay
  ]);
  const weekTarget = reactExports.useMemo(() => {
    if (employments.length === 0) {
      const keys = [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday"
      ];
      return keys.reduce(
        (sum, key) => sum + hhmmToMinutes(stdHoursForm[key] || "00:00"),
        0
      ) / 60;
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
  const [workTimeBalance, setWorkTimeBalance] = reactExports.useState(null);
  const [isLoadingBalance, setIsLoadingBalance] = reactExports.useState(false);
  const loadWorkTimeBalance = reactExports.useCallback(async () => {
    if (!actor || isFetching || !employeeId) return;
    setIsLoadingBalance(true);
    try {
      let startDate = null;
      try {
        const emps = await toAny(actor).listEmployments(
          BigInt(employeeId)
        );
        if (emps.__kind__ === "ok" && emps.ok && emps.ok.length > 0) {
          const validEmps = emps.ok.filter((e) => {
            if (!e.von) return false;
            const secNum = typeof e.von === "bigint" ? Number(e.von) : Math.round(Number(e.von));
            if (secNum <= 0) return false;
            const ms = secNum * 1e3;
            const year = new Date(ms).getFullYear();
            return year >= 2e3 && year <= 2100;
          });
          if (validEmps.length > 0) {
            const earliest = validEmps.reduce(
              (min, e) => e.von < min.von ? e : min
            );
            startDate = nanosToLocalIsoDate(earliest.von) || null;
          }
        }
      } catch {
      }
      const weekEnd = toDateString(addDays(currentWeekStart, 6));
      if (!startDate) {
        setWorkTimeBalance(null);
        return;
      }
      const res = await toAny(actor).getEmployeeWorkTimeBalance(
        BigInt(employeeId),
        startDate,
        weekEnd
      );
      if (res.__kind__ === "ok" && res.ok) {
        setWorkTimeBalance(res.ok);
      }
    } catch {
    } finally {
      setIsLoadingBalance(false);
    }
  }, [actor, isFetching, employeeId, currentWeekStart]);
  const loadBalanceRef = reactExports.useRef(loadWorkTimeBalance);
  loadBalanceRef.current = loadWorkTimeBalance;
  reactExports.useEffect(() => {
    void loadBalanceRef.current();
  }, [actor, isFetching, employeeId, currentWeekStart]);
  const projectMap = reactExports.useMemo(
    () => new Map(projects.map((p) => [String(p.id), p])),
    [projects]
  );
  const serviceTypeMap = reactExports.useMemo(
    () => new Map(serviceTypes.map((s) => [String(s.id), s])),
    [serviceTypes]
  );
  const absenceTypeMap = reactExports.useMemo(
    () => new Map(absenceTypes.map((t) => [String(t.id), t])),
    [absenceTypes]
  );
  const isViewingOtherEmployee = isAdminOrManager && selectedEmployeeFilter !== "all" && selectedEmployeeFilter !== String(employeeId);
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
  function openNewEntry(dateStr) {
    const d = dateStr ?? (viewMode === "day" ? selectedDayStr : toDateString(currentWeekStart));
    setEditingEntry(null);
    setTimeDialogDate(d);
    setTimeDialogOpen(true);
  }
  function openEditEntry(entry) {
    setEditingEntry(entry);
    setTimeDialogDate("");
    setTimeDialogOpen(true);
  }
  async function handleDeleteEntry(entry) {
    const statusVal = String(
      entry.status ?? ""
    ).toLowerCase();
    if (statusVal === "approved" && !isAdminOrManager) {
      setShowZeitenApprovedDeleteWarning(true);
      return;
    }
    setDeleteTarget({ kind: "timeEntry", entry });
  }
  async function executeDeleteEntry(entry) {
    if (!actor) return;
    setIsDeleting(true);
    try {
      const res = await toAny(actor).deleteTimeEntry(entry.id);
      if (res.__kind__ === "err") throw new Error(res.err);
      ue.success("Zeiteintrag gelöscht");
      void loadTimeDataRef.current();
    } catch (err) {
      ue.error(
        `Fehler: ${err instanceof Error ? err.message : "Unbekannter Fehler"}`
      );
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  }
  async function handleStdZeitErfassen() {
    const targetDate = viewMode === "day" ? selectedDayStr : todayStr;
    const targetDateObj = /* @__PURE__ */ new Date(`${targetDate}T12:00:00Z`);
    const utcDay = targetDateObj.getUTCDay();
    const dayKey = UTC_DAY_TO_KEY[utcDay];
    const blocks = stdBlocks[dayKey] ?? [];
    const weekdayName = DAY_NAMES[dayKey];
    if (blocks.length === 0) {
      showStdZeitMsg(`Keine Standardarbeitszeiten für ${weekdayName} erfasst.`);
      return;
    }
    const existingEntries = entriesByDate[targetDate] ?? [];
    if (existingEntries.length > 0) {
      const confirmed = window.confirm(
        "Für diesen Tag sind bereits Zeiteinträge vorhanden. Trotzdem Standardarbeitszeit erfassen?"
      );
      if (!confirmed) return;
    }
    if (!actor) return;
    const a = toAny(actor);
    let created = 0;
    const skipped = [];
    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      if (!block.projektId || !block.leistungsartId) {
        skipped.push(
          `Block ${i + 1} (${block.von}–${block.bis}): Kein Projekt/Leistungsart hinterlegt`
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
      const proj = projects.find(
        (p) => String(p.id) === String(block.projektId)
      );
      const isZeitBlock = (proj == null ? void 0 : proj.erfassungsart) === "zeitBlock";
      try {
        const res = await a.createTimeEntry({
          date: targetDate,
          projectId: BigInt(block.projektId),
          serviceTypeId: BigInt(block.leistungsartId),
          hours,
          von: isZeitBlock ? block.von : "",
          bis: isZeitBlock ? block.bis : "",
          description: "",
          billable: false
        });
        if ("err" in res) throw new Error(res.err);
        created++;
      } catch (err) {
        skipped.push(
          `Block ${i + 1}: ${err instanceof Error ? err.message : "Fehler"}`
        );
      }
    }
    if (skipped.length > 0) {
      for (const msg of skipped) ue.warning(msg);
    }
    if (created > 0) {
      ue.success(`${created} Zeiteintrag${created > 1 ? "e" : ""} erfasst`);
      void loadTimeDataRef.current();
    } else if (skipped.length > 0) {
      showStdZeitMsg(
        "Keine Einträge gespeichert. Bitte Projekt und Leistungsart in den Standardarbeitszeiten hinterlegen."
      );
    }
  }
  function resetAbsenceForms() {
    setAbsenceForm({
      absenceTypeId: "",
      dateFrom: "",
      dateTo: "",
      description: "",
      dauer: ""
    });
    setVacationForm({
      dateFrom: "",
      dateTo: "",
      description: "",
      ganztaetig: true,
      dauerInput: ""
    });
    setAbsenceErrors({});
    setVacationErrors({});
    setEditAbsence(null);
    setEditVacation(null);
  }
  function openEditVacationDialog(absence) {
    setEditVacation(absence);
    setVacationForm({
      dateFrom: absence.dateFrom,
      dateTo: absence.dateTo,
      description: absence.description ?? "",
      ganztaetig: absence.ganztaetig,
      dauerInput: absence.ganztaetig ? "" : minutesToHHMM(Number(absence.dauer))
    });
    setShowVacationDialog(true);
  }
  function openEditAbsenceDialog(absence) {
    setEditAbsence(absence);
    setAbsenceForm({
      absenceTypeId: String(absence.absenceTypeId),
      dateFrom: absence.dateFrom,
      dateTo: absence.dateTo,
      description: absence.description ?? "",
      dauer: ""
    });
    setShowAbsenceDialog(true);
  }
  const isSingleDayAbsence = absenceForm.dateFrom !== "" && absenceForm.dateTo !== "" && absenceForm.dateFrom === absenceForm.dateTo;
  function validateAbsenceForm() {
    const e = {};
    if (!absenceForm.absenceTypeId)
      e.absenceTypeId = "Bitte Abwesenheitsart wählen";
    if (!absenceForm.dateFrom) e.dateFrom = "Datum von ist erforderlich";
    if (!absenceForm.dateTo) e.dateTo = "Datum bis ist erforderlich";
    if (absenceForm.dateFrom && absenceForm.dateTo && absenceForm.dateTo < absenceForm.dateFrom)
      e.dateTo = "Datum bis muss nach Datum von liegen";
    if (isSingleDayAbsence && !isValidHHMM(absenceForm.dauer)) {
      e.dauer = "Bitte gültige Dauer eingeben (hh:mm)";
    }
    setAbsenceErrors(e);
    return Object.keys(e).length === 0;
  }
  function validateVacationForm() {
    const e = {};
    if (!vacationForm.dateFrom) e.dateFrom = "Datum von ist erforderlich";
    if (!vacationForm.dateTo) e.dateTo = "Datum bis ist erforderlich";
    if (vacationForm.dateFrom && vacationForm.dateTo && vacationForm.dateTo < vacationForm.dateFrom)
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
    var _a;
    if (!validateAbsenceForm() || !actor) return;
    setIsSavingAbsence(true);
    try {
      const typeId = (_a = absenceTypes.find(
        (t) => String(t.id) === absenceForm.absenceTypeId
      )) == null ? void 0 : _a.id;
      if (!typeId) throw new Error("Abwesenheitsart nicht gefunden");
      const isMultiDay = absenceForm.dateFrom !== absenceForm.dateTo;
      const dauerMinutes = isSingleDayAbsence ? hhmmToMinutes(absenceForm.dauer) ?? 0 : 0;
      if (editAbsence) {
        const input = {
          dateFrom: absenceForm.dateFrom,
          dateTo: absenceForm.dateTo,
          ganztaetig: isMultiDay,
          dauer: BigInt(dauerMinutes),
          description: absenceForm.description || void 0
        };
        const res = await toAny(actor).updateAbsence(
          editAbsence.id,
          input
        );
        if (res.__kind__ === "err") throw new Error(res.err);
        ue.success("Abwesenheit aktualisiert");
      } else {
        const res = await toAny(actor).createAbsence({
          absenceTypeId: typeId,
          dateFrom: absenceForm.dateFrom,
          dateTo: absenceForm.dateTo,
          ganztaetig: isMultiDay,
          dauer: BigInt(dauerMinutes),
          description: absenceForm.description || void 0
        });
        if (res.__kind__ === "err") throw new Error(res.err);
        ue.success("Abwesenheit erfasst");
      }
      setShowAbsenceDialog(false);
      resetAbsenceForms();
      void loadAbsenceDataRef.current();
    } catch (err) {
      ue.error(
        `Fehler: ${err instanceof Error ? err.message : "Unbekannter Fehler"}`
      );
    } finally {
      setIsSavingAbsence(false);
    }
  }
  async function submitVacation() {
    setIsSavingVacation(true);
    try {
      if (!validateVacationForm() || !actor) return;
      if (!vacationType) {
        ue.error("Keine Ferienabwesenheitsart konfiguriert");
        return;
      }
      if (!editVacation) {
        const currentYear = (/* @__PURE__ */ new Date(
          `${vacationForm.dateFrom}T12:00:00`
        )).getFullYear();
        const empIdForBalance = BigInt(
          selectedEmployeeFilter !== "all" ? selectedEmployeeFilter : employeeId ?? "0"
        );
        let checkPassed = false;
        let balanceCheckError = null;
        try {
          const [balancesRes, absencesRes, typesRes, employmentsRes] = await Promise.all([
            toAny(actor).listVacationBalances(empIdForBalance),
            toAny(actor).listAbsences({
              employeeId: empIdForBalance
            }),
            toAny(actor).listAbsenceTypes(),
            toAny(actor).listEmployments(empIdForBalance)
          ]);
          const freshEmployments = employmentsRes.__kind__ === "ok" ? employmentsRes.ok ?? [] : employments;
          const balances = balancesRes.__kind__ === "ok" ? balancesRes.ok ?? [] : [];
          const vacTypeIds = new Set(
            (typesRes ?? []).filter((t) => t.requiresApproval).map((t) => String(t.id))
          );
          const totalGranted = balances.filter((b) => Number(b.kalenderjahr) === currentYear).reduce((sum, b) => sum + Number(b.dauer) / 100, 0);
          const usedDays = (absencesRes ?? []).filter(
            (a) => vacTypeIds.has(
              String(
                a.absenceTypeId
              )
            ) && // Include approved, submitted and pending — all non-rejected statuses count against balance
            (a.status === "approved" || a.status === "submitted" || a.status === "pending") && String(
              a.employeeId
            ) === String(empIdForBalance)
          ).reduce((sum, rawA) => {
            const a = rawA;
            const yFrom = (/* @__PURE__ */ new Date(`${a.dateFrom}T12:00:00`)).getFullYear();
            const yTo = (/* @__PURE__ */ new Date(`${a.dateTo}T12:00:00`)).getFullYear();
            if (yFrom !== currentYear && yTo !== currentYear) return sum;
            const effFrom = yFrom < currentYear ? `${currentYear}-01-01` : a.dateFrom;
            const effTo = yTo > currentYear ? `${currentYear}-12-31` : a.dateTo;
            const days = countVacationDaysProportional(
              effFrom,
              effTo,
              a.ganztaetig,
              Number(a.dauer),
              freshEmployments
            );
            return sum + (days > 0 ? days : daysBetween(effFrom, effTo));
          }, 0);
          const dauerMinsForBalance = vacationForm.ganztaetig ? 0 : hhmmToMinutes(vacationForm.dauerInput) ?? 0;
          let requestedDays = countVacationDaysProportional(
            vacationForm.dateFrom,
            vacationForm.dateTo,
            vacationForm.ganztaetig,
            dauerMinsForBalance,
            freshEmployments
          );
          if (requestedDays === 0 && freshEmployments.length === 0) {
            requestedDays = daysBetween(
              vacationForm.dateFrom,
              vacationForm.dateTo
            );
          }
          const availableDays = Math.max(totalGranted - usedDays, 0);
          if (requestedDays > availableDays + 1e-3) {
            balanceCheckError = `Nicht genügend Feriensaldo. Verfügbar: ${availableDays.toFixed(1)} Tage, benötigt: ${requestedDays.toFixed(1)} Tage.`;
          } else {
            checkPassed = true;
          }
        } catch (err) {
          balanceCheckError = `Feriensaldo konnte nicht geprüft werden. Bitte versuche es erneut. (${err instanceof Error ? err.message : "Unbekannter Fehler"})`;
        }
        if (balanceCheckError) {
          ue.error(balanceCheckError);
          return;
        }
        if (!checkPassed) {
          ue.error(
            "Feriensaldo-Prüfung fehlgeschlagen. Bitte versuche es erneut."
          );
          return;
        }
      }
      const dauerMinutes = vacationForm.ganztaetig ? 0 : hhmmToMinutes(vacationForm.dauerInput) ?? 0;
      if (editVacation) {
        const res = await toAny(actor).updateAbsence(editVacation.id, {
          dateFrom: vacationForm.dateFrom,
          dateTo: vacationForm.dateTo,
          ganztaetig: vacationForm.ganztaetig,
          dauer: BigInt(dauerMinutes),
          description: vacationForm.description || void 0
        });
        if (res.__kind__ === "err") throw new Error(res.err);
        ue.success("Ferienantrag aktualisiert");
      } else {
        const res = await toAny(actor).createAbsence({
          absenceTypeId: vacationType.id,
          dateFrom: vacationForm.dateFrom,
          dateTo: vacationForm.dateTo,
          ganztaetig: vacationForm.ganztaetig,
          dauer: BigInt(dauerMinutes),
          description: vacationForm.description || void 0
        });
        if (res.__kind__ === "err") throw new Error(res.err);
        ue.success("Ferienantrag eingereicht");
      }
      setShowVacationDialog(false);
      resetAbsenceForms();
      void loadAbsenceDataRef.current();
    } catch (err) {
      ue.error(
        `Fehler: ${err instanceof Error ? err.message : "Unbekannter Fehler"}`
      );
    } finally {
      setIsSavingVacation(false);
    }
  }
  async function deleteAbsenceEntry(absence) {
    if (absence.status === "approved" && !isAdminOrManager) {
      ue.error(
        "Dieser Eintrag wurde bereits genehmigt. Bitte den Vorgesetzten bitten, die Genehmigung zuerst zurückzusetzen."
      );
      return;
    }
    setDeleteTarget({ kind: "absence", id: absence.id });
  }
  async function executeDeleteAbsence(id) {
    if (!actor) return;
    setIsDeleting(true);
    try {
      const res = await toAny(actor).deleteAbsence(id);
      if (res.__kind__ === "err") throw new Error(res.err);
      ue.success("Abwesenheit gelöscht");
      void loadAbsenceDataRef.current();
    } catch (err) {
      ue.error(
        `Fehler: ${err instanceof Error ? err.message : "Unbekannter Fehler"}`
      );
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  }
  const canEditAbsence = (a) => {
    if (a.status === "approved" && !isAdminOrManager) return false;
    return a.status === "submitted" || a.status === "pending" || a.status === "rejected" || a.status === "approved" && isAdminOrManager;
  };
  const [showZeitenApprovedDeleteWarning, setShowZeitenApprovedDeleteWarning] = reactExports.useState(false);
  const handleDeleteAbsenceEntryClick = (a) => {
    const statusVal = String(a.status ?? "").toLowerCase();
    if (statusVal === "approved" && !isAdminOrManager) {
      setShowZeitenApprovedDeleteWarning(true);
      return;
    }
    void deleteAbsenceEntry(a);
  };
  function getTypeName(id) {
    var _a;
    return ((_a = absenceTypes.find((t) => t.id === id)) == null ? void 0 : _a.name) ?? String(id);
  }
  function addBlock(day) {
    setStdBlocks((prev) => ({
      ...prev,
      [day]: [
        ...prev[day],
        { von: "", bis: "", projektId: null, leistungsartId: null }
      ]
    }));
  }
  function removeBlock(day, index) {
    setStdBlocks((prev) => ({
      ...prev,
      [day]: prev[day].filter((_, i) => i !== index)
    }));
  }
  function updateBlock(day, index, field, value) {
    setStdBlocks((prev) => {
      const updated = prev[day].map((b, i) => {
        if (i !== index) return b;
        if (field === "projektId") {
          return {
            ...b,
            projektId: value,
            leistungsartId: null
          };
        }
        return { ...b, [field]: value };
      });
      return { ...prev, [day]: updated };
    });
  }
  function validateStdBlocks() {
    const errors = {};
    const normalized = { ...stdBlocks };
    for (const day of DAY_KEYS) {
      normalized[day] = stdBlocks[day].map((b) => ({
        ...b,
        von: normalizeTimeInput(b.von) || b.von,
        bis: normalizeTimeInput(b.bis) || b.bis
      }));
    }
    setStdBlocks(normalized);
    for (const day of DAY_KEYS) {
      const dayErrors = [];
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
        const res = await a.setMyStandardarbeitszeiten(stdBlocks);
        if (res.__kind__ === "err") throw new Error(res.err);
      } else {
        const hours = {
          monday: BigInt(0),
          tuesday: BigInt(0),
          wednesday: BigInt(0),
          thursday: BigInt(0),
          friday: BigInt(0),
          saturday: BigInt(0),
          sunday: BigInt(0)
        };
        const res = await a.setStandardarbeitszeiten(
          BigInt(employeeId),
          hours
        );
        if (res.__kind__ === "err") throw new Error(res.err);
      }
      ue.success("Standardarbeitszeiten gespeichert");
    } catch (err) {
      ue.error(
        `Fehler: ${err instanceof Error ? err.message : "Unbekannter Fehler"}`
      );
    } finally {
      setIsSavingStd(false);
    }
  }
  const todayStr = toDateStringInTz(/* @__PURE__ */ new Date(), timezone);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Layout, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 md:p-6 space-y-5 max-w-6xl mx-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-display font-bold text-foreground", children: "Zeiten erfassen" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-0.5", children: "Arbeitszeiten, Abwesenheiten und Ferien verwalten" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "zeit", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "flex-wrap h-auto", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "zeit", "data-ocid": "tab-zeit", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-4 h-4 mr-1.5" }),
            "Zeit"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "ferien", "data-ocid": "tab-ferien", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarDays, { className: "w-4 h-4 mr-1.5" }),
            "Ferien"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "abwesenheiten", "data-ocid": "tab-abwesenheiten", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarDays, { className: "w-4 h-4 mr-1.5" }),
            "Abwesenheiten"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            TabsTrigger,
            {
              value: "standardarbeitszeiten",
              "data-ocid": "tab-standardarbeitszeiten",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Timer, { className: "w-4 h-4 mr-1.5" }),
                "Standardarbeitszeiten"
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "zeit", className: "mt-4 space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between flex-wrap gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
              isAdminOrManager && employees.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Select,
                {
                  value: selectedEmployeeFilter,
                  onValueChange: (v) => {
                    setSelectedEmployeeFilter(v);
                  },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      SelectTrigger,
                      {
                        className: "w-48 h-9 text-sm",
                        "data-ocid": "employee-filter",
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Mitarbeiter wählen" })
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Alle Mitarbeiter" }),
                      employees.map((emp) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(emp.id), children: [
                        emp.firstName,
                        " ",
                        emp.lastName
                      ] }, String(emp.id)))
                    ] })
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("fieldset", { className: "flex rounded-lg border border-border overflow-hidden m-0 p-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("legend", { className: "sr-only", children: "Ansicht wählen" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => setViewMode("week"),
                    className: `px-3 py-1.5 text-sm font-medium transition-colors ${viewMode === "week" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground hover:bg-muted"}`,
                    "data-ocid": "view-week-btn",
                    children: "Woche"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => setViewMode("day"),
                    className: `px-3 py-1.5 text-sm font-medium transition-colors ${viewMode === "day" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground hover:bg-muted"}`,
                    "data-ocid": "view-day-btn",
                    children: "Tag"
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  size: "sm",
                  variant: "outline",
                  onClick: () => void handleStdZeitErfassen(),
                  "data-ocid": "std-zeit-erfassen-btn",
                  title: "Standardarbeitszeiten als Zeiteinträge erfassen",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Timer, { className: "w-4 h-4 mr-1" }),
                    "Standardarbeitszeit erfassen"
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  size: "sm",
                  onClick: () => openNewEntry(),
                  "data-ocid": "new-entry-btn",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(CirclePlus, { className: "w-4 h-4 mr-1" }),
                    "Neuer Eintrag"
                  ]
                }
              )
            ] })
          ] }),
          stdZeitMessage && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg bg-muted/60 border border-border px-4 py-2 text-sm text-muted-foreground", children: stdZeitMessage }),
          isViewingOtherEmployee && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-muted/50 border border-border px-4 py-2 text-sm text-muted-foreground flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium uppercase tracking-wide text-muted-foreground", children: "Nur-Lesen" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Du siehst die Einträge eines anderen Mitarbeiters – Bearbeiten und Löschen sind nicht möglich." })
          ] }),
          viewMode === "week" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between bg-card border border-border rounded-xl px-4 py-2.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  onClick: prevWeek,
                  className: "p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground",
                  "aria-label": "Vorherige Woche",
                  "data-ocid": "prev-week-btn",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "w-5 h-5" })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-foreground", children: formatWeekLabel(currentWeekStart) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  onClick: nextWeek,
                  className: "p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground",
                  "aria-label": "Nächste Woche",
                  "data-ocid": "next-week-btn",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "w-5 h-5" })
                }
              )
            ] }),
            isLoadingTime ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingSkeleton, {}) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-7 gap-2", children: weekDays.map((day, i) => {
                const dateStr = toDateString(day);
                const dayHours = totalHoursForDay(dateStr);
                const isToday = todayStr === dateStr;
                const isWeekend = i >= 5;
                const activeEmpForDay = getActiveEmploymentForDate(
                  employments,
                  dateStr
                );
                const targetMinutes = activeEmpForDay ? getEmploymentMinutesForDate(
                  activeEmpForDay,
                  dateStr
                ) : 0;
                const target = targetMinutes / 60;
                const dayAbsences = absencesByDate[dateStr] ?? [];
                const hasVacation = dayAbsences.some(
                  (a) => vacationType && a.absenceTypeId === vacationType.id
                );
                const hasAbsence = dayAbsences.some(
                  (a) => !vacationType || a.absenceTypeId !== vacationType.id
                );
                return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    type: "button",
                    onClick: () => openNewEntry(dateStr),
                    "data-ocid": `day-cell-${i}`,
                    className: `relative flex flex-col items-center rounded-xl border p-3 text-center transition-colors hover:border-primary/50 hover:bg-primary/5 group cursor-pointer ${isToday ? "border-primary bg-primary/5" : isWeekend ? "border-border bg-muted/30 opacity-70" : "border-border bg-card"}`,
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-muted-foreground", children: DAY_LABELS[i] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "span",
                        {
                          className: `text-base font-semibold mt-0.5 ${isToday ? "text-primary" : "text-foreground"}`,
                          children: dateStr.split("-")[2]
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 w-full", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "span",
                          {
                            className: `text-sm font-bold tabular-nums block ${dayHours >= target && target > 0 ? "text-emerald-600 dark:text-emerald-400" : dayHours > 0 ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"}`,
                            children: dayHours > 0 ? formatHours(dayHours) : "–"
                          }
                        ),
                        target > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-muted-foreground block", children: [
                          "Soll: ",
                          minutesToHHMM(target * 60)
                        ] })
                      ] }),
                      (hasVacation || hasAbsence) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-0.5 mt-1.5 justify-center", children: [
                        hasVacation && /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "span",
                          {
                            className: "w-2 h-2 rounded-full bg-teal-500 inline-block",
                            title: "Ferien"
                          }
                        ),
                        hasAbsence && /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "span",
                          {
                            className: "w-2 h-2 rounded-full bg-amber-500 inline-block",
                            title: "Abwesenheit"
                          }
                        )
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(CirclePlus, { className: "absolute bottom-1.5 right-1.5 w-3 h-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity" })
                    ]
                  },
                  dateStr
                );
              }) }),
              myAbsences.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 text-xs text-muted-foreground px-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-2 h-2 rounded-full bg-teal-500 inline-block" }),
                  "Ferien"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-2 h-2 rounded-full bg-amber-500 inline-block" }),
                  "Abwesenheit"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  className: `flex items-center justify-between rounded-xl border px-5 py-3 ${weekTotal >= weekTarget ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/30" : "border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/30"}`,
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Clock,
                        {
                          className: `w-4 h-4 ${weekTotal >= weekTarget ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-foreground", children: "Gesamt dieser Woche" })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "span",
                      {
                        className: `text-sm font-bold tabular-nums ${weekTotal >= weekTarget ? "text-emerald-700 dark:text-emerald-400" : "text-amber-700 dark:text-amber-400"}`,
                        children: [
                          formatHours(weekTotal),
                          " / Soll:",
                          " ",
                          minutesToHHMM(weekTarget * 60)
                        ]
                      }
                    )
                  ]
                }
              ),
              (workTimeBalance || isLoadingBalance) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-xl border border-border bg-card px-5 py-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                  workTimeBalance && Number(workTimeBalance.saldo) >= 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "w-4 h-4 text-emerald-600 dark:text-emerald-400" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingDown, { className: "w-4 h-4 text-amber-600 dark:text-amber-400" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-foreground", children: "Arbeitszeitsaldo" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground hidden sm:inline", children: [
                    "(kumuliert ab Anstellungsbeginn bis Ende Woche",
                    " ",
                    formatDateDE(
                      toDateString(addDays(currentWeekStart, 6))
                    ),
                    ")"
                  ] })
                ] }),
                isLoadingBalance ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-muted-foreground", children: "…" }) : workTimeBalance ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "span",
                  {
                    className: `text-sm font-bold tabular-nums ${Number(workTimeBalance.saldo) >= 0 ? "text-emerald-700 dark:text-emerald-400" : "text-amber-700 dark:text-amber-400"}`,
                    children: [
                      Number(workTimeBalance.saldo) >= 0 ? "+" : "–",
                      minutesToHHMM(
                        Math.abs(Number(workTimeBalance.saldo))
                      )
                    ]
                  }
                ) : null
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
                weekDays.map((day) => {
                  const dateStr = toDateString(day);
                  const dayEntries = entriesByDate[dateStr] ?? [];
                  const dayAbsences = absencesByDate[dateStr] ?? [];
                  const dayHolidays = holidaysForDay(dateStr);
                  if (dayEntries.length === 0 && dayAbsences.length === 0 && dayHolidays.length === 0)
                    return null;
                  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wide", children: formatDayLabel(dateStr) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 h-px bg-border" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold text-primary tabular-nums", children: formatHours(totalHoursForDay(dateStr)) })
                    ] }),
                    dayHolidays.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-1 mb-2", children: dayHolidays.map((h) => {
                      const hMins = holidayIstMinutesForDay(dateStr);
                      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "div",
                        {
                          className: "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium bg-[#006066]/8 text-[#006066] border border-[#006066]/25 dark:bg-[#006066]/20 dark:text-teal-200 dark:border-[#006066]/40",
                          "data-ocid": "holiday-row",
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarDays, { className: "w-3 h-3 flex-shrink-0" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: h.name }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] opacity-60 ml-1", children: h.ganztaegig ? "ganztägig" : "halbtägig" }),
                            hMins > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-auto tabular-nums font-semibold", children: minutesToHHMM(hMins) })
                          ]
                        },
                        String(h.id)
                      );
                    }) }),
                    dayAbsences.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-1 mb-2", children: dayAbsences.map((a) => {
                      var _a;
                      const isVac = vacationType && a.absenceTypeId === vacationType.id;
                      const typeName = ((_a = absenceTypeMap.get(String(a.absenceTypeId))) == null ? void 0 : _a.name) ?? "–";
                      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "div",
                        {
                          className: `flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium ${isVac ? "bg-teal-50 text-teal-800 border border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800" : "bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"}`,
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarDays, { className: "w-3 h-3 flex-shrink-0" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: typeName }),
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-auto text-xs opacity-70", children: [
                              formatDateDE(a.dateFrom),
                              " –",
                              " ",
                              formatDateDE(a.dateTo)
                            ] })
                          ]
                        },
                        String(a.id)
                      );
                    }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1.5", children: dayEntries.map((entry) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                      EntryRow,
                      {
                        entry,
                        project: projectMap.get(
                          String(entry.projectId)
                        ),
                        serviceType: serviceTypeMap.get(
                          String(entry.serviceTypeId)
                        ),
                        onEdit: () => openEditEntry(entry),
                        onDelete: () => handleDeleteEntry(entry),
                        readOnly: isViewingOtherEmployee
                      },
                      String(entry.id)
                    )) })
                  ] }, dateStr);
                }),
                Object.keys(entriesByDate).length === 0 && myAbsences.length === 0 && !isLoadingTime && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "div",
                  {
                    className: "flex flex-col items-center justify-center py-12 text-center",
                    "data-ocid": "empty-state",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-10 h-10 text-muted-foreground/40 mb-3" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-muted-foreground", children: "Keine Zeiteinträge diese Woche" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground/60 mt-1", children: 'Klicken Sie auf einen Tag oder auf "Neuer Eintrag"' })
                    ]
                  }
                )
              ] })
            ] })
          ] }),
          viewMode === "day" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between bg-card border border-border rounded-xl px-4 py-2.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  onClick: prevDay,
                  className: "p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground",
                  "aria-label": "Vorheriger Tag",
                  "data-ocid": "prev-day-btn",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "w-5 h-5" })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-foreground capitalize", children: formatDayLabel(selectedDayStr) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  onClick: nextDay,
                  className: "p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground",
                  "aria-label": "Nächster Tag",
                  "data-ocid": "next-day-btn",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "w-5 h-5" })
                }
              )
            ] }),
            (() => {
              const dayHours = totalHoursForDay(selectedDayStr);
              const dayEntries = entriesByDate[selectedDayStr] ?? [];
              const dayAbsences = absencesByDate[selectedDayStr] ?? [];
              const dayHolidays = holidaysForDay(selectedDayStr);
              const dayHolidayMins = holidayIstMinutesForDay(selectedDayStr);
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between bg-card border border-border rounded-xl px-5 py-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-muted-foreground", children: "Erfasste Stunden" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "span",
                    {
                      className: `text-sm font-bold tabular-nums ${dayHours >= 8 ? "text-emerald-600 dark:text-emerald-400" : dayHours > 0 ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"}`,
                      children: [
                        formatHours(dayHours),
                        " / 08:00"
                      ]
                    }
                  )
                ] }),
                dayHolidays.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-1", children: dayHolidays.map((h) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "div",
                  {
                    className: "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-[#006066]/8 text-[#006066] border border-[#006066]/25 dark:bg-[#006066]/20 dark:text-teal-200 dark:border-[#006066]/40",
                    "data-ocid": "holiday-row-day",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarDays, { className: "w-4 h-4 flex-shrink-0" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: h.name }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs opacity-60 ml-1", children: h.ganztaegig ? "ganztägig" : "halbtägig" }),
                      dayHolidayMins > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-auto tabular-nums font-semibold text-sm", children: minutesToHHMM(dayHolidayMins) })
                    ]
                  },
                  String(h.id)
                )) }),
                dayAbsences.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-1", children: dayAbsences.map((a) => {
                  var _a;
                  const isVac = vacationType && a.absenceTypeId === vacationType.id;
                  const typeName = ((_a = absenceTypeMap.get(String(a.absenceTypeId))) == null ? void 0 : _a.name) ?? "–";
                  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "div",
                    {
                      className: `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${isVac ? "bg-teal-50 text-teal-800 border border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800" : "bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"}`,
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarDays, { className: "w-4 h-4 flex-shrink-0" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: typeName }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-auto text-xs opacity-70", children: [
                          formatDateDE(a.dateFrom),
                          " –",
                          " ",
                          formatDateDE(a.dateTo)
                        ] })
                      ]
                    },
                    String(a.id)
                  );
                }) }),
                isLoadingTime ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingSkeleton, {}) : dayEntries.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "div",
                  {
                    className: "flex flex-col items-center justify-center py-12 text-center",
                    "data-ocid": "empty-state-day",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-10 h-10 text-muted-foreground/40 mb-3" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-muted-foreground", children: "Keine Einträge für diesen Tag" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        Button,
                        {
                          size: "sm",
                          variant: "outline",
                          className: "mt-3",
                          onClick: () => openNewEntry(selectedDayStr),
                          "data-ocid": "empty-new-entry-btn",
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(CirclePlus, { className: "w-4 h-4 mr-1" }),
                            "Eintrag hinzufügen"
                          ]
                        }
                      )
                    ]
                  }
                ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1.5", children: dayEntries.map((entry) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                  EntryRow,
                  {
                    entry,
                    project: projectMap.get(String(entry.projectId)),
                    serviceType: serviceTypeMap.get(
                      String(entry.serviceTypeId)
                    ),
                    onEdit: () => openEditEntry(entry),
                    onDelete: () => handleDeleteEntry(entry),
                    readOnly: isViewingOtherEmployee
                  },
                  String(entry.id)
                )) })
              ] });
            })()
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "ferien", className: "mt-4 space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Ferienanträge einreichen und Status verfolgen" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                type: "button",
                onClick: () => {
                  resetAbsenceForms();
                  setShowVacationDialog(true);
                },
                className: "gap-2",
                "data-ocid": "btn-ferienantrag-stellen",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CirclePlus, { className: "w-4 h-4" }),
                  "Ferienantrag stellen"
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "shadow-card", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: isLoadingAbsences ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 space-y-3", children: [1, 2, 3].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-10 w-full" }, i)) }) : vacationAbsences.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "flex flex-col items-center justify-center py-16 gap-3 text-center",
              "data-ocid": "empty-ferien",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 rounded-full bg-muted flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarDays, { className: "w-6 h-6 text-muted-foreground" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-foreground", children: "Keine Ferienanträge" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Stellen Sie einen Antrag für Ihre Ferien." })
                ] })
              ]
            }
          ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Zeitraum" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Tage" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Begründung" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Status" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Ablehnungskommentar" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Aktionen" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: vacationAbsences.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              TableRow,
              {
                "data-ocid": `vacation-row-${a.id}`,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium whitespace-nowrap", children: a.dateFrom === a.dateTo ? formatDateDE(a.dateFrom) : `${formatDateDE(a.dateFrom)} – ${formatDateDE(a.dateTo)}` }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right tabular-nums", children: daysBetween(a.dateFrom, a.dateTo) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "max-w-48 truncate text-muted-foreground", children: a.description ?? "—" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: statusBadge(a.status) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "max-w-48 truncate text-destructive text-sm", children: a.rejectionComment ?? "—" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-1", children: [
                    canEditAbsence(a) && /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Button,
                      {
                        type: "button",
                        variant: "ghost",
                        size: "icon",
                        onClick: () => openEditVacationDialog(a),
                        "data-ocid": `btn-edit-vacation-${a.id}`,
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-4 h-4" })
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Button,
                      {
                        type: "button",
                        variant: "ghost",
                        size: "icon",
                        className: "text-destructive hover:text-destructive",
                        onClick: () => handleDeleteAbsenceEntryClick(a),
                        "aria-label": "Antrag zurückziehen",
                        "data-ocid": `btn-delete-vacation-${a.id}`,
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-4 h-4" })
                      }
                    )
                  ] }) })
                ]
              },
              String(a.id)
            )) })
          ] }) }) }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "abwesenheiten", className: "mt-4 space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Alle eigenen Abwesenheiten (ohne Ferien)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                type: "button",
                onClick: () => {
                  resetAbsenceForms();
                  setShowAbsenceDialog(true);
                },
                className: "gap-2",
                "data-ocid": "btn-neue-abwesenheit",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CirclePlus, { className: "w-4 h-4" }),
                  "Neue Abwesenheit"
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "shadow-card", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: isLoadingAbsences ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 space-y-3", children: [1, 2, 3].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-10 w-full" }, i)) }) : regularAbsences.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "flex flex-col items-center justify-center py-16 gap-3 text-center",
              "data-ocid": "empty-abwesenheiten",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 rounded-full bg-muted flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarDays, { className: "w-6 h-6 text-muted-foreground" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-foreground", children: "Keine Abwesenheiten" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Erfassen Sie Krankheit, Unfall oder andere Abwesenheiten." })
                ] })
              ]
            }
          ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Typ" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Datum von" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Datum bis" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Tage" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Beschreibung" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Status" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Aktionen" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: regularAbsences.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              TableRow,
              {
                "data-ocid": `absence-row-${a.id}`,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium", children: getTypeName(a.absenceTypeId) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: formatDateDE(a.dateFrom) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: formatDateDE(a.dateTo) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right tabular-nums", children: daysBetween(a.dateFrom, a.dateTo) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "max-w-48 truncate text-muted-foreground", children: a.description ?? "—" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: statusBadge(a.status) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-1", children: [
                    canEditAbsence(a) && /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Button,
                      {
                        type: "button",
                        variant: "ghost",
                        size: "icon",
                        onClick: () => openEditAbsenceDialog(a),
                        "data-ocid": `btn-edit-absence-${a.id}`,
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-4 h-4" })
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Button,
                      {
                        type: "button",
                        variant: "ghost",
                        size: "icon",
                        className: "text-destructive hover:text-destructive",
                        onClick: () => handleDeleteAbsenceEntryClick(a),
                        "data-ocid": `btn-delete-absence-${a.id}`,
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-4 h-4" })
                      }
                    )
                  ] }) })
                ]
              },
              String(a.id)
            )) })
          ] }) }) }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "standardarbeitszeiten", className: "mt-4 space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Definiere deine Standardarbeitszeiten pro Wochentag als Vorlage. Diese werden für keine Berechnungen verwendet." }) }),
          isLoadingStd ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingSkeleton, {}) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
            DAY_KEYS.map((day) => {
              const blocks = stdBlocks[day];
              const dayErrors = stdBlockErrors[day] ?? [];
              return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold text-foreground", children: DAY_NAMES[day] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Button,
                    {
                      type: "button",
                      variant: "outline",
                      size: "sm",
                      onClick: () => addBlock(day),
                      "data-ocid": `std-add-block-${day}`,
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(CirclePlus, { className: "w-3.5 h-3.5 mr-1" }),
                        "Block hinzufügen"
                      ]
                    }
                  )
                ] }),
                blocks.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground py-2", children: "Keine Zeitblöcke definiert." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: blocks.map((block, i) => {
                  const assignedProjs = projects.filter((p) => {
                    if (!employeeId) return true;
                    const members = projectMembers.get(String(p.id)) ?? [];
                    return members.some(
                      (m) => String(m.employeeId) === String(employeeId)
                    );
                  });
                  const blockServiceTypes = block.projektId ? (() => {
                    const members = projectMembers.get(
                      String(block.projektId)
                    ) ?? [];
                    const myAssignments = members.filter(
                      (m) => String(m.employeeId) === String(employeeId)
                    );
                    const myStIds = new Set(
                      myAssignments.map(
                        (m) => String(m.serviceTypeId)
                      )
                    );
                    return serviceTypes.filter(
                      (st) => st.aktiv && myStIds.has(String(st.id))
                    );
                  })() : [];
                  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "div",
                    {
                      className: "rounded-lg border border-border bg-muted/20 p-3 space-y-2",
                      "data-ocid": `std-block-row-${day}-${i}`,
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground w-20 shrink-0", children: "Projekt" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs(
                            Select,
                            {
                              value: block.projektId != null ? String(block.projektId) : "",
                              onValueChange: (v) => updateBlock(
                                day,
                                i,
                                "projektId",
                                v ? Number(v) : null
                              ),
                              children: [
                                /* @__PURE__ */ jsxRuntimeExports.jsx(
                                  SelectTrigger,
                                  {
                                    className: "h-8 text-sm flex-1",
                                    "data-ocid": `std-block-projekt-${day}-${i}`,
                                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Projekt wählen…" })
                                  }
                                ),
                                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: assignedProjs.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                  SelectItem,
                                  {
                                    value: String(p.id),
                                    children: [
                                      "[",
                                      p.code,
                                      "] ",
                                      p.name
                                    ]
                                  },
                                  String(p.id)
                                )) })
                              ]
                            }
                          )
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground w-20 shrink-0", children: "Leistungsart" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs(
                            Select,
                            {
                              value: block.leistungsartId != null ? String(block.leistungsartId) : "",
                              onValueChange: (v) => updateBlock(
                                day,
                                i,
                                "leistungsartId",
                                v ? Number(v) : null
                              ),
                              disabled: !block.projektId,
                              children: [
                                /* @__PURE__ */ jsxRuntimeExports.jsx(
                                  SelectTrigger,
                                  {
                                    className: "h-8 text-sm flex-1",
                                    "data-ocid": `std-block-leistungsart-${day}-${i}`,
                                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                                      SelectValue,
                                      {
                                        placeholder: block.projektId ? "Leistungsart wählen…" : "Erst Projekt wählen"
                                      }
                                    )
                                  }
                                ),
                                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: blockServiceTypes.map((st) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                                  SelectItem,
                                  {
                                    value: String(st.id),
                                    children: st.name
                                  },
                                  String(st.id)
                                )) })
                              ]
                            }
                          )
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground w-6 shrink-0", children: "Von" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              TimeInput,
                              {
                                placeholder: "08:00",
                                value: block.von,
                                onCommit: (v) => updateBlock(day, i, "von", v),
                                className: "h-8 text-sm w-28",
                                "data-ocid": `std-block-von-${day}-${i}`
                              }
                            )
                          ] }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground w-6 shrink-0", children: "Bis" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              TimeInput,
                              {
                                placeholder: "17:00",
                                value: block.bis,
                                onCommit: (v) => updateBlock(day, i, "bis", v),
                                className: "h-8 text-sm w-28",
                                "data-ocid": `std-block-bis-${day}-${i}`
                              }
                            )
                          ] }),
                          block.von && block.bis && isValidHHMM(block.von) && isValidHHMM(block.bis) && hhmmToMinutes(block.bis) > hhmmToMinutes(block.von) && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground tabular-nums shrink-0 ml-auto", children: minutesToHHMM(
                            hhmmToMinutes(block.bis) - hhmmToMinutes(block.von)
                          ) }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            "button",
                            {
                              type: "button",
                              onClick: () => removeBlock(day, i),
                              className: "ml-auto p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0",
                              "aria-label": `Block ${i + 1} löschen`,
                              "data-ocid": `std-block-delete-${day}-${i}`,
                              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" })
                            }
                          )
                        ] })
                      ]
                    },
                    `${day}-block-${i}-${block.projektId ?? "x"}-${block.leistungsartId ?? "x"}`
                  );
                }) }),
                dayErrors.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 space-y-1", children: dayErrors.map((err, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "p",
                  {
                    className: "text-xs text-destructive",
                    children: err
                  },
                  `${day}-err-${i}-${err.slice(0, 10)}`
                )) })
              ] }) }, day);
            }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end pt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                type: "button",
                onClick: saveStdBlocks,
                disabled: isSavingStd,
                "data-ocid": "btn-save-std-blocks",
                children: isSavingStd ? "Speichern…" : "Speichern"
              }
            ) })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      TimeEntryDialog,
      {
        open: timeDialogOpen,
        onOpenChange: (open) => {
          setTimeDialogOpen(open);
          if (!open) setEditingEntry(null);
        },
        editEntry: editingEntry,
        initialValues: editingEntry ? void 0 : { date: timeDialogDate },
        onSaved: () => setTimeout(() => void loadTimeDataRef.current(), 100),
        title: editingEntry ? "Zeiteintrag bearbeiten" : "Neuer Zeiteintrag"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Dialog,
      {
        open: showAbsenceDialog,
        onOpenChange: (open) => {
          if (!open) {
            setShowAbsenceDialog(false);
            resetAbsenceForms();
          }
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md", "data-ocid": "dialog-abwesenheit", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editAbsence ? "Abwesenheit bearbeiten" : "Neue Abwesenheit" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 py-2", children: [
            !editAbsence && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "absenceType", children: "Abwesenheitsart *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Select,
                {
                  value: absenceForm.absenceTypeId,
                  onValueChange: (v) => setAbsenceForm((f) => ({ ...f, absenceTypeId: v })),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      SelectTrigger,
                      {
                        id: "absenceType",
                        "data-ocid": "select-absence-type",
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Bitte wählen…" })
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: nonVacationTypes.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(t.id), children: t.name }, String(t.id))) })
                  ]
                }
              ),
              absenceErrors.absenceTypeId && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-destructive", children: absenceErrors.absenceTypeId })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "absDateFrom", children: "Datum von *" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    id: "absDateFrom",
                    type: "date",
                    value: absenceForm.dateFrom,
                    onChange: (e) => setAbsenceForm((f) => ({ ...f, dateFrom: e.target.value })),
                    "data-ocid": "input-abs-date-from"
                  }
                ),
                absenceErrors.dateFrom && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-destructive", children: absenceErrors.dateFrom })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "absDateTo", children: "Datum bis *" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    id: "absDateTo",
                    type: "date",
                    value: absenceForm.dateTo,
                    onChange: (e) => setAbsenceForm((f) => ({ ...f, dateTo: e.target.value })),
                    "data-ocid": "input-abs-date-to"
                  }
                ),
                absenceErrors.dateTo && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-destructive", children: absenceErrors.dateTo })
              ] })
            ] }),
            isSingleDayAbsence && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { htmlFor: "absDauer", children: [
                "Dauer (hh:mm) *",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block text-xs font-normal text-muted-foreground mt-0.5", children: "Für 1-tägige Abwesenheit manuell erfassen" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "absDauer",
                  type: "text",
                  placeholder: "08:00",
                  value: absenceForm.dauer,
                  onChange: (e) => setAbsenceForm((f) => ({ ...f, dauer: e.target.value })),
                  onBlur: (e) => {
                    const norm = normalizeTimeInput(e.target.value);
                    setAbsenceForm((f) => ({ ...f, dauer: norm }));
                  },
                  className: absenceErrors.dauer ? "border-destructive" : "",
                  "data-ocid": "input-abs-dauer"
                }
              ),
              absenceErrors.dauer && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-destructive", children: absenceErrors.dauer })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "absDescription", children: "Beschreibung" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "absDescription",
                  type: "text",
                  placeholder: "Grund der Abwesenheit (optional)",
                  value: absenceForm.description,
                  onChange: (e) => setAbsenceForm((f) => ({
                    ...f,
                    description: e.target.value
                  })),
                  "data-ocid": "input-abs-description"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                type: "button",
                variant: "outline",
                onClick: () => {
                  setShowAbsenceDialog(false);
                  resetAbsenceForms();
                },
                disabled: isSavingAbsence,
                "data-ocid": "btn-cancel-absence",
                children: "Abbrechen"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                type: "button",
                onClick: submitAbsence,
                disabled: isSavingAbsence,
                "data-ocid": "btn-save-absence",
                children: isSavingAbsence ? "Speichern…" : "Speichern"
              }
            )
          ] })
        ] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Dialog,
      {
        open: showVacationDialog,
        onOpenChange: (open) => {
          if (!open) {
            setShowVacationDialog(false);
            resetAbsenceForms();
          }
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          DialogContent,
          {
            className: "max-w-md max-h-[90vh] overflow-y-auto",
            "data-ocid": "dialog-ferien",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editVacation ? "Ferien bearbeiten" : "Ferienantrag stellen" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 py-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "vacDateFrom", children: "Datum von *" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Input,
                      {
                        id: "vacDateFrom",
                        type: "date",
                        value: vacationForm.dateFrom,
                        onChange: (e) => setVacationForm((f) => ({
                          ...f,
                          dateFrom: e.target.value,
                          dateTo: f.dateTo < e.target.value ? e.target.value : f.dateTo
                        })),
                        className: vacationErrors.dateFrom ? "border-destructive" : "",
                        "data-ocid": "input-vac-date-from"
                      }
                    ),
                    vacationErrors.dateFrom && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-destructive", children: vacationErrors.dateFrom })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "vacDateTo", children: "Datum bis *" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Input,
                      {
                        id: "vacDateTo",
                        type: "date",
                        value: vacationForm.dateTo,
                        onChange: (e) => setVacationForm((f) => ({ ...f, dateTo: e.target.value })),
                        className: vacationErrors.dateTo ? "border-destructive" : "",
                        "data-ocid": "input-vac-date-to"
                      }
                    ),
                    vacationErrors.dateTo && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-destructive", children: vacationErrors.dateTo })
                  ] })
                ] }),
                vacationForm.dateFrom && vacationForm.dateTo && vacationForm.dateFrom !== vacationForm.dateTo && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground px-1 py-1 bg-muted/30 rounded-md", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium text-foreground", children: [
                    daysBetween(vacationForm.dateFrom, vacationForm.dateTo),
                    " ",
                    "Tage"
                  ] }),
                  " ",
                  "— Mehrtägige Ferien werden als Einheit gespeichert."
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Checkbox,
                    {
                      id: "vac-ganztaetig",
                      checked: vacationForm.ganztaetig,
                      onCheckedChange: (v) => setVacationForm((f) => ({
                        ...f,
                        ganztaetig: v === true,
                        dauerInput: v === true ? "" : f.dauerInput
                      })),
                      "data-ocid": "vac-ganztaetig-checkbox"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Label,
                    {
                      htmlFor: "vac-ganztaetig",
                      className: "cursor-pointer font-medium",
                      children: "Ganztägig"
                    }
                  )
                ] }),
                vacationForm.ganztaetig && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground -mt-1 pl-7", children: "Stunden werden aus der Beschäftigung je Wochentag berechnet." }),
                !vacationForm.ganztaetig && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { htmlFor: "vacDauer", children: [
                    "Dauer (hh:mm) ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      id: "vacDauer",
                      type: "text",
                      placeholder: "08:00",
                      value: vacationForm.dauerInput,
                      onChange: (e) => setVacationForm((f) => ({
                        ...f,
                        dauerInput: e.target.value
                      })),
                      onBlur: (e) => {
                        const norm = normalizeTimeInput(e.target.value);
                        setVacationForm((f) => ({ ...f, dauerInput: norm }));
                      },
                      className: vacationErrors.dauerInput ? "border-destructive" : "",
                      "data-ocid": "input-vac-dauer"
                    }
                  ),
                  vacationErrors.dauerInput && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-destructive", children: vacationErrors.dauerInput }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Eingabe: 8:00, 08:00 oder 0800 werden erkannt." })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { htmlFor: "vacDescription", children: [
                    "Bemerkung",
                    " ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground font-normal text-xs", children: "(optional)" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      id: "vacDescription",
                      placeholder: "Bemerkung…",
                      value: vacationForm.description,
                      onChange: (e) => setVacationForm((f) => ({
                        ...f,
                        description: e.target.value
                      })),
                      "data-ocid": "input-vac-description"
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    type: "button",
                    variant: "outline",
                    onClick: () => {
                      setShowVacationDialog(false);
                      resetAbsenceForms();
                    },
                    disabled: isSavingVacation,
                    "data-ocid": "btn-cancel-vacation",
                    children: "Abbrechen"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    type: "button",
                    onClick: submitVacation,
                    disabled: isSavingVacation,
                    "data-ocid": "btn-save-vacation",
                    children: isSavingVacation ? "Speichern…" : "Einreichen"
                  }
                )
              ] })
            ]
          }
        )
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      DeleteConfirmDialog,
      {
        open: !!deleteTarget,
        onConfirm: () => {
          if (!deleteTarget) return;
          if (deleteTarget.kind === "timeEntry") {
            void executeDeleteEntry(deleteTarget.entry);
          } else {
            void executeDeleteAbsence(deleteTarget.id);
          }
        },
        onCancel: () => setDeleteTarget(null),
        isDeleting
      }
    ),
    showZeitenApprovedDeleteWarning && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center z-50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card rounded-lg p-6 max-w-md mx-4 shadow-xl border border-border", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold mb-3 text-foreground", children: "Eintrag genehmigt" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mb-4", children: "Dieser Eintrag wurde bereits genehmigt. Bitte den Vorgesetzten bitten, die Genehmigung zuerst zurückzusetzen, bevor der Eintrag gelöscht werden kann." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: () => setShowZeitenApprovedDeleteWarning(false),
          className: "px-4 py-2 bg-[#006066] text-white rounded text-sm hover:opacity-90 transition-opacity",
          children: "OK"
        }
      )
    ] }) })
  ] });
}
export {
  ZeitenPage as default
};
