import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
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
import { Lock, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { createActor } from "../../backend";
import type { AbsenceType, UpdateAbsenceTypeInput } from "../../backend.d";
import { useMutation, useQuery, useQueryClient } from "./shared";

type AnyActor = Record<string, (...args: unknown[]) => Promise<unknown>>;
const toAny = (a: unknown): AnyActor => a as AnyActor;

interface AbsenceTypeForm {
  name: string;
  requiresApproval: boolean;
  compensated: boolean;
  aktiv: boolean;
}

const defaultForm: AbsenceTypeForm = {
  name: "",
  requiresApproval: false,
  compensated: false,
  aktiv: true,
};

/** Returns true if this absence type is the system-managed "Ferien" type */
function isSystemFerien(at: AbsenceType): boolean {
  return (
    at.name.toLowerCase() === "ferien" ||
    (at.requiresApproval === true && at.compensated === true)
  );
}

export function AbsenceTypenTab() {
  const { role } = useAuth();
  const canWrite = role === "admin" || role === "manager";
  const { actor, isFetching } = useActor(createActor);
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<AbsenceType | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AbsenceType | null>(null);
  const [form, setForm] = useState<AbsenceTypeForm>(defaultForm);
  const [nameError, setNameError] = useState("");

  // Whether we are currently editing the system-managed Ferien type
  const isEditingFerien = editItem !== null && isSystemFerien(editItem);

  const { data: absenceTypes = [], isLoading } = useQuery<AbsenceType[]>({
    queryKey: ["absenceTypes"],
    queryFn: async () => {
      if (!actor) return [];
      return toAny(actor).listAbsenceTypes() as Promise<AbsenceType[]>;
    },
    enabled: !!actor && !isFetching,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Kein Actor");
      if (editItem) {
        // For the system-managed Ferien type: send all existing values plus the
        // user-edited requiresApproval. We must NOT send partial updates with
        // boolean fields set to false as optional — the Candid serializer treats
        // `false` as `candid_none()` (no-change signal). Sending the full current
        // values ensures the update goes through correctly.
        const updatePayload: UpdateAbsenceTypeInput = isEditingFerien
          ? {
              name: editItem.name, // keep locked
              requiresApproval: form.requiresApproval, // only user-editable field
              compensated: editItem.compensated, // keep locked
              aktiv: editItem.aktiv, // keep locked
            }
          : {
              name: form.name,
              requiresApproval: form.requiresApproval,
              compensated: form.compensated,
              aktiv: form.aktiv,
            };
        const res = (await toAny(actor).updateAbsenceType(
          editItem.id,
          updatePayload,
        )) as { __kind__: string; ok?: AbsenceType; err?: string };
        if (res.__kind__ === "err") throw new Error(res.err ?? "Fehler");
        return res.ok;
      }
      const res = (await toAny(actor).createAbsenceType({
        name: form.name,
        requiresApproval: form.requiresApproval,
        compensated: form.compensated,
        aktiv: form.aktiv,
      })) as { __kind__: string; ok?: AbsenceType; err?: string };
      if (res.__kind__ === "err") throw new Error(res.err ?? "Fehler");
      return res.ok;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["absenceTypes"] });
      toast.success(
        editItem ? "Abwesenheitsart aktualisiert" : "Abwesenheitsart erstellt",
      );
      setDialogOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Kein Actor");
      const res = (await toAny(actor).deleteAbsenceType(id)) as {
        __kind__: string;
        err?: string;
      };
      if (res.__kind__ === "err") throw new Error(res.err ?? "Fehler");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["absenceTypes"] });
      toast.success("Abwesenheitsart gelöscht");
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

  function openEdit(at: AbsenceType) {
    setEditItem(at);
    setForm({
      name: at.name,
      requiresApproval: at.requiresApproval,
      compensated: at.compensated,
      aktiv: at.aktiv,
    });
    setNameError("");
    setDialogOpen(true);
  }

  function handleSubmit() {
    if (!form.name.trim() && !isEditingFerien) {
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
          {absenceTypes.length} Abwesenheitsarten
        </p>
        {canWrite && (
          <Button
            data-ocid="abwesenheitsarten-add"
            onClick={openAdd}
            size="sm"
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Abwesenheitsart hinzufügen
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
                <TableHead>Genehmigung erforderlich</TableHead>
                <TableHead>Entschädigt (Arbeitszeit)</TableHead>
                <TableHead>Status</TableHead>
                {canWrite && (
                  <TableHead className="text-right">Aktionen</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {absenceTypes.filter((at) => !isSystemFerien(at)).length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={canWrite ? 5 : 4}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Keine Abwesenheitsarten vorhanden
                  </TableCell>
                </TableRow>
              ) : (
                absenceTypes
                  .filter((at) => !isSystemFerien(at))
                  .map((at) => (
                    <TableRow
                      key={String(at.id)}
                      data-ocid="abwesenheitsarten-row"
                    >
                      <TableCell className="font-medium">{at.name}</TableCell>
                      <TableCell>
                        {at.requiresApproval ? "Ja" : "Nein"}
                      </TableCell>
                      <TableCell>{at.compensated ? "Ja" : "Nein"}</TableCell>
                      <TableCell>
                        {at.aktiv ? (
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
                              onClick={() => openEdit(at)}
                              aria-label="Bearbeiten"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => setDeleteTarget(at)}
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
              {editItem
                ? "Abwesenheitsart bearbeiten"
                : "Abwesenheitsart hinzufügen"}
            </DialogTitle>
          </DialogHeader>

          {/* System-managed notice for Ferien */}
          {isEditingFerien && (
            <div className="flex items-start gap-2 rounded-lg bg-primary/5 border border-primary/20 px-3 py-2.5 text-sm">
              <Lock className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <p className="text-muted-foreground text-xs leading-relaxed">
                <span className="font-semibold text-foreground">
                  Systemverwaltet:
                </span>{" "}
                Für die Abwesenheitsart <em>Ferien</em> kann nur{" "}
                <strong>Genehmigung erforderlich</strong> bearbeitet werden.
              </p>
            </div>
          )}

          <div className="grid gap-4 py-2">
            <div className="space-y-1">
              <Label htmlFor="atname">Name *</Label>
              <Input
                id="atname"
                data-ocid="abwesenheitsarten-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                disabled={isEditingFerien}
                className={
                  isEditingFerien ? "opacity-60 cursor-not-allowed" : ""
                }
              />
              {nameError && (
                <p className="text-xs text-destructive">{nameError}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="atapproval"
                data-ocid="abwesenheitsarten-approval"
                checked={form.requiresApproval}
                onCheckedChange={(v) =>
                  setForm({ ...form, requiresApproval: !!v })
                }
              />
              <Label htmlFor="atapproval">Genehmigung erforderlich</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="atcompensated"
                data-ocid="abwesenheitsarten-compensated"
                checked={form.compensated}
                onCheckedChange={
                  isEditingFerien
                    ? undefined
                    : (v) => setForm({ ...form, compensated: !!v })
                }
                disabled={isEditingFerien}
                className={
                  isEditingFerien ? "opacity-60 cursor-not-allowed" : ""
                }
              />
              <Label
                htmlFor="atcompensated"
                className={isEditingFerien ? "opacity-60" : ""}
              >
                Entschädigt (Arbeitszeit)
                <span className="block text-xs font-normal text-muted-foreground mt-0.5">
                  Abwesenheit zählt als Arbeitszeit
                </span>
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="ataktiv"
                data-ocid="abwesenheitsarten-aktiv"
                checked={form.aktiv}
                onCheckedChange={
                  isEditingFerien
                    ? undefined
                    : (v) => setForm({ ...form, aktiv: !!v })
                }
                disabled={isEditingFerien}
                className={
                  isEditingFerien ? "opacity-60 cursor-not-allowed" : ""
                }
              />
              <Label
                htmlFor="ataktiv"
                className={isEditingFerien ? "opacity-60" : ""}
              >
                Aktiv
                <span className="block text-xs font-normal text-muted-foreground mt-0.5">
                  Inaktive Abwesenheitsarten werden bei der Erfassung nicht
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
              data-ocid="abwesenheitsarten-save"
              onClick={handleSubmit}
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? "Speichern..." : "Speichern"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
