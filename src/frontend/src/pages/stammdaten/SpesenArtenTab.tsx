import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/hooks/useAuthStore";
import { useActor } from "@caffeineai/core-infrastructure";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { createActor } from "../../backend";
import type { ExpenseType } from "../../backend.d";
import { useMutation, useQuery, useQueryClient } from "./shared";

interface ExpenseTypeForm {
  name: string;
  billable: boolean;
  reimbursable: boolean;
  aktiv: boolean;
}

const defaultForm: ExpenseTypeForm = {
  name: "",
  billable: true,
  reimbursable: true,
  aktiv: true,
};

export function SpesenArtenTab() {
  const { role } = useAuth();
  const canWrite = role === "admin" || role === "manager";
  const { actor, isFetching } = useActor(createActor);
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<ExpenseType | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ExpenseType | null>(null);
  const [form, setForm] = useState<ExpenseTypeForm>(defaultForm);
  const [nameError, setNameError] = useState("");

  const { data: expenseTypes = [], isLoading } = useQuery<ExpenseType[]>({
    queryKey: ["expenseTypes"],
    queryFn: () => actor?.listExpenseTypes() ?? [],
    enabled: !!actor && !isFetching,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Kein Actor");
      if (editItem) {
        const res = await actor.updateExpenseType(editItem.id, {
          name: form.name,
          billable: form.billable,
          reimbursable: form.reimbursable,
          aktiv: form.aktiv,
        });
        if (res.__kind__ === "err") throw new Error(res.err);
        return res.ok;
      }
      const res = await actor.createExpenseType({
        name: form.name,
        billable: form.billable,
        reimbursable: form.reimbursable,
        aktiv: form.aktiv,
      });
      if (res.__kind__ === "err") throw new Error(res.err);
      return res.ok;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["expenseTypes"] });
      toast.success(editItem ? "Spesenart aktualisiert" : "Spesenart erstellt");
      setDialogOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Kein Actor");
      const res = await actor.deleteExpenseType(id);
      if (res.__kind__ === "err") throw new Error(res.err);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["expenseTypes"] });
      toast.success("Spesenart gelöscht");
      setDeleteTarget(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function openAdd() {
    setEditItem(null);
    setForm(defaultForm);
    setNameError("");
    setDialogOpen(true);
  }

  function openEdit(et: ExpenseType) {
    setEditItem(et);
    setForm({
      name: et.name,
      billable: et.billable,
      reimbursable: et.reimbursable,
      aktiv: et.aktiv,
    });
    setNameError("");
    setDialogOpen(true);
  }

  function handleSubmit() {
    if (!form.name.trim()) {
      setNameError("Pflichtfeld");
      return;
    }
    setNameError("");
    saveMutation.mutate();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {expenseTypes.length} Spesenarten
        </p>
        {canWrite && (
          <Button
            data-ocid="spesenarten-add"
            onClick={openAdd}
            size="sm"
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Spesenart hinzufügen
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Name</TableHead>
                <TableHead>Verrechenbar</TableHead>
                <TableHead>Rückerstattbar</TableHead>
                <TableHead>Status</TableHead>
                {canWrite && (
                  <TableHead className="text-right">Aktionen</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenseTypes.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={canWrite ? 5 : 4}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Keine Spesenarten vorhanden
                  </TableCell>
                </TableRow>
              ) : (
                expenseTypes.map((et) => (
                  <TableRow key={String(et.id)} data-ocid="spesenarten-row">
                    <TableCell className="font-medium">{et.name}</TableCell>
                    <TableCell>{et.billable ? "Ja" : "Nein"}</TableCell>
                    <TableCell>{et.reimbursable ? "Ja" : "Nein"}</TableCell>
                    <TableCell>
                      {et.aktiv ? (
                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100">
                          Aktiv
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Inaktiv</Badge>
                      )}
                    </TableCell>
                    {canWrite && (
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openEdit(et)}
                            aria-label="Bearbeiten"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => setDeleteTarget(et)}
                            aria-label="Löschen"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editItem ? "Spesenart bearbeiten" : "Spesenart hinzufügen"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-1">
              <Label htmlFor="etname">Name *</Label>
              <Input
                id="etname"
                data-ocid="spesenarten-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              {nameError && (
                <p className="text-xs text-destructive">{nameError}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="etbillable"
                data-ocid="spesenarten-billable"
                checked={form.billable}
                onCheckedChange={(v) => setForm({ ...form, billable: !!v })}
              />
              <Label htmlFor="etbillable">Verrechenbar</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="etreimbursable"
                data-ocid="spesenarten-reimbursable"
                checked={form.reimbursable}
                onCheckedChange={(v) => setForm({ ...form, reimbursable: !!v })}
              />
              <Label htmlFor="etreimbursable">Rückerstattbar</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="etaktiv"
                data-ocid="spesenarten-aktiv"
                checked={form.aktiv}
                onCheckedChange={(v) => setForm({ ...form, aktiv: !!v })}
              />
              <Label htmlFor="etaktiv">
                Aktiv
                <span className="block text-xs font-normal text-muted-foreground mt-0.5">
                  Inaktive Spesenarten werden bei der Speseneingabe nicht
                  angezeigt
                </span>
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              Abbrechen
            </Button>
            <Button
              type="button"
              data-ocid="spesenarten-save"
              onClick={handleSubmit}
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? "Speichern..." : "Speichern"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Spesenart löschen</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Möchten Sie <strong>{deleteTarget?.name}</strong> wirklich löschen?
          </p>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteTarget(null)}
            >
              Abbrechen
            </Button>
            <Button
              type="button"
              variant="destructive"
              data-ocid="spesenarten-delete-confirm"
              onClick={() =>
                deleteTarget && deleteMutation.mutate(deleteTarget.id)
              }
              disabled={deleteMutation.isPending}
            >
              Löschen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
