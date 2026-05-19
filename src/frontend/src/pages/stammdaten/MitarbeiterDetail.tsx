import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useActor as useActorCore } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ChevronDown, ChevronUp, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { createActor } from "../../backend";
import type {
  BillingModel,
  Employee,
  EmployeeComplianceProfile,
  Role,
  SubscriptionPlan,
  UpdateComplianceProfileInput,
  UpdateEmployeeInput,
  backendInterface,
} from "../../backend.d";
import { PlanChangeDialog } from "../../components/PlanChangeDialog";
import { type PlanChangeInfo, checkPlanChange } from "../../lib/planUtils";
import { EmploymentSection } from "./EmploymentSection";
import { TimeBalanceCorrectionSection } from "./TimeBalanceCorrectionSection";
import { VacationBalanceSection } from "./VacationBalanceSection";

type AnyActor = backendInterface;
function useTypedActor() {
  const { actor, isFetching } = useActorCore(createActor);
  return {
    actor: actor ? (actor as unknown as AnyActor) : null,
    isFetching,
  };
}

interface Props {
  employee: Employee;
  canWrite: boolean;
  /** All subscription plans — passed from MitarbeiterTab to avoid re-fetching */
  allPlans: SubscriptionPlan[];
  /** CompanyId string for billing model calls */
  companyIdStr: string;
  /** Company subscription entries [companyId, planId][] — for current plan lookup */
  companySubscriptions: Array<[string, string]>;
  onBack: () => void;
  onUpdated: (emp: Employee) => void;
}

interface PersonalForm {
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  geburtsdatum: string;
  startDate: string;
  adresseZusatz1: string;
  adresseZusatz2: string;
  strasse: string;
  postfach: string;
  plz: string;
  ort: string;
  land: string;
}

interface ComplianceForm {
  aktiv: boolean;
  vertraglicheWochenstunden: number;
  gesetzlicheWochenhochstarbeitszeit: number;
  gesetzlicherFerienanspruchWochen: number;
  vertraglicheZusatzferienTage: number;
  ausnahmeprofil: string;
}

function bigintToDateStr(ts?: bigint): string {
  if (!ts || ts === BigInt(0)) return "";
  const d = new Date(Number(ts) * 1000);
  return d.toISOString().split("T")[0];
}

function dateStrToBigint(s: string): bigint | undefined {
  if (!s) return undefined;
  return BigInt(Math.floor(new Date(`${s}T00:00:00Z`).getTime() / 1000));
}

export function MitarbeiterDetail({
  employee,
  canWrite,
  allPlans,
  companyIdStr,
  companySubscriptions: _companySubscriptions,
  onBack,
  onUpdated,
}: Props) {
  const { actor } = useTypedActor();
  const qc = useQueryClient();

  const [personalForm, setPersonalForm] = useState<PersonalForm>({
    firstName: employee.firstName,
    lastName: employee.lastName,
    email: employee.email,
    role: employee.role,
    geburtsdatum: bigintToDateStr(employee.geburtsdatum),
    startDate: employee.startDate ?? "",
    adresseZusatz1: employee.adresseZusatz1 ?? "",
    adresseZusatz2: employee.adresseZusatz2 ?? "",
    strasse: employee.strasse ?? "",
    postfach: employee.postfach ?? "",
    plz: employee.plz ?? "",
    ort: employee.ort ?? "",
    land: employee.land ?? "",
  });

  // ── Compliance Profile state ──────────────────────────────────────
  const [complianceOpen, setComplianceOpen] = useState(false);
  const [complianceForm, setComplianceForm] = useState<ComplianceForm>({
    aktiv: false,
    vertraglicheWochenstunden: 42,
    gesetzlicheWochenhochstarbeitszeit: 45,
    gesetzlicherFerienanspruchWochen: 4,
    vertraglicheZusatzferienTage: 0,
    ausnahmeprofil: "",
  });

  // ── Fetch compliance profile ────────────────────────────────────
  const { data: complianceProfile, isLoading: complianceLoading } =
    useQuery<EmployeeComplianceProfile | null>({
      queryKey: ["complianceProfile", String(employee.id)],
      queryFn: async () => {
        if (!actor) return null;
        try {
          return await actor.getComplianceProfile(employee.id);
        } catch {
          return null;
        }
      },
      enabled: !!actor && complianceOpen,
    });

  // Sync profile into form when loaded
  useEffect(() => {
    if (complianceProfile) {
      setComplianceForm({
        aktiv: complianceProfile.aktiv,
        vertraglicheWochenstunden: complianceProfile.vertraglicheWochenstunden,
        gesetzlicheWochenhochstarbeitszeit:
          complianceProfile.gesetzlicheWochenhochstarbeitszeit,
        gesetzlicherFerienanspruchWochen:
          complianceProfile.gesetzlicherFerienanspruchWochen,
        vertraglicheZusatzferienTage:
          complianceProfile.vertraglicheZusatzferienTage,
        ausnahmeprofil: complianceProfile.ausnahmeprofil ?? "",
      });
    }
  }, [complianceProfile]);

  // Track local active state — set ONLY after backend confirms
  const [activeOverride, setActiveOverride] = useState<boolean | null>(null);
  const displayActive =
    activeOverride !== null ? activeOverride : employee.active;

  // Plan-change dialog for status toggle
  const [planChangeOpen, setPlanChangeOpen] = useState(false);
  const [planChangeInfo, setPlanChangeInfo] = useState<PlanChangeInfo | null>(
    null,
  );
  const [pendingToggleActive, setPendingToggleActive] = useState<
    boolean | null
  >(null);

  // Fetch all employees to know current active count for plan check
  const { data: allEmployees = [] } = useQuery<Employee[]>({
    queryKey: ["employees"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.listEmployees();
      } catch {
        return [];
      }
    },
    enabled: !!actor,
    staleTime: 30_000,
  });

  // Supervisor dropdown state
  const [selectedSupervisorId, setSelectedSupervisorId] = useState("");

  useEffect(() => {
    if (employee?.id) {
      const saved = localStorage.getItem(`supervisor_${String(employee.id)}`);
      setSelectedSupervisorId(saved || "");
    }
  }, [employee?.id]);

  const supervisorOptions = allEmployees.filter(
    (e) =>
      (e.role === "admin" || e.role === "manager") &&
      String(e.id) !== String(employee.id),
  );

  // ── Personal data mutation ───────────────────────────────────────

  const updatePersonalMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Kein Actor");
      const input: UpdateEmployeeInput = {
        firstName: personalForm.firstName,
        lastName: personalForm.lastName,
        email: personalForm.email,
        role: personalForm.role,
        geburtsdatum: dateStrToBigint(personalForm.geburtsdatum),
        startDate: personalForm.startDate || undefined,
        adresseZusatz1: personalForm.adresseZusatz1 || undefined,
        adresseZusatz2: personalForm.adresseZusatz2 || undefined,
        strasse: personalForm.strasse || undefined,
        postfach: personalForm.postfach || undefined,
        plz: personalForm.plz || undefined,
        ort: personalForm.ort || undefined,
        land: personalForm.land || undefined,
      };
      const res = await actor.updateEmployee(employee.id, input);
      if (res.__kind__ === "err") throw new Error(res.err);
      return res.ok;
    },
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Persoenliche Daten gespeichert");
      onUpdated(updated);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // ── Compliance profile mutation ────────────────────────────────────
  const updateComplianceMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Kein Actor");
      const profileId = complianceProfile?.id ?? BigInt(0);
      const input: UpdateComplianceProfileInput = {
        id: profileId,
        aktiv: complianceForm.aktiv,
        vertraglicheWochenstunden: complianceForm.vertraglicheWochenstunden,
        gesetzlicheWochenhochstarbeitszeit:
          complianceForm.gesetzlicheWochenhochstarbeitszeit,
        gesetzlicherFerienanspruchWochen:
          complianceForm.gesetzlicherFerienanspruchWochen,
        vertraglicheZusatzferienTage:
          complianceForm.vertraglicheZusatzferienTage,
        ausnahmeprofil: complianceForm.ausnahmeprofil || undefined,
        erfassungsModus: complianceProfile?.erfassungsModus ?? "vollstaendig",
      };
      const res = await actor.updateComplianceProfile(input);
      if (res.__kind__ === "err") throw new Error(res.err);
      return res.ok;
    },
    onSuccess: () => {
      void qc.invalidateQueries({
        queryKey: ["complianceProfile", String(employee.id)],
      });
      toast.success("Compliance-Profil gespeichert");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // ── Plan-change mutation for status toggle ───────────────────────────

  const planChangeMutation = useMutation({
    mutationFn: async ({
      billingModel,
      newActive,
    }: { billingModel: BillingModel; newActive: boolean }) => {
      if (!actor || !companyIdStr) throw new Error("Kein Actor");
      const suggestedPlanId = planChangeInfo?.suggestedPlanId;
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
      } else {
        await actor.setCompanyBillingModel(BigInt(companyIdStr), billingModel);
      }
      // For upgrade: also apply the toggle now (was blocked until after confirm)
      if (pendingToggleActive !== null) {
        const res = await actor.setEmployeeActive(employee.id, newActive);
        if (res.__kind__ === "err") throw new Error(res.err);
        return res.ok;
      }
      // For downgrade: toggle already happened before the dialog
      return null as unknown as Employee;
    },
    onSuccess: (updated) => {
      if (updated) {
        setActiveOverride(updated.active);
        onUpdated(updated);
      }
      void qc.invalidateQueries({ queryKey: ["employees"] });
      void qc.invalidateQueries({ queryKey: ["allCompanySubscriptions"] });
      void qc.invalidateQueries({ queryKey: ["monthlyBilling"] });
      void qc.invalidateQueries({ queryKey: ["headerSubscriptionPlan"] });
      setPlanChangeOpen(false);
      setPlanChangeInfo(null);
      setPendingToggleActive(null);
      toast.success(
        pendingToggleActive
          ? "Mitarbeiter aktiviert, Plan angepasst"
          : "Mitarbeiter deaktiviert, Plan angepasst",
      );
    },
    onError: (e: Error) => {
      setActiveOverride(null);
      setPlanChangeOpen(false);
      toast.error(e.message);
    },
  });

  // ── Toggle active mutation (no plan change) ────────────────────────

  const toggleActiveMutation = useMutation({
    mutationFn: async (active: boolean) => {
      if (!actor) throw new Error("Kein Actor");
      const res = await actor.setEmployeeActive(employee.id, active);
      if (res.__kind__ === "err") throw new Error(res.err);
      return res.ok;
    },
    onSuccess: (updated) => {
      setActiveOverride(updated.active);
      onUpdated(updated);
      void qc.invalidateQueries({ queryKey: ["employees"] });
      void qc.invalidateQueries({ queryKey: ["headerSubscriptionPlan"] });
      toast.success(
        updated.active ? "Mitarbeiter aktiviert" : "Mitarbeiter deaktiviert",
      );
      // REQ-3: Update Stripe subscription quantity (fire-and-forget)
      if (actor && companyIdStr) {
        const anyActor = actor as unknown as Record<
          string,
          (...args: unknown[]) => Promise<unknown>
        >;
        if (typeof anyActor.updateStripeSubscriptionQuantity === "function") {
          actor
            .listEmployees()
            .then((emps) => {
              const cnt = emps.filter((e) => e.active).length;
              return anyActor.updateStripeSubscriptionQuantity(
                BigInt(companyIdStr),
                BigInt(cnt),
              );
            })
            .then((r) => {
              const qr = r as { __kind__: string; err?: string };
              if (qr.__kind__ === "err" && qr.err) {
                console.warn("[Stripe] Quantity update failed:", qr.err);
              }
            })
            .catch((ex: unknown) => {
              console.warn("[Stripe] Quantity update exception:", ex);
            });
        }
      }
    },
    onError: (e: Error) => {
      setActiveOverride(null);
      toast.error(`Status konnte nicht geaendert werden: ${e.message}`);
    },
  });

  /**
   * Handle status toggle:
   * 1. Get fresh employee count, plans, AND company subscriptions
   * 2. Run plan check for expected new count
   * 3a. Plan change needed -> show dialog (upgrade: before; downgrade: after)
   * 3b. No change -> toggle directly
   *
   * For UPGRADE (activation), we check BEFORE toggling (show dialog first).
   * For DOWNGRADE (deactivation), we toggle first, THEN show dialog if needed.
   */
  async function handleStatusToggle(newActive: boolean) {
    if (!actor) return;

    // ── Step 1: Fetch fresh employees ───────────────────────────────────────
    let freshEmployees: Employee[] = allEmployees;
    try {
      freshEmployees = await actor.listEmployees();
    } catch {
      // fall back to cached employee list
    }

    // ── Step 2: Fetch fresh plans ───────────────────────────────────────────
    let freshPlans: SubscriptionPlan[] = allPlans;
    // CRITICAL FIX: Use getSubscriptionPlans() (public API, no auth check).
    // getAllSubscriptionPlans() throws for non-Platform-Admin users -> plans = [] -> no dialog.
    if (freshPlans.length === 0) {
      try {
        freshPlans = await actor.getSubscriptionPlans();
      } catch {
        // ignore
      }
    }

    if (freshPlans.length === 0) {
      // No plans configured — toggle directly
      toggleActiveMutation.mutate(newActive);
      return;
    }

    // ── Step 3: Resolve current plan via direct typed method ─────────────────
    let freshPlanId = "";
    try {
      if (companyIdStr) {
        const companyPlan = await actor.getCompanySubscriptionPlan(
          BigInt(companyIdStr),
        );
        if (companyPlan) {
          freshPlanId = companyPlan.id;
        }
      }
    } catch {
      // ignore — freshPlanId stays empty, checkPlanChange uses best-fit fallback
    }

    // ── Step 4: Calculate expected count and check for plan change ──────────
    const currentActiveCount = freshEmployees.filter((e) => e.active).length;
    const expectedActiveCount = newActive
      ? currentActiveCount + 1 // activation
      : Math.max(0, currentActiveCount - 1); // deactivation

    const planChangeNeeded = checkPlanChange(
      freshPlans,
      currentActiveCount,
      expectedActiveCount,
      freshPlanId,
    );

    if (planChangeNeeded) {
      if (newActive) {
        // Upgrade: show dialog BEFORE toggling
        setPendingToggleActive(newActive);
        setPlanChangeInfo(planChangeNeeded);
        setPlanChangeOpen(true);
        qc.setQueryData(["employees"], freshEmployees);
        qc.setQueryData(["subscriptionPlans"], freshPlans);
      } else {
        // Downgrade: toggle first, then show dialog
        try {
          const res = await actor.setEmployeeActive(employee.id, newActive);
          if (res.__kind__ === "err") throw new Error(res.err);
          setActiveOverride(res.ok.active);
          onUpdated(res.ok);
          void qc.invalidateQueries({ queryKey: ["employees"] });
          // Now show the downgrade suggestion dialog
          setPendingToggleActive(newActive);
          setPlanChangeInfo(planChangeNeeded);
          setPlanChangeOpen(true);
          qc.setQueryData(["subscriptionPlans"], freshPlans);
        } catch (err) {
          setActiveOverride(null);
          toast.error(
            `Status konnte nicht geändert werden: ${err instanceof Error ? err.message : String(err)}`,
          );
        }
      }
    } else {
      // No plan change needed — toggle directly
      toggleActiveMutation.mutate(newActive);
    }
  }

  function pf(field: keyof PersonalForm) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setPersonalForm({ ...personalForm, [field]: e.target.value });
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="gap-2 text-muted-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Zurueck
        </Button>
        <div className="flex items-center gap-2 min-w-0">
          <h2 className="text-lg font-semibold truncate">
            {employee.firstName} {employee.lastName}
          </h2>
          <Badge variant={displayActive ? "default" : "secondary"}>
            {displayActive ? "Aktiv" : "Inaktiv"}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="personal" data-ocid="tab-personal">
            Persoenliche Daten
          </TabsTrigger>
          <TabsTrigger value="anstellung" data-ocid="tab-anstellung">
            Anstellung / Beschaeftigung
          </TabsTrigger>
          <TabsTrigger value="ferien" data-ocid="tab-ferien">
            Ferienguthaben
          </TabsTrigger>
          <TabsTrigger value="zeitsaldo" data-ocid="tab-zeitsaldo">
            Zeitsaldokorrektur
          </TabsTrigger>
          <TabsTrigger value="status" data-ocid="tab-status">
            Status
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Persoenliche Daten */}
        <TabsContent value="personal" className="mt-4 space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="pd-firstName">Vorname *</Label>
              <Input
                id="pd-firstName"
                value={personalForm.firstName}
                onChange={pf("firstName")}
                disabled={!canWrite}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="pd-lastName">Nachname *</Label>
              <Input
                id="pd-lastName"
                value={personalForm.lastName}
                onChange={pf("lastName")}
                disabled={!canWrite}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="pd-email">E-Mail *</Label>
              <Input
                id="pd-email"
                type="email"
                value={personalForm.email}
                onChange={pf("email")}
                disabled={!canWrite}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="pd-geburtsdatum">Geburtsdatum</Label>
              <Input
                id="pd-geburtsdatum"
                type="date"
                value={personalForm.geburtsdatum}
                onChange={pf("geburtsdatum")}
                disabled={!canWrite}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="pd-startDate">Eintrittsdatum</Label>
              <Input
                id="pd-startDate"
                type="date"
                value={personalForm.startDate}
                onChange={pf("startDate")}
                disabled={!canWrite}
                data-ocid="mitarbeiter-startdate-input"
              />
            </div>
            <div className="space-y-1">
              <Label>Rolle</Label>
              <Select
                value={personalForm.role as string}
                onValueChange={(v) =>
                  setPersonalForm({ ...personalForm, role: v as Role })
                }
                disabled={!canWrite}
              >
                <SelectTrigger>
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
              <Label htmlFor="pd-supervisor">Vorgesetzter</Label>
              <select
                id="pd-supervisor"
                value={selectedSupervisorId}
                onChange={(e) => {
                  setSelectedSupervisorId(e.target.value);
                  if (employee?.id) {
                    if (e.target.value) {
                      localStorage.setItem(
                        `supervisor_${String(employee.id)}`,
                        e.target.value,
                      );
                    } else {
                      localStorage.removeItem(
                        `supervisor_${String(employee.id)}`,
                      );
                    }
                  }
                }}
                disabled={!canWrite}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#006066] disabled:opacity-50 disabled:cursor-not-allowed"
                data-ocid="mitarbeiter-supervisor-select"
              >
                <option value="">Kein Vorgesetzter</option>
                {supervisorOptions.map((s) => (
                  <option key={String(s.id)} value={String(s.id)}>
                    {s.firstName} {s.lastName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <p className="text-sm font-medium text-muted-foreground mb-3">
              Adresse
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="pd-zusatz1">Adresse Zusatz 1</Label>
                <Input
                  id="pd-zusatz1"
                  value={personalForm.adresseZusatz1}
                  onChange={pf("adresseZusatz1")}
                  disabled={!canWrite}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="pd-zusatz2">Adresse Zusatz 2</Label>
                <Input
                  id="pd-zusatz2"
                  value={personalForm.adresseZusatz2}
                  onChange={pf("adresseZusatz2")}
                  disabled={!canWrite}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="pd-strasse">Strasse</Label>
                <Input
                  id="pd-strasse"
                  value={personalForm.strasse}
                  onChange={pf("strasse")}
                  disabled={!canWrite}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="pd-postfach">Postfach</Label>
                <Input
                  id="pd-postfach"
                  value={personalForm.postfach}
                  onChange={pf("postfach")}
                  disabled={!canWrite}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="pd-plz">PLZ</Label>
                <Input
                  id="pd-plz"
                  value={personalForm.plz}
                  onChange={pf("plz")}
                  disabled={!canWrite}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="pd-ort">Ort</Label>
                <Input
                  id="pd-ort"
                  value={personalForm.ort}
                  onChange={pf("ort")}
                  disabled={!canWrite}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="pd-land">Land</Label>
                <Input
                  id="pd-land"
                  value={personalForm.land}
                  onChange={pf("land")}
                  disabled={!canWrite}
                />
              </div>
            </div>
          </div>

          {canWrite && (
            <div className="flex justify-end pt-2">
              <Button
                onClick={() => updatePersonalMutation.mutate()}
                disabled={updatePersonalMutation.isPending}
                className="gap-2"
                data-ocid="mitarbeiter-personal-save"
              >
                <Save className="w-4 h-4" />
                {updatePersonalMutation.isPending
                  ? "Speichern..."
                  : "Speichern"}
              </Button>
            </div>
          )}

          {/* Compliance-Profil collapsible section */}
          <div className="border border-border rounded-lg">
            <button
              type="button"
              className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-foreground hover:bg-muted/40 transition-colors rounded-lg"
              onClick={() => setComplianceOpen((v) => !v)}
              data-ocid="compliance-profile-toggle"
            >
              <span>Compliance-Profil</span>
              {complianceOpen ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </button>

            {complianceOpen && (
              <div className="px-4 pb-4 pt-1 space-y-4 border-t border-border">
                {complianceLoading ? (
                  <p className="text-sm text-muted-foreground py-2">
                    Wird geladen...
                  </p>
                ) : (
                  <>
                    {!complianceProfile && (
                      <p className="text-xs text-muted-foreground bg-muted/30 rounded px-3 py-2">
                        Kein Compliance-Profil vorhanden. Mit «Speichern» wird
                        ein neues Profil angelegt.
                      </p>
                    )}

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {/* Aktiv toggle */}
                      <div className="flex items-center justify-between gap-3 col-span-full sm:col-span-1">
                        <Label htmlFor="cp-aktiv" className="text-sm">
                          Compliance-Prüfung aktiv
                        </Label>
                        <Switch
                          id="cp-aktiv"
                          checked={complianceForm.aktiv}
                          onCheckedChange={(v) =>
                            setComplianceForm({ ...complianceForm, aktiv: v })
                          }
                          disabled={!canWrite}
                          data-ocid="compliance-aktiv-toggle"
                        />
                      </div>

                      {/* Vertragliche Wochenstunden */}
                      <div className="space-y-1">
                        <Label htmlFor="cp-wochenstunden">
                          Vertragliche Wochenstunden
                        </Label>
                        <Input
                          id="cp-wochenstunden"
                          type="number"
                          step="0.5"
                          min="0"
                          max="50"
                          value={complianceForm.vertraglicheWochenstunden}
                          onChange={(e) =>
                            setComplianceForm({
                              ...complianceForm,
                              vertraglicheWochenstunden:
                                Number.parseFloat(e.target.value) || 0,
                            })
                          }
                          disabled={!canWrite}
                          data-ocid="compliance-wochenstunden-input"
                        />
                      </div>

                      {/* Gesetzliche Wochenhöchstarbeitszeit */}
                      <div className="space-y-1">
                        <Label>Gesetzliche Wochenhöchstarbeitszeit</Label>
                        <Select
                          value={String(
                            complianceForm.gesetzlicheWochenhochstarbeitszeit,
                          )}
                          onValueChange={(v) =>
                            setComplianceForm({
                              ...complianceForm,
                              gesetzlicheWochenhochstarbeitszeit:
                                Number.parseFloat(v),
                            })
                          }
                          disabled={!canWrite}
                        >
                          <SelectTrigger data-ocid="compliance-maxstunden-select">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="45">45 Stunden</SelectItem>
                            <SelectItem value="50">50 Stunden</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Gesetzlicher Ferienanspruch */}
                      <div className="space-y-1">
                        <Label htmlFor="cp-ferien">
                          Gesetzlicher Ferienanspruch (Wochen)
                        </Label>
                        <Input
                          id="cp-ferien"
                          type="number"
                          step="0.5"
                          min="4"
                          max="8"
                          value={
                            complianceForm.gesetzlicherFerienanspruchWochen
                          }
                          onChange={(e) =>
                            setComplianceForm({
                              ...complianceForm,
                              gesetzlicherFerienanspruchWochen:
                                Number.parseFloat(e.target.value) || 4,
                            })
                          }
                          disabled={!canWrite}
                          data-ocid="compliance-ferienanspruch-input"
                        />
                      </div>

                      {/* Vertragliche Zusatzferien */}
                      <div className="space-y-1">
                        <Label htmlFor="cp-zusatzferien">
                          Vertragliche Zusatzferien (Tage)
                        </Label>
                        <Input
                          id="cp-zusatzferien"
                          type="number"
                          step="1"
                          min="0"
                          value={complianceForm.vertraglicheZusatzferienTage}
                          onChange={(e) =>
                            setComplianceForm({
                              ...complianceForm,
                              vertraglicheZusatzferienTage:
                                Number.parseFloat(e.target.value) || 0,
                            })
                          }
                          disabled={!canWrite}
                          data-ocid="compliance-zusatzferien-input"
                        />
                      </div>

                      {/* Ausnahmeprofil */}
                      <div className="space-y-1">
                        <Label htmlFor="cp-ausnahme">Ausnahmeprofil</Label>
                        <Input
                          id="cp-ausnahme"
                          value={complianceForm.ausnahmeprofil}
                          onChange={(e) =>
                            setComplianceForm({
                              ...complianceForm,
                              ausnahmeprofil: e.target.value,
                            })
                          }
                          disabled={!canWrite}
                          placeholder="z.B. GAV-Bau, Kader"
                          data-ocid="compliance-ausnahme-input"
                        />
                      </div>
                    </div>

                    {canWrite && (
                      <div className="flex justify-end pt-1">
                        <Button
                          type="button"
                          onClick={() => updateComplianceMutation.mutate()}
                          disabled={updateComplianceMutation.isPending}
                          variant="outline"
                          className="gap-2"
                          data-ocid="compliance-save-button"
                        >
                          <Save className="w-4 h-4" />
                          {updateComplianceMutation.isPending
                            ? "Speichern..."
                            : "Speichern"}
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Tab 2: Anstellung */}
        <TabsContent value="anstellung" className="mt-4">
          <EmploymentSection employeeId={employee.id} canWrite={canWrite} />
        </TabsContent>

        {/* Tab 3: Ferien */}
        <TabsContent value="ferien" className="mt-4">
          <VacationBalanceSection
            employeeId={employee.id}
            canWrite={canWrite}
          />
        </TabsContent>

        {/* Tab 4: Zeitsaldo */}
        <TabsContent value="zeitsaldo" className="mt-4">
          <TimeBalanceCorrectionSection
            employeeId={employee.id}
            canWrite={canWrite}
          />
        </TabsContent>

        {/* Tab 5: Status */}
        <TabsContent value="status" className="mt-4">
          <div className="rounded-lg border border-border p-6 space-y-4">
            <h3 className="font-medium">Mitarbeiterstatus</h3>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium">
                  {displayActive ? "Aktiv" : "Inaktiv"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {displayActive
                    ? "Der Mitarbeiter ist aktiv und kann das System nutzen."
                    : "Der Mitarbeiter ist inaktiv und hat keinen Zugang zum System."}
                </p>
              </div>
              {canWrite && (
                <Switch
                  checked={displayActive}
                  onCheckedChange={(checked) => handleStatusToggle(checked)}
                  disabled={
                    toggleActiveMutation.isPending ||
                    planChangeMutation.isPending
                  }
                  data-ocid="mitarbeiter-status-toggle"
                />
              )}
            </div>
            {toggleActiveMutation.isError && (
              <div
                className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2"
                data-ocid="mitarbeiter-status-error"
              >
                {toggleActiveMutation.error?.message ?? "Unbekannter Fehler"}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Plan Change Dialog for status toggle */}
      <PlanChangeDialog
        open={planChangeOpen}
        info={planChangeInfo}
        allPlans={allPlans}
        isLoading={planChangeMutation.isPending}
        onConfirm={(billingModel) => {
          if (pendingToggleActive !== null) {
            planChangeMutation.mutate({
              billingModel,
              newActive: pendingToggleActive,
            });
          }
        }}
        onCancel={() => {
          setPlanChangeOpen(false);
          setPlanChangeInfo(null);
          // If this was an upgrade dialog (we haven't toggled yet), reset
          if (pendingToggleActive === true) {
            setActiveOverride(null);
          }
          setPendingToggleActive(null);
          // Show info but don't revert the deactivation (it already happened)
          if (pendingToggleActive === false) {
            toast.success(
              "Mitarbeiter deaktiviert. Plan wurde nicht geaendert.",
            );
          }
        }}
      />
    </div>
  );
}
