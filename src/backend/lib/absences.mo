// Domänenlogik für Abwesenheiten und Urlaubsworkflow
import List "mo:core/List";
import Time "mo:core/Time";
import CommonTypes "../types/common";
import TrackingTypes "../types/timetracking";

module {
  public type CompanyId = CommonTypes.CompanyId;
  public type EmployeeId = CommonTypes.EmployeeId;
  public type AbsenceId = CommonTypes.AbsenceId;

  // Hilfsfunktion: Datumsvergleich (Text im Format YYYY-MM-DD)
  private func dateInRange(dateFrom : Text, dateTo : Text, from : ?Text, to : ?Text) : Bool {
    let afterFrom = switch (from) {
      case null { true };
      case (?f) { dateTo >= f };
    };
    let beforeTo = switch (to) {
      case null { true };
      case (?t) { dateFrom <= t };
    };
    afterFrom and beforeTo;
  };

  // Gibt alle Abwesenheiten eines Unternehmens gefiltert zurück
  public func listAbsences(
    absences : List.List<TrackingTypes.Absence>,
    companyId : CompanyId,
    filter : TrackingTypes.AbsenceFilter,
  ) : [TrackingTypes.Absence] {
    absences.filter(func(a) {
      if (a.companyId != companyId) { return false };
      switch (filter.employeeId) {
        case (?eid) { if (a.employeeId != eid) return false };
        case null {};
      };
      switch (filter.status) {
        case (?s) { if (a.status != s) return false };
        case null {};
      };
      switch (filter.absenceTypeId) {
        case (?atid) { if (a.absenceTypeId != atid) return false };
        case null {};
      };
      if (not dateInRange(a.dateFrom, a.dateTo, filter.dateFrom, filter.dateTo)) { return false };
      true;
    }).toArray();
  };

  // Erstellt einen neuen Abwesenheitseintrag
  // requiresApproval: true = Workflow (Ferien), false = sofort genehmigt (Krankheit, etc.)
  public func createAbsence(
    absences : List.List<TrackingTypes.Absence>,
    nextId : Nat,
    companyId : CompanyId,
    employeeId : EmployeeId,
    input : TrackingTypes.CreateAbsenceInput,
    requiresApproval : Bool,
  ) : TrackingTypes.Absence {
    let initialStatus : TrackingTypes.AbsenceStatus = if (requiresApproval) {
      #submitted
    } else {
      #approved
    };
    let absence : TrackingTypes.Absence = {
      id = nextId;
      companyId;
      employeeId;
      absenceTypeId = input.absenceTypeId;
      dateFrom = input.dateFrom;
      dateTo = input.dateTo;
      ganztaetig = input.ganztaetig;
      dauer = if (input.ganztaetig) { 0 } else { input.dauer };
      description = input.description;
      status = initialStatus;
      rejectionComment = null;
      resetReason = null;
      approvedBy = null;
      createdAt = Time.now();
    };
    absences.add(absence);
    absence;
  };

  // Genehmigt eine Abwesenheit (Manager/Admin)
  public func approveAbsence(
    absences : List.List<TrackingTypes.Absence>,
    companyId : CompanyId,
    absenceId : AbsenceId,
    _approver : Principal,
  ) : ?TrackingTypes.Absence {
    var result : ?TrackingTypes.Absence = null;
    absences.mapInPlace(func(a) {
      if (a.id == absenceId and a.companyId == companyId) {
        let updated : TrackingTypes.Absence = {
          a with
          status = #approved;
          approvedBy = ?_approver;
        };
        result := ?updated;
        updated;
      } else { a };
    });
    result;
  };

  // Lehnt eine Abwesenheit ab (Manager/Admin)
  public func rejectAbsence(
    absences : List.List<TrackingTypes.Absence>,
    companyId : CompanyId,
    absenceId : AbsenceId,
    _approver : Principal,
    comment : Text,
  ) : ?TrackingTypes.Absence {
    var result : ?TrackingTypes.Absence = null;
    absences.mapInPlace(func(a) {
      if (a.id == absenceId and a.companyId == companyId) {
        let updated : TrackingTypes.Absence = {
          a with
          status = #rejected;
          rejectionComment = ?comment;
        };
        result := ?updated;
        updated;
      } else { a };
    });
    result;
  };

  // Aktualisiert eine Abwesenheit (im Status #submitted oder #rejected)
  // Bei #rejected wird der Status nach dem Speichern auf #submitted zurückgesetzt
  public func updateAbsence(
    absences : List.List<TrackingTypes.Absence>,
    companyId : CompanyId,
    absenceId : AbsenceId,
    employeeId : EmployeeId,
    input : TrackingTypes.UpdateAbsenceInput,
  ) : ?TrackingTypes.Absence {
    var result : ?TrackingTypes.Absence = null;
    absences.mapInPlace(func(a) {
      if (a.id == absenceId and a.companyId == companyId and a.employeeId == employeeId
          and (a.status == #submitted or a.status == #rejected)) {
        let newGanztaetig = switch (input.ganztaetig) { case (?v) v; case null a.ganztaetig };
        let newDauer = if (newGanztaetig) {
          0
        } else {
          switch (input.dauer) { case (?v) v; case null a.dauer }
        };
        // Abgelehnte Abwesenheiten werden nach der Bearbeitung wieder auf #submitted gesetzt
        let newStatus : TrackingTypes.AbsenceStatus = if (a.status == #rejected) { #submitted } else { a.status };
        let updated : TrackingTypes.Absence = {
          a with
          dateFrom = switch (input.dateFrom) { case (?v) v; case null a.dateFrom };
          dateTo = switch (input.dateTo) { case (?v) v; case null a.dateTo };
          ganztaetig = newGanztaetig;
          dauer = newDauer;
          description = switch (input.description) { case (?v) ?v; case null a.description };
          status = newStatus;
          rejectionComment = if (a.status == #rejected) { null } else { a.rejectionComment };
        };
        result := ?updated;
        updated;
      } else { a };
    });
    result;
  };

  // Löscht eine Abwesenheit (im Status #submitted oder #rejected)
  public func deleteAbsence(
    absences : List.List<TrackingTypes.Absence>,
    companyId : CompanyId,
    absenceId : AbsenceId,
    employeeId : EmployeeId,
  ) : Bool {
    let before = absences.size();
    let filtered = absences.filter(func(a) {
      not (a.id == absenceId and a.companyId == companyId and a.employeeId == employeeId
           and (a.status == #submitted or a.status == #rejected))
    });
    absences.clear();
    absences.append(filtered);
    absences.size() < before;
  };

  // Setzt eine genehmigte Abwesenheit auf ausstehend zurück (Manager/Admin)
  public func resetAbsenceToAusstehend(
    absences : List.List<TrackingTypes.Absence>,
    companyId : CompanyId,
    absenceId : AbsenceId,
    reason : Text,
  ) : ?TrackingTypes.Absence {
    var result : ?TrackingTypes.Absence = null;
    absences.mapInPlace(func(a) {
      if (a.id == absenceId and a.companyId == companyId and a.status == #approved) {
        let updated : TrackingTypes.Absence = {
          a with
          status = #submitted;
          resetReason = ?reason;
          approvedBy = null;
        };
        result := ?updated;
        updated;
      } else { a };
    });
    result;
  };
};
