// HR & Compliance Engine – Stufe 1
// Schweizer Arbeitsrecht: Dienstjahresberechnung, Ferienanspruch, Überstunden, Ruhezeit
import Debug "mo:core/Debug";
import Int "mo:core/Int";
import Float "mo:core/Float";
import Array "mo:core/Array";
import List "mo:core/List";
import Time "mo:core/Time";
import ComplianceTypes "../types/compliance";
import TrackingTypes "../types/timetracking";
import CompanyTypes "../types/company";
import Nat "mo:core/Nat";
import PauseDetectionLib "pause-detection";

module {

  // ─── Type aliases ────────────────────────────────────────────────────────────
  public type ServiceYearInfo = {
    yearNumber : Nat;
    startDate : Text;   // YYYY-MM-DD
    endDate : Text;     // YYYY-MM-DD (day before anniversary)
    serviceYearKey : Text; // YYYY_MM_DD (= startDate with underscores)
  };

  public type WeeklyOvertimeResult = {
    contractualOvertimeH : Float;
    legalOvertimeH : Float;
  };

  public type RestTimeCheckResult = {
    prevEntryId : Nat;
    nextEntryId : Nat;
    prevEnd : Int;      // nanoseconds
    nextStart : Int;    // nanoseconds
    restHours : Float;
    isCompliant : Bool;
  };

  // ─── Date helpers ─────────────────────────────────────────────────────────────

  // Konvertiert YYYY-MM-DD → Unix-Tage (seit 1970-01-01)
  public func dateToUnixDays(dateStr : Text) : Int {
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

  // Konvertiert Unix-Tage → YYYY-MM-DD
  public func unixDaysToDate(days : Int) : Text {
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
    padInt(year, 4) # "-" # padInt(month, 2) # "-" # padInt(day, 2);
  };

  // Konvertiert YYYY-MM-DD → Nanosekunden-Timestamp (Beginn des Tages)
  public func dateToNs(dateStr : Text) : Int {
    let nsPerDay : Int = 86_400_000_000_000;
    dateToUnixDays(dateStr) * nsPerDay;
  };

  // Konvertiert Nanosekunden → YYYY-MM-DD
  public func nsToDate(ns : Int) : Text {
    let nsPerDay : Int = 86_400_000_000_000;
    let normalized = normalizeNs(ns);
    unixDaysToDate(normalized / nsPerDay);
  };

  // Normalisiert Timestamp auf Nanosekunden (unterstützt s, ms, ns)
  public func normalizeNs(ts : Int) : Int {
    if (ts < 5_000_000_000) {
      ts * 1_000_000_000;
    } else if (ts < 10_000_000_000_000_000) {
      ts * 1_000_000;
    } else {
      ts;
    };
  };

  // Gibt das aktuelle Datum als YYYY-MM-DD zurück
  public func today() : Text {
    nsToDate(Time.now());
  };

  // Hilfsfunktion: Int mit führenden Nullen formatieren
  private func padInt(n : Int, width : Nat) : Text {
    let absN = Int.abs(n);
    let s = absN.toText();
    let len = s.size();
    if (len >= width) { s } else {
      var pad = "";
      var i = 0;
      let needed : Int = (width : Nat).toInt() - len.toInt();
      while (i < needed) {
        pad #= "0";
        i += 1;
      };
      pad # s;
    };
  };

  // Berechnet Anzahl Tage in einem Monat (inkl. Schaltjahre)
  private func daysInMonth(year : Int, month : Int) : Int {
    if (month == 2) {
      if (year % 400 == 0 or (year % 4 == 0 and year % 100 != 0)) { 29 } else { 28 };
    } else if (month == 4 or month == 6 or month == 9 or month == 11) {
      30;
    } else {
      31;
    };
  };

  // Addiert genau 1 Jahr zu einem YYYY-MM-DD Datum
  // Schaltjahresregel: 29.02 → 28.02 falls Zieljahr kein Schaltjahr
  public func addOneYear(dateStr : Text) : Text {
    let parts = dateStr.split(#char '-');
    let arr = parts.toArray();
    if (arr.size() < 3) return dateStr;
    let yearOpt = Int.fromText(arr[0]);
    let monthOpt = Int.fromText(arr[1]);
    let dayOpt = Int.fromText(arr[2]);
    let year = switch (yearOpt) { case (?v) v; case null return dateStr };
    let month = switch (monthOpt) { case (?v) v; case null return dateStr };
    let day = switch (dayOpt) { case (?v) v; case null return dateStr };
    let newYear = year + 1;
    let maxDay = daysInMonth(newYear, month);
    let newDay = if (day > maxDay) { maxDay } else { day };
    padInt(newYear, 4) # "-" # padInt(month, 2) # "-" # padInt(newDay, 2);
  };

  // Subtrahiert 1 Tag von einem Datum (für Dienstjahresende = Tag vor Jahrestag)
  public func subtractOneDay(dateStr : Text) : Text {
    let days = dateToUnixDays(dateStr);
    unixDaysToDate(days - 1);
  };

  // ─── Service year calculation ──────────────────────────────────────────────────

  // Berechnet Dienstjahr-Info für ein gegebenes Datum
  // hireDate: YYYY-MM-DD, targetDate: YYYY-MM-DD
  // Gibt zurück: { yearNumber, startDate, endDate, serviceYearKey }
  public func calculateServiceYear(hireDate : Text, targetDate : Text) : ServiceYearInfo {
    // Starte beim ersten Dienstjahr
    var yearNum : Nat = 1;
    var startDate = hireDate;
    var endDate = subtractOneDay(addOneYear(hireDate));

    // Iteriere bis targetDate im aktuellen Dienstjahr liegt (oder max 50 Jahre)
    var safety = 0;
    label loopSY while (safety < 50) {
      safety += 1;
      if (targetDate >= startDate and targetDate <= endDate) {
        // gefunden
        let key = dateToServiceYearKey(startDate);
        return { yearNumber = yearNum; startDate; endDate; serviceYearKey = key };
      };
      // Nächstes Dienstjahr
      startDate := addOneYear(startDate);
      endDate := subtractOneDay(addOneYear(startDate));
      yearNum += 1;
    };
    // Fallback (sollte nie erreicht werden)
    let key = dateToServiceYearKey(startDate);
    { yearNumber = yearNum; startDate; endDate; serviceYearKey = key };
  };

  // ─── Calendar year helpers ────────────────────────────────────────────────────

  // Berechnet den Ferienanspruch in Arbeitstagen für ein Kalenderjahr.
  // Eintrittsjahr: pro-rata vom Eintrittsdatum bis 31.12.
  // Normaljahr: voller Jahresanspruch.
  // Austrittsjahr: pro-rata vom 01.01. bis Austrittsdatum.
  // Alterslogik: Vergleich anhand des 1. Januar des Kalenderjahres für konsistente Prüfung.
  public func calculateCalendarYearEntitlement(
    geburtsdatum : ?Int,
    hireDate : Text,       // YYYY-MM-DD
    calendarYear : Int,    // z.B. 2024
    exitDate : ?Text,      // YYYY-MM-DD, null = kein Austritt
  ) : Float {
    let yearStr = padInt(calendarYear, 4);
    let jan1 = yearStr # "-01-01";
    let dec31 = yearStr # "-12-31";

    // Tatsächlicher Start/End des Anspruchszeitraums
    let periodStart : Text = if (hireDate > jan1) { hireDate } else { jan1 };
    let periodEnd : Text = switch (exitDate) {
      case null { dec31 };
      case (?ex) { if (ex < dec31) { ex } else { dec31 } };
    };

    // Kein Anspruch wenn Austritt vor Jahresbeginn oder Eintritt nach Jahresende
    if (periodStart > dec31 or periodEnd < jan1) { return 0.0 };

    // Gesamttage im Zeitraum (inkl. beider Grenztage)
    let startDays = dateToUnixDays(periodStart);
    let endDays   = dateToUnixDays(periodEnd);
    let jan1Days  = dateToUnixDays(jan1);
    let periodDays : Float = (endDays - startDays + 1).toFloat();
    let yearDays   : Float = (dateToUnixDays(dec31) - jan1Days + 1).toFloat();

    // Ohne Geburtsdatum: immer 4 Wochen (20 Tage) aliquot
    let birthdayNs : Int = switch (geburtsdatum) {
      case null {
        return periodDays * 20.0 / yearDays;
      };
      case (?b) { normalizeNs(b) };
    };

    // 20. Geburtstag korrekt berechnen: Geburtsdatum aus NS ableiten, dann 20 Jahre addieren
    let birthdayDate = nsToDate(birthdayNs);
    var bd20 = birthdayDate;
    var i = 0;
    while (i < 20) { bd20 := addOneYear(bd20); i += 1 };

    // Altersregel gemäss Schweizer OR für Kalenderjahre:
    // - bd20 <= jan1: am 1.1. des Jahres bereits 20 → 4-Wochen-Regel (20 T) für ganzes Jahr
    // - bd20 > dec31: am 31.12. noch < 20 → U20-Regel (25 T) für ganzes Jahr
    // - bd20 liegt IM Kalenderjahr (nach Jan 1, vor/am Dec 31):
    //   gemäss OR gilt die ab-20-Regel für das GESAMTE Kalenderjahr (kein Split bei Kalenderjahr-Methode)
    let bd20Days = dateToUnixDays(bd20);
    let jan1Days2 = dateToUnixDays(jan1);
    let dec31Days = dateToUnixDays(dec31);

    if (bd20Days <= jan1Days2) {
      // Am 1.1. des Jahres bereits >= 20 → 4-Wochen-Regel für ganzes Jahr
      let result = periodDays * 20.0 / yearDays;
      (result * 100.0 + 0.5).toInt().toFloat() / 100.0;
    } else if (bd20Days > dec31Days) {
      // Am 31.12. noch < 20 → U20-Regel (25 Tage) für ganzes Jahr
      let result = periodDays * 25.0 / yearDays;
      (result * 100.0 + 0.5).toInt().toFloat() / 100.0;
    } else {
      // bd20 liegt im Kalenderjahr: gemäss OR gilt ab-20-Regel für das GESAMTE Jahr
      // (Swiss OR: das Jahr, in dem man 20 wird, gilt bereits als ab-20-Jahr)
      let result = periodDays * 20.0 / yearDays;
      (result * 100.0 + 0.5).toInt().toFloat() / 100.0;
    };
  };

  // Gibt alle relevanten Kalenderjahre zurück (von Eintrittsjahr bis heute oder Austrittsjahr)
  public func getAllCalendarYears(
    hireDate : Text,
    exitDate : ?Text,
    todayStr : Text,
  ) : [Int] {
    let endStr : Text = switch (exitDate) {
      case null { todayStr };
      case (?ex) { ex };
    };
    let parts = hireDate.split(#char '-').toArray();
    let endParts = endStr.split(#char '-').toArray();
    if (parts.size() < 1 or endParts.size() < 1) return [];
    let startYear = switch (Int.fromText(parts[0])) { case (?y) y; case null return [] };
    let endYear   = switch (Int.fromText(endParts[0])) { case (?y) y; case null return [] };
    var years : [Int] = [];
    var y = startYear;
    while (y <= endYear) {
      years := years.concat([y]);
      y += 1;
    };
    years;
  };

  // Gibt alle Dienstjahre vom Eintrittsdatum bis heute zurück
  public func getAllServiceYears(hireDate : Text, todayStr : Text) : [ServiceYearInfo] {
    var results : [ServiceYearInfo] = [];
    var startDate = hireDate;
    var safety = 0;
    label loopSY while (safety < 50) {
      safety += 1;
      let endDate = subtractOneDay(addOneYear(startDate));
      let key = dateToServiceYearKey(startDate);
      let yearNum = results.size() + 1;
      results := results.concat([{ yearNumber = yearNum; startDate; endDate; serviceYearKey = key }]);
      // Stopp wenn heute im aktuellen Dienstjahr liegt
      if (todayStr >= startDate and todayStr <= endDate) {
        return results;
      };
      startDate := addOneYear(startDate);
    };
    results;
  };

  // ─── Vacation entitlement calculation (Swiss OR) ──────────────────────────────

  // Berechnet gesetzlichen Ferienanspruch in Arbeitstagen (Float) für ein Dienstjahr.
  // Schweizer OR: bis zum vollendeten 20. Altersjahr = 5 Wochen (25 Tage), danach 4 Wochen (20 Tage).
  // Fällt der 20. Geburtstag ins Dienstjahr: anteilsmässige Berechnung pro Teilperiode.
  //
  // geburtsdatum: Nanosekunden-Timestamp oder null (dann immer 4 Wochen)
  // hireDate: YYYY-MM-DD
  // serviceYearKey: YYYY_MM_DD (Startdatum des Dienstjahres mit Underscores)
  public func calculateLegalVacationEntitlement(
    geburtsdatum : ?Int,
    _hireDate : Text,
    serviceYearKey : Text,
  ) : Float {
    // serviceYearKey "YYYY_MM_DD" → startDate "YYYY-MM-DD"
    let startDate = serviceYearKeyToDate(serviceYearKey);
    let endDate = subtractOneDay(addOneYear(startDate));

    // Gesamte Tage im Dienstjahr
    let startDays = dateToUnixDays(startDate);
    let endDays = dateToUnixDays(endDate);
    let totalDays : Float = (endDays - startDays + 1).toFloat();

    // Ohne Geburtsdatum: immer 4 Wochen (20 Tage)
    let birthdayNs : Int = switch (geburtsdatum) {
      case null { return 20.0 };
      case (?b) { normalizeNs(b) };
    };

    // 20. Geburtstag berechnen: birthdayNs + 20 Jahre
    let birthdayDate = nsToDate(birthdayNs);
    // 20. Geburtstag = Geburtstagsdatum + 20 Jahre
    var bd20 = birthdayDate;
    var i = 0;
    while (i < 20) {
      bd20 := addOneYear(bd20);
      i += 1;
    };

    // Liegt der 20. Geburtstag INNERHALB des Dienstjahres?
    if (bd20 > endDate or bd20 < startDate) {
      // Kein Split: ganzes Dienstjahr mit einem Anspruch
      let bd20Days = dateToUnixDays(bd20);
      let startDays2 = dateToUnixDays(startDate);
      if (bd20Days <= startDays2) {
        // Während des gesamten Dienstjahres bereits >= 20 Jahre alt → 4 Wochen
        20.0;
      } else {
        // Während des gesamten Dienstjahres noch < 20 Jahre alt → 5 Wochen
        25.0;
      };
    } else {
      // Split: Dienstjahr wird in zwei Teilperioden aufgeteilt
      // Teilperiode 1: startDate bis Tag vor 20. Geburtstag (Rate 25 Tage/Jahr)
      // Teilperiode 2: 20. Geburtstag bis endDate (Rate 20 Tage/Jahr)
      let bd20Days = dateToUnixDays(bd20);
      let daysBefore : Float = (bd20Days - startDays).toFloat(); // Tage vor 20. Geburtstag
      let daysFrom : Float = (endDays - bd20Days + 1).toFloat(); // Tage ab 20. Geburtstag
      let entitlementBefore = daysBefore * (25.0 / totalDays);
      let entitlementFrom = daysFrom * (20.0 / totalDays);
      let total = entitlementBefore + entitlementFrom;
      // Auf 2 Dezimalstellen runden
      let rounded = ((total * 100.0).toInt()).toFloat() / 100.0;
      rounded;
    };
  };

  // ─── Last workday check ────────────────────────────────────────────────────────

  // Prüft ob heute der letzte Arbeitstag mit Pensum > 0 für einen Mitarbeiter in der Woche ist.
  // Verwendet um den wöchentlichen Compliance-Check auszulösen.
  public func isLastWorkdayOfWeek(
    employeeId : Nat,
    todayStr : Text,
    employments : [CompanyTypes.Employment],
  ) : Bool {
    let nsPerDay : Int = 86_400_000_000_000;
    let todayDays = dateToUnixDays(todayStr);
    // Wochentag: 0=Mo, 1=Di, ..., 6=So; 1970-01-01 war Donnerstag
    let raw = todayDays % 7;
    let shifted = raw + 3;
    let weekday = Int.abs(((shifted % 7) + 7) % 7);
    // Wochenende → kein Arbeitstag
    if (weekday == 5 or weekday == 6) return false;

    // Aktive Beschäftigung für heute suchen
    let todayNs = todayDays * nsPerDay;
    let empOpt = employments.find(func(em) {
      if (em.employeeId != employeeId) return false;
      let vonNs = normalizeNs(em.von);
      let afterStart = todayNs >= vonNs;
      let beforeEnd = switch (em.bis) {
        case null { true };
        case (?b) { todayNs <= normalizeNs(b) };
      };
      afterStart and beforeEnd;
    });
    let emp = switch (empOpt) { case null { return false }; case (?e) e };
    if (emp.pensum == 0.0) return false;

    // Prüfen ob morgen und alle weiteren Tage bis Sonntag keine Arbeit stattfindet
    var d = weekday + 1; // nächster Tag in der Woche
    while (d <= 5) { // bis Freitag
      let targetDays : Nat = Int.abs((todayDays : Int) + (d : Int) - (weekday : Int));
      let targetNs = targetDays * nsPerDay;
      let targetWd = d;
      // Aktive Beschäftigung für Zielttag
      let empOptFuture = employments.find(func(em) {
        if (em.employeeId != employeeId) return false;
        let vonNs = normalizeNs(em.von);
        let afterStart = targetNs >= vonNs;
        let beforeEnd = switch (em.bis) {
          case null { true };
          case (?b) { targetNs <= normalizeNs(b) };
        };
        afterStart and beforeEnd;
      });
      switch (empOptFuture) {
        case null {};
        case (?futureEmp) {
          // Hat der Mitarbeiter an diesem Wochentag Sollstunden?
          let targetMinutes = switch (targetWd) {
            case 0 { futureEmp.stundenMo };
            case 1 { futureEmp.stundenDi };
            case 2 { futureEmp.stundenMi };
            case 3 { futureEmp.stundenDo };
            case 4 { futureEmp.stundenFr };
            case _ { 0 };
          };
          if (targetMinutes > 0) return false; // Es gibt noch einen Arbeitstag diese Woche
        };
      };
      d += 1;
    };
    true; // Kein weiterer Arbeitstag diese Woche
  };

  // ─── Weekly overtime calculation ─────────────────────────────────────────────

  // Berechnet vertragliche und gesetzliche Überstunden für eine Woche.
  // contractualWeeklyH: Soll-Stunden aus der Beschäftigung (wird von außen übergeben).
  public func calculateWeeklyOvertime(
    weekTimeEntries : [TrackingTypes.TimeEntry],
    profile : ComplianceTypes.EmployeeComplianceProfile,
    contractualWeeklyH : Float,
  ) : WeeklyOvertimeResult {
    // Effektive Wochenarbeitszeit in Stunden
    var totalHours : Float = 0.0;
    for (te in weekTimeEntries.values()) {
      let entryHours : Float = switch (te.von, te.bis) {
        case (?v, ?b) {
          let parseMin = func(t : Text) : Int {
            let parts = t.split(#char ':');
            let arr = parts.toArray();
            if (arr.size() < 2) return 0;
            switch (Int.fromText(arr[0]), Int.fromText(arr[1])) {
              case (?h, ?m) { h * 60 + m };
              case _ { 0 };
            };
          };
          let diff = parseMin(b) - parseMin(v);
          if (diff > 0) Int.abs(diff).toFloat() / 60.0 else te.hours
        };
        case _ { te.hours };
      };
      totalHours += entryHours;
    };

    // Vertragliche Überstunden = max(0, istStunden - Soll-Stunden aus Beschäftigung)
    let contractualOvertimeH = Float.max(0.0, totalHours - contractualWeeklyH);
    // Gesetzliche Überzeit = max(0, istStunden - gesetzlicheWochenhöchstarbeitszeit)
    let legalOvertimeH = Float.max(0.0, totalHours - profile.gesetzlicheWochenhochstarbeitszeit);

    { contractualOvertimeH; legalOvertimeH };
  };

  // ─── Rest time check (11h between sessions) ────────────────────────────────────

  // Prüft die tägliche Ruhezeit (mind. 11h) zwischen allen chronologisch sortierten Arbeitseinsätzen.
  // Wochenenden, Feiertage und arbeitsfreie Tage zählen als Ruhezeit (natürlich im Zeitabstand enthalten).
  public func checkRestTimeViolations(
    allEntries : [TrackingTypes.TimeEntry],
  ) : [RestTimeCheckResult] {
    let nsPerHour : Float = 3_600_000_000_000.0;

    // Nur Einträge MIT von UND bis berücksichtigen.
    // Reine hours-only Einträge werden NICHT synthetisiert – sie würden falsche
    // Ruhezeit-Verstösse für Tage ohne tatsächliche Von/Bis-Zeitangabe erzeugen.
    type EntryTime = { id : Nat; startNs : Int; endNs : Int };

    let withTimes : [EntryTime] = allEntries.filterMap<TrackingTypes.TimeEntry, EntryTime>(
      func(te) {
        switch (te.von, te.bis) {
          case (?vonStr, ?bisStr) {
            let dateNs = dateToNs(te.date);
            let startNs = dateNs + timeStrToNs(vonStr);
            let endNs = dateNs + timeStrToNs(bisStr);
            // Übermitternacht: wenn bis < von, dann bis am nächsten Tag
            let adjustedEndNs = if (endNs < startNs) {
              endNs + 86_400_000_000_000;
            } else { endNs };
            ?{ id = te.id; startNs; endNs = adjustedEndNs };
          };
          // hours-only Einträge: IGNORIEREN (kein synthetisches 08:00-Start)
          case _ { null };
        };
      }
    );

    if (withTimes.size() < 2) return [];

    // Chronologisch sortieren nach startNs
    let sorted = withTimes.sort(func(a : EntryTime, b : EntryTime) : { #less; #equal; #greater } {
      Int.compare(a.startNs, b.startNs);
    });

    // Für jedes konsekutive Paar Ruhezeit berechnen.
    // Ruhezeit = Lücke zwischen Ende der vorherigen und Beginn der nächsten Arbeitssession.
    // Tage ohne Einträge (Wochenenden, Feiertage, Freitage) liegen natürlich im Zeitabstand.
    var results : [RestTimeCheckResult] = [];
    var i = 0;
    while (i + 1 < sorted.size()) {
      let prev = sorted[i];
      let next = sorted[i + 1];
      // Nur prüfen wenn prev und next auf VERSCHIEDENEN Tagen liegen.
      // Blöcke am gleichen Tag (z.B. Morgen- und Abendschicht) werden nicht als
      // tagesübergreifende Ruhezeitverletzung gewertet.
      let prevDate = nsToDate(prev.endNs);
      let nextDate = nsToDate(next.startNs);
      if (prevDate != nextDate) {
        let restNs : Int = next.startNs - prev.endNs;
        let restHours : Float = restNs.toFloat() / nsPerHour;
        let isCompliant = restHours >= 11.0;
        results := results.concat([{
          prevEntryId = prev.id;
          nextEntryId = next.id;
          prevEnd = prev.endNs;
          nextStart = next.startNs;
          restHours;
          isCompliant;
        }]);
      };
      i += 1;
    };
    results;
  };

  // Hilfsfunktion: "HH:MM" → Nanosekunden seit Tagesbeginn
  private func timeStrToNs(timeStr : Text) : Int {
    let parts = timeStr.split(#char ':');
    let arr = parts.toArray();
    if (arr.size() < 2) return 0;
    let h = switch (Int.fromText(arr[0])) { case (?v) v; case null 0 };
    let m = switch (Int.fromText(arr[1])) { case (?v) v; case null 0 };
    (h * 60 + m) * 60 * 1_000_000_000;
  };
  // Konvertiert YYYY-MM-DD → YYYY_MM_DD (serviceYearKey)
  private func dateToServiceYearKey(dateStr : Text) : Text {
    let arr = dateStr.split(#char '-').toArray();
    if (arr.size() < 3) { dateStr } else { arr[0] # "_" # arr[1] # "_" # arr[2] };
  };

  // Konvertiert YYYY_MM_DD (serviceYearKey) → YYYY-MM-DD
  private func serviceYearKeyToDate(key : Text) : Text {
    let arr = key.split(#char '_').toArray();
    if (arr.size() < 3) { key } else { arr[0] # "-" # arr[1] # "-" # arr[2] };
  };

  // ─── Weekend rest check (35h Swiss rule) ──────────────────────────────────────

  // Schweizer Wochenruhezeit: mind. 35h zusammenhängend, muss Sa 23:00 bis So 23:00 einschliessen.
  // Prüft ob im Zeitraum von Samstag 23:00 bis Sonntag 23:00 Arbeitszeit stattfand.
  public type WeekendRestFinding = {
    ruleCode : Text;
    category : ComplianceTypes.ComplianceRuleKategorie;
    severity : ComplianceTypes.ComplianceStatus;
    istWert : Float;
    sollWert : Float;
    einheit : Text;
    meldung : Text;
  };

  public func checkWeekendRestTime(
    weekEntries : [TrackingTypes.TimeEntry],
    weekStart : Text, // YYYY-MM-DD Montag der Woche
  ) : ?WeekendRestFinding {
    // Samstag = weekStart + 5 Tage, Sonntag = weekStart + 6 Tage
    let startDays = dateToUnixDays(weekStart);
    let saturdayStr = unixDaysToDate(startDays + 5);
    let sundayStr = unixDaysToDate(startDays + 6);

    // Fenster: Samstag 23:00 bis Sonntag 23:00
    let satNs = dateToNs(saturdayStr);
    let sunNs = dateToNs(sundayStr);
    let windowStart = satNs + (23 * 60 * 60 * 1_000_000_000);
    let windowEnd = sunNs + (23 * 60 * 60 * 1_000_000_000);

    // Prüfen ob Arbeit im Fenster stattfand
    let workInWindow = weekEntries.any(func(te) {
      switch (te.von, te.bis) {
        case (?vonStr, ?bisStr) {
          let dateNs = dateToNs(te.date);
          let startNs = dateNs + timeStrToNs(vonStr);
          let endNs = dateNs + timeStrToNs(bisStr);
          let adjustedEndNs = if (endNs < startNs) { endNs + 86_400_000_000_000 } else { endNs };
          // Überlappung mit dem Fenster?
          startNs < windowEnd and adjustedEndNs > windowStart;
        };
        case _ {
          // Nur Datum: Wochenendeintrag ohne Von/Bis
          te.date == saturdayStr or te.date == sundayStr;
        };
      };
    });

    if (not workInWindow) {
      null; // Keine Verletzung
    } else {
      // Wochenruhezeit-Verletzung: Finding-Daten zurückgeben
      ?{
        ruleCode = "WEEKEND_REST";
        category = #REST_TIME;
        severity = #BREACH;
        istWert = 0.0;
        sollWert = 35.0;
        einheit = "h";
        meldung = "Wöchentliche Ruhezeit unterschritten: Arbeit im Fenster Sa 23:00–So 23:00 (mind. 35h Wochenruhezeit gemäss ArG)"
      };
    };
  };

  // ─── Two-week vacation block check ────────────────────────────────────────────

  // Prüft ob mind. ein zusammenhängender Ferienblock von minBlockDays Arbeitstagen existiert.
  public func checkTwoWeekVacationBlock(
    vacations : [TrackingTypes.Absence],
    serviceYearStart : Text,
    serviceYearEnd : Text,
    minBlockDays : Nat,
  ) : { satisfied : Bool; longestBlock : Int; warningTriggered : Bool } {
    // Nur genehmigte oder eingereichte Ferien im Dienstjahr berücksichtigen
    let ferienImDienstjahr = vacations.filter(func(ab) {
      (ab.status == #approved or ab.status == #submitted)
        and ab.dateFrom >= serviceYearStart and ab.dateTo <= serviceYearEnd;
    });

    if (ferienImDienstjahr.size() == 0) {
      return { satisfied = false; longestBlock = 0; warningTriggered = true };
    };

    // Hilfsfunktion: Anzahl Arbeitstage (Mo–Fr) zwischen zwei Daten (inkl. beider Grenztage)
    func countWorkingDays(from : Text, to_ : Text) : Int {
      let fromD = dateToUnixDays(from);
      let toD   = dateToUnixDays(to_);
      var count : Int = 0;
      var d = fromD;
      while (d <= toD) {
        let dow = ((d + 3) % 7).toNat(); // 0=Mo...4=Fr, 5=Sa, 6=So
        if (dow < 5) { count += 1 };
        d += 1;
      };
      count;
    };

    // Nach Startdatum sortieren
    let sorted = ferienImDienstjahr.sort(
      func(a : TrackingTypes.Absence, b : TrackingTypes.Absence) : { #less; #equal; #greater } {
        if (a.dateFrom < b.dateFrom) { #less }
        else if (a.dateFrom > b.dateFrom) { #greater }
        else { #equal };
      }
    );

    // Zusammenhängende Blöcke berechnen (Blöcke die sich direkt anschliessen oder überlappen,
    // max. 2 Tage Lücke für Wochenenden)
    var longestBlockWorkDays : Int = 0;
    var longestBlockCalDays  : Int = 0;
    var currentBlockStart = "";
    var currentBlockEnd = "";

    for (ab in sorted.values()) {
      if (currentBlockStart == "") {
        currentBlockStart := ab.dateFrom;
        currentBlockEnd := ab.dateTo;
      } else {
        let gapDays = dateToUnixDays(ab.dateFrom) - dateToUnixDays(currentBlockEnd) - 1;
        if (gapDays <= 2) {
          // Block erweitern
          if (ab.dateTo > currentBlockEnd) { currentBlockEnd := ab.dateTo };
        } else {
          // Block abschliessen
          let wDays = countWorkingDays(currentBlockStart, currentBlockEnd);
          let cDays = dateToUnixDays(currentBlockEnd) - dateToUnixDays(currentBlockStart) + 1;
          if (wDays > longestBlockWorkDays) { longestBlockWorkDays := wDays };
          if (cDays > longestBlockCalDays)  { longestBlockCalDays  := cDays };
          currentBlockStart := ab.dateFrom;
          currentBlockEnd := ab.dateTo;
        };
      };
    };
    // Letzten Block abschliessen
    if (currentBlockStart != "") {
      let wDays = countWorkingDays(currentBlockStart, currentBlockEnd);
      let cDays = dateToUnixDays(currentBlockEnd) - dateToUnixDays(currentBlockStart) + 1;
      if (wDays > longestBlockWorkDays) { longestBlockWorkDays := wDays };
      if (cDays > longestBlockCalDays)  { longestBlockCalDays  := cDays };
    };

    // Erfüllt wenn längster Block >= minBlockDays Arbeitstage (Mo–Fr)
    let satisfied = longestBlockWorkDays >= minBlockDays.toInt();
    let warningTriggered = not satisfied;
    // longestBlock als Kalendertage zurückgeben (für Anzeige)
    { satisfied; longestBlock = longestBlockCalDays; warningTriggered };
  };

  // ─── Compliance finding creation helpers ───────────────────────────────────────

  // Erzeugt ein neues ComplianceFinding aus den gegebenen Daten
  public func makeFinding(
    id : Nat,
    employeeId : Nat,
    companyId : Nat,
    periodeTyp : ComplianceTypes.CompliancePeriodeTyp,
    periodeKey : Text,
    ruleCode : Text,
    status : ComplianceTypes.ComplianceStatus,
    istWert : Float,
    sollWert : Float,
    einheit : Text,
    meldung : Text,
    rechtlicheReferenz : ?Text,
    sourceEntryIds : [Nat],
  ) : ComplianceTypes.ComplianceFinding {
    {
      id;
      employeeId;
      companyId;
      periodeTyp;
      periodeKey;
      ruleCode;
      status;
      istWert;
      sollWert;
      einheit;
      meldung;
      rechtlicheReferenz;
      createdAt = Time.now();
      resolvedAt = null;
      resolvedBy = null;
      resolutionType = null;
      resolutionReason = null;
      sourceEntryIds;
      auditHash = null;
    };
  };

  // ─── Pause compliance check per day ─────────────────────────────────────────

  // Prüft die Mindestpause für alle Tage in einem Zeitraum und erzeugt Findings.
  // Verwendet PauseDetectionLib um Pausen aus Lücken zwischen Zeitblöcken zu berechnen.
  public func checkDailyPauseCompliance(
    employeeId : Nat,
    companyId : Nat,
    weekStart : Text,
    weekEnd : Text,
    weekEntries : [TrackingTypes.TimeEntry],
    pauseOverrides : [ComplianceTypes.PauseOverride],
    nextFindingId : { var value : Nat },
  ) : [ComplianceTypes.ComplianceFinding] {
    var findings : [ComplianceTypes.ComplianceFinding] = [];

    // Alle unterschiedlichen Tage in weekEntries sammeln
    var days : [Text] = [];
    for (te in weekEntries.values()) {
      if (te.date >= weekStart and te.date <= weekEnd) {
        let alreadyIn = days.any(func(d : Text) : Bool { d == te.date });
        if (not alreadyIn) {
          days := days.concat([te.date]);
        };
      };
    };

    for (date in days.values()) {
      let dayEntries = weekEntries.filter(func(te : TrackingTypes.TimeEntry) : Bool {
        te.date == date;
      });
      let dayOverrides = pauseOverrides.filter(func(ov : ComplianceTypes.PauseOverride) : Bool {
        ov.userId == employeeId and ov.companyId == companyId and ov.date == date;
      });
      let workMinutes = PauseDetectionLib.calculateWorkDurationMinutes(
        employeeId, companyId, date, dayEntries
      );
      // Keine Prüfung nötig wenn keine Von/Bis-Einträge vorhanden
      if (workMinutes > 0) {
        let pausen = PauseDetectionLib.detectPausesForDay(
          employeeId, companyId, date, dayEntries, dayOverrides
        );
        let compResult = PauseDetectionLib.calculatePauseCompliance(
          employeeId, companyId, date, workMinutes, pausen
        );
        if (not compResult.isCompliant and compResult.requiredPauseMinutes > 0) {
          let id = nextFindingId.value;
          nextFindingId.value += 1;
          findings := findings.concat([makeFinding(
            id, employeeId, companyId,
            #DAY, date,
            "PAUSE_MINIMUM",
            #BREACH,
            compResult.detectedPauseMinutes.toFloat(),
            compResult.requiredPauseMinutes.toFloat(),
            "min",
            compResult.meldung,
            ?"ArG Art. 15",
            [],
          )]);
        };
      };
    };
    findings;
  };

  // ─── Weekly compliance run ─────────────────────────────────────────────────────

  // Führt den wöchentlichen Compliance-Check für einen Mitarbeiter durch.
  // Gibt generierte Findings zurück (noch nicht persistiert).
  // contractualWeeklyH: Soll-Stunden aus der Beschäftigung (überschreibt Profil-Wert).
  public func runWeeklyCheckForEmployee(
    employeeId : Nat,
    companyId : Nat,
    weekStart : Text,  // Montag der Woche YYYY-MM-DD
    weekEnd : Text,    // Sonntag der Woche YYYY-MM-DD
    allEntries : [TrackingTypes.TimeEntry],
    profile : ComplianceTypes.EmployeeComplianceProfile,
    nextFindingId : { var value : Nat },
    pauseOverrides : [ComplianceTypes.PauseOverride],
    contractualWeeklyH : Float,
  ) : [ComplianceTypes.ComplianceFinding] {
    var findings : [ComplianceTypes.ComplianceFinding] = [];

    // Wocheneinträge des Mitarbeiters (mit Von/Bis bevorzugt; hours-only ebenfalls für Überstunden)
    let weekEntries = allEntries.filter(func(te) {
      te.employeeId == employeeId and te.companyId == companyId
        and te.date >= weekStart and te.date <= weekEnd;
    });

    // 1. Überstunden (Soll-Stunden aus Beschäftigung)
    let overtimeResult = calculateWeeklyOvertime(weekEntries, profile, contractualWeeklyH);
    let weekKey = weekStart; // Verwende Montag als Wochenschlüssel

    if (overtimeResult.contractualOvertimeH > 0.0) {
      let id = nextFindingId.value;
      nextFindingId.value += 1;
      findings := findings.concat([makeFinding(
        id, employeeId, companyId,
        #WEEK, weekKey,
        "OVERTIME_CONTRACTUAL",
        #INFO,
        overtimeResult.contractualOvertimeH,
        contractualWeeklyH,
        "h",
        "Vertragliche Überstunden: " # floatToText(overtimeResult.contractualOvertimeH, 2) # "h über Sollzeit",
        ?"OR Art. 321c",
        [],
      )]);
    };

    if (overtimeResult.legalOvertimeH > 0.0) {
      let id = nextFindingId.value;
      nextFindingId.value += 1;
      findings := findings.concat([makeFinding(
        id, employeeId, companyId,
        #WEEK, weekKey,
        "OVERTIME_LEGAL",
        #BREACH,
        overtimeResult.legalOvertimeH,
        profile.gesetzlicheWochenhochstarbeitszeit,
        "h",
        "Gesetzliche Überzeit: " # floatToText(overtimeResult.legalOvertimeH, 2) # "h über gesetzlicher Höchstarbeitszeit",
        ?"ArG Art. 12",
        [],
      )]);
    };

    // 2. Ruhezeit-Prüfung
    // Wir prüfen alle Einträge des Mitarbeiters (nicht nur die aktuelle Woche),
    // damit Ruhezeit zwischen letzter Woche Freitag und dieser Woche Montag korrekt erkannt wird.
    // Nur Violations werden gespeichert, deren "nextStart" in dieser Woche liegt
    // (= der verletzende Arbeitsbeginn liegt in der aktuellen Woche).
    let empAllEntries = allEntries.filter(func(te) {
      te.employeeId == employeeId and te.companyId == companyId;
    });
    let restViolations = checkRestTimeViolations(empAllEntries);
    for (rv in restViolations.values()) {
      if (not rv.isCompliant) {
        // Violation gehört zum Tag des NÄCHSTEN Arbeitsbeginns (rv.nextStart)
        let violationDate = nsToDate(rv.nextStart);
        if (violationDate >= weekStart and violationDate <= weekEnd) {
          // periodeKey als Datumspaar für eindeutige Identifikation der Ruhezeit-Verletzung
          let prevDate = nsToDate(rv.prevEnd);
          let restPeriodeKey = prevDate # "_" # violationDate;
          let id = nextFindingId.value;
          nextFindingId.value += 1;
          findings := findings.concat([makeFinding(
            id, employeeId, companyId,
            #DAY, restPeriodeKey,
            "REST_TIME",
            #BREACH,
            rv.restHours,
            11.0,
            "h",
            "Tägliche Ruhezeit unterschritten: " # floatToText(rv.restHours, 1) # "h (mind. 11h erforderlich)",
            ?"ArG Art. 15a",
            [rv.prevEntryId, rv.nextEntryId],
          )]);
        };
      };
    };

    // 3. Wochenruhezeit-Prüfung (35h Sa 23:00 – So 23:00)
    let weekEntriesForRest = allEntries.filter(func(te) {
      te.employeeId == employeeId and te.companyId == companyId
        and te.date >= weekStart and te.date <= weekEnd;
    });
    switch (checkWeekendRestTime(weekEntriesForRest, weekStart)) {
      case null {};
      case (?findingData) {
        let id = nextFindingId.value;
        nextFindingId.value += 1;
        findings := findings.concat([makeFinding(
          id, employeeId, companyId,
          #WEEK, weekStart,
          findingData.ruleCode,
          findingData.severity,
          findingData.istWert,
          findingData.sollWert,
          findingData.einheit,
          findingData.meldung,
          ?"ArG Art. 21",
          [],
        )]);
      };
    };

    // 4. Mindestpausen-Prüfung pro Tag
    let pauseFindings = checkDailyPauseCompliance(
      employeeId, companyId, weekStart, weekEnd,
      weekEntries, pauseOverrides, nextFindingId
    );
    findings := findings.concat(pauseFindings);

    findings;
  };

  // Hilfsfunktion: Float zu Text mit Dezimalstellen
  public func floatToText(f : Float, decimals : Nat) : Text {
    let factor = (Nat.pow(10, decimals)).toFloat();
    let rounded = ((f * factor).toInt()).toFloat() / factor;
    let intPart = rounded.toInt();
    let fracPart = ((rounded - intPart.toFloat()) * factor).toInt();
    let intText = intPart.toText();
    let fracText = Int.abs(fracPart).toText();
    // Führende Nullen für Dezimalteil
    var pad = "";
    if (fracText.size() < decimals) {
      var k = 0;
      let needed : Int = decimals.toInt() - fracText.size().toInt();
      while (k < needed) { pad #= "0"; k += 1 };
    };
    intText # "." # pad # fracText;
  };

  // ─── Contractual hours helper ──────────────────────────────────────────────

  // Gibt die vertraglichen Wochenstunden aus der zum Datum gültigen Beschäftigung zurück.
  // dateISO: YYYY-MM-DD; employments: alle Beschäftigungen des Mitarbeiters.
  // Gibt null zurück, wenn keine gültige Beschäftigung für das Datum gefunden.
  public func getContractualHoursForDate(
    employeeId : Nat,
    dateISO : Text,
    employments : [CompanyTypes.Employment],
  ) : ?Float {
    let dateNs = dateToNs(dateISO);
    // Suche die zum Datum gültige Beschäftigung
    var result : ?Float = null;
    for (emp in employments.vals()) {
      if (emp.employeeId == employeeId) {
        let vonNs = normalizeNs(emp.von);
        let afterVon = dateNs >= vonNs;
        let beforeBis = switch (emp.bis) {
          case null { true };
          case (?bis) { dateNs <= normalizeNs(bis) };
        };
        if (afterVon and beforeBis) {
          // Wochenstunden = Summe aller Tage in Minuten / 60
          let totalMinutes : Nat = emp.stundenMo + emp.stundenDi + emp.stundenMi +
            emp.stundenDo + emp.stundenFr + emp.stundenSa + emp.stundenSo;
          let weeklyHours : Float = totalMinutes.toFloat() / 60.0;
          result := ?weeklyHours;
        };
      };
    };
    result;
  };

  // ─── Unit tests ───────────────────────────────────────────────────────────────

  public func runUnitTests() : () {
    // Test 1: Dienstjahresberechnung
    do {
      let info = calculateServiceYear("2024-03-15", "2025-05-01");
      assert(info.yearNumber == 2);
      assert(info.serviceYearKey == "2025_03_15");
      assert(info.startDate == "2025-03-15");
      assert(info.endDate == "2026-03-14");
      Debug.print("[Test 1 PASS] Service year calc: yearNumber=" # info.yearNumber.toText() # " key=" # info.serviceYearKey);
    };

    // Test 2: Ferienanspruch mit 20. Geburtstag im Dienstjahr
    // Eintritt 2024-03-15, 20. Geburtstag am 2024-09-10
    // Geburtsdatum = 2004-09-10 (in Nanosekunden)
    do {
      // 2004-09-10 in Unix-Tagen: dateToUnixDays("2004-09-10") * nsPerDay
      let bd2004Days = dateToUnixDays("2004-09-10");
      let bdNs : Int = bd2004Days * 86_400_000_000_000;
      let entitlement = calculateLegalVacationEntitlement(?bdNs, "2024-03-15", "2024_03_15");
      // Erwarteter Wert: ~22.53 Tage
      let ok = entitlement > 22.0 and entitlement < 23.0;
      Debug.print("[Test 2 " # (if ok "PASS" else "FAIL") # "] Vacation entitlement with split: " # floatToText(entitlement, 2) # " days (expected ~22.5)");
    };

    // Test 3: Ferienanspruch ohne Split
    do {
      // Geburtsdatum = 1990-01-01 → während Dienstjahr 2024/2025 immer >= 20
      let bdOldDays = dateToUnixDays("1990-01-01");
      let bdOldNs : Int = bdOldDays * 86_400_000_000_000;
      let e1 = calculateLegalVacationEntitlement(?bdOldNs, "2024-03-15", "2024_03_15");
      assert(e1 == 20.0);
      Debug.print("[Test 3a PASS] Vacation entitlement (>20 all year): " # floatToText(e1, 1) # " days");

      // Geburtsdatum = 2010-01-01 → während Dienstjahr 2024/2025 noch < 20
      let bdYoungDays = dateToUnixDays("2010-01-01");
      let bdYoungNs : Int = bdYoungDays * 86_400_000_000_000;
      let e2 = calculateLegalVacationEntitlement(?bdYoungNs, "2024-03-15", "2024_03_15");
      assert(e2 == 25.0);
      Debug.print("[Test 3b PASS] Vacation entitlement (<20 all year): " # floatToText(e2, 1) # " days");
    };

    // Test 4: Ruhezeit Freitag 22:00 → Montag 08:00 = 58h (COMPLIANT)
    do {
      let entries : [TrackingTypes.TimeEntry] = [
        {
          id = 1; companyId = 1; employeeId = 1; projectId = 0; serviceTypeId = 0;
          date = "2024-03-15"; hours = 8.0;
          von = ?"08:00"; bis = ?"22:00";
          description = "Freitag"; billable = false;
          createdAt = 0; fakturiertInRechnungId = null;
        },
        {
          id = 2; companyId = 1; employeeId = 1; projectId = 0; serviceTypeId = 0;
          date = "2024-03-18"; hours = 8.0;
          von = ?"08:00"; bis = ?"16:00";
          description = "Montag"; billable = false;
          createdAt = 0; fakturiertInRechnungId = null;
        },
      ];
      let violations = checkRestTimeViolations(entries);
      let allCompliant = violations.all(func(r) { r.isCompliant });
      Debug.print("[Test 4 " # (if allCompliant "PASS" else "FAIL") # "] Rest time Fr→Mo 58h: all compliant=" # debug_show(allCompliant));
    };

    // Test 5: Ruhezeit 01:00-09:00 → 18:00-22:00 gleicher Tag = 9h (BREACH)
    // Zwei Blöcke am gleichen Tag: kein tagesübergreifender Verstoss erwartet
    do {
      let entries : [TrackingTypes.TimeEntry] = [
        {
          id = 3; companyId = 1; employeeId = 1; projectId = 0; serviceTypeId = 0;
          date = "2024-03-19"; hours = 4.0;
          von = ?"01:00"; bis = ?"09:00";
          description = "Nachtschicht"; billable = false;
          createdAt = 0; fakturiertInRechnungId = null;
        },
        {
          id = 4; companyId = 1; employeeId = 1; projectId = 0; serviceTypeId = 0;
          date = "2024-03-19"; hours = 4.0;
          von = ?"18:00"; bis = ?"22:00";
          description = "Abendschicht"; billable = false;
          createdAt = 0; fakturiertInRechnungId = null;
        },
      ];
      // Gleicher Tag: keine tagesübergreifende Ruhezeitverletzung erwartet
      let violations = checkRestTimeViolations(entries);
      let noInterDayViolation = violations.size() == 0;
      Debug.print("[Test 5 " # (if noInterDayViolation "PASS" else "FAIL") # "] Same-day blocks: no inter-day violation (violations=" # violations.size().toText() # ")");
    };

    // Test 6: Ruhezeit Di 23:00 → Mi 07:00 = 8h (BREACH, tagesübergreifend)
    do {
      let entries : [TrackingTypes.TimeEntry] = [
        {
          id = 5; companyId = 1; employeeId = 1; projectId = 0; serviceTypeId = 0;
          date = "2026-05-12"; hours = 8.0;
          von = ?"15:00"; bis = ?"23:00";
          description = "Dienstag"; billable = false;
          createdAt = 0; fakturiertInRechnungId = null;
        },
        {
          id = 6; companyId = 1; employeeId = 1; projectId = 0; serviceTypeId = 0;
          date = "2026-05-13"; hours = 8.0;
          von = ?"07:00"; bis = ?"15:00";
          description = "Mittwoch"; billable = false;
          createdAt = 0; fakturiertInRechnungId = null;
        },
      ];
      let violations = checkRestTimeViolations(entries);
      let hasViolation = violations.any(func(r) { not r.isCompliant });
      assert(hasViolation);
      // Überprüfe dass Ruhezeit korrekt als 8h berechnet wird
      let violation = violations.find(func(r) { not r.isCompliant });
      switch (violation) {
        case null {};
        case (?v) {
          let restHoursOk = v.restHours > 7.9 and v.restHours < 8.1;
          assert(restHoursOk);
          Debug.print("[Test 6 PASS] Rest time Di 23:00→Mi 07:00=" # floatToText(v.restHours, 1) # "h (Verstoss < 11h)");
        };
      };
      if (not hasViolation) {
        Debug.print("[Test 6 FAIL] Rest time Di 23:00→Mi 07:00: kein Verstoss erkannt!");
      };
    };

    // Test 7: hours-only Einträge erzeugen keine falschen Ruhezeitverstösse
    do {
      let entries : [TrackingTypes.TimeEntry] = [
        {
          id = 7; companyId = 1; employeeId = 1; projectId = 0; serviceTypeId = 0;
          date = "2026-05-18"; hours = 8.0;
          von = null; bis = null;
          description = "Montag hours-only"; billable = false;
          createdAt = 0; fakturiertInRechnungId = null;
        },
        {
          id = 8; companyId = 1; employeeId = 1; projectId = 0; serviceTypeId = 0;
          date = "2026-05-19"; hours = 8.0;
          von = null; bis = null;
          description = "Dienstag hours-only"; billable = false;
          createdAt = 0; fakturiertInRechnungId = null;
        },
      ];
      let violations = checkRestTimeViolations(entries);
      let noViolations = violations.size() == 0;
      assert(noViolations);
      Debug.print("[Test 7 " # (if noViolations "PASS" else "FAIL") # "] hours-only entries: no rest-time violations generated");
    };

    Debug.print("[Compliance unit tests complete]");
  };
};
