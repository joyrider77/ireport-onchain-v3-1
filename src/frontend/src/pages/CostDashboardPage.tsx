import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  BarChart2,
  Camera,
  ChevronDown,
  ChevronUp,
  Cpu,
  HardDrive,
  RefreshCw,
  Save,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { createActor } from "../backend";
import type {
  CanisterStatusInfo,
  CostDashboardData,
  CostSettings,
  CycleSnapshot,
  TenantCostEntry,
} from "../backend.d";
import { Layout } from "../components/Layout";
import { useAuth } from "../hooks/useAuthStore";

// ────────────────────────────────────────────────────────────────
// Canister IDs from environment (injected by vite-plugin-environment)
// ────────────────────────────────────────────────────────────────
const ENV_FRONTEND_CANISTER_ID: string =
  (import.meta.env.CANISTER_ID_FRONTEND as string | undefined) ||
  (import.meta.env.CANISTER_ID_ireport_onchain_frontend as
    | string
    | undefined) ||
  "";

// ────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────

type AnyActor = Record<string, (...args: unknown[]) => Promise<unknown>>;
const toAny = (a: unknown): AnyActor => a as AnyActor;

type TimePeriod = "daily" | "weekly" | "monthly" | "custom";

// ────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────

function formatCycles(n: bigint | number): string {
  const num = typeof n === "bigint" ? Number(n) : n;
  if (num >= 1e12) return `${(num / 1e12).toFixed(3)} T`;
  if (num >= 1e9) return `${(num / 1e9).toFixed(1)} G`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(1)} M`;
  return num.toLocaleString("de-CH");
}

function formatMemoryMB(bytes: bigint | number): string {
  const b = typeof bytes === "bigint" ? Number(bytes) : bytes;
  if (b >= 1_073_741_824) return `${(b / 1_073_741_824).toFixed(2)} GB`;
  if (b >= 1_048_576) return `${(b / 1_048_576).toFixed(1)} MB`;
  if (b >= 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${b} B`;
}

function cyclesToUsd(cycles: bigint | number, icpPriceUsd: number): number {
  const num = typeof cycles === "bigint" ? Number(cycles) : cycles;
  return (num / 1e12) * icpPriceUsd;
}

function usdToChf(usd: number, rate: number): number {
  return usd * rate;
}

function formatChf(n: number): string {
  return `CHF ${n.toFixed(2)}`;
}

function formatUsd(n: number): string {
  return `USD ${n.toFixed(2)}`;
}

function formatTs(ns: bigint): string {
  const ms = Number(ns / 1_000_000n);
  const d = new Date(ms);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}.${mm}`;
}

function formatTsFull(ns: bigint): string {
  const ms = Number(ns / 1_000_000n);
  const d = new Date(ms);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${dd}.${mm}.${yyyy} ${hh}:${min}`;
}

function nowNanos(): bigint {
  return BigInt(Date.now()) * 1_000_000n;
}

function subtractPeriod(period: TimePeriod): bigint {
  const now = Date.now();
  let from = now;
  if (period === "daily") from = now - 86_400_000;
  else if (period === "weekly") from = now - 7 * 86_400_000;
  else if (period === "monthly") from = now - 30 * 86_400_000;
  return BigInt(from) * 1_000_000n;
}

// ────────────────────────────────────────────────────────────────
// Chart styles
// ────────────────────────────────────────────────────────────────

const CHART_STYLE = { fontSize: 11, fill: "oklch(0.5 0.015 220)" };
const TOOLTIP_STYLE = {
  borderRadius: "6px",
  border: "1px solid oklch(0.92 0.02 255)",
  fontSize: 12,
  background: "oklch(1.0 0 0)",
  color: "oklch(0.25 0.02 250)",
};

const COLOR_FRONTEND = "#006066";
const COLOR_BACKEND = "#e07b39";
const COLOR_STORAGE = "#4a9b9e";

// ────────────────────────────────────────────────────────────────
// Live / Manual badge helpers
// ────────────────────────────────────────────────────────────────

function LiveBadge() {
  return (
    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300 font-semibold gap-1 text-xs">
      <Wifi className="w-3 h-3" />
      Live
    </Badge>
  );
}

function ManualBadge() {
  return (
    <Badge variant="secondary" className="font-semibold gap-1 text-xs">
      <WifiOff className="w-3 h-3" />
      Manuell
    </Badge>
  );
}

// ────────────────────────────────────────────────────────────────
// Canister Status Card
// ────────────────────────────────────────────────────────────────

interface CanisterStatusCardProps {
  statusInfo: CanisterStatusInfo | null;
  statusError: boolean;
  statusLoading: boolean;
  latestSnapshot: CycleSnapshot | null;
  onOpenSettings: () => void;
  /** Frontend Canister ID from backend state (getPlatformAdminConfig / getCostDashboardData) */
  backendFrontendCanisterId?: string | null;
}

function CanisterStatusCard({
  statusInfo,
  statusError,
  statusLoading,
  latestSnapshot,
  onOpenSettings,
  backendFrontendCanisterId,
}: CanisterStatusCardProps) {
  // Prefer saved value from backend state; fall back to statusInfo, then build-time env var
  const frontendId =
    backendFrontendCanisterId && backendFrontendCanisterId.trim() !== ""
      ? backendFrontendCanisterId.trim()
      : statusInfo?.frontendCanisterId &&
          statusInfo.frontendCanisterId.trim() !== ""
        ? statusInfo.frontendCanisterId.trim()
        : ENV_FRONTEND_CANISTER_ID || null;

  if (statusLoading) {
    return (
      <Card data-ocid="cost-dashboard.canister_status_card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Cpu className="w-4 h-4 text-primary" />
            Canister Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Skeleton className="h-24 rounded-lg" />
            <Skeleton className="h-24 rounded-lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (statusError && !statusInfo) {
    return (
      <Card
        data-ocid="cost-dashboard.canister_status_card"
        className="border-amber-200 bg-amber-50/50"
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Cpu className="w-4 h-4 text-amber-600" />
            Canister Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            data-ocid="cost-dashboard.canister_status_error_state"
            className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 bg-amber-100/80 border border-amber-200 rounded-lg"
          >
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5 sm:mt-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-amber-800">
                Canister-Status nicht verfügbar
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                Berechtigungsfehler oder Canister nicht erreichbar.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="border-amber-300 text-amber-800 hover:bg-amber-100 shrink-0"
              onClick={onOpenSettings}
              data-ocid="cost-dashboard.canister_status_manual_button"
            >
              Manuell eingeben
            </Button>
          </div>

          {/* Still show canister IDs if available */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            <CanisterIdBox
              label="Backend Canister ID"
              id={null}
              badge={<ManualBadge />}
              ocid="cost-dashboard.backend_canister_id"
            />
            <CanisterIdBox
              label="Frontend Canister ID"
              id={frontendId}
              badge={<ManualBadge />}
              ocid="cost-dashboard.frontend_canister_id"
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Live data available
  const isLive = statusInfo?.dataSource === "live";
  const backendCycles = statusInfo?.backendCycles ?? 0n;
  const backendMemory = statusInfo?.backendMemorySize ?? 0n;
  const backendStatus = statusInfo?.backendStatus ?? "—";
  const backendId = statusInfo?.backendCanisterId ?? null;

  // Frontend: from snapshot only
  const frontendCycles = latestSnapshot?.frontendCycles ?? null;
  const snapshotTs = latestSnapshot?.timestamp ?? null;

  return (
    <Card data-ocid="cost-dashboard.canister_status_card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Cpu className="w-4 h-4 text-primary" />
            Canister Status
          </CardTitle>
          {isLive ? <LiveBadge /> : <ManualBadge />}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Backend — Live */}
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <span
                className="inline-block w-2.5 h-2.5 rounded-full bg-primary"
                aria-hidden="true"
              />
              Backend Canister
            </p>
            {isLive ? <LiveBadge /> : <ManualBadge />}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatusMetric
              label="Canister ID"
              value={
                <span className="font-mono text-xs break-all">
                  {backendId || "—"}
                </span>
              }
              ocid="cost-dashboard.backend_canister_id"
              colSpan
            />
            <StatusMetric
              label="Cycles"
              value={
                <span className="text-base font-bold tabular-nums">
                  {formatCycles(backendCycles)}
                </span>
              }
              ocid="cost-dashboard.backend_cycles_live"
              icon={<Cpu className="w-3.5 h-3.5 text-primary" />}
            />
            <StatusMetric
              label="Memory"
              value={
                <span className="text-base font-bold tabular-nums">
                  {formatMemoryMB(backendMemory)}
                </span>
              }
              ocid="cost-dashboard.backend_memory_live"
              icon={<HardDrive className="w-3.5 h-3.5 text-amber-600" />}
            />
            <StatusMetric
              label="Status"
              value={
                backendStatus === "running" ? (
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300 text-xs font-semibold">
                    Läuft
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs">
                    {backendStatus}
                  </Badge>
                )
              }
              ocid="cost-dashboard.backend_status_live"
            />
          </div>
        </div>

        {/* Frontend — Manual/Snapshot */}
        <div className="rounded-lg border border-border bg-muted/20 p-4">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <span
                className="inline-block w-2.5 h-2.5 rounded-full bg-[#4a9b9e]"
                aria-hidden="true"
              />
              Frontend Canister
            </p>
            <ManualBadge />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <StatusMetric
              label="Canister ID"
              value={
                <span className="font-mono text-xs break-all">
                  {frontendId || "—"}
                </span>
              }
              ocid="cost-dashboard.frontend_canister_id"
              colSpan
            />
            <StatusMetric
              label="Cycles (Snapshot)"
              value={
                frontendCycles != null ? (
                  <span className="text-base font-bold tabular-nums">
                    {formatCycles(frontendCycles)}
                  </span>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    Nicht verfügbar
                  </span>
                )
              }
              ocid="cost-dashboard.frontend_cycles_snapshot"
              icon={<Cpu className="w-3.5 h-3.5 text-[#4a9b9e]" />}
            />
            <StatusMetric
              label="Letzter Snapshot"
              value={
                snapshotTs != null ? (
                  <span className="text-sm tabular-nums text-foreground">
                    {formatTsFull(snapshotTs)}
                  </span>
                ) : (
                  <span className="text-sm text-muted-foreground">—</span>
                )
              }
              ocid="cost-dashboard.frontend_snapshot_ts"
            />
          </div>
          {frontendCycles == null && (
            <p className="text-xs text-muted-foreground mt-3">
              Kein Frontend-Snapshot vorhanden. Snapshots werden automatisch
              aufgezeichnet oder über «Snapshot jetzt aufzeichnen» in den
              Einstellungen manuell ausgelöst.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Small helper for metric cells
function StatusMetric({
  label,
  value,
  ocid,
  icon,
  colSpan,
}: {
  label: string;
  value: React.ReactNode;
  ocid: string;
  icon?: React.ReactNode;
  colSpan?: boolean;
}) {
  return (
    <div
      data-ocid={ocid}
      className={`flex flex-col gap-0.5 min-w-0 ${colSpan ? "col-span-2 sm:col-span-4" : ""}`}
    >
      <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
        {icon}
        {label}
      </p>
      <div className="mt-0.5">{value}</div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// Canister ID box (used in error state)
// ────────────────────────────────────────────────────────────────

function CanisterIdBox({
  label,
  id,
  badge,
  ocid,
}: {
  label: string;
  id: string | null;
  badge: React.ReactNode;
  ocid: string;
}) {
  return (
    <div className="bg-muted/40 border border-border rounded-lg px-4 py-3">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        {badge}
      </div>
      <p
        data-ocid={ocid}
        className="text-xs font-mono text-foreground break-all"
      >
        {id || "—"}
      </p>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// Settings Panel
// ────────────────────────────────────────────────────────────────

interface SettingsPanelProps {
  settings: CostSettings | null;
  onSaved: () => void;
  forceOpen?: boolean;
}

function SettingsPanel({ settings, onSaved, forceOpen }: SettingsPanelProps) {
  const { actor } = useActor(createActor);
  const [collapsed, setCollapsed] = useState(!forceOpen);
  const [icpPrice, setIcpPrice] = useState<string>(
    String(settings?.icpPriceUsd ?? 8.0),
  );
  const [usdChf, setUsdChf] = useState<string>(
    String(settings?.usdChfRate ?? 0.88),
  );
  const [alertEnabled, setAlertEnabled] = useState(
    settings?.alertEnabled ?? false,
  );
  const [frontendThreshold, setFrontendThreshold] = useState<string>(
    settings ? String(Number(settings.frontendAlertThreshold) / 1e12) : "0.5",
  );
  const [backendThreshold, setBackendThreshold] = useState<string>(
    settings ? String(Number(settings.backendAlertThreshold) / 1e12) : "0.5",
  );
  // Snapshot interval in hours
  const [snapshotIntervalHours, setSnapshotIntervalHours] =
    useState<string>("24");
  // Frontend Cycles manual input
  const [frontendCyclesInput, setFrontendCyclesInput] = useState<string>("0");

  // Load snapshot interval from backend
  const { data: snapshotIntervalSeconds } = useQuery<bigint>({
    queryKey: ["snapshotInterval"],
    queryFn: async () => {
      if (!actor) return 86400n;
      return toAny(actor).getSnapshotInterval() as Promise<bigint>;
    },
    enabled: !!actor,
  });

  // Sync interval to display state when backend value loads
  useEffect(() => {
    if (snapshotIntervalSeconds != null) {
      setSnapshotIntervalHours(
        String(Math.round(Number(snapshotIntervalSeconds) / 3600) || 24),
      );
    }
  }, [snapshotIntervalSeconds]);

  // If forceOpen changes, open the panel
  const isOpen = forceOpen ? true : !collapsed;

  // Single consolidated save mutation: saves settings + snapshot interval together
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Kein Aktor verfügbar");
      const payload: CostSettings = {
        icpPriceUsd: Number.parseFloat(icpPrice) || 8.0,
        usdChfRate: Number.parseFloat(usdChf) || 0.88,
        alertEnabled,
        frontendAlertThreshold: BigInt(
          Math.round((Number.parseFloat(frontendThreshold) || 0.5) * 1e12),
        ),
        backendAlertThreshold: BigInt(
          Math.round((Number.parseFloat(backendThreshold) || 0.5) * 1e12),
        ),
      };
      await toAny(actor).updateCostSettings(payload);
      // Also save snapshot interval in same operation
      const hours = Number.parseFloat(snapshotIntervalHours) || 24;
      await toAny(actor).setSnapshotInterval(BigInt(Math.round(hours * 3600)));
    },
    onSuccess: () => {
      toast.success("Einstellungen gespeichert.");
      onSaved();
    },
    onError: (err: Error) => {
      toast.error(`Fehler beim Speichern: ${err.message}`);
    },
  });

  const snapshotMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Kein Aktor verfügbar");
      // backendCycles param is ignored by backend (it captures live balance automatically)
      await toAny(actor).recordCycleSnapshot(
        BigInt(frontendCyclesInput || "0"),
        0n,
      );
    },
    onSuccess: () => {
      toast.success("Snapshot aufgezeichnet.");
      onSaved();
    },
    onError: (err: Error) => {
      toast.error(`Fehler: ${err.message}`);
    },
  });

  return (
    <Card data-ocid="cost-dashboard.settings_card">
      <CardHeader
        className="pb-2 cursor-pointer"
        onClick={() => !forceOpen && setCollapsed(!collapsed)}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Settings2Icon />
            Einstellungen
          </CardTitle>
          {!forceOpen &&
            (collapsed ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ))}
        </div>
      </CardHeader>
      {isOpen && (
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="icp-price" className="text-xs font-medium">
                ICP-Preis (USD)
              </Label>
              <Input
                id="icp-price"
                data-ocid="cost-dashboard.icp_price_input"
                type="number"
                step="0.01"
                min="0"
                value={icpPrice}
                onChange={(e) => setIcpPrice(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="usd-chf" className="text-xs font-medium">
                USD/CHF-Kurs
              </Label>
              <Input
                id="usd-chf"
                data-ocid="cost-dashboard.usd_chf_input"
                type="number"
                step="0.001"
                min="0"
                value={usdChf}
                onChange={(e) => setUsdChf(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fe-threshold" className="text-xs font-medium">
                Frontend Schwellenwert (T Cycles)
              </Label>
              <Input
                id="fe-threshold"
                data-ocid="cost-dashboard.frontend_threshold_input"
                type="number"
                step="0.1"
                min="0"
                value={frontendThreshold}
                onChange={(e) => setFrontendThreshold(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="be-threshold" className="text-xs font-medium">
                Backend Schwellenwert (T Cycles)
              </Label>
              <Input
                id="be-threshold"
                data-ocid="cost-dashboard.backend_threshold_input"
                type="number"
                step="0.1"
                min="0"
                value={backendThreshold}
                onChange={(e) => setBackendThreshold(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Switch
              id="alert-toggle"
              data-ocid="cost-dashboard.alert_toggle"
              checked={alertEnabled}
              onCheckedChange={setAlertEnabled}
            />
            <Label htmlFor="alert-toggle" className="text-sm cursor-pointer">
              Alert bei niedrigem Cycle-Stand aktivieren
            </Label>
          </div>

          {/* Snapshot interval */}
          <div className="border-t border-border pt-4">
            <Label className="text-xs font-medium block mb-2">
              Automatische Snapshots
            </Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                alle
              </span>
              <Input
                id="snapshot-interval"
                data-ocid="cost-dashboard.snapshot_interval_input"
                type="number"
                step="1"
                min="1"
                value={snapshotIntervalHours}
                onChange={(e) => setSnapshotIntervalHours(e.target.value)}
                className="h-8 text-sm w-20"
              />
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                Stunden
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1.5">
              Automatische Snapshots: alle {snapshotIntervalHours} Stunden
            </p>
          </div>

          {/* Frontend Cycles manual input */}
          <div className="border-t border-border pt-4">
            <Label
              htmlFor="frontend-cycles-input"
              className="text-xs font-medium block mb-1.5"
            >
              Frontend Canister Cycles (manuell eingeben)
            </Label>
            <Input
              id="frontend-cycles-input"
              data-ocid="cost-dashboard.frontend_cycles_input"
              type="number"
              min="0"
              value={frontendCyclesInput}
              onChange={(e) => setFrontendCyclesInput(e.target.value)}
              placeholder="z.B. 1000000000000"
              className="h-8 text-sm w-full max-w-xs"
            />
            <p className="text-[11px] text-muted-foreground mt-1.5">
              Wert vor Snapshot eingeben. Der Backend-Canister kann die Cycles
              des Frontend-Canisters nicht automatisch abfragen.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <Button
              data-ocid="cost-dashboard.save_button"
              size="sm"
              disabled={saveMutation.isPending}
              onClick={() => saveMutation.mutate()}
              className="gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              {saveMutation.isPending ? "Speichert…" : "Speichern"}
            </Button>
            <Button
              data-ocid="cost-dashboard.snapshot_button"
              variant="outline"
              size="sm"
              disabled={snapshotMutation.isPending}
              onClick={() => snapshotMutation.mutate()}
              className="gap-1.5"
            >
              <Camera className="w-3.5 h-3.5" />
              {snapshotMutation.isPending
                ? "Aufzeichnet…"
                : "Snapshot jetzt aufzeichnen"}
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

function Settings2Icon() {
  return (
    <svg
      role="img"
      aria-label="Einstellungen"
      className="w-4 h-4 text-primary"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
    </svg>
  );
}

// ────────────────────────────────────────────────────────────────
// Summary Cards
// ────────────────────────────────────────────────────────────────

interface SummaryCardsProps {
  snapshots: CycleSnapshot[];
  settings: CostSettings;
  liveBackendCycles?: bigint | null;
}

function SummaryCards({
  snapshots,
  settings,
  liveBackendCycles,
}: SummaryCardsProps) {
  const icpPrice = settings.icpPriceUsd;
  const chfRate = settings.usdChfRate;

  const latest = snapshots.length > 0 ? snapshots[snapshots.length - 1] : null;
  const prev = snapshots.length > 1 ? snapshots[snapshots.length - 2] : null;

  // Prefer live backend balance when available
  const beNow =
    liveBackendCycles != null
      ? Number(liveBackendCycles)
      : latest
        ? Number(latest.backendCycles)
        : 0;
  const feNow = latest ? Number(latest.frontendCycles) : 0;
  const fePrev = prev ? Number(prev.frontendCycles) : feNow;
  const bePrev = prev ? Number(prev.backendCycles) : beNow;

  const totalUsd = cyclesToUsd(feNow + beNow, icpPrice);
  const totalChf = usdToChf(totalUsd, chfRate);
  const prevTotalUsd = cyclesToUsd(fePrev + bePrev, icpPrice);

  const feTrend = feNow >= fePrev ? "up" : "down";
  const beTrend = beNow >= bePrev ? "up" : "down";
  const costTrend = totalUsd >= prevTotalUsd ? "up" : "down";

  const backendSub =
    liveBackendCycles != null
      ? "Live-Abfrage"
      : latest
        ? `Snapshot: ${formatTsFull(latest.timestamp)}`
        : "Kein Snapshot";

  const cards = [
    {
      label: "Frontend Cycles",
      value: formatCycles(feNow),
      sub: latest
        ? `Snapshot: ${formatTsFull(latest.timestamp)}`
        : "Kein Snapshot",
      trend: feTrend,
      color: "bg-primary/10",
      ocid: "cost-dashboard.card_frontend_cycles",
    },
    {
      label: "Backend Cycles",
      value: formatCycles(beNow),
      sub: backendSub,
      trend: beTrend,
      color: "bg-amber-500/10",
      ocid: "cost-dashboard.card_backend_cycles",
    },
    {
      label: "Gesamtkosten USD",
      value: formatUsd(totalUsd),
      sub: `ICP-Preis: ${formatUsd(icpPrice)}`,
      trend: costTrend,
      color: "bg-blue-500/10",
      ocid: "cost-dashboard.card_total_usd",
    },
    {
      label: "Gesamtkosten CHF",
      value: formatChf(totalChf),
      sub: `Kurs: 1 USD = ${chfRate.toFixed(3)} CHF`,
      trend: costTrend,
      color: "bg-emerald-500/10",
      ocid: "cost-dashboard.card_total_chf",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => (
        <Card key={c.ocid} data-ocid={c.ocid} className="shadow-card">
          <CardContent className="pt-5 pb-5 px-5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide truncate">
                  {c.label}
                </p>
                <p className="text-xl font-display font-bold text-foreground mt-1.5 tabular-nums truncate">
                  {c.value}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{c.sub}</p>
              </div>
              <div className={`p-2 rounded-lg flex-shrink-0 ${c.color}`}>
                {c.trend === "up" ? (
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// Alert Banner
// ────────────────────────────────────────────────────────────────

interface AlertBannerProps {
  snapshots: CycleSnapshot[];
  settings: CostSettings;
  liveBackendCycles?: bigint | null;
}

function AlertBanner({
  snapshots,
  settings,
  liveBackendCycles,
}: AlertBannerProps) {
  if (!settings.alertEnabled) return null;

  const latest = snapshots.length > 0 ? snapshots[snapshots.length - 1] : null;
  const alerts: string[] = [];

  const feCycles = latest?.frontendCycles ?? 0n;
  const beCycles = liveBackendCycles ?? latest?.backendCycles ?? 0n;

  if (latest && feCycles < settings.frontendAlertThreshold) {
    alerts.push(
      `Frontend Canister hat weniger als ${formatCycles(settings.frontendAlertThreshold)} Cycles (aktuell: ${formatCycles(feCycles)})`,
    );
  }
  if (beCycles > 0n && beCycles < settings.backendAlertThreshold) {
    alerts.push(
      `Backend Canister hat weniger als ${formatCycles(settings.backendAlertThreshold)} Cycles (aktuell: ${formatCycles(beCycles)})`,
    );
  }

  if (alerts.length === 0) return null;

  return (
    <div
      data-ocid="cost-dashboard.alert_banner"
      className="bg-red-50 border border-red-200 rounded-lg p-4 flex flex-col gap-1.5"
    >
      {alerts.map((msg) => (
        <div key={msg} className="flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm font-medium text-red-700">⚠ Warnung: {msg}</p>
        </div>
      ))}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// Chart 1: Cycle Verbrauch over time (with dataSource indicator)
// ────────────────────────────────────────────────────────────────

interface CycleLineChartProps {
  snapshots: CycleSnapshot[];
  dataSource: string;
}

function CycleLineChart({ snapshots, dataSource }: CycleLineChartProps) {
  const data = snapshots.map((s) => ({
    ts: formatTs(s.timestamp),
    frontend: Number(s.frontendCycles) / 1e12,
    backend: Number(s.backendCycles) / 1e12,
  }));

  return (
    <Card data-ocid="cost-dashboard.line_chart_card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-primary" />
            Cycle-Verbrauch über Zeit
          </CardTitle>
          {dataSource === "live" ? <LiveBadge /> : <ManualBadge />}
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <EmptyChart message="Noch keine Snapshots vorhanden. Snapshots werden automatisch aufgezeichnet." />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart
              data={data}
              margin={{ top: 4, right: 8, bottom: 4, left: -10 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="oklch(0.92 0.02 255)"
                vertical={false}
              />
              <XAxis
                dataKey="ts"
                tick={CHART_STYLE}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={CHART_STYLE}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => `${v.toFixed(1)} T`}
              />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                formatter={(v: number, name: string) => [
                  `${v.toFixed(3)} T Cycles`,
                  name === "frontend" ? "Frontend" : "Backend",
                ]}
              />
              <Legend
                wrapperStyle={{ fontSize: 12 }}
                formatter={(value) =>
                  value === "frontend" ? "Frontend" : "Backend"
                }
              />
              <Line
                type="monotone"
                dataKey="frontend"
                stroke={COLOR_FRONTEND}
                strokeWidth={2}
                dot={{ r: 3, fill: COLOR_FRONTEND }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="backend"
                stroke={COLOR_BACKEND}
                strokeWidth={2}
                dot={{ r: 3, fill: COLOR_BACKEND }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

// ────────────────────────────────────────────────────────────────
// Chart 2: Frontend vs Backend BarChart
// ────────────────────────────────────────────────────────────────

interface CompareBarChartProps {
  snapshots: CycleSnapshot[];
  liveBackendCycles?: bigint | null;
}

function CompareBarChart({
  snapshots,
  liveBackendCycles,
}: CompareBarChartProps) {
  const latest = snapshots.length > 0 ? snapshots[snapshots.length - 1] : null;

  const backendVal =
    liveBackendCycles != null
      ? Number(liveBackendCycles) / 1e12
      : latest
        ? Number(latest.backendCycles) / 1e12
        : null;

  const data =
    latest || liveBackendCycles != null
      ? [
          {
            name: "Frontend",
            cycles: latest ? Number(latest.frontendCycles) / 1e12 : 0,
            fill: COLOR_FRONTEND,
          },
          {
            name: "Backend",
            cycles: backendVal ?? 0,
            fill: COLOR_BACKEND,
          },
        ]
      : [];

  return (
    <Card data-ocid="cost-dashboard.compare_chart_card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base font-semibold">
            Frontend vs. Backend Canister
          </CardTitle>
          {liveBackendCycles != null && <LiveBadge />}
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <EmptyChart message="Noch keine Snapshot-Daten vorhanden." />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={data}
              margin={{ top: 4, right: 8, bottom: 4, left: -10 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="oklch(0.92 0.02 255)"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                tick={CHART_STYLE}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={CHART_STYLE}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => `${v.toFixed(1)} T`}
              />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                formatter={(v: number) => [
                  `${v.toFixed(3)} T Cycles`,
                  "Cycles",
                ]}
              />
              <Bar dataKey="cycles" radius={[4, 4, 0, 0]} maxBarSize={100}>
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

// ────────────────────────────────────────────────────────────────
// Chart 3: Tenant Cost Breakdown
// ────────────────────────────────────────────────────────────────

interface TenantTableProps {
  entries: TenantCostEntry[];
  settings: CostSettings;
}

function TenantCostTable({ entries, settings }: TenantTableProps) {
  const [sortDesc, setSortDesc] = useState(true);
  const totalCycles = entries.reduce(
    (s, e) => s + Number(e.estimatedCycles),
    0,
  );

  const sorted = [...entries].sort((a, b) => {
    const diff = Number(b.estimatedCycles) - Number(a.estimatedCycles);
    return sortDesc ? diff : -diff;
  });

  return (
    <Card data-ocid="cost-dashboard.tenant_table_card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">
            Kostenaufschlüsselung nach Mandant
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs gap-1"
            onClick={() => setSortDesc(!sortDesc)}
            data-ocid="cost-dashboard.tenant_sort_toggle"
          >
            {sortDesc ? (
              <TrendingDown className="w-3.5 h-3.5" />
            ) : (
              <TrendingUp className="w-3.5 h-3.5" />
            )}
            {sortDesc ? "Abst." : "Aufst."}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {sorted.length === 0 ? (
          <div
            data-ocid="cost-dashboard.tenant_table_empty_state"
            className="text-sm text-muted-foreground py-8 text-center"
          >
            Keine Mandantendaten verfügbar.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
                  <th className="text-left px-2 py-2 font-medium">Firma</th>
                  <th className="text-right px-2 py-2 font-medium hidden sm:table-cell">
                    Mitarb.
                  </th>
                  <th className="text-right px-2 py-2 font-medium">
                    Est. Cycles
                  </th>
                  <th className="text-right px-2 py-2 font-medium">Anteil</th>
                  <th className="text-right px-2 py-2 font-medium hidden md:table-cell">
                    Kosten USD
                  </th>
                  <th className="text-right px-2 py-2 font-medium">
                    Kosten CHF
                  </th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((e, idx) => {
                  const cycles = Number(e.estimatedCycles);
                  const pct =
                    totalCycles > 0
                      ? ((cycles / totalCycles) * 100).toFixed(1)
                      : "0.0";
                  const usd = cyclesToUsd(cycles, settings.icpPriceUsd);
                  const chf = usdToChf(usd, settings.usdChfRate);
                  return (
                    <tr
                      key={String(e.companyId)}
                      data-ocid={`cost-dashboard.tenant_row.${idx + 1}`}
                      className="border-b border-border/40 hover:bg-muted/20 transition-colors"
                    >
                      <td className="px-2 py-2.5 font-medium text-foreground">
                        {e.companyName}
                      </td>
                      <td className="px-2 py-2.5 text-right text-muted-foreground hidden sm:table-cell">
                        {Number(e.employeeCount)}
                      </td>
                      <td className="px-2 py-2.5 text-right tabular-nums text-foreground">
                        {formatCycles(cycles)}
                      </td>
                      <td className="px-2 py-2.5 text-right tabular-nums text-muted-foreground">
                        {pct} %
                      </td>
                      <td className="px-2 py-2.5 text-right tabular-nums text-muted-foreground hidden md:table-cell">
                        {formatUsd(usd)}
                      </td>
                      <td className="px-2 py-2.5 text-right tabular-nums font-medium text-foreground">
                        {formatChf(chf)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ────────────────────────────────────────────────────────────────
// Chart 4: Cost Categories PieChart
// ────────────────────────────────────────────────────────────────

interface CategoryPieChartProps {
  snapshots: CycleSnapshot[];
  settings: CostSettings;
  liveBackendCycles?: bigint | null;
}

function CategoryPieChart({
  snapshots,
  settings,
  liveBackendCycles,
}: CategoryPieChartProps) {
  const latest = snapshots.length > 0 ? snapshots[snapshots.length - 1] : null;
  const feCycles = latest ? Number(latest.frontendCycles) : 0;
  const beCycles =
    liveBackendCycles != null
      ? Number(liveBackendCycles)
      : latest
        ? Number(latest.backendCycles)
        : 0;

  const totalCycles = feCycles + beCycles;
  const totalUsd = cyclesToUsd(totalCycles, settings.icpPriceUsd);
  const totalChf = usdToChf(totalUsd, settings.usdChfRate);

  const data = [
    { name: "Hosting", value: 70, chf: totalChf * 0.7, fill: COLOR_FRONTEND },
    { name: "Storage", value: 20, chf: totalChf * 0.2, fill: COLOR_STORAGE },
    { name: "Bandbreite", value: 10, chf: totalChf * 0.1, fill: COLOR_BACKEND },
  ];

  return (
    <Card data-ocid="cost-dashboard.pie_chart_card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          Kosten nach Kategorie
        </CardTitle>
      </CardHeader>
      <CardContent>
        {totalCycles === 0 ? (
          <EmptyChart message="Noch keine Cycle-Daten für Kategorisierung." />
        ) : (
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <ResponsiveContainer width={200} height={200}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  dataKey="value"
                  paddingAngle={2}
                >
                  {data.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  formatter={(v: number, name: string) => [`${v}%`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2 min-w-0">
              {data.map((d) => (
                <div key={d.name} className="flex items-center gap-2">
                  <span
                    className="inline-block w-3 h-3 rounded-full flex-shrink-0"
                    style={{ background: d.fill }}
                  />
                  <span className="text-sm text-foreground font-medium w-24">
                    {d.name}
                  </span>
                  <span className="text-sm text-muted-foreground tabular-nums">
                    {d.value}% — {formatChf(d.chf)}
                  </span>
                </div>
              ))}
              <div className="mt-1 pt-2 border-t border-border">
                <span className="text-xs text-muted-foreground">
                  Total: {formatChf(totalChf)}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ────────────────────────────────────────────────────────────────
// Shared empty state for charts
// ────────────────────────────────────────────────────────────────

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-32 gap-2 text-center">
      <BarChart2 className="w-8 h-8 text-muted-foreground/30" />
      <p className="text-sm text-muted-foreground max-w-xs">{message}</p>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// Time Period Filter
// ────────────────────────────────────────────────────────────────

interface TimePeriodFilterProps {
  period: TimePeriod;
  onChange: (p: TimePeriod) => void;
  customFrom: string;
  customTo: string;
  onCustomFromChange: (v: string) => void;
  onCustomToChange: (v: string) => void;
}

function TimePeriodFilter({
  period,
  onChange,
  customFrom,
  customTo,
  onCustomFromChange,
  onCustomToChange,
}: TimePeriodFilterProps) {
  const options: { value: TimePeriod; label: string }[] = [
    { value: "daily", label: "Täglich" },
    { value: "weekly", label: "Wöchentlich" },
    { value: "monthly", label: "Monatlich" },
    { value: "custom", label: "Benutzerdefiniert" },
  ];

  return (
    <div
      className="flex flex-wrap items-center gap-2"
      data-ocid="cost-dashboard.period_filter"
    >
      <div className="flex gap-1 bg-muted/60 p-0.5 rounded-lg border border-border">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            data-ocid={`cost-dashboard.period_${o.value}_tab`}
            onClick={() => onChange(o.value)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              period === o.value
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
      {period === "custom" && (
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Label className="text-xs text-muted-foreground whitespace-nowrap">
              Von
            </Label>
            <Input
              type="date"
              data-ocid="cost-dashboard.custom_from_input"
              value={customFrom}
              onChange={(e) => onCustomFromChange(e.target.value)}
              className="h-8 text-sm w-36"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <Label className="text-xs text-muted-foreground whitespace-nowrap">
              Bis
            </Label>
            <Input
              type="date"
              data-ocid="cost-dashboard.custom_to_input"
              value={customTo}
              onChange={(e) => onCustomToChange(e.target.value)}
              className="h-8 text-sm w-36"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// Main Page
// ────────────────────────────────────────────────────────────────

export default function CostDashboardPage() {
  const { isPlatformAdmin } = useAuth();
  const { actor, isFetching } = useActor(createActor);
  const queryClient = useQueryClient();

  const [period, setPeriod] = useState<TimePeriod>("weekly");
  const [customFrom, setCustomFrom] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split("T")[0];
  });
  const [customTo, setCustomTo] = useState<string>(
    () => new Date().toISOString().split("T")[0],
  );
  const [settingsForceOpen, setSettingsForceOpen] = useState(false);

  // fromNanos is always defined for preset periods; only null when custom with no date
  const fromNanos: bigint =
    period === "custom"
      ? customFrom
        ? BigInt(new Date(customFrom).getTime()) * 1_000_000n
        : subtractPeriod("weekly")
      : subtractPeriod(period);

  const toNanos: bigint =
    period === "custom"
      ? customTo
        ? BigInt(new Date(`${customTo}T23:59:59`).getTime()) * 1_000_000n
        : nowNanos()
      : nowNanos();

  const isReady = !!actor && !isFetching && isPlatformAdmin;

  // ── Main dashboard data ───────────────────────────────────────
  const {
    data: dashData,
    isLoading: loadingDash,
    isError: dashError,
    refetch: refetchDash,
  } = useQuery<CostDashboardData | null>({
    queryKey: ["costDashboard", String(fromNanos), String(toNanos)],
    queryFn: async () => {
      if (!actor) return null;
      const result = await toAny(actor).getCostDashboardData(
        fromNanos,
        toNanos,
      );
      return result as CostDashboardData;
    },
    enabled: isReady,
    staleTime: 60_000,
    retry: 2,
  });

  // ── Live canister status (new endpoint) ──────────────────────
  const {
    data: canisterStatus,
    isLoading: loadingStatus,
    isError: statusError,
    refetch: refetchStatus,
  } = useQuery<CanisterStatusInfo | null>({
    queryKey: ["canisterStatusInfo"],
    queryFn: async () => {
      if (!actor) return null;
      const result = await toAny(actor).getCanisterStatusInfo();
      return result as CanisterStatusInfo;
    },
    enabled: isReady,
    staleTime: 30_000,
    retry: 0,
  });

  // ── Tenant breakdown ─────────────────────────────────────────
  const { data: tenants = [], isLoading: loadingTenants } = useQuery<
    TenantCostEntry[]
  >({
    queryKey: ["tenantCostBreakdown"],
    queryFn: async () => {
      if (!actor) return [];
      const result = await toAny(actor).getTenantCostBreakdown();
      return result as TenantCostEntry[];
    },
    enabled: isReady,
    staleTime: 60_000,
    retry: 2,
  });

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["costDashboard"] });
    queryClient.invalidateQueries({ queryKey: ["tenantCostBreakdown"] });
    queryClient.invalidateQueries({ queryKey: ["canisterStatusInfo"] });
    refetchDash();
    refetchStatus();
    toast.success("Daten werden neu geladen…");
  };

  // ── Access guard ──────────────────────────────────────────────
  if (!isPlatformAdmin) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-6">
          <ShieldCheck className="w-16 h-16 text-muted-foreground" />
          <h1 className="text-xl font-semibold text-foreground">
            Kein Zugriff
          </h1>
          <p className="text-muted-foreground text-center max-w-sm">
            Das Kosten-Dashboard ist nur für den Platform Admin zugänglich.
          </p>
        </div>
      </Layout>
    );
  }

  // Show a meaningful error if the actor is ready but queries failed
  // anyLoading excludes status check to avoid infinite spinner when canister status is unavailable
  const anyLoading = loadingDash || loadingTenants;
  const anyError = dashError;

  // Show full-page loading only when actor is not yet available
  if (!actor || isFetching) {
    return (
      <Layout>
        <div className="p-6 max-w-6xl mx-auto space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </Layout>
    );
  }

  const snapshots = dashData?.snapshots ?? [];
  const settings = dashData?.settings ?? {
    icpPriceUsd: 8.0,
    usdChfRate: 0.88,
    alertEnabled: false,
    frontendAlertThreshold: BigInt(500_000_000_000),
    backendAlertThreshold: BigInt(500_000_000_000),
  };

  // Live backend cycles from canister status query
  const liveBackendCycles: bigint | null =
    canisterStatus?.dataSource === "live" ? canisterStatus.backendCycles : null;

  const latestSnapshot =
    snapshots.length > 0 ? snapshots[snapshots.length - 1] : null;

  // Overall dataSource for header badge: "live" if canister status is live
  const overallDataSource =
    canisterStatus?.dataSource === "live"
      ? "live"
      : (dashData?.dataSource ?? "manual");

  return (
    <Layout>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* ── Page Header ── */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <BarChart2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">
                Kosten-Dashboard
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Nur für Platform Admin — Cycle-Verbrauch und Kostenübersicht
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className="bg-primary/10 text-primary border-primary/30 font-semibold">
              Platform Admin
            </Badge>
            {overallDataSource === "live" ? <LiveBadge /> : <ManualBadge />}
            <Button
              data-ocid="cost-dashboard.refresh_button"
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="gap-1.5 h-8"
              disabled={anyLoading}
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${anyLoading ? "animate-spin" : "rotate-0"}`}
              />
              Aktualisieren
            </Button>
          </div>
        </div>

        {/* ── Error State ── */}
        {anyError && (
          <div
            data-ocid="cost-dashboard.error_state"
            className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 text-sm text-destructive"
          >
            Fehler beim Laden der Dashboard-Daten. Bitte versuche es erneut oder
            prüfe die Backend-Verbindung.
          </div>
        )}

        {/* ── Canister Status Card ── */}
        <CanisterStatusCard
          statusInfo={canisterStatus ?? null}
          statusError={statusError}
          statusLoading={loadingStatus && !canisterStatus}
          latestSnapshot={latestSnapshot}
          backendFrontendCanisterId={dashData?.frontendCanisterId ?? null}
          onOpenSettings={() => {
            setSettingsForceOpen(true);
            setTimeout(() => setSettingsForceOpen(false), 100);
          }}
        />

        {/* ── Settings Panel ── */}
        {loadingDash ? (
          <Skeleton className="h-48 w-full rounded-lg" />
        ) : (
          <SettingsPanel
            settings={dashData?.settings ?? null}
            forceOpen={settingsForceOpen}
            onSaved={() => {
              queryClient.invalidateQueries({ queryKey: ["costDashboard"] });
              queryClient.invalidateQueries({
                queryKey: ["tenantCostBreakdown"],
              });
              queryClient.invalidateQueries({
                queryKey: ["canisterStatusInfo"],
              });
            }}
          />
        )}

        {/* ── Alert Banner ── */}
        <AlertBanner
          snapshots={snapshots}
          settings={settings}
          liveBackendCycles={liveBackendCycles}
        />

        {/* ── Time Period Filter ── */}
        <TimePeriodFilter
          period={period}
          onChange={setPeriod}
          customFrom={customFrom}
          customTo={customTo}
          onCustomFromChange={setCustomFrom}
          onCustomToChange={setCustomTo}
        />

        {/* ── Summary Cards ── */}
        {loadingDash ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : (
          <SummaryCards
            snapshots={snapshots}
            settings={settings}
            liveBackendCycles={liveBackendCycles}
          />
        )}

        {/* ── Charts row ── */}
        {loadingDash ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Skeleton className="h-64 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <CycleLineChart
              snapshots={snapshots}
              dataSource={dashData?.dataSource ?? "manual"}
            />
            <CompareBarChart
              snapshots={snapshots}
              liveBackendCycles={liveBackendCycles}
            />
          </div>
        )}

        {/* ── Tenant Table ── */}
        {loadingTenants ? (
          <Skeleton className="h-48 rounded-xl" />
        ) : (
          <TenantCostTable entries={tenants} settings={settings} />
        )}

        {/* ── Category PieChart ── */}
        {loadingDash ? (
          <Skeleton className="h-64 rounded-xl" />
        ) : (
          <CategoryPieChart
            snapshots={snapshots}
            settings={settings}
            liveBackendCycles={liveBackendCycles}
          />
        )}
      </div>
    </Layout>
  );
}
