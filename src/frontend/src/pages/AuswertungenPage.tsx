import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatHours } from "@/lib/timeFormat";
import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart2,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Download,
  FileText,
  Search,
  Shield,
} from "lucide-react";
import { useState } from "react";
import { createActor } from "../backend";
import type {
  AuditLogEntry,
  Employee,
  Expense,
  Project,
  ReportData,
  ServiceType,
  TimeEntry,
} from "../backend";
import { AuditEntityType, AuditOperation } from "../backend";
import { Layout } from "../components/Layout";
import { MonatsrapportView } from "../components/MonatsrapportView";
import { ProjektauswertungView } from "../components/ProjektauswertungView";
import { useAuth } from "../hooks/useAuthStore";

type AnyActor = Record<string, (...args: unknown[]) => Promise<unknown>>;
const toAny = (a: unknown): AnyActor => a as AnyActor;

function getFirstDayOfMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}
function getTodayString(): string {
  return new Date().toISOString().slice(0, 10);
}
function formatDate(dateStr: string): string {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("de-CH");
}
function formatCHF(n: number): string {
  return n.toLocaleString("de-CH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function exportToCSV(
  timeRows: TimeEntry[],
  expenseRows: Expense[],
  employees: Employee[],
  projects: Project[],
  serviceTypes: ServiceType[],
  expenseTypes: { id: bigint; name: string }[],
) {
  const empName = (id: bigint) => {
    const e = employees.find((x) => x.id === id);
    return e ? `${e.firstName} ${e.lastName}` : String(id);
  };
  const projName = (id: bigint) =>
    projects.find((x) => x.id === id)?.name ?? String(id);
  const svcName = (id: bigint) =>
    serviceTypes.find((x) => x.id === id)?.name ?? String(id);
  const etName = (id: bigint) =>
    expenseTypes.find((x) => x.id === id)?.name ?? String(id);

  const timeHeader =
    "Mitarbeiter,Projekt,Datum,Stunden,Leistungsart,Verrechenbar";
  const timeLines = timeRows.map((t) =>
    [
      empName(t.employeeId),
      projName(t.projectId),
      t.date,
      formatHours(t.hours),
      svcName(t.serviceTypeId),
      t.billable ? "Ja" : "Nein",
    ].join(","),
  );

  const expHeader =
    "Mitarbeiter,Spesenart,Datum,Verrechenbar CHF,Rückerstattung CHF";
  const expLines = expenseRows.map((e) =>
    [
      empName(e.employeeId),
      etName(e.expenseTypeId),
      e.date,
      e.billableCHF,
      e.reimbursementCHF,
    ].join(","),
  );

  const csv = [timeHeader, ...timeLines, "", expHeader, ...expLines].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `auswertung_${getTodayString()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Audit badge helpers (outside component for clarity) ────────────
/**
 * Normalise an audit operation value to a simple lowercase string.
 * Handles:
 *   - AuditOperation enum strings: "create", "update", "delete"
 *   - Candid variant objects: { delete_: null }, { delete: null }, etc.
 *   - undefined / null from deserialization bugs
 *   - Any unexpected value — fallback to stringified raw value (never "Unbekannt")
 */
function normaliseOp(op: unknown): string {
  if (op === undefined || op === null) return "";
  // Already a string
  if (typeof op === "string") {
    const s = op.toLowerCase().replace(/_$/, "");
    // Map new backend variant name "remove" to "delete" for consistent badge handling
    return s === "remove" ? "delete" : s;
  }
  // Candid variant object: { remove: null } | { delete_: null } | { delete: null } | { create: null } | { update: null }
  if (typeof op === "object") {
    const keys = Object.keys(op as Record<string, unknown>);
    if (keys.length > 0) {
      // Normalise the key by stripping trailing underscore
      const key = keys[0].toLowerCase().replace(/_$/, "");
      // Map "remove" to "delete"
      return key === "remove" ? "delete" : key;
    }
  }
  return String(op).toLowerCase().replace(/_$/, "");
}

function getOperationLabel(op: unknown): string {
  const norm = normaliseOp(op);
  if (norm === "create") return "Erstellt";
  if (norm === "update") return "Bearbeitet";
  if (norm === "delete") return "Gelöscht";
  if (norm === "deactivate" || norm === "deactivated") return "Deaktiviert";
  if (norm === "approved" || norm === "approve") return "Genehmigt";
  if (norm === "rejected" || norm === "reject") return "Abgelehnt";
  // Fallback: show raw value so we never display "Unbekannt"
  if (!norm) return "(Unbekannt)";
  return norm.charAt(0).toUpperCase() + norm.slice(1);
}

function getOperationBadgeClass(op: unknown): string {
  const norm = normaliseOp(op);
  if (norm === "create")
    return "bg-green-100 text-green-800 border border-green-300";
  if (norm === "update")
    return "bg-blue-100 text-blue-800 border border-blue-300";
  if (norm === "delete") return "bg-red-100 text-red-800 border border-red-300";
  if (norm === "deactivate" || norm === "deactivated")
    return "bg-orange-100 text-orange-800 border border-orange-300";
  if (norm === "approved" || norm === "approve")
    return "bg-green-100 text-green-800 border border-green-300";
  if (norm === "rejected" || norm === "reject")
    return "bg-red-100 text-red-800 border border-red-300";
  return "bg-muted text-muted-foreground border border-border";
}

export default function AuswertungenPage() {
  const { actor, isFetching: actorFetching } = useActor(createActor);
  const { isAuthenticated, companyId, role, isPlatformAdmin } = useAuth();
  const isAdminOrManager = role === "admin" || role === "manager";
  const canSeeAudit = role === "admin" || isPlatformAdmin;
  const isMitarbeiter =
    role === "employee" || (!isAdminOrManager && role !== null);

  const [dateFrom, setDateFrom] = useState(getFirstDayOfMonth());
  const [dateTo, setDateTo] = useState(getTodayString());
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [reportActive, setReportActive] = useState(false);
  const [queryKey, setQueryKey] = useState(0);

  // Audit-Protokoll state
  const [auditDateFrom, setAuditDateFrom] = useState(getFirstDayOfMonth());
  const [auditDateTo, setAuditDateTo] = useState(getTodayString());
  const [auditOperation, setAuditOperation] = useState<string>("");
  const [auditBereich, setAuditBereich] = useState<string>("");
  const [auditUser, setAuditUser] = useState<string>("");
  const [auditQueryKey, setAuditQueryKey] = useState(0);
  const [auditExpanded, setAuditExpanded] = useState<Set<string>>(new Set());

  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ["employees", companyId],
    queryFn: async () => {
      if (!actor) return [];
      return (await toAny(actor).listEmployees()) as Employee[];
    },
    enabled: !!actor && !actorFetching && isAuthenticated && isAdminOrManager,
  });

  const { data: myEmployee } = useQuery<{ id: bigint } | null>({
    queryKey: ["myEmployee", companyId],
    queryFn: async () => {
      if (!actor) return null;
      const res = (await toAny(actor).getMyEmployee()) as {
        __kind__: string;
        ok?: { id: bigint };
      };
      if ("ok" in res && res.ok) return res.ok as { id: bigint };
      return null;
    },
    enabled: !!actor && !actorFetching && isAuthenticated,
  });

  const { data: allProjects = [] } = useQuery<Project[]>({
    queryKey: ["projects", companyId],
    queryFn: async () => {
      if (!actor) return [];
      return (await toAny(actor).listProjects()) as Project[];
    },
    enabled: !!actor && !actorFetching && isAuthenticated,
  });

  const { data: projectMemberships = new Map<string, boolean>() } = useQuery<
    Map<string, boolean>
  >({
    queryKey: ["myProjectMemberships", companyId, String(myEmployee?.id ?? "")],
    queryFn: async () => {
      if (!actor || !myEmployee) return new Map();
      const result = new Map<string, boolean>();
      await Promise.all(
        allProjects.map(async (proj) => {
          try {
            const res = (await toAny(actor).getProjectMembers(proj.id)) as {
              __kind__: string;
              ok?: Array<{ employeeId: bigint }>;
            };
            if (res.__kind__ === "ok" && res.ok) {
              const isMember = res.ok.some(
                (m) => String(m.employeeId) === String(myEmployee.id),
              );
              if (isMember) result.set(String(proj.id), true);
            }
          } catch {
            /* ignore */
          }
        }),
      );
      return result;
    },
    enabled:
      !!actor &&
      !actorFetching &&
      isAuthenticated &&
      isMitarbeiter &&
      !!myEmployee &&
      allProjects.length > 0,
  });

  const projects: Project[] = isAdminOrManager
    ? allProjects
    : allProjects.filter((p) => projectMemberships.has(String(p.id)));

  const { data: serviceTypes = [] } = useQuery<ServiceType[]>({
    queryKey: ["serviceTypes", companyId],
    queryFn: async () => {
      if (!actor) return [];
      return (await toAny(actor).listServiceTypes()) as ServiceType[];
    },
    enabled: !!actor && !actorFetching && isAuthenticated,
  });

  const { data: expenseTypes = [] } = useQuery<{ id: bigint; name: string }[]>({
    queryKey: ["expenseTypes", companyId],
    queryFn: async () => {
      if (!actor) return [];
      return (await toAny(actor).listExpenseTypes()) as {
        id: bigint;
        name: string;
      }[];
    },
    enabled: !!actor && !actorFetching && isAuthenticated,
  });

  const {
    data: reportData,
    isLoading,
    isFetching,
  } = useQuery<ReportData | null>({
    queryKey: [
      "reportData",
      queryKey,
      dateFrom,
      dateTo,
      selectedEmployee,
      selectedProject,
    ],
    queryFn: async () => {
      if (!actor) return null;
      const filter: Record<string, unknown> = { dateFrom, dateTo };
      if (selectedEmployee) filter.employeeId = BigInt(selectedEmployee);
      if (selectedProject) filter.projectId = BigInt(selectedProject);
      return (await toAny(actor).getReportData(filter)) as ReportData;
    },
    enabled: !!actor && !actorFetching && isAuthenticated && reportActive,
    staleTime: 0,
  });

  const handleLoad = () => {
    setReportActive(true);
    setQueryKey((k) => k + 1);
  };

  const timeEntries: TimeEntry[] = reportData?.entries ?? [];
  const expenseItems: Expense[] = reportData?.expenseItems ?? [];

  const totalHours = timeEntries.reduce((s, t) => s + t.hours, 0);
  const totalBillableHours = timeEntries
    .filter((t) => t.billable)
    .reduce((s, t) => s + t.hours, 0);
  const totalExpBillable = expenseItems.reduce((s, e) => s + e.billableCHF, 0);
  const totalExpReimbursable = expenseItems.reduce(
    (s, e) => s + e.reimbursementCHF,
    0,
  );

  const empName = (id: bigint) => {
    const e = employees.find((x) => x.id === id);
    return e ? `${e.firstName} ${e.lastName}` : String(id);
  };
  const projName = (id: bigint) =>
    projects.find((x) => x.id === id)?.name ?? String(id);
  const svcName = (id: bigint) =>
    serviceTypes.find((x) => x.id === id)?.name ?? "-";
  const expTypeName = (id: bigint) =>
    expenseTypes.find((x) => x.id === id)?.name ?? "-";

  const isLoadingReport = isLoading || isFetching;

  // ── Audit-Protokoll Query ──
  const {
    data: auditEntries = [],
    isLoading: auditLoading,
    refetch: refetchAudit,
  } = useQuery<AuditLogEntry[]>({
    queryKey: ["auditLog", auditQueryKey, companyId],
    queryFn: async () => {
      if (!actor) return [];
      const filter: {
        entityType?: AuditEntityType;
        operation?: AuditOperation;
      } = {};
      if (auditBereich) filter.entityType = auditBereich as AuditEntityType;
      if (auditOperation) filter.operation = auditOperation as AuditOperation;
      return (await toAny(actor).listAuditLogs(filter)) as AuditLogEntry[];
    },
    enabled: !!actor && !actorFetching && isAuthenticated && canSeeAudit,
    staleTime: 30000,
  });

  const filteredAuditEntries = auditEntries.filter((entry) => {
    const entryDate = new Date(Number(entry.timestamp) / 1_000_000)
      .toISOString()
      .slice(0, 10);
    if (auditDateFrom && entryDate < auditDateFrom) return false;
    if (auditDateTo && entryDate > auditDateTo) return false;
    if (
      auditUser &&
      !entry.actorName.toLowerCase().includes(auditUser.toLowerCase()) &&
      !entry.actorPrincipal.toLowerCase().includes(auditUser.toLowerCase())
    )
      return false;
    return true;
  });

  const distinctUsers = Array.from(
    new Set(auditEntries.map((e) => e.actorName || e.actorPrincipal)),
  ).filter(Boolean);

  function formatAuditTimestamp(ts: bigint): string {
    const d = new Date(Number(ts) / 1_000_000);
    return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
  }

  const ENTITY_TYPE_LABELS: Record<string, string> = {
    [AuditEntityType.holiday]: "Feiertage",
    [AuditEntityType.company]: "Firma",
    [AuditEntityType.employee]: "Mitarbeiter",
    [AuditEntityType.customer]: "Kunden",
    [AuditEntityType.project]: "Projekte",
    [AuditEntityType.serviceType]: "Leistungsarten",
    [AuditEntityType.expenseType]: "Spesenarten",
    [AuditEntityType.absenceType]: "Abwesenheitsarten",
    [AuditEntityType.invoiceTemplate]: "Rechnungsvorlagen",
    [AuditEntityType.timeEntry]: "Zeiterfassung",
    [AuditEntityType.expense]: "Spesen",
    [AuditEntityType.absence]: "Absenzen",
    [AuditEntityType.ferien]: "Ferien",
    [AuditEntityType.approval]: "Genehmigungen",
  };

  function exportAuditCSV() {
    const header =
      "Zeitstempel,Operation,Bereich,Datensatz-ID,Benutzer,Principal-ID,Vorher,Nachher";
    const lines = filteredAuditEntries.map((e) => {
      return [
        formatAuditTimestamp(e.timestamp),
        getOperationLabel(e.operation),
        ENTITY_TYPE_LABELS[e.entityType] ?? e.entityType,
        e.entityId,
        e.actorName || e.actorPrincipal,
        e.actorPrincipal,
        e.beforeState ?? "",
        e.afterState ?? "",
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",");
    });
    const csv = [header, ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Audit-Protokoll_${getTodayString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function toggleAuditExpand(id: string) {
    setAuditExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <Layout>
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <BarChart2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-semibold text-foreground">
              Auswertungen
            </h1>
            <p className="text-sm text-muted-foreground">
              Zeiten und Spesen auswerten und exportieren
            </p>
          </div>
        </div>

        <Tabs defaultValue="auswertung" data-ocid="auswertungen.tabs">
          <TabsList>
            <TabsTrigger
              value="auswertung"
              data-ocid="auswertungen.tab.auswertung"
            >
              <BarChart2 className="w-4 h-4 mr-1.5" />
              Auswertung
            </TabsTrigger>
            <TabsTrigger
              value="monatsrapport"
              data-ocid="auswertungen.tab.monatsrapport"
            >
              <FileText className="w-4 h-4 mr-1.5" />
              Monatsrapport
            </TabsTrigger>
            <TabsTrigger
              value="projektauswertung"
              data-ocid="auswertungen.tab.projektauswertung"
            >
              <ClipboardList className="w-4 h-4 mr-1.5" />
              Projektauswertung
            </TabsTrigger>
            {canSeeAudit && (
              <TabsTrigger value="audit" data-ocid="auswertungen.tab.audit">
                <Shield className="w-4 h-4 mr-1.5" />
                Audit-Protokoll
              </TabsTrigger>
            )}
          </TabsList>

          {/* ─── Tab 1: Auswertung ─── */}
          <TabsContent value="auswertung" className="space-y-6 mt-4">
            <Card className="shadow-card">
              <CardContent className="pt-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="dateFrom">Datum von</Label>
                    <Input
                      id="dateFrom"
                      data-ocid="filter-date-from"
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="dateTo">Datum bis</Label>
                    <Input
                      id="dateTo"
                      data-ocid="filter-date-to"
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                    />
                  </div>
                  {isAdminOrManager && (
                    <div className="space-y-1.5">
                      <Label htmlFor="filterEmployee">Mitarbeiter</Label>
                      <select
                        id="filterEmployee"
                        data-ocid="filter-employee"
                        value={selectedEmployee}
                        onChange={(e) => setSelectedEmployee(e.target.value)}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        <option value="">Alle Mitarbeiter</option>
                        {employees.map((emp) => (
                          <option key={String(emp.id)} value={String(emp.id)}>
                            {emp.firstName} {emp.lastName}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <Label htmlFor="filterProject">Projekt</Label>
                    <select
                      id="filterProject"
                      data-ocid="filter-project"
                      value={selectedProject}
                      onChange={(e) => setSelectedProject(e.target.value)}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value="">Alle Projekte</option>
                      {projects.map((p) => (
                        <option key={String(p.id)} value={String(p.id)}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mt-4 flex justify-between items-center">
                  {reportActive &&
                    (timeEntries.length > 0 || expenseItems.length > 0) && (
                      <Button
                        type="button"
                        data-ocid="btn-csv-export"
                        onClick={() =>
                          exportToCSV(
                            timeEntries,
                            expenseItems,
                            employees,
                            projects,
                            serviceTypes,
                            expenseTypes,
                          )
                        }
                        variant="outline"
                        className="gap-2"
                      >
                        <Download className="w-4 h-4" />
                        CSV exportieren
                      </Button>
                    )}
                  {!(
                    reportActive &&
                    (timeEntries.length > 0 || expenseItems.length > 0)
                  ) && <div />}
                  <Button
                    type="button"
                    data-ocid="btn-load-report"
                    onClick={handleLoad}
                    className="gap-2"
                  >
                    <Search className="w-4 h-4" />
                    Auswertung laden
                  </Button>
                </div>
              </CardContent>
            </Card>

            {isLoadingReport && (
              <div className="space-y-4">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-48 w-full" />
              </div>
            )}

            {!isLoadingReport && reportActive && (
              <>
                <Card className="shadow-card">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-semibold">
                        Zeitauswertung
                      </CardTitle>
                      <Badge variant="secondary">
                        {timeEntries.length} Einträge
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    {timeEntries.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
                        <BarChart2 className="w-8 h-8 opacity-40" />
                        <p className="text-sm">
                          Keine Zeiteinträge für diesen Zeitraum
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/40">
                              <TableHead>Mitarbeiter</TableHead>
                              <TableHead>Projekt</TableHead>
                              <TableHead>Datum</TableHead>
                              <TableHead className="text-right">
                                Stunden
                              </TableHead>
                              <TableHead>Leistungsart</TableHead>
                              <TableHead>Verrechenbar</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {timeEntries.map((t) => (
                              <TableRow
                                key={String(t.id)}
                                data-ocid={`time-row-${String(t.id)}`}
                              >
                                <TableCell className="font-medium">
                                  {empName(t.employeeId)}
                                </TableCell>
                                <TableCell>{projName(t.projectId)}</TableCell>
                                <TableCell>{formatDate(t.date)}</TableCell>
                                <TableCell className="text-right tabular-nums">
                                  {formatHours(t.hours)}
                                </TableCell>
                                <TableCell>
                                  {svcName(t.serviceTypeId)}
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant={
                                      t.billable ? "default" : "secondary"
                                    }
                                  >
                                    {t.billable ? "Ja" : "Nein"}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                            <TableRow className="bg-muted/50 border-t-2">
                              <TableCell colSpan={3} className="font-semibold">
                                Gesamt
                              </TableCell>
                              <TableCell className="text-right tabular-nums font-semibold">
                                {formatHours(totalHours)}
                              </TableCell>
                              <TableCell />
                              <TableCell>
                                <span className="text-xs text-muted-foreground">
                                  {formatHours(totalBillableHours)} verrechenbar
                                </span>
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="shadow-card">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-semibold">
                        Spesenauswertung
                      </CardTitle>
                      <Badge variant="secondary">
                        {expenseItems.length} Einträge
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    {expenseItems.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
                        <BarChart2 className="w-8 h-8 opacity-40" />
                        <p className="text-sm">
                          Keine Spesen für diesen Zeitraum
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/40">
                              <TableHead>Mitarbeiter</TableHead>
                              <TableHead>Spesenart</TableHead>
                              <TableHead>Datum</TableHead>
                              <TableHead className="text-right">
                                Verrechenbar CHF
                              </TableHead>
                              <TableHead className="text-right">
                                Rückerstattung CHF
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {expenseItems.map((e) => (
                              <TableRow
                                key={String(e.id)}
                                data-ocid={`expense-row-${String(e.id)}`}
                              >
                                <TableCell className="font-medium">
                                  {empName(e.employeeId)}
                                </TableCell>
                                <TableCell>
                                  {expTypeName(e.expenseTypeId)}
                                </TableCell>
                                <TableCell>{formatDate(e.date)}</TableCell>
                                <TableCell className="text-right tabular-nums">
                                  {formatCHF(e.billableCHF)}
                                </TableCell>
                                <TableCell className="text-right tabular-nums">
                                  {formatCHF(e.reimbursementCHF)}
                                </TableCell>
                              </TableRow>
                            ))}
                            <TableRow className="bg-muted/50 border-t-2">
                              <TableCell colSpan={3} className="font-semibold">
                                Gesamt
                              </TableCell>
                              <TableCell className="text-right tabular-nums font-semibold">
                                {formatCHF(totalExpBillable)}
                              </TableCell>
                              <TableCell className="text-right tabular-nums font-semibold">
                                {formatCHF(totalExpReimbursable)}
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}

            {!isLoadingReport && !reportActive && (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
                <div className="w-16 h-16 rounded-full bg-muted/60 flex items-center justify-center">
                  <BarChart2 className="w-8 h-8 opacity-50" />
                </div>
                <p className="text-sm font-medium">
                  Filter setzen und «Auswertung laden» klicken
                </p>
              </div>
            )}
          </TabsContent>

          {/* ─── Tab 2: Monatsrapport ─── */}
          <TabsContent value="monatsrapport" className="mt-4">
            <MonatsrapportView
              employees={employees}
              isAdminOrManager={isAdminOrManager}
            />
          </TabsContent>

          {/* ─── Tab 3: Projektauswertung ─── */}
          <TabsContent value="projektauswertung" className="mt-4">
            <ProjektauswertungView
              employees={employees}
              allProjects={allProjects}
              projectMemberships={projectMemberships}
              isAdminOrManager={isAdminOrManager}
            />
          </TabsContent>

          {/* ─── Tab 4: Audit-Protokoll ─── */}
          {canSeeAudit && (
            <TabsContent value="audit" className="space-y-6 mt-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Audit-Protokoll
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Protokollierte Datenänderungen in Stammdaten, Zeiterfassung
                  und Spesen
                </p>
              </div>

              <Card className="shadow-card">
                <CardContent className="pt-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="auditDateFrom">Von</Label>
                      <Input
                        id="auditDateFrom"
                        data-ocid="audit.filter-date-from"
                        type="date"
                        value={auditDateFrom}
                        onChange={(e) => setAuditDateFrom(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="auditDateTo">Bis</Label>
                      <Input
                        id="auditDateTo"
                        data-ocid="audit.filter-date-to"
                        type="date"
                        value={auditDateTo}
                        onChange={(e) => setAuditDateTo(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="auditOperation">Operation</Label>
                      <select
                        id="auditOperation"
                        data-ocid="audit.filter-operation"
                        value={auditOperation}
                        onChange={(e) => setAuditOperation(e.target.value)}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        <option value="">Alle Operationen</option>
                        <option value={AuditOperation.create}>Erstellt</option>
                        <option value={AuditOperation.update}>
                          Bearbeitet
                        </option>
                        <option value={AuditOperation.remove}>Gelöscht</option>
                        <option value={AuditOperation.delete_}>
                          Gelöscht (alt)
                        </option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="auditBereich">Bereich</Label>
                      <select
                        id="auditBereich"
                        data-ocid="audit.filter-bereich"
                        value={auditBereich}
                        onChange={(e) => setAuditBereich(e.target.value)}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        <option value="">Alle Bereiche</option>
                        {Object.entries(ENTITY_TYPE_LABELS).map(
                          ([val, label]) => (
                            <option key={val} value={val}>
                              {label}
                            </option>
                          ),
                        )}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="auditUser">Benutzer</Label>
                      <select
                        id="auditUser"
                        data-ocid="audit.filter-user"
                        value={auditUser}
                        onChange={(e) => setAuditUser(e.target.value)}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        <option value="">Alle Benutzer</option>
                        {distinctUsers.map((u) => (
                          <option key={u} value={u}>
                            {u.length > 30
                              ? `${u.slice(0, 20)}\u2026${u.slice(-6)}`
                              : u}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <Button
                      type="button"
                      data-ocid="audit.btn-export-csv"
                      variant="outline"
                      className="gap-2"
                      onClick={exportAuditCSV}
                      disabled={filteredAuditEntries.length === 0}
                    >
                      <Download className="w-4 h-4" />
                      CSV exportieren
                    </Button>
                    <Button
                      type="button"
                      data-ocid="audit.btn-filter"
                      className="gap-2"
                      onClick={() => {
                        setAuditQueryKey((k) => k + 1);
                        void refetchAudit();
                      }}
                    >
                      <Search className="w-4 h-4" />
                      Aktualisieren
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {auditLoading && (
                <div className="space-y-3">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              )}

              {!auditLoading && (
                <Card className="shadow-card">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-semibold">
                        Protokolleinträge
                      </CardTitle>
                      <Badge variant="secondary">
                        {filteredAuditEntries.length} Einträge
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    {filteredAuditEntries.length === 0 ? (
                      <div
                        className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2"
                        data-ocid="audit.empty_state"
                      >
                        <Shield className="w-8 h-8 opacity-40" />
                        <p className="text-sm">
                          Keine Protokolleinträge für diesen Zeitraum
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/40">
                              <TableHead className="w-8" />
                              <TableHead>Zeitstempel</TableHead>
                              <TableHead>Operation</TableHead>
                              <TableHead>Bereich</TableHead>
                              <TableHead>Datensatz-ID</TableHead>
                              <TableHead>Benutzer</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredAuditEntries.map((entry, idx) => {
                              const key = `${entry.id}-${idx}`;
                              const expanded = auditExpanded.has(key);
                              return (
                                <>
                                  <TableRow
                                    key={key}
                                    data-ocid={`audit.item.${idx + 1}`}
                                    className="cursor-pointer hover:bg-muted/30"
                                    onClick={() => toggleAuditExpand(key)}
                                  >
                                    <TableCell className="py-2">
                                      {expanded ? (
                                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                      ) : (
                                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                      )}
                                    </TableCell>
                                    <TableCell className="font-mono text-xs tabular-nums whitespace-nowrap">
                                      {formatAuditTimestamp(entry.timestamp)}
                                    </TableCell>
                                    <TableCell>
                                      <Badge
                                        className={`text-xs ${getOperationBadgeClass(entry.operation)}`}
                                      >
                                        {getOperationLabel(entry.operation)}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="text-sm">
                                      {ENTITY_TYPE_LABELS[entry.entityType] ??
                                        entry.entityType}
                                    </TableCell>
                                    <TableCell className="font-mono text-xs">
                                      {entry.entityId}
                                    </TableCell>
                                    <TableCell className="text-xs max-w-[160px]">
                                      {entry.actorName ? (
                                        <span
                                          title={entry.actorPrincipal}
                                          className="cursor-default border-b border-dashed border-muted-foreground/40"
                                        >
                                          {entry.actorName}
                                        </span>
                                      ) : (
                                        <span
                                          title={entry.actorPrincipal}
                                          className="font-mono cursor-default"
                                        >
                                          {entry.actorPrincipal.length > 20
                                            ? `${entry.actorPrincipal.slice(0, 10)}\u2026${entry.actorPrincipal.slice(-6)}`
                                            : entry.actorPrincipal}
                                        </span>
                                      )}
                                    </TableCell>
                                  </TableRow>
                                  {expanded && (
                                    <TableRow
                                      key={`${key}-detail`}
                                      className="bg-muted/20"
                                    >
                                      <TableCell />
                                      <TableCell
                                        colSpan={5}
                                        className="pb-3 pt-1"
                                      >
                                        {(() => {
                                          const fc = (
                                            entry as AuditLogEntry & {
                                              fieldChanges?: Array<{
                                                fieldName: string;
                                                before: string;
                                                after: string;
                                              }>;
                                            }
                                          ).fieldChanges;
                                          if (fc && fc.length > 0) {
                                            return (
                                              <div className="space-y-1.5 text-xs">
                                                <p className="font-semibold text-muted-foreground uppercase tracking-wide text-[10px]">
                                                  Geänderte Felder
                                                </p>
                                                <div className="space-y-1">
                                                  {fc.map((change) => (
                                                    <div
                                                      key={`${change.fieldName}-${change.before}`}
                                                      className="flex items-start gap-1.5 p-1.5 rounded bg-background border border-border/60"
                                                    >
                                                      <span className="font-medium text-foreground min-w-[100px] flex-shrink-0">
                                                        {change.fieldName}:
                                                      </span>
                                                      <span className="text-destructive line-through break-words min-w-0">
                                                        {change.before ||
                                                          "\u2014"}
                                                      </span>
                                                      <span className="text-muted-foreground flex-shrink-0">
                                                        \u2192
                                                      </span>
                                                      <span className="text-emerald-700 break-words min-w-0">
                                                        {change.after ||
                                                          "\u2014"}
                                                      </span>
                                                    </div>
                                                  ))}
                                                </div>
                                              </div>
                                            );
                                          }
                                          return (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                              <div className="space-y-1">
                                                <p className="font-semibold text-muted-foreground uppercase tracking-wide text-[10px]">
                                                  Vorher
                                                </p>
                                                <pre className="p-2 rounded bg-background border border-border text-xs whitespace-pre-wrap break-words max-h-32 overflow-auto">
                                                  {entry.beforeState ||
                                                    "\u2014"}
                                                </pre>
                                              </div>
                                              <div className="space-y-1">
                                                <p className="font-semibold text-muted-foreground uppercase tracking-wide text-[10px]">
                                                  Nachher
                                                </p>
                                                <pre className="p-2 rounded bg-background border border-border text-xs whitespace-pre-wrap break-words max-h-32 overflow-auto">
                                                  {entry.afterState || "\u2014"}
                                                </pre>
                                              </div>
                                            </div>
                                          );
                                        })()}
                                      </TableCell>
                                    </TableRow>
                                  )}
                                </>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          )}
        </Tabs>
      </div>
    </Layout>
  );
}
