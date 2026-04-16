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
import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, FileText, Search } from "lucide-react";
import { useState } from "react";
import { createActor } from "../backend";
import type {
  Customer,
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

interface BillableGroup {
  customerId: bigint;
  customerName: string;
  projectId: bigint;
  projectName: string;
  hours: number;
  billableRate: number;
  amountCHF: number;
  expensesCHF: number;
  totalCHF: number;
}

function buildGroups(
  timeEntries: TimeEntry[],
  expenses: Expense[],
  projects: Project[],
  customers: Customer[],
): BillableGroup[] {
  const projMap = new Map(projects.map((p) => [String(p.id), p]));
  const custMap = new Map(customers.map((c) => [String(c.id), c]));
  const groupMap = new Map<string, BillableGroup>();

  for (const t of timeEntries.filter((te) => te.billable)) {
    const p = projMap.get(String(t.projectId));
    if (!p) continue;
    const c = custMap.get(String(p.customerId));
    const key = `${String(p.customerId)}_${String(t.projectId)}`;
    if (!groupMap.has(key)) {
      groupMap.set(key, {
        customerId: p.customerId,
        customerName: c?.name ?? String(p.customerId),
        projectId: t.projectId,
        projectName: p.name,
        hours: 0,
        billableRate: p.billableRate,
        amountCHF: 0,
        expensesCHF: 0,
        totalCHF: 0,
      });
    }
    const g = groupMap.get(key)!;
    g.hours += t.hours;
    g.amountCHF = g.hours * g.billableRate;
  }

  for (const e of expenses.filter((ex) => ex.billableCHF > 0)) {
    const t = timeEntries.find((te) => te.employeeId === e.employeeId);
    if (!t) continue;
    const p = projMap.get(String(t.projectId));
    if (!p) continue;
    const c = custMap.get(String(p.customerId));
    const key = `${String(p.customerId)}_${String(t.projectId)}`;
    if (!groupMap.has(key)) {
      groupMap.set(key, {
        customerId: p.customerId,
        customerName: c?.name ?? String(p.customerId),
        projectId: t.projectId,
        projectName: p.name,
        hours: 0,
        billableRate: p.billableRate,
        amountCHF: 0,
        expensesCHF: 0,
        totalCHF: 0,
      });
    }
    groupMap.get(key)!.expensesCHF += e.billableCHF;
  }

  for (const g of groupMap.values()) {
    g.totalCHF = g.amountCHF + g.expensesCHF;
  }

  return Array.from(groupMap.values()).sort((a, b) =>
    a.customerName.localeCompare(b.customerName, "de"),
  );
}

export default function FakturierungPage() {
  const { actor, isFetching: actorFetching } = useActor(createActor);
  const { isAuthenticated, companyId } = useAuth();

  const [dateFrom, setDateFrom] = useState(getFirstDayOfMonth());
  const [dateTo, setDateTo] = useState(getTodayString());
  const [selectedCustomer, setSelectedCustomer] = useState<string>("");
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [reportActive, setReportActive] = useState(false);
  const [queryKey, setQueryKey] = useState(0);

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["projects", companyId],
    queryFn: async () => {
      if (!actor) return [];
      return (await toAny(actor).listProjects()) as Project[];
    },
    enabled: !!actor && !actorFetching && isAuthenticated,
  });

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["customers", companyId],
    queryFn: async () => {
      if (!actor) return [];
      return (await toAny(actor).listCustomers()) as Customer[];
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
      "fakturierungReport",
      queryKey,
      dateFrom,
      dateTo,
      selectedCustomer,
      selectedProject,
    ],
    queryFn: async () => {
      if (!actor) return null;
      const filter: Record<string, unknown> = { dateFrom, dateTo };
      if (selectedCustomer) filter.customerId = BigInt(selectedCustomer);
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
  const billableExpenses = expenseItems.filter((e) => e.billableCHF > 0);

  const filteredProjects = selectedCustomer
    ? projects.filter((p) => String(p.customerId) === selectedCustomer)
    : projects;

  const groups = buildGroups(timeEntries, expenseItems, projects, customers);
  const grandTotalHours = groups.reduce((s, g) => s + g.hours, 0);
  const grandTotalAmount = groups.reduce((s, g) => s + g.amountCHF, 0);
  const grandTotalExpenses = groups.reduce((s, g) => s + g.expensesCHF, 0);
  const grandTotal = groups.reduce((s, g) => s + g.totalCHF, 0);

  const expTypeName = (id: bigint) =>
    expenseTypes.find((x) => x.id === id)?.name ?? "-";
  const projName = (id: bigint) =>
    projects.find((x) => x.id === id)?.name ?? String(id);

  const isLoadingReport = isLoading || isFetching;

  // serviceTypes used for future enhancement — suppress unused warning via void
  void serviceTypes;

  return (
    <Layout>
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-semibold text-foreground">
              Fakturierung
            </h1>
            <p className="text-sm text-muted-foreground">
              Verrechenbare Leistungen und Spesen im Überblick
            </p>
          </div>
        </div>

        {/* PDF Info Banner */}
        <div
          data-ocid="pdf-info-banner"
          className="flex items-start gap-3 p-4 rounded-lg border border-primary/20 bg-primary/5"
        >
          <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <p className="text-sm text-foreground">
            PDF-Rechnungserstellung ist in Vorbereitung und wird in einer
            zukünftigen Version verfügbar sein.
          </p>
        </div>

        {/* Filter Card */}
        <Card className="shadow-card">
          <CardContent className="pt-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="dateFromF">Datum von</Label>
                <Input
                  id="dateFromF"
                  data-ocid="filter-date-from"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dateToF">Datum bis</Label>
                <Input
                  id="dateToF"
                  data-ocid="filter-date-to"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="filterCustomer">Kunde</Label>
                <select
                  id="filterCustomer"
                  data-ocid="filter-customer"
                  value={selectedCustomer}
                  onChange={(e) => {
                    setSelectedCustomer(e.target.value);
                    setSelectedProject("");
                  }}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">Alle Kunden</option>
                  {customers.map((c) => (
                    <option key={String(c.id)} value={String(c.id)}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="filterProjectF">Projekt</Label>
                <select
                  id="filterProjectF"
                  data-ocid="filter-project"
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">Alle Projekte</option>
                  {filteredProjects.map((p) => (
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
                data-ocid="btn-load-invoicing"
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
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        )}

        {!isLoadingReport && reportActive && (
          <>
            {/* Verrechenbare Leistungen */}
            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold">
                    Verrechenbare Leistungen
                  </CardTitle>
                  <Badge variant="secondary">{groups.length} Positionen</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {groups.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
                    <FileText className="w-8 h-8 opacity-40" />
                    <p className="text-sm">
                      Keine verrechenbaren Leistungen für diesen Zeitraum
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/40">
                          <TableHead>Kunde</TableHead>
                          <TableHead>Projekt</TableHead>
                          <TableHead className="text-right">Stunden</TableHead>
                          <TableHead className="text-right">
                            Stundensatz CHF
                          </TableHead>
                          <TableHead className="text-right">
                            Betrag CHF
                          </TableHead>
                          <TableHead className="text-right">
                            Spesen CHF
                          </TableHead>
                          <TableHead className="text-right">
                            Gesamt CHF
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {groups.map((g) => (
                          <TableRow
                            key={`${String(g.customerId)}_${String(g.projectId)}`}
                            data-ocid={`billing-row-${String(g.projectId)}`}
                          >
                            <TableCell className="font-medium">
                              {g.customerName}
                            </TableCell>
                            <TableCell>{g.projectName}</TableCell>
                            <TableCell className="text-right tabular-nums">
                              {g.hours.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                              {formatCHF(g.billableRate)}
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                              {formatCHF(g.amountCHF)}
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                              {formatCHF(g.expensesCHF)}
                            </TableCell>
                            <TableCell className="text-right tabular-nums font-semibold text-primary">
                              {formatCHF(g.totalCHF)}
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="bg-muted/50 border-t-2">
                          <TableCell colSpan={2} className="font-semibold">
                            Gesamt
                          </TableCell>
                          <TableCell className="text-right tabular-nums font-semibold">
                            {grandTotalHours.toFixed(2)}
                          </TableCell>
                          <TableCell />
                          <TableCell className="text-right tabular-nums font-semibold">
                            {formatCHF(grandTotalAmount)}
                          </TableCell>
                          <TableCell className="text-right tabular-nums font-semibold">
                            {formatCHF(grandTotalExpenses)}
                          </TableCell>
                          <TableCell className="text-right tabular-nums font-bold text-primary">
                            {formatCHF(grandTotal)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Verrechenbare Spesen */}
            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold">
                    Verrechenbare Spesen
                  </CardTitle>
                  <Badge variant="secondary">
                    {billableExpenses.length} Einträge
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {billableExpenses.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
                    <FileText className="w-8 h-8 opacity-40" />
                    <p className="text-sm">
                      Keine verrechenbaren Spesen für diesen Zeitraum
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/40">
                          <TableHead>Spesenart</TableHead>
                          <TableHead>Projekt</TableHead>
                          <TableHead>Datum</TableHead>
                          <TableHead>Beschreibung</TableHead>
                          <TableHead className="text-right">
                            Verrechenbar CHF
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {billableExpenses.map((e) => {
                          const t = timeEntries.find(
                            (te) => te.employeeId === e.employeeId,
                          );
                          return (
                            <TableRow
                              key={String(e.id)}
                              data-ocid={`billable-expense-row-${String(e.id)}`}
                            >
                              <TableCell>
                                {expTypeName(e.expenseTypeId)}
                              </TableCell>
                              <TableCell>
                                {t ? projName(t.projectId) : "-"}
                              </TableCell>
                              <TableCell>{formatDate(e.date)}</TableCell>
                              <TableCell className="max-w-[200px] truncate text-muted-foreground">
                                {e.description || "-"}
                              </TableCell>
                              <TableCell className="text-right tabular-nums font-medium">
                                {formatCHF(e.billableCHF)}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                        <TableRow className="bg-muted/50 border-t-2">
                          <TableCell colSpan={4} className="font-semibold">
                            Gesamt Spesen
                          </TableCell>
                          <TableCell className="text-right tabular-nums font-bold text-primary">
                            {formatCHF(
                              billableExpenses.reduce(
                                (s, e) => s + e.billableCHF,
                                0,
                              ),
                            )}
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
              <FileText className="w-8 h-8 opacity-50" />
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
