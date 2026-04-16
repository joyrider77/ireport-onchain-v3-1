/**
 * Global date format utility for iReport Onchain.
 * Converts ISO date strings (YYYY-MM-DD) to German format (TT.MM.JJJJ).
 * This must be used everywhere dates are *displayed* in the UI.
 * Date input fields (type=date) still use ISO format internally.
 */

/** Convert ISO date string "YYYY-MM-DD" to German format "TT.MM.JJJJ" */
export function formatDateDE(isoDate: string | null | undefined): string {
  if (!isoDate) return "–";
  const parts = isoDate.split("-");
  if (parts.length !== 3) return isoDate;
  const [y, m, d] = parts;
  return `${d}.${m}.${y}`;
}

/** Convert Unix timestamp (seconds as bigint) to German date format "TT.MM.JJJJ" */
export function timestampToDateDE(ts: bigint | undefined | null): string {
  if (!ts || ts === BigInt(0)) return "–";
  const d = new Date(Number(ts) * 1000);
  const iso = d.toISOString().split("T")[0];
  return formatDateDE(iso);
}
