import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Lock } from "lucide-react";

interface PeriodLockIndicatorProps {
  locked: boolean;
  reason?: string;
  className?: string;
}

export function PeriodLockIndicator({
  locked,
  reason = "Abgeschlossene Periode",
  className = "",
}: PeriodLockIndicatorProps) {
  if (!locked) return null;
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            data-ocid="period-close.lock_indicator"
            className={`period-lock-indicator ${className}`}
            aria-label={reason}
          >
            <Lock className="w-3 h-3" />
            <span>Gesperrt</span>
          </span>
        </TooltipTrigger>
        <TooltipContent side="top">{reason}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
