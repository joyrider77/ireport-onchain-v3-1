import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface WorkTimeBalance {
    istStunden: bigint;
    ueberzeit: bigint;
    saldo: bigint;
    periodEnd: string;
    periodStart: string;
    sollStunden: bigint;
    korrektionen: bigint;
}
export interface TenantCostEntry {
    employeeCount: bigint;
    estimatedCycles: bigint;
    companyName: string;
    companyId: bigint;
}
export type Result_32 = {
    __kind__: "ok";
    ok: Array<Invoice>;
} | {
    __kind__: "err";
    err: string;
};
export type Result_2 = {
    __kind__: "ok";
    ok: UserNotificationSettings;
} | {
    __kind__: "err";
    err: string;
};
export interface ServiceTypeBudgetReport {
    serviceTypeName: string;
    aufgewendetCHF: number;
    aufgewendeteStunden: number;
    kostendachCHF: number;
    serviceTypeId: ServiceTypeId;
}
export interface ProjectBudgetReport {
    totalKostendachCHF: number;
    customerName: string;
    totalAufgewendetCHF: number;
    projectName: string;
    totalStunden: number;
    projectId: ProjectId;
    employeeReports: Array<EmployeeBudgetReport>;
}
export interface InvoicePosition {
    id: bigint;
    typ: InvoicePositionTyp;
    menge: number;
    referenzId?: bigint;
    total: number;
    bezeichnung: string;
    invoiceId: bigint;
    preis: number;
    einheit: string;
}
export interface HttpRequestResult {
    status: bigint;
    body: Uint8Array;
    headers: Array<HttpHeader>;
}
export interface UpdateEmploymentInput {
    bis?: bigint;
    von?: bigint;
    pensum: number;
    feiertagsberechnungsart?: FeiertagsberechnungsartType;
    stundenDi: bigint;
    stundenDo: bigint;
    stundenFr: bigint;
    stundenMi: bigint;
    stundenMo: bigint;
    stundenSa: bigint;
    stundenSo: bigint;
    funktion?: string;
}
export interface CreateInvoiceInput {
    fusstext: string;
    positionen: Array<InvoicePositionInput>;
    qrAktiv?: boolean;
    mwstSatz: number;
    rabatt: number;
    kopftext: string;
    kundeId: CustomerId;
    skonto: number;
}
export interface StandardTimeBlock {
    bis: string;
    von: string;
    leistungsartId?: bigint;
    projektId?: bigint;
}
export interface ProjectAssignment {
    employeeId: EmployeeId;
    projectId: ProjectId;
    companyId: CompanyId;
}
export type Result_4 = {
    __kind__: "ok";
    ok: TimeBalanceCorrection;
} | {
    __kind__: "err";
    err: string;
};
export interface UpdateCustomerInput {
    rechnungsadresse?: Rechnungsadresse;
    contact?: string;
    aktiv?: boolean;
    name?: string;
    zeiterfassungsart?: KundeZeiterfassungsart;
    kundennummer?: string;
    notes?: string;
    beschreibung?: string;
    waehrung?: string;
}
export interface PlatformAdminConfigPublic {
    frontendCanisterId: string;
    stripeWebhookEndpointUrl: string;
    stripePublishableKey: string;
}
export interface CreateExpenseInput {
    date: string;
    description: string;
    projektId?: bigint;
    billableCHF: number;
    kundeId?: bigint;
    reimbursementCHF: number;
    expenseTypeId: ExpenseTypeId;
    receiptBlobId?: string;
}
export interface CreateAbsenceInput {
    absenceTypeId: AbsenceTypeId;
    dateTo: string;
    ganztaetig: boolean;
    description?: string;
    dateFrom: string;
    dauer: bigint;
}
export type EmployeeId = bigint;
export interface ComplianceCockpitRow {
    vertraglicheUeberstundenH: number;
    offeneMassnahmen: bigint;
    employee: {
        id: bigint;
        lastName: string;
        firstName: string;
    };
    ferienstatus: string;
    pausenVerstoesse: bigint;
    gesamtstatus: ComplianceStatus;
    gesetzlicheUeberzeitH: number;
    ruhezeitVerstoesse: bigint;
}
export interface CostDashboardData {
    dataSource: string;
    frontendCanisterId: string;
    snapshots: Array<CycleSnapshot>;
    settings: CostSettings;
    backendCanisterId: string;
    backendCyclesBalance?: bigint;
}
export interface CanisterStatusInfo {
    backendStatus: string;
    dataSource: string;
    frontendCanisterId: string;
    backendCycles: bigint;
    backendMemorySize: bigint;
    backendCanisterId: string;
    timestamp: bigint;
}
export type ExpenseTypeId = bigint;
export interface CreateServiceTypeInput {
    defaultRate: number;
    aktiv?: boolean;
    name: string;
    billable: boolean;
}
export interface TimeEntry {
    id: TimeEntryId;
    bis?: string;
    von?: string;
    hours: number;
    fakturiertInRechnungId?: bigint;
    date: string;
    createdAt: Timestamp;
    description: string;
    employeeId: EmployeeId;
    billable: boolean;
    projectId: ProjectId;
    serviceTypeId: ServiceTypeId;
    companyId: CompanyId;
}
export type Result_34 = {
    __kind__: "ok";
    ok: Employment | null;
} | {
    __kind__: "err";
    err: string;
};
export interface FeatureAccessResult {
    featureKey: FeatureKey;
    hasAccess: boolean;
    companyId: CompanyId;
}
export interface ServiceType {
    id: ServiceTypeId;
    defaultRate: number;
    aktiv: boolean;
    name: string;
    billable: boolean;
    companyId: CompanyId;
}
export interface ExpenseType {
    id: ExpenseTypeId;
    aktiv: boolean;
    name: string;
    billable: boolean;
    reimbursable: boolean;
    companyId: CompanyId;
}
export type Result_6 = {
    __kind__: "ok";
    ok: ServiceType;
} | {
    __kind__: "err";
    err: string;
};
export interface CreateTimeBalanceCorrectionInput {
    typ: Variant_gutschrift_reduktion;
    ueberzeit: bigint;
    bemerkung: string;
    wirkungsdatum: bigint;
    dauer: bigint;
}
export interface AuditLogFilter {
    dateTo?: bigint;
    actorPrincipalFilter?: string;
    operation?: AuditOperation;
    entityType?: AuditEntityType;
    dateFrom?: bigint;
}
export type Result_26 = {
    __kind__: "ok";
    ok: {
        spesen: Array<Expense>;
        zeiteintraege: Array<TimeEntry>;
    };
} | {
    __kind__: "err";
    err: string;
};
export type Result_12 = {
    __kind__: "ok";
    ok: Employment;
} | {
    __kind__: "err";
    err: string;
};
export interface PauseOverride {
    id: bigint;
    action: string;
    userId: bigint;
    date: string;
    createdByUserId: bigint;
    createdAt: bigint;
    gapEnd: bigint;
    updatedAt: bigint;
    gapStart: bigint;
    reason?: string;
    companyId: bigint;
}
export interface HttpHeader {
    value: string;
    name: string;
}
export interface ExpenseFilter {
    status?: ExpenseStatus;
    dateTo?: string;
    employeeId?: EmployeeId;
    dateFrom?: string;
}
export interface DashboardStats {
    hoursTarget: number;
    pendingExpenses: bigint;
    hoursThisWeek: number;
    remainingVacationMinutes: bigint;
    approvedVacationDays: bigint;
    pendingVacations: bigint;
}
export type Result = {
    __kind__: "ok";
    ok: SubscriptionPlan;
} | {
    __kind__: "err";
    err: string;
};
export type Result_10 = {
    __kind__: "ok";
    ok: ExpenseType;
} | {
    __kind__: "err";
    err: string;
};
export interface CycleStatus {
    dataSource: string;
    frontendCycles?: bigint;
    backendCycles: bigint;
}
export interface Notification {
    id: string;
    status: NotificationStatus;
    title: string;
    validFrom: bigint;
    createdAt: bigint;
    senderDisplayName: string;
    messageFormat: NotificationFormat;
    messageBody: string;
    targetRoleIds: Array<string>;
    targetUserIds: Array<string>;
    targetType: NotificationTargetType;
    priority: NotificationPriority;
    targetTenantIds: Array<string>;
    senderUserId: string;
    validUntil?: bigint;
}
export type Result_8 = {
    __kind__: "ok";
    ok: Invoice;
} | {
    __kind__: "err";
    err: string;
};
export type ServiceTypeId = bigint;
export interface InvoiceTemplateInput {
    qrIban?: string;
    fusszeileLayout?: string;
    qrKontoinhaberAdresse?: string;
    bank: string;
    iban: string;
    kopfzeileLayout?: string;
    fusstext: string;
    mwstNummer: string;
    qrKontoinhaber?: string;
    kopfzeileLogoQuelle?: string;
    qrReferenztyp?: string;
    kopfzeileBildPosition?: string;
    kopfzeileAdressePosition?: string;
    zahlungszielTage: bigint;
    kopfzeileBildUrl?: string;
    qrWaehrung?: string;
    spalten: Array<string>;
    qrReferenzPraefix?: string;
    fusszeilePosition?: string;
    mwstSatz?: number;
    kopfzeileLogoGroesse?: string;
    kopftext: string;
    kundenadresseAbstandNach?: bigint;
    kundenadresseAbstandOben?: number;
    kundenadresseEinrueckungZeichen?: bigint;
    fusszeileBildPosition?: string;
    kopfzeileAdresse?: string;
    kopfzeilePosition?: string;
    praefix: string;
    naechsteNummer: bigint;
    qrAktivStandard?: boolean;
    farbe: string;
    fusszeileBildUrl?: string;
    kundenadresseLinks?: boolean;
}
export interface UpdateTimeEntryInput {
    bis?: string;
    von?: string;
    hours?: number;
    date?: string;
    description?: string;
    billable?: boolean;
    projectId?: ProjectId;
    serviceTypeId?: ServiceTypeId;
}
export interface InvoiceTemplate {
    id: bigint;
    qrIban?: string;
    fusszeileLayout?: string;
    qrKontoinhaberAdresse?: string;
    bank: string;
    iban: string;
    kopfzeileLayout?: string;
    createdAt: Timestamp;
    fusstext: string;
    mwstNummer: string;
    qrKontoinhaber?: string;
    kopfzeileLogoQuelle?: string;
    qrReferenztyp?: string;
    kopfzeileBildPosition?: string;
    kopfzeileAdressePosition?: string;
    zahlungszielTage: bigint;
    kopfzeileBildUrl?: string;
    qrWaehrung?: string;
    spalten: Array<string>;
    qrReferenzPraefix?: string;
    fusszeilePosition?: string;
    mwstSatz: number;
    kopfzeileLogoGroesse?: string;
    kopftext: string;
    kundenadresseAbstandNach?: bigint;
    kundenadresseAbstandOben?: number;
    kundenadresseEinrueckungZeichen?: bigint;
    fusszeileBildPosition?: string;
    kopfzeileAdresse?: string;
    kopfzeilePosition?: string;
    praefix: string;
    naechsteNummer: bigint;
    qrAktivStandard: boolean;
    farbe: string;
    fusszeileBildUrl?: string;
    kundenadresseLinks?: boolean;
    companyId: CompanyId;
}
export interface Project {
    id: ProjectId;
    status: ProjectStatus;
    erfassungsart?: Erfassungsart;
    active: boolean;
    code: string;
    billableRate: number;
    name: string;
    customerId: CustomerId;
    kurzbezeichnung: string;
    kostendachCHF?: number;
    projektleiter?: EmployeeId;
    companyId: CompanyId;
}
export interface CreateVacationBalanceInput {
    verfallsdatum?: bigint;
    kalenderjahr: bigint;
    dauer: bigint;
}
export interface CompanySubscription {
    stripeCurrentPeriodEnd?: bigint;
    latestStripePaymentStatus?: string;
    latestStripeInvoiceId?: string;
    nextDueDate?: bigint;
    planId: string;
    stripeSubscriptionId?: string;
    billingModel: BillingModel;
    proRataCalculatedAt?: bigint;
    scheduledPlanChangePriceId?: string;
    stripeCancelAtPeriodEnd: boolean;
    stripeProductId?: string;
    stripeCustomerId?: string;
    subscriptionStartDate?: bigint;
    scheduledPlanChangeEffectiveAt?: bigint;
    stripeStatus?: string;
    proRataAmount?: number;
    stripeCurrentPeriodStart?: bigint;
    lastStripeSyncAt?: bigint;
    scheduledPlanChangeId?: string;
    proRataNote?: string;
    companyId: bigint;
}
export interface AbsenceType {
    id: AbsenceTypeId;
    aktiv: boolean;
    name: string;
    requiresApproval: boolean;
    visibility?: AbsenceTypeVisibility;
    compensated: boolean;
    companyId: CompanyId;
}
export type FeatureKey = string;
export type AbsenceId = bigint;
export type Time = bigint;
export type Result_44 = {
    __kind__: "ok";
    ok: {
        estimatedMonthlyCost: number;
        currentPlanId?: string;
        activeUserCount: bigint;
        changeNeeded: boolean;
        suggestedPlanId?: string;
        suggestedPlanName: string;
        currentPlanName: string;
    };
} | {
    __kind__: "err";
    err: string;
};
export type Result_13 = {
    __kind__: "ok";
    ok: Employee;
} | {
    __kind__: "err";
    err: string;
};
export interface StripeEvent {
    id: string;
    stripeEventId: string;
    processingStatus: StripeEventStatus;
    stripeSubscriptionId?: string;
    errorMessage?: string;
    tenantId?: bigint;
    processedAt?: bigint;
    subscriptionId?: string;
    receivedAt: bigint;
    stripeCustomerId?: string;
    rawPayload?: string;
    eventType: string;
}
export type Result_25 = {
    __kind__: "ok";
    ok: {
        spesen: Array<Expense>;
        zeiteintraege: Array<UnbilledTimeEntry>;
    };
} | {
    __kind__: "err";
    err: string;
};
export interface CreateAbsenceTypeInput {
    aktiv?: boolean;
    name: string;
    requiresApproval: boolean;
    visibility?: AbsenceTypeVisibility;
    compensated: boolean;
}
export type AbsenceTypeId = bigint;
export interface Rechnungsadresse {
    ort?: string;
    plz?: string;
    zusatz1?: string;
    zusatz2?: string;
    postfach?: string;
    land: string;
    strasse?: string;
}
export interface AbsenceApprovalInput {
    reason?: string;
}
export interface Absence {
    id: AbsenceId;
    status: AbsenceStatus;
    absenceTypeId: AbsenceTypeId;
    dateTo: string;
    ganztaetig: boolean;
    approvedBy?: Principal;
    createdAt: Timestamp;
    description?: string;
    employeeId: EmployeeId;
    resetReason?: string;
    rejectionComment?: string;
    dateFrom: string;
    dauer: bigint;
    companyId: CompanyId;
}
export type Result_11 = {
    __kind__: "ok";
    ok: Expense;
} | {
    __kind__: "err";
    err: string;
};
export type Result_27 = {
    __kind__: "ok";
    ok: bigint;
} | {
    __kind__: "err";
    err: string;
};
export interface HttpTransformArgs {
    context: Uint8Array;
    response: HttpRequestResult;
}
export interface UpdateServiceTypeInput {
    defaultRate?: number;
    aktiv?: boolean;
    name?: string;
    billable?: boolean;
}
export interface TimeEntryFilter {
    dateTo?: string;
    employeeId?: EmployeeId;
    projectId?: ProjectId;
    dateFrom?: string;
}
export interface UpdateInvoiceInput {
    status?: InvoiceStatus;
    fusstext?: string;
    positionen?: Array<InvoicePositionInput>;
    faelligkeitsdatum?: string;
    qrAktiv?: boolean;
    mwstSatz?: number;
    rabatt?: number;
    kopftext?: string;
    kundeId?: CustomerId;
    datum?: string;
    skonto?: number;
}
export type Result_46 = {
    __kind__: "ok";
    ok: ProjectAssignment;
} | {
    __kind__: "err";
    err: string;
};
export interface EmployeeComplianceProfile {
    id: bigint;
    aktiv: boolean;
    createdAt: bigint;
    updatedAt: bigint;
    employeeId: bigint;
    ausnahmeprofil?: string;
    vertraglicheWochenstunden: number;
    erfassungsModus: string;
    vertraglicheZusatzferienTage: number;
    gesetzlicheWochenhochstarbeitszeit: number;
    gesetzlicherFerienanspruchWochen: number;
    companyId: bigint;
}
export interface VacationLedger {
    id: bigint;
    serviceYearStart: bigint;
    verbleibendeFerientage: number;
    laengsterZusammenhangenderBlock: bigint;
    lastUpdatedAt: bigint;
    bezogeneFerientage: number;
    employeeId: bigint;
    calendarYearKey: string;
    serviceYearEnd: bigint;
    serviceYearKey: string;
    gesetzlicheFerientage: number;
    twoWeekBlockSatisfied: boolean;
    geplanteFerientage: number;
    vertraglicheZusatzferienTage: number;
    companyId: bigint;
}
export interface TimeBalanceCorrection {
    id: string;
    typ: Variant_gutschrift_reduktion;
    ueberzeit: bigint;
    bemerkung: string;
    employeeId: EmployeeId;
    wirkungsdatum: bigint;
    dauer: bigint;
    companyId: CompanyId;
}
export interface TimeEntryApprovalAuditEntry {
    id: bigint;
    oldStatus: string;
    action: string;
    changedBy: Principal;
    timestamp: bigint;
    targetType: string;
    newStatus: string;
    targetId: bigint;
    previousApprovedBy?: Principal;
    reason?: string;
}
export type Result_21 = {
    __kind__: "ok";
    ok: string;
} | {
    __kind__: "err";
    err: string;
};
export interface AbsenceFilter {
    status?: AbsenceStatus;
    absenceTypeId?: AbsenceTypeId;
    dateTo?: string;
    employeeId?: EmployeeId;
    dateFrom?: string;
}
export interface Invoice {
    id: bigint;
    status: InvoiceStatus;
    rechnungsnummer: string;
    total: number;
    createdAt: Timestamp;
    createdBy: Principal;
    fusstext: string;
    mwstBetrag: number;
    positionen: Array<InvoicePosition>;
    faelligkeitsdatum: string;
    qrAktiv: boolean;
    mwstSatz: number;
    rabatt: number;
    kopftext: string;
    kundeId: CustomerId;
    zwischensumme: number;
    datum: string;
    skonto: number;
    waehrung: string;
    companyId: CompanyId;
}
export interface ComplianceCockpitKPI {
    mitarbeiterMitGesetzlicherUeberzeit: bigint;
    ferienRisiken: bigint;
    pausenVerstoesse: bigint;
    ruhezeitVerstoesse: bigint;
    mitarbeiterMitVerstoessen: bigint;
}
export type Result_36 = {
    __kind__: "ok";
    ok: {
        nextDueDate?: bigint;
        billingModel: BillingModel;
        subscriptionStartDate?: bigint;
    };
} | {
    __kind__: "err";
    err: string;
};
export interface ReportFilter {
    dateTo: string;
    employeeId?: EmployeeId;
    projectId?: ProjectId;
    customerId?: CompanyId;
    dateFrom: string;
}
export interface CreateTimeEntryInput {
    bis?: string;
    von?: string;
    hours: number;
    date: string;
    description: string;
    billable: boolean;
    projectId: ProjectId;
    requiresApproval?: boolean;
    serviceTypeId: ServiceTypeId;
}
export type Result_42 = {
    __kind__: "ok";
    ok: InvoiceTemplate;
} | {
    __kind__: "err";
    err: string;
};
export type Result_18 = {
    __kind__: "ok";
    ok: AbsenceType;
} | {
    __kind__: "err";
    err: string;
};
export type Result_3 = {
    __kind__: "ok";
    ok: TimeEntry;
} | {
    __kind__: "err";
    err: string;
};
export interface UpdateAbsenceInput {
    dateTo?: string;
    ganztaetig?: boolean;
    description?: string;
    dateFrom?: string;
    dauer?: bigint;
}
export interface TimeEntryApprovalInput {
    reason?: string;
}
export type Result_23 = {
    __kind__: "ok";
    ok: Array<TimeBalanceCorrection>;
} | {
    __kind__: "err";
    err: string;
};
export type ProjectId = bigint;
export type Result_38 = {
    __kind__: "ok";
    ok: {
        url: string;
        sessionId: string;
    };
} | {
    __kind__: "err";
    err: string;
};
export interface UpdateVacationBalanceInput {
    verfallsdatum?: bigint;
    kalenderjahr?: bigint;
    dauer?: bigint;
}
export type Result_15 = {
    __kind__: "ok";
    ok: Customer;
} | {
    __kind__: "err";
    err: string;
};
export interface UpdateAbsenceTypeInput {
    aktiv?: boolean;
    name?: string;
    requiresApproval?: boolean;
    visibility?: AbsenceTypeVisibility;
    compensated?: boolean;
}
export type ExpenseId = bigint;
export interface EmployeeBudgetReport {
    employeeName: string;
    aufgewendetCHF: number;
    aufgewendeteStunden: number;
    employeeId: EmployeeId;
    serviceTypeReports: Array<ServiceTypeBudgetReport>;
    kostendachCHF: number;
}
export interface DetectedPause {
    pauseEnd: bigint;
    source: string;
    date: string;
    pauseStart: bigint;
    durationMinutes: bigint;
    complianceRelevant: boolean;
    ignored: boolean;
}
export interface CreateEmploymentInput {
    bis?: bigint;
    von: bigint;
    pensum: number;
    feiertagsberechnungsart: FeiertagsberechnungsartType;
    stundenDi: bigint;
    stundenDo: bigint;
    stundenFr: bigint;
    stundenMi: bigint;
    stundenMo: bigint;
    stundenSa: bigint;
    stundenSo: bigint;
    funktion: string;
}
export type TimeEntryId = bigint;
export interface ProjectMemberAssignment {
    stundensatz: number;
    employeeId: EmployeeId;
    kostendachCHF?: number;
    serviceTypeId: ServiceTypeId;
}
export interface UpdateCompanyInput {
    taxId?: string;
    name?: string;
    mwstNummer?: string;
    kontoInhaber?: string;
    logoUrl?: string;
    address?: string;
    kontoAdresse?: string;
}
export interface UserNotification {
    isDeleted: boolean;
    notification: Notification;
    isRead: boolean;
    readAt?: bigint;
}
export interface AuditEntry {
    id: bigint;
    oldStatus: string;
    action: string;
    changedBy: Principal;
    timestamp: Time;
    targetType: string;
    newStatus: string;
    targetId: bigint;
    previousApprovedBy?: Principal;
    reason?: string;
}
export type Result_5 = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: string;
};
export interface MaskedCalendarAbsence {
    id: string;
    status: string;
    displayTitle: string;
    employeeName?: string;
    visibilityMode: string;
    displayColor?: string;
    toDate: string;
    employeeId?: string;
    isOwnEntry: boolean;
    fromDate: string;
}
export interface PlatformAdminConfig {
    frontendCanisterId: string;
    stripeWebhookEndpointUrl: string;
    stripeSecretKey: string;
    stripePublishableKey: string;
    stripeWebhookSecret: string;
}
export interface DayPauseComplianceResult {
    status: string;
    isCompliant: boolean;
    date: string;
    detectedPauseMinutes: bigint;
    requiredPauseMinutes: bigint;
    meldung: string;
    employeeId: bigint;
    workDurationMinutes: bigint;
    pausen: Array<DetectedPause>;
    companyId: bigint;
}
export interface AuditFieldChange {
    after: string;
    before: string;
    fieldName: string;
}
export interface InvoicePositionInput {
    typ: InvoicePositionTyp;
    menge: number;
    referenzId?: bigint;
    bezeichnung: string;
    preis: number;
    einheit: string;
}
export interface DefaultWorkHours {
    stundenDi: bigint;
    stundenDo: bigint;
    stundenFr: bigint;
    stundenMi: bigint;
    stundenMo: bigint;
    stundenSa: bigint;
    stundenSo: bigint;
    companyId: CompanyId;
}
export type Result_31 = {
    __kind__: "ok";
    ok: number;
} | {
    __kind__: "err";
    err: string;
};
export interface ResolveFindingInput {
    resolutionType: ComplianceResolutionType;
    findingId: bigint;
    resolutionReason: string;
}
export type Result_7 = {
    __kind__: "ok";
    ok: Project;
} | {
    __kind__: "err";
    err: string;
};
export interface CycleSnapshot {
    frontendCycles: bigint;
    backendCycles: bigint;
    timestamp: bigint;
}
export type Result_28 = {
    __kind__: "ok";
    ok: Standardarbeitszeiten;
} | {
    __kind__: "err";
    err: string;
};
export interface ComplianceFinding {
    id: bigint;
    status: ComplianceStatus;
    istWert: number;
    resolutionType?: ComplianceResolutionType;
    periodeKey: string;
    periodeTyp: CompliancePeriodeTyp;
    rechtlicheReferenz?: string;
    auditHash?: string;
    createdAt: bigint;
    sollWert: number;
    resolutionReason?: string;
    sourceEntryIds: Array<bigint>;
    meldung: string;
    employeeId: bigint;
    resolvedAt?: bigint;
    resolvedBy?: bigint;
    ruleCode: string;
    einheit: string;
    companyId: bigint;
}
export interface AuditLogEntry {
    id: string;
    beforeState?: string;
    actorName: string;
    entityId: string;
    operation: AuditOperation;
    timestamp: bigint;
    actorPrincipal: string;
    entityType: AuditEntityType;
    fieldChanges?: Array<AuditFieldChange>;
    afterState?: string;
    companyId: CompanyId;
}
export interface PlatformAdminUserEntry {
    id: EmployeeId;
    activatedAt?: bigint;
    role: Role;
    deactivatedAt?: bigint;
    isActive: boolean;
    email: string;
    lastName: string;
    firstName: string;
}
export type Result_9 = {
    __kind__: "ok";
    ok: Holiday;
} | {
    __kind__: "err";
    err: string;
};
export interface Expense {
    id: ExpenseId;
    status: ExpenseStatus;
    fakturiertInRechnungId?: bigint;
    date: string;
    description: string;
    employeeId: EmployeeId;
    projektId?: bigint;
    resetReason?: string;
    billableCHF: number;
    kundeId?: bigint;
    reimbursementCHF: number;
    expenseTypeId: ExpenseTypeId;
    receiptBlobId?: string;
    companyId: CompanyId;
}
export interface Employment {
    id: string;
    bis?: bigint;
    von: bigint;
    pensum: number;
    feiertagsberechnungsart: FeiertagsberechnungsartType;
    stundenDi: bigint;
    stundenDo: bigint;
    stundenFr: bigint;
    stundenMi: bigint;
    stundenMo: bigint;
    stundenSa: bigint;
    stundenSo: bigint;
    employeeId: EmployeeId;
    funktion: string;
    companyId: CompanyId;
}
export interface AbsenceTypeVisibility {
    visibleForRoles: Array<string>;
    showAbsenceTypeName: boolean;
    visibilityMode: CalendarVisibilityMode;
    showComment: boolean;
    companyCalendarDisplayName?: string;
    showEmployeeName: boolean;
    visibleInCompanyCalendar: boolean;
    companyCalendarColor?: string;
}
export interface Standardarbeitszeiten {
    tuesday: Array<StandardTimeBlock>;
    wednesday: Array<StandardTimeBlock>;
    saturday: Array<StandardTimeBlock>;
    thursday: Array<StandardTimeBlock>;
    sunday: Array<StandardTimeBlock>;
    friday: Array<StandardTimeBlock>;
    monday: Array<StandardTimeBlock>;
}
export type CustomerId = bigint;
export type Result_30 = {
    __kind__: "ok";
    ok: ProjectBudgetReport;
} | {
    __kind__: "err";
    err: string;
};
export interface UpdateComplianceProfileInput {
    id: bigint;
    aktiv: boolean;
    ausnahmeprofil?: string;
    vertraglicheWochenstunden: number;
    erfassungsModus: string;
    vertraglicheZusatzferienTage: number;
    gesetzlicheWochenhochstarbeitszeit: number;
    gesetzlicherFerienanspruchWochen: number;
}
export interface UserNotificationSettings {
    emailNewVacationRequest: boolean;
    emailOnApproval: boolean;
    principalId: Principal;
    companyId: CompanyId;
}
export interface UpdateExpenseTypeInput {
    aktiv?: boolean;
    name?: string;
    billable?: boolean;
    reimbursable?: boolean;
}
export interface UpdateExpenseInput {
    date?: string;
    description?: string;
    projektId?: bigint;
    billableCHF?: number;
    kundeId?: bigint;
    reimbursementCHF?: number;
    expenseTypeId?: ExpenseTypeId;
    receiptBlobId?: string;
}
export type Timestamp = bigint;
export type Result_37 = {
    __kind__: "ok";
    ok: {
        url: string;
    };
} | {
    __kind__: "err";
    err: string;
};
export type Result_17 = {
    __kind__: "ok";
    ok: Company;
} | {
    __kind__: "err";
    err: string;
};
export interface UpdateEmployeeInput {
    ort?: string;
    plz?: string;
    weeklyHoursTarget?: number;
    active?: boolean;
    postfach?: string;
    land?: string;
    role?: Role;
    email?: string;
    geburtsdatum?: bigint;
    employmentType?: EmploymentType;
    adresseZusatz1?: string;
    adresseZusatz2?: string;
    lastName?: string;
    strasse?: string;
    startDate?: string;
    firstName?: string;
}
export interface MonthlyBillingEntry {
    month: string;
    activeUserCount: bigint;
    planId: string;
    billableUserCount: bigint;
    billingModel?: string;
    year: bigint;
    creditAmount?: number;
    totalCHF: number;
    companyName: string;
    nextDueDateTimestamp?: bigint;
    planName: string;
    proRataAmount?: number;
    proRataNote?: string;
    companyId: bigint;
}
export interface CreatePauseOverrideInput {
    action: string;
    userId: bigint;
    date: string;
    gapEnd: bigint;
    gapStart: bigint;
    reason?: string;
    companyId: bigint;
}
export interface CreateEmployeeInput {
    ort?: string;
    plz?: string;
    weeklyHoursTarget: number;
    postfach?: string;
    land?: string;
    role: Role;
    email: string;
    geburtsdatum?: bigint;
    employmentType: EmploymentType;
    adresseZusatz1?: string;
    adresseZusatz2?: string;
    lastName: string;
    strasse?: string;
    startDate: string;
    firstName: string;
}
export interface UpdateTimeBalanceCorrectionInput {
    typ?: Variant_gutschrift_reduktion;
    ueberzeit?: bigint;
    bemerkung?: string;
    wirkungsdatum?: bigint;
    dauer?: bigint;
}
export type Result_16 = {
    __kind__: "ok";
    ok: CompanySettings;
} | {
    __kind__: "err";
    err: string;
};
export type Result_1 = {
    __kind__: "ok";
    ok: VacationBalance;
} | {
    __kind__: "err";
    err: string;
};
export type Result_22 = {
    __kind__: "ok";
    ok: Array<VacationBalance>;
} | {
    __kind__: "err";
    err: string;
};
export interface UnbilledTimeEntry {
    id: bigint;
    bis?: string;
    von?: string;
    hours: number;
    date: string;
    stundensatz: number;
    createdAt: bigint;
    description: string;
    totalCHF: number;
    employeeId: bigint;
    billable: boolean;
    projectId: bigint;
    serviceTypeId: bigint;
    companyId: bigint;
}
export interface CostSettings {
    backendAlertThreshold: bigint;
    icpPriceUsd: number;
    alertEnabled: boolean;
    usdChfRate: number;
    frontendAlertThreshold: bigint;
}
export interface CreateExpenseTypeInput {
    aktiv?: boolean;
    name: string;
    billable: boolean;
    reimbursable: boolean;
}
export type Result_19 = {
    __kind__: "ok";
    ok: Absence;
} | {
    __kind__: "err";
    err: string;
};
export type Result_29 = {
    __kind__: "ok";
    ok: Array<ProjectMemberAssignment>;
} | {
    __kind__: "err";
    err: string;
};
export interface SubscriptionPlan {
    id: string;
    features: Array<string>;
    requiresPayment: boolean;
    sortOrder: bigint;
    name: string;
    stripeLookupKey?: string;
    description: string;
    isActive: boolean;
    stripeProductId?: string;
    updatedAt: bigint;
    pricePerYearCHF: number;
    stripePriceId?: string;
    pricePerMonthCHF: number;
    stripeMode?: string;
    stripePriceIdYearly?: string;
    minActiveDaysPerMonth: bigint;
    maxEmployees?: bigint;
    paymentProvider: PaymentProvider;
}
export type Result_24 = {
    __kind__: "ok";
    ok: Array<Employment>;
} | {
    __kind__: "err";
    err: string;
};
export type Result_14 = {
    __kind__: "ok";
    ok: DefaultWorkHours;
} | {
    __kind__: "err";
    err: string;
};
export interface Employee {
    id: EmployeeId;
    ort?: string;
    plz?: string;
    weeklyHoursTarget: number;
    active: boolean;
    postfach?: string;
    activatedAt?: bigint;
    land?: string;
    role: Role;
    deactivatedAt?: bigint;
    email: string;
    geburtsdatum?: bigint;
    employmentType: EmploymentType;
    adresseZusatz1?: string;
    adresseZusatz2?: string;
    lastName: string;
    principalId?: Principal;
    strasse?: string;
    startDate: string;
    companyId: CompanyId;
    firstName: string;
}
export interface CreateCustomerInput {
    rechnungsadresse?: Rechnungsadresse;
    contact?: string;
    aktiv?: boolean;
    name: string;
    zeiterfassungsart?: KundeZeiterfassungsart;
    kundennummer?: string;
    notes?: string;
    beschreibung?: string;
    waehrung?: string;
}
export interface CompanySettings {
    timezone: string;
    approvalRequired: boolean;
    allowExpiredVacationBalance: boolean;
    emailNewVacationRequest: boolean;
    emailOnApproval: boolean;
    vacationCarryoverDays: bigint;
    maxVacationDays: bigint;
    companyId: CompanyId;
}
export type HolidayId = bigint;
export interface UpdateHolidayInput {
    ganztaegig?: boolean;
    date?: string;
    name?: string;
}
export type Result_43 = {
    __kind__: "ok";
    ok: {
        internalStatus: string;
        inSync: boolean;
        stripeStatus: string;
    };
} | {
    __kind__: "err";
    err: string;
};
export type Result_33 = {
    __kind__: "ok";
    ok: InvoiceTemplate | null;
} | {
    __kind__: "err";
    err: string;
};
export interface VacationBalance {
    id: string;
    verfallsdatum?: bigint;
    employeeId: EmployeeId;
    kalenderjahr: bigint;
    dauer: bigint;
    companyId: CompanyId;
}
export interface Customer {
    id: CustomerId;
    rechnungsadresse?: Rechnungsadresse;
    contact?: string;
    aktiv: boolean;
    name: string;
    zeiterfassungsart: KundeZeiterfassungsart;
    kundennummer?: string;
    notes?: string;
    beschreibung?: string;
    waehrung: string;
    companyId: CompanyId;
}
export interface CreateHolidayInput {
    ganztaegig?: boolean;
    date: string;
    name: string;
}
export interface Company {
    id: CompanyId;
    taxId?: string;
    name: string;
    createdAt: Timestamp;
    mwstNummer?: string;
    kontoInhaber?: string;
    isActive: boolean;
    logoUrl?: string;
    address?: string;
    kontoAdresse?: string;
}
export interface CalendarData {
    absences: Array<Absence>;
    expenses: Array<Expense>;
    timeEntries: Array<TimeEntry>;
}
export type Result_35 = {
    __kind__: "ok";
    ok: WorkTimeBalance;
} | {
    __kind__: "err";
    err: string;
};
export type CompanyId = bigint;
export interface UpdateProjectInput {
    status?: ProjectStatus;
    erfassungsart?: Erfassungsart;
    active?: boolean;
    code?: string;
    billableRate?: number;
    name?: string;
    customerId?: CustomerId;
    kurzbezeichnung?: string;
    kostendachCHF?: number;
    projektleiter?: EmployeeId;
}
export interface ReportData {
    expenses: number;
    entries: Array<TimeEntry>;
    billableHours: number;
    expenseItems: Array<Expense>;
}
export interface CreateProjectInput {
    status?: ProjectStatus;
    erfassungsart?: Erfassungsart;
    code: string;
    billableRate: number;
    name: string;
    customerId: CustomerId;
    kurzbezeichnung: string;
    kostendachCHF?: number;
    projektleiter?: EmployeeId;
}
export type Result_45 = {
    __kind__: "ok";
    ok: {
        note: string;
        remainingDays: bigint;
        isUpgrade: boolean;
        proRataAmount: number;
    };
} | {
    __kind__: "err";
    err: string;
};
export interface Holiday {
    id: HolidayId;
    ganztaegig: boolean;
    date: string;
    name: string;
    companyId: CompanyId;
}
export type Result_20 = {
    __kind__: "ok";
    ok: CompanySubscription;
} | {
    __kind__: "err";
    err: string;
};
export interface StripeInvoice {
    id: string;
    status: string;
    stripeSubscriptionId?: string;
    dueDate?: bigint;
    stripeInvoiceId: string;
    amountPaid: number;
    invoicePdfUrl?: string;
    invoiceNumber?: string;
    periodEnd?: bigint;
    stripeCustomerId: string;
    currency: string;
    amountDue: number;
    periodStart?: bigint;
    issuedAt: bigint;
    paidAt?: bigint;
    hostedInvoiceUrl?: string;
    companyId: bigint;
}
export enum AbsenceStatus {
    submitted = "submitted",
    approved = "approved",
    rejected = "rejected"
}
export enum AuditEntityType {
    expenseType = "expenseType",
    serviceType = "serviceType",
    expense = "expense",
    timeEntry = "timeEntry",
    customer = "customer",
    ferien = "ferien",
    invoiceTemplate = "invoiceTemplate",
    absence = "absence",
    company = "company",
    employee = "employee",
    approval = "approval",
    absenceType = "absenceType",
    holiday = "holiday",
    project = "project"
}
export enum AuditOperation {
    reject = "reject",
    remove = "remove",
    approve = "approve",
    delete_ = "delete",
    create = "create",
    update = "update"
}
export enum BillingModel {
    monthly = "monthly",
    yearly = "yearly"
}
export enum CalendarVisibilityMode {
    full = "full",
    hidden = "hidden",
    anonymized = "anonymized",
    masked_reason = "masked_reason"
}
export enum CompliancePeriodeTyp {
    DAY = "DAY",
    SERVICE_YEAR = "SERVICE_YEAR",
    WEEK = "WEEK"
}
export enum ComplianceResolutionType {
    FREIGEGEBEN = "FREIGEGEBEN",
    IGNORED = "IGNORED",
    CORRECTED = "CORRECTED"
}
export enum ComplianceStatus {
    CRITICAL = "CRITICAL",
    FREIGEGEBEN = "FREIGEGEBEN",
    INFO = "INFO",
    COMPLIANT = "COMPLIANT",
    WARNING = "WARNING",
    BREACH = "BREACH"
}
export enum EmploymentType {
    partTime = "partTime",
    fullTime = "fullTime",
    contractor = "contractor"
}
export enum Erfassungsart {
    zeitBlock = "zeitBlock",
    dauer = "dauer"
}
export enum ExpenseStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum FeiertagsberechnungsartType {
    wochentag_sollzeit = "wochentag_sollzeit",
    durchschnittssoll = "durchschnittssoll",
    keineGutschrift = "keineGutschrift"
}
export enum InvoicePositionTyp {
    leistung = "leistung",
    freitext = "freitext",
    spese = "spese"
}
export enum InvoiceStatus {
    entwurf = "entwurf",
    versendet = "versendet",
    bezahlt = "bezahlt",
    storniert = "storniert",
    ueberfaellig = "ueberfaellig"
}
export enum KundeZeiterfassungsart {
    stuendlich = "stuendlich",
    block = "block"
}
export enum NotificationFormat {
    html = "html",
    markdown = "markdown"
}
export enum NotificationPriority {
    normal = "normal",
    important = "important",
    critical = "critical"
}
export enum NotificationStatus {
    sent = "sent",
    draft = "draft",
    archived = "archived"
}
export enum NotificationTargetType {
    mixed = "mixed",
    role = "role",
    user = "user",
    tenant = "tenant"
}
export enum PaymentProvider {
    stripe = "stripe",
    none = "none",
    manual = "manual"
}
export enum ProjectStatus {
    aktiv = "aktiv",
    inaktiv = "inaktiv",
    abgeschlossen = "abgeschlossen"
}
export enum Role {
    manager = "manager",
    admin = "admin",
    employee = "employee"
}
export enum StripeEventStatus {
    processed = "processed",
    ignored = "ignored",
    received = "received",
    failed = "failed"
}
export enum TimeEntryStatus {
    submitted = "submitted",
    approved = "approved",
    rejected = "rejected",
    draft = "draft"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_gutschrift_reduktion {
    gutschrift = "gutschrift",
    reduktion = "reduktion"
}
export interface backendInterface {
    applyPlanChange(companyId: bigint, newPlanId: string, billingModel: BillingModel): Promise<Result_21>;
    approveAbsence(id: AbsenceId): Promise<Result_19>;
    approveAbsenceApproval(absenceId: AbsenceId, input: AbsenceApprovalInput): Promise<Result_5>;
    approveExpense(id: ExpenseId): Promise<Result_11>;
    approveTimeEntry(entryId: TimeEntryId, input: TimeEntryApprovalInput): Promise<Result_3>;
    archiveNotification(notificationId: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    assignEmployeeToProject(employeeId: EmployeeId, projectId: ProjectId): Promise<Result_46>;
    assignSubscriptionPlan(companyId: string, planId: string): Promise<Result_5>;
    calculateMonthlyBilling(month: bigint, year: bigint): Promise<Array<MonthlyBillingEntry>>;
    calculateProRataAdjustment(companyId: bigint, newPlanId: string): Promise<Result_45>;
    cancelInvoice(invoiceId: bigint): Promise<Result_8>;
    cancelStripeSubscription(companyId: bigint): Promise<Result_20>;
    checkFeatureAccess(featureKey: FeatureKey): Promise<FeatureAccessResult>;
    checkPlanChangeNeeded(companyId: bigint): Promise<Result_44>;
    compareStripeSubscriptionStatus(companyId: bigint): Promise<Result_43>;
    createAbsence(input: CreateAbsenceInput): Promise<Result_19>;
    createAbsenceType(input: CreateAbsenceTypeInput): Promise<Result_18>;
    createCustomer(input: CreateCustomerInput): Promise<Result_15>;
    createEmployee(input: CreateEmployeeInput): Promise<Result_13>;
    createEmployment(employeeId: EmployeeId, input: CreateEmploymentInput): Promise<Result_12>;
    createExpense(input: CreateExpenseInput): Promise<Result_11>;
    createExpenseType(input: CreateExpenseTypeInput): Promise<Result_10>;
    createHoliday(input: CreateHolidayInput): Promise<Result_9>;
    createInvoice(input: CreateInvoiceInput): Promise<Result_8>;
    createNotificationDraft(title: string, messageBody: string, messageFormat: NotificationFormat, priority: NotificationPriority, validFrom: bigint, validUntil: bigint | null, targetType: NotificationTargetType, targetTenantIds: Array<string>, targetRoleIds: Array<string>, targetUserIds: Array<string>): Promise<{
        __kind__: "ok";
        ok: Notification;
    } | {
        __kind__: "err";
        err: string;
    }>;
    createOrUpdateInvoiceTemplate(input: InvoiceTemplateInput): Promise<Result_42>;
    createPauseOverride(input: CreatePauseOverrideInput): Promise<{
        __kind__: "ok";
        ok: PauseOverride;
    } | {
        __kind__: "err";
        err: string;
    }>;
    createProject(input: CreateProjectInput): Promise<Result_7>;
    createServiceType(input: CreateServiceTypeInput): Promise<Result_6>;
    createStripeCheckoutLinkForCompany(companyId: bigint, planId: string, billingModel: BillingModel): Promise<Result_38>;
    createStripeCheckoutLinkForCompanyWithPrice(companyId: bigint, planId: string, billingModel: BillingModel, priceId: string): Promise<Result_38>;
    createStripeCheckoutSession(companyId: bigint, planId: string, billingModel: BillingModel): Promise<Result_38>;
    createStripeCheckoutSessionWithPrice(companyId: bigint, planId: string, billingModel: BillingModel, priceId: string): Promise<Result_38>;
    createStripeCustomerPortalSession(companyId: bigint): Promise<Result_37>;
    createTimeBalanceCorrection(employeeId: EmployeeId, input: CreateTimeBalanceCorrectionInput): Promise<Result_4>;
    createTimeEntry(input: CreateTimeEntryInput): Promise<Result_3>;
    createVacationBalance(employeeId: EmployeeId, input: CreateVacationBalanceInput): Promise<Result_1>;
    deleteAbsence(id: AbsenceId): Promise<Result_5>;
    deleteAbsenceType(id: AbsenceTypeId): Promise<Result_5>;
    deleteCustomer(id: CustomerId): Promise<Result_5>;
    deleteEmployee(id: EmployeeId): Promise<Result_5>;
    deleteEmployment(employeeId: EmployeeId, employmentId: string): Promise<Result_5>;
    deleteExpense(id: ExpenseId): Promise<Result_5>;
    deleteExpenseType(id: ExpenseTypeId): Promise<Result_5>;
    deleteHoliday(id: HolidayId): Promise<Result_5>;
    deleteInvoice(invoiceId: bigint): Promise<Result_5>;
    deleteMyNotification(notificationId: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    deletePauseOverride(overrideId: bigint): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    deleteProject(id: ProjectId): Promise<Result_5>;
    deleteServiceType(id: ServiceTypeId): Promise<Result_5>;
    deleteSubscriptionPlan(id: string): Promise<Result_5>;
    deleteTimeBalanceCorrection(employeeId: EmployeeId, correctionId: string): Promise<Result_5>;
    deleteTimeEntry(id: TimeEntryId): Promise<Result_5>;
    deleteVacationBalance(employeeId: EmployeeId, balanceId: string): Promise<Result_5>;
    duplicateNotification(notificationId: string): Promise<{
        __kind__: "ok";
        ok: Notification;
    } | {
        __kind__: "err";
        err: string;
    }>;
    generateInviteCode(employeeId: EmployeeId): Promise<Result_21>;
    getAbsenceApprovalStatus(absenceId: AbsenceId): Promise<{
        status: TimeEntryStatus;
        approvedBy?: Principal;
        reason?: string;
    } | null>;
    getAllCompanySubscriptions(): Promise<Array<[string, string]>>;
    getAllSubscriptionPlans(): Promise<Array<SubscriptionPlan>>;
    getApprovalRecord(entryId: TimeEntryId): Promise<{
        status: TimeEntryStatus;
        approvedBy?: Principal;
        reason?: string;
    } | null>;
    getBackendCanisterId(): Promise<string>;
    getCalendarEntries(month: string, year: bigint): Promise<CalendarData>;
    getCallerUserRole(): Promise<UserRole>;
    getCanisterStatusInfo(): Promise<CanisterStatusInfo>;
    getCompanyBillingModel(companyId: bigint): Promise<Result_36>;
    getCompanyCalendarAbsences(companyId: CompanyId, fromDateNs: bigint, toDateNs: bigint): Promise<Array<MaskedCalendarAbsence>>;
    getCompanyEmployeesForBilling(companyId: CompanyId): Promise<Array<Employee>>;
    getCompanySettings(): Promise<Result_16>;
    getCompanySubscription(companyId: string): Promise<string | null>;
    getCompanySubscriptionPlan(companyId: bigint): Promise<SubscriptionPlan | null>;
    getComplianceCockpitKPI(companyId: bigint): Promise<ComplianceCockpitKPI>;
    getComplianceCockpitRows(companyId: bigint): Promise<Array<ComplianceCockpitRow>>;
    getComplianceFindings(employeeId: bigint, periodeTyp: CompliancePeriodeTyp | null, status: Array<ComplianceStatus> | null): Promise<Array<ComplianceFinding>>;
    getComplianceProfile(employeeId: bigint): Promise<EmployeeComplianceProfile | null>;
    getCostDashboardData(fromTime: bigint | null, toTime: bigint | null): Promise<CostDashboardData>;
    getCostSettings(): Promise<CostSettings>;
    getCycleSnapshots(fromTime: bigint | null, toTime: bigint | null): Promise<Array<CycleSnapshot>>;
    getCycleStatus(): Promise<CycleStatus>;
    getDashboardStats(): Promise<DashboardStats>;
    getDefaultWorkHours(): Promise<DefaultWorkHours>;
    getEmployeeWorkTimeBalance(employeeId: EmployeeId, startDate: string, endDate: string): Promise<Result_35>;
    getEmployeeWorkTimeBalanceFromStart(employeeId: EmployeeId): Promise<Result_35>;
    getEmploymentForDate(employeeId: EmployeeId, date: string): Promise<Result_34>;
    getFrontendCyclesManual(): Promise<bigint>;
    getInvoiceById(invoiceId: bigint): Promise<Result_8>;
    getInvoiceTemplate(): Promise<Result_33>;
    getInvoices(): Promise<Result_32>;
    getMonthlyBillingOverview(year: bigint, month: bigint): Promise<Array<MonthlyBillingEntry>>;
    getMyCompany(): Promise<Result_17>;
    getMyComplianceFindings(periodeTyp: CompliancePeriodeTyp | null): Promise<Array<ComplianceFinding>>;
    getMyComplianceProfile(): Promise<EmployeeComplianceProfile | null>;
    getMyEmployee(): Promise<Result_13>;
    getMyPlanFeatures(): Promise<Array<FeatureKey>>;
    getMyStandardarbeitszeiten(): Promise<Result_28>;
    getMyVacationLedger(serviceYearKey: string): Promise<VacationLedger | null>;
    getPauseComplianceForDay(employeeId: bigint, date: string): Promise<DayPauseComplianceResult>;
    getPauseOverridesForDay(employeeId: bigint, date: string): Promise<Array<PauseOverride>>;
    getPausesForDay(employeeId: bigint, date: string): Promise<Array<DetectedPause>>;
    getPlatformAdminConfig(): Promise<PlatformAdminConfigPublic>;
    getPlatformAdminInfo(): Promise<{
        principal: string;
        createdAt: bigint;
    } | null>;
    getProjectAufwendungen(projectId: ProjectId): Promise<Result_31>;
    getProjectBudgetReport(projectId: ProjectId, dateFrom: string, dateTo: string): Promise<Result_30>;
    getProjectMembers(projectId: ProjectId): Promise<Result_29>;
    getReportData(filter: ReportFilter): Promise<ReportData>;
    getServiceYears(employeeId: bigint): Promise<Array<string>>;
    getSnapshotInterval(): Promise<bigint>;
    getStandardarbeitszeitenForEmployee(employeeId: EmployeeId): Promise<Result_28>;
    getStripeConfigStatus(): Promise<{
        hasPublishableKey: boolean;
        testMode: boolean;
        configured: boolean;
    }>;
    getStripeEvents(companyId: bigint | null, limit: bigint): Promise<Array<StripeEvent>>;
    getStripeInvoicesForCompany(companyId: bigint): Promise<Array<StripeInvoice>>;
    getStripePublishableKey(): Promise<string | null>;
    getSubscriptionPlans(): Promise<Array<SubscriptionPlan>>;
    getSystemStats(): Promise<{
        totalEmployees: bigint;
        totalCompanies: bigint;
    }>;
    getTenantCostBreakdown(): Promise<Array<TenantCostEntry>>;
    getTimeBalance(employeeId: EmployeeId): Promise<Result_27>;
    getTimeEntryApprovalStatus(entryId: TimeEntryId): Promise<TimeEntryStatus | null>;
    getUnbilledEntries(kundeId: bigint | null): Promise<Result_26>;
    getUnbilledEntriesWithRates(kundeId: bigint | null): Promise<Result_25>;
    getUnreadCount(): Promise<bigint>;
    getUserNotificationSettings(): Promise<Result_2>;
    getUsersForCompany(companyId: CompanyId): Promise<Array<PlatformAdminUserEntry>>;
    getVacationLedger(employeeId: bigint, serviceYearKey: string): Promise<VacationLedger | null>;
    getVacationLedgerAll(employeeId: bigint): Promise<Array<VacationLedger>>;
    handleStripeWebhook(payload: string, signature: string): Promise<Result_21>;
    initAllVacationLedgers(companyId: bigint): Promise<{
        __kind__: "ok";
        ok: bigint;
    } | {
        __kind__: "err";
        err: string;
    }>;
    isCallerAdmin(): Promise<boolean>;
    isPlatformAdmin(): Promise<boolean>;
    isRegistered(): Promise<boolean>;
    listAbsenceTypes(): Promise<Array<AbsenceType>>;
    listAbsences(filter: AbsenceFilter): Promise<Array<Absence>>;
    listAllCompaniesForPlatformAdmin(): Promise<Array<{
        id: string;
        name: string;
        createdAt: bigint;
        inactiveEmployeeCount: bigint;
        isActive: boolean;
        address?: string;
        activeEmployeeCount: bigint;
    }>>;
    listAllNotifications(): Promise<Array<Notification>>;
    listApprovalAuditLog(): Promise<Array<TimeEntryApprovalAuditEntry>>;
    listAuditLog(targetType: string | null, targetId: bigint | null): Promise<Array<AuditEntry>>;
    listAuditLogs(filter: AuditLogFilter): Promise<Array<AuditLogEntry>>;
    listCustomers(): Promise<Array<Customer>>;
    listEmployees(): Promise<Array<Employee>>;
    listEmployments(employeeId: EmployeeId): Promise<Result_24>;
    listExpenseTypes(): Promise<Array<ExpenseType>>;
    listExpenses(filter: ExpenseFilter): Promise<Array<Expense>>;
    listHolidays(): Promise<Array<Holiday>>;
    listMyNotifications(): Promise<Array<UserNotification>>;
    listProjectAssignments(): Promise<Array<ProjectAssignment>>;
    listProjects(): Promise<Array<Project>>;
    listServiceTypes(): Promise<Array<ServiceType>>;
    listSubmittedTimeEntries(): Promise<Array<TimeEntry>>;
    listTimeBalanceCorrections(employeeId: EmployeeId): Promise<Result_23>;
    listTimeEntries(filter: TimeEntryFilter): Promise<Array<TimeEntry>>;
    listVacationBalances(employeeId: EmployeeId): Promise<Result_22>;
    manuallyTriggerStripeSync(companyId: bigint): Promise<Result_21>;
    markAllNotificationsRead(): Promise<{
        __kind__: "ok";
        ok: bigint;
    } | {
        __kind__: "err";
        err: string;
    }>;
    markFakturiert(invoiceId: bigint, zeitIds: Array<bigint>, expenseIds: Array<bigint>): Promise<Result_5>;
    markNotificationRead(notificationId: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    purgeEmployee(id: EmployeeId): Promise<Result_5>;
    reactivateStripeSubscription(companyId: bigint): Promise<Result_20>;
    recordCycleSnapshot(frontendCycles: bigint, backendCycles: bigint): Promise<void>;
    recoverSubscriptionPlans(): Promise<Result_21>;
    redeemInviteCode(code: string): Promise<Result_13>;
    registerCompany(name: string, firstName: string, lastName: string, email: string): Promise<Result_17>;
    rejectAbsence(id: AbsenceId, comment: string): Promise<Result_19>;
    rejectAbsenceApproval(absenceId: AbsenceId, input: AbsenceApprovalInput): Promise<Result_5>;
    rejectExpense(id: ExpenseId, comment: string | null): Promise<Result_11>;
    rejectTimeEntry(entryId: TimeEntryId, input: TimeEntryApprovalInput): Promise<Result_3>;
    relinkStripeCustomer(companyId: bigint, stripeCustomerId: string): Promise<Result_21>;
    removeEmployeeFromProject(employeeId: EmployeeId, projectId: ProjectId): Promise<Result_5>;
    reprocessStripeEvent(stripeEventId: string): Promise<Result_21>;
    resetAbsenceApprovalToDraft(absenceId: AbsenceId, reason: string | null): Promise<Result_5>;
    resetAbsenceToAusstehend(id: AbsenceId, reason: string): Promise<Result_19>;
    resetExpenseToAusstehend(id: ExpenseId, reason: string): Promise<Result_11>;
    resetTimeEntryToDraft(entryId: TimeEntryId, reason: string | null): Promise<Result_3>;
    resolveFinding(input: ResolveFindingInput): Promise<{
        __kind__: "ok";
        ok: ComplianceFinding;
    } | {
        __kind__: "err";
        err: string;
    }>;
    restoreDefaultPlansIfMissing(): Promise<Result_21>;
    revokeInviteCode(code: string): Promise<Result_5>;
    runWeeklyComplianceCheck(companyId: bigint): Promise<{
        __kind__: "ok";
        ok: bigint;
    } | {
        __kind__: "err";
        err: string;
    }>;
    saveAndSendNotification(title: string, messageBody: string, messageFormat: NotificationFormat, priority: NotificationPriority, validFrom: bigint, validUntil: bigint | null, targetType: NotificationTargetType, targetTenantIds: Array<string>, targetRoleIds: Array<string>, targetUserIds: Array<string>): Promise<{
        __kind__: "ok";
        ok: Notification;
    } | {
        __kind__: "err";
        err: string;
    }>;
    sendNotification(notificationId: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    setCompanyActive(companyId: bigint, active: boolean): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    setCompanyBillingModel(companyId: bigint, billingModel: BillingModel): Promise<Result_5>;
    setEmployeeActive(id: EmployeeId, active: boolean): Promise<Result_13>;
    setFrontendCanisterId(id: string): Promise<void>;
    setFrontendCyclesManual(cycles: bigint): Promise<void>;
    setMyStandardarbeitszeiten(data: Standardarbeitszeiten): Promise<Result_5>;
    setPlatformAdminConfig(config: PlatformAdminConfig): Promise<Result_5>;
    setProjectMembers(projectId: ProjectId, members: Array<ProjectMemberAssignment>): Promise<Result_5>;
    setSnapshotInterval(seconds: bigint): Promise<void>;
    setStandardarbeitszeitenForEmployee(employeeId: EmployeeId, data: Standardarbeitszeiten): Promise<Result_5>;
    setStripeConfig(secretKey: string, publishableKey: string, webhookSecret: string): Promise<Result_21>;
    setUserActiveForCompany(companyId: CompanyId, employeeId: EmployeeId, active: boolean): Promise<Result_5>;
    setUserRoleForCompany(companyId: CompanyId, employeeId: EmployeeId, role: Role): Promise<Result_5>;
    startSnapshotTimer(): Promise<void>;
    submitAbsenceForApproval(absenceId: AbsenceId): Promise<Result_5>;
    submitTimeEntryForApproval(entryId: TimeEntryId): Promise<Result_3>;
    syncStripeSubscription(companyId: bigint): Promise<Result_20>;
    testStripeConnection(): Promise<{
        apiConnectionOk: boolean;
        apiConnectionMessage: string;
        customerPortalOk: boolean;
        customerPortalMessage: string;
    }>;
    transformStripeResponse(args: HttpTransformArgs): Promise<HttpRequestResult>;
    updateAbsence(id: AbsenceId, input: UpdateAbsenceInput): Promise<Result_19>;
    updateAbsenceType(id: AbsenceTypeId, input: UpdateAbsenceTypeInput): Promise<Result_18>;
    updateCompany(input: UpdateCompanyInput): Promise<Result_17>;
    updateCompanySettings(input: CompanySettings): Promise<Result_16>;
    updateComplianceProfile(input: UpdateComplianceProfileInput): Promise<{
        __kind__: "ok";
        ok: EmployeeComplianceProfile;
    } | {
        __kind__: "err";
        err: string;
    }>;
    updateCostSettings(settings: CostSettings): Promise<void>;
    updateCustomer(id: CustomerId, input: UpdateCustomerInput): Promise<Result_15>;
    updateDefaultWorkHours(input: DefaultWorkHours): Promise<Result_14>;
    updateEmployee(id: EmployeeId, input: UpdateEmployeeInput): Promise<Result_13>;
    updateEmployment(employeeId: EmployeeId, employmentId: string, input: UpdateEmploymentInput): Promise<Result_12>;
    updateExpense(id: ExpenseId, input: UpdateExpenseInput): Promise<Result_11>;
    updateExpenseType(id: ExpenseTypeId, input: UpdateExpenseTypeInput): Promise<Result_10>;
    updateHoliday(id: HolidayId, input: UpdateHolidayInput): Promise<Result_9>;
    updateInvoice(invoiceId: bigint, input: UpdateInvoiceInput): Promise<Result_8>;
    updateProject(id: ProjectId, input: UpdateProjectInput): Promise<Result_7>;
    updateServiceType(id: ServiceTypeId, input: UpdateServiceTypeInput): Promise<Result_6>;
    updateStripeSubscriptionQuantity(companyId: bigint, newQuantity: bigint): Promise<Result_5>;
    updateTimeBalanceCorrection(employeeId: EmployeeId, correctionId: string, input: UpdateTimeBalanceCorrectionInput): Promise<Result_4>;
    updateTimeEntry(id: TimeEntryId, input: UpdateTimeEntryInput): Promise<Result_3>;
    updateUserNotificationSettings(input: UserNotificationSettings): Promise<Result_2>;
    updateVacationBalance(employeeId: EmployeeId, balanceId: string, input: UpdateVacationBalanceInput): Promise<Result_1>;
    upsertSubscriptionPlan(plan: SubscriptionPlan): Promise<Result>;
}
