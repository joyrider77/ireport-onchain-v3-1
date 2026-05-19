// Öffentliche API für den Audit-Log
// - listAuditLog: Legacy-Funktion für Genehmigungsänderungen (Abwesenheiten/Spesen)
// - listAuditLogs: Neue Funktion für CRUD-Operationen (Phase 1: Feiertage)
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
  auditLogEntries : List.List<AuditTypes.AuditLogEntry>,
  platformAdminPrincipal : { var value : ?Principal },
) {
  // Hilfsfunktion: companyId des Aufrufers ermitteln
  private func requireAuditCompanyId(caller : Principal) : CommonTypes.CompanyId {
    switch (principalToCompany.get(caller)) {
      case null { Runtime.trap("Nicht authentifiziert") };
      case (?cid) cid;
    };
  };

  // Hilfsfunktion: Prüfen ob Aufrufer Admin oder Platform Admin ist
  private func isAdminOrPlatformAdmin(caller : Principal, companyId : CommonTypes.CompanyId) : Bool {
    // Platform Admin hat immer Zugriff
    switch (platformAdminPrincipal.value) {
      case (?pa) {
        if (Principal.equal(pa, caller)) return true;
      };
      case null {};
    };
    // Admin/Manager-Rolle prüfen
    switch (principalToEmployee.get(caller)) {
      case null { false };
      case (?empId) {
        switch (employees.find(func(e) { e.id == empId and e.companyId == companyId })) {
          case null { false };
          case (?e) { e.role == #admin or e.role == #manager };
        };
      };
    };
  };

  // Legacy: Audit-Log für Genehmigungsänderungen abrufen — nur Admin/Manager
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

  // Neu: CRUD-Audit-Log abrufen (Phase 1: Feiertage)
  // Zugriff: Admin, Manager oder Platform Admin
  // Strikte Mandantentrennung: Nur Einträge der eigenen Firma (Platform Admin sieht alle)
  public query ({ caller }) func listAuditLogs(
    filter : AuditTypes.AuditLogFilter,
  ) : async [AuditTypes.AuditLogEntry] {
    let companyId = requireAuditCompanyId(caller);
    if (not isAdminOrPlatformAdmin(caller, companyId)) {
      Runtime.trap("Keine Berechtigung: Nur Admin, Manager oder Platform Admin");
    };
    // Platform Admin sieht alle Firmen; andere nur ihre eigene
    let isPlatformAdmin = switch (platformAdminPrincipal.value) {
      case (?pa) { Principal.equal(pa, caller) };
      case null { false };
    };
    let result = auditLogEntries.filter(func(entry) {
      // Mandantentrennung
      if (not isPlatformAdmin and entry.companyId != companyId) return false;
      // Filter: entityType
      let matchType = switch (filter.entityType) {
        case null { true };
        case (?et) {
          switch (et, entry.entityType) {
            case (#holiday, #holiday) { true };
            case (#company, #company) { true };
            case (#employee, #employee) { true };
            case (#customer, #customer) { true };
            case (#project, #project) { true };
            case (#serviceType, #serviceType) { true };
            case (#expenseType, #expenseType) { true };
            case (#absenceType, #absenceType) { true };
            case (#invoiceTemplate, #invoiceTemplate) { true };
            case (#timeEntry, #timeEntry) { true };
            case (_, _) { false };
          };
        };
      };
      if (not matchType) return false;
      // Filter: operation
      let matchOp = switch (filter.operation) {
        case null { true };
        case (?op) {
          switch (op, entry.operation) {
            case (#create, #create) { true };
            case (#update, #update) { true };
            case (#remove, #remove) { true };
            case (#delete, #delete) { true }; // Legacy-Kompatibilitaet
            case (_, _) { false };
          };
        };
      };
      if (not matchOp) return false;
      // Filter: actor
      let matchActor = switch (filter.actorPrincipalFilter) {
        case null { true };
        case (?p) { entry.actorPrincipal == p };
      };
      if (not matchActor) return false;
      // Filter: dateFrom
      let matchFrom = switch (filter.dateFrom) {
        case null { true };
        case (?from) { entry.timestamp >= from };
      };
      if (not matchFrom) return false;
      // Filter: dateTo
      let matchTo = switch (filter.dateTo) {
        case null { true };
        case (?to) { entry.timestamp <= to };
      };
      matchTo;
    });
    // Sortierung: neueste zuerst
    result.sort(func(a, b) {
      if (a.timestamp > b.timestamp) { #less }
      else if (a.timestamp < b.timestamp) { #greater }
      else { #equal };
    }).toArray();
  };
};
