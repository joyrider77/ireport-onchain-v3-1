import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { createActor } from "../../backend";

type AnyActor = Record<string, (...args: unknown[]) => Promise<unknown>>;

export interface RecipientSelection {
  tenantIds: string[];
  roleIds: string[];
  userIds: string[];
}

export interface AvailableUser {
  userId: string;
  displayName: string;
  companyName: string;
}

interface CompanyRow {
  id: string;
  name: string;
  activeEmployeeCount: bigint;
}

interface RecipientSelectorProps {
  value: RecipientSelection;
  onChange: (v: RecipientSelection) => void;
}

const ROLES = [
  { id: "admin", label: "Administrator" },
  { id: "manager", label: "Manager" },
  { id: "employee", label: "Mitarbeiter" },
];

export function RecipientSelector({ value, onChange }: RecipientSelectorProps) {
  const { actor, isFetching } = useActor(createActor);
  const anyActor = actor as unknown as AnyActor | null;
  const [userSearch, setUserSearch] = useState("");

  // Load all companies
  const { data: companies = [] } = useQuery<CompanyRow[]>({
    queryKey: ["allCompaniesForAdmin"],
    queryFn: async () => {
      if (!anyActor) return [];
      const res = await anyActor.listAllCompaniesForPlatformAdmin();
      return (
        res as Array<{ id: string; name: string; activeEmployeeCount: bigint }>
      ).map((c) => ({
        id: String(c.id),
        name: c.name,
        activeEmployeeCount: c.activeEmployeeCount,
      }));
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
  });

  // Load ALL users across all companies for direct user selection
  const {
    data: allUsers = [],
    isLoading: usersLoading,
    isError: usersError,
  } = useQuery<AvailableUser[]>({
    queryKey: ["allUsersForNotifications"],
    queryFn: async () => {
      if (!anyActor || companies.length === 0) return [];
      const results = await Promise.all(
        companies.map(async (company) => {
          try {
            const users = await anyActor.getUsersForCompany(BigInt(company.id));
            return (
              users as Array<{
                id: bigint;
                firstName: string;
                lastName: string;
                isActive: boolean;
              }>
            )
              .filter((u) => u.isActive)
              .map(
                (u): AvailableUser => ({
                  userId: String(u.id),
                  displayName: `${u.firstName} ${u.lastName}`,
                  companyName: company.name,
                }),
              );
          } catch {
            return [];
          }
        }),
      );
      // Deduplicate by userId
      const seen = new Set<string>();
      return results.flat().filter((u) => {
        if (seen.has(u.userId)) return false;
        seen.add(u.userId);
        return true;
      });
    },
    // Only run once companies are loaded
    enabled: !!actor && !isFetching && companies.length > 0,
    staleTime: 120_000,
  });

  const filteredUsers = useMemo(() => {
    const q = userSearch.toLowerCase().trim();
    if (!q) return allUsers;
    return allUsers.filter(
      (u) =>
        u.displayName.toLowerCase().includes(q) ||
        u.companyName.toLowerCase().includes(q),
    );
  }, [allUsers, userSearch]);

  function toggleTenant(id: string) {
    const next = value.tenantIds.includes(id)
      ? value.tenantIds.filter((t) => t !== id)
      : [...value.tenantIds, id];
    onChange({ ...value, tenantIds: next });
  }

  function toggleRole(id: string) {
    const next = value.roleIds.includes(id)
      ? value.roleIds.filter((r) => r !== id)
      : [...value.roleIds, id];
    onChange({ ...value, roleIds: next });
  }

  function toggleUser(userId: string) {
    const next = value.userIds.includes(userId)
      ? value.userIds.filter((u) => u !== userId)
      : [...value.userIds, userId];
    onChange({ ...value, userIds: next });
  }

  function removeUser(userId: string) {
    onChange({ ...value, userIds: value.userIds.filter((u) => u !== userId) });
  }

  const selectedUserObjects = allUsers.filter((u) =>
    value.userIds.includes(u.userId),
  );

  return (
    <div className="space-y-4" data-ocid="recipient-selector">
      {/* Tenant section */}
      <div>
        <Label className="text-sm font-medium block mb-2">
          Mandanten / Firmen
        </Label>
        <div className="max-h-40 overflow-y-auto border border-border rounded-md p-2 space-y-1">
          {companies.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-3">
              Keine Firmen gefunden
            </p>
          ) : (
            companies.map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-2 cursor-pointer hover:bg-muted/30 px-1 py-0.5 rounded"
              >
                <Checkbox
                  id={`tenant-${c.id}`}
                  checked={value.tenantIds.includes(c.id)}
                  onCheckedChange={() => toggleTenant(c.id)}
                  data-ocid={`recipient.tenant.${c.id}`}
                />
                <label
                  htmlFor={`tenant-${c.id}`}
                  className="text-sm cursor-pointer flex-1"
                >
                  {c.name}
                  <span className="text-xs text-muted-foreground ml-1.5">
                    ({Number(c.activeEmployeeCount)} aktiv)
                  </span>
                </label>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Role section */}
      <div>
        <Label className="text-sm font-medium block mb-2">Rollen</Label>
        <div className="flex flex-wrap gap-3">
          {ROLES.map((r) => (
            <div key={r.id} className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                id={`role-${r.id}`}
                checked={value.roleIds.includes(r.id)}
                onCheckedChange={() => toggleRole(r.id)}
                data-ocid={`recipient.role.${r.id}`}
              />
              <label
                htmlFor={`role-${r.id}`}
                className="text-sm cursor-pointer"
              >
                {r.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Direct user section */}
      <div>
        <Label className="text-sm font-medium block mb-2">
          Direkte Benutzer
        </Label>

        {/* Selected user chips */}
        {selectedUserObjects.length > 0 && (
          <div
            className="flex flex-wrap gap-1.5 mb-2"
            data-ocid="recipient.selected_users"
          >
            {selectedUserObjects.map((u) => (
              <Badge
                key={u.userId}
                variant="secondary"
                className="text-xs flex items-center gap-1 pl-2 pr-1 py-0.5"
              >
                {u.displayName}
                <span className="text-muted-foreground">({u.companyName})</span>
                <button
                  type="button"
                  aria-label={`${u.displayName} entfernen`}
                  onClick={() => removeUser(u.userId)}
                  className="ml-0.5 hover:text-destructive transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {/* Search + list */}
        <div className="border border-border rounded-md overflow-hidden">
          <div className="flex items-center gap-2 px-2 border-b border-border bg-muted/20">
            <Search
              className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0"
              aria-hidden="true"
            />
            <Input
              data-ocid="recipient.user_search_input"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="Benutzer suchen\u2026"
              className="border-0 bg-transparent h-8 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
            />
          </div>
          <div className="max-h-48 overflow-y-auto p-2 space-y-1">
            {usersLoading ? (
              <div className="space-y-2 py-2">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-5 w-5/6" />
              </div>
            ) : usersError ? (
              <div className="flex items-center gap-2 text-xs text-destructive py-3 px-1">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Benutzer konnten nicht geladen werden</span>
              </div>
            ) : allUsers.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-3">
                Keine Benutzer verfügbar
              </p>
            ) : filteredUsers.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-3">
                Keine Benutzer gefunden
              </p>
            ) : (
              filteredUsers.map((u) => (
                <div
                  key={u.userId}
                  className="flex items-center gap-2 cursor-pointer hover:bg-muted/30 px-1 py-0.5 rounded"
                >
                  <Checkbox
                    id={`user-${u.userId}`}
                    checked={value.userIds.includes(u.userId)}
                    onCheckedChange={() => toggleUser(u.userId)}
                    data-ocid={`recipient.user.${u.userId}`}
                  />
                  <label
                    htmlFor={`user-${u.userId}`}
                    className="text-sm cursor-pointer flex-1 min-w-0"
                  >
                    <span className="font-medium">{u.displayName}</span>
                    <span className="text-muted-foreground ml-1.5 text-xs">
                      {u.companyName}
                    </span>
                  </label>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="rounded-md bg-muted/50 border border-border px-3 py-2 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">
          {value.tenantIds.length}
        </span>{" "}
        Firmen,{" "}
        <span className="font-medium text-foreground">
          {value.roleIds.length}
        </span>{" "}
        Rollen,{" "}
        <span className="font-medium text-foreground">
          {value.userIds.length}
        </span>{" "}
        direkte Benutzer
      </div>
    </div>
  );
}
