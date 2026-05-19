// Abonnement-Konfiguration API – Platform Admin only
// iReport Onchain V3.1
import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Float "mo:core/Float";
import Int "mo:core/Int";

import CommonTypes "../types/common";
import CostDashboardTypes "../types/cost-dashboard";
import CompanyTypes "../types/company";
import TrackingTypes "../types/timetracking";
import Nat "mo:core/Nat";
import Order "mo:core/Order";

mixin (
  platformAdminPrincipal : { var value : ?Principal },
  subscriptionPlans : Map.Map<Text, CostDashboardTypes.SubscriptionPlan>,
  subscriptionPlansInitialized : { var value : Bool },
  companySubscriptions : Map.Map<Text, Text>,
  companySubscriptionDetails : Map.Map<Text, CostDashboardTypes.CompanySubscription>,
  companies : List.List<CompanyTypes.Company>,
  employees : List.List<CompanyTypes.Employee>,
  timeEntries : List.List<TrackingTypes.TimeEntry>,
  principalToCompany : Map.Map<Principal, CommonTypes.CompanyId>,
) {
  // Hilfsfunktion: gibt die CompanyId des Platform Admins zurück
  private func platformAdminCompanyId() : ?CommonTypes.CompanyId {
    switch (platformAdminPrincipal.value) {
      case null { null };
      case (?pa) { principalToCompany.get(pa) };
    };
  };

  // Hilfsfunktion: prüft ob eine Firma die Platform-Admin-Firma ist
  private func isPlatformAdminCompany(companyId : CommonTypes.CompanyId) : Bool {
    switch (platformAdminCompanyId()) {
      case null { false };
      case (?paCompId) { paCompId == companyId };
    };
  };

  // Hilfsfunktion: prüft ob der Caller Platform Admin ist
  private func checkIsSubscriptionPlatformAdmin(caller : Principal) : Bool {
    switch (platformAdminPrincipal.value) {
      case (?p) { Principal.equal(p, caller) };
      case null { false };
    };
  };

  // Standard-Pläne
  private func defaultPlansBasis() : CostDashboardTypes.SubscriptionPlan {
    {
      id = "basis";
      name = "Basis";
      description = "Für kleine Teams";
      pricePerMonthCHF = 0.0;
      pricePerYearCHF = 0.0;
      minActiveDaysPerMonth = 1;
      maxEmployees = ?2;
      features = [
        "Zeiterfassung",
        "Kalenderübersicht",
        "Spesenmanagement",
        "Bis 2 Mitarbeitende",
        "Internet Identity Login",
      ];
      isActive = true;
      sortOrder = 0;
      updatedAt = 0;
      stripeProductId  = null;
      stripePriceId    = null;
      stripePriceIdYearly = null;
      stripeLookupKey  = null;
      paymentProvider  = #none;
      requiresPayment  = false;
      stripeMode       = null;
    };
  };

  private func defaultPlansProfessional() : CostDashboardTypes.SubscriptionPlan {
    {
      id = "professional";
      name = "Professional";
      description = "Für wachsende Unternehmen";
      pricePerMonthCHF = 7.0;
      pricePerYearCHF = 6.0;
      minActiveDaysPerMonth = 1;
      maxEmployees = ?999;
      features = [
        "Zeiterfassung",
        "Kalenderübersicht",
        "Spesenmanagement",
        "Unbegrenzte Mitarbeitende",
        "Genehmigungsworkflows",
        "Fakturierungsübersicht",
        "Auswertungen & Reports",
        "Prioritäts-Support",
      ];
      isActive = true;
      sortOrder = 1;
      updatedAt = 0;
      stripeProductId  = null;
      stripePriceId    = null;
      stripePriceIdYearly = null;
      stripeLookupKey  = null;
      paymentProvider  = #stripe;
      requiresPayment  = true;
      stripeMode       = null;
    };
  };

  // Initialisiert Standard-Abonnement-Pläne (nur wenn noch keine vorhanden).
  private func initDefaultPlansIfNeeded() {
    if (subscriptionPlansInitialized.value) return;
    subscriptionPlansInitialized.value := true;
    let now = Time.now();
    let basis = defaultPlansBasis();
    let professional = defaultPlansProfessional();
    subscriptionPlans.add("basis", { basis with updatedAt = now });
    subscriptionPlans.add("professional", { professional with updatedAt = now });
  };

  // Recovery: stellt fehlende Default-Pläne wieder her (unabhängig von subscriptionPlansInitialized)
  // Wird bei jedem Schreibzugriff aufgerufen, um inkonsistente Zustände zu beheben.
  private func ensureDefaultPlansPresent() {
    initDefaultPlansIfNeeded();
    // Recovery: Falls 'basis' fehlt (z.B. nach versehentlichem Löschen), wiederherstellen
    if (not subscriptionPlans.containsKey("basis")) {
      let now = Time.now();
      let basis = defaultPlansBasis();
      subscriptionPlans.add("basis", { basis with updatedAt = now });
    };
    if (not subscriptionPlans.containsKey("professional")) {
      let now = Time.now();
      let professional = defaultPlansProfessional();
      subscriptionPlans.add("professional", { professional with updatedAt = now });
    };
  };

  // Recovery: Mandanten mit ungültiger Plan-ID auf 'basis' zurücksetzen (read-access helper)
  // Gibt "" zurück wenn kein Plan zugewiesen (Sentinel "none" oder nicht vorhanden bei Platform-Admin-Firma)
  // Gibt "basis" als Fallback zurück wenn Plan-ID nicht mehr in der Map vorhanden ist.
  private func getValidPlanId(companyIdStr : Text) : Text {
    switch (companySubscriptions.get(companyIdStr)) {
      case null { "basis" };   // Nicht-registrierte / neue Firma: Basis-Fallback
      case (?"") { "" };       // Leerer Sentinel (alte Daten ohne Sentinel)
      case (?"none") { "" };   // Explizit kein Plan
      case (?pid) {
        if (subscriptionPlans.containsKey(pid)) {
          pid
        } else {
          // Plan existiert nicht mehr: Fallback auf "basis"
          "basis"
        };
      };
    };
  };

  // Sortier-Hilfsfunktion für Pläne
  private func sortPlans(plans : [CostDashboardTypes.SubscriptionPlan]) : [CostDashboardTypes.SubscriptionPlan] {
    plans.sort(func(a, b) {
      if (a.sortOrder < b.sortOrder) { #less }
      else if (a.sortOrder > b.sortOrder) { #greater }
      else { #equal };
    });
  };

  // Hilfsfunktion: Plan nach ID laden (mit Fallback auf Basis)
  private func getPlanById(planId : Text) : CostDashboardTypes.SubscriptionPlan {
    switch (subscriptionPlans.get(planId)) {
      case (?p) { p };
      case null {
        if (planId == "professional") { defaultPlansProfessional() }
        else { defaultPlansBasis() };
      };
    };
  };

  // Gibt alle aktiven Abonnement-Pläne zurück (öffentlich)
  public query func getSubscriptionPlans() : async [CostDashboardTypes.SubscriptionPlan] {
    if (subscriptionPlans.isEmpty()) {
      sortPlans([defaultPlansBasis(), defaultPlansProfessional()]
        .filter(func(p : CostDashboardTypes.SubscriptionPlan) : Bool { p.isActive }));
    } else {
      sortPlans(subscriptionPlans.values().toArray()
        .filter(func(p : CostDashboardTypes.SubscriptionPlan) : Bool { p.isActive }));
    };
  };

  // Gibt alle Abonnement-Pläne zurück (inkl. inaktive – nur Platform Admin)
  public query ({ caller }) func getAllSubscriptionPlans() : async [CostDashboardTypes.SubscriptionPlan] {
    if (not checkIsSubscriptionPlatformAdmin(caller)) {
      Runtime.trap("Keine Berechtigung: nur Platform Admin");
    };
    if (subscriptionPlans.isEmpty()) {
      sortPlans([defaultPlansBasis(), defaultPlansProfessional()]);
    } else {
      sortPlans(subscriptionPlans.values().toArray());
    };
  };

  // Erstellt oder aktualisiert einen Abonnement-Plan (nur Platform Admin)
  public shared ({ caller }) func upsertSubscriptionPlan(
    plan : CostDashboardTypes.SubscriptionPlan
  ) : async CommonTypes.Result<CostDashboardTypes.SubscriptionPlan> {
    if (not checkIsSubscriptionPlatformAdmin(caller)) {
      return #err("Keine Berechtigung: nur Platform Admin");
    };
    if (plan.id.size() == 0) {
      return #err("Plan-ID darf nicht leer sein");
    };
    // Sentinel-Wert 0 verbieten: 0 hat keine Bedeutung, 999 = unbegrenzt
    switch (plan.maxEmployees) {
      case (?0) { return #err("Max. aktive Mitarbeitende darf nicht 0 sein") };
      case (_) {};
    };
    // Stelle sicher, dass Default-Pläne vorhanden sind (aber immer Recovery prüfen)
    ensureDefaultPlansPresent();
    let updated : CostDashboardTypes.SubscriptionPlan = { plan with updatedAt = Time.now() };
    // Verwende add (upsert): ersetzt existierende Einträge zuverlässig
    subscriptionPlans.add(plan.id, updated);
    #ok(updated);
  };

  // Löscht einen Abonnement-Plan (nur Platform Admin)
  public shared ({ caller }) func deleteSubscriptionPlan(
    id : Text
  ) : async CommonTypes.Result<()> {
    if (not checkIsSubscriptionPlatformAdmin(caller)) {
      return #err("Keine Berechtigung: nur Platform Admin");
    };
    ensureDefaultPlansPresent();
    if (not subscriptionPlans.containsKey(id)) {
      return #err("Abonnement-Plan nicht gefunden");
    };
    subscriptionPlans.remove(id);
    #ok(());
  };

  // Wiederherstellung der Default-Pläne falls sie fehlen (z.B. nach Datenverlust bei Plan-Bearbeitung)
  // Öffentlich zugänglich für Platform Admin – erlaubt Recovery aus korruptem Zustand.
  public shared ({ caller }) func restoreDefaultPlansIfMissing() : async CommonTypes.Result<Text> {
    if (not checkIsSubscriptionPlatformAdmin(caller)) {
      return #err("Keine Berechtigung: nur Platform Admin");
    };
    var restored : Nat = 0;
    let now = Time.now();
    if (not subscriptionPlans.containsKey("basis")) {
      let basis = defaultPlansBasis();
      subscriptionPlans.add("basis", { basis with updatedAt = now });
      restored += 1;
    };
    if (not subscriptionPlans.containsKey("professional")) {
      let professional = defaultPlansProfessional();
      subscriptionPlans.add("professional", { professional with updatedAt = now });
      restored += 1;
    };
    // Repair orphaned companySubscriptions: entries pointing to a non-existent plan
    // are reset to "basis"
    let orphanedKeys : [Text] = companySubscriptions.entries().toArray()
      .filterMap<(Text, Text), Text>(func((cid, pid)) {
        if (not subscriptionPlans.containsKey(pid)) { ?cid } else { null }
      });
    for (cid in orphanedKeys.values()) {
      companySubscriptions.remove(cid);
      companySubscriptions.add(cid, "basis");
    };
    if (restored == 0 and orphanedKeys.size() == 0) {
      #ok("Alle Pläne vorhanden – keine Wiederherstellung nötig.")
    } else {
      #ok(
        restored.toText() # " Plan(e) wiederhergestellt, " #
        orphanedKeys.size().toText() # " verwaiste Zuweisung(en) auf 'basis' zurückgesetzt."
      )
    };
  };

  // ─── Mandanten-Abo-Zuweisung ──────────────────────────────────────────────────

  // Weist einem Mandanten einen Abonnement-Plan zu (nur Platform Admin)
  public shared ({ caller }) func assignSubscriptionPlan(
    companyId : Text,
    planId    : Text,
  ) : async CommonTypes.Result<()> {
    if (not checkIsSubscriptionPlatformAdmin(caller)) {
      return #err("Keine Berechtigung: nur Platform Admin");
    };
    ensureDefaultPlansPresent();
    // Schutz: Platform-Admin-Firma bekommt keinen Plan
    let companyIdNat : CommonTypes.CompanyId = switch (Nat.fromText(companyId)) {
      case null { return #err("Ungültige Firmen-ID") };
      case (?n) n;
    };
    if (isPlatformAdminCompany(companyIdNat)) {
      return #err("Die Platform-Admin-Firma kann keinem Abonnement-Plan zugewiesen werden.");
    };
    // Leere planId = Kein Plan (Sentinel "none" speichern, damit zwischen nicht-zugewiesen und explizit kein Plan unterschieden wird)
    if (planId == "") {
      companySubscriptions.add(companyId, "none");
      return #ok(());
    };
    // Plan-ID validieren
    if (not subscriptionPlans.containsKey(planId)) {
      return #err("Abonnement-Plan nicht gefunden: " # planId);
    };
    companySubscriptions.add(companyId, planId);
    #ok(());
  };

  // Gibt den zugewiesenen SubscriptionPlan für einen Mandanten zurück (?SubscriptionPlan; null = kein Plan)
  // Die Platform-Admin-Firma gibt immer null zurück (kein Plan).
  public query ({ caller }) func getCompanySubscriptionPlan(
    companyId : Nat
  ) : async ?CostDashboardTypes.SubscriptionPlan {
    if (isPlatformAdminCompany(companyId)) { return null };
    switch (companySubscriptions.get(companyId.toText())) {
      case null { null };
      case (?pid) {
        // Data integrity: if assigned plan no longer exists, return basis as fallback
        switch (subscriptionPlans.get(pid)) {
          case (?p) { ?p };
          case null {
            switch (subscriptionPlans.get("basis")) {
              case (?p) { ?p };
              case null { ?defaultPlansBasis() };
            };
          };
        };
      };
    };
  };

  // ─── Billing Model ────────────────────────────────────────────────────────────

  // Nanosekunden pro Monat (approximiert 30 Tage)
  let nanosecondsPerMonth : Int = 30 * 24 * 60 * 60 * 1_000_000_000;
  // Nanosekunden pro Jahr
  let nanosecondsPerYear : Int = 365 * 24 * 60 * 60 * 1_000_000_000;

  // Hilfsfunktion: Letzter Tag des Monats in Nanosekunden (grob)
  private func endOfMonthNs(year : Nat, month : Nat) : Int {
    // Berechne den ersten Tag des nächsten Monats minus 1 Nanosekunde
    let nextMonth = if (month == 12) { 1 } else { month + 1 };
    let nextYear  = if (month == 12) { year + 1 } else { year };
    // Grobe Berechnung: Tage seit 2020-01-01 als Referenz (ausreichend für Fälligkeitsanzeige)
    let daysInMonth : Nat = switch (month) {
      case (1)  { 31 };
      case (2)  { if (year % 4 == 0 and (year % 100 != 0 or year % 400 == 0)) 29 else 28 };
      case (3)  { 31 };
      case (4)  { 30 };
      case (5)  { 31 };
      case (6)  { 30 };
      case (7)  { 31 };
      case (8)  { 31 };
      case (9)  { 30 };
      case (10) { 31 };
      case (11) { 30 };
      case (12) { 31 };
      case (_)  { 30 };
    };
    // Ungefähre Nanosekunden seit Epoche für das Monatsende
    // Nutze Time.now() als Basis + Offset (Näherung)
    let _ = (nextMonth, nextYear); // suppress unused warning
    let yearsSince1970 : Int = year.toInt() - 1970;
    let monthOffset : Int = month.toInt() - 1;
    let approxDaysSinceEpoch : Int = yearsSince1970 * 365 + yearsSince1970 / 4 + monthOffset * 30 + daysInMonth.toInt();
    approxDaysSinceEpoch * 24 * 60 * 60 * 1_000_000_000;
  };

  // Abrechnungsmodell für einen Mandanten setzen (nur Platform Admin)
  public shared ({ caller }) func setCompanyBillingModel(
    companyId    : Nat,
    billingModel : CostDashboardTypes.BillingModel,
  ) : async CommonTypes.Result<()> {
    if (not checkIsSubscriptionPlatformAdmin(caller)) {
      return #err("Keine Berechtigung: nur Platform Admin");
    };
    if (isPlatformAdminCompany(companyId)) {
      return #err("Die Platform-Admin-Firma hat kein Abrechnungsmodell.");
    };
    let key = companyId.toText();
    let planId = switch (companySubscriptions.get(key)) {
      case (?pid) pid;
      case null   "basis";
    };
    let now = Time.now();
    let existingStart : ?Int = switch (companySubscriptionDetails.get(key)) {
      case (?det) det.subscriptionStartDate;
      case null   null;
    };
    let startDate : ?Int = switch (existingStart) {
      case (?s) { ?s };
      case null { ?now };
    };
    // Remove before add to ensure replacement of existing entry
    let existingDet2 = companySubscriptionDetails.get(key);
    companySubscriptionDetails.remove(key);
    companySubscriptionDetails.add(key, {
      companyId             = companyId;
      planId;
      billingModel;
      subscriptionStartDate = startDate;
      proRataAmount         = switch (existingDet2) { case (?d) d.proRataAmount; case null null };
      proRataNote           = switch (existingDet2) { case (?d) d.proRataNote; case null null };
      proRataCalculatedAt   = switch (existingDet2) { case (?d) d.proRataCalculatedAt; case null null };
      nextDueDate           = null;
      stripeCustomerId             = switch (existingDet2) { case (?d) d.stripeCustomerId; case null null };
      stripeSubscriptionId         = switch (existingDet2) { case (?d) d.stripeSubscriptionId; case null null };
      stripeProductId              = switch (existingDet2) { case (?d) d.stripeProductId; case null null };
      stripeStatus                 = switch (existingDet2) { case (?d) d.stripeStatus; case null null };
      stripeCurrentPeriodStart     = switch (existingDet2) { case (?d) d.stripeCurrentPeriodStart; case null null };
      stripeCurrentPeriodEnd       = switch (existingDet2) { case (?d) d.stripeCurrentPeriodEnd; case null null };
      stripeCancelAtPeriodEnd      = switch (existingDet2) { case (?d) d.stripeCancelAtPeriodEnd; case null false };
      latestStripeInvoiceId        = switch (existingDet2) { case (?d) d.latestStripeInvoiceId; case null null };
      latestStripePaymentStatus    = switch (existingDet2) { case (?d) d.latestStripePaymentStatus; case null null };
      lastStripeSyncAt             = switch (existingDet2) { case (?d) d.lastStripeSyncAt; case null null };
      scheduledPlanChangeId        = null;
      scheduledPlanChangePriceId   = null;
      scheduledPlanChangeEffectiveAt = null;
    });
    #ok(());
  };

  // Abrechnungsmodell und Fälligkeitsdatum für einen Mandanten abrufen
  public query ({ caller }) func getCompanyBillingModel(
    companyId : Nat
  ) : async CommonTypes.Result<{
    billingModel          : CostDashboardTypes.BillingModel;
    subscriptionStartDate : ?Int;
    nextDueDate           : ?Int;
  }> {
    if (not checkIsSubscriptionPlatformAdmin(caller)) {
      return #err("Keine Berechtigung: nur Platform Admin");
    };
    let key = companyId.toText();
    let det = switch (companySubscriptionDetails.get(key)) {
      case (?d) d;
      case null {
        // Default: monatlich, kein Startdatum
        return #ok({ billingModel = #monthly; subscriptionStartDate = null; nextDueDate = null });
      };
    };
    let now = Time.now();
    let nextDue : ?Int = switch (det.billingModel) {
      case (#monthly) {
        // Ende des aktuellen Monats
        // Grob: +30 Tage ab heute
        ?(now + nanosecondsPerMonth);
      };
      case (#yearly) {
        switch (det.subscriptionStartDate) {
          case (?start) { ?(start + nanosecondsPerYear) };
          case null     { ?(now + nanosecondsPerYear) };
        };
      };
    };
    #ok({
      billingModel          = det.billingModel;
      subscriptionStartDate = det.subscriptionStartDate;
      nextDueDate           = nextDue;
    });
  };

  // ─── Pro-Rata-Berechnung für Jahres-Abos ─────────────────────────────────────

  // Berechnet den Pro-Rata-Betrag bei einem Planwechsel (nur für Jahres-Abos)
  public query ({ caller }) func calculateProRataAdjustment(
    companyId : Nat,
    newPlanId : Text,
  ) : async CommonTypes.Result<{
    proRataAmount  : Float;
    isUpgrade      : Bool;
    remainingDays  : Nat;
    note           : Text;
  }> {
    if (not checkIsSubscriptionPlatformAdmin(caller)) {
      return #err("Keine Berechtigung: nur Platform Admin");
    };
    let key = companyId.toText();
    let det = switch (companySubscriptionDetails.get(key)) {
      case (?d) d;
      case null { return #err("Kein Abrechnungsmodell für diesen Mandanten gefunden.") };
    };
    if (det.billingModel != #yearly) {
      return #err("Pro-Rata-Berechnung nur für Jahres-Abos.");
    };
    let startDate : Int = switch (det.subscriptionStartDate) {
      case (?s) s;
      case null { return #err("Kein Abo-Startdatum vorhanden.") };
    };
    let now = Time.now();
    let endDate = startDate + nanosecondsPerYear;
    let remainingNs : Int = endDate - now;
    let remainingDaysInt : Int = remainingNs / (24 * 60 * 60 * 1_000_000_000);
    let remainingDays : Nat = if (remainingDaysInt > 0) {
      Int.abs(remainingDaysInt);
    } else { 0 };

    // Aktuelle und neue Jahrespreise per User
    let currentPlan = getPlanById(det.planId);
    let newPlan = getPlanById(newPlanId);
    let oldYearlyPerUser = currentPlan.pricePerYearCHF;
    let newYearlyPerUser = newPlan.pricePerYearCHF;

    // Abrechenbare Mitarbeiter
    let billableCount : Nat = employees.filter(func(e : CompanyTypes.Employee) : Bool {
      e.companyId == companyId and e.active
    }).size();

    let isUpgrade = newYearlyPerUser > oldYearlyPerUser;
    let diffPerUser = if (isUpgrade) {
      newYearlyPerUser - oldYearlyPerUser
    } else {
      oldYearlyPerUser - newYearlyPerUser
    };
    let raw = diffPerUser * billableCount.toFloat() * remainingDays.toFloat() / 365.0;
    // Auf 2 Dezimalstellen runden
    let proRataAmount = Float.nearest(raw * 100.0) / 100.0;
    let note = if (isUpgrade) {
      "Nachzahlung für verbleibende Laufzeit"
    } else {
      "Guthaben für verbleibende Laufzeit"
    };
    #ok({ proRataAmount; isUpgrade; remainingDays; note });
  };

  // ─── Planwechsel-Prüfung ──────────────────────────────────────────────────────

  // Wendet einen bestätigten Planwechsel an (wird NACH Benutzerbestätigung im Frontend aufgerufen).
  // Speichert den neuen Plan, das Abrechnungsmodell und berechnet den Pro-rata-Betrag für Jahres-Abos.
  // Zugänglich für Admin/Manager des Mandanten sowie Platform Admin.
  public shared ({ caller }) func applyPlanChange(
    companyId    : Nat,
    newPlanId    : Text,
    billingModel : CostDashboardTypes.BillingModel,
  ) : async CommonTypes.Result<Text> {
    // Zugriffscheck: Platform Admin ODER Mitarbeiter derselben Firma
    let isPlatformAdmin = checkIsSubscriptionPlatformAdmin(caller);
    let isAuthorized : Bool = if (isPlatformAdmin) { true } else {
      switch (principalToCompany.get(caller)) {
        case null { false };
        case (?cid) { cid == companyId };
      }
    };
    if (not isAuthorized) {
      return #err("Keine Berechtigung");
    };
    if (isPlatformAdminCompany(companyId)) {
      return #err("Die Platform-Admin-Firma hat kein Abonnement.");
    };
    ensureDefaultPlansPresent();
    if (newPlanId != "" and not subscriptionPlans.containsKey(newPlanId)) {
      return #err("Abonnement-Plan nicht gefunden: " # newPlanId);
    };
    let key = companyId.toText();
    let now = Time.now();

    // Berechne Pro-rata-Betrag falls Jahres-Abo und Plan wechselt
    let oldPlanId = getValidPlanId(key);
    let detOpt = companySubscriptionDetails.get(key);
    var proRataAmountVal : ?Float = null;
    var proRataNoteVal   : ?Text  = null;

    // REQ-2: Skip pro-rata entirely when old plan is free (CHF 0.00 → paid)
    let oldPlanForCheck = getPlanById(oldPlanId);
    let oldPlanIsFree = oldPlanId == "" or (oldPlanForCheck.pricePerMonthCHF == 0.0 and oldPlanForCheck.pricePerYearCHF == 0.0);

    if (not oldPlanIsFree and billingModel == #yearly and oldPlanId != "" and oldPlanId != newPlanId and newPlanId != "") {
      let startDateNs : Int = switch (detOpt) {
        case (?d) { switch (d.subscriptionStartDate) { case (?s) s; case null now } };
        case null now;
      };
      let endDateNs = startDateNs + nanosecondsPerYear;
      let remainingNs : Int = endDateNs - now;
      let remainingDays : Int = remainingNs / (24 * 60 * 60 * 1_000_000_000);
      if (remainingDays > 0) {
        let oldPlan = getPlanById(oldPlanId);
        let newPlan = getPlanById(newPlanId);
        let billableCount : Nat = employees.filter(func(e : CompanyTypes.Employee) : Bool {
          e.companyId == companyId and e.active
        }).size();
        let isUpgrade = newPlan.pricePerYearCHF > oldPlan.pricePerYearCHF;
        let diffPerUser = if (isUpgrade) {
          newPlan.pricePerYearCHF - oldPlan.pricePerYearCHF
        } else {
          oldPlan.pricePerYearCHF - newPlan.pricePerYearCHF
        };
        let raw = diffPerUser * billableCount.toFloat() * remainingDays.toFloat() / 365.0;
        let proRata = Float.nearest(raw * 100.0) / 100.0;
        let signedProRata = if (isUpgrade) proRata else -proRata;
        proRataAmountVal := ?signedProRata;
        proRataNoteVal := if (isUpgrade) {
          ?("Nachzahlung Upgrade von " # oldPlan.name # " auf " # newPlan.name)
        } else {
          ?("Guthaben Downgrade von " # oldPlan.name # " auf " # newPlan.name)
        };
      };
    };

    // Fälligkeitsdatum berechnen (basierend auf Abo-Startdatum, nicht auf now)
    let existingStart : ?Int = switch (detOpt) {
      case (?d) d.subscriptionStartDate;
      case null null;
    };
    let newStartDate : ?Int = switch (existingStart) {
      case (?s) { ?s };
      case null { ?now };
    };
    let nextDue : ?Int = switch (billingModel) {
      case (#monthly) { ?(now + nanosecondsPerMonth) };
      case (#yearly) {
        switch (newStartDate) {
          case (?s) { ?(s + nanosecondsPerYear) };
          case null { ?(now + nanosecondsPerYear) };
        };
      };
    };

    // Neuen Plan und Modell persistieren
    let resolvedPlanId = if (newPlanId == "") oldPlanId else newPlanId;
    companySubscriptions.add(key, resolvedPlanId);
    companySubscriptionDetails.remove(key);
    companySubscriptionDetails.add(key, {
      companyId;
      planId                = resolvedPlanId;
      billingModel;
      subscriptionStartDate = newStartDate;
      proRataAmount         = proRataAmountVal;
      proRataNote           = proRataNoteVal;
      proRataCalculatedAt   = switch (proRataAmountVal) { case (?_) ?now; case null null };
      nextDueDate           = nextDue;
      stripeCustomerId             = switch (detOpt) { case (?d) d.stripeCustomerId; case null null };
      stripeSubscriptionId         = switch (detOpt) { case (?d) d.stripeSubscriptionId; case null null };
      stripeProductId              = switch (detOpt) { case (?d) d.stripeProductId; case null null };
      stripeStatus                 = switch (detOpt) { case (?d) d.stripeStatus; case null null };
      stripeCurrentPeriodStart     = switch (detOpt) { case (?d) d.stripeCurrentPeriodStart; case null null };
      stripeCurrentPeriodEnd       = switch (detOpt) { case (?d) d.stripeCurrentPeriodEnd; case null null };
      stripeCancelAtPeriodEnd      = switch (detOpt) { case (?d) d.stripeCancelAtPeriodEnd; case null false };
      latestStripeInvoiceId        = switch (detOpt) { case (?d) d.latestStripeInvoiceId; case null null };
      latestStripePaymentStatus    = switch (detOpt) { case (?d) d.latestStripePaymentStatus; case null null };
      lastStripeSyncAt             = switch (detOpt) { case (?d) d.lastStripeSyncAt; case null null };
      scheduledPlanChangeId        = null;
      scheduledPlanChangePriceId   = null;
      scheduledPlanChangeEffectiveAt = null;
    });
    #ok("Planwechsel erfolgreich angewendet.");
  };

  // Prüft ob ein Planwechsel erforderlich ist (read-only)
  // Zugänglich für Platform Admin UND Company Admins/Manager (für ihren eigenen Mandanten)
  public query ({ caller }) func checkPlanChangeNeeded(
    companyId : Nat
  ) : async CommonTypes.Result<{
    changeNeeded      : Bool;
    currentPlanId     : ?Text;
    suggestedPlanId   : ?Text;
    currentPlanName   : Text;
    suggestedPlanName : Text;
    activeUserCount   : Nat;
    estimatedMonthlyCost : Float;
  }> {
    // Zugriffscheck: Platform Admin ODER Mitarbeiter derselben Firma
    let isPlatformAdmin = checkIsSubscriptionPlatformAdmin(caller);
    let isAuthorized : Bool = if (isPlatformAdmin) { true } else {
      switch (principalToCompany.get(caller)) {
        case null { false };
        case (?cid) { cid == companyId };
      }
    };
    if (not isAuthorized) {
      return #err("Keine Berechtigung");
    };
    if (isPlatformAdminCompany(companyId)) {
      return #ok({
        changeNeeded      = false;
        currentPlanId     = null;
        suggestedPlanId   = null;
        currentPlanName   = "Kein Plan";
        suggestedPlanName = "Kein Plan";
        activeUserCount   = 0;
        estimatedMonthlyCost = 0.0;
      });
    };
    // initDefaultPlansIfNeeded() cannot be called from query context — skipped
    let activeCount : Nat = employees.filter(func(e : CompanyTypes.Employee) : Bool {
      e.companyId == companyId and e.active
    }).size();
    let validPlanId = getValidPlanId(companyId.toText());
    let currentPlan = if (validPlanId == "") {
      defaultPlansBasis()
    } else {
      getPlanById(validPlanId)
    };
    // Plan-Auswahllogik (dieselbe wie autoAssignPlanForCompany, aber read-only)
    let activePlans = subscriptionPlans.values().toArray()
      .filter(func(p : CostDashboardTypes.SubscriptionPlan) : Bool { p.isActive })
      .sort(func(a : CostDashboardTypes.SubscriptionPlan, b : CostDashboardTypes.SubscriptionPlan) : Order.Order {
        switch (a.maxEmployees, b.maxEmployees) {
          case (null, null) {
            if (a.pricePerMonthCHF < b.pricePerMonthCHF) #less
            else if (a.pricePerMonthCHF > b.pricePerMonthCHF) #greater
            else #equal
          };
          case (null, ?_) { #greater };
          case (?_, null) { #less };
          case (?am, ?bm) {
            if (am < bm) #less else if (am > bm) #greater else #equal
          };
        }
      });
    let suggestedPlanOpt = activePlans.find(
      func(p : CostDashboardTypes.SubscriptionPlan) : Bool {
        switch (p.maxEmployees) {
          case null { true };
          case (?max) { max >= activeCount };
        }
      }
    );
    let suggestedPlan = switch (suggestedPlanOpt) {
      case (?p) p;
      case null { currentPlan }; // Kein passender Plan → aktuell beibehalten
    };
    let changeNeeded = currentPlan.id != suggestedPlan.id;
    let estimatedMonthlyCost = suggestedPlan.pricePerMonthCHF * activeCount.toFloat();
    #ok({
      changeNeeded;
      currentPlanId     = ?currentPlan.id;
      suggestedPlanId   = ?suggestedPlan.id;
      currentPlanName   = currentPlan.name;
      suggestedPlanName = suggestedPlan.name;
      activeUserCount   = activeCount;
      estimatedMonthlyCost;
    });
  };

  // Intern: besten Plan für eine Firma automatisch ermitteln und zuweisen.
  // Wird beim Registrieren und bei setEmployeeActive aufgerufen.
  // Gibt die zugewiesene planId zurück (oder null falls Platform-Admin-Firma).
  private func autoAssignPlanForCompany(companyId : CommonTypes.CompanyId) : ?Text {
    // Platform-Admin-Firma bekommt keinen Plan
    if (isPlatformAdminCompany(companyId)) { return null };
    initDefaultPlansIfNeeded();
    // Aktive Mitarbeiter zaehlen (real-time: active == true)
    let activeCount : Nat = employees.filter(func(e : CompanyTypes.Employee) : Bool {
      e.companyId == companyId and e.active
    }).size();
    // Alle aktiven Plaene nach maxEmployees aufsteigend sortieren
    let activePlans : [CostDashboardTypes.SubscriptionPlan] = subscriptionPlans.values().toArray()
      .filter(func(p : CostDashboardTypes.SubscriptionPlan) : Bool { p.isActive })
      .sort(func(a : CostDashboardTypes.SubscriptionPlan, b : CostDashboardTypes.SubscriptionPlan) : Order.Order {
        switch (a.maxEmployees, b.maxEmployees) {
          case (null, null) {
            if (a.pricePerMonthCHF < b.pricePerMonthCHF) #less
            else if (a.pricePerMonthCHF > b.pricePerMonthCHF) #greater
            else #equal
          };
          case (null, ?_) { #greater };
          case (?_, null) { #less };
          case (?am, ?bm) {
            if (am < bm) #less else if (am > bm) #greater else #equal
          };
        }
      });
    // Plan mit kleinstem Limit waehlen, das activeCount noch abdeckt
    let bestPlan : ?CostDashboardTypes.SubscriptionPlan = activePlans.find(
      func(p : CostDashboardTypes.SubscriptionPlan) : Bool {
        switch (p.maxEmployees) {
          case null { true };
          case (?max) { max >= activeCount };
        }
      }
    );
    let planId : Text = switch (bestPlan) {
      case (?p) { p.id };
      case null {
        // Fallback: Plan namens "Basis" oder erster aktiver Plan
        let fallback = activePlans.find(func(p : CostDashboardTypes.SubscriptionPlan) : Bool {
          p.name == "Basis" or p.id == "basis"
        });
        switch (fallback) {
          case (?p) { p.id };
          case null {
            if (activePlans.size() > 0) { activePlans[0].id } else { "basis" };
          };
        };
      };
    };
    // Verwende add (upsert): ersetzt bestehende Einträge zuverlässig
    companySubscriptions.add(companyId.toText(), planId);
    // Startdatum nur setzen wenn noch kein Eintrag vorhanden
    let key = companyId.toText();
    let now = Time.now();
    let existingDet = companySubscriptionDetails.get(key);
    let billingModel : CostDashboardTypes.BillingModel = switch (existingDet) {
      case (?d) d.billingModel;
      case null #monthly;
    };
    let startDate : ?Int = switch (existingDet) {
      case (?d) d.subscriptionStartDate;
      case null { ?now };
    };
    companySubscriptionDetails.add(key, {
      companyId;
      planId;
      billingModel;
      subscriptionStartDate = startDate;
      proRataAmount         = null;
      proRataNote           = null;
      proRataCalculatedAt   = null;
      nextDueDate           = null;
      stripeCustomerId             = null;
      stripeSubscriptionId         = null;
      stripeProductId              = null;
      stripeStatus                 = null;
      stripeCurrentPeriodStart     = null;
      stripeCurrentPeriodEnd       = null;
      stripeCancelAtPeriodEnd      = false;
      latestStripeInvoiceId        = null;
      latestStripePaymentStatus    = null;
      lastStripeSyncAt             = null;
      scheduledPlanChangeId        = null;
      scheduledPlanChangePriceId   = null;
      scheduledPlanChangeEffectiveAt = null;
    });
    ?planId;
  };

  // Öffentliche Recovery-Funktion: stellt fehlende Default-Pläne wieder her und behebt inkonsistente Mandanten-Zuweisungen
  // Nur für Platform Admin aufrufbar
  public shared ({ caller }) func recoverSubscriptionPlans() : async CommonTypes.Result<Text> {
    if (not checkIsSubscriptionPlatformAdmin(caller)) {
      return #err("Keine Berechtigung: nur Platform Admin");
    };
    ensureDefaultPlansPresent();
    // Alle Mandanten-Zuweisungen prüfen und ggf. auf "basis" zurücksetzen
    var fixed = 0;
    for ((companyIdStr, planId) in companySubscriptions.entries()) {
      if (planId != "none" and planId != "" and not subscriptionPlans.containsKey(planId)) {
        companySubscriptions.add(companyIdStr, "basis");
        fixed += 1;
      };
    };
    let msg = "Recovery abgeschlossen. " # fixed.toText() # " Zuweisung(en) korrigiert. Default-Pläne sichergestellt.";
    #ok(msg);
  };

  // Gibt den zugewiesenen Plan-ID für einen Mandanten zurück (nur Platform Admin)
  public query ({ caller }) func getCompanySubscription(
    companyId : Text
  ) : async ?Text {
    if (not checkIsSubscriptionPlatformAdmin(caller)) {
      Runtime.trap("Keine Berechtigung: nur Platform Admin");
    };
    companySubscriptions.get(companyId);
  };

  // Gibt alle Mandanten-Plan-Zuweisungen zurück (nur Platform Admin)
  public query ({ caller }) func getAllCompanySubscriptions() : async [(Text, Text)] {
    if (not checkIsSubscriptionPlatformAdmin(caller)) {
      Runtime.trap("Keine Berechtigung: nur Platform Admin");
    };
    // Filtere interne Sentinels heraus: "none" erscheint als leere Zuweisung
    companySubscriptions.entries().toArray()
      .filter(func((_, pid) : (Text, Text)) : Bool { pid != "none" and pid != "" });
  };

  // ─── Hilfsfunktionen für Monatsberechnung ────────────────────────────────────

  // Erstellt einen YYYY-MM-Präfix-String für die Datums-Filterung (z.B. "2026-04")
  private func monthPrefix(year : Nat, month : Nat) : Text {
    let y = year.toText();
    let m = if (month < 10) { "0" # month.toText() } else { month.toText() };
    y # "-" # m;
  };

  // Zählt die Anzahl Tage im Monat an denen ein Mitarbeiter mindestens einen Zeiteintrag hat
  private func countActiveDaysWithEntries(
    empId   : Nat,
    yearVal : Nat,
    monthVal : Nat,
  ) : Nat {
    // Alle Einträge des Mitarbeiters im Monat sammeln und eindeutige Tage zählen
    let prefix = monthPrefix(yearVal, monthVal);
    // Nutze Set-ähnliche Deduplizierung via Map<Text, Bool>
    let daysSeen = Map.empty<Text, Bool>();
    timeEntries.forEach(func(te : TrackingTypes.TimeEntry) {
      if (te.employeeId == empId and te.date.size() >= 10) {
        // date format: "YYYY-MM-DD" – prüfe ob Monat passt
        if (te.date.size() >= 7 and te.date.startsWith(#text prefix)) {
          daysSeen.add(te.date, true);
        };
      };
    });
    daysSeen.size();
  };

  // ─── Monatliche Abrechnungsübersicht ─────────────────────────────────────────

  // Berechnet die monatliche Abrechnungsübersicht pro Mandant (nur Platform Admin)
  // year: z.B. 2026, month: 1–12
  // Alias calculateMonthlyBilling für Abwärtskompatibilität.
  public query ({ caller }) func getMonthlyBillingOverview(
    year  : Nat,
    month : Nat,
  ) : async [CostDashboardTypes.MonthlyBillingEntry] {
    if (not checkIsSubscriptionPlatformAdmin(caller)) {
      Runtime.trap("Keine Berechtigung: nur Platform Admin");
    };
    billingForMonth(year, month);
  };

  // calculateMonthlyBilling: identisch zu getMonthlyBillingOverview (Alias für Frontend)
  public query ({ caller }) func calculateMonthlyBilling(
    month : Nat,
    year  : Nat,
  ) : async [CostDashboardTypes.MonthlyBillingEntry] {
    if (not checkIsSubscriptionPlatformAdmin(caller)) {
      Runtime.trap("Keine Berechtigung: nur Platform Admin");
    };
    billingForMonth(year, month);
  };

  // Interne Berechnungslogik (query-kompatibel)
  private func billingForMonth(
    year  : Nat,
    month : Nat,
  ) : [CostDashboardTypes.MonthlyBillingEntry] {
    let monthStr = if (month < 10) { "0" # month.toText() } else { month.toText() };

    companies
      .filter(func(c : CompanyTypes.Company) : Bool {
        // Platform-Admin-Firma komplett ausblenden
        not isPlatformAdminCompany(c.id)
      })
      .map<CompanyTypes.Company, CostDashboardTypes.MonthlyBillingEntry>(func(c) {
      let companyIdStr = c.id.toText();
      // Verwende getValidPlanId: behandelt fehlende Pläne (Basis-Fallback) und kein Plan (leer)
      let planId = getValidPlanId(companyIdStr);
      // Wenn kein Plan zugewiesen: keine Kosten
      if (planId == "") {
        return {
          companyId             = c.id;
          companyName           = c.name;
          planId                = "";
          planName              = "Kein Plan";
          activeUserCount       = employees.filter(func(e : CompanyTypes.Employee) : Bool {
            e.companyId == c.id and e.active }).size();
          billableUserCount     = 0;
          totalCHF              = 0.0;
          month                 = monthStr;
          year;
          billingModel          = null;
          nextDueDateTimestamp  = null;
          proRataAmount         = null;
          proRataNote           = null;
          creditAmount          = null;
        };
      };
      let plan = getPlanById(planId);
      let minDays = plan.minActiveDaysPerMonth;

      // Abrechnungsmodell und Startdatum ermitteln
      let detOpt = companySubscriptionDetails.get(companyIdStr);
      let bm : CostDashboardTypes.BillingModel = switch (detOpt) {
        case (?d) d.billingModel;
        case null #monthly;
      };
      let startDate : ?Int = switch (detOpt) {
        case (?d) d.subscriptionStartDate;
        case null null;
      };

      // Fälligkeitsdatum berechnen
      let now = Time.now();
      let nextDue : ?Int = switch (bm) {
        case (#monthly) { ?(now + nanosecondsPerMonth) };
        case (#yearly) {
          switch (startDate) {
            case (?s) { ?(s + nanosecondsPerYear) };
            case null { ?(now + nanosecondsPerYear) };
          };
        };
      };

      // Real-time aktive Mitarbeiter
      let activeCount : Nat = employees.filter(func(e : CompanyTypes.Employee) : Bool {
        e.companyId == c.id and e.active
      }).size();

      // Abrechnungsrelevante Mitarbeiter (>= minDays Tage mit Zeiteinträgen im Monat)
      let billableCount : Nat = employees.filter(func(e : CompanyTypes.Employee) : Bool {
        if (e.companyId != c.id) return false;
        let daysWithEntries = countActiveDaysWithEntries(e.id, year, month);
        daysWithEntries >= minDays;
      }).size();

      // Preis je nach Abrechnungsmodell:
      // monthly: pricePerMonthCHF pro User pro Monat
      // yearly:  pricePerYearCHF × 12 (konfigurierter Jahrespreis pro MA, multipliziert mit 12)
      let pricePerUser : Float = switch (bm) {
        case (#monthly) plan.pricePerMonthCHF;
        case (#yearly)  plan.pricePerYearCHF * 12.0;
      };
      let totalCHF : Float = activeCount.toFloat() * pricePerUser;
      let bmText : Text = switch (bm) {
        case (#monthly) "monthly";
        case (#yearly)  "yearly";
      };
      // Pro-rata-Betrag aus gespeicherten Details auslesen
      let storedProRata : ?Float = switch (detOpt) {
        case (?d) d.proRataAmount;
        case null null;
      };
      let storedProRataNote : ?Text = switch (detOpt) {
        case (?d) d.proRataNote;
        case null null;
      };
      // Guthaben (negativer Pro-rata-Betrag) separat ausweisen
      let creditVal : ?Float = switch (storedProRata) {
        case (?amt) { if (amt < 0.0) ?(0.0 - amt) else null };
        case null null;
      };
      let chargeVal : ?Float = switch (storedProRata) {
        case (?amt) { if (amt > 0.0) ?amt else null };
        case null null;
      };
      {
        companyId             = c.id;
        companyName           = c.name;
        planId;
        planName              = plan.name;
        activeUserCount       = activeCount;
        billableUserCount     = billableCount;
        totalCHF;
        month                 = monthStr;
        year;
        billingModel          = ?bmText;
        nextDueDateTimestamp  = nextDue;
        proRataAmount         = chargeVal;
        proRataNote           = storedProRataNote;
        creditAmount          = creditVal;
      };
    }).toArray();
  };
};
