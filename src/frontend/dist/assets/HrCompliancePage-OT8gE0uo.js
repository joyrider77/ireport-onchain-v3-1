const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/ComplianceCockpit-r_7SY2XF.js","assets/index-D_yjRFGt.js","assets/index-2UbcfAqZ.css","assets/button-BXNzWYpr.js","assets/index-HGa3Ynxo.js","assets/index-SoMYIp0N.js","assets/Layout-BOoVnXJI.js","assets/x-BHvIGru9.js","assets/createLucideIcon-C599ATMm.js","assets/useAuthStore-RPelH0kd.js","assets/loader-circle-DPIlcj_m.js","assets/table-CXihOV-A.js","assets/ComplianceMitarbeiterDetail-CIT5LHC8.js","assets/ComplianceFerienCompliance-dzG6UMs1.js","assets/ComplianceRegeln-A7NlBEQq.js","assets/save-Cu4HicBy.js","assets/pen-Sv4c0ccJ.js","assets/rotate-ccw-C6yEopyQ.js"])))=>i.map(i=>d[i]);
import { r as reactExports, j as jsxRuntimeExports, _ as __vitePreload } from "./index-D_yjRFGt.js";
import { L as Layout, I as ShieldCheck } from "./Layout-BOoVnXJI.js";
import { B as Badge } from "./badge-BPk2SywW.js";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-BXMAOymm.js";
import { d as useAuth, u as useActor, c as createActor } from "./useAuthStore-RPelH0kd.js";
import "./x-BHvIGru9.js";
import "./index-HGa3Ynxo.js";
import "./createLucideIcon-C599ATMm.js";
import "./index-SoMYIp0N.js";
import "./button-BXNzWYpr.js";
import "./loader-circle-DPIlcj_m.js";
const toAny = (a) => a;
const ComplianceCockpit = reactExports.lazy(() => __vitePreload(() => import("./ComplianceCockpit-r_7SY2XF.js"), true ? __vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10,11]) : void 0));
const ComplianceMitarbeiterDetail = reactExports.lazy(
  () => __vitePreload(() => import("./ComplianceMitarbeiterDetail-CIT5LHC8.js"), true ? __vite__mapDeps([12,1,2,3,4,9]) : void 0)
);
const ComplianceFerienCompliance = reactExports.lazy(
  () => __vitePreload(() => import("./ComplianceFerienCompliance-dzG6UMs1.js"), true ? __vite__mapDeps([13,1,2,9]) : void 0)
);
const ComplianceRegeln = reactExports.lazy(() => __vitePreload(() => import("./ComplianceRegeln-A7NlBEQq.js"), true ? __vite__mapDeps([14,1,2,3,4,9,10,8,7,15,16,17]) : void 0));
function TabFallback() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "w-12 h-12 opacity-30" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "Wird geladen…" })
  ] });
}
function HrCompliancePage() {
  const { companyId, isAuthenticated } = useAuth();
  const { actor, isFetching } = useActor(createActor);
  const [employees, setEmployees] = reactExports.useState([]);
  reactExports.useEffect(() => {
    if (!actor || isFetching || !isAuthenticated || !companyId) return;
    void (async () => {
      try {
        const result = await toAny(actor).listEmployees(
          BigInt(companyId)
        );
        setEmployees(
          result.map((e) => ({
            id: e.id,
            firstName: e.firstName,
            lastName: e.lastName,
            startDate: e.startDate
          }))
        );
      } catch {
      }
    })();
  }, [actor, isFetching, isAuthenticated, companyId]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Layout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col h-full", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-card border-b border-border px-6 py-4 flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "w-5 h-5 text-primary" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-display font-semibold text-foreground", children: "HR & Compliance" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Badge,
            {
              variant: "secondary",
              className: "text-[10px] px-2 py-0.5 font-medium",
              children: "Schweiz"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Schweizer Compliance-Modul – Arbeitszeiten & Abwesenheiten" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-y-auto bg-background", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "cockpit", className: "h-full flex flex-col", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-b border-border bg-card px-6 flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "h-10 bg-transparent gap-0 p-0 rounded-none", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          TabsTrigger,
          {
            value: "cockpit",
            "data-ocid": "hr-compliance.cockpit_tab",
            className: "rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent h-10 px-4 text-sm font-medium",
            children: "Cockpit"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          TabsTrigger,
          {
            value: "mitarbeiter",
            "data-ocid": "hr-compliance.mitarbeiter_tab",
            className: "rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent h-10 px-4 text-sm font-medium",
            children: "Mitarbeiter-Detail"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          TabsTrigger,
          {
            value: "ferien",
            "data-ocid": "hr-compliance.ferien_tab",
            className: "rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent h-10 px-4 text-sm font-medium",
            children: "Ferien-Compliance"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          TabsTrigger,
          {
            value: "regeln",
            "data-ocid": "hr-compliance.regeln_tab",
            className: "rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent h-10 px-4 text-sm font-medium",
            children: "Regeln"
          }
        )
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "cockpit", className: "flex-1 mt-0 p-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx(TabFallback, {}), children: /* @__PURE__ */ jsxRuntimeExports.jsx(ComplianceCockpit, {}) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "mitarbeiter", className: "flex-1 mt-0 p-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx(TabFallback, {}), children: /* @__PURE__ */ jsxRuntimeExports.jsx(ComplianceMitarbeiterDetail, { employees }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "ferien", className: "flex-1 mt-0 p-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx(TabFallback, {}), children: /* @__PURE__ */ jsxRuntimeExports.jsx(ComplianceFerienCompliance, { employees }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "regeln", className: "flex-1 mt-0 p-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx(TabFallback, {}), children: /* @__PURE__ */ jsxRuntimeExports.jsx(ComplianceRegeln, {}) }) })
    ] }) })
  ] }) });
}
export {
  HrCompliancePage as default
};
