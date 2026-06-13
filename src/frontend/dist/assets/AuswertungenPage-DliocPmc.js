import { r as reactExports, j as jsxRuntimeExports, S as Skeleton } from "./index-D_yjRFGt.js";
import { B as Badge } from "./badge-BPk2SywW.js";
import { B as Button } from "./button-BXNzWYpr.js";
import { C as Card, a as CardContent, b as CardHeader, c as CardTitle } from "./card-Cqx-QXhC.js";
import { L as Label, I as Input } from "./index-SoMYIp0N.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-CXihOV-A.js";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-BXMAOymm.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem, f as formatHours, m as minutesToHHMM$1, L as Layout, C as ChartNoAxesColumn } from "./Layout-BOoVnXJI.js";
import { d as useAuth, u as useActor, c as createActor, b as useQuery, A as AuditEntityType, e as AuditOperation } from "./useAuthStore-RPelH0kd.js";
import { g as getActiveEmploymentForDate, n as nanosToLocalIsoDate, a as getEmploymentMinutesForDate } from "./employmentUtils-C-5ZbofZ.js";
import { P as Printer } from "./printer-DjqX2cwI.js";
import { F as FileText, C as ChevronDown, h as ChevronRight } from "./x-BHvIGru9.js";
import { C as ClipboardList } from "./clipboard-list-CSRr2lPz.js";
import { S as Shield } from "./shield-DBKz9E1a.js";
import { D as Download } from "./download-ueAGhbPX.js";
import { S as Search } from "./search-Bqm4cSjy.js";
import "./index-HGa3Ynxo.js";
import "./createLucideIcon-C599ATMm.js";
import "./loader-circle-DPIlcj_m.js";
const toAny$2 = (a) => a;
function fmtDate$1(iso) {
  if (!iso) return "–";
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}
function fmtCHF$1(n) {
  return n.toLocaleString("de-CH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}
function pad2$1(n) {
  return String(n).padStart(2, "0");
}
function minutesToDisplay(mins) {
  const sign = mins < 0 ? "-" : "";
  const abs = Math.abs(mins);
  return `${sign}${Math.floor(abs / 60)}:${pad2$1(abs % 60)}`;
}
function minutesToDisplaySigned(mins) {
  if (mins === 0) return "0:00";
  const prefix = mins > 0 ? "+" : "-";
  const abs = Math.abs(mins);
  return `${prefix}${Math.floor(abs / 60)}:${pad2$1(abs % 60)}`;
}
function hoursToMinutes(h) {
  return Math.round(h * 60);
}
function totalHoursDisplay(mins) {
  const abs = Math.abs(mins);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return `${h}:${pad2$1(m)}`;
}
function daysInMonth(year, month) {
  const count = new Date(year, month, 0).getDate();
  return Array.from({ length: count }, (_, i) => {
    const d = i + 1;
    return `${year}-${pad2$1(month)}-${pad2$1(d)}`;
  });
}
const MONTH_NAMES = [
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
function normaliseFeiertag(v) {
  if (v === "keineGutschrift" || v === "wochentag_sollzeit" || v === "durchschnittssoll")
    return v;
  if (v === "exakt" || v === "entschaedigt") return "keineGutschrift";
  if (v === "exaktWochentag") return "wochentag_sollzeit";
  if (v === "prozentual") return "durchschnittssoll";
  return "keineGutschrift";
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
const PRINT_STYLES$1 = `
@media print {
  .no-print { display: none !important; }
  /* Hide fixed/sticky elements (chat button, sidebar, header) during print */
  .fixed, [style*="position: fixed"], [style*="position:fixed"] { display: none !important; }
  nav, aside, header { display: none !important; }
  #monatsrapport-print {
    position: absolute !important;
    left: 0 !important;
    top: 0 !important;
    width: 100% !important;
    height: auto !important;
    overflow: visible !important;
    background: white !important;
    padding: 0 !important;
    margin: 0 !important;
  }
  body {
    background: white !important;
    margin: 0 !important;
    padding: 0 !important;
  }
  #monatsrapport-print table {
    page-break-inside: auto;
  }
  #monatsrapport-print tr {
    page-break-inside: avoid;
    page-break-after: auto;
  }
  #monatsrapport-print .report-section {
    page-break-inside: avoid;
  }
  img {
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }
}
@page {
  margin: 15mm;
  size: A4;
}
`;
function MonatsrapportView({
  employees,
  isAdminOrManager
}) {
  const { employeeId } = useAuth();
  const { actor, isFetching } = useActor(createActor);
  const now = /* @__PURE__ */ new Date();
  const [selectedEmployeeId, setSelectedEmployeeId] = reactExports.useState(
    () => employeeId ?? ""
  );
  const [selectedMonth, setSelectedMonth] = reactExports.useState(
    now.getMonth() + 1
  );
  const [selectedYear, setSelectedYear] = reactExports.useState(now.getFullYear());
  const [isLoading, setIsLoading] = reactExports.useState(false);
  const [data, setData] = reactExports.useState(null);
  const [error, setError] = reactExports.useState(null);
  const effectiveEmployeeId = isAdminOrManager ? selectedEmployeeId : employeeId ?? "";
  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i);
  const months = MONTH_NAMES.map((label, i) => ({ value: i + 1, label }));
  reactExports.useEffect(() => {
    if (!data) return;
    const originalTitle = document.title;
    const emp = data.employee;
    const mm = String(selectedMonth).padStart(2, "0");
    document.title = `Monatsrapport ${mm}.${selectedYear} ${emp.firstName} ${emp.lastName}`;
    return () => {
      document.title = originalTitle;
    };
  }, [data, selectedMonth, selectedYear]);
  const generateReport = reactExports.useCallback(async () => {
    if (!actor || isFetching || !effectiveEmployeeId) return;
    setIsLoading(true);
    setError(null);
    setData(null);
    try {
      const empId = BigInt(effectiveEmployeeId);
      const dateFrom = `${selectedYear}-${pad2$1(selectedMonth)}-01`;
      const lastDay = new Date(selectedYear, selectedMonth, 0).getDate();
      const dateTo = `${selectedYear}-${pad2$1(selectedMonth)}-${pad2$1(lastDay)}`;
      const a = toAny$2(actor);
      const [
        empRes,
        companyRes,
        timeRes,
        expenseRes,
        absenceRes,
        absTypeRes,
        projRes,
        svcRes,
        expTypeRes,
        vacRes,
        employmentsRes,
        customersRes,
        tbcRes,
        holidaysRes
      ] = await Promise.all([
        a.getMyEmployee(),
        a.getMyCompany(),
        a.listTimeEntries({ dateFrom, dateTo, employeeId: empId }),
        a.listExpenses({ dateFrom, dateTo, employeeId: empId }),
        a.listAbsences({ dateFrom, dateTo, employeeId: empId }),
        a.listAbsenceTypes(),
        a.listProjects(),
        a.listServiceTypes(),
        a.listExpenseTypes(),
        a.listVacationBalances(empId),
        a.listEmployments(empId),
        a.listCustomers(),
        (async () => {
          try {
            const res = await a.listTimeBalanceCorrections(empId);
            return res.__kind__ === "ok" ? res.ok ?? [] : [];
          } catch {
            return [];
          }
        })(),
        (async () => {
          try {
            return await a.listHolidays();
          } catch {
            return [];
          }
        })()
      ]);
      let workBalance = null;
      try {
        const wbRes = await a.getEmployeeWorkTimeBalance(
          empId,
          dateFrom,
          dateTo
        );
        if (wbRes.__kind__ === "ok" && wbRes.ok) workBalance = wbRes.ok;
      } catch {
      }
      let employee = null;
      if (isAdminOrManager && String(empId) !== String(employeeId)) {
        const emps = await a.listEmployees();
        employee = emps.find((e) => String(e.id) === effectiveEmployeeId) ?? null;
      } else {
        employee = empRes.__kind__ === "ok" ? empRes.ok ?? null : null;
      }
      if (!employee) {
        setError("Mitarbeiter nicht gefunden");
        setIsLoading(false);
        return;
      }
      const employments = employmentsRes.__kind__ === "ok" ? employmentsRes.ok ?? [] : [];
      const employment = getActiveEmploymentForDate(employments, dateTo) ?? getActiveEmploymentForDate(employments, dateFrom) ?? (employments.length > 0 ? employments[employments.length - 1] : null);
      const approvedExpenses = (expenseRes ?? []).filter(
        (e) => e.status === "approved"
      );
      setData({
        employee,
        employment,
        employments,
        timeEntries: timeRes ?? [],
        approvedExpenses,
        absences: absenceRes ?? [],
        absenceTypes: absTypeRes ?? [],
        projects: projRes ?? [],
        serviceTypes: svcRes ?? [],
        expenseTypes: expTypeRes ?? [],
        vacationBalances: vacRes.__kind__ === "ok" ? vacRes.ok ?? [] : [],
        workBalance,
        company: companyRes.__kind__ === "ok" ? companyRes.ok ?? null : null,
        customers: customersRes ?? [],
        timeBalanceCorrections: tbcRes,
        holidays: holidaysRes ?? []
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler");
    } finally {
      setIsLoading(false);
    }
  }, [
    actor,
    isFetching,
    effectiveEmployeeId,
    selectedYear,
    selectedMonth,
    isAdminOrManager,
    employeeId
  ]);
  const handlePrint = () => {
    window.print();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: PRINT_STYLES$1 }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "bg-card border border-border rounded-lg p-5 no-print",
        "data-ocid": "monatsrapport.form",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-base font-semibold text-foreground mb-4", children: "Monatsrapport generieren" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Monat" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Select,
                {
                  value: String(selectedMonth),
                  onValueChange: (v) => setSelectedMonth(Number(v)),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { "data-ocid": "monatsrapport.month_select", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: months.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(m.value), children: m.label }, m.value)) })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Jahr" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Select,
                {
                  value: String(selectedYear),
                  onValueChange: (v) => setSelectedYear(Number(v)),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { "data-ocid": "monatsrapport.year_select", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: years.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(y), children: y }, y)) })
                  ]
                }
              )
            ] }),
            isAdminOrManager && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Mitarbeiter" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Select,
                {
                  value: selectedEmployeeId,
                  onValueChange: setSelectedEmployeeId,
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { "data-ocid": "monatsrapport.employee_select", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Mitarbeiter wählen…" }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: employees.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(e.id), children: [
                      e.firstName,
                      " ",
                      e.lastName
                    ] }, String(e.id))) })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1.5 flex flex-col justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                type: "button",
                onClick: generateReport,
                disabled: isLoading || !effectiveEmployeeId,
                "data-ocid": "monatsrapport.generate_button",
                children: isLoading ? "Wird geladen…" : "Rapport generieren"
              }
            ) })
          ] })
        ]
      }
    ),
    isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: [1, 2, 3].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-20 w-full" }, i)) }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-destructive/10 border border-destructive/30 rounded-lg p-4 text-sm text-destructive", children: [
      "Fehler: ",
      error
    ] }),
    data && !isLoading && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end mb-4 no-print", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          type: "button",
          variant: "outline",
          onClick: handlePrint,
          className: "gap-2",
          "data-ocid": "monatsrapport.print_button",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-4 h-4" }),
            "Drucken / Als PDF speichern"
          ]
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          id: "monatsrapport-print",
          className: "bg-white rounded-lg border border-border",
          style: {
            fontFamily: "system-ui, sans-serif",
            fontSize: "13px",
            color: "#1a1a1a"
          },
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            ReportContent,
            {
              data,
              year: selectedYear,
              month: selectedMonth
            }
          )
        }
      )
    ] })
  ] });
}
function ReportContent({
  data,
  year,
  month
}) {
  var _a;
  const {
    employee,
    employment,
    employments,
    timeEntries,
    approvedExpenses,
    absences,
    absenceTypes,
    projects,
    serviceTypes,
    expenseTypes,
    vacationBalances,
    workBalance,
    company,
    customers,
    timeBalanceCorrections,
    holidays
  } = data;
  const monthName = MONTH_NAMES[month - 1];
  const today = (/* @__PURE__ */ new Date()).toLocaleDateString("de-CH");
  const days = daysInMonth(year, month);
  const issueDate = fmtDate$1((/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
  const projById = (id) => projects.find((p) => p.id === id);
  const projName = (id) => {
    var _a2;
    return ((_a2 = projById(id)) == null ? void 0 : _a2.name) ?? String(id);
  };
  const projCode = (id) => {
    var _a2;
    return ((_a2 = projById(id)) == null ? void 0 : _a2.code) ?? "";
  };
  const projCustomerId = (id) => {
    var _a2;
    return (_a2 = projById(id)) == null ? void 0 : _a2.customerId;
  };
  const customerName = (cid) => {
    var _a2;
    return cid ? ((_a2 = customers.find((c) => String(c.id) === String(cid))) == null ? void 0 : _a2.name) ?? String(cid) : "–";
  };
  const svcName = (id) => {
    var _a2;
    return ((_a2 = serviceTypes.find((s) => s.id === id)) == null ? void 0 : _a2.name) ?? String(id);
  };
  const expTypeName = (id) => {
    var _a2;
    return ((_a2 = expenseTypes.find((e) => e.id === id)) == null ? void 0 : _a2.name) ?? String(id);
  };
  const absTypeName = (id) => {
    var _a2;
    return ((_a2 = absenceTypes.find((a) => a.id === id)) == null ? void 0 : _a2.name) ?? String(id);
  };
  function calcHolidayIstMins(dateStr) {
    const dayHolidays = holidays.filter((h) => h.date === dateStr);
    if (dayHolidays.length === 0) return 0;
    const emp = getActiveEmploymentForDate(employments, dateStr);
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
      const weekTotal = dayVals.reduce((a, b) => a + b, 0);
      avgDailyMins = workDays > 0 ? weekTotal / workDays : 0;
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
  }
  const funktion = (employment == null ? void 0 : employment.funktion) ?? "–";
  const pensum = employment ? `${employment.pensum}%` : "–";
  const vonDate = employment ? nanosToLocalIsoDate(employment.von) : null;
  const bisDate = (employment == null ? void 0 : employment.bis) ? nanosToLocalIsoDate(employment.bis) : null;
  const anstellungDatum = vonDate ? fmtDate$1(vonDate) : "–";
  const beschaeftigungLabel = bisDate ? `${anstellungDatum} – ${fmtDate$1(bisDate)}` : `ab ${anstellungDatum}`;
  const leistungMap = /* @__PURE__ */ new Map();
  for (const t of timeEntries) {
    const cid = projCustomerId(t.projectId);
    const key = `${cid ?? ""}__${t.projectId}__${t.serviceTypeId}`;
    if (!leistungMap.has(key)) {
      leistungMap.set(key, {
        kundeName: customerName(cid),
        projektName: projName(t.projectId),
        projektCode: projCode(t.projectId),
        leistungsart: svcName(t.serviceTypeId),
        stunden: 0
      });
    }
    leistungMap.get(key).stunden += t.hours;
  }
  const leistungGroups = Array.from(leistungMap.values());
  const totalLeistungStunden = leistungGroups.reduce(
    (s, g) => s + g.stunden,
    0
  );
  const spesenProjMap = /* @__PURE__ */ new Map();
  for (const e of approvedExpenses) {
    if (e.projektId == null) continue;
    const key = String(e.projektId);
    if (!spesenProjMap.has(key)) {
      const proj = projects.find((p) => String(p.id) === String(e.projektId));
      const cid = proj == null ? void 0 : proj.customerId;
      const kName = cid ? ((_a = customers.find((c) => String(c.id) === String(cid))) == null ? void 0 : _a.name) ?? "–" : "–";
      const pName = (proj == null ? void 0 : proj.name) ?? String(e.projektId);
      spesenProjMap.set(key, {
        label: `${kName}, ${pName}`,
        reimbursement: 0
      });
    }
    spesenProjMap.get(key).reimbursement += e.reimbursementCHF;
  }
  const spesenProjGroups = Array.from(spesenProjMap.values());
  const totalSpesenReimbursement = spesenProjGroups.reduce(
    (s, g) => s + g.reimbursement,
    0
  );
  const vacationAbsenceType = absenceTypes.find(
    (t) => t.name.toLowerCase() === "ferien" && t.requiresApproval
  );
  let monthSollMins = 0;
  let monthIstMins = 0;
  let monthAbsenzMins = 0;
  let monthFerienMins = 0;
  let monthFeiertragMins = 0;
  for (const dateStr of days) {
    const emp = getActiveEmploymentForDate(employments, dateStr);
    const sollMins = emp ? getEmploymentMinutesForDate(emp, dateStr) : 0;
    monthSollMins += sollMins;
    const dayEntries = timeEntries.filter((t) => t.date === dateStr);
    let dayIst = dayEntries.reduce((s, t) => s + hoursToMinutes(t.hours), 0);
    for (const a of absences) {
      if (dateStr < a.dateFrom || dateStr > a.dateTo) continue;
      const absType = absenceTypes.find(
        (t) => String(t.id) === String(a.absenceTypeId)
      );
      const isVacation = vacationAbsenceType && a.absenceTypeId === vacationAbsenceType.id;
      if (isVacation && a.status === "approved") {
        const mins = a.ganztaetig ? emp ? getEmploymentMinutesForDate(emp, dateStr) : 0 : Number(a.dauer);
        dayIst += mins;
        monthFerienMins += mins;
      } else if ((absType == null ? void 0 : absType.compensated) && a.status === "approved") {
        const mins = a.ganztaetig ? emp ? getEmploymentMinutesForDate(emp, dateStr) : 0 : Number(a.dauer);
        dayIst += mins;
        monthAbsenzMins += mins;
      }
    }
    const hMins = calcHolidayIstMins(dateStr);
    dayIst += hMins;
    monthFeiertragMins += hMins;
    monthIstMins += dayIst;
  }
  const monthDateFrom = `${year}-${pad2$1(month)}-01`;
  const monthLastDay = new Date(year, month, 0).getDate();
  const monthDateTo = `${year}-${pad2$1(month)}-${pad2$1(monthLastDay)}`;
  const saldokorrekturMins = (() => {
    let total = 0;
    for (const c of timeBalanceCorrections) {
      const ms = Number(c.wirkungsdatum) * 1e3;
      const d = new Date(ms);
      const y = d.getFullYear();
      const mo = String(d.getMonth() + 1).padStart(2, "0");
      const da = String(d.getDate()).padStart(2, "0");
      const isoDate = `${y}-${mo}-${da}`;
      if (isoDate < monthDateFrom || isoDate > monthDateTo) continue;
      const mins = Number(c.dauer);
      if (c.typ === "gutschrift") {
        total += mins;
      } else {
        total -= mins;
      }
    }
    return total;
  })();
  const displaySollMins = workBalance ? Math.round(Number(workBalance.sollStunden)) : monthSollMins;
  const displayIstMins = workBalance ? Math.round(Number(workBalance.istStunden)) : monthIstMins;
  const displayTotalMins = displaySollMins - displayIstMins;
  const displaySaldoMins = displayIstMins - displaySollMins;
  `${year}-${pad2$1(month)}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  `${year}-${pad2$1(month)}-${pad2$1(lastDay)}`;
  const yearBalances = vacationBalances.filter(
    (vb) => Number(vb.kalenderjahr) === year
  );
  yearBalances.reduce(
    (s, vb) => s + Number(vb.dauer),
    0
  );
  const stdDayMins = (() => {
    if (!employment) return 480;
    const dayValues = [
      Number(employment.stundenMo ?? 0),
      Number(employment.stundenDi ?? 0),
      Number(employment.stundenMi ?? 0),
      Number(employment.stundenDo ?? 0),
      Number(employment.stundenFr ?? 0)
    ].filter((v) => v > 0);
    if (dayValues.length === 0) return 480;
    return Math.max(...dayValues);
  })();
  const approvedVacations = absences.filter(
    (a) => a.status === "approved" && vacationAbsenceType && a.absenceTypeId === vacationAbsenceType.id
  );
  let usedVacationDays = 0;
  for (const a of approvedVacations) {
    for (const dateStr of daysInMonth(year, month)) {
      if (dateStr < a.dateFrom || dateStr > a.dateTo) continue;
      const emp = getActiveEmploymentForDate(employments, dateStr);
      const dayMins = emp ? getEmploymentMinutesForDate(emp, dateStr) : 0;
      if (dayMins <= 0) continue;
      if (a.ganztaetig) {
        usedVacationDays += 1;
      } else {
        const refDayMins = stdDayMins > 0 ? stdDayMins : dayMins;
        usedVacationDays += Number(a.dauer) / refDayMins;
      }
    }
  }
  const totalVacationDays = (vacationBalances ?? []).filter((vb) => Number(vb.kalenderjahr) === year).reduce((s, vb) => s + Number(vb.dauer) / 100, 0);
  const remainingVacationDays = totalVacationDays - usedVacationDays;
  const sortedExpenses = [...approvedExpenses].sort(
    (a, b) => a.date < b.date ? -1 : a.date > b.date ? 1 : 0
  );
  const totalDetailReimbursement = sortedExpenses.reduce(
    (s, e) => s + e.reimbursementCHF,
    0
  );
  const spesenArtMap = /* @__PURE__ */ new Map();
  for (const e of approvedExpenses) {
    const key = String(e.expenseTypeId);
    if (!spesenArtMap.has(key))
      spesenArtMap.set(key, { name: expTypeName(e.expenseTypeId), total: 0 });
    spesenArtMap.get(key).total += e.reimbursementCHF;
  }
  const spesenAbrGroups = Array.from(spesenArtMap.values());
  const totalSpesenAbr = spesenAbrGroups.reduce((s, g) => s + g.total, 0);
  const dayRows = days.map((dateStr) => {
    const d = /* @__PURE__ */ new Date(`${dateStr}T12:00:00Z`);
    const isoDay = d.getUTCDay() === 0 ? 7 : d.getUTCDay();
    const dayLabel = d.toLocaleDateString("de-CH", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
      timeZone: "UTC"
    });
    const isWeekend = isoDay === 6 || isoDay === 7;
    const emp = getActiveEmploymentForDate(employments, dateStr);
    const sollMins = emp ? getEmploymentMinutesForDate(emp, dateStr) : 0;
    const dayEntries = timeEntries.filter((t) => t.date === dateStr);
    let istMins = dayEntries.reduce((s, t) => s + hoursToMinutes(t.hours), 0);
    for (const a of absences) {
      if (dateStr < a.dateFrom || dateStr > a.dateTo) continue;
      const absType = absenceTypes.find(
        (t) => String(t.id) === String(a.absenceTypeId)
      );
      const isVacation = vacationAbsenceType && a.absenceTypeId === vacationAbsenceType.id;
      if (!(absType == null ? void 0 : absType.compensated) && !isVacation) continue;
      if (a.status !== "approved") continue;
      if (a.ganztaetig) {
        istMins += emp ? getEmploymentMinutesForDate(emp, dateStr) : 0;
      } else {
        istMins += Number(a.dauer);
      }
    }
    istMins += calcHolidayIstMins(dateStr);
    return {
      dateStr,
      dayLabel,
      soll: sollMins,
      ist: istMins,
      tagesGleitzeit: istMins - sollMins,
      isWeekend
    };
  });
  const sortedTimeEntries = [...timeEntries].sort(
    (a, b) => a.date < b.date ? -1 : a.date > b.date ? 1 : 0
  );
  const totalZeitMins = sortedTimeEntries.reduce(
    (s, t) => s + hoursToMinutes(t.hours),
    0
  );
  const sectionTitle = (num, title) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      style: {
        backgroundColor: "#004466",
        color: "white",
        padding: "6px 12px",
        fontWeight: "bold",
        fontSize: "13px",
        marginBottom: "0"
      },
      children: [
        num,
        ". ",
        title
      ]
    }
  );
  const tableHeaderStyle = {
    backgroundColor: "#e8f0f7",
    borderBottom: "2px solid #004466",
    padding: "5px 8px",
    textAlign: "left",
    fontSize: "11px",
    fontWeight: "600",
    color: "#004466",
    whiteSpace: "nowrap"
  };
  const tdStyle2 = {
    padding: "4px 8px",
    borderBottom: "1px solid #eee",
    fontSize: "12px"
  };
  const tdRightStyle2 = {
    ...tdStyle2,
    textAlign: "right",
    fontVariantNumeric: "tabular-nums"
  };
  const footerTdStyle2 = {
    ...tdStyle2,
    backgroundColor: "#e8f0f7",
    fontWeight: "bold",
    borderTop: "2px solid #004466"
  };
  const footerTdRightStyle2 = {
    ...tdRightStyle2,
    backgroundColor: "#e8f0f7",
    fontWeight: "bold",
    borderTop: "2px solid #004466"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "24px", maxWidth: "900px", margin: "0 auto" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "20px"
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            (company == null ? void 0 : company.logoUrl) && company.logoUrl.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
              "img",
              {
                src: company.logoUrl,
                alt: "Logo",
                style: {
                  height: "39px",
                  maxWidth: "126px",
                  marginBottom: "10px",
                  display: "block",
                  objectFit: "contain",
                  printColorAdjust: "exact"
                }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                style: { fontWeight: "bold", fontSize: "20px", color: "#004466" },
                children: (company == null ? void 0 : company.name) ?? "Firma"
              }
            ),
            (company == null ? void 0 : company.address) && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "12px", color: "#666", marginTop: "2px" }, children: company.address })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "right" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                style: { fontWeight: "bold", fontSize: "16px", color: "#004466" },
                children: "Monatsrapport"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "13px", color: "#333", marginTop: "4px" }, children: [
              monthName,
              " ",
              year
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "11px", color: "#888", marginTop: "2px" }, children: [
              "Ausgestellt am: ",
              issueDate
            ] })
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        style: {
          border: "1px solid #ccd9e3",
          borderRadius: "4px",
          padding: "12px 16px",
          marginBottom: "20px",
          backgroundColor: "#f8fbfd"
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            style: {
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "8px"
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#666", fontSize: "11px" }, children: "Mitarbeiter" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
                  employee.firstName,
                  " ",
                  employee.lastName
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#666", fontSize: "11px" }, children: "E-Mail" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: employee.email })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#666", fontSize: "11px" }, children: "Funktion" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: funktion })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#666", fontSize: "11px" }, children: "Pensum" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: pensum })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#666", fontSize: "11px" }, children: "Beschäftigung" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: beschaeftigungLabel })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#666", fontSize: "11px" }, children: "Berichtsmonat" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
                  monthName,
                  " ",
                  year
                ] })
              ] })
            ]
          }
        )
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginBottom: "20px" }, className: "report-section", children: [
      sectionTitle("1", "Leistungen (Zeiterfassungen)"),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "table",
        {
          style: {
            width: "100%",
            borderCollapse: "collapse",
            border: "1px solid #ccd9e3"
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: tableHeaderStyle, children: "Kunde" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: tableHeaderStyle, children: "Projekt" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: tableHeaderStyle, children: "Leistungsart" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { ...tableHeaderStyle, textAlign: "right" }, children: "Stunden" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: leistungGroups.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "td",
              {
                colSpan: 4,
                style: {
                  ...tdStyle2,
                  color: "#888",
                  textAlign: "center",
                  padding: "12px"
                },
                children: "Keine Zeiteinträge"
              }
            ) }) : leistungGroups.map((g) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: tdStyle2, children: g.kundeName }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { style: tdStyle2, children: [
                g.projektCode ? `[${g.projektCode}] ` : "",
                g.projektName
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: tdStyle2, children: g.leistungsart }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: tdRightStyle2, children: formatHours(g.stunden) })
            ] }, `${g.kundeName}__${g.projektName}__${g.leistungsart}`)) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("tfoot", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 3, style: footerTdStyle2, children: "Total" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: footerTdRightStyle2, children: formatHours(totalLeistungStunden) })
            ] }) })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginBottom: "20px" }, className: "report-section", children: [
      sectionTitle("2", "Spesen"),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "table",
        {
          style: {
            width: "100%",
            borderCollapse: "collapse",
            border: "1px solid #ccd9e3"
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: tableHeaderStyle, children: "Kunde, Projekt" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { ...tableHeaderStyle, textAlign: "right" }, children: "Rückerstattung CHF" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: spesenProjGroups.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "td",
              {
                colSpan: 2,
                style: {
                  ...tdStyle2,
                  color: "#888",
                  textAlign: "center",
                  padding: "12px"
                },
                children: "Keine genehmigten Spesen"
              }
            ) }) : spesenProjGroups.map((g) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: tdStyle2, children: g.label }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: tdRightStyle2, children: g.reimbursement > 0 ? fmtCHF$1(g.reimbursement) : "–" })
            ] }, g.label)) }),
            spesenProjGroups.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tfoot", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: footerTdStyle2, children: "Total" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: footerTdRightStyle2, children: totalSpesenReimbursement > 0 ? fmtCHF$1(totalSpesenReimbursement) : "–" })
            ] }) })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginBottom: "4px" }, className: "report-section", children: [
      sectionTitle("3", "Gleitzeitsaldo Monat"),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "table",
        {
          style: {
            width: "100%",
            borderCollapse: "collapse",
            border: "1px solid #ccd9e3"
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: tableHeaderStyle, children: "Position" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { ...tableHeaderStyle, textAlign: "right" }, children: "hh:mm" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: tdStyle2, children: "Soll-Zeit" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: tdRightStyle2, children: minutesToDisplay(displaySollMins) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: tdStyle2, children: "Ist-Zeit" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: tdRightStyle2, children: minutesToDisplay(displayIstMins) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "td",
                  {
                    style: {
                      ...tdStyle2,
                      paddingLeft: "24px",
                      color: "#666",
                      fontSize: "11px"
                    },
                    children: "davon Saldokorrektur"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { ...tdRightStyle2, color: "#666", fontSize: "11px" }, children: saldokorrekturMins !== 0 ? minutesToDisplaySigned(saldokorrekturMins) : "0:00" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "td",
                  {
                    style: {
                      ...tdStyle2,
                      paddingLeft: "24px",
                      color: "#666",
                      fontSize: "11px"
                    },
                    children: "davon Abwesenheiten"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { ...tdRightStyle2, color: "#666", fontSize: "11px" }, children: minutesToDisplay(monthAbsenzMins) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "td",
                  {
                    style: {
                      ...tdStyle2,
                      paddingLeft: "24px",
                      color: "#666",
                      fontSize: "11px"
                    },
                    children: "davon Ferien"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { ...tdRightStyle2, color: "#666", fontSize: "11px" }, children: minutesToDisplay(monthFerienMins) })
              ] }),
              monthFeiertragMins > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "td",
                  {
                    style: {
                      ...tdStyle2,
                      paddingLeft: "24px",
                      color: "#666",
                      fontSize: "11px"
                    },
                    children: "davon Feiertage"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "td",
                  {
                    style: { ...tdRightStyle2, color: "#666", fontSize: "11px" },
                    children: minutesToDisplay(monthFeiertragMins)
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { backgroundColor: "#e8f0f7" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "td",
                  {
                    style: {
                      ...tdStyle2,
                      fontWeight: "bold",
                      borderTop: "2px solid #004466"
                    },
                    children: "Total"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "td",
                  {
                    style: {
                      ...tdRightStyle2,
                      fontWeight: "bold",
                      borderTop: "2px solid #004466",
                      color: displayTotalMins >= displaySollMins ? "#155724" : "#c0392b"
                    },
                    children: minutesToDisplay(displayTotalMins)
                  }
                )
              ] })
            ] })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        style: {
          border: "1px solid #ccd9e3",
          borderTop: "none",
          padding: "8px 12px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "4px",
          backgroundColor: "#f8fbfd"
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "12px", fontWeight: "600", color: "#004466" }, children: [
            "Gleitzeitsaldo per Ende ",
            monthName,
            " ",
            year
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              style: {
                fontSize: "14px",
                fontWeight: "bold",
                color: displaySaldoMins >= 0 ? "#155724" : "#c0392b"
              },
              children: minutesToDisplaySigned(displaySaldoMins)
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        style: {
          border: "1px solid #ccd9e3",
          borderTop: "none",
          padding: "8px 12px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          backgroundColor: "#f8fbfd"
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "12px", fontWeight: "600", color: "#004466" }, children: [
            "Feriensaldo per Ende ",
            monthName,
            " ",
            year
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "span",
            {
              style: {
                fontSize: "14px",
                fontWeight: "bold",
                color: remainingVacationDays >= 0 ? "#155724" : "#c0392b"
              },
              children: [
                remainingVacationDays.toFixed(1),
                " Tage"
              ]
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginBottom: "20px" }, className: "report-section", children: [
      sectionTitle("4", "Spesen im Detail"),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "table",
        {
          style: {
            width: "100%",
            borderCollapse: "collapse",
            border: "1px solid #ccd9e3"
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: tableHeaderStyle, children: "Datum Beleg" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: tableHeaderStyle, children: "Spesenart" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: tableHeaderStyle, children: "Beschreibung" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { ...tableHeaderStyle, textAlign: "right" }, children: "Rückerstattung CHF" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: sortedExpenses.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "td",
              {
                colSpan: 4,
                style: {
                  ...tdStyle2,
                  color: "#888",
                  textAlign: "center",
                  padding: "12px"
                },
                children: "Keine genehmigten Spesen"
              }
            ) }) : sortedExpenses.map((e, idx) => {
              const belegNr = String(idx + 1).padStart(4, "0");
              const artName = expTypeName(e.expenseTypeId);
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { style: { ...tdStyle2, whiteSpace: "nowrap" }, children: [
                  fmtDate$1(e.date),
                  " Nr.",
                  belegNr
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: tdStyle2, children: artName }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { ...tdStyle2, color: "#555" }, children: e.description || "–" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: tdRightStyle2, children: e.reimbursementCHF > 0 ? fmtCHF$1(e.reimbursementCHF) : "–" })
              ] }, String(e.id));
            }) }),
            sortedExpenses.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tfoot", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 3, style: footerTdStyle2, children: "Total" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: footerTdRightStyle2, children: totalDetailReimbursement > 0 ? fmtCHF$1(totalDetailReimbursement) : "–" })
            ] }) })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginBottom: "20px" }, className: "report-section", children: [
      sectionTitle("5", "Spesenabrechnung"),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "table",
        {
          style: {
            width: "100%",
            borderCollapse: "collapse",
            border: "1px solid #ccd9e3"
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: tableHeaderStyle, children: "Spesenart" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { ...tableHeaderStyle, textAlign: "right" }, children: "Total Rückerstattung CHF" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: spesenAbrGroups.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "td",
              {
                colSpan: 2,
                style: {
                  ...tdStyle2,
                  color: "#888",
                  textAlign: "center",
                  padding: "12px"
                },
                children: "Keine genehmigten Spesen"
              }
            ) }) : spesenAbrGroups.map((g) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: tdStyle2, children: g.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: tdRightStyle2, children: g.total > 0 ? fmtCHF$1(g.total) : "–" })
            ] }, g.name)) }),
            spesenAbrGroups.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tfoot", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: footerTdStyle2, children: "Total" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: footerTdRightStyle2, children: totalSpesenAbr > 0 ? fmtCHF$1(totalSpesenAbr) : "–" })
            ] }) })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginBottom: "20px" }, className: "report-section", children: [
      sectionTitle("6", "Gleitzeit pro Tag"),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "table",
        {
          style: {
            width: "100%",
            borderCollapse: "collapse",
            border: "1px solid #ccd9e3"
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: tableHeaderStyle, children: "Tag" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { ...tableHeaderStyle, textAlign: "right" }, children: "Soll" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { ...tableHeaderStyle, textAlign: "right" }, children: "Ist" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { ...tableHeaderStyle, textAlign: "right" }, children: "Tages-Gleitzeit" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: tableHeaderStyle, children: "Bemerkung" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: dayRows.map((row) => {
              const bgColor = row.isWeekend ? "#f5f5f5" : "white";
              const textColor = row.isWeekend ? "#999" : "#1a1a1a";
              const dayAbsences = absences.filter(
                (a) => a.status === "approved" && row.dateStr >= a.dateFrom && row.dateStr <= a.dateTo
              );
              const absenceNote = dayAbsences.map((a) => {
                const name = absTypeName(a.absenceTypeId);
                const mins = a.ganztaetig ? getActiveEmploymentForDate(employments, row.dateStr) ? getEmploymentMinutesForDate(
                  getActiveEmploymentForDate(employments, row.dateStr),
                  row.dateStr
                ) : 0 : Number(a.dauer);
                return mins > 0 ? `${name} ${minutesToHHMM$1(mins)}` : name;
              }).join(", ");
              const dayHolidays = holidays.filter(
                (h) => h.date === row.dateStr
              );
              const holidayNote = dayHolidays.map((h) => {
                const hMins = calcHolidayIstMins(row.dateStr);
                return hMins > 0 ? `${h.name} ${minutesToHHMM$1(hMins)}` : h.name;
              }).join(", ");
              const allNotes = [absenceNote, holidayNote].filter(Boolean).join(", ");
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { backgroundColor: bgColor }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { ...tdStyle2, color: textColor }, children: row.dayLabel }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { ...tdRightStyle2, color: textColor }, children: row.soll > 0 ? minutesToDisplay(row.soll) : "–" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { ...tdRightStyle2, color: textColor }, children: row.ist > 0 ? minutesToDisplay(row.ist) : row.soll > 0 ? "00:00" : "–" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "td",
                  {
                    style: {
                      ...tdRightStyle2,
                      color: row.tagesGleitzeit < 0 ? "#c0392b" : row.tagesGleitzeit > 0 ? "#155724" : textColor,
                      fontWeight: row.soll > 0 ? "600" : "normal"
                    },
                    children: row.soll > 0 ? row.tagesGleitzeit > 0 ? `+${minutesToDisplay(row.tagesGleitzeit)}` : minutesToDisplay(row.tagesGleitzeit) : "–"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { ...tdStyle2, color: "#666", fontSize: "11px" }, children: allNotes || "" })
              ] }, row.dateStr);
            }) })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginBottom: "20px" }, className: "report-section", children: [
      sectionTitle("7", "Zeiterfassung"),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "table",
        {
          style: {
            width: "100%",
            borderCollapse: "collapse",
            border: "1px solid #ccd9e3"
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { ...tableHeaderStyle, whiteSpace: "nowrap" }, children: "Datum" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: tableHeaderStyle, children: "Tätigkeit" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "th",
                {
                  style: {
                    ...tableHeaderStyle,
                    textAlign: "right",
                    whiteSpace: "nowrap"
                  },
                  children: "Zeit / Dauer"
                }
              )
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: sortedTimeEntries.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "td",
              {
                colSpan: 3,
                style: {
                  ...tdStyle2,
                  color: "#888",
                  textAlign: "center",
                  padding: "12px"
                },
                children: "Keine Zeiterfassungen"
              }
            ) }) : sortedTimeEntries.map((t) => {
              const proj = projById(t.projectId);
              const cid = proj == null ? void 0 : proj.customerId;
              const cName = customerName(cid);
              const pName = (proj == null ? void 0 : proj.name) ?? String(t.projectId);
              const sName = svcName(t.serviceTypeId);
              const desc = t.description ? ` – ${t.description}` : "";
              const taetigkeit = [cName !== "–" ? cName : null, pName, sName].filter(Boolean).join(" / ") + desc;
              const isZeitBlock = (proj == null ? void 0 : proj.erfassungsart) === "zeitBlock" && t.von && t.bis;
              let zeitDisplay;
              if (isZeitBlock) {
                const [vonH, vonM] = t.von.split(":").map(Number);
                const [bisH, bisM] = t.bis.split(":").map(Number);
                const durationMins = bisH * 60 + bisM - (vonH * 60 + vonM);
                zeitDisplay = `${t.von} – ${t.bis} / ${minutesToHHMM$1(durationMins > 0 ? durationMins : 0)}`;
              } else {
                zeitDisplay = totalHoursDisplay(hoursToMinutes(t.hours));
              }
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { ...tdStyle2, whiteSpace: "nowrap" }, children: fmtDate$1(t.date) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { ...tdStyle2, maxWidth: "400px" }, children: taetigkeit }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { ...tdRightStyle2, whiteSpace: "nowrap" }, children: zeitDisplay })
              ] }, String(t.id));
            }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("tfoot", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 2, style: footerTdStyle2, children: "Total geleistete Stunden" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: footerTdRightStyle2, children: totalHoursDisplay(totalZeitMins) })
            ] }) })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        style: {
          borderTop: "1px solid #ccd9e3",
          paddingTop: "12px",
          marginTop: "12px",
          color: "#888",
          fontSize: "11px",
          display: "flex",
          justifyContent: "space-between"
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            (company == null ? void 0 : company.name) ?? "",
            " – Vertraulich"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "Erstellt am ",
            today
          ] })
        ]
      }
    )
  ] });
}
const toAny$1 = (a) => a;
function pad2(n) {
  return String(n).padStart(2, "0");
}
function fmtDate(iso) {
  if (!iso) return "–";
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}
function fmtDateRange(from, to) {
  return `${fmtDate(from)} – ${fmtDate(to)}`;
}
function todayIso() {
  return (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
}
function todayDisplay() {
  return fmtDate(todayIso());
}
function firstDayOfMonthIso() {
  const d = /* @__PURE__ */ new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-01`;
}
function hoursToHHMM(hours) {
  return formatHours(hours);
}
function minutesToHHMM(totalMins) {
  if (totalMins <= 0) return "00:00";
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  return `${pad2(h)}:${pad2(m)}`;
}
function vonBisDuration(von, bis) {
  const [vh, vm] = von.split(":").map(Number);
  const [bh, bm] = bis.split(":").map(Number);
  const mins = bh * 60 + bm - (vh * 60 + vm);
  if (mins <= 0) return "00:00";
  return `${pad2(Math.floor(mins / 60))}:${pad2(mins % 60)}`;
}
function fmtCHF(value) {
  const [intPart, decPart] = value.toFixed(2).split(".");
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, "'");
  return `${grouped}.${decPart}`;
}
function fmtBurndown(aufgewendet, kostendach) {
  if (kostendach === 0) return "—";
  return `${(aufgewendet / kostendach * 100).toFixed(2)} %`;
}
const PRINT_STYLES = `
@media print {
  .no-print { display: none !important; }
  .fixed, [style*="position: fixed"], [style*="position:fixed"] { display: none !important; }
  nav, aside, header { display: none !important; }
  #projektauswertung-print {
    position: absolute !important;
    left: 0 !important;
    top: 0 !important;
    width: 100% !important;
    height: auto !important;
    overflow: visible !important;
    background: white !important;
    padding: 0 !important;
    margin: 0 !important;
  }
  body {
    background: white !important;
    margin: 0 !important;
    padding: 0 !important;
  }
  #projektauswertung-print table { page-break-inside: auto; }
  #projektauswertung-print tr { page-break-inside: avoid; page-break-after: auto; }
  #projektauswertung-print .report-section { page-break-inside: avoid; }
  #projektauswertung-print .page-break { page-break-before: always; }
  #projektauswertung-print thead { display: table-header-group; }
  img { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
}
@page { margin: 15mm; size: A4 portrait; }
`;
const thStyle = {
  backgroundColor: "#006066",
  color: "white",
  padding: "5px 8px",
  textAlign: "left",
  fontSize: "11px",
  fontWeight: "600",
  whiteSpace: "nowrap",
  printColorAdjust: "exact"
};
const thRightStyle = { ...thStyle, textAlign: "right" };
const tdStyle = {
  padding: "4px 8px",
  borderBottom: "1px solid #eee",
  fontSize: "12px"
};
const tdRightStyle = {
  ...tdStyle,
  textAlign: "right",
  fontVariantNumeric: "tabular-nums"
};
const footerTdStyle = {
  ...tdStyle,
  backgroundColor: "#e8f0f0",
  fontWeight: "bold",
  borderTop: "2px solid #006066"
};
const footerTdRightStyle = {
  ...tdRightStyle,
  backgroundColor: "#e8f0f0",
  fontWeight: "bold",
  borderTop: "2px solid #006066"
};
const sectionTitleStyle = {
  backgroundColor: "#006066",
  color: "white",
  padding: "6px 12px",
  fontWeight: "bold",
  fontSize: "13px",
  marginBottom: "0",
  printColorAdjust: "exact"
};
const subTitleStyle = {
  fontWeight: "bold",
  fontSize: "12px",
  padding: "5px 8px",
  backgroundColor: "#e8f0f0",
  borderLeft: "3px solid #006066",
  marginBottom: "0"
};
const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  border: "1px solid #ccd9d9"
};
function ProjektauswertungView({
  employees,
  allProjects,
  projectMemberships,
  isAdminOrManager
}) {
  const { actor, isFetching: actorFetching } = useActor(createActor);
  const { isAuthenticated, employeeName } = useAuth();
  const [selectedProjectId, setSelectedProjectId] = reactExports.useState("");
  const [dateFrom, setDateFrom] = reactExports.useState(firstDayOfMonthIso());
  const [dateTo, setDateTo] = reactExports.useState(todayIso());
  const [showBudget, setShowBudget] = reactExports.useState(false);
  const [isLoading, setIsLoading] = reactExports.useState(false);
  const [error, setError] = reactExports.useState(null);
  const [reportData, setReportData] = reactExports.useState(null);
  const [budgetReportData, setBudgetReportData] = reactExports.useState(null);
  const visibleProjects = isAdminOrManager ? allProjects.filter((p) => p.active) : allProjects.filter(
    (p) => p.active && projectMemberships.has(String(p.id))
  );
  const handleGeneratePreview = async () => {
    if (!actor || actorFetching || !isAuthenticated || !selectedProjectId)
      return;
    setIsLoading(true);
    setError(null);
    setReportData(null);
    setBudgetReportData(null);
    try {
      const a = toAny$1(actor);
      const projId = BigInt(selectedProjectId);
      const [reportRes, companyRes, customersRes, svcRes, allEmpsRes] = await Promise.all([
        a.getReportData({
          dateFrom,
          dateTo,
          projectId: projId
        }),
        a.getMyCompany(),
        a.listCustomers(),
        a.listServiceTypes(),
        isAdminOrManager ? a.listEmployees() : Promise.resolve(employees)
      ]);
      const project = allProjects.find((p) => String(p.id) === selectedProjectId) ?? null;
      const customer = project && customersRes ? customersRes.find(
        (c) => String(c.id) === String(project.customerId)
      ) ?? null : null;
      const company = companyRes.__kind__ === "ok" ? companyRes.ok ?? null : null;
      const timeEntries = (reportRes == null ? void 0 : reportRes.entries) ?? [];
      const resolvedEmployees = allEmpsRes ?? employees;
      const resolvedServiceTypes = svcRes ?? [];
      if (showBudget) {
        let budgetReport;
        try {
          const res = await actor.getProjectBudgetReport(
            projId,
            dateFrom,
            dateTo
          );
          if (res.__kind__ === "ok") {
            budgetReport = {
              ...res.ok,
              employeeReports: res.ok.employeeReports.map((er) => ({
                ...er,
                timeEntries: timeEntries.filter(
                  (t) => String(t.employeeId) === String(er.employeeId)
                )
              }))
            };
          } else {
            budgetReport = buildMockBudgetReport(
              project,
              customer,
              timeEntries,
              resolvedEmployees,
              resolvedServiceTypes
            );
          }
        } catch {
          budgetReport = buildMockBudgetReport(
            project,
            customer,
            timeEntries,
            resolvedEmployees,
            resolvedServiceTypes
          );
        }
        setBudgetReportData({
          budgetReport,
          company,
          customer,
          project,
          timeEntries,
          employees: resolvedEmployees,
          serviceTypes: resolvedServiceTypes,
          dateFrom,
          dateTo,
          currentUserName: employeeName ?? "–"
        });
      } else {
        setReportData({
          timeEntries,
          company,
          customer,
          project,
          employees: resolvedEmployees,
          serviceTypes: resolvedServiceTypes,
          dateFrom,
          dateTo,
          currentUserName: employeeName ?? "–"
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler");
    } finally {
      setIsLoading(false);
    }
  };
  const hasReport = showBudget ? !!budgetReportData : !!reportData;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: PRINT_STYLES }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "bg-card border border-border rounded-lg p-5 no-print",
        "data-ocid": "projektauswertung.form",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-base font-semibold text-foreground mb-4", children: "Projektauswertung generieren" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5 lg:col-span-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "pa-project", children: "Projekt" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "select",
                {
                  id: "pa-project",
                  "data-ocid": "projektauswertung.project_select",
                  value: selectedProjectId,
                  onChange: (e) => setSelectedProjectId(e.target.value),
                  className: "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Projekt wählen…" }),
                    visibleProjects.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: String(p.id), children: [
                      p.name,
                      p.code ? ` [${p.code}]` : ""
                    ] }, String(p.id)))
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "pa-date-from", children: "Zeitraum von" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  id: "pa-date-from",
                  "data-ocid": "projektauswertung.date_from",
                  type: "date",
                  value: dateFrom,
                  onChange: (e) => setDateFrom(e.target.value),
                  className: "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "pa-date-to", children: "Zeitraum bis" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  id: "pa-date-to",
                  "data-ocid": "projektauswertung.date_to",
                  type: "date",
                  value: dateTo,
                  onChange: (e) => setDateTo(e.target.value),
                  className: "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "checkbox",
                id: "pa-budget",
                "data-ocid": "projektauswertung.budget_checkbox",
                checked: showBudget,
                onChange: (e) => setShowBudget(e.target.checked),
                className: "h-4 w-4 cursor-pointer accent-[#006066]"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "label",
              {
                htmlFor: "pa-budget",
                className: "text-sm text-foreground cursor-pointer select-none",
                children: "Projektauswertung mit Budgetvergleich"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                type: "button",
                "data-ocid": "projektauswertung.preview_button",
                onClick: handleGeneratePreview,
                disabled: isLoading || !selectedProjectId,
                style: { backgroundColor: "#006066", color: "white" },
                className: "gap-2",
                children: isLoading ? "Wird geladen…" : "Vorschau generieren"
              }
            ),
            hasReport && !isLoading && /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                type: "button",
                variant: "outline",
                "data-ocid": "projektauswertung.print_button",
                onClick: () => window.print(),
                className: "gap-2",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-4 h-4" }),
                  "Drucken / PDF exportieren"
                ]
              }
            )
          ] })
        ]
      }
    ),
    isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: [1, 2, 3].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-20 w-full" }, i)) }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-destructive/10 border border-destructive/30 rounded-lg p-4 text-sm text-destructive", children: [
      "Fehler beim Laden der Auswertung: ",
      error
    ] }),
    !isLoading && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      showBudget && budgetReportData && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          id: "projektauswertung-print",
          className: "bg-white rounded-lg border border-border",
          style: {
            fontFamily: "system-ui, sans-serif",
            fontSize: "13px",
            color: "#1a1a1a"
          },
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(BudgetReportContent, { data: budgetReportData })
        }
      ),
      !showBudget && reportData && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          id: "projektauswertung-print",
          className: "bg-white rounded-lg border border-border",
          style: {
            fontFamily: "system-ui, sans-serif",
            fontSize: "13px",
            color: "#1a1a1a"
          },
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(StandardReportContent, { data: reportData })
        }
      )
    ] }),
    !hasReport && !isLoading && !error && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        "data-ocid": "projektauswertung.empty_state",
        className: "flex flex-col items-center justify-center py-16 text-muted-foreground gap-3",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16 h-16 rounded-full bg-muted/60 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-8 h-8 opacity-50" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: "Projekt und Zeitraum wählen, dann «Vorschau generieren» klicken" })
        ]
      }
    )
  ] });
}
function buildMockBudgetReport(project, customer, timeEntries, resolvedEmployees, resolvedServiceTypes) {
  const empName = (id) => {
    const e = resolvedEmployees.find((x) => String(x.id) === String(id));
    return e ? `${e.firstName} ${e.lastName}` : String(id);
  };
  const svcName = (id) => {
    var _a;
    return ((_a = resolvedServiceTypes.find((s) => String(s.id) === String(id))) == null ? void 0 : _a.name) ?? "–";
  };
  const byEmp = /* @__PURE__ */ new Map();
  for (const t of timeEntries) {
    const ek = String(t.employeeId);
    if (!byEmp.has(ek)) byEmp.set(ek, { entries: [], svcMap: /* @__PURE__ */ new Map() });
    const g = byEmp.get(ek);
    g.entries.push(t);
    const sk = String(t.serviceTypeId);
    g.svcMap.set(sk, (g.svcMap.get(sk) ?? 0) + t.hours);
  }
  const employeeReports = Array.from(
    byEmp.entries()
  ).map(([eid, { entries, svcMap }]) => {
    const totalHours2 = entries.reduce((s, t) => s + t.hours, 0);
    const serviceTypeReports = Array.from(
      svcMap.entries()
    ).map(([sid, hours]) => ({
      serviceTypeId: BigInt(sid),
      serviceTypeName: svcName(BigInt(sid)),
      kostendachCHF: 0,
      aufgewendetCHF: 0,
      aufgewendeteStunden: hours
    }));
    return {
      employeeId: BigInt(eid),
      employeeName: empName(BigInt(eid)),
      kostendachCHF: 0,
      aufgewendetCHF: 0,
      aufgewendeteStunden: totalHours2,
      serviceTypeReports,
      timeEntries: entries
    };
  });
  const totalHours = timeEntries.reduce((s, t) => s + t.hours, 0);
  return {
    projectId: (project == null ? void 0 : project.id) ?? BigInt(0),
    projectName: (project == null ? void 0 : project.name) ?? "–",
    customerName: (customer == null ? void 0 : customer.name) ?? "–",
    totalKostendachCHF: 0,
    totalAufgewendetCHF: 0,
    totalStunden: totalHours,
    employeeReports
  };
}
function BudgetReportHeader({
  company,
  customerName,
  projectName,
  dateFrom,
  dateTo
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "14px"
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            (company == null ? void 0 : company.logoUrl) && company.logoUrl.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
              "img",
              {
                src: company.logoUrl,
                alt: "Logo",
                style: {
                  height: "36px",
                  maxWidth: "120px",
                  marginBottom: "6px",
                  display: "block",
                  objectFit: "contain",
                  printColorAdjust: "exact"
                }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                style: { fontWeight: "bold", fontSize: "17px", color: "#006066" },
                children: (company == null ? void 0 : company.name) ?? "Firma"
              }
            ),
            (company == null ? void 0 : company.address) && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "11px", color: "#666", marginTop: "2px" }, children: company.address })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "right" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                style: { fontWeight: "bold", fontSize: "14px", color: "#006066" },
                children: "iReport Onchain"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "11px", color: "#888", marginTop: "2px" }, children: "Projektauswertung" })
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginBottom: "10px" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontWeight: "bold", fontSize: "15px", color: "#1a1a1a" }, children: [
        "Projektauswertung ",
        customerName,
        " – ",
        projectName
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          style: {
            fontSize: "11px",
            color: "#444",
            marginTop: "4px",
            lineHeight: "1.6"
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              "Zeitraum: ",
              fmtDateRange(dateFrom, dateTo)
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              "Ausgestellt am: ",
              todayDisplay()
            ] })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "hr",
      {
        style: {
          border: "none",
          borderTop: "2px solid #006066",
          marginBottom: "18px"
        }
      }
    )
  ] });
}
function BudgetReportFooter({ company }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      style: {
        borderTop: "1px solid #ccd9d9",
        paddingTop: "10px",
        marginTop: "24px",
        color: "#888",
        fontSize: "11px",
        display: "flex",
        justifyContent: "space-between"
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          (company == null ? void 0 : company.name) ?? "",
          (company == null ? void 0 : company.address) ? ` | ${company.address}` : ""
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          "Erstellt am ",
          todayDisplay()
        ] })
      ]
    }
  );
}
function BudgetTable({
  rows,
  labelHeader
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: tableStyle, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: thStyle, children: labelHeader }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: thRightStyle, children: "Kostendach in CHF" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: thRightStyle, children: "Aufgewendet in CHF" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: thRightStyle, children: "Burndown in %" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: thRightStyle, children: "Aufgewendete Stunden" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: rows.filter((r) => !r.isTotal).map((row, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "tr",
      {
        style: { backgroundColor: idx % 2 === 0 ? "white" : "#f7fafa" },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: tdStyle, children: row.label }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: tdRightStyle, children: fmtCHF(row.kostendach) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: tdRightStyle, children: fmtCHF(row.aufgewendet) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: tdRightStyle, children: fmtBurndown(row.aufgewendet, row.kostendach) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: tdRightStyle, children: hoursToHHMM(row.stunden) })
        ]
      },
      `${row.label}-${idx}`
    )) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("tfoot", { children: rows.filter((r) => r.isTotal).map((row) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: footerTdStyle, children: row.label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: footerTdRightStyle, children: fmtCHF(row.kostendach) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: footerTdRightStyle, children: fmtCHF(row.aufgewendet) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: footerTdRightStyle, children: fmtBurndown(row.aufgewendet, row.kostendach) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: footerTdRightStyle, children: hoursToHHMM(row.stunden) })
    ] }, "total")) })
  ] });
}
function BudgetReportContent({ data }) {
  const {
    budgetReport,
    company,
    customer,
    project,
    timeEntries,
    serviceTypes,
    dateFrom,
    dateTo,
    currentUserName
  } = data;
  const customerName = (customer == null ? void 0 : customer.name) ?? budgetReport.customerName ?? "–";
  const projectName = (project == null ? void 0 : project.name) ?? budgetReport.projectName ?? "–";
  const svcName = (id) => {
    var _a;
    return ((_a = serviceTypes.find((s) => String(s.id) === String(id))) == null ? void 0 : _a.name) ?? "–";
  };
  const sortedEntries = [...timeEntries].sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? -1 : 1;
    if (a.von && b.von) return a.von < b.von ? -1 : 1;
    return 0;
  });
  const entriesByEmp = /* @__PURE__ */ new Map();
  for (const t of sortedEntries) {
    const k = String(t.employeeId);
    if (!entriesByEmp.has(k)) entriesByEmp.set(k, []);
    entriesByEmp.get(k).push(t);
  }
  const isZeitBlock = (project == null ? void 0 : project.erfassungsart) === "zeitBlock";
  const sek1Rows = [
    {
      label: projectName,
      kostendach: budgetReport.totalKostendachCHF,
      aufgewendet: budgetReport.totalAufgewendetCHF,
      stunden: budgetReport.totalStunden
    },
    {
      label: "Total",
      kostendach: budgetReport.totalKostendachCHF,
      aufgewendet: budgetReport.totalAufgewendetCHF,
      stunden: budgetReport.totalStunden,
      isTotal: true
    }
  ];
  const totalKostendach = budgetReport.employeeReports.reduce(
    (s, e) => s + e.kostendachCHF,
    0
  );
  const totalAufgewendet = budgetReport.employeeReports.reduce(
    (s, e) => s + e.aufgewendetCHF,
    0
  );
  const totalStunden = budgetReport.employeeReports.reduce(
    (s, e) => s + e.aufgewendeteStunden,
    0
  );
  const sek2Rows = [
    ...budgetReport.employeeReports.map((er) => ({
      label: er.employeeName,
      kostendach: er.kostendachCHF,
      aufgewendet: er.aufgewendetCHF,
      stunden: er.aufgewendeteStunden
    })),
    {
      label: "Total",
      kostendach: totalKostendach,
      aufgewendet: totalAufgewendet,
      stunden: totalStunden,
      isTotal: true
    }
  ];
  if (timeEntries.length === 0 && budgetReport.employeeReports.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "24px", maxWidth: "900px", margin: "0 auto" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        BudgetReportHeader,
        {
          company,
          customerName,
          projectName,
          dateFrom,
          dateTo
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          style: {
            textAlign: "center",
            padding: "40px",
            color: "#888",
            fontSize: "14px"
          },
          children: "Keine Zeiterfassungen für den gewählten Zeitraum und das gewählte Projekt."
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(BudgetReportFooter, { company })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "24px", maxWidth: "900px", margin: "0 auto" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      BudgetReportHeader,
      {
        company,
        customerName,
        projectName,
        dateFrom,
        dateTo
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginBottom: "20px" }, className: "report-section", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: sectionTitleStyle, children: "Gesamttotal" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(BudgetTable, { rows: sek1Rows, labelHeader: "Projekt" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginBottom: "20px" }, className: "report-section", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: sectionTitleStyle, children: "Gesamttotal pro Mitarbeiter" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(BudgetTable, { rows: sek2Rows, labelHeader: "Mitarbeiter" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "page-break" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { marginBottom: "4px" }, className: "report-section", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: sectionTitleStyle, children: "Mitarbeiter-Übersicht" }) }),
    budgetReport.employeeReports.map((er) => {
      const empRows = [
        ...er.serviceTypeReports.map((st) => ({
          label: st.serviceTypeName,
          kostendach: st.kostendachCHF,
          aufgewendet: st.aufgewendetCHF,
          stunden: st.aufgewendeteStunden
        })),
        {
          label: `Total ${er.employeeName}`,
          kostendach: er.kostendachCHF,
          aufgewendet: er.aufgewendetCHF,
          stunden: er.aufgewendeteStunden,
          isTotal: true
        }
      ];
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          style: { marginBottom: "16px" },
          className: "report-section",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: subTitleStyle, children: er.employeeName }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(BudgetTable, { rows: empRows, labelHeader: "Leistungsart" })
          ]
        },
        String(er.employeeId)
      );
    }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "page-break" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { marginBottom: "4px" }, className: "report-section", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: sectionTitleStyle, children: "Detaillierte Leistungsübersicht" }) }),
    budgetReport.employeeReports.map((er) => {
      const empEntries = er.timeEntries && er.timeEntries.length > 0 ? [...er.timeEntries].sort(
        (a, b) => a.date < b.date ? -1 : a.date > b.date ? 1 : 0
      ) : entriesByEmp.get(String(er.employeeId)) ?? [];
      const empTotalMins = empEntries.reduce((s, t) => {
        if (isZeitBlock && t.von && t.bis) {
          const [vh, vm] = t.von.split(":").map(Number);
          const [bh, bm] = t.bis.split(":").map(Number);
          return s + (bh * 60 + bm - (vh * 60 + vm));
        }
        return s + Math.round(t.hours * 60);
      }, 0);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          style: { marginBottom: "24px" },
          className: "report-section",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: subTitleStyle, children: er.employeeName }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: tableStyle, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { ...thStyle, whiteSpace: "nowrap" }, children: "Datum" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: thStyle, children: "Bemerkung" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: thRightStyle, children: "Dauer" })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: empEntries.map((t, idx) => {
                const dauer = isZeitBlock && t.von && t.bis ? vonBisDuration(t.von, t.bis) : hoursToHHMM(t.hours);
                return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "tr",
                  {
                    style: {
                      backgroundColor: idx % 2 === 0 ? "white" : "#f7fafa"
                    },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { ...tdStyle, whiteSpace: "nowrap" }, children: fmtDate(t.date) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { ...tdStyle, color: "#555" }, children: t.description || svcName(t.serviceTypeId) || "–" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { ...tdRightStyle, whiteSpace: "nowrap" }, children: dauer })
                    ]
                  },
                  String(t.id)
                );
              }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("tfoot", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { colSpan: 2, style: footerTdStyle, children: [
                  "Total ",
                  er.employeeName
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: footerTdRightStyle, children: minutesToHHMM(empTotalMins) })
              ] }) })
            ] })
          ]
        },
        `detail-${String(er.employeeId)}`
      );
    }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "8px 12px",
          backgroundColor: "#e8f0f0",
          border: "1px solid #ccd9d9",
          borderTop: "2px solid #006066",
          marginBottom: "32px",
          fontWeight: "bold"
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "13px", color: "#006066" }, children: "Gesamttotal aller Mitarbeiter" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "14px", color: "#006066" }, children: hoursToHHMM(budgetReport.totalStunden) })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        style: { marginTop: "40px", marginBottom: "24px" },
        className: "report-section",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              style: {
                fontWeight: "bold",
                fontSize: "12px",
                color: "#666",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: "24px"
              },
              children: "Genehmigung"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              style: {
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "48px"
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "div",
                    {
                      style: {
                        borderBottom: "1px solid #333",
                        height: "32px",
                        marginBottom: "8px"
                      }
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "11px", color: "#666" }, children: "Kunde / Auftraggeber" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "div",
                    {
                      style: { fontSize: "12px", fontWeight: "600", marginTop: "2px" },
                      children: customerName
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "div",
                    {
                      style: {
                        borderBottom: "1px solid #333",
                        height: "32px",
                        marginBottom: "8px"
                      }
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "11px", color: "#666" }, children: "Mitarbeiter / Leistungserbringer" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "div",
                    {
                      style: { fontSize: "12px", fontWeight: "600", marginTop: "2px" },
                      children: currentUserName
                    }
                  )
                ] })
              ]
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(BudgetReportFooter, { company })
  ] });
}
function StandardReportContent({ data }) {
  const {
    timeEntries,
    company,
    customer,
    project,
    employees,
    serviceTypes,
    dateFrom,
    dateTo,
    currentUserName
  } = data;
  const empName = (id) => {
    const e = employees.find((x) => String(x.id) === String(id));
    return e ? `${e.firstName} ${e.lastName}` : String(id);
  };
  const svcName = (id) => {
    var _a;
    return ((_a = serviceTypes.find((s) => String(s.id) === String(id))) == null ? void 0 : _a.name) ?? "–";
  };
  const isZeitBlock = (project == null ? void 0 : project.erfassungsart) === "zeitBlock";
  const sorted = [...timeEntries].sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? -1 : 1;
    if (a.von && b.von) return a.von < b.von ? -1 : 1;
    return 0;
  });
  const empTotals = /* @__PURE__ */ new Map();
  for (const t of sorted) {
    const k = String(t.employeeId);
    empTotals.set(k, (empTotals.get(k) ?? 0) + t.hours);
  }
  const svcTotals = /* @__PURE__ */ new Map();
  for (const t of sorted) {
    const k = String(t.serviceTypeId);
    svcTotals.set(k, (svcTotals.get(k) ?? 0) + t.hours);
  }
  const empSvcTotals = /* @__PURE__ */ new Map();
  for (const t of sorted) {
    const ek = String(t.employeeId);
    const sk = String(t.serviceTypeId);
    if (!empSvcTotals.has(ek)) empSvcTotals.set(ek, /* @__PURE__ */ new Map());
    const inner = empSvcTotals.get(ek);
    inner.set(sk, (inner.get(sk) ?? 0) + t.hours);
  }
  const entriesByEmp = /* @__PURE__ */ new Map();
  for (const t of sorted) {
    const k = String(t.employeeId);
    if (!entriesByEmp.has(k)) entriesByEmp.set(k, []);
    entriesByEmp.get(k).push(t);
  }
  const grandTotal = sorted.reduce((s, t) => s + t.hours, 0);
  const customerName = (customer == null ? void 0 : customer.name) ?? "–";
  const projectName = (project == null ? void 0 : project.name) ?? "–";
  const headerSection = /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "16px"
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            (company == null ? void 0 : company.logoUrl) && company.logoUrl.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
              "img",
              {
                src: company.logoUrl,
                alt: "Logo",
                style: {
                  height: "36px",
                  maxWidth: "120px",
                  marginBottom: "8px",
                  display: "block",
                  objectFit: "contain",
                  printColorAdjust: "exact"
                }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                style: { fontWeight: "bold", fontSize: "18px", color: "#006066" },
                children: (company == null ? void 0 : company.name) ?? "Firma"
              }
            ),
            (company == null ? void 0 : company.address) && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "11px", color: "#666", marginTop: "2px" }, children: company.address })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "right" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                style: { fontWeight: "bold", fontSize: "15px", color: "#006066" },
                children: "iReport Onchain"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "11px", color: "#888", marginTop: "2px" }, children: "Leistungsrapport" })
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginBottom: "12px" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontWeight: "bold", fontSize: "16px", color: "#1a1a1a" }, children: [
        "Projektauswertung ",
        customerName,
        " – ",
        projectName
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "12px", color: "#444", marginTop: "4px" }, children: [
        "Zeitraum: ",
        fmtDateRange(dateFrom, dateTo),
        "  |  Ausgestellt am: ",
        todayDisplay()
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "hr",
      {
        style: {
          border: "none",
          borderTop: "2px solid #006066",
          marginBottom: "20px"
        }
      }
    )
  ] });
  if (sorted.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "24px", maxWidth: "900px", margin: "0 auto" }, children: [
      headerSection,
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          style: {
            textAlign: "center",
            padding: "40px",
            color: "#888",
            fontSize: "14px"
          },
          children: "Keine Zeiterfassungen für den gewählten Zeitraum und das gewählte Projekt."
        }
      )
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "24px", maxWidth: "900px", margin: "0 auto" }, children: [
    headerSection,
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginBottom: "20px" }, className: "report-section", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: sectionTitleStyle, children: "Gesamtübersicht" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: tableStyle, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: thStyle, children: "Mitarbeiter" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: thRightStyle, children: "Gesamtdauer" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: Array.from(empTotals.entries()).map(([eid, hours], idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "tr",
          {
            style: {
              backgroundColor: idx % 2 === 0 ? "white" : "#f7fafa"
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: tdStyle, children: empName(BigInt(eid)) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: tdRightStyle, children: hoursToHHMM(hours) })
            ]
          },
          eid
        )) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tfoot", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: footerTdStyle, children: "Gesamttotal" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: footerTdRightStyle, children: hoursToHHMM(grandTotal) })
        ] }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginBottom: "20px" }, className: "report-section", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: sectionTitleStyle, children: "Auswertung nach Leistungsart" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: tableStyle, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: thStyle, children: "Leistungsart" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: thRightStyle, children: "Gesamtdauer" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: Array.from(svcTotals.entries()).map(([sid, hours], idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "tr",
          {
            style: {
              backgroundColor: idx % 2 === 0 ? "white" : "#f7fafa"
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: tdStyle, children: svcName(BigInt(sid)) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: tdRightStyle, children: hoursToHHMM(hours) })
            ]
          },
          sid
        )) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tfoot", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: footerTdStyle, children: "Gesamttotal" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: footerTdRightStyle, children: hoursToHHMM(grandTotal) })
        ] }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginBottom: "20px" }, className: "report-section", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: sectionTitleStyle, children: "Mitarbeiter-Übersicht" }),
      Array.from(empSvcTotals.entries()).map(([eid, svcMap]) => {
        const empTotal = empTotals.get(eid) ?? 0;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginBottom: "12px" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: subTitleStyle, children: [
            "Mitarbeiter: ",
            empName(BigInt(eid))
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: tableStyle, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: thStyle, children: "Leistungsart" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: thRightStyle, children: "Dauer" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: Array.from(svcMap.entries()).map(([sid, hours], idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "tr",
              {
                style: {
                  backgroundColor: idx % 2 === 0 ? "white" : "#f7fafa"
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: tdStyle, children: svcName(BigInt(sid)) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: tdRightStyle, children: hoursToHHMM(hours) })
                ]
              },
              sid
            )) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("tfoot", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { style: footerTdStyle, children: [
                "Total ",
                empName(BigInt(eid))
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: footerTdRightStyle, children: hoursToHHMM(empTotal) })
            ] }) })
          ] })
        ] }, eid);
      })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "page-break" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { marginBottom: "20px" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: sectionTitleStyle, children: "Detaillierte Leistungsübersicht" }) }),
    Array.from(entriesByEmp.entries()).map(([eid, entries]) => {
      const empTotal = empTotals.get(eid) ?? 0;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          style: { marginBottom: "28px" },
          className: "report-section",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                style: {
                  fontWeight: "bold",
                  fontSize: "13px",
                  color: "#006066",
                  padding: "6px 0 4px",
                  borderBottom: "1px solid #006066",
                  marginBottom: "0"
                },
                children: [
                  "Leistungserfassung – ",
                  empName(BigInt(eid))
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: tableStyle, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { ...thStyle, whiteSpace: "nowrap" }, children: "Datum" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: thStyle, children: "Zeit" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: thStyle, children: "Leistungsart" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: thStyle, children: "Bemerkung" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: thRightStyle, children: "Dauer" })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: entries.map((t, idx) => {
                const zeitDisplay = isZeitBlock && t.von && t.bis ? `${t.von} – ${t.bis}` : "–";
                const dauer = isZeitBlock && t.von && t.bis ? vonBisDuration(t.von, t.bis) : hoursToHHMM(t.hours);
                return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "tr",
                  {
                    style: {
                      backgroundColor: idx % 2 === 0 ? "white" : "#f7fafa"
                    },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { ...tdStyle, whiteSpace: "nowrap" }, children: fmtDate(t.date) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { ...tdStyle, whiteSpace: "nowrap" }, children: zeitDisplay }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: tdStyle, children: svcName(t.serviceTypeId) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { ...tdStyle, color: "#555" }, children: t.description || "–" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { ...tdRightStyle, whiteSpace: "nowrap" }, children: dauer })
                    ]
                  },
                  String(t.id)
                );
              }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("tfoot", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { colSpan: 4, style: footerTdStyle, children: [
                  "Total ",
                  empName(BigInt(eid))
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: footerTdRightStyle, children: hoursToHHMM(empTotal) })
              ] }) })
            ] })
          ]
        },
        eid
      );
    }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "8px 12px",
          backgroundColor: "#e8f0f0",
          border: "1px solid #ccd9d9",
          borderTop: "2px solid #006066",
          marginBottom: "32px",
          fontWeight: "bold"
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "13px", color: "#006066" }, children: "Gesamttotal aller Mitarbeiter" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "14px", color: "#006066" }, children: hoursToHHMM(grandTotal) })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        style: { marginTop: "40px", marginBottom: "24px" },
        className: "report-section",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              style: {
                fontWeight: "bold",
                fontSize: "12px",
                color: "#666",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: "24px"
              },
              children: "Genehmigung"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              style: {
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "48px"
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "div",
                    {
                      style: {
                        borderBottom: "1px solid #333",
                        height: "32px",
                        marginBottom: "8px"
                      }
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "11px", color: "#666" }, children: "Kunde / Auftraggeber" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "div",
                    {
                      style: { fontSize: "12px", fontWeight: "600", marginTop: "2px" },
                      children: customerName
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "div",
                    {
                      style: {
                        borderBottom: "1px solid #333",
                        height: "32px",
                        marginBottom: "8px"
                      }
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "11px", color: "#666" }, children: "Mitarbeiter / Leistungserbringer" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "div",
                    {
                      style: { fontSize: "12px", fontWeight: "600", marginTop: "2px" },
                      children: currentUserName
                    }
                  )
                ] })
              ]
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        style: {
          borderTop: "1px solid #ccd9d9",
          paddingTop: "10px",
          marginTop: "20px",
          color: "#888",
          fontSize: "11px",
          display: "flex",
          justifyContent: "space-between"
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            (company == null ? void 0 : company.name) ?? "",
            (company == null ? void 0 : company.address) ? ` | ${company.address}` : ""
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "Erstellt am ",
            todayDisplay()
          ] })
        ]
      }
    )
  ] });
}
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
function normaliseOp(op) {
  if (op === void 0 || op === null) return "";
  if (typeof op === "string") {
    const s = op.toLowerCase().replace(/_$/, "");
    return s === "remove" ? "delete" : s;
  }
  if (typeof op === "object") {
    const keys = Object.keys(op);
    if (keys.length > 0) {
      const key = keys[0].toLowerCase().replace(/_$/, "");
      return key === "remove" ? "delete" : key;
    }
  }
  return String(op).toLowerCase().replace(/_$/, "");
}
function getOperationLabel(op) {
  const norm = normaliseOp(op);
  if (norm === "create") return "Erstellt";
  if (norm === "update") return "Bearbeitet";
  if (norm === "delete") return "Gelöscht";
  if (norm === "deactivate" || norm === "deactivated") return "Deaktiviert";
  if (norm === "approved" || norm === "approve") return "Genehmigt";
  if (norm === "rejected" || norm === "reject") return "Abgelehnt";
  if (!norm) return "(Unbekannt)";
  return norm.charAt(0).toUpperCase() + norm.slice(1);
}
function getOperationBadgeClass(op) {
  const norm = normaliseOp(op);
  if (norm === "create")
    return "bg-green-100 text-green-800 border border-green-300";
  if (norm === "update")
    return "bg-blue-100 text-blue-800 border border-blue-300";
  if (norm === "delete") return "bg-red-100 text-red-800 border border-red-300";
  if (norm === "deactivate" || norm === "deactivated")
    return "bg-orange-100 text-orange-800 border border-orange-300";
  if (norm === "approved" || norm === "approve")
    return "bg-green-100 text-green-800 border border-green-300";
  if (norm === "rejected" || norm === "reject")
    return "bg-red-100 text-red-800 border border-red-300";
  return "bg-muted text-muted-foreground border border-border";
}
function AuswertungenPage() {
  const { actor, isFetching: actorFetching } = useActor(createActor);
  const { isAuthenticated, companyId, role, isPlatformAdmin } = useAuth();
  const isAdminOrManager = role === "admin" || role === "manager";
  const canSeeAudit = role === "admin" || isPlatformAdmin;
  const isMitarbeiter = role === "employee" || !isAdminOrManager && role !== null;
  const [dateFrom, setDateFrom] = reactExports.useState(getFirstDayOfMonth());
  const [dateTo, setDateTo] = reactExports.useState(getTodayString());
  const [selectedEmployee, setSelectedEmployee] = reactExports.useState("");
  const [selectedProject, setSelectedProject] = reactExports.useState("");
  const [reportActive, setReportActive] = reactExports.useState(false);
  const [queryKey, setQueryKey] = reactExports.useState(0);
  const [auditDateFrom, setAuditDateFrom] = reactExports.useState(getFirstDayOfMonth());
  const [auditDateTo, setAuditDateTo] = reactExports.useState(getTodayString());
  const [auditOperation, setAuditOperation] = reactExports.useState("");
  const [auditBereich, setAuditBereich] = reactExports.useState("");
  const [auditUser, setAuditUser] = reactExports.useState("");
  const [auditQueryKey, setAuditQueryKey] = reactExports.useState(0);
  const [auditExpanded, setAuditExpanded] = reactExports.useState(/* @__PURE__ */ new Set());
  const { data: employees = [] } = useQuery({
    queryKey: ["employees", companyId],
    queryFn: async () => {
      if (!actor) return [];
      return await toAny(actor).listEmployees();
    },
    enabled: !!actor && !actorFetching && isAuthenticated && isAdminOrManager
  });
  const { data: myEmployee } = useQuery({
    queryKey: ["myEmployee", companyId],
    queryFn: async () => {
      if (!actor) return null;
      const res = await toAny(actor).getMyEmployee();
      if ("ok" in res && res.ok) return res.ok;
      return null;
    },
    enabled: !!actor && !actorFetching && isAuthenticated
  });
  const { data: allProjects = [] } = useQuery({
    queryKey: ["projects", companyId],
    queryFn: async () => {
      if (!actor) return [];
      return await toAny(actor).listProjects();
    },
    enabled: !!actor && !actorFetching && isAuthenticated
  });
  const { data: projectMemberships = /* @__PURE__ */ new Map() } = useQuery({
    queryKey: ["myProjectMemberships", companyId, String((myEmployee == null ? void 0 : myEmployee.id) ?? "")],
    queryFn: async () => {
      if (!actor || !myEmployee) return /* @__PURE__ */ new Map();
      const result = /* @__PURE__ */ new Map();
      await Promise.all(
        allProjects.map(async (proj) => {
          try {
            const res = await toAny(actor).getProjectMembers(proj.id);
            if (res.__kind__ === "ok" && res.ok) {
              const isMember = res.ok.some(
                (m) => String(m.employeeId) === String(myEmployee.id)
              );
              if (isMember) result.set(String(proj.id), true);
            }
          } catch {
          }
        })
      );
      return result;
    },
    enabled: !!actor && !actorFetching && isAuthenticated && isMitarbeiter && !!myEmployee && allProjects.length > 0
  });
  const projects = isAdminOrManager ? allProjects : allProjects.filter((p) => projectMemberships.has(String(p.id)));
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
  const {
    data: auditEntries = [],
    isLoading: auditLoading,
    refetch: refetchAudit
  } = useQuery({
    queryKey: ["auditLog", auditQueryKey, companyId],
    queryFn: async () => {
      if (!actor) return [];
      const filter = {};
      if (auditBereich) filter.entityType = auditBereich;
      if (auditOperation) filter.operation = auditOperation;
      return await toAny(actor).listAuditLogs(filter);
    },
    enabled: !!actor && !actorFetching && isAuthenticated && canSeeAudit,
    staleTime: 3e4
  });
  const filteredAuditEntries = auditEntries.filter((entry) => {
    const entryDate = new Date(Number(entry.timestamp) / 1e6).toISOString().slice(0, 10);
    if (auditDateFrom && entryDate < auditDateFrom) return false;
    if (auditDateTo && entryDate > auditDateTo) return false;
    if (auditUser && !entry.actorName.toLowerCase().includes(auditUser.toLowerCase()) && !entry.actorPrincipal.toLowerCase().includes(auditUser.toLowerCase()))
      return false;
    return true;
  });
  const distinctUsers = Array.from(
    new Set(auditEntries.map((e) => e.actorName || e.actorPrincipal))
  ).filter(Boolean);
  function formatAuditTimestamp(ts) {
    const d = new Date(Number(ts) / 1e6);
    return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
  }
  const ENTITY_TYPE_LABELS = {
    [AuditEntityType.holiday]: "Feiertage",
    [AuditEntityType.company]: "Firma",
    [AuditEntityType.employee]: "Mitarbeiter",
    [AuditEntityType.customer]: "Kunden",
    [AuditEntityType.project]: "Projekte",
    [AuditEntityType.serviceType]: "Leistungsarten",
    [AuditEntityType.expenseType]: "Spesenarten",
    [AuditEntityType.absenceType]: "Abwesenheitsarten",
    [AuditEntityType.invoiceTemplate]: "Rechnungsvorlagen",
    [AuditEntityType.timeEntry]: "Zeiterfassung",
    [AuditEntityType.expense]: "Spesen",
    [AuditEntityType.absence]: "Absenzen",
    [AuditEntityType.ferien]: "Ferien",
    [AuditEntityType.approval]: "Genehmigungen"
  };
  function exportAuditCSV() {
    const header = "Zeitstempel,Operation,Bereich,Datensatz-ID,Benutzer,Principal-ID,Vorher,Nachher";
    const lines = filteredAuditEntries.map((e) => {
      return [
        formatAuditTimestamp(e.timestamp),
        getOperationLabel(e.operation),
        ENTITY_TYPE_LABELS[e.entityType] ?? e.entityType,
        e.entityId,
        e.actorName || e.actorPrincipal,
        e.actorPrincipal,
        e.beforeState ?? "",
        e.afterState ?? ""
      ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",");
    });
    const csv = [header, ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Audit-Protokoll_${getTodayString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
  function toggleAuditExpand(id) {
    setAuditExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Layout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 space-y-6 max-w-7xl mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChartNoAxesColumn, { className: "w-5 h-5 text-primary" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-display font-semibold text-foreground", children: "Auswertungen" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Zeiten und Spesen auswerten und exportieren" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "auswertung", "data-ocid": "auswertungen.tabs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          TabsTrigger,
          {
            value: "auswertung",
            "data-ocid": "auswertungen.tab.auswertung",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ChartNoAxesColumn, { className: "w-4 h-4 mr-1.5" }),
              "Auswertung"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          TabsTrigger,
          {
            value: "monatsrapport",
            "data-ocid": "auswertungen.tab.monatsrapport",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-4 h-4 mr-1.5" }),
              "Monatsrapport"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          TabsTrigger,
          {
            value: "projektauswertung",
            "data-ocid": "auswertungen.tab.projektauswertung",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "w-4 h-4 mr-1.5" }),
              "Projektauswertung"
            ]
          }
        ),
        canSeeAudit && /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "audit", "data-ocid": "auswertungen.tab.audit", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "w-4 h-4 mr-1.5" }),
          "Audit-Protokoll"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "auswertung", className: "space-y-6 mt-4", children: [
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
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex justify-between items-center", children: [
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
            ),
            !(reportActive && (timeEntries.length > 0 || expenseItems.length > 0)) && /* @__PURE__ */ jsxRuntimeExports.jsx("div", {}),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
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
            )
          ] })
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
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "monatsrapport", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        MonatsrapportView,
        {
          employees,
          isAdminOrManager
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "projektauswertung", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        ProjektauswertungView,
        {
          employees,
          allProjects,
          projectMemberships,
          isAdminOrManager
        }
      ) }),
      canSeeAudit && /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "audit", className: "space-y-6 mt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold text-foreground", children: "Audit-Protokoll" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-0.5", children: "Protokollierte Datenänderungen in Stammdaten, Zeiterfassung und Spesen" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "shadow-card", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "pt-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "auditDateFrom", children: "Von" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "auditDateFrom",
                  "data-ocid": "audit.filter-date-from",
                  type: "date",
                  value: auditDateFrom,
                  onChange: (e) => setAuditDateFrom(e.target.value)
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "auditDateTo", children: "Bis" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "auditDateTo",
                  "data-ocid": "audit.filter-date-to",
                  type: "date",
                  value: auditDateTo,
                  onChange: (e) => setAuditDateTo(e.target.value)
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "auditOperation", children: "Operation" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "select",
                {
                  id: "auditOperation",
                  "data-ocid": "audit.filter-operation",
                  value: auditOperation,
                  onChange: (e) => setAuditOperation(e.target.value),
                  className: "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Alle Operationen" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: AuditOperation.create, children: "Erstellt" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: AuditOperation.update, children: "Bearbeitet" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: AuditOperation.remove, children: "Gelöscht" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: AuditOperation.delete_, children: "Gelöscht (alt)" })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "auditBereich", children: "Bereich" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "select",
                {
                  id: "auditBereich",
                  "data-ocid": "audit.filter-bereich",
                  value: auditBereich,
                  onChange: (e) => setAuditBereich(e.target.value),
                  className: "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Alle Bereiche" }),
                    Object.entries(ENTITY_TYPE_LABELS).map(
                      ([val, label]) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: val, children: label }, val)
                    )
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "auditUser", children: "Benutzer" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "select",
                {
                  id: "auditUser",
                  "data-ocid": "audit.filter-user",
                  value: auditUser,
                  onChange: (e) => setAuditUser(e.target.value),
                  className: "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Alle Benutzer" }),
                    distinctUsers.map((u) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: u, children: u.length > 30 ? `${u.slice(0, 20)}…${u.slice(-6)}` : u }, u))
                  ]
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex items-center justify-between gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                type: "button",
                "data-ocid": "audit.btn-export-csv",
                variant: "outline",
                className: "gap-2",
                onClick: exportAuditCSV,
                disabled: filteredAuditEntries.length === 0,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "w-4 h-4" }),
                  "CSV exportieren"
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                type: "button",
                "data-ocid": "audit.btn-filter",
                className: "gap-2",
                onClick: () => {
                  setAuditQueryKey((k) => k + 1);
                  void refetchAudit();
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "w-4 h-4" }),
                  "Aktualisieren"
                ]
              }
            )
          ] })
        ] }) }),
        auditLoading && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-12 w-full" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-12 w-full" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-12 w-full" })
        ] }),
        !auditLoading && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "shadow-card", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base font-semibold", children: "Protokolleinträge" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", children: [
              filteredAuditEntries.length,
              " Einträge"
            ] })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: filteredAuditEntries.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "flex flex-col items-center justify-center py-12 text-muted-foreground gap-2",
              "data-ocid": "audit.empty_state",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "w-8 h-8 opacity-40" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "Keine Protokolleinträge für diesen Zeitraum" })
              ]
            }
          ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "bg-muted/40", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "w-8" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Zeitstempel" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Operation" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Bereich" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Datensatz-ID" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Benutzer" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: filteredAuditEntries.map((entry, idx) => {
              const key = `${entry.id}-${idx}`;
              const expanded = auditExpanded.has(key);
              return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  TableRow,
                  {
                    "data-ocid": `audit.item.${idx + 1}`,
                    className: "cursor-pointer hover:bg-muted/30",
                    onClick: () => toggleAuditExpand(key),
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-2", children: expanded ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "w-4 h-4 text-muted-foreground" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "w-4 h-4 text-muted-foreground" }) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-xs tabular-nums whitespace-nowrap", children: formatAuditTimestamp(entry.timestamp) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Badge,
                        {
                          className: `text-xs ${getOperationBadgeClass(entry.operation)}`,
                          children: getOperationLabel(entry.operation)
                        }
                      ) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-sm", children: ENTITY_TYPE_LABELS[entry.entityType] ?? entry.entityType }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-xs", children: entry.entityId }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs max-w-[160px]", children: entry.actorName ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "span",
                        {
                          title: entry.actorPrincipal,
                          className: "cursor-default border-b border-dashed border-muted-foreground/40",
                          children: entry.actorName
                        }
                      ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "span",
                        {
                          title: entry.actorPrincipal,
                          className: "font-mono cursor-default",
                          children: entry.actorPrincipal.length > 20 ? `${entry.actorPrincipal.slice(0, 10)}…${entry.actorPrincipal.slice(-6)}` : entry.actorPrincipal
                        }
                      ) })
                    ]
                  },
                  key
                ),
                expanded && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  TableRow,
                  {
                    className: "bg-muted/20",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, {}),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        TableCell,
                        {
                          colSpan: 5,
                          className: "pb-3 pt-1",
                          children: (() => {
                            const fc = entry.fieldChanges;
                            if (fc && fc.length > 0) {
                              const beforeText = fc.map(
                                (c) => `${c.fieldName}: ${c.before || "—"}`
                              ).join("\n");
                              const afterText = fc.map(
                                (c) => `${c.fieldName}: ${c.after || "—"}`
                              ).join("\n");
                              return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs", children: [
                                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-muted-foreground uppercase tracking-wide text-[10px]", children: "Vorher" }),
                                  /* @__PURE__ */ jsxRuntimeExports.jsx("pre", { className: "p-2 rounded bg-background border border-border text-xs whitespace-pre-wrap break-words max-h-32 overflow-auto", children: beforeText })
                                ] }),
                                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-muted-foreground uppercase tracking-wide text-[10px]", children: "Nachher" }),
                                  /* @__PURE__ */ jsxRuntimeExports.jsx("pre", { className: "p-2 rounded bg-background border border-border text-xs whitespace-pre-wrap break-words max-h-32 overflow-auto", children: afterText })
                                ] })
                              ] });
                            }
                            return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs", children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-muted-foreground uppercase tracking-wide text-[10px]", children: "Vorher" }),
                                /* @__PURE__ */ jsxRuntimeExports.jsx("pre", { className: "p-2 rounded bg-background border border-border text-xs whitespace-pre-wrap break-words max-h-32 overflow-auto", children: entry.beforeState || "—" })
                              ] }),
                              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-muted-foreground uppercase tracking-wide text-[10px]", children: "Nachher" }),
                                /* @__PURE__ */ jsxRuntimeExports.jsx("pre", { className: "p-2 rounded bg-background border border-border text-xs whitespace-pre-wrap break-words max-h-32 overflow-auto", children: entry.afterState || "—" })
                              ] })
                            ] });
                          })()
                        }
                      )
                    ]
                  },
                  `${key}-detail`
                )
              ] });
            }) })
          ] }) }) })
        ] })
      ] })
    ] })
  ] }) });
}
export {
  AuswertungenPage as default
};
