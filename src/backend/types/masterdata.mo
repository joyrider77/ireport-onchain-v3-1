// Typen für Stammdaten (Kunden, Projekte, Leistungsarten, etc.)
import CommonTypes "common";

module {
  public type CompanyId = CommonTypes.CompanyId;
  public type CustomerId = CommonTypes.CustomerId;
  public type ProjectId = CommonTypes.ProjectId;
  public type ServiceTypeId = CommonTypes.ServiceTypeId;
  public type ExpenseTypeId = CommonTypes.ExpenseTypeId;
  public type AbsenceTypeId = CommonTypes.AbsenceTypeId;
  public type HolidayId = CommonTypes.HolidayId;
  public type EmployeeId = CommonTypes.EmployeeId;

  // Rechnungsadresse eines Kunden
  public type Rechnungsadresse = {
    zusatz1 : ?Text;
    zusatz2 : ?Text;
    strasse : ?Text;
    postfach : ?Text;
    plz : ?Text;
    ort : ?Text;
    land : Text; // Standard: "Schweiz"
  };

  // Zeiterfassungsart eines Kunden
  public type KundeZeiterfassungsart = {
    #stuendlich; // Stündlich (Dauer hh:mm)
    #block;      // Zeit-Block (von/bis hh:mm)
  };

  // Kundendaten
  public type Customer = {
    id : CustomerId;
    companyId : CompanyId;
    name : Text;
    contact : ?Text;   // legacy, beibehalten für Rückwärtskompatibilität
    notes : ?Text;     // legacy, beibehalten für Rückwärtskompatibilität
    beschreibung : ?Text;
    kundennummer : ?Text;
    rechnungsadresse : ?Rechnungsadresse;
    zeiterfassungsart : KundeZeiterfassungsart; // Standard: #stuendlich
    waehrung : Text;   // Standard: "CHF"
    aktiv : Bool;      // Standard: true
  };

  // Projektstatus
  public type ProjectStatus = {
    #aktiv;
    #inaktiv;
    #abgeschlossen;
  };

  // Erfassungsart für Zeitbuchungen im Projekt
  public type Erfassungsart = {
    #dauer;     // Dauer hh:mm
    #zeitBlock; // Zeit von hh:mm bis hh:mm
  };

  // Projektzuweisung eines Mitarbeiters mit Leistungsart und Stundensatz
  public type ProjectMemberAssignment = {
    employeeId : EmployeeId;
    serviceTypeId : ServiceTypeId;
    stundensatz : Float;
    kostendachCHF : ?Float; // Kostendach in CHF für diesen Mitarbeiter/Leistungsart; null = kein Kostendach
  };

  // Projektdaten
  public type Project = {
    id : ProjectId;
    companyId : CompanyId;
    customerId : CustomerId;
    name : Text;
    kurzbezeichnung : Text;
    code : Text;
    billableRate : Float;
    active : Bool;
    projektleiter : ?EmployeeId;
    status : ProjectStatus;
    erfassungsart : ?Erfassungsart; // null = #dauer (Rückwärtskompatibilität)
    kostendachCHF : ?Float; // Kostendach in CHF für das gesamte Projekt; null = kein Kostendach
  };

  // Projektzuweisung (Mitarbeiter → Projekt, einfache Zuordnung)
  public type ProjectAssignment = {
    employeeId : EmployeeId;
    projectId : ProjectId;
    companyId : CompanyId;
  };

  // Leistungsart (früher: Dienstleistungsart)
  public type ServiceType = {
    id : ServiceTypeId;
    companyId : CompanyId;
    name : Text;
    billable : Bool;
    defaultRate : Float;
    aktiv : Bool; // true = aktiv (Standard), false = inaktiv
  };

  // Spesenart
  public type ExpenseType = {
    id : ExpenseTypeId;
    companyId : CompanyId;
    name : Text;
    billable : Bool;
    reimbursable : Bool;
    aktiv : Bool; // true = aktiv (Standard), false = inaktiv
  };

  // Sichtbarkeitsmodus für den Firmenkalender
  // full = vollständig sichtbar, masked_reason = Zeitraum+Name sichtbar, Grund maskiert
  // anonymized = Zeitraum sichtbar, Person anonym, hidden = nicht sichtbar
  public type CalendarVisibilityMode = {
    #full;
    #masked_reason;
    #anonymized;
    #hidden;
  };

  // Sichtbarkeitskonfiguration pro Abwesenheitsart für den Firmenkalender
  public type AbsenceTypeVisibility = {
    visibleInCompanyCalendar : Bool;
    visibilityMode : CalendarVisibilityMode;
    visibleForRoles : [Text]; // ["all"] | ["admin", "manager"] | ...
    companyCalendarDisplayName : ?Text;
    companyCalendarColor : ?Text;
    showEmployeeName : Bool;
    showAbsenceTypeName : Bool;
    showComment : Bool;
  };

  // Abwesenheitsart
  public type AbsenceType = {
    id : AbsenceTypeId;
    companyId : CompanyId;
    name : Text;
    requiresApproval : Bool;
    compensated : Bool; // true = Abwesenheit zählt als Arbeitszeit (entschädigt)
    aktiv : Bool; // true = aktiv (Standard), false = inaktiv
    // Sichtbarkeit im Firmenkalender (optional – Defaults werden beim Lesen angewendet)
    visibility : ?AbsenceTypeVisibility;
  };

  // Feiertag
  public type Holiday = {
    id : HolidayId;
    companyId : CompanyId;
    name : Text;
    date : Text;
    ganztaegig : Bool; // true = ganztägig (Standard), false = halbtägig
  };

  // Einzelner Von/Bis-Zeitblock für einen Wochentag
  public type StandardTimeBlock = {
    von : Text;           // z.B. "08:00"
    bis : Text;           // z.B. "12:00"
    projektId : ?Nat;     // optional, für Standardarbeitszeit-Vorlage
    leistungsartId : ?Nat; // optional, für Standardarbeitszeit-Vorlage
  };

  // Legacy-Typ (vor Migration): nur von/bis
  public type LegacyStandardTimeBlock = {
    von : Text;
    bis : Text;
  };

  // Standardarbeitszeiten: mehrere Von/Bis-Blöcke pro Wochentag
  public type Standardarbeitszeiten = {
    monday    : [StandardTimeBlock];
    tuesday   : [StandardTimeBlock];
    wednesday : [StandardTimeBlock];
    thursday  : [StandardTimeBlock];
    friday    : [StandardTimeBlock];
    saturday  : [StandardTimeBlock];
    sunday    : [StandardTimeBlock];
  };

  // Legacy-Standardarbeitszeiten (für Migration)
  public type LegacyStandardarbeitszeiten = {
    monday    : [LegacyStandardTimeBlock];
    tuesday   : [LegacyStandardTimeBlock];
    wednesday : [LegacyStandardTimeBlock];
    thursday  : [LegacyStandardTimeBlock];
    friday    : [LegacyStandardTimeBlock];
    saturday  : [LegacyStandardTimeBlock];
    sunday    : [LegacyStandardTimeBlock];
  };

  // Eingabe-Typen für CRUD-Operationen
  public type CreateCustomerInput = {
    name : Text;
    contact : ?Text;
    notes : ?Text;
    beschreibung : ?Text;
    kundennummer : ?Text;
    rechnungsadresse : ?Rechnungsadresse;
    zeiterfassungsart : ?KundeZeiterfassungsart; // null → #stuendlich
    waehrung : ?Text;                            // null → "CHF"
    aktiv : ?Bool;                               // null → true
  };

  public type UpdateCustomerInput = {
    name : ?Text;
    contact : ?Text;
    notes : ?Text;
    beschreibung : ?Text;
    kundennummer : ?Text;
    rechnungsadresse : ?Rechnungsadresse;
    zeiterfassungsart : ?KundeZeiterfassungsart;
    waehrung : ?Text;
    aktiv : ?Bool;
  };

  public type CreateProjectInput = {
    customerId : CustomerId;
    name : Text;
    kurzbezeichnung : Text;
    code : Text;
    billableRate : Float;
    projektleiter : ?EmployeeId;
    status : ?ProjectStatus;
    erfassungsart : ?Erfassungsart;
    kostendachCHF : ?Float; // null = kein Kostendach
  };

  public type UpdateProjectInput = {
    customerId : ?CustomerId;
    name : ?Text;
    kurzbezeichnung : ?Text;
    code : ?Text;
    billableRate : ?Float;
    active : ?Bool;
    projektleiter : ?EmployeeId;
    status : ?ProjectStatus;
    erfassungsart : ?Erfassungsart;
    kostendachCHF : ?Float; // null = Wert unverändert lassen; ?(0.0) = Kostendach entfernen nicht möglich, null = kein Update
  };

  public type CreateServiceTypeInput = {
    name : Text;
    billable : Bool;
    defaultRate : Float;
    aktiv : ?Bool; // null → true
  };

  public type UpdateServiceTypeInput = {
    name : ?Text;
    billable : ?Bool;
    defaultRate : ?Float;
    aktiv : ?Bool;
  };

  public type CreateExpenseTypeInput = {
    name : Text;
    billable : Bool;
    reimbursable : Bool;
    aktiv : ?Bool; // null → true
  };

  public type UpdateExpenseTypeInput = {
    name : ?Text;
    billable : ?Bool;
    reimbursable : ?Bool;
    aktiv : ?Bool;
  };

  public type CreateAbsenceTypeInput = {
    name : Text;
    requiresApproval : Bool;
    compensated : Bool;
    aktiv : ?Bool; // null → true
    visibility : ?AbsenceTypeVisibility; // null → Defaults je nach Name
  };

  public type UpdateAbsenceTypeInput = {
    name : ?Text;
    requiresApproval : ?Bool;
    compensated : ?Bool;
    aktiv : ?Bool;
    visibility : ?AbsenceTypeVisibility; // null → keine Änderung
  };

  public type CreateHolidayInput = {
    name : Text;
    date : Text;
    ganztaegig : ?Bool; // null → true (ganztägig)
  };

  public type UpdateHolidayInput = {
    name : ?Text;
    date : ?Text;
    ganztaegig : ?Bool;
  };
};
