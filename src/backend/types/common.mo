// Gemeinsame Typen für das gesamte iReport Onchain V3.1 System
// Mandantenübergreifende Basistypen
module {
  // Eindeutige ID-Typen
  public type CompanyId = Nat;
  public type EmployeeId = Nat;
  public type CustomerId = Nat;
  public type ProjectId = Nat;
  public type ServiceTypeId = Nat;
  public type ExpenseTypeId = Nat;
  public type AbsenceTypeId = Nat;
  public type HolidayId = Nat;
  public type TimeEntryId = Nat;
  public type ExpenseId = Nat;
  public type AbsenceId = Nat;

  // Zeitstempel in Nanosekunden
  public type Timestamp = Int;

  // Benutzerrollen
  public type Role = {
    #admin;
    #manager;
    #employee;
  };

  // Beschäftigungsart
  public type EmploymentType = {
    #fullTime;
    #partTime;
    #contractor;
  };

  // Ausgabenstatus
  public type ExpenseStatus = {
    #pending;
    #approved;
    #rejected;
  };

  // Abwesenheitsstatus
  public type AbsenceStatus = {
    #submitted;
    #approved;
    #rejected;
  };

  // Generisches Ergebnis
  public type Result<T> = { #ok : T; #err : Text };

  // Einladungscode-Eintrag (mit Ablaufdatum)
  public type InviteEntry = {
    employeeId : EmployeeId;
    expiresAt  : Timestamp;   // Nanosekunden seit Epoch (Time.now() + 48h)
  };
};
