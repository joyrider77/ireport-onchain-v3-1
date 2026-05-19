import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Archive, Bell, Copy, Eye, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { createActor } from "../../backend";
import type { Notification } from "../../backend.d";
import {
  NotificationFormat,
  NotificationPriority,
  NotificationStatus,
} from "../../backend.d";
import { Layout } from "../../components/Layout";
import { useAuth } from "../../hooks/useAuthStore";
import { NotificationEditor } from "./NotificationEditor";

type AnyActor = Record<string, (...args: unknown[]) => Promise<unknown>>;

function formatNanos(ns: bigint): string {
  const d = new Date(Number(ns) / 1_000_000);
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
}

function statusBadge(status: string) {
  if (status === NotificationStatus.sent)
    return (
      <Badge className="text-xs bg-green-100 text-green-800 border-green-300">
        Versendet
      </Badge>
    );
  if (status === NotificationStatus.archived)
    return (
      <Badge variant="secondary" className="text-xs">
        Archiviert
      </Badge>
    );
  return (
    <Badge variant="outline" className="text-xs">
      Entwurf
    </Badge>
  );
}

function priorityBadge(priority: string) {
  if (priority === NotificationPriority.critical)
    return (
      <Badge variant="destructive" className="text-xs">
        Kritisch
      </Badge>
    );
  if (priority === NotificationPriority.important)
    return (
      <Badge className="text-xs bg-amber-100 text-amber-800 border-amber-300">
        Wichtig
      </Badge>
    );
  return (
    <Badge variant="secondary" className="text-xs">
      Normal
    </Badge>
  );
}

// Simple markdown renderer
function renderMarkdown(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(
      /^### (.+)$/gm,
      "<h3 class='font-semibold text-base mt-3 mb-1'>$1</h3>",
    )
    .replace(
      /^## (.+)$/gm,
      "<h2 class='font-semibold text-lg mt-4 mb-1'>$1</h2>",
    )
    .replace(/^# (.+)$/gm, "<h1 class='font-bold text-xl mt-4 mb-2'>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/^- (.+)$/gm, "<li class='ml-4 list-disc'>$1</li>")
    .replace(
      /\[(.+?)\]\((.+?)\)/g,
      "<a href='$2' class='text-primary underline' target='_blank' rel='noreferrer'>$1</a>",
    )
    .replace(/\n\n/g, "</p><p class='mt-2'>")
    .replace(/\n/g, "<br />");
}

function sanitizeHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/on\w+\s*=\s*(["'])[^"']*\1/gi, "")
    .replace(/javascript:/gi, "");
}

function NotificationViewModal({
  notification,
  onClose,
  onDuplicate,
}: {
  notification: Notification;
  onClose: () => void;
  onDuplicate: (id: string) => void;
}) {
  const n = notification;
  const renderedContent = useMemo(() => {
    if (n.messageFormat === NotificationFormat.html) {
      return { __html: sanitizeHtml(n.messageBody) };
    }
    return { __html: `<p class='mt-1'>${renderMarkdown(n.messageBody)}</p>` };
  }, [n.messageBody, n.messageFormat]);

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        className="max-w-2xl max-h-[80vh] overflow-y-auto"
        data-ocid="notification-admin.view_modal"
      >
        <DialogHeader>
          <div className="flex items-start gap-3 pr-6">
            <DialogTitle className="text-base leading-tight flex-1">
              {n.title}
            </DialogTitle>
            {priorityBadge(n.priority)}
          </div>
          <div className="flex items-center gap-3 mt-1">
            {statusBadge(n.status)}
            <span className="text-xs text-muted-foreground">
              Von {n.senderDisplayName} &middot; {formatNanos(n.createdAt)}
            </span>
          </div>
        </DialogHeader>
        <div
          className="text-sm text-foreground prose prose-sm max-w-none py-2"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: sanitized above
          dangerouslySetInnerHTML={renderedContent}
        />
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => {
              onDuplicate(n.id);
              onClose();
            }}
            data-ocid="notification-admin.view_modal.duplicate_button"
          >
            <Copy className="w-3.5 h-3.5" />
            Duplizieren
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={onClose}
            data-ocid="notification-admin.view_modal.close_button"
          >
            Schlie&szlig;en
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function NotificationAdminPage() {
  const { isPlatformAdmin } = useAuth();
  const { actor, isFetching } = useActor(createActor);
  const anyActor = actor as unknown as AnyActor | null;
  const qc = useQueryClient();
  const [showEditor, setShowEditor] = useState(false);
  const [editDraft, setEditDraft] = useState<Notification | null>(null);
  const [viewNotification, setViewNotification] = useState<Notification | null>(
    null,
  );

  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ["allNotifications"],
    queryFn: async () => {
      if (!anyActor) return [];
      const res = await anyActor.listAllNotifications();
      return (res as Notification[]).sort((a, b) =>
        Number(b.createdAt - a.createdAt),
      );
    },
    enabled: !!actor && !isFetching && isPlatformAdmin,
    staleTime: 30_000,
  });

  const archiveMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!anyActor) throw new Error("Kein Actor");
      const res = (await anyActor.archiveNotification(id)) as {
        __kind__: string;
        err?: string;
      };
      if (res.__kind__ === "err") throw new Error(res.err ?? "Fehler");
    },
    onSuccess: () => {
      toast.success("Archiviert");
      qc.invalidateQueries({ queryKey: ["allNotifications"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const duplicateMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!anyActor) throw new Error("Kein Actor");
      const res = (await anyActor.duplicateNotification(id)) as {
        __kind__: string;
        err?: string;
      };
      if (res.__kind__ === "err") throw new Error(res.err ?? "Fehler");
    },
    onSuccess: () => {
      toast.success("Dupliziert");
      qc.invalidateQueries({ queryKey: ["allNotifications"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function openRow(n: Notification) {
    if (n.status === NotificationStatus.draft) {
      setEditDraft(n);
      setShowEditor(false);
      setViewNotification(null);
    } else {
      setViewNotification(n);
    }
  }

  if (!isPlatformAdmin) {
    return (
      <Layout>
        <div className="p-6 text-center text-muted-foreground">
          <p>Kein Zugriff.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Bell className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-display font-semibold text-foreground">
              Nachrichtenverwaltung
            </h1>
            <p className="text-sm text-muted-foreground">
              Benachrichtigungen erstellen und versenden
            </p>
          </div>
          <Button
            type="button"
            className="gap-2"
            onClick={() => {
              setShowEditor(true);
              setEditDraft(null);
              setViewNotification(null);
            }}
            data-ocid="notification-admin.new_button"
          >
            <Plus className="w-4 h-4" />
            Neue Nachricht
          </Button>
        </div>

        {(showEditor || editDraft) && (
          <Card className="shadow-card">
            <CardContent className="pt-5">
              <NotificationEditor
                initialData={editDraft ?? undefined}
                onClose={() => {
                  setShowEditor(false);
                  setEditDraft(null);
                }}
              />
            </CardContent>
          </Card>
        )}

        {viewNotification && (
          <NotificationViewModal
            notification={viewNotification}
            onClose={() => setViewNotification(null)}
            onDuplicate={(id) => duplicateMutation.mutate(id)}
          />
        )}

        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">
                Erstellte Nachrichten
              </CardTitle>
              <Badge variant="secondary">
                {notifications.length} Eintr&auml;ge
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-4 space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : notifications.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground"
                data-ocid="notification-admin.empty_state"
              >
                <Bell className="w-8 h-8 opacity-40" />
                <p className="text-sm">Noch keine Nachrichten erstellt</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowEditor(true);
                    setEditDraft(null);
                  }}
                >
                  Erste Nachricht erstellen
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead>Titel</TableHead>
                      <TableHead>Ersteller</TableHead>
                      <TableHead>Erstellt am</TableHead>
                      <TableHead>Priorit&auml;t</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aktionen</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {notifications.map((n, idx) => (
                      <TableRow
                        key={n.id}
                        className="cursor-pointer hover:bg-muted/40"
                        onClick={() => openRow(n)}
                        data-ocid={`notification-admin.item.${idx + 1}`}
                      >
                        <TableCell className="font-medium max-w-[200px] truncate">
                          {n.title}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {n.senderDisplayName}
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatNanos(n.createdAt)}
                        </TableCell>
                        <TableCell>{priorityBadge(n.priority)}</TableCell>
                        <TableCell>{statusBadge(n.status)}</TableCell>
                        <TableCell className="text-right">
                          <div
                            className="flex items-center justify-end gap-1"
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => e.stopPropagation()}
                          >
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              title="Ansehen"
                              onClick={(e) => {
                                e.stopPropagation();
                                openRow(n);
                              }}
                              data-ocid={`notification-admin.view_button.${idx + 1}`}
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              title="Duplizieren"
                              onClick={() => duplicateMutation.mutate(n.id)}
                              disabled={duplicateMutation.isPending}
                              data-ocid={`notification-admin.duplicate_button.${idx + 1}`}
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </Button>
                            {n.status === NotificationStatus.sent && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground"
                                title="Archivieren"
                                onClick={() => archiveMutation.mutate(n.id)}
                                disabled={archiveMutation.isPending}
                                data-ocid={`notification-admin.archive_button.${idx + 1}`}
                              >
                                <Archive className="w-3.5 h-3.5" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
