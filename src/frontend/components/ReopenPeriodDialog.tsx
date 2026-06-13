import { useState } from "react";
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  employeeName: string;
  month: number;
  year: number;
  isPending: boolean;
  onConfirm: (reason: string) => void;
}

export function ReopenPeriodDialog({ open, onOpenChange, employeeName, month, year, isPending, onConfirm }: Props) {
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    if (!reason.trim()) return;
    onConfirm(reason.trim());
    setReason("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-ocid="reopen_period.dialog">
        <DialogHeader>
          <DialogTitle>Periode wieder öffnen</DialogTitle>
          <DialogDescription>
            Monat {month.toString().padStart(2, "0")}/{year} für <strong>{employeeName}</strong> wieder öffnen?
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="reopen-reason">Begründung <span className="text-destructive">*</span></Label>
          <Textarea
            id="reopen-reason"
            data-ocid="reopen_period.textarea"
            placeholder="Begründung für Wiederöffnung (Pflichtfeld)..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} data-ocid="reopen_period.cancel_button">
            Abbrechen
          </Button>
          <Button type="button" onClick={handleConfirm} disabled={isPending || !reason.trim()} data-ocid="reopen_period.confirm_button">
            {isPending ? "Wird geöffnet..." : "Wieder öffnen"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
