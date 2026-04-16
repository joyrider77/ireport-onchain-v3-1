import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { Button } from "@/components/ui/button";
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
import { formatDateDE } from "@/lib/dateFormat";
import { useActor as useActorCore } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { createActor } from "../../backend";
import type {
  CreateVacationBalanceInput,
  EmployeeId,
  UpdateVacationBalanceInput,
  VacationBalance,
  backendInterface,
} from "../../backend.d";
import {
  dateToTimestamp,
  formatVacationDays,
  parseVacationDays,
  timestampToDate,
} from "./shared";

type AnyActor = backendInterface;
function useTypedActor() {
  const { actor, isFetching } = useActorCore(createActor);
  return { actor: actor ? (actor as unknown as AnyActor) : null, isFetching };
}

interface VacationForm {
  kalenderjahr: string;
  dauer: string;
  verfallsdatum: string;
}

const defaultForm: VacationForm = {
  kalenderjahr: String(new Date().getFullYear()),
  dauer: "20",
  verfallsdatum: "",
};

function balanceToForm(b: VacationBalance): VacationForm {
  return {
    kalenderjahr: String(b.kalenderjahr),
    dauer: formatVacationDays(b.dauer),
    verfallsdatum: b.verfallsdatum ? timestampToDate(b.verfallsdatum) : "",
  };
}

interface Props {
  employeeId: EmployeeId;
  canWrite: boolean;
}

export function VacationBalanceSection({ employeeId, canWrite }: Props) {
  const { actor, isFetching } = useTypedActor();
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<VacationBalance | null>(null);
  const [form, setForm] = useState<VacationForm>(defaultForm);
  const [deleteTarget, setDeleteTarget] = useState<VacationBalance | null>(
    null,
  );

  const queryKey = ["vacationBalances", String(employeeId)];

  const { data: balances = [], isLoading } = useQuery<VacationBalance[]>({
    queryKey,
    queryFn: async () => {
      if (!actor) return [];
      const res = await actor.listVacationBalances(employeeId);
      if (res.__kind__ === "err") return [];
      return res.ok;
    },
    enabled: !!actor && !isFetching,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Kein Actor");
      const dauerBigint = parseVacationDays(form.dauer);
      if (dauerBigint === null) throw new Error("Ungültige Dauer");
      const year = Number.parseInt(form.kalenderjahr, 10);
      if (!year || year < 1900 || year > 2100)
        throw new Error("Ungültiges Kalenderjahr");

      if (editItem) {
        const input: UpdateVacationBalanceInput = {
          kalenderjahr: BigInt(year),
          dauer: dauerBigint,
          verfallsdatum: form.verfallsdatum
            ? dateToTimestamp(form.verfallsdatum)
            : undefined,
        };
        const res = await actor.updateVacationBalance(
          employeeId,
          editItem.id,
          input,
        );
        if (res.__kind__ === "err") throw new Error(res.err);
        return res.ok;
      }
      const input: CreateVacationBalanceInput = {
        kalenderjahr: BigInt(year),
        dauer: dauerBigint,
        verfallsdatum: form.verfallsdatum
          ? dateToTimestamp(form.verfallsdatum)
          : undefined,
      };
      const res = await actor.createVacationBalance(employeeId, input);
      if (res.__kind__ === "err") throw new Error(res.err);
      return res.ok;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey });
      toast.success(
        editItem ? "Ferienguthaben aktualisiert" : "Ferienguthaben hinzugefügt",
      );
      setDialogOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Kein Actor");
      const res = await actor.deleteVacationBalance(employeeId, id);
      if (res.__kind__ === "err") throw new Error(res.err);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey });
      toast.success("Ferienguthaben gelöscht");
      setDeleteTarget(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function openAdd() {
    setEditItem(null);
    setForm(defaultForm);
    setDialogOpen(true);
  }

  function openEdit(b: VacationBalance) {
    setEditItem(b);
    setForm(balanceToForm(b));
    setDialogOpen(true);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-sm">Ferienguthaben</h3>
        {canWrite && (
          <Button size="sm" onClick={openAdd} className="gap-2">
            <Plus className="w-4 h-4" />
            Hinzufügen
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : (
        <div className="rounded-md border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Kalenderjahr</TableHead>
                <TableHead className="text-right">Dauer (Tage)</TableHead>
                <TableHead>Verfallsdatum</TableHead>
                {canWrite && (
                  <TableHead className="text-right">Aktionen</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {balances.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={canWrite ? 4 : 3}
                    className="text-center py-6 text-muted-foreground text-sm"
                  >
                    Keine Ferienguthaben erfasst
                  </TableCell>
                </TableRow>
              ) : (
                balances.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-medium">
                      {String(b.kalenderjahr)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatVacationDays(b.dauer)}
                    </TableCell>
                    <TableCell>
                      {b.verfallsdatum ? (
                        formatDateDE(timestampToDate(b.verfallsdatum))
                      ) : (
                        <span className="text-muted-foreground italic">—</span>
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
                            onClick={() => openEdit(b)}
                            aria-label="Bearbeiten"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => setDeleteTarget(b)}
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

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editItem
                ? "Ferienguthaben bearbeiten"
                : "Ferienguthaben hinzufügen"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-1">
              <Label htmlFor="vb-jahr">Kalenderjahr *</Label>
              <Input
                id="vb-jahr"
                type="number"
                min={2000}
                max={2100}
                value={form.kalenderjahr}
                onChange={(e) =>
                  setForm({ ...form, kalenderjahr: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="vb-dauer">
                Dauer (Tage, z.B. 20 oder 10.5) *
              </Label>
              <Input
                id="vb-dauer"
                placeholder="z.B. 20 oder 10.5"
                value={form.dauer}
                onChange={(e) => setForm({ ...form, dauer: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="vb-verfall">Verfallsdatum</Label>
              <Input
                id="vb-verfall"
                type="date"
                value={form.verfallsdatum}
                onChange={(e) =>
                  setForm({ ...form, verfallsdatum: e.target.value })
                }
              />
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
              data-ocid="vacationbalance-save"
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? "Speichern..." : "Speichern"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <DeleteConfirmDialog
        open={!!deleteTarget}
        onConfirm={() => {
          if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}
