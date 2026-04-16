import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/hooks/useAuthStore";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useActor } from "@caffeineai/core-infrastructure";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createActor } from "../backend";

type AnyActor = Record<string, (...args: unknown[]) => Promise<unknown>>;
const toAny = (a: unknown): AnyActor => a as AnyActor;

interface FormData {
  companyName: string;
  firstName: string;
  lastName: string;
  email: string;
}

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { actor } = useActor(createActor);
  const { setAuthenticated, isAuthenticated, companyId } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated && companyId) {
      navigate({ to: "/dashboard" });
    }
  }, [isAuthenticated, companyId, navigate]);

  useEffect(() => {
    if (!identity) {
      navigate({ to: "/" });
    }
  }, [identity, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    // Manual validation
    if (!data.companyName || data.companyName.length < 2) {
      setError("companyName", {
        message: "Firmenname muss mindestens 2 Zeichen haben",
      });
      return;
    }
    if (!data.firstName) {
      setError("firstName", { message: "Vorname ist erforderlich" });
      return;
    }
    if (!data.lastName) {
      setError("lastName", { message: "Nachname ist erforderlich" });
      return;
    }
    if (!validateEmail(data.email)) {
      setError("email", { message: "Bitte gültige E-Mail-Adresse eingeben" });
      return;
    }

    if (!actor) {
      toast.error("Backend nicht verfügbar. Bitte versuchen Sie es erneut.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await toAny(actor).registerCompany(
        data.companyName,
        data.firstName,
        data.lastName,
        data.email,
      );

      type RegisterResult =
        | { __kind__: "ok"; ok: { id: bigint; name: string } }
        | { __kind__: "err"; err: string };
      const r = result as RegisterResult;
      if (r.__kind__ === "err") {
        throw new Error(r.err);
      }

      // Load the employee record to get the employeeId
      let employeeId: string | null = null;
      try {
        type EmployeeResult =
          | { __kind__: "ok"; ok: { id: bigint } }
          | { __kind__: "err"; err: string };
        const empResult = (await toAny(
          actor,
        ).getMyEmployee()) as EmployeeResult;
        if (empResult.__kind__ === "ok") {
          employeeId = String(empResult.ok.id);
        }
      } catch {
        // non-fatal – employeeId will be null
      }

      const principal = identity?.getPrincipal().toString() ?? "";
      setAuthenticated(
        principal,
        "admin",
        String(r.ok.id),
        employeeId,
        data.companyName,
        `${data.firstName} ${data.lastName}`,
      );
      toast.success("Unternehmen erfolgreich registriert!");
      navigate({ to: "/dashboard" });
    } catch (err) {
      console.error("Registrierungsfehler:", err);
      toast.error(
        "Registrierung fehlgeschlagen. Bitte versuchen Sie es erneut.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <Card className="shadow-elevated">
          <CardHeader className="pb-4">
            <CardTitle className="font-display text-2xl text-foreground">
              Unternehmen registrieren
            </CardTitle>
            <CardDescription>
              Erstellen Sie Ihr iReport-Konto für Ihr Unternehmen.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-5"
            >
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="companyName">Firmenname *</Label>
                <Input
                  id="companyName"
                  data-ocid="input-company-name"
                  placeholder="Muster AG"
                  {...register("companyName", {
                    required: "Firmenname ist erforderlich",
                  })}
                  aria-invalid={!!errors.companyName}
                />
                {errors.companyName && (
                  <p className="text-xs text-destructive">
                    {errors.companyName.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="firstName">Vorname *</Label>
                  <Input
                    id="firstName"
                    data-ocid="input-first-name"
                    placeholder="Max"
                    {...register("firstName", {
                      required: "Vorname ist erforderlich",
                    })}
                    aria-invalid={!!errors.firstName}
                  />
                  {errors.firstName && (
                    <p className="text-xs text-destructive">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="lastName">Nachname *</Label>
                  <Input
                    id="lastName"
                    data-ocid="input-last-name"
                    placeholder="Muster"
                    {...register("lastName", {
                      required: "Nachname ist erforderlich",
                    })}
                    aria-invalid={!!errors.lastName}
                  />
                  {errors.lastName && (
                    <p className="text-xs text-destructive">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">E-Mail-Adresse *</Label>
                <Input
                  id="email"
                  type="email"
                  data-ocid="input-email"
                  placeholder="max.muster@firma.ch"
                  {...register("email", {
                    required: "E-Mail ist erforderlich",
                  })}
                  aria-invalid={!!errors.email}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                data-ocid="register-submit"
                disabled={isSubmitting}
                className="w-full mt-2"
                size="lg"
              >
                {isSubmitting ? "Registrierung läuft…" : "Jetzt registrieren"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
