import { useAuth } from "@/hooks/useAuthStore";
import { useActor } from "@caffeineai/core-infrastructure";
import { useEffect, useState } from "react";
import { createActor } from "../../backend";
import type { Employee, VacationBalance, VacationLedger } from "../../backend";

type AnyActor = Record<string, (...args: unknown[]) => Promise<unknown>>;
const toAny = (a: unknown): AnyActor => a as AnyActor;

interface Props {
  employees: Array<
    Pick<Employee, "id" | "firstName" | "lastName"> & { startDate?: string }
  >;
}

/** Generate calendar years from hire year up to current year (inclusive). */
function computeCalendarYears(
  startDate: string,
): Array<{ label: string; key: string }> {
  if (!startDate) return [];
  const hire = new Date(startDate);
  const currentYear = new Date().getFullYear();
  const hireYear = hire.getFullYear();
  const result: Array<{ label: string; key: string }> = [];
  for (let y = currentYear; y >= hireYear; y--) {
    result.push({ label: String(y), key: String(y) });
  }
  return result;
}

function fallbackYearOptions(): Array<{ label: string; key: string }> {
  const y = new Date().getFullYear();
  return [
    { label: String(y), key: String(y) },
    { label: String(y - 1), key: String(y - 1) },
  ];
}

function restColor(days: number): string {
  if (days >= 10) return "text-green-600 font-medium";
  if (days >= 5) return "text-yellow-600 font-medium";
  return "text-red-600 font-medium";
}

export default function ComplianceFerienCompliance({ employees }: Props) {
  const { isAuthenticated } = useAuth();
  const { actor, isFetching } = useActor(createActor);

  const [selectedEmployeeId, setSelectedEmployeeId] = useState<bigint | null>(
    employees.length > 0 ? employees[0].id : null,
  );
  const [yearOptions, setYearOptions] = useState<
    Array<{ label: string; key: string }>
  >([]);
  const [selectedYearKey, setSelectedYearKey] = useState<string>("");
  const [ledger, setLedger] = useState<VacationLedger | null>(null);
  const [vacationBalances, setVacationBalances] = useState<VacationBalance[]>(
    [],
  );
  const [loading, setLoading] = useState(false);

  const enabled = !!actor && !isFetching && isAuthenticated;

  // Recompute calendar years when selected employee changes
  useEffect(() => {
    const emp = employees.find((e) => e.id === selectedEmployeeId);
    const sd =
      (emp as (typeof emp & { startDate?: string }) | undefined)?.startDate ??
      "";
    const opts = sd ? computeCalendarYears(sd) : fallbackYearOptions();
    setYearOptions(opts);
    setSelectedYearKey(opts.length > 0 ? opts[0].key : "");
    setLedger(null);
    setVacationBalances([]);
  }, [selectedEmployeeId, employees]);

  useEffect(() => {
    if (employees.length > 0 && !selectedEmployeeId) {
      setSelectedEmployeeId(employees[0].id);
    }
  }, [employees, selectedEmployeeId]);

  useEffect(() => {
    if (!enabled || !selectedEmployeeId || !selectedYearKey) return;
    void loadLedger();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, selectedEmployeeId, selectedYearKey]);

  async function loadLedger() {
    if (!actor || !selectedEmployeeId || !selectedYearKey) return;
    setLoading(true);
    try {
      // Load ledger for calendar year key (4-digit string, e.g. "2024")
      const result = (await toAny(actor).getVacationLedger(
        selectedEmployeeId,
        selectedYearKey,
      )) as VacationLedger | null;
      setLedger(result);

      // Also load vacation balances to check compliance against admin-configured quota
      type BalanceResult = { ok?: VacationBalance[]; err?: unknown };
      const balRes = (await toAny(actor).listVacationBalances(
        selectedEmployeeId,
      )) as BalanceResult;
      setVacationBalances(balRes?.ok ?? []);
    } catch (e) {
      console.error("Fehler beim Laden des Vacation Ledger:", e);
      setLedger(null);
      setVacationBalances([]);
    } finally {
      setLoading(false);
    }
  }

  const selectedEmployee = employees.find((e) => e.id === selectedEmployeeId);
  const employeeName = selectedEmployee
    ? `${selectedEmployee.firstName} ${selectedEmployee.lastName}`
    : "–";

  // For calendar year display, show the 4-digit year directly
  const displayYear = selectedYearKey;

  // Find VacationBalance for the selected calendar year
  const matchingBalance = vacationBalances.find(
    (b) => Number(b.kalenderjahr) === Number(selectedYearKey),
  );
  const balanceDays = matchingBalance ? Number(matchingBalance.dauer) : null;
  const gesetzlichDays = ledger ? ledger.gesetzlicheFerientage : 0;

  // Compliance status for admin-configured vacation quota vs legal minimum
  const complianceStatus: "ok" | "below_minimum" | "no_balance" | "none" =
    ledger && gesetzlichDays > 0
      ? balanceDays === null
        ? "no_balance"
        : balanceDays < gesetzlichDays
          ? "below_minimum"
          : "ok"
      : "none";

  return (
    <div
      className="p-6 space-y-4"
      data-ocid="compliance.ferien_compliance_page"
    >
      <h2 className="text-lg font-semibold text-foreground">
        Ferien-Compliance nach Kalenderjahr
      </h2>

      {/* Selectors */}
      <div className="flex flex-wrap gap-4 mb-2">
        <select
          value={selectedEmployeeId ? String(selectedEmployeeId) : ""}
          onChange={(e) => {
            setSelectedEmployeeId(
              e.target.value ? BigInt(e.target.value) : null,
            );
          }}
          className="border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring w-64"
          data-ocid="compliance.ferien_mitarbeiter_select"
        >
          <option value="">Mitarbeitende/r wählen…</option>
          {employees.map((emp) => (
            <option key={String(emp.id)} value={String(emp.id)}>
              {emp.firstName} {emp.lastName}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-2">
          <label
            className="text-sm font-medium text-muted-foreground"
            htmlFor="ferien-year-select"
          >
            Kalenderjahr
          </label>
          <select
            id="ferien-year-select"
            value={selectedYearKey}
            onChange={(e) => {
              setSelectedYearKey(e.target.value);
              setLedger(null);
              setVacationBalances([]);
            }}
            className="border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring w-32"
            data-ocid="compliance.ferien_year_select"
          >
            {yearOptions.map((y) => (
              <option key={y.key} value={y.key}>
                {y.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <p
          className="text-sm text-muted-foreground"
          data-ocid="compliance.ferien_loading"
        >
          Laden…
        </p>
      )}

      {/* No employee selected */}
      {!loading && !selectedEmployeeId && (
        <p className="text-sm text-muted-foreground">
          Bitte einen Mitarbeitenden auswählen.
        </p>
      )}

      {/* No ledger */}
      {!loading && selectedEmployeeId && !ledger && (
        <div
          className="rounded-lg border border-dashed border-border p-6 text-center"
          data-ocid="compliance.ferien_empty_state"
        >
          <p className="text-sm text-muted-foreground">
            Kein Ledger für das Kalenderjahr {selectedYearKey} gefunden. Führe
            eine Wochenkontrolle durch, um Daten zu generieren.
          </p>
        </div>
      )}

      {/* Table */}
      {ledger && !loading && (
        <div
          className="overflow-x-auto rounded-lg border border-border"
          data-ocid="compliance.ferien_table"
        >
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-muted/40 border-b border-border">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Mitarbeitende/r
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Kalenderjahr
                </th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                  Gesetzlich (Tage)
                </th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                  Vertraglich (Tage)
                </th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">
                  Compliance
                </th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                  Geplant
                </th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                  Bezogen
                </th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                  Verbleibend
                </th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                  Längster Block
                </th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">
                  2-Wochen-Block
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-medium text-foreground">
                  {employeeName}
                </td>
                <td className="px-4 py-3 text-foreground">{displayYear}</td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {ledger.gesetzlicheFerientage} T
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  <div className="flex items-center justify-end gap-2">
                    <span>{ledger.vertraglicheZusatzferienTage} T</span>
                    {ledger.vertraglicheZusatzferienTage === 0 &&
                      ledger.gesetzlicheFerientage > 0 && (
                        <span
                          className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800"
                          title="Vertraglicher Ferienanspruch nicht hinterlegt – bitte in den Stammdaten prüfen."
                        >
                          Bitte prüfen
                        </span>
                      )}
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  {complianceStatus === "below_minimum" && (
                    <span
                      className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800"
                      title={`Gesetzlicher Mindestanspruch: ${gesetzlichDays} Tage. Hinterlegtes Ferienguthaben: ${balanceDays} Tage.`}
                    >
                      Unter gesetzl. Minimum
                    </span>
                  )}
                  {complianceStatus === "no_balance" && (
                    <span
                      className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800"
                      title="Für dieses Kalenderjahr wurde noch kein Ferienguthaben erfasst."
                    >
                      Kein Guthaben erfasst
                    </span>
                  )}
                  {complianceStatus === "ok" && (
                    <span
                      className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800"
                      title={`Gesetzlicher Mindestanspruch: ${gesetzlichDays} Tage. Hinterlegtes Ferienguthaben: ${balanceDays} Tage.`}
                    >
                      ✓ Erfüllt
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {ledger.geplanteFerientage} T
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {ledger.bezogeneFerientage} T
                </td>
                <td
                  className={`px-4 py-3 text-right tabular-nums ${restColor(
                    ledger.verbleibendeFerientage,
                  )}`}
                >
                  {ledger.verbleibendeFerientage} T
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {Number(ledger.laengsterZusammenhangenderBlock)} T
                </td>
                <td
                  className={`px-4 py-3 text-center font-medium ${
                    ledger.twoWeekBlockSatisfied
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {ledger.twoWeekBlockSatisfied ? "✓" : "✗"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
