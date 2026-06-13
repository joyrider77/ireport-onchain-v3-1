import { r as reactExports, j as jsxRuntimeExports } from "./index-D_yjRFGt.js";
import { B as Button } from "./button-BXNzWYpr.js";
import { d as useAuth, u as useActor, c as createActor } from "./useAuthStore-RPelH0kd.js";
import { L as LoaderCircle } from "./loader-circle-DPIlcj_m.js";
import { X } from "./x-BHvIGru9.js";
import { S as Save } from "./save-Cu4HicBy.js";
import { P as Pen } from "./pen-Sv4c0ccJ.js";
import { R as RotateCcw } from "./rotate-ccw-C6yEopyQ.js";
import "./index-HGa3Ynxo.js";
import "./createLucideIcon-C599ATMm.js";
const toAny = (a) => a;
const RULE_DEFINITIONS = [
  {
    code: "REST_TIME",
    name: "Tägliche Ruhezeit",
    beschreibung: "Mindestens 11h zwischen zwei Arbeitseinsätzen",
    kategorie: "Ruhezeit",
    standardwert: 11,
    einheit: "Stunden",
    legalMinimum: 11
  },
  {
    code: "WEEKEND_REST",
    name: "Wöchentliche Ruhezeit",
    beschreibung: "35h Ruhezeit (Sa 23:00–So 23:00)",
    kategorie: "Ruhezeit",
    standardwert: 35,
    einheit: "Stunden",
    legalMinimum: 35
  },
  {
    code: "PAUSE_MINIMUM_5H30",
    name: "Mindestpause (>5h 30m)",
    beschreibung: "Bei Arbeitszeit >5.5h: mindestens 15 Min Pause",
    kategorie: "Pausen",
    standardwert: 15,
    einheit: "Minuten",
    legalMinimum: 15
  },
  {
    code: "PAUSE_MINIMUM_7H",
    name: "Mindestpause (>7h)",
    beschreibung: "Bei Arbeitszeit >7h: mindestens 30 Min Pause",
    kategorie: "Pausen",
    standardwert: 30,
    einheit: "Minuten",
    legalMinimum: 30
  },
  {
    code: "PAUSE_MINIMUM_9H",
    name: "Mindestpause (>9h)",
    beschreibung: "Bei Arbeitszeit >9h: mindestens 60 Min Pause",
    kategorie: "Pausen",
    standardwert: 60,
    einheit: "Minuten",
    legalMinimum: 60
  },
  {
    code: "OVERTIME_CONTRACTUAL",
    name: "Vertragliche Überstunden",
    beschreibung: "Toleranzschwelle für Überstunden über der Sollzeit",
    kategorie: "Überzeit",
    standardwert: 0,
    einheit: "Stunden",
    legalMinimum: 0
  },
  {
    code: "OVERTIME_LEGAL",
    name: "Gesetzliche Überzeit",
    beschreibung: "Wochenhöchstarbeitszeit (45h industrial / 50h commercial)",
    kategorie: "Überzeit",
    standardwert: 45,
    einheit: "Stunden",
    legalMinimum: 45
  },
  {
    code: "VACATION_MINIMUM",
    name: "Gesetzliches Ferienminimum",
    beschreibung: "Mindestanspruch: 4 Wochen/Jahr (5 Wochen bis 20. LJ)",
    kategorie: "Ferien",
    standardwert: 4,
    einheit: "Wochen",
    legalMinimum: 4
  },
  {
    code: "VACATION_TWO_WEEK_BLOCK",
    name: "Zusammenhängender Ferienblock",
    beschreibung: "Mindestens 10 Arbeitstage zusammenhängend pro Dienstjahr",
    kategorie: "Ferien",
    standardwert: 10,
    einheit: "Arbeitstage",
    legalMinimum: 10
  }
];
const KATEGORIE_COLORS = {
  Ruhezeit: "bg-blue-100 text-blue-800",
  Pausen: "bg-yellow-100 text-yellow-800",
  Überzeit: "bg-orange-100 text-orange-800",
  Ferien: "bg-green-100 text-green-800"
};
function ComplianceRegeln() {
  const { companyId, isAuthenticated, role } = useAuth();
  const { actor, isFetching } = useActor(createActor);
  const [rules, setRules] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(false);
  const [editState, setEditState] = reactExports.useState(null);
  const [saving, setSaving] = reactExports.useState(false);
  const [resetCode, setResetCode] = reactExports.useState(null);
  const [resetting, setResetting] = reactExports.useState(false);
  const [warningDialog, setWarningDialog] = reactExports.useState({
    open: false,
    code: "",
    newValue: 0,
    isActive: true
  });
  const [saveError, setSaveError] = reactExports.useState(null);
  const canEdit = role === "admin" || role === "manager";
  const enabled = !!actor && !isFetching && isAuthenticated && !!companyId;
  reactExports.useEffect(() => {
    if (!enabled) return;
    void loadRules();
  }, [enabled]);
  async function loadRules() {
    if (!actor || !companyId) return;
    setLoading(true);
    try {
      const result = await toAny(actor).getTenantComplianceRules(
        BigInt(companyId)
      );
      setRules(result);
    } catch (e) {
      console.error("Fehler beim Laden der Regeln:", e);
    } finally {
      setLoading(false);
    }
  }
  function getRule(code) {
    return rules.find((r) => r.ruleCode === code);
  }
  function getEffectiveValue(def) {
    const rule = getRule(def.code);
    return (rule == null ? void 0 : rule.customValue) !== void 0 ? rule.customValue : def.standardwert;
  }
  function isRuleCustomized(code) {
    var _a;
    return ((_a = getRule(code)) == null ? void 0 : _a.isCustomized) === true;
  }
  function isRuleActive(code) {
    const rule = getRule(code);
    if (rule === void 0) return true;
    return rule.isActive;
  }
  function startEdit(def) {
    setEditState({
      code: def.code,
      value: String(getEffectiveValue(def)),
      isActive: isRuleActive(def.code)
    });
    setSaveError(null);
  }
  function cancelEdit() {
    setEditState(null);
    setSaveError(null);
  }
  async function handleSave() {
    if (!editState || !actor || !companyId) return;
    const def = RULE_DEFINITIONS.find((d) => d.code === editState.code);
    if (!def) return;
    const newValue = Number.parseFloat(editState.value);
    if (Number.isNaN(newValue) || newValue < 0) {
      setSaveError("Bitte einen gültigen Wert eingeben.");
      return;
    }
    if (newValue < def.legalMinimum) {
      setWarningDialog({
        open: true,
        code: editState.code,
        newValue,
        isActive: editState.isActive
      });
      return;
    }
    await doSave(editState.code, newValue, editState.isActive);
  }
  async function doSave(code, newValue, active) {
    if (!actor || !companyId) return;
    setSaving(true);
    setSaveError(null);
    try {
      const result = await toAny(actor).updateTenantComplianceRule({
        companyId: BigInt(companyId),
        ruleCode: code,
        newValue,
        isActive: active
      });
      if (result.err !== void 0) {
        setSaveError(result.err);
      } else {
        setEditState(null);
        await loadRules();
      }
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Unbekannter Fehler");
    } finally {
      setSaving(false);
      setWarningDialog({ open: false, code: "", newValue: 0, isActive: true });
    }
  }
  async function handleReset(code) {
    if (!actor || !companyId) return;
    setResetCode(code);
    setResetting(true);
    try {
      await toAny(actor).resetTenantComplianceRule(BigInt(companyId), code);
      await loadRules();
    } catch (e) {
      console.error("Fehler beim Zurücksetzen:", e);
    } finally {
      setResetting(false);
      setResetCode(null);
    }
  }
  async function handleToggleActive(code) {
    if (!actor || !companyId) return;
    const def = RULE_DEFINITIONS.find((d) => d.code === code);
    if (!def) return;
    await doSave(code, getEffectiveValue(def), !isRuleActive(code));
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 space-y-4", "data-ocid": "compliance.regeln_page", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold text-foreground", children: "Regeln" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground bg-muted px-2 py-1 rounded", children: "Schweizer Arbeitsrecht (OR / ArG)" })
    ] }),
    canEdit && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800", children: "Administrator und Manager können Regelwerte anpassen. Angepasste Werte werden im Audit-Protokoll aufgezeichnet. Werte unterhalb der gesetzlichen Vorgaben erfordern eine Bestätigung." }),
    loading && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "flex items-center gap-2 py-4 text-muted-foreground",
        "data-ocid": "compliance.regeln_loading",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: "Regeln werden geladen…" })
        ]
      }
    ),
    !loading && /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "overflow-x-auto rounded-lg border border-border",
        "data-ocid": "compliance.regeln_table",
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full border-collapse text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-muted/40 border-b border-border", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium text-muted-foreground", children: "Regelname" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium text-muted-foreground", children: "Kategorie" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right px-4 py-3 font-medium text-muted-foreground", children: "CH-Standard" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right px-4 py-3 font-medium text-muted-foreground", children: "Aktueller Wert" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-center px-4 py-3 font-medium text-muted-foreground", children: "Status" }),
            canEdit && /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right px-4 py-3 font-medium text-muted-foreground", children: "Aktionen" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: RULE_DEFINITIONS.map((def, idx) => {
            const rule = getRule(def.code);
            const customized = isRuleCustomized(def.code);
            const active = isRuleActive(def.code);
            const effectiveVal = getEffectiveValue(def);
            const isEditing = (editState == null ? void 0 : editState.code) === def.code;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "tr",
              {
                className: `border-b border-border last:border-0 transition-colors ${isEditing ? "bg-muted/30" : "hover:bg-muted/20"} ${!active ? "opacity-60" : ""}`,
                "data-ocid": `compliance.regel_row.${idx + 1}`,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground", children: def.name }),
                      customized && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-800", children: "Angepasst" })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: def.beschreibung }),
                    (rule == null ? void 0 : rule.modifiedBy) && customized && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-0.5 italic", children: [
                      "Geändert von: ",
                      rule.modifiedBy
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "span",
                    {
                      className: `px-2 py-0.5 rounded text-xs font-medium ${KATEGORIE_COLORS[def.kategorie] ?? "bg-muted text-foreground"}`,
                      children: def.kategorie
                    }
                  ) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3 text-right tabular-nums text-muted-foreground", children: [
                    def.standardwert,
                    " ",
                    def.einheit
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right tabular-nums", children: isEditing && editState ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "input",
                      {
                        type: "number",
                        step: "0.5",
                        min: "0",
                        value: editState.value,
                        onChange: (e) => setEditState(
                          (prev) => prev ? { ...prev, value: e.target.value } : null
                        ),
                        className: "w-20 border border-input rounded px-2 py-1 text-sm bg-background text-right focus:outline-none focus:ring-2 focus:ring-ring",
                        "data-ocid": `compliance.regel_value_input.${idx + 1}`
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: def.einheit })
                  ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "span",
                    {
                      className: `font-medium ${customized ? effectiveVal < def.legalMinimum ? "text-red-600" : "text-orange-600" : "text-foreground"}`,
                      children: [
                        effectiveVal,
                        " ",
                        def.einheit
                      ]
                    }
                  ) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-center", children: isEditing && editState ? /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center justify-center gap-2 cursor-pointer", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "input",
                      {
                        type: "checkbox",
                        checked: editState.isActive,
                        onChange: (e) => setEditState(
                          (prev) => prev ? { ...prev, isActive: e.target.checked } : null
                        ),
                        className: "w-4 h-4 accent-[#006066] cursor-pointer",
                        "data-ocid": `compliance.regel_active_toggle.${idx + 1}`
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "Aktiv" })
                  ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      type: "button",
                      onClick: () => canEdit ? void handleToggleActive(def.code) : void 0,
                      disabled: !canEdit,
                      title: canEdit ? active ? "Deaktivieren" : "Aktivieren" : "",
                      className: `px-2 py-0.5 rounded text-xs font-medium ${active ? "bg-green-100 text-green-800" : "bg-muted text-muted-foreground"} ${canEdit ? "cursor-pointer hover:opacity-80" : "cursor-default"}`,
                      "data-ocid": `compliance.regel_status_toggle.${idx + 1}`,
                      children: active ? "Aktiv" : "Inaktiv"
                    }
                  ) }),
                  canEdit && /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right", children: isEditing && editState ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Button,
                      {
                        type: "button",
                        size: "sm",
                        variant: "outline",
                        onClick: cancelEdit,
                        disabled: saving,
                        className: "h-7 px-2",
                        "data-ocid": `compliance.regel_cancel_button.${idx + 1}`,
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-3 h-3" })
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Button,
                      {
                        type: "button",
                        size: "sm",
                        onClick: () => void handleSave(),
                        disabled: saving,
                        className: "h-7 px-2 bg-[#006066] hover:bg-[#004d52] text-white",
                        "data-ocid": `compliance.regel_save_button.${idx + 1}`,
                        children: saving ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-3 h-3 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "w-3 h-3" })
                      }
                    )
                  ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Button,
                      {
                        type: "button",
                        size: "sm",
                        variant: "outline",
                        onClick: () => startEdit(def),
                        className: "h-7 px-2",
                        title: "Regelwert bearbeiten",
                        "data-ocid": `compliance.regel_edit_button.${idx + 1}`,
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pen, { className: "w-3 h-3" })
                      }
                    ),
                    customized && /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Button,
                      {
                        type: "button",
                        size: "sm",
                        variant: "outline",
                        onClick: () => void handleReset(def.code),
                        disabled: resetting && resetCode === def.code,
                        className: "h-7 px-2 text-muted-foreground",
                        title: "Auf Schweizer Standard zurücksetzen",
                        "data-ocid": `compliance.regel_reset_button.${idx + 1}`,
                        children: resetting && resetCode === def.code ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-3 h-3 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "w-3 h-3" })
                      }
                    )
                  ] }) })
                ]
              },
              def.code
            );
          }) })
        ] })
      }
    ),
    saveError && /* @__PURE__ */ jsxRuntimeExports.jsx(
      "p",
      {
        className: "text-sm text-red-600 mt-2",
        "data-ocid": "compliance.regeln_error_state",
        children: saveError
      }
    ),
    warningDialog.open && /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "fixed inset-0 bg-black/50 flex items-center justify-center z-50",
        "data-ocid": "compliance.regeln_warning_dialog",
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card rounded-lg shadow-xl p-6 max-w-md w-full mx-4 space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-orange-600 text-sm font-bold", children: "!" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-base font-semibold text-foreground", children: "Achtung: Gesetzliche Vorgaben" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Sie verlassen die Schweizer Arbeitszeitbestimmungen. Der eingegebene Wert liegt unter dem gesetzlichen Minimum. Möchten Sie trotzdem fortfahren?" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 justify-end", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                type: "button",
                variant: "outline",
                onClick: () => setWarningDialog({
                  open: false,
                  code: "",
                  newValue: 0,
                  isActive: true
                }),
                "data-ocid": "compliance.regeln_warning_cancel_button",
                children: "Abbrechen"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                type: "button",
                onClick: () => void doSave(
                  warningDialog.code,
                  warningDialog.newValue,
                  warningDialog.isActive
                ),
                disabled: saving,
                className: "bg-orange-600 hover:bg-orange-700 text-white",
                "data-ocid": "compliance.regeln_warning_confirm_button",
                children: saving ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin" }) : "Trotzdem speichern"
              }
            )
          ] })
        ] })
      }
    )
  ] });
}
export {
  ComplianceRegeln as default
};
