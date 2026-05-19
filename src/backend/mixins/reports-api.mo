// Öffentliche API für Auswertungen, Kalender und Dashboard
import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import CommonTypes "../types/common";
import CompanyTypes "../types/company";
import TrackingTypes "../types/timetracking";
import MasterTypes "../types/masterdata";
import ReportsLib "../lib/reports";

mixin (
  accessControlState : AccessControl.AccessControlState,
  companies : List.List<CompanyTypes.Company>,
  employees : List.List<CompanyTypes.Employee>,
  principalToCompany : Map.Map<Principal, CommonTypes.CompanyId>,
  principalToEmployee : Map.Map<Principal, CommonTypes.EmployeeId>,
  timeEntries : List.List<TrackingTypes.TimeEntry>,
  expenses : List.List<TrackingTypes.Expense>,
  absences : List.List<TrackingTypes.Absence>,
  absenceTypes : List.List<MasterTypes.AbsenceType>,
  employments : List.List<CompanyTypes.Employment>,
  vacationBalances : List.List<CompanyTypes.VacationBalance>,
  holidays : List.List<MasterTypes.Holiday>,
  customers : List.List<MasterTypes.Customer>,
  projects : List.List<MasterTypes.Project>,
  projectMembers : Map.Map<CommonTypes.ProjectId, [MasterTypes.ProjectMemberAssignment]>,
  serviceTypes : List.List<MasterTypes.ServiceType>,
) {
  // Hilfsfunktion: Authentifizierung prüfen
  private func rptRequireAuth(caller : Principal) : (CommonTypes.CompanyId, CommonTypes.EmployeeId) {
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

  // Gibt Auswertungsdaten für den angegebenen Zeitraum zurück
  public query ({ caller }) func getReportData(
    filter : TrackingTypes.ReportFilter
  ) : async TrackingTypes.ReportData {
    let (companyId, employeeId) = rptRequireAuth(caller);
    // Mitarbeiter sehen nur eigene Daten
    let empRole = switch (employees.find(func(e) { e.id == employeeId and e.companyId == companyId })) {
      case null { #employee };
      case (?e) e.role;
    };
    let effectiveFilter : TrackingTypes.ReportFilter = switch (empRole) {
      case (#admin) filter;
      case (#manager) filter;
      case (#employee) {
        { filter with employeeId = ?employeeId };
      };
    };
    ReportsLib.getReportData(timeEntries, expenses, companyId, effectiveFilter);
  };

  // Gibt eine Projektauswertung mit Budgetvergleich zurück
  public query ({ caller }) func getProjectBudgetReport(
    projectId : CommonTypes.ProjectId,
    dateFrom : Text,
    dateTo : Text,
  ) : async CommonTypes.Result<TrackingTypes.ProjectBudgetReport> {
    let (companyId, employeeId) = rptRequireAuth(caller);
    // Rollenprüfung: Mitarbeiter dürfen nur eigene Projekte abfragen
    let empRole = switch (employees.find(func(e) { e.id == employeeId and e.companyId == companyId })) {
      case null { #employee };
      case (?e) e.role;
    };
    switch (empRole) {
      case (#employee) {
        // Prüfen ob dieser Mitarbeiter dem Projekt zugewiesen ist
        let membersArr : [MasterTypes.ProjectMemberAssignment] = switch (projectMembers.get(projectId)) {
          case null { [] };
          case (?arr) arr;
        };
        let isMember = membersArr.find(func(m) { m.employeeId == employeeId }) != null;
        if (not isMember) {
          return #err("Kein Zugriff auf dieses Projekt");
        };
      };
      case _ {};
    };
    ReportsLib.getProjectBudgetReport(
      timeEntries,
      projects,
      customers,
      projectMembers,
      employees,
      serviceTypes,
      companyId,
      projectId,
      dateFrom,
      dateTo,
    );
  };

  // Gibt Kalendereinträge für einen Monat zurück
  public query ({ caller }) func getCalendarEntries(
    month : Text,
    year : Nat,
  ) : async TrackingTypes.CalendarData {
    let (companyId, employeeId) = rptRequireAuth(caller);
    ReportsLib.getCalendarEntries(timeEntries, expenses, absences, companyId, employeeId, month, year);
  };

  // Gibt Dashboard-Statistiken zurück
  public query ({ caller }) func getDashboardStats() : async TrackingTypes.DashboardStats {
    let (companyId, employeeId) = rptRequireAuth(caller);
    let emp = switch (employees.find(func(e) { e.id == employeeId and e.companyId == companyId })) {
      case null { Runtime.trap("Mitarbeiter nicht gefunden") };
      case (?e) e;
    };
    let isManagerOrAdmin = emp.role == #admin or emp.role == #manager;
    ReportsLib.getDashboardStats(
      timeEntries,
      absences,
      absenceTypes,
      expenses,
      employments,
      vacationBalances,
      holidays,
      companyId,
      employeeId,
      emp.weeklyHoursTarget,
      isManagerOrAdmin,
    );
  };
};
