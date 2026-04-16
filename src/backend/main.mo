// iReport Onchain V3.1 — Haupt-Akteur
// Kompositionswurzel: bindet alle Zustandsslices und Mixins zusammen
import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";

import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import MixinObjectStorage "mo:caffeineai-object-storage/Mixin";
import InviteLinksModule "mo:caffeineai-invite-links/invite-links-module";

import CompanyTypes "types/company";
import MasterTypes "types/masterdata";
import TrackingTypes "types/timetracking";
import CommonTypes "types/common";
import AuditTypes "types/audit";
import Migration "migration";
import CompanyApi "mixins/company-api";
import MasterdataApi "mixins/masterdata-api";
import TimetrackingApi "mixins/timetracking-api";
import ExpensesApi "mixins/expenses-api";
import AbsencesApi "mixins/absences-api";
import ReportsApi "mixins/reports-api";
import InviteApi "mixins/invite-api";
import AuditApi "mixins/audit-api";




(with migration = Migration.run)
actor {
  // --- Erweiterungen ---
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinObjectStorage();

  // --- Mandantenzuordnung ---
  let principalToCompany = Map.empty<Principal, CommonTypes.CompanyId>();
  let principalToEmployee = Map.empty<Principal, CommonTypes.EmployeeId>();

  // --- Zähler für Auto-IDs ---
  let nextCompanyId = { var value : Nat = 1 };
  let nextEmployeeId = { var value : Nat = 1 };
  let nextCustomerId = { var value : Nat = 1 };
  let nextProjectId = { var value : Nat = 1 };
  let nextServiceTypeId = { var value : Nat = 1 };
  let nextExpenseTypeId = { var value : Nat = 1 };
  let nextAbsenceTypeId = { var value : Nat = 1 };
  let nextHolidayId = { var value : Nat = 1 };
  let nextTimeEntryId = { var value : Nat = 1 };
  let nextExpenseId = { var value : Nat = 1 };
  let nextAbsenceId = { var value : Nat = 1 };
  let nextEmploymentId = { var value : Nat = 1 };
  let nextVacationBalanceId = { var value : Nat = 1 };
  let nextTimeCorrectionId = { var value : Nat = 1 };
  let nextAuditId = { var value : Nat = 0 };

  // --- Firmendaten ---
  let companies = List.empty<CompanyTypes.Company>();
  let employees = List.empty<CompanyTypes.Employee>();
  let companySettings = Map.empty<CommonTypes.CompanyId, CompanyTypes.CompanySettings>();
  let userNotifSettings = Map.empty<Principal, CompanyTypes.UserNotificationSettings>();

  // --- Mitarbeiter-Zusatzdaten ---
  let employments = List.empty<CompanyTypes.Employment>();
  let vacationBalances = List.empty<CompanyTypes.VacationBalance>();
  let timeBalanceCorrections = List.empty<CompanyTypes.TimeBalanceCorrection>();

  // --- Stammdaten ---
  let customers = List.empty<MasterTypes.Customer>();
  let projects = List.empty<MasterTypes.Project>();
  let projectAssignments = List.empty<MasterTypes.ProjectAssignment>();
  let projectMembers = Map.empty<CommonTypes.ProjectId, [MasterTypes.ProjectMemberAssignment]>();
  let serviceTypes = List.empty<MasterTypes.ServiceType>();
  let expenseTypes = List.empty<MasterTypes.ExpenseType>();
  let absenceTypes = List.empty<MasterTypes.AbsenceType>();
  let holidays = List.empty<MasterTypes.Holiday>();
  let standardHours = Map.empty<(CommonTypes.CompanyId, CommonTypes.EmployeeId), MasterTypes.Standardarbeitszeiten>();

  // --- Zeiterfassung & Abwesenheiten ---
  let timeEntries = List.empty<TrackingTypes.TimeEntry>();
  let expenses = List.empty<TrackingTypes.Expense>();
  let absences = List.empty<TrackingTypes.Absence>();

  // --- Audit-Log (append-only) ---
  let auditLog = List.empty<AuditTypes.AuditEntry>();

  // --- Einladungssystem ---
  let inviteState = InviteLinksModule.initState();
  let inviteToEmployee = Map.empty<Text, CommonTypes.InviteEntry>();

  // --- Mixins einbinden ---
  include CompanyApi(
    accessControlState,
    companies,
    employees,
    principalToCompany,
    principalToEmployee,
    companySettings,
    userNotifSettings,
    nextCompanyId,
    nextEmployeeId,
    customers,
    projects,
    projectMembers,
    serviceTypes,
    expenseTypes,
    absenceTypes,
    holidays,
    nextCustomerId,
    nextProjectId,
    nextServiceTypeId,
    nextExpenseTypeId,
    nextAbsenceTypeId,
    nextHolidayId,
    employments,
    vacationBalances,
    timeBalanceCorrections,
    nextEmploymentId,
    nextVacationBalanceId,
    nextTimeCorrectionId,
    timeEntries,
    absences,
  );

  include MasterdataApi(
    accessControlState,
    companies,
    employees,
    principalToCompany,
    principalToEmployee,
    customers,
    projects,
    projectAssignments,
    projectMembers,
    serviceTypes,
    expenseTypes,
    absenceTypes,
    holidays,
    standardHours,
    nextCustomerId,
    nextProjectId,
    nextServiceTypeId,
    nextExpenseTypeId,
    nextAbsenceTypeId,
    nextHolidayId,
  );

  include TimetrackingApi(
    accessControlState,
    companies,
    employees,
    principalToCompany,
    principalToEmployee,
    timeEntries,
    nextTimeEntryId,
  );

  include ExpensesApi(
    accessControlState,
    companies,
    employees,
    principalToCompany,
    principalToEmployee,
    expenses,
    nextExpenseId,
    auditLog,
    nextAuditId,
  );

  include AbsencesApi(
    accessControlState,
    companies,
    employees,
    principalToCompany,
    principalToEmployee,
    absenceTypes,
    absences,
    companySettings,
    vacationBalances,
    nextAbsenceId,
    auditLog,
    nextAuditId,
  );

  include ReportsApi(
    accessControlState,
    companies,
    employees,
    principalToCompany,
    principalToEmployee,
    timeEntries,
    expenses,
    absences,
    absenceTypes,
    employments,
    vacationBalances,
  );

  include InviteApi(
    accessControlState,
    companies,
    employees,
    principalToCompany,
    principalToEmployee,
    inviteState,
    inviteToEmployee,
  );

  include AuditApi(
    accessControlState,
    companies,
    employees,
    principalToCompany,
    principalToEmployee,
    auditLog,
  );
};
