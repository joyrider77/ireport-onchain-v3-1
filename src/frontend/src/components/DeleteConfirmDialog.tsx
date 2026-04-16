import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DeleteConfirmDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
  title?: string;
  description?: string;
}

export function DeleteConfirmDialog({
  open,
  onConfirm,
  onCancel,
  isDeleting = false,
  title = "Eintrag löschen?",
  description = "Bist du sicher, dass du diesen Eintrag löschen möchtest? Diese Aktion kann nicht rückgängig gemacht werden.",
}: DeleteConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onCancel();
      }}
    >
      <DialogContent className="max-w-sm" data-ocid="delete-confirm.dialog">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground py-2">{description}</p>
        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isDeleting}
            data-ocid="delete-confirm.cancel_button"
          >
            Abbrechen
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
            data-ocid="delete-confirm.confirm_button"
          >
            {isDeleting ? "Löschen…" : "Ja, löschen"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
