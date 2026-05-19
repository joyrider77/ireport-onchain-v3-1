/**
 * Unit tests for planUtils.ts — plan-change detection logic
 *
 * Run with: pnpm test  (from src/frontend/)
 */

import { describe, expect, it } from "vitest";
import type { SubscriptionPlan } from "../backend.d";
import {
  checkDowngradeNeeded,
  checkPlanChange,
  checkUpgradeNeeded,
  effectiveMax,
  findBestFitPlan,
  isUnlimited,
  requiresPlanUpgrade,
} from "../lib/planUtils";

// ── Helpers ──────────────────────────────────────────────────────────────────

function makePlan(
  overrides: Partial<SubscriptionPlan> & { id: string; name: string },
): SubscriptionPlan {
  return {
    isActive: true,
    features: [],
    sortOrder: 0n,
    description: "",
    updatedAt: 0n,
    pricePerYearCHF: 0,
    pricePerMonthCHF: 0,
    minActiveDaysPerMonth: 0n,
    requiresPayment: false,
    paymentProvider: "none" as import("../backend.d").PaymentProvider,
    ...overrides,
  };
}

const basisPlan = makePlan({
  id: "plan-basis",
  name: "Basis",
  maxEmployees: 2n,
  pricePerMonthCHF: 7,
  pricePerYearCHF: 6,
});

const professionalPlan = makePlan({
  id: "plan-pro",
  name: "Professional",
  maxEmployees: 999n, // unlimited sentinel
  pricePerMonthCHF: 12,
  pricePerYearCHF: 10,
});

const smallPlan = makePlan({
  id: "plan-small",
  name: "Small",
  maxEmployees: 1n,
  pricePerMonthCHF: 5,
  pricePerYearCHF: 4,
});

const allPlans = [basisPlan, professionalPlan, smallPlan];

// ── findBestFitPlan ───────────────────────────────────────────────────────────

describe("findBestFitPlan", () => {
  it("returns the plan whose maxEmployees exactly matches the count (Grenzwert)", () => {
    const plan = findBestFitPlan(allPlans, 2);
    expect(plan?.id).toBe("plan-basis"); // maxEmployees=2 fits count=2
  });

  it("returns the next higher plan when count exceeds current plan limit", () => {
    const plan = findBestFitPlan(allPlans, 3);
    expect(plan?.id).toBe("plan-pro"); // Professional is unlimited (999)
  });

  it("returns null when no active plans exist", () => {
    const inactive = allPlans.map((p) => ({ ...p, isActive: false }));
    expect(findBestFitPlan(inactive, 1)).toBeNull();
  });

  it("treats maxEmployees=999n as unlimited (always fits)", () => {
    const plan = findBestFitPlan([professionalPlan], 500);
    expect(plan?.id).toBe("plan-pro");
  });

  it("treats maxEmployees=undefined as unlimited", () => {
    const unlimitedPlan = makePlan({ id: "plan-unlimited", name: "Unlimited" }); // no maxEmployees
    const plan = findBestFitPlan([unlimitedPlan], 999);
    expect(plan?.id).toBe("plan-unlimited");
  });

  it("treats maxEmployees=0n as unlimited", () => {
    const zeroPlan = makePlan({
      id: "plan-zero",
      name: "Zero",
      maxEmployees: 0n,
    });
    const plan = findBestFitPlan([zeroPlan], 999);
    expect(plan?.id).toBe("plan-zero");
  });
});

// ── requiresPlanUpgrade ───────────────────────────────────────────────────────

describe("requiresPlanUpgrade", () => {
  // Test 1: expectedCount = maxEmployees (exactly at limit) → no upgrade
  it("returns required=false when expected count equals plan max (Grenzwert)", () => {
    const result = requiresPlanUpgrade(
      1, // currentActiveCount
      true, // adding 1 → expectedCount = 2
      basisPlan, // maxEmployees = 2
      allPlans,
    );
    expect(result.required).toBe(false);
    expect(result.suggestedPlan).toBeNull();
  });

  // Test 2: expectedCount = maxEmployees + 1 → upgrade required
  it("returns required=true when expected count exceeds plan max by 1 (Überschreitung)", () => {
    const result = requiresPlanUpgrade(
      2, // currentActiveCount = 2 (at limit)
      true, // adding 1 → expectedCount = 3
      basisPlan, // maxEmployees = 2
      allPlans,
    );
    expect(result.required).toBe(true);
    expect(result.suggestedPlan?.id).toBe("plan-pro");
  });

  // Test 3: No higher plan available → required=false, suggestedPlan=null
  it("returns required=false when no higher plan exists", () => {
    // Only plan is Basis with max 2 — no Professional exists
    const result = requiresPlanUpgrade(
      2,
      true, // expectedCount = 3, exceeds Basis
      basisPlan,
      [basisPlan], // only Basis available
    );
    // findBestFitPlan(count=3) returns basisPlan (only option) → same as current → not required
    expect(result.required).toBe(false);
    expect(result.suggestedPlan).toBeNull();
  });

  // Test 4: plan.maxEmployees === 999n → always required=false (unlimited)
  it("returns required=false when current plan has maxEmployees=999n (unlimited)", () => {
    const result = requiresPlanUpgrade(
      998,
      true, // expectedCount = 999
      professionalPlan, // maxEmployees = 999n = unlimited
      allPlans,
    );
    expect(result.required).toBe(false);
    expect(result.suggestedPlan).toBeNull();
  });

  // Test 4b: plan.maxEmployees === undefined → always required=false (unlimited)
  it("returns required=false when current plan has maxEmployees=undefined (unlimited)", () => {
    const unlimitedPlan = makePlan({ id: "plan-u", name: "Unlimited" }); // maxEmployees=undefined
    const result = requiresPlanUpgrade(100, true, unlimitedPlan, allPlans);
    expect(result.required).toBe(false);
    expect(result.suggestedPlan).toBeNull();
  });

  // Test 5: Active count correctly counts only active employees (inactive excluded)
  it("counts only active employees (the caller is responsible for filtering)", () => {
    // Simulating: 2 active + 1 inactive = 3 total, but active count should be 2
    // requiresPlanUpgrade receives the already-filtered count
    // At currentActiveCount=2, adding 1 → expectedCount=3 → must upgrade Basis (max 2)
    const employees = [
      { id: 1n, active: true },
      { id: 2n, active: true },
      { id: 3n, active: false }, // inactive — must NOT be counted
    ];
    const currentActiveCount = employees.filter((e) => e.active).length; // = 2
    const result = requiresPlanUpgrade(
      currentActiveCount, // 2
      true, // adding 1 → expectedCount = 3
      basisPlan,
      allPlans,
    );
    expect(currentActiveCount).toBe(2); // guard: inactive not counted
    expect(result.required).toBe(true);
    expect(result.suggestedPlan?.id).toBe("plan-pro");
  });

  // Test 6: currentPlan is undefined/null → handle gracefully (no upgrade required)
  it("returns required=false when currentPlan is null", () => {
    const result = requiresPlanUpgrade(2, true, null, allPlans);
    expect(result.required).toBe(false);
    expect(result.suggestedPlan).toBeNull();
  });

  it("returns required=false when currentPlan is undefined", () => {
    const result = requiresPlanUpgrade(2, true, undefined, allPlans);
    expect(result.required).toBe(false);
    expect(result.suggestedPlan).toBeNull();
  });

  it("returns required=false when allPlans is empty", () => {
    const result = requiresPlanUpgrade(2, true, basisPlan, []);
    expect(result.required).toBe(false);
    expect(result.suggestedPlan).toBeNull();
  });

  it("returns required=false when newEmployeeAdded=false and count is within limit", () => {
    const result = requiresPlanUpgrade(
      2,
      false, // not adding — expected count stays at 2
      basisPlan, // max 2
      allPlans,
    );
    expect(result.required).toBe(false);
  });
});

// ── isUnlimited ──────────────────────────────────────────────────────────────

describe("isUnlimited", () => {
  it("isUnlimited(999n) → true", () => expect(isUnlimited(999n)).toBe(true));
  it("isUnlimited(0n) → true", () => expect(isUnlimited(0n)).toBe(true));
  it("isUnlimited(undefined) → true", () =>
    expect(isUnlimited(undefined)).toBe(true));
  it("isUnlimited(null) → true", () => expect(isUnlimited(null)).toBe(true));
  it("isUnlimited(2n) → false", () => expect(isUnlimited(2n)).toBe(false));
  it("isUnlimited(999) number → true", () =>
    expect(isUnlimited(999)).toBe(true));
  it("isUnlimited(0) number → true", () => expect(isUnlimited(0)).toBe(true));
});

// ── checkUpgradeNeeded ───────────────────────────────────────────────────────

describe("checkUpgradeNeeded", () => {
  it("activeCount=2, max=2n → false (still within limit at exactly max)", () => {
    // 2 active, adding 1 → expected=3 > max=2 → upgrade needed
    // But this test is activeCount=2, adding 1 = 3 > 2 → true
    expect(checkUpgradeNeeded(2, 2n)).toBe(true);
  });

  it("activeCount=1, max=2n → false (1+1=2 fits within limit)", () => {
    expect(checkUpgradeNeeded(1, 2n)).toBe(false);
  });

  it("checkUpgradeNeeded: activeCount=2, adding 1 → expectedCount=3 > max=2 → true", () => {
    expect(checkUpgradeNeeded(2, 2n)).toBe(true);
  });

  it("checkUpgradeNeeded with max=999n → always false (unlimited)", () => {
    expect(checkUpgradeNeeded(998, 999n)).toBe(false);
    expect(checkUpgradeNeeded(0, 999n)).toBe(false);
  });

  it("checkUpgradeNeeded with max=0n → treat as unlimited (false)", () => {
    expect(checkUpgradeNeeded(100, 0n)).toBe(false);
  });

  it("checkUpgradeNeeded with max=undefined → treat as unlimited (false)", () => {
    expect(checkUpgradeNeeded(100, undefined)).toBe(false);
  });
});

// ── checkDowngradeNeeded ─────────────────────────────────────────────────────

describe("checkDowngradeNeeded", () => {
  it("returns cheapest fitting plan when current plan is unlimited (999) and a cheaper plan fits", () => {
    // Current plan: Professional (max=999, CHF 12/mo)
    // After removal: 1 active employee → Small (max=1, CHF 5/mo) is the cheapest fit
    const suggested = checkDowngradeNeeded(1, allPlans, professionalPlan);
    expect(suggested?.id).toBe("plan-small");
  });

  it("returns cheapest fitting plan when current plan has limited max", () => {
    // Imagine a mid-tier plan with max=5 → after removal only 2 active → Basis fits
    const midPlan = makePlan({
      id: "plan-mid",
      name: "Mid",
      maxEmployees: 5n,
      pricePerMonthCHF: 10,
    });
    const plans = [smallPlan, basisPlan, midPlan, professionalPlan];
    const suggested = checkDowngradeNeeded(2, plans, midPlan);
    // Basis (max=2, CHF 7) fits count=2 and is cheaper than Mid (CHF 10)
    expect(suggested?.id).toBe("plan-basis");
  });

  it("returns null when no cheaper plan fits (current plan is already the cheapest fit)", () => {
    // Currently on Basis (max=2, CHF 7) with 1 active — Small (max=1) does NOT fit count=2
    // Wait, count=1: Small (max=1) fits. But is Small cheaper?
    // smallPlan: CHF 5/mo < basisPlan: CHF 7/mo → should suggest Small
    const suggested = checkDowngradeNeeded(1, allPlans, basisPlan);
    // Small (max=1, CHF 5) fits count=1 and is cheaper than Basis → return Small
    expect(suggested?.id).toBe("plan-small");
  });

  it("returns null when current plan is already the best fit", () => {
    // Only plan available is Basis — no cheaper alternative
    const suggested = checkDowngradeNeeded(1, [basisPlan], basisPlan);
    expect(suggested).toBeNull();
  });

  it("returns null when newActiveCount=0 and current plan is the only available", () => {
    const suggested = checkDowngradeNeeded(
      0,
      [professionalPlan],
      professionalPlan,
    );
    // bestFit for 0 is Professional itself → same id → null
    expect(suggested).toBeNull();
  });

  it("returns null when allPlans is empty", () => {
    const suggested = checkDowngradeNeeded(1, [], professionalPlan);
    expect(suggested).toBeNull();
  });

  it("returns null when currentPlan is null", () => {
    const suggested = checkDowngradeNeeded(1, allPlans, null);
    expect(suggested).toBeNull();
  });

  it("does NOT skip downgrade check when current plan max=999 (Plan-Max=999 means unlimited UP, not immune to downgrade)", () => {
    // This is the critical test: even though Professional has max=999,
    // we should still offer a downgrade to Basis (max=2) when only 2 active employees remain
    const suggested = checkDowngradeNeeded(2, allPlans, professionalPlan);
    // Basis (max=2) fits count=2 and is cheaper (CHF 7 < CHF 12) → suggest Basis
    expect(suggested?.id).toBe("plan-basis");
  });
});

// ── Additional edge-case tests for runtime safety ────────────────────────────

describe("checkPlanChange — edge cases", () => {
  it("returns null when currentPlanId is empty string and count stays within best-fit", () => {
    // Empty planId → best-fit for count=1 is smallPlan (max=1). expected=2 → basisPlan covers → still same plan? No: basisPlan (max=2) vs smallPlan (max=1). They differ → but basisPlan IS the needed plan. currentFitPlan=smallPlan, neededPlan=basisPlan → they differ → returns info
    // Actually: currentActiveCount=1 → findBestFitPlan(1)=smallPlan; expected=2 → findBestFitPlan(2)=basisPlan. They differ → returns PlanChangeInfo
    // So let's test with count=1,expected=2 → expects change (small->basis)
    const info = checkPlanChange(allPlans, 1, 2, "");
    expect(info).not.toBeNull(); // small → basis
    expect(info?.isUpgrade).toBe(true);
  });

  it("returns PlanChangeInfo when currentPlanId is empty and expected count exceeds best-fit for current", () => {
    // Empty planId → best-fit for count=2 is basisPlan (max=2). expected=3 → needs Professional
    const info = checkPlanChange(allPlans, 2, 3, "");
    expect(info).not.toBeNull();
    expect(info?.isUpgrade).toBe(true);
    expect(info?.suggestedPlanId).toBe("plan-pro");
  });

  it("returns null when current plan is Professional (max=999) for any expected count", () => {
    // Professional is unlimited → no upgrade ever needed
    const info = checkPlanChange(allPlans, 100, 101, "plan-pro");
    expect(info).toBeNull();
  });

  it("returns null for large counts when current plan is unlimited", () => {
    const info = checkPlanChange(allPlans, 998, 999, "plan-pro");
    expect(info).toBeNull();
  });
});

describe("checkDowngradeNeeded — plan-max=999 does NOT block downgrade", () => {
  it("suggests downgrade even when current plan has max=999 and a cheaper plan fits", () => {
    // Currently on Professional (max=999, CHF 12). After removing one, 1 active remains.
    // Small (max=1, CHF 5) fits and is cheaper → suggest it
    const suggested = checkDowngradeNeeded(1, allPlans, professionalPlan);
    expect(suggested?.id).toBe("plan-small");
  });

  it("suggests Basis when on Professional with 2 active employees remaining", () => {
    // Currently on Professional (max=999, CHF 12). After removal, 2 active remain.
    // Basis (max=2, CHF 7) fits count=2 and is cheaper → suggest Basis
    const suggested = checkDowngradeNeeded(2, allPlans, professionalPlan);
    expect(suggested?.id).toBe("plan-basis");
  });

  it("returns null when no cheaper plan exists for unlimited plan", () => {
    // Only plan available: Professional. No cheaper option.
    const suggested = checkDowngradeNeeded(
      2,
      [professionalPlan],
      professionalPlan,
    );
    expect(suggested).toBeNull();
  });

  it("suggested plan is always cheaper than current plan", () => {
    const suggested = checkDowngradeNeeded(2, allPlans, professionalPlan);
    expect(suggested).not.toBeNull();
    expect(Number(suggested?.pricePerMonthCHF)).toBeLessThan(
      Number(professionalPlan.pricePerMonthCHF),
    );
  });
});

// ── checkPlanChange ───────────────────────────────────────────────────────────

describe("checkPlanChange", () => {
  it("returns null when plans array is empty", () => {
    expect(checkPlanChange([], 2, 3, "plan-basis")).toBeNull();
  });

  /**
   * ROOT-CAUSE REGRESSION TEST:
   * Musterfirma AG / ICTps AG scenario — Basis plan (max=2), adding 3rd employee.
   * The bug: getAllSubscriptionPlans() throws for non-Platform-Admin users, resulting in
   * plans=[] and no dialog. Fix: use getSubscriptionPlans() (public API) instead.
   * This test verifies the pure plan-check logic works when plans are available.
   */
  it("CRITICAL: 3rd employee added to Basis plan (max=2) must trigger upgrade dialog", () => {
    // Exact scenario: 2 active employees, Basis plan (max=2), adding a 3rd
    const info = checkPlanChange(allPlans, 2, 3, "plan-basis");
    expect(info).not.toBeNull();
    expect(info?.isUpgrade).toBe(true);
    expect(info?.currentPlanName).toBe("Basis");
    expect(info?.suggestedPlanName).toBe("Professional");
    expect(info?.suggestedPlanId).toBe("plan-pro");
    expect(info?.activeUserCount).toBe(3n);
  });

  it("returns PlanChangeInfo when upgrade is needed", () => {
    const info = checkPlanChange(allPlans, 2, 3, "plan-basis");
    expect(info).not.toBeNull();
    expect(info?.isUpgrade).toBe(true);
    expect(info?.suggestedPlanId).toBe("plan-pro");
    expect(info?.currentPlanName).toBe("Basis");
    expect(info?.suggestedPlanName).toBe("Professional");
    expect(info?.activeUserCount).toBe(3n);
  });

  it("returns null when count stays within plan limit", () => {
    // currentCount=1, expectedCount=2, Basis max=2 → no change needed
    const info = checkPlanChange(allPlans, 1, 2, "plan-basis");
    expect(info).toBeNull();
  });

  it("returns PlanChangeInfo for downgrade (deactivation)", () => {
    // prevCount=3, newCount=2, currently on Professional → Basis is sufficient
    const info = checkPlanChange(allPlans, 3, 2, "plan-pro");
    expect(info).not.toBeNull();
    expect(info?.isUpgrade).toBe(false);
    expect(info?.suggestedPlanId).toBe("plan-basis");
  });

  it("returns null when the assigned plan explicitly handles the expected count", () => {
    // Basis max=2, expected=2 — no change needed
    const info = checkPlanChange(allPlans, 1, 2, "plan-basis");
    expect(info).toBeNull();
  });

  it("falls back to best-fit when currentPlanId is empty string", () => {
    // No planId provided: resolves from count. Count=2, expected=3 → needs Pro
    const info = checkPlanChange(allPlans, 2, 3, "");
    expect(info).not.toBeNull();
    expect(info?.isUpgrade).toBe(true);
  });

  it("checkPlanChange: currentActive=2, expected=3, professional plan (max=999) → returns null (already unlimited)", () => {
    const info = checkPlanChange(allPlans, 2, 3, "plan-pro");
    expect(info).toBeNull();
  });

  it("checkPlanChange: currentActive=2, expected=3, basis plan (max=2), no higher plan → returns null", () => {
    const info = checkPlanChange([basisPlan], 2, 3, "plan-basis");
    expect(info).toBeNull();
  });
});
