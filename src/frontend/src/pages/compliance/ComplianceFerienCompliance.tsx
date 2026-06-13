import { useAuth } from "@/hooks/useAuthStore";
import { useActor } from "@caffeineai/core-infrastructure";
import { useEffect, useState } from "react";
import { createActor } from "../../backend";
import type { Employee, VacationLedger } from "../../backend";

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
      const result = (await toAny(actor).getVacationLedger(
        selectedEmployeeId,
        selectedYearKey,
      )) as VacationLedger | null;
      setLedger(result);
    } catch (e) {
      console.error("Fehler beim Laden des Vacation Ledger:", e);
      setLedger(null);
    } finally {
      setLoading(false);
    }
  }

  const selectedEmployee = employees.find((e) => e.id === selectedEmployeeId);
  const employeeName = selectedEmployee
    ? `${selectedEmployee.firstName} ${selectedEmployee.lastName}`
    : "–";

  const displayYear = selectedYearKey;

  // All values come directly from ledger
  const gesetzlichDays = ledger ? Number(ledger.gesetzlicheFerientage) : 0;
  const vertraglichDays = ledger
    ? Number(ledger.vertraglicheZusatzferienTage)
    : 0;
  const bezogenDays = ledger ? Number(ledger.bezogeneFerientage) : 0;
  const geplantDays = ledger ? Number(ledger.geplanteFerientage) : 0;
  const verbleibendDays = ledger ? Number(ledger.verbleibendeFerientage) : 0;
  const twoWeekOk = ledger ? Boolean(ledger.twoWeekBlockSatisfied) : false;

  // Overall compliance status
  const currentYear = new Date().getFullYear();
  const isCurrentYear = Number(selectedYearKey) >= currentYear;
  // minimumViolation: only for past years where bezogen+geplant < gesetzlich
  const minimumViolation =
    !isCurrentYear &&
    bezogenDays + geplantDays < gesetzlichDays &&
    gesetzlichDays > 0;

  const gesamtstatusLabel: "Erfüllt" | "Warnung" | "Verstoss" | "–" = !ledger
    ? "–"
    : minimumViolation
      ? "Verstoss"
      : !twoWeekOk
        ? "Warnung"
        : "Erfüllt";

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
                  Gesamtstatus
                </th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                  Geplant (Tage)
                </th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                  Bezogen (Tage)
                </th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                  Verbleibend (Tage)
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
                  {gesetzlichDays.toFixed(2)} T
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  <div className="flex items-center justify-end gap-2">
                    <span>{vertraglichDays.toFixed(2)} T</span>
                    {gesetzlichDays > 0 && vertraglichDays < gesetzlichDays && (
                      <span
                        className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800"
                        title={`Vertraglicher Anspruch (${vertraglichDays.toFixed(2)} T) liegt unter gesetzlichem Minimum (${gesetzlichDays.toFixed(2)} T).`}
                      >
                        Unter Minimum
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  {gesamtstatusLabel === "Verstoss" ? (
                    <span
                      className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800"
                      title={`Gesetzlicher Mindestanspruch von ${gesetzlichDays.toFixed(2)} T nicht erfüllt.`}
                    >
                      ✗ Verstoss
                    </span>
                  ) : gesamtstatusLabel === "Warnung" ? (
                    <span
                      className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800"
                      title="2-Wochen-Ferienblock noch nicht erfüllt."
                    >
                      ⚠ Warnung
                    </span>
                  ) : gesamtstatusLabel === "Erfüllt" ? (
                    <span
                      className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800"
                      title={`Gesetzlicher Mindestanspruch: ${gesetzlichDays.toFixed(2)} T. Vertraglich: ${vertraglichDays.toFixed(2)} T.`}
                    >
                      ✓ Erfüllt
                    </span>
                  ) : (
                    <span className="text-muted-foreground">–</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {geplantDays.toFixed(2)} T
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {bezogenDays.toFixed(2)} T
                </td>
                <td
                  className={`px-4 py-3 text-right tabular-nums ${restColor(verbleibendDays)}`}
                >
                  {Number(ledger.verbleibendeFerientage).toFixed(2)} T
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {Number(ledger.laengsterZusammenhangenderBlock).toFixed(2)} T
                </td>
                <td
                  className={`px-4 py-3 text-center font-medium ${
                    twoWeekOk ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {twoWeekOk ? "✓" : "✗"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
