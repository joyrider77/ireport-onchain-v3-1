// Audit-Log-Typen für iReport Onchain V3.1
// Phase 1: Genehmigungsänderungen + CRUD-Operationen auf Feiertagen (erweiterbar)
import Time "mo:core/Time";
import CommonTypes "common";

module {
  // ─── Legacy-Typ für Genehmigungsänderungen (Abwesenheiten/Spesen) ────────────
  public type AuditEntry = {
    id : Nat;
    timestamp : Time.Time;
    changedBy : Principal;
    action : Text;          // "approved" | "rejected" | "reset"
    targetType : Text;      // "absence" | "expense"
    targetId : Nat;
    oldStatus : Text;
    newStatus : Text;
    previousApprovedBy : ?Principal;
    reason : ?Text;
  };

  // ─── Neuer Audit-Log für CRUD-Operationen ────────────────────────────────────

  public type AuditOperation = {
    #create;
    #update;
    #remove;
    #delete;   // Legacy: retained for stable-var compat with persisted entries
    #approve;  // Genehmigungsentscheidung
    #reject;   // Ablehnungsentscheidung
  };

  // Alle Stammdaten-Entitäten für den Audit-Log
  public type AuditEntityType = {
    #holiday;
    #company;
    #employee;
    #customer;
    #project;
    #serviceType;
    #expenseType;
    #absenceType;
    #invoiceTemplate;
    #timeEntry;
    #expense;
    #absence;
    #ferien;
    #approval;
  };

  // Einzelne Feldänderung im Audit-Log (strukturierter Vorher-/Nachher-Vergleich)
  public type AuditFieldChange = {
    fieldName : Text;
    before    : Text;
    after     : Text;
  };

  public type AuditLogEntry = {
    id          : Text;                     // eindeutige ID (z.B. "AL-0001")
    companyId   : CommonTypes.CompanyId;    // Mandantentrennung
    timestamp   : Int;                      // Time.now() in Nanosekunden
    operation   : AuditOperation;
    entityType  : AuditEntityType;
    entityId    : Text;                     // ID des betroffenen Datensatzes
    actorPrincipal : Text;                  // caller.toText()
    actorName   : Text;                     // Mitarbeitername oder "Platform Admin"
    beforeState : ?Text;                    // JSON-ähnliche Textdarstellung vor Änderung (null bei CREATE)
    afterState  : ?Text;                    // JSON-ähnliche Textdarstellung nach Änderung (null bei DELETE)
    fieldChanges : ?[AuditFieldChange];     // Strukturierte Feldänderungen (optional, für UPDATE-Operationen)
  };

  // Filter für listAuditLogs
  public type AuditLogFilter = {
    entityType          : ?AuditEntityType;
    operation           : ?AuditOperation;
    actorPrincipalFilter : ?Text;
    dateFrom            : ?Int;   // Nanosekunden-Timestamp (inklusiv)
    dateTo              : ?Int;   // Nanosekunden-Timestamp (inklusiv)
  };
};
