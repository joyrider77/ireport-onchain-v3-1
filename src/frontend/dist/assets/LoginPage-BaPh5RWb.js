import { a as useNavigate, u as useInternetIdentity, r as reactExports, j as jsxRuntimeExports, S as Skeleton } from "./index-CzAnGejr.js";
import { B as Button } from "./button-De0KTRQr.js";
import { C as Card, a as CardContent } from "./card-RwdUJxIK.js";
import { u as useAuthStore } from "./useAuthStore-Ba33VUEX.js";
import { a as useActor, c as createActor } from "./backend-BNIvB4__.js";
const toAny = (a) => a;
function LoginPage() {
  const navigate = useNavigate();
  const { login, identity } = useInternetIdentity();
  const { actor, isFetching: isActorFetching } = useActor(createActor);
  const { isAuthenticated, role, companyId, setAuthenticated, setLoading } = useAuthStore();
  const [backendError, setBackendError] = reactExports.useState(null);
  const [timedOut, setTimedOut] = reactExports.useState(false);
  const isInitializing = reactExports.useRef(false);
  const timeoutRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    if (isAuthenticated && role && companyId) {
      navigate({ to: "/dashboard" });
    } else if (isAuthenticated && (!role || !companyId)) {
      navigate({ to: "/register" });
    }
  }, [isAuthenticated, role, companyId, navigate]);
  const initializeSession = reactExports.useCallback(async () => {
    if (!actor || isActorFetching || isInitializing.current) return;
    isInitializing.current = true;
    setLoading(true);
    setBackendError(null);
    setTimedOut(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (isInitializing.current) {
        isInitializing.current = false;
        setLoading(false);
        setTimedOut(true);
      }
    }, 1e4);
    try {
      const registered = await toAny(actor).isRegistered();
      if (!registered) {
        clearTimeout(timeoutRef.current);
        setLoading(false);
        isInitializing.current = false;
        navigate({ to: "/register" });
        return;
      }
      const [companyResult, employeeResult] = await Promise.all([
        toAny(actor).getMyCompany(),
        toAny(actor).getMyEmployee()
      ]);
      clearTimeout(timeoutRef.current);
      if (companyResult.__kind__ !== "ok") {
        throw new Error(
          companyResult.__kind__ === "err" ? companyResult.err : "Unbekannter Fehler beim Laden der Firmendaten"
        );
      }
      if (employeeResult.__kind__ !== "ok") {
        throw new Error(
          employeeResult.__kind__ === "err" ? employeeResult.err : "Unbekannter Fehler beim Laden der Mitarbeiterdaten"
        );
      }
      const company = companyResult.ok;
      const employee = employeeResult.ok;
      const principal = (identity == null ? void 0 : identity.getPrincipal().toString()) ?? "";
      const appRole = employee.role;
      setAuthenticated(
        principal,
        appRole,
        String(company.id),
        String(employee.id),
        company.name,
        `${employee.firstName} ${employee.lastName}`,
        company.logoUrl ?? null
      );
      navigate({ to: "/dashboard" });
    } catch (err) {
      clearTimeout(timeoutRef.current);
      console.error("Fehler beim Laden der Benutzerdaten:", err);
      setBackendError(
        "Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut."
      );
      setLoading(false);
      isInitializing.current = false;
    }
  }, [
    actor,
    isActorFetching,
    identity,
    setAuthenticated,
    setLoading,
    navigate
  ]);
  reactExports.useEffect(() => {
    if (identity && actor && !isActorFetching && !isAuthenticated) {
      void initializeSession();
    }
  }, [identity, actor, isActorFetching, isAuthenticated, initializeSession]);
  reactExports.useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);
  const handleLogin = () => {
    setBackendError(null);
    setTimedOut(false);
    isInitializing.current = false;
    login();
  };
  const handleRetry = () => {
    isInitializing.current = false;
    setBackendError(null);
    setTimedOut(false);
    void initializeSession();
  };
  const handleReset = () => {
    isInitializing.current = false;
    setBackendError(null);
    setTimedOut(false);
    navigate({ to: "/" });
  };
  const showSpinner = !!identity && !isAuthenticated && !backendError && !timedOut;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: "min-h-screen flex flex-col items-center justify-center bg-background px-4",
      "data-ocid": "login-page",
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-sm flex flex-col items-center gap-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "a",
          {
            href: "https://www.ireport.ch",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block",
            "aria-label": "iReport Webseite",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "img",
              {
                src: "/assets/logo_transparent.png",
                alt: "iReport Logo",
                className: "w-56 h-auto"
              }
            )
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "w-full shadow-elevated", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "pt-8 pb-8 px-8 flex flex-col items-center gap-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-display font-bold text-foreground", children: "Willkommen bei iReport" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "HR & Zeiterfassung für Schweizer Unternehmen" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full h-px bg-border" }),
          showSpinner ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "w-full flex flex-col items-center gap-3",
              "data-ocid": "login-loading",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-10 w-full" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Anmeldung läuft…" })
              ]
            }
          ) : timedOut ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "w-full flex flex-col items-center gap-3",
              "data-ocid": "login-timeout",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-destructive text-center", children: "Die Anmeldung hat zu lange gedauert. Bitte erneut versuchen." }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    onClick: handleRetry,
                    "data-ocid": "login-retry-button",
                    variant: "outline",
                    className: "w-full",
                    size: "lg",
                    children: "Erneut versuchen"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    onClick: handleReset,
                    "data-ocid": "login-reset-button",
                    variant: "ghost",
                    className: "w-full text-sm",
                    size: "sm",
                    children: "Zurück zur Startseite"
                  }
                )
              ]
            }
          ) : backendError ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "w-full flex flex-col items-center gap-3",
              "data-ocid": "login-error",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-destructive text-center", children: backendError }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    onClick: handleRetry,
                    "data-ocid": "login-retry-button",
                    variant: "outline",
                    className: "w-full",
                    size: "lg",
                    children: "Erneut versuchen"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    onClick: handleLogin,
                    "data-ocid": "login-button-after-error",
                    variant: "ghost",
                    className: "w-full text-sm",
                    size: "sm",
                    children: "Mit anderem Konto anmelden"
                  }
                )
              ]
            }
          ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              onClick: handleLogin,
              "data-ocid": "login-button",
              className: "w-full",
              size: "lg",
              children: "Anmelden mit Internet Identity"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground text-center leading-relaxed", children: [
            "Durch die Anmeldung stimmen Sie den",
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "a",
              {
                href: "/nutzungsbedingungen",
                className: "text-primary cursor-pointer hover:underline",
                children: "Nutzungsbedingungen"
              }
            ),
            " ",
            "zu."
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground text-center", children: [
          "© ",
          (/* @__PURE__ */ new Date()).getFullYear(),
          ".",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "a",
            {
              href: `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                window.location.hostname
              )}`,
              target: "_blank",
              rel: "noopener noreferrer",
              className: "hover:text-primary transition-colors",
              children: "Built with love using caffeine.ai"
            }
          )
        ] })
      ] })
    }
  );
}
export {
  LoginPage as default
};
