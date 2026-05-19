// Domänenlogik für Zeiteintrag- und Absenzen-Genehmigungsprozesse
// iReport Onchain V3.1 – Domain: timetracking-approval-and-feature-flags
import List "mo:core/List";
import Map "mo:core/Map";
import CommonTypes "../types/common";
import TrackingTypes "../types/timetracking";
import ApprovalTypes "../types/timetracking-approval-and-feature-flags";

module {
  // Approval-Daten werden separat vom TimeEntry-Record gespeichert,
  // um M0170-Kompatibilitätsfehler durch Erweiterung des stabilen TimeEntry-Typs zu vermeiden.
  public type ApprovalRecord = {
    status     : ApprovalTypes.TimeEntryStatus;
    approvedBy : ?Principal;
    reason     : ?Text;
  };

  // ─── Zeiteintrag-Status-Übergänge ────────────────────────────────────────────

  // Setzt Status eines Zeiteintrags auf #submitted (Einreichen durch MA)
  public func submitTimeEntry(
    timeEntries  : List.List<TrackingTypes.TimeEntry>,
    approvalData : Map.Map<Nat, ApprovalRecord>,
    companyId    : CommonTypes.CompanyId,
    entryId      : CommonTypes.TimeEntryId,
    employeeId   : CommonTypes.EmployeeId,
  ) : ?TrackingTypes.TimeEntry {
    switch (timeEntries.find(func(e) { e.id == entryId and e.companyId == companyId and e.employeeId == employeeId })) {
      case null { null };
      case (?entry) {
        let current = approvalData.get(entryId);
        let currentStatus = switch (current) { case (?r) r.status; case null #draft };
        switch (currentStatus) {
          case (#draft) {
            approvalData.add(entryId, { status = #submitted; approvedBy = null; reason = null });
            ?entry;
          };
          case (_) { null }; // Nur #draft kann eingereicht werden
        };
      };
    };
  };

  // Genehmigt einen eingereichten Zeiteintrag (durch Manager/Admin)
  public func approveTimeEntry(
    timeEntries  : List.List<TrackingTypes.TimeEntry>,
    approvalData : Map.Map<Nat, ApprovalRecord>,
    companyId    : CommonTypes.CompanyId,
    entryId      : CommonTypes.TimeEntryId,
    approvedBy   : Principal,
  ) : ?TrackingTypes.TimeEntry {
    switch (timeEntries.find(func(e) { e.id == entryId and e.companyId == companyId })) {
      case null { null };
      case (?entry) {
        let current = approvalData.get(entryId);
        let currentStatus = switch (current) { case (?r) r.status; case null #draft };
        switch (currentStatus) {
          case (#submitted or #draft or #rejected) {
            approvalData.add(entryId, { status = #approved; approvedBy = ?approvedBy; reason = null });
            ?entry;
          };
          case (_) { null }; // Nur #submitted/#draft/#rejected kann genehmigt werden
        };
      };
    };
  };

  // Lehnt einen eingereichten Zeiteintrag ab (durch Manager/Admin)
  public func rejectTimeEntry(
    timeEntries  : List.List<TrackingTypes.TimeEntry>,
    approvalData : Map.Map<Nat, ApprovalRecord>,
    companyId    : CommonTypes.CompanyId,
    entryId      : CommonTypes.TimeEntryId,
    reason       : ?Text,
  ) : ?TrackingTypes.TimeEntry {
    switch (timeEntries.find(func(e) { e.id == entryId and e.companyId == companyId })) {
      case null { null };
      case (?entry) {
        let current = approvalData.get(entryId);
        let currentStatus = switch (current) { case (?r) r.status; case null #draft };
        switch (currentStatus) {
          case (#submitted or #draft or #approved) {
            approvalData.add(entryId, { status = #rejected; approvedBy = null; reason });
            ?entry;
          };
          case (_) { null };
        };
      };
    };
  };

  // Setzt einen Zeiteintrag auf #draft zurück (durch Manager/Admin)
  public func resetTimeEntryToDraft(
    timeEntries  : List.List<TrackingTypes.TimeEntry>,
    approvalData : Map.Map<Nat, ApprovalRecord>,
    companyId    : CommonTypes.CompanyId,
    entryId      : CommonTypes.TimeEntryId,
    _reason      : ?Text,
  ) : ?TrackingTypes.TimeEntry {
    switch (timeEntries.find(func(e) { e.id == entryId and e.companyId == companyId })) {
      case null { null };
      case (?entry) {
        approvalData.add(entryId, { status = #draft; approvedBy = null; reason = null });
        ?entry;
      };
    };
  };

  // Gibt alle eingereichten Zeiteinträge eines Mandanten zurück (für Genehmigungsübersicht)
  // Zeigt Einträge mit Status #submitted oder #approved oder #rejected an
  public func listSubmittedTimeEntries(
    timeEntries  : List.List<TrackingTypes.TimeEntry>,
    approvalData : Map.Map<Nat, ApprovalRecord>,
    companyId    : CommonTypes.CompanyId,
  ) : [TrackingTypes.TimeEntry] {
    timeEntries.filter(func(e) {
      if (e.companyId != companyId) return false;
      switch (approvalData.get(e.id)) {
        case (?(r)) { r.status == #submitted or r.status == #approved or r.status == #rejected };
        case null { false };
      };
    }).toArray();
  };

  // ─── Feature-Flag-Prüfung ────────────────────────────────────────────────────

  // Prüft, ob ein Mandant Zugriff auf eine bestimmte Sidebar-Funktion hat.
  // Gibt true zurück, wenn planFeatures den featureKey enthält.
  public func hasFeatureAccess(
    planFeatures : [Text],
    featureKey   : ApprovalTypes.FeatureKey,
  ) : Bool {
    for (f in planFeatures.values()) {
      if (f == featureKey) return true;
    };
    false;
  };
};
