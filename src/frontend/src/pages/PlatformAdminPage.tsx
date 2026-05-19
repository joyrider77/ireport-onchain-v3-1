import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  BarChart2,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Copy,
  CreditCard,
  Eye,
  EyeOff,
  Info,
  Key,
  Pencil,
  Plus,
  ReceiptText,
  RefreshCw,
  Save,
  Settings2,
  ShieldCheck,
  Trash2,
  Users,
  X,
  XCircle,
  Zap,
} from "lucide-react";
import React from "react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { createActor } from "../backend";
import type { PaymentProvider } from "../backend.d";
import type { BillingModel, Role, SubscriptionPlan } from "../backend.d";
import { Layout } from "../components/Layout";
import { TenantBillingDetailView } from "../components/billing/TenantBillingDetailView";
import { PaymentStatusBadge } from "../components/stripe/PaymentStatusBadge";
import { useAuth } from "../hooks/useAuthStore";
import { isUnlimited } from "../lib/planUtils";

type AnyActor = Record<string, (...args: unknown[]) => Promise<unknown>>;
const toAny = (a: unknown): AnyActor => a as AnyActor;

// ────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────

interface CompanyRow {
  id: string;
  name: string;
  createdAt: bigint;
  activeEmployeeCount: bigint;
  inactiveEmployeeCount: bigint;
  isActive: boolean;
  address?: string | null;
}

interface SystemStats {
  totalCompanies: bigint;
  totalEmployees: bigint;
}

interface PlatformAdminInfo {
  principal: string;
  createdAt: bigint;
}

interface CompanyUser {
  id: bigint;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  isActive: boolean;
  activatedAt?: bigint;
  deactivatedAt?: bigint;
}

// SubscriptionPlan is imported from backend.d.ts
// Form state uses the same shape as SubscriptionPlan (omitting server-set fields)
type SubscriptionPlanFormState = Omit<
  SubscriptionPlan,
  "id" | "sortOrder" | "updatedAt"
>;

// MonthlyBillingEntry — matches backend.d.ts exactly
interface MonthlyBillingEntry {
  companyId: bigint;
  companyName: string;
  planId: string;
  planName: string;
  activeUserCount: bigint;
  billableUserCount: bigint;
  billingModel?: string;
  totalCHF: number;
  month: string;
  year: bigint;
  proRataAmount?: number;
  creditAmount?: number;
  proRataNote?: string;
  nextDueDateTimestamp?: bigint;
}

// ────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────

function formatDate(nanoseconds: bigint): string {
  const ms = Number(nanoseconds / 1_000_000n);
  const d = new Date(ms);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${dd}.${mm}.${yyyy} ${hh}:${min}`;
}

function formatDateShort(nanoseconds: bigint): string {
  const ms = Number(nanoseconds / 1_000_000n);
  const d = new Date(ms);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}

function isUserActive(user: CompanyUser): boolean {
  return user.isActive;
}

// ────────────────────────────────────────────────────────────────
// PlanChangeDialog
// ────────────────────────────────────────────────────────────────

interface PlanChangeInfo {
  currentPlanName: string;
  suggestedPlanName: string;
  suggestedPlanId?: string;
  activeUserCount: bigint;
  // cost data from the new plan
  newPlanCostEstimate?: number;
}

interface PlanChangeDialogProps {
  open: boolean;
  info: PlanChangeInfo | null;
  onConfirm: (billingModel: BillingModel) => void;
  onCancel: () => void;
  isLoading: boolean;
  allPlans: SubscriptionPlan[];
}

function PlanChangeDialog({
  open,
  info,
  onConfirm,
  onCancel,
  isLoading,
  allPlans,
}: PlanChangeDialogProps) {
  const [billingModel, setBillingModel] = useState<BillingModel>(
    "monthly" as BillingModel,
  );

  // Reset billing model when dialog opens
  useEffect(() => {
    if (open) setBillingModel("monthly" as BillingModel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]); // intentionally omit setBillingModel

  if (!open || !info) return null;

  const newPlan = allPlans.find((p) => p.id === info.suggestedPlanId);
  const userCount = Number(info.activeUserCount);
  // pricePerYearCHF = monthly rate for yearly subscriptions. Annual total = × 12.
  const pricePerMonth =
    billingModel === "yearly"
      ? (newPlan?.pricePerYearCHF ?? 0)
      : (newPlan?.pricePerMonthCHF ?? 0);
  const totalCost =
    billingModel === "yearly"
      ? userCount * pricePerMonth * 12
      : userCount * pricePerMonth;

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) onCancel();
      }}
    >
      <DialogContent
        data-ocid="platform-admin.plan_change_dialog"
        className="max-w-md"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-600">
            <CreditCard className="w-4 h-4" />
            Planwechsel erforderlich
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1">
            <p className="text-sm text-foreground">
              Der aktuelle Plan <strong>"{info.currentPlanName}"</strong> wird
              gewechselt zu <strong>"{info.suggestedPlanName}"</strong>.
            </p>
            <p className="text-xs text-muted-foreground">
              Grund: Anzahl aktiver Mitarbeitender:{" "}
              <span className="font-medium text-foreground">
                {Number(info.activeUserCount)}
              </span>
            </p>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Abrechnungsmodell</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="billingModel"
                  value="monthly"
                  checked={billingModel === "monthly"}
                  onChange={() => setBillingModel("monthly" as BillingModel)}
                  className="accent-primary"
                />
                <span className="text-sm">Monatlich</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="billingModel"
                  value="yearly"
                  checked={billingModel === "yearly"}
                  onChange={() => setBillingModel("yearly" as BillingModel)}
                  className="accent-primary"
                />
                <span className="text-sm">Jährlich</span>
              </label>
            </div>
          </div>
          {newPlan && (
            <div className="rounded-md bg-muted/50 border border-border px-3 py-2.5 space-y-1.5">
              <p className="text-xs text-muted-foreground">
                Neue Kosten (geschätzt)
              </p>
              <p className="text-sm font-semibold text-foreground">
                CHF{" "}
                {totalCost.toLocaleString("de-CH", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
                <span className="text-xs text-muted-foreground font-normal ml-1">
                  {billingModel === "yearly"
                    ? `(${userCount} Benutzer × CHF ${pricePerMonth.toLocaleString("de-CH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/MA/Monat × 12)`
                    : `(${userCount} Benutzer × CHF ${pricePerMonth.toLocaleString("de-CH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/MA/Monat)`}
                </span>
              </p>
              <p className="text-xs text-muted-foreground">
                Monatlich: CHF{" "}
                {(userCount * (newPlan.pricePerMonthCHF ?? 0)).toLocaleString(
                  "de-CH",
                  { minimumFractionDigits: 2, maximumFractionDigits: 2 },
                )}
                {" | "}
                Jährlich: CHF{" "}
                {billingModel === "yearly"
                  ? (
                      userCount *
                      (newPlan.pricePerYearCHF ?? 0) *
                      12
                    ).toLocaleString("de-CH", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  : (
                      userCount *
                      (newPlan.pricePerMonthCHF ?? 0) *
                      12
                    ).toLocaleString("de-CH", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
              </p>
            </div>
          )}
        </div>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            data-ocid="platform-admin.plan_change_cancel_button"
          >
            Abbrechen
          </Button>
          <Button
            onClick={() => onConfirm(billingModel)}
            disabled={isLoading}
            data-ocid="platform-admin.plan_change_confirm_button"
            className="gap-1.5"
          >
            {isLoading ? "Wird übernommen…" : "Bestätigen"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface CompanyUserRowProps {
  user: CompanyUser;
  companyId: string;
  index: number;
  isPlatformAdminCompany: boolean;
  allPlans: SubscriptionPlan[];
}

function CompanyUserRow({
  user,
  companyId,
  index,
  isPlatformAdminCompany,
  allPlans,
}: CompanyUserRowProps) {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  const active = isUserActive(user);
  // In the platform admin's company, protect the first admin user
  const isPAUser = isPlatformAdminCompany && user.role === "admin";

  // Plan change dialog state
  const [planChangeOpen, setPlanChangeOpen] = useState(false);
  const [planChangeInfo, setPlanChangeInfo] = useState<PlanChangeInfo | null>(
    null,
  );
  // Store the pending active value until plan-change dialog is confirmed
  const pendingActiveRef = useRef<boolean | null>(null);

  const roleMutation = useMutation({
    mutationFn: async (newRole: Role) => {
      if (!actor) throw new Error("Kein Aktor verfügbar");
      const result = await actor.setUserRoleForCompany(
        BigInt(companyId),
        user.id,
        newRole,
      );
      if (result.__kind__ === "err") throw new Error(result.err ?? "Fehler");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["platformAdminUsers", companyId],
      });
      toast.success("Rolle erfolgreich geändert.");
    },
    onError: (err: Error) => {
      queryClient.invalidateQueries({
        queryKey: ["platformAdminUsers", companyId],
      });
      toast.error(`Fehler beim Ändern der Rolle: ${err.message}`);
    },
  });

  const activeMutation = useMutation({
    mutationFn: async (newActive: boolean) => {
      if (!actor) throw new Error("Kein Aktor verfügbar");
      const result = await actor.setUserActiveForCompany(
        BigInt(companyId),
        user.id,
        newActive,
      );
      if (result.__kind__ === "err") throw new Error(result.err ?? "Fehler");
    },
    onSuccess: (_, newActive) => {
      queryClient.invalidateQueries({
        queryKey: ["platformAdminUsers", companyId],
      });
      // Also invalidate the company list so activeEmployeeCount updates
      queryClient.invalidateQueries({ queryKey: ["allCompanies"] });
      queryClient.invalidateQueries({ queryKey: ["allCompanySubscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["monthlyBilling"] });
      toast.success(
        newActive ? "Benutzer aktiviert." : "Benutzer deaktiviert.",
      );
    },
    onError: (err: Error) => {
      queryClient.invalidateQueries({
        queryKey: ["platformAdminUsers", companyId],
      });
      toast.error(`Fehler beim Ändern des Status: ${err.message}`);
    },
  });

  const planChangeMutation = useMutation({
    mutationFn: async ({
      billingModel,
      newActive,
    }: { billingModel: BillingModel; newActive: boolean }) => {
      if (!actor) throw new Error("Kein Aktor verfügbar");
      // Apply billing model first, then toggle user active
      await actor.setCompanyBillingModel(BigInt(companyId), billingModel);
      const result = await actor.setUserActiveForCompany(
        BigInt(companyId),
        user.id,
        newActive,
      );
      if (result.__kind__ === "err") throw new Error(result.err ?? "Fehler");
    },
    onSuccess: (_, { newActive }) => {
      queryClient.invalidateQueries({
        queryKey: ["platformAdminUsers", companyId],
      });
      queryClient.invalidateQueries({ queryKey: ["allCompanies"] });
      queryClient.invalidateQueries({ queryKey: ["allCompanySubscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["monthlyBilling"] });
      setPlanChangeOpen(false);
      setPlanChangeInfo(null);
      pendingActiveRef.current = null;
      toast.success(
        newActive
          ? "Benutzer aktiviert, Plan geändert."
          : "Benutzer deaktiviert, Plan geändert.",
      );
    },
    onError: (err: Error) => {
      queryClient.invalidateQueries({
        queryKey: ["platformAdminUsers", companyId],
      });
      setPlanChangeOpen(false);
      toast.error(`Fehler: ${err.message}`);
    },
  });

  async function handleActiveToggle(newActive: boolean) {
    if (!actor) return;
    try {
      const result = await actor.checkPlanChangeNeeded(BigInt(companyId));
      if (result.__kind__ === "ok" && result.ok.changeNeeded) {
        pendingActiveRef.current = newActive;
        setPlanChangeInfo({
          currentPlanName: result.ok.currentPlanName,
          suggestedPlanName: result.ok.suggestedPlanName,
          suggestedPlanId: result.ok.suggestedPlanId,
          activeUserCount: result.ok.activeUserCount,
        });
        setPlanChangeOpen(true);
        return;
      }
    } catch {
      // checkPlanChangeNeeded failed — proceed with normal toggle
    }
    // No plan change needed: directly toggle
    activeMutation.mutate(newActive);
  }

  return (
    <tr
      data-ocid={`platform-admin.user_row.${index + 1}`}
      className="border-b border-border/40 hover:bg-muted/20 transition-colors"
    >
      {/* Name */}
      <td className="px-3 py-2.5 text-sm font-medium text-foreground whitespace-nowrap">
        <div className="flex items-center gap-1.5">
          {user.firstName} {user.lastName}
          {isPAUser && (
            <span
              title="Platform-Admin — Rolle und Status können nicht geändert werden"
              className="inline-flex items-center"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-primary flex-shrink-0" />
            </span>
          )}
        </div>
      </td>

      {/* Email */}
      <td className="px-3 py-2.5 text-sm text-muted-foreground hidden sm:table-cell max-w-[180px] truncate">
        {user.email}
      </td>

      {/* Role */}
      <td className="px-3 py-2.5">
        {isPAUser ? (
          <span
            title="Platform-Admin Rolle kann nicht geändert werden"
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium cursor-not-allowed"
          >
            <ShieldCheck className="w-3 h-3" />
            Admin
          </span>
        ) : (
          <Select
            value={user.role}
            disabled={roleMutation.isPending}
            onValueChange={(val) => roleMutation.mutate(val as Role)}
          >
            <SelectTrigger
              data-ocid={`platform-admin.user_role_select.${index + 1}`}
              className="h-7 text-xs w-[130px] bg-background"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="employee">Mitarbeiter</SelectItem>
            </SelectContent>
          </Select>
        )}
      </td>

      {/* Active toggle */}
      <td className="px-3 py-2.5 text-center">
        {isPAUser ? (
          <Switch
            checked={active}
            disabled={true}
            aria-label="Platform-Admin – kann nicht deaktiviert werden"
            className="opacity-50 cursor-not-allowed"
          />
        ) : (
          <Switch
            data-ocid={`platform-admin.user_active_toggle.${index + 1}`}
            checked={active}
            disabled={activeMutation.isPending || planChangeMutation.isPending}
            onCheckedChange={(checked) => handleActiveToggle(checked)}
            aria-label={active ? "Deaktivieren" : "Aktivieren"}
          />
        )}
      </td>

      {/* activatedAt */}
      <td className="px-3 py-2.5 text-xs text-muted-foreground hidden md:table-cell whitespace-nowrap">
        {user.activatedAt ? formatDateShort(user.activatedAt) : "—"}
      </td>

      {/* deactivatedAt — cleared when user is re-activated */}
      <td className="px-3 py-2.5 text-xs text-muted-foreground hidden md:table-cell whitespace-nowrap">
        {user.deactivatedAt ? formatDateShort(user.deactivatedAt) : "—"}
      </td>

      {/* Plan change dialog — shown inline after this row */}
      <PlanChangeDialog
        open={planChangeOpen}
        info={planChangeInfo}
        allPlans={allPlans}
        isLoading={planChangeMutation.isPending}
        onConfirm={(billingModel) => {
          const newActive = pendingActiveRef.current ?? !active;
          planChangeMutation.mutate({ billingModel, newActive });
        }}
        onCancel={() => {
          setPlanChangeOpen(false);
          setPlanChangeInfo(null);
          pendingActiveRef.current = null;
        }}
      />
    </tr>
  );
}

// ────────────────────────────────────────────────────────────────
// CompanyUsersPanel
// ────────────────────────────────────────────────────────────────

interface CompanyUsersPanelProps {
  companyId: string;
  isPlatformAdminCompany: boolean;
  allPlans: SubscriptionPlan[];
}

function CompanyUsersPanel({
  companyId,
  isPlatformAdminCompany,
  allPlans,
}: CompanyUsersPanelProps) {
  const { actor, isFetching } = useActor(createActor);

  const {
    data: users,
    isLoading,
    isError,
    error,
  } = useQuery<CompanyUser[]>({
    queryKey: ["platformAdminUsers", companyId],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.getUsersForCompany(BigInt(companyId));
      return result as CompanyUser[];
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });

  if (isLoading) {
    return (
      <tr data-ocid={`platform-admin.users_loading_state.${companyId}`}>
        <td colSpan={7} className="px-3 py-4 bg-muted/10">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-48" />
          </div>
        </td>
      </tr>
    );
  }

  if (isError) {
    return (
      <tr data-ocid={`platform-admin.users_error_state.${companyId}`}>
        <td
          colSpan={7}
          className="px-3 py-4 text-sm text-destructive bg-destructive/5"
        >
          Fehler beim Laden der Benutzer:{" "}
          {(error as Error)?.message ?? "Unbekannter Fehler"}
        </td>
      </tr>
    );
  }

  if (!users || users.length === 0) {
    return (
      <tr data-ocid={`platform-admin.users_empty_state.${companyId}`}>
        <td
          colSpan={7}
          className="px-3 py-4 text-sm text-muted-foreground bg-muted/10 text-center"
        >
          Keine Benutzer gefunden.
        </td>
      </tr>
    );
  }

  return (
    <>
      <tr className="bg-muted/20">
        <td colSpan={7} className="px-3 pt-2 pb-0">
          <div className="flex items-center gap-1.5 mb-1">
            <Users className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Benutzer dieser Firma
            </span>
          </div>
        </td>
      </tr>
      <tr className="bg-muted/20">
        <th className="px-3 py-1.5 text-left text-xs font-medium text-muted-foreground whitespace-nowrap">
          Vorname Name
        </th>
        <th className="px-3 py-1.5 text-left text-xs font-medium text-muted-foreground hidden sm:table-cell">
          E-Mail
        </th>
        <th className="px-3 py-1.5 text-left text-xs font-medium text-muted-foreground whitespace-nowrap">
          Rolle
        </th>
        <th className="px-3 py-1.5 text-center text-xs font-medium text-muted-foreground">
          Aktiv
        </th>
        <th className="px-3 py-1.5 text-left text-xs font-medium text-muted-foreground hidden md:table-cell whitespace-nowrap">
          Aktiviert am
        </th>
        <th className="px-3 py-1.5 text-left text-xs font-medium text-muted-foreground hidden md:table-cell whitespace-nowrap">
          Deaktiviert am
        </th>
      </tr>
      {users.map((user, index) => (
        <CompanyUserRow
          key={String(user.id)}
          user={user}
          companyId={companyId}
          index={index}
          isPlatformAdminCompany={isPlatformAdminCompany}
          allPlans={allPlans}
        />
      ))}
      <tr className="bg-muted/10">
        <td colSpan={7} className="py-1.5" />
      </tr>
    </>
  );
}

// ────────────────────────────────────────────────────────────────
// CompanyTableRow
// ────────────────────────────────────────────────────────────────

interface CompanyTableRowProps {
  company: CompanyRow;
  index: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  isToggling: boolean;
  onToggleActive: () => void;
  isPlatformAdminCompany: boolean;
  assignedPlanId: string;
  activePlans: import("../backend.d").SubscriptionPlan[];
  onPlanChange: (planId: string) => void;
  billingModel: string;
  onBillingModelChange: (model: BillingModel) => void;
  isBillingModelSaving: boolean;
}

function renderEmployeeCount(company: CompanyRow): React.ReactNode {
  const active = Number(company.activeEmployeeCount);
  const inactive = Number(company.inactiveEmployeeCount);
  return (
    <span className="text-sm text-muted-foreground">
      <span className="text-green-700 font-medium">{active} aktiv</span>
      {" / "}
      <span className="text-muted-foreground">{inactive} inaktiv</span>
    </span>
  );
}

function CompanyTableRow({
  company,
  index,
  isExpanded,
  onToggleExpand,
  isToggling,
  onToggleActive,
  isPlatformAdminCompany,
  assignedPlanId,
  activePlans,
  onPlanChange,
  billingModel,
  onBillingModelChange,
  isBillingModelSaving,
}: CompanyTableRowProps) {
  return (
    <>
      <tr
        data-ocid={`platform-admin.companies_row.${index + 1}`}
        className={`border-b border-border/50 hover:bg-muted/30 transition-colors ${isExpanded ? "bg-primary/5" : ""}`}
      >
        <td className="px-2 py-3">
          <button
            type="button"
            data-ocid={`platform-admin.companies_expand.${index + 1}`}
            onClick={onToggleExpand}
            className="flex items-center gap-2 font-medium text-foreground hover:text-primary transition-colors text-sm"
            aria-expanded={isExpanded}
            aria-label={
              isExpanded ? "Benutzer ausblenden" : "Benutzer anzeigen"
            }
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-primary flex-shrink-0" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            )}
            {company.name}
            {isPlatformAdminCompany && (
              <span
                title="Firma des Platform-Admins"
                className="inline-flex items-center"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-primary flex-shrink-0 ml-0.5" />
              </span>
            )}
          </button>
        </td>

        <td className="px-2 py-3 text-sm text-muted-foreground hidden sm:table-cell whitespace-nowrap">
          {formatDateShort(company.createdAt)}
        </td>

        <td className="px-2 py-3 hidden md:table-cell">
          {renderEmployeeCount(company)}
        </td>

        {/* Subscription plan assignment */}
        <td className="px-2 py-3 hidden lg:table-cell">
          <div className="flex flex-col gap-1.5">
            <Select
              value={assignedPlanId || "none"}
              onValueChange={onPlanChange}
            >
              <SelectTrigger
                data-ocid={`platform-admin.companies_plan_select.${index + 1}`}
                className="h-7 text-xs w-[150px] bg-background"
              >
                <SelectValue placeholder="Kein Plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Kein Plan</SelectItem>
                {activePlans.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* Billing model selector — only for non-platform-admin companies with a plan */}
            {!isPlatformAdminCompany &&
              assignedPlanId &&
              assignedPlanId !== "none" && (
                <Select
                  value={billingModel || "monthly"}
                  onValueChange={(v) => onBillingModelChange(v as BillingModel)}
                  disabled={isBillingModelSaving}
                >
                  <SelectTrigger
                    data-ocid={`platform-admin.companies_billing_model_select.${index + 1}`}
                    className="h-7 text-xs w-[150px] bg-background"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monatlich</SelectItem>
                    <SelectItem value="yearly">Jährlich</SelectItem>
                  </SelectContent>
                </Select>
              )}
          </div>
        </td>

        <td className="px-2 py-3 text-center">
          <span
            data-ocid={`platform-admin.companies_status.${index + 1}`}
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
              company.isActive
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {company.isActive ? "Aktiv" : "Inaktiv"}
          </span>
        </td>

        <td className="px-2 py-3 text-right">
          {isPlatformAdminCompany ? (
            <span
              title="Firma des Platform-Admins kann nicht deaktiviert werden"
              className="inline-flex items-center gap-1 px-2 py-1 rounded border border-border text-xs text-muted-foreground cursor-not-allowed opacity-60"
            >
              <ShieldCheck className="w-3 h-3" />
              Geschützt
            </span>
          ) : (
            <Button
              data-ocid={`platform-admin.companies_toggle.${index + 1}`}
              variant="outline"
              size="sm"
              disabled={isToggling}
              onClick={onToggleActive}
              className="text-xs h-7 px-2"
            >
              {isToggling
                ? "..."
                : company.isActive
                  ? "Deaktivieren"
                  : "Aktivieren"}
            </Button>
          )}
        </td>
      </tr>

      {isExpanded && (
        <CompanyUsersPanel
          companyId={company.id}
          isPlatformAdminCompany={isPlatformAdminCompany}
          allPlans={activePlans}
        />
      )}
    </>
  );
}

// ────────────────────────────────────────────────────────────────
// CanisterIdSection
// ────────────────────────────────────────────────────────────────

interface CanisterIdSectionProps {
  backendCanisterId: string;
}

function CanisterIdSection({ backendCanisterId }: CanisterIdSectionProps) {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  const [frontendId, setFrontendId] = useState("");

  type PlatformAdminConfig = {
    frontendCanisterId?: string;
    stripePublishableKey?: string;
    stripeWebhookEndpointUrl?: string;
  } | null;
  const { data: adminConfig } = useQuery<PlatformAdminConfig>({
    queryKey: ["platformAdminConfig"],
    queryFn: async (): Promise<PlatformAdminConfig> => {
      if (!actor) return null;
      return toAny(
        actor,
      ).getPlatformAdminConfig() as Promise<PlatformAdminConfig>;
    },
    enabled: !!actor,
  });

  useEffect(() => {
    if (adminConfig?.frontendCanisterId) {
      setFrontendId(adminConfig.frontendCanisterId);
    }
  }, [adminConfig]);

  const saveMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Kein Aktor verfügbar");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cfg = await (toAny(actor).getPlatformAdminConfig() as Promise<any>);
      return toAny(actor).setPlatformAdminConfig({
        frontendCanisterId: id,
        stripePublishableKey:
          (cfg as { stripePublishableKey?: string })?.stripePublishableKey ??
          "",
        stripeSecretKey: "",
        stripeWebhookSecret: "",
        stripeWebhookEndpointUrl:
          (cfg as { stripeWebhookEndpointUrl?: string })
            ?.stripeWebhookEndpointUrl ?? "",
      });
    },
    onSuccess: () => {
      toast.success("Frontend Canister-ID gespeichert.");
      queryClient.invalidateQueries({ queryKey: ["platformAdminConfig"] });
      queryClient.invalidateQueries({ queryKey: ["costDashboard"] });
    },
    onError: (err: Error) => {
      toast.error(`Fehler: ${err.message}`);
    },
  });

  return (
    <Card data-ocid="platform-admin.canister_ids_card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Info className="w-4 h-4 text-primary" />
          Canister-IDs einrichten
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">
            Backend Canister-ID (automatisch)
          </Label>
          <p className="text-sm font-mono text-foreground bg-muted/50 px-3 py-2 rounded-md break-all">
            {backendCanisterId || "—"}
          </p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="frontend-canister-id" className="text-xs">
            Frontend Canister-ID
          </Label>
          <div className="flex gap-2">
            <Input
              id="frontend-canister-id"
              data-ocid="platform-admin.frontend_canister_id_input"
              value={frontendId}
              onChange={(e) => setFrontendId(e.target.value)}
              placeholder="z.B. rdmx6-jaaaa-aaaaa-aaadq-cai"
              className="font-mono text-sm flex-1"
            />
            <Button
              data-ocid="platform-admin.frontend_canister_id_save"
              size="sm"
              disabled={saveMutation.isPending || !frontendId.trim()}
              onClick={() => saveMutation.mutate(frontendId.trim())}
              className="gap-1.5 flex-shrink-0"
            >
              <Save className="w-3.5 h-3.5" />
              {saveMutation.isPending ? "Speichert…" : "Speichern"}
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Die Frontend Canister-ID wird im Kosten-Dashboard für
            Cycle-Berechnungen verwendet.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// ────────────────────────────────────────────────────────────────
// SubscriptionPlanModal
// ────────────────────────────────────────────────────────────────

const EMPTY_PLAN: SubscriptionPlanFormState = {
  name: "",
  description: "",
  pricePerMonthCHF: 0,
  pricePerYearCHF: 0,
  minActiveDaysPerMonth: 1n,
  maxEmployees: undefined,
  features: [],
  isActive: true,
  requiresPayment: false,
  paymentProvider: "none" as import("../backend.d").PaymentProvider,
  stripePriceId: "",
  stripePriceIdYearly: "",
  stripeProductId: "",
  stripeMode: "",
};
// pricePerActiveUserCHF is kept in state for backwards compat but not shown in the form

interface SubscriptionPlanModalProps {
  open: boolean;
  plan: SubscriptionPlan | null;
  onClose: () => void;
  onSaved: () => void;
}

function SubscriptionPlanModal({
  open,
  plan,
  onClose,
  onSaved,
}: SubscriptionPlanModalProps) {
  const { actor } = useActor(createActor);

  const buildFormFromPlan = (
    p: SubscriptionPlan,
  ): SubscriptionPlanFormState => ({
    name: p.name,
    description: p.description,
    pricePerMonthCHF: p.pricePerMonthCHF,
    pricePerYearCHF: p.pricePerYearCHF,
    minActiveDaysPerMonth: p.minActiveDaysPerMonth ?? 1n,
    maxEmployees: p.maxEmployees,
    features: [...p.features],
    isActive: p.isActive,
    requiresPayment: p.requiresPayment,
    paymentProvider: p.paymentProvider,
    stripePriceId: p.stripePriceId ?? "",
    stripePriceIdYearly: p.stripePriceIdYearly ?? "",
    stripeProductId: p.stripeProductId ?? "",
    stripeMode: p.stripeMode ?? "",
  });

  const [form, setForm] = useState<SubscriptionPlanFormState>(() =>
    plan ? buildFormFromPlan(plan) : { ...EMPTY_PLAN },
  );
  // newFeature state removed – features now selected via SIDEBAR_FEATURES checkboxes

  // Whenever the dialog opens (or the plan prop changes while open), reload all fields
  // biome-ignore lint/correctness/useExhaustiveDependencies: plan reference changes when edit target changes
  useEffect(() => {
    if (open) {
      setForm(plan ? buildFormFromPlan(plan) : { ...EMPTY_PLAN });
    }
  }, [open, plan]);

  const handleOpen = (isOpen: boolean) => {
    if (!isOpen) onClose();
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Kein Aktor verfügbar");
      const planToSave: SubscriptionPlan = {
        id: plan?.id ?? "",
        sortOrder: plan?.sortOrder ?? 0n,
        updatedAt: plan?.updatedAt ?? 0n,
        ...form,
      };
      const result = await actor.upsertSubscriptionPlan(planToSave);
      if (result.__kind__ === "err") throw new Error(result.err ?? "Fehler");
    },
    onSuccess: () => {
      toast.success(
        plan ? "Abonnement-Plan aktualisiert." : "Abonnement-Plan erstellt.",
      );
      onSaved();
      onClose();
    },
    onError: (err: Error) => {
      toast.error(`Fehler beim Speichern: ${err.message}`);
    },
  });

  const _addFeature = () => {
    const trimmed = "".trim();
    if (trimmed && !form.features.includes(trimmed)) {
      setForm((f) => ({ ...f, features: [...f.features, trimmed] }));
    }
  };

  const _removeFeature = (feat: string) => {
    setForm((f) => ({
      ...f,
      features: f.features.filter((x) => x !== feat),
    }));
  };

  if (!open) return null;

  const maxEmpValue =
    form.maxEmployees !== undefined ? Number(form.maxEmployees) : 999;

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        handleOpen(o);
        if (!o) onClose();
      }}
    >
      <DialogContent
        data-ocid="platform-admin.subscription_plan_dialog"
        className="max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-primary" />
            {plan ? "Plan bearbeiten" : "Neuer Plan"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="plan-name" className="text-sm font-medium">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="plan-name"
              data-ocid="platform-admin.subscription_plan_name_input"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="z.B. Professional"
            />
          </div>

          {/* Beschreibung */}
          <div className="space-y-1.5">
            <Label htmlFor="plan-desc" className="text-sm font-medium">
              Beschreibung
            </Label>
            <Textarea
              id="plan-desc"
              data-ocid="platform-admin.subscription_plan_desc_input"
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              placeholder="Kurze Beschreibung des Plans"
              className="resize-none"
              rows={2}
            />
          </div>

          {/* Preise */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">
                Preis/Mitarbeiter/Monat im Monats-Abonnement (CHF)
              </Label>
              <Input
                data-ocid="platform-admin.subscription_plan_price_month_input"
                type="number"
                min={0}
                step={0.01}
                value={form.pricePerMonthCHF}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    pricePerMonthCHF: Number.parseFloat(e.target.value) || 0,
                  }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">
                Preis/Mitarbeiter/Monat im Jahres-Abonnement (CHF)
              </Label>
              <Input
                data-ocid="platform-admin.subscription_plan_price_year_input"
                type="number"
                min={0}
                step={0.01}
                value={form.pricePerYearCHF}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    pricePerYearCHF: Number.parseFloat(e.target.value) || 0,
                  }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">
                Mindestaktive Tage/Monat
              </Label>
              <Input
                data-ocid="platform-admin.subscription_plan_min_active_days_input"
                type="number"
                min={1}
                step={1}
                value={Number(form.minActiveDaysPerMonth ?? 1n)}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    minActiveDaysPerMonth: BigInt(
                      Number.parseInt(e.target.value, 10) || 1,
                    ),
                  }))
                }
              />
              <p className="text-[11px] text-muted-foreground">
                Min. Tage im Monat aktiv, um als aktiver Benutzer zu gelten.
              </p>
            </div>
          </div>

          {/* Max. Mitarbeitende */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">
              Max. aktive Mitarbeitende (für diesen Plan)
            </Label>
            <Input
              data-ocid="platform-admin.subscription_plan_max_emp_input"
              type="number"
              min={1}
              value={maxEmpValue}
              onChange={(e) => {
                const v = Number.parseInt(e.target.value, 10) || 0;
                setForm((f) => ({
                  ...f,
                  maxEmployees: v === 0 ? undefined : BigInt(v),
                }));
              }}
            />
            {maxEmpValue === 0 ? (
              <p className="text-[11px] text-destructive font-medium">
                Max. aktive Mitarbeitende darf nicht 0 sein. Gib 999 für
                unbegrenzt ein.
              </p>
            ) : isUnlimited(maxEmpValue) ? (
              <p className="text-[11px] text-muted-foreground">
                Unbegrenzt — keine Obergrenze.
              </p>
            ) : null}
          </div>

          {/* Funktionen */}
          {(() => {
            const SIDEBAR_FEATURES = [
              { key: "dashboard", label: "Dashboard" },
              { key: "calendar", label: "Kalender" },
              { key: "time-tracking", label: "Zeiten erfassen" },
              { key: "expense-tracking", label: "Spesen erfassen" },
              { key: "reports", label: "Auswertungen" },
              { key: "invoicing", label: "Fakturierung" },
              { key: "master-data", label: "Stammdaten" },
              { key: "settings", label: "Einstellungen" },
            ];
            return (
              <div>
                <Label className="block text-sm font-medium mb-1">
                  Enthaltene Funktionen
                </Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Diese Funktionen steuern die Sidebar-Navigation für Mandanten
                  dieses Plans.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {SIDEBAR_FEATURES.map((f) => (
                    <label
                      key={f.key}
                      className="flex items-center gap-2 text-sm cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={form.features.includes(f.key)}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            features: e.target.checked
                              ? [...prev.features, f.key]
                              : prev.features.filter((k) => k !== f.key),
                          }))
                        }
                        className="rounded border-input text-primary"
                        data-ocid={`platform-admin.subscription_plan_feature_${f.key}_checkbox`}
                      />
                      {f.label}
                    </label>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Stripe-Konfiguration pro Plan */}
          <div className="space-y-3 pt-2 border-t border-border/50">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Stripe-Konfiguration (optional)
            </p>
            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="plan-stripe-price-monthly" className="text-sm">
                  Stripe Price ID (monatlich)
                </Label>
                <Input
                  id="plan-stripe-price-monthly"
                  data-ocid="platform-admin.subscription_plan_stripe_price_monthly_input"
                  value={form.stripePriceId ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, stripePriceId: e.target.value }))
                  }
                  placeholder="price_xxx"
                  className="font-mono text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="plan-stripe-price-yearly" className="text-sm">
                  Stripe Price ID (jährlich)
                </Label>
                <Input
                  id="plan-stripe-price-yearly"
                  data-ocid="platform-admin.subscription_plan_stripe_price_yearly_input"
                  value={form.stripePriceIdYearly ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      stripePriceIdYearly: e.target.value,
                    }))
                  }
                  placeholder="price_yyy"
                  className="font-mono text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="plan-stripe-product" className="text-sm">
                  Stripe Product ID
                </Label>
                <Input
                  id="plan-stripe-product"
                  data-ocid="platform-admin.subscription_plan_stripe_product_input"
                  value={form.stripeProductId ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, stripeProductId: e.target.value }))
                  }
                  placeholder="prod_xxx"
                  className="font-mono text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-sm">Zahlungsanbieter</Label>
                  <Select
                    value={form.paymentProvider ?? "none"}
                    onValueChange={(v) =>
                      setForm((f) => ({
                        ...f,
                        paymentProvider: v as PaymentProvider,
                      }))
                    }
                  >
                    <SelectTrigger
                      data-ocid="platform-admin.subscription_plan_payment_provider_select"
                      className="h-8 text-xs bg-background"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Keine</SelectItem>
                      <SelectItem value="stripe">Stripe</SelectItem>
                      <SelectItem value="manual">Manuell</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Stripe-Modus</Label>
                  <Select
                    value={form.stripeMode || ""}
                    onValueChange={(v) =>
                      setForm((f) => ({
                        ...f,
                        stripeMode: v === "default" ? "" : v,
                      }))
                    }
                  >
                    <SelectTrigger
                      data-ocid="platform-admin.subscription_plan_stripe_mode_select"
                      className="h-8 text-xs bg-background"
                    >
                      <SelectValue placeholder="(Standard)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">(Standard)</SelectItem>
                      <SelectItem value="test">Test</SelectItem>
                      <SelectItem value="live">Live</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-3 py-1">
                <Switch
                  id="plan-requires-payment"
                  data-ocid="platform-admin.subscription_plan_requires_payment_toggle"
                  checked={form.requiresPayment}
                  onCheckedChange={(checked) =>
                    setForm((f) => ({ ...f, requiresPayment: checked }))
                  }
                />
                <Label
                  htmlFor="plan-requires-payment"
                  className="text-sm cursor-pointer"
                >
                  Zahlung erforderlich
                </Label>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center justify-between py-2 border-t border-border/50">
            <div>
              <Label className="text-sm font-medium">Plan aktiv</Label>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Inaktive Pläne werden nicht auf der Startseite angezeigt.
              </p>
            </div>
            <Switch
              data-ocid="platform-admin.subscription_plan_aktiv_toggle"
              checked={form.isActive}
              onCheckedChange={(checked) =>
                setForm((f) => ({ ...f, isActive: checked }))
              }
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            data-ocid="platform-admin.subscription_plan_cancel_button"
          >
            Abbrechen
          </Button>
          <Button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending || !form.name.trim()}
            data-ocid="platform-admin.subscription_plan_save_button"
            className="gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            {saveMutation.isPending ? "Speichert…" : "Speichern"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ────────────────────────────────────────────────────────────────
// BillingOverviewSection
// ────────────────────────────────────────────────────────────────

function formatChfSwiss(n: number): string {
  return n.toLocaleString("de-CH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function BillingOverviewSection() {
  const { actor, isFetching } = useActor(createActor);
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);

  const MONTHS = [
    "Januar",
    "Februar",
    "März",
    "April",
    "Mai",
    "Juni",
    "Juli",
    "August",
    "September",
    "Oktober",
    "November",
    "Dezember",
  ];

  const { data: billingEntries = [], isLoading } = useQuery<
    MonthlyBillingEntry[]
  >({
    queryKey: ["monthlyBilling", year, month],
    queryFn: async () => {
      if (!actor) return [];
      const result = await toAny(actor).getMonthlyBillingOverview(
        BigInt(year),
        BigInt(month),
      );
      return result as MonthlyBillingEntry[];
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
  });

  // Fetch plans (React Query dedupes this) to compute accurate yearly prices
  const { data: allPlansForBilling = [] } = useQuery<
    import("../backend.d").SubscriptionPlan[]
  >({
    queryKey: ["subscriptionPlans"],
    queryFn: async () => {
      if (!actor) return [];
      return (
        actor as unknown as import("../backend.d").backendInterface
      ).getAllSubscriptionPlans();
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
  });

  // All companies for tenant detail view
  const { data: allCompaniesForBilling = [] } = useQuery<CompanyRow[]>({
    queryKey: ["allCompanies"],
    queryFn: async () => {
      if (!actor) return [];
      const result = await toAny(actor).listAllCompaniesForPlatformAdmin();
      return result as CompanyRow[];
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });

  const platformAdminCompanyIdForBilling =
    allCompaniesForBilling.length > 0
      ? allCompaniesForBilling.reduce((earliest, c) =>
          c.createdAt < earliest.createdAt ? c : earliest,
        ).id
      : null;

  const totalCHF = billingEntries.reduce((s, e) => {
    const isYearly = e.billingModel === "yearly";
    const activeUsers = Number(e.activeUserCount);
    const plan = allPlansForBilling.find((p) => p.id === e.planId);
    const pricePerUser = isYearly
      ? plan
        ? plan.pricePerYearCHF * 12
        : activeUsers > 0
          ? e.totalCHF / activeUsers
          : 0
      : plan
        ? plan.pricePerMonthCHF
        : activeUsers > 0
          ? e.totalCHF / activeUsers
          : 0;
    return s + activeUsers * pricePerUser;
  }, 0);
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  // If a tenant is selected, show the detail view instead
  if (selectedTenantId) {
    const selectedCompany = allCompaniesForBilling.find(
      (c) => c.id === selectedTenantId,
    );
    if (selectedCompany) {
      const planId = billingEntries.find(
        (e) => String(e.companyId) === selectedTenantId,
      )?.planId;
      const plan = allPlansForBilling.find((p) => p.id === planId);
      const defaultKulanz = plan ? Number(plan.minActiveDaysPerMonth ?? 5n) : 5;
      return (
        <Card data-ocid="platform-admin.billing_section">
          <CardContent className="pt-6">
            <TenantBillingDetailView
              company={{
                id: selectedCompany.id,
                name: selectedCompany.name,
                address: selectedCompany?.address ?? undefined,
                createdAt: selectedCompany.createdAt,
                isActive: selectedCompany.isActive,
              }}
              defaultKulanzDays={defaultKulanz}
              onBack={() => setSelectedTenantId(null)}
            />
          </CardContent>
        </Card>
      );
    }
  }

  return (
    <Card data-ocid="platform-admin.billing_section">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <ReceiptText className="w-4 h-4 text-primary" />
              Abrechnungsübersicht
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Monatliche Abrechnung pro Mandant gemäss zugeordnetem
              Abonnement-Plan.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="h-8 text-sm px-2 rounded-md border border-input bg-background"
              data-ocid="platform-admin.billing_month_select"
            >
              {MONTHS.map((m, i) => (
                <option key={m} value={i + 1}>
                  {m}
                </option>
              ))}
            </select>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="h-8 text-sm px-2 rounded-md border border-input bg-background"
              data-ocid="platform-admin.billing_year_select"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div
            data-ocid="platform-admin.billing_loading_state"
            className="space-y-3"
          >
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : billingEntries.length === 0 ? (
          <div
            data-ocid="platform-admin.billing_empty_state"
            className="text-center py-10 text-sm text-muted-foreground"
          >
            Noch keine Abrechnungsdaten vorhanden.
          </div>
        ) : (
          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
                  <th className="text-left px-2 py-2 font-medium">
                    Firmenname
                  </th>
                  <th className="text-left px-2 py-2 font-medium hidden sm:table-cell">
                    Abonnement
                  </th>
                  <th className="text-right px-2 py-2 font-medium">
                    Aktive Benutzer
                  </th>
                  <th className="text-right px-2 py-2 font-medium hidden md:table-cell">
                    Abr.-Modell
                  </th>
                  <th className="text-right px-2 py-2 font-medium hidden md:table-cell">
                    Preis/Benutzer
                  </th>
                  <th className="text-right px-2 py-2 font-medium">
                    Total (CHF)
                  </th>
                  <th className="text-right px-2 py-2 font-medium hidden sm:table-cell">
                    Jahresübersicht
                  </th>
                </tr>
              </thead>
              <tbody>
                {billingEntries.map((e, idx) => {
                  const isYearly = e.billingModel === "yearly";
                  const activeUsers = Number(e.activeUserCount);
                  const plan = allPlansForBilling.find(
                    (p) => p.id === e.planId,
                  );
                  const pricePerUser = isYearly
                    ? plan
                      ? plan.pricePerYearCHF * 12
                      : activeUsers > 0
                        ? e.totalCHF / activeUsers
                        : 0
                    : plan
                      ? plan.pricePerMonthCHF
                      : activeUsers > 0
                        ? e.totalCHF / activeUsers
                        : 0;
                  const computedTotal = activeUsers * pricePerUser;
                  const isPACompany =
                    String(e.companyId) === platformAdminCompanyIdForBilling;
                  return (
                    <React.Fragment key={String(e.companyId)}>
                      <tr
                        data-ocid={`platform-admin.billing_row.${idx + 1}`}
                        className="border-b border-border/40 hover:bg-muted/20 transition-colors"
                      >
                        <td className="px-2 py-2.5 font-medium text-foreground">
                          {e.companyName}
                        </td>
                        <td className="px-2 py-2.5 text-muted-foreground hidden sm:table-cell">
                          {e.planName || "—"}
                        </td>
                        <td className="px-2 py-2.5 text-right tabular-nums">
                          {activeUsers}
                        </td>
                        <td className="px-2 py-2.5 text-right tabular-nums text-muted-foreground hidden md:table-cell whitespace-nowrap">
                          {isYearly ? "Jährlich" : "Monatlich"}
                        </td>
                        <td className="px-2 py-2.5 text-right tabular-nums text-muted-foreground hidden md:table-cell">
                          {activeUsers > 0 ? (
                            <span>
                              {formatChfSwiss(pricePerUser)}
                              <span className="text-[10px] ml-0.5">
                                /{isYearly ? "Jahr" : "Monat"}
                              </span>
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-2 py-2.5 text-right tabular-nums font-medium">
                          {formatChfSwiss(computedTotal)}
                        </td>
                        <td className="px-2 py-2.5 text-right hidden sm:table-cell">
                          {!isPACompany && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs gap-1.5 text-primary hover:text-primary hover:bg-primary/10"
                              onClick={() =>
                                setSelectedTenantId(String(e.companyId))
                              }
                              data-ocid={`platform-admin.billing_annual_detail.${idx + 1}`}
                            >
                              <BarChart2 className="w-3.5 h-3.5" />
                              Jährliche Übersicht
                            </Button>
                          )}
                        </td>
                      </tr>
                      {/* Due date / pro-rata row — shown for all entries */}
                      {(isYearly ||
                        (e.proRataAmount ?? 0) !== 0 ||
                        (e.creditAmount ?? 0) !== 0) && (
                        <tr className="bg-muted/10">
                          <td colSpan={2} />
                          <td colSpan={5} className="px-2 py-1 text-xs">
                            {(e.proRataAmount ?? 0) > 0 && (
                              <span className="text-amber-600 font-medium">
                                Nachzahlung (Plan-Upgrade): CHF{" "}
                                {formatChfSwiss(e.proRataAmount ?? 0)}
                              </span>
                            )}
                            {(e.creditAmount ?? 0) > 0 && (
                              <span className="text-green-600 font-medium">
                                Guthaben (Plan-Downgrade): CHF{" "}
                                {formatChfSwiss(e.creditAmount ?? 0)}
                              </span>
                            )}
                            {isYearly &&
                              e.nextDueDateTimestamp !== undefined &&
                              e.nextDueDateTimestamp > 0n && (
                                <span className="ml-3 text-muted-foreground">
                                  Nächste Fälligkeit:{" "}
                                  {formatDateShort(e.nextDueDateTimestamp)}
                                </span>
                              )}
                            {!isYearly && (
                              <span className="ml-3 text-muted-foreground">
                                Nächste Fälligkeit: Monatsende
                              </span>
                            )}
                            {e.proRataNote && (
                              <span className="ml-2 text-muted-foreground">
                                {e.proRataNote}
                              </span>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t border-border bg-muted/20">
                  <td
                    colSpan={5}
                    className="px-2 py-2 text-right text-xs font-semibold text-muted-foreground hidden md:table-cell"
                  >
                    Gesamtumsatz
                  </td>
                  <td
                    colSpan={1}
                    className="px-2 py-2 text-right text-xs font-semibold text-muted-foreground md:hidden"
                  >
                    Gesamtumsatz
                  </td>
                  <td className="px-2 py-2.5 text-right tabular-nums font-bold text-foreground">
                    {formatChfSwiss(totalCHF)}
                  </td>
                  <td className="hidden sm:table-cell" />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ────────────────────────────────────────────────────────────────
// SubscriptionSection
// ────────────────────────────────────────────────────────────────

function SubscriptionSection() {
  const { actor, isFetching } = useActor(createActor);
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editPlan, setEditPlan] = useState<SubscriptionPlan | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Subscription plans — fully typed, bindgen has been re-run
  const { data: plans, isLoading } = useQuery<SubscriptionPlan[]>({
    queryKey: ["subscriptionPlans"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllSubscriptionPlans();
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Kein Aktor verfügbar");
      await actor.deleteSubscriptionPlan(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptionPlans"] });
      toast.success("Plan gelöscht.");
      setDeleteConfirm(null);
    },
    onError: (err: Error) => {
      toast.error(`Fehler beim Löschen: ${err.message}`);
    },
  });

  const openCreate = () => {
    setEditPlan(null);
    setModalOpen(true);
  };

  const openEdit = (plan: SubscriptionPlan) => {
    setEditPlan(plan);
    setModalOpen(true);
  };

  return (
    <Card data-ocid="platform-admin.subscription_section">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-primary" />
            Abonnement-Konfiguration
          </CardTitle>
          <Button
            size="sm"
            onClick={openCreate}
            data-ocid="platform-admin.subscription_new_plan_button"
            className="gap-1.5 text-xs h-8"
          >
            <Plus className="w-3.5 h-3.5" />
            Neuer Plan
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Definiere und verwalte die verfügbaren Abonnement-Pläne für iReport.
          Aktive Pläne werden auf der Startseite angezeigt.
        </p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div
            data-ocid="platform-admin.subscription_loading_state"
            className="space-y-3"
          >
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : !plans || plans.length === 0 ? (
          <div
            data-ocid="platform-admin.subscription_empty_state"
            className="text-center py-10 border-2 border-dashed border-border rounded-lg"
          >
            <CreditCard className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground mb-1">
              Noch keine Pläne definiert
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              Erstelle deinen ersten Abonnement-Plan für iReport.
            </p>
            <Button
              size="sm"
              onClick={openCreate}
              data-ocid="platform-admin.subscription_create_first_button"
              className="gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Ersten Plan erstellen
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {plans.map((plan, idx) => (
              <div
                key={plan.id}
                data-ocid={`platform-admin.subscription_plan_card.${idx + 1}`}
                className="border border-border rounded-lg p-4 hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm text-foreground">
                        {plan.name}
                      </span>
                      <Badge
                        variant={plan.isActive ? "default" : "secondary"}
                        className={`text-[10px] px-1.5 py-0 ${
                          plan.isActive
                            ? "bg-green-100 text-green-700 border-green-200"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {plan.isActive ? "Aktiv" : "Inaktiv"}
                      </Badge>
                    </div>
                    {plan.description && (
                      <p className="text-xs text-muted-foreground mb-2">
                        {plan.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mb-2">
                      <span>
                        <span className="font-medium text-foreground">
                          CHF {plan.pricePerMonthCHF.toFixed(2)}
                        </span>{" "}
                        / MA / Monat
                      </span>
                      <span>
                        <span className="font-medium text-foreground">
                          CHF {plan.pricePerYearCHF.toFixed(2)}
                        </span>{" "}
                        / MA / Jahr
                      </span>

                      <span>
                        Min.{" "}
                        <span className="font-medium text-foreground">
                          {Number(plan.minActiveDaysPerMonth ?? 1n)}
                        </span>{" "}
                        Akt.-Tage
                      </span>
                      <span>
                        Max.{" "}
                        <span className="font-medium text-foreground">
                          {isUnlimited(plan.maxEmployees)
                            ? "Unbegrenzt"
                            : Number(plan.maxEmployees)}
                        </span>{" "}
                        MA
                      </span>
                    </div>
                    {plan.features.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {plan.features.map((feat) => (
                          <span
                            key={feat}
                            className="inline-flex items-center px-1.5 py-0.5 bg-primary/8 text-primary text-[10px] rounded-full border border-primary/20"
                          >
                            {feat}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEdit(plan)}
                      data-ocid={`platform-admin.subscription_plan_edit_button.${idx + 1}`}
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                      aria-label={`Plan bearbeiten: ${plan.name}`}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    {deleteConfirm === plan.id ? (
                      <div className="flex items-center gap-1">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteMutation.mutate(plan.id)}
                          disabled={deleteMutation.isPending}
                          data-ocid={`platform-admin.subscription_plan_confirm_delete.${idx + 1}`}
                          className="h-7 text-xs px-2"
                        >
                          Löschen
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteConfirm(null)}
                          data-ocid={`platform-admin.subscription_plan_cancel_delete.${idx + 1}`}
                          className="h-7 w-7 p-0"
                        >
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteConfirm(plan.id)}
                        data-ocid={`platform-admin.subscription_plan_delete_button.${idx + 1}`}
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                        aria-label={`Plan löschen: ${plan.name}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <SubscriptionPlanModal
        open={modalOpen}
        plan={editPlan}
        onClose={() => setModalOpen(false)}
        onSaved={() =>
          queryClient.invalidateQueries({ queryKey: ["subscriptionPlans"] })
        }
      />
    </Card>
  );
}

// ────────────────────────────────────────────────────────────────
// StripeConfigSection  (global Stripe key/webhook configuration)
// ────────────────────────────────────────────────────────────────

function StripeConfigSection() {
  const { actor, isFetching } = useActor(createActor);
  const queryClient = useQueryClient();

  const [secretKey, setSecretKey] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  const [publishableKey, setPublishableKey] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [showWebhook, setShowWebhook] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [endpointCopied, setEndpointCopied] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [testResults, setTestResults] = useState<{
    api: { ok: boolean; message: string } | null;
    portal: { ok: boolean; message: string } | null;
  } | null>(null);

  const WEBHOOK_ENDPOINT_URL =
    "https://strategic-cyan-kjv-draft.caffeine.xyz/api/stripe/webhook";

  async function handleCopyEndpoint() {
    try {
      await navigator.clipboard.writeText(WEBHOOK_ENDPOINT_URL);
      setEndpointCopied(true);
      setTimeout(() => setEndpointCopied(false), 2000);
    } catch {
      toast.error("Kopieren fehlgeschlagen");
    }
  }

  async function handleTestConnection() {
    if (!actor) return;
    setTestLoading(true);
    setTestResults(null);
    try {
      const result = (await toAny(actor).testStripeConnection()) as {
        apiConnectionOk: boolean;
        apiConnectionMessage: string;
        customerPortalOk: boolean;
        customerPortalMessage: string;
      };
      setTestResults({
        api: {
          ok: result.apiConnectionOk,
          message: result.apiConnectionMessage,
        },
        portal: {
          ok: result.customerPortalOk,
          message: result.customerPortalMessage,
        },
      });
    } catch (e) {
      setTestResults({
        api: { ok: false, message: e instanceof Error ? e.message : String(e) },
        portal: { ok: false, message: "Test konnte nicht durchgeführt werden" },
      });
    } finally {
      setTestLoading(false);
    }
  }

  const { data: configStatus, isLoading: statusLoading } = useQuery<{
    configured: boolean;
    testMode: boolean;
    hasPublishableKey: boolean;
  }>({
    queryKey: ["stripeConfigStatus"],
    queryFn: async () => {
      if (!actor)
        return { configured: false, testMode: true, hasPublishableKey: false };
      try {
        return (await toAny(actor).getStripeConfigStatus()) as {
          configured: boolean;
          testMode: boolean;
          hasPublishableKey: boolean;
        };
      } catch {
        return { configured: false, testMode: true, hasPublishableKey: false };
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
  });

  // Check if publishable key is saved in the backend
  const { data: publishableKeySaved } = useQuery<boolean>({
    queryKey: ["stripePublishableKeySaved"],
    queryFn: async () => {
      if (!actor) return false;
      try {
        const result = await toAny(actor).getStripePublishableKey();
        return (
          result !== null &&
          result !== undefined &&
          (result as string | null) !== null
        );
      } catch {
        return false;
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Kein Aktor verfügbar");
      // Guard: never overwrite a saved key with an empty string.
      // If the config is already set and a sensitive field is left blank,
      // the user must re-enter it to update it.
      const isAlreadyConfigured = configStatus?.configured ?? false;
      const sk = secretKey.trim();
      const pk = publishableKey.trim();
      const wh = webhookSecret.trim();
      if (isAlreadyConfigured) {
        // At least the fields the user actually entered must be sent;
        // fields left blank must not overwrite saved values.
        // Since backend requires all 3 params, require that any field
        // being updated is accompanied by the other required fields.
        if (sk === "" && wh === "") {
          // Only publishable key is being updated — but backend requires
          // all 3. We cannot safely send empty strings for secret/webhook.
          throw new Error(
            "Bitte Secret Key und Webhook Secret ebenfalls eingeben, da alle drei Felder beim Speichern übermittelt werden müssen.",
          );
        }
        if (sk === "") {
          throw new Error(
            "Bitte den Secret Key neu eingeben (wird aus Sicherheitsgründen nicht angezeigt).",
          );
        }
        if (wh === "") {
          throw new Error(
            "Bitte das Webhook Secret neu eingeben (wird aus Sicherheitsgründen nicht angezeigt).",
          );
        }
      } else {
        // First-time setup: all three fields are required.
        if (sk === "") throw new Error("Bitte den Secret Key eingeben.");
        if (wh === "") throw new Error("Bitte das Webhook Secret eingeben.");
      }
      const r = (await toAny(actor).setStripeConfig(sk, pk, wh)) as {
        __kind__: "ok" | "err";
        err?: string;
      };
      if (r.__kind__ === "err") throw new Error(r.err ?? "Fehler");
    },
    onSuccess: () => {
      toast.success("Stripe-Konfiguration gespeichert.");
      setSecretKey("");
      setWebhookSecret("");
      setPublishableKey("");
      queryClient.invalidateQueries({ queryKey: ["stripeConfigStatus"] });
      queryClient.invalidateQueries({
        queryKey: ["stripePublishableKeySaved"],
      });
    },
    onError: (err: Error) => toast.error(`Fehler: ${err.message}`),
  });

  // Allow saving if any key field has been entered
  // (publishable key alone can be updated without re-entering secret/webhook)
  const canSave =
    secretKey.trim().length > 0 ||
    publishableKey.trim().length > 0 ||
    webhookSecret.trim().length > 0;

  return (
    <Card data-ocid="platform-admin.stripe_config_card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-primary" />
            <CardTitle className="text-base font-semibold">
              Stripe-Konfiguration
            </CardTitle>
            {statusLoading ? (
              <Skeleton className="h-5 w-20" />
            ) : configStatus?.configured ? (
              <Badge className="text-[10px] px-1.5 py-0 bg-green-100 text-green-700 border-green-200">
                Konfiguriert
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                Nicht konfiguriert
              </Badge>
            )}
            {configStatus?.configured && (
              <Badge
                className={`text-[10px] px-1.5 py-0 ${
                  configStatus.testMode
                    ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                    : "bg-red-100 text-red-700 border-red-200"
                }`}
              >
                {configStatus.testMode ? "Test-Modus" : "Live-Modus"}
              </Badge>
            )}
          </div>
          <button
            type="button"
            onClick={() => setIsCollapsed((v) => !v)}
            aria-label={
              isCollapsed
                ? "Einstellungen ausklappen"
                : "Einstellungen einklappen"
            }
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Globale Stripe-Zugangsdaten für Zahlungsabwicklung. Keys werden sicher
          im Backend gespeichert und sind im Frontend nicht lesbar.
        </p>
      </CardHeader>

      {!isCollapsed && (
        <CardContent className="space-y-5">
          {/* Live mode warning */}
          {configStatus?.configured && !configStatus.testMode && (
            <div className="flex items-start gap-2 rounded-md bg-red-50 border border-red-200 px-3 py-2.5">
              <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">
                <strong>Live-Modus aktiv.</strong> Alle Zahlungen werden echt
                abgewickelt. Sei vorsichtig beim Ändern der Konfiguration.
              </p>
            </div>
          )}

          {/* Webhook Endpoint URL — read-only, copy button */}
          <div className="space-y-1.5">
            <Label htmlFor="stripe-webhook-url" className="text-sm font-medium">
              Webhook-Endpunkt-URL
            </Label>
            <div className="flex gap-2">
              <Input
                id="stripe-webhook-url"
                readOnly
                value={WEBHOOK_ENDPOINT_URL}
                data-ocid="platform-admin.stripe_endpoint_url_input"
                className="font-mono text-xs flex-1 bg-muted/40 text-muted-foreground"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 w-9 p-0 flex-shrink-0"
                onClick={handleCopyEndpoint}
                aria-label="URL kopieren"
                data-ocid="platform-admin.stripe_endpoint_copy_button"
              >
                {endpointCopied ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
            {endpointCopied && (
              <p className="text-[11px] text-green-600 font-medium">Kopiert!</p>
            )}
            <p className="text-[11px] text-muted-foreground">
              Diese URL unter Stripe → Entwickler → Webhooks → Endpunkt
              hinzufügen eintragen.
            </p>
          </div>

          {/* Publishable Key — stored in backend */}
          <div className="space-y-1.5">
            <Label htmlFor="stripe-pub-key" className="text-sm font-medium">
              Stripe Publishable Key
              {publishableKeySaved && !publishableKey && (
                <span className="ml-1 text-[11px] text-muted-foreground font-normal">
                  (gespeichert — neu eingeben zum Ändern)
                </span>
              )}
            </Label>
            <Input
              id="stripe-pub-key"
              data-ocid="platform-admin.stripe_publishable_key_input"
              value={publishableKey}
              onChange={(e) => setPublishableKey(e.target.value)}
              placeholder={
                publishableKeySaved
                  ? "(gespeichert — neu eingeben zum Ändern)"
                  : "pk_test_xxx oder pk_live_xxx"
              }
              className="font-mono text-xs"
            />
            <p className="text-[11px] text-muted-foreground">
              Öffentlicher Schlüssel — wird sicher im Backend gespeichert und
              für den Stripe-Checkout verwendet.
            </p>
          </div>

          {/* Secret Key */}
          <div className="space-y-1.5">
            <Label htmlFor="stripe-secret-key" className="text-sm font-medium">
              Stripe Secret Key <span className="text-destructive">*</span>
            </Label>
            <div className="flex gap-2">
              <Input
                id="stripe-secret-key"
                data-ocid="platform-admin.stripe_secret_key_input"
                type={showSecret ? "text" : "password"}
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                placeholder={
                  configStatus?.configured
                    ? "(gespeichert — neu eingeben zum Ändern)"
                    : "sk_test_xxx oder sk_live_xxx"
                }
                className="font-mono text-xs flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 flex-shrink-0"
                onClick={() => setShowSecret((v) => !v)}
                aria-label={showSecret ? "Verbergen" : "Anzeigen"}
              >
                {showSecret ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Webhook Secret */}
          <div className="space-y-1.5">
            <Label
              htmlFor="stripe-webhook-secret"
              className="text-sm font-medium"
            >
              Webhook Secret <span className="text-destructive">*</span>
            </Label>
            <div className="flex gap-2">
              <Input
                id="stripe-webhook-secret"
                data-ocid="platform-admin.stripe_webhook_secret_input"
                type={showWebhook ? "text" : "password"}
                value={webhookSecret}
                onChange={(e) => setWebhookSecret(e.target.value)}
                placeholder={
                  configStatus?.configured
                    ? "(gespeichert — neu eingeben zum Ändern)"
                    : "whsec_xxx"
                }
                className="font-mono text-xs flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 flex-shrink-0"
                onClick={() => setShowWebhook((v) => !v)}
                aria-label={showWebhook ? "Verbergen" : "Anzeigen"}
              >
                {showWebhook ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-border/50">
            <p className="text-[11px] text-muted-foreground">
              Secret Key und Webhook Secret werden verschlüsselt im Backend
              gespeichert und sind nach dem Speichern nicht mehr lesbar.
            </p>
            <Button
              type="button"
              size="sm"
              disabled={saveMutation.isPending || !canSave}
              onClick={() => saveMutation.mutate()}
              data-ocid="platform-admin.stripe_config_save_button"
              className="gap-1.5 flex-shrink-0 ml-4"
            >
              <Save className="w-3.5 h-3.5" />
              {saveMutation.isPending ? "Speichert…" : "Speichern"}
            </Button>
          </div>

          {/* Verbindung testen */}
          <div className="space-y-2 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={testLoading || !configStatus?.configured}
              onClick={handleTestConnection}
              data-ocid="platform-admin.stripe_test_connection_button"
              className="gap-1.5"
            >
              {testLoading ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <ShieldCheck className="w-3.5 h-3.5" />
              )}
              {testLoading ? "Wird geprüft…" : "Verbindung testen"}
            </Button>
            {!configStatus?.configured && (
              <p className="text-[11px] text-muted-foreground">
                Stripe-Konfiguration muss zuerst gespeichert werden.
              </p>
            )}
            {testResults && (
              <div className="rounded-md border border-border bg-muted/30 p-3 space-y-2">
                <div className="flex items-center gap-2">
                  {testResults.api?.ok ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  )}
                  <div>
                    <p className="text-xs font-medium">Stripe API-Verbindung</p>
                    <p className="text-[11px] text-muted-foreground">
                      {testResults.api?.message}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {testResults.portal?.ok ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  )}
                  <div>
                    <p className="text-xs font-medium">Kundenportal</p>
                    <p className="text-[11px] text-muted-foreground">
                      {testResults.portal?.message}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

// ────────────────────────────────────────────────────────────────
// StripeCompanyDiagnostics
// ────────────────────────────────────────────────────────────────

interface StripeCompanyDiagnosticsProps {
  companyId: string;
  companyName: string;
}

function StripeCompanyDiagnostics({
  companyId,
  companyName,
}: StripeCompanyDiagnosticsProps) {
  const { actor, isFetching } = useActor(createActor);
  const queryClient = useQueryClient();
  const [relinkId, setRelinkId] = useState("");
  const [showRelink, setShowRelink] = useState(false);
  const companyIdBig = BigInt(companyId);

  const { data: stripeEvents = [], isLoading: eventsLoading } = useQuery({
    queryKey: ["stripeEvents", companyId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getStripeEvents(companyIdBig, 5n);
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
  });

  const { data: sub, isLoading: subLoading } = useQuery({
    queryKey: ["companySubDiag", companyId],
    queryFn: async () => {
      if (!actor) return null;
      try {
        const r = await actor.syncStripeSubscription(companyIdBig);
        if (r.__kind__ === "ok") return r.ok;
      } catch {
        /* ignore */
      }
      return null;
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
  });

  const syncMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Kein Aktor verfügbar");
      const r = await actor.manuallyTriggerStripeSync(companyIdBig);
      if (r.__kind__ === "err") throw new Error(r.err ?? "Fehler");
      return r.ok;
    },
    onSuccess: () => {
      toast.success("Stripe-Sync ausgelöst.");
      queryClient.invalidateQueries({
        queryKey: ["companySubDiag", companyId],
      });
      queryClient.invalidateQueries({ queryKey: ["stripeEvents", companyId] });
    },
    onError: (err: Error) => toast.error(`Fehler: ${err.message}`),
  });

  const compareMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Kein Aktor verfügbar");
      const r = await actor.compareStripeSubscriptionStatus(companyIdBig);
      if (r.__kind__ === "err") throw new Error(r.err ?? "Fehler");
      return r.ok;
    },
    onSuccess: (data) => {
      toast.info(
        `Stripe: ${data.stripeStatus} | Intern: ${data.internalStatus} | Synchron: ${data.inSync ? "Ja" : "Nein"}`,
        { duration: 8000 },
      );
    },
    onError: (err: Error) => toast.error(`Fehler: ${err.message}`),
  });

  const checkoutLinkMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Kein Aktor verfügbar");
      const plan = await actor.getCompanySubscriptionPlan(companyIdBig);
      if (!plan) throw new Error("Kein Plan zugeordnet");
      const r = await actor.createStripeCheckoutLinkForCompany(
        companyIdBig,
        plan.id,
        "monthly" as BillingModel,
      );
      if (r.__kind__ === "err") throw new Error(r.err ?? "Fehler");
      return r.ok;
    },
    onSuccess: (data) => {
      window.open(data.url, "_blank", "noopener,noreferrer");
      toast.success("Checkout-Link erstellt.");
    },
    onError: (err: Error) => toast.error(`Fehler: ${err.message}`),
  });

  const relinkMutation = useMutation({
    mutationFn: async () => {
      if (!actor || !relinkId.trim())
        throw new Error("Keine Stripe Customer-ID");
      const r = await actor.relinkStripeCustomer(companyIdBig, relinkId.trim());
      if (r.__kind__ === "err") throw new Error(r.err ?? "Fehler");
      return r.ok;
    },
    onSuccess: () => {
      toast.success("Stripe Customer neu verknüpft.");
      setRelinkId("");
      setShowRelink(false);
      queryClient.invalidateQueries({
        queryKey: ["companySubDiag", companyId],
      });
    },
    onError: (err: Error) => toast.error(`Fehler: ${err.message}`),
  });

  return (
    <div
      className="border border-border/60 rounded-lg p-4 space-y-3 bg-muted/10"
      data-ocid={`platform-admin.stripe_diag.${companyId}`}
    >
      <div className="flex items-center gap-2 mb-1">
        <Zap className="w-3.5 h-3.5 text-primary flex-shrink-0" />
        <span className="text-xs font-semibold text-foreground">
          {companyName}
        </span>
      </div>

      {/* Stripe fields */}
      {subLoading ? (
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-40" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
          <div>
            <span className="text-muted-foreground">Stripe Customer:</span>{" "}
            <span className="font-mono text-[11px] text-foreground">
              {sub?.stripeCustomerId ?? "—"}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Stripe Subscription:</span>{" "}
            <span className="font-mono text-[11px] text-foreground">
              {sub?.stripeSubscriptionId ?? "—"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Stripe-Status:</span>
            <PaymentStatusBadge status={sub?.stripeStatus} />
          </div>
          <div>
            <span className="text-muted-foreground">Letzter Sync:</span>{" "}
            <span className="text-foreground">
              {sub?.lastStripeSyncAt && sub.lastStripeSyncAt > 0n
                ? formatDate(sub.lastStripeSyncAt)
                : "—"}
            </span>
          </div>
        </div>
      )}

      {/* Last 5 Stripe events */}
      {!eventsLoading && stripeEvents.length > 0 && (
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">
            Letzte Events
          </p>
          {stripeEvents.slice(0, 3).map((ev) => (
            <div
              key={ev.id}
              className="flex items-center gap-2 text-[11px] text-muted-foreground"
            >
              <span
                className={`inline-flex w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                  ev.processingStatus === "processed"
                    ? "bg-green-500"
                    : ev.processingStatus === "failed"
                      ? "bg-red-500"
                      : "bg-yellow-400"
                }`}
              />
              <span className="font-mono truncate max-w-[200px]">
                {ev.eventType}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2 pt-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 text-xs gap-1.5"
          disabled={syncMutation.isPending}
          onClick={() => syncMutation.mutate()}
          data-ocid={`platform-admin.stripe_diag_sync.${companyId}`}
        >
          <RefreshCw
            className={`w-3 h-3 ${syncMutation.isPending ? "animate-spin" : ""}`}
          />
          Sync
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 text-xs gap-1.5"
          disabled={compareMutation.isPending}
          onClick={() => compareMutation.mutate()}
          data-ocid={`platform-admin.stripe_diag_compare.${companyId}`}
        >
          Status vergleichen
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 text-xs gap-1.5"
          disabled={checkoutLinkMutation.isPending}
          onClick={() => checkoutLinkMutation.mutate()}
          data-ocid={`platform-admin.stripe_diag_checkout_link.${companyId}`}
        >
          Checkout-Link
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 text-xs gap-1.5"
          onClick={() => setShowRelink((v) => !v)}
          data-ocid={`platform-admin.stripe_diag_relink_toggle.${companyId}`}
        >
          Customer verknüpfen
        </Button>
      </div>
      {showRelink && (
        <div className="flex gap-2 items-center">
          <Input
            value={relinkId}
            onChange={(e) => setRelinkId(e.target.value)}
            placeholder="cus_xxx Stripe Customer-ID"
            className="h-7 text-xs font-mono flex-1"
            data-ocid={`platform-admin.stripe_diag_relink_input.${companyId}`}
          />
          <Button
            type="button"
            size="sm"
            className="h-7 text-xs"
            disabled={relinkMutation.isPending || !relinkId.trim()}
            onClick={() => relinkMutation.mutate()}
            data-ocid={`platform-admin.stripe_diag_relink_save.${companyId}`}
          >
            {relinkMutation.isPending ? "Speichert…" : "Speichern"}
          </Button>
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// PlatformAdminPage
// ────────────────────────────────────────────────────────────────

export default function PlatformAdminPage() {
  const { isPlatformAdmin } = useAuth();
  const { actor, isFetching } = useActor(createActor);
  const queryClient = useQueryClient();

  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Load company subscription assignments
  const { data: companySubscriptions = [] } = useQuery<Array<[string, string]>>(
    {
      queryKey: ["allCompanySubscriptions"],
      queryFn: async () => {
        if (!actor) return [];
        const result = await actor.getAllCompanySubscriptions();
        return result;
      },
      enabled: !!actor && !isFetching && isPlatformAdmin,
      staleTime: 60_000,
    },
  );

  const companySubscriptionMap = new Map(
    companySubscriptions.map(([cId, pId]) => [cId, pId]),
  );

  // Also load plans for the assignment dropdown
  const { data: allPlans = [] } = useQuery<
    import("../backend.d").SubscriptionPlan[]
  >({
    queryKey: ["subscriptionPlans"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllSubscriptionPlans();
    },
    enabled: !!actor && !isFetching && isPlatformAdmin,
    staleTime: 60_000,
  });

  const activePlans = allPlans.filter((p) => p.isActive);

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const { data: adminInfo, isLoading: loadingInfo } =
    useQuery<PlatformAdminInfo | null>({
      queryKey: ["platformAdminInfo"],
      queryFn: async () => {
        if (!actor) return null;
        const result = await toAny(actor).getPlatformAdminInfo();
        return (result as PlatformAdminInfo | null) ?? null;
      },
      enabled: !!actor && !isFetching && isPlatformAdmin,
      staleTime: 60_000,
    });

  const { data: systemStats, isLoading: loadingStats } =
    useQuery<SystemStats | null>({
      queryKey: ["systemStats"],
      queryFn: async () => {
        if (!actor) return null;
        const result = await toAny(actor).getSystemStats();
        return result as SystemStats;
      },
      enabled: !!actor && !isFetching && isPlatformAdmin,
      staleTime: 30_000,
    });

  const {
    data: companies,
    isLoading: loadingCompanies,
    isError: companiesError,
  } = useQuery<CompanyRow[]>({
    queryKey: ["allCompanies"],
    queryFn: async () => {
      if (!actor) return [];
      const result = await toAny(actor).listAllCompaniesForPlatformAdmin();
      return result as CompanyRow[];
    },
    enabled: !!actor && !isFetching && isPlatformAdmin,
    staleTime: 30_000,
  });

  // Platform admin company = earliest registered company
  const platformAdminCompanyId =
    companies && companies.length > 0
      ? companies.reduce((earliest, c) =>
          c.createdAt < earliest.createdAt ? c : earliest,
        ).id
      : null;

  const { data: costData } = useQuery<{ backendCanisterId: string } | null>({
    queryKey: ["costDashboard", "null", "null"],
    queryFn: async () => {
      if (!actor) return null;
      const result = await toAny(actor).getCostDashboardData(null, null);
      return result as { backendCanisterId: string };
    },
    enabled: !!actor && !isFetching && isPlatformAdmin,
    staleTime: 120_000,
  });

  // Load billing models per company
  const { data: companyBillingModels = new Map<string, string>() } = useQuery<
    Map<string, string>
  >({
    queryKey: ["companyBillingModels", companies?.map((c) => c.id)],
    queryFn: async () => {
      if (!actor || !companies || companies.length === 0)
        return new Map<string, string>();
      const results = await Promise.all(
        companies.map(async (c) => {
          try {
            const r = await actor.getCompanyBillingModel(BigInt(c.id));
            if (r.__kind__ === "ok") {
              return [c.id, r.ok.billingModel] as [string, string];
            }
          } catch {
            /* ignore */
          }
          return [c.id, "monthly"] as [string, string];
        }),
      );
      return new Map(results);
    },
    enabled:
      !!actor && !isFetching && isPlatformAdmin && (companies?.length ?? 0) > 0,
    staleTime: 60_000,
  });

  const billingModelMutation = useMutation({
    mutationFn: async ({
      companyId,
      billingModel,
    }: { companyId: string; billingModel: BillingModel }) => {
      if (!actor) throw new Error("Kein Aktor verfügbar");
      const result = await actor.setCompanyBillingModel(
        BigInt(companyId),
        billingModel,
      );
      if (result.__kind__ === "err") throw new Error(result.err ?? "Fehler");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companyBillingModels"] });
      queryClient.invalidateQueries({ queryKey: ["monthlyBilling"] });
      toast.success("Abrechnungsmodell gespeichert.");
    },
    onError: (err: Error) => {
      toast.error(`Fehler: ${err.message}`);
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({
      companyId,
      active,
    }: { companyId: string; active: boolean }) => {
      if (!actor) throw new Error("Kein Aktor verfügbar");
      const result = await toAny(actor).setCompanyActive(
        BigInt(companyId),
        active,
      );
      const typed = result as { __kind__: "ok" | "err"; err?: string };
      if (typed.__kind__ === "err") throw new Error(typed.err ?? "Fehler");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allCompanies"] });
    },
    onError: (err: Error) => {
      queryClient.invalidateQueries({ queryKey: ["allCompanies"] });
      toast.error(`Fehler: ${err.message}`);
    },
  });

  if (!isPlatformAdmin) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-6">
          <ShieldCheck className="w-16 h-16 text-muted-foreground" />
          <h1 className="text-xl font-semibold text-foreground">
            Kein Zugriff
          </h1>
          <p className="text-muted-foreground text-center max-w-sm">
            Du hast keine Berechtigung, auf die Platform-Administration
            zuzugreifen.
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-7 h-7 text-primary flex-shrink-0" />
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              Platform-Administration
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Systemweite Verwaltung aller Mandanten und Einstellungen
            </p>
          </div>
          <Badge
            data-ocid="platform-admin.badge"
            className="ml-auto bg-primary/10 text-primary border-primary/30 font-semibold"
          >
            Platform Admin
          </Badge>
        </div>

        {/* Admin Info */}
        <Card data-ocid="platform-admin.info_card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              Platform Admin Info
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingInfo ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-64" />
                <Skeleton className="h-4 w-48" />
              </div>
            ) : adminInfo ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Principal-ID
                  </p>
                  <p
                    data-ocid="platform-admin.principal_id"
                    className="text-sm font-mono text-foreground break-all bg-muted/50 px-2 py-1.5 rounded-md"
                  >
                    {adminInfo.principal}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Registriert am
                  </p>
                  <p
                    data-ocid="platform-admin.registered_at"
                    className="text-sm font-medium text-foreground"
                  >
                    {formatDate(adminInfo.createdAt)}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Keine Daten verfügbar
              </p>
            )}
          </CardContent>
        </Card>

        {/* System Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card data-ocid="platform-admin.stats_companies">
            <CardContent className="pt-5 pb-5">
              {loadingStats ? (
                <Skeleton className="h-10 w-20" />
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {systemStats ? Number(systemStats.totalCompanies) : "–"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Firmen total
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card data-ocid="platform-admin.stats_employees">
            <CardContent className="pt-5 pb-5">
              {loadingStats ? (
                <Skeleton className="h-10 w-20" />
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {systemStats ? Number(systemStats.totalEmployees) : "–"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Mitarbeitende total
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Companies */}
        <Card data-ocid="platform-admin.companies_card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              Mandantenübersicht
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingCompanies ? (
              <div
                data-ocid="platform-admin.companies_loading_state"
                className="space-y-3"
              >
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : companiesError ? (
              <div
                data-ocid="platform-admin.companies_error_state"
                className="text-sm text-destructive py-4 text-center"
              >
                Fehler beim Laden der Mandanten.
              </div>
            ) : !companies || companies.length === 0 ? (
              <div
                data-ocid="platform-admin.companies_empty_state"
                className="text-sm text-muted-foreground py-8 text-center"
              >
                Keine Firmen vorhanden.
              </div>
            ) : (
              <div className="overflow-x-auto -mx-1">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs text-muted-foreground">
                      <th className="text-left px-2 py-2 font-medium">
                        Firmenname
                      </th>
                      <th className="text-left px-2 py-2 font-medium hidden sm:table-cell whitespace-nowrap">
                        Registriert am
                      </th>
                      <th className="text-left px-2 py-2 font-medium hidden md:table-cell whitespace-nowrap">
                        Mitarbeitende
                      </th>
                      <th className="text-left px-2 py-2 font-medium hidden lg:table-cell whitespace-nowrap">
                        Abonnement
                      </th>
                      <th className="text-center px-2 py-2 font-medium">
                        Status
                      </th>
                      <th className="text-right px-2 py-2 font-medium">
                        Aktion
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {companies.map((company, index) => {
                      const isToggling =
                        toggleActiveMutation.isPending &&
                        toggleActiveMutation.variables?.companyId ===
                          company.id;
                      const isPACompany = company.id === platformAdminCompanyId;
                      return (
                        <CompanyTableRow
                          key={company.id}
                          company={company}
                          index={index}
                          isExpanded={expandedIds.has(company.id)}
                          onToggleExpand={() => toggleExpanded(company.id)}
                          isToggling={isToggling}
                          onToggleActive={() =>
                            toggleActiveMutation.mutate({
                              companyId: company.id,
                              active: !company.isActive,
                            })
                          }
                          isPlatformAdminCompany={isPACompany}
                          assignedPlanId={
                            companySubscriptionMap.get(company.id) ?? ""
                          }
                          activePlans={activePlans}
                          onPlanChange={async (planId) => {
                            if (!actor) return;
                            // 'none' sentinel means no plan assigned
                            const resolvedPlanId =
                              planId === "none" ? "" : planId;
                            try {
                              await toAny(actor).assignSubscriptionPlan(
                                company.id,
                                resolvedPlanId,
                              );
                              queryClient.invalidateQueries({
                                queryKey: ["allCompanySubscriptions"],
                              });
                              queryClient.invalidateQueries({
                                queryKey: ["monthlyBilling"],
                              });
                              queryClient.invalidateQueries({
                                queryKey: ["headerSubscriptionPlan"],
                              });
                            } catch (err) {
                              toast.error(
                                `Fehler: ${err instanceof Error ? err.message : String(err)}`,
                              );
                            }
                          }}
                          billingModel={
                            companyBillingModels.get(company.id) ?? "monthly"
                          }
                          onBillingModelChange={(model) =>
                            billingModelMutation.mutate({
                              companyId: company.id,
                              billingModel: model,
                            })
                          }
                          isBillingModelSaving={
                            billingModelMutation.isPending &&
                            billingModelMutation.variables?.companyId ===
                              company.id
                          }
                        />
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Billing Overview */}
        <BillingOverviewSection />

        {/* Subscription Configuration */}
        <SubscriptionSection />

        {/* Stripe-Konfiguration (global) */}
        <StripeConfigSection />

        {/* Stripe Diagnostics */}
        {companies && companies.length > 0 && (
          <Card data-ocid="platform-admin.stripe_diagnostics_card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                Stripe Diagnostics
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Stripe-Status und Diagnose-Aktionen pro Mandant.
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {companies
                .filter((c) => c.id !== platformAdminCompanyId)
                .map((c) => (
                  <StripeCompanyDiagnostics
                    key={c.id}
                    companyId={c.id}
                    companyName={c.name}
                  />
                ))}
            </CardContent>
          </Card>
        )}

        {/* Canister IDs */}
        <CanisterIdSection
          backendCanisterId={costData?.backendCanisterId ?? ""}
        />
      </div>
    </Layout>
  );
}
