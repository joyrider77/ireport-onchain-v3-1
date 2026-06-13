import { Lock } from "lucide-react";

interface ClosedPeriodBannerProps {
  closedAt?: bigint | null;
  closedByName?: string | null;
  onRequestReopen?: () => void;
  canReopen?: boolean;
}

function formatTimestamp(ts?: bigint | null): string {
  if (!ts) return "";
  const ms = Number(ts / 1_000_000n);
  return new Date(ms).toLocaleDateString("de-CH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function ClosedPeriodBanner({
  closedAt,
  closedByName,
  onRequestReopen,
  canReopen = false,
}: ClosedPeriodBannerProps) {
  const dateStr = formatTimestamp(closedAt);
  return (
    <div
      data-ocid="period-close.closed_banner"
      className="period-closed-banner"
      role="alert"
    >
      <Lock className="w-4 h-4 flex-shrink-0" />
      <span className="flex-1">
        Diese Periode ist abgeschlossen
        {dateStr && (
          <span>
            {" "}
            am <strong>{dateStr}</strong>
          </span>
        )}
        {closedByName && (
          <span>
            {" "}
            durch <strong>{closedByName}</strong>
          </span>
        )}
        {"."} Änderungen sind nicht mehr möglich. Bitte wende dich an deinen
        Firmenadministrator.
      </span>
      {canReopen && onRequestReopen && (
        <button
          type="button"
          data-ocid="period-close.reopen_request_button"
          onClick={onRequestReopen}
          className="ml-4 text-xs underline hover:no-underline flex-shrink-0"
        >
          Periode öffnen
        </button>
      )}
    </div>
  );
}
