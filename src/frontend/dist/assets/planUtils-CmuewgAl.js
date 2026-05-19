function isUnlimited(maxEmployees) {
  if (maxEmployees === void 0 || maxEmployees === null) return true;
  const n = Number(maxEmployees);
  return n === 0 || n === 999;
}
function effectiveMax(maxEmployees) {
  if (isUnlimited(maxEmployees)) return Number.MAX_SAFE_INTEGER;
  return Number(maxEmployees);
}
function findBestFitPlan(plans, employeeCount) {
  const active = plans.filter((p) => p.isActive).sort(
    (a, b) => effectiveMax(a.maxEmployees) - effectiveMax(b.maxEmployees)
  );
  if (active.length === 0) return null;
  return active.find((p) => effectiveMax(p.maxEmployees) >= employeeCount) ?? active[active.length - 1];
}
function checkDowngradeNeeded(newActiveCount, allPlans, currentPlan) {
  if (!currentPlan || allPlans.length === 0) return null;
  const activePlans = allPlans.filter((p) => p.isActive).sort(
    (a, b) => effectiveMax(a.maxEmployees) - effectiveMax(b.maxEmployees)
  );
  const bestFit = activePlans.find(
    (p) => effectiveMax(p.maxEmployees) >= newActiveCount
  );
  if (!bestFit || bestFit.id === currentPlan.id) return null;
  const currentPrice = currentPlan.pricePerMonthCHF ?? 0;
  const suggestedPrice = bestFit.pricePerMonthCHF ?? 0;
  if (suggestedPrice >= currentPrice) return null;
  return bestFit;
}
function checkPlanChange(plans, currentActiveCount, expectedActiveCount, currentPlanId) {
  if (plans.length === 0) return null;
  const assignedPlan = currentPlanId ? plans.find((p) => p.id === currentPlanId) : void 0;
  const currentFitPlan = assignedPlan ?? findBestFitPlan(plans, currentActiveCount);
  const isUpgradeScenario = expectedActiveCount > currentActiveCount;
  if (isUpgradeScenario && currentFitPlan && isUnlimited(currentFitPlan.maxEmployees)) {
    return null;
  }
  const neededPlan = findBestFitPlan(plans, expectedActiveCount);
  if (!neededPlan) return null;
  if (!currentFitPlan || currentFitPlan.id === neededPlan.id) return null;
  return {
    currentPlanName: currentFitPlan.name,
    suggestedPlanName: neededPlan.name,
    suggestedPlanId: neededPlan.id,
    activeUserCount: BigInt(expectedActiveCount),
    isUpgrade: isUpgradeScenario
  };
}
export {
  checkDowngradeNeeded as a,
  checkPlanChange as c,
  isUnlimited as i
};
