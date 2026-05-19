interface KpiCardProps {
  title: string;
  value: number | string;
  status: "green" | "yellow" | "red" | "blue" | "grey";
  description?: string;
  isPlaceholder?: boolean;
}

const statusDotClass: Record<KpiCardProps["status"], string> = {
  green: "bg-green-500",
  yellow: "bg-yellow-500",
  red: "bg-red-500",
  blue: "bg-blue-500",
  grey: "bg-gray-300",
};

export function ComplianceCockpitKpiCard({
  title,
  value,
  status,
  description,
  isPlaceholder = false,
}: KpiCardProps) {
  return (
    <div
      className="bg-card rounded-lg shadow-sm p-4 flex flex-col gap-1 min-w-0"
      data-ocid="compliance.kpi_card"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-3xl font-bold text-foreground tabular-nums leading-none">
          {isPlaceholder ? "--" : value}
        </span>
        <span
          className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${statusDotClass[status]}`}
          aria-hidden="true"
        />
      </div>
      <p className="text-sm text-muted-foreground leading-snug">{title}</p>
      {isPlaceholder && (
        <span className="text-xs text-muted-foreground/60 mt-0.5">
          Kommt demnächst
        </span>
      )}
      {!isPlaceholder && description && (
        <p className="text-xs text-muted-foreground/70 mt-0.5">{description}</p>
      )}
    </div>
  );
}
