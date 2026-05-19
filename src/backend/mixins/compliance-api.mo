// HR & Compliance API – Öffentliche Canister-Schnittstelle für Punkt 20 (Stufe 1)
import Map "mo:core/Map";
import List "mo:core/List";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import AccessControl "mo:caffeineai-authorization/access-control";
import CommonTypes "../types/common";
import CompanyTypes "../types/company";
import TrackingTypes "../types/timetracking";
import ComplianceTypes "../types/compliance";
import ComplianceLib "../lib/compliance";
import VacationLedgerLib "../lib/vacation-ledger";
import AccessControlLib "../lib/AccessControlLib";
import Text "mo:core/Text";
import Iter "mo:core/Iter";

mixin (
  accessControlState : AccessControl.AccessControlState,
  companies : List.List<CompanyTypes.Company>,
  employees : List.List<CompanyTypes.Employee>,
  principalToCompany : Map.Map<Principal, CommonTypes.CompanyId>,
  principalToEmployee : Map.Map<Principal, CommonTypes.EmployeeId>,
  complianceProfiles : List.List<ComplianceTypes.EmployeeComplianceProfile>,
  complianceFindings : List.List<ComplianceTypes.ComplianceFinding>,
  vacationLedgers : List.List<ComplianceTypes.VacationLedger>,
  nextComplianceProfileId : { var value : Nat },
  nextComplianceFindingId : { var value : Nat },
  nextVacationLedgerId : { var value : Nat },
  timeEntries : List.List<TrackingTypes.TimeEntry>,
  absences : List.List<TrackingTypes.Absence>,
  pauseOverrides : List.List<ComplianceTypes.PauseOverride>,
) {

  // ─── Hilfsfunktionen ──────────────────────────────────────────────────────────

  private func requireCompanyId_(caller : Principal) : CommonTypes.CompanyId {
    switch (principalToCompany.get(caller)) {
      case null { Runtime.trap("Nicht authentifiziert") };
      case (?cid) cid;
    };
  };

  private func requireEmployeeId_(caller : Principal) : CommonTypes.EmployeeId {
    switch (principalToEmployee.get(caller)) {
      case null { Runtime.trap("Kein Mitarbeiterprofil gefunden") };
      case (?eid) eid;
    };
  };

  private func isAdminOrManager_(caller : Principal, companyId : CommonTypes.CompanyId) : Bool {
    switch (principalToEmployee.get(caller)) {
      case null { false };
      case (?empId) {
        switch (employees.find(func(e : CompanyTypes.Employee) : Bool { e.id == empId and e.companyId == companyId })) {
          case null { false };
          case (?emp) { emp.role == #admin or emp.role == #manager };
        };
      };
    };
  };

  private func requireAdminOrManager_(caller : Principal, companyId : CommonTypes.CompanyId) : () {
    if (not isAdminOrManager_(caller, companyId)) {
      Runtime.trap("Zugriff verweigert: Nur Admin oder Manager erlaubt");
    };
  };

  // ─── EmployeeComplianceProfile CRUD ───────────────────────────────────────────

  // Gibt das eigene Compliance-Profil zurück
  public shared query ({ caller }) func getMyComplianceProfile() : async ?ComplianceTypes.EmployeeComplianceProfile {
    let companyId = requireCompanyId_(caller);
    let empId = requireEmployeeId_(caller);
    complianceProfiles.find(func(p : ComplianceTypes.EmployeeComplianceProfile) : Bool {
      p.employeeId == empId and p.companyId == companyId
    });
  };

  // Gibt das Compliance-Profil eines Mitarbeiters zurück (nur Admin/Manager)
  public shared query ({ caller }) func getComplianceProfile(employeeId : Nat) : async ?ComplianceTypes.EmployeeComplianceProfile {
    let companyId = requireCompanyId_(caller);
    requireAdminOrManager_(caller, companyId);
    complianceProfiles.find(func(p : ComplianceTypes.EmployeeComplianceProfile) : Bool {
      p.employeeId == employeeId and p.companyId == companyId
    });
  };

  // Aktualisiert ein Compliance-Profil (nur Admin)
  public shared ({ caller }) func updateComplianceProfile(
    input : ComplianceTypes.UpdateComplianceProfileInput
  ) : async { #ok : ComplianceTypes.EmployeeComplianceProfile; #err : Text } {
    let companyId = requireCompanyId_(caller);
    // Nur Admins dürfen Profile aktualisieren
    switch (principalToEmployee.get(caller)) {
      case null { return #err("Kein Mitarbeiterprofil") };
      case (?empId) {
        switch (employees.find(func(e : CompanyTypes.Employee) : Bool { e.id == empId and e.companyId == companyId })) {
          case null { return #err("Mitarbeiter nicht gefunden") };
          case (?emp) {
            if (emp.role != #admin) return #err("Nur Admins dürfen Compliance-Profile bearbeiten");
          };
        };
      };
    };

    var result : ?ComplianceTypes.EmployeeComplianceProfile = null;
    complianceProfiles.mapInPlace(func(p : ComplianceTypes.EmployeeComplianceProfile) : ComplianceTypes.EmployeeComplianceProfile {
      if (p.id == input.id and p.companyId == companyId) {
        let updated : ComplianceTypes.EmployeeComplianceProfile = {
          p with
          aktiv = input.aktiv;
          vertraglicheWochenstunden = input.vertraglicheWochenstunden;
          gesetzlicheWochenhochstarbeitszeit = input.gesetzlicheWochenhochstarbeitszeit;
          gesetzlicherFerienanspruchWochen = input.gesetzlicherFerienanspruchWochen;
          vertraglicheZusatzferienTage = input.vertraglicheZusatzferienTage;
          ausnahmeprofil = input.ausnahmeprofil;
          erfassungsModus = input.erfassungsModus;
          updatedAt = Time.now();
        };
        result := ?updated;
        updated;
      } else { p };
    });
    switch (result) {
      case null { #err("Compliance-Profil nicht gefunden") };
      case (?p) { #ok(p) };
    };
  };

  // ─── ComplianceFinding queries ─────────────────────────────────────────────────

  // Gibt Findings für einen Mitarbeiter zurück (Admin/Manager)
  public shared query ({ caller }) func getComplianceFindings(
    employeeId : Nat,
    periodeTyp : ?ComplianceTypes.CompliancePeriodeTyp,
    status : ?[ComplianceTypes.ComplianceStatus],
  ) : async [ComplianceTypes.ComplianceFinding] {
    let companyId = requireCompanyId_(caller);
    requireAdminOrManager_(caller, companyId);
    complianceFindings.filter(func(f : ComplianceTypes.ComplianceFinding) : Bool {
      if (f.employeeId != employeeId or f.companyId != companyId) return false;
      let periodOk = switch (periodeTyp) {
        case null { true };
        case (?pt) { f.periodeTyp == pt };
      };
      let statusOk = switch (status) {
        case null { true };
        case (?statuses) {
          statuses.any(func(s) : Bool { s == f.status });
        };
      };
      periodOk and statusOk;
    }).toArray();
  };

  // Gibt die eigenen Compliance-Findings zurück
  public shared query ({ caller }) func getMyComplianceFindings(
    periodeTyp : ?ComplianceTypes.CompliancePeriodeTyp,
  ) : async [ComplianceTypes.ComplianceFinding] {
    let companyId = requireCompanyId_(caller);
    let empId = requireEmployeeId_(caller);
    complianceFindings.filter(func(f : ComplianceTypes.ComplianceFinding) : Bool {
      if (f.employeeId != empId or f.companyId != companyId) return false;
      switch (periodeTyp) {
        case null { true };
        case (?pt) { f.periodeTyp == pt };
      };
    }).toArray();
  };

  // Löst ein Finding auf (Freigabe trotz Verstoss)
  public shared ({ caller }) func resolveFinding(
    input : ComplianceTypes.ResolveFindingInput
  ) : async { #ok : ComplianceTypes.ComplianceFinding; #err : Text } {
    let companyId = requireCompanyId_(caller);
    requireAdminOrManager_(caller, companyId);
    let resolverEmpId = requireEmployeeId_(caller);
    let now = Time.now();

    var result : ?ComplianceTypes.ComplianceFinding = null;
    complianceFindings.mapInPlace(func(f : ComplianceTypes.ComplianceFinding) : ComplianceTypes.ComplianceFinding {
      if (f.id == input.findingId and f.companyId == companyId) {
        let updated : ComplianceTypes.ComplianceFinding = {
          f with
          status = #FREIGEGEBEN;
          resolvedAt = ?now;
          resolvedBy = ?resolverEmpId;
          resolutionType = ?input.resolutionType;
          resolutionReason = ?input.resolutionReason;
        };
        result := ?updated;
        updated;
      } else { f };
    });
    switch (result) {
      case null { #err("Finding nicht gefunden") };
      case (?f) { #ok(f) };
    };
  };

  // ─── VacationLedger queries ────────────────────────────────────────────────────

  // Gibt den VacationLedger für einen Mitarbeiter/Kalenderjahr zurück (Admin/Manager)
  // calendarYearKey: 4-stelliges Jahr "2024", "2025" etc.
  public shared query ({ caller }) func getVacationLedger(
    employeeId : Nat,
    serviceYearKey : Text,
  ) : async ?ComplianceTypes.VacationLedger {
    let companyId = requireCompanyId_(caller);
    requireAdminOrManager_(caller, companyId);
    // Normalisieren: "YYYY-YYYY" → erste 4 Stellen; YYYY_MM_DD → erste 4 Stellen
    let normalizedKey : Text = normalizeYearKey_(serviceYearKey);
    VacationLedgerLib.getVacationLedger(vacationLedgers, employeeId, companyId, normalizedKey);
  };

  // Gibt den eigenen VacationLedger zurück
  public shared query ({ caller }) func getMyVacationLedger(
    serviceYearKey : Text,
  ) : async ?ComplianceTypes.VacationLedger {
    let companyId = requireCompanyId_(caller);
    let empId = requireEmployeeId_(caller);
    let normalizedKey : Text = normalizeYearKey_(serviceYearKey);
    VacationLedgerLib.getVacationLedger(vacationLedgers, empId, companyId, normalizedKey);
  };

  // Hilfsfunktion: Verschiedene Key-Formate auf 4-stelliges Jahr normalisieren
  // "2024" → "2024", "2024-2025" → "2024", "2024_03_15" → "2024"
  private func normalizeYearKey_(key : Text) : Text {
    if (key.size() == 4) {
      key // Bereits 4-stellig
    } else {
      // Ersten 4 Zeichen extrahieren (Jahr)
      let chars = key.chars().take(4);
      Text.fromIter(chars);
    };
  };

  // ─── Compliance Cockpit ────────────────────────────────────────────────────────

  // Gibt die KPIs für das Compliance Cockpit zurück
  public shared query ({ caller }) func getComplianceCockpitKPI(
    companyId : Nat,
  ) : async ComplianceTypes.ComplianceCockpitKPI {
    let callerCompanyId = requireCompanyId_(caller);
    if (callerCompanyId != companyId) Runtime.trap("Zugriff verweigert");
    requireAdminOrManager_(caller, companyId);

    // Mitarbeiter der Firma
    let companyEmployees = employees.filter(func(e : CompanyTypes.Employee) : Bool {
      e.companyId == companyId and e.active
    }).toArray();

    // Offene Verstösse pro Mitarbeiter
    var mitarbeiterMitVerstoessen : Nat = 0;
    var ruhezeitVerstoesse : Nat = 0;
    var mitarbeiterMitGesetzlicherUeberzeit : Nat = 0;
    var ferienRisiken : Nat = 0;

    for (emp in companyEmployees.values()) {
      let empFindings = complianceFindings.filter(func(f : ComplianceTypes.ComplianceFinding) : Bool {
        f.employeeId == emp.id and f.companyId == companyId
          and (f.status == #BREACH or f.status == #CRITICAL or f.status == #WARNING)
          and f.resolvedAt == null;
      }).toArray();

      if (empFindings.size() > 0) {
        mitarbeiterMitVerstoessen += 1;
      };

      // Ruhezeit-Verstösse
      let rtViolations = empFindings.filter(func(f) : Bool {
        f.ruleCode == "REST_TIME" and f.resolvedAt == null;
      });
      ruhezeitVerstoesse += rtViolations.size();

      // Gesetzliche Überzeit
      let legalOT = empFindings.any(func(f) : Bool {
        f.ruleCode == "OVERTIME_LEGAL" and f.resolvedAt == null;
      });
      if (legalOT) mitarbeiterMitGesetzlicherUeberzeit += 1;

      // Ferienrisiken: VacationLedger prüfen
      let ledger = vacationLedgers.find(func(l : ComplianceTypes.VacationLedger) : Bool {
        l.employeeId == emp.id and l.companyId == companyId
      });
      switch (ledger) {
        case null {};
        case (?l) {
          if (l.verbleibendeFerientage < 0.0 or not l.twoWeekBlockSatisfied) {
            ferienRisiken += 1;
          };
        };
      };
    };

    // Pausenverstösse: Mitarbeiter mit mind. einem offenen PAUSE_MINIMUM-Finding
    var pausenVerstoesse : Nat = 0;
    for (emp in companyEmployees.values()) {
      let hasPauseViolation = complianceFindings.any(func(f : ComplianceTypes.ComplianceFinding) : Bool {
        f.employeeId == emp.id and f.companyId == companyId
          and f.ruleCode == "PAUSE_MINIMUM"
          and f.resolvedAt == null
          and (f.status == #BREACH or f.status == #CRITICAL or f.status == #WARNING);
      });
      if (hasPauseViolation) pausenVerstoesse += 1;
    };

    {
      mitarbeiterMitVerstoessen;
      ruhezeitVerstoesse;
      mitarbeiterMitGesetzlicherUeberzeit;
      ferienRisiken;
      pausenVerstoesse;
    };
  };

  // Gibt die Cockpit-Zeilen für alle Mitarbeiter zurück
  public shared query ({ caller }) func getComplianceCockpitRows(
    companyId : Nat,
  ) : async [ComplianceTypes.ComplianceCockpitRow] {
    let callerCompanyId = requireCompanyId_(caller);
    if (callerCompanyId != companyId) Runtime.trap("Zugriff verweigert");
    requireAdminOrManager_(caller, companyId);

    let companyEmployees = employees.filter(func(e : CompanyTypes.Employee) : Bool {
      e.companyId == companyId and e.active
    }).toArray();

    companyEmployees.map<CompanyTypes.Employee, ComplianceTypes.ComplianceCockpitRow>(
      func(emp) {
        let empFindings = complianceFindings.filter(func(f : ComplianceTypes.ComplianceFinding) : Bool {
          f.employeeId == emp.id and f.companyId == companyId and f.resolvedAt == null;
        }).toArray();

        // Überstunden aggregieren
        var vertraglicheUeberstundenH = 0.0;
        var gesetzlicheUeberzeitH = 0.0;
        var ruhezeitVerstoesse = 0;
        var pausenVerstoesse = 0;

        for (f in empFindings.values()) {
          if (f.ruleCode == "OVERTIME_CONTRACTUAL") {
            vertraglicheUeberstundenH += f.istWert;
          };
          if (f.ruleCode == "OVERTIME_LEGAL") {
            gesetzlicheUeberzeitH += f.istWert;
          };
          if (f.ruleCode == "REST_TIME") {
            ruhezeitVerstoesse += 1;
          };
          if (f.ruleCode == "PAUSE_MINIMUM") {
            pausenVerstoesse += 1;
          };
        };

        // Ferienstatus aus VacationLedger
        let ferienstatus = switch (vacationLedgers.find(func(l : ComplianceTypes.VacationLedger) : Bool {
          l.employeeId == emp.id and l.companyId == companyId
        })) {
          case null { "Kein Ledger" };
          case (?l) {
            if (l.verbleibendeFerientage < 0.0) { "Verstoss" }
            else if (not l.twoWeekBlockSatisfied) { "Risiko" }
            else { "OK" };
          };
        };

        // Gesamtstatus: schlechtester Status aller Findings
        let hasCritical = empFindings.any(func(f) : Bool { f.status == #CRITICAL });
        let hasBreach = empFindings.any(func(f) : Bool { f.status == #BREACH });
        let hasWarning = empFindings.any(func(f) : Bool { f.status == #WARNING });
        let gesamtstatus : ComplianceTypes.ComplianceStatus = if (hasCritical) { #CRITICAL }
          else if (hasBreach) { #BREACH }
          else if (hasWarning) { #WARNING }
          else { #COMPLIANT };

        {
          employee = { id = emp.id; firstName = emp.firstName; lastName = emp.lastName };
          gesamtstatus;
          vertraglicheUeberstundenH;
          gesetzlicheUeberzeitH;
          ruhezeitVerstoesse;
          pausenVerstoesse;
          ferienstatus;
          offeneMassnahmen = empFindings.size();
        };
      }
    );
  };

  // ─── Weekly compliance check (Admin/Manager trigger) ──────────────────────────

  // Führt den wöchentlichen Compliance-Check für alle Mitarbeiter einer Firma durch.
  // Gibt die Anzahl der generierten Findings zurück.
  public shared ({ caller }) func runWeeklyComplianceCheck(
    companyId : Nat,
  ) : async { #ok : Nat; #err : Text } {
    let callerCompanyId = requireCompanyId_(caller);
    if (callerCompanyId != companyId) return #err("Zugriff verweigert");
    requireAdminOrManager_(caller, companyId);

    let companyEmployees = employees.filter(func(e : CompanyTypes.Employee) : Bool {
      e.companyId == companyId and e.active
    }).toArray();

    var findingsCount = 0;

    // Aktuelle Woche berechnen (Montag bis Sonntag)
    let nsPerDay : Int = 86_400_000_000_000;
    let todayDays = Time.now() / nsPerDay;
    // Wochentag: 0=Mo..6=So; 1970-01-01 war Donnerstag (=3)
    let raw = todayDays % 7;
    let shifted = raw + 3;
    let weekday = ((shifted % 7) + 7) % 7;
    let mondayDays = todayDays - weekday;
    let weekStart = ComplianceLib.unixDaysToDate(mondayDays);
    let weekEnd = ComplianceLib.unixDaysToDate(mondayDays + 6);

    for (emp in companyEmployees.values()) {
      // Compliance-Profil des Mitarbeiters suchen; falls keines vorhanden, Default erstellen
      let profileOpt = complianceProfiles.find(func(p : ComplianceTypes.EmployeeComplianceProfile) : Bool {
        p.employeeId == emp.id and p.companyId == companyId
      });
      // Profil auflösen: existierendes verwenden oder neues mit Defaults anlegen
      let profile : ComplianceTypes.EmployeeComplianceProfile = switch (profileOpt) {
        case (?p) { p };
        case null {
          // Automatisch ein aktives Default-Profil erstellen
          let now = Time.now();
          let newId = nextComplianceProfileId.value;
          nextComplianceProfileId.value += 1;
          let newProfile : ComplianceTypes.EmployeeComplianceProfile = {
            id = newId;
            employeeId = emp.id;
            companyId;
            aktiv = true;
            vertraglicheWochenstunden = 42.0;
            gesetzlicheWochenhochstarbeitszeit = 45.0;
            gesetzlicherFerienanspruchWochen = 4.0;
            vertraglicheZusatzferienTage = 0.0;
            ausnahmeprofil = null;
            erfassungsModus = "VOLLSTAENDIG";
            createdAt = now;
            updatedAt = now;
          };
          complianceProfiles.add(newProfile);
          newProfile;
        };
      };

      // Nur aktive Profile verarbeiten
      if (profile.aktiv) {
        let allEmpEntries = timeEntries.filter(func(te : TrackingTypes.TimeEntry) : Bool {
          te.employeeId == emp.id and te.companyId == companyId;
        }).toArray();

        let empPauseOverrides = pauseOverrides.filter(func(ov : ComplianceTypes.PauseOverride) : Bool {
          ov.userId == emp.id and ov.companyId == companyId;
        }).toArray();

        let newFindings = ComplianceLib.runWeeklyCheckForEmployee(
          emp.id, companyId, weekStart, weekEnd,
          allEmpEntries, profile, nextComplianceFindingId,
          empPauseOverrides
        );

        for (finding in newFindings.values()) {
          complianceFindings.add(finding);
          findingsCount += 1;
        };

        // VacationLedger aktualisieren (auch bei fehlendem Ledger wird ein neuer erstellt)
        let empAbsences = absences.filter(func(ab : TrackingTypes.Absence) : Bool {
          ab.employeeId == emp.id and ab.companyId == companyId;
        }).toArray();
        if (emp.startDate != "") {
          VacationLedgerLib.updateOnAbsenceChange(
            vacationLedgers, nextVacationLedgerId,
            emp.id, companyId, emp.startDate, emp.geburtsdatum,
            profile.vertraglicheZusatzferienTage, empAbsences, 10
          );
        };
      };
    };

    #ok(findingsCount);
  };

  // ─── Auto-Initialisierung Compliance-Profil ────────────────────────────────────

  // Erstellt ein Standard-Compliance-Profil für einen neuen Mitarbeiter (interne Hilfsfunktion)
  // aktiv = true: sofort aktiv, damit der wöchentliche Check greift.
  func initComplianceProfileForEmployee(
    employeeId : Nat,
    companyId : Nat,
  ) : ComplianceTypes.EmployeeComplianceProfile {
    let now = Time.now();
    let id = nextComplianceProfileId.value;
    nextComplianceProfileId.value += 1;
    let profile : ComplianceTypes.EmployeeComplianceProfile = {
      id;
      employeeId;
      companyId;
      aktiv = true;                          // Sofort aktiv; Admin kann deaktivieren
      vertraglicheWochenstunden = 42.0;      // Schweizer Standard
      gesetzlicheWochenhochstarbeitszeit = 45.0;
      gesetzlicherFerienanspruchWochen = 4.0;
      vertraglicheZusatzferienTage = 0.0;
      ausnahmeprofil = null;
      erfassungsModus = "VOLLSTAENDIG";
      createdAt = now;
      updatedAt = now;
    };
    complianceProfiles.add(profile);
    profile;
  };

  // ─── VacationLedger für alle aktiven Mitarbeiter initialisieren ───────────────

  // Erstellt oder aktualisiert VacationLedger (kalenderjährlich) für alle aktiven Mitarbeiter
  // mit gültigem Eintrittsdatum. Prüft auch Ferienminimum-Verstösse.
  public shared ({ caller }) func initAllVacationLedgers(
    companyId : Nat,
  ) : async { #ok : Nat; #err : Text } {
    let callerCompanyId = requireCompanyId_(caller);
    if (callerCompanyId != companyId) return #err("Zugriff verweigert");
    requireAdminOrManager_(caller, companyId);

    let companyEmployees = employees.filter(func(e : CompanyTypes.Employee) : Bool {
      e.companyId == companyId and e.active
    }).toArray();

    var count = 0;
    let todayStr = ComplianceLib.today();
    let todayParts = todayStr.split(#char '-').toArray();
    let todayYearStr = if (todayParts.size() > 0) { todayParts[0] } else { "2024" };

    for (emp in companyEmployees.values()) {
      if (emp.startDate != "") {
        let empAbsences = absences.filter(func(ab : TrackingTypes.Absence) : Bool {
          ab.employeeId == emp.id and ab.companyId == companyId;
        }).toArray();
        // Profil laden für vertraglicheZusatzferienTage
        let profileOpt = complianceProfiles.find(func(p : ComplianceTypes.EmployeeComplianceProfile) : Bool {
          p.employeeId == emp.id and p.companyId == companyId
        });
        let zusatzTage = switch (profileOpt) {
          case null { 0.0 };
          case (?p) { p.vertraglicheZusatzferienTage };
        };

        // Alle Kalenderjahre ab Eintrittsjahr bis heute anlegen/aktualisieren
        let years = ComplianceLib.getAllCalendarYears(emp.startDate, null, todayStr);
        for (year in years.values()) {
          let key = year.toText();
          let ledger = VacationLedgerLib.upsertCalendarYearLedger(
            vacationLedgers, nextVacationLedgerId,
            emp.id, companyId, key,
            emp.startDate, null, emp.geburtsdatum, zusatzTage,
            empAbsences, 10
          );

          // Ferienminimum-Compliance prüfen: gesetzlicher Anspruch > VacationBalance des Mandanten?
          // Nur für das aktuelle Jahr relevant
          if (key == todayYearStr) {
            // Gesetzlichen Anspruch mit dem tatsächlich konfigurierten Anspruch vergleichen
            // (VacationBalance im VacationLedger = gesetzlicheFerientage + zusatzTage)
            let gesamtAnspruch = ledger.gesetzlicheFerientage + zusatzTage;
            // Prüfen ob ein bestehendes VACATION_MINIMUM-Finding für dieses Jahr schon existiert
            let existingFinding = complianceFindings.any(func(f : ComplianceTypes.ComplianceFinding) : Bool {
              f.employeeId == emp.id and f.companyId == companyId
                and f.ruleCode == "VACATION_MINIMUM"
                and f.periodeKey == key
                and f.resolvedAt == null
            });
            // Warnung erzeugen wenn gesetzlicher Anspruch > vertraglich konfigurierte Zusatztage
            // (d.h. wenn kein Zusatzanspruch vorhanden, aber Mitarbeiter U20 -> gesetzl. = 25 > 20 Standard)
            if (not existingFinding and ledger.gesetzlicheFerientage > 20.0 and zusatzTage < (ledger.gesetzlicheFerientage - 20.0)) {
              let findingId = nextComplianceFindingId.value;
              nextComplianceFindingId.value += 1;
              let finding = ComplianceLib.makeFinding(
                findingId, emp.id, companyId,
                #SERVICE_YEAR, key,
                "VACATION_MINIMUM",
                #WARNING,
                20.0 + zusatzTage,         // IST: konfigurieter Anspruch
                ledger.gesetzlicheFerientage, // SOLL: gesetzlicher Anspruch
                "Tage",
                "Gesetzliches Ferienminimum nicht eingehalten: Mindestens " #
                  ComplianceLib.floatToText(ledger.gesetzlicheFerientage, 1) #
                  " Tage erforderlich (U20-Regel), aber nur " #
                  ComplianceLib.floatToText(20.0 + zusatzTage, 1) #
                  " Tage konfiguriert.",
                ?"OR Art. 329a",
                [],
              );
              complianceFindings.add(finding);
            };
          };
        };
        count += 1;
      };
    };
    #ok(count);
  };

  public shared query ({ caller }) func getVacationLedgerAll(
    employeeId : Nat,
  ) : async [ComplianceTypes.VacationLedger] {
    let companyId = requireCompanyId_(caller);
    requireAdminOrManager_(caller, companyId);
    let all = vacationLedgers.toArray();
    all.filter<ComplianceTypes.VacationLedger>(func(l) {
      l.employeeId == employeeId and l.companyId == companyId
    });
  };

  public shared query ({ caller }) func getServiceYears(
    employeeId : Nat,
  ) : async [Text] {
    let companyId = requireCompanyId_(caller);
    requireAdminOrManager_(caller, companyId);
    let all = vacationLedgers.toArray();
    let filtered = all.filter(func(l) {
      l.employeeId == employeeId and l.companyId == companyId
    });
    // Bevorzugt calendarYearKey zurückgeben
    filtered.map<ComplianceTypes.VacationLedger, Text>(func(l) { l.calendarYearKey });
  };

};
