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
export type ExpenseId = bigint;
export type Result_2 = {
    __kind__: "ok";
    ok: TimeEntry;
} | {
    __kind__: "err";
    err: string;
};
export type TimeEntryId = bigint;
export interface CreateProjectInput {
    status?: ProjectStatus;
    erfassungsart?: Erfassungsart;
    code: string;
    billableRate: number;
    name: string;
    customerId: CustomerId;
    kurzbezeichnung: string;
    projektleiter?: EmployeeId;
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
export interface ProjectMemberAssignment {
    stundensatz: number;
    employeeId: EmployeeId;
    serviceTypeId: ServiceTypeId;
}
export interface Company {
    id: CompanyId;
    taxId?: string;
    name: string;
    createdAt: Timestamp;
    logoUrl?: string;
    address?: string;
}
export interface UpdateCompanyInput {
    taxId?: string;
    name?: string;
    logoUrl?: string;
    address?: string;
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
export type CompanyId = bigint;
export type Result_5 = {
    __kind__: "ok";
    ok: Project;
} | {
    __kind__: "err";
    err: string;
};
export interface CalendarData {
    absences: Array<Absence>;
    expenses: Array<Expense>;
    timeEntries: Array<TimeEntry>;
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
export interface StandardTimeBlock {
    bis: string;
    von: string;
}
export interface ProjectAssignment {
    employeeId: EmployeeId;
    projectId: ProjectId;
    companyId: CompanyId;
}
export type Result_4 = {
    __kind__: "ok";
    ok: ServiceType;
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
export interface CreateAbsenceInput {
    absenceTypeId: AbsenceTypeId;
    dateTo: string;
    ganztaetig: boolean;
    description?: string;
    dateFrom: string;
    dauer: bigint;
}
export interface CreateExpenseInput {
    date: string;
    description: string;
    billableCHF: number;
    reimbursementCHF: number;
    expenseTypeId: ExpenseTypeId;
    receiptBlobId?: string;
}
export type EmployeeId = bigint;
export type Result_7 = {
    __kind__: "ok";
    ok: ExpenseType;
} | {
    __kind__: "err";
    err: string;
};
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
    date: string;
    createdAt: Timestamp;
    description: string;
    employeeId: EmployeeId;
    billable: boolean;
    projectId: ProjectId;
    serviceTypeId: ServiceTypeId;
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
export interface ServiceType {
    id: ServiceTypeId;
    defaultRate: number;
    aktiv: boolean;
    name: string;
    billable: boolean;
    companyId: CompanyId;
}
export type Result_6 = {
    __kind__: "ok";
    ok: Holiday;
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
export type Result_26 = {
    __kind__: "ok";
    ok: ProjectAssignment;
} | {
    __kind__: "err";
    err: string;
};
export type Result_9 = {
    __kind__: "ok";
    ok: Employment;
} | {
    __kind__: "err";
    err: string;
};
export type Result_12 = {
    __kind__: "ok";
    ok: CompanySettings;
} | {
    __kind__: "err";
    err: string;
};
export interface ExpenseFilter {
    status?: ExpenseStatus;
    dateTo?: string;
    employeeId?: EmployeeId;
    dateFrom?: string;
}
export interface Expense {
    id: ExpenseId;
    status: ExpenseStatus;
    date: string;
    description: string;
    employeeId: EmployeeId;
    resetReason?: string;
    billableCHF: number;
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
    ok: VacationBalance;
} | {
    __kind__: "err";
    err: string;
};
export type Result_10 = {
    __kind__: "ok";
    ok: Employee;
} | {
    __kind__: "err";
    err: string;
};
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
export type Result_8 = {
    __kind__: "ok";
    ok: Expense;
} | {
    __kind__: "err";
    err: string;
};
export type ServiceTypeId = bigint;
export interface CreateVacationBalanceInput {
    verfallsdatum?: bigint;
    kalenderjahr: bigint;
    dauer: bigint;
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
export interface AbsenceType {
    id: AbsenceTypeId;
    aktiv: boolean;
    name: string;
    requiresApproval: boolean;
    compensated: boolean;
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
    projektleiter?: EmployeeId;
    companyId: CompanyId;
}
export type AbsenceId = bigint;
export interface UpdateExpenseTypeInput {
    aktiv?: boolean;
    name?: string;
    billable?: boolean;
    reimbursable?: boolean;
}
export interface UserNotificationSettings {
    emailNewVacationRequest: boolean;
    emailOnApproval: boolean;
    principalId: Principal;
    companyId: CompanyId;
}
export interface UpdateExpenseInput {
    date?: string;
    description?: string;
    billableCHF?: number;
    reimbursementCHF?: number;
    expenseTypeId?: ExpenseTypeId;
    receiptBlobId?: string;
}
export type Timestamp = bigint;
export type Time = bigint;
export type Result_17 = {
    __kind__: "ok";
    ok: Array<VacationBalance>;
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
export type Result_25 = {
    __kind__: "ok";
    ok: string;
} | {
    __kind__: "err";
    err: string;
};
export type Result_13 = {
    __kind__: "ok";
    ok: Company;
} | {
    __kind__: "err";
    err: string;
};
export interface CreateAbsenceTypeInput {
    aktiv?: boolean;
    name: string;
    requiresApproval: boolean;
    compensated: boolean;
}
export type AbsenceTypeId = bigint;
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
    ok: null;
} | {
    __kind__: "err";
    err: string;
};
export type Result_1 = {
    __kind__: "ok";
    ok: UserNotificationSettings;
} | {
    __kind__: "err";
    err: string;
};
export interface Rechnungsadresse {
    ort?: string;
    plz?: string;
    zusatz1?: string;
    zusatz2?: string;
    postfach?: string;
    land: string;
    strasse?: string;
}
export type Result_22 = {
    __kind__: "ok";
    ok: Array<ProjectMemberAssignment>;
} | {
    __kind__: "err";
    err: string;
};
export type Result_11 = {
    __kind__: "ok";
    ok: Customer;
} | {
    __kind__: "err";
    err: string;
};
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
export interface CreateExpenseTypeInput {
    aktiv?: boolean;
    name: string;
    billable: boolean;
    reimbursable: boolean;
}
export type Result_19 = {
    __kind__: "ok";
    ok: Array<Employment>;
} | {
    __kind__: "err";
    err: string;
};
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
export type Result_24 = {
    __kind__: "ok";
    ok: WorkTimeBalance;
} | {
    __kind__: "err";
    err: string;
};
export type Result_14 = {
    __kind__: "ok";
    ok: AbsenceType;
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
    land?: string;
    role: Role;
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
export type HolidayId = bigint;
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
export interface UpdateHolidayInput {
    ganztaegig?: boolean;
    date?: string;
    name?: string;
}
export type Result_21 = {
    __kind__: "ok";
    ok: Standardarbeitszeiten;
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
    serviceTypeId: ServiceTypeId;
}
export interface CreateHolidayInput {
    ganztaegig?: boolean;
    date: string;
    name: string;
}
export type Result_18 = {
    __kind__: "ok";
    ok: Array<TimeBalanceCorrection>;
} | {
    __kind__: "err";
    err: string;
};
export interface UpdateProjectInput {
    status?: ProjectStatus;
    erfassungsart?: Erfassungsart;
    active?: boolean;
    code?: string;
    billableRate?: number;
    name?: string;
    customerId?: CustomerId;
    kurzbezeichnung?: string;
    projektleiter?: EmployeeId;
}
export type Result_3 = {
    __kind__: "ok";
    ok: TimeBalanceCorrection;
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
export interface ReportData {
    expenses: number;
    entries: Array<TimeEntry>;
    billableHours: number;
    expenseItems: Array<Expense>;
}
export type Result_23 = {
    __kind__: "ok";
    ok: Employment | null;
} | {
    __kind__: "err";
    err: string;
};
export type Result_15 = {
    __kind__: "ok";
    ok: Absence;
} | {
    __kind__: "err";
    err: string;
};
export type ProjectId = bigint;
export interface UpdateVacationBalanceInput {
    verfallsdatum?: bigint;
    kalenderjahr?: bigint;
    dauer?: bigint;
}
export interface Holiday {
    id: HolidayId;
    ganztaegig: boolean;
    date: string;
    name: string;
    companyId: CompanyId;
}
export type Result_20 = {
    __kind__: "ok";
    ok: bigint;
} | {
    __kind__: "err";
    err: string;
};
export interface UpdateAbsenceTypeInput {
    aktiv?: boolean;
    name?: string;
    requiresApproval?: boolean;
    compensated?: boolean;
}
export enum AbsenceStatus {
    submitted = "submitted",
    approved = "approved",
    rejected = "rejected"
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
    exaktWochentag = "exaktWochentag",
    entschaedigt = "entschaedigt",
    exakt = "exakt",
    prozentual = "prozentual"
}
export enum KundeZeiterfassungsart {
    stuendlich = "stuendlich",
    block = "block"
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
    approveAbsence(id: AbsenceId): Promise<Result_15>;
    approveExpense(id: ExpenseId): Promise<Result_8>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    assignEmployeeToProject(employeeId: EmployeeId, projectId: ProjectId): Promise<Result_26>;
    createAbsence(input: CreateAbsenceInput): Promise<Result_15>;
    createAbsenceType(input: CreateAbsenceTypeInput): Promise<Result_14>;
    createCustomer(input: CreateCustomerInput): Promise<Result_11>;
    createEmployee(input: CreateEmployeeInput): Promise<Result_10>;
    createEmployment(employeeId: EmployeeId, input: CreateEmploymentInput): Promise<Result_9>;
    createExpense(input: CreateExpenseInput): Promise<Result_8>;
    createExpenseType(input: CreateExpenseTypeInput): Promise<Result_7>;
    createHoliday(input: CreateHolidayInput): Promise<Result_6>;
    createProject(input: CreateProjectInput): Promise<Result_5>;
    createServiceType(input: CreateServiceTypeInput): Promise<Result_4>;
    createTimeBalanceCorrection(employeeId: EmployeeId, input: CreateTimeBalanceCorrectionInput): Promise<Result_3>;
    createTimeEntry(input: CreateTimeEntryInput): Promise<Result_2>;
    createVacationBalance(employeeId: EmployeeId, input: CreateVacationBalanceInput): Promise<Result>;
    deleteAbsence(id: AbsenceId): Promise<Result_16>;
    deleteAbsenceType(id: AbsenceTypeId): Promise<Result_16>;
    deleteCustomer(id: CustomerId): Promise<Result_16>;
    deleteEmployee(id: EmployeeId): Promise<Result_16>;
    deleteEmployment(employeeId: EmployeeId, employmentId: string): Promise<Result_16>;
    deleteExpense(id: ExpenseId): Promise<Result_16>;
    deleteExpenseType(id: ExpenseTypeId): Promise<Result_16>;
    deleteHoliday(id: HolidayId): Promise<Result_16>;
    deleteProject(id: ProjectId): Promise<Result_16>;
    deleteServiceType(id: ServiceTypeId): Promise<Result_16>;
    deleteTimeBalanceCorrection(employeeId: EmployeeId, correctionId: string): Promise<Result_16>;
    deleteTimeEntry(id: TimeEntryId): Promise<Result_16>;
    deleteVacationBalance(employeeId: EmployeeId, balanceId: string): Promise<Result_16>;
    generateInviteCode(employeeId: EmployeeId): Promise<Result_25>;
    getCalendarEntries(month: string, year: bigint): Promise<CalendarData>;
    getCallerUserRole(): Promise<UserRole>;
    getCompanySettings(): Promise<Result_12>;
    getDashboardStats(): Promise<DashboardStats>;
    getEmployeeWorkTimeBalance(employeeId: EmployeeId, startDate: string, endDate: string): Promise<Result_24>;
    getEmployeeWorkTimeBalanceFromStart(employeeId: EmployeeId): Promise<Result_24>;
    getEmploymentForDate(employeeId: EmployeeId, date: string): Promise<Result_23>;
    getMyCompany(): Promise<Result_13>;
    getMyEmployee(): Promise<Result_10>;
    getMyStandardarbeitszeiten(): Promise<Result_21>;
    getProjectMembers(projectId: ProjectId): Promise<Result_22>;
    getReportData(filter: ReportFilter): Promise<ReportData>;
    getStandardarbeitszeitenForEmployee(employeeId: EmployeeId): Promise<Result_21>;
    getTimeBalance(employeeId: EmployeeId): Promise<Result_20>;
    getUserNotificationSettings(): Promise<Result_1>;
    isCallerAdmin(): Promise<boolean>;
    isRegistered(): Promise<boolean>;
    listAbsenceTypes(): Promise<Array<AbsenceType>>;
    listAbsences(filter: AbsenceFilter): Promise<Array<Absence>>;
    listAuditLog(targetType: string | null, targetId: bigint | null): Promise<Array<AuditEntry>>;
    listCustomers(): Promise<Array<Customer>>;
    listEmployees(): Promise<Array<Employee>>;
    listEmployments(employeeId: EmployeeId): Promise<Result_19>;
    listExpenseTypes(): Promise<Array<ExpenseType>>;
    listExpenses(filter: ExpenseFilter): Promise<Array<Expense>>;
    listHolidays(): Promise<Array<Holiday>>;
    listProjectAssignments(): Promise<Array<ProjectAssignment>>;
    listProjects(): Promise<Array<Project>>;
    listServiceTypes(): Promise<Array<ServiceType>>;
    listTimeBalanceCorrections(employeeId: EmployeeId): Promise<Result_18>;
    listTimeEntries(filter: TimeEntryFilter): Promise<Array<TimeEntry>>;
    listVacationBalances(employeeId: EmployeeId): Promise<Result_17>;
    redeemInviteCode(code: string): Promise<Result_10>;
    registerCompany(name: string, firstName: string, lastName: string, email: string): Promise<Result_13>;
    rejectAbsence(id: AbsenceId, comment: string): Promise<Result_15>;
    rejectExpense(id: ExpenseId, comment: string | null): Promise<Result_8>;
    removeEmployeeFromProject(employeeId: EmployeeId, projectId: ProjectId): Promise<Result_16>;
    resetAbsenceToAusstehend(id: AbsenceId, reason: string): Promise<Result_15>;
    resetExpenseToAusstehend(id: ExpenseId, reason: string): Promise<Result_8>;
    revokeInviteCode(code: string): Promise<Result_16>;
    setMyStandardarbeitszeiten(data: Standardarbeitszeiten): Promise<Result_16>;
    setProjectMembers(projectId: ProjectId, members: Array<ProjectMemberAssignment>): Promise<Result_16>;
    setStandardarbeitszeitenForEmployee(employeeId: EmployeeId, data: Standardarbeitszeiten): Promise<Result_16>;
    updateAbsence(id: AbsenceId, input: UpdateAbsenceInput): Promise<Result_15>;
    updateAbsenceType(id: AbsenceTypeId, input: UpdateAbsenceTypeInput): Promise<Result_14>;
    updateCompany(input: UpdateCompanyInput): Promise<Result_13>;
    updateCompanySettings(input: CompanySettings): Promise<Result_12>;
    updateCustomer(id: CustomerId, input: UpdateCustomerInput): Promise<Result_11>;
    updateEmployee(id: EmployeeId, input: UpdateEmployeeInput): Promise<Result_10>;
    updateEmployment(employeeId: EmployeeId, employmentId: string, input: UpdateEmploymentInput): Promise<Result_9>;
    updateExpense(id: ExpenseId, input: UpdateExpenseInput): Promise<Result_8>;
    updateExpenseType(id: ExpenseTypeId, input: UpdateExpenseTypeInput): Promise<Result_7>;
    updateHoliday(id: HolidayId, input: UpdateHolidayInput): Promise<Result_6>;
    updateProject(id: ProjectId, input: UpdateProjectInput): Promise<Result_5>;
    updateServiceType(id: ServiceTypeId, input: UpdateServiceTypeInput): Promise<Result_4>;
    updateTimeBalanceCorrection(employeeId: EmployeeId, correctionId: string, input: UpdateTimeBalanceCorrectionInput): Promise<Result_3>;
    updateTimeEntry(id: TimeEntryId, input: UpdateTimeEntryInput): Promise<Result_2>;
    updateUserNotificationSettings(input: UserNotificationSettings): Promise<Result_1>;
    updateVacationBalance(employeeId: EmployeeId, balanceId: string, input: UpdateVacationBalanceInput): Promise<Result>;
}
