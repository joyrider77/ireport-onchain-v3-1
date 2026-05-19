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
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { createActor } from "../../backend";
import type {
  CreateEmploymentInput,
  EmployeeId,
  Employment,
  FeiertagsberechnungsartType,
  UpdateEmploymentInput,
  backendInterface,
} from "../../backend.d";

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
  feiertagsberechnungsart: string;
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
  feiertagsberechnungsart: "keineGutschrift",
  pensum: "100",
  stundenMo: "08:00",
  stundenDi: "08:00",
  stundenMi: "08:00",
  stundenDo: "08:00",
  stundenFr: "08:00",
  stundenSa: "00:00",
  stundenSo: "00:00",
};

function employmentToForm(e: Employment): EmploymentFormState {
  return {
    funktion: e.funktion,
    von: timestampToDate(e.von),
    bis: e.bis ? timestampToDate(e.bis) : "",
    feiertagsberechnungsart: normalizeFeiertag(
      String(e.feiertagsberechnungsart),
    ),
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
    feiertagsberechnungsart:
      f.feiertagsberechnungsart as FeiertagsberechnungsartType,
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

// New canonical values — the backend enum will be updated by bindgen.
// For now we use string literals and cast where needed.
type FeiertagsartValue =
  | "keineGutschrift"
  | "wochentag_sollzeit"
  | "durchschnittssoll"
  // legacy fallback values (still stored in older records)
  | FeiertagsberechnungsartType;

/** Map legacy enum values to new canonical string values */
function normalizeFeiertag(v: string): FeiertagsartValue {
  if (
    v === "keineGutschrift" ||
    v === "wochentag_sollzeit" ||
    v === "durchschnittssoll"
  )
    return v as FeiertagsartValue;
  if (v === "exakt" || v === "entschaedigt") return "keineGutschrift";
  if (v === "exaktWochentag") return "wochentag_sollzeit";
  if (v === "prozentual") return "durchschnittssoll";
  return "keineGutschrift";
}

interface FeiertagsOption {
  value: FeiertagsartValue;
  label: string;
  hilfetext: string;
}

const FEIERTAGS_OPTIONS: FeiertagsOption[] = [
  {
    value: "keineGutschrift",
    label: "Keine Gutschrift",
    hilfetext:
      "An Feiertagen wird keine Zeit gutgeschrieben. Gutschrift = 0:00.",
  },
  {
    value: "wochentag_sollzeit",
    label: "Gutschrift gemäss Wochentags-Sollzeit",
    hilfetext:
      "Die Gutschrift entspricht der hinterlegten Sollzeit des betroffenen Wochentags. Beispiel: Freitag-Sollzeit 6:00, Feiertag auf Freitag = Gutschrift 6:00.",
  },
  {
    value: "durchschnittssoll",
    label: "Gutschrift gemäss Durchschnittssoll",
    hilfetext:
      "Die Gutschrift entspricht dem Durchschnitt der wöchentlichen Sollzeit (Wochen-Soll ÷ Anzahl Arbeitstage). Beispiel: 40:00 / 5 Tage = Gutschrift 8:00.",
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
  // Inline error message shown inside the dialog (e.g. overlap validation)
  const [dialogError, setDialogError] = useState<string | null>(null);
  // Snapshot of form values taken at handleSaveClick time — passed to mutation on confirm
  const [formSnapshot, setFormSnapshot] = useState<EmploymentFormState | null>(
    null,
  );
  // Track whether dialog was opened for add vs edit, to know when to apply defaults
  const isAddModeRef = useRef(false);

  const queryKey = ["employments", String(employeeId)];

  // Load company default work hours for pre-filling new employment forms
  const { data: defaultWorkHours } = useQuery({
    queryKey: ["defaultWorkHours"],
    queryFn: async () => {
      if (!actor) return null;
      try {
        const result = await (
          actor as unknown as Record<
            string,
            (...args: unknown[]) => Promise<unknown>
          >
        ).getDefaultWorkHours();
        const r = result as {
          __kind__: string;
          ok?: {
            stundenMo: bigint;
            stundenDi: bigint;
            stundenMi: bigint;
            stundenDo: bigint;
            stundenFr: bigint;
            stundenSa: bigint;
            stundenSo: bigint;
          };
        };
        return r.__kind__ === "ok" && r.ok ? r.ok : null;
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
  });

  // Auto-fill weekday hours from company defaults when they load
  // and the dialog was opened in add mode (not edit mode)
  useEffect(() => {
    if (!defaultWorkHours || !dialogOpen || !isAddModeRef.current) return;
    const toHhMm = (mins: bigint) => {
      const m = Number(mins);
      const h = Math.floor(m / 60);
      const min = m % 60;
      return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
    };
    setForm((prev) => ({
      ...prev,
      stundenMo: toHhMm(defaultWorkHours.stundenMo),
      stundenDi: toHhMm(defaultWorkHours.stundenDi),
      stundenMi: toHhMm(defaultWorkHours.stundenMi),
      stundenDo: toHhMm(defaultWorkHours.stundenDo),
      stundenFr: toHhMm(defaultWorkHours.stundenFr),
      stundenSa: toHhMm(defaultWorkHours.stundenSa),
      stundenSo: toHhMm(defaultWorkHours.stundenSo),
    }));
  }, [defaultWorkHours, dialogOpen]);

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

  // Snapshot of editItem taken at handleSaveClick time — used together with formSnapshot
  const [editItemSnapshot, setEditItemSnapshot] = useState<Employment | null>(
    null,
  );

  const saveMutation = useMutation({
    mutationFn: async ({
      editTarget,
      formSnapshotData,
    }: {
      editTarget: Employment | null;
      formSnapshotData: EmploymentFormState;
    }) => {
      if (!actor) throw new Error("Kein Actor");
      const input = formToInput(formSnapshotData);
      if (editTarget) {
        const upd: UpdateEmploymentInput = input;
        const res = await actor.updateEmployment(
          employeeId,
          editTarget.id,
          upd,
        );
        if (res.__kind__ === "err") throw new Error(res.err);
        return res.ok;
      }
      const res = await actor.createEmployment(employeeId, input);
      if (res.__kind__ === "err") throw new Error(res.err);
      return res.ok;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey });
      toast.success(
        variables.editTarget
          ? "Beschäftigung aktualisiert"
          : "Beschäftigung hinzugefügt",
      );
      setDialogOpen(false);
      setShowWarning(false);
      setEditItemSnapshot(null);
      setFormSnapshot(null);
    },
    onError: (e: Error) => {
      toast.error(`Fehler beim Speichern: ${e.message}`);
      setShowWarning(false);
      setEditItemSnapshot(null);
      setFormSnapshot(null);
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
    // Check for date range overlaps with existing employments
    const FAR_FUTURE = "2999-12-31";
    const newVon = form.von;
    const newBis = form.bis || FAR_FUTURE;
    for (const emp of employments) {
      if (editItem && emp.id === editItem.id) continue; // skip self when editing
      const empVon = timestampToDate(emp.von);
      const empBis = emp.bis ? timestampToDate(emp.bis) : FAR_FUTURE;
      // Overlap: newVon <= empBis && newBis >= empVon
      if (newVon <= empBis && newBis >= empVon) {
        const displayVon = formatDateDE(empVon);
        const displayBis = emp.bis
          ? formatDateDE(timestampToDate(emp.bis))
          : "offen";
        return `Der Zeitraum überschneidet sich mit einer bestehenden Beschäftigung vom ${displayVon} bis ${displayBis}.`;
      }
    }
    return null;
  }

  function handleSaveClick() {
    const err = validate();
    if (err) {
      setDialogError(err);
      // Also show as toast so the message is always visible regardless of scroll position
      toast.error("Beschäftigung konnte nicht gespeichert werden", {
        description: err,
        duration: 6000,
      });
      return;
    }
    setDialogError(null);
    // Snapshot BOTH editItem AND form at the moment of the click — before any async or re-render
    const editSnapshot = editItem;
    const currentFormSnapshot = { ...form };
    if (editSnapshot) {
      // Show warning before saving edits — store snapshots in state for the confirm handler
      setEditItemSnapshot(editSnapshot);
      setFormSnapshot(currentFormSnapshot);
      setShowWarning(true);
    } else {
      // New employment: save directly, no warning dialog needed
      saveMutation.mutate({
        editTarget: null,
        formSnapshotData: currentFormSnapshot,
      });
    }
  }

  function handleWarningConfirm() {
    // Use the snapshots taken at handleSaveClick time — immune to stale closure issues
    const snapshot = {
      editTarget: editItemSnapshot,
      formSnapshotData: formSnapshot ?? form,
    };
    setShowWarning(false);
    saveMutation.mutate(snapshot);
  }

  function openAdd() {
    setEditItem(null);
    isAddModeRef.current = true;
    // Pre-fill weekday hours from company defaults when available
    if (defaultWorkHours) {
      const toHhMm = (mins: bigint) => {
        const m = Number(mins);
        const h = Math.floor(m / 60);
        const min = m % 60;
        return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
      };
      setForm({
        ...defaultEmploymentForm,
        stundenMo: toHhMm(defaultWorkHours.stundenMo),
        stundenDi: toHhMm(defaultWorkHours.stundenDi),
        stundenMi: toHhMm(defaultWorkHours.stundenMi),
        stundenDo: toHhMm(defaultWorkHours.stundenDo),
        stundenFr: toHhMm(defaultWorkHours.stundenFr),
        stundenSa: toHhMm(defaultWorkHours.stundenSa),
        stundenSo: toHhMm(defaultWorkHours.stundenSo),
      });
    } else {
      setForm(defaultEmploymentForm);
    }
    setDialogError(null);
    setDialogOpen(true);
  }

  function openEdit(emp: Employment) {
    setEditItem(emp);
    isAddModeRef.current = false;
    setForm(employmentToForm(emp));
    setDialogError(null);
    setDialogOpen(true);
  }

  function setField(key: keyof EmploymentFormState, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    // Clear dialog error when user edits the form
    if (dialogError) setDialogError(null);
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
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          // Don't allow closing the dialog while the warning confirmation is showing
          // or while a mutation is in progress
          if (!open && (showWarning || saveMutation.isPending)) return;
          if (!open) setDialogError(null);
          setDialogOpen(open);
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editItem
                ? "Beschäftigung bearbeiten"
                : "Beschäftigung hinzufügen"}
            </DialogTitle>
          </DialogHeader>

          {/* Inline error message for validation failures (e.g. date overlap) */}
          {dialogError && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 text-red-700 text-sm flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-500" />
              <span>{dialogError}</span>
            </div>
          )}

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
              <div className="space-y-1 col-span-2">
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
                {(() => {
                  const opt = FEIERTAGS_OPTIONS.find(
                    (o) => o.value === form.feiertagsberechnungsart,
                  );
                  if (!opt) return null;
                  // Compute dynamic example value
                  let example = "";
                  if (opt.value === "keineGutschrift") {
                    example = "Gutschrift: 0:00";
                  } else if (opt.value === "wochentag_sollzeit") {
                    // Find the first weekday (Mo–So) with Soll > 0 to use as example
                    const weekdayEntries: {
                      label: string;
                      key: keyof EmploymentFormState;
                    }[] = [
                      { label: "Montag", key: "stundenMo" },
                      { label: "Dienstag", key: "stundenDi" },
                      { label: "Mittwoch", key: "stundenMi" },
                      { label: "Donnerstag", key: "stundenDo" },
                      { label: "Freitag", key: "stundenFr" },
                      { label: "Samstag", key: "stundenSa" },
                      { label: "Sonntag", key: "stundenSo" },
                    ];
                    const firstWorkday = weekdayEntries.find(
                      (e) => (hhmmToMinutes(form[e.key] as string) ?? 0) > 0,
                    );
                    if (firstWorkday) {
                      example = `Beispiel: ${firstWorkday.label} ${form[firstWorkday.key]}`;
                    } else {
                      example =
                        "Beispiel: Wochentag-Sollzeit (gemäss Beschäftigung)";
                    }
                  } else if (opt.value === "durchschnittssoll") {
                    const vals = [
                      form.stundenMo,
                      form.stundenDi,
                      form.stundenMi,
                      form.stundenDo,
                      form.stundenFr,
                      form.stundenSa,
                      form.stundenSo,
                    ].map((s) => hhmmToMinutes(s) ?? 0);
                    const workDays = vals.filter((v) => v > 0).length;
                    const weekTotal = vals.reduce((a, b) => a + b, 0);
                    if (workDays > 0) {
                      const avgMins = Math.round(weekTotal / workDays);
                      const h = Math.floor(avgMins / 60);
                      const m = String(avgMins % 60).padStart(2, "0");
                      example = `Beispiel: Ø ${h}:${m} pro Tag`;
                    } else {
                      example =
                        "Beispiel: Ø-Sollzeit pro Tag (gemäss Beschäftigung)";
                    }
                  }
                  return (
                    <div className="mt-1.5 rounded-md bg-muted/50 border border-border px-3 py-2 space-y-0.5">
                      <p className="text-xs text-muted-foreground">
                        {opt.hilfetext}
                      </p>
                      {example && (
                        <p className="text-xs text-primary font-medium">
                          {example}
                        </p>
                      )}
                    </div>
                  );
                })()}
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
            {/* Show validation error near the footer so it's always visible when clicking Save */}
            {dialogError && (
              <div className="w-full bg-destructive/10 border border-destructive/30 rounded-md p-2.5 text-destructive text-xs flex items-start gap-1.5 mr-auto">
                <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                <span>{dialogError}</span>
              </div>
            )}
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
      <AlertDialog
        open={showWarning}
        onOpenChange={(open) => {
          // Only allow closing via explicit buttons (Cancel/Confirm), not outside click
          if (!open && saveMutation.isPending) return;
          if (!open) {
            setShowWarning(false);
            setEditItemSnapshot(null);
            setFormSnapshot(null);
          }
        }}
      >
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
                setEditItemSnapshot(null);
                setFormSnapshot(null);
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
