import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MonthlyCloseStatusBadge } from "./MonthlyCloseStatusBadge";
import { ClosePeriodDialog } from "./ClosePeriodDialog";
import { ReopenPeriodDialog } from "./ReopenPeriodDialog";
import { useClosePeriod, useReopenPeriod } from "../src/hooks/usePeriodClose";
import { PeriodCloseStatus } from "../src/types/periodClose";
import type { PeriodClose } from "../src/types/periodClose";
import { toast } from "sonner";

interface Props {
  companyId: bigint;
  employeeId: bigint;
  employeeName: string;
  month: number;
  year: number;
  periodClose?: PeriodClose | null;
  index: number;
}

function getStatus(periodClose?: PeriodClose | null): string {
  if (!periodClose) return PeriodCloseStatus.open;
  return String(periodClose.status);
}

export function MonthlyCloseEmployeeRow({ companyId, employeeId, employeeName, month, year, periodClose, index }: Props) {
  const [closeOpen, setCloseOpen] = useState(false);
  const [reopenOpen, setReopenOpen] = useState(false);
  const closeMutation = useClosePeriod();
  const reopenMutation = useReopenPeriod();
  const status = getStatus(periodClose);
  const isClosed = status === PeriodCloseStatus.closed;

  const handleClose = (comment?: string) => {
    closeMutation.mutate(
      { companyId, employeeId, month, year, closeComment: comment },
      {
        onSuccess: () => { setCloseOpen(false); toast.success("Periode abgeschlossen"); },
        onError: () => toast.error("Fehler beim Abschliessen"),
      },
    );
  };

  const handleReopen = (reason: string) => {
    if (!periodClose) return;
    reopenMutation.mutate(
      { closeId: periodClose.closeId, reopenReason: reason },
      {
        onSuccess: () => { setReopenOpen(false); toast.success("Periode wieder geöffnet"); },
        onError: () => toast.error("Fehler beim Wiederöffnen"),
      },
    );
  };

  return (
    <>
      <tr data-ocid={`monthly_close.item.${index}`} className="border-b hover:bg-muted/30 transition-colors">
        <td className="px-4 py-3 font-medium">{employeeName}</td>
        <td className="px-4 py-3">{month.toString().padStart(2, "0")}/{year}</td>
        <td className="px-4 py-3">
          <MonthlyCloseStatusBadge status={status} />
        </td>
        <td className="px-4 py-3">
          {periodClose?.closedAt && Number(periodClose.closedAt) > 0
            ? new Date(Number(periodClose.closedAt) / 1_000_000).toLocaleDateString("de-CH")
            : "–"}
        </td>
        <td className="px-4 py-3 flex gap-2">
          {!isClosed ? (
            <Button size="sm" onClick={() => setCloseOpen(true)} data-ocid={`monthly_close.close_button.${index}`}>
              Abschliessen
            </Button>
          ) : (
            <Button size="sm" variant="outline" onClick={() => setReopenOpen(true)} data-ocid={`monthly_close.reopen_button.${index}`}>
              Wieder öffnen
            </Button>
          )}
        </td>
      </tr>
      <ClosePeriodDialog
        open={closeOpen}
        onOpenChange={setCloseOpen}
        employeeName={employeeName}
        month={month}
        year={year}
        isPending={closeMutation.isPending}
        onConfirm={handleClose}
      />
      <ReopenPeriodDialog
        open={reopenOpen}
        onOpenChange={setReopenOpen}
        employeeName={employeeName}
        month={month}
        year={year}
        isPending={reopenMutation.isPending}
        onConfirm={handleReopen}
      />
    </>
  );
}
