import { a as useNavigate, j as jsxRuntimeExports, S as Skeleton } from "./index-D_yjRFGt.js";
import { B as Button } from "./button-BXNzWYpr.js";
import { d as useAuth, u as useActor, b as useQuery, c as createActor } from "./useAuthStore-RPelH0kd.js";
import { L as Layout } from "./Layout-BOoVnXJI.js";
import { C as CircleCheck } from "./circle-check-CdoWZXIR.js";
import "./index-HGa3Ynxo.js";
import "./x-BHvIGru9.js";
import "./createLucideIcon-C599ATMm.js";
import "./index-SoMYIp0N.js";
import "./loader-circle-DPIlcj_m.js";
const toAny = (a) => a;
function StripeSuccessPage() {
  const navigate = useNavigate();
  const { companyId } = useAuth();
  const { actor, isFetching } = useActor(createActor);
  const { data: plan, isLoading } = useQuery({
    queryKey: ["companyPlanAfterCheckout", companyId],
    queryFn: async () => {
      if (!actor || !companyId) return null;
      try {
        await toAny(actor).syncStripeSubscription(BigInt(companyId));
      } catch {
      }
      return actor.getCompanySubscriptionPlan(BigInt(companyId));
    },
    enabled: !!actor && !isFetching && !!companyId,
    staleTime: 0
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Layout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center min-h-[60vh] p-6 max-w-md mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-full bg-green-100 p-5 mb-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-12 h-12 text-green-600" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-display font-bold text-foreground text-center mb-2", children: "Zahlung erfolgreich" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-center text-sm mb-6", children: "Zahlung wird verarbeitet. Dein Abo wird in Kürze aktiviert." }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "space-y-2 w-full",
        "data-ocid": "stripe-success.loading_state",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-48 mx-auto" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-32 mx-auto" })
        ]
      }
    ) : plan ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "rounded-lg border border-border bg-card px-6 py-4 text-center mb-6",
        "data-ocid": "stripe-success.plan_card",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mb-1", children: "Aktiver Plan" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-bold text-primary", children: plan.name }),
          plan.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: plan.description })
        ]
      }
    ) : null,
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 flex-wrap justify-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          type: "button",
          onClick: () => navigate({ to: "/einstellungen" }),
          "data-ocid": "stripe-success.settings_button",
          children: "Zu den Einstellungen"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          type: "button",
          variant: "outline",
          onClick: () => navigate({ to: "/dashboard" }),
          "data-ocid": "stripe-success.dashboard_button",
          children: "Zum Dashboard"
        }
      )
    ] })
  ] }) });
}
export {
  StripeSuccessPage as default
};
