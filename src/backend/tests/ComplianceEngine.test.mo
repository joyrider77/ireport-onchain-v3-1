import { test; suite; expect } "mo:test";
import Nat32 "mo:core/Nat32";
import Char "mo:core/Char";
import Debug "mo:core/Debug";
import ComplianceLib "../lib/compliance";
import VacationLedgerLib "../lib/vacation-ledger";
import ComplianceTypes "../types/compliance";
import TrackingTypes "../types/timetracking";
import List "mo:core/List";

// Comprehensive Compliance-Engine unit tests.
// Tests use assert/Debug.trap to FAIL the build on threshold errors.

// ─── Standalone helpers ─────────────────────────────────────────────────────

func parseTimeToMinutes(t : Text) : Nat {
  let chars = t.chars();
  var h1 : Nat = 0; var h2 : Nat = 0;
  var m1 : Nat = 0; var m2 : Nat = 0;
  var idx = 0;
  for (c in chars) {
    switch (idx) {
      case 0 { h1 := (Nat32.toNat(Char.toNat32(c)) - 48) };
      case 1 { h2 := (Nat32.toNat(Char.toNat32(c)) - 48) };
      case 2 {};
      case 3 { m1 := (Nat32.toNat(Char.toNat32(c)) - 48) };
      case 4 { m2 := (Nat32.toNat(Char.toNat32(c)) - 48) };
      case _ {};
    };
    idx += 1;
  };
  (h1 * 10 + h2) * 60 + m1 * 10 + m2
};

func calcRestGap(endMin : Nat, startMin : Nat, extraDays : Nat) : Nat {
  let minutesPerDay = 1440;
  if (startMin + extraDays * minutesPerDay >= endMin) {
    startMin + extraDays * minutesPerDay - endMin
  } else {
    startMin + (extraDays + 1) * minutesPerDay - endMin
  }
};

func requiredPauseMinutes(workMin : Nat) : Nat {
  if (workMin > 540) { 60 }
  else if (workMin > 420) { 30 }
  else if (workMin > 330) { 15 }
  else { 0 }
};

type PauseComplianceResult = {
  isCompliant : Bool; requiredPauseMin : Nat;
  detectedPauseMin : Nat; status : Text;
};

func checkPauseCompliance(workMin : Nat, pauseMin : Nat) : PauseComplianceResult {
  let required = requiredPauseMinutes(workMin);
  if (required == 0) {
    { isCompliant = true; requiredPauseMin = 0; detectedPauseMin = pauseMin; status = "not_required" }
  } else if (pauseMin >= required) {
    { isCompliant = true; requiredPauseMin = required; detectedPauseMin = pauseMin; status = "ok" }
  } else {
    { isCompliant = false; requiredPauseMin = required; detectedPauseMin = pauseMin; status = "violation" }
  }
};

// ─── Base record templates ───────────────────────────────────────────────────

let baseEntry : TrackingTypes.TimeEntry = {
  id = 0; companyId = 1; employeeId = 1;
  projectId = 0; serviceTypeId = 0;
  date = "2026-05-19"; hours = 0.0;
  von = null; bis = null;
  description = ""; billable = false;
  createdAt = 0; fakturiertInRechnungId = null;
};

let baseAbsence : TrackingTypes.Absence = {
  id = 0; companyId = 1; employeeId = 1;
  absenceTypeId = 1;
  dateFrom = "2026-07-01"; dateTo = "2026-07-14";
  ganztaetig = true; dauer = 0;
  description = null; status = #approved;
  rejectionComment = null; resetReason = null;
  approvedBy = null; createdAt = 0;
};

// ─── Tests ──────────────────────────────────────────────────────────────────

suite("parseTimeToMinutes", func() {
  test("22:00 = 1320", func() { assert parseTimeToMinutes("22:00") == 1320 });
  test("05:00 = 300",  func() { assert parseTimeToMinutes("05:00") == 300  });
  test("08:00 = 480",  func() { assert parseTimeToMinutes("08:00") == 480  });
  test("00:00 = 0",    func() { assert parseTimeToMinutes("00:00") == 0    });
});

suite("Ruhezeit-Berechnung", func() {
  test("10h Ruhezeit – Verstoss unter 11h", func() {
    let gap = calcRestGap(parseTimeToMinutes("19:00"), parseTimeToMinutes("05:00"), 0);
    assert gap == 600; assert gap < 660;
  });
  test("Wochenende 58h – erfüllt", func() {
    let gap = calcRestGap(parseTimeToMinutes("22:00"), parseTimeToMinutes("08:00"), 2);
    assert gap == 3480; assert gap >= 660;
  });
  test("Gleiche Nacht 10h – Verstoss", func() {
    let gap = calcRestGap(parseTimeToMinutes("22:00"), parseTimeToMinutes("08:00"), 0);
    assert gap == 600; assert gap < 660;
  });
  test("Genau 11h – erfüllt (Grenzwert)", func() {
    let gap = calcRestGap(parseTimeToMinutes("21:00"), parseTimeToMinutes("08:00"), 0);
    assert gap == 660; assert gap >= 660;
  });
});

suite("Pausen-Compliance Schweizer Recht", func() {
  test("8h Arbeit 60min Pause – erfüllt", func() {
    let r = checkPauseCompliance(480, 60);
    assert r.isCompliant; assert r.requiredPauseMin == 30; assert r.status == "ok";
  });
  test("6h Arbeit 0min Pause – Verstoss (15min erforderlich)", func() {
    let r = checkPauseCompliance(360, 0);
    assert not r.isCompliant; assert r.requiredPauseMin == 15; assert r.status == "violation";
  });
  test("9h45m 15min Pause – Verstoss (60min erforderlich)", func() {
    let r = checkPauseCompliance(585, 15);
    assert not r.isCompliant; assert r.requiredPauseMin == 60;
  });
  test("5h Arbeit – keine Pause erforderlich", func() {
    let r = checkPauseCompliance(300, 0);
    assert r.isCompliant; assert r.requiredPauseMin == 0; assert r.status == "not_required";
  });
  test("Genau 5h30 – keine Pause erforderlich", func() {
    let r = checkPauseCompliance(330, 0);
    assert r.isCompliant; assert r.requiredPauseMin == 0;
  });
  test("5h31 14min Pause – Verstoss (15min erforderlich)", func() {
    let r = checkPauseCompliance(331, 14);
    assert not r.isCompliant; assert r.requiredPauseMin == 15;
  });
  test("7h01 30min Pause – erfüllt", func() {
    let r = checkPauseCompliance(421, 30);
    assert r.isCompliant; assert r.requiredPauseMin == 30;
  });
  test("9h01 59min Pause – Verstoss (60min erforderlich)", func() {
    let r = checkPauseCompliance(541, 59);
    assert not r.isCompliant; assert r.requiredPauseMin == 60;
  });
});

// ─── ComplianceLib.checkRestTimeViolations (real lib) ───────────────────────

suite("ComplianceLib Ruhezeit (real lib)", func() {

  test("10h59m – Verstoss unter 11h", func() {
    // 19:00 Ende → nächster Tag 05:59 = 10h59m = 659 Min < 660 Min
    let entries : [TrackingTypes.TimeEntry] = [
      { baseEntry with id = 1; date = "2026-05-19"; von = ?"08:00"; bis = ?"19:00"; hours = 11.0 },
      { baseEntry with id = 2; date = "2026-05-20"; von = ?"05:59"; bis = ?"15:00"; hours = 9.0 },
    ];
    let violations = ComplianceLib.checkRestTimeViolations(entries);
    if (not violations.any(func(r) { not r.isCompliant })) {
      Debug.trap("FAIL: 10h59m Ruhezeit sollte Verstoss sein");
    };
  });

  test("Genau 11h – erfüllt (Grenzwert)", func() {
    // 21:00 Ende → nächster Tag 08:00 = 11h genau
    let entries : [TrackingTypes.TimeEntry] = [
      { baseEntry with id = 3; date = "2026-05-19"; von = ?"08:00"; bis = ?"21:00"; hours = 13.0 },
      { baseEntry with id = 4; date = "2026-05-20"; von = ?"08:00"; bis = ?"16:00"; hours = 8.0 },
    ];
    let violations = ComplianceLib.checkRestTimeViolations(entries);
    if (not violations.all(func(r) { r.isCompliant })) {
      Debug.trap("FAIL: 11h Ruhezeit sollte erfüllt sein");
    };
  });

  test("Fr 22:00 → Mo 08:00 = 58h – erfüllt", func() {
    let entries : [TrackingTypes.TimeEntry] = [
      { baseEntry with id = 5; date = "2026-05-15"; von = ?"08:00"; bis = ?"22:00"; hours = 14.0 },
      { baseEntry with id = 6; date = "2026-05-18"; von = ?"08:00"; bis = ?"16:00"; hours = 8.0 },
    ];
    let violations = ComplianceLib.checkRestTimeViolations(entries);
    if (not violations.all(func(r) { r.isCompliant })) {
      Debug.trap("FAIL: Fr→Mo Wochenende sollte erfüllt sein");
    };
  });

});

// ─── Wochenruhezeit 35h ─────────────────────────────────────────────────────

suite("Wochenruhezeit 35h", func() {

  test("Keine Wochenendarbeit – kein Verstoss", func() {
    let entries : [TrackingTypes.TimeEntry] = [
      { baseEntry with id = 10; date = "2026-05-18"; von = ?"08:00"; bis = ?"17:00" },
      { baseEntry with id = 11; date = "2026-05-19"; von = ?"08:00"; bis = ?"17:00" },
    ];
    switch (ComplianceLib.checkWeekendRestTime(entries, "2026-05-18")) {
      case null {};
      case (?_) { Debug.trap("FAIL: Keine Wochenendarbeit erwartet keinen Verstoss") };
    };
  });

  test("Arbeit Sa 22:30–23:30 – liegt im Fenster = Verstoss", func() {
    let entries : [TrackingTypes.TimeEntry] = [
      { baseEntry with id = 12; date = "2026-05-23"; von = ?"22:30"; bis = ?"23:30" },
    ];
    switch (ComplianceLib.checkWeekendRestTime(entries, "2026-05-18")) {
      case null { Debug.trap("FAIL: Wochenendarbeit im Fenster muss Verstoss sein") };
      case (?f) {
        assert f.ruleCode == "WEEKEND_REST";
        assert f.severity == #BREACH;
      };
    };
  });

});

// ─── Überstunden-Prüfung ─────────────────────────────────────────────────────

suite("Überstunden-Prüfung", func() {

  let testProfile : ComplianceTypes.EmployeeComplianceProfile = {
    id = 1; employeeId = 1; companyId = 1; aktiv = true;
    vertraglicheWochenstunden = 40.0;
    gesetzlicheWochenhochstarbeitszeit = 45.0;
    gesetzlicherFerienanspruchWochen = 4.0;
    vertraglicheZusatzferienTage = 0.0;
    ausnahmeprofil = null; erfassungsModus = "VOLLSTAENDIG";
    createdAt = 0; updatedAt = 0;
  };

  test("42h Ist > 40h Soll → vertragliche Überstunden ~2h, keine gesetzliche", func() {
    // 5 × 8.4h = 42h via von/bis
    let entries : [TrackingTypes.TimeEntry] = [
      { baseEntry with id = 20; date = "2026-05-18"; von = ?"07:00"; bis = ?"15:24"; hours = 8.4 },
      { baseEntry with id = 21; date = "2026-05-19"; von = ?"07:00"; bis = ?"15:24"; hours = 8.4 },
      { baseEntry with id = 22; date = "2026-05-20"; von = ?"07:00"; bis = ?"15:24"; hours = 8.4 },
      { baseEntry with id = 23; date = "2026-05-21"; von = ?"07:00"; bis = ?"15:24"; hours = 8.4 },
      { baseEntry with id = 24; date = "2026-05-22"; von = ?"07:00"; bis = ?"15:24"; hours = 8.4 },
    ];
    let r = ComplianceLib.calculateWeeklyOvertime(entries, testProfile);
    if (r.contractualOvertimeH < 1.9 or r.contractualOvertimeH > 2.5) {
      Debug.trap("FAIL: vertragliche Überstunden erwartet ~2h, bekommen: " # ComplianceLib.floatToText(r.contractualOvertimeH, 2));
    };
    if (r.legalOvertimeH != 0.0) {
      Debug.trap("FAIL: gesetzliche Überzeit erwartet 0h, bekommen: " # ComplianceLib.floatToText(r.legalOvertimeH, 2));
    };
    assert r.contractualOvertimeH > 1.9;
    assert r.legalOvertimeH == 0.0;
  });

  test("46h Ist > 45h gesetzlich → gesetzliche Überzeit ~1h", func() {
    let entries : [TrackingTypes.TimeEntry] = [
      { baseEntry with id = 30; date = "2026-05-18"; hours = 9.2 },
      { baseEntry with id = 31; date = "2026-05-19"; hours = 9.2 },
      { baseEntry with id = 32; date = "2026-05-20"; hours = 9.2 },
      { baseEntry with id = 33; date = "2026-05-21"; hours = 9.2 },
      { baseEntry with id = 34; date = "2026-05-22"; hours = 9.2 },
    ];
    let r = ComplianceLib.calculateWeeklyOvertime(entries, testProfile);
    if (r.legalOvertimeH < 0.9 or r.legalOvertimeH > 1.1) {
      Debug.trap("FAIL: gesetzliche Überzeit erwartet ~1h, bekommen: " # ComplianceLib.floatToText(r.legalOvertimeH, 2));
    };
    assert r.contractualOvertimeH > 5.9;
    assert r.legalOvertimeH > 0.9;
  });

  test("38h Ist < 40h Soll → keine Überstunden", func() {
    let entries : [TrackingTypes.TimeEntry] = [
      { baseEntry with id = 35; date = "2026-05-18"; hours = 7.6 },
      { baseEntry with id = 36; date = "2026-05-19"; hours = 7.6 },
      { baseEntry with id = 37; date = "2026-05-20"; hours = 7.6 },
      { baseEntry with id = 38; date = "2026-05-21"; hours = 7.6 },
      { baseEntry with id = 39; date = "2026-05-22"; hours = 7.6 },
    ];
    let r = ComplianceLib.calculateWeeklyOvertime(entries, testProfile);
    assert r.contractualOvertimeH == 0.0;
    assert r.legalOvertimeH == 0.0;
  });

});

// ─── Ferienanspruch (Urs Ruflin case + allgemein) ────────────────────────────

suite("Ferienanspruch Berechnung", func() {

  test("U20 ganzes Jahr → 25 Tage", func() {
    let bdNs : Int = ComplianceLib.dateToUnixDays("2010-01-01") * 86_400_000_000_000;
    let e = ComplianceLib.calculateCalendarYearEntitlement(?bdNs, "2024-01-01", 2024, null);
    if (e != 25.0) {
      Debug.trap("FAIL: U20 ganzes Jahr erwartet 25.0, bekommen: " # ComplianceLib.floatToText(e, 2));
    };
    assert e == 25.0;
  });

  test("Ab20 ganzes Jahr → 20 Tage", func() {
    let bdNs : Int = ComplianceLib.dateToUnixDays("1990-01-01") * 86_400_000_000_000;
    let e = ComplianceLib.calculateCalendarYearEntitlement(?bdNs, "2024-01-01", 2024, null);
    if (e != 20.0) {
      Debug.trap("FAIL: Ab20 ganzes Jahr erwartet 20.0, bekommen: " # ComplianceLib.floatToText(e, 2));
    };
    assert e == 20.0;
  });

  test("Urs Ruflin: geb. 08.04.2006, eingetreten 01.05.2026 → 4-Wochen-Regel (bereits 20 am Eintritt)", func() {
    // 20. Geburtstag = 08.04.2026, Eintrittsdatum 01.05.2026 → er ist BEREITS >= 20
    // Im Zeitraum 01.05.–31.12.2026 gilt einheitlich 20-Tage-Satz
    // 245 Tage / 365 × 20 ≈ 13.42
    let bdNs : Int = ComplianceLib.dateToUnixDays("2006-04-08") * 86_400_000_000_000;
    let e = ComplianceLib.calculateCalendarYearEntitlement(?bdNs, "2026-05-01", 2026, null);
    if (e >= 17.0) {
      Debug.trap("FAIL: Urs Ruflin erwartet ~13.42 Tage (4-Wochen-Regel), bekommen: " # ComplianceLib.floatToText(e, 2));
    };
    if (e < 12.0) {
      Debug.trap("FAIL: Urs Ruflin erwartet >= 12 Tage, bekommen: " # ComplianceLib.floatToText(e, 2));
    };
    assert e < 17.0; assert e > 12.0; assert e < 20.0;
  });

  test("Split-Jahr: 20. Geburtstag 10.09.2004 fällt ins Jahr 2024", func() {
    let bdNs : Int = ComplianceLib.dateToUnixDays("2004-09-10") * 86_400_000_000_000;
    let e = ComplianceLib.calculateCalendarYearEntitlement(?bdNs, "2024-03-15", 2024, null);
    assert e > 20.0; assert e < 25.0;
  });

  test("Pro-rata Eintrittsjahr: Eintritt 01.07.2024 → ca. halbes Jahr", func() {
    let bdNs : Int = ComplianceLib.dateToUnixDays("1990-01-01") * 86_400_000_000_000;
    let e = ComplianceLib.calculateCalendarYearEntitlement(?bdNs, "2024-07-01", 2024, null);
    assert e > 9.5; assert e < 11.0; assert e < 20.0;
  });

  test("Pro-rata Austrittsjahr: Austritt 30.06.2025", func() {
    let bdNs : Int = ComplianceLib.dateToUnixDays("1990-01-01") * 86_400_000_000_000;
    let e = ComplianceLib.calculateCalendarYearEntitlement(?bdNs, "2024-01-01", 2025, ?"2025-06-30");
    assert e > 9.0; assert e < 11.0; assert e < 20.0;
  });

});

// ─── Zwei-Wochen-Block Ferien ─────────────────────────────────────────────────

suite("Zwei-Wochen-Block Ferien", func() {

  test("14 KT zusammenhängend – erfüllt (10 AT)", func() {
    // 01.07.2026 (Mi) – 14.07.2026 (Di) = 10 Arbeitstage
    let absences : [TrackingTypes.Absence] = [
      { baseAbsence with id = 1; dateFrom = "2026-07-01"; dateTo = "2026-07-14"; status = #approved },
    ];
    let r = ComplianceLib.checkTwoWeekVacationBlock(absences, "2026-01-01", "2026-12-31", 10);
    if (not r.satisfied) { Debug.trap("FAIL: 14-Tage-Block muss erfüllt sein") };
    assert r.satisfied; assert not r.warningTriggered;
  });

  test("Mo 04.05 – Fr 15.05.2026 = 10 Arbeitstage → 2-Wochen-Block erfüllt", func() {
    // Mo 04.05.2026 bis Fr 15.05.2026 = genau 2 Kalenderwochen, 10 Arbeitstage
    let absences : [TrackingTypes.Absence] = [
      { baseAbsence with id = 10; dateFrom = "2026-05-04"; dateTo = "2026-05-15"; status = #approved },
    ];
    let r = ComplianceLib.checkTwoWeekVacationBlock(absences, "2026-01-01", "2026-12-31", 10);
    if (not r.satisfied) {
      Debug.trap("FAIL: Mo 04.05–Fr 15.05 = 10 AT, Block muss erfüllt sein");
    };
    assert r.satisfied;
  });

  test("5 KT Block – nicht erfüllt", func() {
    let absences : [TrackingTypes.Absence] = [
      { baseAbsence with id = 2; dateFrom = "2026-07-01"; dateTo = "2026-07-05"; status = #approved },
    ];
    let r = ComplianceLib.checkTwoWeekVacationBlock(absences, "2026-01-01", "2026-12-31", 10);
    if (r.satisfied) { Debug.trap("FAIL: 5-Tage-Block darf nicht erfüllt sein") };
    assert not r.satisfied; assert r.warningTriggered;
  });

  test("Keine Ferien – nicht erfüllt", func() {
    let r = ComplianceLib.checkTwoWeekVacationBlock([], "2026-01-01", "2026-12-31", 10);
    assert not r.satisfied; assert r.longestBlock == 0;
  });

  test("Urs Ruflin: age >= 20 on hireDate 01.05.2026 (geb. 08.04.2006) → adult rule, not U20", func() {
    // Geburtstag 08.04.2006, 20. Geburtstag = 08.04.2026
    // Eintrittsdatum 01.05.2026 → er ist bereits 20 → 4-Wochen-Regel (20 Tage)
    let bdNs : Int = ComplianceLib.dateToUnixDays("2006-04-08") * 86_400_000_000_000;
    let e = ComplianceLib.calculateCalendarYearEntitlement(?bdNs, "2026-05-01", 2026, null);
    // Adult rule: 20 × 245/365 ≈ 13.42 → must be < 17 (not U20 = 25 × 245/365 ≈ 16.78)
    if (e >= 17.0) {
      Debug.trap("FAIL: Urs Ruflin (20 am Eintrittsdatum) muss 4-Wochen-Regel bekommen, erhalten: " # ComplianceLib.floatToText(e, 2));
    };
    assert e < 17.0;
    assert e > 12.0;
  });

});

// ─── VacationLedger pro-rata ─────────────────────────────────────────────────

suite("VacationLedger pro-rata", func() {

  test("Eintrittsjahr-Ledger: Eintritt 01.07.2025 → < 20 Tage", func() {
    let ledgers = List.empty<ComplianceTypes.VacationLedger>();
    let nextId = { var value : Nat = 1 };
    let bdNs : Int = ComplianceLib.dateToUnixDays("1990-01-01") * 86_400_000_000_000;
    let l = VacationLedgerLib.upsertCalendarYearLedger(
      ledgers, nextId, 1, 1, "2025", "2025-07-01", null, ?bdNs, 0.0, [], 10);
    if (l.gesetzlicheFerientage >= 20.0) {
      Debug.trap("FAIL: Eintrittsjahr-Ledger erwartet < 20, bekommen: " # ComplianceLib.floatToText(l.gesetzlicheFerientage, 2));
    };
    assert l.gesetzlicheFerientage < 20.0; assert l.gesetzlicheFerientage > 9.0;
  });

  test("Volles Jahr 2024: Eintritt 01.01.2024 → 20 Tage", func() {
    let ledgers = List.empty<ComplianceTypes.VacationLedger>();
    let nextId = { var value : Nat = 1 };
    let bdNs : Int = ComplianceLib.dateToUnixDays("1990-01-01") * 86_400_000_000_000;
    let l = VacationLedgerLib.upsertCalendarYearLedger(
      ledgers, nextId, 1, 1, "2024", "2024-01-01", null, ?bdNs, 0.0, [], 10);
    if (l.gesetzlicheFerientage != 20.0) {
      Debug.trap("FAIL: Volles Jahr erwartet 20.0, bekommen: " # ComplianceLib.floatToText(l.gesetzlicheFerientage, 2));
    };
    assert l.gesetzlicheFerientage == 20.0;
  });

  test("Austrittsjahr-Ledger: Austritt 30.06.2025 → < 20 Tage", func() {
    let ledgers = List.empty<ComplianceTypes.VacationLedger>();
    let nextId = { var value : Nat = 1 };
    let bdNs : Int = ComplianceLib.dateToUnixDays("1990-01-01") * 86_400_000_000_000;
    let l = VacationLedgerLib.upsertCalendarYearLedger(
      ledgers, nextId, 1, 1, "2025", "2024-01-01", ?"2025-06-30", ?bdNs, 0.0, [], 10);
    if (l.gesetzlicheFerientage >= 20.0) {
      Debug.trap("FAIL: Austrittsjahr erwartet < 20, bekommen: " # ComplianceLib.floatToText(l.gesetzlicheFerientage, 2));
    };
    assert l.gesetzlicheFerientage < 20.0; assert l.gesetzlicheFerientage > 9.0;
  });

  test("Urs Ruflin Ledger 2026: Eintritt 01.05.2026, geb. 08.04.2006 → ~13.42 Tage", func() {
    let ledgers = List.empty<ComplianceTypes.VacationLedger>();
    let nextId = { var value : Nat = 1 };
    let bdNs : Int = ComplianceLib.dateToUnixDays("2006-04-08") * 86_400_000_000_000;
    let l = VacationLedgerLib.upsertCalendarYearLedger(
      ledgers, nextId, 99, 1, "2026", "2026-05-01", null, ?bdNs, 0.0, [], 10);
    if (l.gesetzlicheFerientage >= 17.0) {
      Debug.trap("FAIL: Urs Ruflin Ledger erwartet ~13.42 (4-Wochen-Regel), bekommen: " # ComplianceLib.floatToText(l.gesetzlicheFerientage, 2));
    };
    assert l.gesetzlicheFerientage < 17.0; assert l.gesetzlicheFerientage > 12.0;
  });

});
