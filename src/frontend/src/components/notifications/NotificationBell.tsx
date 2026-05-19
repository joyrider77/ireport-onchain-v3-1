import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { useState } from "react";
import { createActor } from "../../backend";
import { NotificationBadge } from "./NotificationBadge";
import { NotificationDropdown } from "./NotificationDropdown";

type AnyActor = Record<string, (...args: unknown[]) => Promise<unknown>>;

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { actor, isFetching } = useActor(createActor);
  const anyActor = actor as unknown as AnyActor | null;

  const { data: unreadCount = 0n } = useQuery<bigint>({
    queryKey: ["unreadCount"],
    queryFn: async () => {
      if (!anyActor) return 0n;
      return (await anyActor.getUnreadCount()) as bigint;
    },
    enabled: !!actor && !isFetching,
    // Poll every 60s; also invalidate myNotifications so dropdown/list stays fresh
    refetchInterval: 60_000,
    staleTime: 30_000,
    refetchOnMount: true,
  });

  const count = Number(unreadCount);

  return (
    <div className="relative" data-ocid="notification.bell">
      <button
        type="button"
        aria-label={`Benachrichtigungen${count > 0 ? ` (${count} ungelesen)` : ""}`}
        className="relative flex items-center justify-center w-8 h-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        <Bell className="w-4 h-4" />
        <NotificationBadge count={count} />
      </button>

      {open && <NotificationDropdown onClose={() => setOpen(false)} />}
    </div>
  );
}
