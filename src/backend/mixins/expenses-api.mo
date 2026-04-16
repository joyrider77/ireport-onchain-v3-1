// Öffentliche API für Spesenerfassung und -genehmigung
import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import AccessControl "mo:caffeineai-authorization/access-control";
import CommonTypes "../types/common";
import CompanyTypes "../types/company";
import TrackingTypes "../types/timetracking";
import AuditTypes "../types/audit";
import ExpenseLib "../lib/expenses";

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

  // Hilfsfunktion: Admin/Manager-Rolle prüfen
  private func expRequireAdminOrManager(caller : Principal, companyId : CommonTypes.CompanyId) : () {
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

  // Hilfsfunktion: Audit-Eintrag anhängen (Expenses)
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

  // Erstellt einen neuen Speseneintrag
  public shared ({ caller }) func createExpense(
    input : TrackingTypes.CreateExpenseInput
  ) : async CommonTypes.Result<TrackingTypes.Expense> {
    let (companyId, employeeId) = expRequireAuth(caller);
    let id = nextExpenseId.value;
    nextExpenseId.value += 1;
    #ok(ExpenseLib.createExpense(expenses, id, companyId, employeeId, input));
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
    switch (ExpenseLib.updateExpense(expenses, companyId, id, employeeId, input)) {
      case null { #err("Speseneintrag nicht gefunden oder keine Berechtigung") };
      case (?e) { #ok(e) };
    };
  };

  // Löscht einen Speseneintrag
  public shared ({ caller }) func deleteExpense(
    id : CommonTypes.ExpenseId
  ) : async CommonTypes.Result<()> {
    let (companyId, employeeId) = expRequireAuth(caller);
    if (ExpenseLib.deleteExpense(expenses, companyId, id, employeeId)) {
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

    switch (ExpenseLib.approveExpense(expenses, companyId, id, caller)) {
      case null { #err("Speseneintrag nicht gefunden") };
      case (?e) {
        // Audit-Eintrag schreiben
        expAppendAudit(caller, "approved", "expense", id, oldStatusText, "genehmigt", null, null);
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

    switch (ExpenseLib.rejectExpense(expenses, companyId, id, caller, comment)) {
      case null { #err("Speseneintrag nicht gefunden") };
      case (?e) {
        // Audit-Eintrag schreiben
        expAppendAudit(caller, "rejected", "expense", id, oldStatusText, "abgelehnt", null, comment);
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
        // Audit-Eintrag schreiben (Expense hat kein approvedBy; previousApprovedBy = null)
        expAppendAudit(caller, "reset", "expense", id, oldStatusText, "ausstehend", null, ?reason);
        #ok(e);
      };
    };
  };
};
