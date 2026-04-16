import { r as reactExports, j as jsxRuntimeExports, S as Skeleton } from "./index-CzAnGejr.js";
import { B as Badge } from "./badge-CGQZCl2g.js";
import { B as Button } from "./button-De0KTRQr.js";
import { C as Card, a as CardContent, b as CardHeader, c as CardTitle } from "./card-RwdUJxIK.js";
import { L as Label, I as Input } from "./index-DYrEdX2e.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-QeoAc5uB.js";
import { a as useActor, b as useQuery, c as createActor } from "./backend-BNIvB4__.js";
import { L as Layout } from "./Layout-B1HD-_-K.js";
import { a as useAuth } from "./useAuthStore-Ba33VUEX.js";
import { F as FileText } from "./users-BqWALrTR.js";
import { C as CircleAlert } from "./circle-alert-DmvPqxF4.js";
import { S as Search } from "./search-C__UoN_f.js";
import "./createLucideIcon-B_8OnPXI.js";
const toAny = (a) => a;
function getFirstDayOfMonth() {
  const d = /* @__PURE__ */ new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}
function getTodayString() {
  return (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
}
function formatDate(dateStr) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("de-CH");
}
function formatCHF(n) {
  return n.toLocaleString("de-CH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}
function buildGroups(timeEntries, expenses, projects, customers) {
  const projMap = new Map(projects.map((p) => [String(p.id), p]));
  const custMap = new Map(customers.map((c) => [String(c.id), c]));
  const groupMap = /* @__PURE__ */ new Map();
  for (const t of timeEntries.filter((te) => te.billable)) {
    const p = projMap.get(String(t.projectId));
    if (!p) continue;
    const c = custMap.get(String(p.customerId));
    const key = `${String(p.customerId)}_${String(t.projectId)}`;
    if (!groupMap.has(key)) {
      groupMap.set(key, {
        customerId: p.customerId,
        customerName: (c == null ? void 0 : c.name) ?? String(p.customerId),
        projectId: t.projectId,
        projectName: p.name,
        hours: 0,
        billableRate: p.billableRate,
        amountCHF: 0,
        expensesCHF: 0,
        totalCHF: 0
      });
    }
    const g = groupMap.get(key);
    g.hours += t.hours;
    g.amountCHF = g.hours * g.billableRate;
  }
  for (const e of expenses.filter((ex) => ex.billableCHF > 0)) {
    const t = timeEntries.find((te) => te.employeeId === e.employeeId);
    if (!t) continue;
    const p = projMap.get(String(t.projectId));
    if (!p) continue;
    const c = custMap.get(String(p.customerId));
    const key = `${String(p.customerId)}_${String(t.projectId)}`;
    if (!groupMap.has(key)) {
      groupMap.set(key, {
        customerId: p.customerId,
        customerName: (c == null ? void 0 : c.name) ?? String(p.customerId),
        projectId: t.projectId,
        projectName: p.name,
        hours: 0,
        billableRate: p.billableRate,
        amountCHF: 0,
        expensesCHF: 0,
        totalCHF: 0
      });
    }
    groupMap.get(key).expensesCHF += e.billableCHF;
  }
  for (const g of groupMap.values()) {
    g.totalCHF = g.amountCHF + g.expensesCHF;
  }
  return Array.from(groupMap.values()).sort(
    (a, b) => a.customerName.localeCompare(b.customerName, "de")
  );
}
function FakturierungPage() {
  const { actor, isFetching: actorFetching } = useActor(createActor);
  const { isAuthenticated, companyId } = useAuth();
  const [dateFrom, setDateFrom] = reactExports.useState(getFirstDayOfMonth());
  const [dateTo, setDateTo] = reactExports.useState(getTodayString());
  const [selectedCustomer, setSelectedCustomer] = reactExports.useState("");
  const [selectedProject, setSelectedProject] = reactExports.useState("");
  const [reportActive, setReportActive] = reactExports.useState(false);
  const [queryKey, setQueryKey] = reactExports.useState(0);
  const { data: projects = [] } = useQuery({
    queryKey: ["projects", companyId],
    queryFn: async () => {
      if (!actor) return [];
      return await toAny(actor).listProjects();
    },
    enabled: !!actor && !actorFetching && isAuthenticated
  });
  const { data: customers = [] } = useQuery({
    queryKey: ["customers", companyId],
    queryFn: async () => {
      if (!actor) return [];
      return await toAny(actor).listCustomers();
    },
    enabled: !!actor && !actorFetching && isAuthenticated
  });
  const { data: serviceTypes = [] } = useQuery({
    queryKey: ["serviceTypes", companyId],
    queryFn: async () => {
      if (!actor) return [];
      return await toAny(actor).listServiceTypes();
    },
    enabled: !!actor && !actorFetching && isAuthenticated
  });
  const { data: expenseTypes = [] } = useQuery({
    queryKey: ["expenseTypes", companyId],
    queryFn: async () => {
      if (!actor) return [];
      return await toAny(actor).listExpenseTypes();
    },
    enabled: !!actor && !actorFetching && isAuthenticated
  });
  const {
    data: reportData,
    isLoading,
    isFetching
  } = useQuery({
    queryKey: [
      "fakturierungReport",
      queryKey,
      dateFrom,
      dateTo,
      selectedCustomer,
      selectedProject
    ],
    queryFn: async () => {
      if (!actor) return null;
      const filter = { dateFrom, dateTo };
      if (selectedCustomer) filter.customerId = BigInt(selectedCustomer);
      if (selectedProject) filter.projectId = BigInt(selectedProject);
      return await toAny(actor).getReportData(filter);
    },
    enabled: !!actor && !actorFetching && isAuthenticated && reportActive,
    staleTime: 0
  });
  const handleLoad = () => {
    setReportActive(true);
    setQueryKey((k) => k + 1);
  };
  const timeEntries = (reportData == null ? void 0 : reportData.entries) ?? [];
  const expenseItems = (reportData == null ? void 0 : reportData.expenseItems) ?? [];
  const billableExpenses = expenseItems.filter((e) => e.billableCHF > 0);
  const filteredProjects = selectedCustomer ? projects.filter((p) => String(p.customerId) === selectedCustomer) : projects;
  const groups = buildGroups(timeEntries, expenseItems, projects, customers);
  const grandTotalHours = groups.reduce((s, g) => s + g.hours, 0);
  const grandTotalAmount = groups.reduce((s, g) => s + g.amountCHF, 0);
  const grandTotalExpenses = groups.reduce((s, g) => s + g.expensesCHF, 0);
  const grandTotal = groups.reduce((s, g) => s + g.totalCHF, 0);
  const expTypeName = (id) => {
    var _a;
    return ((_a = expenseTypes.find((x) => x.id === id)) == null ? void 0 : _a.name) ?? "-";
  };
  const projName = (id) => {
    var _a;
    return ((_a = projects.find((x) => x.id === id)) == null ? void 0 : _a.name) ?? String(id);
  };
  const isLoadingReport = isLoading || isFetching;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Layout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 space-y-6 max-w-7xl mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-5 h-5 text-primary" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-display font-semibold text-foreground", children: "Fakturierung" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Verrechenbare Leistungen und Spesen im Überblick" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        "data-ocid": "pdf-info-banner",
        className: "flex items-start gap-3 p-4 rounded-lg border border-primary/20 bg-primary/5",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-5 h-5 text-primary flex-shrink-0 mt-0.5" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-foreground", children: "PDF-Rechnungserstellung ist in Vorbereitung und wird in einer zukünftigen Version verfügbar sein." })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "shadow-card", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "pt-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "dateFromF", children: "Datum von" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "dateFromF",
              "data-ocid": "filter-date-from",
              type: "date",
              value: dateFrom,
              onChange: (e) => setDateFrom(e.target.value)
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "dateToF", children: "Datum bis" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "dateToF",
              "data-ocid": "filter-date-to",
              type: "date",
              value: dateTo,
              onChange: (e) => setDateTo(e.target.value)
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "filterCustomer", children: "Kunde" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              id: "filterCustomer",
              "data-ocid": "filter-customer",
              value: selectedCustomer,
              onChange: (e) => {
                setSelectedCustomer(e.target.value);
                setSelectedProject("");
              },
              className: "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Alle Kunden" }),
                customers.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: String(c.id), children: c.name }, String(c.id)))
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "filterProjectF", children: "Projekt" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              id: "filterProjectF",
              "data-ocid": "filter-project",
              value: selectedProject,
              onChange: (e) => setSelectedProject(e.target.value),
              className: "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Alle Projekte" }),
                filteredProjects.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: String(p.id), children: p.name }, String(p.id)))
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          type: "button",
          "data-ocid": "btn-load-invoicing",
          onClick: handleLoad,
          className: "gap-2",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "w-4 h-4" }),
            "Auswertung laden"
          ]
        }
      ) })
    ] }) }),
    isLoadingReport && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-64 w-full" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-40 w-full" })
    ] }),
    !isLoadingReport && reportActive && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "shadow-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base font-semibold", children: "Verrechenbare Leistungen" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", children: [
            groups.length,
            " Positionen"
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: groups.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center py-12 text-muted-foreground gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-8 h-8 opacity-40" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "Keine verrechenbaren Leistungen für diesen Zeitraum" })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "bg-muted/40", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Kunde" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Projekt" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Stunden" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Stundensatz CHF" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Betrag CHF" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Spesen CHF" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Gesamt CHF" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
            groups.map((g) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              TableRow,
              {
                "data-ocid": `billing-row-${String(g.projectId)}`,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium", children: g.customerName }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: g.projectName }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right tabular-nums", children: g.hours.toFixed(2) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right tabular-nums", children: formatCHF(g.billableRate) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right tabular-nums", children: formatCHF(g.amountCHF) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right tabular-nums", children: formatCHF(g.expensesCHF) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right tabular-nums font-semibold text-primary", children: formatCHF(g.totalCHF) })
                ]
              },
              `${String(g.customerId)}_${String(g.projectId)}`
            )),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "bg-muted/50 border-t-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 2, className: "font-semibold", children: "Gesamt" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right tabular-nums font-semibold", children: grandTotalHours.toFixed(2) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, {}),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right tabular-nums font-semibold", children: formatCHF(grandTotalAmount) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right tabular-nums font-semibold", children: formatCHF(grandTotalExpenses) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right tabular-nums font-bold text-primary", children: formatCHF(grandTotal) })
            ] })
          ] })
        ] }) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "shadow-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base font-semibold", children: "Verrechenbare Spesen" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", children: [
            billableExpenses.length,
            " Einträge"
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: billableExpenses.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center py-12 text-muted-foreground gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-8 h-8 opacity-40" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "Keine verrechenbaren Spesen für diesen Zeitraum" })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "bg-muted/40", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Spesenart" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Projekt" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Datum" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Beschreibung" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Verrechenbar CHF" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
            billableExpenses.map((e) => {
              const t = timeEntries.find(
                (te) => te.employeeId === e.employeeId
              );
              return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                TableRow,
                {
                  "data-ocid": `billable-expense-row-${String(e.id)}`,
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: expTypeName(e.expenseTypeId) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: t ? projName(t.projectId) : "-" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: formatDate(e.date) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "max-w-[200px] truncate text-muted-foreground", children: e.description || "-" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right tabular-nums font-medium", children: formatCHF(e.billableCHF) })
                  ]
                },
                String(e.id)
              );
            }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "bg-muted/50 border-t-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 4, className: "font-semibold", children: "Gesamt Spesen" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right tabular-nums font-bold text-primary", children: formatCHF(
                billableExpenses.reduce(
                  (s, e) => s + e.billableCHF,
                  0
                )
              ) })
            ] })
          ] })
        ] }) }) })
      ] })
    ] }),
    !isLoadingReport && !reportActive && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center py-16 text-muted-foreground gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16 h-16 rounded-full bg-muted/60 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-8 h-8 opacity-50" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: "Filter setzen und «Auswertung laden» klicken" })
    ] })
  ] }) });
}
export {
  FakturierungPage as default
};
