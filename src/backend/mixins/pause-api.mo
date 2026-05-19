// Pausen-API - Oeffentliche Canister-Schnittstelle fuer Pausen-Erkennung und -Compliance (Punkt 21)
import List "mo:core/List";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import CommonTypes "../types/common";
import CompanyTypes "../types/company";
import TrackingTypes "../types/timetracking";
import ComplianceTypes "../types/compliance";
import PauseDetectionLib "../lib/pause-detection";

mixin (
  employees           : List.List<CompanyTypes.Employee>,
  principalToCompany  : Map.Map<Principal, CommonTypes.CompanyId>,
  principalToEmployee : Map.Map<Principal, CommonTypes.EmployeeId>,
  timeEntries         : List.List<TrackingTypes.TimeEntry>,
  pauseOverrides      : List.List<ComplianceTypes.PauseOverride>,
  nextPauseOverrideId : { var value : Nat },
) {

  private func pauseRequireCompanyId_(caller : Principal) : CommonTypes.CompanyId {
    switch (principalToCompany.get(caller)) {
      case null { Runtime.trap("Nicht authentifiziert") };
      case (?cid) cid;
    };
  };

  private func pauseRequireEmployeeId_(caller : Principal) : CommonTypes.EmployeeId {
    switch (principalToEmployee.get(caller)) {
      case null { Runtime.trap("Kein Mitarbeiterprofil gefunden") };
      case (?eid) eid;
    };
  };

  private func pauseIsAdminOrManager_(caller : Principal, companyId : CommonTypes.CompanyId) : Bool {
    switch (principalToEmployee.get(caller)) {
      case null { false };
      case (?eid) {
        switch (employees.find(func(e : CompanyTypes.Employee) : Bool { e.id == eid and e.companyId == companyId })) {
          case null { false };
          case (?emp) { emp.role == #admin or emp.role == #manager };
        };
      };
    };
  };

  private func pauseCanAccess_(caller : Principal, companyId : CommonTypes.CompanyId, targetEmpId : Nat) : Bool {
    switch (principalToEmployee.get(caller)) {
      case null { false };
      case (?eid) {
        if (eid == targetEmpId) return true;
        pauseIsAdminOrManager_(caller, companyId);
      };
    };
  };

  // Gibt die erkannten Pausen fuer einen Mitarbeiter an einem bestimmten Tag zurueck.
  // Mitarbeiter sehen nur eigene Pausen; Admin/Manager sehen alle Mitarbeiter des Mandanten.
  public shared query ({ caller }) func getPausesForDay(
    employeeId : Nat,
    date       : Text,
  ) : async [ComplianceTypes.DetectedPause] {
    let companyId = pauseRequireCompanyId_(caller);
    if (not pauseCanAccess_(caller, companyId, employeeId)) {
      Runtime.trap("Zugriff verweigert");
    };
    let dayEntries = timeEntries.filter(func(te : TrackingTypes.TimeEntry) : Bool {
      te.employeeId == employeeId and te.companyId == companyId and te.date == date;
    }).toArray();
    let dayOverrides = pauseOverrides.filter(func(ov : ComplianceTypes.PauseOverride) : Bool {
      ov.userId == employeeId and ov.companyId == companyId and ov.date == date;
    }).toArray();
    PauseDetectionLib.detectPausesForDay(employeeId, companyId, date, dayEntries, dayOverrides);
  };

  // Gibt das Pausen-Compliance-Ergebnis fuer einen Mitarbeiter an einem bestimmten Tag zurueck.
  public shared query ({ caller }) func getPauseComplianceForDay(
    employeeId : Nat,
    date       : Text,
  ) : async ComplianceTypes.DayPauseComplianceResult {
    let companyId = pauseRequireCompanyId_(caller);
    if (not pauseCanAccess_(caller, companyId, employeeId)) {
      Runtime.trap("Zugriff verweigert");
    };
    let dayEntries = timeEntries.filter(func(te : TrackingTypes.TimeEntry) : Bool {
      te.employeeId == employeeId and te.companyId == companyId and te.date == date;
    }).toArray();
    let dayOverrides = pauseOverrides.filter(func(ov : ComplianceTypes.PauseOverride) : Bool {
      ov.userId == employeeId and ov.companyId == companyId and ov.date == date;
    }).toArray();
    let pausen = PauseDetectionLib.detectPausesForDay(employeeId, companyId, date, dayEntries, dayOverrides);
    let workMin = PauseDetectionLib.calculateWorkDurationMinutes(employeeId, companyId, date, dayEntries);
    PauseDetectionLib.calculatePauseCompliance(employeeId, companyId, date, workMin, pausen);
  };

  // Erstellt einen PauseOverride.
  // Admin/Manager: fuer beliebige Mitarbeiter des Mandanten.
  // Mitarbeiter: nur fuer sich selbst.
  public shared ({ caller }) func createPauseOverride(
    input : ComplianceTypes.CreatePauseOverrideInput,
  ) : async { #ok : ComplianceTypes.PauseOverride; #err : Text } {
    let companyId = pauseRequireCompanyId_(caller);
    let callerEmpId = pauseRequireEmployeeId_(caller);
    if (input.companyId != companyId) {
      return #err("Zugriff verweigert: anderer Mandant");
    };
    let isAdmMgr = pauseIsAdminOrManager_(caller, companyId);
    if (not isAdmMgr and callerEmpId != input.userId) {
      return #err("Zugriff verweigert: Nur eigene Pausen oder Admin/Manager");
    };
    let exists = pauseOverrides.any(func(ov : ComplianceTypes.PauseOverride) : Bool {
      ov.userId == input.userId and ov.companyId == companyId
        and ov.date == input.date
        and ov.gapStart == input.gapStart and ov.gapEnd == input.gapEnd;
    });
    if (exists) {
      return #err("Override fuer diese Pause existiert bereits");
    };
    let now = Time.now();
    let id = nextPauseOverrideId.value;
    nextPauseOverrideId.value += 1;
    let override : ComplianceTypes.PauseOverride = {
      id;
      userId    = input.userId;
      companyId;
      date      = input.date;
      gapStart  = input.gapStart;
      gapEnd    = input.gapEnd;
      action    = input.action;
      reason    = input.reason;
      createdByUserId = callerEmpId;
      createdAt = now;
      updatedAt = now;
    };
    pauseOverrides.add(override);
    #ok(override);
  };

  // Loescht/revidiert einen PauseOverride.
  // Admin/Manager darf beliebige Overrides loeschen; Mitarbeiter nur eigene.
  public shared ({ caller }) func deletePauseOverride(
    overrideId : Nat,
  ) : async { #ok : (); #err : Text } {
    let companyId = pauseRequireCompanyId_(caller);
    let callerEmpId = pauseRequireEmployeeId_(caller);
    switch (pauseOverrides.find(func(ov : ComplianceTypes.PauseOverride) : Bool {
      ov.id == overrideId and ov.companyId == companyId;
    })) {
      case null { #err("Override nicht gefunden") };
      case (?ov) {
        let isAdmMgr = pauseIsAdminOrManager_(caller, companyId);
        if (not isAdmMgr and ov.createdByUserId != callerEmpId) {
          return #err("Zugriff verweigert: Nur Admin/Manager kann fremde Overrides loeschen");
        };
        let filtered = pauseOverrides.filter(func(o : ComplianceTypes.PauseOverride) : Bool {
          not (o.id == overrideId and o.companyId == companyId)
        });
        pauseOverrides.clear();
        pauseOverrides.append(filtered);
        #ok(());
      };
    };
  };

  // Gibt alle PauseOverrides fuer einen Mitarbeiter an einem bestimmten Tag zurueck.
  public shared query ({ caller }) func getPauseOverridesForDay(
    employeeId : Nat,
    date       : Text,
  ) : async [ComplianceTypes.PauseOverride] {
    let companyId = pauseRequireCompanyId_(caller);
    if (not pauseCanAccess_(caller, companyId, employeeId)) {
      Runtime.trap("Zugriff verweigert");
    };
    pauseOverrides.filter(func(ov : ComplianceTypes.PauseOverride) : Bool {
      ov.userId == employeeId and ov.companyId == companyId and ov.date == date;
    }).toArray();
  };

};
