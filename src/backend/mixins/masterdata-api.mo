// Öffentliche API für Stammdatenverwaltung
import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import AccessControl "mo:caffeineai-authorization/access-control";
import CommonTypes "../types/common";
import CompanyTypes "../types/company";
import MasterTypes "../types/masterdata";
import AuditTypes "../types/audit";
import MasterLib "../lib/masterdata";
import AccessControlLib "../lib/AccessControlLib";
import TrackingTypes "../types/timetracking";

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
  // Audit-Log für CRUD-Operationen (append-only)
  auditLogEntries : List.List<AuditTypes.AuditLogEntry>,
  nextAuditLogId : { var value : Nat },
  // Zeiteinträge für Aufwendungsberechnung
  timeEntries : List.List<TrackingTypes.TimeEntry>,
) {
  // Hilfsfunktion: Authentifizierung prüfen
  private func requireMdCompanyId(caller : Principal) : CommonTypes.CompanyId {
    switch (principalToCompany.get(caller)) {
      case null { Runtime.trap("Nicht authentifiziert") };
      case (?cid) cid;
    };
  };

  // Hilfsfunktion: Admin/Manager-Rolle prüfen (delegiert an AccessControlLib)
  private func requireMdAdminOrManager(caller : Principal, companyId : CommonTypes.CompanyId) : () {
    let company = switch (companies.find(func(c : CompanyTypes.Company) : Bool = c.id == companyId)) {
      case null { Runtime.trap("Firma nicht gefunden") };
      case (?c) c;
    };
    switch (AccessControlLib.requireRole(caller, company, [#admin, #manager], principalToEmployee, employees)) {
      case (#err(msg)) { Runtime.trap(msg) };
      case (#ok(_)) {};
    };
  };

  // Hilfsfunktion: Feiertag als lesbaren Text serialisieren (für Audit-Log)
  private func holidayToText(h : MasterTypes.Holiday) : Text {
    "id=" # h.id.toText() # " name=" # h.name # " date=" # h.date
    # " ganztaegig=" # (if (h.ganztaegig) "true" else "false");
  };

  // Serialisierungs-Hilfsfunktionen für Audit-Log
  private func customerToText(c : MasterTypes.Customer) : Text {
    "id=" # c.id.toText() # " name=" # c.name
    # " kundennummer=" # (switch (c.kundennummer) { case (?v) v; case null "" })
    # " aktiv=" # (if (c.aktiv) "true" else "false");
  };

  private func projectToText(p : MasterTypes.Project) : Text {
    "id=" # p.id.toText() # " name=" # p.name
    # " kurzbezeichnung=" # p.kurzbezeichnung
    # " status=" # (switch (p.status) { case (#aktiv) "aktiv"; case (#inaktiv) "inaktiv"; case (#abgeschlossen) "abgeschlossen" })
    # " kostendachCHF=" # (switch (p.kostendachCHF) { case (?v) v.toText(); case null "" });
  };

  private func serviceTypeToText(s : MasterTypes.ServiceType) : Text {
    "id=" # s.id.toText() # " name=" # s.name
    # " defaultRate=" # s.defaultRate.toText()
    # " aktiv=" # (if (s.aktiv) "true" else "false");
  };

  private func expenseTypeToText(e : MasterTypes.ExpenseType) : Text {
    "id=" # e.id.toText() # " name=" # e.name
    # " billable=" # (if (e.billable) "true" else "false")
    # " reimbursable=" # (if (e.reimbursable) "true" else "false")
    # " aktiv=" # (if (e.aktiv) "true" else "false");
  };

  private func absenceTypeToText(a : MasterTypes.AbsenceType) : Text {
    let visText = switch (a.visibility) {
      case null { "visibility=null" };
      case (?v) {
        "visibility.visibleInCompanyCalendar=" # (if (v.visibleInCompanyCalendar) "true" else "false")
        # " visibility.visibilityMode=" # (switch (v.visibilityMode) {
          case (#full) "full";
          case (#masked_reason) "masked_reason";
          case (#anonymized) "anonymized";
          case (#hidden) "hidden";
        })
        # " visibility.visibleForRoles=" # debug_show(v.visibleForRoles)
        # " visibility.companyCalendarDisplayName=" # debug_show(v.companyCalendarDisplayName)
        # " visibility.showEmployeeName=" # (if (v.showEmployeeName) "true" else "false")
        # " visibility.showAbsenceTypeName=" # (if (v.showAbsenceTypeName) "true" else "false")
        # " visibility.showComment=" # (if (v.showComment) "true" else "false");
      };
    };
    "id=" # a.id.toText() # " name=" # a.name
    # " requiresApproval=" # (if (a.requiresApproval) "true" else "false")
    # " compensated=" # (if (a.compensated) "true" else "false")
    # " aktiv=" # (if (a.aktiv) "true" else "false")
    # " " # visText;
  };

  // Hilfsfunktion: Name des Aufrufers ermitteln (für Audit-Log)
  private func callerName(caller : Principal, companyId : CommonTypes.CompanyId) : Text {
    switch (principalToEmployee.get(caller)) {
      case null { caller.toText() };
      case (?empId) {
        switch (employees.find(func(e) { e.id == empId and e.companyId == companyId })) {
          case null { caller.toText() };
          case (?e) { e.firstName # " " # e.lastName };
        };
      };
    };
  };

  // Hilfsfunktion: Audit-Log-Eintrag für Feiertag anhängen
  private func appendHolidayAudit(
    caller      : Principal,
    companyId   : CommonTypes.CompanyId,
    operation   : AuditTypes.AuditOperation,
    entityId    : Text,
    beforeState : ?Text,
    afterState  : ?Text,
  ) {
    appendAuditWithChanges(caller, companyId, #holiday, operation, entityId, beforeState, afterState, null);
  };

  // Generische Hilfsfunktion: Audit-Log-Eintrag anhängen (mit optionalen Feldänderungen)
  private func appendAuditWithChanges(
    caller       : Principal,
    companyId    : CommonTypes.CompanyId,
    entityType   : AuditTypes.AuditEntityType,
    operation    : AuditTypes.AuditOperation,
    entityId     : Text,
    beforeState  : ?Text,
    afterState   : ?Text,
    fieldChanges : ?[AuditTypes.AuditFieldChange],
  ) {
    let id = "AL-" # nextAuditLogId.value.toText();
    nextAuditLogId.value += 1;
    let entry : AuditTypes.AuditLogEntry = {
      id;
      companyId;
      timestamp   = Time.now();
      operation;
      entityType;
      entityId;
      actorPrincipal = caller.toText();
      actorName   = callerName(caller, companyId);
      beforeState;
      afterState;
      fieldChanges;
    };
    auditLogEntries.add(entry);
  };

  private func appendAudit(
    caller      : Principal,
    companyId   : CommonTypes.CompanyId,
    entityType  : AuditTypes.AuditEntityType,
    operation   : AuditTypes.AuditOperation,
    entityId    : Text,
    beforeState : ?Text,
    afterState  : ?Text,
  ) {
    appendAuditWithChanges(caller, companyId, entityType, operation, entityId, beforeState, afterState, null);
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
    let c = MasterLib.createCustomer(customers, id, companyId, input);
    appendAudit(caller, companyId, #customer, #create, c.id.toText(), null, ?customerToText(c));
    #ok(c);
  };

  public shared ({ caller }) func updateCustomer(
    id : CommonTypes.CustomerId,
    input : MasterTypes.UpdateCustomerInput,
  ) : async CommonTypes.Result<MasterTypes.Customer> {
    let companyId = requireMdCompanyId(caller);
    requireMdAdminOrManager(caller, companyId);
    let beforeOpt = customers.find(func(c) { c.id == id and c.companyId == companyId });
    switch (MasterLib.updateCustomer(customers, companyId, id, input)) {
      case null { #err("Kunde nicht gefunden") };
      case (?c) {
        let beforeText = switch (beforeOpt) { case null { null }; case (?b) { ?customerToText(b) } };
        appendAudit(caller, companyId, #customer, #update, c.id.toText(), beforeText, ?customerToText(c));
        #ok(c);
      };
    };
  };

  public shared ({ caller }) func deleteCustomer(
    id : CommonTypes.CustomerId
  ) : async CommonTypes.Result<()> {
    let companyId = requireMdCompanyId(caller);
    requireMdAdminOrManager(caller, companyId);
    let beforeOpt = customers.find(func(c) { c.id == id and c.companyId == companyId });
    if (MasterLib.deleteCustomer(customers, companyId, id)) {
      let beforeText = switch (beforeOpt) { case null { null }; case (?b) { ?customerToText(b) } };
      appendAudit(caller, companyId, #customer, #remove, id.toText(), beforeText, null);
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
    let p = MasterLib.createProject(projects, id, companyId, input);
    appendAudit(caller, companyId, #project, #create, p.id.toText(), null, ?projectToText(p));
    #ok(p);
  };

  public shared ({ caller }) func updateProject(
    id : CommonTypes.ProjectId,
    input : MasterTypes.UpdateProjectInput,
  ) : async CommonTypes.Result<MasterTypes.Project> {
    let companyId = requireMdCompanyId(caller);
    requireMdAdminOrManager(caller, companyId);
    let beforeOpt = projects.find(func(p) { p.id == id and p.companyId == companyId });
    switch (MasterLib.updateProject(projects, companyId, id, input)) {
      case null { #err("Projekt nicht gefunden") };
      case (?p) {
        let beforeText = switch (beforeOpt) { case null { null }; case (?b) { ?projectToText(b) } };
        appendAudit(caller, companyId, #project, #update, p.id.toText(), beforeText, ?projectToText(p));
        #ok(p);
      };
    };
  };

  public shared ({ caller }) func deleteProject(
    id : CommonTypes.ProjectId
  ) : async CommonTypes.Result<()> {
    let companyId = requireMdCompanyId(caller);
    requireMdAdminOrManager(caller, companyId);
    let beforeOpt = projects.find(func(p) { p.id == id and p.companyId == companyId });
    if (MasterLib.deleteProject(projects, companyId, id)) {
      let beforeText = switch (beforeOpt) { case null { null }; case (?b) { ?projectToText(b) } };
      appendAudit(caller, companyId, #project, #remove, id.toText(), beforeText, null);
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
    let s = MasterLib.createServiceType(serviceTypes, id, companyId, input);
    appendAudit(caller, companyId, #serviceType, #create, s.id.toText(), null, ?serviceTypeToText(s));
    #ok(s);
  };

  public shared ({ caller }) func updateServiceType(
    id : CommonTypes.ServiceTypeId,
    input : MasterTypes.UpdateServiceTypeInput,
  ) : async CommonTypes.Result<MasterTypes.ServiceType> {
    let companyId = requireMdCompanyId(caller);
    requireMdAdminOrManager(caller, companyId);
    let beforeOpt = serviceTypes.find(func(s) { s.id == id and s.companyId == companyId });
    switch (MasterLib.updateServiceType(serviceTypes, companyId, id, input)) {
      case null { #err("Leistungsart nicht gefunden") };
      case (?s) {
        let beforeText = switch (beforeOpt) { case null { null }; case (?b) { ?serviceTypeToText(b) } };
        appendAudit(caller, companyId, #serviceType, #update, s.id.toText(), beforeText, ?serviceTypeToText(s));
        #ok(s);
      };
    };
  };

  public shared ({ caller }) func deleteServiceType(
    id : CommonTypes.ServiceTypeId
  ) : async CommonTypes.Result<()> {
    let companyId = requireMdCompanyId(caller);
    requireMdAdminOrManager(caller, companyId);
    let beforeOpt = serviceTypes.find(func(s) { s.id == id and s.companyId == companyId });
    if (MasterLib.deleteServiceType(serviceTypes, companyId, id)) {
      let beforeText = switch (beforeOpt) { case null { null }; case (?b) { ?serviceTypeToText(b) } };
      appendAudit(caller, companyId, #serviceType, #remove, id.toText(), beforeText, null);
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
    let e = MasterLib.createExpenseType(expenseTypes, id, companyId, input);
    appendAudit(caller, companyId, #expenseType, #create, e.id.toText(), null, ?expenseTypeToText(e));
    #ok(e);
  };

  public shared ({ caller }) func updateExpenseType(
    id : CommonTypes.ExpenseTypeId,
    input : MasterTypes.UpdateExpenseTypeInput,
  ) : async CommonTypes.Result<MasterTypes.ExpenseType> {
    let companyId = requireMdCompanyId(caller);
    requireMdAdminOrManager(caller, companyId);
    let beforeOpt = expenseTypes.find(func(et) { et.id == id and et.companyId == companyId });
    switch (MasterLib.updateExpenseType(expenseTypes, companyId, id, input)) {
      case null { #err("Spesenart nicht gefunden") };
      case (?e) {
        let beforeText = switch (beforeOpt) { case null { null }; case (?b) { ?expenseTypeToText(b) } };
        appendAudit(caller, companyId, #expenseType, #update, e.id.toText(), beforeText, ?expenseTypeToText(e));
        #ok(e);
      };
    };
  };

  public shared ({ caller }) func deleteExpenseType(
    id : CommonTypes.ExpenseTypeId
  ) : async CommonTypes.Result<()> {
    let companyId = requireMdCompanyId(caller);
    requireMdAdminOrManager(caller, companyId);
    let beforeOpt = expenseTypes.find(func(et) { et.id == id and et.companyId == companyId });
    if (MasterLib.deleteExpenseType(expenseTypes, companyId, id)) {
      let beforeText = switch (beforeOpt) { case null { null }; case (?b) { ?expenseTypeToText(b) } };
      appendAudit(caller, companyId, #expenseType, #remove, id.toText(), beforeText, null);
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
    let a = MasterLib.createAbsenceType(absenceTypes, id, companyId, input);
    appendAudit(caller, companyId, #absenceType, #create, a.id.toText(), null, ?absenceTypeToText(a));
    #ok(a);
  };

  public shared ({ caller }) func updateAbsenceType(
    id : CommonTypes.AbsenceTypeId,
    input : MasterTypes.UpdateAbsenceTypeInput,
  ) : async CommonTypes.Result<MasterTypes.AbsenceType> {
    let companyId = requireMdCompanyId(caller);
    requireMdAdminOrManager(caller, companyId);
    let beforeOpt = absenceTypes.find(func(a) { a.id == id and a.companyId == companyId });
    switch (MasterLib.updateAbsenceType(absenceTypes, companyId, id, input)) {
      case (#err(msg)) { #err(msg) };
      case (#ok(a)) {
        let beforeText = switch (beforeOpt) { case null { null }; case (?b) { ?absenceTypeToText(b) } };
        // Sichtbarkeitsänderungen als zusätzliche Feldänderungen protokollieren
        let visChanges : ?[AuditTypes.AuditFieldChange] = switch (beforeOpt) {
          case null { null };
          case (?b) {
            var changes : [AuditTypes.AuditFieldChange] = [];
            switch (input.visibility) {
              case null {};
              case (?newVis) {
                let oldVisText = switch (b.visibility) {
                  case null { "null" };
                  case (?ov) {
                    (switch (ov.visibilityMode) { case (#full) "full"; case (#masked_reason) "masked_reason"; case (#anonymized) "anonymized"; case (#hidden) "hidden" })
                    # "|visible=" # (if (ov.visibleInCompanyCalendar) "true" else "false");
                  };
                };
                let newVisText = (switch (newVis.visibilityMode) { case (#full) "full"; case (#masked_reason) "masked_reason"; case (#anonymized) "anonymized"; case (#hidden) "hidden" })
                  # "|visible=" # (if (newVis.visibleInCompanyCalendar) "true" else "false");
                if (oldVisText != newVisText) {
                  changes := changes.concat([{
                    fieldName = "visibility";
                    before    = oldVisText;
                    after     = newVisText;
                  }]);
                };
              };
            };
            if (changes.size() > 0) { ?changes } else { null };
          };
        };
        appendAuditWithChanges(caller, companyId, #absenceType, #update, a.id.toText(), beforeText, ?absenceTypeToText(a), visChanges);
        #ok(a);
      };
    };
  };

  public shared ({ caller }) func deleteAbsenceType(
    id : CommonTypes.AbsenceTypeId
  ) : async CommonTypes.Result<()> {
    let companyId = requireMdCompanyId(caller);
    requireMdAdminOrManager(caller, companyId);
    let beforeOpt = absenceTypes.find(func(a) { a.id == id and a.companyId == companyId });
    switch (MasterLib.deleteAbsenceType(absenceTypes, companyId, id)) {
      case (#err(msg)) { #err(msg) };
      case (#ok(())) {
        let beforeText = switch (beforeOpt) { case null { null }; case (?b) { ?absenceTypeToText(b) } };
        appendAudit(caller, companyId, #absenceType, #remove, id.toText(), beforeText, null);
        #ok(());
      };
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
    let h = MasterLib.createHoliday(holidays, id, companyId, input);
    appendHolidayAudit(caller, companyId, #create, h.id.toText(), null, ?holidayToText(h));
    #ok(h);
  };

  public shared ({ caller }) func updateHoliday(
    id : CommonTypes.HolidayId,
    input : MasterTypes.UpdateHolidayInput,
  ) : async CommonTypes.Result<MasterTypes.Holiday> {
    let companyId = requireMdCompanyId(caller);
    requireMdAdminOrManager(caller, companyId);
    // Vorherigen Zustand für Audit-Log merken
    let beforeOpt = holidays.find(func(h) { h.id == id and h.companyId == companyId });
    switch (MasterLib.updateHoliday(holidays, companyId, id, input)) {
      case null { #err("Feiertag nicht gefunden") };
      case (?h) {
        let beforeText = switch (beforeOpt) {
          case null { null };
          case (?b) { ?holidayToText(b) };
        };
        // Strukturierte Feldänderungen ermitteln
        let changes = switch (beforeOpt) {
          case null { null };
          case (?b) {
            var list : [AuditTypes.AuditFieldChange] = [];
            if (b.name != h.name) {
              list := list.concat([{ fieldName = "name"; before = b.name; after = h.name }]);
            };
            if (b.date != h.date) {
              list := list.concat([{ fieldName = "date"; before = b.date; after = h.date }]);
            };
            if (b.ganztaegig != h.ganztaegig) {
              list := list.concat([{ fieldName = "ganztaegig"; before = if (b.ganztaegig) "true" else "false"; after = if (h.ganztaegig) "true" else "false" }]);
            };
            if (list.size() > 0) { ?list } else { null };
          };
        };
        appendAuditWithChanges(caller, companyId, #holiday, #update, h.id.toText(), beforeText, ?holidayToText(h), changes);
        #ok(h);
      };
    };
  };

  public shared ({ caller }) func deleteHoliday(
    id : CommonTypes.HolidayId
  ) : async CommonTypes.Result<()> {
    let companyId = requireMdCompanyId(caller);
    requireMdAdminOrManager(caller, companyId);
    // Vorherigen Zustand für Audit-Log merken
    let beforeOpt = holidays.find(func(h) { h.id == id and h.companyId == companyId });
    if (MasterLib.deleteHoliday(holidays, companyId, id)) {
      let beforeText = switch (beforeOpt) {
        case null { null };
        case (?b) { ?holidayToText(b) };
      };
      appendHolidayAudit(caller, companyId, #remove, id.toText(), beforeText, null);
      #ok(());
    } else {
      #err("Feiertag nicht gefunden");
    };
  };

  // --- Projekt-Aufwendungen (berechnet, read-only) ---

  public query ({ caller }) func getProjectAufwendungen(
    projectId : CommonTypes.ProjectId,
  ) : async CommonTypes.Result<Float> {
    let companyId = requireMdCompanyId(caller);
    // Sicherstellen, dass das Projekt zur Firma gehört
    switch (projects.find(func(p) { p.id == projectId and p.companyId == companyId })) {
      case null { #err("Projekt nicht gefunden") };
      case (?_) {
        // Mitglieder-Zuweisungen für Stundensatz-Lookup laden
        let membersArr : [MasterTypes.ProjectMemberAssignment] = switch (projectMembers.get(projectId)) {
          case (?m) m;
          case null [];
        };
        // Stundensatz für (employeeId, serviceTypeId) nachschlagen
        let lookup = func(empId : CommonTypes.EmployeeId, stId : CommonTypes.ServiceTypeId) : Float {
          switch (membersArr.find(func(m : MasterTypes.ProjectMemberAssignment) : Bool { m.employeeId == empId and m.serviceTypeId == stId })) {
            case (?m) m.stundensatz;
            case null 0.0;
          };
        };
        // Nur verrechenbare Zeiteinträge des Projekts summieren
        var total : Float = 0.0;
        for (te in timeEntries.values()) {
          if (te.companyId == companyId and te.projectId == projectId and te.billable) {
            total += te.hours * lookup(te.employeeId, te.serviceTypeId);
          };
        };
        #ok(total);
      };
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
