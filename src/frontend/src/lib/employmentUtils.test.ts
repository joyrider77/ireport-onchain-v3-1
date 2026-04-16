/**
 * Unit tests for employmentUtils.ts
 *
 * Timestamp convention: nanosToLocalIsoDate() treats the input as Unix SECONDS
 * (despite the name — backend stores emp.von/bis as seconds via dateToTimestamp).
 *
 * Test helper isoToSeconds() converts an ISO date to a Unix-second bigint:
 *   BigInt(Math.floor(new Date(y, m-1, d, 12, 0, 0).getTime() / 1000))
 */

import { describe, expect, it } from "vitest";
import type { Employment } from "../backend.d";
import {
  countVacationDaysProportional,
  countVacationDaysWithPensum,
  getActiveEmploymentForDate,
  getEmploymentMinutesForDate,
  nanosToLocalIsoDate,
} from "./employmentUtils";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Converts an ISO date string (YYYY-MM-DD) to Unix seconds bigint.
 * Uses local noon to stay well within the target day regardless of timezone/DST.
 * Matches dateToTimestamp() in shared.ts: BigInt(Math.floor(d.getTime() / 1000))
 */
function isoToSeconds(isoDate: string): bigint {
  const [y, m, d] = isoDate.split("-").map(Number);
  const date = new Date(y, m - 1, d, 12, 0, 0); // local noon avoids DST edge
  return BigInt(Math.floor(date.getTime() / 1000));
}

function makeEmployment(
  id: string,
  von: string,
  bis: string | null,
  overrides: Partial<Employment> = {},
): Employment {
  return {
    id,
    von: isoToSeconds(von),
    // bis=null means open-ended → store as 0n (matches backend convention)
    bis: bis !== null ? isoToSeconds(bis) : 0n,
    pensum: 100,
    // Use string literal cast — avoids importing TypeScript enum which fails in strip-only node mode
    feiertagsberechnungsart: "exakt" as Employment["feiertagsberechnungsart"],
    stundenMo: 480n,
    stundenDi: 480n,
    stundenMi: 480n,
    stundenDo: 480n,
    stundenFr: 480n,
    stundenSa: 0n,
    stundenSo: 0n,
    employeeId: 1n,
    funktion: "Mitarbeiter",
    companyId: 1n,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// nanosToLocalIsoDate (actually converts Unix seconds to ISO date string)
// ---------------------------------------------------------------------------

describe("nanosToLocalIsoDate", () => {
  it("converts Unix-second timestamp to YYYY-MM-DD string", () => {
    const sec = isoToSeconds("2026-04-01");
    const result = nanosToLocalIsoDate(sec);
    expect(result).toBe("2026-04-01");
  });

  it("converts end-of-month timestamp correctly", () => {
    const sec = isoToSeconds("2026-05-31");
    const result = nanosToLocalIsoDate(sec);
    expect(result).toBe("2026-05-31");
  });

  it("converts first of June correctly", () => {
    const sec = isoToSeconds("2026-06-01");
    const result = nanosToLocalIsoDate(sec);
    expect(result).toBe("2026-06-01");
  });

  it("returns empty string for 0n", () => {
    expect(nanosToLocalIsoDate(0n)).toBe("");
  });

  it("returns empty string for undefined", () => {
    expect(nanosToLocalIsoDate(undefined)).toBe("");
  });

  it("returns empty string for null", () => {
    expect(nanosToLocalIsoDate(null)).toBe("");
  });
});

// ---------------------------------------------------------------------------
// getActiveEmploymentForDate
// ---------------------------------------------------------------------------

describe("getActiveEmploymentForDate", () => {
  const emp1 = makeEmployment("e1", "2026-04-01", "2026-05-31");

  it("returns employment when date is within Von–Bis range", () => {
    const result = getActiveEmploymentForDate([emp1], "2026-04-16");
    expect(result).toBeDefined();
    expect(result?.id).toBe("e1");
  });

  it("returns employment when date equals Von exactly", () => {
    const result = getActiveEmploymentForDate([emp1], "2026-04-01");
    expect(result).toBeDefined();
    expect(result?.id).toBe("e1");
  });

  it("returns employment when date equals Bis exactly", () => {
    const result = getActiveEmploymentForDate([emp1], "2026-05-31");
    expect(result).toBeDefined();
    expect(result?.id).toBe("e1");
  });

  it("returns undefined when date is before Von", () => {
    const result = getActiveEmploymentForDate([emp1], "2026-03-31");
    expect(result).toBeUndefined();
  });

  it("returns undefined when date is after Bis", () => {
    const result = getActiveEmploymentForDate([emp1], "2026-06-01");
    expect(result).toBeUndefined();
  });

  it("returns employment for open-ended (bis=0n) when date >= Von", () => {
    const openEmp = makeEmployment("e-open", "2026-06-01", null);
    const result = getActiveEmploymentForDate([openEmp], "2026-07-15");
    expect(result).toBeDefined();
    expect(result?.id).toBe("e-open");
  });

  it("returns undefined for open-ended when date < Von", () => {
    const openEmp = makeEmployment("e-open", "2026-06-01", null);
    const result = getActiveEmploymentForDate([openEmp], "2026-05-31");
    expect(result).toBeUndefined();
  });

  it("returns correct employment from two employments — first valid (April)", () => {
    const emp2 = makeEmployment("e2", "2026-06-01", null);
    const result = getActiveEmploymentForDate([emp1, emp2], "2026-04-16");
    expect(result).toBeDefined();
    expect(result?.id).toBe("e1");
  });

  it("returns correct employment from two employments — second valid (June)", () => {
    const emp2 = makeEmployment("e2", "2026-06-01", null);
    const result = getActiveEmploymentForDate([emp1, emp2], "2026-06-15");
    expect(result).toBeDefined();
    expect(result?.id).toBe("e2");
  });

  it("returns undefined when employments array is empty", () => {
    const result = getActiveEmploymentForDate([], "2026-04-16");
    expect(result).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// getEmploymentMinutesForDate
// ---------------------------------------------------------------------------

describe("getEmploymentMinutesForDate", () => {
  it("returns 480 minutes for Monday with 8h employment", () => {
    const emp = makeEmployment("e1", "2026-04-01", "2026-05-31", {
      stundenMo: 480n,
    });
    // 2026-04-13 is a Monday
    const result = getEmploymentMinutesForDate(emp, "2026-04-13");
    expect(result).toBe(480);
  });

  it("returns 0 for Saturday with 5-day employment", () => {
    const emp = makeEmployment("e1", "2026-04-01", "2026-05-31", {
      stundenSa: 0n,
    });
    // 2026-04-18 is a Saturday
    const result = getEmploymentMinutesForDate(emp, "2026-04-18");
    expect(result).toBe(0);
  });

  it("returns 0 for Sunday with 5-day employment", () => {
    const emp = makeEmployment("e1", "2026-04-01", "2026-05-31", {
      stundenSo: 0n,
    });
    // 2026-04-19 is a Sunday
    const result = getEmploymentMinutesForDate(emp, "2026-04-19");
    expect(result).toBe(0);
  });

  it("returns 240 minutes for Wednesday partial day (4h employment)", () => {
    const emp = makeEmployment("e1", "2026-04-01", "2026-05-31", {
      stundenMi: 240n,
    });
    // 2026-04-15 is a Wednesday
    const result = getEmploymentMinutesForDate(emp, "2026-04-15");
    expect(result).toBe(240);
  });
});

// ---------------------------------------------------------------------------
// Ferien-Bezug Logik — countVacationDaysWithPensum
//
// Business rule: Only days with scheduled work minutes > 0 (per the active
// employment for that date) count against the vacation balance. Weekends and
// days explicitly configured as 0:00 do NOT reduce the balance even when an
// admin approves the request.
// ---------------------------------------------------------------------------

describe("Ferien-Bezug Logik", () => {
  // Standard Mo–Fr employment, Sa/So = 0 min
  const moFrEmp = makeEmployment("mofr", "2026-04-01", null, {
    stundenMo: 480n,
    stundenDi: 480n,
    stundenMi: 480n,
    stundenDo: 480n,
    stundenFr: 480n,
    stundenSa: 0n,
    stundenSo: 0n,
  });

  it("Ferien an Arbeitstag werden vom Guthaben abgezogen", () => {
    // 2026-04-13 is a Monday — work day, 480 min → counts as 1 day
    const result = countVacationDaysWithPensum("2026-04-13", "2026-04-13", [
      moFrEmp,
    ]);
    expect(result).toBe(1);
  });

  it("Ferien an Samstag werden NICHT vom Guthaben abgezogen", () => {
    // 2026-04-18 is a Saturday — 0 min → counts as 0 days
    const result = countVacationDaysWithPensum("2026-04-18", "2026-04-18", [
      moFrEmp,
    ]);
    expect(result).toBe(0);
  });

  it("Ferien von Fr bis Mo, nur Fr und Mo zählen (Sa/So nicht)", () => {
    // 2026-04-17 = Friday, 2026-04-18 = Saturday, 2026-04-19 = Sunday, 2026-04-20 = Monday
    // Only Fri (480 min) + Mon (480 min) = 2 days
    const result = countVacationDaysWithPensum("2026-04-17", "2026-04-20", [
      moFrEmp,
    ]);
    expect(result).toBe(2);
  });

  it("Ferien an Tag mit 0:00 Stunden gemäss Beschäftigung (nicht Sa/So) werden NICHT abgezogen", () => {
    // 50% employment: Mo=480, Di=480, Mi=240, Do=0, Fr=0
    const halfEmp = makeEmployment("half", "2026-04-01", null, {
      stundenMo: 480n,
      stundenDi: 480n,
      stundenMi: 240n,
      stundenDo: 0n,
      stundenFr: 0n,
      stundenSa: 0n,
      stundenSo: 0n,
    });
    // 2026-04-16 is a Thursday → 0 min → should NOT count
    const result = countVacationDaysWithPensum("2026-04-16", "2026-04-16", [
      halfEmp,
    ]);
    expect(result).toBe(0);
  });

  it("Ferien ohne gültige Beschäftigung werden NICHT abgezogen", () => {
    // Empty employment list → no active employment → 0 days
    const result = countVacationDaysWithPensum("2026-04-13", "2026-04-13", []);
    expect(result).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Dashboard calculations — Soll-Stunden, Ist-Stunden, Arbeitszeitsaldo
// ---------------------------------------------------------------------------

describe("Dashboard-Berechnungen", () => {
  // Standard Mo–Fr 8h/day employment, open-ended
  const fullTimeEmp = makeEmployment("ft", "2026-04-01", null, {
    stundenMo: 480n,
    stundenDi: 480n,
    stundenMi: 480n,
    stundenDo: 480n,
    stundenFr: 480n,
    stundenSa: 0n,
    stundenSo: 0n,
  });

  it("Soll-Stunden Woche: Mo–Fr mit 8h Beschäftigung = 40h (2400 Minuten)", () => {
    // Week of 2026-04-13 (Mon) to 2026-04-17 (Fri)
    const weekDays = [
      "2026-04-13",
      "2026-04-14",
      "2026-04-15",
      "2026-04-16",
      "2026-04-17",
      "2026-04-18",
      "2026-04-19",
    ];
    let totalMinutes = 0;
    for (const day of weekDays) {
      const emp = getActiveEmploymentForDate([fullTimeEmp], day);
      if (emp) {
        totalMinutes += getEmploymentMinutesForDate(emp, day);
      }
    }
    // Mon–Fri = 5 × 480 = 2400 min = 40h; Sa/So = 0
    expect(totalMinutes).toBe(2400);
  });

  it("Soll-Stunden Woche: Sa und So tragen 0 Minuten bei", () => {
    const saturday = "2026-04-18";
    const sunday = "2026-04-19";
    const emp = getActiveEmploymentForDate([fullTimeEmp], saturday);
    expect(emp).toBeDefined();
    expect(getEmploymentMinutesForDate(emp!, saturday)).toBe(0);
    const emp2 = getActiveEmploymentForDate([fullTimeEmp], sunday);
    expect(emp2).toBeDefined();
    expect(getEmploymentMinutesForDate(emp2!, sunday)).toBe(0);
  });

  it("Soll-Stunden kumuliert: 2 Wochen Mo–Fr 8h = 80h (4800 Minuten)", () => {
    // 2026-04-06 Mon to 2026-04-19 Sun
    let totalMinutes = 0;
    const start = new Date("2026-04-06T12:00:00");
    const end = new Date("2026-04-19T12:00:00");
    const cursor = new Date(start);
    while (cursor <= end) {
      const y = cursor.getFullYear();
      const m = String(cursor.getMonth() + 1).padStart(2, "0");
      const d = String(cursor.getDate()).padStart(2, "0");
      const dayIso = `${y}-${m}-${d}`;
      const emp = getActiveEmploymentForDate([fullTimeEmp], dayIso);
      if (emp) totalMinutes += getEmploymentMinutesForDate(emp, dayIso);
      cursor.setDate(cursor.getDate() + 1);
    }
    // 10 workdays × 480 = 4800 min = 80h
    expect(totalMinutes).toBe(4800);
  });

  it("Arbeitszeitsaldo Saldo: Ist minus Soll = korrektes Ergebnis", () => {
    // Soll for 1 workday: 480 min
    const emp = getActiveEmploymentForDate([fullTimeEmp], "2026-04-13");
    const soll = getEmploymentMinutesForDate(emp!, "2026-04-13");
    // Ist: 360 min (only 6h worked)
    const ist = 360;
    const saldo = ist - soll;
    expect(saldo).toBe(-120); // -2h Minusstunden
  });

  it("Arbeitszeitsaldo positiv: Überzeit wenn Ist > Soll", () => {
    const emp = getActiveEmploymentForDate([fullTimeEmp], "2026-04-13");
    const soll = getEmploymentMinutesForDate(emp!, "2026-04-13");
    const ist = 600; // 10h worked
    const saldo = ist - soll;
    expect(saldo).toBe(120); // +2h Überzeit
  });
});

// ---------------------------------------------------------------------------
// Feriensaldo "Bezogen" — new edge-case tests (Item 1 fix verification)
// ---------------------------------------------------------------------------

describe("Feriensaldo Bezogen — Korrekte Berechnung (multi-day, partial, spanning)", () => {
  // Standard Mo–Fr 8h/day, open-ended
  const stdEmp = makeEmployment("std", "2026-01-01", null, {
    stundenMo: 480n,
    stundenDi: 480n,
    stundenMi: 480n,
    stundenDo: 480n,
    stundenFr: 480n,
    stundenSa: 0n,
    stundenSo: 0n,
  });

  it("Multi-day Ferien Mo–So: nur Mo–Fr zählen = 5 Tage", () => {
    // 2026-04-13 (Mon) to 2026-04-19 (Sun) = 7 calendar days, 5 workdays
    const result = countVacationDaysProportional(
      "2026-04-13",
      "2026-04-19",
      true,
      0,
      [stdEmp],
    );
    expect(result).toBe(5);
  });

  it("Multi-day Ferien Fr–Mo: nur Fr und Mo = 2 Tage", () => {
    // 2026-04-17 (Fri) to 2026-04-20 (Mon)
    const result = countVacationDaysProportional(
      "2026-04-17",
      "2026-04-20",
      true,
      0,
      [stdEmp],
    );
    expect(result).toBe(2);
  });

  it("Partial Ferien 4h von 8h Soll = 0.5 Tage (anteilsmässig)", () => {
    // 2026-04-13 (Mon), ganztaetig=false, dauer=240 min (4h), Soll=480 min → 0.5
    const result = countVacationDaysProportional(
      "2026-04-13",
      "2026-04-13",
      false,
      240,
      [stdEmp],
    );
    expect(result).toBe(0.5);
  });

  it("Ferien an Tag ohne Pensum (Samstag) = 0 Tage", () => {
    // 2026-04-18 (Sat), stundenSa=0 → 0 days deducted even if approved
    const result = countVacationDaysProportional(
      "2026-04-18",
      "2026-04-18",
      true,
      0,
      [stdEmp],
    );
    expect(result).toBe(0);
  });

  it("Ferien an Sonntag = 0 Tage", () => {
    const result = countVacationDaysProportional(
      "2026-04-19",
      "2026-04-19",
      false,
      480,
      [stdEmp],
    );
    expect(result).toBe(0);
  });

  it("Multi-day Ferien spanning employment change: uses correct employment per day", () => {
    // First employment: 50% (Apr), Mon=480, Tue=480, Wed=240, Thu=0, Fri=0
    const halfEmp = makeEmployment("half", "2026-04-01", "2026-04-30", {
      stundenMo: 480n,
      stundenDi: 480n,
      stundenMi: 240n,
      stundenDo: 0n,
      stundenFr: 0n,
      stundenSa: 0n,
      stundenSo: 0n,
    });
    // Second employment: 100% (May+), Mon=480, ..., Fri=480
    const fullEmp = makeEmployment("full", "2026-05-01", null, {
      stundenMo: 480n,
      stundenDi: 480n,
      stundenMi: 480n,
      stundenDo: 480n,
      stundenFr: 480n,
      stundenSa: 0n,
      stundenSo: 0n,
    });
    // Vacation Mon Apr 27 to Fri May 1:
    // Apr 27 (Mon) = halfEmp → 480 min > 0 → 1 day
    // Apr 28 (Tue) = halfEmp → 480 min > 0 → 1 day
    // Apr 29 (Wed) = halfEmp → 240 min > 0 → 1 day
    // Apr 30 (Thu) = halfEmp → 0 min → 0 days
    // May 1 (Fri) = fullEmp → 480 min > 0 → 1 day
    // Total: 4 days
    const result = countVacationDaysProportional(
      "2026-04-27",
      "2026-05-01",
      true,
      0,
      [halfEmp, fullEmp],
    );
    expect(result).toBe(4);
  });

  it("Partial Ferien capped at 1 Tag: dauer >= Soll = max 1 Tag", () => {
    // 2026-04-13 (Mon), dauer=600 min > Soll=480 min → capped at 1
    const result = countVacationDaysProportional(
      "2026-04-13",
      "2026-04-13",
      false,
      600,
      [stdEmp],
    );
    expect(result).toBe(1);
  });
});

describe("Anteilsmässiger Ferienbezug (countVacationDaysProportional)", () => {
  const moFrEmp = makeEmployment("mofr", "2026-04-01", null, {
    stundenMo: 480n,
    stundenDi: 480n,
    stundenMi: 480n,
    stundenDo: 480n,
    stundenFr: 480n,
    stundenSa: 0n,
    stundenSo: 0n,
  });

  it("Ganztägige Ferien an Arbeitstag = 1 Tag abgezogen", () => {
    // 2026-04-13 is Monday, ganztaetig=true → 1 day
    const result = countVacationDaysProportional(
      "2026-04-13",
      "2026-04-13",
      true,
      0,
      [moFrEmp],
    );
    expect(result).toBe(1);
  });

  it("Partial Ferien 4h von 8h Soll = 0.5 Tage abgezogen", () => {
    // 2026-04-13 Monday, ganztaetig=false, dauer=240 min (4h), Soll=480 min
    const result = countVacationDaysProportional(
      "2026-04-13",
      "2026-04-13",
      false,
      240,
      [moFrEmp],
    );
    expect(result).toBe(0.5);
  });

  it("Partial Ferien 8h von 8h Soll = 1 Tag (capped)", () => {
    // dauer=480 min = Soll → should be 1 day (not more)
    const result = countVacationDaysProportional(
      "2026-04-13",
      "2026-04-13",
      false,
      480,
      [moFrEmp],
    );
    expect(result).toBe(1);
  });

  it("Ferien an Tag ohne Pensum (Samstag) = 0 Tage abgezogen", () => {
    // 2026-04-18 is Saturday, stundenSa=0 → 0 days regardless of ganztaetig
    const resultFull = countVacationDaysProportional(
      "2026-04-18",
      "2026-04-18",
      true,
      0,
      [moFrEmp],
    );
    expect(resultFull).toBe(0);
    const resultPartial = countVacationDaysProportional(
      "2026-04-18",
      "2026-04-18",
      false,
      240,
      [moFrEmp],
    );
    expect(resultPartial).toBe(0);
  });

  it("Ganztägige Ferien Fr–Mo: nur Fr und Mo zählen = 2 Tage", () => {
    // Fr 2026-04-17, Sa 2026-04-18, So 2026-04-19, Mo 2026-04-20
    const result = countVacationDaysProportional(
      "2026-04-17",
      "2026-04-20",
      true,
      0,
      [moFrEmp],
    );
    expect(result).toBe(2);
  });

  it("Ferien ohne Beschäftigung = 0 Tage abgezogen", () => {
    const result = countVacationDaysProportional(
      "2026-04-13",
      "2026-04-13",
      true,
      0,
      [],
    );
    expect(result).toBe(0);
  });

  it("countVacationDaysWithPensum (wrapper) gibt ganztägige Tage korrekt zurück", () => {
    // Wrapper must behave identically to countVacationDaysProportional(ganztaetig=true)
    const result = countVacationDaysWithPensum("2026-04-13", "2026-04-17", [
      moFrEmp,
    ]);
    expect(result).toBe(5); // Mon–Fri = 5 workdays
  });
});
