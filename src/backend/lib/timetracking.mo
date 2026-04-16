// Domänenlogik für Zeiterfassung
import List "mo:core/List";
import Time "mo:core/Time";
import CommonTypes "../types/common";
import TrackingTypes "../types/timetracking";

module {
  public type CompanyId = CommonTypes.CompanyId;
  public type EmployeeId = CommonTypes.EmployeeId;
  public type TimeEntryId = CommonTypes.TimeEntryId;

  // Hilfsfunktion: Datumsvergleich (Text im Format YYYY-MM-DD)
  private func dateInRange(date : Text, from : ?Text, to : ?Text) : Bool {
    let afterFrom = switch (from) {
      case null { true };
      case (?f) { date >= f };
    };
    let beforeTo = switch (to) {
      case null { true };
      case (?t) { date <= t };
    };
    afterFrom and beforeTo;
  };

  // Gibt alle Zeiteinträge eines Unternehmens gefiltert zurück
  public func listTimeEntries(
    timeEntries : List.List<TrackingTypes.TimeEntry>,
    companyId : CompanyId,
    filter : TrackingTypes.TimeEntryFilter,
  ) : [TrackingTypes.TimeEntry] {
    timeEntries.filter(func(e) {
      if (e.companyId != companyId) { return false };
      switch (filter.employeeId) {
        case (?eid) { if (e.employeeId != eid) return false };
        case null {};
      };
      switch (filter.projectId) {
        case (?pid) { if (e.projectId != pid) return false };
        case null {};
      };
      if (not dateInRange(e.date, filter.dateFrom, filter.dateTo)) { return false };
      true;
    }).toArray();
  };

  // Erstellt einen neuen Zeiteintrag
  public func createTimeEntry(
    timeEntries : List.List<TrackingTypes.TimeEntry>,
    nextId : Nat,
    companyId : CompanyId,
    employeeId : EmployeeId,
    input : TrackingTypes.CreateTimeEntryInput,
  ) : TrackingTypes.TimeEntry {
    let entry : TrackingTypes.TimeEntry = {
      id = nextId;
      companyId;
      employeeId;
      projectId = input.projectId;
      serviceTypeId = input.serviceTypeId;
      date = input.date;
      hours = input.hours;
      von = input.von;
      bis = input.bis;
      description = input.description;
      billable = input.billable;
      createdAt = Time.now();
    };
    timeEntries.add(entry);
    entry;
  };

  // Aktualisiert einen Zeiteintrag
  public func updateTimeEntry(
    timeEntries : List.List<TrackingTypes.TimeEntry>,
    companyId : CompanyId,
    entryId : TimeEntryId,
    employeeId : EmployeeId,
    input : TrackingTypes.UpdateTimeEntryInput,
  ) : ?TrackingTypes.TimeEntry {
    var result : ?TrackingTypes.TimeEntry = null;
    timeEntries.mapInPlace(func(e) {
      if (e.id == entryId and e.companyId == companyId and e.employeeId == employeeId) {
        let updated : TrackingTypes.TimeEntry = {
          e with
          projectId = switch (input.projectId) { case (?v) v; case null e.projectId };
          serviceTypeId = switch (input.serviceTypeId) { case (?v) v; case null e.serviceTypeId };
          date = switch (input.date) { case (?v) v; case null e.date };
          hours = switch (input.hours) { case (?v) v; case null e.hours };
          von = switch (input.von) { case (?v) ?v; case null e.von };
          bis = switch (input.bis) { case (?v) ?v; case null e.bis };
          description = switch (input.description) { case (?v) v; case null e.description };
          billable = switch (input.billable) { case (?v) v; case null e.billable };
        };
        result := ?updated;
        updated;
      } else { e };
    });
    result;
  };

  // Löscht einen Zeiteintrag
  public func deleteTimeEntry(
    timeEntries : List.List<TrackingTypes.TimeEntry>,
    companyId : CompanyId,
    entryId : TimeEntryId,
    employeeId : EmployeeId,
  ) : Bool {
    let before = timeEntries.size();
    let filtered = timeEntries.filter(func(e) {
      not (e.id == entryId and e.companyId == companyId and e.employeeId == employeeId)
    });
    timeEntries.clear();
    timeEntries.append(filtered);
    timeEntries.size() < before;
  };
};
