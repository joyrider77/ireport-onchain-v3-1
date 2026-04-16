// Domänenlogik für Auswertungen, Kalender und Dashboard
import List "mo:core/List";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Int "mo:core/Int";
import CommonTypes "../types/common";
import CompanyTypes "../types/company";
import TrackingTypes "../types/timetracking";
import MasterTypes "../types/masterdata";

module {
  public type CompanyId = CommonTypes.CompanyId;
  public type EmployeeId = CommonTypes.EmployeeId;

  // Hilfsfunktion: Datumsvergleich (Text im Format YYYY-MM-DD)
  private func dateInRange(date : Text, from : Text, to : Text) : Bool {
    date >= from and date <= to;
  };

  // Hilfsfunktion: Ersten N Zeichen eines Textes extrahieren
  private func textPrefix(t : Text, n : Nat) : Text {
    var count = 0;
    var result = "";
    for (c in t.toIter()) {
      if (count < n) {
        result := result # Text.fromChar(c);
        count += 1;
      };
    };
    result;
  };

  // Hilfsfunktion: Prüft ob Datum im angegebenen Monat/Jahr liegt
  private func isInMonth(date : Text, month : Text, year : Nat) : Bool {
    let monthStr = if (month.size() == 1) "0" # month else month;
    let prefix = year.toText() # "-" # monthStr;
    if (date.size() < 7) { return false };
    let datePrefix = textPrefix(date, 7);
    datePrefix == prefix;
  };

  // Hilfsfunktion: Datum "YYYY-MM-DD" → Unix-Tage (seit 1970-01-01)
  private func dateToUnixDays(dateStr : Text) : Int {
    let parts = dateStr.split(#char '-');
    let arr = parts.toArray();
    if (arr.size() < 3) return 0;
    let yearOpt = Int.fromText(arr[0]);
    let monthOpt = Int.fromText(arr[1]);
    let dayOpt = Int.fromText(arr[2]);
    let year = switch (yearOpt) { case (?v) v; case null return 0 };
    let month = switch (monthOpt) { case (?v) v; case null return 0 };
    let day = switch (dayOpt) { case (?v) v; case null return 0 };
    let y = if (month <= 2) { year - 1 } else { year };
    let m = if (month <= 2) { month + 9 } else { month - 3 };
    let era = if (y >= 0) { y / 400 } else { (y - 399) / 400 };
    let yoe = y - era * 400;
    let doy = (153 * m + 2) / 5 + day - 1;
    let doe = yoe * 365 + yoe / 4 - yoe / 100 + doy;
    era * 146097 + doe - 719468;
  };

  // Hilfsfunktion: Unix-Tage → Datum "YYYY-MM-DD"
  private func unixDaysToDateText(days : Int) : Text {
    let z = days + 719468;
    let era = if (z >= 0) { z / 146097 } else { (z - 146096) / 146097 };
    let doe = z - era * 146097;
    let yoe = (doe - doe / 1460 + doe / 36524 - doe / 146096) / 365;
    let y = yoe + era * 400;
    let doy = doe - (365 * yoe + yoe / 4 - yoe / 100);
    let mp = (5 * doy + 2) / 153;
    let day = doy - (153 * mp + 2) / 5 + 1;
    let month = if (mp < 10) { mp + 3 } else { mp - 9 };
    let year = if (month <= 2) { y + 1 } else { y };
    let pad = func(n : Int, w : Nat) : Text {
      let s = Int.abs(n).toText();
      let len = s.size();
      if (len >= w) { s } else {
        var p = "";
        var i = 0;
        let needed : Int = w - len;
        while (i < needed) { p #= "0"; i += 1 };
        p # s
      }
    };
    pad(year, 4) # "-" # pad(month, 2) # "-" # pad(day, 2);
  };

  // Hilfsfunktion: Wochentag aus Unix-Tagen (0=Mo, 1=Di, ... 6=So)
  // 1970-01-01 war ein Donnerstag (=3 in Mo=0 System)
  private func weekdayFromDays(days : Int) : Nat {
    let raw = days % 7;
    let shifted = raw + 3;
    let normalized = ((shifted % 7) + 7) % 7;
    Int.abs(normalized);
  };

  // Hilfsfunktion: Normalisiert einen gespeicherten Timestamp auf Nanosekunden.
  // Das Frontend sendet Timestamps entweder als Unix-Sekunden, Millisekunden oder Nanosekunden:
  //   - Sekunden für Daten 1990–2100: ca. 6.3e8 .. 4.1e9  → Schwellwert < 5_000_000_000
  //   - Millisekunden für Daten 1990–2100: ca. 6.3e11 .. 4.1e12 → Schwellwert < 10_000_000_000_000_000
  //   - Nanosekunden: >> 1e15
  private func normalizeToNs(ts : Int) : Int {
    if (ts < 5_000_000_000) {
      // Unix-Sekunden → Nanosekunden (× 1_000_000_000)
      ts * 1_000_000_000;
    } else if (ts < 10_000_000_000_000_000) {
      // Millisekunden → Nanosekunden (× 1_000_000)
      ts * 1_000_000;
    } else {
      // Bereits Nanosekunden
      ts;
    };
  };

  // Hilfsfunktion: Tages-Soll-Minuten aus Employment für einen Wochentag (0=Mo..6=So)
  private func dailyTargetMinutes(emp : CompanyTypes.Employment, weekday : Nat) : Nat {
    switch (weekday) {
      case 0 { emp.stundenMo };
      case 1 { emp.stundenDi };
      case 2 { emp.stundenMi };
      case 3 { emp.stundenDo };
      case 4 { emp.stundenFr };
      case 5 { emp.stundenSa };
      case _ { emp.stundenSo };
    };
  };

  // Hilfsfunktion: Aktive Beschäftigung für einen Tag (dayNs in Nanosekunden)
  private func activeEmploymentForDay(
    allEmployments : List.List<CompanyTypes.Employment>,
    employeeId : EmployeeId,
    companyId : CompanyId,
    dayNs : Int,
  ) : ?CompanyTypes.Employment {
    allEmployments.find(func(em) {
      if (em.employeeId != employeeId or em.companyId != companyId) return false;
      let vonNs = normalizeToNs(em.von);
      let afterStart = dayNs >= vonNs;
      let beforeEnd = switch (em.bis) {
        case null { true };
        case (?b) { dayNs <= normalizeToNs(b) };
      };
      afterStart and beforeEnd;
    });
  };

  // Berechnet Ist-Stunden für einen Mitarbeiter inkl. bezahlter Abwesenheiten und genehmigter Ferien.
  // Für ganztägige Abwesenheiten werden die Arbeitsstunden der aktiven Beschäftigung je Wochentag verwendet.
  // Für mehrtägige Abwesenheiten wird jeder Kalendertag einzeln berechnet.
  public func calcIstStunden(
    timeEntries : List.List<TrackingTypes.TimeEntry>,
    absences : List.List<TrackingTypes.Absence>,
    absenceTypes : List.List<MasterTypes.AbsenceType>,
    employments : List.List<CompanyTypes.Employment>,
    companyId : CompanyId,
    employeeId : EmployeeId,
    dateFrom : Text,
    dateTo : Text,
  ) : Float {
    let nsPerDay : Int = 86_400_000_000_000;

    // Ist-Stunden aus Zeiteinträgen
    let istFromEntries = timeEntries.foldLeft(
      0.0 : Float,
      func(acc : Float, e : TrackingTypes.TimeEntry) : Float {
        if (
          e.companyId == companyId and
          e.employeeId == employeeId and
          dateInRange(e.date, dateFrom, dateTo)
        ) {
          acc + e.hours
        } else { acc };
      },
    );

    // Ist-Stunden aus bezahlten Abwesenheiten und genehmigten Ferien
    let istFromAbsences = absences.foldLeft(
      0.0 : Float,
      func(acc : Float, a : TrackingTypes.Absence) : Float {
        if (
          a.companyId == companyId and
          a.employeeId == employeeId and
          a.status == #approved and
          // Abwesenheit muss sich im Zeitraum überschneiden
          a.dateTo >= dateFrom and a.dateFrom <= dateTo
        ) {
          // Prüfen ob Abwesenheitsart entschädigt ist oder ob es Ferien (requiresApproval) sind
          let absenceTypeOpt = absenceTypes.find(func(at) {
            at.id == a.absenceTypeId and at.companyId == companyId
          });
          let includeInIst = switch (absenceTypeOpt) {
            case null { false };
            case (?at) { at.compensated or at.requiresApproval };
          };
          if (includeInIst) {
            if (a.ganztaetig) {
              // Ganztägig: für jeden Kalendertag die Arbeitsstunden aus der aktiven Beschäftigung
              let abFromDays = dateToUnixDays(a.dateFrom);
              let abToDays = dateToUnixDays(a.dateTo);
              // Überschneidung mit dem angefragten Zeitraum berechnen
              let rangeFromDays = dateToUnixDays(dateFrom);
              let rangeToDays = dateToUnixDays(dateTo);
              let effectiveFrom = if (abFromDays > rangeFromDays) abFromDays else rangeFromDays;
              let effectiveTo = if (abToDays < rangeToDays) abToDays else rangeToDays;
              var dayHours : Float = 0.0;
              var d = effectiveFrom;
              label absGanztaegigLoop while (d <= effectiveTo) {
                let dayNs = d * nsPerDay;
                let weekday = weekdayFromDays(d);
                let empOpt = activeEmploymentForDay(employments, employeeId, companyId, dayNs);
                switch (empOpt) {
                  case null {};
                  case (?emp) {
                    let minutes = dailyTargetMinutes(emp, weekday);
                    dayHours += (minutes.toFloat() / 60.0);
                  };
                };
                d += 1;
              };
              acc + dayHours
            } else {
              // Manuelle Dauer in Minuten → Stunden
              if (a.dauer > 0) {
                acc + (a.dauer.toFloat() / 60.0)
              } else { acc };
            }
          } else { acc };
        } else { acc };
      },
    );

    istFromEntries + istFromAbsences;
  };

  // Gibt Auswertungsdaten zurück
  public func getReportData(
    timeEntries : List.List<TrackingTypes.TimeEntry>,
    expenses : List.List<TrackingTypes.Expense>,
    companyId : CompanyId,
    filter : TrackingTypes.ReportFilter,
  ) : TrackingTypes.ReportData {
    let filteredEntries = timeEntries.filter(func(e) {
      if (e.companyId != companyId) { return false };
      switch (filter.employeeId) {
        case (?eid) { if (e.employeeId != eid) return false };
        case null {};
      };
      switch (filter.projectId) {
        case (?pid) { if (e.projectId != pid) return false };
        case null {};
      };
      if (not dateInRange(e.date, filter.dateFrom, filter.dateTo)) { return false };
      true;
    });

    let filteredExpenses = expenses.filter(func(e) {
      if (e.companyId != companyId) { return false };
      switch (filter.employeeId) {
        case (?eid) { if (e.employeeId != eid) return false };
        case null {};
      };
      if (not dateInRange(e.date, filter.dateFrom, filter.dateTo)) { return false };
      true;
    });

    let billableHours = filteredEntries.foldLeft(
      0.0 : Float,
      func(acc : Float, e : TrackingTypes.TimeEntry) : Float {
        if (e.billable) acc + e.hours else acc
      },
    );

    let totalExpenses = filteredExpenses.foldLeft(
      0.0 : Float,
      func(acc : Float, e : TrackingTypes.Expense) : Float { acc + e.billableCHF },
    );

    {
      billableHours;
      expenses = totalExpenses;
      entries = filteredEntries.toArray();
      expenseItems = filteredExpenses.toArray();
    };
  };

  // Gibt Kalenderdaten für einen Monat zurück
  public func getCalendarEntries(
    timeEntries : List.List<TrackingTypes.TimeEntry>,
    expenses : List.List<TrackingTypes.Expense>,
    absences : List.List<TrackingTypes.Absence>,
    companyId : CompanyId,
    employeeId : EmployeeId,
    month : Text,
    year : Nat,
  ) : TrackingTypes.CalendarData {
    let monthEntries = timeEntries.filter(func(e) {
      e.companyId == companyId and e.employeeId == employeeId and isInMonth(e.date, month, year)
    }).toArray();

    let monthExpenses = expenses.filter(func(e) {
      e.companyId == companyId and e.employeeId == employeeId and isInMonth(e.date, month, year)
    }).toArray();

    let monthAbsences = absences.filter(func(a) {
      a.companyId == companyId and a.employeeId == employeeId and isInMonth(a.dateFrom, month, year)
    }).toArray();

    {
      timeEntries = monthEntries;
      expenses = monthExpenses;
      absences = monthAbsences;
    };
  };

  // Gibt Dashboard-Statistiken zurück
  // employments wird für korrekte ganztägige Abwesenheits-Stundenberechnung benötigt
  public func getDashboardStats(
    timeEntries : List.List<TrackingTypes.TimeEntry>,
    absences : List.List<TrackingTypes.Absence>,
    absenceTypes : List.List<MasterTypes.AbsenceType>,
    expenses : List.List<TrackingTypes.Expense>,
    employments : List.List<CompanyTypes.Employment>,
    vacationBalances : List.List<CompanyTypes.VacationBalance>,
    companyId : CompanyId,
    employeeId : EmployeeId,
    _weeklyHoursTarget : Float,
    isManagerOrAdmin : Bool,
  ) : TrackingTypes.DashboardStats {
    let nsPerDay : Int = 86_400_000_000_000;
    // Aktuelle Woche: Montag bis Sonntag der laufenden Woche
    let todayDays = Time.now() / nsPerDay;
    let todayWeekday : Int = weekdayFromDays(todayDays).toInt();
    // Montag dieser Woche: todayDays - weekday (0=Mo)
    let mondayDays = todayDays - todayWeekday;
    // Sonntag dieser Woche
    let sundayDays = mondayDays + 6;
    let weekStart = unixDaysToDateText(mondayDays);
    let weekEnd = unixDaysToDateText(sundayDays);

    // ─── Soll-Stunden diese Woche aus Beschäftigungen berechnen ─────────────
    // Nur wenn Beschäftigungen vorhanden, sonst 0.0
    let empList = employments.filter(func(em) {
      em.employeeId == employeeId and em.companyId == companyId
    }).toArray();

    let hoursTarget : Float = if (empList.size() == 0) {
      0.0 // Keine Beschäftigung → Soll = 0
    } else {
      // Frühestes von-Datum bestimmen (frühester Anstellungsbeginn)
      var earliestNs : Int = normalizeToNs(empList[0].von);
      for (em in empList.values()) {
        let vonNs = normalizeToNs(em.von);
        if (vonNs < earliestNs) { earliestNs := vonNs };
      };
      let earliestDays = earliestNs / nsPerDay;
      // Sicherheitscheck: 1990-01-01 = Unix-Tag 7305
      let minValidDay : Int = 7305;
      let safestEarliestDays = if (earliestDays < minValidDay) { todayDays } else { earliestDays };
      // Woche beginnt entweder bei Montag ODER beim Anstellungsbeginn (je nachdem was später ist)
      // Für "diese Woche": Tage Mo-So der laufenden Woche, aber nur ab Anstellungsbeginn
      let effectiveStart = if (safestEarliestDays > mondayDays) { safestEarliestDays } else { mondayDays };
      var sollMinutes : Int = 0;
      var d = effectiveStart;
      label sollLoop while (d <= sundayDays) {
        let dayNs = d * nsPerDay;
        let weekday = weekdayFromDays(d);
        let empOpt = activeEmploymentForDay(employments, employeeId, companyId, dayNs);
        switch (empOpt) {
          case null {};
          case (?emp) {
            let mins = dailyTargetMinutes(emp, weekday);
            sollMinutes += mins.toInt();
          };
        };
        d += 1;
      };
      sollMinutes.toFloat() / 60.0
    };

    // Ist-Stunden diese Woche: Zeiteinträge + genehmigte Abwesenheiten/Ferien
    let hoursFromEntries = timeEntries.foldLeft(
      0.0 : Float,
      func(acc : Float, e : TrackingTypes.TimeEntry) : Float {
        if (e.companyId == companyId and e.employeeId == employeeId
            and e.date >= weekStart and e.date <= weekEnd) {
          acc + e.hours
        } else { acc };
      },
    );

    // Genehmigte Abwesenheiten/Ferien als Ist-Stunden (compensated ODER requiresApproval)
    // Für ganztägige Abwesenheiten: Arbeitsstunden pro Wochentag aus aktiver Beschäftigung
    let hoursFromAbsences = absences.foldLeft(
      0.0 : Float,
      func(acc : Float, a : TrackingTypes.Absence) : Float {
        if (
          a.companyId == companyId and a.employeeId == employeeId and
          a.status == #approved and
          a.dateTo >= weekStart and a.dateFrom <= weekEnd
        ) {
          let absTypeOpt = absenceTypes.find(func(at) {
            at.id == a.absenceTypeId and at.companyId == companyId
          });
          let shouldInclude = switch (absTypeOpt) {
            case null { false };
            case (?at) { at.compensated or at.requiresApproval };
          };
          if (shouldInclude) {
            if (a.ganztaetig) {
              // Ganztägig: für jeden Wochentag im Überschneidungsbereich Arbeitsstunden aus Beschäftigung
              let abFromDays = dateToUnixDays(a.dateFrom);
              let abToDays = dateToUnixDays(a.dateTo);
              let rangeFromDays = mondayDays;
              let rangeToDays = sundayDays;
              let effectiveFrom = if (abFromDays > rangeFromDays) abFromDays else rangeFromDays;
              let effectiveTo = if (abToDays < rangeToDays) abToDays else rangeToDays;
              var dayHours : Float = 0.0;
              var d = effectiveFrom;
              label dashAbsLoop while (d <= effectiveTo) {
                let dayNs = d * nsPerDay;
                let weekday = weekdayFromDays(d);
                let empOpt = activeEmploymentForDay(employments, employeeId, companyId, dayNs);
                switch (empOpt) {
                  case null {};
                  case (?emp) {
                    let minutes = dailyTargetMinutes(emp, weekday);
                    dayHours += (minutes.toFloat() / 60.0);
                  };
                };
                d += 1;
              };
              acc + dayHours
            } else {
              // Manuelle Dauer in Minuten → Stunden
              if (a.dauer > 0) acc + (a.dauer.toFloat() / 60.0) else acc
            }
          } else { acc }
        } else { acc };
      },
    );

    let hoursThisWeek = hoursFromEntries + hoursFromAbsences;

    // Prüft ob eine AbsenceType requiresApproval = true hat (Ferientyp)
    let isVacationType = func(absenceTypeId : TrackingTypes.AbsenceTypeId) : Bool {
      absenceTypes.find(func(at) {
        at.id == absenceTypeId and at.companyId == companyId and at.requiresApproval
      }) != null
    };

    // Ausstehende Ferienanträge (nur Abwesenheitsarten mit requiresApproval = true)
    let pendingVacations = if (isManagerOrAdmin) {
      absences.foldLeft(
        0 : Nat,
        func(acc : Nat, a : TrackingTypes.Absence) : Nat {
          if (a.companyId == companyId and a.status == #submitted and isVacationType(a.absenceTypeId)) acc + 1 else acc
        },
      );
    } else {
      absences.foldLeft(
        0 : Nat,
        func(acc : Nat, a : TrackingTypes.Absence) : Nat {
          if (a.companyId == companyId and a.employeeId == employeeId and a.status == #submitted and isVacationType(a.absenceTypeId)) acc + 1 else acc
        },
      );
    };

    // Ausstehende Spesen des Mitarbeiters
    let pendingExpenses = expenses.foldLeft(
      0 : Nat,
      func(acc : Nat, e : TrackingTypes.Expense) : Nat {
        if (e.companyId == companyId and e.employeeId == employeeId and e.status == #pending) acc + 1 else acc
      },
    );

    // Genehmigte Ferientage im aktuellen Jahr:
    // NUR Abwesenheiten vom Typ requiresApproval=true (Ferien), NICHT allgemeine kompensierte Abwesenheiten
    // Jedes genehmigte Vakanzintervall → Tage addieren (ganztaetig oder dauer/Arbeitstag)
    let nowNs = Time.now();
    let todayDays2 = nowNs / nsPerDay;
    let currentYear : Int = 1970 + (todayDays2 * 400 + 97) / 146097; // Korrekter Näherungswert
    let yearPrefix = currentYear.toText();

    let approvedVacationDays = absences.foldLeft(
      0 : Nat,
      func(acc : Nat, a : TrackingTypes.Absence) : Nat {
        if (
          a.companyId == companyId and
          a.employeeId == employeeId and
          a.status == #approved and
          isVacationType(a.absenceTypeId) and // NUR Ferientypen (requiresApproval=true)
          a.dateFrom.size() >= 4 and
          textPrefix(a.dateFrom, 4) == yearPrefix
        ) {
          // Anzahl Tage des Ferienblocks (inkl. Wochenenden, da User explizit erfasst hat)
          let fromDays = dateToUnixDays(a.dateFrom);
          let toDays = dateToUnixDays(a.dateTo);
          let days = Int.abs(toDays - fromDays) + 1;
          acc + days
        } else { acc };
      },
    );

    // Feriensaldo: gewährte Ferienminuten (aktuelles Jahr) minus verwendete Ferienminuten
    // Gewährte Ferienminuten = Summe aller VacationBalance.dauer für das aktuelle Jahr
    let grantedVacationMinutes : Int = vacationBalances.foldLeft(
      0 : Int,
      func(acc : Int, vb : CompanyTypes.VacationBalance) : Int {
        if (vb.employeeId == employeeId and vb.companyId == companyId and vb.kalenderjahr == currentYear) {
          acc + vb.dauer
        } else { acc };
      },
    );
    // Verwendete Ferienminuten = genehmigte Ferieneinträge im aktuellen Jahr
    // (nur requiresApproval=true Abwesenheiten, ganztaetig oder mit dauer)
    let usedVacationMinutes : Int = absences.foldLeft(
      0 : Int,
      func(acc : Int, a : TrackingTypes.Absence) : Int {
        if (
          a.companyId == companyId and
          a.employeeId == employeeId and
          a.status == #approved and
          isVacationType(a.absenceTypeId) and
          a.dateFrom.size() >= 4 and
          textPrefix(a.dateFrom, 4) == yearPrefix
        ) {
          if (a.ganztaetig) {
            // Ganztägig: für jeden Kalendertag die Arbeitsstunden aus der aktiven Beschäftigung,
            // aber NUR wenn der Tag ein Pensum > 0 hat (keine pensumslosen Tage wie Sa/So oder 0:00-Tage)
            let abFromDays = dateToUnixDays(a.dateFrom);
            let abToDays = dateToUnixDays(a.dateTo);
            var dayMinutes : Int = 0;
            var d = abFromDays;
            label vacCalcLoop while (d <= abToDays) {
              let dayNs = d * nsPerDay;
              let weekday = weekdayFromDays(d);
              let empOpt = activeEmploymentForDay(employments, employeeId, companyId, dayNs);
              switch (empOpt) {
                case null {};
                case (?emp) {
                  let mins = dailyTargetMinutes(emp, weekday);
                  // Nur Tage mit Pensum > 0 zählen (Sa/So oder 0:00-Tage werden nicht abgezogen)
                  if (mins > 0) {
                    dayMinutes += mins.toInt();
                  };
                };
              };
              d += 1;
            };
            acc + dayMinutes
          } else {
            // Nicht ganztägig: prüfen ob der Tag (dateFrom) überhaupt ein Pensum > 0 hat.
            // Bei eintägigen Einträgen mit dauer > 0 nur abziehen wenn der Tag ein Pensum hat.
            let dayNs = dateToUnixDays(a.dateFrom) * nsPerDay;
            let weekday = weekdayFromDays(dateToUnixDays(a.dateFrom));
            let empOpt = activeEmploymentForDay(employments, employeeId, companyId, dayNs);
            let dayHasPensum = switch (empOpt) {
              case null { false };
              case (?emp) { dailyTargetMinutes(emp, weekday) > 0 };
            };
            if (dayHasPensum) {
              acc + a.dauer.toInt()
            } else { acc }
          }
        } else { acc };
      },
    );
    let remainingVacationMinutes : Int = grantedVacationMinutes - usedVacationMinutes;

    {
      hoursThisWeek;
      hoursTarget;
      pendingVacations;
      pendingExpenses;
      approvedVacationDays;
      remainingVacationMinutes;
    };
  };
};
