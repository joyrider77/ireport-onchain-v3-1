// Domänenlogik für Firmen- und Mitarbeiterverwaltung
import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Float "mo:core/Float";
import CommonTypes "../types/common";
import CompanyTypes "../types/company";
import TrackingTypes "../types/timetracking";
import MasterTypes "../types/masterdata";

module {
  public type Company = CompanyTypes.Company;
  public type Employee = CompanyTypes.Employee;
  public type Employment = CompanyTypes.Employment;
  public type VacationBalance = CompanyTypes.VacationBalance;
  public type TimeBalanceCorrection = CompanyTypes.TimeBalanceCorrection;
  public type CompanySettings = CompanyTypes.CompanySettings;
  public type UserNotificationSettings = CompanyTypes.UserNotificationSettings;
  public type CompanyId = CommonTypes.CompanyId;
  public type EmployeeId = CommonTypes.EmployeeId;

  // Prüft ob ein Principal bereits registriert ist
  public func isRegistered(
    principalToCompany : Map.Map<Principal, CompanyId>,
    caller : Principal,
  ) : Bool {
    switch (principalToCompany.get(caller)) {
      case (?_) { true };
      case null { false };
    };
  };

  // Gibt die Firma eines Benutzers zurück
  public func getCompanyByPrincipal(
    companies : List.List<Company>,
    principalToCompany : Map.Map<Principal, CompanyId>,
    caller : Principal,
  ) : ?Company {
    switch (principalToCompany.get(caller)) {
      case null { null };
      case (?companyId) {
        companies.find(func(c) { c.id == companyId });
      };
    };
  };

  // Findet eine Firma nach ID
  public func getCompanyById(
    companies : List.List<Company>,
    id : CompanyId,
  ) : ?Company {
    companies.find(func(c) { c.id == id });
  };

  // Erstellt eine neue Firma
  public func createCompany(
    companies : List.List<Company>,
    principalToCompany : Map.Map<Principal, CompanyId>,
    nextId : Nat,
    input : CompanyTypes.RegisterCompanyInput,
    caller : Principal,
  ) : Company {
    let company : Company = {
      id = nextId;
      name = input.name;
      logoUrl = null;
      taxId = null;
      address = null;
      createdAt = Time.now();
    };
    companies.add(company);
    principalToCompany.add(caller, nextId);
    company;
  };

  // Aktualisiert Firmendaten
  public func updateCompany(
    companies : List.List<Company>,
    companyId : CompanyId,
    input : CompanyTypes.UpdateCompanyInput,
  ) : ?Company {
    var result : ?Company = null;
    companies.mapInPlace(func(c) {
      if (c.id == companyId) {
        let updated : Company = {
          c with
          name = switch (input.name) { case (?n) n; case null c.name };
          logoUrl = switch (input.logoUrl) { case (?l) ?l; case null c.logoUrl };
          taxId = switch (input.taxId) { case (?t) ?t; case null c.taxId };
          address = switch (input.address) { case (?a) ?a; case null c.address };
        };
        result := ?updated;
        updated;
      } else { c };
    });
    result;
  };

  // Gibt alle Mitarbeiter einer Firma zurück
  public func listEmployees(
    employees : List.List<Employee>,
    companyId : CompanyId,
  ) : [Employee] {
    employees.filter(func(e) { e.companyId == companyId }).toArray();
  };

  // Erstellt einen neuen Mitarbeiter
  public func createEmployee(
    employees : List.List<Employee>,
    nextId : Nat,
    companyId : CompanyId,
    input : CompanyTypes.CreateEmployeeInput,
  ) : Employee {
    let emp : Employee = {
      id = nextId;
      companyId;
      principalId = null;
      firstName = input.firstName;
      lastName = input.lastName;
      email = input.email;
      role = input.role;
      employmentType = input.employmentType;
      startDate = input.startDate;
      weeklyHoursTarget = input.weeklyHoursTarget;
      active = true;
      geburtsdatum = input.geburtsdatum;
      adresseZusatz1 = input.adresseZusatz1;
      adresseZusatz2 = input.adresseZusatz2;
      strasse = input.strasse;
      postfach = input.postfach;
      plz = input.plz;
      ort = input.ort;
      land = input.land;
    };
    employees.add(emp);
    emp;
  };

  // Aktualisiert Mitarbeiterdaten
  public func updateEmployee(
    employees : List.List<Employee>,
    companyId : CompanyId,
    employeeId : EmployeeId,
    input : CompanyTypes.UpdateEmployeeInput,
  ) : ?Employee {
    var result : ?Employee = null;
    employees.mapInPlace(func(e) {
      if (e.id == employeeId and e.companyId == companyId) {
        let updated : Employee = {
          e with
          firstName = switch (input.firstName) { case (?v) v; case null e.firstName };
          lastName = switch (input.lastName) { case (?v) v; case null e.lastName };
          email = switch (input.email) { case (?v) v; case null e.email };
          role = switch (input.role) { case (?v) v; case null e.role };
          employmentType = switch (input.employmentType) { case (?v) v; case null e.employmentType };
          startDate = switch (input.startDate) { case (?v) v; case null e.startDate };
          weeklyHoursTarget = switch (input.weeklyHoursTarget) { case (?v) v; case null e.weeklyHoursTarget };
          active = switch (input.active) { case (?v) v; case null e.active };
          geburtsdatum = switch (input.geburtsdatum) { case (?v) ?v; case null e.geburtsdatum };
          adresseZusatz1 = switch (input.adresseZusatz1) { case (?v) ?v; case null e.adresseZusatz1 };
          adresseZusatz2 = switch (input.adresseZusatz2) { case (?v) ?v; case null e.adresseZusatz2 };
          strasse = switch (input.strasse) { case (?v) ?v; case null e.strasse };
          postfach = switch (input.postfach) { case (?v) ?v; case null e.postfach };
          plz = switch (input.plz) { case (?v) ?v; case null e.plz };
          ort = switch (input.ort) { case (?v) ?v; case null e.ort };
          land = switch (input.land) { case (?v) ?v; case null e.land };
        };
        result := ?updated;
        updated;
      } else { e };
    });
    result;
  };

  // Deaktiviert einen Mitarbeiter (setzt active=false)
  public func deleteEmployee(
    employees : List.List<Employee>,
    companyId : CompanyId,
    employeeId : EmployeeId,
  ) : Bool {
    var found = false;
    employees.mapInPlace(func(e) {
      if (e.id == employeeId and e.companyId == companyId) {
        found := true;
        { e with active = false };
      } else { e };
    });
    found;
  };

  // Gibt den Mitarbeiter eines Benutzers zurück
  public func getEmployeeByPrincipal(
    employees : List.List<Employee>,
    principalToEmployee : Map.Map<Principal, EmployeeId>,
    caller : Principal,
    companyId : CompanyId,
  ) : ?Employee {
    switch (principalToEmployee.get(caller)) {
      case null { null };
      case (?empId) {
        employees.find(func(e) { e.id == empId and e.companyId == companyId });
      };
    };
  };

  // Verknüpft einen Principal mit einem Mitarbeiter (beim Einlösen des Einladungscodes)
  public func linkPrincipalToEmployee(
    employees : List.List<Employee>,
    principalToEmployee : Map.Map<Principal, EmployeeId>,
    employeeId : EmployeeId,
    caller : Principal,
  ) : Bool {
    var found = false;
    employees.mapInPlace(func(e) {
      if (e.id == employeeId) {
        found := true;
        { e with principalId = ?caller };
      } else { e };
    });
    if (found) {
      principalToEmployee.add(caller, employeeId);
    };
    found;
  };

  // Gibt die Firmeneinstellungen zurück
  public func getCompanySettings(
    settingsMap : Map.Map<CompanyId, CompanySettings>,
    companyId : CompanyId,
  ) : CompanySettings {
    switch (settingsMap.get(companyId)) {
      case (?s) { s };
      case null {
        {
          companyId;
          emailNewVacationRequest = true;
          emailOnApproval = true;
          vacationCarryoverDays = 5;
          maxVacationDays = 20;
          approvalRequired = true;
          timezone = "Europe/Zurich";
          allowExpiredVacationBalance = false;
        };
      };
    };
  };

  // Aktualisiert die Firmeneinstellungen
  public func updateCompanySettings(
    settingsMap : Map.Map<CompanyId, CompanySettings>,
    companyId : CompanyId,
    input : CompanySettings,
  ) : CompanySettings {
    let settings : CompanySettings = { input with companyId };
    settingsMap.add(companyId, settings);
    settings;
  };

  // Gibt die Benachrichtigungseinstellungen eines Benutzers zurück
  public func getUserNotificationSettings(
    notifSettingsMap : Map.Map<Principal, UserNotificationSettings>,
    caller : Principal,
    companyId : CompanyId,
  ) : UserNotificationSettings {
    switch (notifSettingsMap.get(caller)) {
      case (?s) { s };
      case null {
        {
          principalId = caller;
          companyId;
          emailNewVacationRequest = true;
          emailOnApproval = true;
        };
      };
    };
  };

  // Aktualisiert die Benachrichtigungseinstellungen eines Benutzers
  public func updateUserNotificationSettings(
    notifSettingsMap : Map.Map<Principal, UserNotificationSettings>,
    caller : Principal,
    input : UserNotificationSettings,
  ) : UserNotificationSettings {
    let settings : UserNotificationSettings = { input with principalId = caller };
    notifSettingsMap.add(caller, settings);
    settings;
  };

  // ─── Beschäftigungen ────────────────────────────────────────────────────────

  // Erstellt eine Beschäftigung; nur eine darf ohne Bis-Datum sein
  public func createEmployment(
    employments : List.List<Employment>,
    id : Text,
    employeeId : EmployeeId,
    companyId : CompanyId,
    input : CompanyTypes.CreateEmploymentInput,
  ) : { #ok : Employment; #err : Text } {
    // Prüfen: schon eine offene Beschäftigung vorhanden?
    if (input.bis == null) {
      let hasOpen = employments.any(func(em) {
        em.employeeId == employeeId and em.companyId == companyId and em.bis == null
      });
      if (hasOpen) {
        return #err("Es existiert bereits eine offene Beschäftigung (ohne Bis-Datum) für diesen Mitarbeiter.");
      };
    };
    let emp : Employment = {
      id;
      employeeId;
      companyId;
      funktion = input.funktion;
      von = input.von;
      bis = input.bis;
      feiertagsberechnungsart = input.feiertagsberechnungsart;
      pensum = input.pensum;
      stundenMo = input.stundenMo;
      stundenDi = input.stundenDi;
      stundenMi = input.stundenMi;
      stundenDo = input.stundenDo;
      stundenFr = input.stundenFr;
      stundenSa = input.stundenSa;
      stundenSo = input.stundenSo;
    };
    employments.add(emp);
    #ok(emp);
  };

  // Aktualisiert eine Beschäftigung; prüft die Bis-Datum-Regel
  public func updateEmployment(
    employments : List.List<Employment>,
    companyId : CompanyId,
    employeeId : EmployeeId,
    employmentId : Text,
    input : CompanyTypes.UpdateEmploymentInput,
  ) : { #ok : Employment; #err : Text } {
    // Prüfen ob die neue Konfiguration die Bis-Datum-Regel verletzt
    let newBis = input.bis;
    // Wenn bis auf null gesetzt wird, prüfen ob schon eine andere offene existiert
    switch (newBis) {
      case null {
        let hasOtherOpen = employments.any(func(em) {
          em.employeeId == employeeId and em.companyId == companyId
          and em.id != employmentId and em.bis == null
        });
        if (hasOtherOpen) {
          return #err("Es existiert bereits eine andere offene Beschäftigung (ohne Bis-Datum) für diesen Mitarbeiter.");
        };
      };
      case _ {};
    };
    var result : ?Employment = null;
    employments.mapInPlace(func(em) {
      if (em.id == employmentId and em.employeeId == employeeId and em.companyId == companyId) {
        let updated : Employment = {
          em with
          funktion = switch (input.funktion) { case (?v) v; case null em.funktion };
          von = switch (input.von) { case (?v) v; case null em.von };
          bis = switch (input.bis) { case (?v) ?v; case null em.bis };
          feiertagsberechnungsart = switch (input.feiertagsberechnungsart) { case (?v) v; case null em.feiertagsberechnungsart };
          pensum = input.pensum;
          stundenMo = input.stundenMo;
          stundenDi = input.stundenDi;
          stundenMi = input.stundenMi;
          stundenDo = input.stundenDo;
          stundenFr = input.stundenFr;
          stundenSa = input.stundenSa;
          stundenSo = input.stundenSo;
        };
        result := ?updated;
        updated;
      } else { em };
    });
    switch (result) {
      case null { #err("Beschäftigung nicht gefunden") };
      case (?em) { #ok(em) };
    };
  };

  // Löscht eine Beschäftigung
  public func deleteEmployment(
    employments : List.List<Employment>,
    companyId : CompanyId,
    employeeId : EmployeeId,
    employmentId : Text,
  ) : Bool {
    var found = false;
    let kept = employments.filter(func(em) {
      if (em.id == employmentId and em.employeeId == employeeId and em.companyId == companyId) {
        found := true;
        false;
      } else { true };
    });
    if (found) {
      employments.clear();
      employments.append(kept);
    };
    found;
  };

  // Listet alle Beschäftigungen eines Mitarbeiters
  public func listEmployments(
    employments : List.List<Employment>,
    companyId : CompanyId,
    employeeId : EmployeeId,
  ) : [Employment] {
    employments.filter(func(em) {
      em.employeeId == employeeId and em.companyId == companyId
    }).toArray();
  };

  // ─── Ferienguthaben ──────────────────────────────────────────────────────────

  // Erstellt ein Ferienguthaben
  public func createVacationBalance(
    vacationBalances : List.List<VacationBalance>,
    id : Text,
    employeeId : EmployeeId,
    companyId : CompanyId,
    input : CompanyTypes.CreateVacationBalanceInput,
  ) : VacationBalance {
    let vb : VacationBalance = {
      id;
      employeeId;
      companyId;
      kalenderjahr = input.kalenderjahr;
      dauer = input.dauer;
      verfallsdatum = input.verfallsdatum;
    };
    vacationBalances.add(vb);
    vb;
  };

  // Aktualisiert ein Ferienguthaben
  public func updateVacationBalance(
    vacationBalances : List.List<VacationBalance>,
    companyId : CompanyId,
    employeeId : EmployeeId,
    balanceId : Text,
    input : CompanyTypes.UpdateVacationBalanceInput,
  ) : ?VacationBalance {
    var result : ?VacationBalance = null;
    vacationBalances.mapInPlace(func(vb) {
      if (vb.id == balanceId and vb.employeeId == employeeId and vb.companyId == companyId) {
        let updated : VacationBalance = {
          vb with
          kalenderjahr = switch (input.kalenderjahr) { case (?v) v; case null vb.kalenderjahr };
          dauer = switch (input.dauer) { case (?v) v; case null vb.dauer };
          verfallsdatum = switch (input.verfallsdatum) { case (?v) ?v; case null vb.verfallsdatum };
        };
        result := ?updated;
        updated;
      } else { vb };
    });
    result;
  };

  // Löscht ein Ferienguthaben
  public func deleteVacationBalance(
    vacationBalances : List.List<VacationBalance>,
    companyId : CompanyId,
    employeeId : EmployeeId,
    balanceId : Text,
  ) : Bool {
    var found = false;
    let kept = vacationBalances.filter(func(vb) {
      if (vb.id == balanceId and vb.employeeId == employeeId and vb.companyId == companyId) {
        found := true;
        false;
      } else { true };
    });
    if (found) {
      vacationBalances.clear();
      vacationBalances.append(kept);
    };
    found;
  };

  // Listet alle Ferienguthaben eines Mitarbeiters
  public func listVacationBalances(
    vacationBalances : List.List<VacationBalance>,
    companyId : CompanyId,
    employeeId : EmployeeId,
  ) : [VacationBalance] {
    vacationBalances.filter(func(vb) {
      vb.employeeId == employeeId and vb.companyId == companyId
    }).toArray();
  };

  // Erstellt anteilsmässiges Ferienguthaben für das laufende Jahr beim Onboarding
  // Formel: (Tage von startDate bis Jahresende / 365) * 20 Tage * pensum%
  // Pensum ist 100 bei Erstellung, da Employment separat erstellt wird
  // dauer wird in Minuten gespeichert (1 Tag = 8h = 480 Min)
  public func createProRataVacationBalance(
    vacationBalances : List.List<VacationBalance>,
    id : Text,
    employeeId : EmployeeId,
    companyId : CompanyId,
    startDateNs : Int,
  ) : VacationBalance {
    // Aktuelles Jahr bestimmen anhand Time.now()
    let nowNs = Time.now();
    // Nanosekunden pro Tag: 24 * 3600 * 1_000_000_000
    let nsPerDay : Int = 86_400_000_000_000;
    // Jahr-Start (1. Jan des aktuellen Jahres) approximieren
    // Sekunden seit Epoch 1970-01-01
    let secondsNow : Int = nowNs / 1_000_000_000;
    let daysTotal : Int = secondsNow / 86400;
    let currentYear : Int = 1970 + daysTotal / 365; // Approximation (ohne Schaltjahre)
    // Jahresende-Timestamp approximieren
    let yearStartDays : Int = (currentYear - 1970) * 365;
    let yearEndDays : Int = yearStartDays + 365;
    let yearEndNs : Int = yearEndDays * nsPerDay;
    // Start des Mitarbeiters
    let effectiveStart : Int = if (startDateNs > nowNs) { nowNs } else { startDateNs };
    let daysRemaining : Int = (yearEndNs - effectiveStart) / nsPerDay;
    let daysTotal2 : Int = if (daysRemaining < 0) { 0 } else { daysRemaining };
    // 20 Tage/Jahr * anteilige Tage / 365 * pensum=100%
    let vacationMinutes : Int = (daysTotal2 * 20 * 480) / 365;
    let vb : VacationBalance = {
      id;
      employeeId;
      companyId;
      kalenderjahr = currentYear;
      dauer = vacationMinutes;
      verfallsdatum = null;
    };
    vacationBalances.add(vb);
    vb;
  };

  // ─── Zeitsaldokorrekturen ────────────────────────────────────────────────────

  // Erstellt eine Zeitsaldokorrektur
  public func createTimeBalanceCorrection(
    corrections : List.List<TimeBalanceCorrection>,
    id : Text,
    employeeId : EmployeeId,
    companyId : CompanyId,
    input : CompanyTypes.CreateTimeBalanceCorrectionInput,
  ) : TimeBalanceCorrection {
    let corr : TimeBalanceCorrection = {
      id;
      employeeId;
      companyId;
      typ = input.typ;
      wirkungsdatum = input.wirkungsdatum;
      dauer = input.dauer;
      ueberzeit = input.ueberzeit;
      bemerkung = input.bemerkung;
    };
    corrections.add(corr);
    corr;
  };

  // Aktualisiert eine Zeitsaldokorrektur
  public func updateTimeBalanceCorrection(
    corrections : List.List<TimeBalanceCorrection>,
    companyId : CompanyId,
    employeeId : EmployeeId,
    correctionId : Text,
    input : CompanyTypes.UpdateTimeBalanceCorrectionInput,
  ) : ?TimeBalanceCorrection {
    var result : ?TimeBalanceCorrection = null;
    corrections.mapInPlace(func(c) {
      if (c.id == correctionId and c.employeeId == employeeId and c.companyId == companyId) {
        let updated : TimeBalanceCorrection = {
          c with
          typ = switch (input.typ) { case (?v) v; case null c.typ };
          wirkungsdatum = switch (input.wirkungsdatum) { case (?v) v; case null c.wirkungsdatum };
          dauer = switch (input.dauer) { case (?v) v; case null c.dauer };
          ueberzeit = switch (input.ueberzeit) { case (?v) v; case null c.ueberzeit };
          bemerkung = switch (input.bemerkung) { case (?v) v; case null c.bemerkung };
        };
        result := ?updated;
        updated;
      } else { c };
    });
    result;
  };

  // Löscht eine Zeitsaldokorrektur
  public func deleteTimeBalanceCorrection(
    corrections : List.List<TimeBalanceCorrection>,
    companyId : CompanyId,
    employeeId : EmployeeId,
    correctionId : Text,
  ) : Bool {
    var found = false;
    let kept = corrections.filter(func(c) {
      if (c.id == correctionId and c.employeeId == employeeId and c.companyId == companyId) {
        found := true;
        false;
      } else { true };
    });
    if (found) {
      corrections.clear();
      corrections.append(kept);
    };
    found;
  };

  // Listet alle Zeitsaldokorrekturen eines Mitarbeiters
  public func listTimeBalanceCorrections(
    corrections : List.List<TimeBalanceCorrection>,
    companyId : CompanyId,
    employeeId : EmployeeId,
  ) : [TimeBalanceCorrection] {
    corrections.filter(func(c) {
      c.employeeId == employeeId and c.companyId == companyId
    }).toArray();
  };

  // Berechnet den Gleitzeitkonto-Saldo aus allen Korrekturen (in Minuten)
  // Gutschrift addiert, Reduktion subtrahiert
  public func getTimeBalance(
    corrections : List.List<TimeBalanceCorrection>,
    companyId : CompanyId,
    employeeId : EmployeeId,
  ) : Int {
    corrections.foldLeft<Int, TimeBalanceCorrection>(0, func(acc, c) {
      if (c.employeeId == employeeId and c.companyId == companyId) {
        switch (c.typ) {
          case (#gutschrift) { acc + c.dauer };
          case (#reduktion) { acc - c.dauer };
        };
      } else { acc };
    });
  };

  // ─── Arbeitszeitsaldo ────────────────────────────────────────────────────────

  // Hilfsfunktion: Konvertiert Datum-Text "YYYY-MM-DD" in Unix-Tage (seit 1970-01-01)
  // Gibt 0 zurück wenn das Format ungültig ist
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
    // Formel: Tage seit 1970-01-01 (Zeller/Gregorianischer Kalender)
    let y = if (month <= 2) { year - 1 } else { year };
    let m = if (month <= 2) { month + 9 } else { month - 3 };
    let era = if (y >= 0) { y / 400 } else { (y - 399) / 400 };
    let yoe = y - era * 400; // Jahr in der Ära (0..399)
    let doy = (153 * m + 2) / 5 + day - 1; // Tag im Jahr (0..364)
    let doe = yoe * 365 + yoe / 4 - yoe / 100 + doy; // Tag in der Ära
    era * 146097 + doe - 719468; // Tage seit 1970-01-01
  };

  // Öffentliche Funktion: Datum-Text "YYYY-MM-DD" → Nanosekunden-Timestamp (Beginn des Tages)
  public func dateTextToNs(dateStr : Text) : Int {
    let nsPerDay : Int = 86_400_000_000_000;
    dateToUnixDays(dateStr) * nsPerDay;
  };

  // Hilfsfunktion: Wochentag aus Unix-Tagen (0=Mo, 1=Di, ... 6=So)
  // 1970-01-01 war ein Donnerstag (=3 in Mo=0 System)
  private func weekdayFromDays(days : Int) : Nat {
    // Normalisierung: mod mit korrektem Verhalten für negative Zahlen
    let raw = days % 7; // Kann negativ sein in Motoko
    let shifted = raw + 3; // Donnerstag-Offset (1970-01-01 = Do)
    let normalized = ((shifted % 7) + 7) % 7;
    Int.abs(normalized);
  };

  // Hilfsfunktion: Tages-Soll-Stunden aus Employment für einen Wochentag (0=Mo..6=So)
  public func dailyTargetMinutes(emp : CompanyTypes.Employment, weekday : Nat) : Nat {
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

  // Hilfsfunktion: Normalisiert einen gespeicherten Timestamp auf Nanosekunden.
  // Das Frontend sendet Timestamps entweder als Unix-Sekunden (aus shared.ts dateToTimestamp),
  // Millisekunden, oder Nanosekunden:
  //   - Sekunden für Daten 1990–2100: ca. 6.3e8 .. 4.1e9  → Schwellwert < 5_000_000_000
  //   - Millisekunden für Daten 1990–2100: ca. 6.3e11 .. 4.1e12 → Schwellwert < 10_000_000_000_000
  //   - Nanosekunden: >> 1e15
  // Alle drei Formate werden korrekt erkannt und in Nanosekunden umgerechnet.
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

  // Findet die aktive Beschäftigung für einen Tag (dayNs in Nanosekunden)
  public func activeEmploymentForDay(
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

  // Berechnet den vollständigen Arbeitszeitsaldo für einen Mitarbeiter im Zeitraum
  // startDate / endDate: Text im Format "YYYY-MM-DD"
  public func getWorkTimeBalance(
    allEmployments : List.List<CompanyTypes.Employment>,
    corrections : List.List<CompanyTypes.TimeBalanceCorrection>,
    timeEntries : List.List<TrackingTypes.TimeEntry>,
    absences : List.List<TrackingTypes.Absence>,
    absenceTypes : List.List<MasterTypes.AbsenceType>,
    holidays : List.List<MasterTypes.Holiday>,
    employeeId : EmployeeId,
    companyId : CompanyId,
    startDate : Text,
    endDate : Text,
  ) : CompanyTypes.WorkTimeBalance {
    let startDays = dateToUnixDays(startDate);
    let endDays = dateToUnixDays(endDate);
    // Nanosekunden pro Tag
    let nsPerDay : Int = 86_400_000_000_000;

    // ─── 1. Feiertage im Zeitraum in einem Set ───────────────────────────────
    // Wir speichern Feiertag-Daten als Text (YYYY-MM-DD) für schnellen Vergleich
    let companyHolidays = holidays.filter(func(h) { h.companyId == companyId });

    // ─── 2. Abwesenheitstage im Zeitraum expandieren ─────────────────────────
    // Nur genehmigte (status=#approved) UND entschädigte Abwesenheiten (compensated=true)
    // zählen als Ist-Stunden. Nicht genehmigte oder nicht entschädigte werden ignoriert.
    // absenceMinutesByDay: unixDay -> null=ganztaetig (aus Beschäftigung), ?m=fix Minuten
    let absenceMinutesByDay = Map.empty<Int, ?Nat>(); // unixDay -> null=ganztaetig, ?m=fix
    absences.forEach(func(ab) {
      if (ab.employeeId != employeeId or ab.companyId != companyId) return;
      // Nur genehmigte Abwesenheiten berücksichtigen
      if (ab.status != #approved) return;
      // Abwesenheitsart prüfen: muss compensated=true ODER requiresApproval=true (Ferien) sein
      let absTypeOpt = absenceTypes.find(func(at) {
        at.id == ab.absenceTypeId and at.companyId == companyId
      });
      let isIncluded = switch (absTypeOpt) {
        case null { false };
        case (?at) { at.compensated or at.requiresApproval };
      };
      if (not isIncluded) return;
      let abFrom = dateToUnixDays(ab.dateFrom);
      let abTo = dateToUnixDays(ab.dateTo);
      if (ab.ganztaetig) {
        // Ganztätig: jeder Tag zählt aus der Beschäftigung
        var d = abFrom;
        label absLoop while (d <= abTo) {
          absenceMinutesByDay.add(d, null); // null = ganztaetig
          d += 1;
        };
      } else {
        // Manuelle Dauer: nur für den ersten Tag, oder bei Eintages-Abwesenheit
        // Bei mehrtägigen Abwesenheiten ohne ganztaetig: dauer wird auf den ersten Tag gebucht
        // (Mehrtägige Abwesenheiten sollten immer ganztaetig=true sein laut UX-Vorgabe,
        //  aber zur Sicherheit: dauer für den Starttag, restliche Tage als ganztaetig)
        absenceMinutesByDay.add(abFrom, ?ab.dauer);
        if (abFrom < abTo) {
          var d = abFrom + 1;
          label absLoop2 while (d <= abTo) {
            absenceMinutesByDay.add(d, null); // restliche Tage ganztaetig
            d += 1;
          };
        };
      };
    });

    // ─── 3. Soll-Stunden berechnen (Tag für Tag) ─────────────────────────────
    var sollStunden : Int = 0;
    var holidayIstStunden : Int = 0; // Ist-Stunden-Gutschrift durch Feiertage
    var d = startDays;
    label dayLoop while (d <= endDays) {
      // Datum als Text für Feiertagsvergleich
      // Berechnung des Datums aus Unix-Tagen (vereinfachte Umkehrung)
      let dayNs = d * nsPerDay;
      let weekday = weekdayFromDays(d);

      // Aktive Beschäftigung für diesen Tag suchen (von/bis als Nanosekunden-Timestamp)
      let empOpt = activeEmploymentForDay(allEmployments, employeeId, companyId, dayNs);
      switch (empOpt) {
        case null {}; // Keine aktive Beschäftigung → kein Soll
        case (?emp) {
          // Pensum=0 oder alle Tagesstunden=0 → kein Soll
          let allZero = emp.stundenMo == 0 and emp.stundenDi == 0 and emp.stundenMi == 0
            and emp.stundenDo == 0 and emp.stundenFr == 0 and emp.stundenSa == 0 and emp.stundenSo == 0;
          if (emp.pensum == 0.0 or allZero) {
            d += 1;
            continue dayLoop;
          };

          let baseMinutes : Int = dailyTargetMinutes(emp, weekday).toInt();

          // Feiertag an diesem Tag?
          // Datum aus d berechnen – rückwärts von Unix-Tagen
          let dateStr = unixDaysToDateText(d);
          let holidayOpt = companyHolidays.find(func(h) { h.date == dateStr });

          let targetMinutes : Int = switch (holidayOpt) {
            case null { baseMinutes };
            case (?holiday) {
              // ganztaegig=true → voller Feiertag; ganztaegig=false → halbtägig
              let holidayFactor : Float = if (holiday.ganztaegig) { 1.0 } else { 0.5 };
              switch (emp.feiertagsberechnungsart) {
                case (#exakt) {
                  // Soll = 0; Ist-Stunden-Gutschrift für den Feiertag (ganztägig oder halbtägig)
                  let credit = (baseMinutes.toFloat() * holidayFactor).toInt();
                  holidayIstStunden += credit;
                  0;
                };
                case (#exaktWochentag) {
                  // Nur wenn der Feiertag auf einen Arbeitstag fällt
                  if (baseMinutes > 0) {
                    let credit = (baseMinutes.toFloat() * holidayFactor).toInt();
                    holidayIstStunden += credit;
                    0;
                  } else { baseMinutes };
                };
                case (#prozentual) {
                  // Soll reduziert um Pensum% (und Ganztägig/Halbtägig-Faktor)
                  let reduced = baseMinutes.toFloat() * holidayFactor * (1.0 - emp.pensum / 100.0);
                  // Gutschrift: die freigestellten Stunden
                  let credit = (baseMinutes.toFloat() * holidayFactor * emp.pensum / 100.0).toInt();
                  holidayIstStunden += credit;
                  reduced.toInt();
                };
                case (#entschaedigt) {
                  // Feiertag bezahlt, Soll unverändert – aber Ist-Stunden werden gutgeschrieben
                  let credit = (baseMinutes.toFloat() * holidayFactor).toInt();
                  holidayIstStunden += credit;
                  baseMinutes;
                };
              };
            };
          };
          sollStunden += targetMinutes;
        };
      };
      d += 1;
    };

    // ─── 4. Ist-Stunden: Zeiteinträge ────────────────────────────────────────
    var istStunden : Int = 0;
    // Feiertags-Gutschrift zu den Ist-Stunden addieren
    istStunden += holidayIstStunden;
    timeEntries.forEach(func(te) {
      if (te.employeeId == employeeId and te.companyId == companyId
          and te.date >= startDate and te.date <= endDate) {
        // hours ist Float (Stunden), umrechnen in Minuten
        istStunden += (te.hours * 60.0).toInt();
      };
    });

    // ─── 5. Ist-Stunden: Abwesenheiten / Ferien ──────────────────────────────
    // Für jeden Abwesenheitstag im Zeitraum: Ist-Stunden addieren
    // - ganztaetig (null): Tages-Soll der aktiven Beschäftigung
    // - fix (?m): gespeicherte Minuten direkt verwenden
    var abD = startDays;
    label abLoop while (abD <= endDays) {
      switch (absenceMinutesByDay.get(abD)) {
        case null {};
        case (?minutesOpt) {
          switch (minutesOpt) {
            case (?fixMinutes) {
              // Manuelle Dauer direkt addieren
              istStunden += fixMinutes.toInt();
            };
            case null {
              // Ganztätig: Tages-Soll aus aktiver Beschäftigung
              let dayNs2 = abD * nsPerDay;
              let weekday2 = weekdayFromDays(abD);
              let empOpt2 = activeEmploymentForDay(allEmployments, employeeId, companyId, dayNs2);
              switch (empOpt2) {
                case null {};
                case (?emp2) {
                  istStunden += dailyTargetMinutes(emp2, weekday2).toInt();
                };
              };
            };
          };
        };
      };
      abD += 1;
    };

    // ─── 6. Korrektionen ─────────────────────────────────────────────────────
    var korrektionen : Int = 0;
    var ueberzeit : Int = 0;
    corrections.forEach(func(c) {
      if (c.employeeId == employeeId and c.companyId == companyId) {
        let corrDate = wirkungsdatumToDateText(c.wirkungsdatum);
        if (corrDate >= startDate and corrDate <= endDate) {
          switch (c.typ) {
            case (#gutschrift) { korrektionen += c.dauer };
            case (#reduktion) { korrektionen -= c.dauer };
          };
          ueberzeit += c.ueberzeit;
        };
      };
    });

    let saldo = istStunden - sollStunden + korrektionen;
    { sollStunden; istStunden; saldo; korrektionen; ueberzeit; periodStart = startDate; periodEnd = endDate };
  };

  // Hilfsfunktion: Unix-Tage (Int) → Datum-Text "YYYY-MM-DD"
  // Algorithmus: chrono-kompatible Umkehrung
  private func unixDaysToDateText(days : Int) : Text {
    // Gregorianischer Kalender: Algorithmus von Howard Hinnant
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

  // Hilfsfunktion: Nanosekunden-Timestamp → Datum-Text "YYYY-MM-DD"
  private func wirkungsdatumToDateText(nsTimestamp : Int) : Text {
    let nsPerDay : Int = 86_400_000_000_000;
    let days = nsTimestamp / nsPerDay;
    unixDaysToDateText(days);
  };

  // Hilfsfunktion: Int mit führenden Nullen formatieren
  private func padInt(n : Int, width : Nat) : Text {
    let absN = Int.abs(n);
    let s = absN.toText();
    let len = s.size();
    if (len >= width) { s }
    else {
      var pad = "";
      var i = 0;
      let needed : Int = width - len;
      while (i < needed) {
        pad #= "0";
        i += 1;
      };
      pad # s;
    };
  };

  // Berechnet Saldo ab dem frühesten Beschäftigungsdatum bis heute
  public func getWorkTimeBalanceFromStart(
    allEmployments : List.List<CompanyTypes.Employment>,
    corrections : List.List<CompanyTypes.TimeBalanceCorrection>,
    timeEntries : List.List<TrackingTypes.TimeEntry>,
    absences : List.List<TrackingTypes.Absence>,
    absenceTypes : List.List<MasterTypes.AbsenceType>,
    holidays : List.List<MasterTypes.Holiday>,
    employeeId : EmployeeId,
    companyId : CompanyId,
  ) : { #ok : CompanyTypes.WorkTimeBalance; #err : Text } {
    // Früheste Beschäftigung des Mitarbeiters finden
    let empList = allEmployments.filter(func(em) {
      em.employeeId == employeeId and em.companyId == companyId
    }).toArray();
    let nsPerDay : Int = 86_400_000_000_000;
    let todayDays = Time.now() / nsPerDay;
    if (empList.size() == 0) {
      // Keine Beschäftigung → Saldo = 0:00
      let todayText = unixDaysToDateText(todayDays);
      return #ok({
        sollStunden = 0; istStunden = 0; saldo = 0; korrektionen = 0;
        ueberzeit = 0; periodStart = todayText; periodEnd = todayText;
      });
    };
    // Frühestes von-Datum finden: Initialisierung mit dem ersten Eintrag, dann Minimum suchen
    var earliestNs : Int = normalizeToNs(empList[0].von);
    for (em in empList.values()) {
      let vonNs = normalizeToNs(em.von);
      if (vonNs < earliestNs) { earliestNs := vonNs };
    };
    let startDays = earliestNs / nsPerDay;
    // Sicherheitscheck: Startdatum muss zwischen 1990-01-01 und 2100-01-01 liegen.
    // 1990-01-01 = Unix-Tag 7305; 2100-01-01 = Unix-Tag 47483
    // Tage ausserhalb dieses Bereichs sind ungültig / nicht initialisiert.
    let minValidDay : Int = 7305; // 1990-01-01
    let maxValidDay : Int = 47483; // 2100-01-01
    let safeDays = if (startDays < minValidDay or startDays > maxValidDay) {
      // Ungültiges / nicht initialisiertes Startdatum → Startdatum = heute (0 Soll)
      todayDays;
    } else {
      startDays;
    };
    let startDate = unixDaysToDateText(safeDays);
    // Ende der aktuellen Woche: Sonntag (weekday=6 in Mo=0 System)
    // weekdayFromDays gibt 0=Mo .. 6=So zurück
    let todayWeekday : Int = weekdayFromDays(todayDays).toInt();
    // Tage bis Sonntag: (6 - weekday), 0 wenn heute bereits Sonntag
    let daysToSunday : Int = (6 - todayWeekday + 7) % 7;
    let endDays = todayDays + daysToSunday;
    let endDate = unixDaysToDateText(endDays);
    #ok(getWorkTimeBalance(
      allEmployments,
      corrections,
      timeEntries,
      absences,
      absenceTypes,
      holidays,
      employeeId,
      companyId,
      startDate,
      endDate,
    ));
  };
};
