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
    mwstNummer  : ?Text;  // MwSt-Identifikationsnummer für Rechnungen
    kontoInhaber : ?Text; // Konto-Inhaber für Bankverbindung
    kontoAdresse : ?Text; // Adresse des Konto-Inhabers
    isActive : Bool;      // Platform Admin kann Mandanten deaktivieren
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
    activatedAt : ?Int;    // Zeitstempel der letzten Aktivierung (Nanosekunden)
    deactivatedAt : ?Int;  // Zeitstempel der letzten Deaktivierung (Nanosekunden)
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

  // Platform Admin: Mitarbeiterübersicht pro Firma
  public type PlatformAdminUserEntry = {
    id : EmployeeId;
    firstName : Text;
    lastName : Text;
    email : Text;
    role : Role;
    isActive : Bool;
    activatedAt : ?Int;
    deactivatedAt : ?Int;
  };

  // Feiertagsberechnungsart
  public type FeiertagsberechnungsartType = {
    #keineGutschrift;      // An Feiertagen wird keine Zeit gutgeschrieben (Gutschrift 0:00)
    #wochentag_sollzeit;   // Gutschrift gemäss Sollzeit des betroffenen Wochentags
    #durchschnittssoll;    // Gutschrift gemäss durchschnittlicher täglicher Sollzeit
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
    mwstNummer  : ?Text;
    kontoInhaber : ?Text;
    kontoAdresse : ?Text;
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

  // Standard-Arbeitsstunden pro Wochentag (in Minuten) – wird bei neuer Beschäftigung als Vorlage verwendet
  public type DefaultWorkHours = {
    companyId : CompanyId;
    stundenMo : Nat; // Minuten
    stundenDi : Nat;
    stundenMi : Nat;
    stundenDo : Nat;
    stundenFr : Nat;
    stundenSa : Nat;
    stundenSo : Nat;
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
