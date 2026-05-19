// Öffentliche API für Abwesenheiten und Urlaubsworkflow
import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import AccessControl "mo:caffeineai-authorization/access-control";
import EmailClient "mo:caffeineai-email/emailClient";
import CommonTypes "../types/common";
import CompanyTypes "../types/company";
import MasterTypes "../types/masterdata";
import TrackingTypes "../types/timetracking";
import AuditTypes "../types/audit";
import AbsenceLib "../lib/absences";
import AccessControlLib "../lib/AccessControlLib";
import ApprovalLib "../lib/timetracking-approval";
import ApprovalTypes "../types/timetracking-approval-and-feature-flags";

mixin (
  accessControlState : AccessControl.AccessControlState,
  companies : List.List<CompanyTypes.Company>,
  employees : List.List<CompanyTypes.Employee>,
  principalToCompany : Map.Map<Principal, CommonTypes.CompanyId>,
  principalToEmployee : Map.Map<Principal, CommonTypes.EmployeeId>,
  absenceTypes : List.List<MasterTypes.AbsenceType>,
  absences : List.List<TrackingTypes.Absence>,
  companySettings : Map.Map<CommonTypes.CompanyId, CompanyTypes.CompanySettings>,
  vacationBalances : List.List<CompanyTypes.VacationBalance>,
  nextAbsenceId : { var value : Nat },
  auditLog : List.List<AuditTypes.AuditEntry>,
  nextAuditId : { var value : Nat },
  auditLogEntriesV5 : List.List<AuditTypes.AuditLogEntry>,
  nextAuditLogId : { var value : Nat },
  absenceApprovalData : Map.Map<Nat, ApprovalLib.ApprovalRecord>,
) {
  // Hilfsfunktion: Authentifizierung prüfen
  private func absRequireAuth(caller : Principal) : (CommonTypes.CompanyId, CommonTypes.EmployeeId) {
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

  // Hilfsfunktion: Admin/Manager-Rolle prüfen (delegiert an AccessControlLib)
  private func absRequireAdminOrManager(caller : Principal, companyId : CommonTypes.CompanyId) : () {
    let company = switch (companies.find(func(c : CompanyTypes.Company) : Bool = c.id == companyId)) {
      case null { Runtime.trap("Firma nicht gefunden") };
      case (?c) c;
    };
    switch (AccessControlLib.requireRole(caller, company, [#admin, #manager], principalToEmployee, employees)) {
      case (#err(msg)) { Runtime.trap(msg) };
      case (#ok(_)) {};
    };
  };

  // Hilfsfunktion: Audit-Eintrag anhängen (Absences)
  private func absAppendAudit(
    changedBy : Principal,
    action : Text,
    targetType : Text,
    targetId : Nat,
    oldStatus : Text,
    newStatus : Text,
    previousApprovedBy : ?Principal,
    reason : ?Text,
  ) {
    let entry : AuditTypes.AuditEntry = {
      id = nextAuditId.value;
      timestamp = Time.now();
      changedBy;
      action;
      targetType;
      targetId;
      oldStatus;
      newStatus;
      previousApprovedBy;
      reason;
    };
    nextAuditId.value += 1;
    auditLog.add(entry);
  };
  // Hilfsfunktion: Caller-Name ermitteln
  private func absCallerName(caller : Principal, companyId : CommonTypes.CompanyId) : Text {
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

  // Hilfsfunktion: Abwesenheit als Text serialisieren
  private func absenceToText(a : TrackingTypes.Absence) : Text {
    "id=" # a.id.toText()
    # " companyId=" # a.companyId.toText()
    # " employeeId=" # a.employeeId.toText()
    # " absenceTypeId=" # a.absenceTypeId.toText()
    # " dateFrom=" # a.dateFrom
    # " dateTo=" # a.dateTo
    # " ganztaetig=" # debug_show(a.ganztaetig)
    # " dauer=" # a.dauer.toText()
    # " description=" # debug_show(a.description)
    # " status=" # debug_show(a.status)
    # " rejectionComment=" # debug_show(a.rejectionComment)
    # " resetReason=" # debug_show(a.resetReason)
    # " approvedBy=" # debug_show(a.approvedBy)
    # " createdAt=" # a.createdAt.toText();
  };

  // Hilfsfunktion: Strukturierten Audit-Log-Eintrag schreiben
  private func appendAbsenceAudit(
    caller      : Principal,
    companyId   : CommonTypes.CompanyId,
    operation   : AuditTypes.AuditOperation,
    entityType  : AuditTypes.AuditEntityType,
    entityId    : Text,
    beforeState : ?Text,
    afterState  : ?Text,
  ) {
    let id = "AL-" # nextAuditLogId.value.toText();
    nextAuditLogId.value += 1;
    let entry : AuditTypes.AuditLogEntry = {
      id;
      companyId;
      timestamp      = Time.now();
      operation;
      entityType;
      entityId;
      actorPrincipal = caller.toText();
      actorName      = absCallerName(caller, companyId);
      beforeState;
      afterState;
      fieldChanges   = null;
    };
    auditLogEntriesV5.add(entry);
  };

  // Erstellt einen neuen Abwesenheitseintrag (Ferien löst Workflow und E-Mail aus)
  public shared ({ caller }) func createAbsence(
    input : TrackingTypes.CreateAbsenceInput
  ) : async CommonTypes.Result<TrackingTypes.Absence> {
    let (companyId, employeeId) = absRequireAuth(caller);
    let id = nextAbsenceId.value;
    nextAbsenceId.value += 1;

    // Prüfen ob es sich um Ferien handelt (requiresApproval = true)
    // Ferien dürfen NICHT als eigenständige Abwesenheitsart in der Auswahl erscheinen
    // (das wird im Frontend sichergestellt), aber hier prüfen wir den Typ für das Audit-Log.
    let absenceTypeOpt = absenceTypes.find(func(at) { at.id == input.absenceTypeId and at.companyId == companyId });
    let requiresApproval = switch (absenceTypeOpt) {
      case null { false };
      case (?at) at.requiresApproval;
    };
    let isFerien = switch (absenceTypeOpt) {
      case null { false };
      case (?at) { at.name == "Ferien" };
    };

    let absence = AbsenceLib.createAbsence(absences, id, companyId, employeeId, input, requiresApproval);

    // Audit-Log: entityType=#ferien für Ferien, sonst #absence
    let auditEntityType : AuditTypes.AuditEntityType = if (isFerien) { #ferien } else { #absence };
    appendAbsenceAudit(caller, companyId, #create, auditEntityType, id.toText(), null, ?absenceToText(absence));

    if (requiresApproval) {
      // Mitarbeiterdaten für die E-Mail holen
      let empName = switch (employees.find(func(e) { e.id == employeeId })) {
        case null { "Unbekannt" };
        case (?e) { e.firstName # " " # e.lastName };
      };
      // E-Mail an Admin/Manager senden
      let adminEmails = employees.filter(func(e) {
        e.companyId == companyId and (e.role == #admin or e.role == #manager)
      }).map(func(e : CompanyTypes.Employee) : Text { e.email }).toArray();

      if (adminEmails.size() > 0) {
        ignore await EmailClient.sendServiceEmail(
          "no-reply",
          adminEmails,
          "Neuer Antrag von " # empName,
          "<p>Ein neuer Abwesenheitsantrag wurde eingereicht.</p><p><strong>Mitarbeiter:</strong> " # empName # "</p><p><strong>Von:</strong> " # input.dateFrom # "</p><p><strong>Bis:</strong> " # input.dateTo # "</p>",
        );
      };
    } else {
      // Abwesenheit ohne Genehmigungsworkflow: automatisch einen genehmigten Eintrag erstellen,
      // damit die Absenz später über den Genehmigungsbereich zurückgesetzt und bearbeitet werden kann.
      absenceApprovalData.add(
        id,
        { status = #approved; approvedBy = ?caller; reason = ?"Automatisch genehmigt" },
      );
    };

    #ok(absence);
  };

  // Gibt gefilterte Abwesenheiten zurück
  public query ({ caller }) func listAbsences(
    filter : TrackingTypes.AbsenceFilter
  ) : async [TrackingTypes.Absence] {
    let companyId = switch (principalToCompany.get(caller)) {
      case null { Runtime.trap("Nicht authentifiziert") };
      case (?cid) cid;
    };
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
    let effectiveFilter : TrackingTypes.AbsenceFilter = switch (empRole) {
      case (#admin) filter;
      case (#manager) filter;
      case (#employee) {
        { filter with employeeId = employeeId };
      };
    };
    AbsenceLib.listAbsences(absences, companyId, effectiveFilter);
  };

  // Genehmigt eine Abwesenheit/Ferien (Manager/Admin) — sendet E-Mail an Mitarbeiter
  public shared ({ caller }) func approveAbsence(
    id : CommonTypes.AbsenceId
  ) : async CommonTypes.Result<TrackingTypes.Absence> {
    let companyId = switch (principalToCompany.get(caller)) {
      case null { return #err("Nicht authentifiziert") };
      case (?cid) cid;
    };
    absRequireAdminOrManager(caller, companyId);

    // Abwesenheit suchen, um die EmployeeId zu ermitteln
    let absenceOpt = absences.find(func(a) { a.id == id and a.companyId == companyId });
    let targetEmployeeId = switch (absenceOpt) {
      case null { return #err("Abwesenheit nicht gefunden") };
      case (?a) a.employeeId;
    };

    // Ferienguthaben-Verfallsprüfung
    let now = Time.now();
    let settings = switch (companySettings.get(companyId)) {
      case (?s) s;
      case null {
        {
          companyId;
          emailNewVacationRequest = true;
          emailOnApproval = true;
          vacationCarryoverDays = 5;
          maxVacationDays = 20;
          approvalRequired = true;
          timezone = "Europe/Zurich";
          allowExpiredVacationBalance = false;
        };
      };
    };
    if (not settings.allowExpiredVacationBalance) {
      let allBalances = vacationBalances.filter(func(vb) {
        vb.employeeId == targetEmployeeId and vb.companyId == companyId
      });
      let hasAnyBalance = allBalances.size() > 0;
      let hasValidBalance = allBalances.find(func(vb) {
        switch (vb.verfallsdatum) {
          case (?vd) {
            let vdNs : Int = if (vd < 5_000_000_000) {
              vd * 1_000_000_000;
            } else if (vd < 10_000_000_000_000_000) {
              vd * 1_000_000;
            } else {
              vd;
            };
            vdNs >= now;
          };
          case null true;
        }
      });
      if (hasAnyBalance and hasValidBalance == null) {
        return #err("Ferienguthaben abgelaufen");
      };
    };

    // Alten Zustand vor der Genehmigung erfassen
    let oldStatusText = switch (absenceOpt) {
      case null { "unbekannt" };
      case (?a) {
        switch (a.status) {
          case (#submitted) "ausstehend";
          case (#approved) "genehmigt";
          case (#rejected) "abgelehnt";
        };
      };
    };
    let beforeStateText = switch (absenceOpt) {
      case null { null };
      case (?a) { ?absenceToText(a) };
    };

    // Entitätstyp ermitteln (Ferien vs. Abwesenheit)
    let entityType : AuditTypes.AuditEntityType = switch (absenceOpt) {
      case null { #absence };
      case (?a) {
        switch (absenceTypes.find(func(at) { at.id == a.absenceTypeId and at.companyId == companyId })) {
          case (?at) { if (at.name == "Ferien") #ferien else #absence };
          case null { #absence };
        };
      };
    };

    switch (AbsenceLib.approveAbsence(absences, companyId, id, caller)) {
      case null { #err("Abwesenheit nicht gefunden") };
      case (?absence) {
        // Legacy Audit-Eintrag
        absAppendAudit(caller, "approved", "absence", id, oldStatusText, "genehmigt", null, null);

        // Strukturierter Audit-Log: CRUD-Eintrag
        appendAbsenceAudit(caller, companyId, #update, entityType, id.toText(), beforeStateText, ?absenceToText(absence));

        // Strukturierter Audit-Log: Genehmigungsentscheidung
        let empName = switch (employees.find(func(e) { e.id == absence.employeeId })) {
          case null { "Unbekannt" };
          case (?e) { e.firstName # " " # e.lastName };
        };
        let decisionState = "Genehmigt | Typ=" # debug_show(entityType) # " | Mitarbeiter=" # empName # " | Entscheider=" # absCallerName(caller, companyId);
        appendAbsenceAudit(caller, companyId, #approve, #approval, id.toText(), ?oldStatusText, ?decisionState);

        // E-Mail an Mitarbeiter senden
        let empEmail = switch (employees.find(func(e) { e.id == absence.employeeId })) {
          case null { null };
          case (?e) { ?e.email };
        };
        switch (empEmail) {
          case null {};
          case (?email) {
            ignore await EmailClient.sendServiceEmail(
              "no-reply",
              [email],
              "Ihr Ferienantrag wurde genehmigt",
              "<p>Ihr Ferienantrag vom <strong>" # absence.dateFrom # "</strong> bis <strong>" # absence.dateTo # "</strong> wurde genehmigt.</p>",
            );
          };
        };
        #ok(absence);
      };
    };
  };

  // Lehnt eine Abwesenheit/Ferien ab mit Kommentar (Manager/Admin) — sendet E-Mail an Mitarbeiter
  public shared ({ caller }) func rejectAbsence(
    id : CommonTypes.AbsenceId,
    comment : Text,
  ) : async CommonTypes.Result<TrackingTypes.Absence> {
    let companyId = switch (principalToCompany.get(caller)) {
      case null { return #err("Nicht authentifiziert") };
      case (?cid) cid;
    };
    absRequireAdminOrManager(caller, companyId);

    // Alten Zustand vor der Ablehnung erfassen
    let absenceOpt = absences.find(func(a) { a.id == id and a.companyId == companyId });
    let oldStatusText = switch (absenceOpt) {
      case null { "unbekannt" };
      case (?a) {
        switch (a.status) {
          case (#submitted) "ausstehend";
          case (#approved) "genehmigt";
          case (#rejected) "abgelehnt";
        };
      };
    };
    let beforeStateText = switch (absenceOpt) {
      case null { null };
      case (?a) { ?absenceToText(a) };
    };

    // Entitätstyp ermitteln (Ferien vs. Abwesenheit)
    let entityType : AuditTypes.AuditEntityType = switch (absenceOpt) {
      case null { #absence };
      case (?a) {
        switch (absenceTypes.find(func(at) { at.id == a.absenceTypeId and at.companyId == companyId })) {
          case (?at) { if (at.name == "Ferien") #ferien else #absence };
          case null { #absence };
        };
      };
    };

    switch (AbsenceLib.rejectAbsence(absences, companyId, id, caller, comment)) {
      case null { #err("Abwesenheit nicht gefunden") };
      case (?absence) {
        // Legacy Audit-Eintrag
        absAppendAudit(caller, "rejected", "absence", id, oldStatusText, "abgelehnt", null, ?comment);

        // Strukturierter Audit-Log: CRUD-Eintrag
        appendAbsenceAudit(caller, companyId, #update, entityType, id.toText(), beforeStateText, ?absenceToText(absence));

        // Strukturierter Audit-Log: Genehmigungsentscheidung
        let empName = switch (employees.find(func(e) { e.id == absence.employeeId })) {
          case null { "Unbekannt" };
          case (?e) { e.firstName # " " # e.lastName };
        };
        let decisionState = "Abgelehnt | Typ=" # debug_show(entityType) # " | Mitarbeiter=" # empName # " | Entscheider=" # absCallerName(caller, companyId) # " | Kommentar=" # comment;
        appendAbsenceAudit(caller, companyId, #reject, #approval, id.toText(), ?oldStatusText, ?decisionState);

        // E-Mail an Mitarbeiter senden
        let empEmail = switch (employees.find(func(e) { e.id == absence.employeeId })) {
          case null { null };
          case (?e) { ?e.email };
        };
        switch (empEmail) {
          case null {};
          case (?email) {
            ignore await EmailClient.sendServiceEmail(
              "no-reply",
              [email],
              "Ihr Ferienantrag wurde abgelehnt",
              "<p>Ihr Ferienantrag vom <strong>" # absence.dateFrom # "</strong> bis <strong>" # absence.dateTo # "</strong> wurde abgelehnt.</p><p><strong>Kommentar:</strong> " # comment # "</p>",
            );
          };
        };
        #ok(absence);
      };
    };
  };

  // Aktualisiert eine Abwesenheit (nur im Status #submitted oder #rejected)
  public shared ({ caller }) func updateAbsence(
    id : CommonTypes.AbsenceId,
    input : TrackingTypes.UpdateAbsenceInput,
  ) : async CommonTypes.Result<TrackingTypes.Absence> {
    let (companyId, employeeId) = absRequireAuth(caller);
    let beforeOpt = absences.find(func(a) { a.id == id and a.companyId == companyId and a.employeeId == employeeId });
    switch (AbsenceLib.updateAbsence(absences, companyId, id, employeeId, input)) {
      case null { #err("Abwesenheit nicht gefunden oder keine Berechtigung") };
      case (?a) {
        let beforeText = switch (beforeOpt) { case null { null }; case (?b) { ?absenceToText(b) } };
        appendAbsenceAudit(caller, companyId, #update, #absence, id.toText(), beforeText, ?absenceToText(a));
        #ok(a)
      };
    };
  };

  // Löscht eine Abwesenheit (nur im Status #submitted oder #rejected)
  public shared ({ caller }) func deleteAbsence(
    id : CommonTypes.AbsenceId
  ) : async CommonTypes.Result<()> {
    let (companyId, employeeId) = absRequireAuth(caller);
    // Genehmigungsstatus prüfen: genehmigte Einträge dürfen nicht direkt gelöscht werden
    switch (absenceApprovalData.get(id)) {
      case (?approvalRecord) {
        if (approvalRecord.status == #approved) {
          return #err("Dieser Eintrag wurde bereits genehmigt. Bitte den Vorgesetzten bitten, die Genehmigung zuerst zurückzusetzen.");
        };
      };
      case null {};
    };
    let beforeOpt = absences.find(func(a) { a.id == id and a.companyId == companyId and a.employeeId == employeeId });
    if (AbsenceLib.deleteAbsence(absences, companyId, id, employeeId)) {
      let beforeText = switch (beforeOpt) { case null { null }; case (?b) { ?absenceToText(b) } };
      let deleteEntityType : AuditTypes.AuditEntityType = switch (beforeOpt) {
        case null { #absence };
        case (?a) {
          switch (absenceTypes.find(func(at) { at.id == a.absenceTypeId and at.companyId == companyId })) {
            case (?at) { if (at.name == "Ferien") #ferien else #absence };
            case null { #absence };
          };
        };
      };
      appendAbsenceAudit(caller, companyId, #remove, deleteEntityType, id.toText(), beforeText, null);
      #ok(());
    } else {
      #err("Abwesenheit nicht gefunden oder keine Berechtigung");
    };
  };

  // Setzt eine genehmigte Abwesenheit/Ferien auf ausstehend zurück (Admin/Manager)
  // Hilfsfunktion: Abwesenheitseintrag für Firmenkalender maskieren (serverseitig)
  private func maskCalendarAbsence(
    absence      : TrackingTypes.Absence,
    viewerEmpId  : CommonTypes.EmployeeId,
    viewerRole   : CommonTypes.Role,
    absenceType  : ?MasterTypes.AbsenceType,
  ) : ?TrackingTypes.MaskedCalendarAbsence {
    let isOwn = absence.employeeId == viewerEmpId;

    // Hilfsfunktion: Anzeigename ermitteln
    let typeName : Text = switch (absenceType) {
      case null { "Abwesenheit" };
      case (?at) {
        switch (at.visibility) {
          case null { at.name };
          case (?v) { switch (v.companyCalendarDisplayName) { case (?n) n; case null at.name } };
        };
      };
    };
    let displayColor : ?Text = switch (absenceType) {
      case null { null };
      case (?at) {
        switch (at.visibility) {
          case null { null };
          case (?v) { v.companyCalendarColor };
        };
      };
    };

    // Abgelehnte Einträge: eigene immer zeigen, fremde nie
    switch (absence.status) {
      case (#rejected) {
        if (not isOwn) { return null };
      };
      case (_) {};
    };

    let statusText : Text = switch (absence.status) {
      case (#submitted) "ausstehend";
      case (#approved)  "genehmigt";
      case (#rejected)  "abgelehnt";
    };

    // Eigenen Eintrag immer vollständig anzeigen
    if (isOwn) {
      let empName = switch (employees.find(func(e) { e.id == absence.employeeId })) {
        case null { null };
        case (?e) { ?(e.firstName # " " # e.lastName) };
      };
      return ?{
        id             = absence.id.toText();
        employeeId     = ?(absence.employeeId.toText());
        employeeName   = empName;
        fromDate       = absence.dateFrom;
        toDate         = absence.dateTo;
        displayTitle   = typeName;
        displayColor;
        isOwnEntry     = true;
        visibilityMode = "full";
        status         = statusText;
      };
    };

    // Fremde Einträge: Sichtbarkeitskonfiguration ermitteln
    let visConfig : ?MasterTypes.AbsenceTypeVisibility = switch (absenceType) {
      case null { null };
      case (?at) { at.visibility };
    };

    // Effektiven Modus ermitteln
    // Wenn keine visConfig → als vollständig sichtbar behandeln (Rückwärtskompatibilität)
    let effectiveMode : MasterTypes.CalendarVisibilityMode = switch (visConfig) {
      case null { #full };
      case (?v) {
        if (not v.visibleInCompanyCalendar) { #hidden } else { v.visibilityMode };
      };
    };

    // Versteckten Einträgen: niemals zurückgeben
    if (effectiveMode == #hidden) { return null };

    // Admin/Manager sehen fremde, nicht-versteckte Einträge IMMER vollständig
    let isPrivilegedViewer : Bool = switch (viewerRole) {
      case (#admin or #manager) { true };
      case (#employee) { false };
    };

    let resolvedMode : MasterTypes.CalendarVisibilityMode = if (isPrivilegedViewer) {
      #full;
    } else {
      effectiveMode;
    };

    switch (resolvedMode) {
      case (#hidden) { null }; // Kann hier nicht mehr auftreten, aber sicherheitshalber
      case (#full) {
        let empName = switch (employees.find(func(e) { e.id == absence.employeeId })) {
          case null { null };
          case (?e) { ?(e.firstName # " " # e.lastName) };
        };
        ?{
          id             = absence.id.toText();
          employeeId     = ?(absence.employeeId.toText());
          employeeName   = empName;
          fromDate       = absence.dateFrom;
          toDate         = absence.dateTo;
          displayTitle   = typeName;
          displayColor;
          isOwnEntry     = false;
          visibilityMode = "full";
          status         = statusText;
        };
      };
      case (#masked_reason) {
        let empName : ?Text = switch (visConfig) {
          case null { null };
          case (?v) {
            if (v.showEmployeeName) {
              switch (employees.find(func(e) { e.id == absence.employeeId })) {
                case null { null };
                case (?e) { ?(e.firstName # " " # e.lastName) };
              };
            } else { null };
          };
        };
        let maskedTitle : Text = switch (visConfig) {
          case null { "Nicht verfügbar" };
          case (?v) { switch (v.companyCalendarDisplayName) { case (?n) n; case null "Nicht verfügbar" } };
        };
        ?{
          id             = absence.id.toText();
          employeeId     = ?(absence.employeeId.toText());
          employeeName   = empName;
          fromDate       = absence.dateFrom;
          toDate         = absence.dateTo;
          displayTitle   = maskedTitle;
          displayColor;
          isOwnEntry     = false;
          visibilityMode = "masked_reason";
          status         = statusText;
        };
      };
      case (#anonymized) {
        let anonTitle : Text = switch (visConfig) {
          case null { "Abwesenheit" };
          case (?v) { switch (v.companyCalendarDisplayName) { case (?n) n; case null "Abwesenheit" } };
        };
        ?{
          id             = absence.id.toText();
          employeeId     = null;
          employeeName   = null;
          fromDate       = absence.dateFrom;
          toDate         = absence.dateTo;
          displayTitle   = anonTitle;
          displayColor;
          isOwnEntry     = false;
          visibilityMode = "anonymized";
          status         = statusText;
        };
      };
    };
  };

  // Gibt sichtbare Abwesenheiten für den Firmenkalender zurück (serverseitig maskiert)
  public query ({ caller }) func getCompanyCalendarAbsences(
    companyId : CommonTypes.CompanyId,
    fromDateNs : Int,
    toDateNs   : Int,
  ) : async [TrackingTypes.MaskedCalendarAbsence] {
    // Mandantenisolation: Caller muss zum gefragten Mandanten gehören
    let callerCompanyId = switch (principalToCompany.get(caller)) {
      case null { return [] };
      case (?cid) cid;
    };
    if (callerCompanyId != companyId) { return [] };

    let callerEmpId = switch (principalToEmployee.get(caller)) {
      case null { return [] };
      case (?eid) eid;
    };
    let callerRole : CommonTypes.Role = switch (employees.find(func(e) { e.id == callerEmpId and e.companyId == companyId })) {
      case null { #employee };
      case (?e) { e.role };
    };

    // Alle Abwesenheiten der Firma laden und serverseitig maskieren.
    // fromDateNs / toDateNs werden als Nanosekunden-Epochenwert übergeben;
    // Abwesenheiten speichern Datum als Text (YYYY-MM-DD), daher gibt der
    // Client den sichtbaren Zeitraum an und wir geben alle Einträge zurück
    // (der Client filtert nach Datum). Maskierung und Berechtigungsfilterung
    // erfolgen vollständig in maskCalendarAbsence.
    let results = List.empty<TrackingTypes.MaskedCalendarAbsence>();
    for (absence in absences.values()) {
      if (absence.companyId == companyId) {
        let absTypeOpt = absenceTypes.find(func(at) { at.id == absence.absenceTypeId and at.companyId == companyId });
        switch (maskCalendarAbsence(absence, callerEmpId, callerRole, absTypeOpt)) {
          case null {};
          case (?masked) { results.add(masked) };
        };
      };
    };
    results.toArray();
  };


  public shared ({ caller }) func resetAbsenceToAusstehend(
    id : CommonTypes.AbsenceId,
    reason : Text,
  ) : async CommonTypes.Result<TrackingTypes.Absence> {
    let companyId = switch (principalToCompany.get(caller)) {
      case null { return #err("Nicht authentifiziert") };
      case (?cid) cid;
    };
    absRequireAdminOrManager(caller, companyId);

    // Bestehenden approvedBy-Wert VOR dem Zurücksetzen erfassen
    let previousApprovedBy = switch (absences.find(func(a) { a.id == id and a.companyId == companyId })) {
      case null { null };
      case (?a) { a.approvedBy };
    };

    switch (AbsenceLib.resetAbsenceToAusstehend(absences, companyId, id, reason)) {
      case null { #err("Abwesenheit nicht gefunden oder nicht im Status 'genehmigt'") };
      case (?a) {
        // Audit-Eintrag VOR dem Zurücksetzen schreiben (approvedBy bereits erfasst)
        absAppendAudit(caller, "reset", "absence", id, "genehmigt", "ausstehend", previousApprovedBy, ?reason);
        #ok(a);
      };
    };
  };
};
