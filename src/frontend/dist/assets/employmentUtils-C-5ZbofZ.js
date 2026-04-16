function nanosToLocalIsoDate(ns) {
  if (ns === void 0 || ns === null) return "";
  let secNum;
  try {
    secNum = typeof ns === "bigint" ? Number(ns) : Math.round(Number(ns));
  } catch {
    return "";
  }
  if (secNum <= 0 || !Number.isFinite(secNum)) return "";
  const ms = secNum * 1e3;
  if (ms <= 0 || !Number.isFinite(ms)) return "";
  const d = new Date(ms);
  const y = d.getFullYear();
  if (y < 2e3 || y > 2100) return "";
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function getActiveEmploymentForDate(employments, isoDate) {
  if (!employments || employments.length === 0 || !isoDate) return void 0;
  const targetDate = /* @__PURE__ */ new Date(`${isoDate}T12:00:00`);
  if (Number.isNaN(targetDate.getTime())) return void 0;
  let bestMatch;
  let bestVonTime = Number.NEGATIVE_INFINITY;
  for (const emp of employments) {
    if (!emp.von) continue;
    let vonBig;
    try {
      vonBig = typeof emp.von === "bigint" ? emp.von : BigInt(Math.round(Number(emp.von)));
    } catch {
      continue;
    }
    if (vonBig <= 0n) continue;
    const vonIso = nanosToLocalIsoDate(vonBig);
    if (!vonIso) continue;
    const vonDate = /* @__PURE__ */ new Date(`${vonIso}T12:00:00`);
    if (Number.isNaN(vonDate.getTime())) continue;
    if (targetDate < vonDate) continue;
    const bisRaw = emp.bis;
    let bisIsOpen = true;
    if (bisRaw !== void 0 && bisRaw !== null) {
      let bisBig;
      try {
        bisBig = typeof bisRaw === "bigint" ? bisRaw : BigInt(Math.round(Number(bisRaw)));
      } catch {
        bisBig = 0n;
      }
      bisIsOpen = bisBig <= 0n;
      if (!bisIsOpen) {
        const bisIso = nanosToLocalIsoDate(bisBig);
        if (!bisIso) {
          bisIsOpen = true;
        } else {
          const bisDate = /* @__PURE__ */ new Date(`${bisIso}T12:00:00`);
          if (Number.isNaN(bisDate.getTime())) {
            bisIsOpen = true;
          } else if (targetDate > bisDate) {
            continue;
          }
        }
      }
    }
    const vonTime = vonDate.getTime();
    if (vonTime > bestVonTime) {
      bestVonTime = vonTime;
      bestMatch = emp;
    }
  }
  return bestMatch;
}
function getMostRecentEmploymentBefore(employments, isoDate) {
  if (!employments || employments.length === 0 || !isoDate) return void 0;
  const targetDate = /* @__PURE__ */ new Date(`${isoDate}T12:00:00`);
  if (Number.isNaN(targetDate.getTime())) return void 0;
  let bestMatch;
  let bestVonTime = Number.NEGATIVE_INFINITY;
  for (const emp of employments) {
    if (!emp.von) continue;
    let vonBig;
    try {
      vonBig = typeof emp.von === "bigint" ? emp.von : BigInt(Math.round(Number(emp.von)));
    } catch {
      continue;
    }
    if (vonBig <= 0n) continue;
    const vonIso = nanosToLocalIsoDate(vonBig);
    if (!vonIso) continue;
    const vonDate = /* @__PURE__ */ new Date(`${vonIso}T12:00:00`);
    if (Number.isNaN(vonDate.getTime())) continue;
    if (targetDate < vonDate) continue;
    const vonTime = vonDate.getTime();
    if (vonTime > bestVonTime) {
      bestVonTime = vonTime;
      bestMatch = emp;
    }
  }
  return bestMatch;
}
function getEmploymentMinutesForDate(emp, dateStr) {
  const d = /* @__PURE__ */ new Date(`${dateStr}T12:00:00Z`);
  const dow = d.getUTCDay();
  const map = {
    0: emp.stundenSo ?? 0n,
    1: emp.stundenMo ?? 0n,
    2: emp.stundenDi ?? 0n,
    3: emp.stundenMi ?? 0n,
    4: emp.stundenDo ?? 0n,
    5: emp.stundenFr ?? 0n,
    6: emp.stundenSa ?? 0n
  };
  const val = map[dow];
  if (val === void 0) return 0;
  try {
    return Number(
      typeof val === "bigint" ? val : BigInt(Math.round(Number(val)))
    );
  } catch {
    return 0;
  }
}
function countVacationDaysProportional(dateFrom, dateTo, ganztaetig, dauerMinutes, employments) {
  if (!dateFrom || !dateTo || !employments || employments.length === 0)
    return 0;
  const start = /* @__PURE__ */ new Date(`${dateFrom}T12:00:00`);
  const end = /* @__PURE__ */ new Date(`${dateTo}T12:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
  if (start > end) return 0;
  let count = 0;
  const cursor = new Date(start);
  while (cursor <= end) {
    const y = cursor.getFullYear();
    const m = String(cursor.getMonth() + 1).padStart(2, "0");
    const d = String(cursor.getDate()).padStart(2, "0");
    const dayIso = `${y}-${m}-${d}`;
    const emp = getActiveEmploymentForDate(employments, dayIso);
    if (emp) {
      const sollMinutes = getEmploymentMinutesForDate(emp, dayIso);
      if (sollMinutes > 0) {
        if (ganztaetig) {
          count += 1;
        } else {
          count += Math.min(dauerMinutes / sollMinutes, 1);
        }
      }
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return count;
}
export {
  getEmploymentMinutesForDate as a,
  getMostRecentEmploymentBefore as b,
  countVacationDaysProportional as c,
  getActiveEmploymentForDate as g,
  nanosToLocalIsoDate as n
};
