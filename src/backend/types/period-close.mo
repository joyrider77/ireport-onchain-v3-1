// Typen fuer Monatsabschluss / Periodenabschluss (iReport Onchain V3.1)
import CommonTypes "common";

module {
  public type CompanyId = CommonTypes.CompanyId;
  public type EmployeeId = CommonTypes.EmployeeId;
  public type Timestamp = CommonTypes.Timestamp;

  // Eindeutige ID fuer einen Periodenabschluss-Eintrag
  public type PeriodCloseId = Text;

  // Status einer abgeschlossenen / laufenden Periode
  public type PeriodCloseStatus = {
    #open;
    #ready_for_close;
    #closed;
    #reopened;
  };

  // Periodtyp (aktuell nur month)
  public type PeriodType = {
    #month;
  };

  // Abschluss-Audit-Aktion
  public type PeriodCloseAction = {
    #close;
    #reopen;
    #force_close;
    #close_failed;
  };

  // Hauptdatenmodell: Periodenabschluss-Eintrag
  public type PeriodClose = {
    closeId          : PeriodCloseId;
    tenantId         : CompanyId;
    employeeId       : ?EmployeeId;
    periodType       : PeriodType;
    periodStart      : Int;
    periodEnd        : Int;
    month            : Nat;
    year             : Nat;
    status           : PeriodCloseStatus;
    closedAt         : ?Timestamp;
    closedByUserId   : ?EmployeeId;
    reopenedAt       : ?Timestamp;
    reopenedByUserId : ?EmployeeId;
    reopenReason     : ?Text;
    closeComment     : ?Text;
    affectedRecordCounts : ?AffectedRecordCounts;
    createdAt        : Timestamp;
    updatedAt        : Timestamp;
  };

  // Anzahl betroffener Datensaetze
  public type AffectedRecordCounts = {
    timeEntries  : Nat;
    absences     : Nat;
    expenses     : Nat;
  };

  // Audit-Eintrag fuer Periodenabschluss-Aktionen
  public type PeriodCloseAuditEntry = {
    auditId              : Text;
    tenantId             : CompanyId;
    employeeId           : ?EmployeeId;
    periodStart          : Int;
    periodEnd            : Int;
    action               : PeriodCloseAction;
    performedByUserId    : EmployeeId;
    performedAt          : Timestamp;
    oldStatus            : PeriodCloseStatus;
    newStatus            : PeriodCloseStatus;
    reason               : ?Text;
    warnings             : ?[Text];
    affectedRecordCounts : ?AffectedRecordCounts;
  };

  // Ergebnis der Vorpruefung vor Abschluss
  public type PrecheckResult = {
    canClose                : Bool;
    blockers                : [Text];
    warnings                : [Text];
    hasOpenEntries          : Bool;
    hasOpenAbsences         : Bool;
    hasOpenExpenses         : Bool;
    hasComplianceViolations : Bool;
    missingDays             : Nat;
    verdict                 : PrecheckVerdict;
  };

  public type PrecheckVerdict = {
    #ok;
    #ok_with_warnings;
    #blocked;
  };

  // Konfigurierbare Abschlussregeln pro Mandant
  public type PeriodCloseConfig = {
    enabled                          : Bool;
    allowCloseWithComplianceWarnings : Bool;
    allowCloseWithOpenTimeEntries    : Bool;
    allowCloseWithOpenAbsences       : Bool;
    allowCloseWithOpenExpenses       : Bool;
    onlyAdminCanReopen               : Bool;
    requireReopenReason              : Bool;
  };

  // Standardkonfiguration fuer neue Mandanten
  public let defaultPeriodCloseConfig : PeriodCloseConfig = {
    enabled                          = true;
    allowCloseWithComplianceWarnings = true;
    allowCloseWithOpenTimeEntries    = false;
    allowCloseWithOpenAbsences       = false;
    allowCloseWithOpenExpenses       = false;
    onlyAdminCanReopen               = false;
    requireReopenReason              = true;
  };

  // Eingabe: einzelnen Mitarbeiter-Monat abschliessen
  public type ClosePeriodInput = {
    tenantId     : CompanyId;
    employeeId   : ?EmployeeId;
    month        : Nat;
    year         : Nat;
    closeComment : ?Text;
  };

  // Eingabe: Periode wieder oeffnen
  public type ReopenPeriodInput = {
    closeId      : PeriodCloseId;
    reopenReason : ?Text;
  };

  // Ergebniszeile fuer die Monatsabschluss-Uebersicht
  public type MonthlyCloseRow = {
    employeeId       : EmployeeId;
    firstName        : Text;
    lastName         : Text;
    month            : Nat;
    year             : Nat;
    status           : PeriodCloseStatus;
    actualMinutes    : Int;
    targetMinutes    : Int;
    vacationDays     : Nat;
    absenceCount     : Nat;
    expenseCount     : Nat;
    openEntryCount   : Nat;
    complianceStatus : Text;
    closeId          : ?PeriodCloseId;
  };
};
