/**
 * PlanChangeDialog — reusable plan-change confirmation dialog
 *
 * Used by MitarbeiterTab (create/deactivate) and MitarbeiterDetail (toggle).
 */

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CreditCard,
  ExternalLink,
  TrendingDown,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { BillingModel, SubscriptionPlan } from "../backend.d";
import type { PlanChangeInfo } from "../lib/planUtils";

interface PlanChangeDialogProps {
  open: boolean;
  info: PlanChangeInfo | null;
  allPlans: SubscriptionPlan[];
  isLoading: boolean;
  /** Label shown on the confirm button */
  confirmLabel?: string;
  /** Called when user confirms — if plan requires Stripe payment, passes the checkout URL */
  onConfirm: (billingModel: BillingModel) => void;
  onCancel: () => void;
  /** When true, show Stripe redirect notice for paid plans */
  stripeCheckoutUrl?: string;
  /** Inline error message from a failed Stripe checkout attempt */
  checkoutError?: string | null;
}

export function PlanChangeDialog({
  open,
  info,
  allPlans,
  isLoading,
  confirmLabel,
  onConfirm,
  onCancel,
  stripeCheckoutUrl,
  checkoutError,
}: PlanChangeDialogProps) {
  const [billingModel, setBillingModel] = useState<BillingModel>(
    "monthly" as BillingModel,
  );

  useEffect(() => {
    if (open) setBillingModel("monthly" as BillingModel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]); // intentionally omit setBillingModel

  if (!open || !info) return null;

  const newPlan = allPlans.find((p) => p.id === info.suggestedPlanId);
  const userCount = Number(info.activeUserCount);
  const isUpgrade = info.isUpgrade;
  // pricePerYearCHF = monthly rate for yearly subscriptions. Annual total = × 12.
  const pricePerMonth =
    billingModel === "yearly"
      ? (newPlan?.pricePerYearCHF ?? 0)
      : (newPlan?.pricePerMonthCHF ?? 0);
  const totalCost =
    billingModel === "yearly"
      ? userCount * pricePerMonth * 12
      : userCount * pricePerMonth;

  const requiresStripePayment =
    isUpgrade &&
    newPlan?.requiresPayment === true &&
    !!(newPlan?.stripePriceId || newPlan?.stripePriceIdYearly);

  const titleText = isUpgrade
    ? "Abo-Wechsel erforderlich"
    : "Abo-Anpassung möglich";
  const Icon = isUpgrade ? CreditCard : TrendingDown;
  const iconColor = isUpgrade ? "text-amber-600" : "text-blue-600";

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) onCancel();
      }}
    >
      <DialogContent data-ocid="plan-change-dialog" className="max-w-md">
        <DialogHeader>
          <DialogTitle className={`flex items-center gap-2 ${iconColor}`}>
            <Icon className="w-4 h-4" />
            {titleText}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {!isUpgrade && (
            <div className="flex items-start gap-2 rounded-md bg-blue-50 border border-blue-200 px-3 py-2.5">
              <AlertTriangle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-800">
                Mit <strong>{userCount} aktiven Mitarbeitenden</strong> wäre ein
                günstigerer Plan verfügbar.
              </p>
            </div>
          )}

          {requiresStripePayment && (
            <div className="flex items-start gap-2 rounded-md bg-blue-50 border border-blue-200 px-3 py-2.5">
              <ExternalLink className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-800">
                Dieser Plan erfordert eine Zahlung über Stripe. Nach der
                Bestätigung wirst du zu Stripe Checkout weitergeleitet.
              </p>
            </div>
          )}

          {checkoutError && (
            <div className="flex items-start gap-2 rounded-md bg-red-50 border border-red-200 px-3 py-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{checkoutError}</p>
            </div>
          )}

          {stripeCheckoutUrl && (
            <div className="flex items-start gap-2 rounded-md bg-green-50 border border-green-200 px-3 py-2.5">
              <ExternalLink className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-800">
                Checkout bereit.{" "}
                <button
                  type="button"
                  className="underline font-medium hover:no-underline"
                  onClick={() => {
                    window.location.href = stripeCheckoutUrl;
                  }}
                >
                  Jetzt zu Stripe wechseln
                </button>
              </p>
            </div>
          )}

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-foreground">
                {info.currentPlanName}
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">
                {info.suggestedPlanName}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {isUpgrade
                ? `Dein aktueller Plan wird überschritten. Anzahl aktive Mitarbeitende nach Änderung: ${userCount}`
                : `Anzahl aktive Mitarbeitende nach Änderung: ${userCount}`}
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Abrechnungsmodell</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="plan-dialog-billingModel"
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
                  name="plan-dialog-billingModel"
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
            <div className="rounded-md bg-muted/50 border border-border px-3 py-2.5 space-y-2">
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
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            data-ocid="plan-change-dialog.cancel_button"
          >
            {isUpgrade ? "Abbrechen" : "Plan beibehalten"}
          </Button>
          <Button
            type="button"
            onClick={() => onConfirm(billingModel)}
            disabled={isLoading}
            data-ocid="plan-change-dialog.confirm_button"
            className="gap-1.5"
          >
            {isLoading && requiresStripePayment
              ? "Weiterleitung zu Stripe…"
              : isLoading
                ? "Wird übernommen…"
                : requiresStripePayment
                  ? "Bestätigen & zu Stripe"
                  : (confirmLabel ??
                    (isUpgrade ? "Bestätigen & Speichern" : "Plan wechseln"))}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
