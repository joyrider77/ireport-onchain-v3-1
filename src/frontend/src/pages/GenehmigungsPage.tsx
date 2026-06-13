import { Layout } from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Check, CheckCircle2, ClipboardList, RotateCcw, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { createActor } from "../backend";
import type {
  Absence,
  AbsenceFilter,
  AbsenceStatus,
  AbsenceType,
  Employee,
  Expense,
  ExpenseFilter,
  ExpenseStatus,
} from "../backend";

type AnyActor = Record<string, (...args: unknown[]) => Promise<unknown>>;
const toAny = (a: unknown): AnyActor => a as AnyActor;

function absenceStatusBadge(status: AbsenceStatus) {
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

function expenseStatusBadge(status: ExpenseStatus) {
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
  return Math.max(Math.ceil((d2.getTime() - d1.getTime()) / 86400000) + 1, 1);
}

function formatDate(ts: bigint): string {
  return new Date(Number(ts) / 1_000_000).toLocaleDateString("de-CH");
}

type AbsenceStatusFilter = "all" | "submitted" | "approved" | "rejected";
type ExpenseStatusFilter = "all" | "pending" | "approved" | "rejected";

export default function GenehmigungsPage() {
  const navigate = useNavigate();
  const { isAuthenticated, companyId, role, employeeId } = useAuth();
  const { actor, isFetching } = useActor(createActor);
  const queryClient = useQueryClient();

  const [absenceFilter, setAbsenceFilter] =
    useState<AbsenceStatusFilter>("submitted");
  const [expenseFilter, setExpenseFilter] =
    useState<ExpenseStatusFilter>("pending");
  const [mitarbeiterFilter, setMitarbeiterFilter] = useState<"alle" | "meine">(
    role === "admin" ? "alle" : "meine",
  );

  const supervisedEmployeeIds = useMemo(() => {
    const ids: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("supervisor_")) {
        const supervisorId = localStorage.getItem(key);
        if (supervisorId === employeeId) {
          ids.push(key.replace("supervisor_", ""));
        }
      }
    }
    return ids;
  }, [employeeId]);

  // Reject absence dialog state
  const [rejectAbsenceId, setRejectAbsenceId] = useState<bigint | null>(null);
  const [rejectAbsenceComment, setRejectAbsenceComment] = useState("");

  // Reset absence dialog state
  const [resetAbsenceId, setResetAbsenceId] = useState<bigint | null>(null);
  const [resetAbsenceReason, setResetAbsenceReason] = useState("");

  // Reject expense dialog state
  const [rejectExpenseId, setRejectExpenseId] = useState<bigint | null>(null);
  const [rejectExpenseComment, setRejectExpenseComment] = useState("");

  // Reset expense dialog state
  const [resetExpenseId, setResetExpenseId] = useState<bigint | null>(null);
  const [resetExpenseReason, setResetExpenseReason] = useState("");

  const [filterMonthFerien, setFilterMonthFerien] = useState<string>("alle");
  const [filterMonthAbsenzen, setFilterMonthAbsenzen] =
    useState<string>("alle");
  const [filterMonthSpesen, setFilterMonthSpesen] = useState<string>("alle");
  useEffect(() => {
    if (!isAuthenticated || !companyId) {
      navigate({ to: "/" });
      return;
    }
    if (role !== "admin" && role !== "manager") {
      navigate({ to: "/dashboard" });
    }
  }, [isAuthenticated, companyId, role, navigate]);

  const enabled =
    !!actor &&
    !isFetching &&
    isAuthenticated &&
    (role === "admin" || role === "manager");

  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ["employees"],
    queryFn: async () => {
      if (!actor) return [];
      return (await toAny(actor).listEmployees()) as Employee[];
    },
    enabled,
    staleTime: 60_000,
  });

  const { data: absenceTypes = [] } = useQuery<AbsenceType[]>({
    queryKey: ["absenceTypes"],
    queryFn: async () => {
      if (!actor) return [];
      return (await toAny(actor).listAbsenceTypes()) as AbsenceType[];
    },
    enabled,
    staleTime: 60_000,
  });

  // Strictly match by name only — never use requiresApproval as a fallback.
  const vacationType = absenceTypes.find(
    (t) => t.name.toLowerCase() === "ferien",
  );

  const absenceQueryFilter: AbsenceFilter =
    absenceFilter === "all"
      ? {}
      : absenceFilter === "submitted"
        ? { status: "submitted" as AbsenceStatus }
        : absenceFilter === "approved"
          ? { status: "approved" as AbsenceStatus }
          : { status: "rejected" as AbsenceStatus };

  const { data: allAbsences = [], isLoading: loadingAbsences } = useQuery<
    Absence[]
  >({
    queryKey: ["allAbsences", absenceFilter],
    queryFn: async () => {
      if (!actor) return [];
      return (await toAny(actor).listAbsences(absenceQueryFilter)) as Absence[];
    },
    enabled,
    staleTime: 30_000,
  });

  const vacationAbsencesRaw = allAbsences.filter(
    (a) => vacationType && a.absenceTypeId === vacationType.id,
  );

  // Non-vacation absences (all types excluding the vacation type, regardless of requiresApproval)
  const _nonVacationAbsenceTypeIds = new Set(
    absenceTypes
      .filter((t) => !vacationType || t.id !== vacationType.id)
      .map((t) => String(t.id)),
  );
  const nonVacationApprovalAbsencesRaw = allAbsences.filter(
    (a) => !vacationType || String(a.absenceTypeId) !== String(vacationType.id),
  );

  // Apply Alle/Meine filter
  const vacationAbsencesFiltered =
    mitarbeiterFilter === "meine"
      ? vacationAbsencesRaw.filter((a) =>
          supervisedEmployeeIds.includes(String(a.employeeId)),
        )
      : vacationAbsencesRaw;
  const nonVacationApprovalAbsencesFiltered =
    mitarbeiterFilter === "meine"
      ? nonVacationApprovalAbsencesRaw.filter((a) =>
          supervisedEmployeeIds.includes(String(a.employeeId)),
        )
      : nonVacationApprovalAbsencesRaw;

  // Apply month filter for Ferien/Absenzen
  const vacationAbsences =
    filterMonthFerien === "alle"
      ? vacationAbsencesFiltered
      : vacationAbsencesFiltered.filter((a) => {
          const d = new Date(a.dateFrom);
          return (
            `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}` ===
            filterMonthFerien
          );
        });
  const nonVacationApprovalAbsences =
    filterMonthAbsenzen === "alle"
      ? nonVacationApprovalAbsencesFiltered
      : nonVacationApprovalAbsencesFiltered.filter((a) => {
          const d = new Date(a.dateFrom);
          return (
            `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}` ===
            filterMonthAbsenzen
          );
        });

  function getAbsenceTypeName(id: bigint): string {
    return absenceTypes.find((t) => t.id === id)?.name ?? String(id);
  }

  const expenseQueryFilter: ExpenseFilter =
    expenseFilter === "all" ? {} : { status: expenseFilter as ExpenseStatus };

  const { data: allExpensesRaw = [], isLoading: loadingExpenses } = useQuery<
    Expense[]
  >({
    queryKey: ["allExpenses", expenseFilter],
    queryFn: async () => {
      if (!actor) return [];
      return (await toAny(actor).listExpenses(expenseQueryFilter)) as Expense[];
    },
    enabled,
    staleTime: 30_000,
  });

  // Apply Alle/Meine filter for expenses
  const allExpensesFiltered =
    mitarbeiterFilter === "meine"
      ? allExpensesRaw.filter((e) =>
          supervisedEmployeeIds.includes(String(e.employeeId)),
        )
      : allExpensesRaw;

  // Apply month filter for Spesen
  const allExpenses =
    filterMonthSpesen === "alle"
      ? allExpensesFiltered
      : allExpensesFiltered.filter((e) => {
          if (!e.date) return false;
          const d = new Date(
            typeof e.date === "bigint"
              ? Number(e.date) / 1_000_000
              : String(e.date),
          );
          return (
            `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}` ===
            filterMonthSpesen
          );
        });

  function getEmployeeName(id: bigint): string {
    const emp = employees.find((e) => e.id === id);
    return emp ? `${emp.firstName} ${emp.lastName}` : String(id);
  }

  // ─── Absence mutations ────────────────────────────────────────────────────────

  const approveAbsenceMutation = useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Nicht verfügbar");
      const result = (await toAny(actor).approveAbsence(id)) as {
        __kind__?: string;
        err?: string;
      };
      if ((result as { __kind__?: string }).__kind__ === "err")
        throw new Error(
          typeof result.err === "string"
            ? result.err
            : "Fehler bei der Genehmigung",
        );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["allAbsences"],
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: ["absences"],
        refetchType: "active",
      });
      toast.success("Ferienantrag genehmigt");
    },
    onError: (err: Error) =>
      toast.error(`Genehmigung fehlgeschlagen: ${err.message}`),
  });

  const rejectAbsenceMutation = useMutation({
    mutationFn: async ({ id, comment }: { id: bigint; comment: string }) => {
      if (!actor) throw new Error("Nicht verfügbar");
      let result: unknown;
      try {
        result = await toAny(actor).rejectAbsence(id, comment);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        throw new Error(`Canister-Fehler: ${msg}`);
      }
      const r = result as { __kind__?: string; err?: string };
      if ((r as { __kind__?: string }).__kind__ === "err")
        throw new Error(
          typeof r.err === "string" ? r.err : "Fehler bei der Ablehnung",
        );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allAbsences"] });
      queryClient.invalidateQueries({ queryKey: ["absences"] });
      toast.success("Ferienantrag abgelehnt");
      setRejectAbsenceId(null);
      setRejectAbsenceComment("");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // ─── Expense mutations ────────────────────────────────────────────────────────

  const approveExpenseMutation = useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Nicht verfügbar");
      const result = (await toAny(actor).approveExpense(id)) as {
        __kind__: string;
        err?: string;
      };
      if (result.__kind__ === "err")
        throw new Error(result.err ?? "Fehler bei der Genehmigung");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["allExpenses"],
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: ["expenses"],
        refetchType: "active",
      });
      toast.success("Spesen genehmigt");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const rejectExpenseMutation = useMutation({
    mutationFn: async ({ id, comment }: { id: bigint; comment: string }) => {
      if (!actor) throw new Error("Nicht verfügbar");
      const result = (await toAny(actor).rejectExpense(
        id,
        comment || null,
      )) as {
        __kind__: string;
        err?: string;
      };
      if (result.__kind__ === "err")
        throw new Error(result.err ?? "Fehler bei der Ablehnung");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["allExpenses"],
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: ["expenses"],
        refetchType: "active",
      });
      toast.success("Spesen abgelehnt");
      setRejectExpenseId(null);
      setRejectExpenseComment("");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const resetAbsenceMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: bigint; reason: string }) => {
      if (!actor) throw new Error("Nicht verfügbar");
      let result: unknown;
      try {
        result = await toAny(actor).resetAbsenceToAusstehend(id, reason);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        throw new Error(`Canister-Fehler: ${msg}`);
      }
      const r = result as { __kind__?: string; err?: string };
      if (r.__kind__ === "err")
        throw new Error(r.err ?? "Fehler beim Zurücksetzen");
      if (typeof r.err === "string") throw new Error(r.err);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["allAbsences"],
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: ["absences"],
        refetchType: "active",
      });
      toast.success("Ferienantrag auf «Ausstehend» zurückgesetzt");
      setResetAbsenceId(null);
      setResetAbsenceReason("");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const resetExpenseMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: bigint; reason: string }) => {
      if (!actor) throw new Error("Nicht verfügbar");
      const result = (await toAny(actor).resetExpenseToAusstehend(
        id,
        reason,
      )) as {
        __kind__: string;
        err?: string;
      };
      if (result.__kind__ === "err")
        throw new Error(result.err ?? "Fehler beim Zurücksetzen");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["allExpenses"],
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: ["expenses"],
        refetchType: "active",
      });
      toast.success("Spesen auf «Ausstehend» zurückgesetzt");
      setResetExpenseId(null);
      setResetExpenseReason("");
    },
    onError: (err: Error) => {
      toast.error(err.message);
      setResetExpenseId(null);
    },
  });

  if (role !== "admin" && role !== "manager") return null;

  return (
    <Layout>
      <div className="p-6 space-y-6" data-ocid="genehmigungen-page">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Genehmigungen
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Ferienanträge und Spesen prüfen und genehmigen
          </p>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => setMitarbeiterFilter("alle")}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              mitarbeiterFilter === "alle"
                ? "bg-[#006066] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            data-ocid="filter-alle-mitarbeiter"
          >
            Alle Mitarbeiter
          </button>
          <button
            type="button"
            onClick={() => setMitarbeiterFilter("meine")}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              mitarbeiterFilter === "meine"
                ? "bg-[#006066] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            data-ocid="filter-meine-mitarbeiter"
          >
            Meine Mitarbeiter
          </button>
        </div>

        <Tabs defaultValue="ferien">
          <TabsList>
            <TabsTrigger value="ferien" data-ocid="tab-ferien-genehmigung">
              Ferienanträge
            </TabsTrigger>
            <TabsTrigger value="absenzen" data-ocid="tab-absenzen-genehmigung">
              Absenzen
              {nonVacationApprovalAbsences.filter(
                (a) => a.status === "submitted",
              ).length > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                  {
                    nonVacationApprovalAbsences.filter(
                      (a) => a.status === "submitted",
                    ).length
                  }
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="spesen" data-ocid="tab-spesen-genehmigung">
              Spesen
            </TabsTrigger>
          </TabsList>

          {/* ─── Tab 1: Ferienanträge ──────────────────────────────── */}
          <TabsContent value="ferien" className="mt-4 space-y-4">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <p className="text-sm text-muted-foreground">
                Ferienanträge aller Mitarbeitenden
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <Label className="text-sm text-muted-foreground whitespace-nowrap">
                  Monat:
                </Label>
                <Select
                  value={filterMonthFerien}
                  onValueChange={setFilterMonthFerien}
                >
                  <SelectTrigger
                    className="w-36"
                    data-ocid="select-ferien-month-filter"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alle">Alle Monate</SelectItem>
                    {Array.from({ length: 12 }, (_, i) => {
                      const d = new Date();
                      d.setMonth(d.getMonth() - i);
                      const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
                      const label = d.toLocaleDateString("de-CH", {
                        month: "long",
                        year: "numeric",
                      });
                      return (
                        <SelectItem key={val} value={val}>
                          {label}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <Label className="text-sm text-muted-foreground whitespace-nowrap">
                  Status:
                </Label>
                <Select
                  value={absenceFilter}
                  onValueChange={(v) =>
                    setAbsenceFilter(v as AbsenceStatusFilter)
                  }
                >
                  <SelectTrigger
                    className="w-36"
                    data-ocid="select-absence-filter"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="submitted">Ausstehend</SelectItem>
                    <SelectItem value="approved">Genehmigt</SelectItem>
                    <SelectItem value="rejected">Abgelehnt</SelectItem>
                    <SelectItem value="all">Alle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
                    data-ocid="empty-ferien-genehmigung"
                  >
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Keine Ferienanträge
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Es liegen keine Anträge mit dem gewählten Status vor.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Mitarbeiter</TableHead>
                          <TableHead>Datum von</TableHead>
                          <TableHead>Datum bis</TableHead>
                          <TableHead className="text-right">
                            Anzahl Tage
                          </TableHead>
                          <TableHead>Begründung</TableHead>
                          <TableHead>Eingereicht am</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Aktionen</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {vacationAbsences.map((a) => (
                          <TableRow
                            key={String(a.id)}
                            data-ocid={`vacation-approval-row-${a.id}`}
                          >
                            <TableCell className="font-medium">
                              {getEmployeeName(a.employeeId)}
                            </TableCell>
                            <TableCell>{formatDateDE(a.dateFrom)}</TableCell>
                            <TableCell>{formatDateDE(a.dateTo)}</TableCell>
                            <TableCell className="text-right tabular-nums">
                              {daysBetween(a.dateFrom, a.dateTo)}
                            </TableCell>
                            <TableCell className="max-w-40 truncate text-muted-foreground">
                              {a.description ?? "—"}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {formatDate(a.createdAt)}
                            </TableCell>
                            <TableCell>
                              {absenceStatusBadge(a.status)}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                {a.status === "submitted" && (
                                  <>
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="outline"
                                      className="gap-1.5 text-green-700 border-green-200 hover:bg-green-50"
                                      onClick={() =>
                                        approveAbsenceMutation.mutate(a.id)
                                      }
                                      disabled={
                                        approveAbsenceMutation.isPending
                                      }
                                      data-ocid={`btn-approve-vacation-${a.id}`}
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                      Genehmigen
                                    </Button>
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="outline"
                                      className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10"
                                      onClick={() => {
                                        setRejectAbsenceId(a.id);
                                        setRejectAbsenceComment("");
                                      }}
                                      data-ocid={`btn-reject-vacation-${a.id}`}
                                    >
                                      <X className="w-3.5 h-3.5" />
                                      Ablehnen
                                    </Button>
                                  </>
                                )}
                                {a.status === "approved" && (
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    className="gap-1.5 text-amber-700 border-amber-200 hover:bg-amber-50"
                                    onClick={() => {
                                      setResetAbsenceId(a.id);
                                      setResetAbsenceReason("");
                                    }}
                                    data-ocid={`btn-reset-vacation-${a.id}`}
                                  >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    Zurücksetzen
                                  </Button>
                                )}
                                {a.status === "rejected" &&
                                  a.rejectionComment && (
                                    <span className="text-xs text-muted-foreground italic max-w-32 truncate block">
                                      {a.rejectionComment}
                                    </span>
                                  )}
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

          {/* ─── Tab 2: Absenzen (non-vacation requiresApproval absences) ─ */}
          <TabsContent value="absenzen" className="mt-4 space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Absenzen mit Genehmigungspflicht aller Mitarbeitenden
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <Label className="text-sm text-muted-foreground whitespace-nowrap">
                  Monat:
                </Label>
                <Select
                  value={filterMonthAbsenzen}
                  onValueChange={setFilterMonthAbsenzen}
                >
                  <SelectTrigger
                    className="w-36"
                    data-ocid="select-absenzen-month-filter"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alle">Alle Monate</SelectItem>
                    {Array.from({ length: 12 }, (_, i) => {
                      const d = new Date();
                      d.setMonth(d.getMonth() - i);
                      const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
                      const label = d.toLocaleDateString("de-CH", {
                        month: "long",
                        year: "numeric",
                      });
                      return (
                        <SelectItem key={val} value={val}>
                          {label}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <Label className="text-sm text-muted-foreground whitespace-nowrap">
                  Status:
                </Label>
                <Select
                  value={absenceFilter}
                  onValueChange={(v) =>
                    setAbsenceFilter(v as AbsenceStatusFilter)
                  }
                >
                  <SelectTrigger
                    className="w-36"
                    data-ocid="select-absenzen-filter"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="submitted">Ausstehend</SelectItem>
                    <SelectItem value="approved">Genehmigt</SelectItem>
                    <SelectItem value="rejected">Abgelehnt</SelectItem>
                    <SelectItem value="all">Alle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Card className="shadow-card">
              <CardContent className="p-0">
                {loadingAbsences ? (
                  <div className="p-4 space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>
                ) : nonVacationApprovalAbsences.length === 0 ? (
                  <div
                    className="flex flex-col items-center justify-center py-16 gap-3 text-center"
                    data-ocid="empty-absenzen-genehmigung"
                  >
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Keine Absenzen
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Es liegen keine Absenzen mit dem gewählten Status vor.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Mitarbeiter</TableHead>
                          <TableHead>Abwesenheitsart</TableHead>
                          <TableHead>Datum von</TableHead>
                          <TableHead>Datum bis</TableHead>
                          <TableHead className="text-right">Tage</TableHead>
                          <TableHead>Begründung</TableHead>
                          <TableHead>Eingereicht am</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Aktionen</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {nonVacationApprovalAbsences.map((a) => (
                          <TableRow
                            key={String(a.id)}
                            data-ocid={`absenz-approval-row-${a.id}`}
                          >
                            <TableCell className="font-medium">
                              {getEmployeeName(a.employeeId)}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {getAbsenceTypeName(a.absenceTypeId)}
                            </TableCell>
                            <TableCell>{formatDateDE(a.dateFrom)}</TableCell>
                            <TableCell>{formatDateDE(a.dateTo)}</TableCell>
                            <TableCell className="text-right tabular-nums">
                              {daysBetween(a.dateFrom, a.dateTo)}
                            </TableCell>
                            <TableCell className="max-w-40 truncate text-muted-foreground">
                              {a.description ?? "—"}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {formatDate(a.createdAt)}
                            </TableCell>
                            <TableCell>
                              {absenceStatusBadge(a.status)}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                {a.status === "submitted" && (
                                  <>
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="outline"
                                      className="gap-1.5 text-green-700 border-green-200 hover:bg-green-50"
                                      onClick={() =>
                                        approveAbsenceMutation.mutate(a.id)
                                      }
                                      disabled={
                                        approveAbsenceMutation.isPending
                                      }
                                      data-ocid={`btn-approve-absenz-${a.id}`}
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                      Genehmigen
                                    </Button>
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="outline"
                                      className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10"
                                      onClick={() => {
                                        setRejectAbsenceId(a.id);
                                        setRejectAbsenceComment("");
                                      }}
                                      data-ocid={`btn-reject-absenz-${a.id}`}
                                    >
                                      <X className="w-3.5 h-3.5" />
                                      Ablehnen
                                    </Button>
                                  </>
                                )}
                                {a.status === "approved" && (
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    className="gap-1.5 text-amber-700 border-amber-200 hover:bg-amber-50"
                                    onClick={() => {
                                      setResetAbsenceId(a.id);
                                      setResetAbsenceReason("");
                                    }}
                                    data-ocid={`btn-reset-absenz-${a.id}`}
                                  >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    Zurücksetzen
                                  </Button>
                                )}
                                {a.status === "rejected" &&
                                  a.rejectionComment && (
                                    <span className="text-xs text-muted-foreground italic max-w-32 truncate block">
                                      {a.rejectionComment}
                                    </span>
                                  )}
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

          {/* ─── Tab 3: Spesen ────────────────────────────────────────── */}
          <TabsContent value="spesen" className="mt-4 space-y-4">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <p className="text-sm text-muted-foreground">
                Spesenbelege aller Mitarbeitenden
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <Label className="text-sm text-muted-foreground whitespace-nowrap">
                  Monat:
                </Label>
                <Select
                  value={filterMonthSpesen}
                  onValueChange={setFilterMonthSpesen}
                >
                  <SelectTrigger
                    className="w-36"
                    data-ocid="select-spesen-month-filter"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alle">Alle Monate</SelectItem>
                    {Array.from({ length: 12 }, (_, i) => {
                      const d = new Date();
                      d.setMonth(d.getMonth() - i);
                      const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
                      const label = d.toLocaleDateString("de-CH", {
                        month: "long",
                        year: "numeric",
                      });
                      return (
                        <SelectItem key={val} value={val}>
                          {label}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <Label className="text-sm text-muted-foreground whitespace-nowrap">
                  Status:
                </Label>
                <Select
                  value={expenseFilter}
                  onValueChange={(v) =>
                    setExpenseFilter(v as ExpenseStatusFilter)
                  }
                >
                  <SelectTrigger
                    className="w-36"
                    data-ocid="select-expense-filter"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Ausstehend</SelectItem>
                    <SelectItem value="approved">Genehmigt</SelectItem>
                    <SelectItem value="rejected">Abgelehnt</SelectItem>
                    <SelectItem value="all">Alle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Card className="shadow-card">
              <CardContent className="p-0">
                {loadingExpenses ? (
                  <div className="p-4 space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>
                ) : allExpenses.length === 0 ? (
                  <div
                    className="flex flex-col items-center justify-center py-16 gap-3 text-center"
                    data-ocid="empty-spesen-genehmigung"
                  >
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                      <ClipboardList className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Keine Spesen
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Es liegen keine Spesenbelege mit dem gewählten Status
                        vor.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Mitarbeiter</TableHead>
                          <TableHead>Datum</TableHead>
                          <TableHead className="text-right">
                            Verrechenbar (CHF)
                          </TableHead>
                          <TableHead className="text-right">
                            Rückvergütung (CHF)
                          </TableHead>
                          <TableHead>Beschreibung</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Aktionen</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {allExpenses.map((e) => (
                          <TableRow
                            key={String(e.id)}
                            data-ocid={`expense-approval-row-${e.id}`}
                          >
                            <TableCell className="font-medium">
                              {getEmployeeName(e.employeeId)}
                            </TableCell>
                            <TableCell>{formatDateDE(e.date)}</TableCell>
                            <TableCell className="text-right tabular-nums">
                              {e.billableCHF.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                              {e.reimbursementCHF.toFixed(2)}
                            </TableCell>
                            <TableCell className="max-w-40 truncate text-muted-foreground">
                              {e.description || "—"}
                            </TableCell>
                            <TableCell>
                              {expenseStatusBadge(e.status)}
                            </TableCell>
                            <TableCell className="text-right">
                              {e.status === "pending" && (
                                <div className="flex justify-end gap-1">
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    className="gap-1.5 text-green-700 border-green-200 hover:bg-green-50"
                                    onClick={() =>
                                      approveExpenseMutation.mutate(e.id)
                                    }
                                    disabled={approveExpenseMutation.isPending}
                                    data-ocid={`btn-approve-expense-${e.id}`}
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    Genehmigen
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10"
                                    onClick={() => {
                                      setRejectExpenseId(e.id);
                                      setRejectExpenseComment("");
                                    }}
                                    data-ocid={`btn-reject-expense-${e.id}`}
                                  >
                                    <X className="w-3.5 h-3.5" />
                                    Ablehnen
                                  </Button>
                                </div>
                              )}
                              {e.status === "approved" && (
                                <div className="flex justify-end gap-1">
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    className="gap-1.5 text-amber-700 border-amber-200 hover:bg-amber-50"
                                    onClick={() => {
                                      setResetExpenseId(e.id);
                                      setResetExpenseReason("");
                                    }}
                                    data-ocid={`btn-reset-expense-${e.id}`}
                                  >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    Zurücksetzen
                                  </Button>
                                </div>
                              )}
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

        {/* ─── Dialog: Ferienantrag ablehnen ────────────────────────── */}
        <Dialog
          open={rejectAbsenceId !== null}
          onOpenChange={(open) => {
            if (!open) {
              setRejectAbsenceId(null);
              setRejectAbsenceComment("");
            }
          }}
        >
          <DialogContent
            className="max-w-md"
            data-ocid="dialog-reject-vacation"
          >
            <DialogHeader>
              <DialogTitle>Ferienantrag ablehnen</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <p className="text-sm text-muted-foreground">
                Sie können optional einen Kommentar angeben, der dem Mitarbeiter
                mitgeteilt wird.
              </p>
              <div className="space-y-1.5">
                <Label htmlFor="rejectAbsenceComment">
                  Kommentar (optional)
                </Label>
                <Textarea
                  id="rejectAbsenceComment"
                  placeholder="Begründung der Ablehnung…"
                  rows={3}
                  value={rejectAbsenceComment}
                  onChange={(e) => setRejectAbsenceComment(e.target.value)}
                  data-ocid="input-reject-absence-comment"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setRejectAbsenceId(null);
                  setRejectAbsenceComment("");
                }}
              >
                Abbrechen
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => {
                  if (rejectAbsenceId !== null) {
                    rejectAbsenceMutation.mutate({
                      id: rejectAbsenceId,
                      comment: rejectAbsenceComment,
                    });
                  }
                }}
                disabled={rejectAbsenceMutation.isPending}
                data-ocid="btn-confirm-reject-vacation"
              >
                {rejectAbsenceMutation.isPending
                  ? "Ablehnen…"
                  : "Ablehnen bestätigen"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ─── Dialog: Spesen ablehnen ──────────────────────────────── */}
        <Dialog
          open={rejectExpenseId !== null}
          onOpenChange={(open) => {
            if (!open) {
              setRejectExpenseId(null);
              setRejectExpenseComment("");
            }
          }}
        >
          <DialogContent className="max-w-md" data-ocid="dialog-reject-expense">
            <DialogHeader>
              <DialogTitle>Spesen ablehnen</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <p className="text-sm text-muted-foreground">
                Sie können optional einen Kommentar angeben.
              </p>
              <div className="space-y-1.5">
                <Label htmlFor="rejectExpenseComment">
                  Kommentar (optional)
                </Label>
                <Textarea
                  id="rejectExpenseComment"
                  placeholder="Begründung der Ablehnung…"
                  rows={3}
                  value={rejectExpenseComment}
                  onChange={(e) => setRejectExpenseComment(e.target.value)}
                  data-ocid="input-reject-expense-comment"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setRejectExpenseId(null);
                  setRejectExpenseComment("");
                }}
              >
                Abbrechen
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => {
                  if (rejectExpenseId !== null) {
                    rejectExpenseMutation.mutate({
                      id: rejectExpenseId,
                      comment: rejectExpenseComment,
                    });
                  }
                }}
                disabled={rejectExpenseMutation.isPending}
                data-ocid="btn-confirm-reject-expense"
              >
                {rejectExpenseMutation.isPending
                  ? "Ablehnen…"
                  : "Ablehnen bestätigen"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ─── Dialog: Ferienantrag zurücksetzen ────────────────────── */}
        <Dialog
          open={resetAbsenceId !== null}
          onOpenChange={(open) => {
            if (!open) {
              setResetAbsenceId(null);
              setResetAbsenceReason("");
            }
          }}
        >
          <DialogContent className="max-w-md" data-ocid="dialog-reset-vacation">
            <DialogHeader>
              <DialogTitle>Ferienantrag zurücksetzen</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <p className="text-sm text-muted-foreground">
                Der Status wird auf «Ausstehend» zurückgesetzt. Bitte geben Sie
                eine Begründung an.
              </p>
              <div className="space-y-1.5">
                <Label htmlFor="resetAbsenceReason">
                  Begründung <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="resetAbsenceReason"
                  placeholder="Begründung für das Zurücksetzen…"
                  rows={3}
                  value={resetAbsenceReason}
                  onChange={(e) => setResetAbsenceReason(e.target.value)}
                  data-ocid="input-reset-absence-reason"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setResetAbsenceId(null);
                  setResetAbsenceReason("");
                }}
              >
                Abbrechen
              </Button>
              <Button
                type="button"
                onClick={() => {
                  if (resetAbsenceId !== null && resetAbsenceReason.trim()) {
                    resetAbsenceMutation.mutate({
                      id: resetAbsenceId,
                      reason: resetAbsenceReason,
                    });
                  }
                }}
                disabled={
                  resetAbsenceMutation.isPending || !resetAbsenceReason.trim()
                }
                data-ocid="btn-confirm-reset-vacation"
              >
                {resetAbsenceMutation.isPending
                  ? "Zurücksetzen…"
                  : "Zurücksetzen bestätigen"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ─── Dialog: Spesen zurücksetzen ──────────────────────────── */}
        <Dialog
          open={resetExpenseId !== null}
          onOpenChange={(open) => {
            if (!open) {
              setResetExpenseId(null);
              setResetExpenseReason("");
            }
          }}
        >
          <DialogContent className="max-w-md" data-ocid="dialog-reset-expense">
            <DialogHeader>
              <DialogTitle>Spesen zurücksetzen</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <p className="text-sm text-muted-foreground">
                Der Status wird auf «Ausstehend» zurückgesetzt. Bitte geben Sie
                eine Begründung an.
              </p>
              <div className="space-y-1.5">
                <Label htmlFor="resetExpenseReason">
                  Begründung <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="resetExpenseReason"
                  placeholder="Begründung für das Zurücksetzen…"
                  rows={3}
                  value={resetExpenseReason}
                  onChange={(e) => setResetExpenseReason(e.target.value)}
                  data-ocid="input-reset-expense-reason"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setResetExpenseId(null);
                  setResetExpenseReason("");
                }}
              >
                Abbrechen
              </Button>
              <Button
                type="button"
                onClick={() => {
                  if (resetExpenseId !== null && resetExpenseReason.trim()) {
                    resetExpenseMutation.mutate({
                      id: resetExpenseId,
                      reason: resetExpenseReason,
                    });
                  }
                }}
                disabled={
                  resetExpenseMutation.isPending || !resetExpenseReason.trim()
                }
                data-ocid="btn-confirm-reset-expense"
              >
                {resetExpenseMutation.isPending
                  ? "Zurücksetzen…"
                  : "Zurücksetzen bestätigen"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
