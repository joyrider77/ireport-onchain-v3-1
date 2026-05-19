import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/hooks/useAuthStore";
import { useActor as useActorCore } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  Check,
  Copy,
  Link2,
  Loader2,
  Plus,
  Trash2,
  UserPen,
} from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { createActor } from "../../backend";
import type {
  BillingModel,
  CreateEmployeeInput,
  Employee,
  EmploymentType,
  ProjectMemberAssignment,
  Role,
  SubscriptionPlan,
  backendInterface,
} from "../../backend.d";
import { PlanChangeDialog } from "../../components/PlanChangeDialog";
import {
  type PlanChangeInfo,
  checkDowngradeNeeded,
  checkPlanChange,
} from "../../lib/planUtils";
import { MitarbeiterDetail } from "./MitarbeiterDetail";
import { getRoleLabel } from "./shared";

type AnyActor = backendInterface;
function useTypedActor() {
  const { actor, isFetching } = useActorCore(createActor);
  return {
    actor: actor ? (actor as unknown as AnyActor) : null,
    isFetching,
  };
}

interface EmployeeFormState {
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  employmentType: EmploymentType;
  startDate: string;
}

const defaultForm: EmployeeFormState = {
  firstName: "",
  lastName: "",
  email: "",
  role: "employee" as Role,
  employmentType: "fullTime" as EmploymentType,
  startDate: new Date().toISOString().split("T")[0],
};

interface InviteDialog {
  open: boolean;
  employeeName: string;
  url: string;
  copied: boolean;
}

export function MitarbeiterTab() {
  const { role, companyId: companyIdStr } = useAuth();
  const canWrite = role === "admin" || role === "manager";
  const { actor, isFetching } = useTypedActor();
  const qc = useQueryClient();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);
  const [purgeTarget, setPurgeTarget] = useState<Employee | null>(null);
  const [form, setForm] = useState<EmployeeFormState>(defaultForm);
  const [errors, setErrors] = useState<
    Partial<Record<keyof EmployeeFormState, string>>
  >({});
  const [detailEmployee, setDetailEmployee] = useState<Employee | null>(null);
  const [inviteDialog, setInviteDialog] = useState<InviteDialog>({
    open: false,
    employeeName: "",
    url: "",
    copied: false,
  });

  // Plan-change dialog state
  const [planChangeOpen, setPlanChangeOpen] = useState(false);
  const [planChangeInfo, setPlanChangeInfo] = useState<PlanChangeInfo | null>(
    null,
  );
  /**
   * action === "create": dialog shown BEFORE saving (upgrade path)
   *   → onConfirm must save the employee + change plan
   * action === "deactivate" | "purge": dialog shown AFTER the operation (downgrade suggestion)
   *   → onConfirm changes plan only; onCancel keeps current plan
   */
  const [planChangeAction, setPlanChangeAction] = useState<
    "create" | "deactivate" | "purge"
  >("create");
  // Inline error shown inside PlanChangeDialog after checkout attempt
  const [stripeCheckoutError, setStripeCheckoutError] = useState<string | null>(
    null,
  );

  // ── Queries ────────────────────────────────────────────────────────────────

  const { data: employees = [], isLoading } = useQuery<Employee[]>({
    queryKey: ["employees"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.listEmployees();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });

  /**
   * IMPORTANT: Use getSubscriptionPlans() (public API, no auth check) instead of
   * getAllSubscriptionPlans() which is Platform-Admin-only and throws for regular users.
   * When getAllSubscriptionPlans() throws, the catch returns [] -> checkPlanChange returns null
   * -> dialog never shows. This was the root cause of the missing upgrade dialog.
   */
  const { data: allPlans = [] } = useQuery<SubscriptionPlan[]>({
    queryKey: ["subscriptionPlans"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getSubscriptionPlans();
    },
    enabled: !!actor && !isFetching,
    staleTime: 120_000,
  });

  const { data: companySubscriptions = [] } = useQuery<Array<[string, string]>>(
    {
      queryKey: ["allCompanySubscriptions"],
      queryFn: async () => {
        if (!actor) return [];
        try {
          const res = await (
            actor as unknown as Record<
              string,
              (...args: unknown[]) => Promise<unknown>
            >
          ).getAllCompanySubscriptions();
          return res as Array<[string, string]>;
        } catch {
          return [];
        }
      },
      enabled: !!actor && !isFetching,
      staleTime: 120_000,
    },
  );

  // ── Employee creation helper ───────────────────────────────────────────────

  async function doCreateEmployee(currentActor: AnyActor) {
    const input: CreateEmployeeInput = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      role: form.role,
      employmentType: form.employmentType,
      startDate: form.startDate,
      weeklyHoursTarget: 0,
    };
    const res = await currentActor.createEmployee(input);
    if (res.__kind__ === "err") throw new Error(res.err);
    const newEmployee = res.ok;
    try {
      const [projects, serviceTypes] = await Promise.all([
        currentActor.listProjects(),
        currentActor.listServiceTypes(),
      ]);
      const internProject = (
        projects as Array<{
          id: bigint;
          name: string;
          code: string;
          active: boolean;
        }>
      ).find(
        (p) =>
          p.name?.toLowerCase() === "intern" ||
          p.code?.toLowerCase() === "intern",
      );
      const interneAdminSt = (
        serviceTypes as Array<{ id: bigint; name: string }>
      ).find(
        (st) =>
          st.name?.toLowerCase().includes("interne administration") ||
          st.name?.toLowerCase().includes("interne admin"),
      );
      if (internProject && interneAdminSt && newEmployee) {
        const membersRes = await currentActor.getProjectMembers(
          internProject.id,
        );
        const existingMembers: ProjectMemberAssignment[] =
          membersRes.__kind__ === "ok"
            ? (membersRes.ok as ProjectMemberAssignment[])
            : [];
        const alreadyAssigned = existingMembers.some(
          (m) => String(m.employeeId) === String(newEmployee.id),
        );
        if (!alreadyAssigned) {
          const updatedMembers: ProjectMemberAssignment[] = [
            ...existingMembers,
            {
              employeeId: newEmployee.id,
              serviceTypeId: interneAdminSt.id,
              stundensatz: 0,
            },
          ];
          await currentActor.setProjectMembers(
            internProject.id,
            updatedMembers,
          );
        }
      }
    } catch {
      /* Non-fatal */
    }
    return newEmployee;
  }

  // ── Stripe quantity update helper (fire-and-forget) ──────────────────────
  /**
   * Updates the Stripe subscription quantity to match the current active employee count.
   * Called after any employee creation, deactivation, or deletion.
   * Fire-and-forget: never blocks the UI or throws.
   */
  async function fireStripeQuantityUpdate(currentActor: AnyActor) {
    if (!companyIdStr) return;
    try {
      const freshEmp = await currentActor.listEmployees();
      const newActiveCount = freshEmp.filter((e) => e.active).length;
      const anyActor = currentActor as unknown as Record<
        string,
        (...args: unknown[]) => Promise<unknown>
      >;
      if (typeof anyActor.updateStripeSubscriptionQuantity === "function") {
        anyActor
          .updateStripeSubscriptionQuantity(
            BigInt(companyIdStr),
            BigInt(newActiveCount),
          )
          .then((r) => {
            const res = r as { __kind__: string; err?: string };
            if (res.__kind__ === "err" && res.err) {
              console.warn("[Stripe] Quantity update failed:", res.err);
            }
          })
          .catch((e: unknown) => {
            console.warn("[Stripe] Quantity update exception:", e);
          });
      }
    } catch {
      // Non-fatal — employee operation already succeeded
    }
  }

  // ── Mutations ──────────────────────────────────────────────────────────────

  /**
   * Direct save mutation — called ONLY when no plan change is needed.
   * Two-step flow ensures dialog state is set synchronously BEFORE any mutation.
   */
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Kein Actor");
      return doCreateEmployee(actor);
    },
    onSuccess: async () => {
      qc.invalidateQueries({ queryKey: ["employees"] });
      qc.invalidateQueries({ queryKey: ["headerSubscriptionPlan"] });
      toast.success("Mitarbeiter erstellt");
      setAddDialogOpen(false);
      setForm(defaultForm);

      // REQ-3: update Stripe subscription quantity (fire-and-forget)
      if (actor) void fireStripeQuantityUpdate(actor);
    },
    onError: (e: Error) => {
      toast.error(e.message);
    },
  });

  /**
   * Plan change + save mutation.
   * For action="create": changes plan, then saves the employee.
   * For action="deactivate" | "purge": changes plan only (employee already removed).
   */
  const planChangeMutation = useMutation({
    mutationFn: async ({
      billingModel,
      action,
    }: {
      billingModel: BillingModel;
      action: "create" | "deactivate" | "purge";
    }): Promise<{ stripeUrl?: string }> => {
      if (!actor || !companyIdStr) throw new Error("Kein Actor");
      const suggestedPlanId = planChangeInfo?.suggestedPlanId;
      let appliedPlan: SubscriptionPlan | null = null;

      if (suggestedPlanId) {
        const anyActor = actor as unknown as Record<
          string,
          (...args: unknown[]) => Promise<unknown>
        >;
        if (typeof anyActor.applyPlanChange === "function") {
          await anyActor.applyPlanChange(
            BigInt(companyIdStr),
            suggestedPlanId,
            billingModel,
          );
        } else {
          await anyActor.assignSubscriptionPlan(
            String(companyIdStr),
            suggestedPlanId,
          );
          await actor.setCompanyBillingModel(
            BigInt(companyIdStr),
            billingModel,
          );
        }
        // Resolve the applied plan to check if Stripe checkout is needed
        appliedPlan = allPlans.find((p) => p.id === suggestedPlanId) ?? null;
      } else {
        await actor.setCompanyBillingModel(BigInt(companyIdStr), billingModel);
      }

      // If the new plan requires Stripe payment, create a checkout session
      const needsStripe =
        appliedPlan?.requiresPayment === true &&
        !!(appliedPlan?.stripePriceId || appliedPlan?.stripePriceIdYearly);

      if (action === "create") await doCreateEmployee(actor);

      if (needsStripe && appliedPlan && companyIdStr) {
        try {
          const checkoutResult = await actor.createStripeCheckoutSession(
            BigInt(companyIdStr),
            appliedPlan.id,
            billingModel,
          );
          if (checkoutResult.__kind__ === "ok" && checkoutResult.ok?.url) {
            return { stripeUrl: checkoutResult.ok.url };
          }
          // Session creation returned an error variant
          const errMsg =
            (checkoutResult as { __kind__: "err"; err?: string }).err ??
            "Checkout-Session konnte nicht erstellt werden";
          console.error("[Stripe] Checkout Session Fehler:", errMsg);
          throw new Error(
            `Fehler beim Erstellen der Stripe-Sitzung: ${errMsg}`,
          );
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          console.error("[Stripe] Checkout Session Exception:", msg);
          throw new Error(
            msg.startsWith("Fehler beim Erstellen")
              ? msg
              : `Fehler beim Erstellen der Stripe-Sitzung: ${msg}`,
          );
        }
      }

      return {};
    },
    onSuccess: ({ stripeUrl }, { action }) => {
      qc.invalidateQueries({ queryKey: ["employees"] });
      qc.invalidateQueries({ queryKey: ["allCompanySubscriptions"] });
      qc.invalidateQueries({ queryKey: ["monthlyBilling"] });
      qc.invalidateQueries({ queryKey: ["headerSubscriptionPlan"] });

      if (stripeUrl) {
        // Redirect to Stripe immediately — do UI cleanup first, then redirect
        if (action === "create") {
          setAddDialogOpen(false);
          setForm(defaultForm);
        } else {
          setDeleteTarget(null);
        }
        setPlanChangeOpen(false);
        setPlanChangeInfo(null);
        setStripeCheckoutError(null);
        // Short delay for React to flush state before navigation
        setTimeout(() => {
          window.location.href = stripeUrl;
        }, 100);
        return;
      }

      // No Stripe redirect needed — normal plan change
      setPlanChangeOpen(false);
      setPlanChangeInfo(null);
      setStripeCheckoutError(null);
      if (action === "create") {
        toast.success("Mitarbeiter erstellt, Plan angepasst");
        setAddDialogOpen(false);
        setForm(defaultForm);
      } else {
        toast.success("Plan angepasst");
        setDeleteTarget(null);
      }
    },
    onError: (e: Error) => {
      console.error("[PlanChange] Fehler beim Planwechsel:", e);
      // Show inline error inside the dialog instead of just a disappearing toast
      setStripeCheckoutError(
        `Fehler beim Erstellen der Stripe-Sitzung: ${e.message}`,
      );
      toast.error(e.message);
    },
  });

  /**
   * Downgrade check helper — runs AFTER deactivate/purge completes.
   * Fetches fresh data, shows dialog if a lower plan is now sufficient.
   */
  /**
   * Downgrade check helper — runs AFTER deactivate/purge completes.
   * Fetches fresh employee list, finds cheapest plan that covers the new count,
   * and shows a dialog if a cheaper plan is available — regardless of current
   * plan’s max (even Plan-Max=999 can be downgraded to a cheaper limited plan).
   */
  const checkDowngradeAfterRemoval = useCallback(
    async (currentActor: AnyActor) => {
      if (!companyIdStr) return;

      // ── Fetch fresh employees ─────────────────────────────────────────────
      let freshEmployees: Employee[] = employees;
      try {
        freshEmployees = await currentActor.listEmployees();
      } catch {
        // fall back to cached employees list
      }

      // ── Fetch fresh plan list ─────────────────────────────────────────────
      let freshPlans: SubscriptionPlan[] = allPlans;
      // CRITICAL FIX: Use getSubscriptionPlans() (public API) instead of
      // getAllSubscriptionPlans() which throws for non-Platform-Admin users.
      try {
        freshPlans = await currentActor.getSubscriptionPlans();
      } catch {
        freshPlans = allPlans;
      }

      if (freshPlans.length === 0) return;

      // ── Resolve current plan via direct typed method ──────────────────────
      let currentPlan: SubscriptionPlan | null = null;
      try {
        currentPlan = await currentActor.getCompanySubscriptionPlan(
          BigInt(companyIdStr),
        );
      } catch {
        // ignore — currentPlan stays null, downgrade check skipped
      }

      if (!currentPlan) return;

      // Count active employees AFTER removal (listEmployees was already updated)
      const newActiveCount = freshEmployees.filter((e) => e.active).length;

      const suggestedPlan = checkDowngradeNeeded(
        newActiveCount,
        freshPlans,
        currentPlan,
      );

      if (suggestedPlan) {
        const planInfo: PlanChangeInfo = {
          currentPlanName: currentPlan.name,
          suggestedPlanName: suggestedPlan.name,
          suggestedPlanId: suggestedPlan.id,
          activeUserCount: BigInt(newActiveCount),
          isUpgrade: false,
        };
        qc.setQueryData(["employees"], freshEmployees);
        qc.setQueryData(["subscriptionPlans"], freshPlans);
        setPlanChangeInfo(planInfo);
        setPlanChangeOpen(true);
      }
    },
    [companyIdStr, employees, allPlans, qc],
  );

  /**
   * Deactivate mutation (sets employee inactive).
   */
  const deactivateMutation = useMutation({
    mutationFn: async (emp: Employee) => {
      if (!actor) throw new Error("Kein Actor");
      const res = await actor.deleteEmployee(emp.id);
      if (res.__kind__ === "err") throw new Error(res.err);
      return { emp, currentActor: actor };
    },
    onSuccess: async ({ currentActor }) => {
      qc.invalidateQueries({ queryKey: ["employees"] });
      qc.invalidateQueries({ queryKey: ["headerSubscriptionPlan"] });
      setDeleteTarget(null);
      toast.success("Mitarbeiter deaktiviert");
      setPlanChangeAction("deactivate");
      await checkDowngradeAfterRemoval(currentActor);
      // Update Stripe quantity even if no downgrade dialog is shown (fire-and-forget)
      void fireStripeQuantityUpdate(currentActor);
    },
    onError: (e: Error) => {
      toast.error(e.message);
    },
  });

  /**
   * Purge mutation — permanently deletes an inactive employee.
   */
  const purgeMutation = useMutation({
    mutationFn: async (emp: Employee) => {
      if (!actor) throw new Error("Kein Actor");
      const anyActor = actor as unknown as Record<
        string,
        (...args: unknown[]) => Promise<unknown>
      >;
      if (typeof anyActor.purgeEmployee === "function") {
        const res = (await anyActor.purgeEmployee(emp.id)) as {
          __kind__: string;
          err?: string;
        };
        if (res.__kind__ === "err")
          throw new Error(res.err ?? "Fehler beim Loeschen");
      } else {
        throw new Error(
          "Dieser Mitarbeiter kann nicht geloescht werden. Die Funktion ist im Backend noch nicht verfuegbar.",
        );
      }
      return { currentActor: actor };
    },
    onSuccess: async ({ currentActor }) => {
      qc.invalidateQueries({ queryKey: ["employees"] });
      qc.invalidateQueries({ queryKey: ["headerSubscriptionPlan"] });
      toast.success("Mitarbeiter geloescht");
      setPurgeTarget(null);
      setPlanChangeAction("purge");
      await checkDowngradeAfterRemoval(currentActor);
      // Update Stripe quantity even if no downgrade dialog is shown (fire-and-forget)
      void fireStripeQuantityUpdate(currentActor);
    },
    onError: (e: Error) => {
      toast.error(e.message);
      setPurgeTarget(null);
    },
  });

  const inviteMutation = useMutation<
    { code: string; name: string },
    Error,
    { id: bigint; name: string }
  >({
    mutationFn: async ({ id, name }: { id: bigint; name: string }) => {
      if (!actor) throw new Error("Kein Actor");
      const res = await actor.generateInviteCode(id);
      if (res.__kind__ === "err") throw new Error(res.err);
      return { code: res.ok, name };
    },
    onSuccess: ({ code, name }) => {
      const url = `${window.location.origin}/einladung?code=${code}`;
      localStorage.setItem(`inviteCode_${code}`, url);
      setInviteDialog({ open: true, employeeName: name, url, copied: false });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // ── Helpers ────────────────────────────────────────────────────────────────

  async function copyInviteUrl() {
    try {
      await navigator.clipboard.writeText(inviteDialog.url);
      setInviteDialog((d) => ({ ...d, copied: true }));
      setTimeout(() => setInviteDialog((d) => ({ ...d, copied: false })), 2000);
    } catch {
      toast.error("Kopieren fehlgeschlagen");
    }
  }

  function validate(): boolean {
    const errs: Partial<Record<keyof EmployeeFormState, string>> = {};
    if (!form.firstName.trim()) errs.firstName = "Pflichtfeld";
    if (!form.lastName.trim()) errs.lastName = "Pflichtfeld";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email))
      errs.email = "Gueltige E-Mail erforderlich";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function openAdd() {
    setForm(defaultForm);
    setErrors({});
    setAddDialogOpen(true);
  }

  /**
   * TWO-STEP SAVE — the key fix for the upgrade dialog.
   *
   * Step 1 (this function): Validate form, fetch FRESH plan data, check if upgrade needed.
   *   - If upgrade needed: set planChangeInfo + planChangeAction SYNCHRONOUSLY, show dialog.
   *     The dialog’s onConfirm will call planChangeMutation (step 2a).
   *   - If no upgrade: call saveMutation directly (step 2b).
   *
   * The fresh-data fetch prevents stale React state from causing missed plan checks.
   * Active count is filtered to THIS company only (excludes Platform-Admin employees).
   */
  async function handleSaveClick() {
    if (!validate() || !actor) return;

    // ── Step 1: Fetch fresh employee list ────────────────────────────────────
    let freshEmployees: Employee[] = employees;
    try {
      freshEmployees = await actor.listEmployees();
    } catch {
      // silent fallback to cached employee list
    }

    // ── Step 2: Fetch fresh plan list ─────────────────────────────────────────
    // CRITICAL FIX: Use getSubscriptionPlans() (public) instead of getAllSubscriptionPlans()
    // getAllSubscriptionPlans() is Platform-Admin-only and throws for regular company admins.
    // When it throws, plans = [] -> checkPlanChange returns null -> dialog never shows.
    let freshPlans: SubscriptionPlan[] = allPlans;
    try {
      freshPlans = await actor.getSubscriptionPlans();
    } catch {
      // fall back to cached plans; if cached is also empty, save without plan check below
    }

    if (freshPlans.length === 0) {
      saveMutation.mutate();
      return;
    }

    // ── Step 3: Resolve current plan via direct typed method ─────────────────
    // getCompanySubscriptionPlan(bigint) is the reliable typed backend method.
    // Do NOT use getAllCompanySubscriptions (parse-based, fragile).
    let currentPlanId = "";
    try {
      if (companyIdStr) {
        const companyPlan = await actor.getCompanySubscriptionPlan(
          BigInt(companyIdStr),
        );
        if (companyPlan) {
          currentPlanId = companyPlan.id;
        }
      }
    } catch {
      // ignore — currentPlanId stays empty; checkPlanChange uses best-fit fallback
    }

    // ── Step 4: Count active employees for this company ───────────────────────
    // listEmployees() is already scoped to the current company (tenant isolation).
    // Filter out deactivated employees only.
    const currentActiveCount = freshEmployees.filter((e) => e.active).length;
    const expectedActiveCount = currentActiveCount + 1;

    // ── Step 5: Check if plan change is needed ────────────────────────────────
    const planChangeNeeded = checkPlanChange(
      freshPlans,
      currentActiveCount,
      expectedActiveCount,
      currentPlanId,
    );

    if (planChangeNeeded) {
      // Update query cache with fresh data so the dialog has accurate plan info
      qc.setQueryData(["employees"], freshEmployees);
      qc.setQueryData(["subscriptionPlans"], freshPlans);
      // Set state SYNCHRONOUSLY — React batches these + shows dialog in same render cycle
      setPlanChangeInfo(planChangeNeeded);
      setPlanChangeAction("create");
      setPlanChangeOpen(true);
    } else {
      saveMutation.mutate();
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  if (detailEmployee) {
    return (
      <MitarbeiterDetail
        employee={detailEmployee}
        canWrite={canWrite}
        allPlans={allPlans}
        companyIdStr={companyIdStr ?? ""}
        companySubscriptions={companySubscriptions}
        onBack={() => setDetailEmployee(null)}
        onUpdated={(emp) => {
          setDetailEmployee(emp);
          qc.invalidateQueries({ queryKey: ["employees"] });
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {employees.length} Mitarbeiter
        </p>
        {canWrite && (
          <Button
            data-ocid="mitarbeiter-add"
            onClick={openAdd}
            size="sm"
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Mitarbeiter hinzufuegen
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Name</TableHead>
                <TableHead>E-Mail</TableHead>
                <TableHead>Rolle</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Keine Mitarbeiter vorhanden
                  </TableCell>
                </TableRow>
              ) : (
                employees.map((emp) => (
                  <TableRow
                    key={String(emp.id)}
                    data-ocid="mitarbeiter-row"
                    className="cursor-pointer hover:bg-muted/20"
                    onClick={() => setDetailEmployee(emp)}
                  >
                    <TableCell className="font-medium">
                      {emp.firstName} {emp.lastName}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {emp.email}
                    </TableCell>
                    <TableCell>{getRoleLabel(emp.role)}</TableCell>
                    <TableCell>
                      <Badge variant={emp.active ? "default" : "secondary"}>
                        {emp.active ? "Aktiv" : "Inaktiv"}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className="text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1">
                        {canWrite && (
                          <>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() =>
                                inviteMutation.mutate({
                                  id: emp.id,
                                  name: `${emp.firstName} ${emp.lastName}`,
                                })
                              }
                              disabled={inviteMutation.isPending}
                              aria-label="Einladungslink generieren"
                              title="Einladungslink generieren"
                            >
                              <Link2 className="w-4 h-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setDetailEmployee(emp)}
                              aria-label="Bearbeiten"
                            >
                              <UserPen className="w-4 h-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              title={
                                emp.active
                                  ? "Mitarbeiter deaktivieren"
                                  : "Mitarbeiter loeschen"
                              }
                              onClick={() => {
                                if (emp.active) {
                                  setDeleteTarget(emp);
                                } else {
                                  setPurgeTarget(emp);
                                }
                              }}
                              aria-label={
                                emp.active ? "Deaktivieren" : "Loeschen"
                              }
                              data-ocid="mitarbeiter-delete-button"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Mitarbeiter hinzufuegen</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="add-firstName">Vorname *</Label>
                <Input
                  id="add-firstName"
                  data-ocid="mitarbeiter-firstname"
                  value={form.firstName}
                  onChange={(e) =>
                    setForm({ ...form, firstName: e.target.value })
                  }
                />
                {errors.firstName && (
                  <p className="text-xs text-destructive">{errors.firstName}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="add-lastName">Nachname *</Label>
                <Input
                  id="add-lastName"
                  data-ocid="mitarbeiter-lastname"
                  value={form.lastName}
                  onChange={(e) =>
                    setForm({ ...form, lastName: e.target.value })
                  }
                />
                {errors.lastName && (
                  <p className="text-xs text-destructive">{errors.lastName}</p>
                )}
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="add-email">E-Mail *</Label>
              <Input
                id="add-email"
                type="email"
                data-ocid="mitarbeiter-email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Rolle *</Label>
                <Select
                  value={form.role as string}
                  onValueChange={(v) => setForm({ ...form, role: v as Role })}
                >
                  <SelectTrigger data-ocid="mitarbeiter-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrator</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="employee">Mitarbeiter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="add-startDate">Eintrittsdatum</Label>
                <Input
                  id="add-startDate"
                  type="date"
                  data-ocid="mitarbeiter-startdate"
                  value={form.startDate}
                  onChange={(e) =>
                    setForm({ ...form, startDate: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setAddDialogOpen(false)}
            >
              Abbrechen
            </Button>
            <Button
              type="button"
              data-ocid="mitarbeiter-save"
              onClick={handleSaveClick}
              disabled={saveMutation.isPending || planChangeMutation.isPending}
            >
              {saveMutation.isPending || planChangeMutation.isPending
                ? "Speichern..."
                : "Speichern"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invite Link Dialog */}
      <Dialog
        open={inviteDialog.open}
        onOpenChange={(open) => setInviteDialog((d) => ({ ...d, open }))}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Link2 className="w-5 h-5 text-primary" />
              Einladungslink fuer {inviteDialog.employeeName}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-1">
            <p className="text-sm text-muted-foreground">
              Kopieren Sie den folgenden Link und senden Sie ihn an den
              Mitarbeiter.
            </p>
            <div className="flex gap-2">
              <Input
                readOnly
                value={inviteDialog.url}
                data-ocid="invite-url-input"
                className="text-xs font-mono bg-muted/30 flex-1"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                data-ocid="invite-copy-btn"
                onClick={copyInviteUrl}
                aria-label="Link kopieren"
                className="shrink-0"
              >
                {inviteDialog.copied ? (
                  <Check className="w-4 h-4 text-primary" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
            {inviteDialog.copied && (
              <p className="text-xs text-primary font-medium">Link kopiert</p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setInviteDialog((d) => ({ ...d, open: false }))}
            >
              Schliessen
            </Button>
            <Button
              type="button"
              data-ocid="invite-copy-and-close"
              onClick={async () => {
                await copyInviteUrl();
                setTimeout(
                  () => setInviteDialog((d) => ({ ...d, open: false })),
                  800,
                );
              }}
              className="gap-2"
            >
              <Copy className="w-4 h-4" />
              Kopieren &amp; Schliessen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deactivate Confirmation Dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(o) => {
          if (!o) setDeleteTarget(null);
        }}
      >
        <DialogContent
          data-ocid="mitarbeiter.deactivate_dialog"
          className="max-w-sm"
        >
          <DialogHeader>
            <DialogTitle>Mitarbeiter deaktivieren?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            Moechtest du{" "}
            <strong>
              {deleteTarget?.firstName} {deleteTarget?.lastName}
            </strong>{" "}
            wirklich deaktivieren? Der Mitarbeiter kann sich danach nicht mehr
            anmelden.
          </p>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              data-ocid="mitarbeiter.deactivate_cancel_button"
            >
              Abbrechen
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deactivateMutation.isPending}
              data-ocid="mitarbeiter.deactivate_confirm_button"
              onClick={() => {
                if (deleteTarget) deactivateMutation.mutate(deleteTarget);
              }}
            >
              {deactivateMutation.isPending
                ? "Wird deaktiviert..."
                : "Deaktivieren"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Purge Confirmation Dialog */}
      <Dialog
        open={!!purgeTarget}
        onOpenChange={(o) => {
          if (!o) setPurgeTarget(null);
        }}
      >
        <DialogContent
          data-ocid="mitarbeiter.purge_dialog"
          className="max-w-sm"
        >
          <DialogHeader>
            <DialogTitle className="text-destructive">
              Mitarbeiter unwiderruflich loeschen?
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <p className="text-sm text-muted-foreground">
              Moechtest du{" "}
              <strong>
                {purgeTarget?.firstName} {purgeTarget?.lastName}
              </strong>{" "}
              wirklich loeschen? Diese Aktion kann{" "}
              <strong>nicht rueckgaengig</strong> gemacht werden.
            </p>
            <p className="text-xs text-muted-foreground">
              Hinweis: Mitarbeiter mit vorhandenen Zeiterfassungen, Ferien,
              Abwesenheiten oder Spesen koennen nicht geloescht werden.
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setPurgeTarget(null)}
              data-ocid="mitarbeiter.purge_cancel_button"
            >
              Abbrechen
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={purgeMutation.isPending}
              data-ocid="mitarbeiter.purge_confirm_button"
              onClick={() => {
                if (purgeTarget) purgeMutation.mutate(purgeTarget);
              }}
            >
              {purgeMutation.isPending ? "Wird geloescht..." : "Ja, loeschen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Plan Change Dialog */}
      <PlanChangeDialog
        open={planChangeOpen}
        info={planChangeInfo}
        allPlans={allPlans}
        isLoading={planChangeMutation.isPending}
        checkoutError={stripeCheckoutError}
        onConfirm={(billingModel) => {
          setStripeCheckoutError(null);
          planChangeMutation.mutate({ billingModel, action: planChangeAction });
        }}
        onCancel={() => {
          setPlanChangeOpen(false);
          setPlanChangeInfo(null);
          setStripeCheckoutError(null);
          if (planChangeAction === "create") {
            toast.info("Speichern abgebrochen.");
          } else {
            toast.info("Plan wurde nicht geaendert.");
          }
        }}
      />
    </div>
  );
}
