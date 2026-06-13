import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/hooks/useAuthStore";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2, UserPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { createActor } from "../../backend";
import { Erfassungsart, type Result_32, type Result_33 } from "../../backend.d";
import type {
  Customer,
  Employee,
  Project,
  ProjectMemberAssignment,
  ProjectStatus,
  ServiceType,
} from "../../backend.d";

type AnyActor = Record<string, (...args: unknown[]) => Promise<unknown>>;
const toAny = (a: unknown): AnyActor => a as AnyActor;

type StatusKey = "aktiv" | "inaktiv" | "abgeschlossen";

const STATUS_LABELS: Record<StatusKey, string> = {
  aktiv: "Aktiv",
  inaktiv: "Inaktiv",
  abgeschlossen: "Abgeschlossen",
};

const STATUS_BADGE: Record<StatusKey, string> = {
  aktiv: "bg-emerald-100 text-emerald-800 border-emerald-200",
  inaktiv: "bg-muted text-muted-foreground border-border",
  abgeschlossen: "bg-blue-100 text-blue-800 border-blue-200",
};

interface MemberRow {
  _key: number;
  employeeId: string;
  serviceTypeId: string;
  stundensatz: number;
  kostendachCHF: string;
}

let _memberKeyCounter = 0;
const newMemberRow = (): MemberRow => ({
  _key: ++_memberKeyCounter,
  employeeId: "",
  serviceTypeId: "",
  stundensatz: 0,
  kostendachCHF: "",
});

interface ProjectForm {
  code: string;
  kurzbezeichnung: string;
  name: string;
  customerId: string;
  projektleiter: string;
  status: StatusKey;
  billableRate: number;
  active: boolean;
  erfassungsart: "dauer" | "zeitBlock";
  kostendachCHF: string;
}

const defaultForm: ProjectForm = {
  code: "",
  kurzbezeichnung: "",
  name: "",
  customerId: "",
  projektleiter: "",
  status: "aktiv",
  billableRate: 0,
  active: true,
  erfassungsart: "dauer",
  kostendachCHF: "",
};

export function ProjekteTab() {
  const { role } = useAuth();
  const canWrite = role === "admin" || role === "manager";
  const { actor, isFetching } = useActor(createActor);
  const qc = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<Project | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [form, setForm] = useState<ProjectForm>(defaultForm);
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [aufwendungen, setAufwendungen] = useState<number | null>(null);
  const [aufwendungenLoading, setAufwendungenLoading] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof ProjectForm, string>>
  >({});

  const enabled = !!actor && !isFetching;

  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: async () => {
      if (!actor) return [];
      return toAny(actor).listProjects() as Promise<Project[]>;
    },
    enabled,
  });

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["customers"],
    queryFn: async () => {
      if (!actor) return [];
      return toAny(actor).listCustomers() as Promise<Customer[]>;
    },
    enabled,
  });

  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ["employees"],
    queryFn: async () => {
      if (!actor) return [];
      return toAny(actor).listEmployees() as Promise<Employee[]>;
    },
    enabled,
  });

  const { data: serviceTypes = [] } = useQuery<ServiceType[]>({
    queryKey: ["serviceTypes"],
    queryFn: async () => {
      if (!actor) return [];
      return toAny(actor).listServiceTypes() as Promise<ServiceType[]>;
    },
    enabled,
  });

  const customerMap = new Map(customers.map((c) => [String(c.id), c.name]));
  const employeeMap = new Map(
    employees.map((e) => [String(e.id), `${e.firstName} ${e.lastName}`]),
  );

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Kein Actor");

      const kostendachVal = form.kostendachCHF.trim()
        ? Number.parseFloat(form.kostendachCHF.replace(/'/g, ""))
        : undefined;

      const baseInput = {
        code: form.code,
        kurzbezeichnung: form.kurzbezeichnung,
        name: form.name,
        customerId: BigInt(form.customerId),
        projektleiter: form.projektleiter
          ? BigInt(form.projektleiter)
          : undefined,
        status: form.status as ProjectStatus,
        billableRate: form.billableRate,
        active: form.active,
        erfassungsart:
          form.erfassungsart === "zeitBlock"
            ? Erfassungsart.zeitBlock
            : Erfassungsart.dauer,
        kostendachCHF: kostendachVal,
      };

      let projectId: bigint;

      if (editItem) {
        const res = await toAny(actor).updateProject(editItem.id, baseInput);
        const r = res as { __kind__: string; err?: string; ok?: Project };
        if (r.__kind__ === "err")
          throw new Error(r.err ?? "Fehler beim Aktualisieren");
        projectId = editItem.id;
      } else {
        const res = await toAny(actor).createProject(baseInput);
        const r = res as { __kind__: string; err?: string; ok?: Project };
        if (r.__kind__ === "err")
          throw new Error(r.err ?? "Fehler beim Erstellen");
        projectId = (r.ok as Project).id;
      }

      const memberAssignments: ProjectMemberAssignment[] = members
        .filter((m) => m.employeeId && m.serviceTypeId)
        .map((m) => ({
          employeeId: BigInt(m.employeeId),
          serviceTypeId: BigInt(m.serviceTypeId),
          stundensatz: m.stundensatz,
          kostendachCHF: m.kostendachCHF.trim()
            ? Number.parseFloat(m.kostendachCHF.replace(/'/g, ""))
            : undefined,
        }));

      const membRes = await toAny(actor).setProjectMembers(
        projectId,
        memberAssignments,
      );
      const mr = membRes as { __kind__: string; err?: string };
      if (mr.__kind__ === "err")
        throw new Error(mr.err ?? "Fehler bei Mitarbeiterzuordnung");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      toast.success(editItem ? "Projekt aktualisiert" : "Projekt erstellt");
      setDialogOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Kein Actor");
      const res = await toAny(actor).deleteProject(id);
      const r = res as { __kind__: string; err?: string };
      if (r.__kind__ === "err") throw new Error(r.err ?? "Fehler");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Projekt gelöscht");
      setDeleteTarget(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function validate(): boolean {
    const errs: Partial<Record<keyof ProjectForm, string>> = {};
    if (!form.code.trim()) errs.code = "Pflichtfeld";
    if (!form.name.trim()) errs.name = "Pflichtfeld";
    if (!form.customerId) errs.customerId = "Pflichtfeld";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function openAdd() {
    setEditItem(null);
    setForm(defaultForm);
    setMembers([]);
    setAufwendungen(null);
    setErrors({});
    setDialogOpen(true);
  }

  async function openEdit(p: Project) {
    setEditItem(p);
    setForm({
      code: p.code,
      kurzbezeichnung: p.kurzbezeichnung ?? "",
      name: p.name,
      customerId: String(p.customerId),
      projektleiter: p.projektleiter != null ? String(p.projektleiter) : "",
      status: (p.status as StatusKey) ?? "aktiv",
      billableRate: p.billableRate,
      active: p.active,
      erfassungsart:
        p.erfassungsart === Erfassungsart.zeitBlock ? "zeitBlock" : "dauer",
      kostendachCHF: p.kostendachCHF != null ? String(p.kostendachCHF) : "",
    });
    setAufwendungen(null);
    setErrors({});

    if (actor) {
      // Load members
      try {
        const res = await toAny(actor).getProjectMembers(p.id);
        const r = res as { __kind__: string; ok?: ProjectMemberAssignment[] };
        if (r.__kind__ === "ok" && r.ok) {
          setMembers(
            r.ok.map((m) => ({
              employeeId: String(m.employeeId),
              serviceTypeId: String(m.serviceTypeId),
              stundensatz: m.stundensatz,
              kostendachCHF:
                m.kostendachCHF != null ? String(m.kostendachCHF) : "",
              _key: ++_memberKeyCounter,
            })),
          );
        } else {
          setMembers([]);
        }
      } catch {
        setMembers([]);
      }

      // Load Aufwendungen
      setAufwendungenLoading(true);
      try {
        const aufRes = (await actor.getProjectAufwendungen(p.id)) as Result_33;
        if (aufRes.__kind__ === "ok") {
          setAufwendungen(aufRes.ok);
        } else {
          setAufwendungen(null);
        }
      } catch {
        setAufwendungen(null);
      } finally {
        setAufwendungenLoading(false);
      }
    }

    setDialogOpen(true);
  }

  function addMemberRow() {
    setMembers((prev) => [...prev, newMemberRow()]);
  }

  function updateMember(index: number, patch: Partial<MemberRow>) {
    setMembers((prev) =>
      prev.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    );
  }

  function removeMember(index: number) {
    setMembers((prev) => prev.filter((_, i) => i !== index));
  }

  const statusKey = (p: Project): StatusKey =>
    (p.status as StatusKey) ?? "aktiv";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {projects.length} Projekte
        </p>
        {canWrite && (
          <Button
            type="button"
            data-ocid="projekte-add"
            onClick={openAdd}
            size="sm"
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Projekt hinzufügen
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Name</TableHead>
                <TableHead>Kurzbezeichnung</TableHead>
                <TableHead>Kunde</TableHead>
                <TableHead>Projektleiter</TableHead>
                <TableHead>Erfassungsart</TableHead>
                <TableHead>Status</TableHead>
                {canWrite && (
                  <TableHead className="text-right">Aktionen</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={canWrite ? 7 : 6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Keine Projekte vorhanden
                  </TableCell>
                </TableRow>
              ) : (
                projects.map((p) => (
                  <TableRow key={String(p.id)} data-ocid="projekte-row">
                    <TableCell className="font-medium">
                      <div>{p.name}</div>
                      <div className="text-xs text-muted-foreground font-mono">
                        {p.code}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {p.kurzbezeichnung || "–"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {customerMap.get(String(p.customerId)) ?? "–"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {p.projektleiter != null
                        ? (employeeMap.get(String(p.projektleiter)) ?? "–")
                        : "–"}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border border-border bg-muted/50 text-muted-foreground">
                        {p.erfassungsart === Erfassungsart.zeitBlock
                          ? "Zeit-Block"
                          : "Dauer"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_BADGE[statusKey(p)]}`}
                      >
                        {STATUS_LABELS[statusKey(p)]}
                      </span>
                    </TableCell>
                    {canWrite && (
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openEdit(p)}
                            aria-label="Bearbeiten"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => setDeleteTarget(p)}
                            aria-label="Löschen"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editItem ? "Projekt bearbeiten" : "Projekt hinzufügen"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            {/* Row 1: Name + Kurzbezeichnung */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="pname">Name *</Label>
                <Input
                  id="pname"
                  data-ocid="projekte-name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="pkurz">Kurzbezeichnung</Label>
                <Input
                  id="pkurz"
                  data-ocid="projekte-kurzbezeichnung"
                  value={form.kurzbezeichnung}
                  onChange={(e) =>
                    setForm({ ...form, kurzbezeichnung: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Row 2: Code */}
            <div className="space-y-1">
              <Label htmlFor="pcode">Code *</Label>
              <Input
                id="pcode"
                data-ocid="projekte-code"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
              />
              {errors.code && (
                <p className="text-xs text-destructive">{errors.code}</p>
              )}
            </div>

            {/* Row 3: Kunde */}
            <div className="space-y-1">
              <Label>Kunde *</Label>
              <Select
                value={form.customerId}
                onValueChange={(v) => setForm({ ...form, customerId: v })}
              >
                <SelectTrigger data-ocid="projekte-customer">
                  <SelectValue placeholder="Kunde wählen..." />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((c) => (
                    <SelectItem key={String(c.id)} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.customerId && (
                <p className="text-xs text-destructive">{errors.customerId}</p>
              )}
            </div>

            {/* Row 4: Projektleiter + Status */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Projektleiter</Label>
                <Select
                  value={form.projektleiter}
                  onValueChange={(v) =>
                    setForm({
                      ...form,
                      projektleiter: v === "__none__" ? "" : v,
                    })
                  }
                >
                  <SelectTrigger data-ocid="projekte-projektleiter">
                    <SelectValue placeholder="Projektleiter wählen..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">
                      – Kein Projektleiter –
                    </SelectItem>
                    {employees.map((e) => (
                      <SelectItem key={String(e.id)} value={String(e.id)}>
                        {e.firstName} {e.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) =>
                    setForm({ ...form, status: v as StatusKey })
                  }
                >
                  <SelectTrigger data-ocid="projekte-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aktiv">Aktiv</SelectItem>
                    <SelectItem value="inaktiv">Inaktiv</SelectItem>
                    <SelectItem value="abgeschlossen">Abgeschlossen</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 5: Erfassungsart */}
            <div className="space-y-1">
              <Label>Erfassungsart</Label>
              <Select
                value={form.erfassungsart}
                onValueChange={(v) =>
                  setForm({
                    ...form,
                    erfassungsart: v as "dauer" | "zeitBlock",
                  })
                }
              >
                <SelectTrigger data-ocid="projekte-erfassungsart">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dauer">Dauer (hh:mm)</SelectItem>
                  <SelectItem value="zeitBlock">
                    Zeit-Block (von/bis hh:mm)
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {form.erfassungsart === "zeitBlock"
                  ? "Zeiteinträge werden mit Von- und Bis-Zeit erfasst"
                  : "Zeiteinträge werden als Dauer in hh:mm erfasst"}
              </p>
            </div>

            {/* Row 6: Budget */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="pkostendach">Kostendach (CHF)</Label>
                <Input
                  id="pkostendach"
                  data-ocid="projekte-kostendach"
                  type="number"
                  min={0}
                  step={0.01}
                  placeholder="0.00"
                  value={form.kostendachCHF}
                  onChange={(e) =>
                    setForm({ ...form, kostendachCHF: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Gesamtbudget des Projekts in CHF
                </p>
              </div>
              {editItem && (
                <div className="space-y-1">
                  <Label>Aufwendungen (CHF)</Label>
                  <div
                    data-ocid="projekte-aufwendungen"
                    className="flex h-9 items-center rounded-md border border-input bg-muted/30 px-3 text-sm font-mono"
                  >
                    {aufwendungenLoading
                      ? "Wird berechnet…"
                      : aufwendungen != null
                        ? aufwendungen
                            .toFixed(2)
                            .replace(/\B(?=(\d{3})+(?!\d))/g, "'")
                        : "–"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Summe verrechenbarer Leistungen (berechnet)
                  </p>
                </div>
              )}
            </div>

            {/* Mitarbeiter-Zuordnung */}
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold">
                    Mitarbeiter-Zuordnung
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Mitarbeiter, Leistungsart und Stundensatz für dieses Projekt
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={addMemberRow}
                  data-ocid="projekte-add-member"
                >
                  <UserPlus className="w-4 h-4" />
                  Mitarbeiter hinzufügen
                </Button>
              </div>

              {members.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border py-6 text-center text-sm text-muted-foreground">
                  Noch keine Mitarbeiter zugeordnet
                </div>
              ) : (
                <div className="rounded-lg border border-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/20">
                        <TableHead>Mitarbeiter</TableHead>
                        <TableHead>Leistungsart</TableHead>
                        <TableHead className="w-28 text-right">
                          Stundensatz (CHF)
                        </TableHead>
                        <TableHead className="w-28 text-right">
                          Kostendach (CHF)
                        </TableHead>
                        <TableHead className="w-10" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {members.map((m, i) => (
                        <TableRow key={m._key} data-ocid="projekte-member-row">
                          <TableCell className="py-1.5">
                            <Select
                              value={m.employeeId}
                              onValueChange={(v) =>
                                updateMember(i, { employeeId: v })
                              }
                            >
                              <SelectTrigger
                                className="h-8 text-xs"
                                data-ocid="projekte-member-employee"
                              >
                                <SelectValue placeholder="Mitarbeiter..." />
                              </SelectTrigger>
                              <SelectContent>
                                {employees.map((e) => (
                                  <SelectItem
                                    key={String(e.id)}
                                    value={String(e.id)}
                                  >
                                    {e.firstName} {e.lastName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="py-1.5">
                            <Select
                              value={m.serviceTypeId}
                              onValueChange={(v) => {
                                const st = serviceTypes.find(
                                  (s) => String(s.id) === v,
                                );
                                updateMember(i, {
                                  serviceTypeId: v,
                                  // Prefill stundensatz from ServiceType.defaultRate, but only if user hasn't manually overridden it (i.e., still 0)
                                  stundensatz:
                                    m.stundensatz === 0 && st
                                      ? st.defaultRate
                                      : m.stundensatz,
                                });
                              }}
                            >
                              <SelectTrigger
                                className="h-8 text-xs"
                                data-ocid="projekte-member-service"
                              >
                                <SelectValue placeholder="Leistungsart..." />
                              </SelectTrigger>
                              <SelectContent>
                                {serviceTypes.map((s) => (
                                  <SelectItem
                                    key={String(s.id)}
                                    value={String(s.id)}
                                  >
                                    {s.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="py-1.5">
                            <Input
                              type="number"
                              min={0}
                              step={0.01}
                              className="h-8 text-xs text-right"
                              value={m.stundensatz}
                              data-ocid="projekte-member-rate"
                              onChange={(e) =>
                                updateMember(i, {
                                  stundensatz: Number(e.target.value),
                                })
                              }
                            />
                          </TableCell>
                          <TableCell className="py-1.5">
                            <Input
                              type="number"
                              min={0}
                              step={0.01}
                              placeholder="0.00"
                              className="h-8 text-xs text-right"
                              value={m.kostendachCHF}
                              data-ocid="projekte-member-kostendach"
                              onChange={(e) =>
                                updateMember(i, {
                                  kostendachCHF: e.target.value,
                                })
                              }
                            />
                          </TableCell>
                          <TableCell className="py-1.5 text-center">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive hover:text-destructive"
                              onClick={() => removeMember(i)}
                              aria-label="Zeile entfernen"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              Abbrechen
            </Button>
            <Button
              type="button"
              data-ocid="projekte-save"
              onClick={() => {
                if (validate()) saveMutation.mutate();
              }}
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? "Speichern..." : "Speichern"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Projekt löschen</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Möchten Sie <strong>{deleteTarget?.name}</strong> wirklich löschen?
          </p>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteTarget(null)}
            >
              Abbrechen
            </Button>
            <Button
              type="button"
              variant="destructive"
              data-ocid="projekte-delete-confirm"
              onClick={() =>
                deleteTarget && deleteMutation.mutate(deleteTarget.id)
              }
              disabled={deleteMutation.isPending}
            >
              Löschen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
