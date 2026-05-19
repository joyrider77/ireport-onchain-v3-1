import type { BillingCalculationResult } from "@/lib/billingCalculationService";
import { formatMonthLabel } from "@/lib/billingCalculationService";

interface LicenseBillingTableProps {
  result: BillingCalculationResult;
}

export function LicenseBillingTable({ result }: LicenseBillingTableProps) {
  const { employeeResults, months, totalPerMonth, totalLicenses } = result;

  return (
    <div
      className="overflow-x-auto rounded-lg border border-border"
      data-ocid="billing.license_table"
    >
      <table className="min-w-full text-sm border-collapse">
        {/* ── Header ──────────────────────────────────────────── */}
        <thead>
          <tr style={{ backgroundColor: "#00182b" }}>
            <th
              className="sticky left-0 z-10 px-3 py-2.5 text-left text-xs font-semibold text-white whitespace-nowrap border-r border-white/10"
              style={{ backgroundColor: "#00182b", minWidth: "160px" }}
            >
              Mitarbeiter
            </th>
            {months.map((m) => (
              <th
                key={m.toISOString()}
                className="px-2 py-2.5 text-center text-xs font-semibold text-white whitespace-nowrap border-r border-white/10 last:border-r-0"
                style={{ minWidth: "60px" }}
              >
                {formatMonthLabel(m)}
              </th>
            ))}
            <th
              className="px-3 py-2.5 text-right text-xs font-semibold text-white whitespace-nowrap"
              style={{ minWidth: "80px" }}
            >
              Lizenzen
            </th>
          </tr>
        </thead>

        {/* ── Body ────────────────────────────────────────────── */}
        <tbody>
          {employeeResults.length === 0 ? (
            <tr>
              <td
                colSpan={months.length + 2}
                className="px-3 py-8 text-center text-sm text-muted-foreground"
                data-ocid="billing.license_table_empty_state"
              >
                Keine abrechnungsrelevanten Mitarbeitenden im gewählten
                Zeitraum.
              </td>
            </tr>
          ) : (
            employeeResults.map((er, rowIdx) => (
              <tr
                key={String(er.employee.id)}
                data-ocid={`billing.license_table_row.${rowIdx + 1}`}
                className={`border-t border-border/50 ${
                  rowIdx % 2 === 0 ? "bg-background" : "bg-muted/20"
                } hover:bg-primary/5 transition-colors`}
              >
                {/* Name — sticky */}
                <td
                  className="sticky left-0 z-10 px-3 py-2 text-sm font-medium text-foreground whitespace-nowrap border-r border-border/40"
                  style={{
                    backgroundColor:
                      rowIdx % 2 === 0 ? "var(--background)" : undefined,
                    background:
                      rowIdx % 2 !== 0 ? "hsl(var(--muted) / 0.2)" : undefined,
                  }}
                >
                  <span className="flex items-center gap-1.5">
                    {er.employee.lastName}, {er.employee.firstName}
                    {!er.employee.active && (
                      <span className="inline-flex text-[10px] px-1.5 py-0 rounded-full bg-muted text-muted-foreground border border-border">
                        inaktiv
                      </span>
                    )}
                  </span>
                </td>

                {/* Month cells */}
                {er.monthResults.map((mr, colIdx) => (
                  <td
                    key={months[colIdx]?.toISOString() ?? colIdx}
                    className="px-2 py-2 text-center text-xs tabular-nums border-r border-border/30 last:border-r-0"
                  >
                    {mr.activeDays === 0 ? (
                      <span className="text-muted-foreground/50">0T</span>
                    ) : mr.isLicenseMonth ? (
                      <span className="font-semibold text-foreground">
                        {mr.activeDays}T
                      </span>
                    ) : (
                      <span className="text-muted-foreground">
                        {mr.activeDays}T
                      </span>
                    )}
                  </td>
                ))}

                {/* License count */}
                <td className="px-3 py-2 text-right text-sm font-semibold text-foreground tabular-nums">
                  {er.licenseMonths}
                </td>
              </tr>
            ))
          )}
        </tbody>

        {/* ── Footer total row ─────────────────────────────────── */}
        <tfoot>
          <tr
            className="border-t-2 border-border"
            data-ocid="billing.license_table_totals_row"
            style={{ backgroundColor: "rgba(0, 96, 102, 0.08)" }}
          >
            <td
              className="sticky left-0 z-10 px-3 py-2.5 text-sm font-bold text-foreground whitespace-nowrap border-r border-border/40"
              style={{ backgroundColor: "rgba(0, 96, 102, 0.08)" }}
            >
              Total
            </td>
            {totalPerMonth.map((count, i) => (
              <td
                key={months[i]?.toISOString() ?? i}
                className="px-2 py-2.5 text-center text-xs font-bold text-foreground tabular-nums border-r border-border/30 last:border-r-0"
              >
                {count > 0 ? (
                  count
                ) : (
                  <span className="text-muted-foreground/50">0</span>
                )}
              </td>
            ))}
            <td className="px-3 py-2.5 text-right text-sm font-bold text-foreground tabular-nums">
              {totalLicenses}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
