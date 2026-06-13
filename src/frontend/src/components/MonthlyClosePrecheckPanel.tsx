import type { PrecheckResult, PrecheckVerdict } from "@/backend";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Loader2,
} from "lucide-react";

interface MonthlyClosePrecheckPanelProps {
  result: PrecheckResult | null;
  loading?: boolean;
  error?: string | null;
}

const VERDICT_LABEL: Record<string, string> = {
  ok: "Abschliessbar",
  ok_with_warnings: "Abschliessbar mit Warnungen",
  blocked: "Nicht abschliessbar",
};

function VerdictIcon({ verdict }: { verdict: PrecheckVerdict | string }) {
  if (verdict === "ok")
    return <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />;
  if (verdict === "ok_with_warnings")
    return (
      <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-500 flex-shrink-0" />
    );
  return <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />;
}

export function MonthlyClosePrecheckPanel({
  result,
  loading = false,
  error = null,
}: MonthlyClosePrecheckPanelProps) {
  if (loading) {
    return (
      <div
        data-ocid="period-close.precheck_panel.loading_state"
        className="period-precheck-panel flex items-center gap-2 text-muted-foreground"
      >
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Vorprüfung wird durchgeführt…</span>
      </div>
    );
  }
  if (error) {
    return (
      <div
        data-ocid="period-close.precheck_panel.error_state"
        className="period-precheck-panel period-precheck-item error"
      >
        <AlertCircle className="w-4 h-4" />
        <span>Vorprüfung fehlgeschlagen: {error}</span>
      </div>
    );
  }
  if (!result) return null;

  const {
    verdict,
    blockers,
    warnings,
    hasOpenEntries,
    hasOpenAbsences,
    hasOpenExpenses,
    hasComplianceViolations,
    missingDays,
  } = result;

  return (
    <div
      data-ocid="period-close.precheck_panel"
      className="period-precheck-panel"
    >
      <div className="flex items-center gap-2 font-medium">
        <VerdictIcon verdict={verdict} />
        <span>Vorprüfung: {VERDICT_LABEL[verdict] ?? verdict}</span>
      </div>

      {/* Summary items */}
      <div className="space-y-1 mt-2">
        {hasOpenEntries && (
          <div className="period-precheck-item warning">
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>
              Provisorische oder nicht validierte Zeiteinträge vorhanden
            </span>
          </div>
        )}
        {hasOpenAbsences && (
          <div className="period-precheck-item warning">
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Offene Ferien- oder Abwesenheitsanträge vorhanden</span>
          </div>
        )}
        {hasOpenExpenses && (
          <div className="period-precheck-item warning">
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Offene Spesen vorhanden</span>
          </div>
        )}
        {hasComplianceViolations && (
          <div className="period-precheck-item warning">
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Compliance-Verletzungen festgestellt</span>
          </div>
        )}
        {Number(missingDays) > 0 && (
          <div className="period-precheck-item warning">
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>
              {Number(missingDays)} Tag(e) ohne Zeiterfassung trotz Sollzeit
            </span>
          </div>
        )}
      </div>

      {/* Blockers */}
      {blockers.length > 0 && (
        <div className="mt-2 space-y-1">
          {blockers.map((b, i) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: static list
              key={i}
              className="period-precheck-item error"
            >
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{b}</span>
            </div>
          ))}
        </div>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="mt-2 space-y-1">
          {warnings.map((w, i) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: static list
              key={i}
              className="period-precheck-item warning"
            >
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{w}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
