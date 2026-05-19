import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BillingPeriodFilterProps {
  fromDate: string; // "TT.MM.JJJJ"
  toDate: string;
  kulanzDays: number;
  onFromDateChange: (v: string) => void;
  onToDateChange: (v: string) => void;
  onKulanzChange: (v: number) => void;
  onApply: () => void;
  isLoading?: boolean;
}

/** Converts a TT.MM.JJJJ string to an <input type="date"> value (YYYY-MM-DD) */
export function deToIso(de: string): string {
  const [dd, mm, yyyy] = de.split(".");
  if (!dd || !mm || !yyyy) return "";
  return `${yyyy}-${mm}-${dd}`;
}

/** Converts a YYYY-MM-DD string back to TT.MM.JJJJ */
export function isoToDe(iso: string): string {
  const [yyyy, mm, dd] = iso.split("-");
  if (!yyyy || !mm || !dd) return "";
  return `${dd}.${mm}.${yyyy}`;
}

export function BillingPeriodFilter({
  fromDate,
  toDate,
  kulanzDays,
  onFromDateChange,
  onToDateChange,
  onKulanzChange,
  onApply,
  isLoading,
}: BillingPeriodFilterProps) {
  return (
    <div
      className="flex flex-wrap gap-3 items-end"
      data-ocid="billing.period_filter"
    >
      <div className="space-y-1 flex-1 min-w-[140px]">
        <Label
          htmlFor="billing-from"
          className="text-xs font-medium text-foreground"
        >
          Von
        </Label>
        <Input
          id="billing-from"
          type="date"
          data-ocid="billing.from_date_input"
          value={deToIso(fromDate)}
          onChange={(e) => onFromDateChange(isoToDe(e.target.value))}
          className="h-8 text-sm"
        />
      </div>

      <div className="space-y-1 flex-1 min-w-[140px]">
        <Label
          htmlFor="billing-to"
          className="text-xs font-medium text-foreground"
        >
          Bis
        </Label>
        <Input
          id="billing-to"
          type="date"
          data-ocid="billing.to_date_input"
          value={deToIso(toDate)}
          onChange={(e) => onToDateChange(isoToDe(e.target.value))}
          className="h-8 text-sm"
        />
      </div>

      <div className="space-y-1 w-[110px]">
        <Label
          htmlFor="billing-kulanz"
          className="text-xs font-medium text-foreground"
        >
          Kulanz (Tage)
        </Label>
        <Input
          id="billing-kulanz"
          type="number"
          min={0}
          max={31}
          data-ocid="billing.kulanz_input"
          value={kulanzDays}
          onChange={(e) =>
            onKulanzChange(Number.parseInt(e.target.value, 10) || 0)
          }
          className="h-8 text-sm"
        />
      </div>

      <Button
        type="button"
        size="sm"
        className="h-8 px-4"
        onClick={onApply}
        disabled={isLoading}
        data-ocid="billing.apply_button"
      >
        {isLoading ? "Lädt…" : "Anzeigen"}
      </Button>
    </div>
  );
}
