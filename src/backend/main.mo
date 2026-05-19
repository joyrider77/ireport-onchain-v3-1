// iReport Onchain V3.1 — Haupt-Akteur
// Kompositionswurzel: bindet alle Zustandsslices und Mixins zusammen
import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Timer "mo:core/Timer";
import ExperimentalCycles "mo:core/Cycles";
import Time "mo:core/Time";


import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import MixinObjectStorage "mo:caffeineai-object-storage/Mixin";
import InviteLinksModule "mo:caffeineai-invite-links/invite-links-module";

import CompanyTypes "types/company";
import MasterTypes "types/masterdata";
import TrackingTypes "types/timetracking";
import CommonTypes "types/common";
import AuditTypes "types/audit";
import FakturTypes "types/fakturierung";
import CostDashboardTypes "types/cost-dashboard";












import CompanyApi "mixins/company-api";
import MasterdataApi "mixins/masterdata-api";
import TimetrackingApi "mixins/timetracking-api";
import ExpensesApi "mixins/expenses-api";
import AbsencesApi "mixins/absences-api";
import ReportsApi "mixins/reports-api";
import InviteApi "mixins/invite-api";
import AuditApi "mixins/audit-api";
import FakturierungApi "mixins/fakturierung-api";
import PlatformAdminApi "mixins/platform-admin-api";
import CostDashboardApi "mixins/cost-dashboard-api";
import SubscriptionApi "mixins/subscription-api";
import NotificationTypes "types/notification";
import NotificationApi "mixins/notification-api";
import StripeApi "mixins/stripe-api";
import ApprovalTypes "types/timetracking-approval-and-feature-flags";
import TimetrackingApprovalApi "mixins/timetracking-approval-api";
import ApprovalLib "lib/timetracking-approval";
import ComplianceTypes "types/compliance";
import ComplianceApi "mixins/compliance-api";
import PauseApi "mixins/pause-api";
import VacationLedgerLib "lib/vacation-ledger";
import Migration "migration";












// RULE: When changing a stable variable's type, always add a migration in migration.mo
// to copy existing data to the new variable with sensible defaults for new fields.

(with migration = Migration.run)
actor Self {
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

  // --- Fakturierung ---
  let nextInvoiceId = { var value : Nat = 1 };
  let nextInvoiceTemplateId = { var value : Nat = 1 };
  let nextInvoicePositionId = { var value : Nat = 1 };

  // --- Platform Admin ---
  let platformAdminPrincipal = { var value : ?Principal = null };
  let platformAdminCreatedAt = { var value : Int = 0 };

  // --- Kosten-Dashboard (Platform Admin only) ---
  let cycleSnapshots = List.empty<CostDashboardTypes.CycleSnapshot>();
  let costSettingsState = { var value : ?CostDashboardTypes.CostSettings = null };
  let frontendCanisterIdState = { var value : Text = "" };
  let backendCanisterIdState = { var value : Text = Principal.fromActor(Self).toText() };
  let snapshotIntervalSeconds = { var value : Nat = 86400 }; // Default: 24 Stunden
  let snapshotTimerId = { var value : ?Timer.TimerId = null };
  // Manuell gesetzter Frontend-Cycle-Wert (Backend kann canister_status() nicht für Frontend aufrufen)
  let frontendCyclesManual = { var value : Nat = 0 };
  // --- Platform-Admin-Konfiguration (Webhook-Endpoint-URL) ---
  let stripeWebhookEndpointUrlState = { var value : Text = "" };

  // --- Abonnement-Konfiguration (Platform Admin only) ---
  // Legacy: subscriptionPlans ohne minActiveDaysPerMonth/pricePerActiveUserCHF
  type LegacySubscriptionPlan = {
    id : Text;
    name : Text;
    description : Text;
    pricePerMonthCHF : Float;
    pricePerYearCHF : Float;
    maxEmployees : ?Nat;
    features : [Text];
    isActive : Bool;
    sortOrder : Nat;
    updatedAt : Int;
  };
  let subscriptionPlans = Map.empty<Text, LegacySubscriptionPlan>();
  // Legacy V2: SubscriptionPlan mit pricePerActiveUserCHF (für stabile Abwärtskompatibilität)
  type LegacySubscriptionPlanV2 = {
    id : Text;
    name : Text;
    description : Text;
    pricePerMonthCHF : Float;
    pricePerYearCHF : Float;
    pricePerActiveUserCHF : Float;
    minActiveDaysPerMonth : Nat;
    maxEmployees : ?Nat;
    features : [Text];
    isActive : Bool;
    sortOrder : Nat;
    updatedAt : Int;
  };
  let subscriptionPlansV2 = Map.empty<Text, LegacySubscriptionPlanV2>();
  // Legacy V3: SubscriptionPlan without Stripe fields (frozen for stable compat)
  type LegacySubscriptionPlanV3 = {
    id : Text;
    name : Text;
    description : Text;
    pricePerMonthCHF : Float;
    pricePerYearCHF : Float;
    minActiveDaysPerMonth : Nat;
    maxEmployees : ?Nat;
    features : [Text];
    isActive : Bool;
    sortOrder : Nat;
    updatedAt : Int;
  };
  let subscriptionPlansV3 = Map.empty<Text, LegacySubscriptionPlanV3>();
  // V4: SubscriptionPlan with Stripe fields (current active variable)
  let subscriptionPlansV4 = Map.empty<Text, CostDashboardTypes.SubscriptionPlan>();
  let subscriptionPlansInitialized = { var value : Bool = false };
  let companySubscriptions = Map.empty<Text, Text>(); // companyId -> planId
  // Legacy: CompanySubscription without proRataAmount/proRataNote/proRataCalculatedAt/nextDueDate fields
  type LegacyCompanySubscription = {
    companyId             : Nat;
    planId                : Text;
    billingModel          : CostDashboardTypes.BillingModel;
    subscriptionStartDate : ?Int;
  };
  let companySubscriptionDetails = Map.empty<Text, LegacyCompanySubscription>(); // legacy stable var
  // V2: extended with pro-rata fields (legacy — frozen shape, neue Felder in V3)
  type LegacyCompanySubscriptionV2 = {
    companyId             : Nat;
    planId                : Text;
    billingModel          : CostDashboardTypes.BillingModel;
    subscriptionStartDate : ?Int;
    proRataAmount         : ?Float;
    proRataNote           : ?Text;
    proRataCalculatedAt   : ?Int;
    nextDueDate           : ?Int;
  };
  let companySubscriptionDetailsV2 = Map.empty<Text, LegacyCompanySubscriptionV2>(); // legacy stable var
  // V3: extended with Stripe fields (current active variable)
  let companySubscriptionDetailsV3 = Map.empty<Text, CostDashboardTypes.CompanySubscription>(); // companyId -> details

  // --- Standard-Arbeitsstunden pro Firma ---
  let defaultWorkHoursMap = Map.empty<CommonTypes.CompanyId, CompanyTypes.DefaultWorkHours>();

  // --- Firmendaten ---
  let companies = List.empty<CompanyTypes.Company>();
  let employees = List.empty<CompanyTypes.Employee>();
  let companySettings = Map.empty<CommonTypes.CompanyId, CompanyTypes.CompanySettings>();
  let userNotifSettings = Map.empty<Principal, CompanyTypes.UserNotificationSettings>();

  // --- Mitarbeiter-Zusatzdaten ---
  // employmentsV2: Beschäftigungen mit neuer FeiertagsberechnungsartType
  // (Umbenennung von 'employments' um M0170-Kompatibilitätsfehler durch geänderte Variant-Tags zu vermeiden.
  //  Alt: #exakt, #prozentual, #entschaedigt, #exaktWochentag
  //  Neu: #keineGutschrift, #durchschnittssoll, #wochentag_sollzeit)
  let employmentsV2 = List.empty<CompanyTypes.Employment>();
  let vacationBalances = List.empty<CompanyTypes.VacationBalance>();
  let timeBalanceCorrections = List.empty<CompanyTypes.TimeBalanceCorrection>();

  // --- Stammdaten ---
  let customers = List.empty<MasterTypes.Customer>();
  // ─── Migration: Project – kostendachCHF hinzugefügt ────────────────────────
  // projects: original stabile Variable, behält alten Typ (ohne kostendachCHF) für Abwärtskompatibilität.
  // projectsV2: neue stabile Variable mit kostendachCHF : ?Float.
  type LegacyProject = {
    id : CommonTypes.ProjectId;
    companyId : CommonTypes.CompanyId;
    customerId : CommonTypes.CustomerId;
    name : Text;
    kurzbezeichnung : Text;
    code : Text;
    billableRate : Float;
    active : Bool;
    projektleiter : ?CommonTypes.EmployeeId;
    status : MasterTypes.ProjectStatus;
    erfassungsart : ?MasterTypes.Erfassungsart;
  };
  let projects = List.empty<LegacyProject>();
  let projectsV2 = List.empty<MasterTypes.Project>();
  let projectAssignments = List.empty<MasterTypes.ProjectAssignment>();
  // ─── Migration: ProjectMemberAssignment – kostendachCHF hinzugefügt ──────────
  // _projectMembers: alte stabile Variable ohne kostendachCHF-Feld.
  // projectMembersV2: neue stabile Variable mit kostendachCHF : ?Float.
  type LegacyProjectMemberAssignment = {
    employeeId    : CommonTypes.EmployeeId;
    serviceTypeId : CommonTypes.ServiceTypeId;
    stundensatz   : Float;
  };
  let _projectMembers = Map.empty<CommonTypes.ProjectId, [LegacyProjectMemberAssignment]>();
  let projectMembersV2 = Map.empty<CommonTypes.ProjectId, [MasterTypes.ProjectMemberAssignment]>();
  let serviceTypes = List.empty<MasterTypes.ServiceType>();
  let expenseTypes = List.empty<MasterTypes.ExpenseType>();
  // ─── Migration: AbsenceType – visibility-Feld hinzugefügt ─────────────────
  // absenceTypes: alte stabile Variable ohne visibility-Feld (für stabile Rückwärtskompatibilität).
  // absenceTypesV2: neue stabile Variable mit visibility : ?AbsenceTypeVisibility.
  type LegacyAbsenceType = {
    id : CommonTypes.AbsenceTypeId;
    companyId : CommonTypes.CompanyId;
    name : Text;
    requiresApproval : Bool;
    compensated : Bool;
    aktiv : Bool;
  };
  let absenceTypes = List.empty<LegacyAbsenceType>();
  let absenceTypesV2 = List.empty<MasterTypes.AbsenceType>();
  let holidays = List.empty<MasterTypes.Holiday>();
  // Legacy: _standardHours mit altem Typ {von, bis} – stabile Rückwärtskompatibilität
  let _standardHours = Map.empty<(CommonTypes.CompanyId, CommonTypes.EmployeeId), MasterTypes.LegacyStandardarbeitszeiten>();
  // Neu: standardHoursV2 mit erweitertem Typ inkl. projektId/leistungsartId
  let standardHoursV2 = Map.empty<(CommonTypes.CompanyId, CommonTypes.EmployeeId), MasterTypes.Standardarbeitszeiten>();

  // --- Zeiterfassung & Abwesenheiten ---
  let timeEntries = List.empty<TrackingTypes.TimeEntry>();
  let expenses = List.empty<TrackingTypes.Expense>();
  let absences = List.empty<TrackingTypes.Absence>();

  // --- Fakturierung ---
  let invoices = List.empty<FakturTypes.Invoice>();
  let invoiceTemplatesV2 = List.empty<FakturTypes.InvoiceTemplate>();

  // --- Audit-Log (append-only) ---
  let auditLog = List.empty<AuditTypes.AuditEntry>();

  // ─── Explicit Migration: auditLogEntries → ... → auditLogEntriesV4 ──
  // These legacy stable vars retain the OLD AuditOperation type (without #remove)
  // so they remain stable-compatible with existing persisted data.
  // auditLogEntriesV5 is the new active var using the updated AuditOperation with #remove.
  type LegacyAuditOperation = { #create; #update; #delete };
  type LegacyAuditEntityType = {
    #holiday;
  };
  type LegacyAuditLogEntry = {
    id          : Text;
    companyId   : CommonTypes.CompanyId;
    timestamp   : Int;
    operation   : LegacyAuditOperation;
    entityType  : LegacyAuditEntityType;
    entityId    : Text;
    actorPrincipal : Text;
    actorName   : Text;
    beforeState : ?Text;
    afterState  : ?Text;
  };
  let auditLogEntries = List.empty<LegacyAuditLogEntry>();

  // Legacy V2: AuditLogEntry without fieldChanges — kept for stable compat, not used
  // entityType uses a frozen legacy variant (without #timeEntry/#expense) to match stored data
  type LegacyAuditEntityTypeV2 = {
    #holiday;
    #company;
    #employee;
    #customer;
    #project;
    #serviceType;
    #expenseType;
    #absenceType;
    #invoiceTemplate;
  };
  type LegacyAuditLogEntryV2 = {
    id             : Text;
    companyId      : CommonTypes.CompanyId;
    timestamp      : Int;
    operation      : LegacyAuditOperation;
    entityType     : LegacyAuditEntityTypeV2;
    entityId       : Text;
    actorPrincipal : Text;
    actorName      : Text;
    beforeState    : ?Text;
    afterState     : ?Text;
  };
  let auditLogEntriesV2 = List.empty<LegacyAuditLogEntryV2>();

  // Legacy V3: AuditLogEntry with fieldChanges but 9-variant entityType — kept for stable compat
  type LegacyAuditEntityTypeV3 = {
    #holiday;
    #company;
    #employee;
    #customer;
    #project;
    #serviceType;
    #expenseType;
    #absenceType;
    #invoiceTemplate;
  };
  type LegacyAuditFieldChange = { fieldName : Text; before : Text; after : Text };
  type LegacyAuditLogEntryV3 = {
    id             : Text;
    companyId      : CommonTypes.CompanyId;
    timestamp      : Int;
    operation      : LegacyAuditOperation;
    entityType     : LegacyAuditEntityTypeV3;
    entityId       : Text;
    actorPrincipal : Text;
    actorName      : Text;
    beforeState    : ?Text;
    afterState     : ?Text;
    fieldChanges   : ?[LegacyAuditFieldChange];
  };
  let auditLogEntriesV3 = List.empty<LegacyAuditLogEntryV3>();

  // Legacy V4: AuditLogEntry with old LegacyAuditOperation (has #delete, not #remove)
  type LegacyAuditEntityTypeV4 = {
    #holiday;
    #company;
    #employee;
    #customer;
    #project;
    #serviceType;
    #expenseType;
    #absenceType;
    #invoiceTemplate;
    #timeEntry;
    #expense;
  };
  type LegacyAuditFieldChangeV4 = { fieldName : Text; before : Text; after : Text };
  type LegacyAuditLogEntryV4 = {
    id             : Text;
    companyId      : CommonTypes.CompanyId;
    timestamp      : Int;
    operation      : LegacyAuditOperation;
    entityType     : LegacyAuditEntityTypeV4;
    entityId       : Text;
    actorPrincipal : Text;
    actorName      : Text;
    beforeState    : ?Text;
    afterState     : ?Text;
    fieldChanges   : ?[LegacyAuditFieldChangeV4];
  };
  let auditLogEntriesV4 = List.empty<LegacyAuditLogEntryV4>();

  // V5: legacy type with old AuditOperation (without #approve/#reject)
  type LegacyAuditOperationV5 = { #create; #update; #remove; #delete };
  type LegacyAuditEntityTypeV5 = {
    #holiday;
    #company;
    #employee;
    #customer;
    #project;
    #serviceType;
    #expenseType;
    #absenceType;
    #invoiceTemplate;
    #timeEntry;
    #expense;
    #absence;
    #ferien;
    #approval;
  };
  type LegacyAuditFieldChangeV5 = { fieldName : Text; before : Text; after : Text };
  type LegacyAuditLogEntryV5 = {
    id             : Text;
    companyId      : CommonTypes.CompanyId;
    timestamp      : Int;
    operation      : LegacyAuditOperationV5;
    entityType     : LegacyAuditEntityTypeV5;
    entityId       : Text;
    actorPrincipal : Text;
    actorName      : Text;
    beforeState    : ?Text;
    afterState     : ?Text;
    fieldChanges   : ?[LegacyAuditFieldChangeV5];
  };
  let auditLogEntriesV5 = List.empty<LegacyAuditLogEntryV5>();

  // V6: current type with #approve and #reject in AuditOperation
  let auditLogEntriesV6 = List.empty<AuditTypes.AuditLogEntry>();
  let nextAuditLogId = { var value : Nat = 0 };

  // --- Einladungssystem ---
  let inviteState = InviteLinksModule.initState();
  let inviteToEmployee = Map.empty<Text, CommonTypes.InviteEntry>();

  // --- HR & Compliance-Modul ---
  let complianceProfiles = List.empty<ComplianceTypes.EmployeeComplianceProfile>();
  let complianceFindings = List.empty<ComplianceTypes.ComplianceFinding>();
  let vacationLedgers    = List.empty<ComplianceTypes.VacationLedger>();
  let nextComplianceProfileId = { var value : Nat = 1 };
  let nextComplianceFindingId = { var value : Nat = 1 };
  let nextVacationLedgerId    = { var value : Nat = 1 };

  // --- Pausen-Overrides (Pause-Erkennung & Compliance, Punkt 21) ---
  let pauseOverrides      = List.empty<ComplianceTypes.PauseOverride>();
  let nextPauseOverrideId = { var value : Nat = 1 };

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
    projectsV2,
    projectMembersV2,
    serviceTypes,
    expenseTypes,
    absenceTypesV2,
    holidays,
    nextCustomerId,
    nextProjectId,
    nextServiceTypeId,
    nextExpenseTypeId,
    nextAbsenceTypeId,
    nextHolidayId,
    employmentsV2,
    vacationBalances,
    timeBalanceCorrections,
    nextEmploymentId,
    nextVacationBalanceId,
    nextTimeCorrectionId,
    timeEntries,
    absences,
    expenses,
    platformAdminPrincipal,
    platformAdminCreatedAt,
    auditLogEntriesV6,
    nextAuditLogId,
    defaultWorkHoursMap,
    subscriptionPlansV4,
    subscriptionPlansInitialized,
    companySubscriptions,
    companySubscriptionDetailsV3,
    principalToCompany,
    complianceProfiles,
    nextComplianceProfileId,
  );

  include MasterdataApi(
    accessControlState,
    companies,
    employees,
    principalToCompany,
    principalToEmployee,
    customers,
    projectsV2,
    projectAssignments,
    projectMembersV2,
    serviceTypes,
    expenseTypes,
    absenceTypesV2,
    holidays,
    standardHoursV2,
    nextCustomerId,
    nextProjectId,
    nextServiceTypeId,
    nextExpenseTypeId,
    nextAbsenceTypeId,
    nextHolidayId,
    auditLogEntriesV6,
    nextAuditLogId,
    timeEntries,
  );

  // --- Genehmigungsprozesse & Feature-Flags ---
  let approvalAuditLog       = List.empty<ApprovalTypes.TimeEntryApprovalAuditEntry>();
  let nextApprovalAuditId    = { var value : Nat = 0 };

  let timeEntryApprovalData  = Map.empty<Nat, ApprovalLib.ApprovalRecord>();
  let absenceApprovalData    = Map.empty<Nat, ApprovalLib.ApprovalRecord>();

  include TimetrackingApi(
    accessControlState,
    companies,
    employees,
    principalToCompany,
    principalToEmployee,
    timeEntries,
    nextTimeEntryId,
    auditLogEntriesV6,
    nextAuditLogId,
    timeEntryApprovalData,
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
    auditLogEntriesV6,
    nextAuditLogId,
  );

  include AbsencesApi(
    accessControlState,
    companies,
    employees,
    principalToCompany,
    principalToEmployee,
    absenceTypesV2,
    absences,
    companySettings,
    vacationBalances,
    nextAbsenceId,
    auditLog,
    nextAuditId,
    auditLogEntriesV6,
    nextAuditLogId,
    absenceApprovalData,
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
    absenceTypesV2,
    employmentsV2,
    vacationBalances,
    holidays,
    customers,
    projectsV2,
    projectMembersV2,
    serviceTypes,
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
    auditLogEntriesV6,
    platformAdminPrincipal,
  );

  include FakturierungApi(
    accessControlState,
    companies,
    employees,
    principalToCompany,
    principalToEmployee,
    customers,
    projectMembersV2,
    timeEntries,
    expenses,
    invoices,
    invoiceTemplatesV2,
    nextInvoiceId,
    nextInvoiceTemplateId,
    nextInvoicePositionId,
    auditLogEntriesV6,
    nextAuditLogId,
  );

  include TimetrackingApprovalApi(
    employees,
    principalToCompany,
    principalToEmployee,
    timeEntries,
    absences,
    approvalAuditLog,
    nextApprovalAuditId,
    timeEntryApprovalData,
    absenceApprovalData,
    companySubscriptions,
    subscriptionPlansV4,
    auditLogEntriesV6,
    nextAuditLogId,
    vacationLedgers,
    nextVacationLedgerId,
    complianceProfiles,
    employmentsV2,
  );

  include CostDashboardApi(
    companies,
    employees,
    platformAdminPrincipal,
    cycleSnapshots,
    costSettingsState,
    frontendCanisterIdState,
    backendCanisterIdState,
    snapshotIntervalSeconds,
    snapshotTimerId,
    frontendCyclesManual,
  );

  include SubscriptionApi(
    platformAdminPrincipal,
    subscriptionPlansV4,
    subscriptionPlansInitialized,
    companySubscriptions,
    companySubscriptionDetailsV3,
    companies,
    employees,
    timeEntries,
    principalToCompany,
  );

  // --- Benachrichtigungssystem ---
  let notificationsMap      = Map.empty<Text, NotificationTypes.Notification>();
  let notificationReadStatuses   = Map.empty<Text, NotificationTypes.ReadStatus>();
  let notificationDeleteStatuses = Map.empty<Text, NotificationTypes.DeleteStatus>();
  let nextNotificationId    = { var value : Nat = 0 };

  include NotificationApi(
    notificationsMap,
    notificationReadStatuses,
    notificationDeleteStatuses,
    nextNotificationId,
    platformAdminPrincipal,
    principalToCompany,
    principalToEmployee,
    employees,
    companies,
  );
  // ─── Stripe-Zahlungsintegration ───────────────────────────────────────────────
  let stripeConfigState      : { var value : ?CostDashboardTypes.StripeConfig } = { var value = null };
  let stripeEvents           = Map.empty<Text, CostDashboardTypes.StripeEvent>();
  let stripeInvoices         = Map.empty<Text, CostDashboardTypes.StripeInvoice>();
  let stripeCheckoutSessions = Map.empty<Text, CostDashboardTypes.StripeCheckoutSession>();
  let nextStripeEventId      = { var value : Nat = 0 };
  let nextStripeInvoiceId    = { var value : Nat = 0 };
  let nextStripeSessionId    = { var value : Nat = 0 };

  include StripeApi(
    platformAdminPrincipal,
    principalToCompany,
    companies,
    employees,
    stripeEvents,
    stripeInvoices,
    stripeCheckoutSessions,
    nextStripeEventId,
    nextStripeInvoiceId,
    nextStripeSessionId,
    companySubscriptionDetailsV3,
    subscriptionPlansV4,
    stripeConfigState,
  );

  include PlatformAdminApi(
    companies,
    employees,
    principalToCompany,
    platformAdminPrincipal,
    platformAdminCreatedAt,
    frontendCanisterIdState,
    stripeConfigState,
    stripeWebhookEndpointUrlState,
  );
  // ─── Stable Migration: InvoiceTemplate Erweiterung ──────────────────────────
  // invoiceTemplatesV2 is a fresh stable variable (renamed from invoiceTemplates)
  // to avoid M0170 compatibility errors from added optional fields.
  // No preupgrade/postupgrade needed — data is reset on first deployment.

  // ─── Migration: Feiertagsberechnungsart – Variant-Tags geändert ──────────────
  // employmentsV2 ist eine frische stabile Variable (umbenannt von 'employments')
  // um M0170-Kompatibilitätsfehler durch geänderte Variant-Tags zu vermeiden.
  // Alt: #exakt, #prozentual, #entschaedigt, #exaktWochentag
  // Neu: #keineGutschrift, #durchschnittssoll, #wochentag_sollzeit

  // ─── Migration: AuditLogEntry – fieldChanges hinzugefügt ─────────────────────
  // auditLogEntriesV3 ist eine frische stabile Variable (umbenannt von 'auditLogEntriesV2')
  // um M0170-Kompatibilitätsfehler durch das neue Feld 'fieldChanges' zu vermeiden.
  // Alt (V2): AuditLogEntry ohne fieldChanges; Neu (V3): mit optionalem fieldChanges-Feld


  include ComplianceApi(
    accessControlState,
    companies,
    employees,
    principalToCompany,
    principalToEmployee,
    complianceProfiles,
    complianceFindings,
    vacationLedgers,
    nextComplianceProfileId,
    nextComplianceFindingId,
    nextVacationLedgerId,
    timeEntries,
    absences,
    pauseOverrides,
  );

  include PauseApi(
    employees,
    principalToCompany,
    principalToEmployee,
    timeEntries,
    pauseOverrides,
    nextPauseOverrideId,
  );

  // Gibt die eigene Backend-Canister-ID zurück (dynamisch via Principal.fromActor(Self))
  public shared func getBackendCanisterId() : async Text {
    Principal.fromActor(Self).toText();
  };

  // Snapshot-Timer beim Start des Canisters initialisieren
  // Da startSnapshotTimer async ist, verwenden wir einen kurzen One-Shot-Timer
  // der den Recurring-Timer sofort nach dem Start einrichtet.
  // ─── Migration: absenceTypesV2 – Visibility-Defaults setzen (synchron beim Start) ───
  // Sicherstellen, dass alle AbsenceTypes in absenceTypesV2 eine Visibility-
  // Konfiguration haben, damit der Firmenkalender korrekt anzeigt.
  // Ferien → vollständig sichtbar; alle anderen → masked_reason als sinnvoller Default.
  absenceTypesV2.mapInPlace(
    func(at : MasterTypes.AbsenceType) : MasterTypes.AbsenceType {
      if (at.name == "Ferien") {
        let feriVis : MasterTypes.AbsenceTypeVisibility = {
          visibleInCompanyCalendar = true;
          visibilityMode = #full;
          visibleForRoles = ["all"];
          companyCalendarDisplayName = ?("Ferien");
          companyCalendarColor = ?("#10b981");
          showEmployeeName = true;
          showAbsenceTypeName = true;
          showComment = false;
        };
        { at with visibility = ?feriVis };
      } else {
        switch (at.visibility) {
          case (?_) { at }; // Benutzer-konfiguriert – nicht überschreiben
          case null {
            let defaultVis : MasterTypes.AbsenceTypeVisibility = {
              visibleInCompanyCalendar = true;
              visibilityMode = #masked_reason;
              visibleForRoles = ["all"];
              companyCalendarDisplayName = ?("Nicht verfügbar");
              companyCalendarColor = null;
              showEmployeeName = true;
              showAbsenceTypeName = false;
              showComment = false;
            };
            { at with visibility = ?defaultVis };
          };
        };
      };
    }
  );

  // Snapshot-Timer beim Start des Canisters initialisieren
  // Da startSnapshotTimer async ist, verwenden wir einen kurzen One-Shot-Timer
  // der den Recurring-Timer sofort nach dem Start einrichtet.
  ignore Timer.setTimer<system>(#seconds(1), func() : async () {
    let intervalSecs = snapshotIntervalSeconds.value;
    if (intervalSecs > 0) {
      switch (snapshotTimerId.value) {
        case (?tid) { Timer.cancelTimer(tid) };
        case null {};
      };
      let tid = Timer.recurringTimer<system>(#seconds(intervalSecs), func() : async () {
        cycleSnapshots.add({
          timestamp = Time.now();
          frontendCycles = frontendCyclesManual.value;
          backendCycles = ExperimentalCycles.balance();
        });
        let total = cycleSnapshots.size();
        if (total > 365) {
          let kept = cycleSnapshots.sliceToArray((total - 365 : Nat).toInt(), total.toInt());
          cycleSnapshots.clear();
          cycleSnapshots.addAll(kept.values());
        };
      });
      snapshotTimerId.value := ?tid;
    };
  });
};
