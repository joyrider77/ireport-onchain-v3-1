// VacationLedger Management – Kalenderjährliche Ferienverwaltung
import List "mo:core/List";
import Array "mo:core/Array";
import Int "mo:core/Int";
import Time "mo:core/Time";
import ComplianceTypes "../types/compliance";
import TrackingTypes "../types/timetracking";
import ComplianceLib "compliance";

module {

  // Extrahiert den Jahreszahl-String aus einem calendarYearKey ("2024" → 2024)
  private func calendarYearToInt(key : Text) : Int {
    switch (Int.fromText(key)) { case (?y) y; case null 0 };
  };

  // Erstellt einen neuen VacationLedger-Eintrag für ein Kalenderjahr
  private func makeLedger(
    id : Nat,
    employeeId : Nat,
    companyId : Nat,
    calendarYearKey : Text,
    hireDate : Text,
    exitDate : ?Text,
    geburtsdatum : ?Int,
    vertraglicheZusatzferienTage : Float,
    absences : [TrackingTypes.Absence],
    minBlockDays : Nat,
    now : Int,
  ) : ComplianceTypes.VacationLedger {
    let year = calendarYearToInt(calendarYearKey);
    let jan1 = calendarYearKey # "-01-01";
    let dec31 = calendarYearKey # "-12-31";
    let periodStart = if (hireDate > jan1) { hireDate } else { jan1 };
    let periodEnd : Text = switch (exitDate) {
      case null { dec31 };
      case (?ex) { if (ex < dec31) { ex } else { dec31 } };
    };
    let startNs = ComplianceLib.dateToNs(periodStart);
    let endNs   = ComplianceLib.dateToNs(periodEnd);

    let gesetzlicheFerientage = ComplianceLib.calculateCalendarYearEntitlement(
      geburtsdatum, hireDate, year, exitDate
    );
    let todayStr = ComplianceLib.today();

    // Ferien im Zeitraum
    let ferienImZR = absences.filter(func(ab : TrackingTypes.Absence) : Bool {
      ab.employeeId == employeeId and ab.companyId == companyId
        and ab.dateFrom >= periodStart and ab.dateTo <= periodEnd;
    });

    var bezogeneFerientage = 0.0;
    var geplanteFerientage = 0.0;
    for (ab in ferienImZR.values()) {
      let days = ComplianceLib.dateToUnixDays(ab.dateTo) - ComplianceLib.dateToUnixDays(ab.dateFrom) + 1;
      let daysFloat = days.toFloat();
      if (ab.status == #approved) {
        if (ab.dateTo <= todayStr) {
          bezogeneFerientage += daysFloat;
        } else {
          geplanteFerientage += daysFloat;
        };
      } else if (ab.status == #submitted) {
        geplanteFerientage += daysFloat;
      };
    };

    let verbleibendeFerientage = gesetzlicheFerientage + vertraglicheZusatzferienTage - bezogeneFerientage;
    let blockResult = ComplianceLib.checkTwoWeekVacationBlock(
      ferienImZR, periodStart, periodEnd, minBlockDays
    );
    {
      id;
      employeeId;
      companyId;
      serviceYearKey = calendarYearKey; // Legacy-Feld mit calendarYearKey befüllen
      calendarYearKey;
      serviceYearStart = startNs;
      serviceYearEnd   = endNs;
      gesetzlicheFerientage;
      vertraglicheZusatzferienTage;
      geplanteFerientage;
      bezogeneFerientage;
      verbleibendeFerientage;
      laengsterZusammenhangenderBlock = blockResult.longestBlock;
      twoWeekBlockSatisfied = blockResult.satisfied;
      lastUpdatedAt = now;
    };
  };

  // Upsert eines Ledger-Eintrags für ein Kalenderjahr
  public func upsertCalendarYearLedger(
    ledgers : List.List<ComplianceTypes.VacationLedger>,
    nextId : { var value : Nat },
    employeeId : Nat,
    companyId : Nat,
    calendarYearKey : Text,
    hireDate : Text,
    exitDate : ?Text,
    geburtsdatum : ?Int,
    vertraglicheZusatzferienTage : Float,
    absences : [TrackingTypes.Absence],
    minBlockDays : Nat,
  ) : ComplianceTypes.VacationLedger {
    let now = Time.now();
    // Prüfen ob bereits ein Ledger für dieses Kalenderjahr existiert
    let existingOpt = ledgers.find(func(l : ComplianceTypes.VacationLedger) : Bool {
      l.employeeId == employeeId and l.companyId == companyId and l.calendarYearKey == calendarYearKey
    });
    switch (existingOpt) {
      case (?existing) {
        // Updaten
        let year = calendarYearToInt(calendarYearKey);
        let jan1 = calendarYearKey # "-01-01";
        let dec31 = calendarYearKey # "-12-31";
        let periodStart = if (hireDate > jan1) { hireDate } else { jan1 };
        let periodEnd : Text = switch (exitDate) {
          case null { dec31 };
          case (?ex) { if (ex < dec31) { ex } else { dec31 } };
        };
        let gesetzlicheFerientage = ComplianceLib.calculateCalendarYearEntitlement(
          geburtsdatum, hireDate, year, exitDate
        );
        let todayStr = ComplianceLib.today();
        let ferienImZR = absences.filter(func(ab : TrackingTypes.Absence) : Bool {
          ab.employeeId == employeeId and ab.companyId == companyId
            and ab.dateFrom >= periodStart and ab.dateTo <= periodEnd;
        });
        var bezogeneFerientage = 0.0;
        var geplanteFerientage = 0.0;
        for (ab in ferienImZR.values()) {
          let days = ComplianceLib.dateToUnixDays(ab.dateTo) - ComplianceLib.dateToUnixDays(ab.dateFrom) + 1;
          let daysFloat = days.toFloat();
          if (ab.status == #approved) {
            if (ab.dateTo <= todayStr) {
              bezogeneFerientage += daysFloat;
            } else {
              geplanteFerientage += daysFloat;
            };
          } else if (ab.status == #submitted) {
            geplanteFerientage += daysFloat;
          };
        };
        let verbleibendeFerientage = gesetzlicheFerientage + vertraglicheZusatzferienTage - bezogeneFerientage;
        let blockResult = ComplianceLib.checkTwoWeekVacationBlock(
          ferienImZR, periodStart, periodEnd, minBlockDays
        );
        var result : ComplianceTypes.VacationLedger = existing;
        ledgers.mapInPlace(func(l : ComplianceTypes.VacationLedger) : ComplianceTypes.VacationLedger {
          if (l.employeeId == employeeId and l.companyId == companyId and l.calendarYearKey == calendarYearKey) {
            let updated : ComplianceTypes.VacationLedger = {
              l with
              serviceYearStart = ComplianceLib.dateToNs(periodStart);
              serviceYearEnd   = ComplianceLib.dateToNs(periodEnd);
              gesetzlicheFerientage;
              vertraglicheZusatzferienTage;
              geplanteFerientage;
              bezogeneFerientage;
              verbleibendeFerientage;
              laengsterZusammenhangenderBlock = blockResult.longestBlock;
              twoWeekBlockSatisfied = blockResult.satisfied;
              lastUpdatedAt = now;
            };
            result := updated;
            updated;
          } else { l };
        });
        result;
      };
      case null {
        // Neu anlegen
        let id = nextId.value;
        nextId.value += 1;
        let ledger = makeLedger(
          id, employeeId, companyId, calendarYearKey,
          hireDate, exitDate, geburtsdatum, vertraglicheZusatzferienTage,
          absences, minBlockDays, now
        );
        ledgers.add(ledger);
        ledger;
      };
    };
  };

  // Wird aufgerufen wenn eine Ferienabsenz genehmigt oder abgelehnt wird.
  // Aktualisiert alle Kalenderjahre vom Eintrittsjahr bis heute.
  public func updateOnAbsenceChange(
    ledgers : List.List<ComplianceTypes.VacationLedger>,
    nextId : { var value : Nat },
    employeeId : Nat,
    companyId : Nat,
    hireDate : Text,
    geburtsdatum : ?Int,
    vertraglicheZusatzferienTage : Float,
    absences : [TrackingTypes.Absence],
    minBlockDays : Nat,
  ) : () {
    let todayStr = ComplianceLib.today();
    let years = ComplianceLib.getAllCalendarYears(hireDate, null, todayStr);
    for (year in years.values()) {
      let key = year.toText();
      ignore upsertCalendarYearLedger(
        ledgers, nextId, employeeId, companyId, key,
        hireDate, null, geburtsdatum, vertraglicheZusatzferienTage,
        absences, minBlockDays
      );
    };
  };

  // Legacy-Kompatibilität: calculateAndUpsertVacationLedger delegiert auf Kalenderjahr-Logik
  public func calculateAndUpsertVacationLedger(
    ledgers : List.List<ComplianceTypes.VacationLedger>,
    nextId : { var value : Nat },
    employeeId : Nat,
    companyId : Nat,
    hireDate : Text,
    geburtsdatum : ?Int,
    vertraglicheZusatzferienTage : Float,
    absences : [TrackingTypes.Absence],
    minBlockDays : Nat,
  ) : ComplianceTypes.VacationLedger {
    // Aktuelles Jahr
    let todayStr = ComplianceLib.today();
    let parts = todayStr.split(#char '-').toArray();
    let currentYearKey = if (parts.size() > 0) { parts[0] } else { "2024" };
    updateOnAbsenceChange(ledgers, nextId, employeeId, companyId, hireDate, geburtsdatum, vertraglicheZusatzferienTage, absences, minBlockDays);
    // Aktuellen Jahres-Ledger zurückgeben
    switch (ledgers.find(func(l : ComplianceTypes.VacationLedger) : Bool {
      l.employeeId == employeeId and l.companyId == companyId and l.calendarYearKey == currentYearKey
    })) {
      case (?l) l;
      case null {
        // Fallback: erstes gefundenes Ledger
        switch (ledgers.find(func(l : ComplianceTypes.VacationLedger) : Bool {
          l.employeeId == employeeId and l.companyId == companyId
        })) {
          case (?l) l;
          case null {
            // Echtes Fallback mit Dummy (sollte nie eintreten)
            let id = nextId.value;
            nextId.value += 1;
            {
              id;
              employeeId;
              companyId;
              serviceYearKey = currentYearKey;
              calendarYearKey = currentYearKey;
              serviceYearStart = ComplianceLib.dateToNs(currentYearKey # "-01-01");
              serviceYearEnd   = ComplianceLib.dateToNs(currentYearKey # "-12-31");
              gesetzlicheFerientage = 20.0;
              vertraglicheZusatzferienTage;
              geplanteFerientage = 0.0;
              bezogeneFerientage = 0.0;
              verbleibendeFerientage = 20.0;
              laengsterZusammenhangenderBlock = 0;
              twoWeekBlockSatisfied = false;
              lastUpdatedAt = Time.now();
            };
          };
        };
      };
    };
  };

  // Gibt den VacationLedger für ein Kalenderjahr zurück (sucht nach calendarYearKey)
  public func getVacationLedger(
    ledgers : List.List<ComplianceTypes.VacationLedger>,
    employeeId : Nat,
    companyId : Nat,
    calendarYearKey : Text,
  ) : ?ComplianceTypes.VacationLedger {
    // Zuerst nach calendarYearKey suchen, dann nach serviceYearKey (Migration)
    switch (ledgers.find(func(l : ComplianceTypes.VacationLedger) : Bool {
      l.employeeId == employeeId and l.companyId == companyId and l.calendarYearKey == calendarYearKey
    })) {
      case (?l) { ?l };
      case null {
        ledgers.find(func(l : ComplianceTypes.VacationLedger) : Bool {
          l.employeeId == employeeId and l.companyId == companyId and l.serviceYearKey == calendarYearKey
        });
      };
    };
  };

  // Gibt alle VacationLedger eines Mitarbeiters zurück
  public func listVacationLedgers(
    ledgers : List.List<ComplianceTypes.VacationLedger>,
    employeeId : Nat,
    companyId : Nat,
  ) : [ComplianceTypes.VacationLedger] {
    ledgers.filter(func(l : ComplianceTypes.VacationLedger) : Bool {
      l.employeeId == employeeId and l.companyId == companyId
    }).toArray();
  };
};
