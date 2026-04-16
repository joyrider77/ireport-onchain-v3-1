import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { Layout } from "@/components/Layout";
import { TimeEntryDialog } from "@/components/TimeEntryDialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuthStore";
import {
  toDateStringInTz,
  useCompanyTimezone,
} from "@/hooks/useCompanyTimezone";
import {
  getActiveEmploymentForDate,
  getEmploymentMinutesForDate,
  getMostRecentEmploymentBefore,
} from "@/lib/employmentUtils";
import {
  formatHours,
  hhmmToMinutes,
  isValidHHMM,
  minutesToHHMM,
  normalizeTimeInput,
} from "@/lib/timeFormat";
import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Palmtree,
  Pencil,
  Plus,
  Receipt,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { createActor } from "../backend";
import type {
  Absence,
  AbsenceType,
  CalendarData,
  Employment,
  Expense,
  ExpenseType,
  Holiday,
  Project,
  TimeEntry,
  UpdateAbsenceInput,
} from "../backend.d";

// ─── Types ────────────────────────────────────────────────────────────────────

type AnyActor = Record<string, (...args: unknown[]) => Promise<unknown>>;
const toAny = (a: unknown): AnyActor => a as AnyActor;

interface DayData {
  date: Date;
  timeEntries: TimeEntry[];
  expenses: Expense[];
  absences: Absence[];
  holidays: Holiday[];
  isToday: boolean;
  isCurrentMonth: boolean;
  isWeekend: boolean;
}

type ActionMode =
  | { kind: "menu" }
  | { kind: "zeit" }
  | { kind: "ferien" }
  | { kind: "abwesenheit" }
  | { kind: "editZeit"; entry: TimeEntry }
  | { kind: "editAbsence"; absence: Absence }
  | { kind: "deleteZeit"; entry: TimeEntry }
  | { kind: "deleteAbsence"; absence: Absence };

interface FerienFormState {
  dateFrom: string;
  dateTo: string;
  description: string;
  ganztaetig: boolean;
  dauerInput: string; // hh:mm, only when !ganztaetig
}

interface AbwesenheitFormState {
  absenceTypeId: string;
  dateFrom: string;
  dateTo: string;
  description: string;
  dauer: string; // hh:mm — only for single-day
}

// ─── Constants ────────────────────────────────────────────────────────────────

const GERMAN_DAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const GERMAN_MONTHS = [
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember",
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDateDE(dateStr: string): string {
  if (!dateStr) return "–";
  const [y, m, d] = dateStr.split("-");
  return `${d}.${m}.${y}`;
}

function sumHours(entries: TimeEntry[]): number {
  return entries.reduce((s, e) => s + e.hours, 0);
}

function sumExpenses(entries: Expense[]): number {
  return entries.reduce((s, e) => s + e.billableCHF + e.reimbursementCHF, 0);
}

function buildMonthGrid(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1);
  let startOffset = firstDay.getDay() - 1;
  if (startOffset < 0) startOffset = 6;

  const cells: Date[] = [];
  for (let i = startOffset; i > 0; i--) {
    cells.push(new Date(year, month, 1 - i));
  }
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(new Date(year, month, d));
  }
  while (cells.length % 7 !== 0) {
    cells.push(
      new Date(year, month + 1, cells.length - startOffset - daysInMonth + 1),
    );
  }
  return cells;
}

function isVacationType(
  absenceTypeId: import("@/backend.d").AbsenceTypeId,
  types: AbsenceType[],
): boolean {
  const t = types.find((x) => x.id === absenceTypeId);
  return t?.requiresApproval ?? false;
}

function holidaysForDay(holidays: Holiday[], iso: string): Holiday[] {
  return holidays.filter((h) => {
    if (h.date === iso) return true;
    const mmdd = iso.slice(5);
    return h.date === mmdd;
  });
}

function daysBetween(from: string, to: string): number {
  const d1 = new Date(from);
  const d2 = new Date(to);
  return Math.max(Math.ceil((d2.getTime() - d1.getTime()) / 86400000) + 1, 1);
}

// ─── Tooltip ──────────────────────────────────────────────────────────────────

/**
 * Fixed-position tooltip that follows the mouse and never gets clipped by
 * parent overflow:hidden containers. Flip logic ensures it stays in viewport.
 */
function EntryTooltip({
  children,
  content,
}: { children: React.ReactNode; content: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  function handleMouseMove(e: React.MouseEvent) {
    setCoords({ x: e.clientX, y: e.clientY });
  }

  function handleMouseEnter(e: React.MouseEvent) {
    setCoords({ x: e.clientX, y: e.clientY });
    setVisible(true);
  }

  // Tooltip dimensions estimate — use wider, taller estimate to avoid clipping
  const TOOLTIP_W = 280;
  const TOOLTIP_H = 240;
  const OFFSET = 14;

  const vw = typeof window !== "undefined" ? window.innerWidth : 1024;
  const vh = typeof window !== "undefined" ? window.innerHeight : 768;

  // Flip horizontally if tooltip would overflow right edge
  const left =
    coords.x + OFFSET + TOOLTIP_W > vw
      ? Math.max(4, coords.x - TOOLTIP_W - OFFSET)
      : coords.x + OFFSET;

  // Flip vertically: show above cursor if tooltip would overflow bottom
  // Use a generous buffer (TOOLTIP_H + 20) to prevent partial clipping
  const top =
    coords.y + OFFSET + TOOLTIP_H + 20 > vh
      ? Math.max(4, coords.y - TOOLTIP_H - OFFSET)
      : coords.y + OFFSET;

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setVisible(false)}
      onFocus={handleMouseEnter as unknown as React.FocusEventHandler}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          className="fixed z-[9999] w-72 p-3 rounded-lg shadow-elevated bg-card border border-border text-xs pointer-events-none"
          style={{ top, left, maxWidth: "min(280px, calc(100vw - 16px))" }}
        >
          {content}
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function EntryRow({
  variant,
  label,
  tooltip,
}: {
  variant: "time" | "expense" | "vacation" | "absence" | "holiday";
  label: string;
  tooltip?: React.ReactNode;
}) {
  const styles: Record<string, string> = {
    time: "bg-blue-50 text-blue-800 border-l-2 border-blue-400",
    expense: "bg-emerald-50 text-emerald-800 border-l-2 border-emerald-400",
    vacation: "bg-orange-50 text-orange-800 border-l-2 border-orange-400",
    absence: "bg-muted text-muted-foreground border-l-2 border-border",
    holiday: "bg-yellow-50 text-yellow-800 border-l-2 border-yellow-400",
  };

  const row = (
    <div
      className={`w-full px-1.5 py-0.5 text-[0.6rem] font-medium leading-tight truncate rounded-sm ${styles[variant]}`}
    >
      {label}
    </div>
  );

  if (!tooltip) return row;

  return <EntryTooltip content={tooltip}>{row}</EntryTooltip>;
}

function DayCell({
  day,
  absenceTypes,
  projects,
  employments,
  onClick,
  noSollHours,
}: {
  day: DayData;
  absenceTypes: AbsenceType[];
  projects: Project[];
  employments: Employment[];
  onClick: (d: DayData) => void;
  noSollHours?: boolean;
}) {
  const timeEntryHours = sumHours(day.timeEntries);
  const iso = isoDate(day.date);

  // Compute hours from compensated absences and approved vacations
  // Rules: vacations (requiresApproval=true) only count when approved;
  //        compensated non-vacation absences (e.g. Krankheit) count regardless of status.
  // This mirrors ZeitenPage.tsx totalHoursForDay() logic exactly — DO NOT change ZeitenPage
  const absenceHours = (() => {
    const aMap = new Map(absenceTypes.map((t) => [String(t.id), t]));
    let total = 0;
    for (const a of day.absences) {
      const absType = aMap.get(String(a.absenceTypeId));
      const isVacation = absType?.requiresApproval ?? false;
      const isCompensated = absType?.compensated ?? false;
      // Vacations require approval; compensated non-vacation absences always count
      if (isVacation && a.status !== "approved") continue;
      if (!isVacation && !isCompensated) continue;
      if (a.ganztaetig) {
        const activeEmp =
          getActiveEmploymentForDate(employments, iso) ??
          getMostRecentEmploymentBefore(employments, iso);
        const sollMinutes = activeEmp
          ? getEmploymentMinutesForDate(activeEmp, iso)
          : 0;
        total += sollMinutes / 60;
      } else {
        total += Number(a.dauer) / 60;
      }
    }
    return total;
  })();

  const totalHours = timeEntryHours + absenceHours;

  const hasVacation = day.absences.some((a) =>
    isVacationType(a.absenceTypeId, absenceTypes),
  );
  const otherAbsences = day.absences.filter(
    (a) => !isVacationType(a.absenceTypeId, absenceTypes),
  );

  return (
    <button
      type="button"
      data-ocid="calendar-day-cell"
      onClick={() => onClick(day)}
      className={[
        "relative flex flex-col w-full h-full min-h-[90px] text-left border transition-smooth overflow-hidden",
        day.isCurrentMonth ? "bg-card" : "bg-muted/30",
        noSollHours && day.isCurrentMonth && !day.isToday
          ? "opacity-40"
          : day.isWeekend && day.isCurrentMonth
            ? "opacity-60"
            : "",
        day.isToday
          ? "border-primary ring-1 ring-inset ring-primary/30"
          : "border-border hover:border-primary/40",
        "cursor-pointer hover:shadow-sm",
      ].join(" ")}
    >
      {/* Date number row */}
      <div className="flex items-center justify-between px-1.5 pt-1 pb-0.5 shrink-0">
        <span
          className={[
            "text-[0.72rem] font-semibold leading-none",
            day.isToday
              ? "text-primary-foreground bg-primary rounded-full w-5 h-5 flex items-center justify-center"
              : day.isCurrentMonth
                ? "text-foreground"
                : "text-muted-foreground",
          ].join(" ")}
        >
          {day.date.getDate()}
        </span>
        {totalHours > 0 && (
          <span className="text-[0.6rem] font-semibold text-blue-600 tabular-nums">
            {formatHours(totalHours)}
          </span>
        )}
      </div>

      {/* Entries — full width */}
      <div className="flex flex-col gap-px px-0.5 pb-1 overflow-hidden flex-1">
        {day.holidays.map((h) => (
          <EntryRow
            key={String(h.id)}
            variant="holiday"
            label={h.name}
            tooltip={
              <div className="space-y-1">
                <p className="font-semibold text-foreground">{h.name}</p>
                <p className="text-muted-foreground">
                  Datum: {formatDateDE(h.date)}
                </p>
                <p className="text-muted-foreground">
                  Art: {h.ganztaegig ? "Ganztägig" : "Halbtägig"}
                </p>
              </div>
            }
          />
        ))}
        {day.timeEntries.map((te) => {
          const proj = projects.find(
            (p) => String(p.id) === String(te.projectId),
          );
          const timeLabel =
            te.von && te.bis ? `${te.von}–${te.bis}` : formatHours(te.hours);
          return (
            <EntryRow
              key={String(te.id)}
              variant="time"
              label={proj ? `${proj.code} ${timeLabel}` : timeLabel}
              tooltip={
                <div className="space-y-1">
                  <p className="font-semibold text-foreground">
                    {proj?.name ?? "–"}
                  </p>
                  {te.von && te.bis ? (
                    <p className="text-muted-foreground">
                      Zeit: {te.von} – {te.bis}
                    </p>
                  ) : (
                    <p className="text-muted-foreground">
                      Dauer: {formatHours(te.hours)} h
                    </p>
                  )}
                  {te.description && (
                    <p className="text-muted-foreground break-words line-clamp-3">
                      Beschreibung: {te.description}
                    </p>
                  )}
                  <p className="text-muted-foreground">
                    Verrechenbar: {te.billable ? "Ja" : "Nein"}
                  </p>
                </div>
              }
            />
          );
        })}
        {day.expenses.map((ex) => (
          <EntryRow
            key={String(ex.id)}
            variant="expense"
            label={`${(ex.billableCHF + ex.reimbursementCHF).toFixed(0)} CHF`}
            tooltip={
              <div className="space-y-1">
                <p className="font-semibold text-foreground">Spesen</p>
                <p className="text-muted-foreground">
                  Betrag: {(ex.billableCHF + ex.reimbursementCHF).toFixed(2)}{" "}
                  CHF
                </p>
                {ex.description && (
                  <p className="text-muted-foreground break-words line-clamp-3">
                    {ex.description}
                  </p>
                )}
                <p className="text-muted-foreground">
                  Status:{" "}
                  {ex.status === "approved"
                    ? "Genehmigt"
                    : ex.status === "rejected"
                      ? "Abgelehnt"
                      : "Ausstehend"}
                </p>
              </div>
            }
          />
        ))}
        {hasVacation &&
          day.absences
            .filter((a) => isVacationType(a.absenceTypeId, absenceTypes))
            .map((a) => (
              <EntryRow
                key={String(a.id)}
                variant="vacation"
                label="Ferien"
                tooltip={
                  <div className="space-y-1">
                    <p className="font-semibold text-foreground">Ferien</p>
                    <p className="text-muted-foreground">
                      Von: {formatDateDE(a.dateFrom)}
                    </p>
                    <p className="text-muted-foreground">
                      Bis: {formatDateDE(a.dateTo)}
                    </p>
                    {Number(a.dauer) > 0 && (
                      <p className="text-muted-foreground">
                        Dauer: {minutesToHHMM(Number(a.dauer))}
                      </p>
                    )}
                    <p className="text-muted-foreground">
                      Status:{" "}
                      {a.status === "approved"
                        ? "Genehmigt"
                        : a.status === "rejected"
                          ? "Abgelehnt"
                          : "Ausstehend"}
                    </p>
                    {a.description && (
                      <p className="text-muted-foreground break-words line-clamp-3">
                        {a.description}
                      </p>
                    )}
                  </div>
                }
              />
            ))}
        {otherAbsences.map((a) => {
          const t = absenceTypes.find((x) => x.id === a.absenceTypeId);
          return (
            <EntryRow
              key={String(a.id)}
              variant="absence"
              label={t?.name ?? "Abwesenheit"}
              tooltip={
                <div className="space-y-1">
                  <p className="font-semibold text-foreground">
                    {t?.name ?? "Abwesenheit"}
                  </p>
                  <p className="text-muted-foreground">
                    Von: {formatDateDE(a.dateFrom)}
                  </p>
                  <p className="text-muted-foreground">
                    Bis: {formatDateDE(a.dateTo)}
                  </p>
                  {Number(a.dauer) > 0 && (
                    <p className="text-muted-foreground">
                      Dauer: {minutesToHHMM(Number(a.dauer))}
                    </p>
                  )}
                  <p className="text-muted-foreground">
                    Status:{" "}
                    {a.status === "approved"
                      ? "Genehmigt"
                      : a.status === "rejected"
                        ? "Abgelehnt"
                        : "Ausstehend"}
                  </p>
                  {a.description && (
                    <p className="text-muted-foreground break-words line-clamp-3">
                      {a.description}
                    </p>
                  )}
                </div>
              }
            />
          );
        })}
      </div>

      {/* Plus icon on hover */}
      <Plus className="absolute bottom-0.5 right-0.5 w-3 h-3 text-primary opacity-0 hover:opacity-60 transition-opacity" />
    </button>
  );
}

// ─── FerienFormDialog ─────────────────────────────────────────────────────────

function FerienFormDialog({
  open,
  onOpenChange,
  absenceTypes,
  initialDate,
  editAbsence,
  onSaved,
  actor,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  absenceTypes: AbsenceType[];
  initialDate: string;
  editAbsence?: Absence | null;
  onSaved: () => void;
  actor: unknown;
}) {
  const vacationType = absenceTypes.find(
    (t) => t.name.toLowerCase().includes("feri") || t.requiresApproval,
  );

  const [form, setForm] = useState<FerienFormState>({
    dateFrom: initialDate,
    dateTo: initialDate,
    description: "",
    ganztaetig: true,
    dauerInput: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (editAbsence) {
      setForm({
        dateFrom: editAbsence.dateFrom,
        dateTo: editAbsence.dateTo,
        description: editAbsence.description ?? "",
        ganztaetig: editAbsence.ganztaetig,
        dauerInput: editAbsence.ganztaetig
          ? ""
          : minutesToHHMM(Number(editAbsence.dauer)),
      });
    } else {
      setForm({
        dateFrom: initialDate,
        dateTo: initialDate,
        description: "",
        ganztaetig: true,
        dauerInput: "",
      });
    }
    setErrors({});
  }, [open, editAbsence, initialDate]);

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.dateFrom) e.dateFrom = "Datum von ist erforderlich";
    if (!form.dateTo) e.dateTo = "Datum bis ist erforderlich";
    if (form.dateFrom && form.dateTo && form.dateTo < form.dateFrom)
      e.dateTo = "Bis muss nach Von liegen";
    if (!form.ganztaetig) {
      const mins = hhmmToMinutes(form.dauerInput);
      if (!isValidHHMM(form.dauerInput) || mins <= 0)
        e.dauerInput = "Bitte gültige Dauer eingeben (z.B. 08:00)";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!validate() || !actor) return;
    setIsSaving(true);
    const a = toAny(actor);
    try {
      const dauerMinutes = form.ganztaetig
        ? 0
        : (hhmmToMinutes(form.dauerInput) ?? 0);

      if (editAbsence) {
        const input: UpdateAbsenceInput = {
          dateFrom: form.dateFrom,
          dateTo: form.dateTo,
          ganztaetig: form.ganztaetig,
          dauer: BigInt(dauerMinutes),
          description: form.description || undefined,
        };
        const res = (await a.updateAbsence(editAbsence.id, input)) as {
          __kind__: string;
          err?: string;
        };
        if (res.__kind__ === "err") throw new Error(res.err);
        toast.success("Ferienantrag aktualisiert");
      } else {
        if (!vacationType) throw new Error("Keine Ferienart gefunden");
        const res = (await a.createAbsence({
          absenceTypeId: vacationType.id,
          dateFrom: form.dateFrom,
          dateTo: form.dateTo,
          ganztaetig: form.ganztaetig,
          dauer: BigInt(dauerMinutes),
          description: form.description || undefined,
        })) as { __kind__: string; err?: string };
        if (res.__kind__ === "err") throw new Error(res.err);
        toast.success("Ferienantrag eingereicht");
      }
      onOpenChange(false);
      onSaved();
    } catch (err) {
      toast.error(
        `Fehler: ${err instanceof Error ? err.message : "Unbekannter Fehler"}`,
      );
    } finally {
      setIsSaving(false);
    }
  }

  const isMultiDay =
    form.dateFrom && form.dateTo && form.dateFrom !== form.dateTo;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md max-h-[90vh] overflow-y-auto"
        data-ocid="ferien-form-dialog"
      >
        <DialogHeader>
          <DialogTitle>
            {editAbsence ? "Ferien bearbeiten" : "Ferien erfassen"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Date range */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="ffd-from">
                Von <span className="text-destructive">*</span>
              </Label>
              <Input
                id="ffd-from"
                type="date"
                value={form.dateFrom}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    dateFrom: e.target.value,
                    dateTo:
                      f.dateTo < e.target.value ? e.target.value : f.dateTo,
                  }))
                }
                className={errors.dateFrom ? "border-destructive" : ""}
                data-ocid="ferien-date-from"
              />
              {errors.dateFrom && (
                <p className="text-xs text-destructive">{errors.dateFrom}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ffd-to">
                Bis <span className="text-destructive">*</span>
              </Label>
              <Input
                id="ffd-to"
                type="date"
                value={form.dateTo}
                onChange={(e) =>
                  setForm((f) => ({ ...f, dateTo: e.target.value }))
                }
                className={errors.dateTo ? "border-destructive" : ""}
                data-ocid="ferien-date-to"
              />
              {errors.dateTo && (
                <p className="text-xs text-destructive">{errors.dateTo}</p>
              )}
            </div>
          </div>

          {/* Multi-day info */}
          {isMultiDay && (
            <p className="text-xs text-muted-foreground px-1 py-1 bg-muted/30 rounded-md">
              <span className="font-medium text-foreground">
                {daysBetween(form.dateFrom, form.dateTo)} Tage
              </span>{" "}
              — Mehrtägige Ferien werden als Einheit gespeichert.
            </p>
          )}

          {/* Ganztägig checkbox */}
          <div className="flex items-center gap-2.5">
            <Checkbox
              id="ffd-ganztaetig"
              checked={form.ganztaetig}
              onCheckedChange={(v) =>
                setForm((f) => ({
                  ...f,
                  ganztaetig: v === true,
                  dauerInput: v === true ? "" : f.dauerInput,
                }))
              }
              data-ocid="ferien-ganztaetig-checkbox"
            />
            <Label
              htmlFor="ffd-ganztaetig"
              className="cursor-pointer font-medium"
            >
              Ganztägig
            </Label>
          </div>
          {form.ganztaetig && (
            <p className="text-xs text-muted-foreground -mt-1 pl-7">
              Stunden werden aus der Beschäftigung je Wochentag berechnet.
            </p>
          )}

          {/* Duration (only if not ganztaetig) */}
          {!form.ganztaetig && (
            <div className="space-y-1.5">
              <Label htmlFor="ffd-dauer">
                Dauer (hh:mm) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="ffd-dauer"
                type="text"
                placeholder="08:00"
                value={form.dauerInput}
                onChange={(e) =>
                  setForm((f) => ({ ...f, dauerInput: e.target.value }))
                }
                onBlur={(e) => {
                  const normalized = normalizeTimeInput(e.target.value);
                  setForm((f) => ({ ...f, dauerInput: normalized }));
                }}
                className={errors.dauerInput ? "border-destructive" : ""}
                data-ocid="ferien-dauer-input"
              />
              {errors.dauerInput && (
                <p className="text-xs text-destructive">{errors.dauerInput}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Eingabe: 8:00, 08:00 oder 0800 werden erkannt.
              </p>
            </div>
          )}

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="ffd-desc">
              Bemerkung{" "}
              <span className="text-muted-foreground font-normal text-xs">
                (optional)
              </span>
            </Label>
            <Input
              id="ffd-desc"
              placeholder="Bemerkung…"
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              data-ocid="ferien-description-input"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Abbrechen
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            data-ocid="ferien-save-btn"
          >
            {isSaving ? "Speichern…" : "Speichern"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── AbwesenheitFormDialog ────────────────────────────────────────────────────

function AbwesenheitFormDialog({
  open,
  onOpenChange,
  absenceTypes,
  initialDate,
  editAbsence,
  onSaved,
  actor,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  absenceTypes: AbsenceType[];
  initialDate: string;
  editAbsence?: Absence | null;
  onSaved: () => void;
  actor: unknown;
}) {
  // Exclude vacation types (those require workflow)
  const vacationType = absenceTypes.find(
    (t) => t.name.toLowerCase().includes("feri") || t.requiresApproval,
  );
  const nonVacationTypes = absenceTypes.filter(
    (t) => t.id !== vacationType?.id,
  );

  const [form, setForm] = useState<AbwesenheitFormState>({
    absenceTypeId: "",
    dateFrom: initialDate,
    dateTo: initialDate,
    description: "",
    dauer: "",
  });
  const [ganztaetig, setGanztaetig] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const isSingleDay =
    form.dateFrom !== "" && form.dateTo !== "" && form.dateFrom === form.dateTo;

  const isMultiDay =
    form.dateFrom !== "" && form.dateTo !== "" && form.dateTo > form.dateFrom;

  const defaultAbsenceTypeId = nonVacationTypes[0]
    ? String(nonVacationTypes[0].id)
    : "";

  useEffect(() => {
    if (!open) return;
    if (editAbsence) {
      const single = editAbsence.dateFrom === editAbsence.dateTo;
      setForm({
        absenceTypeId: String(editAbsence.absenceTypeId),
        dateFrom: editAbsence.dateFrom,
        dateTo: editAbsence.dateTo,
        description: editAbsence.description ?? "",
        dauer:
          single && !editAbsence.ganztaetig
            ? minutesToHHMM(Number(editAbsence.dauer))
            : "",
      });
      setGanztaetig(editAbsence.ganztaetig);
    } else {
      setForm({
        absenceTypeId: defaultAbsenceTypeId,
        dateFrom: initialDate,
        dateTo: initialDate,
        description: "",
        dauer: "",
      });
      setGanztaetig(false);
    }
    setErrors({});
  }, [open, editAbsence, initialDate, defaultAbsenceTypeId]);

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.absenceTypeId) e.absenceTypeId = "Bitte Abwesenheitsart wählen";
    if (!form.dateFrom) e.dateFrom = "Datum von ist erforderlich";
    if (!form.dateTo) e.dateTo = "Datum bis ist erforderlich";
    if (form.dateFrom && form.dateTo && form.dateTo < form.dateFrom)
      e.dateTo = "Bis muss nach Von liegen";
    // Single-day: require manual dauer (unless ganztaetig)
    if (isSingleDay && !ganztaetig && !isValidHHMM(form.dauer))
      e.dauer = "Bitte gültige Dauer eingeben (hh:mm)";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!validate() || !actor) return;
    setIsSaving(true);
    const a = toAny(actor);
    try {
      const typeId = absenceTypes.find(
        (t) => String(t.id) === form.absenceTypeId,
      )?.id;
      if (!typeId) throw new Error("Abwesenheitsart nicht gefunden");

      const useGanztaetig = isMultiDay ? true : ganztaetig;
      const dauerMinutes = useGanztaetig ? 0 : (hhmmToMinutes(form.dauer) ?? 0);

      if (editAbsence) {
        const input: UpdateAbsenceInput = {
          dateFrom: form.dateFrom,
          dateTo: form.dateTo,
          ganztaetig: useGanztaetig,
          dauer: BigInt(dauerMinutes),
          description: form.description || undefined,
        };
        const res = (await a.updateAbsence(editAbsence.id, input)) as {
          __kind__: string;
          err?: string;
        };
        if (res.__kind__ === "err") throw new Error(res.err);
        toast.success("Abwesenheit aktualisiert");
      } else {
        const res = (await a.createAbsence({
          absenceTypeId: typeId,
          dateFrom: form.dateFrom,
          dateTo: form.dateTo,
          ganztaetig: useGanztaetig,
          dauer: BigInt(dauerMinutes),
          description: form.description || undefined,
        })) as { __kind__: string; err?: string };
        if (res.__kind__ === "err") throw new Error(res.err);
        toast.success("Abwesenheit erfasst");
      }
      onOpenChange(false);
      onSaved();
    } catch (err) {
      toast.error(
        `Fehler: ${err instanceof Error ? err.message : "Unbekannter Fehler"}`,
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md max-h-[90vh] overflow-y-auto"
        data-ocid="abwesenheit-form-dialog"
      >
        <DialogHeader>
          <DialogTitle>
            {editAbsence ? "Abwesenheit bearbeiten" : "Abwesenheit erfassen"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Absence type */}
          {!editAbsence && (
            <div className="space-y-1.5">
              <Label htmlFor="awd-type">
                Abwesenheitsart <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.absenceTypeId}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, absenceTypeId: v }))
                }
              >
                <SelectTrigger
                  id="awd-type"
                  className={errors.absenceTypeId ? "border-destructive" : ""}
                  data-ocid="abwesenheit-type-select"
                >
                  <SelectValue placeholder="Abwesenheitsart wählen…" />
                </SelectTrigger>
                <SelectContent>
                  {nonVacationTypes.map((t) => (
                    <SelectItem key={String(t.id)} value={String(t.id)}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.absenceTypeId && (
                <p className="text-xs text-destructive">
                  {errors.absenceTypeId}
                </p>
              )}
            </div>
          )}

          {/* Date range */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="awd-from">
                Von <span className="text-destructive">*</span>
              </Label>
              <Input
                id="awd-from"
                type="date"
                value={form.dateFrom}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    dateFrom: e.target.value,
                    dateTo:
                      f.dateTo < e.target.value ? e.target.value : f.dateTo,
                  }))
                }
                className={errors.dateFrom ? "border-destructive" : ""}
                data-ocid="abwesenheit-date-from"
              />
              {errors.dateFrom && (
                <p className="text-xs text-destructive">{errors.dateFrom}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="awd-to">
                Bis <span className="text-destructive">*</span>
              </Label>
              <Input
                id="awd-to"
                type="date"
                value={form.dateTo}
                onChange={(e) =>
                  setForm((f) => ({ ...f, dateTo: e.target.value }))
                }
                className={errors.dateTo ? "border-destructive" : ""}
                data-ocid="abwesenheit-date-to"
              />
              {errors.dateTo && (
                <p className="text-xs text-destructive">{errors.dateTo}</p>
              )}
            </div>
          </div>

          {/* Single-day: manual duration or ganztaetig */}
          {isSingleDay && (
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <Checkbox
                  id="awd-ganztaetig"
                  checked={ganztaetig}
                  onCheckedChange={(v) => {
                    setGanztaetig(v === true);
                    if (v === true) setForm((f) => ({ ...f, dauer: "" }));
                  }}
                  data-ocid="abwesenheit-ganztaetig-checkbox"
                />
                <Label
                  htmlFor="awd-ganztaetig"
                  className="cursor-pointer font-medium"
                >
                  Ganztägig
                </Label>
              </div>
              {ganztaetig && (
                <p className="text-xs text-muted-foreground pl-7">
                  Stunden werden aus der Beschäftigung für diesen Wochentag
                  übernommen.
                </p>
              )}
              {!ganztaetig && (
                <div className="space-y-1.5">
                  <Label htmlFor="awd-dauer">
                    Dauer (hh:mm) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="awd-dauer"
                    type="text"
                    placeholder="08:00"
                    value={form.dauer}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, dauer: e.target.value }))
                    }
                    onBlur={(e) => {
                      const normalized = normalizeTimeInput(e.target.value);
                      setForm((f) => ({ ...f, dauer: normalized }));
                    }}
                    className={errors.dauer ? "border-destructive" : ""}
                    data-ocid="abwesenheit-dauer-input"
                  />
                  {errors.dauer && (
                    <p className="text-xs text-destructive">{errors.dauer}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Eingabe: 8:00, 08:00 oder 0800 werden erkannt.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Multi-day info */}
          {isMultiDay && (
            <p className="text-xs text-muted-foreground px-1 py-1.5 bg-muted/30 rounded-md">
              <span className="font-medium text-foreground">
                {daysBetween(form.dateFrom, form.dateTo)} Tage
              </span>{" "}
              — Dauer wird aus der Beschäftigung je Wochentag berechnet und als
              Einheit gespeichert.
            </p>
          )}

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="awd-desc">
              Bemerkung{" "}
              <span className="text-muted-foreground font-normal text-xs">
                (optional)
              </span>
            </Label>
            <Input
              id="awd-desc"
              placeholder="Bemerkung…"
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              data-ocid="abwesenheit-description-input"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Abbrechen
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            data-ocid="abwesenheit-save-btn"
          >
            {isSaving ? "Speichern…" : "Speichern"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── DayDetailSheet ───────────────────────────────────────────────────────────

function DayDetailSheet({
  day,
  absenceTypes,
  expenseTypes,
  projects,
  onClose,
  onAction,
}: {
  day: DayData | null;
  absenceTypes: AbsenceType[];
  expenseTypes: ExpenseType[];
  projects: Project[];
  onClose: () => void;
  onAction: (mode: ActionMode) => void;
}) {
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sheetRef.current && !sheetRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  if (!day) return null;

  const totalHours = sumHours(day.timeEntries);
  const totalExpenses = sumExpenses(day.expenses);

  const dateLabel = day.date.toLocaleDateString("de-CH", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
      <motion.div
        ref={sheetRef}
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.97 }}
        transition={{ duration: 0.2 }}
        className="bg-card border border-border rounded-xl shadow-elevated w-full max-w-md max-h-[85vh] overflow-y-auto"
        data-ocid="day-detail-sheet"
      >
        {/* Header */}
        <div className="flex items-start justify-between p-4 border-b border-border sticky top-0 bg-card z-10">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
              Tagesübersicht
            </p>
            <h3 className="font-display font-semibold text-foreground mt-0.5">
              {dateLabel}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Schliessen"
            className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-5">
          {/* Holidays */}
          {day.holidays.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-semibold text-foreground">
                  Feiertage
                </span>
              </div>
              <div className="space-y-2">
                {day.holidays.map((h) => (
                  <div
                    key={String(h.id)}
                    className="flex items-center gap-3 p-2.5 rounded-lg bg-yellow-50/60 border border-yellow-200"
                  >
                    <Star className="w-4 h-4 text-yellow-600 shrink-0" />
                    <p className="text-sm font-medium text-foreground">
                      {h.name}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Time entries */}
          {day.timeEntries.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold text-foreground">
                  Zeiteinträge
                </span>
                <Badge variant="secondary" className="ml-auto text-xs">
                  {formatHours(totalHours)} Std. total
                </Badge>
              </div>
              <div className="space-y-2">
                {day.timeEntries.map((te) => {
                  const proj = projects.find((p) => p.id === te.projectId);
                  return (
                    <div
                      key={String(te.id)}
                      className="group flex items-start gap-3 p-2.5 rounded-lg bg-blue-50/60 border border-blue-100 hover:border-blue-300 transition-colors"
                      data-ocid="day-time-entry-row"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {proj?.name ?? "Projekt"}
                        </p>
                        {te.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {te.description}
                          </p>
                        )}
                      </div>
                      <span className="text-sm font-semibold text-blue-700 whitespace-nowrap tabular-nums">
                        {formatHours(te.hours)} Std.
                      </span>
                      {/* Edit / Delete icons */}
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAction({ kind: "editZeit", entry: te });
                          }}
                          aria-label="Zeiteintrag bearbeiten"
                          className="p-1 rounded hover:bg-blue-200 text-blue-600 transition-colors"
                          data-ocid="day-entry-edit-btn"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAction({ kind: "deleteZeit", entry: te });
                          }}
                          aria-label="Zeiteintrag löschen"
                          className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                          data-ocid="day-entry-delete-btn"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Expenses */}
          {day.expenses.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-2">
                <Receipt className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-semibold text-foreground">
                  Spesen
                </span>
                <Badge variant="secondary" className="ml-auto text-xs">
                  {totalExpenses.toFixed(2)} CHF total
                </Badge>
              </div>
              <div className="space-y-2">
                {day.expenses.map((ex) => {
                  const et = expenseTypes.find(
                    (t) => t.id === ex.expenseTypeId,
                  );
                  const total = ex.billableCHF + ex.reimbursementCHF;
                  return (
                    <div
                      key={String(ex.id)}
                      className="flex items-start gap-3 p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-100"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {et?.name ?? "Spesenart"}
                        </p>
                        {ex.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {ex.description}
                          </p>
                        )}
                      </div>
                      <span className="text-sm font-semibold text-emerald-700 whitespace-nowrap">
                        {total.toFixed(2)} CHF
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Absences */}
          {day.absences.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-semibold text-foreground">
                  Abwesenheiten & Ferien
                </span>
              </div>
              <div className="space-y-2">
                {day.absences.map((ab) => {
                  const t = absenceTypes.find((x) => x.id === ab.absenceTypeId);
                  const isVacation = isVacationType(
                    ab.absenceTypeId,
                    absenceTypes,
                  );
                  const isMultiDayEntry = ab.dateFrom !== ab.dateTo;
                  return (
                    <div
                      key={String(ab.id)}
                      className={`group flex items-start gap-3 p-2.5 rounded-lg border hover:border-opacity-60 transition-colors ${
                        isVacation
                          ? "bg-orange-50/60 border-orange-100 hover:border-orange-300"
                          : "bg-muted/40 border-border hover:border-primary/30"
                      }`}
                      data-ocid="day-absence-row"
                    >
                      {isVacation ? (
                        <Palmtree className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {t?.name ?? "Abwesenheit"}
                        </p>
                        {isMultiDayEntry && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {formatDateDE(ab.dateFrom)} –{" "}
                            {formatDateDE(ab.dateTo)} (
                            {daysBetween(ab.dateFrom, ab.dateTo)} Tage)
                          </p>
                        )}
                        {ab.description && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {ab.description}
                          </p>
                        )}
                      </div>
                      {/* Edit / Delete icons */}
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-1 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAction({ kind: "editAbsence", absence: ab });
                          }}
                          aria-label="Abwesenheit bearbeiten"
                          className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          data-ocid="day-absence-edit-btn"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAction({ kind: "deleteAbsence", absence: ab });
                          }}
                          aria-label="Abwesenheit löschen"
                          className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                          data-ocid="day-absence-delete-btn"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Empty state */}
          {day.timeEntries.length === 0 &&
            day.expenses.length === 0 &&
            day.absences.length === 0 &&
            day.holidays.length === 0 && (
              <div className="flex flex-col items-center py-6 text-center">
                <CalendarDays className="w-10 h-10 text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">
                  Keine Einträge für diesen Tag
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Wähle unten eine Erfassungsoption
                </p>
              </div>
            )}

          {/* Action buttons — always visible */}
          <div className="border-t border-border pt-3">
            <p className="text-xs text-muted-foreground font-medium mb-2 uppercase tracking-wide">
              Erfassen
            </p>
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-col h-auto gap-1 py-2.5 text-xs"
                data-ocid="day-detail-add-time"
                onClick={() => onAction({ kind: "zeit" })}
              >
                <Clock className="w-4 h-4 text-blue-600" />
                Zeit
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-col h-auto gap-1 py-2.5 text-xs"
                data-ocid="day-detail-add-vacation"
                onClick={() => onAction({ kind: "ferien" })}
              >
                <Palmtree className="w-4 h-4 text-orange-500" />
                Ferien
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-col h-auto gap-1 py-2.5 text-xs"
                data-ocid="day-detail-add-absence"
                onClick={() => onAction({ kind: "abwesenheit" })}
              >
                <AlertCircle className="w-4 h-4 text-amber-500" />
                Abwesenheit
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function KalenderPage() {
  const navigate = useNavigate();
  const { isAuthenticated, companyId, employeeId } = useAuth();
  const { actor, isFetching: actorFetching } = useActor(createActor);
  const timezone = useCompanyTimezone();
  const queryClient = useQueryClient();

  const a = actor as unknown as AnyActor | null;

  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);

  // ─── Modal / action state ────────────────────────────────────────────────
  const [isDeleting, setIsDeleting] = useState(false);

  // Time entry dialog
  const [timeDialogOpen, setTimeDialogOpen] = useState(false);
  const [editingTimeEntry, setEditingTimeEntry] = useState<TimeEntry | null>(
    null,
  );
  const [timeDialogInitDate, setTimeDialogInitDate] = useState<string>("");

  // Ferien dialog
  const [ferienDialogOpen, setFerienDialogOpen] = useState(false);
  const [editingFerienAbsence, setEditingFerienAbsence] =
    useState<Absence | null>(null);
  const [ferienDialogDate, setFerienDialogDate] = useState<string>("");

  // Abwesenheit dialog
  const [abwesenheitDialogOpen, setAbwesenheitDialogOpen] = useState(false);
  const [editingAbwesenheit, setEditingAbwesenheit] = useState<Absence | null>(
    null,
  );
  const [abwesenheitDialogDate, setAbwesenheitDialogDate] =
    useState<string>("");

  // Delete confirm
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<
    | { kind: "zeit"; entry: TimeEntry }
    | { kind: "absence"; absence: Absence }
    | null
  >(null);

  useEffect(() => {
    if (!isAuthenticated || !companyId) navigate({ to: "/" });
  }, [isAuthenticated, companyId, navigate]);

  const monthParam = String(currentMonth + 1).padStart(2, "0");

  const calendarQueryKey = ["calendar", currentYear, currentMonth];

  const { data: calendarData, isLoading: calLoading } = useQuery<CalendarData>({
    queryKey: calendarQueryKey,
    queryFn: async () => {
      if (!a) return { timeEntries: [], expenses: [], absences: [] };
      return a.getCalendarEntries(
        monthParam,
        BigInt(currentYear),
      ) as Promise<CalendarData>;
    },
    enabled: !!a && !actorFetching,
  });

  const { data: absenceTypes = [] } = useQuery<AbsenceType[]>({
    queryKey: ["absenceTypes"],
    queryFn: async () =>
      a ? (a.listAbsenceTypes() as Promise<AbsenceType[]>) : [],
    enabled: !!a && !actorFetching,
  });

  const { data: expenseTypes = [] } = useQuery<ExpenseType[]>({
    queryKey: ["expenseTypes"],
    queryFn: async () =>
      a ? (a.listExpenseTypes() as Promise<ExpenseType[]>) : [],
    enabled: !!a && !actorFetching,
  });

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: async () => (a ? (a.listProjects() as Promise<Project[]>) : []),
    enabled: !!a && !actorFetching,
  });

  const { data: holidays = [] } = useQuery<Holiday[]>({
    queryKey: ["holidays"],
    queryFn: async () => (a ? (a.listHolidays() as Promise<Holiday[]>) : []),
    enabled: !!a && !actorFetching,
  });

  const { data: employments = [], isLoading: employmentsLoading } = useQuery<
    Employment[]
  >({
    queryKey: ["employments", employeeId],
    queryFn: async () => {
      if (!a || !employeeId) return [];
      try {
        const res = (await a.listEmployments(BigInt(employeeId))) as {
          __kind__: string;
          ok?: Employment[];
        };
        return res.__kind__ === "ok" ? (res.ok ?? []) : [];
      } catch {
        return [];
      }
    },
    enabled: !!a && !actorFetching && !!employeeId,
    staleTime: 120_000,
  });

  function refreshCalendar() {
    void queryClient.invalidateQueries({ queryKey: calendarQueryKey });
  }

  /**
   * Returns the number of Soll-minutes for a given ISO date based on the
   * temporally valid employment (von <= iso <= bis, open-ended if bis absent).
   * Uses the central getActiveEmploymentForDate helper from employmentUtils.ts
   * which correctly handles bigint nanosecond timestamps without local TZ shifts.
   * Returns 0 if no matching employment or if the weekday has no work hours.
   */
  function getSollMinutesForDate(iso: string): number {
    if (employments.length === 0) return 0;
    const active = getActiveEmploymentForDate(employments, iso);
    if (!active || active.pensum === 0) return 0;
    return getEmploymentMinutesForDate(active, iso);
  }

  // Build grid
  const gridDates = buildMonthGrid(currentYear, currentMonth);
  const todayIso = toDateStringInTz(today, timezone);

  function buildDayData(d: Date): DayData {
    const iso = isoDate(d);
    const entries = calendarData?.timeEntries ?? [];
    const expList = calendarData?.expenses ?? [];
    const absences = calendarData?.absences ?? [];

    const dayEntries = entries.filter((e) => e.date === iso);
    const dayExpenses = expList.filter((e) => e.date === iso);
    const dayAbsences = absences.filter(
      (ab) => ab.dateFrom <= iso && ab.dateTo >= iso,
    );
    const dayHolidays = holidaysForDay(holidays, iso);

    const dow = d.getDay();
    return {
      date: d,
      timeEntries: dayEntries,
      expenses: dayExpenses,
      absences: dayAbsences,
      holidays: dayHolidays,
      isToday: iso === todayIso,
      isCurrentMonth: d.getMonth() === currentMonth,
      isWeekend: dow === 0 || dow === 6,
    };
  }

  function prevMonth() {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  }

  // ─── Action handlers ──────────────────────────────────────────────────────

  function handleDayClick(day: DayData) {
    setSelectedDay(day);
  }

  function handleAction(mode: ActionMode) {
    if (!selectedDay) return;
    const dateStr = isoDate(selectedDay.date);

    if (mode.kind === "zeit") {
      setEditingTimeEntry(null);
      setTimeDialogInitDate(dateStr);
      setTimeDialogOpen(true);
    } else if (mode.kind === "ferien") {
      setEditingFerienAbsence(null);
      setFerienDialogDate(dateStr);
      setFerienDialogOpen(true);
    } else if (mode.kind === "abwesenheit") {
      setEditingAbwesenheit(null);
      setAbwesenheitDialogDate(dateStr);
      setAbwesenheitDialogOpen(true);
    } else if (mode.kind === "editZeit") {
      setEditingTimeEntry(mode.entry);
      setTimeDialogInitDate("");
      setTimeDialogOpen(true);
    } else if (mode.kind === "editAbsence") {
      const isVacation = isVacationType(
        mode.absence.absenceTypeId,
        absenceTypes,
      );
      if (isVacation) {
        setEditingFerienAbsence(mode.absence);
        setFerienDialogDate(mode.absence.dateFrom);
        setFerienDialogOpen(true);
      } else {
        setEditingAbwesenheit(mode.absence);
        setAbwesenheitDialogDate(mode.absence.dateFrom);
        setAbwesenheitDialogOpen(true);
      }
    } else if (mode.kind === "deleteZeit") {
      setDeleteTarget({ kind: "zeit", entry: mode.entry });
      setDeleteDialogOpen(true);
    } else if (mode.kind === "deleteAbsence") {
      setDeleteTarget({ kind: "absence", absence: mode.absence });
      setDeleteDialogOpen(true);
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget || !a) return;
    setIsDeleting(true);
    try {
      if (deleteTarget.kind === "zeit") {
        const res = (await a.deleteTimeEntry(deleteTarget.entry.id)) as {
          __kind__: string;
          err?: string;
        };
        if (res.__kind__ === "err") throw new Error(res.err);
        toast.success("Zeiteintrag gelöscht");
      } else {
        const res = (await a.deleteAbsence(deleteTarget.absence.id)) as {
          __kind__: string;
          err?: string;
        };
        if (res.__kind__ === "err") throw new Error(res.err);
        toast.success("Abwesenheit gelöscht");
      }
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
      setSelectedDay(null);
      refreshCalendar();
    } catch (err) {
      toast.error(
        `Fehler: ${err instanceof Error ? err.message : "Unbekannter Fehler"}`,
      );
    } finally {
      setIsDeleting(false);
    }
  }

  function handleTimeSaved() {
    setSelectedDay(null);
    refreshCalendar();
  }

  function handleAbsenceSaved() {
    setSelectedDay(null);
    refreshCalendar();
  }

  const isLoading = actorFetching || calLoading || employmentsLoading;

  return (
    <Layout>
      <div className="p-4 sm:p-6 space-y-4" data-ocid="kalender-page">
        {/* Page header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              Kalenderübersicht
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Monatsansicht aller Einträge — auf einen Tag tippen zum Erfassen
            </p>
          </div>
        </div>

        {/* Calendar card */}
        <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
          {/* Month navigation */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={prevMonth}
              aria-label="Vorheriger Monat"
              data-ocid="calendar-prev-month"
              className="gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline text-xs">Vorheriger Monat</span>
            </Button>

            <div className="text-center">
              <h2 className="font-display font-semibold text-foreground text-lg">
                {GERMAN_MONTHS[currentMonth]} {currentYear}
              </h2>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={nextMonth}
              aria-label="Nächster Monat"
              data-ocid="calendar-next-month"
              className="gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <span className="hidden sm:inline text-xs">Nächster Monat</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-border bg-muted/30">
            {GERMAN_DAYS.map((d) => (
              <div
                key={d}
                className={`py-2 text-center text-xs font-semibold uppercase tracking-wide ${
                  d === "Sa" || d === "So"
                    ? "text-muted-foreground/60"
                    : "text-muted-foreground"
                }`}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          {isLoading ? (
            <div className="grid grid-cols-7 gap-px bg-border p-0">
              {Array.from({ length: 35 }, (_, i) => `skel-${i}`).map((key) => (
                <Skeleton
                  key={key}
                  className="h-[90px] rounded-none bg-muted/40"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-px bg-border p-0">
              {gridDates.map((d, i) => {
                const dayData = buildDayData(d);
                const cellKey = isoDate(d);
                return (
                  <motion.div
                    key={cellKey}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.005 }}
                    className="min-h-[90px]"
                  >
                    <DayCell
                      day={dayData}
                      absenceTypes={absenceTypes}
                      projects={projects}
                      employments={employments}
                      onClick={handleDayClick}
                      noSollHours={
                        !employmentsLoading &&
                        getSollMinutesForDate(cellKey) === 0
                      }
                    />
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 px-1">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mr-1">
            Legende:
          </span>
          {[
            {
              className: "bg-yellow-100 text-yellow-800 border-yellow-300",
              label: "Feiertag",
              icon: <Star className="w-3 h-3" />,
            },
            {
              className: "bg-blue-100 text-blue-800 border-blue-200",
              label: "Zeiteintrag",
              icon: <Clock className="w-3 h-3" />,
            },
            {
              className: "bg-emerald-100 text-emerald-800 border-emerald-200",
              label: "Spesen",
              icon: <Receipt className="w-3 h-3" />,
            },
            {
              className: "bg-orange-100 text-orange-800 border-orange-200",
              label: "Ferien",
              icon: <Palmtree className="w-3 h-3" />,
            },
            {
              className: "bg-muted text-muted-foreground border-border",
              label: "Abwesenheit",
              icon: <AlertCircle className="w-3 h-3" />,
            },
          ].map(({ className, label, icon }) => (
            <span
              key={label}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border ${className}`}
            >
              {icon}
              {label}
            </span>
          ))}
          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium border border-primary/40 text-primary bg-primary/5">
            <span className="w-3 h-3 rounded-sm border border-primary inline-block" />
            Heute
          </span>
        </div>
      </div>

      {/* ── Day detail sheet ── */}
      <AnimatePresence>
        {selectedDay && (
          <DayDetailSheet
            day={selectedDay}
            absenceTypes={absenceTypes}
            expenseTypes={expenseTypes}
            projects={projects}
            onClose={() => setSelectedDay(null)}
            onAction={handleAction}
          />
        )}
      </AnimatePresence>

      {/* ── Time entry dialog ── */}
      <TimeEntryDialog
        open={timeDialogOpen}
        onOpenChange={(v) => {
          setTimeDialogOpen(v);
          if (!v) setEditingTimeEntry(null);
        }}
        editEntry={editingTimeEntry}
        initialValues={
          timeDialogInitDate ? { date: timeDialogInitDate } : undefined
        }
        onSaved={handleTimeSaved}
      />

      {/* ── Ferien dialog ── */}
      <FerienFormDialog
        open={ferienDialogOpen}
        onOpenChange={(v) => {
          setFerienDialogOpen(v);
          if (!v) setEditingFerienAbsence(null);
        }}
        absenceTypes={absenceTypes}
        initialDate={ferienDialogDate}
        editAbsence={editingFerienAbsence}
        onSaved={handleAbsenceSaved}
        actor={actor}
      />

      {/* ── Abwesenheit dialog ── */}
      <AbwesenheitFormDialog
        open={abwesenheitDialogOpen}
        onOpenChange={(v) => {
          setAbwesenheitDialogOpen(v);
          if (!v) setEditingAbwesenheit(null);
        }}
        absenceTypes={absenceTypes}
        initialDate={abwesenheitDialogDate}
        editAbsence={editingAbwesenheit}
        onSaved={handleAbsenceSaved}
        actor={actor}
      />

      {/* ── Delete confirmation ── */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setDeleteTarget(null);
        }}
        isDeleting={isDeleting}
      />
    </Layout>
  );
}
