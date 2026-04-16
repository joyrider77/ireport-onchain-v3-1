import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuthStore";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, Globe, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { createActor } from "../../backend";
import type { Company, CompanySettings } from "../../backend.d";

type AnyActor = Record<string, (...args: unknown[]) => Promise<unknown>>;
const toAny = (a: unknown): AnyActor => a as AnyActor;

interface FirmaForm {
  name: string;
  taxId: string;
  address: string;
  logoUrl: string;
}

const TIMEZONE_OPTIONS: { value: string; label: string }[] = [
  { value: "Europe/Zurich", label: "Europa/Zürich (CET/CEST)" },
  { value: "Europe/Berlin", label: "Europa/Berlin (CET/CEST)" },
  { value: "Europe/London", label: "Europa/London (GMT/BST)" },
  { value: "Europe/Paris", label: "Europa/Paris (CET/CEST)" },
  { value: "UTC", label: "UTC (Koordinierte Weltzeit)" },
  { value: "America/New_York", label: "Amerika/New York (EST/EDT)" },
];

export function FirmaTab() {
  const { role, setCompanyLogo } = useAuth();
  const canWrite = role === "admin";
  const { actor, isFetching } = useActor(createActor);
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<FirmaForm>({
    name: "",
    taxId: "",
    address: "",
    logoUrl: "",
  });
  const [nameError, setNameError] = useState("");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [timezone, setTimezone] = useState("Europe/Zurich");

  const { data: company, isLoading } = useQuery<Company | null>({
    queryKey: ["company"],
    queryFn: async () => {
      if (!actor) return null;
      try {
        const res = await toAny(actor).getMyCompany();
        const r = res as { __kind__: string; err?: string; ok?: Company };
        if (r.__kind__ === "err") return null;
        return r.ok ?? null;
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching,
  });

  const { data: companySettings, isLoading: settingsLoading } =
    useQuery<CompanySettings | null>({
      queryKey: ["companySettings"],
      queryFn: async () => {
        if (!actor) return null;
        try {
          const res = await toAny(actor).getCompanySettings();
          const r = res as {
            __kind__: string;
            ok?: CompanySettings;
          };
          return r.__kind__ === "ok" ? (r.ok ?? null) : null;
        } catch {
          return null;
        }
      },
      enabled: !!actor && !isFetching,
    });

  useEffect(() => {
    if (company) {
      setForm({
        name: company.name,
        taxId: company.taxId ?? "",
        address: company.address ?? "",
        logoUrl: company.logoUrl ?? "",
      });
      if (company.logoUrl) setLogoPreview(company.logoUrl);
    }
  }, [company]);

  useEffect(() => {
    if (companySettings?.timezone) {
      setTimezone(companySettings.timezone);
    }
  }, [companySettings]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Kein Actor");
      // Save company info
      const res = await toAny(actor).updateCompany({
        name: form.name || undefined,
        taxId: form.taxId || undefined,
        address: form.address || undefined,
        logoUrl: form.logoUrl || undefined,
      });
      const r = res as { __kind__: string; err?: string; ok?: Company };
      if (r.__kind__ === "err") throw new Error(r.err ?? "Fehler");

      // Save timezone in company settings
      if (companySettings) {
        const settingsRes = await toAny(actor).updateCompanySettings({
          ...companySettings,
          timezone,
        });
        const sr = settingsRes as { __kind__: string; err?: string };
        if (sr.__kind__ === "err")
          throw new Error(sr.err ?? "Fehler beim Speichern der Zeitzone");
      }

      return r.ok;
    },
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: ["company"] });
      qc.invalidateQueries({ queryKey: ["companySettings"] });
      const updatedCompany = updated as Company | undefined;
      if (updatedCompany?.logoUrl) {
        setCompanyLogo(updatedCompany.logoUrl);
      }
      toast.success("Firmendaten gespeichert");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      setLogoPreview(url);
      setForm((prev) => ({ ...prev, logoUrl: url }));
    };
    reader.readAsDataURL(file);
  }

  function handleSubmit() {
    if (!form.name.trim()) {
      setNameError("Pflichtfeld");
      return;
    }
    setNameError("");
    saveMutation.mutate();
  }

  if (isLoading || settingsLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="w-5 h-5 text-primary" />
            Firmeninformationen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Logo */}
          <div className="space-y-2">
            <Label>Firmenlogo</Label>
            <div className="flex items-center gap-4">
              <div className="w-24 h-16 rounded-lg border border-border bg-muted/30 flex items-center justify-center overflow-hidden">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Firmenlogo"
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <Building2 className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              {canWrite && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    data-ocid="firma-logo-upload"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4" />
                    Logo hochladen
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoChange}
                    aria-label="Logo hochladen"
                  />
                </>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              JPG, PNG oder SVG, max. 2 MB. Wird sofort im Header angezeigt.
            </p>
          </div>

          {/* Name */}
          <div className="space-y-1">
            <Label htmlFor="fname">Firmenname *</Label>
            <Input
              id="fname"
              data-ocid="firma-name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              disabled={!canWrite}
            />
            {nameError && (
              <p className="text-xs text-destructive">{nameError}</p>
            )}
          </div>

          {/* Tax ID */}
          <div className="space-y-1">
            <Label htmlFor="ftaxid">Steuer-ID / MWST-Nummer</Label>
            <Input
              id="ftaxid"
              data-ocid="firma-taxid"
              value={form.taxId}
              onChange={(e) => setForm({ ...form, taxId: e.target.value })}
              disabled={!canWrite}
              placeholder="CHE-123.456.789 MWST"
            />
          </div>

          {/* Address */}
          <div className="space-y-1">
            <Label htmlFor="faddress">Adresse</Label>
            <Input
              id="faddress"
              data-ocid="firma-address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              disabled={!canWrite}
              placeholder="Musterstrasse 1, 8001 Zürich"
            />
          </div>
        </CardContent>
      </Card>

      {/* Timezone Card */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Globe className="w-5 h-5 text-primary" />
            Zeitzone
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="ftz">Firmen-Zeitzone</Label>
            <Select
              value={timezone}
              onValueChange={setTimezone}
              disabled={!canWrite}
            >
              <SelectTrigger id="ftz" data-ocid="firma-timezone">
                <SelectValue placeholder="Zeitzone wählen" />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONE_OPTIONS.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Die Zeitzone wird für alle Datumsanzeigen verwendet (Dashboard,
              Kalender, Zeiterfassung).
            </p>
          </div>
        </CardContent>
      </Card>

      {canWrite && (
        <div className="flex justify-end">
          <Button
            type="button"
            data-ocid="firma-save"
            onClick={handleSubmit}
            disabled={saveMutation.isPending}
            className="min-w-[160px]"
          >
            {saveMutation.isPending ? "Speichern..." : "Änderungen speichern"}
          </Button>
        </div>
      )}

      {!canWrite && (
        <p className="text-sm text-muted-foreground">
          Nur Administratoren können Firmendaten bearbeiten.
        </p>
      )}
    </div>
  );
}
