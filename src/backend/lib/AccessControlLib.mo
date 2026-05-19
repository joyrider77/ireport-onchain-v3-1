// Gemeinsame Rollenprüfung für alle Mixins
// Ersetzt die fünf copy-paste requireRole-Funktionen in company-api, masterdata-api,
// expenses-api, absences-api und invite-api.
import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import CommonTypes "../types/common";
import CompanyTypes "../types/company";

module {
  public type Employee  = CompanyTypes.Employee;
  public type Company   = CompanyTypes.Company;
  public type Role      = CommonTypes.Role;
  public type EmployeeId = CommonTypes.EmployeeId;

  /// Prüft, ob `caller` in `company` einen der `allowedRoles` besitzt.
  ///
  /// Parameter:
  ///   caller            – Principal des Aufrufers
  ///   company           – Firma-Datensatz (wird für companyId-Filterung verwendet)
  ///   allowedRoles      – Liste der erlaubten Rollen
  ///   principalToEmployee – Map von Principal → EmployeeId (Mixin-State)
  ///   employees         – Vollständige Mitarbeiterliste (Mixin-State)
  ///
  /// Rückgabe:
  ///   #ok(employee)     – wenn der Caller gefunden wurde und eine erlaubte Rolle hat
  ///   #err("Unauthorized") – wenn nicht gefunden oder Rolle nicht erlaubt
  public func requireRole(
    caller              : Principal,
    company             : Company,
    allowedRoles        : [Role],
    principalToEmployee : Map.Map<Principal, EmployeeId>,
    employees           : List.List<Employee>,
  ) : CommonTypes.Result<Employee> {
    // Schritt 1: EmployeeId aus der Principal-Map ermitteln
    let empId = switch (principalToEmployee.get(caller)) {
      case null     { return #err("Unauthorized") };
      case (?eid)   eid;
    };
    // Schritt 2: Employee-Datensatz in der Firma finden
    let emp = switch (employees.find(func(e : Employee) : Bool = e.id == empId and e.companyId == company.id)) {
      case null   { return #err("Unauthorized") };
      case (?e)   e;
    };
    // Schritt 3: Rolle gegen die erlaubten Rollen prüfen
    let hasRole = allowedRoles.any(func(r : Role) : Bool = r == emp.role);
    if (not hasRole) {
      return #err("Unauthorized");
    };
    #ok(emp);
  };
};
