/**
 * planUtils.ts — shared plan-change detection logic
 *
 * Used by MitarbeiterTab and MitarbeiterDetail to determine whether
 * adding or removing an employee triggers a plan change.
 */

import type { SubscriptionPlan } from "../backend.d";

export interface PlanChangeInfo {
  currentPlanName: string;
  suggestedPlanName: string;
  suggestedPlanId?: string;
  /** Expected active user count AFTER the pending action */
  activeUserCount: bigint;
  isUpgrade: boolean;
}

/**
 * Returns true if a plan's maxEmployees value means "unlimited".
 * Unlimited = undefined, 0n, 999n, or the numeric/string equivalents.
 * Defensive: handles BigInt, Number and string variants.
 */
export function isUnlimited(
  maxEmployees: bigint | number | string | undefined | null,
): boolean {
  if (maxEmployees === undefined || maxEmployees === null) return true;
  // Compare as number to handle BigInt 0n/999n and Number 0/999 and string "0"/"999"
  const n = Number(maxEmployees);
  return n === 0 || n === 999;
}

/**
 * Return the effective numeric upper bound for a plan.
 * Unlimited plans return Number.MAX_SAFE_INTEGER so they sort last.
 */
export function effectiveMax(
  maxEmployees: bigint | number | string | undefined | null,
): number {
  if (isUnlimited(maxEmployees)) return Number.MAX_SAFE_INTEGER;
  return Number(maxEmployees);
}

/**
 * Compute which plan best fits the given employee count.
 * Plans are sorted by maxEmployees ascending; the first plan where
 * effectiveMax >= count is chosen. If none fits, the last plan is returned.
 */
export function findBestFitPlan(
  plans: SubscriptionPlan[],
  employeeCount: number,
): SubscriptionPlan | null {
  const active = plans
    .filter((p) => p.isActive)
    .sort(
      (a, b) => effectiveMax(a.maxEmployees) - effectiveMax(b.maxEmployees),
    );
  if (active.length === 0) return null;
  return (
    active.find((p) => effectiveMax(p.maxEmployees) >= employeeCount) ??
    active[active.length - 1]
  );
}

/**
 * Pure, testable function that determines whether adding/removing one employee
 * requires a plan upgrade or downgrade.
 *
 * @param currentActiveCount  Active employees RIGHT NOW (before the action)
 * @param newEmployeeAdded    true = adding 1 employee, false = no change
 * @param currentPlan         The plan currently assigned to the company
 * @param allPlans            All available subscription plans
 * @returns { required: true, suggestedPlan } when a change is needed,
 *          { required: false, suggestedPlan: null } otherwise.
 */
export function requiresPlanUpgrade(
  currentActiveCount: number,
  newEmployeeAdded: boolean,
  currentPlan:
    | Pick<SubscriptionPlan, "id" | "name" | "maxEmployees" | "isActive">
    | null
    | undefined,
  allPlans: SubscriptionPlan[],
): { required: boolean; suggestedPlan: SubscriptionPlan | null } {
  // No plan data → cannot determine requirement, treat as not required
  if (!currentPlan || allPlans.length === 0) {
    return { required: false, suggestedPlan: null };
  }

  // Unlimited plan → never requires upgrade
  if (isUnlimited(currentPlan.maxEmployees)) {
    return { required: false, suggestedPlan: null };
  }

  const expectedCount = currentActiveCount + (newEmployeeAdded ? 1 : 0);
  const currentMax = effectiveMax(currentPlan.maxEmployees);

  // Still within the current plan's limit
  if (expectedCount <= currentMax) {
    return { required: false, suggestedPlan: null };
  }

  // Need a higher plan — find the best fit for the expected count
  const suggestedPlan = findBestFitPlan(allPlans, expectedCount);

  // No higher plan available → not required (employee can still be saved)
  if (!suggestedPlan || suggestedPlan.id === currentPlan.id) {
    return { required: false, suggestedPlan: null };
  }

  return { required: true, suggestedPlan };
}

/**
 * Pure testable helper: after removing an employee, should a downgrade dialog be shown?
 *
 * This check is independent of whether the CURRENT plan has max=999 —
 * even if the current plan is "unlimited", a cheaper limited plan may fit.
 *
 * @param newActiveCount  Active employee count AFTER the removal
 * @param allPlans        All available subscription plans
 * @param currentPlan     The plan currently assigned to the company
 * @returns The cheaper plan to suggest, or null if no downgrade is worthwhile
 */
export function checkDowngradeNeeded(
  newActiveCount: number,
  allPlans: SubscriptionPlan[],
  currentPlan:
    | Pick<
        SubscriptionPlan,
        "id" | "name" | "maxEmployees" | "isActive" | "pricePerMonthCHF"
      >
    | null
    | undefined,
): SubscriptionPlan | null {
  if (!currentPlan || allPlans.length === 0) return null;

  // Find the cheapest plan whose maxEmployees >= newActiveCount
  const activePlans = allPlans
    .filter((p) => p.isActive)
    .sort(
      (a, b) => effectiveMax(a.maxEmployees) - effectiveMax(b.maxEmployees),
    );

  const bestFit = activePlans.find(
    (p) => effectiveMax(p.maxEmployees) >= newActiveCount,
  );

  // No fit found, or the best fit IS the current plan → no downgrade
  if (!bestFit || bestFit.id === currentPlan.id) return null;

  // Only suggest downgrade if the best-fit plan is cheaper than the current plan
  const currentPrice = currentPlan.pricePerMonthCHF ?? 0;
  const suggestedPrice = bestFit.pricePerMonthCHF ?? 0;
  if (suggestedPrice >= currentPrice) return null;

  return bestFit;
}

/**
 * Pure testable helper: should an upgrade dialog be shown?
 * @param activeCount  current active employee count (BEFORE the action)
 * @param currentPlanMax  the current plan's maxEmployees value
 * @returns true when adding one employee would exceed the plan's limit
 */
export function checkUpgradeNeeded(
  activeCount: number,
  currentPlanMax: bigint | number | string | undefined | null,
): boolean {
  if (isUnlimited(currentPlanMax)) return false;
  return activeCount + 1 > effectiveMax(currentPlanMax);
}

export function checkPlanChange(
  plans: SubscriptionPlan[],
  currentActiveCount: number,
  expectedActiveCount: number,
  currentPlanId: string,
): PlanChangeInfo | null {
  if (plans.length === 0) return null;

  // Determine the currently-assigned plan (prefer explicit ID).
  const assignedPlan = currentPlanId
    ? plans.find((p) => p.id === currentPlanId)
    : undefined;
  const currentFitPlan =
    assignedPlan ?? findBestFitPlan(plans, currentActiveCount);

  const isUpgradeScenario = expectedActiveCount > currentActiveCount;

  // For upgrades: if the current plan is unlimited, never require upgrade
  if (
    isUpgradeScenario &&
    currentFitPlan &&
    isUnlimited(currentFitPlan.maxEmployees)
  ) {
    return null;
  }

  const neededPlan = findBestFitPlan(plans, expectedActiveCount);
  if (!neededPlan) return null;

  // No change needed if both resolve to the same plan
  if (!currentFitPlan || currentFitPlan.id === neededPlan.id) return null;

  return {
    currentPlanName: currentFitPlan.name,
    suggestedPlanName: neededPlan.name,
    suggestedPlanId: neededPlan.id,
    activeUserCount: BigInt(expectedActiveCount),
    isUpgrade: isUpgradeScenario,
  };
}
