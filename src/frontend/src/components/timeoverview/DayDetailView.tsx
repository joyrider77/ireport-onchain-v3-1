import { Badge } from "@/components/ui/badge";
import { formatHours } from "@/lib/timeFormat";
import type { DayDetailEntry } from "@/lib/timeOverviewAggregation";
import { useActor } from "@caffeineai/core-infrastructure";
import { Briefcase, Calendar, Clock, Info, Sun } from "lucide-react";
import React from "react";
import { useEffect, useState } from "react";
import { createActor } from "../../backend";
import type { DayPauseComplianceResult, DetectedPause } from "../../backend.d";
import { PauseComplianceHint } from "./PauseComplianceHint";

// ─── Category styles ──────────────────────────────────────────────────────────

const CATEGORY_STYLES: Record<
  DayDetailEntry["category"],
  { bg: string; border: string; text: string; icon: React.ReactNode }
> = {
  arbeitszeit: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-800",
    icon: <Briefcase className="w-4 h-4" />,
  },
  ferien: {
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-800",
    icon: <Sun className="w-4 h-4" />,
  },
  abwesenheit: {
    bg: "bg-gray-50",
    border: "border-gray-200",
    text: "text-gray-700",
    icon: <Calendar className="w-4 h-4" />,
  },
  feiertag: {
    bg: "bg-red-50",
    border: "border-red-100",
    text: "text-red-700",
    icon: <Clock className="w-4 h-4" />,
  },
};

const CATEGORY_LABELS: Record<DayDetailEntry["category"], string> = {
  arbeitszeit: "Arbeitszeit",
  ferien: "Ferien",
  abwesenheit: "Abwesenheit",
  feiertag: "Feiertag",
};

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  dayData: DayDetailEntry[];
  sollzeit: number; // hours
  isoDate: string;
  employeeId?: bigint;
}

// Convert nanosecond timestamp to hh:mm string
const nsToTimeStr = (ns: bigint): string => {
  const totalSeconds = Number(ns / 1_000_000_000n);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

export function DayDetailView({
  dayData,
  sollzeit,
  isoDate,
  employeeId,
}: Props) {
  const [y, m, d] = isoDate.split("-");
  const dateLabel = `${d}.${m}.${y}`;

  const { actor } = useActor(createActor);
  const [detectedPauses, setDetectedPauses] = useState<DetectedPause[]>([]);
  const [pauseCompliance, setPauseCompliance] =
    useState<DayPauseComplianceResult | null>(null);
  const [pauseLoading, setPauseLoading] = useState(false);

  useEffect(() => {
    if (!actor || !employeeId || !isoDate) return;
    let cancelled = false;
    setPauseLoading(true);
    Promise.all([
      actor.getPausesForDay(employeeId, isoDate),
      actor.getPauseComplianceForDay(employeeId, isoDate),
    ])
      .then(([pauses, compliance]) => {
        if (!cancelled) {
          setDetectedPauses(pauses);
          setPauseCompliance(compliance);
        }
      })
      .catch(() => {
        // silently ignore — pause data is supplementary
      })
      .finally(() => {
        if (!cancelled) setPauseLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [actor, employeeId, isoDate]);

  if (dayData.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-12 text-center"
        data-ocid="day-detail.empty_state"
      >
        <Info className="w-8 h-8 text-muted-foreground/30 mb-2" />
        <p className="text-sm text-muted-foreground">
          Keine Einträge für diesen Tag ({dateLabel})
        </p>
        {sollzeit > 0 && (
          <p className="text-xs text-muted-foreground/70 mt-1">
            Sollzeit: {formatHours(sollzeit)}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3" data-ocid="day-detail-view">
      {/* Sollzeit summary */}
      <div className="flex items-center gap-2 px-3 py-2 bg-muted/40 rounded-lg border border-border">
        <Clock className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          Sollzeit:{" "}
          <span className="font-semibold text-foreground tabular-nums">
            {formatHours(sollzeit)}
          </span>
        </span>
        <span className="ml-auto text-xs text-muted-foreground">
          {dateLabel}
        </span>
      </div>

      {/* Entry cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {dayData.map((entry, idx) => {
          const style = CATEGORY_STYLES[entry.category];
          const key = `${entry.category}-${idx}-${entry.label}`;
          const statusLabel =
            entry.status === "approved"
              ? "Genehmigt"
              : entry.status === "rejected"
                ? "Abgelehnt"
                : entry.status === "pending" || entry.status === "submitted"
                  ? "Ausstehend"
                  : null;

          // Find detected pause that starts at this entry's end time (only for arbeitszeit entries)
          const pauseAfterEntry =
            entry.category === "arbeitszeit" && entry.bis
              ? detectedPauses.find(
                  (p) => nsToTimeStr(p.pauseStart) === entry.bis,
                )
              : undefined;

          return (
            <React.Fragment key={key}>
              <div
                className={`rounded-lg border p-3 ${style.bg} ${style.border}`}
                data-ocid={`day-detail.item.${idx + 1}`}
              >
                <div className={`flex items-start gap-2 ${style.text}`}>
                  {style.icon}
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wide opacity-70">
                      {CATEGORY_LABELS[entry.category]}
                    </p>
                    <p className="text-sm font-medium break-words">
                      {entry.label}
                    </p>
                    {/* Von / Bis or Dauer */}
                    {entry.von || entry.bis ? (
                      <p className="text-xs opacity-80">
                        {entry.von ?? ""}
                        {entry.von && entry.bis ? " – " : ""}
                        {entry.bis ?? ""}
                      </p>
                    ) : (
                      <p className="text-xs opacity-70">
                        Dauer:{" "}
                        <span className="font-medium tabular-nums">
                          {formatHours(entry.dauer)}
                        </span>
                      </p>
                    )}
                    {/* Projekt */}
                    {entry.projekt && (
                      <p className="text-xs opacity-70">
                        Projekt:{" "}
                        <span className="font-medium">{entry.projekt}</span>
                      </p>
                    )}
                    {/* Leistungsart */}
                    {entry.leistungsart && (
                      <p className="text-xs opacity-70">
                        Leistungsart:{" "}
                        <span className="font-medium">
                          {entry.leistungsart}
                        </span>
                      </p>
                    )}
                    {/* Beschreibung */}
                    {entry.description && (
                      <p className="text-xs opacity-70 break-words">
                        {entry.description}
                      </p>
                    )}
                    {/* Status badge */}
                    {statusLabel && (
                      <Badge
                        variant="outline"
                        className={`text-[0.65rem] px-1.5 py-0 h-4 ${
                          entry.status === "approved"
                            ? "border-green-300 text-green-700 bg-green-50"
                            : entry.status === "rejected"
                              ? "border-red-300 text-red-700 bg-red-50"
                              : "border-amber-300 text-amber-700 bg-amber-50"
                        }`}
                      >
                        {statusLabel}
                      </Badge>
                    )}
                  </div>
                  {/* Duration on the right for von/bis entries */}
                  {(entry.von || entry.bis) && (
                    <span className="text-sm font-bold tabular-nums whitespace-nowrap">
                      {formatHours(entry.dauer)}
                    </span>
                  )}
                </div>
              </div>
              {/* Detected pause row after this work entry */}
              {pauseAfterEntry && (
                <div
                  key={`pause-${pauseAfterEntry.pauseStart}`}
                  className="flex items-center gap-3 bg-muted/30 border border-dashed border-border rounded px-3 py-2 my-1 text-sm text-muted-foreground col-span-full"
                  data-ocid={`day-detail.pause.${idx + 1}`}
                >
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/60">
                    Pause
                  </span>
                  <span>
                    {nsToTimeStr(pauseAfterEntry.pauseStart)} –{" "}
                    {nsToTimeStr(pauseAfterEntry.pauseEnd)}
                  </span>
                  <span className="ml-auto font-medium">
                    {Number(pauseAfterEntry.durationMinutes)} Min
                  </span>
                  {pauseAfterEntry.ignored && (
                    <span className="text-xs text-muted-foreground/40">
                      (Ignoriert)
                    </span>
                  )}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
      {/* Pause compliance hint */}
      {!pauseLoading && pauseCompliance && employeeId && (
        <PauseComplianceHint
          status={
            pauseCompliance.status as
              | "ok"
              | "warning"
              | "violation"
              | "not_required"
          }
          meldung={pauseCompliance.meldung}
          workMinutes={Number(pauseCompliance.workDurationMinutes)}
          requiredPauseMinutes={Number(pauseCompliance.requiredPauseMinutes)}
          detectedPauseMinutes={Number(pauseCompliance.detectedPauseMinutes)}
        />
      )}
    </div>
  );
}
