// Domaenenlogik fuer Periodenabschluss (iReport Onchain V3.1)
import Time "mo:core/Time";
import Int "mo:core/Int";

import PeriodCloseTypes "../types/period-close";
import CommonTypes "../types/common";

module {
  public type PeriodClose = PeriodCloseTypes.PeriodClose;
  public type PeriodCloseId = PeriodCloseTypes.PeriodCloseId;
  public type CompanyId = CommonTypes.CompanyId;
  public type EmployeeId = CommonTypes.EmployeeId;

  // Erzeugt eine neue PeriodCloseId aus tenantId, employeeId und Monat/Jahr
  public func buildCloseId(
    tenantId   : CompanyId,
    employeeId : ?EmployeeId,
    month      : Nat,
    year       : Nat,
  ) : PeriodCloseId {
    let empPart = switch (employeeId) {
      case null { "all" };
      case (?eid) { eid.toText() };
    };
    "PC-" # tenantId.toText() # "-" # empPart # "-" # year.toText() # "-" # month.toText();
  };

  // Berechnet den Anfang eines Monats in Nanosekunden (1. des Monats, 00:00 UTC)
  // Vereinfacht: year*365.25*24*3600 + month-offset (Nanosekunden)
  public func monthStartNs(year : Nat, month : Nat) : Int {
    // Tage pro Monat (keine Schaltjahr-Korrektur fuer einfache Grenzpruefung)
    let daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    // Berechnung Unix-Epoch in Tagen bis Jahresanfang
    let y : Int = year.toInt();
    let m : Int = month.toInt();
    // Tage seit Unix-Epoch 1970-01-01
    let yearsSince1970 = y - 1970;
    let leapYears = (yearsSince1970 + 1) / 4; // Vereinfacht
    var dayOfYear : Int = 0;
    var i : Int = 1;
    while (i < m) {
      let idx : Nat = (i - 1).toNat();
      dayOfYear += daysInMonth[idx].toInt();
      i += 1;
    };
    let totalDays : Int = yearsSince1970 * 365 + leapYears + dayOfYear;
    totalDays * 24 * 3600 * 1_000_000_000;
  };

  // Berechnet das Monatsende in Nanosekunden (letzter Tag, 23:59:59)
  public func monthEndNs(year : Nat, month : Nat) : Int {
    let daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    let idx : Nat = (month - 1);
    let days : Int = daysInMonth[idx].toInt();
    monthStartNs(year, month) + (days * 24 * 3600 - 1) * 1_000_000_000;
  };

  // Prueft ob ein Nanosekunden-Timestamp in einem Monat liegt
  public func isInMonth(dateNs : Int, year : Nat, month : Nat) : Bool {
    dateNs >= monthStartNs(year, month) and dateNs <= monthEndNs(year, month);
  };

  // Leitet Monat und Jahr aus einem Nanosekunden-Timestamp ab
  public func monthYearFromNs(dateNs : Int) : (Nat, Nat) {
    let secondsSinceEpoch = dateNs / 1_000_000_000;
    let days = secondsSinceEpoch / 86400;
    // Naeherung: Jahr
    var year : Int = 1970;
    var remaining = days;
    while (remaining >= 365) {
      let daysInYear : Int = if ((year - 1972) % 4 == 0) 366 else 365;
      if (remaining >= daysInYear) {
        remaining -= daysInYear;
        year += 1;
      } else {
        remaining := 365; // force exit
      };
    };
    // Naeherung: Monat
    let daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    var month : Int = 1;
    var rem2 = remaining;
    var cont = true;
    while (cont and month <= 12) {
      let idx : Nat = (month - 1).toNat();
      let dim = daysInMonth[idx].toInt();
      if (rem2 >= dim) {
        rem2 -= dim;
        month += 1;
      } else {
        cont := false;
      };
    };
    if (month > 12) { month := 12 };
    (year.toNat(), month.toNat());
  };

  // Prueft, ob eine Periode editierbar ist (direkt via Monat/Jahr, keine Timestamp-Konvertierung).
  // Gibt #ok zurueck wenn editierbar, #err mit Meldung wenn gesperrt.
  public func checkPeriodEditableByMonthYear(
    closes     : [(PeriodCloseId, PeriodClose)],
    tenantId   : CompanyId,
    employeeId : EmployeeId,
    month      : Nat,
    year       : Nat,
  ) : CommonTypes.Result<()> {
    // Suche nach einem aktiven Abschlusseintrag fuer diesen Mitarbeiter und Monat
    for ((_, pc) in closes.vals()) {
      if (pc.tenantId == tenantId) {
        // Gilt entweder spezifisch fuer diesen Mitarbeiter oder fuer alle (employeeId = null)
        let matchesEmployee = switch (pc.employeeId) {
          case null { true }; // Mandantenweiter Abschluss betrifft alle
          case (?eid) { eid == employeeId };
        };
        if (matchesEmployee and pc.month == month and pc.year == year) {
          switch (pc.status) {
            case (#closed) {
              return #err("Diese Periode ist abgeschlossen. Aenderungen sind nicht mehr moeglich. Bitte wenden Sie sich an Ihren Firmenadministrator.");
            };
            case (#ready_for_close) {
              // Noch nicht final gesperrt – Bearbeitung erlaubt
            };
            case (#open) {};
            case (#reopened) {}; // Wiedereroeffnet – Bearbeitung erlaubt
          };
        };
      };
    };
    #ok(());
  };

  // Kompatibilitaets-Wrapper: nimmt Nanosekunden-Timestamp, leitet auf checkPeriodEditableByMonthYear um.
  public func checkPeriodEditable(
    closes     : [(PeriodCloseId, PeriodClose)],
    tenantId   : CompanyId,
    employeeId : EmployeeId,
    dateNs     : Int,
  ) : CommonTypes.Result<()> {
    let (year, month) = monthYearFromNs(dateNs);
    checkPeriodEditableByMonthYear(closes, tenantId, employeeId, month, year);
  };

  // Fuehrt die Vorpruefung vor einem Abschluss durch
  public func runPrecheck(
    tenantId             : CompanyId,
    employeeId           : EmployeeId,
    month                : Nat,
    year                 : Nat,
    config               : PeriodCloseTypes.PeriodCloseConfig,
    openTimeEntries      : Nat,
    openAbsences         : Nat,
    openExpenses         : Nat,
    complianceViolations : Nat,
    missingDays          : Nat,
  ) : PeriodCloseTypes.PrecheckResult {
    ignore (tenantId, employeeId, month, year);
    var blockers : [Text] = [];
    var warnings : [Text] = [];

    // Offene/provisorische Zeiteintraege
    if (openTimeEntries > 0) {
      if (config.allowCloseWithOpenTimeEntries) {
        warnings := warnings.concat(["Es gibt " # openTimeEntries.toText() # " nicht validierte Zeiteintraege."]);
      } else {
        blockers := blockers.concat(["Es gibt " # openTimeEntries.toText() # " nicht validierte Zeiteintraege. Bitte zuerst validieren."]);
      };
    };

    // Offene Abwesenheitsantraege
    if (openAbsences > 0) {
      if (config.allowCloseWithOpenAbsences) {
        warnings := warnings.concat(["Es gibt " # openAbsences.toText() # " offene Abwesenheitsantraege."]);
      } else {
        blockers := blockers.concat(["Es gibt " # openAbsences.toText() # " offene Abwesenheitsantraege. Bitte zuerst genehmigen oder ablehnen."]);
      };
    };

    // Offene Spesen
    if (openExpenses > 0) {
      if (config.allowCloseWithOpenExpenses) {
        warnings := warnings.concat(["Es gibt " # openExpenses.toText() # " offene Spesen."]);
      } else {
        blockers := blockers.concat(["Es gibt " # openExpenses.toText() # " offene Spesen. Bitte zuerst verarbeiten."]);
      };
    };

    // Compliance-Verletzungen
    if (complianceViolations > 0) {
      if (config.allowCloseWithComplianceWarnings) {
        warnings := warnings.concat(["Es gibt " # complianceViolations.toText() # " Compliance-Warnungen."]);
      } else {
        blockers := blockers.concat(["Es gibt " # complianceViolations.toText() # " Compliance-Verletzungen."]);
      };
    };

    // Fehlende Tage
    if (missingDays > 0) {
      warnings := warnings.concat(["Es fehlen Zeiterfassungen fuer " # missingDays.toText() # " Arbeitstage."]);
    };

    let hasBlockers = blockers.size() > 0;
    let hasWarnings = warnings.size() > 0;
    let verdict : PeriodCloseTypes.PrecheckVerdict = if (hasBlockers) {
      #blocked;
    } else if (hasWarnings) {
      #ok_with_warnings;
    } else {
      #ok;
    };

    {
      canClose                = not hasBlockers;
      blockers;
      warnings;
      hasOpenEntries          = openTimeEntries > 0;
      hasOpenAbsences         = openAbsences > 0;
      hasOpenExpenses         = openExpenses > 0;
      hasComplianceViolations = complianceViolations > 0;
      missingDays;
      verdict;
    };
  };
};
