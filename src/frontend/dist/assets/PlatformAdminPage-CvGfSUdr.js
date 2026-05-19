import { j as jsxRuntimeExports, r as reactExports, S as Skeleton, d as useQueryClient, R as React } from "./index-Blf-A8DR.js";
import { B as Badge } from "./badge-BrNtKZcv.js";
import { B as Button } from "./button-DCGMFvti.js";
import { C as Card, b as CardHeader, c as CardTitle, a as CardContent } from "./card-CHW-R_CT.js";
import { q as useMutation, L as Layout, H as ShieldCheck, B as Building2, S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem, C as ChartNoAxesColumn, X, R as RefreshCw, D as Dialog, g as DialogContent, h as DialogHeader, i as DialogTitle, k as DialogFooter } from "./Layout-ClH0znk9.js";
import { L as Label, I as Input, u as ue } from "./index-CVvtv_EE.js";
import { S as Switch } from "./switch-w5TrVpW9.js";
import { T as Textarea } from "./textarea-1rE5PUZ-.js";
import { u as useActor, d as useQuery, c as createActor, b as useAuth } from "./useAuthStore-Cbv7GIMf.js";
import { A as ArrowLeft } from "./arrow-left-94BJxSRC.js";
import { D as Download } from "./download-D7N_keje.js";
import { c as createLucideIcon } from "./createLucideIcon-BzNCDVU7.js";
import { R as ReceiptText, P as PaymentStatusBadge } from "./PaymentStatusBadge-B0_N3hGw.js";
import { i as isUnlimited } from "./planUtils-CmuewgAl.js";
import { U as Users, C as ChevronDown, h as ChevronRight, i as Check } from "./users-DUrIKgtR.js";
import { C as CreditCard } from "./credit-card-Dor2YtG6.js";
import { P as Plus } from "./plus-DRvlFs_3.js";
import { P as Pencil } from "./pencil-CCCnid6t.js";
import { T as Trash2 } from "./trash-2-XtlFfpOd.js";
import { T as TriangleAlert } from "./triangle-alert-DaIOcezk.js";
import { C as Copy } from "./copy-xfnVt7hu.js";
import { E as EyeOff } from "./eye-off-DijXlJja.js";
import { E as Eye } from "./eye-C7GH0ldm.js";
import { S as Save } from "./save-Bo101srK.js";
import { C as CircleCheck } from "./circle-check-D0suFTwN.js";
import { C as CircleX } from "./circle-x-DBFfgxOH.js";
import { I as Info } from "./info-BiURhlsP.js";
import "./index-Dv8dTxpA.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$2 = [
  ["path", { d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z", key: "1rqfz7" }],
  ["path", { d: "M14 2v4a2 2 0 0 0 2 2h4", key: "tnqrlb" }],
  ["path", { d: "M8 13h2", key: "yr2amv" }],
  ["path", { d: "M14 13h2", key: "un5t4a" }],
  ["path", { d: "M8 17h2", key: "2yhykz" }],
  ["path", { d: "M14 17h2", key: "10kma7" }]
];
const FileSpreadsheet = createLucideIcon("file-spreadsheet", __iconNode$2);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  ["path", { d: "m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4", key: "g0fldk" }],
  ["path", { d: "m21 2-9.6 9.6", key: "1j0ho8" }],
  ["circle", { cx: "7.5", cy: "15.5", r: "5.5", key: "yqb3hr" }]
];
const Key = createLucideIcon("key", __iconNode$1);
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
      d: "M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z",
      key: "1xq2db"
    }
  ]
];
const Zap = createLucideIcon("zap", __iconNode);
function icpNsToDate(ns) {
  return new Date(Number(ns / 1000000n));
}
function monthStart(d) {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}
function monthEnd(d) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}
function daysBetweenInclusive(from, to) {
  const msPerDay = 864e5;
  const a = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const b = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.max(0, Math.round((b.getTime() - a.getTime()) / msPerDay) + 1);
}
function getMonthsInRange(fromDate, toDate) {
  const months = [];
  const cursor = monthStart(fromDate);
  const end = monthStart(toDate);
  while (cursor <= end) {
    months.push(new Date(cursor));
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return months;
}
function formatMonthLabel(date) {
  const MONTHS_SHORT = [
    "Jan.",
    "Feb.",
    "Mär.",
    "Apr.",
    "Mai.",
    "Jun.",
    "Jul.",
    "Aug.",
    "Sep.",
    "Okt.",
    "Nov.",
    "Dez."
  ];
  const twoDigitYear = String(date.getFullYear()).slice(-2);
  return `${MONTHS_SHORT[date.getMonth()]} ${twoDigitYear}`;
}
function calculateActiveDaysInMonth(employee, month, periodStart, periodEnd) {
  const mStart = monthStart(month);
  const mEnd = monthEnd(month);
  const activatedAt = employee.activatedAt ? icpNsToDate(employee.activatedAt) : /* @__PURE__ */ new Date(0);
  const deactivatedAt = employee.deactivatedAt ? icpNsToDate(employee.deactivatedAt) : /* @__PURE__ */ new Date(864e13);
  const windowStart = new Date(
    Math.max(mStart.getTime(), periodStart.getTime(), activatedAt.getTime())
  );
  const windowEnd = new Date(
    Math.min(mEnd.getTime(), periodEnd.getTime(), deactivatedAt.getTime())
  );
  if (windowEnd < windowStart) return 0;
  return daysBetweenInclusive(windowStart, windowEnd);
}
function isLicenseMonth(activeDays, kulanzDays) {
  return activeDays > kulanzDays;
}
function calculateBilling(employees, periodStart, periodEnd, kulanzDays) {
  const months = getMonthsInRange(periodStart, periodEnd);
  const employeeResults = employees.map((employee) => {
    const monthResults = months.map((month) => {
      const activeDays = calculateActiveDaysInMonth(
        employee,
        month,
        periodStart,
        periodEnd
      );
      return {
        month,
        activeDays,
        isLicenseMonth: isLicenseMonth(activeDays, kulanzDays)
      };
    });
    const licenseMonths = monthResults.filter((r) => r.isLicenseMonth).length;
    return { employee, monthResults, licenseMonths };
  }).filter((r) => r.monthResults.some((m) => m.activeDays > 0));
  const totalPerMonth = months.map(
    (_, i) => employeeResults.filter((r) => {
      var _a;
      return (_a = r.monthResults[i]) == null ? void 0 : _a.isLicenseMonth;
    }).length
  );
  const totalLicenses = employeeResults.reduce(
    (s, r) => s + r.licenseMonths,
    0
  );
  return { employeeResults, months, totalPerMonth, totalLicenses };
}
function csvCell(value) {
  const s = String(value);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}
function csvRow(cells) {
  return cells.map(csvCell).join(",");
}
function formatDateDE$1(date) {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}
function exportToCSV(tenantName, fromDate, toDate, kulanzDays, result) {
  const monthLabels = result.months.map(formatMonthLabel);
  const rows = [];
  rows.push(csvRow(["Mandant", tenantName]));
  rows.push(csvRow(["Zeitraum von", formatDateDE$1(fromDate)]));
  rows.push(csvRow(["Zeitraum bis", formatDateDE$1(toDate)]));
  rows.push(csvRow(["Kulanz (Tage)", kulanzDays]));
  rows.push("");
  rows.push(csvRow(["Mitarbeiter", ...monthLabels, "Lizenzen"]));
  for (const er of result.employeeResults) {
    const name = `${er.employee.lastName} ${er.employee.firstName}`;
    const monthValues = er.monthResults.map(
      (m) => m.activeDays > 0 ? `${m.activeDays}T` : "0T"
    );
    rows.push(csvRow([name, ...monthValues, er.licenseMonths]));
  }
  const totalCells = result.totalPerMonth.map(String);
  rows.push(csvRow(["Total", ...totalCells, result.totalLicenses]));
  const bom = "\uFEFF";
  const csvContent = bom + rows.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const safeDate = formatDateDE$1(fromDate).replace(/\./g, "-");
  a.href = url;
  a.download = `Abrechnung_${tenantName.replace(/\s+/g, "_")}_${safeDate}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
function deToIso(de) {
  const [dd, mm, yyyy] = de.split(".");
  if (!dd || !mm || !yyyy) return "";
  return `${yyyy}-${mm}-${dd}`;
}
function isoToDe(iso) {
  const [yyyy, mm, dd] = iso.split("-");
  if (!yyyy || !mm || !dd) return "";
  return `${dd}.${mm}.${yyyy}`;
}
function BillingPeriodFilter({
  fromDate,
  toDate,
  kulanzDays,
  onFromDateChange,
  onToDateChange,
  onKulanzChange,
  onApply,
  isLoading
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "flex flex-wrap gap-3 items-end",
      "data-ocid": "billing.period_filter",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1 flex-1 min-w-[140px]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Label,
            {
              htmlFor: "billing-from",
              className: "text-xs font-medium text-foreground",
              children: "Von"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "billing-from",
              type: "date",
              "data-ocid": "billing.from_date_input",
              value: deToIso(fromDate),
              onChange: (e) => onFromDateChange(isoToDe(e.target.value)),
              className: "h-8 text-sm"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1 flex-1 min-w-[140px]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Label,
            {
              htmlFor: "billing-to",
              className: "text-xs font-medium text-foreground",
              children: "Bis"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "billing-to",
              type: "date",
              "data-ocid": "billing.to_date_input",
              value: deToIso(toDate),
              onChange: (e) => onToDateChange(isoToDe(e.target.value)),
              className: "h-8 text-sm"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1 w-[110px]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Label,
            {
              htmlFor: "billing-kulanz",
              className: "text-xs font-medium text-foreground",
              children: "Kulanz (Tage)"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "billing-kulanz",
              type: "number",
              min: 0,
              max: 31,
              "data-ocid": "billing.kulanz_input",
              value: kulanzDays,
              onChange: (e) => onKulanzChange(Number.parseInt(e.target.value, 10) || 0),
              className: "h-8 text-sm"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            type: "button",
            size: "sm",
            className: "h-8 px-4",
            onClick: onApply,
            disabled: isLoading,
            "data-ocid": "billing.apply_button",
            children: isLoading ? "Lädt…" : "Anzeigen"
          }
        )
      ]
    }
  );
}
function LicenseBillingTable({ result }) {
  const { employeeResults, months, totalPerMonth, totalLicenses } = result;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: "overflow-x-auto rounded-lg border border-border",
      "data-ocid": "billing.license_table",
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "min-w-full text-sm border-collapse", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { backgroundColor: "#00182b" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "th",
            {
              className: "sticky left-0 z-10 px-3 py-2.5 text-left text-xs font-semibold text-white whitespace-nowrap border-r border-white/10",
              style: { backgroundColor: "#00182b", minWidth: "160px" },
              children: "Mitarbeiter"
            }
          ),
          months.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "th",
            {
              className: "px-2 py-2.5 text-center text-xs font-semibold text-white whitespace-nowrap border-r border-white/10 last:border-r-0",
              style: { minWidth: "60px" },
              children: formatMonthLabel(m)
            },
            m.toISOString()
          )),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "th",
            {
              className: "px-3 py-2.5 text-right text-xs font-semibold text-white whitespace-nowrap",
              style: { minWidth: "80px" },
              children: "Lizenzen"
            }
          )
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: employeeResults.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "td",
          {
            colSpan: months.length + 2,
            className: "px-3 py-8 text-center text-sm text-muted-foreground",
            "data-ocid": "billing.license_table_empty_state",
            children: "Keine abrechnungsrelevanten Mitarbeitenden im gewählten Zeitraum."
          }
        ) }) : employeeResults.map((er, rowIdx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "tr",
          {
            "data-ocid": `billing.license_table_row.${rowIdx + 1}`,
            className: `border-t border-border/50 ${rowIdx % 2 === 0 ? "bg-background" : "bg-muted/20"} hover:bg-primary/5 transition-colors`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "td",
                {
                  className: "sticky left-0 z-10 px-3 py-2 text-sm font-medium text-foreground whitespace-nowrap border-r border-border/40",
                  style: {
                    backgroundColor: rowIdx % 2 === 0 ? "var(--background)" : void 0,
                    background: rowIdx % 2 !== 0 ? "hsl(var(--muted) / 0.2)" : void 0
                  },
                  children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
                    er.employee.lastName,
                    ", ",
                    er.employee.firstName,
                    !er.employee.active && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex text-[10px] px-1.5 py-0 rounded-full bg-muted text-muted-foreground border border-border", children: "inaktiv" })
                  ] })
                }
              ),
              er.monthResults.map((mr, colIdx) => {
                var _a;
                return /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "td",
                  {
                    className: "px-2 py-2 text-center text-xs tabular-nums border-r border-border/30 last:border-r-0",
                    children: mr.activeDays === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground/50", children: "0T" }) : mr.isLicenseMonth ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold text-foreground", children: [
                      mr.activeDays,
                      "T"
                    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
                      mr.activeDays,
                      "T"
                    ] })
                  },
                  ((_a = months[colIdx]) == null ? void 0 : _a.toISOString()) ?? colIdx
                );
              }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-right text-sm font-semibold text-foreground tabular-nums", children: er.licenseMonths })
            ]
          },
          String(er.employee.id)
        )) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tfoot", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "tr",
          {
            className: "border-t-2 border-border",
            "data-ocid": "billing.license_table_totals_row",
            style: { backgroundColor: "rgba(0, 96, 102, 0.08)" },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "td",
                {
                  className: "sticky left-0 z-10 px-3 py-2.5 text-sm font-bold text-foreground whitespace-nowrap border-r border-border/40",
                  style: { backgroundColor: "rgba(0, 96, 102, 0.08)" },
                  children: "Total"
                }
              ),
              totalPerMonth.map((count, i) => {
                var _a;
                return /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "td",
                  {
                    className: "px-2 py-2.5 text-center text-xs font-bold text-foreground tabular-nums border-r border-border/30 last:border-r-0",
                    children: count > 0 ? count : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground/50", children: "0" })
                  },
                  ((_a = months[i]) == null ? void 0 : _a.toISOString()) ?? i
                );
              }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2.5 text-right text-sm font-bold text-foreground tabular-nums", children: totalLicenses })
            ]
          }
        ) })
      ] })
    }
  );
}
function formatDateDE(date) {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}
function parseDateDE(de) {
  const [dd, mm, yyyy] = de.split(".");
  if (!dd || !mm || !yyyy) return null;
  const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  return Number.isNaN(d.getTime()) ? null : d;
}
function defaultFromDate() {
  const now = /* @__PURE__ */ new Date();
  return formatDateDE(new Date(now.getFullYear() - 1, now.getMonth() + 1, 1));
}
function defaultToDate() {
  const now = /* @__PURE__ */ new Date();
  return formatDateDE(new Date(now.getFullYear(), now.getMonth() + 1, 0));
}
function TenantBillingDetailView({
  company,
  defaultKulanzDays,
  onBack
}) {
  const { actor, isFetching } = useActor(createActor);
  const [fromDate, setFromDate] = reactExports.useState(defaultFromDate);
  const [toDate, setToDate] = reactExports.useState(defaultToDate);
  const [kulanzDays, setKulanzDays] = reactExports.useState(defaultKulanzDays);
  const [appliedFrom, setAppliedFrom] = reactExports.useState(fromDate);
  const [appliedTo, setAppliedTo] = reactExports.useState(toDate);
  const [appliedKulanz, setAppliedKulanz] = reactExports.useState(kulanzDays);
  reactExports.useEffect(() => {
    setKulanzDays(defaultKulanzDays);
    setAppliedKulanz(defaultKulanzDays);
  }, [defaultKulanzDays]);
  const { data: employees = [], isLoading: loadingEmployees } = useQuery({
    queryKey: ["companyEmployeesForBilling", company.id],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCompanyEmployeesForBilling(BigInt(company.id));
    },
    enabled: !!actor && !isFetching,
    staleTime: 6e4
  });
  const contactPerson = employees.find((e) => e.role === "admin");
  const result = reactExports.useMemo(() => {
    if (loadingEmployees || employees.length === 0) return null;
    const from = parseDateDE(appliedFrom);
    const to = parseDateDE(appliedTo);
    if (!from || !to || from > to) return null;
    return calculateBilling(employees, from, to, appliedKulanz);
  }, [employees, appliedFrom, appliedTo, appliedKulanz, loadingEmployees]);
  function handleApply() {
    setAppliedFrom(fromDate);
    setAppliedTo(toDate);
    setAppliedKulanz(kulanzDays);
  }
  function handleExportCSV() {
    if (!result) return;
    const from = parseDateDE(appliedFrom);
    const to = parseDateDE(appliedTo);
    if (!from || !to) return;
    exportToCSV(company.name, from, to, appliedKulanz, result);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", "data-ocid": "billing.tenant_detail_view", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Button,
      {
        type: "button",
        variant: "ghost",
        size: "sm",
        onClick: onBack,
        className: "gap-1.5 -ml-1 text-muted-foreground hover:text-foreground",
        "data-ocid": "billing.back_button",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "w-4 h-4" }),
          "Zur Abrechnungsübersicht"
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "rounded-xl overflow-hidden border border-border",
        "data-ocid": "billing.detail_header",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-6 py-5", style: { backgroundColor: "#00182b" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-white/70 uppercase tracking-wider mb-0.5", children: "iReport Onchain Abrechnung" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-xl font-bold text-white", children: [
              "Kunde – ",
              company.name
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-6 py-4 bg-card border-t border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mb-0.5", children: "Adresse" }),
              company.address ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-foreground", children: company.address }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground italic", children: "Keine Adressdaten verfügbar" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mb-0.5", children: "Kontaktperson (Admin)" }),
              contactPerson ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-foreground", children: [
                  contactPerson.firstName,
                  " ",
                  contactPerson.lastName
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-xs", children: contactPerson.email })
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "—" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mb-0.5", children: "Status" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: `inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${company.isActive ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`,
                  children: company.isActive ? "Aktiv" : "Inaktiv"
                }
              )
            ] })
          ] }) })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "bg-card border border-border rounded-xl p-4",
        "data-ocid": "billing.filter_section",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3", children: "Abrechnungszeitraum" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            BillingPeriodFilter,
            {
              fromDate,
              toDate,
              kulanzDays,
              onFromDateChange: setFromDate,
              onToDateChange: setToDate,
              onKulanzChange: setKulanzDays,
              onApply: handleApply,
              isLoading: loadingEmployees
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-[11px] text-muted-foreground", children: [
            "Kulanz: Mindesttage im Monat, ab denen ein Monat als lizenzpflichtig gilt. Aktueller Planwert: ",
            /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
              defaultKulanzDays,
              " Tage"
            ] }),
            "."
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", "data-ocid": "billing.license_section", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3 flex-wrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold text-foreground", children: "Lizenzen" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-0.5", children: [
            "Zeitraum: ",
            appliedFrom,
            " – ",
            appliedTo,
            " · Kulanz: ",
            appliedKulanz,
            " ",
            "Tage"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            type: "button",
            variant: "outline",
            size: "sm",
            className: "gap-1.5 h-8",
            disabled: !result || result.employeeResults.length === 0,
            onClick: handleExportCSV,
            "data-ocid": "billing.csv_export_button",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "w-3.5 h-3.5" }),
              "CSV exportieren"
            ]
          }
        )
      ] }),
      loadingEmployees ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "space-y-2",
          "data-ocid": "billing.license_table_loading_state",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-10 w-full" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-10 w-full" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-10 w-full" })
          ]
        }
      ) : !result ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "rounded-lg border-2 border-dashed border-border py-10 text-center",
          "data-ocid": "billing.license_table_empty_state",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FileSpreadsheet, { className: "w-8 h-8 text-muted-foreground mx-auto mb-2" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Keine Daten für den gewählten Zeitraum." })
          ]
        }
      ) : /* @__PURE__ */ jsxRuntimeExports.jsx(LicenseBillingTable, { result }),
      result && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "flex items-center justify-between rounded-lg bg-primary/5 border border-primary/20 px-4 py-3",
          "data-ocid": "billing.summary_panel",
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-6 flex-wrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground uppercase tracking-wide", children: "Mitarbeitende" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-bold text-foreground", children: result.employeeResults.length })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground uppercase tracking-wide", children: "Monate" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-bold text-foreground", children: result.months.length })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground uppercase tracking-wide", children: "Total Lizenzen" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl font-bold", style: { color: "#006066" }, children: result.totalLicenses })
            ] })
          ] })
        }
      )
    ] })
  ] });
}
const toAny = (a) => a;
function formatDate(nanoseconds) {
  const ms = Number(nanoseconds / 1000000n);
  const d = new Date(ms);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${dd}.${mm}.${yyyy} ${hh}:${min}`;
}
function formatDateShort(nanoseconds) {
  const ms = Number(nanoseconds / 1000000n);
  const d = new Date(ms);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}
function isUserActive(user) {
  return user.isActive;
}
function PlanChangeDialog({
  open,
  info,
  onConfirm,
  onCancel,
  isLoading,
  allPlans
}) {
  const [billingModel, setBillingModel] = reactExports.useState(
    "monthly"
  );
  reactExports.useEffect(() => {
    if (open) setBillingModel("monthly");
  }, [open]);
  if (!open || !info) return null;
  const newPlan = allPlans.find((p) => p.id === info.suggestedPlanId);
  const userCount = Number(info.activeUserCount);
  const pricePerMonth = billingModel === "yearly" ? (newPlan == null ? void 0 : newPlan.pricePerYearCHF) ?? 0 : (newPlan == null ? void 0 : newPlan.pricePerMonthCHF) ?? 0;
  const totalCost = billingModel === "yearly" ? userCount * pricePerMonth * 12 : userCount * pricePerMonth;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Dialog,
    {
      open,
      onOpenChange: (o) => {
        if (!o) onCancel();
      },
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        DialogContent,
        {
          "data-ocid": "platform-admin.plan_change_dialog",
          className: "max-w-md",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2 text-amber-600", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CreditCard, { className: "w-4 h-4" }),
              "Planwechsel erforderlich"
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 py-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-foreground", children: [
                  "Der aktuelle Plan ",
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
                    '"',
                    info.currentPlanName,
                    '"'
                  ] }),
                  " wird gewechselt zu ",
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
                    '"',
                    info.suggestedPlanName,
                    '"'
                  ] }),
                  "."
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                  "Grund: Anzahl aktiver Mitarbeitender:",
                  " ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground", children: Number(info.activeUserCount) })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm font-medium", children: "Abrechnungsmodell" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 cursor-pointer", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "input",
                      {
                        type: "radio",
                        name: "billingModel",
                        value: "monthly",
                        checked: billingModel === "monthly",
                        onChange: () => setBillingModel("monthly"),
                        className: "accent-primary"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: "Monatlich" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 cursor-pointer", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "input",
                      {
                        type: "radio",
                        name: "billingModel",
                        value: "yearly",
                        checked: billingModel === "yearly",
                        onChange: () => setBillingModel("yearly"),
                        className: "accent-primary"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: "Jährlich" })
                  ] })
                ] })
              ] }),
              newPlan && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md bg-muted/50 border border-border px-3 py-2.5 space-y-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Neue Kosten (geschätzt)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-semibold text-foreground", children: [
                  "CHF",
                  " ",
                  totalCost.toLocaleString("de-CH", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground font-normal ml-1", children: billingModel === "yearly" ? `(${userCount} Benutzer × CHF ${pricePerMonth.toLocaleString("de-CH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/MA/Monat × 12)` : `(${userCount} Benutzer × CHF ${pricePerMonth.toLocaleString("de-CH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/MA/Monat)` })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                  "Monatlich: CHF",
                  " ",
                  (userCount * (newPlan.pricePerMonthCHF ?? 0)).toLocaleString(
                    "de-CH",
                    { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                  ),
                  " | ",
                  "Jährlich: CHF",
                  " ",
                  billingModel === "yearly" ? (userCount * (newPlan.pricePerYearCHF ?? 0) * 12).toLocaleString("de-CH", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  }) : (userCount * (newPlan.pricePerMonthCHF ?? 0) * 12).toLocaleString("de-CH", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "outline",
                  onClick: onCancel,
                  disabled: isLoading,
                  "data-ocid": "platform-admin.plan_change_cancel_button",
                  children: "Abbrechen"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  onClick: () => onConfirm(billingModel),
                  disabled: isLoading,
                  "data-ocid": "platform-admin.plan_change_confirm_button",
                  className: "gap-1.5",
                  children: isLoading ? "Wird übernommen…" : "Bestätigen"
                }
              )
            ] })
          ]
        }
      )
    }
  );
}
function CompanyUserRow({
  user,
  companyId,
  index,
  isPlatformAdminCompany,
  allPlans
}) {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  const active = isUserActive(user);
  const isPAUser = isPlatformAdminCompany && user.role === "admin";
  const [planChangeOpen, setPlanChangeOpen] = reactExports.useState(false);
  const [planChangeInfo, setPlanChangeInfo] = reactExports.useState(
    null
  );
  const pendingActiveRef = reactExports.useRef(null);
  const roleMutation = useMutation({
    mutationFn: async (newRole) => {
      if (!actor) throw new Error("Kein Aktor verfügbar");
      const result = await actor.setUserRoleForCompany(
        BigInt(companyId),
        user.id,
        newRole
      );
      if (result.__kind__ === "err") throw new Error(result.err ?? "Fehler");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["platformAdminUsers", companyId]
      });
      ue.success("Rolle erfolgreich geändert.");
    },
    onError: (err) => {
      queryClient.invalidateQueries({
        queryKey: ["platformAdminUsers", companyId]
      });
      ue.error(`Fehler beim Ändern der Rolle: ${err.message}`);
    }
  });
  const activeMutation = useMutation({
    mutationFn: async (newActive) => {
      if (!actor) throw new Error("Kein Aktor verfügbar");
      const result = await actor.setUserActiveForCompany(
        BigInt(companyId),
        user.id,
        newActive
      );
      if (result.__kind__ === "err") throw new Error(result.err ?? "Fehler");
    },
    onSuccess: (_, newActive) => {
      queryClient.invalidateQueries({
        queryKey: ["platformAdminUsers", companyId]
      });
      queryClient.invalidateQueries({ queryKey: ["allCompanies"] });
      queryClient.invalidateQueries({ queryKey: ["allCompanySubscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["monthlyBilling"] });
      ue.success(
        newActive ? "Benutzer aktiviert." : "Benutzer deaktiviert."
      );
    },
    onError: (err) => {
      queryClient.invalidateQueries({
        queryKey: ["platformAdminUsers", companyId]
      });
      ue.error(`Fehler beim Ändern des Status: ${err.message}`);
    }
  });
  const planChangeMutation = useMutation({
    mutationFn: async ({
      billingModel,
      newActive
    }) => {
      if (!actor) throw new Error("Kein Aktor verfügbar");
      await actor.setCompanyBillingModel(BigInt(companyId), billingModel);
      const result = await actor.setUserActiveForCompany(
        BigInt(companyId),
        user.id,
        newActive
      );
      if (result.__kind__ === "err") throw new Error(result.err ?? "Fehler");
    },
    onSuccess: (_, { newActive }) => {
      queryClient.invalidateQueries({
        queryKey: ["platformAdminUsers", companyId]
      });
      queryClient.invalidateQueries({ queryKey: ["allCompanies"] });
      queryClient.invalidateQueries({ queryKey: ["allCompanySubscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["monthlyBilling"] });
      setPlanChangeOpen(false);
      setPlanChangeInfo(null);
      pendingActiveRef.current = null;
      ue.success(
        newActive ? "Benutzer aktiviert, Plan geändert." : "Benutzer deaktiviert, Plan geändert."
      );
    },
    onError: (err) => {
      queryClient.invalidateQueries({
        queryKey: ["platformAdminUsers", companyId]
      });
      setPlanChangeOpen(false);
      ue.error(`Fehler: ${err.message}`);
    }
  });
  async function handleActiveToggle(newActive) {
    if (!actor) return;
    try {
      const result = await actor.checkPlanChangeNeeded(BigInt(companyId));
      if (result.__kind__ === "ok" && result.ok.changeNeeded) {
        pendingActiveRef.current = newActive;
        setPlanChangeInfo({
          currentPlanName: result.ok.currentPlanName,
          suggestedPlanName: result.ok.suggestedPlanName,
          suggestedPlanId: result.ok.suggestedPlanId,
          activeUserCount: result.ok.activeUserCount
        });
        setPlanChangeOpen(true);
        return;
      }
    } catch {
    }
    activeMutation.mutate(newActive);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "tr",
    {
      "data-ocid": `platform-admin.user_row.${index + 1}`,
      className: "border-b border-border/40 hover:bg-muted/20 transition-colors",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2.5 text-sm font-medium text-foreground whitespace-nowrap", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
          user.firstName,
          " ",
          user.lastName,
          isPAUser && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              title: "Platform-Admin — Rolle und Status können nicht geändert werden",
              className: "inline-flex items-center",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "w-3.5 h-3.5 text-primary flex-shrink-0" })
            }
          )
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2.5 text-sm text-muted-foreground hidden sm:table-cell max-w-[180px] truncate", children: user.email }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2.5", children: isPAUser ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "span",
          {
            title: "Platform-Admin Rolle kann nicht geändert werden",
            className: "inline-flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium cursor-not-allowed",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "w-3 h-3" }),
              "Admin"
            ]
          }
        ) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Select,
          {
            value: user.role,
            disabled: roleMutation.isPending,
            onValueChange: (val) => roleMutation.mutate(val),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                SelectTrigger,
                {
                  "data-ocid": `platform-admin.user_role_select.${index + 1}`,
                  className: "h-7 text-xs w-[130px] bg-background",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {})
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "admin", children: "Admin" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "manager", children: "Manager" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "employee", children: "Mitarbeiter" })
              ] })
            ]
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2.5 text-center", children: isPAUser ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          Switch,
          {
            checked: active,
            disabled: true,
            "aria-label": "Platform-Admin – kann nicht deaktiviert werden",
            className: "opacity-50 cursor-not-allowed"
          }
        ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
          Switch,
          {
            "data-ocid": `platform-admin.user_active_toggle.${index + 1}`,
            checked: active,
            disabled: activeMutation.isPending || planChangeMutation.isPending,
            onCheckedChange: (checked) => handleActiveToggle(checked),
            "aria-label": active ? "Deaktivieren" : "Aktivieren"
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2.5 text-xs text-muted-foreground hidden md:table-cell whitespace-nowrap", children: user.activatedAt ? formatDateShort(user.activatedAt) : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2.5 text-xs text-muted-foreground hidden md:table-cell whitespace-nowrap", children: user.deactivatedAt ? formatDateShort(user.deactivatedAt) : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          PlanChangeDialog,
          {
            open: planChangeOpen,
            info: planChangeInfo,
            allPlans,
            isLoading: planChangeMutation.isPending,
            onConfirm: (billingModel) => {
              const newActive = pendingActiveRef.current ?? !active;
              planChangeMutation.mutate({ billingModel, newActive });
            },
            onCancel: () => {
              setPlanChangeOpen(false);
              setPlanChangeInfo(null);
              pendingActiveRef.current = null;
            }
          }
        )
      ]
    }
  );
}
function CompanyUsersPanel({
  companyId,
  isPlatformAdminCompany,
  allPlans
}) {
  const { actor, isFetching } = useActor(createActor);
  const {
    data: users,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ["platformAdminUsers", companyId],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.getUsersForCompany(BigInt(companyId));
      return result;
    },
    enabled: !!actor && !isFetching,
    staleTime: 3e4
  });
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { "data-ocid": `platform-admin.users_loading_state.${companyId}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 7, className: "px-3 py-4 bg-muted/10", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-4 rounded-full" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-48" })
    ] }) }) });
  }
  if (isError) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { "data-ocid": `platform-admin.users_error_state.${companyId}`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "td",
      {
        colSpan: 7,
        className: "px-3 py-4 text-sm text-destructive bg-destructive/5",
        children: [
          "Fehler beim Laden der Benutzer:",
          " ",
          (error == null ? void 0 : error.message) ?? "Unbekannter Fehler"
        ]
      }
    ) });
  }
  if (!users || users.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { "data-ocid": `platform-admin.users_empty_state.${companyId}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "td",
      {
        colSpan: 7,
        className: "px-3 py-4 text-sm text-muted-foreground bg-muted/10 text-center",
        children: "Keine Benutzer gefunden."
      }
    ) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { className: "bg-muted/20", children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 7, className: "px-3 pt-2 pb-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 mb-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "w-3.5 h-3.5 text-primary" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wide", children: "Benutzer dieser Firma" })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-muted/20", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-1.5 text-left text-xs font-medium text-muted-foreground whitespace-nowrap", children: "Vorname Name" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-1.5 text-left text-xs font-medium text-muted-foreground hidden sm:table-cell", children: "E-Mail" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-1.5 text-left text-xs font-medium text-muted-foreground whitespace-nowrap", children: "Rolle" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-1.5 text-center text-xs font-medium text-muted-foreground", children: "Aktiv" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-1.5 text-left text-xs font-medium text-muted-foreground hidden md:table-cell whitespace-nowrap", children: "Aktiviert am" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-1.5 text-left text-xs font-medium text-muted-foreground hidden md:table-cell whitespace-nowrap", children: "Deaktiviert am" })
    ] }),
    users.map((user, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      CompanyUserRow,
      {
        user,
        companyId,
        index,
        isPlatformAdminCompany,
        allPlans
      },
      String(user.id)
    )),
    /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { className: "bg-muted/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 7, className: "py-1.5" }) })
  ] });
}
function renderEmployeeCount(company) {
  const active = Number(company.activeEmployeeCount);
  const inactive = Number(company.inactiveEmployeeCount);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm text-muted-foreground", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-green-700 font-medium", children: [
      active,
      " aktiv"
    ] }),
    " / ",
    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
      inactive,
      " inaktiv"
    ] })
  ] });
}
function CompanyTableRow({
  company,
  index,
  isExpanded,
  onToggleExpand,
  isToggling,
  onToggleActive,
  isPlatformAdminCompany,
  assignedPlanId,
  activePlans,
  onPlanChange,
  billingModel,
  onBillingModelChange,
  isBillingModelSaving
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "tr",
      {
        "data-ocid": `platform-admin.companies_row.${index + 1}`,
        className: `border-b border-border/50 hover:bg-muted/30 transition-colors ${isExpanded ? "bg-primary/5" : ""}`,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              "data-ocid": `platform-admin.companies_expand.${index + 1}`,
              onClick: onToggleExpand,
              className: "flex items-center gap-2 font-medium text-foreground hover:text-primary transition-colors text-sm",
              "aria-expanded": isExpanded,
              "aria-label": isExpanded ? "Benutzer ausblenden" : "Benutzer anzeigen",
              children: [
                isExpanded ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "w-4 h-4 text-primary flex-shrink-0" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "w-4 h-4 text-muted-foreground flex-shrink-0" }),
                company.name,
                isPlatformAdminCompany && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "span",
                  {
                    title: "Firma des Platform-Admins",
                    className: "inline-flex items-center",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "w-3.5 h-3.5 text-primary flex-shrink-0 ml-0.5" })
                  }
                )
              ]
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2 py-3 text-sm text-muted-foreground hidden sm:table-cell whitespace-nowrap", children: formatDateShort(company.createdAt) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2 py-3 hidden md:table-cell", children: renderEmployeeCount(company) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2 py-3 hidden lg:table-cell", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: assignedPlanId || "none",
                onValueChange: onPlanChange,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    SelectTrigger,
                    {
                      "data-ocid": `platform-admin.companies_plan_select.${index + 1}`,
                      className: "h-7 text-xs w-[150px] bg-background",
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Kein Plan" })
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "none", children: "Kein Plan" }),
                    activePlans.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: p.id, children: p.name }, p.id))
                  ] })
                ]
              }
            ),
            !isPlatformAdminCompany && assignedPlanId && assignedPlanId !== "none" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: billingModel || "monthly",
                onValueChange: (v) => onBillingModelChange(v),
                disabled: isBillingModelSaving,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    SelectTrigger,
                    {
                      "data-ocid": `platform-admin.companies_billing_model_select.${index + 1}`,
                      className: "h-7 text-xs w-[150px] bg-background",
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {})
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "monthly", children: "Monatlich" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "yearly", children: "Jährlich" })
                  ] })
                ]
              }
            )
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2 py-3 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              "data-ocid": `platform-admin.companies_status.${index + 1}`,
              className: `inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${company.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`,
              children: company.isActive ? "Aktiv" : "Inaktiv"
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2 py-3 text-right", children: isPlatformAdminCompany ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "span",
            {
              title: "Firma des Platform-Admins kann nicht deaktiviert werden",
              className: "inline-flex items-center gap-1 px-2 py-1 rounded border border-border text-xs text-muted-foreground cursor-not-allowed opacity-60",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "w-3 h-3" }),
                "Geschützt"
              ]
            }
          ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              "data-ocid": `platform-admin.companies_toggle.${index + 1}`,
              variant: "outline",
              size: "sm",
              disabled: isToggling,
              onClick: onToggleActive,
              className: "text-xs h-7 px-2",
              children: isToggling ? "..." : company.isActive ? "Deaktivieren" : "Aktivieren"
            }
          ) })
        ]
      }
    ),
    isExpanded && /* @__PURE__ */ jsxRuntimeExports.jsx(
      CompanyUsersPanel,
      {
        companyId: company.id,
        isPlatformAdminCompany,
        allPlans: activePlans
      }
    )
  ] });
}
function CanisterIdSection({ backendCanisterId }) {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  const [frontendId, setFrontendId] = reactExports.useState("");
  const { data: adminConfig } = useQuery({
    queryKey: ["platformAdminConfig"],
    queryFn: async () => {
      if (!actor) return null;
      return toAny(
        actor
      ).getPlatformAdminConfig();
    },
    enabled: !!actor
  });
  reactExports.useEffect(() => {
    if (adminConfig == null ? void 0 : adminConfig.frontendCanisterId) {
      setFrontendId(adminConfig.frontendCanisterId);
    }
  }, [adminConfig]);
  const saveMutation = useMutation({
    mutationFn: async (id) => {
      if (!actor) throw new Error("Kein Aktor verfügbar");
      const cfg = await toAny(actor).getPlatformAdminConfig();
      return toAny(actor).setPlatformAdminConfig({
        frontendCanisterId: id,
        stripePublishableKey: (cfg == null ? void 0 : cfg.stripePublishableKey) ?? "",
        stripeSecretKey: "",
        stripeWebhookSecret: "",
        stripeWebhookEndpointUrl: (cfg == null ? void 0 : cfg.stripeWebhookEndpointUrl) ?? ""
      });
    },
    onSuccess: () => {
      ue.success("Frontend Canister-ID gespeichert.");
      queryClient.invalidateQueries({ queryKey: ["platformAdminConfig"] });
      queryClient.invalidateQueries({ queryKey: ["costDashboard"] });
    },
    onError: (err) => {
      ue.error(`Fehler: ${err.message}`);
    }
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { "data-ocid": "platform-admin.canister_ids_card", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-base font-semibold flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "w-4 h-4 text-primary" }),
      "Canister-IDs einrichten"
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground", children: "Backend Canister-ID (automatisch)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-mono text-foreground bg-muted/50 px-3 py-2 rounded-md break-all", children: backendCanisterId || "—" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "frontend-canister-id", className: "text-xs", children: "Frontend Canister-ID" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "frontend-canister-id",
              "data-ocid": "platform-admin.frontend_canister_id_input",
              value: frontendId,
              onChange: (e) => setFrontendId(e.target.value),
              placeholder: "z.B. rdmx6-jaaaa-aaaaa-aaadq-cai",
              className: "font-mono text-sm flex-1"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              "data-ocid": "platform-admin.frontend_canister_id_save",
              size: "sm",
              disabled: saveMutation.isPending || !frontendId.trim(),
              onClick: () => saveMutation.mutate(frontendId.trim()),
              className: "gap-1.5 flex-shrink-0",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "w-3.5 h-3.5" }),
                saveMutation.isPending ? "Speichert…" : "Speichern"
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground", children: "Die Frontend Canister-ID wird im Kosten-Dashboard für Cycle-Berechnungen verwendet." })
      ] })
    ] })
  ] });
}
const EMPTY_PLAN = {
  name: "",
  description: "",
  pricePerMonthCHF: 0,
  pricePerYearCHF: 0,
  minActiveDaysPerMonth: 1n,
  maxEmployees: void 0,
  features: [],
  isActive: true,
  requiresPayment: false,
  paymentProvider: "none",
  stripePriceId: "",
  stripePriceIdYearly: "",
  stripeProductId: "",
  stripeMode: ""
};
function SubscriptionPlanModal({
  open,
  plan,
  onClose,
  onSaved
}) {
  const { actor } = useActor(createActor);
  const buildFormFromPlan = (p) => ({
    name: p.name,
    description: p.description,
    pricePerMonthCHF: p.pricePerMonthCHF,
    pricePerYearCHF: p.pricePerYearCHF,
    minActiveDaysPerMonth: p.minActiveDaysPerMonth ?? 1n,
    maxEmployees: p.maxEmployees,
    features: [...p.features],
    isActive: p.isActive,
    requiresPayment: p.requiresPayment,
    paymentProvider: p.paymentProvider,
    stripePriceId: p.stripePriceId ?? "",
    stripePriceIdYearly: p.stripePriceIdYearly ?? "",
    stripeProductId: p.stripeProductId ?? "",
    stripeMode: p.stripeMode ?? ""
  });
  const [form, setForm] = reactExports.useState(
    () => plan ? buildFormFromPlan(plan) : { ...EMPTY_PLAN }
  );
  reactExports.useEffect(() => {
    if (open) {
      setForm(plan ? buildFormFromPlan(plan) : { ...EMPTY_PLAN });
    }
  }, [open, plan]);
  const handleOpen = (isOpen) => {
    if (!isOpen) onClose();
  };
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Kein Aktor verfügbar");
      const planToSave = {
        id: (plan == null ? void 0 : plan.id) ?? "",
        sortOrder: (plan == null ? void 0 : plan.sortOrder) ?? 0n,
        updatedAt: (plan == null ? void 0 : plan.updatedAt) ?? 0n,
        ...form
      };
      const result = await actor.upsertSubscriptionPlan(planToSave);
      if (result.__kind__ === "err") throw new Error(result.err ?? "Fehler");
    },
    onSuccess: () => {
      ue.success(
        plan ? "Abonnement-Plan aktualisiert." : "Abonnement-Plan erstellt."
      );
      onSaved();
      onClose();
    },
    onError: (err) => {
      ue.error(`Fehler beim Speichern: ${err.message}`);
    }
  });
  if (!open) return null;
  const maxEmpValue = form.maxEmployees !== void 0 ? Number(form.maxEmployees) : 999;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Dialog,
    {
      open,
      onOpenChange: (o) => {
        handleOpen(o);
        if (!o) onClose();
      },
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        DialogContent,
        {
          "data-ocid": "platform-admin.subscription_plan_dialog",
          className: "max-w-lg max-h-[90vh] overflow-y-auto",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CreditCard, { className: "w-4 h-4 text-primary" }),
              plan ? "Plan bearbeiten" : "Neuer Plan"
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 py-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { htmlFor: "plan-name", className: "text-sm font-medium", children: [
                  "Name ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    id: "plan-name",
                    "data-ocid": "platform-admin.subscription_plan_name_input",
                    value: form.name,
                    onChange: (e) => setForm((f) => ({ ...f, name: e.target.value })),
                    placeholder: "z.B. Professional"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "plan-desc", className: "text-sm font-medium", children: "Beschreibung" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Textarea,
                  {
                    id: "plan-desc",
                    "data-ocid": "platform-admin.subscription_plan_desc_input",
                    value: form.description,
                    onChange: (e) => setForm((f) => ({ ...f, description: e.target.value })),
                    placeholder: "Kurze Beschreibung des Plans",
                    className: "resize-none",
                    rows: 2
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm font-medium", children: "Preis/Mitarbeiter/Monat im Monats-Abonnement (CHF)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      "data-ocid": "platform-admin.subscription_plan_price_month_input",
                      type: "number",
                      min: 0,
                      step: 0.01,
                      value: form.pricePerMonthCHF,
                      onChange: (e) => setForm((f) => ({
                        ...f,
                        pricePerMonthCHF: Number.parseFloat(e.target.value) || 0
                      }))
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm font-medium", children: "Preis/Mitarbeiter/Monat im Jahres-Abonnement (CHF)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      "data-ocid": "platform-admin.subscription_plan_price_year_input",
                      type: "number",
                      min: 0,
                      step: 0.01,
                      value: form.pricePerYearCHF,
                      onChange: (e) => setForm((f) => ({
                        ...f,
                        pricePerYearCHF: Number.parseFloat(e.target.value) || 0
                      }))
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm font-medium", children: "Mindestaktive Tage/Monat" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      "data-ocid": "platform-admin.subscription_plan_min_active_days_input",
                      type: "number",
                      min: 1,
                      step: 1,
                      value: Number(form.minActiveDaysPerMonth ?? 1n),
                      onChange: (e) => setForm((f) => ({
                        ...f,
                        minActiveDaysPerMonth: BigInt(
                          Number.parseInt(e.target.value, 10) || 1
                        )
                      }))
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground", children: "Min. Tage im Monat aktiv, um als aktiver Benutzer zu gelten." })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm font-medium", children: "Max. aktive Mitarbeitende (für diesen Plan)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    "data-ocid": "platform-admin.subscription_plan_max_emp_input",
                    type: "number",
                    min: 1,
                    value: maxEmpValue,
                    onChange: (e) => {
                      const v = Number.parseInt(e.target.value, 10) || 0;
                      setForm((f) => ({
                        ...f,
                        maxEmployees: v === 0 ? void 0 : BigInt(v)
                      }));
                    }
                  }
                ),
                maxEmpValue === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-destructive font-medium", children: "Max. aktive Mitarbeitende darf nicht 0 sein. Gib 999 für unbegrenzt ein." }) : isUnlimited(maxEmpValue) ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground", children: "Unbegrenzt — keine Obergrenze." }) : null
              ] }),
              (() => {
                const SIDEBAR_FEATURES = [
                  { key: "dashboard", label: "Dashboard" },
                  { key: "calendar", label: "Kalender" },
                  { key: "time-tracking", label: "Zeiten erfassen" },
                  { key: "expense-tracking", label: "Spesen erfassen" },
                  { key: "reports", label: "Auswertungen" },
                  { key: "invoicing", label: "Fakturierung" },
                  { key: "master-data", label: "Stammdaten" },
                  { key: "settings", label: "Einstellungen" }
                ];
                return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "block text-sm font-medium mb-1", children: "Enthaltene Funktionen" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mb-2", children: "Diese Funktionen steuern die Sidebar-Navigation für Mandanten dieses Plans." }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-2", children: SIDEBAR_FEATURES.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "label",
                    {
                      className: "flex items-center gap-2 text-sm cursor-pointer",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "input",
                          {
                            type: "checkbox",
                            checked: form.features.includes(f.key),
                            onChange: (e) => setForm((prev) => ({
                              ...prev,
                              features: e.target.checked ? [...prev.features, f.key] : prev.features.filter((k) => k !== f.key)
                            })),
                            className: "rounded border-input text-primary",
                            "data-ocid": `platform-admin.subscription_plan_feature_${f.key}_checkbox`
                          }
                        ),
                        f.label
                      ]
                    },
                    f.key
                  )) })
                ] });
              })(),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 pt-2 border-t border-border/50", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wide", children: "Stripe-Konfiguration (optional)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "plan-stripe-price-monthly", className: "text-sm", children: "Stripe Price ID (monatlich)" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Input,
                      {
                        id: "plan-stripe-price-monthly",
                        "data-ocid": "platform-admin.subscription_plan_stripe_price_monthly_input",
                        value: form.stripePriceId ?? "",
                        onChange: (e) => setForm((f) => ({ ...f, stripePriceId: e.target.value })),
                        placeholder: "price_xxx",
                        className: "font-mono text-xs"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "plan-stripe-price-yearly", className: "text-sm", children: "Stripe Price ID (jährlich)" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Input,
                      {
                        id: "plan-stripe-price-yearly",
                        "data-ocid": "platform-admin.subscription_plan_stripe_price_yearly_input",
                        value: form.stripePriceIdYearly ?? "",
                        onChange: (e) => setForm((f) => ({
                          ...f,
                          stripePriceIdYearly: e.target.value
                        })),
                        placeholder: "price_yyy",
                        className: "font-mono text-xs"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "plan-stripe-product", className: "text-sm", children: "Stripe Product ID" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Input,
                      {
                        id: "plan-stripe-product",
                        "data-ocid": "platform-admin.subscription_plan_stripe_product_input",
                        value: form.stripeProductId ?? "",
                        onChange: (e) => setForm((f) => ({ ...f, stripeProductId: e.target.value })),
                        placeholder: "prod_xxx",
                        className: "font-mono text-xs"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm", children: "Zahlungsanbieter" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        Select,
                        {
                          value: form.paymentProvider ?? "none",
                          onValueChange: (v) => setForm((f) => ({
                            ...f,
                            paymentProvider: v
                          })),
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              SelectTrigger,
                              {
                                "data-ocid": "platform-admin.subscription_plan_payment_provider_select",
                                className: "h-8 text-xs bg-background",
                                children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {})
                              }
                            ),
                            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "none", children: "Keine" }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "stripe", children: "Stripe" }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "manual", children: "Manuell" })
                            ] })
                          ]
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm", children: "Stripe-Modus" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        Select,
                        {
                          value: form.stripeMode || "",
                          onValueChange: (v) => setForm((f) => ({
                            ...f,
                            stripeMode: v === "default" ? "" : v
                          })),
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              SelectTrigger,
                              {
                                "data-ocid": "platform-admin.subscription_plan_stripe_mode_select",
                                className: "h-8 text-xs bg-background",
                                children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "(Standard)" })
                              }
                            ),
                            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "default", children: "(Standard)" }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "test", children: "Test" }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "live", children: "Live" })
                            ] })
                          ]
                        }
                      )
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 py-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Switch,
                      {
                        id: "plan-requires-payment",
                        "data-ocid": "platform-admin.subscription_plan_requires_payment_toggle",
                        checked: form.requiresPayment,
                        onCheckedChange: (checked) => setForm((f) => ({ ...f, requiresPayment: checked }))
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Label,
                      {
                        htmlFor: "plan-requires-payment",
                        className: "text-sm cursor-pointer",
                        children: "Zahlung erforderlich"
                      }
                    )
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between py-2 border-t border-border/50", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm font-medium", children: "Plan aktiv" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground mt-0.5", children: "Inaktive Pläne werden nicht auf der Startseite angezeigt." })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Switch,
                  {
                    "data-ocid": "platform-admin.subscription_plan_aktiv_toggle",
                    checked: form.isActive,
                    onCheckedChange: (checked) => setForm((f) => ({ ...f, isActive: checked }))
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "outline",
                  onClick: onClose,
                  "data-ocid": "platform-admin.subscription_plan_cancel_button",
                  children: "Abbrechen"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  onClick: () => saveMutation.mutate(),
                  disabled: saveMutation.isPending || !form.name.trim(),
                  "data-ocid": "platform-admin.subscription_plan_save_button",
                  className: "gap-1.5",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "w-3.5 h-3.5" }),
                    saveMutation.isPending ? "Speichert…" : "Speichern"
                  ]
                }
              )
            ] })
          ]
        }
      )
    }
  );
}
function formatChfSwiss(n) {
  return n.toLocaleString("de-CH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}
function BillingOverviewSection() {
  var _a;
  const { actor, isFetching } = useActor(createActor);
  const now = /* @__PURE__ */ new Date();
  const [year, setYear] = reactExports.useState(now.getFullYear());
  const [month, setMonth] = reactExports.useState(now.getMonth() + 1);
  const [selectedTenantId, setSelectedTenantId] = reactExports.useState(null);
  const MONTHS = [
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
    "Dezember"
  ];
  const { data: billingEntries = [], isLoading } = useQuery({
    queryKey: ["monthlyBilling", year, month],
    queryFn: async () => {
      if (!actor) return [];
      const result = await toAny(actor).getMonthlyBillingOverview(
        BigInt(year),
        BigInt(month)
      );
      return result;
    },
    enabled: !!actor && !isFetching,
    staleTime: 6e4
  });
  const { data: allPlansForBilling = [] } = useQuery({
    queryKey: ["subscriptionPlans"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllSubscriptionPlans();
    },
    enabled: !!actor && !isFetching,
    staleTime: 6e4
  });
  const { data: allCompaniesForBilling = [] } = useQuery({
    queryKey: ["allCompanies"],
    queryFn: async () => {
      if (!actor) return [];
      const result = await toAny(actor).listAllCompaniesForPlatformAdmin();
      return result;
    },
    enabled: !!actor && !isFetching,
    staleTime: 3e4
  });
  const platformAdminCompanyIdForBilling = allCompaniesForBilling.length > 0 ? allCompaniesForBilling.reduce(
    (earliest, c) => c.createdAt < earliest.createdAt ? c : earliest
  ).id : null;
  const totalCHF = billingEntries.reduce((s, e) => {
    const isYearly = e.billingModel === "yearly";
    const activeUsers = Number(e.activeUserCount);
    const plan = allPlansForBilling.find((p) => p.id === e.planId);
    const pricePerUser = isYearly ? plan ? plan.pricePerYearCHF * 12 : activeUsers > 0 ? e.totalCHF / activeUsers : 0 : plan ? plan.pricePerMonthCHF : activeUsers > 0 ? e.totalCHF / activeUsers : 0;
    return s + activeUsers * pricePerUser;
  }, 0);
  const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  if (selectedTenantId) {
    const selectedCompany = allCompaniesForBilling.find(
      (c) => c.id === selectedTenantId
    );
    if (selectedCompany) {
      const planId = (_a = billingEntries.find(
        (e) => String(e.companyId) === selectedTenantId
      )) == null ? void 0 : _a.planId;
      const plan = allPlansForBilling.find((p) => p.id === planId);
      const defaultKulanz = plan ? Number(plan.minActiveDaysPerMonth ?? 5n) : 5;
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { "data-ocid": "platform-admin.billing_section", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "pt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        TenantBillingDetailView,
        {
          company: {
            id: selectedCompany.id,
            name: selectedCompany.name,
            address: (selectedCompany == null ? void 0 : selectedCompany.address) ?? void 0,
            createdAt: selectedCompany.createdAt,
            isActive: selectedCompany.isActive
          },
          defaultKulanzDays: defaultKulanz,
          onBack: () => setSelectedTenantId(null)
        }
      ) }) });
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { "data-ocid": "platform-admin.billing_section", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3 flex-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-base font-semibold flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ReceiptText, { className: "w-4 h-4 text-primary" }),
          "Abrechnungsübersicht"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Monatliche Abrechnung pro Mandant gemäss zugeordnetem Abonnement-Plan." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "select",
          {
            value: month,
            onChange: (e) => setMonth(Number(e.target.value)),
            className: "h-8 text-sm px-2 rounded-md border border-input bg-background",
            "data-ocid": "platform-admin.billing_month_select",
            children: MONTHS.map((m, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: i + 1, children: m }, m))
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "select",
          {
            value: year,
            onChange: (e) => setYear(Number(e.target.value)),
            className: "h-8 text-sm px-2 rounded-md border border-input bg-background",
            "data-ocid": "platform-admin.billing_year_select",
            children: years.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: y, children: y }, y))
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        "data-ocid": "platform-admin.billing_loading_state",
        className: "space-y-3",
        children: [1, 2].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-10 w-full" }, i))
      }
    ) : billingEntries.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        "data-ocid": "platform-admin.billing_empty_state",
        className: "text-center py-10 text-sm text-muted-foreground",
        children: "Noch keine Abrechnungsdaten vorhanden."
      }
    ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto -mx-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border text-xs text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-2 py-2 font-medium", children: "Firmenname" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-2 py-2 font-medium hidden sm:table-cell", children: "Abonnement" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right px-2 py-2 font-medium", children: "Aktive Benutzer" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right px-2 py-2 font-medium hidden md:table-cell", children: "Abr.-Modell" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right px-2 py-2 font-medium hidden md:table-cell", children: "Preis/Benutzer" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right px-2 py-2 font-medium", children: "Total (CHF)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right px-2 py-2 font-medium hidden sm:table-cell", children: "Jahresübersicht" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: billingEntries.map((e, idx) => {
        const isYearly = e.billingModel === "yearly";
        const activeUsers = Number(e.activeUserCount);
        const plan = allPlansForBilling.find(
          (p) => p.id === e.planId
        );
        const pricePerUser = isYearly ? plan ? plan.pricePerYearCHF * 12 : activeUsers > 0 ? e.totalCHF / activeUsers : 0 : plan ? plan.pricePerMonthCHF : activeUsers > 0 ? e.totalCHF / activeUsers : 0;
        const computedTotal = activeUsers * pricePerUser;
        const isPACompany = String(e.companyId) === platformAdminCompanyIdForBilling;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(React.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "tr",
            {
              "data-ocid": `platform-admin.billing_row.${idx + 1}`,
              className: "border-b border-border/40 hover:bg-muted/20 transition-colors",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2 py-2.5 font-medium text-foreground", children: e.companyName }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2 py-2.5 text-muted-foreground hidden sm:table-cell", children: e.planName || "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2 py-2.5 text-right tabular-nums", children: activeUsers }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2 py-2.5 text-right tabular-nums text-muted-foreground hidden md:table-cell whitespace-nowrap", children: isYearly ? "Jährlich" : "Monatlich" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2 py-2.5 text-right tabular-nums text-muted-foreground hidden md:table-cell", children: activeUsers > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                  formatChfSwiss(pricePerUser),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] ml-0.5", children: [
                    "/",
                    isYearly ? "Jahr" : "Monat"
                  ] })
                ] }) : "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2 py-2.5 text-right tabular-nums font-medium", children: formatChfSwiss(computedTotal) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2 py-2.5 text-right hidden sm:table-cell", children: !isPACompany && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Button,
                  {
                    type: "button",
                    variant: "ghost",
                    size: "sm",
                    className: "h-7 text-xs gap-1.5 text-primary hover:text-primary hover:bg-primary/10",
                    onClick: () => setSelectedTenantId(String(e.companyId)),
                    "data-ocid": `platform-admin.billing_annual_detail.${idx + 1}`,
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(ChartNoAxesColumn, { className: "w-3.5 h-3.5" }),
                      "Jährliche Übersicht"
                    ]
                  }
                ) })
              ]
            }
          ),
          (isYearly || (e.proRataAmount ?? 0) !== 0 || (e.creditAmount ?? 0) !== 0) && /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-muted/10", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 2 }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { colSpan: 5, className: "px-2 py-1 text-xs", children: [
              (e.proRataAmount ?? 0) > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-amber-600 font-medium", children: [
                "Nachzahlung (Plan-Upgrade): CHF",
                " ",
                formatChfSwiss(e.proRataAmount ?? 0)
              ] }),
              (e.creditAmount ?? 0) > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-green-600 font-medium", children: [
                "Guthaben (Plan-Downgrade): CHF",
                " ",
                formatChfSwiss(e.creditAmount ?? 0)
              ] }),
              isYearly && e.nextDueDateTimestamp !== void 0 && e.nextDueDateTimestamp > 0n && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-3 text-muted-foreground", children: [
                "Nächste Fälligkeit:",
                " ",
                formatDateShort(e.nextDueDateTimestamp)
              ] }),
              !isYearly && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-3 text-muted-foreground", children: "Nächste Fälligkeit: Monatsende" }),
              e.proRataNote && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2 text-muted-foreground", children: e.proRataNote })
            ] })
          ] })
        ] }, String(e.companyId));
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tfoot", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t border-border bg-muted/20", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "td",
          {
            colSpan: 5,
            className: "px-2 py-2 text-right text-xs font-semibold text-muted-foreground hidden md:table-cell",
            children: "Gesamtumsatz"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "td",
          {
            colSpan: 1,
            className: "px-2 py-2 text-right text-xs font-semibold text-muted-foreground md:hidden",
            children: "Gesamtumsatz"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2 py-2.5 text-right tabular-nums font-bold text-foreground", children: formatChfSwiss(totalCHF) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "hidden sm:table-cell" })
      ] }) })
    ] }) }) })
  ] });
}
function SubscriptionSection() {
  const { actor, isFetching } = useActor(createActor);
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = reactExports.useState(false);
  const [editPlan, setEditPlan] = reactExports.useState(null);
  const [deleteConfirm, setDeleteConfirm] = reactExports.useState(null);
  const { data: plans, isLoading } = useQuery({
    queryKey: ["subscriptionPlans"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllSubscriptionPlans();
    },
    enabled: !!actor && !isFetching,
    staleTime: 6e4
  });
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      if (!actor) throw new Error("Kein Aktor verfügbar");
      await actor.deleteSubscriptionPlan(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptionPlans"] });
      ue.success("Plan gelöscht.");
      setDeleteConfirm(null);
    },
    onError: (err) => {
      ue.error(`Fehler beim Löschen: ${err.message}`);
    }
  });
  const openCreate = () => {
    setEditPlan(null);
    setModalOpen(true);
  };
  const openEdit = (plan) => {
    setEditPlan(plan);
    setModalOpen(true);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { "data-ocid": "platform-admin.subscription_section", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "pb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-base font-semibold flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CreditCard, { className: "w-4 h-4 text-primary" }),
          "Abonnement-Konfiguration"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            size: "sm",
            onClick: openCreate,
            "data-ocid": "platform-admin.subscription_new_plan_button",
            className: "gap-1.5 text-xs h-8",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-3.5 h-3.5" }),
              "Neuer Plan"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Definiere und verwalte die verfügbaren Abonnement-Pläne für iReport. Aktive Pläne werden auf der Startseite angezeigt." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        "data-ocid": "platform-admin.subscription_loading_state",
        className: "space-y-3",
        children: [1, 2].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-20 w-full" }, i))
      }
    ) : !plans || plans.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        "data-ocid": "platform-admin.subscription_empty_state",
        className: "text-center py-10 border-2 border-dashed border-border rounded-lg",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CreditCard, { className: "w-8 h-8 text-muted-foreground mx-auto mb-3" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-foreground mb-1", children: "Noch keine Pläne definiert" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mb-4", children: "Erstelle deinen ersten Abonnement-Plan für iReport." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              size: "sm",
              onClick: openCreate,
              "data-ocid": "platform-admin.subscription_create_first_button",
              className: "gap-1.5",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-3.5 h-3.5" }),
                "Ersten Plan erstellen"
              ]
            }
          )
        ]
      }
    ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: plans.map((plan, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        "data-ocid": `platform-admin.subscription_plan_card.${idx + 1}`,
        className: "border border-border rounded-lg p-4 hover:bg-muted/20 transition-colors",
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-sm text-foreground", children: plan.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Badge,
                {
                  variant: plan.isActive ? "default" : "secondary",
                  className: `text-[10px] px-1.5 py-0 ${plan.isActive ? "bg-green-100 text-green-700 border-green-200" : "bg-muted text-muted-foreground"}`,
                  children: plan.isActive ? "Aktiv" : "Inaktiv"
                }
              )
            ] }),
            plan.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mb-2", children: plan.description }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mb-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium text-foreground", children: [
                  "CHF ",
                  plan.pricePerMonthCHF.toFixed(2)
                ] }),
                " ",
                "/ MA / Monat"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium text-foreground", children: [
                  "CHF ",
                  plan.pricePerYearCHF.toFixed(2)
                ] }),
                " ",
                "/ MA / Jahr"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "Min.",
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground", children: Number(plan.minActiveDaysPerMonth ?? 1n) }),
                " ",
                "Akt.-Tage"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "Max.",
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground", children: isUnlimited(plan.maxEmployees) ? "Unbegrenzt" : Number(plan.maxEmployees) }),
                " ",
                "MA"
              ] })
            ] }),
            plan.features.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1", children: plan.features.map((feat) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              "span",
              {
                className: "inline-flex items-center px-1.5 py-0.5 bg-primary/8 text-primary text-[10px] rounded-full border border-primary/20",
                children: feat
              },
              feat
            )) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 flex-shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "ghost",
                size: "sm",
                onClick: () => openEdit(plan),
                "data-ocid": `platform-admin.subscription_plan_edit_button.${idx + 1}`,
                className: "h-7 w-7 p-0 text-muted-foreground hover:text-foreground",
                "aria-label": `Plan bearbeiten: ${plan.name}`,
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" })
              }
            ),
            deleteConfirm === plan.id ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "destructive",
                  size: "sm",
                  onClick: () => deleteMutation.mutate(plan.id),
                  disabled: deleteMutation.isPending,
                  "data-ocid": `platform-admin.subscription_plan_confirm_delete.${idx + 1}`,
                  className: "h-7 text-xs px-2",
                  children: "Löschen"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "ghost",
                  size: "sm",
                  onClick: () => setDeleteConfirm(null),
                  "data-ocid": `platform-admin.subscription_plan_cancel_delete.${idx + 1}`,
                  className: "h-7 w-7 p-0",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-3.5 h-3.5" })
                }
              )
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "ghost",
                size: "sm",
                onClick: () => setDeleteConfirm(plan.id),
                "data-ocid": `platform-admin.subscription_plan_delete_button.${idx + 1}`,
                className: "h-7 w-7 p-0 text-muted-foreground hover:text-destructive",
                "aria-label": `Plan löschen: ${plan.name}`,
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" })
              }
            )
          ] })
        ] })
      },
      plan.id
    )) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      SubscriptionPlanModal,
      {
        open: modalOpen,
        plan: editPlan,
        onClose: () => setModalOpen(false),
        onSaved: () => queryClient.invalidateQueries({ queryKey: ["subscriptionPlans"] })
      }
    )
  ] });
}
function StripeConfigSection() {
  var _a, _b, _c, _d;
  const { actor, isFetching } = useActor(createActor);
  const queryClient = useQueryClient();
  const [secretKey, setSecretKey] = reactExports.useState("");
  const [webhookSecret, setWebhookSecret] = reactExports.useState("");
  const [publishableKey, setPublishableKey] = reactExports.useState("");
  const [showSecret, setShowSecret] = reactExports.useState(false);
  const [showWebhook, setShowWebhook] = reactExports.useState(false);
  const [isCollapsed, setIsCollapsed] = reactExports.useState(false);
  const [endpointCopied, setEndpointCopied] = reactExports.useState(false);
  const [testLoading, setTestLoading] = reactExports.useState(false);
  const [testResults, setTestResults] = reactExports.useState(null);
  const WEBHOOK_ENDPOINT_URL = "https://strategic-cyan-kjv-draft.caffeine.xyz/api/stripe/webhook";
  async function handleCopyEndpoint() {
    try {
      await navigator.clipboard.writeText(WEBHOOK_ENDPOINT_URL);
      setEndpointCopied(true);
      setTimeout(() => setEndpointCopied(false), 2e3);
    } catch {
      ue.error("Kopieren fehlgeschlagen");
    }
  }
  async function handleTestConnection() {
    if (!actor) return;
    setTestLoading(true);
    setTestResults(null);
    try {
      const result = await toAny(actor).testStripeConnection();
      setTestResults({
        api: {
          ok: result.apiConnectionOk,
          message: result.apiConnectionMessage
        },
        portal: {
          ok: result.customerPortalOk,
          message: result.customerPortalMessage
        }
      });
    } catch (e) {
      setTestResults({
        api: { ok: false, message: e instanceof Error ? e.message : String(e) },
        portal: { ok: false, message: "Test konnte nicht durchgeführt werden" }
      });
    } finally {
      setTestLoading(false);
    }
  }
  const { data: configStatus, isLoading: statusLoading } = useQuery({
    queryKey: ["stripeConfigStatus"],
    queryFn: async () => {
      if (!actor)
        return { configured: false, testMode: true, hasPublishableKey: false };
      try {
        return await toAny(actor).getStripeConfigStatus();
      } catch {
        return { configured: false, testMode: true, hasPublishableKey: false };
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 6e4
  });
  const { data: publishableKeySaved } = useQuery({
    queryKey: ["stripePublishableKeySaved"],
    queryFn: async () => {
      if (!actor) return false;
      try {
        const result = await toAny(actor).getStripePublishableKey();
        return result !== null && result !== void 0 && result !== null;
      } catch {
        return false;
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 6e4
  });
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Kein Aktor verfügbar");
      const isAlreadyConfigured = (configStatus == null ? void 0 : configStatus.configured) ?? false;
      const sk = secretKey.trim();
      const pk = publishableKey.trim();
      const wh = webhookSecret.trim();
      if (isAlreadyConfigured) {
        if (sk === "" && wh === "") {
          throw new Error(
            "Bitte Secret Key und Webhook Secret ebenfalls eingeben, da alle drei Felder beim Speichern übermittelt werden müssen."
          );
        }
        if (sk === "") {
          throw new Error(
            "Bitte den Secret Key neu eingeben (wird aus Sicherheitsgründen nicht angezeigt)."
          );
        }
        if (wh === "") {
          throw new Error(
            "Bitte das Webhook Secret neu eingeben (wird aus Sicherheitsgründen nicht angezeigt)."
          );
        }
      } else {
        if (sk === "") throw new Error("Bitte den Secret Key eingeben.");
        if (wh === "") throw new Error("Bitte das Webhook Secret eingeben.");
      }
      const r = await toAny(actor).setStripeConfig(sk, pk, wh);
      if (r.__kind__ === "err") throw new Error(r.err ?? "Fehler");
    },
    onSuccess: () => {
      ue.success("Stripe-Konfiguration gespeichert.");
      setSecretKey("");
      setWebhookSecret("");
      setPublishableKey("");
      queryClient.invalidateQueries({ queryKey: ["stripeConfigStatus"] });
      queryClient.invalidateQueries({
        queryKey: ["stripePublishableKeySaved"]
      });
    },
    onError: (err) => ue.error(`Fehler: ${err.message}`)
  });
  const canSave = secretKey.trim().length > 0 || publishableKey.trim().length > 0 || webhookSecret.trim().length > 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { "data-ocid": "platform-admin.stripe_config_card", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "pb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Key, { className: "w-4 h-4 text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base font-semibold", children: "Stripe-Konfiguration" }),
          statusLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-5 w-20" }) : (configStatus == null ? void 0 : configStatus.configured) ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "text-[10px] px-1.5 py-0 bg-green-100 text-green-700 border-green-200", children: "Konfiguriert" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "text-[10px] px-1.5 py-0", children: "Nicht konfiguriert" }),
          (configStatus == null ? void 0 : configStatus.configured) && /* @__PURE__ */ jsxRuntimeExports.jsx(
            Badge,
            {
              className: `text-[10px] px-1.5 py-0 ${configStatus.testMode ? "bg-yellow-100 text-yellow-700 border-yellow-200" : "bg-red-100 text-red-700 border-red-200"}`,
              children: configStatus.testMode ? "Test-Modus" : "Live-Modus"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => setIsCollapsed((v) => !v),
            "aria-label": isCollapsed ? "Einstellungen ausklappen" : "Einstellungen einklappen",
            className: "text-muted-foreground hover:text-foreground transition-colors",
            children: isCollapsed ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "w-4 h-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "w-4 h-4" })
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Globale Stripe-Zugangsdaten für Zahlungsabwicklung. Keys werden sicher im Backend gespeichert und sind im Frontend nicht lesbar." })
    ] }),
    !isCollapsed && /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-5", children: [
      (configStatus == null ? void 0 : configStatus.configured) && !configStatus.testMode && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2 rounded-md bg-red-50 border border-red-200 px-3 py-2.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-red-800", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Live-Modus aktiv." }),
          " Alle Zahlungen werden echt abgewickelt. Sei vorsichtig beim Ändern der Konfiguration."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "stripe-webhook-url", className: "text-sm font-medium", children: "Webhook-Endpunkt-URL" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "stripe-webhook-url",
              readOnly: true,
              value: WEBHOOK_ENDPOINT_URL,
              "data-ocid": "platform-admin.stripe_endpoint_url_input",
              className: "font-mono text-xs flex-1 bg-muted/40 text-muted-foreground"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              type: "button",
              variant: "outline",
              size: "sm",
              className: "h-9 w-9 p-0 flex-shrink-0",
              onClick: handleCopyEndpoint,
              "aria-label": "URL kopieren",
              "data-ocid": "platform-admin.stripe_endpoint_copy_button",
              children: endpointCopied ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "w-4 h-4 text-green-600" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "w-4 h-4" })
            }
          )
        ] }),
        endpointCopied && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-green-600 font-medium", children: "Kopiert!" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground", children: "Diese URL unter Stripe → Entwickler → Webhooks → Endpunkt hinzufügen eintragen." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { htmlFor: "stripe-pub-key", className: "text-sm font-medium", children: [
          "Stripe Publishable Key",
          publishableKeySaved && !publishableKey && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1 text-[11px] text-muted-foreground font-normal", children: "(gespeichert — neu eingeben zum Ändern)" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            id: "stripe-pub-key",
            "data-ocid": "platform-admin.stripe_publishable_key_input",
            value: publishableKey,
            onChange: (e) => setPublishableKey(e.target.value),
            placeholder: publishableKeySaved ? "(gespeichert — neu eingeben zum Ändern)" : "pk_test_xxx oder pk_live_xxx",
            className: "font-mono text-xs"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground", children: "Öffentlicher Schlüssel — wird sicher im Backend gespeichert und für den Stripe-Checkout verwendet." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { htmlFor: "stripe-secret-key", className: "text-sm font-medium", children: [
          "Stripe Secret Key ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "stripe-secret-key",
              "data-ocid": "platform-admin.stripe_secret_key_input",
              type: showSecret ? "text" : "password",
              value: secretKey,
              onChange: (e) => setSecretKey(e.target.value),
              placeholder: (configStatus == null ? void 0 : configStatus.configured) ? "(gespeichert — neu eingeben zum Ändern)" : "sk_test_xxx oder sk_live_xxx",
              className: "font-mono text-xs flex-1"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              type: "button",
              variant: "ghost",
              size: "sm",
              className: "h-9 w-9 p-0 flex-shrink-0",
              onClick: () => setShowSecret((v) => !v),
              "aria-label": showSecret ? "Verbergen" : "Anzeigen",
              children: showSecret ? /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { className: "w-4 h-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-4 h-4" })
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Label,
          {
            htmlFor: "stripe-webhook-secret",
            className: "text-sm font-medium",
            children: [
              "Webhook Secret ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "stripe-webhook-secret",
              "data-ocid": "platform-admin.stripe_webhook_secret_input",
              type: showWebhook ? "text" : "password",
              value: webhookSecret,
              onChange: (e) => setWebhookSecret(e.target.value),
              placeholder: (configStatus == null ? void 0 : configStatus.configured) ? "(gespeichert — neu eingeben zum Ändern)" : "whsec_xxx",
              className: "font-mono text-xs flex-1"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              type: "button",
              variant: "ghost",
              size: "sm",
              className: "h-9 w-9 p-0 flex-shrink-0",
              onClick: () => setShowWebhook((v) => !v),
              "aria-label": showWebhook ? "Verbergen" : "Anzeigen",
              children: showWebhook ? /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { className: "w-4 h-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-4 h-4" })
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between pt-1 border-t border-border/50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground", children: "Secret Key und Webhook Secret werden verschlüsselt im Backend gespeichert und sind nach dem Speichern nicht mehr lesbar." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            type: "button",
            size: "sm",
            disabled: saveMutation.isPending || !canSave,
            onClick: () => saveMutation.mutate(),
            "data-ocid": "platform-admin.stripe_config_save_button",
            className: "gap-1.5 flex-shrink-0 ml-4",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "w-3.5 h-3.5" }),
              saveMutation.isPending ? "Speichert…" : "Speichern"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 pt-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            type: "button",
            variant: "outline",
            size: "sm",
            disabled: testLoading || !(configStatus == null ? void 0 : configStatus.configured),
            onClick: handleTestConnection,
            "data-ocid": "platform-admin.stripe_test_connection_button",
            className: "gap-1.5",
            children: [
              testLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "w-3.5 h-3.5 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "w-3.5 h-3.5" }),
              testLoading ? "Wird geprüft…" : "Verbindung testen"
            ]
          }
        ),
        !(configStatus == null ? void 0 : configStatus.configured) && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground", children: "Stripe-Konfiguration muss zuerst gespeichert werden." }),
        testResults && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-border bg-muted/30 p-3 space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            ((_a = testResults.api) == null ? void 0 : _a.ok) ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-4 h-4 text-green-600 flex-shrink-0" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "w-4 h-4 text-red-600 flex-shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium", children: "Stripe API-Verbindung" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground", children: (_b = testResults.api) == null ? void 0 : _b.message })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            ((_c = testResults.portal) == null ? void 0 : _c.ok) ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-4 h-4 text-green-600 flex-shrink-0" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "w-4 h-4 text-red-600 flex-shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium", children: "Kundenportal" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground", children: (_d = testResults.portal) == null ? void 0 : _d.message })
            ] })
          ] })
        ] })
      ] })
    ] })
  ] });
}
function StripeCompanyDiagnostics({
  companyId,
  companyName
}) {
  const { actor, isFetching } = useActor(createActor);
  const queryClient = useQueryClient();
  const [relinkId, setRelinkId] = reactExports.useState("");
  const [showRelink, setShowRelink] = reactExports.useState(false);
  const companyIdBig = BigInt(companyId);
  const { data: stripeEvents = [], isLoading: eventsLoading } = useQuery({
    queryKey: ["stripeEvents", companyId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getStripeEvents(companyIdBig, 5n);
    },
    enabled: !!actor && !isFetching,
    staleTime: 6e4
  });
  const { data: sub, isLoading: subLoading } = useQuery({
    queryKey: ["companySubDiag", companyId],
    queryFn: async () => {
      if (!actor) return null;
      try {
        const r = await actor.syncStripeSubscription(companyIdBig);
        if (r.__kind__ === "ok") return r.ok;
      } catch {
      }
      return null;
    },
    enabled: !!actor && !isFetching,
    staleTime: 6e4
  });
  const syncMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Kein Aktor verfügbar");
      const r = await actor.manuallyTriggerStripeSync(companyIdBig);
      if (r.__kind__ === "err") throw new Error(r.err ?? "Fehler");
      return r.ok;
    },
    onSuccess: () => {
      ue.success("Stripe-Sync ausgelöst.");
      queryClient.invalidateQueries({
        queryKey: ["companySubDiag", companyId]
      });
      queryClient.invalidateQueries({ queryKey: ["stripeEvents", companyId] });
    },
    onError: (err) => ue.error(`Fehler: ${err.message}`)
  });
  const compareMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Kein Aktor verfügbar");
      const r = await actor.compareStripeSubscriptionStatus(companyIdBig);
      if (r.__kind__ === "err") throw new Error(r.err ?? "Fehler");
      return r.ok;
    },
    onSuccess: (data) => {
      ue.info(
        `Stripe: ${data.stripeStatus} | Intern: ${data.internalStatus} | Synchron: ${data.inSync ? "Ja" : "Nein"}`,
        { duration: 8e3 }
      );
    },
    onError: (err) => ue.error(`Fehler: ${err.message}`)
  });
  const checkoutLinkMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Kein Aktor verfügbar");
      const plan = await actor.getCompanySubscriptionPlan(companyIdBig);
      if (!plan) throw new Error("Kein Plan zugeordnet");
      const r = await actor.createStripeCheckoutLinkForCompany(
        companyIdBig,
        plan.id,
        "monthly"
      );
      if (r.__kind__ === "err") throw new Error(r.err ?? "Fehler");
      return r.ok;
    },
    onSuccess: (data) => {
      window.open(data.url, "_blank", "noopener,noreferrer");
      ue.success("Checkout-Link erstellt.");
    },
    onError: (err) => ue.error(`Fehler: ${err.message}`)
  });
  const relinkMutation = useMutation({
    mutationFn: async () => {
      if (!actor || !relinkId.trim())
        throw new Error("Keine Stripe Customer-ID");
      const r = await actor.relinkStripeCustomer(companyIdBig, relinkId.trim());
      if (r.__kind__ === "err") throw new Error(r.err ?? "Fehler");
      return r.ok;
    },
    onSuccess: () => {
      ue.success("Stripe Customer neu verknüpft.");
      setRelinkId("");
      setShowRelink(false);
      queryClient.invalidateQueries({
        queryKey: ["companySubDiag", companyId]
      });
    },
    onError: (err) => ue.error(`Fehler: ${err.message}`)
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "border border-border/60 rounded-lg p-4 space-y-3 bg-muted/10",
      "data-ocid": `platform-admin.stripe_diag.${companyId}`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "w-3.5 h-3.5 text-primary flex-shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold text-foreground", children: companyName })
        ] }),
        subLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-48" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-40" })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Stripe Customer:" }),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[11px] text-foreground", children: (sub == null ? void 0 : sub.stripeCustomerId) ?? "—" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Stripe Subscription:" }),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[11px] text-foreground", children: (sub == null ? void 0 : sub.stripeSubscriptionId) ?? "—" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Stripe-Status:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(PaymentStatusBadge, { status: sub == null ? void 0 : sub.stripeStatus })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Letzter Sync:" }),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground", children: (sub == null ? void 0 : sub.lastStripeSyncAt) && sub.lastStripeSyncAt > 0n ? formatDate(sub.lastStripeSyncAt) : "—" })
          ] })
        ] }),
        !eventsLoading && stripeEvents.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] uppercase tracking-wide text-muted-foreground font-medium", children: "Letzte Events" }),
          stripeEvents.slice(0, 3).map((ev) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "flex items-center gap-2 text-[11px] text-muted-foreground",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "span",
                  {
                    className: `inline-flex w-1.5 h-1.5 rounded-full flex-shrink-0 ${ev.processingStatus === "processed" ? "bg-green-500" : ev.processingStatus === "failed" ? "bg-red-500" : "bg-yellow-400"}`
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono truncate max-w-[200px]", children: ev.eventType })
              ]
            },
            ev.id
          ))
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 pt-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              type: "button",
              variant: "outline",
              size: "sm",
              className: "h-7 text-xs gap-1.5",
              disabled: syncMutation.isPending,
              onClick: () => syncMutation.mutate(),
              "data-ocid": `platform-admin.stripe_diag_sync.${companyId}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  RefreshCw,
                  {
                    className: `w-3 h-3 ${syncMutation.isPending ? "animate-spin" : ""}`
                  }
                ),
                "Sync"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              type: "button",
              variant: "outline",
              size: "sm",
              className: "h-7 text-xs gap-1.5",
              disabled: compareMutation.isPending,
              onClick: () => compareMutation.mutate(),
              "data-ocid": `platform-admin.stripe_diag_compare.${companyId}`,
              children: "Status vergleichen"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              type: "button",
              variant: "outline",
              size: "sm",
              className: "h-7 text-xs gap-1.5",
              disabled: checkoutLinkMutation.isPending,
              onClick: () => checkoutLinkMutation.mutate(),
              "data-ocid": `platform-admin.stripe_diag_checkout_link.${companyId}`,
              children: "Checkout-Link"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              type: "button",
              variant: "ghost",
              size: "sm",
              className: "h-7 text-xs gap-1.5",
              onClick: () => setShowRelink((v) => !v),
              "data-ocid": `platform-admin.stripe_diag_relink_toggle.${companyId}`,
              children: "Customer verknüpfen"
            }
          )
        ] }),
        showRelink && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 items-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: relinkId,
              onChange: (e) => setRelinkId(e.target.value),
              placeholder: "cus_xxx Stripe Customer-ID",
              className: "h-7 text-xs font-mono flex-1",
              "data-ocid": `platform-admin.stripe_diag_relink_input.${companyId}`
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              type: "button",
              size: "sm",
              className: "h-7 text-xs",
              disabled: relinkMutation.isPending || !relinkId.trim(),
              onClick: () => relinkMutation.mutate(),
              "data-ocid": `platform-admin.stripe_diag_relink_save.${companyId}`,
              children: relinkMutation.isPending ? "Speichert…" : "Speichern"
            }
          )
        ] })
      ]
    }
  );
}
function PlatformAdminPage() {
  const { isPlatformAdmin } = useAuth();
  const { actor, isFetching } = useActor(createActor);
  const queryClient = useQueryClient();
  const [expandedIds, setExpandedIds] = reactExports.useState(/* @__PURE__ */ new Set());
  const { data: companySubscriptions = [] } = useQuery(
    {
      queryKey: ["allCompanySubscriptions"],
      queryFn: async () => {
        if (!actor) return [];
        const result = await actor.getAllCompanySubscriptions();
        return result;
      },
      enabled: !!actor && !isFetching && isPlatformAdmin,
      staleTime: 6e4
    }
  );
  const companySubscriptionMap = new Map(
    companySubscriptions.map(([cId, pId]) => [cId, pId])
  );
  const { data: allPlans = [] } = useQuery({
    queryKey: ["subscriptionPlans"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllSubscriptionPlans();
    },
    enabled: !!actor && !isFetching && isPlatformAdmin,
    staleTime: 6e4
  });
  const activePlans = allPlans.filter((p) => p.isActive);
  const toggleExpanded = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const { data: adminInfo, isLoading: loadingInfo } = useQuery({
    queryKey: ["platformAdminInfo"],
    queryFn: async () => {
      if (!actor) return null;
      const result = await toAny(actor).getPlatformAdminInfo();
      return result ?? null;
    },
    enabled: !!actor && !isFetching && isPlatformAdmin,
    staleTime: 6e4
  });
  const { data: systemStats, isLoading: loadingStats } = useQuery({
    queryKey: ["systemStats"],
    queryFn: async () => {
      if (!actor) return null;
      const result = await toAny(actor).getSystemStats();
      return result;
    },
    enabled: !!actor && !isFetching && isPlatformAdmin,
    staleTime: 3e4
  });
  const {
    data: companies,
    isLoading: loadingCompanies,
    isError: companiesError
  } = useQuery({
    queryKey: ["allCompanies"],
    queryFn: async () => {
      if (!actor) return [];
      const result = await toAny(actor).listAllCompaniesForPlatformAdmin();
      return result;
    },
    enabled: !!actor && !isFetching && isPlatformAdmin,
    staleTime: 3e4
  });
  const platformAdminCompanyId = companies && companies.length > 0 ? companies.reduce(
    (earliest, c) => c.createdAt < earliest.createdAt ? c : earliest
  ).id : null;
  const { data: costData } = useQuery({
    queryKey: ["costDashboard", "null", "null"],
    queryFn: async () => {
      if (!actor) return null;
      const result = await toAny(actor).getCostDashboardData(null, null);
      return result;
    },
    enabled: !!actor && !isFetching && isPlatformAdmin,
    staleTime: 12e4
  });
  const { data: companyBillingModels = /* @__PURE__ */ new Map() } = useQuery({
    queryKey: ["companyBillingModels", companies == null ? void 0 : companies.map((c) => c.id)],
    queryFn: async () => {
      if (!actor || !companies || companies.length === 0)
        return /* @__PURE__ */ new Map();
      const results = await Promise.all(
        companies.map(async (c) => {
          try {
            const r = await actor.getCompanyBillingModel(BigInt(c.id));
            if (r.__kind__ === "ok") {
              return [c.id, r.ok.billingModel];
            }
          } catch {
          }
          return [c.id, "monthly"];
        })
      );
      return new Map(results);
    },
    enabled: !!actor && !isFetching && isPlatformAdmin && ((companies == null ? void 0 : companies.length) ?? 0) > 0,
    staleTime: 6e4
  });
  const billingModelMutation = useMutation({
    mutationFn: async ({
      companyId,
      billingModel
    }) => {
      if (!actor) throw new Error("Kein Aktor verfügbar");
      const result = await actor.setCompanyBillingModel(
        BigInt(companyId),
        billingModel
      );
      if (result.__kind__ === "err") throw new Error(result.err ?? "Fehler");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companyBillingModels"] });
      queryClient.invalidateQueries({ queryKey: ["monthlyBilling"] });
      ue.success("Abrechnungsmodell gespeichert.");
    },
    onError: (err) => {
      ue.error(`Fehler: ${err.message}`);
    }
  });
  const toggleActiveMutation = useMutation({
    mutationFn: async ({
      companyId,
      active
    }) => {
      if (!actor) throw new Error("Kein Aktor verfügbar");
      const result = await toAny(actor).setCompanyActive(
        BigInt(companyId),
        active
      );
      const typed = result;
      if (typed.__kind__ === "err") throw new Error(typed.err ?? "Fehler");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allCompanies"] });
    },
    onError: (err) => {
      queryClient.invalidateQueries({ queryKey: ["allCompanies"] });
      ue.error(`Fehler: ${err.message}`);
    }
  });
  if (!isPlatformAdmin) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Layout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center min-h-[60vh] gap-4 p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "w-16 h-16 text-muted-foreground" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-semibold text-foreground", children: "Kein Zugriff" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-center max-w-sm", children: "Du hast keine Berechtigung, auf die Platform-Administration zuzugreifen." })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Layout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 max-w-5xl mx-auto space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "w-7 h-7 text-primary flex-shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-display font-bold text-foreground", children: "Platform-Administration" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-0.5", children: "Systemweite Verwaltung aller Mandanten und Einstellungen" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Badge,
        {
          "data-ocid": "platform-admin.badge",
          className: "ml-auto bg-primary/10 text-primary border-primary/30 font-semibold",
          children: "Platform Admin"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { "data-ocid": "platform-admin.info_card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-base font-semibold flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "w-4 h-4 text-primary" }),
        "Platform Admin Info"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: loadingInfo ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-64" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-48" })
      ] }) : adminInfo ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mb-1", children: "Principal-ID" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "p",
            {
              "data-ocid": "platform-admin.principal_id",
              className: "text-sm font-mono text-foreground break-all bg-muted/50 px-2 py-1.5 rounded-md",
              children: adminInfo.principal
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mb-1", children: "Registriert am" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "p",
            {
              "data-ocid": "platform-admin.registered_at",
              className: "text-sm font-medium text-foreground",
              children: formatDate(adminInfo.createdAt)
            }
          )
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Keine Daten verfügbar" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { "data-ocid": "platform-admin.stats_companies", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "pt-5 pb-5", children: loadingStats ? /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-10 w-20" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "w-5 h-5 text-primary" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-foreground", children: systemStats ? Number(systemStats.totalCompanies) : "–" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Firmen total" })
        ] })
      ] }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { "data-ocid": "platform-admin.stats_employees", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "pt-5 pb-5", children: loadingStats ? /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-10 w-20" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "w-5 h-5 text-primary" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-foreground", children: systemStats ? Number(systemStats.totalEmployees) : "–" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Mitarbeitende total" })
        ] })
      ] }) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { "data-ocid": "platform-admin.companies_card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-base font-semibold flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "w-4 h-4 text-primary" }),
        "Mandantenübersicht"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: loadingCompanies ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          "data-ocid": "platform-admin.companies_loading_state",
          className: "space-y-3",
          children: [1, 2, 3].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-12 w-full" }, i))
        }
      ) : companiesError ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          "data-ocid": "platform-admin.companies_error_state",
          className: "text-sm text-destructive py-4 text-center",
          children: "Fehler beim Laden der Mandanten."
        }
      ) : !companies || companies.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          "data-ocid": "platform-admin.companies_empty_state",
          className: "text-sm text-muted-foreground py-8 text-center",
          children: "Keine Firmen vorhanden."
        }
      ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto -mx-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-2 py-2 font-medium", children: "Firmenname" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-2 py-2 font-medium hidden sm:table-cell whitespace-nowrap", children: "Registriert am" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-2 py-2 font-medium hidden md:table-cell whitespace-nowrap", children: "Mitarbeitende" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-2 py-2 font-medium hidden lg:table-cell whitespace-nowrap", children: "Abonnement" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-center px-2 py-2 font-medium", children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right px-2 py-2 font-medium", children: "Aktion" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: companies.map((company, index) => {
          var _a, _b;
          const isToggling = toggleActiveMutation.isPending && ((_a = toggleActiveMutation.variables) == null ? void 0 : _a.companyId) === company.id;
          const isPACompany = company.id === platformAdminCompanyId;
          return /* @__PURE__ */ jsxRuntimeExports.jsx(
            CompanyTableRow,
            {
              company,
              index,
              isExpanded: expandedIds.has(company.id),
              onToggleExpand: () => toggleExpanded(company.id),
              isToggling,
              onToggleActive: () => toggleActiveMutation.mutate({
                companyId: company.id,
                active: !company.isActive
              }),
              isPlatformAdminCompany: isPACompany,
              assignedPlanId: companySubscriptionMap.get(company.id) ?? "",
              activePlans,
              onPlanChange: async (planId) => {
                if (!actor) return;
                const resolvedPlanId = planId === "none" ? "" : planId;
                try {
                  await toAny(actor).assignSubscriptionPlan(
                    company.id,
                    resolvedPlanId
                  );
                  queryClient.invalidateQueries({
                    queryKey: ["allCompanySubscriptions"]
                  });
                  queryClient.invalidateQueries({
                    queryKey: ["monthlyBilling"]
                  });
                  queryClient.invalidateQueries({
                    queryKey: ["headerSubscriptionPlan"]
                  });
                } catch (err) {
                  ue.error(
                    `Fehler: ${err instanceof Error ? err.message : String(err)}`
                  );
                }
              },
              billingModel: companyBillingModels.get(company.id) ?? "monthly",
              onBillingModelChange: (model) => billingModelMutation.mutate({
                companyId: company.id,
                billingModel: model
              }),
              isBillingModelSaving: billingModelMutation.isPending && ((_b = billingModelMutation.variables) == null ? void 0 : _b.companyId) === company.id
            },
            company.id
          );
        }) })
      ] }) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(BillingOverviewSection, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(SubscriptionSection, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(StripeConfigSection, {}),
    companies && companies.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { "data-ocid": "platform-admin.stripe_diagnostics_card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "pb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-base font-semibold flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "w-4 h-4 text-primary" }),
          "Stripe Diagnostics"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Stripe-Status und Diagnose-Aktionen pro Mandant." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "space-y-3", children: companies.filter((c) => c.id !== platformAdminCompanyId).map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        StripeCompanyDiagnostics,
        {
          companyId: c.id,
          companyName: c.name
        },
        c.id
      )) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      CanisterIdSection,
      {
        backendCanisterId: (costData == null ? void 0 : costData.backendCanisterId) ?? ""
      }
    )
  ] }) });
}
export {
  PlatformAdminPage as default
};
