import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { createActor } from "../../backend";
import type { UserNotification } from "../../backend.d";
import { NotificationItem } from "./NotificationItem";

type AnyActor = Record<string, (...args: unknown[]) => Promise<unknown>>;

interface NotificationDropdownProps {
  onClose: () => void;
}

export function NotificationDropdown({ onClose }: NotificationDropdownProps) {
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { actor, isFetching } = useActor(createActor);
  const anyActor = actor as unknown as AnyActor | null;

  const { data: notifications = [] } = useQuery<UserNotification[]>({
    queryKey: ["myNotifications"],
    queryFn: async () => {
      if (!anyActor) return [];
      const res = await anyActor.listMyNotifications();
      return (res as UserNotification[])
        .filter((n) => !n.isDeleted)
        .sort((a, b) =>
          Number(b.notification.createdAt - a.notification.createdAt),
        )
        .slice(0, 10);
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
    refetchOnMount: true,
    refetchInterval: 90_000,
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!anyActor) return;
      await anyActor.markNotificationRead(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myNotifications"] });
      qc.invalidateQueries({ queryKey: ["unreadCount"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!anyActor) return;
      await anyActor.deleteMyNotification(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myNotifications"] });
      qc.invalidateQueries({ queryKey: ["unreadCount"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      if (!anyActor) return;
      await anyActor.markAllNotificationsRead();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myNotifications"] });
      qc.invalidateQueries({ queryKey: ["unreadCount"] });
    },
  });

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-1 w-80 bg-card border border-border rounded-lg shadow-elevated z-50 overflow-hidden"
      data-ocid="notification.dropdown"
    >
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <span className="text-sm font-semibold text-foreground">
          Benachrichtigungen
        </span>
        {unreadCount > 0 && (
          <button
            type="button"
            className="text-xs text-primary hover:underline"
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending}
          >
            Alle gelesen
          </button>
        )}
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-border">
        {notifications.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            Keine Benachrichtigungen
          </p>
        ) : (
          notifications.map((n) => (
            <NotificationItem
              key={n.notification.id}
              notification={n}
              compact
              onRead={(id) => markReadMutation.mutate(id)}
              onDelete={(id) => deleteMutation.mutate(id)}
              onClick={() => {
                onClose();
                navigate({ to: "/benachrichtigungen" });
              }}
            />
          ))
        )}
      </div>

      <div className="border-t border-border px-3 py-2">
        <button
          type="button"
          className="w-full text-xs text-center text-primary hover:underline"
          data-ocid="notification.view_all_link"
          onClick={() => {
            onClose();
            navigate({ to: "/benachrichtigungen" });
          }}
        >
          Alle Benachrichtigungen anzeigen
        </button>
      </div>
    </div>
  );
}
