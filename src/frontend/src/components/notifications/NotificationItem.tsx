import type { UserNotification } from "../../backend.d";
import { NotificationPriority } from "../../backend.d";

interface NotificationItemProps {
  notification: UserNotification;
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
  onClick?: (notification: UserNotification) => void;
  compact?: boolean;
}

function formatNanos(ns: bigint): string {
  const d = new Date(Number(ns) / 1_000_000);
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
}

function priorityDot(priority: string) {
  if (priority === NotificationPriority.critical)
    return (
      <span
        className="w-2 h-2 rounded-full bg-destructive flex-shrink-0 mt-1"
        aria-label="Kritisch"
      />
    );
  if (priority === NotificationPriority.important)
    return (
      <span
        className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0 mt-1"
        aria-label="Wichtig"
      />
    );
  return (
    <span
      className="w-2 h-2 rounded-full bg-muted-foreground/30 flex-shrink-0 mt-1"
      aria-label="Normal"
    />
  );
}

export function NotificationItem({
  notification,
  onRead,
  onDelete,
  onClick,
  compact = false,
}: NotificationItemProps) {
  const { notification: n, isRead } = notification;

  const rowClass = [
    "flex items-start gap-2 px-3 py-2.5 cursor-pointer transition-colors",
    isRead ? "" : "bg-blue-50/60 dark:bg-blue-950/20",
    n.priority === NotificationPriority.critical
      ? "border-l-2 border-destructive"
      : "",
    n.priority === NotificationPriority.important && isRead === false
      ? "border-l-2 border-amber-500"
      : "",
    "hover:bg-muted/40",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={rowClass}
      onClick={() => {
        if (!isRead) onRead(n.id);
        onClick?.(notification);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          if (!isRead) onRead(n.id);
          onClick?.(notification);
        }
      }}
    >
      {priorityDot(n.priority)}
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm leading-tight truncate ${isRead ? "text-muted-foreground" : "font-semibold text-foreground"}`}
        >
          {n.title}
        </p>
        {!compact && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {n.senderDisplayName}
          </p>
        )}
        <p className="text-[10px] text-muted-foreground mt-0.5">
          {formatNanos(n.createdAt)}
        </p>
      </div>
      <button
        type="button"
        aria-label="Löschen"
        className="ml-1 text-muted-foreground hover:text-destructive flex-shrink-0 mt-0.5"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(n.id);
        }}
      >
        <svg
          className="w-3.5 h-3.5"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </button>
  );
}
