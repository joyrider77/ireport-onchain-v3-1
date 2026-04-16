// Öffentliche API für Stammdatenverwaltung
import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import CommonTypes "../types/common";
import CompanyTypes "../types/company";
import MasterTypes "../types/masterdata";
import MasterLib "../lib/masterdata";

mixin (
  accessControlState : AccessControl.AccessControlState,
  companies : List.List<CompanyTypes.Company>,
  employees : List.List<CompanyTypes.Employee>,
  principalToCompany : Map.Map<Principal, CommonTypes.CompanyId>,
  principalToEmployee : Map.Map<Principal, CommonTypes.EmployeeId>,
  customers : List.List<MasterTypes.Customer>,
  projects : List.List<MasterTypes.Project>,
  projectAssignments : List.List<MasterTypes.ProjectAssignment>,
  projectMembers : Map.Map<CommonTypes.ProjectId, [MasterTypes.ProjectMemberAssignment]>,
  serviceTypes : List.List<MasterTypes.ServiceType>,
  expenseTypes : List.List<MasterTypes.ExpenseType>,
  absenceTypes : List.List<MasterTypes.AbsenceType>,
  holidays : List.List<MasterTypes.Holiday>,
  standardHours : Map.Map<(CommonTypes.CompanyId, CommonTypes.EmployeeId), MasterTypes.Standardarbeitszeiten>,
  nextCustomerId : { var value : Nat },
  nextProjectId : { var value : Nat },
  nextServiceTypeId : { var value : Nat },
  nextExpenseTypeId : { var value : Nat },
  nextAbsenceTypeId : { var value : Nat },
  nextHolidayId : { var value : Nat },
) {
  // Hilfsfunktion: Authentifizierung prüfen
  private func requireMdCompanyId(caller : Principal) : CommonTypes.CompanyId {
    switch (principalToCompany.get(caller)) {
      case null { Runtime.trap("Nicht authentifiziert") };
      case (?cid) cid;
    };
  };

  // Hilfsfunktion: Admin/Manager-Rolle prüfen
  private func requireMdAdminOrManager(caller : Principal, companyId : CommonTypes.CompanyId) : () {
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
  };

  // --- Kunden ---

  public query ({ caller }) func listCustomers() : async [MasterTypes.Customer] {
    let companyId = requireMdCompanyId(caller);
    MasterLib.listCustomers(customers, companyId);
  };

  public shared ({ caller }) func createCustomer(
    input : MasterTypes.CreateCustomerInput
  ) : async CommonTypes.Result<MasterTypes.Customer> {
    let companyId = requireMdCompanyId(caller);
    requireMdAdminOrManager(caller, companyId);
    let id = nextCustomerId.value;
    nextCustomerId.value += 1;
    #ok(MasterLib.createCustomer(customers, id, companyId, input));
  };

  public shared ({ caller }) func updateCustomer(
    id : CommonTypes.CustomerId,
    input : MasterTypes.UpdateCustomerInput,
  ) : async CommonTypes.Result<MasterTypes.Customer> {
    let companyId = requireMdCompanyId(caller);
    requireMdAdminOrManager(caller, companyId);
    switch (MasterLib.updateCustomer(customers, companyId, id, input)) {
      case null { #err("Kunde nicht gefunden") };
      case (?c) { #ok(c) };
    };
  };

  public shared ({ caller }) func deleteCustomer(
    id : CommonTypes.CustomerId
  ) : async CommonTypes.Result<()> {
    let companyId = requireMdCompanyId(caller);
    requireMdAdminOrManager(caller, companyId);
    if (MasterLib.deleteCustomer(customers, companyId, id)) {
      #ok(());
    } else {
      #err("Kunde nicht gefunden");
    };
  };

  // --- Projekte ---

  public query ({ caller }) func listProjects() : async [MasterTypes.Project] {
    let companyId = requireMdCompanyId(caller);
    MasterLib.listProjects(projects, companyId);
  };

  public shared ({ caller }) func createProject(
    input : MasterTypes.CreateProjectInput
  ) : async CommonTypes.Result<MasterTypes.Project> {
    let companyId = requireMdCompanyId(caller);
    requireMdAdminOrManager(caller, companyId);
    let id = nextProjectId.value;
    nextProjectId.value += 1;
    #ok(MasterLib.createProject(projects, id, companyId, input));
  };

  public shared ({ caller }) func updateProject(
    id : CommonTypes.ProjectId,
    input : MasterTypes.UpdateProjectInput,
  ) : async CommonTypes.Result<MasterTypes.Project> {
    let companyId = requireMdCompanyId(caller);
    requireMdAdminOrManager(caller, companyId);
    switch (MasterLib.updateProject(projects, companyId, id, input)) {
      case null { #err("Projekt nicht gefunden") };
      case (?p) { #ok(p) };
    };
  };

  public shared ({ caller }) func deleteProject(
    id : CommonTypes.ProjectId
  ) : async CommonTypes.Result<()> {
    let companyId = requireMdCompanyId(caller);
    requireMdAdminOrManager(caller, companyId);
    if (MasterLib.deleteProject(projects, companyId, id)) {
      #ok(());
    } else {
      #err("Projekt nicht gefunden");
    };
  };

  // --- Projektzuweisungen ---

  public query ({ caller }) func listProjectAssignments() : async [MasterTypes.ProjectAssignment] {
    let companyId = requireMdCompanyId(caller);
    MasterLib.listProjectAssignments(projectAssignments, companyId);
  };

  public shared ({ caller }) func assignEmployeeToProject(
    employeeId : CommonTypes.EmployeeId,
    projectId : CommonTypes.ProjectId,
  ) : async CommonTypes.Result<MasterTypes.ProjectAssignment> {
    let companyId = requireMdCompanyId(caller);
    requireMdAdminOrManager(caller, companyId);
    #ok(MasterLib.assignEmployeeToProject(projectAssignments, companyId, employeeId, projectId));
  };

  public shared ({ caller }) func removeEmployeeFromProject(
    employeeId : CommonTypes.EmployeeId,
    projectId : CommonTypes.ProjectId,
  ) : async CommonTypes.Result<()> {
    let companyId = requireMdCompanyId(caller);
    requireMdAdminOrManager(caller, companyId);
    if (MasterLib.removeEmployeeFromProject(projectAssignments, companyId, employeeId, projectId)) {
      #ok(());
    } else {
      #err("Zuweisung nicht gefunden");
    };
  };

  // --- Projekt-Mitglieder (mit Leistungsart und Stundensatz) ---

  public query ({ caller }) func getProjectMembers(
    projectId : CommonTypes.ProjectId
  ) : async CommonTypes.Result<[MasterTypes.ProjectMemberAssignment]> {
    let companyId = requireMdCompanyId(caller);
    switch (MasterLib.getProjectMembers(projectMembers, companyId, projects, projectId)) {
      case null { #err("Projekt nicht gefunden") };
      case (?members) { #ok(members) };
    };
  };

  public shared ({ caller }) func setProjectMembers(
    projectId : CommonTypes.ProjectId,
    members : [MasterTypes.ProjectMemberAssignment],
  ) : async CommonTypes.Result<()> {
    let companyId = requireMdCompanyId(caller);
    requireMdAdminOrManager(caller, companyId);
    if (MasterLib.setProjectMembers(projectMembers, companyId, projects, projectId, members)) {
      #ok(());
    } else {
      #err("Projekt nicht gefunden");
    };
  };

  // --- Leistungsarten ---

  public query ({ caller }) func listServiceTypes() : async [MasterTypes.ServiceType] {
    let companyId = requireMdCompanyId(caller);
    MasterLib.listServiceTypes(serviceTypes, companyId);
  };

  public shared ({ caller }) func createServiceType(
    input : MasterTypes.CreateServiceTypeInput
  ) : async CommonTypes.Result<MasterTypes.ServiceType> {
    let companyId = requireMdCompanyId(caller);
    requireMdAdminOrManager(caller, companyId);
    let id = nextServiceTypeId.value;
    nextServiceTypeId.value += 1;
    #ok(MasterLib.createServiceType(serviceTypes, id, companyId, input));
  };

  public shared ({ caller }) func updateServiceType(
    id : CommonTypes.ServiceTypeId,
    input : MasterTypes.UpdateServiceTypeInput,
  ) : async CommonTypes.Result<MasterTypes.ServiceType> {
    let companyId = requireMdCompanyId(caller);
    requireMdAdminOrManager(caller, companyId);
    switch (MasterLib.updateServiceType(serviceTypes, companyId, id, input)) {
      case null { #err("Leistungsart nicht gefunden") };
      case (?s) { #ok(s) };
    };
  };

  public shared ({ caller }) func deleteServiceType(
    id : CommonTypes.ServiceTypeId
  ) : async CommonTypes.Result<()> {
    let companyId = requireMdCompanyId(caller);
    requireMdAdminOrManager(caller, companyId);
    if (MasterLib.deleteServiceType(serviceTypes, companyId, id)) {
      #ok(());
    } else {
      #err("Leistungsart nicht gefunden");
    };
  };

  // --- Spesenarten ---

  public query ({ caller }) func listExpenseTypes() : async [MasterTypes.ExpenseType] {
    let companyId = requireMdCompanyId(caller);
    MasterLib.listExpenseTypes(expenseTypes, companyId);
  };

  public shared ({ caller }) func createExpenseType(
    input : MasterTypes.CreateExpenseTypeInput
  ) : async CommonTypes.Result<MasterTypes.ExpenseType> {
    let companyId = requireMdCompanyId(caller);
    requireMdAdminOrManager(caller, companyId);
    let id = nextExpenseTypeId.value;
    nextExpenseTypeId.value += 1;
    #ok(MasterLib.createExpenseType(expenseTypes, id, companyId, input));
  };

  public shared ({ caller }) func updateExpenseType(
    id : CommonTypes.ExpenseTypeId,
    input : MasterTypes.UpdateExpenseTypeInput,
  ) : async CommonTypes.Result<MasterTypes.ExpenseType> {
    let companyId = requireMdCompanyId(caller);
    requireMdAdminOrManager(caller, companyId);
    switch (MasterLib.updateExpenseType(expenseTypes, companyId, id, input)) {
      case null { #err("Spesenart nicht gefunden") };
      case (?e) { #ok(e) };
    };
  };

  public shared ({ caller }) func deleteExpenseType(
    id : CommonTypes.ExpenseTypeId
  ) : async CommonTypes.Result<()> {
    let companyId = requireMdCompanyId(caller);
    requireMdAdminOrManager(caller, companyId);
    if (MasterLib.deleteExpenseType(expenseTypes, companyId, id)) {
      #ok(());
    } else {
      #err("Spesenart nicht gefunden");
    };
  };

  // --- Abwesenheitsarten ---

  public query ({ caller }) func listAbsenceTypes() : async [MasterTypes.AbsenceType] {
    let companyId = requireMdCompanyId(caller);
    MasterLib.listAbsenceTypes(absenceTypes, companyId);
  };

  public shared ({ caller }) func createAbsenceType(
    input : MasterTypes.CreateAbsenceTypeInput
  ) : async CommonTypes.Result<MasterTypes.AbsenceType> {
    let companyId = requireMdCompanyId(caller);
    requireMdAdminOrManager(caller, companyId);
    let id = nextAbsenceTypeId.value;
    nextAbsenceTypeId.value += 1;
    #ok(MasterLib.createAbsenceType(absenceTypes, id, companyId, input));
  };

  public shared ({ caller }) func updateAbsenceType(
    id : CommonTypes.AbsenceTypeId,
    input : MasterTypes.UpdateAbsenceTypeInput,
  ) : async CommonTypes.Result<MasterTypes.AbsenceType> {
    let companyId = requireMdCompanyId(caller);
    requireMdAdminOrManager(caller, companyId);
    switch (MasterLib.updateAbsenceType(absenceTypes, companyId, id, input)) {
      case (#err(msg)) { #err(msg) };
      case (#ok(a)) { #ok(a) };
    };
  };

  public shared ({ caller }) func deleteAbsenceType(
    id : CommonTypes.AbsenceTypeId
  ) : async CommonTypes.Result<()> {
    let companyId = requireMdCompanyId(caller);
    requireMdAdminOrManager(caller, companyId);
    switch (MasterLib.deleteAbsenceType(absenceTypes, companyId, id)) {
      case (#err(msg)) { #err(msg) };
      case (#ok(())) { #ok(()) };
    };
  };

  // --- Feiertage ---

  public query ({ caller }) func listHolidays() : async [MasterTypes.Holiday] {
    let companyId = requireMdCompanyId(caller);
    MasterLib.listHolidays(holidays, companyId);
  };

  public shared ({ caller }) func createHoliday(
    input : MasterTypes.CreateHolidayInput
  ) : async CommonTypes.Result<MasterTypes.Holiday> {
    let companyId = requireMdCompanyId(caller);
    requireMdAdminOrManager(caller, companyId);
    let id = nextHolidayId.value;
    nextHolidayId.value += 1;
    #ok(MasterLib.createHoliday(holidays, id, companyId, input));
  };

  public shared ({ caller }) func updateHoliday(
    id : CommonTypes.HolidayId,
    input : MasterTypes.UpdateHolidayInput,
  ) : async CommonTypes.Result<MasterTypes.Holiday> {
    let companyId = requireMdCompanyId(caller);
    requireMdAdminOrManager(caller, companyId);
    switch (MasterLib.updateHoliday(holidays, companyId, id, input)) {
      case null { #err("Feiertag nicht gefunden") };
      case (?h) { #ok(h) };
    };
  };

  public shared ({ caller }) func deleteHoliday(
    id : CommonTypes.HolidayId
  ) : async CommonTypes.Result<()> {
    let companyId = requireMdCompanyId(caller);
    requireMdAdminOrManager(caller, companyId);
    if (MasterLib.deleteHoliday(holidays, companyId, id)) {
      #ok(());
    } else {
      #err("Feiertag nicht gefunden");
    };
  };

  // --- Standardarbeitszeiten ---

  // Eigene Standardarbeitszeiten abrufen (jeder authentifizierte Mitarbeiter)
  public query ({ caller }) func getMyStandardarbeitszeiten() : async CommonTypes.Result<MasterTypes.Standardarbeitszeiten> {
    let companyId = requireMdCompanyId(caller);
    let employeeId = switch (principalToEmployee.get(caller)) {
      case null { Runtime.trap("Mitarbeiter nicht gefunden") };
      case (?eid) eid;
    };
    #ok(MasterLib.getStandardarbeitszeiten(standardHours, companyId, employeeId));
  };

  // Eigene Standardarbeitszeiten speichern (jeder authentifizierte Mitarbeiter)
  public shared ({ caller }) func setMyStandardarbeitszeiten(
    data : MasterTypes.Standardarbeitszeiten
  ) : async CommonTypes.Result<()> {
    let companyId = requireMdCompanyId(caller);
    let employeeId = switch (principalToEmployee.get(caller)) {
      case null { Runtime.trap("Mitarbeiter nicht gefunden") };
      case (?eid) eid;
    };
    MasterLib.setStandardarbeitszeiten(standardHours, companyId, employeeId, data);
    #ok(());
  };

  // Standardarbeitszeiten eines bestimmten Mitarbeiters abrufen (Admin/Manager)
  public query ({ caller }) func getStandardarbeitszeitenForEmployee(
    employeeId : CommonTypes.EmployeeId
  ) : async CommonTypes.Result<MasterTypes.Standardarbeitszeiten> {
    let companyId = requireMdCompanyId(caller);
    requireMdAdminOrManager(caller, companyId);
    #ok(MasterLib.getStandardarbeitszeiten(standardHours, companyId, employeeId));
  };

  // Standardarbeitszeiten eines bestimmten Mitarbeiters speichern (Admin/Manager)
  public shared ({ caller }) func setStandardarbeitszeitenForEmployee(
    employeeId : CommonTypes.EmployeeId,
    data : MasterTypes.Standardarbeitszeiten,
  ) : async CommonTypes.Result<()> {
    let companyId = requireMdCompanyId(caller);
    requireMdAdminOrManager(caller, companyId);
    MasterLib.setStandardarbeitszeiten(standardHours, companyId, employeeId, data);
    #ok(());
  };
};
