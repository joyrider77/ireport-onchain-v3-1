import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthStore } from "@/hooks/useAuthStore";
import { useActor, useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useNavigate } from "@tanstack/react-router";
import { CheckCircle, Loader2, LogIn, XCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createActor } from "../backend";
import type { backendInterface } from "../backend.d";

export default function InvitePage() {
  const navigate = useNavigate();
  const { identity, login } = useInternetIdentity();
  const { actor, isFetching } = useActor(createActor);
  const { setAuthenticated } = useAuthStore();
  const hasRedeemedRef = useRef(false);

  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [welcomeName, setWelcomeName] = useState<string>("");

  // Get invite code from URL params
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code") ?? "";

  useEffect(() => {
    if (!code) {
      setStatus("error");
      setErrorMsg(
        "Kein Einladungscode in der URL gefunden. Bitte verwenden Sie den vollständigen Einladungslink.",
      );
      return;
    }

    // Not yet authenticated — show login prompt
    if (!identity) {
      setStatus("idle");
      return;
    }

    if (!actor || isFetching) return;

    // Prevent double redemption
    if (hasRedeemedRef.current) return;
    hasRedeemedRef.current = true;

    setStatus("loading");

    const redeem = async () => {
      try {
        const typedActor = actor as unknown as backendInterface;
        const result = await typedActor.redeemInviteCode(code);

        if (result.__kind__ === "err") {
          setStatus("error");
          const msg = result.err.includes("already")
            ? "Dieser Einladungslink wurde bereits verwendet."
            : result.err.includes("not found") || result.err.includes("invalid")
              ? "Einladungslink ungültig oder abgelaufen."
              : `Fehler: ${result.err}`;
          setErrorMsg(msg);
          hasRedeemedRef.current = false;
          return;
        }

        const emp = result.ok;
        const principal = identity.getPrincipal().toString();

        // Fetch company info to get name
        let companyName = "Ihrem Unternehmen";
        try {
          const companyResult = await typedActor.getMyCompany();
          if (companyResult.__kind__ === "ok") {
            companyName = companyResult.ok.name;
          }
        } catch {
          // Non-fatal
        }

        setAuthenticated(
          principal,
          emp.role,
          String(emp.companyId),
          String(emp.id),
          companyName,
          `${emp.firstName} ${emp.lastName}`,
        );

        setWelcomeName(`${emp.firstName} ${emp.lastName}`);
        setStatus("success");
        setTimeout(() => navigate({ to: "/dashboard" }), 3000);
      } catch (err) {
        console.error("Einladungslink-Fehler:", err);
        setStatus("error");
        setErrorMsg(
          "Ein unerwarteter Fehler ist aufgetreten. Bitte wenden Sie sich an Ihren Administrator.",
        );
        hasRedeemedRef.current = false;
      }
    };

    redeem();
  }, [actor, isFetching, identity, code, navigate, setAuthenticated]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md shadow-elevated">
        <CardContent className="pt-10 pb-10 flex flex-col items-center text-center gap-5">
          {/* Login required */}
          {status === "idle" && !identity && (
            <>
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <LogIn className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-display font-semibold text-foreground">
                  Einladung annehmen
                </h2>
                <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">
                  Bitte melden Sie sich mit Internet Identity an, um die
                  Einladung anzunehmen.
                </p>
              </div>
              <Button
                data-ocid="invite-login"
                className="mt-2 gap-2"
                onClick={() => login()}
              >
                <LogIn className="w-4 h-4" />
                Mit Internet Identity anmelden
              </Button>
            </>
          )}

          {/* Processing */}
          {status === "loading" && (
            <>
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <div>
                <h2 className="text-xl font-display font-semibold text-foreground">
                  Einladung wird verarbeitet…
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Bitte warten Sie einen Moment.
                </p>
              </div>
            </>
          )}

          {/* Waiting for actor (authenticated but actor not ready) */}
          {status === "idle" && !!identity && (
            <>
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <div>
                <h2 className="text-xl font-display font-semibold text-foreground">
                  Verbindung wird hergestellt…
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Bitte warten Sie einen Moment.
                </p>
              </div>
            </>
          )}

          {/* Success */}
          {status === "success" && (
            <>
              <CheckCircle className="w-14 h-14 text-primary" />
              <div>
                <h2 className="text-xl font-display font-semibold text-foreground">
                  Willkommen, {welcomeName}!
                </h2>
                <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">
                  Ihr Konto wurde erfolgreich verknüpft. Sie werden in Kürze zum
                  Dashboard weitergeleitet…
                </p>
              </div>
            </>
          )}

          {/* Error */}
          {status === "error" && (
            <>
              <XCircle className="w-14 h-14 text-destructive" />
              <div>
                <h2 className="text-xl font-display font-semibold text-foreground">
                  Einladung fehlgeschlagen
                </h2>
                <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">
                  {errorMsg ||
                    "Einladungslink ungültig oder abgelaufen. Bitte wenden Sie sich an Ihren Administrator."}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
