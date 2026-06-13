import { ClosePeriodDialog } from "@/components/ClosePeriodDialog";
import { MonthlyCloseStatusBadge } from "@/components/MonthlyCloseStatusBadge";
import { ReopenPeriodDialog } from "@/components/ReopenPeriodDialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useClosePeriod, useReopenPeriod } from "@/hooks/usePeriodClose";
import { PeriodCloseStatus } from "@/types/periodClose";
import type { PeriodClose } from "@/types/periodClose";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  companyId: bigint | string;
  employeeId: bigint;
  employeeName: string;
  month: number;
  year: number;
  periodClose?: PeriodClose | null;
  index: number;
  selected?: boolean;
  onToggle?: (employeeId: bigint) => void;
}

function getStatus(periodClose?: PeriodClose | null): string {
  if (!periodClose) return PeriodCloseStatus.open;
  return String(periodClose.status);
}

export function MonthlyCloseEmployeeRow({
  companyId,
  employeeId,
  employeeName,
  month,
  year,
  periodClose,
  index,
  selected = false,
  onToggle,
}: Props) {
  const [closeOpen, setCloseOpen] = useState(false);
  const [reopenOpen, setReopenOpen] = useState(false);
  const closeMutation = useClosePeriod();
  const reopenMutation = useReopenPeriod();
  const status = getStatus(periodClose);
  const isClosed = status === PeriodCloseStatus.closed;

  const handleClose = async (comment: string): Promise<void> => {
    await new Promise<void>((resolve, reject) => {
      closeMutation.mutate(
        { companyId, employeeId, month, year, closeComment: comment },
        {
          onSuccess: () => {
            setCloseOpen(false);
            toast.success("Periode abgeschlossen");
            resolve();
          },
          onError: () => {
            toast.error("Fehler beim Abschliessen");
            reject(new Error("close failed"));
          },
        },
      );
    });
  };

  const handleReopen = async (reason: string): Promise<void> => {
    if (!periodClose) return;
    await new Promise<void>((resolve, reject) => {
      reopenMutation.mutate(
        { closeId: periodClose.closeId, reopenReason: reason },
        {
          onSuccess: () => {
            setReopenOpen(false);
            toast.success("Periode wieder geöffnet");
            resolve();
          },
          onError: () => {
            toast.error("Fehler beim Wiederöffnen");
            reject(new Error("reopen failed"));
          },
        },
      );
    });
  };

  return (
    <>
      <tr
        data-ocid={`monthly_close.item.${index}`}
        className="border-b hover:bg-muted/30 transition-colors"
      >
        <td className="px-4 py-3">
          {onToggle && (
            <Checkbox
              checked={selected}
              onCheckedChange={() => onToggle(employeeId)}
              disabled={isClosed}
              aria-label={`${employeeName} auswählen`}
              data-ocid={`monthly_close.checkbox.${index}`}
            />
          )}
        </td>
        <td className="px-4 py-3 font-medium">{employeeName}</td>
        <td className="px-4 py-3">
          {month.toString().padStart(2, "0")}/{year}
        </td>
        <td className="px-4 py-3">
          <MonthlyCloseStatusBadge status={status} />
        </td>
        <td className="px-4 py-3">
          {periodClose?.closedAt && Number(periodClose.closedAt) > 0
            ? new Date(
                Number(periodClose.closedAt) / 1_000_000,
              ).toLocaleDateString("de-CH")
            : "–"}
        </td>
        <td className="px-4 py-3 flex gap-2">
          {!isClosed ? (
            <Button
              size="sm"
              onClick={() => setCloseOpen(true)}
              data-ocid={`monthly_close.close_button.${index}`}
            >
              Abschliessen
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setReopenOpen(true)}
              data-ocid={`monthly_close.reopen_button.${index}`}
            >
              Wieder öffnen
            </Button>
          )}
        </td>
      </tr>
      <ClosePeriodDialog
        open={closeOpen}
        onOpenChange={setCloseOpen}
        employee={null}
        month={month}
        year={year}
        onConfirm={handleClose}
      />
      <ReopenPeriodDialog
        open={reopenOpen}
        onOpenChange={setReopenOpen}
        employeeName={employeeName}
        month={month}
        year={year}
        onConfirm={handleReopen}
      />
    </>
  );
}
