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
import type { ServiceType } from "../../backend.d";
import { useMutation, useQuery, useQueryClient } from "./shared";

interface ServiceTypeForm {
  name: string;
  billable: boolean;
  defaultRate: number;
  aktiv: boolean;
}

const defaultForm: ServiceTypeForm = {
  name: "",
  billable: true,
  defaultRate: 0,
  aktiv: true,
};

export function LeistungsArtenTab() {
  const { role } = useAuth();
  const canWrite = role === "admin" || role === "manager";
  const { actor, isFetching } = useActor(createActor);
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<ServiceType | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ServiceType | null>(null);
  const [form, setForm] = useState<ServiceTypeForm>(defaultForm);
  const [nameError, setNameError] = useState("");

  const { data: serviceTypes = [], isLoading } = useQuery<ServiceType[]>({
    queryKey: ["serviceTypes"],
    queryFn: () => actor?.listServiceTypes() ?? [],
    enabled: !!actor && !isFetching,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Kein Actor");
      if (editItem) {
        const res = await actor.updateServiceType(editItem.id, {
          name: form.name,
          billable: form.billable,
          defaultRate: form.defaultRate,
          aktiv: form.aktiv,
        });
        if (res.__kind__ === "err") throw new Error(res.err);
        return res.ok;
      }
      const res = await actor.createServiceType({
        name: form.name,
        billable: form.billable,
        defaultRate: form.defaultRate,
        aktiv: form.aktiv,
      });
      if (res.__kind__ === "err") throw new Error(res.err);
      return res.ok;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["serviceTypes"] });
      toast.success(
        editItem ? "Leistungsart aktualisiert" : "Leistungsart erstellt",
      );
      setDialogOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Kein Actor");
      const res = await actor.deleteServiceType(id);
      if (res.__kind__ === "err") throw new Error(res.err);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["serviceTypes"] });
      toast.success("Leistungsart gelöscht");
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

  function openEdit(st: ServiceType) {
    setEditItem(st);
    setForm({
      name: st.name,
      billable: st.billable,
      defaultRate: st.defaultRate,
      aktiv: st.aktiv,
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
          {serviceTypes.length} Leistungsarten
        </p>
        {canWrite && (
          <Button
            data-ocid="la-add"
            onClick={openAdd}
            size="sm"
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Leistungsart hinzufügen
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
                <TableHead className="text-right">
                  Standard-Stundensatz CHF
                </TableHead>
                <TableHead>Status</TableHead>
                {canWrite && (
                  <TableHead className="text-right">Aktionen</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {serviceTypes.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={canWrite ? 5 : 4}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Keine Leistungsarten vorhanden
                  </TableCell>
                </TableRow>
              ) : (
                serviceTypes.map((st) => (
                  <TableRow key={String(st.id)} data-ocid="la-row">
                    <TableCell className="font-medium">{st.name}</TableCell>
                    <TableCell>{st.billable ? "Ja" : "Nein"}</TableCell>
                    <TableCell className="text-right font-mono">
                      {st.defaultRate.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {st.aktiv ? (
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
                            onClick={() => openEdit(st)}
                            aria-label="Bearbeiten"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => setDeleteTarget(st)}
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
              {editItem ? "Leistungsart bearbeiten" : "Leistungsart hinzufügen"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-1">
              <Label htmlFor="laname">Name *</Label>
              <Input
                id="laname"
                data-ocid="la-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              {nameError && (
                <p className="text-xs text-destructive">{nameError}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="labile"
                data-ocid="la-billable"
                checked={form.billable}
                onCheckedChange={(v) => setForm({ ...form, billable: !!v })}
              />
              <Label htmlFor="labile">Verrechenbar</Label>
            </div>
            <div className="space-y-1">
              <Label htmlFor="larate">Standard-Stundensatz (CHF)</Label>
              <Input
                id="larate"
                type="number"
                min={0}
                step={0.01}
                data-ocid="la-rate"
                value={form.defaultRate}
                onChange={(e) =>
                  setForm({ ...form, defaultRate: Number(e.target.value) })
                }
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="laaktiv"
                data-ocid="la-aktiv"
                checked={form.aktiv}
                onCheckedChange={(v) => setForm({ ...form, aktiv: !!v })}
              />
              <Label htmlFor="laaktiv">
                Aktiv
                <span className="block text-xs font-normal text-muted-foreground mt-0.5">
                  Inaktive Leistungsarten werden bei der Zeiterfassung nicht
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
              data-ocid="la-save"
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
            <DialogTitle>Leistungsart löschen</DialogTitle>
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
              data-ocid="la-delete-confirm"
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
