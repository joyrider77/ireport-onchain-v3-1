// Cost Dashboard API – Kosten- und Cycle-Übersicht (nur Platform Admin)
// iReport Onchain V3.1
import List "mo:core/List";
import Prim "mo:prim";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Timer "mo:core/Timer";
import ExperimentalCycles "mo:core/Cycles";

import CompanyTypes "../types/company";
import CostTypes "../types/cost-dashboard";

mixin (
  companies : List.List<CompanyTypes.Company>,
  employees : List.List<CompanyTypes.Employee>,
  platformAdminPrincipal : { var value : ?Principal },
  cycleSnapshots : List.List<CostTypes.CycleSnapshot>,
  costSettingsState : { var value : ?CostTypes.CostSettings },
  frontendCanisterIdState : { var value : Text },
  backendCanisterIdState : { var value : Text },
  snapshotIntervalSeconds : { var value : Nat },
  snapshotTimerId : { var value : ?Timer.TimerId },
  frontendCyclesManual : { var value : Nat },
) {
  // Standardwerte für CostSettings
  private let defaultCostSettings : CostTypes.CostSettings = {
    icpPriceUsd = 8.0;
    usdChfRate = 0.88;
    frontendAlertThreshold = 500_000_000_000;
    backendAlertThreshold = 500_000_000_000;
    alertEnabled = true;
  };

  // Hilfsfunktion: prüft ob der Caller Platform Admin ist
  private func costDashIsPlatformAdmin(caller : Principal) : Bool {
    switch (platformAdminPrincipal.value) {
      case (?p) { Principal.equal(p, caller) };
      case null { false };
    };
  };

  // Automatischen Snapshot-Timer starten (oder neu starten)
  public shared func startSnapshotTimer<system>() : async () {
    // Bestehenden Timer zuerst abbrechen
    switch (snapshotTimerId.value) {
      case (?tid) { Timer.cancelTimer(tid) };
      case null {};
    };
    let intervalSecs = snapshotIntervalSeconds.value;
    if (intervalSecs == 0) {
      snapshotTimerId.value := null;
      return;
    };
    let tid = Timer.recurringTimer<system>(#seconds(intervalSecs), func() : async () {
      let liveCycles = ExperimentalCycles.balance();
      let snapshot : CostTypes.CycleSnapshot = {
        timestamp = Time.now();
        frontendCycles = 0; // Frontend kann nur von aussen gemeldet werden
        backendCycles = liveCycles;
      };
      cycleSnapshots.add(snapshot);
      let maxSnapshots : Nat = 365;
      let total : Nat = cycleSnapshots.size();
      if (total > maxSnapshots) {
        let excess : Nat = total - maxSnapshots;
        let kept = cycleSnapshots.sliceToArray(excess.toInt(), total.toInt());
        cycleSnapshots.clear();
        cycleSnapshots.addAll(kept.values());
      };
    });
    snapshotTimerId.value := ?tid;
  };

  // Snapshot-Intervall abfragen (nur Platform Admin)
  public query ({ caller }) func getSnapshotInterval() : async Nat {
    if (not costDashIsPlatformAdmin(caller)) {
      Runtime.trap("Keine Berechtigung: nur Platform Admin");
    };
    snapshotIntervalSeconds.value;
  };

  // Snapshot-Intervall setzen und Timer neu starten (nur Platform Admin)
  public shared ({ caller }) func setSnapshotInterval<system>(seconds : Nat) : async () {
    if (not costDashIsPlatformAdmin(caller)) {
      Runtime.trap("Keine Berechtigung: nur Platform Admin");
    };
    snapshotIntervalSeconds.value := seconds;
    await startSnapshotTimer<system>();
  };

  // Hilfsfunktion: aktuelle Settings lesen (Fallback auf Standardwerte)
  private func getCurrentSettings() : CostTypes.CostSettings {
    switch (costSettingsState.value) {
      case (?s) { s };
      case null { defaultCostSettings };
    };
  };

  // Manuellen Frontend-Cycle-Wert setzen (nur Platform Admin).
  // Da das Backend kein Controller des Frontend-Canisters ist, kann es dessen
  // Cycle-Stand nicht via canister_status() abfragen. Der Platform Admin muss
  // den Wert manuell setzen, bevor er einen Snapshot aufzeichnet.
  public shared ({ caller }) func setFrontendCyclesManual(cycles : Nat) : async () {
    if (not costDashIsPlatformAdmin(caller)) {
      Runtime.trap("Keine Berechtigung: nur Platform Admin");
    };
    frontendCyclesManual.value := cycles;
  };

  // Manuellen Frontend-Cycle-Wert abfragen (nur Platform Admin)
  public query ({ caller }) func getFrontendCyclesManual() : async Nat {
    if (not costDashIsPlatformAdmin(caller)) {
      Runtime.trap("Keine Berechtigung: nur Platform Admin");
    };
    frontendCyclesManual.value;
  };

  // a) Neuen Cycle-Snapshot aufzeichnen
  // backendCycles-Parameter wird ignoriert – live-Stand wird immer direkt abgefragt
  // frontendCycles-Parameter: falls > 0 verwendet, sonst Fallback auf manuell gesetzten Wert
  public shared ({ caller }) func recordCycleSnapshot(
    frontendCycles : Nat,
    backendCycles : Nat,
  ) : async () {
    if (not costDashIsPlatformAdmin(caller)) {
      Runtime.trap("Keine Berechtigung: nur Platform Admin");
    };
    // Backend-Cycle-Stand immer live erfassen (Parameter wird ignoriert)
    let liveCycles = ExperimentalCycles.balance();
    // Frontend-Cycle-Stand aus manuell gesetztem Wert lesen
    // (canister_status() schlägt fehl, weil das Backend kein Controller des Frontend ist)
    let actualFrontendCycles : Nat = if (frontendCycles > 0) { frontendCycles } else { frontendCyclesManual.value };
    let snapshot : CostTypes.CycleSnapshot = {
      timestamp = Time.now();
      frontendCycles = actualFrontendCycles;
      backendCycles = liveCycles;
    };
    cycleSnapshots.add(snapshot);
    // Max. 365 Snapshots behalten – älteste (vorne) entfernen
    let maxSnapshots : Nat = 365;
    let total : Nat = cycleSnapshots.size();
    if (total > maxSnapshots) {
      let excess : Nat = total - maxSnapshots;
      // Neueste 365 behalten: slice vom Ende
      let kept = cycleSnapshots.sliceToArray(excess.toInt(), total.toInt());
      cycleSnapshots.clear();
      cycleSnapshots.addAll(kept.values());
    };
  };

  // b) Snapshots abrufen (optional nach Zeitraum gefiltert)
  public query ({ caller }) func getCycleSnapshots(
    fromTime : ?Int,
    toTime : ?Int,
  ) : async [CostTypes.CycleSnapshot] {
    if (not costDashIsPlatformAdmin(caller)) {
      Runtime.trap("Keine Berechtigung: nur Platform Admin");
    };
    let filtered = cycleSnapshots.filter(func(s : CostTypes.CycleSnapshot) : Bool {
      let afterFrom = switch (fromTime) {
        case (?t) { s.timestamp >= t };
        case null { true };
      };
      let beforeTo = switch (toTime) {
        case (?t) { s.timestamp <= t };
        case null { true };
      };
      afterFrom and beforeTo
    });
    filtered.toArray();
  };

  // c) Aktuelle Einstellungen abrufen
  public query ({ caller }) func getCostSettings() : async CostTypes.CostSettings {
    if (not costDashIsPlatformAdmin(caller)) {
      Runtime.trap("Keine Berechtigung: nur Platform Admin");
    };
    getCurrentSettings();
  };

  // d) Einstellungen aktualisieren
  public shared ({ caller }) func updateCostSettings(settings : CostTypes.CostSettings) : async () {
    if (not costDashIsPlatformAdmin(caller)) {
      Runtime.trap("Keine Berechtigung: nur Platform Admin");
    };
    costSettingsState.value := ?settings;
  };

  // e) Frontend-Canister-ID setzen (nur Platform Admin)
  // Da die Frontend-Canister-ID nicht zur Laufzeit im Motoko-Backend verfügbar ist,
  // muss sie manuell durch den Platform Admin gesetzt werden.
  public shared ({ caller }) func setFrontendCanisterId(id : Text) : async () {
    if (not costDashIsPlatformAdmin(caller)) {
      Runtime.trap("Keine Berechtigung: nur Platform Admin");
    };
    frontendCanisterIdState.value := id;
  };

  // f) Cycle-Status abrufen (Backend live, Frontend aus Snapshots)
  public query ({ caller }) func getCycleStatus() : async CostTypes.CycleStatus {
    if (not costDashIsPlatformAdmin(caller)) {
      Runtime.trap("Keine Berechtigung: nur Platform Admin");
    };
    let backendCycles = ExperimentalCycles.balance();
    // Letzter bekannter Frontend-Stand aus Snapshots
    let frontendCycles : ?Nat = switch (cycleSnapshots.last()) {
      case (?s) { ?s.frontendCycles };
      case null { null };
    };
    {
      backendCycles;
      frontendCycles;
      dataSource = "live";
    };
  };

  // g) Kombiniertes Dashboard-Datenobjekt abrufen
  public query ({ caller }) func getCostDashboardData(
    fromTime : ?Int,
    toTime : ?Int,
  ) : async CostTypes.CostDashboardData {
    if (not costDashIsPlatformAdmin(caller)) {
      Runtime.trap("Keine Berechtigung: nur Platform Admin");
    };
    let filtered = cycleSnapshots.filter(func(s : CostTypes.CycleSnapshot) : Bool {
      let afterFrom = switch (fromTime) {
        case (?t) { s.timestamp >= t };
        case null { true };
      };
      let beforeTo = switch (toTime) {
        case (?t) { s.timestamp <= t };
        case null { true };
      };
      afterFrom and beforeTo
    });
    // Backend-Cycle-Stand live abfragen
    let backendCycles = ExperimentalCycles.balance();
    {
      snapshots = filtered.toArray();
      settings = getCurrentSettings();
      frontendCanisterId = frontendCanisterIdState.value;
      backendCanisterId = backendCanisterIdState.value;
      backendCyclesBalance = ?backendCycles;
      dataSource = "live";
    };
  };

  // i) Canister-Status-Info abrufen (live, ohne Management-Canister-Zugriff)
  // Gibt Echtzeit-Informationen zum Backend-Canister zurück.
  // Frontend-Canister-Status ist nicht verfügbar (erfordert Controller-Zugriff).
  public query ({ caller }) func getCanisterStatusInfo() : async CostTypes.CanisterStatusInfo {
    if (not costDashIsPlatformAdmin(caller)) {
      Runtime.trap("Keine Berechtigung: nur Platform Admin");
    };
    {
      backendCanisterId = backendCanisterIdState.value;
      backendCycles = ExperimentalCycles.balance();
      backendMemorySize = Prim.rts_heap_size();
      backendStatus = "running";
      frontendCanisterId = frontendCanisterIdState.value;
      dataSource = "live";
      timestamp = Time.now();
    };
  };

  // h) Mandanten-Kostenaufschlüsselung (proportional nach Mitarbeiteranzahl)
  public query ({ caller }) func getTenantCostBreakdown() : async [CostTypes.TenantCostEntry] {
    if (not costDashIsPlatformAdmin(caller)) {
      Runtime.trap("Keine Berechtigung: nur Platform Admin");
    };
    // Gesamtverbrauch aus letzten beiden Snapshots berechnen
    let snapshotCount : Nat = cycleSnapshots.size();
    let totalCycles : Nat = if (snapshotCount >= 2) {
      let latest = cycleSnapshots.at(snapshotCount - 1 : Nat);
      let prev = cycleSnapshots.at(snapshotCount - 2 : Nat);
      let frontendDiff : Nat = if (latest.frontendCycles >= prev.frontendCycles) {
        latest.frontendCycles - prev.frontendCycles
      } else { 0 };
      let backendDiff : Nat = if (latest.backendCycles >= prev.backendCycles) {
        latest.backendCycles - prev.backendCycles
      } else { 0 };
      frontendDiff + backendDiff
    } else {
      // Einzelner Snapshot: Gesamtstand verwenden
      switch (cycleSnapshots.last()) {
        case (?s) { s.frontendCycles + s.backendCycles };
        case null { 0 };
      }
    };

    // Gesamtanzahl aktiver Mitarbeiter über alle Firmen ermitteln
    let totalEmployees : Nat = employees.filter(func(e : CompanyTypes.Employee) : Bool {
      e.active
    }).size();

    // Proportionale Verteilung pro Mandant
    let result = companies.map<CompanyTypes.Company, CostTypes.TenantCostEntry>(
      func(c) {
        let empCount = employees.filter(func(e : CompanyTypes.Employee) : Bool {
          e.companyId == c.id and e.active
        }).size();
        let estimated : Nat = if (totalEmployees > 0 and totalCycles > 0) {
          (totalCycles * empCount) / totalEmployees
        } else { 0 };
        {
          companyId = c.id;
          companyName = c.name;
          estimatedCycles = estimated;
          employeeCount = empCount;
        };
      }
    );
    result.toArray();
  };
};
