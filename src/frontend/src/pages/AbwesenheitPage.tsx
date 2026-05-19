import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { Layout } from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuthStore";
import { formatDateDE } from "@/lib/dateFormat";
import {
  getActiveEmploymentForDate,
  getEmploymentMinutesForDate,
} from "@/lib/employmentUtils";
import { countVacationDaysProportional } from "@/lib/employmentUtils";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  CalendarDays,
  Info,
  Pencil,
  PlusCircle,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { createActor } from "../backend";
import type {
  Absence,
  AbsenceFilter,
  AbsenceStatus,
  AbsenceType,
  CreateAbsenceInput,
  Employment,
  UpdateAbsenceInput,
  VacationBalance,
} from "../backend";
import { hhmmToMinutes, minutesToHhMm } from "./stammdaten/shared";

type AnyActor = Record<string, (...args: unknown[]) => Promise<unknown>>;
const toAny = (a: unknown): AnyActor => a as AnyActor;

function statusBadge(status: AbsenceStatus) {
  if (status === "approved")
    return (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
        Genehmigt
      </Badge>
    );
  if (status === "rejected")
    return <Badge variant="destructive">Abgelehnt</Badge>;
  return <Badge variant="secondary">Ausstehend</Badge>;
}

function daysBetween(from: string, to: string): number {
  const d1 = new Date(from);
  const d2 = new Date(to);
  const diff = Math.ceil((d2.getTime() - d1.getTime()) / 86400000) + 1;
  return Math.max(diff, 1);
}

interface AbsenceFormState {
  absenceTypeId: string;
  dateFrom: string;
  dateTo: string;
  description: string;
}

interface VacationFormState {
  dateFrom: string;
  dateTo: string;
  description: string;
  ganztaetig: boolean;
  dauerInput: string; // hh:mm
}

export default function AbwesenheitPage() {
  const navigate = useNavigate();
  const { isAuthenticated, companyId, employeeId, role } = useAuth();
  const { actor, isFetching } = useActor(createActor);
  const queryClient = useQueryClient();

  const [showAbsenceDialog, setShowAbsenceDialog] = useState(false);
  const [showVacationDialog, setShowVacationDialog] = useState(false);
  const [editAbsence, setEditAbsence] = useState<Absence | null>(null);
  const [editVacation, setEditVacation] = useState<Absence | null>(null);
  const [absenceForm, setAbsenceForm] = useState<AbsenceFormState>({
    absenceTypeId: "",
    dateFrom: "",
    dateTo: "",
    description: "",
  });
  const [vacationForm, setVacationForm] = useState<VacationFormState>({
    dateFrom: "",
    dateTo: "",
    description: "",
    ganztaetig: true,
    dauerInput: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteConfirmId, setDeleteConfirmId] = useState<bigint | null>(null);
  const [showApprovedDeleteWarning, setShowApprovedDeleteWarning] =
    useState(false);

  useEffect(() => {
    if (!isAuthenticated || !companyId) navigate({ to: "/" });
  }, [isAuthenticated, companyId, navigate]);

  const enabled = !!actor && !isFetching && isAuthenticated;

  // ─── Fetch absence types ───────────────────────────────────────────────────
  const { data: absenceTypes = [], isLoading: loadingTypes } = useQuery<
    AbsenceType[]
  >({
    queryKey: ["absenceTypes"],
    queryFn: async () => {
      if (!actor) return [];
      return (await toAny(actor).listAbsenceTypes()) as AbsenceType[];
    },
    enabled,
    staleTime: 60_000,
  });

  // ─── Fetch employments for ganztägig calculation ───────────────────────────
  const { data: employments = [] } = useQuery<Employment[]>({
    queryKey: ["myEmployments", employeeId],
    queryFn: async () => {
      if (!actor || !employeeId) return [];
      const res = await toAny(actor).listEmployments(BigInt(employeeId));
      const r = res as { __kind__: string; ok?: Employment[]; err?: string };
      return r.__kind__ === "ok" ? (r.ok ?? []) : [];
    },
    enabled: enabled && !!employeeId,
    staleTime: 60_000,
  });

  // ─── Fetch vacation balances for balance check ────────────────────────────
  const { data: vacationBalances = [] } = useQuery<VacationBalance[]>({
    queryKey: ["vacationBalances-abwesenheit", String(employeeId)],
    queryFn: async () => {
      if (!actor || !employeeId) return [];
      const res = await toAny(actor).listVacationBalances(BigInt(employeeId));
      const r = res as {
        __kind__: string;
        ok?: VacationBalance[];
        err?: string;
      };
      return r.__kind__ === "ok" ? (r.ok ?? []) : [];
    },
    enabled: enabled && !!employeeId,
    staleTime: 0, // ROOT-CAUSE 1: always fresh so balance check uses current data
  });

  // ─── Ganztägig preview hours for single day ───────────────────────────────
  const isSingleDay =
    vacationForm.dateFrom &&
    vacationForm.dateTo &&
    vacationForm.dateFrom === vacationForm.dateTo;
  const ganztaetigPreviewMinutes = (() => {
    if (!vacationForm.ganztaetig || !isSingleDay) return null;
    const emp = getActiveEmploymentForDate(employments, vacationForm.dateFrom);
    if (!emp) return null;
    return getEmploymentMinutesForDate(emp, vacationForm.dateFrom);
  })();

  // Vacation type: the system-managed "Ferien" type.
  // Identified strictly by name only — never by requiresApproval.
  const vacationType = absenceTypes.find(
    (t) => t.name.toLowerCase() === "ferien",
  );
  // nonVacationTypes: exclude the system Ferien type AND inactive types
  const nonVacationTypes = absenceTypes.filter(
    (t) => t.id !== vacationType?.id && t.aktiv,
  );

  // ─── Fetch absences ────────────────────────────────────────────────────────
  const { data: myAbsences = [], isLoading: loadingAbsences } = useQuery<
    Absence[]
  >({
    queryKey: ["myAbsences"],
    queryFn: async () => {
      if (!actor) return [];
      const filter: AbsenceFilter = {};
      return (await toAny(actor).listAbsences(filter)) as Absence[];
    },
    enabled,
    staleTime: 30_000,
  });

  const regularAbsences = myAbsences.filter(
    (a) => !vacationType || a.absenceTypeId !== vacationType.id,
  );
  const vacationAbsences = myAbsences.filter(
    (a) => vacationType && a.absenceTypeId === vacationType.id,
  );

  const createMutation = useMutation({
    mutationFn: async (input: CreateAbsenceInput) => {
      if (!actor) throw new Error("Nicht verfügbar");
      const result = (await toAny(actor).createAbsence(input)) as {
        __kind__: string;
        err?: string;
      };
      if (result.__kind__ === "err") throw new Error(result.err);
      return result;
    },
    onSuccess: (_data, input) => {
      queryClient.invalidateQueries({ queryKey: ["myAbsences"] });
      queryClient.invalidateQueries({
        queryKey: ["vacationBalances-abwesenheit"],
      }); // ROOT-CAUSE 2
      // Show approval-pending toast when the selected absence type requires approval
      const absType = absenceTypes.find((t) => t.id === input.absenceTypeId);
      if (absType?.requiresApproval) {
        toast.success("Abwesenheit eingereicht – wartet auf Genehmigung");
      } else {
        toast.success("Abwesenheit erfasst");
      }
      setShowAbsenceDialog(false);
      setShowVacationDialog(false);
      resetForms();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      input,
    }: { id: bigint; input: UpdateAbsenceInput }) => {
      if (!actor) throw new Error("Nicht verfügbar");
      const result = (await toAny(actor).updateAbsence(id, input)) as {
        __kind__: string;
        err?: string;
      };
      if (result.__kind__ === "err") throw new Error(result.err);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myAbsences"] });
      queryClient.invalidateQueries({
        queryKey: ["vacationBalances-abwesenheit"],
      }); // ROOT-CAUSE 2
      toast.success("Erfolgreich gespeichert");
      setShowAbsenceDialog(false);
      setShowVacationDialog(false);
      setEditAbsence(null);
      setEditVacation(null);
      resetForms();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Nicht verfügbar");
      const result = (await toAny(actor).deleteAbsence(id)) as {
        __kind__: string;
        err?: string;
      };
      if (result.__kind__ === "err") throw new Error(result.err);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myAbsences"] });
      toast.success("Abwesenheit gelöscht");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  function resetForms() {
    setAbsenceForm({
      absenceTypeId: "",
      dateFrom: "",
      dateTo: "",
      description: "",
    });
    setVacationForm({
      dateFrom: "",
      dateTo: "",
      description: "",
      ganztaetig: true,
      dauerInput: "",
    });
    setErrors({});
    setEditAbsence(null);
    setEditVacation(null);
  }

  function openEditAbsence(absence: Absence) {
    setEditAbsence(absence);
    setAbsenceForm({
      absenceTypeId: String(absence.absenceTypeId),
      dateFrom: absence.dateFrom,
      dateTo: absence.dateTo,
      description: absence.description ?? "",
    });
    setShowAbsenceDialog(true);
  }

  function openEditVacation(absence: Absence) {
    setEditVacation(absence);
    setVacationForm({
      dateFrom: absence.dateFrom,
      dateTo: absence.dateTo,
      description: absence.description ?? "",
      ganztaetig: absence.ganztaetig,
      dauerInput: absence.ganztaetig
        ? ""
        : minutesToHhMm(Number(absence.dauer)),
    });
    setShowVacationDialog(true);
  }

  function validateAbsenceForm(): boolean {
    const e: Record<string, string> = {};
    if (!absenceForm.absenceTypeId)
      e.absenceTypeId = "Bitte Abwesenheitsart wählen";
    if (!absenceForm.dateFrom) e.dateFrom = "Datum von ist erforderlich";
    if (!absenceForm.dateTo) e.dateTo = "Datum bis ist erforderlich";
    if (
      absenceForm.dateFrom &&
      absenceForm.dateTo &&
      absenceForm.dateTo < absenceForm.dateFrom
    )
      e.dateTo = "Datum bis muss nach Datum von liegen";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function validateVacationForm(): boolean {
    const e: Record<string, string> = {};
    if (!vacationForm.dateFrom) e.dateFrom = "Datum von ist erforderlich";
    if (!vacationForm.dateTo) e.dateTo = "Datum bis ist erforderlich";
    if (
      vacationForm.dateFrom &&
      vacationForm.dateTo &&
      vacationForm.dateTo < vacationForm.dateFrom
    )
      e.dateTo = "Datum bis muss nach Datum von liegen";
    if (!vacationForm.ganztaetig) {
      const mins = hhmmToMinutes(vacationForm.dauerInput);
      if (mins === null || mins <= 0)
        e.dauerInput = "Bitte gültige Dauer eingeben (z.B. 04:00)";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function submitAbsence() {
    if (!validateAbsenceForm()) return;
    const typeId = absenceTypes.find(
      (t) => String(t.id) === absenceForm.absenceTypeId,
    )?.id;
    if (!typeId) return;

    const isMultiDay = absenceForm.dateFrom !== absenceForm.dateTo;
    // For single-day: dauer should be 0 (backend requirement allows 0 for non-vacation)
    // For multi-day: ganztaetig=true, dauer=0 (derived from employment)
    const dauer = BigInt(0);

    if (editAbsence) {
      updateMutation.mutate({
        id: editAbsence.id,
        input: {
          dateFrom: absenceForm.dateFrom,
          dateTo: absenceForm.dateTo,
          ganztaetig: isMultiDay,
          dauer,
          description: absenceForm.description || undefined,
        },
      });
    } else {
      createMutation.mutate({
        absenceTypeId: typeId,
        dateFrom: absenceForm.dateFrom,
        dateTo: absenceForm.dateTo,
        ganztaetig: isMultiDay,
        dauer,
        description: absenceForm.description || undefined,
      });
    }
  }

  function submitVacation() {
    if (!validateVacationForm()) return;
    if (!vacationType) {
      toast.error("Keine Ferienabwesenheitsart konfiguriert");
      return;
    }

    // ── Feriensaldo-Prüfung ──────────────────────────────────────────────────
    // Only check for new vacation entries (not edits of existing ones)
    if (!editVacation) {
      const currentYear = new Date(vacationForm.dateFrom).getFullYear();

      // Total granted days for the relevant year
      const totalGranted = (vacationBalances ?? [])
        .filter((b) => Number(b.kalenderjahr) === currentYear)
        .reduce((sum, b) => sum + Number(b.dauer) / 100, 0);

      // Already used days: all non-rejected vacation absences in the same year
      // ROOT-CAUSE 3: include "submitted"/"pending" so they count against balance
      const usedDays = (vacationAbsences ?? [])
        .filter(
          (a) =>
            a.status === "approved" ||
            a.status === "submitted" ||
            a.status === ("pending" as AbsenceStatus),
        )
        .reduce((sum, a) => {
          const yFrom = new Date(`${a.dateFrom}T12:00:00`).getFullYear();
          const yTo = new Date(`${a.dateTo}T12:00:00`).getFullYear();
          if (yFrom !== currentYear && yTo !== currentYear) return sum;
          const effFrom =
            yFrom < currentYear ? `${currentYear}-01-01` : a.dateFrom;
          const effTo = yTo > currentYear ? `${currentYear}-12-31` : a.dateTo;
          return (
            sum +
            countVacationDaysProportional(
              effFrom,
              effTo,
              a.ganztaetig,
              Number(a.dauer),
              employments,
            )
          );
        }, 0);

      // Days requested in this new entry
      const dauerMinsForCheck = vacationForm.ganztaetig
        ? 0
        : (hhmmToMinutes(vacationForm.dauerInput) ?? 0);
      let requestedDays = countVacationDaysProportional(
        vacationForm.dateFrom,
        vacationForm.dateTo,
        vacationForm.ganztaetig,
        dauerMinsForCheck,
        employments,
      );
      // Fallback: if no employments loaded yet or no active employment covers these
      // dates, countVacationDaysProportional returns 0 — skip it by using calendar
      // days so the balance check always fires when saldo is insufficient.
      if (requestedDays <= 0) {
        if (vacationForm.ganztaetig) {
          requestedDays = daysBetween(
            vacationForm.dateFrom,
            vacationForm.dateTo,
          );
        } else if (dauerMinsForCheck > 0) {
          // Partial day: use fraction of 1 day based on standard 8h day
          requestedDays = Math.max(dauerMinsForCheck / 480, 0.01);
        }
      }

      const availableDays = Math.max(totalGranted - usedDays, 0);

      if (requestedDays > availableDays + 0.001) {
        const avail =
          availableDays % 1 === 0
            ? availableDays.toFixed(0)
            : availableDays.toFixed(1);
        const needed =
          requestedDays % 1 === 0
            ? requestedDays.toFixed(0)
            : requestedDays.toFixed(1);
        const msg = `Nicht genügend Feriensaldo. Verfügbar: ${avail} Tage, benötigt: ${needed} Tage.`;
        // ROOT-CAUSE 4+5: show both inline error AND toast so the message is guaranteed visible
        setErrors((prev) => ({ ...prev, vacationBalance: msg }));
        toast.error(msg);
        return;
      }
      // Clear any previous balance error
      setErrors((prev) => {
        const { vacationBalance: _removed, ...rest } = prev;
        return rest;
      });
    }

    const dauerMinutes = vacationForm.ganztaetig
      ? (ganztaetigPreviewMinutes ?? 0)
      : (hhmmToMinutes(vacationForm.dauerInput) ?? 0);

    if (editVacation) {
      updateMutation.mutate({
        id: editVacation.id,
        input: {
          dateFrom: vacationForm.dateFrom,
          dateTo: vacationForm.dateTo,
          ganztaetig: vacationForm.ganztaetig,
          dauer: BigInt(dauerMinutes),
          description: vacationForm.description || undefined,
        },
      });
    } else {
      createMutation.mutate({
        absenceTypeId: vacationType.id,
        dateFrom: vacationForm.dateFrom,
        dateTo: vacationForm.dateTo,
        description: vacationForm.description || undefined,
        ganztaetig: vacationForm.ganztaetig,
        dauer: BigInt(dauerMinutes),
      });
    }
  }

  const canEdit = (a: Absence) =>
    a.status === "submitted" || a.status === ("pending" as AbsenceStatus);

  const handleDeleteAbsenceClick = (absence: Absence) => {
    const isApproved = absence.status === "approved";
    const isAdminOrManager =
      role === "admin" || role === "manager" || role === "platform_admin";
    if (isApproved && !isAdminOrManager) {
      setShowApprovedDeleteWarning(true);
      return;
    }
    setDeleteConfirmId(absence.id);
  };

  function getTypeName(id: bigint): string {
    return absenceTypes.find((t) => t.id === id)?.name ?? String(id);
  }

  return (
    <Layout>
      <div className="p-6 space-y-6" data-ocid="abwesenheit-page">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Abwesenheiten
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Abwesenheiten erfassen und Ferienanträge stellen
          </p>
        </div>

        <Tabs defaultValue="abwesenheiten">
          <TabsList>
            <TabsTrigger value="abwesenheiten" data-ocid="tab-abwesenheiten">
              Abwesenheiten
            </TabsTrigger>
            <TabsTrigger value="ferien" data-ocid="tab-ferien">
              Ferienantrag
            </TabsTrigger>
          </TabsList>

          {/* ─── Tab 1: Abwesenheiten ─────────────────────────────────── */}
          <TabsContent value="abwesenheiten" className="mt-4 space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Alle eigenen Abwesenheiten (ohne Ferien)
              </p>
              <Button
                type="button"
                onClick={() => {
                  resetForms();
                  setShowAbsenceDialog(true);
                }}
                className="gap-2"
                data-ocid="btn-neue-abwesenheit"
              >
                <PlusCircle className="w-4 h-4" />
                Neue Abwesenheit
              </Button>
            </div>

            <Card className="shadow-card">
              <CardContent className="p-0">
                {loadingAbsences || loadingTypes ? (
                  <div className="p-4 space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>
                ) : regularAbsences.length === 0 ? (
                  <div
                    className="flex flex-col items-center justify-center py-16 gap-3 text-center"
                    data-ocid="empty-abwesenheiten"
                  >
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                      <CalendarDays className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Keine Abwesenheiten
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Erfassen Sie Krankheit, Unfall oder andere
                        Abwesenheiten.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Typ</TableHead>
                          <TableHead>Datum von</TableHead>
                          <TableHead>Datum bis</TableHead>
                          <TableHead>Tage</TableHead>
                          <TableHead>Beschreibung</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Aktionen</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {regularAbsences.map((a) => (
                          <TableRow
                            key={String(a.id)}
                            data-ocid={`absence-row-${a.id}`}
                          >
                            <TableCell className="font-medium">
                              {getTypeName(a.absenceTypeId)}
                            </TableCell>
                            <TableCell>{formatDateDE(a.dateFrom)}</TableCell>
                            <TableCell>{formatDateDE(a.dateTo)}</TableCell>
                            <TableCell className="text-right tabular-nums">
                              {daysBetween(a.dateFrom, a.dateTo)}
                            </TableCell>
                            <TableCell className="max-w-48 truncate text-muted-foreground">
                              {a.description ?? "—"}
                            </TableCell>
                            <TableCell>{statusBadge(a.status)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                {canEdit(a) && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => openEditAbsence(a)}
                                    data-ocid={`btn-edit-absence-${a.id}`}
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </Button>
                                )}
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => handleDeleteAbsenceClick(a)}
                                  data-ocid={`btn-delete-absence-${a.id}`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── Tab 2: Ferienantrag ──────────────────────────────────── */}
          <TabsContent value="ferien" className="mt-4 space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Ferienanträge einreichen und Status verfolgen
              </p>
              <Button
                type="button"
                onClick={() => {
                  resetForms();
                  setShowVacationDialog(true);
                }}
                className="gap-2"
                data-ocid="btn-ferienantrag-stellen"
              >
                <PlusCircle className="w-4 h-4" />
                Ferienantrag stellen
              </Button>
            </div>

            <Card className="shadow-card">
              <CardContent className="p-0">
                {loadingAbsences ? (
                  <div className="p-4 space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>
                ) : vacationAbsences.length === 0 ? (
                  <div
                    className="flex flex-col items-center justify-center py-16 gap-3 text-center"
                    data-ocid="empty-ferien"
                  >
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                      <CalendarDays className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Keine Ferienanträge
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Stellen Sie einen Antrag für Ihre Ferien.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Zeitraum</TableHead>
                          <TableHead className="text-right">Tage</TableHead>
                          <TableHead>Begründung</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Ablehnungskommentar</TableHead>
                          <TableHead className="text-right">Aktionen</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {vacationAbsences.map((a) => (
                          <TableRow
                            key={String(a.id)}
                            data-ocid={`vacation-row-${a.id}`}
                          >
                            <TableCell className="font-medium whitespace-nowrap">
                              {a.dateFrom === a.dateTo
                                ? formatDateDE(a.dateFrom)
                                : `${formatDateDE(a.dateFrom)} – ${formatDateDE(a.dateTo)}`}
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                              {daysBetween(a.dateFrom, a.dateTo)}
                            </TableCell>
                            <TableCell className="max-w-48 truncate text-muted-foreground">
                              {a.description ?? "—"}
                            </TableCell>
                            <TableCell>{statusBadge(a.status)}</TableCell>
                            <TableCell className="max-w-48 truncate text-destructive text-sm">
                              {a.rejectionComment ?? "—"}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                {canEdit(a) && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => openEditVacation(a)}
                                    data-ocid={`btn-edit-vacation-${a.id}`}
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </Button>
                                )}
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => handleDeleteAbsenceClick(a)}
                                  aria-label="Antrag zurückziehen"
                                  data-ocid={`btn-delete-vacation-${a.id}`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* ─── Dialog: Neue/Bearbeite Abwesenheit ──────────────────── */}
        <Dialog
          open={showAbsenceDialog}
          onOpenChange={(open) => {
            if (!open) {
              setShowAbsenceDialog(false);
              resetForms();
            }
          }}
        >
          <DialogContent className="max-w-md" data-ocid="dialog-abwesenheit">
            <DialogHeader>
              <DialogTitle>
                {editAbsence ? "Abwesenheit bearbeiten" : "Neue Abwesenheit"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {!editAbsence && (
                <div className="space-y-1.5">
                  <Label htmlFor="absenceType">Abwesenheitsart *</Label>
                  <Select
                    value={absenceForm.absenceTypeId}
                    onValueChange={(v) =>
                      setAbsenceForm((f) => ({ ...f, absenceTypeId: v }))
                    }
                  >
                    <SelectTrigger
                      id="absenceType"
                      data-ocid="select-absence-type"
                    >
                      <SelectValue placeholder="Bitte wählen…" />
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

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="absDateFrom">Datum von *</Label>
                  <Input
                    id="absDateFrom"
                    type="date"
                    value={absenceForm.dateFrom}
                    onChange={(e) =>
                      setAbsenceForm((f) => ({
                        ...f,
                        dateFrom: e.target.value,
                      }))
                    }
                    data-ocid="input-abs-date-from"
                  />
                  {errors.dateFrom && (
                    <p className="text-xs text-destructive">
                      {errors.dateFrom}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="absDateTo">Datum bis *</Label>
                  <Input
                    id="absDateTo"
                    type="date"
                    value={absenceForm.dateTo}
                    onChange={(e) =>
                      setAbsenceForm((f) => ({ ...f, dateTo: e.target.value }))
                    }
                    data-ocid="input-abs-date-to"
                  />
                  {errors.dateTo && (
                    <p className="text-xs text-destructive">{errors.dateTo}</p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="absDescription">Beschreibung</Label>
                <Textarea
                  id="absDescription"
                  placeholder="Optionale Beschreibung…"
                  rows={3}
                  value={absenceForm.description}
                  onChange={(e) =>
                    setAbsenceForm((f) => ({
                      ...f,
                      description: e.target.value,
                    }))
                  }
                  data-ocid="input-abs-description"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAbsenceDialog(false);
                  resetForms();
                }}
              >
                Abbrechen
              </Button>
              <Button
                type="button"
                onClick={submitAbsence}
                disabled={createMutation.isPending || updateMutation.isPending}
                data-ocid="btn-submit-abwesenheit"
              >
                {createMutation.isPending || updateMutation.isPending
                  ? "Speichern…"
                  : editAbsence
                    ? "Aktualisieren"
                    : "Erfassen"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ─── Dialog: Ferienantrag stellen ────────────────────────── */}
        <Dialog
          open={showVacationDialog}
          onOpenChange={(open) => {
            if (!open) {
              setShowVacationDialog(false);
              resetForms();
            }
          }}
        >
          <DialogContent className="max-w-md" data-ocid="dialog-ferienantrag">
            <DialogHeader>
              <DialogTitle>
                {editVacation
                  ? "Ferienantrag bearbeiten"
                  : "Ferienantrag stellen"}
              </DialogTitle>
            </DialogHeader>

            {/* Inline error: insufficient vacation balance */}
            {errors.vacationBalance && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 text-red-700 text-sm flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-500" />
                <span>{errors.vacationBalance}</span>
              </div>
            )}

            <div className="space-y-4 py-2">
              {/* ── Datum von / bis ──────────────────────────────────── */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="vacDateFrom">Datum von *</Label>
                  <Input
                    id="vacDateFrom"
                    type="date"
                    value={vacationForm.dateFrom}
                    onChange={(e) =>
                      setVacationForm((f) => ({
                        ...f,
                        dateFrom: e.target.value,
                      }))
                    }
                    data-ocid="input-vac-date-from"
                  />
                  {errors.dateFrom && (
                    <p className="text-xs text-destructive">
                      {errors.dateFrom}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="vacDateTo">Datum bis *</Label>
                  <Input
                    id="vacDateTo"
                    type="date"
                    value={vacationForm.dateTo}
                    onChange={(e) =>
                      setVacationForm((f) => ({ ...f, dateTo: e.target.value }))
                    }
                    data-ocid="input-vac-date-to"
                  />
                  {errors.dateTo && (
                    <p className="text-xs text-destructive">{errors.dateTo}</p>
                  )}
                </div>
              </div>

              {/* ── Anzahl Tage Vorschau ──────────────────────────────── */}
              {vacationForm.dateFrom &&
                vacationForm.dateTo &&
                vacationForm.dateTo >= vacationForm.dateFrom && (
                  <p className="text-sm text-muted-foreground">
                    Anzahl Tage:{" "}
                    <span className="font-medium text-foreground">
                      {daysBetween(vacationForm.dateFrom, vacationForm.dateTo)}
                    </span>
                  </p>
                )}

              {/* ── Ganztägig Checkbox ───────────────────────────────── */}
              <div
                className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30"
                data-ocid="ganztaetig-section"
              >
                <Checkbox
                  id="ganztaetig"
                  checked={vacationForm.ganztaetig}
                  onCheckedChange={(checked) =>
                    setVacationForm((f) => ({
                      ...f,
                      ganztaetig: checked === true,
                    }))
                  }
                  className="data-[state=checked]:bg-[#006066] data-[state=checked]:border-[#006066]"
                  data-ocid="checkbox-ganztaetig"
                />
                <Label
                  htmlFor="ganztaetig"
                  className="cursor-pointer font-medium text-sm"
                >
                  Ganztägig
                </Label>
              </div>

              {/* ── Dauer Eingabe (nur wenn nicht ganztägig) ─────────── */}
              {!vacationForm.ganztaetig && (
                <div className="space-y-1.5">
                  <Label htmlFor="vacDauer">Dauer (hh:mm) *</Label>
                  <Input
                    id="vacDauer"
                    type="text"
                    placeholder="08:00"
                    value={vacationForm.dauerInput}
                    onChange={(e) =>
                      setVacationForm((f) => ({
                        ...f,
                        dauerInput: e.target.value,
                      }))
                    }
                    data-ocid="input-vac-dauer"
                  />
                  {errors.dauerInput && (
                    <p className="text-xs text-destructive">
                      {errors.dauerInput}
                    </p>
                  )}
                </div>
              )}

              {/* ── Ganztägig Vorschau / Info ────────────────────────── */}
              {vacationForm.ganztaetig &&
                vacationForm.dateFrom &&
                vacationForm.dateTo &&
                vacationForm.dateTo >= vacationForm.dateFrom && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm">
                    <Info className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    {isSingleDay && ganztaetigPreviewMinutes !== null ? (
                      <span className="text-foreground">
                        Dauer:{" "}
                        <span className="font-semibold text-primary">
                          {minutesToHhMm(ganztaetigPreviewMinutes)} Stunden
                        </span>{" "}
                        <span className="text-muted-foreground">
                          (aus Beschäftigung)
                        </span>
                      </span>
                    ) : isSingleDay ? (
                      <span className="text-muted-foreground">
                        Dauer wird aus der Beschäftigung für diesen Wochentag
                        übernommen.
                      </span>
                    ) : (
                      <span className="text-muted-foreground">
                        Stunden werden aus der Beschäftigung je Wochentag
                        übernommen.
                      </span>
                    )}
                  </div>
                )}

              {/* ── Begründung ───────────────────────────────────────── */}
              <div className="space-y-1.5">
                <Label htmlFor="vacDescription">Begründung</Label>
                <Textarea
                  id="vacDescription"
                  placeholder="Optionale Begründung…"
                  rows={3}
                  value={vacationForm.description}
                  onChange={(e) =>
                    setVacationForm((f) => ({
                      ...f,
                      description: e.target.value,
                    }))
                  }
                  data-ocid="input-vac-description"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowVacationDialog(false);
                  resetForms();
                }}
              >
                Abbrechen
              </Button>
              <Button
                type="button"
                onClick={submitVacation}
                disabled={createMutation.isPending || updateMutation.isPending}
                data-ocid="btn-submit-ferienantrag"
              >
                {createMutation.isPending || updateMutation.isPending
                  ? "Speichern…"
                  : editVacation
                    ? "Aktualisieren"
                    : "Einreichen"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <DeleteConfirmDialog
        open={!!deleteConfirmId}
        onConfirm={() => {
          if (deleteConfirmId !== null) {
            deleteMutation.mutate(deleteConfirmId);
          }
          setDeleteConfirmId(null);
        }}
        onCancel={() => setDeleteConfirmId(null)}
        isDeleting={deleteMutation.isPending}
      />

      {/* ── Approved-entry delete warning ── */}
      {showApprovedDeleteWarning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 max-w-md mx-4 shadow-xl border border-border">
            <h3 className="text-lg font-semibold mb-3 text-foreground">
              Eintrag genehmigt
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Dieser Eintrag wurde bereits genehmigt. Bitte den Vorgesetzten
              bitten, die Genehmigung zuerst zurückzusetzen, bevor der Eintrag
              gelöscht werden kann.
            </p>
            <button
              type="button"
              onClick={() => setShowApprovedDeleteWarning(false)}
              className="px-4 py-2 bg-[#006066] text-white rounded text-sm hover:opacity-90 transition-opacity"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
}
