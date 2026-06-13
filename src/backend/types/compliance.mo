import Debug "mo:core/Debug";

module {

  // ── Period type ──────────────────────────────────────────────────────────

  public type CompliancePeriodeTyp = {
    #DAY;
    #WEEK;
    #SERVICE_YEAR;
  };

  // ── Status ───────────────────────────────────────────────────────────────

  public type ComplianceStatus = {
    #COMPLIANT;
    #INFO;
    #WARNING;
    #BREACH;
    #CRITICAL;
    #FREIGEGEBEN;
  };

  // ── Resolution ───────────────────────────────────────────────────────────

  public type ComplianceResolutionType = {
    #CORRECTED;
    #FREIGEGEBEN;
    #IGNORED;
  };

  // ── Rule category ────────────────────────────────────────────────────────

  public type ComplianceRuleKategorie = {
    #OVERTIME_CONTRACTUAL;
    #OVERTIME_LEGAL;
    #REST_TIME;
    #VACATION_MINIMUM;
    #VACATION_TWO_WEEK_BLOCK;
    #PAUSE_MINIMUM;
    #WEEKEND_REST_TIME;
  };

  // ── Compliance profile per employee ──────────────────────────────────────

  public type EmployeeComplianceProfile = {
    id : Nat;
    employeeId : Nat;
    companyId : Nat;
    aktiv : Bool;                              // false by default; admin activates
    // vertraglicheWochenstunden is derived from employment data (read-only, not stored)
    gesetzlicheWochenhochstarbeitszeit : Float; // 45.0 or 50.0
    gesetzlicherFerienanspruchWochen : Float;   // default 4.0 (Schweizer OR)
    vertraglicheZusatzferienTage : Float;       // default 0.0
    ausnahmeprofil : ?Text;                    // e.g. "GAV-Bau", "Kader"
    erfassungsModus : Text;                    // "VOLLSTAENDIG" or "VEREINFACHT"
    createdAt : Int;
    updatedAt : Int;
  };

  // ── Compliance finding ───────────────────────────────────────────────────

  public type ComplianceFinding = {
    id : Nat;
    employeeId : Nat;
    companyId : Nat;
    periodeTyp : CompliancePeriodeTyp;
    periodeKey : Text;            // e.g. "2024-W42", "2024-03-15", "2024_03_15"
    ruleCode : Text;              // e.g. "OVERTIME_CONTRACTUAL", "REST_TIME"
    status : ComplianceStatus;
    istWert : Float;              // actual value
    sollWert : Float;             // required value
    einheit : Text;               // "h", "min", "Tage"
    meldung : Text;               // human-readable German message
    rechtlicheReferenz : ?Text;   // e.g. "ArG Art. 15a"
    createdAt : Int;              // nanoseconds
    resolvedAt : ?Int;
    resolvedBy : ?Nat;            // employeeId
    resolutionType : ?ComplianceResolutionType;
    resolutionReason : ?Text;
    sourceEntryIds : [Nat];       // TimeEntry / Absence IDs
    auditHash : ?Text;
  };

  // ── Vacation ledger (per calendar year) ────────────────────────────────────

  public type VacationLedger = {
    id : Nat;
    employeeId : Nat;
    companyId : Nat;
    serviceYearKey : Text;               // Legacy field kept for migration; use calendarYearKey
    calendarYearKey : Text;              // 4-digit year as Text, e.g. "2024", "2025"
    serviceYearStart : Int;              // nanoseconds: 01.01. of the calendar year (or hireDate for entry year)
    serviceYearEnd : Int;                // nanoseconds: 31.12. of the calendar year (or exitDate for exit year)
    gesetzlicheFerientage : Float;       // pro-rata or full-year legal entitlement in Arbeitstage
    vertraglicheZusatzferienTage : Float;
    geplanteFerientage : Float;
    bezogeneFerientage : Float;
    verbleibendeFerientage : Float;      // = gesetzlich + vertraglich - bezogen
    laengsterZusammenhangenderBlock : Int; // days
    twoWeekBlockSatisfied : Bool;
    lastUpdatedAt : Int;
  };

  // ── Pause override (stored) ───────────────────────────────────────────────

  public type PauseOverride = {
    id : Nat;
    userId : Nat;            // employeeId of the employee whose pause is overridden
    companyId : Nat;
    date : Text;             // YYYY-MM-DD
    gapStart : Int;          // nanoseconds timestamp
    gapEnd : Int;            // nanoseconds timestamp
    action : Text;           // "ignore_pause" or "count_as_pause"
    reason : ?Text;
    createdByUserId : Nat;   // employeeId who created the override
    createdAt : Int;
    updatedAt : Int;
  };

  // ── Detected pause (computed, not stored) ────────────────────────────────

  public type DetectedPause = {
    date : Text;
    pauseStart : Int;        // nanoseconds
    pauseEnd : Int;          // nanoseconds
    durationMinutes : Int;
    source : Text;           // "calculated"
    ignored : Bool;
    complianceRelevant : Bool;
  };

  // ── Day pause compliance result (computed, not stored) ───────────────────

  public type DayPauseComplianceResult = {
    employeeId : Nat;
    companyId : Nat;
    date : Text;
    workDurationMinutes : Int;
    detectedPauseMinutes : Int;
    requiredPauseMinutes : Int;
    isCompliant : Bool;
    meldung : Text;
    status : Text;           // "ok", "warning", "violation", "not_required"
    pausen : [DetectedPause];
  };

  // ── Input types for API ───────────────────────────────────────────────────

  public type CreateComplianceFindingInput = {
    employeeId : Nat;
    companyId : Nat;
    periodeTyp : CompliancePeriodeTyp;
    periodeKey : Text;
    ruleCode : Text;
    status : ComplianceStatus;
    istWert : Float;
    sollWert : Float;
    einheit : Text;
    meldung : Text;
    rechtlicheReferenz : ?Text;
    sourceEntryIds : [Nat];
  };

  public type ResolveFindingInput = {
    findingId : Nat;
    resolutionType : ComplianceResolutionType;
    resolutionReason : Text;
  };

  public type CreatePauseOverrideInput = {
    userId : Nat;
    companyId : Nat;
    date : Text;
    gapStart : Int;
    gapEnd : Int;
    action : Text;
    reason : ?Text;
  };

  // ── Cockpit query result types ────────────────────────────────────────────

  public type ComplianceCockpitKPI = {
    mitarbeiterMitVerstoessen : Nat;
    ruhezeitVerstoesse : Nat;
    mitarbeiterMitGesetzlicherUeberzeit : Nat;
    ferienRisiken : Nat;
    pausenVerstoesse : Nat;
  };

  public type ComplianceCockpitRow = {
    employee : { id : Nat; firstName : Text; lastName : Text };
    gesamtstatus : ComplianceStatus;
    vertraglicheUeberstundenH : Float;
    gesetzlicheUeberzeitH : Float;
    ruhezeitVerstoesse : Nat;
    pausenVerstoesse : Nat;
    ferienstatus : Text;     // "OK" / "Risiko" / "Verstoss"
    offeneMassnahmen : Nat;
  };

  // ── Input types for compliance profile ───────────────────────────────────

  public type CreateComplianceProfileInput = {
    employeeId : Nat;
    companyId : Nat;
    gesetzlicheWochenhochstarbeitszeit : Float;
    gesetzlicherFerienanspruchWochen : Float;
    vertraglicheZusatzferienTage : Float;
    ausnahmeprofil : ?Text;
    erfassungsModus : Text;
  };

  public type UpdateComplianceProfileInput = {
    id : Nat;          // profile ID (0 when no profile exists yet)
    employeeId : Nat;  // employee to create/update the profile for
    aktiv : Bool;
    gesetzlicheWochenhochstarbeitszeit : Float;
    gesetzlicherFerienanspruchWochen : Float;
    vertraglicheZusatzferienTage : Float;
    ausnahmeprofil : ?Text;
    erfassungsModus : Text;
  };

  // ── Tenant compliance rule (per-tenant customisation) ─────────────────────

  public type TenantComplianceRule = {
    ruleCode : Text;              // e.g. "REST_TIME", "PAUSE_MINIMUM_5H30"
    tenantId : Text;              // companyId as Text
    customValue : ?Float;         // null = use Swiss-law default
    isActive : Bool;
    isCustomized : Bool;          // true once admin has manually changed a value
    modifiedBy : Text;            // employeeId as Text
    modifiedAt : Int;             // nanoseconds
  };

  public type UpdateTenantComplianceRuleInput = {
    ruleCode : Text;
    companyId : Nat;
    newValue : ?Float;            // null = keep current value, only toggle isActive
    isActive : Bool;
  };

};
