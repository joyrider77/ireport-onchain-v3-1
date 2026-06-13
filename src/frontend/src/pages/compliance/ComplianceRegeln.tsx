import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuthStore";
import { useActor } from "@caffeineai/core-infrastructure";
import { Edit2, Loader2, RotateCcw, Save, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createActor } from "../../backend";
import type { TenantComplianceRule } from "../../backend";

type AnyActor = Record<string, (...args: unknown[]) => Promise<unknown>>;
const toAny = (a: unknown): AnyActor => a as AnyActor;

interface RuleDefinition {
  code: string;
  name: string;
  beschreibung: string;
  kategorie: string;
  standardwert: number;
  einheit: string;
  legalMinimum: number;
}

const RULE_DEFINITIONS: RuleDefinition[] = [
  {
    code: "REST_TIME",
    name: "Tägliche Ruhezeit",
    beschreibung: "Mindestens 11h zwischen zwei Arbeitseinsätzen",
    kategorie: "Ruhezeit",
    standardwert: 11,
    einheit: "Stunden",
    legalMinimum: 11,
  },
  {
    code: "WEEKEND_REST",
    name: "Wöchentliche Ruhezeit",
    beschreibung: "35h Ruhezeit (Sa 23:00–So 23:00)",
    kategorie: "Ruhezeit",
    standardwert: 35,
    einheit: "Stunden",
    legalMinimum: 35,
  },
  {
    code: "PAUSE_MINIMUM_5H30",
    name: "Mindestpause (>5h 30m)",
    beschreibung: "Bei Arbeitszeit >5.5h: mindestens 15 Min Pause",
    kategorie: "Pausen",
    standardwert: 15,
    einheit: "Minuten",
    legalMinimum: 15,
  },
  {
    code: "PAUSE_MINIMUM_7H",
    name: "Mindestpause (>7h)",
    beschreibung: "Bei Arbeitszeit >7h: mindestens 30 Min Pause",
    kategorie: "Pausen",
    standardwert: 30,
    einheit: "Minuten",
    legalMinimum: 30,
  },
  {
    code: "PAUSE_MINIMUM_9H",
    name: "Mindestpause (>9h)",
    beschreibung: "Bei Arbeitszeit >9h: mindestens 60 Min Pause",
    kategorie: "Pausen",
    standardwert: 60,
    einheit: "Minuten",
    legalMinimum: 60,
  },
  {
    code: "OVERTIME_CONTRACTUAL",
    name: "Vertragliche Überstunden",
    beschreibung: "Toleranzschwelle für Überstunden über der Sollzeit",
    kategorie: "Überzeit",
    standardwert: 0,
    einheit: "Stunden",
    legalMinimum: 0,
  },
  {
    code: "OVERTIME_LEGAL",
    name: "Gesetzliche Überzeit",
    beschreibung: "Wochenhöchstarbeitszeit (45h industrial / 50h commercial)",
    kategorie: "Überzeit",
    standardwert: 45,
    einheit: "Stunden",
    legalMinimum: 45,
  },
  {
    code: "VACATION_MINIMUM",
    name: "Gesetzliches Ferienminimum",
    beschreibung: "Mindestanspruch: 4 Wochen/Jahr (5 Wochen bis 20. LJ)",
    kategorie: "Ferien",
    standardwert: 4,
    einheit: "Wochen",
    legalMinimum: 4,
  },
  {
    code: "VACATION_TWO_WEEK_BLOCK",
    name: "Zusammenhängender Ferienblock",
    beschreibung: "Mindestens 10 Arbeitstage zusammenhängend pro Dienstjahr",
    kategorie: "Ferien",
    standardwert: 10,
    einheit: "Arbeitstage",
    legalMinimum: 10,
  },
];

const KATEGORIE_COLORS: Record<string, string> = {
  Ruhezeit: "bg-blue-100 text-blue-800",
  Pausen: "bg-yellow-100 text-yellow-800",
  Überzeit: "bg-orange-100 text-orange-800",
  Ferien: "bg-green-100 text-green-800",
};

interface EditState {
  code: string;
  value: string;
  isActive: boolean;
}
interface WarningDialog {
  open: boolean;
  code: string;
  newValue: number;
  isActive: boolean;
}

export default function ComplianceRegeln() {
  const { companyId, isAuthenticated, role } = useAuth();
  const { actor, isFetching } = useActor(createActor);

  const [rules, setRules] = useState<TenantComplianceRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [editState, setEditState] = useState<EditState | null>(null);
  const [saving, setSaving] = useState(false);
  const [resetCode, setResetCode] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);
  const [warningDialog, setWarningDialog] = useState<WarningDialog>({
    open: false,
    code: "",
    newValue: 0,
    isActive: true,
  });
  const [saveError, setSaveError] = useState<string | null>(null);

  const canEdit = role === "admin" || role === "manager";
  const enabled = !!actor && !isFetching && isAuthenticated && !!companyId;

  useEffect(() => {
    if (!enabled) return;
    void loadRules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  async function loadRules() {
    if (!actor || !companyId) return;
    setLoading(true);
    try {
      const result = (await toAny(actor).getTenantComplianceRules(
        BigInt(companyId),
      )) as TenantComplianceRule[];
      setRules(result);
    } catch (e) {
      console.error("Fehler beim Laden der Regeln:", e);
    } finally {
      setLoading(false);
    }
  }

  function getRule(code: string): TenantComplianceRule | undefined {
    return rules.find((r) => r.ruleCode === code);
  }

  function getEffectiveValue(def: RuleDefinition): number {
    const rule = getRule(def.code);
    return rule?.customValue !== undefined
      ? rule.customValue
      : def.standardwert;
  }

  function isRuleCustomized(code: string): boolean {
    return getRule(code)?.isCustomized === true;
  }

  function isRuleActive(code: string): boolean {
    const rule = getRule(code);
    if (rule === undefined) return true;
    return rule.isActive;
  }

  function startEdit(def: RuleDefinition) {
    setEditState({
      code: def.code,
      value: String(getEffectiveValue(def)),
      isActive: isRuleActive(def.code),
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
        isActive: editState.isActive,
      });
      return;
    }
    await doSave(editState.code, newValue, editState.isActive);
  }

  async function doSave(code: string, newValue: number, active: boolean) {
    if (!actor || !companyId) return;
    setSaving(true);
    setSaveError(null);
    try {
      const result = (await toAny(actor).updateTenantComplianceRule({
        companyId: BigInt(companyId),
        ruleCode: code,
        newValue,
        isActive: active,
      })) as { ok?: TenantComplianceRule; err?: string };
      if (result.err !== undefined) {
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

  async function handleReset(code: string) {
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

  async function handleToggleActive(code: string) {
    if (!actor || !companyId) return;
    const def = RULE_DEFINITIONS.find((d) => d.code === code);
    if (!def) return;
    await doSave(code, getEffectiveValue(def), !isRuleActive(code));
  }

  return (
    <div className="p-6 space-y-4" data-ocid="compliance.regeln_page">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Regeln</h2>
        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
          Schweizer Arbeitsrecht (OR / ArG)
        </span>
      </div>

      {canEdit && (
        <div className="mb-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
          Administrator und Manager können Regelwerte anpassen. Angepasste Werte
          werden im Audit-Protokoll aufgezeichnet. Werte unterhalb der
          gesetzlichen Vorgaben erfordern eine Bestätigung.
        </div>
      )}

      {loading && (
        <div
          className="flex items-center gap-2 py-4 text-muted-foreground"
          data-ocid="compliance.regeln_loading"
        >
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Regeln werden geladen…</span>
        </div>
      )}

      {!loading && (
        <div
          className="overflow-x-auto rounded-lg border border-border"
          data-ocid="compliance.regeln_table"
        >
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-muted/40 border-b border-border">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Regelname
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Kategorie
                </th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                  CH-Standard
                </th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                  Aktueller Wert
                </th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">
                  Status
                </th>
                {canEdit && (
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                    Aktionen
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {RULE_DEFINITIONS.map((def, idx) => {
                const rule = getRule(def.code);
                const customized = isRuleCustomized(def.code);
                const active = isRuleActive(def.code);
                const effectiveVal = getEffectiveValue(def);
                const isEditing = editState?.code === def.code;

                return (
                  <tr
                    key={def.code}
                    className={`border-b border-border last:border-0 transition-colors ${isEditing ? "bg-muted/30" : "hover:bg-muted/20"} ${!active ? "opacity-60" : ""}`}
                    data-ocid={`compliance.regel_row.${idx + 1}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">
                          {def.name}
                        </span>
                        {customized && (
                          <span className="inline-flex items-center rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-800">
                            Angepasst
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {def.beschreibung}
                      </p>
                      {rule?.modifiedBy && customized && (
                        <p className="text-xs text-muted-foreground mt-0.5 italic">
                          Geändert von: {rule.modifiedBy}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${KATEGORIE_COLORS[def.kategorie] ?? "bg-muted text-foreground"}`}
                      >
                        {def.kategorie}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                      {def.standardwert} {def.einheit}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {isEditing && editState ? (
                        <div className="flex items-center justify-end gap-1">
                          <input
                            type="number"
                            step="0.5"
                            min="0"
                            value={editState.value}
                            onChange={(e) =>
                              setEditState((prev) =>
                                prev
                                  ? { ...prev, value: e.target.value }
                                  : null,
                              )
                            }
                            className="w-20 border border-input rounded px-2 py-1 text-sm bg-background text-right focus:outline-none focus:ring-2 focus:ring-ring"
                            data-ocid={`compliance.regel_value_input.${idx + 1}`}
                          />
                          <span className="text-xs text-muted-foreground">
                            {def.einheit}
                          </span>
                        </div>
                      ) : (
                        <span
                          className={`font-medium ${customized ? (effectiveVal < def.legalMinimum ? "text-red-600" : "text-orange-600") : "text-foreground"}`}
                        >
                          {effectiveVal} {def.einheit}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {isEditing && editState ? (
                        <label className="flex items-center justify-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editState.isActive}
                            onChange={(e) =>
                              setEditState((prev) =>
                                prev
                                  ? { ...prev, isActive: e.target.checked }
                                  : null,
                              )
                            }
                            className="w-4 h-4 accent-[#006066] cursor-pointer"
                            data-ocid={`compliance.regel_active_toggle.${idx + 1}`}
                          />
                          <span className="text-xs text-muted-foreground">
                            Aktiv
                          </span>
                        </label>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            canEdit
                              ? void handleToggleActive(def.code)
                              : undefined
                          }
                          disabled={!canEdit}
                          title={
                            canEdit
                              ? active
                                ? "Deaktivieren"
                                : "Aktivieren"
                              : ""
                          }
                          className={`px-2 py-0.5 rounded text-xs font-medium ${active ? "bg-green-100 text-green-800" : "bg-muted text-muted-foreground"} ${canEdit ? "cursor-pointer hover:opacity-80" : "cursor-default"}`}
                          data-ocid={`compliance.regel_status_toggle.${idx + 1}`}
                        >
                          {active ? "Aktiv" : "Inaktiv"}
                        </button>
                      )}
                    </td>
                    {canEdit && (
                      <td className="px-4 py-3 text-right">
                        {isEditing && editState ? (
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={cancelEdit}
                              disabled={saving}
                              className="h-7 px-2"
                              data-ocid={`compliance.regel_cancel_button.${idx + 1}`}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => void handleSave()}
                              disabled={saving}
                              className="h-7 px-2 bg-[#006066] hover:bg-[#004d52] text-white"
                              data-ocid={`compliance.regel_save_button.${idx + 1}`}
                            >
                              {saving ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Save className="w-3 h-3" />
                              )}
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => startEdit(def)}
                              className="h-7 px-2"
                              title="Regelwert bearbeiten"
                              data-ocid={`compliance.regel_edit_button.${idx + 1}`}
                            >
                              <Edit2 className="w-3 h-3" />
                            </Button>
                            {customized && (
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => void handleReset(def.code)}
                                disabled={resetting && resetCode === def.code}
                                className="h-7 px-2 text-muted-foreground"
                                title="Auf Schweizer Standard zurücksetzen"
                                data-ocid={`compliance.regel_reset_button.${idx + 1}`}
                              >
                                {resetting && resetCode === def.code ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <RotateCcw className="w-3 h-3" />
                                )}
                              </Button>
                            )}
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {saveError && (
        <p
          className="text-sm text-red-600 mt-2"
          data-ocid="compliance.regeln_error_state"
        >
          {saveError}
        </p>
      )}

      {warningDialog.open && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          data-ocid="compliance.regeln_warning_dialog"
        >
          <div className="bg-card rounded-lg shadow-xl p-6 max-w-md w-full mx-4 space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                <span className="text-orange-600 text-sm font-bold">!</span>
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  Achtung: Gesetzliche Vorgaben
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Sie verlassen die Schweizer Arbeitszeitbestimmungen. Der
                  eingegebene Wert liegt unter dem gesetzlichen Minimum. Möchten
                  Sie trotzdem fortfahren?
                </p>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setWarningDialog({
                    open: false,
                    code: "",
                    newValue: 0,
                    isActive: true,
                  })
                }
                data-ocid="compliance.regeln_warning_cancel_button"
              >
                Abbrechen
              </Button>
              <Button
                type="button"
                onClick={() =>
                  void doSave(
                    warningDialog.code,
                    warningDialog.newValue,
                    warningDialog.isActive,
                  )
                }
                disabled={saving}
                className="bg-orange-600 hover:bg-orange-700 text-white"
                data-ocid="compliance.regeln_warning_confirm_button"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Trotzdem speichern"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
