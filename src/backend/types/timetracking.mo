// Typen für Zeiterfassung, Spesen und Abwesenheiten
import CommonTypes "common";

module {
  public type CompanyId = CommonTypes.CompanyId;
  public type EmployeeId = CommonTypes.EmployeeId;
  public type ProjectId = CommonTypes.ProjectId;
  public type ServiceTypeId = CommonTypes.ServiceTypeId;
  public type ExpenseTypeId = CommonTypes.ExpenseTypeId;
  public type AbsenceTypeId = CommonTypes.AbsenceTypeId;
  public type TimeEntryId = CommonTypes.TimeEntryId;
  public type ExpenseId = CommonTypes.ExpenseId;
  public type AbsenceId = CommonTypes.AbsenceId;
  public type Timestamp = CommonTypes.Timestamp;
  public type ExpenseStatus = CommonTypes.ExpenseStatus;
  public type AbsenceStatus = CommonTypes.AbsenceStatus;

  // Zeiteintrag
  public type TimeEntry = {
    id : TimeEntryId;
    companyId : CompanyId;
    employeeId : EmployeeId;
    projectId : ProjectId;
    serviceTypeId : ServiceTypeId;
    date : Text;
    hours : Float;
    von : ?Text;
    bis : ?Text;
    description : Text;
    billable : Bool;
    createdAt : Timestamp;
    fakturiertInRechnungId : ?Nat; // ID der Rechnung, in der dieser Eintrag fakturiert wurde
  };

  // Speseneintrag
  public type Expense = {
    id : ExpenseId;
    companyId : CompanyId;
    employeeId : EmployeeId;
    expenseTypeId : ExpenseTypeId;
    date : Text;
    billableCHF : Float;
    reimbursementCHF : Float;
    description : Text;
    receiptBlobId : ?Text;
    status : ExpenseStatus;
    resetReason : ?Text; // Begründung beim Zurücksetzen auf ausstehend
    kundeId : ?Nat;   // Kunde, dem die Spese zugeordnet ist
    projektId : ?Nat; // Projekt, dem die Spese zugeordnet ist
    fakturiertInRechnungId : ?Nat; // ID der Rechnung, in der diese Spese fakturiert wurde
  };

  // Abwesenheit
  public type Absence = {
    id : AbsenceId;
    companyId : CompanyId;
    employeeId : EmployeeId;
    absenceTypeId : AbsenceTypeId;
    dateFrom : Text;
    dateTo : Text;
    // ganztaetig=true: Stunden werden aus Arbeitsstunden der Beschäftigung berechnet
    // ganztaetig=false: Stunden aus dem dauer-Feld (in Minuten)
    ganztaetig : Bool;
    dauer : Nat; // Dauer in Minuten (nur relevant wenn ganztaetig=false)
    description : ?Text;
    status : AbsenceStatus;
    rejectionComment : ?Text;
    resetReason : ?Text; // Begründung beim Zurücksetzen auf ausstehend
    approvedBy : ?Principal;
    createdAt : Timestamp;
  };

  // Filter für Zeiteinträge
  public type TimeEntryFilter = {
    employeeId : ?EmployeeId;
    projectId : ?ProjectId;
    dateFrom : ?Text;
    dateTo : ?Text;
  };

  // Filter für Spesen
  public type ExpenseFilter = {
    employeeId : ?EmployeeId;
    dateFrom : ?Text;
    dateTo : ?Text;
    status : ?ExpenseStatus;
  };

  // Filter für Abwesenheiten
  public type AbsenceFilter = {
    employeeId : ?EmployeeId;
    dateFrom : ?Text;
    dateTo : ?Text;
    status : ?AbsenceStatus;
    absenceTypeId : ?AbsenceTypeId;
  };

  // Eingabe für neuen Zeiteintrag
  public type CreateTimeEntryInput = {
    projectId : ProjectId;
    serviceTypeId : ServiceTypeId;
    date : Text;
    hours : Float;
    von : ?Text;
    bis : ?Text;
    description : Text;
    billable : Bool;
    requiresApproval : ?Bool; // true = direkt als #submitted einreichen (via approval data map)
  };

  // Aktualisierung eines Zeiteintrags
  public type UpdateTimeEntryInput = {
    projectId : ?ProjectId;
    serviceTypeId : ?ServiceTypeId;
    date : ?Text;
    hours : ?Float;
    von : ?Text;
    bis : ?Text;
    description : ?Text;
    billable : ?Bool;
  };

  // Eingabe für neuen Speseneintrag
  public type CreateExpenseInput = {
    expenseTypeId : ExpenseTypeId;
    date : Text;
    billableCHF : Float;
    reimbursementCHF : Float;
    description : Text;
    receiptBlobId : ?Text;
    kundeId : ?Nat;   // Optionale Kundenzuordnung
    projektId : ?Nat; // Optionale Projektzuordnung
  };

  // Aktualisierung eines Speseneintrags
  public type UpdateExpenseInput = {
    expenseTypeId : ?ExpenseTypeId;
    date : ?Text;
    billableCHF : ?Float;
    reimbursementCHF : ?Float;
    description : ?Text;
    receiptBlobId : ?Text;
    kundeId : ?Nat;   // Optionale Kundenzuordnung (aktualisieren)
    projektId : ?Nat; // Optionale Projektzuordnung (aktualisieren)
  };

  // Eingabe für neue Abwesenheit
  public type CreateAbsenceInput = {
    absenceTypeId : AbsenceTypeId;
    dateFrom : Text;
    dateTo : Text;
    // ganztaetig=true: Stunden automatisch aus Beschäftigung; dauer wird ignoriert
    // ganztaetig=false: dauer enthält die Minuten manuell
    ganztaetig : Bool;
    dauer : Nat; // Dauer in Minuten (wird gespeichert wenn ganztaetig=false)
    description : ?Text;
  };

  // Aktualisierung einer Abwesenheit
  public type UpdateAbsenceInput = {
    dateFrom : ?Text;
    dateTo : ?Text;
    ganztaetig : ?Bool;
    dauer : ?Nat; // Dauer in Minuten
    description : ?Text;
  };

  // Kalenderdaten für einen Monat
  public type CalendarData = {
    timeEntries : [TimeEntry];
    expenses : [Expense];
    absences : [Absence];
  };

  // Berichtsfilter
  public type ReportFilter = {
    dateFrom : Text;
    dateTo : Text;
    employeeId : ?EmployeeId;
    projectId : ?ProjectId;
    customerId : ?CompanyId;
  };

  // Berichtsdaten
  public type ReportData = {
    billableHours : Float;
    expenses : Float;
    entries : [TimeEntry];
    expenseItems : [Expense];
  };

  // Budget-Auswertung: Kosten pro Leistungsart eines Mitarbeiters
  public type ServiceTypeBudgetReport = {
    serviceTypeId : ServiceTypeId;
    serviceTypeName : Text;
    kostendachCHF : Float;
    aufgewendetCHF : Float;
    aufgewendeteStunden : Float;
  };

  // Budget-Auswertung: Kosten pro Mitarbeiter
  public type EmployeeBudgetReport = {
    employeeId : EmployeeId;
    employeeName : Text;
    kostendachCHF : Float;
    aufgewendetCHF : Float;
    aufgewendeteStunden : Float;
    serviceTypeReports : [ServiceTypeBudgetReport];
  };

  // Budget-Auswertung: Gesamtbericht für ein Projekt
  public type ProjectBudgetReport = {
    projectId : ProjectId;
    projectName : Text;
    customerName : Text;
    totalKostendachCHF : Float;
    totalAufgewendetCHF : Float;
    totalStunden : Float;
    employeeReports : [EmployeeBudgetReport];
  };

  // Maskierter Kalender-Eintrag für den Firmenkalender (serverseitig maskiert)
  public type MaskedCalendarAbsence = {
    id : Text;           // AbsenceId als Text
    employeeId : ?Text;  // null wenn anonymisiert
    employeeName : ?Text; // null wenn anonymisiert
    fromDate : Text;     // YYYY-MM-DD
    toDate : Text;       // YYYY-MM-DD
    displayTitle : Text; // "Ferien", "Nicht verfügbar", "Abwesenheit" etc.
    displayColor : ?Text; // Hex-Farbe oder null
    isOwnEntry : Bool;
    visibilityMode : Text; // "full" | "masked_reason" | "anonymized" | "hidden"
    status : Text;       // "genehmigt" | "ausstehend"
  };

  // Dashboard-Statistiken
  public type DashboardStats = {
    hoursThisWeek : Float;
    hoursTarget : Float;
    pendingVacations : Nat;
    pendingExpenses : Nat;
    approvedVacationDays : Nat;
    // Feriensaldo: gewährte Ferientage (aktuelles Jahr) minus verwendete Ferientage
    // Einheit: Minuten (wie VacationBalance.dauer)
    remainingVacationMinutes : Int;
  };
};
