import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { Badge } from "@/components/ui/badge";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Clock, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { createActor } from "../../backend";
import type {
  CreateTimeBalanceCorrectionInput,
  EmployeeId,
  TimeBalanceCorrection,
  UpdateTimeBalanceCorrectionInput,
  backendInterface,
} from "../../backend.d";
import { Variant_gutschrift_reduktion } from "../../backend.d";
import {
  dateToTimestamp,
  hhhmmToMinutes,
  minutesToHhhMm,
  timestampToDate,
} from "./shared";

type AnyActor = backendInterface;
function useTypedActor() {
  const { actor, isFetching } = useActorCore(createActor);
  return { actor: actor ? (actor as unknown as AnyActor) : null, isFetching };
}

interface CorrectionForm {
  typ: Variant_gutschrift_reduktion;
  wirkungsdatum: string;
  dauer: string;
  ueberzeit: string;
  bemerkung: string;
}

const defaultForm: CorrectionForm = {
  typ: Variant_gutschrift_reduktion.gutschrift,
  wirkungsdatum: new Date().toISOString().split("T")[0],
  dauer: "000:00",
  ueberzeit: "000:00",
  bemerkung: "",
};

function correctionToForm(c: TimeBalanceCorrection): CorrectionForm {
  return {
    typ: c.typ,
    wirkungsdatum: timestampToDate(c.wirkungsdatum),
    dauer: minutesToHhhMm(Number(c.dauer)),
    ueberzeit: minutesToHhhMm(Number(c.ueberzeit)),
    bemerkung: c.bemerkung,
  };
}

interface Props {
  employeeId: EmployeeId;
  canWrite: boolean;
}

export function TimeBalanceCorrectionSection({ employeeId, canWrite }: Props) {
  const { actor, isFetching } = useTypedActor();
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<TimeBalanceCorrection | null>(null);
  const [form, setForm] = useState<CorrectionForm>(defaultForm);
  const [deleteTarget, setDeleteTarget] =
    useState<TimeBalanceCorrection | null>(null);

  const correctionQueryKey = ["timeBalanceCorrections", String(employeeId)];
  const balanceQueryKey = ["timeBalance", String(employeeId)];

  const { data: corrections = [], isLoading } = useQuery<
    TimeBalanceCorrection[]
  >({
    queryKey: correctionQueryKey,
    queryFn: async () => {
      if (!actor) return [];
      const res = await actor.listTimeBalanceCorrections(employeeId);
      if (res.__kind__ === "err") return [];
      return res.ok;
    },
    enabled: !!actor && !isFetching,
  });

  const { data: timeBalance } = useQuery<bigint | null>({
    queryKey: balanceQueryKey,
    queryFn: async () => {
      if (!actor) return null;
      const res = await actor.getTimeBalance(employeeId);
      if (res.__kind__ === "err") return null;
      return res.ok;
    },
    enabled: !!actor && !isFetching,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Kein Actor");
      const dauerMin = hhhmmToMinutes(form.dauer);
      const ueberzeitMin = hhhmmToMinutes(form.ueberzeit);
      if (dauerMin === null) throw new Error("Ungültiges Dauerformat (hhh:mm)");
      if (ueberzeitMin === null)
        throw new Error("Ungültiges Überzeitformat (hhh:mm)");

      if (editItem) {
        const input: UpdateTimeBalanceCorrectionInput = {
          typ: form.typ,
          wirkungsdatum: dateToTimestamp(form.wirkungsdatum),
          dauer: BigInt(dauerMin),
          ueberzeit: BigInt(ueberzeitMin),
          bemerkung: form.bemerkung,
        };
        const res = await actor.updateTimeBalanceCorrection(
          employeeId,
          editItem.id,
          input,
        );
        if (res.__kind__ === "err") throw new Error(res.err);
        return res.ok;
      }
      const input: CreateTimeBalanceCorrectionInput = {
        typ: form.typ,
        wirkungsdatum: dateToTimestamp(form.wirkungsdatum),
        dauer: BigInt(dauerMin),
        ueberzeit: BigInt(ueberzeitMin),
        bemerkung: form.bemerkung,
      };
      const res = await actor.createTimeBalanceCorrection(employeeId, input);
      if (res.__kind__ === "err") throw new Error(res.err);
      return res.ok;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: correctionQueryKey });
      qc.invalidateQueries({ queryKey: balanceQueryKey });
      toast.success(
        editItem
          ? "Zeitsaldokorrektur aktualisiert"
          : "Zeitsaldokorrektur hinzugefügt",
      );
      setDialogOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Kein Actor");
      const res = await actor.deleteTimeBalanceCorrection(employeeId, id);
      if (res.__kind__ === "err") throw new Error(res.err);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: correctionQueryKey });
      qc.invalidateQueries({ queryKey: balanceQueryKey });
      toast.success("Zeitsaldokorrektur gelöscht");
      setDeleteTarget(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function openAdd() {
    setEditItem(null);
    setForm(defaultForm);
    setDialogOpen(true);
  }

  function openEdit(c: TimeBalanceCorrection) {
    setEditItem(c);
    setForm(correctionToForm(c));
    setDialogOpen(true);
  }

  function setField(key: keyof CorrectionForm, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const balanceMinutes = timeBalance ? Number(timeBalance) : null;

  return (
    <div className="space-y-4">
      {/* Zeitsaldo Summary */}
      <div className="rounded-lg border border-border p-4 bg-muted/20 flex items-center gap-3">
        <Clock className="w-5 h-5 text-primary shrink-0" />
        <div>
          <p className="text-xs text-muted-foreground">Aktueller Zeitsaldo</p>
          <p className="text-xl font-semibold font-mono">
            {balanceMinutes === null ? (
              <Skeleton className="h-7 w-24 inline-block" />
            ) : (
              minutesToHhhMm(balanceMinutes)
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="font-medium text-sm">Zeitsaldokorrekturen</h3>
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
                <TableHead>Typ</TableHead>
                <TableHead>Wirkungsdatum</TableHead>
                <TableHead className="text-right">Dauer</TableHead>
                <TableHead className="text-right">Überzeit</TableHead>
                <TableHead>Bemerkung</TableHead>
                {canWrite && (
                  <TableHead className="text-right">Aktionen</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {corrections.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={canWrite ? 6 : 5}
                    className="text-center py-6 text-muted-foreground text-sm"
                  >
                    Keine Zeitsaldokorrekturen erfasst
                  </TableCell>
                </TableRow>
              ) : (
                corrections.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <Badge
                        variant={
                          c.typ === "gutschrift" ? "default" : "secondary"
                        }
                      >
                        {c.typ === "gutschrift" ? "Gutschrift" : "Reduktion"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatDateDE(timestampToDate(c.wirkungsdatum))}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {minutesToHhhMm(Number(c.dauer))}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {minutesToHhhMm(Number(c.ueberzeit))}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-muted-foreground">
                      {c.bemerkung || "—"}
                    </TableCell>
                    {canWrite && (
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openEdit(c)}
                            aria-label="Bearbeiten"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => setDeleteTarget(c)}
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
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editItem
                ? "Zeitsaldokorrektur bearbeiten"
                : "Zeitsaldokorrektur hinzufügen"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Typ *</Label>
                <Select
                  value={form.typ}
                  onValueChange={(v) => setField("typ", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gutschrift">Gutschrift</SelectItem>
                    <SelectItem value="reduktion">Reduktion</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="tc-datum">Wirkungsdatum *</Label>
                <Input
                  id="tc-datum"
                  type="date"
                  value={form.wirkungsdatum}
                  onChange={(e) => setField("wirkungsdatum", e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="tc-dauer">Dauer (hhh:mm) *</Label>
                <Input
                  id="tc-dauer"
                  placeholder="000:00"
                  value={form.dauer}
                  onChange={(e) => setField("dauer", e.target.value)}
                  className="font-mono"
                  maxLength={10}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="tc-ueberzeit">Überzeit (hhh:mm)</Label>
                <Input
                  id="tc-ueberzeit"
                  placeholder="000:00"
                  value={form.ueberzeit}
                  onChange={(e) => setField("ueberzeit", e.target.value)}
                  className="font-mono"
                  maxLength={10}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="tc-bemerkung">Bemerkung</Label>
              <Input
                id="tc-bemerkung"
                value={form.bemerkung}
                onChange={(e) => setField("bemerkung", e.target.value)}
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
              data-ocid="timecorrection-save"
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
