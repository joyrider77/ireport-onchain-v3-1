import { test; suite; expect } "mo:test";

// Standalone masking logic test - replicates maskCalendarAbsence logic
// without importing private backend functions

type VisibilityMode = { #full; #masked_reason; #anonymized; #hidden };

type VisConfig = {
  visibleInCompanyCalendar: Bool;
  visibilityMode: VisibilityMode;
  showEmployeeName: Bool;
  showAbsenceTypeName: Bool;
  showComment: Bool;
  companyCalendarDisplayName: ?Text;
  companyCalendarColor: ?Text;
};

type TestAbsence = {
  id: Text;
  employeeId: Nat;
  employeeName: Text;
  absenceTypeName: Text;
  fromDate: Text;
  toDate: Text;
  status: { #submitted; #approved; #rejected };
  comment: ?Text;
  color: ?Text;
};

type MaskedResult = {
  id: Text;
  employeeName: ?Text;
  displayTitle: Text;
  displayColor: ?Text;
  isOwnEntry: Bool;
  visibilityMode: Text;
  status: Text;
};

// Replicate the masking logic from absences-api.mo maskCalendarAbsence
func maskForTest(
  absence: TestAbsence,
  viewerEmpId: ?Nat,
  visConfigOpt: ?VisConfig
) : ?MaskedResult {
  // Check if this is own entry
  let isOwn = switch (viewerEmpId) {
    case (?vid) { vid == absence.employeeId };
    case null { false };
  };

  // Status text
  let statusText = switch (absence.status) {
    case (#submitted) { "ausstehend" };
    case (#approved) { "genehmigt" };
    case (#rejected) { "abgelehnt" };
  };

  // Rejected foreign entries are excluded
  if (not isOwn and absence.status == #rejected) {
    return null;
  };

  // Own entries always fully visible
  if (isOwn) {
    return ?{
      id = absence.id;
      employeeName = ?absence.employeeName;
      displayTitle = absence.employeeName # " – " # absence.absenceTypeName;
      displayColor = absence.color;
      isOwnEntry = true;
      visibilityMode = "full";
      status = statusText;
    };
  };

  // Get effective visibility config
  switch (visConfigOpt) {
    case null {
      // No config: default to full visibility
      let title = absence.employeeName # " – " # absence.absenceTypeName;
      return ?{
        id = absence.id;
        employeeName = ?absence.employeeName;
        displayTitle = title;
        displayColor = absence.color;
        isOwnEntry = false;
        visibilityMode = "full";
        status = statusText;
      };
    };
    case (?cfg) {
      if (not cfg.visibleInCompanyCalendar) {
        return null; // Not visible in company calendar
      };
      switch (cfg.visibilityMode) {
        case (#hidden) { return null };
        case (#full) {
          let title = switch (cfg.companyCalendarDisplayName) {
            case (?n) { absence.employeeName # " – " # n };
            case null { absence.employeeName # " – " # absence.absenceTypeName };
          };
          return ?{
            id = absence.id;
            employeeName = if (cfg.showEmployeeName) ?absence.employeeName else null;
            displayTitle = title;
            displayColor = cfg.companyCalendarColor;
            isOwnEntry = false;
            visibilityMode = "full";
            status = statusText;
          };
        };
        case (#masked_reason) {
          let title = switch (cfg.companyCalendarDisplayName) {
            case (?n) { absence.employeeName # " – " # n };
            case null { absence.employeeName # " – Nicht verfügbar" };
          };
          return ?{
            id = absence.id;
            employeeName = if (cfg.showEmployeeName) ?absence.employeeName else null;
            displayTitle = title;
            displayColor = cfg.companyCalendarColor;
            isOwnEntry = false;
            visibilityMode = "masked_reason";
            status = statusText;
          };
        };
        case (#anonymized) {
          return ?{
            id = absence.id;
            employeeName = null;
            displayTitle = "Abwesenheit";
            displayColor = cfg.companyCalendarColor;
            isOwnEntry = false;
            visibilityMode = "anonymized";
            status = statusText;
          };
        };
      };
    };
  };
};

// Test data
let testAbsence : TestAbsence = {
  id = "abs-1";
  employeeId = 2; // Urs Ruflin
  employeeName = "Urs Ruflin";
  absenceTypeName = "Ferien";
  fromDate = "2026-05-04";
  toDate = "2026-05-15";
  status = #approved;
  comment = null;
  color = ?"#22c55e";
};

let viewerEmpId : ?Nat = ?1; // Beat Siegfried (different employee)
let ownViewerEmpId : ?Nat = ?2; // Urs Ruflin (own entry)

let fullConfig : VisConfig = {
  visibleInCompanyCalendar = true;
  visibilityMode = #full;
  showEmployeeName = true;
  showAbsenceTypeName = true;
  showComment = false;
  companyCalendarDisplayName = null;
  companyCalendarColor = ?"#22c55e";
};

let maskedConfig : VisConfig = {
  visibleInCompanyCalendar = true;
  visibilityMode = #masked_reason;
  showEmployeeName = true;
  showAbsenceTypeName = false;
  showComment = false;
  companyCalendarDisplayName = null;
  companyCalendarColor = ?"#94a3b8";
};

let anonymizedConfig : VisConfig = {
  visibleInCompanyCalendar = true;
  visibilityMode = #anonymized;
  showEmployeeName = false;
  showAbsenceTypeName = false;
  showComment = false;
  companyCalendarDisplayName = null;
  companyCalendarColor = ?"#94a3b8";
};

let hiddenConfig : VisConfig = {
  visibleInCompanyCalendar = true;
  visibilityMode = #hidden;
  showEmployeeName = false;
  showAbsenceTypeName = false;
  showComment = false;
  companyCalendarDisplayName = null;
  companyCalendarColor = null;
};

let notVisibleConfig : VisConfig = {
  visibleInCompanyCalendar = false;
  visibilityMode = #full;
  showEmployeeName = true;
  showAbsenceTypeName = true;
  showComment = false;
  companyCalendarDisplayName = null;
  companyCalendarColor = null;
};

suite("Firmenkalender Maskierungslogik", func() {

  test("full visibility - zeigt alle Felder", func() {
    let result = maskForTest(testAbsence, viewerEmpId, ?fullConfig);
    switch (result) {
      case null { assert false };
      case (?r) {
        assert r.employeeName == ?"Urs Ruflin";
        assert r.visibilityMode == "full";
        assert r.isOwnEntry == false;
      };
    };
  });

  test("masked_reason - zeigt Nicht verfuegbar als Titel", func() {
    let result = maskForTest(testAbsence, viewerEmpId, ?maskedConfig);
    switch (result) {
      case null { assert false };
      case (?r) {
        assert r.employeeName == ?"Urs Ruflin";
        assert r.visibilityMode == "masked_reason";
      };
    };
  });

  test("anonymized - versteckt Namen und zeigt Abwesenheit", func() {
    let result = maskForTest(testAbsence, viewerEmpId, ?anonymizedConfig);
    switch (result) {
      case null { assert false };
      case (?r) {
        assert r.employeeName == null;
        assert r.displayTitle == "Abwesenheit";
        assert r.visibilityMode == "anonymized";
      };
    };
  });

  test("hidden - gibt null zurueck", func() {
    let result = maskForTest(testAbsence, viewerEmpId, ?hiddenConfig);
    assert result == null;
  });

  test("visibleInCompanyCalendar=false - gibt null zurueck", func() {
    let result = maskForTest(testAbsence, viewerEmpId, ?notVisibleConfig);
    assert result == null;
  });

  test("null visConfig - verwendet Standard-Vollsichtbarkeit", func() {
    let result = maskForTest(testAbsence, viewerEmpId, null);
    switch (result) {
      case null { assert false };
      case (?r) {
        assert r.visibilityMode == "full";
        assert r.isOwnEntry == false;
      };
    };
  });

  test("eigener Eintrag - immer vollstaendig sichtbar", func() {
    let result = maskForTest(testAbsence, ownViewerEmpId, ?hiddenConfig);
    switch (result) {
      case null { assert false };
      case (?r) {
        assert r.isOwnEntry == true;
        assert r.employeeName == ?"Urs Ruflin";
      };
    };
  });

  test("abgelehnter Fremdeintrag - gibt null zurueck", func() {
    let rejectedAbsence : TestAbsence = {
      id = "abs-2";
      employeeId = 2;
      employeeName = "Urs Ruflin";
      absenceTypeName = "Ferien";
      fromDate = "2026-05-04";
      toDate = "2026-05-15";
      status = #rejected;
      comment = null;
      color = ?"#22c55e";
    };
    let result = maskForTest(rejectedAbsence, viewerEmpId, ?fullConfig);
    assert result == null;
  });

  test("ausstehender Eintrag - wird angezeigt", func() {
    let pendingAbsence : TestAbsence = {
      id = "abs-3";
      employeeId = 2;
      employeeName = "Urs Ruflin";
      absenceTypeName = "Ferien";
      fromDate = "2026-05-04";
      toDate = "2026-05-15";
      status = #submitted;
      comment = null;
      color = ?"#22c55e";
    };
    let result = maskForTest(pendingAbsence, viewerEmpId, ?fullConfig);
    switch (result) {
      case null { assert false };
      case (?r) {
        assert r.status == "ausstehend";
      };
    };
  });

});
