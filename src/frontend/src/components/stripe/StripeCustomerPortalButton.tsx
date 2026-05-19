import { Button } from "@/components/ui/button";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation } from "@tanstack/react-query";
import { ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createActor } from "../../backend";

interface StripeCustomerPortalButtonProps {
  companyId: bigint;
  className?: string;
}

export function StripeCustomerPortalButton({
  companyId,
  className,
}: StripeCustomerPortalButtonProps) {
  const { actor } = useActor(createActor);

  const portalMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Kein Aktor verfügbar");
      const result = await actor.createStripeCustomerPortalSession(companyId);
      if (result.__kind__ === "err") throw new Error(result.err ?? "Fehler");
      return result.ok.url;
    },
    onSuccess: (url) => {
      window.open(url, "_blank", "noopener,noreferrer");
    },
    onError: (err: Error) => {
      toast.error(`Fehler beim Öffnen des Portals: ${err.message}`);
    },
  });

  return (
    <Button
      type="button"
      variant="outline"
      className={`gap-2 ${className ?? ""}`}
      disabled={portalMutation.isPending}
      onClick={() => portalMutation.mutate()}
      data-ocid="billing.stripe_portal_button"
    >
      {portalMutation.isPending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <ExternalLink className="w-4 h-4" />
      )}
      {portalMutation.isPending ? "Wird geöffnet…" : "Zahlungsdaten verwalten"}
    </Button>
  );
}
