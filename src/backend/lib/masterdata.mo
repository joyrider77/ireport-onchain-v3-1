// Domänenlogik für Stammdaten (Kunden, Projekte, Leistungsarten, etc.)
import List "mo:core/List";
import Map "mo:core/Map";
import Order "mo:core/Order";
import Nat "mo:core/Nat";
import CommonTypes "../types/common";
import MasterTypes "../types/masterdata";

module {
  public type CompanyId = CommonTypes.CompanyId;
  public type CustomerId = CommonTypes.CustomerId;
  public type ProjectId = CommonTypes.ProjectId;
  public type ServiceTypeId = CommonTypes.ServiceTypeId;
  public type ExpenseTypeId = CommonTypes.ExpenseTypeId;
  public type AbsenceTypeId = CommonTypes.AbsenceTypeId;
  public type HolidayId = CommonTypes.HolidayId;
  public type EmployeeId = CommonTypes.EmployeeId;

  // Vergleichsfunktion für (CompanyId, EmployeeId)-Schlüssel
  public func compareCompanyEmployee(a : (CompanyId, EmployeeId), b : (CompanyId, EmployeeId)) : Order.Order {
    let cmp = Nat.compare(a.0, b.0);
    switch (cmp) {
      case (#equal) { Nat.compare(a.1, b.1) };
      case other { other };
    };
  };

  // --- Kunden ---

  public func listCustomers(
    customers : List.List<MasterTypes.Customer>,
    companyId : CompanyId,
  ) : [MasterTypes.Customer] {
    customers.filter(func(c) { c.companyId == companyId }).toArray();
  };

  public func createCustomer(
    customers : List.List<MasterTypes.Customer>,
    nextId : Nat,
    companyId : CompanyId,
    input : MasterTypes.CreateCustomerInput,
  ) : MasterTypes.Customer {
    let customer : MasterTypes.Customer = {
      id = nextId;
      companyId;
      name = input.name;
      contact = input.contact;
      notes = input.notes;
      beschreibung = input.beschreibung;
      kundennummer = input.kundennummer;
      rechnungsadresse = input.rechnungsadresse;
      zeiterfassungsart = switch (input.zeiterfassungsart) { case (?v) v; case null #stuendlich };
      waehrung = switch (input.waehrung) { case (?v) v; case null "CHF" };
      aktiv = switch (input.aktiv) { case (?v) v; case null true };
    };
    customers.add(customer);
    customer;
  };

  public func updateCustomer(
    customers : List.List<MasterTypes.Customer>,
    companyId : CompanyId,
    customerId : CustomerId,
    input : MasterTypes.UpdateCustomerInput,
  ) : ?MasterTypes.Customer {
    var result : ?MasterTypes.Customer = null;
    customers.mapInPlace(func(c) {
      if (c.id == customerId and c.companyId == companyId) {
        let updated : MasterTypes.Customer = {
          c with
          name = switch (input.name) { case (?v) v; case null c.name };
          contact = switch (input.contact) { case (?v) ?v; case null c.contact };
          notes = switch (input.notes) { case (?v) ?v; case null c.notes };
          beschreibung = switch (input.beschreibung) { case (?v) ?v; case null c.beschreibung };
          kundennummer = switch (input.kundennummer) { case (?v) ?v; case null c.kundennummer };
          rechnungsadresse = switch (input.rechnungsadresse) { case (?v) ?v; case null c.rechnungsadresse };
          zeiterfassungsart = switch (input.zeiterfassungsart) { case (?v) v; case null c.zeiterfassungsart };
          waehrung = switch (input.waehrung) { case (?v) v; case null c.waehrung };
          aktiv = switch (input.aktiv) { case (?v) v; case null c.aktiv };
        };
        result := ?updated;
        updated;
      } else { c };
    });
    result;
  };

  public func deleteCustomer(
    customers : List.List<MasterTypes.Customer>,
    companyId : CompanyId,
    customerId : CustomerId,
  ) : Bool {
    let before = customers.size();
    let filtered = customers.filter(func(c) { not (c.id == customerId and c.companyId == companyId) });
    customers.clear();
    customers.append(filtered);
    customers.size() < before;
  };

  // --- Projekte ---

  public func listProjects(
    projects : List.List<MasterTypes.Project>,
    companyId : CompanyId,
  ) : [MasterTypes.Project] {
    projects.filter(func(p) { p.companyId == companyId }).toArray();
  };

  public func createProject(
    projects : List.List<MasterTypes.Project>,
    nextId : Nat,
    companyId : CompanyId,
    input : MasterTypes.CreateProjectInput,
  ) : MasterTypes.Project {
    let project : MasterTypes.Project = {
      id = nextId;
      companyId;
      customerId = input.customerId;
      name = input.name;
      kurzbezeichnung = input.kurzbezeichnung;
      code = input.code;
      billableRate = input.billableRate;
      active = true;
      projektleiter = input.projektleiter;
      status = switch (input.status) { case (?s) s; case null #aktiv };
      erfassungsart = input.erfassungsart;
    };
    projects.add(project);
    project;
  };

  public func updateProject(
    projects : List.List<MasterTypes.Project>,
    companyId : CompanyId,
    projectId : ProjectId,
    input : MasterTypes.UpdateProjectInput,
  ) : ?MasterTypes.Project {
    var result : ?MasterTypes.Project = null;
    projects.mapInPlace(func(p) {
      if (p.id == projectId and p.companyId == companyId) {
        let updated : MasterTypes.Project = {
          p with
          customerId = switch (input.customerId) { case (?v) v; case null p.customerId };
          name = switch (input.name) { case (?v) v; case null p.name };
          kurzbezeichnung = switch (input.kurzbezeichnung) { case (?v) v; case null p.kurzbezeichnung };
          code = switch (input.code) { case (?v) v; case null p.code };
          billableRate = switch (input.billableRate) { case (?v) v; case null p.billableRate };
          active = switch (input.active) { case (?v) v; case null p.active };
          projektleiter = switch (input.projektleiter) { case (?v) ?v; case null p.projektleiter };
          status = switch (input.status) { case (?v) v; case null p.status };
          erfassungsart = switch (input.erfassungsart) { case (?v) ?v; case null p.erfassungsart };
        };
        result := ?updated;
        updated;
      } else { p };
    });
    result;
  };

  public func deleteProject(
    projects : List.List<MasterTypes.Project>,
    companyId : CompanyId,
    projectId : ProjectId,
  ) : Bool {
    let before = projects.size();
    let filtered = projects.filter(func(p) { not (p.id == projectId and p.companyId == companyId) });
    projects.clear();
    projects.append(filtered);
    projects.size() < before;
  };

  // --- Projektzuweisungen ---

  public func listProjectAssignments(
    assignments : List.List<MasterTypes.ProjectAssignment>,
    companyId : CompanyId,
  ) : [MasterTypes.ProjectAssignment] {
    assignments.filter(func(a) { a.companyId == companyId }).toArray();
  };

  public func assignEmployeeToProject(
    assignments : List.List<MasterTypes.ProjectAssignment>,
    companyId : CompanyId,
    employeeId : EmployeeId,
    projectId : ProjectId,
  ) : MasterTypes.ProjectAssignment {
    // Doppelte Zuweisungen vermeiden
    let existing = assignments.find(func(a) {
      a.companyId == companyId and a.employeeId == employeeId and a.projectId == projectId
    });
    switch (existing) {
      case (?a) { a };
      case null {
        let assignment : MasterTypes.ProjectAssignment = {
          employeeId;
          projectId;
          companyId;
        };
        assignments.add(assignment);
        assignment;
      };
    };
  };

  public func removeEmployeeFromProject(
    assignments : List.List<MasterTypes.ProjectAssignment>,
    companyId : CompanyId,
    employeeId : EmployeeId,
    projectId : ProjectId,
  ) : Bool {
    let before = assignments.size();
    let filtered = assignments.filter(func(a) {
      not (a.companyId == companyId and a.employeeId == employeeId and a.projectId == projectId)
    });
    assignments.clear();
    assignments.append(filtered);
    assignments.size() < before;
  };

  // --- Projekt-Mitglieder-Zuweisungen (Mitarbeiter + Leistungsart + Stundensatz) ---

  public func getProjectMembers(
    projectMembers : Map.Map<ProjectId, [MasterTypes.ProjectMemberAssignment]>,
    companyId : CompanyId,
    projects : List.List<MasterTypes.Project>,
    projectId : ProjectId,
  ) : ?[MasterTypes.ProjectMemberAssignment] {
    // Sicherstellen, dass das Projekt zur Firma gehört
    let projectExists = projects.find(func(p) { p.id == projectId and p.companyId == companyId });
    switch (projectExists) {
      case null { null };
      case (?_) {
        switch (projectMembers.get(projectId)) {
          case (?members) { ?members };
          case null { ?[] };
        };
      };
    };
  };

  public func setProjectMembers(
    projectMembers : Map.Map<ProjectId, [MasterTypes.ProjectMemberAssignment]>,
    companyId : CompanyId,
    projects : List.List<MasterTypes.Project>,
    projectId : ProjectId,
    members : [MasterTypes.ProjectMemberAssignment],
  ) : Bool {
    // Sicherstellen, dass das Projekt zur Firma gehört
    let projectExists = projects.find(func(p) { p.id == projectId and p.companyId == companyId });
    switch (projectExists) {
      case null { false };
      case (?_) {
        projectMembers.add(projectId, members);
        true;
      };
    };
  };

  // --- Leistungsarten ---

  public func listServiceTypes(
    serviceTypes : List.List<MasterTypes.ServiceType>,
    companyId : CompanyId,
  ) : [MasterTypes.ServiceType] {
    serviceTypes.filter(func(s) { s.companyId == companyId }).toArray();
  };

  public func createServiceType(
    serviceTypes : List.List<MasterTypes.ServiceType>,
    nextId : Nat,
    companyId : CompanyId,
    input : MasterTypes.CreateServiceTypeInput,
  ) : MasterTypes.ServiceType {
    let st : MasterTypes.ServiceType = {
      id = nextId;
      companyId;
      name = input.name;
      billable = input.billable;
      defaultRate = input.defaultRate;
      aktiv = switch (input.aktiv) { case (?v) v; case null true };
    };
    serviceTypes.add(st);
    st;
  };

  public func updateServiceType(
    serviceTypes : List.List<MasterTypes.ServiceType>,
    companyId : CompanyId,
    serviceTypeId : ServiceTypeId,
    input : MasterTypes.UpdateServiceTypeInput,
  ) : ?MasterTypes.ServiceType {
    var result : ?MasterTypes.ServiceType = null;
    serviceTypes.mapInPlace(func(s) {
      if (s.id == serviceTypeId and s.companyId == companyId) {
        let updated : MasterTypes.ServiceType = {
          s with
          name = switch (input.name) { case (?v) v; case null s.name };
          billable = switch (input.billable) { case (?v) v; case null s.billable };
          defaultRate = switch (input.defaultRate) { case (?v) v; case null s.defaultRate };
          aktiv = switch (input.aktiv) { case (?v) v; case null s.aktiv };
        };
        result := ?updated;
        updated;
      } else { s };
    });
    result;
  };

  public func deleteServiceType(
    serviceTypes : List.List<MasterTypes.ServiceType>,
    companyId : CompanyId,
    serviceTypeId : ServiceTypeId,
  ) : Bool {
    let before = serviceTypes.size();
    let filtered = serviceTypes.filter(func(s) { not (s.id == serviceTypeId and s.companyId == companyId) });
    serviceTypes.clear();
    serviceTypes.append(filtered);
    serviceTypes.size() < before;
  };

  // --- Spesenarten ---

  public func listExpenseTypes(
    expenseTypes : List.List<MasterTypes.ExpenseType>,
    companyId : CompanyId,
  ) : [MasterTypes.ExpenseType] {
    expenseTypes.filter(func(e) { e.companyId == companyId }).toArray();
  };

  public func createExpenseType(
    expenseTypes : List.List<MasterTypes.ExpenseType>,
    nextId : Nat,
    companyId : CompanyId,
    input : MasterTypes.CreateExpenseTypeInput,
  ) : MasterTypes.ExpenseType {
    let et : MasterTypes.ExpenseType = {
      id = nextId;
      companyId;
      name = input.name;
      billable = input.billable;
      reimbursable = input.reimbursable;
      aktiv = switch (input.aktiv) { case (?v) v; case null true };
    };
    expenseTypes.add(et);
    et;
  };

  public func updateExpenseType(
    expenseTypes : List.List<MasterTypes.ExpenseType>,
    companyId : CompanyId,
    expenseTypeId : ExpenseTypeId,
    input : MasterTypes.UpdateExpenseTypeInput,
  ) : ?MasterTypes.ExpenseType {
    var result : ?MasterTypes.ExpenseType = null;
    expenseTypes.mapInPlace(func(e) {
      if (e.id == expenseTypeId and e.companyId == companyId) {
        let updated : MasterTypes.ExpenseType = {
          e with
          name = switch (input.name) { case (?v) v; case null e.name };
          billable = switch (input.billable) { case (?v) v; case null e.billable };
          reimbursable = switch (input.reimbursable) { case (?v) v; case null e.reimbursable };
          aktiv = switch (input.aktiv) { case (?v) v; case null e.aktiv };
        };
        result := ?updated;
        updated;
      } else { e };
    });
    result;
  };

  public func deleteExpenseType(
    expenseTypes : List.List<MasterTypes.ExpenseType>,
    companyId : CompanyId,
    expenseTypeId : ExpenseTypeId,
  ) : Bool {
    let before = expenseTypes.size();
    let filtered = expenseTypes.filter(func(e) { not (e.id == expenseTypeId and e.companyId == companyId) });
    expenseTypes.clear();
    expenseTypes.append(filtered);
    expenseTypes.size() < before;
  };

  // --- Abwesenheitsarten ---

  public func listAbsenceTypes(
    absenceTypes : List.List<MasterTypes.AbsenceType>,
    companyId : CompanyId,
  ) : [MasterTypes.AbsenceType] {
    absenceTypes.filter(func(a) { a.companyId == companyId }).toArray();
  };

  public func createAbsenceType(
    absenceTypes : List.List<MasterTypes.AbsenceType>,
    nextId : Nat,
    companyId : CompanyId,
    input : MasterTypes.CreateAbsenceTypeInput,
  ) : MasterTypes.AbsenceType {
    let at : MasterTypes.AbsenceType = {
      id = nextId;
      companyId;
      name = input.name;
      requiresApproval = input.requiresApproval;
      compensated = input.compensated;
      aktiv = switch (input.aktiv) { case (?v) v; case null true };
    };
    absenceTypes.add(at);
    at;
  };

  // Prüft ob eine AbsenceType der systemverwaltete 'Ferien'-Typ ist (unveränderlich / undeletable)
  public func isFerienType(at : MasterTypes.AbsenceType) : Bool {
    at.name == "Ferien" or (at.requiresApproval and at.compensated)
  };

  public func updateAbsenceType(
    absenceTypes : List.List<MasterTypes.AbsenceType>,
    companyId : CompanyId,
    absenceTypeId : AbsenceTypeId,
    input : MasterTypes.UpdateAbsenceTypeInput,
  ) : { #ok : MasterTypes.AbsenceType; #err : Text } {
    var result : ?MasterTypes.AbsenceType = null;
    absenceTypes.mapInPlace(func(a) {
      if (a.id == absenceTypeId and a.companyId == companyId) {
        let updated : MasterTypes.AbsenceType = if (isFerienType(a)) {
          // Ferien-Typ: nur requiresApproval darf geändert werden; alle anderen Werte unveränderlich
          { a with
            requiresApproval = switch (input.requiresApproval) { case (?v) v; case null a.requiresApproval };
          }
        } else {
          { a with
            name = switch (input.name) { case (?v) v; case null a.name };
            requiresApproval = switch (input.requiresApproval) { case (?v) v; case null a.requiresApproval };
            compensated = switch (input.compensated) { case (?v) v; case null a.compensated };
            aktiv = switch (input.aktiv) { case (?v) v; case null a.aktiv };
          }
        };
        result := ?updated;
        updated;
      } else { a };
    });
    switch (result) {
      case null { #err("Abwesenheitsart nicht gefunden") };
      case (?at) { #ok(at) };
    };
  };

  public func deleteAbsenceType(
    absenceTypes : List.List<MasterTypes.AbsenceType>,
    companyId : CompanyId,
    absenceTypeId : AbsenceTypeId,
  ) : { #ok : (); #err : Text } {
    // Ferien-Typ darf nicht gelöscht werden
    let found = absenceTypes.find(func(a) { a.id == absenceTypeId and a.companyId == companyId });
    switch (found) {
      case null { return #err("Abwesenheitsart nicht gefunden") };
      case (?at) {
        if (isFerienType(at)) {
          return #err("Die Abwesenheitsart 'Ferien' kann nicht gelöscht werden");
        };
      };
    };
    let before = absenceTypes.size();
    let filtered = absenceTypes.filter(func(a) { not (a.id == absenceTypeId and a.companyId == companyId) });
    absenceTypes.clear();
    absenceTypes.append(filtered);
    if (absenceTypes.size() < before) { #ok(()) } else { #err("Abwesenheitsart nicht gefunden") };
  };

  // --- Feiertage ---

  public func listHolidays(
    holidays : List.List<MasterTypes.Holiday>,
    companyId : CompanyId,
  ) : [MasterTypes.Holiday] {
    holidays.filter(func(h) { h.companyId == companyId }).toArray();
  };

  public func createHoliday(
    holidays : List.List<MasterTypes.Holiday>,
    nextId : Nat,
    companyId : CompanyId,
    input : MasterTypes.CreateHolidayInput,
  ) : MasterTypes.Holiday {
    let holiday : MasterTypes.Holiday = {
      id = nextId;
      companyId;
      name = input.name;
      date = input.date;
      ganztaegig = switch (input.ganztaegig) { case (?v) v; case null true };
    };
    holidays.add(holiday);
    holiday;
  };

  public func updateHoliday(
    holidays : List.List<MasterTypes.Holiday>,
    companyId : CompanyId,
    holidayId : HolidayId,
    input : MasterTypes.UpdateHolidayInput,
  ) : ?MasterTypes.Holiday {
    var result : ?MasterTypes.Holiday = null;
    holidays.mapInPlace(func(h) {
      if (h.id == holidayId and h.companyId == companyId) {
        let updated : MasterTypes.Holiday = {
          h with
          name = switch (input.name) { case (?v) v; case null h.name };
          date = switch (input.date) { case (?v) v; case null h.date };
          ganztaegig = switch (input.ganztaegig) { case (?v) v; case null h.ganztaegig };
        };
        result := ?updated;
        updated;
      } else { h };
    });
    result;
  };

  public func deleteHoliday(
    holidays : List.List<MasterTypes.Holiday>,
    companyId : CompanyId,
    holidayId : HolidayId,
  ) : Bool {
    let before = holidays.size();
    let filtered = holidays.filter(func(h) { not (h.id == holidayId and h.companyId == companyId) });
    holidays.clear();
    holidays.append(filtered);
    holidays.size() < before;
  };

  // --- Standardarbeitszeiten ---

  public let emptyStandardarbeitszeiten : MasterTypes.Standardarbeitszeiten = {
    monday = []; tuesday = []; wednesday = [];
    thursday = []; friday = []; saturday = []; sunday = [];
  };

  public func getStandardarbeitszeiten(
    standardHours : Map.Map<(CompanyId, EmployeeId), MasterTypes.Standardarbeitszeiten>,
    companyId : CompanyId,
    employeeId : EmployeeId,
  ) : MasterTypes.Standardarbeitszeiten {
    switch (standardHours.get(compareCompanyEmployee, (companyId, employeeId))) {
      case (?s) s;
      case null emptyStandardarbeitszeiten;
    };
  };

  public func setStandardarbeitszeiten(
    standardHours : Map.Map<(CompanyId, EmployeeId), MasterTypes.Standardarbeitszeiten>,
    companyId : CompanyId,
    employeeId : EmployeeId,
    data : MasterTypes.Standardarbeitszeiten,
  ) {
    standardHours.add(compareCompanyEmployee, (companyId, employeeId), data);
  };
};
