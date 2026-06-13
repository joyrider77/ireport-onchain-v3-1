import { MonthlyCloseEmployeeRow } from "@/components/MonthlyCloseEmployeeRow";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { useListPeriodCloses } from "@/hooks/usePeriodClose";
import type { PeriodClose } from "@/types/periodClose";

interface EmployeeEntry {
  employeeId: bigint;
  employeeName: string;
}

interface Props {
  companyId: bigint | string;
  employees: EmployeeEntry[];
  month: number;
  year: number;
  selectedEmployeeIds?: string[];
  onToggleEmployee?: (employeeId: bigint) => void;
  onToggleAll?: () => void;
  allSelected?: boolean;
}

function findPeriodClose(
  closes: PeriodClose[],
  employeeId: bigint,
): PeriodClose | null {
  return closes.find((c) => c.employeeId === employeeId) ?? null;
}

export function MonthlyCloseOverview({
  companyId,
  employees,
  month,
  year,
  selectedEmployeeIds = [],
  onToggleEmployee,
  onToggleAll,
  allSelected = false,
}: Props) {
  const { data: closes = [], isLoading } = useListPeriodCloses(
    companyId !== undefined ? BigInt(String(companyId)) : undefined,
    month,
    year,
  );

  if (isLoading) {
    return (
      <div className="space-y-2" data-ocid="monthly_close.loading_state">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div
        className="text-center py-12 text-muted-foreground"
        data-ocid="monthly_close.empty_state"
      >
        Keine Mitarbeitenden gefunden.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto" data-ocid="monthly_close.table">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/40">
            <th className="px-4 py-2 text-left w-10">
              {onToggleAll && (
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={onToggleAll}
                  aria-label="Alle auswählen"
                  data-ocid="monthly_close.select_all_checkbox"
                />
              )}
            </th>
            <th className="px-4 py-2 text-left font-semibold">
              Mitarbeitende/r
            </th>
            <th className="px-4 py-2 text-left font-semibold">Periode</th>
            <th className="px-4 py-2 text-left font-semibold">Status</th>
            <th className="px-4 py-2 text-left font-semibold">
              Abgeschlossen am
            </th>
            <th className="px-4 py-2 text-left font-semibold">Aktionen</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp, idx) => (
            <MonthlyCloseEmployeeRow
              key={emp.employeeId.toString()}
              companyId={companyId}
              employeeId={emp.employeeId}
              employeeName={emp.employeeName}
              month={month}
              year={year}
              periodClose={findPeriodClose(closes, emp.employeeId)}
              index={idx + 1}
              selected={selectedEmployeeIds.includes(emp.employeeId.toString())}
              onToggle={onToggleEmployee}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
