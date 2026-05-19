import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  label: string;
  onPrev: () => void;
  onNext: () => void;
}

export function PeriodNavigator({ label, onPrev, onNext }: Props) {
  return (
    <div className="flex items-center gap-2" data-ocid="period-navigator">
      <button
        type="button"
        onClick={onPrev}
        aria-label="Vorheriger Zeitraum"
        data-ocid="period-nav-prev"
        className="p-1.5 rounded-md text-primary hover:bg-primary/10 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <span
        className="text-sm font-semibold text-foreground tabular-nums min-w-[140px] text-center"
        data-ocid="period-nav-label"
      >
        {label}
      </span>
      <button
        type="button"
        onClick={onNext}
        aria-label="Nächster Zeitraum"
        data-ocid="period-nav-next"
        className="p-1.5 rounded-md text-primary hover:bg-primary/10 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
