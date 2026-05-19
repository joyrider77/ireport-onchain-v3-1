import { Layout } from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuthStore";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  Bell,
  Calendar,
  Clock,
  CreditCard,
  ExternalLink,
  Info,
  Loader2,
  Save,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { createActor } from "../backend";
import type {
  CompanySettings,
  SubscriptionPlan,
  UserNotificationSettings,
} from "../backend.d";
import { BillingStatusPanel } from "../components/stripe/BillingStatusPanel";
import { StripeInvoiceList } from "../components/stripe/StripeInvoiceList";

// ─── Helper ───────────────────────────────────────────────────────────────────

type AnyActor = Record<string, (...args: unknown[]) => Promise<unknown>>;
const toAny = (a: unknown): AnyActor => a as AnyActor;

function getRoleBadge(role: string | null) {
  if (role === "admin")
    return (
      <Badge
        className="bg-primary/10 text-primary border-primary/30"
        variant="outline"
      >
        Administrator
      </Badge>
    );
  if (role === "manager")
    return (
      <Badge className="bg-accent text-accent-foreground" variant="secondary">
        Manager
      </Badge>
    );
  return <Badge variant="secondary">Mitarbeiter</Badge>;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface NotificationToggleProps {
  id: string;
  label: string;
  description: string;
  checked?: boolean;
  disabled?: boolean;
  upcoming?: boolean;
  onCheckedChange?: (value: boolean) => void;
}

function NotificationToggle({
  id,
  label,
  description,
  checked,
  disabled,
  upcoming,
  onCheckedChange,
}: NotificationToggleProps) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="flex-1 min-w-0 space-y-0.5">
        <div className="flex items-center gap-2 flex-wrap">
          <Label
            htmlFor={id}
            className={`text-sm font-medium cursor-pointer ${disabled ? "text-muted-foreground" : "text-foreground"}`}
          >
            {label}
          </Label>
          {upcoming && (
            <Badge
              variant="outline"
              className="text-[10px] px-1.5 py-0 text-muted-foreground border-muted-foreground/30"
            >
              Demnächst verfügbar
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch
        id={id}
        checked={checked ?? false}
        disabled={disabled}
        onCheckedChange={onCheckedChange}
        data-ocid={`toggle-${id}`}
        aria-label={label}
        className="mt-0.5 shrink-0"
      />
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function EinstellungenPage() {
  const navigate = useNavigate();
  const { isAuthenticated, companyId, role, employeeName, principal } =
    useAuth();
  const { actor, isFetching } = useActor(createActor);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAuthenticated || !companyId) navigate({ to: "/" });
  }, [isAuthenticated, companyId, navigate]);

  const isAdmin = role === "admin";
  const isManagerOrAdmin = role === "admin" || role === "manager";

  // ─── Subscription Plan ────────────────────────────────────────────────────

  const { data: currentPlan } = useQuery<SubscriptionPlan | null>({
    queryKey: ["companyPlan", companyId],
    queryFn: async () => {
      if (!actor || !companyId) return null;
      return actor.getCompanySubscriptionPlan(BigInt(companyId));
    },
    enabled: !!actor && !isFetching && isAuthenticated && isAdmin,
    staleTime: 60_000,
  });

  // ─── Notification Settings ─────────────────────────────────────────────────

  const { data: notifData, isLoading: notifLoading } = useQuery({
    queryKey: ["userNotificationSettings"],
    queryFn: async () => {
      if (!actor) return null;
      try {
        const result = await toAny(actor).getUserNotificationSettings();
        const r = result as { __kind__: string; ok?: UserNotificationSettings };
        return r.__kind__ === "ok" && r.ok ? r.ok : null;
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching && isAuthenticated,
    staleTime: 30_000,
  });

  const [notifForm, setNotifForm] = useState({
    emailNewVacationRequest: false,
    emailOnApproval: false,
  });

  useEffect(() => {
    if (notifData) {
      setNotifForm({
        emailNewVacationRequest: notifData.emailNewVacationRequest,
        emailOnApproval: notifData.emailOnApproval,
      });
    }
  }, [notifData]);

  const saveNotifMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Nicht angemeldet");
      // Always build the full settings object based on the current form values.
      // The backend derives principalId and companyId from the caller's IC identity,
      // so we pass whatever we have and the backend will use the caller context.
      const input: UserNotificationSettings = notifData
        ? {
            ...notifData,
            emailNewVacationRequest: notifForm.emailNewVacationRequest,
            emailOnApproval: notifForm.emailOnApproval,
          }
        : {
            emailNewVacationRequest: notifForm.emailNewVacationRequest,
            emailOnApproval: notifForm.emailOnApproval,
            principalId:
              principal as unknown as UserNotificationSettings["principalId"],
            companyId: BigInt(companyId ?? 0),
          };
      const result = await toAny(actor).updateUserNotificationSettings(input);
      const r = result as { __kind__: string; err?: string };
      if (r.__kind__ === "err")
        throw new Error(r.err ?? "Fehler beim Speichern");
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userNotificationSettings"] });
      toast.success("Benachrichtigungseinstellungen gespeichert");
    },
    onError: (err: Error) => {
      toast.error(`Fehler: ${err.message}`);
    },
  });

  // ─── Company Settings (vacation rules) ────────────────────────────────────

  const { data: companySettingsData, isLoading: companySettingsLoading } =
    useQuery({
      queryKey: ["companySettings", companyId],
      queryFn: async () => {
        if (!actor) return null;
        try {
          const result = await toAny(actor).getCompanySettings();
          const r = result as { __kind__: string; ok?: CompanySettings };
          return r.__kind__ === "ok" && r.ok ? r.ok : null;
        } catch {
          return null;
        }
      },
      enabled: !!actor && !isFetching && isAuthenticated && isManagerOrAdmin,
      staleTime: 30_000,
    });

  const [vacationForm, setVacationForm] = useState({
    maxVacationDays: 25,
    vacationCarryoverDays: 5,
    approvalRequired: true,
  });

  useEffect(() => {
    if (companySettingsData) {
      setVacationForm({
        maxVacationDays: Number(companySettingsData.maxVacationDays),
        vacationCarryoverDays: Number(
          companySettingsData.vacationCarryoverDays,
        ),
        approvalRequired: companySettingsData.approvalRequired,
      });
    }
  }, [companySettingsData]);

  const saveVacationMutation = useMutation({
    mutationFn: async () => {
      if (!actor || !companySettingsData) throw new Error("Nicht verfügbar");
      const input: CompanySettings = {
        ...companySettingsData,
        maxVacationDays: BigInt(vacationForm.maxVacationDays),
        vacationCarryoverDays: BigInt(vacationForm.vacationCarryoverDays),
        approvalRequired: vacationForm.approvalRequired,
      };
      const result = await toAny(actor).updateCompanySettings(input);
      const r = result as { __kind__: string; err?: string };
      if (r.__kind__ === "err")
        throw new Error(r.err ?? "Fehler beim Speichern");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companySettings"] });
      toast.success("Ferieneinstellungen gespeichert");
    },
    onError: (err: Error) => {
      toast.error(`Fehler: ${err.message}`);
    },
  });

  // ─── Default Work Hours ────────────────────────────────────────────────────

  type DefaultWorkHoursForm = {
    stundenMo: string;
    stundenDi: string;
    stundenMi: string;
    stundenDo: string;
    stundenFr: string;
    stundenSa: string;
    stundenSo: string;
  };

  const { data: defaultWorkHoursData, isLoading: defaultWorkHoursLoading } =
    useQuery({
      queryKey: ["defaultWorkHours", companyId],
      queryFn: async () => {
        if (!actor) return null;
        try {
          const result = await toAny(actor).getDefaultWorkHours();
          const r = result as {
            __kind__: string;
            ok?: {
              stundenMo: bigint;
              stundenDi: bigint;
              stundenMi: bigint;
              stundenDo: bigint;
              stundenFr: bigint;
              stundenSa: bigint;
              stundenSo: bigint;
              companyId: bigint;
            };
          };
          return r.__kind__ === "ok" && r.ok ? r.ok : null;
        } catch {
          return null;
        }
      },
      enabled: !!actor && !isFetching && isAuthenticated && isAdmin,
      staleTime: 30_000,
    });

  function minutesToHhMm(mins: number | bigint): string {
    const m = Number(mins);
    const h = Math.floor(m / 60);
    const min = m % 60;
    return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
  }

  function hhmmToMinutes(s: string): number {
    const [h, m] = s.split(":").map(Number);
    return (Number.isNaN(h) ? 0 : h) * 60 + (Number.isNaN(m) ? 0 : m);
  }

  const [defaultWorkHoursForm, setDefaultWorkHoursForm] =
    useState<DefaultWorkHoursForm>({
      stundenMo: "08:00",
      stundenDi: "08:00",
      stundenMi: "08:00",
      stundenDo: "08:00",
      stundenFr: "08:00",
      stundenSa: "00:00",
      stundenSo: "00:00",
    });

  // biome-ignore lint/correctness/useExhaustiveDependencies: minutesToHhMm is a stable inline function, not reactive
  useEffect(() => {
    if (defaultWorkHoursData) {
      setDefaultWorkHoursForm({
        stundenMo: minutesToHhMm(defaultWorkHoursData.stundenMo),
        stundenDi: minutesToHhMm(defaultWorkHoursData.stundenDi),
        stundenMi: minutesToHhMm(defaultWorkHoursData.stundenMi),
        stundenDo: minutesToHhMm(defaultWorkHoursData.stundenDo),
        stundenFr: minutesToHhMm(defaultWorkHoursData.stundenFr),
        stundenSa: minutesToHhMm(defaultWorkHoursData.stundenSa),
        stundenSo: minutesToHhMm(defaultWorkHoursData.stundenSo),
      });
    }
  }, [defaultWorkHoursData]);

  const saveDefaultWorkHoursMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Nicht verfügbar");
      // companyId is required by the Candid record — omitting it causes a
      // synchronous encoding error that closes the async message channel.
      // Prefer the value already returned by getDefaultWorkHours; fall back
      // to the companyId from the auth context.
      const resolvedCompanyId: bigint =
        defaultWorkHoursData?.companyId != null
          ? BigInt(defaultWorkHoursData.companyId)
          : BigInt(companyId ?? 0);
      const input = {
        companyId: resolvedCompanyId,
        stundenMo: BigInt(hhmmToMinutes(defaultWorkHoursForm.stundenMo)),
        stundenDi: BigInt(hhmmToMinutes(defaultWorkHoursForm.stundenDi)),
        stundenMi: BigInt(hhmmToMinutes(defaultWorkHoursForm.stundenMi)),
        stundenDo: BigInt(hhmmToMinutes(defaultWorkHoursForm.stundenDo)),
        stundenFr: BigInt(hhmmToMinutes(defaultWorkHoursForm.stundenFr)),
        stundenSa: BigInt(hhmmToMinutes(defaultWorkHoursForm.stundenSa)),
        stundenSo: BigInt(hhmmToMinutes(defaultWorkHoursForm.stundenSo)),
      };
      const result = await toAny(actor).updateDefaultWorkHours(input);
      const r = result as { __kind__: string; err?: string };
      if (r.__kind__ === "err")
        throw new Error(r.err ?? "Fehler beim Speichern");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["defaultWorkHours"] });
      toast.success("Standardarbeitsstunden gespeichert");
    },
    onError: (err: Error) => {
      toast.error(`Fehler: ${err.message}`);
    },
  });

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <Layout>
      <div className="p-6 space-y-6 max-w-3xl">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Einstellungen
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Konto- und Unternehmenseinstellungen verwalten
          </p>
        </div>

        <Tabs defaultValue="benachrichtigungen">
          <TabsList className="mb-6 flex-wrap h-auto gap-1">
            <TabsTrigger
              value="benachrichtigungen"
              data-ocid="tab-benachrichtigungen"
              className="gap-1.5"
            >
              <Bell className="w-3.5 h-3.5" />
              Benachrichtigungen
            </TabsTrigger>
            {isManagerOrAdmin && (
              <TabsTrigger
                value="ferien"
                data-ocid="tab-ferien"
                className="gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5" />
                Ferien &amp; Abwesenheiten
              </TabsTrigger>
            )}
            {isAdmin && (
              <TabsTrigger
                value="standardarbeitsstunden"
                data-ocid="tab-standardarbeitsstunden"
                className="gap-1.5"
              >
                <Clock className="w-3.5 h-3.5" />
                Standardarbeitsstunden
              </TabsTrigger>
            )}
            {isAdmin && (
              <TabsTrigger value="abo" data-ocid="tab-abo" className="gap-1.5">
                <CreditCard className="w-3.5 h-3.5" />
                Abo &amp; Abrechnung
              </TabsTrigger>
            )}
            <TabsTrigger
              value="profil"
              data-ocid="tab-profil"
              className="gap-1.5"
            >
              <User className="w-3.5 h-3.5" />
              Benutzerprofil
            </TabsTrigger>
          </TabsList>

          {/* ── Tab: Benachrichtigungen ── */}
          <TabsContent value="benachrichtigungen" className="space-y-4">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-base">
                  E-Mail Benachrichtigungen
                </CardTitle>
                <CardDescription>
                  Legen Sie fest, bei welchen Ereignissen Sie eine E-Mail
                  erhalten möchten.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-1">
                {notifLoading ? (
                  <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Einstellungen werden geladen…
                  </div>
                ) : (
                  <>
                    <NotificationToggle
                      id="emailNewVacationRequest"
                      label="E-Mail bei neuem Ferienantrag"
                      description="Du erhältst eine E-Mail, wenn ein neuer Ferienantrag eingereicht wird."
                      checked={notifForm.emailNewVacationRequest}
                      onCheckedChange={(v) =>
                        setNotifForm((p) => ({
                          ...p,
                          emailNewVacationRequest: v,
                        }))
                      }
                    />
                    <Separator />
                    <NotificationToggle
                      id="emailOnApproval"
                      label="E-Mail bei Genehmigung/Ablehnung"
                      description="Du erhältst eine E-Mail, wenn dein Ferienantrag genehmigt oder abgelehnt wird."
                      checked={notifForm.emailOnApproval}
                      onCheckedChange={(v) =>
                        setNotifForm((p) => ({ ...p, emailOnApproval: v }))
                      }
                    />
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-card border-dashed border-muted-foreground/20 bg-muted/20">
              <CardHeader>
                <CardTitle className="text-base text-muted-foreground">
                  Geplante Funktionen
                </CardTitle>
                <CardDescription>
                  Diese Benachrichtigungsoptionen werden in einer zukünftigen
                  Version verfügbar.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-1">
                <NotificationToggle
                  id="weeklySummary"
                  label="Wochenzusammenfassung per E-Mail"
                  description="Wöchentliche Zusammenfassung Ihrer Stunden, Spesen und Abwesenheiten."
                  disabled
                  upcoming
                />
                <Separator />
                <NotificationToggle
                  id="pushNotifications"
                  label="Push-Benachrichtigungen"
                  description="Browser-Benachrichtigungen für wichtige Ereignisse."
                  disabled
                  upcoming
                />
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button
                type="button"
                onClick={() => saveNotifMutation.mutate()}
                disabled={saveNotifMutation.isPending || notifLoading}
                data-ocid="save-notifications"
                className="gap-2"
              >
                {saveNotifMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Benachrichtigungseinstellungen speichern
              </Button>
            </div>
          </TabsContent>

          {/* ── Tab: Ferien & Abwesenheiten ── */}
          {isManagerOrAdmin && (
            <TabsContent value="ferien" className="space-y-4">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-base">
                    Ferieneinstellungen
                  </CardTitle>
                  <CardDescription>
                    Legen Sie die Ferienregeln für Ihre Firma fest.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  {!isAdmin && (
                    <div className="flex items-start gap-2 p-3 rounded-md bg-muted/50 text-sm text-muted-foreground">
                      <Info className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>Nur Admins können diese Einstellungen ändern.</span>
                    </div>
                  )}

                  {companySettingsLoading ? (
                    <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Einstellungen werden geladen…
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="maxVacationDays">
                          Maximale Ferientage pro Jahr
                        </Label>
                        <Input
                          id="maxVacationDays"
                          type="number"
                          min={0}
                          max={365}
                          value={vacationForm.maxVacationDays}
                          onChange={(e) =>
                            setVacationForm((p) => ({
                              ...p,
                              maxVacationDays: Number(e.target.value),
                            }))
                          }
                          disabled={!isAdmin}
                          data-ocid="input-max-vacation-days"
                        />
                        <p className="text-xs text-muted-foreground">
                          Gesetzliches Minimum in der Schweiz: 20 Tage
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="vacationCarryoverDays">
                          Ferienübertrag (Tage)
                        </Label>
                        <Input
                          id="vacationCarryoverDays"
                          type="number"
                          min={0}
                          max={365}
                          value={vacationForm.vacationCarryoverDays}
                          onChange={(e) =>
                            setVacationForm((p) => ({
                              ...p,
                              vacationCarryoverDays: Number(e.target.value),
                            }))
                          }
                          disabled={!isAdmin}
                          data-ocid="input-carryover-days"
                        />
                        <p className="text-xs text-muted-foreground">
                          Maximale Anzahl übertragbarer Ferientage ins Folgejahr
                        </p>
                      </div>

                      <div className="sm:col-span-2 flex items-center justify-between rounded-md border border-input bg-card p-4">
                        <div className="space-y-0.5">
                          <Label
                            htmlFor="approvalRequired"
                            className={`text-sm font-medium ${!isAdmin ? "text-muted-foreground" : "text-foreground"}`}
                          >
                            Genehmigung erforderlich
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Ferienanträge müssen von einem Admin oder Manager
                            genehmigt werden.
                          </p>
                        </div>
                        <Switch
                          id="approvalRequired"
                          checked={vacationForm.approvalRequired}
                          disabled={!isAdmin}
                          onCheckedChange={(v) =>
                            setVacationForm((p) => ({
                              ...p,
                              approvalRequired: v,
                            }))
                          }
                          data-ocid="toggle-approval-required"
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {isAdmin && (
                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={() => saveVacationMutation.mutate()}
                    disabled={
                      saveVacationMutation.isPending || companySettingsLoading
                    }
                    data-ocid="save-vacation-settings"
                    className="gap-2"
                  >
                    {saveVacationMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Ferieneinstellungen speichern
                  </Button>
                </div>
              )}
            </TabsContent>
          )}

          {/* ── Tab: Standardarbeitsstunden ── */}
          {isAdmin && (
            <TabsContent value="standardarbeitsstunden" className="space-y-4">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-base">
                    Standardarbeitsstunden pro Wochentag
                  </CardTitle>
                  <CardDescription>
                    Diese Werte werden beim Erfassen einer neuen Beschäftigung
                    automatisch vorausgefüllt.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  {defaultWorkHoursLoading ? (
                    <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Einstellungen werden geladen…
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {(
                        [
                          { key: "stundenMo" as const, label: "Montag" },
                          { key: "stundenDi" as const, label: "Dienstag" },
                          { key: "stundenMi" as const, label: "Mittwoch" },
                          { key: "stundenDo" as const, label: "Donnerstag" },
                          { key: "stundenFr" as const, label: "Freitag" },
                          { key: "stundenSa" as const, label: "Samstag" },
                          { key: "stundenSo" as const, label: "Sonntag" },
                        ] as {
                          key: keyof DefaultWorkHoursForm;
                          label: string;
                        }[]
                      ).map(({ key, label }) => (
                        <div key={key} className="space-y-1.5">
                          <Label htmlFor={`dwh-${key}`}>{label}</Label>
                          <Input
                            id={`dwh-${key}`}
                            placeholder="hh:mm"
                            value={defaultWorkHoursForm[key]}
                            onChange={(e) =>
                              setDefaultWorkHoursForm((p) => ({
                                ...p,
                                [key]: e.target.value,
                              }))
                            }
                            data-ocid={`input-dwh-${key}`}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button
                  type="button"
                  onClick={() => saveDefaultWorkHoursMutation.mutate()}
                  disabled={
                    saveDefaultWorkHoursMutation.isPending ||
                    defaultWorkHoursLoading
                  }
                  data-ocid="save-default-work-hours"
                  className="gap-2"
                >
                  {saveDefaultWorkHoursMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Standardarbeitsstunden speichern
                </Button>
              </div>
            </TabsContent>
          )}

          {isAdmin && (
            <TabsContent value="abo" className="space-y-4">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-primary" />
                    Abo-Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <BillingStatusPanel
                    companyId={BigInt(companyId ?? 0)}
                    isAdmin={isAdmin}
                  />
                </CardContent>
              </Card>

              {(() => {
                const pp = currentPlan?.paymentProvider;
                const isStripe =
                  pp != null && typeof pp === "object" && "Stripe" in pp;
                const isManual =
                  pp != null && typeof pp === "object" && "Manuell" in pp;
                const isFree =
                  !currentPlan?.requiresPayment ||
                  (pp != null && typeof pp === "object" && "Keine" in pp) ||
                  !pp;
                if (isStripe && currentPlan?.requiresPayment) {
                  return (
                    <Card className="shadow-card">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-primary" />
                          Stripe-Rechnungen
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <StripeInvoiceList companyId={BigInt(companyId ?? 0)} />
                      </CardContent>
                    </Card>
                  );
                }
                if (isManual) {
                  return (
                    <Card className="shadow-card">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-primary" />
                          Abrechnung
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          Die Abrechnung wird manuell durch den Administrator
                          verwaltet.
                        </p>
                      </CardContent>
                    </Card>
                  );
                }
                if (isFree) {
                  return (
                    <Card className="shadow-card">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-primary" />
                          Abrechnung
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          Dieser Plan ist kostenlos. Es ist keine Zahlung
                          erforderlich.
                        </p>
                      </CardContent>
                    </Card>
                  );
                }
                return null;
              })()}
            </TabsContent>
          )}

          {/* ── Tab: Benutzerprofil ── */}
          <TabsContent value="profil" className="space-y-4">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-base">Benutzerprofil</CardTitle>
                <CardDescription>
                  Ihre Profildaten werden über Internet Identity verwaltet.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-muted-foreground text-xs uppercase tracking-wide">
                      Name
                    </Label>
                    <p className="text-sm font-medium text-foreground">
                      {employeeName ?? "–"}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-muted-foreground text-xs uppercase tracking-wide">
                      Rolle
                    </Label>
                    <div>{getRoleBadge(role)}</div>
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <Label className="text-muted-foreground text-xs uppercase tracking-wide">
                      Principal ID
                    </Label>
                    <p className="text-xs font-mono text-muted-foreground break-all">
                      {principal ?? "–"}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-start gap-3 p-4 rounded-md bg-secondary/50 border border-secondary">
                  <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <p className="text-sm text-secondary-foreground">
                    Ihr Benutzerprofil wird über{" "}
                    <strong>Internet Identity</strong> verwaltet. Um Ihre
                    Identität oder verknüpften Geräte zu ändern, besuchen Sie
                    bitte identity.ic0.app.
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    window.open(
                      "https://identity.ic0.app",
                      "_blank",
                      "noopener,noreferrer",
                    )
                  }
                  data-ocid="btn-open-internet-identity"
                  className="gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Internet Identity öffnen
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
