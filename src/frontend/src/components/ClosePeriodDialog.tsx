import type { MonthlyCloseRow, PrecheckResult } from "@/backend";
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
import { Loader2, Lock } from "lucide-react";
import { useState } from "react";
import { MonthlyClosePrecheckPanel } from "./MonthlyClosePrecheckPanel";

interface ClosePeriodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: MonthlyCloseRow | null;
  month: number;
  year: number;
  precheckResult?: PrecheckResult | null;
  precheckLoading?: boolean;
  precheckError?: string | null;
  onConfirm: (comment: string) => Promise<void>;
  isBulk?: boolean;
  bulkCount?: number;
}

export function ClosePeriodDialog({
  open,
  onOpenChange,
  employee,
  month,
  year,
  precheckResult,
  precheckLoading = false,
  precheckError = null,
  onConfirm,
  isBulk = false,
  bulkCount = 0,
}: ClosePeriodDialogProps) {
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const monthLabel = new Date(year, month - 1, 1).toLocaleDateString("de-CH", {
    month: "long",
    year: "numeric",
  });

  const canClose = precheckResult?.canClose !== false;

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await onConfirm(comment);
      setComment("");
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-ocid="period-close.close_dialog" className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-primary" />
            {isBulk
              ? `${bulkCount} Mitarbeitende abschliessen`
              : `Periode abschliessen – ${employee ? `${employee.firstName} ${employee.lastName}` : ""}`}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <p className="text-sm text-muted-foreground">
            Monat: <strong>{monthLabel}</strong>
          </p>

          <MonthlyClosePrecheckPanel
            result={precheckResult ?? null}
            loading={precheckLoading}
            error={precheckError}
          />

          <div className="space-y-1.5">
            <Label htmlFor="close-comment">Abschlusskommentar (optional)</Label>
            <Textarea
              id="close-comment"
              data-ocid="period-close.close_dialog.comment_input"
              placeholder="Optionaler Kommentar zum Abschluss…"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={2}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            data-ocid="period-close.close_dialog.cancel_button"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Abbrechen
          </Button>
          <Button
            type="button"
            data-ocid="period-close.close_dialog.confirm_button"
            onClick={handleConfirm}
            disabled={submitting || !canClose || precheckLoading}
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Lock className="w-4 h-4 mr-2" />
            )}
            Abschliessen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
