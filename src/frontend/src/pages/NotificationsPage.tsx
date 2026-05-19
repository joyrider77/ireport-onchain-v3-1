import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck, RefreshCw } from "lucide-react";
import { useState } from "react";
import { createActor } from "../backend";
import type { UserNotification } from "../backend.d";
import { Layout } from "../components/Layout";
import { NotificationItem } from "../components/notifications/NotificationItem";
import { NotificationDetail } from "./notifications/NotificationDetail";

type AnyActor = Record<string, (...args: unknown[]) => Promise<unknown>>;

export default function NotificationsPage() {
  const { actor, isFetching } = useActor(createActor);
  const anyActor = actor as unknown as AnyActor | null;
  const qc = useQueryClient();
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [selected, setSelected] = useState<UserNotification | null>(null);

  const {
    data: notifications = [],
    isLoading,
    isFetching: isRefetching,
    refetch,
  } = useQuery<UserNotification[]>({
    queryKey: ["myNotifications"],
    queryFn: async () => {
      if (!anyActor) return [];
      const res = await anyActor.listMyNotifications();
      return (res as UserNotification[])
        .filter((n) => !n.isDeleted)
        .sort((a, b) =>
          Number(b.notification.createdAt - a.notification.createdAt),
        );
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
    onSuccess: (_data, deletedId) => {
      qc.invalidateQueries({ queryKey: ["myNotifications"] });
      qc.invalidateQueries({ queryKey: ["unreadCount"] });
      if (selected?.notification.id === deletedId) setSelected(null);
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

  const filtered = notifications.filter((n) => {
    if (filter === "unread") return !n.isRead;
    if (filter === "read") return n.isRead;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <Layout>
      <div className="p-6 max-w-5xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Bell className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-semibold text-foreground">
              Benachrichtigungen
            </h1>
            <p className="text-sm text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} ungelesen` : "Alle gelesen"}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              title="Aktualisieren"
              onClick={() => refetch()}
              disabled={isRefetching}
              data-ocid="notifications.refresh_button"
            >
              <RefreshCw
                className={`w-4 h-4 ${isRefetching ? "animate-spin" : ""}`}
              />
            </Button>
            {unreadCount > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => markAllReadMutation.mutate()}
                disabled={markAllReadMutation.isPending}
                data-ocid="notifications.mark_all_read_button"
              >
                <CheckCheck className="w-4 h-4" />
                Alle gelesen
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4">
          {/* List */}
          <Card className="flex-1 shadow-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">
                  Alle Nachrichten
                </CardTitle>
                <Tabs
                  value={filter}
                  onValueChange={(v) =>
                    setFilter(v as "all" | "unread" | "read")
                  }
                >
                  <TabsList className="h-7">
                    <TabsTrigger
                      value="all"
                      className="text-xs h-6 px-2"
                      data-ocid="notifications.filter.all"
                    >
                      Alle
                    </TabsTrigger>
                    <TabsTrigger
                      value="unread"
                      className="text-xs h-6 px-2"
                      data-ocid="notifications.filter.unread"
                    >
                      Ungelesen
                    </TabsTrigger>
                    <TabsTrigger
                      value="read"
                      className="text-xs h-6 px-2"
                      data-ocid="notifications.filter.read"
                    >
                      Gelesen
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-4 space-y-3">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : filtered.length === 0 ? (
                <div
                  className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground"
                  data-ocid="notifications.empty_state"
                >
                  <Bell className="w-8 h-8 opacity-40" />
                  <p className="text-sm">Keine Benachrichtigungen</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {filtered.map((n, idx) => (
                    <div
                      key={n.notification.id}
                      className={
                        selected?.notification.id === n.notification.id
                          ? "ring-1 ring-primary/30 bg-primary/5"
                          : ""
                      }
                      data-ocid={`notifications.item.${idx + 1}`}
                    >
                      <NotificationItem
                        notification={n}
                        onRead={(id) => markReadMutation.mutate(id)}
                        onDelete={(id) => deleteMutation.mutate(id)}
                        onClick={(notif) => {
                          setSelected(notif);
                          if (!notif.isRead)
                            markReadMutation.mutate(notif.notification.id);
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Detail panel */}
          {selected && (
            <div className="lg:w-96">
              <NotificationDetail
                notification={selected}
                onBack={() => setSelected(null)}
                onDelete={(id) => deleteMutation.mutate(id)}
                onRead={(id) => markReadMutation.mutate(id)}
              />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
