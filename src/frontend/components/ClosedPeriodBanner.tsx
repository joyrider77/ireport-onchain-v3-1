import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface Props {
  closedAt?: bigint | number;
  closedByName?: string;
  canReopen?: boolean;
  onReopen?: () => void;
}

function formatDate(ts?: bigint | number): string {
  if (!ts) return "";
  const ms = typeof ts === "bigint" ? Number(ts) / 1_000_000 : ts;
  return new Date(ms).toLocaleDateString("de-CH");
}

export function ClosedPeriodBanner({ closedAt, closedByName, canReopen, onReopen }: Props) {
  return (
    <Alert variant="destructive" className="flex items-center justify-between" data-ocid="closed_period.banner">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 shrink-0" />
        <AlertDescription>
          Diese Periode ist abgeschlossen
          {closedAt ? ` am ${formatDate(closedAt)}` : ""}
          {closedByName ? ` durch ${closedByName}` : ""}.
          {" "}Änderungen sind nicht mehr möglich. Bitte wenden Sie sich an Ihren Firmenadministrator.
        </AlertDescription>
      </div>
      {canReopen && onReopen && (
        <Button type="button" size="sm" variant="outline" onClick={onReopen} data-ocid="closed_period.reopen_button" className="ml-4 shrink-0">
          Wieder öffnen
        </Button>
      )}
    </Alert>
  );
}
