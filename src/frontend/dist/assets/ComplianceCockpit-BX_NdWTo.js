import { j as jsxRuntimeExports, r as reactExports } from "./index-Blf-A8DR.js";
import { B as Button } from "./button-DCGMFvti.js";
import { I as Input } from "./index-CVvtv_EE.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./Layout-ClH0znk9.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-Dp2E-W7o.js";
import { b as useAuth, u as useActor, c as createActor } from "./useAuthStore-Cbv7GIMf.js";
import { L as LoaderCircle } from "./loader-circle-Dm6X7eBl.js";
import { c as createLucideIcon } from "./createLucideIcon-BzNCDVU7.js";
import "./index-Dv8dTxpA.js";
import "./users-DUrIKgtR.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["polygon", { points: "10 8 16 12 10 16 10 8", key: "1cimsy" }]
];
const CirclePlay = createLucideIcon("circle-play", __iconNode$1);
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
      d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
      key: "oel41y"
    }
  ],
  ["path", { d: "M12 8v4", key: "1got3b" }],
  ["path", { d: "M12 16h.01", key: "1drbdi" }]
];
const ShieldAlert = createLucideIcon("shield-alert", __iconNode);
const statusDotClass = {
  green: "bg-green-500",
  yellow: "bg-yellow-500",
  red: "bg-red-500",
  blue: "bg-blue-500",
  grey: "bg-gray-300"
};
function ComplianceCockpitKpiCard({
  title,
  value,
  status,
  description,
  isPlaceholder = false
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "bg-card rounded-lg shadow-sm p-4 flex flex-col gap-1 min-w-0",
      "data-ocid": "compliance.kpi_card",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-3xl font-bold text-foreground tabular-nums leading-none", children: isPlaceholder ? "--" : value }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: `w-3 h-3 rounded-full mt-1 flex-shrink-0 ${statusDotClass[status]}`,
              "aria-hidden": "true"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground leading-snug", children: title }),
        isPlaceholder && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground/60 mt-0.5", children: "Kommt demnächst" }),
        !isPlaceholder && description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground/70 mt-0.5", children: description })
      ]
    }
  );
}
const toAny = (a) => a;
const STATUS_LABELS = {
  COMPLIANT: "Konform",
  INFO: "Info",
  WARNING: "Warnung",
  BREACH: "Verstoss",
  CRITICAL: "Kritisch",
  FREIGEGEBEN: "Freigegeben"
};
function statusDotColor(status) {
  switch (status) {
    case "COMPLIANT":
    case "INFO":
      return "bg-green-500";
    case "WARNING":
      return "bg-yellow-500";
    case "BREACH":
    case "CRITICAL":
      return "bg-red-500";
    case "FREIGEGEBEN":
      return "bg-blue-500";
    default:
      return "bg-gray-300";
  }
}
function ferienstatusColor(status) {
  if (status === "OK") return "text-green-600";
  if (status === "Risiko") return "text-yellow-600";
  if (status === "Verstoss") return "text-red-600";
  return "text-muted-foreground";
}
const DEFAULT_KPI = {
  mitarbeiterMitVerstoessen: BigInt(0),
  ruhezeitVerstoesse: BigInt(0),
  mitarbeiterMitGesetzlicherUeberzeit: BigInt(0),
  ferienRisiken: BigInt(0),
  pausenVerstoesse: BigInt(0)
};
function ComplianceCockpit() {
  const { companyId, isAuthenticated } = useAuth();
  const { actor, isFetching } = useActor(createActor);
  const [kpi, setKpi] = reactExports.useState(DEFAULT_KPI);
  const [rows, setRows] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(false);
  const [runningCheck, setRunningCheck] = reactExports.useState(false);
  const [checkMessage, setCheckMessage] = reactExports.useState(null);
  const [filterEmployee, setFilterEmployee] = reactExports.useState("");
  const [filterStatus, setFilterStatus] = reactExports.useState("alle");
  const enabled = !!actor && !isFetching && isAuthenticated && !!companyId;
  reactExports.useEffect(() => {
    if (!enabled) return;
    void loadData();
  }, [enabled]);
  async function loadData() {
    if (!actor || !companyId) return;
    setLoading(true);
    try {
      const cid = BigInt(companyId);
      try {
        await toAny(actor).initAllVacationLedgers(cid);
      } catch {
      }
      const [kpiResult, rowsResult] = await Promise.all([
        toAny(actor).getComplianceCockpitKPI(cid),
        toAny(actor).getComplianceCockpitRows(cid)
      ]);
      setKpi(kpiResult);
      setRows(rowsResult);
    } catch (e) {
      console.error("Fehler beim Laden der Compliance-Daten:", e);
    } finally {
      setLoading(false);
    }
  }
  async function handleRunWeeklyCheck() {
    if (!actor || !companyId) return;
    setRunningCheck(true);
    setCheckMessage(null);
    try {
      const cid = BigInt(companyId);
      try {
        await toAny(actor).initAllVacationLedgers(cid);
      } catch {
      }
      const result = await toAny(actor).runWeeklyComplianceCheck(cid);
      if (result.err !== void 0) {
        setCheckMessage({ type: "error", text: result.err });
      } else {
        setCheckMessage({
          type: "success",
          text: `Wochenkontrolle abgeschlossen. ${result.ok !== void 0 ? `${Number(result.ok)} Befunde erzeugt.` : ""}`
        });
        await loadData();
      }
    } catch (e) {
      setCheckMessage({
        type: "error",
        text: e instanceof Error ? e.message : "Unbekannter Fehler"
      });
    } finally {
      setRunningCheck(false);
    }
  }
  const filteredRows = rows.filter((r) => {
    const name = `${r.employee.firstName} ${r.employee.lastName}`.toLowerCase();
    if (filterEmployee && !name.includes(filterEmployee.toLowerCase()))
      return false;
    if (filterStatus === "warnungen") {
      return r.gesamtstatus === "WARNING" || r.gesamtstatus === "INFO";
    }
    if (filterStatus === "verstoesse") {
      return r.gesamtstatus === "BREACH" || r.gesamtstatus === "CRITICAL";
    }
    return true;
  });
  const kpiVerstoesse = Number(kpi.mitarbeiterMitVerstoessen);
  const kpiRuhezeit = Number(kpi.ruhezeitVerstoesse);
  const kpiUeberzeit = Number(kpi.mitarbeiterMitGesetzlicherUeberzeit);
  const kpiFerienRisiken = Number(kpi.ferienRisiken);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 space-y-6", "data-ocid": "compliance.cockpit_page", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        ComplianceCockpitKpiCard,
        {
          title: "Mitarbeitende mit Verstössen",
          value: kpiVerstoesse,
          status: kpiVerstoesse > 0 ? "red" : "green"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        ComplianceCockpitKpiCard,
        {
          title: "Ruhezeitverstösse",
          value: kpiRuhezeit,
          status: kpiRuhezeit > 0 ? "red" : "green"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        ComplianceCockpitKpiCard,
        {
          title: "Mitarbeitende mit gesetzl. Überzeit",
          value: kpiUeberzeit,
          status: kpiUeberzeit > 0 ? "yellow" : "green"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        ComplianceCockpitKpiCard,
        {
          title: "Ferienrisiken",
          value: kpiFerienRisiken,
          status: kpiFerienRisiken > 0 ? "yellow" : "green"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        ComplianceCockpitKpiCard,
        {
          title: "Pausenverstösse",
          value: Number(kpi.pausenVerstoesse),
          status: Number(kpi.pausenVerstoesse) > 0 ? "yellow" : "green"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          type: "button",
          onClick: () => void handleRunWeeklyCheck(),
          disabled: runningCheck || !enabled,
          className: "gap-2 bg-[#006066] hover:bg-[#004d52] text-white",
          "data-ocid": "compliance.run_weekly_check_button",
          children: [
            runningCheck ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CirclePlay, { className: "w-4 h-4" }),
            "Wochenkontrolle ausführen"
          ]
        }
      ),
      checkMessage && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "span",
        {
          className: `text-sm font-medium ${checkMessage.type === "success" ? "text-green-600" : "text-red-600"}`,
          "data-ocid": "compliance.check_message",
          children: checkMessage.text
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          type: "text",
          placeholder: "Mitarbeitende suchen...",
          value: filterEmployee,
          onChange: (e) => setFilterEmployee(e.target.value),
          className: "w-56",
          "data-ocid": "compliance.search_input"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Select,
        {
          value: filterStatus,
          onValueChange: (v) => setFilterStatus(v),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              SelectTrigger,
              {
                className: "w-44",
                "data-ocid": "compliance.status_filter_select",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {})
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "alle", children: "Alle Status" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "warnungen", children: "Nur Warnungen" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "verstoesse", children: "Nur Verstösse" })
            ] })
          ]
        }
      )
    ] }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "flex items-center justify-center py-20 text-muted-foreground",
        "data-ocid": "compliance.loading_state",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-6 h-6 animate-spin mr-2" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: "Daten werden geladen…" })
        ]
      }
    ) : filteredRows.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "flex flex-col items-center justify-center py-20 gap-3 text-center",
        "data-ocid": "compliance.empty_state",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 rounded-full bg-muted flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "w-6 h-6 text-muted-foreground" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-foreground", children: "Keine Compliance-Daten vorhanden" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Führe eine Wochenkontrolle aus, um Befunde zu generieren." })
          ] })
        ]
      }
    ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto rounded-lg border border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "bg-muted/40", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Mitarbeitende" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Gesamtstatus" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Vertragl. Überstunden" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Gesetzl. Überzeit" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Ruhezeitverstösse" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Pausenverstösse" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Ferienstatus" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Offene Massnahmen" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: filteredRows.map((r, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        TableRow,
        {
          "data-ocid": `compliance.item.${idx + 1}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { className: "font-medium", children: [
              r.employee.firstName,
              " ",
              r.employee.lastName
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: `w-2.5 h-2.5 rounded-full flex-shrink-0 ${statusDotColor(r.gesamtstatus)}`,
                  "aria-hidden": "true"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: STATUS_LABELS[r.gesamtstatus] ?? r.gesamtstatus })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right tabular-nums", children: r.vertraglicheUeberstundenH > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-yellow-600 font-medium", children: [
              "+",
              r.vertraglicheUeberstundenH.toFixed(1),
              "h"
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
              r.vertraglicheUeberstundenH.toFixed(1),
              "h"
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right tabular-nums", children: r.gesetzlicheUeberzeitH > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-red-600 font-medium", children: [
              "+",
              r.gesetzlicheUeberzeitH.toFixed(1),
              "h"
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
              r.gesetzlicheUeberzeitH.toFixed(1),
              "h"
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right tabular-nums", children: Number(r.ruhezeitVerstoesse) > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-600 font-medium", children: Number(r.ruhezeitVerstoesse) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "0" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right tabular-nums", children: r.pausenVerstoesse !== void 0 && Number(r.pausenVerstoesse) > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-yellow-600 font-medium", children: Number(r.pausenVerstoesse) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "0" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "span",
              {
                className: `text-sm font-medium ${ferienstatusColor(r.ferienstatus)}`,
                children: r.ferienstatus || "–"
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right tabular-nums", children: Number(r.offeneMassnahmen) > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-orange-600 font-medium", children: Number(r.offeneMassnahmen) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "0" }) })
          ]
        },
        String(r.employee.id)
      )) })
    ] }) })
  ] });
}
export {
  ComplianceCockpit as default
};
