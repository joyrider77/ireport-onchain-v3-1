interface PaymentStatusBadgeProps {
  status?: string;
  className?: string;
}

const STATUS_MAP: Record<string, { label: string; classes: string }> = {
  active: {
    label: "Aktiv",
    classes: "bg-green-100 text-green-700 border-green-200",
  },
  past_due: {
    label: "Zahlung ausstehend",
    classes: "bg-orange-100 text-orange-700 border-orange-200",
  },
  unpaid: {
    label: "Unbezahlt",
    classes: "bg-red-100 text-red-700 border-red-200",
  },
  canceled: {
    label: "Gekündigt",
    classes: "bg-muted text-muted-foreground border-border",
  },
  incomplete: {
    label: "Ausstehend",
    classes: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
  incomplete_expired: {
    label: "Abgelaufen",
    classes: "bg-muted text-muted-foreground border-border",
  },
  pending_payment: {
    label: "Zahlung in Bearbeitung",
    classes: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
  trialing: {
    label: "Testphase",
    classes: "bg-blue-100 text-blue-700 border-blue-200",
  },
};

export function PaymentStatusBadge({
  status,
  className,
}: PaymentStatusBadgeProps) {
  const config = status ? (STATUS_MAP[status] ?? null) : null;

  if (!config) {
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border bg-muted text-muted-foreground border-border ${className ?? ""}`}
        data-ocid="billing.payment_status_badge"
      >
        Kein Abonnement
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${config.classes} ${className ?? ""}`}
      data-ocid="billing.payment_status_badge"
    >
      {config.label}
    </span>
  );
}
