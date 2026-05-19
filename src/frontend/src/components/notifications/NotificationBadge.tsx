interface NotificationBadgeProps {
  count: number;
  className?: string;
}

export function NotificationBadge({
  count,
  className = "",
}: NotificationBadgeProps) {
  if (count <= 0) return null;
  const label = count > 99 ? "99+" : String(count);
  return (
    <span
      className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground px-1 leading-none ${className}`}
      aria-label={`${label} ungelesene Benachrichtigungen`}
    >
      {label}
    </span>
  );
}
