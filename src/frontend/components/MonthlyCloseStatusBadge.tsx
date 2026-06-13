import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, RotateCcw, Clock } from "lucide-react";

export type PeriodCloseStatus = "open" | "ready_for_close" | "closed" | "reopened";

interface Props {
  status: PeriodCloseStatus | string;
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
  open: { label: "Offen", variant: "outline", icon: <Circle className="h-3 w-3" /> },
  ready_for_close: { label: "Bereit", variant: "secondary", icon: <Clock className="h-3 w-3" /> },
  closed: { label: "Abgeschlossen", variant: "default", icon: <CheckCircle2 className="h-3 w-3" /> },
  reopened: { label: "Wieder geöffnet", variant: "destructive", icon: <RotateCcw className="h-3 w-3" /> },
};

export function MonthlyCloseStatusBadge({ status }: Props) {
  const cfg = statusConfig[status] ?? statusConfig.open;
  return (
    <Badge variant={cfg.variant} className="flex items-center gap-1 w-fit">
      {cfg.icon}
      {cfg.label}
    </Badge>
  );
}
