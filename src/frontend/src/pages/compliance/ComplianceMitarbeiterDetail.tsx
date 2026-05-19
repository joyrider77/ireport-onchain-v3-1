import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuthStore";
import { useActor } from "@caffeineai/core-infrastructure";
import { useEffect, useState } from "react";
import { createActor } from "../../backend";
import type {
  ComplianceFinding,
  CompliancePeriodeTyp,
  ComplianceResolutionType,
  ComplianceStatus,
  Employee,
} from "../../backend";

type AnyActor = Record<string, (...args: unknown[]) => Promise<unknown>>;
const toAny = (a: unknown): AnyActor => a as AnyActor;

interface Props {
  employees: Array<Pick<Employee, "id" | "firstName" | "lastName">>;
}

function translateRuleCode(code: string): string {
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

function statusBadgeClass(status: ComplianceStatus | string): string {
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

function formatDate(ns: bigint): string {
  return new Date(Number(ns / 1_000_000n)).toLocaleDateString("de-CH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

const STATUS_LABELS: Record<string, string> = {
  COMPLIANT: "Konform",
  INFO: "Info",
  WARNING: "Warnung",
  BREACH: "Verstoss",
  CRITICAL: "Kritisch",
  FREIGEGEBEN: "Freigegeben",
};

export default function ComplianceMitarbeiterDetail({ employees }: Props) {
  const { isAuthenticated } = useAuth();
  const { actor, isFetching } = useActor(createActor);

  const [selectedEmployeeId, setSelectedEmployeeId] = useState<bigint | null>(
    employees.length > 0 ? employees[0].id : null,
  );
  const [findings, setFindings] = useState<ComplianceFinding[]>([]);
  const [loading, setLoading] = useState(false);
  const [resolveDialog, setResolveDialog] = useState<{
    open: boolean;
    finding: ComplianceFinding | null;
  }>({ open: false, finding: null });
  const [grund, setGrund] = useState("");
  const [kommentar, setKommentar] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const enabled = !!actor && !isFetching && isAuthenticated;

  useEffect(() => {
    if (employees.length > 0 && !selectedEmployeeId) {
      setSelectedEmployeeId(employees[0].id);
    }
  }, [employees, selectedEmployeeId]);

  useEffect(() => {
    if (!enabled || !selectedEmployeeId) return;
    void loadFindings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, selectedEmployeeId]);

  async function loadFindings() {
    if (!actor || !selectedEmployeeId) return;
    setLoading(true);
    try {
      const result = (await toAny(actor).getComplianceFindings(
        selectedEmployeeId,
        null as CompliancePeriodeTyp | null,
        null as Array<ComplianceStatus> | null,
      )) as ComplianceFinding[];
      setFindings(result);
    } catch (e) {
      console.error("Fehler beim Laden der Findings:", e);
    } finally {
      setLoading(false);
    }
  }

  function openResolveDialog(finding: ComplianceFinding) {
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
        resolutionType: "FREIGEGEBEN" as ComplianceResolutionType,
        resolutionReason: `${grund} – ${kommentar}`,
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
    (f) => f.status !== "COMPLIANT" && f.status !== "FREIGEGEBEN",
  );

  return (
    <div
      className="p-6 space-y-4"
      data-ocid="compliance.mitarbeiter_detail_page"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">
          Mitarbeiter-Detail
        </h2>
      </div>

      {/* Employee selector */}
      <div className="w-72">
        <select
          value={selectedEmployeeId ? String(selectedEmployeeId) : ""}
          onChange={(e) =>
            setSelectedEmployeeId(
              e.target.value ? BigInt(e.target.value) : null,
            )
          }
          className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          data-ocid="compliance.mitarbeiter_detail_select"
        >
          <option value="">Mitarbeitende/r wählen…</option>
          {employees.map((emp) => (
            <option key={String(emp.id)} value={String(emp.id)}>
              {emp.firstName} {emp.lastName}
            </option>
          ))}
        </select>
      </div>

      {/* Content */}
      {loading && (
        <p
          className="text-sm text-muted-foreground py-4"
          data-ocid="compliance.mitarbeiter_detail_loading"
        >
          Laden…
        </p>
      )}

      {!loading && selectedEmployeeId && activeFindings.length === 0 && (
        <div
          className="flex items-center gap-2 text-green-600 bg-green-50 rounded-lg p-4 border border-green-200"
          data-ocid="compliance.mitarbeiter_detail_empty"
        >
          <span className="text-lg">✓</span>
          <span className="text-sm font-medium">Keine offenen Befunde</span>
        </div>
      )}

      {!loading && !selectedEmployeeId && (
        <p className="text-sm text-muted-foreground py-4">
          Bitte einen Mitarbeitenden auswählen.
        </p>
      )}

      <div className="space-y-2">
        {activeFindings.map((f, idx) => (
          <div
            key={String(f.id)}
            className="border border-border rounded-lg p-4 bg-card"
            data-ocid={`compliance.finding_card.${idx + 1}`}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className="font-medium text-sm text-foreground">
                {translateRuleCode(f.ruleCode)}
              </span>
              <span className={statusBadgeClass(f.status)}>
                {STATUS_LABELS[f.status as string] ?? f.status}
              </span>
            </div>
            <p className="text-sm text-foreground mb-2">{f.meldung}</p>
            <div className="text-xs text-muted-foreground">
              Ist: {f.istWert} {f.einheit} | Soll: {f.sollWert} {f.einheit}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {formatDate(f.createdAt)}
            </div>
            {(f.status === "BREACH" || f.status === "CRITICAL") && (
              <button
                type="button"
                onClick={() => openResolveDialog(f)}
                className="mt-3 text-sm text-primary underline hover:no-underline"
                data-ocid={`compliance.freigabe_button.${idx + 1}`}
              >
                Freigeben
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Also show FREIGEGEBEN findings collapsed */}
      {findings.filter((f) => f.status === "FREIGEGEBEN").length > 0 && (
        <details className="mt-4">
          <summary className="text-sm text-muted-foreground cursor-pointer select-none">
            {findings.filter((f) => f.status === "FREIGEGEBEN").length}{" "}
            freigegebene Befunde anzeigen
          </summary>
          <div className="space-y-2 mt-2">
            {findings
              .filter((f) => f.status === "FREIGEGEBEN")
              .map((f, idx) => (
                <div
                  key={String(f.id)}
                  className="border border-border rounded-lg p-3 bg-muted/30"
                  data-ocid={`compliance.freigegeben_card.${idx + 1}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm text-muted-foreground">
                      {translateRuleCode(f.ruleCode)}
                    </span>
                    <span className={statusBadgeClass(f.status)}>
                      {STATUS_LABELS[f.status as string] ?? f.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {f.meldung}
                  </p>
                  {f.resolutionReason && (
                    <p className="text-xs text-muted-foreground mt-1 italic">
                      Begründung: {f.resolutionReason}
                    </p>
                  )}
                </div>
              ))}
          </div>
        </details>
      )}

      {/* Freigabe Dialog */}
      {resolveDialog.open && resolveDialog.finding && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          data-ocid="compliance.freigabe_dialog"
        >
          <div className="bg-card rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-base font-semibold text-foreground mb-1">
              Verstoss freigeben
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {resolveDialog.finding.meldung}
            </p>

            <label
              htmlFor="freigabe-grund"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Freigabegrund *
            </label>
            <input
              id="freigabe-grund"
              value={grund}
              onChange={(e) => setGrund(e.target.value)}
              className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background mb-3 focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Grund für die Freigabe…"
              data-ocid="compliance.freigabe_grund_input"
            />

            <label
              htmlFor="freigabe-kommentar"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Kommentar *
            </label>
            <textarea
              id="freigabe-kommentar"
              value={kommentar}
              onChange={(e) => setKommentar(e.target.value)}
              className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background mb-4 focus:outline-none focus:ring-2 focus:ring-ring"
              rows={3}
              placeholder="Detaillierter Kommentar…"
              data-ocid="compliance.freigabe_kommentar_input"
            />

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={closeDialog}
                data-ocid="compliance.freigabe_cancel_button"
              >
                Abbrechen
              </Button>
              <Button
                type="button"
                onClick={() => void submitFreigabe()}
                disabled={!grund || !kommentar || submitting}
                className="bg-[#006066] hover:bg-[#004d52] text-white"
                data-ocid="compliance.freigabe_confirm_button"
              >
                {submitting ? "Wird freigegeben…" : "Freigeben"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
