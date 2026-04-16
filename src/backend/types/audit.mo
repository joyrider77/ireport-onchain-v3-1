// Audit-Log-Typen für Genehmigungsänderungen
import Time "mo:core/Time";

module {
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
};
