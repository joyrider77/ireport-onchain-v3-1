// Typen für das Firmen- und Mitarbeiterverwaltungs-Domäne
import CommonTypes "common";

module {
  public type CompanyId = CommonTypes.CompanyId;
  public type EmployeeId = CommonTypes.EmployeeId;
  public type Timestamp = CommonTypes.Timestamp;
  public type Role = CommonTypes.Role;
  public type EmploymentType = CommonTypes.EmploymentType;

  // Firmendaten
  public type Company = {
    id : CompanyId;
    name : Text;
    logoUrl : ?Text;
    taxId : ?Text;
    address : ?Text;
    createdAt : Timestamp;
  };

  // Mitarbeiterdaten (mit persönlichen Zusatzfeldern)
  public type Employee = {
    id : EmployeeId;
    companyId : CompanyId;
    principalId : ?Principal;
    firstName : Text;
    lastName : Text;
    email : Text;
    role : Role;
    employmentType : EmploymentType;
    startDate : Text;
    weeklyHoursTarget : Float;
    active : Bool;
    // Persönliche Daten
    geburtsdatum : ?Int;
    adresseZusatz1 : ?Text;
    adresseZusatz2 : ?Text;
    strasse : ?Text;
    postfach : ?Text;
    plz : ?Text;
    ort : ?Text;
    land : ?Text;
  };

  // Feiertagsberechnungsart
  public type FeiertagsberechnungsartType = {
    #exakt;
    #prozentual;
    #entschaedigt;
    #exaktWochentag;
  };

  // Beschäftigung (Anstellung eines Mitarbeiters, inkl. Wochenstunden in Minuten)
  public type Employment = {
    id : Text;
    employeeId : EmployeeId;
    companyId : CompanyId;
    funktion : Text;
    von : Int;
    bis : ?Int;
    feiertagsberechnungsart : FeiertagsberechnungsartType;
    pensum : Float;
    stundenMo : Nat; // Minuten
    stundenDi : Nat;
    stundenMi : Nat;
    stundenDo : Nat;
    stundenFr : Nat;
    stundenSa : Nat;
    stundenSo : Nat;
  };

  // Ferienguthaben
  public type VacationBalance = {
    id : Text;
    employeeId : EmployeeId;
    companyId : CompanyId;
    kalenderjahr : Int;
    dauer : Int; // Minuten
    verfallsdatum : ?Int;
  };

  // Zeitsaldokorrektur
  public type TimeBalanceCorrection = {
    id : Text;
    employeeId : EmployeeId;
    companyId : CompanyId;
    typ : { #reduktion; #gutschrift };
    wirkungsdatum : Int;
    dauer : Int; // Minuten
    ueberzeit : Int; // Minuten
    bemerkung : Text;
  };

  // Eingabedaten für neue Firma
  public type RegisterCompanyInput = {
    name : Text;
    firstName : Text;
    lastName : Text;
    email : Text;
  };

  // Aktualisierungsdaten für Firma
  public type UpdateCompanyInput = {
    name : ?Text;
    logoUrl : ?Text;
    taxId : ?Text;
    address : ?Text;
  };

  // Eingabedaten für neuen Mitarbeiter
  public type CreateEmployeeInput = {
    firstName : Text;
    lastName : Text;
    email : Text;
    role : Role;
    employmentType : EmploymentType;
    startDate : Text;
    weeklyHoursTarget : Float;
    geburtsdatum : ?Int;
    adresseZusatz1 : ?Text;
    adresseZusatz2 : ?Text;
    strasse : ?Text;
    postfach : ?Text;
    plz : ?Text;
    ort : ?Text;
    land : ?Text;
  };

  // Aktualisierungsdaten für Mitarbeiter
  public type UpdateEmployeeInput = {
    firstName : ?Text;
    lastName : ?Text;
    email : ?Text;
    role : ?Role;
    employmentType : ?EmploymentType;
    startDate : ?Text;
    weeklyHoursTarget : ?Float;
    active : ?Bool;
    geburtsdatum : ?Int;
    adresseZusatz1 : ?Text;
    adresseZusatz2 : ?Text;
    strasse : ?Text;
    postfach : ?Text;
    plz : ?Text;
    ort : ?Text;
    land : ?Text;
  };

  // Eingabedaten für Beschäftigung
  public type CreateEmploymentInput = {
    funktion : Text;
    von : Int;
    bis : ?Int;
    feiertagsberechnungsart : FeiertagsberechnungsartType;
    pensum : Float;
    stundenMo : Nat;
    stundenDi : Nat;
    stundenMi : Nat;
    stundenDo : Nat;
    stundenFr : Nat;
    stundenSa : Nat;
    stundenSo : Nat;
  };

   public type UpdateEmploymentInput = {
    funktion : ?Text;
    von : ?Int;
    bis : ?Int;
    feiertagsberechnungsart : ?FeiertagsberechnungsartType;
    pensum : Float;
    stundenMo : Nat;
    stundenDi : Nat;
    stundenMi : Nat;
    stundenDo : Nat;
    stundenFr : Nat;
    stundenSa : Nat;
    stundenSo : Nat;
  };

  // Eingabedaten für Ferienguthaben
  public type CreateVacationBalanceInput = {
    kalenderjahr : Int;
    dauer : Int;
    verfallsdatum : ?Int;
  };

  public type UpdateVacationBalanceInput = {
    kalenderjahr : ?Int;
    dauer : ?Int;
    verfallsdatum : ?Int;
  };

  // Eingabedaten für Zeitsaldokorrektur
  public type CreateTimeBalanceCorrectionInput = {
    typ : { #reduktion; #gutschrift };
    wirkungsdatum : Int;
    dauer : Int;
    ueberzeit : Int;
    bemerkung : Text;
  };

  public type UpdateTimeBalanceCorrectionInput = {
    typ : ?{ #reduktion; #gutschrift };
    wirkungsdatum : ?Int;
    dauer : ?Int;
    ueberzeit : ?Int;
    bemerkung : ?Text;
  };

  // Firmeneinstellungen
  public type CompanySettings = {
    companyId : CompanyId;
    emailNewVacationRequest : Bool;
    emailOnApproval : Bool;
    vacationCarryoverDays : Nat;
    maxVacationDays : Nat;
    approvalRequired : Bool;
    timezone : Text; // IANA-Zeitzone, z.B. "Europe/Zurich"
    allowExpiredVacationBalance : Bool; // Bei true wird das Verfallsdatum von Ferienguthaben ignoriert
  };

  // Arbeitszeitsaldo-Ergebnis (alle Werte in Minuten)
  public type WorkTimeBalance = {
    sollStunden : Int;   // Soll-Arbeitsstunden im Zeitraum (Minuten)
    istStunden : Int;    // Tatsächlich geleistete Stunden inkl. Abwesenheiten/Ferien (Minuten)
    saldo : Int;         // Ist - Soll + Korrektionen (Minuten)
    korrektionen : Int;  // Netto-Korrektionen (Gutschriften - Reduktionen) (Minuten)
    ueberzeit : Int;     // Summe Überzeit aus Zeitsaldokorrekturen (Minuten)
    periodStart : Text;  // Beginn des Berechnungszeitraums (YYYY-MM-DD)
    periodEnd : Text;    // Ende des Berechnungszeitraums (YYYY-MM-DD)
  };

  // Benachrichtigungseinstellungen des Benutzers
  public type UserNotificationSettings = {
    principalId : Principal;
    companyId : CompanyId;
    emailNewVacationRequest : Bool;
    emailOnApproval : Bool;
  };
};
