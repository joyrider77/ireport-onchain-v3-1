import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink, FileText, ReceiptText } from "lucide-react";
import { createActor } from "../../backend";
import type { StripeInvoice } from "../../backend.d";

function formatDateShort(ns: bigint): string {
  const ms = Number(ns / 1_000_000n);
  const d = new Date(ms);
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
}

function formatChf(amount: number, currency = "CHF"): string {
  return `${currency.toUpperCase()} ${amount.toLocaleString("de-CH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const INVOICE_STATUS: Record<string, { label: string; classes: string }> = {
  paid: {
    label: "Bezahlt",
    classes: "bg-green-100 text-green-700 border-green-200",
  },
  open: {
    label: "Offen",
    classes: "bg-blue-100 text-blue-700 border-blue-200",
  },
  draft: {
    label: "Entwurf",
    classes: "bg-muted text-muted-foreground border-border",
  },
  void: {
    label: "Storniert",
    classes: "bg-muted text-muted-foreground border-border",
  },
  uncollectible: {
    label: "Uneinbringlich",
    classes: "bg-red-100 text-red-700 border-red-200",
  },
};

interface StripeInvoiceListProps {
  companyId: bigint;
}

export function StripeInvoiceList({ companyId }: StripeInvoiceListProps) {
  const { actor, isFetching } = useActor(createActor);

  const { data: invoices = [], isLoading } = useQuery<StripeInvoice[]>({
    queryKey: ["stripeInvoices", companyId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getStripeInvoicesForCompany(companyId);
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
  });

  if (isLoading) {
    return (
      <div className="space-y-2" data-ocid="billing.invoices_loading_state">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div
        data-ocid="billing.invoices_empty_state"
        className="flex flex-col items-center gap-2 py-8 text-center text-muted-foreground"
      >
        <ReceiptText className="w-8 h-8 opacity-40" />
        <p className="text-sm">Noch keine Rechnungen vorhanden.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto -mx-1" data-ocid="billing.invoice_list">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-xs text-muted-foreground">
            <th className="text-left px-2 py-2 font-medium">Rechnungsnr.</th>
            <th className="text-left px-2 py-2 font-medium hidden sm:table-cell">
              Datum
            </th>
            <th className="text-right px-2 py-2 font-medium">Betrag</th>
            <th className="text-center px-2 py-2 font-medium">Status</th>
            <th className="text-right px-2 py-2 font-medium">Links</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv, idx) => {
            const statusConfig = INVOICE_STATUS[inv.status] ?? {
              label: inv.status,
              classes: "bg-muted text-muted-foreground border-border",
            };
            return (
              <tr
                key={inv.stripeInvoiceId}
                data-ocid={`billing.invoice_row.${idx + 1}`}
                className="border-b border-border/40 hover:bg-muted/20 transition-colors"
              >
                <td className="px-2 py-2.5 font-mono text-xs text-foreground">
                  {inv.invoiceNumber ??
                    inv.stripeInvoiceId.slice(-8).toUpperCase()}
                </td>
                <td className="px-2 py-2.5 text-muted-foreground hidden sm:table-cell whitespace-nowrap">
                  {formatDateShort(inv.issuedAt)}
                </td>
                <td className="px-2 py-2.5 text-right tabular-nums font-medium">
                  {formatChf(inv.amountDue, inv.currency)}
                </td>
                <td className="px-2 py-2.5 text-center">
                  <Badge
                    variant="outline"
                    className={`text-[10px] px-1.5 py-0 ${statusConfig.classes}`}
                  >
                    {statusConfig.label}
                  </Badge>
                </td>
                <td className="px-2 py-2.5 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {inv.hostedInvoiceUrl && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-primary"
                        onClick={() =>
                          window.open(
                            inv.hostedInvoiceUrl!,
                            "_blank",
                            "noopener,noreferrer",
                          )
                        }
                        aria-label="Rechnung anzeigen"
                        data-ocid={`billing.invoice_view_button.${idx + 1}`}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Button>
                    )}
                    {inv.invoicePdfUrl && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-primary"
                        onClick={() =>
                          window.open(
                            inv.invoicePdfUrl!,
                            "_blank",
                            "noopener,noreferrer",
                          )
                        }
                        aria-label="PDF herunterladen"
                        data-ocid={`billing.invoice_pdf_button.${idx + 1}`}
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
