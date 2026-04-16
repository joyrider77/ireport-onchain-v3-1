/**
 * Shared time-entry save dialog.
 * Used by ZeitenPage (new/edit entry) and StopwatchWidget (save after stop).
 */
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
import { useAuth } from "@/hooks/useAuthStore";
import { toDateStringInTz } from "@/hooks/useCompanyTimezone";
import {
  hhmmToMinutes,
  isValidHHMM,
  minutesToHHMM,
  normalizeTimeInput,
} from "@/lib/timeFormat";
import { useActor } from "@caffeineai/core-infrastructure";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { createActor } from "../backend";
import {
  Erfassungsart,
  type Project,
  type ProjectMemberAssignment,
  type ServiceType,
  type TimeEntry,
} from "../backend.d";

// ─── Types ────────────────────────────────────────────────────────────────────

type AnyActor = Record<string, (...args: unknown[]) => Promise<unknown>>;
const toAny = (a: unknown): AnyActor => a as AnyActor;

export interface TimeEntryFormState {
  date: string;
  projectId: string;
  serviceTypeId: string;
  /** For dauer mode: hh:mm */
  hours: string;
  /** For zeitBlock mode */
  von: string;
  bis: string;
  description: string;
  billable: boolean;
}

const defaultForm = (date: string): TimeEntryFormState => ({
  date,
  projectId: "",
  serviceTypeId: "",
  hours: "",
  von: "",
  bis: "",
  description: "",
  billable: false, // will be auto-set based on stundensatz when project+serviceType are selected
});

export interface TimeEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** If provided, we are editing an existing entry */
  editEntry?: TimeEntry | null;
  /** Initial form values (e.g. pre-filled from stopwatch) */
  initialValues?: Partial<TimeEntryFormState>;
  /** Called after a successful save */
  onSaved?: () => void;
  title?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getCurrentTimeHHMM(): string {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

function subtractMinutes(timeHHMM: string, minutes: number): string {
  const [hh, mm] = timeHHMM.split(":").map(Number);
  const totalMin = hh * 60 + mm - minutes;
  const clamped = Math.max(0, totalMin);
  return minutesToHHMM(clamped);
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TimeEntryDialog({
  open,
  onOpenChange,
  editEntry,
  initialValues,
  onSaved,
  title,
}: TimeEntryDialogProps) {
  const { employeeId } = useAuth();
  const { actor, isFetching } = useActor(createActor);

  const todayStr = toDateStringInTz(new Date(), "Europe/Zurich");

  const [form, setForm] = useState<TimeEntryFormState>(defaultForm(todayStr));
  const [errors, setErrors] = useState<
    Partial<Record<keyof TimeEntryFormState, string>>
  >({});
  const [isSaving, setIsSaving] = useState(false);

  // Master data
  const [projects, setProjects] = useState<Project[]>([]);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [projectMembers, setProjectMembers] = useState<
    Map<string, ProjectMemberAssignment[]>
  >(new Map());
  const [isLoadingData, setIsLoadingData] = useState(false);

  // ─── Load master data when dialog opens ───────────────────────────────────
  const loadData = useCallback(async () => {
    if (!actor || isFetching) return;
    setIsLoadingData(true);
    try {
      const [projectsRes, serviceTypesRes] = await Promise.all([
        toAny(actor).listProjects() as Promise<Project[]>,
        toAny(actor).listServiceTypes() as Promise<ServiceType[]>,
      ]);
      const active = (projectsRes ?? []).filter((p) => p.active);
      setProjects(active);
      setServiceTypes(serviceTypesRes ?? []);

      const memberMap = new Map<string, ProjectMemberAssignment[]>();
      await Promise.all(
        active.map(async (p) => {
          try {
            const res = (await toAny(actor).getProjectMembers(p.id)) as
              | { __kind__: "ok"; ok: ProjectMemberAssignment[] }
              | { __kind__: "err"; err: string };
            if (res.__kind__ === "ok") memberMap.set(String(p.id), res.ok);
          } catch {
            /* ignore */
          }
        }),
      );
      setProjectMembers(memberMap);
    } finally {
      setIsLoadingData(false);
    }
  }, [actor, isFetching]);

  useEffect(() => {
    if (open && actor && !isFetching) {
      void loadData();
    }
  }, [open, actor, isFetching, loadData]);

  // Keep a ref to initialValues so the effect only triggers on open/editEntry changes
  const initialValuesRef = useRef(initialValues);
  initialValuesRef.current = initialValues;

  // ─── Initialize form when dialog opens ────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    const iv = initialValuesRef.current;

    if (editEntry) {
      // Editing an existing entry — reconstruct from stored data
      setForm({
        date: editEntry.date,
        projectId: String(editEntry.projectId),
        serviceTypeId: String(editEntry.serviceTypeId),
        hours: minutesToHHMM(Math.round(Number(editEntry.hours) * 60)),
        von: editEntry.von ?? "",
        bis: editEntry.bis ?? "",
        description: editEntry.description ?? "",
        billable: editEntry.billable,
      });
    } else {
      const base = defaultForm(iv?.date ?? todayStr);
      const merged = { ...base, ...iv };

      // For zeitBlock pre-fill: if hours given but no von/bis, compute von/bis from current time
      if (iv?.hours && !iv.von) {
        const elapsedMinutes = hhmmToMinutes(iv.hours);
        const nowHHMM = getCurrentTimeHHMM();
        merged.bis = nowHHMM;
        merged.von = subtractMinutes(nowHHMM, elapsedMinutes);
      }
      setForm(merged);
    }
    setErrors({});
  }, [open, editEntry, todayStr]);

  // ─── Derived ──────────────────────────────────────────────────────────────

  const assignedProjects = useMemo(() => {
    if (!employeeId) return [];
    return projects.filter((p) => {
      const members = projectMembers.get(String(p.id)) ?? [];
      return members.some((m) => String(m.employeeId) === String(employeeId));
    });
  }, [projects, projectMembers, employeeId]);

  // Always filter by own employee assignments regardless of role.
  // Admins are also project members and must only see their own assigned projects.
  const visibleProjects = assignedProjects;

  const filteredServiceTypes = useMemo(() => {
    if (!form.projectId || !employeeId) return [];
    const members = projectMembers.get(form.projectId) ?? [];
    // Always filter by the current employee's own project-member assignments,
    // regardless of role. Admin users are also added as project members and must
    // only see service types assigned to them for this project.
    const myAssignments = members.filter(
      (m) => String(m.employeeId) === String(employeeId),
    );
    if (myAssignments.length === 0) return [];
    const myServiceTypeIds = new Set(
      myAssignments.map((m) => String(m.serviceTypeId)),
    );
    return serviceTypes.filter(
      (st) => st.aktiv && myServiceTypeIds.has(String(st.id)),
    );
  }, [form.projectId, projectMembers, serviceTypes, employeeId]);

  const selectedProject = useMemo(
    () => projects.find((p) => String(p.id) === form.projectId),
    [projects, form.projectId],
  );

  const erfassungsart = selectedProject?.erfassungsart ?? Erfassungsart.dauer;
  const isZeitBlock = erfassungsart === Erfassungsart.zeitBlock;

  // Derive stundensatz for the current project+serviceType+employee combo
  // Verrechenbar is only shown when stundensatz > 0
  const currentStundensatz = useMemo(() => {
    if (!form.projectId || !form.serviceTypeId || !employeeId) return 0;
    const members = projectMembers.get(form.projectId) ?? [];
    // Always use the current user's own assignment (works for all roles)
    const myAssignment = members.find(
      (m) =>
        String(m.employeeId) === String(employeeId) &&
        String(m.serviceTypeId) === form.serviceTypeId,
    );
    return myAssignment?.stundensatz ?? 0;
  }, [form.projectId, form.serviceTypeId, projectMembers, employeeId]);

  const showVerrechenbar = currentStundensatz > 0;

  // Auto-set billable default when project+serviceType selection changes.
  // When stundensatz > 0 → default true; when stundensatz = 0 → false.
  // If we are editing an existing entry, the value is already set from the entry.
  const prevServiceTypeIdRef = useRef<string>("");
  const prevProjectIdRef = useRef<string>("");

  useEffect(() => {
    const projectChanged = form.projectId !== prevProjectIdRef.current;
    const serviceChanged = form.serviceTypeId !== prevServiceTypeIdRef.current;

    prevProjectIdRef.current = form.projectId;
    prevServiceTypeIdRef.current = form.serviceTypeId;

    // Only auto-set when creating new entry and selection actually changed
    if (!editEntry && (projectChanged || serviceChanged)) {
      if (form.projectId && form.serviceTypeId) {
        // Set billable based on stundensatz
        setForm((f) => ({ ...f, billable: currentStundensatz > 0 }));
      } else if (!showVerrechenbar) {
        setForm((f) => (f.billable ? { ...f, billable: false } : f));
      }
    } else if (!showVerrechenbar && !editEntry) {
      // Hide + reset if stundensatz becomes 0
      setForm((f) => (f.billable ? { ...f, billable: false } : f));
    }
  }, [
    form.projectId,
    form.serviceTypeId,
    currentStundensatz,
    showVerrechenbar,
    editEntry,
  ]);

  // Auto-select service type when exactly one is available for the chosen project
  useEffect(() => {
    if (filteredServiceTypes.length === 1 && !editEntry) {
      const onlyId = String(filteredServiceTypes[0].id);
      setForm((f) => {
        if (f.serviceTypeId !== onlyId) {
          return { ...f, serviceTypeId: onlyId };
        }
        return f;
      });
    }
  }, [filteredServiceTypes, editEntry]);

  // Auto-calculate duration for zeitBlock display
  const zeitBlockDuration = useMemo(() => {
    if (!isZeitBlock || !form.von || !form.bis) return "";
    const vonMin = hhmmToMinutes(form.von);
    const bisMin = hhmmToMinutes(form.bis);
    const diff = bisMin - vonMin;
    if (diff <= 0) return "";
    return minutesToHHMM(diff);
  }, [isZeitBlock, form.von, form.bis]);

  // ─── Project change handler ────────────────────────────────────────────────
  function handleProjectChange(projectId: string) {
    const proj = projects.find((p) => String(p.id) === projectId);
    const newArt = proj?.erfassungsart ?? Erfassungsart.dauer;
    setForm((f) => ({
      ...f,
      projectId,
      serviceTypeId: "",
      hours: newArt === Erfassungsart.dauer ? f.hours : "",
      von: newArt === Erfassungsart.zeitBlock ? f.von : "",
      bis: newArt === Erfassungsart.zeitBlock ? f.bis : "",
    }));
  }

  // ─── Validation ───────────────────────────────────────────────────────────
  function validate(): boolean {
    const e: Partial<Record<keyof TimeEntryFormState, string>> = {};
    if (!form.date) e.date = "Pflichtfeld";
    if (!form.projectId) e.projectId = "Pflichtfeld";
    if (!form.serviceTypeId) e.serviceTypeId = "Pflichtfeld";
    // description is optional — no required validation
    if (isZeitBlock) {
      if (!form.von || !isValidHHMM(form.von)) e.von = "Gültige Zeit (hh:mm)";
      if (!form.bis || !isValidHHMM(form.bis)) e.bis = "Gültige Zeit (hh:mm)";
      if (
        form.von &&
        form.bis &&
        hhmmToMinutes(form.bis) <= hhmmToMinutes(form.von)
      ) {
        e.bis = "Bis muss nach Von liegen";
      }
    } else {
      if (!form.hours || !isValidHHMM(form.hours))
        e.hours = "Gültige Zeit (hh:mm)";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // ─── Save ─────────────────────────────────────────────────────────────────
  async function handleSave() {
    if (!validate() || !actor) return;
    setIsSaving(true);

    let hoursDecimal: number;
    if (isZeitBlock) {
      const vonMin = hhmmToMinutes(form.von);
      const bisMin = hhmmToMinutes(form.bis);
      hoursDecimal = (bisMin - vonMin) / 60;
    } else {
      hoursDecimal = hhmmToMinutes(form.hours) / 60;
    }

    const payload = {
      date: form.date,
      projectId: BigInt(form.projectId),
      serviceTypeId: BigInt(form.serviceTypeId),
      hours: hoursDecimal,
      description: form.description,
      billable: form.billable,
      ...(isZeitBlock && form.von ? { von: form.von } : {}),
      ...(isZeitBlock && form.bis ? { bis: form.bis } : {}),
    };

    try {
      if (editEntry) {
        const res = (await toAny(actor).updateTimeEntry(
          editEntry.id,
          payload,
        )) as { __kind__: string; err?: string };
        if (res.__kind__ === "err") throw new Error(res.err);
        toast.success("Zeiteintrag aktualisiert");
      } else {
        const res = (await toAny(actor).createTimeEntry(payload)) as {
          __kind__: string;
          err?: string;
        };
        if (res.__kind__ === "err") throw new Error(res.err);
        toast.success("Zeiteintrag gespeichert");
      }
      onOpenChange(false);
      onSaved?.();
    } catch (err) {
      toast.error(
        `Fehler: ${err instanceof Error ? err.message : "Unbekannter Fehler"}`,
      );
    } finally {
      setIsSaving(false);
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  const dialogTitle =
    title ?? (editEntry ? "Zeiteintrag bearbeiten" : "Zeit erfassen");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md max-h-[90vh] overflow-y-auto"
        data-ocid="time-entry-dialog"
      >
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Datum */}
          <div className="space-y-1.5">
            <Label htmlFor="ted-date">
              Datum <span className="text-destructive">*</span>
            </Label>
            <Input
              id="ted-date"
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              className={errors.date ? "border-destructive" : ""}
              data-ocid="entry-date-input"
            />
            {errors.date && (
              <p className="text-xs text-destructive">{errors.date}</p>
            )}
          </div>

          {/* Projekt */}
          <div className="space-y-1.5">
            <Label htmlFor="ted-project">
              Projekt <span className="text-destructive">*</span>
            </Label>
            {isLoadingData ? (
              <div className="h-10 bg-muted animate-pulse rounded-md" />
            ) : (
              <Select
                value={form.projectId}
                onValueChange={handleProjectChange}
              >
                <SelectTrigger
                  id="ted-project"
                  className={errors.projectId ? "border-destructive" : ""}
                  data-ocid="entry-project-select"
                >
                  <SelectValue placeholder="Projekt wählen…" />
                </SelectTrigger>
                <SelectContent>
                  {visibleProjects.map((p) => (
                    <SelectItem key={String(p.id)} value={String(p.id)}>
                      [{p.code}] {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {errors.projectId && (
              <p className="text-xs text-destructive">{errors.projectId}</p>
            )}
          </div>

          {/* Leistungsart */}
          <div className="space-y-1.5">
            <Label htmlFor="ted-service">
              Leistungsart <span className="text-destructive">*</span>
            </Label>
            <Select
              value={form.serviceTypeId}
              onValueChange={(v) =>
                setForm((f) => ({ ...f, serviceTypeId: v }))
              }
              disabled={!form.projectId}
            >
              <SelectTrigger
                id="ted-service"
                className={errors.serviceTypeId ? "border-destructive" : ""}
                data-ocid="entry-service-select"
              >
                <SelectValue
                  placeholder={
                    form.projectId
                      ? "Leistungsart wählen…"
                      : "Erst Projekt wählen"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {filteredServiceTypes.map((st) => (
                  <SelectItem key={String(st.id)} value={String(st.id)}>
                    {st.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.serviceTypeId && (
              <p className="text-xs text-destructive">{errors.serviceTypeId}</p>
            )}
          </div>

          {/* Time fields — adapt to Erfassungsart */}
          {isZeitBlock ? (
            <>
              <div className="rounded-md bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground border border-border">
                Zeiterfassung:{" "}
                <span className="font-medium text-foreground">
                  Zeit-Block (von / bis)
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="ted-von">
                    Von (hh:mm) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="ted-von"
                    type="text"
                    placeholder="08:00"
                    value={form.von}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, von: e.target.value }))
                    }
                    onBlur={(e) => {
                      const normalized = normalizeTimeInput(e.target.value);
                      setForm((f) => ({ ...f, von: normalized }));
                    }}
                    className={errors.von ? "border-destructive" : ""}
                    data-ocid="entry-von-input"
                  />
                  {errors.von && (
                    <p className="text-xs text-destructive">{errors.von}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ted-bis">
                    Bis (hh:mm) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="ted-bis"
                    type="text"
                    placeholder="17:00"
                    value={form.bis}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, bis: e.target.value }))
                    }
                    onBlur={(e) => {
                      const normalized = normalizeTimeInput(e.target.value);
                      setForm((f) => ({ ...f, bis: normalized }));
                    }}
                    className={errors.bis ? "border-destructive" : ""}
                    data-ocid="entry-bis-input"
                  />
                  {errors.bis && (
                    <p className="text-xs text-destructive">{errors.bis}</p>
                  )}
                </div>
              </div>
              {zeitBlockDuration && (
                <p className="text-sm text-muted-foreground">
                  Dauer:{" "}
                  <span className="font-semibold text-foreground tabular-nums">
                    {zeitBlockDuration}
                  </span>
                </p>
              )}
            </>
          ) : (
            <div className="space-y-1.5">
              <Label htmlFor="ted-hours">
                Dauer (hh:mm) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="ted-hours"
                type="text"
                placeholder="02:30"
                value={form.hours}
                onChange={(e) =>
                  setForm((f) => ({ ...f, hours: e.target.value }))
                }
                onBlur={(e) => {
                  const normalized = normalizeTimeInput(e.target.value);
                  setForm((f) => ({ ...f, hours: normalized }));
                }}
                className={errors.hours ? "border-destructive" : ""}
                data-ocid="entry-hours-input"
              />
              {errors.hours && (
                <p className="text-xs text-destructive">{errors.hours}</p>
              )}
            </div>
          )}

          {/* Beschreibung — optional */}
          <div className="space-y-1.5">
            <Label htmlFor="ted-desc">
              Beschreibung{" "}
              <span className="text-muted-foreground font-normal text-xs">
                (optional)
              </span>
            </Label>
            <Input
              id="ted-desc"
              placeholder="Tätigkeit beschreiben…"
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              className={errors.description ? "border-destructive" : ""}
              data-ocid="entry-description-input"
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description}</p>
            )}
          </div>

          {/* Verrechenbar — only shown when project-employee-service has Stundensatz > 0 */}
          {showVerrechenbar && (
            <div className="flex items-center gap-2 pt-1">
              <Checkbox
                id="ted-billable"
                checked={form.billable}
                onCheckedChange={(checked) =>
                  setForm((f) => ({ ...f, billable: checked === true }))
                }
                data-ocid="entry-billable-checkbox"
              />
              <Label htmlFor="ted-billable" className="cursor-pointer">
                Verrechenbar
              </Label>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
            data-ocid="dialog-cancel-btn"
          >
            Abbrechen
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            data-ocid="dialog-save-btn"
          >
            {isSaving ? "Speichern…" : "Speichern"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
