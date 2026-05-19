import { r as reactExports, j as jsxRuntimeExports } from "./index-Blf-A8DR.js";
import { B as Button } from "./button-DCGMFvti.js";
import { b as useAuth, u as useActor, c as createActor } from "./useAuthStore-Cbv7GIMf.js";
import "./index-Dv8dTxpA.js";
const toAny = (a) => a;
function translateRuleCode(code) {
  switch (code) {
    case "REST_TIME":
      return "Ruhezeit";
    case "PAUSE_MINIMUM":
    case "PAUSE_MIN_5H30":
    case "PAUSE_MIN_7H":
    case "PAUSE_MIN_9H":
      return "Mindestpause";
    case "OVERTIME_CONTRACTUAL":
      return "Vertragliche Überstunden";
    case "OVERTIME_LEGAL":
      return "Gesetzliche Überzeit";
    case "VACATION_MINIMUM":
      return "Ferienminimum";
    case "VACATION_TWO_WEEK_BLOCK":
      return "2-Wochen-Ferienblock";
    case "WEEKEND_REST_TIME":
      return "Wöchentliche Ruhezeit";
    default:
      return code;
  }
}
function statusBadgeClass(status) {
  const base = "px-2 py-0.5 rounded text-xs font-medium";
  switch (status) {
    case "COMPLIANT":
      return `${base} bg-green-100 text-green-800`;
    case "INFO":
      return `${base} bg-blue-100 text-blue-800`;
    case "WARNING":
      return `${base} bg-yellow-100 text-yellow-800`;
    case "BREACH":
      return `${base} bg-red-100 text-red-800`;
    case "CRITICAL":
      return `${base} bg-red-200 text-red-900`;
    case "FREIGEGEBEN":
      return `${base} bg-gray-100 text-gray-600`;
    default:
      return `${base} bg-gray-100 text-gray-600`;
  }
}
function formatDate(ns) {
  return new Date(Number(ns / 1000000n)).toLocaleDateString("de-CH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}
const STATUS_LABELS = {
  COMPLIANT: "Konform",
  INFO: "Info",
  WARNING: "Warnung",
  BREACH: "Verstoss",
  CRITICAL: "Kritisch",
  FREIGEGEBEN: "Freigegeben"
};
function ComplianceMitarbeiterDetail({ employees }) {
  const { isAuthenticated } = useAuth();
  const { actor, isFetching } = useActor(createActor);
  const [selectedEmployeeId, setSelectedEmployeeId] = reactExports.useState(
    employees.length > 0 ? employees[0].id : null
  );
  const [findings, setFindings] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(false);
  const [resolveDialog, setResolveDialog] = reactExports.useState({ open: false, finding: null });
  const [grund, setGrund] = reactExports.useState("");
  const [kommentar, setKommentar] = reactExports.useState("");
  const [submitting, setSubmitting] = reactExports.useState(false);
  const enabled = !!actor && !isFetching && isAuthenticated;
  reactExports.useEffect(() => {
    if (employees.length > 0 && !selectedEmployeeId) {
      setSelectedEmployeeId(employees[0].id);
    }
  }, [employees, selectedEmployeeId]);
  reactExports.useEffect(() => {
    if (!enabled || !selectedEmployeeId) return;
    void loadFindings();
  }, [enabled, selectedEmployeeId]);
  async function loadFindings() {
    if (!actor || !selectedEmployeeId) return;
    setLoading(true);
    try {
      const result = await toAny(actor).getComplianceFindings(
        selectedEmployeeId,
        null,
        null
      );
      setFindings(result);
    } catch (e) {
      console.error("Fehler beim Laden der Findings:", e);
    } finally {
      setLoading(false);
    }
  }
  function openResolveDialog(finding) {
    setGrund("");
    setKommentar("");
    setResolveDialog({ open: true, finding });
  }
  function closeDialog() {
    setResolveDialog({ open: false, finding: null });
    setGrund("");
    setKommentar("");
  }
  async function submitFreigabe() {
    if (!actor || !resolveDialog.finding || !grund || !kommentar) return;
    setSubmitting(true);
    try {
      await toAny(actor).resolveFinding({
        findingId: resolveDialog.finding.id,
        resolutionType: "FREIGEGEBEN",
        resolutionReason: `${grund} – ${kommentar}`
      });
      closeDialog();
      await loadFindings();
    } catch (e) {
      console.error("Fehler beim Freigeben:", e);
    } finally {
      setSubmitting(false);
    }
  }
  const activeFindings = findings.filter(
    (f) => f.status !== "COMPLIANT" && f.status !== "FREIGEGEBEN"
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "p-6 space-y-4",
      "data-ocid": "compliance.mitarbeiter_detail_page",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold text-foreground", children: "Mitarbeiter-Detail" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-72", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "select",
          {
            value: selectedEmployeeId ? String(selectedEmployeeId) : "",
            onChange: (e) => setSelectedEmployeeId(
              e.target.value ? BigInt(e.target.value) : null
            ),
            className: "w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring",
            "data-ocid": "compliance.mitarbeiter_detail_select",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Mitarbeitende/r wählen…" }),
              employees.map((emp) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: String(emp.id), children: [
                emp.firstName,
                " ",
                emp.lastName
              ] }, String(emp.id)))
            ]
          }
        ) }),
        loading && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "p",
          {
            className: "text-sm text-muted-foreground py-4",
            "data-ocid": "compliance.mitarbeiter_detail_loading",
            children: "Laden…"
          }
        ),
        !loading && selectedEmployeeId && activeFindings.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "flex items-center gap-2 text-green-600 bg-green-50 rounded-lg p-4 border border-green-200",
            "data-ocid": "compliance.mitarbeiter_detail_empty",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg", children: "✓" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium", children: "Keine offenen Befunde" })
            ]
          }
        ),
        !loading && !selectedEmployeeId && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground py-4", children: "Bitte einen Mitarbeitenden auswählen." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: activeFindings.map((f, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "border border-border rounded-lg p-4 bg-card",
            "data-ocid": `compliance.finding_card.${idx + 1}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2 mb-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-sm text-foreground", children: translateRuleCode(f.ruleCode) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: statusBadgeClass(f.status), children: STATUS_LABELS[f.status] ?? f.status })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-foreground mb-2", children: f.meldung }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
                "Ist: ",
                f.istWert,
                " ",
                f.einheit,
                " | Soll: ",
                f.sollWert,
                " ",
                f.einheit
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground mt-0.5", children: formatDate(f.createdAt) }),
              (f.status === "BREACH" || f.status === "CRITICAL") && /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  onClick: () => openResolveDialog(f),
                  className: "mt-3 text-sm text-primary underline hover:no-underline",
                  "data-ocid": `compliance.freigabe_button.${idx + 1}`,
                  children: "Freigeben"
                }
              )
            ]
          },
          String(f.id)
        )) }),
        findings.filter((f) => f.status === "FREIGEGEBEN").length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { className: "mt-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("summary", { className: "text-sm text-muted-foreground cursor-pointer select-none", children: [
            findings.filter((f) => f.status === "FREIGEGEBEN").length,
            " ",
            "freigegebene Befunde anzeigen"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2 mt-2", children: findings.filter((f) => f.status === "FREIGEGEBEN").map((f, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "border border-border rounded-lg p-3 bg-muted/30",
              "data-ocid": `compliance.freigegeben_card.${idx + 1}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-muted-foreground", children: translateRuleCode(f.ruleCode) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: statusBadgeClass(f.status), children: STATUS_LABELS[f.status] ?? f.status })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: f.meldung }),
                f.resolutionReason && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-1 italic", children: [
                  "Begründung: ",
                  f.resolutionReason
                ] })
              ]
            },
            String(f.id)
          )) })
        ] }),
        resolveDialog.open && resolveDialog.finding && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "fixed inset-0 bg-black/50 flex items-center justify-center z-50",
            "data-ocid": "compliance.freigabe_dialog",
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card rounded-lg shadow-xl p-6 max-w-md w-full mx-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-base font-semibold text-foreground mb-1", children: "Verstoss freigeben" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mb-4", children: resolveDialog.finding.meldung }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "label",
                {
                  htmlFor: "freigabe-grund",
                  className: "block text-sm font-medium text-foreground mb-1",
                  children: "Freigabegrund *"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  id: "freigabe-grund",
                  value: grund,
                  onChange: (e) => setGrund(e.target.value),
                  className: "w-full border border-input rounded-md px-3 py-2 text-sm bg-background mb-3 focus:outline-none focus:ring-2 focus:ring-ring",
                  placeholder: "Grund für die Freigabe…",
                  "data-ocid": "compliance.freigabe_grund_input"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "label",
                {
                  htmlFor: "freigabe-kommentar",
                  className: "block text-sm font-medium text-foreground mb-1",
                  children: "Kommentar *"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "textarea",
                {
                  id: "freigabe-kommentar",
                  value: kommentar,
                  onChange: (e) => setKommentar(e.target.value),
                  className: "w-full border border-input rounded-md px-3 py-2 text-sm bg-background mb-4 focus:outline-none focus:ring-2 focus:ring-ring",
                  rows: 3,
                  placeholder: "Detaillierter Kommentar…",
                  "data-ocid": "compliance.freigabe_kommentar_input"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 justify-end", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    type: "button",
                    variant: "outline",
                    onClick: closeDialog,
                    "data-ocid": "compliance.freigabe_cancel_button",
                    children: "Abbrechen"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    type: "button",
                    onClick: () => void submitFreigabe(),
                    disabled: !grund || !kommentar || submitting,
                    className: "bg-[#006066] hover:bg-[#004d52] text-white",
                    "data-ocid": "compliance.freigabe_confirm_button",
                    children: submitting ? "Wird freigegeben…" : "Freigeben"
                  }
                )
              ] })
            ] })
          }
        )
      ]
    }
  );
}
export {
  ComplianceMitarbeiterDetail as default
};
