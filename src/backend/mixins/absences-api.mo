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

  // Hilfsfunktion: Admin/Manager-Rolle prüfen
  private func absRequireAdminOrManager(caller : Principal, companyId : CommonTypes.CompanyId) : () {
    let empId = switch (principalToEmployee.get(caller)) {
      case null { Runtime.trap("Mitarbeiter nicht gefunden") };
      case (?eid) eid;
    };
    let emp = switch (employees.find(func(e) { e.id == empId and e.companyId == companyId })) {
      case null { Runtime.trap("Mitarbeiter nicht gefunden") };
      case (?e) e;
    };
    if (emp.role != #admin and emp.role != #manager) {
      Runtime.trap("Keine Berechtigung: Nur Admin oder Manager");
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

  // Erstellt einen neuen Abwesenheitseintrag (Ferien löst Workflow und E-Mail aus)
  public shared ({ caller }) func createAbsence(
    input : TrackingTypes.CreateAbsenceInput
  ) : async CommonTypes.Result<TrackingTypes.Absence> {
    let (companyId, employeeId) = absRequireAuth(caller);
    let id = nextAbsenceId.value;
    nextAbsenceId.value += 1;

    // Prüfen ob es sich um Ferien handelt (requiresApproval = true)
    let absenceTypeOpt = absenceTypes.find(func(at) { at.id == input.absenceTypeId and at.companyId == companyId });
    let requiresApproval = switch (absenceTypeOpt) {
      case null { false };
      case (?at) at.requiresApproval;
    };

    let absence = AbsenceLib.createAbsence(absences, id, companyId, employeeId, input, requiresApproval);

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
          "Neuer Ferienantrag von " # empName,
          "<p>Ein neuer Ferienantrag wurde eingereicht.</p><p><strong>Mitarbeiter:</strong> " # empName # "</p><p><strong>Von:</strong> " # input.dateFrom # "</p><p><strong>Bis:</strong> " # input.dateTo # "</p>",
        );
      };
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
      // Prüfen ob ein abgelaufenes Ferienguthaben für diesen Mitarbeiter existiert
      let expiredBalance = vacationBalances.find(func(vb) {
        vb.employeeId == targetEmployeeId and vb.companyId == companyId and
        (switch (vb.verfallsdatum) {
          case (?vd) vd < now;
          case null false;
        })
      });
      switch (expiredBalance) {
        case (?_) { return #err("Ferienguthaben abgelaufen") };
        case null {};
      };
    };

    // Alten Status erfassen (vor der Genehmigung)
    let oldStatus = switch (absenceOpt) {
      case null { "unbekannt" };
      case (?a) {
        switch (a.status) {
          case (#submitted) "ausstehend";
          case (#approved) "genehmigt";
          case (#rejected) "abgelehnt";
        };
      };
    };

    switch (AbsenceLib.approveAbsence(absences, companyId, id, caller)) {
      case null { #err("Abwesenheit nicht gefunden") };
      case (?absence) {
        // Audit-Eintrag schreiben
        absAppendAudit(caller, "approved", "absence", id, oldStatus, "genehmigt", null, null);

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

    // Alten Status erfassen (vor der Ablehnung)
    let oldStatusText = switch (absences.find(func(a) { a.id == id and a.companyId == companyId })) {
      case null { "unbekannt" };
      case (?a) {
        switch (a.status) {
          case (#submitted) "ausstehend";
          case (#approved) "genehmigt";
          case (#rejected) "abgelehnt";
        };
      };
    };

    switch (AbsenceLib.rejectAbsence(absences, companyId, id, caller, comment)) {
      case null { #err("Abwesenheit nicht gefunden") };
      case (?absence) {
        // Audit-Eintrag schreiben
        absAppendAudit(caller, "rejected", "absence", id, oldStatusText, "abgelehnt", null, ?comment);

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
    switch (AbsenceLib.updateAbsence(absences, companyId, id, employeeId, input)) {
      case null { #err("Abwesenheit nicht gefunden oder keine Berechtigung") };
      case (?a) { #ok(a) };
    };
  };

  // Löscht eine Abwesenheit (nur im Status #submitted oder #rejected)
  public shared ({ caller }) func deleteAbsence(
    id : CommonTypes.AbsenceId
  ) : async CommonTypes.Result<()> {
    let (companyId, employeeId) = absRequireAuth(caller);
    if (AbsenceLib.deleteAbsence(absences, companyId, id, employeeId)) {
      #ok(());
    } else {
      #err("Abwesenheit nicht gefunden oder keine Berechtigung");
    };
  };

  // Setzt eine genehmigte Abwesenheit/Ferien auf ausstehend zurück (Admin/Manager)
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
