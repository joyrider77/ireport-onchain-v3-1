import { a as useNavigate, j as jsxRuntimeExports } from "./index-Blf-A8DR.js";
import { B as Button } from "./button-DCGMFvti.js";
import { L as Layout } from "./Layout-ClH0znk9.js";
import { C as CircleX } from "./circle-x-DBFfgxOH.js";
import "./index-Dv8dTxpA.js";
import "./users-DUrIKgtR.js";
import "./createLucideIcon-BzNCDVU7.js";
import "./index-CVvtv_EE.js";
import "./useAuthStore-Cbv7GIMf.js";
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
