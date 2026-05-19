import { createActor } from "@/backend";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Download, FileSpreadsheet } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { Employee } from "../../backend.d";
import {
  type BillingCalculationResult,
  calculateBilling,
} from "../../lib/billingCalculationService";
import { exportToCSV } from "../../lib/licenseBillingExportService";
import { BillingPeriodFilter, deToIso, isoToDe } from "./BillingPeriodFilter";
import { LicenseBillingTable } from "./LicenseBillingTable";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDateDE(date: Date): string {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}

function parseDateDE(de: string): Date | null {
  const [dd, mm, yyyy] = de.split(".");
  if (!dd || !mm || !yyyy) return null;
  const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  return Number.isNaN(d.getTime()) ? null : d;
}

function defaultFromDate(): string {
  const now = new Date();
  // Von = 1st of the month exactly 12 months before the current month
  // For May 2026 (month=4): new Date(2025, 5, 1) = June 1, 2025 → 12-month window ending in May 2026
  return formatDateDE(new Date(now.getFullYear() - 1, now.getMonth() + 1, 1));
}

function defaultToDate(): string {
  const now = new Date();
  // Last day of current month
  return formatDateDE(new Date(now.getFullYear(), now.getMonth() + 1, 0));
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface CompanyFullInfo {
  id: string;
  name: string;
  address?: string;
  createdAt: bigint;
  isActive: boolean;
}

interface TenantBillingDetailViewProps {
  company: CompanyFullInfo;
  /** Plan's minActiveDaysPerMonth used as default kulanz */
  defaultKulanzDays: number;
  onBack: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function TenantBillingDetailView({
  company,
  defaultKulanzDays,
  onBack,
}: TenantBillingDetailViewProps) {
  const { actor, isFetching } = useActor(createActor);

  // ── Filter state ─────────────────────────────────────────────
  const [fromDate, setFromDate] = useState(defaultFromDate);
  const [toDate, setToDate] = useState(defaultToDate);
  const [kulanzDays, setKulanzDays] = useState(defaultKulanzDays);
  // Applied values (only change on "Anzeigen" click)
  const [appliedFrom, setAppliedFrom] = useState(fromDate);
  const [appliedTo, setAppliedTo] = useState(toDate);
  const [appliedKulanz, setAppliedKulanz] = useState(kulanzDays);

  // Sync default kulanz when prop changes (e.g. plan loads async)
  useEffect(() => {
    setKulanzDays(defaultKulanzDays);
    setAppliedKulanz(defaultKulanzDays);
  }, [defaultKulanzDays]);

  // ── Employees query ──────────────────────────────────────────
  const { data: employees = [], isLoading: loadingEmployees } = useQuery<
    Employee[]
  >({
    queryKey: ["companyEmployeesForBilling", company.id],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCompanyEmployeesForBilling(BigInt(company.id));
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
  });

  // Derive contact person: first employee with admin role
  const contactPerson = employees.find((e: Employee) => e.role === "admin");

  // ── Calculation ───────────────────────────────────────────────
  const result = useMemo<BillingCalculationResult | null>(() => {
    if (loadingEmployees || employees.length === 0) return null;
    const from = parseDateDE(appliedFrom);
    const to = parseDateDE(appliedTo);
    if (!from || !to || from > to) return null;
    return calculateBilling(employees, from, to, appliedKulanz);
  }, [employees, appliedFrom, appliedTo, appliedKulanz, loadingEmployees]);

  function handleApply() {
    setAppliedFrom(fromDate);
    setAppliedTo(toDate);
    setAppliedKulanz(kulanzDays);
  }

  function handleExportCSV() {
    if (!result) return;
    const from = parseDateDE(appliedFrom);
    const to = parseDateDE(appliedTo);
    if (!from || !to) return;
    exportToCSV(company.name, from, to, appliedKulanz, result);
  }

  return (
    <div className="space-y-6" data-ocid="billing.tenant_detail_view">
      {/* ── Back button ───────────────────────────────────────── */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="gap-1.5 -ml-1 text-muted-foreground hover:text-foreground"
        data-ocid="billing.back_button"
      >
        <ArrowLeft className="w-4 h-4" />
        Zur Abrechnungsübersicht
      </Button>

      {/* ── Document header ───────────────────────────────────── */}
      <div
        className="rounded-xl overflow-hidden border border-border"
        data-ocid="billing.detail_header"
      >
        {/* Dark blue header band */}
        <div className="px-6 py-5" style={{ backgroundColor: "#00182b" }}>
          <p className="text-sm font-medium text-white/70 uppercase tracking-wider mb-0.5">
            iReport Onchain Abrechnung
          </p>
          <h2 className="text-xl font-bold text-white">
            Kunde – {company.name}
          </h2>
        </div>

        {/* Company info */}
        <div className="px-6 py-4 bg-card border-t border-border">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Adresse</p>
              {company.address ? (
                <p className="text-foreground">{company.address}</p>
              ) : (
                <p className="text-muted-foreground italic">
                  Keine Adressdaten verfügbar
                </p>
              )}
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">
                Kontaktperson (Admin)
              </p>
              {contactPerson ? (
                <div>
                  <p className="text-foreground">
                    {contactPerson.firstName} {contactPerson.lastName}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {contactPerson.email}
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground">—</p>
              )}
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Status</p>
              <span
                className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                  company.isActive
                    ? "bg-green-100 text-green-700"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {company.isActive ? "Aktiv" : "Inaktiv"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Filter ───────────────────────────────────────────────── */}
      <div
        className="bg-card border border-border rounded-xl p-4"
        data-ocid="billing.filter_section"
      >
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Abrechnungszeitraum
        </p>
        <BillingPeriodFilter
          fromDate={fromDate}
          toDate={toDate}
          kulanzDays={kulanzDays}
          onFromDateChange={setFromDate}
          onToDateChange={setToDate}
          onKulanzChange={setKulanzDays}
          onApply={handleApply}
          isLoading={loadingEmployees}
        />
        <p className="mt-2 text-[11px] text-muted-foreground">
          Kulanz: Mindesttage im Monat, ab denen ein Monat als lizenzpflichtig
          gilt. Aktueller Planwert: <strong>{defaultKulanzDays} Tage</strong>.
        </p>
      </div>

      {/* ── License table ────────────────────────────────────────── */}
      <div className="space-y-3" data-ocid="billing.license_section">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Lizenzen</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Zeitraum: {appliedFrom} – {appliedTo} · Kulanz: {appliedKulanz}{" "}
              Tage
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5 h-8"
            disabled={!result || result.employeeResults.length === 0}
            onClick={handleExportCSV}
            data-ocid="billing.csv_export_button"
          >
            <Download className="w-3.5 h-3.5" />
            CSV exportieren
          </Button>
        </div>

        {loadingEmployees ? (
          <div
            className="space-y-2"
            data-ocid="billing.license_table_loading_state"
          >
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : !result ? (
          <div
            className="rounded-lg border-2 border-dashed border-border py-10 text-center"
            data-ocid="billing.license_table_empty_state"
          >
            <FileSpreadsheet className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Keine Daten für den gewählten Zeitraum.
            </p>
          </div>
        ) : (
          <LicenseBillingTable result={result} />
        )}

        {result && (
          <div
            className="flex items-center justify-between rounded-lg bg-primary/5 border border-primary/20 px-4 py-3"
            data-ocid="billing.summary_panel"
          >
            <div className="flex items-center gap-6 flex-wrap">
              <div className="text-center">
                <p className="text-[11px] text-muted-foreground uppercase tracking-wide">
                  Mitarbeitende
                </p>
                <p className="text-lg font-bold text-foreground">
                  {result.employeeResults.length}
                </p>
              </div>
              <div className="text-center">
                <p className="text-[11px] text-muted-foreground uppercase tracking-wide">
                  Monate
                </p>
                <p className="text-lg font-bold text-foreground">
                  {result.months.length}
                </p>
              </div>
              <div className="text-center">
                <p className="text-[11px] text-muted-foreground uppercase tracking-wide">
                  Total Lizenzen
                </p>
                <p className="text-xl font-bold" style={{ color: "#006066" }}>
                  {result.totalLicenses}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
