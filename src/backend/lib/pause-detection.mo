// Pausen-Erkennungs-Service – berechnet Pausen aus Luecken zwischen Arbeitszeitbloecken
// Keine Persistenz: Pausen werden zur Laufzeit berechnet; nur Overrides werden gespeichert.
import Array "mo:core/Array";
import Int "mo:core/Int";
import ComplianceTypes "../types/compliance";
import TrackingTypes "../types/timetracking";

module {

  // Hilfsfunktion: "HH:MM" -> Nanosekunden seit Tagesbeginn
  private func timeStrToNs_(s : Text) : Int {
    let parts = s.split(#char ':').toArray();
    if (parts.size() < 2) return 0;
    let h = switch (Int.fromText(parts[0])) { case (?v) v; case null 0 };
    let m = switch (Int.fromText(parts[1])) { case (?v) v; case null 0 };
    (h * 60 + m) * 60 * 1_000_000_000;
  };

  // Hilfsfunktion: YYYY-MM-DD -> Nanosekunden (Tagesbeginn)
  private func dateToNs_(dateStr : Text) : Int {
    let nsPerDay : Int = 86_400_000_000_000;
    let parts = dateStr.split(#char '-').toArray();
    if (parts.size() < 3) return 0;
    let year = switch (Int.fromText(parts[0])) { case (?v) v; case null return 0 };
    let month = switch (Int.fromText(parts[1])) { case (?v) v; case null return 0 };
    let day = switch (Int.fromText(parts[2])) { case (?v) v; case null return 0 };
    let y = if (month <= 2) { year - 1 } else { year };
    let m = if (month <= 2) { month + 9 } else { month - 3 };
    let era = if (y >= 0) { y / 400 } else { (y - 399) / 400 };
    let yoe = y - era * 400;
    let doy = (153 * m + 2) / 5 + day - 1;
    let doe = yoe * 365 + yoe / 4 - yoe / 100 + doy;
    let unixDays = era * 146097 + doe - 719468;
    unixDays * nsPerDay;
  };

  // Interne Hilfsdatenstruktur fuer sortierte Zeitbloecke
  type TimeBlock = {
    entryId : Nat;
    startNs : Int;
    endNs   : Int;
  };

  // detectPausesForDay
  // Berechnet erkannte Pausen aus Luecken zwischen Arbeitszeitbloecken eines Tages.
  // Nur TimeEntry-Eintraege mit von+bis werden beruecksichtigt.
  // Overrides werden angewendet: bei action="ignore_pause" wird ignored=true gesetzt.
  public func detectPausesForDay(
    employeeId  : Nat,
    companyId   : Nat,
    date        : Text,
    timeEntries : [TrackingTypes.TimeEntry],
    overrides   : [ComplianceTypes.PauseOverride],
  ) : [ComplianceTypes.DetectedPause] {
    let dateNs = dateToNs_(date);
    let blocks : [TimeBlock] = timeEntries.filterMap<TrackingTypes.TimeEntry, TimeBlock>(
      func(te) {
        if (te.employeeId != employeeId or te.companyId != companyId or te.date != date) {
          return null;
        };
        switch (te.von, te.bis) {
          case (?vonStr, ?bisStr) {
            let startNs = dateNs + timeStrToNs_(vonStr);
            let rawEndNs = dateNs + timeStrToNs_(bisStr);
            let endNs = if (rawEndNs <= startNs) { rawEndNs + 86_400_000_000_000 } else { rawEndNs };
            ?{ entryId = te.id; startNs; endNs };
          };
          case _ { null };
        };
      }
    );
    if (blocks.size() < 2) return [];
    let sorted = blocks.sort(func(a : TimeBlock, b : TimeBlock) : { #less; #equal; #greater } {
      Int.compare(a.startNs, b.startNs);
    });
    var pauses : [ComplianceTypes.DetectedPause] = [];
    var i = 0;
    while (i + 1 < sorted.size()) {
      let prev = sorted[i];
      let next = sorted[i + 1];
      let gapNs : Int = next.startNs - prev.endNs;
      if (gapNs > 0) {
        let durationMinutes : Int = gapNs / 60_000_000_000;
        let pauseStart = prev.endNs;
        let pauseEnd   = next.startNs;
        let matchingOverride = overrides.find(func(ov : ComplianceTypes.PauseOverride) : Bool {
          ov.userId == employeeId and ov.companyId == companyId and ov.date == date
            and ov.gapStart == pauseStart and ov.gapEnd == pauseEnd;
        });
        let ignored = switch (matchingOverride) {
          case null { false };
          case (?ov) { ov.action == "ignore_pause" };
        };
        let pause : ComplianceTypes.DetectedPause = {
          date;
          pauseStart;
          pauseEnd;
          durationMinutes;
          source             = "calculated";
          ignored;
          complianceRelevant = not ignored;
        };
        pauses := pauses.concat([pause]);
      };
      i += 1;
    };
    pauses;
  };

  // calculatePauseCompliance
  // Berechnet das Pausen-Compliance-Ergebnis fuer einen Tag.
  // workDurationMinutes: Summe aller Arbeitszeitblock-Dauern (ohne Pausen)
  // pausen: Liste der erkannten Pausen (aus detectPausesForDay)
  public func calculatePauseCompliance(
    employeeId          : Nat,
    companyId           : Nat,
    date                : Text,
    workDurationMinutes : Int,
    pausen              : [ComplianceTypes.DetectedPause],
  ) : ComplianceTypes.DayPauseComplianceResult {
    var detectedPauseMinutes : Int = 0;
    for (p in pausen.values()) {
      if (p.complianceRelevant) {
        detectedPauseMinutes += p.durationMinutes;
      };
    };
    let requiredPauseMinutes : Int = if (workDurationMinutes <= 0) {
      0;
    } else if (workDurationMinutes <= 330) {   // bis 5h30
      0;
    } else if (workDurationMinutes <= 420) {   // bis 7h00 -> mind. 15 Min
      15;
    } else if (workDurationMinutes <= 540) {   // bis 9h00 -> mind. 30 Min
      30;
    } else {                                    // ueber 9h00 -> mind. 60 Min
      60;
    };
    if (workDurationMinutes <= 0 or requiredPauseMinutes == 0) {
      return {
        employeeId;
        companyId;
        date;
        workDurationMinutes;
        detectedPauseMinutes;
        requiredPauseMinutes = 0;
        isCompliant = true;
        meldung = "Keine Mindestpause erforderlich.";
        status = "not_required";
        pausen;
      };
    };
    let isCompliant = detectedPauseMinutes >= requiredPauseMinutes;
    let meldung = if (isCompliant) {
      "Mindestpause erfuellt: Erforderlich " # requiredPauseMinutes.toText() # " Min, erkannt " # detectedPauseMinutes.toText() # " Min.";
    } else {
      "Mindestpause nicht erfuellt: Erforderlich " # requiredPauseMinutes.toText() # " Min, erkannt " # detectedPauseMinutes.toText() # " Min.";
    };
    let status = if (isCompliant) { "ok" } else { "violation" };
    {
      employeeId;
      companyId;
      date;
      workDurationMinutes;
      detectedPauseMinutes;
      requiredPauseMinutes;
      isCompliant;
      meldung;
      status;
      pausen;
    };
  };

  // calculateWorkDurationMinutes
  // Berechnet die Gesamtarbeitsdauer in Minuten aus TimeEntries fuer einen Tag.
  // Nur Eintraege mit von+bis werden beruecksichtigt.
  public func calculateWorkDurationMinutes(
    employeeId  : Nat,
    companyId   : Nat,
    date        : Text,
    timeEntries : [TrackingTypes.TimeEntry],
  ) : Int {
    let dateNs = dateToNs_(date);
    var totalMinutes : Int = 0;
    for (te in timeEntries.values()) {
      if (te.employeeId == employeeId and te.companyId == companyId and te.date == date) {
        switch (te.von, te.bis) {
          case (?vonStr, ?bisStr) {
            let startNs = dateNs + timeStrToNs_(vonStr);
            let rawEndNs = dateNs + timeStrToNs_(bisStr);
            let endNs = if (rawEndNs <= startNs) { rawEndNs + 86_400_000_000_000 } else { rawEndNs };
            let durationNs = endNs - startNs;
            if (durationNs > 0) {
              totalMinutes += durationNs / 60_000_000_000;
            };
          };
          case _ {};
        };
      };
    };
    totalMinutes;
  };

  // Unit-Tests
  public func runUnitTests() : () {
    let baseEntry : TrackingTypes.TimeEntry = {
      id = 0; companyId = 1; employeeId = 1;
      projectId = 0; serviceTypeId = 0;
      date = "2024-03-15";
      hours = 0.0;
      von = null; bis = null;
      description = ""; billable = false;
      createdAt = 0; fakturiertInRechnungId = null;
    };
    // Test 1: 08:00-12:00 + 13:00-17:00 -> Pause 60 Min, Arbeit 8h, erfuellt
    do {
      let entries : [TrackingTypes.TimeEntry] = [
        { baseEntry with id = 1; von = ?"08:00"; bis = ?"12:00" },
        { baseEntry with id = 2; von = ?"13:00"; bis = ?"17:00" },
      ];
      let pausen = detectPausesForDay(1, 1, "2024-03-15", entries, []);
      assert(pausen.size() == 1);
      assert(pausen[0].durationMinutes == 60);
      let work = calculateWorkDurationMinutes(1, 1, "2024-03-15", entries);
      assert(work == 480);
      let result = calculatePauseCompliance(1, 1, "2024-03-15", work, pausen);
      assert(result.isCompliant);
      assert(result.status == "ok");
    };
    // Test 2: 08:00-14:00 ohne Unterbruch -> Pause 0 Min, Arbeit 6h, nicht erfuellt
    do {
      let entries : [TrackingTypes.TimeEntry] = [
        { baseEntry with id = 3; von = ?"08:00"; bis = ?"14:00" },
      ];
      let pausen = detectPausesForDay(1, 1, "2024-03-15", entries, []);
      assert(pausen.size() == 0);
      let work = calculateWorkDurationMinutes(1, 1, "2024-03-15", entries);
      assert(work == 360);
      let result = calculatePauseCompliance(1, 1, "2024-03-15", work, pausen);
      assert(not result.isCompliant);
      assert(result.status == "violation");
    };
    // Test 3: 07:30-12:00 + 12:15-17:30 -> Pause 15 Min, Arbeit 9h45, nicht erfuellt
    do {
      let entries : [TrackingTypes.TimeEntry] = [
        { baseEntry with id = 5; von = ?"07:30"; bis = ?"12:00" },
        { baseEntry with id = 6; von = ?"12:15"; bis = ?"17:30" },
      ];
      let pausen = detectPausesForDay(1, 1, "2024-03-15", entries, []);
      assert(pausen.size() == 1);
      assert(pausen[0].durationMinutes == 15);
      let work = calculateWorkDurationMinutes(1, 1, "2024-03-15", entries);
      assert(work == 585);
      let result = calculatePauseCompliance(1, 1, "2024-03-15", work, pausen);
      assert(not result.isCompliant);
      assert(result.status == "violation");
    };
    // Test 4: Override - Pause als ignoriert markieren
    do {
      let entries : [TrackingTypes.TimeEntry] = [
        { baseEntry with id = 7; von = ?"08:00"; bis = ?"12:00" },
        { baseEntry with id = 8; von = ?"13:00"; bis = ?"17:00" },
      ];
      let dateNs2 = dateToNs_("2024-03-15");
      let pauseStart = dateNs2 + timeStrToNs_("12:00");
      let pauseEnd   = dateNs2 + timeStrToNs_("13:00");
      let overrides : [ComplianceTypes.PauseOverride] = [{
        id = 1; userId = 1; companyId = 1;
        date = "2024-03-15";
        gapStart = pauseStart; gapEnd = pauseEnd;
        action = "ignore_pause"; reason = ?"Test";
        createdByUserId = 1; createdAt = 0; updatedAt = 0;
      }];
      let pausen = detectPausesForDay(1, 1, "2024-03-15", entries, overrides);
      assert(pausen.size() == 1);
      assert(pausen[0].ignored);
      assert(not pausen[0].complianceRelevant);
    };
  };
};
