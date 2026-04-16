// ─── Enums / Variants ────────────────────────────────────────────────────────

export type Role = { admin: null } | { manager: null } | { employee: null };
export type EmploymentType =
  | { fullTime: null }
  | { partTime: null }
  | { contractor: null }
  | { intern: null };

export type ExpenseStatus =
  | { pending: null }
  | { approved: null }
  | { rejected: null };

export type AbsenceStatus =
  | { pending: null }
  | { approved: null }
  | { rejected: null };

export type VacationStatus =
  | { pending: null }
  | { approved: null }
  | { rejected: null };

// ─── ID Types ─────────────────────────────────────────────────────────────────

export type CompanyId = string;
export type EmployeeId = string;
export type CustomerId = string;
export type ProjectId = string;
export type ServiceTypeId = string;
export type ExpenseTypeId = string;
export type AbsenceTypeId = string;
export type HolidayId = string;
export type TimeEntryId = string;
export type ExpenseId = string;
export type AbsenceId = string;

// ─── Master Data ──────────────────────────────────────────────────────────────

export interface Company {
  id: CompanyId;
  name: string;
  logoUrl?: string;
  email?: string;
  phone?: string;
  address?: string;
  createdAt: bigint;
}

export interface Employee {
  id: EmployeeId;
  companyId: CompanyId;
  principalId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  employmentType: EmploymentType;
  weeklyHours: number;
  vacationDaysPerYear: number;
  startDate: string;
  active: boolean;
}

export type KundeZeiterfassungsart = "stuendlich" | "block";

export interface Rechnungsadresse {
  zusatz1?: string;
  zusatz2?: string;
  strasse?: string;
  postfach?: string;
  plz?: string;
  ort?: string;
  land: string;
}

export interface Customer {
  id: CustomerId;
  companyId: CompanyId;
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  active: boolean;
  // Extended fields
  beschreibung?: string;
  kundennummer?: string;
  rechnungsadresse?: Rechnungsadresse;
  zeiterfassungsart?: KundeZeiterfassungsart;
  waehrung?: string;
  aktiv?: boolean;
}

export interface Project {
  id: ProjectId;
  companyId: CompanyId;
  customerId: CustomerId;
  name: string;
  code: string;
  description?: string;
  billable: boolean;
  active: boolean;
}

export interface ProjectAssignment {
  projectId: ProjectId;
  employeeId: EmployeeId;
  assignedAt: bigint;
}

export interface ServiceType {
  id: ServiceTypeId;
  companyId: CompanyId;
  name: string;
  active: boolean;
}

export interface ExpenseType {
  id: ExpenseTypeId;
  companyId: CompanyId;
  name: string;
  active: boolean;
}

export interface AbsenceType {
  id: AbsenceTypeId;
  companyId: CompanyId;
  name: string;
  requiresApproval: boolean;
  compensated?: boolean; // Entschädigt (Arbeitszeit) — defaults to false if not set
  active: boolean;
}

export interface Holiday {
  id: HolidayId;
  companyId: CompanyId;
  name: string;
  date: string;
  recurring: boolean;
}

// ─── Time Tracking ─────────────────────────────────────────────────────────────

export interface TimeEntry {
  id: TimeEntryId;
  companyId: CompanyId;
  employeeId: EmployeeId;
  projectId: ProjectId;
  serviceTypeId: ServiceTypeId;
  date: string;
  hours: number;
  description?: string;
  billable: boolean;
  createdAt: bigint;
}

export interface Expense {
  id: ExpenseId;
  companyId: CompanyId;
  employeeId: EmployeeId;
  expenseTypeId: ExpenseTypeId;
  date: string;
  billableAmount: number;
  reimbursableAmount: number;
  description?: string;
  receiptUrl?: string;
  status: ExpenseStatus;
  createdAt: bigint;
}

export interface Absence {
  id: AbsenceId;
  companyId: CompanyId;
  employeeId: EmployeeId;
  absenceTypeId: AbsenceTypeId;
  startDate: string;
  endDate: string;
  days: number;
  note?: string;
  status: AbsenceStatus;
  rejectionComment?: string;
  createdAt: bigint;
}

// ─── Calendar & Dashboard ─────────────────────────────────────────────────────

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  endDate?: string;
  type: "timeEntry" | "absence" | "holiday" | "vacation";
  color?: string;
  employeeId?: EmployeeId;
}

export interface CalendarData {
  events: CalendarEvent[];
}

export interface DashboardStats {
  hoursThisWeek: number;
  hoursThisMonth: number;
  pendingVacationRequests: number;
  pendingExpenses: number;
  openProjects: number;
  totalEmployees: number;
  weeklyHoursData: WeeklyHoursEntry[];
  vacationBalance?: VacationBalance;
}

export interface WeeklyHoursEntry {
  day: string;
  actual: number;
  target: number;
}

export interface VacationBalance {
  totalDays: number;
  usedDays: number;
  remainingDays: number;
  pendingDays: number;
}

export interface ReportData {
  period: string;
  totalHours: number;
  billableHours: number;
  totalExpenses: number;
  billableExpenses: number;
  employeeBreakdown: EmployeeReport[];
  projectBreakdown: ProjectReport[];
}

export interface EmployeeReport {
  employeeId: EmployeeId;
  employeeName: string;
  hours: number;
  billableHours: number;
}

export interface ProjectReport {
  projectId: ProjectId;
  projectName: string;
  hours: number;
  billableHours: number;
  expenses: number;
}

// ─── Standard Weekly Hours ────────────────────────────────────────────────────

/** Weekly standard working hours per day, values in minutes */
export interface StandardWeeklyHours {
  monday: number;
  tuesday: number;
  wednesday: number;
  thursday: number;
  friday: number;
  saturday: number;
  sunday: number;
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export interface CompanySettings {
  companyId: CompanyId;
  workingDaysPerWeek: number;
  defaultWorkHoursPerDay: number;
  vacationApprovalRequired: boolean;
  emailNotifications: boolean;
}

export interface UserNotificationSettings {
  employeeId: EmployeeId;
  emailOnVacationRequest: boolean;
  emailOnVacationApproval: boolean;
  emailOnVacationRejection: boolean;
  emailWeeklySummary: boolean;
  pushNotifications: boolean;
}

// ─── Registration ─────────────────────────────────────────────────────────────

export interface RegistrationData {
  companyName: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface InviteCodeData {
  code: string;
  employeeId: EmployeeId;
  companyId: CompanyId;
  expiresAt: bigint;
}

// ─── UI Helpers ───────────────────────────────────────────────────────────────

export function getRoleLabel(role: Role): string {
  if ("admin" in role) return "Administrator";
  if ("manager" in role) return "Manager";
  return "Mitarbeiter";
}

export function getExpenseStatusLabel(status: ExpenseStatus): string {
  if ("pending" in status) return "Ausstehend";
  if ("approved" in status) return "Genehmigt";
  return "Abgelehnt";
}

export function getAbsenceStatusLabel(status: AbsenceStatus): string {
  if ("pending" in status) return "Ausstehend";
  if ("approved" in status) return "Genehmigt";
  return "Abgelehnt";
}
