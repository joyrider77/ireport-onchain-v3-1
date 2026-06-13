// Öffentliche API für Zeiterfassung
import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Float "mo:core/Float";
import AccessControl "mo:caffeineai-authorization/access-control";
import CommonTypes "../types/common";
import CompanyTypes "../types/company";
import TrackingTypes "../types/timetracking";
import AuditTypes "../types/audit";
import TimeLib "../lib/timetracking";
import InputValidator "../lib/InputValidator";
import PeriodCloseTypes "../types/period-close";
import PeriodCloseLib "../lib/period-close";

mixin (
  accessControlState : AccessControl.AccessControlState,
  companies : List.List<CompanyTypes.Company>,
  employees : List.List<CompanyTypes.Employee>,
  principalToCompany : Map.Map<Principal, CommonTypes.CompanyId>,
  principalToEmployee : Map.Map<Principal, CommonTypes.EmployeeId>,
  timeEntries : List.List<TrackingTypes.TimeEntry>,
  nextTimeEntryId : { var value : Nat },
  auditLogEntries : List.List<AuditTypes.AuditLogEntry>,
  nextAuditLogId : { var value : Nat },
  periodCloses : Map.Map<PeriodCloseTypes.PeriodCloseId, PeriodCloseTypes.PeriodClose>,
) {
  // Hilfsfunktion: Authentifizierung prüfen
  private func ttRequireAuth(caller : Principal) : (CommonTypes.CompanyId, CommonTypes.EmployeeId) {
    let companyId = switch (principalToCompany.get(caller)) {
      case null { Runtime.trap("Nicht authentifiziert") };
      case (?cid) cid;
    };
    let employeeId = switch (principalToEmployee.get(caller)) {
      case null { Runtime.trap("Kein Mitarbeiterdatensatz gefunden") };
      case (?eid) eid;
    };
    (companyId, employeeId);
  };

  // Hilfsfunktion: Periodensperre pruefen (gilt fuer alle Rollen, keine Ausnahmen)
  private func ttCheckPeriodLock(
    caller     : Principal,
    companyId  : CommonTypes.CompanyId,
    employeeId : CommonTypes.EmployeeId,
    dateStr    : Text, // YYYY-MM-DD
  ) : CommonTypes.Result<()> {
    ignore caller;
    // Datum parsen: YYYY-MM-DD
    let parts = dateStr.split(#char '-').toArray();
    if (parts.size() < 2) { return #ok(()) };
    let yearOpt = parts[0].toNat();
    let monthOpt = parts[1].toNat();
    let (year, month) = switch (yearOpt, monthOpt) {
      case (?y, ?m) { (y, m) };
      case _ { return #ok(()) };
    };
    // Direkt via Monat/Jahr pruefen – kein fehlerbehafteter Timestamp-Roundtrip
    let closes = periodCloses.entries().toArray();
    PeriodCloseLib.checkPeriodEditableByMonthYear(closes, companyId, employeeId, month, year);
  };

  // Hilfsfunktion: Name des Aufrufers ermitteln (für Audit-Log)
  private func ttCallerName(caller : Principal, companyId : CommonTypes.CompanyId) : Text {
    switch (principalToEmployee.get(caller)) {
      case null { caller.toText() };
      case (?empId) {
        switch (employees.find(func(e) { e.id == empId and e.companyId == companyId })) {
          case null { caller.toText() };
          case (?e) { e.firstName # " " # e.lastName };
        };
      };
    };
  };

  // Hilfsfunktion: Zeiteintrag als lesbaren Text serialisieren (für Audit-Log)
  private func timeEntryToText(e : TrackingTypes.TimeEntry) : Text {
    "id=" # e.id.toText()
    # " date=" # e.date
    # " hours=" # e.hours.toText()
    # " projectId=" # e.projectId.toText()
    # " serviceTypeId=" # e.serviceTypeId.toText()
    # " description=" # e.description
    # " billable=" # (if (e.billable) "true" else "false");
  };

  // Generische Hilfsfunktion: Audit-Log-Eintrag für Zeiteintrag anhängen
  private func appendTimeEntryAudit(
    caller      : Principal,
    companyId   : CommonTypes.CompanyId,
    operation   : AuditTypes.AuditOperation,
    entityId    : Text,
    beforeState : ?Text,
    afterState  : ?Text,
    fieldChanges : ?[AuditTypes.AuditFieldChange],
  ) {
    let id = "AL-" # nextAuditLogId.value.toText();
    nextAuditLogId.value += 1;
    let entry : AuditTypes.AuditLogEntry = {
      id;
      companyId;
      timestamp      = Time.now();
      operation;
      entityType     = #timeEntry;
      entityId;
      actorPrincipal = caller.toText();
      actorName      = ttCallerName(caller, companyId);
      beforeState;
      afterState;
      fieldChanges;
    };
    auditLogEntries.add(entry);
  };

  // Erstellt einen neuen Zeiteintrag
  public shared ({ caller }) func createTimeEntry(
    input : TrackingTypes.CreateTimeEntryInput
  ) : async CommonTypes.Result<TrackingTypes.TimeEntry> {
    let (companyId, employeeId) = ttRequireAuth(caller);
    // Datum und Stunden validieren
    switch (InputValidator.isValidDate(input.date)) {
      case (#err(msg)) { return #err(msg) };
      case (#ok(())) {};
    };
    switch (InputValidator.isValidHours(input.hours)) {
      case (#err(msg)) { return #err(msg) };
      case (#ok(())) {};
    };
    // Periodensperre pruefen
    switch (ttCheckPeriodLock(caller, companyId, employeeId, input.date)) {
      case (#err(msg)) { return #err(msg) };
      case (#ok(())) {};
    };
    let id = nextTimeEntryId.value;
    nextTimeEntryId.value += 1;
    let entry = TimeLib.createTimeEntry(timeEntries, id, companyId, employeeId, input);
    appendTimeEntryAudit(caller, companyId, #create, entry.id.toText(), null, ?timeEntryToText(entry), null);
    #ok(entry);
  };

  // Gibt gefilterte Zeiteinträge zurück
  public query ({ caller }) func listTimeEntries(
    filter : TrackingTypes.TimeEntryFilter
  ) : async [TrackingTypes.TimeEntry] {
    let companyId = switch (principalToCompany.get(caller)) {
      case null { Runtime.trap("Nicht authentifiziert") };
      case (?cid) cid;
    };
    // Mitarbeiter sehen nur eigene Einträge, Admin/Manager alle
    let employeeId = principalToEmployee.get(caller);
    let empRole = switch (employeeId) {
      case null { #employee };
      case (?eid) {
        switch (employees.find(func(e) { e.id == eid and e.companyId == companyId })) {
          case null { #employee };
          case (?e) e.role;
        };
      };
    };
    let effectiveFilter : TrackingTypes.TimeEntryFilter = switch (empRole) {
      case (#admin) filter;
      case (#manager) filter;
      case (#employee) {
        { filter with employeeId = employeeId };
      };
    };
    TimeLib.listTimeEntries(timeEntries, companyId, effectiveFilter);
  };

  // Aktualisiert einen Zeiteintrag
  public shared ({ caller }) func updateTimeEntry(
    id : CommonTypes.TimeEntryId,
    input : TrackingTypes.UpdateTimeEntryInput,
  ) : async CommonTypes.Result<TrackingTypes.TimeEntry> {
    let (companyId, employeeId) = ttRequireAuth(caller);
    // Periodensperre pruefen (Datum aus bestehendem Eintrag)
    let existingForLock = timeEntries.find(func(e : TrackingTypes.TimeEntry) : Bool = e.id == id and e.companyId == companyId and e.employeeId == employeeId);
    switch (existingForLock) {
      case (?existing) {
        switch (ttCheckPeriodLock(caller, companyId, employeeId, existing.date)) {
          case (#err(msg)) { return #err(msg) };
          case (#ok(())) {};
        };
      };
      case null {};
    };
    let beforeOpt = existingForLock;
    switch (TimeLib.updateTimeEntry(timeEntries, companyId, id, employeeId, input)) {
      case null { #err("Zeiteintrag nicht gefunden oder keine Berechtigung") };
      case (?e) {
        let beforeText = switch (beforeOpt) { case null { null }; case (?b) { ?timeEntryToText(b) } };
        // Strukturierte Feldänderungen ermitteln
        let changes = switch (beforeOpt) {
          case null { null };
          case (?b) {
            var list : [AuditTypes.AuditFieldChange] = [];
            if (b.date != e.date) {
              list := list.concat([{ fieldName = "date"; before = b.date; after = e.date }]);
            };
            if (b.hours != e.hours) {
              list := list.concat([{ fieldName = "hours"; before = b.hours.toText(); after = e.hours.toText() }]);
            };
            if (b.description != e.description) {
              list := list.concat([{ fieldName = "description"; before = b.description; after = e.description }]);
            };
            if (b.billable != e.billable) {
              list := list.concat([{ fieldName = "billable"; before = if (b.billable) "true" else "false"; after = if (e.billable) "true" else "false" }]);
            };
            if (list.size() > 0) { ?list } else { null };
          };
        };
        appendTimeEntryAudit(caller, companyId, #update, e.id.toText(), beforeText, ?timeEntryToText(e), changes);
        #ok(e);
      };
    };
  };

  // Löscht einen Zeiteintrag
  public shared ({ caller }) func deleteTimeEntry(
    id : CommonTypes.TimeEntryId
  ) : async CommonTypes.Result<()> {
    let (companyId, employeeId) = ttRequireAuth(caller);
    // Periodensperre pruefen
    let entryForLock = timeEntries.find(func(e : TrackingTypes.TimeEntry) : Bool = e.id == id and e.companyId == companyId and e.employeeId == employeeId);
    switch (entryForLock) {
      case (?existing) {
        switch (ttCheckPeriodLock(caller, companyId, employeeId, existing.date)) {
          case (#err(msg)) { return #err(msg) };
          case (#ok(())) {};
        };
      };
      case null {};
    };
    let beforeOpt = entryForLock;
    if (TimeLib.deleteTimeEntry(timeEntries, companyId, id, employeeId)) {
      let beforeText = switch (beforeOpt) { case null { null }; case (?b) { ?timeEntryToText(b) } };
      appendTimeEntryAudit(caller, companyId, #remove, id.toText(), beforeText, null, null);
      #ok(());
    } else {
      #err("Zeiteintrag nicht gefunden oder keine Berechtigung");
    };
  };
};
