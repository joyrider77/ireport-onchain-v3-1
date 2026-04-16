import { a as useNavigate, e as useQueryClient, r as reactExports, j as jsxRuntimeExports, S as Skeleton } from "./index-CzAnGejr.js";
import { P as Pencil, T as Trash2, D as DeleteConfirmDialog } from "./DeleteConfirmDialog-BE0ulj3u.js";
import { L as Layout, D as Dialog, g as DialogContent, h as DialogHeader, i as DialogTitle, S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem, k as DialogFooter, j as Checkbox } from "./Layout-B1HD-_-K.js";
import { B as Badge } from "./badge-CGQZCl2g.js";
import { B as Button } from "./button-De0KTRQr.js";
import { C as Card, a as CardContent } from "./card-RwdUJxIK.js";
import { L as Label, I as Input, u as ue } from "./index-DYrEdX2e.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-QeoAc5uB.js";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-CbGp-Z-Q.js";
import { T as Textarea } from "./textarea-8LoX23cl.js";
import { a as useAuth } from "./useAuthStore-Ba33VUEX.js";
import { f as formatDateDE } from "./dateFormat-CjU5zGrG.js";
import { g as getActiveEmploymentForDate, a as getEmploymentMinutesForDate } from "./employmentUtils-C-5ZbofZ.js";
import { a as useActor, b as useQuery, c as createActor } from "./backend-BNIvB4__.js";
import { u as useMutation } from "./useMutation-DIWQ28Sn.js";
import { m as minutesToHhMm, h as hhmmToMinutes } from "./shared-hFaAQd4g.js";
import { C as CirclePlus } from "./circle-plus-Cu4xmKuu.js";
import { C as CalendarDays } from "./calendar-days-6u2POKbE.js";
import { I as Info } from "./info-0MSpMvZZ.js";
import "./createLucideIcon-B_8OnPXI.js";
import "./users-BqWALrTR.js";
const toAny = (a) => a;
function statusBadge(status) {
  if (status === "approved")
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-green-100 text-green-800 hover:bg-green-100", children: "Genehmigt" });
  if (status === "rejected")
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "destructive", children: "Abgelehnt" });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: "Ausstehend" });
}
function daysBetween(from, to) {
  const d1 = new Date(from);
  const d2 = new Date(to);
  const diff = Math.ceil((d2.getTime() - d1.getTime()) / 864e5) + 1;
  return Math.max(diff, 1);
}
function AbwesenheitPage() {
  const navigate = useNavigate();
  const { isAuthenticated, companyId, employeeId } = useAuth();
  const { actor, isFetching } = useActor(createActor);
  const queryClient = useQueryClient();
  const [showAbsenceDialog, setShowAbsenceDialog] = reactExports.useState(false);
  const [showVacationDialog, setShowVacationDialog] = reactExports.useState(false);
  const [editAbsence, setEditAbsence] = reactExports.useState(null);
  const [editVacation, setEditVacation] = reactExports.useState(null);
  const [absenceForm, setAbsenceForm] = reactExports.useState({
    absenceTypeId: "",
    dateFrom: "",
    dateTo: "",
    description: ""
  });
  const [vacationForm, setVacationForm] = reactExports.useState({
    dateFrom: "",
    dateTo: "",
    description: "",
    ganztaetig: true,
    dauerInput: ""
  });
  const [errors, setErrors] = reactExports.useState({});
  const [deleteConfirmId, setDeleteConfirmId] = reactExports.useState(null);
  reactExports.useEffect(() => {
    if (!isAuthenticated || !companyId) navigate({ to: "/" });
  }, [isAuthenticated, companyId, navigate]);
  const enabled = !!actor && !isFetching && isAuthenticated;
  const { data: absenceTypes = [], isLoading: loadingTypes } = useQuery({
    queryKey: ["absenceTypes"],
    queryFn: async () => {
      if (!actor) return [];
      return await toAny(actor).listAbsenceTypes();
    },
    enabled,
    staleTime: 6e4
  });
  const { data: employments = [] } = useQuery({
    queryKey: ["myEmployments", employeeId],
    queryFn: async () => {
      if (!actor || !employeeId) return [];
      const res = await toAny(actor).listEmployments(BigInt(employeeId));
      const r = res;
      return r.__kind__ === "ok" ? r.ok ?? [] : [];
    },
    enabled: enabled && !!employeeId,
    staleTime: 6e4
  });
  const isSingleDay = vacationForm.dateFrom && vacationForm.dateTo && vacationForm.dateFrom === vacationForm.dateTo;
  const ganztaetigPreviewMinutes = (() => {
    if (!vacationForm.ganztaetig || !isSingleDay) return null;
    const emp = getActiveEmploymentForDate(employments, vacationForm.dateFrom);
    if (!emp) return null;
    return getEmploymentMinutesForDate(emp, vacationForm.dateFrom);
  })();
  const vacationType = absenceTypes.find(
    (t) => t.name.toLowerCase() === "ferien" && t.requiresApproval
  ) ?? absenceTypes.find(
    (t) => t.requiresApproval && t.name.toLowerCase().includes("feri")
  ) ?? absenceTypes.find((t) => t.requiresApproval);
  const nonVacationTypes = absenceTypes.filter(
    (t) => t.id !== (vacationType == null ? void 0 : vacationType.id) && t.aktiv
  );
  const { data: myAbsences = [], isLoading: loadingAbsences } = useQuery({
    queryKey: ["myAbsences"],
    queryFn: async () => {
      if (!actor) return [];
      const filter = {};
      return await toAny(actor).listAbsences(filter);
    },
    enabled,
    staleTime: 3e4
  });
  const regularAbsences = myAbsences.filter(
    (a) => !vacationType || a.absenceTypeId !== vacationType.id
  );
  const vacationAbsences = myAbsences.filter(
    (a) => vacationType && a.absenceTypeId === vacationType.id
  );
  const createMutation = useMutation({
    mutationFn: async (input) => {
      if (!actor) throw new Error("Nicht verfügbar");
      const result = await toAny(actor).createAbsence(input);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myAbsences"] });
      ue.success("Abwesenheit erfasst");
      setShowAbsenceDialog(false);
      setShowVacationDialog(false);
      resetForms();
    },
    onError: (err) => ue.error(err.message)
  });
  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      input
    }) => {
      if (!actor) throw new Error("Nicht verfügbar");
      const result = await toAny(actor).updateAbsence(id, input);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myAbsences"] });
      ue.success("Erfolgreich gespeichert");
      setShowAbsenceDialog(false);
      setShowVacationDialog(false);
      setEditAbsence(null);
      setEditVacation(null);
      resetForms();
    },
    onError: (err) => ue.error(err.message)
  });
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      if (!actor) throw new Error("Nicht verfügbar");
      const result = await toAny(actor).deleteAbsence(id);
      if (result.__kind__ === "err") throw new Error(result.err);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myAbsences"] });
      ue.success("Abwesenheit gelöscht");
    },
    onError: (err) => ue.error(err.message)
  });
  function resetForms() {
    setAbsenceForm({
      absenceTypeId: "",
      dateFrom: "",
      dateTo: "",
      description: ""
    });
    setVacationForm({
      dateFrom: "",
      dateTo: "",
      description: "",
      ganztaetig: true,
      dauerInput: ""
    });
    setErrors({});
    setEditAbsence(null);
    setEditVacation(null);
  }
  function openEditAbsence(absence) {
    setEditAbsence(absence);
    setAbsenceForm({
      absenceTypeId: String(absence.absenceTypeId),
      dateFrom: absence.dateFrom,
      dateTo: absence.dateTo,
      description: absence.description ?? ""
    });
    setShowAbsenceDialog(true);
  }
  function openEditVacation(absence) {
    setEditVacation(absence);
    setVacationForm({
      dateFrom: absence.dateFrom,
      dateTo: absence.dateTo,
      description: absence.description ?? "",
      ganztaetig: absence.ganztaetig,
      dauerInput: absence.ganztaetig ? "" : minutesToHhMm(Number(absence.dauer))
    });
    setShowVacationDialog(true);
  }
  function validateAbsenceForm() {
    const e = {};
    if (!absenceForm.absenceTypeId)
      e.absenceTypeId = "Bitte Abwesenheitsart wählen";
    if (!absenceForm.dateFrom) e.dateFrom = "Datum von ist erforderlich";
    if (!absenceForm.dateTo) e.dateTo = "Datum bis ist erforderlich";
    if (absenceForm.dateFrom && absenceForm.dateTo && absenceForm.dateTo < absenceForm.dateFrom)
      e.dateTo = "Datum bis muss nach Datum von liegen";
    setErrors(e);
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
    setErrors(e);
    return Object.keys(e).length === 0;
  }
  function submitAbsence() {
    var _a;
    if (!validateAbsenceForm()) return;
    const typeId = (_a = absenceTypes.find(
      (t) => String(t.id) === absenceForm.absenceTypeId
    )) == null ? void 0 : _a.id;
    if (!typeId) return;
    const isMultiDay = absenceForm.dateFrom !== absenceForm.dateTo;
    const dauer = BigInt(0);
    if (editAbsence) {
      updateMutation.mutate({
        id: editAbsence.id,
        input: {
          dateFrom: absenceForm.dateFrom,
          dateTo: absenceForm.dateTo,
          ganztaetig: isMultiDay,
          dauer,
          description: absenceForm.description || void 0
        }
      });
    } else {
      createMutation.mutate({
        absenceTypeId: typeId,
        dateFrom: absenceForm.dateFrom,
        dateTo: absenceForm.dateTo,
        ganztaetig: isMultiDay,
        dauer,
        description: absenceForm.description || void 0
      });
    }
  }
  function submitVacation() {
    if (!validateVacationForm()) return;
    if (!vacationType) {
      ue.error("Keine Ferienabwesenheitsart konfiguriert");
      return;
    }
    const dauerMinutes = vacationForm.ganztaetig ? ganztaetigPreviewMinutes ?? 0 : hhmmToMinutes(vacationForm.dauerInput) ?? 0;
    if (editVacation) {
      updateMutation.mutate({
        id: editVacation.id,
        input: {
          dateFrom: vacationForm.dateFrom,
          dateTo: vacationForm.dateTo,
          ganztaetig: vacationForm.ganztaetig,
          dauer: BigInt(dauerMinutes),
          description: vacationForm.description || void 0
        }
      });
    } else {
      createMutation.mutate({
        absenceTypeId: vacationType.id,
        dateFrom: vacationForm.dateFrom,
        dateTo: vacationForm.dateTo,
        description: vacationForm.description || void 0,
        ganztaetig: vacationForm.ganztaetig,
        dauer: BigInt(dauerMinutes)
      });
    }
  }
  const canEdit = (a) => a.status === "submitted" || a.status === "pending";
  function getTypeName(id) {
    var _a;
    return ((_a = absenceTypes.find((t) => t.id === id)) == null ? void 0 : _a.name) ?? String(id);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Layout, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 space-y-6", "data-ocid": "abwesenheit-page", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-display font-bold text-foreground", children: "Abwesenheiten" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-0.5", children: "Abwesenheiten erfassen und Ferienanträge stellen" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "abwesenheiten", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "abwesenheiten", "data-ocid": "tab-abwesenheiten", children: "Abwesenheiten" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "ferien", "data-ocid": "tab-ferien", children: "Ferienantrag" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "abwesenheiten", className: "mt-4 space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Alle eigenen Abwesenheiten (ohne Ferien)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                type: "button",
                onClick: () => {
                  resetForms();
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
          /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "shadow-card", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: loadingAbsences || loadingTypes ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 space-y-3", children: [1, 2, 3].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-10 w-full" }, i)) }) : regularAbsences.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
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
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end gap-1", children: canEdit(a) && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Button,
                      {
                        type: "button",
                        variant: "ghost",
                        size: "icon",
                        onClick: () => openEditAbsence(a),
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
                        onClick: () => setDeleteConfirmId(a.id),
                        "data-ocid": `btn-delete-absence-${a.id}`,
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-4 h-4" })
                      }
                    )
                  ] }) }) })
                ]
              },
              String(a.id)
            )) })
          ] }) }) }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "ferien", className: "mt-4 space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Ferienanträge einreichen und Status verfolgen" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                type: "button",
                onClick: () => {
                  resetForms();
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
          /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "shadow-card", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: loadingAbsences ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 space-y-3", children: [1, 2, 3].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-10 w-full" }, i)) }) : vacationAbsences.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
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
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end gap-1", children: canEdit(a) && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Button,
                      {
                        type: "button",
                        variant: "ghost",
                        size: "icon",
                        onClick: () => openEditVacation(a),
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
                        onClick: () => setDeleteConfirmId(a.id),
                        "aria-label": "Antrag zurückziehen",
                        "data-ocid": `btn-delete-vacation-${a.id}`,
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-4 h-4" })
                      }
                    )
                  ] }) }) })
                ]
              },
              String(a.id)
            )) })
          ] }) }) }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Dialog,
        {
          open: showAbsenceDialog,
          onOpenChange: (open) => {
            if (!open) {
              setShowAbsenceDialog(false);
              resetForms();
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
                errors.absenceTypeId && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-destructive", children: errors.absenceTypeId })
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
                      onChange: (e) => setAbsenceForm((f) => ({
                        ...f,
                        dateFrom: e.target.value
                      })),
                      "data-ocid": "input-abs-date-from"
                    }
                  ),
                  errors.dateFrom && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-destructive", children: errors.dateFrom })
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
                  errors.dateTo && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-destructive", children: errors.dateTo })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "absDescription", children: "Beschreibung" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Textarea,
                  {
                    id: "absDescription",
                    placeholder: "Optionale Beschreibung…",
                    rows: 3,
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
            /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  type: "button",
                  variant: "outline",
                  onClick: () => {
                    setShowAbsenceDialog(false);
                    resetForms();
                  },
                  children: "Abbrechen"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  type: "button",
                  onClick: submitAbsence,
                  disabled: createMutation.isPending || updateMutation.isPending,
                  "data-ocid": "btn-submit-abwesenheit",
                  children: createMutation.isPending || updateMutation.isPending ? "Speichern…" : editAbsence ? "Aktualisieren" : "Erfassen"
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
              resetForms();
            }
          },
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md", "data-ocid": "dialog-ferienantrag", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editVacation ? "Ferienantrag bearbeiten" : "Ferienantrag stellen" }) }),
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
                        dateFrom: e.target.value
                      })),
                      "data-ocid": "input-vac-date-from"
                    }
                  ),
                  errors.dateFrom && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-destructive", children: errors.dateFrom })
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
                      "data-ocid": "input-vac-date-to"
                    }
                  ),
                  errors.dateTo && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-destructive", children: errors.dateTo })
                ] })
              ] }),
              vacationForm.dateFrom && vacationForm.dateTo && vacationForm.dateTo >= vacationForm.dateFrom && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
                "Anzahl Tage:",
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground", children: daysBetween(vacationForm.dateFrom, vacationForm.dateTo) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  className: "flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30",
                  "data-ocid": "ganztaetig-section",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Checkbox,
                      {
                        id: "ganztaetig",
                        checked: vacationForm.ganztaetig,
                        onCheckedChange: (checked) => setVacationForm((f) => ({
                          ...f,
                          ganztaetig: checked === true
                        })),
                        className: "data-[state=checked]:bg-[#006066] data-[state=checked]:border-[#006066]",
                        "data-ocid": "checkbox-ganztaetig"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Label,
                      {
                        htmlFor: "ganztaetig",
                        className: "cursor-pointer font-medium text-sm",
                        children: "Ganztägig"
                      }
                    )
                  ]
                }
              ),
              !vacationForm.ganztaetig && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "vacDauer", children: "Dauer (hh:mm) *" }),
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
                    "data-ocid": "input-vac-dauer"
                  }
                ),
                errors.dauerInput && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-destructive", children: errors.dauerInput })
              ] }),
              vacationForm.ganztaetig && vacationForm.dateFrom && vacationForm.dateTo && vacationForm.dateTo >= vacationForm.dateFrom && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "w-4 h-4 text-primary mt-0.5 flex-shrink-0" }),
                isSingleDay && ganztaetigPreviewMinutes !== null ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-foreground", children: [
                  "Dauer:",
                  " ",
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold text-primary", children: [
                    minutesToHhMm(ganztaetigPreviewMinutes),
                    " Stunden"
                  ] }),
                  " ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "(aus Beschäftigung)" })
                ] }) : isSingleDay ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Dauer wird aus der Beschäftigung für diesen Wochentag übernommen." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Stunden werden aus der Beschäftigung je Wochentag übernommen." })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "vacDescription", children: "Begründung" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Textarea,
                  {
                    id: "vacDescription",
                    placeholder: "Optionale Begründung…",
                    rows: 3,
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
            /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  type: "button",
                  variant: "outline",
                  onClick: () => {
                    setShowVacationDialog(false);
                    resetForms();
                  },
                  children: "Abbrechen"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  type: "button",
                  onClick: submitVacation,
                  disabled: createMutation.isPending || updateMutation.isPending,
                  "data-ocid": "btn-submit-ferienantrag",
                  children: createMutation.isPending || updateMutation.isPending ? "Speichern…" : editVacation ? "Aktualisieren" : "Einreichen"
                }
              )
            ] })
          ] })
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      DeleteConfirmDialog,
      {
        open: !!deleteConfirmId,
        onConfirm: () => {
          if (deleteConfirmId !== null) {
            deleteMutation.mutate(deleteConfirmId);
          }
          setDeleteConfirmId(null);
        },
        onCancel: () => setDeleteConfirmId(null),
        isDeleting: deleteMutation.isPending
      }
    )
  ] });
}
export {
  AbwesenheitPage as default
};
