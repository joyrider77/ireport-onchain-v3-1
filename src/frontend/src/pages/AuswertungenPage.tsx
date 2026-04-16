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
import { formatHours } from "@/lib/timeFormat";
import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";
import { BarChart2, Download, Search } from "lucide-react";
import { useState } from "react";
import { createActor } from "../backend";
import type {
  Employee,
  Expense,
  Project,
  ReportData,
  ServiceType,
  TimeEntry,
} from "../backend";
import { Layout } from "../components/Layout";
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

export default function AuswertungenPage() {
  const { actor, isFetching: actorFetching } = useActor(createActor);
  const { isAuthenticated, companyId, role } = useAuth();
  const isAdminOrManager = role === "admin" || role === "manager";

  const [dateFrom, setDateFrom] = useState(getFirstDayOfMonth());
  const [dateTo, setDateTo] = useState(getTodayString());
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [reportActive, setReportActive] = useState(false);
  const [queryKey, setQueryKey] = useState(0);

  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ["employees", companyId],
    queryFn: async () => {
      if (!actor) return [];
      return (await toAny(actor).listEmployees()) as Employee[];
    },
    enabled: !!actor && !actorFetching && isAuthenticated && isAdminOrManager,
  });

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["projects", companyId],
    queryFn: async () => {
      if (!actor) return [];
      return (await toAny(actor).listProjects()) as Project[];
    },
    enabled: !!actor && !actorFetching && isAuthenticated,
  });

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

  return (
    <Layout>
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between">
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
        </div>

        {/* Filter Card */}
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
            <div className="mt-4 flex justify-end">
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
            {/* Zeitauswertung */}
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
                          <TableHead className="text-right">Stunden</TableHead>
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
                            <TableCell>{svcName(t.serviceTypeId)}</TableCell>
                            <TableCell>
                              <Badge
                                variant={t.billable ? "default" : "secondary"}
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

            {/* Spesenauswertung */}
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
                    <p className="text-sm">Keine Spesen für diesen Zeitraum</p>
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
      </div>
    </Layout>
  );
}
