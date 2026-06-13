import { useState } from "react";
import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";
import { createActor } from "@/backend";
import { useAuth } from "@/hooks/useAuthStore";
import { MonthlyCloseOverview } from "@/components/MonthlyCloseOverview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Lock } from "lucide-react";

type AnyActor = Record<string, (...args: unknown[]) => Promise<unknown>>;

interface Employee {
  employeeId: bigint;
  employeeName: string;
}

const MONTHS = [
  { value: 1, label: "Januar" }, { value: 2, label: "Februar" }, { value: 3, label: "März" },
  { value: 4, label: "April" }, { value: 5, label: "Mai" }, { value: 6, label: "Juni" },
  { value: 7, label: "Juli" }, { value: 8, label: "August" }, { value: 9, label: "September" },
  { value: 10, label: "Oktober" }, { value: 11, label: "November" }, { value: 12, label: "Dezember" },
];

export default function MonthlyClosePage() {
  const { role, companyId } = useAuth();
  const { actor, isFetching } = useActor(createActor);
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const canManage = role === "admin" || role === "manager";

  const { data: employees = [], isLoading } = useQuery<Employee[]>({
    queryKey: ["employeesForClose", companyId?.toString()],
    queryFn: async () => {
      if (!actor || !companyId) return [];
      try {
        const result = await (actor as unknown as AnyActor).listEmployees(companyId);
        const list = result as Array<{ id: bigint; firstName: string; lastName: string }>;
        return list.map((e) => ({
          employeeId: e.id,
          employeeName: `${e.firstName} ${e.lastName}`,
        }));
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching && !!companyId,
    retry: 2,
    staleTime: 60_000,
  });

  const years = [now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1];

  return (
    <div className="space-y-6 p-6" data-ocid="monthly_close.page">
      <div className="flex items-center gap-3">
        <Lock className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Monatsabschluss</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Periode auswählen</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <div className="space-y-1">
            <Label>Monat</Label>
            <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
              <SelectTrigger className="w-40" data-ocid="monthly_close.month_select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((m) => (
                  <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Jahr</Label>
            <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
              <SelectTrigger className="w-28" data-ocid="monthly_close.year_select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {!canManage ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Sie haben keine Berechtigung, Perioden abzuschliessen.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Mitarbeitende</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <MonthlyCloseOverview
              companyId={companyId ?? BigInt(0)}
              employees={isLoading ? [] : employees}
              month={month}
              year={year}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
