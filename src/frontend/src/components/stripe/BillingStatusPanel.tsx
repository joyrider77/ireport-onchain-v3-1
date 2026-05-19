import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { createActor } from "../../backend";
import type {
  BillingModel,
  CompanySubscription,
  SubscriptionPlan,
} from "../../backend.d";
import { PaymentStatusBadge } from "./PaymentStatusBadge";
import { StripeCheckoutButton } from "./StripeCheckoutButton";
import { StripeCustomerPortalButton } from "./StripeCustomerPortalButton";
import { StripeSyncStatus } from "./StripeSyncStatus";

type AnyActor = Record<string, (...args: unknown[]) => Promise<unknown>>;
const toAny = (a: unknown): AnyActor => a as AnyActor;

function formatDateShort(ns: bigint): string {
  const ms = Number(ns / 1_000_000n);
  const d = new Date(ms);
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
}

interface BillingStatusPanelProps {
  companyId: bigint;
  isAdmin: boolean;
}

export function BillingStatusPanel({
  companyId,
  isAdmin,
}: BillingStatusPanelProps) {
  const { actor, isFetching } = useActor(createActor);
  const queryClient = useQueryClient();

  const { data: sub, isLoading: subLoading } =
    useQuery<CompanySubscription | null>({
      queryKey: ["companySubscriptionDetail", companyId.toString()],
      queryFn: async () => {
        if (!actor) return null;
        try {
          const result = await toAny(actor).syncStripeSubscription(companyId);
          const r = result as { __kind__: string; ok?: CompanySubscription };
          if (r.__kind__ === "ok" && r.ok) return r.ok;
        } catch {
          /* ignore */
        }
        // Fallback: try getCompanyBillingModel
        try {
          const billingResult = await actor.getCompanyBillingModel(companyId);
          if (billingResult.__kind__ === "ok") {
            return {
              companyId,
              planId: "",
              billingModel: billingResult.ok.billingModel as BillingModel,
              stripeCancelAtPeriodEnd: false,
              nextDueDate: billingResult.ok.nextDueDate,
              subscriptionStartDate: billingResult.ok.subscriptionStartDate,
            } satisfies CompanySubscription;
          }
        } catch {
          /* ignore */
        }
        return null;
      },
      enabled: !!actor && !isFetching,
      staleTime: 30_000,
    });

  const { data: plan, isLoading: planLoading } =
    useQuery<SubscriptionPlan | null>({
      queryKey: ["companyPlan", companyId.toString()],
      queryFn: async () => {
        if (!actor) return null;
        return actor.getCompanySubscriptionPlan(companyId);
      },
      enabled: !!actor && !isFetching,
      staleTime: 30_000,
    });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Kein Aktor verfügbar");
      const result = await actor.cancelStripeSubscription(companyId);
      if (result.__kind__ === "err") throw new Error(result.err ?? "Fehler");
      return result.ok;
    },
    onSuccess: () => {
      toast.success(
        "Kündigung vorgemerkt. Das Abo bleibt bis Periodenende aktiv.",
      );
      queryClient.invalidateQueries({
        queryKey: ["companySubscriptionDetail"],
      });
    },
    onError: (err: Error) => toast.error(`Fehler: ${err.message}`),
  });

  const reactivateMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Kein Aktor verfügbar");
      const result = await actor.reactivateStripeSubscription(companyId);
      if (result.__kind__ === "err") throw new Error(result.err ?? "Fehler");
      return result.ok;
    },
    onSuccess: () => {
      toast.success("Kündigung zurückgezogen. Das Abo wird weitergeführt.");
      queryClient.invalidateQueries({
        queryKey: ["companySubscriptionDetail"],
      });
    },
    onError: (err: Error) => toast.error(`Fehler: ${err.message}`),
  });

  const isLoading = subLoading || planLoading;
  const requiresPayment = plan?.requiresPayment ?? false;
  const hasStripeSubscription = !!sub?.stripeSubscriptionId;
  const hasStripeCustomer = !!sub?.stripeCustomerId;
  const isFree = !requiresPayment;

  // Determine payment provider from plan
  const paymentProviderRaw = (plan as unknown as Record<string, unknown>)
    ?.paymentProvider;
  const isStripe =
    paymentProviderRaw === "stripe" ||
    (typeof paymentProviderRaw === "object" &&
      paymentProviderRaw !== null &&
      "stripe" in paymentProviderRaw);
  const isManual =
    paymentProviderRaw === "manual" ||
    (typeof paymentProviderRaw === "object" &&
      paymentProviderRaw !== null &&
      "manual" in paymentProviderRaw);

  if (isLoading) {
    return (
      <div className="space-y-3" data-ocid="billing.status_loading_state">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-4 w-40" />
      </div>
    );
  }

  return (
    <div className="space-y-4" data-ocid="billing.status_panel">
      {/* Plan + payment status */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-primary flex-shrink-0" />
          <span className="text-sm font-semibold text-foreground">
            {plan?.name ?? "Kein Plan"}
          </span>
        </div>
        {isFree ? (
          <Badge
            variant="outline"
            className="text-xs bg-green-50 text-green-700 border-green-200"
          >
            Kostenlos
          </Badge>
        ) : (
          <PaymentStatusBadge status={sub?.stripeStatus} />
        )}
        {sub?.billingModel && (
          <Badge variant="outline" className="text-xs text-muted-foreground">
            {sub.billingModel === "yearly" ? "Jährlich" : "Monatlich"}
          </Badge>
        )}
      </div>

      {/* Free plan note */}
      {isFree && (
        <div className="flex items-start gap-2 rounded-md bg-muted/40 border border-border px-3 py-2.5">
          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">
            Dieser Plan ist kostenlos und benötigt keine Zahlungsdaten.
          </p>
        </div>
      )}

      {/* Billing period / next renewal */}
      {sub &&
        (sub.stripeCurrentPeriodStart ||
          sub.stripeCurrentPeriodEnd ||
          sub.nextDueDate) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {sub.stripeCurrentPeriodStart &&
              sub.stripeCurrentPeriodStart > 0n && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">Periode:</span>
                  <span className="text-foreground font-medium">
                    {formatDateShort(sub.stripeCurrentPeriodStart)}
                    {sub.stripeCurrentPeriodEnd &&
                    sub.stripeCurrentPeriodEnd > 0n
                      ? ` – ${formatDateShort(sub.stripeCurrentPeriodEnd)}`
                      : ""}
                  </span>
                </div>
              )}
            {(sub.stripeCurrentPeriodEnd ?? sub.nextDueDate) && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground">
                  Nächste Verlängerung:
                </span>
                <span className="text-foreground font-medium">
                  {formatDateShort(
                    (sub.stripeCurrentPeriodEnd ?? sub.nextDueDate)!,
                  )}
                </span>
              </div>
            )}
          </div>
        )}

      {/* Cancellation warning */}
      {sub?.stripeCancelAtPeriodEnd && sub.stripeCurrentPeriodEnd && (
        <div className="flex items-start gap-2 rounded-md bg-orange-50 border border-orange-200 px-3 py-2.5">
          <AlertTriangle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-orange-800">
            Kündigung zum{" "}
            <strong>{formatDateShort(sub.stripeCurrentPeriodEnd)}</strong>{" "}
            vorgemerkt.
          </p>
        </div>
      )}

      {/* Payment provider-specific content */}
      {isStripe ? (
        <>
          {/* Paid plan without Stripe subscription */}
          {requiresPayment && !hasStripeSubscription && isAdmin && (
            <div className="flex items-start gap-2 rounded-md bg-yellow-50 border border-yellow-200 px-3 py-2.5">
              <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-800">
                Für diesen Plan ist eine Zahlung erforderlich. Richte bitte das
                Abonnement über Stripe ein.
              </p>
            </div>
          )}

          {/* past_due warning */}
          {sub?.stripeStatus === "past_due" && (
            <div className="flex items-start gap-2 rounded-md bg-red-50 border border-red-200 px-3 py-2.5">
              <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">
                Die letzte Zahlung ist fehlgeschlagen. Bitte aktualisiere deine
                Zahlungsdaten.
              </p>
            </div>
          )}

          {isAdmin && (
            <>
              <Separator />
              <div className="flex flex-wrap gap-2">
                {requiresPayment && !hasStripeSubscription && plan && (
                  <StripeCheckoutButton
                    companyId={companyId}
                    planId={plan.id}
                    billingModel={
                      (sub?.billingModel ?? "monthly") as BillingModel
                    }
                    label="Abo über Stripe abschliessen"
                    showInlineError={true}
                  />
                )}
                {hasStripeCustomer && (
                  <StripeCustomerPortalButton companyId={companyId} />
                )}
                {hasStripeSubscription && !sub?.stripeCancelAtPeriodEnd && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/5"
                    disabled={cancelMutation.isPending}
                    onClick={() => cancelMutation.mutate()}
                    data-ocid="billing.cancel_subscription_button"
                  >
                    {cancelMutation.isPending
                      ? "Wird gekündigt…"
                      : "Abo kündigen"}
                  </Button>
                )}
                {sub?.stripeCancelAtPeriodEnd && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    disabled={reactivateMutation.isPending}
                    onClick={() => reactivateMutation.mutate()}
                    data-ocid="billing.reactivate_subscription_button"
                  >
                    {reactivateMutation.isPending
                      ? "Wird reaktiviert…"
                      : "Kündigung zurückziehen"}
                  </Button>
                )}
                {hasStripeSubscription && (
                  <StripeSyncStatus
                    companyId={companyId}
                    lastSyncAt={sub?.lastStripeSyncAt}
                    queryKeysToInvalidate={[
                      ["companySubscriptionDetail", companyId.toString()],
                    ]}
                  />
                )}
              </div>
            </>
          )}
        </>
      ) : isManual ? (
        <div className="flex items-start gap-2 rounded-md bg-blue-50 border border-blue-200 px-3 py-2.5">
          <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800">
            Die Abrechnung wird manuell durch den Administrator verwaltet.
          </p>
        </div>
      ) : (
        <div className="flex items-start gap-2 rounded-md bg-green-50 border border-green-200 px-3 py-2.5">
          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-800">
            Dieser Plan ist kostenlos. Es ist keine Zahlung erforderlich.
          </p>
        </div>
      )}
    </div>
  );
}
