// Öffentliche API für Zeiterfassung
import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import CommonTypes "../types/common";
import CompanyTypes "../types/company";
import TrackingTypes "../types/timetracking";
import TimeLib "../lib/timetracking";

mixin (
  accessControlState : AccessControl.AccessControlState,
  companies : List.List<CompanyTypes.Company>,
  employees : List.List<CompanyTypes.Employee>,
  principalToCompany : Map.Map<Principal, CommonTypes.CompanyId>,
  principalToEmployee : Map.Map<Principal, CommonTypes.EmployeeId>,
  timeEntries : List.List<TrackingTypes.TimeEntry>,
  nextTimeEntryId : { var value : Nat },
) {
  // Hilfsfunktion: Authentifizierung prüfen
  private func ttRequireAuth(caller : Principal) : (CommonTypes.CompanyId, CommonTypes.EmployeeId) {
    let companyId = switch (principalToCompany.get(caller)) {
      case null { Runtime.trap("Nicht authentifiziert") };
      case (?cid) cid;
    };
    let employeeId = switch (principalToEmployee.get(caller)) {
      case null { Runtime.trap("Kein Mitarbeiterdatensatz gefunden") };
      case (?eid) eid;
    };
    (companyId, employeeId);
  };

  // Erstellt einen neuen Zeiteintrag
  public shared ({ caller }) func createTimeEntry(
    input : TrackingTypes.CreateTimeEntryInput
  ) : async CommonTypes.Result<TrackingTypes.TimeEntry> {
    let (companyId, employeeId) = ttRequireAuth(caller);
    let id = nextTimeEntryId.value;
    nextTimeEntryId.value += 1;
    #ok(TimeLib.createTimeEntry(timeEntries, id, companyId, employeeId, input));
  };

  // Gibt gefilterte Zeiteinträge zurück
  public query ({ caller }) func listTimeEntries(
    filter : TrackingTypes.TimeEntryFilter
  ) : async [TrackingTypes.TimeEntry] {
    let companyId = switch (principalToCompany.get(caller)) {
      case null { Runtime.trap("Nicht authentifiziert") };
      case (?cid) cid;
    };
    // Mitarbeiter sehen nur eigene Einträge, Admin/Manager alle
    let employeeId = principalToEmployee.get(caller);
    let empRole = switch (employeeId) {
      case null { #employee };
      case (?eid) {
        switch (employees.find(func(e) { e.id == eid and e.companyId == companyId })) {
          case null { #employee };
          case (?e) e.role;
        };
      };
    };
    let effectiveFilter : TrackingTypes.TimeEntryFilter = switch (empRole) {
      case (#admin) filter;
      case (#manager) filter;
      case (#employee) {
        { filter with employeeId = employeeId };
      };
    };
    TimeLib.listTimeEntries(timeEntries, companyId, effectiveFilter);
  };

  // Aktualisiert einen Zeiteintrag
  public shared ({ caller }) func updateTimeEntry(
    id : CommonTypes.TimeEntryId,
    input : TrackingTypes.UpdateTimeEntryInput,
  ) : async CommonTypes.Result<TrackingTypes.TimeEntry> {
    let (companyId, employeeId) = ttRequireAuth(caller);
    switch (TimeLib.updateTimeEntry(timeEntries, companyId, id, employeeId, input)) {
      case null { #err("Zeiteintrag nicht gefunden oder keine Berechtigung") };
      case (?e) { #ok(e) };
    };
  };

  // Löscht einen Zeiteintrag
  public shared ({ caller }) func deleteTimeEntry(
    id : CommonTypes.TimeEntryId
  ) : async CommonTypes.Result<()> {
    let (companyId, employeeId) = ttRequireAuth(caller);
    if (TimeLib.deleteTimeEntry(timeEntries, companyId, id, employeeId)) {
      #ok(());
    } else {
      #err("Zeiteintrag nicht gefunden oder keine Berechtigung");
    };
  };
};
