import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useActor as useActorCore } from "@caffeineai/core-infrastructure";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { createActor } from "../../backend";
import type {
  Employee,
  Role,
  UpdateEmployeeInput,
  backendInterface,
} from "../../backend.d";
import { EmploymentSection } from "./EmploymentSection";
import { TimeBalanceCorrectionSection } from "./TimeBalanceCorrectionSection";
import { VacationBalanceSection } from "./VacationBalanceSection";

type AnyActor = backendInterface;
function useTypedActor() {
  const { actor, isFetching } = useActorCore(createActor);
  return {
    actor: actor ? (actor as unknown as AnyActor) : null,
    isFetching,
  };
}

interface Props {
  employee: Employee;
  canWrite: boolean;
  onBack: () => void;
  onUpdated: (emp: Employee) => void;
}

interface PersonalForm {
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  geburtsdatum: string;
  adresseZusatz1: string;
  adresseZusatz2: string;
  strasse: string;
  postfach: string;
  plz: string;
  ort: string;
  land: string;
}

function bigintToDateStr(ts?: bigint): string {
  if (!ts || ts === BigInt(0)) return "";
  const d = new Date(Number(ts) * 1000);
  return d.toISOString().split("T")[0];
}

function dateStrToBigint(s: string): bigint | undefined {
  if (!s) return undefined;
  return BigInt(Math.floor(new Date(`${s}T00:00:00Z`).getTime() / 1000));
}

export function MitarbeiterDetail({
  employee,
  canWrite,
  onBack,
  onUpdated,
}: Props) {
  const { actor } = useTypedActor();
  const qc = useQueryClient();

  const [personalForm, setPersonalForm] = useState<PersonalForm>({
    firstName: employee.firstName,
    lastName: employee.lastName,
    email: employee.email,
    role: employee.role,
    geburtsdatum: bigintToDateStr(employee.geburtsdatum),
    adresseZusatz1: employee.adresseZusatz1 ?? "",
    adresseZusatz2: employee.adresseZusatz2 ?? "",
    strasse: employee.strasse ?? "",
    postfach: employee.postfach ?? "",
    plz: employee.plz ?? "",
    ort: employee.ort ?? "",
    land: employee.land ?? "",
  });

  const updatePersonalMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Kein Actor");
      const input: UpdateEmployeeInput = {
        firstName: personalForm.firstName,
        lastName: personalForm.lastName,
        email: personalForm.email,
        role: personalForm.role,
        geburtsdatum: dateStrToBigint(personalForm.geburtsdatum),
        adresseZusatz1: personalForm.adresseZusatz1 || undefined,
        adresseZusatz2: personalForm.adresseZusatz2 || undefined,
        strasse: personalForm.strasse || undefined,
        postfach: personalForm.postfach || undefined,
        plz: personalForm.plz || undefined,
        ort: personalForm.ort || undefined,
        land: personalForm.land || undefined,
      };
      const res = await actor.updateEmployee(employee.id, input);
      if (res.__kind__ === "err") throw new Error(res.err);
      return res.ok;
    },
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Persönliche Daten gespeichert");
      onUpdated(updated);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async (active: boolean) => {
      if (!actor) throw new Error("Kein Actor");
      const res = await actor.updateEmployee(employee.id, { active });
      if (res.__kind__ === "err") throw new Error(res.err);
      return res.ok;
    },
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: ["employees"] });
      toast.success(
        updated.active ? "Mitarbeiter aktiviert" : "Mitarbeiter deaktiviert",
      );
      onUpdated(updated);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function pf(field: keyof PersonalForm) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setPersonalForm({ ...personalForm, [field]: e.target.value });
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="gap-2 text-muted-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Zurück
        </Button>
        <div className="flex items-center gap-2 min-w-0">
          <h2 className="text-lg font-semibold truncate">
            {employee.firstName} {employee.lastName}
          </h2>
          <Badge variant={employee.active ? "default" : "secondary"}>
            {employee.active ? "Aktiv" : "Inaktiv"}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="personal" data-ocid="tab-personal">
            Persönliche Daten
          </TabsTrigger>
          <TabsTrigger value="anstellung" data-ocid="tab-anstellung">
            Anstellung / Beschäftigung
          </TabsTrigger>
          <TabsTrigger value="ferien" data-ocid="tab-ferien">
            Ferienguthaben
          </TabsTrigger>
          <TabsTrigger value="zeitsaldo" data-ocid="tab-zeitsaldo">
            Zeitsaldokorrektur
          </TabsTrigger>
          <TabsTrigger value="status" data-ocid="tab-status">
            Status
          </TabsTrigger>
        </TabsList>

        {/* ── Tab 1: Persönliche Daten ── */}
        <TabsContent value="personal" className="mt-4 space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="pd-firstName">Vorname *</Label>
              <Input
                id="pd-firstName"
                value={personalForm.firstName}
                onChange={pf("firstName")}
                disabled={!canWrite}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="pd-lastName">Nachname *</Label>
              <Input
                id="pd-lastName"
                value={personalForm.lastName}
                onChange={pf("lastName")}
                disabled={!canWrite}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="pd-email">E-Mail *</Label>
              <Input
                id="pd-email"
                type="email"
                value={personalForm.email}
                onChange={pf("email")}
                disabled={!canWrite}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="pd-geburtsdatum">Geburtsdatum</Label>
              <Input
                id="pd-geburtsdatum"
                type="date"
                value={personalForm.geburtsdatum}
                onChange={pf("geburtsdatum")}
                disabled={!canWrite}
              />
            </div>
            <div className="space-y-1">
              <Label>Rolle</Label>
              <Select
                value={personalForm.role as string}
                onValueChange={(v) =>
                  setPersonalForm({ ...personalForm, role: v as Role })
                }
                disabled={!canWrite}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrator</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="employee">Mitarbeiter</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <p className="text-sm font-medium text-muted-foreground mb-3">
              Adresse
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="pd-zusatz1">Adresse Zusatz 1</Label>
                <Input
                  id="pd-zusatz1"
                  value={personalForm.adresseZusatz1}
                  onChange={pf("adresseZusatz1")}
                  disabled={!canWrite}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="pd-zusatz2">Adresse Zusatz 2</Label>
                <Input
                  id="pd-zusatz2"
                  value={personalForm.adresseZusatz2}
                  onChange={pf("adresseZusatz2")}
                  disabled={!canWrite}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="pd-strasse">Strasse</Label>
                <Input
                  id="pd-strasse"
                  value={personalForm.strasse}
                  onChange={pf("strasse")}
                  disabled={!canWrite}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="pd-postfach">Postfach</Label>
                <Input
                  id="pd-postfach"
                  value={personalForm.postfach}
                  onChange={pf("postfach")}
                  disabled={!canWrite}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="pd-plz">PLZ</Label>
                <Input
                  id="pd-plz"
                  value={personalForm.plz}
                  onChange={pf("plz")}
                  disabled={!canWrite}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="pd-ort">Ort</Label>
                <Input
                  id="pd-ort"
                  value={personalForm.ort}
                  onChange={pf("ort")}
                  disabled={!canWrite}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="pd-land">Land</Label>
                <Input
                  id="pd-land"
                  value={personalForm.land}
                  onChange={pf("land")}
                  disabled={!canWrite}
                />
              </div>
            </div>
          </div>

          {canWrite && (
            <div className="flex justify-end pt-2">
              <Button
                onClick={() => updatePersonalMutation.mutate()}
                disabled={updatePersonalMutation.isPending}
                className="gap-2"
                data-ocid="mitarbeiter-personal-save"
              >
                <Save className="w-4 h-4" />
                {updatePersonalMutation.isPending
                  ? "Speichern..."
                  : "Speichern"}
              </Button>
            </div>
          )}
        </TabsContent>

        {/* ── Tab 2: Anstellung / Beschäftigung ── */}
        <TabsContent value="anstellung" className="mt-4">
          <EmploymentSection employeeId={employee.id} canWrite={canWrite} />
        </TabsContent>

        {/* ── Tab 3: Ferienguthaben ── */}
        <TabsContent value="ferien" className="mt-4">
          <VacationBalanceSection
            employeeId={employee.id}
            canWrite={canWrite}
          />
        </TabsContent>

        {/* ── Tab 4: Zeitsaldokorrektur ── */}
        <TabsContent value="zeitsaldo" className="mt-4">
          <TimeBalanceCorrectionSection
            employeeId={employee.id}
            canWrite={canWrite}
          />
        </TabsContent>

        {/* ── Tab 5: Status ── */}
        <TabsContent value="status" className="mt-4">
          <div className="rounded-lg border border-border p-6 space-y-4">
            <h3 className="font-medium">Mitarbeiterstatus</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">
                  {employee.active ? "Aktiv" : "Inaktiv"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {employee.active
                    ? "Der Mitarbeiter ist aktiv und kann das System nutzen."
                    : "Der Mitarbeiter ist inaktiv und hat keinen Zugang zum System."}
                </p>
              </div>
              {canWrite && (
                <Switch
                  checked={employee.active}
                  onCheckedChange={(checked) =>
                    toggleActiveMutation.mutate(checked)
                  }
                  disabled={toggleActiveMutation.isPending}
                  data-ocid="mitarbeiter-status-toggle"
                />
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
