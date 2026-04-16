import { r as reactExports, j as jsxRuntimeExports, S as Skeleton } from "./index-CzAnGejr.js";
import { B as Badge } from "./badge-CGQZCl2g.js";
import { B as Button } from "./button-De0KTRQr.js";
import { C as Card, a as CardContent, b as CardHeader, c as CardTitle } from "./card-RwdUJxIK.js";
import { L as Label, I as Input } from "./index-DYrEdX2e.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-QeoAc5uB.js";
import { L as Layout, C as ChartNoAxesColumn, e as formatHours } from "./Layout-B1HD-_-K.js";
import { a as useActor, b as useQuery, c as createActor } from "./backend-BNIvB4__.js";
import { a as useAuth } from "./useAuthStore-Ba33VUEX.js";
import { D as Download } from "./download-Bujl23aH.js";
import { S as Search } from "./search-C__UoN_f.js";
import "./users-BqWALrTR.js";
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
function exportToCSV(timeRows, expenseRows, employees, projects, serviceTypes, expenseTypes) {
  const empName = (id) => {
    const e = employees.find((x) => x.id === id);
    return e ? `${e.firstName} ${e.lastName}` : String(id);
  };
  const projName = (id) => {
    var _a;
    return ((_a = projects.find((x) => x.id === id)) == null ? void 0 : _a.name) ?? String(id);
  };
  const svcName = (id) => {
    var _a;
    return ((_a = serviceTypes.find((x) => x.id === id)) == null ? void 0 : _a.name) ?? String(id);
  };
  const etName = (id) => {
    var _a;
    return ((_a = expenseTypes.find((x) => x.id === id)) == null ? void 0 : _a.name) ?? String(id);
  };
  const timeHeader = "Mitarbeiter,Projekt,Datum,Stunden,Leistungsart,Verrechenbar";
  const timeLines = timeRows.map(
    (t) => [
      empName(t.employeeId),
      projName(t.projectId),
      t.date,
      formatHours(t.hours),
      svcName(t.serviceTypeId),
      t.billable ? "Ja" : "Nein"
    ].join(",")
  );
  const expHeader = "Mitarbeiter,Spesenart,Datum,Verrechenbar CHF,Rückerstattung CHF";
  const expLines = expenseRows.map(
    (e) => [
      empName(e.employeeId),
      etName(e.expenseTypeId),
      e.date,
      e.billableCHF,
      e.reimbursementCHF
    ].join(",")
  );
  const csv = [timeHeader, ...timeLines, "", expHeader, ...expLines].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `auswertung_${getTodayString()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
function AuswertungenPage() {
  const { actor, isFetching: actorFetching } = useActor(createActor);
  const { isAuthenticated, companyId, role } = useAuth();
  const isAdminOrManager = role === "admin" || role === "manager";
  const [dateFrom, setDateFrom] = reactExports.useState(getFirstDayOfMonth());
  const [dateTo, setDateTo] = reactExports.useState(getTodayString());
  const [selectedEmployee, setSelectedEmployee] = reactExports.useState("");
  const [selectedProject, setSelectedProject] = reactExports.useState("");
  const [reportActive, setReportActive] = reactExports.useState(false);
  const [queryKey, setQueryKey] = reactExports.useState(0);
  const { data: employees = [] } = useQuery({
    queryKey: ["employees", companyId],
    queryFn: async () => {
      if (!actor) return [];
      return await toAny(actor).listEmployees();
    },
    enabled: !!actor && !actorFetching && isAuthenticated && isAdminOrManager
  });
  const { data: projects = [] } = useQuery({
    queryKey: ["projects", companyId],
    queryFn: async () => {
      if (!actor) return [];
      return await toAny(actor).listProjects();
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
      "reportData",
      queryKey,
      dateFrom,
      dateTo,
      selectedEmployee,
      selectedProject
    ],
    queryFn: async () => {
      if (!actor) return null;
      const filter = { dateFrom, dateTo };
      if (selectedEmployee) filter.employeeId = BigInt(selectedEmployee);
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
  const totalHours = timeEntries.reduce((s, t) => s + t.hours, 0);
  const totalBillableHours = timeEntries.filter((t) => t.billable).reduce((s, t) => s + t.hours, 0);
  const totalExpBillable = expenseItems.reduce((s, e) => s + e.billableCHF, 0);
  const totalExpReimbursable = expenseItems.reduce(
    (s, e) => s + e.reimbursementCHF,
    0
  );
  const empName = (id) => {
    const e = employees.find((x) => x.id === id);
    return e ? `${e.firstName} ${e.lastName}` : String(id);
  };
  const projName = (id) => {
    var _a;
    return ((_a = projects.find((x) => x.id === id)) == null ? void 0 : _a.name) ?? String(id);
  };
  const svcName = (id) => {
    var _a;
    return ((_a = serviceTypes.find((x) => x.id === id)) == null ? void 0 : _a.name) ?? "-";
  };
  const expTypeName = (id) => {
    var _a;
    return ((_a = expenseTypes.find((x) => x.id === id)) == null ? void 0 : _a.name) ?? "-";
  };
  const isLoadingReport = isLoading || isFetching;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Layout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 space-y-6 max-w-7xl mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChartNoAxesColumn, { className: "w-5 h-5 text-primary" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-display font-semibold text-foreground", children: "Auswertungen" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Zeiten und Spesen auswerten und exportieren" })
        ] })
      ] }),
      reportActive && (timeEntries.length > 0 || expenseItems.length > 0) && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          type: "button",
          "data-ocid": "btn-csv-export",
          onClick: () => exportToCSV(
            timeEntries,
            expenseItems,
            employees,
            projects,
            serviceTypes,
            expenseTypes
          ),
          variant: "outline",
          className: "gap-2",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "w-4 h-4" }),
            "CSV exportieren"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "shadow-card", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "pt-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "dateFrom", children: "Datum von" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "dateFrom",
              "data-ocid": "filter-date-from",
              type: "date",
              value: dateFrom,
              onChange: (e) => setDateFrom(e.target.value)
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "dateTo", children: "Datum bis" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "dateTo",
              "data-ocid": "filter-date-to",
              type: "date",
              value: dateTo,
              onChange: (e) => setDateTo(e.target.value)
            }
          )
        ] }),
        isAdminOrManager && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "filterEmployee", children: "Mitarbeiter" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              id: "filterEmployee",
              "data-ocid": "filter-employee",
              value: selectedEmployee,
              onChange: (e) => setSelectedEmployee(e.target.value),
              className: "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Alle Mitarbeiter" }),
                employees.map((emp) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: String(emp.id), children: [
                  emp.firstName,
                  " ",
                  emp.lastName
                ] }, String(emp.id)))
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "filterProject", children: "Projekt" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              id: "filterProject",
              "data-ocid": "filter-project",
              value: selectedProject,
              onChange: (e) => setSelectedProject(e.target.value),
              className: "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Alle Projekte" }),
                projects.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: String(p.id), children: p.name }, String(p.id)))
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          type: "button",
          "data-ocid": "btn-load-report",
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
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-48 w-full" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-48 w-full" })
    ] }),
    !isLoadingReport && reportActive && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "shadow-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base font-semibold", children: "Zeitauswertung" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", children: [
            timeEntries.length,
            " Einträge"
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: timeEntries.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center py-12 text-muted-foreground gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChartNoAxesColumn, { className: "w-8 h-8 opacity-40" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "Keine Zeiteinträge für diesen Zeitraum" })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "bg-muted/40", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Mitarbeiter" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Projekt" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Datum" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Stunden" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Leistungsart" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Verrechenbar" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
            timeEntries.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              TableRow,
              {
                "data-ocid": `time-row-${String(t.id)}`,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium", children: empName(t.employeeId) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: projName(t.projectId) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: formatDate(t.date) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right tabular-nums", children: formatHours(t.hours) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: svcName(t.serviceTypeId) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Badge,
                    {
                      variant: t.billable ? "default" : "secondary",
                      children: t.billable ? "Ja" : "Nein"
                    }
                  ) })
                ]
              },
              String(t.id)
            )),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "bg-muted/50 border-t-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 3, className: "font-semibold", children: "Gesamt" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right tabular-nums font-semibold", children: formatHours(totalHours) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, {}),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
                formatHours(totalBillableHours),
                " verrechenbar"
              ] }) })
            ] })
          ] })
        ] }) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "shadow-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base font-semibold", children: "Spesenauswertung" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", children: [
            expenseItems.length,
            " Einträge"
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: expenseItems.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center py-12 text-muted-foreground gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChartNoAxesColumn, { className: "w-8 h-8 opacity-40" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "Keine Spesen für diesen Zeitraum" })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "bg-muted/40", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Mitarbeiter" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Spesenart" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Datum" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Verrechenbar CHF" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Rückerstattung CHF" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
            expenseItems.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              TableRow,
              {
                "data-ocid": `expense-row-${String(e.id)}`,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium", children: empName(e.employeeId) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: expTypeName(e.expenseTypeId) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: formatDate(e.date) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right tabular-nums", children: formatCHF(e.billableCHF) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right tabular-nums", children: formatCHF(e.reimbursementCHF) })
                ]
              },
              String(e.id)
            )),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "bg-muted/50 border-t-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 3, className: "font-semibold", children: "Gesamt" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right tabular-nums font-semibold", children: formatCHF(totalExpBillable) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right tabular-nums font-semibold", children: formatCHF(totalExpReimbursable) })
            ] })
          ] })
        ] }) }) })
      ] })
    ] }),
    !isLoadingReport && !reportActive && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center py-16 text-muted-foreground gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16 h-16 rounded-full bg-muted/60 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChartNoAxesColumn, { className: "w-8 h-8 opacity-50" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: "Filter setzen und «Auswertung laden» klicken" })
    ] })
  ] }) });
}
export {
  AuswertungenPage as default
};
