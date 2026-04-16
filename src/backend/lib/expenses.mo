// Domänenlogik für Spesenerfassung
import List "mo:core/List";
import CommonTypes "../types/common";
import TrackingTypes "../types/timetracking";

module {
  public type CompanyId = CommonTypes.CompanyId;
  public type EmployeeId = CommonTypes.EmployeeId;
  public type ExpenseId = CommonTypes.ExpenseId;

  // Hilfsfunktion: Datumsvergleich (Text im Format YYYY-MM-DD)
  private func dateInRange(date : Text, from : ?Text, to : ?Text) : Bool {
    let afterFrom = switch (from) {
      case null { true };
      case (?f) { date >= f };
    };
    let beforeTo = switch (to) {
      case null { true };
      case (?t) { date <= t };
    };
    afterFrom and beforeTo;
  };

  // Gibt alle Spesen eines Unternehmens gefiltert zurück
  public func listExpenses(
    expenses : List.List<TrackingTypes.Expense>,
    companyId : CompanyId,
    filter : TrackingTypes.ExpenseFilter,
  ) : [TrackingTypes.Expense] {
    expenses.filter(func(e) {
      if (e.companyId != companyId) { return false };
      switch (filter.employeeId) {
        case (?eid) { if (e.employeeId != eid) return false };
        case null {};
      };
      switch (filter.status) {
        case (?s) { if (e.status != s) return false };
        case null {};
      };
      if (not dateInRange(e.date, filter.dateFrom, filter.dateTo)) { return false };
      true;
    }).toArray();
  };

  // Erstellt einen neuen Speseneintrag
  public func createExpense(
    expenses : List.List<TrackingTypes.Expense>,
    nextId : Nat,
    companyId : CompanyId,
    employeeId : EmployeeId,
    input : TrackingTypes.CreateExpenseInput,
  ) : TrackingTypes.Expense {
    let expense : TrackingTypes.Expense = {
      id = nextId;
      companyId;
      employeeId;
      expenseTypeId = input.expenseTypeId;
      date = input.date;
      billableCHF = input.billableCHF;
      reimbursementCHF = input.reimbursementCHF;
      description = input.description;
      receiptBlobId = input.receiptBlobId;
      status = #pending;
      resetReason = null;
    };
    expenses.add(expense);
    expense;
  };

  // Aktualisiert einen Speseneintrag (nur im Status #pending)
  public func updateExpense(
    expenses : List.List<TrackingTypes.Expense>,
    companyId : CompanyId,
    expenseId : ExpenseId,
    employeeId : EmployeeId,
    input : TrackingTypes.UpdateExpenseInput,
  ) : ?TrackingTypes.Expense {
    var result : ?TrackingTypes.Expense = null;
    expenses.mapInPlace(func(e) {
      if (e.id == expenseId and e.companyId == companyId and e.employeeId == employeeId and e.status == #pending) {
        let updated : TrackingTypes.Expense = {
          e with
          expenseTypeId = switch (input.expenseTypeId) { case (?v) v; case null e.expenseTypeId };
          date = switch (input.date) { case (?v) v; case null e.date };
          billableCHF = switch (input.billableCHF) { case (?v) v; case null e.billableCHF };
          reimbursementCHF = switch (input.reimbursementCHF) { case (?v) v; case null e.reimbursementCHF };
          description = switch (input.description) { case (?v) v; case null e.description };
          receiptBlobId = switch (input.receiptBlobId) { case (?v) ?v; case null e.receiptBlobId };
        };
        result := ?updated;
        updated;
      } else { e };
    });
    result;
  };

  // Löscht einen Speseneintrag (nur im Status #pending)
  public func deleteExpense(
    expenses : List.List<TrackingTypes.Expense>,
    companyId : CompanyId,
    expenseId : ExpenseId,
    employeeId : EmployeeId,
  ) : Bool {
    let before = expenses.size();
    let filtered = expenses.filter(func(e) {
      not (e.id == expenseId and e.companyId == companyId and e.employeeId == employeeId and e.status == #pending)
    });
    expenses.clear();
    expenses.append(filtered);
    expenses.size() < before;
  };

  // Genehmigt einen Speseneintrag (Manager/Admin)
  public func approveExpense(
    expenses : List.List<TrackingTypes.Expense>,
    companyId : CompanyId,
    expenseId : ExpenseId,
    _approver : Principal,
  ) : ?TrackingTypes.Expense {
    var result : ?TrackingTypes.Expense = null;
    expenses.mapInPlace(func(e) {
      if (e.id == expenseId and e.companyId == companyId) {
        let updated : TrackingTypes.Expense = { e with status = #approved };
        result := ?updated;
        updated;
      } else { e };
    });
    result;
  };

  // Lehnt einen Speseneintrag ab (Manager/Admin)
  public func rejectExpense(
    expenses : List.List<TrackingTypes.Expense>,
    companyId : CompanyId,
    expenseId : ExpenseId,
    _approver : Principal,
    _comment : ?Text,
  ) : ?TrackingTypes.Expense {
    var result : ?TrackingTypes.Expense = null;
    expenses.mapInPlace(func(e) {
      if (e.id == expenseId and e.companyId == companyId) {
        let updated : TrackingTypes.Expense = { e with status = #rejected };
        result := ?updated;
        updated;
      } else { e };
    });
    result;
  };

  // Setzt einen genehmigten Speseneintrag auf ausstehend zurück (Manager/Admin)
  public func resetExpenseToAusstehend(
    expenses : List.List<TrackingTypes.Expense>,
    companyId : CompanyId,
    expenseId : ExpenseId,
    reason : Text,
  ) : ?TrackingTypes.Expense {
    var result : ?TrackingTypes.Expense = null;
    expenses.mapInPlace(func(e) {
      if (e.id == expenseId and e.companyId == companyId and e.status == #approved) {
        let updated : TrackingTypes.Expense = {
          e with
          status = #pending;
          resetReason = ?reason;
        };
        result := ?updated;
        updated;
      } else { e };
    });
    result;
  };
};
