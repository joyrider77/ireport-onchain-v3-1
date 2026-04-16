import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
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
import { useActor as useActorCore } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Copy, Link2, Plus, Trash2, UserPen } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { createActor } from "../../backend";
import type {
  CreateEmployeeInput,
  Employee,
  EmploymentType,
  ProjectMemberAssignment,
  Role,
  backendInterface,
} from "../../backend.d";
import { MitarbeiterDetail } from "./MitarbeiterDetail";
import { getRoleLabel } from "./shared";

type AnyActor = backendInterface;
function useTypedActor() {
  const { actor, isFetching } = useActorCore(createActor);
  return {
    actor: actor ? (actor as unknown as AnyActor) : null,
    isFetching,
  };
}

interface EmployeeFormState {
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  employmentType: EmploymentType;
  startDate: string;
}

const defaultForm: EmployeeFormState = {
  firstName: "",
  lastName: "",
  email: "",
  role: "employee" as Role,
  employmentType: "fullTime" as EmploymentType,
  startDate: new Date().toISOString().split("T")[0],
};

interface InviteDialog {
  open: boolean;
  employeeName: string;
  url: string;
  copied: boolean;
}

export function MitarbeiterTab() {
  const { role } = useAuth();
  const canWrite = role === "admin" || role === "manager";
  const { actor, isFetching } = useTypedActor();
  const qc = useQueryClient();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);
  const [form, setForm] = useState<EmployeeFormState>(defaultForm);
  const [errors, setErrors] = useState<
    Partial<Record<keyof EmployeeFormState, string>>
  >({});
  const [detailEmployee, setDetailEmployee] = useState<Employee | null>(null);
  const [inviteDialog, setInviteDialog] = useState<InviteDialog>({
    open: false,
    employeeName: "",
    url: "",
    copied: false,
  });

  const { data: employees = [], isLoading } = useQuery<Employee[]>({
    queryKey: ["employees"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.listEmployees();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Kein Actor");
      const input: CreateEmployeeInput = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        role: form.role,
        employmentType: form.employmentType,
        startDate: form.startDate,
        weeklyHoursTarget: 0,
      };
      const res = await actor.createEmployee(input);
      if (res.__kind__ === "err") throw new Error(res.err);
      const newEmployee = res.ok;

      // Auto-assign new employee to project "intern" with service type "interne Administration"
      try {
        const [projects, serviceTypes] = await Promise.all([
          actor.listProjects(),
          actor.listServiceTypes(),
        ]);
        const internProject = (
          projects as Array<{
            id: bigint;
            name: string;
            code: string;
            active: boolean;
          }>
        ).find(
          (p) =>
            p.name?.toLowerCase() === "intern" ||
            p.code?.toLowerCase() === "intern",
        );
        const interneAdminSt = (
          serviceTypes as Array<{ id: bigint; name: string }>
        ).find(
          (st) =>
            st.name?.toLowerCase().includes("interne administration") ||
            st.name?.toLowerCase().includes("interne admin"),
        );
        if (internProject && interneAdminSt && newEmployee) {
          const membersRes = await actor.getProjectMembers(internProject.id);
          const existingMembers: ProjectMemberAssignment[] =
            membersRes.__kind__ === "ok"
              ? (membersRes.ok as ProjectMemberAssignment[])
              : [];
          const alreadyAssigned = existingMembers.some(
            (m) => String(m.employeeId) === String(newEmployee.id),
          );
          if (!alreadyAssigned) {
            const updatedMembers: ProjectMemberAssignment[] = [
              ...existingMembers,
              {
                employeeId: newEmployee.id,
                serviceTypeId: interneAdminSt.id,
                stundensatz: 0,
              },
            ];
            await actor.setProjectMembers(internProject.id, updatedMembers);
          }
        }
      } catch {
        // Non-fatal: auto-assignment to intern project failed silently
      }

      return newEmployee;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Mitarbeiter erstellt");
      setAddDialogOpen(false);
      setForm(defaultForm);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Kein Actor");
      const res = await actor.deleteEmployee(id);
      if (res.__kind__ === "err") throw new Error(res.err);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Mitarbeiter gelöscht");
      setDeleteTarget(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const inviteMutation = useMutation<
    { code: string; name: string },
    Error,
    { id: bigint; name: string }
  >({
    mutationFn: async ({ id, name }: { id: bigint; name: string }) => {
      if (!actor) throw new Error("Kein Actor");
      const res = await actor.generateInviteCode(id);
      if (res.__kind__ === "err") throw new Error(res.err);
      return { code: res.ok, name };
    },
    onSuccess: ({ code, name }) => {
      const url = `${window.location.origin}/einladung?code=${code}`;
      // Store in localStorage for admin convenience
      localStorage.setItem(`inviteCode_${code}`, url);
      setInviteDialog({ open: true, employeeName: name, url, copied: false });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  async function copyInviteUrl() {
    try {
      await navigator.clipboard.writeText(inviteDialog.url);
      setInviteDialog((d) => ({ ...d, copied: true }));
      setTimeout(() => setInviteDialog((d) => ({ ...d, copied: false })), 2000);
    } catch {
      toast.error("Kopieren fehlgeschlagen – bitte manuell kopieren");
    }
  }

  function validate(): boolean {
    const errs: Partial<Record<keyof EmployeeFormState, string>> = {};
    if (!form.firstName.trim()) errs.firstName = "Pflichtfeld";
    if (!form.lastName.trim()) errs.lastName = "Pflichtfeld";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email))
      errs.email = "Gültige E-Mail erforderlich";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function openAdd() {
    setForm(defaultForm);
    setErrors({});
    setAddDialogOpen(true);
  }

  // If detail view is open, render it
  if (detailEmployee) {
    return (
      <MitarbeiterDetail
        employee={detailEmployee}
        canWrite={canWrite}
        onBack={() => setDetailEmployee(null)}
        onUpdated={(emp) => {
          setDetailEmployee(emp);
          qc.invalidateQueries({ queryKey: ["employees"] });
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {employees.length} Mitarbeiter
        </p>
        {canWrite && (
          <Button
            data-ocid="mitarbeiter-add"
            onClick={openAdd}
            size="sm"
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Mitarbeiter hinzufügen
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
                <TableHead>E-Mail</TableHead>
                <TableHead>Rolle</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Keine Mitarbeiter vorhanden
                  </TableCell>
                </TableRow>
              ) : (
                employees.map((emp) => (
                  <TableRow
                    key={String(emp.id)}
                    data-ocid="mitarbeiter-row"
                    className="cursor-pointer hover:bg-muted/20"
                    onClick={() => setDetailEmployee(emp)}
                  >
                    <TableCell className="font-medium">
                      {emp.firstName} {emp.lastName}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {emp.email}
                    </TableCell>
                    <TableCell>{getRoleLabel(emp.role)}</TableCell>
                    <TableCell>
                      <Badge variant={emp.active ? "default" : "secondary"}>
                        {emp.active ? "Aktiv" : "Inaktiv"}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className="text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1">
                        {canWrite && (
                          <>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() =>
                                inviteMutation.mutate({
                                  id: emp.id,
                                  name: `${emp.firstName} ${emp.lastName}`,
                                })
                              }
                              disabled={inviteMutation.isPending}
                              aria-label="Einladungslink generieren"
                              title="Einladungslink generieren"
                            >
                              <Link2 className="w-4 h-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setDetailEmployee(emp)}
                              aria-label="Bearbeiten"
                            >
                              <UserPen className="w-4 h-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => setDeleteTarget(emp)}
                              aria-label="Löschen"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Mitarbeiter hinzufügen</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="add-firstName">Vorname *</Label>
                <Input
                  id="add-firstName"
                  data-ocid="mitarbeiter-firstname"
                  value={form.firstName}
                  onChange={(e) =>
                    setForm({ ...form, firstName: e.target.value })
                  }
                />
                {errors.firstName && (
                  <p className="text-xs text-destructive">{errors.firstName}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="add-lastName">Nachname *</Label>
                <Input
                  id="add-lastName"
                  data-ocid="mitarbeiter-lastname"
                  value={form.lastName}
                  onChange={(e) =>
                    setForm({ ...form, lastName: e.target.value })
                  }
                />
                {errors.lastName && (
                  <p className="text-xs text-destructive">{errors.lastName}</p>
                )}
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="add-email">E-Mail *</Label>
              <Input
                id="add-email"
                type="email"
                data-ocid="mitarbeiter-email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Rolle *</Label>
                <Select
                  value={form.role as string}
                  onValueChange={(v) => setForm({ ...form, role: v as Role })}
                >
                  <SelectTrigger data-ocid="mitarbeiter-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrator</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="employee">Mitarbeiter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="add-startDate">Eintrittsdatum</Label>
                <Input
                  id="add-startDate"
                  type="date"
                  data-ocid="mitarbeiter-startdate"
                  value={form.startDate}
                  onChange={(e) =>
                    setForm({ ...form, startDate: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setAddDialogOpen(false)}
            >
              Abbrechen
            </Button>
            <Button
              type="button"
              data-ocid="mitarbeiter-save"
              onClick={() => {
                if (validate()) createMutation.mutate();
              }}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? "Speichern..." : "Speichern"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invite Link Dialog */}
      <Dialog
        open={inviteDialog.open}
        onOpenChange={(open) => setInviteDialog((d) => ({ ...d, open }))}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Link2 className="w-5 h-5 text-primary" />
              Einladungslink für {inviteDialog.employeeName}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-1">
            <p className="text-sm text-muted-foreground">
              Kopieren Sie den folgenden Link und senden Sie ihn an den
              Mitarbeiter. Der Link ist einmalig gültig und kann nur einmal
              verwendet werden.
            </p>
            <div className="flex gap-2">
              <Input
                readOnly
                value={inviteDialog.url}
                data-ocid="invite-url-input"
                className="text-xs font-mono bg-muted/30 flex-1"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                data-ocid="invite-copy-btn"
                onClick={copyInviteUrl}
                aria-label="Link kopieren"
                className="shrink-0"
              >
                {inviteDialog.copied ? (
                  <Check className="w-4 h-4 text-primary" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
            {inviteDialog.copied && (
              <p className="text-xs text-primary font-medium">
                ✓ Link wurde in die Zwischenablage kopiert
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setInviteDialog((d) => ({ ...d, open: false }))}
            >
              Schliessen
            </Button>
            <Button
              type="button"
              data-ocid="invite-copy-and-close"
              onClick={async () => {
                await copyInviteUrl();
                setTimeout(
                  () => setInviteDialog((d) => ({ ...d, open: false })),
                  800,
                );
              }}
              className="gap-2"
            >
              <Copy className="w-4 h-4" />
              Kopieren &amp; Schliessen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <DeleteConfirmDialog
        open={!!deleteTarget}
        onConfirm={() => {
          if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}
