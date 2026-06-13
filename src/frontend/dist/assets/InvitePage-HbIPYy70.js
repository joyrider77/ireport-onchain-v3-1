import { a as useNavigate, u as useInternetIdentity, r as reactExports, j as jsxRuntimeExports } from "./index-D_yjRFGt.js";
import { B as Button } from "./button-BXNzWYpr.js";
import { C as Card, a as CardContent } from "./card-Cqx-QXhC.js";
import { u as useActor, a as useAuthStore, c as createActor } from "./useAuthStore-RPelH0kd.js";
import { c as createLucideIcon } from "./createLucideIcon-C599ATMm.js";
import { L as LoaderCircle } from "./loader-circle-DPIlcj_m.js";
import { C as CircleCheckBig } from "./circle-check-big-M4F681dK.js";
import { C as CircleX } from "./circle-x-CTQNE8RQ.js";
import "./index-HGa3Ynxo.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "m10 17 5-5-5-5", key: "1bsop3" }],
  ["path", { d: "M15 12H3", key: "6jk70r" }],
  ["path", { d: "M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4", key: "u53s6r" }]
];
const LogIn = createLucideIcon("log-in", __iconNode);
function InvitePage() {
  const navigate = useNavigate();
  const { identity, login } = useInternetIdentity();
  const { actor, isFetching } = useActor(createActor);
  const { setAuthenticated } = useAuthStore();
  const hasRedeemedRef = reactExports.useRef(false);
  const [status, setStatus] = reactExports.useState("idle");
  const [errorMsg, setErrorMsg] = reactExports.useState("");
  const [welcomeName, setWelcomeName] = reactExports.useState("");
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code") ?? "";
  reactExports.useEffect(() => {
    if (!code) {
      setStatus("error");
      setErrorMsg(
        "Kein Einladungscode in der URL gefunden. Bitte verwenden Sie den vollständigen Einladungslink."
      );
      return;
    }
    if (!identity) {
      setStatus("idle");
      return;
    }
    if (!actor || isFetching) return;
    if (hasRedeemedRef.current) return;
    hasRedeemedRef.current = true;
    setStatus("loading");
    const redeem = async () => {
      try {
        const typedActor = actor;
        const result = await typedActor.redeemInviteCode(code);
        if (result.__kind__ === "err") {
          setStatus("error");
          const msg = result.err.includes("already") ? "Dieser Einladungslink wurde bereits verwendet." : result.err.includes("not found") || result.err.includes("invalid") ? "Einladungslink ungültig oder abgelaufen." : `Fehler: ${result.err}`;
          setErrorMsg(msg);
          hasRedeemedRef.current = false;
          return;
        }
        const emp = result.ok;
        const principal = identity.getPrincipal().toString();
        let companyName = "Ihrem Unternehmen";
        try {
          const companyResult = await typedActor.getMyCompany();
          if (companyResult.__kind__ === "ok") {
            companyName = companyResult.ok.name;
          }
        } catch {
        }
        setAuthenticated(
          principal,
          emp.role,
          String(emp.companyId),
          String(emp.id),
          companyName,
          `${emp.firstName} ${emp.lastName}`
        );
        setWelcomeName(`${emp.firstName} ${emp.lastName}`);
        setStatus("success");
        setTimeout(() => navigate({ to: "/dashboard" }), 3e3);
      } catch (err) {
        console.error("Einladungslink-Fehler:", err);
        setStatus("error");
        setErrorMsg(
          "Ein unerwarteter Fehler ist aufgetreten. Bitte wenden Sie sich an Ihren Administrator."
        );
        hasRedeemedRef.current = false;
      }
    };
    redeem();
  }, [actor, isFetching, identity, code, navigate, setAuthenticated]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen flex items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "w-full max-w-md shadow-elevated", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "pt-10 pb-10 flex flex-col items-center text-center gap-5", children: [
    status === "idle" && !identity && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LogIn, { className: "w-7 h-7 text-primary" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-display font-semibold text-foreground", children: "Einladung annehmen" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-2 max-w-xs mx-auto", children: "Bitte melden Sie sich mit Internet Identity an, um die Einladung anzunehmen." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          "data-ocid": "invite-login",
          className: "mt-2 gap-2",
          onClick: () => login(),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LogIn, { className: "w-4 h-4" }),
            "Mit Internet Identity anmelden"
          ]
        }
      )
    ] }),
    status === "loading" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-12 h-12 text-primary animate-spin" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-display font-semibold text-foreground", children: "Einladung wird verarbeitet…" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Bitte warten Sie einen Moment." })
      ] })
    ] }),
    status === "idle" && !!identity && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-12 h-12 text-primary animate-spin" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-display font-semibold text-foreground", children: "Verbindung wird hergestellt…" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Bitte warten Sie einen Moment." })
      ] })
    ] }),
    status === "success" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "w-14 h-14 text-primary" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-xl font-display font-semibold text-foreground", children: [
          "Willkommen, ",
          welcomeName,
          "!"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-2 max-w-xs mx-auto", children: "Ihr Konto wurde erfolgreich verknüpft. Sie werden in Kürze zum Dashboard weitergeleitet…" })
      ] })
    ] }),
    status === "error" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "w-14 h-14 text-destructive" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-display font-semibold text-foreground", children: "Einladung fehlgeschlagen" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-2 max-w-xs mx-auto", children: errorMsg || "Einladungslink ungültig oder abgelaufen. Bitte wenden Sie sich an Ihren Administrator." })
      ] })
    ] })
  ] }) }) });
}
export {
  InvitePage as default
};
