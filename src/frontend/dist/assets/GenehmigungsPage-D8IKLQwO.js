import { a as useNavigate, d as useQueryClient, r as reactExports, j as jsxRuntimeExports, S as Skeleton } from "./index-Blf-A8DR.js";
import { q as useMutation, L as Layout, S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem, X, D as Dialog, g as DialogContent, h as DialogHeader, i as DialogTitle, k as DialogFooter } from "./Layout-ClH0znk9.js";
import { B as Badge } from "./badge-BrNtKZcv.js";
import { B as Button } from "./button-DCGMFvti.js";
import { C as Card, a as CardContent } from "./card-CHW-R_CT.js";
import { L as Label, u as ue } from "./index-CVvtv_EE.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-Dp2E-W7o.js";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-BPjAd3S7.js";
import { T as Textarea } from "./textarea-1rE5PUZ-.js";
import { b as useAuth, u as useActor, d as useQuery, c as createActor } from "./useAuthStore-Cbv7GIMf.js";
import { f as formatDateDE } from "./dateFormat-CjU5zGrG.js";
import { C as CircleCheck } from "./circle-check-D0suFTwN.js";
import { i as Check } from "./users-DUrIKgtR.js";
import { R as RotateCcw } from "./rotate-ccw-cTRRkUHj.js";
import { C as ClipboardList } from "./clipboard-list-e1sYZFcd.js";
import "./index-Dv8dTxpA.js";
import "./createLucideIcon-BzNCDVU7.js";
const toAny = (a) => a;
function absenceStatusBadge(status) {
  if (status === "approved")
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-green-100 text-green-800 hover:bg-green-100", children: "Genehmigt" });
  if (status === "rejected")
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "destructive", children: "Abgelehnt" });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: "Ausstehend" });
}
function expenseStatusBadge(status) {
  if (status === "approved")
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-green-100 text-green-800 hover:bg-green-100", children: "Genehmigt" });
  if (status === "rejected")
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "destructive", children: "Abgelehnt" });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: "Ausstehend" });
}
function daysBetween(from, to) {
  const d1 = new Date(from);
  const d2 = new Date(to);
  return Math.max(Math.ceil((d2.getTime() - d1.getTime()) / 864e5) + 1, 1);
}
function formatDate(ts) {
  return new Date(Number(ts) / 1e6).toLocaleDateString("de-CH");
}
function formatTimeEntryDate(date) {
  if (!date) return "–";
  if (typeof date === "bigint") {
    return new Date(Number(date) / 1e6).toLocaleDateString("de-CH");
  }
  if (typeof date === "number") {
    const d = new Date(date > 1e12 ? date / 1e6 : date * 1e3);
    return d.toLocaleDateString("de-CH");
  }
  if (typeof date === "string") {
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      const [y, m, d] = date.split("-");
      return `${d}.${m}.${y}`;
    }
    const parsed = new Date(date);
    if (!Number.isNaN(parsed.getTime()))
      return parsed.toLocaleDateString("de-CH");
  }
  return "–";
}
function formatHoursHHMM(hours) {
  if (hours === void 0 || hours === null) return "–";
  const h = typeof hours === "bigint" ? Number(hours) : Number(hours);
  if (Number.isNaN(h)) return "–";
  const wholeHours = Math.floor(h);
  const minutes = Math.round((h - wholeHours) * 60);
  return `${String(wholeHours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}
function GenehmigungsPage() {
  const navigate = useNavigate();
  const { isAuthenticated, companyId, role, employeeId } = useAuth();
  const { actor, isFetching } = useActor(createActor);
  const queryClient = useQueryClient();
  const [absenceFilter, setAbsenceFilter] = reactExports.useState("submitted");
  const [expenseFilter, setExpenseFilter] = reactExports.useState("pending");
  const [mitarbeiterFilter, setMitarbeiterFilter] = reactExports.useState(
    role === "admin" ? "alle" : "meine"
  );
  const supervisedEmployeeIds = reactExports.useMemo(() => {
    const ids = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key == null ? void 0 : key.startsWith("supervisor_")) {
        const supervisorId = localStorage.getItem(key);
        if (supervisorId === employeeId) {
          ids.push(key.replace("supervisor_", ""));
        }
      }
    }
    return ids;
  }, [employeeId]);
  const [rejectAbsenceId, setRejectAbsenceId] = reactExports.useState(null);
  const [rejectAbsenceComment, setRejectAbsenceComment] = reactExports.useState("");
  const [resetAbsenceId, setResetAbsenceId] = reactExports.useState(null);
  const [resetAbsenceReason, setResetAbsenceReason] = reactExports.useState("");
  const [rejectExpenseId, setRejectExpenseId] = reactExports.useState(null);
  const [rejectExpenseComment, setRejectExpenseComment] = reactExports.useState("");
  const [resetExpenseId, setResetExpenseId] = reactExports.useState(null);
  const [resetExpenseReason, setResetExpenseReason] = reactExports.useState("");
  const [rejectZeitrapportId, setRejectZeitrapportId] = reactExports.useState(
    null
  );
  const [rejectZeitrapportReason, setRejectZeitrapportReason] = reactExports.useState("");
  const [filterMonthFerien, setFilterMonthFerien] = reactExports.useState("alle");
  const [filterMonthAbsenzen, setFilterMonthAbsenzen] = reactExports.useState("alle");
  const [filterMonthSpesen, setFilterMonthSpesen] = reactExports.useState("alle");
  const [filterMonthZeitrapporte, setFilterMonthZeitrapporte] = reactExports.useState("alle");
  const [filterStatusZeitrapporte, setFilterStatusZeitrapporte] = reactExports.useState("alle");
  reactExports.useEffect(() => {
    if (!isAuthenticated || !companyId) {
      navigate({ to: "/" });
      return;
    }
    if (role !== "admin" && role !== "manager") {
      navigate({ to: "/dashboard" });
    }
  }, [isAuthenticated, companyId, role, navigate]);
  const enabled = !!actor && !isFetching && isAuthenticated && (role === "admin" || role === "manager");
  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      if (!actor) return [];
      return await toAny(actor).listEmployees();
    },
    enabled,
    staleTime: 6e4
  });
  const { data: absenceTypes = [] } = useQuery({
    queryKey: ["absenceTypes"],
    queryFn: async () => {
      if (!actor) return [];
      return await toAny(actor).listAbsenceTypes();
    },
    enabled,
    staleTime: 6e4
  });
  const vacationType = absenceTypes.find(
    (t) => t.name.toLowerCase() === "ferien"
  );
  const absenceQueryFilter = absenceFilter === "all" ? {} : absenceFilter === "submitted" ? { status: "submitted" } : absenceFilter === "approved" ? { status: "approved" } : { status: "rejected" };
  const { data: allAbsences = [], isLoading: loadingAbsences } = useQuery({
    queryKey: ["allAbsences", absenceFilter],
    queryFn: async () => {
      if (!actor) return [];
      return await toAny(actor).listAbsences(absenceQueryFilter);
    },
    enabled,
    staleTime: 3e4
  });
  const vacationAbsencesRaw = allAbsences.filter(
    (a) => vacationType && a.absenceTypeId === vacationType.id
  );
  new Set(
    absenceTypes.filter((t) => !vacationType || t.id !== vacationType.id).map((t) => String(t.id))
  );
  const nonVacationApprovalAbsencesRaw = allAbsences.filter(
    (a) => !vacationType || String(a.absenceTypeId) !== String(vacationType.id)
  );
  const vacationAbsencesFiltered = mitarbeiterFilter === "meine" ? vacationAbsencesRaw.filter(
    (a) => supervisedEmployeeIds.includes(String(a.employeeId))
  ) : vacationAbsencesRaw;
  const nonVacationApprovalAbsencesFiltered = mitarbeiterFilter === "meine" ? nonVacationApprovalAbsencesRaw.filter(
    (a) => supervisedEmployeeIds.includes(String(a.employeeId))
  ) : nonVacationApprovalAbsencesRaw;
  const vacationAbsences = filterMonthFerien === "alle" ? vacationAbsencesFiltered : vacationAbsencesFiltered.filter((a) => {
    const d = new Date(a.dateFrom);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}` === filterMonthFerien;
  });
  const nonVacationApprovalAbsences = filterMonthAbsenzen === "alle" ? nonVacationApprovalAbsencesFiltered : nonVacationApprovalAbsencesFiltered.filter((a) => {
    const d = new Date(a.dateFrom);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}` === filterMonthAbsenzen;
  });
  function getAbsenceTypeName(id) {
    var _a;
    return ((_a = absenceTypes.find((t) => t.id === id)) == null ? void 0 : _a.name) ?? String(id);
  }
  const expenseQueryFilter = expenseFilter === "all" ? {} : { status: expenseFilter };
  const { data: allExpensesRaw = [], isLoading: loadingExpenses } = useQuery({
    queryKey: ["allExpenses", expenseFilter],
    queryFn: async () => {
      if (!actor) return [];
      return await toAny(actor).listExpenses(expenseQueryFilter);
    },
    enabled,
    staleTime: 3e4
  });
  const allExpensesFiltered = mitarbeiterFilter === "meine" ? allExpensesRaw.filter(
    (e) => supervisedEmployeeIds.includes(String(e.employeeId))
  ) : allExpensesRaw;
  const allExpenses = filterMonthSpesen === "alle" ? allExpensesFiltered : allExpensesFiltered.filter((e) => {
    if (!e.date) return false;
    const d = new Date(
      typeof e.date === "bigint" ? Number(e.date) / 1e6 : String(e.date)
    );
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}` === filterMonthSpesen;
  });
  const { data: submittedTimeEntriesRaw = [], refetch: refetchTimeEntries } = useQuery({
    queryKey: ["submittedTimeEntries", companyId],
    queryFn: async () => {
      if (!actor) return [];
      return await toAny(actor).listSubmittedTimeEntries();
    },
    enabled,
    staleTime: 3e4
  });
  const submittedTimeEntriesFiltered = mitarbeiterFilter === "meine" ? submittedTimeEntriesRaw.filter(
    (e) => supervisedEmployeeIds.includes(String(e.employeeId))
  ) : submittedTimeEntriesRaw;
  const submittedTimeEntries = submittedTimeEntriesFiltered.filter((e) => {
    if (filterMonthZeitrapporte === "alle") return true;
    const raw = e.date;
    if (!raw) return false;
    let d;
    if (typeof raw === "bigint") d = new Date(Number(raw) / 1e6);
    else if (typeof raw === "number")
      d = new Date(raw > 1e12 ? raw / 1e6 : raw * 1e3);
    else d = new Date(String(raw));
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}` === filterMonthZeitrapporte;
  }).filter((e) => {
    if (filterStatusZeitrapporte === "alle") return true;
    return String(e.status) === filterStatusZeitrapporte;
  });
  function getEmployeeName(id) {
    const emp = employees.find((e) => e.id === id);
    return emp ? `${emp.firstName} ${emp.lastName}` : String(id);
  }
  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      if (!actor) return [];
      return await toAny(actor).listProjects();
    },
    enabled,
    staleTime: 6e4
  });
  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      if (!actor) return [];
      return await toAny(actor).listCustomers();
    },
    enabled,
    staleTime: 6e4
  });
  const { data: serviceTypes = [] } = useQuery({
    queryKey: ["serviceTypes"],
    queryFn: async () => {
      if (!actor) return [];
      return await toAny(actor).listServiceTypes();
    },
    enabled,
    staleTime: 6e4
  });
  function getProjectName(id) {
    const proj = projects.find((p) => String(p.id) === String(id));
    return (proj == null ? void 0 : proj.name) ?? "–";
  }
  function getClientName(id) {
    const proj = projects.find((p) => String(p.id) === String(id));
    if (!proj) return "–";
    const cust = customers.find(
      (c) => String(c.id) === String(proj.customerId)
    );
    return (cust == null ? void 0 : cust.name) ?? "–";
  }
  function getServiceTypeName(id) {
    const st = serviceTypes.find((s) => String(s.id) === String(id));
    return (st == null ? void 0 : st.name) ?? "–";
  }
  const approveAbsenceMutation = useMutation({
    mutationFn: async (id) => {
      if (!actor) throw new Error("Nicht verfügbar");
      const result = await toAny(actor).approveAbsence(id);
      if (result.__kind__ === "err")
        throw new Error(
          typeof result.err === "string" ? result.err : "Fehler bei der Genehmigung"
        );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["allAbsences"],
        refetchType: "active"
      });
      queryClient.invalidateQueries({
        queryKey: ["absences"],
        refetchType: "active"
      });
      ue.success("Ferienantrag genehmigt");
    },
    onError: (err) => ue.error(`Genehmigung fehlgeschlagen: ${err.message}`)
  });
  const rejectAbsenceMutation = useMutation({
    mutationFn: async ({ id, comment }) => {
      if (!actor) throw new Error("Nicht verfügbar");
      let result;
      try {
        result = await toAny(actor).rejectAbsence(id, comment);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        throw new Error(`Canister-Fehler: ${msg}`);
      }
      const r = result;
      if (r.__kind__ === "err")
        throw new Error(
          typeof r.err === "string" ? r.err : "Fehler bei der Ablehnung"
        );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allAbsences"] });
      queryClient.invalidateQueries({ queryKey: ["absences"] });
      ue.success("Ferienantrag abgelehnt");
      setRejectAbsenceId(null);
      setRejectAbsenceComment("");
    },
    onError: (err) => ue.error(err.message)
  });
  const approveExpenseMutation = useMutation({
    mutationFn: async (id) => {
      if (!actor) throw new Error("Nicht verfügbar");
      const result = await toAny(actor).approveExpense(id);
      if (result.__kind__ === "err")
        throw new Error(result.err ?? "Fehler bei der Genehmigung");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["allExpenses"],
        refetchType: "active"
      });
      queryClient.invalidateQueries({
        queryKey: ["expenses"],
        refetchType: "active"
      });
      ue.success("Spesen genehmigt");
    },
    onError: (err) => ue.error(err.message)
  });
  const rejectExpenseMutation = useMutation({
    mutationFn: async ({ id, comment }) => {
      if (!actor) throw new Error("Nicht verfügbar");
      const result = await toAny(actor).rejectExpense(
        id,
        comment || null
      );
      if (result.__kind__ === "err")
        throw new Error(result.err ?? "Fehler bei der Ablehnung");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["allExpenses"],
        refetchType: "active"
      });
      queryClient.invalidateQueries({
        queryKey: ["expenses"],
        refetchType: "active"
      });
      ue.success("Spesen abgelehnt");
      setRejectExpenseId(null);
      setRejectExpenseComment("");
    },
    onError: (err) => ue.error(err.message)
  });
  const resetAbsenceMutation = useMutation({
    mutationFn: async ({ id, reason }) => {
      if (!actor) throw new Error("Nicht verfügbar");
      let result;
      try {
        result = await toAny(actor).resetAbsenceToAusstehend(id, reason);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        throw new Error(`Canister-Fehler: ${msg}`);
      }
      const r = result;
      if (r.__kind__ === "err")
        throw new Error(r.err ?? "Fehler beim Zurücksetzen");
      if (typeof r.err === "string") throw new Error(r.err);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["allAbsences"],
        refetchType: "active"
      });
      queryClient.invalidateQueries({
        queryKey: ["absences"],
        refetchType: "active"
      });
      ue.success("Ferienantrag auf «Ausstehend» zurückgesetzt");
      setResetAbsenceId(null);
      setResetAbsenceReason("");
    },
    onError: (err) => ue.error(err.message)
  });
  const resetExpenseMutation = useMutation({
    mutationFn: async ({ id, reason }) => {
      if (!actor) throw new Error("Nicht verfügbar");
      const result = await toAny(actor).resetExpenseToAusstehend(
        id,
        reason
      );
      if (result.__kind__ === "err")
        throw new Error(result.err ?? "Fehler beim Zurücksetzen");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["allExpenses"],
        refetchType: "active"
      });
      queryClient.invalidateQueries({
        queryKey: ["expenses"],
        refetchType: "active"
      });
      ue.success("Spesen auf «Ausstehend» zurückgesetzt");
      setResetExpenseId(null);
      setResetExpenseReason("");
    },
    onError: (err) => {
      ue.error(err.message);
      setResetExpenseId(null);
    }
  });
  const approveTimeEntryMutation = useMutation({
    mutationFn: async (id) => {
      if (!actor) throw new Error("Nicht verfügbar");
      const result = await actor.approveTimeEntry(id, {});
      const r = result;
      if (r && "err" in r)
        throw new Error(r.err ?? "Fehler bei der Genehmigung");
    },
    onSuccess: () => {
      refetchTimeEntries();
      queryClient.invalidateQueries({ queryKey: ["timeEntries"] });
      queryClient.invalidateQueries({ queryKey: ["submittedTimeEntries"] });
      ue.success("Zeiteintrag genehmigt");
    },
    onError: (err) => ue.error(`Fehler: ${(err == null ? void 0 : err.message) ?? "Unbekannter Fehler"}`)
  });
  const rejectTimeEntryMutation = useMutation({
    mutationFn: async ({ id, reason }) => {
      if (!actor) throw new Error("Nicht verfügbar");
      const result = await actor.rejectTimeEntry(id, { reason });
      const r = result;
      if (r && "err" in r)
        throw new Error(r.err ?? "Fehler bei der Ablehnung");
    },
    onSuccess: () => {
      refetchTimeEntries();
      queryClient.invalidateQueries({ queryKey: ["timeEntries"] });
      queryClient.invalidateQueries({ queryKey: ["submittedTimeEntries"] });
      setRejectZeitrapportId(null);
      setRejectZeitrapportReason("");
      ue.success("Zeiteintrag abgelehnt");
    },
    onError: (err) => ue.error(`Fehler: ${(err == null ? void 0 : err.message) ?? "Unbekannter Fehler"}`)
  });
  if (role !== "admin" && role !== "manager") return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Layout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 space-y-6", "data-ocid": "genehmigungen-page", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-display font-bold text-foreground", children: "Genehmigungen" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-0.5", children: "Ferienanträge und Spesen prüfen und genehmigen" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: () => setMitarbeiterFilter("alle"),
          className: `px-3 py-1.5 rounded text-sm font-medium transition-colors ${mitarbeiterFilter === "alle" ? "bg-[#006066] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`,
          "data-ocid": "filter-alle-mitarbeiter",
          children: "Alle Mitarbeiter"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: () => setMitarbeiterFilter("meine"),
          className: `px-3 py-1.5 rounded text-sm font-medium transition-colors ${mitarbeiterFilter === "meine" ? "bg-[#006066] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`,
          "data-ocid": "filter-meine-mitarbeiter",
          children: "Meine Mitarbeiter"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "ferien", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "ferien", "data-ocid": "tab-ferien-genehmigung", children: "Ferienanträge" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "absenzen", "data-ocid": "tab-absenzen-genehmigung", children: [
          "Absenzen",
          nonVacationApprovalAbsences.filter(
            (a) => a.status === "submitted"
          ).length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold", children: nonVacationApprovalAbsences.filter(
            (a) => a.status === "submitted"
          ).length })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "spesen", "data-ocid": "tab-spesen-genehmigung", children: "Spesen" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          TabsTrigger,
          {
            value: "zeitrapporte",
            "data-ocid": "tab-zeitrapporte-genehmigung",
            children: "Zeitrapporte"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "ferien", className: "mt-4 space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center flex-wrap gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Ferienanträge aller Mitarbeitenden" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm text-muted-foreground whitespace-nowrap", children: "Monat:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: filterMonthFerien,
                onValueChange: setFilterMonthFerien,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    SelectTrigger,
                    {
                      className: "w-36",
                      "data-ocid": "select-ferien-month-filter",
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {})
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "alle", children: "Alle Monate" }),
                    Array.from({ length: 12 }, (_, i) => {
                      const d = /* @__PURE__ */ new Date();
                      d.setMonth(d.getMonth() - i);
                      const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
                      const label = d.toLocaleDateString("de-CH", {
                        month: "long",
                        year: "numeric"
                      });
                      return /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: val, children: label }, val);
                    })
                  ] })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm text-muted-foreground whitespace-nowrap", children: "Status:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: absenceFilter,
                onValueChange: (v) => setAbsenceFilter(v),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    SelectTrigger,
                    {
                      className: "w-36",
                      "data-ocid": "select-absence-filter",
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {})
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "submitted", children: "Ausstehend" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "approved", children: "Genehmigt" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "rejected", children: "Abgelehnt" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Alle" })
                  ] })
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "shadow-card", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: loadingAbsences ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 space-y-3", children: [1, 2, 3].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-10 w-full" }, i)) }) : vacationAbsences.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "flex flex-col items-center justify-center py-16 gap-3 text-center",
            "data-ocid": "empty-ferien-genehmigung",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 rounded-full bg-muted flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-6 h-6 text-muted-foreground" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-foreground", children: "Keine Ferienanträge" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Es liegen keine Anträge mit dem gewählten Status vor." })
              ] })
            ]
          }
        ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Mitarbeiter" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Datum von" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Datum bis" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Anzahl Tage" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Begründung" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Eingereicht am" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Aktionen" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: vacationAbsences.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            TableRow,
            {
              "data-ocid": `vacation-approval-row-${a.id}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium", children: getEmployeeName(a.employeeId) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: formatDateDE(a.dateFrom) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: formatDateDE(a.dateTo) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right tabular-nums", children: daysBetween(a.dateFrom, a.dateTo) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "max-w-40 truncate text-muted-foreground", children: a.description ?? "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-muted-foreground text-sm", children: formatDate(a.createdAt) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: absenceStatusBadge(a.status) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-1", children: [
                  a.status === "submitted" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      Button,
                      {
                        type: "button",
                        size: "sm",
                        variant: "outline",
                        className: "gap-1.5 text-green-700 border-green-200 hover:bg-green-50",
                        onClick: () => approveAbsenceMutation.mutate(a.id),
                        disabled: approveAbsenceMutation.isPending,
                        "data-ocid": `btn-approve-vacation-${a.id}`,
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "w-3.5 h-3.5" }),
                          "Genehmigen"
                        ]
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      Button,
                      {
                        type: "button",
                        size: "sm",
                        variant: "outline",
                        className: "gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10",
                        onClick: () => {
                          setRejectAbsenceId(a.id);
                          setRejectAbsenceComment("");
                        },
                        "data-ocid": `btn-reject-vacation-${a.id}`,
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-3.5 h-3.5" }),
                          "Ablehnen"
                        ]
                      }
                    )
                  ] }),
                  a.status === "approved" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Button,
                    {
                      type: "button",
                      size: "sm",
                      variant: "outline",
                      className: "gap-1.5 text-amber-700 border-amber-200 hover:bg-amber-50",
                      onClick: () => {
                        setResetAbsenceId(a.id);
                        setResetAbsenceReason("");
                      },
                      "data-ocid": `btn-reset-vacation-${a.id}`,
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "w-3.5 h-3.5" }),
                        "Zurücksetzen"
                      ]
                    }
                  ),
                  a.status === "rejected" && a.rejectionComment && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground italic max-w-32 truncate block", children: a.rejectionComment })
                ] }) })
              ]
            },
            String(a.id)
          )) })
        ] }) }) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "absenzen", className: "mt-4 space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Absenzen mit Genehmigungspflicht aller Mitarbeitenden" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm text-muted-foreground whitespace-nowrap", children: "Monat:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: filterMonthAbsenzen,
                onValueChange: setFilterMonthAbsenzen,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    SelectTrigger,
                    {
                      className: "w-36",
                      "data-ocid": "select-absenzen-month-filter",
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {})
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "alle", children: "Alle Monate" }),
                    Array.from({ length: 12 }, (_, i) => {
                      const d = /* @__PURE__ */ new Date();
                      d.setMonth(d.getMonth() - i);
                      const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
                      const label = d.toLocaleDateString("de-CH", {
                        month: "long",
                        year: "numeric"
                      });
                      return /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: val, children: label }, val);
                    })
                  ] })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm text-muted-foreground whitespace-nowrap", children: "Status:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: absenceFilter,
                onValueChange: (v) => setAbsenceFilter(v),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    SelectTrigger,
                    {
                      className: "w-36",
                      "data-ocid": "select-absenzen-filter",
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {})
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "submitted", children: "Ausstehend" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "approved", children: "Genehmigt" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "rejected", children: "Abgelehnt" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Alle" })
                  ] })
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "shadow-card", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: loadingAbsences ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 space-y-3", children: [1, 2, 3].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-10 w-full" }, i)) }) : nonVacationApprovalAbsences.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "flex flex-col items-center justify-center py-16 gap-3 text-center",
            "data-ocid": "empty-absenzen-genehmigung",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 rounded-full bg-muted flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-6 h-6 text-muted-foreground" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-foreground", children: "Keine Absenzen" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Es liegen keine Absenzen mit dem gewählten Status vor." })
              ] })
            ]
          }
        ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Mitarbeiter" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Abwesenheitsart" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Datum von" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Datum bis" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Tage" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Begründung" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Eingereicht am" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Aktionen" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: nonVacationApprovalAbsences.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            TableRow,
            {
              "data-ocid": `absenz-approval-row-${a.id}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium", children: getEmployeeName(a.employeeId) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-muted-foreground", children: getAbsenceTypeName(a.absenceTypeId) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: formatDateDE(a.dateFrom) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: formatDateDE(a.dateTo) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right tabular-nums", children: daysBetween(a.dateFrom, a.dateTo) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "max-w-40 truncate text-muted-foreground", children: a.description ?? "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-muted-foreground text-sm", children: formatDate(a.createdAt) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: absenceStatusBadge(a.status) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-1", children: [
                  a.status === "submitted" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      Button,
                      {
                        type: "button",
                        size: "sm",
                        variant: "outline",
                        className: "gap-1.5 text-green-700 border-green-200 hover:bg-green-50",
                        onClick: () => approveAbsenceMutation.mutate(a.id),
                        disabled: approveAbsenceMutation.isPending,
                        "data-ocid": `btn-approve-absenz-${a.id}`,
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "w-3.5 h-3.5" }),
                          "Genehmigen"
                        ]
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      Button,
                      {
                        type: "button",
                        size: "sm",
                        variant: "outline",
                        className: "gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10",
                        onClick: () => {
                          setRejectAbsenceId(a.id);
                          setRejectAbsenceComment("");
                        },
                        "data-ocid": `btn-reject-absenz-${a.id}`,
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-3.5 h-3.5" }),
                          "Ablehnen"
                        ]
                      }
                    )
                  ] }),
                  a.status === "approved" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Button,
                    {
                      type: "button",
                      size: "sm",
                      variant: "outline",
                      className: "gap-1.5 text-amber-700 border-amber-200 hover:bg-amber-50",
                      onClick: () => {
                        setResetAbsenceId(a.id);
                        setResetAbsenceReason("");
                      },
                      "data-ocid": `btn-reset-absenz-${a.id}`,
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "w-3.5 h-3.5" }),
                        "Zurücksetzen"
                      ]
                    }
                  ),
                  a.status === "rejected" && a.rejectionComment && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground italic max-w-32 truncate block", children: a.rejectionComment })
                ] }) })
              ]
            },
            String(a.id)
          )) })
        ] }) }) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "spesen", className: "mt-4 space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center flex-wrap gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Spesenbelege aller Mitarbeitenden" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm text-muted-foreground whitespace-nowrap", children: "Monat:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: filterMonthSpesen,
                onValueChange: setFilterMonthSpesen,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    SelectTrigger,
                    {
                      className: "w-36",
                      "data-ocid": "select-spesen-month-filter",
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {})
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "alle", children: "Alle Monate" }),
                    Array.from({ length: 12 }, (_, i) => {
                      const d = /* @__PURE__ */ new Date();
                      d.setMonth(d.getMonth() - i);
                      const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
                      const label = d.toLocaleDateString("de-CH", {
                        month: "long",
                        year: "numeric"
                      });
                      return /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: val, children: label }, val);
                    })
                  ] })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm text-muted-foreground whitespace-nowrap", children: "Status:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: expenseFilter,
                onValueChange: (v) => setExpenseFilter(v),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    SelectTrigger,
                    {
                      className: "w-36",
                      "data-ocid": "select-expense-filter",
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {})
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "pending", children: "Ausstehend" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "approved", children: "Genehmigt" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "rejected", children: "Abgelehnt" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Alle" })
                  ] })
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "shadow-card", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: loadingExpenses ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 space-y-3", children: [1, 2, 3].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-10 w-full" }, i)) }) : allExpenses.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "flex flex-col items-center justify-center py-16 gap-3 text-center",
            "data-ocid": "empty-spesen-genehmigung",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 rounded-full bg-muted flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "w-6 h-6 text-muted-foreground" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-foreground", children: "Keine Spesen" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Es liegen keine Spesenbelege mit dem gewählten Status vor." })
              ] })
            ]
          }
        ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Mitarbeiter" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Datum" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Verrechenbar (CHF)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Rückvergütung (CHF)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Beschreibung" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Aktionen" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: allExpenses.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            TableRow,
            {
              "data-ocid": `expense-approval-row-${e.id}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium", children: getEmployeeName(e.employeeId) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: formatDateDE(e.date) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right tabular-nums", children: e.billableCHF.toFixed(2) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right tabular-nums", children: e.reimbursementCHF.toFixed(2) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "max-w-40 truncate text-muted-foreground", children: e.description || "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: expenseStatusBadge(e.status) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { className: "text-right", children: [
                  e.status === "pending" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      Button,
                      {
                        type: "button",
                        size: "sm",
                        variant: "outline",
                        className: "gap-1.5 text-green-700 border-green-200 hover:bg-green-50",
                        onClick: () => approveExpenseMutation.mutate(e.id),
                        disabled: approveExpenseMutation.isPending,
                        "data-ocid": `btn-approve-expense-${e.id}`,
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "w-3.5 h-3.5" }),
                          "Genehmigen"
                        ]
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      Button,
                      {
                        type: "button",
                        size: "sm",
                        variant: "outline",
                        className: "gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10",
                        onClick: () => {
                          setRejectExpenseId(e.id);
                          setRejectExpenseComment("");
                        },
                        "data-ocid": `btn-reject-expense-${e.id}`,
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-3.5 h-3.5" }),
                          "Ablehnen"
                        ]
                      }
                    )
                  ] }),
                  e.status === "approved" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end gap-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Button,
                    {
                      type: "button",
                      size: "sm",
                      variant: "outline",
                      className: "gap-1.5 text-amber-700 border-amber-200 hover:bg-amber-50",
                      onClick: () => {
                        setResetExpenseId(e.id);
                        setResetExpenseReason("");
                      },
                      "data-ocid": `btn-reset-expense-${e.id}`,
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "w-3.5 h-3.5" }),
                        "Zurücksetzen"
                      ]
                    }
                  ) })
                ] })
              ]
            },
            String(e.id)
          )) })
        ] }) }) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "zeitrapporte", className: "mt-4 space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center flex-wrap gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Eingereichte Zeitrapporte aller Mitarbeitenden" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm text-muted-foreground whitespace-nowrap", children: "Monat:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: filterMonthZeitrapporte,
                onValueChange: setFilterMonthZeitrapporte,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    SelectTrigger,
                    {
                      className: "w-36",
                      "data-ocid": "select-zeitrapporte-month-filter",
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {})
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "alle", children: "Alle Monate" }),
                    Array.from({ length: 12 }, (_, i) => {
                      const d = /* @__PURE__ */ new Date();
                      d.setMonth(d.getMonth() - i);
                      const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
                      const label = d.toLocaleDateString("de-CH", {
                        month: "long",
                        year: "numeric"
                      });
                      return /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: val, children: label }, val);
                    })
                  ] })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm text-muted-foreground whitespace-nowrap", children: "Status:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: filterStatusZeitrapporte,
                onValueChange: setFilterStatusZeitrapporte,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    SelectTrigger,
                    {
                      className: "w-36",
                      "data-ocid": "select-zeitrapporte-status-filter",
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {})
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "alle", children: "Alle Status" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "submitted", children: "Ausstehend" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "approved", children: "Genehmigt" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "rejected", children: "Abgelehnt" })
                  ] })
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "shadow-card", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "bg-[#00182b] hover:bg-[#00182b]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-white", children: "Mitarbeiter" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-white", children: "Datum" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-white", children: "Stunden" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-white", children: "Kunde" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-white", children: "Projekt" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-white", children: "Leistungsart" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-white", children: "Beschreibung" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-white", children: "Aktionen" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: submittedTimeEntries.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 8, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "flex flex-col items-center justify-center py-16 gap-3 text-center",
              "data-ocid": "empty-zeitrapporte-genehmigung",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 rounded-full bg-muted flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "w-6 h-6 text-muted-foreground" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-foreground", children: "Keine ausstehenden Zeitrapporte" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Alle Zeitrapporte wurden bearbeitet" })
                ] })
              ]
            }
          ) }) }) : submittedTimeEntries.map((entry, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            TableRow,
            {
              "data-ocid": `zeitrapport-item-${idx + 1}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: getEmployeeName(
                  BigInt(String(entry.employeeId))
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: formatTimeEntryDate(entry.date) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "tabular-nums", children: formatHoursHHMM(entry.hours) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-muted-foreground", children: getClientName(entry.projectId) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-muted-foreground", children: getProjectName(entry.projectId) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-muted-foreground", children: getServiceTypeName(entry.serviceTypeId) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "max-w-[160px] truncate", children: String(entry.description || "-") }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Button,
                    {
                      type: "button",
                      size: "sm",
                      className: "gap-1.5 bg-green-600 hover:bg-green-700 text-white",
                      onClick: () => approveTimeEntryMutation.mutate(
                        BigInt(String(entry.id))
                      ),
                      disabled: approveTimeEntryMutation.isPending,
                      "data-ocid": `btn-approve-zeitrapport-${idx + 1}`,
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "w-3.5 h-3.5" }),
                        "Genehmigen"
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Button,
                    {
                      type: "button",
                      size: "sm",
                      variant: "outline",
                      className: "gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10",
                      onClick: () => {
                        setRejectZeitrapportId(
                          BigInt(String(entry.id))
                        );
                        setRejectZeitrapportReason("");
                      },
                      "data-ocid": `btn-reject-zeitrapport-${idx + 1}`,
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-3.5 h-3.5" }),
                        "Ablehnen"
                      ]
                    }
                  )
                ] }) })
              ]
            },
            String(entry.id)
          )) })
        ] }) }) }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Dialog,
      {
        open: rejectZeitrapportId !== null,
        onOpenChange: (open) => {
          if (!open) {
            setRejectZeitrapportId(null);
            setRejectZeitrapportReason("");
          }
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          DialogContent,
          {
            className: "max-w-md",
            "data-ocid": "dialog-reject-zeitrapport",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Zeiteintrag ablehnen" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { htmlFor: "rejectZeitrapportReason", children: [
                  "Begründung ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Textarea,
                  {
                    id: "rejectZeitrapportReason",
                    placeholder: "Grund der Ablehnung eingeben…",
                    rows: 3,
                    value: rejectZeitrapportReason,
                    onChange: (e) => setRejectZeitrapportReason(e.target.value),
                    "data-ocid": "input-reject-zeitrapport-reason"
                  }
                )
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    type: "button",
                    variant: "outline",
                    onClick: () => {
                      setRejectZeitrapportId(null);
                      setRejectZeitrapportReason("");
                    },
                    "data-ocid": "btn-cancel-reject-zeitrapport",
                    children: "Abbrechen"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    type: "button",
                    variant: "destructive",
                    onClick: () => {
                      if (rejectZeitrapportId !== null && rejectZeitrapportReason.trim()) {
                        rejectTimeEntryMutation.mutate({
                          id: rejectZeitrapportId,
                          reason: rejectZeitrapportReason
                        });
                      }
                    },
                    disabled: rejectTimeEntryMutation.isPending || !rejectZeitrapportReason.trim(),
                    "data-ocid": "btn-confirm-reject-zeitrapport",
                    children: rejectTimeEntryMutation.isPending ? "Ablehnen…" : "Ablehnen bestätigen"
                  }
                )
              ] })
            ]
          }
        )
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Dialog,
      {
        open: rejectAbsenceId !== null,
        onOpenChange: (open) => {
          if (!open) {
            setRejectAbsenceId(null);
            setRejectAbsenceComment("");
          }
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          DialogContent,
          {
            className: "max-w-md",
            "data-ocid": "dialog-reject-vacation",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Ferienantrag ablehnen" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Sie können optional einen Kommentar angeben, der dem Mitarbeiter mitgeteilt wird." }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "rejectAbsenceComment", children: "Kommentar (optional)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Textarea,
                    {
                      id: "rejectAbsenceComment",
                      placeholder: "Begründung der Ablehnung…",
                      rows: 3,
                      value: rejectAbsenceComment,
                      onChange: (e) => setRejectAbsenceComment(e.target.value),
                      "data-ocid": "input-reject-absence-comment"
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    type: "button",
                    variant: "outline",
                    onClick: () => {
                      setRejectAbsenceId(null);
                      setRejectAbsenceComment("");
                    },
                    children: "Abbrechen"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    type: "button",
                    variant: "destructive",
                    onClick: () => {
                      if (rejectAbsenceId !== null) {
                        rejectAbsenceMutation.mutate({
                          id: rejectAbsenceId,
                          comment: rejectAbsenceComment
                        });
                      }
                    },
                    disabled: rejectAbsenceMutation.isPending,
                    "data-ocid": "btn-confirm-reject-vacation",
                    children: rejectAbsenceMutation.isPending ? "Ablehnen…" : "Ablehnen bestätigen"
                  }
                )
              ] })
            ]
          }
        )
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Dialog,
      {
        open: rejectExpenseId !== null,
        onOpenChange: (open) => {
          if (!open) {
            setRejectExpenseId(null);
            setRejectExpenseComment("");
          }
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md", "data-ocid": "dialog-reject-expense", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Spesen ablehnen" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Sie können optional einen Kommentar angeben." }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "rejectExpenseComment", children: "Kommentar (optional)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Textarea,
                {
                  id: "rejectExpenseComment",
                  placeholder: "Begründung der Ablehnung…",
                  rows: 3,
                  value: rejectExpenseComment,
                  onChange: (e) => setRejectExpenseComment(e.target.value),
                  "data-ocid": "input-reject-expense-comment"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                type: "button",
                variant: "outline",
                onClick: () => {
                  setRejectExpenseId(null);
                  setRejectExpenseComment("");
                },
                children: "Abbrechen"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                type: "button",
                variant: "destructive",
                onClick: () => {
                  if (rejectExpenseId !== null) {
                    rejectExpenseMutation.mutate({
                      id: rejectExpenseId,
                      comment: rejectExpenseComment
                    });
                  }
                },
                disabled: rejectExpenseMutation.isPending,
                "data-ocid": "btn-confirm-reject-expense",
                children: rejectExpenseMutation.isPending ? "Ablehnen…" : "Ablehnen bestätigen"
              }
            )
          ] })
        ] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Dialog,
      {
        open: resetAbsenceId !== null,
        onOpenChange: (open) => {
          if (!open) {
            setResetAbsenceId(null);
            setResetAbsenceReason("");
          }
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md", "data-ocid": "dialog-reset-vacation", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Ferienantrag zurücksetzen" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Der Status wird auf «Ausstehend» zurückgesetzt. Bitte geben Sie eine Begründung an." }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { htmlFor: "resetAbsenceReason", children: [
                "Begründung ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Textarea,
                {
                  id: "resetAbsenceReason",
                  placeholder: "Begründung für das Zurücksetzen…",
                  rows: 3,
                  value: resetAbsenceReason,
                  onChange: (e) => setResetAbsenceReason(e.target.value),
                  "data-ocid": "input-reset-absence-reason"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                type: "button",
                variant: "outline",
                onClick: () => {
                  setResetAbsenceId(null);
                  setResetAbsenceReason("");
                },
                children: "Abbrechen"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                type: "button",
                onClick: () => {
                  if (resetAbsenceId !== null && resetAbsenceReason.trim()) {
                    resetAbsenceMutation.mutate({
                      id: resetAbsenceId,
                      reason: resetAbsenceReason
                    });
                  }
                },
                disabled: resetAbsenceMutation.isPending || !resetAbsenceReason.trim(),
                "data-ocid": "btn-confirm-reset-vacation",
                children: resetAbsenceMutation.isPending ? "Zurücksetzen…" : "Zurücksetzen bestätigen"
              }
            )
          ] })
        ] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Dialog,
      {
        open: resetExpenseId !== null,
        onOpenChange: (open) => {
          if (!open) {
            setResetExpenseId(null);
            setResetExpenseReason("");
          }
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md", "data-ocid": "dialog-reset-expense", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Spesen zurücksetzen" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Der Status wird auf «Ausstehend» zurückgesetzt. Bitte geben Sie eine Begründung an." }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { htmlFor: "resetExpenseReason", children: [
                "Begründung ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Textarea,
                {
                  id: "resetExpenseReason",
                  placeholder: "Begründung für das Zurücksetzen…",
                  rows: 3,
                  value: resetExpenseReason,
                  onChange: (e) => setResetExpenseReason(e.target.value),
                  "data-ocid": "input-reset-expense-reason"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                type: "button",
                variant: "outline",
                onClick: () => {
                  setResetExpenseId(null);
                  setResetExpenseReason("");
                },
                children: "Abbrechen"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                type: "button",
                onClick: () => {
                  if (resetExpenseId !== null && resetExpenseReason.trim()) {
                    resetExpenseMutation.mutate({
                      id: resetExpenseId,
                      reason: resetExpenseReason
                    });
                  }
                },
                disabled: resetExpenseMutation.isPending || !resetExpenseReason.trim(),
                "data-ocid": "btn-confirm-reset-expense",
                children: resetExpenseMutation.isPending ? "Zurücksetzen…" : "Zurücksetzen bestätigen"
              }
            )
          ] })
        ] })
      }
    )
  ] }) });
}
export {
  GenehmigungsPage as default
};
