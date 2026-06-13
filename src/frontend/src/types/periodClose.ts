import type { PeriodClose } from "../backend";
import { PeriodCloseStatus } from "../backend";

export type { PeriodClose };
export { PeriodCloseStatus };

export interface ClosePeriodInput {
  companyId: bigint | string;
  employeeId?: bigint;
  month: number;
  year: number;
  closeComment?: string;
}

export interface ReopenPeriodInput {
  closeId: string;
  reopenReason?: string;
}

export interface PeriodStatusQuery {
  companyId: bigint | string;
  employeeId?: bigint;
  month: number;
  year: number;
}
