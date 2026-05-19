import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

interface PauseComplianceHintProps {
  status: "ok" | "warning" | "violation" | "not_required";
  meldung: string;
  workMinutes: number;
  requiredPauseMinutes: number;
  detectedPauseMinutes: number;
}

export function PauseComplianceHint({
  status,
  meldung,
  workMinutes,
  requiredPauseMinutes,
  detectedPauseMinutes,
}: PauseComplianceHintProps) {
  if (workMinutes === 0) return null;

  const styles = {
    ok: {
      container: "bg-green-50 border-green-200 text-green-700",
      icon: <CheckCircle2 className="w-4 h-4 shrink-0 text-green-500" />,
    },
    not_required: {
      container: "bg-green-50 border-green-200 text-green-700",
      icon: <CheckCircle2 className="w-4 h-4 shrink-0 text-green-500" />,
    },
    warning: {
      container: "bg-yellow-50 border-yellow-200 text-yellow-700",
      icon: <AlertTriangle className="w-4 h-4 shrink-0 text-yellow-500" />,
    },
    violation: {
      container: "bg-red-50 border-red-200 text-red-700",
      icon: <XCircle className="w-4 h-4 shrink-0 text-red-500" />,
    },
  };

  const s = styles[status];

  return (
    <div
      className={`flex items-start gap-2 rounded-md border px-3 py-2 mt-2 text-sm ${s.container}`}
      data-ocid="day-detail.pause-compliance-hint"
    >
      {s.icon}
      <div className="min-w-0 flex-1">
        <span className="font-medium">{meldung}</span>
        {status !== "not_required" && (
          <p className="text-xs opacity-80 mt-0.5">
            Erkannt: {detectedPauseMinutes} Min | Erforderlich:{" "}
            {requiredPauseMinutes} Min
          </p>
        )}
      </div>
    </div>
  );
}
