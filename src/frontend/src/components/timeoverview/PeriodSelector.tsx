import type { PeriodType } from "@/lib/timeOverviewAggregation";

const PERIODS: { value: PeriodType; label: string }[] = [
  { value: "day", label: "Tag" },
  { value: "week", label: "Woche" },
  { value: "month", label: "Monat" },
  { value: "year", label: "Jahr" },
];

interface Props {
  value: PeriodType;
  onChange: (v: PeriodType) => void;
}

export function PeriodSelector({ value, onChange }: Props) {
  return (
    <div
      className="inline-flex rounded-lg border border-border overflow-hidden"
      role="tablist"
      aria-label="Zeitraum wählen"
      data-ocid="period-selector"
    >
      {PERIODS.map((p) => (
        <button
          key={p.value}
          type="button"
          role="tab"
          aria-selected={value === p.value}
          onClick={() => onChange(p.value)}
          data-ocid={`period-tab.${p.value}`}
          className={[
            "px-3 py-1.5 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            value === p.value
              ? "bg-primary text-primary-foreground"
              : "bg-background text-muted-foreground hover:bg-muted hover:text-foreground",
          ].join(" ")}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
