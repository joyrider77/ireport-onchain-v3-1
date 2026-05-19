import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useMemo } from "react";
import type { UserNotification } from "../../backend.d";
import { NotificationFormat, NotificationPriority } from "../../backend.d";

interface NotificationDetailProps {
  notification: UserNotification;
  onBack: () => void;
  onDelete: (id: string) => void;
  onRead: (id: string) => void;
}

function formatNanos(ns: bigint): string {
  const d = new Date(Number(ns) / 1_000_000);
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

// Simple markdown renderer (no external lib)
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
    .replace(/(<li[^>]*>.*<\/li>\n?)+/g, "<ul class='my-2'>$&</ul>")
    .replace(
      /\[(.+?)\]\((.+?)\)/g,
      "<a href='$2' class='text-primary underline' target='_blank' rel='noreferrer'>$1</a>",
    )
    .replace(/\n\n/g, "</p><p class='mt-2'>")
    .replace(/\n/g, "<br />");
}

// HTML sanitizer: strip script tags and dangerous attributes
function sanitizeHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/on\w+\s*=\s*(["'])[^"']*\1/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/vbscript:/gi, "");
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

export function NotificationDetail({
  notification,
  onBack,
  onDelete,
  onRead,
}: NotificationDetailProps) {
  const { notification: n, isRead } = notification;

  const renderedContent = useMemo(() => {
    if (n.messageFormat === NotificationFormat.html) {
      return { __html: sanitizeHtml(n.messageBody) };
    }
    return { __html: `<p class='mt-1'>${renderMarkdown(n.messageBody)}</p>` };
  }, [n.messageBody, n.messageFormat]);

  return (
    <Card className="shadow-card" data-ocid="notification.detail">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base font-semibold leading-tight">
              {n.title}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Von {n.senderDisplayName} · {formatNanos(n.createdAt)}
            </p>
          </div>
          {priorityBadge(n.priority)}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Rendered body */}
        <div
          className="text-sm text-foreground prose prose-sm max-w-none"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: sanitized above
          dangerouslySetInnerHTML={renderedContent}
        />

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={onBack}
            data-ocid="notification.detail.back_button"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Zurück
          </Button>
          {!isRead && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onRead(n.id)}
              data-ocid="notification.detail.read_button"
            >
              Als gelesen markieren
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive gap-1.5"
            onClick={() => onDelete(n.id)}
            data-ocid="notification.detail.delete_button"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Löschen
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
