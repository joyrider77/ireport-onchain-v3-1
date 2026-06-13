import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, LockOpen } from "lucide-react";
import { useState } from "react";

interface ReopenPeriodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeName?: string;
  month: number;
  year: number;
  requireReason?: boolean;
  onConfirm: (reason: string) => Promise<void>;
}

export function ReopenPeriodDialog({
  open,
  onOpenChange,
  employeeName,
  month,
  year,
  requireReason = true,
  onConfirm,
}: ReopenPeriodDialogProps) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const monthLabel = new Date(year, month - 1, 1).toLocaleDateString("de-CH", {
    month: "long",
    year: "numeric",
  });

  const canSubmit = !requireReason || reason.trim().length > 0;

  const handleConfirm = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await onConfirm(reason.trim());
      setReason("");
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-ocid="period-close.reopen_dialog"
        className="max-w-md"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LockOpen className="w-4 h-4 text-primary" />
            Periode wieder öffnen
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-1">
          {employeeName && (
            <p className="text-sm text-muted-foreground">
              Mitarbeiter: <strong>{employeeName}</strong>
            </p>
          )}
          <p className="text-sm text-muted-foreground">
            Monat: <strong>{monthLabel}</strong>
          </p>
          <p className="text-sm text-foreground">
            Die abgeschlossene Periode wird wieder geöffnet. Die Wiederöffnung
            wird im Audit-Protokoll festgehalten.
          </p>

          <div className="space-y-1.5">
            <Label htmlFor="reopen-reason">
              Begründung
              {requireReason && (
                <span className="text-destructive ml-0.5">*</span>
              )}
            </Label>
            <Textarea
              id="reopen-reason"
              data-ocid="period-close.reopen_dialog.reason_input"
              placeholder="Begründung für die Wiederöffnung…"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="resize-none"
            />
            {requireReason && reason.trim().length === 0 && (
              <p
                data-ocid="period-close.reopen_dialog.reason_error"
                className="text-xs text-destructive"
              >
                Begründung ist erforderlich.
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            data-ocid="period-close.reopen_dialog.cancel_button"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Abbrechen
          </Button>
          <Button
            type="button"
            data-ocid="period-close.reopen_dialog.confirm_button"
            onClick={handleConfirm}
            disabled={submitting || !canSubmit}
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <LockOpen className="w-4 h-4 mr-2" />
            )}
            Periode öffnen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
