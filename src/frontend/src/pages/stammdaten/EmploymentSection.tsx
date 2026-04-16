import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { useActor as useActorCore } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { createActor } from "../../backend";
import type {
  CreateEmploymentInput,
  EmployeeId,
  Employment,
  UpdateEmploymentInput,
  backendInterface,
} from "../../backend.d";
import { FeiertagsberechnungsartType } from "../../backend.d";

import { formatDateDE } from "@/lib/dateFormat";
import { normalizeTimeInput } from "@/lib/timeFormat";
import {
  bigintToHhMm,
  dateToTimestamp,
  hhmmToMinutes,
  timestampToDate,
} from "./shared";

type AnyActor = backendInterface;
function useTypedActor() {
  const { actor, isFetching } = useActorCore(createActor);
  return { actor: actor ? (actor as unknown as AnyActor) : null, isFetching };
}

interface EmploymentFormState {
  funktion: string;
  von: string;
  bis: string;
  feiertagsberechnungsart: FeiertagsberechnungsartType;
  pensum: string;
  stundenMo: string;
  stundenDi: string;
  stundenMi: string;
  stundenDo: string;
  stundenFr: string;
  stundenSa: string;
  stundenSo: string;
}

const defaultEmploymentForm: EmploymentFormState = {
  funktion: "",
  von: (() => {
    // Use local date (not UTC) to avoid off-by-one on Swiss timezone
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  })(),
  bis: "",
  feiertagsberechnungsart: FeiertagsberechnungsartType.exakt,
  pensum: "100",
  stundenMo: "08:24",
  stundenDi: "08:24",
  stundenMi: "08:24",
  stundenDo: "08:24",
  stundenFr: "08:24",
  stundenSa: "00:00",
  stundenSo: "00:00",
};

function employmentToForm(e: Employment): EmploymentFormState {
  return {
    funktion: e.funktion,
    von: timestampToDate(e.von),
    bis: e.bis ? timestampToDate(e.bis) : "",
    feiertagsberechnungsart: e.feiertagsberechnungsart,
    pensum: String(e.pensum),
    stundenMo: bigintToHhMm(e.stundenMo),
    stundenDi: bigintToHhMm(e.stundenDi),
    stundenMi: bigintToHhMm(e.stundenMi),
    stundenDo: bigintToHhMm(e.stundenDo),
    stundenFr: bigintToHhMm(e.stundenFr),
    stundenSa: bigintToHhMm(e.stundenSa),
    stundenSo: bigintToHhMm(e.stundenSo),
  };
}

function formToInput(f: EmploymentFormState): CreateEmploymentInput {
  const parseMin = (s: string) => BigInt(hhmmToMinutes(s) ?? 0);
  const pensumVal = f.pensum === "" ? 0 : Number.parseFloat(f.pensum);
  return {
    funktion: f.funktion,
    von: dateToTimestamp(f.von),
    bis: f.bis ? dateToTimestamp(f.bis) : undefined,
    feiertagsberechnungsart: f.feiertagsberechnungsart,
    pensum: Number.isFinite(pensumVal) ? pensumVal : 0,
    stundenMo: parseMin(f.stundenMo),
    stundenDi: parseMin(f.stundenDi),
    stundenMi: parseMin(f.stundenMi),
    stundenDo: parseMin(f.stundenDo),
    stundenFr: parseMin(f.stundenFr),
    stundenSa: parseMin(f.stundenSa),
    stundenSo: parseMin(f.stundenSo),
  };
}

const FEIERTAGS_OPTIONS: {
  value: FeiertagsberechnungsartType;
  label: string;
}[] = [
  { value: FeiertagsberechnungsartType.exakt, label: "Exakt" },
  { value: FeiertagsberechnungsartType.prozentual, label: "Prozentual" },
  { value: FeiertagsberechnungsartType.entschaedigt, label: "Entschädigt" },
  {
    value: FeiertagsberechnungsartType.exaktWochentag,
    label: "Exakt Wochentag",
  },
];

const WEEKDAY_FIELDS: {
  key: keyof EmploymentFormState;
  label: string;
}[] = [
  { key: "stundenMo", label: "Montag" },
  { key: "stundenDi", label: "Dienstag" },
  { key: "stundenMi", label: "Mittwoch" },
  { key: "stundenDo", label: "Donnerstag" },
  { key: "stundenFr", label: "Freitag" },
  { key: "stundenSa", label: "Samstag" },
  { key: "stundenSo", label: "Sonntag" },
];

interface Props {
  employeeId: EmployeeId;
  canWrite: boolean;
}

export function EmploymentSection({ employeeId, canWrite }: Props) {
  const { actor, isFetching } = useTypedActor();
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<Employment | null>(null);
  const [form, setForm] = useState<EmploymentFormState>(defaultEmploymentForm);
  const [deleteTarget, setDeleteTarget] = useState<Employment | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const [pendingSave, setPendingSave] = useState(false);

  const queryKey = ["employments", String(employeeId)];

  const { data: employments = [], isLoading } = useQuery<Employment[]>({
    queryKey,
    queryFn: async () => {
      if (!actor) return [];
      const res = await actor.listEmployments(employeeId);
      if (res.__kind__ === "err") return [];
      return res.ok;
    },
    enabled: !!actor && !isFetching,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Kein Actor");
      const input = formToInput(form);
      if (editItem) {
        const upd: UpdateEmploymentInput = input;
        const res = await actor.updateEmployment(employeeId, editItem.id, upd);
        if (res.__kind__ === "err") throw new Error(res.err);
        return res.ok;
      }
      const res = await actor.createEmployment(employeeId, input);
      if (res.__kind__ === "err") throw new Error(res.err);
      return res.ok;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey });
      toast.success(
        editItem ? "Beschäftigung aktualisiert" : "Beschäftigung hinzugefügt",
      );
      setDialogOpen(false);
      setPendingSave(false);
    },
    onError: (e: Error) => {
      toast.error(e.message);
      setPendingSave(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Kein Actor");
      const res = await actor.deleteEmployment(employeeId, id);
      if (res.__kind__ === "err") throw new Error(res.err);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey });
      toast.success("Beschäftigung gelöscht");
      setDeleteTarget(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function validate(): string | null {
    if (!form.funktion.trim()) return "Funktion ist ein Pflichtfeld.";
    if (!form.von) return "Von-Datum ist ein Pflichtfeld.";
    // Only one open-ended employment allowed
    if (!form.bis) {
      const openEnded = employments.filter(
        (e) => !e.bis && (!editItem || e.id !== editItem.id),
      );
      if (openEnded.length > 0)
        return "Es darf nur eine Beschäftigung ohne Bis-Datum erfasst sein.";
    }
    return null;
  }

  function handleSaveClick() {
    const err = validate();
    if (err) {
      toast.error(err);
      return;
    }
    if (editItem) {
      // Show warning before saving edits
      setPendingSave(true);
      setShowWarning(true);
    } else {
      saveMutation.mutate();
    }
  }

  function handleWarningConfirm() {
    setShowWarning(false);
    if (pendingSave) saveMutation.mutate();
  }

  function openAdd() {
    setEditItem(null);
    setForm(defaultEmploymentForm);
    setDialogOpen(true);
  }

  function openEdit(emp: Employment) {
    setEditItem(emp);
    setForm(employmentToForm(emp));
    setDialogOpen(true);
  }

  function setField(key: keyof EmploymentFormState, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-sm">Beschäftigungen</h3>
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
                <TableHead>Funktion</TableHead>
                <TableHead>Von</TableHead>
                <TableHead>Bis</TableHead>
                <TableHead className="text-right">Pensum %</TableHead>
                {canWrite && (
                  <TableHead className="text-right">Aktionen</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {employments.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={canWrite ? 5 : 4}
                    className="text-center py-6 text-muted-foreground text-sm"
                  >
                    Keine Beschäftigungen erfasst
                  </TableCell>
                </TableRow>
              ) : (
                employments.map((emp) => (
                  <TableRow key={emp.id}>
                    <TableCell className="font-medium">
                      {emp.funktion}
                    </TableCell>
                    <TableCell>
                      {formatDateDE(timestampToDate(emp.von))}
                    </TableCell>
                    <TableCell>
                      {emp.bis ? (
                        formatDateDE(timestampToDate(emp.bis))
                      ) : (
                        <span className="text-muted-foreground italic">
                          offen
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">{emp.pensum}%</TableCell>
                    {canWrite && (
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openEdit(emp)}
                            aria-label="Bearbeiten"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => setDeleteTarget(emp)}
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
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editItem
                ? "Beschäftigung bearbeiten"
                : "Beschäftigung hinzufügen"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1 col-span-2 sm:col-span-1">
                <Label htmlFor="emp-funktion">Funktion *</Label>
                <Input
                  id="emp-funktion"
                  value={form.funktion}
                  onChange={(e) => setField("funktion", e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label>Feiertagsberechnungsart</Label>
                <Select
                  value={form.feiertagsberechnungsart}
                  onValueChange={(v) => setField("feiertagsberechnungsart", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FEIERTAGS_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label htmlFor="emp-von">Von *</Label>
                <Input
                  id="emp-von"
                  type="date"
                  value={form.von}
                  onChange={(e) => setField("von", e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="emp-bis">Bis</Label>
                <Input
                  id="emp-bis"
                  type="date"
                  value={form.bis}
                  placeholder="tt.mm.jjjj"
                  onChange={(e) => setField("bis", e.target.value)}
                />
                {!form.bis && (
                  <p className="text-xs text-muted-foreground">
                    Leer lassen = offen (kein Enddatum)
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="emp-pensum">Pensum %</Label>
                <Input
                  id="emp-pensum"
                  type="number"
                  min={0}
                  max={100}
                  value={form.pensum}
                  onChange={(e) => setField("pensum", e.target.value)}
                />
                {(form.pensum === "0" || form.pensum === "") && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                    Keine Soll-Zeit vorgegeben – Mitarbeiter arbeitet nach
                    Belieben
                  </p>
                )}
              </div>
            </div>

            <div className="border-t border-border pt-3">
              <p className="text-sm font-medium mb-3">
                Arbeitsstunden pro Wochentag (hh:mm)
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {WEEKDAY_FIELDS.map(({ key, label }) => (
                  <div key={key} className="space-y-1">
                    <Label htmlFor={`emp-${key}`}>{label}</Label>
                    <Input
                      id={`emp-${key}`}
                      placeholder="hh:mm"
                      value={form[key]}
                      onChange={(e) => setField(key, e.target.value)}
                      onBlur={(e) => {
                        const normalized = normalizeTimeInput(e.target.value);
                        if (normalized) setField(key, normalized);
                      }}
                    />
                  </div>
                ))}
              </div>
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
              data-ocid="employment-save"
              onClick={handleSaveClick}
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? "Speichern..." : "Speichern"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Warning Dialog */}
      <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="w-5 h-5" />
              Achtung — Nachträgliche Änderung
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm leading-relaxed">
              Die nachträgliche Änderung einer Beschäftigung kann Auswirkungen
              auf berechnete Zeiten und Ferienguthaben haben. Bitte überprüfen
              Sie Ihre Eingaben sorgfältig, bevor Sie speichern.
              <br />
              <br />
              <strong>Möchten Sie diese Änderung wirklich speichern?</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setShowWarning(false);
                setPendingSave(false);
              }}
            >
              Abbrechen
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleWarningConfirm}
              className="bg-amber-600 hover:bg-amber-700 text-white"
              data-ocid="employment-warning-confirm"
            >
              Ja, Änderungen speichern
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
