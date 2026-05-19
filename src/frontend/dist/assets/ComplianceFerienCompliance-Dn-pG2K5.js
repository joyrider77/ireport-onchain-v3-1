import { r as reactExports, j as jsxRuntimeExports } from "./index-Blf-A8DR.js";
import { b as useAuth, u as useActor, c as createActor } from "./useAuthStore-Cbv7GIMf.js";
const toAny = (a) => a;
function computeCalendarYears(startDate) {
  if (!startDate) return [];
  const hire = new Date(startDate);
  const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
  const hireYear = hire.getFullYear();
  const result = [];
  for (let y = currentYear; y >= hireYear; y--) {
    result.push({ label: String(y), key: String(y) });
  }
  return result;
}
function fallbackYearOptions() {
  const y = (/* @__PURE__ */ new Date()).getFullYear();
  return [
    { label: String(y), key: String(y) },
    { label: String(y - 1), key: String(y - 1) }
  ];
}
function restColor(days) {
  if (days >= 10) return "text-green-600 font-medium";
  if (days >= 5) return "text-yellow-600 font-medium";
  return "text-red-600 font-medium";
}
function ComplianceFerienCompliance({ employees }) {
  const { isAuthenticated } = useAuth();
  const { actor, isFetching } = useActor(createActor);
  const [selectedEmployeeId, setSelectedEmployeeId] = reactExports.useState(
    employees.length > 0 ? employees[0].id : null
  );
  const [yearOptions, setYearOptions] = reactExports.useState([]);
  const [selectedYearKey, setSelectedYearKey] = reactExports.useState("");
  const [ledger, setLedger] = reactExports.useState(null);
  const [vacationBalances, setVacationBalances] = reactExports.useState(
    []
  );
  const [loading, setLoading] = reactExports.useState(false);
  const enabled = !!actor && !isFetching && isAuthenticated;
  reactExports.useEffect(() => {
    const emp = employees.find((e) => e.id === selectedEmployeeId);
    const sd = (emp == null ? void 0 : emp.startDate) ?? "";
    const opts = sd ? computeCalendarYears(sd) : fallbackYearOptions();
    setYearOptions(opts);
    setSelectedYearKey(opts.length > 0 ? opts[0].key : "");
    setLedger(null);
    setVacationBalances([]);
  }, [selectedEmployeeId, employees]);
  reactExports.useEffect(() => {
    if (employees.length > 0 && !selectedEmployeeId) {
      setSelectedEmployeeId(employees[0].id);
    }
  }, [employees, selectedEmployeeId]);
  reactExports.useEffect(() => {
    if (!enabled || !selectedEmployeeId || !selectedYearKey) return;
    void loadLedger();
  }, [enabled, selectedEmployeeId, selectedYearKey]);
  async function loadLedger() {
    if (!actor || !selectedEmployeeId || !selectedYearKey) return;
    setLoading(true);
    try {
      const result = await toAny(actor).getVacationLedger(
        selectedEmployeeId,
        selectedYearKey
      );
      setLedger(result);
      const balRes = await toAny(actor).listVacationBalances(
        selectedEmployeeId
      );
      setVacationBalances((balRes == null ? void 0 : balRes.ok) ?? []);
    } catch (e) {
      console.error("Fehler beim Laden des Vacation Ledger:", e);
      setLedger(null);
      setVacationBalances([]);
    } finally {
      setLoading(false);
    }
  }
  const selectedEmployee = employees.find((e) => e.id === selectedEmployeeId);
  const employeeName = selectedEmployee ? `${selectedEmployee.firstName} ${selectedEmployee.lastName}` : "–";
  const displayYear = selectedYearKey;
  const matchingBalance = vacationBalances.find(
    (b) => Number(b.kalenderjahr) === Number(selectedYearKey)
  );
  const balanceDays = matchingBalance ? Number(matchingBalance.dauer) : null;
  const gesetzlichDays = ledger ? ledger.gesetzlicheFerientage : 0;
  const complianceStatus = ledger && gesetzlichDays > 0 ? balanceDays === null ? "no_balance" : balanceDays < gesetzlichDays ? "below_minimum" : "ok" : "none";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "p-6 space-y-4",
      "data-ocid": "compliance.ferien_compliance_page",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold text-foreground", children: "Ferien-Compliance nach Kalenderjahr" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-4 mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              value: selectedEmployeeId ? String(selectedEmployeeId) : "",
              onChange: (e) => {
                setSelectedEmployeeId(
                  e.target.value ? BigInt(e.target.value) : null
                );
              },
              className: "border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring w-64",
              "data-ocid": "compliance.ferien_mitarbeiter_select",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Mitarbeitende/r wählen…" }),
                employees.map((emp) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: String(emp.id), children: [
                  emp.firstName,
                  " ",
                  emp.lastName
                ] }, String(emp.id)))
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "label",
              {
                className: "text-sm font-medium text-muted-foreground",
                htmlFor: "ferien-year-select",
                children: "Kalenderjahr"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "select",
              {
                id: "ferien-year-select",
                value: selectedYearKey,
                onChange: (e) => {
                  setSelectedYearKey(e.target.value);
                  setLedger(null);
                  setVacationBalances([]);
                },
                className: "border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring w-32",
                "data-ocid": "compliance.ferien_year_select",
                children: yearOptions.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: y.key, children: y.label }, y.key))
              }
            )
          ] })
        ] }),
        loading && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "p",
          {
            className: "text-sm text-muted-foreground",
            "data-ocid": "compliance.ferien_loading",
            children: "Laden…"
          }
        ),
        !loading && !selectedEmployeeId && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Bitte einen Mitarbeitenden auswählen." }),
        !loading && selectedEmployeeId && !ledger && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "rounded-lg border border-dashed border-border p-6 text-center",
            "data-ocid": "compliance.ferien_empty_state",
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
              "Kein Ledger für das Kalenderjahr ",
              selectedYearKey,
              " gefunden. Führe eine Wochenkontrolle durch, um Daten zu generieren."
            ] })
          }
        ),
        ledger && !loading && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "overflow-x-auto rounded-lg border border-border",
            "data-ocid": "compliance.ferien_table",
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full border-collapse text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-muted/40 border-b border-border", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium text-muted-foreground", children: "Mitarbeitende/r" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium text-muted-foreground", children: "Kalenderjahr" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right px-4 py-3 font-medium text-muted-foreground", children: "Gesetzlich (Tage)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right px-4 py-3 font-medium text-muted-foreground", children: "Vertraglich (Tage)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-center px-4 py-3 font-medium text-muted-foreground", children: "Compliance" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right px-4 py-3 font-medium text-muted-foreground", children: "Geplant" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right px-4 py-3 font-medium text-muted-foreground", children: "Bezogen" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right px-4 py-3 font-medium text-muted-foreground", children: "Verbleibend" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right px-4 py-3 font-medium text-muted-foreground", children: "Längster Block" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-center px-4 py-3 font-medium text-muted-foreground", children: "2-Wochen-Block" })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border last:border-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-medium text-foreground", children: employeeName }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-foreground", children: displayYear }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3 text-right tabular-nums", children: [
                  ledger.gesetzlicheFerientage,
                  " T"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right tabular-nums", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                    ledger.vertraglicheZusatzferienTage,
                    " T"
                  ] }),
                  ledger.vertraglicheZusatzferienTage === 0 && ledger.gesetzlicheFerientage > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "span",
                    {
                      className: "inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800",
                      title: "Vertraglicher Ferienanspruch nicht hinterlegt – bitte in den Stammdaten prüfen.",
                      children: "Bitte prüfen"
                    }
                  )
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3 text-center", children: [
                  complianceStatus === "below_minimum" && /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "span",
                    {
                      className: "inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800",
                      title: `Gesetzlicher Mindestanspruch: ${gesetzlichDays} Tage. Hinterlegtes Ferienguthaben: ${balanceDays} Tage.`,
                      children: "Unter gesetzl. Minimum"
                    }
                  ),
                  complianceStatus === "no_balance" && /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "span",
                    {
                      className: "inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800",
                      title: "Für dieses Kalenderjahr wurde noch kein Ferienguthaben erfasst.",
                      children: "Kein Guthaben erfasst"
                    }
                  ),
                  complianceStatus === "ok" && /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "span",
                    {
                      className: "inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800",
                      title: `Gesetzlicher Mindestanspruch: ${gesetzlichDays} Tage. Hinterlegtes Ferienguthaben: ${balanceDays} Tage.`,
                      children: "✓ Erfüllt"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3 text-right tabular-nums", children: [
                  ledger.geplanteFerientage,
                  " T"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3 text-right tabular-nums", children: [
                  ledger.bezogeneFerientage,
                  " T"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "td",
                  {
                    className: `px-4 py-3 text-right tabular-nums ${restColor(
                      ledger.verbleibendeFerientage
                    )}`,
                    children: [
                      ledger.verbleibendeFerientage,
                      " T"
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3 text-right tabular-nums", children: [
                  Number(ledger.laengsterZusammenhangenderBlock),
                  " T"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "td",
                  {
                    className: `px-4 py-3 text-center font-medium ${ledger.twoWeekBlockSatisfied ? "text-green-600" : "text-red-600"}`,
                    children: ledger.twoWeekBlockSatisfied ? "✓" : "✗"
                  }
                )
              ] }) })
            ] })
          }
        )
      ]
    }
  );
}
export {
  ComplianceFerienCompliance as default
};
