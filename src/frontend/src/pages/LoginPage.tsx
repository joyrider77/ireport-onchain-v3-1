import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/hooks/useAuthStore";
import { useActor, useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { createActor } from "../backend";
import type { Company, Employee } from "../backend.d";

type AnyActor = Record<string, (...args: unknown[]) => Promise<unknown>>;
const toAny = (a: unknown): AnyActor => a as AnyActor;

type BackendResult<T> =
  | { __kind__: "ok"; ok: T }
  | { __kind__: "err"; err: string };

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, clear, identity } = useInternetIdentity();
  const { actor, isFetching: isActorFetching } = useActor(createActor);
  const {
    isAuthenticated,
    role,
    companyId,
    setAuthenticated,
    setLoading,
    setPlatformAdmin,
    logout,
  } = useAuthStore();

  const [backendError, setBackendError] = useState<string | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const [accountDisabled, setAccountDisabled] = useState(false);
  const isInitializing = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Redirect once auth store is fully populated ──────────────────────────
  // IMPORTANT: accountDisabled must block this redirect. If the employee is
  // deactivated, we must NOT navigate to /dashboard even if isAuthenticated=true.
  useEffect(() => {
    if (accountDisabled) return; // Never redirect a deactivated user
    if (isAuthenticated && role && companyId) {
      navigate({ to: "/dashboard" });
    } else if (isAuthenticated && (!role || !companyId)) {
      setBackendError(
        "Dieses Konto ist noch nicht registriert. Bitte wählen Sie einen Plan auf der Startseite aus, um sich zu registrieren.",
      );
    }
  }, [isAuthenticated, role, companyId, navigate, accountDisabled]);

  // ── After II success: load user data from backend ────────────────────────
  const initializeSession = useCallback(async () => {
    if (!actor || isActorFetching || isInitializing.current) return;
    isInitializing.current = true;
    setLoading(true);
    setBackendError(null);
    setTimedOut(false);
    setAccountDisabled(false);

    // Start 10-second safety timeout
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (isInitializing.current) {
        isInitializing.current = false;
        setLoading(false);
        setTimedOut(true);
      }
    }, 10000);

    try {
      const registered = (await toAny(actor).isRegistered()) as boolean;

      if (!registered) {
        clearTimeout(timeoutRef.current!);
        setLoading(false);
        isInitializing.current = false;
        setBackendError(
          "Dieses Konto ist noch nicht registriert. Bitte wählen Sie einen Plan auf der Startseite aus, um sich zu registrieren.",
        );
        return;
      }

      const [companyResult, employeeResult] = await Promise.all([
        toAny(actor).getMyCompany() as Promise<BackendResult<Company>>,
        toAny(actor).getMyEmployee() as Promise<BackendResult<Employee>>,
      ]);

      clearTimeout(timeoutRef.current!);

      if (companyResult.__kind__ !== "ok") {
        throw new Error(
          companyResult.__kind__ === "err"
            ? companyResult.err
            : "Unbekannter Fehler beim Laden der Firmendaten",
        );
      }
      if (employeeResult.__kind__ !== "ok") {
        throw new Error(
          employeeResult.__kind__ === "err"
            ? employeeResult.err
            : "Unbekannter Fehler beim Laden der Mitarbeiterdaten",
        );
      }

      const company = companyResult.ok;
      const employee = employeeResult.ok;

      // Block deactivated employees from logging in.
      // CRITICAL ORDER: set accountDisabled=true FIRST, THEN call logout/clear.
      // This ensures the redirect useEffect (which checks accountDisabled)
      // sees the flag before isAuthenticated changes trigger a re-render.
      if (!employee.active) {
        clearTimeout(timeoutRef.current!);
        setAccountDisabled(true); // ← must be first
        setLoading(false);
        isInitializing.current = false;
        // Now clear II session and store — the redirect guard is already up
        logout();
        clear();
        // Also clear localStorage to prevent cached session from being reused
        try {
          localStorage.removeItem("ireport-auth");
        } catch {
          // ignore
        }
        return;
      }

      const principal = identity?.getPrincipal().toString() ?? "";
      const appRole = employee.role as "admin" | "manager" | "employee";

      setAuthenticated(
        principal,
        appRole,
        String(company.id),
        String(employee.id),
        company.name,
        `${employee.firstName} ${employee.lastName}`,
        company.logoUrl ?? null,
      );
      // Check Platform Admin status after authentication
      try {
        const platformAdminResult = (await toAny(
          actor,
        ).isPlatformAdmin()) as boolean;
        setPlatformAdmin(platformAdminResult);
      } catch (e) {
        console.warn("isPlatformAdmin check fehlgeschlagen:", e);
        setPlatformAdmin(false);
      }
      // Navigate immediately — do NOT rely on useEffect to trigger this
      navigate({ to: "/dashboard" });
    } catch (err) {
      clearTimeout(timeoutRef.current!);
      console.error("Fehler beim Laden der Benutzerdaten:", err);
      setBackendError(
        "Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.",
      );
      setLoading(false);
      isInitializing.current = false;
    }
  }, [
    actor,
    isActorFetching,
    identity,
    setAuthenticated,
    setPlatformAdmin,
    setLoading,
    navigate,
    clear,
    logout,
  ]);

  // Trigger session init whenever identity AND actor are both ready.
  useEffect(() => {
    if (identity && actor && !isActorFetching && !isAuthenticated) {
      void initializeSession();
    }
  }, [identity, actor, isActorFetching, isAuthenticated, initializeSession]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // ── UI states ─────────────────────────────────────────────────────────────
  const handleLogin = () => {
    setBackendError(null);
    setTimedOut(false);
    setAccountDisabled(false);
    isInitializing.current = false;
    login();
  };

  const handleRetry = () => {
    isInitializing.current = false;
    setBackendError(null);
    setTimedOut(false);
    setAccountDisabled(false);
    void initializeSession();
  };

  const handleReset = () => {
    isInitializing.current = false;
    setBackendError(null);
    setTimedOut(false);
    setAccountDisabled(false);
    navigate({ to: "/" });
  };

  // Show spinner while identity is set (II popup resolved) but session isn't ready yet
  const showSpinner =
    !!identity &&
    !isAuthenticated &&
    !backendError &&
    !timedOut &&
    !accountDisabled;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-background px-4"
      data-ocid="login-page"
    >
      <div className="w-full max-w-sm flex flex-col items-center gap-8">
        {/* Logo */}
        <a
          href="https://www.ireport.ch"
          target="_blank"
          rel="noopener noreferrer"
          className="block"
          aria-label="iReport Webseite"
        >
          <img
            src="/assets/logo_transparent.png"
            alt="iReport Logo"
            className="w-56 h-auto"
          />
        </a>

        {/* Login Card */}
        <Card className="w-full shadow-elevated">
          <CardContent className="pt-8 pb-8 px-8 flex flex-col items-center gap-6">
            <div className="text-center space-y-1">
              <h1 className="text-2xl font-display font-bold text-foreground">
                Willkommen bei iReport
              </h1>
              <p className="text-sm text-muted-foreground">
                HR &amp; Zeiterfassung für Schweizer Unternehmen
              </p>
            </div>

            <div className="w-full h-px bg-border" />

            {showSpinner ? (
              <div
                className="w-full flex flex-col items-center gap-3"
                data-ocid="login-loading"
              >
                <Skeleton className="h-10 w-full" />
                <p className="text-xs text-muted-foreground">
                  Anmeldung läuft…
                </p>
              </div>
            ) : timedOut ? (
              <div
                className="w-full flex flex-col items-center gap-3"
                data-ocid="login-timeout"
              >
                <p className="text-sm text-destructive text-center">
                  Die Anmeldung hat zu lange gedauert. Bitte erneut versuchen.
                </p>
                <Button
                  onClick={handleRetry}
                  data-ocid="login-retry-button"
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  Erneut versuchen
                </Button>
                <Button
                  onClick={handleReset}
                  data-ocid="login-reset-button"
                  variant="ghost"
                  className="w-full text-sm"
                  size="sm"
                >
                  Zurück zur Startseite
                </Button>
              </div>
            ) : accountDisabled ? (
              <div
                className="w-full flex flex-col items-center gap-3"
                data-ocid="login-account-disabled"
              >
                <div className="w-full rounded-md bg-destructive/10 border border-destructive/30 p-4">
                  <p className="text-sm text-destructive text-center leading-relaxed font-medium">
                    Dein Konto ist deaktiviert.
                  </p>
                  <p className="text-sm text-destructive/80 text-center leading-relaxed mt-1">
                    Bitte wende dich an deinen Vorgesetzten oder den
                    iReport-Verantwortlichen deiner Firma.
                  </p>
                </div>
                <Button
                  onClick={handleLogin}
                  data-ocid="login-button-after-disabled"
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  Mit anderem Konto anmelden
                </Button>
              </div>
            ) : backendError ? (
              <div
                className="w-full flex flex-col items-center gap-3"
                data-ocid="login-error"
              >
                <p className="text-sm text-destructive text-center">
                  {backendError}
                </p>
                <Button
                  onClick={() =>
                    navigate({ to: "/", search: { scroll: "pricing" } })
                  }
                  data-ocid="login-back-to-home-button"
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  Zurück zur Startseite
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleLogin}
                data-ocid="login-button"
                className="w-full"
                size="lg"
              >
                Anmelden mit Internet Identity
              </Button>
            )}

            <p className="text-xs text-muted-foreground text-center leading-relaxed">
              Durch die Anmeldung stimmen Sie den{" "}
              <a
                href="/nutzungsbedingungen"
                className="text-primary cursor-pointer hover:underline"
              >
                Nutzungsbedingungen
              </a>{" "}
              zu.
            </p>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-xs text-muted-foreground text-center">
          © {new Date().getFullYear()}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
              window.location.hostname,
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            Built with love using caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}
