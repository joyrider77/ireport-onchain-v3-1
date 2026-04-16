import { a as useNavigate, e as useQueryClient, r as reactExports, j as jsxRuntimeExports, S as Skeleton } from "./index-CzAnGejr.js";
import { L as Layout, S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem, X, D as Dialog, g as DialogContent, h as DialogHeader, i as DialogTitle, k as DialogFooter } from "./Layout-B1HD-_-K.js";
import { B as Badge } from "./badge-CGQZCl2g.js";
import { B as Button } from "./button-De0KTRQr.js";
import { C as Card, a as CardContent } from "./card-RwdUJxIK.js";
import { L as Label, u as ue } from "./index-DYrEdX2e.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-QeoAc5uB.js";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-CbGp-Z-Q.js";
import { T as Textarea } from "./textarea-8LoX23cl.js";
import { a as useAuth } from "./useAuthStore-Ba33VUEX.js";
import { f as formatDateDE } from "./dateFormat-CjU5zGrG.js";
import { a as useActor, b as useQuery, c as createActor } from "./backend-BNIvB4__.js";
import { u as useMutation } from "./useMutation-DIWQ28Sn.js";
import { c as createLucideIcon } from "./createLucideIcon-B_8OnPXI.js";
import { i as Check } from "./users-BqWALrTR.js";
import { R as RotateCcw } from "./rotate-ccw-CAu1JDsU.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "m9 12 2 2 4-4", key: "dzmm74" }]
];
const CircleCheck = createLucideIcon("circle-check", __iconNode$1);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["rect", { width: "8", height: "4", x: "8", y: "2", rx: "1", ry: "1", key: "tgr4d6" }],
  [
    "path",
    {
      d: "M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2",
      key: "116196"
    }
  ],
  ["path", { d: "M12 11h4", key: "1jrz19" }],
  ["path", { d: "M12 16h4", key: "n85exb" }],
  ["path", { d: "M8 11h.01", key: "1dfujw" }],
  ["path", { d: "M8 16h.01", key: "18s6g9" }]
];
const ClipboardList = createLucideIcon("clipboard-list", __iconNode);
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
function GenehmigungsPage() {
  const navigate = useNavigate();
  const { isAuthenticated, companyId, role } = useAuth();
  const { actor, isFetching } = useActor(createActor);
  const queryClient = useQueryClient();
  const [absenceFilter, setAbsenceFilter] = reactExports.useState("submitted");
  const [expenseFilter, setExpenseFilter] = reactExports.useState("pending");
  const [rejectAbsenceId, setRejectAbsenceId] = reactExports.useState(null);
  const [rejectAbsenceComment, setRejectAbsenceComment] = reactExports.useState("");
  const [resetAbsenceId, setResetAbsenceId] = reactExports.useState(null);
  const [resetAbsenceReason, setResetAbsenceReason] = reactExports.useState("");
  const [rejectExpenseId, setRejectExpenseId] = reactExports.useState(null);
  const [rejectExpenseComment, setRejectExpenseComment] = reactExports.useState("");
  const [resetExpenseId, setResetExpenseId] = reactExports.useState(null);
  const [resetExpenseReason, setResetExpenseReason] = reactExports.useState("");
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
    (t) => t.name.toLowerCase() === "ferien" && t.requiresApproval
  ) ?? absenceTypes.find(
    (t) => t.requiresApproval && t.name.toLowerCase().includes("feri")
  ) ?? absenceTypes.find((t) => t.requiresApproval);
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
  const vacationAbsences = allAbsences.filter(
    (a) => vacationType && a.absenceTypeId === vacationType.id
  );
  const expenseQueryFilter = expenseFilter === "all" ? {} : { status: expenseFilter };
  const { data: allExpenses = [], isLoading: loadingExpenses } = useQuery({
    queryKey: ["allExpenses", expenseFilter],
    queryFn: async () => {
      if (!actor) return [];
      return await toAny(actor).listExpenses(expenseQueryFilter);
    },
    enabled,
    staleTime: 3e4
  });
  function getEmployeeName(id) {
    const emp = employees.find((e) => e.id === id);
    return emp ? `${emp.firstName} ${emp.lastName}` : String(id);
  }
  const approveAbsenceMutation = useMutation({
    mutationFn: async (id) => {
      if (!actor) throw new Error("Nicht verfügbar");
      const result = await toAny(actor).approveAbsence(id);
      if (result.__kind__ === "err") throw new Error(result.err);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allAbsences"] });
      ue.success("Ferienantrag genehmigt");
    },
    onError: (err) => ue.error(err.message)
  });
  const rejectAbsenceMutation = useMutation({
    mutationFn: async ({ id, comment }) => {
      if (!actor) throw new Error("Nicht verfügbar");
      const result = await toAny(actor).rejectAbsence(id, comment);
      if (result.__kind__ === "err") throw new Error(result.err);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allAbsences"] });
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
      if (result.__kind__ === "err") throw new Error(result.err);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allExpenses"] });
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
      if (result.__kind__ === "err") throw new Error(result.err);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allExpenses"] });
      ue.success("Spesen abgelehnt");
      setRejectExpenseId(null);
      setRejectExpenseComment("");
    },
    onError: (err) => ue.error(err.message)
  });
  const resetAbsenceMutation = useMutation({
    mutationFn: async ({ id, reason }) => {
      if (!actor) throw new Error("Nicht verfügbar");
      const result = await toAny(actor).resetAbsenceToAusstehend(
        id,
        reason
      );
      if (result.__kind__ === "err") throw new Error(result.err);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allAbsences"] });
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
      if (result.__kind__ === "err") throw new Error(result.err);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allExpenses"] });
      ue.success("Spesen auf «Ausstehend» zurückgesetzt");
      setResetExpenseId(null);
      setResetExpenseReason("");
    },
    onError: (err) => {
      ue.error(err.message);
      setResetExpenseId(null);
    }
  });
  if (role !== "admin" && role !== "manager") return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Layout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 space-y-6", "data-ocid": "genehmigungen-page", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-display font-bold text-foreground", children: "Genehmigungen" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-0.5", children: "Ferienanträge und Spesen prüfen und genehmigen" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "ferien", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "ferien", "data-ocid": "tab-ferien-genehmigung", children: "Ferienanträge" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "spesen", "data-ocid": "tab-spesen-genehmigung", children: "Spesen" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "ferien", className: "mt-4 space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Ferienanträge aller Mitarbeitenden" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
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
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "spesen", className: "mt-4 space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Spesenbelege aller Mitarbeitenden" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
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
      ] })
    ] }),
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
