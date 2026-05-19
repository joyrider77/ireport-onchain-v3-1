import { Button } from "@/components/ui/button";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation } from "@tanstack/react-query";
import { AlertCircle, CreditCard, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { createActor } from "../../backend";
import type { BillingModel } from "../../backend.d";

interface StripeCheckoutButtonProps {
  companyId: bigint;
  planId: string;
  billingModel: BillingModel;
  label?: string;
  variant?: "default" | "outline" | "secondary";
  size?: "default" | "sm" | "lg";
  className?: string;
  disabled?: boolean;
  /** Called with the Stripe checkout URL on success (instead of auto-redirect). */
  onSuccess?: (url: string) => void;
  /** If true, errors are shown inline below the button instead of only as toast. */
  showInlineError?: boolean;
}

export function StripeCheckoutButton({
  companyId,
  planId,
  billingModel,
  label = "Zahlung einrichten",
  variant = "default",
  size = "default",
  className,
  disabled,
  onSuccess,
  showInlineError = false,
}: StripeCheckoutButtonProps) {
  const { actor } = useActor(createActor);
  const [inlineError, setInlineError] = useState<string | null>(null);
  // Synchronous guard: prevents rapid double-clicks from firing a second mutation
  // before React re-renders with isPending = true.
  const isSubmittingRef = useRef(false);

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Kein Aktor verfügbar");
      const result = await actor.createStripeCheckoutSession(
        companyId,
        planId,
        billingModel,
      );
      if (result.__kind__ === "err") {
        throw new Error(
          result.err || "Checkout-Session konnte nicht erstellt werden",
        );
      }
      const url = result.ok?.url;
      if (!url) throw new Error("Keine Checkout-URL erhalten");
      return { url, sessionId: result.ok.sessionId };
    },
    onSuccess: ({ url }) => {
      setInlineError(null);
      isSubmittingRef.current = false;
      if (onSuccess) {
        onSuccess(url);
      } else {
        // Short delay so React can flush state before navigating away
        setTimeout(() => {
          window.location.href = url;
        }, 50);
      }
    },
    onError: (err: Error) => {
      isSubmittingRef.current = false;
      const msg = err.message || "Unbekannter Fehler beim Stripe-Checkout";
      if (showInlineError) {
        setInlineError(msg);
      }
      toast.error(`Fehler beim Starten des Checkouts: ${msg}`);
    },
  });

  const isDisabled =
    disabled || checkoutMutation.isPending || isSubmittingRef.current;

  return (
    <div className="flex flex-col gap-1.5">
      <Button
        type="button"
        variant={variant}
        size={size}
        className={`gap-2 ${className ?? ""}`}
        disabled={isDisabled}
        onClick={() => {
          if (isSubmittingRef.current || checkoutMutation.isPending) return;
          isSubmittingRef.current = true;
          setInlineError(null);
          checkoutMutation.mutate();
        }}
        data-ocid="billing.stripe_checkout_button"
      >
        {checkoutMutation.isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <CreditCard className="w-4 h-4" />
        )}
        {checkoutMutation.isPending ? "Wird gestartet…" : label}
      </Button>
      {showInlineError && inlineError && (
        <div
          className="flex items-start gap-1.5 text-xs text-destructive"
          data-ocid="billing.stripe_checkout_error_state"
        >
          <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <span>{inlineError}</span>
        </div>
      )}
    </div>
  );
}
