import type { PeriodCloseStatus } from "@/backend";

interface MonthlyCloseStatusBadgeProps {
  status: PeriodCloseStatus | string;
  className?: string;
}

const STATUS_LABELS: Record<string, string> = {
  open: "Offen",
  ready_for_close: "Bereit",
  closed: "Abgeschlossen",
  reopened: "Wieder geöffnet",
};

const STATUS_BADGE_CLASS: Record<string, string> = {
  open: "period-badge period-badge-open",
  ready_for_close: "period-badge period-badge-ready",
  closed: "period-badge period-badge-closed",
  reopened: "period-badge period-badge-reopened",
};

export function MonthlyCloseStatusBadge({
  status,
  className = "",
}: MonthlyCloseStatusBadgeProps) {
  const badgeClass =
    STATUS_BADGE_CLASS[status] ?? "period-badge period-badge-open";
  const label = STATUS_LABELS[status] ?? status;
  return (
    <span
      data-ocid="period-close.status_badge"
      className={`${badgeClass} ${className}`}
    >
      {label}
    </span>
  );
}
