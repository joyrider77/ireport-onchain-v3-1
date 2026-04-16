// Öffentliche API für den Audit-Log (nur Admin/Manager)
import List "mo:core/List";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import CommonTypes "../types/common";
import CompanyTypes "../types/company";
import AuditTypes "../types/audit";

mixin (
  accessControlState : AccessControl.AccessControlState,
  companies : List.List<CompanyTypes.Company>,
  employees : List.List<CompanyTypes.Employee>,
  principalToCompany : Map.Map<Principal, CommonTypes.CompanyId>,
  principalToEmployee : Map.Map<Principal, CommonTypes.EmployeeId>,
  auditLog : List.List<AuditTypes.AuditEntry>,
) {
  // Query: Audit-Log abrufen — nur Admin/Manager der eigenen Firma
  public query ({ caller }) func listAuditLog(
    targetType : ?Text,
    targetId : ?Nat,
  ) : async [AuditTypes.AuditEntry] {
    let companyId = switch (principalToCompany.get(caller)) {
      case null { Runtime.trap("Nicht authentifiziert") };
      case (?cid) cid;
    };
    let empId = switch (principalToEmployee.get(caller)) {
      case null { Runtime.trap("Mitarbeiter nicht gefunden") };
      case (?eid) eid;
    };
    let emp = switch (employees.find(func(e) { e.id == empId and e.companyId == companyId })) {
      case null { Runtime.trap("Mitarbeiter nicht gefunden") };
      case (?e) e;
    };
    if (emp.role != #admin and emp.role != #manager) {
      Runtime.trap("Keine Berechtigung: Nur Admin oder Manager");
    };
    auditLog.filter(func(entry) {
      let matchType = switch (targetType) {
        case null { true };
        case (?t) { entry.targetType == t };
      };
      let matchId = switch (targetId) {
        case null { true };
        case (?id) { entry.targetId == id };
      };
      matchType and matchId;
    }).toArray();
  };
};
