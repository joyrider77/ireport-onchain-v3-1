import { test; suite; expect } "mo:test";
import Nat32 "mo:core/Nat32";
import Char "mo:core/Char";

// Standalone Compliance-Engine unit tests
// Tests pause compliance and rest-time logic without importing lib files directly

// ─── Helpers ────────────────────────────────────────────────────────────────

// Parse "HH:MM" into total minutes since midnight
func parseTimeToMinutes(t : Text) : Nat {
  let chars = t.chars();
  var h1 : Nat = 0;
  var h2 : Nat = 0;
  var m1 : Nat = 0;
  var m2 : Nat = 0;
  var idx = 0;
  for (c in chars) {
    switch (idx) {
      case 0 { h1 := (Nat32.toNat(Char.toNat32(c)) - 48) };
      case 1 { h2 := (Nat32.toNat(Char.toNat32(c)) - 48) };
      case 2 { /* colon */ };
      case 3 { m1 := (Nat32.toNat(Char.toNat32(c)) - 48) };
      case 4 { m2 := (Nat32.toNat(Char.toNat32(c)) - 48) };
      case _ {};
    };
    idx += 1;
  };
  let hours = h1 * 10 + h2;
  let mins = m1 * 10 + m2;
  hours * 60 + mins
};

// Calculate rest gap in minutes between two time points (possibly across days)
// endMin: end of last shift (minutes since midnight on day N)
// startMin: start of next shift (minutes since midnight on day N+k)
// extraDays: number of full extra days between (e.g. 0 = same night, 2 = weekend)
func calcRestGap(endMin : Nat, startMin : Nat, extraDays : Nat) : Nat {
  let minutesPerDay = 1440;
  if (startMin + extraDays * minutesPerDay >= endMin) {
    startMin + extraDays * minutesPerDay - endMin
  } else {
    // wrap next day
    startMin + (extraDays + 1) * minutesPerDay - endMin
  }
};

// Required pause in minutes for given work duration (Swiss law)
func requiredPauseMinutes(workMin : Nat) : Nat {
  let minsPer5h30 = 330; // 5h30
  let minsPer7h = 420;   // 7h
  let minsPer9h = 540;   // 9h
  if (workMin > minsPer9h) { 60 }
  else if (workMin > minsPer7h) { 30 }
  else if (workMin > minsPer5h30) { 15 }
  else { 0 }
};

type PauseComplianceResult = {
  isCompliant : Bool;
  requiredPauseMin : Nat;
  detectedPauseMin : Nat;
  status : Text;
};

func checkPauseCompliance(workMin : Nat, pauseMin : Nat) : PauseComplianceResult {
  let required = requiredPauseMinutes(workMin);
  if (required == 0) {
    { isCompliant = true; requiredPauseMin = 0; detectedPauseMin = pauseMin; status = "not_required" }
  } else if (pauseMin >= required) {
    { isCompliant = true; requiredPauseMin = required; detectedPauseMin = pauseMin; status = "ok" }
  } else {
    { isCompliant = false; requiredPauseMin = required; detectedPauseMin = pauseMin; status = "violation" }
  }
};

// ─── Tests ──────────────────────────────────────────────────────────────────

suite("parseTimeToMinutes", func() {
  test("22:00 = 1320", func() {
    assert parseTimeToMinutes("22:00") == 1320;
  });
  test("05:00 = 300", func() {
    assert parseTimeToMinutes("05:00") == 300;
  });
  test("08:00 = 480", func() {
    assert parseTimeToMinutes("08:00") == 480;
  });
  test("00:00 = 0", func() {
    assert parseTimeToMinutes("00:00") == 0;
  });
});

suite("Ruhezeit-Berechnung", func() {
  // Di 19:00 Ende → Mi 05:00 Beginn: 10 Stunden = Verstoss
  test("10h Ruhezeit – Verstoss unter 11h", func() {
    let endMin = parseTimeToMinutes("19:00"); // 1140
    let startMin = parseTimeToMinutes("05:00"); // 300
    // next day: 300 + 1440 - 1140 = 600 min = 10h
    let gap = calcRestGap(endMin, startMin, 0);
    assert gap == 600;
    assert gap < 660; // 11 * 60 = Verstoss
  });
  // Fr 22:00 Ende → Mo 08:00 Beginn: Wochenende dazwischen = weit über 11h
  test("Wochenende Ruhezeit – erfüllt", func() {
    let endMin = parseTimeToMinutes("22:00"); // 1320
    let startMin = parseTimeToMinutes("08:00"); // 480
    // Mo = Fr + 3 Tage: 480 + 3*1440 - 1320 = 480 + 4320 - 1320 = 3480 min = 58h
    let gap = calcRestGap(endMin, startMin, 2);
    assert gap == 3480;
    assert gap >= 660; // weit über 11h – erfüllt
  });
  // Di 22:00 Ende → Mi 08:00 Beginn: nächste Nacht, 10h = Verstoss
  test("Gleiche Nacht 10h – Verstoss", func() {
    let endMin = parseTimeToMinutes("22:00"); // 1320
    let startMin = parseTimeToMinutes("08:00"); // 480
    // Nächster Tag: 480 + 1440 - 1320 = 600 min = 10h
    let gap = calcRestGap(endMin, startMin, 0);
    assert gap == 600;
    assert gap < 660;
  });
  // 11h genau = erfüllt (Grenzwert)
  test("Genau 11h Ruhezeit – erfüllt", func() {
    let endMin = parseTimeToMinutes("21:00"); // 1260
    let startMin = parseTimeToMinutes("08:00"); // 480
    // 480 + 1440 - 1260 = 660 min = 11h genau
    let gap = calcRestGap(endMin, startMin, 0);
    assert gap == 660;
    assert gap >= 660; // genau 11h – erfüllt
  });
});

suite("Pausen-Compliance Schweizer Recht", func() {
  // Beispiel 1: 8h Arbeit, 60min Pause → schwelle >7h = 30min → erfüllt
  test("8h Arbeit, 60min Pause – erfüllt (>7h Schwelle = 30min)", func() {
    let result = checkPauseCompliance(480, 60);
    assert result.isCompliant == true;
    assert result.requiredPauseMin == 30;
    assert result.detectedPauseMin == 60;
    assert result.status == "ok";
  });
  // Beispiel 2: 6h Arbeit, 0min Pause → schwelle >5.5h = 15min → Verstoss
  test("6h Arbeit, 0min Pause – Verstoss (>5.5h Schwelle = 15min)", func() {
    let result = checkPauseCompliance(360, 0);
    assert result.isCompliant == false;
    assert result.requiredPauseMin == 15;
    assert result.detectedPauseMin == 0;
    assert result.status == "violation";
  });
  // Beispiel 3: 9h45m Arbeit, 15min Pause → schwelle >9h = 60min → Verstoss
  test("9h45m Arbeit, 15min Pause – Verstoss (>9h Schwelle = 60min)", func() {
    let result = checkPauseCompliance(585, 15);
    assert result.isCompliant == false;
    assert result.requiredPauseMin == 60;
    assert result.detectedPauseMin == 15;
    assert result.status == "violation";
  });
  // 5h genau: keine Mindestpause erforderlich
  test("5h Arbeit – keine Mindestpause erforderlich", func() {
    let result = checkPauseCompliance(300, 0);
    assert result.isCompliant == true;
    assert result.requiredPauseMin == 0;
    assert result.status == "not_required";
  });
  // Grenzwert 5h30 genau: 330min – ab 331min wäre Pause fällig
  test("Genau 5h30 Arbeit – keine Pause erforderlich", func() {
    let result = checkPauseCompliance(330, 0);
    assert result.isCompliant == true;
    assert result.requiredPauseMin == 0;
  });
  test("5h31 Arbeit – 15min Pause erforderlich", func() {
    let result = checkPauseCompliance(331, 14);
    assert result.isCompliant == false;
    assert result.requiredPauseMin == 15;
  });
  // Grenzwert 7h: 421min → 30min Pause erforderlich
  test("7h01 Arbeit, 30min Pause – erfüllt (>7h Schwelle = 30min)", func() {
    let result = checkPauseCompliance(421, 30);
    assert result.isCompliant == true;
    assert result.requiredPauseMin == 30;
  });
  // Grenzwert 9h: 541min → 60min Pause erforderlich
  test("9h01 Arbeit, 59min Pause – Verstoss (>9h Schwelle = 60min)", func() {
    let result = checkPauseCompliance(541, 59);
    assert result.isCompliant == false;
    assert result.requiredPauseMin == 60;
  });
});
