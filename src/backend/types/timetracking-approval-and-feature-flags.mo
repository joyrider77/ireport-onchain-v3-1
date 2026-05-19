// Typen für Zeiterfassung-Genehmigungsprozesse und Feature-basierte Zugriffskontrolle
// iReport Onchain V3.1 – Domain: timetracking-approval-and-feature-flags
import CommonTypes "common";
import CompanyTypes "company";

module {
  public type CompanyId    = CommonTypes.CompanyId;
  public type EmployeeId   = CommonTypes.EmployeeId;
  public type TimeEntryId  = CommonTypes.TimeEntryId;
  public type AbsenceId    = CommonTypes.AbsenceId;
  public type Timestamp    = CommonTypes.Timestamp;

  // ─── Zeiteintrag-Status ──────────────────────────────────────────────────────
  // #draft     = nicht eingereicht (Standard, rückwärtskompatibel)
  // #submitted = vom Mitarbeiter eingereicht, wartet auf Genehmigung
  // #approved  = vom Vorgesetzten genehmigt
  // #rejected  = vom Vorgesetzten abgelehnt
  public type TimeEntryStatus = { #draft; #submitted; #approved; #rejected };

  // ─── Absenzen-Genehmigungsstatus ─────────────────────────────────────────────
  // Eigenständig, getrennt von AbsenceStatus (welcher für Ferien verwendet wird).
  // #pending   = ausstehend (Standard)
  // #submitted = vom Mitarbeiter eingereicht
  // #approved  = genehmigt
  // #rejected  = abgelehnt
  public type AbsenceApprovalStatus = { #pending; #submitted; #approved; #rejected };

  // ─── Genehmigungs-Eingabe ─────────────────────────────────────────────────────
  // Wird für approveTimeEntry und rejectTimeEntry verwendet
  public type TimeEntryApprovalInput = {
    reason : ?Text; // Begründung (Pflicht bei Ablehnung, optional bei Genehmigung)
  };

  // Wird für approveAbsenceApproval und rejectAbsenceApproval verwendet
  public type AbsenceApprovalInput = {
    reason : ?Text;
  };

  // ─── Audit-Eintrag für Genehmigungsaktionen ──────────────────────────────────
  // Protokolliert Statusübergänge bei Zeiteinträgen und Absenzen
  public type TimeEntryApprovalAuditEntry = {
    id                 : Nat;
    timestamp          : Int;
    changedBy          : Principal;
    action             : Text;       // z.B. "submit", "approve", "reject", "reset"
    targetType         : Text;       // "timeEntry" | "absence"
    targetId           : Nat;
    oldStatus          : Text;
    newStatus          : Text;
    previousApprovedBy : ?Principal;
    reason             : ?Text;
  };

  // ─── Feature-Flag-Schlüssel ───────────────────────────────────────────────────
  // Gültige Sidebar-Funktionen für die Feature-basierte Zugriffskontrolle.
  // Diese Schlüssel müssen 1:1 mit der Sidebar-Navigation übereinstimmen.
  // Gültige Werte (features-Feld in SubscriptionPlan):
  //   "dashboard"        – Startseite / Dashboard
  //   "calendar"         – Kalenderübersicht
  //   "time-tracking"    – Zeiten erfassen
  //   "expense-tracking" – Spesen erfassen
  //   "reports"          – Auswertungen / Berichte
  //   "invoicing"        – Fakturierung / Rechnungen
  //   "master-data"      – Stammdaten
  //   "settings"         – Einstellungen
  public type FeatureKey = Text; // Wertemenge: siehe Kommentar oben

  // Ergebnis der Feature-Prüfung für einen Mandanten
  public type FeatureAccessResult = {
    companyId  : CompanyId;
    featureKey : FeatureKey;
    hasAccess  : Bool;
  };

  // ─── Platform-Admin-Konfiguration ────────────────────────────────────────────
  // Alle serverseitig gespeicherten Platform-Admin-Einstellungen.
  // stripeSecretKey und stripeWebhookSecret werden NIEMALS an das Frontend zurückgegeben.
  public type PlatformAdminConfig = {
    frontendCanisterId       : Text;
    stripePublishableKey     : Text;
    stripeSecretKey          : Text;  // Nur serverseitig – niemals an Frontend!
    stripeWebhookSecret      : Text;  // Nur serverseitig – niemals an Frontend!
    stripeWebhookEndpointUrl : Text;
  };

  // Öffentlich sichere Teilmenge der PlatformAdminConfig (keine Secrets)
  public type PlatformAdminConfigPublic = {
    frontendCanisterId       : Text;
    stripePublishableKey     : Text;
    stripeWebhookEndpointUrl : Text;
  };
};
