// ────────────────────────────────────────────────────────────────
// licenseBillingExportService.ts
// CSV export for the annual tenant billing overview.
// ────────────────────────────────────────────────────────────────

import {
  type BillingCalculationResult,
  formatMonthLabel,
} from "./billingCalculationService";

/** Escape a CSV cell value (wrap in quotes if needed) */
function csvCell(value: string | number): string {
  const s = String(value);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function csvRow(cells: (string | number)[]): string {
  return cells.map(csvCell).join(",");
}

function formatDateDE(date: Date): string {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}

/**
 * Generates and triggers a browser download of a CSV file.
 */
export function exportToCSV(
  tenantName: string,
  fromDate: Date,
  toDate: Date,
  kulanzDays: number,
  result: BillingCalculationResult,
): void {
  const monthLabels = result.months.map(formatMonthLabel);

  const rows: string[] = [];

  // ── Meta header ──────────────────────────────────────────────
  rows.push(csvRow(["Mandant", tenantName]));
  rows.push(csvRow(["Zeitraum von", formatDateDE(fromDate)]));
  rows.push(csvRow(["Zeitraum bis", formatDateDE(toDate)]));
  rows.push(csvRow(["Kulanz (Tage)", kulanzDays]));
  rows.push(""); // blank separator

  // ── Table header ─────────────────────────────────────────────
  rows.push(csvRow(["Mitarbeiter", ...monthLabels, "Lizenzen"]));

  // ── Employee rows ─────────────────────────────────────────────
  for (const er of result.employeeResults) {
    const name = `${er.employee.lastName} ${er.employee.firstName}`;
    const monthValues = er.monthResults.map((m) =>
      m.activeDays > 0 ? `${m.activeDays}T` : "0T",
    );
    rows.push(csvRow([name, ...monthValues, er.licenseMonths]));
  }

  // ── Total row ─────────────────────────────────────────────────
  const totalCells = result.totalPerMonth.map(String);
  rows.push(csvRow(["Total", ...totalCells, result.totalLicenses]));

  // ── Trigger download ──────────────────────────────────────────
  const bom = "\uFEFF"; // UTF-8 BOM for Excel compatibility
  const csvContent = bom + rows.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const safeDate = formatDateDE(fromDate).replace(/\./g, "-");
  a.href = url;
  a.download = `Abrechnung_${tenantName.replace(/\s+/g, "_")}_${safeDate}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
