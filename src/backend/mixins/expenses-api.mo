// Öffentliche API für Spesenerfassung und -genehmigung
import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import AccessControl "mo:caffeineai-authorization/access-control";
import EmailClient "mo:caffeineai-email/emailClient";
import CommonTypes "../types/common";
import CompanyTypes "../types/company";
import TrackingTypes "../types/timetracking";
import AuditTypes "../types/audit";
import ExpenseLib "../lib/expenses";
import AccessControlLib "../lib/AccessControlLib";
import InputValidator "../lib/InputValidator";

mixin (
  accessControlState : AccessControl.AccessControlState,
  companies : List.List<CompanyTypes.Company>,
  employees : List.List<CompanyTypes.Employee>,
  principalToCompany : Map.Map<Principal, CommonTypes.CompanyId>,
  principalToEmployee : Map.Map<Principal, CommonTypes.EmployeeId>,
  expenses : List.List<TrackingTypes.Expense>,
  nextExpenseId : { var value : Nat },
  auditLog : List.List<AuditTypes.AuditEntry>,
  nextAuditId : { var value : Nat },
  auditLogEntriesV3 : List.List<AuditTypes.AuditLogEntry>,
  nextAuditLogId : { var value : Nat },
) {
  // Hilfsfunktion: Authentifizierung prüfen
  private func expRequireAuth(caller : Principal) : (CommonTypes.CompanyId, CommonTypes.EmployeeId) {
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

  // Hilfsfunktion: Admin/Manager-Rolle prüfen (delegiert an AccessControlLib)
  private func expRequireAdminOrManager(caller : Principal, companyId : CommonTypes.CompanyId) : () {
    let company = switch (companies.find(func(c : CompanyTypes.Company) : Bool = c.id == companyId)) {
      case null { Runtime.trap("Firma nicht gefunden") };
      case (?c) c;
    };
    switch (AccessControlLib.requireRole(caller, company, [#admin, #manager], principalToEmployee, employees)) {
      case (#err(msg)) { Runtime.trap(msg) };
      case (#ok(_)) {};
    };
  };

  // Hilfsfunktion: Audit-Eintrag anhängen (Expenses – Legacy-Genehmigungsflow)
  private func expAppendAudit(
    changedBy : Principal,
    action : Text,
    targetType : Text,
    targetId : Nat,
    oldStatus : Text,
    newStatus : Text,
    previousApprovedBy : ?Principal,
    reason : ?Text,
  ) {
    let entry : AuditTypes.AuditEntry = {
      id = nextAuditId.value;
      timestamp = Time.now();
      changedBy;
      action;
      targetType;
      targetId;
      oldStatus;
      newStatus;
      previousApprovedBy;
      reason;
    };
    nextAuditId.value += 1;
    auditLog.add(entry);
  };

  // Hilfsfunktion: Name des Aufrufers ermitteln
  private func expCallerName(caller : Principal, companyId : CommonTypes.CompanyId) : Text {
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

  // Hilfsfunktion: Spese als lesbaren Text serialisieren (für Audit-Log)
  private func expenseToText(e : TrackingTypes.Expense) : Text {
    let statusText = switch (e.status) {
      case (#pending) "ausstehend";
      case (#approved) "genehmigt";
      case (#rejected) "abgelehnt";
    };
    let kundeText = switch (e.kundeId) { case (?v) v.toText(); case null "" };
    let projektText = switch (e.projektId) { case (?v) v.toText(); case null "" };
    let descText = e.description;
    "id=" # e.id.toText()
    # " date=" # e.date
    # " spesenartId=" # e.expenseTypeId.toText()
    # " billableCHF=" # e.billableCHF.toText()
    # " reimbursementCHF=" # e.reimbursementCHF.toText()
    # " description=" # descText
    # " kundeId=" # kundeText
    # " projektId=" # projektText
    # " status=" # statusText;
  };

  // Hilfsfunktion: CRUD Audit-Log-Eintrag für Spesen anhängen (V3)
  private func expAppendCrudAudit(
    caller       : Principal,
    companyId    : CommonTypes.CompanyId,
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
      timestamp      = Time.now();
      operation;
      entityType     = #expense;
      entityId;
      actorPrincipal = caller.toText();
      actorName      = expCallerName(caller, companyId);
      beforeState;
      afterState;
      fieldChanges;
    };
    auditLogEntriesV3.add(entry);
  };

  // Erstellt einen neuen Speseneintrag
  public shared ({ caller }) func createExpense(
    input : TrackingTypes.CreateExpenseInput
  ) : async CommonTypes.Result<TrackingTypes.Expense> {
    let (companyId, employeeId) = expRequireAuth(caller);
    // Datum und Beträge validieren
    switch (InputValidator.isValidDate(input.date)) {
      case (#err(msg)) { return #err(msg) };
      case (#ok(())) {};
    };
    switch (InputValidator.isValidAmount(input.billableCHF)) {
      case (#err(msg)) { return #err(msg) };
      case (#ok(())) {};
    };
    switch (InputValidator.isValidAmount(input.reimbursementCHF)) {
      case (#err(msg)) { return #err(msg) };
      case (#ok(())) {};
    };
    let id = nextExpenseId.value;
    nextExpenseId.value += 1;
    let expense = ExpenseLib.createExpense(expenses, id, companyId, employeeId, input);
    expAppendCrudAudit(caller, companyId, #create, expense.id.toText(), null, ?expenseToText(expense), null);
    #ok(expense);
  };

  // Gibt gefilterte Spesen zurück
  public query ({ caller }) func listExpenses(
    filter : TrackingTypes.ExpenseFilter
  ) : async [TrackingTypes.Expense] {
    let companyId = switch (principalToCompany.get(caller)) {
      case null { Runtime.trap("Nicht authentifiziert") };
      case (?cid) cid;
    };
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
    let effectiveFilter : TrackingTypes.ExpenseFilter = switch (empRole) {
      case (#admin) filter;
      case (#manager) filter;
      case (#employee) {
        { filter with employeeId = employeeId };
      };
    };
    ExpenseLib.listExpenses(expenses, companyId, effectiveFilter);
  };

  // Aktualisiert einen Speseneintrag
  public shared ({ caller }) func updateExpense(
    id : CommonTypes.ExpenseId,
    input : TrackingTypes.UpdateExpenseInput,
  ) : async CommonTypes.Result<TrackingTypes.Expense> {
    let (companyId, employeeId) = expRequireAuth(caller);
    // Vorherigen Zustand merken
    let beforeOpt = expenses.find(func(e) { e.id == id and e.companyId == companyId and e.employeeId == employeeId and e.status == #pending });
    switch (ExpenseLib.updateExpense(expenses, companyId, id, employeeId, input)) {
      case null { #err("Speseneintrag nicht gefunden oder keine Berechtigung") };
      case (?e) {
        let beforeText = switch (beforeOpt) { case null null; case (?b) ?expenseToText(b) };
        // Strukturierte Feldänderungen ermitteln
        let changes = switch (beforeOpt) {
          case null { null };
          case (?b) {
            var list : [AuditTypes.AuditFieldChange] = [];
            if (b.date != e.date) {
              list := list.concat([{ fieldName = "date"; before = b.date; after = e.date }]);
            };
            if (b.billableCHF != e.billableCHF) {
              list := list.concat([{ fieldName = "billableCHF"; before = b.billableCHF.toText(); after = e.billableCHF.toText() }]);
            };
            if (b.reimbursementCHF != e.reimbursementCHF) {
              list := list.concat([{ fieldName = "reimbursementCHF"; before = b.reimbursementCHF.toText(); after = e.reimbursementCHF.toText() }]);
            };
            let bDesc = b.description;
            let eDesc = e.description;
            if (bDesc != eDesc) {
              list := list.concat([{ fieldName = "description"; before = bDesc; after = eDesc }]);
            };
            if (list.size() > 0) { ?list } else { null };
          };
        };
        expAppendCrudAudit(caller, companyId, #update, e.id.toText(), beforeText, ?expenseToText(e), changes);
        #ok(e);
      };
    };
  };

  // Löscht einen Speseneintrag
  public shared ({ caller }) func deleteExpense(
    id : CommonTypes.ExpenseId
  ) : async CommonTypes.Result<()> {
    let (companyId, employeeId) = expRequireAuth(caller);
    // Vorherigen Zustand merken
    let beforeOpt = expenses.find(func(e) { e.id == id and e.companyId == companyId and e.employeeId == employeeId and e.status == #pending });
    if (ExpenseLib.deleteExpense(expenses, companyId, id, employeeId)) {
      let beforeText = switch (beforeOpt) { case null null; case (?b) ?expenseToText(b) };
      expAppendCrudAudit(caller, companyId, #remove, id.toText(), beforeText, null, null);
      #ok(());
    } else {
      #err("Speseneintrag nicht gefunden oder keine Berechtigung");
    };
  };

  // Genehmigt einen Speseneintrag (Manager/Admin)
  public shared ({ caller }) func approveExpense(
    id : CommonTypes.ExpenseId
  ) : async CommonTypes.Result<TrackingTypes.Expense> {
    let companyId = switch (principalToCompany.get(caller)) {
      case null { return #err("Nicht authentifiziert") };
      case (?cid) cid;
    };
    expRequireAdminOrManager(caller, companyId);

    // Alten Status erfassen (vor der Genehmigung)
    let oldStatusText = switch (expenses.find(func(e) { e.id == id and e.companyId == companyId })) {
      case null { "unbekannt" };
      case (?e) {
        switch (e.status) {
          case (#pending) "ausstehend";
          case (#approved) "genehmigt";
          case (#rejected) "abgelehnt";
        };
      };
    };

    let beforeExpOpt = expenses.find(func(e) { e.id == id and e.companyId == companyId });
    let beforeExpText = switch (beforeExpOpt) { case null null; case (?e) ?expenseToText(e) };
    switch (ExpenseLib.approveExpense(expenses, companyId, id, caller)) {
      case null { #err("Speseneintrag nicht gefunden") };
      case (?e) {
        // Audit-Eintrag schreiben (Legacy-Genehmigungsflow — unverändert)
        expAppendAudit(caller, "approved", "expense", id, oldStatusText, "genehmigt", null, null);
        // Strukturierter Audit-Log: Genehmigungsentscheidung
        let empApvName = switch (employees.find(func(emp : CompanyTypes.Employee) : Bool { emp.id == e.employeeId and emp.companyId == companyId })) {
          case null { "Unbekannt" };
          case (?emp) { emp.firstName # " " # emp.lastName };
        };
        let apvDecision = "Genehmigt | Typ=Spesen | Mitarbeiter=" # empApvName # " | Entscheider=" # expCallerName(caller, companyId);
        expAppendCrudAudit(caller, companyId, #approve, id.toText(), beforeExpText, ?apvDecision, null);

        // E-Mail an Mitarbeiter senden
        let empEmail = switch (employees.find(func(emp : CompanyTypes.Employee) : Bool { emp.id == e.employeeId and emp.companyId == companyId })) {
          case null { null };
          case (?emp) { ?emp.email };
        };
        switch (empEmail) {
          case null {};
          case (?email) {
            ignore await EmailClient.sendServiceEmail(
              "no-reply",
              [email],
              "Ihre Spesenabrechnung wurde genehmigt",
              "<p>Ihre Spesenabrechnung vom <strong>" # e.date # "</strong> wurde genehmigt.</p>",
            );
          };
        };
        #ok(e);
      };
    };
  };

  // Lehnt einen Speseneintrag ab (Manager/Admin)
  public shared ({ caller }) func rejectExpense(
    id : CommonTypes.ExpenseId,
    comment : ?Text,
  ) : async CommonTypes.Result<TrackingTypes.Expense> {
    let companyId = switch (principalToCompany.get(caller)) {
      case null { return #err("Nicht authentifiziert") };
      case (?cid) cid;
    };
    expRequireAdminOrManager(caller, companyId);

    // Alten Status erfassen (vor der Ablehnung)
    let oldStatusText = switch (expenses.find(func(e) { e.id == id and e.companyId == companyId })) {
      case null { "unbekannt" };
      case (?e) {
        switch (e.status) {
          case (#pending) "ausstehend";
          case (#approved) "genehmigt";
          case (#rejected) "abgelehnt";
        };
      };
    };

    let beforeRejExpOpt = expenses.find(func(e) { e.id == id and e.companyId == companyId });
    let beforeRejExpText = switch (beforeRejExpOpt) { case null null; case (?e) ?expenseToText(e) };
    switch (ExpenseLib.rejectExpense(expenses, companyId, id, caller, comment)) {
      case null { #err("Speseneintrag nicht gefunden") };
      case (?e) {
        // Audit-Eintrag schreiben (Legacy-Genehmigungsflow — unverändert)
        expAppendAudit(caller, "rejected", "expense", id, oldStatusText, "abgelehnt", null, comment);
        // Strukturierter Audit-Log: Ablehnungsentscheidung
        let empRejName = switch (employees.find(func(emp : CompanyTypes.Employee) : Bool { emp.id == e.employeeId and emp.companyId == companyId })) {
          case null { "Unbekannt" };
          case (?emp) { emp.firstName # " " # emp.lastName };
        };
        let rejCommentText = switch (comment) { case null ""; case (?c) " | Kommentar=" # c };
        let rejDecision = "Abgelehnt | Typ=Spesen | Mitarbeiter=" # empRejName # " | Entscheider=" # expCallerName(caller, companyId) # rejCommentText;
        expAppendCrudAudit(caller, companyId, #reject, id.toText(), beforeRejExpText, ?rejDecision, null);

        // E-Mail an Mitarbeiter senden
        let empEmail = switch (employees.find(func(emp : CompanyTypes.Employee) : Bool { emp.id == e.employeeId and emp.companyId == companyId })) {
          case null { null };
          case (?emp) { ?emp.email };
        };
        let commentText = switch (comment) {
          case null { "" };
          case (?c) { "<p><strong>Kommentar:</strong> " # c # "</p>" };
        };
        switch (empEmail) {
          case null {};
          case (?email) {
            ignore await EmailClient.sendServiceEmail(
              "no-reply",
              [email],
              "Ihre Spesenabrechnung wurde abgelehnt",
              "<p>Ihre Spesenabrechnung vom <strong>" # e.date # "</strong> wurde abgelehnt.</p>" # commentText,
            );
          };
        };
        #ok(e);
      };
    };
  };

  // Setzt einen genehmigten Speseneintrag auf ausstehend zurück (Admin/Manager)
  public shared ({ caller }) func resetExpenseToAusstehend(
    id : CommonTypes.ExpenseId,
    reason : Text,
  ) : async CommonTypes.Result<TrackingTypes.Expense> {
    let companyId = switch (principalToCompany.get(caller)) {
      case null { return #err("Nicht authentifiziert") };
      case (?cid) cid;
    };
    expRequireAdminOrManager(caller, companyId);

    // Alten Status erfassen (Expense hat kein approvedBy-Feld, daher previousApprovedBy = null)
    let oldStatusText = switch (expenses.find(func(e) { e.id == id and e.companyId == companyId })) {
      case null { "unbekannt" };
      case (?e) {
        switch (e.status) {
          case (#pending) "ausstehend";
          case (#approved) "genehmigt";
          case (#rejected) "abgelehnt";
        };
      };
    };

    switch (ExpenseLib.resetExpenseToAusstehend(expenses, companyId, id, reason)) {
      case null { #err("Speseneintrag nicht gefunden oder nicht im Status 'genehmigt'") };
      case (?e) {
        // Audit-Eintrag schreiben (Legacy-Genehmigungsflow — unverändert)
        expAppendAudit(caller, "reset", "expense", id, oldStatusText, "ausstehend", null, ?reason);
        #ok(e);
      };
    };
  };
};
