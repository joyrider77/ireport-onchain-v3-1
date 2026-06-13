import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/hooks/useAuthStore";
import { useActor } from "@caffeineai/core-infrastructure";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  PlayCircle,
  ShieldAlert,
} from "lucide-react";
import { useEffect, useState } from "react";
import { createActor } from "../../backend";
import type {
  ComplianceCockpitKPI,
  ComplianceCockpitRow,
  ComplianceStatus,
} from "../../backend";
import { ComplianceCockpitKpiCard } from "./ComplianceCockpitKpiCard";

type AnyActor = Record<string, (...args: unknown[]) => Promise<unknown>>;
const toAny = (a: unknown): AnyActor => a as AnyActor;

type StatusFilter = "alle" | "warnungen" | "verstoesse";

const STATUS_LABELS: Record<string, string> = {
  COMPLIANT: "Konform",
  INFO: "Info",
  WARNING: "Warnung",
  BREACH: "Verstoss",
  CRITICAL: "Kritisch",
  FREIGEGEBEN: "Freigegeben",
};

function statusDotColor(status: ComplianceStatus | string): string {
  switch (status) {
    case "COMPLIANT":
    case "INFO":
      return "bg-green-500";
    case "WARNING":
      return "bg-yellow-500";
    case "BREACH":
    case "CRITICAL":
      return "bg-red-500";
    case "FREIGEGEBEN":
      return "bg-blue-500";
    default:
      return "bg-gray-300";
  }
}

function ferienstatusColor(status: string): string {
  if (status === "OK") return "text-green-600";
  if (status === "Risiko") return "text-yellow-600";
  if (status === "Verstoss") return "text-red-600";
  return "text-muted-foreground";
}

const DEFAULT_KPI: ComplianceCockpitKPI = {
  mitarbeiterMitVerstoessen: BigInt(0),
  ruhezeitVerstoesse: BigInt(0),
  mitarbeiterMitGesetzlicherUeberzeit: BigInt(0),
  ferienRisiken: BigInt(0),
  pausenVerstoesse: BigInt(0),
};

export default function ComplianceCockpit() {
  const { companyId, isAuthenticated } = useAuth();
  const { actor, isFetching } = useActor(createActor);

  const [kpi, setKpi] = useState<ComplianceCockpitKPI>(DEFAULT_KPI);
  const [rows, setRows] = useState<ComplianceCockpitRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [runningCheck, setRunningCheck] = useState(false);
  const [checkMessage, setCheckMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [filterEmployee, setFilterEmployee] = useState("");
  const [filterStatus, setFilterStatus] = useState<StatusFilter>("alle");
  const [selectedWeekDate, setSelectedWeekDate] = useState<Date>(() => {
    // Set to Monday of the current week
    const today = new Date();
    const dow = today.getDay(); // 0=Sun, 1=Mon...
    const diff = dow === 0 ? -6 : 1 - dow; // days to Monday
    const monday = new Date(today);
    monday.setDate(today.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
  });

  const enabled = !!actor && !isFetching && isAuthenticated && !!companyId;

  useEffect(() => {
    if (!enabled) return;
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  async function loadData() {
    if (!actor || !companyId) return;
    setLoading(true);
    try {
      const cid = BigInt(companyId);
      // Bootstrap VacationLedgers for employees that have a hire date
      // This is idempotent — already-existing ledgers are not duplicated
      try {
        await toAny(actor).initAllVacationLedgers(cid);
      } catch {
        // Non-blocking — ledger init failure should not prevent cockpit from loading
      }
      const [kpiResult, rowsResult] = await Promise.all([
        toAny(actor).getComplianceCockpitKPI(cid),
        toAny(actor).getComplianceCockpitRows(cid),
      ]);
      setKpi(kpiResult as ComplianceCockpitKPI);
      setRows(rowsResult as ComplianceCockpitRow[]);
    } catch (e) {
      console.error("Fehler beim Laden der Compliance-Daten:", e);
    } finally {
      setLoading(false);
    }
  }

  function getISOWeekNumber(date: Date): number {
    const d = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
    );
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  }

  function formatWeekLabel(date: Date): string {
    const kw = getISOWeekNumber(date);
    return `KW ${kw} (${date.getFullYear()})`;
  }

  function navigateWeek(delta: number) {
    setSelectedWeekDate((prev) => {
      const next = new Date(prev);
      next.setDate(prev.getDate() + delta * 7);
      return next;
    });
  }

  function formatDateYMD(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  async function handleRunWeeklyCheck() {
    if (!actor || !companyId) return;
    setRunningCheck(true);
    setCheckMessage(null);
    try {
      const cid = BigInt(companyId);
      // Ensure VacationLedgers exist before running the check
      try {
        await toAny(actor).initAllVacationLedgers(cid);
      } catch {
        // Non-blocking
      }
      const weekDateStr = formatDateYMD(selectedWeekDate);
      const result = (await toAny(actor).runWeeklyComplianceCheck(
        cid,
        weekDateStr,
      )) as {
        ok?: { newFindings: bigint; existingFindings: bigint };
        err?: string;
      };
      if (result.err !== undefined) {
        setCheckMessage({ type: "error", text: result.err });
      } else {
        const newCount =
          result.ok !== undefined ? Number(result.ok.newFindings) : 0;
        const existingCount =
          result.ok !== undefined ? Number(result.ok.existingFindings) : 0;
        let msg = "Wochenkontrolle abgeschlossen. ";
        if (newCount === 0 && existingCount === 0) {
          msg += "Keine Befunde gefunden.";
        } else {
          msg += `${newCount} neue Befunde erzeugt. ${existingCount} bestehende Befunde für KW ${getISOWeekNumber(selectedWeekDate)} (${selectedWeekDate.getFullYear()}) gefunden.`;
        }
        setCheckMessage({ type: "success", text: msg });
        await loadData();
      }
    } catch (e) {
      setCheckMessage({
        type: "error",
        text: e instanceof Error ? e.message : "Unbekannter Fehler",
      });
    } finally {
      setRunningCheck(false);
    }
  }

  const filteredRows = rows.filter((r) => {
    const name = `${r.employee.firstName} ${r.employee.lastName}`.toLowerCase();
    if (filterEmployee && !name.includes(filterEmployee.toLowerCase()))
      return false;
    if (filterStatus === "warnungen") {
      return r.gesamtstatus === "WARNING" || r.gesamtstatus === "INFO";
    }
    if (filterStatus === "verstoesse") {
      return r.gesamtstatus === "BREACH" || r.gesamtstatus === "CRITICAL";
    }
    return true;
  });

  const kpiVerstoesse = Number(kpi.mitarbeiterMitVerstoessen);
  const kpiRuhezeit = Number(kpi.ruhezeitVerstoesse);
  const kpiUeberzeit = Number(kpi.mitarbeiterMitGesetzlicherUeberzeit);
  const kpiFerienRisiken = Number(kpi.ferienRisiken);

  return (
    <div className="p-6 space-y-6" data-ocid="compliance.cockpit_page">
      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <ComplianceCockpitKpiCard
          title="Mitarbeitende mit Verstössen"
          value={kpiVerstoesse}
          status={kpiVerstoesse > 0 ? "red" : "green"}
        />
        <ComplianceCockpitKpiCard
          title="Ruhezeitverstösse"
          value={kpiRuhezeit}
          status={kpiRuhezeit > 0 ? "red" : "green"}
        />
        <ComplianceCockpitKpiCard
          title="Mitarbeitende mit gesetzl. Überzeit"
          value={kpiUeberzeit}
          status={kpiUeberzeit > 0 ? "yellow" : "green"}
        />
        <ComplianceCockpitKpiCard
          title="Ferienrisiken"
          value={kpiFerienRisiken}
          status={kpiFerienRisiken > 0 ? "yellow" : "green"}
        />
        <ComplianceCockpitKpiCard
          title="Pausenverstösse"
          value={Number(kpi.pausenVerstoesse)}
          status={Number(kpi.pausenVerstoesse) > 0 ? "yellow" : "green"}
        />
      </div>

      {/* Week Selector */}
      <div
        className="flex items-center gap-2 bg-card border border-border rounded-lg px-4 py-2.5 w-fit"
        data-ocid="compliance.week_selector"
      >
        <button
          type="button"
          onClick={() => navigateWeek(-1)}
          aria-label="Vorherige Woche"
          className="p-0.5 rounded hover:bg-muted transition-colors"
          data-ocid="compliance.week_prev_button"
        >
          <ChevronLeft className="w-4 h-4 text-muted-foreground" />
        </button>
        <span
          className="text-sm font-medium text-foreground min-w-[120px] text-center"
          data-ocid="compliance.week_label"
        >
          {formatWeekLabel(selectedWeekDate)}
        </span>
        <button
          type="button"
          onClick={() => navigateWeek(1)}
          aria-label="Nächste Woche"
          className="p-0.5 rounded hover:bg-muted transition-colors"
          data-ocid="compliance.week_next_button"
        >
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Action + Status message */}
      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          onClick={() => void handleRunWeeklyCheck()}
          disabled={runningCheck || !enabled}
          className="gap-2 bg-[#006066] hover:bg-[#004d52] text-white"
          data-ocid="compliance.run_weekly_check_button"
        >
          {runningCheck ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <PlayCircle className="w-4 h-4" />
          )}
          Wochenkontrolle ausführen
        </Button>
        {checkMessage && (
          <span
            className={`text-sm font-medium ${
              checkMessage.type === "success"
                ? "text-green-600"
                : "text-red-600"
            }`}
            data-ocid="compliance.check_message"
          >
            {checkMessage.text}
          </span>
        )}
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-3">
        <Input
          type="text"
          placeholder="Mitarbeitende suchen..."
          value={filterEmployee}
          onChange={(e) => setFilterEmployee(e.target.value)}
          className="w-56"
          data-ocid="compliance.search_input"
        />
        <Select
          value={filterStatus}
          onValueChange={(v) => setFilterStatus(v as StatusFilter)}
        >
          <SelectTrigger
            className="w-44"
            data-ocid="compliance.status_filter_select"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="alle">Alle Status</SelectItem>
            <SelectItem value="warnungen">Nur Warnungen</SelectItem>
            <SelectItem value="verstoesse">Nur Verstösse</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {loading ? (
        <div
          className="flex items-center justify-center py-20 text-muted-foreground"
          data-ocid="compliance.loading_state"
        >
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span className="text-sm">Daten werden geladen…</span>
        </div>
      ) : filteredRows.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-20 gap-3 text-center"
          data-ocid="compliance.empty_state"
        >
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
            <ShieldAlert className="w-6 h-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              Keine Compliance-Daten vorhanden
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Führe eine Wochenkontrolle aus, um Befunde zu generieren.
            </p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Mitarbeitende</TableHead>
                <TableHead>Gesamtstatus</TableHead>
                <TableHead className="text-right">
                  Vertragl. Überstunden
                </TableHead>
                <TableHead className="text-right">Gesetzl. Überzeit</TableHead>
                <TableHead className="text-right">Ruhezeitverstösse</TableHead>
                <TableHead className="text-right">Pausenverstösse</TableHead>
                <TableHead>Ferienstatus</TableHead>
                <TableHead className="text-right">Offene Massnahmen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRows.map((r, idx) => (
                <TableRow
                  key={String(r.employee.id)}
                  data-ocid={`compliance.item.${idx + 1}`}
                >
                  <TableCell className="font-medium">
                    {r.employee.firstName} {r.employee.lastName}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${statusDotColor(r.gesamtstatus)}`}
                        aria-hidden="true"
                      />
                      <span className="text-sm">
                        {STATUS_LABELS[r.gesamtstatus as string] ??
                          r.gesamtstatus}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {r.vertraglicheUeberstundenH > 0 ? (
                      <span className="text-yellow-600 font-medium">
                        +{r.vertraglicheUeberstundenH.toFixed(1)}h
                      </span>
                    ) : (
                      <span className="text-muted-foreground">
                        {r.vertraglicheUeberstundenH.toFixed(1)}h
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {r.gesetzlicheUeberzeitH > 0 ? (
                      <span className="text-red-600 font-medium">
                        +{r.gesetzlicheUeberzeitH.toFixed(1)}h
                      </span>
                    ) : (
                      <span className="text-muted-foreground">
                        {r.gesetzlicheUeberzeitH.toFixed(1)}h
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {Number(r.ruhezeitVerstoesse) > 0 ? (
                      <span className="text-red-600 font-medium">
                        {Number(r.ruhezeitVerstoesse)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {r.pausenVerstoesse !== undefined &&
                    Number(r.pausenVerstoesse) > 0 ? (
                      <span className="text-yellow-600 font-medium">
                        {Number(r.pausenVerstoesse)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`text-sm font-medium ${ferienstatusColor(r.ferienstatus)}`}
                    >
                      {r.ferienstatus || "–"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {Number(r.offeneMassnahmen) > 0 ? (
                      <span className="text-orange-600 font-medium">
                        {Number(r.offeneMassnahmen)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
