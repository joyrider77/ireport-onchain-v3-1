import { j as jsxRuntimeExports } from "./index-Blf-A8DR.js";
const rules = [
  {
    code: "REST_TIME",
    name: "Tägliche Ruhezeit",
    beschreibung: "Mindestens 11h zwischen zwei Arbeitseinsätzen",
    kategorie: "Ruhezeit",
    standardwert: "11 Stunden"
  },
  {
    code: "WEEKEND_REST_TIME",
    name: "Wöchentliche Ruhezeit",
    beschreibung: "35h Ruhezeit (Sa 23:00–So 23:00)",
    kategorie: "Ruhezeit",
    standardwert: "35 Stunden"
  },
  {
    code: "PAUSE_MIN_5H30",
    name: "Mindestpause (>5h 30m)",
    beschreibung: "Bei Arbeitszeit >5.5h: mindestens 15 Min Pause",
    kategorie: "Pausen",
    standardwert: "15 Minuten"
  },
  {
    code: "PAUSE_MIN_7H",
    name: "Mindestpause (>7h)",
    beschreibung: "Bei Arbeitszeit >7h: mindestens 30 Min Pause",
    kategorie: "Pausen",
    standardwert: "30 Minuten"
  },
  {
    code: "PAUSE_MIN_9H",
    name: "Mindestpause (>9h)",
    beschreibung: "Bei Arbeitszeit >9h: mindestens 60 Min Pause",
    kategorie: "Pausen",
    standardwert: "60 Minuten"
  },
  {
    code: "OVERTIME_CONTRACTUAL",
    name: "Vertragliche Überstunden",
    beschreibung: "Arbeitszeit über der vertraglichen Sollzeit",
    kategorie: "Überzeit",
    standardwert: "0 Stunden Toleranz"
  },
  {
    code: "OVERTIME_LEGAL",
    name: "Gesetzliche Überzeit",
    beschreibung: "Arbeitszeit über der gesetzlichen Wochenhöchstarbeitszeit (45h oder 50h)",
    kategorie: "Überzeit",
    standardwert: "45 / 50 Stunden"
  },
  {
    code: "VACATION_MINIMUM",
    name: "Gesetzliches Ferienminimum",
    beschreibung: "Mindestens 4 Wochen Ferien/Jahr (5 bis 20. Lebensjahr)",
    kategorie: "Ferien",
    standardwert: "4 Wochen (5 bis 20. LJ)"
  },
  {
    code: "VACATION_TWO_WEEK_BLOCK",
    name: "Zusammenhängender Ferienblock",
    beschreibung: "Mindestens 10 Arbeitstage zusammenhängend pro Dienstjahr",
    kategorie: "Ferien",
    standardwert: "10 Arbeitstage"
  }
];
const kategorieColors = {
  Ruhezeit: "bg-blue-100 text-blue-800",
  Pausen: "bg-yellow-100 text-yellow-800",
  Überzeit: "bg-orange-100 text-orange-800",
  Ferien: "bg-green-100 text-green-800"
};
function ComplianceRegeln() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 space-y-4", "data-ocid": "compliance.regeln_page", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800", children: "Die angezeigten Regeln entsprechen den Schweizer gesetzlichen Vorgaben. Das manuelle Anpassen von Regelparametern wird in einer zukünftigen Version ermöglicht." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold text-foreground", children: "Regeln" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground bg-muted px-2 py-1 rounded", children: "Schweizer Arbeitsrecht (OR / ArG)" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto rounded-lg border border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "table",
      {
        className: "w-full border-collapse text-sm",
        "data-ocid": "compliance.regeln_table",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-muted/40 border-b border-border", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium text-muted-foreground", children: "Regelname" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium text-muted-foreground", children: "Beschreibung" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium text-muted-foreground", children: "Kategorie" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium text-muted-foreground", children: "Standardwert" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium text-muted-foreground", children: "Status" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: rules.map((rule, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "tr",
            {
              className: "border-b border-border last:border-0 hover:bg-muted/20 transition-colors",
              "data-ocid": `compliance.regel_row.${idx + 1}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-medium text-foreground", children: rule.name }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-muted-foreground max-w-xs", children: rule.beschreibung }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "span",
                  {
                    className: `px-2 py-0.5 rounded text-xs font-medium ${kategorieColors[rule.kategorie] ?? "bg-gray-100 text-gray-700"}`,
                    children: rule.kategorie
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 tabular-nums text-foreground", children: rule.standardwert }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs font-medium", children: "Aktiv" }) })
              ]
            },
            rule.code
          )) })
        ]
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-4", children: "Diese Regelwerte entsprechen der Schweizer Gesetzgebung (OR, ArG). Individuelle Anpassungen sind in einer späteren Version konfigurierbar." })
  ] });
}
export {
  ComplianceRegeln as default
};
