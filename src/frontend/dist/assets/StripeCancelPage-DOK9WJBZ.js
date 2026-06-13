import { a as useNavigate, j as jsxRuntimeExports } from "./index-D_yjRFGt.js";
import { B as Button } from "./button-BXNzWYpr.js";
import { L as Layout } from "./Layout-BOoVnXJI.js";
import { C as CircleX } from "./circle-x-CTQNE8RQ.js";
import "./index-HGa3Ynxo.js";
import "./x-BHvIGru9.js";
import "./createLucideIcon-C599ATMm.js";
import "./index-SoMYIp0N.js";
import "./useAuthStore-RPelH0kd.js";
import "./loader-circle-DPIlcj_m.js";
function StripeCancelPage() {
  const navigate = useNavigate();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Layout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center min-h-[60vh] p-6 max-w-md mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-full bg-muted p-5 mb-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "w-12 h-12 text-muted-foreground" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-display font-bold text-foreground text-center mb-2", children: "Vorgang abgebrochen" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-center text-sm mb-8", children: "Der Zahlungsvorgang wurde abgebrochen. Dein aktueller Plan bleibt unverändert." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 flex-wrap justify-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          type: "button",
          onClick: () => navigate({ to: "/einstellungen" }),
          "data-ocid": "stripe-cancel.settings_button",
          children: "Zurück zu den Einstellungen"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          type: "button",
          variant: "outline",
          onClick: () => navigate({ to: "/dashboard" }),
          "data-ocid": "stripe-cancel.dashboard_button",
          children: "Zum Dashboard"
        }
      )
    ] })
  ] }) });
}
export {
  StripeCancelPage as default
};
