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
import AuditTypes "../types/audit";
import Int "mo:core/Int";
import Debug "mo:core/Debug";

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
  tenantComplianceRules : Map.Map<Text, ComplianceTypes.TenantComplianceRule>,
  auditLogEntriesV6 : List.List<AuditTypes.AuditLogEntry>,
  nextAuditLogId : { var value : Nat },
  employmentsV2 : List.List<CompanyTypes.Employment>,
  vacationBalances : List.List<CompanyTypes.VacationBalance>,
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
  // Gibt die vertraglichen Wochenstunden aus der zum Datum gültigen Beschäftigung zurück (read-only)
  // Nur Admin/Manager oder der betroffene Mitarbeiter selbst darf dies abfragen.
  public shared query ({ caller }) func getContractualHoursForEmployee(employeeId : Nat, dateISO : Text) : async ?Float {
    let companyId = requireCompanyId_(caller);
    // Zugriff: Admin/Manager oder der betroffene Mitarbeiter selbst
    let callerIsEmployee = switch (principalToEmployee.get(caller)) {
      case null { false };
      case (?eid) { eid == employeeId };
    };
    if (not callerIsEmployee and not isAdminOrManager_(caller, companyId)) {
      Runtime.trap("Zugriff verweigert");
    };
    // Alle Beschäftigungen des Mitarbeiters für diese Firma sammeln
    let empEmployments = employmentsV2.filter(func(e : CompanyTypes.Employment) : Bool {
      e.employeeId == employeeId and e.companyId == companyId
    }).toArray();
    ComplianceLib.getContractualHoursForDate(employeeId, dateISO, empEmployments);
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

    // Look up existing profile by employeeId (correct lookup key)
    var existingProfile : ?ComplianceTypes.EmployeeComplianceProfile = null;
    for (p in complianceProfiles.values()) {
      if (p.employeeId == input.employeeId and p.companyId == companyId) {
        existingProfile := ?p;
      };
    };

    switch (existingProfile) {
      case (?existing) {
        // UPDATE existing profile (vertraglicheWochenstunden is derived from employment, not stored)
        let updated : ComplianceTypes.EmployeeComplianceProfile = {
          existing with
          aktiv = input.aktiv;
          gesetzlicheWochenhochstarbeitszeit = input.gesetzlicheWochenhochstarbeitszeit;
          gesetzlicherFerienanspruchWochen = input.gesetzlicherFerienanspruchWochen;
          vertraglicheZusatzferienTage = input.vertraglicheZusatzferienTage;
          ausnahmeprofil = input.ausnahmeprofil;
          erfassungsModus = input.erfassungsModus;
          updatedAt = Time.now();
        };
        complianceProfiles.mapInPlace(func(p : ComplianceTypes.EmployeeComplianceProfile) : ComplianceTypes.EmployeeComplianceProfile {
          if (p.id == existing.id and p.companyId == companyId) { updated } else { p }
        });
        #ok(updated);
      };
      case null {
        // CREATE new profile; use input.employeeId as the employee lookup key
        let now = Time.now();
        let newId = nextComplianceProfileId.value;
        nextComplianceProfileId.value += 1;
        let newProfile : ComplianceTypes.EmployeeComplianceProfile = {
          id = newId;
          employeeId = input.employeeId;
          companyId = companyId;
          aktiv = input.aktiv;
          gesetzlicheWochenhochstarbeitszeit = input.gesetzlicheWochenhochstarbeitszeit;
          gesetzlicherFerienanspruchWochen = input.gesetzlicherFerienanspruchWochen;
          vertraglicheZusatzferienTage = input.vertraglicheZusatzferienTage;
          ausnahmeprofil = input.ausnahmeprofil;
          erfassungsModus = input.erfassungsModus;
          createdAt = now;
          updatedAt = now;
        };
        complianceProfiles.add(newProfile);
        #ok(newProfile);
      };
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
    let normalizedKey : Text = normalizeYearKey_(serviceYearKey);
    switch (VacationLedgerLib.getVacationLedger(vacationLedgers, employeeId, companyId, normalizedKey)) {
      case null null;
      case (?existing) {
        let yearInt : Int = switch (Int.fromText(normalizedKey)) { case (?y) y; case null 0 };
        var liveZusatzTage : Float = 0.0;
        var found = false;
        for (vb in vacationBalances.values()) {
          if (vb.employeeId == employeeId and vb.companyId == companyId and vb.kalenderjahr == yearInt) {
            liveZusatzTage := vb.dauer.toFloat() / 100.0;
            found := true;
          };
        };
        if (found) {
          ?{ existing with
            vertraglicheZusatzferienTage = liveZusatzTage;
            verbleibendeFerientage = liveZusatzTage - existing.bezogeneFerientage - existing.geplanteFerientage;
          }
        } else {
          ?existing
        };
      };
    };
  };

  // Gibt den eigenen VacationLedger zurück
  public shared query ({ caller }) func getMyVacationLedger(
    serviceYearKey : Text,
  ) : async ?ComplianceTypes.VacationLedger {
    let companyId = requireCompanyId_(caller);
    let empId = requireEmployeeId_(caller);
    let normalizedKey : Text = normalizeYearKey_(serviceYearKey);
    switch (VacationLedgerLib.getVacationLedger(vacationLedgers, empId, companyId, normalizedKey)) {
      case null null;
      case (?existing) {
        let yearInt : Int = switch (Int.fromText(normalizedKey)) { case (?y) y; case null 0 };
        var liveZusatzTage : Float = 0.0;
        var found = false;
        for (vb in vacationBalances.values()) {
          if (vb.employeeId == empId and vb.companyId == companyId and vb.kalenderjahr == yearInt) {
            liveZusatzTage := vb.dauer.toFloat() / 100.0;
            found := true;
          };
        };
        if (found) {
          ?{ existing with
            vertraglicheZusatzferienTage = liveZusatzTage;
            verbleibendeFerientage = liveZusatzTage - existing.bezogeneFerientage - existing.geplanteFerientage;
          }
        } else {
          ?existing
        };
      };
    };
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
        // Ferienstatus-Risiko in Gesamtstatus einbeziehen
        let ledgerOpt = vacationLedgers.find(func(l : ComplianceTypes.VacationLedger) : Bool {
          l.employeeId == emp.id and l.companyId == companyId
        });
        let hasTwoWeekBlockRisk = switch (ledgerOpt) {
          case null { false };
          case (?l) { not l.twoWeekBlockSatisfied };
        };
        let gesamtstatus : ComplianceTypes.ComplianceStatus = if (hasCritical) { #CRITICAL }
          else if (hasBreach) { #BREACH }
          else if (hasWarning or hasTwoWeekBlockRisk) { #WARNING }
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

  // ─── Swiss default compliance rule table ────────────────────────────────────

  // Gibt alle 9 Compliance-Regeln zurück (mandantenspezifische Werte oder Schweizer Defaults).
  // Regel-Codes: REST_TIME, WEEKEND_REST, OVERTIME_CONTRACTUAL, OVERTIME_LEGAL_45,
  //   OVERTIME_LEGAL_50, PAUSE_MINIMUM_5H30, PAUSE_MINIMUM_7H, PAUSE_MINIMUM_9H,
  //   VACATION_TWO_WEEK_BLOCK
  public shared query ({ caller }) func getTenantComplianceRules(
    companyId : Nat,
  ) : async [ComplianceTypes.TenantComplianceRule] {
    let callerCompanyId = requireCompanyId_(caller);
    if (callerCompanyId != companyId) Runtime.trap("Zugriff verweigert");
    requireAdminOrManager_(caller, companyId);
    getTenantRules_(companyId);
  };

  // Hilfsfunktion: gibt 9 Regeln zurück (Mandanten-Override falls vorhanden, sonst Swiss default)
  private func getTenantRules_(companyId : Nat) : [ComplianceTypes.TenantComplianceRule] {
    let cidText = companyId.toText();
    type RuleDef = { code : Text; defaultValue : Float };
    let defaults : [RuleDef] = [
      { code = "REST_TIME";             defaultValue = 11.0  },
      { code = "WEEKEND_REST";          defaultValue = 35.0  },
      { code = "OVERTIME_CONTRACTUAL"; defaultValue = 42.0  },
      { code = "OVERTIME_LEGAL_45";    defaultValue = 45.0  },
      { code = "OVERTIME_LEGAL_50";    defaultValue = 50.0  },
      { code = "PAUSE_MINIMUM_5H30";   defaultValue = 15.0  },
      { code = "PAUSE_MINIMUM_7H";     defaultValue = 30.0  },
      { code = "PAUSE_MINIMUM_9H";     defaultValue = 60.0  },
      { code = "VACATION_TWO_WEEK_BLOCK"; defaultValue = 10.0 },
    ];
    let mapKey = func(code : Text) : Text { cidText # ":" # code };
    defaults.map<RuleDef, ComplianceTypes.TenantComplianceRule>(func(rd) {
      switch (tenantComplianceRules.get(mapKey(rd.code))) {
        case (?r) { r };
        case null {
          {
            ruleCode    = rd.code;
            tenantId    = cidText;
            customValue = null;
            isActive    = true;
            isCustomized = false;
            modifiedBy  = "";
            modifiedAt  = 0;
          };
        };
      };
    });
  };

  // Aktualisiert eine Compliance-Regel für einen Mandanten (Admin/Manager).
  // Warnung bei Unterschreitung gesetzlicher Mindestwerte wird clientseitig angezeigt.
  // Alle Änderungen werden im Audit-Protokoll aufgezeichnet.
  public shared ({ caller }) func updateTenantComplianceRule(
    input : ComplianceTypes.UpdateTenantComplianceRuleInput,
  ) : async { #ok : ComplianceTypes.TenantComplianceRule; #err : Text } {
    let callerCompanyId = requireCompanyId_(caller);
    if (callerCompanyId != input.companyId) return #err("Zugriff verweigert");
    requireAdminOrManager_(caller, input.companyId);
    let empIdOpt = principalToEmployee.get(caller);
    let cidText = input.companyId.toText();
    let mapKey = cidText # ":" # input.ruleCode;
    let now = Time.now();
    // actorName für Audit-Log und modifiedBy
    let actorEmpOpt = switch (empIdOpt) {
      case null { null };
      case (?eid) { employees.find(func(e : CompanyTypes.Employee) : Bool { e.id == eid }) };
    };
    let actorName = switch (actorEmpOpt) {
      case null { "Unbekannt" };
      case (?e) { e.firstName # " " # e.lastName };
    };
    let modifiedBy = actorName;
    let existingOpt = tenantComplianceRules.get(mapKey);
    // Vorher-Werte für strukturiertes Audit-Log
    let beforeCustomValue : Text = switch (existingOpt) {
      case null { "default" };
      case (?r) { switch (r.customValue) { case null { "default" }; case (?v) { v.toText() } } };
    };
    let beforeIsActive : Text = switch (existingOpt) {
      case null { "true" };
      case (?r) { debug_show(r.isActive) };
    };
    let newRule : ComplianceTypes.TenantComplianceRule = {
      ruleCode     = input.ruleCode;
      tenantId     = cidText;
      customValue  = input.newValue;
      isActive     = input.isActive;
      isCustomized = input.newValue != null;
      modifiedBy;
      modifiedAt   = now;
    };
    tenantComplianceRules.add(mapKey, newRule);
    let afterCustomValue : Text = switch (newRule.customValue) { case null { "default" }; case (?v) { v.toText() } };
    let afterIsActive : Text = debug_show(newRule.isActive);
    // Audit-Log mit strukturierten Feldänderungen (VORHER/NACHHER)
    let auditId = nextAuditLogId.value;
    nextAuditLogId.value += 1;
    auditLogEntriesV6.add({
      id             = "AL-" # auditId.toText();
      companyId      = input.companyId;
      timestamp      = now;
      operation      = #update;
      entityType     = #company;
      entityId       = mapKey;
      actorPrincipal = caller.toText();
      actorName;
      beforeState    = ?("Regel: " # input.ruleCode);
      afterState     = ?("Regel: " # input.ruleCode);
      fieldChanges   = ?[
        {
          fieldName = "customValue";
          before    = beforeCustomValue;
          after     = afterCustomValue;
        },
        {
          fieldName = "isActive";
          before    = beforeIsActive;
          after     = afterIsActive;
        },
      ];
    });
    #ok(newRule);
  };

  // Setzt eine Compliance-Regel auf den Schweizer Standardwert zurück (nur Admin/Manager).
  public shared ({ caller }) func resetTenantComplianceRule(
    companyId : Nat,
    ruleCode  : Text,
  ) : async { #ok : ComplianceTypes.TenantComplianceRule; #err : Text } {
    let callerCompanyId = requireCompanyId_(caller);
    if (callerCompanyId != companyId) return #err("Zugriff verweigert");
    requireAdminOrManager_(caller, companyId);
    let cidText = companyId.toText();
    let mapKey = cidText # ":" # ruleCode;
    let now = Time.now();
    let empIdOpt = principalToEmployee.get(caller);
    // actorName für Audit-Log und modifiedBy
    let actorEmpOpt = switch (empIdOpt) {
      case null { null };
      case (?e_) { employees.find(func(e : CompanyTypes.Employee) : Bool { e.id == e_ }) };
    };
    let actorName = switch (actorEmpOpt) {
      case null { "Unbekannt" };
      case (?e) { e.firstName # " " # e.lastName };
    };
    let modifiedBy = actorName;
    let existingOpt = tenantComplianceRules.get(mapKey);
    let beforeCustomValue2 : Text = switch (existingOpt) {
      case null { "default" };
      case (?r) { switch (r.customValue) { case null { "default" }; case (?v) { v.toText() } } };
    };
    let beforeIsActive2 : Text = switch (existingOpt) {
      case null { "true" };
      case (?r) { debug_show(r.isActive) };
    };
    let resetRule : ComplianceTypes.TenantComplianceRule = {
      ruleCode     = ruleCode;
      tenantId     = cidText;
      customValue  = null;   // null = Swiss-law default
      isActive     = true;
      isCustomized = false;
      modifiedBy;
      modifiedAt   = now;
    };
    tenantComplianceRules.add(mapKey, resetRule);
    // Audit-Log mit strukturierten Feldänderungen
    let auditId2 = nextAuditLogId.value;
    nextAuditLogId.value += 1;
    auditLogEntriesV6.add({
      id             = "AL-" # auditId2.toText();
      companyId;
      timestamp      = now;
      operation      = #update;
      entityType     = #company;
      entityId       = mapKey;
      actorPrincipal = caller.toText();
      actorName;
      beforeState    = ?("Regel: " # ruleCode);
      afterState     = ?("Regel: " # ruleCode # " (Zurückgesetzt auf Schweizer Standard)");
      fieldChanges   = ?[
        {
          fieldName = "customValue";
          before    = beforeCustomValue2;
          after     = "default";
        },
        {
          fieldName = "isActive";
          before    = beforeIsActive2;
          after     = "true";
        },
      ];
    });
    #ok(resetRule);
  };

  // Gibt den frühesten Eintrittszeitpunkt (von) als Int (nanoseconds) zurück.
  // Gibt 0 zurück wenn keine Beschäftigung gefunden wird.
  private func getEarliestHireDate_(empId : Nat, companyId_ : Nat) : Int {
    var earliest : Int = 0;
    var found : Bool = false;
    for (e in employmentsV2.values()) {
      if (e.employeeId == empId and e.companyId == companyId_) {
        if (not found or e.von < earliest) {
          earliest := e.von;
          found := true;
        };
      };
    };
    earliest
  };

  private func getEarliestHireDateText_(empId : Nat, companyId_ : Nat) : Text {
    let ts = getEarliestHireDate_(empId, companyId_);
    if (ts == 0) { "" } else { ComplianceLib.nsToDate(ts) }
  };

  // ─── Weekly compliance check (Admin/Manager trigger) ──────────────────────────

  // Führt den wöchentlichen Compliance-Check für alle Mitarbeiter einer Firma durch.
  // weekDate: Optional YYYY-MM-DD; wenn angegeben, wird die ISO-Woche dieses Datums geprüft.
  // Gibt die Anzahl der generierten Findings zurück.
  public shared ({ caller }) func runWeeklyComplianceCheck(
    companyId : Nat,
    weekDate  : Text,
  ) : async { #ok : { newFindings : Nat; existingFindings : Nat }; #err : Text } {
    let callerCompanyId = requireCompanyId_(caller);
    if (callerCompanyId != companyId) return #err("Zugriff verweigert");
    requireAdminOrManager_(caller, companyId);

    let companyEmployees = employees.filter(func(e : CompanyTypes.Employee) : Bool {
      e.companyId == companyId and e.active
    }).toArray();

    var newFindingsCount = 0;
    var existingFindingsCount = 0;

    // Woche berechnen: weekDate wenn angegeben, sonst aktuelle Woche
    let nsPerDay : Int = 86_400_000_000_000;
    let referenceDays : Int = if (weekDate == "") {
      Time.now() / nsPerDay
    } else {
      ComplianceLib.dateToUnixDays(weekDate)
    };
    // Wochentag: 0=Mo..6=So; 1970-01-01 war Donnerstag (=3)
    let raw = referenceDays % 7;
    let shifted = raw + 3;
    let weekday = ((shifted % 7) + 7) % 7;
    let mondayDays = referenceDays - weekday;
    let weekStart = ComplianceLib.unixDaysToDate(mondayDays);
    let weekEnd = ComplianceLib.unixDaysToDate(mondayDays + 6);

    for (emp in companyEmployees.values()) {
      // Beschäftigung: aktuellste aktive Employment für Soll-Stunden ermitteln
      let nsPerDay2 : Int = 86_400_000_000_000;
      let weekEndNs : Int = ComplianceLib.dateToNs(weekEnd) + nsPerDay2 - 1;
      let empEmps = employmentsV2.filter(func(em : CompanyTypes.Employment) : Bool {
        em.employeeId == emp.id and em.companyId == companyId;
      }).toArray();
      // Neueste Beschäftigung suchen, die während der Woche aktiv war
      let activeEmp : ?CompanyTypes.Employment = do {
        var best : ?CompanyTypes.Employment = null;
        for (em in empEmps.values()) {
          let vonNs = ComplianceLib.normalizeNs(em.von);
          let bisOk = switch (em.bis) {
            case null { true };
            case (?b) { ComplianceLib.normalizeNs(b) >= ComplianceLib.dateToNs(weekStart) };
          };
          if (vonNs <= weekEndNs and bisOk) {
            switch (best) {
              case null { best := ?em };
              case (?prev) {
                if (em.von > prev.von) { best := ?em };
              };
            };
          };
        };
        best;
      };
      // Wöchentliche Soll-Stunden aus Beschäftigung berechnen (Mo–Fr, in Minuten → Stunden)
      let contractualWeeklyH : Float = switch (activeEmp) {
        case null { 40.0 }; // Fallback wenn keine Beschäftigung
        case (?em) {
          let totalMin : Nat = em.stundenMo + em.stundenDi + em.stundenMi + em.stundenDo +
                               em.stundenFr + em.stundenSa + em.stundenSo;
          totalMin.toFloat() / 60.0;
        };
      };

      // Compliance-Profil des Mitarbeiters suchen; falls keines vorhanden, Default erstellen
      let profileOpt = complianceProfiles.find(func(p : ComplianceTypes.EmployeeComplianceProfile) : Bool {
        p.employeeId == emp.id and p.companyId == companyId
      });
      // Profil auflösen: existierendes verwenden oder neues anlegen
      // vertraglicheWochenstunden wird NICHT im Profil gespeichert – kommt aus der Beschäftigung
      let profile : ComplianceTypes.EmployeeComplianceProfile = switch (profileOpt) {
        case (?p) { p };
        case null {
          let now = Time.now();
          let newId = nextComplianceProfileId.value;
          nextComplianceProfileId.value += 1;
          let newProfile : ComplianceTypes.EmployeeComplianceProfile = {
            id = newId;
            employeeId = emp.id;
            companyId;
            aktiv = true;
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
          empPauseOverrides, contractualWeeklyH
        );

        for (finding in newFindings.values()) {
          // Deduplizierung: gleicher Mitarbeiter + ruleCode + periodeKey bereits vorhanden?
          // Auch FREIGEGEBEN-Findings unterdrücken die Neu-Erstellung (Bug 32)
          let existingOpt = complianceFindings.find(func(f : ComplianceTypes.ComplianceFinding) : Bool {
            f.employeeId == finding.employeeId
              and f.companyId == finding.companyId
              and f.ruleCode == finding.ruleCode
              and f.periodeKey == finding.periodeKey
          });
          switch (existingOpt) {
            case (?existing) {
              // Bereits vorhanden (offen oder freigegeben): nicht neu erstellen
              existingFindingsCount += 1;
            };
            case null {
              complianceFindings.add(finding);
              newFindingsCount += 1;
            };
          };
        };

        // VacationLedger aktualisieren – pro Kalenderjahr Zusatztage aus VacationBalance lesen
        let empAbsences = absences.filter(func(ab : TrackingTypes.Absence) : Bool {
          ab.employeeId == emp.id and ab.companyId == companyId;
        }).toArray();
        let hireDateText = getEarliestHireDateText_(emp.id, companyId);
        if (hireDateText != "") {
          let todayStrForLedger = ComplianceLib.today();
          let yearsForLedger = ComplianceLib.getAllCalendarYears(hireDateText, null, todayStrForLedger);
          for (yr in yearsForLedger.values()) {
            let yKey = yr.toText();
            let zusatzTageForYear : Float = do {
              var found : Float = 0.0;
              for (vb in vacationBalances.values()) {
                if (vb.employeeId == emp.id and vb.companyId == companyId and vb.kalenderjahr == yr) {
                  found := vb.dauer.toFloat() / 100.0;
                };
              };
              found
            };
            ignore VacationLedgerLib.upsertCalendarYearLedger(
              vacationLedgers, nextVacationLedgerId,
              emp.id, companyId, yKey,
              hireDateText, null, emp.geburtsdatum, zusatzTageForYear,
              empAbsences, 10
            );
          };
        };
      };
    };

    #ok({ newFindings = newFindingsCount; existingFindings = existingFindingsCount });
  };

  // ─── Auto-Initialisierung Compliance-Profil ────────────────────────────────────

  // Erstellt ein Standard-Compliance-Profil für einen neuen Mitarbeiter (interne Hilfsfunktion)
  // aktiv = true: sofort aktiv, damit der wöchentliche Check greift.
  // vertraglicheWochenstunden wird NICHT gespeichert – wird aus der Beschäftigung gelesen.
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
      let hireDateText = getEarliestHireDateText_(emp.id, companyId);
      if (hireDateText != "") {
        let empAbsences = absences.filter(func(ab : TrackingTypes.Absence) : Bool {
          ab.employeeId == emp.id and ab.companyId == companyId;
        }).toArray();
        // Profil laden für vertraglicheZusatzferienTage
        let profileOpt = complianceProfiles.find(func(p : ComplianceTypes.EmployeeComplianceProfile) : Bool {
          p.employeeId == emp.id and p.companyId == companyId
        });

        // Alle Kalenderjahre ab Eintrittsjahr bis heute anlegen/aktualisieren
        let years = ComplianceLib.getAllCalendarYears(hireDateText, null, todayStr);
        for (year in years.values()) {
          let key = year.toText();
          // Zusatztage aus VacationBalance für dieses Jahr und diesen Mitarbeiter
          let zusatzTage : Float = do {
            var found : Float = 0.0;
            for (vb in vacationBalances.values()) {
              if (vb.employeeId == emp.id and vb.companyId == companyId and vb.kalenderjahr == year) {
                found := vb.dauer.toFloat() / 100.0;
              };
            };
            found
          };
          let ledger = VacationLedgerLib.upsertCalendarYearLedger(
            vacationLedgers, nextVacationLedgerId,
            emp.id, companyId, key,
            hireDateText, null, emp.geburtsdatum, zusatzTage,
            empAbsences, 10
          );

          // Ferienminimum-Compliance prüfen: gesetzlicher Anspruch > tatsächlich konfiguriertes Ferienguthaben?
          // Nur für das aktuelle Jahr relevant
          if (key == todayYearStr) {
            // Prüfen ob ein bestehendes VACATION_MINIMUM-Finding für dieses Jahr schon existiert (inkl. FREIGEGEBEN)
            let existingFinding = complianceFindings.any(func(f : ComplianceTypes.ComplianceFinding) : Bool {
              f.employeeId == emp.id and f.companyId == companyId
                and f.ruleCode == "VACATION_MINIMUM"
                and f.periodeKey == key
            });
            // Warnung erzeugen wenn vertragliches Guthaben unter gesetzlichem Minimum liegt.
            // vertraglicheZusatzferienTage aus dem Ledger = tatsächlich hinterlegtes Ferienguthaben
            // (= vb.dauer/100 für das Kalenderjahr, oder 0.0 wenn kein Eintrag vorhanden)
            let gesetzlicherBedarf = ledger.gesetzlicheFerientage;
            let gedecktDurch = ledger.vertraglicheZusatzferienTage; // tatsächlich konfiguriertes Guthaben
            if (not existingFinding and zusatzTage > 0.0 and gesetzlicherBedarf > gedecktDurch + 0.01) {
              let findingId = nextComplianceFindingId.value;
              nextComplianceFindingId.value += 1;
              let finding = ComplianceLib.makeFinding(
                findingId, emp.id, companyId,
                #SERVICE_YEAR, key,
                "VACATION_MINIMUM",
                #WARNING,
                gedecktDurch,              // IST: konfigurierter Anspruch
                gesetzlicherBedarf,        // SOLL: gesetzlicher Anspruch
                "Tage",
                "Gesetzliches Ferienminimum nicht eingehalten: Mindestens " #
                  ComplianceLib.floatToText(gesetzlicherBedarf, 2) #
                  " Tage erforderlich (" # key # "), aber nur " #
                  ComplianceLib.floatToText(gedecktDurch, 2) #
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
