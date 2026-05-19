import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import {
  AlertCircle,
  ChevronDown,
  ChevronRight,
  FileText,
  Plus,
  Receipt,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { createActor } from "../backend";
import type {
  Customer,
  Employee,
  Expense,
  Invoice,
  InvoiceStatus,
  Project,
  ProjectMemberAssignment,
  TimeEntry,
} from "../backend";
import { Layout } from "../components/Layout";
import { useAuth } from "../hooks/useAuthStore";

type AnyActor = Record<string, (...args: unknown[]) => Promise<unknown>>;
const toAny = (a: unknown): AnyActor => a as AnyActor;

// ─── Formatters ───────────────────────────────────────────────────────────────
function formatDateCH(dateStr: string): string {
  if (!dateStr) return "-";
  const [y, m, d] = dateStr.split("-");
  return `${d}.${m}.${y}`;
}
function formatCurrency(n: number, currency = "CHF"): string {
  return `${n.toLocaleString("de-CH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
}
function formatHours(h: number): string {
  const hh = Math.floor(h);
  const mm = Math.round((h - hh) * 60);
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}
function getFirstDayOfMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}
function getTodayString(): string {
  return new Date().toISOString().slice(0, 10);
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
const statusConfig: Record<string, { label: string; className: string }> = {
  entwurf: { label: "Entwurf", className: "bg-muted text-muted-foreground" },
  versendet: { label: "Versendet", className: "bg-blue-100 text-blue-700" },
  bezahlt: { label: "Bezahlt", className: "bg-green-100 text-green-700" },
  storniert: { label: "Storniert", className: "bg-red-100 text-red-700" },
  ueberfaellig: {
    label: "Überfällig",
    className: "bg-orange-100 text-orange-700",
  },
};
function StatusBadge({ status }: { status: InvoiceStatus }) {
  const cfg = statusConfig[status] ?? statusConfig.entwurf;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${cfg.className}`}
    >
      {cfg.label}
    </span>
  );
}

// ─── Unbilled Entry types ─────────────────────────────────────────────────────
interface UnbilledEntry {
  id: bigint;
  typ: "zeiteintrag" | "spese";
  employeeId: bigint;
  employeeName: string;
  projectId: bigint;
  projectName: string;
  customerId: bigint;
  customerName: string;
  date: string;
  description: string;
  hours?: number;
  stundensatz?: number;
  betragCHF?: number;
  totalCHF: number;
}

interface SelectionKey {
  id: bigint;
  typ: "zeiteintrag" | "spese";
}

// ─── View 1: Unfakturierte Leistungen ─────────────────────────────────────────
function UnfakturiertView({
  actor,
  actorFetching,
  isAuthenticated,
  projects,
  customers,
  employees,
  projectMembersMap,
  onCreatedMultiKunde,
}: {
  actor: unknown;
  actorFetching: boolean;
  isAuthenticated: boolean;
  projects: Project[];
  customers: Customer[];
  employees: Employee[];
  projectMembersMap: Map<string, ProjectMemberAssignment[]>;
  onCreatedMultiKunde?: () => void;
}) {
  const navigate = useNavigate();
  const [filterKunde, setFilterKunde] = useState("");
  const [filterProjekt, setFilterProjekt] = useState("");
  const [filterMitarbeiter, setFilterMitarbeiter] = useState("");
  const [dateFrom, setDateFrom] = useState(getFirstDayOfMonth());
  const [dateTo, setDateTo] = useState(getTodayString());
  const [selected, setSelected] = useState<SelectionKey[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const projMap = useMemo(
    () => new Map(projects.map((p) => [String(p.id), p])),
    [projects],
  );
  const custMap = useMemo(
    () => new Map(customers.map((c) => [String(c.id), c])),
    [customers],
  );
  const empMap = useMemo(
    () =>
      new Map(
        employees.map((e) => [String(e.id), `${e.firstName} ${e.lastName}`]),
      ),
    [employees],
  );

  const { data: unbilled, isLoading } = useQuery({
    queryKey: ["unbilled"],
    queryFn: async () => {
      if (!actor)
        return { zeiteintraege: [] as TimeEntry[], spesen: [] as Expense[] };
      const res = (await toAny(actor).getUnbilledEntries(null)) as {
        __kind__: string;
        ok?: { zeiteintraege: TimeEntry[]; spesen: Expense[] };
        err?: string;
      };
      if (res.__kind__ === "ok" && res.ok) return res.ok;
      return { zeiteintraege: [] as TimeEntry[], spesen: [] as Expense[] };
    },
    enabled: !!actor && !actorFetching && isAuthenticated,
  });

  const entries = useMemo((): UnbilledEntry[] => {
    const result: UnbilledEntry[] = [];
    const ze = unbilled?.zeiteintraege ?? [];
    const sp = unbilled?.spesen ?? [];

    for (const t of ze) {
      const proj = projMap.get(String(t.projectId));
      const cust = proj ? custMap.get(String(proj.customerId)) : undefined;
      // Look up stundensatz from ProjectMemberAssignment (employeeId + serviceTypeId)
      const members = projectMembersMap.get(String(t.projectId)) ?? [];
      const assignment = members.find(
        (m) =>
          String(m.employeeId) === String(t.employeeId) &&
          String(m.serviceTypeId) === String(t.serviceTypeId),
      );
      const stundensatz = assignment?.stundensatz ?? 0;
      result.push({
        id: t.id,
        typ: "zeiteintrag",
        employeeId: t.employeeId,
        employeeName: empMap.get(String(t.employeeId)) ?? String(t.employeeId),
        projectId: t.projectId,
        projectName: proj?.name ?? String(t.projectId),
        customerId: proj?.customerId ?? BigInt(0),
        customerName: cust?.name ?? "-",
        date: t.date,
        description: t.description,
        hours: t.hours,
        stundensatz,
        totalCHF: t.hours * stundensatz,
      });
    }
    for (const e of sp) {
      // Only show approved expenses with a billable amount > 0
      if (e.status !== "approved") continue;
      if (!e.billableCHF || e.billableCHF <= 0) continue;

      const proj = e.projektId ? projMap.get(String(e.projektId)) : undefined;
      const cust = e.kundeId
        ? custMap.get(String(e.kundeId))
        : proj
          ? custMap.get(String(proj.customerId))
          : undefined;
      result.push({
        id: e.id,
        typ: "spese",
        employeeId: e.employeeId,
        employeeName: empMap.get(String(e.employeeId)) ?? String(e.employeeId),
        projectId: e.projektId ?? BigInt(0),
        projectName: proj?.name ?? "-",
        customerId: e.kundeId ?? proj?.customerId ?? BigInt(0),
        customerName: cust?.name ?? "-",
        date: e.date,
        description: e.description,
        betragCHF: e.billableCHF,
        totalCHF: e.billableCHF,
      });
    }
    return result;
  }, [unbilled, projMap, custMap, empMap, projectMembersMap]);

  // Filter entries by date range
  const dateFiltered = useMemo(() => {
    return entries.filter((e) => {
      if (dateFrom && e.date < dateFrom) return false;
      if (dateTo && e.date > dateTo) return false;
      return true;
    });
  }, [entries, dateFrom, dateTo]);

  // Distinct values for filters
  const distinctKunden = useMemo(() => {
    const map = new Map<string, string>();
    for (const e of dateFiltered) {
      if (e.customerId) map.set(String(e.customerId), e.customerName);
    }
    return Array.from(map.entries());
  }, [dateFiltered]);

  const distinctProjekte = useMemo(() => {
    const filtered = filterKunde
      ? dateFiltered.filter((e) => String(e.customerId) === filterKunde)
      : dateFiltered;
    const map = new Map<string, string>();
    for (const e of filtered) {
      if (e.projectId) map.set(String(e.projectId), e.projectName);
    }
    return Array.from(map.entries());
  }, [dateFiltered, filterKunde]);

  const distinctMitarbeiter = useMemo(() => {
    const map = new Map<string, string>();
    for (const e of dateFiltered) map.set(String(e.employeeId), e.employeeName);
    return Array.from(map.entries());
  }, [dateFiltered]);

  const filtered = useMemo(() => {
    return dateFiltered.filter((e) => {
      if (filterKunde && String(e.customerId) !== filterKunde) return false;
      if (filterProjekt && String(e.projectId) !== filterProjekt) return false;
      if (filterMitarbeiter && String(e.employeeId) !== filterMitarbeiter)
        return false;
      return true;
    });
  }, [dateFiltered, filterKunde, filterProjekt, filterMitarbeiter]);

  // Group: Kunde → Projekt → Mitarbeiter
  type MitarbeiterGroup = {
    employeeId: bigint;
    employeeName: string;
    entries: UnbilledEntry[];
  };
  type ProjektGroup = {
    projectId: bigint;
    projectName: string;
    mitarbeiter: MitarbeiterGroup[];
  };
  type KundeGroup = {
    customerId: bigint;
    customerName: string;
    projekte: ProjektGroup[];
  };

  const grouped = useMemo((): KundeGroup[] => {
    const kundeMap = new Map<string, KundeGroup>();
    for (const e of filtered) {
      const ck = String(e.customerId);
      if (!kundeMap.has(ck)) {
        kundeMap.set(ck, {
          customerId: e.customerId,
          customerName: e.customerName,
          projekte: [],
        });
      }
      const kg = kundeMap.get(ck)!;
      const pk = String(e.projectId);
      let pg = kg.projekte.find((p) => String(p.projectId) === pk);
      if (!pg) {
        pg = {
          projectId: e.projectId,
          projectName: e.projectName,
          mitarbeiter: [],
        };
        kg.projekte.push(pg);
      }
      const mk = String(e.employeeId);
      let mg = pg.mitarbeiter.find((m) => String(m.employeeId) === mk);
      if (!mg) {
        mg = {
          employeeId: e.employeeId,
          employeeName: e.employeeName,
          entries: [],
        };
        pg.mitarbeiter.push(mg);
      }
      mg.entries.push(e);
    }
    return Array.from(kundeMap.values()).sort((a, b) =>
      a.customerName.localeCompare(b.customerName, "de"),
    );
  }, [filtered]);

  const selKey = useMemo(
    () => (e: SelectionKey) => `${e.typ}:${String(e.id)}`,
    [],
  );
  const selectedSet = useMemo(
    () => new Set(selected.map(selKey)),
    [selected, selKey],
  );

  function toggleEntry(e: SelectionKey) {
    const k = selKey(e);
    if (selectedSet.has(k)) {
      setSelected((s) => s.filter((x) => selKey(x) !== k));
    } else {
      setSelected((s) => [...s, e]);
    }
  }
  function isGroupSelected(entries: UnbilledEntry[]) {
    return entries.every((e) =>
      selectedSet.has(selKey({ id: e.id, typ: e.typ })),
    );
  }
  function toggleGroup(entries: UnbilledEntry[], forceState?: boolean) {
    const allSelected = forceState ?? !isGroupSelected(entries);
    const keys = entries.map((e) => selKey({ id: e.id, typ: e.typ }));
    if (allSelected) {
      const toAdd = entries.filter(
        (e) => !selectedSet.has(selKey({ id: e.id, typ: e.typ })),
      );
      setSelected((s) => [
        ...s,
        ...toAdd.map((e) => ({ id: e.id, typ: e.typ })),
      ]);
    } else {
      setSelected((s) => s.filter((x) => !keys.includes(selKey(x))));
    }
  }
  function toggleExpand(key: string) {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const [isCreating, setIsCreating] = useState(false);

  function handleCreateInvoice() {
    // Group selected entries by customerId
    const selEntries = filtered.filter((e) =>
      selectedSet.has(selKey({ id: e.id, typ: e.typ })),
    );

    // Collect distinct customer IDs in order of first appearance
    const kundeOrder: string[] = [];
    const byKunde = new Map<string, UnbilledEntry[]>();
    for (const e of selEntries) {
      const ck = String(e.customerId);
      if (!byKunde.has(ck)) {
        byKunde.set(ck, []);
        kundeOrder.push(ck);
      }
      byKunde.get(ck)!.push(e);
    }

    if (kundeOrder.length === 0) return;

    const firstKundeId = kundeOrder[0];
    const firstEntries = byKunde.get(firstKundeId)!;
    const firstZeitIds = firstEntries
      .filter((e) => e.typ === "zeiteintrag")
      .map((e) => e.id);
    const firstSpeseIds = firstEntries
      .filter((e) => e.typ === "spese")
      .map((e) => e.id);

    // If multiple customers: create drafts for others first (silently), then navigate to first
    if (kundeOrder.length > 1 && actor) {
      setIsCreating(true);
      // Create draft invoices for all customers except the first (they'll appear in the overview)
      const otherKundenPromises = kundeOrder.slice(1).map(async (ck) => {
        const entries = byKunde.get(ck)!;
        const zeitIds = entries
          .filter((e) => e.typ === "zeiteintrag")
          .map((e) => e.id);
        const speseIds = entries
          .filter((e) => e.typ === "spese")
          .map((e) => e.id);
        try {
          await toAny(actor).createInvoice({
            kundeId: BigInt(ck),
            kopftext: "",
            fusstext: "",
            positionen: entries.map((e) => ({
              typ: e.typ === "zeiteintrag" ? "leistung" : "spese",
              referenzId: e.id,
              bezeichnung:
                e.description ||
                (e.typ === "zeiteintrag" ? "Leistung" : "Spese"),
              menge: e.hours ?? 1,
              einheit: e.typ === "zeiteintrag" ? "Std." : "Pauschal",
              preis: e.totalCHF,
            })),
            mwstSatz: 7.7,
            rabatt: 0,
            skonto: 0,
          });
          // Mark entries as billed
          const anyActor = toAny(actor);
          const res = (await anyActor.getInvoices()) as {
            __kind__: string;
            ok?: { id: bigint; kundeId: bigint }[];
          };
          if (res.__kind__ === "ok" && res.ok) {
            const inv = [...res.ok]
              .sort((a, b) => Number(b.id) - Number(a.id))
              .find((i) => String(i.kundeId) === ck);
            if (inv) {
              await anyActor.markFakturiert(inv.id, zeitIds, speseIds);
            }
          }
        } catch {
          /* ignore – will appear as orphan draft */
        }
      });

      Promise.all(otherKundenPromises).then(() => {
        setIsCreating(false);
        if (onCreatedMultiKunde) onCreatedMultiKunde();
        // Navigate to editor for first customer
        navigate({
          to: "/fakturierung/rechnung/neu",
          search: {
            zeitIds: firstZeitIds.map(String).join(","),
            speseIds: firstSpeseIds.map(String).join(","),
            kundeId: firstKundeId,
          },
        } as never);
      });
    } else {
      // Single customer – navigate directly
      navigate({
        to: "/fakturierung/rechnung/neu",
        search: {
          zeitIds: firstZeitIds.map(String).join(","),
          speseIds: firstSpeseIds.map(String).join(","),
          kundeId: firstKundeId,
        },
      } as never);
    }
  }

  const selectClass =
    "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card className="shadow-card">
        <CardContent className="pt-4 pb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Datum von</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                data-ocid="unbilled.date-from"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Datum bis</Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                data-ocid="unbilled.date-to"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Kunde</Label>
              <select
                value={filterKunde}
                onChange={(e) => {
                  setFilterKunde(e.target.value);
                  setFilterProjekt("");
                }}
                className={selectClass}
                data-ocid="unbilled.filter-kunde"
              >
                <option value="">Alle</option>
                {distinctKunden.map(([id, name]) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Projekt</Label>
              <select
                value={filterProjekt}
                onChange={(e) => setFilterProjekt(e.target.value)}
                className={selectClass}
                data-ocid="unbilled.filter-projekt"
              >
                <option value="">Alle</option>
                {distinctProjekte.map(([id, name]) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Mitarbeiter</Label>
              <select
                value={filterMitarbeiter}
                onChange={(e) => setFilterMitarbeiter(e.target.value)}
                className={selectClass}
                data-ocid="unbilled.filter-mitarbeiter"
              >
                <option value="">Alle</option>
                {distinctMitarbeiter.map(([id, name]) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground"
          data-ocid="unbilled.empty_state"
        >
          <FileText className="w-12 h-12 opacity-30" />
          <p className="text-sm font-medium">
            Keine nicht fakturierten Leistungen vorhanden
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {grouped.map((kg) => {
            const kundeKey = `k:${String(kg.customerId)}`;
            const kundeExpanded = expandedGroups.has(kundeKey);
            const allKundeEntries = kg.projekte.flatMap((p) =>
              p.mitarbeiter.flatMap((m) => m.entries),
            );
            const kundeTotal = allKundeEntries.reduce(
              (s, e) => s + e.totalCHF,
              0,
            );

            return (
              <Card key={kundeKey} className="shadow-card overflow-hidden">
                {/* Kunde Header */}
                <button
                  type="button"
                  className="flex items-center gap-3 px-4 py-3 bg-primary/5 border-b cursor-pointer select-none w-full text-left"
                  onClick={() => toggleExpand(kundeKey)}
                  data-ocid={`unbilled.kunde-${String(kg.customerId)}`}
                >
                  <Checkbox
                    checked={isGroupSelected(allKundeEntries)}
                    onCheckedChange={(v) => {
                      toggleGroup(allKundeEntries, !!v);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    data-ocid={`unbilled.kunde-checkbox-${String(kg.customerId)}`}
                  />
                  {kundeExpanded ? (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className="font-semibold text-foreground flex-1">
                    {kg.customerName}
                  </span>
                  <span className="text-sm font-semibold text-primary">
                    {formatCurrency(kundeTotal)}
                  </span>
                  <Badge variant="secondary" className="ml-2">
                    {allKundeEntries.length} Pos.
                  </Badge>
                </button>

                {kundeExpanded && (
                  <div className="divide-y divide-border">
                    {kg.projekte.map((pg) => {
                      const projKey = `p:${String(kg.customerId)}:${String(pg.projectId)}`;
                      const projExpanded = expandedGroups.has(projKey);
                      const allProjEntries = pg.mitarbeiter.flatMap(
                        (m) => m.entries,
                      );
                      const projTotal = allProjEntries.reduce(
                        (s, e) => s + e.totalCHF,
                        0,
                      );

                      return (
                        <div key={projKey}>
                          {/* Projekt Header */}
                          <button
                            type="button"
                            className="flex items-center gap-3 px-6 py-2.5 bg-muted/30 cursor-pointer select-none w-full text-left"
                            onClick={() => toggleExpand(projKey)}
                            data-ocid={`unbilled.projekt-${String(pg.projectId)}`}
                          >
                            <Checkbox
                              checked={isGroupSelected(allProjEntries)}
                              onCheckedChange={(v) => {
                                toggleGroup(allProjEntries, !!v);
                              }}
                              onClick={(e) => e.stopPropagation()}
                              data-ocid={`unbilled.projekt-checkbox-${String(pg.projectId)}`}
                            />
                            {projExpanded ? (
                              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                            )}
                            <span className="font-medium text-sm flex-1">
                              {pg.projectName}
                            </span>
                            <span className="text-sm font-medium text-muted-foreground">
                              {formatCurrency(projTotal)}
                            </span>
                          </button>

                          {projExpanded &&
                            pg.mitarbeiter.map((mg) => {
                              const maKey = `m:${String(pg.projectId)}:${String(mg.employeeId)}`;
                              const maExpanded = expandedGroups.has(maKey);
                              const maTotal = mg.entries.reduce(
                                (s, e) => s + e.totalCHF,
                                0,
                              );

                              return (
                                <div key={maKey}>
                                  {/* Mitarbeiter Header */}
                                  <button
                                    type="button"
                                    className="flex items-center gap-3 px-8 py-2 bg-background cursor-pointer select-none w-full text-left"
                                    onClick={() => toggleExpand(maKey)}
                                    data-ocid={`unbilled.ma-${String(mg.employeeId)}`}
                                  >
                                    <Checkbox
                                      checked={isGroupSelected(mg.entries)}
                                      onCheckedChange={(v) => {
                                        toggleGroup(mg.entries, !!v);
                                      }}
                                      onClick={(e) => e.stopPropagation()}
                                      data-ocid={`unbilled.ma-checkbox-${String(mg.employeeId)}`}
                                    />
                                    {maExpanded ? (
                                      <ChevronDown className="w-3 h-3 text-muted-foreground" />
                                    ) : (
                                      <ChevronRight className="w-3 h-3 text-muted-foreground" />
                                    )}
                                    <span className="text-sm flex-1 text-muted-foreground">
                                      {mg.employeeName}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {formatCurrency(maTotal)}
                                    </span>
                                  </button>

                                  {maExpanded && (
                                    <div className="overflow-x-auto">
                                      <Table>
                                        <TableHeader>
                                          <TableRow className="bg-muted/20">
                                            <TableHead className="w-8 pl-10" />
                                            <TableHead className="text-xs">
                                              Datum
                                            </TableHead>
                                            <TableHead className="text-xs">
                                              Typ
                                            </TableHead>
                                            <TableHead className="text-xs">
                                              Beschreibung
                                            </TableHead>
                                            <TableHead className="text-right text-xs">
                                              Dauer / Betrag
                                            </TableHead>
                                            <TableHead className="text-right text-xs">
                                              Stundensatz
                                            </TableHead>
                                            <TableHead className="text-right text-xs">
                                              Total
                                            </TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {mg.entries.map((e, idx) => (
                                            <TableRow
                                              key={`${e.typ}:${String(e.id)}`}
                                              data-ocid={`unbilled.item.${idx + 1}`}
                                              className={
                                                selectedSet.has(
                                                  selKey({
                                                    id: e.id,
                                                    typ: e.typ,
                                                  }),
                                                )
                                                  ? "bg-primary/5"
                                                  : ""
                                              }
                                            >
                                              <TableCell className="pl-10">
                                                <Checkbox
                                                  checked={selectedSet.has(
                                                    selKey({
                                                      id: e.id,
                                                      typ: e.typ,
                                                    }),
                                                  )}
                                                  onCheckedChange={() =>
                                                    toggleEntry({
                                                      id: e.id,
                                                      typ: e.typ,
                                                    })
                                                  }
                                                  data-ocid={`unbilled.checkbox.${idx + 1}`}
                                                />
                                              </TableCell>
                                              <TableCell className="text-xs">
                                                {formatDateCH(e.date)}
                                              </TableCell>
                                              <TableCell>
                                                <Badge
                                                  variant="outline"
                                                  className="text-xs"
                                                >
                                                  {e.typ === "zeiteintrag"
                                                    ? "Zeit"
                                                    : "Spese"}
                                                </Badge>
                                              </TableCell>
                                              <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                                                {e.description || "-"}
                                              </TableCell>
                                              <TableCell className="text-right text-xs tabular-nums">
                                                {e.hours !== undefined
                                                  ? formatHours(e.hours)
                                                  : e.betragCHF !== undefined
                                                    ? `${e.betragCHF.toFixed(2)} CHF`
                                                    : "-"}
                                              </TableCell>
                                              <TableCell className="text-right text-xs tabular-nums">
                                                {e.stundensatz !== undefined
                                                  ? `${e.stundensatz.toFixed(2)}`
                                                  : "-"}
                                              </TableCell>
                                              <TableCell className="text-right text-xs tabular-nums font-medium">
                                                {e.totalCHF.toFixed(2)}
                                              </TableCell>
                                            </TableRow>
                                          ))}
                                          {/* Mitarbeiter subtotal */}
                                          <TableRow className="bg-muted/20 border-t">
                                            <TableCell
                                              colSpan={6}
                                              className="pl-10 text-xs font-semibold"
                                            >
                                              Subtotal {mg.employeeName}
                                            </TableCell>
                                            <TableCell className="text-right text-xs font-semibold tabular-nums">
                                              {maTotal.toFixed(2)}
                                            </TableCell>
                                          </TableRow>
                                        </TableBody>
                                      </Table>
                                    </div>
                                  )}
                                </div>
                              );
                            })}

                          {/* Projekt subtotal */}
                          <div className="flex items-center justify-between px-6 py-1.5 bg-muted/10 border-t text-xs">
                            <span className="text-muted-foreground font-medium">
                              Subtotal {pg.projectName}
                            </span>
                            <span className="tabular-nums font-semibold">
                              {formatCurrency(projTotal)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Sticky Action Bar */}
      {selected.length > 0 && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 px-6 py-3 bg-card border border-border rounded-xl shadow-lg"
          data-ocid="unbilled.action-bar"
        >
          <span className="text-sm font-medium">
            <span className="text-primary font-bold">{selected.length}</span>{" "}
            Position{selected.length !== 1 ? "en" : ""} ausgewählt
          </span>
          <Button
            onClick={handleCreateInvoice}
            className="gap-2"
            disabled={isCreating}
            data-ocid="unbilled.create-invoice-button"
          >
            {isCreating ? (
              <span className="w-4 h-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <Receipt className="w-4 h-4" />
            )}
            Rechnung erstellen
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelected([])}
            data-ocid="unbilled.clear-selection"
          >
            Auswahl aufheben
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── View 2: Rechnungsübersicht ───────────────────────────────────────────────
function RechnungsübersichtView({
  actor,
  actorFetching,
  isAuthenticated,
  customers,
  initialFilterStatus = "",
}: {
  actor: unknown;
  actorFetching: boolean;
  isAuthenticated: boolean;
  customers: Customer[];
  initialFilterStatus?: string;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState(initialFilterStatus);
  const filterStatusInitRef = useRef(false);

  // Apply initial filter status when provided
  useEffect(() => {
    if (!filterStatusInitRef.current && initialFilterStatus) {
      setFilterStatus(initialFilterStatus);
      filterStatusInitRef.current = true;
    }
  }, [initialFilterStatus]);
  const [filterKunde, setFilterKunde] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortField, setSortField] = useState<
    "datum" | "rechnungsnummer" | "status"
  >("datum");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const custMap = useMemo(
    () => new Map(customers.map((c) => [String(c.id), c])),
    [customers],
  );

  const { data: invoices = [], isLoading } = useQuery<Invoice[]>({
    queryKey: ["invoices"],
    queryFn: async () => {
      if (!actor) return [];
      const res = (await toAny(actor).getInvoices()) as {
        __kind__: string;
        ok?: Invoice[];
        err?: string;
      };
      if (res.__kind__ === "ok" && res.ok) return res.ok;
      return [];
    },
    enabled: !!actor && !actorFetching && isAuthenticated,
  });

  const filtered = useMemo(() => {
    return invoices.filter((inv) => {
      if (filterStatus && inv.status !== filterStatus) return false;
      if (filterKunde && String(inv.kundeId) !== filterKunde) return false;
      if (dateFrom && inv.datum < dateFrom) return false;
      if (dateTo && inv.datum > dateTo) return false;
      return true;
    });
  }, [invoices, filterStatus, filterKunde, dateFrom, dateTo]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      if (sortField === "datum") cmp = a.datum.localeCompare(b.datum);
      else if (sortField === "rechnungsnummer")
        cmp = a.rechnungsnummer.localeCompare(b.rechnungsnummer);
      else if (sortField === "status") cmp = a.status.localeCompare(b.status);
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortField, sortDir]);

  function toggleSort(field: typeof sortField) {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortField(field);
      setSortDir("desc");
    }
  }

  async function handleDelete(inv: Invoice) {
    if (!actor) return;
    if (!confirm(`Rechnung ${inv.rechnungsnummer} wirklich löschen?`)) return;
    const res = (await toAny(actor).deleteInvoice(inv.id)) as {
      __kind__: string;
    };
    if (res.__kind__ === "ok") {
      toast.success("Rechnung gelöscht");
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    } else {
      toast.error("Fehler beim Löschen");
    }
  }

  async function handleStornieren(inv: Invoice) {
    if (!actor) return;
    if (!confirm(`Rechnung ${inv.rechnungsnummer} wirklich stornieren?`))
      return;
    const res = (await toAny(actor).updateInvoice(inv.id, {
      status: "storniert",
    })) as { __kind__: string };
    if (res.__kind__ === "ok") {
      toast.success("Rechnung storniert");
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    } else {
      toast.error("Fehler beim Stornieren");
    }
  }

  const selectClass =
    "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

  const distinctKunden = useMemo(() => {
    const map = new Map<string, string>();
    for (const inv of invoices)
      map.set(
        String(inv.kundeId),
        custMap.get(String(inv.kundeId))?.name ?? String(inv.kundeId),
      );
    return Array.from(map.entries());
  }, [invoices, custMap]);

  return (
    <div className="space-y-4">
      {/* Actions + Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1">
          <div className="space-y-1">
            <Label className="text-xs">Kunde</Label>
            <select
              value={filterKunde}
              onChange={(e) => setFilterKunde(e.target.value)}
              className={selectClass}
              data-ocid="invoices.filter-kunde"
            >
              <option value="">Alle</option>
              {distinctKunden.map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Status</Label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={selectClass}
              data-ocid="invoices.filter-status"
            >
              <option value="">Alle</option>
              {Object.entries(statusConfig).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Datum von</Label>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              data-ocid="invoices.date-from"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Datum bis</Label>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              data-ocid="invoices.date-to"
            />
          </div>
        </div>
        <Button
          onClick={() => navigate({ to: "/fakturierung" } as never)}
          variant="outline"
          className="gap-2 whitespace-nowrap"
          data-ocid="invoices.new-button"
        >
          <Plus className="w-4 h-4" />
          Neue Rechnung
        </Button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : sorted.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground"
          data-ocid="invoices.empty_state"
        >
          <Receipt className="w-12 h-12 opacity-30" />
          <p className="text-sm font-medium">Noch keine Rechnungen vorhanden</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate({ to: "/fakturierung" } as never)}
            data-ocid="invoices.goto-unbilled"
          >
            Zu den offenen Leistungen
          </Button>
        </div>
      ) : (
        <Card className="shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead
                    className="cursor-pointer select-none"
                    onClick={() => toggleSort("rechnungsnummer")}
                    data-ocid="invoices.sort-nr"
                  >
                    Rechnungsnummer{" "}
                    {sortField === "rechnungsnummer"
                      ? sortDir === "asc"
                        ? "↑"
                        : "↓"
                      : ""}
                  </TableHead>
                  <TableHead>Kunde</TableHead>
                  <TableHead className="text-right">Betrag</TableHead>
                  <TableHead
                    className="cursor-pointer select-none"
                    onClick={() => toggleSort("datum")}
                    data-ocid="invoices.sort-datum"
                  >
                    Datum{" "}
                    {sortField === "datum"
                      ? sortDir === "asc"
                        ? "↑"
                        : "↓"
                      : ""}
                  </TableHead>
                  <TableHead>Fälligkeitsdatum</TableHead>
                  <TableHead
                    className="cursor-pointer select-none"
                    onClick={() => toggleSort("status")}
                    data-ocid="invoices.sort-status"
                  >
                    Status{" "}
                    {sortField === "status"
                      ? sortDir === "asc"
                        ? "↑"
                        : "↓"
                      : ""}
                  </TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((inv, idx) => {
                  const kunde = custMap.get(String(inv.kundeId));
                  const currency = kunde?.waehrung ?? "CHF";
                  const isOverdue = inv.status === "ueberfaellig";
                  return (
                    <TableRow
                      key={String(inv.id)}
                      data-ocid={`invoices.item.${idx + 1}`}
                      className={isOverdue ? "bg-orange-50/50" : ""}
                    >
                      <TableCell className="font-mono text-sm">
                        {inv.rechnungsnummer}
                      </TableCell>
                      <TableCell className="font-medium">
                        {kunde?.name ?? String(inv.kundeId)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatCurrency(inv.total, currency)}
                      </TableCell>
                      <TableCell>{formatDateCH(inv.datum)}</TableCell>
                      <TableCell
                        className={
                          isOverdue ? "text-orange-600 font-medium" : ""
                        }
                      >
                        {formatDateCH(inv.faelligkeitsdatum)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={inv.status} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-7 px-2"
                            onClick={() =>
                              navigate({
                                to: `/fakturierung/rechnung/${String(inv.id)}`,
                              } as never)
                            }
                            data-ocid={`invoices.open-button.${idx + 1}`}
                          >
                            Öffnen
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-7 px-2"
                            onClick={() => {
                              // Navigate to invoice and trigger print
                              navigate({
                                to: `/fakturierung/rechnung/${String(inv.id)}`,
                              } as never);
                            }}
                            data-ocid={`invoices.pdf-button.${idx + 1}`}
                          >
                            PDF
                          </Button>
                          {inv.status !== "bezahlt" &&
                            inv.status !== "storniert" && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-xs h-7 px-2 text-destructive hover:text-destructive"
                                onClick={() => handleStornieren(inv)}
                                data-ocid={`invoices.stornieren-button.${idx + 1}`}
                              >
                                Stornieren
                              </Button>
                            )}
                          {inv.status === "entwurf" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-xs h-7 px-2 text-destructive hover:text-destructive"
                              onClick={() => handleDelete(inv)}
                              data-ocid={`invoices.delete-button.${idx + 1}`}
                            >
                              Löschen
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </div>
  );
}

// ─── Main FakturierungPage ─────────────────────────────────────────────────────
export default function FakturierungPage() {
  const { actor, isFetching: actorFetching } = useActor(createActor);
  const { isAuthenticated } = useAuth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const search = useSearch({ strict: false }) as any;
  const urlTab = search?.tab as string | undefined;
  const urlFilterStatus = search?.filterStatus as string | undefined;

  const [activeTab, setActiveTab] = useState<"leistungen" | "rechnungen">(
    urlTab === "rechnungen" ? "rechnungen" : "leistungen",
  );

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: async () => {
      if (!actor) return [];
      return (await toAny(actor).listProjects()) as Project[];
    },
    enabled: !!actor && !actorFetching && isAuthenticated,
  });

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["customers"],
    queryFn: async () => {
      if (!actor) return [];
      return (await toAny(actor).listCustomers()) as Customer[];
    },
    enabled: !!actor && !actorFetching && isAuthenticated,
  });

  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ["employees"],
    queryFn: async () => {
      if (!actor) return [];
      return (await toAny(actor).listEmployees()) as Employee[];
    },
    enabled: !!actor && !actorFetching && isAuthenticated,
  });

  // Load project members for stundensatz lookup in Offene Leistungen (Bug G)
  const [projectMembersMap, setProjectMembersMap] = useState<
    Map<string, ProjectMemberAssignment[]>
  >(new Map());

  useEffect(() => {
    if (!actor || actorFetching || projects.length === 0) return;
    const memberMap = new Map<string, ProjectMemberAssignment[]>();
    void Promise.all(
      projects.map(async (p) => {
        try {
          const res = (await toAny(actor).getProjectMembers(p.id)) as
            | { __kind__: "ok"; ok: ProjectMemberAssignment[] }
            | { __kind__: "err"; err: string };
          if (res.__kind__ === "ok") memberMap.set(String(p.id), res.ok);
        } catch {
          /* ignore */
        }
      }),
    ).then(() => setProjectMembersMap(new Map(memberMap)));
  }, [actor, actorFetching, projects]);

  return (
    <Layout>
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Receipt className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-semibold text-foreground">
              Fakturierung
            </h1>
            <p className="text-sm text-muted-foreground">
              Leistungen verrechnen und Rechnungen verwalten
            </p>
          </div>
        </div>

        {/* Tab Bar */}
        <div
          className="flex gap-1 border-b border-border"
          data-ocid="fakturierung.tabs"
        >
          <button
            type="button"
            onClick={() => setActiveTab("leistungen")}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${activeTab === "leistungen" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            data-ocid="fakturierung.tab-leistungen"
          >
            Offene Leistungen
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("rechnungen")}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${activeTab === "rechnungen" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            data-ocid="fakturierung.tab-rechnungen"
          >
            Rechnungen
          </button>
        </div>

        {/* Views */}
        {activeTab === "leistungen" && (
          <UnfakturiertView
            actor={actor}
            actorFetching={actorFetching}
            isAuthenticated={isAuthenticated}
            projects={projects}
            customers={customers}
            employees={employees}
            projectMembersMap={projectMembersMap}
            onCreatedMultiKunde={() => setActiveTab("rechnungen")}
          />
        )}
        {activeTab === "rechnungen" && (
          <RechnungsübersichtView
            actor={actor}
            actorFetching={actorFetching}
            isAuthenticated={isAuthenticated}
            customers={customers}
            initialFilterStatus={urlFilterStatus ?? ""}
          />
        )}
      </div>
    </Layout>
  );
}
