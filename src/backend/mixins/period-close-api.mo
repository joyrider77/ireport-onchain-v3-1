// Oeffentliche API fuer Periodenabschluss / Monatsabschluss (iReport Onchain V3.1)
import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";

import PeriodCloseTypes "../types/period-close";
import CommonTypes "../types/common";
import CompanyTypes "../types/company";
import TrackingTypes "../types/timetracking";
import PeriodCloseLib "../lib/period-close";
import Text "mo:core/Text";

mixin (
  periodCloses           : Map.Map<PeriodCloseTypes.PeriodCloseId, PeriodCloseTypes.PeriodClose>,
  periodCloseAudit       : List.List<PeriodCloseTypes.PeriodCloseAuditEntry>,
  periodCloseConfigs     : Map.Map<CommonTypes.CompanyId, PeriodCloseTypes.PeriodCloseConfig>,
  nextPeriodCloseAuditId : { var value : Nat },
  employees              : List.List<CompanyTypes.Employee>,
  principalToCompany     : Map.Map<Principal, CommonTypes.CompanyId>,
  principalToEmployee    : Map.Map<Principal, CommonTypes.EmployeeId>,
  timeEntries            : List.List<TrackingTypes.TimeEntry>,
  expenses               : List.List<TrackingTypes.Expense>,
  absences               : List.List<TrackingTypes.Absence>,
) {

  // ─── Hilfsfunktionen ──────────────────────────────────────────────────────

  private func pcCallerAuth(caller : Principal) : (CommonTypes.CompanyId, CommonTypes.EmployeeId) {
    let cid = switch (principalToCompany.get(caller)) {
      case null { Runtime.trap("Nicht authentifiziert") };
      case (?c) c;
    };
    let eid = switch (principalToEmployee.get(caller)) {
      case null { Runtime.trap("Kein Mitarbeiterdatensatz") };
      case (?e) e;
    };
    (cid, eid);
  };

  private func pcCallerRole(caller : Principal, companyId : CommonTypes.CompanyId) : CommonTypes.Role {
    switch (principalToEmployee.get(caller)) {
      case null { #employee };
      case (?eid) {
        switch (employees.find(func(e : CompanyTypes.Employee) : Bool = e.id == eid and e.companyId == companyId)) {
          case null { #employee };
          case (?e) e.role;
        };
      };
    };
  };

  // Prueft ob Caller berechtigt ist, Abschluss fuer einen Mitarbeiter durchzufuehren
  // Admin/Manager: ja. Employee: nein.
  private func canClose(callerRole : CommonTypes.Role) : Bool {
    switch (callerRole) {
      case (#admin) true;
      case (#manager) true;
      case (#employee) false;
    };
  };

  // Prueft ob Caller berechtigt ist, Periode wieder zu oeffnen gemaess Konfiguration
  private func canReopen(callerRole : CommonTypes.Role, config : PeriodCloseTypes.PeriodCloseConfig) : Bool {
    if (config.onlyAdminCanReopen) {
      callerRole == #admin;
    } else {
      switch (callerRole) {
        case (#admin) true;
        case (#manager) true;
        case (#employee) false;
      };
    };
  };

  // Erzeugt einen Audit-Eintrag
  private func addAudit(
    tenantId     : CommonTypes.CompanyId,
    employeeId   : ?CommonTypes.EmployeeId,
    periodStart  : Int,
    periodEnd    : Int,
    action       : PeriodCloseTypes.PeriodCloseAction,
    performedBy  : CommonTypes.EmployeeId,
    oldStatus    : PeriodCloseTypes.PeriodCloseStatus,
    newStatus    : PeriodCloseTypes.PeriodCloseStatus,
    reason       : ?Text,
    warnings     : ?[Text],
    counts       : ?PeriodCloseTypes.AffectedRecordCounts,
  ) {
    let aid = "PCA-" # nextPeriodCloseAuditId.value.toText();
    nextPeriodCloseAuditId.value += 1;
    let entry : PeriodCloseTypes.PeriodCloseAuditEntry = {
      auditId = aid;
      tenantId;
      employeeId;
      periodStart;
      periodEnd;
      action;
      performedByUserId = performedBy;
      performedAt = Time.now();
      oldStatus;
      newStatus;
      reason;
      warnings;
      affectedRecordCounts = counts;
    };
    periodCloseAudit.add(entry);
  };

  // Benachrichtigungen werden im Periodenabschluss nicht separat versendet;
  // die bestehende Notification-Infrastruktur wird nicht dupliziert.
  private func sendNotif(
    _tenantId   : CommonTypes.CompanyId,
    _recipientId : ?CommonTypes.EmployeeId,
    _role       : ?Text,
    _title      : Text,
    _body       : Text,
  ) {
    // no-op: Benachrichtigungen via bestehendes NotificationApi senden
  };

  // Zaehlt betroffene Datensaetze fuer einen Mitarbeiter und Monat
  private func countRecords(
    empId : CommonTypes.EmployeeId,
    cid   : CommonTypes.CompanyId,
    month : Nat,
    year  : Nat,
  ) : PeriodCloseTypes.AffectedRecordCounts {
    let start = PeriodCloseLib.monthStartNs(year, month);
    let endNs  = PeriodCloseLib.monthEndNs(year, month);
    // Zeiteintraege zaehlen: nutze date-String Vergleich (YYYY-MM-DD)
    let monthStr = (if (month < 10) "0" else "") # month.toText();
    let yearStr = year.toText();
    let prefix = yearStr # "-" # monthStr;
    let te = timeEntries.filter(func(e : TrackingTypes.TimeEntry) : Bool =
      e.employeeId == empId and e.companyId == cid and e.date.startsWith(#text prefix)
    ).size();
    let abs = absences.filter(func(a : TrackingTypes.Absence) : Bool =
      a.employeeId == empId and a.companyId == cid and a.dateFrom.startsWith(#text prefix)
    ).size();
    let exp = expenses.filter(func(x : TrackingTypes.Expense) : Bool =
      x.employeeId == empId and x.companyId == cid and x.date.startsWith(#text prefix)
    ).size();
    ignore (start, endNs);
    { timeEntries = te; absences = abs; expenses = exp };
  };

  // Gibt den Namen eines Mitarbeiters zurueck
  private func employeeName(empId : CommonTypes.EmployeeId, cid : CommonTypes.CompanyId) : Text {
    switch (employees.find(func(e : CompanyTypes.Employee) : Bool = e.id == empId and e.companyId == cid)) {
      case null { empId.toText() };
      case (?e) { e.firstName # " " # e.lastName };
    };
  };

  // ─── Oeffentliche API ─────────────────────────────────────────────────────

  // Gibt die Abschluss-Konfiguration des Mandanten zurueck
  public shared ({ caller }) func getPeriodCloseConfig(
    tenantId : CommonTypes.CompanyId,
  ) : async PeriodCloseTypes.PeriodCloseConfig {
    let (cid, _) = pcCallerAuth(caller);
    if (cid != tenantId) { Runtime.trap("Keine Berechtigung") };
    switch (periodCloseConfigs.get(tenantId)) {
      case null { PeriodCloseTypes.defaultPeriodCloseConfig };
      case (?cfg) cfg;
    };
  };

  // Aktualisiert die Abschluss-Konfiguration des Mandanten
  public shared ({ caller }) func updatePeriodCloseConfig(
    tenantId : CommonTypes.CompanyId,
    config   : PeriodCloseTypes.PeriodCloseConfig,
  ) : async CommonTypes.Result<()> {
    let (cid, _) = pcCallerAuth(caller);
    if (cid != tenantId) { return #err("Keine Berechtigung") };
    let role = pcCallerRole(caller, cid);
    if (role != #admin) { return #err("Nur Administratoren duerfen die Konfiguration aendern") };
    periodCloseConfigs.add(tenantId, config);
    #ok(());
  };

  // Gibt den Abschluss-Status eines Mitarbeiters fuer einen Monat zurueck
  public shared ({ caller }) func getPeriodCloseStatus(
    tenantId   : CommonTypes.CompanyId,
    employeeId : CommonTypes.EmployeeId,
    month      : Nat,
    year       : Nat,
  ) : async ?PeriodCloseTypes.PeriodClose {
    let (cid, _) = pcCallerAuth(caller);
    if (cid != tenantId) { Runtime.trap("Keine Berechtigung") };
    let closeId = PeriodCloseLib.buildCloseId(tenantId, ?employeeId, month, year);
    periodCloses.get(closeId);
  };

  // Gibt alle Abschluss-Eintraege fuer einen Mandanten und Monat zurueck
  public shared ({ caller }) func listPeriodCloses(
    tenantId : CommonTypes.CompanyId,
    month    : Nat,
    year     : Nat,
  ) : async [PeriodCloseTypes.PeriodClose] {
    let (cid, _) = pcCallerAuth(caller);
    if (cid != tenantId) { Runtime.trap("Keine Berechtigung") };
    let result = List.empty<PeriodCloseTypes.PeriodClose>();
    for ((_, pc) in periodCloses.entries()) {
      if (pc.tenantId == tenantId and pc.month == month and pc.year == year) {
        result.add(pc);
      };
    };
    result.toArray();
  };

  // Uebersichtszeilen fuer Monatsabschluss-Seite (Admin-Sicht)
  public shared ({ caller }) func getMonthlyCloseOverview(
    tenantId : CommonTypes.CompanyId,
    month    : Nat,
    year     : Nat,
  ) : async [PeriodCloseTypes.MonthlyCloseRow] {
    let (cid, _) = pcCallerAuth(caller);
    if (cid != tenantId) { Runtime.trap("Keine Berechtigung") };
    let role = pcCallerRole(caller, cid);
    if (role == #employee) { Runtime.trap("Nur Administratoren und Manager koennen die Uebersicht aufrufen") };
    let monthStr = (if (month < 10) "0" else "") # month.toText();
    let yearStr = year.toText();
    let prefix = yearStr # "-" # monthStr;
    let rows = List.empty<PeriodCloseTypes.MonthlyCloseRow>();
    for (emp in employees.values()) {
      if (emp.companyId == tenantId and emp.active) {
        let closeId = PeriodCloseLib.buildCloseId(tenantId, ?emp.id, month, year);
        let status : PeriodCloseTypes.PeriodCloseStatus = switch (periodCloses.get(closeId)) {
          case null { #open };
          case (?pc) pc.status;
        };
        let closeIdOpt : ?PeriodCloseTypes.PeriodCloseId = switch (periodCloses.get(closeId)) {
          case null { null };
          case (?pc) { ?pc.closeId };
        };
        let teCount = timeEntries.filter(func(e : TrackingTypes.TimeEntry) : Bool =
          e.employeeId == emp.id and e.companyId == tenantId and e.date.startsWith(#text prefix)
        ).size();
        let absCount = absences.filter(func(a : TrackingTypes.Absence) : Bool =
          a.employeeId == emp.id and a.companyId == tenantId and a.dateFrom.startsWith(#text prefix)
        ).size();
        let expCount = expenses.filter(func(x : TrackingTypes.Expense) : Bool =
          x.employeeId == emp.id and x.companyId == tenantId and x.date.startsWith(#text prefix)
        ).size();
        // Tatsaechliche Minuten aus Zeiteintraegen summieren
        var actualMinutes : Int = 0;
        for (te in timeEntries.values()) {
          if (te.employeeId == emp.id and te.companyId == tenantId and te.date.startsWith(#text prefix)) {
            actualMinutes += (te.hours * 60.0).toInt();
          };
        };
        rows.add({
          employeeId       = emp.id;
          firstName        = emp.firstName;
          lastName         = emp.lastName;
          month;
          year;
          status;
          actualMinutes;
          targetMinutes    = 0; // Wird im Frontend aus Beschaeftigung berechnet
          vacationDays     = 0;
          absenceCount     = absCount;
          expenseCount     = expCount;
          openEntryCount   = teCount;
          complianceStatus = "ok";
          closeId          = closeIdOpt;
        });
      };
    };
    rows.toArray();
  };

  // Vorpruefung fuer einen Mitarbeiter-Monat
  public shared ({ caller }) func precheckPeriodClose(
    tenantId   : CommonTypes.CompanyId,
    employeeId : CommonTypes.EmployeeId,
    month      : Nat,
    year       : Nat,
  ) : async PeriodCloseTypes.PrecheckResult {
    let (cid, _) = pcCallerAuth(caller);
    if (cid != tenantId) { Runtime.trap("Keine Berechtigung") };
    let config = switch (periodCloseConfigs.get(tenantId)) {
      case null { PeriodCloseTypes.defaultPeriodCloseConfig };
      case (?cfg) cfg;
    };
    let monthStr = (if (month < 10) "0" else "") # month.toText();
    let yearStr = year.toText();
    let prefix = yearStr # "-" # monthStr;
    // TimeEntry hat kein Status-Feld – alle erfassten Eintraege gelten als validiert.
    // Nur explizit offene Abwesenheiten und Spesen blockieren den Abschluss.
    let openTe : Nat = 0;
    // Offene Abwesenheiten (ausstehend / eingereicht)
    let openAbs = absences.filter(func(a : TrackingTypes.Absence) : Bool =
      a.employeeId == employeeId and a.companyId == tenantId and
      a.dateFrom.startsWith(#text prefix) and
      a.status == #submitted
    ).size();
    // Offene Spesen
    let openExp = expenses.filter(func(x : TrackingTypes.Expense) : Bool =
      x.employeeId == employeeId and x.companyId == tenantId and
      x.date.startsWith(#text prefix) and
      x.status == #pending
    ).size();
    PeriodCloseLib.runPrecheck(tenantId, employeeId, month, year, config, openTe, openAbs, openExp, 0, 0);
  };

  // Schliesst einen einzelnen Mitarbeiter-Monat ab
  public shared ({ caller }) func closePeriod(
    input : PeriodCloseTypes.ClosePeriodInput,
  ) : async CommonTypes.Result<PeriodCloseTypes.PeriodClose> {
    let (cid, callerEmpId) = pcCallerAuth(caller);
    if (cid != input.tenantId) { return #err("Keine Berechtigung") };
    let role = pcCallerRole(caller, cid);
    if (not canClose(role)) {
      return #err("Nur Administratoren und Manager duerfen Perioden abschliessen");
    };
    let config = switch (periodCloseConfigs.get(input.tenantId)) {
      case null { PeriodCloseTypes.defaultPeriodCloseConfig };
      case (?cfg) cfg;
    };
    if (not config.enabled) {
      return #err("Monatsabschluss ist fuer diesen Mandanten deaktiviert");
    };
    let empId : CommonTypes.EmployeeId = switch (input.employeeId) {
      case null { callerEmpId }; // Fallback, sollte immer gesetzt sein
      case (?eid) eid;
    };
    let closeId = PeriodCloseLib.buildCloseId(input.tenantId, ?empId, input.month, input.year);
    // Doppelter Abschluss verhindern
    switch (periodCloses.get(closeId)) {
      case (?existing) {
        if (existing.status == #closed) {
          return #err("Diese Periode ist bereits abgeschlossen");
        };
      };
      case null {};
    };
    // Vorpruefung
    let monthStr = (if (input.month < 10) "0" else "") # input.month.toText();
    let prefix = input.year.toText() # "-" # monthStr;
    // TimeEntry hat kein Status-Feld – keine offenen Zeiteintraege blockieren den Abschluss.
    let openTe : Nat = 0;
    let openAbs = absences.filter(func(a : TrackingTypes.Absence) : Bool =
      a.employeeId == empId and a.companyId == input.tenantId and
      a.dateFrom.startsWith(#text prefix) and
      a.status == #submitted
    ).size();
    let openExp = expenses.filter(func(x : TrackingTypes.Expense) : Bool =
      x.employeeId == empId and x.companyId == input.tenantId and
      x.date.startsWith(#text prefix) and
      x.status == #pending
    ).size();
    let precheck = PeriodCloseLib.runPrecheck(input.tenantId, empId, input.month, input.year, config, openTe, openAbs, openExp, 0, 0);
    if (not precheck.canClose) {
      // Audit-Eintrag fuer fehlgeschlagenen Abschluss
      let pStart = PeriodCloseLib.monthStartNs(input.year, input.month);
      let pEnd   = PeriodCloseLib.monthEndNs(input.year, input.month);
      let blockerMsg = if (precheck.blockers.size() > 0) { precheck.blockers[0] } else { "Vorpruefung fehlgeschlagen" };
      addAudit(input.tenantId, ?empId, pStart, pEnd, #close_failed, callerEmpId, #open, #open, input.closeComment, ?precheck.blockers, null);
      sendNotif(input.tenantId, ?empId, null, "Abschluss fehlgeschlagen", "Der Monatsabschluss fuer " # input.month.toText() # "/" # input.year.toText() # " konnte nicht durchgefuehrt werden: " # blockerMsg);
      return #err("Abschluss nicht moeglich: " # blockerMsg);
    };
    let now = Time.now();
    let pStart = PeriodCloseLib.monthStartNs(input.year, input.month);
    let pEnd   = PeriodCloseLib.monthEndNs(input.year, input.month);
    let counts = countRecords(empId, input.tenantId, input.month, input.year);
    let existing : ?PeriodCloseTypes.PeriodClose = periodCloses.get(closeId);
    let oldStatus : PeriodCloseTypes.PeriodCloseStatus = switch (existing) {
      case null { #open };
      case (?pc) pc.status;
    };
    let pc : PeriodCloseTypes.PeriodClose = {
      closeId;
      tenantId          = input.tenantId;
      employeeId        = ?empId;
      periodType        = #month;
      periodStart       = pStart;
      periodEnd         = pEnd;
      month             = input.month;
      year              = input.year;
      status            = #closed;
      closedAt          = ?now;
      closedByUserId    = ?callerEmpId;
      reopenedAt        = null;
      reopenedByUserId  = null;
      reopenReason      = null;
      closeComment      = input.closeComment;
      affectedRecordCounts = ?counts;
      createdAt         = switch (existing) { case null { now }; case (?e) { e.createdAt } };
      updatedAt         = now;
    };
    periodCloses.add(closeId, pc);
    addAudit(input.tenantId, ?empId, pStart, pEnd, #close, callerEmpId, oldStatus, #closed, input.closeComment, null, ?counts);
    // Benachrichtigung an Mitarbeiter
    let empName = employeeName(empId, input.tenantId);
    sendNotif(input.tenantId, ?empId, null, "Monat abgeschlossen", "Dein Monat " # input.month.toText() # "/" # input.year.toText() # " wurde abgeschlossen.");
    ignore empName;
    #ok(pc);
  };

  // Schliesst alle Mitarbeitenden eines Mandanten fuer einen Monat ab (Massenabschluss)
  public shared ({ caller }) func closePeriodBulk(
    tenantId     : CommonTypes.CompanyId,
    month        : Nat,
    year         : Nat,
    closeComment : ?Text,
  ) : async [CommonTypes.Result<PeriodCloseTypes.PeriodClose>] {
    let (cid, callerEmpId) = pcCallerAuth(caller);
    if (cid != tenantId) { return [] };
    let role = pcCallerRole(caller, cid);
    if (not canClose(role)) { return [] };
    let config = switch (periodCloseConfigs.get(tenantId)) {
      case null { PeriodCloseTypes.defaultPeriodCloseConfig };
      case (?cfg) cfg;
    };
    if (not config.enabled) { return [] };
    let results = List.empty<CommonTypes.Result<PeriodCloseTypes.PeriodClose>>();
    for (emp in employees.values()) {
      if (emp.companyId == tenantId and emp.active) {
        let input : PeriodCloseTypes.ClosePeriodInput = {
          tenantId;
          employeeId   = ?emp.id;
          month;
          year;
          closeComment;
        };
        let closeId = PeriodCloseLib.buildCloseId(tenantId, ?emp.id, month, year);
        // Bereits abgeschlossene ueberspringen
        let alreadyClosed = switch (periodCloses.get(closeId)) {
          case (?pc) { pc.status == #closed };
          case null  { false };
        };
        if (not alreadyClosed) {
          let monthStr = (if (month < 10) "0" else "") # month.toText();
          let prefix = year.toText() # "-" # monthStr;
          // TimeEntry hat kein Status-Feld – keine offenen Zeiteintraege blockieren den Abschluss.
          let openTe : Nat = 0;
          let openAbs = absences.filter(func(a : TrackingTypes.Absence) : Bool =
            a.employeeId == emp.id and a.companyId == tenantId and
            a.dateFrom.startsWith(#text prefix) and
            a.status == #submitted
          ).size();
          let openExp = expenses.filter(func(x : TrackingTypes.Expense) : Bool =
            x.employeeId == emp.id and x.companyId == tenantId and
            x.date.startsWith(#text prefix) and
            x.status == #pending
          ).size();
          let precheck = PeriodCloseLib.runPrecheck(tenantId, emp.id, month, year, config, openTe, openAbs, openExp, 0, 0);
          if (precheck.canClose) {
            let now = Time.now();
            let pStart = PeriodCloseLib.monthStartNs(year, month);
            let pEnd   = PeriodCloseLib.monthEndNs(year, month);
            let counts = countRecords(emp.id, tenantId, month, year);
            let existing = periodCloses.get(closeId);
            let oldStatus : PeriodCloseTypes.PeriodCloseStatus = switch (existing) {
              case null { #open };
              case (?pc) pc.status;
            };
            let pc : PeriodCloseTypes.PeriodClose = {
              closeId;
              tenantId;
              employeeId        = ?emp.id;
              periodType        = #month;
              periodStart       = pStart;
              periodEnd         = pEnd;
              month;
              year;
              status            = #closed;
              closedAt          = ?now;
              closedByUserId    = ?callerEmpId;
              reopenedAt        = null;
              reopenedByUserId  = null;
              reopenReason      = null;
              closeComment;
              affectedRecordCounts = ?counts;
              createdAt         = switch (existing) { case null { now }; case (?e) { e.createdAt } };
              updatedAt         = now;
            };
            periodCloses.add(closeId, pc);
            addAudit(tenantId, ?emp.id, pStart, pEnd, #close, callerEmpId, oldStatus, #closed, closeComment, null, ?counts);
            sendNotif(tenantId, ?emp.id, null, "Monat abgeschlossen", "Dein Monat " # month.toText() # "/" # year.toText() # " wurde abgeschlossen.");
            results.add(#ok(pc));
          } else {
            let pStart = PeriodCloseLib.monthStartNs(year, month);
            let pEnd   = PeriodCloseLib.monthEndNs(year, month);
            addAudit(tenantId, ?emp.id, pStart, pEnd, #close_failed, callerEmpId, #open, #open, closeComment, ?precheck.blockers, null);
            results.add(#err(emp.firstName # " " # emp.lastName # ": " # precheck.blockers[0]));
          };
        };
      };
    };
    results.toArray();
  };

  // Oeffnet eine abgeschlossene Periode wieder
  public shared ({ caller }) func reopenPeriod(
    input : PeriodCloseTypes.ReopenPeriodInput,
  ) : async CommonTypes.Result<PeriodCloseTypes.PeriodClose> {
    let (cid, callerEmpId) = pcCallerAuth(caller);
    let role = pcCallerRole(caller, cid);
    let config = switch (periodCloseConfigs.get(cid)) {
      case null { PeriodCloseTypes.defaultPeriodCloseConfig };
      case (?cfg) cfg;
    };
    if (not canReopen(role, config)) {
      return #err("Keine Berechtigung zum Wiedereroeffnen");
    };
    switch (periodCloses.get(input.closeId)) {
      case null { #err("Periodenabschluss nicht gefunden") };
      case (?pc) {
        if (pc.status != #closed and pc.status != #ready_for_close) {
          return #err("Diese Periode ist nicht abgeschlossen und kann nicht wiedereroeffnet werden");
        };
        if (config.requireReopenReason) {
          switch (input.reopenReason) {
            case null { return #err("Ein Grund fuer die Wiedereroeffnung ist erforderlich") };
            case (?r) { if (r == "") { return #err("Ein Grund fuer die Wiedereroeffnung ist erforderlich") } };
          };
        };
        let now = Time.now();
        let updated : PeriodCloseTypes.PeriodClose = {
          pc with
          status           = #reopened;
          reopenedAt       = ?now;
          reopenedByUserId = ?callerEmpId;
          reopenReason     = input.reopenReason;
          updatedAt        = now;
        };
        periodCloses.add(pc.closeId, updated);
        addAudit(pc.tenantId, pc.employeeId, pc.periodStart, pc.periodEnd, #reopen, callerEmpId, #closed, #reopened, input.reopenReason, null, null);
        // Benachrichtigung an Mitarbeiter
        switch (pc.employeeId) {
          case null {};
          case (?eid) {
            sendNotif(pc.tenantId, ?eid, null, "Periode wiedereroeffnet", "Dein Monat " # pc.month.toText() # "/" # pc.year.toText() # " wurde wiedereroeffnet.");
          };
        };
        #ok(updated);
      };
    };
  };

  // Zentrale serverseitige Sperrpruefung
  // Gibt #err zurueck wenn Periode abgeschlossen und keine Uebersteuerberechtigung
  public shared ({ caller }) func assertPeriodIsEditable(
    tenantId   : CommonTypes.CompanyId,
    employeeId : CommonTypes.EmployeeId,
    dateNs     : Int,
    action     : Text,
  ) : async CommonTypes.Result<()> {
    ignore action;
    let callerCid = switch (principalToCompany.get(caller)) {
      case null { return #err("Nicht authentifiziert") };
      case (?c) c;
    };
    if (callerCid != tenantId) { return #err("Keine Berechtigung") };
    // Alle Rollen werden gleichermassen durch die Periodensperre betroffen (keine Ausnahmen)
    // Periodensperre pruefen
    let allEntries = periodCloses.entries().toArray();
    PeriodCloseLib.checkPeriodEditable(allEntries, tenantId, employeeId, dateNs);
  };

  // Audit-Protokoll fuer Periodenabschluss-Aktionen
  public shared ({ caller }) func listPeriodCloseAudit(
    tenantId : CommonTypes.CompanyId,
  ) : async [PeriodCloseTypes.PeriodCloseAuditEntry] {
    let (cid, _) = pcCallerAuth(caller);
    if (cid != tenantId) { Runtime.trap("Keine Berechtigung") };
    periodCloseAudit.filter(func(e : PeriodCloseTypes.PeriodCloseAuditEntry) : Bool = e.tenantId == tenantId).toArray();
  };
};
