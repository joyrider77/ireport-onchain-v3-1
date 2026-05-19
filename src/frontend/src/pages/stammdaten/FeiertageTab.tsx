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
import type { Holiday } from "../../backend.d";
import { useMutation, useQuery, useQueryClient } from "./shared";

interface HolidayForm {
  name: string;
  date: string;
  ganztaegig: boolean;
}

function formatDateDE(dateStr: string): string {
  if (!dateStr) return "–";
  const [y, m, d] = dateStr.split("-");
  return `${d}.${m}.${y}`;
}

const defaultForm: HolidayForm = {
  name: "",
  date: new Date().toISOString().split("T")[0],
  ganztaegig: true,
};

export function FeiertageTab() {
  const { role } = useAuth();
  const canWrite = role === "admin" || role === "manager";
  const { actor, isFetching } = useActor(createActor);
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<Holiday | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Holiday | null>(null);
  const [form, setForm] = useState<HolidayForm>(defaultForm);
  const [errors, setErrors] = useState<
    Partial<Record<keyof HolidayForm, string>>
  >({});

  const { data: holidays = [], isLoading } = useQuery<Holiday[]>({
    queryKey: ["holidays"],
    queryFn: () => actor?.listHolidays() ?? [],
    enabled: !!actor && !isFetching,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Kein Actor");
      // Access the underlying raw ICP actor stored in the Backend wrapper class.
      // We need this because the generated wrapper uses a truthy check for opt bool fields
      // (value.ganztaegig ? candid_some(v) : candid_none()) which incorrectly sends
      // candid_none() when ganztaegig === false. Using the raw actor lets us pass [false].
      type RawActor = {
        createHoliday: (input: {
          ganztaegig: [boolean] | [];
          date: string;
          name: string;
        }) => Promise<
          { __kind__: "ok"; ok: Holiday } | { __kind__: "err"; err: string }
        >;
        updateHoliday: (
          id: bigint,
          input: {
            ganztaegig: [boolean] | [];
            date?: [string] | [];
            name?: [string] | [];
          },
        ) => Promise<
          { __kind__: "ok"; ok: Holiday } | { __kind__: "err"; err: string }
        >;
      };
      const rawActor = Object.assign(
        {},
        actor as unknown as { actor: RawActor },
      ).actor;
      // Candid opt bool: [true] = ganztägig, [false] = halbtägig
      const ganztaegigCandid: [boolean] = [form.ganztaegig];
      if (editItem) {
        const res = await rawActor.updateHoliday(editItem.id, {
          name: [form.name],
          date: [form.date],
          ganztaegig: ganztaegigCandid,
        });
        if (res.__kind__ === "err") throw new Error(res.err);
        return res.ok;
      }
      const res = await rawActor.createHoliday({
        name: form.name,
        date: form.date,
        ganztaegig: ganztaegigCandid,
      });
      if (res.__kind__ === "err") throw new Error(res.err);
      return res.ok;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["holidays"] });
      toast.success(editItem ? "Feiertag aktualisiert" : "Feiertag erstellt");
      setDialogOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Kein Actor");
      const res = await actor.deleteHoliday(id);
      if (res.__kind__ === "err") throw new Error(res.err);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["holidays"] });
      toast.success("Feiertag gelöscht");
      setDeleteTarget(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function validate(): boolean {
    const errs: Partial<Record<keyof HolidayForm, string>> = {};
    if (!form.name.trim()) errs.name = "Pflichtfeld";
    if (!form.date) errs.date = "Pflichtfeld";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function openAdd() {
    setEditItem(null);
    setForm(defaultForm);
    setErrors({});
    setDialogOpen(true);
  }

  function openEdit(h: Holiday) {
    setEditItem(h);
    setForm({ name: h.name, date: h.date, ganztaegig: h.ganztaegig });
    setErrors({});
    setDialogOpen(true);
  }

  const sortedHolidays = [...holidays].sort((a, b) =>
    a.date.localeCompare(b.date),
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {holidays.length} Feiertage
        </p>
        {canWrite && (
          <Button
            data-ocid="feiertage-add"
            onClick={openAdd}
            size="sm"
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Feiertag hinzufügen
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
                <TableHead>Datum</TableHead>
                <TableHead>Art</TableHead>
                {canWrite && (
                  <TableHead className="text-right">Aktionen</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedHolidays.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={canWrite ? 4 : 3}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Keine Feiertage vorhanden
                  </TableCell>
                </TableRow>
              ) : (
                sortedHolidays.map((h) => (
                  <TableRow key={String(h.id)} data-ocid="feiertage-row">
                    <TableCell className="font-medium">{h.name}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {formatDateDE(h.date)}
                    </TableCell>
                    <TableCell>
                      {h.ganztaegig ? (
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100">
                          Ganztägig
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Halbtägig</Badge>
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
                            onClick={() => openEdit(h)}
                            aria-label="Bearbeiten"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => setDeleteTarget(h)}
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
              {editItem ? "Feiertag bearbeiten" : "Feiertag hinzufügen"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-1">
              <Label htmlFor="hname">Name *</Label>
              <Input
                id="hname"
                data-ocid="feiertage-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="hdate">Datum *</Label>
              <Input
                id="hdate"
                type="date"
                data-ocid="feiertage-date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
              {errors.date && (
                <p className="text-xs text-destructive">{errors.date}</p>
              )}
            </div>
            {/* Art des Feiertags: ganztägig / halbtägig */}
            <div className="space-y-2">
              <Label>Art des Feiertags</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="feiertag-art"
                    value="ganztaegig"
                    checked={form.ganztaegig}
                    onChange={() => setForm({ ...form, ganztaegig: true })}
                    className="accent-primary"
                    data-ocid="feiertage-ganztaegig"
                  />
                  <span className="text-sm font-medium">Ganztägig</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="feiertag-art"
                    value="halbtaegig"
                    checked={!form.ganztaegig}
                    onChange={() => setForm({ ...form, ganztaegig: false })}
                    className="accent-primary"
                    data-ocid="feiertage-halbtaegig"
                  />
                  <span className="text-sm font-medium">Halbtägig</span>
                </label>
              </div>
              <p className="text-xs text-muted-foreground">
                Steuert die Anzahl Stunden gemäss Pensum und
                Feiertagsberechnungsart der Beschäftigung.
              </p>
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
              data-ocid="feiertage-save"
              onClick={() => {
                if (validate()) saveMutation.mutate();
              }}
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
            <DialogTitle>Feiertag löschen</DialogTitle>
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
              data-ocid="feiertage-delete-confirm"
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
