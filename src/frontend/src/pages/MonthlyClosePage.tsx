import { createActor } from "@/backend";
import { Layout } from "@/components/Layout";
import { MonthlyCloseOverview } from "@/components/MonthlyCloseOverview";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuthStore";
import { useClosePeriod } from "@/hooks/usePeriodClose";
import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";
import { Check, Lock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type AnyActor = Record<string, (...args: unknown[]) => Promise<unknown>>;

interface Employee {
  employeeId: bigint;
  employeeName: string;
}

const MONTHS = [
  { value: 1, label: "Januar" },
  { value: 2, label: "Februar" },
  { value: 3, label: "März" },
  { value: 4, label: "April" },
  { value: 5, label: "Mai" },
  { value: 6, label: "Juni" },
  { value: 7, label: "Juli" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "Oktober" },
  { value: 11, label: "November" },
  { value: 12, label: "Dezember" },
];

export default function MonthlyClosePage() {
  const { role, companyId } = useAuth();
  const { actor, isFetching } = useActor(createActor);
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
  const [bulkCloseOpen, setBulkCloseOpen] = useState(false);

  const canManage = role === "admin" || role === "manager";

  const closeMutation = useClosePeriod();

  const { data: employees = [], isLoading } = useQuery<Employee[]>({
    queryKey: ["employeesForClose", companyId?.toString()],
    queryFn: async () => {
      if (!actor || !companyId) return [];
      try {
        const result = await (actor as unknown as AnyActor).listEmployees(
          companyId,
        );
        const list = result as Array<{
          id: bigint;
          firstName: string;
          lastName: string;
        }>;
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

  const years = [
    now.getFullYear() - 1,
    now.getFullYear(),
    now.getFullYear() + 1,
  ];

  const cid = (
    companyId != null ? BigInt(String(companyId)) : BigInt(0)
  ) as bigint;

  const selectableEmployees = employees.filter((_e) => {
    // We don't have closes here; rely on MonthlyCloseOverview to disable checkboxes for closed rows.
    // For selection logic we treat all as selectable; the row will disable its own checkbox if closed.
    return true;
  });

  const allSelected =
    selectableEmployees.length > 0 &&
    selectableEmployees.every((e) =>
      selectedEmployeeIds.includes(e.employeeId.toString()),
    );

  const handleToggleAll = () => {
    if (allSelected) {
      setSelectedEmployeeIds([]);
    } else {
      setSelectedEmployeeIds(
        selectableEmployees.map((e) => e.employeeId.toString()),
      );
    }
  };

  const handleToggleEmployee = (employeeId: bigint) => {
    const id = employeeId.toString();
    setSelectedEmployeeIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleBulkClose = async () => {
    if (selectedEmployeeIds.length === 0) return;
    let successCount = 0;
    let errorCount = 0;
    for (const idStr of selectedEmployeeIds) {
      try {
        await new Promise<void>((resolve, reject) => {
          closeMutation.mutate(
            {
              companyId: cid,
              employeeId: BigInt(idStr),
              month,
              year,
            },
            {
              onSuccess: () => {
                successCount++;
                resolve();
              },
              onError: () => {
                errorCount++;
                reject(new Error("close failed"));
              },
            },
          );
        });
      } catch {
        // continue with next
      }
    }
    setBulkCloseOpen(false);
    setSelectedEmployeeIds([]);
    if (successCount > 0) {
      toast.success(
        `${successCount} Mitarbeitende wurden erfolgreich abgeschlossen.`,
      );
    }
    if (errorCount > 0) {
      toast.error(
        `Bei ${errorCount} Mitarbeitenden ist ein Fehler aufgetreten.`,
      );
    }
  };

  return (
    <Layout>
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
              <Select
                value={String(month)}
                onValueChange={(v) => setMonth(Number(v))}
              >
                <SelectTrigger
                  className="w-40"
                  data-ocid="monthly_close.month_select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m) => (
                    <SelectItem key={m.value} value={String(m.value)}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Jahr</Label>
              <Select
                value={String(year)}
                onValueChange={(v) => setYear(Number(v))}
              >
                <SelectTrigger
                  className="w-28"
                  data-ocid="monthly_close.year_select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
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
              <div className="flex items-center justify-between">
                <CardTitle>Mitarbeitende</CardTitle>
                <Button
                  onClick={() => setBulkCloseOpen(true)}
                  disabled={selectedEmployeeIds.length === 0}
                  className="bg-[#006066] hover:bg-[#004d52] text-white"
                  data-ocid="monthly_close.bulk_close_button"
                >
                  Alle abschliessen ({selectedEmployeeIds.length})
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <MonthlyCloseOverview
                companyId={cid}
                employees={isLoading ? [] : employees}
                month={month}
                year={year}
                selectedEmployeeIds={selectedEmployeeIds}
                onToggleEmployee={handleToggleEmployee}
                onToggleAll={handleToggleAll}
                allSelected={allSelected}
              />
            </CardContent>
          </Card>
        )}

        <Dialog open={bulkCloseOpen} onOpenChange={setBulkCloseOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Monatsabschluss bestätigen</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              Möchtest du den Monatsabschluss für{" "}
              <strong>{selectedEmployeeIds.length}</strong> Mitarbeitende für{" "}
              {month.toString().padStart(2, "0")}.{year} durchführen?
            </p>
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => setBulkCloseOpen(false)}
                data-ocid="monthly_close.bulk_cancel_button"
              >
                Abbrechen
              </Button>
              <Button
                onClick={handleBulkClose}
                className="bg-[#006066] hover:bg-[#004d52] text-white"
                data-ocid="monthly_close.bulk_confirm_button"
              >
                Jetzt abschliessen
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
