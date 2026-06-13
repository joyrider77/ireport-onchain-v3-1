/**
 * ProjektauswertungView — druckbarer Leistungsrapport pro Projekt
 * Analog zu MonatsrapportView.tsx: inline styles + @media print + window.print()
 * Unterstützt zwei Modi: Standard-Auswertung und Budgetvergleich
 */
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { formatHours } from "@/lib/timeFormat";
import { useActor } from "@caffeineai/core-infrastructure";
import { Printer } from "lucide-react";
import { useState } from "react";
import { createActor } from "../backend";
import type { Result_31, Result_32 } from "../backend.d";
import type {
  EmployeeBudgetReport as BackendEmployeeBudgetReport,
  ProjectBudgetReport as BackendProjectBudgetReport,
  ServiceTypeBudgetReport as BackendServiceTypeBudgetReport,
  Company,
  Customer,
  Employee,
  Project,
  ProjectId,
  ReportData,
  ServiceType,
  TimeEntry,
} from "../backend.d";
import { useAuth } from "../hooks/useAuthStore";

type AnyActor = Record<string, (...args: unknown[]) => Promise<unknown>>;
const toAny = (a: unknown): AnyActor => a as AnyActor;

// ─── Budget types: use backend types, augment for frontend detail view ────────

/** Alias: matches backend ServiceTypeBudgetReport exactly */
type ServiceTypeBudgetReport = BackendServiceTypeBudgetReport;

/** Augment backend EmployeeBudgetReport with frontend-only timeEntries for Sektion 4 */
type EmployeeBudgetReport = BackendEmployeeBudgetReport & {
  timeEntries?: TimeEntry[];
};

/** ProjectBudgetReport using augmented employee reports */
type ProjectBudgetReport = Omit<
  BackendProjectBudgetReport,
  "employeeReports"
> & {
  employeeReports: EmployeeBudgetReport[];
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}
function fmtDate(iso: string): string {
  if (!iso) return "–";
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}
function fmtDateRange(from: string, to: string): string {
  return `${fmtDate(from)} – ${fmtDate(to)}`;
}
function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}
function todayDisplay(): string {
  return fmtDate(todayIso());
}
function firstDayOfMonthIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-01`;
}

/** Float hours → "hh:mm" */
function hoursToHHMM(hours: number): string {
  return formatHours(hours);
}

/** Total minutes → "hh:mm" */
function minutesToHHMM(totalMins: number): string {
  if (totalMins <= 0) return "00:00";
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  return `${pad2(h)}:${pad2(m)}`;
}

/** Duration from von+bis strings */
function vonBisDuration(von: string, bis: string): string {
  const [vh, vm] = von.split(":").map(Number);
  const [bh, bm] = bis.split(":").map(Number);
  const mins = bh * 60 + bm - (vh * 60 + vm);
  if (mins <= 0) return "00:00";
  return `${pad2(Math.floor(mins / 60))}:${pad2(mins % 60)}`;
}

/**
 * Swiss number format: apostrophe as thousands separator, 2 decimal places
 * e.g. 57200 → "57'200.00"
 */
function fmtCHF(value: number): string {
  const [intPart, decPart] = value.toFixed(2).split(".");
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, "'");
  return `${grouped}.${decPart}`;
}

/**
 * Burndown %: (aufgewendet / kostendach) × 100
 * Returns "—" when kostendach = 0
 */
function fmtBurndown(aufgewendet: number, kostendach: number): string {
  if (kostendach === 0) return "—";
  return `${((aufgewendet / kostendach) * 100).toFixed(2)} %`;
}

// ─── Print Styles ─────────────────────────────────────────────────────────────

const PRINT_STYLES = `
@media print {
  .no-print { display: none !important; }
  .fixed, [style*="position: fixed"], [style*="position:fixed"] { display: none !important; }
  nav, aside, header { display: none !important; }
  #projektauswertung-print {
    position: absolute !important;
    left: 0 !important;
    top: 0 !important;
    width: 100% !important;
    height: auto !important;
    overflow: visible !important;
    background: white !important;
    padding: 0 !important;
    margin: 0 !important;
  }
  body {
    background: white !important;
    margin: 0 !important;
    padding: 0 !important;
  }
  #projektauswertung-print table { page-break-inside: auto; }
  #projektauswertung-print tr { page-break-inside: avoid; page-break-after: auto; }
  #projektauswertung-print .report-section { page-break-inside: avoid; }
  #projektauswertung-print .page-break { page-break-before: always; }
  #projektauswertung-print thead { display: table-header-group; }
  img { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
}
@page { margin: 15mm; size: A4 portrait; }
`;

// ─── Shared table styles ──────────────────────────────────────────────────────

const thStyle: React.CSSProperties = {
  backgroundColor: "#006066",
  color: "white",
  padding: "5px 8px",
  textAlign: "left",
  fontSize: "11px",
  fontWeight: "600",
  whiteSpace: "nowrap",
  printColorAdjust: "exact",
};
const thRightStyle: React.CSSProperties = { ...thStyle, textAlign: "right" };
const tdStyle: React.CSSProperties = {
  padding: "4px 8px",
  borderBottom: "1px solid #eee",
  fontSize: "12px",
};
const tdRightStyle: React.CSSProperties = {
  ...tdStyle,
  textAlign: "right",
  fontVariantNumeric: "tabular-nums",
};
const footerTdStyle: React.CSSProperties = {
  ...tdStyle,
  backgroundColor: "#e8f0f0",
  fontWeight: "bold",
  borderTop: "2px solid #006066",
};
const footerTdRightStyle: React.CSSProperties = {
  ...tdRightStyle,
  backgroundColor: "#e8f0f0",
  fontWeight: "bold",
  borderTop: "2px solid #006066",
};
const sectionTitleStyle: React.CSSProperties = {
  backgroundColor: "#006066",
  color: "white",
  padding: "6px 12px",
  fontWeight: "bold",
  fontSize: "13px",
  marginBottom: "0",
  printColorAdjust: "exact",
};
const subTitleStyle: React.CSSProperties = {
  fontWeight: "bold",
  fontSize: "12px",
  padding: "5px 8px",
  backgroundColor: "#e8f0f0",
  borderLeft: "3px solid #006066",
  marginBottom: "0",
};
const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  border: "1px solid #ccd9d9",
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface ProjektauswertungViewProps {
  employees: Employee[];
  allProjects: Project[];
  projectMemberships: Map<string, boolean>;
  isAdminOrManager: boolean;
}

// ─── Standard Report State ────────────────────────────────────────────────────

interface ReportState {
  timeEntries: TimeEntry[];
  company: Company | null;
  customer: Customer | null;
  project: Project | null;
  employees: Employee[];
  serviceTypes: ServiceType[];
  dateFrom: string;
  dateTo: string;
  currentUserName: string;
}

// ─── Budget Report State ──────────────────────────────────────────────────────

interface BudgetReportState {
  budgetReport: ProjectBudgetReport;
  company: Company | null;
  customer: Customer | null;
  project: Project | null;
  timeEntries: TimeEntry[];
  employees: Employee[];
  serviceTypes: ServiceType[];
  dateFrom: string;
  dateTo: string;
  currentUserName: string;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ProjektauswertungView({
  employees,
  allProjects,
  projectMemberships,
  isAdminOrManager,
}: ProjektauswertungViewProps) {
  const { actor, isFetching: actorFetching } = useActor(createActor);
  const { isAuthenticated, employeeName } = useAuth();

  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [dateFrom, setDateFrom] = useState(firstDayOfMonthIso());
  const [dateTo, setDateTo] = useState(todayIso());
  const [showBudget, setShowBudget] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<ReportState | null>(null);
  const [budgetReportData, setBudgetReportData] =
    useState<BudgetReportState | null>(null);

  // Filter projects
  const visibleProjects = isAdminOrManager
    ? allProjects.filter((p) => p.active)
    : allProjects.filter(
        (p) => p.active && projectMemberships.has(String(p.id)),
      );

  const handleGeneratePreview = async () => {
    if (!actor || actorFetching || !isAuthenticated || !selectedProjectId)
      return;
    setIsLoading(true);
    setError(null);
    setReportData(null);
    setBudgetReportData(null);

    try {
      const a = toAny(actor);
      const projId = BigInt(selectedProjectId);

      // Always fetch base data
      const [reportRes, companyRes, customersRes, svcRes, allEmpsRes] =
        await Promise.all([
          a.getReportData({
            dateFrom,
            dateTo,
            projectId: projId,
          }) as Promise<ReportData>,
          a.getMyCompany() as Promise<{ __kind__: string; ok?: Company }>,
          a.listCustomers() as Promise<Customer[]>,
          a.listServiceTypes() as Promise<ServiceType[]>,
          isAdminOrManager
            ? (a.listEmployees() as Promise<Employee[]>)
            : Promise.resolve(employees),
        ]);

      const project =
        allProjects.find((p) => String(p.id) === selectedProjectId) ?? null;
      const customer =
        project && customersRes
          ? (customersRes.find(
              (c) => String(c.id) === String(project.customerId),
            ) ?? null)
          : null;
      const company =
        companyRes.__kind__ === "ok" ? (companyRes.ok ?? null) : null;

      const timeEntries: TimeEntry[] = reportRes?.entries ?? [];
      const resolvedEmployees = allEmpsRes ?? employees;
      const resolvedServiceTypes = svcRes ?? [];

      if (showBudget) {
        // ── Budget mode: call real backend, fall back to local mock on error ──
        let budgetReport: ProjectBudgetReport;
        try {
          const res: Result_32 = await actor.getProjectBudgetReport(
            projId as ProjectId,
            dateFrom,
            dateTo,
          );
          if (res.__kind__ === "ok") {
            // Attach timeEntries per employee for Sektion 4 detail view
            budgetReport = {
              ...res.ok,
              employeeReports: res.ok.employeeReports.map((er) => ({
                ...er,
                timeEntries: timeEntries.filter(
                  (t) => String(t.employeeId) === String(er.employeeId),
                ),
              })),
            };
          } else {
            budgetReport = buildMockBudgetReport(
              project,
              customer,
              timeEntries,
              resolvedEmployees,
              resolvedServiceTypes,
            );
          }
        } catch {
          // Fallback: build from timeEntries locally
          budgetReport = buildMockBudgetReport(
            project,
            customer,
            timeEntries,
            resolvedEmployees,
            resolvedServiceTypes,
          );
        }

        setBudgetReportData({
          budgetReport,
          company,
          customer,
          project,
          timeEntries,
          employees: resolvedEmployees,
          serviceTypes: resolvedServiceTypes,
          dateFrom,
          dateTo,
          currentUserName: employeeName ?? "–",
        });
      } else {
        setReportData({
          timeEntries,
          company,
          customer,
          project,
          employees: resolvedEmployees,
          serviceTypes: resolvedServiceTypes,
          dateFrom,
          dateTo,
          currentUserName: employeeName ?? "–",
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler");
    } finally {
      setIsLoading(false);
    }
  };

  const hasReport = showBudget ? !!budgetReportData : !!reportData;

  return (
    <div className="space-y-6">
      <style>{PRINT_STYLES}</style>

      {/* ── Eingabemaske ── */}
      <div
        className="bg-card border border-border rounded-lg p-5 no-print"
        data-ocid="projektauswertung.form"
      >
        <h2 className="text-base font-semibold text-foreground mb-4">
          Projektauswertung generieren
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Projekt-Auswahl */}
          <div className="space-y-1.5 lg:col-span-2">
            <Label htmlFor="pa-project">Projekt</Label>
            <select
              id="pa-project"
              data-ocid="projektauswertung.project_select"
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">Projekt wählen…</option>
              {visibleProjects.map((p) => (
                <option key={String(p.id)} value={String(p.id)}>
                  {p.name}
                  {p.code ? ` [${p.code}]` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Zeitraum Von */}
          <div className="space-y-1.5">
            <Label htmlFor="pa-date-from">Zeitraum von</Label>
            <input
              id="pa-date-from"
              data-ocid="projektauswertung.date_from"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          {/* Zeitraum Bis */}
          <div className="space-y-1.5">
            <Label htmlFor="pa-date-to">Zeitraum bis</Label>
            <input
              id="pa-date-to"
              data-ocid="projektauswertung.date_to"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
        </div>

        {/* Budgetvergleich checkbox */}
        <div className="mt-4 flex items-center gap-2">
          <input
            type="checkbox"
            id="pa-budget"
            data-ocid="projektauswertung.budget_checkbox"
            checked={showBudget}
            onChange={(e) => setShowBudget(e.target.checked)}
            className="h-4 w-4 cursor-pointer accent-[#006066]"
          />
          <label
            htmlFor="pa-budget"
            className="text-sm text-foreground cursor-pointer select-none"
          >
            Projektauswertung mit Budgetvergleich
          </label>
        </div>

        <div className="mt-5 flex items-center gap-3">
          <Button
            type="button"
            data-ocid="projektauswertung.preview_button"
            onClick={handleGeneratePreview}
            disabled={isLoading || !selectedProjectId}
            style={{ backgroundColor: "#006066", color: "white" }}
            className="gap-2"
          >
            {isLoading ? "Wird geladen…" : "Vorschau generieren"}
          </Button>
          {hasReport && !isLoading && (
            <Button
              type="button"
              variant="outline"
              data-ocid="projektauswertung.print_button"
              onClick={() => window.print()}
              className="gap-2"
            >
              <Printer className="w-4 h-4" />
              Drucken / PDF exportieren
            </Button>
          )}
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 text-sm text-destructive">
          Fehler beim Laden der Auswertung: {error}
        </div>
      )}

      {/* ── Print area ── */}
      {!isLoading && (
        <>
          {showBudget && budgetReportData && (
            <div
              id="projektauswertung-print"
              className="bg-white rounded-lg border border-border"
              style={{
                fontFamily: "system-ui, sans-serif",
                fontSize: "13px",
                color: "#1a1a1a",
              }}
            >
              <BudgetReportContent data={budgetReportData} />
            </div>
          )}
          {!showBudget && reportData && (
            <div
              id="projektauswertung-print"
              className="bg-white rounded-lg border border-border"
              style={{
                fontFamily: "system-ui, sans-serif",
                fontSize: "13px",
                color: "#1a1a1a",
              }}
            >
              <StandardReportContent data={reportData} />
            </div>
          )}
        </>
      )}

      {/* Empty state */}
      {!hasReport && !isLoading && !error && (
        <div
          data-ocid="projektauswertung.empty_state"
          className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3"
        >
          <div className="w-16 h-16 rounded-full bg-muted/60 flex items-center justify-center">
            <Printer className="w-8 h-8 opacity-50" />
          </div>
          <p className="text-sm font-medium">
            Projekt und Zeitraum wählen, dann «Vorschau generieren» klicken
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Mock budget builder (fallback when backend call fails) ──────────────────

function buildMockBudgetReport(
  project: Project | null,
  customer: Customer | null,
  timeEntries: TimeEntry[],
  resolvedEmployees: Employee[],
  resolvedServiceTypes: ServiceType[],
): ProjectBudgetReport {
  const empName = (id: bigint) => {
    const e = resolvedEmployees.find((x) => String(x.id) === String(id));
    return e ? `${e.firstName} ${e.lastName}` : String(id);
  };
  const svcName = (id: bigint) =>
    resolvedServiceTypes.find((s) => String(s.id) === String(id))?.name ?? "–";

  // Group by employee
  const byEmp = new Map<
    string,
    { entries: TimeEntry[]; svcMap: Map<string, number> }
  >();
  for (const t of timeEntries) {
    const ek = String(t.employeeId);
    if (!byEmp.has(ek)) byEmp.set(ek, { entries: [], svcMap: new Map() });
    const g = byEmp.get(ek)!;
    g.entries.push(t);
    const sk = String(t.serviceTypeId);
    g.svcMap.set(sk, (g.svcMap.get(sk) ?? 0) + t.hours);
  }

  // Build per-employee budget reports (Kostendach = 0, mock data)
  const employeeReports: EmployeeBudgetReport[] = Array.from(
    byEmp.entries(),
  ).map(([eid, { entries, svcMap }]) => {
    const totalHours = entries.reduce((s, t) => s + t.hours, 0);
    const serviceTypeReports: ServiceTypeBudgetReport[] = Array.from(
      svcMap.entries(),
    ).map(([sid, hours]) => ({
      serviceTypeId: BigInt(sid),
      serviceTypeName: svcName(BigInt(sid)),
      kostendachCHF: 0,
      aufgewendetCHF: 0,
      aufgewendeteStunden: hours,
    }));
    return {
      employeeId: BigInt(eid),
      employeeName: empName(BigInt(eid)),
      kostendachCHF: 0,
      aufgewendetCHF: 0,
      aufgewendeteStunden: totalHours,
      serviceTypeReports,
      timeEntries: entries,
    };
  });

  const totalHours = timeEntries.reduce((s, t) => s + t.hours, 0);
  return {
    projectId: project?.id ?? BigInt(0),
    projectName: project?.name ?? "–",
    customerName: customer?.name ?? "–",
    totalKostendachCHF: 0,
    totalAufgewendetCHF: 0,
    totalStunden: totalHours,
    employeeReports,
  };
}

// ─── Budget Report Header ───────────────────────────────────────────────────

function BudgetReportHeader({
  company,
  customerName,
  projectName,
  dateFrom,
  dateTo,
}: {
  company: Company | null;
  customerName: string;
  projectName: string;
  dateFrom: string;
  dateTo: string;
}) {
  return (
    <div>
      {/* Kopfzeile */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "14px",
        }}
      >
        {/* Links: Firmenlogo + Firmenname */}
        <div>
          {company?.logoUrl && company.logoUrl.length > 0 && (
            <img
              src={company.logoUrl}
              alt="Logo"
              style={{
                height: "36px",
                maxWidth: "120px",
                marginBottom: "6px",
                display: "block",
                objectFit: "contain",
                printColorAdjust: "exact",
              }}
            />
          )}
          <div
            style={{ fontWeight: "bold", fontSize: "17px", color: "#006066" }}
          >
            {company?.name ?? "Firma"}
          </div>
          {company?.address && (
            <div style={{ fontSize: "11px", color: "#666", marginTop: "2px" }}>
              {company.address}
            </div>
          )}
        </div>
        {/* Rechts: iReport Logo */}
        <div style={{ textAlign: "right" }}>
          <div
            style={{ fontWeight: "bold", fontSize: "14px", color: "#006066" }}
          >
            iReport Onchain
          </div>
          <div style={{ fontSize: "11px", color: "#888", marginTop: "2px" }}>
            Projektauswertung
          </div>
        </div>
      </div>

      {/* Titel + Metadaten */}
      <div style={{ marginBottom: "10px" }}>
        <div style={{ fontWeight: "bold", fontSize: "15px", color: "#1a1a1a" }}>
          Projektauswertung {customerName} – {projectName}
        </div>
        <div
          style={{
            fontSize: "11px",
            color: "#444",
            marginTop: "4px",
            lineHeight: "1.6",
          }}
        >
          <div>Zeitraum: {fmtDateRange(dateFrom, dateTo)}</div>
          <div>Ausgestellt am: {todayDisplay()}</div>
        </div>
      </div>

      <hr
        style={{
          border: "none",
          borderTop: "2px solid #006066",
          marginBottom: "18px",
        }}
      />
    </div>
  );
}

// ─── Budget Report Footer ─────────────────────────────────────────────────────

function BudgetReportFooter({ company }: { company: Company | null }) {
  return (
    <div
      style={{
        borderTop: "1px solid #ccd9d9",
        paddingTop: "10px",
        marginTop: "24px",
        color: "#888",
        fontSize: "11px",
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      <span>
        {company?.name ?? ""}
        {company?.address ? ` | ${company.address}` : ""}
      </span>
      <span>Erstellt am {todayDisplay()}</span>
    </div>
  );
}

// ─── Budget Table with CHF+burndown columns ─────────────────────────────────

interface BudgetRow {
  label: string;
  kostendach: number;
  aufgewendet: number;
  stunden: number;
  isTotal?: boolean;
}

function BudgetTable({
  rows,
  labelHeader,
}: {
  rows: BudgetRow[];
  labelHeader: string;
}) {
  return (
    <table style={tableStyle}>
      <thead>
        <tr>
          <th style={thStyle}>{labelHeader}</th>
          <th style={thRightStyle}>Kostendach in CHF</th>
          <th style={thRightStyle}>Aufgewendet in CHF</th>
          <th style={thRightStyle}>Burndown in %</th>
          <th style={thRightStyle}>Aufgewendete Stunden</th>
        </tr>
      </thead>
      <tbody>
        {rows
          .filter((r) => !r.isTotal)
          .map((row, idx) => (
            <tr
              key={`${row.label}-${idx}`}
              style={{ backgroundColor: idx % 2 === 0 ? "white" : "#f7fafa" }}
            >
              <td style={tdStyle}>{row.label}</td>
              <td style={tdRightStyle}>{fmtCHF(row.kostendach)}</td>
              <td style={tdRightStyle}>{fmtCHF(row.aufgewendet)}</td>
              <td style={tdRightStyle}>
                {fmtBurndown(row.aufgewendet, row.kostendach)}
              </td>
              <td style={tdRightStyle}>{hoursToHHMM(row.stunden)}</td>
            </tr>
          ))}
      </tbody>
      <tfoot>
        {rows
          .filter((r) => r.isTotal)
          .map((row) => (
            <tr key="total">
              <td style={footerTdStyle}>{row.label}</td>
              <td style={footerTdRightStyle}>{fmtCHF(row.kostendach)}</td>
              <td style={footerTdRightStyle}>{fmtCHF(row.aufgewendet)}</td>
              <td style={footerTdRightStyle}>
                {fmtBurndown(row.aufgewendet, row.kostendach)}
              </td>
              <td style={footerTdRightStyle}>{hoursToHHMM(row.stunden)}</td>
            </tr>
          ))}
      </tfoot>
    </table>
  );
}

// ─── Budget Report Content ────────────────────────────────────────────────────

function BudgetReportContent({ data }: { data: BudgetReportState }) {
  const {
    budgetReport,
    company,
    customer,
    project,
    timeEntries,
    serviceTypes,
    dateFrom,
    dateTo,
    currentUserName,
  } = data;

  const customerName = customer?.name ?? budgetReport.customerName ?? "–";
  const projectName = project?.name ?? budgetReport.projectName ?? "–";

  const svcName = (id: string | bigint) =>
    serviceTypes.find((s) => String(s.id) === String(id))?.name ?? "–";

  // Sort entries for detail view
  const sortedEntries = [...timeEntries].sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? -1 : 1;
    if (a.von && b.von) return a.von < b.von ? -1 : 1;
    return 0;
  });

  const entriesByEmp = new Map<string, TimeEntry[]>();
  for (const t of sortedEntries) {
    const k = String(t.employeeId);
    if (!entriesByEmp.has(k)) entriesByEmp.set(k, []);
    entriesByEmp.get(k)!.push(t);
  }

  const isZeitBlock = project?.erfassungsart === "zeitBlock";

  // ── ABSCHNITT 1: Gesamttotal — one row per project (= the selected project)
  const sek1Rows: BudgetRow[] = [
    {
      label: projectName,
      kostendach: budgetReport.totalKostendachCHF,
      aufgewendet: budgetReport.totalAufgewendetCHF,
      stunden: budgetReport.totalStunden,
    },
    {
      label: "Total",
      kostendach: budgetReport.totalKostendachCHF,
      aufgewendet: budgetReport.totalAufgewendetCHF,
      stunden: budgetReport.totalStunden,
      isTotal: true,
    },
  ];

  // ── ABSCHNITT 2: Gesamttotal pro Mitarbeiter
  const totalKostendach = budgetReport.employeeReports.reduce(
    (s, e) => s + e.kostendachCHF,
    0,
  );
  const totalAufgewendet = budgetReport.employeeReports.reduce(
    (s, e) => s + e.aufgewendetCHF,
    0,
  );
  const totalStunden = budgetReport.employeeReports.reduce(
    (s, e) => s + e.aufgewendeteStunden,
    0,
  );
  const sek2Rows: BudgetRow[] = [
    ...budgetReport.employeeReports.map((er) => ({
      label: er.employeeName,
      kostendach: er.kostendachCHF,
      aufgewendet: er.aufgewendetCHF,
      stunden: er.aufgewendeteStunden,
    })),
    {
      label: "Total",
      kostendach: totalKostendach,
      aufgewendet: totalAufgewendet,
      stunden: totalStunden,
      isTotal: true,
    },
  ];

  if (timeEntries.length === 0 && budgetReport.employeeReports.length === 0) {
    return (
      <div style={{ padding: "24px", maxWidth: "900px", margin: "0 auto" }}>
        <BudgetReportHeader
          company={company}
          customerName={customerName}
          projectName={projectName}
          dateFrom={dateFrom}
          dateTo={dateTo}
        />
        <div
          style={{
            textAlign: "center",
            padding: "40px",
            color: "#888",
            fontSize: "14px",
          }}
        >
          Keine Zeiterfassungen für den gewählten Zeitraum und das gewählte
          Projekt.
        </div>
        <BudgetReportFooter company={company} />
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", maxWidth: "900px", margin: "0 auto" }}>
      <BudgetReportHeader
        company={company}
        customerName={customerName}
        projectName={projectName}
        dateFrom={dateFrom}
        dateTo={dateTo}
      />

      {/* ══ ABSCHNITT 1: GESAMTTOTAL ══ */}
      <div style={{ marginBottom: "20px" }} className="report-section">
        <div style={sectionTitleStyle}>Gesamttotal</div>
        <BudgetTable rows={sek1Rows} labelHeader="Projekt" />
      </div>

      {/* ══ ABSCHNITT 2: GESAMTTOTAL PRO MITARBEITER ══ */}
      <div style={{ marginBottom: "20px" }} className="report-section">
        <div style={sectionTitleStyle}>Gesamttotal pro Mitarbeiter</div>
        <BudgetTable rows={sek2Rows} labelHeader="Mitarbeiter" />
      </div>

      <div className="page-break" />

      {/* ══ ABSCHNITT 3: MITARBEITER-ÜBERSICHT ══ */}
      <div style={{ marginBottom: "4px" }} className="report-section">
        <div style={sectionTitleStyle}>Mitarbeiter-Übersicht</div>
      </div>
      {budgetReport.employeeReports.map((er) => {
        const empRows: BudgetRow[] = [
          ...er.serviceTypeReports.map((st) => ({
            label: st.serviceTypeName,
            kostendach: st.kostendachCHF,
            aufgewendet: st.aufgewendetCHF,
            stunden: st.aufgewendeteStunden,
          })),
          {
            label: `Total ${er.employeeName}`,
            kostendach: er.kostendachCHF,
            aufgewendet: er.aufgewendetCHF,
            stunden: er.aufgewendeteStunden,
            isTotal: true,
          },
        ];
        return (
          <div
            key={String(er.employeeId)}
            style={{ marginBottom: "16px" }}
            className="report-section"
          >
            <div style={subTitleStyle}>{er.employeeName}</div>
            <BudgetTable rows={empRows} labelHeader="Leistungsart" />
          </div>
        );
      })}

      <div className="page-break" />

      {/* ══ ABSCHNITT 4: DETAILLIERTE LEISTUNGSÜBERSICHT ══ */}
      <div style={{ marginBottom: "4px" }} className="report-section">
        <div style={sectionTitleStyle}>Detaillierte Leistungsübersicht</div>
      </div>
      {budgetReport.employeeReports.map((er) => {
        // Use pre-attached timeEntries (mock mode) or filter from sorted entries
        const empEntries =
          er.timeEntries && er.timeEntries.length > 0
            ? [...er.timeEntries].sort((a, b) =>
                a.date < b.date ? -1 : a.date > b.date ? 1 : 0,
              )
            : (entriesByEmp.get(String(er.employeeId)) ?? []);

        const empTotalMins = empEntries.reduce((s, t) => {
          if (isZeitBlock && t.von && t.bis) {
            const [vh, vm] = t.von.split(":").map(Number);
            const [bh, bm] = t.bis.split(":").map(Number);
            return s + (bh * 60 + bm - (vh * 60 + vm));
          }
          return s + Math.round(t.hours * 60);
        }, 0);

        return (
          <div
            key={`detail-${String(er.employeeId)}`}
            style={{ marginBottom: "24px" }}
            className="report-section"
          >
            <div style={subTitleStyle}>{er.employeeName}</div>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={{ ...thStyle, whiteSpace: "nowrap" }}>Datum</th>
                  <th style={thStyle}>Bemerkung</th>
                  <th style={thRightStyle}>Dauer</th>
                </tr>
              </thead>
              <tbody>
                {empEntries.map((t, idx) => {
                  const dauer =
                    isZeitBlock && t.von && t.bis
                      ? vonBisDuration(t.von, t.bis)
                      : hoursToHHMM(t.hours);
                  return (
                    <tr
                      key={String(t.id)}
                      style={{
                        backgroundColor: idx % 2 === 0 ? "white" : "#f7fafa",
                      }}
                    >
                      <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>
                        {fmtDate(t.date)}
                      </td>
                      <td style={{ ...tdStyle, color: "#555" }}>
                        {t.description || svcName(t.serviceTypeId) || "–"}
                      </td>
                      <td style={{ ...tdRightStyle, whiteSpace: "nowrap" }}>
                        {dauer}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={2} style={footerTdStyle}>
                    Total {er.employeeName}
                  </td>
                  <td style={footerTdRightStyle}>
                    {minutesToHHMM(empTotalMins)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        );
      })}

      {/* Grand total */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "8px 12px",
          backgroundColor: "#e8f0f0",
          border: "1px solid #ccd9d9",
          borderTop: "2px solid #006066",
          marginBottom: "32px",
          fontWeight: "bold",
        }}
      >
        <span style={{ fontSize: "13px", color: "#006066" }}>
          Gesamttotal aller Mitarbeiter
        </span>
        <span style={{ fontSize: "14px", color: "#006066" }}>
          {hoursToHHMM(budgetReport.totalStunden)}
        </span>
      </div>

      {/* ══ UNTERSCHRIFTENBEREICH ══ */}
      <div
        style={{ marginTop: "40px", marginBottom: "24px" }}
        className="report-section"
      >
        <div
          style={{
            fontWeight: "bold",
            fontSize: "12px",
            color: "#666",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            marginBottom: "24px",
          }}
        >
          Genehmigung
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "48px",
          }}
        >
          <div>
            <div
              style={{
                borderBottom: "1px solid #333",
                height: "32px",
                marginBottom: "8px",
              }}
            />
            <div style={{ fontSize: "11px", color: "#666" }}>
              Kunde / Auftraggeber
            </div>
            <div
              style={{ fontSize: "12px", fontWeight: "600", marginTop: "2px" }}
            >
              {customerName}
            </div>
          </div>
          <div>
            <div
              style={{
                borderBottom: "1px solid #333",
                height: "32px",
                marginBottom: "8px",
              }}
            />
            <div style={{ fontSize: "11px", color: "#666" }}>
              Mitarbeiter / Leistungserbringer
            </div>
            <div
              style={{ fontSize: "12px", fontWeight: "600", marginTop: "2px" }}
            >
              {currentUserName}
            </div>
          </div>
        </div>
      </div>

      <BudgetReportFooter company={company} />
    </div>
  );
}

// ─── Standard Report Content (original) ────────────────────────────────────────

function StandardReportContent({ data }: { data: ReportState }) {
  const {
    timeEntries,
    company,
    customer,
    project,
    employees,
    serviceTypes,
    dateFrom,
    dateTo,
    currentUserName,
  } = data;

  const empName = (id: bigint) => {
    const e = employees.find((x) => String(x.id) === String(id));
    return e ? `${e.firstName} ${e.lastName}` : String(id);
  };
  const svcName = (id: bigint) =>
    serviceTypes.find((s) => String(s.id) === String(id))?.name ?? "–";

  const isZeitBlock = project?.erfassungsart === "zeitBlock";

  const sorted = [...timeEntries].sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? -1 : 1;
    if (a.von && b.von) return a.von < b.von ? -1 : 1;
    return 0;
  });

  const empTotals = new Map<string, number>();
  for (const t of sorted) {
    const k = String(t.employeeId);
    empTotals.set(k, (empTotals.get(k) ?? 0) + t.hours);
  }

  const svcTotals = new Map<string, number>();
  for (const t of sorted) {
    const k = String(t.serviceTypeId);
    svcTotals.set(k, (svcTotals.get(k) ?? 0) + t.hours);
  }

  const empSvcTotals = new Map<string, Map<string, number>>();
  for (const t of sorted) {
    const ek = String(t.employeeId);
    const sk = String(t.serviceTypeId);
    if (!empSvcTotals.has(ek)) empSvcTotals.set(ek, new Map());
    const inner = empSvcTotals.get(ek)!;
    inner.set(sk, (inner.get(sk) ?? 0) + t.hours);
  }

  const entriesByEmp = new Map<string, TimeEntry[]>();
  for (const t of sorted) {
    const k = String(t.employeeId);
    if (!entriesByEmp.has(k)) entriesByEmp.set(k, []);
    entriesByEmp.get(k)!.push(t);
  }

  const grandTotal = sorted.reduce((s, t) => s + t.hours, 0);
  const customerName = customer?.name ?? "–";
  const projectName = project?.name ?? "–";

  const headerSection = (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "16px",
        }}
      >
        <div>
          {company?.logoUrl && company.logoUrl.length > 0 && (
            <img
              src={company.logoUrl}
              alt="Logo"
              style={{
                height: "36px",
                maxWidth: "120px",
                marginBottom: "8px",
                display: "block",
                objectFit: "contain",
                printColorAdjust: "exact",
              }}
            />
          )}
          <div
            style={{ fontWeight: "bold", fontSize: "18px", color: "#006066" }}
          >
            {company?.name ?? "Firma"}
          </div>
          {company?.address && (
            <div style={{ fontSize: "11px", color: "#666", marginTop: "2px" }}>
              {company.address}
            </div>
          )}
        </div>
        <div style={{ textAlign: "right" }}>
          <div
            style={{ fontWeight: "bold", fontSize: "15px", color: "#006066" }}
          >
            iReport Onchain
          </div>
          <div style={{ fontSize: "11px", color: "#888", marginTop: "2px" }}>
            Leistungsrapport
          </div>
        </div>
      </div>
      <div style={{ marginBottom: "12px" }}>
        <div style={{ fontWeight: "bold", fontSize: "16px", color: "#1a1a1a" }}>
          Projektauswertung {customerName} – {projectName}
        </div>
        <div style={{ fontSize: "12px", color: "#444", marginTop: "4px" }}>
          Zeitraum: {fmtDateRange(dateFrom, dateTo)}
          &nbsp;&nbsp;|&nbsp;&nbsp;Ausgestellt am: {todayDisplay()}
        </div>
      </div>
      <hr
        style={{
          border: "none",
          borderTop: "2px solid #006066",
          marginBottom: "20px",
        }}
      />
    </div>
  );

  if (sorted.length === 0) {
    return (
      <div style={{ padding: "24px", maxWidth: "900px", margin: "0 auto" }}>
        {headerSection}
        <div
          style={{
            textAlign: "center",
            padding: "40px",
            color: "#888",
            fontSize: "14px",
          }}
        >
          Keine Zeiterfassungen für den gewählten Zeitraum und das gewählte
          Projekt.
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", maxWidth: "900px", margin: "0 auto" }}>
      {headerSection}

      <div style={{ marginBottom: "20px" }} className="report-section">
        <div style={sectionTitleStyle}>Gesamtübersicht</div>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Mitarbeiter</th>
              <th style={thRightStyle}>Gesamtdauer</th>
            </tr>
          </thead>
          <tbody>
            {Array.from(empTotals.entries()).map(([eid, hours], idx) => (
              <tr
                key={eid}
                style={{
                  backgroundColor: idx % 2 === 0 ? "white" : "#f7fafa",
                }}
              >
                <td style={tdStyle}>{empName(BigInt(eid))}</td>
                <td style={tdRightStyle}>{hoursToHHMM(hours)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td style={footerTdStyle}>Gesamttotal</td>
              <td style={footerTdRightStyle}>{hoursToHHMM(grandTotal)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div style={{ marginBottom: "20px" }} className="report-section">
        <div style={sectionTitleStyle}>Auswertung nach Leistungsart</div>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Leistungsart</th>
              <th style={thRightStyle}>Gesamtdauer</th>
            </tr>
          </thead>
          <tbody>
            {Array.from(svcTotals.entries()).map(([sid, hours], idx) => (
              <tr
                key={sid}
                style={{
                  backgroundColor: idx % 2 === 0 ? "white" : "#f7fafa",
                }}
              >
                <td style={tdStyle}>{svcName(BigInt(sid))}</td>
                <td style={tdRightStyle}>{hoursToHHMM(hours)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td style={footerTdStyle}>Gesamttotal</td>
              <td style={footerTdRightStyle}>{hoursToHHMM(grandTotal)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div style={{ marginBottom: "20px" }} className="report-section">
        <div style={sectionTitleStyle}>Mitarbeiter-Übersicht</div>
        {Array.from(empSvcTotals.entries()).map(([eid, svcMap]) => {
          const empTotal = empTotals.get(eid) ?? 0;
          return (
            <div key={eid} style={{ marginBottom: "12px" }}>
              <div style={subTitleStyle}>
                Mitarbeiter: {empName(BigInt(eid))}
              </div>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Leistungsart</th>
                    <th style={thRightStyle}>Dauer</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from(svcMap.entries()).map(([sid, hours], idx) => (
                    <tr
                      key={sid}
                      style={{
                        backgroundColor: idx % 2 === 0 ? "white" : "#f7fafa",
                      }}
                    >
                      <td style={tdStyle}>{svcName(BigInt(sid))}</td>
                      <td style={tdRightStyle}>{hoursToHHMM(hours)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td style={footerTdStyle}>Total {empName(BigInt(eid))}</td>
                    <td style={footerTdRightStyle}>{hoursToHHMM(empTotal)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          );
        })}
      </div>

      <div className="page-break" />

      <div style={{ marginBottom: "20px" }}>
        <div style={sectionTitleStyle}>Detaillierte Leistungsübersicht</div>
      </div>

      {Array.from(entriesByEmp.entries()).map(([eid, entries]) => {
        const empTotal = empTotals.get(eid) ?? 0;
        return (
          <div
            key={eid}
            style={{ marginBottom: "28px" }}
            className="report-section"
          >
            <div
              style={{
                fontWeight: "bold",
                fontSize: "13px",
                color: "#006066",
                padding: "6px 0 4px",
                borderBottom: "1px solid #006066",
                marginBottom: "0",
              }}
            >
              Leistungserfassung – {empName(BigInt(eid))}
            </div>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={{ ...thStyle, whiteSpace: "nowrap" }}>Datum</th>
                  <th style={thStyle}>Zeit</th>
                  <th style={thStyle}>Leistungsart</th>
                  <th style={thStyle}>Bemerkung</th>
                  <th style={thRightStyle}>Dauer</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((t, idx) => {
                  const zeitDisplay =
                    isZeitBlock && t.von && t.bis ? `${t.von} – ${t.bis}` : "–";
                  const dauer =
                    isZeitBlock && t.von && t.bis
                      ? vonBisDuration(t.von, t.bis)
                      : hoursToHHMM(t.hours);
                  return (
                    <tr
                      key={String(t.id)}
                      style={{
                        backgroundColor: idx % 2 === 0 ? "white" : "#f7fafa",
                      }}
                    >
                      <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>
                        {fmtDate(t.date)}
                      </td>
                      <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>
                        {zeitDisplay}
                      </td>
                      <td style={tdStyle}>{svcName(t.serviceTypeId)}</td>
                      <td style={{ ...tdStyle, color: "#555" }}>
                        {t.description || "–"}
                      </td>
                      <td style={{ ...tdRightStyle, whiteSpace: "nowrap" }}>
                        {dauer}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={4} style={footerTdStyle}>
                    Total {empName(BigInt(eid))}
                  </td>
                  <td style={footerTdRightStyle}>{hoursToHHMM(empTotal)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        );
      })}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "8px 12px",
          backgroundColor: "#e8f0f0",
          border: "1px solid #ccd9d9",
          borderTop: "2px solid #006066",
          marginBottom: "32px",
          fontWeight: "bold",
        }}
      >
        <span style={{ fontSize: "13px", color: "#006066" }}>
          Gesamttotal aller Mitarbeiter
        </span>
        <span style={{ fontSize: "14px", color: "#006066" }}>
          {hoursToHHMM(grandTotal)}
        </span>
      </div>

      <div
        style={{ marginTop: "40px", marginBottom: "24px" }}
        className="report-section"
      >
        <div
          style={{
            fontWeight: "bold",
            fontSize: "12px",
            color: "#666",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            marginBottom: "24px",
          }}
        >
          Genehmigung
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "48px",
          }}
        >
          <div>
            <div
              style={{
                borderBottom: "1px solid #333",
                height: "32px",
                marginBottom: "8px",
              }}
            />
            <div style={{ fontSize: "11px", color: "#666" }}>
              Kunde / Auftraggeber
            </div>
            <div
              style={{ fontSize: "12px", fontWeight: "600", marginTop: "2px" }}
            >
              {customerName}
            </div>
          </div>
          <div>
            <div
              style={{
                borderBottom: "1px solid #333",
                height: "32px",
                marginBottom: "8px",
              }}
            />
            <div style={{ fontSize: "11px", color: "#666" }}>
              Mitarbeiter / Leistungserbringer
            </div>
            <div
              style={{ fontSize: "12px", fontWeight: "600", marginTop: "2px" }}
            >
              {currentUserName}
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          borderTop: "1px solid #ccd9d9",
          paddingTop: "10px",
          marginTop: "20px",
          color: "#888",
          fontSize: "11px",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span>
          {company?.name ?? ""}
          {company?.address ? ` | ${company.address}` : ""}
        </span>
        <span>Erstellt am {todayDisplay()}</span>
      </div>
    </div>
  );
}
