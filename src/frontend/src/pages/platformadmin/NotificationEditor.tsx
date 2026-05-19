import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, Save, Send, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { createActor } from "../../backend";
import type { Notification } from "../../backend.d";
import {
  NotificationFormat,
  NotificationPriority,
  NotificationStatus,
  NotificationTargetType,
} from "../../backend.d";
import { RecipientSelector } from "./RecipientSelector";
import type { RecipientSelection } from "./RecipientSelector";

type AnyActor = Record<string, (...args: unknown[]) => Promise<unknown>>;

interface CompanyRow {
  id: string;
  name: string;
  activeEmployeeCount: bigint;
}

interface NotificationEditorProps {
  onClose: () => void;
  /** When provided the editor opens in edit-draft mode pre-filled with existing data */
  initialData?: Notification;
}

function formatInputToNanos(dateStr: string): bigint {
  return dateStr
    ? BigInt(new Date(dateStr).getTime()) * 1_000_000n
    : BigInt(Date.now()) * 1_000_000n;
}

export function NotificationEditor({
  onClose,
  initialData,
}: NotificationEditorProps) {
  const { actor, isFetching } = useActor(createActor);
  const anyActor = actor as unknown as AnyActor | null;
  const qc = useQueryClient();

  const isDraftEdit =
    !!initialData && initialData.status === NotificationStatus.draft;

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [priority, setPriority] = useState<string>(
    initialData?.priority ?? NotificationPriority.normal,
  );
  const [validFrom, setValidFrom] = useState(() => {
    if (initialData?.validFrom) {
      const d = new Date(Number(initialData.validFrom) / 1_000_000);
      return d.toISOString().split("T")[0];
    }
    return new Date().toISOString().split("T")[0];
  });
  const [validUntil, setValidUntil] = useState(() => {
    if (initialData?.validUntil) {
      const d = new Date(Number(initialData.validUntil) / 1_000_000);
      return d.toISOString().split("T")[0];
    }
    return "";
  });
  const [format, setFormat] = useState<string>(
    initialData?.messageFormat ?? NotificationFormat.markdown,
  );
  const [body, setBody] = useState(initialData?.messageBody ?? "");
  const [recipients, setRecipients] = useState<RecipientSelection>({
    tenantIds: initialData?.targetTenantIds ?? [],
    roleIds: initialData?.targetRoleIds ?? [],
    userIds: initialData?.targetUserIds ?? [],
  });
  const [preview, setPreview] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: companies = [] } = useQuery<CompanyRow[]>({
    queryKey: ["allCompaniesForAdmin"],
    queryFn: async () => {
      if (!anyActor) return [];
      const res = await anyActor.listAllCompaniesForPlatformAdmin();
      return (
        res as Array<{
          id: string;
          name: string;
          activeEmployeeCount: bigint;
        }>
      ).map((c) => ({
        id: String(c.id),
        name: c.name,
        activeEmployeeCount: c.activeEmployeeCount,
      }));
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
  });

  // Estimate total recipients using company activeEmployeeCount
  const estimatedRecipients = (() => {
    const directCount = recipients.userIds.length;
    const tenantCount = companies
      .filter((c) => recipients.tenantIds.includes(c.id))
      .reduce((sum, c) => sum + Number(c.activeEmployeeCount), 0);
    // For role-based, sum all non-platform-admin company employees
    const allActiveUsers = companies.reduce(
      (sum, c) => sum + Number(c.activeEmployeeCount),
      0,
    );
    const roleCount =
      recipients.roleIds.length > 0
        ? Math.ceil(allActiveUsers * (recipients.roleIds.length / 3))
        : 0;
    // Use max estimate (tenants or roles may overlap with direct users — add all, note it's an estimate)
    return Math.max(directCount, tenantCount + roleCount);
  })();

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = "Titel ist Pflichtfeld";
    if (!validFrom) e.validFrom = "Gültig ab ist Pflichtfeld";
    if (
      recipients.tenantIds.length === 0 &&
      recipients.roleIds.length === 0 &&
      recipients.userIds.length === 0
    ) {
      e.recipients = "Mindestens einen Empfänger auswählen";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function buildTargetType(): NotificationTargetType {
    const hasTenant = recipients.tenantIds.length > 0;
    const hasRole = recipients.roleIds.length > 0;
    const hasUser = recipients.userIds.length > 0;
    if ([hasTenant, hasRole, hasUser].filter(Boolean).length > 1)
      return NotificationTargetType.mixed;
    if (hasTenant) return NotificationTargetType.tenant;
    if (hasRole) return NotificationTargetType.role;
    return NotificationTargetType.user;
  }

  function invalidateAll() {
    qc.invalidateQueries({ queryKey: ["allNotifications"] });
    qc.invalidateQueries({ queryKey: ["myNotifications"] });
    qc.invalidateQueries({ queryKey: ["unreadCount"] });
  }

  const saveDraftMutation = useMutation({
    mutationFn: async () => {
      if (!anyActor) throw new Error("Kein Actor");
      const res = await anyActor.createNotificationDraft(
        title,
        body,
        format as NotificationFormat,
        priority as NotificationPriority,
        formatInputToNanos(validFrom),
        validUntil ? formatInputToNanos(validUntil) : null,
        buildTargetType(),
        recipients.tenantIds,
        recipients.roleIds,
        recipients.userIds,
      );
      const r = res as { __kind__: string; err?: string };
      if (r.__kind__ === "err") throw new Error(r.err ?? "Fehler");
    },
    onSuccess: () => {
      toast.success("Entwurf gespeichert");
      invalidateAll();
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const sendMutation = useMutation({
    mutationFn: async () => {
      if (!anyActor) throw new Error("Kein Actor");
      const res = await anyActor.saveAndSendNotification(
        title,
        body,
        format as NotificationFormat,
        priority as NotificationPriority,
        formatInputToNanos(validFrom),
        validUntil ? formatInputToNanos(validUntil) : null,
        buildTargetType(),
        recipients.tenantIds,
        recipients.roleIds,
        recipients.userIds,
      );
      const r = res as { __kind__: string; err?: string };
      if (r.__kind__ === "err") throw new Error(r.err ?? "Fehler");
    },
    onSuccess: () => {
      toast.success("Nachricht gesendet");
      // Invalidate admin list + recipient queries so message appears immediately
      invalidateAll();
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const isSubmitting = saveDraftMutation.isPending || sendMutation.isPending;

  return (
    <div className="space-y-5" data-ocid="notification-editor">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">
          {isDraftEdit ? "Entwurf bearbeiten" : "Neue Nachricht"}
        </h2>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onClose}
          data-ocid="notification-editor.close_button"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid gap-4">
        {/* Title */}
        <div className="space-y-1">
          <Label htmlFor="notif-title">Titel / Betreff *</Label>
          <Input
            id="notif-title"
            data-ocid="notification-editor.title_input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Betreff der Nachricht"
          />
          {errors.title && (
            <p className="text-xs text-destructive">{errors.title}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Priority */}
          <div className="space-y-1">
            <Label>Priorit&auml;t</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger data-ocid="notification-editor.priority_select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NotificationPriority.normal}>
                  Normal
                </SelectItem>
                <SelectItem value={NotificationPriority.important}>
                  Wichtig
                </SelectItem>
                <SelectItem value={NotificationPriority.critical}>
                  Kritisch
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Format */}
          <div className="space-y-1">
            <Label>Format</Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger data-ocid="notification-editor.format_select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NotificationFormat.markdown}>
                  Markdown
                </SelectItem>
                <SelectItem value={NotificationFormat.html}>HTML</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="notif-validFrom">G&uuml;ltig ab *</Label>
            <Input
              id="notif-validFrom"
              type="date"
              data-ocid="notification-editor.valid_from_input"
              value={validFrom}
              onChange={(e) => setValidFrom(e.target.value)}
            />
            {errors.validFrom && (
              <p className="text-xs text-destructive">{errors.validFrom}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="notif-validUntil">G&uuml;ltig bis (optional)</Label>
            <Input
              id="notif-validUntil"
              type="date"
              data-ocid="notification-editor.valid_until_input"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
            />
          </div>
        </div>

        {/* Message body */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label htmlFor="notif-body">Nachrichteninhalt</Label>
            <button
              type="button"
              className="text-xs text-primary hover:underline flex items-center gap-1"
              onClick={() => setPreview((v) => !v)}
              data-ocid="notification-editor.preview_toggle"
            >
              {preview ? (
                <EyeOff className="w-3 h-3" />
              ) : (
                <Eye className="w-3 h-3" />
              )}
              {preview ? "Bearbeiten" : "Vorschau"}
            </button>
          </div>
          {preview ? (
            <div
              className="min-h-[120px] border border-border rounded-md p-3 text-sm text-foreground bg-muted/20 prose prose-sm max-w-none"
              // biome-ignore lint/security/noDangerouslySetInnerHtml: sanitized preview
              dangerouslySetInnerHTML={{
                __html:
                  format === NotificationFormat.html
                    ? body
                        .replace(/<script[\s\S]*?<\/script>/gi, "")
                        .replace(/on\w+\s*=\s*(["'])[^"']*\1/gi, "")
                    : `<p>${body.replace(/\n/g, "<br />")}</p>`,
              }}
            />
          ) : (
            <Textarea
              id="notif-body"
              data-ocid="notification-editor.body_textarea"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              placeholder={
                format === NotificationFormat.markdown
                  ? "**Fettschrift**, *Kursiv*, # Überschrift"
                  : "<p>HTML-Inhalt</p>"
              }
            />
          )}
        </div>

        {/* Recipients */}
        <div className="space-y-1">
          <Label>Empf&auml;nger *</Label>
          <RecipientSelector value={recipients} onChange={setRecipients} />
          {errors.recipients && (
            <p className="text-xs text-destructive">{errors.recipients}</p>
          )}
          {/* Recipient count estimate */}
          {(recipients.tenantIds.length > 0 ||
            recipients.roleIds.length > 0 ||
            recipients.userIds.length > 0) && (
            <p className="text-xs text-muted-foreground">
              Gesch&auml;tzt{" "}
              <span className="font-medium text-foreground">
                {estimatedRecipients}
              </span>{" "}
              Empf&auml;nger
            </p>
          )}
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isSubmitting}
          data-ocid="notification-editor.cancel_button"
        >
          Abbrechen
        </Button>
        <Button
          type="button"
          variant="outline"
          className="gap-1.5"
          onClick={() => {
            if (validate()) saveDraftMutation.mutate();
          }}
          disabled={isSubmitting}
          data-ocid="notification-editor.save_draft_button"
        >
          <Save className="w-4 h-4" />
          Entwurf
        </Button>
        <Button
          type="button"
          className="gap-1.5"
          onClick={() => {
            if (validate()) sendMutation.mutate();
          }}
          disabled={isSubmitting}
          data-ocid="notification-editor.send_button"
        >
          <Send className="w-4 h-4" />
          {sendMutation.isPending ? "Sendet..." : "Senden"}
        </Button>
      </div>
    </div>
  );
}
