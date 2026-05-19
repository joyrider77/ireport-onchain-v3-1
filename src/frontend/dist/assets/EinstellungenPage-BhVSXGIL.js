import { r as reactExports, j as jsxRuntimeExports, d as useQueryClient, S as Skeleton, a as useNavigate } from "./index-Blf-A8DR.js";
import { q as useMutation, R as RefreshCw, F as Separator, L as Layout, G as Bell } from "./Layout-ClH0znk9.js";
import { B as Badge } from "./badge-BrNtKZcv.js";
import { B as Button } from "./button-DCGMFvti.js";
import { C as Card, b as CardHeader, c as CardTitle, d as CardDescription, a as CardContent } from "./card-CHW-R_CT.js";
import { u as ue, L as Label, I as Input } from "./index-CVvtv_EE.js";
import { S as Switch } from "./switch-w5TrVpW9.js";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-BPjAd3S7.js";
import { u as useActor, c as createActor, d as useQuery, b as useAuth } from "./useAuthStore-Cbv7GIMf.js";
import { P as PaymentStatusBadge, R as ReceiptText } from "./PaymentStatusBadge-B0_N3hGw.js";
import { L as LoaderCircle } from "./loader-circle-Dm6X7eBl.js";
import { C as CreditCard } from "./credit-card-Dor2YtG6.js";
import { C as CircleAlert } from "./circle-alert-jb_j1SyN.js";
import { E as ExternalLink } from "./external-link-C7JAQ9YB.js";
import { C as CircleCheck } from "./circle-check-D0suFTwN.js";
import { l as Calendar, k as Clock, F as FileText } from "./users-DUrIKgtR.js";
import { T as TriangleAlert } from "./triangle-alert-DaIOcezk.js";
import { C as CircleX } from "./circle-x-DBFfgxOH.js";
import { c as createLucideIcon } from "./createLucideIcon-BzNCDVU7.js";
import { S as Save } from "./save-Bo101srK.js";
import { I as Info } from "./info-BiURhlsP.js";
import "./index-Dv8dTxpA.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2", key: "975kel" }],
  ["circle", { cx: "12", cy: "7", r: "4", key: "17ys0d" }]
];
const User = createLucideIcon("user", __iconNode);
function StripeCheckoutButton({
  companyId,
  planId,
  billingModel,
  label = "Zahlung einrichten",
  variant = "default",
  size = "default",
  className,
  disabled,
  onSuccess,
  showInlineError = false
}) {
  const { actor } = useActor(createActor);
  const [inlineError, setInlineError] = reactExports.useState(null);
  const isSubmittingRef = reactExports.useRef(false);
  const checkoutMutation = useMutation({
    mutationFn: async () => {
      var _a;
      if (!actor) throw new Error("Kein Aktor verfügbar");
      const result = await actor.createStripeCheckoutSession(
        companyId,
        planId,
        billingModel
      );
      if (result.__kind__ === "err") {
        throw new Error(
          result.err || "Checkout-Session konnte nicht erstellt werden"
        );
      }
      const url = (_a = result.ok) == null ? void 0 : _a.url;
      if (!url) throw new Error("Keine Checkout-URL erhalten");
      return { url, sessionId: result.ok.sessionId };
    },
    onSuccess: ({ url }) => {
      setInlineError(null);
      isSubmittingRef.current = false;
      if (onSuccess) {
        onSuccess(url);
      } else {
        setTimeout(() => {
          window.location.href = url;
        }, 50);
      }
    },
    onError: (err) => {
      isSubmittingRef.current = false;
      const msg = err.message || "Unbekannter Fehler beim Stripe-Checkout";
      if (showInlineError) {
        setInlineError(msg);
      }
      ue.error(`Fehler beim Starten des Checkouts: ${msg}`);
    }
  });
  const isDisabled = disabled || checkoutMutation.isPending || isSubmittingRef.current;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Button,
      {
        type: "button",
        variant,
        size,
        className: `gap-2 ${className ?? ""}`,
        disabled: isDisabled,
        onClick: () => {
          if (isSubmittingRef.current || checkoutMutation.isPending) return;
          isSubmittingRef.current = true;
          setInlineError(null);
          checkoutMutation.mutate();
        },
        "data-ocid": "billing.stripe_checkout_button",
        children: [
          checkoutMutation.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CreditCard, { className: "w-4 h-4" }),
          checkoutMutation.isPending ? "Wird gestartet…" : label
        ]
      }
    ),
    showInlineError && inlineError && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "flex items-start gap-1.5 text-xs text-destructive",
        "data-ocid": "billing.stripe_checkout_error_state",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-3.5 h-3.5 mt-0.5 shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: inlineError })
        ]
      }
    )
  ] });
}
function StripeCustomerPortalButton({
  companyId,
  className
}) {
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
    onError: (err) => {
      ue.error(`Fehler beim Öffnen des Portals: ${err.message}`);
    }
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Button,
    {
      type: "button",
      variant: "outline",
      className: `gap-2 ${className ?? ""}`,
      disabled: portalMutation.isPending,
      onClick: () => portalMutation.mutate(),
      "data-ocid": "billing.stripe_portal_button",
      children: [
        portalMutation.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "w-4 h-4" }),
        portalMutation.isPending ? "Wird geöffnet…" : "Zahlungsdaten verwalten"
      ]
    }
  );
}
function formatTimestamp(ns) {
  if (!ns || ns === 0n) return "—";
  const ms = Number(ns / 1000000n);
  const d = new Date(ms);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${dd}.${mm}.${yyyy} ${hh}:${min}`;
}
function StripeSyncStatus({
  companyId,
  lastSyncAt,
  dataSource,
  queryKeysToInvalidate = []
}) {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  const syncMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Kein Aktor verfügbar");
      const result = await actor.syncStripeSubscription(companyId);
      if (result.__kind__ === "err") throw new Error(result.err ?? "Fehler");
      return result.ok;
    },
    onSuccess: () => {
      ue.success("Stripe-Synchronisation abgeschlossen.");
      for (const key of queryKeysToInvalidate) {
        queryClient.invalidateQueries({ queryKey: key });
      }
      queryClient.invalidateQueries({
        queryKey: ["companySubscriptionDetail"]
      });
    },
    onError: (err) => {
      ue.error(`Sync-Fehler: ${err.message}`);
    }
  });
  const isLive = dataSource === "live" || !dataSource;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "flex items-center gap-3 flex-wrap",
      "data-ocid": "billing.sync_status",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: `inline-flex w-2 h-2 rounded-full flex-shrink-0 ${isLive ? "bg-green-500" : "bg-yellow-400"}`
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: isLive ? "Live" : "Manuell" }),
          lastSyncAt && lastSyncAt > 0n && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "hidden sm:inline", children: [
            "· Letzter Sync: ",
            formatTimestamp(lastSyncAt)
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            type: "button",
            variant: "outline",
            size: "sm",
            className: "h-7 text-xs gap-1.5",
            disabled: syncMutation.isPending,
            onClick: () => syncMutation.mutate(),
            "data-ocid": "billing.sync_button",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                RefreshCw,
                {
                  className: `w-3 h-3 ${syncMutation.isPending ? "animate-spin" : ""}`
                }
              ),
              syncMutation.isPending ? "Synchronisiert…" : "Jetzt synchronisieren"
            ]
          }
        )
      ]
    }
  );
}
const toAny$1 = (a) => a;
function formatDateShort$1(ns) {
  const ms = Number(ns / 1000000n);
  const d = new Date(ms);
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
}
function BillingStatusPanel({
  companyId,
  isAdmin
}) {
  const { actor, isFetching } = useActor(createActor);
  const queryClient = useQueryClient();
  const { data: sub, isLoading: subLoading } = useQuery({
    queryKey: ["companySubscriptionDetail", companyId.toString()],
    queryFn: async () => {
      if (!actor) return null;
      try {
        const result = await toAny$1(actor).syncStripeSubscription(companyId);
        const r = result;
        if (r.__kind__ === "ok" && r.ok) return r.ok;
      } catch {
      }
      try {
        const billingResult = await actor.getCompanyBillingModel(companyId);
        if (billingResult.__kind__ === "ok") {
          return {
            companyId,
            planId: "",
            billingModel: billingResult.ok.billingModel,
            stripeCancelAtPeriodEnd: false,
            nextDueDate: billingResult.ok.nextDueDate,
            subscriptionStartDate: billingResult.ok.subscriptionStartDate
          };
        }
      } catch {
      }
      return null;
    },
    enabled: !!actor && !isFetching,
    staleTime: 3e4
  });
  const { data: plan, isLoading: planLoading } = useQuery({
    queryKey: ["companyPlan", companyId.toString()],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCompanySubscriptionPlan(companyId);
    },
    enabled: !!actor && !isFetching,
    staleTime: 3e4
  });
  const cancelMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Kein Aktor verfügbar");
      const result = await actor.cancelStripeSubscription(companyId);
      if (result.__kind__ === "err") throw new Error(result.err ?? "Fehler");
      return result.ok;
    },
    onSuccess: () => {
      ue.success(
        "Kündigung vorgemerkt. Das Abo bleibt bis Periodenende aktiv."
      );
      queryClient.invalidateQueries({
        queryKey: ["companySubscriptionDetail"]
      });
    },
    onError: (err) => ue.error(`Fehler: ${err.message}`)
  });
  const reactivateMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Kein Aktor verfügbar");
      const result = await actor.reactivateStripeSubscription(companyId);
      if (result.__kind__ === "err") throw new Error(result.err ?? "Fehler");
      return result.ok;
    },
    onSuccess: () => {
      ue.success("Kündigung zurückgezogen. Das Abo wird weitergeführt.");
      queryClient.invalidateQueries({
        queryKey: ["companySubscriptionDetail"]
      });
    },
    onError: (err) => ue.error(`Fehler: ${err.message}`)
  });
  const isLoading = subLoading || planLoading;
  const requiresPayment = (plan == null ? void 0 : plan.requiresPayment) ?? false;
  const hasStripeSubscription = !!(sub == null ? void 0 : sub.stripeSubscriptionId);
  const hasStripeCustomer = !!(sub == null ? void 0 : sub.stripeCustomerId);
  const isFree = !requiresPayment;
  const paymentProviderRaw = plan == null ? void 0 : plan.paymentProvider;
  const isStripe = paymentProviderRaw === "stripe" || typeof paymentProviderRaw === "object" && paymentProviderRaw !== null && "stripe" in paymentProviderRaw;
  const isManual = paymentProviderRaw === "manual" || typeof paymentProviderRaw === "object" && paymentProviderRaw !== null && "manual" in paymentProviderRaw;
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", "data-ocid": "billing.status_loading_state", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-6 w-48" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-64" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-40" })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", "data-ocid": "billing.status_panel", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 flex-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CreditCard, { className: "w-4 h-4 text-primary flex-shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold text-foreground", children: (plan == null ? void 0 : plan.name) ?? "Kein Plan" })
      ] }),
      isFree ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        Badge,
        {
          variant: "outline",
          className: "text-xs bg-green-50 text-green-700 border-green-200",
          children: "Kostenlos"
        }
      ) : /* @__PURE__ */ jsxRuntimeExports.jsx(PaymentStatusBadge, { status: sub == null ? void 0 : sub.stripeStatus }),
      (sub == null ? void 0 : sub.billingModel) && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-xs text-muted-foreground", children: sub.billingModel === "yearly" ? "Jährlich" : "Monatlich" })
    ] }),
    isFree && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2 rounded-md bg-muted/40 border border-border px-3 py-2.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Dieser Plan ist kostenlos und benötigt keine Zahlungsdaten." })
    ] }),
    sub && (sub.stripeCurrentPeriodStart || sub.stripeCurrentPeriodEnd || sub.nextDueDate) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [
      sub.stripeCurrentPeriodStart && sub.stripeCurrentPeriodStart > 0n && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "w-3.5 h-3.5 text-muted-foreground flex-shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Periode:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-foreground font-medium", children: [
          formatDateShort$1(sub.stripeCurrentPeriodStart),
          sub.stripeCurrentPeriodEnd && sub.stripeCurrentPeriodEnd > 0n ? ` – ${formatDateShort$1(sub.stripeCurrentPeriodEnd)}` : ""
        ] })
      ] }),
      (sub.stripeCurrentPeriodEnd ?? sub.nextDueDate) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-3.5 h-3.5 text-muted-foreground flex-shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Nächste Verlängerung:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground font-medium", children: formatDateShort$1(
          sub.stripeCurrentPeriodEnd ?? sub.nextDueDate
        ) })
      ] })
    ] }),
    (sub == null ? void 0 : sub.stripeCancelAtPeriodEnd) && sub.stripeCurrentPeriodEnd && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2 rounded-md bg-orange-50 border border-orange-200 px-3 py-2.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-orange-800", children: [
        "Kündigung zum",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: formatDateShort$1(sub.stripeCurrentPeriodEnd) }),
        " ",
        "vorgemerkt."
      ] })
    ] }),
    isStripe ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      requiresPayment && !hasStripeSubscription && isAdmin && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2 rounded-md bg-yellow-50 border border-yellow-200 px-3 py-2.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-yellow-800", children: "Für diesen Plan ist eine Zahlung erforderlich. Richte bitte das Abonnement über Stripe ein." })
      ] }),
      (sub == null ? void 0 : sub.stripeStatus) === "past_due" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2 rounded-md bg-red-50 border border-red-200 px-3 py-2.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-red-800", children: "Die letzte Zahlung ist fehlgeschlagen. Bitte aktualisiere deine Zahlungsdaten." })
      ] }),
      isAdmin && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
          requiresPayment && !hasStripeSubscription && plan && /* @__PURE__ */ jsxRuntimeExports.jsx(
            StripeCheckoutButton,
            {
              companyId,
              planId: plan.id,
              billingModel: (sub == null ? void 0 : sub.billingModel) ?? "monthly",
              label: "Abo über Stripe abschliessen",
              showInlineError: true
            }
          ),
          hasStripeCustomer && /* @__PURE__ */ jsxRuntimeExports.jsx(StripeCustomerPortalButton, { companyId }),
          hasStripeSubscription && !(sub == null ? void 0 : sub.stripeCancelAtPeriodEnd) && /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              type: "button",
              variant: "outline",
              size: "sm",
              className: "gap-2 text-destructive border-destructive/30 hover:bg-destructive/5",
              disabled: cancelMutation.isPending,
              onClick: () => cancelMutation.mutate(),
              "data-ocid": "billing.cancel_subscription_button",
              children: cancelMutation.isPending ? "Wird gekündigt…" : "Abo kündigen"
            }
          ),
          (sub == null ? void 0 : sub.stripeCancelAtPeriodEnd) && /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              type: "button",
              variant: "outline",
              size: "sm",
              className: "gap-2",
              disabled: reactivateMutation.isPending,
              onClick: () => reactivateMutation.mutate(),
              "data-ocid": "billing.reactivate_subscription_button",
              children: reactivateMutation.isPending ? "Wird reaktiviert…" : "Kündigung zurückziehen"
            }
          ),
          hasStripeSubscription && /* @__PURE__ */ jsxRuntimeExports.jsx(
            StripeSyncStatus,
            {
              companyId,
              lastSyncAt: sub == null ? void 0 : sub.lastStripeSyncAt,
              queryKeysToInvalidate: [
                ["companySubscriptionDetail", companyId.toString()]
              ]
            }
          )
        ] })
      ] })
    ] }) : isManual ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2 rounded-md bg-blue-50 border border-blue-200 px-3 py-2.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-blue-800", children: "Die Abrechnung wird manuell durch den Administrator verwaltet." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2 rounded-md bg-green-50 border border-green-200 px-3 py-2.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-green-800", children: "Dieser Plan ist kostenlos. Es ist keine Zahlung erforderlich." })
    ] })
  ] });
}
function formatDateShort(ns) {
  const ms = Number(ns / 1000000n);
  const d = new Date(ms);
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
}
function formatChf(amount, currency = "CHF") {
  return `${currency.toUpperCase()} ${amount.toLocaleString("de-CH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
const INVOICE_STATUS = {
  paid: {
    label: "Bezahlt",
    classes: "bg-green-100 text-green-700 border-green-200"
  },
  open: {
    label: "Offen",
    classes: "bg-blue-100 text-blue-700 border-blue-200"
  },
  draft: {
    label: "Entwurf",
    classes: "bg-muted text-muted-foreground border-border"
  },
  void: {
    label: "Storniert",
    classes: "bg-muted text-muted-foreground border-border"
  },
  uncollectible: {
    label: "Uneinbringlich",
    classes: "bg-red-100 text-red-700 border-red-200"
  }
};
function StripeInvoiceList({ companyId }) {
  const { actor, isFetching } = useActor(createActor);
  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ["stripeInvoices", companyId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getStripeInvoicesForCompany(companyId);
    },
    enabled: !!actor && !isFetching,
    staleTime: 6e4
  });
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", "data-ocid": "billing.invoices_loading_state", children: [1, 2].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-12 w-full" }, i)) });
  }
  if (invoices.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        "data-ocid": "billing.invoices_empty_state",
        className: "flex flex-col items-center gap-2 py-8 text-center text-muted-foreground",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ReceiptText, { className: "w-8 h-8 opacity-40" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "Noch keine Rechnungen vorhanden." })
        ]
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto -mx-1", "data-ocid": "billing.invoice_list", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border text-xs text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-2 py-2 font-medium", children: "Rechnungsnr." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-2 py-2 font-medium hidden sm:table-cell", children: "Datum" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right px-2 py-2 font-medium", children: "Betrag" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-center px-2 py-2 font-medium", children: "Status" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right px-2 py-2 font-medium", children: "Links" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: invoices.map((inv, idx) => {
      const statusConfig = INVOICE_STATUS[inv.status] ?? {
        label: inv.status,
        classes: "bg-muted text-muted-foreground border-border"
      };
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "tr",
        {
          "data-ocid": `billing.invoice_row.${idx + 1}`,
          className: "border-b border-border/40 hover:bg-muted/20 transition-colors",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2 py-2.5 font-mono text-xs text-foreground", children: inv.invoiceNumber ?? inv.stripeInvoiceId.slice(-8).toUpperCase() }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2 py-2.5 text-muted-foreground hidden sm:table-cell whitespace-nowrap", children: formatDateShort(inv.issuedAt) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2 py-2.5 text-right tabular-nums font-medium", children: formatChf(inv.amountDue, inv.currency) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2 py-2.5 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Badge,
              {
                variant: "outline",
                className: `text-[10px] px-1.5 py-0 ${statusConfig.classes}`,
                children: statusConfig.label
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2 py-2.5 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-1.5", children: [
              inv.hostedInvoiceUrl && /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  type: "button",
                  variant: "ghost",
                  size: "sm",
                  className: "h-6 w-6 p-0 text-muted-foreground hover:text-primary",
                  onClick: () => window.open(
                    inv.hostedInvoiceUrl,
                    "_blank",
                    "noopener,noreferrer"
                  ),
                  "aria-label": "Rechnung anzeigen",
                  "data-ocid": `billing.invoice_view_button.${idx + 1}`,
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "w-3.5 h-3.5" })
                }
              ),
              inv.invoicePdfUrl && /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  type: "button",
                  variant: "ghost",
                  size: "sm",
                  className: "h-6 w-6 p-0 text-muted-foreground hover:text-primary",
                  onClick: () => window.open(
                    inv.invoicePdfUrl,
                    "_blank",
                    "noopener,noreferrer"
                  ),
                  "aria-label": "PDF herunterladen",
                  "data-ocid": `billing.invoice_pdf_button.${idx + 1}`,
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-3.5 h-3.5" })
                }
              )
            ] }) })
          ]
        },
        inv.stripeInvoiceId
      );
    }) })
  ] }) });
}
const toAny = (a) => a;
function getRoleBadge(role) {
  if (role === "admin")
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Badge,
      {
        className: "bg-primary/10 text-primary border-primary/30",
        variant: "outline",
        children: "Administrator"
      }
    );
  if (role === "manager")
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-accent text-accent-foreground", variant: "secondary", children: "Manager" });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: "Mitarbeiter" });
}
function NotificationToggle({
  id,
  label,
  description,
  checked,
  disabled,
  upcoming,
  onCheckedChange
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-4 py-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0 space-y-0.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Label,
          {
            htmlFor: id,
            className: `text-sm font-medium cursor-pointer ${disabled ? "text-muted-foreground" : "text-foreground"}`,
            children: label
          }
        ),
        upcoming && /* @__PURE__ */ jsxRuntimeExports.jsx(
          Badge,
          {
            variant: "outline",
            className: "text-[10px] px-1.5 py-0 text-muted-foreground border-muted-foreground/30",
            children: "Demnächst verfügbar"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: description })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Switch,
      {
        id,
        checked: checked ?? false,
        disabled,
        onCheckedChange,
        "data-ocid": `toggle-${id}`,
        "aria-label": label,
        className: "mt-0.5 shrink-0"
      }
    )
  ] });
}
function EinstellungenPage() {
  const navigate = useNavigate();
  const { isAuthenticated, companyId, role, employeeName, principal } = useAuth();
  const { actor, isFetching } = useActor(createActor);
  const queryClient = useQueryClient();
  reactExports.useEffect(() => {
    if (!isAuthenticated || !companyId) navigate({ to: "/" });
  }, [isAuthenticated, companyId, navigate]);
  const isAdmin = role === "admin";
  const isManagerOrAdmin = role === "admin" || role === "manager";
  const { data: currentPlan } = useQuery({
    queryKey: ["companyPlan", companyId],
    queryFn: async () => {
      if (!actor || !companyId) return null;
      return actor.getCompanySubscriptionPlan(BigInt(companyId));
    },
    enabled: !!actor && !isFetching && isAuthenticated && isAdmin,
    staleTime: 6e4
  });
  const { data: notifData, isLoading: notifLoading } = useQuery({
    queryKey: ["userNotificationSettings"],
    queryFn: async () => {
      if (!actor) return null;
      try {
        const result = await toAny(actor).getUserNotificationSettings();
        const r = result;
        return r.__kind__ === "ok" && r.ok ? r.ok : null;
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching && isAuthenticated,
    staleTime: 3e4
  });
  const [notifForm, setNotifForm] = reactExports.useState({
    emailNewVacationRequest: false,
    emailOnApproval: false
  });
  reactExports.useEffect(() => {
    if (notifData) {
      setNotifForm({
        emailNewVacationRequest: notifData.emailNewVacationRequest,
        emailOnApproval: notifData.emailOnApproval
      });
    }
  }, [notifData]);
  const saveNotifMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Nicht angemeldet");
      const input = notifData ? {
        ...notifData,
        emailNewVacationRequest: notifForm.emailNewVacationRequest,
        emailOnApproval: notifForm.emailOnApproval
      } : {
        emailNewVacationRequest: notifForm.emailNewVacationRequest,
        emailOnApproval: notifForm.emailOnApproval,
        principalId: principal,
        companyId: BigInt(companyId ?? 0)
      };
      const result = await toAny(actor).updateUserNotificationSettings(input);
      const r = result;
      if (r.__kind__ === "err")
        throw new Error(r.err ?? "Fehler beim Speichern");
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userNotificationSettings"] });
      ue.success("Benachrichtigungseinstellungen gespeichert");
    },
    onError: (err) => {
      ue.error(`Fehler: ${err.message}`);
    }
  });
  const { data: companySettingsData, isLoading: companySettingsLoading } = useQuery({
    queryKey: ["companySettings", companyId],
    queryFn: async () => {
      if (!actor) return null;
      try {
        const result = await toAny(actor).getCompanySettings();
        const r = result;
        return r.__kind__ === "ok" && r.ok ? r.ok : null;
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching && isAuthenticated && isManagerOrAdmin,
    staleTime: 3e4
  });
  const [vacationForm, setVacationForm] = reactExports.useState({
    maxVacationDays: 25,
    vacationCarryoverDays: 5,
    approvalRequired: true
  });
  reactExports.useEffect(() => {
    if (companySettingsData) {
      setVacationForm({
        maxVacationDays: Number(companySettingsData.maxVacationDays),
        vacationCarryoverDays: Number(
          companySettingsData.vacationCarryoverDays
        ),
        approvalRequired: companySettingsData.approvalRequired
      });
    }
  }, [companySettingsData]);
  const saveVacationMutation = useMutation({
    mutationFn: async () => {
      if (!actor || !companySettingsData) throw new Error("Nicht verfügbar");
      const input = {
        ...companySettingsData,
        maxVacationDays: BigInt(vacationForm.maxVacationDays),
        vacationCarryoverDays: BigInt(vacationForm.vacationCarryoverDays),
        approvalRequired: vacationForm.approvalRequired
      };
      const result = await toAny(actor).updateCompanySettings(input);
      const r = result;
      if (r.__kind__ === "err")
        throw new Error(r.err ?? "Fehler beim Speichern");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companySettings"] });
      ue.success("Ferieneinstellungen gespeichert");
    },
    onError: (err) => {
      ue.error(`Fehler: ${err.message}`);
    }
  });
  const { data: defaultWorkHoursData, isLoading: defaultWorkHoursLoading } = useQuery({
    queryKey: ["defaultWorkHours", companyId],
    queryFn: async () => {
      if (!actor) return null;
      try {
        const result = await toAny(actor).getDefaultWorkHours();
        const r = result;
        return r.__kind__ === "ok" && r.ok ? r.ok : null;
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching && isAuthenticated && isAdmin,
    staleTime: 3e4
  });
  function minutesToHhMm(mins) {
    const m = Number(mins);
    const h = Math.floor(m / 60);
    const min = m % 60;
    return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
  }
  function hhmmToMinutes(s) {
    const [h, m] = s.split(":").map(Number);
    return (Number.isNaN(h) ? 0 : h) * 60 + (Number.isNaN(m) ? 0 : m);
  }
  const [defaultWorkHoursForm, setDefaultWorkHoursForm] = reactExports.useState({
    stundenMo: "08:00",
    stundenDi: "08:00",
    stundenMi: "08:00",
    stundenDo: "08:00",
    stundenFr: "08:00",
    stundenSa: "00:00",
    stundenSo: "00:00"
  });
  reactExports.useEffect(() => {
    if (defaultWorkHoursData) {
      setDefaultWorkHoursForm({
        stundenMo: minutesToHhMm(defaultWorkHoursData.stundenMo),
        stundenDi: minutesToHhMm(defaultWorkHoursData.stundenDi),
        stundenMi: minutesToHhMm(defaultWorkHoursData.stundenMi),
        stundenDo: minutesToHhMm(defaultWorkHoursData.stundenDo),
        stundenFr: minutesToHhMm(defaultWorkHoursData.stundenFr),
        stundenSa: minutesToHhMm(defaultWorkHoursData.stundenSa),
        stundenSo: minutesToHhMm(defaultWorkHoursData.stundenSo)
      });
    }
  }, [defaultWorkHoursData]);
  const saveDefaultWorkHoursMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Nicht verfügbar");
      const resolvedCompanyId = (defaultWorkHoursData == null ? void 0 : defaultWorkHoursData.companyId) != null ? BigInt(defaultWorkHoursData.companyId) : BigInt(companyId ?? 0);
      const input = {
        companyId: resolvedCompanyId,
        stundenMo: BigInt(hhmmToMinutes(defaultWorkHoursForm.stundenMo)),
        stundenDi: BigInt(hhmmToMinutes(defaultWorkHoursForm.stundenDi)),
        stundenMi: BigInt(hhmmToMinutes(defaultWorkHoursForm.stundenMi)),
        stundenDo: BigInt(hhmmToMinutes(defaultWorkHoursForm.stundenDo)),
        stundenFr: BigInt(hhmmToMinutes(defaultWorkHoursForm.stundenFr)),
        stundenSa: BigInt(hhmmToMinutes(defaultWorkHoursForm.stundenSa)),
        stundenSo: BigInt(hhmmToMinutes(defaultWorkHoursForm.stundenSo))
      };
      const result = await toAny(actor).updateDefaultWorkHours(input);
      const r = result;
      if (r.__kind__ === "err")
        throw new Error(r.err ?? "Fehler beim Speichern");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["defaultWorkHours"] });
      ue.success("Standardarbeitsstunden gespeichert");
    },
    onError: (err) => {
      ue.error(`Fehler: ${err.message}`);
    }
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Layout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 space-y-6 max-w-3xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-display font-bold text-foreground", children: "Einstellungen" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-0.5", children: "Konto- und Unternehmenseinstellungen verwalten" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "benachrichtigungen", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "mb-6 flex-wrap h-auto gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          TabsTrigger,
          {
            value: "benachrichtigungen",
            "data-ocid": "tab-benachrichtigungen",
            className: "gap-1.5",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "w-3.5 h-3.5" }),
              "Benachrichtigungen"
            ]
          }
        ),
        isManagerOrAdmin && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          TabsTrigger,
          {
            value: "ferien",
            "data-ocid": "tab-ferien",
            className: "gap-1.5",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "w-3.5 h-3.5" }),
              "Ferien & Abwesenheiten"
            ]
          }
        ),
        isAdmin && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          TabsTrigger,
          {
            value: "standardarbeitsstunden",
            "data-ocid": "tab-standardarbeitsstunden",
            className: "gap-1.5",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-3.5 h-3.5" }),
              "Standardarbeitsstunden"
            ]
          }
        ),
        isAdmin && /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "abo", "data-ocid": "tab-abo", className: "gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CreditCard, { className: "w-3.5 h-3.5" }),
          "Abo & Abrechnung"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          TabsTrigger,
          {
            value: "profil",
            "data-ocid": "tab-profil",
            className: "gap-1.5",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "w-3.5 h-3.5" }),
              "Benutzerprofil"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "benachrichtigungen", className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "shadow-card", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "E-Mail Benachrichtigungen" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Legen Sie fest, bei welchen Ereignissen Sie eine E-Mail erhalten möchten." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "space-y-1", children: notifLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 py-4 text-sm text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin" }),
            "Einstellungen werden geladen…"
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              NotificationToggle,
              {
                id: "emailNewVacationRequest",
                label: "E-Mail bei neuem Ferienantrag",
                description: "Du erhältst eine E-Mail, wenn ein neuer Ferienantrag eingereicht wird.",
                checked: notifForm.emailNewVacationRequest,
                onCheckedChange: (v) => setNotifForm((p) => ({
                  ...p,
                  emailNewVacationRequest: v
                }))
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              NotificationToggle,
              {
                id: "emailOnApproval",
                label: "E-Mail bei Genehmigung/Ablehnung",
                description: "Du erhältst eine E-Mail, wenn dein Ferienantrag genehmigt oder abgelehnt wird.",
                checked: notifForm.emailOnApproval,
                onCheckedChange: (v) => setNotifForm((p) => ({ ...p, emailOnApproval: v }))
              }
            )
          ] }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "shadow-card border-dashed border-muted-foreground/20 bg-muted/20", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base text-muted-foreground", children: "Geplante Funktionen" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Diese Benachrichtigungsoptionen werden in einer zukünftigen Version verfügbar." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              NotificationToggle,
              {
                id: "weeklySummary",
                label: "Wochenzusammenfassung per E-Mail",
                description: "Wöchentliche Zusammenfassung Ihrer Stunden, Spesen und Abwesenheiten.",
                disabled: true,
                upcoming: true
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              NotificationToggle,
              {
                id: "pushNotifications",
                label: "Push-Benachrichtigungen",
                description: "Browser-Benachrichtigungen für wichtige Ereignisse.",
                disabled: true,
                upcoming: true
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            type: "button",
            onClick: () => saveNotifMutation.mutate(),
            disabled: saveNotifMutation.isPending || notifLoading,
            "data-ocid": "save-notifications",
            className: "gap-2",
            children: [
              saveNotifMutation.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "w-4 h-4" }),
              "Benachrichtigungseinstellungen speichern"
            ]
          }
        ) })
      ] }),
      isManagerOrAdmin && /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "ferien", className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "shadow-card", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Ferieneinstellungen" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Legen Sie die Ferienregeln für Ihre Firma fest." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-5", children: [
            !isAdmin && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2 p-3 rounded-md bg-muted/50 text-sm text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "w-4 h-4 mt-0.5 shrink-0" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Nur Admins können diese Einstellungen ändern." })
            ] }),
            companySettingsLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 py-4 text-sm text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin" }),
              "Einstellungen werden geladen…"
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "maxVacationDays", children: "Maximale Ferientage pro Jahr" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    id: "maxVacationDays",
                    type: "number",
                    min: 0,
                    max: 365,
                    value: vacationForm.maxVacationDays,
                    onChange: (e) => setVacationForm((p) => ({
                      ...p,
                      maxVacationDays: Number(e.target.value)
                    })),
                    disabled: !isAdmin,
                    "data-ocid": "input-max-vacation-days"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Gesetzliches Minimum in der Schweiz: 20 Tage" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "vacationCarryoverDays", children: "Ferienübertrag (Tage)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    id: "vacationCarryoverDays",
                    type: "number",
                    min: 0,
                    max: 365,
                    value: vacationForm.vacationCarryoverDays,
                    onChange: (e) => setVacationForm((p) => ({
                      ...p,
                      vacationCarryoverDays: Number(e.target.value)
                    })),
                    disabled: !isAdmin,
                    "data-ocid": "input-carryover-days"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Maximale Anzahl übertragbarer Ferientage ins Folgejahr" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2 flex items-center justify-between rounded-md border border-input bg-card p-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-0.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Label,
                    {
                      htmlFor: "approvalRequired",
                      className: `text-sm font-medium ${!isAdmin ? "text-muted-foreground" : "text-foreground"}`,
                      children: "Genehmigung erforderlich"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Ferienanträge müssen von einem Admin oder Manager genehmigt werden." })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Switch,
                  {
                    id: "approvalRequired",
                    checked: vacationForm.approvalRequired,
                    disabled: !isAdmin,
                    onCheckedChange: (v) => setVacationForm((p) => ({
                      ...p,
                      approvalRequired: v
                    })),
                    "data-ocid": "toggle-approval-required"
                  }
                )
              ] })
            ] })
          ] })
        ] }),
        isAdmin && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            type: "button",
            onClick: () => saveVacationMutation.mutate(),
            disabled: saveVacationMutation.isPending || companySettingsLoading,
            "data-ocid": "save-vacation-settings",
            className: "gap-2",
            children: [
              saveVacationMutation.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "w-4 h-4" }),
              "Ferieneinstellungen speichern"
            ]
          }
        ) })
      ] }),
      isAdmin && /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "standardarbeitsstunden", className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "shadow-card", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Standardarbeitsstunden pro Wochentag" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Diese Werte werden beim Erfassen einer neuen Beschäftigung automatisch vorausgefüllt." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "space-y-5", children: defaultWorkHoursLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 py-4 text-sm text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin" }),
            "Einstellungen werden geladen…"
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-4", children: [
            { key: "stundenMo", label: "Montag" },
            { key: "stundenDi", label: "Dienstag" },
            { key: "stundenMi", label: "Mittwoch" },
            { key: "stundenDo", label: "Donnerstag" },
            { key: "stundenFr", label: "Freitag" },
            { key: "stundenSa", label: "Samstag" },
            { key: "stundenSo", label: "Sonntag" }
          ].map(({ key, label }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: `dwh-${key}`, children: label }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: `dwh-${key}`,
                placeholder: "hh:mm",
                value: defaultWorkHoursForm[key],
                onChange: (e) => setDefaultWorkHoursForm((p) => ({
                  ...p,
                  [key]: e.target.value
                })),
                "data-ocid": `input-dwh-${key}`
              }
            )
          ] }, key)) }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            type: "button",
            onClick: () => saveDefaultWorkHoursMutation.mutate(),
            disabled: saveDefaultWorkHoursMutation.isPending || defaultWorkHoursLoading,
            "data-ocid": "save-default-work-hours",
            className: "gap-2",
            children: [
              saveDefaultWorkHoursMutation.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "w-4 h-4" }),
              "Standardarbeitsstunden speichern"
            ]
          }
        ) })
      ] }),
      isAdmin && /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "abo", className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "shadow-card", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-base flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CreditCard, { className: "w-4 h-4 text-primary" }),
            "Abo-Status"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            BillingStatusPanel,
            {
              companyId: BigInt(companyId ?? 0),
              isAdmin
            }
          ) })
        ] }),
        (() => {
          const pp = currentPlan == null ? void 0 : currentPlan.paymentProvider;
          const isStripe = pp != null && typeof pp === "object" && "Stripe" in pp;
          const isManual = pp != null && typeof pp === "object" && "Manuell" in pp;
          const isFree = !(currentPlan == null ? void 0 : currentPlan.requiresPayment) || pp != null && typeof pp === "object" && "Keine" in pp || !pp;
          if (isStripe && (currentPlan == null ? void 0 : currentPlan.requiresPayment)) {
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "shadow-card", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-base flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CreditCard, { className: "w-4 h-4 text-primary" }),
                "Stripe-Rechnungen"
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(StripeInvoiceList, { companyId: BigInt(companyId ?? 0) }) })
            ] });
          }
          if (isManual) {
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "shadow-card", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-base flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CreditCard, { className: "w-4 h-4 text-primary" }),
                "Abrechnung"
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Die Abrechnung wird manuell durch den Administrator verwaltet." }) })
            ] });
          }
          if (isFree) {
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "shadow-card", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-base flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CreditCard, { className: "w-4 h-4 text-primary" }),
                "Abrechnung"
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Dieser Plan ist kostenlos. Es ist keine Zahlung erforderlich." }) })
            ] });
          }
          return null;
        })()
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "profil", className: "space-y-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "shadow-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Benutzerprofil" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Ihre Profildaten werden über Internet Identity verwaltet." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-muted-foreground text-xs uppercase tracking-wide", children: "Name" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-foreground", children: employeeName ?? "–" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-muted-foreground text-xs uppercase tracking-wide", children: "Rolle" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: getRoleBadge(role) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2 space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-muted-foreground text-xs uppercase tracking-wide", children: "Principal ID" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-mono text-muted-foreground break-all", children: principal ?? "–" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 p-4 rounded-md bg-secondary/50 border border-secondary", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "w-4 h-4 text-primary mt-0.5 shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-secondary-foreground", children: [
              "Ihr Benutzerprofil wird über",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Internet Identity" }),
              " verwaltet. Um Ihre Identität oder verknüpften Geräte zu ändern, besuchen Sie bitte identity.ic0.app."
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              type: "button",
              variant: "outline",
              onClick: () => window.open(
                "https://identity.ic0.app",
                "_blank",
                "noopener,noreferrer"
              ),
              "data-ocid": "btn-open-internet-identity",
              className: "gap-2",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "w-4 h-4" }),
                "Internet Identity öffnen"
              ]
            }
          )
        ] })
      ] }) })
    ] })
  ] }) });
}
export {
  EinstellungenPage as default
};
