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
  onConfirm: (comment?: string) => void;
}

export function ClosePeriodDialog({ open, onOpenChange, employeeName, month, year, isPending, onConfirm }: Props) {
  const [comment, setComment] = useState("");

  const handleConfirm = () => {
    onConfirm(comment.trim() || undefined);
    setComment("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-ocid="close_period.dialog">
        <DialogHeader>
          <DialogTitle>Periode abschliessen</DialogTitle>
          <DialogDescription>
            Monat {month.toString().padStart(2, "0")}/{year} für <strong>{employeeName}</strong> abschliessen?
            Danach sind keine Änderungen mehr möglich.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="close-comment">Kommentar (optional)</Label>
          <Textarea
            id="close-comment"
            data-ocid="close_period.textarea"
            placeholder="Kommentar zum Abschluss..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} data-ocid="close_period.cancel_button">
            Abbrechen
          </Button>
          <Button type="button" onClick={handleConfirm} disabled={isPending} data-ocid="close_period.confirm_button">
            {isPending ? "Wird abgeschlossen..." : "Abschliessen"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
