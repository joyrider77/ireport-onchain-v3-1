import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { createActor } from "../../backend";
import { Layout } from "../../components/Layout";
import { useAuth } from "../../hooks/useAuthStore";

type AnyActor = Record<string, (...args: unknown[]) => Promise<unknown>>;
const toAny = (a: unknown): AnyActor => a as AnyActor;

export default function StripeSuccessPage() {
  const navigate = useNavigate();
  const { companyId } = useAuth();
  const { actor, isFetching } = useActor(createActor);

  const { data: plan, isLoading } = useQuery({
    queryKey: ["companyPlanAfterCheckout", companyId],
    queryFn: async () => {
      if (!actor || !companyId) return null;
      try {
        // Trigger a sync to ensure latest status
        await toAny(actor).syncStripeSubscription(BigInt(companyId));
      } catch {
        /* best-effort */
      }
      return actor.getCompanySubscriptionPlan(BigInt(companyId));
    },
    enabled: !!actor && !isFetching && !!companyId,
    staleTime: 0,
  });

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 max-w-md mx-auto">
        <div className="rounded-full bg-green-100 p-5 mb-6">
          <CheckCircle2 className="w-12 h-12 text-green-600" />
        </div>
        <h1 className="text-2xl font-display font-bold text-foreground text-center mb-2">
          Zahlung erfolgreich
        </h1>
        <p className="text-muted-foreground text-center text-sm mb-6">
          Zahlung wird verarbeitet. Dein Abo wird in Kürze aktiviert.
        </p>

        {isLoading ? (
          <div
            className="space-y-2 w-full"
            data-ocid="stripe-success.loading_state"
          >
            <Skeleton className="h-4 w-48 mx-auto" />
            <Skeleton className="h-4 w-32 mx-auto" />
          </div>
        ) : plan ? (
          <div
            className="rounded-lg border border-border bg-card px-6 py-4 text-center mb-6"
            data-ocid="stripe-success.plan_card"
          >
            <p className="text-xs text-muted-foreground mb-1">Aktiver Plan</p>
            <p className="text-lg font-bold text-primary">{plan.name}</p>
            {plan.description && (
              <p className="text-xs text-muted-foreground mt-1">
                {plan.description}
              </p>
            )}
          </div>
        ) : null}

        <div className="flex gap-3 flex-wrap justify-center">
          <Button
            type="button"
            onClick={() => navigate({ to: "/einstellungen" })}
            data-ocid="stripe-success.settings_button"
          >
            Zu den Einstellungen
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate({ to: "/dashboard" })}
            data-ocid="stripe-success.dashboard_button"
          >
            Zum Dashboard
          </Button>
        </div>
      </div>
    </Layout>
  );
}
